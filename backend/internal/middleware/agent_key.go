package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/ossarg/ali/backend/internal/config"
)

// AgentKeyMiddleware protects agent-facing endpoints with a shared secret.
// Agents send: X-Agent-Key: <key>
func AgentKeyMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			key := c.Request().Header.Get("X-Agent-Key")
			if key == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{
					"error": "missing X-Agent-Key header",
				})
			}

			cfg := config.Get()
			if key != cfg.AgentKey {
				return c.JSON(http.StatusUnauthorized, map[string]string{
					"error": "invalid agent key",
				})
			}

			return next(c)
		}
	}
}
