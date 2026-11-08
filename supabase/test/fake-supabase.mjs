// Tiny in-memory stand-in for the parts of supabase-js the edge functions use.
const U1 = '11111111-1111-4111-8111-111111111111', U2 = '22222222-2222-4222-8222-222222222222';
export const db = {
  optima_jobs: [],
  users: { 'good-jwt': { id: U1, email: 'a@b.c' }, 'other-jwt': { id: U2, email: 'x@y.z' } },
  tests: [{ id: 7, user_id: U1 }, { id: 8, user_id: U2 }],
};
export const ids = { U1, U2 };
let n = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;
// the unique index from the migration: (user_id, pw_test_id, coalesce(attempt_title,'')) where pw_test_id is not null
const uniqueKey = r => (r.pw_test_id == null ? null : [r.user_id, r.pw_test_id, r.attempt_title ?? ''].join('|'));

function query(table) {
  const q = { op: 'select', filters: [], patch: null, row: null, opts: {}, single: false, maybe: false, order: null, limit: null, cols: '*' };
  const run = () => {
    const rows = db[table];
    const match = r => q.filters.every(f => f(r));
    if (q.op === 'insert') {
      if (table === 'optima_jobs' && uniqueKey(q.row) && rows.some(r => uniqueKey(r) === uniqueKey(q.row))) return { data: null, error: { code: '23505', message: 'duplicate key' } };
      const r = { id: uuid(), created_at: new Date().toISOString(), attempted_at: new Date().toISOString(), notebook_url: null, submission_id: null, error: null, last_checked_at: null, completed_at: null, ...q.row };
      rows.push(r);
      return { data: q.single ? { ...r } : [r], error: null };
    }
    if (q.op === 'update') { rows.filter(match).forEach(r => Object.assign(r, q.patch)); return { data: null, error: null }; }
    let hit = rows.filter(match);
    if (q.opts.head) return { data: null, count: hit.length, error: null };
    if (q.order) hit = [...hit].sort((a, b) => (a[q.order.col] < b[q.order.col] ? 1 : -1) * (q.order.asc ? -1 : 1));
    if (q.limit != null) hit = hit.slice(0, q.limit);
    hit = hit.map(r => ({ ...r }));
    return { data: q.single || q.maybe ? (hit[0] ?? null) : hit, error: null };
  };
  const api = {
    select(_c, opts = {}) { q.opts = opts; return api; },
    insert(row) { q.op = 'insert'; q.row = row; return api; },
    update(p) { q.op = 'update'; q.patch = p; return api; },
    eq(k, v) { q.filters.push(r => r[k] === v); return api; },
    is(k, v) { q.filters.push(r => (r[k] ?? null) === v); return api; },
    in(k, vs) { q.filters.push(r => vs.includes(r[k])); return api; },
    not(k, op, v) { if (op === 'is') q.filters.push(r => (r[k] ?? null) !== v); return api; },
    lt(k, v) { q.filters.push(r => r[k] < v); return api; },
    gte(k, v) { q.filters.push(r => r[k] >= v); return api; },
    order(col, { ascending = true } = {}) { q.order = { col, asc: ascending }; return api; },
    limit(k) { q.limit = k; return api; },
    single() { q.single = true; return api; },
    maybeSingle() { q.maybe = true; return api; },
    then(res, rej) { return Promise.resolve(run()).then(res, rej); },
  };
  return api;
}
export const createClient = () => ({
  from: query,
  auth: { getUser: async t => db.users[t] ? { data: { user: db.users[t] }, error: null } : { data: { user: null }, error: { message: 'bad' } } },
});
