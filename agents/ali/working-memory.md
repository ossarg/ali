# Working Memory — Ali
**Actualizado:** 2026-03-17 23:00

---

## Contexto inmediato para la próxima sesión

### ✅ Cambio de estado relevante
- **PR #26 mergeado** (development → main, 20:06 hoy). `main` ya tiene: módulo agreements, skill email-triage-router-ar, AgentOrgChart/Panel, CommandPalette, KanbanBoard, nuevas páginas UI.
- **Backup DB restaurado** — funcionando desde 16/03. Ya no es alerta activa.
- **`development` tiene commits no mergeados a main** — c654fb4 (DeepAgents), 53387fa (Woz specs), c9e2624 (Edu/Jess), 7fe615f (orchestration-pipeline-runner skill). Abrir nuevo PR pronto.

---

## Tareas pendientes

### Alta prioridad
- [ ] **Woz: implementar Rachel→Ali trigger** — `POST /api/v1/pipeline/trigger` + agent_api_key middleware. Spec lista: `docs/specs/woz-spec-rachel-ali-trigger.md`.
- [ ] **Skill email-triage-router-ar iteration-2** — refinamiento disambiguation table (acuerdo vs reclamo_pago cuando hay depósito solicitado) + extracción nro_siniestro desde carátula embebida.
- [ ] **Nuevo PR: development → main** — 4+ commits pendientes (c654fb4, 53387fa, c9e2624, 7fe615f y posiblemente más).

### Media prioridad
- [ ] **Woz: implementar pipeline observability** — `GET /api/v1/cases/:id/pipeline`. Spec: `docs/specs/woz-spec-pipeline-observability.md`.
- [ ] **Definir pipeline de extracción de agreements** — módulo existe (migration 018), `extraction_status` siempre `pending`. ¿Qué agente extrae los datos del body del acuerdo?
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

## Contexto arquitectural — estado real del repo (2026-03-17)

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
| Ali    | system-audit, orchestration-pipeline-runner |

### Branches activas
- `main` — **actualizada hoy** (PR #26 mergeado, 2026-03-17 20:06) ← rama principal
- `development` — tiene 4+ commits sobre main (c654fb4, 53387fa, c9e2624, 7fe615f + otros Ali) — pendiente PR
- `feature/agreements-ux` — rama adicional de Woz (relacionada con agreements UI)
- `sesion/2025-12-23` — 13 skills + ORCHESTRATION.md. PR no abierto.

### Módulo Agreements (mergeado — PR #24, 2026-03-15)
- Migration 018: tabla `agreements` (case_event_id, case_id, agreement_type SMALLINT 1=mediacion/2=juicio, claim_number, beneficiary, concept, amount, due_date, extraction_status SMALLINT 1=pending/2=completed/3=failed, extraction_raw JSONB)
- Auto-creación: al aprobar event tipo acuerdo (mail_type=4), `case_service` crea el registro en extraction_status=pending.
- Frontend: `/acuerdos` con tabla paginada.
- Agent endpoints: `GET /agents/agreements/pending` + `PATCH /agents/agreements/:id` (para Donna).
- DI container en `internal/di/container.go`.

### Skill email-triage-router-ar (mergeada — PR #26, 2026-03-17)
- En `skills/email-triage-router-ar/SKILL.md` (171 líneas) + `references/event-types.md` (196 líneas).
- Iteration-1 benchmark: 0.81 mean pass rate (vs 0.58 sin skill, +0.23 delta).
- ⚠️ Debilidad conocida: disambiguation table `acuerdo vs reclamo_pago` + extracción nro_siniestro desde carátula embebida.

### Estado webapp (vigente)
- **Activity**: 2 tabs Pendientes/Aprobados, columna siniestro, paginación, pendientes sin siniestro al final
- **ActivityDetail**: layout 2 columnas, body scroll interno, ReviewModal 2 columnas
- **CaseDetail**: adjuntos (ícono + tab Archivos), trazabilidad (solo aprobados), kebab menu editar/eliminar eventos, campo caratula, Póliza en header
- **Claims**: tabla con lookup SISE. FK `claim_id` en `cases` (NULL para todos — linkeo automático no implementado)
- **Acuerdos**: `/acuerdos` con tabla paginada
- **Nuevas páginas** (desde PR #26): `/agents` (AgentOrgChart + configuración umbrales), `/contestaciones` (Kanban por etapas), `/documentos`, `/metrics`
- **Endpoint attachments**: público (antes del grupo JWT)

### Stack técnico
- Backend Go + GORM + PostgreSQL + Redis
- Frontend React + Vite + React Query + Zod
- Docker stack activo en producción (`backend/docker-compose.yml`)
- Auth: JWT real, sesiones persistentes
- SISE integrado: GetClaimByNumber, GetPolicySummary, GetProducerByCode. TTL buffer −60s, retry-on-401.
- Backup DB: ✅ funcionando desde 16/03 (228KB/día)

### Model routing (Juan, 2026-03-06)
- Planeamiento/complejo → Opus
- Ejecución/diario → Sonnet
- Heartbeats/sencillos → Haiku
