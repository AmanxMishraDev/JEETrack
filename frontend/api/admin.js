// ============================================================
// JEETrack Admin API — api/admin.js
// ALL PostHog + Supabase credentials stay server-side (env vars only)
// ============================================================

const POSTHOG_PERSONAL_KEY = process.env.POSTHOG_PERSONAL_KEY;
const POSTHOG_PROJECT_ID   = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_HOST         = process.env.POSTHOG_HOST || 'https://us.posthog.com';
const ADMIN_PASSWORD       = process.env.ADMIN_PASSWORD;
const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Human-friendly labels for coaching institute ids (see COACHING_BY_MODE in app.js)
const COACHING_LABELS = {
  pw_online: 'PW Online', allen_online: 'Allen Online', unacademy: 'Unacademy',
  vedantu: 'Vedantu', aakash_online: 'Aakash Digital', motion_online: 'Motion Online',
  other_online: 'Other (Online)', pw_vidyapeeth: 'PW Vidyapeeth', allen: 'Allen',
  aakash: 'Aakash', fiitjee: 'FIITJEE', resonance: 'Resonance', vibrant: 'Vibrant Academy',
  motion: 'Motion', narayana: 'Narayana', sri_chaitanya: 'Sri Chaitanya',
  other_offline: 'Other (Offline)', self: 'Self Study',
};
function coachingLabel(id) {
  if (!id) return 'Not Set';
  return COACHING_LABELS[id] || id;
}
const CLASS_LABELS = { '11': 'Class 11', '12': 'Class 12', dropper: 'Dropper', other: 'Other' };
function classLabel(id) {
  if (!id) return 'Not Set';
  return CLASS_LABELS[id] || id;
}

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

