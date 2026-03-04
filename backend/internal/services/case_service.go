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
