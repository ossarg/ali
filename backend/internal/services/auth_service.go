package services

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/middleware"
	"github.com/ossarg/ali/backend/internal/repositories"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Login(req dto.LoginRequest) (*dto.LoginResponse, error)
}

type authService struct {
	userRepo  repositories.UserRepository
	jwtSecret string
}

func NewAuthService(userRepo repositories.UserRepository, jwtSecret string) AuthService {
	return &authService{userRepo: userRepo, jwtSecret: jwtSecret}
}

func (s *authService) Login(req dto.LoginRequest) (*dto.LoginResponse, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}
	if user == nil || !user.IsActive {
		return nil, apierrors.ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, apierrors.ErrInvalidCredentials
	}

	claims := middleware.Claims{
		UserID:       user.ID.String(),
		Email:        user.Email,
		Role:         user.Role.String(),
		Capabilities: user.Capabilities,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, apierrors.ErrInternalServer
	}

	return &dto.LoginResponse{
		Token: signed,
		User: dto.UserInfo{
			ID:           user.ID.String(),
			Email:        user.Email,
			FirstName:    user.FirstName,
			LastName:     user.LastName,
			Role:         user.Role.String(),
			Capabilities: user.Capabilities,
		},
	}, nil
}
