import { useState } from 'react'
import { KeyRound, Plus, RefreshCw, Trash2, Zap } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/empty-state'
import { Field, Input, Select } from '../../components/ui/field'
import { Eyebrow } from '../../components/ui/card'
import { Modal } from '../../components/ui/modal'
import { Spinner } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/toast'
import { ApiErrorResponse } from '../../lib/api'
import { PROVIDERS, PROVIDER_LIST } from '../../lib/meta'
import {
  useCreateCredential,
  useCredentials,
  useDeleteCredential,
  useRotateCredential,
  useTestCredential,
} from '../../queries/users'
import type { Credential, Provider } from '../../types/api'

export function CredentialsSection({ projectId }: { projectId: string }) {
  const { data, isLoading } = useCredentials(projectId)
  const [addOpen, setAddOpen] = useState(false)
  const [rotateTarget, setRotateTarget] = useState<Credential | null>(null)

  const credentials = data?.data ?? []

  return (
    <div className="border border-line bg-card">
      <div className="flex items-center justify-between border-b border-line p-6">
        <div>
          <Eyebrow>Credentials</Eyebrow>
          <p className="mt-1 text-sm text-muted-foreground">
            API keys are stored encrypted (AES-256-GCM). Only masked previews are ever returned.
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Add key
        </Button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <Spinner />
        ) : credentials.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title="No credentials stored"
            description="Add the provider API key so the sync job can pull deployments."
          />
        ) : (
          <ul className="divide-y divide-line">
            {credentials.map((cred) => (
              <CredentialRow
                key={cred.id}
                projectId={projectId}
                credential={cred}
                onRotate={() => setRotateTarget(cred)}
              />
            ))}
          </ul>
        )}
      </div>

      <AddCredentialModal projectId={projectId} open={addOpen} onClose={() => setAddOpen(false)} />
      <RotateCredentialModal
        projectId={projectId}
        credential={rotateTarget}
        onClose={() => setRotateTarget(null)}
      />
    </div>
  )
}

function CredentialRow({
  projectId,
  credential,
  onRotate,
}: {
  projectId: string
  credential: Credential
  onRotate: () => void
}) {
  const toast = useToast()
  const testCredential = useTestCredential(projectId)
  const deleteCredential = useDeleteCredential(projectId)

  const onTest = async () => {
    try {
      const result = await testCredential.mutateAsync(credential.provider)
      if (result.ok) toast.push('success', `${PROVIDERS[credential.provider].label} key is valid`)
      else toast.push('error', result.error ?? 'Key failed the connection test')
    } catch (err) {
      toast.push('error', err instanceof ApiErrorResponse ? err.message : 'Test failed')
    }
  }

  const onDelete = async () => {
    if (!window.confirm(`Revoke the ${PROVIDERS[credential.provider].label} credential?`)) return
    try {
      await deleteCredential.mutateAsync(credential.provider)
      toast.push('success', 'Credential revoked')
    } catch (err) {
      toast.push('error', err instanceof ApiErrorResponse ? err.message : 'Unable to revoke')
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <KeyRound className="size-4 text-muted-foreground" aria-hidden="true" />
      <span className="w-32 text-sm font-medium">{PROVIDERS[credential.provider].label}</span>
      <span className="font-mono text-xs text-muted-foreground">{credential.maskedPreview}</span>
      {credential.isValid ? (
        <Badge variant="success">Valid</Badge>
      ) : (
        <Badge variant="danger">Invalid</Badge>
      )}
      <span className="ml-auto flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={onTest} disabled={testCredential.isPending}>
          {testCredential.isPending ? <Spinner /> : <Zap className="size-3.5" aria-hidden="true" />}
          Test
        </Button>
        <Button size="sm" variant="ghost" onClick={onRotate}>
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Rotate
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} disabled={deleteCredential.isPending}>
          <Trash2 className="size-3.5 text-danger" aria-hidden="true" />
        </Button>
      </span>
    </li>
  )
}

function AddCredentialModal({ projectId, open, onClose }: { projectId: string; open: boolean; onClose: () => void }) {
  const toast = useToast()
  const createCredential = useCreateCredential(projectId)
  const [provider, setProvider] = useState<Provider>('VERCEL')
  const [value, setValue] = useState('')
  const [error, setError] = useState<string>()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(undefined)
    try {
      await createCredential.mutateAsync({ provider, value })
      toast.push('success', 'Credential stored (encrypted)')
      setValue('')
      onClose()
    } catch (err) {
      setError(err instanceof ApiErrorResponse ? err.message : 'Unable to store credential')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add credential" description="Stored encrypted, never returned in plain text.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Provider">
          <Select value={provider} onChange={(e) => setProvider(e.target.value as Provider)}>
            {PROVIDER_LIST.map((p) => (
              <option key={p} value={p}>
                {PROVIDERS[p].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="API key / token" error={error}>
          <Input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Secret value"
            autoComplete="off"
            required
          />
        </Field>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createCredential.isPending || value.length === 0}>
            {createCredential.isPending ? <Spinner className="text-primary-foreground" /> : null}
            Store key
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function RotateCredentialModal({
  projectId,
  credential,
  onClose,
}: {
  projectId: string
  credential: Credential | null
  onClose: () => void
}) {
  const toast = useToast()
  const rotateCredential = useRotateCredential(projectId)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string>()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!credential) return
    setError(undefined)
    try {
      await rotateCredential.mutateAsync({ provider: credential.provider, value })
      toast.push('success', 'Credential rotated')
      setValue('')
      onClose()
    } catch (err) {
      setError(err instanceof ApiErrorResponse ? err.message : 'Unable to rotate credential')
    }
  }

  return (
    <Modal
      open={credential !== null}
      onClose={onClose}
      title={credential ? `Rotate ${PROVIDERS[credential.provider].label} key` : 'Rotate key'}
      description={credential ? `Current: ${credential.maskedPreview}` : undefined}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="New API key / token" error={error}>
          <Input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="New secret value"
            autoComplete="off"
            required
          />
        </Field>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={rotateCredential.isPending || value.length === 0}>
            {rotateCredential.isPending ? <Spinner className="text-primary-foreground" /> : null}
            Rotate key
          </Button>
        </div>
      </form>
    </Modal>
  )
}