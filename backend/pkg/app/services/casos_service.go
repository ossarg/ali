package services

import (
	"github.com/Libra-Seguros/libra-legal/pkg/services/db"
)

type CasosFilter struct {
	Search     string
	Relevancia string
	Estado     string
	Limit      int
	Offset     int
}

type CasosListResponse struct {
	Data  []map[string]interface{} `json:"data"`
	Total int64                    `json:"total"`
}

type CasoDetail struct {
	Caso    map[string]interface{}   `json:"caso"`
	Eventos []map[string]interface{} `json:"eventos"`
	Alertas []map[string]interface{} `json:"alertas"`
	Triage  map[string]interface{}   `json:"triage"`
}

type CasosService interface {
	List(filter CasosFilter) (*CasosListResponse, error)
	GetByID(id string) (*CasoDetail, error)
}

type casosService struct{}

func NewCasosService() CasosService {
	return &casosService{}
}

func (s *casosService) List(filter CasosFilter) (*CasosListResponse, error) {
	database := db.DB()

	query := database.Table("casos c").
		Select(`c.*, est.nombre as estudio_nombre,
			t.relevancia as triage_relevancia,
			t.justificacion as triage_justificacion,
			t.confidence as triage_confidence,
			t.requiere_revision_humana,
			(SELECT COUNT(*) FROM alertas a WHERE a.caso_id = c.id AND a.estado != 'resuelta') as alertas_activas`).
		Joins("LEFT JOIN estudios est ON est.id = c.estudio_id").
		Joins("LEFT JOIN triage_results t ON t.caso_id = c.id")

	if filter.Search != "" {
		query = query.Where("c.caratula ILIKE ? OR c.nro_siniestro ILIKE ?",
			"%"+filter.Search+"%", "%"+filter.Search+"%")
	}
	if filter.Estado != "" {
		query = query.Where("c.estado_actual = ?", filter.Estado)
	}
	if filter.Relevancia != "" {
		query = query.Where("t.relevancia = ?", filter.Relevancia)
	}

	var total int64
	query.Count(&total)

	var rows []map[string]interface{}
	if err := query.Order("c.fecha_apertura DESC").
		Limit(filter.Limit).
		Offset(filter.Offset).
		Find(&rows).Error; err != nil {
		return nil, err
	}

	return &CasosListResponse{Data: rows, Total: total}, nil
}

func (s *casosService) GetByID(id string) (*CasoDetail, error) {
	database := db.DB()

	var caso map[string]interface{}
	if err := database.Table("casos c").
		Select("c.*, est.nombre as estudio_nombre").
		Joins("LEFT JOIN estudios est ON est.id = c.estudio_id").
		Where("c.id = ?", id).
		First(&caso).Error; err != nil {
		return nil, err
	}

	var eventos []map[string]interface{}
	database.Table("eventos").Where("caso_id = ?", id).
		Order("fecha_evento DESC").Find(&eventos)

	var alertas []map[string]interface{}
	database.Table("alertas").Where("caso_id = ? AND estado != 'resuelta'", id).
		Order("fecha_vencimiento ASC").Find(&alertas)

	var triage map[string]interface{}
	database.Table("triage_results").Where("caso_id = ?", id).
		Order("created_at DESC").First(&triage)

	return &CasoDetail{
		Caso:    caso,
		Eventos: eventos,
		Alertas: alertas,
		Triage:  triage,
	}, nil
}
