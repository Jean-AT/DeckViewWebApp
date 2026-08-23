import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowUpRight } from 'lucide-react'
import { Eyebrow } from '../../components/ui/card'
import { EmptyState } from '../../components/ui/empty-state'
import { SectionHeader } from '../../components/ui/section-header'
import { PageLoader } from '../../components/ui/spinner'
import { Stat, StatusDot } from '../../components/ui/stat'
import { formatCount, formatDuration, shortSha, timeAgo } from '../../lib/format'
import { PROVIDERS, STATUS_META } from '../../lib/meta'
import { useDashboard } from '../../queries/dashboard'
import type { Deployment } from '../../types/api'

const CHART_COLORS = {
  success: '#00c758',
  failed: '#fb2c36',
  other: 'hsl(0 0% 45%)',
  grid: 'hsl(0 0% 16%)',
}

function buildDailySeries(deployments: Deployment[], days = 14) {
  const buckets = new Map<string, number>()
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    buckets.set(d.toISOString().slice(0, 10), 0)
  }
  for (const dep of deployments) {
    const key = dep.startedAt.slice(0, 10)
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  return [...buckets.entries()].map(([day, count]) => ({
    day: day.slice(5),
    deployments: count,
  }))
}

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboard()

  const stats = useMemo(() => {
    if (!data) return null
    const finished = data.deployments.filter((d) => d.status === 'SUCCESS' || d.status === 'FAILED')
    const success = finished.filter((d) => d.status === 'SUCCESS').length
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000
    const last24h = data.deployments.filter((d) => new Date(d.startedAt).getTime() >= dayAgo).length
    return {
      projects: data.projects.length,
      last24h,
      successRate: finished.length > 0 ? Math.round((success / finished.length) * 100) : null,
      openTickets: data.openTickets,
    }
  }, [data])

  const dailySeries = useMemo(() => (data ? buildDailySeries(data.deployments) : []), [data])

  const donut = useMemo(() => {
    if (!data) return []
    const success = data.deployments.filter((d) => d.status === 'SUCCESS').length
    const failed = data.deployments.filter((d) => d.status === 'FAILED').length
    const other = data.deployments.length - success - failed
    const rows = [
      { name: 'Success', value: success, color: CHART_COLORS.success },
      { name: 'Failed', value: failed, color: CHART_COLORS.failed },
    ]
    if (other > 0) rows.push({ name: 'Other', value: other, color: CHART_COLORS.other })
    return rows.filter((r) => r.value > 0)
  }, [data])

  const recent = useMemo(
    () =>
      data
        ? [...data.deployments]
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
            .slice(0, 8)
        : [],
    [data],
  )

  const projectName = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of data?.projects ?? []) map.set(p.id, p.name)
    return map
  }, [data])

  if (isLoading) return <PageLoader />
  if (isError || !data || !stats) {
    return <EmptyState title="Unable to load the dashboard" description="Check that the backend is running and try again." />
  }

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        index="01 / Overview"
        title="What is shipping right now."
        description="Deployment state across every connected provider, refreshed by the backend sync jobs."
      />

      <div className="grid grid-cols-2 gap-px border border-line bg-line xl:grid-cols-4">
        <Stat label="Projects" value={formatCount(stats.projects)} />
        <Stat label="Deploys · 24h" value={formatCount(stats.last24h)} />
        <Stat label="Success rate" value={stats.successRate === null ? '—' : `${stats.successRate}%`} />
        <Stat label="Open tickets" value={formatCount(stats.openTickets)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="border border-line bg-card p-6 lg:col-span-2">
          <Eyebrow className="mb-4">Deployments · last 14 days</Eyebrow>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySeries} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="deploysFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00c758" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#00c758" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: 'hsl(0 0% 55%)', fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: 'hsl(0 0% 55%)', fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ stroke: CHART_COLORS.grid }}
                  contentStyle={{
                    background: 'hsl(0 0% 5%)',
                    border: '1px solid hsl(0 0% 16%)',
                    fontSize: 12,
                    color: 'hsl(0 0% 96%)',
                  }}
                />
                <Area type="monotone" dataKey="deployments" stroke="#00c758" strokeWidth={1.5} fill="url(#deploysFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-line bg-card p-6">
          <Eyebrow className="mb-4">Outcome split</Eyebrow>
          {donut.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deployments synced yet.</p>
          ) : (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donut} dataKey="value" nameKey="name" innerRadius={45} outerRadius={65} paddingAngle={2} stroke="none">
                      {donut.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(0 0% 5%)',
                        border: '1px solid hsl(0 0% 16%)',
                        fontSize: 12,
                        color: 'hsl(0 0% 96%)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 flex flex-col gap-1.5">
                {donut.map((entry) => (
                  <li key={entry.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="size-2 rounded-full" style={{ background: entry.color }} aria-hidden="true" />
                      {entry.name}
                    </span>
                    <span className="font-mono">{entry.value}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="border border-line bg-card">
        <div className="flex items-center justify-between border-b border-line p-6">
          <Eyebrow>Recent deployments</Eyebrow>
          <Link to="/projects" className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
            All projects
            <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" aria-hidden="true" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No deployments yet" description="Sync a project to pull its deployment history." />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((dep) => {
              const meta = STATUS_META[dep.status]
              const provider = PROVIDERS[dep.provider]
              return (
                <li key={dep.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 text-sm">
                  <span className="flex w-40 items-center gap-2 font-medium">
                    <StatusDot status={dep.status} />
                    {projectName.get(dep.projectId) ?? 'Project'}
                  </span>
                  <span className="hidden w-28 text-muted-foreground sm:inline">{provider.label}</span>
                  <span className="w-20 font-mono text-xs text-muted-foreground">{shortSha(dep.commitSha)}</span>
                  <span className="w-20 font-mono text-xs text-muted-foreground">{formatDuration(dep.durationMs)}</span>
                  <span className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{timeAgo(dep.startedAt)}</span>
                    <span className={`text-xs font-semibold ${dep.status === 'FAILED' ? 'text-danger' : dep.status === 'SUCCESS' ? 'text-success' : 'text-muted-foreground'}`}>
                      {meta.label}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}