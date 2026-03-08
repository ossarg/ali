package repositories

import (
	"errors"
	"time"

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
	ListPaginated(filters CaseFilters, offset, limit int) ([]models.Case, int64, error)
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
	ListApprovedEvents() ([]models.CaseEvent, error)
	ListApprovedEventsPaginated(offset, limit int) ([]models.CaseEvent, int64, error)
	ListUnresolvedEvents() ([]models.CaseEvent, error)
	ListPendingResolutionEvents() ([]models.CaseEvent, error)
	GetEventMetrics() (total, approved, pending, processed int64, lastEventAt *time.Time, err error)

	// Cases
	GetByID(id string) (*models.Case, error)

	// ListEventsByCaseID returns all case events linked to a case, ordered by received_at DESC.
	ListEventsByCaseID(caseID string) ([]models.CaseEvent, error)
	// FindByClaim returns the case linked to a given claim UUID, or nil if none exists.
	FindByClaim(claimID string) (*models.Case, error)
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

func (r *caseRepository) ListPaginated(filters CaseFilters, offset, limit int) ([]models.Case, int64, error) {
	var cases []models.Case
	var total int64
	q := r.db.Model(&models.Case{}).Where("cases.deleted_at IS NULL")

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

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Preload("DefenseFirm").Preload("PlaintiffFirm").Preload("AssignedUser").
		Order("cases.created_at DESC").
		Offset(offset).Limit(limit).
		Find(&cases).Error
	return cases, total, err
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

func (r *caseRepository) ListApprovedEvents() ([]models.CaseEvent, error) {
	var events []models.CaseEvent
	err := r.db.Where("approved = true").
		Order("reviewed_at DESC").
		Find(&events).Error
	return events, err
}

func (r *caseRepository) ListApprovedEventsPaginated(offset, limit int) ([]models.CaseEvent, int64, error) {
	var events []models.CaseEvent
	var total int64
	q := r.db.Model(&models.CaseEvent{}).Where("approved = true")
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	err := q.Order("reviewed_at DESC").Offset(offset).Limit(limit).Find(&events).Error
	return events, total, err
}

func (r *caseRepository) ListUnresolvedEvents() ([]models.CaseEvent, error) {
	var events []models.CaseEvent
	err := r.db.Where("resolution_status = ?", models.ResolutionUnresolved).
		Order("created_at DESC").
		Find(&events).Error
	return events, err
}

// ListPendingResolutionEvents returns approved events that have a raw_claim_number
// but haven't been resolved yet (pending or unresolved).
func (r *caseRepository) ListPendingResolutionEvents() ([]models.CaseEvent, error) {
	var events []models.CaseEvent
	err := r.db.Where("approved = true AND raw_claim_number != '' AND resolution_status != ?", models.ResolutionResolved).
		Order("created_at ASC").
		Find(&events).Error
	return events, err
}


func (r *caseRepository) GetByID(id string) (*models.Case, error) {
	var c models.Case
	err := r.db.Where("id = ?", id).First(&c).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &c, err
}

func (r *caseRepository) FindByClaim(claimID string) (*models.Case, error) {
	var c models.Case
	err := r.db.Where("claim_id = ? AND deleted_at IS NULL", claimID).First(&c).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &c, err
}

func (r *caseRepository) GetEventMetrics() (total, approved, pending, processed int64, lastEventAt *time.Time, err error) {
	r.db.Model(&models.CaseEvent{}).Count(&total)
	r.db.Model(&models.CaseEvent{}).Where("approved = true").Count(&approved)
	r.db.Model(&models.CaseEvent{}).Where("approved = false OR approved IS NULL").Count(&pending)
	r.db.Model(&models.CaseEvent{}).Where("processed = true").Count(&processed)

	var last models.CaseEvent
	if e := r.db.Order("created_at DESC").First(&last).Error; e == nil {
		lastEventAt = &last.CreatedAt
	}
	return
}

func (r *caseRepository) ListEventsByCaseID(caseID string) ([]models.CaseEvent, error) {
	var events []models.CaseEvent
	err := r.db.Where("case_id = ?", caseID).
		Order("received_at DESC").
		Find(&events).Error
	return events, err
}
