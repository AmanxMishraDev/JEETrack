// Requires a real local Postgres — run `supabase start` first (Supabase
// CLI's local dev stack, standard port/credentials below). NOT run by
// `npm test` by default (see the separate "test:db" script) since it needs
// that running database and takes longer than the rest of the suite.
//
// I could not run this myself — no Postgres/Docker available in the
// environment I built this in. Please run it yourself (`npm run test:db`
// after `supabase start`) before trusting it, and adjust
// DB_URL below if your local setup differs from Supabase CLI's defaults.
//
// What it guards: Phase 2 committed `idx_hours_user_id` (and friends) to
// the repo because production already relied on them existing. This test
// is the thing that would actually catch it if a future migration ever
// dropped one by accident — seed enough rows that a sequential scan would
// be obviously slower than an index scan, then assert Postgres's own
// query planner chose an Index Scan, not just that the query "felt fast"
// (timing alone is noisy and environment-dependent; the plan shape isn't).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';

const DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';
const ROW_COUNT = 50_000;
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// Hard safety check: this test seeds 50k rows and runs EXPLAIN against
// whatever DB_URL points to. Refuse to run against anything that isn't
// obviously a local database — no exceptions via a quiet default, only
// via an explicit, loudly-named opt-in env var. A wrapped transaction
// rolling back at the end is not a strong enough guarantee to bet real
// production data or a live tier's compute/IO budget on if this ever
// points at a real Supabase project by mistake (e.g. an env var reused
// out of habit from a real .env file).
const LOOKS_LOCAL = /^(localhost|127\.0\.0\.1|::1)$/i.test(new URL(DB_URL).hostname);
if (!LOOKS_LOCAL && process.env.ALLOW_NON_LOCAL_DB_TEST !== 'yes-i-am-sure') {
  throw new Error(
    `[perf smoke test] Refusing to run: TEST_DATABASE_URL ("${DB_URL}") does not look like ` +
    `a local database. This test seeds ${ROW_COUNT} rows and should only ever run against a ` +
    `local \`supabase start\` instance. If you really mean to point this at a non-local ` +
    `database, set ALLOW_NON_LOCAL_DB_TEST=yes-i-am-sure explicitly.`
  );
}

let client;
let skip = false;

beforeAll(async () => {
  client = new pg.Client({ connectionString: DB_URL });
  try {
    await client.connect();
  } catch (e) {
    console.warn(`[perf smoke test] Could not connect to ${DB_URL} — is \`supabase start\` running? Skipping. (${e.message})`);
    skip = true;
    return;
  }

  // Real schema: hours.id is `numeric` (not uuid), and user_id has a
  // foreign key to auth.users — Supabase's own auth schema, which only
  // exists when running against `supabase start`'s full local stack (not
  // a bare Postgres). Every user_id used below must exist in auth.users
  // first, so seed a small pool of fake users rather than random UUIDs.
  const OTHER_USER_COUNT = 20;
  await client.query('BEGIN');
  await client.query(
    `INSERT INTO auth.users (id, email)
     SELECT gen_random_uuid(), 'perf-test-' || i || '@example.com'
     FROM generate_series(1, $1) AS i
     ON CONFLICT (id) DO NOTHING
     RETURNING id`,
    [OTHER_USER_COUNT]
  );
  await client.query(
    `INSERT INTO auth.users (id, email) VALUES ($1, 'perf-test-target@example.com') ON CONFLICT (id) DO NOTHING`,
    [TEST_USER_ID]
  );
  const { rows: otherUsers } = await client.query(
    `SELECT id FROM auth.users WHERE email LIKE 'perf-test-%@example.com' AND email != 'perf-test-target@example.com' LIMIT $1`,
    [OTHER_USER_COUNT]
  );
  const otherUserIds = otherUsers.map(r => r.id);

  await client.query(`
    INSERT INTO hours (id, user_id, date, subject, total)
    SELECT 900000000 + i,
           CASE WHEN i % 4 = 0 THEN $1::uuid ELSE ($2::uuid[])[1 + (i % $3)] END,
           (CURRENT_DATE - (i % 365))::text,
           (ARRAY['physics','chemistry','maths'])[1 + (i % 3)],
           (i % 5) + 0.5
    FROM generate_series(1, $4) AS i
  `, [TEST_USER_ID, otherUserIds, otherUserIds.length, ROW_COUNT]);
}, 60_000);

afterAll(async () => {
  if (skip || !client) return;
  await client.query('ROLLBACK'); // never commits the seeded rows
  await client.end();
});

describe('query performance — Phase 2 index guard', () => {
  it('hours lookups by user_id use an Index Scan, not a Seq Scan, once the table is large', async () => {
    if (skip) {
      console.warn('[perf smoke test] Skipped — no local database available.');
      return;
    }
    const { rows } = await client.query(
      `EXPLAIN (FORMAT JSON) SELECT * FROM hours WHERE user_id = $1`,
      [TEST_USER_ID]
    );
    const plan = rows[0]['QUERY PLAN'][0].Plan;
    // Walk the plan tree (Postgres may wrap it in a Bitmap Heap Scan node
    // etc.) looking for any Seq Scan on `hours` specifically.
    function hasSeqScanOn(node, table) {
      if (node['Node Type'] === 'Seq Scan' && node['Relation Name'] === table) return true;
      return (node.Plans || []).some(p => hasSeqScanOn(p, table));
    }
    expect(hasSeqScanOn(plan, 'hours'), `Expected an index-based plan, got:\n${JSON.stringify(plan, null, 2)}`).toBe(false);
  });

  it('query time for a single user\'s rows stays well under a naive full-table-scan bound', async () => {
    if (skip) return;
    const start = performance.now();
    await client.query('SELECT * FROM hours WHERE user_id = $1', [TEST_USER_ID]);
    const elapsedMs = performance.now() - start;
    // Generous bound (this is a smoke test, not a strict benchmark) — the
    // point is catching a regression to O(table size), not chasing ms.
    expect(elapsedMs, `Query took ${elapsedMs}ms for ${ROW_COUNT} rows — investigate whether an index was dropped`).toBeLessThan(500);
  });
});
