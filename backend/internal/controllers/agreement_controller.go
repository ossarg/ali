package controllers

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/services"
)

type AgreementController struct {
	svc services.AgreementService
}

func NewAgreementController(svc services.AgreementService) *AgreementController {
	return &AgreementController{svc: svc}
}

// List godoc
// @Summary      List all agreements
// @Description  Returns paginated agreements ordered by due_date ASC. Status (vigente/proximo/vencido) is computed on-the-fly.
// @Tags         agreements
// @Produce      json
// @Security     BearerAuth
// @Param        page      query  int  false  "Page number (default 1)"
// @Param        page_size query  int  false  "Page size (default 20, max 100)"
// @Success      200  {object}  map[string]interface{}
// @Failure      401  {object}  map[string]string
// @Router       /api/v1/agreements [get]
func (c *AgreementController) List(ctx echo.Context) error {
	page, _ := strconv.Atoi(ctx.QueryParam("page"))
	pageSize, _ := strconv.Atoi(ctx.QueryParam("page_size"))
	agreements, total, err := c.svc.List(page, pageSize)
	if err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"data":  agreements,
		"total": total,
	})
}

// GetByID godoc
// @Summary      Get agreement by ID
// @Tags         agreements
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Agreement UUID"
// @Success      200  {object}  dto.AgreementResponse
// @Failure      404  {object}  map[string]string
// @Router       /api/v1/agreements/{id} [get]
func (c *AgreementController) GetByID(ctx echo.Context) error {
	a, err := c.svc.GetByID(ctx.Param("id"))
	if err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, a)
}

// ListByCaseID godoc
// @Summary      List agreements for a case
// @Tags         agreements
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Case UUID"
// @Success      200  {array}  dto.AgreementResponse
// @Failure      404  {object}  map[string]string
// @Router       /api/v1/cases/{id}/agreements [get]
func (c *AgreementController) ListByCaseID(ctx echo.Context) error {
	agreements, err := c.svc.ListByCaseID(ctx.Param("id"))
	if err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, agreements)
}

// Create godoc
// @Summary      Create agreement manually
// @Description  Create an agreement manually (used when extraction fails or for manual entry).
// @Tags         agreements
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body  dto.CreateAgreementRequest  true  "Agreement data"
// @Success      201  {object}  dto.AgreementResponse
// @Failure      400  {object}  map[string]string
// @Router       /api/v1/agreements [post]
func (c *AgreementController) Create(ctx echo.Context) error {
	var req dto.CreateAgreementRequest
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	a, err := c.svc.Create(req)
	if err != nil {
		return err
	}
	return ctx.JSON(http.StatusCreated, a)
}

// Update godoc
// @Summary      Update agreement
// @Description  Patch agreement fields. Sets extraction_status to completed (human reviewed).
// @Tags         agreements
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path  string                     true  "Agreement UUID"
// @Param        body  body  dto.UpdateAgreementRequest true  "Fields to update"
// @Success      200  {object}  dto.AgreementResponse
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /api/v1/agreements/{id} [patch]
func (c *AgreementController) Update(ctx echo.Context) error {
	var req dto.UpdateAgreementRequest
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	a, err := c.svc.Update(ctx.Param("id"), req)
	if err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, a)
}


// ListPending godoc
// @Summary      List agreements pending extraction (agent)
// @Description  Returns agreements with extraction_status=pending. Ali polls this to know what Donna needs to process. Requires X-Agent-Key header.
// @Tags         agents
// @Produce      json
// @Security     AgentKey
// @Success      200  {array}  dto.AgreementResponse
// @Router       /api/v1/agents/agreements/pending [get]
func (c *AgreementController) ListPending(ctx echo.Context) error {
	agreements, err := c.svc.ListPending()
	if err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, agreements)
}

// AgentUpdate godoc
// @Summary      Update agreement (agent)
// @Description  Called by Donna after extracting fields from the agreement documents. Requires X-Agent-Key header.
// @Tags         agents
// @Accept       json
// @Produce      json
// @Security     AgentKey
// @Param        id    path  string                     true  "Agreement UUID"
// @Param        body  body  dto.UpdateAgreementRequest true  "Extracted fields"
// @Success      200  {object}  dto.AgreementResponse
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /api/v1/agents/agreements/{id} [patch]
func (c *AgreementController) AgentUpdate(ctx echo.Context) error {
	var req dto.UpdateAgreementRequest
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	a, err := c.svc.Update(ctx.Param("id"), req)
	if err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, a)
}

// Delete godoc
// @Summary      Delete agreement
// @Tags         agreements
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Agreement UUID"
// @Success      204
// @Failure      404  {object}  map[string]string
// @Router       /api/v1/agreements/{id} [delete]
func (c *AgreementController) Delete(ctx echo.Context) error {
	if err := c.svc.Delete(ctx.Param("id")); err != nil {
		return err
	}
	return ctx.NoContent(http.StatusNoContent)
}
