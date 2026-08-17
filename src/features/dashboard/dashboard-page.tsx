import { Activity, Layers, Ticket, Zap } from 'lucide-react'
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { EmptyState } from '../../components/ui/empty-state'
import { SectionHeader } from '../../components/ui/section-header'
import { Spinner } from '../../components/ui/spinner'
import { Stat } from '../../components/ui/stat'
import { formatCount } from '../../lib/format'
import { useProjects } from '../../queries/projects'
import { useTickets } from '../../queries/tickets'
import type { Deployment } from '../../types/api'
import { DeploymentsTable } from '../projects/deployments-table'
import { useQueries } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import { queryKeys } from '../../queries/keys'

export function DashboardPage() {
  const projects = useProjects()
  const tickets = useTickets()
  const deploymentQueries = useQueries({
    queries: (projects.data ?? []).map((project) => ({
      queryKey: queryKeys.projectDeployments(project.id),
      queryFn: () => apiFetch<Deployment[]>(`/projects/${project.id}/deployments`),
      enabled: Boolean(projects.data),
    })),
  })
  const deployments = deploymentQueries.flatMap((query) => query.data ?? []).sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt))
  const failed = deployments.filter((deployment) => deployment.status === 'FAILED').length
  const successful = deployments.filter((deployment) => deployment.status === 'SUCCESS').length
  const running = deployments.filter((deployment) => deployment.status === 'RUNNING' || deployment.status === 'QUEUED').length
  const chartData = buildDailyData(deployments)
  const pieData = [
    { name: 'Success', value: successful, color: '#00c758' },
    { name: 'Failed', value: failed, color: '#fb2c36' },
  ].filter((item) => item.value > 0)

  return (
    <div className="grid gap-6">
      <SectionHeader title="Dashboard" description="Live operational view across projects, deployments, and tickets." />
      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Projects" value={formatCount(projects.data?.length ?? 0)} icon={Layers} />
        <Stat label="Deployments" value={formatCount(deployments.length)} icon={Zap} />
        <Stat label="Open tickets" value={formatCount((tickets.data ?? []).filter((ticket) => ticket.status !== 'CLOSED').length)} icon={Ticket} />
        <Stat label="Running" value={formatCount(running)} icon={Activity} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader><h2 className="font-semibold">Deployments per day</h2></CardHeader>
          <CardContent className="h-72">
            {projects.isLoading ? <Spinner /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="deployments" stroke="hsl(var(--accent-surface))" fill="hsl(var(--accent-surface) / 0.28)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Outcome</h2></CardHeader>
          <CardContent className="h-72">
            {pieData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState title="No deployment outcomes" />}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><h2 className="font-semibold">Recent deployments</h2></CardHeader>
        <CardContent>
          {deployments.length ? <DeploymentsTable deployments={deployments.slice(0, 8)} /> : <EmptyState title="No deployments yet" />}
        </CardContent>
      </Card>
    </div>
  )
}

function buildDailyData(deployments: Deployment[]) {
  const days = new Map<string, number>()
  deployments.forEach((deployment) => {
    const day = deployment.startedAt.slice(0, 10)
    days.set(day, (days.get(day) ?? 0) + 1)
  })
  return [...days.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, count]) => ({ date: date.slice(5), deployments: count }))
}
