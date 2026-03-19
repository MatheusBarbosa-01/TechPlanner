// TechPlanner Backend — Ponto de entrada
// API REST com Express + Firebase Admin SDK

require('dotenv').config()
const express     = require('express')
const cors        = require('cors')
const helmet      = require('helmet')
const rateLimit   = require('express-rate-limit')

const authRoutes         = require('./routes/authRoutes')
const activityRoutes     = require('./routes/activityRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const courseRoutes       = require('./routes/courseRoutes')
const submissionRoutes   = require('./routes/submissionRoutes')
const joinRequestRoutes  = require('./routes/joinRequestRoutes')
const errorHandler       = require('./middlewares/errorHandler')

const app = express()

// ── Segurança ─────────────────────────────────────────────────
app.use(helmet())

// CORS — permite requisições apenas do frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

// Rate limiting — max 100 req / 15 min por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' }
})
app.use(limiter)

// ── Parsing ───────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))

// ── Rotas ─────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/activities',    activityRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/courses',       courseRoutes)
app.use('/api/submissions',   submissionRoutes)
app.use('/api/join-requests', joinRequestRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'TechPlanner API', timestamp: new Date().toISOString() })
})

// ── Tratamento global de erros ────────────────────────────────
app.use(errorHandler)

// ── Inicialização ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`✅ TechPlanner API rodando na porta ${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/api/health`)
})
