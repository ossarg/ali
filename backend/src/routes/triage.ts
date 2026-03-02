import { Router } from 'express'
import pool from '../db/client.js'
import { requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/triage/rules — obtener reglas actuales (gerente+)
router.get('/rules', requireRole('admin', 'gerente'), async (_, res) => {
  try {
    const result = await pool.query('SELECT * FROM triage_rules ORDER BY updated_at DESC LIMIT 1')
    res.json(result.rows[0]?.rules || null)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching triage rules' })
  }
})

// PUT /api/triage/rules — actualizar reglas (gerente+)
router.put('/rules', requireRole('admin', 'gerente'), async (req, res) => {
  try {
    const { rules } = req.body
    const userId = req.user!.id
    await pool.query(
      'INSERT INTO triage_rules (rules, updated_by) VALUES ($1, $2)',
      [JSON.stringify(rules), userId]
    )
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error updating triage rules' })
  }
})

// POST /api/triage/:caso_id/confirm — confirmar o corregir triage (gerente+)
router.post('/:caso_id/confirm', requireRole('admin', 'gerente'), async (req, res) => {
  try {
    const { caso_id } = req.params
    const { relevancia_confirmada, relevancia_original, notas } = req.body
    const userId = req.user!.id

    await pool.query(
      `INSERT INTO triage_calibration 
       (caso_id, relevancia_original, relevancia_confirmada, revisado_por, notas)
       VALUES ($1, $2, $3, $4, $5)`,
      [caso_id, relevancia_original, relevancia_confirmada, userId, notas]
    )

    // Actualizar triage_results con la decisión humana
    await pool.query(
      'UPDATE triage_results SET relevancia_humana = $1, revisado_por = $2 WHERE caso_id = $3',
      [relevancia_confirmada, userId, caso_id]
    )

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error confirming triage' })
  }
})

export default router
