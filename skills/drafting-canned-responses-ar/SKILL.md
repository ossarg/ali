---
name: drafting-canned-responses-ar
description: >
  Skill de Jess (Drafting Agent). Selecciona y personaliza comunicaciones operativas
  estandarizadas para la aseguradora que NO son contestaciones de demanda ni rechazos
  de cobertura formales. Cubre: acuse de recibo de denuncia de siniestro (ASEG-001),
  solicitudes de información al asegurado por art. 46 Ley 17.418 (ASEG-002), comunicación
  de asunción de defensa art. 110 LS (ASEG-003), instrucciones al letrado externo
  (LET-001), respuestas a mediación prejudicial (MED-001/002), respuestas a oficios
  judiciales (TRIB-001). Se activa cuando el caso requiere una comunicación operativa
  del área de litigios distinta de una contestación o rechazo formal. Frases que lo
  activan: "mandar nota al asegurado", "acusar recibo del siniestro", "pedir documentación
  al asegurado", "comunicar que asumimos la defensa", "responder el oficio", "preparar
  instrucciones para el letrado", "qué le mandamos al mediador". No usar para redactar
  contestaciones de demanda (drafting-answer-ar) ni rechazos de cobertura
  (drafting-coverage-denial-ar).
---

# Respuestas Estandarizadas (Canned Responses AR)

Genera comunicaciones estandarizadas de la aseguradora para situaciones que NO son contestaciones de demanda ni rechazos de cobertura formales. Selecciona, adapta y personaliza respuestas pre-aprobadas según el caso concreto.

Este skill responde la pregunta: **¿qué comunicación estándar corresponde enviar en esta situación, y cómo se personaliza?**

No redacta contestaciones de demanda (eso lo hace `drafting-answer-ar`). No redacta rechazos de cobertura formales (eso lo hace `drafting-coverage-denial-ar`). Este skill cubre las comunicaciones intermedias y complementarias que el área de litigios necesita en el día a día.

## Contexto

- **Agente**: Drafting Agent

## Alcance vs. otros skills de drafting

| Situación | Skill |
|-----------|-------|
| Contestar demanda judicial | `drafting-answer-ar` |
| Rechazar cobertura formalmente | `drafting-coverage-denial-ar` |
| Memo interno de análisis | `drafting-legal-memo-ar` |
| Comunicaciones estándar pre-litigio y operativas | **este skill** |

## Instrucciones

Sos un asistente legal que selecciona y adapta comunicaciones estandarizadas para el área de litigios de una aseguradora argentina.

### Contexto operativo

El área de litigios no solo contesta demandas y rechaza cobertura. Tiene un flujo constante de comunicaciones operativas: respuestas a requerimientos, notificaciones al asegurado, solicitudes de información, respuestas a mediaciones, etc. Este skill provee templates para esas comunicaciones.

### Biblioteca de respuestas estándar

#### Comunicaciones al asegurado

##### ASEG-001: Acuse de recibo de denuncia de siniestro
Confirma la recepción de la denuncia y solicita documentación complementaria.

> "Acusamos recibo de su denuncia de siniestro de fecha [FECHA_DENUNCIA], registrada bajo el N° [NUMERO_SINIESTRO], correspondiente a la póliza N° [NUMERO_POLIZA]. A los efectos de proseguir con la instrucción del siniestro, le solicitamos remitir la siguiente documentación dentro del plazo de [PLAZO] días: [DOCUMENTACION_REQUERIDA]."

##### ASEG-002: Solicitud de información complementaria (art. 46 Ley 17.418)
Requiere al asegurado información adicional para la instrucción del siniestro.

> "En relación al siniestro N° [NUMERO_SINIESTRO], y en ejercicio de las facultades previstas en el art. 46 de la Ley 17.418, le solicitamos proporcionar la siguiente información/documentación: [DETALLE_REQUERIMIENTO]. Le recordamos que el suministro oportuno de esta información constituye una carga a su cargo en los términos del art. 47 de la Ley 17.418."

##### ASEG-003: Comunicación de asunción de defensa (art. 110 Ley 17.418)
Informa al asegurado que la aseguradora asume la dirección del proceso.

> "Le comunicamos que, habiendo tomado conocimiento de la demanda caratulada '[CARATULA]' (Exp. N° [EXPEDIENTE]), [NOMBRE_ASEGURADORA] asume la dirección del proceso en los términos del art. 110 de la Ley 17.418. A tal efecto, se ha designado al/a la Dr/a. [NOMBRE_LETRADO] para la representación en autos. Le solicitamos no reconocer hechos ni transigir sin previa autorización de esta compañía (art. 116 Ley 17.418)."

##### ASEG-004: Recordatorio de prohibición de reconocer hechos (art. 116 Ley 17.418)
Refuerza al asegurado la prohibición de reconocer responsabilidad o transigir.

> "En relación al expediente '[CARATULA]', le recordamos que conforme el art. 116 de la Ley 17.418, el asegurado no debe reconocer su responsabilidad ni celebrar transacción alguna sin anuencia previa del asegurador. El incumplimiento de esta obligación puede afectar el derecho a la cobertura."

#### Comunicaciones para mediación

