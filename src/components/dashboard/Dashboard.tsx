import { useMemo } from 'react'
import { useApp } from '../../contexts/AppContext'
import { ALL_STATUSES, STATUS_CONFIG, LeadStatus } from '../../types'
import { TrendingUp, Users, MapPin, Calendar, Activity } from 'lucide-react'

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  accent?: string
  sub?: string
}) {
  return (
    <div
      className="glass rounded-2xl p-5 transition-all"
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-dim">{label}</p>
          <p
            className="text-3xl font-bold mt-2 tabular-nums"
            style={{ color: accent ?? '#f0f4ff' }}
          >
            {value}
          </p>
          {sub && <p className="text-xs text-dim mt-1">{sub}</p>}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accent ? `${accent}20` : 'rgba(255,255,255,0.06)' }}
        >
          <Icon size={18} style={{ color: accent ?? 'rgba(240,244,255,0.5)' }} />
        </div>
      </div>
    </div>
  )
}

function StatusCard({ status }: { status: LeadStatus }) {
  const { leads } = useApp()
  const cfg = STATUS_CONFIG[status]
  const count = leads.filter((l) => l.status === status).length
  const pct = leads.length ? Math.round((count / leads.length) * 100) : 0

  return (
    <div
      className="glass rounded-2xl p-4 flex items-center gap-4"
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: cfg.bgStyle }}
      >
        <span className="w-3 h-3 rounded-full" style={{ background: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-medium" style={{ color: 'rgba(240,244,255,0.8)' }}>{cfg.label}</p>
          <p className="text-sm font-bold tabular-nums" style={{ color: cfg.color }}>{count}</p>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: cfg.color }}
          />
        </div>
        <p className="text-[10px] text-dim mt-1">{pct}% of total</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { leads } = useApp()

  const stats = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - 7 * 86400000

    const addedThisWeek = leads.filter(
      (l) => new Date(l.createdAt).getTime() >= weekAgo
    ).length

    const activeReps = new Set(leads.map((l) => l.assignedRep).filter(Boolean)).size

    const interested = leads.filter((l) => l.status === 'interested').length
    const conversionPct = leads.length
      ? Math.round((interested / leads.length) * 100)
      : 0

    return { total: leads.length, addedThisWeek, activeReps, conversionPct, interested }
  }, [leads])

  const recentLeads = useMemo(
    () =>
      [...leads]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [leads]
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-dim mt-0.5">Overview of your canvassing activity</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Leads"
          value={stats.total}
          icon={MapPin}
          accent="#6366f1"
          sub="across all reps"
        />
        <StatCard
          label="Added This Week"
          value={stats.addedThisWeek}
          icon={Calendar}
          accent="#1D9E75"
          sub="new this week"
        />
        <StatCard
          label="Interested"
          value={stats.interested}
          icon={TrendingUp}
          accent="#1D9E75"
          sub={`${stats.conversionPct}% conversion rate`}
        />
        <StatCard
          label="Active Reps"
          value={stats.activeReps}
          icon={Users}
          accent="#378ADD"
          sub="with assigned leads"
        />
      </div>

      {/* Status breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={15} className="text-white/40" />
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Lead Status Breakdown</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {ALL_STATUSES.map((s) => (
            <StatusCard key={s} status={s} />
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={15} className="text-white/40" />
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Recent Activity</h2>
        </div>
        <div
          className="glass rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {recentLeads.map((lead, i) => {
            const cfg = STATUS_CONFIG[lead.status]
            return (
              <div
                key={lead.id}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/03"
                style={{
                  borderBottom: i < recentLeads.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{lead.householdName}</p>
                  <p className="text-xs text-dim truncate">{lead.address}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</p>
                  <p className="text-[10px] text-dim mt-0.5">
                    {new Date(lead.updatedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Rep breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={15} className="text-white/40" />
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Leads by Rep</h2>
        </div>
        <div
          className="glass rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {Array.from(new Set(leads.map((l) => l.assignedRep).filter(Boolean)))
            .sort()
            .map((rep, i, arr) => {
              const repLeads = leads.filter((l) => l.assignedRep === rep)
              const intCount = repLeads.filter((l) => l.status === 'interested').length
              return (
                <div
                  key={rep}
                  className="flex items-center gap-4 px-4 py-3"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    {rep.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{rep}</p>
                    <p className="text-xs text-dim">{repLeads.length} lead{repLeads.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: '#1D9E75' }}>{intCount}</p>
                    <p className="text-[10px] text-dim">interested</p>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
