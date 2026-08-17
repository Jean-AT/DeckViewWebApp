import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROLE_META } from '../../lib/meta'
import { useAuth } from '../../lib/auth'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

export function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-none">{user.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
      </div>
      <Badge variant={ROLE_META[user.role].variant}>{ROLE_META[user.role].label}</Badge>
      <Button
        aria-label="Log out"
        size="icon"
        variant="ghost"
        onClick={() => {
          logout()
          navigate('/login')
        }}
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  )
}
