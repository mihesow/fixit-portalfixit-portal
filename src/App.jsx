import { useState, useEffect } from 'react'
import { Home, LayoutDashboard, LogOut } from 'lucide-react'
import { supabase } from './lib/supabase'
import TenantPortal from './pages/TenantPortal'
import AgentDashboard from './pages/AgentDashboard'
import AgentLogin from './components/AgentLogin'
import './index.css'

export default function App() {
  const [view, setView] = useState('tenant')
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCheckingSession(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setView('tenant')
  }

  // Still checking for an existing session — avoid flicker
  if (checkingSession) {
    return null
  }

  // Trying to view agent dashboard without being logged in
  if (view === 'agent' && !session) {
    return <AgentLogin onLogin={() => {}} />
  }

  return (
    <div className="app">
      <div className="topbar">
        <div className="topbar-logo">
          <span className="logo-dot" />
          Elevation Portal
        </div>
        <nav className="topbar-nav">
          <button
            className={`nav-btn${view === 'tenant' ? ' active' : ''}`}
            onClick={() => setView('tenant')}
          >
            <Home size={14} /> Tenant
          </button>
          <button
            className={`nav-btn${view === 'agent' ? ' active' : ''}`}
            onClick={() => setView('agent')}
          >
            <LayoutDashboard size={14} /> Agent Dashboard
          </button>
          {view === 'agent' && session && (
            <button className="nav-btn" onClick={handleLogout}>
              <LogOut size={14} /> Log out
            </button>
          )}
        </nav>
      </div>

      <main className="main">
        {view === 'tenant' && <TenantPortal />}
        {view === 'agent' && session && <AgentDashboard />}
      </main>
    </div>
  )
}
