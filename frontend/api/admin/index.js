import { cors } from './lib/cors.js';
import { verifyToken, ADMIN_PASSWORD, ADMIN_TOKEN_SECRET } from './lib/auth.js';

import login from './handlers/login.js';
import stats from './handlers/stats.js';
import newUsers from './handlers/new-users.js';
import subjects from './handlers/subjects.js';
import exams from './handlers/exams.js';
import users from './handlers/users.js';
import demographics from './handlers/demographics.js';
import userDetail from './handlers/user-detail.js';
import { triggerMonthly, triggerReview } from './handlers/triggers.js';
import { getSiteConfig, saveSiteConfig } from './handlers/site-config.js';
import dbStats from './handlers/db-stats.js';
import { feedbackList, feedbackFeature, feedbackStats } from './handlers/feedback.js';
import retention from './handlers/retention.js';

// Every authenticated action, keyed by `?action=`. `login` is handled
// separately below since it runs *before* the token gate. Actions removed
// in earlier phases (features/dau/pages/funnel/leaderboard/consistency —
// see the notes that used to live next to each in the old admin.js, now
// preserved in git history) simply have no entry here, so they fall
// through to the "Unknown action" 400 same as any typo would.
const actions = {
  stats,
  new_users: newUsers,
  subjects,
  exams,
  users,
  demographics,
  user_detail: userDetail,
  trigger_monthly: triggerMonthly,
  trigger_review: triggerReview,
  get_site_config: getSiteConfig,
  save_site_config: saveSiteConfig,
  db_stats: dbStats,
  feedback_list: feedbackList,
  feedback_feature: feedbackFeature,
  feedback_stats: feedbackStats,
  retention,
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!ADMIN_PASSWORD || !ADMIN_TOKEN_SECRET) {
    console.error('[Admin API] Missing required env var(s): ADMIN_PASSWORD and ADMIN_TOKEN_SECRET must both be set (and be different values)');
    return res.status(500).json({ error: 'Server misconfigured' });
  }


  if (req.method === 'POST' && typeof req.body === 'string') {
    try { req.body = JSON.parse(req.body); } catch {}
  }

  const { action } = req.query;


  if (action === 'login') {
    return login(req, res);
  }


  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const run = actions[action];
  if (!run) {
    return res.status(400).json({ error: `Unknown action: ${action}` });
  }

  try {
    return await run(req, res);
  } catch (err) {
    console.error('[Admin API Error]', err);
    return res.status(500).json({ error: 'Something went wrong. Check server logs.' });
  }
}
