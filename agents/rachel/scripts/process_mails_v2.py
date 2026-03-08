#!/usr/bin/env python3
"""
Rachel v2 — Procesador de mails con expansión de threads y adjuntos.

Flujo por mensaje:
  1. Obtener contenido del mensaje (Gmail API)
  2. Limpiar el cuerpo (eliminar historial citado)
  3. Clasificar sobre el cuerpo limpio
  4. Generar título + descripción con Claude Haiku
  5. Registrar case_event en el backend (con body_clean)
  6. Si 201 → subir PDFs/docs adjuntos
  7. Si 409 → ya existía, saltar adjuntos
  8. Aplicar label Gmail correspondiente

El backend protege contra duplicados (409 en mail_id único).
"""
import json, urllib.request, urllib.parse, base64, re, time, sys, mimetypes
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import anthropic

WORKSPACE = '/home/legales/.openclaw/workspace-rachel'
TOKEN_FILE = f'{WORKSPACE}/gmail_token.json'
ENV_FILE   = f'{WORKSPACE}/.env'

# ── Config ────────────────────────────────────────────────────────────────────
def load_env():
    env = {}
    try:
        with open(ENV_FILE) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip()
    except FileNotFoundError:
        pass
    return env

ENV = load_env()
AGENT_KEY         = ENV.get('AGENT_KEY', '')
BACKEND_URL       = ENV.get('BACKEND_URL', 'http://localhost:8080')
ANTHROPIC_API_KEY = ENV.get('ANTHROPIC_API_KEY', '')

# Labels Gmail
LABEL_SENTENCIA    = 'Rachel/Sentencia'
LABEL_RECLAMO_PAGO = 'Rachel/Reclamo Pago'
LABEL_INTIMACION   = 'Rachel/Intimación'
LABEL_ACUERDO      = 'Rachel/Acuerdo'
LABEL_EMBARGO      = 'Rachel/Embargo'
LABEL_PERICIA      = 'Rachel/Pericia'
LABEL_OFICIO       = 'Rachel/Oficio'
LABEL_GESTION      = 'Rachel/Gestión'
LABEL_SIN_CLASIF   = 'Rachel/Sin Clasificar'

TIPO_LABELS = {
    1: LABEL_SENTENCIA,
    2: LABEL_RECLAMO_PAGO,
    3: LABEL_INTIMACION,
    4: LABEL_ACUERDO,
    5: LABEL_EMBARGO,
    6: LABEL_PERICIA,
    7: LABEL_OFICIO,
    8: LABEL_GESTION,
}

TIPOS = {
    1: 'sentencia', 2: 'reclamo_pago', 3: 'intimacion',
    4: 'acuerdo',   5: 'embargo',      6: 'pericia',
    7: 'oficio',    8: 'gestion',
}

# Extensiones de adjuntos permitidas (PDFs y documentos de oficina)
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'}

# ── Gmail ─────────────────────────────────────────────────────────────────────
def get_gmail_service():
    with open(TOKEN_FILE) as f:
        td = json.load(f)
    creds = Credentials(**{k: td[k] for k in
        ['token','refresh_token','token_uri','client_id','client_secret','scopes']})
    if creds.expired:
        creds.refresh(Request())
        td['token'] = creds.token
        with open(TOKEN_FILE, 'w') as f:
            json.dump(td, f, indent=2)
    return build('gmail', 'v1', credentials=creds)

def get_body_and_attachments(payload):
    """Extrae texto plano y metadata de adjuntos recursivamente."""
    body = ''
    attachments = []  # lista de dicts: {filename, attachment_id, mime_type}
    mime = payload.get('mimeType', '')
    data = payload.get('body', {}).get('data', '')
    att_id = payload.get('body', {}).get('attachmentId', '')
    filename = payload.get('filename', '')

    if data and not filename:
        if mime == 'text/plain':
            body += base64.urlsafe_b64decode(data).decode('utf-8', errors='replace')

    if filename and att_id:
        ext = '.' + filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        if ext in ALLOWED_EXTENSIONS:
            attachments.append({
                'filename':      filename,
                'attachment_id': att_id,
                'mime_type':     mime or mimetypes.guess_type(filename)[0] or 'application/octet-stream',
            })

    for part in payload.get('parts', []):
        b, a = get_body_and_attachments(part)
        body += b
        attachments.extend(a)
    return body, attachments

