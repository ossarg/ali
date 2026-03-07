package controllers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/services"
)

type MailEventController struct {
	svc services.MailEventService
}

func NewMailEventController(svc services.MailEventService) *MailEventController {
	return &MailEventController{svc: svc}
}

// CreateMailEvent godoc
// @Summary      Register a mail event
// @Description  Called by Rachel after classifying an incoming mail. Requires X-Agent-Key header.
// @Tags         mail-events
// @Accept       json
// @Produce      json
// @Param        body  body      dto.CreateMailEventRequest  true  "Mail event payload"
// @Success      201   {object}  dto.MailEventResponse
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string
// @Failure      409   {object}  map[string]string
// @Router       /api/v1/mail-events [post]
func (mc *MailEventController) Create(c echo.Context) error {
	var req dto.CreateMailEventRequest
	if err := c.Bind(&req); err != nil {
		return apierrors.ErrBadRequest
	}

	if req.MailID == "" {
		return apierrors.New(http.StatusBadRequest, "mail_id is required")
	}
	if req.ReceivedAt.IsZero() {
		return apierrors.New(http.StatusBadRequest, "received_at is required")
	}

	resp, err := mc.svc.Create(req)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, resp)
}
