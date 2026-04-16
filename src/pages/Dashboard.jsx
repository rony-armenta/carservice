import { useState } from 'react'
import StatCard from '../components/StatCard'
import Topbar from '../components/Layout/Topbar'
import WorkOrders from '../components/WorkOrders/WorkOrders'
import WorkOrderForm from '../components/WorkOrders/WorkOrderForm'
import Customers from '../components/Customers/Customers'
import CustomerForm from '../components/Customers/CustomerForm'
import { useOrders } from '../hooks/useOrders'
import { useCustomers } from '../hooks/useCustomers'

const Spinner = () => (
  <div style={{ padding: '3rem', textAlign: 'center', color: '#9b9b97', fontSize: 13 }}>
    Loading...
  </div>
)

export default function Dashboard() {
  const { orders, filter, setFilter, addOrder, addSubOrder, updateStatus, subOrdersOf, stats, loading: ordersLoading } = useOrders()
  const { customers, addCustomer, updateCarStatus, total, loading: customersLoading } = useCustomers()

  const [showOrderForm, setShowOrderForm]   = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [subOrderParent, setSubOrderParent] = useState(null)

  const handleSaveOrder = (data) => {
    if (data.parentId) return addSubOrder(data.parentId, data)
    return addOrder(data)
  }

  const loading = ordersLoading || customersLoading

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Topbar />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
        <StatCard label="Open orders"     value={stats.open}       sub={`${stats.inProgress} in progress`} />
        <StatCard label="In progress"     value={stats.inProgress} sub="active right now" />
        <StatCard label="Completed today" value={stats.doneToday}  sub="since 8:00 AM" />
        <StatCard label="Customers"       value={total}            sub="total registered" />
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
          <WorkOrders
            orders={orders}
            filter={filter}
            setFilter={setFilter}
            onAdd={() => setShowOrderForm(true)}
            onStatusChange={updateStatus}
            onAddSubOrder={(id) => setSubOrderParent(id)}
            subOrdersOf={subOrdersOf}
          />
          <Customers
            customers={customers}
            onAdd={() => setShowCustomerForm(true)}
            onCarStatusChange={updateCarStatus}
          />
        </div>
      )}

      {showOrderForm && (
        <WorkOrderForm
          customers={customers}
          onClose={() => setShowOrderForm(false)}
          onSave={handleSaveOrder}
        />
      )}

      {subOrderParent && (
        <WorkOrderForm
          customers={customers}
          parentId={subOrderParent}
          onClose={() => setSubOrderParent(null)}
          onSave={handleSaveOrder}
        />
      )}

      {showCustomerForm && (
        <CustomerForm
          onClose={() => setShowCustomerForm(false)}
          onSave={addCustomer}
        />
      )}
    </div>
  )
}
