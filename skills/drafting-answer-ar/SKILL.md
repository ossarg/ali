---
name: drafting-answer-ar
description: Genera borrador completo de contestación de demanda para Libra Seguros, estilo Díaz Mariana, en español jurídico formal argentino. Estructura de 22 secciones con boilerplates verbatim y lógica condicional por tipo de caso.
---

> **Misión del borrador**: generar un documento con >95% de confianza en su contenido. Las secciones estándar (objeto, negativas, derecho, prueba) deben salir correctas y completas, sin necesidad de corrección. El formato, redacción y estilo deben ser 10/10. El tiempo del abogado debe ir al fondo de la cuestión, no a ajustes formales. El abogado construye arriba del borrador, no lo corrige.

> **Flujo de ejecución**: este skill define la estructura y reglas de la contestación. La ejecución se splitea en dos pasos:
> - **`drafting-prep-ar`** (Haiku): lee todos los inputs y boilerplates, produce `jess_prep.json` con boilerplates inline.
> - **`drafting-draft-ar`** (Sonnet): lee solo `jess_prep.json` + `style-guide-ar.md`, genera el borrador completo.
> Ver `pipeline/run-case.md` para el playbook completo de ejecución.

# Contestación de Demanda — Libra Compañía Argentina de Seguros S.A.

Genera borrador de contestación de demanda listo para revisión letrada. Reproduce fielmente el estilo, estructura, tono y doctrina de las contestaciones reales de Libra (corpus de 33 escritos, estilo Díaz Mariana).

## Principio rector

Este skill NO genera argumentación jurídica original. Ensambla secciones a partir de boilerplates verbatim extraídos de contestaciones reales, sustituyendo variables con datos del caso. Las secciones dinámicas (negativas particulares, verdad de los hechos, impugnación de rubros) se generan siguiendo patrones y tono del corpus.

---

## Directiva de estilo

Antes de redactar, leé `references/style-guide-ar.md`. Aplicá su registro, tono y patrones por sección. La guía de estilo es el estándar de calidad: si hay que elegir entre ensamblaje mecánico y prosa persuasiva, elegí prosa persuasiva.

El borrador tiene que ser indistinguible de lo que escribiría un abogado litigante experimentado. Las secciones estáticas se copian verbatim. Las secciones dinámicas (negativas, impugnación de rubros, verdad de los hechos, análisis de derecho) se redactan con el lenguaje y los patrones de la guía de estilo.

---

## Inputs requeridos

| Input | Fuente | Qué aporta |
|-------|--------|------------|
| `claim_summary` | extraction pipeline (Donna) | Partes, hechos, rubros, prueba ofrecida, tipo intervención |
| `policy_summary` | extraction pipeline (Mike) | Póliza, coberturas, suma asegurada, cláusulas, exclusiones |
| `edu_output` | triage pipeline | Defensas, cobertura, viabilidad. **Puede ser null** en modo paralelo |

**Si `edu_output` es null**: redactá igualmente la contestación completa. Asumí cobertura (caso default citación en garantía RC auto) y dejá secciones de estrategia como placeholder:
```
[COMPLETAR — ABOGADO: Pendiente análisis de triage. Revisar defensas de fondo y estrategia de responsabilidad.]
```

---

## Paso 0: Determinar encuadre procesal

Antes de redactar, clasificá el caso:

| Encuadre | Señal en `claim_summary` | Efecto |
|----------|--------------------------|--------|
| **Citación en garantía** | `action_type = guarantee_citation` o demandado es el asegurado + Libra citada | Estructura completa de 22 secciones. Incluir asume cobertura, límite, defensa juicio |
| **Acción directa** | `action_type = direct_claim` o actor demanda directamente a Libra | Sin sección de cobertura extensa. Foco en contrato de seguro + defensas contractuales |
| **Repetición ART** | Actora es una ART que subroga | Secciones especiales: contesta ILP, contable ART, excepción defecto legal |

**Default si no hay señal clara**: citación en garantía RC auto.

---

## Estructura canónica — 22 secciones

### Sección 1: TÍTULO
- **Tipo**: estático
- **Obligatoria**: ✅ siempre

Para el texto base, leé `references/boilerplates/encabezado-personeria.md`.

- Citación en garantía: `CONTESTA DEMANDA POR LA CITADA EN GARANTIA – OFRECE PRUEBA`
- Acción directa: `CONTESTA DEMANDA. OFRECE PRUEBA`

