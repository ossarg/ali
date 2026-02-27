#!/usr/bin/env python3
"""
Rachel - Actualiza Google Sheets con datos de la DB
Agrega filas nuevas (no sobreescribe) con timestamp de procesamiento.
"""

import json
import psycopg2
from datetime import datetime
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

WORKSPACE = '/home/legales/.openclaw/workspace-rachel'
TOKEN_FILE = f'{WORKSPACE}/gmail_token.json'
SHEETS_IDS_FILE = f'{WORKSPACE}/sheets_ids.json'
DB_URL = 'postgresql://neondb_owner:npg_09lhJkLNDKfr@ep-cold-bar-ai32e4c6-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'
FOLDER_NAME = 'Legales - Rachel'

def get_services():
    with open(TOKEN_FILE) as f:
        token_data = json.load(f)
    creds = Credentials(**{k: token_data[k] for k in ['token','refresh_token','token_uri','client_id','client_secret','scopes']})
    if creds.expired:
        creds.refresh(Request())
        token_data['token'] = creds.token
        with open(TOKEN_FILE, 'w') as f:
            json.dump(token_data, f)
    drive = build('drive', 'v3', credentials=creds)
    sheets = build('sheets', 'v4', credentials=creds)
    return drive, sheets

def get_or_create_folder(drive, name):
    results = drive.files().list(
        q=f"name='{name}' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields='files(id, name)'
    ).execute()
    files = results.get('files', [])
    if files:
        return files[0]['id']
    folder = drive.files().create(body={
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder'
    }, fields='id').execute()
    return folder['id']

def get_or_create_sheet(drive, sheets, folder_id, name, headers):
    """Obtiene o crea un Google Sheet con los headers dados."""
    try:
        with open(SHEETS_IDS_FILE) as f:
            ids = json.load(f)
    except:
        ids = {}

    if name in ids:
        return ids[name]

    # Crear nuevo sheet
    sheet = drive.files().create(body={
        'name': name,
        'mimeType': 'application/vnd.google-apps.spreadsheet',
        'parents': [folder_id]
    }, fields='id').execute()
    sheet_id = sheet['id']

    # Agregar headers
    sheets.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range='A1',
        valueInputOption='RAW',
        body={'values': [headers]}
    ).execute()

    # Formato negrita en header
    sheets.spreadsheets().batchUpdate(
        spreadsheetId=sheet_id,
        body={'requests': [{
            'repeatCell': {
                'range': {'sheetId': 0, 'startRowIndex': 0, 'endRowIndex': 1},
                'cell': {'userEnteredFormat': {
                    'textFormat': {'bold': True, 'foregroundColor': {'red': 1, 'green': 1, 'blue': 1}},
                    'backgroundColor': {'red': 0.2, 'green': 0.4, 'blue': 0.8}
                }},
                'fields': 'userEnteredFormat(textFormat,backgroundColor)'
            }
        }]}
    ).execute()

    ids[name] = sheet_id
    with open(SHEETS_IDS_FILE, 'w') as f:
        json.dump(ids, f)

    print(f"  Sheet creado: {name} — https://docs.google.com/spreadsheets/d/{sheet_id}")
    return sheet_id

def append_rows(sheets, sheet_id, rows):
    if not rows:
        return 0
    sheets.spreadsheets().values().append(
        spreadsheetId=sheet_id,
        range='A1',
        valueInputOption='RAW',
        insertDataOption='INSERT_ROWS',
        body={'values': rows}
    ).execute()
    return len(rows)

def format_pesos(val):
    if val is None:
        return ''
    try:
        return f"${float(val):,.2f}"
    except:
        return str(val)

