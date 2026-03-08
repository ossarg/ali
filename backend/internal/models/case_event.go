package models

import (
	"time"

	"github.com/google/uuid"
)

// ResolutionStatus tracks whether the raw_claim_number was validated against SISE.
type ResolutionStatus int16

const (
	ResolutionPending    ResolutionStatus = 0
	ResolutionResolved   ResolutionStatus = 1
	ResolutionUnresolved ResolutionStatus = 2
)

func (r ResolutionStatus) String() string {
	switch r {
	case ResolutionPending:
		return "pending"
	case ResolutionResolved:
		return "resolved"
	case ResolutionUnresolved:
		return "unresolved"
	}
	return "unknown"
}

type MailType int16

const (
	MailTypeSentencia   MailType = 1
	MailTypeReclamoPago MailType = 2
	MailTypeIntimacion  MailType = 3
	MailTypeAcuerdo     MailType = 4
	MailTypeEmbargo     MailType = 5
	MailTypePericia     MailType = 6
	MailTypeOficio      MailType = 7
	MailTypeGestion     MailType = 8
)

var mailTypeNames = map[MailType]string{
	MailTypeSentencia:   "sentencia",
	MailTypeReclamoPago: "reclamo_pago",
	MailTypeIntimacion:  "intimacion",
	MailTypeAcuerdo:     "acuerdo",
	MailTypeEmbargo:     "embargo",
	MailTypePericia:     "pericia",
	MailTypeOficio:      "oficio",
	MailTypeGestion:     "gestion",
}

func (m MailType) String() string {
	if name, ok := mailTypeNames[m]; ok {
		return name
	}
	return "unknown"
}

func (m MailType) IsValid() bool {
	_, ok := mailTypeNames[m]
	return ok
}

type CaseEvent struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CaseID       *uuid.UUID `gorm:"type:uuid;default:null"                         json:"case_id,omitempty"`
	MailID       string     `gorm:"not null;uniqueIndex"                           json:"mail_id"`
	MailProvider string     `gorm:"not null;default:'gmail'"                       json:"mail_provider"`
	Subject      string     `gorm:"type:varchar(500)"                              json:"subject,omitempty"`
	MailType     MailType   `gorm:"not null"                                       json:"mail_type"`
	Confidence   float64    `gorm:"type:numeric(4,3);not null"                     json:"confidence"`
	Reasoning    string     `gorm:"type:text"                                      json:"reasoning,omitempty"`

	// Raw identifiers extracted by Rachel (unnormalized)
	RawClaimNumber string `gorm:"type:varchar(100)" json:"raw_claim_number,omitempty"`
	RawPolicy      string `gorm:"type:varchar(100)" json:"raw_policy,omitempty"`
	RawCaseNumber  string `gorm:"type:varchar(100)" json:"raw_case_number,omitempty"`
	RawCaratula    string `gorm:"type:varchar(500)" json:"raw_caratula,omitempty"`

	Processed  bool      `gorm:"not null;default:false" json:"processed"`
	ReceivedAt time.Time `gorm:"not null"               json:"received_at"`
	CreatedAt  time.Time `                              json:"created_at"`

	// Review fields
	Approved           *bool      `gorm:"default:false"   json:"approved,omitempty"`
	OriginalMailType   *MailType  `gorm:"default:null"    json:"original_mail_type,omitempty"`
	ReviewedBy         *uuid.UUID `gorm:"type:uuid"       json:"reviewed_by,omitempty"`
	ReviewedAt         *time.Time `                       json:"reviewed_at,omitempty"`
	ReviewComment      string     `gorm:"type:text"       json:"review_comment,omitempty"`

	// Resolution fields (async SISE lookup after approval)
	ResolutionStatus       ResolutionStatus `gorm:"not null;default:0"   json:"resolution_status"`
	ResolutionError        string           `gorm:"type:text"            json:"resolution_error,omitempty"`
	ResolvedClaimID        *uuid.UUID       `gorm:"type:uuid;default:null" json:"resolved_claim_id,omitempty"`
	CorrectedClaimNumber   string           `gorm:"type:varchar(100)"    json:"corrected_claim_number,omitempty"`
	CorrectionComment      string           `gorm:"type:text"            json:"correction_comment,omitempty"`

	// Associations
	Case          *Case  `gorm:"foreignKey:CaseID"         json:"case,omitempty"`
	ReviewUser    *User  `gorm:"foreignKey:ReviewedBy"     json:"review_user,omitempty"`
	ResolvedClaim *Claim `gorm:"foreignKey:ResolvedClaimID" json:"resolved_claim,omitempty"`
}
