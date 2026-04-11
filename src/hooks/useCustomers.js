import { useState } from 'react'
import { customers as initialCustomers } from '../data/mockData'

const COLORS = ['blue', 'teal', 'coral', 'purple', 'amber']

export function useCustomers() {
  const [customers, setCustomers] = useState(initialCustomers)

  const addCustomer = (customer) => {
    const color = COLORS[customers.length % COLORS.length]
    const initials = customer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    setCustomers(prev => [...prev, { ...customer, id: Date.now(), initials, color, orders: 0, carStatus: customer.carStatus ?? 'active' }])
  }

  const editCustomer = (id, data) =>
    setCustomers(prev => prev.map(c => c.id === id
      ? { ...c, ...data, initials: data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }
      : c
    ))

  const deleteCustomer = (id) => setCustomers(prev => prev.filter(c => c.id !== id))

  const updateCarStatus = (customerId, carStatus) =>
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, carStatus } : c))

  return { customers, addCustomer, editCustomer, deleteCustomer, updateCarStatus, total: customers.length }
}
