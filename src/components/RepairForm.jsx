import { useState } from 'react'
import { CATS, URGENCY_OPTIONS } from '../lib/constants'
import { createTicket, addHistory } from '../lib/supabase'

export default function RepairForm() {
  const [phone, setPhone] = useState('')
  const [house, setHouse] = useState('')
  const [desc, setDesc] = useState('')
  const [urgency, setUrgency] = useState('')
  const [selectedCats, setSelectedCats] = useState([])
  const [photos, setPhotos] = useState([])
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  function toggleCat(id) {
    setSelectedCats(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handlePhotos(e) {
    Array.from(e.target.files).forEach(f => {
      const reader = new FileReader()
      reader.onload = ev => setPhotos(prev => [...prev, ev.target.result])
      reader.readAsDataURL(f)
    })
  }

  function genId() { return 'TK-' + String(Math.floor(Math.random() * 90000) + 10000) }

  // Kenyan Phone Number Validation Logic
  function validatePhoneNumber(num) {
    // Matches: +2547..., +2541..., 2547..., 2541..., 07..., 01... followed by 8 digits
    const phoneRegex = /^(?:\+254|254|0)?(7|1)\d{8}$/
    return phoneRegex.test(num.replace(/\s+/g, '')) // Strips spaces before checking
  }

  async function handleSubmit() {
    if (!phone || !house || !desc || !urgency || selectedCats.length === 0) {
      setAlert({ type: 'error', msg: 'Please fill in all fields, select urgency, and at least one category.' })
      return
    }

    // Enforce valid phone check
    if (!validatePhoneNumber(phone)) {
      setAlert({ type: 'error', msg: 'Please enter a valid Kenyan phone number (e.g., 0712345678).' })
      return
    }

    setLoading(true)
    try {
      const ticket = await createTicket({
        id: genId(), phone, house_number: house, description: desc, urgency,
        categories: selectedCats, photos, ticket_type: 'repair',
        status: 'pending', technician: 'Unassigned', subject: '', subtype: '',
      })
      await addHistory({ ticket_id: ticket.id, action: 'Repair request submitted by tenant' })
      setAlert({ type: 'success', msg: `Submitted! Your reference: ${ticket.id} — save this for tracking.` })
      setPhone(''); setHouse(''); setDesc(''); setUrgency(''); setSelectedCats([]); setPhotos([])
    } catch (err) {
      setAlert({ type: 'error', msg: 'Something went wrong. Please try again.' })
    }
    setLoading(false)
  }

  return (
    <div className="card">
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
      <div className="grid2">
        <div>
          <label>Phone number</label>
          <input type="tel" placeholder="e.g. 0712 345 678" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <label>House / unit number</label>
          {/* Updated placeholder to match your layout spec */}
          <input type="text" placeholder="e.g. EL68" value={house} onChange={e => setHouse(e.target.value)} />
        </div>
      </div>
      <div>
        <label>Urgency level</label>
        <div className="urgency-row">
          {URGENCY_OPTIONS.map(u => (
            <button key={u.value} className={`sel-opt${urgency === u.value ? ' sel-' + u.value : ''}`} onClick={() => setUrgency(u.value)}>
              <span className="icon">{u.value === 'urgent' ? '🚨' : u.value === 'moderate' ? '⏱️' : '🌿'}</span>
              <span style={{ fontWeight: 500 }}>{u.label}</span>
              <span className="sub">{u.sub}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label>Category <span style={{ color: '#e84560', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(select all that apply)</span></label>
        <div className="cats-grid">
          {CATS.map(c => (
            <div key={c.id} className={`cat-opt${selectedCats.includes(c.id) ? ' selected' : ''}`} onClick={() => toggleCat(c.id)}>
              <span>{c.icon}</span>{c.label}
            </div>
          ))}
        </div>
      </div>
      <div>
        <label>Description of issue</label>
        <textarea placeholder="Describe the problem in detail..." value={desc} onChange={e => setDesc(e.target.value)} />
      </div>
      <div>
        <label>Photos <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#9aa0b8' }}>(optional)</span></label>
        <div className="photo-upload" onClick={() => document.getElementById('photo-input').click()}>
          <div style={{ fontSize: 28 }}>📷</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>Click to upload photos</div>
        </div>
        <input id="photo-input" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotos} />
        {photos.length > 0 && (
          <div className="photo-preview">{photos.map((p, i) => <img key={i} className="photo-thumb" src={p} alt="" />)}</div>
        )}
      </div>
      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : '→ Submit request'}
        </button>
      </div>
    </div>
  )
}