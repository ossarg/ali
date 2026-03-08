package services

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/models"
	"github.com/ossarg/ali/backend/internal/repositories"
	"github.com/ossarg/ali/backend/internal/services/sise"
)

type ClaimService interface {
	List() ([]dto.ClaimResponse, error)
	ListPaginated(page, limit int) (*dto.PaginatedClaims, error)
	GetMetrics() (*dto.ClaimMetrics, error)
	GetByID(id string) (*dto.ClaimResponse, error)
	Lookup(claimNumber string) (*dto.ClaimLookupResponse, error)

	// SyncFromSISE fetches a claim from SISE by claim number and persists it (idempotent).
	SyncFromSISE(claimNumber string) (*dto.ClaimResponse, error)

	// Resolution — triggered after a case_event is approved
	ResolveEventAsync(eventID string)
	RetryEventResolution(eventID, correctedClaimNumber, comment string) (*dto.CaseEventResponse, error)
	ListUnresolvedEvents() ([]dto.CaseEventResponse, error)
	BatchResolvePendingEvents() (resolved int, errCount int, err error)
}

type claimService struct {
	claimRepo repositories.ClaimRepository
	caseRepo  repositories.CaseRepository
	siseOrch  *sise.ConsultasOrchestrator
}

func NewClaimService(
	claimRepo repositories.ClaimRepository,
	caseRepo repositories.CaseRepository,
	siseOrch *sise.ConsultasOrchestrator,
) ClaimService {
	return &claimService{
		claimRepo: claimRepo,
		caseRepo:  caseRepo,
		siseOrch:  siseOrch,
	}
}

func (s *claimService) List() ([]dto.ClaimResponse, error) {
	claims, err := s.claimRepo.List()
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	result := make([]dto.ClaimResponse, len(claims))
	for i, c := range claims {
		result[i] = dto.ToClaimResponse(c)
	}
	return result, nil
}

func (s *claimService) ListPaginated(page, limit int) (*dto.PaginatedClaims, error) {
	pp := dto.PageParams{Page: page, Limit: limit}
	claims, total, err := s.claimRepo.ListPaginated(pp.Offset(), limit)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	data := make([]dto.ClaimResponse, len(claims))
	for i, c := range claims {
		data[i] = dto.ToClaimResponse(c)
	}
	return &dto.PaginatedClaims{Data: data, Total: total, Page: page, Limit: limit}, nil
}

func (s *claimService) GetMetrics() (*dto.ClaimMetrics, error) {
	total, open, mediation, lawsuit, err := s.claimRepo.GetMetrics()
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	return &dto.ClaimMetrics{
		Total:     total,
		Open:      open,
		Mediation: mediation,
		Lawsuit:   lawsuit,
	}, nil
}

func (s *claimService) GetByID(id string) (*dto.ClaimResponse, error) {
	c, err := s.claimRepo.FindByID(id)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	if c == nil {
		return nil, nil
	}
	resp := dto.ToClaimResponse(*c)
	return &resp, nil
}

// Lookup fetches claim + policy + producer from SISE without persisting.
func (s *claimService) Lookup(claimNumber string) (*dto.ClaimLookupResponse, error) {
	claimResult, err := s.siseOrch.GetClaimByNumber(claimNumber)
	if err != nil {
		return nil, fmt.Errorf("SISE claim lookup failed: %w", err)
	}
	if claimResult == nil {
		return nil, apierrors.ErrNotFound
	}

	policy, err := s.siseOrch.GetPolicySummary(claimResult.Header.IDPV)
	if err != nil {
		return nil, fmt.Errorf("SISE policy lookup failed: %w", err)
	}

	var producer *sise.Producer
	if policy != nil && policy.CodigoProductor > 0 {
		producer, err = s.siseOrch.GetProducerByCode(int(policy.CodigoProductor))
		if err != nil {
			return nil, fmt.Errorf("SISE producer lookup failed: %w", err)
		}
	}

	return &dto.ClaimLookupResponse{
		Claim:    claimResult,
		Policy:   policy,
		Producer: producer,
	}, nil
}

