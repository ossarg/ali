# Long-Term Memory

_Tres capas: Constitutional (nunca expira), Strategic (trimestral), Operational (30 días sin uso → archivo)._
_Metadata: [trust:0-1|src:direct/observed/inferred|used:FECHA|hits:N]_

---

## Constitutional — Reglas duras, nunca expiran

- [trust:1.0|src:direct|used:2026-03-26|hits:9] NUNCA pushear a `main`. Branches por sesión/tópico.
- [trust:1.0|src:direct|used:2026-03-26|hits:9] NUNCA pushear tokens, API keys o variables de entorno al repo.
- [trust:1.0|src:direct|used:2026-03-26|hits:9] El canal `#rachel` es exclusivo de Rachel. Ali sin acceso.
- [trust:1.0|src:direct|used:2026-03-26|hits:9] Ninguna acción con consecuencias legales sin validación humana.
- [trust:1.0|src:direct|used:2026-03-26|hits:9] Safety gate: preguntar antes de cambios que afecten runtime, datos, costo, auth, routing o outputs externos.

---

## Strategic — Estado del proyecto, estable por meses

- [trust:1.0|src:direct|used:2026-03-26|hits:11] Repo: ossarg/ali en GitHub. Local: /home/legales/ali.
- [trust:1.0|src:direct|used:2026-03-26|hits:10] Equipo: Nacho (lead, infra, sistemas Libra), Juan (frontend/arquitectura), Ali (coordinador), Woz (backend Go + infra).
- [trust:1.0|src:direct|used:2026-03-26|hits:10] Agentes activos: Ali (canal #ali, #general) y Rachel (canal #rachel, procesamiento de mails legales).
- [trust:1.0|src:direct|used:2026-03-26|hits:9] Coordinador opera en modo síncrono (runtime) y asíncrono (auditor) — un solo agente, dos modos.
- [trust:1.0|src:direct|used:2026-03-26|hits:9] Sub-agentes reciben contexto mínimo (handoffs JSON). No acceden al documento completo.
- [trust:1.0|src:direct|used:2026-03-26|hits:9] Módulos pericias, oficios y SSN son Fase 4, independientes del pipeline principal.
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
- [trust:1.0|src:observed|used:2026-03-26|hits:9] ✅ Script backup DB restaurado desde 2026-03-16. Backups 14/03 y 15/03 perdidos (20 bytes vacíos). Racha actual: 16→26/03 (once días consecutivos, 223→228KB). Último backup: libra_legal_20260326_0300.sql.gz (228205 B).
- [trust:1.0|src:observed|used:2026-03-09|hits:1] Docker stack en producción: docker-compose activo = `backend/docker-compose.yml`. El raíz fue renombrado a `docker-compose.yml.bak` (2026-03-09, confirmado en main 2026-03-17).
- [trust:1.0|src:observed|used:2026-03-09|hits:1] Auth JWT real: AuthContext usa authService.login(), token persistido en localStorage. Mock hardcodeado eliminado el 2026-03-09.
- [trust:1.0|src:observed|used:2026-03-09|hits:1] VITE_API_URL vacío en producción → axios usa proxy Vite (requests relativas al origen). No hardcodear URL del backend.
- [trust:1.0|src:observed|used:2026-03-09|hits:1] CaseEventSchema usa nullish() en todos los campos opcionales — el backend Go puede devolver null.
- [trust:1.0|src:observed|used:2026-03-26|hits:3] Skill drafting-answer-ar (Jess): REESCRITO COMPLETO el 2026-03-25 desde 35 contestaciones reales del equipo Díaz Mariana. 22 secciones (era 13), 3 tipos de caso, 15 boilerplates verbatim, 16 señales condicionales. Targets: 35-55K chars, 30-54 negativas. Commits: 1b83a71 + da853d7 en main. Jess PROMPT.md alineado.
- [trust:1.0|src:observed|used:2026-03-26|hits:1] Pipeline Jess split (2026-03-26, 5 commits): drafting-prep-ar (Haiku, jess_prep.json con boilerplates inline) → drafting-draft-a-ar + drafting-draft-b-ar en PARALELO (Sonnet, secciones 1-9 y 10-22) → merge_drafts.py → drafting-format-ar (local, verify_docx.py 8 checks) → review-style-quality-ar (Lou, Sonnet). REGLA DE BLOQUEO: si aseguradora ≠ Libra, pipeline se detiene en prep. Runner: pipeline/run-case.md. Commits: 4052eea, fb2837a, 24fe5e5, 414cc78, 81074a4.
- [trust:1.0|src:observed|used:2026-03-26|hits:1] style-guide-ar.md: patrón 4-step para impugnación de rubros, anti-patrones, attorney notes (COMPLETAR Tipo 1 / NOTA INTERNA Tipo 2), daño moral approach (argumento quantum no procedencia), Bustamante Alsina (2-3 párrafos clave), intereses (1 cita Sala fuerte). Compartido entre drafting-answer-ar, drafting-prep-ar, drafting-draft-a-ar, drafting-draft-b-ar, review-style-quality-ar.
- [trust:1.0|src:observed|used:2026-03-17|hits:1] Skill email-triage-router-ar (Rachel): iteration-1 benchmark — 0.81 mean pass rate con skill vs 0.58 sin skill (+0.23 delta). 3 evals: sentencia (100%), embargo (83%), acuerdo-ambiguo (60%). Debilidad: tabla disambiguation acuerdo vs reclamo_pago necesita refinamiento. Skill en main desde PR #26 (2026-03-17).
- [trust:1.0|src:observed|used:2026-03-17|hits:1] PR #26 mergeado (development → main, 2026-03-17 20:06). Incorpora: AgentOrgChart, AgentDetailPanel, CommandPalette, KanbanBoard, LiveActivityFeed, PipelineStepper, /agents, /contestaciones, /documentos pages nuevas; skill email-triage-router-ar + eval workspace; diario Ali 2026-03-09 en main.
- [trust:1.0|src:observed|used:2026-03-09|hits:1] docs/design-system.md creado (345 líneas, 2026-03-09).

---

## Operational — Contexto activo, se archiva a los 30 días sin uso

- [trust:1.0|src:direct|used:2026-03-26|hits:13] Branch `sesion/2025-12-23`: 13 skills + ORCHESTRATION.md mergeados. PR aún no abierto. Branch activa secundaria.
- [trust:1.0|src:direct|used:2025-12-23|hits:1] Rachel configurada con bot propio de Discord. Pendiente prueba en #rachel.
- [trust:0.8|src:observed|used:2025-12-23|hits:1] Loop 6 del artículo de AtlasForge: irrelevante según Juan.
- [trust:1.0|src:direct|used:2025-12-23|hits:1] Loops 1-5 implementados. Loops 7-9 en Fase B/C.
- [trust:1.0|src:observed|used:2026-03-26|hits:24] Actividad sin sesión humana con Ali: miércoles, jueves, fines de semana y viernes exclusivamente Woz/Nacho. Ali solo corre en crons. (Excepción: 25/03 miércoles con sesión humana activa — trabajo en Jess/drafting-answer-ar. 26/03 jueves — sesión humana activa, pipeline split.)
- [trust:1.0|src:direct|used:2026-03-26|hits:13] Model routing: Opus → planeamiento/complejo; Sonnet → ejecución/diario; Haiku → heartbeats/sencillos. (Pipeline específico: Haiku=prep/Donna/Mike/Edu, Sonnet=draft/review, Local=format/verify).
- [trust:1.0|src:direct|used:2026-03-26|hits:13] Pipeline: Rachel → Donna (Ingestion) → Mike (Extraction) → Edu (Triage x3) → Jess (Drafting: Prep+DraftA+DraftB+Merge+Format) → Lou (Review style) → Abogado.
- [trust:1.0|src:direct|used:2026-03-26|hits:13] Canal #litigios = ID 1478558938352844891. Mensajes de Juan no llegan a Ali — pendiente debug.
- [trust:1.0|src:observed|used:2026-03-17|hits:2] feature/agreements mergeado a main (PR #24, 2026-03-15). feature/agreements-ux existe como branch adicional.
- [trust:1.0|src:observed|used:2026-03-09|hits:2] fix duplicación pagos en re-sync SISE aplicado (2026-03-08). Pagos ya no se duplican al re-sincronizar siniestros.
- [trust:1.0|src:observed|used:2026-03-25|hits:8] development tiene commits que AÚN NO están en main: c654fb4 (DeepAgents analysis), 53387fa (Woz specs), c9e2624 (Edu/Jess prompts), 89dc08f (Lou como agente first-class + pipeline-canon.md), 950f604 (canonical naming). Pendiente nuevo PR development → main.
