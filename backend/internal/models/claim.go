package models

import (
	"time"

	"github.com/google/uuid"
)

// Claim represents a SISE siniestro header persisted in our DB.
// Stage-level data (status, payments) lives in ClaimStage / ClaimPayment.
type Claim struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`

	// SISE identifiers
	SISEClaimID       int64 `gorm:"not null;uniqueIndex" json:"sise_claim_id"`
	SISEIdPV          int64 `gorm:"not null"             json:"sise_id_pv"`
	ClaimNumber       int64 `gorm:"not null;index"       json:"claim_number"`
	PolicyNumber      int64 `gorm:"not null;index"       json:"policy_number"`
	PolicyEndorsement int64 `gorm:"not null;default:0"   json:"policy_endorsement"`
	RamoCode          int16 `gorm:"not null"             json:"ramo_code"`

	// Claim header data
	IncidentDate     time.Time `gorm:"not null"  json:"incident_date"`
	RegistrationDate time.Time `gorm:"not null"  json:"registration_date"`
	NoticeDate       time.Time `gorm:"not null"  json:"notice_date"`
	Cause            string    `gorm:"type:text" json:"cause"`
	Coverage         string    `gorm:"type:text" json:"coverage"`

	// Denormalized current status (latest stage's status — updated on each stage upsert)
	CurrentStatus string `gorm:"type:varchar(50);not null;default:'';index" json:"current_status"`

	// Policyholder
	Contratante string `gorm:"type:varchar(200)"      json:"contratante"`
	DocType     string `gorm:"type:varchar(20)"       json:"doc_type"`
	DocNumber   string `gorm:"type:varchar(30);index" json:"doc_number"`

	// Policy data
	PolicyType            string    `gorm:"type:varchar(100)"            json:"policy_type"`
	InsuredAmount         float64   `gorm:"type:numeric(15,6);default:0" json:"insured_amount"`
	PolicyValidFrom       time.Time `gorm:"not null"                     json:"policy_valid_from"`
	PolicyValidTo         time.Time `gorm:"not null"                     json:"policy_valid_to"`
	CommercialProductCode int16     `gorm:"default:0"                    json:"commercial_product_code"`
	CommercialProduct     string    `gorm:"type:varchar(200)"            json:"commercial_product"`

	// Producer data
	ProducerCode      int    `gorm:"default:0;index"   json:"producer_code"`
	ProducerTypeCode  int16  `gorm:"default:0"         json:"producer_type_code"`
	ProducerGroupCode int16  `gorm:"default:0"         json:"producer_group_code"`
	ProducerStatus    string `gorm:"type:varchar(5)"   json:"producer_status"`
	ProducerName      string `gorm:"type:varchar(200)" json:"producer_name"`
	ProducerType      string `gorm:"type:varchar(50)"  json:"producer_type"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Stages []ClaimStage `gorm:"foreignKey:ClaimID" json:"stages,omitempty"`
}
