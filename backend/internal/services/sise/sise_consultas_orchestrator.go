package sise

import (
	"fmt"

	"github.com/ossarg/ali/backend/internal/services/cache"
)

// ConsultasOrchestrator wraps ConsultasClient and handles token lifecycle:
// - Fetches a fresh token if none is cached
// - Caches the token in Redis with its natural TTL
// - Retries once on 401 (invalidates cache and re-authenticates)
type ConsultasOrchestrator struct {
	client *ConsultasClient
}

// NewConsultasOrchestrator creates a new orchestrator
func NewConsultasOrchestrator(client *ConsultasClient) *ConsultasOrchestrator {
	return &ConsultasOrchestrator{client: client}
}

// getToken returns a valid bearer token, using the Redis cache when available
func (o *ConsultasOrchestrator) getToken() (string, error) {
	// 1. Try cache first
	cached, err := cache.GetSISEToken()
	if err != nil {
		// Cache error is non-fatal — fall through to a fresh auth
		_ = err
	}
	if cached != nil {
		return cached.Token, nil
	}

	// 2. No cached token — authenticate
	return o.refreshToken()
}

// refreshToken fetches a fresh token from SISE and caches it
func (o *ConsultasOrchestrator) refreshToken() (string, error) {
	tokenResp, err := o.client.GetToken()
	if err != nil {
		return "", fmt.Errorf("SISE auth failed: %w", err)
	}

	if err := cache.SetSISEToken(tokenResp.AccessToken, tokenResp.ExpiresIn); err != nil {
		// Non-fatal: we still have the token, just won't be cached
		_ = err
	}

	return tokenResp.AccessToken, nil
}

// ─── Public domain methods ────────────────────────────────────────────────────

// GetSiniestroByNumber looks up a siniestro in SISE by its claim number.
// Automatically handles token refresh on expiry.
func (o *ConsultasOrchestrator) GetSiniestroByNumber(nroSiniestro string) (*Siniestro, error) {
	token, err := o.getToken()
	if err != nil {
		return nil, err
	}

	result, err := o.client.GetSiniestroByNumber(token, nroSiniestro)
	if err != nil {
		// On auth failure, invalidate cache and retry once
		_ = cache.DeleteSISEToken()
		token, err = o.refreshToken()
		if err != nil {
			return nil, err
		}
		result, err = o.client.GetSiniestroByNumber(token, nroSiniestro)
		if err != nil {
			return nil, err
		}
	}

	return result, nil
}
