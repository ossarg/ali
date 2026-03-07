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
	IDStro             int64   `json:"id_stro"`
	IDPV               int64   `json:"id_pv"`
	NroSiniestro       int64   `json:"nro_siniestro"`
	NroSubreclamo      int64   `json:"nro_subreclamo"`
	NroPoliza          float64 `json:"nro_poliza"`
	NroEndoso          float64 `json:"nro_endoso"`
	CodigoRamo         float64 `json:"codigo_ramo"`
	FechaRegistro      string  `json:"fecha_resgistro"` // typo is SISE's own
	FechaAviso         string  `json:"fecha_aviso"`
	FechaIncurrido     string  `json:"fecha_incurrido"`
	FechaPago          *string `json:"fecha_pago"`
	ContratantePagador string  `json:"contratante_pagador"`
	Titular            string  `json:"titular"`
	Paciente           string  `json:"paciente"`
	Parentesco         *string `json:"parentesco"`
	ImporteEstimado    float64 `json:"importe_estimado"`
	ImportePago        float64 `json:"importe_pago"`
	Diagnostico        string  `json:"diagnostico"`
	Causa              string  `json:"causa"`
	Cobertura          string  `json:"cobertura"`
	Estado             string  `json:"estado"`
	TomadorTipoDoc     string  `json:"tomador_tipo_doc"`
	TomadorDoc         string  `json:"tomador_doc"`
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

// GetSiniestroByNumber retrieves a claim from SISE by its claim number (nro_stro).
// codigoUsuario can be empty — SISE accepts it as optional.
func (c *ConsultasClient) GetSiniestroByNumber(bearerToken, nroSiniestro string) (*Siniestro, error) {
	req := QueryRequest{
		QueryID: queryIDSiniestroByNumber,
		Parameters: []QueryParameter{
			{
				Name:               "codigo_usuario",
				Type:               "string",
				Value:              "",
				RequireOnExecution: false,
				HiddenOnExecution:  false,
			},
			{
				Name:               "nro_stro",
				Type:               "string",
				Value:              nroSiniestro,
				RequireOnExecution: false,
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
func parseSiniestro(item map[string]interface{}) *Siniestro {
	s := &Siniestro{}
	if v, ok := item["id_stro"].(float64); ok {
		s.IDStro = int64(v)
	}
	if v, ok := item["id_pv"].(float64); ok {
		s.IDPV = int64(v)
	}
	if v, ok := item["Nro_siniestro"].(float64); ok {
		s.NroSiniestro = int64(v)
	}
	if v, ok := item["nro_subreclamo"].(float64); ok {
		s.NroSubreclamo = int64(v)
	}
	if v, ok := item["nro_poliza"].(float64); ok {
		s.NroPoliza = v
	}
	if v, ok := item["nro_endoso"].(float64); ok {
		s.NroEndoso = v
	}
	if v, ok := item["codigo_ramo"].(float64); ok {
		s.CodigoRamo = v
	}
	if v, ok := item["fecha_resgistro"].(string); ok {
		s.FechaRegistro = v
	}
	if v, ok := item["fecha_aviso"].(string); ok {
		s.FechaAviso = v
	}
	if v, ok := item["fecha_incurrido"].(string); ok {
		s.FechaIncurrido = v
	}
	if v, ok := item["fecha_pago"].(string); ok {
		s.FechaPago = &v
	}
	if v, ok := item["contratante_pagador"].(string); ok {
		s.ContratantePagador = v
	}
	if v, ok := item["titular"].(string); ok {
		s.Titular = v
	}
	if v, ok := item["paciente"].(string); ok {
		s.Paciente = v
	}
	if v, ok := item["parentesco"].(string); ok {
		s.Parentesco = &v
	}
	if v, ok := item["importe_estimado"].(float64); ok {
		s.ImporteEstimado = v
	}
	if v, ok := item["importe_pago"].(float64); ok {
		s.ImportePago = v
	}
	if v, ok := item["diagnostico"].(string); ok {
		s.Diagnostico = v
	}
	if v, ok := item["causa"].(string); ok {
		s.Causa = v
	}
	if v, ok := item["cobertura"].(string); ok {
		s.Cobertura = v
	}
	if v, ok := item["estado"].(string); ok {
		s.Estado = v
	}
	if v, ok := item["tomador_tipo_doc"].(string); ok {
		s.TomadorTipoDoc = v
	}
	if v, ok := item["tomador_doc"].(string); ok {
		s.TomadorDoc = v
	}
	return s
}
