




const ADMIN_PASSWORD       = process.env.ADMIN_PASSWORD;
const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;


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


function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://admin.jeetrack.in');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}


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





async function sbAuthListAllUsers() {
  const perPage = 1000;
  let page = 1;
  let all = [];
  for (let i = 0; i < 20; i++) { 
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


function dateFrom(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}





const _cacheStore = {};
async function cached(key, ttlMs, fn) {
  const now = Date.now();
  const hit = _cacheStore[key];
  if (hit && now - hit.at < ttlMs) return hit.data;
  const data = await fn();
  _cacheStore[key] = { data, at: now };
  return data;
}

let _rosterCache = null, _rosterCacheAt = 0;
async function buildRoster({ fresh = false } = {}) {
  if (!fresh && _rosterCache && Date.now() - _rosterCacheAt < 30000) return _rosterCache;

  const [authUsers, prefs] = await Promise.all([
    sbAuthListAllUsers().catch(() => []),
    sbQuery('user_preferences?select=*').catch(() => []),
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


export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  
  if (req.method === 'POST' && typeof req.body === 'string') {
    try { req.body = JSON.parse(req.body); } catch {}
  }

  const { action } = req.query;

  
  if (action === 'login') {
    const { password } = req.body || {};
    if (password === ADMIN_PASSWORD) {
      return res.status(200).json({ ok: true, token: Buffer.from(ADMIN_PASSWORD).toString('base64') });
    }
    return res.status(401).json({ error: 'Wrong password' });
  }

  
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  const validToken = Buffer.from(ADMIN_PASSWORD).toString('base64');
  if (token !== validToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const days = parseInt(req.query.days || '7');

    
    
    if (action === 'stats') {
      const cutoff = dateFrom(days);

      const data = await cached(`stats_${days}`, 60000, async () => {
        const activePrefs = await sbQuery(
          `user_preferences?select=user_id,last_active_at&last_active_at=gte.${cutoff}T00:00:00Z`
        ).catch(() => []);

        const [
          totalUsers, totalTests, totalHours, totalBacklogs,
          totalTodos, totalFeedbacks,
          aiInsightsUsers,
        ] = await Promise.all([
          sbCount('user_preferences').catch(() => 0),
          sbCount('tests').catch(() => 0),
          sbCount('hours').catch(() => 0),
          sbCount('backlogs').catch(() => 0),
          sbCount('todos').catch(() => 0),
          sbCount('feedback').catch(() => 0),
          
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
          aiInsights:       aiInsightsCount,
          pageViews:        activePrefs.length,
        };
      });

      return res.status(200).json(data);
    }

    
    if (action === 'features') {
      const cutoff = dateFrom(days);

      const totalAll = await sbCount('user_preferences').catch(() => 1);

      
      const [testUsers, hoursUsers, backlogUsers, todoUsers, syllabusUsers, feedbackUsers, aiUsers] = await Promise.all([
        sbQuery(`tests?select=user_id&created_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
        sbQuery(`hours?select=user_id&created_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
        sbQuery(`backlogs?select=user_id&created_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
        sbQuery(`todos?select=user_id&created_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
        sbQuery(`syllabus?select=user_id&updated_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
        sbQuery(`feedback?select=user_id&created_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
        sbQuery(`user_preferences?select=user_id&ai_insights_count=gt.0&last_active_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
      ]);

      const uniq = (arr) => new Set(arr.map(r => r.user_id)).size;

      const features = [
        { feature: 'Mock Tests',  users: uniq(testUsers),     total: totalAll },
        { feature: 'Study Hours', users: uniq(hoursUsers),    total: totalAll },
        { feature: 'Backlog',     users: uniq(backlogUsers),  total: totalAll },
        { feature: 'To-Do',       users: uniq(todoUsers),     total: totalAll },
        { feature: 'Syllabus',    users: uniq(syllabusUsers), total: totalAll },
        { feature: 'AI Insights', users: uniq(aiUsers),       total: totalAll },
        { feature: 'Feedback',    users: uniq(feedbackUsers), total: totalAll },
      ].map(f => ({
        ...f,
        pct: totalAll > 0 ? Math.round((f.users / totalAll) * 100) : 0,
      })).sort((a, b) => b.pct - a.pct);

      
      const dauFeatures = [
        { feature: 'Mock Tests',  dauPct: Math.round(uniq(testUsers)     / totalAll * 100), dau: uniq(testUsers)     },
        { feature: 'Study Hours', dauPct: Math.round(uniq(hoursUsers)    / totalAll * 100), dau: uniq(hoursUsers)    },
        { feature: 'AI Insights', dauPct: Math.round(uniq(aiUsers)       / totalAll * 100), dau: uniq(aiUsers)       },
        { feature: 'Syllabus',    dauPct: Math.round(uniq(syllabusUsers) / totalAll * 100), dau: uniq(syllabusUsers) },
      ];

      return res.status(200).json({ features, dauFeatures, totalUsers: totalAll });
    }

    
    if (action === 'dau') {
      
      const prefs = await sbQuery('user_preferences?select=last_active_at').catch(() => []);
      const byDay = {};
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
      prefs.forEach(p => {
        if (!p.last_active_at) return;
        const d = new Date(p.last_active_at);
        if (d < cutoff) return;
        const key = d.toISOString().split('T')[0];
        byDay[key] = (byDay[key] || 0) + 1;
      });
      const labels = [], values = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        labels.push(key);
        values.push(byDay[key] || 0);
      }
      return res.status(200).json({ labels, values, source: 'supabase' });
    }

    
    
    if (action === 'new_users') {
      const authUsers = await sbAuthListAllUsers().catch(() => []);
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);

      
      const byDay = {};
      authUsers.forEach(u => {
        if (!u.created_at) return;
        const d = new Date(u.created_at);
        if (d < cutoff) return;
        const key = d.toISOString().split('T')[0];
        byDay[key] = (byDay[key] || 0) + 1;
      });

      
      const labels = [], values = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        labels.push(key);
        values.push(byDay[key] || 0);
      }

      const total = values.reduce((a, b) => a + b, 0);
      const avg   = days > 0 ? Math.round((total / days) * 10) / 10 : 0;
      const peak  = Math.max(...values, 0);
      const peakDay = labels[values.indexOf(peak)] || null;

      return res.status(200).json({ labels, values, total, avg, peak, peakDay });
    }
    
    if (action === 'pages') {
      const cutoff = dateFrom(days);
      const [tests, hours, backlogs, todos, syllabus, feedback, ai] = await Promise.all([
        sbQuery(`tests?select=user_id&created_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
        sbQuery(`hours?select=user_id&created_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
        sbQuery(`backlogs?select=user_id&created_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
        sbQuery(`todos?select=user_id&created_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
        sbQuery(`syllabus?select=user_id&updated_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
        sbQuery(`feedback?select=user_id&created_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
        sbQuery(`user_preferences?select=user_id&ai_insights_count=gt.0&last_active_at=gte.${cutoff}T00:00:00Z`).catch(() => []),
      ]);
      const uniq = arr => new Set(arr.map(r => r.user_id)).size;
      return res.status(200).json([
        { page: 'Mock Tests',  count: uniq(tests)    },
        { page: 'Study Hours', count: uniq(hours)    },
        { page: 'Backlog',     count: uniq(backlogs) },
        { page: 'To-Do',       count: uniq(todos)    },
        { page: 'Syllabus',    count: uniq(syllabus) },
        { page: 'AI Insights', count: uniq(ai)       },
        { page: 'Feedback',    count: uniq(feedback) },
      ].sort((a, b) => b.count - a.count));
    }

    
    
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

    
    
    
    if (action === 'funnel') {
      const [
        totalUsers,
        usersWithTests, usersWithHours, usersWithBacklogs,
        usersWithSyllabus, usersWithAI,
      ] = await Promise.all([
        
        sbCount('user_preferences').catch(() => 0),
        
        sbQuery('tests?select=user_id').catch(() => []),
        
        sbQuery('hours?select=user_id').catch(() => []),
        
        sbQuery('backlogs?select=user_id').catch(() => []),
        
        sbQuery('syllabus?select=user_id').catch(() => []),
        
        sbQuery('user_preferences?select=user_id&ai_insights_count=gt.0').catch(() => []),
      ]);

      const distinctTestUsers     = new Set(usersWithTests.map(r => r.user_id)).size;
      const distinctHoursUsers    = new Set(usersWithHours.map(r => r.user_id)).size;
      const distinctBacklogUsers  = new Set(usersWithBacklogs.map(r => r.user_id)).size;
      const distinctSyllabusUsers = new Set(usersWithSyllabus.map(r => r.user_id)).size;
      const distinctAIUsers       = new Set(usersWithAI.map(r => r.user_id)).size;

      return res.status(200).json([
        { event: 'user_signed_up',        label: 'Signed Up',            count: totalUsers },
        { event: 'mock_test_logged',      label: 'Logged Mock Test',      count: distinctTestUsers },
        { event: 'study_hours_logged',    label: 'Logged Study Hours',    count: distinctHoursUsers },
        { event: 'backlog_used',          label: 'Used Backlog',          count: distinctBacklogUsers },
        { event: 'syllabus_used',         label: 'Used Syllabus Tracker', count: distinctSyllabusUsers },
        { event: 'ai_insights_generated', label: 'Used AI Insights',      count: distinctAIUsers },
      ]);
    }

    
    
    
    if (action === 'users') {
      const page        = parseInt(req.query.page || '0');
      const pageSize     = parseInt(req.query.pageSize || '20');
      const search       = (req.query.search || '').toLowerCase().trim();
      const classFilter  = req.query.class_year || '';
      const coachFilter  = req.query.coaching || '';
      const sortBy       = req.query.sort || 'created_at'; 
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

    
    if (action === 'user_detail') {
      const { distinct_id } = req.query;
      if (!distinct_id) return res.status(400).json({ error: 'distinct_id required' });

      
      const [
        testsData, hoursData, syllabusData, backlogs, todos, feedbacks, streaks, prefs, authUsers
      ] = await Promise.all([
        sbQuery(`tests?select=*&user_id=eq.${distinct_id}&order=created_at.desc`).catch(() => []),
        sbQuery(`hours?select=*&user_id=eq.${distinct_id}&order=date.desc`).catch(() => []),
        sbQuery(`syllabus?select=*&user_id=eq.${distinct_id}`).catch(() => []),
        sbCount('backlogs', `user_id=eq.${distinct_id}`).catch(() => 0),
        sbCount('todos', `user_id=eq.${distinct_id}`).catch(() => 0),
        sbQuery(`feedback?select=*&user_id=eq.${distinct_id}&order=created_at.desc`).catch(() => []),
        sbQuery(`streaks?select=*&user_id=eq.${distinct_id}`).catch(() => []),
        sbQuery(`user_preferences?select=*&user_id=eq.${distinct_id}`).catch(() => []),
        buildRoster().catch(() => []),
      ]);

      const authUser = authUsers.find(u => u.id === distinct_id) || null;

      
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

    
    
    
    if (action === 'leaderboard') {
      const metric = req.query.metric || 'avgScore'; 

      const roster = await buildRoster();
      if (!roster.length) return res.status(200).json({ leaderboard: [], topper: null });

      const [allTests, allHours] = await Promise.all([
        sbQuery('tests?select=user_id,total,max,physics,chemistry,maths,exam,date').catch(() => []),
        sbQuery('hours?select=user_id,total,subject,date').catch(() => []),
      ]);

      
      const userTestMap = {};
      allTests.forEach(t => {
        if (!userTestMap[t.user_id]) userTestMap[t.user_id] = [];
        userTestMap[t.user_id].push(t);
      });

      
      const userHoursMap = {};
      allHours.forEach(h => {
        if (!userHoursMap[h.user_id]) userHoursMap[h.user_id] = [];
        userHoursMap[h.user_id].push(h);
      });

      const last30 = new Date(); last30.setDate(last30.getDate() - 30);

      
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
          activeDays,   
          last_active: u.last_active_at,
        };
      }).filter(e => e.totalTests > 0 || e.totalHours > 0); 

      
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

    
    
    
    
    if (action === 'consistency') {
      const windowDays = parseInt(req.query.window || '30');
      const roster = await buildRoster();
      if (!roster.length) return res.status(200).json({ users: [], dau: [], mostConsistent: null });

      const cutoffDate = dateFrom(windowDays);

      const [allTests, allHours] = await Promise.all([
        sbQuery(`tests?select=user_id,date&date=gte.${dateFrom(180)}`).catch(() => []),
        sbQuery(`hours?select=user_id,date&date=gte.${dateFrom(180)}`).catch(() => []),
      ]);

      
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

    
    if (action === 'trigger_monthly') {
      const result = await triggerEdgeFunction('monthly-report', {});
      return res.status(200).json({ ok: true, result });
    }

    
    if (action === 'trigger_review') {
      const result = await triggerEdgeFunction('monthly-report', { type: 'review' });
      return res.status(200).json({ ok: true, result });
    }

    
    if (action === 'db_stats') {
      const data = await cached('db_stats', 60000, async () => {
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

        return {
          totalTests:     tests,
          totalHours:     hours,
          totalBacklogs:  backlogs,
          totalTodos:     todos,
          totalSyllabus:  syllabus,
          totalFeedbacks: feedbackCount,
          emailReportsOn: emailOn,
          activeUsers7d:  active7d,
          totalPrefs:     prefs.length,
        };
      });

      return res.status(200).json(data);
    }


    
    if (action === 'feedback_list') {
      const limit  = parseInt(req.query.limit || '50');
      const offset = parseInt(req.query.offset || '0');

      
      
      const feedbacks = await sbQuery(
        `feedback?select=id,user_id,subject,message,rating,created_at&order=created_at.desc&limit=${limit}&offset=${offset}`
      ).catch(() => []);

      
      const total = await sbCount('feedback').catch(() => 0);

      
      const roster = await buildRoster().catch(() => []);
      const rosterMap = {};
      roster.forEach(u => { rosterMap[u.id] = u; });

      const enriched = feedbacks.map(f => ({
        ...f,
        display_name: rosterMap[f.user_id]?.name || f.email?.split('@')[0] || 'Anonymous',
        email: f.email || rosterMap[f.user_id]?.email || '',
      }));

      return res.status(200).json({ feedbacks: enriched, total });
    }

    
    if (action === 'feedback_stats') {
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
        'Syllabus':         ['syllabus','chapter','topic','subject'],
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
        const m = f.created_at?.slice(0, 7) || 'unknown';
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

    
    
    
    if (action === 'retention') {
      const roster = await buildRoster();
      if (!roster.length) return res.status(200).json({ d1: 0, d7: 0, d30: 0, cohorts: [] });

      const [allTests, allHours] = await cached('retention_raw', 60000, () => Promise.all([
        sbQuery(`tests?select=user_id,date&date=gte.${dateFrom(45)}`).catch(() => []),
        sbQuery(`hours?select=user_id,date&date=gte.${dateFrom(45)}`).catch(() => []),
      ]));

      
      const userDates = {};
      [...allTests, ...allHours].forEach(r => {
        if (!r.date) return;
        if (!userDates[r.user_id]) userDates[r.user_id] = new Set();
        userDates[r.user_id].add(r.date);
      });

      
      const d1Users = [], d7Users = [], d30Users = [];
      let d1Eligible = 0, d7Eligible = 0, d30Eligible = 0;

      const now = new Date();
      roster.forEach(u => {
        if (!u.created_at) return;
        const signup = new Date(u.created_at);
        const daysSinceSignup = Math.floor((now - signup) / 86400000);
        const dates = userDates[u.id] || new Set();

        const wasActiveOnDay = (n) => {
          const target = new Date(signup);
          target.setDate(target.getDate() + n);
          return dates.has(target.toISOString().split('T')[0]);
        };

        if (daysSinceSignup >= 1)  { d1Eligible++;  if (wasActiveOnDay(1))  d1Users.push(u.id); }
        if (daysSinceSignup >= 7)  { d7Eligible++;  if (wasActiveOnDay(7))  d7Users.push(u.id); }
        if (daysSinceSignup >= 30) { d30Eligible++; if (wasActiveOnDay(30)) d30Users.push(u.id); }
      });

      return res.status(200).json({
        d1:  d1Eligible  ? Math.round(d1Users.length  / d1Eligible  * 100) : 0,
        d7:  d7Eligible  ? Math.round(d7Users.length  / d7Eligible  * 100) : 0,
        d30: d30Eligible ? Math.round(d30Users.length / d30Eligible * 100) : 0,
        d1Eligible, d7Eligible, d30Eligible,
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });

  } catch (err) {
    console.error('[Admin API Error]', err);
    return res.status(500).json({ error: err.message });
  }
}
