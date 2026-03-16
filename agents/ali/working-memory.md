# Working Memory — Ali
**Actualizado:** 2026-03-15 23:00

---

## Contexto inmediato para la próxima sesión

### ⚠️ Alertas activas
- **Backup DB roto** — `libra_legal_20260314` y `libra_legal_20260315` son de 20 bytes (vacíos). Último backup real: 2026-03-13. Comunicar a Juan/Woz al inicio de la próxima sesión.
- **feature/agreements sin mergear** — 4 commits de Woz del 15/03 están en `feature/agreements`, no en `development` ni `main`.

---

## Tareas pendientes

### Alta prioridad
- [ ] **Fix script de backup DB** — dos días sin backup real. Revisar el script cron con Woz.
- [ ] **Woz: implementar Rachel→Ali trigger** — `POST /api/v1/pipeline/trigger` + agent_api_key middleware. Spec lista: `docs/specs/woz-spec-rachel-ali-trigger.md`.
- [ ] **Merge `feature/agreements` → `development` → `main`** — 4 commits nuevos (Woz 2026-03-15); `development` tenía 12 commits acumulados.
- [ ] **Definir pipeline de extracción de agreements** — módulo creado (migration 018), pero `extraction_status` queda en `pending`. ¿Qué agente extrae los datos del body del acuerdo?

### Media prioridad
- [ ] **Woz: implementar pipeline observability** — `GET /api/v1/cases/:id/pipeline`. Spec: `docs/specs/woz-spec-pipeline-observability.md`.
- [ ] **Crear `memory/bank/decisions.md`** y `memory/bank/open-questions.md`.
- [ ] **Trigger Modo 1 en ORCHESTRATION.md** — definir cuándo Ali dispara el pipeline automáticamente.
- [ ] **Resolver #litigios** — canal ID 1478558938352844891, mensajes de Juan no llegan. Pendiente debug.
- [ ] **Actualizar friction-log.md** — qué cambios de infra/config puede hacer Ali vs. Woz.
- [ ] **Capturar conocimiento legal en long-term-memory.md** — patrones contestaciones argentinas (9 PDFs).
- [ ] **Verificar prompts Jess con schema Donna** — compatibilidad negativas específicas con output actual de Donna.
- [ ] **Actualizar regressions.md** — guardrail `git log --oneline -10` al inicio de sesión.
- [ ] **Decidir destino archivos untracked** — `pipeline-tests/garcia-c-ramoa/` y `docs/plan-batch-20-demandas.md`.

### Pendientes de Juan
- Skills de todos los agentes para revisar y alinear prompts
- Secciones del template borrador demanda_directa
- Confirmación si `action_type` aplica a mediaciones
- Test del canal #litigios
- Decisión sobre endpoint agent-key para claims / acceso SISE desde pipeline
- Branch `sesion/2025-12-23` — PR aún no abierto
- Aprobación plan-batch-20-demandas.md
- **Definir quién extrae datos de agreements** (campo extraction_status siempre pending hasta que el pipeline lo complete)

---

## Contexto arquitectural — estado real del repo (2026-03-15)

### Pipeline (ORCHESTRATION.md)
```
Rachel → Donna (Ingestion) → Mike (Extraction) → Edu (Triage x3) → Jess (Drafting) → Review (Red Team) → Abogado
```

### Asignación de skills por agente
| Agente | Skills |
|--------|--------|
| Rachel | email-triage-router-ar |
| Donna  | ingestion-document-summary-ar, ingestion-formal-review-ar |
| Mike   | extraction-claim-summary-ar, extraction-policy-summary-ar |
| Edu    | triage-risk-assessment-ar, triage-coverage-opinion-ar, triage-viability-check-ar |
| Jess   | drafting-answer-ar, drafting-coverage-denial-ar |
| Review | review-red-team-verifier |
| Ali    | system-audit |

### Branches activas
- `feature/agreements` — rama actual de Woz (4 commits 2026-03-15, no mergeada)
- `development` — 12 commits sobre `main` (desde 2026-03-11, sin cambios desde entonces)
- `sesion/2025-12-23` — 13 skills + ORCHESTRATION.md. PR no abierto.
- `main` — última actualización 2026-03-09

### Módulo Agreements (nuevo 2026-03-15)
- Migration 018: tabla `agreements` (case_event_id, case_id, agreement_type SMALLINT 1=mediacion/2=juicio, claim_number, beneficiary, concept, amount, due_date, extraction_status SMALLINT 1=pending/2=completed/3=failed, extraction_raw JSONB)
- Auto-creación: al aprobar event tipo acuerdo (mail_type=4), `case_service` crea el registro en extraction_status=pending.
- Frontend: `/acuerdos` con tabla paginada, sidebar item.
- DI container extraído a `internal/di/container.go`.

### Estado webapp (vigente)
- **Activity**: 2 tabs Pendientes/Aprobados, columna siniestro, paginación, pendientes sin siniestro al final
- **ActivityDetail**: layout 2 columnas, body scroll interno, ReviewModal 2 columnas
- **CaseDetail**: adjuntos (ícono + tab Archivos), trazabilidad (solo aprobados), kebab menu editar/eliminar eventos, campo caratula
- **Claims**: tabla con lookup SISE. FK `claim_id` en `cases` (NULL para todos — linkeo automático no implementado)
- **Acuerdos**: nuevo `/acuerdos` (2026-03-15)
- **Endpoint attachments**: público (antes del grupo JWT)

### Stack técnico
- Backend Go + GORM + PostgreSQL + Redis
- Frontend React + Vite + React Query + Zod
- Docker stack activo en producción (`backend/docker-compose.yml`)
- Auth: JWT real, sesiones persistentes
- SISE integrado: GetClaimByNumber, GetPolicySummary, GetProducerByCode. TTL buffer −60s, retry-on-401.

### Model routing (Juan, 2026-03-06)
- Planeamiento/complejo → Opus
- Ejecución/diario → Sonnet
- Heartbeats/sencillos → Haiku

### Cambios arquitecturales importantes vigentes
- PR #11 (Woz 2026-03-07): Redis, SISE, tabla `claims`, migrations 007+008.
- Rachel v2 activa: process_mails_v2.py, body_clean, clasificación LLM Haiku, title+description generados.
- case_events: 11 tipos (0-8 previos + apertura=9, apelacion=10, cierre=11).
- Fix duplicación pagos re-sync SISE (2026-03-08).
- Dry run García: Lou score 79/100, `corregir_y_reenviar`, jess_output_v2 con correcciones. Archivo: `pipeline-tests/garcia-c-ramoa/`.
