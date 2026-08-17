import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/badge'
import { StatusDot } from '../../components/ui/status-dot'
import { formatDate, formatDuration, shortSha } from '../../lib/format'
import { STATUS_META } from '../../lib/meta'
import type { Deployment } from '../../types/api'

export function DeploymentsTable({ deployments }: { deployments: Deployment[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-secondary text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Commit</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Started</th>
            <th className="px-4 py-3">Links</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {deployments.map((deployment) => (
            <tr key={deployment.id}>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <StatusDot status={deployment.status} />
                  <Badge variant={STATUS_META[deployment.status].variant}>{STATUS_META[deployment.status].label}</Badge>
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs">{shortSha(deployment.commitSha)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDuration(deployment.durationMs)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(deployment.startedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-3">
                  {deployment.url ? <Link className="inline-flex items-center gap-1 underline" to={deployment.url}>App <ArrowUpRight className="size-3" /></Link> : null}
                  {deployment.logUrl ? <Link className="inline-flex items-center gap-1 underline" to={deployment.logUrl}>Logs <ArrowUpRight className="size-3" /></Link> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
