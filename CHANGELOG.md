# Changelog

All notable changes to JEETrack are recorded here. This file tracks
shipped work against the hardening & scalability roadmap, one phase at
a time.

## [Unreleased]

### Phase 7 — Automated tests
- Added Vitest, wired into CI (`npm test` replaces the Phase-0 placeholder
  test job). 39 tests, all passing, covering the roadmap's priority list:
  1. **Admin auth** (`test/admin/auth.test.mjs`) — valid/expired/tampered/
     missing/wrong-secret tokens all return the correct status; a valid
     token demonstrably passes the auth gate.
  2. **Login rate limiting** (`test/admin/rate-limit.test.mjs`) — the
     `LOGIN_MAX_ATTEMPTS`+1th attempt from one IP returns 429, scoped
     per-IP, resets on a correct login, fails open (not closed) if
     Upstash is unreachable.
  3. **Razorpay webhook** (`supabase/functions/razorpay-webhook/
     index.test.ts`) — Deno-native tests (not Vitest — this is Deno
     runtime code, same reasoning `eslint.config.js` already uses to lint
     it separately): valid signature processed and upserts (not inserts)
     on `razorpay_payment_id`; missing/tampered signature or tampered
     body rejected with no DB call made; a replayed captured-payment
     event does not send a second receipt email; missing webhook secret
     fails closed (503). Required a small, behavior-preserving refactor
     to `index.ts` — extracted `handleRequest` as its own export instead
     of an anonymous callback passed directly to `Deno.serve`, guarded
     behind `import.meta.main` — so the handler can be unit-tested
     without actually starting an HTTP server. Verified via diff that
     this changed exactly those two lines and nothing else.
  4. **Phase 4 schema validation** (`test/admin/validation.test.mjs`) —
     every schema (`login`, `users`, `user_detail`, `feedback_list`)
     rejects out-of-range/malformed input rather than silently
     coercing/clamping it (negative page, oversized `pageSize`/`limit`,
     invalid UUID, non-enum `sort`/`dir`, rating outside 1-5), plus
     router-level checks that a validated action returns 400 before ever
     reaching its handler.
  5. **Query-performance smoke test** (`test/db/query-performance.test.mjs`,
     `npm run test:db`) — seeds 50k rows into `hours` and asserts the
     `user_id` lookup plan is an Index Scan, not a Seq Scan, guarding the
     indexes committed in Phase 2. Needs a full local Supabase stack
     (`supabase start`) since `hours.user_id` has a foreign key to
     `auth.users`, which only exists there, not in a bare Postgres —
     intentionally not wired into CI yet since I could not run it myself
     (no Postgres/Docker in the environment this was written in); run it
     locally and confirm before adding it as a CI gate.

### Phase 5 — Break up the monolith files (admin.js)
- Restructured `frontend/api/admin.js` (1,135 lines, 17 actions all in one
  file/function) into `frontend/api/admin/`: `index.js` (router — env
  check, auth gate, action dispatch table), `lib/` (auth, rate-limit,
  supabase client, cache, labels, dates, cors, validation — 8 files), and
  `handlers/` (one file per action or tight group of related actions — 13
  files). Kept as `admin/index.js` rather than a flat rename so the
  Vercel route stays `/api/admin` (directory + `index.js` maps the same
  as a top-level `admin.js` — verified against `vercel.json`'s rewrites).
- Pure refactor, no behavior changes: every comment, edge case, and Phase
  4 validation schema was carried over verbatim, just relocated to the
  file matching its concern. Verified with (1) `node --check` on every
  new file, (2) a real import of the full module graph to catch typo'd
  import paths, (3) ESLint against the new tree — identical 5 pre-existing
  warnings, zero new ones, (4) a diff of every `action === '...'` branch
  in the old file against the new dispatch table — all 17 actions
  (16 handlers + `login`) accounted for, none dropped or duplicated, and
  (5) a behavioral-equivalence harness: mocked Supabase/Upstash responses
  fed to the old monolith and the new router side by side across 24 cases
  covering every action plus edge cases (bad UUID, oversized `pageSize`,
  wrong/right password, unauthorized, unknown action) — byte-for-byte
  identical JSON output and status codes in every case (the one expected
  diff being the login token's embedded timestamp, which differs between
  any two calls to `Date.now()` by construction).
- Every new file is well under the roadmap's ~300–400 line guideline;
  the largest (`handlers/feedback.js`) is 152 lines.
- `frontend/app.js` + `index.html` (the other Phase 5 target) intentionally
  not started in this pass — see the note left for that work: it's a much
  higher-risk split (shared global scope across `app.js` and 5 inline
  `<script>` blocks in `index.html`, 131 `onclick="..."` handlers, no
  bundler yet, no test suite yet) and needs an agreed approach before
  touching a file this central to the live app.
- Follow-up: split `frontend/app.js` (4,223 lines) into 10 files under
  `frontend/js/app/` (boot/auth, auth forms, shell/data, badges,
  sync/engagement, landing, landing interactions, onboarding, settings,
  feedback), loaded in the same order as 10 `<script>` tags — deliberately
  kept as classic (non-module) scripts sharing one global scope, same as
  before, since real module conversion would've meant rewriting all 131
  `onclick` call sites. Verified by concatenating all 10 files back
  together and diffing against the original — byte-for-byte, checksum
  identical. Also fixed `sw.js`'s precache list (was hardcoded to the old
  single `/app.js` path) and `eslint.config.js` (was scoped to the single
  file; added ~65 cross-chunk globals so lint doesn't flood with
  false-positive `no-undef` now that the code is split across files).
