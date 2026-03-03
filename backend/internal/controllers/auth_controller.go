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

func (ac *AuthController) Logout(c echo.Context) error {
	// TODO: implement JWT blacklist (Redis or revoked_tokens table)
	// For now, logout is client-side only — client must discard the token
	return c.JSON(http.StatusOK, map[string]string{"message": "logged out"})
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
