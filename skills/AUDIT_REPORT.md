# Reporte de Auditoría de Skills — Libra Legal AI

**Fecha:** 2026-03-15
**Auditora:** Ali (Coordinadora del pipeline)
**Branch:** feature/add-lou-agent
**Scope:** 16 skills en `/ali/skills/`

---

## Resumen ejecutivo

Se auditaron 16 skills. De ellos:
- **1 no modificado** por estar en estado DEPRECATED (review-red-team-verifier)
- **1 no modificado** por tener calidad 5/5 (system-audit)
- **14 mejorados** con descripciones reescritas según metodología skill-creator

Problema sistémico más frecuente: descripciones demasiado escuetas o sin frases de trigger concretas, lo que reducía la probabilidad de activación correcta en contextos ambiguos.

---

## Detalle por skill

### 1. byterover

| Campo | Valor |
|---|---|
| Agente | Ali (transversal) |
| Score anterior | 3/5 |
| Score nuevo | 5/5 |
| Problema | Descripción demasiado amplia ("MUST use for ANY work") — triggereaba en todo sin contexto de cuándo NO usarlo |
| Cambio | Acotada a dos momentos de activación concretos: antes de una tarea que requiera contexto del proyecto, y después de tomar una decisión importante. Agrega frases trigger explícitas y delimita alcance (no para información general o transitoria). |

---

### 2. drafting-answer-ar

| Campo | Valor |
|---|---|
| Agente | Jess (Drafting) |
| Score anterior | 3/5 |
| Score nuevo | 5/5 |
| Problema | Descripción funcional pero sin frases trigger, sin indicar precondiciones (outputs de triage y extraction deben existir), ni umbral crítico (0.8). |
| Cambio | Agrega frases concretas de activación, precondición de que upstream completó triage y extraction, mención de las secciones procesales del escrito, y que es el skill más crítico del sistema. |

---

### 3. drafting-canned-responses-ar

| Campo | Valor |
|---|---|
| Agente | Jess (Drafting) |
| Score anterior | 3/5 |
| Score nuevo | 5/5 |
| Problema | "Respuestas estandarizadas pre-litigio" es vago y solapaba con otros skills de drafting. Sin frases trigger. |
| Cambio | Enumera los templates específicos (ASEG-001..003, LET-001, MED-001/002, TRIB-001) con sus usos, agrega frases trigger concretas, y delimita explícitamente qué no cubre (contestaciones y rechazos). |

---

### 4. drafting-coverage-denial-ar

| Campo | Valor |
|---|---|
| Agente | Jess (Drafting) |
| Score anterior | 4/5 |
| Score nuevo | 5/5 |
| Problema | Buena descripción técnica pero sin frases trigger ni mención de la precondición (coverage-opinion-ar debe haber emitido NO_COBERTURA). |
| Cambio | Agrega precondición de dictamen previo, frases trigger concretas, y condición negativa (no usar si coverage-opinion-ar dijo COBERTURA). |

---

### 5. drafting-legal-memo-ar

| Campo | Valor |
|---|---|
| Agente | Jess (Drafting) |
| Score anterior | 3/5 |
| Score nuevo | 5/5 |
| Problema | "Compila un memorándum" no indica cuándo ni para quién. Sin diferenciación de destinatarios ni frases trigger. |
| Cambio | Explicita los tres destinatarios y qué recibe cada uno, precondición de pipeline completado, frases trigger por tipo de pedido ("memo para el gerente", "informe para siniestros", etc.). |

---

### 6. extraction-claim-summary-ar

| Campo | Valor |
|---|---|
| Agente | Mike (Extraction) |
| Score anterior | 3/5 |
| Score nuevo | 5/5 |
| Problema | Muy escueto — no mencionaba el dato crítico sobre fecha de referencia para plazos según tipo de intervención, ni los datos de víctima en casos con fallecimiento. |
| Cambio | Enumera los grupos de datos que extrae, frases trigger concretas, mención del feature de fallecimiento/valor vida, y que produce el JSON que consumen triage y drafting. |

---

### 7. extraction-policy-lookup-ar

| Campo | Valor |
|---|---|
| Agente | Mike (Extraction) |
| Score anterior | 3/5 |
| Score nuevo | 5/5 |
| Estado | STUB — mantenido, solo mejorada la descripción |
| Problema | Descripción no indicaba estado stub, no mencionaba la condición de activación automática (poliza_path = null), ni el orden de prioridad de campos de búsqueda. |
| Cambio | Agrega indicación de STUB, condición de activación automática, orden de prioridad de búsqueda, comportamiento ante póliza no vigente, y frases trigger. Body del skill intacto. |

---

### 8. extraction-policy-summary-ar

| Campo | Valor |
|---|---|
| Agente | Mike (Extraction) |
| Score anterior | 3/5 |
| Score nuevo | 5/5 |
| Problema | Muy escueto — no mencionaba el dato crítico del flag de exclusiones destacadas (relevante para análisis de abusividad). Sin frases trigger. |
| Cambio | Enumera los grupos de datos que extrae, el flag de destacado en exclusiones con referencia al art. 37 Ley 24.240, frases trigger concretas, y delimitación (no analiza cobertura). |

---

### 9. ingestion-document-summary-ar

| Campo | Valor |
|---|---|
| Agente | Donna (Ingestion) |
| Score anterior | 3/5 |
| Score nuevo | 5/5 |
| Problema | "Clasifica, resumen, fundamentos, señales atípicas" es correcto pero vago. Sin frases trigger ni contexto de posición en el pipeline. |
| Cambio | Explicita los tipos de señales de atención, el feature de datos económicos de víctima en fallecimiento, frases trigger concretas, posición en el pipeline (primera etapa, antes de extraction), y delimitación (no extrae datos estructurados). |