def main():
    now = datetime.now().strftime('%d/%m/%Y %H:%M')
    print(f"[{now}] Actualizando Google Sheets...")

    drive, sheets = get_services()
    folder_id = get_or_create_folder(drive, FOLDER_NAME)

    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    # ── 1. CASOS ──────────────────────────────────────────────────────────────
    sheet_id = get_or_create_sheet(drive, sheets, folder_id, '📁 Casos', [
        'Fecha Registro', 'Siniestro', 'Carátula', 'Grupo', 'Tipo Acción',
        'Estado', 'Estudio', 'Tribunal', 'Póliza', 'Expediente', 'Alertas Activas', 'Último Evento'
    ])
    cur.execute("""
        SELECT NOW()::date, c.nro_siniestro, c.caratula, c.tipo_grupo, c.tipo_accion,
               c.estado_actual, est.nombre, c.tribunal, c.poliza, c.nro_expediente,
               (SELECT COUNT(*) FROM alertas a WHERE a.caso_id = c.id AND a.estado != 'resuelta'),
               (SELECT ev.tipo FROM eventos ev WHERE ev.caso_id = c.id ORDER BY ev.fecha_evento DESC LIMIT 1)
        FROM casos c LEFT JOIN estudios est ON est.id = c.estudio_id
        ORDER BY c.id
    """)
    rows = [[str(v) if v is not None else '' for v in r] for r in cur.fetchall()]
    n = append_rows(sheets, sheet_id, rows)
    print(f"  📁 Casos: +{n} filas")

    # ── 2. EMBARGOS ───────────────────────────────────────────────────────────
    sheet_id = get_or_create_sheet(drive, sheets, folder_id, '🔒 Embargos', [
        'Fecha Registro', 'Siniestro', 'Carátula', 'Banco / Entidad', 'CUIT Entidad',
        'Monto Total', 'Moneda', 'Fecha Oficio', 'Estado', 'CBU Depósito', 'Estudio'
    ])
    cur.execute("""
        SELECT NOW()::date, c.nro_siniestro, c.caratula, e.entidad, e.cuit_entidad,
               e.monto_total, e.moneda, e.fecha_oficio, e.estado, e.cuenta_deposito, est.nombre
        FROM embargos e JOIN casos c ON c.id = e.caso_id LEFT JOIN estudios est ON est.id = c.estudio_id
        ORDER BY e.fecha_oficio DESC
    """)
    rows = [[str(v) if v is not None else '' for v in r] for r in cur.fetchall()]
    n = append_rows(sheets, sheet_id, rows)
    print(f"  🔒 Embargos: +{n} filas")

    # ── 3. ALERTAS ────────────────────────────────────────────────────────────
    sheet_id = get_or_create_sheet(drive, sheets, folder_id, '🚨 Alertas', [
        'Fecha Registro', 'Siniestro', 'Carátula', 'Tipo Alerta', 'Descripción',
        'Prioridad', 'Fecha Vencimiento', 'Urgencia', 'Estado', 'Estudio'
    ])
    cur.execute("""
        SELECT NOW()::date, c.nro_siniestro, c.caratula, a.tipo, a.descripcion,
               a.prioridad, a.fecha_vencimiento,
               CASE WHEN a.fecha_vencimiento < CURRENT_DATE THEN 'VENCIDO'
                    WHEN a.fecha_vencimiento = CURRENT_DATE THEN 'HOY'
                    WHEN a.fecha_vencimiento <= CURRENT_DATE+7 THEN 'ESTA SEMANA'
                    ELSE 'PRÓXIMO' END,
               a.estado, est.nombre
        FROM alertas a JOIN casos c ON c.id = a.caso_id LEFT JOIN estudios est ON est.id = c.estudio_id
        WHERE a.estado != 'resuelta'
        ORDER BY CASE a.prioridad WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END, a.fecha_vencimiento ASC NULLS LAST
    """)
    rows = [[str(v) if v is not None else '' for v in r] for r in cur.fetchall()]
    n = append_rows(sheets, sheet_id, rows)
    print(f"  🚨 Alertas: +{n} filas")

    # ── 4. COLA DE REVISIÓN ───────────────────────────────────────────────────
    sheet_id = get_or_create_sheet(drive, sheets, folder_id, '👁 Cola de Revisión', [
        'Fecha Registro', 'ID', 'Siniestro', 'Carátula', 'Tipo Revisión',
        'Qué revisar', 'Estado', 'Resuelto por', 'Resolución'
    ])
    cur.execute("""
        SELECT NOW()::date, r.id, c.nro_siniestro, c.caratula, r.tipo_revision,
               r.descripcion, r.estado, r.resuelto_por, r.resolucion
        FROM revision_queue r JOIN casos c ON c.id = r.caso_id
        ORDER BY CASE r.estado WHEN 'pendiente' THEN 1 ELSE 2 END, r.created_at
    """)
    rows = [[str(v) if v is not None else '' for v in r] for r in cur.fetchall()]
    n = append_rows(sheets, sheet_id, rows)
    print(f"  👁 Cola revisión: +{n} filas")

    # ── 5. PERFORMANCE ESTUDIOS ───────────────────────────────────────────────
    sheet_id = get_or_create_sheet(drive, sheets, folder_id, '📊 Performance Estudios', [
        'Fecha Registro', 'Estudio', 'Total Casos', 'Casos Activos', 'Casos Cerrados',
        'Total Estimado', 'Total Acordado', '% Ahorro', 'Embargos Totales', 'Embargos Activos'
    ])
    cur.execute("""
        SELECT NOW()::date, est.nombre,
               COUNT(DISTINCT c.id),
               COUNT(DISTINCT CASE WHEN c.estado_actual='abierto' THEN c.id END),
               COUNT(DISTINCT CASE WHEN c.estado_actual='cerrado' THEN c.id END),
               COALESCE(SUM(a.monto_estimado_sentencia),0),
               COALESCE(SUM(a.monto_total),0),
               CASE WHEN SUM(a.monto_estimado_sentencia)>0
                    THEN ROUND((1-SUM(a.monto_total)/SUM(a.monto_estimado_sentencia))*100,1)
                    ELSE NULL END,
               COUNT(DISTINCT emb.id),
               COUNT(DISTINCT CASE WHEN emb.estado='trabado' THEN emb.id END)
        FROM estudios est
        LEFT JOIN casos c ON c.estudio_id=est.id
        LEFT JOIN acuerdos a ON a.caso_id=c.id
        LEFT JOIN embargos emb ON emb.caso_id=c.id
        GROUP BY est.id, est.nombre ORDER BY COUNT(DISTINCT c.id) DESC
    """)
    rows = [[str(v) if v is not None else '' for v in r] for r in cur.fetchall()]
    n = append_rows(sheets, sheet_id, rows)
    print(f"  📊 Performance: +{n} filas")

    # ── 6. HONORARIOS ─────────────────────────────────────────────────────────
    sheet_id = get_or_create_sheet(drive, sheets, folder_id, '💰 Honorarios', [
        'Fecha Registro', 'Siniestro', 'Carátula', 'Tipo', 'Beneficiario',
        'Monto', 'Moneda', 'Unidad', 'Cantidad Unidades', 'Estado', 'Fecha Vencimiento', 'Fecha Pago'
    ])
    cur.execute("""
        SELECT NOW()::date, c.nro_siniestro, c.caratula, h.tipo, h.monto,
               h.moneda, h.unidad, h.cantidad_unidades, h.estado, h.fecha_vencimiento, h.fecha_pago
        FROM honorarios h JOIN casos c ON c.id = h.caso_id
        ORDER BY h.estado, c.nro_siniestro
    """)
    rows = [[str(v) if v is not None else '' for v in r] for r in cur.fetchall()]
    n = append_rows(sheets, sheet_id, rows)
    print(f"  💰 Honorarios: +{n} filas")

    cur.close()
    conn.close()
    print(f"✅ Sheets actualizados")

if __name__ == '__main__':
    main()
