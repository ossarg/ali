---
name: drafting-prep-ar
description: Paso 1 del pipeline de borrador (Jess-Prep). Lee la demanda, los outputs de análisis y los boilerplates necesarios, y produce jess_prep.json con los boilerplates embebidos inline. Modelo recomendado: Haiku. Siempre corre antes de drafting-draft-ar.
model: haiku
---

# Jess-Prep — Planificación del Borrador de Contestación

> **Objetivo**: reducir el trabajo de Jess-Draft a leer UN solo archivo. Este skill NO genera texto del escrito judicial. Lee todo lo que necesita para el caso, embebe los boilerplates en el JSON de salida, y deja Jess-Draft con contexto mínimo.

## Inputs

1. `cases/{case_id}/demanda.txt` — texto extraído del PDF
2. `cases/{case_id}/mike_output.json` — extracción estructurada (partes, rubros, prueba)
3. `cases/{case_id}/edu_risk.json`, `edu_coverage.json`, `edu_viability.json` — triage
4. Lee `/home/legales/ali/skills/drafting-answer-ar/SKILL.md` — reglas de estructura y secciones
5. Lee `/home/legales/ali/skills/drafting-answer-ar/references/conditional-sections.md` — señales condicionales
6. Lee CADA boilerplate necesario de `/home/legales/ali/skills/drafting-answer-ar/references/boilerplates/`

## Instrucciones

### Paso 1: Determinar encuadre procesal
- `citacion_garantia` | `accion_directa` | `repeticion_art`
- Default: `citacion_garantia`

### Paso 2: Determinar secciones a incluir
Revisar conditional-sections.md. Listar los números de sección que aplican (de las 22 secciones del SKILL.md).

### Paso 3: Extraer variables
- `CARATULA` → de mike_output
- `NRO_EXPEDIENTE` → de mike_output
- `NRO_POLIZA` → de mike_output o `[COMPLETAR — ABOGADO: OBTENER DE SISE]`
- `NOMBRE_ASEGURADO` → del demandado
- `MARCA_MODELO` + `DOMINIO` → del vehículo asegurado
- `MONTO_COBERTURA` → de mike_output o `[COMPLETAR — ABOGADO: OBTENER DE SISE]`

### Paso 4: Listar hechos a negar (Art. 356)
Extraer TODOS los hechos afirmados en la demanda. Agrupar por tema: mecánica, daños materiales, lucro cesante, lesiones, montos.

### Paso 5: Identificar boilerplates necesarios
Según las señales condicionales (conditional-sections.md), determinar qué boilerplates leer. Para citación en garantía estándar:
- `encabezado-personeria.md` (siempre)
- `asume-cobertura.md` (siempre en citación garantía)
- `limite-cobertura.md` (siempre en citación garantía)
- `defensa-juicio-asegurado.md` (si asegurado tiene letrado propio)
- `negativa-general.md` (siempre)
- `desconoce-documental.md` (siempre)
- `impugna-rubros-base.md` (siempre que haya rubros)
- `impugna-privacion-uso.md` (si hay privación de uso)
- `contesta-intereses-samudio.md` (si hay intereses tasa activa)
- `derecho.md` (siempre)
- `oposicion-prueba-actora.md` (si actora ofreció pericial contable)
- `tope-costas-730.md` (si monto > $10M)
- `reserva-federal.md` (siempre)
- `autoriza.md` (siempre)
- `petitorio.md` (siempre)

### Paso 6: Leer cada boilerplate y embeber su texto completo en el output

Leer cada archivo de boilerplate identificado. Copiar el texto del bloque de código (``` ```) al campo `boilerplates_inline` del JSON. VERBATIM — sin modificar, sin resumir.

### Paso 7: Evaluar si el pipeline debe bloquearse

**REGLA DE BLOQUEO:** Si la denuncia de siniestro fue presentada ante otra aseguradora (no Libra), marcar `"pipeline_blocked": true` en el JSON. No continuar con Draft A/B. Devolver al pipeline solo la alerta para que el abogado resuelva la cuestión de legitimación antes de generar el borrador.

Si hay denuncia a otra aseguradora:
```json
"pipeline_blocked": true,
"block_reason": "Denuncia de siniestro presentada ante [OTRA ASEGURADORA], no ante Libra. Verificar en SISE. Si Libra no cubría, corresponde excepción de falta de legitimación pasiva."
```

Si no hay bloqueo:
```json
"pipeline_blocked": false,
"block_reason": null
```

### Paso 8: Registrar alertas para el abogado (si pipeline NO bloqueado)
Extraer de edu_coverage las alertas no bloqueantes (causa penal activa, mediación no acreditada, póliza no disponible, etc.).

## Output

Guardar en `cases/{case_id}/jess_prep.json`:

