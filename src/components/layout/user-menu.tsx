import { LogOut } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { ROLE_META } from '../../lib/meta'
import { Badge } from '../ui/badge'

export function UserMenu() {
  const { user, logout } = useAuth()
  if (!user) return null

  const role = ROLE_META[user.role]

  return (
    <div className="flex items-center gap-3">
      <div className="hidden flex-col items-end sm:flex">
        <span className="text-sm leading-tight font-medium">{user.name}</span>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>
      <Badge variant={role.variant}>{role.label}</Badge>
      <button
        onClick={logout}
        aria-label="Sign out"
        title="Sign out"
        className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  )
}