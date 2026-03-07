package dto

// ClaimMetrics — aggregated stats for the claims dashboard
type ClaimMetrics struct {
	Total      int64 `json:"total"`
	Open       int64 `json:"open"`       // ABIERTO (sise_status_id=4)
	Mediation  int64 `json:"mediation"`  // MEDIACION (sise_status_id=5)
	Lawsuit    int64 `json:"lawsuit"`    // JUICIO (sise_status_id=3)
}
