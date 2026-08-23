import { Activity, LayoutDashboard, Layers, ScrollText, Ticket, Users, type LucideIcon } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { cn } from '../../lib/cn'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects', icon: Layers },
  { to: '/tickets', label: 'Tickets', icon: Ticket },
]

const ADMIN_ITEMS: NavItem[] = [
  { to: '/users', label: 'Users', icon: Users },
  { to: '/audit', label: 'Audit', icon: ScrollText },
]

export function AppShell() {
  const { user } = useAuth()
  const items = user?.role === 'ADMIN' ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1380px] items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-2" aria-label="DeckView home">
              <Activity className="size-5 text-accent-surface" aria-hidden="true" />
              <span className="text-sm font-semibold tracking-[0.08em]">DeckView</span>
            </NavLink>
            <nav className="hidden items-center md:flex" aria-label="Main navigation">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex h-16 items-center gap-2 px-4 text-sm font-medium transition-colors hover:bg-accent-surface/10',
                      isActive ? 'bg-accent-surface/10 text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )
                  }
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
        <nav className="flex overflow-x-auto border-t border-line md:hidden" aria-label="Mobile navigation">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 items-center justify-center gap-2 px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors',
                  isActive ? 'bg-accent-surface/10 text-foreground' : 'text-muted-foreground',
                )
              }
            >
              <item.icon className="size-3.5" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1380px] flex-1 px-4 py-8 md:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1380px] items-center justify-between px-4 py-4 md:px-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">DeckView</span>
          <span className="text-xs text-muted-foreground">Internal DevOps dashboard</span>
        </div>
      </footer>
    </div>
  )
}