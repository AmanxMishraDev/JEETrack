






if ('serviceWorker' in navigator) {
  let _swReloadingAlready = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (_swReloadingAlready) return; 
    _swReloadingAlready = true;
    window.location.reload();
  });
  
  
  navigator.serviceWorker.getRegistration().then(reg => {
    if (!reg) return;
    reg.update().catch(()=>{});
    setInterval(() => reg.update().catch(()=>{}), 60 * 60 * 1000); 
  }).catch(()=>{});
}

let SUPABASE_URL = null;
let SUPABASE_ANON_KEY = null;
let TURNSTILE_SITE_KEY = null;

let sb = null;
let currentUser = null;
let isSaving = false;
let saveQueue = false;
let _appInitialized = false; 

function _shouldShowOnboarding(userId, profileStatus) {
  if (profileStatus === 'error' || profileStatus === 'no_client') return false; 
  if (userProfile.onboarding_done) return false;  
  return true;                                     
}

function _withTimeout(promise, ms, label){
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error((label || 'Request') + ' timed out')), ms))
  ]);
}

// ── Online/offline banner ──
// Reassures the user their work isn't lost (save() always writes to
// localStorage first, regardless of network — see save()), and pushes any
// pending changes the moment the connection comes back, since _syncToServer
// only fires from save()/flushSave() and wouldn't otherwise retry on its own
// after a failed attempt until the user edits something again.
let _backOnlineHideTimer = null;
function _updateNetworkBanner(isOnline){
  const el = document.getElementById('network-banner');
  if(!el) return;
  clearTimeout(_backOnlineHideTimer);
  if(!isOnline){
    el.className = 'show offline';
    el.textContent = "You're offline — your progress is saved on this device and will sync once you're back online.";
  } else {
    el.className = 'show online';
    el.textContent = "Back online — syncing your data\u2026";
    if(sb && currentUser && typeof flushSave === 'function') flushSave();
    _backOnlineHideTimer = setTimeout(() => { el.className = ''; }, 3000);
  }
}
window.addEventListener('online', () => _updateNetworkBanner(true));
window.addEventListener('offline', () => _updateNetworkBanner(false));
if(!navigator.onLine) _updateNetworkBanner(false);

// Everything needed to render the authenticated dashboard (nav, all
// .page renderers, sync engine, settings, onboarding, badges, feedback —
// formerly a static <script src="dashboard-controller.js"> tag plus the
// full app.js bundle, loaded unconditionally on every single page view)
// now lives in one lazy-loaded file, fetched only once we actually know
// the visitor has a session. A landing-page visit that never logs in
// never downloads or parses any of it. loadScript() is the small helper
// already defined in index.html (used for Chart.js/jsPDF) — same
// dedupe-via-querySelector behavior, so calling this twice in one
// session (e.g. sign out then back in) is safe.
let _dashboardBundleLoaded = false;
let _dashboardBundlePromise = null;
function loadDashboardBundle() {
  if (_dashboardBundleLoaded) return Promise.resolve();
  if (_dashboardBundlePromise) return _dashboardBundlePromise; // already in flight — share it, don't double-inject
  _dashboardBundlePromise = loadScript('/dashboard-bundle.generated.js').then(() => {
    _dashboardBundleLoaded = true;
  });
  return _dashboardBundlePromise;
}

