-- Villages table for Nomad Village Growth Engine
-- Stores village profiles discovered for outreach

create table villages (
  id          uuid primary key default gen_random_uuid(),
  state       text not null,
  district    text not null,
  name        text not null,
  profile     text,
  source      text default 'csv_import',
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Indexes
create index idx_villages_state on villages(state);
create index idx_villages_district on villages(district);
create index idx_villages_name on villages(name);

-- RLS
alter table villages enable row level security;

create policy "authenticated_full_access" on villages
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');