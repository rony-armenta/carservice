import { useState } from 'react'
import { orders as initialOrders } from '../data/mockData'

export function useOrders() {
  const [orders, setOrders] = useState(initialOrders)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const addOrder = (order) => {
    const id = `#${String(orders.length + 41).padStart(3, '0')}`
    setOrders(prev => [...prev, { ...order, id, status: 'pending', mech: null }])
  }

  const updateStatus = (id, status) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))

  const stats = {
    open:      orders.filter(o => o.status !== 'done').length,
    inProgress: orders.filter(o => o.status === 'progress').length,
    doneToday: orders.filter(o => o.status === 'done').length,
  }

  return { orders: filtered, filter, setFilter, addOrder, updateStatus, stats }
}
