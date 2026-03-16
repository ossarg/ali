package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AgreementType distinguishes whether the agreement was reached in mediation or litigation.
type AgreementType string

const (
	AgreementTypeMediacion AgreementType = "mediacion"
	AgreementTypeJuicio    AgreementType = "juicio"
)

// AgreementExtractionStatus tracks the automated extraction lifecycle.
type AgreementExtractionStatus string

const (
	ExtractionPending   AgreementExtractionStatus = "pending"
	ExtractionCompleted AgreementExtractionStatus = "completed"
	ExtractionFailed    AgreementExtractionStatus = "failed"
)

// Agreement represents a payment agreement associated with a case event of type acuerdo.
// A single case/siniestro may have multiple agreements (lawyer, expert, insured, etc.).
type Agreement struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`

	// Links
	CaseEventID uuid.UUID  `gorm:"type:uuid;not null"                        json:"case_event_id"`
	CaseID      *uuid.UUID `gorm:"type:uuid"                                 json:"case_id"`

	// Core fields
	AgreementType AgreementType `gorm:"type:agreement_type"  json:"agreement_type"`
	ClaimNumber   string        `gorm:"type:text"            json:"claim_number"`
	Producer      string        `gorm:"type:text"            json:"producer"`
	Beneficiary   string        `gorm:"type:text"            json:"beneficiary"`
	Concept       string        `gorm:"type:text"            json:"concept"`
	InvoiceNumber string        `gorm:"type:text"            json:"invoice_number"`
	Amount        *float64      `gorm:"type:numeric(14,2)"   json:"amount"`
	DueDate       *time.Time    `gorm:"type:date"            json:"due_date"`

	// Extraction metadata
	ExtractionStatus AgreementExtractionStatus `gorm:"type:agreement_extraction_status;not null;default:pending" json:"extraction_status"`
	ExtractionError  string                    `gorm:"type:text"                                                 json:"extraction_error,omitempty"`
	ExtractionRaw    JSON                      `gorm:"type:jsonb;default:'{}'"                                   json:"extraction_raw,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
