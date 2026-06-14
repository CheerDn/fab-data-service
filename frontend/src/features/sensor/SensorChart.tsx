import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useSensorSummary } from '../../hooks/useEquipmentData'

interface Props {
  equipmentId: number
  start: string
  end: string
}

export default function SensorChart({ equipmentId, start, end }: Props) {
  const { data, isLoading, error } = useSensorSummary(equipmentId, start, end)

  if (isLoading) return <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0' }}>Loading chart...</div>
  if (error) return <div style={{ color: '#e53e3e', padding: 16 }}>Failed to load chart data.</div>
  if (!data || data.length === 0) return <div style={{ padding: 24, color: '#a0aec0', textAlign: 'center' }}>No data for selected time range.</div>

  const chartData = data.map((point) => ({
    time: new Date(point.hour).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    temperature: point.avgTemperature !== null ? Number(point.avgTemperature.toFixed(2)) : null,
  }))

  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: '16px 8px 8px' }}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: '#718096' }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11, fill: '#718096' }} unit="°C" />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            formatter={(value: number) => [`${value}°C`, 'Avg Temperature']}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="temperature"
            name="Avg Temperature (°C)"
            stroke="#3182ce"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
