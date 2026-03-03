package database

import (
	"fmt"
	"log"

	"github.com/ossarg/ali/backend/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var db *gorm.DB

func Connect() (*gorm.DB, error) {
	if db != nil {
		return db, nil
	}

	cfg := config.Get()

	logLevel := logger.Silent
	if cfg.Server.Environment == "development" {
		logLevel = logger.Info
	}

	var err error
	db, err = gorm.Open(postgres.Open(cfg.Database.URL), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetMaxIdleConns(5)

	log.Println("Database connected successfully")
	return db, nil
}

func DB() *gorm.DB {
	if db == nil {
		panic("database not connected, call Connect() first")
	}
	return db
}
