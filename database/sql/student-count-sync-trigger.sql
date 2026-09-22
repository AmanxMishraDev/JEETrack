-- =====================================================
-- JEETrack — Student Count Sync Trigger
--
-- Keeps app_config.students_count (the public "N students trust
-- JEETrack" style stat) roughly accurate by recomputing it whenever a
-- user signs up or is deleted, rather than querying auth.users live on
-- every page load.
--
-- This existed only in the Supabase dashboard until 2026-09-12 — see
-- Phase 2 of the hardening roadmap. While committing it, also revoked
-- EXECUTE from PUBLIC: it's trigger-only, but was nonetheless publicly
-- callable via /rest/v1/rpc/sync_students_count, and since it performs
-- a real write every call, that was a free write-amplification vector
-- against the free-tier Database IO budget (see docs/PERFORMANCE.md).
-- Revoking EXECUTE does not affect trigger firing — the trigger
-- executor invokes the function directly, not via role EXECUTE
-- privilege.
-- =====================================================

create or replace function public.sync_students_count()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  update app_config
  set students_count = (select count(*) from auth.users) + 300
  where id = 1;
  return null;
end;
$function$;

revoke execute on function public.sync_students_count() from public;

drop trigger if exists trg_sync_students_count_insert on auth.users;
create trigger trg_sync_students_count_insert
  after insert on auth.users
  for each row execute function public.sync_students_count();

drop trigger if exists trg_sync_students_count_delete on auth.users;
create trigger trg_sync_students_count_delete
  after delete on auth.users
  for each row execute function public.sync_students_count();
