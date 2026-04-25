import { useAuth } from '../../context/AuthContext'

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
)

const ICONS = {
  dashboard: ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M14 14h7v7h-7z'],
  customers: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2','M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  records:   ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z','M14 2v6h6','M16 13H8','M16 17H8','M10 9H8'],
  users:     ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2','M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z','M23 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],
  home:      ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z','M9 22V12h6v10'],
  logout:    ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4','M16 17l5-5-5-5','M21 12H9'],
  collapse:  ['M15 18l-6-6 6-6'],
  expand:    ['M9 18l6-6-6-6'],
  wrench:    ['M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'],
}

const NAV = [
  { key: 'dashboard', label: 'Dashboard',            icon: 'dashboard' },
  { key: 'customers', label: 'Customers & Vehicles',  icon: 'customers' },
  { key: 'records',   label: 'Service Records',       icon: 'records'   },
  { key: 'users',     label: 'Users & Roles',         icon: 'users'     },
]

const divider = { height: '0.5px', background: 'rgba(0,0,0,0.08)', margin: '0.5rem 0' }

export default function Sidebar({ page, setPage, expanded, setExpanded }) {
  const { user, logout } = useAuth()

  const navBtn = (item) => {
    const active = page === item.key
    return (
      <button key={item.key} onClick={() => setPage(item.key)}
        title={!expanded ? item.label : ''}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '8px 12px', borderRadius: 8,
          border: 'none', background: active ? '#E6F1FB' : 'transparent',
          color: active ? '#185FA5' : '#6b6b68',
          cursor: 'pointer', fontSize: 13, fontWeight: active ? 500 : 400,
          textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s, color 0.15s',
        }}>
        <Icon d={ICONS[item.icon]} />
        {expanded && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
      </button>
    )
  }

  return (
    <div style={{
      width: expanded ? 220 : 56, flexShrink: 0,
      height: '100vh', position: 'sticky', top: 0,
      background: '#fff', borderRight: '0.5px solid rgba(0,0,0,0.1)',
      display: 'flex', flexDirection: 'column',
      padding: '0.75rem 0.5rem', transition: 'width 0.2s ease', overflow: 'hidden',
    }}>
      {/* Logo + toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 4px' }}>
        {expanded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#185FA5' }}>
            <Icon d={ICONS.wrench} size={18} />
            <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', color: '#1c1c1a' }}>Car Service</span>
          </div>
        )}
        <button onClick={() => setExpanded(e => !e)} title={expanded ? 'Collapse' : 'Expand'}
          style={{ width: 30, height: 30, borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.12)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#6b6b68', marginLeft: expanded ? 0 : 'auto', marginRight: expanded ? 0 : 'auto' }}>
          <Icon d={expanded ? ICONS.collapse : ICONS.expand} size={14} />
        </button>
      </div>

      <div style={divider} />

      {/* Home */}
      <button onClick={() => setPage('dashboard')} title={!expanded ? 'Home' : ''}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#6b6b68', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontFamily: 'inherit', marginBottom: 4 }}>
        <Icon d={ICONS.home} />
        {expanded && <span>Home</span>}
      </button>

      <div style={divider} />

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, marginTop: '0.5rem' }}>
        {NAV.map(navBtn)}
      </nav>

      <div style={divider} />

      {/* User + logout */}
      <div style={{ marginTop: '0.5rem' }}>
        {expanded && user && (
          <div style={{ padding: '6px 12px', marginBottom: 4 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#1c1c1a' }}>{user.name}</p>
            <p style={{ fontSize: 11, color: '#9b9b97', textTransform: 'capitalize' }}>{user.role}</p>
          </div>
        )}
        <button onClick={logout} title={!expanded ? 'Log out' : ''}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#A32D2D', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontFamily: 'inherit' }}>
          <Icon d={ICONS.logout} />
          {expanded && <span>Log out</span>}
        </button>
      </div>
    </div>
  )
}
