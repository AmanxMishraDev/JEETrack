## What does this change?


## Why?


## Checklist
- [ ] Tested locally (see CONTRIBUTING.md for local setup)
- [ ] If this touches `frontend/app.js`, `index.html`, or `styles.css` —
      no manual edit to `sw.js`'s `CACHE_VERSION` (it's auto-derived on build)
- [ ] If this adds a new Supabase query/RPC — checked it won't run more
      often than necessary (see `docs/PERFORMANCE.md` for the patterns
      already fixed here: unthrottled heartbeats, no-op writes, full
      unbounded history fetches)
- [ ] If this moves or renames a file under `frontend/` — checked
      `frontend/vercel.json` for a rewrite that needs updating
- [ ] If this adds a new table/column — RLS policy added/reviewed
