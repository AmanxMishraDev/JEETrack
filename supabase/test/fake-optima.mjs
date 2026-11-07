// A stand-in for Optima's partner API, written ONLY from PARTNER_API_JEETRACK.md (staging contract).
// It is a test double, not Optima: anything the document does not say is NOT simulated here.
// Documented: x-partner-key header; POST submit (200 + notebook_url, repeat flag, 400 bad_json with detail, 401 bad_key,
//   405, 413 over 2 MB, 429 over 20 new tests per student per day, 500/503 retry-safe); GET status (received | ready, 404 not_found).
import { createHash } from 'node:crypto';

export function makeFakeOptima(key = 'staging-key') {
  const subs = new Map();           // `${student}|${testId}|${attempt}` -> submission
  const perDay = new Map();         // student -> count of new tests
  const state = { mode: 'ok', calls: [], failNext: 0 };
  const notebook = s => `https://staging.optima-edu.in/j/${createHash('sha256').update(s).digest('hex').slice(0, 10)}`;
  const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  async function handler(url, init = {}) {
    const method = (init.method ?? 'GET').toUpperCase(), u = new URL(url);
    const headers = new Headers(init.headers ?? {});
    state.calls.push({ method, url: String(url), headers: Object.fromEntries(headers), body: init.body });
    if (state.mode === 'down') throw new Error('ECONNREFUSED');
    if (state.mode === 'not_configured') return reply(503, { error: 'not_configured' });
    if (state.failNext > 0) { state.failNext--; return reply(500, { error: 'server_error' }); }
    if (state.mode === '500') return reply(500, { error: 'server_error' });
    if (state.mode === '429') return reply(429, { error: 'too_many' });
    if (state.mode === '400') return reply(400, { error: 'bad_json', detail: 'test.testId is missing' });
    if (headers.get('x-partner-key') !== key) return reply(401, { error: 'bad_key' });
    if (method !== 'POST' && method !== 'GET') return reply(405, { error: 'method_not_allowed' });

    if (method === 'GET') {
      const student = u.searchParams.get('student')?.trim(), test = u.searchParams.get('test'), attempt = u.searchParams.get('attempt');
      if (!student || !test) return reply(400, { error: 'bad_request' });
      const all = [...subs.values()].filter(s => s.student === student && s.testId === test && (attempt == null || s.attempt === attempt));
      const s = all.at(-1);
      if (!s) return reply(404, { error: 'not_found' });
      return reply(200, { status: s.status, notebook_url: s.notebook_url, test_name: s.name, attempt: s.attempt });
    }

    const text = String(init.body ?? '');
    if (new TextEncoder().encode(text).length > 2_000_000) return reply(413, { error: 'too_big' });
    let b; try { b = JSON.parse(text); } catch { return reply(400, { error: 'bad_json', detail: 'body is not JSON' }); }
    const bad = d => reply(400, { error: 'bad_json', detail: d });
    const student = typeof b?.student?.id === 'string' ? b.student.id.trim() : '';
    if (!student || student.length > 128) return bad('student.id is missing');
    if (b.consent !== true) return bad('consent must be true');
    const t = b.test;
    if (!t?.testId) return bad('test.testId is missing');
    if (!Array.isArray(t.questions) || t.questions.length < 1 || t.questions.length > 200) return bad('test.questions must have 1-200 questions');
    const seen = new Set();
    for (const q of t.questions) {
      for (const f of ['qno', 'pwQuestionId', 'type', 'status', 'correct']) if (q[f] == null) return bad(`question ${q.qno}: ${f} is missing`);
      if (!(q.images?.question ?? []).some(i => i.lang === 'en' && String(i.url).startsWith('https://static.pw.live/'))) return bad(`test.questions[${t.questions.indexOf(q)}] has no English question image on https://static.pw.live/`);
      if (seen.has(q.qno)) return bad(`qno ${q.qno} appears twice`);
      seen.add(q.qno);
    }
    const k = `${student}|${t.testId}|${t.attemptTitle ?? ''}`;
    if (subs.has(k)) { const s = subs.get(k); return reply(200, { submission_id: s.id, status: 'received', notebook_url: s.notebook_url, repeat: true }); }
    const c = perDay.get(student) ?? 0;
    if (c >= 20) return reply(429, { error: 'too_many' });
    perDay.set(student, c + 1);
    const s = { id: `sub_${subs.size + 1}`, student, testId: t.testId, attempt: t.attemptTitle ?? null, name: t.name, status: 'received', notebook_url: notebook(student) };
    subs.set(k, s);
    return reply(200, { submission_id: s.id, status: 'received', notebook_url: s.notebook_url, repeat: false });
  }
  return { handler, state, subs, markReady: (testId) => { for (const s of subs.values()) if (s.testId === testId) s.status = 'ready'; } };
}
