package router

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	appMiddleware "github.com/ossarg/ali/backend/internal/middleware"
	"github.com/ossarg/ali/backend/internal/config"
)

func InitRouter(cfg *config.Config) *echo.Echo {
	e := echo.New()

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

	api := e.Group("/api/v1", appMiddleware.JWTMiddleware())

	// Cases
	api.GET("/cases", placeholder("cases.list"))
	api.GET("/cases/:id", placeholder("cases.get"))

	// Triage
	api.GET("/triage/rules", placeholder("triage.rules.get"))
	api.PUT("/triage/rules", placeholder("triage.rules.update"), appMiddleware.RequireCapability("triage:config"))

	// Metrics
	api.GET("/metrics", placeholder("metrics.get"))

	return e
}

func placeholder(name string) echo.HandlerFunc {
	return func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"handler": name, "status": "not implemented"})
	}
}