```json
{
  "case_id": "servifamy",
  "encuadre": "citacion_garantia",
  "sections_to_include": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  "variables": {
    "CARATULA": "Servifamy S.R.L. y Miño c/ Maidana y Libra s/ Daños y Perjuicios",
    "NRO_EXPEDIENTE": "55966-25",
    "NRO_POLIZA": "[COMPLETAR — ABOGADO: OBTENER DE SISE]",
    "NOMBRE_ASEGURADO": "MAIDANA, RODOLFO",
    "MARCA_MODELO": "Chevrolet Corsa",
    "DOMINIO": "KPC-659",
    "MONTO_COBERTURA": "[COMPLETAR — ABOGADO: OBTENER DE SISE]"
  },
  "rubros_reclamados": [
    {"nombre": "Reparación del rodado", "monto": "$12.187.600", "actor": "Servifamy S.R.L.", "tiene_presupuesto": true},
    {"nombre": "Privación de uso", "monto": "$1.100.000", "actor": "Servifamy S.R.L.", "tiene_presupuesto": false},
    {"nombre": "Desvalorización del rodado", "monto": "$2.338.237,50", "actor": "Servifamy S.R.L.", "tiene_presupuesto": false},
    {"nombre": "Lucro cesante", "monto": "$1.650.000", "actor": "Servifamy S.R.L.", "tiene_presupuesto": false},
    {"nombre": "Daño físico", "monto": "$12.000.000", "actor": "Miño Ángel Gabriel", "tiene_presupuesto": false},
    {"nombre": "Daño psíquico", "monto": "$8.000.000", "actor": "Miño Ángel Gabriel", "tiene_presupuesto": false},
    {"nombre": "Tratamiento psicológico", "monto": "$3.640.000", "actor": "Miño Ángel Gabriel", "tiene_presupuesto": false},
    {"nombre": "Gastos médicos", "monto": "$1.000.000", "actor": "Miño Ángel Gabriel", "tiene_presupuesto": false},
    {"nombre": "Daño moral", "monto": "$10.000.000", "actor": "Miño Ángel Gabriel", "tiene_presupuesto": false}
  ],
  "total_reclamado": "$51.915.837,50",
  "hechos_a_negar": {
    "mecanica": ["hecho 1", "hecho 2"],
    "danos_materiales": ["hecho 3"],
    "lucro_cesante": ["hecho 4"],
    "lesiones": ["hecho 5"],
    "montos": ["hecho 6"]
  },
  "senales_condicionales": {
    "presupuesto_taller": true,
    "intereses_tasa_activa": true,
    "capitalizacion_770": true,
    "pericial_contable_actora": true,
    "tope_costas_730": true,
    "privacion_de_uso": true,
    "desvalorizacion": true,
    "lesiones_graves": false,
    "pericia_penal_preexistente": false
  },
  "alertas_abogado": [
    "COBERTURA INDETERMINADO: denuncia presentada a Orbis, no a Libra. Verificar SISE antes de presentar."
  ],
  "notas_triage": "Score riesgo 58/100. Cobertura INDETERMINADO. Choque trasero — presunción culpa embestidor. Montos Miño elevados para lesiones sin fractura.",
  "target_chars": 45000,
  "boilerplates_inline": {
    "encabezado-personeria": "TEXTO COMPLETO VERBATIM DEL BOILERPLATE encabezado-personeria.md...",
    "asume-cobertura": "TEXTO COMPLETO VERBATIM DEL BOILERPLATE asume-cobertura.md...",
    "limite-cobertura": "TEXTO COMPLETO VERBATIM (~8700 chars)...",
    "defensa-juicio-asegurado": "TEXTO COMPLETO...",
    "negativa-general": "TEXTO COMPLETO...",
    "desconoce-documental": "TEXTO COMPLETO...",
    "impugna-rubros-base": "TEXTO COMPLETO (incluye bloque Bustamante Alsina)...",
    "impugna-privacion-uso": "TEXTO COMPLETO...",
    "contesta-intereses-samudio": "TEXTO COMPLETO (con cadena Sala E/G/M)...",
    "derecho": "TEXTO COMPLETO...",
    "oposicion-prueba-actora": "TEXTO COMPLETO (confesional + pericial contable)...",
    "tope-costas-730": "TEXTO COMPLETO...",
    "reserva-federal": "TEXTO COMPLETO...",
    "autoriza": "TEXTO COMPLETO...",
    "petitorio": "TEXTO COMPLETO (versión con límite de cobertura explícito)..."
  },
  "split_config": {
    "draft_a_sections": [1, 2, 3, 4, 5, 6, 7, 8, 9],
    "draft_b_sections": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    "draft_a_target_chars": 25000,
    "draft_b_target_chars": 22000
  }
}
```

## Regla crítica sobre boilerplates_inline

El texto de cada boilerplate en `boilerplates_inline` es el texto del bloque ``` ``` del archivo correspondiente, copiado VERBATIM. No resumir. No parafrasear. No truncar. Si el boilerplate tiene múltiples variantes (ej. encabezado-personeria tiene versión citación garantía y acción directa), copiar solo la variante que aplica al caso.

El campo `boilerplates_inline` es la razón de existir de este skill: Jess-Draft leerá UN solo archivo en lugar de 15.
