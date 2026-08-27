




import crypto from 'node:crypto';




const ADMIN_PASSWORD       = process.env.ADMIN_PASSWORD;
const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || ADMIN_PASSWORD;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; 

function safeCompare(a, b) {
  const aBuf = Buffer.from(String(a || ''));
  const bBuf = Buffer.from(String(b || ''));
  
  if (aBuf.length !== bBuf.length) {
    crypto.timingSafeEqual(aBuf, Buffer.alloc(aBuf.length));
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  let payload;
  try { payload = JSON.parse(Buffer.from(body, 'base64url').toString()); } catch { return null; }
  if (!payload || !payload.exp || Date.now() > payload.exp) return null;
  return payload;
}


const _loginAttempts = {};
const LOGIN_MAX_ATTEMPTS = 5;
function loginRateLimited(ip) {
  const now = Date.now();
  const rec = _loginAttempts[ip] || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (now > rec.resetAt) { rec.count = 0; rec.resetAt = now + 15 * 60 * 1000; }
  rec.count++;
  _loginAttempts[ip] = rec;
  return { limited: rec.count > LOGIN_MAX_ATTEMPTS, remaining: Math.max(0, LOGIN_MAX_ATTEMPTS - rec.count), retryAfterMs: rec.resetAt - now };
}
function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}


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
const SOURCE_LABELS = {
  reddit: 'Reddit', google: 'Google Search', youtube: 'YouTube',
  instagram: 'Instagram', friend: 'Friend / Word of Mouth', other: 'Somewhere Else',
};
function sourceLabel(id) {
  if (!id) return 'Not Set';
  return SOURCE_LABELS[id] || id;
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


async function sbSum(table, column, filter = '') {
  const rows = await sbQuery(`${table}?select=${column}${filter ? '&' + filter : ''}`);
  return rows.reduce((s, r) => s + (r[column] || 0), 0);
}


async function sbAuthGetUser(id) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.user || data || null;
}


async function sbRpc(fnName, body = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase rpc ${res.status}: ${await res.text()}`);
  return res.json();
}


async function sbRosterQuery({ search, classFilter, coachFilter, sourceFilter, sortBy, sortDir, offset, limit }) {
  const params = ['select=id,email,created_at,name,class_year,coaching,study_mode,referral_source,target_year,email_reports,last_active_at,onboarding_done'];
  if (classFilter)  params.push(`class_year=eq.${encodeURIComponent(classFilter)}`);
  if (coachFilter)  params.push(`coaching=eq.${encodeURIComponent(coachFilter)}`);
  if (sourceFilter) params.push(`referral_source=eq.${encodeURIComponent(sourceFilter)}`);
  if (search) {
    
    const term = search.replace(/[%_,()*]/g, ' ').trim();
    if (term) params.push(`or=(name.ilike.*${encodeURIComponent(term)}*,email.ilike.*${encodeURIComponent(term)}*)`);
  }
  const orderCol = sortBy === 'name' ? 'name' : sortBy === 'last_active' ? 'last_active_at' : 'created_at';
  params.push(`order=${orderCol}.${sortDir === 1 ? 'asc' : 'desc'}.nullslast`);

  const url = `${SUPABASE_URL}/rest/v1/admin_user_roster?${params.join('&')}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Range-Unit': 'items',
      'Range': `${offset}-${offset + limit - 1}`,
      'Prefer': 'count=exact',
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  const rows = await res.json();
  const range = res.headers.get('content-range') || '';
  const total = range.includes('/') ? (parseInt(range.split('/')[1], 10) || 0) : rows.length;
  return { rows, total };
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
  return toISTDateKey(d);
}

