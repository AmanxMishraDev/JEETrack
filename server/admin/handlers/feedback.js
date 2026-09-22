import { sbQuery } from '../lib/supabase.js';
import { validate, schemas } from '../lib/validation.js';
import { cached, buildRoster } from '../lib/cache.js';
import { toISTMonthKey } from '../lib/dates.js';

export async function feedbackList(req, res) {
  const v = validate(schemas.feedback_list, req.query);
  if (!v.ok) return res.status(400).json({ error: v.error });
  const { limit, offset, hasText: hasTextRaw, rating, featuredOnly: featuredOnlyRaw } = v.data;
  const hasText = hasTextRaw === '1' || hasTextRaw === 'true';
  const ratingFilter = rating;
  const featuredOnly = featuredOnlyRaw === '1' || featuredOnlyRaw === 'true';


  let all;
  let testimonialColumnsMissing = false;
  try {
    all = await sbQuery(
      `feedback?select=id,user_id,subject,message,rating,featured,display_name,created_at&order=created_at.desc&limit=1000`
    );
  } catch (e) {

    testimonialColumnsMissing = true;
    all = await sbQuery(
      `feedback?select=id,user_id,subject,message,rating,created_at&order=created_at.desc&limit=1000`
    ).catch(() => []);
    all = all.map(f => ({ ...f, featured: false, display_name: null }));
  }

  let filtered = all;
  if (hasText) {
    filtered = filtered.filter(f => {
      const m = (f.message || '').trim().toLowerCase();
      return m && m !== '(no comment)';
    });
  }
  if (ratingFilter >= 1 && ratingFilter <= 5) {
    filtered = filtered.filter(f => Math.round(Number(f.rating)) === ratingFilter);
  }
  if (featuredOnly) {
    filtered = filtered.filter(f => !!f.featured);
  }

  const total = filtered.length;
  const page = filtered.slice(offset, offset + limit);


  const roster = await buildRoster().catch(() => []);
  const rosterMap = {};
  roster.forEach(u => { rosterMap[u.id] = u; });

  const enriched = page.map(f => ({
    ...f,
    account_name: rosterMap[f.user_id]?.name || f.email?.split('@')[0] || 'Anonymous',
    email: f.email || rosterMap[f.user_id]?.email || '',
  }));

  return res.status(200).json({
    feedbacks: enriched, total,
    ...(testimonialColumnsMissing ? { warning: 'featured/display_name columns not found on feedback table — run testimonials_supabase_schema.sql' } : {}),
  });
}

export async function feedbackFeature(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { id, featured } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing feedback id' });

  const payload = { featured: !!featured };

  if (featured) {
    try {
      const rows = await sbQuery(`feedback?id=eq.${encodeURIComponent(id)}&select=user_id`);
      const userId = rows?.[0]?.user_id;
      if (userId) {
        const roster = await buildRoster().catch(() => []);
        const user = roster.find(u => u.id === userId);
        payload.display_name = user?.name || (user?.email ? user.email.split('@')[0] : null) || 'JEETrack User';
      }
    } catch (e) { }
  }

  try {
    const updated = await sbQuery(`feedback?id=eq.${encodeURIComponent(id)}`, 'PATCH', payload);
    return res.status(200).json({ ok: true, feedback: updated?.[0] || null });
  } catch (e) {
    const hint = /column/i.test(e.message)
      ? ' — run testimonials_supabase_schema.sql to add the featured/display_name columns first'
      : '';
    return res.status(500).json({ error: 'Failed to update feedback: ' + e.message + hint });
  }
}

export async function feedbackStats(req, res) {
  const feedbacks = await cached('feedback_stats_raw', 60000, () => sbQuery(
    'feedback?select=id,user_id,subject,message,rating,created_at&order=created_at.desc&limit=500'
  ).catch(() => []));


  const categories = {};
  const keywords = {
    'Bug / Error':      ['bug','error','crash','broken','not working','issue','problem','fix'],
    'Feature Request':  ['feature','add','want','wish','would be nice','request','suggest','improve'],
    'AI Insights':      ['ai','insight','weekly','analysis','score'],
    'Mock Tests':       ['mock','test','mains','advanced','score','marks'],
    'Study Hours':      ['hours','study','time','heatmap'],
    'Backlog':          ['backlog','pending','clear'],
    'General Praise':   ['love','great','amazing','awesome','good','nice','excellent','best'],
    'UI / Design':      ['ui','design','dark','theme','color','font','look'],
  };

  feedbacks.forEach(f => {
    const text = ((f.subject||'') + ' ' + (f.message||'')).toLowerCase();
    let matched = false;
    for (const [cat, words] of Object.entries(keywords)) {
      if (words.some(w => text.includes(w))) {
        categories[cat] = (categories[cat] || 0) + 1;
        matched = true;
        break;
      }
    }
    if (!matched) categories['Other'] = (categories['Other'] || 0) + 1;
  });


  const byMonth = {};
  feedbacks.forEach(f => {
    const m = f.created_at ? toISTMonthKey(new Date(f.created_at)) : 'unknown';
    byMonth[m] = (byMonth[m] || 0) + 1;
  });


  const ratedItems = feedbacks.filter(f => f.rating != null && !isNaN(f.rating));
  const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratedItems.forEach(f => {
    const r = Math.round(Number(f.rating));
    if (r >= 1 && r <= 5) ratingDist[r]++;
  });
  const avgRating = ratedItems.length
    ? (ratedItems.reduce((s, f) => s + Number(f.rating), 0) / ratedItems.length).toFixed(1)
    : null;

  return res.status(200).json({
    total: feedbacks.length,
    categories,
    byMonth,
    ratingDist,
    avgRating,
    ratedCount: ratedItems.length,
    recent: feedbacks.slice(0, 10),
  });
}
