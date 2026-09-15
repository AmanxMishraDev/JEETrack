function switchAuthMode(mode){
  if (mode === authTab || _authSlideAnimating) return;
  const viewport = document.getElementById('auth-slide-viewport');
  const current = document.getElementById('auth-slide-' + authTab);
  const next = document.getElementById('auth-slide-' + mode);
  if (!viewport || !current || !next) { authTab = mode; return; }

  _authSlideAnimating = true;
  const goingForward = mode === 'signup'; 
  current.classList.add(goingForward ? 'slide-out-left' : 'slide-out-right');
  next.classList.add('active', goingForward ? 'slide-in-right' : 'slide-in-left');

  
  next.style.position='absolute'; next.style.visibility='hidden'; next.style.display='block';
  const nextHeight = next.scrollHeight;
  next.style.position=''; next.style.visibility=''; next.style.display='';
  viewport.style.height = viewport.offsetHeight + 'px';
  requestAnimationFrame(() => { viewport.style.height = nextHeight + 'px'; });

  authTab = mode;
  hideAuthMsgPro(mode==='login'?'signup':'login');

  setTimeout(() => {
    current.classList.remove('active','slide-out-left','slide-out-right');
    next.classList.remove('slide-in-right','slide-in-left');
    viewport.style.height = '';
    _authSlideAnimating = false;
  }, 420);
}


function switchAuthTab(tab){ switchAuthMode(tab); }

