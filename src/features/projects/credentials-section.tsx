import { useState } from 'react'
import { KeyRound, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Field, Input, Select } from '../../components/ui/form'
import { Badge } from '../../components/ui/badge'
import { useToast } from '../../components/ui/toast'
import { PROVIDER_LIST } from '../../lib/meta'
import type { Provider } from '../../types/api'
import { useCreateCredential, useCredentials, useRevokeCredential, useTestCredential } from '../../queries/projects'

export function CredentialsSection({ projectId, isAdmin }: { projectId: string; isAdmin: boolean }) {
  const [provider, setProvider] = useState<Provider>('VERCEL')
  const [token, setToken] = useState('')
  const credentials = useCredentials(projectId)
  const create = useCreateCredential(projectId)
  const revoke = useRevokeCredential(projectId)
  const test = useTestCredential(projectId)
  const { toast } = useToast()

  async function save() {
    await create.mutateAsync({ provider, token })
    setToken('')
    toast('Credential saved', 'success')
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">Credentials</h2>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isAdmin ? (
          <div className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
            <Select value={provider} onChange={(event) => setProvider(event.target.value as Provider)}>
              {PROVIDER_LIST.map((value) => <option key={value} value={value}>{value}</option>)}
            </Select>
            <Field label="Token">
              <Input value={token} type="password" onChange={(event) => setToken(event.target.value)} />
            </Field>
            <Button className="self-end" disabled={!token} loading={create.isPending} onClick={save}>
              <KeyRound className="size-4" /> Add
            </Button>
          </div>
        ) : null}
        <div className="grid gap-2">
          {(credentials.data ?? []).map((credential) => (
            <div key={credential.id} className="flex flex-col gap-3 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{credential.provider}</p>
                <p className="font-mono text-xs text-muted-foreground">{credential.maskedPreview}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={credential.isValid ? 'success' : 'danger'}>{credential.isValid ? 'Valid' : 'Invalid'}</Badge>
                {isAdmin ? (
                  <>
                    <Button size="sm" variant="outline" onClick={async () => {
                      const result = await test.mutateAsync(credential.provider)
                      toast(result.ok ? 'Credential test passed' : (result.error ?? 'Credential test failed'), result.ok ? 'success' : 'error')
                    }}>
                      <ShieldCheck className="size-4" /> Test
                    </Button>
                    <Button size="sm" variant="outline" onClick={async () => {
                      const nextToken = window.prompt(`New token for ${credential.provider}`)
                      if (nextToken) await create.mutateAsync({ provider: credential.provider, token: nextToken })
                    }}>
                      <RefreshCw className="size-4" /> Rotate
                    </Button>
                    <Button size="sm" variant="danger" onClick={async () => { await revoke.mutateAsync(credential.provider); toast('Credential revoked', 'success') }}>
                      <Trash2 className="size-4" /> Revoke
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
