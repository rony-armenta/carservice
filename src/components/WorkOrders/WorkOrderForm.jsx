import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { ServiceTypeField } from '../../pages/CarRecordsPage'

const DEFAULT_SERVICE_TYPES = [
  'Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Diagnostics',
  'Transmission Service', 'AC Service', 'Electrical Repair', 'Suspension',
  'Coolant Flush', 'Tune-up', 'Battery Replacement', 'Other',
]

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const modal   = { background: '#fff', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 440, border: '0.5px solid rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }
const label   = { fontSize: 12, color: '#6b6b68', marginBottom: 4, display: 'block' }
const inp     = { width: '100%', padding: '8px 10px', fontSize: 13, border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8, outline: 'none', marginBottom: '1rem', fontFamily: 'inherit', background: '#fff' }
const btnSec  = { fontSize: 13, padding: '7px 16px', borderRadius: 8, cursor: 'pointer', border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent' }
const btnPri  = { fontSize: 13, padding: '7px 16px', borderRadius: 8, cursor: 'pointer', border: 'none', background: '#185FA5', color: '#fff', fontFamily: 'inherit' }
const btnDis  = { fontSize: 13, padding: '7px 16px', borderRadius: 8, border: 'none', fontFamily: 'inherit', background: '#ccc', color: '#888', cursor: 'not-allowed' }

export default function WorkOrderForm({ customers, onClose, onSave, parentId = null }) {
  const [customerId, setCustomerId]     = useState('')
  const [desc, setDesc]                 = useState('')
  const [serviceType, setServiceType]   = useState('')
  const [serviceTypes, setServiceTypes] = useState(DEFAULT_SERVICE_TYPES)
  const [mechId, setMechId]             = useState('')
  const [mechanics, setMechanics]       = useState([])
  const [apiError, setApiError]         = useState('')
  const [saving, setSaving]             = useState(false)

  useEffect(() => {
    api.getMechanics().then(setMechanics).catch(() => {})
  }, [])

  const selected = customers.find(c => c.id === Number(customerId))
  const blocked  = selected?.carStatus === 'inactive'
  const canSave  = desc.trim() && customerId && !blocked && !saving

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setApiError('')
    try {
      await onSave({
        desc,
        serviceType:  serviceType || null,
        car:          selected.car,
        customerId:   selected.id,
        vehicleId:    selected.vehicle_id,
        mechId:       mechId || null,
        parentId,
      })
      onClose()
    } catch (err) {
      setApiError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: '1.25rem' }}>
          {parentId ? `New sub-order for ${parentId}` : 'New work order'}
        </h2>

        <label style={label}>Customer & vehicle</label>
        <select style={inp} value={customerId} onChange={e => { setCustomerId(e.target.value); setApiError('') }}>
          <option value="">— Select a customer —</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.car} {c.plate ? `(${c.plate})` : ''}
            </option>
          ))}
        </select>

        {selected && (
          <div style={{
            marginTop: -8, marginBottom: '1rem', padding: '8px 10px', borderRadius: 8, fontSize: 12,
            background: blocked ? '#FCEBEB' : selected.carStatus === 'in-repair' ? '#E6F1FB' : '#EAF3DE',
            color:      blocked ? '#A32D2D' : selected.carStatus === 'in-repair' ? '#185FA5' : '#3B6D11',
          }}>
            {blocked
              ? '⚠ This vehicle is inactive. Orders cannot be created for inactive vehicles.'
              : selected.carStatus === 'in-repair'
                ? 'ℹ Vehicle is currently in repair.'
                : '✓ Vehicle is active and available.'}
          </div>
        )}

        <label style={label}>Service type</label>
        <ServiceTypeField
          value={serviceType}
          onChange={setServiceType}
          serviceTypes={serviceTypes}
          onAddType={(t) => setServiceTypes(prev => prev.includes(t) ? prev : [...prev, t])}
          style={{ marginBottom: '1rem' }}
        />

        <label style={label}>Service description</label>
        <input style={inp} placeholder="e.g. Oil change & filter" value={desc}
          onChange={e => { setDesc(e.target.value); setApiError('') }} disabled={blocked} />

        <label style={label}>Assign mechanic</label>
        <select style={{ ...inp, marginBottom: apiError ? '0.5rem' : '1rem' }}
          value={mechId} onChange={e => setMechId(e.target.value)} disabled={blocked}>
          <option value="">— Unassigned —</option>
          {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        {apiError && (
          <div style={{ fontSize: 12, color: '#A32D2D', background: '#FCEBEB', padding: '7px 10px', borderRadius: 6, marginBottom: '1rem' }}>
            {apiError}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button style={btnSec} onClick={onClose}>Cancel</button>
          <button style={canSave ? btnPri : btnDis} onClick={handleSave} disabled={!canSave}>
            {saving ? 'Saving...' : 'Save order'}
          </button>
        </div>
      </div>
    </div>
  )
}
