# Database IO — what was found and fixed

JEETrack runs on Supabase's free tier (~2,500 total users, ~180 DAU at time
of writing), which has a limited Database IO/compute budget and no current
plan to upgrade. This doc records what was actually consuming that budget
and what was changed, so the same mistakes don't get reintroduced.

## 1. Unthrottled activity heartbeat

`ping_activity()` was called on every `visibilitychange` event with no
client-side cooldown — tab switches, app-switches, and mobile screen
lock/unlock all fired it. This alone accounted for **~17.6% of total
database execution time** in production, ahead of every actual data-save
RPC.

**Fix, in two stages:**
- First pass: throttle to at most once per 5 minutes client-side.
- Final design: the app only needs to know *which day* a user was last
  active, not minute-level freshness — so the heartbeat now fires **at
  most once per calendar day** (`localStorage`-tracked), no interval timer
  at all. See `startActivityHeartbeat()` in `frontend/app.js`.

## 2. Double-write bug inside `ping_activity()` itself

Independent of the client-side call frequency, the SQL function itself did:
```sql
UPDATE ... WHERE last_active_at < now() - interval '5 minutes';
IF NOT FOUND THEN INSERT ... ON CONFLICT DO NOTHING; END IF;
```
`NOT FOUND` is true whenever the `UPDATE`'s `WHERE` clause matches zero
rows — which is exactly what happens on purpose for the (common) "already
pinged recently" case. So every throttled/skipped ping was still falling
through to a second write attempt. Collapsed into a single
`INSERT ... ON CONFLICT DO UPDATE ... WHERE <stale>` statement so the
common case is a true no-op.

## 3. No-op writes on every `save_*` upsert

`save_hours`, `save_tests`, `save_todos`, `save_backlogs`,
`save_practice_logs` all did `ON CONFLICT DO UPDATE SET col = EXCLUDED.col`
unconditionally — even when the incoming row was byte-identical to what
was already stored, Postgres still generated a real write (WAL + dead
tuple). Added an `IS DISTINCT FROM` guard on the `WHERE` clause of each so
truly-unchanged rows are skipped at the database level, regardless of what
the client sends.

## 4. Orphaned `syllabus` table

A legacy per-user `syllabus` table (68,948 rows, ~12MB) had zero live
references anywhere in the frontend — syllabus data had already migrated
to `user_preferences.syllabus_state` (jsonb). Archived (renamed, not
dropped, for a safety window) rather than actively costing storage/scan
overhead for no reason.

## 5. Admin dashboard timezone bug (data correctness, not IO)

`frontend/api/admin.js` bucketed dates with `toISOString().split('T')[0]`
— UTC, not IST. Since users are in IST (UTC+5:30), any signup or activity
between 00:00–05:29 IST landed in the *previous* day's bucket, corrupting
"new users per day" and D1/D7/D30 retention numbers. Fixed with a shared
`toISTDateKey()`/`toISTMonthKey()` helper using `Asia/Kolkata`.

## 6. Service worker serving stale `app.js` after deploy

Even after fixes above were deployed, some users kept hitting old code —
`frontend/sw.js`'s fetch handler for app-shell files (`app.js`,
`index.html`, `styles.css`) did a plain `fetch()`, which lets the
*browser's own* HTTP cache (separate from the SW's Cache Storage) silently
serve a stale response on Cache-Control/ETag grounds. Added
`{ cache: 'no-store' }` to force a real round-trip on every app-shell
fetch, and added `frontend/scripts/bump-sw-version.js` (wired into the
build command) so `CACHE_VERSION` is derived from actual file content
hashes instead of relying on someone remembering to bump it by hand.

## Net effect

Total DB execution time dropped from a ~317,783ms/day baseline to
~237,861ms/day after fixes #1–#3 alone (~25%), before the day-granularity
heartbeat and SW cache fix (which address the remaining causes of the
improvement not fully showing up — stale cached JS still running for some
users) were applied. Re-measure with `pg_stat_statements` after a full
clean 24h window whenever evaluating further changes here — see the
reset/compare pattern used throughout this investigation rather than
trusting cumulative stats that span a code change.

## Ongoing candidates (not yet done, lower priority)

- `get_full_state` fetches full, unbounded history for `hours`/`tests`/
  `practice_logs`/etc. Cheap today; will grow. Any fix must account for
  client-side all-time aggregates (e.g. total study hours) that currently
  depend on the full array being present — don't naively truncate without
  also sending a precomputed aggregate.
- `claim_guest_donations` and `get_my_badge` run on every app load (not
  gated by the same "skip if unchanged" check `get_full_state` has).
