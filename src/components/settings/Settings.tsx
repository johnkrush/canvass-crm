import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { TEAM_MEMBERS, STATUS_CONFIG, ALL_STATUSES } from '../../types'
import { exportToCSV } from '../../utils/csv'
import {
  Users,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  MapPin,
} from 'lucide-react'

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className="text-white/40" />
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        {children}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { leads, clearData, user } = useApp()
  const [confirmClear, setConfirmClear] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [exported, setExported] = useState(false)

  const handleExport = () => {
    exportToCSV(leads)
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }

  const handleClear = () => {
    if (!confirmClear) { setConfirmClear(true); return }
    clearData()
    setConfirmClear(false)
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  const statusCounts = ALL_STATUSES.map((s) => ({
    s,
    count: leads.filter((l) => l.status === s).length,
  }))

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-dim mt-0.5">Manage your team and data</p>
      </div>

      {/* Account */}
      <Section title="Account" icon={MapPin}>
        <div className="px-5 py-4 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {user?.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-dim">{user?.email}</p>
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}
            >
              {user?.role}
            </span>
          </div>
        </div>
      </Section>

      {/* Team members */}
      <Section title="Team Members" icon={Users}>
        {TEAM_MEMBERS.map((member, i) => {
          const count = leads.filter((l) => l.assignedRep === member).length
          const initials = member.split(' ').map((w) => w[0]).join('')
          return (
            <div
              key={member}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/03"
              style={{ borderBottom: i < TEAM_MEMBERS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: `hsl(${(i * 47 + 210) % 360}, 60%, 45%)` }}
              >
                {initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{member}</p>
                <p className="text-xs text-dim">{count} assigned lead{count !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {ALL_STATUSES.map((s) => {
                  const c = leads.filter((l) => l.assignedRep === member && l.status === s).length
                  if (!c) return null
                  return (
                    <span
                      key={s}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ background: STATUS_CONFIG[s].bgStyle, color: STATUS_CONFIG[s].color }}
                      title={`${STATUS_CONFIG[s].label}: ${c}`}
                    >
                      {c}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </Section>

      {/* Data summary */}
      <Section title="Data Summary" icon={Info}>
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-dim">Total leads stored</span>
            <span className="font-semibold text-white tabular-nums">{leads.length}</span>
          </div>
          {statusCounts.map(({ s, count }) => (
            <div key={s} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: STATUS_CONFIG[s].color }} />
                <span className="text-dim">{STATUS_CONFIG[s].label}</span>
              </div>
              <span className="font-medium tabular-nums" style={{ color: STATUS_CONFIG[s].color }}>{count}</span>
            </div>
          ))}
          <div
            className="pt-3 flex items-start gap-2 text-xs text-dim"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Info size={12} className="shrink-0 mt-0.5" />
            All data is stored locally in your browser. Clearing browser data will erase leads.
          </div>
        </div>
      </Section>

      {/* Export */}
      <Section title="Export" icon={Download}>
        <div className="px-5 py-4">
          <p className="text-sm text-mid mb-4">
            Export all {leads.length} leads to a CSV file compatible with Excel, Google Sheets, or any CRM.
          </p>
          <button
            onClick={handleExport}
            className="btn-primary"
          >
            {exported ? (
              <>
                <CheckCircle size={15} />
                Exported!
              </>
            ) : (
              <>
                <Download size={15} />
                Export {leads.length} Leads to CSV
              </>
            )}
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone" icon={Trash2}>
        <div className="px-5 py-4">
          <p className="text-sm text-mid mb-1">Reset all lead data</p>
          <p className="text-xs text-dim mb-4">
            This will delete all leads and restore the 20 demo leads. This action cannot be undone.
          </p>

          {cleared && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm mb-3"
              style={{ background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75' }}
            >
              <CheckCircle size={14} />
              Data has been reset to demo leads.
            </div>
          )}

          {confirmClear && (
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm mb-3"
              style={{ background: 'rgba(226,75,74,0.12)', border: '1px solid rgba(226,75,74,0.3)', color: '#E24B4A' }}
            >
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>Are you sure? Click again to confirm. All your leads will be permanently deleted.</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={handleClear} className="btn-danger">
              <Trash2 size={14} />
              {confirmClear ? 'Yes, Reset Everything' : 'Reset All Data'}
            </button>
            {confirmClear && (
              <button
                onClick={() => setConfirmClear(false)}
                className="btn-ghost text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* App info */}
      <div className="text-center text-xs text-dim pb-4">
        <p>Canvass v1.0.0 · Built for door-to-door sales teams</p>
        <p className="mt-1">All data stored locally · No cloud sync</p>
      </div>
    </div>
  )
}
