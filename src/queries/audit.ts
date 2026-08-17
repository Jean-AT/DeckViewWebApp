import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { AuditLog } from '../types/api'
import { queryKeys } from './keys'

export interface AuditFilters {
  action?: string
  resourceType?: string
  userId?: string
}

function toQuery(filters: AuditFilters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function useAuditLogs(filters?: AuditFilters) {
  return useQuery({
    queryKey: queryKeys.auditLogs(filters),
    queryFn: () => apiFetch<AuditLog[]>(`/audit-logs${toQuery(filters)}`),
  })
}
