import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import casosRouter from './routes/casos.js'
import agentsRouter from './routes/agents.js'
import metricsRouter from './routes/metrics.js'
import triageRouter from './routes/triage.js'
import authMiddleware from './middleware/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', version: '0.1.0' }))

// Routes
app.use('/api/casos', authMiddleware, casosRouter)
app.use('/api/agents', authMiddleware, agentsRouter)
app.use('/api/metrics', authMiddleware, metricsRouter)
app.use('/api/triage', authMiddleware, triageRouter)

app.listen(PORT, () => {
  console.log(`Libra Legal AI backend running on :${PORT}`)
})
