# Working Memory — Ali
**Actualizado:** 2026-03-08 23:00

---

## Tareas pendientes inmediatas

### Alta prioridad
- [ ] **Reescribir prompt de Donna** — rol correcto: Ingestion (ingestion-document-summary-ar + ingestion-formal-review-ar). El prompt anterior era incorrecto (era para DPS/Mike).
- [ ] **Reescribir prompt de Mike** — rol correcto: Extraction estructurada (extraction-claim-summary-ar + extraction-policy-summary-ar).
- [ ] **Actualizar data-processing-specialist.md** — deprecar o refactorizar para reflejar el split Donna/Mike según ORCHESTRATION.md.
- [ ] **Reescribir prompt de Review** — agente Red Team Verifier, necesita su propio prompt.
- [ ] **Actualizar regressions.md** — guardrail: correr `git log --oneline -10` al inicio de sesión antes de opinar sobre arquitectura.
- [ ] **Actualizar friction-log.md** — contradicción: qué cambios de infra/config puede hacer Ali vs. Woz.
- [ ] **Capturar conocimiento legal en long-term-memory.md** — patrones de contestaciones argentinas de seguros extraídos de los 9 PDFs.

### Media prioridad
- [ ] **Resolver #litigios** — canal ID 1478558938352844891 configurado pero mensajes de Juan no llegan a Ali. Pendiente debug y prueba controlada.
- [ ] **Prompt de Jess** — verificar que negativas específicas sean compatibles con schema real de output de Donna.
- [ ] **Agregar trigger de Modo 1 en ORCHESTRATION.md** — definir cuándo Ali corre auditoría post-pipeline.
- [ ] **Endpoint agent-key para claims** — el pipeline aún no puede consumir datos SISE directamente (solo hay JWT de usuario). Pendiente de decisión Juan/Woz.
- [ ] **Lógica de linkeo siniestro→caso** — campo `claim_id` en `cases` está NULL para todos los casos. La asociación automática no existe. Pendiente de buildear.
- [ ] **Branch `sesion/2025-12-23`** — PR aún no abierto. Revisar con Juan.

### Pendiente de Juan
- [ ] Skills de todos los agentes para revisar y alinear prompts
- [ ] Secciones del template borrador demanda_directa (solo citación en garantía definida)
- [ ] Confirmación si action_type aplica a mediaciones
- [ ] Test del canal #litigios
- [ ] Decisión sobre endpoint agent-key para claims / acceso SISE desde pipeline

---

## Contexto arquitectural — estado real del repo (2026-03-08)

### Pipeline (ORCHESTRATION.md)
```
Rachel → Donna (Ingestion) → Mike (Extraction) → Edu (Triage x3) → Jess (Drafting) → Review (Red Team) → Abogado
```

### Rachel v2 (activa desde 2026-03-08)
- process_mails_v2.py: body_clean, extracción adjuntos, clasificación LLM (Claude Haiku, 1 llamada/mail)
- title + description de case_events generados por LLM
- Fix: no truncar body antes de forward parser (eventos en el fondo de cadena ya no se pierden)
- Fix: paginar INBOX completo (no limitado a 100)

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

### Estado de la webapp (2026-03-08)
- **Activity**: 2 tabs Pendientes/Aprobados, columna siniestro, paginación, pendientes sin siniestro al final
- **ActivityDetail**: layout 2 columnas, body scroll interno, ReviewModal 2 columnas, fix cache post-aprobación
- **CaseDetail**: adjuntos (ícono + tab Archivos), trazabilidad (solo aprobados), kebab menu editar/eliminar eventos, campo caratula
- **Claims**: tabla limpia (sin sise_claim_id ni coverage), causa truncada
- **Cases**: paginación 10/página, pantalla detalle actividad
- **case_events**: 11 tipos (0-8 previos + apertura=9, apelacion=10, cierre=11)
- **Endpoint attachments**: público (antes del grupo JWT) — accesible desde browser

### Branches
- `main` — rama activa principal (66 commits de Woz el 2026-03-08, PRs #19-#22 mergeados)
- `sesion/2025-12-23` — 13 skills + ORCHESTRATION.md. PR no abierto. Pendiente revisión.

### Model routing (instrucción de Juan, 2026-03-06)
- Planeamiento y tareas complejas → Opus
- Ejecución y tareas diarias → Sonnet
- Heartbeats y tareas sencillas → Haiku

---

## Cambios arquitecturales previos importantes

### PR #11 — Woz (2026-03-07) — Integración SISE
- **Redis** incorporado al stack. Requerido para cache de token SISE.
- **SISE integrado**: 3 queries (GetClaimByNumber, GetPolicySummary, GetProducerByCode). TTL buffer −60s, retry-on-401.
- **Tabla `claims`** (~30 cols) + FK `claim_id` en `cases`. Migrations 007+008 en main.
- **Endpoints**: GET /api/v1/claims, GET /api/v1/claims/lookup, POST /api/v1/claims (solo JWT usuario).
- **Webapp**: nuevo tab `/claims` con modal AddClaim (lookup + persist).
- **Typos en SISE documentados**: `fecha_resgistro`, `Codido_Asegurado` — mapeados tal cual.
- **Nuevas env vars**: REDIS_URL, SISE_BASE_URL, SISE_USERNAME, SISE_PASSWORD.
- fix duplicación de pagos en re-sync SISE (2026-03-08).

Ver análisis completo en: `daily-logs/2026-03-07-woz-review.md`
