import { useState } from 'react'
// 1. Import the icons from lucide-react at the top
import { House, LayoutDashboard } from 'lucide-react'
import TenantPortal from './pages/TenantPortal'
import AgentDashboard from './pages/AgentDashboard'
import './index.css'

export default function App() {
  const [view, setView] = useState('tenant')

  return (
    <div className="app">
      <div className="topbar">
        <div className="topbar-logo">
          Elevation House
        </div>
        <nav className="topbar-nav">
          <button
            className={`nav-btn${view === 'tenant' ? ' active' : ''}`}
            onClick={() => setView('tenant')}
          >
            {/* 2. Swap the emoji for the House component */}
            <House size={18} style={{ marginRight: 6 }} /> Tenant
          </button>
          <button
            className={`nav-btn${view === 'agent' ? ' active' : ''}`}
            onClick={() => setView('agent')}
          >
            {/* 3. Swap the emoji for the Dashboard component */}
            <LayoutDashboard size={18} style={{ marginRight: 6 }} /> Agent Dashboard
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