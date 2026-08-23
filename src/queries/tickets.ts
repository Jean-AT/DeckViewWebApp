import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Paginated, Ticket, TicketStatus, Priority } from '../types/api'
import { queryKeys } from './keys'

export interface TicketFilters {
  status?: TicketStatus
  priority?: Priority
  projectId?: string
  assignedTo?: string
}

export function useTickets(filters: TicketFilters = {}) {
  const query = new URLSearchParams()
  if (filters.status) query.set('status', filters.status)
  if (filters.priority) query.set('priority', filters.priority)
  if (filters.projectId) query.set('projectId', filters.projectId)
  if (filters.assignedTo) query.set('assignedTo', filters.assignedTo)
  query.set('limit', '100')
  const qs = query.toString()

  return useQuery({
    queryKey: queryKeys.tickets.list({ ...filters }),
    queryFn: () => apiFetch<Paginated<Ticket>>(`/tickets?${qs}`),
  })
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id ?? ''),
    queryFn: () => apiFetch<Ticket>(`/tickets/${id}`),
    enabled: Boolean(id),
  })
}

export interface TicketInput {
  projectId: string
  deploymentId?: string
  title: string
  description?: string
  priority?: Priority
  assignedTo?: string
}

export function useCreateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: TicketInput) => apiFetch<Ticket>('/tickets', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.tickets.all }),
  })
}

export interface TicketUpdate {
  title?: string
  description?: string
  priority?: Priority
  status?: TicketStatus
  assignedTo?: string | null
}

export function useUpdateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: TicketUpdate & { id: string }) =>
      apiFetch<Ticket>(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: queryKeys.tickets.all })
      void qc.invalidateQueries({ queryKey: queryKeys.tickets.detail(vars.id) })
    },
  })
}

export function useDeleteTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/tickets/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.tickets.all }),
  })
}