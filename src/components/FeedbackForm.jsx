import { Frown, ClipboardList, Lightbulb, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { REQUEST_SUBTYPES } from '../lib/constants'
import { createTicket, addHistory } from '../lib/supabase'

// 1. Updated the REQ_TYPES configuration array with Lucide components
const REQ_TYPES = [
  { value: 'complaint',  label: 'Complaint',   icon: <Frown size={18} />, sub: 'About apartment or management' },
  { value: 'request',    label: 'Request',     icon: <ClipboardList size={18} />, sub: 'Keys, transfers, changes etc.' },
  { value: 'suggestion', label: 'Suggestion',  icon: <Lightbulb size={18} />, sub: 'Ideas to improve the premises' },
]

export default function FeedbackForm() {
  const [phone, setPhone] = useState('')
  const [house, setHouse] = useState('')
  const [reqType, setReqType] = useState('')
  const [subtype, setSubtype] = useState('')
  const [subject, setSubject] = useState('')
  const [desc, setDesc] = useState('')
  const [urgency, setUrgency] = useState('low')
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  function genId() {
    return 'TK-' + String(Math.floor(Math.random() * 90000) + 10000)
  }

  async function handleSubmit() {
    if (!phone || !house || !subject || !desc || !reqType) {
      setAlert({ type: 'error', msg: 'Please fill in all fields and select a submission type.' })
      return
    }
    setLoading(true)
    try {
      const ticket = await createTicket({
        id: genId(),
        phone,
        house_number: house,
        description: desc,
        urgency,
        categories: [],
        photos: [],
        ticket_type: reqType,
        status: 'pending',
        technician: 'Unassigned',
        subject,
        subtype: subtype || '',
      })
      await addHistory({
        ticket_id: ticket.id,
        action: `${reqType.charAt(0).toUpperCase() + reqType.slice(1)} submitted by tenant`,
      })
      setAlert({ type: 'success', msg: `Submitted! Your reference: ${ticket.id} — save this for tracking.` })
      setPhone(''); setHouse(''); setReqType(''); setSubtype('')
      setSubject(''); setDesc(''); setUrgency('low')
    } catch (err) {
      setAlert({ type: 'error', msg: 'Something went wrong. Please try again.' })
    }
    setLoading(false)
  }

  return (
    <div className="card">
      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.msg}</div>
      )}

      <div className="grid2">
        <div>
          <label>Phone number</label>
          <input type="tel" placeholder="e.g. 0712 345 678" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <label>House / unit number</label>
          <input type="text" placeholder="e.g. EL68" value={house} onChange={e => setHouse(e.target.value)} />
        </div>
      </div>

      <div>
        <label>Type of submission</label>
        <div className="req-type-row">
          {REQ_TYPES.map(t => (
            <button
              key={t.value}
              className={`sel-opt${reqType === t.value ? ' sel-' + t.value : ''}`}
              onClick={() => { setReqType(t.value); setSubtype('') }}
            >
              {/* 2. Rendered the icon component seamlessly */}
              <span className="icon">{t.icon}</span>
              <span style={{ fontWeight: 500 }}>{t.label}</span>
              <span className="sub">{t.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {reqType === 'request' && (
        <div>
          <label>Request type</label>
          <select value={subtype} onChange={e => setSubtype(e.target.value)}>
            <option value="">Select request type...</option>
            {REQUEST_SUBTYPES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label>Subject</label>
        <input type="text" placeholder="Brief subject line" value={subject} onChange={e => setSubject(e.target.value)} />
      </div>

      <div>
        <label>Details</label>
        <textarea
          placeholder="Provide full details here..."
          style={{ minHeight: 110 }}
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
      </div>

      <div>
        <label>Urgency</label>
        <select value={urgency} onChange={e => setUrgency(e.target.value)}>
          <option value="low">Not urgent</option>
          <option value="moderate">Moderate</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* 3. Updated button to use flex alignment and the ArrowRight icon */}
      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {loading ? 'Submitting...' : <><ArrowRight size={16} /> Submit request</>}
        </button>
      </div>
    </div>
  )
}