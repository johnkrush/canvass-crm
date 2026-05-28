import { useState, type FormEvent } from 'react'
import { useApp } from '../../contexts/AppContext'
import { MapPin, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginScreen() {
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Brief delay for UX feel
    await new Promise((r) => setTimeout(r, 600))
    const ok = login(email.trim(), password)
    if (!ok) setError('Invalid email or password. Try admin@canvass.app / admin123')
    setLoading(false)
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center px-4 overflow-hidden bg-[#080b12]">
      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="relative z-10 w-full max-w-[400px] animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <MapPin size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Canvass</h1>
          <p className="text-sm text-dim mt-1">Door-to-door sales team CRM</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-7 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your team</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@canvass.app"
                required
                autoComplete="email"
                className="field-input"
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="field-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs"
                style={{ background: 'rgba(226,75,74,0.12)', border: '1px solid rgba(226,75,74,0.3)', color: '#E24B4A' }}>
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 h-11 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-dim">
            Demo: <span className="text-white/50">admin@canvass.app</span>{' '}
            /{' '}
            <span className="text-white/50">admin123</span>
          </p>
        </div>

        <p className="text-center text-xs text-dim mt-6">
          © 2025 Canvass · All data stored locally
        </p>
      </div>
    </div>
  )
}