async function initSupabase(){
  
  let _authResolved = false;
  const _splashSafetyTimer = setTimeout(() => {
    if(!_authResolved) showAuthScreen();
  }, 6000);

  
  if(window.jtSplash) window.jtSplash.setProgress(15, 'Connecting');

  try {
    const res = await fetch('/api/config');
    if(res.ok){
      const cfg = await res.json();
      SUPABASE_URL = cfg.url;
      SUPABASE_ANON_KEY = cfg.key;
      TURNSTILE_SITE_KEY = cfg.turnstileSiteKey || null;
      if(window.jtSplash) window.jtSplash.setProgress(35, 'Preparing dashboard');
    } else {
      
      const res2 = await fetch('/api/config?_=' + Date.now());
      if(res2.ok){ const cfg2=await res2.json(); SUPABASE_URL=cfg2.url; SUPABASE_ANON_KEY=cfg2.key; TURNSTILE_SITE_KEY=cfg2.turnstileSiteKey || null; }
    }
  } catch(e) {
    console.warn('Could not fetch /api/config, retrying\u2026', e);
    
    try {
      const res3 = await fetch('/api/config?_=' + Date.now());
      if(res3.ok){ const cfg3=await res3.json(); SUPABASE_URL=cfg3.url; SUPABASE_ANON_KEY=cfg3.key; TURNSTILE_SITE_KEY=cfg3.turnstileSiteKey || null; }
    } catch(e2) {}
  }

  if(!SUPABASE_URL || !SUPABASE_ANON_KEY){
    // Config fetch genuinely failed after retries. Previously this silently
    // fell back to a fake "Demo User" session showing cached local data under
    // a hardcoded demo@jeetrack.app email — confusing and looked like a
    // session/account mix-up. Show a clear retry screen instead; never fake
    // a logged-in state when we don't actually have one.
    _authResolved = true;
    clearTimeout(_splashSafetyTimer);
    hideSplash();
    showConfigError();
    return;
  }

  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      // Regular fetch() calls get killed by the browser the instant a tab is
      // backgrounded/closed on mobile, which is exactly when flushSave() most
      // needs to land (see visibilitychange/beforeunload below). keepalive
      // tells the browser to let this request finish even after the page
      // that started it goes away — same mechanism sendBeacon uses, but
      // works with our existing PATCH/POST upsert calls.
      fetch: (url, options={}) => fetch(url, { ...options, keepalive: true })
    }
  });

  
  sb.auth.onAuthStateChange((event, session) => {
    if(event === 'PASSWORD_RECOVERY'){
      
      return;
    } else if(event === 'SIGNED_OUT'){
      _appInitialized = false;
      currentUser = null;
      S = (typeof getDefaultState === 'function') ? getDefaultState() : {};
      showAuthScreen(true);
      setTimeout(initSlideshow, 100);
    } else if(event === 'SIGNED_IN' && session?.user){
      if(_appInitialized) return; 
      _appInitialized = true;
      currentUser = session.user;
      loadDashboardBundle().then(() => _withTimeout(loadUserData(), 15000, 'Loading your data')).then(async () => {
        const profileStatus = await loadUserProfile();
        const needsOnboarding = _shouldShowOnboarding(session.user.id, profileStatus);
        if(needsOnboarding){
          hideSplash();
          document.getElementById('landing').classList.add('hidden');
          showOnboarding();
        } else {
          const name = userProfile.username || session.user.user_metadata?.full_name || session.user.email.split('@')[0];
          showApp(name, session.user.email);
        }
        registerPushNotifications();
      }).catch((err) => {
        console.warn('Failed to load user data', err);
        _appInitialized = false;
        hideSplash();
        showConfigError('Couldn\u2019t load your data. Check your connection and try again.');
      });
    }
  });

  
  const _recoveryParams = new URLSearchParams(window.location.search);
  const _recoveryTokenHash = _recoveryParams.get('token_hash');
  const _isRecoveryLink = _recoveryParams.get('type') === 'recovery' && !!_recoveryTokenHash;

  if(_isRecoveryLink){
    
    history.replaceState(null, '', window.location.pathname);
    _authResolved = true;
    clearTimeout(_splashSafetyTimer);
    try {
      const { error: _recErr } = await sb.auth.verifyOtp({ token_hash: _recoveryTokenHash, type: 'recovery' });
      hideSplash();
      document.getElementById('landing')?.classList.remove('hidden');
      showAuthScreen();
      if(_recErr){
        toast(_recErr.message || 'This reset link has expired. Please request a new one.', 'error');
      } else {
        await loadDashboardBundle();
        openM('newPassword');
      }
    } catch(e){
      hideSplash();
      document.getElementById('landing')?.classList.remove('hidden');
      showAuthScreen();
      toast('This reset link is invalid or expired. Please request a new one.', 'error');
    }
    return; 
  }

  sb.auth.getSession().then(({ data: { session } }) => {
    _authResolved = true;
    clearTimeout(_splashSafetyTimer);
    if(session?.user){
      if(_appInitialized) return; 
      _appInitialized = true;
      currentUser = session.user;
      if(window.jtSplash) window.jtSplash.setProgress(55, 'Loading your data');
      // Two-stage wait instead of one hard 15s cutoff: a brief slowdown
      // (DB under load, a busy morning peak, etc.) used to hit this same
      // 15s ceiling as a genuine outage, dropping straight to a "Couldn't
      // load your data — Retry" screen whose retry does a full page
      // reload (see retryConfigLoad()). During a real slowdown that meant
      // every affected user reloaded within seconds of each other — a
      // reload storm landing on a server that was already struggling,
      // making things worse right when it could least afford it. Now: at
      // 15s, just reassure ("still working") without failing anything —
      // real responses during a degraded-but-recovering window have been
      // observed completing well under a minute. Only offer the
      // reload-based retry after 45s total, a threshold actual outages
      // clear but brief load spikes generally don't.
      const _stillWorkingTimer = setTimeout(() => {
        if(window.jtSplash) window.jtSplash.setProgress(55, 'Still working — hang tight, this can take a bit longer than usual');
      }, 15000);
      loadDashboardBundle().then(() => _withTimeout(loadUserData(), 45000, 'Loading your data')).then(async () => {
        clearTimeout(_stillWorkingTimer);
        const profileStatus = await loadUserProfile();
        if(window.jtSplash) window.jtSplash.setProgress(90, 'Almost ready');
        const needsOnboarding = _shouldShowOnboarding(session.user.id, profileStatus);
        if(needsOnboarding){
          hideSplash();
          document.getElementById('landing').classList.add('hidden');
          showOnboarding();
        } else {
          
          const name = userProfile.username || session.user.user_metadata?.full_name || session.user.email.split('@')[0];
          showApp(name, session.user.email);
          registerPushNotifications();
        }
      }).catch((err) => {
        clearTimeout(_stillWorkingTimer);
        console.warn('Failed to load user data', err);
        _appInitialized = false;
        hideSplash();
        showConfigError('Couldn\u2019t load your data. Check your connection and try again.');
      });
    } else {
      showAuthScreen();
      setTimeout(initSlideshow, 100);
    }
  });
}

