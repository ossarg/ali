# Ali — Pipeline Orchestration

> Para el pipeline canónico completo ver `docs/pipeline-canon.md`.
> Pipeline: `Rachel → Donna → Mike → Edu → Jess → Lou → Revisión Humana`

## Trigger de entrada

```json
{
  "case_id": "uuid generado al recibir el caso",
  "pdf_path": "ruta al PDF de la demanda",
  "poliza_path": "ruta al documento de póliza | null",
  "origen": "email | manual | api",
  "fecha_recepcion": "ISO datetime"
}
```

En PoC v1: el trigger es manual (Juan sube el PDF → Ali recibe el path).
En producción: Rachel detecta el mail, extrae el PDF y dispara el trigger.

### Regla: `fecha_notificacion_asegurador` en modo manual

| Origen | `fecha_notificacion_asegurador` | Acción de Ali |
|--------|--------------------------------|---------------|
| `email` / `api` | Rachel la provee en el envelope | Continuar sin interrumpir |
| `manual` — el operador la conoce | Se informa al invocar el pipeline | Continuar |
| `manual` — el operador no la conoce | `null` | Continuar con `null`; marcar como **pendiente crítico** en la entrega al abogado; incluir en la lista de `secciones_requieren_revision` del borrador |

En modo `manual`, Ali solicita explícitamente este dato antes de invocar a Mike. Si no se provee, no bloquea el pipeline pero lo registra como dato faltante crítico.

---

## Flujo de orquestación

```
[TRIGGER]
    │
    ▼
[1] Donna — Ingestion
    │   ingestion-document-summary-ar
    │   ingestion-formal-review-ar
    │
    ├── bloqueante = true → STOP: notificar, no continuar
    ├── requiere_revision_humana = true → FLAG: continuar con marca
    │
    ▼
[2] Mike — Extraction
    │   extraction-claim-summary-ar
    │   extraction-policy-summary-ar (si hay póliza)
    │   extraction-policy-lookup-ar (integración SISE — pendiente)
    │
    ├── overall_confidence < 0.5 → STOP: escalar a humano
    ├── tipo_intervencion_aseguradora.confidence = low → STOP: escalar a humano
    ├── overall_confidence < 0.7 → FLAG: continuar con marca
    │
    ▼
[3] Edu — Triage [3 skills en paralelo]
    │   triage-risk-assessment-ar
    │   triage-coverage-opinion-ar
    │   triage-viability-check-ar
    │
    ├── escalacion_requerida = true → notificar al gerente, esperar aprobación para continuar
    ├── cualquier skill con overall_confidence < 0.5 → STOP: escalar a humano
    │
    ▼
[4] Jess — Drafting
    │   drafting-answer-ar (default)
    │   drafting-coverage-denial-ar (si dictamen = NO_COBERTURA)
    │   drafting-legal-memo-ar (si se solicita memo interno)
    │
    ▼
[5] Lou — Review
    │   review-consistency-ar      (factual + cross-agent + completitud)
    │   review-normative-risk-ar   (jurídica + plazos + riesgo operativo + score_calidad)
    │
    ├── aprobar → entregar al abogado
    ├── corregir_y_reenviar → re-activar Jess con instrucciones (máximo 1 vez)
    ├── rechazar_y_rehacer → STOP: revisión humana directa
    └── escalar_a_humano → STOP: revisión humana directa
    │
    ▼
[6] Entrega al abogado
    Caso en DB con:
    - pipeline_stage = "completado"
    - borrador_url = path del documento
    - todos los outputs del pipeline guardados
    - lista de secciones_requieren_revision
    - notas_para_abogado de Lou (si las hay)
```

---

## Regla de skip de Lou

Lou corre **siempre** para documentos sustantivos. No corre para comunicaciones operativas de bajo riesgo.

| Skill de Jess | Lou obligatorio |
|---------------|----------------|
| `drafting-answer-ar` (contestación) | ✅ Siempre |
| `drafting-coverage-denial-ar` (rechazo de cobertura) | ✅ Siempre |
| `drafting-legal-memo-ar` (memo interno) | ✅ Siempre |
| `drafting-canned-responses-ar` (art. 56, asunción defensa, mediación) | ❌ No corre |

