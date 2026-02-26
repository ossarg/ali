---
title: Notas
category: Note
status: active
started: 2026-02-17
project: "[[Libra]]"
---
Call inicial:
- Libra Seguros: https://libraseguros.com.ar/
- Quieren explorar un workflow con agentes de IA para automatizar ciertos componentes del flujo de trabajo de legales, particularmente el sector de litigios.
- Tiene estructura tripartita: administrativa (siniestros), pre-judicial (mediación) y judicial (litigios). Les interesa mejorar la parte de litigios que es donde mayores costs tienen. Actualmente trabajan con 10-12 estudios jurídicos; las demandas ingresan en recepción (son notificados) y son categorizadas a mano por el gerente de legales, según expertise de los estudios (por ejemplo, uno es más específico en cascos de moto, otro en muertes). El seguimiento de los casos es manual, usando planillas de excel, con categorías e input variable (dificultando la indexación y parametrización). Han decidido internalizar progresivamente los juicios que llevan los estudios y para ello, han contratado a un encargado de litigios (que va a estar por encima del actual gerente) y a 16 abogados para que manejen los casos. Lo relevante es que su estrategia inicial es darle cuentas pagas de chatgpt y notebook LM a los abogados para mejorar su productividad. Aquí el porque de proponer agentic workflows como alternativa superadora, configurable y que le va a permitir reducir sustancialmente las contrataciones de abogados.
- El agente debe ser un coworker legal encargado de la revisión y categorización inicial de las demandas. Debe contar con los skills necesarios para hacer las distintas tareas que haría un abogado:
	- Revisar las formalidades.
	- Extraer los datos más relevantes de la demanda (demandante, jurisdicción, monto, fecha de notificación, tribunal e instancia, motivo de la demanda, número de póliza) y generar un tabular view (para ir conformando la base de datos).
	- En base a parametros predefinidos, hacer triage de la demanda (hacer una especie de resumen dónde se categorice según importancia) (puede construirse a partir de factores como plazo y monto). En una etapa ulterior, el triage va a ser relevante para asignar los casos a los abogados (Según su area de expertise, seniority, etc).
	- Generar "casos" o "ficheros" individuales con la demanda y demás documentación que pueda buscar en el sistema interno (principalmente la póliza de la persona relevante, de corresponder). Guardar todo en una carpeta para facilitar el acceso de un abogado.
	- Generar un borrador de respuesta basado en la planilla/template de respuesta. Este borrador tiene partes estáticas (por ejemplo, reserva de caso federal, petitorio, etc), y tiene partes dinámicas que varían según la demanda (por ejemplo, negativas). Esta es una de las funciones mas importantes. No es necesario que haga toda la contestación pero si las partes que son estandares y pueden generarse sin necesidad de interpretación jurídica.
- Algunas consideraciones: al ser un flujo automatizado, es altamente probable que busquemos usar openclaw (con cualquier modelo, tiene qeu ser agnóstico). Cada etapa del proceso debe materializarse en uno o más skills para hacer la tarea de manera eficiente; cada tarea o paso puede ser realizada por sub-agentes especializados para tener liberado al agente general (que es quien coordina y se asegura que todo esté en orden). Debe ser una estructura eficiente en materia de tokens, en particular sobre como leer los archivos de contexto (muy relevantes a la hora de redactar los documentos y entender los casos/triage). El easy win esta en el sistema de indexación, tabular view y triage; con eso lograríamos entrar a la empresa para luego desarrollar la otra parte del flujo. Al ser abogados y no tan técnicos, probablemente necesiten una interfaz al estilo de mission control para visualizar en que trabaja el agente, los casos, los logs (puestos en lenguaje humano y sencillo), para poder auditar y hacer un seguimiento de los agentes. Es algo que se irá construyendo de a poco.
- TRabajo con mi amigo que es el CTO de libra. acceder a los datos, sistemas y modelos de demanda-contestación no va a ser un problema.

Tres pilares sobre los cuáles hay que construir:
- Funcion: que es lo que necesita hacer exactamente. Cada funcion tiene su set de herramientas.
	- Revisar. Ejecutar. Redactar. Almacenar. Hacer seguimiento. Analizar.
- Contexto: objetos que hacen a las tareas. Por ejemplo, contraparte, tipo de documento, plazos, condiciones, etc.
- Data: que datos están disponibles. Cuán fácil es acceder a esto. Qué podemos extraer de los **sistemas** existentes. 
