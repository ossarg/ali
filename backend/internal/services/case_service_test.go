package services

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/ossarg/ali/backend/internal/dto"
	"github.com/ossarg/ali/backend/internal/models"
	"github.com/ossarg/ali/backend/internal/repositories"
)

var testTime = time.Now()

// mockCaseRepository implements repositories.CaseRepository for tests
type mockCaseRepository struct {
	cases []models.Case
	one   *models.Case
	err   error
}

func (m *mockCaseRepository) List(_ repositories.CaseFilters) ([]models.Case, error) {
	return m.cases, m.err
}

func (m *mockCaseRepository) FindByID(_ string) (*models.Case, error) {
	return m.one, m.err
}

func (m *mockCaseRepository) Create(c *models.Case) error { return m.err }
func (m *mockCaseRepository) Update(c *models.Case) error { return m.err }
func (m *mockCaseRepository) Delete(_ string) error       { return m.err }

func (m *mockCaseRepository) CreateEvent(e *models.CaseEvent) error      { return m.err }
func (m *mockCaseRepository) UpdateEvent(e *models.CaseEvent) error      { return m.err }
func (m *mockCaseRepository) EventExistsByMailID(_ string) (bool, error)  { return false, m.err }
func (m *mockCaseRepository) FindEventByID(_ string) (*models.CaseEvent, error) {
	return nil, m.err
}
func (m *mockCaseRepository) ListPendingEvents() ([]models.CaseEvent, error) {
	return nil, m.err
}
func (m *mockCaseRepository) ListApprovedEvents() ([]models.CaseEvent, error)                          { return nil, m.err }
func (m *mockCaseRepository) ListApprovedEventsPaginated(_, _ int) ([]models.CaseEvent, int64, error)  { return nil, 0, m.err }
func (m *mockCaseRepository) ListUnresolvedEvents() ([]models.CaseEvent, error)                        { return nil, m.err }
func (m *mockCaseRepository) ListPendingResolutionEvents() ([]models.CaseEvent, error)                 { return nil, m.err }
func (m *mockCaseRepository) ListPaginated(_ repositories.CaseFilters, _, _ int) ([]models.Case, int64, error) { return nil, 0, m.err }
func (m *mockCaseRepository) GetByID(_ string) (*models.Case, error)                                  { return nil, m.err }
func (m *mockCaseRepository) ListEventsByCaseID(_ string) ([]models.CaseEvent, error)               { return nil, m.err }
func (m *mockCaseRepository) FindByClaim(_ string) (*models.Case, error)                              { return nil, m.err }
func (m *mockCaseRepository) GetEventMetrics() (int64, int64, int64, int64, *time.Time, error) {
	return 0, 0, 0, 0, nil, m.err
}

func sampleCase() models.Case {
	return models.Case{
		ID:            uuid.New(),
		Title:         "Rodríguez c/ Libra Seguros",
		CaseType:      models.CaseTypeLawsuit,
		Status:        models.CaseStatusOpen,
		PipelineStage: models.PipelineStageIngesta,
	}
}

// --- List ---

func TestCaseService_List_Empty(t *testing.T) {
	svc := NewCaseService(&mockCaseRepository{cases: []models.Case{}})
	result, err := svc.List(dto.ListCasesRequest{})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(result) != 0 {
		t.Errorf("expected 0 cases, got %d", len(result))
	}
}

func TestCaseService_List_ReturnsCases(t *testing.T) {
	cases := []models.Case{sampleCase(), sampleCase()}
	svc := NewCaseService(&mockCaseRepository{cases: cases})

	result, err := svc.List(dto.ListCasesRequest{})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(result) != 2 {
		t.Errorf("expected 2 cases, got %d", len(result))
	}
}

func TestCaseService_List_InvalidStatus(t *testing.T) {
	bad := int16(99)
	svc := NewCaseService(&mockCaseRepository{cases: []models.Case{}})
	_, err := svc.List(dto.ListCasesRequest{Status: &bad})
	if err == nil {
		t.Fatal("expected error for invalid status, got nil")
	}
}

func TestCaseService_List_InvalidCaseType(t *testing.T) {
	bad := int16(99)
	svc := NewCaseService(&mockCaseRepository{cases: []models.Case{}})
	_, err := svc.List(dto.ListCasesRequest{CaseType: &bad})
	if err == nil {
		t.Fatal("expected error for invalid case_type, got nil")
	}
}

// --- GetByID ---

func TestCaseService_GetByID_Found(t *testing.T) {
	c := sampleCase()
	svc := NewCaseService(&mockCaseRepository{one: &c})

	result, err := svc.GetByID(c.ID.String())
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if result.ID != c.ID {
		t.Errorf("expected id %s, got %s", c.ID, result.ID)
	}
}

func TestCaseService_GetByID_NotFound(t *testing.T) {
	svc := NewCaseService(&mockCaseRepository{one: nil})
	_, err := svc.GetByID(uuid.New().String())
	if err == nil {
		t.Fatal("expected ErrNotFound, got nil")
	}
}

func TestCaseService_GetByID_InvalidUUID(t *testing.T) {
	svc := NewCaseService(&mockCaseRepository{})
	_, err := svc.GetByID("not-a-uuid")
	if err == nil {
		t.Fatal("expected error for invalid UUID, got nil")
	}
}

func TestCaseService_CreateEvent_Success(t *testing.T) {
	svc := NewCaseService(&mockCaseRepository{})

	req := dto.CreateCaseEventRequest{
		MailID:         "gmail-abc123",
		Subject:        "Sentencia caso García",
		MailType:       1,
		Confidence:     0.95,
		Reasoning:      "El asunto menciona sentencia explícitamente.",
		RawClaimNumber: "SIN-2024-001",
		ReceivedAt:     testTime,
	}

	resp, err := svc.CreateEvent(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.MailType != "sentencia" {
		t.Errorf("expected mail_type=sentencia, got %s", resp.MailType)
	}
	if resp.MailProvider != "gmail" {
		t.Errorf("expected mail_provider=gmail, got %s", resp.MailProvider)
	}
}

func TestCaseService_CreateEvent_InvalidMailType(t *testing.T) {
	svc := NewCaseService(&mockCaseRepository{})

	req := dto.CreateCaseEventRequest{
		MailID:     "gmail-abc123",
		MailType:   99,
		Confidence: 0.9,
		ReceivedAt: testTime,
	}

	_, err := svc.CreateEvent(req)
	if err == nil {
		t.Fatal("expected error for invalid mail_type, got nil")
	}
}

func TestCaseService_CreateEvent_InvalidConfidence(t *testing.T) {
	svc := NewCaseService(&mockCaseRepository{})

	req := dto.CreateCaseEventRequest{
		MailID:     "gmail-abc456",
		MailType:   2,
		Confidence: 1.5,
		ReceivedAt: testTime,
	}

	_, err := svc.CreateEvent(req)
	if err == nil {
		t.Fatal("expected error for invalid confidence, got nil")
	}
}
