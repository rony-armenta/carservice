import { useState } from 'react'

const mechanics = ['Carlos', 'Miguel', 'Luis', 'Unassigned']

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
}
const modal = {
  background: '#fff', borderRadius: 12, padding: '1.5rem',
  width: '100%', maxWidth: 440, border: '0.5px solid rgba(0,0,0,0.1)',
}
const label  = { fontSize: 12, color: '#6b6b68', marginBottom: 4, display: 'block' }
const input  = {
  width: '100%', padding: '8px 10px', fontSize: 13,
  border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8,
  outline: 'none', marginBottom: '1rem', fontFamily: 'inherit', background: '#fff',
}
const row    = { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1rem' }
const btnSec = { fontSize: 13, padding: '7px 16px', borderRadius: 8, cursor: 'pointer', border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent' }
const btnPri = { fontSize: 13, padding: '7px 16px', borderRadius: 8, cursor: 'pointer', border: 'none', background: '#185FA5', color: '#fff', fontFamily: 'inherit' }
const btnDis = { ...{ fontSize: 13, padding: '7px 16px', borderRadius: 8, border: 'none', fontFamily: 'inherit' }, background: '#ccc', color: '#888', cursor: 'not-allowed' }

export default function WorkOrderForm({ customers, onClose, onSave, parentId = null }) {
  const [customerId, setCustomerId] = useState('')
  const [desc, setDesc]             = useState('')
  const [mech, setMech]             = useState('Unassigned')

  const selected  = customers.find(c => c.id === Number(customerId))
  const blocked   = selected?.carStatus === 'inactive'
  const canSave   = desc.trim() && customerId && !blocked

  const handleSave = () => {
    if (!canSave) return
    onSave({
      desc,
      car:        selected.car,
      customerId: selected.id,
      mech:       mech === 'Unassigned' ? null : mech,
      parentId,
    })
    onClose()
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: '1.25rem' }}>
          {parentId ? `New sub-order for ${parentId}` : 'New work order'}
        </h2>

        <label style={label}>Customer & vehicle</label>
        <select style={input} value={customerId} onChange={e => setCustomerId(e.target.value)}>
          <option value="">— Select a customer —</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.car} {c.plate ? `(${c.plate})` : ''}
            </option>
          ))}
        </select>

        {/* Car status warning */}
        {selected && (
          <div style={{
            marginTop: -8, marginBottom: '1rem', padding: '8px 10px',
            borderRadius: 8, fontSize: 12,
            background: blocked ? '#FCEBEB' : selected.carStatus === 'in-repair' ? '#E6F1FB' : '#EAF3DE',
            color:      blocked ? '#A32D2D' : selected.carStatus === 'in-repair' ? '#185FA5' : '#3B6D11',
          }}>
            {blocked
              ? '⚠ This vehicle is inactive. Orders cannot be created for inactive cars.'
              : selected.carStatus === 'in-repair'
                ? 'ℹ Vehicle is currently in repair.'
                : '✓ Vehicle is active and available.'}
          </div>
        )}

        <label style={label}>Service description</label>
        <input
          style={input} placeholder="e.g. Oil change & filter"
          value={desc} onChange={e => setDesc(e.target.value)}
          disabled={blocked}
        />

        <label style={label}>Assign mechanic</label>
        <select
          style={{ ...input, marginBottom: 0 }}
          value={mech} onChange={e => setMech(e.target.value)}
          disabled={blocked}
        >
          {mechanics.map(m => <option key={m}>{m}</option>)}
        </select>

        <div style={row}>
          <button style={btnSec} onClick={onClose}>Cancel</button>
          <button style={canSave ? btnPri : btnDis} onClick={handleSave} disabled={!canSave}>
            Save order
          </button>
        </div>
      </div>
    </div>
  )
}
