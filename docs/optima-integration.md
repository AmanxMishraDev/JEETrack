# JEETrack x Optima (real partner API)

Source of truth: `PARTNER_API_JEETRACK.md` from Optima. This replaces the earlier mock design (callback + HMAC + Bearer token + stored result).

## Flow
1. Extension (PW result page): **Add to my error notebook** ticked, **Send to JEETrack** pressed.
2. `log_pw_mock` RPC saves the score to `tests` (independent of everything below; never blocked by Optima).
3. Extension -> edge function `submit-mock` with the student's JWT: `{ consent: true, test_id, test: <schema-2 test, unchanged> }`.
4. `submit-mock` verifies the JWT, validates, creates ONE `optima_jobs` row per (student, PW testId, attempt), POSTs to Optima with `x-partner-key`,
   stores `submission_id` + `notebook_url` (never the questions). Status `received` (or `ready`).
5. App / popup call `optima-status` (JWT) -> it GETs Optima's status (at most once a minute per job) -> `ready`. No cron, no timers.
6. App shows Analyse / Analysing… / Analysis ready / Failed and links to `notebook_url` ("Open my error notebook ->").

## Secrets (Supabase -> Edge Functions -> Secrets)
| Name | Value |
|---|---|
| `OPTIMA_PARTNER_URL` | the full `.../functions/v1/partner` address Sagar sends (staging first, live later) |
| `OPTIMA_PARTNER_KEY` | the `x-partner-key` value (different for staging and live) |
| `ANON_SALT` | random string; keep stable. Student id sent to Optima = `jt_` + first 32 hex of HMAC-SHA256(salt, user id). Changing it creates new notebooks for everyone |
| `OPTIMA_ID_PREFIX` | optional. Set `jt_test_` on staging ("use test student IDs"); remove for live |
No longer needed: `OPTIMA_CALLBACK_SECRET`, `OPTIMA_API_KEY`, `OPTIMA_API_URL`.

## Obsolete, delete in the dashboard (Edge Functions)
`optima-callback`, `mock-optima`, `log-mock`. (`optima-callback` has no secret configured and is not used by the real API.)

## Database
`database/sql/2026-11-03-optima-real-api.sql` (already applied to project yskoeapemjuyyvkhlbpm). Additive; students keep select-own only.

## Tests
- `node --experimental-strip-types --import ./supabase/test/register.mjs supabase/test/e2e.mjs` (edge functions vs a fake Optima written from the doc)
- `npm test` (includes `test/frontend/optima-analysis.test.mjs`)
