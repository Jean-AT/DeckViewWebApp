import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Priority, Ticket, TicketStatus } from '../types/api'
import { queryKeys } from './keys'

export interface TicketFilters {
  status?: TicketStatus
  priority?: Priority
  projectId?: string
  assignedTo?: string
}

export interface TicketInput {
  projectId: string
  deploymentId?: string | null
  title: string
  description?: string | null
  priority: Priority
  status?: TicketStatus
  assignedTo?: string | null
}

function toQuery(filters: TicketFilters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: queryKeys.tickets(filters),
    queryFn: () => apiFetch<Ticket[]>(`/tickets${toQuery(filters)}`),
  })
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.ticket(id ?? ''),
    enabled: Boolean(id),
    queryFn: () => apiFetch<Ticket>(`/tickets/${id}`),
  })
}

export function useCreateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: TicketInput) => apiFetch<Ticket>('/tickets', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  })
}

export function useUpdateTicket(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<TicketInput>) =>
      apiFetch<Ticket>(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] })
      qc.invalidateQueries({ queryKey: queryKeys.ticket(id) })
    },
  })
}

export function useDeleteTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/tickets/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  })
}
