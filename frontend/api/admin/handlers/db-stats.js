import { sbQuery, sbCount } from '../lib/supabase.js';
import { cached } from '../lib/cache.js';

export default async function dbStats(req, res) {
  const data = await cached('db_stats', 60000, async () => {
    const [tests, hours, backlogs, todos, feedbackCount, prefs] = await Promise.all([
      sbCount('tests').catch(() => 0),
      sbCount('hours').catch(() => 0),
      sbCount('backlogs').catch(() => 0),
      sbCount('todos').catch(() => 0),
      sbCount('feedback').catch(() => 0),
      sbQuery('user_preferences?select=user_id,email_reports,last_active_at').catch(() => []),
    ]);

    const emailOn  = prefs.filter(p => p.email_reports === 'monthly').length;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    const active7d = prefs.filter(p => p.last_active_at && new Date(p.last_active_at) > cutoff).length;

    return {
      totalTests:     tests,
      totalHours:     hours,
      totalBacklogs:  backlogs,
      totalTodos:     todos,
      totalFeedbacks: feedbackCount,
      emailReportsOn: emailOn,
      activeUsers7d:  active7d,
      totalPrefs:     prefs.length,
    };
  });

  return res.status(200).json(data);
}
