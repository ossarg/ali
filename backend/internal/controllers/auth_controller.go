package controllers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/services"
)

type AuthController struct {
	authService services.AuthService
}

func NewAuthController(authService services.AuthService) *AuthController {
	return &AuthController{authService: authService}
}

func (ac *AuthController) Login(c echo.Context) error {
	var req dto.LoginRequest
	if err := c.Bind(&req); err != nil {
		return apierrors.ErrBadRequest
	}

	if req.Email == "" || req.Password == "" {
		return apierrors.New(http.StatusBadRequest, "email and password are required")
	}

	resp, err := ac.authService.Login(req)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, resp)
}
