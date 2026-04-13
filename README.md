<div align="center">

<br/>

<img src="frontend/logo.svg" alt="JEETrack Logo" width="100" />

<br/>
<br/>

# JEETrack

### The all-in-one preparation tracker for JEE aspirants

<br/>

[![Launch App](https://img.shields.io/badge/⚡%20Launch%20App-jeetrack.vercel.app-6366f1?style=for-the-badge&logoColor=white)](https://jeetrack.vercel.app)

<br/>

[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

<br/>

> Track study hours · Analyse test scores · Crush the JEE syllabus — with AI-powered insights built in.

<br/>

</div>

---

<br/>

<div align="center">
  <img src="screenshots/dashboard.png" alt="JEETrack Dashboard" width="90%" />
  <br/><br/>
  <sub><i>Dashboard — daily study tracking, countdowns, score trends and subject progress at a glance</i></sub>
</div>

<br/>

---

<br/>

<div align="center">
  <img src="screenshots/test-tracker.png" alt="Test Tracker" width="48%" />
  &nbsp;&nbsp;
  <img src="screenshots/syllabus.png" alt="Syllabus Tracker" width="48%" />
  <br/><br/>
  <sub><i>JEE Mains &amp; Advanced test analytics &nbsp;·&nbsp; Topic-level syllabus coverage tracker</i></sub>
</div>

<br/>

<div align="center">
  <img src="screenshots/ai-insights.png" alt="AI Insights" width="48%" />
  &nbsp;&nbsp;
  <img src="screenshots/ai-insights-2.png" alt="AI Insights Report" width="48%" />
  <br/><br/>
  <sub><i>AI-powered coaching analysis &nbsp;·&nbsp; Personalised subject report &amp; action plan</i></sub>
</div>

<br/>

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 📊 | **Dashboard** | Daily study tracking, subject-wise progress, streak system & JEE countdown |
| 📝 | **Test Tracker** | Log JEE Mains / Advanced mock scores with trend charts and performance analytics |
| 📚 | **Syllabus Tracker** | Topic-level coverage across Physics, Chemistry & Maths |
| 🗂️ | **To-Do & Backlog** | Task management with priority levels and no-backlog streak |
| 🤖 | **AI Insights** | Personalised coaching analysis powered by **Groq (LLaMA 3.3 70B)** — pinpoints weak areas and suggests a plan |
| 📧 | **Monthly Reports** | Automated PDF report card delivered via email |
| 📱 | **PWA** | Installable on Android & iOS, works fully offline |
| 🔔 | **Push Notifications** | Daily study reminders via service worker |

---

## 🛠 Tech Stack

```
Frontend    Vanilla HTML · CSS · JavaScript 
Database    Supabase (PostgreSQL + Row Level Security)
Auth        Supabase Auth
AI Engine   Groq API  (LLaMA 3.3 70B Versatile, ~0.5s latency)
Functions   Supabase Edge Functions  (Deno / TypeScript)
Email       Resend API
Charts      Chart.js
PDF         jsPDF + html2canvas
Hosting     Vercel
Cron        pg_cron (Supabase)
```

---

## 📁 Project Structure

```
jeetrack/
├── frontend/                     # Static PWA — deployed to Vercel
│   ├── api/
│   │   └── config.js             # Serverless function — serves env vars to frontend
│   ├── index.html                # App shell & markup
│   ├── styles.css                # All styles
│   ├── app.js                    # All application logic
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker (offline + push)
│   └── vercel.json               # SPA rewrite config
├── supabase/
│   └── functions/
│       ├── ai-insights/          # Edge function — Groq AI analysis
│       │   └── index.ts
│       └── monthly-report/       # Edge function — monthly email + PDF
│           └── index.ts
├── supabase-schema.sql           # Full database schema
├── migration.sql                 # DB migrations
├── onboarding-trigger.sql        # New-user onboarding automation
└── README.md
```

---

## 🚀 Quick Start

### 1 · Clone the repository

```bash
git clone https://github.com/AmanxMishraDev/JEETrack.git
cd JEETrack
```

### 2 · Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `supabase-schema.sql`
3. Run `migration.sql` then `onboarding-trigger.sql`
4. Copy your **Project URL** and **anon key** from **Settings → API**

### 3 · Configure the frontend

Credentials are **never hardcoded** in source code. The frontend fetches them at runtime from a Vercel serverless function (`/api/config`) which reads them from environment variables set in your Vercel dashboard.

Go to your Vercel project → **Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | `your-anon-key` |

### 4 · Deploy to Vercel

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your repository and set **Root Directory** to `frontend`
4. Click **Deploy** ✅

The `frontend/vercel.json` already handles SPA rewrites so all routes work on hard refresh.

### 5 · Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link your project
supabase login
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set GROQ_API_KEY=gsk_your_groq_key
supabase secrets set APP_URL=https://your-app.vercel.app

# Deploy AI insights function
supabase functions deploy ai-insights

# Deploy monthly report function (optional)
supabase secrets set RESEND_API_KEY=re_your_resend_key
supabase secrets set FROM_EMAIL=reports@yourdomain.com
supabase functions deploy monthly-report
```

---

## 🔐 Environment Variables

### Vercel Dashboard (Project → Settings → Environment Variables)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key |

These are served to the frontend securely at runtime via the `/api/config` serverless function — credentials are never stored in source code.

### Supabase Secrets (Edge Functions)

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key for AI insights |
| `RESEND_API_KEY` | Resend key for email reports |
| `FROM_EMAIL` | Sender address for reports |
| `APP_URL` | Your Vercel deployment URL (for CORS) |

---

## 📤 Pushing Updates to GitHub

```bash
git add .
git commit -m "feat: describe your change"
git push origin main
```

Vercel auto-deploys on every push — no manual steps needed.

> **Note:** GitHub no longer accepts passwords over HTTPS. Use a [Personal Access Token](https://github.com/settings/tokens) with `repo` scope when prompted for credentials.

---

## 📋 Roadmap

- [ ] Revision scheduler with spaced repetition
- [ ] Peer leaderboard (opt-in)
- [ ] JEE Previous Year Question tagging
- [ ] Offline AI insights (on-device model)

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

```bash
git checkout -b feature/your-feature-name
```

---

## 👨‍💻 Author

**Aman Mishra** · [@contactamanmishra76-blip](https://github.com/contactamanmishra76-blip)

---

<div align="center">

<br/>

**Built with ❤️ for every JEE aspirant who refuses to give up**

<br/>

⭐ &nbsp;Star this repo if JEETrack helped your preparation

<br/>
<br/>

[![Launch App](https://img.shields.io/badge/⚡%20Launch%20App-jeetrack.vercel.app-6366f1?style=for-the-badge&logoColor=white)](https://jeetrack.vercel.app)

<br/>

</div>
