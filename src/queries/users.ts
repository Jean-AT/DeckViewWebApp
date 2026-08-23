import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Credential, Paginated, Provider, User, Role } from '../types/api'
import { queryKeys } from './keys'

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => apiFetch<Paginated<User>>('/users?limit=100'),
  })
}

export interface UserInput {
  name: string
  email: string
  password: string
  role: Role
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UserInput) => apiFetch<User>('/users', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; name?: string; email?: string; role?: Role }) =>
      apiFetch<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      apiFetch<{ ok: boolean }>(`/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  })
}

export function useCredentials(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.credentials(projectId ?? ''),
    queryFn: () => apiFetch<{ data: Credential[] }>(`/projects/${projectId}/credentials`),
    enabled: Boolean(projectId),
  })
}

export function useCreateCredential(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { provider: Provider; value: string }) =>
      apiFetch<Credential>(`/projects/${projectId}/credentials`, { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.projects.credentials(projectId) }),
  })
}

export function useRotateCredential(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ provider, value }: { provider: Provider; value: string }) =>
      apiFetch<Credential>(`/projects/${projectId}/credentials/${provider}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.projects.credentials(projectId) }),
  })
}

export function useTestCredential(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (provider: Provider) =>
      apiFetch<{ ok: boolean; error?: string }>(`/projects/${projectId}/credentials/${provider}/test`, {
        method: 'POST',
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.projects.credentials(projectId) }),
  })
}

export function useDeleteCredential(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (provider: Provider) =>
      apiFetch<void>(`/projects/${projectId}/credentials/${provider}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.projects.credentials(projectId) }),
  })
}