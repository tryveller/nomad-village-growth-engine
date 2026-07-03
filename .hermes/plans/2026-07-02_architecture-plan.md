# Nomad Village Growth Engine — Architecture Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a lead management and outreach platform that helps Nomad Village connect with government departments, NGOs, and individuals via email & WhatsApp, track lead stages, and convert outreach into conversations.

**Architecture:** Monorepo with a Bun + React 19 + TypeScript frontend (Vite + shadcn/ui + Tailwind) backed by Supabase (PostgreSQL, Auth, Edge Functions, Realtime, Storage). Supabase Edge Functions handle email (Resend/SendGrid) and WhatsApp Business API integration. Excel/CSV import and government site scraping run via Edge Functions on a schedule.

**Tech Stack:** Bun 1.3+, React 19, TypeScript 5.8, Vite 7, shadcn/ui, Tailwind CSS 3, Supabase, react-router-dom 6, react-hook-form + zod, TanStack Query, Recharts

---

## Project Structure

```
nomad-village-growth-engine/
├── src/
│   ├── app/                    # React Router pages
│   │   ├── dashboard/          # Main dashboard with stats
│   │   ├── leads/              # Lead list, detail, import
│   │   ├── outreach/           # Campaigns, email composer, templates
│   │   ├── pipeline/           # Kanban board for lead stages
│   │   ├── organizations/      # Government depts, NGOs directory
│   │   ├── communications/     # Email + WhatsApp thread view
│   │   └── settings/           # Email/WhatsApp config, team
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── leads/              # LeadTable, LeadCard, LeadImport
│   │   ├── outreach/           # EmailComposer, CampaignBuilder, TemplateEditor
│   │   ├── pipeline/           # KanbanBoard, StageColumn, LeadCard
│   │   └── shared/             # Layout, Nav, Search, Filters
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client (browser + server)
│   │   ├── api/                # Typed API wrappers for Edge Functions
│   │   ├── types/              # Database types (generated from Supabase)
│   │   └── utils/              # cn(), formatters, validators
│   └── hooks/                  # TanStack Query hooks, auth, realtime
├── supabase/
│   ├── migrations/             # Database migrations
│   ├── functions/              # Edge Functions
│   │   ├── send-email/         # Send individual/campaign emails
│   │   ├── send-whatsapp/      # WhatsApp Business API integration
│   │   ├── import-leads/       # Excel/CSV parsing and import
│   │   ├── scrape-sites/       # Government site scraper
│   │   ├── process-replies/    # Email webhook / IMAP polling
│   │   └── daily-digest/       # Outreach stats digest
│   └── seed.sql                # Seed data for stages, templates
├── public/
├── tests/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Database Schema (Supabase / PostgreSQL)

### Core Tables

```sql
-- Lead stages (configurable pipeline)
CREATE TABLE lead_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,              -- e.g. 'New Lead', 'First Contact', 'Meeting Scheduled'
  order_index INTEGER NOT NULL DEFAULT 0,
  color       TEXT DEFAULT '#6366f1',
  is_default  BOOLEAN DEFAULT false,      -- default stage for new leads
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Organizations (government depts, NGOs, companies)
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            TEXT,                   -- 'government', 'ngo', 'corporate', 'individual'
  website         TEXT,
  email_domain    TEXT,                   -- for domain-level targeting
  description     TEXT,
  source_url      TEXT,                   -- URL where this org was discovered
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Leads (individual contacts)
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  stage_id        UUID REFERENCES lead_stages(id) ON DELETE SET NULL,
  first_name      TEXT,
  last_name       TEXT,
  email           TEXT,
  phone           TEXT,
  designation     TEXT,                  -- e.g. 'Director', 'Program Officer'
  department      TEXT,
  source          TEXT,                  -- 'manual', 'excel_import', 'site_scrape', 'referral'
  source_detail   TEXT,                  -- filename, URL, referrer name
  notes           TEXT,
  tags            TEXT[] DEFAULT '{}',   -- ['priority', 'hot-lead', 'follow-up']
  custom_fields   JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  last_contacted_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Outreach campaigns
CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  channel         TEXT NOT NULL DEFAULT 'email',  -- 'email', 'whatsapp', 'both'
  status          TEXT DEFAULT 'draft',            -- 'draft', 'active', 'paused', 'completed'
  target_org_types TEXT[] DEFAULT '{}',           -- ['government', 'ngo']
  template_id     UUID REFERENCES email_templates(id),
  scheduled_at    TIMESTAMPTZ,
  sent_count      INTEGER DEFAULT 0,
  reply_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Campaign-lead junction (which leads are in which campaign)
