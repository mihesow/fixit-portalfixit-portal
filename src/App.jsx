import { useState } from 'react'
import TenantPortal from './pages/TenantPortal'
import AgentDashboard from './pages/AgentDashboard'
import './index.css'

export default function App() {
  const [view, setView] = useState('tenant')

  return (
    <div className="app">
      <div className="topbar">
        {/* Updated branding text and removed the logo-dot span */}
        <div className="topbar-logo">
          Elevation House
        </div>
        <nav className="topbar-nav">
          <button
            className={`nav-btn${view === 'tenant' ? ' active' : ''}`}
            onClick={() => setView('tenant')}
          >
            🏠 Tenant
          </button>
          <button
            className={`nav-btn${view === 'agent' ? ' active' : ''}`}
            onClick={() => setView('agent')}
          >
            📊 Agent Dashboard
          </button>
        </nav>
      </div>

      <main className="main">
        {view === 'tenant' && <TenantPortal />}
        {view === 'agent'  && <AgentDashboard />}
      </main>
    </div>
  )
}