import type { LucideIcon } from 'lucide-react'
import { PackageOpen } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-line p-10 text-center">
      <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  )
}