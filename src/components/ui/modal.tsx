import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <button aria-hidden="true" tabIndex={-1} className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('relative w-full border border-line bg-card p-6 shadow-2xl', wide ? 'max-w-2xl' : 'max-w-lg')}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}