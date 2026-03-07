package models

import (
	"time"

	"github.com/google/uuid"
)

// ClaimPayment represents a single payment record for a claim stage.
type ClaimPayment struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	StageID     uuid.UUID `gorm:"type:uuid;not null;index"                       json:"stage_id"`
	ClaimID     uuid.UUID `gorm:"type:uuid;not null;index"                       json:"claim_id"`
	Amount      float64   `gorm:"type:numeric(15,2);not null;default:0"          json:"amount"`
	PaymentDate time.Time `gorm:"not null"                                       json:"payment_date"`
	CreatedAt   time.Time `                                                      json:"created_at"`
}
