package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AgreementType distinguishes whether the agreement was reached in mediation or litigation.
// Stored as SMALLINT: 1=mediacion, 2=juicio
type AgreementType int16

const (
	AgreementTypeMediacion AgreementType = 1
	AgreementTypeJuicio    AgreementType = 2
)

func (t AgreementType) String() string {
	switch t {
	case AgreementTypeMediacion:
		return "mediacion"
	case AgreementTypeJuicio:
		return "juicio"
	default:
		return "unknown"
	}
}

// AgreementExtractionStatus tracks the automated extraction lifecycle.
// Stored as SMALLINT: 1=pending, 2=completed, 3=failed
type AgreementExtractionStatus int16

const (
	ExtractionPending   AgreementExtractionStatus = 1
	ExtractionCompleted AgreementExtractionStatus = 2
	ExtractionFailed    AgreementExtractionStatus = 3
)

func (s AgreementExtractionStatus) String() string {
	switch s {
	case ExtractionPending:
		return "pending"
	case ExtractionCompleted:
		return "completed"
	case ExtractionFailed:
		return "failed"
	default:
		return "unknown"
	}
}

// Agreement represents a payment agreement associated with a case event of type acuerdo.
// A single case/siniestro may have multiple agreements (lawyer, expert, insured, etc.).
type Agreement struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`

	// Links
	CaseEventID uuid.UUID  `gorm:"type:uuid;not null"  json:"case_event_id"`
	CaseID      *uuid.UUID `gorm:"type:uuid"           json:"case_id"`

	// Core fields
	AgreementType AgreementType `gorm:"type:smallint"      json:"agreement_type"`
	ClaimNumber   string        `gorm:"type:text"          json:"claim_number"`
	Producer      string        `gorm:"type:text"          json:"producer"`
	Beneficiary   string        `gorm:"type:text"          json:"beneficiary"`
	Concept       string        `gorm:"type:text"          json:"concept"`
	InvoiceNumber string        `gorm:"type:text"          json:"invoice_number"`
	Amount        *float64      `gorm:"type:numeric(14,2)" json:"amount"`
	DueDate       *time.Time    `gorm:"type:date"          json:"due_date"`

	// Extraction metadata
	ExtractionStatus AgreementExtractionStatus `gorm:"type:smallint;not null;default:1" json:"extraction_status"`
	ExtractionError  string                    `gorm:"type:text"                        json:"extraction_error,omitempty"`
	ExtractionRaw    JSON                      `gorm:"type:jsonb;default:'{}'"          json:"extraction_raw,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
