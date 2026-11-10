
/* global renderAll, loadUserData, isSaving, _saveDebounceTimer, nav, pct, fmt, _navNi */
// ---------------------------------------------------------------------------
// JEETrack x Optima: per-test "Analysis" button + status + status page (/analysis/<testId>).
//
// Optima's real partner API does not send an analysis back. A student's test goes into their Optima "error notebook"
// (a page on Optima, one stable link per student). JEETrack therefore shows only the STATUS and the link:
//   Analyse (not sent yet) -> Analysing… (Optima is building it) -> Analysis ready (open the notebook) | Failed (send again).
//
// Read-only: optima_jobs rows are written by the submit-mock / optima-status edge functions (service role).
// RLS lets a student read only their own rows. The Optima key never reaches the browser.
// No timers: the status is refreshed when the page loads, when the tab is shown again, on the status page and on "Check now".
// ---------------------------------------------------------------------------
// Product analytics (PostHog via _jtTrack). Never throws, and sends no student details: only the step and the route.
const _optSeen = new Set();
function _optTrack(ev, props){ try{ if(typeof _jtTrack === 'function') _jtTrack(ev, props || {}); }catch(e){ /* analytics must never break the page */ } }
function _optOnce(key, ev, props){ if(_optSeen.has(key)) return; _optSeen.add(key); _optTrack(ev, props); }
let _optimaJobs = [];          // newest first: {id,test_id,status,question_count,created_at,attempted_at,notebook_url}
let _analysisTestId = null;    // the test whose status page is open
let _optimaRefreshing = false;
let _optimaLastRefresh = 0;
const _OPTIMA_REFRESH_MIN_MS = 30000; // the server also throttles to one Optima call per job per minute
// Where a student goes to send mistakes of a test that did not come through the PW extension.
const OPTIMA_SITE_URL = 'https://optima-edu.in/?ref=jeetrack';
// Page that explains how to install the extension and import a PW test. Leave '' until it exists: the link is simply not shown.
const OPTIMA_EXT_GUIDE_URL = '/pw-sync-guide';
let _optimaPw = new Set();     // ids of tests that were imported from PW by the extension (pw_imports)

function _optEsc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
// Only an https link is ever put in href. (notebook_url comes from Optima via our server; staging points at a staging host.)
// Guide link: a path on this site (like /pw-sync-guide) or https. Never anything else.
function _optGuideHref(u){ const v = String(u || ''); return /^\/(?!\/)[A-Za-z0-9\-_\/]*$/.test(v) ? v : _optSafeUrl(v); }
function _optSafeUrl(u){ try{ const x = new URL(String(u)); return x.protocol === 'https:' ? x.href : ''; }catch(e){ return ''; } }

// DB status -> the four states shown to the student: none | sent (Optima is working) | done | failed
//   sending/received (and the old sent) = in progress; ready (and the old done) = ready; failed = failed.
// A row stuck in 'sending' for 10+ minutes means the request died: shown as failed (sending again retries it).
function _optStatus(j){
  if(j.status === 'ready' || j.status === 'done') return 'done';
  if(j.status === 'failed') return 'failed';
  if(j.status === 'sending' && Date.now() - Date.parse(j.attempted_at || j.created_at) > 600000) return 'failed';
  return 'sent';
}
// A test is "from PW" if the extension imported it, or its note says so.
function _optIsPw(testId){
  if(_optimaPw.has(Number(testId))) return true;
  const t = (S.tests || []).find(x => x.id === Number(testId));
  return !!t && /^Imported from PW/i.test(String(t.notes || ''));
}
function optimaJobFor(testId){ return _optimaJobs.find(j => j.test_id === testId) || null; }
function _optState(testId){ const j = optimaJobFor(testId); return j ? _optStatus(j) : 'none'; }

