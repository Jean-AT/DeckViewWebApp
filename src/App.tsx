import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/app-shell'
import { PageLoader } from './components/ui/spinner'
import { useAuth, useHasRole } from './lib/auth'
import { LoginPage } from './features/auth/login-page'
import { RegisterPage } from './features/auth/register-page'

const DashboardPage = lazy(() =>
  import('./features/dashboard/dashboard-page').then((m) => ({ default: m.DashboardPage })),
)
const ProjectsPage = lazy(() => import('./features/projects/projects-page').then((m) => ({ default: m.ProjectsPage })))
const ProjectDetailPage = lazy(() =>
  import('./features/projects/project-detail-page').then((m) => ({ default: m.ProjectDetailPage })),
)
const TicketsPage = lazy(() => import('./features/tickets/tickets-page').then((m) => ({ default: m.TicketsPage })))
const TicketDetailPage = lazy(() =>
  import('./features/tickets/ticket-detail-page').then((m) => ({ default: m.TicketDetailPage })),
)
const UsersPage = lazy(() => import('./features/users/users-page').then((m) => ({ default: m.UsersPage })))
const AuditPage = lazy(() => import('./features/audit/audit-page').then((m) => ({ default: m.AuditPage })))

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function Protected() {
  const { user, initializing } = useAuth()
  if (initializing) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return <AppShell />
}

function AdminOnly() {
  const isAdmin = useHasRole('ADMIN')
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Protected />}>
        <Route path="/" element={<Lazy><DashboardPage /></Lazy>} />
        <Route path="/projects" element={<Lazy><ProjectsPage /></Lazy>} />
        <Route path="/projects/:id" element={<Lazy><ProjectDetailPage /></Lazy>} />
        <Route path="/tickets" element={<Lazy><TicketsPage /></Lazy>} />
        <Route path="/tickets/:id" element={<Lazy><TicketDetailPage /></Lazy>} />
        <Route element={<AdminOnly />}>
          <Route path="/users" element={<Lazy><UsersPage /></Lazy>} />
          <Route path="/audit" element={<Lazy><AuditPage /></Lazy>} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}