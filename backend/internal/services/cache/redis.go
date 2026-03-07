package cache

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

var client *redis.Client

// GetClientFunc is a variable to allow test injection
var GetClientFunc = func() *redis.Client {
	return client
}

// Connect initialises the Redis connection using a URL (e.g. redis://localhost:6379)
func Connect(redisURL string) (*redis.Client, error) {
	if client != nil {
		return client, nil
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	c := redis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := c.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	client = c
	return client, nil
}

// Close closes the Redis connection
func Close() error {
	if client == nil {
		return nil
	}
	return client.Close()
}
