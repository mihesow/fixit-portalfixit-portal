import { jsPDF } from 'jspdf'
import { CATS, TYPE_LABELS, URGENCY_LABELS, STATUS_LABELS } from './constants'

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function catLabel(id) {
  return CATS.find(c => c.id === id)?.label || id
}

export function generatePDF({ tickets, costs, type, reportStatus }) {
  const doc = new jsPDF()
  let y = 20

  doc.setFontSize(20); doc.setFont(undefined, 'bold')
  doc.text('Elevation House Repairs', 14, y); y += 8
  doc.setFontSize(11); doc.setFont(undefined, 'normal'); doc.setTextColor(100)
  const typeLabel = { all: 'Full ticket history', expenses: 'Repair expenses summary', resolved: 'Resolved tickets', complaints: 'Complaints & requests' }[type] || 'Report'
  doc.text(`${typeLabel}  |  Generated: ${fmtDate(new Date().toISOString())}  |  Tickets: ${tickets.length}`, 14, y)
  y += 3; doc.setDrawColor(200); doc.line(14, y, 196, y); y += 8; doc.setTextColor(0)

  if (type === 'expenses') {
    let grand = 0
    tickets.forEach(t => {
      const tCosts = costs.filter(c => c.ticket_id === t.id)
      const amt = tCosts.reduce((s, c) => s + Number(c.amount), 0)
      if (!amt) return
      grand += amt
      doc.setFont(undefined, 'bold'); doc.setFontSize(11)
      doc.text(`${t.id}  —  Unit ${t.house_number}  —  KES ${amt.toLocaleString()}`, 14, y); y += 5
      doc.setFont(undefined, 'normal'); doc.setFontSize(10)
      tCosts.forEach(c => {
        doc.setTextColor(80)
        doc.text(`    ${c.description}: KES ${Number(c.amount).toLocaleString()}  (${c.date_logged})`, 14, y); y += 5
        doc.setTextColor(0)
      })
      y += 2
      if (y > 270) { doc.addPage(); y = 20 }
    })
    y += 4; doc.setFont(undefined, 'bold'); doc.setFontSize(12)
    doc.text(`Grand total: KES ${grand.toLocaleString()}`, 14, y)
  } else {
    tickets.forEach(t => {
      const tCosts = costs.filter(c => c.ticket_id === t.id)
      const amt = tCosts.reduce((s, c) => s + Number(c.amount), 0)
      doc.setFont(undefined, 'bold'); doc.setFontSize(11)
      doc.text(`${t.id}  |  Unit ${t.house_number}  |  ${TYPE_LABELS[t.ticket_type]}  |  ${URGENCY_LABELS[t.urgency]}  |  ${STATUS_LABELS[t.status]}`, 14, y); y += 5
      doc.setFont(undefined, 'normal'); doc.setFontSize(10); doc.setTextColor(80)
      doc.text(`Phone: ${t.phone}  |  Tech: ${t.technician}  |  Date: ${fmtDate(t.created_at)}`, 14, y); y += 5
      if (t.subject) { doc.text(`Subject: ${t.subject}`, 14, y); y += 5 }
      if (t.categories?.length) { doc.text(`Categories: ${t.categories.map(catLabel).join(', ')}`, 14, y); y += 5 }
      if (amt) { doc.text(`Repair cost: KES ${amt.toLocaleString()}`, 14, y); y += 5 }
      const lines = doc.splitTextToSize(t.description || '', 180)
      doc.text(lines, 14, y); y += lines.length * 4 + 6
      doc.setTextColor(0); doc.setDrawColor(230); doc.line(14, y, 196, y); y += 6
      if (y > 270) { doc.addPage(); y = 20 }
    })
  }

  doc.save(`Elevation House Repairs-${Date.now()}.pdf`)
}
