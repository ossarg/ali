# Claim Resolution — Implementation Plan
**Branch:** `feature/claim-resolution`
**Date:** 2026-03-07

## Problem
Case events approved by humans have a `raw_claim_number` extracted by Rachel.
That number needs to be validated against SISE and linked to a real `claim` + `case` in our DB.
Two triggers:
1. **Auto:** after a human approves a case_event → background goroutine
2. **Manual retry:** human corrects the nro_stro in /claims UI → retry endpoint

## SISE status → PipelineStage mapping
| SISE `CurrentStatus` | PipelineStage |
|---|---|
| ABIERTO | PipelineStageIngesta (1) |
| MEDIACION | PipelineStageTriage (3) |
| JUICIO | PipelineStageAsignado (4) |
| TERMINADO | PipelineStageCompletado (6) |
| RECHAZO | PipelineStageCompletado (6) |

## Migration 009 — resolution fields on case_events
```sql
resolution_status   SMALLINT NOT NULL DEFAULT 0
  -- 0=pending, 1=resolved, 2=unresolved
resolution_error    TEXT NULL
resolved_claim_id   UUID NULL FK → claims(id)
corrected_claim_number VARCHAR(100) NULL
correction_comment  TEXT NULL
```

## Backend tasks (sequential)
- [x] Write plan (this file)
- [ ] 1. Migration 009
- [ ] 2. Add ResolutionStatus type + fields to CaseEvent model
- [ ] 3. ClaimResolutionService (internal/services/claim_resolution_service.go)
      - resolveEvent(eventID) — looks up SISE, creates claim, creates/updates case
      - retryResolution(eventID, correctedNroStro, comment) — manual retry
      - SISEStatusToPipelineStage(status string) PipelineStage
      - batchResolveUnlinked() — finds cases with claim_number but no claim_id
- [ ] 4. Wire async goroutine in ReviewEvent (case_service.go)
      - After marking approved=true, if raw_claim_number != "" → go resolveEvent()
- [ ] 5. New endpoints in case_controller.go
      - GET  /api/v1/claims/unresolved
      - POST /api/v1/activity/events/:id/resolve  (manual retry)
      - POST /api/v1/claims/batch-resolve
- [ ] 6. Update router
- [ ] 7. Update DTOs (CaseEventResponse: add resolution fields)
- [ ] 8. Update mock in service tests
- [ ] 9. Swag init

## Frontend tasks (sequential)
- [ ] 10. Update CaseEvent schema (add resolution fields)
- [ ] 11. Add unresolved section to /claims page
       - Alert banner (like activity panel)
       - Table: mail subject, raw_claim_number, SISE error, date
       - Correct modal: corrected nro_stro input + comment (Rachel feedback)
- [ ] 12. Add POST resolve hook

## Completion check
- [ ] go build ./... passes
- [ ] go test ./... passes
- [ ] tsc --noEmit passes
- [ ] swag regenerated
- [ ] Migration file present
