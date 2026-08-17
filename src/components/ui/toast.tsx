import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../lib/cn'

type ToastKind = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  title: string
  kind: ToastKind
}

const ToastContext = createContext<{ toast: (title: string, kind?: ToastKind) => void } | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const remove = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), [])
  const toast = useCallback(
    (title: string, kind: ToastKind = 'info') => {
      const id = Date.now() + Math.random()
      setItems((current) => [...current, { id, title, kind }])
      window.setTimeout(() => remove(id), 3500)
    },
    [remove],
  )
  const value = useMemo(() => ({ toast }), [toast])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] grid w-[min(24rem,calc(100vw-2rem))] gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 text-sm shadow-lg',
              item.kind === 'success' && 'border-success/30',
              item.kind === 'error' && 'border-danger/30',
            )}
          >
            <span>{item.title}</span>
            <Button size="icon" variant="ghost" onClick={() => remove(item.id)}>
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
