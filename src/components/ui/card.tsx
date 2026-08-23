import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border border-line bg-card', className)} {...props} />
}

export function CardBrackets() {
  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute top-2 left-2 size-2 border-t border-l border-line/70" />
      <span aria-hidden="true" className="pointer-events-none absolute top-2 right-2 size-2 border-t border-r border-line/70" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-2 size-2 border-b border-l border-line/70" />
      <span aria-hidden="true" className="pointer-events-none absolute right-2 bottom-2 size-2 border-r border-b border-line/70" />
    </>
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 border-b border-line p-6', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg tracking-tight', className)} {...props} />
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm leading-relaxed text-muted-foreground', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props} />
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground', className)}>
      {children}
    </p>
  )
}