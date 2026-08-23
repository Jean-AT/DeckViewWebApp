import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Field, Input } from '../../components/ui/field'
import { Spinner } from '../../components/ui/spinner'
import { ApiErrorResponse } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { AuthLayout } from './auth-layout'

const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters').max(72),
    confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const { user, register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (user) return <Navigate to="/" replace />

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser(values.name, values.email, values.password)
      navigate('/', { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiErrorResponse && err.status === 409 ? 'Email already registered' : 'Unable to register'
      setError('root', { message })
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl tracking-tight">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">The first registered user becomes ADMIN.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
        <Field label="Name" error={errors.name?.message}>
          <Input autoComplete="name" placeholder="Ada Lovelace" {...register('name')} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@company.com" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" placeholder="••••••••" {...register('password')} />
        </Field>
        <Field label="Confirm password" error={errors.confirm?.message}>
          <Input type="password" autoComplete="new-password" placeholder="••••••••" {...register('confirm')} />
        </Field>

        {errors.root?.message ? <p className="text-sm text-danger">{errors.root.message}</p> : null}

        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? <Spinner className="text-primary-foreground" /> : null}
          Create account
        </Button>
      </form>

      <p className="mt-6 border-t border-line pt-4 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}