import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { STATUS_LABELS, TYPE_LABELS, URGENCY_LABELS } from '../lib/constants'

function statusBadge(s) {
  return { pending: 'b-pending', 'in-progress': 'b-progress', resolved: 'b-resolved' }[s] || 'b-pending'
}
function urgBadge(u) {
  return { urgent: 'b-urgent', moderate: 'b-moderate', low: 'b-low' }[u] || 'b-low'
}
function typeBadge(t) {
  return { repair: 'b-repair', complaint: 'b-complaint', request: 'b-request', suggestion: 'b-suggestion' }[t] || 'b-repair'
}

export default function TrackTickets() {
  const [phone, setPhone] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  async function search() {
    const rawInput = phone.trim()
    if (!rawInput) return
    setLoading(true)

    // Strip all spaces for clean matching
    const cleanInput = rawInput.replace(/\s+/g, '')

    // Build alternative variations to ensure accurate matching across standard prefix variations (07..., +254..., 254...)
    let variations = [cleanInput]
    
    // Extract base number if it matches standard patterns to build robust fallback search terms
    const baseMatch = cleanInput.match(/^(?:\+254|254|0)?([71]\d{8})$/)
    if (baseMatch) {
      const coreNumber = baseMatch[1] // e.g., "712345678"
      variations = [
        coreNumber,
        `0${coreNumber}`,
        `254${coreNumber}`,
        `+254${coreNumber}`
      ]
    }

    try {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .in('phone', variations) // Matches against any format the user or database might have stored
        .order('created_at', { ascending: false })
        
      setResults(data || [])
    } catch (err) {
      console.error("Error searching tickets:", err)
      setResults([])
    }
    
    setLoading(false)
  }

  return (
    <div className="card">
      <div className="card-title">🎫 Track your tickets</div>
      <div className="field-row" style={{ gap: 8 }}>
        <input
          type="text"
          placeholder="Your phone number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
        />
        <button className="btn" onClick={search} disabled={loading} style={{ flexShrink: 0 }}>
          {loading ? '...' : '🔍 Find'}
        </button>
      </div>

      {results !== null && (
        <div style={{ marginTop: '1rem' }}>
          {results.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>No tickets found for this number.</div>
          ) : (
            results.map(t => (
              <div key={t.id} style={{
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 8,
                fontSize: 13,
                background: 'var(--surface2)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{t.id}</strong>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <span className={`badge ${typeBadge(t.ticket_type)}`}>{TYPE_LABELS[t.ticket_type]}</span>
                    <span className={`badge ${urgBadge(t.urgency)}`}>{URGENCY_LABELS[t.urgency]}</span>
                    <span className={`badge ${statusBadge(t.status)}`}>{STATUS_LABELS[t.status]}</span>
                  </div>
                </div>
                <div style={{ color: 'var(--text2)', marginTop: 5 }}>
                  {(t.subject || t.description || '').substring(0, 100)}...
                </div>
                <div style={{ color: 'var(--text3)', marginTop: 4, fontSize: 11 }}>
                  {new Date(t.created_at).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {t.technician && t.technician !== 'Unassigned' && ` · Assigned to ${t.technician}`}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}