// ---- the button shown on EVERY test row ----
const _OPT_LABEL = { none: 'Analyse', sent: 'Analysing…', done: 'Analysis ready', failed: 'Failed' };
const _OPT_TIP = {
  none: 'See how to get this mock analysed by Optima',
  sent: 'Your error notebook is being built. It usually takes under an hour',
  done: 'Open your error notebook',
  failed: 'It did not reach Optima. Open for details',
};
function optimaCellHTML(testId){
  const st = _optState(testId);
  _optOnce('shown:' + st + ':' + testId, 'analyse_button_shown', { state: st, route: _optIsPw(testId) ? 'pw' : 'other' });
  return `<button type="button" class="opt-btn opt-${st}" data-tid="${Number(testId)}" title="${_OPT_TIP[st]}" onclick="openAnalysis(${Number(testId)})"><i class="od"></i>${_OPT_LABEL[st]}</button>`;
}
// kept for older callers
function optimaBadge(testId){ const st = _optState(testId); return st === 'none' ? '' : ` <span class="chip ${ {sent:'ba',done:'bg',failed:'br'}[st] }" style="margin-left:4px">${_OPT_LABEL[st]}</span>`; }

// Block inside the test Details modal: always there, so every test has the entry point.
function optimaSectionHTML(testId){
  const st = _optState(testId), j = optimaJobFor(testId);
  const line = {
    none: 'Not analysed yet. Open Analyse to see how to send this test to Optima.',
    sent: 'Your error notebook is being built. It usually takes under an hour.',
    done: 'Your error notebook is ready.',
    failed: 'It did not reach Optima. Your score is saved.',
  }[st];
  return `<div style="background:var(--sf2);border:1px solid var(--bd);border-radius:var(--rs);padding:.6rem .8rem;margin-bottom:12px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">
      <span style="font-size:10px;color:var(--mu);text-transform:uppercase;letter-spacing:.06em;font-weight:600">Mock analysis</span>${optimaCellHTML(testId)}
    </div>
    <div style="font-size:12px;color:var(--mu)">${line}${j && j.question_count ? ` (${_optEsc(j.question_count)} wrong or skipped questions)` : ''}</div>
  </div>`;
}

// ---- the status page ----
function _analysisTest(){ return (S.tests || []).find(t => t.id === _analysisTestId) || null; }

function openAnalysis(testId, push){
  if(push !== false) _optTrack('analyse_button_tapped', { state: _optState(testId), route: _optIsPw(testId) ? 'pw' : 'other' });
  _analysisTestId = Number(testId);
  if(push !== false) history.pushState({ page: 'analysis', testId: _analysisTestId }, '', '/analysis/' + _analysisTestId);
  nav('analysis', false);
  const t = _analysisTest(), want = t && t.exam === 'advanced' ? 'jee advanced' : 'jee mains';
  _navNi().forEach(n => n.classList.toggle('active', n.textContent.toLowerCase().trim().startsWith(want)));
  window.scrollTo(0, 0);
  renderAnalysis();
  optimaLoadJobs().then(() => optimaRefresh()); // fresh status every time the page is opened
}

function analysisBack(){ const t = _analysisTest(); nav(t && t.exam === 'advanced' ? 'advanced' : 'mains'); }

function _optSummaryCard(t){
  const exam = t.exam === 'advanced' ? 'JEE Advanced' + (t.paper ? ' · ' + String(t.paper).toUpperCase() : '') : 'JEE Mains';
  const d = new Date(String(t.date) + 'T00:00:00Z');
  const date = isNaN(d) ? fmt(t.date) : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const sub = (label, v, c) => `<div><span class="an-sum-eye">${label}</span><b style="color:${c}">${_optEsc(v)}</b></div>`;
  return `<section class="an-sum">
    <div>
      <div class="an-sum-eye">${_optEsc(exam)} · ${t.type === 'full' ? 'Full Syllabus' : 'Partial'}</div>
      <h1>Test summary</h1>
      <div class="an-score">${_optEsc(t.total)}<small>/ ${_optEsc(t.max)}</small></div>
      <div class="an-meta">${_optEsc(date)} · ${_optEsc(pct(t.total, t.max))}%</div>
    </div>
    <div class="an-subs">${sub('Physics', t.physics, '#60a5fa')}${sub('Chemistry', t.chemistry, '#34d399')}${sub('Maths', t.maths, '#fbbf24')}</div>
  </section>`;
}