- Caught post-deploy: the initial admin.js split (lib/ + handlers/ nested
  inside `frontend/api/admin/`) pushed the project over Vercel Hobby's
  12-serverless-function limit — every `.js` file under `frontend/api/`
  counts as its own function, so 22 helper files became 22 functions.
  Fixed by moving `lib/` and `handlers/` to `/server/admin/` (outside
  `frontend/api/`) — Vercel's build-time import tracing still bundles
  them into the one real function (`frontend/api/admin/index.js`), but
  only that one file counts against the limit. Down to 2 functions total.
  Re-ran the full behavioral-equivalence harness after the move — still
  byte-for-byte identical.

### Phase 6 — Build pipeline for the frontend
- Added Vite (chosen over esbuild — the plan is React later, and
  Vite+React is the standard pairing; deferred until Phases 7-8 are done
  and there's test coverage as a safety net first).
- `frontend/js/app/*.js` (the 10 Phase 5 chunks) are concatenated by a
  build script (`frontend/scripts/build-app-bundle.mjs`) into
  `main.generated.js`, with `window.x = x` auto-generated for every
  top-level declaration (225 of them) — Vite requires a real ES module as
  its entry, but the chunks themselves are still deliberately classic
  global-scope code (same 131-onclick-handler reason as Phase 5). The
  10 source files stay the single source of truth; the generated file is
  gitignored and rebuilt every `npm run build`. Verified: the
  auto-extracted exposure list matches a hand-built one exactly, every
  `onclick` handler resolves (either from this list or from a function
  confirmed to live in `index.html` itself), and the minified output
  still contains all 225 `window.x=` assignments (nothing tree-shaken).
- Restructured `frontend/` for Vite: moved everything that should pass
  through untouched (`admin/`, `analytics.js`, `assets/`, `pages/`,
  `manifest.json`, `sw.js`, etc.) into `frontend/public/`. `frontend/api/`
  untouched — separate from the static build entirely.
- Content-hashed JS/CSS output filenames + immutable `Cache-Control` on
  `/assets/*`, `no-cache` on `/index.html` (`vercel.json`). Vercel now
  runs an actual build (`installCommand`/`buildCommand`/`outputDirectory`
  added to `frontend/vercel.json`, since Root Directory is `frontend` and
  the real `package.json`/`node_modules` live one level up at the repo
  root).
- `sw.js` simplified: the old per-file precache list can't hardcode
  content-hashed filenames (they change every build), so hashed assets
  now just fall through to normal browser HTTP caching. Only
  `/index.html` still gets the special always-fetch-fresh treatment,
  since it's the one file whose content says which hashed bundle to load.
- Switched the CSS minifier to esbuild's (Vite's new default,
  lightningcss, hard-errors on `:not(::before)` in `styles.css` —
  technically invalid CSS, long tolerated silently by every browser, not
  worth touching app CSS to fix in a build-tooling phase).
- Follow-up: extracted the largest remaining inline `<script>` block in
  `index.html` (lines 4541–9337, 4,799 lines — over half the file) into
  `frontend/js/app/dashboard-controller.js`. Verified lossless by
  splicing the extracted file back inline at the same spot and diffing
  the result against the pre-extraction file: byte-for-byte identical.
  The smaller scattered inline blocks (a splash-screen block and a
  24-line settings-nav block) were left alone — most of the size was in
  this one block, and splitting the smaller ones carries the same
  execution-order risk for much less payoff.