### Sección 2: ENCABEZADO — Presentación letrada
- **Tipo**: estático con variables
- **Obligatoria**: ✅ siempre

Para el texto base, leé `references/boilerplates/encabezado-personeria.md`.

Sustituí: `[CARATULA]`, `[NRO_EXPEDIENTE]`, `[AÑO]`, `[EMAIL]`, `[CUIT_ELECTRONICO]`.

### Sección 3: PERSONERÍA
- **Tipo**: estático
- **Obligatoria**: ✅ siempre

Para el texto base, leé `references/boilerplates/encabezado-personeria.md`.

- Citación en garantía → versión estándar
- Acción directa → versión alternativa

### Sección 4: OBJETO
- **Tipo**: estático con variables
- **Obligatoria**: ✅ siempre

Citación en garantía:
```
Que vengo en legal tiempo y forma a contestar la demanda de la cual se le ha corrido traslado a mi representada solicitando el rechazo de la pretensión impetrada por la parte actora, con expresa imposición de costas por las consideraciones de hecho y derecho que a continuación expondré.
```

### Sección 5: ASUME COBERTURA — DENUNCIA LÍMITE — FORMULA RESERVA
- **Tipo**: estático con variables
- **Obligatoria**: ✅ en citación en garantía | ❌ en acción directa
- **Largo**: ~1500-2500 chars

Para el texto base, leé `references/boilerplates/asume-cobertura.md`.

Sustituí con datos de `policy_summary`: `[NOMBRE_ASEGURADO]`, `[NRO_POLIZA]`, `[MARCA_MODELO]`, `[DOMINIO]`, `[MONTO_COBERTURA]`.

Si `policy_summary = null`:
```
[COMPLETAR — ABOGADO ⚠️: Póliza no encontrada en el pipeline. Completar datos de cobertura antes de presentar.]
```

### Sección 6: LÍMITE DE COBERTURA
- **Tipo**: estático (bloque doctrinal verbatim)
- **Obligatoria**: ✅ en citación en garantía | ❌ en acción directa
- **Largo**: ~6000-8000 chars

Para el texto base, leé `references/boilerplates/limite-cobertura.md`.

Este bloque se copia COMPLETO y VERBATIM. No resumir, no parafrasear, no omitir fallos. Contiene la cadena doctrinal completa: Stiglitz → CSJN Obarrio/Gauna → Buffoni → Flores → Aimar → Álvarez c/ Moscatelli.

### Sección 7: DEFENSA EN JUICIO DEL ASEGURADO
- **Tipo**: estático
- **Obligatoria**: ⚠️ frecuente en citación en garantía (12/22)
- **Largo**: ~300-400 chars

Para el texto base, leé `references/boilerplates/defensa-juicio-asegurado.md`.

Incluir siempre en citación en garantía a menos que conste que el asegurado no tiene abogado propio.

### Sección 8: CONTESTA DEMANDA — NEGATIVAS GENERALES Y PARTICULARES
- **Tipo**: estático (intro) + dinámico (negativas particulares)
- **Obligatoria**: ✅ siempre
- **Largo**: ~3000-8000 chars (30-54 negativas)

Para la fórmula introductoria, leé `references/boilerplates/negativa-general.md`.

**Generación de negativas particulares**: esta es la sección más importante del skill. Cada negativa sigue el patrón:

```
Niego que [SUJETO] [VERBO_SUBJUNTIVO] [COMPLEMENTO_ESPECIFICO].
```

**Fuentes para negativas**:
1. Cada hecho relatado en la demanda → una o más negativas
2. Cada rubro reclamado → negativas de procedencia y quantum
3. Cada documento acompañado → negativa de autenticidad si corresponde
4. Mecánica del accidente → negativas sobre dinámica, velocidad, responsabilidad
5. Nexo causal → negativas de causalidad
6. Daños alegados → negativas pieza por pieza si hay detalle

**Target de negativas**:
| Tipo de caso | Target |
|-------------|--------|
| Solo daños materiales | 30-40 |
| Con lesiones | 40-54 |
| Acción directa | 25-40 |
| Repetición ART | 46+ |

**Cierre obligatorio**:
```
Niego cada uno de los hechos y derechos invocados por la contraparte que no sean objeto de expreso reconocimiento en esta contestación.
```

