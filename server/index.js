import express        from 'express'
import cors           from 'cors'
import dotenv         from 'dotenv'
import rateLimit      from 'express-rate-limit'

import customersRouter  from './routes/customers.js'
import vehiclesRouter   from './routes/vehicles.js'
import ordersRouter     from './routes/orders.js'
import mechanicsRouter  from './routes/mechanics.js'
import usersRouter      from './routes/users.js'
import carRecordsRouter from './routes/carRecords.js'
import { requireAuth }  from './middleware/auth.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',')
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(express.json({ limit: '10kb' }))

// ── Global rate limit ─────────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}))

// ── Security headers ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next()
})

// ── Public routes ─────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))
app.use('/api/users', usersRouter)

// ── Protected routes ──────────────────────────────────────────────────────────
app.use('/api/customers',   requireAuth, customersRouter)
app.use('/api/vehicles',    requireAuth, vehiclesRouter)
app.use('/api/orders',      requireAuth, ordersRouter)
app.use('/api/mechanics',   requireAuth, mechanicsRouter)
app.use('/api/car-records', requireAuth, carRecordsRouter)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }))

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
