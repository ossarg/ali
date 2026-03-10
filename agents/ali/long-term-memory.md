# Long-Term Memory

_Tres capas: Constitutional (nunca expira), Strategic (trimestral), Operational (30 días sin uso → archivo)._
_Metadata: [trust:0-1|src:direct/observed/inferred|used:FECHA|hits:N]_

---

## Constitutional — Reglas duras, nunca expiran

- [trust:1.0|src:direct|used:2026-03-08|hits:6] NUNCA pushear a `main`. Branches por sesión/tópico.
- [trust:1.0|src:direct|used:2026-03-08|hits:6] NUNCA pushear tokens, API keys o variables de entorno al repo.
- [trust:1.0|src:direct|used:2026-03-08|hits:6] El canal `#rachel` es exclusivo de Rachel. Ali sin acceso.
- [trust:1.0|src:direct|used:2026-03-08|hits:6] Ninguna acción con consecuencias legales sin validación humana.
- [trust:1.0|src:direct|used:2026-03-08|hits:6] Safety gate: preguntar antes de cambios que afecten runtime, datos, costo, auth, routing o outputs externos.

---

## Strategic — Estado del proyecto, estable por meses

- [trust:1.0|src:direct|used:2026-03-08|hits:8] Repo: ossarg/ali en GitHub. Local: /home/legales/ali.
- [trust:1.0|src:direct|used:2026-03-08|hits:7] Equipo: Nacho (lead, infra, sistemas Libra), Juan (frontend/arquitectura), Ali (coordinador), Woz (backend Go + infra).
- [trust:1.0|src:direct|used:2026-03-08|hits:7] Agentes activos: Ali (canal #ali, #general) y Rachel (canal #rachel, procesamiento de mails legales).
- [trust:1.0|src:direct|used:2026-03-08|hits:6] Coordinador opera en modo síncrono (runtime) y asíncrono (auditor) — un solo agente, dos modos.
- [trust:1.0|src:direct|used:2026-03-08|hits:6] Sub-agentes reciben contexto mínimo (handoffs JSON). No acceden al documento completo.
- [trust:1.0|src:direct|used:2026-03-08|hits:6] Módulos pericias, oficios y SSN son Fase 4, independientes del pipeline principal.
- [trust:0.9|src:direct|used:2025-12-23|hits:1] Backend del PoC a definir con Nacho. Frontend: webapp React en docs/webapp-poc/.

### Stack técnico (actualizado 2026-03-08)
- [trust:1.0|src:observed|used:2026-03-08|hits:2] Redis incorporado al stack desde PR #11 (requerido para cache de token SISE).
- [trust:1.0|src:observed|used:2026-03-08|hits:2] SISE integrado: cliente Go con 3 queries (Claim, Policy, Producer). Endpoint base: `https://sise-consultas.libraseguros.com.ar/Sise3GBELibraCoreprodConsultas`.
- [trust:1.0|src:observed|used:2026-03-08|hits:2] Tabla `claims` (migration 007) + FK `claim_id` en `cases` (migration 008). Linkeo automático no implementado aún.
- [trust:1.0|src:observed|used:2026-03-08|hits:2] Endpoints claims: GET /api/v1/claims, GET /api/v1/claims/lookup?nro_stro=X, POST /api/v1/claims. Acceso solo via JWT de usuario — no hay endpoint agent-key aún.
- [trust:1.0|src:observed|used:2026-03-08|hits:1] Endpoint /api/v1/attachments público (registrado antes del grupo JWT) — accesible desde browser sin conflicto de auth (desde 2026-03-08).
- [trust:1.0|src:observed|used:2026-03-08|hits:1] Rachel v2 activa: process_mails_v2.py con body_clean, adjuntos, clasificación LLM (Claude Haiku, 1 llamada/mail), title+description generados por LLM en case_events.
- [trust:1.0|src:observed|used:2026-03-08|hits:1] case_events soporta 11 tipos: 0-8 previos + apertura(9), apelacion(10), cierre(11). Editar/eliminar vía kebab menu.
- [trust:1.0|src:observed|used:2026-03-08|hits:1] CaseDetail: tab Archivos (adjuntos), trazabilidad solo aprobados, campo caratula en cases.
- [trust:1.0|src:observed|used:2026-03-08|hits:1] Activity: 2 tabs (Pendientes/Aprobados), columna siniestro, paginación. Pendientes sin siniestro van al final.

---

## Operational — Contexto activo, se archiva a los 30 días sin uso

- [trust:1.0|src:direct|used:2026-03-08|hits:3] Branch `sesion/2025-12-23`: 13 skills + ORCHESTRATION.md mergeados. PR aún no abierto. Branch activa secundaria.
- [trust:1.0|src:direct|used:2025-12-23|hits:1] Rachel configurada con bot propio de Discord. Pendiente prueba en #rachel.
- [trust:0.8|src:observed|used:2025-12-23|hits:1] Loop 6 del artículo de AtlasForge: irrelevante según Juan.
- [trust:1.0|src:direct|used:2025-12-23|hits:1] Loops 1-5 implementados. Loops 7-9 en Fase B/C.
- [trust:1.0|src:observed|used:2026-03-08|hits:11] Actividad sin sesión humana con Ali: días 2026-03-08 fueron exclusivamente Woz (66 commits). Ali solo corre en crons.
- [trust:1.0|src:direct|used:2026-03-08|hits:3] Model routing: Opus → planeamiento/complejo; Sonnet → ejecución/diario; Haiku → heartbeats/sencillos.
- [trust:1.0|src:direct|used:2026-03-08|hits:3] Pipeline: Rachel → Donna (Ingestion) → Mike (Extraction) → Edu (Triage x3) → Jess (Drafting) → Review (Red Team) → Abogado.
- [trust:1.0|src:direct|used:2026-03-08|hits:3] Canal #litigios = ID 1478558938352844891. Mensajes de Juan no llegan a Ali — pendiente debug.
- [trust:1.0|src:observed|used:2026-03-08|hits:1] fix duplicación pagos en re-sync SISE aplicado (2026-03-08). Pagos ya no se duplican al re-sincronizar siniestros.
