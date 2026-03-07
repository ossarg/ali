package services

import (
	"fmt"
	"log"
	"time"

	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/models"
	"github.com/ossarg/ali/backend/internal/repositories"
	"github.com/ossarg/ali/backend/internal/services/sise"
)

// ClaimResolutionService resolves raw_claim_numbers from case_events against SISE,
// creating or linking claims and cases.
type ClaimResolutionService interface {
	// ResolveAsync triggers async resolution for a case_event after approval.
	ResolveAsync(eventID string)

	// RetryResolution allows a human to correct the nro_stro and retry.
	RetryResolution(eventID, correctedNroStro, comment string) (*dto.CaseEventResponse, error)

	// ListUnresolved returns all case_events with resolution_status = unresolved.
	ListUnresolved() ([]dto.CaseEventResponse, error)

	// BatchResolveUnlinked resolves approved events that have raw_claim_number but no resolved claim.
	BatchResolveUnlinked() (resolved int, errCount int, err error)
}

type claimResolutionService struct {
	eventRepo repositories.CaseRepository
	claimRepo repositories.ClaimRepository
	siseOrch  *sise.ConsultasOrchestrator
}

func NewClaimResolutionService(
	eventRepo repositories.CaseRepository,
	claimRepo repositories.ClaimRepository,
	siseOrch *sise.ConsultasOrchestrator,
) ClaimResolutionService {
	return &claimResolutionService{
		eventRepo: eventRepo,
		claimRepo: claimRepo,
		siseOrch:  siseOrch,
	}
}

// siseStatusToPipelineStage maps SISE current_status to our pipeline stage.
func siseStatusToPipelineStage(status string) models.PipelineStage {
	switch status {
	case "ABIERTO":
		return models.PipelineStageIngesta
	case "MEDIACION":
		return models.PipelineStageTriage
	case "JUICIO":
		return models.PipelineStageAsignado
	case "TERMINADO", "RECHAZO":
		return models.PipelineStageCompletado
	default:
		return models.PipelineStageIngesta
	}
}

func (s *claimResolutionService) ResolveAsync(eventID string) {
	go func() {
		if err := s.resolveEvent(eventID, ""); err != nil {
			log.Printf("[ClaimResolution] event %s failed: %v", eventID, err)
		}
	}()
}

func (s *claimResolutionService) RetryResolution(eventID, correctedNroStro, comment string) (*dto.CaseEventResponse, error) {
	event, err := s.eventRepo.FindEventByID(eventID)
	if err != nil || event == nil {
		return nil, fmt.Errorf("event not found: %s", eventID)
	}

	// Store correction for Rachel's feedback
	event.CorrectedClaimNumber = correctedNroStro
	event.CorrectionComment = comment
	if err := s.eventRepo.UpdateEvent(event); err != nil {
		return nil, fmt.Errorf("failed to save correction: %w", err)
	}

	if err := s.resolveEvent(eventID, correctedNroStro); err != nil {
		resp := dto.ToCaseEventResponse(*event)
		return &resp, fmt.Errorf("SISE resolution failed: %w", err)
	}

	// Re-fetch to get updated resolution status
	updated, err := s.eventRepo.FindEventByID(eventID)
	if err != nil || updated == nil {
		return nil, fmt.Errorf("event not found after update")
	}
	resp := dto.ToCaseEventResponse(*updated)
	return &resp, nil
}

func (s *claimResolutionService) ListUnresolved() ([]dto.CaseEventResponse, error) {
	events, err := s.eventRepo.ListUnresolvedEvents()
	if err != nil {
		return nil, err
	}
	result := make([]dto.CaseEventResponse, len(events))
	for i, e := range events {
		result[i] = dto.ToCaseEventResponse(e)
	}
	return result, nil
}

func (s *claimResolutionService) BatchResolveUnlinked() (resolved int, errCount int, err error) {
	events, err := s.eventRepo.ListPendingResolutionEvents()
	if err != nil {
		return 0, 0, fmt.Errorf("failed to list pending resolution events: %w", err)
	}

	for _, event := range events {
		if resolveErr := s.resolveEvent(event.ID.String(), ""); resolveErr != nil {
			log.Printf("[BatchResolve] event %s failed: %v", event.ID, resolveErr)
			errCount++
		} else {
			resolved++
		}
		// Small delay to avoid hammering SISE
		time.Sleep(200 * time.Millisecond)
	}
	return resolved, errCount, nil
}

