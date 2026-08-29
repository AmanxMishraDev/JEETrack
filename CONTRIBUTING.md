# Contributing to JEETrack

This is a closed-source, proprietary project (see [LICENSE](./LICENSE)) — it isn't
open for public contributions. This guide exists for the owner and any
collaborators granted direct access to the repo.

## Local setup

1. Clone the repo.
2. `frontend/` is a static site — no build step required to run it locally;
   open `frontend/index.html` via a local server (e.g. `npx serve frontend`)
   rather than `file://`, since the Service Worker and `fetch` calls need a
   real origin.
3. Follow the **Quick Start** section in [README.md](./README.md) to wire up
   your own Supabase project, env vars, and edge functions.

## Before opening a PR

- **Don't touch `frontend/sw.js`'s `CACHE_VERSION` by hand** — it's derived
  automatically by `frontend/scripts/bump-sw-version.js` as part of the
  build. If you're editing `app.js`, `index.html`, or `styles.css`, the
  version bump happens on deploy, not in your commit.
- If you touch anything under `frontend/` that changes a public URL or a
  file's physical location, double-check `frontend/vercel.json` — most
  routes are static-file rewrites, and clean URLs (`/faq`, `/admin`, etc.)
  are mapped explicitly there rather than inferred from folder structure.
- SQL changes: add new files to `supabase/migrations/` if you're using the
  Supabase CLI, not `database/sql/` — the latter is historical reference
  only (see the note in README's Project Structure section).
- Run any DB migration against a scratch/staging Supabase project first —
  this app has real users on the free tier, and Database IO budget is
  already a tracked concern (see [`docs/PERFORMANCE.md`](./docs/PERFORMANCE.md)).

## Commit style

Short, imperative commit messages (`fix: ...`, `feat: ...`, `perf: ...`,
`docs: ...`) are preferred but not enforced by tooling.