def get_message_content(service, msg_id):
    """Obtiene el contenido completo de un mensaje."""
    msg = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
    hdrs = {h['name']: h['value'] for h in msg['payload']['headers']}
    body, attachments = get_body_and_attachments(msg['payload'])
    return {
        'mail_id':       msg_id,
        'thread_id':     msg.get('threadId', ''),
        'subject':       hdrs.get('Subject', ''),
        'from':          hdrs.get('From', ''),
        'date':          hdrs.get('Date', ''),
        'internal_date': msg.get('internalDate'),
        'body':          body[:8000],   # raw completo para limpieza posterior
        'attachments':   attachments,   # solo PDFs/docs
        'label_ids':     msg.get('labelIds', []),
    }

def get_thread_message_ids(service, thread_id):
    """Devuelve todos los message IDs de un thread."""
    thread = service.users().threads().get(userId='me', id=thread_id, format='minimal').execute()
    return [m['id'] for m in thread.get('messages', [])]

def get_or_create_label(service, name, cache):
    if name in cache:
        return cache[name]
    labels = service.users().labels().list(userId='me').execute().get('labels', [])
    for l in labels:
        if l['name'] == name:
            cache[name] = l['id']
            return l['id']
    lbl = service.users().labels().create(userId='me', body={
        'name': name,
        'labelListVisibility': 'labelShow',
        'messageListVisibility': 'show',
    }).execute()
    cache[name] = lbl['id']
    print(f'  [label creado] {name} → {lbl["id"]}')
    return lbl['id']

def apply_label(service, msg_id, label_id):
    service.users().messages().modify(
        userId='me', id=msg_id,
        body={'addLabelIds': [label_id]}
    ).execute()

def download_attachment(service, msg_id, attachment_id):
    """Descarga un adjunto de Gmail y devuelve los bytes."""
    att = service.users().messages().attachments().get(
        userId='me', messageId=msg_id, id=attachment_id
    ).execute()
    return base64.urlsafe_b64decode(att['data'])

# ── Limpieza de body ──────────────────────────────────────────────────────────
def clean_body(body: str) -> str:
    """
    Extrae solo el texto nuevo del mail, eliminando el historial citado.
    Corta en la primera señal de reply/forward: líneas con >, separadores,
    o encabezados de mensaje anterior.
    """
    # Patrones de inicio de historial citado
    cutoff = re.search(
        r'\n(?:'
        r'El .{5,80} escribi[oó]:|'      # español: "El ... escribió:"
        r'On .{5,80} wrote:|'             # inglés
        r'De: |From: |'                   # encabezado reenviado
        r'-{5,}|'                          # separador ------
        r'_{5,}|'                          # separador ______
        r'>{1,} ?'                         # líneas citadas
        r')',
        body
    )
    if cutoff:
        body = body[:cutoff.start()]

    # Eliminar líneas residuales que empiecen con >
    lines = [l for l in body.splitlines() if not l.strip().startswith('>')]
    result = '\n'.join(lines).strip()

    return result[:4000]

# ── Clasificador ──────────────────────────────────────────────────────────────
KEYWORDS = {
    1: ['SENTENCIA', 'FALLO', 'CONDENATORIA', 'ABSOLUTORIA', 'RESOLUCION JUDICIAL',
        'PRIMERA INSTANCIA', 'SEGUNDA INSTANCIA', 'CAMARA', 'DICTADO', 'INFORME DE SENTENCIA',
        'PROYECCION DE PAGO DE SENTENCIA', 'SENT.'],
    2: ['HONORARIOS', 'LIQUIDACION', 'MINUTA DE PAGO', 'MINUTA', 'RECLAMO DE PAGO',
        'REGULACION', 'PEDIDO DE FONDOS', 'PEDIDO FONDOS', 'FACTURA', 'ARANCEL',
        'PAGO DE HONORARIOS', 'FONDOS'],
    3: ['INTIMACION', 'CEDULA', 'NOTIFICACION', 'PLAZO', 'APERCIBIMIENTO',
        'NOTIFICA', 'INTIMA', 'VENCIMIENTO', 'SUMARISIMO', 'JUICIO NUEVO'],
    4: ['ACUERDO', 'MEDIACION', 'TRANSACCION', 'CONCILIACION', 'PROPUESTA DE ACUERDO',
        'AVENIMIENTO', 'CONVENIO', 'RECLAMO SINIESTRO'],
    5: ['EMBARGO', 'INHIBICION', 'TRABA DE EMBARGO', 'LEVANTAMIENTO DE EMBARGO'],
    6: ['PERICIA', 'PERITO', 'INFORME PERICIAL', 'DESIGNACION DE PERITO',
        'PERICIA MEDICA', 'PERICIA CONTABLE', 'IP PSICOL', 'IP '],
    7: ['OFICIO', 'OFICIO JUDICIAL', 'DILIGENCIA OFICIO', 'LIBRAMIENTO'],
    8: ['CONSULTA', 'AUTORIZACION', 'AUTORIZACION DE PAGO', 'PODRAN', 'PUEDEN',
        'NOS PASAN', 'NOS PODRIAN', 'INFORMAR', 'INFORMAME', 'COMO VA',
        'NECESITAMOS', 'NECESITO', 'COORDINACION', 'COORDINAR', 'REMITO',
        'ADJUNTO', 'TE PASO', 'LES PASO', 'CERTIFICAR', 'CERTIFICACION'],
}

