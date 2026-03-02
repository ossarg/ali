import { Router } from 'express'
import pool from '../db/client.js'

const router = Router()

// GET /api/metrics — métricas del dashboard (todos los roles)
router.get('/', async (_, res) => {
  try {
    const [totales, porRelevancia, alertasActivas, porEstudio] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total, estado_actual FROM casos GROUP BY estado_actual`),
      pool.query(`SELECT relevancia, COUNT(*) as total FROM triage_results GROUP BY relevancia`),
      pool.query(`SELECT COUNT(*) as total FROM alertas WHERE estado != 'resuelta'`),
      pool.query(`
        SELECT est.nombre, COUNT(c.id) as casos, 
               SUM(CASE WHEN c.estado_actual = 'abierto' THEN 1 ELSE 0 END) as activos
        FROM estudios est
        LEFT JOIN casos c ON c.estudio_id = est.id
        GROUP BY est.id, est.nombre
        ORDER BY casos DESC LIMIT 10
      `)
    ])

    res.json({
      casos: totales.rows,
      triage: porRelevancia.rows,
      alertas_activas: alertasActivas.rows[0]?.total || 0,
      estudios: porEstudio.rows
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching metrics' })
  }
})

export default router
