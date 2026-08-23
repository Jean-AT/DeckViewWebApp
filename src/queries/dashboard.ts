import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Deployment, Paginated, Project, Ticket } from '../types/api'
import { queryKeys } from './keys'

export interface DashboardData {
  projects: Project[]
  deployments: Deployment[]
  openTickets: number
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async (): Promise<DashboardData> => {
      const [projectsPage, ticketsPage] = await Promise.all([
        apiFetch<Paginated<Project>>('/projects?limit=100'),
        apiFetch<Paginated<Ticket>>('/tickets?status=OPEN&limit=1'),
      ])

      const deploymentPages = await Promise.all(
        projectsPage.data.map((p) =>
          apiFetch<Paginated<Deployment>>(`/projects/${p.id}/deployments?limit=30`).catch(() => ({
            data: [] as Deployment[],
            total: 0,
            limit: 0,
            offset: 0,
          })),
        ),
      )

      return {
        projects: projectsPage.data,
        deployments: deploymentPages.flatMap((page) => page.data),
        openTickets: ticketsPage.total,
      }
    },
    refetchInterval: 60_000,
  })
}