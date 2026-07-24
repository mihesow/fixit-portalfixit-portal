import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Fetch tickets with pagination — 50 per page
// Only pulls the columns the LIST VIEW actually needs (no description, no photos —
// those are big/base64 and were being pulled for all 50 rows on every load).
// Open a specific ticket with getTicketById() to get the full row including photos.
const LIST_COLUMNS =
  'id, created_at, tenant_name, phone, house_number, urgency, categories, ticket_type, subtype, status, technician, subject, description'

export async function getTickets({ page = 0, pageSize = 50 } = {}) {
  const from = page * pageSize
  const to = from + pageSize - 1
  const { data, error } = await supabase
    .from('tickets')
    .select(LIST_COLUMNS)
    .order('created_at', { ascending: false })
    .range(from, to)
  if (error) throw error
  return { data: data || [] }
}

// Get the total ticket count separately (cheap head-only query, no row data)
// — only call this where you actually need a count (e.g. stats bar), not on every page load.
export async function getTicketCount() {
  const { count, error } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

// Fetch just the photos for one ticket — used by the detail modal, much cheaper
// than a full select('*') when a ticket has several embedded images.
export async function getTicketPhotos(id) {
  const { data, error } = await supabase.from('tickets').select('photos').eq('id', id).single()
  if (error) throw error
  return data?.photos || []
}

// Fetch the FULL row for one ticket (includes description + photos) — call this
// when the agent opens a ticket's detail modal, not for the list view.
export async function getTicketById(id) {
  const { data, error } = await supabase.from('tickets').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

// Upload a photo file to Supabase Storage and return its public URL.
// Bucket must exist first — see setup note below.
export async function uploadTicketPhoto(file, ticketId) {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${ticketId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('ticket-photos').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('ticket-photos').getPublicUrl(path)
  return data.publicUrl
}

export async function createTicket(ticket) {
  const { data, error } = await supabase.from('tickets').insert([ticket]).select().single()
  if (error) throw error
  return data
}

export async function updateTicket(id, updates) {
  const { data, error } = await supabase.from('tickets').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteTicket(id) {
  const { error } = await supabase.from('tickets').delete().eq('id', id)
  if (error) throw error
}

export async function getRecentTicketCountByHouse(houseNumber) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data, error, count } = await supabase
    .from('tickets')
    .select('id', { count: 'exact' })
    .eq('house_number', houseNumber)
    .eq('ticket_type', 'repair')
    .gte('created_at', since)
  if (error) throw error
  return count ?? (data ? data.length : 0)
}

export async function getCosts(ticketId) {
  const { data, error } = await supabase.from('costs').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addCost(cost) {
  const { data, error } = await supabase.from('costs').insert([cost]).select().single()
  if (error) throw error
  return data
}

export async function deleteCost(id) {
  const { error } = await supabase.from('costs').delete().eq('id', id)
  if (error) throw error
}

export async function getHistory(ticketId) {
  const { data, error } = await supabase.from('history').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addHistory(entry) {
  const { data, error } = await supabase.from('history').insert([entry]).select().single()
  if (error) throw error
  return data
}

// Batch insert multiple history entries in one request
export async function addHistoryBatch(entries) {
  if (!entries.length) return
  const { error } = await supabase.from('history').insert(entries)
  if (error) throw error
}

// Fetch costs and history simultaneously instead of sequentially
export async function getTicketDetails(ticketId) {
  const [costsResult, historyResult] = await Promise.all([
    supabase.from('costs').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }),
    supabase.from('history').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: false }),
  ])
  if (costsResult.error) throw costsResult.error
  if (historyResult.error) throw historyResult.error
  return { costs: costsResult.data || [], history: historyResult.data || [] }
}