let authTab = 'login';
let _authSlideAnimating = false;

// ── Turnstile (CAPTCHA) ──
// Rendered lazily the first time the auth modal opens (landingOpenAuth),
// not on page load — no reason to spend a challenge on someone who never
// clicks Sign In. Silently does nothing if TURNSTILE_SITE_KEY isn't
// configured yet (see /api/config), so shipping this doesn't require the
// env var to be set first — same optional-feature pattern as PostHog.
let _turnstileWidgetIds = { login: null, signup: null };
let _turnstileTokens = { login: null, signup: null };
let _turnstileRenderAttempts = 0;

function _renderTurnstileWidgets(){
  if(!TURNSTILE_SITE_KEY) return;
  if(typeof window.turnstile === 'undefined'){
    // The script tag is async — on a slow connection it may not have
    // finished loading yet by the time the modal first opens.
    if(_turnstileRenderAttempts++ < 20) setTimeout(_renderTurnstileWidgets, 250);
    return;
  }
  ['login','signup'].forEach(mode => {
    if(_turnstileWidgetIds[mode] !== null) return; 
    const el = document.getElementById('turnstile-' + mode);
    if(!el) return;
    _turnstileWidgetIds[mode] = window.turnstile.render(el, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'dark',
      callback: (token) => { _turnstileTokens[mode] = token; },
      'expired-callback': () => { _turnstileTokens[mode] = null; },
      'error-callback': () => { _turnstileTokens[mode] = null; },
    });
  });
}

function _resetTurnstile(mode){
  _turnstileTokens[mode] = null;
  if(TURNSTILE_SITE_KEY && typeof window.turnstile !== 'undefined' && _turnstileWidgetIds[mode] !== null){
    try { window.turnstile.reset(_turnstileWidgetIds[mode]); } catch(e) {}
  }
}

// ── Client-side login attempt backoff ──
// Cosmetic/UX layer only — Supabase Auth (and now Turnstile) are the real
// enforcement. This just stops someone from mashing the Sign In button and
// gives a clear "wait a bit" message instead of a wall of server errors.
// Resets on page reload by design; not meant to survive a refresh.
const _loginAttemptState = {}; // email(lowercased) -> { count, blockedUntil }
const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_ATTEMPT_COOLDOWN_MS = 60 * 1000;

function _checkLoginBackoff(email){
  const rec = _loginAttemptState[email];
  if(!rec || !rec.blockedUntil) return { blocked: false };
  const remainingMs = rec.blockedUntil - Date.now();
  if(remainingMs <= 0){ delete _loginAttemptState[email]; return { blocked: false }; }
  return { blocked: true, remainingSec: Math.ceil(remainingMs / 1000) };
}

function _recordLoginFailure(email){
  const rec = _loginAttemptState[email] || { count: 0, blockedUntil: null };
  rec.count++;
  if(rec.count >= LOGIN_ATTEMPT_LIMIT){
    rec.blockedUntil = Date.now() + LOGIN_ATTEMPT_COOLDOWN_MS;
    rec.count = 0; 
  }
  _loginAttemptState[email] = rec;
}

function _clearLoginFailures(email){ delete _loginAttemptState[email]; }


