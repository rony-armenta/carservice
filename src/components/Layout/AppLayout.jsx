import { useState } from 'react'
import Sidebar from './Sidebar'

export default function AppLayout({ page, setPage, children }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f4' }}>
      <Sidebar page={page} setPage={setPage} expanded={expanded} setExpanded={setExpanded} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {children}
      </main>
    </div>
  )
}
