# Pipeline Runner: Contestación de Demanda

> Ali sigue este playbook para procesar un caso de principio a fin.
> Cada paso guarda output en `cases/{case_id}/`.
> Si la sesión se corta, retomar desde el último archivo guardado.

## Modelos por etapa

| Paso | Agente | Modelo | Motivo |
|------|--------|--------|--------|
| Intake | local | — | pdftotext / tesseract, no requiere LLM |
| Donna | ingestion-document-summary-ar | Haiku | extracción, sin generación creativa |
| Mike | extraction-claim-summary-ar | Haiku | parsing a JSON, reglas claras |
| Edu risk | triage-risk-assessment-ar | Haiku | scoring con reglas definidas |
| Edu coverage | triage-coverage-opinion-ar | Haiku | 3 escenarios con lógica clara |
| Edu viability | triage-viability-check-ar | Haiku | semáforo con criterios explícitos |
| Jess-Prep | drafting-prep-ar | Haiku | planificación, no genera texto largo |
| Jess-Draft | drafting-draft-ar | **Sonnet** | genera ~45k chars de lenguaje jurídico |
| Lou | review-style-quality-ar | **Sonnet** | criterio de calidad, reescribe secciones |
| Format | local script | — | python-docx, no requiere LLM |
| Verificación | verify_docx.py | — | checks automáticos |

## Pre-requisitos

- PDF de la demanda en `cases/{case_id}/demanda.pdf`
- `case_id` definido (ej: `servifamy`, `torres`, `marino`)

---

## Paso 1: Intake (local, no LLM)

```bash
# Extraer texto del PDF
pdftotext cases/{case_id}/demanda.pdf cases/{case_id}/demanda.txt

# Si el resultado tiene < 500 chars (PDF escaneado), usar OCR:
pdftoppm -r 200 cases/{case_id}/demanda.pdf /tmp/ocr_pages/page
for f in /tmp/ocr_pages/page-*.ppm; do
  tesseract "$f" "${f%.ppm}" -l spa 2>/dev/null
done
cat /tmp/ocr_pages/page-*.txt > cases/{case_id}/demanda.txt
```

**Verificar:** `wc -c cases/{case_id}/demanda.txt` debe ser > 2.000 chars.

---

## Paso 2: Donna — Ingesta (Haiku)

Skill: `skills/ingestion-document-summary-ar/SKILL.md` + `skills/ingestion-formal-review-ar/SKILL.md`

Leer:
- `skills/ingestion-document-summary-ar/SKILL.md`
- `skills/ingestion-formal-review-ar/SKILL.md`
- `cases/{case_id}/demanda.txt`

Generar y guardar `cases/{case_id}/donna_output.json` con:
- `clasificacion`: tipo de documento
- `resumen_narrativo`: 5-8 líneas
- `senales_atencion`: lista de alertas
- `estado_formal`: alertas procesales
- `decision`: `continuar` | `bloqueante`
- `motivo_bloqueo`: null si continuar

**Si `decision = bloqueante`**: detener el pipeline y notificar.

---

## Paso 3: Mike — Extracción (Haiku)

Skill: `skills/extraction-claim-summary-ar/SKILL.md`

Leer:
- `skills/extraction-claim-summary-ar/SKILL.md`
- `cases/{case_id}/demanda.txt`
- `cases/{case_id}/donna_output.json`

Guardar `cases/{case_id}/mike_output.json` con:
- `caratula`, `expediente`, `tribunal`
- `partes`: actores, demandados, citada en garantía
- `tipo_intervencion`: `citacion_garantia` | `accion_directa`
- `siniestro`: fecha, lugar, mecánica, lesiones
- `poliza`: número, asegurado, vehículo (si consta)
- `rubros_reclamados`: lista con nombre, monto, actor
- `total_reclamado`
- `prueba_ofrecida`: lista
- `plazos_criticos`: lista
- `overall_confidence`: `high` | `medium` | `low`

---

## Paso 4: Edu — Triage (Haiku, 3 skills)

Correr los 3 en secuencia (o paralelo si el contexto lo permite).

### Edu Risk
Skill: `skills/triage-risk-assessment-ar/SKILL.md`
Input: `mike_output.json`
Output: `cases/{case_id}/edu_risk.json`
— score 0-100, urgencia, escalación requerida

### Edu Coverage
Skill: `skills/triage-coverage-opinion-ar/SKILL.md`
Input: `mike_output.json`
Output: `cases/{case_id}/edu_coverage.json`
— dictamen COBERTURA/NO_COBERTURA/INDETERMINADO, 3 escenarios

### Edu Viability
Skill: `skills/triage-viability-check-ar/SKILL.md`
Input: `mike_output.json`
Output: `cases/{case_id}/edu_viability.json`
— semáforo de defensas

