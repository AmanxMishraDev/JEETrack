// Edge functions vs. a fake Optima written from PARTNER_API_JEETRACK.md. Run from the repo root:
//   node --experimental-strip-types --import ./supabase/test/register.mjs supabase/test/e2e.mjs
import { db, ids } from './fake-supabase.mjs';
import { makeFakeOptima } from './fake-optima.mjs';
import { studentId, validateSubmission, optimaSubmit } from '../functions/_shared/optima-lib.ts';

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? 'PASS ' : 'FAIL ') + m); };

const KEY = 'staging-key-123';
const env = { SUPABASE_URL: 'https://proj.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'svc', OPTIMA_PARTNER_URL: 'https://staging.example.co/functions/v1/partner', OPTIMA_PARTNER_KEY: KEY, ANON_SALT: 'salt' };
const handlers = {}; let current;
globalThis.Deno = { env: { get: k => env[k] }, serve: h => { handlers[current] = h; } };
for (const f of ['submit-mock', 'optima-status']) { current = f; await import(`../functions/${f}/index.ts?${f}`); }

const optima = makeFakeOptima(KEY);
globalThis.fetch = (url, init) => optima.handler(url, init);
const call = (name, body, headers = {}) => handlers[name](new Request('https://x/' + name, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) }));
const auth = { Authorization: 'Bearer good-jwt' }, auth2 = { Authorization: 'Bearer other-jwt' };

const Q = (n, o = {}) => ({ qno: n, pwQuestionId: `pwq${n}`, type: 'Single', status: 'wrong', marked: [2], correct: [3], subject: 'PHY', images: { question: [{ lang: 'en', url: `https://static.pw.live/q${n}.png` }], solution: [] }, ...o });
const test = (id = 'T1', attempt = 'Attempt 1', n = 4) => ({ schema: 2, source: 'pw', testId: id, mappingId: 'm1', name: 'Milestone:4', attemptTitle: attempt, questions: [Q(1), Q(2, { status: 'skipped', marked: null }), Q(3, { status: 'correct', marked: [3] }), Q(4)].slice(0, n) });
const body = (t = test(), extra = {}) => ({ consent: true, test_id: null, test: t, ...extra });
const U1 = ids.U1;

// ---------- submit-mock: auth + validation ----------
let r = await call('submit-mock', body());                                     ok(r.status === 401, 'no JWT -> 401');
r = await call('submit-mock', body(), { Authorization: 'Bearer nope' });       ok(r.status === 401, 'bad JWT -> 401');
r = await call('submit-mock', body(test(), { consent: false }), auth);         ok(r.status === 400 && /agreed/.test((await r.json()).error), 'consent:false -> 400');
r = await call('submit-mock', { test: test() }, auth);                         ok(r.status === 400, 'consent missing -> 400');
r = await call('submit-mock', body({ ...test(), testId: '' }), auth);          ok(r.status === 400, 'missing testId -> 400');
r = await call('submit-mock', body({ ...test(), schema: 1 }), auth);           ok(r.status === 400, 'schema 1 -> 400');
r = await call('submit-mock', body({ ...test(), questions: [Q(1), Q(1)] }), auth); ok(r.status === 400 && /twice/.test((await r.json()).error), 'duplicate qno -> 400 (same rule as Optima)');
r = await call('submit-mock', body({ ...test(), questions: [] }), auth);       ok(r.status === 400, 'no questions -> 400');
r = await call('submit-mock', body({ ...test(), questions: Array.from({ length: 201 }, (_, i) => Q(i + 1)) }), auth); ok(r.status === 400, '201 questions -> 400');
r = await call('submit-mock', body({ ...test(), questions: [Q(1, { images: { question: [{ lang: 'en', url: 'https://evil.example/x.png' }] } })] }), auth); ok(r.status === 400, 'image URL outside static.pw.live -> 400');
r = await call('submit-mock', body({ ...test(), questions: [Q(1, { images: { question: [{ lang: null, url: 'https://static.pw.live/q1.png' }] } })] }), auth); ok(r.status === 400 && /no English question image/.test((await r.json()).error), 'image without lang:"en" -> 400 before any call (Optima refuses the whole test)');
r = await call('submit-mock', body({ ...test(), questions: [Q(1), Q(2, { status: 'correct', images: { question: [] } })] }), auth); ok(r.status === 400, 'even a CORRECT question without an image -> 400');
r = await call('submit-mock', body({ ...test(), questions: [{ ...Q(1), marked: undefined }] }), auth); ok(r.status === 400, 'missing "marked" key -> 400');
r = await call('submit-mock', body({ ...test(), pad: 'x'.repeat(2_100_000) }), auth); ok(r.status === 413, 'over 2 MB -> 413');
r = await call('submit-mock', 'not json', auth);                               ok(r.status === 400, 'not JSON -> 400');
ok(db.optima_jobs.length === 0 && optima.state.calls.length === 0, 'rejected requests: no row, Optima never called');

