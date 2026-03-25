# Working Memory — Ali
**Actualizado:** 2026-03-24 23:00

---

## Contexto inmediato para la próxima sesión

### ✅ Estado estable
- **Backup DB**: ✅ nueve días consecutivos OK (16→24/03, ~228KB/día). No es alerta activa.
- **`main`** — último commit: `5d83946` (chore(ali): nightly extraction 2026-03-23). Sin cambios en 2 días.
- **`development`** tiene 5 commits sobre main pendientes de PR: c654fb4 (DeepAgents), 53387fa (Woz specs), c9e2624 (Edu/Jess), 89dc08f (Lou first-class), 950f604 (canonical naming).

---

## Tareas pendientes

### Alta prioridad
- [ ] **Woz: implementar Rachel→Ali trigger** — `POST /api/v1/pipeline/trigger` + agent_api_key middleware. Spec lista: `docs/specs/woz-spec-rachel-ali-trigger.md`.
- [ ] **Skill email-triage-router-ar iteration-2** — refinamiento disambiguation table (acuerdo vs reclamo_pago cuando hay depósito solicitado) + extracción nro_siniestro desde carátula embebida.
- [ ] **Nuevo PR: development → main** — 5 commits pendientes (c654fb4, 53387fa, c9e2624, 89dc08f, 950f604).

### Media prioridad
- [ ] **Woz: pipeline observability** — `GET /api/v1/cases/:id/pipeline`. Spec: `docs/specs/woz-spec-pipeline-observability.md`.
- [ ] **Definir pipeline de extracción de agreements** — módulo existe (migration 018), `extraction_status` siempre `pending`. ¿Qué agente extrae datos del body del acuerdo?
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

## Contexto arquitectural — estado real del repo (2026-03-24)

### Pipeline (ORCHESTRATION.md)
```
Rachel → Donna (Ingestion) → Mike (Extraction) → Edu (Triage x3) → Jess (Drafting) → Review (Red Team) → Abogado
```

### Agentes en development (no mergeados a main aún)
- **Lou** — primer agente first-class de pipeline-canon.md (rama development). Pendiente PR.

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
- `main` — sin cambios desde 2026-03-23 23:00 (último nightly commit)
- `development` — 5 commits sobre main, pendiente PR
- `feature/agreements-ux` — rama adicional de Woz (UI acuerdos)
- `sesion/2025-12-23` — 13 skills + ORCHESTRATION.md. PR no abierto.

### Módulo Agreements (mergeado — PR #24, 2026-03-15)
- Migration 018: tabla `agreements` (case_event_id, case_id, agreement_type SMALLINT 1=mediacion/2=juicio, claim_number, beneficiary, concept, amount, due_date, extraction_status SMALLINT 1=pending/2=completed/3=failed, extraction_raw JSONB)
- Auto-creación: al aprobar event tipo acuerdo (mail_type=4), `case_service` crea el registro en extraction_status=pending.
- Frontend: `/acuerdos` con tabla paginada.
- Agent endpoints: `GET /agents/agreements/pending` + `PATCH /agents/agreements/:id` (para Donna).

### Skill email-triage-router-ar (mergeada — PR #26, 2026-03-17)
- En `skills/email-triage-router-ar/SKILL.md` (171 líneas) + `references/event-types.md` (196 líneas).
- Iteration-1 benchmark: 0.81 mean pass rate (vs 0.58 sin skill, +0.23 delta).
- ⚠️ Debilidad: disambiguation table `acuerdo vs reclamo_pago` + extracción nro_siniestro desde carátula embebida.

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
- Backup DB: ✅ funcionando, racha de 9 días (16→24/03, ~228KB/día)

### Model routing (Juan, 2026-03-06)
- Planeamiento/complejo → Opus
- Ejecución/diario → Sonnet
- Heartbeats/sencillos → Haiku
