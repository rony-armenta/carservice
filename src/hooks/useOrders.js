import { useState } from 'react'
import { orders as initialOrders } from '../data/mockData'

let counter = 48

export function useOrders() {
  const [orders, setOrders] = useState(initialOrders)
  const [filter, setFilter] = useState('all')

  // Only top-level orders respect the filter; sub-orders follow their parent
  const mainOrders = orders.filter(o => o.parentId === null)
  const filtered = filter === 'all' ? mainOrders : mainOrders.filter(o => o.status === filter)

  const subOrdersOf = (parentId) => orders.filter(o => o.parentId === parentId)

  const addOrder = ({ desc, car, customerId, mech }) => {
    const id = `#${String(counter++).padStart(3, '0')}`
    setOrders(prev => [...prev, { id, parentId: null, customerId, desc, car, status: 'pending', mech: mech ?? null }])
  }

  // Sub-orders only allowed if parent status is 'pending' or 'progress'
  const addSubOrder = (parentId, { desc, car, customerId, mech }) => {
    const parent = orders.find(o => o.id === parentId)
    if (!parent || parent.status === 'done') return false
    const siblings = orders.filter(o => o.parentId === parentId)
    const id = `${parentId}${String.fromCharCode(97 + siblings.length)}`
    setOrders(prev => [...prev, { id, parentId, customerId, desc, car, status: 'pending', mech: mech ?? null }])
    return true
  }

  const updateStatus = (id, status) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))

  const stats = {
    open:       orders.filter(o => !o.parentId && o.status !== 'done').length,
    inProgress: orders.filter(o => !o.parentId && o.status === 'progress').length,
    doneToday:  orders.filter(o => !o.parentId && o.status === 'done').length,
  }

  return { orders: filtered, filter, setFilter, addOrder, addSubOrder, updateStatus, subOrdersOf, stats }
}
