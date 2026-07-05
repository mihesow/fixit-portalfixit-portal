import { useState, useEffect, useCallback, useRef } from 'react'
import { ClipboardList, FileText, Inbox, ChevronRight, Trash2 } from 'lucide-react'
import { getTickets, deleteTicket } from '../lib/supabase'
import { CATS, TECHNICIANS, STATUS_LABELS, TYPE_LABELS, URGENCY_LABELS } from '../lib/constants'
import TicketModal from '../components/TicketModal'
import ReportModal from '../components/ReportModal'

const PAGE_SIZE = 50

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
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
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
  const searchTimer = useRef(null)

  const load = useCallback(async (resetPage = true) => {
    if (resetPage) {
      setLoading(true)
      setPage(0)
    } else {
      setLoadingMore(true)
    }
    try {
      const currentPage = resetPage ? 0 : page + 1
      const { data, count } = await getTickets({ page: currentPage, pageSize: PAGE_SIZE })
      if (resetPage) {
        setTickets(data)
      } else {
        setTickets(prev => [...prev, ...data])
        setPage(currentPage)
      }
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Failed to load tickets:', err)
    }
    setLoading(false)
    setLoadingMore(false)
  }, [page])

  useEffect(() => { load(true) }, []) // eslint-disable-line

  // Debounced search — wait 300ms after typing before filtering
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(searchTimer.current)
  }, [search])

  const filtered = tickets.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false
    if (filterType && t.ticket_type !== filterType) return false
    if (filterUrgency && t.urgency !== filterUrgency) return false
    if (filterCat && !(t.categories || []).includes(filterCat)) return false
    if (filterTech && t.technician !== filterTech) return false
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      if (
        !t.id.toLowerCase().includes(q) &&
        !t.house_number?.toLowerCase().includes(q) &&
        !(t.description || '').toLowerCase().includes(q) &&
        !(t.subject || '').toLowerCase().includes(q) &&
        !(t.tenant_name || '').toLowerCase().includes(q) &&
        !t.phone?.includes(q)
      ) return false
    }
    return true
  })

  const total = totalCount
  const pending = tickets.filter(t => t.status === 'pending').length
  const urgentOpen = tickets.filter(t => t.urgency === 'urgent' && t.status !== 'resolved').length
  const inProgress = tickets.filter(t => t.status === 'in-progress').length
  const hasMore = tickets.length < totalCount

  async function handleConfirmDelete() {
    if (!confirmDeleteId) return
    setDeleting(true)
    try {
      await deleteTicket(confirmDeleteId)
      setTickets(prev => prev.filter(t => t.id !== confirmDeleteId))
      setTotalCount(prev => prev - 1)
      if (openTicket?.id === confirmDeleteId) setOpenTicket(null)
    } catch (err) {
      alert('Failed to delete ticket. Please try again.')
    }
    setDeleting(false)
    setConfirmDeleteId(null)
  }

  function handleTicketSaved(updatedTicket) {
    // Optimistically update the ticket in the list without reloading everything
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t))
    setOpenTicket(null)
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
          <div className="card-title" style={{ margin: 0 }}>
            <ClipboardList size={16} /> All tickets
            {totalCount > 0 && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text3)', marginLeft: 6 }}>({totalCount} total)</span>}
          </div>
          <button className="btn btn-sm" onClick={() => setShowReport(true)}>
            <FileText size={13} /> PDF report
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search by ID, name, house, keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: 200, flex: 2 }}
          />
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
          <div className="empty">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text2)' }}>
              <div style={{ width: 16, height: 16, border: '2px solid var(--border2)', borderTopColor: 'var(--navy)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Loading tickets...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <Inbox size={36} color="var(--text3)" />
            <div style={{ marginTop: 8 }}>No tickets found</div>
          </div>
        ) : (
          <>
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

            {hasMore && !debouncedSearch && !filterStatus && !filterType && !filterUrgency && !filterCat && !filterTech && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button className="btn" onClick={() => load(false)} disabled={loadingMore}>
                  {loadingMore ? 'Loading...' : `Load more (${totalCount - tickets.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {openTicket && (
        <TicketModal
          ticket={openTicket}
          onClose={() => setOpenTicket(null)}
          onSaved={handleTicketSaved}
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
              This will permanently delete ticket <strong style={{ color: 'var(--text)' }}>{confirmDeleteId}</strong>, along with all its costs and history. This cannot be undone.
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
