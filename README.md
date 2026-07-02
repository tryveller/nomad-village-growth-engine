# Nomad Village Growth Engine 🌍

Lead management and outreach platform for Nomad Village. Connect with government departments, NGOs, and individuals through email and WhatsApp outreach campaigns.

## Tech Stack

- **Frontend:** Bun + React 19 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
- **Email:** Resend (SMTP fallback)
- **Messaging:** WhatsApp Business API (Phase 7)

## Features

- 📊 **Lead Management** — Import from Excel/CSV, manual entry, government site scraping
- 🔄 **Pipeline/Kanban** — Drag-and-drop lead stages with conversion analytics
- ✉️ **Email Outreach** — Template-based campaigns with open/reply tracking
- 💬 **WhatsApp Outreach** — Business API integration (coming)
- 📈 **Dashboard** — Real-time stats: reach, replies, conversion rates
- 🏛️ **Organization Directory** — Government departments, NGOs, companies
- 📥 **Unified Inbox** — All communications in one thread view

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.0
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Setup

```bash
# Clone
git clone https://github.com/arpitbansal/nomad-village-growth-engine.git
cd nomad-village-growth-engine

# Install dependencies
bun install

# Start Supabase locally
supabase start

# Apply migrations
supabase db reset

# Start dev server
bun run dev
```

### Environment

Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Email (Resend)
RESEND_API_KEY=re_...

# WhatsApp (Meta Business API)
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
```

## Project Structure

See [Architecture Plan](.hermes/plans/2026-07-02_architecture-plan.md) for full details.

## License

Private — Nomad Village