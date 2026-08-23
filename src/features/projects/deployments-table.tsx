import { ArrowUpRight, FileText } from 'lucide-react'
import { EmptyState } from '../../components/ui/empty-state'
import { StatusDot } from '../../components/ui/stat'
import { formatDate, formatDuration, shortSha } from '../../lib/format'
import { STATUS_META } from '../../lib/meta'
import type { Deployment } from '../../types/api'

export function DeploymentsTable({ deployments }: { deployments: Deployment[] }) {
  if (deployments.length === 0) {
    return (
      <EmptyState
        title="No deployments synced"
        description="Run a sync to pull the deployment history from the provider."
      />
    )
  }

  return (
    <div className="overflow-x-auto border border-line bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Status</th>
            <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Build</th>
            <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Commit</th>
            <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Duration</th>
            <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Started</th>
            <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Links</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {deployments.map((dep) => {
            const meta = STATUS_META[dep.status]
            return (
              <tr key={dep.id} className="transition-colors hover:bg-accent-surface/5">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 font-medium">
                    <StatusDot status={dep.status} />
                    {meta.label}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{dep.externalId ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{shortSha(dep.commitSha)}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{formatDuration(dep.durationMs)}</td>
                <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">{formatDate(dep.startedAt)}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3">
                    {dep.url ? (
                      <a
                        href={dep.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Deploy
                        <ArrowUpRight className="size-3 transition-transform group-hover:rotate-45" aria-hidden="true" />
                      </a>
                    ) : null}
                    {dep.logUrl ? (
                      <a
                        href={dep.logUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <FileText className="size-3" aria-hidden="true" />
                        Logs
                      </a>
                    ) : null}
                    {!dep.url && !dep.logUrl ? <span className="text-xs text-muted-foreground">—</span> : null}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}