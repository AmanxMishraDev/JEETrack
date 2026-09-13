-- =====================================================
-- JEETrack — Rate Limiting: write-quota backend (Phase 3, revised)
--
-- UPDATE: admin.js's login limiter and the three Razorpay edge
-- functions' per-IP limiters were moved to Upstash Redis shortly after
-- this file was first written — see their source for the Upstash-based
-- checkRateLimit()/loginRateLimited(). That move was specifically about
-- IO: those callers hit this over REST regardless, so pointing them at
-- Upstash instead of Supabase removes that traffic from the free-tier
-- Database IO budget entirely (zero disk IO, vs. this table's reduced-
-- but-nonzero cost even as UNLOGGED).
--
-- What's LEFT here is check_write_quota() and the five save_* RPCs,
-- which stay on Postgres deliberately: that check runs *inside* a
-- Postgres function, called directly by the client via sb.rpc(). Moving
-- it to Redis would mean either a blocking outbound HTTP call from
-- inside a Postgres transaction (via the http extension — ties up a DB
-- connection for the round-trip, a new and less-understood risk) or
-- restructuring saves to go through an edge-function proxy (a real
-- architecture change, not a small tweak). Given the actual footprint —
-- checked against live traffic — is tens of tiny extra rows per day
-- total across all users, that trade isn't worth it right now.
--
-- check_rate_limit()/reset_rate_limit() below are therefore internal
-- plumbing for check_write_quota() only — nothing outside Postgres
-- calls them anymore.
-- =====================================================

-- UNLOGGED: skips WAL (write-ahead log) entirely, which is the dominant
-- IO cost of a Postgres write. Every check_write_quota() call still goes
-- through this table, so this matters for the free-tier Database IO
-- budget (see docs/PERFORMANCE.md). The only cost: this table's contents
-- are wiped on an unclean database crash/restart, which is fine here —
-- worst case everyone's write-quota counter resets to zero.
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key          text PRIMARY KEY,
  count        integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limits SET UNLOGGED;

-- Exposed via PostgREST like any public-schema table, so needs RLS
-- enabled even though nothing here is user-facing. No policies needed —
-- only service_role (bypasses RLS) and the SECURITY DEFINER functions
-- below ever touch this table. Same pattern as `donations`.
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Generic atomic check-and-increment. service_role only. Used
-- internally by check_write_quota() below — admin.js and the Razorpay
-- edge functions call Upstash directly now, not this. p_increment lets
-- a single call count for more than 1 (check_write_quota needs to
-- charge a bulk upsert by its row count, not by "1 call").
--
-- Note: Supabase grants EXECUTE to anon AND authenticated by default on
-- every new public-schema function — a separate grant from PUBLIC, not
-- implied by it. Revoking from PUBLIC alone leaves it callable by both.
-- All three REVOKEs below are required, not belt-and-suspenders.
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key text, p_max integer, p_window_seconds integer, p_increment integer DEFAULT 1)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_now   timestamptz := now();
  v_count integer;
BEGIN
  INSERT INTO public.rate_limits (key, count, window_start)
  VALUES (p_key, p_increment, v_now)
  ON CONFLICT (key) DO UPDATE SET
    count = CASE
      WHEN public.rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
        THEN p_increment
      ELSE public.rate_limits.count + p_increment
    END,
    window_start = CASE
      WHEN public.rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
        THEN v_now
      ELSE public.rate_limits.window_start
    END
  RETURNING count INTO v_count;
  RETURN v_count <= p_max;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer, integer) FROM PUBLIC, anon, authenticated;

