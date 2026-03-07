// Package sise provides a client for the SISE Consultas API.
// This is the read-only query client (sise-consultas-client).
// A separate sise-operations-client will be added in the future.
package sise

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// Query IDs — UUIDs registered in SISE for each specific query
const (
	queryIDSiniestroByNumber = "3618d606-243f-4ce7-bf95-1c2bdc7fcbe8"
	// TODO: add more query IDs as needed
)

// ─── DTOs ─────────────────────────────────────────────────────────────────────

// TokenResponse is the response from the SISE /token endpoint
type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	UserName    string `json:"userName"`
	Issued      string `json:".issued"`
	Expires     string `json:".expires"`
}

// QueryRequest is the payload for POST /api/query/execute
type QueryRequest struct {
	QueryID    string           `json:"queryId"`
	Parameters []QueryParameter `json:"parameters"`
	Filters    []QueryFilter    `json:"filters"`
	Complete   bool             `json:"complete"`
	IsLink     bool             `json:"isLink"`
}

// QueryParameter represents a named parameter in a SISE query
type QueryParameter struct {
	Name               string      `json:"name"`
	Type               string      `json:"type"`
	Label              string      `json:"label,omitempty"`
	Value              interface{} `json:"value"`
	RequireOnExecution bool        `json:"requireOnExecution"`
	HiddenOnExecution  bool        `json:"hiddenOnExecution"`
}

// QueryFilter represents a filter condition in a SISE query
type QueryFilter struct {
	ID                 string      `json:"id"`
	Field              string      `json:"field"`
	Type               string      `json:"type"`
	Operator           string      `json:"operator"`
	Value              interface{} `json:"value"`
	RequireOnExecution bool        `json:"requireOnExecution"`
	HiddenOnExecution  bool        `json:"hiddenOnExecution"`
	FixedOnExecution   bool        `json:"fixedOnExecution"`
}

// QueryResponse is the envelope returned by SISE query execute
type QueryResponse struct {
	Result QueryResult `json:"result"`
}

// QueryResult contains the actual rows and schema
type QueryResult struct {
	IsReport     bool                     `json:"isReport"`
	Result       []map[string]interface{} `json:"result"`
	Schema       []SchemaField            `json:"schema"`
	LatestUpdate string                   `json:"latestUpdate"`
}

// SchemaField describes a column in the query result
type SchemaField struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
}

// Siniestro represents a claim returned by SISE
type Siniestro struct {
	NroSiniestro  string  `json:"nro_siniestro"`
	NroPoliza     string  `json:"nro_poliza"`
	FechaSiniestro string `json:"fecha_siniestro"`
	Ramo          string  `json:"ramo"`
	Estado        string  `json:"estado"`
	Asegurado     string  `json:"asegurado"`
	NroDocumento  string  `json:"nro_documento"`
	Descripcion   string  `json:"descripcion"`
	MontoReserva  float64 `json:"monto_reserva"`
}

// ─── Client ───────────────────────────────────────────────────────────────────

// ConsultasClient handles read-only queries against the SISE Consultas API.
// Token management is delegated to the orchestrator via GetToken/executeQuery.
type ConsultasClient struct {
	baseURL    string
	username   string
	password   string
	httpClient *http.Client
}

// NewConsultasClient creates a new SISE Consultas client
func NewConsultasClient(baseURL, username, password string) *ConsultasClient {
	return &ConsultasClient{
		baseURL:  baseURL,
		username: username,
		password: password,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GetToken obtains a fresh bearer token from SISE via OAuth2 password grant
func (c *ConsultasClient) GetToken() (*TokenResponse, error) {
	data := url.Values{}
	data.Set("grant_type", "password")
	data.Set("username", c.username)
	data.Set("password", c.password)

	req, err := http.NewRequest(http.MethodPost, c.baseURL+"/token", bytes.NewBufferString(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("build token request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("execute token request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("SISE token failed (%d): %s", resp.StatusCode, body)
	}

	var token TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		return nil, fmt.Errorf("decode token response: %w", err)
	}
	return &token, nil
}

// executeQuery sends a query to SISE and returns the raw response
func (c *ConsultasClient) executeQuery(bearerToken string, req QueryRequest) (*QueryResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("marshal query request: %w", err)
	}

	httpReq, err := http.NewRequest(http.MethodPost, c.baseURL+"/api/query/execute", bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("build query request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+bearerToken)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("execute query: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("SISE query failed (%d): %s", resp.StatusCode, b)
	}

	var qr QueryResponse
	if err := json.NewDecoder(resp.Body).Decode(&qr); err != nil {
		return nil, fmt.Errorf("decode query response: %w", err)
	}
	return &qr, nil
}

// ─── Domain methods ───────────────────────────────────────────────────────────

// GetSiniestroByNumber retrieves a claim from SISE by its claim number.
// TODO: add query filters once Nacho shares the filter spec for queryID 3618d606-243f-4ce7-bf95-1c2bdc7fcbe8
func (c *ConsultasClient) GetSiniestroByNumber(bearerToken, nroSiniestro string) (*Siniestro, error) {
	req := QueryRequest{
		QueryID: queryIDSiniestroByNumber,
		Parameters: []QueryParameter{
			// TODO: confirm parameter name and type with Nacho
			{
				Name:               "nro_siniestro",
				Type:               "string",
				Value:              nroSiniestro,
				RequireOnExecution: true,
				HiddenOnExecution:  false,
			},
		},
		Filters:  []QueryFilter{},
		Complete: false,
		IsLink:   false,
	}

	resp, err := c.executeQuery(bearerToken, req)
	if err != nil {
		return nil, err
	}
	if len(resp.Result.Result) == 0 {
		return nil, nil // not found
	}

	return parseSiniestro(resp.Result.Result[0]), nil
}

// parseSiniestro maps a raw SISE row to a Siniestro struct.
// Field names are placeholders — update once Nacho shares the actual schema.
func parseSiniestro(item map[string]interface{}) *Siniestro {
	s := &Siniestro{}
	if v, ok := item["nro_siniestro"].(string); ok {
		s.NroSiniestro = v
	}
	if v, ok := item["nro_poliza"].(string); ok {
		s.NroPoliza = v
	}
	if v, ok := item["fecha_siniestro"].(string); ok {
		s.FechaSiniestro = v
	}
	if v, ok := item["ramo"].(string); ok {
		s.Ramo = v
	}
	if v, ok := item["estado"].(string); ok {
		s.Estado = v
	}
	if v, ok := item["asegurado"].(string); ok {
		s.Asegurado = v
	}
	if v, ok := item["nro_documento"].(string); ok {
		s.NroDocumento = v
	}
	if v, ok := item["descripcion"].(string); ok {
		s.Descripcion = v
	}
	if v, ok := item["monto_reserva"].(float64); ok {
		s.MontoReserva = v
	}
	return s
}
