package router

import (
	"github.com/Libra-Seguros/libra-legal/pkg/app/controllers"
	"github.com/Libra-Seguros/libra-legal/pkg/app/middleware"
	"github.com/Libra-Seguros/libra-legal/pkg/app/services"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
	echoSwagger "github.com/swaggo/echo-swagger"
)

type CustomValidator struct {
	validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	return cv.validator.Struct(i)
}

func InitRouter() *echo.Echo {
	e := echo.New()

	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Recover())
	e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: false,
	}))

	e.Validator = &CustomValidator{validator: validator.New()}

	// Health check
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok", "service": "libra-legal"})
	})

	// Swagger
	e.GET("/swagger/*", echoSwagger.WrapHandler)

	// Services
	casosService := services.NewCasosService()

	// Controllers
	casosController := controllers.NewCasosController(casosService)

	// API v1
	api := e.Group("/api/v1")

	// Casos (requiere auth)
	casos := api.Group("/casos", middleware.AuthMiddleware())
	{
		casos.GET("", casosController.List)
		casos.GET("/:id", casosController.GetByID)
	}

	// Métricas (requiere auth)
	api.GET("/metrics", func(c echo.Context) error {
		// TODO: conectar con MetricsService
		return c.JSON(200, map[string]interface{}{"status": "pending"})
	}, middleware.AuthMiddleware())

	// Agentes (requiere auth)
	api.GET("/agents", func(c echo.Context) error {
		// TODO: conectar con estado real de OpenClaw
		return c.JSON(200, []map[string]interface{}{
			{"id": "ali", "name": "Ali", "role": "Coordinador", "status": "active"},
			{"id": "rachel", "name": "Rachel", "role": "Intake Specialist", "status": "active"},
			{"id": "triage", "name": "Triage Analyst", "role": "Triage", "status": "pending"},
		})
	}, middleware.AuthMiddleware())

	return e
}
