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
	Lookup(nroStro string) (*dto.ClaimLookupResponse, error)
	Create(nroStro string) (*dto.ClaimResponse, error)
}

type claimService struct {
	claimRepo   repositories.ClaimRepository
	siseOrch    *sise.ConsultasOrchestrator
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

// Lookup fetches claim + policy + producer from SISE without persisting.
func (s *claimService) Lookup(nroStro string) (*dto.ClaimLookupResponse, error) {
	claim, err := s.siseOrch.GetClaimByNumber(nroStro)
	if err != nil {
		return nil, fmt.Errorf("SISE claim lookup failed: %w", err)
	}
	if claim == nil {
		return nil, apierrors.ErrNotFound
	}

	policy, err := s.siseOrch.GetPolicySummary(claim.IDPV)
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
		Claim:    claim,
		Policy:   policy,
		Producer: producer,
	}, nil
}

// Create persists a claim in our DB after fetching from SISE.
// Returns an error if the claim already exists (idempotent by sise_claim_id).
func (s *claimService) Create(nroStro string) (*dto.ClaimResponse, error) {
	// 1. Fetch from SISE
	lookup, err := s.Lookup(nroStro)
	if err != nil {
		return nil, err
	}

	// 2. Check for duplicate
	exists, err := s.claimRepo.ExistsBySISEClaimID(lookup.Claim.IDStro)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	if exists {
		existing, err := s.claimRepo.FindBySISEClaimID(lookup.Claim.IDStro)
		if err != nil {
			return nil, apierrors.ErrInternalServer
		}
		resp := dto.ToClaimResponse(*existing)
		return &resp, nil
	}

	// 3. Parse dates from SISE strings (format: "2026-02-19 00:00:00")
	parseSISEDate := func(s string) time.Time {
		t, _ := time.Parse("2006-01-02 15:04:05", s)
		return t
	}

	claim := &models.Claim{
		SISEClaimID:       lookup.Claim.IDStro,
		SISEIdPV:          lookup.Claim.IDPV,
		ClaimNumber:       lookup.Claim.NroSiniestro,
		ClaimSubnumber:    lookup.Claim.NroSubreclamo,
		PolicyNumber:      int64(lookup.Claim.NroPoliza),
		PolicyEndorsement: int64(lookup.Claim.NroEndoso),
		RamoCode:          int16(lookup.Claim.CodigoRamo),
		IncidentDate:      parseSISEDate(lookup.Claim.FechaIncurrido),
		RegistrationDate:  parseSISEDate(lookup.Claim.FechaRegistro),
		NoticeDate:        parseSISEDate(lookup.Claim.FechaAviso),
		Cause:             lookup.Claim.Causa,
		Coverage:          lookup.Claim.Cobertura,
		Status:            lookup.Claim.Estado,
		EstimatedAmount:   lookup.Claim.ImporteEstimado,
		PaidAmount:        lookup.Claim.ImportePago,
		Contratante:       lookup.Claim.ContratantePagador,
		DocType:           lookup.Claim.TomadorTipoDoc,
		DocNumber:         lookup.Claim.TomadorDoc,
	}

	if lookup.Claim.FechaPago != nil {
		t := parseSISEDate(*lookup.Claim.FechaPago)
		claim.PaymentDate = &t
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

	resp := dto.ToClaimResponse(*claim)
	return &resp, nil
}
