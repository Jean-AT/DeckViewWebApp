import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { Status } from '../../types/api'

const STATUS_DOT: Record<Status, string> = {
  SUCCESS: 'bg-success',
  FAILED: 'bg-danger',
  RUNNING: 'bg-warning animate-pulse',
  QUEUED: 'bg-muted-foreground',
  CANCELLED: 'bg-muted-foreground',
}

export function StatusDot({ status, className }: { status: Status; className?: string }) {
  return <span aria-hidden="true" className={cn('inline-block size-2 shrink-0 rounded-full', STATUS_DOT[status], className)} />
}

export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1 border border-line bg-card p-6', className)}>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      <span className="font-mono text-3xl font-light tracking-tight text-foreground">{value}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}