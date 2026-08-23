import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '../../lib/cn'

type ToastKind = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

interface ToastContextValue {
  push: (kind: ToastKind, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = ++counter.current
    setToasts((prev) => [...prev, { id, kind, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed right-4 bottom-4 z-[60] flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-start gap-3 border border-line bg-card p-3 shadow-xl">
            {t.kind === 'success' ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" /> : null}
            {t.kind === 'error' ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" /> : null}
            {t.kind === 'info' ? <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : null}
            <p className={cn('flex-1 text-sm', t.kind === 'error' && 'text-danger')}>{t.message}</p>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}