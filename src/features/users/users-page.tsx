import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Field, Input, Select } from '../../components/ui/field'
import { Modal } from '../../components/ui/modal'
import { SectionHeader } from '../../components/ui/section-header'
import { PageLoader, Spinner } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/toast'
import { ApiErrorResponse } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { formatDate } from '../../lib/format'
import { ROLE_META } from '../../lib/meta'
import { useCreateUser, useDeleteUser, useResetPassword, useUpdateUser, useUsers } from '../../queries/users'
import type { Role, User } from '../../types/api'

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters').max(72),
  role: z.enum(['ADMIN', 'DEVELOPER', 'VIEWER']),
})

type CreateForm = z.infer<typeof createSchema>

export function UsersPage() {
  const usersQuery = useUsers()
  const { user: me } = useAuth()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null)

  if (usersQuery.isLoading) return <PageLoader />

  const users = usersQuery.data?.data ?? []

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        index="04 / Users"
        title="Team and roles."
        description="ADMIN manages everything, DEVELOPER writes projects and tickets, VIEWER reads."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            New user
          </Button>
        }
      />

      <div className="overflow-x-auto border border-line bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Name</th>
              <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Email</th>
              <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Role</th>
              <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Created</th>
              <th className="px-4 py-3 text-right font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-accent-surface/5">
                <td className="px-4 py-3 font-medium">
                  {u.name}
                  {me?.id === u.id ? <span className="ml-2 text-xs text-muted-foreground">(you)</span> : null}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={ROLE_META[u.role].variant}>{ROLE_META[u.role].label}</Badge>
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditTarget(u)} aria-label={`Edit ${u.name}`}>
                      <Pencil className="size-3.5" aria-hidden="true" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPasswordTarget(u)} aria-label={`Reset password for ${u.name}`}>
                      <KeyRound className="size-3.5" aria-hidden="true" />
                    </Button>
                    <DeleteUserButton user={u} self={me?.id === u.id} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditUserModal user={editTarget} onClose={() => setEditTarget(null)} />
      <ResetPasswordModal user={passwordTarget} onClose={() => setPasswordTarget(null)} />
    </div>
  )
}

function DeleteUserButton({ user, self }: { user: User; self: boolean }) {
  const toast = useToast()
  const deleteUser = useDeleteUser()

  const onDelete = async () => {
    if (!window.confirm(`Delete user ${user.name}?`)) return
    try {
      await deleteUser.mutateAsync(user.id)
      toast.push('success', 'User deleted')
    } catch (err) {
      toast.push('error', err instanceof ApiErrorResponse ? err.message : 'Unable to delete user')
    }
  }

  return (
    <Button size="sm" variant="ghost" onClick={onDelete} disabled={self || deleteUser.isPending} aria-label={`Delete ${user.name}`}>
      <Trash2 className="size-3.5 text-danger" aria-hidden="true" />
    </Button>
  )
}

function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const createUser = useCreateUser()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema), defaultValues: { role: 'VIEWER' } })

  useEffect(() => {
    if (open) reset({ name: '', email: '', password: '', role: 'VIEWER' })
  }, [open, reset])

  const onSubmit = async (values: CreateForm) => {
    try {
      await createUser.mutateAsync(values)
      toast.push('success', 'User created')
      onClose()
    } catch (err) {
      const message = err instanceof ApiErrorResponse && err.status === 409 ? 'Email already registered' : 'Unable to create user'
      setError('root', { message })
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New user">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Name" error={errors.name?.message}>
          <Input {...register('name')} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...register('password')} />
        </Field>
        <Field label="Role" error={errors.role?.message}>
          <Select {...register('role')}>
            {(Object.keys(ROLE_META) as Role[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_META[r].label}
              </option>
            ))}
          </Select>
        </Field>
        {errors.root?.message ? <p className="text-sm text-danger">{errors.root.message}</p> : null}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="text-primary-foreground" /> : null}
            Create user
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function EditUserModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const toast = useToast()
  const updateUser = useUpdateUser()
  const { user: me } = useAuth()
  const [role, setRole] = useState<Role>('VIEWER')
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (user) setRole(user.role)
    setError(undefined)
  }, [user])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(undefined)
    try {
      await updateUser.mutateAsync({ id: user.id, role })
      toast.push('success', 'User updated')
      onClose()
    } catch (err) {
      setError(err instanceof ApiErrorResponse ? err.message : 'Unable to update user')
    }
  }

  const self = me?.id === user?.id

  return (
    <Modal open={user !== null} onClose={onClose} title={user ? `Edit ${user.name}` : 'Edit user'}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Role" error={error ?? (self ? 'You cannot change your own role' : undefined)}>
          <Select value={role} onChange={(e) => setRole(e.target.value as Role)} disabled={self}>
            {(Object.keys(ROLE_META) as Role[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_META[r].label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={self || updateUser.isPending}>
            {updateUser.isPending ? <Spinner className="text-primary-foreground" /> : null}
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function ResetPasswordModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const toast = useToast()
  const resetPassword = useResetPassword()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  useEffect(() => {
    setPassword('')
    setError(undefined)
  }, [user])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (password.length < 8) {
      setError('At least 8 characters')
      return
    }
    setError(undefined)
    try {
      await resetPassword.mutateAsync({ id: user.id, password })
      toast.push('success', 'Password updated')
      onClose()
    } catch (err) {
      setError(err instanceof ApiErrorResponse ? err.message : 'Unable to reset password')
    }
  }

  return (
    <Modal open={user !== null} onClose={onClose} title={user ? `Reset password · ${user.name}` : 'Reset password'}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="New password" error={error}>
          <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={resetPassword.isPending || password.length === 0}>
            {resetPassword.isPending ? <Spinner className="text-primary-foreground" /> : null}
            Reset
          </Button>
        </div>
      </form>
    </Modal>
  )
}