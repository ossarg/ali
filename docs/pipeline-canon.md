# Pipeline Canónico — Libra Legal AI

> Fuente de verdad del pipeline. Toda referencia en prompts, docs y código debe seguir este documento.
> Última actualización: 2026-03-09

---

## Pipeline oficial

```
Rachel → Donna → Mike → Edu → Jess → Lou → Revisión Humana
```

| # | Agente | Rol canónico | Etapa |
|---|--------|-------------|-------|
| 0 | **Rachel** | Intake / Email Router | Ingesta |
| 1 | **Donna** | Ingestion | Ingesta |
| 2 | **Mike** | Extraction | Extracción |
| 3 | **Edu** | Triage | Triage |
| 4 | **Jess** | Drafting | Borrador |
| 5 | **Lou** | Review | Revisión |
| — | Abogado asignado | Revisión Humana | Revisión Humana / Completado |

---

## Etapas canónicas

```
Ingesta → Extracción → Triage → Borrador → Revisión → Revisión Humana / Completado
```

**No usar variantes antiguas:** DPS, File Generation, Fichero, Triage Analyst, Data Processing Specialist, Agente de Borrador, Red Team Verifier (como nombre de agente).

---

## Agentes — detalle

### Rachel — Intake / Email Router

**Se activa:** al recibir un email en `rachel.libraseguros@gmail.com` con label Gmail activo.
**Input:** email (asunto, cuerpo, adjuntos, thread).
**Qué hace:** clasifica el tipo de evento (demanda, sentencia, embargo, etc.), extrae metadatos básicos (número de siniestro, carátula, partes), aplica labels `Rachel/*` en Gmail, y registra el `case_event` en la DB.
**Output:** `case_event` en DB + envelope JSON con metadatos del mail.
**Skill principal:** `intake-mail-classifier-ar`
**Se cierra:** al registrar el evento y notificar al operador humano para revisión.
**Handoff:** el operador aprueba el evento (confirma nro. de siniestro) → dispara pipeline si es demanda nueva.

---

### Donna — Ingestion

**Se activa:** al recibir el PDF de la demanda.
**Input:** PDF de la demanda.
**Qué hace:** clasifica el documento, produce resumen narrativo del caso, verifica requisitos formales procesales (firma, domicilio, mediación, competencia, art. 118 LS), determina si el pipeline puede continuar.
**Output:** `donna_output` — clasificación + resumen + resultado de revisión formal + flag `bloqueante`.
**Skills:** `ingestion-document-summary-ar`, `ingestion-formal-review-ar`
**Se cierra:** con `bloqueante = true` (STOP) o `continuar`.
**Handoff a Mike:** `donna_output` completo.

---

### Mike — Extraction

**Se activa:** cuando Donna dice `continuar`.
**Input:** PDF de la demanda + `donna_output` + póliza (si disponible).
**Qué hace:** extrae todos los datos estructurados del caso — partes, montos, rubros, prueba ofrecida, plazos, datos económicos de la víctima, tipo de intervención de la aseguradora.
**Output:** `mike_output` — JSON estructurado con confidence scores por campo.
**Skills:** `extraction-claim-summary-ar`, `extraction-policy-summary-ar` (si hay póliza), `extraction-policy-lookup-ar` (integración SISE — pendiente)
**Se cierra:** al completar la extracción. Si `overall_confidence < 0.5` o `tipo_intervencion.confidence = low` → STOP.
**Handoff a Edu:** `mike_output` completo.

---

### Edu — Triage

**Se activa:** cuando Mike termina sin STOP.
**Input:** `mike_output` + `donna_output` + PDF.
**Qué hace:** analiza el caso en tres dimensiones en paralelo — score de riesgo y urgencia, dictamen de cobertura con exposición económica en 3 escenarios, semáforo de defensas disponibles.
**Output:** `edu_output` — 3 JSONs (risk_assessment, coverage_opinion, viability_check).
**Skills:** `triage-risk-assessment-ar`, `triage-coverage-opinion-ar`, `triage-viability-check-ar`
**Se cierra:** al completar los 3 skills. Si alguno tiene `confidence < 0.5` → STOP. Si `escalacion_requerida = true` → notifica gerente antes de continuar.
**Handoff a Jess:** `edu_output` completo + todos los outputs upstream.

---

### Jess — Drafting

