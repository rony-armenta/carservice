import { useState } from 'react'

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const modal   = { background: '#fff', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 420, border: '0.5px solid rgba(0,0,0,0.1)' }
const label   = { fontSize: 12, color: '#6b6b68', marginBottom: 4, display: 'block' }
const inp     = { width: '100%', padding: '8px 10px', fontSize: 13, border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8, outline: 'none', marginBottom: '1rem', fontFamily: 'inherit', background: '#fff' }
const btnSec  = { fontSize: 13, padding: '7px 16px', borderRadius: 8, cursor: 'pointer', border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent' }
const btnPri  = { fontSize: 13, padding: '7px 16px', borderRadius: 8, cursor: 'pointer', border: 'none', background: '#185FA5', color: '#fff', fontFamily: 'inherit' }

export default function CustomerForm({ initial = null, onClose, onSave }) {
  const [form, setForm] = useState({ name: initial?.name ?? '', phone: initial?.phone ?? '', car: initial?.car ?? '', plate: initial?.plate ?? '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const canSave = form.name.trim() && form.car.trim()
  const handleSave = () => { if (!canSave) return; onSave(form); onClose() }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: '1.25rem' }}>{initial ? 'Edit customer' : 'New customer & vehicle'}</h2>
        <label style={label}>Full name</label>
        <input style={inp} placeholder="e.g. Juan Pérez" value={form.name} onChange={e => set('name', e.target.value)} />
        <label style={label}>Phone number</label>
        <input style={inp} placeholder="e.g. 667 123 4567" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <label style={label}>Vehicle</label>
        <input style={inp} placeholder="e.g. Nissan Sentra 2021" value={form.car} onChange={e => set('car', e.target.value)} />
        <label style={label}>License plate</label>
        <input style={{ ...inp, marginBottom: 0 }} placeholder="e.g. ABC-1234" value={form.plate} onChange={e => set('plate', e.target.value)} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button style={btnSec} onClick={onClose}>Cancel</button>
          <button style={canSave ? btnPri : { ...btnPri, background: '#ccc', cursor: 'not-allowed' }} onClick={handleSave} disabled={!canSave}>
            {initial ? 'Save changes' : 'Save customer'}
          </button>
        </div>
      </div>
    </div>
  )
}
