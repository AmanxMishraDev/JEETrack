-- =====================================================
-- JEETrack — Razorpay Payment Security Hardening
-- Applied live on production (2026-07-27).
-- Run this in: Supabase → SQL Editor → Run
-- =====================================================

-- ── Prevent duplicate donation rows ──
-- If verify-razorpay-payment (client callback) and razorpay-webhook (server
-- confirmation) both fire for the same payment — or a request is retried —
-- this makes sure only one row per payment ever exists. Both edge functions
-- now upsert on this constraint instead of plain-inserting.
CREATE UNIQUE INDEX IF NOT EXISTS donations_razorpay_payment_id_uniq
ON public.donations (razorpay_payment_id)
WHERE razorpay_payment_id IS NOT NULL;

-- =====================================================
-- Remaining manual steps (not SQL — do these in the dashboards):
--
-- 1. Deploy the new webhook function:
--      supabase functions deploy razorpay-webhook
--
-- 2. In Razorpay Dashboard → Account & Settings → Webhooks → Add New Webhook:
--      URL:    https://yskoeapemjuyyvkhlbpm.supabase.co/functions/v1/razorpay-webhook
--      Events: payment.captured, payment.failed
--      Razorpay will show you a webhook secret when you save it — copy it.
--
-- 3. Set that secret on Supabase:
--      supabase secrets set RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxx
--
-- This webhook is now the source-of-truth confirmation — it fires from
-- Razorpay's servers directly, so a donation is recorded even if the
-- user's browser closes right after paying.
--
-- Also note: create-razorpay-order and verify-razorpay-payment now restrict
-- CORS to https://www.jeetrack.in only (was "*" before) — no SQL change,
-- just redeployed with the tighter header.
-- =====================================================
