package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	CORS     CORSConfig
	Redis    RedisConfig
	SISE     SISEConfig
	AgentKey string
}

type RedisConfig struct {
	URL string
}

type SISEConfig struct {
	BaseURL  string
	Username string
	Password string
}

type ServerConfig struct {
	Port        string
	Environment string
}

type DatabaseConfig struct {
	URL string
}

type JWTConfig struct {
	Secret string
}

type CORSConfig struct {
	AllowedOrigins []string
}

var cfg *Config

func Load() (*Config, error) {
	if cfg != nil {
		return cfg, nil
	}

	viper.SetConfigName(".env")
	viper.SetConfigType("env")
	viper.AddConfigPath(".")
	viper.AutomaticEnv()

	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("ENVIRONMENT", "development")
	viper.SetDefault("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
	viper.SetDefault("AGENT_KEY", "")
	viper.SetDefault("REDIS_URL", "redis://localhost:6379")
	viper.SetDefault("SISE_BASE_URL", "https://sise-consultas.libraseguros.com.ar/Sise3GBELibraCoreprodConsultas")
	viper.SetDefault("SISE_USERNAME", "")
	viper.SetDefault("SISE_PASSWORD", "")

	_ = viper.ReadInConfig()

	cfg = &Config{
		Server: ServerConfig{
			Port:        viper.GetString("SERVER_PORT"),
			Environment: viper.GetString("ENVIRONMENT"),
		},
		Database: DatabaseConfig{
			URL: viper.GetString("DATABASE_URL"),
		},
		JWT: JWTConfig{
			Secret: viper.GetString("JWT_SECRET"),
		},
		CORS: CORSConfig{
			AllowedOrigins: parseCORSOrigins(viper.GetString("CORS_ALLOWED_ORIGINS")),
		},
		Redis: RedisConfig{
			URL: viper.GetString("REDIS_URL"),
		},
		SISE: SISEConfig{
			BaseURL:  viper.GetString("SISE_BASE_URL"),
			Username: viper.GetString("SISE_USERNAME"),
			Password: viper.GetString("SISE_PASSWORD"),
		},
		AgentKey: viper.GetString("AGENT_KEY"),
	}

	if err := cfg.validate(); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	return cfg, nil
}

func Get() *Config {
	if cfg == nil {
		panic("config not loaded, call Load() first")
	}
	return cfg
}

func Reset() {
	cfg = nil
}

// parseCORSOrigins splits a comma-separated origins string into a slice.
// viper.GetStringSlice does not reliably split env vars by comma.
func parseCORSOrigins(raw string) []string {
	var origins []string
	for _, o := range strings.Split(raw, ",") {
		o = strings.TrimSpace(o)
		if o != "" {
			origins = append(origins, o)
		}
	}
	return origins
}

func (c *Config) validate() error {
	if c.Database.URL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}
	if c.JWT.Secret == "" {
		return fmt.Errorf("JWT_SECRET is required")
	}
	if c.AgentKey == "" {
		return fmt.Errorf("AGENT_KEY is required")
	}
	return nil
}
