import { useState, useEffect, useCallback } from 'react'
import { ClipboardList, FileText, Inbox, ChevronRight, Trash2 } from 'lucide-react'
import { getTickets, deleteTicket } from '../lib/supabase'
import { CATS, TECHNICIANS, STATUS_LABELS, TYPE_LABELS, URGENCY_LABELS } from '../lib/constants'
import TicketModal from '../components/TicketModal'
import ReportModal from '../components/ReportModal'

function statusBadge(s) {
  return { pending: 'b-pending', 'in-progress': 'b-progress', resolved: 'b-resolved' }[s] || 'b-pending'
}
function urgBadge(u) {
  return { urgent: 'b-urgent', moderate: 'b-moderate', low: 'b-low' }[u] || 'b-low'
}
function typeBadge(t) {
  return { repair: 'b-repair', complaint: 'b-complaint', request: 'b-request', suggestion: 'b-suggestion' }[t] || 'b-repair'
}

export default function AgentDashboard() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterUrgency, setFilterUrgency] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterTech, setFilterTech] = useState('')
  const [openTicket, setOpenTicket] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getTickets()
    setTickets(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = tickets.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false
    if (filterType && t.ticket_type !== filterType) return false
    if (filterUrgency && t.urgency !== filterUrgency) return false
    if (filterCat && !(t.categories || []).includes(filterCat)) return false
    if (filterTech && t.technician !== filterTech) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !t.id.toLowerCase().includes(q) &&
        !t.house_number?.toLowerCase().includes(q) &&
        !(t.description || '').toLowerCase().includes(q) &&
        !(t.subject || '').toLowerCase().includes(q) &&
        !t.phone?.includes(q)
      ) return false
    }
    return true
  })

  const total = tickets.length
  const pending = tickets.filter(t => t.status === 'pending').length
  const urgentOpen = tickets.filter(t => t.urgency === 'urgent' && t.status !== 'resolved').length
  const inProgress = tickets.filter(t => t.status === 'in-progress').length

  async function handleConfirmDelete() {
    if (!confirmDeleteId) return
    setDeleting(true)
    try {
      await deleteTicket(confirmDeleteId)
      setTickets(prev => prev.filter(t => t.id !== confirmDeleteId))
      if (openTicket?.id === confirmDeleteId) setOpenTicket(null)
    } catch (err) {
      alert('Failed to delete ticket. Please try again.')
    }
    setDeleting(false)
    setConfirmDeleteId(null)
  }

  return (
    <div>
      <div className="stats-row">
        <div className="stat"><div className="stat-num">{total}</div><div className="stat-lbl">Total tickets</div></div>
        <div className="stat"><div className="stat-num" style={{ color: '#8a6200' }}>{pending}</div><div className="stat-lbl">Pending</div></div>
        <div className="stat"><div className="stat-num" style={{ color: '#1757b0' }}>{inProgress}</div><div className="stat-lbl">In progress</div></div>
        <div className="stat"><div className="stat-num" style={{ color: '#b91c1c' }}>{urgentOpen}</div><div className="stat-lbl">Urgent (open)</div></div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
          <div className="card-title" style={{ margin: 0 }}><ClipboardList size={16} /> All tickets</div>
          <button className="btn btn-sm" onClick={() => setShowReport(true)}>
            <FileText size={13} /> PDF report
          </button>
        </div>

        <div className="filters">
          <input type="text" placeholder="Search by ID, house, keyword..." value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 200, flex: 2 }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All types</option>
            <option value="repair">Repair</option>
            <option value="complaint">Complaint</option>
            <option value="request">Request</option>
            <option value="suggestion">Suggestion</option>
          </select>
          <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
            <option value="">All urgencies</option>
            <option value="urgent">Urgent</option>
            <option value="moderate">Moderate</option>
            <option value="low">Not urgent</option>
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">All categories</option>
            {CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select value={filterTech} onChange={e => setFilterTech(e.target.value)}>
            <option value="">All technicians</option>
            {TECHNICIANS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="empty">Loading tickets...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <Inbox size={36} color="var(--text3)" />
            <div style={{ marginTop: 8 }}>No tickets found</div>
          </div>
        ) : (
          <div className="ticket-list">
            {filtered.map(t => (
              <div key={t.id} className="ticket-row">
                <div className="ticket-id" onClick={() => setOpenTicket(t)} style={{ cursor: 'pointer' }}>{t.id}</div>
                <div className="ticket-info" onClick={() => setOpenTicket(t)} style={{ cursor: 'pointer' }}>
                  <div className="ticket-title">
                    {t.tenant_name ? `${t.tenant_name} · Unit ${t.house_number}` : `Unit ${t.house_number}`} — {t.subject || (t.categories || []).map(c => CATS.find(x => x.id === c)?.label || c).join(', ') || TYPE_LABELS[t.ticket_type]}
                  </div>
                  <div className="ticket-sub">
                    {(t.description || '').substring(0, 90)}{(t.description || '').length > 90 ? '...' : ''}
                  </div>
                </div>
                <div className="ticket-meta">
                  <span className={`badge ${typeBadge(t.ticket_type)}`}>{TYPE_LABELS[t.ticket_type]}</span>
                  <span className={`badge ${urgBadge(t.urgency)}`}>{URGENCY_LABELS[t.urgency]}</span>
                  <span className={`badge ${statusBadge(t.status)}`}>{STATUS_LABELS[t.status]}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{t.technician}</span>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(t.id) }}
                    title="Delete ticket"
                  >
                    <Trash2 size={12} />
                  </button>
                  <ChevronRight size={14} color="var(--text3)" onClick={() => setOpenTicket(t)} style={{ cursor: 'pointer' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {openTicket && (
        <TicketModal
          ticket={openTicket}
          onClose={() => setOpenTicket(null)}
          onSaved={() => { setOpenTicket(null); load() }}
          onDeleteRequest={(id) => setConfirmDeleteId(id)}
        />
      )}

      {showReport && <ReportModal onClose={() => setShowReport(false)} />}

      {confirmDeleteId && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setConfirmDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2>Delete ticket?</h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>
              This will permanently delete ticket <strong style={{ color: 'var(--text)' }}>{confirmDeleteId}</strong>, along with all its costs and history. This action cannot be undone.
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn" onClick={() => setConfirmDeleteId(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
