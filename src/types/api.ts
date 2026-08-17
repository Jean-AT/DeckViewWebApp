export type Role = 'ADMIN' | 'DEVELOPER' | 'VIEWER'
export type Provider = 'JENKINS' | 'VERCEL' | 'GITHUB_ACTIONS' | 'AWS' | 'FIREBASE'
export type Status = 'SUCCESS' | 'FAILED' | 'RUNNING' | 'CANCELLED' | 'QUEUED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type SyncStatus = 'ok' | 'skipped' | 'auth_error' | 'rate_limited' | 'error' | 'unsupported'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export interface Project {
  id: string
  name: string
  repoUrl: string | null
  provider: Provider
  providerConfig: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface Paginated<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}

export interface Deployment {
  id: string
  projectId: string
  provider: Provider
  status: Status
  externalId: string | null
  commitSha: string | null
  url: string | null
  logUrl: string | null
  durationMs: number | null
  startedAt: string
  finishedAt: string | null
  metadata: Record<string, unknown> | null
}

export interface Credential {
  id: string
  provider: Provider
  maskedPreview: string
  isValid: boolean
  createdAt: string
  updatedAt: string
  rotatedAt: string | null
}

export interface Ticket {
  id: string
  projectId: string
  deploymentId: string | null
  title: string
  description: string | null
  priority: Priority
  status: TicketStatus
  assignedTo: string | null
  createdAt: string
  project: { id: string; name: string }
}

export interface SyncResult {
  status: SyncStatus
  count?: number
  error?: string
}

export interface AuditLog {
  id: string
  userId: string | null
  action: string
  resourceType: string
  resourceId: string | null
  details: Record<string, unknown> | null
  createdAt: string
}

export interface ApiError {
  error: string
  details?: Record<string, string[]>
}