// resolveEvent is the core resolution logic.
// nroStroOverride: if non-empty, use instead of event.RawClaimNumber (for manual retry).
func (s *claimResolutionService) resolveEvent(eventID, nroStroOverride string) error {
	event, err := s.eventRepo.FindEventByID(eventID)
	if err != nil || event == nil {
		return fmt.Errorf("event not found: %s", eventID)
	}

	nroStro := event.RawClaimNumber
	if nroStroOverride != "" {
		nroStro = nroStroOverride
	}

	if nroStro == "" {
		return s.markUnresolved(event, "no raw_claim_number available")
	}

	// Query SISE
	claimResult, err := s.siseOrch.GetClaimByNumber(nroStro)
	if err != nil {
		return s.markUnresolved(event, fmt.Sprintf("SISE lookup failed: %v", err))
	}
	if claimResult == nil || claimResult.Header == nil {
		return s.markUnresolved(event, fmt.Sprintf("nro_stro %s not found in SISE", nroStro))
	}

	// Get policy and producer details
	policyResult, _ := s.siseOrch.GetPolicySummary(claimResult.Header.IDPV)
	var producerResult *sise.Producer
	if policyResult != nil {
		producerResult, _ = s.siseOrch.GetProducerByCode(int(policyResult.CodigoProductor))
	}

	// Determine current status — use last stage's status
	currentStatus := claimResult.Header.Estado
	for _, stage := range claimResult.Stages {
		if stage.Status != "" {
			currentStatus = stage.Status
		}
	}

	// Find or create claim in our DB
	claimModel, err := s.findOrCreateClaim(claimResult, policyResult, producerResult, currentStatus)
	if err != nil {
		return s.markUnresolved(event, fmt.Sprintf("failed to persist claim: %v", err))
	}

	// Find or create case linked to this claim
	if err := s.findOrCreateCase(event, claimModel, currentStatus, nroStro); err != nil {
		return s.markUnresolved(event, fmt.Sprintf("failed to create/update case: %v", err))
	}

	// Mark resolved
	resolved := models.ResolutionResolved
	event.ResolutionStatus = resolved
	event.ResolutionError = ""
	event.ResolvedClaimID = &claimModel.ID
	if err := s.eventRepo.UpdateEvent(event); err != nil {
		return fmt.Errorf("failed to mark event as resolved: %w", err)
	}

	log.Printf("[ClaimResolution] event %s resolved → claim %s (status: %s)", eventID, claimModel.ID, currentStatus)
	return nil
}

func (s *claimResolutionService) markUnresolved(event *models.CaseEvent, reason string) error {
	event.ResolutionStatus = models.ResolutionUnresolved
	event.ResolutionError = reason
	if err := s.eventRepo.UpdateEvent(event); err != nil {
		log.Printf("[ClaimResolution] failed to mark event %s as unresolved: %v", event.ID, err)
	}
	return fmt.Errorf("%s", reason)
}

func (s *claimResolutionService) findOrCreateClaim(
	cr *sise.ClaimResult,
	pr *sise.PolicySummary,
	prod *sise.Producer,
	currentStatus string,
) (*models.Claim, error) {
	h := cr.Header

	// Check if already exists
	existing, err := s.claimRepo.FindBySISEClaimID(h.IDStro)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		if existing.CurrentStatus != currentStatus && currentStatus != "" {
			_ = s.claimRepo.UpdateCurrentStatus(existing.ID.String(), currentStatus)
			existing.CurrentStatus = currentStatus
		}
		return existing, nil
	}

	// Build new claim
	claim := &models.Claim{
		SISEClaimID:   h.IDStro,
		SISEIdPV:      h.IDPV,
		ClaimNumber:   h.NroSiniestro,
		PolicyNumber:  int64(h.NroPoliza),
		RamoCode:      int16(h.CodigoRamo),
		CurrentStatus: currentStatus,
		Cause:         h.Causa,
		Coverage:      h.Cobertura,
		Contratante:   h.Titular,
		DocType:       h.TomadorTipoDoc,
		DocNumber:     h.TomadorDoc,
	}

	parseDate := func(s string) time.Time {
		for _, layout := range []string{"2006-01-02", "02/01/2006", "2006-01-02T15:04:05"} {
			if t, err := time.Parse(layout, s); err == nil {
				return t
			}
		}
		return time.Time{}
	}

	if h.FechaIncurrido != "" {
		claim.IncidentDate = parseDate(h.FechaIncurrido)
	}
	if h.FechaRegistro != "" {
		claim.RegistrationDate = parseDate(h.FechaRegistro)
	}
	if h.FechaAviso != "" {
		claim.NoticeDate = parseDate(h.FechaAviso)
	}

	if pr != nil {
		claim.PolicyNumber = int64(pr.NumeroPoliza)
		claim.PolicyEndorsement = int64(pr.NumeroEndoso)
		claim.PolicyType = pr.TipoPoliza
		claim.PolicyValidFrom = parseDate(pr.VigenciaDesde)
		claim.PolicyValidTo = parseDate(pr.VigenciaHasta)
	}

	if prod != nil {
		claim.ProducerCode = int(prod.CodAgente)
		claim.ProducerName = prod.Nombre
		claim.ProducerType = prod.TipoAgente
	}

	if err := s.claimRepo.Create(claim); err != nil {
		return nil, err
	}
	return claim, nil
}

func (s *claimResolutionService) findOrCreateCase(
	event *models.CaseEvent,
	claim *models.Claim,
	currentStatus string,
	nroStro string,
) error {
	stage := siseStatusToPipelineStage(currentStatus)

	// If event already has a case_id, update the existing case
	if event.CaseID != nil {
		caseModel, err := s.eventRepo.GetByID(event.CaseID.String())
		if err == nil && caseModel != nil {
			caseModel.ClaimID = &claim.ID
			caseModel.PipelineStage = stage
			if caseModel.ClaimNumber == "" {
				caseModel.ClaimNumber = nroStro
			}
			return s.eventRepo.Update(caseModel)
		}
	}

	// Create new case from claim data
	title := claim.Contratante
	if title == "" {
		title = fmt.Sprintf("Siniestro %s", nroStro)
	}

	newCase := &models.Case{
		Title:         title,
		ClaimNumber:   nroStro,
		CaseType:      models.CaseTypeLawsuit,
		Status:        models.CaseStatusOpen,
		PipelineStage: stage,
		ClaimID:       &claim.ID,
	}
	if claim.IncidentDate != (time.Time{}) {
		newCase.IncidentDate = &claim.IncidentDate
	}

	if err := s.eventRepo.Create(newCase); err != nil {
		return fmt.Errorf("failed to create case: %w", err)
	}

	// Link case to event
	event.CaseID = &newCase.ID
	return s.eventRepo.UpdateEvent(event)
}
