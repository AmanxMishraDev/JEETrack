import { sbQuery, sbAuthListAllUsers } from './supabase.js';

const _cacheStore = {};
export async function cached(key, ttlMs, fn) {
  const now = Date.now();
  const hit = _cacheStore[key];
  if (hit && now - hit.at < ttlMs) return hit.data;
  const data = await fn();
  _cacheStore[key] = { data, at: now };
  return data;
}

let _rosterCache = null, _rosterCacheAt = 0;
export async function buildRoster({ fresh = false } = {}) {
  if (!fresh && _rosterCache && Date.now() - _rosterCacheAt < 30000) return _rosterCache;

  const [authUsers, prefs] = await Promise.all([
    sbAuthListAllUsers().catch(() => []),
    sbQuery('user_preferences?select=user_id,username,class_year,coaching,study_mode,referral_source,target_year,email_reports,last_active_at,onboarding_done,created_at').catch(() => []),
  ]);

  const prefMap = {};
  prefs.forEach(p => { prefMap[p.user_id] = p; });



  const ids = new Set([...authUsers.map(u => u.id), ...prefs.map(p => p.user_id)]);
  const authMap = {};
  authUsers.forEach(u => { authMap[u.id] = u; });

  const roster = [...ids].map(id => {
    const a = authMap[id] || {};
    const p = prefMap[id] || {};
    return {
      id,
      email: a.email || '',
      created_at: a.created_at || p.created_at || null,
      name: p.username || (a.email ? a.email.split('@')[0] : 'Unknown'),
      class_year: p.class_year || '',
      coaching: p.coaching || '',
      study_mode: p.study_mode || '',
      referral_source: p.referral_source || '',
      target_year: p.target_year || '',
      email_reports: p.email_reports || 'off',
      last_active_at: p.last_active_at || null,
      onboarding_done: !!p.onboarding_done,
    };
  });

  _rosterCache = roster;
  _rosterCacheAt = Date.now();
  return roster;
}
