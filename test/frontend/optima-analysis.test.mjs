// Logic of the per-test Analysis column / status page (frontend/js/app/app-11-optima.js).
// The file is a classic script, so it is run in a vm context with small stubs for the app globals.
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..', '..');
const src = fs.readFileSync(path.join(root, 'frontend/js/app/app-11-optima.js'), 'utf8');

function load({ jobs = [], tests = [], pw = [], invokeResult = {} } = {}) {
  const calls = { invoke: 0, select: 0, timers: 0, toasts: [] };
  const rows = { jobs: [...jobs] };
  const el = { innerHTML: '', classList: { contains: () => true, toggle() {} } };
  const ctx = {
    S: { tests }, currentUser: { id: 'u1' }, isSaving: false, _saveDebounceTimer: null,
    sb: {
      from: table => table === 'pw_imports' ? ({ select: () => ({ limit: async () => ({ data: pw.map(test_id => ({ test_id })), error: null }) }) }) : ({ select: () => ({ order: () => ({ limit: async () => { calls.select++; return { data: rows.jobs.map(j => ({ ...j })), error: null }; } }) }), maybeSingle: async () => ({ data: null }) }),
      functions: { invoke: async () => { calls.invoke++; if (invokeResult.apply) invokeResult.apply(rows); return { data: {}, error: null }; } },
    },
    toast: m => calls.toasts.push(m), nav() {}, pct: (a, b) => Math.round((a / b) * 100), fmt: d => d, _navNi: () => [],
    document: { querySelectorAll: () => [], getElementById: id => (id === 'analysis-root' || id === 'page-analysis' ? el : null), addEventListener() {} },
    history: { pushState() {} }, window: { scrollTo() {} }, localStorage: { getItem: () => null },
    setTimeout: () => { calls.timers++; return 0; }, setInterval: () => { calls.timers++; return 0; }, clearTimeout() {}, Date, URL, console,
  };
  vm.createContext(ctx);
  vm.runInContext(src + '\n;globalThis.__api={_optIsPw,optimaCellHTML,optimaSectionHTML,renderAnalysis,openAnalysis,optimaLoadJobs,optimaRefresh,_optSafeUrl,_optStatus,_optState,_optimaJobs:()=>_optimaJobs};', ctx);
  // the script starts one load (+ refresh) by itself; tests that count calls let it finish first
  const settle = async () => { await new Promise(r => setTimeout(r, 10)); calls.invoke = 0; calls.select = 0; };
  return { api: ctx.__api, calls, el, rows, ctx, settle, invokeResult };
}
const now = Date.now(), iso = ms => new Date(ms).toISOString();
const job = (o = {}) => ({ id: 'j1', test_id: 7, status: 'received', question_count: 12, created_at: iso(now - 60e3), attempted_at: iso(now - 60e3), notebook_url: 'https://staging.optima-edu.in/j/abc', ...o });
const test7 = { id: 7, exam: 'mains', type: 'full', total: 150, max: 300, date: '2026-10-25', physics: 50, chemistry: 50, maths: 50 };

describe('Analysis column states', () => {
  it('no job -> Analyse', () => { const { api } = load(); expect(api.optimaCellHTML(7)).toContain('opt-none'); expect(api.optimaCellHTML(7)).toContain('>Analyse<'); });
  it('sending / received -> Analysing…', async () => {
    for (const status of ['sending', 'received', 'sent']) {
      const { api } = load({ jobs: [job({ status })] }); await api.optimaLoadJobs();
      expect(api.optimaCellHTML(7)).toContain('opt-sent'); expect(api.optimaCellHTML(7)).toContain('Analysing…');
    }
  });
  it('ready (and legacy done) -> Analysis ready', async () => {
    for (const status of ['ready', 'done']) { const { api } = load({ jobs: [job({ status })] }); await api.optimaLoadJobs(); expect(api.optimaCellHTML(7)).toContain('Analysis ready'); }
  });
  it('failed -> Failed; a row stuck in sending for 10+ minutes also shows Failed', async () => {
    let t = load({ jobs: [job({ status: 'failed' })] }); await t.api.optimaLoadJobs(); expect(t.api.optimaCellHTML(7)).toContain('>Failed<');
    t = load({ jobs: [job({ status: 'sending', attempted_at: iso(now - 11 * 60e3) })] }); await t.api.optimaLoadJobs(); expect(t.api.optimaCellHTML(7)).toContain('>Failed<');
    t = load({ jobs: [job({ status: 'sending', attempted_at: iso(now - 2 * 60e3) })] }); await t.api.optimaLoadJobs(); expect(t.api.optimaCellHTML(7)).toContain('Analysing…');
  });
  it('the button opens /analysis/<testId>, and the Details modal block has the same entry point', () => {
    const { api } = load(); expect(api.optimaCellHTML(7)).toContain('onclick="openAnalysis(7)"');
    const sec = api.optimaSectionHTML(7); expect(sec).toContain('openAnalysis(7)'); expect(sec).toContain('Not analysed yet');
  });
});

