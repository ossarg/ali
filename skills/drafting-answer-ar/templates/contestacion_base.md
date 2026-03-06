# Template: Contestación de Demanda — Base

## Uso
Partes estáticas del escrito de contestación de demanda.
Los campos entre `{{CAMPO}}` se completan con datos del caso.
Las secciones marcadas con `[DINÁMICO]` son generadas por el LLM.

---

## Encabezamiento

**{{TRIBUNAL}}**

**Expediente N°:** {{NUMERO_EXPEDIENTE}}

**Carátula:** "{{CARATULA}}"

---

## Objeto

**CONTESTA DEMANDA — OPONE EXCEPCIONES**

Señor Juez:

{{NOMBRE_REPRESENTANTE}}, en representación de **{{NOMBRE_ASEGURADORA}}** (CUIT {{CUIT_ASEGURADORA}}), con domicilio real en {{DOMICILIO_REAL}}, constituyendo domicilio procesal electrónico en {{DOMICILIO_ELECTRONICO}}, en los autos caratulados "{{CARATULA}}" (Expte. N° {{NUMERO_EXPEDIENTE}}), a V.S. respetuosamente digo:

Que vengo a contestar la demanda interpuesta por {{NOMBRE_DEMANDANTE}}, en todas sus partes, solicitando su total rechazo con expresa imposición de costas a la actora, por las razones de hecho y de derecho que a continuación se exponen.

---

## I. NEGATIVA GENERAL

En los términos del art. 356 inc. 1° del Código Procesal Civil y Comercial de la Nación, **niego todos y cada uno de los hechos expuestos en la demanda** que no sean objeto de expreso reconocimiento en el presente escrito.

En particular, niego:
- La existencia y extensión de los daños reclamados.
- La relación de causalidad alegada.
- La responsabilidad atribuida.
- La procedencia y cuantificación de cada uno de los rubros reclamados.

---

## II. NEGATIVAS ESPECÍFICAS

`[DINÁMICO — El LLM genera negativa punto por punto de los hechos de la demanda]`

---

## III. LOS HECHOS SEGÚN MI MANDANTE

`[DINÁMICO — El LLM genera la versión del siniestro desde la perspectiva de la aseguradora]`

---

## IV. LA PÓLIZA DE SEGUROS

`[DINÁMICO — El LLM referencia las cláusulas de póliza relevantes]`

---

## V. EXCEPCIONES

`[DINÁMICO — El LLM incluye excepciones previas si corresponden]`

---

## VI. DEFENSAS DE FONDO

`[DINÁMICO — El LLM desarrolla las defensas de fondo aplicables]`

---

## VII. IMPUGNA MONTO

Para el hipotético e improbable caso de que V.S. hiciera lugar a la demanda, impugno los montos reclamados por excesivos, desproporcionados y carentes de todo respaldo probatorio.

Subsidiariamente, solicito que la eventual condena se limite al monto de cobertura de la póliza N° {{NUMERO_POLIZA}}, esto es la suma de {{SUMA_ASEGURADA}}, con más la franquicia de {{FRANQUICIA}} a cargo del asegurado.

---

## VIII. OFRECE PRUEBA

En los términos del art. 333 del CPCCN, ofrezco la siguiente prueba:

### A. Documental
Se acompañan los siguientes documentos:
1. Copia de la póliza N° {{NUMERO_POLIZA}} con sus condiciones generales, particulares y especiales.
2. Actuaciones del siniestro N° {{NUMERO_SINIESTRO}}.
`[DINÁMICO — Documentos adicionales según el caso]`

### B. Informativa
`[DINÁMICO — Oficios según el caso]`

### C. Pericial
`[DINÁMICO — Pericias según el caso]`

### D. Testimonial
`[DINÁMICO — Testigos según el caso]`

### E. Confesional
Se cite a absolver posiciones al actor, bajo apercibimiento de ley.

---

## IX. RESERVA DEL CASO FEDERAL

Hace reserva del caso federal para el supuesto de que la resolución que se dicte resulte contraria a los derechos de mi mandante, en los términos del art. 14 de la Ley 48.

---

## X. PETITORIO

Por todo lo expuesto, a V.S. solicito:

1. Se tenga por contestada la demanda en tiempo y forma.
2. Se tengan por opuestas las excepciones planteadas.
3. Se tenga por ofrecida la prueba.
4. Oportunamente, se rechace la demanda en todas sus partes, con expresa imposición de costas a la actora.

**Proveer de conformidad.**

**SERÁ JUSTICIA.**

---

*Template v1.0 — Libra Legal AI*
*Última actualización: 2026-03*