### Sección 9: DESCONOCE DOCUMENTAL
- **Tipo**: estático con variables
- **Obligatoria**: ✅ (18/22)
- **Largo**: ~800-1500 chars

Para el texto base, leé `references/boilerplates/desconoce-documental.md`.

Sustituí `[LISTA_DOCUMENTAL_ACTORA]` con la enumeración de documentos acompañados por la actora, extraída del `claim_summary`.

### Sección 10: LA VERDAD DE LOS HECHOS
- **Tipo**: dinámico
- **Obligatoria**: ✅ en citación en garantía (18/22)
- **Largo**: ~1500-3000 chars

Redactá la versión de Libra sobre la mecánica del siniestro. Tono: minimizar la entidad del evento sin negar que ocurrió. Patrones del corpus:

- "se trató de un contacto leve de escasa entidad material"
- "propio de la dinámica habitual del tránsito urbano"
- "la propia dinámica del hecho permite advertir que no existió una colisión de entidad"
- "la pretensión indemnizatoria resulta manifiestamente desproporcionada"
- Cerrar con: "La determinación concreta de la entidad de los daños... deberá surgir de la prueba pericial mecánica"

Si hay lesiones graves o fallecimiento: **NO minimizar**. Dejar placeholder:
```
[COMPLETAR — ABOGADO: Siniestro con lesiones graves/fallecimiento. Redactar versión de hechos con criterio profesional. No minimizar la entidad del evento.]
```

### Sección 11: CULPA DE LA VÍCTIMA / HECHO DEL DAMNIFICADO
- **Tipo**: dinámico / condicional
- **Obligatoria**: ⚠️ condicional (8/22 — activa si hay indicios)
- **Largo**: ~1000-2500 chars

Incluir si del `claim_summary` surge que:
- La víctima iba en moto (falta de casco, velocidad, circulación por vereda)
- La víctima realizó maniobras imprudentes
- La víctima cruzó semáforo en rojo o violó normas de tránsito

Base normativa: art. 1729 CCyC (hecho del damnificado como eximente).

Si hay lesiones graves/fallecimiento: dejar placeholder para abogado (ver `references/conditional-sections.md`).

### Sección 12: DERECHO
- **Tipo**: estático
- **Obligatoria**: ✅ (14/22, pero incluir siempre)
- **Largo**: ~200-500 chars

Para el texto base, leé `references/boilerplates/derecho.md`.

- RC auto → versión estándar
- Repetición ART → versión extendida con arts. 957, 959, 961, etc.

### Sección 13: IMPUGNACIÓN DE RUBROS
- **Tipo**: estático (intro doctrinal) + dinámico (por rubro)
- **Obligatoria**: ✅ (20/22)
- **Largo**: ~3000-8000 chars

Para el bloque doctrinal base y los modelos por rubro, leé `references/boilerplates/impugna-rubros-base.md`.

**Orden de redacción**:
1. Encabezado de sección
2. Bloque doctrinal del daño (Bustamante Alsina) — SIEMPRE, verbatim
3. Cada rubro reclamado, uno por uno:

| Rubro | Modelo disponible | Condicional |
|-------|------------------|-------------|
| Daños materiales | `impugna-rubros-base.md` | Si se reclaman |
| Privación de uso | `impugna-privacion-uso.md` | Si se reclama |
| Desvalorización venal | `impugna-rubros-base.md` | Si se reclama |
| Daño moral | `impugna-rubros-base.md` | Si se reclama |
| Daño punitivo | Desarrollar extenso (~3000-5000 chars) | Si se reclama |
| Gastos médicos | Negar con exigencia de comprobantes | Si se reclaman |
| Incapacidad | Negar + exigir pericia médica | Si se reclama |
| Daño psicológico | Distinguir de daño moral + exigir pericia | Si se reclama |
| Lucro cesante | Negar + exigir prueba de ingresos | Si se reclama |

Para privación de uso, leé `references/boilerplates/impugna-privacion-uso.md`.

**Cierre de cada rubro**: `Niego que la accionante tenga derecho a percibir la suma de $[MONTO] en concepto de [RUBRO].`

### Sección 14: IMPUGNA LIQUIDACIÓN
- **Tipo**: estático con variables
- **Obligatoria**: ✅ (20/22)
- **Largo**: ~300-600 chars

