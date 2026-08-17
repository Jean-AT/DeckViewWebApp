import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Paginated, Role, User } from '../types/api'
import { queryKeys } from './keys'

export interface UserInput {
  name: string
  email: string
  role: Role
  password?: string
}

export function useUsers() {
  return useQuery({ queryKey: queryKeys.users, queryFn: () => apiFetch<Paginated<User>>('/users').then((r) => r.data) })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UserInput) => apiFetch<User>('/users', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  })
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Omit<UserInput, 'password'>>) =>
      apiFetch<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  })
}

export function useResetPassword(id: string) {
  return useMutation({
    mutationFn: (password: string) =>
      apiFetch<void>(`/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }),
  })
}
