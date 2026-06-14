import type { Equipment } from '../api/client'

interface Props {
  status: Equipment['status']
}

const colorMap: Record<Equipment['status'], { bg: string; text: string }> = {
  RUNNING: { bg: '#c6f6d5', text: '#276749' },
  IDLE: { bg: '#e2e8f0', text: '#4a5568' },
  ALARM: { bg: '#fed7d7', text: '#9b2c2c' },
  MAINTENANCE: { bg: '#feebc8', text: '#7b341e' },
}

export default function StatusBadge({ status }: Props) {
  const colors = colorMap[status]
  return (
    <span
      style={{
        background: colors.bg,
        color: colors.text,
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
        display: 'inline-block',
      }}
    >
      {status}
    </span>
  )
}
