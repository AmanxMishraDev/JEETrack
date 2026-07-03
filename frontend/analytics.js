





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
        console.log('[JEETrack Analytics] Ready ✓');
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
    if (typeof mobNavTo !== 'function') { setTimeout(_patchNav, 300); return; }
    const _orig = mobNavTo;
    window.mobNavTo = function(page, el) {
      _jtTrack('page_viewed', { page: page });
      return _orig.call(this, page, el);
    };
    console.log('[JEETrack Analytics] Nav tracking active ✓');
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
        if (!isErr) {
          _jtTrack(tab === 'signup' ? 'user_signed_up' : 'user_logged_in', { method: 'email' });
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
      _jtTrack('onboarding_completed');
      return _orig.call(this);
    };
  };
  _patchOnboard();

  
  const _patchSave = function() {
    if (typeof save !== 'function') { setTimeout(_patchSave, 400); return; }
    let _prev = { tests:0, hours:0, backlogs:0, todos:0, sylPh:0, sylCh:0, sylMa:0 };
    const _orig = save;
    window.save = async function() {
      try {
        const S = window.S;
        if (S) {
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
    console.log('[JEETrack Analytics] Save tracking active ✓');
  };
  _patchSave();

  
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
    console.log('[JEETrack Analytics] AI button tracking active ✓');
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
