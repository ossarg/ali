package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/ossarg/ali/backend/internal/models"
	"github.com/ossarg/ali/backend/internal/services/sise"
)

// ClaimLookupResponse — combined SISE data returned before persisting
type ClaimLookupResponse struct {
	Claim    *sise.ClaimResult   `json:"claim"`
	Policy   *sise.PolicySummary `json:"policy"`
	Producer *sise.Producer      `json:"producer"`
}

// ClaimPaymentResponse — a single payment within a stage
type ClaimPaymentResponse struct {
	ID          uuid.UUID `json:"id"`
	Amount      float64   `json:"amount"`
	PaymentDate time.Time `json:"payment_date"`
}

// ClaimStageResponse — a subreclamo/stage with its payments
type ClaimStageResponse struct {
	ID          uuid.UUID              `json:"id"`
	StageNumber int                    `json:"stage_number"`
	Status      string                 `json:"status"`
	Payments    []ClaimPaymentResponse `json:"payments"`
}

// ClaimResponse — persisted claim returned from our DB
type ClaimResponse struct {
	ID uuid.UUID `json:"id"`

	SISEClaimID       int64 `json:"sise_claim_id"`
	SISEIdPV          int64 `json:"sise_id_pv"`
	ClaimNumber       int64 `json:"claim_number"`
	PolicyNumber      int64 `json:"policy_number"`
	PolicyEndorsement int64 `json:"policy_endorsement"`
	RamoCode          int16 `json:"ramo_code"`

	IncidentDate     time.Time `json:"incident_date"`
	RegistrationDate time.Time `json:"registration_date"`
	NoticeDate       time.Time `json:"notice_date"`
	Cause            string    `json:"cause"`
	Coverage         string    `json:"coverage"`
	CurrentStatus    string    `json:"current_status"`

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

	Stages []ClaimStageResponse `json:"stages,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ToClaimResponse maps a models.Claim (with preloaded Stages + Payments) to ClaimResponse
func ToClaimResponse(c models.Claim) ClaimResponse {
	stages := make([]ClaimStageResponse, 0, len(c.Stages))
	for _, s := range c.Stages {
		payments := make([]ClaimPaymentResponse, 0, len(s.Payments))
		for _, p := range s.Payments {
			payments = append(payments, ClaimPaymentResponse{
				ID:          p.ID,
				Amount:      p.Amount,
				PaymentDate: p.PaymentDate,
			})
		}
		stages = append(stages, ClaimStageResponse{
			ID:          s.ID,
			StageNumber: s.SISEStageNumber,
			Status:      s.Status,
			Payments:    payments,
		})
	}

	return ClaimResponse{
		ID:                    c.ID,
		SISEClaimID:           c.SISEClaimID,
		SISEIdPV:              c.SISEIdPV,
		ClaimNumber:           c.ClaimNumber,
		PolicyNumber:          c.PolicyNumber,
		PolicyEndorsement:     c.PolicyEndorsement,
		RamoCode:              c.RamoCode,
		IncidentDate:          c.IncidentDate,
		RegistrationDate:      c.RegistrationDate,
		NoticeDate:            c.NoticeDate,
		Cause:                 c.Cause,
		Coverage:              c.Coverage,
		CurrentStatus:         c.CurrentStatus,
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
		Stages:                stages,
		CreatedAt:             c.CreatedAt,
		UpdatedAt:             c.UpdatedAt,
	}
}
