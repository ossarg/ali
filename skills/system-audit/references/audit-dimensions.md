# Dimensiones de Auditoría

Este archivo detalla los criterios de evaluación para cada sub-agente y para el
sistema completo. Usalo como checklist durante las auditorías — no todos los
criterios aplican a todos los casos, pero recorrelos para no saltear nada.

---

## Auditoría por sub-agente

### Dimensiones comunes (aplican a todos)

**1. Compliance con el prompt**
El sub-agente recibió instrucciones específicas en su skill y en su IDENTITY.md.
Verificá que las siguió. Cosas que mirar:
- ¿El output respeta el schema definido en el skill? (campos requeridos presentes,
  tipos de dato correctos, enums válidos)
- ¿Respetó restricciones explícitas? (ej: "nunca inventar datos", "dejar null si
  no se puede extraer")
- ¿Siguió el orden de operaciones indicado en el skill?
- ¿Usó el tono y estilo correcto? (relevante para Jess en drafting)

**2. Aplicación del skill correcto**
Cada sub-agente tiene skills asignados en ORCHESTRATION.md. Verificá que usó el
skill que correspondía y no improvisó con instrucciones genéricas. Señales de que
NO usó el skill:
- Output sin la estructura definida en el skill
- Campos con nombres distintos a los del schema
- Ausencia de campos de confianza cuando el skill los requiere
- Respuesta narrativa donde debería haber JSON estructurado

**3. Calidad del output**
- **Completitud:** ¿todos los campos relevantes están poblados? Los nulls son
  aceptables cuando el dato genuinamente no existe en la fuente. Un null donde
  el dato SÍ estaba disponible es una falla de extracción.
- **Precisión:** cruzar los datos extraídos contra el documento fuente. ¿Nombres
  correctos? ¿Montos correctos? ¿Fechas correctas? ¿Carátula correcta?
- **Coherencia interna:** ¿los campos de confianza son consistentes con la
  justificación? Un `confidence: 0.95` con `justificacion: "no se pudo determinar
  con certeza"` es una contradicción que hay que marcar.
- **Valor agregado:** ¿el output aporta algo útil al pipeline, o es una
  reformulación superficial del input?

**4. Manejo de incertidumbre**
- ¿Escaló cuando debía? (confidence bajo threshold → FLAG o STOP)
- ¿No escaló cuando no debía? (evitar false positives que traban el pipeline)
- ¿Fue transparente sobre lo que no pudo determinar?

**5. Eficiencia**
- Tiempo de ejecución razonable para la complejidad del caso
- Tokens usados proporcionales al output producido (un sub-agente que usa 50k
  tokens para producir 200 palabras tiene un problema)
- ¿Hubo loops o reintentos innecesarios?

---

### Criterios específicos por sub-agente

#### Rachel (Email Intake)

Rachel clasifica emails entrantes y los rutea. Dimensiones adicionales:
- ¿La clasificación del tipo de evento fue correcta? (sentencia, reclamo_pago,
  intimación, acuerdo, embargo, pericia, oficio)
- ¿Extrajo correctamente el nro_siniestro, nro_expediente, estudio remitente?
  Ojo con los STRO embebidos en carátulas — Rachel debe buscar agresivamente.
- ¿Aplicó el label de Gmail correcto?
- ¿Detectó correctamente si el email era reenviado y extrajo el remitente
  original?
- ¿El nivel de confianza fue calibrado? (no debería dar alta confianza en
  emails ambiguos)
- ¿Generó alertas cuando correspondía? (reclamo_pago y embargo son urgentes)

#### Donna (Ingestion)

Donna hace resumen de demanda y revisión formal. Dimensiones adicionales:
- ¿El resumen captura los hechos esenciales del caso, las pretensiones, y el
  monto reclamado?
- ¿La revisión formal identificó correctamente si hay documentación faltante
  o defectos formales?
- ¿Marcó como bloqueante lo que genuinamente impide continuar? (un defecto
  formal menor no debería ser bloqueante)
- ¿Identificó correctamente fuero, jurisdicción, juzgado?

#### Mike (Extraction)

Mike extrae datos estructurados del siniestro y la póliza. Dimensiones adicionales:
- ¿Extrajo correctamente todos los campos del claim summary? (partes, montos,
  fechas, tipo de siniestro, cobertura reclamada)
- ¿El tipo de intervención de la aseguradora es correcto? (citada en garantía,
  demandada directa, etc.)
- ¿Si había póliza, extrajo correctamente las coberturas, exclusiones, y sumas
  aseguradas?
- ¿Las referencias a artículos de ley son correctas?

#### Edu (Triage)

Edu ejecuta tres skills en paralelo: risk assessment, coverage opinion, viability
check. Dimensiones adicionales:
- ¿Los tres skills corrieron? (a veces uno falla silenciosamente)
- ¿El risk score es proporcional a la complejidad real del caso?
- ¿El dictamen de cobertura está fundamentado en las cláusulas de la póliza?
- ¿La viability check consideró caducidad, prescripción, y vigencia?
- ¿Hay contradicciones entre los tres outputs? (ej: risk dice "bajo riesgo" pero
  coverage dice "sin cobertura" — eso necesita reconciliación)

#### Jess (Drafting)

Jess produce borradores de contestación o rechazo de cobertura. Dimensiones
adicionales:
- ¿El borrador incorpora los hallazgos de Mike y Edu?
- ¿Las excepciones previas planteadas son procedentes?
- ¿Las negativas responden punto por punto a los hechos de la demanda?
- ¿El petitorio es coherente con la estrategia de defensa?
- ¿Las secciones marcadas como `requieren_revision` son genuinamente las que
  necesitan ojo humano?
- ¿Usó el template correcto? (contestación base vs. rechazo de cobertura)

#### Review (Red Team)

El verificador adversarial revisa el borrador de Jess. Dimensiones adicionales:
- ¿Identificó debilidades reales en el borrador?
- ¿Las correcciones propuestas son específicas y accionables?
- ¿Su evaluación es independiente? (no debería simplemente aprobar todo)
- Si rechazó, ¿la justificación es sólida?
- ¿Verificó consistencia entre el borrador y los outputs upstream?

---

## Auditoría de sistema

Estas dimensiones aplican al sistema completo, no a un caso individual. Se
evalúan agregando datos de múltiples casos y revisando los archivos de autocontrol.

### 1. Patrones de error recurrentes

Buscá en los daily logs y en regressions.md:
- ¿El mismo tipo de error aparece en 2+ casos? (ej: Mike falla en extraer
  STRO embebidos, Edu da confidence inflados)
- ¿Los guardrails existentes están previniendo las regresiones que motivaron
  su creación?
- ¿Hay errores nuevos que necesitan guardrails?

### 2. Efectividad de skills

Para cada skill activo:
- ¿Cuántas veces se usó en el período?
- ¿Cuál es la tasa de outputs con confidence alta vs media vs baja?
- ¿Cuántas veces generó una escalación que resultó ser innecesaria (false
  positive)?
- ¿Cuántas veces NO escaló cuando debía haber escalado (false negative)?
- ¿Hay skills que no se están usando? ¿Es porque no se necesitan o porque
  los sub-agentes no los están invocando?

### 3. Salud del pipeline

- Throughput: ¿cuántos casos se procesan por día/semana?
- Completion rate: ¿qué porcentaje llega a borrador sin STOP?
- Bottlenecks: ¿qué etapa consume más tiempo o genera más STOPs?
- Handoff quality: ¿la información que necesita cada etapa llega completa?

### 4. Estado del knowledge base

- ¿Qué normativa está ingestada y cuál no? (revisá `skills/knowledge/`)
- ¿Se referenciaron artículos que no están en el knowledge base?
- ¿Hay jurisprudencia citada que debería incorporarse?

### 5. Cumplimiento de SOUL.md

- ¿Ali está operando como orquestador y no como ejecutor?
- ¿Está siendo proactivo (señalando problemas antes de que se le pidan)?
- ¿Está rechazando outputs de baja calidad de los sub-agentes?
- ¿La memoria se está manteniendo actualizada?

### 6. Deuda técnica y friction

- Instrucciones contradictorias pendientes en friction-log.md
- Workarounds que se volvieron permanentes
- Procesos manuales que podrían automatizarse
- Configuraciones provisorias que nunca se formalizaron