TIPO_ES = {
    'sentencia': 'Sentencia', 'reclamo_pago': 'Reclamo de pago',
    'intimacion': 'Intimación', 'acuerdo': 'Acuerdo', 'embargo': 'Embargo',
    'pericia': 'Pericia', 'oficio': 'Oficio', 'gestion': 'Gestión',
}

def _normalize(text: str) -> str:
    import unicodedata
    nfkd = unicodedata.normalize('NFKD', text)
    return ''.join(c for c in nfkd if not unicodedata.combining(c)).upper()

def classify(subject: str, body_clean: str, attachments: list) -> tuple:
    """
    Clasifica sobre el asunto y el body_clean (sin historial citado).
    Ambos tienen el mismo peso — el cuerpo limpio ya es señal confiable.
    """
    subject_norm    = _normalize(subject)
    body_norm       = _normalize(body_clean + ' ' + ' '.join(a['filename'] for a in attachments))
    scores = {}
    for tipo, kws in KEYWORDS.items():
        kws_norm = [_normalize(kw) for kw in kws]
        subject_hits = sum(1 for kw in kws_norm if kw in subject_norm)
        body_hits    = sum(1 for kw in kws_norm if kw in body_norm)
        score = subject_hits + body_hits   # mismo peso: body_clean ya es confiable
        if score > 0:
            scores[tipo] = score
    if not scores:
        return None, 0.0, 'Sin keywords reconocibles'
    best = max(scores, key=scores.get)
    confidence = min(0.50 + scores[best] * 0.10, 0.97)
    matched = [kw for kw in KEYWORDS[best]
               if _normalize(kw) in subject_norm or _normalize(kw) in body_norm]
    reasoning = f"Keywords ({TIPOS[best]}): {', '.join(matched[:5])}"
    return best, confidence, reasoning

def extract_fields(subject: str, body_clean: str) -> tuple:
    text = subject + ' ' + body_clean
    caratula = policy = claim = case_num = None

    m = re.search(r'"([A-ZÁÉÍÓÚÑ][^"]{5,120}c/[^"]{5,120}s/[^"]{5,80})"', text, re.IGNORECASE)
    if not m:
        m = re.search(r'([A-ZÁÉÍÓÚÑ][^\n/]{5,60}\s+c/\s*[^\n/]{5,60}\s+s/\s*[^\n"]{5,60})', text, re.IGNORECASE)
    if m:
        caratula = m.group(1).strip()[:300]

    m = re.search(r'P[OÓ]LIZA[:\s#Nº°]*([A-Z0-9\-/]{4,12})', text, re.IGNORECASE)
    if m:
        policy = m.group(1).strip()

    m = re.search(r'S(?:INIESTRO|TRO)\.?\s*[:\s#Nº°]*([0-9]{4,8})', text, re.IGNORECASE)
    if m:
        claim = m.group(1).strip()

    m = re.search(r'EXPTE?\.?\s*[Nº°]*\s*([\d]+[/\-][\d]+)', text, re.IGNORECASE)
    if not m:
        m = re.search(r'\b(\d{4,6}/\d{4})\b', text)
    if m:
        case_num = m.group(1).strip()

    return caratula, policy, claim, case_num

