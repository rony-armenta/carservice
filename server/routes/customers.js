import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET all customers with their vehicle
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, v.id as vehicle_id, v.make_model as car, v.plate, v.car_status
      FROM customers c
      LEFT JOIN vehicles v ON v.customer_id = c.id
      ORDER BY c.id ASC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single customer
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, v.id as vehicle_id, v.make_model as car, v.plate, v.car_status
      FROM customers c
      LEFT JOIN vehicles v ON v.customer_id = c.id
      WHERE c.id = $1
    `, [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Customer not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create customer + vehicle
router.post('/', async (req, res) => {
  const { name, phone, car, plate } = req.body
  if (!name || !car) return res.status(400).json({ error: 'Name and vehicle are required' })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const colors   = ['blue', 'teal', 'coral', 'purple', 'amber']
    const { rows: countRows } = await client.query('SELECT COUNT(*) FROM customers')
    const color = colors[parseInt(countRows[0].count) % colors.length]

    const { rows: custRows } = await client.query(
      `INSERT INTO customers (name, phone, initials, color) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, phone || null, initials, color]
    )
    const customer = custRows[0]

    const { rows: vehRows } = await client.query(
      `INSERT INTO vehicles (customer_id, make_model, plate, car_status) VALUES ($1, $2, $3, 'active') RETURNING *`,
      [customer.id, car, plate || null]
    )

    await client.query('COMMIT')
    res.status(201).json({ ...customer, car: vehRows[0].make_model, plate: vehRows[0].plate, car_status: 'active', vehicle_id: vehRows[0].id })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// PUT update customer + vehicle
router.put('/:id', async (req, res) => {
  const { name, phone, car, plate } = req.body
  if (!name || !car) return res.status(400).json({ error: 'Name and vehicle are required' })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const { rows: custRows } = await client.query(
      `UPDATE customers SET name=$1, phone=$2, initials=$3 WHERE id=$4 RETURNING *`,
      [name, phone || null, initials, req.params.id]
    )
    if (!custRows.length) return res.status(404).json({ error: 'Customer not found' })

    const { rows: vehRows } = await client.query(
      `UPDATE vehicles SET make_model=$1, plate=$2 WHERE customer_id=$3 RETURNING *`,
      [car, plate || null, req.params.id]
    )

    await client.query('COMMIT')
    res.json({ ...custRows[0], car: vehRows[0]?.make_model, plate: vehRows[0]?.plate, car_status: vehRows[0]?.car_status })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// PATCH update car status only
router.patch('/:id/car-status', async (req, res) => {
  const { car_status } = req.body
  const valid = ['active', 'in-repair', 'inactive']
  if (!valid.includes(car_status)) return res.status(400).json({ error: 'Invalid car status' })

  try {
    await pool.query(
      `UPDATE vehicles SET car_status=$1 WHERE customer_id=$2`,
      [car_status, req.params.id]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE customer (cascades to vehicles + orders)
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM customers WHERE id=$1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Customer not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
