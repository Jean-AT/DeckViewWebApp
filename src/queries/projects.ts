import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Deployment, Paginated, Project, SyncResult } from '../types/api'
import { queryKeys } from './keys'

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => apiFetch<Paginated<Project>>('/projects?limit=100'),
  })
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id ?? ''),
    queryFn: () => apiFetch<Project>(`/projects/${id}`),
    enabled: Boolean(id),
  })
}

export function useDeployments(projectId: string | undefined, limit = 50) {
  return useQuery({
    queryKey: queryKeys.projects.deployments(projectId ?? ''),
    queryFn: () => apiFetch<Paginated<Deployment>>(`/projects/${projectId}/deployments?limit=${limit}`),
    enabled: Boolean(projectId),
  })
}

export interface ProjectInput {
  name: string
  repoUrl?: string
  provider: Project['provider']
  providerConfig?: Record<string, unknown>
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectInput) => apiFetch<Project>('/projects', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.projects.all }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: ProjectInput & { id: string }) =>
      apiFetch<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: queryKeys.projects.all })
      void qc.invalidateQueries({ queryKey: queryKeys.projects.detail(vars.id) })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/projects/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.projects.all }),
  })
}

export function useSyncProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<SyncResult>(`/projects/${id}/sync`, { method: 'POST' }),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.projects.deployments(id) })
      void qc.invalidateQueries({ queryKey: queryKeys.tickets.all })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useTriggerDeploy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<SyncResult>(`/projects/${id}/trigger`, { method: 'POST' }),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.projects.deployments(id) })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}