export default function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: '#f0efea', borderRadius: 8,
      padding: '0.875rem 1rem',
    }}>
      <p style={{ fontSize: 12, color: '#6b6b68', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 500 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#9b9b97', marginTop: 2 }}>{sub}</p>}
    </div>
  )
}
