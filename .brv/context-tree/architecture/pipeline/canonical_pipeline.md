---
title: Canonical Pipeline
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-12T14:56:40.284Z'
updatedAt: '2026-03-12T14:56:40.284Z'
---
## Raw Concept
**Task:**
Document the canonical Libra Legal AI pipeline and agents

**Files:**
- docs/pipeline-canon.md

**Flow:**
Rachel (Intake) -> Donna (Ingestion) -> Mike (Extraction) -> Edu (Triage) -> Jess (Drafting) -> Lou (Review) -> Human Review

**Timestamp:** 2026-03-09

## Narrative
### Structure
The pipeline consists of 6 automated agents followed by human review. Stages: Ingesta, Extracción, Triage, Borrador, Revisión.

### Highlights
Official truth source for prompts and code. Replaces old terminology like DPS or Triage Analyst.

### Rules
STOP conditions based on confidence scores (e.g., Mike < 0.5, Edu < 0.5) or blocker flags (Donna.bloqueante).

### Examples
Handoff schema includes case_id, pipeline_stage, pdf_path, and agent outputs.