```
IMPUGNA LIQUIDACION.

No obstante los desconocimientos efectuados precedentemente, se impugna por arbitraria y desmedida la liquidación practicada en autos la que asciende a la suma de $[MONTO_TOTAL_RECLAMO] ([MONTO_EN_LETRAS]), por no constarnos la procedencia de los rubros reclamados, asi como la magnitud de las consecuencias dañosas alegadas ni su eventual justipreciación.
```

### Sección 15: CONTESTA PLANTEO DE INTERESES
- **Tipo**: estático (bloque doctrinal verbatim)
- **Obligatoria**: ⚠️ condicional (10/22 — activar si la actora pide tasa activa)
- **Largo**: ~3000-5000 chars

Para el texto base, leé `references/boilerplates/contesta-intereses-samudio.md`.

**Señal de activación**: la demanda solicita intereses a tasa activa desde el hecho, o menciona el plenario Samudio, o pide capitalización de intereses.

### Sección 16: OFRECE PRUEBA
- **Tipo**: estático (base) + dinámico (pericias según caso)
- **Obligatoria**: ✅ siempre
- **Largo**: ~1500-4000 chars

**Prueba que siempre se ofrece**:
1. **Documental**: a) Copia de poder general; b) Copia de póliza; c) Copia denuncia de siniestro
2. **Confesional**: "Solicito se cite a la parte actora a absolver posiciones a tenor del pliego que oportunamente se acompañará, bajo apercibimiento de ley."

**Prueba condicional**:

| Prueba | Cuándo | Instrucción |
|--------|--------|-------------|
| Pericia mecánica | Todo RC auto | Adherir a la ofrecida por actora + puntos propios (6 puntos canónicos) |
| Informativa | Según caso | Oficios a policía, hospitales, bancos |
| Pericia médica | Lesiones | Puntos: existencia y grado de incapacidad, preexistencias, causalidad |
| Pericia psicológica | Daño psíquico/moral con lesiones | Puntos: existencia de patología, preexistencias, causalidad |
| Pericia contable | Repetición ART | Sobre la actora: pagos efectivos, respaldos, desglose |

**Puntos de pericia mecánica canónicos** (incluir siempre en RC auto):
1. Verifique y describa detalladamente los daños que presenta el vehículo del actor
2. Determine cuáles guardan relación directa y exclusiva con el contacto denunciado
3. Informe si la magnitud es compatible con la entidad del impacto
4. Indique si las piezas cuya sustitución se consigna resultan efectivamente necesarias o si corresponde reparación
5. Determine si el presupuesto se corresponde con los daños efectivamente constatados
6. Estime el costo razonable de reparación conforme valores de plaza vigentes

### Sección 17: OPOSICIÓN A PRUEBA DE LA ACTORA
- **Tipo**: estático
- **Obligatoria**: ⚠️ frecuente (14/22)
- **Largo**: ~600-1500 chars

Para el texto base, leé `references/boilerplates/oposicion-prueba-actora.md`.

Incluir siempre en citación en garantía:
- Oposición a confesional de citada en garantía
- Oposición a pericial contable (si la actora la ofreció y Libra reconoce cobertura)

### Sección 18: ART. 730 CCyC — TOPE DE COSTAS
- **Tipo**: estático (bloque doctrinal verbatim)
- **Obligatoria**: ⚠️ opcional pero recomendado (8/22)
- **Largo**: ~500-800 chars

Para el texto base, leé `references/boilerplates/tope-costas-730.md`.

Incluir cuando el monto reclamado es significativo (> $10.000.000 o criterio del abogado).

### Sección 19: FÓRMULA RESERVA DE DERECHOS
- **Tipo**: estático
- **Obligatoria**: ❌ opcional (6/22)
- **Largo**: ~200-400 chars

Solo incluir cuando hay defensas condicionales ("para el hipotético caso de que no se haga lugar a...").

### Sección 20: AUTORIZA
- **Tipo**: estático
- **Obligatoria**: ✅ siempre
- **Largo**: ~400-500 chars

Para el texto base, leé `references/boilerplates/autoriza.md`.

### Sección 21: RESERVA DEL CASO FEDERAL
- **Tipo**: estático
- **Obligatoria**: ✅ siempre (20/22)
- **Largo**: ~200-300 chars

