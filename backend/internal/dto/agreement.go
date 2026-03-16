package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/ossarg/ali/backend/internal/models"
)

// AgreementStatus is computed on-the-fly from DueDate.
type AgreementStatus string

const (
	AgreementStatusVigente  AgreementStatus = "vigente"
	AgreementStatusProximo  AgreementStatus = "proximo"  // due within 7 days
	AgreementStatusVencido  AgreementStatus = "vencido"
	AgreementStatusSinFecha AgreementStatus = "sin_fecha"
)

// AgreementResponse is the public representation of an agreement.
type AgreementResponse struct {
	ID                  uuid.UUID                         `json:"id"`
	CaseEventID         uuid.UUID                         `json:"case_event_id"`
	CaseID              *uuid.UUID                        `json:"case_id"`
	AgreementType       models.AgreementType              `json:"agreement_type"`
	AgreementTypeLabel  string                            `json:"agreement_type_label"`
	ClaimNumber         string                            `json:"claim_number"`
	Producer            string                            `json:"producer"`
	Beneficiary         string                            `json:"beneficiary"`
	Concept             string                            `json:"concept"`
	InvoiceNumber       string                            `json:"invoice_number"`
	Amount              *float64                          `json:"amount"`
	DueDate             *time.Time                        `json:"due_date"`
	Status              AgreementStatus                   `json:"status"`
	ExtractionStatus    models.AgreementExtractionStatus  `json:"extraction_status"`
	ExtractionStatusLabel string                          `json:"extraction_status_label"`
	CreatedAt           time.Time                         `json:"created_at"`
}

// ToAgreementResponse converts a model to its DTO, computing status on-the-fly.
func ToAgreementResponse(a models.Agreement) AgreementResponse {
	status := computeAgreementStatus(a.DueDate)
	return AgreementResponse{
		ID:                    a.ID,
		CaseEventID:           a.CaseEventID,
		CaseID:                a.CaseID,
		AgreementType:         a.AgreementType,
		AgreementTypeLabel:    a.AgreementType.String(),
		ClaimNumber:           a.ClaimNumber,
		Producer:              a.Producer,
		Beneficiary:           a.Beneficiary,
		Concept:               a.Concept,
		InvoiceNumber:         a.InvoiceNumber,
		Amount:                a.Amount,
		DueDate:               a.DueDate,
		Status:                status,
		ExtractionStatus:      a.ExtractionStatus,
		ExtractionStatusLabel: a.ExtractionStatus.String(),
		CreatedAt:             a.CreatedAt,
	}
}

func computeAgreementStatus(due *time.Time) AgreementStatus {
	if due == nil {
		return AgreementStatusSinFecha
	}
	now := time.Now().Truncate(24 * time.Hour)
	d := due.Truncate(24 * time.Hour)
	if d.Before(now) {
		return AgreementStatusVencido
	}
	if d.Before(now.Add(7 * 24 * time.Hour)) {
		return AgreementStatusProximo
	}
	return AgreementStatusVigente
}

// CreateAgreementRequest is used to manually create or update an agreement.
type CreateAgreementRequest struct {
	CaseEventID   uuid.UUID            `json:"case_event_id" validate:"required"`
	AgreementType models.AgreementType `json:"agreement_type"`
	ClaimNumber   string               `json:"claim_number"`
	Producer      string               `json:"producer"`
	Beneficiary   string               `json:"beneficiary"`
	Concept       string               `json:"concept"`
	InvoiceNumber string               `json:"invoice_number"`
	Amount        *float64             `json:"amount"`
	DueDate       *time.Time           `json:"due_date"`
}

// UpdateAgreementRequest allows patching agreement fields after manual review.
type UpdateAgreementRequest struct {
	AgreementType *models.AgreementType `json:"agreement_type"`
	ClaimNumber   *string               `json:"claim_number"`
	Producer      *string               `json:"producer"`
	Beneficiary   *string               `json:"beneficiary"`
	Concept       *string               `json:"concept"`
	InvoiceNumber *string               `json:"invoice_number"`
	Amount        *float64              `json:"amount"`
	DueDate       *time.Time            `json:"due_date"`
}
