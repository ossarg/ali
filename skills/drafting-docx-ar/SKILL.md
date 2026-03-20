---
name: drafting-docx-ar
description: >
  Skill de Jess (Drafting Agent). Genera el archivo DOCX de contestación de demanda
  o citación en garantía de Libra Seguros, listo para que el abogado abra en Word,
  complete los placeholders y presente. Se activa cuando el pipeline completó triage
  y extracción y hay que producir el escrito judicial final. Frases que lo activan:
  "generar el DOCX", "crear la contestación en Word", "producir el escrito",
  "armar el borrador para el abogado", "generar el archivo editable". Es el paso
  final de Jess — siempre corre después de drafting-answer-ar o drafting-coverage-denial-ar.
---

# Drafting DOCX AR — Contestación de Demanda / Citación en Garantía

Genera el archivo DOCX de contestación para Libra Seguros según el estilo y estructura
de sus escritos reales. El abogado lo recibe, completa los placeholders y presenta.

**Requisito previo:** outputs de Donna (clasificación), Mike (extracción), Edu (triage).
**Output:** archivo `.docx` editable en MS 365, más `datos.json` con la estructura interna.

---

## Contexto del escrito

Libra es siempre la **demandada directa** o la **citada en garantía** (art. 118 Ley 17.418).
El escrito que genera este skill es siempre a favor de Libra — nunca del actor.

### Tipos de escrito
Determiná el tipo según la demanda:
- **CONTESTA DEMANDA – OFRECE PRUEBA** → Libra es demandada directa
- **CONTESTA DEMANDA CITADA EN GARANTÍA – OFRECE PRUEBA** → Libra es citada en garantía por su asegurado
- **CONTESTA CITACIÓN EN GARANTÍA. OFRECE PRUEBA.** → mismo caso, variante de formato

El tipo va en el título del documento, en MAYÚSCULAS, centrado.

---

## Estructura del escrito (secciones en orden)

Usá numeración romana. Cada sección tiene su encabezado en negrita.

### Encabezado (antes de la numeración)

```
[TÍTULO DEL ESCRITO — ver tipos arriba]

Señor Juez:

[NOMBRE LETRADO] ([T° __] [F° __] CPACF, CUIT [CUIT], Monotributista), letrada apoderada,
mail: [MAIL — A COMPLETAR], constituyendo domicilio legal en la calle Olazabal 1515, piso 5
of. 505, CABA, y domicilio electrónico [CUIT], en los autos caratulados: "[CARÁTULA]"
(Expediente N° [N° EXPEDIENTE]), a V.S. me presento y digo:
```

**Regla:** el nombre del letrado y el mail siempre son placeholders `[A COMPLETAR]` salvo que Mike los haya extraído de la demanda.

---

### I. PERSONERÍA

```
Que tal como surge de la copia de poder general que acompaño, que declaro bajo juramento
es fiel a su original que se encuentra vigente, soy mandataria de LIBRA COMPANIA ARGENTINA
DE SEGUROS S.A., con domicilio real en Olazábal 1515, piso 5 of. 505, de la Ciudad de
Buenos Aires.
En el carácter invocado, vengo a contestar la [demanda/citación en garantía] que se le ha
cursado a mi conferente, solicitando su total rechazo con costas.
```

---

### II. OBJETO

```
Que, en el carácter invocado, vengo por el presente a contestar, en legal tiempo y forma,
la [demanda/citación en garantía] cursada en estas actuaciones, notificada por cédula el
[FECHA NOTIFICACIÓN — A COMPLETAR], cuyo vencimiento opera el [FECHA VENCIMIENTO — A COMPLETAR].
Contestamos, asimismo, los términos de la demanda, cuyo rechazo pedimos expresamente, con costas.
```

**Regla:** La fecha de notificación y la de vencimiento siempre son `[A COMPLETAR]` si Mike no las extrajo.
El plazo de contestación es de **15 días hábiles** desde la notificación (CPCyCN art. 338 o art. 346 para citaciones en garantía). Si tenés la fecha de notificación, calculá la fecha de vencimiento.

---

### III. PÓLIZA

Siempre hay póliza. Si Mike no la extrajo, usar placeholders — **nunca omitir esta sección**.

