import TenantPortal from './pages/TenantPortal'
import AgentDashboard from './pages/AgentDashboard'
import './index.css'

export default function App() {
  // 1. Grab whatever path is typed into the browser's URL bar
  const path = window.location.pathname

  // 2. Secret Route: If the URL is exactly '/agent', bypass the tenant layout entirely
  if (path === '/agent') {
    return <AgentDashboard />
  }

  // 3. Default Fallback: Show only the clean Tenant Portal layout
  return (
    <div className="app">
      <div className="topbar">
        <div className="topbar-logo">
          Elevation House
        </div>
        {/* Nav buttons have been removed so tenants can't see or click over to the agent dashboard */}
      </div>

      <main className="main">
        <TenantPortal />
      </main>
    </div>
  )
}