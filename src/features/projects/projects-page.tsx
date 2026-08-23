import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/badge'
import { CardBrackets } from '../../components/ui/card'
import { EmptyState } from '../../components/ui/empty-state'
import { SectionHeader } from '../../components/ui/section-header'
import { PageLoader } from '../../components/ui/spinner'
import { StatusDot } from '../../components/ui/stat'
import { useHasRole } from '../../lib/auth'
import { timeAgo } from '../../lib/format'
import { PROVIDERS, STATUS_META } from '../../lib/meta'
import { useProjects } from '../../queries/projects'
import { useDashboard } from '../../queries/dashboard'
import { Button } from '../../components/ui/button'
import type { Status } from '../../types/api'
import { ProjectFormModal } from './project-form-modal'

export function ProjectsPage() {
  const projectsQuery = useProjects()
  const dashboardQuery = useDashboard()
  const canWrite = useHasRole('ADMIN', 'DEVELOPER')
  const [formOpen, setFormOpen] = useState(false)

  const lastStatusByProject = useMemo(() => {
    const map = new Map<string, { status: Status; at: string }>()
    for (const dep of dashboardQuery.data?.deployments ?? []) {
      const current = map.get(dep.projectId)
      if (!current || new Date(dep.startedAt) > new Date(current.at)) {
        map.set(dep.projectId, { status: dep.status, at: dep.startedAt })
      }
    }
    return map
  }, [dashboardQuery.data])

  if (projectsQuery.isLoading) return <PageLoader />

  const projects = projectsQuery.data?.data ?? []

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        index="02 / Projects"
        title="Every pipeline in one deck."
        description="Projects connected to Jenkins, Vercel, GitHub Actions, AWS and Firebase."
        action={
          canWrite ? (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              New project
            </Button>
          ) : undefined
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description={canWrite ? 'Create your first project to start syncing deployments.' : 'An admin needs to create a project first.'}
          action={
            canWrite ? (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="size-4" aria-hidden="true" />
                New project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const provider = PROVIDERS[project.provider]
            const last = lastStatusByProject.get(project.id)
            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group relative flex flex-col gap-4 border border-line bg-card p-6 transition-colors hover:bg-accent-surface/10"
              >
                <CardBrackets />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <provider.icon className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {provider.label}
                    </span>
                  </div>
                  {last ? (
                    <Badge variant={STATUS_META[last.status].variant}>{STATUS_META[last.status].label}</Badge>
                  ) : (
                    <Badge variant="outline">No data</Badge>
                  )}
                </div>
                <div>
                  <h3 className="text-lg tracking-tight">{project.name}</h3>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{project.repoUrl ?? 'No repo linked'}</p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    {last ? (
                      <>
                        <StatusDot status={last.status} />
                        Last deploy {timeAgo(last.at)}
                      </>
                    ) : (
                      'Never synced'
                    )}
                  </span>
                  <span className="font-mono">created {timeAgo(project.createdAt)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <ProjectFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}