**Si escalación requerida = true en edu_risk.json**: notificar al abogado antes de continuar con Jess.

---

## Paso 5: Jess-Prep — Planificación (Haiku)

Skill: `skills/drafting-prep-ar/SKILL.md`

Leer:
- `skills/drafting-answer-ar/SKILL.md`
- `skills/drafting-answer-ar/references/conditional-sections.md`
- `cases/{case_id}/mike_output.json`
- `cases/{case_id}/edu_risk.json` + `edu_coverage.json` + `edu_viability.json`
- CADA boilerplate necesario de `skills/drafting-answer-ar/references/boilerplates/`

Guardar `cases/{case_id}/jess_prep.json` con:
- encuadre, variables, secciones, rubros, hechos a negar
- `boilerplates_inline`: texto verbatim de cada boilerplate necesario
- `notas_triage`: resumen de edu_coverage
- `target_chars`: según tipo de caso

**Verificar:** el JSON debe contener el campo `boilerplates_inline` con texto real (no vacío).

---

## Paso 6: Jess-Draft — Redacción (Sonnet)

Skill: `skills/drafting-draft-ar/SKILL.md`

Leer **SOLO**:
- `cases/{case_id}/jess_prep.json`
- `skills/drafting-answer-ar/references/style-guide-ar.md`

Generar contestación completa y guardar `cases/{case_id}/jess_draft.txt`.

**Verificar:** `wc -c cases/{case_id}/jess_draft.txt` debe ser >= target_chars del prep.

---

## Paso 7: Lou — Quality Review (Sonnet)

Skill: `skills/review-style-quality-ar/SKILL.md`

Leer:
- `skills/review-style-quality-ar/SKILL.md`
- `skills/review-style-quality-ar/references/style-guide-ar.md`
- `cases/{case_id}/jess_draft.txt`
- `cases/{case_id}/mike_output.json` (para Art. 356 cross-check)

Guardar **DOS archivos separados**:
- `cases/{case_id}/contestacion-revisada.txt` — escrito limpio, nada de Lou visible
- `cases/{case_id}/review-lou.md` — reporte de QA (NUNCA en el body del escrito)

---

## Paso 8: Format (local, python-docx)

```bash
python3 skills/drafting-format-ar/build_docx.py \
  cases/{case_id}/contestacion-revisada.txt \
  cases/{case_id}/contestacion.docx
```

Reglas de formato aplicadas por el script:
- H1: títulos en MAYÚSCULAS
- H2: subtítulos de rubros
- Texto justificado, indent 1.27cm
- `[COMPLETAR — ABOGADO: ...]` → negrita rojo
- `[NOTA INTERNA: ...]` → cursiva gris
- Cierre centrado en negrita
- Filtros: `---`, "METADATA INTERNA", "Generado por:", "REVIEW LOU"
- Márgenes: sup/inf 2.5cm, izq 3cm, der 2.5cm

---

## Paso 9: Verificación (local)

```bash
python3 skills/drafting-format-ar/verify_docx.py \
  cases/{case_id}/contestacion.docx
```

**8 checks:**
1. Largo >= 35.000 chars
2. Sin `---` visibles
3. Sin "METADATA INTERNA"
4. Sin "Generado por:"
5. Sin "REVIEW LOU"
6. Sin "CONSULTAR CON EL ASEGURADO"
7. Exactamente 1 "Proveer de conformidad"
8. Exactamente 1 "SERÁ JUSTICIA"

**Si 8/8**: mover a `completed/{case_id}/` y notificar al abogado.
**Si falla check crítico (1-6)**: no entregar. Revisar jess_draft.txt y relanzar Jess-Draft.
**Si falla check no crítico (7-8)**: entregar con advertencia.

---

## Estructura de archivos del caso

```
cases/{case_id}/
├── demanda.pdf          # input
├── demanda.txt          # Paso 1
├── donna_output.json    # Paso 2
├── mike_output.json     # Paso 3
├── edu_risk.json        # Paso 4
├── edu_coverage.json    # Paso 4
├── edu_viability.json   # Paso 4
├── jess_prep.json       # Paso 5 (con boilerplates inline)
├── jess_draft.txt       # Paso 6
├── contestacion-revisada.txt  # Paso 7 (escrito limpio)
├── review-lou.md        # Paso 7 (reporte QA, separado)
└── contestacion.docx    # Paso 8 (output final)
```

## Retomar desde checkpoint

Si la sesión se interrumpe, verificar qué archivos existen en `cases/{case_id}/` y retomar desde el paso correspondiente. No repetir pasos ya completados.

```bash
ls -la cases/{case_id}/
```
