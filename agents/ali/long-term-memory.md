# Long-Term Memory

_Tres capas: Constitutional (nunca expira), Strategic (trimestral), Operational (30 días sin uso → archivo)._
_Metadata: [trust:0-1|src:direct/observed/inferred|used:FECHA|hits:N]_

---

## Constitutional — Reglas duras, nunca expiran

- [trust:1.0|src:direct|used:2026-03-17|hits:8] NUNCA pushear a `main`. Branches por sesión/tópico.
- [trust:1.0|src:direct|used:2026-03-17|hits:8] NUNCA pushear tokens, API keys o variables de entorno al repo.
- [trust:1.0|src:direct|used:2026-03-17|hits:8] El canal `#rachel` es exclusivo de Rachel. Ali sin acceso.
- [trust:1.0|src:direct|used:2026-03-17|hits:8] Ninguna acción con consecuencias legales sin validación humana.
- [trust:1.0|src:direct|used:2026-03-17|hits:8] Safety gate: preguntar antes de cambios que afecten runtime, datos, costo, auth, routing o outputs externos.

---

## Strategic — Estado del proyecto, estable por meses

- [trust:1.0|src:direct|used:2026-03-17|hits:10] Repo: ossarg/ali en GitHub. Local: /home/legales/ali.
- [trust:1.0|src:direct|used:2026-03-17|hits:9] Equipo: Nacho (lead, infra, sistemas Libra), Juan (frontend/arquitectura), Ali (coordinador), Woz (backend Go + infra).
- [trust:1.0|src:direct|used:2026-03-17|hits:9] Agentes activos: Ali (canal #ali, #general) y Rachel (canal #rachel, procesamiento de mails legales).
- [trust:1.0|src:direct|used:2026-03-17|hits:8] Coordinador opera en modo síncrono (runtime) y asíncrono (auditor) — un solo agente, dos modos.
- [trust:1.0|src:direct|used:2026-03-17|hits:8] Sub-agentes reciben contexto mínimo (handoffs JSON). No acceden al documento completo.
- [trust:1.0|src:direct|used:2026-03-17|hits:8] Módulos pericias, oficios y SSN son Fase 4, independientes del pipeline principal.
- [trust:0.9|src:direct|used:2025-12-23|hits:1] Backend del PoC a definir con Nacho. Frontend: webapp React en docs/webapp-poc/.

### Stack técnico (actualizado 2026-03-17)
- [trust:1.0|src:observed|used:2026-03-17|hits:4] Redis incorporado al stack desde PR #11 (requerido para cache de token SISE).
- [trust:1.0|src:observed|used:2026-03-17|hits:4] SISE integrado: cliente Go con 3 queries (Claim, Policy, Producer). Endpoint base: `https://sise-consultas.libraseguros.com.ar/Sise3GBELibraCoreprodConsultas`.
- [trust:1.0|src:observed|used:2026-03-17|hits:4] Tabla `claims` (migration 007) + FK `claim_id` en `cases` (migration 008). Linkeo automático no implementado aún.
- [trust:1.0|src:observed|used:2026-03-17|hits:4] Endpoints claims: GET /api/v1/claims, GET /api/v1/claims/lookup?nro_stro=X, POST /api/v1/claims. Acceso solo via JWT de usuario — no hay endpoint agent-key aún.
- [trust:1.0|src:observed|used:2026-03-15|hits:1] Endpoint /api/v1/attachments público (registrado antes del grupo JWT) — accesible desde browser sin conflicto de auth (desde 2026-03-08).
- [trust:1.0|src:observed|used:2026-03-15|hits:2] Rachel v2 activa: process_mails_v2.py con body_clean, adjuntos, clasificación LLM (Claude Haiku, 1 llamada/mail), title+description generados por LLM en case_events.
- [trust:1.0|src:observed|used:2026-03-15|hits:2] case_events soporta 11 tipos: 0-8 previos + apertura(9), apelacion(10), cierre(11). Editar/eliminar vía kebab menu.
- [trust:1.0|src:observed|used:2026-03-15|hits:2] CaseDetail: tab Archivos (adjuntos), trazabilidad solo aprobados, campo caratula en cases.
- [trust:1.0|src:observed|used:2026-03-15|hits:2] Activity: 2 tabs (Pendientes/Aprobados), columna siniestro, paginación. Pendientes sin siniestro van al final.
- [trust:1.0|src:observed|used:2026-03-17|hits:2] Módulo Agreements implementado y mergeado a main (PR #24, 2026-03-15). Tabla `agreements` con FK case_event_id + case_id. Auto-creación en pending al aprobar evento tipo acuerdo (mail_type=4). Extracción de datos por pipeline: pendiente.
- [trust:1.0|src:observed|used:2026-03-17|hits:2] DI container extraído a `internal/di/container.go` (refactor 2026-03-15). main.go ahora es boot-only.
- [trust:1.0|src:observed|used:2026-03-21|hits:4] ✅ Script backup DB restaurado desde 2026-03-16. Backups 14/03 y 15/03 perdidos (20 bytes vacíos). Racha actual: 16→21/03 (seis días consecutivos ~223KB). Último backup válido anterior al fallo: libra_legal_20260313_0300.sql.gz (227618 bytes).
- [trust:1.0|src:observed|used:2026-03-09|hits:1] Docker stack en producción: docker-compose activo = `backend/docker-compose.yml`. El raíz fue renombrado a `docker-compose.yml.bak` (2026-03-09, confirmado en main 2026-03-17).
- [trust:1.0|src:observed|used:2026-03-09|hits:1] Auth JWT real: AuthContext usa authService.login(), token persistido en localStorage. Mock hardcodeado eliminado el 2026-03-09.
- [trust:1.0|src:observed|used:2026-03-09|hits:1] VITE_API_URL vacío en producción → axios usa proxy Vite (requests relativas al origen). No hardcodear URL del backend.
- [trust:1.0|src:observed|used:2026-03-09|hits:1] CaseEventSchema usa nullish() en todos los campos opcionales — el backend Go puede devolver null.
- [trust:1.0|src:observed|used:2026-03-17|hits:1] Skill email-triage-router-ar (Rachel): iteration-1 benchmark — 0.81 mean pass rate con skill vs 0.58 sin skill (+0.23 delta). 3 evals: sentencia (100%), embargo (83%), acuerdo-ambiguo (60%). Debilidad: tabla disambiguation acuerdo vs reclamo_pago necesita refinamiento. Skill en main desde PR #26 (2026-03-17).
- [trust:1.0|src:observed|used:2026-03-17|hits:1] PR #26 mergeado (development → main, 2026-03-17 20:06). Incorpora: AgentOrgChart, AgentDetailPanel, CommandPalette, KanbanBoard, LiveActivityFeed, PipelineStepper, /agents, /contestaciones, /documentos pages nuevas; skill email-triage-router-ar + eval workspace; diario Ali 2026-03-09 en main.
- [trust:1.0|src:observed|used:2026-03-09|hits:1] docs/design-system.md creado (345 líneas, 2026-03-09).

---

## Operational — Contexto activo, se archiva a los 30 días sin uso

- [trust:1.0|src:direct|used:2026-03-21|hits:8] Branch `sesion/2025-12-23`: 13 skills + ORCHESTRATION.md mergeados. PR aún no abierto. Branch activa secundaria.
- [trust:1.0|src:direct|used:2025-12-23|hits:1] Rachel configurada con bot propio de Discord. Pendiente prueba en #rachel.
- [trust:0.8|src:observed|used:2025-12-23|hits:1] Loop 6 del artículo de AtlasForge: irrelevante según Juan.
- [trust:1.0|src:direct|used:2025-12-23|hits:1] Loops 1-5 implementados. Loops 7-9 en Fase B/C.
- [trust:1.0|src:observed|used:2026-03-21|hits:18] Actividad sin sesión humana con Ali: miércoles, jueves, fines de semana y viernes exclusivamente Woz/Nacho. Ali solo corre en crons.
- [trust:1.0|src:direct|used:2026-03-21|hits:8] Model routing: Opus → planeamiento/complejo; Sonnet → ejecución/diario; Haiku → heartbeats/sencillos.
- [trust:1.0|src:direct|used:2026-03-21|hits:8] Pipeline: Rachel → Donna (Ingestion) → Mike (Extraction) → Edu (Triage x3) → Jess (Drafting) → Review (Red Team) → Abogado.
- [trust:1.0|src:direct|used:2026-03-21|hits:8] Canal #litigios = ID 1478558938352844891. Mensajes de Juan no llegan a Ali — pendiente debug.
- [trust:1.0|src:observed|used:2026-03-17|hits:2] feature/agreements mergeado a main (PR #24, 2026-03-15). feature/agreements-ux existe como branch adicional.
- [trust:1.0|src:observed|used:2026-03-09|hits:2] fix duplicación pagos en re-sync SISE aplicado (2026-03-08). Pagos ya no se duplican al re-sincronizar siniestros.
- [trust:1.0|src:observed|used:2026-03-21|hits:4] development tiene commits que AÚN NO están en main: c654fb4 (DeepAgents analysis), 53387fa (Woz specs), c9e2624 (Edu/Jess prompts), 89dc08f (Lou como agente first-class + pipeline-canon.md), 950f604 (canonical naming). Pendiente nuevo PR development → main.
