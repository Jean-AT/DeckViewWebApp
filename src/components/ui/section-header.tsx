import type { ReactNode } from 'react'

export function SectionHeader({
  index,
  title,
  description,
  action,
}: {
  index?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        {index ? (
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{index}</p>
        ) : null}
        <h1 className="text-2xl tracking-tight md:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}