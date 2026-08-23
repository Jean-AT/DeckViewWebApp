export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    deployments: (id: string) => ['projects', id, 'deployments'] as const,
    credentials: (id: string) => ['projects', id, 'credentials'] as const,
  },
  tickets: {
    all: ['tickets'] as const,
    list: (filters: Record<string, string | undefined>) => ['tickets', 'list', filters] as const,
    detail: (id: string) => ['tickets', id] as const,
  },
  users: {
    all: ['users'] as const,
  },
  audit: {
    list: (filters: Record<string, string | undefined>) => ['audit-logs', filters] as const,
  },
  dashboard: ['dashboard'] as const,
}