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

// Login godoc
// @Summary      Login
// @Description  Authenticates a user and returns a JWT token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body  body      dto.LoginRequest   true  "Credentials"
// @Success      200   {object}  dto.LoginResponse
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string
// @Router       /api/v1/auth/login [post]
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

// Logout godoc
// @Summary      Logout
// @Description  Invalidates the session (client-side). JWT blacklist pending.
// @Tags         auth
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Router       /api/v1/auth/logout [post]
func (ac *AuthController) Logout(c echo.Context) error {
	// TODO: implement JWT blacklist (Redis or revoked_tokens table)
	return c.JSON(http.StatusOK, map[string]string{"message": "logged out"})
}
