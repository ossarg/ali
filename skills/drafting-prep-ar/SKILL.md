---
name: drafting-prep-ar
description: Paso 1 del pipeline de borrador. Lee claim_summary, policy_summary, edu_output, SKILL.md de drafting-answer-ar y style-guide-ar. Produce jess_prep.json con la estructura completa del borrador sin generar texto. Siempre corre antes de drafting-draft-ar.
---

# Jess-Prep — Preparación del Borrador de Contestación

> **Objetivo de este paso**: reducir el trabajo de Jess-Draft al mínimo de contexto necesario. Este skill NO genera texto del escrito judicial. Genera la estructura que Jess-Draft necesita para redactar sin leer los skills de input.

## Inputs

1. `claim_summary` — output de Mike (partes, hechos, rubros, prueba, tipo intervención)
2. `policy_summary` — output de Mike (póliza, cobertura, suma asegurada — puede ser null)
3. `edu_output` — output de Edu (defensas, cobertura, escalación — puede ser null)
4. Lee `/home/legales/ali/skills/drafting-answer-ar/SKILL.md` para determinar estructura y secciones
5. Lee `/home/legales/ali/skills/drafting-answer-ar/references/conditional-sections.md` para señales condicionales
6. Lee `/home/legales/ali/skills/drafting-answer-ar/references/style-guide-ar.md` para patrones de lenguaje

## Instrucciones

### Paso 1: Determinar encuadre procesal
- `citacion_garantia` | `accion_directa` | `repeticion_art`
- Default si no hay señal: `citacion_garantia`

### Paso 2: Determinar secciones a incluir
Revisar conditional-sections.md. Marcar cuáles de las 22 secciones aplican y qué boilerplate leer.

### Paso 3: Extraer variables
Por cada sección, listar las variables a sustituir:
- `[CARATULA]` → valor real
- `[NRO_EXPEDIENTE]` → valor real o `[COMPLETAR — ABOGADO: expediente]`
- `[NRO_POLIZA]` → de policy_summary o `[COMPLETAR — ABOGADO: obtener de SISE]`
- `[NOMBRE_ASEGURADO]` → del demandado
- `[MARCA_MODELO]` / `[DOMINIO]` → del vehículo asegurado
- `[MONTO_COBERTURA]` → de policy_summary o `[COMPLETAR — ABOGADO: obtener de SISE]`
- Por cada rubro: `[MONTO_RUBRO]`, `[NOMBRE_RUBRO]`

### Paso 4: Listar hechos a negar (Art. 356)
Extraer TODOS los hechos afirmados en la demanda que deben ser negados explícitamente. Este listado alimenta las negativas de Jess-Draft.

Agrupar por tema:
- Mecánica del accidente
- Lesiones / daños personales
- Daños materiales al rodado
- Lucro cesante / privación de uso
- Montos y rubros

### Paso 5: Registrar señales condicionales
- ¿Hay presupuesto de taller? → incluir desconocimiento formal
- ¿Hay intereses tasa activa? → incluir bloque Samudio
- ¿Hay daño punitivo? → sección especial
- ¿Hay capitalización art. 770? → negativa específica
- ¿Hay pericial contable? → oposición
- ¿Hay tope costas? → incluir art. 730 si monto > $10M
- ¿Lesiones graves / fallecimiento? → placeholders, no defensas automáticas

### Paso 6: Registrar alertas para el abogado
Anotar alertas que deben figurar como NOTA INTERNA en el borrador:
- Cobertura INDETERMINADO → alerta SISE
- Causa penal activa → verificar pericia mecánica penal
- Denuncia a otra aseguradora → posible falta de legitimación pasiva
- Mediación no acreditada → posible excepción previa
- Otros

## Output

Guardar como `jess_prep.json` en el directorio de trabajo del caso:

```json
{
  "caratula": "...",
  "expediente": "...",
  "encuadre": "citacion_garantia | accion_directa | repeticion_art",
  "variables": {
    "CARATULA": "...",
    "NRO_EXPEDIENTE": "...",
    "NRO_POLIZA": "... | [COMPLETAR — ABOGADO: obtener de SISE]",
    "NOMBRE_ASEGURADO": "...",
    "MARCA_MODELO": "...",
    "DOMINIO": "...",
    "MONTO_COBERTURA": "... | [COMPLETAR — ABOGADO: obtener de SISE]"
  },
  "secciones": [
    {
      "numero": 1,
      "nombre": "TITULO",
      "tipo": "estatico",
      "boilerplate": "encabezado-personeria.md",
      "incluir": true
    },
    ...
  ],
  "hechos_a_negar": {
    "mecanica": ["...", "..."],
    "lesiones": ["...", "..."],
    "danos_materiales": ["...", "..."],
    "lucro_cesante": ["...", "..."],
    "montos": ["...", "..."]
  },
  "senales_condicionales": {
    "presupuesto_taller": true,
    "intereses_tasa_activa": true,
    "dano_punitivo": false,
    "capitalizacion_770": false,
    "pericial_contable_actora": true,
    "tope_costas_730": true,
    "lesiones_graves": false,
    "pericia_penal_preexistente": false
  },
  "alertas_abogado": [
    "COBERTURA INDETERMINADO: verificar en SISE qué aseguradora cubría el vehículo [DOMINIO] al [FECHA]",
    "..."
  ],
  "rubros_reclamados": [
    {"nombre": "Reparación del rodado", "monto": 12187600, "actor": "Servifamy S.R.L."},
    ...
  ],
  "total_reclamado": 51915837.50
}
```
