#!/usr/bin/env python3
"""
Rachel v2 — Procesador de mails con expansión de threads.
Para cada mail nuevo, expande el thread completo y procesa
cada mensaje individualmente. El backend (409) protege contra duplicados.

Flujo por mensaje:
  1. Clasificar (keywords)
  2. Generar title + description (Claude Haiku)
  3. Limpiar cuerpo (body_clean)
  4. POST /api/v1/agents/case-events → obtener event_id
  5. Para cada adjunto PDF/doc: POST /api/v1/agents/attachments
"""
import json, urllib.request, base64, re, time, sys, os
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import anthropic

# ── Paths (el .env y el token viven en el workspace de Rachel) ────────────────
WORKSPACE  = os.environ.get('RACHEL_WORKSPACE', '/home/legales/.openclaw/workspace-rachel')
TOKEN_FILE = os.path.join(WORKSPACE, 'gmail_token.json')
ENV_FILE   = os.path.join(WORKSPACE, '.env')

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

ENV               = load_env()
AGENT_KEY         = ENV.get('AGENT_KEY', '')
BACKEND_URL       = ENV.get('BACKEND_URL', 'http://localhost:8080')
ANTHROPIC_API_KEY = ENV.get('ANTHROPIC_API_KEY', '')

# ── Labels Gmail ──────────────────────────────────────────────────────────────
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
    1: LABEL_SENTENCIA, 2: LABEL_RECLAMO_PAGO, 3: LABEL_INTIMACION,
    4: LABEL_ACUERDO,   5: LABEL_EMBARGO,       6: LABEL_PERICIA,
    7: LABEL_OFICIO,    8: LABEL_GESTION,
}

TIPOS = {
    1: 'sentencia', 2: 'reclamo_pago', 3: 'intimacion',
    4: 'acuerdo',   5: 'embargo',      6: 'pericia',
    7: 'oficio',    8: 'gestion',
}

# ── Tipos de adjunto permitidos (solo PDFs y documentos) ─────────────────────
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'}
ALLOWED_MIMES = {
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

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
    attachments = []  # lista de dicts: {filename, mime, attachment_id}
    mime = payload.get('mimeType', '')
    data = payload.get('body', {}).get('data', '')
    filename = payload.get('filename', '')
    att_id = payload.get('body', {}).get('attachmentId', '')

    if data and not filename:
        if mime == 'text/plain':
            body += base64.urlsafe_b64decode(data).decode('utf-8', errors='replace')

    if filename and att_id:
        ext = os.path.splitext(filename)[1].lower()
        if ext in ALLOWED_EXTENSIONS:
            attachments.append({'filename': filename, 'mime': mime, 'attachment_id': att_id})

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
        'internal_date': msg.get('internalDate'),  # ms desde epoch, siempre preciso
        'body':          body[:4000],
        'attachments':   attachments,              # solo PDF/docs
        'label_ids':     msg.get('labelIds', []),
    }

def download_attachment(service, msg_id, attachment_id):
    """Descarga los bytes de un adjunto de Gmail."""
    att = service.users().messages().attachments().get(
        userId='me', messageId=msg_id, id=attachment_id
    ).execute()
    return base64.urlsafe_b64decode(att['data'])

def get_thread_message_ids(service, thread_id):
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

def apply_label(service, msg_id, label_id, remove_ids=None):
    body = {'addLabelIds': [label_id]}
    if remove_ids:
        body['removeLabelIds'] = remove_ids
    service.users().messages().modify(userId='me', id=msg_id, body=body).execute()

# ── Limpieza de cuerpo ────────────────────────────────────────────────────────
def clean_body(body: str) -> str:
    """Extrae solo el texto del mail nuevo, sin el historial citado."""
    cutoff = re.search(
        r'\n(El |On |De: |From: |>{1}|\-{5,}|_{5,})',
        body
    )
    if cutoff:
        body = body[:cutoff.start()]
    lines = [l for l in body.splitlines() if not l.strip().startswith('>')]
    return '\n'.join(lines).strip()[:4000]

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
        'TE PASO', 'LES PASO', 'CERTIFICAR', 'CERTIFICACION'],
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

