# Long-Term Memory

_Tres capas: Constitutional (nunca expira), Strategic (trimestral), Operational (30 días sin uso → archivo)._
_Metadata: [trust:0-1|src:direct/observed/inferred|used:FECHA|hits:N]_

---

## Constitutional — Reglas duras, nunca expiran

- [trust:1.0|src:direct|used:2026-03-15|hits:7] NUNCA pushear a `main`. Branches por sesión/tópico.
- [trust:1.0|src:direct|used:2026-03-15|hits:7] NUNCA pushear tokens, API keys o variables de entorno al repo.
- [trust:1.0|src:direct|used:2026-03-15|hits:7] El canal `#rachel` es exclusivo de Rachel. Ali sin acceso.
- [trust:1.0|src:direct|used:2026-03-15|hits:7] Ninguna acción con consecuencias legales sin validación humana.
- [trust:1.0|src:direct|used:2026-03-15|hits:7] Safety gate: preguntar antes de cambios que afecten runtime, datos, costo, auth, routing o outputs externos.
- [trust:1.0|src:direct|used:2026-03-09|hits:7] NUNCA pushear a `main`. Branches por sesión/tópico.
- [trust:1.0|src:direct|used:2026-03-09|hits:7] NUNCA pushear tokens, API keys o variables de entorno al repo.
- [trust:1.0|src:direct|used:2026-03-09|hits:7] El canal `#rachel` es exclusivo de Rachel. Ali sin acceso.
- [trust:1.0|src:direct|used:2026-03-09|hits:7] Ninguna acción con consecuencias legales sin validación humana.
- [trust:1.0|src:direct|used:2026-03-09|hits:7] Safety gate: preguntar antes de cambios que afecten runtime, datos, costo, auth, routing o outputs externos.

---

## Strategic — Estado del proyecto, estable por meses

