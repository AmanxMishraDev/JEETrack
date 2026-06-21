// ============================================================
// JEETrack Admin API — api/admin.js
// ALL PostHog credentials stay server-side (env vars only)
// ============================================================

const POSTHOG_PERSONAL_KEY = process.env.POSTHOG_PERSONAL_KEY;
const POSTHOG_PROJECT_ID   = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_HOST         = process.env.POSTHOG_HOST || 'https://us.posthog.com';
const ADMIN_PASSWORD       = process.env.ADMIN_PASSWORD;
const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── CORS headers ─────────────────────────────────────────────
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://admin.jeetrack.in');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

// ── PostHog API helper ───────────────────────────────────────
async function phQuery(query) {
  const url = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${POSTHOG_PERSONAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PostHog ${res.status}: ${txt}`);
  }
  return res.json();
}

// ── PostHog Persons API (user list) ─────────────────────────
async function phPersons(limit = 100, offset = 0) {
  const url = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/persons/?limit=${limit}&offset=${offset}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${POSTHOG_PERSONAL_KEY}` }
  });
  if (!res.ok) throw new Error(`PostHog persons ${res.status}`);
  return res.json();
}

// ── PostHog Person Events ────────────────────────────────────
async function phPersonEvents(distinctId) {
  const url = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/events/?distinct_id=${encodeURIComponent(distinctId)}&limit=50`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${POSTHOG_PERSONAL_KEY}` }
  });
  if (!res.ok) throw new Error(`PostHog events ${res.status}`);
  return res.json();
}

// ── Supabase REST helper ──────────────────────────────────────
async function sbQuery(path, method = 'GET', body = null) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const opts = {
    method,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Supabase COUNT helper (uses Range header trick) ──────────
async function sbCount(table, filter = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*${filter ? '&' + filter : ''}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'count=exact',
      'Range-Unit': 'items',
      'Range': '0-0',
    },
  });
  const range = res.headers.get('content-range') || '0/0';
  return parseInt(range.split('/')[1] || '0', 10);
}

