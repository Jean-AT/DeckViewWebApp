import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/empty-state'
import { Field, Input, Select } from '../../components/ui/form'
import { Modal } from '../../components/ui/modal'
import { SectionHeader } from '../../components/ui/section-header'
import { Spinner } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/toast'
import { ROLE_META } from '../../lib/meta'
import { formatDate } from '../../lib/format'
import type { Role, User } from '../../types/api'
import { useCreateUser, useDeleteUser, useResetPassword, useUpdateUser, useUsers, type UserInput } from '../../queries/users'

const roles: Role[] = ['ADMIN', 'DEVELOPER', 'VIEWER']
const schema = z.object({
  name: z.string().min(2),
  email: z.email(),
  role: z.enum(roles),
  password: z.string().optional(),
})
type Values = z.infer<typeof schema>

export function UsersPage() {
  const users = useUsers()
  const create = useCreateUser()
  const deleteUser = useDeleteUser()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const { toast } = useToast()

  return (
    <div className="grid gap-6">
      <SectionHeader title="Users" description="Manage access and operational roles." action={<Button onClick={() => setCreating(true)}><Plus className="size-4" /> New user</Button>} />
      {users.isLoading ? <Spinner /> : null}
      {!users.isLoading && (users.data?.length ?? 0) === 0 ? <EmptyState title="No users found" /> : null}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(users.data ?? []).map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3"><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></td>
                <td className="px-4 py-3"><Badge variant={ROLE_META[user.role].variant}>{ROLE_META[user.role].label}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(user)}><Pencil className="size-4" /> Edit</Button>
                    <ResetPasswordButton user={user} />
                    <Button size="sm" variant="danger" onClick={async () => { await deleteUser.mutateAsync(user.id); toast('User deleted', 'success') }}>
                      <Trash2 className="size-4" /> Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <UserModal open={creating} onClose={() => setCreating(false)} loading={create.isPending} onSubmit={async (input) => { await create.mutateAsync(input); toast('User created', 'success') }} />
      {editing ? <EditUserModal user={editing} onClose={() => setEditing(null)} /> : null}
    </div>
  )
}

function UserModal({
  open,
  user,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean
  user?: User
  onClose: () => void
  onSubmit: (input: UserInput) => Promise<void>
  loading?: boolean
}) {
  const form = useForm<Values>({ values: { name: user?.name ?? '', email: user?.email ?? '', role: user?.role ?? 'VIEWER', password: '' } })
  async function handle(values: Values) {
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => form.setError(issue.path[0] as keyof Values, { message: issue.message }))
      return
    }
    await onSubmit({ ...parsed.data, password: parsed.data.password || undefined })
    onClose()
  }
  return (
    <Modal open={open} title={user ? 'Edit user' : 'New user'} onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(handle)}>
        <Field label="Name" error={form.formState.errors.name?.message}><Input {...form.register('name')} /></Field>
        <Field label="Email" error={form.formState.errors.email?.message}><Input type="email" {...form.register('email')} /></Field>
        <Field label="Role"><Select {...form.register('role')}>{roles.map((role) => <option key={role} value={role}>{ROLE_META[role].label}</option>)}</Select></Field>
        {!user ? <Field label="Password"><Input type="password" {...form.register('password')} /></Field> : null}
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button loading={loading} type="submit">Save</Button></div>
      </form>
    </Modal>
  )
}

function EditUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const update = useUpdateUser(user.id)
  const { toast } = useToast()
  return <UserModal open user={user} onClose={onClose} loading={update.isPending} onSubmit={async (input) => { await update.mutateAsync(input); toast('User updated', 'success') }} />
}

function ResetPasswordButton({ user }: { user: User }) {
  const reset = useResetPassword(user.id)
  const { toast } = useToast()
  return (
    <Button size="sm" variant="outline" loading={reset.isPending} onClick={async () => {
      const password = window.prompt(`New password for ${user.email}`)
      if (password) {
        await reset.mutateAsync(password)
        toast('Password reset', 'success')
      }
    }}>
      <KeyRound className="size-4" /> Reset
    </Button>
  )
}
