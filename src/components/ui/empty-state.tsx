import type { ComponentType } from 'react'
import { PackageOpen, type LucideProps } from 'lucide-react'
import { Button } from './button'

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
}: {
  icon?: ComponentType<LucideProps>
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <div className="grid max-w-sm gap-3 justify-items-center">
        <Icon className="size-8 text-muted-foreground" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <Button onClick={action.onClick}>{action.label}</Button> : null}
      </div>
    </div>
  )
}
