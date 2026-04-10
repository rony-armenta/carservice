import { useState } from 'react'
import { STATUS_LABEL } from '../../utils/formatters'

const badgeStyle = {
  pending:  { background: '#FAEEDA', color: '#854F0B' },
  progress: { background: '#E6F1FB', color: '#185FA5' },
  done:     { background: '#EAF3DE', color: '#3B6D11' },
}

const ORDER_STATUSES = ['pending', 'progress', 'done']

export default function WorkOrderRow({ order, subOrders = [], onStatusChange, onAddSubOrder }) {
  const [expanded, setExpanded] = useState(false)
  const canAddSub = order.status === 'pending' || order.status === 'progress'

  return (
    <div style={{ borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem' }}>

        {/* Expand toggle — only if there are sub-orders */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            width: 18, height: 18, borderRadius: 4, border: '0.5px solid rgba(0,0,0,0.15)',
            background: 'transparent', cursor: subOrders.length ? 'pointer' : 'default',
            fontSize: 10, color: '#6b6b68', flexShrink: 0,
            opacity: subOrders.length ? 1 : 0,
          }}
        >
          {expanded ? '▾' : '▸'}
        </button>

        <span style={{ fontSize: 12, fontWeight: 500, color: '#6b6b68', minWidth: 36 }}>{order.id}</span>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{order.desc}</div>
          <div style={{ fontSize: 12, color: '#6b6b68' }}>{order.car}</div>
        </div>

        {/* Status dropdown */}
        <select
          value={order.status}
          onChange={e => onStatusChange(order.id, e.target.value)}
          style={{
            fontSize: 11, padding: '3px 6px', borderRadius: 20, fontWeight: 500,
            border: 'none', cursor: 'pointer', outline: 'none',
            ...badgeStyle[order.status],
          }}
        >
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>

        <span style={{ fontSize: 11, color: '#9b9b97', minWidth: 52, textAlign: 'right' }}>
          {order.mech ?? '—'}
        </span>

        {/* Add sub-order button */}
        <button
          onClick={() => canAddSub && onAddSubOrder(order.id)}
          title={canAddSub ? 'Add sub-order' : 'Cannot add sub-orders to completed orders'}
          style={{
            fontSize: 11, padding: '2px 7px', borderRadius: 6,
            border: '0.5px solid rgba(0,0,0,0.15)', background: 'transparent',
            cursor: canAddSub ? 'pointer' : 'not-allowed',
            color: canAddSub ? '#185FA5' : '#bbb',
          }}
        >
          + sub
        </button>
      </div>

      {/* Sub-orders */}
      {expanded && subOrders.map(sub => (
        <div key={sub.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0.6rem 1rem 0.6rem 3rem',
          background: '#fafaf9',
          borderTop: '0.5px solid rgba(0,0,0,0.05)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#9b9b97', minWidth: 44 }}>{sub.id}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#3b3b39' }}>{sub.desc}</div>
            <div style={{ fontSize: 11, color: '#9b9b97' }}>{sub.car}</div>
          </div>
          <select
            value={sub.status}
            onChange={e => onStatusChange(sub.id, e.target.value)}
            style={{
              fontSize: 11, padding: '2px 6px', borderRadius: 20, fontWeight: 500,
              border: 'none', cursor: 'pointer', outline: 'none',
              ...badgeStyle[sub.status],
            }}
          >
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <span style={{ fontSize: 11, color: '#9b9b97', minWidth: 52, textAlign: 'right' }}>
            {sub.mech ?? '—'}
          </span>
          <div style={{ width: 44 }} />
        </div>
      ))}
    </div>
  )
}
