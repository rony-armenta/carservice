import { useState } from 'react'
import StatCard from '../components/StatCard'
import Topbar from '../components/Layout/Topbar'
import WorkOrders from '../components/WorkOrders/WorkOrders'
import WorkOrderForm from '../components/WorkOrders/WorkOrderForm'
import Customers from '../components/Customers/Customers'
import CustomerForm from '../components/Customers/CustomerForm'
import { useOrders } from '../hooks/useOrders'
import { useCustomers } from '../hooks/useCustomers'

export default function Dashboard() {
  const { orders, filter, setFilter, addOrder, addSubOrder, updateStatus, subOrdersOf, stats } = useOrders()
  const { customers, addCustomer, updateCarStatus, total } = useCustomers()

  const [showOrderForm, setShowOrderForm]       = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [subOrderParent, setSubOrderParent]     = useState(null) // parentId for sub-order form

  const handleAddSubOrder = (parentId) => setSubOrderParent(parentId)

  const handleSaveOrder = (data) => {
    if (data.parentId) addSubOrder(data.parentId, data)
    else addOrder(data)
  }

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
          onAdd={() => setShowOrderForm(true)}
          onStatusChange={updateStatus}
          onAddSubOrder={handleAddSubOrder}
          subOrdersOf={subOrdersOf}
        />
        <Customers
          customers={customers}
          onAdd={() => setShowCustomerForm(true)}
          onCarStatusChange={updateCarStatus}
        />
      </div>

      {/* New main order form */}
      {showOrderForm && (
        <WorkOrderForm
          customers={customers}
          onClose={() => setShowOrderForm(false)}
          onSave={handleSaveOrder}
        />
      )}

      {/* Sub-order form — triggered from a row */}
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
