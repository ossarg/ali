---
name: pipeline-batch-runner
description: "Protocolo para ejecutar el pipeline de Ali sobre un batch de demandas (15-20 PDFs) con checkpointing, concurrencia controlada y reporte de progreso. Usar cuando se inicia un batch de procesamiento masivo."
---

# Pipeline Batch Runner

## Arquitectura

- **Coordinador**: Ali (sesión principal) — gestiona la cola, no procesa demandas directamente
- **Workers**: sub-agentes aislados vía `sessions_spawn` — uno por demanda
- **Concurrencia**: pool de 3 workers simultáneos (Pi 5 + rate limits Anthropic)
- **Estado**: `pipeline-tests/batch/batch-state.json` — fuente de verdad, nunca en RAM
- **Outputs**: `pipeline-tests/{case_id}/output.json` por caso

## Flujo completo

### 1. Pre-flight (SIEMPRE primero)

```bash
bash scripts/preflight.sh
```

Bloquear si falla. No iniciar batch con errores.

### 2. Inicializar batch desde directorio de PDFs

```bash
bash scripts/batch-init.sh /path/to/pdfs/
```

Produce `batch-state.json` con todos los casos en `pending`.

### 3. Verificar estado

```bash
bash scripts/batch-status.sh
```

### 4. Iniciar el batch (Ali ejecuta este loop)

```
MIENTRAS haya casos pending o running:
  activos = casos con status="running"
  
  SI activos < 3:
    siguiente = primer caso con status="pending"
    SI existe siguiente:
      bash scripts/batch-step-update.sh {id} donna running
      sessions_spawn(
        task: "Correr pipeline completo para caso {id}. PDF: {pdf_path}. Output dir: {output_dir}. Seguir SKILL.md pipeline-single-run.",
        mode: "run",
        runtime: "subagent"
      )
  
  ESPERAR 30s
  VERIFICAR workers completados
  ACTUALIZAR batch-state.json
  REPORTAR progreso en #litigios cada 5 casos

FIN: bash scripts/batch-status.sh
```

### 5. Checkpoint por step (cada sub-agente llama esto)

```bash
# Al iniciar cada agente:
bash scripts/batch-step-update.sh {case_id} {agent} running

# Al completar exitosamente:
bash scripts/batch-step-update.sh {case_id} {agent} ok

# Al fallar:
bash scripts/batch-step-update.sh {case_id} {agent} failed "descripción del error"
```

### 6. Output por caso

Cada sub-agente escribe en `pipeline-tests/{case_id}/`:
```
{case_id}/
├── donna_output.json
├── mike_output.json
├── edu_output.json
├── jess_output.json
├── lou_output.json
└── output.json          ← resumen ejecutivo del caso
```

`output.json` schema:
```json
{
  "case_id": "string",
  "pdf_path": "string",
  "status": "completed | failed | stopped",
  "pipeline_stage_reached": "donna | mike | edu | jess | lou",
  "stop_reason": "string | null",
  "durations_ms": { "donna": 0, "mike": 0, "edu": 0, "jess": 0, "lou": 0 },
  "confidence_scores": { "donna": 0.0, "mike": 0.0, "edu": 0.0, "lou": 0.0 },
  "lou_score": 0,
  "lou_resultado": "aprobar | corregir_y_reenviar | rechazar_y_rehacer | escalar_a_humano | null",
  "secciones_requieren_revision": [],
  "completed_at": "ISO datetime"
}
```

## Manejo de errores

| Escenario | Acción |
|-----------|--------|
| Sub-agente no responde (timeout >30min) | Marcar como `failed`, continuar con siguiente |
| Donna marca `bloqueante` | Marcar caso como `stopped`, registrar motivo, continuar |
| Confidence < 0.5 en cualquier step | Marcar step como `failed`, caso como `stopped` |
| Lou: `rechazar_y_rehacer` | Marcar como `completed` con flag `requires_human_review` |
| Error de escritura en output.json | Reintentar 1 vez, luego `failed` |

## Reporte de progreso (cada 5 casos o al finalizar)

Ali postea en #litigios:
```
📊 Batch update — {completados}/{total} | {running} corriendo | {failed} fallidos
✅ {case_id}: Lou={score}/100 | {resultado}
✅ {case_id}: Lou={score}/100 | {resultado}
...
```

## Reglas de oro

- **Nunca leer MDs en el hot path** — solo JSON via scripts
- **Un sub-agente = un caso** — nunca mezclar dos demandas en el mismo sub-agente
- **Siempre escribir checkpoint antes de siguiente step** — si falla la escritura, no avanzar
- **Concurrencia máxima: 3** — no modificar sin confirmar RAM disponible con `preflight.sh`
- **Respetar rate limits**: si recibís 429 de Anthropic, pausar 60s antes de relanzar worker
