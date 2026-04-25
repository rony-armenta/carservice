import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage       from './pages/LoginPage'
import AppLayout       from './components/Layout/AppLayout'
import Dashboard       from './pages/Dashboard'
import CustomersPage   from './pages/CustomersPage'
import CarRecordsPage  from './pages/CarRecordsPage'
import UsersPage       from './pages/UsersPage'

function AppContent() {
  const { user } = useAuth()
  const [page, setPage] = useState('dashboard')

  if (!user) return <LoginPage />

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />
      case 'customers': return <CustomersPage />
      case 'records':   return <CarRecordsPage />
      case 'users':     return <UsersPage />
      default:          return <Dashboard />
    }
  }

  return (
    <AppLayout page={page} setPage={setPage}>
      {renderPage()}
    </AppLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
