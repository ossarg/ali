package repositories

import (
	"errors"

	"github.com/ossarg/ali/backend/internal/models"
	"gorm.io/gorm"
)

type ClaimRepository interface {
	Create(c *models.Claim) error
	FindByID(id string) (*models.Claim, error)
	FindBySISEClaimID(siseClaimID int64) (*models.Claim, error)
	ExistsBySISEClaimID(siseClaimID int64) (bool, error)
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

func (r *claimRepository) FindByID(id string) (*models.Claim, error) {
	var c models.Claim
	err := r.db.Where("id = ?", id).First(&c).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &c, err
}

func (r *claimRepository) FindBySISEClaimID(siseClaimID int64) (*models.Claim, error) {
	var c models.Claim
	err := r.db.Where("sise_claim_id = ?", siseClaimID).First(&c).Error
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
