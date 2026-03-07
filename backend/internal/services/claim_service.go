package services

import (
	"fmt"
	"time"

	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/models"
	"github.com/ossarg/ali/backend/internal/repositories"
	"github.com/ossarg/ali/backend/internal/services/sise"
)

type ClaimService interface {
	List() ([]dto.ClaimResponse, error)
	GetByID(id string) (*dto.ClaimResponse, error)
	Lookup(nroStro string) (*dto.ClaimLookupResponse, error)
	Create(nroStro string) (*dto.ClaimResponse, error)
}

type claimService struct {
	claimRepo repositories.ClaimRepository
	siseOrch  *sise.ConsultasOrchestrator
}

func NewClaimService(claimRepo repositories.ClaimRepository, siseOrch *sise.ConsultasOrchestrator) ClaimService {
	return &claimService{
		claimRepo: claimRepo,
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
