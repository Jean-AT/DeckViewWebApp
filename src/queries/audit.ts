import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { AuditLog, Paginated } from '../types/api'
import { queryKeys } from './keys'

export interface AuditFilters {
  action?: string
  resourceType?: string
  userId?: string
}

export function useAuditLogs(filters: AuditFilters = {}) {
  const query = new URLSearchParams()
  if (filters.action) query.set('action', filters.action)
  if (filters.resourceType) query.set('resourceType', filters.resourceType)
  if (filters.userId) query.set('userId', filters.userId)
  query.set('limit', '100')

  return useQuery({
    queryKey: queryKeys.audit.list({ ...filters }),
    queryFn: () => apiFetch<Paginated<AuditLog>>(`/audit-logs?${query.toString()}`),
  })
}