function togglePassVisPro(mode){
  const inp=document.getElementById('auth-pass-'+mode);
  const btn=document.getElementById('pass-eye-btn-'+mode);
  const icon=document.getElementById('eye-icon-'+mode);
  const isPass=inp.type==='password';
  inp.type=isPass?'text':'password';
  btn.classList.toggle('active', isPass);
  icon.innerHTML=isPass
    ?'<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
    :'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}
async function doForgotPass(){
  if(!sb){showAuthErrPro('login','Supabase not configured yet.');return;}
  const email=document.getElementById('auth-email-login').value.trim();
  if(!email){showAuthErrPro('login','Enter your email address first, then click Forgot password.');return;}
  const btn=document.querySelector('.auth-forgot-link');
  const originalText = btn ? btn.textContent : '';
  if(btn){btn.textContent='Sending...';btn.disabled=true;}
  try{
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
    if(error)throw error;
    showAuthInfoPro('login','Password reset email sent! Check your inbox and follow the link.');
  }catch(e){showAuthErrPro('login', e.message||'Failed to send reset email.');}
  if(btn){btn.textContent=originalText||'Forgot password?';btn.disabled=false;}
}
async function doUpdatePassword(){
  const errEl = document.getElementById('auth-err-newpass');
  const infoEl = document.getElementById('auth-info-newpass');
  if(errEl) errEl.style.display='none';
  if(infoEl) infoEl.style.display='none';

  if(!sb){ if(errEl){errEl.textContent='Supabase not configured yet.'; errEl.style.display='block';} return; }

  const pass1 = document.getElementById('auth-pass-newpass').value;
  const pass2 = document.getElementById('auth-pass-newpass2').value;

  if(!pass1 || !pass2){
    if(errEl){errEl.textContent='Please fill in both password fields.'; errEl.style.display='block';}
    return;
  }
  if(pass1.length < 6){
    if(errEl){errEl.textContent='Password must be at least 6 characters.'; errEl.style.display='block';}
    return;
  }
  if(pass1 !== pass2){
    if(errEl){errEl.textContent='Passwords do not match.'; errEl.style.display='block';}
    return;
  }

  const btn = document.getElementById('auth-btn-newpass');
  if(btn){ btn.disabled = true; btn.classList.add('loading'); }

  try{
    const { error } = await sb.auth.updateUser({ password: pass1 });
    if(error) throw error;

    if(infoEl){ infoEl.textContent = 'Password updated! Signing you in…'; infoEl.style.display='block'; }

    history.replaceState(null, '', window.location.pathname);

    setTimeout(async () => {
      closeM('newPassword');
      document.getElementById('auth-pass-newpass').value = '';
      document.getElementById('auth-pass-newpass2').value = '';

      const { data: { session } } = await sb.auth.getSession();
      if(session?.user && !_appInitialized){
        _appInitialized = true;
        currentUser = session.user;
        loadUserData().then(async () => {
          const profileStatus = await loadUserProfile();
          const needsOnboarding = _shouldShowOnboarding(session.user.id, profileStatus);
          if(needsOnboarding){
            document.getElementById('landing')?.classList.add('hidden');
            showOnboarding();
          } else {
            const name = userProfile.username || session.user.user_metadata?.full_name || session.user.email.split('@')[0];
            showApp(name, session.user.email);
            registerPushNotifications();
          }
        });
      }
    }, 1200);
  }catch(e){
    let msg = e.message || 'Could not update password. Try the reset link again.';
    if(msg.toLowerCase().includes('password') && (msg.toLowerCase().includes('character') || msg.toLowerCase().includes('least') || msg.toLowerCase().includes('uppercase') || msg.toLowerCase().includes('lowercase') || msg.toLowerCase().includes('symbol') || msg.toLowerCase().includes('number') || msg.toLowerCase().includes('digit'))) {
      msg = 'Password must be 6+ chars with a number & symbol.';
    }
    if(errEl){ errEl.textContent = msg; errEl.style.display='block'; }
  }
  if(btn){ btn.disabled = false; btn.classList.remove('loading'); }
}

function hideAuthMsgPro(mode){
  const e=document.getElementById('auth-err-'+mode), i=document.getElementById('auth-info-'+mode);
  if(e) e.style.display='none';
  if(i) i.style.display='none';
}
function hideAuthMsg(){ hideAuthMsgPro('login'); hideAuthMsgPro('signup'); }
function showAuthErrPro(mode, msg){
  const e=document.getElementById('auth-err-'+mode);
  if(!e) return;
  e.textContent=msg; e.style.display='block';
  const i=document.getElementById('auth-info-'+mode); if(i) i.style.display='none';
}
function showAuthInfoPro(mode, msg){
  const i=document.getElementById('auth-info-'+mode);
  if(!i) return;
  i.textContent=msg; i.style.display='block';
  const e=document.getElementById('auth-err-'+mode); if(e) e.style.display='none';
}

function showAuthErr(msg){ showAuthErrPro(authTab, msg); }
function showAuthInfo(msg){ showAuthInfoPro(authTab, msg); }

async function doAuthPro(mode){
  if(!sb){ showAuthErrPro(mode, 'Supabase credentials not set in the code yet.'); return; }
  const email = document.getElementById('auth-email-'+mode).value.trim();
  const pass = document.getElementById('auth-pass-'+mode).value;
  if(!email || !pass){ showAuthErrPro(mode, 'Please enter your email and password.'); return; }
  const emailKey = email.toLowerCase();

  if(mode === 'login'){
    const backoff = _checkLoginBackoff(emailKey);
    if(backoff.blocked){
      showAuthErrPro(mode, `Too many attempts. Try again in ${backoff.remainingSec}s.`);
      return;
    }
  }

  if(TURNSTILE_SITE_KEY && !_turnstileTokens[mode]){
    showAuthErrPro(mode, 'Please complete the verification below.');
    return;
  }

  const btn = document.getElementById('auth-btn-'+mode);
  btn.disabled = true; btn.classList.add('loading'); hideAuthMsgPro(mode);
  try{
    const captchaToken = TURNSTILE_SITE_KEY ? _turnstileTokens[mode] : undefined;
    if(mode === 'signup'){
      const name = document.getElementById('auth-name-signup').value.trim() || email.split('@')[0];
      const { error } = await sb.auth.signUp({ email, password: pass, options:{ data:{ full_name: name }, captchaToken } });
      if(error) throw error;
      showAuthInfoPro(mode, 'Check your email for a confirmation link. After confirming, sign in here.');
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pass, options:{ captchaToken } });
      if(error) throw error;
      _clearLoginFailures(emailKey);
    }
  }catch(e){
    let msg = e.message || 'Something went wrong. Try again.';
    
    if (msg.toLowerCase().includes('password') && (msg.toLowerCase().includes('character') || msg.toLowerCase().includes('least') || msg.toLowerCase().includes('uppercase') || msg.toLowerCase().includes('lowercase') || msg.toLowerCase().includes('symbol') || msg.toLowerCase().includes('number') || msg.toLowerCase().includes('digit'))) {
      msg = 'Password must be 6+ chars with a number & symbol.';
    }
    if(mode === 'login') _recordLoginFailure(emailKey);
    showAuthErrPro(mode, msg);
  }
  _resetTurnstile(mode); // tokens are single-use regardless of outcome
  btn.disabled = false; btn.classList.remove('loading');
}

function doAuth(){ return doAuthPro(authTab); }

async function doGoogleAuth(){
  if(!sb){ showAuthErrPro(authTab, 'Supabase not configured yet.'); return; }
  const { error } = await sb.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.origin } });
  if(error) showAuthErrPro(authTab, error.message);
}

