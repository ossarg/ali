---
children_hash: a5d39c8c46958e791a4b427cd36a622dd39e9db20d3bdc333108e20ed99b75b1
compression_ratio: 0.9024856596558317
condensation_order: 1
covers: [context.md, project_constraints_and_rules.md]
covers_token_total: 523
summary_level: d1
token_count: 472
type: summary
---
# Domain: Architecture - Decisions Summary

This structural overview codifies the core operational decisions, technical constraints, and agent responsibilities governing the project. Detailed specifications for these rules can be found in `project_constraints_and_rules.md`.

### Core Operational Constraints
The project operates under a strict separation of concerns regarding code manipulation and orchestration:
*   **Code Ownership:** Exclusive modification rights belong to **Woz** (`code_ownership`).
*   **Agent Restrictions:** **Ali** is restricted to orchestration and is prohibited from writing code (`ali_restrictions`) or pushing directly to the `main` branch (`git_workflow`).
*   **Language Policy:** A bilingual standard is enforced: Spanish for all prompts and interactions, while English is used for all code implementation (`language_policy`).

### Agent Responsibilities & Workflows
Specific agents are assigned mandatory roles within the legal and technical pipeline:
*   **Coverage & Rejections:** **Lou** is the mandatory agent for generating coverage responses and rejections (`agent_responsibilities`).
*   **Validation Logic:** The field `raw_claim_number` is a mandatory requirement for any approval process (`validation_rules`).
*   **Feedback Loop:** A pending architectural integration involves a lawyer feedback loop via the `PATCH /api/v1/cases/:id/corrections` endpoint (`roadmap_items`).

### Key Relationships
*   **Lawyer Interaction -> API:** The flow originates from lawyer feedback, transitioning to a specific API correction endpoint for implementation.
*   **Orchestration vs. Implementation:** Ali manages the high-level flow (Orchestration) while Woz executes the technical changes (Implementation).

For granular details on specific rule definitions or the validation schema, refer to the full documentation in `project_constraints_and_rules.md`.