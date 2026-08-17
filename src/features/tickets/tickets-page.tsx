import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { EmptyState } from '../../components/ui/empty-state'
import { Select } from '../../components/ui/form'
import { SectionHeader } from '../../components/ui/section-header'
import { Spinner } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/toast'
import { PRIORITY_META, TICKET_STATUS_META } from '../../lib/meta'
import { formatDate } from '../../lib/format'
import type { Priority, Ticket, TicketStatus } from '../../types/api'
import { useCreateTicket, useDeleteTicket, useTickets, useUpdateTicket, type TicketFilters } from '../../queries/tickets'
import { TicketFormModal } from './ticket-form-modal'

const statusOptions: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const priorityOptions: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export function TicketsPage() {
  const [filters, setFilters] = useState<TicketFilters>({})
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Ticket | null>(null)
  const tickets = useTickets(filters)
  const create = useCreateTicket()
  const deleteTicket = useDeleteTicket()
  const { toast } = useToast()

  return (
    <div className="grid gap-6">
      <SectionHeader title="Tickets" description="Track incidents and deployment follow-ups." action={<Button onClick={() => setCreating(true)}><Plus className="size-4" /> New ticket</Button>} />
      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-muted-foreground"><Search className="size-4" /> Filters</div>
          <Select value={filters.status ?? ''} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as TicketStatus || undefined }))}>
            <option value="">All statuses</option>
            {statusOptions.map((status) => <option key={status} value={status}>{TICKET_STATUS_META[status].label}</option>)}
          </Select>
          <Select value={filters.priority ?? ''} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value as Priority || undefined }))}>
            <option value="">All priorities</option>
            {priorityOptions.map((priority) => <option key={priority} value={priority}>{PRIORITY_META[priority].label}</option>)}
          </Select>
        </CardContent>
      </Card>
      {tickets.isLoading ? <Spinner /> : null}
      {!tickets.isLoading && (tickets.data?.length ?? 0) === 0 ? <EmptyState title="No tickets found" /> : null}
      <div className="grid gap-3">
        {(tickets.data ?? []).map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{ticket.title}</h2>
                  <Badge variant={TICKET_STATUS_META[ticket.status].variant}>{TICKET_STATUS_META[ticket.status].label}</Badge>
                  <Badge variant={PRIORITY_META[ticket.priority].variant}>{PRIORITY_META[ticket.priority].label}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{ticket.project.name} · {formatDate(ticket.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <Link className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 text-xs" to={`/tickets/${ticket.id}`}>
                  <ArrowUpRight className="size-4" /> Open
                </Link>
                <Button size="sm" variant="outline" onClick={() => setEditing(ticket)}><Pencil className="size-4" /> Edit</Button>
                <Button size="sm" variant="danger" onClick={async () => { await deleteTicket.mutateAsync(ticket.id); toast('Ticket deleted', 'success') }}>
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <TicketFormModal open={creating} onClose={() => setCreating(false)} loading={create.isPending} onSubmit={async (input) => { await create.mutateAsync(input); toast('Ticket created', 'success') }} />
      {editing ? <EditTicketModal ticket={editing} onClose={() => setEditing(null)} /> : null}
    </div>
  )
}

function EditTicketModal({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const update = useUpdateTicket(ticket.id)
  const { toast } = useToast()
  return <TicketFormModal open ticket={ticket} onClose={onClose} loading={update.isPending} onSubmit={async (input) => { await update.mutateAsync(input); toast('Ticket updated', 'success') }} />
}
