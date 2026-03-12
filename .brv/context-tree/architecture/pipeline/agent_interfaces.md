---
title: Agent Interfaces
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-12T14:59:52.741Z'
updatedAt: '2026-03-12T14:59:52.741Z'
---
## Raw Concept
**Task:**
Document Ali-Lou Interface Contracts

**Files:**
- agents/ali/ORCHESTRATION.md

**Timestamp:** 2026-03-12

## Narrative
### Structure
Standardized JSON contracts for communication between the orchestrator (Ali) and the review agent (Lou).

### Highlights
Contracts include case IDs, documents, previous agent outputs, and detailed finding categories.

### Examples
Ali -> Lou Request: { "case_id": "uuid", "documento": "...", "skill_usado": "...", "donna_output": {}, ... }
Lou -> Ali Response: { "resultado": "aprobar", "score_calidad": 0.9, "hallazgos": [...], ... }
