package controllers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/services"
)

type CaseController struct {
	caseService services.CaseService
}

func NewCaseController(caseService services.CaseService) *CaseController {
	return &CaseController{caseService: caseService}
}

// ListCases godoc
// @Summary      List cases
// @Description  Returns a list of legal cases. Supports optional filtering by status, pipeline_stage, and case_type.
// @Tags         cases
// @Produce      json
// @Security     BearerAuth
// @Param        status          query  int     false  "Case status (1=open, 2=closed, 3=suspended)"
// @Param        pipeline_stage  query  string  false  "Pipeline stage (ingesta, extraccion, triage, asignado, borrador, completado)"
// @Param        case_type       query  int     false  "Case type (1=lawsuit, 2=mediation, 3=third_party)"
// @Success      200  {array}   dto.CaseResponse
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Router       /api/v1/cases [get]
func (cc *CaseController) List(c echo.Context) error {
	var req dto.ListCasesRequest
	if err := c.Bind(&req); err != nil {
		return apierrors.ErrBadRequest
	}

	cases, err := cc.caseService.List(req)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, cases)
}

// GetCase godoc
// @Summary      Get case by ID
// @Description  Returns a single legal case with associated firm and user data.
// @Tags         cases
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Case UUID"
// @Success      200  {object}  dto.CaseResponse
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /api/v1/cases/{id} [get]
func (cc *CaseController) GetByID(c echo.Context) error {
	id := c.Param("id")

	caseResp, err := cc.caseService.GetByID(id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, caseResp)
}

// CreateCaseEvent godoc
// @Summary      Register a case event from an incoming email
// @Description  Called by Rachel after classifying an email. Requires X-Agent-Key header.
// @Tags         cases
// @Accept       json
// @Produce      json
// @Param        body  body      dto.CreateCaseEventRequest  true  "Case event payload"
// @Success      201   {object}  dto.CaseEventResponse
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string
// @Failure      409   {object}  map[string]string
// @Router       /api/v1/agents/case-events [post]
func (cc *CaseController) CreateEvent(c echo.Context) error {
	var req dto.CreateCaseEventRequest
	if err := c.Bind(&req); err != nil {
		return apierrors.ErrBadRequest
	}

	if req.MailID == "" {
		return apierrors.New(http.StatusBadRequest, "mail_id is required")
	}
	if req.ReceivedAt.IsZero() {
		return apierrors.New(http.StatusBadRequest, "received_at is required")
	}

	resp, err := cc.caseService.CreateEvent(req)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, resp)
}
