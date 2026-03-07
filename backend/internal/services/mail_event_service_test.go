package services

import (
	"testing"
	"time"

	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// --- Mock ---

type mockMailEventRepo struct {
	mock.Mock
}

func (m *mockMailEventRepo) Create(e *models.MailEvent) error {
	args := m.Called(e)
	return args.Error(0)
}

func (m *mockMailEventRepo) ExistsByMailID(mailID string) (bool, error) {
	args := m.Called(mailID)
	return args.Bool(0), args.Error(1)
}

// --- Tests ---

func TestMailEventService_Create_Success(t *testing.T) {
	repo := new(mockMailEventRepo)
	svc := NewMailEventService(repo)

	req := dto.CreateMailEventRequest{
		MailID:     "gmail-abc123",
		Subject:    "Sentencia caso García",
		MailType:   1,
		Confidence: 0.95,
		Reasoning:  "El asunto menciona sentencia explícitamente.",
		ReceivedAt: time.Now(),
	}

	repo.On("ExistsByMailID", "gmail-abc123").Return(false, nil)
	repo.On("Create", mock.AnythingOfType("*models.MailEvent")).Return(nil)

	resp, err := svc.Create(req)

	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.Equal(t, "sentencia", resp.MailType)
	assert.Equal(t, 0.95, resp.Confidence)
	assert.Equal(t, "gmail", resp.MailProvider)
	repo.AssertExpectations(t)
}

func TestMailEventService_Create_InvalidMailType(t *testing.T) {
	repo := new(mockMailEventRepo)
	svc := NewMailEventService(repo)

	req := dto.CreateMailEventRequest{
		MailID:     "gmail-abc123",
		MailType:   99,
		Confidence: 0.9,
		ReceivedAt: time.Now(),
	}

	resp, err := svc.Create(req)

	assert.Nil(t, resp)
	assert.Error(t, err)
	repo.AssertNotCalled(t, "Create")
}

func TestMailEventService_Create_DuplicateMailID(t *testing.T) {
	repo := new(mockMailEventRepo)
	svc := NewMailEventService(repo)

	req := dto.CreateMailEventRequest{
		MailID:     "gmail-duplicate",
		MailType:   2,
		Confidence: 0.8,
		ReceivedAt: time.Now(),
	}

	repo.On("ExistsByMailID", "gmail-duplicate").Return(true, nil)

	resp, err := svc.Create(req)

	assert.Nil(t, resp)
	assert.Error(t, err)
	repo.AssertNotCalled(t, "Create")
}

func TestMailEventService_Create_InvalidConfidence(t *testing.T) {
	repo := new(mockMailEventRepo)
	svc := NewMailEventService(repo)

	req := dto.CreateMailEventRequest{
		MailID:     "gmail-abc456",
		MailType:   3,
		Confidence: 1.5,
		ReceivedAt: time.Now(),
	}

	resp, err := svc.Create(req)

	assert.Nil(t, resp)
	assert.Error(t, err)
	repo.AssertNotCalled(t, "ExistsByMailID")
}
