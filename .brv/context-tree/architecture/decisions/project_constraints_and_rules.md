---
title: Project Constraints and Rules
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-12T15:00:41.541Z'
updatedAt: '2026-03-12T15:00:41.541Z'
---
## Raw Concept
**Task:**
Document core project decisions and operational constraints

**Changes:**
- Defined code ownership (Woz)
- Established agent restrictions (Ali)
- Set language policy (Spanish prompts, English code)
- Defined mandatory validation for approvals (raw_claim_number)
- Documented pending lawyer feedback loop API

**Flow:**
Lawyer feedback -> PATCH /api/v1/cases/:id/corrections -> Implementation pending

**Timestamp:** 2026-03-12

**Author:** ByteRover

## Narrative
### Structure
Project operational rules covering code ownership, agent roles, and validation requirements.

### Highlights
Strict separation of concerns: Woz handles code, Ali handles orchestration without writing code. Mandatory claim number validation. Bilingual policy: Spanish for interaction, English for implementation.

### Rules
Rule 1: Only Woz modifies code
Rule 2: Ali never writes code
Rule 3: Prompts in Spanish, code in English
Rule 4: Ali never pushes to main
Rule 5: Lou is mandatory for coverage responses and rejections
Rule 6: raw_claim_number is mandatory for approval

## Facts
- **code_ownership**: Solo Woz toca código [convention]
- **ali_restrictions**: Ali nunca escribe código [convention]
- **language_policy**: Prompts en español, código en inglés [convention]
- **git_workflow**: Ali nunca pushea a main [convention]
- **agent_responsibilities**: Lou es obligatorio para contestaciones y rechazos de cobertura [project]
- **validation_rules**: raw_claim_number es mandatory para aprobación [project]
- **roadmap_items**: Feedback loop de correcciones de abogados pendiente de implementar (endpoint PATCH /api/v1/cases/:id/corrections) [project]
