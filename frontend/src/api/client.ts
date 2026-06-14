import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

export interface Equipment {
  id: number
  name: string
  type: string
  location: string
  status: 'RUNNING' | 'IDLE' | 'ALARM' | 'MAINTENANCE'
}

export interface SensorLog {
  id: number
  equipmentId: number
  recordedAt: string
  temperature: number | null
  pressure: number | null
  throughput: number | null
}

export interface SensorSummary {
  hour: string
  avgTemperature: number | null
  avgPressure: number | null
  avgThroughput: number | null
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export async function fetchEquipment(): Promise<Equipment[]> {
  const res = await apiClient.get<Equipment[]>('/equipment')
  return res.data
}

export async function fetchEquipmentById(id: number): Promise<Equipment> {
  const res = await apiClient.get<Equipment>(`/equipment/${id}`)
  return res.data
}

export async function fetchSensorLogs(
  id: number,
  start: string,
  end: string,
  page: number,
  size: number
): Promise<Page<SensorLog>> {
  const res = await apiClient.get<Page<SensorLog>>(`/equipment/${id}/metrics`, {
    params: { start, end, page, size },
  })
  return res.data
}

export async function fetchSensorSummary(
  id: number,
  start: string,
  end: string
): Promise<SensorSummary[]> {
  const res = await apiClient.get<SensorSummary[]>(`/equipment/${id}/summary`, {
    params: { start, end },
  })
  return res.data
}
