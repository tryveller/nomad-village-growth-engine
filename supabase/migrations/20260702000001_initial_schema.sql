-- Initial schema for Nomad Village Growth Engine
-- Creates all core tables, indexes, and RLS policies

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- LEAD STAGES (configurable pipeline)
-- ============================================================
create table lead_stages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  order_index integer not null default 0,
  color       text default '#6366f1',
  is_default  boolean default false,
  created_at  timestamptz default now()
);

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create table organizations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  type            text,                   -- 'government', 'ngo', 'corporate', 'individual'
  website         text,
  email_domain    text,
  description     text,
  source_url      text,
  metadata        jsonb default '{}',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_orgs_type on organizations(type);
create index idx_orgs_domain on organizations(email_domain);

-- ============================================================
-- LEADS
-- ============================================================
create table leads (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid references organizations(id) on delete set null,
  stage_id          uuid references lead_stages(id) on delete set null,
  first_name        text,
  last_name         text,
  email             text,
  phone             text,
  designation       text,
  department        text,
  source            text,                  -- 'manual', 'excel_import', 'site_scrape', 'referral'
  source_detail     text,
  notes             text,
  tags              text[] default '{}',
  custom_fields     jsonb default '{}',
  is_active         boolean default true,
  last_contacted_at timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index idx_leads_stage on leads(stage_id);
create index idx_leads_org on leads(organization_id);
create index idx_leads_email on leads(email);
create index idx_leads_source on leads(source);
create index idx_leads_tags on leads using gin(tags);
create index idx_leads_active on leads(is_active);

-- ============================================================
-- EMAIL TEMPLATES
-- ============================================================
create table email_templates (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  subject   text not null,
  body_html text not null,
  body_text text,
  variables text[] default '{}',
  category  text default 'outreach',
  created_at timestamptz default now()
);

-- ============================================================
-- CAMPAIGNS
-- ============================================================
create table campaigns (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  channel           text not null default 'email',  -- 'email', 'whatsapp', 'both'
  status            text default 'draft',            -- 'draft', 'active', 'paused', 'completed'
  target_org_types  text[] default '{}',
  template_id       uuid references email_templates(id),
  scheduled_at      timestamptz,
  sent_count        integer default 0,
  reply_count       integer default 0,
  created_at        timestamptz default now()
);

-- ============================================================
-- CAMPAIGN LEADS (junction)
-- ============================================================
create table campaign_leads (
  campaign_id     uuid references campaigns(id) on delete cascade,
  lead_id         uuid references leads(id) on delete cascade,
  status          text default 'pending',  -- 'pending', 'sent', 'delivered', 'opened', 'replied', 'bounced', 'failed'
  sent_at         timestamptz,
  opened_at       timestamptz,
  primary key (campaign_id, lead_id)
);

create index idx_campaign_leads_status on campaign_leads(status);
create index idx_campaign_leads_lead on campaign_leads(lead_id);

-- ============================================================
-- COMMUNICATIONS
-- ============================================================
create table communications (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid references leads(id) on delete cascade,
  campaign_id   uuid references campaigns(id) on delete set null,
  channel       text not null,           -- 'email', 'whatsapp'
  direction     text not null,           -- 'outbound', 'inbound'
  subject       text,
  body_text     text,
  body_html     text,
  message_id    text,
  thread_id     text,
  status        text default 'pending',  -- 'pending', 'sent', 'delivered', 'failed', 'read'
  metadata      jsonb default '{}',
  sent_at       timestamptz,
  delivered_at  timestamptz,
  created_at    timestamptz default now()
);

create index idx_comms_lead on communications(lead_id);
create index idx_comms_campaign on communications(campaign_id);
create index idx_comms_channel on communications(channel);
create index idx_comms_thread on communications(thread_id);
create index idx_comms_created on communications(created_at desc);

-- ============================================================
-- IMPORTS (Excel/CSV tracking)
-- ============================================================
create table imports (
  id              uuid primary key default gen_random_uuid(),
  filename        text not null,
  file_path       text,
  total_rows      integer,
  imported_rows   integer default 0,
  skipped_rows    integer default 0,
  error_rows      integer default 0,
  errors          jsonb default '[]',
  status          text default 'processing',
  created_at      timestamptz default now()
);

-- ============================================================
-- SCRAPE JOBS
-- ============================================================
create table scrape_jobs (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  target_url      text not null,
  org_type        text default 'government',
  selector_rules  jsonb default '{}',
  schedule        text,                    -- cron expression
  last_run_at     timestamptz,
  leads_found     integer default 0,
  status          text default 'pending',
  created_at      timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (enable on all tables)
-- ============================================================
alter table lead_stages enable row level security;
alter table organizations enable row level security;
alter table leads enable row level security;
alter table email_templates enable row level security;
alter table campaigns enable row level security;
alter table campaign_leads enable row level security;
alter table communications enable row level security;
alter table imports enable row level security;
alter table scrape_jobs enable row level security;

-- Authenticated users can read/write all (single-team app)
create policy "authenticated_full_access" on lead_stages
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on organizations
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on leads
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on email_templates
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on campaigns
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on campaign_leads
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on communications
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on imports
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on scrape_jobs
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');