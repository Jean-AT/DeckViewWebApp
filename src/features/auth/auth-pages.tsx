import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { ApiErrorResponse } from '../../lib/api'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Field, Input } from '../../components/ui/form'

const loginSchema = z.object({ email: z.email(), password: z.string().min(6) })
const registerSchema = loginSchema.extend({ name: z.string().min(2) })

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

function AuthFrame({ title, children }: { title: string; children: React.ReactNode }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/" replace />
  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">DV</span>
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground">DeckView deployment operations</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const form = useForm<LoginValues>({ defaultValues: { email: '', password: '' } })

  async function onSubmit(values: LoginValues) {
    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => form.setError(issue.path[0] as keyof LoginValues, { message: issue.message }))
      return
    }
    try {
      await login(parsed.data.email, parsed.data.password)
      navigate('/')
    } catch (error) {
      form.setError('root', { message: error instanceof ApiErrorResponse ? error.message : 'Login failed' })
    }
  }

  return (
    <AuthFrame title="Sign in">
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input autoComplete="email" type="email" {...form.register('email')} />
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <Input autoComplete="current-password" type="password" {...form.register('password')} />
        </Field>
        {form.formState.errors.root ? <p className="text-sm text-danger">{form.formState.errors.root.message}</p> : null}
        <Button loading={form.formState.isSubmitting} type="submit">
          Sign in
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          No account? <Link className="text-foreground underline" to="/register">Register</Link>
        </p>
      </form>
    </AuthFrame>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const form = useForm<RegisterValues>({ defaultValues: { name: '', email: '', password: '' } })

  async function onSubmit(values: RegisterValues) {
    const parsed = registerSchema.safeParse(values)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => form.setError(issue.path[0] as keyof RegisterValues, { message: issue.message }))
      return
    }
    try {
      await register(parsed.data.name, parsed.data.email, parsed.data.password)
      navigate('/')
    } catch (error) {
      form.setError('root', { message: error instanceof ApiErrorResponse ? error.message : 'Register failed' })
    }
  }

  return (
    <AuthFrame title="Create account">
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input autoComplete="name" {...form.register('name')} />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input autoComplete="email" type="email" {...form.register('email')} />
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <Input autoComplete="new-password" type="password" {...form.register('password')} />
        </Field>
        {form.formState.errors.root ? <p className="text-sm text-danger">{form.formState.errors.root.message}</p> : null}
        <Button loading={form.formState.isSubmitting} type="submit">
          Register
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already registered? <Link className="text-foreground underline" to="/login">Sign in</Link>
        </p>
      </form>
    </AuthFrame>
  )
}
