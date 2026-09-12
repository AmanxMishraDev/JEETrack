-- Applied directly to production via Supabase migration tooling on
-- 2026-09-12, in response to findings from Supabase's built-in security
-- advisor (`get_advisors`). Committed here so the repo doesn't drift from
-- what's actually running — see Phase 2 of the hardening roadmap.

-- get_my_badge: was trusting a client-supplied p_user_id with no check
-- against the caller's identity, letting anyone look up any user's
-- donation badge tier via /rest/v1/rpc/get_my_badge. Now only returns a
-- result when the caller IS that user (auth.uid() = p_user_id) or the
-- call is made with the service role (used by the check-payment-status
-- edge function). Confirmed both real call sites still work:
-- app.js always passes the logged-in user's own id, and
-- check-payment-status calls this with SUPABASE_SERVICE_ROLE_KEY.
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

-- handle_new_user: trigger-only function (fires on auth.users insert),
-- has no business being callable via PostgREST RPC. Revoking EXECUTE
-- does not affect trigger firing — the trigger executor invokes it
-- directly, not via role EXECUTE privilege. Also pins search_path
-- (was mutable; body already schema-qualifies every reference).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- sync_students_count: same trigger-only story, but this one performs a
-- real write on every call (UPDATE app_config). Being publicly callable
-- was a free write-amplification vector against a free-tier Supabase
-- project with known Database IO budget sensitivity (see docs/PERFORMANCE.md).
REVOKE EXECUTE ON FUNCTION public.sync_students_count() FROM PUBLIC;

-- get_full_state: not SECURITY DEFINER, so lower severity, but every
-- table reference inside was already schema-qualified — safe to pin.
ALTER FUNCTION public.get_full_state() SET search_path = '';
