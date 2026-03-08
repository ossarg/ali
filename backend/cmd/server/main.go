// @title           Libra Legal API
// @version         1.0
// @description     Backend service for Libra Legal AI — legal case management platform
// @contact.name    Libra Seguros Tech
// @host            localhost:8080
// @BasePath        /
// @schemes         http https
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and the JWT token

package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/ossarg/ali/backend/internal/config"
	"github.com/ossarg/ali/backend/internal/controllers"
	"github.com/ossarg/ali/backend/internal/database"
	"github.com/ossarg/ali/backend/internal/repositories"
	"github.com/ossarg/ali/backend/internal/router"
	"github.com/ossarg/ali/backend/internal/services"
	"github.com/ossarg/ali/backend/internal/services/cache"
	"github.com/ossarg/ali/backend/internal/services/sise"
	"github.com/ossarg/ali/backend/internal/storage"
)

func main() {
	_ = godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	db, err := database.Connect()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Redis
	if _, err := cache.Connect(cfg.Redis.URL); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer cache.Close()

	// SISE Consultas
	siseClient := sise.NewConsultasClient(cfg.SISE.BaseURL, cfg.SISE.Username, cfg.SISE.Password)
	siseOrchestrator := sise.NewConsultasOrchestrator(siseClient)


	// Repositories
	userRepo  := repositories.NewUserRepository(db)
	caseRepo  := repositories.NewCaseRepository(db)
	claimRepo := repositories.NewClaimRepository(db)

	// Services
	authService  := services.NewAuthService(userRepo, cfg.JWT.Secret)
	caseService  := services.NewCaseService(caseRepo)
	claimService := services.NewClaimService(claimRepo, caseRepo, siseOrchestrator)

	// Storage
	attachmentsDir := os.Getenv("ATTACHMENTS_DIR")
	if attachmentsDir == "" {
		attachmentsDir = "./data/attachments"
	}
	fileStore, err := storage.NewLocalStore(attachmentsDir)
	if err != nil {
		log.Fatalf("Failed to init file storage: %v", err)
	}

	// Controllers
	authController       := controllers.NewAuthController(authService)
	caseController       := controllers.NewCaseController(caseService, claimService)
	claimController      := controllers.NewClaimController(claimService)
	attachmentController := controllers.NewAttachmentController(fileStore, caseRepo)

	e := router.InitRouter(cfg, authController, caseController, claimController, attachmentController)

	addr := fmt.Sprintf(":%s", cfg.Server.Port)

	go func() {
		if err := e.Start(addr); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	log.Printf("Server starting on port %s", cfg.Server.Port)
	log.Printf("Environment: %s", cfg.Server.Environment)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := e.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