- [trust:1.0|src:direct|used:2026-03-15|hits:9] Repo: ossarg/ali en GitHub. Local: /home/legales/ali.
- [trust:1.0|src:direct|used:2026-03-15|hits:8] Equipo: Nacho (lead, infra, sistemas Libra), Juan (frontend/arquitectura), Ali (coordinador), Woz (backend Go + infra).
- [trust:1.0|src:direct|used:2026-03-15|hits:8] Agentes activos: Ali (canal #ali, #general) y Rachel (canal #rachel, procesamiento de mails legales).
- [trust:1.0|src:direct|used:2026-03-15|hits:7] Coordinador opera en modo síncrono (runtime) y asíncrono (auditor) — un solo agente, dos modos.
- [trust:1.0|src:direct|used:2026-03-15|hits:7] Sub-agentes reciben contexto mínimo (handoffs JSON). No acceden al documento completo.
- [trust:1.0|src:direct|used:2026-03-15|hits:7] Módulos pericias, oficios y SSN son Fase 4, independientes del pipeline principal.
- [trust:0.9|src:direct|used:2025-12-23|hits:1] Backend del PoC a definir con Nacho. Frontend: webapp React en docs/webapp-poc/.

### Stack técnico (actualizado 2026-03-15)
- [trust:1.0|src:observed|used:2026-03-15|hits:3] Redis incorporado al stack desde PR #11 (requerido para cache de token SISE).
- [trust:1.0|src:observed|used:2026-03-15|hits:3] SISE integrado: cliente Go con 3 queries (Claim, Policy, Producer). Endpoint base: `https://sise-consultas.libraseguros.com.ar/Sise3GBELibraCoreprodConsultas`.
- [trust:1.0|src:observed|used:2026-03-15|hits:3] Tabla `claims` (migration 007) + FK `claim_id` en `cases` (migration 008). Linkeo automático no implementado aún.
- [trust:1.0|src:observed|used:2026-03-15|hits:3] Endpoints claims: GET /api/v1/claims, GET /api/v1/claims/lookup?nro_stro=X, POST /api/v1/claims. Acceso solo via JWT de usuario — no hay endpoint agent-key aún.
- [trust:1.0|src:observed|used:2026-03-08|hits:1] Endpoint /api/v1/attachments público (registrado antes del grupo JWT) — accesible desde browser sin conflicto de auth (desde 2026-03-08).
- [trust:1.0|src:observed|used:2026-03-08|hits:1] Rachel v2 activa: process_mails_v2.py con body_clean, adjuntos, clasificación LLM (Claude Haiku, 1 llamada/mail), title+description generados por LLM en case_events.
- [trust:1.0|src:observed|used:2026-03-08|hits:1] case_events soporta 11 tipos: 0-8 previos + apertura(9), apelacion(10), cierre(11). Editar/eliminar vía kebab menu.
- [trust:1.0|src:observed|used:2026-03-08|hits:1] CaseDetail: tab Archivos (adjuntos), trazabilidad solo aprobados, campo caratula en cases.
- [trust:1.0|src:observed|used:2026-03-08|hits:1] Activity: 2 tabs (Pendientes/Aprobados), columna siniestro, paginación. Pendientes sin siniestro van al final.
- [trust:1.0|src:observed|used:2026-03-15|hits:1] Módulo Agreements implementado (migration 018, feature/agreements, 2026-03-15). Tabla `agreements` con FK case_event_id + case_id. Auto-creación en pending al aprobar evento tipo acuerdo (mail_type=4). Extracción de datos por pipeline: pendiente.
- [trust:1.0|src:observed|used:2026-03-15|hits:1] DI container extraído a `internal/di/container.go` (refactor 2026-03-15). main.go ahora es boot-only.
- [trust:1.0|src:observed|used:2026-03-15|hits:1] ⚠️ Script backup DB roto desde 2026-03-14: archivos de 20 bytes (vacíos). Último backup real: libra_legal_20260313_0300.sql.gz (227618 bytes).
- [trust:1.0|src:direct|used:2026-03-09|hits:9] Repo: ossarg/ali en GitHub. Local: /home/legales/ali.
- [trust:1.0|src:direct|used:2026-03-09|hits:8] Equipo: Nacho (lead, infra, sistemas Libra), Juan (frontend/arquitectura), Ali (coordinador), Woz (backend Go + infra).
- [trust:1.0|src:direct|used:2026-03-09|hits:8] Agentes activos: Ali (canal #ali, #general) y Rachel (canal #rachel, procesamiento de mails legales).
- [trust:1.0|src:direct|used:2026-03-09|hits:7] Coordinador opera en modo síncrono (runtime) y asíncrono (auditor) — un solo agente, dos modos.
- [trust:1.0|src:direct|used:2026-03-09|hits:7] Sub-agentes reciben contexto mínimo (handoffs JSON). No acceden al documento completo.
- [trust:1.0|src:direct|used:2026-03-09|hits:7] Módulos pericias, oficios y SSN son Fase 4, independientes del pipeline principal.
- [trust:0.9|src:direct|used:2025-12-23|hits:1] Backend del PoC a definir con Nacho. Frontend: webapp React en docs/webapp-poc/.

### Stack técnico (actualizado 2026-03-09)
- [trust:1.0|src:observed|used:2026-03-09|hits:3] Redis incorporado al stack desde PR #11 (requerido para cache de token SISE).
- [trust:1.0|src:observed|used:2026-03-09|hits:3] SISE integrado: cliente Go con 3 queries (Claim, Policy, Producer). Endpoint base: `https://sise-consultas.libraseguros.com.ar/Sise3GBELibraCoreprodConsultas`.
- [trust:1.0|src:observed|used:2026-03-09|hits:3] Tabla `claims` (migration 007) + FK `claim_id` en `cases` (migration 008). Linkeo automático no implementado aún.
- [trust:1.0|src:observed|used:2026-03-09|hits:3] Endpoints claims: GET /api/v1/claims, GET /api/v1/claims/lookup?nro_stro=X, POST /api/v1/claims. Acceso solo via JWT de usuario — no hay endpoint agent-key aún.
- [trust:1.0|src:observed|used:2026-03-09|hits:2] Endpoint /api/v1/attachments público (registrado antes del grupo JWT) — accesible desde browser sin conflicto de auth (desde 2026-03-08).
- [trust:1.0|src:observed|used:2026-03-09|hits:2] Rachel v2 activa: process_mails_v2.py con body_clean, adjuntos, clasificación LLM (Claude Haiku, 1 llamada/mail), title+description generados por LLM en case_events.
- [trust:1.0|src:observed|used:2026-03-09|hits:2] case_events soporta 11 tipos: 0-8 previos + apertura(9), apelacion(10), cierre(11). Editar/eliminar vía kebab menu.
- [trust:1.0|src:observed|used:2026-03-09|hits:2] CaseDetail: tab Archivos (adjuntos), trazabilidad solo aprobados, campo caratula en cases.
- [trust:1.0|src:observed|used:2026-03-09|hits:2] Activity: 2 tabs (Pendientes/Aprobados), columna siniestro, paginación. Pendientes sin siniestro van al final.
- [trust:1.0|src:observed|used:2026-03-09|hits:1] Docker stack en producción: docker-compose activo = `backend/docker-compose.yml`. El raíz (`docker-compose.yml`) fue renombrado a `.bak` (obsoleto). restart:unless-stopped en server para evitar race con postgres.
- [trust:1.0|src:observed|used:2026-03-09|hits:1] Auth JWT real: AuthContext usa authService.login(), token persistido en localStorage. Mock hardcodeado eliminado el 2026-03-09. Sesiones persistentes al recargar.
- [trust:1.0|src:observed|used:2026-03-09|hits:1] VITE_API_URL vacío en producción → axios usa proxy Vite (requests relativas al origen). No hardcodear URL del backend.
- [trust:1.0|src:observed|used:2026-03-09|hits:1] CaseEventSchema usa nullish() en todos los campos opcionales — el backend Go puede devolver null.
- [trust:1.0|src:observed|used:2026-03-09|hits:1] DB backup en repo: data/backups/libra_legal_20260309_2124.sql.gz (80 KB comprimido, estado producción 09/03/2026).
- [trust:1.0|src:observed|used:2026-03-09|hits:1] docs/design-system.md creado (345 líneas, 2026-03-09).

---

## Operational — Contexto activo, se archiva a los 30 días sin uso

- [trust:1.0|src:direct|used:2026-03-15|hits:4] Branch `sesion/2025-12-23`: 13 skills + ORCHESTRATION.md mergeados. PR aún no abierto. Branch activa secundaria.
- [trust:1.0|src:direct|used:2025-12-23|hits:1] Rachel configurada con bot propio de Discord. Pendiente prueba en #rachel.
- [trust:0.8|src:observed|used:2025-12-23|hits:1] Loop 6 del artículo de AtlasForge: irrelevante según Juan.
- [trust:1.0|src:direct|used:2025-12-23|hits:1] Loops 1-5 implementados. Loops 7-9 en Fase B/C.
- [trust:1.0|src:observed|used:2026-03-15|hits:13] Actividad sin sesión humana con Ali: fines de semana y viernes exclusivamente Woz. Ali solo corre en crons.
- [trust:1.0|src:direct|used:2026-03-15|hits:4] Model routing: Opus → planeamiento/complejo; Sonnet → ejecución/diario; Haiku → heartbeats/sencillos.
- [trust:1.0|src:direct|used:2026-03-15|hits:4] Pipeline: Rachel → Donna (Ingestion) → Mike (Extraction) → Edu (Triage x3) → Jess (Drafting) → Review (Red Team) → Abogado.
- [trust:1.0|src:direct|used:2026-03-15|hits:4] Canal #litigios = ID 1478558938352844891. Mensajes de Juan no llegan a Ali — pendiente debug.
- [trust:1.0|src:observed|used:2026-03-08|hits:1] fix duplicación pagos en re-sync SISE aplicado (2026-03-08). Pagos ya no se duplican al re-sincronizar siniestros.
- [trust:1.0|src:observed|used:2026-03-15|hits:1] feature/agreements (2026-03-15, 4 commits Woz): módulo acuerdos completo (migration 018, back Go, front React). Pendiente merge a development/main y definir pipeline de extracción.
- [trust:1.0|src:observed|used:2026-03-15|hits:1] ⚠️ Backup DB roto: libra_legal_20260314 y libra_legal_20260315 = 20 bytes. Último backup válido: 2026-03-13.
- [trust:1.0|src:direct|used:2026-03-09|hits:4] Branch `sesion/2025-12-23`: 13 skills + ORCHESTRATION.md mergeados. PR aún no abierto. Branch activa secundaria.
- [trust:1.0|src:direct|used:2025-12-23|hits:1] Rachel configurada con bot propio de Discord. Pendiente prueba en #rachel.
- [trust:0.8|src:observed|used:2025-12-23|hits:1] Loop 6 del artículo de AtlasForge: irrelevante según Juan.
- [trust:1.0|src:direct|used:2025-12-23|hits:1] Loops 1-5 implementados. Loops 7-9 en Fase B/C.
- [trust:1.0|src:observed|used:2026-03-09|hits:12] Actividad sin sesión humana con Ali: días 2026-03-08 y 2026-03-09 fueron exclusivamente Woz/Nacho. Ali solo corre en crons.
- [trust:1.0|src:direct|used:2026-03-09|hits:4] Model routing: Opus → planeamiento/complejo; Sonnet → ejecución/diario; Haiku → heartbeats/sencillos.
- [trust:1.0|src:direct|used:2026-03-09|hits:4] Pipeline: Rachel → Donna (Ingestion) → Mike (Extraction) → Edu (Triage x3) → Jess (Drafting) → Review (Red Team) → Abogado.
- [trust:1.0|src:direct|used:2026-03-09|hits:4] Canal #litigios = ID 1478558938352844891. Mensajes de Juan no llegan a Ali — pendiente debug.
- [trust:1.0|src:observed|used:2026-03-09|hits:2] fix duplicación pagos en re-sync SISE aplicado (2026-03-08). Pagos ya no se duplican al re-sincronizar siniestros.
