package controllers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/services"
)

type ClaimController struct {
	claimService services.ClaimService
}

func NewClaimController(claimService services.ClaimService) *ClaimController {
	return &ClaimController{claimService: claimService}
}

// GetClaimMetrics godoc
// @Summary      Get claim metrics
// @Description  Returns aggregated claim counts by status.
// @Tags         claims
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  dto.ClaimMetrics
// @Failure      401  {object}  map[string]string
// @Router       /api/v1/claims/metrics [get]
func (cc *ClaimController) Metrics(c echo.Context) error {
	metrics, err := cc.claimService.GetMetrics()
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, metrics)
}

// ListClaims godoc
// @Summary      List all claims
// @Description  Returns all claims persisted in our DB, ordered by creation date desc.
// @Tags         claims
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}   dto.ClaimResponse
// @Failure      401  {object}  map[string]string
// @Router       /api/v1/claims [get]
func (cc *ClaimController) List(c echo.Context) error {
	pp := dto.ParsePageParams(c.QueryParam("page"), c.QueryParam("limit"))
	result, err := cc.claimService.ListPaginated(pp.Page, pp.Limit)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, result)
}

// GetClaim godoc
// @Summary      Get a claim by ID
// @Description  Returns a single claim from our DB by UUID.
// @Tags         claims
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Claim UUID"
// @Success      200  {object}  dto.ClaimResponse
// @Failure      404  {object}  map[string]string
// @Router       /api/v1/claims/{id} [get]
func (cc *ClaimController) Get(c echo.Context) error {
	id := c.Param("id")
	claim, err := cc.claimService.GetByID(id)
	if err != nil {
		return err
	}
	if claim == nil {
		return apierrors.New(http.StatusNotFound, "claim not found")
	}
	return c.JSON(http.StatusOK, claim)
}

// LookupClaim godoc
// @Summary      Look up a claim in SISE
// @Description  Fetches claim + policy + producer from SISE by claim number. Does not persist.
// @Tags         claims
// @Produce      json
// @Security     BearerAuth
// @Param        nro_stro  query     string  true  "SISE claim number"
// @Success      200       {object}  dto.ClaimLookupResponse
// @Failure      400       {object}  map[string]string
// @Failure      401       {object}  map[string]string
// @Failure      404       {object}  map[string]string
// @Router       /api/v1/claims/lookup [get]
func (cc *ClaimController) Lookup(c echo.Context) error {
	nroStro := c.QueryParam("nro_stro")
	if nroStro == "" {
		return apierrors.New(http.StatusBadRequest, "nro_stro is required")
	}

	result, err := cc.claimService.Lookup(nroStro)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, result)
}

// CreateClaim godoc
// @Summary      Create a claim from SISE data
// @Description  Fetches claim from SISE and persists it in our DB. Idempotent by sise_claim_id.
// @Tags         claims
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      object{nro_stro=string}  true  "Claim number"
// @Success      201   {object}  dto.ClaimResponse
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string
// @Failure      404   {object}  map[string]string
// @Router       /api/v1/claims [post]
func (cc *ClaimController) Create(c echo.Context) error {
	var body struct {
		NroStro string `json:"nro_stro"`
	}
	if err := c.Bind(&body); err != nil || body.NroStro == "" {
		return apierrors.New(http.StatusBadRequest, "nro_stro is required")
	}

	claim, err := cc.claimService.Create(body.NroStro)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusCreated, claim)
}
