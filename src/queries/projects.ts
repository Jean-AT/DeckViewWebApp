import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Credential, Deployment, Paginated, Project, Provider, SyncResult } from '../types/api'
import { queryKeys } from './keys'

export interface ProjectInput {
  name: string
  repoUrl?: string | null
  provider: Provider
  providerConfig: Record<string, unknown>
}

export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects, queryFn: () => apiFetch<Paginated<Project>>('/projects').then((r) => r.data) })
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.project(id ?? ''),
    enabled: Boolean(id),
    queryFn: () => apiFetch<Project>(`/projects/${id}`),
  })
}

export function useProjectDeployments(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projectDeployments(id ?? ''),
    enabled: Boolean(id),
    queryFn: () => apiFetch<Paginated<Deployment>>(`/projects/${id}/deployments`).then((r) => r.data),
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectInput) => apiFetch<Project>('/projects', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  })
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<ProjectInput>) =>
      apiFetch<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects })
      qc.invalidateQueries({ queryKey: queryKeys.project(id) })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/projects/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  })
}

export function useSyncProject(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch<SyncResult>(`/projects/${id}/sync`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projectDeployments(id) }),
  })
}

export function useTriggerProject(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch<Deployment>(`/projects/${id}/trigger`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projectDeployments(id) }),
  })
}

export function useCredentials(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.credentials(projectId ?? ''),
    enabled: Boolean(projectId),
    queryFn: () => apiFetch<Credential[]>(`/projects/${projectId}/credentials`),
  })
}

export interface CredentialInput {
  provider: Provider
  token: string
}

export function useCreateCredential(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CredentialInput) =>
      apiFetch<Credential>(`/projects/${projectId}/credentials`, { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.credentials(projectId) }),
  })
}

export function useRotateCredential(projectId: string, provider: Provider) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (token: string) =>
      apiFetch<Credential>(`/projects/${projectId}/credentials/${provider}`, {
        method: 'PUT',
        body: JSON.stringify({ token }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.credentials(projectId) }),
  })
}

export function useRevokeCredential(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (provider: Provider) => apiFetch<void>(`/projects/${projectId}/credentials/${provider}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.credentials(projectId) }),
  })
}

export function useTestCredential(projectId: string) {
  return useMutation({
    mutationFn: (provider: Provider) =>
      apiFetch<{ ok: boolean; error?: string }>(`/projects/${projectId}/credentials/${provider}/test`, { method: 'POST' }),
  })
}
