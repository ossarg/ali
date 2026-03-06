package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FirmType int16

const (
	FirmTypeDefense   FirmType = 1
	FirmTypePlaintiff FirmType = 2
	FirmTypeBoth      FirmType = 3
)

var firmTypeNames = map[FirmType]string{
	FirmTypeDefense:   "defense",
	FirmTypePlaintiff: "plaintiff",
	FirmTypeBoth:      "both",
}

func (f FirmType) String() string {
	if name, ok := firmTypeNames[f]; ok {
		return name
	}
	return "unknown"
}

func (f FirmType) IsValid() bool {
	_, ok := firmTypeNames[f]
	return ok
}

type Firm struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name      string         `gorm:"not null"                                       json:"name"`
	Address   string         `                                                      json:"address,omitempty"`
	Phone     string         `                                                      json:"phone,omitempty"`
	Email     string         `                                                      json:"email,omitempty"`
	Type      FirmType       `gorm:"not null;default:3"                             json:"type"`
	IsActive  bool           `gorm:"default:true"                                   json:"is_active"`
	CreatedAt time.Time      `                                                      json:"created_at"`
	UpdatedAt time.Time      `                                                      json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index"                                          json:"-"`
}
