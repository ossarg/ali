---
name: system-audit
description: >
  Auditoría integral del sistema multi-agente de Libra Legal AI. Usá este skill
  cada vez que necesites evaluar si los sub-agentes cumplieron sus instrucciones,
  si aplicaron los skills correctos, si los outputs tienen la calidad esperada,
  o si hay patrones de error, fricción u oportunidades de mejora en el pipeline.
  También se activa para auditorías periódicas del sistema completo, revisión
  post-mortem de casos problemáticos, y ciclos de autoevolución. Trigger phrases:
  auditar, auditoría, revisar pipeline, qué salió mal, cómo mejorar, post-mortem,
  self-audit, system check, revisar calidad, evaluar agentes, qué podemos mejorar.
---

# System Audit — Libra Legal AI

Sos Ali, el coordinador. Tenés la visión completa del sistema cuando cada sub-agente
solo ve su parte. Este skill estructura esa visión en un proceso de auditoría
riguroso que produce hallazgos accionables, no observaciones vagas.

## Tres modos de operación

Este skill tiene tres modos. Cada uno responde a una necesidad distinta. Leé el
contexto del pedido y elegí el modo correcto, o combiná si hace falta.

### Modo 1: Auditoría post-pipeline (por caso)

Se ejecuta después de que un caso completa el pipeline (o falla en alguna etapa).
El objetivo es verificar que cada sub-agente hizo lo que debía, identificar
desviaciones, y capturar lecciones.

**Cuándo usarlo:** después de cada caso procesado, especialmente si hubo STOPs,
FLAGS, escalaciones, o si el abogado reportó problemas en el borrador.

**Qué hacer:**

1. Recuperá los outputs de cada etapa del pipeline para el caso auditado:
   `donna_output`, `mike_output`, `edu_output`, `jess_output`, `lou_output`.

2. Para cada sub-agente, evaluá las dimensiones de `references/audit-dimensions.md`
   sección "Auditoría por sub-agente". En síntesis:
   - ¿Recibió el input correcto? (handoff JSON completo, sin campos faltantes)
   - ¿Aplicó el skill asignado? (verificar que el output respeta el schema del skill)
   - ¿Los campos de confianza son coherentes con la evidencia? (un confidence alto
     con justificación débil es una red flag)
   - ¿Respetó las reglas de corte? (thresholds de ORCHESTRATION.md)
   - ¿Inventó datos? (cruzar extracciones contra el documento fuente)
   - ¿Tiempo y tokens razonables? (detectar loops o ineficiencias)

3. Evaluá el pipeline completo:
   - ¿Se respetó la secuencia? (Donna → Mike → Edu → Jess → Review)
   - ¿Los handoffs entre etapas fueron limpios? (output de una etapa = input
     suficiente de la siguiente)
   - ¿Hubo algún STOP o FLAG? Si sí, ¿fue correcto? ¿Se manejó bien?
   - ¿El borrador final refleja fielmente los outputs de triage y extracción?
   - ¿Se perdió información entre etapas?

4. Producí el output según la estructura de la sección "Output: Informe de
   auditoría post-pipeline" más abajo.

### Modo 2: Auditoría periódica del sistema

Se ejecuta periódicamente (semanal o quincenal) revisando patrones agregados,
no casos individuales. El objetivo es detectar problemas sistémicos que no se
ven en un solo caso.

**Cuándo usarlo:** en heartbeats programados, cuando Juan o Nacho piden una
revisión general, o cuando se acumulan 5+ casos sin auditoría de sistema.

**Qué hacer:**

1. Leé los archivos de memoria y autocontrol:
   - `regressions.md` — errores pasados convertidos en guardrails
   - `friction-log.md` — contradicciones e instrucciones en conflicto
   - `calibration-log.md` — predicciones vs outcomes
   - `long-term-memory.md` — estado del proyecto y reglas duras
   - Los últimos 5-7 daily logs en `daily-logs/`

2. Revisá las dimensiones de sistema de `references/audit-dimensions.md` sección
   "Auditoría de sistema". En síntesis:
   - Patrones de error recurrentes (¿el mismo tipo de falla aparece en múltiples
     casos?)
   - Skills que no se están usando o que se usan mal
   - Sub-agentes que consistentemente generan FLAGS o STOPs
   - Cuellos de botella de tiempo o tokens
   - Gaps en el knowledge base (normativa no ingestada, jurisprudencia faltante)
   - Guardrails de regressions.md: ¿se están cumpliendo?
   - Friction points sin resolver

3. Consultá `references/self-improvement-framework.md` y respondé las preguntas
   que apliquen al período auditado. No respondas las 20 cada vez — elegí las
   5-7 más relevantes según lo que encontraste en el paso anterior.

4. Producí el output según la estructura de la sección "Output: Informe de
   auditoría de sistema" más abajo.

### Modo 3: Deep-dive de autoevolución

Se ejecuta cuando Juan pide explícitamente una revisión profunda, o cuando
los Modos 1/2 revelan problemas que requieren cambios estructurales (no
solo parches).

**Cuándo usarlo:** cuando hay señales de degradación sistémica, cuando se
introduce un agente o skill nuevo y hay que evaluar impacto, o cuando
Juan dice "autoauditá", "revisá todo", "qué nos falta", "cómo mejoramos".

**Qué hacer:**

1. Ejecutá el Modo 2 completo como base.

2. Respondé TODAS las preguntas de `references/self-improvement-framework.md`,
   no solo las más relevantes. Cada respuesta debe incluir evidencia concreta
   (caso específico, log entry, output de sub-agente).

