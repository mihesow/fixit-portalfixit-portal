-- FixIt Portal — Supabase Schema
-- Run this in your Supabase project: SQL Editor → New query → paste → Run

-- ─── TICKETS ────────────────────────────────────────────────────────────────
create table if not exists tickets (
  id            text primary key,
  created_at    timestamptz default now(),
  phone         text not null,
  house_number  text not null,
  description   text not null,
  subject       text default '',
  urgency       text not null default 'low',
  categories    text[] default '{}',
  photos        text[] default '{}',
  ticket_type   text not null default 'repair',
  subtype       text default '',
  status        text not null default 'pending',
  technician    text not null default 'Unassigned'
);

-- ─── COSTS ──────────────────────────────────────────────────────────────────
create table if not exists costs (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  ticket_id    text not null references tickets(id) on delete cascade,
  description  text not null,
  amount       numeric not null,
  date_logged  text not null
);

-- ─── HISTORY ─────────────────────────────────────────────────────────────────
create table if not exists history (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  ticket_id   text not null references tickets(id) on delete cascade,
  action      text not null
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
-- Enable RLS (keeps your data safe)
alter table tickets enable row level security;
alter table costs   enable row level security;
alter table history enable row level security;

-- Allow full public access (fine for a private internal tool)
-- For a production multi-tenant app, tighten these policies
create policy "Public access tickets" on tickets for all using (true) with check (true);
create policy "Public access costs"   on costs   for all using (true) with check (true);
create policy "Public access history" on history  for all using (true) with check (true);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index if not exists tickets_phone_idx  on tickets(phone);
create index if not exists tickets_status_idx on tickets(status);
create index if not exists costs_ticket_idx   on costs(ticket_id);
create index if not exists history_ticket_idx on history(ticket_id);
