package di

import (
	"log"
	"os"

	"github.com/ossarg/ali/backend/internal/config"
	"github.com/ossarg/ali/backend/internal/controllers"
	"github.com/ossarg/ali/backend/internal/repositories"
	"github.com/ossarg/ali/backend/internal/services"
	"github.com/ossarg/ali/backend/internal/services/sise"
	"github.com/ossarg/ali/backend/internal/storage"
	"gorm.io/gorm"
)

// Container holds all wired dependencies.
type Container struct {
	Auth       *controllers.AuthController
	Case       *controllers.CaseController
	Claim      *controllers.ClaimController
	Attachment *controllers.AttachmentController
	Agreement  *controllers.AgreementController
}

// Build wires all repositories, services and controllers.
func Build(cfg *config.Config, db *gorm.DB) *Container {
	// ── Repositories ────────────────────────────────────────────────────────
	userRepo      := repositories.NewUserRepository(db)
	caseRepo      := repositories.NewCaseRepository(db)
	claimRepo     := repositories.NewClaimRepository(db)
	agreementRepo := repositories.NewAgreementRepository(db)

	// ── External clients ────────────────────────────────────────────────────
	siseClient       := sise.NewConsultasClient(cfg.SISE.BaseURL, cfg.SISE.Username, cfg.SISE.Password)
	siseOrchestrator := sise.NewConsultasOrchestrator(siseClient)

	// ── Services ────────────────────────────────────────────────────────────
	authService      := services.NewAuthService(userRepo, cfg.JWT.Secret)
	caseService      := services.NewCaseService(caseRepo, userRepo)
	claimService     := services.NewClaimService(claimRepo, caseRepo, siseOrchestrator)
	agreementService := services.NewAgreementService(agreementRepo)

	// ── Storage ─────────────────────────────────────────────────────────────
	attachmentsDir := os.Getenv("ATTACHMENTS_DIR")
	if attachmentsDir == "" {
		attachmentsDir = "./data/attachments"
	}
	fileStore, err := storage.NewLocalStore(attachmentsDir)
	if err != nil {
		log.Fatalf("di: failed to init file storage: %v", err)
	}

	// ── Controllers ─────────────────────────────────────────────────────────
	return &Container{
		Auth:       controllers.NewAuthController(authService),
		Case:       controllers.NewCaseController(caseService, claimService, agreementService),
		Claim:      controllers.NewClaimController(claimService),
		Attachment: controllers.NewAttachmentController(fileStore, caseRepo),
		Agreement:  controllers.NewAgreementController(agreementService),
	}
}