def classify(subject, body, attachments):
    att_names = [a['filename'] for a in attachments] if attachments and isinstance(attachments[0], dict) else attachments
    subject_norm = _normalize(subject)
    body_norm    = _normalize(body + ' ' + ' '.join(att_names))
    scores = {}
    for tipo, kws in KEYWORDS.items():
        kws_norm     = [_normalize(kw) for kw in kws]
        subject_hits = sum(1 for kw in kws_norm if kw in subject_norm)
        body_hits    = sum(1 for kw in kws_norm if kw in body_norm)
        score = subject_hits * 2 + body_hits
        if score > 0:
            scores[tipo] = score
    if not scores:
        return None, 0.0, 'Sin keywords reconocibles'
    best = max(scores, key=scores.get)
    confidence = min(0.50 + scores[best] * 0.10, 0.97)
    matched = [kw for kw in KEYWORDS[best] if _normalize(kw) in subject_norm or _normalize(kw) in body_norm]
    reasoning = f"Keywords ({TIPOS[best]}): {', '.join(matched[:5])}"
    return best, confidence, reasoning

# ── LLM: título y descripción ─────────────────────────────────────────────────
def generate_summary(mail_type_str: str, subject: str, body_clean: str) -> tuple[str, str]:
    """Genera título y descripción usando el cuerpo limpio del mail."""
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
Cuerpo del mail: {body_clean[:800]}

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
def post_event(payload) -> tuple[int, dict]:
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

def upload_attachment(service, msg_id, event_id, att: dict) -> bool:
    """Descarga el adjunto de Gmail y lo sube al backend. Retorna True si ok."""
    try:
        file_bytes = download_attachment(service, msg_id, att['attachment_id'])
        boundary   = 'rachelboundary'
        body_parts = (
            f'--{boundary}\r\n'
            f'Content-Disposition: form-data; name="event_id"\r\n\r\n'
            f'{event_id}\r\n'
            f'--{boundary}\r\n'
            f'Content-Disposition: form-data; name="file"; filename="{att["filename"]}"\r\n'
            f'Content-Type: {att["mime"] or "application/octet-stream"}\r\n\r\n'
        ).encode() + file_bytes + f'\r\n--{boundary}--\r\n'.encode()

        req = urllib.request.Request(
            f'{BACKEND_URL}/api/v1/agents/attachments',
            data=body_parts,
            headers={
                'X-Agent-Key': AGENT_KEY,
                'Content-Type': f'multipart/form-data; boundary={boundary}',
            },
            method='POST'
        )
        with urllib.request.urlopen(req) as r:
            return r.status == 201
    except Exception as e:
        print(f'    [attachment] Error subiendo {att["filename"]}: {e}')
        return False

def extract_fields(subject, body):
    text = subject + ' ' + body
    caratula = policy = claim = case_num = None

    m = re.search(r'"([A-ZÁÉÍÓÚÑ][^"]{5,120}c/[^"]{5,120}s/[^"]{5,80})"', text, re.IGNORECASE)
    if not m:
        m = re.search(r'([A-ZÁÉÍÓÚÑ][^\n/]{5,60}\s+c/\s*[^\n/]{5,60}\s+s/\s*[^\n"]{5,60})', text, re.IGNORECASE)
    if m:
        caratula = m.group(1).strip()[:300]

    m = re.search(r'P[OÓ]LIZA[:\s#Nº°]*([A-Z0-9\-/]{4,12})', text, re.IGNORECASE)
    if m: policy = m.group(1).strip()

    m = re.search(r'S(?:INIESTRO|TRO)\.?\s*[:\s#Nº°]*([0-9]{4,8})', text, re.IGNORECASE)
    if m: claim = m.group(1).strip()

    m = re.search(r'EXPTE?\.?\s*[Nº°]*\s*([\d]+[/\-][\d]+)', text, re.IGNORECASE)
    if not m:
        m = re.search(r'\b(\d{4,6}/\d{4})\b', text)
    if m: case_num = m.group(1).strip()

    return caratula, policy, claim, case_num

