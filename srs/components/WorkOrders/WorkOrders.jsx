import WorkOrderRow from './WorkOrderRow'

const filters = ['all', 'pending', 'progress', 'done']
const filterLabel = { all: 'All', pending: 'Pending', progress: 'In progress', done: 'Done' }

export default function WorkOrders({ orders, filter, setFilter, onAdd }) {
  return (
    <div style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.875rem 1rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)',
      }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Work orders</span>
        <button onClick={onAdd} style={{
          fontSize: 12, padding: '4px 10px', borderRadius: 8,
          border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent', cursor: 'pointer',
        }}>+ New order</button>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '0.75rem 1rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontSize: 12, padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
            border: '0.5px solid rgba(0,0,0,0.15)',
            background: filter === f ? '#f0efea' : 'transparent',
            fontWeight: filter === f ? 500 : 400,
          }}>
            {filterLabel[f]}
          </button>
        ))}
      </div>

      {orders.map(o => <WorkOrderRow key={o.id} order={o} />)}
    </div>
  )
}
