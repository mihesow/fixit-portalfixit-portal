import { useState, useEffect } from 'react'
import { Trash2, Check, X, ZoomIn } from 'lucide-react'
import { CATS, TECHNICIANS, STATUS_LABELS, TYPE_LABELS, URGENCY_LABELS } from '../lib/constants'
import { updateTicket, addCost, deleteCost, addHistoryBatch, addHistory, getTicketDetails } from '../lib/supabase'

function statusBadge(s) {
  return { pending: 'b-pending', 'in-progress': 'b-progress', resolved: 'b-resolved' }[s] || 'b-pending'
}
function urgBadge(u) {
  return { urgent: 'b-urgent', moderate: 'b-moderate', low: 'b-low' }[u] || 'b-low'
}
function typeBadge(t) {
  return { repair: 'b-repair', complaint: 'b-complaint', request: 'b-request', suggestion: 'b-suggestion' }[t] || 'b-repair'
}
function catLabel(id) { return CATS.find(c => c.id === id)?.label || id }
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ photos, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') setIdx(i => Math.min(i + 1, photos.length - 1))
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(i - 1, 0))
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photos.length, onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <X size={16} /> Close
      </button>

      {/* Counter */}
      {photos.length > 1 && (
        <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          {idx + 1} / {photos.length}
        </div>
      )}

      {/* Image */}
      <img
        src={photos[idx]}
        alt=""
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
      />

      {/* Nav buttons */}
      {photos.length > 1 && (
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => Math.max(i - 1, 0)) }}
            disabled={idx === 0}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '8px 20px', color: '#fff', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
          >← Prev</button>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => Math.min(i + 1, photos.length - 1)) }}
            disabled={idx === photos.length - 1}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '8px 20px', color: '#fff', cursor: idx === photos.length - 1 ? 'default' : 'pointer', opacity: idx === photos.length - 1 ? 0.3 : 1 }}
          >Next →</button>
        </div>
      )}
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function TicketModal({ ticket, onClose, onSaved, onDeleteRequest }) {
  const [status, setStatus] = useState(ticket.status)
  const [technician, setTechnician] = useState(ticket.technician)
  const [note, setNote] = useState('')
  const [costs, setCosts] = useState([])
  const [history, setHistory] = useState([])
  const [costDesc, setCostDesc] = useState('')
  const [costAmount, setCostAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Load costs + history in parallel
  useEffect(() => {
    setDetailsLoading(true)
    getTicketDetails(ticket.id).then(({ costs, history }) => {
      setCosts(costs)
      setHistory(history)
      setDetailsLoading(false)
    })
  }, [ticket.id])

  const totalCost = costs.reduce((s, c) => s + Number(c.amount), 0)
  const isRepair = ticket.ticket_type === 'repair'

  async function handleSave() {
    setSaving(true)

    // Close modal immediately — optimistic update
    onSaved({ id: ticket.id, status, technician })

    // Build history entries for any changes
    const entries = []
    if (ticket.status !== status) entries.push({ ticket_id: ticket.id, action: `Status changed to ${STATUS_LABELS[status]}` })
    if (ticket.technician !== technician) entries.push({ ticket_id: ticket.id, action: `Assigned to ${technician}` })

    // Fire update and history batch in parallel
    await Promise.all([
      updateTicket(ticket.id, { status, technician }),
      addHistoryBatch(entries),
    ])
    setSaving(false)
  }

  async function handleAddNote() {
    if (!note.trim()) return
    const trimmed = note.trim()
    setNote('')
    // Optimistically add to history list
    setHistory(prev => [{ created_at: new Date().toISOString(), action: 'Note: ' + trimmed }, ...prev])
    await addHistory({ ticket_id: ticket.id, action: 'Note: ' + trimmed })
  }

  async function handleAddCost() {
    if (!costDesc.trim() || !costAmount) return
    const today = new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })
    const desc = costDesc.trim()
    const amt = Number(costAmount)
    // Optimistic update
    const tempCost = { id: 'temp-' + Date.now(), description: desc, amount: amt, date_logged: today }
    setCosts(prev => [...prev, tempCost])
    setCostDesc(''); setCostAmount('')
    const newCost = await addCost({ ticket_id: ticket.id, description: desc, amount: amt, date_logged: today })
    setCosts(prev => prev.map(c => c.id === tempCost.id ? newCost : c))
    await addHistory({ ticket_id: ticket.id, action: `Cost added: ${desc} — KES ${amt.toLocaleString()}` })
    setHistory(prev => [{ created_at: new Date().toISOString(), action: `Cost added: ${desc} — KES ${amt.toLocaleString()}` }, ...prev])
  }

  async function handleDeleteCost(id, desc) {
    // Optimistic remove
    setCosts(prev => prev.filter(c => c.id !== id))
    await deleteCost(id)
    await addHistory({ ticket_id: ticket.id, action: `Cost removed: ${desc}` })
    setHistory(prev => [{ created_at: new Date().toISOString(), action: `Cost removed: ${desc}` }, ...prev])
  }

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox
          photos={ticket.photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal" style={{ maxWidth: 720 }}>
          <div className="modal-header">
            <h2 style={{ fontFamily: 'DM Mono, monospace', fontSize: 15 }}>{ticket.id}</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-sm btn-danger" onClick={() => onDeleteRequest(ticket.id)} title="Delete ticket">
                <Trash2 size={13} /> Delete
              </button>
              <button className="btn btn-sm" onClick={onClose}><X size={14} /></button>
            </div>
          </div>

          {/* Tenant info */}
          <div className="grid2" style={{ marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Tenant</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{ticket.tenant_name || 'Unit ' + ticket.house_number}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>Unit {ticket.house_number} · {ticket.phone}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Submitted</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginTop: 3 }}>{fmtDate(ticket.created_at)}</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                <span className={`badge ${typeBadge(ticket.ticket_type)}`}>{TYPE_LABELS[ticket.ticket_type]}</span>
                <span className={`badge ${urgBadge(ticket.urgency)}`}>{URGENCY_LABELS[ticket.urgency]}</span>
                <span className={`badge ${statusBadge(ticket.status)}`}>{STATUS_LABELS[ticket.status]}</span>
              </div>
            </div>
          </div>

          {ticket.subject && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>Subject</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{ticket.subject}</div>
            </div>
          )}

          {isRepair && ticket.categories?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>Categories</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {ticket.categories.map(c => (
                  <span key={c} className="badge" style={{ background: 'var(--surface3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                    {catLabel(c)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ticket.subtype && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>Request type</div>
              <div style={{ fontSize: 13 }}>{ticket.subtype.replace(/-/g, ' ')}</div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>Description</div>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>{ticket.description}</div>
          </div>

          {/* Photos with lightbox */}
          {ticket.photos?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
                Photos ({ticket.photos.length})
              </div>
              <div className="photo-preview">
                {ticket.photos.map((p, i) => (
                  <div
                    key={i}
                    style={{ position: 'relative', cursor: 'pointer', display: 'inline-block' }}
                    onClick={() => setLightboxIndex(i)}
                    title="Click to view full size"
                  >
                    <img className="photo-thumb" src={p} alt="" />
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                      borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                    >
                      <ZoomIn size={18} color="#fff" style={{ opacity: 0, transition: 'opacity 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Click any photo to view full size · Use arrow keys to navigate</div>
            </div>
          )}

          <div className="sep" />

          {/* Agent controls */}
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Agent controls</div>
          <div className="grid2" style={{ gap: '1rem' }}>
            <div>
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in-progress">In progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label>Assign technician</label>
              <select value={technician} onChange={e => setTechnician(e.target.value)}>
                {TECHNICIANS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label>Internal note</label>
            <div className="field-row">
              <input type="text" placeholder="Add a note..." value={note} onChange={e => setNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddNote()} />
              <button className="btn btn-sm" onClick={handleAddNote} style={{ flexShrink: 0 }}>Add</button>
            </div>
          </div>

          {/* Costs */}
          {isRepair && (
            <>
              <div className="sep" />
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                Repair costs — total: <span style={{ color: 'var(--navy)' }}>KES {totalCost.toLocaleString()}</span>
              </div>
              {detailsLoading ? (
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Loading...</div>
              ) : (
                <table className="cost-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Description</th>
                      <th style={{ width: '22%' }}>Amount (KES)</th>
                      <th style={{ width: '23%' }}>Date</th>
                      <th style={{ width: '10%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {costs.length === 0 ? (
                      <tr><td colSpan={4} style={{ color: 'var(--text2)', padding: 8 }}>No costs logged yet</td></tr>
                    ) : costs.map(c => (
                      <tr key={c.id}>
                        <td>{c.description}</td>
                        <td>{Number(c.amount).toLocaleString()}</td>
                        <td>{c.date_logged}</td>
                        <td>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCost(c.id, c.description)}>
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="field-row" style={{ marginTop: 8, gap: 8 }}>
                <input type="text" placeholder="Cost description" style={{ flex: 2 }} value={costDesc} onChange={e => setCostDesc(e.target.value)} />
                <input type="number" placeholder="Amount" style={{ flex: 1, minWidth: 80 }} value={costAmount} onChange={e => setCostAmount(e.target.value)} />
                <button className="btn btn-sm" onClick={handleAddCost} style={{ flexShrink: 0 }}>+ Add</button>
              </div>
            </>
          )}

          {/* History */}
          <div className="sep" />
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>History</div>
          {detailsLoading ? (
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>Loading...</div>
          ) : (
            <div className="timeline">
              {history.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>No history yet</div>
              ) : history.map((h, i) => (
                <div key={i} className="tl-item">
                  <div className="tl-dot" />
                  <div className="tl-text"><strong>{fmtDate(h.created_at)}</strong> — {h.action}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <Check size={14} /> {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