// SyncFromSISE fetches a claim from SISE by claim number and persists it (idempotent by sise_claim_id).
// If the claim already exists in our DB, it refreshes stages and payments and returns the existing record.
func (s *claimService) SyncFromSISE(claimNumber string) (*dto.ClaimResponse, error) {
	lookup, err := s.Lookup(claimNumber)
	if err != nil {
		return nil, err
	}

	header := lookup.Claim.Header

	existing, err := s.claimRepo.FindBySISEClaimID(header.IDStro)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}

	var claim *models.Claim

	if existing != nil {
		claim = existing
	} else {
		claim = &models.Claim{
			SISEClaimID:       header.IDStro,
			SISEIdPV:          header.IDPV,
			ClaimNumber:       header.NroSiniestro,
			PolicyNumber:      int64(header.NroPoliza),
			PolicyEndorsement: int64(header.NroEndoso),
			RamoCode:          int16(header.CodigoRamo),
			IncidentDate:      parseSISEDate(header.FechaIncurrido),
			RegistrationDate:  parseSISEDate(header.FechaRegistro),
			NoticeDate:        parseSISEDate(header.FechaAviso),
			Cause:             header.Causa,
			Coverage:          header.Cobertura,
			Contratante:       header.ContratantePagador,
			DocType:           header.TomadorTipoDoc,
			DocNumber:         header.TomadorDoc,
		}

		if lookup.Policy != nil {
			claim.PolicyType = lookup.Policy.TipoPoliza
			claim.InsuredAmount = lookup.Policy.SumaAsegurada
			claim.PolicyValidFrom = parseSISEDate(lookup.Policy.VigenciaDesde)
			claim.PolicyValidTo = parseSISEDate(lookup.Policy.VigenciaHasta)
			claim.CommercialProductCode = int16(lookup.Policy.CodProductoCom)
			claim.CommercialProduct = lookup.Policy.ProductoComercial
		}

		if lookup.Producer != nil {
			claim.ProducerCode = int(lookup.Producer.CodAgente)
			claim.ProducerTypeCode = int16(lookup.Producer.CodTipoAgente)
			claim.ProducerGroupCode = int16(lookup.Producer.CodGrupo)
			claim.ProducerStatus = lookup.Producer.CodEstado
			claim.ProducerName = lookup.Producer.Nombre
			claim.ProducerType = lookup.Producer.TipoAgente
		}

		if err := s.claimRepo.Create(claim); err != nil {
			return nil, apierrors.ErrInternalServer
		}
	}

	// Always upsert stages and payments — keeps data fresh even on re-sync.
	var latestStatus string
	for _, stage := range lookup.Claim.Stages {
		cs := &models.ClaimStage{
			ClaimID:         claim.ID,
			SISEStageNumber: int(stage.StageNumber),
			SISEStatusID:    stage.StatusID,
			Status:          stage.Status,
		}
		if err := s.claimRepo.UpsertStage(cs); err != nil {
			return nil, apierrors.ErrInternalServer
		}

		for _, p := range stage.Payments {
			if p.PaymentDate == nil {
				continue
			}
			payment := &models.ClaimPayment{
				StageID:     cs.ID,
				ClaimID:     claim.ID,
				Amount:      p.Amount,
				PaymentDate: parseSISEDate(*p.PaymentDate),
			}
			_ = s.claimRepo.CreatePayment(payment) // best-effort — duplicate payments are ignored
		}

		latestStatus = stage.Status // last stage wins
	}

	if latestStatus != "" {
		_ = s.claimRepo.UpdateCurrentStatus(claim.ID.String(), latestStatus)
	}

	fresh, err := s.claimRepo.FindByID(claim.ID.String())
	if err != nil || fresh == nil {
		return nil, apierrors.ErrInternalServer
	}

	resp := dto.ToClaimResponse(*fresh)
	return &resp, nil
}

// ─── Resolution ───────────────────────────────────────────────────────────────

// ResolveEventAsync triggers a background SISE resolution for an approved case event.
func (s *claimService) ResolveEventAsync(eventID string) {
	go func() {
		if err := s.resolveEvent(eventID, ""); err != nil {
			log.Printf("[ClaimResolution] event %s failed: %v", eventID, err)
		}
	}()
}

// RetryEventResolution lets a human correct the claim number extracted by Rachel
// and retries the SISE lookup synchronously.
func (s *claimService) RetryEventResolution(eventID, correctedClaimNumber, comment string) (*dto.CaseEventResponse, error) {
	event, err := s.caseRepo.FindEventByID(eventID)
	if err != nil || event == nil {
		return nil, fmt.Errorf("event not found: %s", eventID)
	}

	event.CorrectedClaimNumber = correctedClaimNumber
	event.CorrectionComment = comment
	if err := s.caseRepo.UpdateEvent(event); err != nil {
		return nil, fmt.Errorf("failed to save correction: %w", err)
	}

	if err := s.resolveEvent(eventID, correctedClaimNumber); err != nil {
		// Return partial response so the UI can show what we know
		updated, _ := s.caseRepo.FindEventByID(eventID)
		if updated != nil {
			resp := dto.ToCaseEventResponse(*updated)
			return &resp, fmt.Errorf("SISE resolution failed: %w", err)
		}
		return nil, err
	}

	updated, err := s.caseRepo.FindEventByID(eventID)
	if err != nil || updated == nil {
		return nil, fmt.Errorf("event not found after resolution")
	}
	resp := dto.ToCaseEventResponse(*updated)
	return &resp, nil
}