```
Mi mandante emitió la póliza [N° PÓLIZA — A COMPLETAR] que amparaba -entre otros riesgos-
por el de responsabilidad civil hacia terceros, al vehículo [MARCA/MODELO — A COMPLETAR]
dominio [DOMINIO — A COMPLETAR], a nombre de [ASEGURADO — A COMPLETAR], con una vigencia
desde el [VIGENCIA DESDE — A COMPLETAR] al [VIGENCIA HASTA — A COMPLETAR] y con el límite
de responsabilidad por acontecimiento establecido en las condiciones particulares
([LÍMITE — A COMPLETAR]). Adjunto a la presente copia de la póliza.

Cabe destacar que el actor carece de acción directa y autónoma contra mi representada por
lo cual la responsabilidad asegurativa de mi mandante únicamente podrá hacerse efectiva
en caso de condena respecto de su asegurado y en la medida del seguro (art. 118 LS).
```

---

### IV. ASUME COBERTURA – DENUNCIA LÍMITE – FORMULA RESERVA

Transcribir la cláusula CG-RC 01.1 completa. Si no hay datos de póliza, usar placeholders.

```
A la fecha de ocurrencia del hecho motivo de esta litis el vehículo [VEHÍCULO] dominio
[DOMINIO], se hallaba asegurado por mi representada, bajo la póliza [N°], por riesgo de
"Responsabilidad Civil con límite" (hasta [LÍMITE]), ello conforme la cláusula:
"CG-RC 01.1 - Responsabilidad Civil - Riesgo Cubierto: El Asegurador se obliga a mantener
indemne al Asegurado y/o a la persona que con su autorización conduzca el vehículo objeto
del seguro (en adelante el Conductor), por cuanto deban a un tercero como consecuencia de
daños causados por ese vehículo o por la carga que transporte en condiciones reglamentarias,
por hechos acaecidos en el plazo convenido, en razón de la responsabilidad civil que pueda
resultar a cargo de ellos. El Asegurador asume esta obligación únicamente en favor del
Asegurado y del Conductor, hasta la suma máxima por acontecimiento, establecida en el
Frente de Póliza por daños corporales a personas, sean estas transportadas o no transportadas
y por daños materiales, hasta el monto máximo allí establecido para cada acontecimiento sin
que los mismos puedan ser excedidos por el conjunto de indemnizaciones que provengan de un
mismo hecho generador…"

En consecuencia, la eventual responsabilidad de mi mandante se encuentra estricta y
taxativamente limitada a los alcances, condiciones y montos máximos pactados contractualmente,
los cuales resultan plenamente oponibles tanto al asegurado como a los terceros reclamantes.

Asimismo, mi representada formula expresa reserva de invocar alguna de las causas de
"exclusión de cobertura" previstas en la póliza y la Ley 17.418 con sus consecuencias
jurídicas, si con posterioridad a éste responde llegaran a su conocimiento hechos,
circunstancias y/o elementos no denunciados por su asegurado que hubieran obstado a esta
presentación (Cláusula 3), haciendo expresa reserva de los derechos que pudieran derivarse
de dicha circunstancia.
```

---

### V. NEGATIVA GENERAL

```
Conforme lo dispone el art. 356 CPCCN, niego todos y cada uno de los hechos y el derecho
invocado por la actora, como así también la autenticidad de toda la documentación que no
sea expresamente reconocida en este responde.
```

---

### VI. NEGATIVAS ESPECÍFICAS

Formato canónico — numeradas, en párrafo aparte, sin bullets:

```
En particular, niego:

1. Que [hecho afirmado por el actor].
2. Que [hecho afirmado por el actor].
...
```

**Regla:** usar el texto exacto que extrajo Mike de la demanda. No parafrasear. Si Mike no extrajo los hechos, dejar:
```
[NEGATIVAS ESPECÍFICAS — A COMPLETAR con los hechos de la demanda]
```

---

### VII. EXCEPCIONES PREVIAS (solo si Edu identificó defensas procesales verdes/amarillas)

Incluir solo si hay excepciones procesales previas disponibles (prescripción, incompetencia, defecto legal, falta de mediación). Si no hay, omitir esta sección y no renumerar.

---

### VIII. DEFENSA DE FONDO (solo si aplica)

Incluir las defensas sustanciales identificadas por Edu. Si no hay, omitir.

---

### IX. PRUEBA

Siempre incluir. Estructura fija:

```
A) PRUEBA DOCUMENTAL
[lista de documentos]

B) PRUEBA INFORMATIVA
[oficios a librar]

C) PRUEBA PERICIAL
[peritos solicitados]

D) PRUEBA TESTIMONIAL (si aplica)

E) PRUEBA CONFESIONAL (si aplica)
```

