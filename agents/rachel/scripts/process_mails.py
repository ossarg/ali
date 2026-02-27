#!/usr/bin/env python3
"""
Rachel - Procesador de mails de Legales
Corre periódicamente, lee mails nuevos de Gmail y los carga en Neon DB.
"""

import json
import base64
import re
import sys
from datetime import datetime, date
import psycopg2
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

# ── Config ──────────────────────────────────────────────────────────────────
WORKSPACE = '/home/legales/.openclaw/workspace-rachel'
TOKEN_FILE = f'{WORKSPACE}/gmail_token.json'
DB_URL = 'os.environ.get("NEON_DB_URL")'

# ── Gmail ────────────────────────────────────────────────────────────────────
def get_gmail_service():
    with open(TOKEN_FILE) as f:
        token_data = json.load(f)
    creds = Credentials(**{k: token_data[k] for k in ['token','refresh_token','token_uri','client_id','client_secret','scopes']})
    if creds.expired:
        creds.refresh(Request())
        token_data['token'] = creds.token
        with open(TOKEN_FILE, 'w') as f:
            json.dump(token_data, f)
    return build('gmail', 'v1', credentials=creds), token_data.get('processed_label_id')

def get_unread_mails(service):
    results = service.users().messages().list(userId='me', labelIds=['INBOX'], q='is:unread').execute()
    return results.get('messages', [])

def get_mail_content(service, msg_id):
    m = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
    headers = {h['name']: h['value'] for h in m['payload']['headers']}

    def get_parts(payload):
        parts = []
        if 'parts' in payload:
            for p in payload['parts']:
                parts.extend(get_parts(p))
        else:
            parts.append(payload)
        return parts

    body = ''
    attachments = []
    for part in get_parts(m['payload']):
        mime = part.get('mimeType', '')
        filename = part.get('filename', '')
        if mime == 'text/plain' and not filename:
            data = part['body'].get('data', '')
            if data:
                body += base64.urlsafe_b64decode(data).decode('utf-8', errors='replace')
        elif filename and part['body'].get('attachmentId'):
            ext = filename.lower().split('.')[-1] if '.' in filename else ''
            if ext in ['pdf', 'docx', 'doc', 'xlsx', 'xls']:
                attachments.append({'filename': filename, 'mime': mime, 'attachment_id': part['body']['attachmentId']})

    return {
        'id': msg_id,
        'from': headers.get('From', ''),
        'subject': headers.get('Subject', ''),
        'date': headers.get('Date', ''),
        'body': body,
        'attachments': attachments
    }

def mark_processed(service, msg_id, label_id):
    service.users().messages().modify(
        userId='me', id=msg_id,
        body={'addLabelIds': [label_id], 'removeLabelIds': ['UNREAD', 'INBOX']}
    ).execute()

# ── Extracción de datos ──────────────────────────────────────────────────────
def extract_siniestro(text):
    """Busca número de siniestro en el texto."""
    patterns = [
        r'STRO\.?\s*[:.]?\s*(\d{4,6})',
        r'[Ss]iniestro\s*[:.]?\s*(\d{4,6})',
        r'STRO\s+(\d{4,6})',
    ]
    for pattern in patterns:
        m = re.search(pattern, text)
        if m:
            return m.group(1)
    return None

def extract_poliza(text):
    patterns = [r'P[ÓO]LIZA\s*[:.]?\s*(\d{5,7})', r'Póliza\s+N[°º]?\s*(\d{5,7})']
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return m.group(1)
    return None

def extract_expediente(text):
    patterns = [r'Expte\.?\s*[Nn][°º]?\s*([\d/.-]+)', r'[Ee]xpediente\s*[Nn][°º]?\s*([\d/.-]+)', r'EXP\s+([\d/.-]+)']
    for p in patterns:
        m = re.search(p, text)
        if m:
            return m.group(1).strip()
    return None

def classify_mail(subject, body):
    """Clasifica el tipo de evento del mail."""
    text = (subject + ' ' + body).upper()

    if any(w in text for w in ['JUICIO NUEVO', 'APERTURA', 'DERIVACIÓN', 'DERIVO NUEVO']):
        return 'apertura'
    if any(w in text for w in ['SENTENCIA']):
        return 'sentencia'
    if any(w in text for w in ['EMBARGO', 'OFICIO']):
        return 'embargo'
    if any(w in text for w in ['CONVENIO', 'ACUERDO', 'MINUTA DE PAGO', 'MINUTA']):
        if 'MINUTA' in text:
            return 'minuta_pago'
        return 'acuerdo'
    if any(w in text for w in ['RECLAMO', 'INTIMA', 'INTIMACIÓN', 'URGENTE', 'COMPROBANTE']):
        return 'reclamo_pago'
    if any(w in text for w in ['LIQUIDACIÓN', 'LIQUIDACION']):
        return 'liquidacion'

    return None  # no clasificado → revisión humana

def find_estudio(cur, from_email):
    """Busca estudio por email/dominio del remitente."""
    email = re.search(r'<(.+?)>', from_email)
    email = email.group(1) if email else from_email.strip()
    domain = email.split('@')[-1] if '@' in email else ''

    for alias in [email, domain]:
        if alias:
            cur.execute("SELECT estudio_id FROM estudios_aliases WHERE LOWER(alias) = LOWER(%s)", (alias,))
            row = cur.fetchone()
            if row:
                return row[0]
    return None

