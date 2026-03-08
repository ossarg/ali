package services

import (
	"time"

	"github.com/google/uuid"
	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/models"
	"github.com/ossarg/ali/backend/internal/repositories"
)

type CaseService interface {
	List(req dto.ListCasesRequest) ([]dto.CaseResponse, error)
	ListPaginated(req dto.ListCasesRequest, page, limit int) (*dto.PaginatedCases, error)
	GetByID(id string) (*dto.CaseResponse, error)
	CreateEvent(req dto.CreateCaseEventRequest) (*dto.CaseEventResponse, error)
	ListPendingEvents() ([]dto.CaseEventResponse, error)
	ListApprovedEvents() ([]dto.CaseEventResponse, error)
	ListApprovedEventsPaginated(page, limit int) (*dto.PaginatedCaseEvents, error)
	GetEventMetrics() (*dto.CaseEventMetrics, error)
	ListEventsByCaseID(caseID string) ([]dto.CaseEventResponse, error)
	ReviewEvent(id string, reviewerID string, req dto.ReviewCaseEventRequest, claimSvc ClaimService) (*dto.CaseEventResponse, error)
	UpdateCaseEvent(id string, req dto.UpdateCaseEventRequest) (*dto.CaseEventResponse, error)
	GetEvent(id string) (*dto.CaseEventResponse, error)
	DeleteCaseEvent(id string) error
}

type caseService struct {
	caseRepo repositories.CaseRepository
	userRepo repositories.UserRepository
}

func NewCaseService(caseRepo repositories.CaseRepository, userRepo repositories.UserRepository) CaseService {
	return &caseService{caseRepo: caseRepo, userRepo: userRepo}
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

func (s *caseService) ListPaginated(req dto.ListCasesRequest, page, limit int) (*dto.PaginatedCases, error) {
	filters := repositories.CaseFilters{}
	if req.Status != nil {
		st := models.CaseStatus(*req.Status)
		filters.Status = &st
	}
	if req.PipelineStage != nil {
		stage := models.PipelineStage(*req.PipelineStage)
		filters.PipelineStage = &stage
	}
	if req.CaseType != nil {
		ct := models.CaseType(*req.CaseType)
		filters.CaseType = &ct
	}

	pp := dto.PageParams{Page: page, Limit: limit}
	cases, total, err := s.caseRepo.ListPaginated(filters, pp.Offset(), limit)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}

	data := make([]dto.CaseResponse, len(cases))
	for i, c := range cases {
		data[i] = dto.ToCaseResponse(c)
	}
	return &dto.PaginatedCases{Data: data, Total: total, Page: page, Limit: limit}, nil
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
		Title:          req.Title,
		Description:    req.Description,
		BodyClean:      req.BodyClean,
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

func (s *caseService) ListPendingEvents() ([]dto.CaseEventResponse, error) {
	events, err := s.caseRepo.ListPendingEvents()
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}

	// Batch-load case title+caratula for all unique case_ids — no N+1
	caseMap := map[string][2]string{} // case_id → [title, caratula]
	for _, e := range events {
		if e.CaseID != nil {
			caseMap[e.CaseID.String()] = [2]string{}
		}
	}
	for cid := range caseMap {
		if c, err := s.caseRepo.FindByID(cid); err == nil && c != nil {
			caseMap[cid] = [2]string{c.Title, c.Caratula}
		}
	}

	result := make([]dto.CaseEventResponse, len(events))
	for i, e := range events {
		r := dto.ToCaseEventResponse(e)
		if e.CaseID != nil {
			info := caseMap[e.CaseID.String()]
			r.CaseTitle    = info[0]
			r.CaseCaratula = info[1]
		}
		result[i] = r
	}
	return result, nil
}

func (s *caseService) ListApprovedEvents() ([]dto.CaseEventResponse, error) {
	events, err := s.caseRepo.ListApprovedEvents()
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	result := make([]dto.CaseEventResponse, len(events))
	for i, e := range events {
		result[i] = dto.ToCaseEventResponse(e)
	}
	return result, nil
}

func (s *caseService) ListApprovedEventsPaginated(page, limit int) (*dto.PaginatedCaseEvents, error) {
	pp := dto.PageParams{Page: page, Limit: limit}
	events, total, err := s.caseRepo.ListApprovedEventsPaginated(pp.Offset(), limit)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	data := make([]dto.CaseEventResponse, len(events))
	for i, e := range events {
		data[i] = dto.ToCaseEventResponse(e)
	}
	return &dto.PaginatedCaseEvents{Data: data, Total: total, Page: page, Limit: limit}, nil
}

func (s *caseService) GetEventMetrics() (*dto.CaseEventMetrics, error) {
	total, approved, pending, processed, lastEventAt, err := s.caseRepo.GetEventMetrics()
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	return &dto.CaseEventMetrics{
		Total:       total,
		Approved:    approved,
		Pending:     pending,
		Processed:   processed,
		LastEventAt: lastEventAt,
	}, nil
}


