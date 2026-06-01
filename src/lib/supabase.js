import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getTickets() {
  const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
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

// NEW: Safely delete a ticket and clean up related records
export async function deleteTicket(id) {
  // 1. Delete associated expenses/costs first to maintain reference integrity
  await supabase.from('costs').delete().eq('ticket_id', id)
  
  // 2. Delete tracking history logs
  await supabase.from('history').delete().eq('ticket_id', id)
  
  // 3. Delete the core ticket row
  const { error } = await supabase.from('tickets').delete().eq('id', id)
  if (error) throw error
}

// NEW: Check how many tickets a specific house has created in the last 24 hours
export async function getRecentTicketCountByHouse(houseNumber) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  const { count, error } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('house_number', houseNumber)
    .gte('created_at', twentyFourHoursAgo)

  if (error) throw error
  return count || 0
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
  const { error } = await supabase.from('costs').delete().eq('eq', id)
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