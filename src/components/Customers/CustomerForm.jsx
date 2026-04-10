import { useState } from 'react'

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 100,
}
const modal = {
  background: '#fff', borderRadius: 12, padding: '1.5rem',
  width: '100%', maxWidth: 420,
  border: '0.5px solid rgba(0,0,0,0.1)',
}
const label = { fontSize: 12, color: '#6b6b68', marginBottom: 4, display: 'block' }
const input = {
  width: '100%', padding: '8px 10px', fontSize: 13,
  border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8,
  outline: 'none', marginBottom: '1rem', fontFamily: 'inherit',
}
const row = { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '0.5rem' }
const btnSecondary = {
  fontSize: 13, padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
  border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent',
}
const btnPrimary = {
  fontSize: 13, padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
  border: 'none', background: '#185FA5', color: '#fff', fontFamily: 'inherit',
}

export default function CustomerForm({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', phone: '', car: '', plate: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim() || !form.car.trim()) return
    onSave({ name: form.name, phone: form.phone, car: form.car, plate: form.plate })
    onClose()
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: '1.25rem' }}>New customer & vehicle</h2>

        <label style={label}>Full name</label>
        <input
          style={input} placeholder="e.g. Juan Pérez"
          value={form.name} onChange={e => set('name', e.target.value)}
        />

        <label style={label}>Phone number</label>
        <input
          style={input} placeholder="e.g. 667 123 4567"
          value={form.phone} onChange={e => set('phone', e.target.value)}
        />

        <label style={label}>Vehicle</label>
        <input
          style={input} placeholder="e.g. Nissan Sentra 2021"
          value={form.car} onChange={e => set('car', e.target.value)}
        />

        <label style={label}>License plate</label>
        <input
          style={{ ...input, marginBottom: 0 }} placeholder="e.g. ABC-1234"
          value={form.plate} onChange={e => set('plate', e.target.value)}
        />

        <div style={row}>
          <button style={btnSecondary} onClick={onClose}>Cancel</button>
          <button style={btnPrimary} onClick={handleSave}>Save customer</button>
        </div>
      </div>
    </div>
  )
}
