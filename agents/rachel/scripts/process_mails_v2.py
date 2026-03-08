#!/usr/bin/env python3
"""
Rachel v2 — Procesador de mails con expansión de threads.
Para cada mail nuevo, expande el thread completo y procesa
cada mensaje individualmente. El backend (409) protege contra duplicados.

Flujo por mensaje:
  1. Clasificar + generar title/description (una sola llamada a Claude Haiku)
  2. Limpiar cuerpo (body_clean)
  3. POST /api/v1/agents/case-events → obtener event_id
  4. Para cada adjunto PDF/doc: POST /api/v1/agents/attachments
"""
import json, urllib.request, base64, re, time, sys, os, hashlib
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
LABEL_APERTURA     = 'Rachel/Apertura'
LABEL_APELACION    = 'Rachel/Apelación'
LABEL_CIERRE       = 'Rachel/Cierre'
LABEL_SIN_CLASIF   = 'Rachel/Sin Clasificar'

TIPO_LABELS = {
    1: LABEL_SENTENCIA, 2: LABEL_RECLAMO_PAGO, 3: LABEL_INTIMACION,
    4: LABEL_ACUERDO,   5: LABEL_EMBARGO,       6: LABEL_PERICIA,
    7: LABEL_OFICIO,    8: LABEL_GESTION,
    9: LABEL_APERTURA,  10: LABEL_APELACION,    11: LABEL_CIERRE,
}

