import { sbQuery, sbCount, sbAuthGetUser } from '../lib/supabase.js';
import { validate, schemas } from '../lib/validation.js';
import { classLabel, coachingLabel, sourceLabel } from '../lib/labels.js';

export default async function userDetail(req, res) {
  const v = validate(schemas.user_detail, req.query);
  if (!v.ok) return res.status(400).json({ error: v.error });
  const { distinct_id } = v.data;
  const safeDistinctId = encodeURIComponent(distinct_id);


  const [
    testsData, hoursData, backlogs, todos, feedbacks, streaks, prefs, authUser, practiceLogsData
  ] = await Promise.all([
    sbQuery(`tests?select=*&user_id=eq.${safeDistinctId}&order=created_at.desc`).catch(() => []),
    sbQuery(`hours?select=*&user_id=eq.${safeDistinctId}&order=date.desc`).catch(() => []),
    sbCount('backlogs', `user_id=eq.${safeDistinctId}`).catch(() => 0),
    sbCount('todos', `user_id=eq.${safeDistinctId}`).catch(() => 0),
    sbQuery(`feedback?select=*&user_id=eq.${safeDistinctId}&order=created_at.desc`).catch(() => []),
    sbQuery(`streaks?select=*&user_id=eq.${safeDistinctId}`).catch(() => []),
    sbQuery(`user_preferences?select=*&user_id=eq.${safeDistinctId}`).catch(() => []),
    sbAuthGetUser(safeDistinctId).catch(() => null),
    sbQuery(`practice_logs?select=subject,questions&user_id=eq.${safeDistinctId}`).catch(() => []),
  ]);


  const totalTests = testsData.length;
  const mainsTests = testsData.filter(t => t.exam === 'mains');
  const advTests   = testsData.filter(t => t.exam === 'advanced');
  const avgTotal   = totalTests ? Math.round(testsData.reduce((s, t) => s + (t.total || 0), 0) / totalTests) : 0;
  const bestScore  = totalTests ? Math.max(...testsData.map(t => t.total || 0)) : 0;
  const avgPhysics = totalTests ? Math.round(testsData.reduce((s, t) => s + (t.physics || 0), 0) / totalTests) : 0;
  const avgChem    = totalTests ? Math.round(testsData.reduce((s, t) => s + (t.chemistry || 0), 0) / totalTests) : 0;
  const avgMaths   = totalTests ? Math.round(testsData.reduce((s, t) => s + (t.maths || 0), 0) / totalTests) : 0;
  const avgMaxPct  = totalTests
    ? Math.round(testsData.reduce((s, t) => s + (t.max ? (t.total||0)/t.max*100 : 0), 0) / totalTests)
    : 0;


  const totalHoursCount = hoursData.length;
  const totalHoursTime  = hoursData.reduce((s, h) => s + (h.total || 0), 0);
  const physHours = hoursData.filter(h => h.subject === 'physics').reduce((s, h) => s + (h.total || 0), 0);
  const chemHours = hoursData.filter(h => h.subject === 'chemistry').reduce((s, h) => s + (h.total || 0), 0);
  const mathHours = hoursData.filter(h => h.subject === 'maths').reduce((s, h) => s + (h.total || 0), 0);


  const totalQuestionsPracticed = practiceLogsData.reduce((s, p) => s + (p.questions || 0), 0);
  const physQuestions = practiceLogsData.filter(p => p.subject === 'physics').reduce((s, p) => s + (p.questions || 0), 0);
  const chemQuestions = practiceLogsData.filter(p => p.subject === 'chemistry').reduce((s, p) => s + (p.questions || 0), 0);
  const mathQuestions = practiceLogsData.filter(p => p.subject === 'maths').reduce((s, p) => s + (p.questions || 0), 0);


  const last30 = new Date(); last30.setDate(last30.getDate() - 30);
  const activityDates = new Set([
    ...hoursData.filter(h => h.date).map(h => h.date),
    ...testsData.filter(t => t.date).map(t => t.date),
  ]);
  const activeDaysLast30 = [...activityDates].filter(d => new Date(d) > last30).length;


  const sortedDates = [...activityDates].sort();
  let longestRun = 0, curRun = 0, prevDate = null;
  sortedDates.forEach(ds => {
    const d = new Date(ds);
    if (prevDate) {
      const diff = Math.round((d - prevDate) / 86400000);
      curRun = diff === 1 ? curRun + 1 : 1;
    } else {
      curRun = 1;
    }
    longestRun = Math.max(longestRun, curRun);
    prevDate = d;
  });

  const pref = prefs[0] || {};
  const email = authUser?.email || '';
  const name = pref.username || (email ? email.split('@')[0] : 'Unknown');

  return res.status(200).json({
    profile: {
      id: distinct_id,
      name,
      email,
      class: classLabel(pref.class_year),
      coaching: coachingLabel(pref.coaching),
      source: sourceLabel(pref.referral_source),
      study_mode: pref.study_mode || '',
      target_year: pref.target_year || '',
      created_at: authUser?.created_at || pref.created_at || null,
      last_active: pref.last_active_at || null,
      email_reports: pref.email_reports || 'off',
    },
    tests: {
      total: totalTests,
      mains: mainsTests.length,
      advanced: advTests.length,
      avgScore: avgTotal,
      avgScorePct: avgMaxPct,
      bestScore,
      avgPhysics, avgChem, avgMaths,
      recent: testsData.slice(0, 8).map(t => ({
        exam: t.exam, date: t.date, total: t.total, max: t.max,
        physics: t.physics, chemistry: t.chemistry, maths: t.maths
      })),
    },
    hours: {
      totalEntries: totalHoursCount,
      totalTime: Math.round(totalHoursTime * 10) / 10,
      physics: Math.round(physHours * 10) / 10,
      chemistry: Math.round(chemHours * 10) / 10,
      maths: Math.round(mathHours * 10) / 10,
    },
    practiceLog: {
      totalQuestions: totalQuestionsPracticed,
      physics: physQuestions,
      chemistry: chemQuestions,
      maths: mathQuestions,
    },
    backlogs, todos,
    aiInsights: pref?.ai_insights_count || 0,
    consistency: {
      activeDaysLast30,
      longestStreak: longestRun,
      totalActiveDays: activityDates.size,
    },
    streak: streaks[0] || {},
    feedback: feedbacks,
    pref,
  });
}
