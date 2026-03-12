---
children_hash: 8936c80adc14e5496244010c84fecd6a4b4161eb7a14526c6f9a9cf81c54c274
compression_ratio: 0.5246478873239436
condensation_order: 1
covers: [agent_interfaces.md, ali_orchestration.md, canonical_pipeline.md, confidence_thresholds.md, context.md]
covers_token_total: 1420
summary_level: d1
token_count: 745
type: summary
---
# Pipeline Architecture Summary (Level D1)

The pipeline represents the core orchestration logic for the Libra Legal AI system, managing the sequential transition between specialized agents and enforcing quality gates through standardized interfaces and confidence thresholds.

## Core Orchestration and Flow
The pipeline follows a strict canonical sequence managed by the **Ali** agent, which acts as the central orchestrator.

*   **Sequence**: Rachel (Trigger/Intake) → Donna (Ingestion) → Mike (Extraction) → Edu (Triage) → Jess (Drafting) → Lou (Review) → Human Delivery.
*   **Agent Roles**:
    *   **Donna**: Handles document ingestion, summaries, and formal reviews.
    *   **Mike**: Extracts claim details and policy summaries.
    *   **Edu**: Performs triage, risk assessment, and coverage checks.
    *   **Jess**: Drafts legal documents (answers, denials, memos).
    *   **Lou**: Conducts final consistency and normative risk reviews.
*   **Documentation Reference**: See *ali_orchestration.md* and *canonical_pipeline.md* for detailed stage definitions.

## Quality Gates and Confidence Thresholds
Automated "STOP" and "FLAG" conditions are enforced at critical stages to ensure data integrity before proceeding to drafting.

*   **Donna**: Immediate stop if a document is marked as `bloqueante`.
*   **Mike**: Pipeline stops and escalates if `overall_confidence < 0.5`; flags for review if `< 0.7`.
*   **Edu**: Any skill with `overall_confidence < 0.5` triggers a stop and escalation.
*   **Lou (Review Outcomes)**:
    *   `aprobar`: Proceed to delivery.
    *   `corregir_y_reenviar`: Triggers a one-time reactivation of Jess for corrections.
    *   `rechazar_y_rehacer` / `escalar_a_humano`: Stops the automated flow for human intervention.
*   **Documentation Reference**: See *confidence_thresholds.md* for the complete condition/action matrix.

## Interface Contracts and Integration
Communication between agents is governed by standardized JSON contracts to ensure seamless handoffs.

*   **Ali-Lou Interface**: Requests include case IDs, document paths, and prior agent outputs (e.g., `donna_output`). Responses include a `resultado`, `score_calidad`, and specific `hallazgos` (findings).
*   **Persistence**: Outputs from every stage are persisted in the database to maintain a traceable audit trail.
*   **Manual Overrides**: In manual trigger mode, specific fields like `fecha_notificacion_asegurador` are required before the pipeline proceeds to the extraction phase.
*   **Documentation Reference**: See *agent_interfaces.md* for schema examples.

## Key Concepts for Drill-down
*   **Agent Handoff**: The mechanism for passing context and files between stages (*context.md*).
*   **Canonical Stages**: The five official phases: Ingesta, Extracción, Triage, Borrador, and Revisión (*canonical_pipeline.md*).
*   **Substantive Review**: Logic requiring Lou's review for legal documents while skipping operational responses (*ali_orchestration.md*).