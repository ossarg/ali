package repositories

import (
	"errors"

	"github.com/ossarg/ali/backend/internal/models"
	"gorm.io/gorm"
)

type ClaimRepository interface {
	Create(c *models.Claim) error
	List() ([]models.Claim, error)
	ListPaginated(offset, limit int) ([]models.Claim, int64, error)
	FindByID(id string) (*models.Claim, error)
	FindBySISEClaimID(siseClaimID int64) (*models.Claim, error)
	ExistsBySISEClaimID(siseClaimID int64) (bool, error)
	UpsertStage(stage *models.ClaimStage) error
	CreatePayment(payment *models.ClaimPayment) error
	UpdateCurrentStatus(claimID string, status string) error
	GetMetrics() (total, open, mediation, lawsuit int64, err error)
}

type claimRepository struct {
	db *gorm.DB
}

func NewClaimRepository(db *gorm.DB) ClaimRepository {
	return &claimRepository{db: db}
}

func (r *claimRepository) Create(c *models.Claim) error {
	return r.db.Create(c).Error
}

func (r *claimRepository) List() ([]models.Claim, error) {
	var claims []models.Claim
	err := r.db.Order("created_at DESC").Find(&claims).Error
	return claims, err
}

func (r *claimRepository) ListPaginated(offset, limit int) ([]models.Claim, int64, error) {
	var claims []models.Claim
	var total int64
	if err := r.db.Model(&models.Claim{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	err := r.db.Order("created_at DESC").Offset(offset).Limit(limit).Find(&claims).Error
	return claims, total, err
}

func (r *claimRepository) FindByID(id string) (*models.Claim, error) {
	var c models.Claim
	err := r.db.
		Preload("Stages.Payments").
		Where("id = ?", id).
		First(&c).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &c, err
}

func (r *claimRepository) FindBySISEClaimID(siseClaimID int64) (*models.Claim, error) {
	var c models.Claim
	err := r.db.
		Preload("Stages.Payments").
		Where("sise_claim_id = ?", siseClaimID).
		First(&c).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &c, err
}

func (r *claimRepository) ExistsBySISEClaimID(siseClaimID int64) (bool, error) {
	var count int64
	err := r.db.Model(&models.Claim{}).Where("sise_claim_id = ?", siseClaimID).Count(&count).Error
	return count > 0, err
}

// UpsertStage inserts or updates a claim stage by (claim_id, sise_stage_number).
func (r *claimRepository) UpsertStage(stage *models.ClaimStage) error {
	return r.db.
		Where(models.ClaimStage{ClaimID: stage.ClaimID, SISEStageNumber: stage.SISEStageNumber}).
		Assign(models.ClaimStage{Status: stage.Status, SISEStatusID: stage.SISEStatusID}).
		FirstOrCreate(stage).Error
}

// CreatePayment upserts a payment row by (stage_id, amount, payment_date) — safe on re-sync.
func (r *claimRepository) CreatePayment(payment *models.ClaimPayment) error {
	return r.db.
		Where(models.ClaimPayment{
			StageID:     payment.StageID,
			Amount:      payment.Amount,
			PaymentDate: payment.PaymentDate,
		}).
		FirstOrCreate(payment).Error
}

func (r *claimRepository) GetMetrics() (total, open, mediation, lawsuit int64, err error) {
	type row struct {
		Status string
		Count  int64
	}
	var rows []row
	err = r.db.Model(&models.Claim{}).
		Select("current_status as status, count(*) as count").
		Group("current_status").
		Scan(&rows).Error
	if err != nil {
		return
	}
	for _, rw := range rows {
		total += rw.Count
		switch rw.Status {
		case "ABIERTO":
			open = rw.Count
		case "MEDIACION":
			mediation = rw.Count
		case "JUICIO":
			lawsuit = rw.Count
		}
	}
	return
}

// UpdateCurrentStatus updates the denormalized current_status on the claims header.
func (r *claimRepository) UpdateCurrentStatus(claimID string, status string) error {
	return r.db.Model(&models.Claim{}).
		Where("id = ?", claimID).
		Update("current_status", status).Error
}