# ── Procesamiento de un mensaje ───────────────────────────────────────────────
def process_message(service, msg_id, label_cache):
    content = get_message_content(service, msg_id)

    mail_type, confidence, reasoning = classify(
        content['subject'], content['body'], content['attachments']
    )

    # Fecha desde internalDate (confiable) o header Date
    if content.get('internal_date'):
        received_at = datetime.fromtimestamp(
            int(content['internal_date']) / 1000, tz=timezone.utc
        ).strftime('%Y-%m-%dT%H:%M:%SZ')
    else:
        try:
            received_at = parsedate_to_datetime(content['date']).astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        except Exception:
            received_at = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

    # Aplicar label en Gmail
    label_name = TIPO_LABELS.get(mail_type, LABEL_SIN_CLASIF)
    label_id   = get_or_create_label(service, label_name, label_cache)
    apply_label(service, msg_id, label_id)

    if mail_type is None:
        return f'SIN CLASIFICAR | {content["subject"][:50]}'

    # Cuerpo limpio y summary LLM
    mail_type_str = TIPOS.get(mail_type, '')
    body_clean    = clean_body(content['body'])
    title, description = generate_summary(mail_type_str, content['subject'], body_clean)

    caratula, policy, claim, case_num = extract_fields(content['subject'], content['body'])

    payload = {
        'mail_id':     msg_id,
        'subject':     content['subject'][:500],
        'mail_type':   mail_type,
        'confidence':  confidence,
        'reasoning':   reasoning[:500],
        'received_at': received_at,
        'body_clean':  body_clean,
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
        # Subir adjuntos PDF/doc
        for att in content['attachments']:
            ok = upload_attachment(service, msg_id, event_id, att)
            status = '✓' if ok else '✗'
            print(f'    [adjunto] {status} {att["filename"]}')
        return f'✓ {TIPOS[mail_type]} ({confidence:.2f}) | {content["subject"][:50]}'
    elif status_code == 409:
        return f'⟳ ya existía | {content["subject"][:50]}'
    else:
        return f'✗ backend {status_code} | {content["subject"][:50]}'

# ── Main ──────────────────────────────────────────────────────────────────────
def main(dry_run=False):
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{ts}] Rachel v2 — iniciando...')

    service     = get_gmail_service()
    label_cache = {}

    all_labels       = service.users().labels().list(userId='me').execute().get('labels', [])
    rachel_label_ids = {l['id'] for l in all_labels if l['name'].startswith('Rachel/')}

    results = service.users().messages().list(
        userId='me', labelIds=['INBOX'], maxResults=100
    ).execute()
    msgs = results.get('messages', [])

    if not msgs:
        print('No hay mails nuevos en INBOX.')
        return

    to_process = []
    for m in msgs:
        full = service.users().messages().get(userId='me', id=m['id'], format='minimal').execute()
        labels_on_msg = set(full.get('labelIds', []))
        if not labels_on_msg.intersection(rachel_label_ids):
            to_process.append(m['id'])

    if not to_process:
        print('Todos los mails del INBOX ya tienen label Rachel/*. Nada nuevo.')
        return

    print(f'Mails sin procesar: {len(to_process)}')

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

                if '✓' in result:   stats['nuevos']     += 1
                elif '⟳' in result: stats['ya_existia'] += 1
                elif 'SIN'  in result: stats['sin_clasif'] += 1

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
    main(dry_run='--dry-run' in sys.argv)
