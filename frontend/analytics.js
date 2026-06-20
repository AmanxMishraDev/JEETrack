const JT_PH_KEY  = '__POSTHOG_KEY__';
const JT_PH_HOST = '__POSTHOG_HOST__';
// ────────────────────────────────────────────────────────────

// ── Init PostHog ────────────────────────────────────────────
(function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js";(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;void 0!==a?u=e[a]=[]:a="posthog";u.people=u.people||[];u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e};u.people.toString=function(){return u.toString(1)+".people (stub)"};o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" ");for(var c=0;c<o.length;c++)g(u,o[c]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]));

posthog.init(JT_PH_KEY, {
  api_host: JT_PH_HOST,
  capture_pageview: false,    // we handle manually
  capture_pageleave: true,
  autocapture: false,
  persistence: 'localStorage',
  loaded: function() {
    console.log('[JEETrack Analytics] PostHog ready ✓');
  }
});

// ── User Identify ───────────────────────────────────────────
// Called after login — patches into app.js's showApp()
window._jtIdentify = function(user, profile) {
  if (!user?.id) return;
  posthog.identify(user.id, {
    email: user.email,
    name: profile?.username || profile?.name || '',
    class: profile?.class || '',
    target_year: profile?.target_year || '',
    study_mode: profile?.study_mode || '',
    coaching: profile?.coaching || '',
    created_at: user.created_at || '',
  });
};

// ── Core Tracker ────────────────────────────────────────────
window._jtTrack = function(event, props) {
  try { posthog.capture(event, props || {}); } catch(e) {}
};

// ── PAGE VIEW TRACKER ───────────────────────────────────────
// Patches mobNavTo to fire page_viewed events automatically
document.addEventListener('DOMContentLoaded', function() {
  // Wait for app.js to define mobNavTo
  const _patchNav = function() {
    if (typeof mobNavTo !== 'function') {
      setTimeout(_patchNav, 300);
      return;
    }
    const _orig = mobNavTo;
    window.mobNavTo = function(page, el) {
      _jtTrack('page_viewed', { page: page });
      return _orig.call(this, page, el);
    };
    console.log('[JEETrack Analytics] Nav tracking active ✓');
  };
  _patchNav();

  // Patch showApp for user identify + login tracking
  const _patchShowApp = function() {
    if (typeof showApp !== 'function') {
      setTimeout(_patchShowApp, 300);
      return;
    }
    const _origShowApp = showApp;
    window.showApp = function(name, email) {
      // Identify user in PostHog on app load
      if (typeof currentUser !== 'undefined' && currentUser) {
        const profile = typeof userProfile !== 'undefined' ? userProfile : {};
        _jtIdentify(currentUser, { ...profile, name, email });
        _jtTrack('app_opened', { name, email });
      }
      return _origShowApp.call(this, name, email);
    };
  };
  _patchShowApp();

  // Patch doAuth for signup/login tracking
  const _patchAuth = function() {
    if (typeof doAuth !== 'function') {
      setTimeout(_patchAuth, 300);
      return;
    }
    const _origDoAuth = doAuth;
    window.doAuth = async function() {
      const tab = typeof authTab !== 'undefined' ? authTab : 'login';
      const result = await _origDoAuth.call(this);
      // Track after success — check if no error shown
      const errEl = document.getElementById('auth-err');
      const isErr = errEl && errEl.style.display !== 'none' && errEl.textContent;
      if (!isErr) {
        _jtTrack(tab === 'signup' ? 'user_signed_up' : 'user_logged_in', { method: 'email' });
      }
      return result;
    };
  };
  _patchAuth();

  // Patch doGoogleAuth
  const _patchGoogle = function() {
    if (typeof doGoogleAuth !== 'function') {
      setTimeout(_patchGoogle, 300);
      return;
    }
    const _origGoogle = doGoogleAuth;
    window.doGoogleAuth = async function() {
      _jtTrack('google_auth_clicked');
      return _origGoogle.call(this);
    };
  };
  _patchGoogle();

  // Patch signOut
  const _patchSignOut = function() {
    if (typeof signOut !== 'function') {
      setTimeout(_patchSignOut, 300);
      return;
    }
    const _origSignOut = signOut;
    window.signOut = async function() {
      _jtTrack('user_logged_out');
      posthog.reset();
      return _origSignOut.call(this);
    };
  };
  _patchSignOut();

  // Patch finishOnboarding
  const _patchOnboard = function() {
    if (typeof finishOnboarding !== 'function') {
      setTimeout(_patchOnboard, 300);
      return;
    }
    const _origOnboard = finishOnboarding;
    window.finishOnboarding = async function() {
      _jtTrack('onboarding_completed');
      return _origOnboard.call(this);
    };
  };
  _patchOnboard();

  // Patch save() to track feature usage on state changes
  const _patchSave = function() {
    if (typeof save !== 'function') {
      setTimeout(_patchSave, 400);
      return;
    }
    let _prevTests = 0, _prevHours = 0, _prevBacklogs = 0,
        _prevTodos = 0, _prevSylPh = 0, _prevSylCh = 0, _prevSylMa = 0;

    const _origSave = save;
    window.save = async function() {
      // Capture state BEFORE save
      const S = window.S;
      if (S) {
        const curTests    = S.tests?.length || 0;
        const curHours    = S.hours?.length || 0;
        const curBacklogs = S.backlogs?.filter(b => !b.done).length || 0;
        const curTodos    = S.todos?.filter(t => !t.done).length || 0;
        const curSylPh    = (S.syllabus?.physics || []).filter(c => c.theory || c.practice).length;
        const curSylCh    = (S.syllabus?.chemistry || []).filter(c => c.theory || c.practice).length;
        const curSylMa    = (S.syllabus?.maths || []).filter(c => c.theory || c.practice).length;

        // Mock Test logged
        if (curTests > _prevTests) {
          const latest = S.tests[S.tests.length - 1];
          _jtTrack('mock_test_logged', {
            exam_type:       latest?.exam || '',
            test_type:       latest?.type || '',
            total_score:     latest?.total || 0,
            max_score:       latest?.max || 300,
            physics_score:   latest?.physics || 0,
            chemistry_score: latest?.chemistry || 0,
            maths_score:     latest?.maths || 0,
          });
        }

        // Study Hours logged
        if (curHours > _prevHours) {
          const latest = S.hours[S.hours.length - 1];
          _jtTrack('study_hours_logged', {
            subject:  latest?.subject || '',
            total:    latest?.total || 0,
            lecture:  latest?.lecture || 0,
            practice: latest?.practice || 0,
            revision: latest?.revision || 0,
          });
        }

        // Backlog added
        if (curBacklogs > _prevBacklogs) {
          const latest = S.backlogs.filter(b => !b.done).slice(-1)[0];
          _jtTrack('backlog_task_added', {
            subject:  latest?.subject || '',
            priority: latest?.priority || '',
          });
        }

        // Todo added
        if (curTodos > _prevTodos) {
          const latest = S.todos.filter(t => !t.done).slice(-1)[0];
          _jtTrack('todo_task_added', {
            subject:  latest?.subject || '',
            priority: latest?.priority || '',
          });
        }

        // Syllabus chapter marked
        if (curSylPh > _prevSylPh) _jtTrack('chapter_marked', { subject: 'physics' });
        if (curSylCh > _prevSylCh) _jtTrack('chapter_marked', { subject: 'chemistry' });
        if (curSylMa > _prevSylMa) _jtTrack('chapter_marked', { subject: 'maths' });

        // Update prev counts
        _prevTests    = curTests;
        _prevHours    = curHours;
        _prevBacklogs = curBacklogs;
        _prevTodos    = curTodos;
        _prevSylPh    = curSylPh;
        _prevSylCh    = curSylCh;
        _prevSylMa    = curSylMa;
      }

      return _origSave.call(this);
    };
    console.log('[JEETrack Analytics] Save tracking active ✓');
  };
  _patchSave();

  // AI Insights tracking — patch generateInsights or watch button click
  const _watchAIButton = function() {
    const btn = document.querySelector('[onclick*="generateInsights"], [onclick*="getInsights"], #ai-gen-btn, .ai-generate-btn');
    if (!btn) {
      setTimeout(_watchAIButton, 1000);
      return;
    }
    btn.addEventListener('click', function() {
      _jtTrack('ai_insights_generated', {
        has_mock_data:     (window.S?.tests?.length || 0) > 0,
        has_study_hours:   (window.S?.hours?.length || 0) > 0,
        has_syllabus_data: Object.values(window.S?.syllabus || {}).some(arr => arr.length > 0),
      });
    });
    console.log('[JEETrack Analytics] AI button tracking active ✓');
  };
  _watchAIButton();

  // Feedback tracking
  const _watchFeedback = function() {
    if (typeof sendFeedback !== 'function') {
      setTimeout(_watchFeedback, 800);
      return;
    }
    const _origFeedback = sendFeedback;
    window.sendFeedback = async function() {
      _jtTrack('feedback_submitted');
      return _origFeedback.call(this);
    };
  };
  _watchFeedback();

  // Export PDF tracking
  const _watchExport = function() {
    if (typeof exportPDF !== 'function') {
      setTimeout(_watchExport, 800);
      return;
    }
    const _origExport = exportPDF;
    window.exportPDF = async function() {
      _jtTrack('data_exported', { type: 'pdf' });
      return _origExport.call(this);
    };
  };
  _watchExport();

});
// ── End of JEETrack Analytics ────────────────────────────────
