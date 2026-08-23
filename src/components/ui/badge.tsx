import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type BadgeVariant = 'default' | 'secondary' | 'success' | 'danger' | 'warning' | 'accent' | 'outline'

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  success: 'border-success/30 bg-success/10 text-success',
  danger: 'border-danger/30 bg-danger/10 text-danger',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  accent: 'border-accent-surface/30 bg-accent-surface/10 text-accent-surface light:text-accent-surface',
  outline: 'border-line text-muted-foreground',
}

export function Badge({
  variant = 'default',
  className,
  children,
}: {
  variant?: BadgeVariant
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}