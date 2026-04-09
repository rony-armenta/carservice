import CustomerRow from './CustomerRow'

export default function Customers({ customers, onAdd }) {
  return (
    <div style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.875rem 1rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)',
      }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Customers & vehicles</span>
        <button onClick={onAdd} style={{
          fontSize: 12, padding: '4px 10px', borderRadius: 8,
          border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent', cursor: 'pointer',
        }}>+ Add</button>
      </div>
      {customers.map(c => <CustomerRow key={c.id} customer={c} />)}
    </div>
  )
}
