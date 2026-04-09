import { AVATAR_COLOR } from '../../utils/formatters'

export default function CustomerRow({ customer }) {
  const av = AVATAR_COLOR[customer.color] ?? AVATAR_COLOR.blue
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0.75rem 1rem',
      borderBottom: '0.5px solid rgba(0,0,0,0.08)',
      cursor: 'pointer',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 500, flexShrink: 0,
        background: av.bg, color: av.color,
      }}>
        {customer.initials}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{customer.name}</div>
        <div style={{ fontSize: 12, color: '#6b6b68' }}>{customer.car}</div>
      </div>
      <span style={{ fontSize: 11, color: '#9b9b97', marginLeft: 'auto' }}>
        {customer.orders} order{customer.orders !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
