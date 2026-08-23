import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, Pencil, Play, RefreshCw, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/badge'
import { Eyebrow } from '../../components/ui/card'
import { EmptyState } from '../../components/ui/empty-state'
import { Spinner, PageLoader } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/toast'
import { ApiErrorResponse } from '../../lib/api'
import { useHasRole } from '../../lib/auth'
import { formatDate, timeAgo } from '../../lib/format'
import { PROVIDERS } from '../../lib/meta'
import { useDeployments, useDeleteProject, useProject, useSyncProject, useTriggerDeploy } from '../../queries/projects'
import { useTickets } from '../../queries/tickets'
import { TICKET_STATUS_META, PRIORITY_META } from '../../lib/meta'
import { ProjectFormModal } from './project-form-modal'
import { DeploymentsTable } from './deployments-table'
import { CredentialsSection } from './credentials-section'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isAdmin = useHasRole('ADMIN')
  const canWrite = useHasRole('ADMIN', 'DEVELOPER')

  const projectQuery = useProject(id)
  const deploymentsQuery = useDeployments(id)
  const ticketsQuery = useTickets({ projectId: id })
  const syncProject = useSyncProject()
  const triggerDeploy = useTriggerDeploy()
  const deleteProject = useDeleteProject()

  const [editOpen, setEditOpen] = useState(false)

  if (projectQuery.isLoading) return <PageLoader />

  const project = projectQuery.data
  if (!project) {
    return <EmptyState title="Project not found" action={<Link to="/projects" className="text-sm underline underline-offset-4">Back to projects</Link>} />
  }

  const provider = PROVIDERS[project.provider]

  const handleSync = async () => {
    try {
      const result = await syncProject.mutateAsync(project.id)
      if (result.status === 'ok') toast.push('success', `Synced ${result.count ?? 0} deployments`)
      else if (result.status === 'skipped') toast.push('info', result.error ?? 'Skipped — no credential stored')
      else toast.push('error', result.error ?? `Sync finished with status ${result.status}`)
    } catch (err) {
      toast.push('error', err instanceof ApiErrorResponse ? err.message : 'Sync failed')
    }
  }

  const handleTrigger = async () => {
    if (!window.confirm('Trigger a new deploy on the provider?')) return
    try {
      const result = await triggerDeploy.mutateAsync(project.id)
      if (result.status === 'ok') toast.push('success', 'Deploy triggered')
      else if (result.status === 'unsupported') toast.push('info', result.error ?? 'Provider does not support triggers')
      else toast.push('error', result.error ?? `Trigger finished with status ${result.status}`)
    } catch (err) {
      toast.push('error', err instanceof ApiErrorResponse ? err.message : 'Trigger failed')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete project "${project.name}"? This removes its deployments and tickets.`)) return
    try {
      await deleteProject.mutateAsync(project.id)
      toast.push('success', 'Project deleted')
      navigate('/projects')
    } catch (err) {
      toast.push('error', err instanceof ApiErrorResponse ? err.message : 'Unable to delete')
    }
  }

  const deployments = deploymentsQuery.data?.data ?? []
  const tickets = ticketsQuery.data?.data ?? []

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link to="/projects" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Projects
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <Eyebrow>{provider.label}</Eyebrow>
              <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                {provider.icon ? <provider.icon className="size-3.5" aria-hidden="true" /> : null}
              </span>
            </div>
            <h1 className="text-3xl tracking-tight">{project.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {project.repoUrl ? (
                <a href={project.repoUrl} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 transition-colors hover:text-foreground">
                  {project.repoUrl.replace(/^https?:\/\//, '')}
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:rotate-45" aria-hidden="true" />
                </a>
              ) : (
                <span>No repo linked</span>
              )}
              <span>·</span>
              <span>Updated {timeAgo(project.updatedAt)}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin ? (
              <Badge variant="outline">Sync: ADMIN</Badge>
            ) : null}
            {isAdmin ? (
              <button
                onClick={handleSync}
                disabled={syncProject.isPending}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-4 text-sm font-medium transition-colors hover:bg-accent-surface/10 disabled:opacity-50"
              >
                {syncProject.isPending ? <Spinner /> : <RefreshCw className="size-4" aria-hidden="true" />}
                Sync now
              </button>
            ) : null}
            {canWrite ? (
              <button
                onClick={handleTrigger}
                disabled={triggerDeploy.isPending}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
              >
                {triggerDeploy.isPending ? <Spinner className="text-primary-foreground" /> : <Play className="size-4" aria-hidden="true" />}
                Trigger deploy
              </button>
            ) : null}
            {canWrite ? (
              <>
                <button
                  onClick={() => setEditOpen(true)}
                  aria-label="Edit project"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-muted-foreground transition-colors hover:bg-accent-surface/10 hover:text-foreground"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </button>
                <button
                  onClick={handleDelete}
                  aria-label="Delete project"
                  disabled={deleteProject.isPending}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-danger/40 text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Eyebrow>Deployment history</Eyebrow>
          {deploymentsQuery.isFetching ? <Spinner /> : null}
        </div>
        <DeploymentsTable deployments={deployments} />
      </section>

      {isAdmin ? <CredentialsSection projectId={project.id} /> : null}

      <section className="flex flex-col gap-4">
        <Eyebrow>Tickets for this project</Eyebrow>
        {tickets.length === 0 ? (
          <EmptyState title="No tickets" description="Failed deployments create tickets automatically." />
        ) : (
          <ul className="divide-y divide-line border border-line bg-card">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link to={`/tickets/${ticket.id}`} className="flex flex-wrap items-center gap-3 px-6 py-3 text-sm transition-colors hover:bg-accent-surface/5">
                  <span className="font-medium">{ticket.title}</span>
                  <Badge variant={PRIORITY_META[ticket.priority].variant}>{PRIORITY_META[ticket.priority].label}</Badge>
                  <Badge variant={TICKET_STATUS_META[ticket.status].variant}>{TICKET_STATUS_META[ticket.status].label}</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ProjectFormModal open={editOpen} onClose={() => setEditOpen(false)} project={project} />
    </div>
  )
}