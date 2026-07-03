-- Homestays table — individual homestay listings per village
create table homestays (
  id          uuid primary key default gen_random_uuid(),
  village_id  uuid references villages(id) on delete cascade,
  name        text not null,
  contact     text,          -- phone or email
  type        text,          -- 'homestay', 'farmstay', 'heritage', 'eco_lodge'
  created_at  timestamptz default now()
);

create index idx_homestays_village on homestays(village_id);

alter table homestays enable row level security;
create policy "public_read_homestays" on homestays for select using (true);

-- District contacts table — official district-level info
create table district_contacts (
  id              uuid primary key default gen_random_uuid(),
  state           text not null,
  district        text not null,
  dm_email        text,         -- District Magistrate/Collector email
  tourism_email   text,         -- District tourism office email
  tourism_phone   text,         -- District tourism office phone
  tourism_website text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(state, district)
);

create index idx_district_contacts_lookup on district_contacts(state, district);

alter table district_contacts enable row level security;
create policy "public_read_district_contacts" on district_contacts for select using (true);