import StatCard from '../components/StatCard'
import Topbar from '../components/Layout/Topbar'
import WorkOrders from '../components/WorkOrders/WorkOrders'
import Customers from '../components/Customers/Customers'
import { useOrders } from '../hooks/useOrders'
import { useCustomers } from '../hooks/useCustomers'

export default function Dashboard() {
  const { orders, filter, setFilter, addOrder, stats } = useOrders()
  const { customers, total } = useCustomers()

  return (
    <div style={{ padding: '1.25rem', maxWidth: 1100, margin: '0 auto' }}>
      <Topbar />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
        <StatCard label="Open orders"     value={stats.open}       sub={`${stats.inProgress} in progress`} />
        <StatCard label="In progress"     value={stats.inProgress} sub="active right now" />
        <StatCard label="Completed today" value={stats.doneToday}  sub="since 8:00 AM" />
        <StatCard label="Customers"       value={total}            sub="total registered" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
        <WorkOrders
          orders={orders}
          filter={filter}
          setFilter={setFilter}
          onAdd={() => alert('New order form — coming next!')}
        />
        <Customers
          customers={customers}
          onAdd={() => alert('New customer form — coming next!')}
        />
      </div>
    </div>
  )
}
