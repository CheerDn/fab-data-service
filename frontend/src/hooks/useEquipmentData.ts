import { useQuery } from '@tanstack/react-query'
import {
  fetchEquipment,
  fetchEquipmentById,
  fetchSensorLogs,
  fetchSensorSummary,
} from '../api/client'

export function useEquipmentList() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: fetchEquipment,
  })
}

export function useEquipmentDetail(id: number) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => fetchEquipmentById(id),
    enabled: id > 0,
  })
}

export function useSensorLogs(id: number, start: string, end: string, page: number) {
  return useQuery({
    queryKey: ['sensor-logs', id, start, end, page],
    queryFn: () => fetchSensorLogs(id, start, end, page, 200),
    enabled: id > 0,
  })
}

export function useSensorSummary(id: number, start: string, end: string) {
  return useQuery({
    queryKey: ['sensor-summary', id, start, end],
    queryFn: () => fetchSensorSummary(id, start, end),
    enabled: id > 0,
  })
}
