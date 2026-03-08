package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CaseType int16

const (
	CaseTypeLawsuit    CaseType = 1
	CaseTypeMediation  CaseType = 2
	CaseTypeThirdParty CaseType = 3
)

var caseTypeNames = map[CaseType]string{
	CaseTypeLawsuit:    "lawsuit",
	CaseTypeMediation:  "mediation",
	CaseTypeThirdParty: "third_party",
}

func (c CaseType) String() string {
	if name, ok := caseTypeNames[c]; ok {
		return name
	}
	return "unknown"
}

func (c CaseType) IsValid() bool {
	_, ok := caseTypeNames[c]
	return ok
}

type ActionType int16

const (
	ActionTypeDirectClaim       ActionType = 1
	ActionTypeGuaranteeCitation ActionType = 2
)

var actionTypeNames = map[ActionType]string{
	ActionTypeDirectClaim:       "direct_claim",
	ActionTypeGuaranteeCitation: "guarantee_citation",
}

func (a ActionType) String() string {
	if name, ok := actionTypeNames[a]; ok {
		return name
	}
	return "unknown"
}

func (a ActionType) IsValid() bool {
	_, ok := actionTypeNames[a]
	return ok
}

type CaseStatus int16

const (
	CaseStatusOpen      CaseStatus = 1
	CaseStatusClosed    CaseStatus = 2
	CaseStatusSuspended CaseStatus = 3
)

var caseStatusNames = map[CaseStatus]string{
	CaseStatusOpen:      "open",
	CaseStatusClosed:    "closed",
	CaseStatusSuspended: "suspended",
}

func (s CaseStatus) String() string {
	if name, ok := caseStatusNames[s]; ok {
		return name
	}
	return "unknown"
}

func (s CaseStatus) IsValid() bool {
	_, ok := caseStatusNames[s]
	return ok
}

type PipelineStage int16

const (
	PipelineStageIngesta    PipelineStage = 1
	PipelineStageExtraccion PipelineStage = 2
	PipelineStageTriage     PipelineStage = 3
	PipelineStageAsignado   PipelineStage = 4
	PipelineStageBorrador   PipelineStage = 5
	PipelineStageCompletado PipelineStage = 6
)

var pipelineStageNames = map[PipelineStage]string{
	PipelineStageIngesta:    "ingesta",
	PipelineStageExtraccion: "extraccion",
	PipelineStageTriage:     "triage",
	PipelineStageAsignado:   "asignado",
	PipelineStageBorrador:   "borrador",
	PipelineStageCompletado: "completado",
}

func (p PipelineStage) String() string {
	if name, ok := pipelineStageNames[p]; ok {
		return name
	}
	return "unknown"
}

func (p PipelineStage) IsValid() bool {
	_, ok := pipelineStageNames[p]
	return ok
}

type Case struct {
	ID               uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ClaimNumber      string         `                                                      json:"claim_number,omitempty"`
	CaseNumber       string         `                                                      json:"case_number,omitempty"`
	Title            string         `gorm:"not null"                                       json:"title"`
	Policy           string         `                                                      json:"policy,omitempty"`
	Caratula         string         `gorm:"column:caratula"                                json:"caratula,omitempty"`
	CaseType         CaseType       `gorm:"not null"                                       json:"case_type"`
	ActionType       *ActionType    `gorm:"default:null"                                   json:"action_type,omitempty"`
	Court            string         `                                                      json:"court,omitempty"`
	Tribunal         string         `                                                      json:"tribunal,omitempty"`
	DefenseFirmID    *uuid.UUID     `gorm:"type:uuid;default:null"                         json:"defense_firm_id,omitempty"`
	PlaintiffFirmID  *uuid.UUID     `gorm:"type:uuid;default:null"                         json:"plaintiff_firm_id,omitempty"`
	AssignedUserID   *uuid.UUID     `gorm:"type:uuid;default:null"                         json:"assigned_user_id,omitempty"`
	Status           CaseStatus     `gorm:"not null;default:1"                             json:"status"`
	EstimatedAmount  *float64       `gorm:"type:numeric(15,2)"                             json:"estimated_amount,omitempty"`
	IncidentDate     *time.Time     `gorm:"type:date"                                      json:"incident_date,omitempty"`
	OpenedAt         *time.Time     `                                                      json:"opened_at,omitempty"`
	PipelineStage    PipelineStage  `gorm:"not null;default:1"                             json:"pipeline_stage"`
	ClaimID          *uuid.UUID     `gorm:"type:uuid;default:null;index"                   json:"claim_id,omitempty"`
	CreatedAt        time.Time      `                                                      json:"created_at"`
	UpdatedAt        time.Time      `                                                      json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index"                                          json:"-"`

	// Associations (eager loaded when needed)
	DefenseFirm   *Firm  `gorm:"foreignKey:DefenseFirmID"   json:"defense_firm,omitempty"`
	PlaintiffFirm *Firm  `gorm:"foreignKey:PlaintiffFirmID" json:"plaintiff_firm,omitempty"`
	Claim         *Claim `gorm:"foreignKey:ClaimID"         json:"claim,omitempty"`
	AssignedUser  *User `gorm:"foreignKey:AssignedUserID"  json:"assigned_user,omitempty"`
}
