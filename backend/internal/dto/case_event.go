package dto

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/ossarg/ali/backend/internal/models"
)

// CaseEventMetrics — aggregated stats for the activity panel
// AttachmentMetaDTO is the public representation of a stored attachment.
type AttachmentMetaDTO struct {
	Name string `json:"name"`
	Key  string `json:"key"`
	Mime string `json:"mime"`
	Size int64  `json:"size"`
}

type CaseEventMetrics struct {
	Total       int64      `json:"total"`
	Approved    int64      `json:"approved"`
	Pending     int64      `json:"pending"`
	Processed   int64      `json:"processed"`
	LastEventAt *time.Time `json:"last_event_at"`
}

// ReviewCaseEventRequest — payload sent by a human reviewer
type ReviewCaseEventRequest struct {
	MailType      *int16  `json:"mail_type"`      // if nil, approves Rachel's classification as-is
	ReviewComment string  `json:"review_comment"` // required when changing mail_type

	// ClaimNumber is required to approve — without it the SISE resolution will always fail.
	ClaimNumber string `json:"claim_number"`

	// Corrected identifiers (optional)
	RawPolicy    *string `json:"raw_policy"`    // nro. póliza
	RawCaseNumber *string `json:"raw_case_number"` // nro. expediente
	RawCaratula   *string `json:"raw_caratula"`    // carátula
}

// CreateCaseEventRequest — payload sent by Rachel after classifying an email
type CreateCaseEventRequest struct {
	MailID       string    `json:"mail_id"        validate:"required"`
	MailProvider string    `json:"mail_provider"`
	Subject      string    `json:"subject"`
	MailType     int16     `json:"mail_type"      validate:"required,min=1,max=11"`
	Confidence   float64   `json:"confidence"     validate:"required,min=0,max=1"`
	Reasoning    string    `json:"reasoning"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	BodyClean    string    `json:"body_clean"`
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
	Reasoning       string     `json:"reasoning,omitempty"`
	Title           string     `json:"title,omitempty"`
	Description     string     `json:"description,omitempty"`
	BodyClean       string     `json:"body_clean,omitempty"`
	Attachments     []AttachmentMetaDTO `json:"attachments"`
	ReviewedByName  string     `json:"reviewed_by_name,omitempty"`
	CaseTitle       string     `json:"case_title,omitempty"`
	CaseCaratula    string     `json:"case_caratula,omitempty"`

	RawClaimNumber string `json:"raw_claim_number,omitempty"`
	RawPolicy      string `json:"raw_policy,omitempty"`
	RawCaseNumber  string `json:"raw_case_number,omitempty"`
	RawCaratula    string `json:"raw_caratula,omitempty"`

	Processed  bool      `json:"processed"`
	ReceivedAt time.Time `json:"received_at"`
	CreatedAt  time.Time `json:"created_at"`

	Approved         *bool      `json:"approved,omitempty"`
	OriginalMailType *string    `json:"original_mail_type,omitempty"`
	ReviewedBy       *string    `json:"reviewed_by,omitempty"`
	ReviewedAt       *time.Time `json:"reviewed_at,omitempty"`
	ReviewComment    string     `json:"review_comment,omitempty"`

	ResolutionStatus     string `json:"resolution_status"`
	ResolutionError      string `json:"resolution_error,omitempty"`
	ResolvedClaimID      string `json:"resolved_claim_id,omitempty"`
	CorrectedClaimNumber string `json:"corrected_claim_number,omitempty"`
	CorrectionComment    string `json:"correction_comment,omitempty"`
}

// RetryResolutionRequest — human corrects the nro_stro for a failed resolution
type RetryResolutionRequest struct {
	CorrectedClaimNumber string `json:"corrected_claim_number" validate:"required"`
	CorrectionComment    string `json:"correction_comment"`
}

// BatchResolveResponse — result of batch resolution
type BatchResolveResponse struct {
	Resolved int    `json:"resolved"`
	Errors   int    `json:"errors"`
	Message  string `json:"message"`
}

func ToCaseEventResponse(e models.CaseEvent) CaseEventResponse {
	resp := CaseEventResponse{
		ID:             e.ID,
		CaseID:         e.CaseID,
		MailID:         e.MailID,
		MailProvider:   e.MailProvider,
		Subject:        e.Subject,
		MailType:       e.MailType.String(),
		Confidence:     e.Confidence,
		Reasoning:      e.Reasoning,
		Title:          e.Title,
		Description:    e.Description,
		BodyClean:      e.BodyClean,
		RawClaimNumber: e.RawClaimNumber,
		RawPolicy:      e.RawPolicy,
		RawCaseNumber:  e.RawCaseNumber,
		RawCaratula:    e.RawCaratula,
		Processed:      e.Processed,
		ReceivedAt:     e.ReceivedAt,
		CreatedAt:      e.CreatedAt,
		Approved:       e.Approved,
		ReviewedAt:     e.ReviewedAt,
		ReviewComment:  e.ReviewComment,
	}

	// Deserialize attachments JSONB → []AttachmentMetaDTO
	var metas []AttachmentMetaDTO
	if len(e.Attachments) > 0 {
		_ = json.Unmarshal(e.Attachments, &metas)
	}
	if metas == nil {
		metas = []AttachmentMetaDTO{}
	}
	resp.Attachments = metas

	if e.OriginalMailType != nil {
		s := e.OriginalMailType.String()
		resp.OriginalMailType = &s
	}
	if e.ReviewedBy != nil {
		s := e.ReviewedBy.String()
		resp.ReviewedBy = &s
	}
	resp.ResolutionStatus = e.ResolutionStatus.String()
	resp.ResolutionError = e.ResolutionError
	resp.CorrectedClaimNumber = e.CorrectedClaimNumber
	resp.CorrectionComment = e.CorrectionComment
	if e.ResolvedClaimID != nil {
		resp.ResolvedClaimID = e.ResolvedClaimID.String()
	}
	return resp
}

// UpdateCaseEventRequest — campos editables de un case event existente.
type UpdateCaseEventRequest struct {
	MailType    *int16     `json:"mail_type"    validate:"omitempty,min=1,max=11"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	BodyClean   string     `json:"body_clean"`
	ReceivedAt  *time.Time `json:"received_at"`
}