**Se activa:** cuando Edu termina sin STOP (o con aprobación de gerente si hubo escalación).
**Input:** `donna_output` + `mike_output` + `edu_output` + PDF.
**Qué hace:** redacta el borrador de contestación — negativas generales y específicas, defensas aplicables, prueba a ofrecer, placeholders precisos para secciones que requieren criterio legal del abogado.
**Output:** `jess_output` — borrador + lista de `secciones_requieren_revision`.
**Skills:** `drafting-answer-ar` (default), `drafting-coverage-denial-ar` (si dictamen = NO_COBERTURA), `drafting-legal-memo-ar` (si se solicita memo interno)
**Se cierra:** al entregar el borrador a Lou.
**Handoff a Lou:** borrador + todos los outputs upstream.

---

### Lou — Review

**Se activa:** cuando Jess entrega el borrador.
**Input:** `jess_output` + `edu_output` + `mike_output` + `donna_output` + PDF + póliza (si hay) + `pipeline_flags`.
**Qué hace:** verifica el borrador en 5 ejes — consistencia factual, consistencia cross-agent, consistencia jurídica, completitud, riesgo operativo. Produce `score_calidad` y decisión final.
**Output:** `lou_output` — hallazgos por categoría + instrucciones para Jess o notas para abogado + `resultado`.
**Skills:** `review-consistency-ar`, `review-normative-risk-ar`
**Decisiones posibles:**
- `aprobar` → el borrador pasa al abogado
- `corregir_y_reenviar` → devuelve el borrador a Jess con instrucciones (máximo 1 vez)
- `rechazar_y_rehacer` → STOP, revisión humana directa
- `escalar_a_humano` → STOP, revisión humana directa
**Se cierra:** al emitir `aprobar`, `rechazar_y_rehacer` o `escalar_a_humano`. Si emite `corregir_y_reenviar`, espera el borrador corregido de Jess y corre una segunda vez (sin más iteraciones).

**Lou corre siempre para:**
- `drafting-answer-ar` (contestación)
- `drafting-coverage-denial-ar` (rechazo de cobertura)
- `drafting-legal-memo-ar` (memo interno)

**Lou no corre para:**
- `drafting-canned-responses-ar` (comunicaciones operativas de bajo riesgo: art. 56, asunción de defensa, mediación)

---

## Handoff schema (Ali → sub-agente)

```json
{
  "case_id": "uuid",
  "pipeline_stage": "ingesta | extraccion | triage | borrador | revision | completado",
  "pdf_path": "ruta al PDF de la demanda",
  "poliza_path": "ruta al documento de póliza | null",
  "origen": "email | manual | api",
  "fecha_recepcion": "ISO datetime",
  "fecha_notificacion_asegurador": "ISO datetime | null",
  "pipeline_flags": ["requiere_revision_humana", "confianza_baja", ...],
  "donna_output": {},
  "mike_output": {},
  "edu_output": {},
  "jess_output": {},
  "lou_output": {}
}
```

---

## Criterios de corte (confidence thresholds)

| Condición | Acción |
|-----------|--------|
| `donna.bloqueante = true` | STOP — notificar, no continuar |
| `donna.requiere_revision_humana = true` | FLAG — continuar con marca |
| `mike.tipo_intervencion_aseguradora.confidence = low` | STOP — escalar a humano |
| `mike.overall_confidence < 0.5` | STOP — escalar a humano |
| `mike.overall_confidence < 0.7` | FLAG — continuar con marca |
| `edu.*.overall_confidence < 0.5` | STOP — escalar a humano |
| `edu.risk_assessment.escalacion_requerida = true` | Notificar gerente — esperar aprobación |
| `lou.resultado = corregir_y_reenviar` | Re-activar Jess (1 vez máximo) |
| `lou.resultado = rechazar_y_rehacer` | STOP — revisión humana directa |
| `lou.resultado = escalar_a_humano` | STOP — revisión humana directa |

---

## Persistencia en DB (campos por etapa)

| Campo | Contenido |
|-------|-----------|
| `pipeline_stage` | Etapa actual (ver valores canónicos arriba) |
| `donna_output` | JSON completo de Donna |
| `mike_output` | JSON completo de Mike |
| `edu_output` | JSON completo de Edu (3 skills) |
| `jess_output` | Borrador + secciones_requieren_revision |
| `lou_output` | Hallazgos + resultado + score_calidad |
| `borrador_url` | Path o URL del documento final |
