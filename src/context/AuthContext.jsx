import { createContext, useContext, useState, useEffect } from 'react'
import { api, setToken, clearToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  // Listen for token expiry from api.js
  useEffect(() => {
    const handleExpired = () => {
      setUser(null)
      clearToken()
      setError('Your session has expired. Please log in again.')
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    setError('')
    try {
      const { token, user: userData } = await api.login(email, password)
      setToken(token)
      setUser(userData)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
