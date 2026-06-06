import { Wrench, Megaphone, Ticket } from 'lucide-react'
import { useState } from 'react'
import RepairForm from '../components/RepairForm'
import FeedbackForm from '../components/FeedbackForm'
import TrackTickets from '../components/TrackTickets'
import LOGO_B64 from '../lib/logo'

// 1. Updated the TABS array to use Lucide components
const TABS = [
  { id: 'repair',   label: 'Repair request',        icon: <Wrench size={16} /> },
  { id: 'feedback', label: 'Complaints & requests', icon: <Megaphone size={16} /> },
  { id: 'track',    label: 'Track tickets',         icon: <Ticket size={16} /> },
]

export default function TenantPortal() {
  const [tab, setTab] = useState('repair')

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <img
          src={LOGO_B64}
          alt="Elevation House"
          style={{ height: 56, objectFit: 'contain' }}
        />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>Tenant portal</div>
        <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>
          Submit repair requests, raise complaints, or track your existing tickets
        </div>
      </div>

      <div className="tab-row">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
            // 2. Added flex layout so the icon and text sit nicely next to each other
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {/* 3. Render the icon right before the label */}
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'repair'   && <RepairForm />}
      {tab === 'feedback' && <FeedbackForm />}
      {tab === 'track'    && <TrackTickets />}
    </div>
  )
}