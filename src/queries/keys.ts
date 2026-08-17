export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  projectDeployments: (id: string) => ['projects', id, 'deployments'] as const,
  credentials: (projectId: string) => ['projects', projectId, 'credentials'] as const,
  deployments: ['deployments'] as const,
  tickets: (filters?: Record<string, unknown>) => ['tickets', filters ?? {}] as const,
  ticket: (id: string) => ['tickets', id] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  auditLogs: (filters?: Record<string, unknown>) => ['audit-logs', filters ?? {}] as const,
}
