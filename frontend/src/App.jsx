import React, { useState, useEffect } from 'react'
import AuthPage from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import SMSImport from './pages/SMSImport'
import Insights from './pages/Insights'
import Analytics from './pages/Analytics'
import Budgets from './pages/Budgets'
import Settings from './pages/Settings'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import NotifDrawer from './components/layout/NotifDrawer'
import { MOCK_NOTIFICATIONS } from './lib/constants'
import useAuthStore from './store/authStore'

export default function App() {
  const [theme, setTheme]       = useState('dark')
  const [page, setPage]         = useState('auth')
  const [notifs, setNotifs]     = useState(MOCK_NOTIFICATIONS)
  const [showNotifs, setShowNotifs] = useState(false)

  const { user, isAuthenticated, logout } = useAuthStore()

  // Apply theme class to root
  useEffect(() => {
    document.documentElement.className = theme
    document.documentElement.style.background = 'var(--bg0)'
  }, [theme])

  // Auto-login check
  useEffect(() => {
    if (isAuthenticated && page === 'auth') setPage('dashboard')
  }, [isAuthenticated])

  const handleLogin = (userData) => {
    if (userData) useAuthStore.setState({ user: userData, isAuthenticated: true })
    setPage('dashboard')
  }

  const handleLogout = () => {
    logout()
    setPage('auth')
  }

  if (page === 'auth') {
    return <AuthPage onLogin={handleLogin} theme={theme} setTheme={setTheme} />
  }

  const pageProps = { setPage, theme, setTheme }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg0)' }}>
      <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar
          page={page}
          user={user}
          notifs={notifs}
          onBell={() => setShowNotifs(true)}
          theme={theme}
          setTheme={setTheme}
        />

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {page === 'dashboard'    && <Dashboard    {...pageProps} />}
          {page === 'transactions' && <Transactions {...pageProps} />}
          {page === 'sms'          && <SMSImport    {...pageProps} />}
          {page === 'insights'     && <Insights     {...pageProps} />}
          {page === 'analytics'    && <Analytics    {...pageProps} />}
          {page === 'budgets'      && <Budgets      {...pageProps} />}
          {page === 'settings'     && <Settings     {...pageProps} />}
        </main>
      </div>

      {showNotifs && (
        <NotifDrawer
          notifs={notifs}
          setNotifs={setNotifs}
          onClose={() => setShowNotifs(false)}
        />
      )}
    </div>
  )
}
