package middleware

import (
	"net/http"
	"strings"

	"github.com/Libra-Seguros/libra-legal/pkg/app/config"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type Role string

const (
	RoleAbogado Role = "abogado"
	RoleGerente Role = "gerente"
	RoleAdmin   Role = "admin"
)

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   Role   `json:"role"`
	jwt.RegisteredClaims
}

func AuthMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "missing authorization header")
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid authorization header format")
			}

			cfg := config.Get()
			token, err := jwt.ParseWithClaims(parts[1], &Claims{}, func(t *jwt.Token) (interface{}, error) {
				return []byte(cfg.JWT.Secret), nil
			})
			if err != nil || !token.Valid {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
			}

			claims := token.Claims.(*Claims)
			c.Set("user_id", claims.UserID)
			c.Set("email", claims.Email)
			c.Set("role", claims.Role)

			return next(c)
		}
	}
}

func RequireRole(roles ...Role) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			role, ok := c.Get("role").(Role)
			if !ok {
				return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
			}
			for _, r := range roles {
				if role == r {
					return next(c)
				}
			}
			return echo.NewHTTPError(http.StatusForbidden, "insufficient permissions")
		}
	}
}

func GetUserID(c echo.Context) string {
	id, _ := c.Get("user_id").(string)
	return id
}

func GetRole(c echo.Context) Role {
	role, _ := c.Get("role").(Role)
	return role
}
