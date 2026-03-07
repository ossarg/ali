package services

import (
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
	GetMetrics() (*dto.ClaimMetrics, error)
	GetByID(id string) (*dto.ClaimResponse, error)
	Lookup(nroStro string) (*dto.ClaimLookupResponse, error)
	Create(nroStro string) (*dto.ClaimResponse, error)

	// Resolution — triggered after a case_event is approved
	ResolveAsync(eventID string)
	RetryResolution(eventID, correctedNroStro, comment string) (*dto.CaseEventResponse, error)
	ListUnresolved() ([]dto.CaseEventResponse, error)
	BatchResolveUnlinked() (resolved int, errCount int, err error)
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
func (s *claimService) Lookup(nroStro string) (*dto.ClaimLookupResponse, error) {
	claimResult, err := s.siseOrch.GetClaimByNumber(nroStro)
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

// Create persists a claim (header + stages + payments) from SISE into our DB.
// Idempotent by sise_claim_id — if already exists, returns the existing record.
func (s *claimService) Create(nroStro string) (*dto.ClaimResponse, error) {
	// 1. Fetch from SISE
	lookup, err := s.Lookup(nroStro)
	if err != nil {
		return nil, err
	}

	claimResult := lookup.Claim
	header := claimResult.Header

	// 2. Check for existing claim
	existing, err := s.claimRepo.FindBySISEClaimID(header.IDStro)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}

	parseSISEDate := func(s string) time.Time {
		t, _ := time.Parse("2006-01-02 15:04:05", s)
		return t
	}

	var claim *models.Claim

	if existing != nil {
		claim = existing
	} else {
		// 3. Build and persist the claim header
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

	// 4. Upsert stages and payments (always — keeps data fresh even on re-create)
	var latestStatus string
	for _, stage := range claimResult.Stages {
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
			payDate := parseSISEDate(*p.PaymentDate)
			payment := &models.ClaimPayment{
				StageID:     cs.ID,
				ClaimID:     claim.ID,
				Amount:      p.Amount,
				PaymentDate: payDate,
			}
			_ = s.claimRepo.CreatePayment(payment) // best-effort, ignore duplicate errors
		}

		latestStatus = stage.Status // last stage wins
	}

	// 5. Update denormalized current_status
	if latestStatus != "" {
		_ = s.claimRepo.UpdateCurrentStatus(claim.ID.String(), latestStatus)
	}

	// 6. Return fresh from DB with preloaded stages
	fresh, err := s.claimRepo.FindByID(claim.ID.String())
	if err != nil || fresh == nil {
		return nil, apierrors.ErrInternalServer
	}

	resp := dto.ToClaimResponse(*fresh)
	return &resp, nil
}

// ─── Resolution methods ───────────────────────────────────────────────────────

func (s *claimService) ResolveAsync(eventID string) {
	go func() {
		if err := s.resolveEvent(eventID, ""); err != nil {
			log.Printf("[ClaimResolution] event %s failed: %v", eventID, err)
		}
	}()
}

func (s *claimService) RetryResolution(eventID, correctedNroStro, comment string) (*dto.CaseEventResponse, error) {
	event, err := s.caseRepo.FindEventByID(eventID)
	if err != nil || event == nil {
		return nil, fmt.Errorf("event not found: %s", eventID)
	}
	event.CorrectedClaimNumber = correctedNroStro
	event.CorrectionComment = comment
	if err := s.caseRepo.UpdateEvent(event); err != nil {
		return nil, fmt.Errorf("failed to save correction: %w", err)
	}
	if err := s.resolveEvent(eventID, correctedNroStro); err != nil {
		updated, _ := s.caseRepo.FindEventByID(eventID)
		if updated != nil {
			resp := dto.ToCaseEventResponse(*updated)
			return &resp, fmt.Errorf("SISE resolution failed: %w", err)
		}
		return nil, err
	}
	updated, err := s.caseRepo.FindEventByID(eventID)
	if err != nil || updated == nil {
		return nil, fmt.Errorf("event not found after update")
	}
	resp := dto.ToCaseEventResponse(*updated)
	return &resp, nil
}

func (s *claimService) ListUnresolved() ([]dto.CaseEventResponse, error) {
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

func (s *claimService) BatchResolveUnlinked() (resolved int, errCount int, err error) {
	events, err := s.caseRepo.ListPendingResolutionEvents()
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
		time.Sleep(200 * time.Millisecond)
	}
	return resolved, errCount, nil
}

// resolveEvent — core: SISE lookup → persist claim → create/update case
func (s *claimService) resolveEvent(eventID, nroStroOverride string) error {
	event, err := s.caseRepo.FindEventByID(eventID)
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

	// Reuse existing Create logic — idempotent, handles stages + payments
	claimResp, err := s.Create(nroStro)
	if err != nil {
		return s.markUnresolved(event, fmt.Sprintf("SISE lookup failed: %v", err))
	}

	// Find the persisted claim to get its UUID
	claimModel, err := s.claimRepo.FindByID(claimResp.ID.String())
	if err != nil || claimModel == nil {
		return s.markUnresolved(event, "claim not found after create")
	}

	// Create/update case
	if err := s.findOrCreateCase(event, claimModel, nroStro); err != nil {
		return s.markUnresolved(event, fmt.Sprintf("failed to create/update case: %v", err))
	}

	resolved := models.ResolutionResolved
	event.ResolutionStatus = resolved
	event.ResolutionError = ""
	event.ResolvedClaimID = &claimModel.ID
	if err := s.caseRepo.UpdateEvent(event); err != nil {
		return fmt.Errorf("failed to mark resolved: %w", err)
	}
	log.Printf("[ClaimResolution] event %s resolved → claim %s (status: %s)", eventID, claimModel.ID, claimModel.CurrentStatus)
	return nil
}

func (s *claimService) markUnresolved(event *models.CaseEvent, reason string) error {
	event.ResolutionStatus = models.ResolutionUnresolved
	event.ResolutionError = reason
	_ = s.caseRepo.UpdateEvent(event)
	return fmt.Errorf("%s", reason)
}

func (s *claimService) findOrCreateCase(event *models.CaseEvent, claim *models.Claim, nroStro string) error {
	stage := siseStatusToPipelineStage(claim.CurrentStatus)

	if event.CaseID != nil {
		c, err := s.caseRepo.GetByID(event.CaseID.String())
		if err == nil && c != nil {
			c.ClaimID = &claim.ID
			c.PipelineStage = stage
			if c.ClaimNumber == "" {
				c.ClaimNumber = nroStro
			}
			return s.caseRepo.Update(c)
		}
	}

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
	if err := s.caseRepo.Create(newCase); err != nil {
		return err
	}
	event.CaseID = &newCase.ID
	return s.caseRepo.UpdateEvent(event)
}

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
