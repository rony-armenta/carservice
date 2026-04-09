import { formatDate } from '../../utils/formatters'

export default function Topbar() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '1.5rem',
    }}>
      <h1 style={{ fontSize: 18, fontWeight: 500 }}>Shop dashboard</h1>
      <span style={{ fontSize: 13, color: '#6b6b68' }}>{formatDate()}</span>
    </div>
  )
}
