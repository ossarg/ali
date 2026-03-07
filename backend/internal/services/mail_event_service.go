package services

import (
	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/models"
	"github.com/ossarg/ali/backend/internal/repositories"
)

type MailEventService interface {
	Create(req dto.CreateMailEventRequest) (*dto.MailEventResponse, error)
}

type mailEventService struct {
	repo repositories.MailEventRepository
}

func NewMailEventService(repo repositories.MailEventRepository) MailEventService {
	return &mailEventService{repo: repo}
}

func (s *mailEventService) Create(req dto.CreateMailEventRequest) (*dto.MailEventResponse, error) {
	mailType := models.MailType(req.MailType)
	if !mailType.IsValid() {
		return nil, apierrors.New(400, "invalid mail_type value")
	}

	if req.Confidence < 0 || req.Confidence > 1 {
		return nil, apierrors.New(400, "confidence must be between 0 and 1")
	}

	exists, err := s.repo.ExistsByMailID(req.MailID)
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

	event := &models.MailEvent{
		MailID:       req.MailID,
		MailProvider: provider,
		Subject:      req.Subject,
		MailType:     mailType,
		Confidence:   req.Confidence,
		Reasoning:    req.Reasoning,
		ReceivedAt:   req.ReceivedAt,
	}

	if err := s.repo.Create(event); err != nil {
		return nil, apierrors.ErrInternalServer
	}

	resp := dto.ToMailEventResponse(*event)
	return &resp, nil
}
