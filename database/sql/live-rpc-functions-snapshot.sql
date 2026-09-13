-- =====================================================
-- JEETrack — Live RPC Functions Snapshot
-- Captured directly from production via pg_get_functiondef() on
-- 2026-09-12. These functions only existed in the Supabase dashboard
-- (added via SQL Editor/Studio) and were never committed — this is a
-- documentation/reproducibility commit, not new work, per Phase 2 of
-- the hardening roadmap. CREATE OR REPLACE is safe to re-run.
--
-- Audit performed while committing (per the roadmap's explicit ask):
--   1. SECURITY DEFINER scoping — is it actually needed?
--   2. Does any function accept a client-supplied user_id/uid param
--      that ISN'T cross-checked against auth.uid()?
--
-- Result: get_my_badge was the one real issue (see
-- 2026-09-12-harden-security-definer-functions.sql for the fix — it's
-- included below already patched, not in its original vulnerable form).
-- Everything else either takes no user-identifying param and relies on
-- auth.uid()/auth.email() internally, or is a plain SQL/RLS-respecting
-- function with no elevated privilege at all. Notes are inline below.
--
-- UPDATE (Phase 3): the five save_* functions below (save_tests,
-- save_hours, save_backlogs, save_todos, save_practice_logs) were
-- superseded by database/sql/rate-limiting.sql, which adds a per-user
-- daily write-quota check to each. Run that file AFTER this one, or —
-- if setting up fresh — just run rate-limiting.sql's versions directly
-- and treat the definitions here as historical.
-- =====================================================


-- ── Sync RPCs (called by app.js for every write) ──
-- None of these are SECURITY DEFINER — they run as the calling user, take
-- no user_id parameter, and always write with auth.uid() rather than
-- trusting anything from p_rows. RLS on each table is the actual backstop;
-- these just add a "did anything really change" guard to cut down on
-- no-op writes.

CREATE OR REPLACE FUNCTION public.save_tests(p_rows jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
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


-- ── Read RPC (called by app.js on load) ──
-- Not SECURITY DEFINER. Every sub-select is scoped to auth.uid() and
-- every table reference is schema-qualified, so search_path = '' (already
-- pinned live) is a no-op safety measure, not a behavior change.

CREATE OR REPLACE FUNCTION public.get_full_state()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
  select jsonb_build_object(
    'tests', (select coalesce(jsonb_agg(t), '[]'::jsonb) from public.tests t where t.user_id = auth.uid()),
    'hours', (select coalesce(jsonb_agg(h), '[]'::jsonb) from public.hours h where h.user_id = auth.uid()),
    'backlogs', (select coalesce(jsonb_agg(b), '[]'::jsonb) from public.backlogs b where b.user_id = auth.uid()),
    'todos', (select coalesce(jsonb_agg(td), '[]'::jsonb) from public.todos td where td.user_id = auth.uid()),
    'upcoming', (select coalesce(jsonb_agg(u), '[]'::jsonb) from public.upcoming u where u.user_id = auth.uid()),
    'user_preferences', (
      select jsonb_build_object('syllabus_state', up.syllabus_state)
      from public.user_preferences up where up.user_id = auth.uid()
    ),
    'streaks', (select to_jsonb(s) from public.streaks s where s.user_id = auth.uid()),
    'practice_logs', (select coalesce(jsonb_agg(pl), '[]'::jsonb) from public.practice_logs pl where pl.user_id = auth.uid()),
    'updated_at', (select ss.updated_at from public.sync_state ss where ss.user_id = auth.uid())
  );
$function$;


-- ── Activity heartbeat (called by app.js) ──
-- Not SECURITY DEFINER, no params, writes only the caller's own row —
-- see docs/PERFORMANCE.md for why this collapsed to day-granularity.

CREATE OR REPLACE FUNCTION public.ping_activity()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Day-granularity: only write if the user hasn't already been marked
  -- active today (local server date). Collapses what used to be a
  -- 5-min/30-min heartbeat into at most one write per user per day.
  INSERT INTO user_preferences (user_id, last_active_at)
  VALUES (auth.uid(), now())
  ON CONFLICT (user_id) DO UPDATE
    SET last_active_at = now(), updated_at = now()
    WHERE user_preferences.last_active_at IS NULL
       OR user_preferences.last_active_at::date < current_date;
END;
$function$;


-- ── Donations / Hall of Support (public-facing, no auth required) ──
-- SECURITY DEFINER is correct here: donations is a payments table with
-- restrictive RLS, and these all deliberately return public/anonymized
-- aggregate data (a real total, a leaderboard with names hidden when
-- show_publicly = false). No client-supplied user_id anywhere — these
-- take no parameters at all.

CREATE OR REPLACE FUNCTION public.get_community_impact_stats()
 RETURNS TABLE(supporter_count bigint, chais_bought bigint, supporting_since timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    COUNT(DISTINCT COALESCE(user_id::text, id::text)) AS supporter_count,
    COUNT(*) AS chais_bought,
    MIN(created_at) AS supporting_since
  FROM public.donations
  WHERE status = 'paid';
$function$;

CREATE OR REPLACE FUNCTION public.get_hall_of_support()
 RETURNS TABLE(supporter_key text, display_name text, badge_tier text, first_contribution_at timestamp with time zone, last_contribution_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH paid AS (
    SELECT * FROM public.donations WHERE status = 'paid'
  ),
  per_user AS (
    SELECT
      user_id,
      MAX(amount) AS max_amount,
      MIN(created_at) AS first_contribution_at,
      MAX(created_at) AS last_contribution_at,
      (ARRAY_AGG(display_name ORDER BY created_at DESC))[1] AS latest_display_name,
      (ARRAY_AGG(show_publicly ORDER BY created_at DESC))[1] AS latest_show_publicly
    FROM paid
    WHERE user_id IS NOT NULL
    GROUP BY user_id
  ),
  anon_rows AS (
    SELECT
      NULL::uuid AS user_id,
      id AS anon_id,
      amount AS max_amount,
      created_at AS first_contribution_at,
      created_at AS last_contribution_at,
      display_name AS latest_display_name,
      show_publicly AS latest_show_publicly
    FROM paid
    WHERE user_id IS NULL
  ),
  combined AS (
    SELECT user_id, NULL::bigint AS anon_id, max_amount, first_contribution_at, last_contribution_at, latest_display_name, latest_show_publicly FROM per_user
    UNION ALL
    SELECT user_id, anon_id, max_amount, first_contribution_at, last_contribution_at, latest_display_name, latest_show_publicly FROM anon_rows
  )
  SELECT
    COALESCE(user_id::text, 'anon-' || anon_id::text) AS supporter_key,
    CASE WHEN latest_show_publicly IS FALSE THEN NULL ELSE NULLIF(TRIM(latest_display_name), '') END AS display_name,
    CASE
      WHEN max_amount >= 499 THEN 'Diamond Supporter'
      WHEN max_amount >= 199 THEN 'Gold Supporter'
      WHEN max_amount >= 99  THEN 'Silver Supporter'
      ELSE 'Bronze Supporter'
    END AS badge_tier,
    first_contribution_at,
    last_contribution_at
  FROM combined;
$function$;

-- Caller looking up their OWN badge. Included here in its already-patched
-- form — the original live version trusted p_user_id with no identity
-- check at all. See 2026-09-12-harden-security-definer-functions.sql for
-- the fix itself and which call sites were verified before applying it.
CREATE OR REPLACE FUNCTION public.get_my_badge(p_user_id uuid)
 RETURNS TABLE(badge_tier text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    CASE
      WHEN MAX(amount) >= 499 THEN 'Diamond Supporter'
      WHEN MAX(amount) >= 199 THEN 'Gold Supporter'
      WHEN MAX(amount) >= 99  THEN 'Silver Supporter'
      ELSE 'Bronze Supporter'
    END AS badge_tier
  FROM public.donations
  WHERE user_id = p_user_id
    AND status = 'paid'
    AND (auth.uid() = p_user_id OR auth.role() = 'service_role')
  HAVING COUNT(*) > 0;
$function$;

-- Claims any pre-signup ("guest") donations matching the caller's own
-- verified email. SECURITY DEFINER is correct (donations RLS blocks
-- direct access), and it's self-scoped via auth.email()/auth.uid() —
-- no client-supplied identifier of any kind.
CREATE OR REPLACE FUNCTION public.claim_guest_donations()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  claimed_count integer;
  caller_email text;
BEGIN
  caller_email := auth.email();
  IF caller_email IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.donations
  SET user_id = auth.uid()
  WHERE user_id IS NULL
    AND status = 'paid'
    AND email IS NOT NULL
    AND lower(email) = lower(caller_email);

  GET DIAGNOSTICS claimed_count = ROW_COUNT;
  RETURN claimed_count;
END;
$function$;


-- ── Admin-only (not exposed to anon/authenticated) ──
-- SECURITY DEFINER is required here (reads auth.users, which normal
-- roles can't). Confirmed via information_schema.routine_privileges
-- that only postgres/service_role have EXECUTE — anon/authenticated
-- were never granted it, so this one was already correctly scoped.

CREATE OR REPLACE FUNCTION public.admin_demographics()
 RETURNS TABLE(dimension text, label text, cnt bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select 'class'::text, coalesce(p.class_year, ''), count(*)::bigint
    from auth.users u left join public.user_preferences p on p.user_id = u.id
    group by p.class_year
  union all
  select 'coaching'::text, coalesce(p.coaching, ''), count(*)::bigint
    from auth.users u left join public.user_preferences p on p.user_id = u.id
    group by p.coaching
  union all
  select 'year'::text, coalesce(p.target_year, ''), count(*)::bigint
    from auth.users u left join public.user_preferences p on p.user_id = u.id
    group by p.target_year
  union all
  select 'source'::text, coalesce(p.referral_source, ''), count(*)::bigint
    from auth.users u left join public.user_preferences p on p.user_id = u.id
    group by p.referral_source;
$function$;
