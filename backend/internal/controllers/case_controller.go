package controllers

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/middleware"
	"github.com/ossarg/ali/backend/internal/services"
)

type CaseController struct {
	caseService  services.CaseService
	claimService services.ClaimService
}

func NewCaseController(caseService services.CaseService, claimService services.ClaimService) *CaseController {
	return &CaseController{caseService: caseService, claimService: claimService}
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
	pp := dto.ParsePageParams(c.QueryParam("page"), c.QueryParam("limit"))
	result, err := cc.caseService.ListPaginated(req, pp.Page, pp.Limit)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, result)
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


// ListCaseEvents godoc
// @Summary      List events for a case
// @Description  Returns all case events linked to a case (approved emails from Rachel), ordered by received_at DESC.
// @Tags         cases
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Case UUID"
// @Success      200  {array}   dto.CaseEventResponse
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /api/v1/cases/{id}/events [get]
func (cc *CaseController) ListCaseEvents(c echo.Context) error {
	id := c.Param("id")
	events, err := cc.caseService.ListEventsByCaseID(id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, events)
}

// GetEventMetrics godoc
// @Summary      Get case event metrics
// @Description  Returns aggregated stats: total, approved, pending, processed, and last event timestamp.
// @Tags         cases
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  dto.CaseEventMetrics
// @Failure      401  {object}  map[string]string
// @Router       /api/v1/case-events/metrics [get]
func (cc *CaseController) GetEventMetrics(c echo.Context) error {
	metrics, err := cc.caseService.GetEventMetrics()
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, metrics)
}

// ListApprovedEvents godoc
// @Summary      List approved case events
// @Description  Returns all case events approved by a human reviewer (activity history).
// @Tags         cases
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}   dto.CaseEventResponse
// @Failure      401  {object}  map[string]string
// @Router       /api/v1/case-events/approved [get]
func (cc *CaseController) ListApprovedEvents(c echo.Context) error {
	pp := dto.ParsePageParams(c.QueryParam("page"), c.QueryParam("limit"))
	result, err := cc.caseService.ListApprovedEventsPaginated(pp.Page, pp.Limit)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, result)
}

// ListPendingEvents godoc
// @Summary      List pending case events
// @Description  Returns all case events not yet approved by a human reviewer.
// @Tags         cases
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}   dto.CaseEventResponse
// @Failure      401  {object}  map[string]string
// @Router       /api/v1/case-events/pending [get]
func (cc *CaseController) ListPendingEvents(c echo.Context) error {
	events, err := cc.caseService.ListPendingEvents()
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, events)
}

// ReviewCaseEvent godoc
// @Summary      Approve or correct a case event classification
// @Description  A human reviewer approves Rachel's classification or corrects it with a comment.
// @Tags         cases
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      string                      true  "Case event UUID"
// @Param        body  body      dto.ReviewCaseEventRequest  true  "Review payload"
// @Success      200   {object}  dto.CaseEventResponse
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string
// @Failure      404   {object}  map[string]string
// @Router       /api/v1/case-events/{id}/review [patch]
func (cc *CaseController) ReviewEvent(c echo.Context) error {
	id := c.Param("id")

	var req dto.ReviewCaseEventRequest
	if err := c.Bind(&req); err != nil {
		return apierrors.ErrBadRequest
	}

	claims, ok := c.Get("claims").(*middleware.Claims)
	if !ok || claims == nil {
		return apierrors.New(http.StatusUnauthorized, "missing claims")
	}
	reviewerID := claims.UserID

	resp, err := cc.caseService.ReviewEvent(id, reviewerID, req, cc.claimService)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, resp)
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
// ListUnresolvedEvents godoc
// @Summary      List unresolved case events
// @Description  Returns case events where SISE claim lookup failed.
// @Tags         claims
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}   dto.CaseEventResponse
// @Failure      401  {object}  map[string]string
// @Router       /api/v1/claims/unresolved [get]
func (cc *CaseController) ListUnresolvedEvents(c echo.Context) error {
	events, err := cc.claimService.ListUnresolvedEvents()
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, events)
}

// RetryResolution godoc
// @Summary      Retry claim resolution with corrected nro_stro
// @Description  Human corrects the claim number extracted by Rachel and retries SISE lookup.
// @Tags         claims
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      string                        true  "Case event UUID"
// @Param        body  body      dto.RetryResolutionRequest    true  "Correction payload"
// @Success      200   {object}  dto.CaseEventResponse
// @Failure      400   {object}  map[string]string
// @Failure      404   {object}  map[string]string
// @Router       /api/v1/activity/events/{id}/resolve [post]
func (cc *CaseController) RetryResolution(c echo.Context) error {
	id := c.Param("id")
	var req dto.RetryResolutionRequest
	if err := c.Bind(&req); err != nil {
		return apierrors.ErrBadRequest
	}
	if req.CorrectedClaimNumber == "" {
		return apierrors.New(http.StatusBadRequest, "corrected_claim_number is required")
	}
	resp, err := cc.claimService.RetryEventResolution(id, req.CorrectedClaimNumber, req.CorrectionComment)
	if err != nil {
		// Return partial response with error info even on SISE failure
		if resp != nil {
			return c.JSON(http.StatusUnprocessableEntity, map[string]interface{}{
				"error": err.Error(),
				"event": resp,
			})
		}
		return apierrors.New(http.StatusNotFound, err.Error())
	}
	return c.JSON(http.StatusOK, resp)
}

// BatchResolve godoc
// @Summary      Batch resolve pending claim events
// @Description  Finds all approved events with raw_claim_number not yet resolved and queries SISE.
// @Tags         claims
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  dto.BatchResolveResponse
// @Failure      401  {object}  map[string]string
// @Router       /api/v1/claims/batch-resolve [post]
func (cc *CaseController) BatchResolve(c echo.Context) error {
	resolved, errs, err := cc.claimService.BatchResolvePendingEvents()
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, dto.BatchResolveResponse{
		Resolved: resolved,
		Errors:   errs,
		Message:  fmt.Sprintf("Resolved %d events, %d failed", resolved, errs),
	})
}

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

// UpdateEvent godoc
// @Summary      Edit a case event
// @Tags         activity
// @Accept       json
// @Produce      json
// @Param        id   path  string  true  "Event UUID"
// @Success      200  {object}  dto.CaseEventResponse
// @Router       /api/v1/activity/events/{id} [put]
func (cc *CaseController) UpdateEvent(c echo.Context) error {
	id := c.Param("id")
	var req dto.UpdateCaseEventRequest
	if err := c.Bind(&req); err != nil {
		return apierrors.New(http.StatusBadRequest, "invalid request body")
	}
	if req.MailType != nil && (*req.MailType < 1 || *req.MailType > 11) {
		return apierrors.New(http.StatusBadRequest, "mail_type must be between 1 and 11")
	}
	resp, err := cc.caseService.UpdateCaseEvent(id, req)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, resp)
}

// DeleteEvent godoc
// @Summary      Delete a case event (hard if pending, soft if approved)
// @Tags         activity
// @Param        id   path  string  true  "Event UUID"
// @Success      204
// @Router       /api/v1/activity/events/{id} [delete]
func (cc *CaseController) DeleteEvent(c echo.Context) error {
	id := c.Param("id")
	if err := cc.caseService.DeleteCaseEvent(id); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}
