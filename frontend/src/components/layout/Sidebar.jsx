import React from 'react'
import { NAV_ITEMS } from '../../lib/constants'

export default function Sidebar({ page, setPage, user, onLogout }) {
  return (
    <div style={{
      width: 210, height: '100vh',
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--bdr)',
      background: 'var(--bg1)',
      padding: '16px 10px',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 8px 20px' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'linear-gradient(135deg, var(--acc), var(--acc2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, boxShadow: '0 4px 14px rgba(0,229,180,.25)',
        }}>⚡</div>
        <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.3px' }}>Tracky</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`nav-item${page === item.id ? ' active' : ''}`}
            onClick={() => setPage(item.id)}
          >
            <span style={{ fontSize: 14 }}>{item.emoji}</span>
            {item.label}
            {item.badge && (
              <span style={{
                marginLeft: 'auto', fontSize: 9,
                background: 'var(--acc)', color: '#000',
                borderRadius: 999, padding: '2px 5px', fontWeight: 800,
              }}>
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid var(--bdr)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 10px' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--acc), var(--acc2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#000', flexShrink: 0,
          }}>
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--txt3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || ''}
            </div>
          </div>
        </div>
        <button className="btn-secondary" style={{ width: '100%', fontSize: 11.5 }} onClick={onLogout}>
          → Sign Out
        </button>
      </div>
    </div>
  )
}
