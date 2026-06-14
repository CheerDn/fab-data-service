import { useState } from 'react'
import { useEquipmentDetail } from '../../hooks/useEquipmentData'
import StatusBadge from '../../components/StatusBadge'
import SensorTable from '../sensor/SensorTable'
import SensorChart from '../sensor/SensorChart'

interface Props {
  equipmentId: number
}

function defaultRange() {
  const end = new Date()
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
  return {
    start: start.toISOString().slice(0, 16),
    end: end.toISOString().slice(0, 16),
  }
}

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700 },
  meta: { color: '#718096', fontSize: 13, marginTop: 4 },
  controls: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' },
  label: { fontSize: 13, color: '#4a5568', fontWeight: 600 },
  input: {
    border: '1px solid #cbd5e0', borderRadius: 6, padding: '6px 10px',
    fontSize: 13, outline: 'none',
  },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#2d3748' },
}

export default function EquipmentDetail({ equipmentId }: Props) {
  const { data: eq, isLoading } = useEquipmentDetail(equipmentId)
  const range = defaultRange()
  const [start, setStart] = useState(range.start)
  const [end, setEnd] = useState(range.end)

  if (isLoading || !eq) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#a0aec0' }}>Loading...</div>
  }

  const startIso = new Date(start).toISOString()
  const endIso = new Date(end).toISOString()

  return (
    <div>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>{eq.name}</div>
          <div style={styles.meta}>{eq.type} · {eq.location}</div>
        </div>
        <StatusBadge status={eq.status} />
      </div>

      <div style={styles.controls}>
        <span style={styles.label}>Time range:</span>
        <div>
          <label style={{ fontSize: 12, color: '#718096', display: 'block', marginBottom: 2 }}>Start</label>
          <input type="datetime-local" style={styles.input} value={start}
            onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#718096', display: 'block', marginBottom: 2 }}>End</label>
          <input type="datetime-local" style={styles.input} value={end}
            onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Temperature Over Time</div>
        <SensorChart equipmentId={equipmentId} start={startIso} end={endIso} />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Sensor Log</div>
        <SensorTable equipmentId={equipmentId} start={startIso} end={endIso} />
      </div>
    </div>
  )
}
