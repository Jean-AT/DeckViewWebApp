import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { EmptyState } from '../../components/ui/empty-state'
import { Spinner } from '../../components/ui/spinner'
import { PRIORITY_META, TICKET_STATUS_META } from '../../lib/meta'
import { formatDate } from '../../lib/format'
import { useTicket } from '../../queries/tickets'

export function TicketDetailPage() {
  const { id = '' } = useParams()
  const ticket = useTicket(id)
  if (ticket.isLoading) return <Spinner />
  if (!ticket.data) return <EmptyState title="Ticket not found" />

  return (
    <div className="grid gap-6">
      <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" to="/tickets">
        <ArrowLeft className="size-4" /> Tickets
      </Link>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{ticket.data.title}</h1>
            <Badge variant={TICKET_STATUS_META[ticket.data.status].variant}>{TICKET_STATUS_META[ticket.data.status].label}</Badge>
            <Badge variant={PRIORITY_META[ticket.data.priority].variant}>{PRIORITY_META[ticket.data.priority].label}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{ticket.data.project.name} · {formatDate(ticket.data.createdAt)}</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="whitespace-pre-wrap text-sm leading-6">{ticket.data.description ?? 'No description.'}</p>
          <div className="grid gap-2 rounded-md bg-secondary p-4 text-sm text-muted-foreground">
            <span>Assigned to: {ticket.data.assignedTo ?? 'Unassigned'}</span>
            <span>Deployment: {ticket.data.deploymentId ?? 'None'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
