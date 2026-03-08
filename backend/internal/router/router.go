package router

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/config"
	"github.com/ossarg/ali/backend/internal/controllers"
	appMiddleware "github.com/ossarg/ali/backend/internal/middleware"
	_ "github.com/ossarg/ali/backend/docs"
	echoSwagger "github.com/swaggo/echo-swagger"
	_ "github.com/swaggo/files"
)

func InitRouter(cfg *config.Config, authController *controllers.AuthController, caseController *controllers.CaseController, claimController *controllers.ClaimController) *echo.Echo {
	e := echo.New()
	e.HTTPErrorHandler = apierrors.Handler

	e.Use(middleware.Recover())
	e.Use(middleware.Logger())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: cfg.CORS.AllowedOrigins,
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete},
		AllowHeaders: []string{echo.HeaderContentType, echo.HeaderAuthorization, "X-Agent-Key"},
	}))

	e.GET("/swagger/*", echoSwagger.WrapHandler)

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	// Auth (public)
	auth := e.Group("/api/v1/auth")
	auth.POST("/login", authController.Login)
	auth.POST("/logout", authController.Logout, appMiddleware.JWTMiddleware())

	// Agent endpoints (API key auth) — must be registered BEFORE /api/v1 JWT group
	agents := e.Group("/api/v1/agents", appMiddleware.AgentKeyMiddleware())
	agents.POST("/case-events", caseController.CreateEvent)

	// Protected routes (JWT) — registered last so /api/v1/agents is not captured here
	api := e.Group("/api/v1", appMiddleware.JWTMiddleware())
	api.GET("/cases", caseController.List)
	api.GET("/cases/:id", caseController.GetByID)
	api.GET("/cases/:id/events", caseController.ListCaseEvents)
	api.GET("/activity/metrics", caseController.GetEventMetrics)
	api.GET("/activity/events/approved", caseController.ListApprovedEvents)
	api.GET("/activity/events/pending", caseController.ListPendingEvents)
	api.PATCH("/activity/events/:id/review", caseController.ReviewEvent)
	api.POST("/activity/events/:id/resolve", caseController.RetryResolution)
	api.GET("/claims/unresolved", caseController.ListUnresolvedEvents)
	api.POST("/claims/batch-resolve", caseController.BatchResolve)
	api.GET("/claims/metrics", claimController.Metrics)
	api.GET("/claims", claimController.List)
	api.GET("/claims/lookup", claimController.Lookup)
	api.GET("/claims/:id", claimController.Get)
	api.POST("/claims", claimController.Create)
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
