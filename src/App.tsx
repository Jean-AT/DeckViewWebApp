import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/layout/app-shell'
import { Spinner } from './components/ui/spinner'
import { useAuth } from './lib/auth'
import type { Role } from './types/api'
import { LoginPage, RegisterPage } from './features/auth/auth-pages'
import { DashboardPage } from './features/dashboard/dashboard-page'
import { ProjectsPage } from './features/projects/projects-page'
import { ProjectDetailPage } from './features/projects/project-detail-page'
import { TicketsPage } from './features/tickets/tickets-page'
import { TicketDetailPage } from './features/tickets/ticket-detail-page'
import { UsersPage } from './features/users/users-page'
import { AuditPage } from './features/audit/audit-page'

function RequireAuth({ roles, children }: { roles?: Role[]; children: React.ReactNode }) {
  const { user, initializing } = useAuth()
  const location = useLocation()
  if (initializing) {
    return <div className="grid min-h-screen place-items-center"><Spinner /></div>
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="users" element={<RequireAuth roles={['ADMIN']}><UsersPage /></RequireAuth>} />
        <Route path="audit" element={<RequireAuth roles={['ADMIN']}><AuditPage /></RequireAuth>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
