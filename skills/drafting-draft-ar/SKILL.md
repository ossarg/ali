---
name: drafting-draft-ar
description: Paso 2 del pipeline de borrador. Lee jess_prep.json y genera el texto completo de la contestación de demanda aplicando boilerplates verbatim y guía de estilo. Siempre corre después de drafting-prep-ar y antes de drafting-format-ar.
---

# Jess-Draft — Redacción del Borrador de Contestación

> **Misión del borrador**: generar un documento con >95% de confianza en su contenido. Las secciones estándar (objeto, negativas, derecho, prueba) deben salir correctas y completas, sin necesidad de corrección. El formato, redacción y estilo deben ser 10/10. El tiempo del abogado debe ir al fondo de la cuestión, no a ajustes formales. El abogado construye arriba del borrador, no lo corrige.

## Inputs

1. `jess_prep.json` — output de Jess-Prep (estructura completa, variables, hechos a negar, señales condicionales)
2. Lee los boilerplates necesarios según `jess_prep.json["secciones"]` — SOLO los listados, no todos
3. Lee `/home/legales/ali/skills/drafting-answer-ar/references/style-guide-ar.md` — **OBLIGATORIO antes de redactar**

## Directiva de estilo

Antes de redactar la primera sección dinámica, leer completamente `style-guide-ar.md`. Aplicar su registro, tono y patrones. Si hay que elegir entre ensamblaje mecánico y prosa persuasiva, elegir prosa persuasiva.

El borrador debe ser indistinguible de lo que escribiría un abogado litigante experimentado. Las secciones estáticas se copian verbatim. Las dinámicas se redactan con los patrones de la guía de estilo.

## Instrucciones de redacción

### Secciones estáticas
Copiar el texto del boilerplate indicado en `jess_prep.json["secciones"]`. Sustituir variables con los valores de `jess_prep.json["variables"]`. Si una variable tiene valor `[COMPLETAR — ABOGADO: ...]`, copiar el placeholder tal cual.

### Negativas (sección dinámica)
**REGLA ABSOLUTA**: negativas en PROSA CONTINUA, NO listas numeradas.

Usar los hechos de `jess_prep.json["hechos_a_negar"]`. Agrupar por tema. Patrón:

```
Niego que [sujeto] [verbo subjuntivo] [complemento específico]. Niego asimismo que [sujeto]...
```

Para cada tema, un párrafo fluido. Conectores: "Niego asimismo que", "Niego igualmente que", "Niego finalmente que". NO repetir el mismo conector dos veces seguidas.

### Impugnación de rubros (sección dinámica)
**REGLA ABSOLUTA**: patrón de 4 pasos para CADA rubro. Nunca un rubro en una sola línea.

Patrón:
1. **Apertura rechazante**: "El monto reclamado en concepto de [RUBRO] resulta manifiestamente excesivo, infundado y carente de respaldo técnico suficiente."
2. **Desconocimiento formal**: "Se desconoce e impugna el [presupuesto/certificado/informe] emitido por [FUENTE] por tratarse de un documento privado emanado de terceros no reconocido ni ratificado en autos."
3. **Argumentación estructurada**: "En primer lugar, [...]. En segundo lugar, [...]. En tercer lugar, [...]."
4. **Cierre negatorio**: "Niego que [actor] tenga derecho a percibir la suma de $[MONTO] en concepto de [RUBRO]."

### Verdad de los hechos (sección dinámica)
- Minimizar sin negar (caso RC auto estándar)
- "La dinámica del siniestro fue la siguiente: se trató de un contacto..."
- Dejar cuantificación a la pericia
- Si hay causa penal activa: placeholder para el abogado (NO construir versión de hechos)

### Notas al abogado
- Datos faltantes → `[COMPLETAR — ABOGADO: descripción específica]`
- Estrategia → `[NOTA INTERNA: descripción sugestiva, nunca prescriptiva]`
- NO usar "CONSULTAR CON EL ASEGURADO" — usar "Verificar con el área de Siniestros"
- NO inventar jurisprudencia — usar `[NOTA INTERNA: Este argumento se fortalecería con jurisprudencia sobre [TEMA]. Verificar en la base de precedentes de Libra.]`

## Estructura de output

El output es texto plano del escrito judicial. Estructura:

```
CONTESTA DEMANDA POR LA CITADA EN GARANTIA – OFRECE PRUEBA

Expediente: [NRO_EXPEDIENTE]
Caratulado: [CARATULA]

SEÑOR JUEZ:

[ENCABEZADO VERBATIM]


PERSONERÍA

[TEXTO VERBATIM]


OBJETO

[TEXTO]


[... secciones según jess_prep.json["secciones"] ...]


Proveer de conformidad,

SERÁ JUSTICIA.
```

**Reglas de formato del texto plano**:
- Títulos de sección: MAYÚSCULAS, solos en su línea, sin `#` ni `---`
- Subtítulos (ej. nombre de rubro): primera letra mayúscula, solos en su línea
- Párrafos separados por línea en blanco
- Sin `---` horizontal rules
- Sin bloques de código (sin ```)
- Sin markdown
- Sin metadata al final

## Largo mínimo
- RC auto solo daños materiales: 35.000 chars
- RC auto con lesiones: 40.000 chars
- Dos actores (daño material + personal): 45.000 chars

Si el borrador queda corto: expandir negativas, ampliar argumentación en impugnación de rubros, desarrollar más en Verdad de los hechos.

## Checklist antes de entregar

- [ ] Negativas en prosa continua (sin "1. Niego que...", "2. Niego que...")
- [ ] Cada rubro con los 4 pasos completos
- [ ] Bloque límite de cobertura verbatim (si citación en garantía)
- [ ] Bloque Samudio completo con cadena Sala E/G/M (si corresponde)
- [ ] Tope costas art. 730 (si monto > $10M)
- [ ] Oposición a pericial contable (si la actora la ofreció)
- [ ] Reserva federal verbatim
- [ ] Autoriza verbatim
- [ ] Petitorio con límite de cobertura explícito
- [ ] "Proveer de conformidad, SERÁ JUSTICIA." al final
- [ ] Sin `---`, sin metadata, sin "REVIEW LOU", sin "Generado por:"
- [ ] Sin "CONSULTAR CON EL ASEGURADO"

## Output

Guardar como `jess_draft.txt` en el directorio de trabajo del caso.
