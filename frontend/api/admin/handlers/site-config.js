import { sbQuery } from '../lib/supabase.js';

const DEFAULTS = {
  mock_tests_count: 3000,
  study_hours_count: 15000,
  backlogs_count: 4000,
  questions_practiced_count: 50000,
  reviews_count: 1000,
  avg_rating: 4.8,
  app_version: 'v2.0',
  monthly_infra_cost: 0,
};

export async function getSiteConfig(req, res) {
  try {
    const rows = await sbQuery('app_config?id=eq.1&select=*');
    const row = (rows && rows[0]) || {};
    return res.status(200).json({ ...DEFAULTS, ...row });
  } catch (e) {

    return res.status(200).json(DEFAULTS);
  }
}

export async function saveSiteConfig(req, res) {
  const body = req.body || {};
  const allowedInts = ['mock_tests_count', 'study_hours_count', 'backlogs_count', 'questions_practiced_count', 'reviews_count'];
  const payload = {};

  allowedInts.forEach((k) => {
    if (body[k] === undefined || body[k] === null || body[k] === '') return;
    const n = parseInt(body[k], 10);
    if (!isNaN(n) && n >= 0) payload[k] = n;
  });
  if (body.avg_rating !== undefined && body.avg_rating !== null && body.avg_rating !== '') {
    const r = parseFloat(body.avg_rating);
    if (!isNaN(r)) payload.avg_rating = Math.max(0, Math.min(5, Math.round(r * 10) / 10));
  }
  if (body.app_version !== undefined && body.app_version !== null && body.app_version !== '') {
    payload.app_version = String(body.app_version).trim().slice(0, 20);
  }
  if (body.monthly_infra_cost !== undefined && body.monthly_infra_cost !== null && body.monthly_infra_cost !== '') {
    const c = parseFloat(body.monthly_infra_cost);
    if (!isNaN(c) && c >= 0) payload.monthly_infra_cost = Math.round(c * 100) / 100;
  }

  if (!Object.keys(payload).length) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  payload.updated_at = new Date().toISOString();

  try {

    const updated = await sbQuery('app_config?id=eq.1', 'PATCH', payload);
    if (updated && updated.length) {
      return res.status(200).json({ ok: true, config: updated[0] });
    }

    const inserted = await sbQuery('app_config', 'POST', { id: 1, ...payload });
    return res.status(200).json({ ok: true, config: inserted[0] });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save config: ' + e.message });
  }
}
