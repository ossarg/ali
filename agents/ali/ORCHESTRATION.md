# Ali — Pipeline Orchestration

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
    │
    ▼
[5] Review — Red Team Verifier
    │   red-team-verifier (recibe: borrador de Jess + outputs de Edu + PDF original)
    │
    ├── aprobado → entregar al abogado
    ├── corregir → re-activar Jess con instrucciones (máximo 1 vez)
    └── rechazar / 2do fallo → STOP: revisión humana directa
    │
    ▼
[6] Entrega al abogado
    Caso en DB con:
    - pipeline_stage = "borrador"
    - borrador_url = path del documento
    - todos los outputs del pipeline guardados
    - lista de secciones_requieren_revision
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
| `review.resultado = corregir` | Re-activar Jess (1 vez máximo) |
| `review.resultado = rechazar` o 2do fallo | STOP — revisión humana directa |

---

## Persistencia de outputs

Cada etapa del pipeline guarda su output en el caso en DB:

| Campo DB | Contenido |
|----------|-----------|
| `pipeline_stage` | Etapa actual (ingesta → extraccion → triage → borrador → completado) |
| `donna_output` | JSON completo de Donna |
| `mike_output` | JSON completo de Mike |
| `edu_output` | JSON completo de Edu (3 skills) |
| `jess_output` | Borrador + secciones_requieren_revision |
| `review_output` | Resultado del Red Team Verifier |
| `borrador_url` | Path o URL del documento final |

---

## Notificaciones que Ali emite

| Evento | Destinatario | Canal |
|--------|-------------|-------|
| STOP por bloqueante | Nacho / abogado asignado | Discord #litigios |
| STOP por confidence baja | Nacho | Discord #litigios |
| Escalación por score alto | Gerente | Discord #litigios |
| Borrador listo para revisión | Abogado asignado | Discord #litigios |
| Revisión humana requerida (review falla 2 veces) | Nacho | Discord #litigios |