-- Used once, on successful admin login, to clear the counter immediately
-- rather than waiting out the window — matches the old in-memory
-- behavior (`delete _loginAttempts[ip]`).
CREATE OR REPLACE FUNCTION public.reset_rate_limit(p_key text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  DELETE FROM public.rate_limits WHERE key = p_key;
$$;

REVOKE EXECUTE ON FUNCTION public.reset_rate_limit(text) FROM PUBLIC, anon, authenticated;


-- ── Per-user write quota, for the save_* sync RPCs ──
-- Deliberately narrow: takes a fixed table name (checked against an
-- allow-list) and an amount, always keyed by the CALLER's own
-- auth.uid() — never an arbitrary caller-supplied key like
-- check_rate_limit above. That's what makes it safe to grant to
-- `authenticated` directly: a signed-in user can only ever check/spend
-- their own daily quota for one of these five tables, nothing else.
CREATE OR REPLACE FUNCTION public.check_write_quota(p_table text, p_amount integer, p_max integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF p_table NOT IN ('tests', 'hours', 'backlogs', 'todos', 'practice_logs') THEN
    RAISE EXCEPTION 'invalid table for write quota check: %', p_table;
  END IF;
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  IF p_amount <= 0 THEN
    RETURN true; -- nothing to charge for (e.g. an empty p_rows array)
  END IF;
  RETURN public.check_rate_limit(
    'write:' || p_table || ':' || auth.uid()::text || ':' || to_char(current_date, 'YYYY-MM-DD'),
    p_max,
    86400, -- 24h; the date in the key means this also naturally resets at midnight UTC
    p_amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_write_quota(text, integer, integer) TO authenticated;
-- anon has no auth.uid() so this was already harmless for them (always
-- returns false), but tightened anyway to match intent: authenticated
-- users checking their own quota, nothing more.
REVOKE EXECUTE ON FUNCTION public.check_write_quota(text, integer, integer) FROM PUBLIC, anon;


-- ── Wire the quota into each save_* RPC ──
-- Delta-sync pattern confirmed in app.js (only changed rows are ever
-- sent, not a full resync), so these caps are sized generously above any
-- realistic legitimate usage — this is a backstop against a buggy
-- client stuck in a retry loop or a deliberate attempt to burn I/O
-- budget, not a limit anyone should ever actually hit.

CREATE OR REPLACE FUNCTION public.save_tests(p_rows jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.check_write_quota('tests', jsonb_array_length(p_rows), 300) THEN
    RAISE EXCEPTION 'Daily write limit reached for tests. Please try again tomorrow.';
  END IF;
  INSERT INTO public.tests (id, user_id, exam, session, paper, type, date, total, max, physics, chemistry, maths, notes)
  SELECT (r->>'id')::bigint, auth.uid(), r->>'exam', r->>'session', r->>'paper', r->>'type', r->>'date',
    (r->>'total')::numeric, (r->>'max')::numeric, (r->>'physics')::numeric, (r->>'chemistry')::numeric,
    (r->>'maths')::numeric, r->>'notes'
  FROM jsonb_array_elements(p_rows) AS r
  ON CONFLICT (id) DO UPDATE SET
    exam = EXCLUDED.exam, session = EXCLUDED.session, paper = EXCLUDED.paper, type = EXCLUDED.type,
    date = EXCLUDED.date, total = EXCLUDED.total, max = EXCLUDED.max, physics = EXCLUDED.physics,
    chemistry = EXCLUDED.chemistry, maths = EXCLUDED.maths, notes = EXCLUDED.notes
  WHERE public.tests.user_id = auth.uid()
    AND (public.tests.exam IS DISTINCT FROM EXCLUDED.exam
      OR public.tests.session IS DISTINCT FROM EXCLUDED.session
      OR public.tests.paper IS DISTINCT FROM EXCLUDED.paper
      OR public.tests.type IS DISTINCT FROM EXCLUDED.type
      OR public.tests.date IS DISTINCT FROM EXCLUDED.date
      OR public.tests.total IS DISTINCT FROM EXCLUDED.total
      OR public.tests.max IS DISTINCT FROM EXCLUDED.max
      OR public.tests.physics IS DISTINCT FROM EXCLUDED.physics
      OR public.tests.chemistry IS DISTINCT FROM EXCLUDED.chemistry
      OR public.tests.maths IS DISTINCT FROM EXCLUDED.maths
      OR public.tests.notes IS DISTINCT FROM EXCLUDED.notes);
END;
$function$;

CREATE OR REPLACE FUNCTION public.save_hours(p_rows jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.check_write_quota('hours', jsonb_array_length(p_rows), 300) THEN
    RAISE EXCEPTION 'Daily write limit reached for hours. Please try again tomorrow.';
  END IF;
  INSERT INTO public.hours (id, user_id, date, subject, lecture, practice, revision, total, mock_analysis, source, label, mock_id)
  SELECT (r->>'id')::numeric, auth.uid(), r->>'date', r->>'subject', (r->>'lecture')::numeric,
    (r->>'practice')::numeric, (r->>'revision')::numeric, (r->>'total')::numeric,
    coalesce((r->>'mock_analysis')::numeric, 0), coalesce(r->>'source', 'manual'), r->>'label', (r->>'mock_id')::bigint
  FROM jsonb_array_elements(p_rows) AS r
  ON CONFLICT (id) DO UPDATE SET
    date = EXCLUDED.date, subject = EXCLUDED.subject, lecture = EXCLUDED.lecture, practice = EXCLUDED.practice,
    revision = EXCLUDED.revision, total = EXCLUDED.total, mock_analysis = EXCLUDED.mock_analysis,
    source = EXCLUDED.source, label = EXCLUDED.label, mock_id = EXCLUDED.mock_id
  WHERE public.hours.user_id = auth.uid()
    AND (public.hours.date IS DISTINCT FROM EXCLUDED.date
      OR public.hours.subject IS DISTINCT FROM EXCLUDED.subject
      OR public.hours.lecture IS DISTINCT FROM EXCLUDED.lecture
      OR public.hours.practice IS DISTINCT FROM EXCLUDED.practice
      OR public.hours.revision IS DISTINCT FROM EXCLUDED.revision
      OR public.hours.total IS DISTINCT FROM EXCLUDED.total
      OR public.hours.mock_analysis IS DISTINCT FROM EXCLUDED.mock_analysis
      OR public.hours.source IS DISTINCT FROM EXCLUDED.source
      OR public.hours.label IS DISTINCT FROM EXCLUDED.label
      OR public.hours.mock_id IS DISTINCT FROM EXCLUDED.mock_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.save_backlogs(p_rows jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.check_write_quota('backlogs', jsonb_array_length(p_rows), 300) THEN
    RAISE EXCEPTION 'Daily write limit reached for backlogs. Please try again tomorrow.';
  END IF;
  INSERT INTO public.backlogs (id, user_id, title, subject, priority, due, details, done, added_date, done_date)
  SELECT (r->>'id')::numeric, auth.uid(), r->>'title', r->>'subject', r->>'priority', r->>'due', r->>'details',
    coalesce((r->>'done')::boolean, false), r->>'added_date', r->>'done_date'
  FROM jsonb_array_elements(p_rows) AS r
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title, subject = EXCLUDED.subject, priority = EXCLUDED.priority, due = EXCLUDED.due,
    details = EXCLUDED.details, done = EXCLUDED.done, added_date = EXCLUDED.added_date, done_date = EXCLUDED.done_date
  WHERE public.backlogs.user_id = auth.uid()
    AND (public.backlogs.title IS DISTINCT FROM EXCLUDED.title
      OR public.backlogs.subject IS DISTINCT FROM EXCLUDED.subject
      OR public.backlogs.priority IS DISTINCT FROM EXCLUDED.priority
      OR public.backlogs.due IS DISTINCT FROM EXCLUDED.due
      OR public.backlogs.details IS DISTINCT FROM EXCLUDED.details
      OR public.backlogs.done IS DISTINCT FROM EXCLUDED.done
      OR public.backlogs.added_date IS DISTINCT FROM EXCLUDED.added_date
      OR public.backlogs.done_date IS DISTINCT FROM EXCLUDED.done_date);
END;
$function$;

CREATE OR REPLACE FUNCTION public.save_todos(p_rows jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.check_write_quota('todos', jsonb_array_length(p_rows), 300) THEN
    RAISE EXCEPTION 'Daily write limit reached for todos. Please try again tomorrow.';
  END IF;
  INSERT INTO public.todos (id, user_id, title, subject, priority, due, details, done, added_date, done_date)
  SELECT (r->>'id')::numeric, auth.uid(), r->>'title', r->>'subject', r->>'priority', r->>'due', r->>'details',
    coalesce((r->>'done')::boolean, false), r->>'added_date', r->>'done_date'
  FROM jsonb_array_elements(p_rows) AS r
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title, subject = EXCLUDED.subject, priority = EXCLUDED.priority, due = EXCLUDED.due,
    details = EXCLUDED.details, done = EXCLUDED.done, added_date = EXCLUDED.added_date, done_date = EXCLUDED.done_date
  WHERE public.todos.user_id = auth.uid()
    AND (public.todos.title IS DISTINCT FROM EXCLUDED.title
      OR public.todos.subject IS DISTINCT FROM EXCLUDED.subject
      OR public.todos.priority IS DISTINCT FROM EXCLUDED.priority
      OR public.todos.due IS DISTINCT FROM EXCLUDED.due
      OR public.todos.details IS DISTINCT FROM EXCLUDED.details
      OR public.todos.done IS DISTINCT FROM EXCLUDED.done
      OR public.todos.added_date IS DISTINCT FROM EXCLUDED.added_date
      OR public.todos.done_date IS DISTINCT FROM EXCLUDED.done_date);
END;
$function$;

CREATE OR REPLACE FUNCTION public.save_practice_logs(p_rows jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.check_write_quota('practice_logs', jsonb_array_length(p_rows), 1000) THEN
    RAISE EXCEPTION 'Daily write limit reached for practice logs. Please try again tomorrow.';
  END IF;
  INSERT INTO public.practice_logs (id, user_id, subject, chapter_id, chapter_name, questions, date, logged_at)
  SELECT (r->>'id')::bigint, auth.uid(), r->>'subject', (r->>'chapter_id')::bigint, r->>'chapter_name',
    (r->>'questions')::integer, (r->>'date')::date, coalesce((r->>'logged_at')::timestamptz, now())
  FROM jsonb_array_elements(p_rows) AS r
  ON CONFLICT (id) DO UPDATE SET
    subject = EXCLUDED.subject, chapter_id = EXCLUDED.chapter_id, chapter_name = EXCLUDED.chapter_name,
    questions = EXCLUDED.questions, date = EXCLUDED.date, logged_at = EXCLUDED.logged_at
  WHERE public.practice_logs.user_id = auth.uid()
    AND (public.practice_logs.subject IS DISTINCT FROM EXCLUDED.subject
      OR public.practice_logs.chapter_id IS DISTINCT FROM EXCLUDED.chapter_id
      OR public.practice_logs.chapter_name IS DISTINCT FROM EXCLUDED.chapter_name
      OR public.practice_logs.questions IS DISTINCT FROM EXCLUDED.questions
      OR public.practice_logs.date IS DISTINCT FROM EXCLUDED.date);
END;
$function$;