CREATE TABLE campaign_leads (
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id         UUID REFERENCES leads(id) ON DELETE CASCADE,
  status          TEXT DEFAULT 'pending',  -- 'pending', 'sent', 'delivered', 'opened', 'replied', 'bounced', 'failed'
  sent_at         TIMESTAMPTZ,
  opened_at       TIMESTAMPTZ,
  PRIMARY KEY (campaign_id, lead_id)
);

-- Email templates
CREATE TABLE email_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  subject         TEXT NOT NULL,
  body_html       TEXT NOT NULL,
  body_text       TEXT,
  variables       TEXT[] DEFAULT '{}',     -- ['{{first_name}}', '{{organization}}']
  category        TEXT DEFAULT 'outreach', -- 'outreach', 'follow_up', 'thank_you'
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Communication log (email + WhatsApp)
CREATE TABLE communications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  channel         TEXT NOT NULL,           -- 'email', 'whatsapp'
  direction       TEXT NOT NULL,           -- 'outbound', 'inbound'
  subject         TEXT,
  body_text       TEXT,
  body_html       TEXT,
  message_id      TEXT,                    -- external message ID (Gmail, WhatsApp)
  thread_id       TEXT,                    -- for threading replies
  status          TEXT DEFAULT 'pending',  -- 'pending', 'sent', 'delivered', 'failed', 'read'
  metadata        JSONB DEFAULT '{}',
  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Import history (Excel/CSV uploads)
CREATE TABLE imports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename        TEXT NOT NULL,
  file_path       TEXT,                    -- Supabase Storage path
  total_rows      INTEGER,
  imported_rows   INTEGER DEFAULT 0,
  skipped_rows    INTEGER DEFAULT 0,
  error_rows      INTEGER DEFAULT 0,
  errors          JSONB DEFAULT '[]',      -- [{row: 5, error: 'invalid email'}]
  status          TEXT DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Scrape jobs (government site scraping)
CREATE TABLE scrape_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  target_url      TEXT NOT NULL,
  org_type        TEXT DEFAULT 'government',
  selector_rules  JSONB DEFAULT '{}',      -- CSS selectors for extracting contacts
  schedule        TEXT,                    -- cron expression for recurring scrapes
  last_run_at     TIMESTAMPTZ,
  leads_found     INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Indexes

```sql
CREATE INDEX idx_leads_stage ON leads(stage_id);
CREATE INDEX idx_leads_org ON leads(organization_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_tags ON leads USING GIN(tags);
CREATE INDEX idx_communications_lead ON communications(lead_id);
CREATE INDEX idx_communications_campaign ON communications(campaign_id);
CREATE INDEX idx_campaign_leads_status ON campaign_leads(status);
```

---

## Key Features & Pages

### 1. Dashboard (`/`)
- Outreach stats: total leads, emails sent, replies received, reply rate %
- Pipeline overview: leads per stage (mini funnel)
- Recent activity feed
- Upcoming campaigns
- Charts: outreach volume over time, reply rate by org type

### 2. Lead Management (`/leads`)
- Filterable, searchable lead table with pagination
- Lead detail view with full communication history
- Bulk import: drag-drop Excel/CSV → preview → map columns → import
- Add lead manually
- Tag and assign leads to campaigns

### 3. Pipeline / Kanban (`/pipeline`)
- Drag-and-drop Kanban board with lead stages as columns
- Click lead card → quick actions (send email, move stage, add note)
- Stage configuration (add/rename/reorder stages, set colors)
- Pipeline analytics: conversion rates between stages

### 4. Outreach Campaigns (`/outreach`)
- Create campaign: name, channel, target filters, email template
- Campaign builder: select leads by org type, stage, tags, source
- Preview before sending (variable interpolation)
- Send immediately or schedule
- Campaign stats: sent, delivered, opened, replied

### 5. Communication Center (`/communications`)
- Unified inbox: all email + WhatsApp threads
- Compose individual email (rich text / HTML)
- Template picker with variable autofill
- Thread view with full conversation history
- Bulk actions: mark replied, archive, move to stage

### 6. Organizations (`/organizations`)
- Directory of government departments, NGOs, companies
- Link organizations to leads
- Domain-based targeting for bulk outreach
- Import from government site scrapes

