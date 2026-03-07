package repositories

import (
	"errors"

	"github.com/ossarg/ali/backend/internal/models"
	"gorm.io/gorm"
)

type MailEventRepository interface {
	Create(e *models.MailEvent) error
	ExistsByMailID(mailID string) (bool, error)
}

type mailEventRepository struct {
	db *gorm.DB
}

func NewMailEventRepository(db *gorm.DB) MailEventRepository {
	return &mailEventRepository{db: db}
}

func (r *mailEventRepository) Create(e *models.MailEvent) error {
	return r.db.Create(e).Error
}

func (r *mailEventRepository) ExistsByMailID(mailID string) (bool, error) {
	var count int64
	err := r.db.Model(&models.MailEvent{}).Where("mail_id = ?", mailID).Count(&count).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return false, nil
	}
	return count > 0, err
}
