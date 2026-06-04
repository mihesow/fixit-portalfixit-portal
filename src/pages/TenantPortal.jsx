import { useState } from 'react'
import RepairForm from '../components/RepairForm'
import FeedbackForm from '../components/FeedbackForm'
import TrackTickets from '../components/TrackTickets'
import LOGO_B64 from '../lib/logo'

const TABS = [
  { id: 'repair',   label: '🔧 Repair request'        },
  { id: 'feedback', label: '📣 Complaints & requests'  },
  { id: 'track',    label: '🎫 Track tickets'          },
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
          >
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
