import React from 'react'

const SEV_STYLES = {
  critical: { bg: 'rgba(244,63,94,.09)', bd: 'rgba(244,63,94,.22)', c: 'var(--red)',   e: '🚨' },
  warning:  { bg: 'rgba(245,158,11,.09)', bd: 'rgba(245,158,11,.22)', c: 'var(--amber)', e: '⚠️' },
  info:     { bg: 'rgba(0,229,180,.07)',  bd: 'rgba(0,229,180,.18)', c: 'var(--acc)',   e: 'ℹ️' },
}

export default function NotifDrawer({ notifs, setNotifs, onClose }) {
  const unread = notifs.filter((n) => !n.read).length
  const markAll = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })))
  const markOne = (id) => setNotifs((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)))
  const remove  = (id) => setNotifs((p) => p.filter((n) => n.id !== id))

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.45)',
          zIndex: 100,
          animation: 'fadeIn .2s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        height: '100vh', width: 320,
        background: 'var(--bg1)',
        borderLeft: '1px solid var(--bdr)',
        display: 'flex', flexDirection: 'column',
        zIndex: 101,
        animation: 'slideRight .28s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 18px',
          borderBottom: '1px solid var(--bdr)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 14 }}>Notifications</h3>
            {unread > 0 && <p style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 1 }}>{unread} unread</p>}
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            {unread > 0 && (
              <button className="btn-secondary" style={{ fontSize: 10.5, padding: '4px 9px' }} onClick={markAll}>
                ✓ All read
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--txt2)', padding: 4 }}
            >✕</button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {notifs.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--txt3)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔔</div>
              <p style={{ fontSize: 13 }}>All caught up!</p>
            </div>
          ) : (
            notifs.map((n) => {
              const s = SEV_STYLES[n.sev] || SEV_STYLES.info
              return (
                <div key={n.id} style={{
                  display: 'flex', gap: 9,
                  padding: '11px 9px', borderRadius: 10, marginBottom: 5,
                  background: n.read ? 'transparent' : s.bg,
                  border: `1px solid ${n.read ? 'transparent' : s.bd}`,
                  transition: 'background .2s, border .2s',
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{s.e}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: n.read ? 500 : 700, marginBottom: 3, lineHeight: 1.3 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--txt2)', lineHeight: 1.5 }}>{n.msg}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
                    {!n.read && (
                      <button
                        onClick={() => markOne(n.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt3)', fontSize: 12, padding: '2px 4px' }}
                      >✓</button>
                    )}
                    <button
                      onClick={() => remove(n.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt3)', fontSize: 12, padding: '2px 4px' }}
                    >✕</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