Esta regla vive aquí — **la UI no decide si Lou corre.**

---

## Interface contract: Ali → Lou

```json
{
  "case_id": "uuid",
  "documento": "texto completo del borrador de Jess",
  "skill_usado": "drafting-answer-ar | drafting-coverage-denial-ar | drafting-legal-memo-ar",
  "donna_output": {},
  "mike_output": {},
  "edu_output": {},
  "pdf_path": "ruta al PDF original",
  "poliza_path": "ruta a la póliza | null",
  "pipeline_flags": [],
  "iteracion": 1
}
```

## Interface contract: Lou → Ali

```json
{
  "documento_verificado": "string",
  "resultado": "aprobar | corregir_y_reenviar | rechazar_y_rehacer | escalar_a_humano",
  "score_calidad": 0,
  "hallazgos": [
    {
      "id": "LOU-001",
      "severidad": "critica | alta | media | baja",
      "categoria": "factual | juridica | cross_agent | completitud | tono | calculo | plazo | contractual",
      "titulo": "string",
      "detalle": "string",
      "fuente_verificacion": "string",
      "impacto": "string",
      "accion_recomendada": "string"
    }
  ],
  "inconsistencias_cross_agent": [],
  "errores_criticos": [],
  "datos_no_verificables": [],
  "instrucciones_para_jess": [],
  "notas_para_abogado": [],
  "confianza_revision": "high | medium | low",
  "iteracion": 1
}
```

---

## Reglas de corte (confidence thresholds)

| Condición | Acción |
|-----------|--------|
| `donna.document_summary.bloqueante = true` | STOP — notificar, no continuar |
| `donna.formal_review.requiere_revision_humana = true` | FLAG — continuar, marcar para revisión antes de entrega |
| `mike.claim_summary.tipo_intervencion_aseguradora.confidence = low` | STOP — escalar a humano |
| `mike.claim_summary.overall_confidence < 0.5` | STOP — escalar a humano |
| `mike.claim_summary.overall_confidence < 0.7` | FLAG — continuar, marcar |
| `edu.*.overall_confidence < 0.5` (cualquier skill) | STOP — escalar a humano |
| `edu.risk_assessment.escalacion.requiere_escalacion = true` | Notificar gerente — esperar aprobación |
| `edu.coverage_opinion.dictamen = INDETERMINADO` | Continuar — Jess marca secciones como requieren_revision |
| `lou.resultado = corregir_y_reenviar` | Re-activar Jess (1 vez máximo) |
| `lou.resultado = rechazar_y_rehacer` | STOP — revisión humana directa |
| `lou.resultado = escalar_a_humano` | STOP — revisión humana directa |
| `donna.formal_review.checks[documental].count` ≠ `mike.claim_summary.prueba_ofrecida.documental.count` | FLAG — inconsistencia de conteo; registrar en metadata del caso |

---

## Persistencia de outputs

Cada etapa del pipeline guarda su output en el caso en DB:

| Campo DB | Contenido |
|----------|-----------|
| `pipeline_stage` | Etapa actual: `ingesta → extraccion → triage → borrador → revision → completado` |
| `donna_output` | JSON completo de Donna |
| `mike_output` | JSON completo de Mike |
| `edu_output` | JSON completo de Edu (3 skills) |
| `jess_output` | Borrador + secciones_requieren_revision |
| `lou_output` | Hallazgos + resultado + score_calidad + notas_para_abogado |
| `borrador_url` | Path o URL del documento final |

---

## Notificaciones que Ali emite

| Evento | Destinatario | Canal |
|--------|-------------|-------|
| STOP por bloqueante (Donna) | Nacho / abogado asignado | Discord #litigios |
| STOP por confidence baja (Mike o Edu) | Nacho | Discord #litigios |
| Escalación por score alto (Edu) | Gerente | Discord #litigios |
| Lou: `corregir_y_reenviar` | Log interno — no notifica | — |
| Lou: `rechazar_y_rehacer` | Nacho | Discord #litigios |
| Lou: `escalar_a_humano` | Nacho | Discord #litigios |
| Borrador listo para revisión (`aprobar`) | Abogado asignado | Discord #litigios |
