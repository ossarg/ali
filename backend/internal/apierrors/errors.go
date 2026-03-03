package apierrors

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type APIError struct {
	Code    int    `json:"-"`
	Message string `json:"error"`
}

func (e *APIError) Error() string {
	return e.Message
}

func New(code int, message string) *APIError {
	return &APIError{Code: code, Message: message}
}

var (
	ErrUnauthorized     = New(http.StatusUnauthorized, "unauthorized")
	ErrInvalidCredentials = New(http.StatusUnauthorized, "invalid email or password")
	ErrForbidden        = New(http.StatusForbidden, "insufficient permissions")
	ErrNotFound         = New(http.StatusNotFound, "resource not found")
	ErrInternalServer   = New(http.StatusInternalServerError, "internal server error")
	ErrBadRequest       = New(http.StatusBadRequest, "bad request")
)

// Handler is the Echo custom HTTP error handler
func Handler(err error, c echo.Context) {
	if c.Response().Committed {
		return
	}

	var code int
	var message string

	switch e := err.(type) {
	case *APIError:
		code = e.Code
		message = e.Message
	case *echo.HTTPError:
		code = e.Code
		message = http.StatusText(e.Code)
	default:
		code = http.StatusInternalServerError
		message = "internal server error"
	}

	c.JSON(code, map[string]string{"error": message}) //nolint:errcheck
}
