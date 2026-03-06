# Spec para Woz — PoC Pipeline

> Preparado por Ali | 2026-03-06
> Objetivo: poder disparar el pipeline manualmente con un PDF y ver el output en el dashboard.

---

## Contexto

El pipeline de Ali procesa una demanda judicial en 5 etapas (Donna → Mike → Edu → Jess → Review). Cada etapa produce un JSON estructurado. Para testear el PoC necesitamos:

1. Un endpoint para subir el PDF y disparar el pipeline manualmente (reemplaza a Rachel en el PoC)
2. El dashboard mostrando el estado y outputs del pipeline por caso

---

## 1. Endpoint — Upload de demanda y trigger del pipeline

### `POST /api/v1/cases/ingest`

Recibe el PDF de la demanda, crea el caso en DB, y dispara el pipeline.

**Auth:** JWT requerido. Capability: `cases:write`

**Request:** `multipart/form-data`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `demanda_pdf` | file | ✅ | PDF de la demanda |
| `poliza_pdf` | file | ❌ | PDF de la póliza (si está disponible) |
| `notas` | string | ❌ | Notas adicionales del operador |

**Response `201`:**
```json
{
  "case_id": "uuid",
  "pipeline_stage": "ingesta",
  "message": "Caso creado. Pipeline iniciado."
}
```

**Comportamiento:**
1. Guarda los PDFs en storage (path local por ahora, S3 en producción)
2. Crea el registro en tabla `cases` con `pipeline_stage = 1` (ingesta)
3. Dispara el pipeline (async — no bloquea la respuesta)

---

## 2. Cambios en tabla `cases`

Agregar columnas para persistir los outputs del pipeline:

```sql
-- Migration 005
ALTER TABLE cases ADD COLUMN IF NOT EXISTS donna_output   JSONB NULL;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS mike_output    JSONB NULL;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS edu_output     JSONB NULL;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS jess_output    JSONB NULL;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS review_output  JSONB NULL;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS borrador_url   TEXT NULL;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS triage_score   SMALLINT NULL;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS triage_label   SMALLINT NULL; -- 1=baja, 2=media, 3=alta
ALTER TABLE cases ADD COLUMN IF NOT EXISTS pipeline_flags JSONB NULL;    -- marcas de revisión humana
ALTER TABLE cases ADD COLUMN IF NOT EXISTS demanda_url    TEXT NULL;      -- path del PDF de demanda
ALTER TABLE cases ADD COLUMN IF NOT EXISTS poliza_url     TEXT NULL;      -- path del PDF de póliza
```

---

## 3. Endpoint — Detalle de caso con pipeline outputs

### `GET /api/v1/cases/:id/pipeline`

Devuelve el estado completo del pipeline para un caso.

**Auth:** JWT requerido. Capability: `cases:read`

**Response `200`:**
```json
{
  "case_id": "uuid",
  "pipeline_stage": "triage",
  "pipeline_stage_label": "triage",
  "donna_output": { ... },
  "mike_output": { ... },
  "edu_output": { ... },
  "jess_output": { ... },
  "review_output": { ... },
  "borrador_url": "string | null",
  "triage_score": 72,
  "triage_label": "media",
  "pipeline_flags": {
    "requiere_revision_humana": false,
    "motivo": null
  }
}
```

---

## 4. Endpoint — PATCH pipeline stage

### `PATCH /api/v1/cases/:id`

Para que Ali actualice el `pipeline_stage` y otros campos a medida que avanza el pipeline.

**Auth:** JWT requerido. Capability: `cases:write`

**Request body:**
```json
{
  "pipeline_stage": 3,
  "triage_score": 72,
  "triage_label": 2,
  "donna_output": { ... },
  "mike_output": { ... },
  "edu_output": { ... },
  "jess_output": { ... },
  "review_output": { ... },
  "borrador_url": "string",
  "pipeline_flags": { "requiere_revision_humana": true, "motivo": "confidence baja en tipo_intervencion" }
}
```

Todos los campos son opcionales — solo se actualizan los que se envían.

---

## 5. Dashboard — Vista de pipeline por caso

En la webapp, en el detalle de un caso (`/cases/:id`), agregar una sección "Pipeline" que muestre:

### Estado visual del pipeline

```
Donna ✅  →  Mike ✅  →  Edu ⏳  →  Jess ⬜  →  Review ⬜
```

Cada etapa: ✅ completada | ⏳ en proceso | ⚠️ requiere revisión | ❌ bloqueada | ⬜ pendiente

### Por etapa completada, mostrar:

**Donna:**
- Tipo de documento
- Resumen narrativo
- Señales de atención (si las hay)
- Estado: completo / bloqueante

**Mike:**
- Carátula, expediente, tribunal
- Tipo de intervención de la aseguradora
- Monto total reclamado + rubros
- Días restantes para contestar (con color: rojo < 3 días, naranja 3-5, verde > 5)
- Confidence general

**Edu:**
- Score de riesgo (0-100) + badge de prioridad (alta/media/baja)
- Dictamen de cobertura (COBERTURA / NO_COBERTURA / PARCIAL / INDETERMINADO)
- Señal de viabilidad (🟢 🟡 🔴)
- Exposición económica: mejor caso / probable / peor caso

**Jess:**
- Borrador disponible: link para descargar o ver el texto
- Secciones que requieren revisión (listado con prioridad)

**Review:**
- Resultado: aprobado / corregir / rechazar
- Issues encontrados (si los hay)

### Regla de display

Solo mostrar los datos de una etapa si `pipeline_stage` llegó a esa etapa o la superó. No mostrar placeholders vacíos para etapas no ejecutadas.

---

## Prioridad de implementación

| Item | Prioridad |
|------|-----------|
| Migration 005 (columnas pipeline) | P0 |
| `POST /api/v1/cases/ingest` | P0 |
| `PATCH /api/v1/cases/:id` | P0 |
| `GET /api/v1/cases/:id/pipeline` | P1 |
| Dashboard — vista de pipeline | P1 |

---

## Notas

- El pipeline corre async. El frontend puede hacer polling a `GET /api/v1/cases/:id` y ver el `pipeline_stage` cambiar, o implementar WebSocket más adelante.
- Los PDFs se guardan en `/storage/cases/:case_id/` por ahora. Path configurable por env var.
- Swagger obligatorio para todos los endpoints nuevos antes de commitear.