describe('Not analysed yet: two ways, in the right order', () => {
  const idx = (h, k) => h.indexOf(k);
  it('PW test (imported by the extension): extension steps first, Optima link second', async () => {
    const t = load({ tests: [test7], pw: [7] }); await t.api.optimaLoadJobs(); t.api.openAnalysis(7, false);
    const h = t.el.innerHTML;
    expect(t.api._optIsPw(7)).toBe(true);
    expect(h).toContain('JEETrack PW Sync'); expect(h).toContain('https://optima-edu.in/?ref=jeetrack'); expect(h).toContain('Send mistakes on Optima');
    expect(idx(h, 'Import with PW Sync')).toBeLessThan(idx(h, 'Send mistakes to Optima'));
    expect(h).toContain('rel="noopener noreferrer"');
  });
  it('PW test detected from the note even before pw_imports loads', () => {
    const t = load({ tests: [{ ...test7, notes: 'Imported from PW: JEE Mock 3' }] }); expect(t.api._optIsPw(7)).toBe(true);
  });
  it('manual / non-PW test: Optima link first, extension second', () => {
    const t = load({ tests: [test7] }); t.api.openAnalysis(7, false);
    const h = t.el.innerHTML;
    expect(t.api._optIsPw(7)).toBe(false);
    expect(idx(h, 'Send mistakes to Optima')).toBeLessThan(idx(h, 'Import with PW Sync'));
    expect(h).toContain('href="https://optima-edu.in/?ref=jeetrack"');
  });
  it('installation guide button opens the guide in a new tab (https only)', () => {
    const t = load({ tests: [test7] }); t.api.openAnalysis(7, false); const h = t.el.innerHTML;
    expect(h).toContain('View installation guide'); expect(h).toContain('href="/pw-sync-guide"'); expect(h).not.toContain('href=""');
  });
});

describe('Status page', () => {
  it('ready: shows the notebook link, opening in a new tab without referrer/opener', async () => {
    const t = load({ jobs: [job({ status: 'ready' })], tests: [test7] }); await t.api.optimaLoadJobs(); t.api.openAnalysis(7, false);
    expect(t.el.innerHTML).toContain('error notebook is ready');
    expect(t.el.innerHTML).toContain('href="https://staging.optima-edu.in/j/abc"'); expect(t.el.innerHTML).toContain('target="_blank"'); expect(t.el.innerHTML).toContain('rel="noopener noreferrer"');
  });
  it('building: explains the wait and offers Check now; failed: says how to send again; none: shows both ways', async () => {
    let t = load({ jobs: [job()], tests: [test7] }); await t.api.optimaLoadJobs(); t.api.openAnalysis(7, false);
    expect(t.el.innerHTML).toContain('being built'); expect(t.el.innerHTML).toContain('Check now');
    t = load({ jobs: [job({ status: 'failed' })], tests: [test7] }); await t.api.optimaLoadJobs(); t.api.openAnalysis(7, false); expect(t.el.innerHTML).toContain('did not reach Optima'); expect(t.el.innerHTML).toContain('Your score is already saved');
    t = load({ tests: [test7] }); t.api.openAnalysis(7, false); expect(t.el.innerHTML).toContain('Add to my error notebook');
  });
  it('only https links are ever used; a hostile or malformed notebook_url renders no link', async () => {
    const { api } = load();
    expect(api._optSafeUrl('javascript:alert(1)')).toBe(''); expect(api._optSafeUrl('http://insecure.example/x')).toBe(''); expect(api._optSafeUrl('not a url')).toBe('');
    expect(api._optSafeUrl('https://optima-edu.in/j/Xq3')).toBe('https://optima-edu.in/j/Xq3');
    const t = load({ jobs: [job({ status: 'ready', notebook_url: 'javascript:alert(1)' })], tests: [test7] }); await t.api.optimaLoadJobs(); t.api.openAnalysis(7, false);
    expect(t.el.innerHTML).not.toContain('javascript:'); expect(t.el.innerHTML).toContain('notebook link is missing');
  });
  it('escapes test fields', () => {
    const t = load({ tests: [{ ...test7, total: '<img src=x onerror=alert(1)>' }] }); t.api.openAnalysis(7, false); t.api.renderAnalysis();
    expect(t.el.innerHTML).not.toContain('<img src=x'); expect(t.el.innerHTML).toContain('&lt;img');
  });
  it('a test that is not in the list says so', () => { const t = load({ tests: [test7] }); t.api.openAnalysis(99, false); t.api.renderAnalysis(); expect(t.el.innerHTML).toContain('not found'); });
});