- Superseded the above the same day: rather than reinserting
  `dashboard-controller.js` as a classic script at its original document
  position, folded it into a second, lazily-loaded bundle —
  `frontend/public/dashboard-bundle.generated.js` — built alongside
  `main.generated.js` by the same `build-app-bundle.mjs`, containing
  everything only needed once a user is actually logged in
  (`dashboard-controller.js` + the 6 dashboard-only Phase 5 chunks —
  shell/data, badges, sync/engagement, onboarding, settings, feedback).
  `app-01-boot-auth.js`'s `loadDashboardBundle()` fetches it only after
  `initSupabase()` confirms a session, so a landing-page-only visit never
  downloads or parses it — this also resolves the `window.nav` ordering
  concern above, since `nav` (defined in `dashboard-controller.js`) is
  never referenced by anything that can run before the bundle loads: the
  only call sites are `onclick` handlers inside `#main-app`/onboarding,
  which can't be reached until after login. `index.html` is now 4,460
  source lines (was 9,436); shipped bytes down to 324KB, and the
  always-loaded core JS bundle itself dropped from 125KB to 44.6KB since
  dashboard code moved out of it.
- Cache-Control for the three remaining non-hashed classic scripts
  (`analytics.js`, `splash.js`, `dashboard-bundle.generated.js`) is now
  `no-cache` in `vercel.json`, same treatment as `index.html` — dropped
  their manual `?v=YYYYMMDD` cache-busting query strings, which needed
  remembering to bump on every content change and were easy to forget,
  especially now that `dashboard-bundle.generated.js` carries most of the
  app's JS. `no-cache` forces revalidation on every load instead, so
  there's nothing left to remember.

### Phase 2 — Close the repo ↔ production drift
- Pulled every index actually running in production
  (`pg_indexes`) and committed them as idempotent
  `CREATE INDEX IF NOT EXISTS` statements in
  `database/sql/existing-indexes-snapshot.sql`. Confirms Phase 2's
  premise: prod already had the right indexes, the repo just didn't
  reflect it.
- Pulled every RPC function that only existed live in the dashboard
  (`pg_get_functiondef`) and committed them to
  `database/sql/live-rpc-functions-snapshot.sql`:
  `save_tests`, `save_hours`, `save_backlogs`, `save_todos`,
  `save_practice_logs`, `get_full_state`, `ping_activity`,
  `get_community_impact_stats`, `get_hall_of_support`,
  `get_my_badge` (in its already-patched form), `claim_guest_donations`,
  `admin_demographics`.
- Audited every one of those (plus the two trigger functions) for the
  two things the roadmap calls out: `SECURITY DEFINER` used only where
  actually needed, and no client-supplied `user_id`/`uid` param left
  unchecked against `auth.uid()`. Only finding was `get_my_badge`,
  already fixed in Phase 1.5. Everything else checks out — documented
  inline in the snapshot file so the reasoning doesn't get lost.
- Found and fixed drift in an existing committed file:
  `onboarding-trigger.sql` had gone stale — missing the `search_path`
  pin and the `REVOKE EXECUTE` applied live during Phase 1.5. Updated
  it to match reality.
- Committed `sync_students_count()` and its two triggers
  (`database/sql/student-count-sync-trigger.sql`) — existed live,
  wasn't in the repo at all.

### Phase 3 — Rate limiting & write-side throttling
- Replaced admin.js's hand-rolled `_loginAttempts` object (in-memory,
  serverless module scope — not reliably shared/persistent across
  concurrent Vercel instances) with a Postgres-backed rate limiter.
  Used Postgres instead of Redis/Upstash since admin.js and the edge
  functions already talk to Supabase via REST with the service-role
  key for everything else — no new vendor needed. See
  `database/sql/rate-limiting.sql` for `check_rate_limit()` /
  `reset_rate_limit()`.
- Preserved the existing admin login UX (attempts-remaining message,
  accurate lockout countdown) by reading the counter row back for
  display — same behavior as before, different backing store.
