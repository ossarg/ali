# Spec: Pipeline Observability
> Para Woz — backend implementation spec

## Objetivo

Registrar en DB cada ejecución del pipeline y cada paso por agente, para que la webapp muestre un timeline del caso y Ali pueda auditar corridas.

---

## Nuevas tablas

### `pipeline_runs`

```sql
CREATE TABLE pipeline_runs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    status      TEXT NOT NULL DEFAULT 'running',  -- running | completed | stopped | failed
    trigger     TEXT NOT NULL DEFAULT 'manual',   -- manual | rachel | api
    started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pipeline_runs_case_id ON pipeline_runs(case_id);
```

### `pipeline_steps`

```sql
CREATE TABLE pipeline_steps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id          UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
    agent           TEXT NOT NULL,  -- donna | mike | edu | jess | lou
    skill           TEXT,           -- e.g. ingestion-document-summary-ar
    status          TEXT NOT NULL DEFAULT 'running',  -- running | completed | stopped | failed
    decision        TEXT,           -- continuar | bloqueante | aprobar | corregir_y_reenviar | rechazar_y_rehacer | escalar_a_humano | null
    confidence      FLOAT,          -- overall_confidence del agente (0.0-1.0)
    duration_ms     INTEGER,        -- ms de procesamiento
    error_message   TEXT,           -- si status = failed
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pipeline_steps_run_id ON pipeline_steps(run_id);
```

---

## Endpoints

### `GET /api/v1/cases/:id/pipeline`

Retorna el timeline de pipeline para un caso.

**Response:**
```json
{
  "case_id": "uuid",
  "runs": [
    {
      "id": "uuid",
      "status": "completed",
      "trigger": "manual",
      "started_at": "2026-03-11T15:00:00Z",
      "completed_at": "2026-03-11T15:51:00Z",
      "duration_ms": 3060000,
      "steps": [
        {
          "id": "uuid",
          "agent": "donna",
          "skill": "ingestion-document-summary-ar",
          "status": "completed",
          "decision": "continuar",
          "confidence": 0.91,
          "duration_ms": 87000,
          "started_at": "2026-03-11T15:00:00Z",
          "completed_at": "2026-03-11T15:01:27Z"
        },
        {
          "id": "uuid",
          "agent": "mike",
          "skill": "extraction-claim-summary-ar",
          "status": "completed",
          "decision": null,
          "confidence": 0.82,
          "duration_ms": 134000,
          "started_at": "2026-03-11T15:01:27Z",
          "completed_at": "2026-03-11T15:03:41Z"
        }
      ]
    }
  ]
}
```

---

## Cómo Ali escribe estos registros

Ali crea el `pipeline_run` al iniciar el pipeline, y crea un `pipeline_step` por cada agente — abriendo con `status = running` y cerrando con `status = completed` + `decision` + `confidence` + `duration_ms`. Ali llama directamente al backend API para esto.

No necesita output completo aquí — solo el resumen ejecutivo por step. Los outputs completos van en `pipeline_outputs`.
