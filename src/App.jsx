import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut } from 'lucide-react'
import { supabase } from './lib/supabase'
import TenantPortal from './pages/TenantPortal'
import AgentDashboard from './pages/AgentDashboard'
import AgentLogin from './components/AgentLogin'
import './index.css'

function AdminRoute() {
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const navigate = useNavigate()

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
    navigate('/')
  }

  if (checkingSession) return null

  if (!session) {
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
          <button className="nav-btn active">
            <LayoutDashboard size={14} /> Agent Dashboard
          </button>
          <button className="nav-btn" onClick={handleLogout}>
            <LogOut size={14} /> Log out
          </button>
        </nav>
      </div>
      <main className="main">
        <AgentDashboard />
      </main>
    </div>
  )
}

function TenantRoute() {
  return (
    <div className="app">
      <div className="topbar">
        <div className="topbar-logo">
          <span className="logo-dot" />
          Elevation Portal
        </div>
      </div>
      <main className="main">
        <TenantPortal />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/" element={<TenantRoute />} />
        <Route path="*" element={<TenantRoute />} />
      </Routes>
    </BrowserRouter>
  )
}
