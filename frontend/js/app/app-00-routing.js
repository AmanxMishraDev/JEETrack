const _routeMap = {
  '/':'overview', '/dashboard':'overview', '/mains':'mains', '/advanced':'advanced',
  '/compare':'compare', '/tests':'tests', '/hours':'hours', '/todo':'todo',
  '/backlog':'backlog', '/syllabus':'syllabus', '/practice':'practice', '/insights':'insights', '/settings':'settings',
  
  '/login':'__login__', '/onboarding':'__onboarding__',
};
const _pageToPath = {
  overview:'/dashboard', mains:'/mains', advanced:'/advanced', compare:'/compare',
  tests:'/tests', hours:'/hours', todo:'/todo', backlog:'/backlog',
  syllabus:'/syllabus', practice:'/practice', insights:'/insights', settings:'/settings',
};
const _pageTitles = {
  overview:'Dashboard', mains:'JEE Mains', advanced:'JEE Advanced', compare:'Compare',
  tests:'Tests', hours:'Study Hours', todo:'To-Do', backlog:'Backlog',
  syllabus:'Syllabus', practice:'Practice Log', insights:'AI Insights', settings:'Settings',
};
const _settingsTabs = ['profile','study','goals','appearance','alerts','data','account','feedback','contact'];


const _staticPages = ['/faq','/privacy','/terms','/admin'];

function _isKnownPath(path){
  if(path==='/index.html') return true;
  if(_routeMap.hasOwnProperty(path)) return true;
  if(_staticPages.includes(path)) return true;
  return false;
}

function show404(){
  hideSplash();
  document.getElementById('landing')?.classList.add('hidden');
  document.getElementById('onboarding')?.classList.remove('show');
  const app=document.getElementById('main-app'); if(app) app.style.display='none';
  document.getElementById('not-found')?.classList.remove('hidden');
  document.title = '404 — Negative Marking — JEETrack';
}

function _setRobotsMeta(shouldIndex){
  const m = document.getElementById('meta-robots');
  if(m) m.setAttribute('content', shouldIndex ? 'index, follow' : 'noindex, follow');
}

// Generic UI primitives used by both landing/auth-only visits and the
// dashboard — moved here from dashboard-controller.js after the
// lazy-loading split above surfaced real bugs: the password-recovery
// flow (reachable before any login, so before the dashboard bundle would
// ever load) opens a modal and shows toast messages, and the landing
// page's count-up stat display calls fmt() directly during its own
// rendering (no async point available to defer it behind a bundle load).
// Both are self-contained (only touch fixed DOM elements that exist in
// the static page shell regardless of auth state), so moving them here
// is safe — dashboard-only code that also uses them (there's plenty)
// just reads them as an already-loaded global, same as any other core
// export.
function fmt(d){if(!d)return'—';const x=new Date(d+'T00:00:00');return x.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}
function toast(msg, type='') {
  const t = document.getElementById('toast');
  const iconEl = document.getElementById('toast-icon');
  const msgEl = document.getElementById('toast-msg');
  const barEl = document.getElementById('toast-bar');

  
  if (!type) {
    const m = msg.toLowerCase();
    if (m.includes('saving') || m.includes('…')) type = 'saving';
    else if (m.includes('✓') || m.includes('saved') || m.includes('success') || m.includes('done') || m.includes('added') || m.includes('created') || m.includes('updated') || m.includes('undone') || m.includes('imported') || m.includes('exported') || m.includes('reset') || m.includes('🎯') || m.includes('↩') || m.includes('✅')) type = 'success';
    else if (m.includes('error') || m.includes('failed') || m.includes('invalid') || m.includes('wrong') || m.includes('⚠') || m.includes('❌')) type = 'error';
    else if (m.includes('warning') || m.includes('caution')) type = 'warning';
    else if (m.includes('tip') || m.includes('info') || m.includes('ℹ')) type = 'info';
  }

  const icons = {
    success: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    warning: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info:    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    saving:  '<div class="toast-spinner"></div>',
    '':      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  if (iconEl) iconEl.innerHTML = icons[type] || icons[''];
  if (msgEl) msgEl.textContent = msg;
  
  if (barEl) { barEl.style.animation = 'none'; barEl.offsetHeight; barEl.style.animation = ''; }

  
  const ub = document.getElementById('undobar');
  const aboveUndo = ub && ub.classList.contains('show');
  t.className = 'toast show' + (type ? ' toast-' + type : '') + (aboveUndo ? ' above-undo' : '');
  clearTimeout(t._timer);
  const delay = type === 'saving' ? 60000 : 2800;
  t._timer = setTimeout(() => { t.classList.remove('show', 'above-undo'); }, delay);
}
function toastDismiss() { const t=document.getElementById('toast'); clearTimeout(t._timer); t.classList.remove('show','above-undo'); }
function toastTopWarn(msg, duration=6000) {
  const t = document.getElementById('toast-top-warn');
  const msgEl = document.getElementById('toast-top-warn-msg');
  if (!t || !msgEl) return;
  msgEl.textContent = msg;
  
  const bar = t.querySelector('.toast-bar');
  if (bar) { bar.style.animation='none'; bar.offsetHeight; bar.style.animationDuration=duration+'ms'; bar.style.animation='toastBarShrink '+duration+'ms linear forwards'; }
  t.classList.add('show');
  clearTimeout(t._warnTimer);
  t._warnTimer = setTimeout(() => t.classList.remove('show'), duration);
}

// The app's actual boot trigger. Runs regardless of auth state — this is
// what kicks off initSupabase() (config fetch, session check, and from
// there either the landing/auth screen or, once a session is confirmed,
// loading the dashboard bundle — see initSupabase() in app-01-boot-auth.js
// and loadDashboardBundle() there). Used to live buried inside
// app-09-settings.js's own DOMContentLoaded handler, mixed in with
// settings-page-only DOM wiring — moved here since it needs to fire
// immediately for every visitor, not just once the settings/dashboard
// code has loaded.
document.addEventListener('DOMContentLoaded', () => {
  if (!_isKnownPath(window.location.pathname)) {
    show404();
    return;
  }
  initSupabase();
});
