import { useState, useEffect } from 'react'
import { api } from '../services/api'

// Shared list — editable at runtime via "Add custom type"
const DEFAULT_SERVICE_TYPES = [
  'Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Diagnostics',
  'Transmission Service', 'AC Service', 'Electrical Repair', 'Suspension',
  'Coolant Flush', 'Tune-up', 'Battery Replacement', 'Other',
]

const inputStyle = {
  width: '100%', padding: '8px 10px', fontSize: 13,
  border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8,
  outline: 'none', marginBottom: '1rem', fontFamily: 'inherit', background: '#fff',
}
const labelStyle = { fontSize: 12, color: '#6b6b68', marginBottom: 4, display: 'block' }

// ── Reusable ServiceTypeField ─────────────────────────────────────────────────
// Shows a dropdown with existing types + "＋ Add custom…" option.
// When custom is chosen, shows a text input to type the new type.
// onSaveType persists the new type to the parent list.
export function ServiceTypeField({ value, onChange, serviceTypes, onAddType, style = {} }) {
  const [addingCustom, setAddingCustom] = useState(false)
  const [customVal, setCustomVal]       = useState('')

  const handleSelect = (e) => {
    if (e.target.value === '__custom__') {
      setAddingCustom(true)
    } else {
      onChange(e.target.value)
    }
  }

  const confirmCustom = () => {
    const trimmed = customVal.trim()
    if (!trimmed) return
    onAddType(trimmed)
    onChange(trimmed)
    setCustomVal('')
    setAddingCustom(false)
  }

  if (addingCustom) {
    return (
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        <input
          autoFocus
          style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
          placeholder="e.g. Fuel Injector Cleaning"
          value={customVal}
          onChange={e => setCustomVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') confirmCustom(); if (e.key === 'Escape') setAddingCustom(false) }}
        />
        <button onClick={confirmCustom} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Add</button>
        <button onClick={() => setAddingCustom(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent', cursor: 'pointer', fontSize: 13 }}>✕</button>
      </div>
    )
  }

  return (
    <select style={{ ...inputStyle, ...style }} value={value} onChange={handleSelect}>
      <option value="">— Select type —</option>
      {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
      <option value="__custom__">＋ Add custom type…</option>
    </select>
  )
}

// ── RecordForm ────────────────────────────────────────────────────────────────
function RecordForm({ vehicles, initial, onClose, onSave, serviceTypes, onAddType }) {
  const [form, setForm] = useState({
    vehicle_id:   initial?.vehicle_id  ?? '',
    order_id:     initial?.order_id    ?? '',
    service_type: initial?.service_type ?? '',
    diagnostics:  initial?.diagnostics  ?? '',
    error_codes:  initial?.error_codes  ?? '',
    mileage:      initial?.mileage      ?? '',
    notes:        initial?.notes        ?? '',
  })
  const [orders, setOrders] = useState([])
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (form.vehicle_id) {
      api.getOrders()
        .then(all => setOrders(all.filter(o => o.vehicle_id === Number(form.vehicle_id) && !o.parent_id)))
        .catch(() => {})
    } else {
      setOrders([])
    }
  }, [form.vehicle_id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.vehicle_id || !form.service_type) { setError('Vehicle and service type are required.'); return }
    setSaving(true); setError('')
    try {
      await onSave({
        vehicle_id:   Number(form.vehicle_id),
        order_id:     form.order_id ? Number(form.order_id) : null,
        service_type: form.service_type,
        diagnostics:  form.diagnostics || null,
        error_codes:  form.error_codes || null,
        mileage:      form.mileage ? Number(form.mileage) : null,
        notes:        form.notes || null,
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 500, border: '0.5px solid rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: '1.25rem' }}>
          {initial ? 'Edit service record' : 'New service record'}
        </h2>

        <label style={labelStyle}>Vehicle *</label>
        <select style={inputStyle} value={form.vehicle_id}
          onChange={e => { set('vehicle_id', e.target.value); set('order_id', '') }}
          disabled={!!initial}>
          <option value="">— Select vehicle —</option>
          {vehicles.map(v => (
            <option key={v.vehicle_id} value={v.vehicle_id}>
              {v.name} — {v.car} {v.plate ? `(${v.plate})` : ''}
            </option>
          ))}
        </select>

        <label style={labelStyle}>Linked work order (optional)</label>
        <select style={inputStyle} value={form.order_id} onChange={e => set('order_id', e.target.value)}
          disabled={!form.vehicle_id}>
          <option value="">— None —</option>
          {orders.map(o => <option key={o.id} value={o.id}>#{o.id} — {o.description}</option>)}
        </select>

        <label style={labelStyle}>Service type *</label>
        <ServiceTypeField
          value={form.service_type}
          onChange={v => set('service_type', v)}
          serviceTypes={serviceTypes}
          onAddType={onAddType}
        />

        <label style={labelStyle}>Mileage at service</label>
        <input style={inputStyle} type="number" placeholder="e.g. 45200"
          value={form.mileage} onChange={e => set('mileage', e.target.value)} />

        <label style={labelStyle}>Error codes (OBD / DTC)</label>
        <input style={inputStyle} placeholder="e.g. P0420, P0171"
          value={form.error_codes} onChange={e => set('error_codes', e.target.value)} />

        <label style={labelStyle}>Diagnostics</label>
        <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          placeholder="Findings from inspection or diagnostic scan..."
          value={form.diagnostics} onChange={e => set('diagnostics', e.target.value)} />

        <label style={labelStyle}>Notes</label>
        <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical', marginBottom: error ? '0.5rem' : 0 }}
          placeholder="Additional notes, recommendations, parts used..."
          value={form.notes} onChange={e => set('notes', e.target.value)} />

        {error && (
          <div style={{ fontSize: 12, color: '#A32D2D', background: '#FCEBEB', padding: '7px 10px', borderRadius: 6, marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button onClick={onClose} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: 'none', background: saving ? '#ccc' : '#185FA5', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Saving...' : initial ? 'Save changes' : 'Save record'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── RecordCard ────────────────────────────────────────────────────────────────
function RecordCard({ record, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#185FA5', flexShrink: 0 }} />

        <div style={{ flex: 1 }}>
          {/* Top line — service type + badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{record.service_type}</span>
            {record.error_codes && (
              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: '#FAEEDA', color: '#854F0B', fontWeight: 500 }}>
                {record.error_codes}
              </span>
            )}
            {record.order_desc && (
              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: '#E6F1FB', color: '#185FA5' }}>
                Order: {record.order_desc}
              </span>
            )}
          </div>

          {/* Bottom line — vehicle + date + mileage + customer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
            {/* Vehicle pill */}
            <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: '#f0efea', color: '#3b3b39', fontWeight: 500 }}>
              🚗 {record.car}{record.plate ? ` · ${record.plate}` : ''}
            </span>
            <span style={{ fontSize: 11, color: '#9b9b97' }}>
              {new Date(record.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              {record.mileage ? ` · ${record.mileage.toLocaleString()} mi` : ''}
              {record.customer_name ? ` · ${record.customer_name}` : ''}
            </span>
          </div>
        </div>

        <span style={{ fontSize: 11, color: '#9b9b97' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '0 1rem 1rem 2.5rem', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
          {record.diagnostics && (
            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#6b6b68', marginBottom: 4 }}>DIAGNOSTICS</p>
              <p style={{ fontSize: 13, color: '#3b3b39', lineHeight: 1.5 }}>{record.diagnostics}</p>
            </div>
          )}
          {record.notes && (
            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#6b6b68', marginBottom: 4 }}>NOTES</p>
              <p style={{ fontSize: 13, color: '#3b3b39', lineHeight: 1.5 }}>{record.notes}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: '0.875rem' }}>
            <button onClick={() => onEdit(record)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.15)', background: 'transparent', cursor: 'pointer', color: '#185FA5' }}>Edit</button>
            <button onClick={() => onDelete(record)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '0.5px solid rgba(163,45,45,0.3)', background: 'transparent', cursor: 'pointer', color: '#A32D2D' }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CarRecordsPage() {
  const [records, setRecords]           = useState([])
  const [vehicles, setVehicles]         = useState([])
  const [serviceTypes, setServiceTypes] = useState(DEFAULT_SERVICE_TYPES)
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [filterVehicle, setFilterVehicle] = useState('')
  const [showForm, setShowForm]         = useState(false)
  const [editing, setEditing]           = useState(null)
  const [confirmDel, setConfirmDel]     = useState(null)

  useEffect(() => {
    Promise.all([api.getCarRecords(), api.getCustomers()])
      .then(([recs, custs]) => { setRecords(recs); setVehicles(custs) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleAddType = (type) => {
    if (!serviceTypes.includes(type)) setServiceTypes(prev => [...prev, type])
  }

  const handleSave = async (data) => {
    if (editing) {
      const updated = await api.updateCarRecord(editing.id, data)
      setRecords(prev => prev.map(r => r.id === editing.id ? updated : r))
    } else {
      const created = await api.createCarRecord(data)
      setRecords(prev => [created, ...prev])
    }
  }

  const handleDelete = async () => {
    await api.deleteCarRecord(confirmDel.id)
    setRecords(prev => prev.filter(r => r.id !== confirmDel.id))
    setConfirmDel(null)
  }

  const filtered = records.filter(r => {
    const matchVehicle = filterVehicle ? r.vehicle_id === Number(filterVehicle) : true
    const term = search.toLowerCase()
    const matchSearch = !term ||
      r.service_type?.toLowerCase().includes(term) ||
      r.error_codes?.toLowerCase().includes(term) ||
      r.diagnostics?.toLowerCase().includes(term) ||
      r.notes?.toLowerCase().includes(term) ||
      r.customer_name?.toLowerCase().includes(term) ||
      r.car?.toLowerCase().includes(term) ||
      r.plate?.toLowerCase().includes(term)
    return matchVehicle && matchSearch
  })

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#9b9b97', fontSize: 13 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500 }}>Vehicle Service Records</h1>
          <p style={{ fontSize: 13, color: '#6b6b68', marginTop: 2 }}>{records.length} records total</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
          + New record
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem' }}>
        <input placeholder="Search by service, error code, car, customer..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', fontSize: 13, border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8, outline: 'none', fontFamily: 'inherit' }} />
        <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}
          style={{ padding: '8px 12px', fontSize: 13, border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8, outline: 'none', background: '#fff', fontFamily: 'inherit' }}>
          <option value="">All vehicles</option>
          {vehicles.map(v => <option key={v.vehicle_id} value={v.vehicle_id}>{v.name} — {v.car}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9b9b97', fontSize: 13, background: '#fff', borderRadius: 12, border: '0.5px solid rgba(0,0,0,0.1)' }}>
          {search || filterVehicle ? 'No records match your search.' : 'No service records yet. Add the first one!'}
        </div>
      ) : (
        filtered.map(r => (
          <RecordCard key={r.id} record={r}
            onEdit={(rec) => { setEditing(rec); setShowForm(true) }}
            onDelete={(rec) => setConfirmDel(rec)} />
        ))
      )}

      {showForm && (
        <RecordForm vehicles={vehicles} initial={editing}
          serviceTypes={serviceTypes} onAddType={handleAddType}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSave={handleSave} />
      )}

      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', maxWidth: 360, width: '100%', border: '0.5px solid rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Delete record?</h2>
            <p style={{ fontSize: 13, color: '#6b6b68', marginBottom: '1.25rem' }}>
              This will permanently remove the <strong>{confirmDel.service_type}</strong> record from the vehicle history.
            </p>
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
