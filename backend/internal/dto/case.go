package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/ossarg/ali/backend/internal/models"
)

// ListCasesRequest holds query params for filtering cases
type ListCasesRequest struct {
	Status        *int16 `query:"status"`
	PipelineStage *int16 `query:"pipeline_stage"`
	CaseType      *int16 `query:"case_type"`
}

// CaseResponse is the public representation of a case
type CaseResponse struct {
	ID              uuid.UUID              `json:"id"`
	ClaimNumber     string                 `json:"claim_number,omitempty"`
	CaseNumber      string                 `json:"case_number,omitempty"`
	Title           string                 `json:"title"`
	Policy          string                 `json:"policy,omitempty"`
	CaseType        string                 `json:"case_type"`
	ActionType      *string                `json:"action_type,omitempty"`
	Court           string                 `json:"court,omitempty"`
	Tribunal        string                 `json:"tribunal,omitempty"`
	DefenseFirm     *FirmSummary           `json:"defense_firm,omitempty"`
	PlaintiffFirm   *FirmSummary           `json:"plaintiff_firm,omitempty"`
	AssignedUser    *UserSummary           `json:"assigned_user,omitempty"`
	Status          string                 `json:"status"`
	EstimatedAmount *float64               `json:"estimated_amount,omitempty"`
	IncidentDate    *time.Time             `json:"incident_date,omitempty"`
	OpenedAt        *time.Time             `json:"opened_at,omitempty"`
	PipelineStage   string                 `json:"pipeline_stage"`
	CreatedAt       time.Time              `json:"created_at"`
	UpdatedAt       time.Time              `json:"updated_at"`
}

type FirmSummary struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
	Type string    `json:"type"`
}

type UserSummary struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
}

// ToCaseResponse converts a models.Case to CaseResponse
func ToCaseResponse(c models.Case) CaseResponse {
	resp := CaseResponse{
		ID:              c.ID,
		ClaimNumber:     c.ClaimNumber,
		CaseNumber:      c.CaseNumber,
		Title:           c.Title,
		Policy:          c.Policy,
		CaseType:        c.CaseType.String(),
		Court:           c.Court,
		Tribunal:        c.Tribunal,
		Status:          c.Status.String(),
		EstimatedAmount: c.EstimatedAmount,
		IncidentDate:    c.IncidentDate,
		OpenedAt:        c.OpenedAt,
		PipelineStage:   c.PipelineStage.String(),
		CreatedAt:       c.CreatedAt,
		UpdatedAt:       c.UpdatedAt,
	}

	if c.ActionType != nil {
		s := c.ActionType.String()
		resp.ActionType = &s
	}

	if c.DefenseFirm != nil {
		resp.DefenseFirm = &FirmSummary{
			ID:   c.DefenseFirm.ID,
			Name: c.DefenseFirm.Name,
			Type: c.DefenseFirm.Type.String(),
		}
	}

	if c.PlaintiffFirm != nil {
		resp.PlaintiffFirm = &FirmSummary{
			ID:   c.PlaintiffFirm.ID,
			Name: c.PlaintiffFirm.Name,
			Type: c.PlaintiffFirm.Type.String(),
		}
	}

	if c.AssignedUser != nil {
		resp.AssignedUser = &UserSummary{
			ID:        c.AssignedUser.ID,
			Email:     c.AssignedUser.Email,
			FirstName: c.AssignedUser.FirstName,
			LastName:  c.AssignedUser.LastName,
		}
	}

	return resp
}
