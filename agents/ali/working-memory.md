# Working Memory — Ali
**Actualizado:** 2026-03-06 23:20

---

## Tareas pendientes inmediatas

### Alta prioridad
- [ ] **Reescribir prompt de Donna** — rol correcto: Ingestion (ingestion-document-summary-ar + ingestion-formal-review-ar). El prompt que escribí hoy era para DPS, que en realidad es Mike.
- [ ] **Reescribir prompt de Mike** — rol correcto: Extraction estructurada (extraction-claim-summary-ar + extraction-policy-summary-ar). El prompt que escribí era para CaseRunner.
- [ ] **Actualizar data-processing-specialist.md** — deprecar o refactorizar para reflejar el split Donna/Mike según ORCHESTRATION.md.
- [ ] **Reescribir prompt de Review** — agente Red Team Verifier que no estaba en mi diseño original. Necesita su propio prompt.
- [ ] **Actualizar regressions.md** — guardrail: correr `git log --oneline -10` al inicio de sesión antes de opinar sobre arquitectura.
- [ ] **Actualizar friction-log.md** — contradicción: qué cambios de infra/config puede hacer Ali vs. Woz (surgió del incidente CORS).
- [ ] **Capturar conocimiento legal en long-term-memory.md** — patrones de contestaciones argentinas de seguros extraídos de los 9 PDFs.

### Media prioridad
- [ ] **Resolver #litigios** — canal configurado en openclaw.json pero los mensajes de Juan en ese canal no llegan a Ali. Verificar config y hacer prueba controlada.
- [ ] **Prompt de Jess** — revisar que las negativas específicas sean compatibles con el schema real de output de Donna (no el que yo diseñé).
- [ ] **Agregar trigger de Modo 1 en ORCHESTRATION.md** — definir cuándo Ali corre auditoría post-pipeline (automático / solo en FLAG+STOP / manual).

### Pendiente de Juan
- [ ] Skills de todos los agentes para revisar y alinear prompts
- [ ] Secciones del template de borrador para demanda_directa (solo definimos citación en garantía)
- [ ] Confirmación si action_type aplica a mediaciones
- [ ] Test del canal #litigios

---

## Contexto arquitectural — estado real del repo (2026-03-06)

### Pipeline (ORCHESTRATION.md)
```
Rachel → Donna (Ingestion) → Mike (Extraction) → Edu (Triage x3) → Jess (Drafting) → Review (Red Team) → Abogado
```

### Asignación de skills por agente
| Agente | Skills |
|--------|--------|
| Rachel | email-triage-router-ar |
| Donna | ingestion-document-summary-ar, ingestion-formal-review-ar |
| Mike | extraction-claim-summary-ar, extraction-policy-summary-ar |
| Edu | triage-risk-assessment-ar, triage-coverage-opinion-ar, triage-viability-check-ar |
| Jess | drafting-answer-ar, drafting-coverage-denial-ar |
| Review | review-red-team-verifier |
| Ali | system-audit (nuevo, pusheado hoy) |

### Branch activa
`sesion/2025-12-23` — donde están mergeados los 13 skills y ORCHESTRATION.md

### Model routing (instrucción de Juan, 2026-03-06)
- Planeamiento y tareas complejas → Opus
- Ejecución y tareas diarias → Sonnet
- Heartbeats y tareas sencillas → Haiku

---

## Decisiones del día (2026-03-06)

- Donna = Ingestion (NO el DPS que diseñé en sesión anterior)
- Mike = Extraction (NO el CaseRunner)
- Review = Red Team Verifier (agente que no tenía en contexto)
- Prompts van en español (no son código)
- Nacho: Ali no hace cambios de código — infra/config necesita clarificación de límites
- Canal #litigios = 1478558938352844891 (el que yo llamaba "Projects #ali")
- Skill system-audit agregado a skills/system-audit/ en sesion/2025-12-23