// ---------- submit-mock: happy path ----------
const t1 = test();
r = await call('submit-mock', body(t1, { test_id: 7 }), auth); const s1 = await r.json();
ok(r.status === 200 && s1.status === 'received' && s1.repeat === false && /^https:\/\/staging\.optima-edu\.in\/j\//.test(s1.notebook_url), 'valid submit -> 200 received + notebook_url');
const row = db.optima_jobs[0], seen = optima.state.calls[0], sent = JSON.parse(seen.body);
ok(row.status === 'received' && row.question_count === 3 && row.user_id === U1 && row.test_id === 7 && row.pw_test_id === 'T1' && row.attempt_title === 'Attempt 1' && row.submission_id === 'sub_1' && row.notebook_url === s1.notebook_url, 'row: received, 3 wrong+skipped, own test_id, pw ids, submission_id, notebook_url');
ok(seen.method === 'POST' && seen.url === env.OPTIMA_PARTNER_URL && seen.headers['x-partner-key'] === KEY && !('authorization' in seen.headers), 'Optima got x-partner-key (and no Bearer header)');
ok(sent.consent === true && !isNaN(Date.parse(sent.tapped_at)), 'consent:true and tapped_at (ISO) sent');
ok(JSON.stringify(sent.test) === JSON.stringify(t1), 'test forwarded unchanged (all questions, incl. the correct one)');
ok(sent.student.id === await studentId('salt', U1) && /^jt_[0-9a-f]{32}$/.test(sent.student.id), 'student.id = jt_ + keyed hash');
ok(!JSON.stringify(sent).includes(U1) && !JSON.stringify(sent).includes('a@b.c') && !('name' in sent.student) && !('email' in sent.student), 'JEETrack user id / email / name are not sent');
ok(!JSON.stringify(db.optima_jobs).includes('static.pw.live') && !JSON.stringify(db.optima_jobs).includes('pwq1'), 'no question content stored in the DB');

// ---------- idempotency ----------
r = await call('submit-mock', body(t1, { test_id: 7 }), auth); const s1b = await r.json();
ok(r.status === 200 && s1b.repeat === true && s1b.job_id === s1.job_id && optima.state.calls.length === 1 && db.optima_jobs.length === 1, 'same test + attempt again -> repeat:true, same job, Optima not called again');
r = await call('submit-mock', body(test('T1', 'Attempt 2')), auth); const s2 = await r.json();
ok(r.status === 200 && s2.job_id !== s1.job_id && db.optima_jobs.length === 2 && s2.notebook_url === s1.notebook_url, 'Attempt 2 = new submission, same student notebook link');
r = await call('submit-mock', body(test('T2', null)), auth); const s3 = await r.json();
r = await call('submit-mock', body(test('T2', null)), auth); const s3b = await r.json();
ok(s3.status === 'received' && s3b.repeat === true && s3b.job_id === s3.job_id && db.optima_jobs.length === 3, 'attemptTitle null works and is idempotent');
{ const before = db.optima_jobs.length;
  const [a, b] = await Promise.all([call('submit-mock', body(test('RACE')), auth), call('submit-mock', body(test('RACE')), auth)]);
  const ja = await a.json(), jb = await b.json();
  ok(db.optima_jobs.length === before + 1 && ja.job_id === jb.job_id, 'double-click race creates one job'); }

// ---------- ownership ----------
r = await call('submit-mock', body(test('T9'), { test_id: 8 }), auth);         ok(r.status === 400 && !db.optima_jobs.some(j => j.pw_test_id === 'T9'), "someone else's test_id -> 400, no row");
r = await call('submit-mock', body(test('T1'), auth2 && { test_id: null }), auth2); const o1 = await r.json();
ok(r.status === 200 && o1.job_id !== s1.job_id && o1.notebook_url !== s1.notebook_url && db.optima_jobs.find(j => j.id === o1.job_id).user_id === ids.U2, 'another student sending the same PW test gets their own job and notebook');

// ---------- failure modes: Optima down / 500 / bad key / 400 / 429 ----------
optima.state.mode = 'down'; r = await call('submit-mock', body(test('F1')), auth); let f = await r.json();
ok(r.status === 502 && db.optima_jobs.find(j => j.id === f.job_id).status === 'failed' && db.optima_jobs.find(j => j.id === f.job_id).error === 'unreachable', 'Optima unreachable -> 502, row failed');
optima.state.mode = 'ok'; const callsBefore = optima.state.calls.length; r = await call('submit-mock', body(test('F1')), auth); const f1b = await r.json();
ok(r.status === 200 && f1b.job_id === f.job_id && db.optima_jobs.find(j => j.id === f.job_id).status === 'received' && db.optima_jobs.filter(j => j.pw_test_id === 'F1').length === 1 && optima.state.calls.length === callsBefore + 1, 'send again after failure -> same row, now received');
optima.state.failNext = 1; const cb2 = optima.state.calls.length; r = await call('submit-mock', body(test('F2')), auth);
ok(r.status === 200 && optima.state.calls.length === cb2 + 2, 'one 500 from Optima is retried once and succeeds');
optima.state.mode = '500'; r = await call('submit-mock', body(test('F3')), auth); f = await r.json();
ok(r.status === 502 && db.optima_jobs.find(j => j.id === f.job_id).status === 'failed', 'Optima keeps answering 500 -> 502, row failed');
optima.state.mode = 'not_configured'; r = await call('submit-mock', body(test('F3b')), auth);
ok(r.status === 502 && db.optima_jobs.find(j => j.pw_test_id === 'F3b').status === 'failed', 'Optima 503 not_configured -> 502, row failed');
optima.state.mode = 'ok';
env.OPTIMA_PARTNER_KEY = 'wrong-key'; r = await call('submit-mock', body(test('F4')), auth); f = await r.json(); const raw4 = JSON.stringify(f);
ok(r.status === 502 && f.code === 'bad_key' && /not set up correctly/.test(f.error) && !raw4.includes('wrong-key') && !raw4.includes(KEY) && db.optima_jobs.find(j => j.id === f.job_id).status === 'failed', 'invalid credentials -> 502 "not set up", row failed, key never echoed');
env.OPTIMA_PARTNER_KEY = KEY;
optima.state.mode = '400'; r = await call('submit-mock', body(test('F5')), auth); f = await r.json();
ok(r.status === 422 && /test\.testId is missing/.test(f.error), "Optima 400 -> 422 with Optima's detail");
optima.state.mode = '429'; r = await call('submit-mock', body(test('F6')), auth);
ok(r.status === 429, 'Optima 429 -> 429 to the student');
optima.state.mode = 'ok';

// ---------- stuck "sending" + local daily limit + not configured ----------
{ const j = { id: 'stuck-1', user_id: U1, status: 'sending', pw_test_id: 'ST', attempt_title: 'Attempt 1', attempted_at: new Date(Date.now() - 60e3).toISOString(), created_at: new Date().toISOString() };
  db.optima_jobs.push(j);
  r = await call('submit-mock', body(test('ST')), auth); ok(r.status === 409, 'a job still sending 1 minute ago -> 409, no second call');
  j.attempted_at = new Date(Date.now() - 6 * 60e3).toISOString();
  r = await call('submit-mock', body(test('ST')), auth); const st = await r.json();
  ok(r.status === 200 && st.job_id === 'stuck-1' && j.status === 'received', 'a job stuck sending for 6 minutes is retried on the same row'); }
{ const mine = db.optima_jobs.filter(j => j.user_id === U1).length;
  for (let i = mine; i < 20; i++) db.optima_jobs.push({ id: `fill${i}`, user_id: U1, status: 'ready', pw_test_id: `FILL${i}`, attempt_title: null, created_at: new Date().toISOString() });
  r = await call('submit-mock', body(test('OVER')), auth); ok(r.status === 429, '21st new test in a day -> 429 (local guard)');
  r = await call('submit-mock', body(test('T1')), auth); ok(r.status === 200 && (await r.json()).repeat === true, 'a repeat still works at the limit');
  db.optima_jobs = db.optima_jobs.filter(j => !j.id.startsWith('fill')); }
{ const k = env.OPTIMA_PARTNER_KEY; delete env.OPTIMA_PARTNER_KEY; r = await call('submit-mock', body(test('NC')), auth); ok(r.status === 503, 'secret missing -> 503'); env.OPTIMA_PARTNER_KEY = k; }

// ---------- optima-status ----------
r = await call('optima-status', {});                                            ok(r.status === 401, 'status: no JWT -> 401');
const mine = () => db.optima_jobs.find(j => j.pw_test_id === 'T1' && j.attempt_title === 'Attempt 1' && j.user_id === U1);
const age = () => db.optima_jobs.forEach(j => { if (j.last_checked_at) j.last_checked_at = new Date(Date.now() - 2 * 60e3).toISOString(); });
r = await call('optima-status', {}, auth); ok((await r.clone().json()).checked === 0, 'status: right after submit nothing is due (submit already confirmed it)');
age();
r = await call('optima-status', {}, auth); let sj = await r.json();
let g = optima.state.calls.filter(c => c.method === 'GET');
ok(r.status === 200 && sj.checked > 0 && g.length > 0 && g.every(c => c.headers['x-partner-key'] === KEY), 'status: asks Optima (GET) with x-partner-key');
{ const u = new URL(g.find(c => c.url.includes('test=T1') && /Attempt(\+|%20)1/.test(c.url)).url);
  ok(u.searchParams.get('student') === await studentId('salt', U1) && u.searchParams.get('test') === 'T1' && u.searchParams.get('attempt') === 'Attempt 1', 'status: student, test and attempt query params'); }
ok(mine().status === 'received' && mine().last_checked_at, 'status: still received, last_checked_at set');
const gets = optima.state.calls.filter(c => c.method === 'GET').length;
await call('optima-status', {}, auth);
ok(optima.state.calls.filter(c => c.method === 'GET').length === gets, 'status: no second Optima call within a minute (throttled)');
optima.markReady('T1'); age();
r = await call('optima-status', {}, auth); sj = await r.json();
ok(mine().status === 'ready' && mine().completed_at && sj.jobs.find(j => j.id === mine().id)?.status === 'ready', 'status: Optima says ready -> row ready, completed_at set, returned to the app');
{ const other = db.optima_jobs.find(j => j.user_id === ids.U2);
  age();
  r = await call('optima-status', { job_ids: [other.id] }, auth); sj = await r.json();
  ok(!sj.jobs.some(j => j.id === other.id), "status: another student's job id is ignored"); }
{ const j = db.optima_jobs.find(x => x.pw_test_id === 'F2'); j.last_checked_at = null; optima.subs.clear();
  r = await call('optima-status', { job_ids: [j.id] }, auth);
  ok(j.status === 'failed' && j.error === 'not_found', 'status: Optima 404 -> row failed (student can send again)'); }
{ const j = db.optima_jobs.find(x => x.pw_test_id === 'T2'); j.status = 'received'; j.last_checked_at = null; optima.state.mode = 'down';
  r = await call('optima-status', { job_ids: [j.id] }, auth);
  ok(r.status === 200 && j.status === 'received' && j.last_checked_at, 'status: Optima down -> status kept, no crash'); optima.state.mode = 'ok'; }

// ---------- lib units ----------
ok(validateSubmission(body()).ok && validateSubmission(body()).value.questionCount === 3, 'validateSubmission counts wrong + skipped');
{ const x = await optimaSubmit({ url: 'https://o/p', key: 'k' }, {}, async () => new Response('{"submission_id":"s","status":"received","notebook_url":"http://insecure/x"}', { status: 200 }));
  ok(!x.ok && x.code === 'bad_reply', 'a non-https notebook_url from Optima is rejected'); }

console.log(`\n${pass} passed, ${fail} failed`); if (fail) process.exit(1);
