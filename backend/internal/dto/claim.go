package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/ossarg/ali/backend/internal/models"
	"github.com/ossarg/ali/backend/internal/services/sise"
)

// ClaimLookupResponse — combined SISE data returned before persisting
type ClaimLookupResponse struct {
	Claim    *sise.Claim         `json:"claim"`
	Policy   *sise.PolicySummary `json:"policy"`
	Producer *sise.Producer      `json:"producer"`
}

// ClaimResponse — persisted claim returned from our DB
type ClaimResponse struct {
	ID   uuid.UUID `json:"id"`

	SISEClaimID       int64  `json:"sise_claim_id"`
	SISEIdPV          int64  `json:"sise_id_pv"`
	ClaimNumber       int64  `json:"claim_number"`
	ClaimSubnumber    int64  `json:"claim_subnumber"`
	PolicyNumber      int64  `json:"policy_number"`
	PolicyEndorsement int64  `json:"policy_endorsement"`
	RamoCode          int16  `json:"ramo_code"`

	IncidentDate     time.Time  `json:"incident_date"`
	RegistrationDate time.Time  `json:"registration_date"`
	NoticeDate       time.Time  `json:"notice_date"`
	PaymentDate      *time.Time `json:"payment_date,omitempty"`
	Cause            string     `json:"cause"`
	Coverage         string     `json:"coverage"`
	Status           string     `json:"status"`
	EstimatedAmount  float64    `json:"estimated_amount"`
	PaidAmount       float64    `json:"paid_amount"`

	Contratante string `json:"contratante"`
	DocType     string `json:"doc_type"`
	DocNumber   string `json:"doc_number"`

	PolicyType            string    `json:"policy_type"`
	InsuredAmount         float64   `json:"insured_amount"`
	PolicyValidFrom       time.Time `json:"policy_valid_from"`
	PolicyValidTo         time.Time `json:"policy_valid_to"`
	CommercialProductCode int16     `json:"commercial_product_code"`
	CommercialProduct     string    `json:"commercial_product"`

	ProducerCode      int    `json:"producer_code"`
	ProducerTypeCode  int16  `json:"producer_type_code"`
	ProducerGroupCode int16  `json:"producer_group_code"`
	ProducerStatus    string `json:"producer_status"`
	ProducerName      string `json:"producer_name"`
	ProducerType      string `json:"producer_type"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ToClaimResponse maps a models.Claim to ClaimResponse
func ToClaimResponse(c models.Claim) ClaimResponse {
	return ClaimResponse{
		ID:                    c.ID,
		SISEClaimID:           c.SISEClaimID,
		SISEIdPV:              c.SISEIdPV,
		ClaimNumber:           c.ClaimNumber,
		ClaimSubnumber:        c.ClaimSubnumber,
		PolicyNumber:          c.PolicyNumber,
		PolicyEndorsement:     c.PolicyEndorsement,
		RamoCode:              c.RamoCode,
		IncidentDate:          c.IncidentDate,
		RegistrationDate:      c.RegistrationDate,
		NoticeDate:            c.NoticeDate,
		PaymentDate:           c.PaymentDate,
		Cause:                 c.Cause,
		Coverage:              c.Coverage,
		Status:                c.Status,
		EstimatedAmount:       c.EstimatedAmount,
		PaidAmount:            c.PaidAmount,
		Contratante:           c.Contratante,
		DocType:               c.DocType,
		DocNumber:             c.DocNumber,
		PolicyType:            c.PolicyType,
		InsuredAmount:         c.InsuredAmount,
		PolicyValidFrom:       c.PolicyValidFrom,
		PolicyValidTo:         c.PolicyValidTo,
		CommercialProductCode: c.CommercialProductCode,
		CommercialProduct:     c.CommercialProduct,
		ProducerCode:          c.ProducerCode,
		ProducerTypeCode:      c.ProducerTypeCode,
		ProducerGroupCode:     c.ProducerGroupCode,
		ProducerStatus:        c.ProducerStatus,
		ProducerName:          c.ProducerName,
		ProducerType:          c.ProducerType,
		CreatedAt:             c.CreatedAt,
		UpdatedAt:             c.UpdatedAt,
	}
}