# ── Procesamiento ────────────────────────────────────────────────────────────
def process_mail(mail, cur, service):
    mail_id = mail['id']

    # Verificar duplicado
    cur.execute("SELECT id FROM eventos WHERE mail_origen_id = %s", (mail_id,))
    if cur.fetchone():
        return f"Duplicado, salteo"

    subject = mail['subject']
    body = mail['body']
    full_text = subject + '\n' + body

    # Extraer datos clave
    siniestro = extract_siniestro(full_text)
    poliza = extract_poliza(full_text)
    expediente = extract_expediente(full_text)
    tipo_evento = classify_mail(subject, body)
    estudio_id = find_estudio(cur, mail['from'])

    # Si no se puede clasificar → revisión humana
    if not tipo_evento:
        # Buscar o crear caso si hay siniestro
        caso_id = None
        if siniestro:
            cur.execute("SELECT id FROM casos WHERE nro_siniestro = %s", (siniestro,))
            row = cur.fetchone()
            if row:
                caso_id = row[0]
            else:
                cur.execute("""INSERT INTO casos (nro_siniestro, caratula, tipo_grupo, tipo_accion, estado_actual)
                    VALUES (%s, %s, 'tercero', 'tercero_vs_asegurado', 'abierto') RETURNING id""",
                    (siniestro, f'Caso STRO {siniestro} - pendiente clasificación'))
                caso_id = cur.fetchone()[0]

        if caso_id:
            cur.execute("""INSERT INTO revision_queue (caso_id, tipo_revision, descripcion)
                VALUES (%s, 'clasificacion', %s)""",
                (caso_id, f'Mail no clasificado. Asunto: {subject[:200]}'))
        return f"No clasificado → revisión humana (siniestro: {siniestro})"

    # Buscar caso existente
    caso_id = None
    if siniestro:
        cur.execute("SELECT id FROM casos WHERE nro_siniestro = %s", (siniestro,))
        row = cur.fetchone()
        if row:
            caso_id = row[0]

    # Si no existe el caso, crearlo
    if not caso_id:
        # Intentar extraer carátula del asunto
        caratula = subject
        cur.execute("""INSERT INTO casos (nro_siniestro, nro_expediente, poliza, caratula, tipo_grupo, tipo_accion, estudio_id, estado_actual)
            VALUES (%s, %s, %s, %s, 'tercero', 'tercero_vs_asegurado', %s, 'abierto') RETURNING id""",
            (siniestro, expediente, poliza, caratula[:500], estudio_id))
        caso_id = cur.fetchone()[0]

        # Si estudio no encontrado → flag revisión
        if not estudio_id:
            cur.execute("""INSERT INTO revision_queue (caso_id, tipo_revision, descripcion)
                VALUES (%s, 'estudio_nuevo', %s)""",
                (caso_id, f'Estudio no identificado. Remitente: {mail["from"]}'))

    # Registrar evento
    cur.execute("""INSERT INTO eventos (caso_id, tipo, fecha_evento, descripcion, mail_origen_id, payload)
        VALUES (%s, %s, CURRENT_DATE, %s, %s, %s) RETURNING id""",
        (caso_id, tipo_evento, f'Mail procesado automáticamente. Asunto: {subject[:300]}',
         mail_id, json.dumps({'subject': subject, 'from': mail['from'], 'attachments': [a['filename'] for a in mail['attachments']]})))
    evento_id = cur.fetchone()[0]

    # Alertas según tipo
    if tipo_evento == 'reclamo_pago':
        cur.execute("""INSERT INTO alertas (caso_id, evento_id, tipo, descripcion, prioridad)
            VALUES (%s, %s, 'pago_urgente', %s, 'alta')""",
            (caso_id, evento_id, f'Reclamo de pago recibido. STRO {siniestro}. {subject[:200]}'))

    elif tipo_evento == 'embargo':
        cur.execute("""INSERT INTO alertas (caso_id, evento_id, tipo, descripcion, prioridad)
            VALUES (%s, %s, 'embargo_activo', %s, 'alta')""",
            (caso_id, evento_id, f'Embargo notificado. STRO {siniestro}. Requiere acción urgente.'))

    return f"OK — tipo: {tipo_evento}, caso: {caso_id}, evento: {evento_id}"

# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Iniciando procesamiento de mails...")

    service, label_id = get_gmail_service()
    mails_raw = get_unread_mails(service)

    if not mails_raw:
        print("No hay mails nuevos.")
        return

    print(f"Mails nuevos: {len(mails_raw)}")

    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()

    procesados = 0
    errores = 0

    for msg in mails_raw:
        try:
            mail = get_mail_content(service, msg['id'])
            result = process_mail(mail, cur, service)
            mark_processed(service, msg['id'], label_id)
            print(f"  [{msg['id']}] {mail['subject'][:60]}... → {result}")
            procesados += 1
        except Exception as e:
            print(f"  [{msg['id']}] ERROR: {e}", file=sys.stderr)
            errores += 1

    cur.close()
    conn.close()
    print(f"Procesados: {procesados} | Errores: {errores}")

if __name__ == '__main__':
    main()
