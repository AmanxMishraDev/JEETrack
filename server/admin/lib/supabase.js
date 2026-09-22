export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function sbQuery(path, method = 'GET', body = null) {
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

export async function sbCount(table, filter = '') {
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

export async function sbSum(table, column, filter = '') {
  const rows = await sbQuery(`${table}?select=${column}${filter ? '&' + filter : ''}`);
  return rows.reduce((s, r) => s + (r[column] || 0), 0);
}

export async function sbAuthGetUser(id) {
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

export async function sbRpc(fnName, body = {}) {
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

export async function sbRosterQuery({ search, classFilter, coachFilter, sourceFilter, sortBy, sortDir, offset, limit }) {
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

export async function sbAuthListAllUsers() {
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

export async function triggerEdgeFunction(fnName, body = {}) {
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
