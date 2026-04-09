import { STATUS_LABEL, STATUS_CLASS } from '../../utils/formatters'

const badgeStyle = {
  'badge-pending':  { background: '#FAEEDA', color: '#854F0B' },
  'badge-progress': { background: '#E6F1FB', color: '#185FA5' },
  'badge-done':     { background: '#EAF3DE', color: '#3B6D11' },
}

export default function WorkOrderRow({ order }) {
  const cls = STATUS_CLASS[order.status]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0.75rem 1rem',
      borderBottom: '0.5px solid rgba(0,0,0,0.08)',
      cursor: 'pointer',
    }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#6b6b68', minWidth: 40 }}>{order.id}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{order.desc}</div>
        <div style={{ fontSize: 12, color: '#6b6b68' }}>{order.car}</div>
      </div>
      <span style={{
        fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 500,
        ...badgeStyle[cls]
      }}>
        {STATUS_LABEL[order.status]}
      </span>
      <span style={{ fontSize: 11, color: '#9b9b97', minWidth: 60, textAlign: 'right' }}>
        {order.mech ?? '—'}
      </span>
    </div>
  )
}