TIPOS = {
    1: 'sentencia', 2: 'reclamo_pago', 3: 'intimacion',
    4: 'acuerdo',   5: 'embargo',      6: 'pericia',
    7: 'oficio',    8: 'gestion',
    9: 'apertura',  10: 'apelacion',   11: 'cierre',
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
        'body':          body,            # sin truncar — el parser de forwards necesita el body completo
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
    """Extrae solo el texto del mail nuevo (de Axel), sin el historial reenviado."""
    cutoff = re.search(
        r'\n(El |On |De: |From: |>{1}|\-{5,}|_{5,})',
        body
    )
    if cutoff:
        body = body[:cutoff.start()]
    lines = [l for l in body.splitlines() if not l.strip().startswith('>')]
    return '\n'.join(lines).strip()[:3000]

# ── Parser de forward chain (Outlook) ────────────────────────────────────────
# Separador de Outlook: línea de guiones bajos (opcional) + bloque De:/Enviado:/Para:/Asunto:
_FORWARD_BLOCK = re.compile(
    r'(?:_{5,}\s*\n)?'                            # separador ___ (opcional)
    r'((?:De|From): .+?\n'                         # De: nombre <email>
    r'(?:Enviado(?: el)?|Sent): .+?\n'             # Enviado: / Enviado el: / Sent:
    r'(?:Para|To): .+?\n'                          # Para: / To:
    r'(?:(?:CC?|Cc): .+?\n)?'                      # CC: (opcional)
    r'(?:Asunto|Subject): .+?\n)',                 # Asunto: / Subject:
    re.IGNORECASE,
)

_MESES_ES = {
    'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
    'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
    'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12,
}

def _parse_outlook_date(date_str: str) -> str:
    """Convierte fecha de Outlook (español o inglés) a ISO UTC."""
    # Español: "viernes, 6 de marzo de 2026 11:21"
    m = re.search(r'(\d{1,2}) de (\w+) de (\d{4})\s+(\d{1,2}):(\d{2})', date_str, re.IGNORECASE)
    if m:
        day, month_name, year, hour, minute = m.groups()
        month = _MESES_ES.get(month_name.lower(), 1)
        dt = datetime(int(year), month, int(day), int(hour), int(minute), tzinfo=timezone.utc)
        return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
    # Inglés / fallback
    try:
        dt = parsedate_to_datetime(date_str)
        return dt.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    except Exception:
        pass
    return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

def extract_forward_chain(body: str, thread_id: str) -> list:
    """
    Parsea la cadena de forwards de Outlook embebida en el body.
    Retorna lista de dicts ordenados del más antiguo al más nuevo:
      { synthetic_id, from_email, from_name, date_str, received_at, subject, body_text }

    NO incluye el mensaje raíz de Axel (ya procesado como Gmail message).
    """
    header_matches = list(_FORWARD_BLOCK.finditer(body))
    if not header_matches:
        return []

    messages = []
    for i, m in enumerate(header_matches):
        header_text = m.group(1)
        body_start   = m.end()
        body_end     = header_matches[i + 1].start() if i + 1 < len(header_matches) else len(body)
        msg_body     = body[body_start:body_end].strip()

        from_m = re.search(r'(?:De|From): (.+)',                   header_text, re.IGNORECASE)
        date_m = re.search(r'(?:Enviado(?: el)?|Sent): (.+)',      header_text, re.IGNORECASE)
        subj_m = re.search(r'(?:Asunto|Subject): (.+)',            header_text, re.IGNORECASE)

        if not from_m or not date_m:
            continue

        from_line  = from_m.group(1).strip()
        date_str   = date_m.group(1).strip()
        subject    = subj_m.group(1).strip() if subj_m else ''

        email_m    = re.search(r'<([^>]+)>', from_line)
        from_email = email_m.group(1).lower() if email_m else from_line.strip()
        from_name  = re.sub(r'\s*<[^>]+>', '', from_line).strip()

        # ID sintético reproducible — sirve como dedup key en el backend
        synthetic_id = 'fwd_' + hashlib.md5(
            f'{thread_id}:{from_email}:{date_str}'.encode()
        ).hexdigest()[:16]

        messages.append({
            'synthetic_id': synthetic_id,
            'from_email':   from_email,
            'from_name':    from_name,
            'date_str':     date_str,
            'received_at':  _parse_outlook_date(date_str),
            'subject':      subject,
            'body_text':    msg_body[:3000],
        })

    # Outlook embebe los forwards del más nuevo al más viejo → invertir
    messages.reverse()
    return messages

# ── Clasificador + Summary (una sola llamada LLM) ─────────────────────────────
MAIL_TYPES_DESC = """
1  = sentencia     → Fallos judiciales, sentencias condenatorias o absolutorias, informes de sentencia, proyecciones de pago de sentencia.
2  = reclamo_pago  → Honorarios, liquidaciones, minutas de pago, facturas, pedidos de fondos, regulaciones arancelarias.
3  = intimacion    → Cédulas, notificaciones con plazo, apercibimientos, vencimientos procesales.
4  = acuerdo       → Mediación, transacción, conciliación, propuesta de acuerdo, avenimiento, convenio de pago.
5  = embargo       → Traba o levantamiento de embargo, inhibición de bienes.
6  = pericia       → Designación de perito, informe pericial, pericia médica, contable o psicológica.
7  = oficio        → Oficio judicial, libramiento, diligencia de oficio.
8  = gestion       → Consultas entre partes, pedidos de autorización, coordinación interna, remito de documentos sin relevancia procesal propia.
9  = apertura      → Juicio nuevo, inicio de expediente, primera presentación del caso (asunto suele decir JUICIO NUEVO).
10 = apelacion     → Recurso de apelación, apelación de sentencia, expresión de agravios, respuesta a agravios.
11 = cierre        → Cierre del expediente, caso cerrado, baja del caso, homologación de acuerdo final.
"""

def _strip_subject_prefixes(subject: str) -> str:
    """Elimina prefijos heredados de reply/forward (RV:, RE:, FW:, FWD:) del asunto."""
    return re.sub(r'^(RV|RE|FW|FWD|R|Res):\s*', '', subject, flags=re.IGNORECASE).strip()

def analyze_mail(subject: str, body_text: str) -> dict:
    """
    Clasifica el mail y genera título + descripción en una sola llamada a Claude Haiku.
    La clasificación se basa en el cuerpo — el asunto se usa solo como contexto de referencia.
    Retorna dict con: mail_type (int), confidence (float), reasoning (str), title (str), description (str).
    En caso de error retorna mail_type=None.
    """
    if not ANTHROPIC_API_KEY:
        return {'mail_type': None, 'confidence': 0.0, 'reasoning': 'Sin API key', 'title': '', 'description': ''}

    try:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        prompt = f"""Sos un asistente legal especializado en gestión de expedientes judiciales de seguros.

Analizá el siguiente mail y respondé con JSON válido únicamente (sin texto extra).

⚠️ Clasificá basándote PRINCIPALMENTE en el contenido del cuerpo. El asunto se incluye solo como referencia, puede ser heredado de un reenvío y no reflejar el tema real.

## Tipos de evento posibles:
{MAIL_TYPES_DESC}

## Mail a analizar:
Asunto (referencia): {subject}
Cuerpo: {body_text[:1200]}

## Tu respuesta debe tener exactamente este formato:
{{
  "mail_type": <número entero del 1 al 11>,
  "confidence": <número entre 0.0 y 1.0>,
  "reasoning": "<una oración explicando por qué elegiste ese tipo>",
  "title": "<exactamente una oración sin punto final que describa el evento>",
  "description": "<máximo 3 oraciones con la información clave para el expediente, sin relleno>"
}}"""

        msg = client.messages.create(
            model='claude-haiku-4-5',
            max_tokens=300,
            messages=[{'role': 'user', 'content': prompt}]
        )
        raw = msg.content[0].text.strip()
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            data = json.loads(match.group())
            mail_type = int(data.get('mail_type', 0))
            if mail_type not in range(1, 12):
                mail_type = None
            return {
                'mail_type':   mail_type,
                'confidence':  float(data.get('confidence', 0.7)),
                'reasoning':   str(data.get('reasoning', ''))[:500],
                'title':       str(data.get('title', ''))[:200],
                'description': str(data.get('description', '')),
            }
    except Exception as e:
        print(f'  [analyze] Error LLM: {e}')

    return {'mail_type': None, 'confidence': 0.0, 'reasoning': f'Error LLM', 'title': '', 'description': ''}

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
def _build_received_at(content: dict) -> str:
    if content.get('internal_date'):
        return datetime.fromtimestamp(
            int(content['internal_date']) / 1000, tz=timezone.utc
        ).strftime('%Y-%m-%dT%H:%M:%SZ')
    try:
        return parsedate_to_datetime(content['date']).astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    except Exception:
        return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

def _post_and_upload(service, msg_id, payload, attachments, label_cache):
    """
    Registra el evento en el backend y sube adjuntos si el registro es nuevo.
    Retorna (status_str, stats_key).
    """
    mail_type  = payload.get('mail_type')
    subject_sh = payload.get('subject', '')[:50]

    # Aplicar label Gmail
    label_name = TIPO_LABELS.get(mail_type, LABEL_SIN_CLASIF)
    label_id   = get_or_create_label(service, label_name, label_cache)
    if msg_id:   # solo si es un mensaje real de Gmail (no un forward sintético)
        apply_label(service, msg_id, label_id)

    status_code, resp = post_event(payload)

    if status_code == 201:
        event_id = resp.get('id', '')
        for att in attachments:
            ok = upload_attachment(service, msg_id, event_id, att)
            print(f'    [adjunto] {"✓" if ok else "✗"} {att["filename"]}')
        tipo_str = TIPOS.get(mail_type, '?')
        conf     = payload.get('confidence', 0)
        return f'✓ {tipo_str} ({conf:.2f}) | {subject_sh}', 'nuevos'
    elif status_code == 409:
        return f'⟳ ya existía | {subject_sh}', 'ya_existia'
    else:
        return f'✗ backend {status_code} | {subject_sh}', 'errores'

def process_message(service, msg_id: str, label_cache: dict) -> list:
    """
    Procesa un mensaje de Gmail y su cadena de forwards embebidos.
    Retorna lista de strings de status (uno por evento registrado).
    """
    content     = get_message_content(service, msg_id)
    received_at = _build_received_at(content)
    body_clean  = clean_body(content['body'])   # solo el texto de Axel (para storage)

    # ── Evento principal (mensaje de Axel) ────────────────────────────────────
    # Clasificamos solo sobre el texto de Axel (body_clean) — el forward chain
    # se procesa por separado como eventos independientes
    analysis    = analyze_mail(content['subject'], body_clean)
    mail_type   = analysis['mail_type']

    results = []

    if mail_type is None:
        label_id = get_or_create_label(service, LABEL_SIN_CLASIF, label_cache)
        apply_label(service, msg_id, label_id)
        results.append(f'SIN CLASIFICAR | {content["subject"][:50]}')
    else:
        caratula, policy, claim, case_num = extract_fields(content['subject'], content['body'])
        payload = {
            'mail_id':     msg_id,
            'subject':     content['subject'][:500],
            'mail_type':   mail_type,
            'confidence':  analysis['confidence'],
            'reasoning':   analysis['reasoning'],
            'received_at': received_at,
            'body_clean':  body_clean,
            'title':       analysis['title'],
            'description': analysis['description'],
        }
        if caratula:  payload['raw_caratula']     = caratula
        if policy:    payload['raw_policy']       = policy
        if claim:     payload['raw_claim_number'] = claim
        if case_num:  payload['raw_case_number']  = case_num

        status_str, _ = _post_and_upload(service, msg_id, payload, content['attachments'], label_cache)
        results.append(status_str)

    # ── Eventos de forwards embebidos ─────────────────────────────────────────
    forwards = extract_forward_chain(content['body'], content['thread_id'])
    for fwd in forwards:
        # Para forwards embebidos: clasificar solo sobre el body del mensaje embebido
        fwd_subject  = _strip_subject_prefixes(fwd['subject'])
        fwd_analysis = analyze_mail(fwd_subject, fwd['body_text'])
        fwd_type     = fwd_analysis['mail_type']
        if fwd_type is None:
            results.append(f'  ↳ SIN CLASIFICAR (fwd) | {fwd["subject"][:50]}')
            continue

        caratula, policy, claim, case_num = extract_fields(fwd['subject'], fwd['body_text'])
        fwd_payload = {
            'mail_id':     fwd['synthetic_id'],
            'subject':     fwd_subject[:500],
            'mail_type':   fwd_type,
            'confidence':  fwd_analysis['confidence'],
            'reasoning':   fwd_analysis['reasoning'],
            'received_at': fwd['received_at'],
            'body_clean':  fwd['body_text'],
            'title':       fwd_analysis['title'],
            'description': fwd_analysis['description'],
        }
        if caratula:  fwd_payload['raw_caratula']     = caratula
        if policy:    fwd_payload['raw_policy']       = policy
        if claim:     fwd_payload['raw_claim_number'] = claim
        if case_num:  fwd_payload['raw_case_number']  = case_num

        # No aplicamos label en Gmail (no es un msg real) → pasamos msg_id=None
        fwd_status, _ = _post_and_upload(service, None, fwd_payload, [], label_cache)
        results.append(f'  ↳ fwd [{fwd["from_name"][:30]}] {fwd_status}')
        time.sleep(0.1)

    return results

# ── Main ──────────────────────────────────────────────────────────────────────
def main(dry_run=False, limit=None, thread_id=None):
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    flags = []
    if dry_run:   flags.append('dry-run')
    if limit:     flags.append(f'limit={limit}')
    if thread_id: flags.append(f'thread={thread_id}')
    print(f'[{ts}] Rachel v2 — iniciando...{" (" + ", ".join(flags) + ")" if flags else ""}')

    service     = get_gmail_service()
    label_cache = {}

    # Modo thread único: procesar solo ese thread
    if thread_id:
        print(f'Modo thread único: {thread_id}')
        processed_msg_ids = set()
        stats = {'nuevos': 0, 'ya_existia': 0, 'sin_clasif': 0, 'errores': 0}
        thread_msg_ids = get_thread_message_ids(service, thread_id)
        print(f'Thread {thread_id[:12]} — {len(thread_msg_ids)} mensaje(s)')
        for msg_id in thread_msg_ids:
            if dry_run:
                print(f'  [dry-run] {msg_id}')
                continue
            try:
                results = process_message(service, msg_id, label_cache)
                for result in results:
                    prefix = f'  [{msg_id[:12]}]' if not result.startswith('  ↳') else '  '
                    print(f'{prefix} {result}')
                    if '✓' in result:      stats['nuevos']     += 1
                    elif '⟳' in result:   stats['ya_existia'] += 1
                    elif 'SIN' in result:  stats['sin_clasif'] += 1
                time.sleep(0.15)
            except Exception as ex:
                print(f'  [{msg_id[:12]}] ERROR: {ex}', file=sys.stderr)
                stats['errores'] += 1
        print(f'\n=== Resultado ===')
        print(f'Nuevos registrados: {stats["nuevos"]}')
        print(f'Ya existían:        {stats["ya_existia"]}')
        print(f'Sin clasificar:     {stats["sin_clasif"]}')
        print(f'Errores:            {stats["errores"]}')
        return

    all_labels       = service.users().labels().list(userId='me').execute().get('labels', [])
    rachel_label_ids = {l['id'] for l in all_labels if l['name'].startswith('Rachel/')}

    # Paginar hasta traer todos los mails del INBOX
    msgs = []
    page_token = None
    while True:
        params = {'userId': 'me', 'labelIds': ['INBOX'], 'maxResults': 500}
        if page_token:
            params['pageToken'] = page_token
        results = service.users().messages().list(**params).execute()
        msgs.extend(results.get('messages', []))
        page_token = results.get('nextPageToken')
        if not page_token:
            break

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

    if limit:
        to_process = to_process[:limit]

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

                results = process_message(service, msg_id, label_cache)
                for result in results:
                    prefix = f'  [{msg_id[:12]}]' if not result.startswith('  ↳') else '  '
                    print(f'{prefix} {result}')
                    if '✓' in result:      stats['nuevos']     += 1
                    elif '⟳' in result:   stats['ya_existia'] += 1
                    elif 'SIN' in result:  stats['sin_clasif'] += 1

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
    dry_run    = '--dry-run' in sys.argv
    limit      = None
    thread_id  = None
    for arg in sys.argv[1:]:
        if arg.startswith('--limit='):
            limit = int(arg.split('=')[1])
        elif arg.startswith('--thread='):
            thread_id = arg.split('=')[1]
    main(dry_run=dry_run, limit=limit, thread_id=thread_id)
