package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const siseTokenKey = "sise:token"

// SISETokenData is what we store in Redis for the SISE bearer token
type SISETokenData struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
}

// SetSISEToken caches the SISE bearer token with a TTL derived from expires_in
func SetSISEToken(token string, expiresIn int) error {
	c := GetClientFunc()
	if c == nil {
		return fmt.Errorf("redis client not available")
	}

	expiresAt := time.Now().Add(time.Duration(expiresIn) * time.Second)
	// Subtract 60s buffer so we never use an about-to-expire token
	ttl := time.Until(expiresAt) - 60*time.Second
	if ttl <= 0 {
		return fmt.Errorf("SISE token expires too soon to cache")
	}

	data, err := json.Marshal(SISETokenData{Token: token, ExpiresAt: expiresAt})
	if err != nil {
		return fmt.Errorf("marshal SISE token: %w", err)
	}

	return c.Set(context.Background(), siseTokenKey, data, ttl).Err()
}

// GetSISEToken retrieves the cached SISE token. Returns nil if absent or expired.
func GetSISEToken() (*SISETokenData, error) {
	c := GetClientFunc()
	if c == nil {
		return nil, fmt.Errorf("redis client not available")
	}

	val, err := c.Get(context.Background(), siseTokenKey).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get SISE token from redis: %w", err)
	}

	var td SISETokenData
	if err := json.Unmarshal([]byte(val), &td); err != nil {
		return nil, fmt.Errorf("unmarshal SISE token: %w", err)
	}

	if time.Now().After(td.ExpiresAt) {
		_ = c.Del(context.Background(), siseTokenKey).Err()
		return nil, nil
	}

	return &td, nil
}

// DeleteSISEToken removes the cached token (e.g. after a 401 from SISE)
func DeleteSISEToken() error {
	c := GetClientFunc()
	if c == nil {
		return fmt.Errorf("redis client not available")
	}
	return c.Del(context.Background(), siseTokenKey).Err()
}
