import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = () => login(email, password)

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f5f5f4',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '2rem',
        width: '100%', maxWidth: 360,
        border: '0.5px solid rgba(0,0,0,0.1)',
      }}>
        {/* Logo / title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#185FA5', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 24, marginBottom: 12,
          }}>🔧</div>
          <h1 style={{ fontSize: 18, fontWeight: 500 }}>Car Service</h1>
          <p style={{ fontSize: 13, color: '#6b6b68', marginTop: 4 }}>Sign in to your account</p>
        </div>

        <label style={{ fontSize: 12, color: '#6b6b68', display: 'block', marginBottom: 4 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKey}
          placeholder="you@carservice.com"
          style={{
            width: '100%', padding: '8px 10px', fontSize: 13,
            border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8,
            outline: 'none', marginBottom: '1rem', fontFamily: 'inherit',
          }}
        />

        <label style={{ fontSize: 12, color: '#6b6b68', display: 'block', marginBottom: 4 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKey}
          placeholder="••••••••"
          style={{
            width: '100%', padding: '8px 10px', fontSize: 13,
            border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8,
            outline: 'none', marginBottom: error ? '0.5rem' : '1.25rem', fontFamily: 'inherit',
          }}
        />

        {error && (
          <p style={{ fontSize: 12, color: '#A32D2D', background: '#FCEBEB', padding: '6px 10px', borderRadius: 6, marginBottom: '1rem' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '9px', fontSize: 13, fontWeight: 500,
            background: '#185FA5', color: '#fff', border: 'none',
            borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Sign in
        </button>

        <p style={{ fontSize: 11, color: '#c5c5c2', textAlign: 'center', marginTop: '1.5rem' }}>
          Powered by: Claid 🔧
        </p>
      </div>
    </div>
  )
} 