import { cors } from '../../../server/admin/lib/cors.js';
import { verifyToken, ADMIN_PASSWORD, ADMIN_TOKEN_SECRET } from '../../../server/admin/lib/auth.js';

import login from '../../../server/admin/handlers/login.js';
import stats from '../../../server/admin/handlers/stats.js';
import newUsers from '../../../server/admin/handlers/new-users.js';
import subjects from '../../../server/admin/handlers/subjects.js';
import exams from '../../../server/admin/handlers/exams.js';
import users from '../../../server/admin/handlers/users.js';
import demographics from '../../../server/admin/handlers/demographics.js';
import userDetail from '../../../server/admin/handlers/user-detail.js';
import { triggerMonthly, triggerReview } from '../../../server/admin/handlers/triggers.js';
import { getSiteConfig, saveSiteConfig } from '../../../server/admin/handlers/site-config.js';
import dbStats from '../../../server/admin/handlers/db-stats.js';
import { feedbackList, feedbackFeature, feedbackStats } from '../../../server/admin/handlers/feedback.js';
import retention from '../../../server/admin/handlers/retention.js';

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
