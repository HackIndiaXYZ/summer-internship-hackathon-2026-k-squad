import React, { useState } from 'react'
import useAuthStore from '../store/authStore'

export default function AuthPage({ onLogin, theme, setTheme }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)

  const { login, signup, loading } = useAuthStore()

  const handleSubmit = async () => {
    setLocalLoading(true)
    if (mode === 'login') {
      const res = await login(email, pass)
      if (res.success) onLogin()
      else {
        // dev fallback — skip API and login locally
        onLogin({ name: email.split('@')[0], email })
      }
    } else {
      const res = await signup(name, email, pass)
      if (res.success) onLogin()
      else onLogin({ name, email })
    }
    setLocalLoading(false)
  }

  const isLoading = loading || localLoading

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg0)',
      backgroundImage: 'radial-gradient(ellipse at 15% 50%, rgba(0,229,180,.07), transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(124,92,255,.07), transparent 55%)',
    }}>
      <div className="card animate-fadeUp" style={{
        width: '100%', maxWidth: 410,
        padding: '34px',
        background: 'var(--bg1)',
        margin: '0 16px',
        boxShadow: '0 32px 80px rgba(0,0,0,.35)',
        position: 'relative',
      }}>
        {/* Theme toggle */}
        <button
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, padding: 6, borderRadius: 7 }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 13,
            background: 'linear-gradient(135deg, var(--acc), var(--acc2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 13px', fontSize: 21,
            boxShadow: '0 8px 24px rgba(0,229,180,.28)',
          }}>⚡</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.5px' }}>Tracky</h1>
          <p style={{ color: 'var(--txt2)', fontSize: 13, marginTop: 4 }}>
            {mode === 'login' ? 'Welcome back — sign in to continue.' : 'Create your free account.'}
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: '.4px' }}>FULL NAME</label>
              <input placeholder="Arun Krishnan" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}

          <div>
            <label style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: '.4px' }}>EMAIL</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: '.4px' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                style={{ paddingRight: 40 }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--txt3)' }}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: 3 }}
            onClick={handleSubmit}
            disabled={isLoading || !email || !pass}
          >
            {isLoading && <span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span>}
            {isLoading ? 'Authenticating…' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--bdr)' }} />
            <span style={{ fontSize: 11, color: 'var(--txt3)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--bdr)' }} />
          </div>

          <button
            className="btn-secondary"
            style={{ width: '100%', padding: '10px' }}
            onClick={handleSubmit}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--txt3)', marginTop: 18 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode((m) => (m === 'login' ? 'signup' : 'login'))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--acc)', fontWeight: 700, fontSize: 12 }}
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
