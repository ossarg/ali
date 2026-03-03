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
	"github.com/ossarg/ali/backend/internal/database"
	"github.com/ossarg/ali/backend/internal/router"
)

func main() {
	_ = godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	if _, err := database.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	e := router.InitRouter(cfg)

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
