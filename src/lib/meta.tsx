import type { ComponentType } from 'react'
import {
  Cloud,
  Flame,
  GitBranch,
  Triangle,
  Wrench,
  type LucideProps,
} from 'lucide-react'
import type { Priority, Provider, Role, Status, TicketStatus } from '../types/api'
import type { BadgeVariant } from '../components/ui/badge'

type IconComponent = ComponentType<LucideProps>

export const PROVIDERS: Record<Provider, { label: string; icon: IconComponent }> = {
  JENKINS: { label: 'Jenkins', icon: Wrench },
  VERCEL: { label: 'Vercel', icon: Triangle },
  GITHUB_ACTIONS: { label: 'GitHub Actions', icon: GitBranch },
  AWS: { label: 'AWS', icon: Cloud },
  FIREBASE: { label: 'Firebase', icon: Flame },
}

export const PROVIDER_LIST = Object.keys(PROVIDERS) as Provider[]

export const STATUS_META: Record<Status, { label: string; variant: BadgeVariant }> = {
  SUCCESS: { label: 'Success', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'danger' },
  RUNNING: { label: 'Running', variant: 'warning' },
  QUEUED: { label: 'Queued', variant: 'secondary' },
  CANCELLED: { label: 'Cancelled', variant: 'secondary' },
}

export const TICKET_STATUS_META: Record<TicketStatus, { label: string; variant: BadgeVariant }> = {
  OPEN: { label: 'Open', variant: 'warning' },
  IN_PROGRESS: { label: 'In progress', variant: 'accent' },
  RESOLVED: { label: 'Resolved', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'secondary' },
}

export const PRIORITY_META: Record<Priority, { label: string; variant: BadgeVariant }> = {
  LOW: { label: 'Low', variant: 'secondary' },
  MEDIUM: { label: 'Medium', variant: 'outline' },
  HIGH: { label: 'High', variant: 'warning' },
  CRITICAL: { label: 'Critical', variant: 'danger' },
}

export const ROLE_META: Record<Role, { label: string; variant: BadgeVariant }> = {
  ADMIN: { label: 'Admin', variant: 'accent' },
  DEVELOPER: { label: 'Developer', variant: 'secondary' },
  VIEWER: { label: 'Viewer', variant: 'outline' },
}

export const PROVIDER_CONFIG_HINTS: Record<Provider, string> = {
  VERCEL: '{ "vercelProjectId": "prj_xxx" }',
  JENKINS: '{ "jenkinsUrl": "https://jenkins.example.com", "jobName": "backend-api" }',
  AWS: '{ "region": "us-east-1", "cluster": "prod", "service": "backend-api" }',
  FIREBASE: '{ "firebaseSiteId": "my-site", "firebaseProjectId": "my-project" }',
  GITHUB_ACTIONS: '{ "owner": "org", "repo": "backend" }',
}