import { Router } from 'express'

const router = Router()

// GET /api/agents — estado de los agentes del pipeline
// Por ahora devuelve estado estático — conectar con OpenClaw cuando esté disponible
router.get('/', async (_, res) => {
  res.json([
    { id: 'rachel', name: 'Rachel', role: 'Intake Specialist', status: 'active', description: 'Recibe y procesa mails de demandas' },
    { id: 'data-processing', name: 'Data Processing Specialist', role: 'Extracción', status: 'pending', description: 'Extrae datos estructurados del documento' },
    { id: 'triage', name: 'Triage Analyst', role: 'Triage', status: 'pending', description: 'Clasifica relevancia y genera resumen ejecutivo' },
    { id: 'ali', name: 'Ali', role: 'Coordinador', status: 'active', description: 'Orquesta el pipeline end-to-end' },
  ])
})

export default router
