package models

import (
	"database/sql/driver"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// StringArray handles PostgreSQL TEXT[] <-> []string conversion
type StringArray []string

func (s StringArray) Value() (driver.Value, error) {
	if s == nil {
		return "{}", nil
	}
	quoted := make([]string, len(s))
	for i, v := range s {
		quoted[i] = `"` + strings.ReplaceAll(v, `"`, `\"`) + `"`
	}
	return "{" + strings.Join(quoted, ",") + "}", nil
}

func (s *StringArray) Scan(value interface{}) error {
	if value == nil {
		*s = []string{}
		return nil
	}
	str, ok := value.(string)
	if !ok {
		return fmt.Errorf("StringArray: expected string, got %T", value)
	}
	str = strings.TrimPrefix(str, "{")
	str = strings.TrimSuffix(str, "}")
	if str == "" {
		*s = []string{}
		return nil
	}
	parts := strings.Split(str, ",")
	result := make([]string, len(parts))
	for i, p := range parts {
		p = strings.TrimSpace(p)
		p = strings.Trim(p, `"`)
		result[i] = p
	}
	*s = result
	return nil
}

type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Email        string         `gorm:"uniqueIndex;not null"                           json:"email"`
	Password     string         `gorm:"not null"                                       json:"-"`
	FirstName    string         `gorm:"not null"                                       json:"first_name"`
	LastName     string         `gorm:"not null"                                       json:"last_name"`
	Role         Role           `gorm:"not null"                                       json:"role"`
	Capabilities StringArray    `gorm:"type:text[]"                                    json:"capabilities"`
	IsActive     bool           `gorm:"default:true"                                   json:"is_active"`
	CreatedAt    time.Time      `                                                      json:"created_at"`
	UpdatedAt    time.Time      `                                                      json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index"                                          json:"-"`
}
