import React, { useState } from 'react'
import { Toggle } from '../components/ui'
import { formatDateShort } from '../lib/constants'
import useTransactionStore from '../store/transactionStore'
import useAuthStore from '../store/authStore'

export default function Settings({ theme, setTheme }) {
  const { user, updateProfile, logout } = useAuthStore()
  const { transactions, fetchTransactions } = useTransactionStore()

  const [name,  setName]  = useState(user?.name  || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState('+91 98765 43210')
  const [saved,   setSaved]   = useState(false)
  const [cleared, setCleared] = useState(false)
  const [notifs, setNotifs] = useState({
    overspend: true, weekly: true, subscriptions: true, unusual: true,
  })

  const saveProfile = async () => {
    await updateProfile({ name, email })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const exportAll = () => {
    const rows = [
      ['Date', 'Merchant', 'Amount', 'Type', 'Category', 'Bank', 'Account'],
      ...transactions.map((t) => [formatDateShort(t.date), `"${t.merchant}"`, t.amount, t.type, t.category, t.bank, t.acc]),
    ]
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'tracky-full-export.csv'
    a.click()
  }

  const clearData = () => {
    if (window.confirm('Permanently clear all transaction history? This cannot be undone.')) {
      useTransactionStore.setState({ transactions: [] })
      setCleared(true)
      setTimeout(() => setCleared(false), 2000)
    }
  }

  const Section = ({ title, children }) => (
    <div className="card" style={{ padding: 18, marginBottom: 12 }}>
      <h3 style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--bdr)' }}>
        {title}
      </h3>
      {children}
    </div>
  )

  const Row = ({ label, sub, children, last }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: last ? 0 : 12, marginBottom: last ? 0 : 12, borderBottom: last ? 'none' : '1px solid var(--bdr)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 1 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )

  return (
    <div style={{ maxWidth: 660 }}>
      <div className="animate-fadeUp" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Settings</h1>
        <p style={{ color: 'var(--txt2)', fontSize: 13, marginTop: 2 }}>Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="animate-fadeUp" style={{ animationDelay: '.07s' }}>
        <Section title="👤 Profile">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 13 }}>
            <div>
              <label style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: '.4px' }}>FULL NAME</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: '.4px' }}>EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: '.4px' }}>PHONE</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <button className="btn-primary" onClick={saveProfile}>
            {saved ? '✓ Profile Saved' : '💾 Save Profile'}
          </button>
        </Section>
      </div>

      {/* Notifications */}
      <div className="animate-fadeUp" style={{ animationDelay: '.14s' }}>
        <Section title="🔔 Notifications">
          <Row label="Overspend Alerts" sub="Notify when category budgets are exceeded">
            <Toggle checked={notifs.overspend} onChange={() => setNotifs((p) => ({ ...p, overspend: !p.overspend }))} />
          </Row>
          <Row label="Weekly Report" sub="Spending summary every Sunday morning">
            <Toggle checked={notifs.weekly} onChange={() => setNotifs((p) => ({ ...p, weekly: !p.weekly }))} />
          </Row>
          <Row label="Subscription Reminders" sub="3-day advance notice before renewals">
            <Toggle checked={notifs.subscriptions} onChange={() => setNotifs((p) => ({ ...p, subscriptions: !p.subscriptions }))} />
          </Row>
          <Row label="Unusual Spend Detection" sub="Alert when a transaction is 3× your average" last>
            <Toggle checked={notifs.unusual} onChange={() => setNotifs((p) => ({ ...p, unusual: !p.unusual }))} />
          </Row>
        </Section>
      </div>

      {/* Appearance */}
      <div className="animate-fadeUp" style={{ animationDelay: '.21s' }}>
        <Section title="🎨 Appearance">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Theme</div>
              <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 1 }}>Currently: {theme === 'dark' ? 'Dark mode 🌙' : 'Light mode ☀️'}</div>
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              {[{ k: 'dark', l: '🌙 Dark' }, { k: 'light', l: '☀️ Light' }].map(({ k, l }) => (
                <button key={k} className={theme === k ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: 12 }} onClick={() => setTheme(k)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Data & Privacy */}
      <div className="animate-fadeUp" style={{ animationDelay: '.28s' }}>
        <Section title="📊 Data & Privacy">
          <Row label="Transaction History" sub={`${transactions.length} transactions stored locally`}>
            <button className="btn-secondary" onClick={exportAll}>⬇ Export All</button>
          </Row>
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(244,63,94,.07)', border: '1px solid rgba(244,63,94,.18)' }}>
            <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--red)', marginBottom: 7 }}>⚠️ Danger Zone</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--txt2)' }}>Permanently clear all transaction history</div>
              <button
                className="btn-secondary"
                style={{ borderColor: 'rgba(244,63,94,.3)', color: 'var(--red)' }}
                onClick={clearData}
              >
                {cleared ? '✓ Cleared' : '🗑 Clear Data'}
              </button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}
