import { useState } from 'react'
import { ScrollText } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { EmptyState } from '../../components/ui/empty-state'
import { Field, Input } from '../../components/ui/field'
import { SectionHeader } from '../../components/ui/section-header'
import { PageLoader } from '../../components/ui/spinner'
import { formatDate } from '../../lib/format'
import { useAuditLogs, type AuditFilters } from '../../queries/audit'

export function AuditPage() {
  const [filters, setFilters] = useState<AuditFilters>({})
  const auditQuery = useAuditLogs(filters)

  if (auditQuery.isLoading) return <PageLoader />

  const logs = auditQuery.data?.data ?? []

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        index="05 / Audit"
        title="Every action on record."
        description="Admin-only log of mutations across projects, credentials, tickets and users."
      />

      <div className="grid gap-3 border border-line bg-card p-4 sm:grid-cols-3">
        <Field label="Action">
          <Input
            value={filters.action ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value || undefined }))}
            placeholder="project.create"
          />
        </Field>
        <Field label="Resource type">
          <Input
            value={filters.resourceType ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, resourceType: e.target.value || undefined }))}
            placeholder="project"
          />
        </Field>
        <Field label="User ID">
          <Input
            value={filters.userId ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value || undefined }))}
            placeholder="uuid"
          />
        </Field>
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No audit events" description="Actions performed through the API will appear here." />
      ) : (
        <div className="overflow-x-auto border border-line bg-card">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Time</th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Action</th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Resource</th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Resource ID</th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-accent-surface/5">
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{log.action}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.resourceType}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.resourceId ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.userId ?? 'system'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}