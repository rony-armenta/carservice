import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

const ROLES = ['admin', 'mechanic']
const ROLE_STYLE = {
  admin:    { background: '#EEEDFE', color: '#534AB7' },
  mechanic: { background: '#E1F5EE', color: '#0F6E56' },
}

const inputStyle = {
  width: '100%', padding: '8px 10px', fontSize: 13,
  border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8,
  outline: 'none', marginBottom: '1rem', fontFamily: 'inherit', background: '#fff',
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [form, setForm]           = useState({ name: '', email: '', password: '', role: 'mechanic' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    api.getUsers()
      .then(setUsers)
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const openNew  = () => { setForm({ name: '', email: '', password: '', role: 'mechanic' }); setEditing(null); setFormError(''); setShowForm(true) }
  const openEdit = (u) => { setForm({ name: u.name, email: u.email, password: '', role: u.role }); setEditing(u); setFormError(''); setShowForm(true) }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || (!editing && !form.password.trim())) {
      setFormError('All fields are required.'); return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        const updated = await api.updateUser(editing.id, form)
        setUsers(prev => prev.map(u => u.id === editing.id ? updated : u))
      } else {
        const created = await api.createUser(form)
        setUsers(prev => [...prev, created])
      }
      setShowForm(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.deleteUser(confirmDel.id)
      setUsers(prev => prev.filter(u => u.id !== confirmDel.id))
      setConfirmDel(null)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#9b9b97', fontSize: 13 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500 }}>Users & Roles</h1>
          <p style={{ fontSize: 13, color: '#6b6b68', marginTop: 2 }}>{users.length} users</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button onClick={openNew} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            + New user
          </button>
        )}
      </div>

      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', padding: '0.625rem 1rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', fontSize: 11, color: '#9b9b97', fontWeight: 500, gap: 12 }}>
          <span>Name</span><span>Email</span><span>Role</span><span>Actions</span>
        </div>

        {users.map(u => (
          <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', padding: '0.75rem 1rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: '#E6F1FB', color: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>
                {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>
                {u.name} {u.id === currentUser?.id && <span style={{ fontSize: 11, color: '#9b9b97' }}>(you)</span>}
              </span>
            </div>
            <span style={{ fontSize: 13, color: '#6b6b68' }}>{u.email}</span>
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 500, display: 'inline-block', textTransform: 'capitalize', ...ROLE_STYLE[u.role] }}>{u.role}</span>
            {currentUser?.role === 'admin' && u.id !== currentUser?.id ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(u)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.15)', background: 'transparent', cursor: 'pointer', color: '#185FA5' }}>Edit</button>
                <button onClick={() => setConfirmDel(u)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '0.5px solid rgba(163,45,45,0.3)', background: 'transparent', cursor: 'pointer', color: '#A32D2D' }}>Delete</button>
              </div>
            ) : <span />}
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', maxWidth: 400, width: '100%', border: '0.5px solid rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: '1.25rem' }}>{editing ? 'Edit user' : 'New user'}</h2>
            <label style={{ fontSize: 12, color: '#6b6b68', display: 'block', marginBottom: 4 }}>Full name</label>
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Miguel García" />
            <label style={{ fontSize: 12, color: '#6b6b68', display: 'block', marginBottom: 4 }}>Email</label>
            <input style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="e.g. miguel@carservice.com" />
            <label style={{ fontSize: 12, color: '#6b6b68', display: 'block', marginBottom: 4 }}>Password {editing && <span style={{ color: '#9b9b97' }}>(leave blank to keep current)</span>}</label>
            <input style={inputStyle} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" />
            <label style={{ fontSize: 12, color: '#6b6b68', display: 'block', marginBottom: 4 }}>Role</label>
            <select style={{ ...inputStyle, marginBottom: formError ? '0.5rem' : '1rem' }} value={form.role} onChange={e => set('role', e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            {formError && <p style={{ fontSize: 12, color: '#A32D2D', background: '#FCEBEB', padding: '6px 10px', borderRadius: 6, marginBottom: '1rem' }}>{formError}</p>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: 'none', background: saving ? '#ccc' : '#185FA5', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', maxWidth: 360, width: '100%', border: '0.5px solid rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Delete user?</h2>
            <p style={{ fontSize: 13, color: '#6b6b68', marginBottom: '1.25rem' }}>This will permanently remove <strong>{confirmDel.name}</strong>.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDel(null)} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: 'none', background: '#A32D2D', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
