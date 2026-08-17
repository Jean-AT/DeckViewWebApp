import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Field, Input, Select, Textarea } from '../../components/ui/form'
import { Modal } from '../../components/ui/modal'
import { useProjects } from '../../queries/projects'
import type { Ticket } from '../../types/api'
import type { TicketInput } from '../../queries/tickets'

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const
const schema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(3),
  description: z.string().optional(),
  priority: z.enum(priorities),
  status: z.enum(statuses),
  assignedTo: z.string().optional(),
})
type Values = z.infer<typeof schema>

export function TicketFormModal({
  open,
  ticket,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean
  ticket?: Ticket
  onClose: () => void
  onSubmit: (input: TicketInput) => Promise<void>
  loading?: boolean
}) {
  const projects = useProjects()
  const form = useForm<Values>()
  useEffect(() => {
    if (!open) return
    form.reset({
      projectId: ticket?.projectId ?? projects.data?.[0]?.id ?? '',
      title: ticket?.title ?? '',
      description: ticket?.description ?? '',
      priority: ticket?.priority ?? 'MEDIUM',
      status: ticket?.status ?? 'OPEN',
      assignedTo: ticket?.assignedTo ?? '',
    })
  }, [form, open, projects.data, ticket])

  async function handle(values: Values) {
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => form.setError(issue.path[0] as keyof Values, { message: issue.message }))
      return
    }
    await onSubmit({ ...parsed.data, description: parsed.data.description || null, assignedTo: parsed.data.assignedTo || null })
    onClose()
  }

  return (
    <Modal open={open} title={ticket ? 'Edit ticket' : 'New ticket'} onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(handle)}>
        <Field label="Project" error={form.formState.errors.projectId?.message}>
          <Select {...form.register('projectId')}>{(projects.data ?? []).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</Select>
        </Field>
        <Field label="Title" error={form.formState.errors.title?.message}><Input {...form.register('title')} /></Field>
        <Field label="Description"><Textarea {...form.register('description')} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Priority"><Select {...form.register('priority')}>{priorities.map((item) => <option key={item}>{item}</option>)}</Select></Field>
          <Field label="Status"><Select {...form.register('status')}>{statuses.map((item) => <option key={item}>{item}</option>)}</Select></Field>
        </div>
        <Field label="Assigned user ID"><Input {...form.register('assignedTo')} /></Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={loading} type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  )
}
