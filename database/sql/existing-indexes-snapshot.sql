-- =====================================================
-- JEETrack — Existing Indexes Snapshot
-- Captured directly from production via:
--   select tablename, indexname, indexdef from pg_indexes
--   where schemaname = 'public' order by tablename, indexname;
-- on 2026-09-12.
--
-- Purpose: production already had all of these; the repo did not.
-- This is a documentation/reproducibility commit, not new work —
-- see Phase 2 of the hardening roadmap. Every statement is
-- idempotent (IF NOT EXISTS), so running this against an environment
-- that already has some of these (e.g. via supabase-schema.sql) is
-- safe and a no-op for anything that already matches.
-- =====================================================

CREATE UNIQUE INDEX IF NOT EXISTS app_config_pkey ON public.app_config USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS backlogs_pkey ON public.backlogs USING btree (id);
CREATE INDEX IF NOT EXISTS idx_backlogs_user_id ON public.backlogs USING btree (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS donations_pkey ON public.donations USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS donations_razorpay_payment_id_key ON public.donations USING btree (razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON public.donations USING btree (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS feedback_pkey ON public.feedback USING btree (id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback USING btree (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS hours_pkey ON public.hours USING btree (id);
CREATE INDEX IF NOT EXISTS idx_hours_user_id ON public.hours USING btree (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS practice_logs_pkey ON public.practice_logs USING btree (id);
CREATE INDEX IF NOT EXISTS practice_logs_chapter_idx ON public.practice_logs USING btree (user_id, chapter_id);
CREATE INDEX IF NOT EXISTS practice_logs_user_date_idx ON public.practice_logs USING btree (user_id, date);
CREATE INDEX IF NOT EXISTS practice_logs_user_id_idx ON public.practice_logs USING btree (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS streaks_pkey ON public.streaks USING btree (user_id);

-- Archived table (kept for historical reference — see the 20260822 date
-- in its name — not part of the active schema, but production still has
-- it, so it's captured here too for a fully accurate snapshot).
CREATE UNIQUE INDEX IF NOT EXISTS syllabus_pkey ON public.syllabus_archived_20260822 USING btree (id, user_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_user_id ON public.syllabus_archived_20260822 USING btree (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS sync_state_pkey ON public.sync_state USING btree (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS tests_pkey ON public.tests USING btree (id);
CREATE INDEX IF NOT EXISTS idx_tests_user_id ON public.tests USING btree (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS todos_pkey ON public.todos USING btree (id);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos USING btree (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS upcoming_pkey ON public.upcoming USING btree (id);
CREATE INDEX IF NOT EXISTS idx_upcoming_user_id ON public.upcoming USING btree (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS user_preferences_pkey ON public.user_preferences USING btree (user_id);
-- Partial index: only rows due for a monthly report, keeps the report-cron
-- query cheap without scanning every user.
CREATE INDEX IF NOT EXISTS idx_user_prefs_reports ON public.user_preferences
  USING btree (email_reports, last_active_at, report_last_sent_at)
  WHERE (email_reports = 'monthly'::text);
