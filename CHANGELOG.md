# Changelog

All notable changes to JEETrack are recorded here. This file tracks
shipped work against the hardening & scalability roadmap, one phase at
a time.

## [Unreleased]

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
