import { Router } from 'express'
import pool from '../db/client.js'

const router = Router()

// GET /api/casos — lista con filtros
router.get('/', async (req, res) => {
  try {
    const { jurisdiccion, estado, estudio_id, relevancia, search, limit = 50, offset = 0 } = req.query

    let query = `
      SELECT 
        c.*,
        est.nombre as estudio_nombre,
        t.relevancia as triage_relevancia,
        t.justificacion as triage_justificacion,
        t.confidence as triage_confidence,
        t.requiere_revision_humana,
        (SELECT COUNT(*) FROM alertas a WHERE a.caso_id = c.id AND a.estado != 'resuelta') as alertas_activas
      FROM casos c
      LEFT JOIN estudios est ON est.id = c.estudio_id
      LEFT JOIN triage_results t ON t.caso_id = c.id
      WHERE 1=1
    `
    const params: any[] = []
    let i = 1

    if (jurisdiccion) { query += ` AND c.jurisdiccion = $${i++}`; params.push(jurisdiccion) }
    if (estado) { query += ` AND c.estado_actual = $${i++}`; params.push(estado) }
    if (estudio_id) { query += ` AND c.estudio_id = $${i++}`; params.push(estudio_id) }
    if (relevancia) { query += ` AND t.relevancia = $${i++}`; params.push(relevancia) }
    if (search) {
      query += ` AND (c.caratula ILIKE $${i} OR c.nro_siniestro ILIKE $${i})`
      params.push(`%${search}%`); i++
    }

    query += ` ORDER BY c.fecha_apertura DESC LIMIT $${i++} OFFSET $${i++}`
    params.push(limit, offset)

    const result = await pool.query(query, params)
    res.json({ data: result.rows, total: result.rowCount })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching casos' })
  }
})

// GET /api/casos/:id — detalle completo
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [caso, eventos, alertas, triage] = await Promise.all([
      pool.query('SELECT c.*, est.nombre as estudio_nombre FROM casos c LEFT JOIN estudios est ON est.id = c.estudio_id WHERE c.id = $1', [id]),
      pool.query('SELECT * FROM eventos WHERE caso_id = $1 ORDER BY fecha_evento DESC', [id]),
      pool.query('SELECT * FROM alertas WHERE caso_id = $1 AND estado != \'resuelta\' ORDER BY fecha_vencimiento ASC', [id]),
      pool.query('SELECT * FROM triage_results WHERE caso_id = $1 ORDER BY created_at DESC LIMIT 1', [id])
    ])

    if (!caso.rows[0]) return res.status(404).json({ error: 'Caso not found' })

    res.json({
      ...caso.rows[0],
      eventos: eventos.rows,
      alertas: alertas.rows,
      triage: triage.rows[0] || null
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching caso' })
  }
})

export default router
