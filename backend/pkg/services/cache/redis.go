package cache

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/Libra-Seguros/libra-legal/pkg/app/config"
	"github.com/redis/go-redis/v9"
)

var redisClient *redis.Client
var ctx = context.Background()

func Connect() (*redis.Client, error) {
	if redisClient != nil {
		return redisClient, nil
	}

	cfg := config.Get()

	opt, err := redis.ParseURL(cfg.Redis.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	redisClient = redis.NewClient(opt)

	ctxTimeout, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := redisClient.Ping(ctxTimeout).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	log.Println("✅ Redis connected")
	return redisClient, nil
}

func GetClient() *redis.Client {
	if redisClient == nil {
		panic("Redis not connected, call Connect() first")
	}
	return redisClient
}

func Close() error {
	if redisClient == nil {
		return nil
	}
	return redisClient.Close()
}
