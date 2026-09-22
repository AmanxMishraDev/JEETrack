import { triggerEdgeFunction } from '../lib/supabase.js';

export async function triggerMonthly(req, res) {
  const result = await triggerEdgeFunction('monthly-report', {});
  return res.status(200).json({ ok: true, result });
}

export async function triggerReview(req, res) {
  const result = await triggerEdgeFunction('monthly-report', { type: 'review' });
  return res.status(200).json({ ok: true, result });
}
