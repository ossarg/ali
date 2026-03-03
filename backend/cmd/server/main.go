package main

import (
	"log"

	"github.com/Libra-Seguros/libra-legal/pkg/app/config"
	"github.com/Libra-Seguros/libra-legal/pkg/app/router"
	"github.com/Libra-Seguros/libra-legal/pkg/services/cache"
	"github.com/Libra-Seguros/libra-legal/pkg/services/db"
)

// @title           Libra Legal AI API
// @version         1.0
// @description     Backend del sistema de gestión de litigios de Libra Seguros
// @host            localhost:8080
// @BasePath        /api/v1
func main() {
	// Config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Config error: %v", err)
	}

	// PostgreSQL
	if _, err := db.Connect(); err != nil {
		log.Fatalf("❌ DB error: %v", err)
	}

	// Redis
	if _, err := cache.Connect(); err != nil {
		log.Printf("⚠️  Redis no disponible: %v (continuando sin cache)", err)
	}

	// Router
	e := router.InitRouter()

	log.Printf("🚀 Libra Legal API corriendo en :%s", cfg.Server.Port)
	e.Logger.Fatal(e.Start(":" + cfg.Server.Port))
}
