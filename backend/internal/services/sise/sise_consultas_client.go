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
	queryIDPolicySummary     = "8432bf12-373b-43bd-8b4b-5891653c738a"
	queryIDProductorByCode   = "097a813a-06d4-4a47-b66b-8ec596372d2d"
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

// PolicySummary represents the full summary of a policy from SISE
type PolicySummary struct {
	Sucursal                   string  `json:"Sucursal"`
	Ramo                       string  `json:"Ramo"`
	NumeroPoliza               float64 `json:"Numero_Poliza"`
	NumeroEndoso               float64 `json:"Numero_Endoso"`
	FechaEmision               string  `json:"Fecha_Emision"`
	VigenciaDesde              string  `json:"Vigencia_Desde"`
	VigenciaHasta              string  `json:"Vigencia_Hasta"`
	CodigoAsegurado            float64 `json:"Codido_Asegurado"` // typo is SISE's own
	Contratante                string  `json:"Contratante"`
	TipoDocumento              string  `json:"Tipo_Documento"`
	NumeroDocumento            string  `json:"Numero_Documento"`
	CodigoProductor            float64 `json:"Codigo_Productor"`
	NombreProductor            string  `json:"Nombre_o_Razon_Social_Productor"`
	TipoPoliza                 string  `json:"Tipo_de_Poliza"`
	Moneda                     string  `json:"Moneda"`
	SumaAsegurada              float64 `json:"Suma_Asegurada"`
	Prima                      float64 `json:"Prima"`
	Premio                     float64 `json:"Premio"`
	IdPV                       float64 `json:"Id_pv"`
	CodigoSucursal             float64 `json:"Codigo_Sucursal"`
	CodigoRamo                 float64 `json:"Codigo_Ramo"`
	CantItems                  float64 `json:"cant_items"`
	CantidadSiniestros         float64 `json:"cantidad_siniestros"`
	Estado                     string  `json:"Estado"`
	CodProductoCom             float64 `json:"cod_producto_com"`
	ProductoComercial          string  `json:"Producto_comercial"`
	Conducto                   string  `json:"conducto"`
	TipoConducto               string  `json:"tipo_conducto"`
	TarjetaCBU                 string  `json:"tarjeta_cbu"`
	TelefonoTomador            string  `json:"telefono_tomador"`
	Autoadministrada           float64 `json:"Autoadministrada"`
}

// Productor represents an insurance agent/producer from SISE
type Productor struct {
	CodAgente     float64 `json:"cod_agente"`
	CodTipoAgente float64 `json:"cod_tipo_agente"`
	CodGrupo      float64 `json:"cod_grupo"`
	CodEstado     string  `json:"cod_estado"`
	CodBaja       float64 `json:"cod_baja"`
	FecBaja       *string `json:"fec_baja"`
	Nombre        string  `json:"nombre"`
	TipoAgente    string  `json:"tipo_agente"`
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

// GetPolicySummary retrieves full policy details from SISE by id_pv.
// id_pv is obtained from the Siniestro response (field IDPV).
func (c *ConsultasClient) GetPolicySummary(bearerToken string, idPV int64) (*PolicySummary, error) {
	req := QueryRequest{
		QueryID: queryIDPolicySummary,
		Parameters: []QueryParameter{
			{
				Name:               "id_pv",
				Type:               "int",
				Label:              "",
				Value:              idPV,
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

	return parsePolicySummary(resp.Result.Result[0]), nil
}

// GetProductorByCodigo retrieves producer/agent info from SISE by cod_agente.
func (c *ConsultasClient) GetProductorByCodigo(bearerToken string, codAgente int) (*Productor, error) {
	req := QueryRequest{
		QueryID:    queryIDProductorByCode,
		Parameters: []QueryParameter{},
		Filters: []QueryFilter{
			{
				ID:                 "ad30c0c6-8294-41e5-82be-394270d9b232",
				Field:              "cod_agente",
				Type:               "int32",
				Operator:           "equal",
				Value:              codAgente,
				RequireOnExecution: false,
				HiddenOnExecution:  false,
				FixedOnExecution:   false,
			},
		},
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

	return parseProductor(resp.Result.Result[0]), nil
}

// parseProductor maps a raw SISE row to a Productor struct.
func parseProductor(item map[string]interface{}) *Productor {
	p := &Productor{}
	if v, ok := item["cod_agente"].(float64); ok {
		p.CodAgente = v
	}
	if v, ok := item["cod_tipo_agente"].(float64); ok {
		p.CodTipoAgente = v
	}
	if v, ok := item["cod_grupo"].(float64); ok {
		p.CodGrupo = v
	}
	if v, ok := item["cod_estado"].(string); ok {
		p.CodEstado = v
	}
	if v, ok := item["cod_baja"].(float64); ok {
		p.CodBaja = v
	}
	if v, ok := item["fec_baja"].(string); ok {
		p.FecBaja = &v
	}
	if v, ok := item["nombre"].(string); ok {
		p.Nombre = v
	}
	if v, ok := item["tipo_agente"].(string); ok {
		p.TipoAgente = v
	}
	return p
}

// parsePolicySummary maps a raw SISE row to a PolicySummary struct.
func parsePolicySummary(item map[string]interface{}) *PolicySummary {
	p := &PolicySummary{}
	str := func(key string) string {
		v, _ := item[key].(string)
		return v
	}
	f64 := func(key string) float64 {
		v, _ := item[key].(float64)
		return v
	}
	p.Sucursal = str("Sucursal")
	p.Ramo = str("Ramo")
	p.NumeroPoliza = f64("Numero_Poliza")
	p.NumeroEndoso = f64("Numero_Endoso")
	p.FechaEmision = str("Fecha_Emision")
	p.VigenciaDesde = str("Vigencia_Desde")
	p.VigenciaHasta = str("Vigencia_Hasta")
	p.CodigoAsegurado = f64("Codido_Asegurado")
	p.Contratante = str("Contratante")
	p.TipoDocumento = str("Tipo_Documento")
	p.NumeroDocumento = str("Numero_Documento")
	p.CodigoProductor = f64("Codigo_Productor")
	p.NombreProductor = str("Nombre_o_Razon_Social_Productor")
	p.TipoPoliza = str("Tipo_de_Poliza")
	p.Moneda = str("Moneda")
	p.SumaAsegurada = f64("Suma_Asegurada")
	p.Prima = f64("Prima")
	p.Premio = f64("Premio")
	p.IdPV = f64("Id_pv")
	p.CodigoSucursal = f64("Codigo_Sucursal")
	p.CodigoRamo = f64("Codigo_Ramo")
	p.CantItems = f64("cant_items")
	p.CantidadSiniestros = f64("cantidad_siniestros")
	p.Estado = str("Estado")
	p.CodProductoCom = f64("cod_producto_com")
	p.ProductoComercial = str("Producto_comercial")
	p.Conducto = str("conducto")
	p.TipoConducto = str("tipo_conducto")
	p.TarjetaCBU = str("tarjeta_cbu")
	p.TelefonoTomador = str("telefono_tomador")
	p.Autoadministrada = f64("Autoadministrada")
	return p
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
