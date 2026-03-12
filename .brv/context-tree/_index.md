---
children_hash: 76b331f584a6bed7e1789abc72973829ea304ebffca89acf9545290477a2b2f1
compression_ratio: 0.7277533039647577
condensation_order: 3
covers: [architecture/_index.md, infrastructure/_index.md]
covers_token_total: 1135
summary_level: d3
token_count: 826
type: summary
---
# Libra Legal AI: Structural Summary (Level D3)

This level D3 summary integrates the core architectural frameworks and foundational infrastructure of the Libra Legal AI platform, synthesizing operational constraints, agent-driven pipelines, and technical environment specifications.

### 1. Architectural Framework & Operational Governance
The system operates under a strictly regulated governance model designed to maintain auditability and technical stability.
*   **Ownership & Workflow**: Code modification is restricted to **Woz** (`code_ownership`), while **Ali** manages orchestration without write access to code or the `main` branch (`ali_restrictions`, `git_workflow`).
*   **Bilingual Standard**: A mandatory split enforces **Spanish** for agent/user interactions and **English** for code implementation (`language_policy`).
*   **Regulatory Agents**: **Lou** is the final authority for coverage responses; valid `raw_claim_number` is required for all approvals (`agent_responsibilities`, `validation_rules`).
*   **Drill-down**: See `architecture/decisions/_index.md` and `architecture/project_constraints_and_rules.md`.

### 2. Automated Legal Pipeline & Agent Orchestration
Knowledge is processed through a canonical, multi-stage sequence managed by **Ali**, utilizing specialized agents for discrete legal tasks.
*   **Canonical Sequence**: Intake (**Rachel**) → Ingestion/Review (**Donna**) → Extraction (**Mike**) → Triage/Risk (**Edu**) → Drafting (**Jess**) → Final Review (**Lou**) → Human Delivery.
*   **Specialized Roles**:
    *   **Donna**: Identifies `bloqueante` documents to halt the pipeline.
    *   **Mike & Edu**: Extract policy details and perform coverage/risk assessments.
    *   **Jess & Lou**: Jess generates legal drafts (denials/memos) while Lou performs normative consistency checks.
*   **Quality Gates**: Automated "STOP/FLAG" logic triggers based on confidence scores. Escalation occurs if `overall_confidence < 0.5`, while scores `< 0.7` flag for manual review (`confidence_thresholds.md`).
*   **Drill-down**: See `architecture/pipeline/canonical_pipeline.md` and `architecture/pipeline/ali_orchestration.md`.

### 3. Integration Contracts & Data Persistence
Standardized interfaces ensure seamless transitions between pipeline stages and external systems.
*   **Interface Contracts**: Handoffs between Ali and specialized agents (e.g., Lou) utilize JSON schemas requiring Case IDs and document paths (`agent_interfaces.md`).
*   **Persistence & Feedback**: Every stage output is persisted in the database for audit trails. External lawyer feedback is integrated via `PATCH /api/v1/cases/:id/corrections`.
*   **Drill-down**: See `architecture/pipeline/agent_interfaces.md` and `architecture/decisions/_index.md`.

### 4. Infrastructure & Technical Environment
The underlying stack supports a containerized development and execution environment for the Ali platform.
*   **Core Stack**: Backend implemented in **Go + Echo** (Port `8080`); Frontend utilizes **React + Vite** (Port `3000`).
*   **Data Layer**: **PostgreSQL** managed via **Docker** containers.
*   **Documentation**: Primary technical specifications reside in `docs/pipeline-canon.md`.
*   **Drill-down**: See `infrastructure/environment/development_setup.md` and `infrastructure/context.md`.