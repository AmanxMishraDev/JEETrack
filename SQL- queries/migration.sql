-- =====================================================
-- JEETrack Email Reports — Migration
-- Run this in: Supabase → SQL Editor → Run
-- =====================================================

-- ── USER PREFERENCES TABLE ──
-- Stores email report preferences per user
create table if not exists user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_reports text default 'off' check (email_reports in ('monthly', 'off')),
  last_active_at timestamptz default now(),
  report_last_sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table user_preferences enable row level security;
create policy "Users can manage own preferences"
  on user_preferences for all using ((select auth.uid()) = user_id);

-- Allow the edge function (service role) to read all preferences.
-- IMPORTANT: restricted TO service_role — without this, the policy defaults
-- to the `public` role and lets ANY client (including anon) read every
-- user's preferences. (This was fixed live on production on 2026-07-26;
-- keeping this script in sync so a fresh run never reintroduces the bug.)
create policy "Service role can read all preferences"
  on user_preferences for select
  to service_role
  using (true);

-- ── ACTIVITY TRACKING ──
-- Update last_active_at whenever user syncs data
-- This is called from the app on every save()

-- Function to upsert last_active_at
create or replace function update_user_activity()
returns trigger language plpgsql security definer as $$
begin
  insert into user_preferences (user_id, last_active_at)
  values (auth.uid(), now())
  on conflict (user_id)
  do update set last_active_at = now(), updated_at = now();
  return new;
end;
$$;

-- Trigger: update activity whenever tests/hours are saved
create or replace trigger track_tests_activity
  after insert or update on tests
  for each row execute function update_user_activity();

create or replace trigger track_hours_activity
  after insert or update on hours
  for each row execute function update_user_activity();

-- ── INDEX for cron query performance ──
create index if not exists idx_user_prefs_reports
  on user_preferences(email_reports, last_active_at, report_last_sent_at)
  where email_reports = 'monthly';

-- =====================================================
-- Done! Now deploy the edge function.
-- =====================================================
