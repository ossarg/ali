# Rachel — Instructivo: Registro de eventos con adjuntos

## Flujo completo

### 1. Crear el case_event (igual que antes)

```http
POST /api/v1/agents/case-events
X-Agent-Key: {AGENT_KEY}
Content-Type: application/json

{
  "mail_id":      "19c9cd00b99ab54e",
  "subject":      "RV: SENTENCIA CONDENATORIA...",
  "mail_type":    1,
  "confidence":   0.92,
  "reasoning":    "Keywords: SENTENCIA, CONDENATORIA",
  "title":        "Sentencia condenatoria de primera instancia — Sotelo c/ Libra",
  "description":  "El estudio informa sentencia condenatoria. Condena por $X. Solicitan instrucciones sobre apelación.",
  "body_clean":   "Texto limpio del mail sin el historial citado...",
  "received_at":  "2026-02-26T14:08:00Z",
  "raw_claim_number": "478477",
  "raw_policy":       "924162"
}
```

**Respuesta:** `201 Created` → guardá el `id` del evento.

---

### 2. Subir adjuntos (uno por vez)

Solo PDFs y documentos (`.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`).
**Imágenes y otros archivos: ignorar.**

```http
POST /api/v1/agents/attachments
X-Agent-Key: {AGENT_KEY}
Content-Type: multipart/form-data

event_id = {id del evento creado en el paso 1}
file     = {bytes del archivo}
```

**Respuesta:** `201 Created`
```json
{
  "key":  "19c9cd.../uuid.pdf",
  "name": "sentencia.pdf",
  "mime": "application/pdf",
  "size": 204800
}
```

Repetí el paso 2 por cada adjunto del mail.

---

### 3. Qué hacer si el POST del evento devuelve 409

El mail ya existe en la DB. **No subas adjuntos.** Saltear y continuar con el siguiente mail.

---

## body_clean — cómo generarlo

El campo `body_clean` debe contener **solo el texto del mail nuevo**, sin el historial citado.

Reglas para limpiar:
- Cortá el texto en la primera línea que empiece con `El `, seguida de una fecha y `escribió:` (o variantes: `On `, `De: `)
- Eliminá líneas que empiecen con `>` o `> `
- Eliminá bloques `---------- Mensaje reenviado ----------`
- Límite: 4000 caracteres

Ejemplo Python:
```python
import re

def clean_body(body: str) -> str:
    # Cortar en el historial citado
    cutoff = re.search(
        r'\n(El |On |De: |From: |>{1,}|\-{5,})',
        body
    )
    if cutoff:
        body = body[:cutoff.start()]
    # Eliminar líneas con >
    lines = [l for l in body.splitlines() if not l.strip().startswith('>')]
    return '\n'.join(lines).strip()[:4000]
```

---

## Tipos de archivo permitidos

| Extensión | MIME |
|-----------|------|
| `.pdf`    | `application/pdf` |
| `.doc`    | `application/msword` |
| `.docx`   | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `.xls`    | `application/vnd.ms-excel` |
| `.xlsx`   | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |

Todo lo demás (imágenes, `.txt`, `.eml`, etc.) → **ignorar**.

---

## Cómo descargar adjuntos de Gmail API

```python
def download_attachment(service, msg_id, attachment_id):
    att = service.users().messages().attachments().get(
        userId='me', messageId=msg_id, id=attachment_id
    ).execute()
    import base64
    return base64.urlsafe_b64decode(att['data'])
```

Los `attachment_id` los tenés en `msg['payload']` cuando hacés `messages.get(format='full')`.
