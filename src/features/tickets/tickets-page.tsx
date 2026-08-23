import { useMemo, useState } from 'react'
import { Plus, Ticket as TicketIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/badge'
import { EmptyState } from '../../components/ui/empty-state'
import { Field, Select } from '../../components/ui/field'
import { SectionHeader } from '../../components/ui/section-header'
import { PageLoader } from '../../components/ui/spinner'
import { useHasRole } from '../../lib/auth'
import { timeAgo } from '../../lib/format'
import { PRIORITY_META, TICKET_STATUS_META } from '../../lib/meta'
import { useProjects } from '../../queries/projects'
import { useTickets, type TicketFilters } from '../../queries/tickets'
import { Button } from '../../components/ui/button'
import type { Priority, TicketStatus } from '../../types/api'
import { TicketFormModal } from './ticket-form-modal'

export function TicketsPage() {
  const [filters, setFilters] = useState<TicketFilters>({})
  const [formOpen, setFormOpen] = useState(false)
  const canWrite = useHasRole('ADMIN', 'DEVELOPER')

  const ticketsQuery = useTickets(filters)
  const projectsQuery = useProjects()

  const projectName = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of projectsQuery.data?.data ?? []) map.set(p.id, p.name)
    return map
  }, [projectsQuery.data])

  const projects = projectsQuery.data?.data ?? []

  if (ticketsQuery.isLoading) return <PageLoader />

  const tickets = ticketsQuery.data?.data ?? []

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        index="03 / Tickets"
        title="Incidents and follow-ups."
        description="Failed deployments open tickets automatically. Track them here."
        action={
          canWrite ? (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              New ticket
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-3 border border-line bg-card p-4 sm:grid-cols-3">
        <Field label="Status">
          <Select
            value={filters.status ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value || undefined) as TicketStatus | undefined }))}
          >
            <option value="">All</option>
            {(Object.keys(TICKET_STATUS_META) as TicketStatus[]).map((s) => (
              <option key={s} value={s}>
                {TICKET_STATUS_META[s].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Priority">
          <Select
            value={filters.priority ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, priority: (e.target.value || undefined) as Priority | undefined }))}
          >
            <option value="">All</option>
            {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Project">
          <Select
            value={filters.projectId ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, projectId: e.target.value || undefined }))}
          >
            <option value="">All</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {tickets.length === 0 ? (
        <EmptyState icon={TicketIcon} title="No tickets match" description="Adjust the filters or create a new ticket." />
      ) : (
        <div className="overflow-x-auto border border-line bg-card">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Ticket</th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Project</th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Priority</th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Assigned</th>
                <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="transition-colors hover:bg-accent-surface/5">
                  <td className="max-w-[280px] px-4 py-3">
                    <Link to={`/tickets/${ticket.id}`} className="font-medium underline-offset-4 hover:underline">
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{projectName.get(ticket.projectId) ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={PRIORITY_META[ticket.priority].variant}>{PRIORITY_META[ticket.priority].label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={TICKET_STATUS_META[ticket.status].variant}>{TICKET_STATUS_META[ticket.status].label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{ticket.assignedTo ?? '—'}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">{timeAgo(ticket.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TicketFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}