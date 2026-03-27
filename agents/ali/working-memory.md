# Working Memory — Ali
**Actualizado:** 2026-03-26 23:00

---

## Contexto inmediato para la próxima sesión

### ✅ Estado estable
- **Backup DB**: ✅ once días consecutivos OK (16→26/03, ~228KB/día). No es alerta activa.
- **`main`** — HEAD: `81074a4` (fix(pipeline): 10-point quality review feedback). **5 commits nuevos hoy** (todos pipeline).
- **`development`** tiene 5 commits sobre main pendientes de PR: c654fb4 (DeepAgents), 53387fa (Woz specs), c9e2624 (Edu/Jess), 89dc08f (Lou first-class), 950f604 (canonical naming).

### 🆕 Cambio mayor: Pipeline Jess refactorizado completamente (26/03)

**Arquitectura nueva** (5 commits en main, 15:29→22:56):

```
pipeline/run-case.md (playbook orquestador Ali)
Step 5: drafting-prep-ar (Haiku) → jess_prep.json [boilerplates inline, ~5k chars]
Step 6a: drafting-draft-a-ar (Sonnet) → draft_a.txt [secciones 1-9, ~25k]  ← PARALELO
Step 6b: drafting-draft-b-ar (Sonnet) → draft_b.txt [secciones 10-22, ~25k] ← PARALELO
Step 6c: scripts/merge_drafts.py → jess_draft.txt [validación auto: ≥35k, 1×SERÁ JUSTICIA]
Step 7: drafting-format-ar / build_docx.py + verify_docx.py → contestacion.docx [8 checks]
Step 8: review-style-quality-ar (Lou, Sonnet) → contestacion-revisada.txt + review-lou.md
Step 9: Entrega al abogado
```

**REGLA DE BLOQUEO CRÍTICA**: Si aseguradora en denuncia ≠ Libra Seguros → pipeline se detiene en Step 5. Flag `pipeline_blocked` en jess_prep.json.

**Nuevos skills** (todos en main):
- `drafting-prep-ar` — preparación JSON (Haiku)
- `drafting-draft-ar` — draft unificado legacy (Sonnet, superado por A/B)
- `drafting-draft-a-ar` — secciones 1-9 procesal-defensivo (Sonnet)
- `drafting-draft-b-ar` — secciones 10-22 sustancial-probatorio (Sonnet)
- `drafting-format-ar` + `build_docx.py` + `verify_docx.py` — conversión y verificación
- `review-style-quality-ar` — Lou calidad estilo/formato (Sonnet)

**style-guide-ar.md**: patrón 4-step impugnación de rubros, anti-patrones, attorney notes (COMPLETAR Tipo 1 / NOTA INTERNA Tipo 2), daño moral (argumento quantum no procedencia), Bustamante Alsina (2-3 párrafos), intereses (1 cita Sala fuerte).

**Fixes de calidad aplicados**: ORBIS/LIBRA blocker, negativas sección VIII sin monto x monto, daño moral approach correcto, Bustamante Alsina compacto, filtro Draft A/B del documento, pericia contable subsidiaria, numeración romana consecutiva, correcciones gramaticales (anatocismo, "un elemento esencial").

**Pendiente**: Test pipeline completo end-to-end con un caso real (primer run con arquitectura nueva).

---

## Tareas pendientes

### Alta prioridad
- [ ] **TEST PIPELINE END-TO-END** — primer run real con `pipeline/run-case.md`. Usar caso existente.
- [ ] **Woz: implementar Rachel→Ali trigger** — `POST /api/v1/pipeline/trigger` + agent_api_key middleware. Spec: `docs/specs/woz-spec-rachel-ali-trigger.md`.
- [ ] **Skill email-triage-router-ar iteration-2** — refinamiento disambiguation table (acuerdo vs reclamo_pago cuando hay depósito solicitado) + extracción nro_siniestro desde carátula embebida.
- [ ] **Nuevo PR: development → main** — 5 commits pendientes (c654fb4, 53387fa, c9e2624, 89dc08f, 950f604).

### Media prioridad
- [ ] **Woz: pipeline observability** — `GET /api/v1/cases/:id/pipeline`. Spec: `docs/specs/woz-spec-pipeline-observability.md`.
- [ ] **Extractores de agreements** — `extraction_status` siempre `pending`. ¿Qué agente extrae datos del body del acuerdo?
- [ ] **Trigger Modo 1 en ORCHESTRATION.md** — definir cuándo Ali dispara el pipeline automáticamente.
- [ ] **Resolver #litigios** — canal ID 1478558938352844891, mensajes de Juan no llegan. Pendiente debug.
- [ ] **Actualizar friction-log.md** — qué cambios de infra/config puede hacer Ali vs. Woz.
- [ ] **Verificar prompts Jess con schema Donna** — compatibilidad negativas específicas con output actual de Donna.
- [ ] **Actualizar regressions.md** — guardrail `git log --oneline -10` al inicio de sesión.
- [ ] **Decidir destino archivos untracked** — `pipeline-tests/garcia-c-ramoa/` y `docs/plan-batch-20-demandas.md`.
- [ ] **Branch `sesion/2025-12-23`** — PR aún no abierto.

### Pendientes de Juan
- Skills de todos los agentes para revisar y alinear prompts
- Secciones del template borrador demanda_directa
- Confirmación si `action_type` aplica a mediaciones
- Test del canal #litigios
- Decisión sobre endpoint agent-key para claims / acceso SISE desde pipeline
- Aprobación plan-batch-20-demandas.md
- **Definir quién extrae datos de agreements** (campo extraction_status siempre pending)
- **Validar output del pipeline nuevo** con un caso real

---

## Contexto arquitectural — estado real del repo (2026-03-26)

### Pipeline (ORCHESTRATION.md + run-case.md)
```
Rachel → Donna (Ingestion) → Mike (Extraction) → Edu (Triage x3) → Jess (Prep+DraftA/B+Format) → Lou (Review) → Abogado
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
| Jess   | drafting-prep-ar → drafting-draft-a-ar ‖ drafting-draft-b-ar → drafting-format-ar |
| Lou    | review-style-quality-ar (**NUEVO 26/03**) |
| Review | review-red-team-verifier |
| Ali    | system-audit, orchestration-pipeline-runner |

### Branches activas
- `main` — HEAD: 81074a4 (26/03 22:56)
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
- **Nuevas páginas**: `/agents`, `/contestaciones`, `/documentos`, `/metrics`

### Stack técnico
- Backend Go + GORM + PostgreSQL + Redis
- Frontend React + Vite + React Query + Zod
- Docker stack activo en producción (`backend/docker-compose.yml`)
- Auth: JWT real, sesiones persistentes
- SISE integrado: GetClaimByNumber, GetPolicySummary, GetProducerByCode. TTL buffer −60s, retry-on-401.
- Backup DB: ✅ funcionando, racha de 11 días (16→26/03, ~228KB/día)

### Model routing (global)
- Planeamiento/complejo → Opus
- Ejecución/diario → Sonnet
- Heartbeats/sencillos → Haiku
- Pipeline específico: Donna/Mike/Edu/Prep → Haiku; Draft/Review → Sonnet; Format/Verify → Local (sin LLM)
