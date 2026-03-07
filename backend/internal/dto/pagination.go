package dto

const DefaultPageLimit = 10

// PageParams holds validated pagination query params.
type PageParams struct {
	Page  int // 1-based
	Limit int
}

func (p PageParams) Offset() int {
	return (p.Page - 1) * p.Limit
}

// ParsePageParams extracts and validates page/limit from raw query strings.
func ParsePageParams(pageStr, limitStr string) PageParams {
	page  := 1
	limit := DefaultPageLimit

	if v := parseInt(pageStr);  v > 0              { page  = v }
	if v := parseInt(limitStr); v > 0 && v <= 100  { limit = v }

	return PageParams{Page: page, Limit: limit}
}

func parseInt(s string) int {
	n := 0
	for _, c := range s {
		if c < '0' || c > '9' { return 0 }
		n = n*10 + int(c-'0')
	}
	return n
}

// PaginatedCases is the paginated response for cases.
type PaginatedCases struct {
	Data  []CaseResponse `json:"data"`
	Total int64          `json:"total"`
	Page  int            `json:"page"`
	Limit int            `json:"limit"`
}

// PaginatedClaims is the paginated response for claims.
type PaginatedClaims struct {
	Data  []ClaimResponse `json:"data"`
	Total int64           `json:"total"`
	Page  int             `json:"page"`
	Limit int             `json:"limit"`
}

// PaginatedCaseEvents is the paginated response for case events.
type PaginatedCaseEvents struct {
	Data  []CaseEventResponse `json:"data"`
	Total int64               `json:"total"`
	Page  int                 `json:"page"`
	Limit int                 `json:"limit"`
}
