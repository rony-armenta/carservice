import { Router } from 'express'
import { body }   from 'express-validator'
import pool       from '../db.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const orderRules = [
  body('vehicle_id').isInt({ gt: 0 }).withMessage('Valid vehicle_id required'),
  body('customer_id').isInt({ gt: 0 }).withMessage('Valid customer_id required'),
  body('description').trim().notEmpty().withMessage('Description is required').escape(),
  body('mechanic_id').optional({ nullable: true }).isInt({ gt: 0 }),
  body('parent_id').optional({ nullable: true }).isInt({ gt: 0 }),
]

// GET all orders
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.*,
        c.name       as customer_name,
        v.make_model as car,
        v.plate,
        v.car_status,
        m.name       as mech
      FROM orders o
      JOIN customers  c ON c.id = o.customer_id
      JOIN vehicles   v ON v.id = o.vehicle_id
      LEFT JOIN mechanics m ON m.id = o.mechanic_id
      ORDER BY o.id ASC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST create order
router.post('/', validate(orderRules), async (req, res) => {
  const { vehicle_id, customer_id, mechanic_id, description, parent_id } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Validation 1 — car not inactive
    const { rows: vehRows } = await client.query(`SELECT car_status FROM vehicles WHERE id=$1`, [vehicle_id])
    if (!vehRows.length) return res.status(404).json({ error: 'Vehicle not found' })
    if (vehRows[0].car_status === 'inactive')
      return res.status(400).json({ error: 'Cannot create an order for an inactive vehicle.' })

    // Validation 2 — no duplicate active main order
    if (!parent_id) {
      const { rows: activeRows } = await client.query(
        `SELECT id FROM orders WHERE vehicle_id=$1 AND status IN ('pending','progress') AND parent_id IS NULL`,
        [vehicle_id]
      )
      if (activeRows.length)
        return res.status(400).json({ error: 'This vehicle already has an active open order.' })
    }

    // Validation 3 — parent must exist and not be done
    if (parent_id) {
      const { rows: parentRows } = await client.query(`SELECT status FROM orders WHERE id=$1`, [parent_id])
      if (!parentRows.length) return res.status(404).json({ error: 'Parent order not found' })
      if (parentRows[0].status === 'done')
        return res.status(400).json({ error: 'Cannot add sub-orders to a completed order.' })

      // Validation 4 — no duplicate sub-order description
      const { rows: dupRows } = await client.query(
        `SELECT id FROM orders WHERE parent_id=$1 AND LOWER(description)=LOWER($2)`,
        [parent_id, description]
      )
      if (dupRows.length)
        return res.status(400).json({ error: 'A sub-order with this description already exists.' })
    }

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (parent_id, vehicle_id, customer_id, mechanic_id, description, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [parent_id || null, vehicle_id, customer_id, mechanic_id || null, description]
    )

    // Auto set car to in-repair on new main order
    if (!parent_id) {
      await client.query(`UPDATE vehicles SET car_status='in-repair' WHERE id=$1`, [vehicle_id])
    }

    await client.query('COMMIT')
    res.status(201).json(orderRows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.message.startsWith('Cannot') || err.message.startsWith('This') || err.message.startsWith('A sub'))
      return res.status(400).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    client.release()
  }
})

// PATCH order status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body
  if (!['pending', 'progress', 'done'].includes(status))
    return res.status(400).json({ error: 'Invalid status' })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows: orderRows } = await client.query(`SELECT * FROM orders WHERE id=$1`, [req.params.id])
    if (!orderRows.length) return res.status(404).json({ error: 'Order not found' })
    const order = orderRows[0]

    // Validation — block done if sub-orders still pending/in-progress
    if (status === 'done' && !order.parent_id) {
      const { rows: subRows } = await client.query(
        `SELECT id FROM orders WHERE parent_id=$1 AND status IN ('pending','progress')`,
        [req.params.id]
      )
      if (subRows.length)
        return res.status(400).json({ error: 'Complete all sub-orders before marking this order as done.' })
    }

    const { rows: updated } = await client.query(
      `UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    )

    // Auto set car back to active when main order is done
    if (status === 'done' && !order.parent_id) {
      await client.query(`UPDATE vehicles SET car_status='active' WHERE id=$1`, [order.vehicle_id])
    }

    await client.query('COMMIT')
    res.json(updated[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    client.release()
  }
})

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM orders WHERE id=$1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Order not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
