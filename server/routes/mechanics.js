import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET all active mechanics
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM mechanics WHERE active=true ORDER BY name ASC`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
