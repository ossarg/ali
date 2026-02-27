import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Conecta a Neon (misma DB que Rachel) — connection string via variable de entorno
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export default pool
