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

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { user, login } = useAuth()
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
      await login(values.email, values.password)
      navigate('/', { replace: true })
    } catch (err) {
      const message = err instanceof ApiErrorResponse ? err.message : 'Unable to sign in'
      setError('root', { message })
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Access the deployment overview.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@company.com" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <Input type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
        </Field>

        {errors.root?.message ? <p className="text-sm text-danger">{errors.root.message}</p> : null}

        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? <Spinner className="text-primary-foreground" /> : null}
          Sign in
        </Button>
      </form>

      <p className="mt-6 border-t border-line pt-4 text-sm text-muted-foreground">
        No account?{' '}
        <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}