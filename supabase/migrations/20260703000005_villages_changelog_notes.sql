-- Add notes column to villages table
alter table villages add column if not exists notes text;

-- Create village_changelog table to track changes
create table if not exists village_changelog (
  id uuid primary key default gen_random_uuid(),
  village_id uuid references villages(id) on delete cascade,
  field_changed text not null,
  old_value text,
  new_value text,
  changed_at timestamptz default now(),
  changed_by text default 'system'
);

-- Add RLS for village_changelog
alter table village_changelog enable row level security;

create policy "authenticated_full_access_changelog" on village_changelog
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Add indexes for better query performance
create index if not exists idx_village_changelog_village_id on village_changelog(village_id);
create index if not exists idx_village_changelog_changed_at on village_changelog(changed_at desc);