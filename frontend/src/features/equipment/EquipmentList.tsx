import { useEquipmentList } from '../../hooks/useEquipmentData'
import StatusBadge from '../../components/StatusBadge'
import type { Equipment } from '../../api/client'

interface Props {
  selectedId: number | null
  onSelect: (id: number) => void
}

const rowStyle = (selected: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '14px 20px',
  cursor: 'pointer',
  borderBottom: '1px solid #f0f0f0',
  background: selected ? '#ebf4ff' : 'transparent',
  borderLeft: selected ? '3px solid #3182ce' : '3px solid transparent',
  transition: 'background 0.15s',
})

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%' },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: 700,
    fontSize: 13,
    color: '#4a5568',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  list: { flex: 1, overflowY: 'auto' },
  rowTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: 600, fontSize: 14 },
  meta: { fontSize: 12, color: '#718096' },
  loading: { padding: 40, textAlign: 'center', color: '#a0aec0' },
  error: { padding: 20, color: '#e53e3e', fontSize: 13 },
}

function EquipmentRow({ eq, selected, onSelect }: { eq: Equipment; selected: boolean; onSelect: () => void }) {
  return (
    <div style={rowStyle(selected)} onClick={onSelect} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}>
      <div style={styles.rowTop}>
        <span style={styles.name}>{eq.name}</span>
        <StatusBadge status={eq.status} />
      </div>
      <div style={styles.meta}>{eq.type} · {eq.location}</div>
    </div>
  )
}

export default function EquipmentList({ selectedId, onSelect }: Props) {
  const { data, isLoading, error } = useEquipmentList()

  if (isLoading) return <div style={styles.loading}>Loading equipment...</div>
  if (error) return <div style={styles.error}>Failed to load equipment list.</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>Equipment ({data?.length ?? 0})</div>
      <div style={styles.list}>
        {data?.map((eq) => (
          <EquipmentRow
            key={eq.id}
            eq={eq}
            selected={selectedId === eq.id}
            onSelect={() => onSelect(eq.id)}
          />
        ))}
      </div>
    </div>
  )
}
