import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'accent' | 'success' | 'danger' | 'warning'

const variants: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  outline: 'border-border bg-transparent text-muted-foreground',
  accent: 'border-transparent bg-accent text-accent-foreground',
  success: 'border-success/25 bg-success/12 text-success',
  danger: 'border-danger/25 bg-danger/12 text-danger',
  warning: 'border-warning/25 bg-warning/12 text-warning',
}

export function Badge({ className, variant = 'default', ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium leading-none',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