### 7. Settings (`/settings`)
- Email configuration: SMTP / Resend API key
- WhatsApp Business API configuration
- Lead stage management
- Email template CRUD
- Team members (Supabase Auth)

---

## Edge Functions (Supabase)

| Function | Trigger | Purpose |
|---|---|---|
| `send-email` | HTTP | Send individual or batch emails via Resend/SendGrid |
| `send-whatsapp` | HTTP | Send WhatsApp messages via Business API |
| `import-leads` | HTTP | Parse uploaded Excel/CSV, validate, insert leads |
| `scrape-sites` | HTTP / Cron | Scrape government websites for contact info |
| `process-replies` | Cron | Poll email inbox (IMAP) or process webhooks for replies |
| `daily-digest` | Cron | Generate daily outreach stats, send to admin |

---

## Implementation Phases

### Phase 0: Project Setup (Today)
- [ ] Initialize Bun + Vite + React + TypeScript project
- [ ] Set up shadcn/ui + Tailwind
- [ ] Configure Supabase project
- [ ] Set up routing (react-router-dom)
- [ ] Create database migrations
- [ ] GitHub repo creation + initial commit

### Phase 1: Core Data Layer
- [ ] Database migrations (all tables)
- [ ] Supabase TypeScript types generation
- [ ] Lead stages seed data
- [ ] TanStack Query hooks for all CRUD operations

### Phase 2: Lead Management
- [ ] Lead list page with filtering/search
- [ ] Lead detail page
- [ ] Manual lead creation form
- [ ] Excel/CSV import (frontend + Edge Function)
- [ ] Lead tagging and search

### Phase 3: Pipeline / Kanban
- [ ] Kanban board UI (drag & drop)
- [ ] Stage CRUD and reordering
- [ ] Lead movement between stages
- [ ] Pipeline analytics

### Phase 4: Organizations
- [ ] Organization directory
- [ ] Organization-lead linking
- [ ] Government site scraper Edge Function

### Phase 5: Outreach Engine
- [ ] Email template CRUD
- [ ] Email composer with template variables
- [ ] Campaign builder + lead selection
- [ ] `send-email` Edge Function (Resend integration)
- [ ] Campaign tracking (sent/opened/replied)

### Phase 6: Communication Center
- [ ] Unified inbox (email threads)
- [ ] `process-replies` Edge Function (webhook/IMAP)
- [ ] Thread view with full history
- [ ] Reply from within the platform

### Phase 7: WhatsApp Integration
- [ ] WhatsApp Business API Edge Function
- [ ] WhatsApp send from communication center
- [ ] WhatsApp thread tracking

### Phase 8: Analytics & Automation
- [ ] Dashboard with charts (Recharts)
- [ ] Daily digest Edge Function
- [ ] Scheduled campaign sending
- [ ] Recurring scrape jobs

---

## Key Design Decisions

1. **Supabase as the backend**: Auth, realtime subscriptions for live pipeline updates, PostgreSQL for complex queries, Edge Functions for integrations. No separate backend server needed.

2. **TanStack Query for data fetching**: Automatic caching, background refetch, optimistic updates for smooth UX. All Supabase queries go through typed query hooks.

3. **Resend for email**: Modern email API with webhook support for open/click/reply tracking. Better than raw SMTP for campaign analytics.

4. **WhatsApp Business API**: Uses Meta's Cloud API. Requires business verification but gives programmatic send/receive.

5. **Excel import via Edge Function**: Parse on the server side (xlsx library in Deno/Bun), stream results, handle large files.

6. **Government site scraping**: Dedicated Edge Function with cheerio-like HTML parsing. Configurable selectors per site. Results flow into organization and lead tables.

7. **Realtime pipeline**: Supabase Realtime subscriptions power the Kanban board — when one teammate moves a lead, everyone sees it.

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| WhatsApp Business API approval delays | Start with email-only outreach; WhatsApp is Phase 7 |
| Email deliverability / spam | Use Resend with proper SPF/DKIM/DMARC; warm up domains gradually |
| Government site scraping blocking | Rate limiting, rotating user agents, manual curation as fallback |
| Data quality from imports | Robust column mapping UI, validation preview before commit |
| Supabase free tier limits | Monitor usage; upgrade to Pro when approaching limits |

---

## Verification

- `bun run dev` → app loads at localhost:5173
- Supabase migrations apply cleanly
- Seed data populates 5 default lead stages
- `bun run build` passes with zero TypeScript errors
- `bun run test` passes all unit tests