Para el texto base, leé `references/boilerplates/reserva-federal.md`.

### Sección 22: PETITORIO
- **Tipo**: estático
- **Obligatoria**: ✅ siempre
- **Largo**: ~300-500 chars

Para el texto base, leé `references/boilerplates/petitorio.md`.

- Citación en garantía → versión con límite de cobertura
- Acción directa → versión estándar

---

## Diferencias por tipo de caso — Resumen rápido

| Sección | Citación garantía | Acción directa | Repetición ART |
|---------|:-:|:-:|:-:|
| Asume cobertura (5) | ✅ | ❌ | ✅ |
| Límite cobertura (6) | ✅ extenso | Solo mención breve | ✅ |
| Defensa juicio asegurado (7) | ✅ | ❌ | ❌ |
| La verdad de los hechos (10) | ✅ | ❌ | ❌ |
| Culpa víctima (11) | ⚠️ condicional | ❌ | ❌ |
| Contesta intereses (15) | ⚠️ condicional | ⚠️ condicional | ⚠️ condicional |
| Oposición prueba (17) | ✅ | ❌ | ❌ |
| Art. 730 (18) | ⚠️ opcional | ⚠️ opcional | ✅ |
| Excepción defecto legal | ❌ | ❌ | ⚠️ condicional |
| Contesta inconstitucionalidad | ❌ | ❌ | ⚠️ condicional |

---

## Targets de calidad

| Métrica | Target |
|---------|--------|
| **Largo total** | 35.000–55.000 chars |
| **Negativas particulares** | 30–54 según caso |
| **Secciones completadas** | ≥18/22 |
| **Secciones con placeholder** | ≤4 |
| **Boilerplates verbatim** | 100% fidelidad al texto de referencia |

### Largo por tipo de caso

| Tipo | Chars |
|------|-------|
| RC auto — solo daños materiales | ~35.000-45.000 |
| RC auto — con lesiones | ~50.000-70.000 |
| Acción directa | ~35.000 |
| Repetición ART | ~45.000-55.000 |

---

## Tono y registro

- **Registro**: español jurídico formal argentino
- **Tuteo procesal**: "V.S.", "a V.S. me presento y digo"
- **Persona gramatical**: primera persona singular para la letrada; tercera para la mandante
- **Estilo**: Díaz Mariana (secciones con títulos en mayúsculas, negativas numeradas, desarrollo doctrinal extenso con citas verbatim)

### Expresiones recurrentes obligatorias

| Usar | No usar |
|------|---------|
| "mi mandante" / "mi representada" / "mi conferente" | "la compañía" / "Libra" |
| "la actora" / "el actor" / "la accionante" | "el demandante" / "la parte reclamante" |
| "el libelo de inicio" / "el escrito de inicio" | "la demanda interpuesta" (solo en objeto) |
| "niego todos y cada uno de los hechos" | "rechazo los hechos" |
| "para el hipotético e improbable supuesto" | "en caso de" |
| "solicito su total rechazo con costas" | "pido que se rechace" |
| "en la medida del seguro" | "hasta el límite de la póliza" |
| "Proveer de conformidad, SERÁ JUSTICIA" | Cualquier otro cierre |

### Terminología fija

| Término interno | En escritos |
|----------------|-------------|
| Libra | "LIBRA COMPAÑÍA ARGENTINA DE SEGUROS S.A." / "mi mandante" / "mi representada" |
| Asegurado | "mi asegurado" / "el asegurado" / "el demandado" |
| Póliza | "póliza de seguro automotor N° [NRO_POLIZA]" |
| Siniestro | "siniestro N° [NRO_SINIESTRO]" / "el hecho de autos" / "el evento dañoso" |

---

## Señales condicionales

Para el mapeo completo de "si la demanda menciona X → incluir sección Y", leé `references/conditional-sections.md`.

---

## Output

El output es el texto plano del escrito judicial completo, listo para copiar a un procesador de textos. NO es JSON estructurado.

### Formato del documento Word

El output es un documento .docx con formato profesional listo para presentación judicial:

