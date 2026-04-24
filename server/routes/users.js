import { Router }   from 'express'
import bcrypt       from 'bcrypt'
import jwt          from 'jsonwebtoken'
import rateLimit    from 'express-rate-limit'
import { body }     from 'express-validator'
import pool         from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const SALT_ROUNDS = 12

// Strict rate limit on login — 10 attempts per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation rules
const loginRules = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]

const userRules = [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').optional({ checkFalsy: true }).isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['admin', 'mechanic']).withMessage('Role must be admin or mechanic'),
]

// POST /api/users/login — public
router.post('/login', loginLimiter, validate(loginRules), async (req, res) => {
  const { email, password } = req.body
  try {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE email=$1 AND active=true`, [email]
    )
    if (!rows.length) {
      // Same message for wrong email or wrong password — prevents user enumeration
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const user = rows[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Invalid email or password.' })

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    )

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/users — admin only
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, active, created_at FROM users ORDER BY id ASC`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/users — admin only
router.post('/', requireAuth, requireAdmin, validate(userRules), async (req, res) => {
  const { name, email, password, role } = req.body
  try {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS)
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, active`,
      [name, email, hashed, role]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already in use.' })
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/users/:id — admin only
router.put('/:id', requireAuth, requireAdmin, validate(userRules), async (req, res) => {
  const { name, email, password, role } = req.body
  try {
    // Only re-hash if a new password was provided
    let query, params
    if (password) {
      const hashed = await bcrypt.hash(password, SALT_ROUNDS)
      query  = `UPDATE users SET name=$1, email=$2, password=$3, role=$4 WHERE id=$5 RETURNING id, name, email, role, active`
      params = [name, email, hashed, role, req.params.id]
    } else {
      query  = `UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4 RETURNING id, name, email, role, active`
      params = [name, email, role, req.params.id]
    }
    const { rows } = await pool.query(query, params)
    if (!rows.length) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already in use.' })
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/users/:id — admin only
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (parseInt(req.params.id) === req.user.id)
      return res.status(400).json({ error: 'You cannot delete your own account.' })
    const { rowCount } = await pool.query('DELETE FROM users WHERE id=$1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