function _optNotebookLink(job, primary){
  const url = job && _optSafeUrl(job.notebook_url);
  if(!url) return '';
  return `<a href="${_optEsc(url)}" target="_blank" rel="noopener noreferrer" onclick="_optTrack('analysis_notebook_opened')" class="an-btn${primary ? '' : ' an-btn-ghost'}">Open my error notebook <span aria-hidden="true">&rarr;</span></a>`;
}

// Two ways to get a test analysed (design: Aman's "Test Analysis" page). The route that fits where the test came from comes first.
function _optHowCards(){
  const guide = _optGuideHref(OPTIMA_EXT_GUIDE_URL), site = _optSafeUrl(OPTIMA_SITE_URL);
  return `<div class="an">
    <header class="an-hd"><div class="an-eye">Mistake analysis</div><h2>See exactly where the marks went, <span class="an-g">analysed by Optima</span></h2><p>Works for every test, imported or added by hand. Pick the option that matches where you attempted it, and Optima prepares your analysis.</p></header>
    <div class="an-doors">
      <article class="an-door an-d1"><span class="an-ghost" aria-hidden="true">A</span>
        <span class="an-tag">Option 1 · PW tests</span>
        <h3>Import with PW Sync</h3>
        <p class="an-lead">Attempted on PW? The extension imports your test in a single click.</p>
        <ol class="an-steps">
          <li><span>Install <b>JEETrack PW Sync</b> in Chrome (one-time).</span></li>
          <li><span>Open your test’s result page on PW. A JEETrack bar appears at the top.</span></li>
          <li><span>Tick <b>Analyse mistakes</b> and press <b>Send to JEETrack</b>.</span></li>
          <li><span>Return here to follow the status of your analysis.</span></li>
        </ol>
        ${guide ? `<a class="an-btn an-btn-fit" href="${_optEsc(guide)}" target="_blank" rel="noopener noreferrer" onclick="_optTrack('analysis_guide_opened')">View installation guide <span aria-hidden="true">&rarr;</span></a>` : ''}
      </article>
      <article class="an-door an-d2"><span class="an-ghost" aria-hidden="true">B</span>
        <span class="an-tag an-tag2">Option 2 · All other tests</span>
        <h3>Send mistakes to Optima</h3>
        <p class="an-lead">Took the test on another platform, or added it by hand? Send your mistakes straight to Optima and they will analyse them for you.</p>
        <ul class="an-list">
          <li><span><b>Any test source</b> — no extension required.</span></li>
          <li><span><b>Direct submission</b> — share your mistakes on Optima.</span></li>
          <li><span><b>Quick turnaround</b> — analysis is ready within an hour.</span></li>
        </ul>
        ${site ? `<a class="an-btn an-btn-fit" href="${_optEsc(site)}" target="_blank" rel="noopener noreferrer" onclick="_optTrack('analysis_optima_site_opened')">Send mistakes on Optima <span aria-hidden="true">&rarr;</span></a><div class="an-sub an-sub-l">Opens optima-edu.in in a new tab</div>` : ''}
      </article>
    </div>
    <p class="an-help"><b>Not sure which to choose?</b> If the test was on PW, use Option 1. For anything else, use Option 2.</p>
  </div>`;
}

