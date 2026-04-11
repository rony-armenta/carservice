import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET all vehicles
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT v.*, c.name as customer_name FROM vehicles v
      JOIN customers c ON c.id = v.customer_id
      ORDER BY v.id ASC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH update car status
router.patch('/:id/status', async (req, res) => {
  const { car_status } = req.body
  const valid = ['active', 'in-repair', 'inactive']
  if (!valid.includes(car_status)) return res.status(400).json({ error: 'Invalid status' })

  try {
    const { rows } = await pool.query(
      `UPDATE vehicles SET car_status=$1 WHERE id=$2 RETURNING *`,
      [car_status, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Vehicle not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