---

### 10. ingestion-formal-review-ar

| Campo | Valor |
|---|---|
| Agente | Donna (Ingestion) |
| Score anterior | 3/5 |
| Score nuevo | 5/5 |
| Problema | "Verifica formalidades procesales" no indicaba cuáles ni cuántas, sin mencionar el valor estratégico de defectos ni la verificación especial para citación en garantía. |
| Cambio | Enumera los 8 checks explícitamente, menciona el campo de valor estratégico por defecto, la verificación de art. 118 LS para citaciones en garantía, y frases trigger incluyendo el caso de activación por señales de extraction. |

---

### 11. pipeline-batch-runner

| Campo | Valor |
|---|---|
| Agente | Ali (Coordinadora) |
| Score anterior | 4/5 |
| Score nuevo | 5/5 |
| Problema | Buena descripción base pero podría ser más precisa sobre el mecanismo de coordinación y agregar frases trigger. |
| Cambio | Aclara el rol de Ali como coordinador sin procesar demandas directamente, menciona el manejo de errores específicos, y agrega frases trigger concretas incluyendo la delimitación (no para un solo caso). |

---

### 12. review-red-team-verifier

| Campo | Valor |
|---|---|
| Agente | Lou (Review) |
| Score anterior | 3/5 |
| Score nuevo | **NO MODIFICADO** |
| Razón | DEPRECATED — será reemplazado por review-consistency-ar + review-normative-risk-ar según docs/pipeline-canon.md |
| Nota | La descripción existente no refleja el estado DEPRECATED. Si se activa en producción podría generar confusión. Recomendación: agregar `[DEPRECATED]` al inicio de la description en la próxima iteración una vez que los skills de reemplazo estén disponibles. |

---

### 13. system-audit

| Campo | Valor |
|---|---|
| Agente | Ali (Coordinadora) |
| Score anterior | 5/5 |
| Score nuevo | **NO MODIFICADO** |
| Razón | Descripción ejemplar: específica, tres modos de operación claros, frases trigger concretas, cubre edge cases (post-mortem, self-audit, evaluación de agentes), correctamente "pushy". Sirve como referencia para otros skills. |

---

### 14. triage-coverage-opinion-ar

| Campo | Valor |
|---|---|
| Agente | Edu (Triage) |
| Score anterior | 3/5 |
| Score nuevo | 5/5 |
| Problema | "Emite dictamen de cobertura" no indicaba el framework de análisis, los posibles valores del dictamen, ni el cálculo de exposición económica. Sin frases trigger. |
| Cambio | Enumera los 6 aspectos del framework en orden, los cuatro valores posibles del dictamen, la advertencia sobre interpretación pro-consumidor, frases trigger concretas, y delimitación respecto a otros skills de triage. |

---

### 15. triage-risk-assessment-ar

| Campo | Valor |
|---|---|
| Agente | Edu (Triage) |
| Score anterior | 3/5 |
| Score nuevo | 5/5 |
| Problema | "Evalúa riesgo procesal con factores argentinos" es genérico. Sin frases trigger, sin mencionar el detalle del cómputo de plazo diferenciado por tipo de intervención (punto más crítico del skill). |
| Cambio | Menciona el score 0-100, los umbrales de urgencia, el cómputo diferenciado de plazo por tipo de intervención, los indicadores de complejidad alta, frases trigger concretas incluyendo consultas de urgencia. |

---

### 16. triage-viability-check-ar

| Campo | Valor |
|---|---|
| Agente | Edu (Triage) |
| Score anterior | 4/5 |
| Score nuevo | 5/5 |
| Problema | Buena descripción pero no enumeraba los 8 checks, no explicaba la semántica VERDE=defensa/ROJO=no defensa (que el skill aclara dentro del body), ni mencionaba que sus outputs son consumidos directamente por drafting. |
| Cambio | Enumera los 8 checks con referencias legales, aclara semántica del semáforo, menciona la integración downstream con drafting-answer-ar, frases trigger concretas incluyendo consultas sobre prescripción. |

---

## Observaciones adicionales

### Coherencia de agentes
Las descripciones mejoradas ahora identifican consistentemente al agente responsable de cada skill, lo que facilita el routing correcto en el pipeline.

### review-red-team-verifier — riesgo de activación indebida
La descripción del skill DEPRECATED no lo identifica como tal. Si un nuevo agente o sesión desconoce el estado del proyecto, podría activarlo. Recomendación pendiente para sprint siguiente.

### extraction-policy-lookup-ar — stub documentado
La descripción ahora refleja el estado stub claramente. Los campos de integración técnica (endpoint, credenciales, formato de respuesta) siguen pendientes con Juan Mazzochi.

### byterover — corrección de falsos positivos
La descripción anterior con "MUST use for ANY work" causaba over-triggering. La nueva versión acota correctamente a dos momentos de uso sin perder coverage en los casos legítimos.

---

## Métricas del audit

| Categoría | Cantidad |
|---|---|
| Skills auditados | 16 |
| Mejorados (descripción reescrita) | 14 |
| No modificados (5/5 — system-audit) | 1 |
| No modificados (DEPRECATED — review-red-team-verifier) | 1 |
| Score promedio anterior | ~3.1/5 |
| Score promedio nuevo | ~4.9/5 |

---

*Auditoría ejecutada por Ali — Coordinadora, Libra Legal AI*
*Commit: feature/add-lou-agent*