// ── Trigger Supabase Edge Function ───────────────────────────
async function triggerEdgeFunction(fnName, body = {}) {
  const url = `${SUPABASE_URL}/functions/v1/${fnName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { message: text }; }
}

// ── Helpers ──────────────────────────────────────────────────
function sumResults(res) {
  try {
    return (res?.results || []).reduce((acc, s) =>
      acc + (s?.data || []).reduce((a, b) => a + (b || 0), 0), 0);
  } catch { return 0; }
}

function maxResult(res) {
  try {
    return Math.max(...(res?.results || []).flatMap(s => s?.data || []).map(v => v || 0), 0);
  } catch { return 0; }
}

function dateFrom(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

// ── MAIN HANDLER ─────────────────────────────────────────────
export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Parse body manually (Vercel doesn't auto-parse JSON body)
  if (req.method === 'POST' && typeof req.body === 'string') {
    try { req.body = JSON.parse(req.body); } catch {}
  }

  const { action } = req.query;

  // ── AUTH: login is public ──────────────────────────────────
  if (action === 'login') {
    const { password } = req.body || {};
    if (password === ADMIN_PASSWORD) {
      return res.status(200).json({ ok: true, token: Buffer.from(ADMIN_PASSWORD).toString('base64') });
    }
    return res.status(401).json({ error: 'Wrong password' });
  }

  // All other actions require valid token
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  const validToken = Buffer.from(ADMIN_PASSWORD).toString('base64');
  if (token !== validToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const days = parseInt(req.query.days || '7');

    // ── OVERVIEW STATS ────────────────────────────────────────
    // Source of truth: Supabase for counts, PostHog for behavioral events
    if (action === 'stats') {
      const cutoff = dateFrom(days);

      const [
        totalUsers,
        totalTests,
        totalHours,
        totalBacklogs,
        totalTodos,
        totalChapters,
        totalFeedbacks,
        prefs,
        activeUsers,
        aiInsights,
        pageViews,
        onboardings,
      ] = await Promise.all([
        // Supabase: real user count from user_preferences
        sbCount('user_preferences').catch(() => 0),
        // Supabase: actual data counts (all time)
        sbCount('tests').catch(() => 0),
        sbCount('hours').catch(() => 0),
        sbCount('backlogs').catch(() => 0),
        sbCount('todos').catch(() => 0),
        sbCount('syllabus').catch(() => 0),        // chapters marked (syllabus table)
        sbCount('feedback').catch(() => 0),         // feedback table (no 's')
        // Supabase: active users in window
        sbQuery(`user_preferences?select=user_id,last_active_at&last_active_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
        // PostHog: behavioral events
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: cutoff }, series: [{ kind: 'EventsNode', event: '$pageview', math: 'dau' }] }).catch(() => null),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: cutoff }, series: [{ kind: 'EventsNode', event: 'ai_insights_generated', math: 'total' }] }).catch(() => null),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: cutoff }, series: [{ kind: 'EventsNode', event: 'page_viewed', math: 'total' }] }).catch(() => null),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: cutoff }, series: [{ kind: 'EventsNode', event: 'onboarding_completed', math: 'total' }] }).catch(() => null),
      ]);

      return res.status(200).json({
        totalUsers,
        activeUsers:  prefs.length || maxResult(activeUsers),
        mockTests:    totalTests,
        studyHours:   totalHours,
        aiInsights:   sumResults(aiInsights),
        chapters:     totalChapters,
        backlogs:     totalBacklogs,
        todos:        totalTodos,
        pageViews:    sumResults(pageViews),
        feedbacks:    totalFeedbacks,
        exports:      0,
        onboardings:  sumResults(onboardings),
      });
    }

    // ── FEATURE BREAKDOWN ─────────────────────────────────────
    // Mix: Supabase for data counts, PostHog for events that exist
    if (action === 'features') {
      const cutoff = dateFrom(days);

      const [
        sbTests, sbHours, sbBacklogs, sbTodos,
        phAI, phPage, phOnboard, phFeedback,
        phGoogleAuth, phPageViewed
      ] = await Promise.all([
        sbCount('tests').catch(() => 0),
        sbCount('hours').catch(() => 0),
        sbCount('backlogs').catch(() => 0),
        sbCount('todos').catch(() => 0),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: cutoff }, series: [{ kind: 'EventsNode', event: 'ai_insights_generated', math: 'total' }] }).catch(() => null),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: cutoff }, series: [{ kind: 'EventsNode', event: 'page_viewed', math: 'total' }] }).catch(() => null),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: cutoff }, series: [{ kind: 'EventsNode', event: 'onboarding_completed', math: 'total' }] }).catch(() => null),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: cutoff }, series: [{ kind: 'EventsNode', event: 'feedback_submitted', math: 'total' }] }).catch(() => null),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: cutoff }, series: [{ kind: 'EventsNode', event: 'google_auth_clicked', math: 'total' }] }).catch(() => null),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: cutoff }, series: [{ kind: 'EventsNode', event: 'page_viewed', math: 'total' }] }).catch(() => null),
      ]);

      const results = [
        { event: 'mock_test_logged',      count: sbTests },
        { event: 'study_hours_logged',    count: sbHours },
        { event: 'backlog_task_added',    count: sbBacklogs },
        { event: 'todo_task_added',       count: sbTodos },
        { event: 'ai_insights_generated', count: sumResults(phAI) },
        { event: 'page_viewed',           count: sumResults(phPageViewed) },
        { event: 'onboarding_completed',  count: sumResults(phOnboard) },
        { event: 'feedback_submitted',    count: sumResults(phFeedback) },
        { event: 'google_auth_clicked',   count: sumResults(phGoogleAuth) },
      ];

      return res.status(200).json(results.sort((a, b) => b.count - a.count));
    }

    // ── DAILY TREND (DAU) ─────────────────────────────────────
    if (action === 'dau') {
      const data = await phQuery({
        kind: 'TrendsQuery',
        dateRange: { date_from: dateFrom(days) },
        series: [{ kind: 'EventsNode', event: '$pageview', math: 'dau' }],
      });
      const series = data?.results?.[0];
      return res.status(200).json({
        labels: series?.days || series?.labels || [],
        values: series?.data || [],
      });
    }

    // ── PAGE VIEWS BREAKDOWN ──────────────────────────────────
    if (action === 'pages') {
      const pages = ['overview','mains','advanced','hours','insights','backlog','todo','syllabus','compare','settings'];
      const results = await Promise.all(
        pages.map(p => phQuery({
          kind: 'TrendsQuery',
          dateRange: { date_from: dateFrom(days) },
          series: [{ kind: 'EventsNode', event: 'page_viewed', math: 'total' }],
          breakdownFilter: { breakdown: 'page', breakdown_type: 'event' },
        }).then(r => {
          const s = (r?.results || []).find(x => String(x?.breakdown_value).toLowerCase() === p);
          return { page: p, count: (s?.data || []).reduce((a, b) => a + (b || 0), 0) };
        }).catch(() => ({ page: p, count: 0 })))
      );
      return res.status(200).json(results.sort((a, b) => b.count - a.count));
    }

    // ── SUBJECT BREAKDOWN ─────────────────────────────────────
    // Use Supabase hours table grouped by subject (more reliable)
    if (action === 'subjects') {
      const [phys, chem, math] = await Promise.all([
        sbCount('hours', 'subject=eq.physics').catch(() => 0),
        sbCount('hours', 'subject=eq.chemistry').catch(() => 0),
        sbCount('hours', 'subject=eq.maths').catch(() => 0),
      ]);
      return res.status(200).json([
        { subject: 'physics',   count: phys },
        { subject: 'chemistry', count: chem },
        { subject: 'maths',     count: math },
      ]);
    }

    // ── EXAM TYPE BREAKDOWN ───────────────────────────────────
    // Use Supabase tests table grouped by type
    if (action === 'exams') {
      const [mains, advanced] = await Promise.all([
        sbCount('tests', 'exam=eq.mains').catch(() => 0),
        sbCount('tests', 'exam=eq.advanced').catch(() => 0),
      ]);
      return res.status(200).json([
        { exam: 'mains',    count: mains },
        { exam: 'advanced', count: advanced },
      ]);
    }

    // ── FUNNEL ────────────────────────────────────────────────
    // Use Supabase for real data steps, PostHog for behavioral ones
    if (action === 'funnel') {
      const [
        totalUsers, onboardings,
        usersWithTests, usersWithHours, usersWithAI
      ] = await Promise.all([
        sbCount('user_preferences').catch(() => 0),
        // Distinct users who have logged at least one test
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: dateFrom(90) }, series: [{ kind: 'EventsNode', event: 'onboarding_completed', math: 'dau' }] }).catch(() => null),
        // Count distinct user_ids in tests table
        sbQuery('tests?select=user_id').catch(() => []),
        sbQuery('hours?select=user_id').catch(() => []),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: dateFrom(90) }, series: [{ kind: 'EventsNode', event: 'ai_insights_generated', math: 'dau' }] }).catch(() => null),
      ]);

      const distinctTestUsers  = new Set(usersWithTests.map(r => r.user_id)).size;
      const distinctHoursUsers = new Set(usersWithHours.map(r => r.user_id)).size;

      return res.status(200).json([
        { event: 'user_signed_up',        label: 'Signed Up',            count: totalUsers },
        { event: 'onboarding_completed',  label: 'Completed Onboarding', count: maxResult(onboardings) },
        { event: 'mock_test_logged',      label: 'Logged Mock Test',      count: distinctTestUsers },
        { event: 'study_hours_logged',    label: 'Logged Study Hours',    count: distinctHoursUsers },
        { event: 'ai_insights_generated', label: 'Used AI Insights',      count: maxResult(usersWithAI) },
      ]);
    }

    // ── USER LIST ─────────────────────────────────────────────
    if (action === 'users') {
      const page = parseInt(req.query.page || '0');
      const phData = await phPersons(50, page * 50);

      let prefs = [];
      try {
        prefs = await sbQuery('user_preferences?select=user_id,email_reports,last_active_at,report_last_sent_at');
      } catch(e) {}

      const prefsMap = {};
      prefs.forEach(p => { prefsMap[p.user_id] = p; });

      const users = (phData?.results || []).map(person => {
        const props = person.properties || {};
        const pref = prefsMap[person.distinct_ids?.[0]] || {};
        return {
          id:            person.distinct_ids?.[0] || person.id,
          name:          props.name || props.$name || 'Unknown',
          email:         props.email || props.$email || '',
          class:         props.class || '',
          target_year:   props.target_year || '',
          coaching:      props.coaching || '',
          created_at:    person.created_at,
          last_seen:     person.properties?.$last_seen,
          email_reports: pref.email_reports || 'off',
          last_active:   pref.last_active_at || '',
          report_sent:   pref.report_last_sent_at || '',
        };
      });

      return res.status(200).json({
        users,
        next: phData?.next || null,
        count: phData?.count || 0,
      });
    }

    // ── DEMOGRAPHICS ─────────────────────────────────────────
    // Aggregates class + coaching distribution from PostHog persons
    if (action === 'demographics') {
      // Fetch all persons (up to 250 — paginate if needed)
      const [p1, p2, p3, p4, p5] = await Promise.all([
        phPersons(100, 0),
        phPersons(100, 100),
        phPersons(100, 200),
        phPersons(100, 300),
        phPersons(100, 400),
      ]);
      const all = [
        ...(p1?.results||[]),
        ...(p2?.results||[]),
        ...(p3?.results||[]),
        ...(p4?.results||[]),
        ...(p5?.results||[]),
      ];
      const total = all.length;

      const classCount = {}, coachingCount = {}, yearCount = {};
      all.forEach(person => {
        const props = person.properties || {};
        const cls     = props.class     || 'Unknown';
        const coaching = props.coaching || 'Unknown';
        const year    = props.target_year || 'Unknown';
        classCount[cls]      = (classCount[cls]      || 0) + 1;
        coachingCount[coaching] = (coachingCount[coaching] || 0) + 1;
        yearCount[year]      = (yearCount[year]      || 0) + 1;
      });

      const toArr = (obj) => Object.entries(obj)
        .map(([label, count]) => ({ label, count, pct: total ? Math.round((count/total)*100) : 0 }))
        .sort((a, b) => b.count - a.count);

      return res.status(200).json({
        total,
        classes:   toArr(classCount),
        coachings: toArr(coachingCount),
        years:     toArr(yearCount),
      });
    }

    // ── USER DETAIL ───────────────────────────────────────────
    if (action === 'user_detail') {
      const { distinct_id } = req.query;
      if (!distinct_id) return res.status(400).json({ error: 'distinct_id required' });

      // Fetch everything in parallel
      const [
        testsData, hoursData, syllabus, backlogs, todos, feedbacks, streaks, prefs, aiCount
      ] = await Promise.all([
        sbQuery(`tests?select=*&user_id=eq.${distinct_id}&order=created_at.desc`).catch(() => []),
        sbQuery(`hours?select=*&user_id=eq.${distinct_id}&order=date.desc`).catch(() => []),
        sbCount('syllabus', `user_id=eq.${distinct_id}`).catch(() => 0),
        sbCount('backlogs', `user_id=eq.${distinct_id}`).catch(() => 0),
        sbCount('todos', `user_id=eq.${distinct_id}`).catch(() => 0),
        sbQuery(`feedback?select=*&user_id=eq.${distinct_id}&order=created_at.desc`).catch(() => []),
        sbQuery(`streaks?select=*&user_id=eq.${distinct_id}`).catch(() => []),
        sbQuery(`user_preferences?select=*&user_id=eq.${distinct_id}`).catch(() => []),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: '-90d' }, series: [{ kind: 'EventsNode', event: 'ai_insights_generated', math: 'total', properties: [{ key: 'distinct_id', value: distinct_id, operator: 'exact', type: 'person' }] }] }).catch(() => null),
      ]);

      // Compute test stats
      const totalTests = testsData.length;
      const mainsTests = testsData.filter(t => t.exam === 'mains');
      const advTests   = testsData.filter(t => t.exam === 'advanced');
      const avgTotal   = totalTests ? Math.round(testsData.reduce((s, t) => s + (t.total || 0), 0) / totalTests) : 0;
      const bestScore  = totalTests ? Math.max(...testsData.map(t => t.total || 0)) : 0;
      const avgPhysics = totalTests ? Math.round(testsData.reduce((s, t) => s + (t.physics || 0), 0) / totalTests) : 0;
      const avgChem    = totalTests ? Math.round(testsData.reduce((s, t) => s + (t.chemistry || 0), 0) / totalTests) : 0;
      const avgMaths   = totalTests ? Math.round(testsData.reduce((s, t) => s + (t.maths || 0), 0) / totalTests) : 0;

      // Compute study hours stats
      const totalHoursCount = hoursData.length;
      const totalHoursTime  = hoursData.reduce((s, h) => s + (h.total || 0), 0);
      const physHours = hoursData.filter(h => h.subject === 'physics').reduce((s, h) => s + (h.total || 0), 0);
      const chemHours = hoursData.filter(h => h.subject === 'chemistry').reduce((s, h) => s + (h.total || 0), 0);
      const mathHours = hoursData.filter(h => h.subject === 'maths').reduce((s, h) => s + (h.total || 0), 0);

      // Consistency: unique dates with activity in last 30 days
      const last30 = new Date(); last30.setDate(last30.getDate() - 30);
      const activeDates = new Set(hoursData.filter(h => h.date && new Date(h.date) > last30).map(h => h.date));
      const consistencyScore = activeDates.size; // days active out of last 30

      return res.status(200).json({
        tests: {
          total: totalTests,
          mains: mainsTests.length,
          advanced: advTests.length,
          avgScore: avgTotal,
          bestScore,
          avgPhysics, avgChem, avgMaths,
          recent: testsData.slice(0, 5).map(t => ({
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
        syllabus, backlogs, todos,
        aiInsights: sumResults(aiCount),
        consistency: { activeDaysLast30: consistencyScore },
        streak: streaks[0] || {},
        feedback: feedbacks,
        pref: prefs[0] || {},
      });
    }

    // ── LEADERBOARD ───────────────────────────────────────────
    if (action === 'leaderboard') {
      const metric = req.query.metric || 'avgScore'; // avgScore | bestScore | totalTests | totalHours

      // Get all users with prefs (name/email)
      const prefs = await sbQuery('user_preferences?select=user_id,last_active_at').catch(() => []);
      const userIds = prefs.map(p => p.user_id);

      if (!userIds.length) return res.status(200).json({ leaderboard: [] });

      // Fetch all tests and hours
      const [allTests, allHours, phPersonsData] = await Promise.all([
        sbQuery('tests?select=user_id,total,physics,chemistry,maths,exam,date').catch(() => []),
        sbQuery('hours?select=user_id,total,subject,date').catch(() => []),
        phPersons(100, 0).catch(() => ({ results: [] })),
      ]);

      // Build name map from PostHog
      const nameMap = {};
      (phPersonsData?.results || []).forEach(p => {
        const uid = p.distinct_ids?.[0];
        if (uid) {
          nameMap[uid] = {
            name:  p.properties?.name || p.properties?.$name || 'Anonymous',
            email: p.properties?.email || p.properties?.$email || '',
          };
        }
      });

      // Group tests by user
      const userTestMap = {};
      allTests.forEach(t => {
        if (!userTestMap[t.user_id]) userTestMap[t.user_id] = [];
        userTestMap[t.user_id].push(t);
      });

      // Group hours by user
      const userHoursMap = {};
      allHours.forEach(h => {
        if (!userHoursMap[h.user_id]) userHoursMap[h.user_id] = [];
        userHoursMap[h.user_id].push(h);
      });

      // Build leaderboard entries
      const entries = prefs.map(p => {
        const uid   = p.user_id;
        const tests = userTestMap[uid] || [];
        const hours = userHoursMap[uid] || [];
        const info  = nameMap[uid] || {};
        const totalHrsTime = hours.reduce((s, h) => s + (h.total || 0), 0);
        const avgScore  = tests.length ? Math.round(tests.reduce((s, t) => s + (t.total || 0), 0) / tests.length) : 0;
        const bestScore = tests.length ? Math.max(...tests.map(t => t.total || 0)) : 0;

        // Consistency: unique active days (hours entries) last 30 days
        const last30 = new Date(); last30.setDate(last30.getDate() - 30);
        const activeDays = new Set(hours.filter(h => h.date && new Date(h.date) > last30).map(h => h.date)).size;

        return {
          user_id:     uid,
          name:        info.name  || 'Anonymous',
          email:       info.email || '',
          totalTests:  tests.length,
          avgScore,
          bestScore,
          totalHours:  Math.round(totalHrsTime * 10) / 10,
          activeDays,   // consistency metric
          last_active: p.last_active_at,
        };
      }).filter(e => e.totalTests > 0 || e.totalHours > 0); // only users with data

      // Sort by requested metric
      const sortKey = {
        avgScore:   (a, b) => b.avgScore   - a.avgScore,
        bestScore:  (a, b) => b.bestScore  - a.bestScore,
        totalTests: (a, b) => b.totalTests - a.totalTests,
        totalHours: (a, b) => b.totalHours - a.totalHours,
        consistency:(a, b) => b.activeDays - a.activeDays,
      }[metric] || ((a, b) => b.avgScore - a.avgScore);

      entries.sort(sortKey);

      return res.status(200).json({ leaderboard: entries.slice(0, 50) });
    }

    // ── TRIGGER MONTHLY REPORT ────────────────────────────────
    if (action === 'trigger_monthly') {
      const result = await triggerEdgeFunction('monthly-report', {});
      return res.status(200).json({ ok: true, result });
    }

    // ── TRIGGER REVIEW EMAIL ──────────────────────────────────
    if (action === 'trigger_review') {
      const result = await triggerEdgeFunction('monthly-report', { type: 'review' });
      return res.status(200).json({ ok: true, result });
    }

    // ── SUPABASE DB STATS ─────────────────────────────────────
    if (action === 'db_stats') {
      const [tests, hours, backlogs, todos, syllabus, feedbackCount, prefs] = await Promise.all([
        sbCount('tests').catch(() => 0),
        sbCount('hours').catch(() => 0),
        sbCount('backlogs').catch(() => 0),
        sbCount('todos').catch(() => 0),
        sbCount('syllabus').catch(() => 0),
        sbCount('feedback').catch(() => 0),
        sbQuery('user_preferences?select=user_id,email_reports,last_active_at').catch(() => []),
      ]);

      const emailOn  = prefs.filter(p => p.email_reports === 'monthly').length;
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
      const active7d = prefs.filter(p => p.last_active_at && new Date(p.last_active_at) > cutoff).length;

      return res.status(200).json({
        totalTests:     tests,
        totalHours:     hours,
        totalBacklogs:  backlogs,
        totalTodos:     todos,
        totalSyllabus:  syllabus,
        totalFeedbacks: feedbackCount,
        emailReportsOn: emailOn,
        activeUsers7d:  active7d,
        totalPrefs:     prefs.length,
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });

  } catch (err) {
    console.error('[Admin API Error]', err);
    return res.status(500).json({ error: err.message });
  }
}
