import { cn } from '../../lib/cn'
import type { Status } from '../../types/api'

const statusClass: Record<Status, string> = {
  SUCCESS: 'bg-success',
  FAILED: 'bg-danger',
  RUNNING: 'bg-warning animate-pulse',
  QUEUED: 'bg-muted-foreground',
  CANCELLED: 'bg-muted-foreground',
}

export function StatusDot({ status }: { status: Status }) {
  return <span className={cn('inline-block size-2 rounded-full', statusClass[status])} />
}
