package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Email        string         `gorm:"uniqueIndex;not null"                           json:"email"`
	Password     string         `gorm:"not null"                                       json:"-"`
	FirstName    string         `gorm:"not null"                                       json:"first_name"`
	LastName     string         `gorm:"not null"                                       json:"last_name"`
	Role         string         `gorm:"not null"                                       json:"role"`
	Capabilities []string       `gorm:"type:text[]"                                    json:"capabilities"`
	IsActive     bool           `gorm:"default:true"                                   json:"is_active"`
	CreatedAt    time.Time      `                                                      json:"created_at"`
	UpdatedAt    time.Time      `                                                      json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index"                                          json:"-"`
}
