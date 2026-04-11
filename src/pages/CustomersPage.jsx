import { useState } from 'react'
import { useCustomers } from '../hooks/useCustomers'
import { AVATAR_COLOR, CAR_STATUS_LABEL, CAR_STATUS_STYLE } from '../utils/formatters'
import CustomerForm from '../components/Customers/CustomerForm'

const CAR_STATUSES = ['active', 'in-repair', 'inactive']

export default function CustomersPage() {
  const { customers, addCustomer, updateCarStatus, deleteCustomer, editCustomer } = useCustomers()
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  const handleEdit = (c) => setEditing(c)
  const handleDelete = (c) => setConfirmDel(c)

  const confirmDelete = () => {
    deleteCustomer(confirmDel.id)
    setConfirmDel(null)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500 }}>Customers & Vehicles</h1>
          <p style={{ fontSize: 13, color: '#6b6b68', marginTop: 2 }}>{customers.length} registered</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          fontSize: 13, padding: '7px 14px', borderRadius: 8,
          border: 'none', background: '#185FA5', color: '#fff',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>+ New customer</button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 1.2fr 1fr auto',
          padding: '0.625rem 1rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)',
          fontSize: 11, color: '#9b9b97', fontWeight: 500, gap: 12,
        }}>
          <span>Customer</span><span>Vehicle</span><span>Plate</span><span>Car status</span><span>Actions</span>
        </div>

        {customers.map(c => {
          const av = AVATAR_COLOR[c.color] ?? AVATAR_COLOR.blue
          const cs = CAR_STATUS_STYLE[c.carStatus] ?? CAR_STATUS_STYLE.active
          return (
            <div key={c.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1.2fr 1fr auto',
              padding: '0.75rem 1rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)',
              alignItems: 'center', gap: 12,
            }}>
              {/* Customer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 500, background: av.bg, color: av.color,
                }}>
                  {c.initials}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                  {c.phone && <div style={{ fontSize: 11, color: '#9b9b97' }}>{c.phone}</div>}
                </div>
              </div>

              {/* Vehicle */}
              <span style={{ fontSize: 13, color: '#3b3b39' }}>{c.car}</span>

              {/* Plate */}
              <span style={{ fontSize: 12, color: '#6b6b68', fontFamily: 'monospace' }}>{c.plate || '—'}</span>

              {/* Car status dropdown */}
              <select
                value={c.carStatus}
                onChange={e => updateCarStatus(c.id, e.target.value)}
                style={{
                  fontSize: 11, padding: '3px 6px', borderRadius: 20,
                  fontWeight: 500, border: 'none', cursor: 'pointer',
                  outline: 'none', ...cs,
                }}
              >
                {CAR_STATUSES.map(s => <option key={s} value={s}>{CAR_STATUS_LABEL[s]}</option>)}
              </select>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => handleEdit(c)} style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 6,
                  border: '0.5px solid rgba(0,0,0,0.15)', background: 'transparent',
                  cursor: 'pointer', color: '#185FA5',
                }}>Edit</button>
                <button onClick={() => handleDelete(c)} style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 6,
                  border: '0.5px solid rgba(163,45,45,0.3)', background: 'transparent',
                  cursor: 'pointer', color: '#A32D2D',
                }}>Delete</button>
              </div>
            </div>
          )
        })}

        {customers.length === 0 && (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#9b9b97', fontSize: 13 }}>
            No customers yet. Add your first one!
          </p>
        )}
      </div>

      {/* New / Edit form */}
      {(showForm || editing) && (
        <CustomerForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSave={(data) => {
            if (editing) editCustomer(editing.id, data)
            else addCustomer(data)
            setShowForm(false); setEditing(null)
          }}
        />
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', maxWidth: 360, width: '100%', border: '0.5px solid rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Delete customer?</h2>
            <p style={{ fontSize: 13, color: '#6b6b68', marginBottom: '1.25rem' }}>
              This will permanently remove <strong>{confirmDel.name}</strong> and their vehicle record.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDel(null)} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: 'none', background: '#A32D2D', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
