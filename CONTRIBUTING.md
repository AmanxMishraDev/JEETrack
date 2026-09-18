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

- **The service worker lives at `frontend/public/sw.js`**, not
  `frontend/sw.js` — that root-level file was a stale, unbuilt duplicate
  (a leftover from before `public/` became the convention for
  pass-through static files) and has been deleted. Edit `public/sw.js`
  directly.
- **`CACHE_VERSION` in `public/sw.js` is now a plain manual bump**, not
  content-hash-derived. The old `bump-sw-version.js` script (hashing a
  single `app.js` and writing to the un-deployed root `sw.js`) predated
  both the `js/app/*.js` chunk split and the Vite build's content-hashed
  `/assets/*.js`/`*.css` output, and was quietly broken by both — it's
  been removed. Bumping `CACHE_VERSION` is only needed when `sw.js`'s own
  caching/fetch *logic* changes (to force old service workers to update);
  it does nothing for ordinary app changes, since those already get a
  fresh hashed filename every build and `index.html` is served
  `no-cache`, so clients always see the latest bundle without any SW
  version bump at all.
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
