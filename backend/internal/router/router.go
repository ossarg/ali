package router

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/config"
	"github.com/ossarg/ali/backend/internal/controllers"
	appMiddleware "github.com/ossarg/ali/backend/internal/middleware"
)

func InitRouter(cfg *config.Config, authController *controllers.AuthController) *echo.Echo {
	e := echo.New()
	e.HTTPErrorHandler = apierrors.Handler

	e.Use(middleware.Recover())
	e.Use(middleware.Logger())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: cfg.CORS.AllowedOrigins,
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowHeaders: []string{echo.HeaderContentType, echo.HeaderAuthorization},
	}))

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	// Auth (public)
	auth := e.Group("/api/v1/auth")
	auth.POST("/login", authController.Login)
	auth.POST("/logout", authController.Logout, appMiddleware.JWTMiddleware())

	// Protected routes
	api := e.Group("/api/v1", appMiddleware.JWTMiddleware())
	api.GET("/cases", placeholder("cases.list"))
	api.GET("/cases/:id", placeholder("cases.get"))
	api.GET("/triage/rules", placeholder("triage.rules.get"))
	api.PUT("/triage/rules", placeholder("triage.rules.update"), appMiddleware.RequireCapability("triage:config"))
	api.GET("/metrics", placeholder("metrics.get"))

	return e
}

func placeholder(name string) echo.HandlerFunc {
	return func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"handler": name, "status": "not implemented"})
	}
}