// ── Supabase Auth Admin — list all users (paginated) ─────────
// Returns the full auth.users list ({ id, email, created_at, ... }).
// This is the only reliable source for email addresses — the
// user_preferences table never stores email itself.
async function sbAuthListAllUsers() {
  const perPage = 1000;
  let page = 1;
  let all = [];
  for (let i = 0; i < 20; i++) { // hard cap: 20k users
    const url = `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    if (!res.ok) throw new Error(`Supabase auth admin ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const users = data.users || [];
    all = all.concat(users);
    if (users.length < perPage) break;
    page++;
  }
  return all;
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

// Build a single combined roster: auth users + user_preferences, keyed by user_id.
// This is the backbone for Users / Demographics / Leaderboard / Consistency —
// all sourced from Supabase (reliable) instead of PostHog persons (often empty,
// since the app never actually calls posthog.identify with matching property names).
let _rosterCache = null, _rosterCacheAt = 0;
async function buildRoster({ fresh = false } = {}) {
  if (!fresh && _rosterCache && Date.now() - _rosterCacheAt < 30000) return _rosterCache;

  const [authUsers, prefs] = await Promise.all([
    sbAuthListAllUsers().catch(() => []),
    sbQuery('user_preferences?select=*').catch(() => []),
  ]);

  const prefMap = {};
  prefs.forEach(p => { prefMap[p.user_id] = p; });

  // Some users may have a user_preferences row but be missing from the
  // auth list (rare edge cases), or vice versa for brand-new signups. Union both.
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
    // Sourced from Supabase (auth.users + user_preferences) — reliable,
    // always populated, supports search + class/coaching filters + sorting.
    if (action === 'users') {
      const page        = parseInt(req.query.page || '0');
      const pageSize     = parseInt(req.query.pageSize || '20');
      const search       = (req.query.search || '').toLowerCase().trim();
      const classFilter  = req.query.class_year || '';
      const coachFilter  = req.query.coaching || '';
      const sortBy       = req.query.sort || 'created_at'; // created_at | last_active | name
      const sortDir      = req.query.dir === 'asc' ? 1 : -1;

      let roster = await buildRoster();

      if (search) {
        roster = roster.filter(u =>
          (u.name || '').toLowerCase().includes(search) ||
          (u.email || '').toLowerCase().includes(search)
        );
      }
      if (classFilter) roster = roster.filter(u => u.class_year === classFilter);
      if (coachFilter) roster = roster.filter(u => u.coaching === coachFilter);

      const toTime = (v) => v ? new Date(v).getTime() : 0;
      roster.sort((a, b) => {
        if (sortBy === 'name') return sortDir * (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'last_active') return sortDir === 1
          ? toTime(a.last_active_at) - toTime(b.last_active_at)
          : toTime(b.last_active_at) - toTime(a.last_active_at);
        return sortDir === 1
          ? toTime(a.created_at) - toTime(b.created_at)
          : toTime(b.created_at) - toTime(a.created_at);
      });

      const total = roster.length;
      const start = page * pageSize;
      const pageItems = roster.slice(start, start + pageSize);

      const users = pageItems.map(u => ({
        id:            u.id,
        name:          u.name,
        email:         u.email,
        class:         classLabel(u.class_year),
        class_year:    u.class_year,
        target_year:   u.target_year,
        coaching:      coachingLabel(u.coaching),
        coaching_id:   u.coaching,
        created_at:    u.created_at,
        last_active:   u.last_active_at,
        email_reports: u.email_reports,
      }));

      return res.status(200).json({
        users,
        count: total,
        page,
        pageSize,
        next: start + pageSize < total,
      });
    }

    // ── DEMOGRAPHICS ─────────────────────────────────────────
    // Class + coaching distribution, sourced from Supabase user_preferences
    // (PostHog person properties are never populated by the app, so they
    // are not a reliable source for this).
    if (action === 'demographics') {
      const roster = await buildRoster();
      const total = roster.length;

      const classCount = {}, coachingCount = {}, yearCount = {};
      roster.forEach(u => {
        const cls      = classLabel(u.class_year);
        const coaching = coachingLabel(u.coaching);
        const year     = u.target_year || 'Not Set';
        classCount[cls]         = (classCount[cls]         || 0) + 1;
        coachingCount[coaching] = (coachingCount[coaching] || 0) + 1;
        yearCount[year]         = (yearCount[year]         || 0) + 1;
      });

      const toArr = (obj) => Object.entries(obj)
        .map(([label, count]) => ({ label, count, pct: total ? Math.round((count/total)*1000)/10 : 0 }))
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
        testsData, hoursData, syllabusData, backlogs, todos, feedbacks, streaks, prefs, aiCount, authUsers
      ] = await Promise.all([
        sbQuery(`tests?select=*&user_id=eq.${distinct_id}&order=created_at.desc`).catch(() => []),
        sbQuery(`hours?select=*&user_id=eq.${distinct_id}&order=date.desc`).catch(() => []),
        sbQuery(`syllabus?select=*&user_id=eq.${distinct_id}`).catch(() => []),
        sbCount('backlogs', `user_id=eq.${distinct_id}`).catch(() => 0),
        sbCount('todos', `user_id=eq.${distinct_id}`).catch(() => 0),
        sbQuery(`feedback?select=*&user_id=eq.${distinct_id}&order=created_at.desc`).catch(() => []),
        sbQuery(`streaks?select=*&user_id=eq.${distinct_id}`).catch(() => []),
        sbQuery(`user_preferences?select=*&user_id=eq.${distinct_id}`).catch(() => []),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: '-90d' }, series: [{ kind: 'EventsNode', event: 'ai_insights_generated', math: 'total', properties: [{ key: 'distinct_id', value: distinct_id, operator: 'exact', type: 'person' }] }] }).catch(() => null),
        buildRoster().catch(() => []),
      ]);

      const authUser = authUsers.find(u => u.id === distinct_id) || null;

      // Compute test stats
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

      // Compute study hours stats
      const totalHoursCount = hoursData.length;
      const totalHoursTime  = hoursData.reduce((s, h) => s + (h.total || 0), 0);
      const physHours = hoursData.filter(h => h.subject === 'physics').reduce((s, h) => s + (h.total || 0), 0);
      const chemHours = hoursData.filter(h => h.subject === 'chemistry').reduce((s, h) => s + (h.total || 0), 0);
      const mathHours = hoursData.filter(h => h.subject === 'maths').reduce((s, h) => s + (h.total || 0), 0);

      // Syllabus completion: chapters synced per subject, marked done = theory && practice
      const subjects = ['physics', 'chemistry', 'maths'];
      const syllabusBySubject = subjects.map(s => {
        const rows = syllabusData.filter(r => r.subject === s);
        const done = rows.filter(r => r.theory && r.practice).length;
        return {
          subject: s,
          total: rows.length,
          done,
          pct: rows.length ? Math.round((done / rows.length) * 100) : 0,
        };
      });
      const syllabusTotalRows = syllabusData.length;
      const syllabusDoneRows  = syllabusData.filter(r => r.theory && r.practice).length;
      const syllabusOverallPct = syllabusTotalRows ? Math.round((syllabusDoneRows / syllabusTotalRows) * 100) : 0;

      // Consistency: unique active dates from hours + tests
      const last30 = new Date(); last30.setDate(last30.getDate() - 30);
      const activityDates = new Set([
        ...hoursData.filter(h => h.date).map(h => h.date),
        ...testsData.filter(t => t.date).map(t => t.date),
      ]);
      const activeDaysLast30 = [...activityDates].filter(d => new Date(d) > last30).length;

      // Longest streak of consecutive active days (from all logged dates)
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
        syllabus: {
          bySubject: syllabusBySubject,
          totalRows: syllabusTotalRows,
          doneRows: syllabusDoneRows,
          overallPct: syllabusOverallPct,
        },
        backlogs, todos,
        aiInsights: sumResults(aiCount),
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

    // ── LEADERBOARD ───────────────────────────────────────────
    // Sourced entirely from Supabase: user_preferences (+ auth) for identity,
    // tests/hours for performance metrics.
    if (action === 'leaderboard') {
      const metric = req.query.metric || 'avgScore'; // avgScore | avgScorePct | bestScore | totalTests | totalHours | consistency

      const roster = await buildRoster();
      if (!roster.length) return res.status(200).json({ leaderboard: [], topper: null });

      const [allTests, allHours] = await Promise.all([
        sbQuery('tests?select=user_id,total,max,physics,chemistry,maths,exam,date').catch(() => []),
        sbQuery('hours?select=user_id,total,subject,date').catch(() => []),
      ]);

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

      const last30 = new Date(); last30.setDate(last30.getDate() - 30);

      // Build leaderboard entries
      const entries = roster.map(u => {
        const uid   = u.id;
        const tests = userTestMap[uid] || [];
        const hours = userHoursMap[uid] || [];
        const totalHrsTime = hours.reduce((s, h) => s + (h.total || 0), 0);
        const avgScore  = tests.length ? Math.round(tests.reduce((s, t) => s + (t.total || 0), 0) / tests.length) : 0;
        const bestScore = tests.length ? Math.max(...tests.map(t => t.total || 0)) : 0;
        const avgScorePct = tests.length
          ? Math.round(tests.reduce((s, t) => s + (t.max ? (t.total||0)/t.max*100 : 0), 0) / tests.length)
          : 0;

        // Consistency: unique active days (hours entries) last 30 days
        const activeDays = new Set(hours.filter(h => h.date && new Date(h.date) > last30).map(h => h.date)).size;

        return {
          user_id:     uid,
          name:        u.name || 'Anonymous',
          email:       u.email || '',
          class:       classLabel(u.class_year),
          coaching:    coachingLabel(u.coaching),
          totalTests:  tests.length,
          avgScore,
          avgScorePct,
          bestScore,
          totalHours:  Math.round(totalHrsTime * 10) / 10,
          activeDays,   // consistency metric
          last_active: u.last_active_at,
        };
      }).filter(e => e.totalTests > 0 || e.totalHours > 0); // only users with data

      // Sort by requested metric
      const sortKey = {
        avgScore:    (a, b) => b.avgScore    - a.avgScore,
        avgScorePct: (a, b) => b.avgScorePct - a.avgScorePct,
        bestScore:   (a, b) => b.bestScore   - a.bestScore,
        totalTests:  (a, b) => b.totalTests  - a.totalTests,
        totalHours:  (a, b) => b.totalHours  - a.totalHours,
        consistency: (a, b) => b.activeDays  - a.activeDays,
      }[metric] || ((a, b) => b.avgScore - a.avgScore);

      entries.sort(sortKey);
      entries.forEach((e, i) => { e.rank = i + 1; });

      return res.status(200).json({
        leaderboard: entries.slice(0, 100),
        topper: entries[0] || null,
      });
    }

    // ── CONSISTENCY ANALYTICS ─────────────────────────────────
    // Daily-active tracking, streaks, and overall consistency ranking.
    // Activity = any tests/hours row logged on that date (best available
    // proxy for "opened the app and used it that day").
    if (action === 'consistency') {
      const windowDays = parseInt(req.query.window || '30');
      const roster = await buildRoster();
      if (!roster.length) return res.status(200).json({ users: [], dau: [], mostConsistent: null });

      const cutoffDate = dateFrom(windowDays);

      const [allTests, allHours] = await Promise.all([
        sbQuery(`tests?select=user_id,date&date=gte.${dateFrom(180)}`).catch(() => []),
        sbQuery(`hours?select=user_id,date&date=gte.${dateFrom(180)}`).catch(() => []),
      ]);

      // Map user_id -> Set of active dates (capped to last 180d fetched)
      const userDates = {};
      [...allTests, ...allHours].forEach(r => {
        if (!r.date) return;
        if (!userDates[r.user_id]) userDates[r.user_id] = new Set();
        userDates[r.user_id].add(r.date);
      });

      const todayStr = new Date().toISOString().split('T')[0];

      const users = roster.map(u => {
        const dates = userDates[u.id] || new Set();
        const datesArr = [...dates].sort();
        const activeInWindow = datesArr.filter(d => d >= cutoffDate).length;

        // Longest consecutive-day streak (all available history)
        let longest = 0, cur = 0, prev = null;
        datesArr.forEach(ds => {
          const d = new Date(ds);
          if (prev) {
            const diff = Math.round((d - prev) / 86400000);
            cur = diff === 1 ? cur + 1 : 1;
          } else cur = 1;
          longest = Math.max(longest, cur);
          prev = d;
        });

        // Current streak: consecutive days ending today or yesterday
        let current = 0;
        if (datesArr.length) {
          const cursor = new Date(todayStr);
          const offset = dates.has(todayStr) ? 0 : 1;
          cursor.setDate(cursor.getDate() - offset);
          while (dates.has(cursor.toISOString().split('T')[0])) {
            current++;
            cursor.setDate(cursor.getDate() - 1);
          }
        }

        return {
          user_id: u.id,
          name: u.name || 'Anonymous',
          email: u.email || '',
          class: classLabel(u.class_year),
          coaching: coachingLabel(u.coaching),
          activeDaysInWindow: activeInWindow,
          windowDays,
          longestStreak: longest,
          currentStreak: current,
          totalActiveDays: datesArr.length,
          lastActiveDate: datesArr[datesArr.length - 1] || null,
        };
      }).filter(u => u.totalActiveDays > 0);

      users.sort((a, b) => b.currentStreak - a.currentStreak || b.activeDaysInWindow - a.activeDaysInWindow);
      users.forEach((u, i) => { u.rank = i + 1; });

      // DAU trend for the window: how many distinct users were active each day
      const dauMap = {};
      Object.entries(userDates).forEach(([uid, dates]) => {
        dates.forEach(d => {
          if (d < cutoffDate) return;
          dauMap[d] = (dauMap[d] || 0) + 1;
        });
      });
      const dauLabels = Object.keys(dauMap).sort();
      const dau = dauLabels.map(d => ({ date: d, count: dauMap[d] }));

      return res.status(200).json({
        users: users.slice(0, 100),
        mostConsistent: users[0] || null,
        dau,
      });
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
