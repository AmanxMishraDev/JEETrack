-- JEETrack x Optima: move optima_jobs from the mock design (callback + stored result) to Optima's real partner API.
-- Real API: POST submit -> { submission_id, status, notebook_url, repeat }, GET status -> received | ready.
-- No callback, no stored analysis. Question content is never stored here.
--
-- Additive and safe on a table that already has RLS: no data is dropped, no policy is touched.
-- (optima_jobs was empty when this was written. The old 'result' / 'optima_job_id' columns are left in place, unused.)

alter table public.optima_jobs
  add column if not exists pw_test_id      text,         -- PW test id (idempotency key, with attempt_title)
  add column if not exists attempt_title   text,         -- "Attempt 1", or null if PW gave none
  add column if not exists submission_id   text,         -- Optima's id for this submission
  add column if not exists notebook_url    text,         -- the student's notebook page on Optima (one stable link per student)
  add column if not exists attempted_at    timestamptz not null default now(), -- start of the latest send attempt (a retry resets it)
  add column if not exists last_checked_at timestamptz,  -- last time we asked Optima for the status
  add column if not exists error           text;         -- short machine code of the last failure, never a payload

-- Allowed states. 'sent' / 'done' stay allowed only so nothing written by the old function can violate the check.
--   sending  = row created, call to Optima in flight (or it died: retried after 5 minutes)
--   received = Optima has it, notebook being built
--   ready    = this test is in the student's notebook
--   failed   = Optima refused or was unreachable; the student can send again
alter table public.optima_jobs drop constraint if exists optima_jobs_status_check;
alter table public.optima_jobs add constraint optima_jobs_status_check
  check (status in ('sending','received','ready','failed','sent','done'));
alter table public.optima_jobs alter column status set default 'sending';

-- One job per (student, PW test, attempt). Makes "send again" idempotent and closes the double-click race.
create unique index if not exists optima_jobs_attempt_uidx
  on public.optima_jobs (user_id, pw_test_id, coalesce(attempt_title, ''))
  where pw_test_id is not null;

-- The app reads jobs by test.
create index if not exists optima_jobs_user_test_idx on public.optima_jobs (user_id, test_id);

-- Defence in depth: students may only read. (RLS already has no insert/update/delete policy; this makes it explicit.)
revoke insert, update, delete, truncate on public.optima_jobs from anon, authenticated;
revoke select on public.optima_jobs from anon;