// All user-facing dates in JEETrack (signup timestamps included) are meant
// to be bucketed by IST calendar day, since that's where the users are.
// `toISOString().split('T')[0]` gives the UTC date instead, which silently
// shifts any event between 00:00-05:29 IST onto the previous day's bucket
// (that window is 18:30-23:59 UTC the day before) — this was causing
// "new users per day" (and D1/D7/D30 retention, which compares against
// IST-local `date` strings from hours/tests) to look wrong for signups or
// checks landing in that window.
function toISTDateKey(date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // en-CA => YYYY-MM-DD
}
function toISTMonthKey(date) {
  return toISTDateKey(date).slice(0, 7);
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
    sbQuery('user_preferences?select=user_id,username,class_year,coaching,study_mode,referral_source,target_year,email_reports,last_active_at,onboarding_done,created_at').catch(() => []),
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
      referral_source: p.referral_source || '',
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
    const ip = clientIp(req);
    const rl = loginRateLimited(ip);
    if (rl.limited) {
      return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.', retryAfterMs: rl.retryAfterMs });
    }
    const { password } = req.body || {};
    if (!ADMIN_PASSWORD || !safeCompare(password, ADMIN_PASSWORD)) {
      
      await new Promise(r => setTimeout(r, 300));
      return res.status(401).json({ error: 'Wrong password', attemptsRemaining: rl.remaining, maxAttempts: LOGIN_MAX_ATTEMPTS });
    }
    const exp = Date.now() + TOKEN_TTL_MS;
    delete _loginAttempts[ip];
    return res.status(200).json({ ok: true, token: signToken({ exp }), expiresAt: exp });
  }

  
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  if (!verifyToken(token)) {
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

    
    // NOTE: the 'features' and 'dau' actions were removed — feature adoption
    // and DAU/WAU/MAU are now tracked in PostHog (via app_opened and the
    // per-feature events), which costs zero Supabase queries. The admin UI
    // now links out to the PostHog dashboard instead of calling these.

    
    if (action === 'new_users') {
      const authUsers = await cached('all_auth_users', 300000, () => sbAuthListAllUsers().catch(() => []));
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);

      
      const byDay = {};
      authUsers.forEach(u => {
        if (!u.created_at) return;
        const d = new Date(u.created_at);
        if (d < cutoff) return;
        const key = toISTDateKey(d);
        byDay[key] = (byDay[key] || 0) + 1;
      });

      
      const labels = [], values = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = toISTDateKey(d);
        labels.push(key);
        values.push(byDay[key] || 0);
      }

      const total = values.reduce((a, b) => a + b, 0);
      const avg   = days > 0 ? Math.round((total / days) * 10) / 10 : 0;
      const peak  = Math.max(...values, 0);
      const peakDay = labels[values.indexOf(peak)] || null;

      return res.status(200).json({ labels, values, total, avg, peak, peakDay });
    }
    
    // NOTE: the 'pages' action was removed — it was the same "which
    // feature is used most" concept as the old 'features' action (which was
    // already replaced by PostHog), just re-appearing under a different name
    // on the Overview page. Also unfiltered/uncached before this cleanup.


    
    
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

    
    
    
    // NOTE: the 'funnel' action (signup -> engagement funnel) was removed —
    // it's now a proper Funnel insight in PostHog (correctly counting both
    // Google and email sign-ups, which this Supabase version couldn't do).
    // This also removes 5 full-table user_id fetches that ran uncached on
    // every page load.


    
    
    
    if (action === 'users') {
      const page        = parseInt(req.query.page || '0');
      const pageSize     = parseInt(req.query.pageSize || '20');
      const search       = (req.query.search || '').trim();
      const classFilter  = req.query.class_year || '';
      const coachFilter  = req.query.coaching || '';
      const sourceFilter = req.query.referral_source || '';
      const sortBy       = req.query.sort || 'created_at'; 
      const sortDir      = req.query.dir === 'asc' ? 1 : -1;

      const offset = page * pageSize;
      const { rows, total } = await sbRosterQuery({
        search, classFilter, coachFilter, sourceFilter, sortBy, sortDir,
        offset, limit: pageSize,
      });

      const users = rows.map(u => ({
        id:            u.id,
        name:          u.name,
        email:         u.email,
        class:         classLabel(u.class_year),
        class_year:    u.class_year,
        target_year:   u.target_year,
        coaching:      coachingLabel(u.coaching),
        coaching_id:   u.coaching,
        source:        sourceLabel(u.referral_source),
        source_id:     u.referral_source,
        created_at:    u.created_at,
        last_active:   u.last_active_at,
        email_reports: u.email_reports,
      }));

      return res.status(200).json({
        users,
        count: total,
        page,
        pageSize,
        next: offset + pageSize < total,
      });
    }

    
    
    
    
    if (action === 'demographics') {
      const raw = await sbRpc('admin_demographics');
      const byDim = { class: {}, coaching: {}, year: {}, source: {} };
      let total = 0;

      raw.forEach(r => {
        const dim = r.dimension;
        if (!byDim[dim]) return;
        const label = dim === 'class'    ? classLabel(r.label)
                    : dim === 'coaching' ? coachingLabel(r.label)
                    : dim === 'source'   ? sourceLabel(r.label)
                    : (r.label || 'Not Set');
        byDim[dim][label] = (byDim[dim][label] || 0) + Number(r.cnt);
        if (dim === 'class') total += Number(r.cnt); 
      });

      const toArr = (obj) => Object.entries(obj)
        .map(([label, count]) => ({ label, count, pct: total ? Math.round((count/total)*1000)/10 : 0 }))
        .sort((a, b) => b.count - a.count);

      return res.status(200).json({
        total,
        classes:   toArr(byDim.class),
        coachings: toArr(byDim.coaching),
        years:     toArr(byDim.year),
        sources:   toArr(byDim.source),
      });
    }

    
    if (action === 'user_detail') {
      const { distinct_id } = req.query;
      if (!distinct_id) return res.status(400).json({ error: 'distinct_id required' });

      
      const [
        testsData, hoursData, backlogs, todos, feedbacks, streaks, prefs, authUser, practiceLogsData
      ] = await Promise.all([
        sbQuery(`tests?select=*&user_id=eq.${distinct_id}&order=created_at.desc`).catch(() => []),
        sbQuery(`hours?select=*&user_id=eq.${distinct_id}&order=date.desc`).catch(() => []),
        sbCount('backlogs', `user_id=eq.${distinct_id}`).catch(() => 0),
        sbCount('todos', `user_id=eq.${distinct_id}`).catch(() => 0),
        sbQuery(`feedback?select=*&user_id=eq.${distinct_id}&order=created_at.desc`).catch(() => []),
        sbQuery(`streaks?select=*&user_id=eq.${distinct_id}`).catch(() => []),
        sbQuery(`user_preferences?select=*&user_id=eq.${distinct_id}`).catch(() => []),
        sbAuthGetUser(distinct_id).catch(() => null),
        sbQuery(`practice_logs?select=subject,questions&user_id=eq.${distinct_id}`).catch(() => []),
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

    
    
    
    // NOTE: 'leaderboard' and 'consistency' actions were removed — both did
    // full unfiltered/near-unfiltered scans of the tests and hours tables on
    // every load, which was the single biggest Disk IO consumer in this
    // dashboard. Removed entirely rather than just cached, since the free
    // tier's IO budget is the active constraint right now.

    
    if (action === 'trigger_monthly') {
      const result = await triggerEdgeFunction('monthly-report', {});
      return res.status(200).json({ ok: true, result });
    }

    
    if (action === 'trigger_review') {
      const result = await triggerEdgeFunction('monthly-report', { type: 'review' });
      return res.status(200).json({ ok: true, result });
    }

    
    
    if (action === 'get_site_config') {
      const DEFAULTS = {
        mock_tests_count: 3000,
        study_hours_count: 15000,
        backlogs_count: 4000,
        questions_practiced_count: 50000,
        reviews_count: 1000,
        avg_rating: 4.8,
        app_version: 'v2.0',
        monthly_infra_cost: 0,
      };
      try {
        const rows = await sbQuery('app_config?id=eq.1&select=*');
        const row = (rows && rows[0]) || {};
        return res.status(200).json({ ...DEFAULTS, ...row });
      } catch (e) {
        
        return res.status(200).json(DEFAULTS);
      }
    }

    
    if (action === 'save_site_config') {
      const body = req.body || {};
      const allowedInts = ['mock_tests_count', 'study_hours_count', 'backlogs_count', 'questions_practiced_count', 'reviews_count'];
      const payload = {};

      allowedInts.forEach((k) => {
        if (body[k] === undefined || body[k] === null || body[k] === '') return;
        const n = parseInt(body[k], 10);
        if (!isNaN(n) && n >= 0) payload[k] = n;
      });
      if (body.avg_rating !== undefined && body.avg_rating !== null && body.avg_rating !== '') {
        const r = parseFloat(body.avg_rating);
        if (!isNaN(r)) payload.avg_rating = Math.max(0, Math.min(5, Math.round(r * 10) / 10));
      }
      if (body.app_version !== undefined && body.app_version !== null && body.app_version !== '') {
        payload.app_version = String(body.app_version).trim().slice(0, 20);
      }
      if (body.monthly_infra_cost !== undefined && body.monthly_infra_cost !== null && body.monthly_infra_cost !== '') {
        const c = parseFloat(body.monthly_infra_cost);
        if (!isNaN(c) && c >= 0) payload.monthly_infra_cost = Math.round(c * 100) / 100;
      }

      if (!Object.keys(payload).length) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      payload.updated_at = new Date().toISOString();

      try {
        
        const updated = await sbQuery('app_config?id=eq.1', 'PATCH', payload);
        if (updated && updated.length) {
          return res.status(200).json({ ok: true, config: updated[0] });
        }
        
        const inserted = await sbQuery('app_config', 'POST', { id: 1, ...payload });
        return res.status(200).json({ ok: true, config: inserted[0] });
      } catch (e) {
        return res.status(500).json({ error: 'Failed to save config: ' + e.message });
      }
    }

    
    if (action === 'db_stats') {
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


    
    if (action === 'feedback_list') {
      const limit  = parseInt(req.query.limit || '50');
      const offset = parseInt(req.query.offset || '0');
      const hasText = req.query.hasText === '1' || req.query.hasText === 'true';
      const ratingFilter = parseInt(req.query.rating || '', 10); 
      const featuredOnly = req.query.featuredOnly === '1' || req.query.featuredOnly === 'true';

      
      
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

    
    
    if (action === 'feedback_feature') {
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
          return dates.has(toISTDateKey(target));
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
    return res.status(500).json({ error: 'Something went wrong. Check server logs.' });
  }
}
