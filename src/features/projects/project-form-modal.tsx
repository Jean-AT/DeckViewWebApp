import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Field, Input, Select, Textarea } from '../../components/ui/field'
import { Modal } from '../../components/ui/modal'
import { Spinner } from '../../components/ui/spinner'
import { ApiErrorResponse } from '../../lib/api'
import { PROVIDER_CONFIG_HINTS, PROVIDER_LIST, PROVIDERS } from '../../lib/meta'
import { useCreateProject, useUpdateProject } from '../../queries/projects'
import type { Project, Provider } from '../../types/api'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  repoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  provider: z.enum(['JENKINS', 'VERCEL', 'GITHUB_ACTIONS', 'AWS', 'FIREBASE']),
  providerConfig: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function ProjectFormModal({
  open,
  onClose,
  project,
}: {
  open: boolean
  onClose: () => void
  project?: Project
}) {
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { provider: 'VERCEL' },
  })

  useEffect(() => {
    if (!open) return
    if (project) {
      reset({
        name: project.name,
        repoUrl: project.repoUrl ?? '',
        provider: project.provider,
        providerConfig: Object.keys(project.providerConfig ?? {}).length
          ? JSON.stringify(project.providerConfig, null, 2)
          : '',
      })
    } else {
      reset({ name: '', repoUrl: '', provider: 'VERCEL', providerConfig: '' })
    }
  }, [open, project, reset])

  const provider = watch('provider')

  const onSubmit = async (values: FormValues) => {
    let providerConfig: Record<string, unknown> = {}
    if (values.providerConfig?.trim()) {
      try {
        providerConfig = JSON.parse(values.providerConfig) as Record<string, unknown>
      } catch {
        setError('providerConfig', { message: 'Invalid JSON' })
        return
      }
    }

    const input = {
      name: values.name,
      repoUrl: values.repoUrl || undefined,
      provider: values.provider as Provider,
      providerConfig,
    }

    try {
      if (project) {
        await updateProject.mutateAsync({ id: project.id, ...input })
      } else {
        await createProject.mutateAsync(input)
      }
      onClose()
    } catch (err) {
      const message = err instanceof ApiErrorResponse ? err.message : 'Unable to save the project'
      setError('root', { message })
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={project ? 'Edit project' : 'New project'} wide>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name?.message}>
            <Input placeholder="backend-api" {...register('name')} />
          </Field>
          <Field label="Repo URL" error={errors.repoUrl?.message}>
            <Input placeholder="https://github.com/org/repo" {...register('repoUrl')} />
          </Field>
        </div>

        <Field label="Provider" error={errors.provider?.message}>
          <Select {...register('provider')}>
            {PROVIDER_LIST.map((p) => (
              <option key={p} value={p}>
                {PROVIDERS[p].label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Provider config (JSON)" error={errors.providerConfig?.message}>
          <Textarea rows={4} placeholder={PROVIDER_CONFIG_HINTS[provider]} {...register('providerConfig')} />
        </Field>
        <p className="font-mono text-xs text-muted-foreground">Hint: {PROVIDER_CONFIG_HINTS[provider]}</p>

        {errors.root?.message ? <p className="text-sm text-danger">{errors.root.message}</p> : null}

        <div className="mt-2 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="text-primary-foreground" /> : null}
            {project ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}