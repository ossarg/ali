---
children_hash: e34e0713fb9e77969a01332b156d9d013c029fd136ee577bd5684d0534120398
compression_ratio: 0.5847222222222223
condensation_order: 2
covers: [context.md, decisions/_index.md, pipeline/_index.md]
covers_token_total: 1440
summary_level: d2
token_count: 842
type: summary
---
# Domain: Architecture - Structural Summary (Level D2)

The `architecture` domain defines the core structural framework, operational constraints, and automated pipeline for Libra Legal AI. It establishes a clear separation between high-level orchestration, technical implementation, and specialized legal agent roles.

### 1. Core Operational Decisions & Constraints
The system is governed by strict rules regarding code manipulation, language standards, and agent boundaries to ensure stability and auditability.
*   **Code Ownership & Workflow**: Exclusive modification rights belong to **Woz** (`code_ownership`). **Ali** is strictly prohibited from writing code (`ali_restrictions`) or pushing to the `main` branch (`git_workflow`).
*   **Language Policy**: A bilingual standard is enforced: Spanish for all agent prompts and interactions, and English for all code implementations (`language_policy`).
*   **Mandatory Roles**: **Lou** is the required agent for generating coverage responses and rejections. Approval processes require a valid `raw_claim_number` (`agent_responsibilities`, `validation_rules`).
*   **Drill-down**: See `decisions/_index.md` and `project_constraints_and_rules.md` for full specification of these constraints.

### 2. Pipeline Orchestration & Agent Flow
The system utilizes a canonical sequence managed by the **Ali** agent, transitioning through specialized stages to process legal documents.
*   **Canonical Sequence**: Rachel (Intake) → Donna (Ingestion/Review) → Mike (Extraction) → Edu (Triage/Risk) → Jess (Drafting) → Lou (Review) → Human Delivery.
*   **Agent Specialization**:
    *   **Donna**: Document summaries and blocking reviews.
    *   **Mike**: Policy and claim detail extraction.
    *   **Edu**: Coverage checks and risk assessment.
    *   **Jess**: Drafting of answers, denials, and legal memos.
    *   **Lou**: Final normative risk and consistency review.
*   **Drill-down**: Refer to `pipeline/canonical_pipeline.md` and `pipeline/ali_orchestration.md`.

### 3. Quality Gates & Confidence Thresholds
Automated quality controls enforce "STOP" or "FLAG" conditions at critical handoff points.
*   **Donna**: Immediate stop if a document is flagged as `bloqueante`.
*   **Mike & Edu**: Mandatory escalation if `overall_confidence < 0.5`; flags for review if `< 0.7`.
*   **Lou (Review Outcomes)**:
    *   `aprobar`: Proceeds to delivery.
    *   `corregir_y_reenviar`: Triggers a one-time correction loop for Jess.
    *   `rechazar_y_rehacer` / `escalar_a_humano`: Terminates automation for manual intervention.
*   **Drill-down**: See `pipeline/confidence_thresholds.md` for the complete logic matrix.

### 4. Integration & Interface Contracts
Standardized JSON contracts and API endpoints ensure seamless handoffs and data persistence across the architecture.
*   **Handoff Schemas**: Communication between Ali and specialized agents (e.g., Lou) requires specific fields including case IDs, document paths, and previous stage outputs (`donna_output`).
*   **Persistence**: Every stage output is stored in the database to maintain a traceable audit trail.
*   **External Integration**: A feedback loop for lawyers is integrated via the `PATCH /api/v1/cases/:id/corrections` endpoint.
*   **Drill-down**: See `pipeline/agent_interfaces.md` for schema specifications and `decisions/_index.md` for roadmap items.