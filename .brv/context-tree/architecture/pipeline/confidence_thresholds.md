---
title: Confidence Thresholds
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-12T14:59:52.739Z'
updatedAt: '2026-03-12T14:59:52.739Z'
---
## Raw Concept
**Task:**
Document Pipeline Quality Gates

**Files:**
- agents/ali/ORCHESTRATION.md

**Timestamp:** 2026-03-12

## Narrative
### Structure
Confidence thresholds are applied at Donna, Mike, and Edu stages to ensure output quality before proceeding to drafting and review.

### Rules
| Condition | Action |
|-----------|--------|
| donna.document_summary.bloqueante = true | STOP — notify |
| donna.formal_review.requiere_revision_humana = true | FLAG — continue with mark |
| mike.claim_summary.tipo_intervencion_aseguradora.confidence = low | STOP — escalate |
| mike.claim_summary.overall_confidence < 0.5 | STOP — escalate |
| mike.claim_summary.overall_confidence < 0.7 | FLAG — continue |
| edu.*.overall_confidence < 0.5 | STOP — escalate |
| edu.risk_assessment.escalacion.requiere_escalacion = true | Notify manager — wait for approval |
| lou.resultado = corregir_y_reenviar | Re-activate Jess (max 1) |
| lou.resultado = rechazar_y_rehacer | STOP — human review |

## Facts
- **donna_blocking**: Donna blocking flag stops the pipeline [project]
- **mike_confidence_stop**: Mike overall confidence < 0.5 stops the pipeline and escalates to human [project]
- **mike_confidence_flag**: Mike overall confidence < 0.7 flags the pipeline but continues [project]
- **edu_confidence_stop**: Edu overall confidence < 0.5 for any skill stops the pipeline [project]