- **Títulos de sección**: Heading 1 (H1), en mayúsculas (ej: "NEGATIVAS GENERALES Y PARTICULARES")
- **Subtítulos**: Heading 2 (H2) (ej: "Sobre los daños de Servifamy S.R.L.")
- **Texto**: justificado, con indent de primera línea en cada párrafo
- **Listas numeradas**: usar listas numeradas de Word (no numeración manual "1.", "2.")
- **Negativas**: en prosa continua (no numeradas), agrupadas por tema
- **Espaciado**: sin espaciado espurio entre secciones. Cada sección empieza inmediatamente después del título
- **Campos COMPLETAR**: entre corchetes, MAYÚSCULA, rojo: `[COMPLETAR — ABOGADO: descripción]`
- **Notas internas**: entre corchetes, cursiva: `[NOTA INTERNA: descripción]`
- **Cierre**: "Proveer de conformidad, SERÁ JUSTICIA." en negrita

### Metadata al final del documento

Al final del escrito, incluir un bloque de metadata separado por `---`:

```
---
METADATA INTERNA — NO INCLUIR EN PRESENTACIÓN

Caso: [CARATULA]
Expediente: [NRO_EXPEDIENTE]
Tipo: [CITACION_GARANTIA / ACCION_DIRECTA / REPETICION_ART]
Generado por: Jess | Libra Legal AI
Fecha: [FECHA_GENERACION]

Secciones completadas: [N]/22
Secciones con placeholder: [LISTA]
Negativas generadas: [N]
Largo estimado: [N] chars

Secciones que requieren revisión:
- [SECCION]: [RAZON] (prioridad: [URGENTE/STANDARD])

Notas para el abogado:
- [NOTA_1]
- [NOTA_2]
---
```

---

## Reglas

1. **No parafrasees boilerplates**. El texto de `references/boilerplates/` se copia verbatim, sustituyendo solo las variables entre corchetes.
2. **No re-analicés lo que ya analizó triage**. Si `edu_output` dice que hay cobertura, asumí cobertura. Si dice que no, desarrollá la defensa de no cobertura.
3. **No inventés hechos ni cláusulas de póliza**. Solo usá datos de `claim_summary` y `policy_summary`.
4. **No minimicés lesiones graves ni fallecimiento**. Dejar placeholder para el abogado.
5. **Toda sección vacía → placeholder explícito**: `[COMPLETAR — ABOGADO: descripción]`. Nunca dejar secciones en blanco.
6. **El silencio es reconocimiento** (art. 356 inc. 1 CPCCN). Si no podés negar un hecho por falta de datos, incluilo en la sección de metadata como "hecho no cubierto" con advertencia de riesgo procesal.
7. **Largo mínimo**: una contestación de RC auto con solo daños materiales no debe bajar de 35.000 chars. Si queda corta, expandir negativas y desarrollo de impugnación de rubros.
8. **Castellano**: todo el escrito en español. Sin anglicismos, sin términos en inglés.
9. **Jurisprudencia solo del corpus**: solo citá fallos que aparezcan en los boilerplates de referencia o en la base de jurisprudencia del sistema. No busqués ni inventés citas. Si una sección se beneficiaría de jurisprudencia y no hay disponible, marcá: `[NOTA INTERNA: Este argumento se fortalecería con jurisprudencia sobre [TEMA]. Verificar en la base de precedentes de Libra.]`

---

## Normativa de referencia

| Norma | Artículos clave | Uso |
|-------|----------------|-----|
| **Ley 17.418** | Art. 118 (citación en garantía), art. 56, art. 70 | Base de toda contestación |
| **CPCCN** | Art. 356 (contestación), art. 333 (prueba), art. 478 (desinterés pericia) | Procedimiento |
| **CCyC** | Arts. 1729, 1744, 1726, 730 | Responsabilidad civil, daño, tope costas |
| **Ley 24.432** | Art. 1° (tope 25% costas) | Tope de costas |
| **Ley 48** | Art. 14 | Reserva federal |
| **Ley 24.449** | Arts. 50, 68 | Tránsito |

### Fallos CSJN más citados

| Fallo | Uso |
|-------|-----|
| **Buffoni** (Fallos 337:329) | Oponibilidad límite de cobertura |
| **Flores c/ Gimenez** (CSJ 678/2013) | Naturaleza contractual |
| **Álvarez c/ Moscatelli** (14/12/2023) | Ratificación más reciente |
| **Martínez de Costa c/ Vallejos** (CSJ 1319/2008) | LDC no modifica ley especial |
| **Samudio c/ Transportes 270** (Plenario CNCiv) | Tasa de interés |
