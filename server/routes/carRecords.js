import { Router } from 'express'
import { body }   from 'express-validator'
import pool       from '../db.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const recordRules = [
  body('vehicle_id').isInt({ gt: 0 }).withMessage('Valid vehicle_id required'),
  body('service_type').trim().notEmpty().withMessage('Service type is required').escape(),
  body('diagnostics').optional({ checkFalsy: true }).trim().escape(),
  body('error_codes').optional({ checkFalsy: true }).trim().escape(),
  body('notes').optional({ checkFalsy: true }).trim().escape(),
  body('mileage').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('Mileage must be a positive number'),
  body('order_id').optional({ nullable: true }).isInt({ gt: 0 }),
]

// GET all records for a vehicle — full timeline
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        cr.*,
        v.make_model   as car,
        v.plate,
        c.name         as customer_name,
        o.description  as order_desc,
        o.status       as order_status
      FROM car_records cr
      JOIN vehicles  v ON v.id = cr.vehicle_id
      JOIN customers c ON c.id = v.customer_id
      LEFT JOIN orders o ON o.id = cr.order_id
      WHERE cr.vehicle_id = $1
      ORDER BY cr.created_at DESC
    `, [req.params.vehicleId])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET single record
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT cr.*, v.make_model as car, v.plate, c.name as customer_name,
             o.description as order_desc, o.status as order_status
      FROM car_records cr
      JOIN vehicles  v ON v.id = cr.vehicle_id
      JOIN customers c ON c.id = v.customer_id
      LEFT JOIN orders o ON o.id = cr.order_id
      WHERE cr.id = $1
    `, [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Record not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET all records (for dashboard / search)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        cr.*,
        v.make_model   as car,
        v.plate,
        c.name         as customer_name,
        o.description  as order_desc,
        o.status       as order_status
      FROM car_records cr
      JOIN vehicles  v ON v.id = cr.vehicle_id
      JOIN customers c ON c.id = v.customer_id
      LEFT JOIN orders o ON o.id = cr.order_id
      ORDER BY cr.created_at DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST create record (can be standalone or linked to an order)
router.post('/', validate(recordRules), async (req, res) => {
  const { vehicle_id, order_id, service_type, diagnostics, error_codes, notes, mileage } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Verify vehicle exists
    const { rows: vehRows } = await client.query('SELECT id FROM vehicles WHERE id=$1', [vehicle_id])
    if (!vehRows.length) return res.status(404).json({ error: 'Vehicle not found' })

    // If linked to an order, verify it exists and belongs to same vehicle
    if (order_id) {
      const { rows: ordRows } = await client.query(
        'SELECT id FROM orders WHERE id=$1 AND vehicle_id=$2', [order_id, vehicle_id]
      )
      if (!ordRows.length) return res.status(400).json({ error: 'Order not found or does not belong to this vehicle' })
    }

    const { rows } = await client.query(`
      INSERT INTO car_records (vehicle_id, order_id, service_type, diagnostics, error_codes, notes, mileage)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [vehicle_id, order_id || null, service_type, diagnostics || null, error_codes || null, notes || null, mileage || null])

    const record = rows[0]

    // Link back from order to record
    if (order_id) {
      await client.query('UPDATE orders SET record_id=$1 WHERE id=$2', [record.id, order_id])
    }

    await client.query('COMMIT')
    res.status(201).json(record)
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    client.release()
  }
})

// PUT update record
router.put('/:id', validate(recordRules), async (req, res) => {
  const { service_type, diagnostics, error_codes, notes, mileage } = req.body
  try {
    const { rows } = await pool.query(`
      UPDATE car_records
      SET service_type=$1, diagnostics=$2, error_codes=$3, notes=$4, mileage=$5, updated_at=NOW()
      WHERE id=$6 RETURNING *
    `, [service_type, diagnostics || null, error_codes || null, notes || null, mileage || null, req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Record not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE record
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM car_records WHERE id=$1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Record not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
