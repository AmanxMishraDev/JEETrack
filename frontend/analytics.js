







// These "✓ tracking active" confirmations are only useful while you're
// actively developing/testing analytics wiring — on the real production
// domain they're just console noise for every visitor. Auto-silences on
// jeetrack.in, stays on everywhere else (localhost, vercel preview URLs).
const _JT_DEBUG = !/^(www\.)?jeetrack\.in$/.test(location.hostname);
function _jtLog(...args){ if(_JT_DEBUG) console.log(...args); }

(function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js";(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;void 0!==a?u=e[a]=[]:a="posthog";u.people=u.people||[];u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e};u.people.toString=function(){return u.toString(1)+".people (stub)"};o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" ");for(var c=0;c<o.length;c++)g(u,o[c]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]));


async function initAnalytics() {
  try {
    const res = await fetch('/api/config');
    const cfg = await res.json();
    if (!cfg.posthogKey) {
      console.warn('[JEETrack Analytics] No PostHog key found');
      return;
    }

    posthog.init(cfg.posthogKey, {
      api_host: 'https://us.i.posthog.com',  
      capture_pageview: false,
      capture_pageleave: true,
      capture_exceptions: true,
      autocapture: false,
      persistence: 'localStorage',
      session_recording: {
        maskAllInputs: true,
        maskInputFn: (text, element) => {
          if (element?.type === 'password') return '***';
          return text;
        }
      },
      loaded: function() {
        _jtLog('[JEETrack Analytics] Ready ✓');
        attachPatches();
      }
    });
  } catch(e) {
    console.warn('[JEETrack Analytics] Init failed:', e);
  }
}


window._jtIdentify = function(user, profile) {
  if (!user?.id) return;
  try {
    posthog.identify(user.id, {
      email: user.email,
      name: profile?.username || profile?.name || '',
      class: profile?.class || '',
      target_year: profile?.target_year || '',
      study_mode: profile?.study_mode || '',
      coaching: profile?.coaching || '',
      created_at: user.created_at || '',
    });
  } catch(e) {}
};


window._jtTrack = function(event, props) {
  try { posthog.capture(event, props || {}); } catch(e) {}
};


function attachPatches() {

  
  const _patchNav = function() {
    if (typeof nav !== 'function') { setTimeout(_patchNav, 300); return; }
    const _orig = nav;
    window.nav = function(page, _pushState) {
      _jtTrack('page_viewed', { page: page });
      return _orig.call(this, page, _pushState);
    };
    _jtLog('[JEETrack Analytics] Nav tracking active ✓');
  };
  _patchNav();

  
  const _patchShowApp = function() {
    if (typeof showApp !== 'function') { setTimeout(_patchShowApp, 300); return; }
    const _orig = showApp;
    window.showApp = function(name, email) {
      try {
        if (typeof currentUser !== 'undefined' && currentUser) {
          const profile = typeof userProfile !== 'undefined' ? userProfile : {};
          _jtIdentify(currentUser, { ...profile, name, email });
          _jtTrack('app_opened', { name, email });
        }
      } catch(e) {}
      return _orig.call(this, name, email);
    };
  };
  _patchShowApp();

  
  const _patchAuth = function() {
    if (typeof doAuth !== 'function') { setTimeout(_patchAuth, 300); return; }
    const _orig = doAuth;
    window.doAuth = async function() {
      const tab = typeof authTab !== 'undefined' ? authTab : 'login';
      const result = await _orig.call(this);
      try {
        const errEl = document.getElementById('auth-err');
        const isErr = errEl && errEl.style.display !== 'none' && errEl.textContent;
        // NOTE: `user_signed_up` is fired from finishOnboarding() instead (see
        // below), not here — because EVERY new user (Google or email) goes
        // through onboarding, but doAuth only ever runs for the email flow.
        // Firing it here too undercounted Google sign-ups almost entirely.
        if (!isErr && tab !== 'signup') {
          _jtTrack('user_logged_in', { method: 'email' });
        }
      } catch(e) {}
      return result;
    };
  };
  _patchAuth();

  
  const _patchGoogle = function() {
    if (typeof doGoogleAuth !== 'function') { setTimeout(_patchGoogle, 300); return; }
    const _orig = doGoogleAuth;
    window.doGoogleAuth = async function() {
      _jtTrack('google_auth_clicked');
      return _orig.call(this);
    };
  };
  _patchGoogle();

  
  const _patchSignOut = function() {
    if (typeof signOut !== 'function') { setTimeout(_patchSignOut, 300); return; }
    const _orig = signOut;
    window.signOut = async function() {
      _jtTrack('user_logged_out');
      try { posthog.reset(); } catch(e) {}
      return _orig.call(this);
    };
  };
  _patchSignOut();

  
  const _patchOnboard = function() {
    if (typeof finishOnboarding !== 'function') { setTimeout(_patchOnboard, 300); return; }
    const _orig = finishOnboarding;
    window.finishOnboarding = async function() {
      // Auth-method-agnostic "new signup" signal: every brand-new user (via
      // Google OR email) goes through onboarding exactly once, so this is a
      // more reliable place to fire user_signed_up than the email-only auth
      // patch above. Guarded by a localStorage flag so it only ever fires
      // once per user even if finishOnboarding somehow runs twice.
      try {
        const uid = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.id : null;
        const key = uid ? 'jt_signup_tracked_' + uid : null;
        if (!key || localStorage.getItem(key) !== '1') {
          _jtTrack('user_signed_up');
          if (key) localStorage.setItem(key, '1');
        }
      } catch(e) {}
      _jtTrack('onboarding_completed');
      return _orig.call(this);
    };
  };
  _patchOnboard();


  
  const _patchSave = function() {
    if (typeof save !== 'function') { setTimeout(_patchSave, 400); return; }
    // Seed from the REAL current counts (not all-zero) so the first save()
    // call of a session doesn't mistake pre-existing rows for "newly added".
    const _seed = (typeof S !== 'undefined' && S) ? {
      tests:    S.tests?.length || 0,
      hours:    S.hours?.length || 0,
      backlogs: (S.backlogs || []).filter(b => !b.done).length,
      todos:    (S.todos || []).filter(t => !t.done).length,
      sylPh:    (S.syllabus?.physics || []).filter(c => c.theory === true || c.practice === true).length,
      sylCh:    (S.syllabus?.chemistry || []).filter(c => c.theory === true || c.practice === true).length,
      sylMa:    (S.syllabus?.maths || []).filter(c => c.theory === true || c.practice === true).length,
    } : { tests:0, hours:0, backlogs:0, todos:0, sylPh:0, sylCh:0, sylMa:0 };
    let _prev = _seed;
    const _orig = save;
    window.save = async function() {
      try {
        // NOTE: `S` is declared with `let S = ...` in index.html, so it never
        // attaches to `window.S` (only `var` top-level declarations do). It IS
        // still reachable here as a bare identifier, because every classic
        // <script> tag on the page shares one global lexical scope — so we use
        // the ambient `S` directly below instead of aliasing `window.S` (which
        // was always undefined and silently skipped this entire block before).
        if (typeof S !== 'undefined' && S) {
          const cur = {
            tests:    S.tests?.length || 0,
            hours:    S.hours?.length || 0,
            backlogs: (S.backlogs || []).filter(b => !b.done).length,
            todos:    (S.todos || []).filter(t => !t.done).length,
            sylPh:    (S.syllabus?.physics || []).filter(c => c.theory === true || c.practice === true).length,
            sylCh:    (S.syllabus?.chemistry || []).filter(c => c.theory === true || c.practice === true).length,
            sylMa:    (S.syllabus?.maths || []).filter(c => c.theory === true || c.practice === true).length,
          };

          if (cur.tests > _prev.tests) {
            const l = S.tests[S.tests.length - 1] || {};
            _jtTrack('mock_test_logged', {
              exam_type:       l.exam || '',
              test_type:       l.type || '',
              total_score:     l.total || 0,
              physics_score:   l.physics || 0,
              chemistry_score: l.chemistry || 0,
              maths_score:     l.maths || 0,
            });
          }
          if (cur.hours > _prev.hours) {
            const l = S.hours[S.hours.length - 1] || {};
            _jtTrack('study_hours_logged', {
              subject: l.subject || '',
              total:   l.total || 0,
            });
          }
          if (cur.backlogs > _prev.backlogs) {
            const l = (S.backlogs || []).filter(b => !b.done).slice(-1)[0] || {};
            _jtTrack('backlog_task_added', { subject: l.subject || '', priority: l.priority || '' });
          }
          if (cur.todos > _prev.todos) {
            const l = (S.todos || []).filter(t => !t.done).slice(-1)[0] || {};
            _jtTrack('todo_task_added', { subject: l.subject || '', priority: l.priority || '' });
          }
          
          const _onlySyl = cur.tests === _prev.tests && cur.hours === _prev.hours && cur.backlogs === _prev.backlogs && cur.todos === _prev.todos;
          if (_onlySyl && cur.sylPh > _prev.sylPh) _jtTrack('chapter_marked', { subject: 'physics', count: cur.sylPh - _prev.sylPh });
          if (_onlySyl && cur.sylCh > _prev.sylCh) _jtTrack('chapter_marked', { subject: 'chemistry', count: cur.sylCh - _prev.sylCh });
          if (_onlySyl && cur.sylMa > _prev.sylMa) _jtTrack('chapter_marked', { subject: 'maths', count: cur.sylMa - _prev.sylMa });

          _prev = cur;
        }
      } catch(e) {}
      return _orig.call(this);
    };
    _jtLog('[JEETrack Analytics] Save tracking active ✓');
  };
  _patchSave();

  
  const _patchSaveChapter = function() {
    if (typeof saveChapter !== 'function') { setTimeout(_patchSaveChapter, 400); return; }
    const _orig = saveChapter;
    window.saveChapter = function() {
      try {
        const name = document.getElementById('ch-name')?.value?.trim();
        const subj = document.getElementById('ch-subj-i')?.value;
        if (name) _jtTrack('custom_chapter_added', { subject: subj || '' });
      } catch(e) {}
      return _orig.apply(this, arguments);
    };
    _jtLog('[JEETrack Analytics] Custom chapter tracking active ✓');
  };
  _patchSaveChapter();

  
  const _patchPracticeLog = function() {
    if (typeof savePracticeLog !== 'function') { setTimeout(_patchPracticeLog, 400); return; }
    const _orig = savePracticeLog;
    window.savePracticeLog = function() {
      const before = (typeof S !== 'undefined' && S && S.practiceLogs) ? S.practiceLogs.length : -1;
      const result = _orig.apply(this, arguments);
      try {
        if (before >= 0 && S.practiceLogs && S.practiceLogs.length > before) {
          const l = S.practiceLogs[S.practiceLogs.length - 1] || {};
          _jtTrack('practice_logged', { subject: l.subject || '', questions: l.questions || 0 });
        }
      } catch(e) {}
      return result;
    };
    _jtLog('[JEETrack Analytics] Practice log tracking active ✓');
  };
  _patchPracticeLog();

  
  const _watchAI = function() {
    const btn = document.querySelector('[onclick*="generateInsights"],[onclick*="getInsights"],#ai-gen-btn,.ai-generate-btn');
    if (!btn) { setTimeout(_watchAI, 1000); return; }
    btn.addEventListener('click', function() {
      _jtTrack('ai_insights_generated', {
        has_mock_data:     (window.S?.tests?.length || 0) > 0,
        has_study_hours:   (window.S?.hours?.length || 0) > 0,
        has_syllabus_data: Object.values(window.S?.syllabus || {}).some(a => a.length > 0),
      });
    });
    _jtLog('[JEETrack Analytics] AI button tracking active ✓');
  };
  _watchAI();

  
  const _watchFeedback = function() {
    if (typeof sendFeedback !== 'function') { setTimeout(_watchFeedback, 800); return; }
    const _orig = sendFeedback;
    window.sendFeedback = async function() {
      _jtTrack('feedback_submitted');
      return _orig.call(this);
    };
  };
  _watchFeedback();

  
  const _watchExport = function() {
    if (typeof exportPDF !== 'function') { setTimeout(_watchExport, 800); return; }
    const _orig = exportPDF;
    window.exportPDF = async function() {
      _jtTrack('data_exported', { type: 'pdf' });
      return _orig.call(this);
    };
  };
  _watchExport();
}


initAnalytics();
