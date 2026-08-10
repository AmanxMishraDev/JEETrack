-- =====================================================
-- JEETrack — Razorpay Donations + Performance/Security Fixes
-- Applied live on production (2026-07-26). This file documents those
-- changes so a fresh environment can be brought to the same state.
-- Run this in: Supabase → SQL Editor → Run
-- =====================================================

-- ── DONATIONS TABLE ("Buy me a coffee") ──
-- Written only by the verify-razorpay-payment edge function (service role),
-- which bypasses RLS — so no client-facing SELECT/INSERT policies exist.
create table if not exists public.donations (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  amount numeric not null,
  currency text default 'INR',
  razorpay_order_id text,
  razorpay_payment_id text,
  status text default 'created',
  created_at timestamptz default now()
);
alter table public.donations enable row level security;


-- ── PERFORMANCE: missing index on feedback.user_id ──
-- feedback.user_id is a foreign key with no covering index, which forces
-- sequential scans on lookups/joins.
create index if not exists idx_feedback_user_id on public.feedback (user_id);


-- ── PERFORMANCE: drop unused index ──
-- Never used; was pure write-time overhead.
drop index if exists public.idx_tests_date;


-- ── SECURITY: public_testimonials view was SECURITY DEFINER ──
-- It bypassed RLS entirely instead of relying on a row-level policy. Fixed
-- by adding an explicit policy on `feedback` with the same filter the view
-- used, then switching the view to SECURITY INVOKER so RLS is what actually
-- gates access (not the view owner's permissions).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'feedback'
    AND policyname = 'Public can view featured testimonials'
  ) THEN
    CREATE POLICY "Public can view featured testimonials"
      ON public.feedback
      FOR SELECT
      TO public
      USING (
        featured = true
        AND rating >= 4
        AND message IS NOT NULL
        AND trim(message) <> ''
        AND lower(trim(message)) <> '(no comment)'
      );
  END IF;
END $$;

alter view public.public_testimonials set (security_invoker = true);

-- =====================================================
-- Done. Remaining steps for donations to go live:
--   1. Deploy supabase/functions/create-razorpay-order and
--      supabase/functions/verify-razorpay-payment
--      (supabase functions deploy <name>)
--   2. Set secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
--      (supabase secrets set RAZORPAY_KEY_ID=... RAZORPAY_KEY_SECRET=...)
-- =====================================================