async function signOut(){
  if(sb){
    await sb.auth.signOut({ scope: 'local' }); 
  }
  
  if(currentUser?.id){
    const uid = currentUser.id;
    localStorage.removeItem('jt_ai_insights_'+uid);
    localStorage.removeItem('jt_goal_mains_'+uid);
    localStorage.removeItem('jt_goal_adv_'+uid);
  }
  
  localStorage.removeItem('jt_ai_insights');
  localStorage.removeItem('jt_goal_mains');
  localStorage.removeItem('jt_goal_adv');
  
  const insContent = document.getElementById('insights-content');
  const insEmpty   = document.getElementById('insights-empty');
  if(insContent){ insContent.innerHTML=''; insContent.style.display='none'; }
  if(insEmpty)  { insEmpty.style.display=''; }
  currentUser = null;
  S = getDefaultState();
  localStorage.removeItem('jt3');
  localStorage.removeItem('jt3_known_updated_at');
  showAuthScreen(true);
}

function hideSplash(){
  const sp = document.getElementById('splash');
  if(!sp || sp.style.display === 'none') return;

  // Don't cut the logo-draw/solidify animation off mid-way on fast loads
  // (cached session, demo mode, etc). Wait for it to finish first.
  const MIN_VISIBLE_MS = window.__SPLASH_MIN_VISIBLE || 1300;
  const shownFor = Date.now() - (window.__splashStart || 0);
  if(shownFor < MIN_VISIBLE_MS){
    setTimeout(hideSplash, MIN_VISIBLE_MS - shownFor);
    return;
  }

  if(window.jtSplash) window.jtSplash.ready();
  sp.classList.add('fade-out');
  setTimeout(() => { sp.style.display = 'none'; }, 650);
}

function showConfigError(message){
  const el = document.getElementById('config-error-screen');
  if(el){
    const msgEl = document.getElementById('config-error-message');
    if(msgEl && message) msgEl.textContent = message;
    el.classList.remove('hidden');
    el.style.display = 'flex';
  }
}

function hideConfigError(){
  const el = document.getElementById('config-error-screen');
  if(el){
    el.style.display = 'none';
    el.classList.add('hidden');
  }
}

let _configRetryInFlight = false;
function retryConfigLoad(){
  if(_configRetryInFlight) return;
  _configRetryInFlight = true;
  const btn = document.getElementById('config-error-retry-btn');
  if(btn){ btn.disabled = true; btn.textContent = 'Retrying\u2026'; }

  // A full reload is the safest retry here: initSupabase() can fail partway
  // through (config OK, data load timed out) leaving _appInitialized / sb /
  // onAuthStateChange listeners in a half-set-up state. Reloading guarantees
  // a clean run instead of us having to carefully unwind partial state.
  //
  // The reload itself is jittered (0.3s-2.3s) rather than instant. Everyone
  // who lands on this screen because of a *shared* slowdown (not their own
  // connection) tends to hit the 45s timeout within moments of each other,
  // and people click "Retry" fast once it appears — an un-jittered reload
  // here turns that into a synchronized burst of full page loads (config
  // fetch + auth + get_full_state) landing on a DB that's already struggling,
  // which is exactly what produced the timeout cascade this was meant to fix.
  // Spreading reloads over a ~2s window turns the burst into a trickle.
  setTimeout(() => { location.reload(); }, 300 + Math.random() * 2000);
}

function showAuthScreen(fromSignOut){
  hideSplash();
  const landingEl = document.getElementById('landing');
  landingEl.classList.remove('hidden');
  landingEl.scrollTop = 0;
  document.getElementById('onboarding').classList.remove('show');
  document.getElementById('main-app').style.display='none';
  setTimeout(_initLandFabScroll, 100);
  setTimeout(_initScrollReveal, 150);
  Promise.race([
    loadPublicSiteConfig().catch(() => null),
    new Promise((resolve) => setTimeout(resolve, 1200)) // don't block the animation forever on a slow/failed fetch
  ]).then(() => setTimeout(_initCountUp, 50));

  
  
  
  if(fromSignOut){
    history.replaceState({page:'login'}, '', '/login');
    document.title = 'JEETrack — Sign In';
    if(typeof _setRobotsMeta === 'function') _setRobotsMeta(false);
  } else if(window.location.pathname === '/login'){
    document.title = 'JEETrack — Sign In';
    if(typeof _setRobotsMeta === 'function') _setRobotsMeta(false);
  } else if(typeof _setRobotsMeta === 'function'){
    _setRobotsMeta(true);
  }
  
  setTimeout(initSlideshow, 100);
  setTimeout(initHeroDemo, 200);
  loadLandingTestimonials();
}

