import { useState } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Field, Select } from '../../components/ui/field'
import { Eyebrow } from '../../components/ui/card'
import { EmptyState } from '../../components/ui/empty-state'
import { PageLoader } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/toast'
import { ApiErrorResponse } from '../../lib/api'
import { useHasRole } from '../../lib/auth'
import { formatDate } from '../../lib/format'
import { PRIORITY_META, TICKET_STATUS_META } from '../../lib/meta'
import { useDeleteTicket, useTicket, useUpdateTicket } from '../../queries/tickets'
import type { Priority, TicketStatus } from '../../types/api'

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const canWrite = useHasRole('ADMIN', 'DEVELOPER')
  const isAdmin = useHasRole('ADMIN')

  const ticketQuery = useTicket(id)
  const updateTicket = useUpdateTicket()
  const deleteTicket = useDeleteTicket()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (ticketQuery.isLoading) return <PageLoader />

  const ticket = ticketQuery.data
  if (!ticket) {
    return (
      <EmptyState
        title="Ticket not found"
        action={
          <Link to="/tickets" className="text-sm underline underline-offset-4">
            Back to tickets
          </Link>
        }
      />
    )
  }

  const patch = async (input: { status?: TicketStatus; priority?: Priority }) => {
    try {
      await updateTicket.mutateAsync({ id: ticket.id, ...input })
      toast.push('success', 'Ticket updated')
    } catch (err) {
      toast.push('error', err instanceof ApiErrorResponse ? err.message : 'Unable to update')
    }
  }

  const onDelete = async () => {
    try {
      await deleteTicket.mutateAsync(ticket.id)
      toast.push('success', 'Ticket deleted')
      navigate('/tickets')
    } catch (err) {
      toast.push('error', err instanceof ApiErrorResponse ? err.message : 'Unable to delete')
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link to="/tickets" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Tickets
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
          <div>
            <Eyebrow className="mb-2">Ticket</Eyebrow>
            <h1 className="text-2xl tracking-tight md:text-3xl">{ticket.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={PRIORITY_META[ticket.priority].variant}>{PRIORITY_META[ticket.priority].label}</Badge>
              <Badge variant={TICKET_STATUS_META[ticket.status].variant}>{TICKET_STATUS_META[ticket.status].label}</Badge>
              <span className="text-sm text-muted-foreground">· created {formatDate(ticket.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canWrite ? (
              <Button variant="outline" onClick={() => patch({ status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED' })} disabled={updateTicket.isPending}>
                {ticket.status === 'OPEN' ? 'Start progress' : 'Mark resolved'}
              </Button>
            ) : null}
            {isAdmin ? (
              <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="border border-line bg-card p-6 lg:col-span-2">
          <Eyebrow className="mb-3">Description</Eyebrow>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {ticket.description ?? 'No description provided.'}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="border border-line bg-card p-6">
            <Eyebrow className="mb-3">Project</Eyebrow>
            <Link to={`/projects/${ticket.project.id}`} className="text-sm font-medium underline-offset-4 hover:underline">
              {ticket.project.name}
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">
              {ticket.assignedTo ? `Assigned to ${ticket.assignedTo}` : 'Unassigned'}
            </p>
          </div>

          {canWrite ? (
            <div className="flex flex-col gap-4 border border-line bg-card p-6">
              <Field label="Status">
                <Select value={ticket.status} onChange={(e) => void patch({ status: e.target.value as TicketStatus })}>
                  {(Object.keys(TICKET_STATUS_META) as TicketStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {TICKET_STATUS_META[s].label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Priority">
                <Select value={ticket.priority} onChange={(e) => void patch({ priority: e.target.value as Priority })}>
                  {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_META[p].label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          ) : null}
        </div>
      </div>

      {confirmingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-hidden="true" tabIndex={-1} className="fixed inset-0 bg-black/70" onClick={() => setConfirmingDelete(false)} />
          <div role="alertdialog" aria-modal="true" aria-label="Delete ticket" className="relative w-full max-w-md border border-line bg-card p-6">
            <p className="text-sm font-medium">Delete this ticket?</p>
            <p className="mt-1 text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={onDelete} disabled={deleteTicket.isPending}>
                Delete ticket
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}