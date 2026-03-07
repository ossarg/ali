package services

import (
	"github.com/google/uuid"
	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/models"
	"github.com/ossarg/ali/backend/internal/repositories"
)

type CaseService interface {
	List(req dto.ListCasesRequest) ([]dto.CaseResponse, error)
	GetByID(id string) (*dto.CaseResponse, error)
	CreateEvent(req dto.CreateCaseEventRequest) (*dto.CaseEventResponse, error)
}

type caseService struct {
	caseRepo repositories.CaseRepository
}

func NewCaseService(caseRepo repositories.CaseRepository) CaseService {
	return &caseService{caseRepo: caseRepo}
}

func (s *caseService) List(req dto.ListCasesRequest) ([]dto.CaseResponse, error) {
	filters := repositories.CaseFilters{}

	if req.Status != nil {
		st := models.CaseStatus(*req.Status)
		if !st.IsValid() {
			return nil, apierrors.New(400, "invalid status value")
		}
		filters.Status = &st
	}

	if req.PipelineStage != nil {
		stage := models.PipelineStage(*req.PipelineStage)
		if !stage.IsValid() {
			return nil, apierrors.New(400, "invalid pipeline_stage value")
		}
		filters.PipelineStage = &stage
	}

	if req.CaseType != nil {
		ct := models.CaseType(*req.CaseType)
		if !ct.IsValid() {
			return nil, apierrors.New(400, "invalid case_type value")
		}
		filters.CaseType = &ct
	}

	cases, err := s.caseRepo.List(filters)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}

	result := make([]dto.CaseResponse, len(cases))
	for i, c := range cases {
		result[i] = dto.ToCaseResponse(c)
	}
	return result, nil
}

func (s *caseService) GetByID(id string) (*dto.CaseResponse, error) {
	if _, err := uuid.Parse(id); err != nil {
		return nil, apierrors.ErrNotFound
	}

	c, err := s.caseRepo.FindByID(id)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	if c == nil {
		return nil, apierrors.ErrNotFound
	}

	resp := dto.ToCaseResponse(*c)
	return &resp, nil
}

func (s *caseService) CreateEvent(req dto.CreateCaseEventRequest) (*dto.CaseEventResponse, error) {
	mailType := models.MailType(req.MailType)
	if !mailType.IsValid() {
		return nil, apierrors.New(400, "invalid mail_type value")
	}

	if req.Confidence < 0 || req.Confidence > 1 {
		return nil, apierrors.New(400, "confidence must be between 0 and 1")
	}

	exists, err := s.caseRepo.EventExistsByMailID(req.MailID)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	if exists {
		return nil, apierrors.New(409, "mail_id already registered")
	}

	provider := req.MailProvider
	if provider == "" {
		provider = "gmail"
	}

	event := &models.CaseEvent{
		MailID:         req.MailID,
		MailProvider:   provider,
		Subject:        req.Subject,
		MailType:       mailType,
		Confidence:     req.Confidence,
		Reasoning:      req.Reasoning,
		RawClaimNumber: req.RawClaimNumber,
		RawPolicy:      req.RawPolicy,
		RawCaseNumber:  req.RawCaseNumber,
		RawCaratula:    req.RawCaratula,
		ReceivedAt:     req.ReceivedAt,
	}

	if err := s.caseRepo.CreateEvent(event); err != nil {
		return nil, apierrors.ErrInternalServer
	}

	resp := dto.ToCaseEventResponse(*event)
	return &resp, nil
}
