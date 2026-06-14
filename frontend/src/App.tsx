import { useState } from 'react'
import EquipmentList from './features/equipment/EquipmentList'
import EquipmentDetail from './features/equipment/EquipmentDetail'

const styles: Record<string, React.CSSProperties> = {
  app: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: {
    background: '#16213e',
    color: '#fff',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  title: { fontSize: 20, fontWeight: 700, letterSpacing: 1 },
  subtitle: { fontSize: 12, color: '#a0aec0', marginTop: 2 },
  main: { flex: 1, display: 'flex', gap: 0 },
  sidebar: { width: 340, borderRight: '1px solid #e2e8f0', background: '#fff', overflowY: 'auto' },
  content: { flex: 1, overflowY: 'auto', padding: 24 },
}

export default function App() {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <div style={styles.title}>FAB DATA SERVICE</div>
          <div style={styles.subtitle}>Semiconductor Equipment Monitoring</div>
        </div>
      </header>
      <main style={styles.main}>
        <aside style={styles.sidebar}>
          <EquipmentList selectedId={selectedId} onSelect={setSelectedId} />
        </aside>
        <section style={styles.content}>
          {selectedId !== null ? (
            <EquipmentDetail equipmentId={selectedId} />
          ) : (
            <div style={{ textAlign: 'center', color: '#718096', marginTop: 80, fontSize: 16 }}>
              Select equipment from the list to view sensor data.
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