# ── LLM summary ──────────────────────────────────────────────────────────────
def generate_summary(mail_type_str: str, subject: str, body_clean: str) -> tuple:
    """Genera título y descripción breve usando Claude Haiku."""
    if not ANTHROPIC_API_KEY:
        return '', ''
    try:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        tipo_label = TIPO_ES.get(mail_type_str, mail_type_str)
        prompt = f"""Sos un asistente legal. Analizá este mail judicial y generá:
1. TÍTULO: exactamente una oración, sin punto final, que describa de qué trata este mail.
2. DESCRIPCIÓN: máximo 3 oraciones que resuman la acción o información clave para el expediente. Sin paja, solo lo relevante.

Tipo de evento: {tipo_label}
Asunto: {subject}
Cuerpo (texto nuevo, sin historial): {body_clean[:800]}

Respondé ÚNICAMENTE con JSON válido, sin texto extra:
{{"title": "...", "description": "..."}}"""

        msg = client.messages.create(
            model='claude-haiku-4-5',
            max_tokens=200,
            messages=[{'role': 'user', 'content': prompt}]
        )
        raw = msg.content[0].text.strip()
        match = re.search(r'\{[^}]+\}', raw, re.DOTALL)
        if match:
            data = json.loads(match.group())
            return data.get('title', '')[:200], data.get('description', '')
    except Exception as e:
        print(f'  [summary] Error: {e}')
    return '', ''

