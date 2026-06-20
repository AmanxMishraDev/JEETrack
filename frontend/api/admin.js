// ============================================================
// JEETrack Admin API — api/admin.js
// Place at: frontend/api/admin.js
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

// ── Supabase helper ──────────────────────────────────────────
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
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
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

  // ── AUTH CHECK ──────────────────────────────────────────────
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');

  // action=login is public
  const { action } = req.query;

  if (action === 'login') {
    const { password } = req.body || {};
    if (password === ADMIN_PASSWORD) {
      return res.status(200).json({ ok: true, token: Buffer.from(ADMIN_PASSWORD).toString('base64') });
    }
    return res.status(401).json({ error: 'Wrong password' });
  }

  // All other actions require valid token
  const validToken = Buffer.from(ADMIN_PASSWORD).toString('base64');
  if (token !== validToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const days = parseInt(req.query.days || '7');

    // ── OVERVIEW STATS ──────────────────────────────────────
    if (action === 'stats') {
      const [
        signups, activeUsers, mockTests, studyHours,
        aiInsights, chapters, backlogs, todos,
        pageViews, feedbacks, exports, onboardings
      ] = await Promise.all([
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: '-1y' }, series: [{ kind: 'EventsNode', event: 'user_signed_up', math: 'total' }] }),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: dateFrom(days) }, series: [{ kind: 'EventsNode', event: '$pageview', math: 'dau' }] }),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: dateFrom(days) }, series: [{ kind: 'EventsNode', event: 'mock_test_logged', math: 'total' }] }),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: dateFrom(days) }, series: [{ kind: 'EventsNode', event: 'study_hours_logged', math: 'total' }] }),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: dateFrom(days) }, series: [{ kind: 'EventsNode', event: 'ai_insights_generated', math: 'total' }] }),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: dateFrom(days) }, series: [{ kind: 'EventsNode', event: 'chapter_marked', math: 'total' }] }),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: dateFrom(days) }, series: [{ kind: 'EventsNode', event: 'backlog_task_added', math: 'total' }] }),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: dateFrom(days) }, series: [{ kind: 'EventsNode', event: 'todo_task_added', math: 'total' }] }),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: dateFrom(days) }, series: [{ kind: 'EventsNode', event: 'page_viewed', math: 'total' }] }),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: dateFrom(days) }, series: [{ kind: 'EventsNode', event: 'feedback_submitted', math: 'total' }] }),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: dateFrom(days) }, series: [{ kind: 'EventsNode', event: 'data_exported', math: 'total' }] }),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: dateFrom(days) }, series: [{ kind: 'EventsNode', event: 'onboarding_completed', math: 'total' }] }),
      ]);

      return res.status(200).json({
        totalUsers:    sumResults(signups),
        activeUsers:   maxResult(activeUsers),
        mockTests:     sumResults(mockTests),
        studyHours:    sumResults(studyHours),
        aiInsights:    sumResults(aiInsights),
        chapters:      sumResults(chapters),
        backlogs:      sumResults(backlogs),
        todos:         sumResults(todos),
        pageViews:     sumResults(pageViews),
        feedbacks:     sumResults(feedbacks),
        exports:       sumResults(exports),
        onboardings:   sumResults(onboardings),
      });
    }

    // ── FEATURE BREAKDOWN ───────────────────────────────────
    if (action === 'features') {
      const events = [
        'mock_test_logged', 'study_hours_logged', 'chapter_marked',
        'ai_insights_generated', 'backlog_task_added', 'backlog_task_cleared',
        'todo_task_added', 'todo_task_completed', 'page_viewed',
        'user_signed_up', 'user_logged_in', 'onboarding_completed',
        'feedback_submitted', 'data_exported', 'google_auth_clicked',
      ];
      const results = await Promise.all(
        events.map(ev => phQuery({
          kind: 'TrendsQuery',
          dateRange: { date_from: dateFrom(days) },
          series: [{ kind: 'EventsNode', event: ev, math: 'total' }],
        }).then(r => ({ event: ev, count: sumResults(r) })).catch(() => ({ event: ev, count: 0 })))
      );
      return res.status(200).json(results.sort((a, b) => b.count - a.count));
    }

    // ── DAILY TREND (DAU) ───────────────────────────────────
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

    // ── PAGE VIEWS BREAKDOWN ────────────────────────────────
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

    // ── SUBJECT BREAKDOWN ───────────────────────────────────
    if (action === 'subjects') {
      const data = await phQuery({
        kind: 'TrendsQuery',
        dateRange: { date_from: dateFrom(days) },
        series: [{ kind: 'EventsNode', event: 'chapter_marked', math: 'total' }],
        breakdownFilter: { breakdown: 'subject', breakdown_type: 'event' },
      });
      const subjects = ['physics', 'chemistry', 'maths'];
      return res.status(200).json(subjects.map(s => {
        const series = (data?.results || []).find(x => String(x?.breakdown_value).toLowerCase() === s);
        return { subject: s, count: (series?.data || []).reduce((a, b) => a + (b || 0), 0) };
      }));
    }

    // ── EXAM TYPE BREAKDOWN ─────────────────────────────────
    if (action === 'exams') {
      const data = await phQuery({
        kind: 'TrendsQuery',
        dateRange: { date_from: dateFrom(days) },
        series: [{ kind: 'EventsNode', event: 'mock_test_logged', math: 'total' }],
        breakdownFilter: { breakdown: 'exam_type', breakdown_type: 'event' },
      });
      const exams = ['mains', 'advanced'];
      return res.status(200).json(exams.map(e => {
        const series = (data?.results || []).find(x => String(x?.breakdown_value).toLowerCase() === e);
        return { exam: e, count: (series?.data || []).reduce((a, b) => a + (b || 0), 0) };
      }));
    }

    // ── FUNNEL ──────────────────────────────────────────────
    if (action === 'funnel') {
      const steps = [
        { event: 'user_signed_up',        label: 'Signed Up' },
        { event: 'onboarding_completed',  label: 'Completed Onboarding' },
        { event: 'app_opened',            label: 'Opened App' },
        { event: 'mock_test_logged',      label: 'Logged Mock Test' },
        { event: 'study_hours_logged',    label: 'Logged Study Hours' },
        { event: 'ai_insights_generated', label: 'Used AI Insights' },
        { event: 'chapter_marked',        label: 'Marked Chapter' },
      ];
      const counts = await Promise.all(
        steps.map(s => phQuery({
          kind: 'TrendsQuery',
          dateRange: { date_from: dateFrom(90) },
          series: [{ kind: 'EventsNode', event: s.event, math: 'dau' }],
        }).then(r => maxResult(r)).catch(() => 0))
      );
      return res.status(200).json(steps.map((s, i) => ({ ...s, count: counts[i] })));
    }

    // ── USER LIST ───────────────────────────────────────────
    if (action === 'users') {
      const page = parseInt(req.query.page || '0');
      const phData = await phPersons(50, page * 50);

      // Also get Supabase user_preferences for email report status
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

    // ── USER DETAIL ─────────────────────────────────────────
    if (action === 'user_detail') {
      const { distinct_id } = req.query;
      if (!distinct_id) return res.status(400).json({ error: 'distinct_id required' });

      const events = await phPersonEvents(distinct_id);
      const eventList = (events?.results || []).map(e => ({
        event:      e.event,
        timestamp:  e.timestamp,
        properties: e.properties,
      }));

      // Per-user stats from PostHog
      const userStats = await Promise.all([
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: '-1y' }, series: [{ kind: 'EventsNode', event: 'mock_test_logged', math: 'total' }], filterTestAccounts: false }),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: '-1y' }, series: [{ kind: 'EventsNode', event: 'study_hours_logged', math: 'total' }], filterTestAccounts: false }),
        phQuery({ kind: 'TrendsQuery', dateRange: { date_from: '-1y' }, series: [{ kind: 'EventsNode', event: 'ai_insights_generated', math: 'total' }], filterTestAccounts: false }),
      ].map(p => p.catch(() => null)));

      return res.status(200).json({ events: eventList, userStats });
    }

    // ── TRIGGER MONTHLY REPORT ──────────────────────────────
    if (action === 'trigger_monthly') {
      const result = await triggerEdgeFunction('monthly-report', {});
      return res.status(200).json({ ok: true, result });
    }

    // ── TRIGGER REVIEW EMAIL ────────────────────────────────
    if (action === 'trigger_review') {
      // Send review prompt to all active users via Supabase edge function
      const result = await triggerEdgeFunction('monthly-report', { type: 'review' });
      return res.status(200).json({ ok: true, result });
    }

    // ── SUPABASE USER STATS ─────────────────────────────────
    if (action === 'db_stats') {
      const [tests, hours, backlogs, todos, syllabus, prefs] = await Promise.all([
        sbQuery('tests?select=count').catch(() => [{ count: 0 }]),
        sbQuery('hours?select=count').catch(() => [{ count: 0 }]),
        sbQuery('backlogs?select=count').catch(() => [{ count: 0 }]),
        sbQuery('todos?select=count').catch(() => [{ count: 0 }]),
        sbQuery('syllabus?select=count').catch(() => [{ count: 0 }]),
        sbQuery('user_preferences?select=user_id,email_reports,last_active_at').catch(() => []),
      ]);

      const emailOn  = prefs.filter(p => p.email_reports === 'monthly').length;
      const active7d = prefs.filter(p => {
        if (!p.last_active_at) return false;
        const d = new Date(p.last_active_at);
        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
        return d > cutoff;
      }).length;

      return res.status(200).json({
        totalTests:    tests?.[0]?.count || 0,
        totalHours:    hours?.[0]?.count || 0,
        totalBacklogs: backlogs?.[0]?.count || 0,
        totalTodos:    todos?.[0]?.count || 0,
        totalSyllabus: syllabus?.[0]?.count || 0,
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