3. Para cada hallazgo, clasificá en:
   - **Acción inmediata**: se puede implementar ahora (ej: actualizar un
     guardrail, corregir un prompt, agregar un edge case a un skill)
   - **Propuesta**: requiere aprobación de Juan/Nacho (ej: cambiar la
     arquitectura de un pipeline, agregar un sub-agente, modificar un threshold)
   - **Investigación**: hay que explorar antes de actuar (ej: probar un
     approach alternativo, hacer benchmark de un skill nuevo)

4. Producí el output según la estructura de la sección "Output: Informe
   de autoevolución" más abajo.

---

## Outputs

Todos los informes se escriben en Markdown. El destino depende del modo:
- Post-pipeline: `daily-logs/YYYY-MM-DD.md` (append, sección "Auditoría caso X")
- Periódico: `daily-logs/YYYY-MM-DD.md` (append, sección "Auditoría de sistema")
- Deep-dive: archivo dedicado en la carpeta de trabajo que Juan indique

Además, todo hallazgo que califique como guardrail permanente se agrega a
`regressions.md`. Toda contradicción detectada se agrega a `friction-log.md`.
Toda predicción con outcome se agrega a `calibration-log.md`. Toda lección
estratégica se evalúa para actualización de `long-term-memory.md`.

### Output: Informe de auditoría post-pipeline

```markdown
## Auditoría — Caso [case_id]
**Fecha:** YYYY-MM-DD
**Pipeline:** [completado | detenido en etapa X | escalado]
**Resultado final:** [borrador entregado | revisión humana | STOP]

### Por sub-agente

#### Donna (Ingestion)
- **Skill aplicado:** [sí/no, cuál]
- **Compliance:** [cumplió instrucciones / desvío detectado]
- **Calidad output:** [alta/media/baja — justificación en una línea]
- **Hallazgos:** [lista concisa o "sin hallazgos"]

#### Mike (Extraction)
[misma estructura]

#### Edu (Triage)
[misma estructura, cubrir los 3 skills]

#### Jess (Drafting)
[misma estructura]

#### Review (Red Team)
[misma estructura]

### Pipeline completo
- **Handoffs limpios:** [sí/no — detalle si no]
- **Información perdida entre etapas:** [sí/no — detalle si sí]
- **Reglas de corte respetadas:** [sí/no — detalle si no]
- **Tiempo total pipeline:** [duración]
- **Tokens totales pipeline:** [cantidad]

### Acciones
- [acción 1 — quién, qué, prioridad]
- [acción 2]

### Guardrails nuevos (si aplica)
- [regla nueva para regressions.md]
```

### Output: Informe de auditoría de sistema

```markdown
## Auditoría de sistema — Semana/Quincena [fecha]
**Casos auditados:** [N]
**Período:** [fecha inicio — fecha fin]

### Patrones detectados
[Párrafo por cada patrón, con evidencia de casos concretos]

### Estado de guardrails
| Guardrail | Cumplimiento | Notas |
|-----------|-------------|-------|
| [regla de regressions.md] | [cumple/violado/no testeado] | [detalle] |

### Skills: uso y efectividad
| Skill | Usos | Efectividad | Observaciones |
|-------|------|-------------|---------------|
| [skill] | [N] | [alta/media/baja] | [detalle] |

### Self-improvement (preguntas seleccionadas)
[Pregunta N]: [respuesta con evidencia]
[Pregunta M]: [respuesta con evidencia]

### Recomendaciones
| Prioridad | Recomendación | Tipo | Responsable |
|-----------|---------------|------|-------------|
| Alta | [qué] | [acción/propuesta/investigación] | [quién] |
```

### Output: Informe de autoevolución

Incluye todo lo del informe de sistema más:

```markdown
### Self-improvement completo
[Las 20 preguntas respondidas con evidencia]

### Cambios estructurales propuestos
[Cada propuesta con: qué cambiar, por qué, impacto esperado, riesgo,
plan de implementación, criterio de éxito]

### Mapa de conexiones entre proyectos
[Conexiones detectadas entre Libra, los objetivos de Juan, y oportunidades
no exploradas — referencia a pregunta 6 del framework]

### Conocimiento en riesgo de pérdida
[Qué se pierde entre sesiones, qué no está documentado, qué necesita
persistencia explícita — referencia a pregunta 5 del framework]
```

---

## Principios operativos

**Evidencia sobre opinión.** Cada hallazgo se respalda con un dato concreto: un
campo del output, un log entry, un caso específico. "Parece que Mike a veces falla"
no es un hallazgo. "Mike devolvió nro_siniestro=null en 3 de 7 casos donde el STRO
estaba embebido en la carátula" sí lo es.

**Accionable sobre descriptivo.** El informe existe para que alguien haga algo con
él. Cada sección termina con acciones concretas, no con observaciones abiertas.

**Proporcionalidad.** No auditar con la misma profundidad un caso que fluyó sin
problemas que uno que generó un STOP. El Modo 1 puede ser breve si todo salió bien
— un párrafo diciendo "pipeline limpio, sin hallazgos" es un output válido.

**Actualización de archivos.** Este skill no solo produce informes — actualiza los
archivos de autocontrol. Si encontrás un error repetido, no alcanza con reportarlo:
escribilo en regressions.md como guardrail. Si encontrás una contradicción,
registrala en friction-log.md. Si hiciste una predicción, registrá el outcome en
calibration-log.md. Los archivos de autocontrol son el sistema inmunológico del
sistema. Este skill los alimenta.

**Transparencia sobre suposiciones.** Si durante la auditoría te falta información
para evaluar algo (ej: no tenés acceso al documento fuente, o el output de un
sub-agente no se guardó), decilo explícitamente. No inferir calidad donde no
podés verificar.