func (s *caseService) ListEventsByCaseID(caseID string) ([]dto.CaseEventResponse, error) {
	if _, err := uuid.Parse(caseID); err != nil {
		return nil, apierrors.ErrNotFound
	}
	events, err := s.caseRepo.ListApprovedEventsByCaseID(caseID)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	result := make([]dto.CaseEventResponse, len(events))
	for i, e := range events {
		resp := dto.ToCaseEventResponse(e)
		// Populate reviewer name
		if e.ReviewedBy != nil {
			if user, err := s.userRepo.FindByID(e.ReviewedBy.String()); err == nil {
				resp.ReviewedByName = user.FirstName + " " + user.LastName
			}
		}
		result[i] = resp
	}
	return result, nil
}

func (s *caseService) ReviewEvent(id string, reviewerID string, req dto.ReviewCaseEventRequest, claimSvc ClaimService) (*dto.CaseEventResponse, error) {
	if _, err := uuid.Parse(id); err != nil {
		return nil, apierrors.ErrNotFound
	}
	reviewerUUID, err := uuid.Parse(reviewerID)
	if err != nil {
		return nil, apierrors.New(400, "invalid reviewer id")
	}

	// claim_number is required — without it the SISE resolution will fail
	if req.ClaimNumber == "" {
		return nil, apierrors.New(400, "claim_number is required to approve an event")
	}

	event, err := s.caseRepo.FindEventByID(id)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	if event == nil {
		return nil, apierrors.ErrNotFound
	}

	// If mail_type is being changed, validate and record original
	if req.MailType != nil {
		newType := models.MailType(*req.MailType)
		if !newType.IsValid() {
			return nil, apierrors.New(400, "invalid mail_type value")
		}
		if req.ReviewComment == "" {
			return nil, apierrors.New(400, "review_comment is required when changing mail_type")
		}
		// Save original before overwriting
		original := event.MailType
		event.OriginalMailType = &original
		event.MailType = newType
	}

	approved := true
	now := time.Now()
	event.Approved = &approved
	event.ReviewedBy = &reviewerUUID
	event.ReviewedAt = &now
	event.ReviewComment = req.ReviewComment

	// Always overwrite raw_claim_number with what the reviewer confirmed/corrected
	event.RawClaimNumber = req.ClaimNumber

	if req.RawPolicy != nil {
		event.RawPolicy = *req.RawPolicy
	}
	if req.RawCaseNumber != nil {
		event.RawCaseNumber = *req.RawCaseNumber
	}
	if req.RawCaratula != nil {
		event.RawCaratula = *req.RawCaratula
	}

	if err := s.caseRepo.UpdateEvent(event); err != nil {
		return nil, apierrors.ErrInternalServer
	}

	// Denormalize caratula into the case if this event has one and the case doesn't yet
	if event.RawCaratula != "" && event.CaseID != nil {
		if c, err := s.caseRepo.FindByID(event.CaseID.String()); err == nil && c != nil && c.Caratula == "" {
			c.Caratula = event.RawCaratula
			_ = s.caseRepo.Update(c)
		}
	}

	// Trigger async SISE resolution if raw_claim_number is available
	if claimSvc != nil && event.RawClaimNumber != "" {
		claimSvc.ResolveEventAsync(event.ID.String())
	}

	resp := dto.ToCaseEventResponse(*event)
	return &resp, nil
}

func (s *caseService) UpdateCaseEvent(id string, req dto.UpdateCaseEventRequest) (*dto.CaseEventResponse, error) {
	event, err := s.caseRepo.FindEventByID(id)
	if err != nil || event == nil {
		return nil, apierrors.ErrNotFound
	}
	if event.DeletedAt != nil {
		return nil, apierrors.ErrNotFound
	}

	if req.MailType != nil {
		event.MailType = models.MailType(*req.MailType)
	}
	if req.Title != "" {
		event.Title = req.Title
	}
	if req.Description != "" {
		event.Description = req.Description
	}
	if req.BodyClean != "" {
		event.BodyClean = req.BodyClean
	}
	if req.ReceivedAt != nil {
		event.ReceivedAt = *req.ReceivedAt
	}

	if err := s.caseRepo.UpdateEvent(event); err != nil {
		return nil, apierrors.ErrInternalServer
	}
	resp := dto.ToCaseEventResponse(*event)
	return &resp, nil
}

func (s *caseService) GetEvent(id string) (*dto.CaseEventResponse, error) {
	event, err := s.caseRepo.FindEventByID(id)
	if err != nil || event == nil {
		return nil, apierrors.ErrNotFound
	}
	resp := dto.ToCaseEventResponse(*event)
	if event.ReviewedBy != nil {
		if user, err := s.userRepo.FindByID(event.ReviewedBy.String()); err == nil && user != nil {
			resp.ReviewedByName = user.FirstName + " " + user.LastName
		}
	}
	return &resp, nil
}

func (s *caseService) DeleteCaseEvent(id string) error {
	return s.caseRepo.DeleteEvent(id)
}
