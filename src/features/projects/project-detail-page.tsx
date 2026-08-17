import { ArrowLeft, Play, RefreshCw } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { EmptyState } from '../../components/ui/empty-state'
import { SectionHeader } from '../../components/ui/section-header'
import { Spinner } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/toast'
import { useHasRole } from '../../lib/auth'
import { PROVIDERS } from '../../lib/meta'
import { useProject, useProjectDeployments, useSyncProject, useTriggerProject } from '../../queries/projects'
import { CredentialsSection } from './credentials-section'
import { DeploymentsTable } from './deployments-table'

export function ProjectDetailPage() {
  const { id = '' } = useParams()
  const project = useProject(id)
  const deployments = useProjectDeployments(id)
  const sync = useSyncProject(id)
  const trigger = useTriggerProject(id)
  const isAdmin = useHasRole('ADMIN')
  const canTrigger = useHasRole('ADMIN', 'DEVELOPER')
  const { toast } = useToast()

  if (project.isLoading) return <Spinner />
  if (!project.data) return <EmptyState title="Project not found" />

  const provider = PROVIDERS[project.data.provider]

  return (
    <div className="grid gap-6">
      <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" to="/projects">
        <ArrowLeft className="size-4" /> Projects
      </Link>
      <SectionHeader
        title={project.data.name}
        description={`${provider.label} deployment history and operations.`}
        action={
          <div className="flex gap-2">
            {isAdmin ? (
              <Button variant="outline" loading={sync.isPending} onClick={async () => {
                const result = await sync.mutateAsync()
                toast(`Sync ${result.status}${result.count !== undefined ? `: ${result.count}` : ''}`, result.status === 'ok' ? 'success' : 'info')
              }}>
                <RefreshCw className="size-4" /> Sync
              </Button>
            ) : null}
            {canTrigger ? (
              <Button loading={trigger.isPending} onClick={async () => { await trigger.mutateAsync(); toast('Deployment triggered', 'success') }}>
                <Play className="size-4" /> Trigger
              </Button>
            ) : null}
          </div>
        }
      />
      <Card>
        <CardHeader><h2 className="font-semibold">Provider config</h2></CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-secondary p-4 font-mono text-xs text-muted-foreground">
            {JSON.stringify(project.data.providerConfig, null, 2)}
          </pre>
        </CardContent>
      </Card>
      <CredentialsSection projectId={id} isAdmin={isAdmin} />
      <Card>
        <CardHeader><h2 className="font-semibold">Deployments</h2></CardHeader>
        <CardContent>
          {deployments.isLoading ? <Spinner /> : null}
          {!deployments.isLoading && (deployments.data?.length ?? 0) === 0 ? <EmptyState title="No deployments yet" /> : null}
          {(deployments.data?.length ?? 0) > 0 ? <DeploymentsTable deployments={deployments.data ?? []} /> : null}
        </CardContent>
      </Card>
    </div>
  )
}