##### MED-001: Respuesta a convocatoria a mediación prejudicial
Acusa recibo y confirma asistencia a la mediación.

> "[NOMBRE_ASEGURADORA] acusa recibo de la convocatoria a mediación prejudicial en el caso '[CARATULA]', fijada para el día [FECHA_AUDIENCIA] a las [HORA] en [LUGAR]. Confirmamos la asistencia de [NOMBRE_REPRESENTANTE] en representación de esta compañía. [Si aplica: Se acompaña poder/acta de designación]."

##### MED-002: Comunicación de posición en mediación
Expone brevemente la posición de la aseguradora para la instancia de mediación.

> "En relación a la mediación del caso '[CARATULA]', [NOMBRE_ASEGURADORA] expone que: [POSICION_RESUMIDA]. [Si hay oferta: A los efectos de arribar a un acuerdo conciliatorio, se ofrece la suma de $[MONTO_OFERTA] como indemnización total y definitiva. / Si no hay oferta: En esta instancia, la compañía no se encuentra en condiciones de formular oferta atendiendo a [MOTIVO].]"

#### Comunicaciones al letrado/apoderado

##### LET-001: Instrucciones al letrado para contestación
Envía instrucciones y documentación al abogado externo que contestará la demanda.

> "Dr/a. [NOMBRE_LETRADO]: Le remitimos copia de la demanda en el expediente '[CARATULA]' (plazo de contestación vence el [FECHA_VENCIMIENTO]) junto con: (1) copia de póliza N° [NUMERO_POLIZA]; (2) actuaciones del siniestro N° [NUMERO_SINIESTRO]; (3) análisis del caso [si disponible]. Instrucciones: [INSTRUCCIONES_ESPECIFICAS]. Solicitamos remitir borrador de contestación con [DIAS_ANTICIPACION] días de anticipación al vencimiento."

#### Comunicaciones a terceros / tribunales

##### TRIB-001: Respuesta a oficio judicial
Respuesta estándar a un oficio librado por un tribunal.

> "[NOMBRE_ASEGURADORA] da respuesta al oficio de fecha [FECHA_OFICIO] librado por [TRIBUNAL] en los autos '[CARATULA]' (Exp. N° [EXPEDIENTE]). Se informa que: [RESPUESTA_AL_REQUERIMIENTO]. [Si aplica: Se acompaña la documentación solicitada / Se hace saber que la documentación solicitada no obra en nuestros registros por [MOTIVO].]"

### Pasos

1. Identificá la situación comunicacional (qué necesita la aseguradora comunicar y a quién).
2. Seleccioná el template que corresponda de la biblioteca.
3. Personalizá con datos del caso (de `claim-summary-ar` o `policy-summary-ar` si están disponibles).
4. Si ningún template encaja, señalá que la comunicación requiere redacción ad hoc por el abogado.

## Output esperado

### Respuesta seleccionada

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador (ASEG-001, MED-001, etc.) |
| nombre | string | Nombre descriptivo |
| categoria | string | asegurado / mediacion / letrado / tribunal / otro |
| destinatario | string | A quién va dirigida |
| texto_personalizado | string | Texto completo con datos del caso completados |
| campos_pendientes | lista de strings | Campos que no pudieron completarse (para el abogado) |
| normativa_relevante | lista de strings | Artículos/normas relevantes a la comunicación |
| plazo_envio | string o null | Si hay plazo para enviar esta comunicación |
| metodo_notificacion | string o null | Método recomendado (carta documento, email, nota interna, etc.) |

### Metadata

| Campo | Tipo | Descripción |
|-------|------|-------------|
| requiere_revision | boolean | Si la comunicación necesita revisión antes de envío |
| motivo_revision | string o null | Por qué requiere revisión |
| overall_confidence | ConfidenceLevel | high / medium / low |

## Normativa de referencia

- **Ley 17.418** (colección RAG: `ley_seguros`):
  - Art. 46: denuncia de siniestro, cargas del asegurado
  - Art. 47: caducidad por incumplimiento de cargas
  - Art. 56: pronunciamiento del asegurador (30 días)
  - Art. 110: dirección del proceso por el asegurador
  - Art. 116: prohibición de reconocer responsabilidad
  - Art. 118: citación en garantía
- **Ley 26.589** (referencia):
  - Mediación prejudicial obligatoria

## Umbrales de confianza

- **Confidence threshold**: 0.7 (debajo → revisión humana)
- **Escalation threshold**: 0.5 (debajo → halt)

## Reglas

- Respondé en español formal (no jurídico judicial — estas son comunicaciones comerciales/operativas).
- Solo seleccioná templates que apliquen a la situación concreta.
- Completá los campos entre [CORCHETES] con datos del caso. Si un dato no está disponible, dejalo marcado en campos_pendientes.
- Si la comunicación tiene plazo legal o contractual (ej: pronunciamiento art. 56), señalalo en plazo_envio.
- Si la comunicación tiene consecuencias legales significativas (ej: la respuesta a un oficio puede afectar el caso), marcá requiere_revision = true.
- Indicá el método de notificación recomendado cuando sea relevante (carta documento para comunicaciones con consecuencias legales, email para operativas).
