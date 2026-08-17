import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import { Card, CardContent } from './card'

export function Stat({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: ComponentType<LucideProps> }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        {Icon ? <Icon className="size-5 text-muted-foreground" /> : null}
      </CardContent>
    </Card>
  )
}
