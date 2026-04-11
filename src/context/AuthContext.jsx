import { createContext, useContext, useState } from 'react'

const USERS = [
  { id: 1, name: 'Admin User',  email: 'admin@carservice.com',  password: 'admin123',  role: 'admin'     },
  { id: 2, name: 'Carlos Mech', email: 'carlos@carservice.com', password: 'carlos123', role: 'mechanic'  },
  { id: 3, name: 'Luis Mech',   email: 'luis@carservice.com',   password: 'luis123',   role: 'mechanic'  },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  const login = (email, password) => {
    const found = USERS.find(u => u.email === email && u.password === password)
    if (found) {
      setUser(found)
      setError('')
      return true
    }
    setError('Invalid email or password.')
    return false
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout, error, users: USERS }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
