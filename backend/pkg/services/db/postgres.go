package db

import (
	"log"

	"github.com/Libra-Seguros/libra-legal/pkg/app/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func Connect() (*gorm.DB, error) {
	if db != nil {
		return db, nil
	}

	cfg := config.Get()

	var err error
	db, err = gorm.Open(postgres.Open(cfg.Database.URL), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	log.Println("✅ PostgreSQL connected")
	return db, nil
}

func DB() *gorm.DB {
	if db == nil {
		panic("database not connected, call Connect() first")
	}
	return db
}
