# Architecture

## Overview

JEETrack is a static PWA frontend backed by Supabase (Postgres + Auth +
Edge Functions), deployed on Vercel. There is no separate application
server — the frontend talks to Supabase directly via PostgREST/RPC, and
Vercel serverless functions handle the few things that need a private key
(admin dashboard queries, env-config serving).

```
┌─────────────────┐        ┌──────────────────────┐
│  Browser (PWA)   │──────▶│  Vercel (frontend/)   │
│  app.js/index... │        │  api/config.js        │
└────────┬─────────┘        │  api/admin.js         │
         │                  └──────────┬────────────┘
         │ direct RPC / REST           │ service-role queries
         ▼                             ▼
┌───────────────────────────────────────────────────┐
│                    Supabase                        │
│  Postgres (RLS-protected) · Auth · Edge Functions   │
│  ai-insights · monthly-report · razorpay-*          │
└───────────────────────────────────────────────────┘
         │
         ▼
   Razorpay · Groq API · Resend (email)
```

## Why this split

- **Frontend talks to Postgres directly (via RLS), not through a custom
  API server** — for a solo-maintained app, Supabase's Row Level Security
  does the authorization work that would otherwise need a hand-written
  backend. See `database/sql/` for the schema and policies.
- **`frontend/api/`** exists only for the two things that genuinely need
  a server-side secret: serving public env config, and the admin
  dashboard (which uses the service-role key, never exposed to the
  browser).
- **Supabase Edge Functions** (`supabase/functions/`) handle everything
  that's either long-running, needs a third-party secret (Razorpay, Groq,
  Resend), or needs to run on a schedule (`monthly-report` via `pg_cron`).

## Data flow for a typical session

1. Browser loads `frontend/index.html` (served via Vercel, cached by
   `frontend/sw.js` as an app-shell).
2. `app.js` authenticates via Supabase Auth, then calls the
   `get_full_state` RPC once per session (skipped entirely if a cached
   local copy is already fresh — see `docs/PERFORMANCE.md`).
3. Edits (hours logged, tests added, todos checked off) are diffed
   client-side and saved via targeted `save_*` RPCs, debounced.
4. A day-granularity activity ping (`ping_activity`) marks the user as
   active for that calendar day — not a real-time presence signal.

## Where things live

| Concern | Location |
|---|---|
| App logic | `frontend/app.js` |
| Admin dashboard UI | `frontend/admin/admin.html` |
| Admin dashboard API (service-role) | `frontend/api/admin.js` |
| Static/marketing pages | `frontend/pages/` |
| DB schema + RLS + RPCs | `database/sql/` (reference) — apply via Supabase SQL Editor or migrate to `supabase/migrations/` |
| Payments, AI, email, reports | `supabase/functions/` |
| Routing / clean URLs | `frontend/vercel.json` |