- Added the same per-IP rate limiting to the three client-facing
  Razorpay edge functions (`create-razorpay-order`: 30/hour,
  `verify-razorpay-payment`: 40/hour, `check-payment-status`: 60/hour
  — revised upward from an initial, too-tight pass after realizing
  JEETrack's audience — students on coaching-center/hostel WiFi — often
  shares one public IP behind NAT; the original numbers risked blocking
  genuine donors, not just abuse). These had zero throttling before.
  Deliberately fails open on a check error — a transient blip should
  never be able to block real donations. `razorpay-webhook` wasn't
  touched: it's Razorpay-server-only traffic, already signature-gated,
  lower priority.
- Added a per-user daily write quota to the five `save_*` sync RPCs
  (`tests`/`hours`/`backlogs`/`todos`: 300/day, `practice_logs`:
  1000/day) via a narrow `check_write_quota()` wrapper — takes a fixed
  table name from an allow-list and always keys by the caller's own
  `auth.uid()`, so it's safe to grant directly to `authenticated`
  without opening up `check_rate_limit()`'s free-form key to arbitrary
  tampering. Confirmed via app.js that sync is delta-only (changed rows,
  not a full resync each time), so these caps sit far above any real
  usage — verified against live production counters after deploying:
  highest real user is at 32 writes/day, nowhere near the 300 cap.
- Key strategy, made explicit per the roadmap's ask: per-IP for the
  anonymous endpoints (admin login before auth, all three Razorpay
  functions — donations don't require an account), per-user-id for the
  authenticated write quota.
- Not touched: admin.js's separate `_cacheStore`/`_rosterCache`
  in-memory objects. Same serverless-statelessness caveat applies, but
  that's a response-memoization cache, not a rate limiter — a stale
  cache miss just means one extra DB read, not a security gap — so
  it's a performance cleanup for a later phase, not this one.
- IO follow-up (round 1): `rate_limits` made `UNLOGGED` — skips WAL
  (write-ahead log) entirely, the dominant IO cost of a Postgres write.
  Trade-off: contents are wiped on an unclean DB crash/restart — fine
  here, worst case counters reset to zero.
- IO follow-up (round 2): moved admin.js's login limiter and all three
  Razorpay edge functions' per-IP limiters off Postgres entirely, onto
  Upstash Redis — those callers hit this over REST either way, so
  pointing them at Upstash instead removes that traffic from the
  Database IO budget completely (zero disk IO, not just reduced).
  Requires `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` set on
  both Vercel (admin.js) and Supabase Edge Function secrets (the three
  Razorpay functions) — until set, these fail open (no rate limiting,
  not broken). Verified twice: first the actual admin.js/edge-function
  code (not a reimplementation) against a local mock of Upstash's REST
  contract, then both Lua script variants directly against a real
  Upstash database once one existed — confirmed correct end to end
  (increment, TTL, and window behavior all matched expectations) before
  handing off the env-var setup.
- The write-quota path (`check_write_quota` + the five `save_*` RPCs)
  deliberately stayed on Postgres — see the top of
  `database/sql/rate-limiting.sql` for why (it's an internal
  Postgres-to-Postgres call, and the alternatives — a blocking HTTP
  call from inside a Postgres transaction, or a proxy-architecture
  rewrite — trade a small, measured IO cost for a new and less-
  understood risk). Checked against live traffic: the actual footprint
  is tens of extra tiny rows per day, total, across every user.

### Phase 4 — Validation schema layer
- Added Zod (`^4.6.5` — checked npm for the actual current version
  rather than assuming v3) as a real runtime dependency in `admin.js`,
  and via `esm.sh` in `create-razorpay-order` (matching this repo's
  existing esm.sh convention for edge-function imports).
- Added a shared `validate(schema, data)` helper in `admin.js` with a
  consistent 400 error shape, and schemas for exactly what the roadmap
  calls out: the login body, and the `users`/`user_detail`/
  `feedback_list` query params — admin.js's highest-traffic actions.
  Every schema was checked against admin.html's actual call sites
  before being written (sortable columns, hardcoded pageSize, where
  distinct_id always comes from) so nothing legitimate gets rejected.
- `user_detail`'s `distinct_id` is now validated as an actual UUID
  instead of a bare truthy check.
- `create-razorpay-order`'s manual amount/length checks replaced with
  a Zod schema. Caught a real bug in my own first draft before
  shipping: a plain `.email()` field rejected empty-string emails,
  which would've broken the one real call site (support.html never
  sends an email today) — fixed with a preprocess step that treats
  empty/missing as "no email," while still validating format when a
  value is actually provided.
