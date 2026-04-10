# JEETrack

A full-stack Progressive Web App for JEE 2026/2027 aspirants to track their preparation — study hours, test scores, syllabus coverage, backlogs, and AI-powered insights.

**[→ Live Demo](https://your-netlify-url.netlify.app)** ← replace with your link

---

## Features

- **Dashboard** — daily study tracking, subject-wise progress, streak system
- **Test Tracker** — log JEE Mains/Advanced mock scores with analytics
- **Syllabus Tracker** — topic-level coverage for Physics, Chemistry, Maths
- **Backlog Manager** — track and clear weak topics
- **AI Insights** — personalised analysis powered by Claude AI
- **Monthly Email Reports** — automated PDF report card via Supabase Edge Functions + Resend
- **PWA** — installable on Android/iOS, works offline
- **Push Notifications** — study reminders via service worker

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| Backend Functions | Supabase Edge Functions (Deno/TypeScript) |
| Email | Resend API |
| Charts | Chart.js |
| PDF Export | jsPDF + html2canvas |
| Hosting | Netlify |
| Cron Jobs | pg_cron (Supabase) |

---

## Project Structure

```
jeetrack/
├── frontend/                  # Static PWA — deployed to Netlify
│   ├── index.html             # App markup
│   ├── styles.css             # All styles
│   ├── app.js                 # All JavaScript
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── netlify.toml           # Netlify config
├── supabase/
│   └── functions/
│       ├── ai-insights/       # Edge function — AI analysis via Claude
│       └── monthly-report/    # Edge function — monthly email + PDF
├── supabase-schema.sql        # Full database schema
├── migration.sql              # DB migrations
└── README.md
```

---

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the SQL Editor
3. Run `migration.sql` for email report tables
4. Copy your **Project URL** and **anon key** from Settings → API

### 2. Frontend

Open `frontend/app.js` and paste your credentials at the top:

```js
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. Deploy to Netlify

1. Push this repo to GitHub
2. Connect repo on [netlify.com](https://netlify.com)
3. Set **Publish directory** to `frontend`
4. Deploy

### 4. Email Reports (optional)

See the full setup guide in [`supabase/functions/monthly-report/`](./supabase/functions/monthly-report/) — covers Resend API, cron job, and edge function deployment.

---

## Environment Variables (Edge Functions)

Set these via Supabase CLI:

```bash
supabase secrets set RESEND_API_KEY=re_your_key
supabase secrets set FROM_EMAIL=reports@yourdomain.com
supabase secrets set APP_URL=https://your-app.netlify.app
```

---

*Built by Aman Mishra*
