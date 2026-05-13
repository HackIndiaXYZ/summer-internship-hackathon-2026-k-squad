import React from 'react'
import { NAV_ITEMS } from '../../lib/constants'

export default function TopBar({ page, user, notifs, onBell, theme, setTheme }) {
  const unread = notifs.filter((n) => !n.read).length
  const title = NAV_ITEMS.find((n) => n.id === page)?.label || 'Tracky'

  return (
    <div style={{
      height: 54,
      borderBottom: '1px solid var(--bdr)',
      background: 'var(--bg1)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 26px',
      gap: 12,
      flexShrink: 0,
    }}>
      {/* Title */}
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.3px' }}>{title}</h2>
        <p style={{ fontSize: 10.5, color: 'var(--txt3)', marginTop: 1 }}>May 2025 · Tracky</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', width: 190 }}>
        <span style={{
          position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--txt3)', fontSize: 11, pointerEvents: 'none',
        }}>🔍</span>
        <input placeholder="Search…" style={{ paddingLeft: 28, height: 32, fontSize: 12 }} />
      </div>

      {/* Theme */}
      <button
        onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, padding: 6, borderRadius: 7, color: 'var(--txt2)' }}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Bell */}
      <button
        onClick={onBell}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 6, borderRadius: 7, position: 'relative' }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--red)', display: 'block',
          }} />
        )}
      </button>

      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: 'linear-gradient(135deg, var(--acc), var(--acc2))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, color: '#000', cursor: 'pointer',
      }}>
        {(user?.name || 'U')[0].toUpperCase()}
      </div>
    </div>
  )
}
