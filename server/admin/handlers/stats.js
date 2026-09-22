import { sbQuery, sbCount, sbSum } from '../lib/supabase.js';
import { cached } from '../lib/cache.js';
import { dateFrom } from '../lib/dates.js';

export default async function stats(req, res) {
  const days = parseInt(req.query.days || '7');
  const cutoff = dateFrom(days);

  const data = await cached(`stats_${days}`, 60000, async () => {
    const activePrefs = await sbQuery(
      `user_preferences?select=user_id,last_active_at&last_active_at=gte.${cutoff}T00:00:00Z`
    ).catch(() => []);

    const [
      totalUsers, totalTests, totalHours, totalBacklogs,
      totalTodos, totalFeedbacks, totalQuestionsPracticed,
      aiInsightsUsers,
    ] = await Promise.all([
      sbCount('user_preferences').catch(() => 0),
      sbCount('tests').catch(() => 0),
      sbCount('hours').catch(() => 0),
      sbCount('backlogs').catch(() => 0),
      sbCount('todos').catch(() => 0),
      sbCount('feedback').catch(() => 0),
      sbSum('practice_logs', 'questions').catch(() => 0),

      sbQuery(`user_preferences?select=user_id&ai_insights_count=gt.0`).catch(() => []),
    ]);


    const aiInsightsCount = new Set(aiInsightsUsers.map(u => u.user_id)).size;

    return {
      totalUsers,
      activeUsers:      activePrefs.length,
      mockTests:        totalTests,
      studyHours:       totalHours,
      backlogs:         totalBacklogs,
      todos:            totalTodos,
      feedbacks:        totalFeedbacks,
      questionsPracticed: totalQuestionsPracticed,
      aiInsights:       aiInsightsCount,
      pageViews:        activePrefs.length,
    };
  });

  return res.status(200).json(data);
}
