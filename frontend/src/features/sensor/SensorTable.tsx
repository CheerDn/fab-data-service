import { useState, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useSensorLogs } from '../../hooks/useEquipmentData'
import type { SensorLog } from '../../api/client'

interface Props {
  equipmentId: number
  start: string
  end: string
}

const COL_WIDTHS = [200, 120, 120, 120]
const HEADERS = ['Recorded At', 'Temperature (°C)', 'Pressure (Pa)', 'Throughput']
const ROW_HEIGHT = 36

const styles: Record<string, React.CSSProperties> = {
  wrapper: { border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' },
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px', background: '#f7fafc', borderBottom: '1px solid #e2e8f0',
  },
  info: { fontSize: 13, color: '#4a5568' },
  toggle: {
    fontSize: 12, padding: '4px 12px', borderRadius: 6,
    border: '1px solid #cbd5e0', background: '#fff', cursor: 'pointer',
    color: '#4a5568',
  },
  pagination: { display: 'flex', gap: 8, alignItems: 'center', padding: '10px 16px', borderTop: '1px solid #e2e8f0', background: '#f7fafc' },
  pageBtn: { padding: '4px 12px', borderRadius: 6, border: '1px solid #cbd5e0', background: '#fff', cursor: 'pointer', fontSize: 13 },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { background: '#f7fafc', fontWeight: 600, fontSize: 12, color: '#4a5568', padding: '10px 12px', textAlign: 'left' as const, borderBottom: '1px solid #e2e8f0' },
  td: { padding: '8px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0', color: '#2d3748' },
  scrollContainer: { overflowY: 'auto' as const, maxHeight: 400, position: 'relative' as const },
}

function fmt(v: number | null) {
  return v !== null ? v.toFixed(2) : '—'
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString()
}

function VirtualizedBody({ rows }: { rows: SensorLog[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  return (
    <div ref={parentRef} style={styles.scrollContainer}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: virtualRow.start,
                left: 0,
                right: 0,
                height: ROW_HEIGHT,
                display: 'grid',
                gridTemplateColumns: COL_WIDTHS.map((w) => `${w}px`).join(' '),
                borderBottom: '1px solid #f0f0f0',
                alignItems: 'center',
              }}
            >
              <span style={styles.td}>{fmtDate(row.recordedAt)}</span>
              <span style={styles.td}>{fmt(row.temperature)}</span>
              <span style={styles.td}>{fmt(row.pressure)}</span>
              <span style={styles.td}>{fmt(row.throughput)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PlainBody({ rows }: { rows: SensorLog[] }) {
  return (
    <div style={styles.scrollContainer}>
      <table style={styles.table}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td style={{ ...styles.td, width: COL_WIDTHS[0] }}>{fmtDate(row.recordedAt)}</td>
              <td style={{ ...styles.td, width: COL_WIDTHS[1] }}>{fmt(row.temperature)}</td>
              <td style={{ ...styles.td, width: COL_WIDTHS[2] }}>{fmt(row.pressure)}</td>
              <td style={{ ...styles.td, width: COL_WIDTHS[3] }}>{fmt(row.throughput)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function SensorTable({ equipmentId, start, end }: Props) {
  const [page, setPage] = useState(0)
  const [virtualized, setVirtualized] = useState(true)
  const { data, isLoading, error } = useSensorLogs(equipmentId, start, end, page)

  const rows = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  if (isLoading) return <div style={{ padding: 24, textAlign: 'center', color: '#a0aec0' }}>Loading sensor data...</div>
  if (error) return <div style={{ padding: 24, color: '#e53e3e' }}>Failed to load sensor logs.</div>

  return (
    <div style={styles.wrapper}>
      <div style={styles.toolbar}>
        <span style={styles.info}>
          {totalElements.toLocaleString()} records · page {page + 1} of {Math.max(totalPages, 1)}
        </span>
        <button
          style={styles.toggle}
          onClick={() => setVirtualized((v) => !v)}
        >
          {virtualized ? 'Disable virtualization' : 'Enable virtualization'}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COL_WIDTHS.map((w) => `${w}px`).join(' '), minWidth: COL_WIDTHS.reduce((a, b) => a + b, 0) }}>
          {HEADERS.map((h) => (
            <div key={h} style={styles.th}>{h}</div>
          ))}
        </div>
        {virtualized ? <VirtualizedBody rows={rows} /> : <PlainBody rows={rows} />}
      </div>

      <div style={styles.pagination}>
        <button style={styles.pageBtn} disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          ← Prev
        </button>
        <span style={{ fontSize: 13, color: '#4a5568' }}>Page {page + 1}</span>
        <button style={styles.pageBtn} disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Next →
        </button>
      </div>
    </div>
  )
}
