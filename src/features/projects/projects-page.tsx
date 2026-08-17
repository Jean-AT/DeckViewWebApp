import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { EmptyState } from '../../components/ui/empty-state'
import { SectionHeader } from '../../components/ui/section-header'
import { Spinner } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/toast'
import { PROVIDERS } from '../../lib/meta'
import { useHasRole } from '../../lib/auth'
import type { Project } from '../../types/api'
import { useCreateProject, useDeleteProject, useProjects, useUpdateProject } from '../../queries/projects'
import { ProjectFormModal } from './project-form-modal'

export function ProjectsPage() {
  const projects = useProjects()
  const create = useCreateProject()
  const deleteProject = useDeleteProject()
  const isAdmin = useHasRole('ADMIN')
  const [editing, setEditing] = useState<Project | null>(null)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Projects"
        description="Deployment sources and provider configuration."
        action={isAdmin ? <Button onClick={() => setCreating(true)}><Plus className="size-4" /> New project</Button> : null}
      />
      {projects.isLoading ? <Spinner /> : null}
      {!projects.isLoading && (projects.data?.length ?? 0) === 0 ? (
        <EmptyState title="No projects yet" action={isAdmin ? { label: 'Create project', onClick: () => setCreating(true) } : undefined} />
      ) : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(projects.data ?? []).map((project) => {
          const meta = PROVIDERS[project.provider]
          return (
            <Card key={project.id}>
              <CardContent className="grid gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <meta.icon className="size-4 text-muted-foreground" />
                      <h2 className="font-semibold">{project.name}</h2>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{meta.label}</p>
                  </div>
                  <Link className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" to={`/projects/${project.id}`}>
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
                {project.repoUrl ? <p className="truncate font-mono text-xs text-muted-foreground">{project.repoUrl}</p> : null}
                {isAdmin ? (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(project)}><Pencil className="size-4" /> Edit</Button>
                    <Button size="sm" variant="danger" onClick={async () => {
                      await deleteProject.mutateAsync(project.id)
                      toast('Project deleted', 'success')
                    }}>
                      <Trash2 className="size-4" /> Delete
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>
      <ProjectFormModal
        open={creating}
        onClose={() => setCreating(false)}
        loading={create.isPending}
        onSubmit={async (input) => {
          await create.mutateAsync(input)
          toast('Project created', 'success')
        }}
      />
      {editing ? <EditProjectModal project={editing} onClose={() => setEditing(null)} /> : null}
    </div>
  )
}

function EditProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const update = useUpdateProject(project.id)
  const { toast } = useToast()
  return (
    <ProjectFormModal
      open
      project={project}
      onClose={onClose}
      loading={update.isPending}
      onSubmit={async (input) => {
        await update.mutateAsync(input)
        toast('Project updated', 'success')
      }}
    />
  )
}