// Status pages share the look of the "how to" page (.an): eyebrow + headline + one card, with a 3-step progress line.
function _optProgress(active, failed){
  const items = [['Sent', 'Your test has been received'], ['Analysing', 'Your mistakes are being analysed'], ['Ready', 'Open your notebook']];
  return `<ol class="an-prog">${items.map(([h, d], i) => {
    const cls = failed && i === 0 ? 'bad' : i < active ? 'done' : i === active ? 'now' : '';
    return `<li class="${cls}"><span class="an-pd">${i < active && !failed ? '&#10003;' : failed && i === 0 ? '!' : i + 1}</span><div><div class="an-sh">${h}</div><div class="an-sd">${d}</div></div></li>`;
  }).join('')}</ol>`;
}
function _optStateShell(eyebrow, headline, lead, body){
  return `<div class="an an-state"><header class="an-hd"><div class="an-eye">${eyebrow}</div><h2>${headline}</h2><p>${lead}</p></header><article class="an-card an-main an-wide">${body}</article></div>`;
}
function _optStatusCard(t, job, st){
  const when = job ? _optEsc(new Date(job.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })) : '';
  const qs = job && job.question_count ? ` &middot; ${_optEsc(job.question_count)} wrong or skipped questions` : '';
  const site = _optSafeUrl(OPTIMA_SITE_URL), guide = _optGuideHref(OPTIMA_EXT_GUIDE_URL);
  const ext = (u, ev) => `href="${_optEsc(u)}" target="_blank" rel="noopener noreferrer"${ev ? ` onclick="_optTrack('${ev}')"` : ''}`;
  if(st === 'none') return _optHowCards();
  if(st === 'sent') return _optStateShell('<span class="an-chip an-chip-wait"><i></i>In progress</span>',
    'Your error notebook is <span class="an-g">being built</span>',
    `Sent ${when}${qs}. It usually takes under an hour.`,
    `${_optProgress(1, false)}<div class="an-row"><button type="button" class="an-btn an-btn-ghost" onclick="optimaCheckNow()">Check now</button>${_optNotebookLink(job, false)}</div><div class="an-sub">You can close this page. The status updates the next time you open JEETrack.</div>`);
  if(st === 'failed') return _optStateShell('<span class="an-chip an-chip-bad"><i></i>Not delivered</span>',
    'It <span class="an-g">did not reach Optima</span>',
    `Sent ${when}. Your score is already saved here, so nothing is lost. Send the test again using either option below.`,
    `${_optProgress(0, true)}<ol class="an-steps">
      <li><span>Open this test’s result page on PW. The JEETrack bar appears at the top.</span></li>
      <li><span>Select <b>Analyse mistakes</b>, then press <b>Send to JEETrack</b>.</span></li>
    </ol><div class="an-row">${guide ? `<a class="an-btn an-btn-ghost" ${ext(guide, 'analysis_guide_opened')}>Installation guide</a>` : ''}${site ? `<a class="an-btn" ${ext(site, 'analysis_optima_site_opened')}>Send mistakes on Optima <span aria-hidden="true">&rarr;</span></a>` : ''}</div>`);
  return '';
}

function renderAnalysis(){
  const root = document.getElementById('analysis-root'); if(!root) return;
  const t = _analysisTest();
  if(!t){ root.innerHTML = `<div class="card"><div style="font-size:13px;color:var(--mu)">${(S.tests || []).length ? 'This test was not found. It may have been deleted.' : 'Loading…'}</div></div>`; return; }
  const job = optimaJobFor(t.id), st = job ? _optStatus(job) : 'none';
  _optOnce('view:' + t.id + ':' + st, 'analysis_status_viewed', { status: st, route: _optIsPw(t.id) ? 'pw' : 'other' });
  let html = _optSummaryCard(t);
  if(st !== 'done') html += _optStatusCard(t, job, st);
  else {
    const link = _optNotebookLink(job, true);
    html += _optStateShell('<span class="an-chip an-chip-ok"><i></i>Ready</span>', 'Your <span class="an-g">error notebook is ready</span>',
      'This test is in your Optima error notebook. It is one link that always stays the same, and new tests are added to it.',
      `${_optProgress(3, false)}<div class="an-row">${link || '<div class="an-sub" style="color:var(--rd)">The notebook link is missing. Try “Check now” in a moment.</div>'}</div>`);
  }
  root.innerHTML = html;
}

