package controllers

import (
	"encoding/json"
	"fmt"
	"mime"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/ossarg/ali/backend/internal/apierrors"
	"github.com/ossarg/ali/backend/internal/models"
	"github.com/ossarg/ali/backend/internal/repositories"
	"github.com/ossarg/ali/backend/internal/storage"
)

// Allowed MIME types (PDFs and Office docs only).
var allowedMimes = map[string]bool{
	"application/pdf": true,
	"application/msword": true,
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
	"application/vnd.ms-excel": true,
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
	"application/vnd.ms-powerpoint": true,
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": true,
}

type AttachmentController struct {
	store    storage.FileStore
	caseRepo repositories.CaseRepository
}

func NewAttachmentController(store storage.FileStore, repo repositories.CaseRepository) *AttachmentController {
	return &AttachmentController{store: store, caseRepo: repo}
}

// Upload godoc
// @Summary      Upload attachment for a case event
// @Description  Accepts a single file (PDF or Office doc). Stores it and appends metadata to the event's attachments JSONB.
// @Tags         attachments
// @Accept       multipart/form-data
// @Produce      json
// @Param        event_id  formData  string  true  "Case event UUID"
// @Param        file      formData  file    true  "File to upload"
// @Success      201  {object}  map[string]any
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /api/v1/agents/attachments [post]
func (ac *AttachmentController) Upload(c echo.Context) error {
	eventID := c.FormValue("event_id")
	if eventID == "" {
		return apierrors.New(http.StatusBadRequest, "event_id is required")
	}

	event, err := ac.caseRepo.FindEventByID(eventID)
	if err != nil || event == nil {
		return apierrors.ErrNotFound
	}

	fh, err := c.FormFile("file")
	if err != nil {
		return apierrors.New(http.StatusBadRequest, "file is required")
	}

	// Detect MIME
	detectedMime := fh.Header.Get("Content-Type")
	if detectedMime == "" {
		detectedMime = mime.TypeByExtension(filepath.Ext(fh.Filename))
	}
	// Strip params (e.g. "application/pdf; charset=utf-8")
	mimeType, _, _ := mime.ParseMediaType(detectedMime)
	if !allowedMimes[mimeType] {
		return apierrors.New(http.StatusBadRequest, fmt.Sprintf("tipo de archivo no permitido: %s", mimeType))
	}

	// Build storage key: {event_id}/{uuid}.{ext}
	ext := strings.ToLower(filepath.Ext(fh.Filename))
	key := fmt.Sprintf("%s/%s%s", eventID, uuid.New().String(), ext)

	src, err := fh.Open()
	if err != nil {
		return apierrors.ErrInternalServer
	}
	defer src.Close()

	if err := ac.store.Save(key, src); err != nil {
		return apierrors.ErrInternalServer
	}

	// Append to event's attachments JSONB
	existing, _ := models.AttachmentsFromJSON(event.Attachments)
	existing = append(existing, models.AttachmentMeta{
		Name: fh.Filename,
		Key:  key,
		Mime: mimeType,
		Size: fh.Size,
	})
	updated, err := models.AttachmentsToJSON(existing)
	if err != nil {
		return apierrors.ErrInternalServer
	}
	event.Attachments = updated
	if err := ac.caseRepo.UpdateEvent(event); err != nil {
		return apierrors.ErrInternalServer
	}

	return c.JSON(http.StatusCreated, map[string]any{
		"key":  key,
		"name": fh.Filename,
		"mime": mimeType,
		"size": fh.Size,
	})
}

// Serve godoc
// @Summary      Download an attachment
// @Description  Streams the stored file by its key.
// @Tags         attachments
// @Produce      application/octet-stream
// @Param        key  path  string  true  "Storage key (URL encoded)"
// @Success      200
// @Failure      404  {object}  map[string]string
// @Router       /api/v1/attachments/{key} [get]
func (ac *AttachmentController) Serve(c echo.Context) error {
	// key is everything after /api/v1/attachments/
	key := c.Param("*")
	if key == "" {
		return apierrors.ErrNotFound
	}

	f, err := ac.store.Open(key)
	if err != nil {
		return apierrors.ErrNotFound
	}
	defer f.Close()

	// Guess content type from extension
	ext := strings.ToLower(filepath.Ext(key))
	ct := mime.TypeByExtension(ext)
	if ct == "" {
		ct = "application/octet-stream"
	}

	// Inline for PDFs, attachment for everything else
	disposition := "attachment"
	if ext == ".pdf" {
		disposition = "inline"
	}

	name := filepath.Base(key)
	c.Response().Header().Set("Content-Disposition", fmt.Sprintf(`%s; filename="%s"`, disposition, name))
	return c.Stream(http.StatusOK, ct, f)
}

// ListByEvent returns attachment metadata for a specific case event.
func (ac *AttachmentController) ListByEvent(c echo.Context) error {
	eventID := c.Param("id")
	event, err := ac.caseRepo.FindEventByID(eventID)
	if err != nil || event == nil {
		return apierrors.ErrNotFound
	}

	var metas []models.AttachmentMeta
	if len(event.Attachments) > 0 {
		_ = json.Unmarshal(event.Attachments, &metas)
	}
	if metas == nil {
		metas = []models.AttachmentMeta{}
	}
	return c.JSON(http.StatusOK, metas)
}
