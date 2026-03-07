package repositories

import (
	"errors"

	"github.com/google/uuid"
	"github.com/ossarg/ali/backend/internal/models"
	"gorm.io/gorm"
)

type CaseFilters struct {
	Status        *models.CaseStatus
	PipelineStage *models.PipelineStage
	AssignedUserID *uuid.UUID
	CaseType      *models.CaseType
}

type CaseRepository interface {
	List(filters CaseFilters) ([]models.Case, error)
	FindByID(id string) (*models.Case, error)
	Create(c *models.Case) error
	Update(c *models.Case) error
	Delete(id string) error

	// Case events
	CreateEvent(e *models.CaseEvent) error
	EventExistsByMailID(mailID string) (bool, error)
	FindEventByID(id string) (*models.CaseEvent, error)
	UpdateEvent(e *models.CaseEvent) error
	ListPendingEvents() ([]models.CaseEvent, error)
}

type caseRepository struct {
	db *gorm.DB
}

func NewCaseRepository(db *gorm.DB) CaseRepository {
	return &caseRepository{db: db}
}

func (r *caseRepository) List(filters CaseFilters) ([]models.Case, error) {
	var cases []models.Case
	q := r.db.Where("cases.deleted_at IS NULL").
		Preload("DefenseFirm").
		Preload("PlaintiffFirm").
		Preload("AssignedUser")

	if filters.Status != nil {
		q = q.Where("cases.status = ?", *filters.Status)
	}
	if filters.PipelineStage != nil {
		q = q.Where("cases.pipeline_stage = ?", *filters.PipelineStage)
	}
	if filters.AssignedUserID != nil {
		q = q.Where("cases.assigned_user_id = ?", *filters.AssignedUserID)
	}
	if filters.CaseType != nil {
		q = q.Where("cases.case_type = ?", *filters.CaseType)
	}

	err := q.Order("cases.created_at DESC").Find(&cases).Error
	return cases, err
}

func (r *caseRepository) FindByID(id string) (*models.Case, error) {
	var c models.Case
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).
		Preload("DefenseFirm").
		Preload("PlaintiffFirm").
		Preload("AssignedUser").
		First(&c).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &c, err
}

func (r *caseRepository) Create(c *models.Case) error {
	return r.db.Create(c).Error
}

func (r *caseRepository) Update(c *models.Case) error {
	return r.db.Save(c).Error
}

func (r *caseRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Case{}).Error
}

func (r *caseRepository) CreateEvent(e *models.CaseEvent) error {
	return r.db.Create(e).Error
}

func (r *caseRepository) EventExistsByMailID(mailID string) (bool, error) {
	var count int64
	err := r.db.Model(&models.CaseEvent{}).Where("mail_id = ?", mailID).Count(&count).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return false, nil
	}
	return count > 0, err
}

func (r *caseRepository) FindEventByID(id string) (*models.CaseEvent, error) {
	var e models.CaseEvent
	err := r.db.Where("id = ?", id).First(&e).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &e, err
}

func (r *caseRepository) UpdateEvent(e *models.CaseEvent) error {
	return r.db.Save(e).Error
}

func (r *caseRepository) ListPendingEvents() ([]models.CaseEvent, error) {
	var events []models.CaseEvent
	err := r.db.Where("approved = false OR approved IS NULL").
		Order("received_at DESC").
		Find(&events).Error
	return events, err
}
