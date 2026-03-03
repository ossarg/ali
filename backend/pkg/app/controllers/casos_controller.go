package controllers

import (
	"net/http"

	"github.com/Libra-Seguros/libra-legal/pkg/app/services"
	"github.com/labstack/echo/v4"
)

type CasosController struct {
	casosService services.CasosService
}

func NewCasosController(casosService services.CasosService) *CasosController {
	return &CasosController{casosService: casosService}
}

// List godoc
// @Summary      Listar casos
// @Tags         casos
// @Produce      json
// @Param        search       query  string  false  "Buscar por carátula o nro_siniestro"
// @Param        relevancia   query  int     false  "Filtrar por relevancia (1=Baja, 2=Media, 3=Alta)"
// @Param        estado       query  string  false  "Filtrar por estado"
// @Param        limit        query  int     false  "Límite de resultados"
// @Param        offset       query  int     false  "Offset"
// @Success      200  {object}  services.CasosListResponse
// @Router       /api/v1/casos [get]
func (cc *CasosController) List(c echo.Context) error {
	filter := services.CasosFilter{
		Search:    c.QueryParam("search"),
		Relevancia: c.QueryParam("relevancia"),
		Estado:    c.QueryParam("estado"),
		Limit:     50,
		Offset:    0,
	}

	result, err := cc.casosService.List(filter)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "error fetching casos")
	}

	return c.JSON(http.StatusOK, result)
}

// GetByID godoc
// @Summary      Obtener caso por ID
// @Tags         casos
// @Produce      json
// @Param        id  path  int  true  "Caso ID"
// @Success      200  {object}  services.CasoDetail
// @Router       /api/v1/casos/{id} [get]
func (cc *CasosController) GetByID(c echo.Context) error {
	id := c.Param("id")

	caso, err := cc.casosService.GetByID(id)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "caso not found")
	}

	return c.JSON(http.StatusOK, caso)
}
