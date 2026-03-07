package models

import (
	"time"

	"github.com/google/uuid"
)

type MailType int16

const (
	MailTypeSentencia   MailType = 1
	MailTypeReclamoPago MailType = 2
	MailTypeIntimacion  MailType = 3
	MailTypeAcuerdo     MailType = 4
	MailTypeEmbargo     MailType = 5
	MailTypePericia     MailType = 6
	MailTypeOficio      MailType = 7
)

var mailTypeNames = map[MailType]string{
	MailTypeSentencia:   "sentencia",
	MailTypeReclamoPago: "reclamo_pago",
	MailTypeIntimacion:  "intimacion",
	MailTypeAcuerdo:     "acuerdo",
	MailTypeEmbargo:     "embargo",
	MailTypePericia:     "pericia",
	MailTypeOficio:      "oficio",
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

	// Association
	Case *Case `gorm:"foreignKey:CaseID" json:"case,omitempty"`
}
