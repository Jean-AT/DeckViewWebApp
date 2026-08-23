import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Field, Input, Select, Textarea } from '../../components/ui/field'
import { Modal } from '../../components/ui/modal'
import { Spinner } from '../../components/ui/spinner'
import { ApiErrorResponse } from '../../lib/api'
import { PRIORITY_META } from '../../lib/meta'
import { useProjects } from '../../queries/projects'
import { useCreateTicket } from '../../queries/tickets'
import type { Priority } from '../../types/api'

const schema = z.object({
  projectId: z.string().min(1, 'Select a project'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assignedTo: z.string().max(100).optional(),
})

type FormValues = z.infer<typeof schema>

export function TicketFormModal({
  open,
  onClose,
  defaultProjectId,
}: {
  open: boolean
  onClose: () => void
  defaultProjectId?: string
}) {
  const projectsQuery = useProjects()
  const createTicket = useCreateTicket()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM' },
  })

  useEffect(() => {
    if (open) {
      reset({ projectId: defaultProjectId ?? '', title: '', description: '', priority: 'MEDIUM', assignedTo: '' })
    }
  }, [open, defaultProjectId, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      await createTicket.mutateAsync({
        projectId: values.projectId,
        title: values.title,
        description: values.description || undefined,
        priority: values.priority as Priority,
        assignedTo: values.assignedTo || undefined,
      })
      onClose()
    } catch (err) {
      setError('root', { message: err instanceof ApiErrorResponse ? err.message : 'Unable to create ticket' })
    }
  }

  const projects = projectsQuery.data?.data ?? []

  return (
    <Modal open={open} onClose={onClose} title="New ticket" wide>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project" error={errors.projectId?.message}>
            <Select {...register('projectId')}>
              <option value="">Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priority" error={errors.priority?.message}>
            <Select {...register('priority')}>
              {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_META[p].label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Title" error={errors.title?.message}>
          <Input placeholder="Build fails on staging" {...register('title')} />
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <Textarea rows={4} placeholder="Steps, logs, context…" className="font-display text-sm" {...register('description')} />
        </Field>

        <Field label="Assigned to" error={errors.assignedTo?.message}>
          <Input placeholder="teammate@company.com" {...register('assignedTo')} />
        </Field>

        {errors.root?.message ? <p className="text-sm text-danger">{errors.root.message}</p> : null}

        <div className="mt-2 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="text-primary-foreground" /> : null}
            Create ticket
          </Button>
        </div>
      </form>
    </Modal>
  )
}