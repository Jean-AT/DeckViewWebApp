import { Search } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { EmptyState } from '../../components/ui/empty-state'
import { Input } from '../../components/ui/form'
import { SectionHeader } from '../../components/ui/section-header'
import { Spinner } from '../../components/ui/spinner'
import { formatDate } from '../../lib/format'
import { useAuditLogs, type AuditFilters } from '../../queries/audit'

export function AuditPage() {
  const [filters, setFilters] = useState<AuditFilters>({})
  const logs = useAuditLogs(filters)
  return (
    <div className="grid gap-6">
      <SectionHeader title="Audit" description="Administrative activity and resource changes." />
      <Card>
        <CardContent className="grid gap-3 md:grid-cols-[auto_1fr_1fr_1fr]">
          <div className="flex items-center gap-2 text-muted-foreground"><Search className="size-4" /> Filters</div>
          <Input placeholder="Action" value={filters.action ?? ''} onChange={(event) => setFilters((current) => ({ ...current, action: event.target.value || undefined }))} />
          <Input placeholder="Resource type" value={filters.resourceType ?? ''} onChange={(event) => setFilters((current) => ({ ...current, resourceType: event.target.value || undefined }))} />
          <Input placeholder="User ID" value={filters.userId ?? ''} onChange={(event) => setFilters((current) => ({ ...current, userId: event.target.value || undefined }))} />
        </CardContent>
      </Card>
      {logs.isLoading ? <Spinner /> : null}
      {!logs.isLoading && (logs.data?.length ?? 0) === 0 ? <EmptyState title="No audit logs found" /> : null}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Action</th><th className="px-4 py-3">Resource</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Details</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(logs.data ?? []).map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 font-medium">{log.action}</td>
                <td className="px-4 py-3 text-muted-foreground">{log.resourceType} {log.resourceId ? `· ${log.resourceId}` : ''}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.userId ?? 'system'}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(log.createdAt)}</td>
                <td className="px-4 py-3"><pre className="max-w-md overflow-x-auto font-mono text-xs text-muted-foreground">{JSON.stringify(log.details ?? {}, null, 2)}</pre></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
