import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PROVIDER_CONFIG_HINTS, PROVIDER_LIST } from '../../lib/meta'
import type { Project } from '../../types/api'
import { Button } from '../../components/ui/button'
import { Field, Input, Select, Textarea } from '../../components/ui/form'
import { Modal } from '../../components/ui/modal'
import type { ProjectInput } from '../../queries/projects'

const schema = z.object({
  name: z.string().min(2),
  repoUrl: z.string().optional(),
  provider: z.enum(PROVIDER_LIST),
  providerConfig: z.string().min(2),
})

type Values = z.infer<typeof schema>

export function ProjectFormModal({
  open,
  project,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean
  project?: Project
  onClose: () => void
  onSubmit: (input: ProjectInput) => Promise<void>
  loading?: boolean
}) {
  const form = useForm<Values>()
  const provider = form.watch('provider') ?? project?.provider ?? 'VERCEL'

  useEffect(() => {
    if (!open) return
    form.reset({
      name: project?.name ?? '',
      repoUrl: project?.repoUrl ?? '',
      provider: project?.provider ?? 'VERCEL',
      providerConfig: JSON.stringify(project?.providerConfig ?? JSON.parse(PROVIDER_CONFIG_HINTS[project?.provider ?? 'VERCEL']), null, 2),
    })
  }, [form, open, project])

  async function handle(values: Values) {
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => form.setError(issue.path[0] as keyof Values, { message: issue.message }))
      return
    }
    try {
      const providerConfig = JSON.parse(parsed.data.providerConfig) as Record<string, unknown>
      await onSubmit({
        name: parsed.data.name,
        repoUrl: parsed.data.repoUrl || null,
        provider: parsed.data.provider,
        providerConfig,
      })
      onClose()
    } catch (error) {
      form.setError('providerConfig', { message: error instanceof SyntaxError ? 'Invalid JSON' : 'Could not save project' })
    }
  }

  return (
    <Modal open={open} title={project ? 'Edit project' : 'New project'} onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(handle)}>
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input {...form.register('name')} />
        </Field>
        <Field label="Repository URL" error={form.formState.errors.repoUrl?.message}>
          <Input placeholder="https://github.com/org/repo" {...form.register('repoUrl')} />
        </Field>
        <Field label="Provider" error={form.formState.errors.provider?.message}>
          <Select {...form.register('provider')}>
            {PROVIDER_LIST.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Provider config" error={form.formState.errors.providerConfig?.message}>
          <Textarea placeholder={PROVIDER_CONFIG_HINTS[provider]} {...form.register('providerConfig')} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={loading} type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  )
}
