package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/ossarg/ali/backend/internal/models"
)

// CreateCaseEventRequest — payload sent by Rachel after classifying an email
type CreateCaseEventRequest struct {
	MailID       string    `json:"mail_id"        validate:"required"`
	MailProvider string    `json:"mail_provider"`
	Subject      string    `json:"subject"`
	MailType     int16     `json:"mail_type"      validate:"required,min=1,max=7"`
	Confidence   float64   `json:"confidence"     validate:"required,min=0,max=1"`
	Reasoning    string    `json:"reasoning"`
	ReceivedAt   time.Time `json:"received_at"    validate:"required"`

	// Raw identifiers extracted from the mail (unnormalized)
	RawClaimNumber string `json:"raw_claim_number"`
	RawPolicy      string `json:"raw_policy"`
	RawCaseNumber  string `json:"raw_case_number"`
	RawCaratula    string `json:"raw_caratula"`
}

// CaseEventResponse — public representation
type CaseEventResponse struct {
	ID           uuid.UUID  `json:"id"`
	CaseID       *uuid.UUID `json:"case_id,omitempty"`
	MailID       string     `json:"mail_id"`
	MailProvider string     `json:"mail_provider"`
	Subject      string     `json:"subject,omitempty"`
	MailType     string     `json:"mail_type"`
	Confidence   float64    `json:"confidence"`
	Reasoning    string     `json:"reasoning,omitempty"`

	RawClaimNumber string `json:"raw_claim_number,omitempty"`
	RawPolicy      string `json:"raw_policy,omitempty"`
	RawCaseNumber  string `json:"raw_case_number,omitempty"`
	RawCaratula    string `json:"raw_caratula,omitempty"`

	Processed  bool      `json:"processed"`
	ReceivedAt time.Time `json:"received_at"`
	CreatedAt  time.Time `json:"created_at"`
}

func ToCaseEventResponse(e models.CaseEvent) CaseEventResponse {
	return CaseEventResponse{
		ID:             e.ID,
		CaseID:         e.CaseID,
		MailID:         e.MailID,
		MailProvider:   e.MailProvider,
		Subject:        e.Subject,
		MailType:       e.MailType.String(),
		Confidence:     e.Confidence,
		Reasoning:      e.Reasoning,
		RawClaimNumber: e.RawClaimNumber,
		RawPolicy:      e.RawPolicy,
		RawCaseNumber:  e.RawCaseNumber,
		RawCaratula:    e.RawCaratula,
		Processed:      e.Processed,
		ReceivedAt:     e.ReceivedAt,
		CreatedAt:      e.CreatedAt,
	}
}