// ListUnresolvedEvents returns approved events where SISE resolution failed.
func (s *claimService) ListUnresolvedEvents() ([]dto.CaseEventResponse, error) {
	events, err := s.caseRepo.ListUnresolvedEvents()
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	result := make([]dto.CaseEventResponse, len(events))
	for i, e := range events {
		result[i] = dto.ToCaseEventResponse(e)
	}
	return result, nil
}

// BatchResolvePendingEvents resolves all approved events that have a raw_claim_number
// but have not yet been successfully matched to a claim. Runs sequentially to avoid
// flooding SISE.
func (s *claimService) BatchResolvePendingEvents() (resolved int, errCount int, err error) {
	events, err := s.caseRepo.ListPendingResolutionEvents()
	if err != nil {
		return 0, 0, fmt.Errorf("failed to list pending events: %w", err)
	}
	for _, event := range events {
		if resolveErr := s.resolveEvent(event.ID.String(), ""); resolveErr != nil {
			log.Printf("[BatchResolve] event %s failed: %v", event.ID, resolveErr)
			errCount++
		} else {
			resolved++
		}
		time.Sleep(200 * time.Millisecond) // rate-limit SISE calls
	}
	return resolved, errCount, nil
}

// ─── Internal ─────────────────────────────────────────────────────────────────

// resolveEvent is the core resolution pipeline:
// raw_claim_number → SISE → persist claim → find/create case → link event.
func (s *claimService) resolveEvent(eventID, claimNumberOverride string) error {
	event, err := s.caseRepo.FindEventByID(eventID)
	if err != nil || event == nil {
		return fmt.Errorf("event not found: %s", eventID)
	}

	claimNumber := event.RawClaimNumber
	if claimNumberOverride != "" {
		claimNumber = claimNumberOverride
	}
	if claimNumber == "" {
		return s.markEventUnresolved(event, "no claim number available (raw_claim_number is empty)")
	}

	claimResp, err := s.SyncFromSISE(claimNumber)
	if err != nil {
		return s.markEventUnresolved(event, fmt.Sprintf("SISE sync failed: %v", err))
	}

	claimModel, err := s.claimRepo.FindByID(claimResp.ID.String())
	if err != nil || claimModel == nil {
		return s.markEventUnresolved(event, "claim not found in DB after SISE sync")
	}

	if err := s.linkEventToCase(event, claimModel, claimNumber); err != nil {
		return s.markEventUnresolved(event, fmt.Sprintf("case link failed: %v", err))
	}

	event.ResolutionStatus = models.ResolutionResolved
	event.ResolutionError = ""
	event.ResolvedClaimID = &claimModel.ID
	if err := s.caseRepo.UpdateEvent(event); err != nil {
		return fmt.Errorf("failed to mark event as resolved: %w", err)
	}

	log.Printf("[ClaimResolution] event %s resolved → claim %s (status: %s)", eventID, claimModel.ID, claimModel.CurrentStatus)
	return nil
}

// linkEventToCase finds an existing case for the claim or creates one, then links
// the event. Prevents duplicate cases for the same claim.
func (s *claimService) linkEventToCase(event *models.CaseEvent, claim *models.Claim, claimNumber string) error {
	stage := siseStatusToPipelineStage(claim.CurrentStatus)

	// First: look for a case already linked to this claim
	existing, err := s.caseRepo.FindByClaim(claim.ID.String())
	if err != nil {
		return err
	}

	if existing != nil {
		// Case exists — just link the event to it
		event.CaseID = &existing.ID
		return s.caseRepo.UpdateEvent(event)
	}

	// No case for this claim yet — create one from claim data
	title := claim.Contratante
	if title == "" {
		title = fmt.Sprintf("Siniestro %s", claimNumber)
	}

	newCase := &models.Case{
		Title:         title,
		ClaimNumber:   claimNumber,
		CaseType:      models.CaseTypeLawsuit,
		Status:        models.CaseStatusOpen,
		PipelineStage: stage,
		ClaimID:       &claim.ID,
	}
	if claim.IncidentDate != (time.Time{}) {
		newCase.IncidentDate = &claim.IncidentDate
	}

	if err := s.caseRepo.Create(newCase); err != nil {
		return err
	}

	event.CaseID = &newCase.ID
	return s.caseRepo.UpdateEvent(event)
}

// markEventUnresolved records the failure reason on the event and returns the error.
func (s *claimService) markEventUnresolved(event *models.CaseEvent, reason string) error {
	event.ResolutionStatus = models.ResolutionUnresolved
	event.ResolutionError = reason
	_ = s.caseRepo.UpdateEvent(event)
	return errors.New(reason)
}

// parseSISEDate parses a SISE date string ("2006-01-02 15:04:05") into time.Time.
// Returns zero time on failure — callers should validate when the field is required.
func parseSISEDate(s string) time.Time {
	t, _ := time.Parse("2006-01-02 15:04:05", s)
	return t
}

// siseStatusToPipelineStage maps a SISE claim status string to our pipeline stage enum.
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