describe('Refreshing without polling', () => {
  it('never creates a timer', async () => { const t = load({ jobs: [job()] }); await t.settle(); await t.api.optimaLoadJobs(); await t.api.optimaRefresh(true); expect(t.calls.timers).toBe(0); });
  it('asks optima-status only when something is still being built', async () => {
    let t = load({ jobs: [job({ status: 'ready' }), job({ id: 'j2', test_id: 8, status: 'failed' })] }); await t.settle(); await t.api.optimaLoadJobs(); await t.api.optimaRefresh(true); expect(t.calls.invoke).toBe(0);
    t = load({ jobs: [job()] }); await t.settle(); await t.api.optimaLoadJobs(); await t.api.optimaRefresh(true); expect(t.calls.invoke).toBe(1);
  });
  it('is throttled client-side (a second refresh within 30 s does nothing unless forced)', async () => {
    const t = load({ jobs: [job()] }); await t.settle(); await t.api.optimaLoadJobs(); await t.api.optimaRefresh(true); await t.api.optimaRefresh(); await t.api.optimaRefresh(); expect(t.calls.invoke).toBe(1);
    await t.api.optimaRefresh(true); expect(t.calls.invoke).toBe(2);
  });
  it('when Optima says ready, the row is re-read, the button flips and a toast appears once', async () => {
    const ir = { armed: false, apply: r => { if (ir.armed) r.jobs[0].status = 'ready'; } };
    const t = load({ jobs: [job()], invokeResult: ir }); await t.settle(); await t.api.optimaLoadJobs();
    expect(t.api.optimaCellHTML(7)).toContain('Analysing…'); ir.armed = true; await t.api.optimaRefresh(true);
    expect(t.api.optimaCellHTML(7)).toContain('Analysis ready'); expect(t.calls.toasts).toEqual(['Your error notebook is ready']);
  });
  it('the app never asks for the question content or any result column', () => {
    expect(src).not.toMatch(/select\([^)]*\bresult\b/); expect(src).not.toMatch(/image_url|pwQuestionId/);
  });
});

describe('Wiring', () => {
  const html = fs.readFileSync(path.join(root, 'frontend/index.html'), 'utf8'), ctrl = fs.readFileSync(path.join(root, 'frontend/js/app/dashboard-controller.js'), 'utf8');
  const build = fs.readFileSync(path.join(root, 'frontend/scripts/build-app-bundle.mjs'), 'utf8'), routing = fs.readFileSync(path.join(root, 'frontend/js/app/app-00-routing.js'), 'utf8');
  it('script is in the bundle order and the route + page exist', () => {
    expect(build).toContain("'app-11-optima.js'"); expect(html).toContain('id="page-analysis"'); expect(routing).toContain('/^\\/analysis\\/\\d+$/'); expect(ctrl).toContain('openAnalysis(Number(_am[1]), false)');
  });
  it('Analysis column is in BOTH the JEE Main and JEE Advanced tables, and the Details modal', () => {
    expect(ctrl.split('<th>Analysis</th>').length - 1).toBe(2); expect(ctrl.split('optimaCellHTML(t.id)').length - 1).toBe(2); expect(ctrl).toContain('optimaSectionHTML(t.id)');
  });
  it('empty-state colspans match the new column counts (Main 10, Advanced 11)', () => { expect(ctrl).toContain('<td colspan="10"><div class="empty"><svg width="12"'); expect(ctrl).toContain('<td colspan="11"><div class="empty"><svg width="13"'); });
  it('the Optima key / partner URL are never in frontend code', () => { expect(src + html + ctrl).not.toMatch(/x-partner-key|OPTIMA_PARTNER_KEY|optima_partner/i); });
});
