# Spec: Rachel → Ali Pipeline Trigger
> Para Woz — backend implementation spec

## Objetivo

Cuando el operador aprueba un `case_event` de tipo demanda, el sistema dispara el pipeline de Ali automáticamente, sin intervención manual adicional.

---

## Endpoint

### `POST /api/v1/pipeline/trigger`

**Auth:** Bearer token (mismo que el resto del API)

**Request body:**
```json
{
  "case_event_id": "uuid",
  "pdf_path": "string",           // path al PDF adjunto del mail (ya en disco)
  "poliza_path": "string | null", // path a la póliza si viene adjunta
  "origen": "email",
  "fecha_notificacion_asegurador": "ISO datetime | null",
  "case_id": "uuid | null"        // null si el case aún no existe (se crea en el trigger)
}
```

**Response `202 Accepted`:**
```json
{
  "run_id": "uuid",               // ID del pipeline_run creado
  "case_id": "uuid",              // case vinculado (creado o existente)
  "status": "queued"
}
```

**Response `400`:** si `case_event_id` no existe o ya tiene un pipeline_run activo.
**Response `409`:** si el case_event ya fue procesado por el pipeline.

---

## Flujo

1. Backend valida que el `case_event` existe y tiene `approved = true`
2. Backend crea o reutiliza el `case` asociado al `case_event`
3. Backend crea un `pipeline_run` con `status = queued` y `trigger = email`
4. Backend hace POST a Ali (OpenClaw webhook) con el handoff — Ali es quien ejecuta el pipeline
5. Response 202 inmediato al caller (Rachel o el operador)

---

## Webhook hacia Ali

El backend llama a Ali con:
```json
{
  "event": "pipeline.trigger",
  "run_id": "uuid",
  "case_id": "uuid",
  "case_event_id": "uuid",
  "pdf_path": "string",
  "poliza_path": "string | null",
  "origen": "email",
  "fecha_notificacion_asegurador": "ISO datetime | null"
}
```

URL del webhook de Ali: `http://localhost:18789/api/events` (gateway local) o via cron/system event.

---

## Notas

- El endpoint NO ejecuta el pipeline sincrónicamente — solo encola
- Ali puede reportar progreso via Discord #litigios
- Si el pipeline ya corre para ese case_id, responder 409
