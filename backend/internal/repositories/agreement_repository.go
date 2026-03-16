package repositories

import (
	"github.com/google/uuid"
	"github.com/ossarg/ali/backend/internal/models"
	"gorm.io/gorm"
)

type AgreementRepository interface {
	Create(a *models.Agreement) error
	FindByID(id string) (*models.Agreement, error)
	ListAll(page, pageSize int) ([]models.Agreement, int64, error)
	ListByCaseID(caseID string) ([]models.Agreement, error)
	ListByCaseEventID(caseEventID string) ([]models.Agreement, error)
	Update(a *models.Agreement) error
	Delete(id string) error
}

type agreementRepository struct {
	db *gorm.DB
}

func NewAgreementRepository(db *gorm.DB) AgreementRepository {
	return &agreementRepository{db: db}
}

func (r *agreementRepository) Create(a *models.Agreement) error {
	return r.db.Create(a).Error
}

func (r *agreementRepository) FindByID(id string) (*models.Agreement, error) {
	var a models.Agreement
	err := r.db.Where("id = ?", id).First(&a).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &a, err
}

func (r *agreementRepository) ListAll(page, pageSize int) ([]models.Agreement, int64, error) {
	var agreements []models.Agreement
	var total int64
	offset := (page - 1) * pageSize
	r.db.Model(&models.Agreement{}).Count(&total)
	err := r.db.Order("due_date ASC NULLS LAST, created_at DESC").
		Offset(offset).Limit(pageSize).
		Find(&agreements).Error
	return agreements, total, err
}

func (r *agreementRepository) ListByCaseID(caseID string) ([]models.Agreement, error) {
	var agreements []models.Agreement
	err := r.db.Where("case_id = ?", caseID).
		Order("due_date ASC NULLS LAST").
		Find(&agreements).Error
	return agreements, err
}

func (r *agreementRepository) ListByCaseEventID(caseEventID string) ([]models.Agreement, error) {
	var agreements []models.Agreement
	err := r.db.Where("case_event_id = ?", caseEventID).
		Order("created_at DESC").
		Find(&agreements).Error
	return agreements, err
}

func (r *agreementRepository) Update(a *models.Agreement) error {
	return r.db.Save(a).Error
}

func (r *agreementRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Agreement{}).Error
}

// UpdateExtractionResult updates extraction fields after agent processing.
func UpdateExtractionResult(db *gorm.DB, id uuid.UUID, status models.AgreementExtractionStatus, errMsg string, raw models.JSON) error {
	updates := map[string]interface{}{
		"extraction_status": status,
		"extraction_error":  errMsg,
		"extraction_raw":    raw,
	}
	return db.Model(&models.Agreement{}).Where("id = ?", id).Updates(updates).Error
}
