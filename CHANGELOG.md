# Changelog

All notable changes to JEETrack are recorded here. This file tracks
shipped work against the hardening & scalability roadmap, one phase at
a time.

## [Unreleased]

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