// ---- jobs: load, and ask Optima (through our edge function) only when it can matter ----
// Update only the Analysis buttons (and the status page if it is open). Deliberately NOT renderAll():
// the app's Chart.js loader resolves early when a second render arrives while the script is still loading,
// which would blank the Mains/Advanced tables.
function _optimaPaint(){
  document.querySelectorAll('.opt-btn[data-tid]').forEach(b => { b.outerHTML = optimaCellHTML(Number(b.dataset.tid)); });
  if(document.getElementById('page-analysis')?.classList.contains('active')) renderAnalysis();
}

async function optimaLoadJobs(){
  if(!sb || !currentUser) return;
  const [jr, pr] = await Promise.all([
    sb.from('optima_jobs').select('id,test_id,status,question_count,created_at,attempted_at,notebook_url').order('created_at', { ascending: false }).limit(100),
    sb.from('pw_imports').select('test_id').limit(500),
  ]);
  const { data, error } = jr;
  if(error || !data) return;
  if(pr && Array.isArray(pr.data)) _optimaPw = new Set(pr.data.map(r => Number(r.test_id)));
  const before = Object.fromEntries(_optimaJobs.map(j => [j.id, _optStatus(j) + '|' + (j.notebook_url || '')]));
  const justDone = data.filter(j => _optStatus(j) === 'done' && before[j.id] && !before[j.id].startsWith('done'));
  const changed = data.length !== _optimaJobs.length || data.some(j => before[j.id] !== _optStatus(j) + '|' + (j.notebook_url || ''));
  _optimaJobs = data;
  if(justDone.length) toast('Your error notebook is ready');
  if(changed){ try{ _optimaPaint(); }catch(e){} }
}

// Asks the optima-status edge function (which asks Optima, at most once a minute per job) about jobs still being built,
// then re-reads the rows. Not on a timer: only when the tests page loads, the tab is shown again, the status page opens, or "Check now".
async function optimaRefresh(force){
  if(!sb || !currentUser || _optimaRefreshing) return;
  if(!_optimaJobs.some(j => j.status === 'received' || j.status === 'sent')) return;
  if(!force && Date.now() - _optimaLastRefresh < _OPTIMA_REFRESH_MIN_MS) return;
  _optimaRefreshing = true; _optimaLastRefresh = Date.now();
  try{ await sb.functions.invoke('optima-status', { body: {} }); }catch(e){ /* the buttons keep their last known state */ }
  _optimaRefreshing = false;
  await optimaLoadJobs();
}
async function optimaCheckNow(){ _optTrack('analysis_check_now'); await optimaRefresh(true); toast('Checked ✓'); }

// The PW extension adds tests on the server and bumps sync_state.updated_at. When the tab is shown again,
// pull them in, but only if nothing local is waiting to be saved (so no edit is ever overwritten).
async function optimaPullIfServerNewer(){
  if(!sb || !currentUser || isSaving || _saveDebounceTimer) return;
  try{
    const { data } = await sb.from('sync_state').select('updated_at').eq('user_id', currentUser.id).maybeSingle();
    const server = data && data.updated_at ? new Date(data.updated_at).getTime() : null;
    const known = localStorage.getItem('jt3_known_updated_at');
    const local = known ? new Date(known).getTime() : null;
    if(!server || !local || server <= local) return;
    const had = (S.tests || []).length;
    await loadUserData();
    if(typeof renderAll === 'function') renderAll();
    if((S.tests || []).length > had) toast('New test added from PW');
  }catch(e){}
}
document.addEventListener('visibilitychange', () => { if(!document.hidden){ optimaPullIfServerNewer().then(optimaLoadJobs).then(() => optimaRefresh()); } });
optimaLoadJobs().then(() => optimaRefresh());
