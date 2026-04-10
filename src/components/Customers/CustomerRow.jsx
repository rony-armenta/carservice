import { AVATAR_COLOR, CAR_STATUS_LABEL, CAR_STATUS_STYLE } from '../../utils/formatters'

const CAR_STATUSES = ['active', 'in-repair', 'inactive']

export default function CustomerRow({ customer, onCarStatusChange }) {
  const av = AVATAR_COLOR[customer.color] ?? AVATAR_COLOR.blue
  const cs = CAR_STATUS_STYLE[customer.carStatus] ?? CAR_STATUS_STYLE.active

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0.75rem 1rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 500, flexShrink: 0,
        background: av.bg, color: av.color,
      }}>
        {customer.initials}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{customer.name}</div>
        <div style={{ fontSize: 12, color: '#6b6b68' }}>
          {customer.car}{customer.plate ? ` · ${customer.plate}` : ''}
        </div>
      </div>

      {/* Car status dropdown */}
      <select
        value={customer.carStatus}
        onChange={e => onCarStatusChange(customer.id, e.target.value)}
        style={{
          fontSize: 11, padding: '3px 6px', borderRadius: 20, fontWeight: 500,
          border: 'none', cursor: 'pointer', outline: 'none', ...cs,
        }}
      >
        {CAR_STATUSES.map(s => (
          <option key={s} value={s}>{CAR_STATUS_LABEL[s]}</option>
        ))}
      </select>

      <span style={{ fontSize: 11, color: '#9b9b97', minWidth: 44, textAlign: 'right' }}>
        {customer.orders} order{customer.orders !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
