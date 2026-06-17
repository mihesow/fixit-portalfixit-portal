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

export async function deleteTicket(id) {
  const { error } = await supabase.from('tickets').delete().eq('id', id)
  if (error) throw error
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