- display_name over 60 chars now gets rejected (400) instead of
  silently truncated — matches the roadmap's own stated intent
  ("malformed input → rejected, not silently coerced") and confirmed
  safe since the client already enforces `maxlength="60"`.
- Verified by actually exercising the real handler function (not just
  the schemas in isolation) with realistic request shapes for all 4
  validated actions, both valid and invalid — confirmed valid input
  reaches the real logic and invalid input gets a clean 400 with a
  specific error message, no regressions to the auth-gating flow.
- Not yet covered (staying in scope with what the roadmap explicitly
  lists for this phase): `feedback_feature` and every other admin.js
  action, plus `verify-razorpay-payment`/`check-payment-status`'s
  bodies. Natural next candidates whenever this phase continues.

## [2026-09-12] — Phase 0, 1 & 1.5 shipped

### Phase 0 — Baseline safety net
- Added GitHub Actions CI: lint on every push/PR for the frontend + api
  code (ESLint) and Supabase edge functions (`deno lint`), plus a
  placeholder test job to hold the status-check slot until Phase 7's
  real test suite lands.
- Added `docs/SECURITY.md` with a responsible-disclosure process.
- Added this changelog.

### Phase 1 — Fix known admin/payment bugs
- `razorpay-webhook/index.ts`: HTML-escape the supporter's display name
  before it goes into the receipt email, and switch the webhook
  signature check to a timing-safe comparison.
- `admin.js`: `ADMIN_TOKEN_SECRET` and `ADMIN_PASSWORD` are now two
  separate required env vars — the API returns 500 if either is unset
  instead of silently signing tokens with the admin password.
- `admin.js`: `user_detail` now URI-encodes `distinct_id` before it's
  used in any Supabase filter (was interpolated raw across 8 queries).
- `admin.js`: `clientIp()` now prefers Vercel's `x-real-ip` header over
  raw `x-forwarded-for`.

### Ahead of schedule — live production fixes (found via Supabase's security advisor)
- `get_my_badge(p_user_id uuid)`: was a `SECURITY DEFINER` RPC that
  trusted a client-supplied `p_user_id` with no check against the
  caller's identity — anyone could look up any user's donation badge
  tier. Now requires `auth.uid() = p_user_id` or a service-role caller.
  This is the exact "user_id not cross-checked against auth.uid()" risk
  Phase 2 flags for the RPCs that only exist live — applied directly
  since it's a real, live vulnerability. Migration committed to
  `database/sql/2026-09-12-harden-security-definer-functions.sql`.
- `handle_new_user()` / `sync_students_count()`: both are trigger-only
  functions that were nonetheless publicly callable via PostgREST RPC
  (`SECURITY DEFINER` + default `PUBLIC` grant). `sync_students_count`
  performs a real write on every call, so this was a free write-
  amplification vector against the free-tier Database IO budget.
  Revoked `EXECUTE` from `PUBLIC`; trigger firing is unaffected.
- `handle_new_user()` / `get_full_state()`: pinned `search_path` (was
  mutable); both already schema-qualify every reference, so no
  behavior change.
- Flagged, not changed: `donations` has RLS enabled with zero
  policies (likely intentional — all access goes through the
  `SECURITY DEFINER` RPCs above plus the service-role webhook) —
  worth confirming intent before touching.

### Phase 1.5 — End-user login/signup hardening
- Added Cloudflare Turnstile to the login and signup forms: widgets
  render lazily the first time the auth modal opens, the token is
  required and passed as `captchaToken` to `signUp`/
  `signInWithPassword`, and reset after every attempt (tokens are
  single-use). Entirely inert until `TURNSTILE_SITE_KEY` is set — see
  "Still needs doing" below.
- `config.js` now also serves `turnstileSiteKey` (not secret — meant
  to be public/embedded), same pattern as `posthogKey`.
- Added a client-side login attempt counter/backoff (5 failed
  attempts → 60s cooldown, keyed by email, resets on page reload).
  UX layer only — real enforcement is still Supabase Auth + Turnstile
  server-side.
- Still needs doing (dashboard-only, no API path found for these):
  raise minimum password length in Supabase Auth settings, enable
  leaked-password protection (confirmed OFF via the security advisor),
  create the actual Turnstile widget in the Cloudflare dashboard and
  set its site key as `TURNSTILE_SITE_KEY` in Vercel + its secret key
  in Supabase Auth settings, and verify the Redirect URLs allowlist.
