import express from 'express'
import cors    from 'cors'
import dotenv  from 'dotenv'

import customersRouter from './routes/customers.js'
import vehiclesRouter  from './routes/vehicles.js'
import ordersRouter    from './routes/orders.js'
import mechanicsRouter from './routes/mechanics.js'
import usersRouter     from './routes/users.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/customers', customersRouter)
app.use('/api/vehicles',  vehiclesRouter)
app.use('/api/orders',    ordersRouter)
app.use('/api/mechanics', mechanicsRouter)
app.use('/api/users',     usersRouter)

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