Documentales mínimas siempre incluidas:
- Poder general para actuar en juicio
- Póliza de seguro
- Expediente de siniestros

Agregar las que Mike extrajo de la demanda como prueba ofrecida por el actor (para contrapericia o control).

---

### X. RESERVA DEL CASO FEDERAL

```
Para el hipotético caso de que V.S. no haga lugar a las defensas articuladas, se violarían
derechos y garantías constitucionales, por lo que esta parte formula expresa reserva para
ocurrir ante la Excma. Corte Suprema de Justicia de la Nación conforme el art. 14 de la ley 48.
```

---

### XI. PETITORIO

```
Por lo expuesto, solicito:
a) Se me tenga por presentado, por parte en el carácter invocado y por constituido el domicilio;
b) Se rechace en todas sus partes la demanda/citación en garantía con expresa imposición de costas;
c) Se tenga presente la prueba ofrecida y se provea en su oportunidad.

Proveer así,
Será Justicia.
```

---

## Reglas de formato DOCX

- Fuente: **Arial 11pt** en todo el documento
- Márgenes: Superior 2.5cm, Inferior 2.5cm, Izquierdo 3.0cm, Derecho 2.5cm
- Encabezados de sección: **negrita**, mismo tamaño
- Título del escrito: **negrita 12pt**, centrado
- Párrafos de cuerpo: espacio después 6pt
- Interlineado: sencillo
- Las negativas específicas van indentadas 0.5cm

---

## Placeholders

Todo campo faltante usa este formato: `[DESCRIPCIÓN — A COMPLETAR]`

**Nunca inventar datos.** Si no está en los outputs upstream, placeholder.

Los placeholders quedan visibles en el DOCX para que el abogado los encuentre fácilmente con Ctrl+H o revisión de Word.

---

## Página de notas (separada, NO va al escrito)

Al final del DOCX, después de un salto de página:

```
⚠️ NOTAS PARA EL ABOGADO — NO INCLUIR EN EL ESCRITO FINAL

Secciones que requieren completamiento:
• [campo]: [motivo]
...

Otras notas del pipeline:
• [nota de Lou o de Edu]
```

---

## Cómo ejecutar el script

```bash
python3 /home/legales/.openclaw/workspace/ali/skills/drafting-docx-ar/scripts/build_contestacion.py \
  datos.json \
  contestacion-[caratula-corta].docx
```

El `datos.json` tiene la misma estructura que el output de `drafting-answer-ar`, enriquecido con
los campos de póliza de Mike y las defensas de Edu.

---

## Schema de datos.json

```json
{
  "tipo_escrito": "CONTESTA DEMANDA CITADA EN GARANTÍA – OFRECE PRUEBA",
  "tipo_intervencion": "citación en garantía",
  "letrado": {
    "nombre": "[NOMBRE — A COMPLETAR]",
    "tomo": "[T°]",
    "folio": "[F°]",
    "cuit": "[CUIT]",
    "mail": "[MAIL — A COMPLETAR]",
    "cuit_electronico": "[CUIT]"
  },
  "caratula": "ACTOR c/ DEMANDADO s/ DAÑOS Y PERJUICIOS",
  "expediente": "[N° EXPEDIENTE]",
  "fecha_notificacion": "[FECHA — A COMPLETAR]",
  "fecha_vencimiento": "[FECHA — A COMPLETAR]",
  "poliza": {
    "numero": "[N° PÓLIZA — A COMPLETAR]",
    "vehiculo": "[MARCA MODELO AÑO — A COMPLETAR]",
    "dominio": "[DOMINIO — A COMPLETAR]",
    "asegurado": "[NOMBRE ASEGURADO — A COMPLETAR]",
    "vigencia_desde": "[FECHA — A COMPLETAR]",
    "vigencia_hasta": "[FECHA — A COMPLETAR]",
    "limite": "[MONTO — A COMPLETAR]"
  },
  "negativas_especificas": [
    { "hecho_numero": 1, "hecho_original": "texto del hecho", "tipo_respuesta": "niego" }
  ],
  "excepciones_previas": [],
  "defensas_fondo": [],
  "ofrecimiento_prueba": {
    "documental": ["Poder general", "Póliza"],
    "informativa": [],
    "pericial": [],
    "testimonial": [],
    "confesional": []
  },
  "petitorio": { "texto": "" },
  "secciones_requieren_revision": [],
  "notas_para_abogado": []
}
```
