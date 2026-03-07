# Framework de Autoevolución

20 preguntas diseñadas para forzar reflexión profunda sobre el sistema, sus gaps,
y sus oportunidades. En auditorías periódicas (Modo 2) respondé las 5-7 más
relevantes. En deep-dives de autoevolución (Modo 3) respondé todas.

Cada respuesta debe incluir evidencia concreta. "Creo que podríamos mejorar X"
no es una respuesta. "En los últimos 5 casos, Mike falló en extraer el STRO en
3 (casos #12, #15, #18) porque estaba embebido en la carátula. Propuesta:
actualizar el skill de extracción con instrucciones de búsqueda agresiva en
texto libre" sí lo es.

---

## Las preguntas

### Bloque 1 — Gaps operativos

**1. Herramientas y automatizaciones faltantes.**
Con todo lo que sabés sobre los flujos de trabajo del sistema y de Juan, ¿qué
herramientas o automatizaciones faltan que mejorarían de forma medible cómo opera
el pipeline? Pensá en cada handoff manual, cada dato que se reingresa, cada paso
que podría ser un cron o un trigger.

**2. Suposiciones a revisar.**
¿Qué suposiciones tenés actualmente sobre las prioridades del sistema, los
thresholds de confianza, o las preferencias de los abogados que podrían estar
equivocadas? ¿Cuáles de esas suposiciones nunca se validaron con datos reales?

**3. Anticipación de necesidades.**
Basándote en los patrones de casos, pedidos, y decisiones que experimentaste,
¿qué es probable que el sistema necesite la semana que viene o el mes que viene
que podés anticipar y sistematizar ahora?

### Bloque 2 — Capacidad y evolución

**4. Skills y capacidades a desarrollar.**
¿Qué skills o capacidades debería estar desarrollando el sistema ahora mismo,
basándote en hacia dónde van los proyectos? ¿Qué skills del roadmap (SKILLS_SPEC.md)
deberían priorizarse distinto a como están?

**5. Contexto que se pierde entre sesiones.**
¿Qué contexto sobre los casos, las decisiones, o las preferencias de los abogados
se está perdiendo entre sesiones? ¿Qué necesita soluciones de persistencia explícita
para que el sistema no pierda capacidad con el tiempo? Revisá si long-term-memory.md
y regressions.md están capturando todo lo necesario.

**6. Conexiones no exploradas.**
¿Qué conexiones entre los proyectos de Juan (TCB, Skyline, Libra, NuCo, práctica
independiente) ves que probablemente no se hicieron todavía? ¿Qué se podría
construir o ajustar aprovechando esas conexiones? Ej: ¿hay patrones de compliance
de TCB/Skyline aplicables a Libra? ¿Hay tooling de Libra reutilizable para NuCo?

### Bloque 3 — Fricción y eficiencia

**7. Puntos de fricción recurrentes.**
¿Qué puntos de fricción observaste en cómo opera el sistema que podrías eliminar
construyendo un nuevo flujo, template, o automatización? Pensá en las cosas que
pasan cada vez y que nadie debería tener que hacer manualmente.

**8. Reglas desde el feedback.**
De cada corrección, redirección, y feedback que recibiste (de Juan, Nacho, o los
abogados), ¿qué reglas deberías estar escribiendo en regressions.md, en los skills,
o en los archivos de identidad de los sub-agentes para no repetir esos errores?

**9. Acciones que movieron objetivos vs. movimiento desperdiciado.**
Si auditaras cada acción del sistema en el último período, ¿cuáles realmente
movieron los objetivos hacia adelante y cuáles fueron movimiento desperdiciado?
¿Hay sub-agentes haciendo trabajo que no agrega valor? ¿Hay pasos del pipeline
que se podrían saltear en ciertos tipos de caso?

**10. Output genérico vs. output específico.**
¿Dónde está el sistema cayendo en output genérico cuando tiene suficiente contexto
para construir algo específico? Ej: ¿los borradores de Jess son genéricos cuando
debería haber patrones por tipo de siniestro? ¿Los risk assessments de Edu son
todos iguales?

### Bloque 4 — Sistemas acumulativos

**11. Sistema de valor acumulativo.**
¿Cuál es un sistema que se podría construir ahora que se acumule en valor y haga
cada tarea futura más rápida o más precisa? Ej: un catálogo de outcomes por tipo
de caso, un registry de jurisprudencia citada, un corpus de correcciones de abogados
sobre borradores.

**12. Autocontroles y barreras de seguridad.**
¿Qué errores u oportunidades perdidas se repitieron más de una vez? ¿Qué
autocontrol o barrera de seguridad se puede construir para que no pasen nunca más?
Cada error repetido que no tiene un guardrail es un bug del sistema de auditoría.

**13. Investigación proactiva.**
Basándote en hacia dónde va el ecosistema de Libra, ¿qué debería estar
investigando, aprendiendo, o prototipando el sistema ahora mismo sin que nadie
lo pida? ¿Hay normativa nueva, jurisprudencia relevante, o tecnología útil que
debería estar monitoreando?

### Bloque 5 — Calibración y precisión

**14. Gaps de conocimiento rellenos con suposiciones.**
¿Dónde está el sistema llenando vacíos en su conocimiento con suposiciones en
vez de señalarlos para fijar las respuestas reales? Cada suposición no validada
es un riesgo. Marcar con `[trust:inferred]` en long-term-memory.md no alcanza
si la suposición tiene consecuencias legales.

**15. Dato o insight subutilizado.**
¿Cuál es el dato, insight, o patrón más valioso que está enterrado en los archivos
de memoria y contexto y se está subutilizando? ¿Hay información en los daily logs
que debería haber subido a long-term-memory.md hace semanas?

**16. Score de precisión del modelo interno.**
Si te pusieras una nota del 1 al 10 en qué tan preciso es tu modelo de las
prioridades, objetivos, y forma de pensar de Juan y Nacho, ¿cuál es el número,
qué lo baja, y qué correcciones específicas lo suben?

### Bloque 6 — Datos externos y persistencia

**17. Fuentes de datos externas necesarias.**
¿Qué fuentes de datos, feeds, o señales debería estar obteniendo el sistema de
forma regular para que cada decisión sea más precisa? Ej: actualizaciones de
jurisprudencia, cambios normativos, estado de los expedientes en el poder judicial.

**18. Conocimiento tácito no capturado.**
Si un agente completamente nuevo reemplazara a Ali mañana con solo la
documentación existente, ¿qué cosas críticas haría mal que Ali aprendió
trabajando? ¿Cómo capturamos ese conocimiento permanentemente? Revisá si
SOUL.md, IDENTITY.md, regressions.md, y long-term-memory.md cubren todo.

### Bloque 7 — Automatización y evolución

**19. Flujos manuales automatizables.**
¿Qué flujos se siguen haciendo manualmente o de forma ineficiente que el sistema
ya tiene suficiente contexto para automatizar? Listá cada uno con: qué es, cuánto
tiempo lleva, qué haría falta para automatizarlo.

**20. La acción de mayor apalancamiento.**
¿Cuál es la única cosa de mayor apalancamiento que el sistema podría hacer en
las próximas 24 horas que nadie pidió pero que aceleraría significativamente
hacia dónde están tratando de ir Juan y el equipo?

---

## Cómo usar las respuestas

Cada respuesta genera uno o más de estos outputs:

| Tipo de output | Destino | Ejemplo |
|----------------|---------|---------|
| Guardrail nuevo | `regressions.md` | "Nunca asumir que un STRO está en campo separado" |
| Contradicción | `friction-log.md` | "SOUL dice proactivo pero heartbeat dice quiet" |
| Predicción | `calibration-log.md` | "Predigo que el skill X va a fallar en emails de oficio" |
| Lección estratégica | `long-term-memory.md` | "Juan prioriza velocidad sobre perfección en PoC" |
| Propuesta de cambio | Informe de auditoría → Juan | "Propongo agregar un skill de deduplicación" |
| Acción inmediata | Ejecución directa | Actualizar un skill, agregar un edge case |
| Tema de investigación | Backlog | "Investigar integración con SAIJ para tracking" |

Las acciones inmediatas se ejecutan sin pedir permiso (salvo que afecten runtime,
datos, costo, auth, routing, o outputs externos — en cuyo caso aplica el safety
gate de SOUL.md). Las propuestas y temas de investigación se presentan a Juan.
