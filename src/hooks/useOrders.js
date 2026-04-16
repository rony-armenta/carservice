import { useState, useEffect } from 'react'
import { api } from '../services/api'

export function useOrders() {
  const [orders, setOrders]   = useState([])
  const [filter, setFilter]   = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  // Normalize DB row to frontend shape
  const normalize = (o) => ({
    ...o,
    parentId:   o.parent_id,
    customerId: o.customer_id,
    vehicleId:  o.vehicle_id,
    desc:       o.description,
    mech:       o.mech || null,
    status:     o.status,
  })

  useEffect(() => {
    api.getOrders()
      .then(data => setOrders(data.map(normalize)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const mainOrders = orders.filter(o => !o.parentId)
  const filtered   = filter === 'all' ? mainOrders : mainOrders.filter(o => o.status === filter)

  const subOrdersOf = (parentId) => orders.filter(o => o.parentId === parentId)

  const addOrder = async ({ desc, car, customerId, vehicleId, mechId, parentId }) => {
    try {
      const created = await api.createOrder({
        description: desc,
        customer_id: customerId,
        vehicle_id:  vehicleId,
        mechanic_id: mechId || null,
        parent_id:   parentId || null,
      })
      setOrders(prev => [...prev, normalize(created)])
    } catch (err) {
      setError(err.message)
      throw err // re-throw so form can show the error
    }
  }

  const addSubOrder = (parentId, data) => addOrder({ ...data, parentId })

  const updateStatus = async (id, status) => {
    try {
      const updated = await api.updateOrderStatus(id, status)
      setOrders(prev => prev.map(o => o.id === updated.id ? normalize(updated) : o))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const stats = {
    open:       orders.filter(o => !o.parentId && o.status !== 'done').length,
    inProgress: orders.filter(o => !o.parentId && o.status === 'progress').length,
    doneToday:  orders.filter(o => !o.parentId && o.status === 'done').length,
  }

  return { orders: filtered, filter, setFilter, addOrder, addSubOrder, updateStatus, subOrdersOf, stats, loading, error }
}