# ── Backend API ───────────────────────────────────────────────────────────────
def post_event(payload: dict) -> tuple:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f'{BACKEND_URL}/api/v1/agents/case-events',
        data=data,
        headers={'X-Agent-Key': AGENT_KEY, 'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

def post_attachment(event_id: str, filename: str, file_bytes: bytes, mime_type: str) -> tuple:
    """Sube un adjunto al backend usando multipart/form-data."""
    boundary = '----RachelBoundary' + str(int(time.time()))
    body_parts = []

    # Campo event_id
    body_parts.append(
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="event_id"\r\n\r\n'
        f'{event_id}\r\n'.encode()
    )

    # Campo file
    body_parts.append(
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f'Content-Type: {mime_type}\r\n\r\n'.encode()
        + file_bytes
        + b'\r\n'
    )

    body_parts.append(f'--{boundary}--\r\n'.encode())
    body = b''.join(body_parts)

    req = urllib.request.Request(
        f'{BACKEND_URL}/api/v1/agents/attachments',
        data=body,
        headers={
            'X-Agent-Key': AGENT_KEY,
            'Content-Type': f'multipart/form-data; boundary={boundary}',
        },
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

# ── Procesamiento de un mensaje ───────────────────────────────────────────────
def process_message(service, msg_id: str, label_cache: dict) -> str:
    """Procesa un mensaje individual. Retorna string de status."""
    content = get_message_content(service, msg_id)

    # Limpiar body — clasificar solo sobre el texto nuevo
    body_clean = clean_body(content['body'])

    mail_type, confidence, reasoning = classify(
        content['subject'], body_clean, content['attachments']
    )

    # Parsear fecha
    if content.get('internal_date'):
        received_at = datetime.fromtimestamp(
            int(content['internal_date']) / 1000, tz=timezone.utc
        ).strftime('%Y-%m-%dT%H:%M:%SZ')
    else:
        try:
            received_at = parsedate_to_datetime(content['date']).astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        except Exception:
            received_at = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

    caratula, policy, claim, case_num = extract_fields(content['subject'], body_clean)

    # Label Gmail
    label_name = TIPO_LABELS.get(mail_type, LABEL_SIN_CLASIF)
    label_id = get_or_create_label(service, label_name, label_cache)
    apply_label(service, msg_id, label_id)

    if mail_type is None:
        return f'SIN CLASIFICAR | {content["subject"][:50]}'

    mail_type_str = TIPOS.get(mail_type, '')
    title, description = generate_summary(mail_type_str, content['subject'], body_clean)

    # Payload al backend
    payload = {
        'mail_id':     msg_id,
        'subject':     content['subject'][:500],
        'mail_type':   mail_type,
        'confidence':  confidence,
        'reasoning':   reasoning[:500],
        'body_clean':  body_clean,
        'received_at': received_at,
    }
    if title:       payload['title']            = title
    if description: payload['description']      = description
    if caratula:    payload['raw_caratula']     = caratula
    if policy:      payload['raw_policy']       = policy
    if claim:       payload['raw_claim_number'] = claim
    if case_num:    payload['raw_case_number']  = case_num

    status_code, resp = post_event(payload)

    if status_code == 201:
        event_id = resp.get('id', '')
        att_results = []

        # Subir adjuntos (PDFs/docs solamente)
        for att in content['attachments']:
            try:
                file_bytes = download_attachment(service, msg_id, att['attachment_id'])
                att_status, _ = post_attachment(event_id, att['filename'], file_bytes, att['mime_type'])
                att_results.append(f'{"✓" if att_status == 201 else "✗"} {att["filename"]}')
                time.sleep(0.1)
            except Exception as ex:
                att_results.append(f'✗ {att["filename"]} ({ex})')

        att_summary = f' | adjuntos: {", ".join(att_results)}' if att_results else ''
        return f'✓ {TIPOS[mail_type]} ({confidence:.2f}) | {content["subject"][:50]}{att_summary}'

    elif status_code == 409:
        return f'⟳ ya existía | {content["subject"][:50]}'
    else:
        return f'✗ backend {status_code} | {content["subject"][:50]}'

# ── Main ──────────────────────────────────────────────────────────────────────
def main(dry_run=False, limit=None):
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{ts}] Rachel v2 — iniciando...{" (dry-run)" if dry_run else ""}{f" (limit={limit})" if limit else ""}')

    service = get_gmail_service()
    label_cache = {}

    # IDs de labels Rachel/* existentes (para filtrar ya procesados)
    all_labels = service.users().labels().list(userId='me').execute().get('labels', [])
    rachel_label_ids = {l['id'] for l in all_labels if l['name'].startswith('Rachel/')}

    # Mails en INBOX sin ningún label Rachel/*
    results = service.users().messages().list(
        userId='me', labelIds=['INBOX'], maxResults=500
    ).execute()
    msgs = results.get('messages', [])

    if not msgs:
        print('No hay mails en INBOX.')
        return

    to_process = []
    for m in msgs:
        full = service.users().messages().get(userId='me', id=m['id'], format='minimal').execute()
        if not set(full.get('labelIds', [])).intersection(rachel_label_ids):
            to_process.append(m['id'])

    if not to_process:
        print('Todos los mails del INBOX ya tienen label Rachel/*. Nada nuevo.')
        return

    # Aplicar límite si se pasó (ej: primeros 5)
    if limit:
        to_process = to_process[:limit]

    print(f'Mails a procesar: {len(to_process)}')

    processed_thread_ids = set()
    processed_msg_ids    = set()
    stats = {'nuevos': 0, 'ya_existia': 0, 'sin_clasif': 0, 'errores': 0}

    for root_msg_id in to_process:
        try:
            root_full = service.users().messages().get(
                userId='me', id=root_msg_id, format='minimal'
            ).execute()
            thread_id = root_full.get('threadId', root_msg_id)

            if thread_id in processed_thread_ids:
                continue
            processed_thread_ids.add(thread_id)

            thread_msg_ids = get_thread_message_ids(service, thread_id)
            print(f'\nThread {thread_id[:12]} — {len(thread_msg_ids)} mensaje(s)')

            for msg_id in thread_msg_ids:
                if msg_id in processed_msg_ids:
                    continue
                processed_msg_ids.add(msg_id)

                if dry_run:
                    print(f'  [dry-run] {msg_id}')
                    continue

                result = process_message(service, msg_id, label_cache)
                print(f'  [{msg_id[:12]}] {result}')

                if '✓' in result:
                    stats['nuevos'] += 1
                elif '⟳' in result:
                    stats['ya_existia'] += 1
                elif 'SIN CLASIFICAR' in result:
                    stats['sin_clasif'] += 1

                time.sleep(0.15)

        except Exception as ex:
            print(f'  [{root_msg_id[:12]}] ERROR: {ex}', file=sys.stderr)
            stats['errores'] += 1

    print(f'\n=== Resultado ===')
    print(f'Nuevos registrados: {stats["nuevos"]}')
    print(f'Ya existían:        {stats["ya_existia"]}')
    print(f'Sin clasificar:     {stats["sin_clasif"]}')
    print(f'Errores:            {stats["errores"]}')

if __name__ == '__main__':
    dry   = '--dry-run' in sys.argv
    limit = None
    for arg in sys.argv[1:]:
        if arg.startswith('--limit='):
            limit = int(arg.split('=')[1])
    main(dry_run=dry, limit=limit)
