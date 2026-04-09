import { useState } from 'react'
import { customers as initialCustomers } from '../data/mockData'

const COLORS = ['blue', 'teal', 'coral', 'purple', 'amber']

export function useCustomers() {
  const [customers, setCustomers] = useState(initialCustomers)

  const addCustomer = (customer) => {
    const color = COLORS[customers.length % COLORS.length]
    const initials = customer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    setCustomers(prev => [...prev, { ...customer, id: Date.now(), initials, color, orders: 0 }])
  }

  return { customers, addCustomer, total: customers.length }
}
