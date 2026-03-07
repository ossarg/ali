package models

import (
	"time"

	"github.com/google/uuid"
)

// ClaimStage represents a SISE subreclamo — one row per stage of a claim's lifecycle.
type ClaimStage struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ClaimID          uuid.UUID `gorm:"type:uuid;not null;index"                       json:"claim_id"`
	SISEStageNumber  int    `gorm:"not null"                  json:"sise_stage_number"` // nro_subreclamo
	SISEStatusID     int16  `gorm:"not null;default:0"        json:"sise_status_id"`    // SISE status catalog id
	Status           string `gorm:"type:varchar(50);not null" json:"status"`
	CreatedAt        time.Time `                                                      json:"created_at"`
	UpdatedAt        time.Time `                                                      json:"updated_at"`

	Payments []ClaimPayment `gorm:"foreignKey:StageID" json:"payments,omitempty"`
}
