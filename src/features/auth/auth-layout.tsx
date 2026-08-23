import { Activity } from 'lucide-react'
import type { ReactNode } from 'react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <Activity className="size-6 text-accent-surface" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-[0.08em]">DeckView</span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Internal DevOps dashboard
          </p>
        </div>
        <div className="border border-line bg-card p-8">{children}</div>
      </div>
    </div>
  )
}