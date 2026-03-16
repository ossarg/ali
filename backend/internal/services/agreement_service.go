package services

import (
	"github.com/google/uuid"
	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/models"
	"github.com/ossarg/ali/backend/internal/repositories"
)

type AgreementService interface {
	List(page, pageSize int) ([]dto.AgreementResponse, int64, error)
	GetByID(id string) (*dto.AgreementResponse, error)
	ListByCaseID(caseID string) ([]dto.AgreementResponse, error)
	Create(req dto.CreateAgreementRequest) (*dto.AgreementResponse, error)
	Update(id string, req dto.UpdateAgreementRequest) (*dto.AgreementResponse, error)
	Delete(id string) error

	ListPending() ([]dto.AgreementResponse, error)

	// CreatePending creates an agreement in pending state immediately when an acuerdo event is approved.
	// Extraction will be populated later by the agent pipeline.
	CreatePending(caseEventID uuid.UUID, caseID *uuid.UUID, claimNumber string) (*models.Agreement, error)
}

type agreementService struct {
	repo repositories.AgreementRepository
}

func NewAgreementService(repo repositories.AgreementRepository) AgreementService {
	return &agreementService{repo: repo}
}

func (s *agreementService) List(page, pageSize int) ([]dto.AgreementResponse, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	agreements, total, err := s.repo.ListAll(page, pageSize)
	if err != nil {
		return nil, 0, apierrors.ErrInternalServer
	}
	result := make([]dto.AgreementResponse, len(agreements))
	for i, a := range agreements {
		result[i] = dto.ToAgreementResponse(a)
	}
	return result, total, nil
}

func (s *agreementService) GetByID(id string) (*dto.AgreementResponse, error) {
	a, err := s.repo.FindByID(id)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	if a == nil {
		return nil, apierrors.ErrNotFound
	}
	resp := dto.ToAgreementResponse(*a)
	return &resp, nil
}

func (s *agreementService) ListByCaseID(caseID string) ([]dto.AgreementResponse, error) {
	agreements, err := s.repo.ListByCaseID(caseID)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	result := make([]dto.AgreementResponse, len(agreements))
	for i, a := range agreements {
		result[i] = dto.ToAgreementResponse(a)
	}
	return result, nil
}

func (s *agreementService) Create(req dto.CreateAgreementRequest) (*dto.AgreementResponse, error) {
	a := &models.Agreement{
		CaseEventID:      req.CaseEventID,
		AgreementType:    req.AgreementType,
		ClaimNumber:      req.ClaimNumber,
		Producer:         req.Producer,
		Beneficiary:      req.Beneficiary,
		Concept:          req.Concept,
		InvoiceNumber:    req.InvoiceNumber,
		Amount:           req.Amount,
		DueDate:          req.DueDate,
		ExtractionStatus: models.ExtractionCompleted,
	}
	if err := s.repo.Create(a); err != nil {
		return nil, apierrors.ErrInternalServer
	}
	resp := dto.ToAgreementResponse(*a)
	return &resp, nil
}

func (s *agreementService) Update(id string, req dto.UpdateAgreementRequest) (*dto.AgreementResponse, error) {
	a, err := s.repo.FindByID(id)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	if a == nil {
		return nil, apierrors.ErrNotFound
	}
	if req.AgreementType != nil {
		a.AgreementType = *req.AgreementType
	}
	if req.ClaimNumber != nil {
		a.ClaimNumber = *req.ClaimNumber
	}
	if req.Producer != nil {
		a.Producer = *req.Producer
	}
	if req.Beneficiary != nil {
		a.Beneficiary = *req.Beneficiary
	}
	if req.Concept != nil {
		a.Concept = *req.Concept
	}
	if req.InvoiceNumber != nil {
		a.InvoiceNumber = *req.InvoiceNumber
	}
	if req.Amount != nil {
		a.Amount = req.Amount
	}
	if req.DueDate != nil {
		a.DueDate = req.DueDate
	}
	// Mark as completed since a human reviewed it
	a.ExtractionStatus = models.ExtractionCompleted
	a.ExtractionError = ""

	if err := s.repo.Update(a); err != nil {
		return nil, apierrors.ErrInternalServer
	}
	resp := dto.ToAgreementResponse(*a)
	return &resp, nil
}

func (s *agreementService) Delete(id string) error {
	a, err := s.repo.FindByID(id)
	if err != nil {
		return apierrors.ErrInternalServer
	}
	if a == nil {
		return apierrors.ErrNotFound
	}
	return s.repo.Delete(id)
}

func (s *agreementService) ListPending() ([]dto.AgreementResponse, error) {
	agreements, _, err := s.repo.ListAll(1, 100)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	var result []dto.AgreementResponse
	for _, a := range agreements {
		if a.ExtractionStatus == models.ExtractionPending {
			result = append(result, dto.ToAgreementResponse(a))
		}
	}
	if result == nil {
		result = []dto.AgreementResponse{}
	}
	return result, nil
}

func (s *agreementService) CreatePending(caseEventID uuid.UUID, caseID *uuid.UUID, claimNumber string) (*models.Agreement, error) {
	a := &models.Agreement{
		CaseEventID:      caseEventID,
		CaseID:           caseID,
		ClaimNumber:      claimNumber,
		ExtractionStatus: models.ExtractionPending,
	}
	if err := s.repo.Create(a); err != nil {
		return nil, apierrors.ErrInternalServer
	}
	return a, nil
}
