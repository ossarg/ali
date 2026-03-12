---
title: Ali Orchestration
tags: []
related: [architecture/pipeline/canonical_pipeline.md]
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-12T14:59:52.737Z'
updatedAt: '2026-03-12T14:59:52.737Z'
---
## Raw Concept
**Task:**
Document Ali Pipeline Orchestration

**Files:**
- agents/ali/ORCHESTRATION.md

**Flow:**
Rachel (Trigger) -> Donna (Ingestion) -> Mike (Extraction) -> Edu (Triage) -> Jess (Drafting) -> Lou (Review) -> Human Delivery

**Timestamp:** 2026-03-12

## Narrative
### Structure
The orchestration logic resides in the Ali agent, managing the transition between specialized agents and enforcing quality gates based on confidence thresholds.

### Highlights
Automated pipeline with manual/API triggers. Includes specific rules for data missing in manual mode. Persists outputs at each stage in the database.

### Rules
Rule 1: If Donna marks a document as 'bloqueante', the pipeline stops immediately.
Rule 2: Mike and Edu have confidence thresholds (0.5 for stop, 0.7 for flag).
Rule 3: Lou is mandatory for substantive documents (answers, denials, memos) but skipped for operational responses.
Rule 4: Lou's 'corregir_y_reenviar' outcome triggers a one-time reactivation of Jess.

### Examples
Trigger JSON: { "case_id": "uuid", "pdf_path": "path/to/pdf", "origen": "email" }

## Facts
- **pipeline_sequence**: The pipeline sequence is Rachel -> Donna -> Mike -> Edu -> Jess -> Lou -> Human Review [project]
- **agent_donna_role**: Donna handles ingestion with skills for document summary and formal review [project]
- **agent_mike_role**: Mike handles extraction for claim and policy summaries [project]
- **agent_edu_role**: Edu handles triage with risk assessment, coverage opinion, and viability check skills [project]
- **agent_jess_role**: Jess handles drafting for answers, coverage denials, and legal memos [project]
- **agent_lou_role**: Lou handles review for consistency and normative risk [project]
- **lou_outcomes**: Lou has four possible outcomes: aprobar, corregir_y_reenviar, rechazar_y_rehacer, and escalar_a_humano [project]
- **manual_trigger_rule**: Ali requests 'fecha_notificacion_asegurador' in manual mode before invoking Mike [convention]
