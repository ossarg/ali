package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/ossarg/ali/backend/internal/models"
)

// CreateMailEventRequest — payload enviado por Rachel
type CreateMailEventRequest struct {
	MailID       string    `json:"mail_id"       validate:"required"`
	MailProvider string    `json:"mail_provider"`
	Subject      string    `json:"subject"`
	MailType     int16     `json:"mail_type"     validate:"required,min=1,max=7"`
	Confidence   float64   `json:"confidence"    validate:"required,min=0,max=1"`
	Reasoning    string    `json:"reasoning"`
	ReceivedAt   time.Time `json:"received_at"   validate:"required"`
}

// MailEventResponse — respuesta pública
type MailEventResponse struct {
	ID           uuid.UUID `json:"id"`
	MailID       string    `json:"mail_id"`
	MailProvider string    `json:"mail_provider"`
	Subject      string    `json:"subject,omitempty"`
	MailType     string    `json:"mail_type"`
	Confidence   float64   `json:"confidence"`
	Reasoning    string    `json:"reasoning,omitempty"`
	Processed    bool      `json:"processed"`
	ReceivedAt   time.Time `json:"received_at"`
	CreatedAt    time.Time `json:"created_at"`
}

func ToMailEventResponse(e models.MailEvent) MailEventResponse {
	return MailEventResponse{
		ID:           e.ID,
		MailID:       e.MailID,
		MailProvider: e.MailProvider,
		Subject:      e.Subject,
		MailType:     e.MailType.String(),
		Confidence:   e.Confidence,
		Reasoning:    e.Reasoning,
		Processed:    e.Processed,
		ReceivedAt:   e.ReceivedAt,
		CreatedAt:    e.CreatedAt,
	}
}
