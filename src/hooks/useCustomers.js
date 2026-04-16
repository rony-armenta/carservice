import { useState, useEffect } from 'react'
import { api } from '../services/api'

export function useCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  const normalize = (c) => ({
    ...c,
    carStatus: c.car_status,
  })

  useEffect(() => {
    api.getCustomers()
      .then(data => setCustomers(data.map(normalize)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const addCustomer = async (data) => {
    try {
      const created = await api.createCustomer(data)
      setCustomers(prev => [...prev, normalize(created)])
    } catch (err) {
      setError(err.message)
    }
  }

  const editCustomer = async (id, data) => {
    try {
      const updated = await api.updateCustomer(id, data)
      setCustomers(prev => prev.map(c => c.id === id ? normalize(updated) : c))
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteCustomer = async (id) => {
    try {
      await api.deleteCustomer(id)
      setCustomers(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const updateCarStatus = async (id, car_status) => {
    try {
      await api.updateCarStatus(id, car_status)
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, carStatus: car_status, car_status } : c))
    } catch (err) {
      setError(err.message)
    }
  }

  return { customers, loading, error, addCustomer, editCustomer, deleteCustomer, updateCarStatus, total: customers.length }
}
