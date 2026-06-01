import { useState } from 'react'
import { generatePDF } from '../lib/pdf'
import { supabase } from '../lib/supabase'

export default function ReportModal({ onClose }) {
  const [type, setType] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reportStatus, setReportStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    try {
      let query = supabase.from('tickets').select('*').order('created_at', { ascending: false })
      if (reportStatus) query = query.eq('status', reportStatus)
      if (type === 'resolved') query = query.eq('status', 'resolved')
      if (type === 'complaints') query = query.in('ticket_type', ['complaint', 'request', 'suggestion'])
      if (fromDate) query = query.gte('created_at', fromDate)
      if (toDate) query = query.lte('created_at', toDate + 'T23:59:59')
      const { data: tickets } = await query
      const { data: costs } = await supabase.from('costs').select('*')
      generatePDF({ tickets: tickets || [], costs: costs || [], type, reportStatus })
    } catch (err) {
      alert('Failed to generate report.')
    }
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Generate PDF report</h2>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>

        <label>Report type</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="all">Full ticket history</option>
          <option value="expenses">Repair expenses summary</option>
          <option value="resolved">Resolved tickets only</option>
          <option value="complaints">Complaints &amp; requests only</option>
        </select>

        <div className="grid2" style={{ marginTop: 12 }}>
          <div><label>From</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
          <div><label>To</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
        </div>

        <label>Status filter</label>
        <select value={reportStatus} onChange={e => setReportStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : '↓ Generate & download'}
          </button>
        </div>
      </div>
    </div>
  )
}
