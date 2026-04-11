import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET all users (never return passwords)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, active, created_at FROM users ORDER BY id ASC`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role FROM users WHERE email=$1 AND password=$2 AND active=true`,
      [email, password]
    )
    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password.' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create user
router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body
  if (!name || !email || !password || !role)
    return res.status(400).json({ error: 'All fields are required' })

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4)
       RETURNING id, name, email, role, active`,
      [name, email, password, role]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already in use.' })
    res.status(500).json({ error: err.message })
  }
})

// PUT update user
router.put('/:id', async (req, res) => {
  const { name, email, password, role } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE users SET name=$1, email=$2, password=$3, role=$4 WHERE id=$5
       RETURNING id, name, email, role, active`,
      [name, email, password, role, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already in use.' })
    res.status(500).json({ error: err.message })
  }
})

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id=$1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
