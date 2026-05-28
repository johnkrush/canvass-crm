import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../contexts/AppContext'
import { STATUS_CONFIG, ALL_STATUSES } from '../../types'
import { exportToCSV } from '../../utils/csv'
import {
  Users,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  UserCircle,
  Plus,
  X,
  Save,
} from 'lucide-react'

// ── Toast ────────────────────────────────────────────────────────
function Toast({ message }: { message: string }) {
  return (
    <div
      className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[9999]
        flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold
        animate-slide-up pointer-events-none whitespace-nowrap"
      style={{
        background: 'rgba(8, 18, 36, 0.97)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(29,158,117,0.45)',
        color: '#1D9E75',
        boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
      }}
    >
      <CheckCircle size={15} className="shrink-0" />
      {message}
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className="text-white/40" />
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">{title}</h2>
      </div>
      <div
        className="glass rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {children}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function SettingsPage() {
  const { leads, clearData, user, updateUser, teamMembers, setTeamMembers } = useApp()

  // Toast state
  const [toast, setToast] = useState('')
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = setTimeout(() => setToast(''), 2800)
  }

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current) }, [])

  // ── Profile ──────────────────────────────────────────────────
  const [profileName, setProfileName] = useState(user?.name ?? '')

  // Keep in sync if user changes externally
  useEffect(() => { setProfileName(user?.name ?? '') }, [user?.name])

  const handleSaveProfile = () => {
    const trimmed = profileName.trim()
    if (!trimmed || trimmed === user?.name) return
    updateUser({ name: trimmed })
    showToast('Profile updated')
  }

  const handleProfileKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveProfile()
  }

  // ── Team members ─────────────────────────────────────────────
  const [members, setMembers] = useState<string[]>(teamMembers)
  const newMemberRef = useRef<HTMLInputElement | null>(null)

  // Sync if teamMembers resets (e.g. clearData)
  useEffect(() => { setMembers(teamMembers) }, [teamMembers])

  const commitMembers = (updated: string[], toastMsg = 'Team updated') => {
    const filtered = updated.filter((m) => m.trim())
    setMembers(filtered)
    setTeamMembers(filtered)
    showToast(toastMsg)
  }

  const handleMemberChange = (i: number, value: string) => {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? value : m)))
  }

  const handleMemberBlur = (i: number) => {
    const value = members[i]?.trim()
    if (!value) {
      // Remove empty on blur
      const updated = members.filter((_, idx) => idx !== i)
      setMembers(updated)
      setTeamMembers(updated.filter((m) => m.trim()))
      showToast('Empty member removed')
      return
    }
    const updated = members.map((m, idx) => (idx === i ? value : m))
    setTeamMembers(updated.filter((m) => m.trim()))
    showToast('Team updated')
  }

  const handleMemberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Enter') e.currentTarget.blur()
    if (e.key === 'Escape') {
      // Revert to saved value
      setMembers(teamMembers)
      e.currentTarget.blur()
    }
  }

  const handleAddMember = () => {
    setMembers((prev) => [...prev, ''])
    // Focus the new input after render
    setTimeout(() => newMemberRef.current?.focus(), 50)
  }

  const handleRemoveMember = (i: number) => {
    commitMembers(members.filter((_, idx) => idx !== i), 'Member removed')
  }

  // ── Data / export / clear ────────────────────────────────────
  const [confirmClear, setConfirmClear] = useState(false)
  const [exported, setExported] = useState(false)

  const handleExport = () => {
    exportToCSV(leads)
    setExported(true)
    showToast(`Exported ${leads.length} leads to CSV`)
    setTimeout(() => setExported(false), 2500)
  }

  const handleClear = () => {
    if (!confirmClear) { setConfirmClear(true); return }
    clearData()
    setConfirmClear(false)
    showToast('Data reset to demo leads')
  }

  const statusCounts = ALL_STATUSES.map((s) => ({
    s,
    count: leads.filter((l) => l.status === s).length,
  }))

  return (
    <>
      {toast && <Toast message={toast} />}

      <div className="max-w-2xl mx-auto space-y-6 pb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-sm text-dim mt-0.5">Manage your profile, team, and data</p>
        </div>

        {/* ── Admin Profile ─────────────────────────────────── */}
        <Section title="Admin Profile" icon={UserCircle}>
          <div className="px-5 py-5 space-y-4">
            {/* Avatar + name preview */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0 transition-all"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {profileName.trim()
                  ? profileName.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                  : '?'}
              </div>
              <div>
                <p className="text-white font-semibold">{profileName || user?.name}</p>
                <p className="text-xs text-dim">{user?.email}</p>
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium"
                  style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}
                >
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Name field */}
            <div>
              <label className="field-label">Display Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                onKeyDown={handleProfileKeyDown}
                placeholder="Your display name"
                className="field-input"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="field-input opacity-40 cursor-not-allowed select-none"
              />
              <p className="text-xs text-dim mt-1.5">Email is fixed to the demo account</p>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={!profileName.trim() || profileName.trim() === user?.name}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              Save Profile
            </button>
          </div>
        </Section>

        {/* ── Team Members ──────────────────────────────────── */}
        <Section title="Team Members" icon={Users}>
          <div className="px-5 py-4 space-y-2.5">
            <p className="text-xs text-dim mb-3">
              Edit names inline — changes save automatically when you leave the field. Reps appear in the lead assignment dropdown.
            </p>

            {members.map((member, i) => (
              <div key={i} className="flex items-center gap-2 group">
                {/* Colour dot */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: `hsl(${(i * 47 + 210) % 360}, 55%, 42%)` }}
                >
                  {member.trim()
                    ? member.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                    : '?'}
                </div>

                <input
                  ref={i === members.length - 1 && member === '' ? newMemberRef : null}
                  type="text"
                  value={member}
                  onChange={(e) => handleMemberChange(i, e.target.value)}
                  onBlur={() => handleMemberBlur(i)}
                  onKeyDown={(e) => handleMemberKeyDown(e, i)}
                  placeholder="Team member name"
                  className="field-input flex-1"
                />

                <button
                  onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                  onClick={() => handleRemoveMember(i)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all
                    opacity-0 group-hover:opacity-100 hover:bg-red-500/15 text-white/30 hover:text-red-400"
                  title="Remove member"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <button
              onClick={handleAddMember}
              className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl text-sm font-medium
                transition-all w-full border border-dashed"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                color: 'rgba(240,244,255,0.45)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'
                e.currentTarget.style.color = '#a5b4fc'
                e.currentTarget.style.background = 'rgba(99,102,241,0.07)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.color = 'rgba(240,244,255,0.45)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Plus size={15} />
              Add team member
            </button>
          </div>
        </Section>

        {/* ── Data Summary ──────────────────────────────────── */}
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
                <span className="font-medium tabular-nums" style={{ color: STATUS_CONFIG[s].color }}>
                  {count}
                </span>
              </div>
            ))}
            <div
              className="pt-3 flex items-start gap-2 text-xs text-dim"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Info size={12} className="shrink-0 mt-0.5" />
              All data is stored locally in your browser. Clearing browser storage will erase leads.
            </div>
          </div>
        </Section>

        {/* ── Export ────────────────────────────────────────── */}
        <Section title="Export" icon={Download}>
          <div className="px-5 py-4">
            <p className="text-sm text-mid mb-4">
              Export all {leads.length} leads to a CSV file compatible with Excel, Google Sheets, or any CRM.
            </p>
            <button onClick={handleExport} className="btn-primary">
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

        {/* ── Danger Zone ───────────────────────────────────── */}
        <Section title="Danger Zone" icon={Trash2}>
          <div className="px-5 py-4">
            <p className="text-sm text-mid mb-1">Reset all lead data</p>
            <p className="text-xs text-dim mb-4">
              Deletes all leads and restores the 20 demo leads. Team member names are preserved. This cannot be undone.
            </p>

            {confirmClear && (
              <div
                className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm mb-3"
                style={{
                  background: 'rgba(226,75,74,0.12)',
                  border: '1px solid rgba(226,75,74,0.3)',
                  color: '#E24B4A',
                }}
              >
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                Are you sure? Click again to confirm. All leads will be permanently deleted.
              </div>
            )}

            <div className="flex items-center gap-3">
              <button onClick={handleClear} className="btn-danger">
                <Trash2 size={14} />
                {confirmClear ? 'Yes, Reset Everything' : 'Reset All Data'}
              </button>
              {confirmClear && (
                <button onClick={() => setConfirmClear(false)} className="btn-ghost text-sm">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </Section>

        <div className="text-center text-xs text-dim pb-4">
          <p>Canvass v1.0.0 · Built for door-to-door sales teams</p>
          <p className="mt-1">All data stored locally · No cloud sync</p>
        </div>
      </div>
    </>
  )
}
