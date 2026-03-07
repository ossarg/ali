package models

type Role int16

const (
	RoleAbogado Role = 1
	RoleGerente Role = 2
	RoleAdmin   Role = 3
)

var roleNames = map[Role]string{
	RoleAbogado: "abogado",
	RoleGerente: "gerente",
	RoleAdmin:   "admin",
}

// DefaultCapabilities returns the base capabilities for a given role
var DefaultCapabilities = map[Role][]string{
	RoleAbogado: {"cases:read"},
	RoleGerente: {"cases:read", "cases:write", "triage:config"},
	RoleAdmin:   {"cases:read", "cases:write", "triage:config", "users:manage"},
}

func (r Role) String() string {
	if name, ok := roleNames[r]; ok {
		return name
	}
	return "unknown"
}

func (r Role) IsValid() bool {
	_, ok := roleNames[r]
	return ok
}
