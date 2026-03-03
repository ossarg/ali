package services

import (
	"testing"

	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// mockUserRepository implements repositories.UserRepository for tests
type mockUserRepository struct {
	user *models.User
	err  error
}

func (m *mockUserRepository) FindByEmail(email string) (*models.User, error) {
	return m.user, m.err
}

func (m *mockUserRepository) FindByID(id string) (*models.User, error) {
	return m.user, m.err
}

func hashedPassword(t *testing.T, plain string) string {
	t.Helper()
	hash, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.MinCost)
	if err != nil {
		t.Fatal(err)
	}
	return string(hash)
}

const testSecret = "test-secret-32-bytes-long-enough!!"

func TestLogin_Success(t *testing.T) {

	user := &models.User{
		ID:           uuid.New(),
		Email:        "admin@libraseguros.com.ar",
		Password:     hashedPassword(t, "libra2026"),
		FirstName:    "Admin",
		LastName:     "Libra",
		Role:         "admin",
		Capabilities: []string{"cases:read"},
		IsActive:     true,
	}

	svc := NewAuthService(&mockUserRepository{user: user}, testSecret)
	resp, err := svc.Login(dto.LoginRequest{Email: user.Email, Password: "libra2026"})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if resp.Token == "" {
		t.Fatal("expected token, got empty string")
	}
	if resp.User.Email != user.Email {
		t.Errorf("expected email %s, got %s", user.Email, resp.User.Email)
	}
}

func TestLogin_InvalidPassword(t *testing.T) {
	

	user := &models.User{
		ID:       uuid.New(),
		Email:    "admin@libraseguros.com.ar",
		Password: hashedPassword(t, "libra2026"),
		IsActive: true,
	}

	svc := NewAuthService(&mockUserRepository{user: user}, testSecret)
	_, err := svc.Login(dto.LoginRequest{Email: user.Email, Password: "wrong"})

	if err != apierrors.ErrInvalidCredentials {
		t.Errorf("expected ErrInvalidCredentials, got %v", err)
	}
}

func TestLogin_UserNotFound(t *testing.T) {
	

	svc := NewAuthService(&mockUserRepository{user: nil}, testSecret)
	_, err := svc.Login(dto.LoginRequest{Email: "noexist@test.com", Password: "pass"})

	if err != apierrors.ErrInvalidCredentials {
		t.Errorf("expected ErrInvalidCredentials, got %v", err)
	}
}

func TestLogin_InactiveUser(t *testing.T) {
	

	user := &models.User{
		ID:       uuid.New(),
		Email:    "inactive@libraseguros.com.ar",
		Password: hashedPassword(t, "libra2026"),
		IsActive: false,
	}

	svc := NewAuthService(&mockUserRepository{user: user}, testSecret)
	_, err := svc.Login(dto.LoginRequest{Email: user.Email, Password: "libra2026"})

	if err != apierrors.ErrInvalidCredentials {
		t.Errorf("expected ErrInvalidCredentials, got %v", err)
	}
}
