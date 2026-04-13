

let SUPABASE_URL = null;
let SUPABASE_ANON_KEY = null;

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

async function initSupabase(){
  
  let _authResolved = false;
  const _splashSafetyTimer = setTimeout(() => {
    if(!_authResolved) showAuthScreen();
  }, 6000);

  
  try {
    const res = await fetch('/api/config');
    if(res.ok){
      const cfg = await res.json();
      SUPABASE_URL = cfg.url;
      SUPABASE_ANON_KEY = cfg.key;
    }
  } catch(e) {
    console.warn('Could not fetch /api/config — running in offline/demo mode', e);
  }

  if(!SUPABASE_URL || !SUPABASE_ANON_KEY){
    
    const saved = localStorage.getItem('jt3');
    if(saved){ try{ const p=JSON.parse(saved); if(p&&!p.backlogStreak||p.backlogStreak>365) p.backlogStreak=0; if(p&&(!p.backlogBestStreak||p.backlogBestStreak>365)) p.backlogBestStreak=0; S=p; }catch(e){} }
    _authResolved = true;
    clearTimeout(_splashSafetyTimer);
    hideSplash();
    showApp('Demo User','demo@jeetrack.app');
    return;
  }

  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  
  sb.auth.getSession().then(({ data: { session } }) => {
    _authResolved = true;
    clearTimeout(_splashSafetyTimer);
    if(session?.user){
      if(_appInitialized) return; 
      _appInitialized = true;
      currentUser = session.user;
      loadUserData().then(async () => {
        const profileStatus = await loadUserProfile();
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
      });
    } else {
      showAuthScreen();
      setTimeout(initSlideshow, 100);
    }
  });
  
  sb.auth.onAuthStateChange((event, session) => {
    if(event === 'SIGNED_OUT'){
      _appInitialized = false;
      currentUser = null;
      S = getDefaultState();
      showAuthScreen();
      setTimeout(initSlideshow, 100);
    } else if(event === 'SIGNED_IN' && session?.user){
      if(_appInitialized) return; 
      _appInitialized = true;
      currentUser = session.user;
      loadUserData().then(async () => {
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
      });
    }
  });
}

let authTab = 'login';
function switchAuthTab(tab){
  authTab = tab;
  document.querySelectorAll('.auth-tab,.land-auth-tab').forEach((b,i) => b.classList.toggle('active',(i===0&&tab==='login')||(i===1&&tab==='signup')));
  const authBtn = document.getElementById('auth-btn');
  if(authBtn) authBtn.textContent = tab==='login' ? 'Sign In' : 'Create Account';
  const nameField = document.getElementById('auth-name-field');
  if(nameField) nameField.style.display = tab==='signup' ? '' : 'none';
  
  const ft = document.getElementById('land-form-title');
  const fs = document.getElementById('land-form-sub');
  if(ft) ft.textContent = tab==='login' ? 'Welcome back' : 'Create your account';
  if(fs) fs.textContent = tab==='login' ? 'Sign in to continue your JEE prep' : 'Start your JEE tracking journey';
  
  const fw=document.getElementById('auth-forgot-wrap');
  if(fw)fw.style.display=tab==='login'?'block':'none';
  hideAuthMsg();
}
function togglePassVis(){
  const inp=document.getElementById('auth-pass');
  const btn=document.getElementById('pass-eye-btn');
  const isPass=inp.type==='password';
  inp.type=isPass?'text':'password';
  btn.style.color=isPass?'var(--ac2)':'var(--mu)';
  document.getElementById('eye-icon').innerHTML=isPass
    ?'<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
    :'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}
async function doForgotPass(){
  if(!sb){showAuthErr('Supabase not configured yet.');return;}
  const email=document.getElementById('auth-email').value.trim();
  if(!email){showAuthErr('Enter your email address first, then click Forgot password.');return;}
  const btn=document.querySelector('[onclick="doForgotPass()"]');
  if(btn){btn.textContent='Sending...';btn.disabled=true;}
  try{
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
    if(error)throw error;
    showAuthInfo('Password reset email sent! Check your inbox and follow the link.');
  }catch(e){showAuthErr(e.message||'Failed to send reset email.');}
  if(btn){btn.textContent='Forgot password?';btn.disabled=false;}
}
function hideAuthMsg(){ document.getElementById('auth-err').style.display='none'; document.getElementById('auth-info').style.display='none'; }
function showAuthErr(msg){ const e=document.getElementById('auth-err'); e.textContent=msg; e.style.display='block'; document.getElementById('auth-info').style.display='none'; }
function showAuthInfo(msg){ const e=document.getElementById('auth-info'); e.textContent=msg; e.style.display='block'; document.getElementById('auth-err').style.display='none'; }

async function doAuth(){
  if(!sb){ showAuthErr('Supabase credentials not set in the code yet.'); return; }
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;
  if(!email || !pass){ showAuthErr('Please enter your email and password.'); return; }
  const btn = document.getElementById('auth-btn');
  btn.disabled = true; btn.textContent = 'Please wait...'; hideAuthMsg();
  try{
    if(authTab === 'signup'){
      const name = document.getElementById('auth-name').value.trim() || email.split('@')[0];
      const { error } = await sb.auth.signUp({ email, password: pass, options:{ data:{ full_name: name } } });
      if(error) throw error;
      showAuthInfo('Check your email for a confirmation link. After confirming, sign in here.');
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
      if(error) throw error;
      
    }
  }catch(e){
    let msg = e.message || 'Something went wrong. Try again.';
    
    if (msg.toLowerCase().includes('password') && (msg.toLowerCase().includes('character') || msg.toLowerCase().includes('least') || msg.toLowerCase().includes('uppercase') || msg.toLowerCase().includes('lowercase') || msg.toLowerCase().includes('symbol') || msg.toLowerCase().includes('number') || msg.toLowerCase().includes('digit'))) {
      msg = 'Password must be 6+ chars with a number & symbol.';
    }
    showAuthErr(msg);
  }
  btn.disabled = false;
  btn.textContent = authTab==='login' ? 'Sign In' : 'Create Account';
}

async function doGoogleAuth(){
  if(!sb){ showAuthErr('Supabase not configured yet.'); return; }
  const { error } = await sb.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.origin } });
  if(error) showAuthErr(error.message);
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
  showAuthScreen();
}

function hideSplash(){
  const sp = document.getElementById('splash');
  if(!sp || sp.style.display === 'none') return;
  sp.classList.add('fade-out');
  setTimeout(() => { sp.style.display = 'none'; }, 650);
}

function showAuthScreen(){
  hideSplash();
  document.getElementById('landing').classList.remove('hidden');
  document.getElementById('onboarding').classList.remove('show');
  document.getElementById('main-app').style.display='none';
  
  history.replaceState({page:'login'}, '', '/login');
  document.title = 'JEETrack — Sign In';
  setTimeout(initLandingStarField, 50);
  setTimeout(initSlideshow, 100);
}

function showApp(name, email){
  document.getElementById('landing').classList.add('hidden');
  hideSplash();
  document.getElementById('onboarding').classList.remove('show');
  document.getElementById('main-app').style.display='flex';
  if(S.backlogStreak>365)S.backlogStreak=0;
  if(S.backlogBestStreak>365)S.backlogBestStreak=0;
  const displayName=userProfile.username||name||email?.split('@')[0]||'Aspirant';
  const initials=displayName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'A';
  document.getElementById('sb-username').textContent=displayName;
  document.getElementById('sb-email').textContent=email;
  const sbAv=document.getElementById('sb-avatar');
  const mobAv=document.getElementById('mob-avatar');
  if(sbAv)document.getElementById('sb-avatar-initials').textContent=initials;
  if(mobAv)mobAv.textContent=initials;
  
  const elName=document.getElementById('avMenuName');
  const elEmail=document.getElementById('avMenuEmail');
  const elInit=document.getElementById('avMenuInitials');
  if(elName)elName.textContent=displayName;
  if(elEmail)elEmail.textContent=email||'';
  if(elInit)elInit.textContent=initials;
  
  const localAvatar = localStorage.getItem('jt_avatar');
  if(localAvatar){
    _applyAvatarImage(localAvatar);
  } else if(userProfile.avatar_url){
    _applyAvatarImage(userProfile.avatar_url);
  }
  
  if(document.getElementById('settings-name-display'))document.getElementById('settings-name-display').textContent=displayName;
  if(document.getElementById('settings-email-display'))document.getElementById('settings-email-display').textContent=email||'';
  if(document.getElementById('settings-email-ro'))document.getElementById('settings-email-ro').textContent=email||'';
  if(document.getElementById('settings-name-input'))document.getElementById('settings-name-input').value=displayName;
  setDashGreeting(displayName.split(' ')[0]);
  
  
  if(typeof navMarkDirty === 'function') navMarkDirty(null);
  updateBadges();checkHWTNotifs();if(typeof setQuote==='function')setQuote();
  
  
  
  const _authPaths = ['/login', '/onboarding', '/'];
  const _currentPath = window.location.pathname;
  if (_authPaths.includes(_currentPath)) {
    history.replaceState({page: 'overview'}, '', '/dashboard');
  } else if (!history.state) {
    
    history.replaceState({page: _routeMap[_currentPath] || 'overview'}, '', _currentPath);
  }
  _handleRoute();
  localStorage.removeItem('groq_key');
  if(localStorage.getItem('notif_enabled')==='1')document.getElementById('notif-bell-btn')?.classList.add('active');
  
  const snt=document.getElementById('settings-notif-toggle');
  if(snt) snt.checked = localStorage.getItem('notif_enabled')==='1' && typeof Notification !== 'undefined' && Notification.permission === 'granted';
  
  setTimeout(() => {
    const activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'page-overview') {
      checkWelcomeModal();
    }
  }, 800);
}

function setDashGreeting(firstName){
  const h = new Date().getHours();
  const greet = h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  const now = new Date();
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const el=document.getElementById('dash-greeting'), del=document.getElementById('dash-date');
  if(el) el.innerHTML=`<span style="color:#ffffff;-webkit-text-fill-color:#ffffff">${greet}, </span><span style="background:linear-gradient(135deg,#a695ff,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${firstName||'there'}</span>`;
  if(del) del.textContent=`${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

function openProfile(){
  if(window.innerWidth>768) closeSidebar();
  const name = document.getElementById('sb-username')?.textContent || '';
  const email = document.getElementById('sb-email')?.textContent || '';
  const initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || '?';
  document.getElementById('profile-avatar-lg').textContent = initials;
  document.getElementById('profile-name-disp').textContent = name || 'Guest';
  document.getElementById('profile-email-disp').textContent = email || 'Offline mode';
  
  const totalH = S.hours.reduce((a,b)=>a+b.total,0);
  const mains = S.tests.filter(t=>t.exam==='mains');
  const lastM = mains.length ? mains[mains.length-1] : null;
  document.getElementById('profile-stats').innerHTML = `
    <div style="text-align:center;background:var(--sf2);border-radius:var(--rs);padding:.6rem .4rem;border:1px solid var(--bd)">
      <div style="font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;color:var(--ac2)">${lastM?`${lastM.total}`:'—'}</div>
      <div style="font-size:9.5px;color:var(--mu);margin-top:2px">Latest Mains</div>
    </div>
    <div style="text-align:center;background:var(--sf2);border-radius:var(--rs);padding:.6rem .4rem;border:1px solid var(--bd)">
      <div style="font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;color:var(--gn)">${totalH.toFixed(0)}h</div>
      <div style="font-size:9.5px;color:var(--mu);margin-top:2px">Study Hours</div>
    </div>
    <div style="text-align:center;background:var(--sf2);border-radius:var(--rs);padding:.6rem .4rem;border:1px solid var(--bd)">
      <div style="font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;color:var(--am)">${S.backlogStreak}d</div>
      <div style="font-size:9.5px;color:var(--mu);margin-top:2px">BL Streak</div>
    </div>`;
  
  const nb = document.getElementById('notif-toggle-btn');
  const isOn = localStorage.getItem('notif_enabled')==='1';
  const BELL_SVG='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  const BELL_OFF='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  if(nb){nb.innerHTML=(isOn?BELL_SVG+' Notifications On':BELL_OFF+' Enable Notifications');nb.classList.toggle('notif-btn-on',isOn);}
  loadEmailReportPref();
  openM('profile');
}

async function toggleEmailReport(enabled){
  const track=document.getElementById('email-report-track');
  const thumb=document.getElementById('email-report-thumb');
  if(track)track.style.background=enabled?'#7c6af7':'var(--sf3)';
  if(thumb)thumb.style.transform=enabled?'translateX(18px)':'translateX(0)';
  if(!sb||!currentUser){toast('Sign in to enable reports', 'info');return;}
  try{
    await sb.from('user_preferences').upsert({
      user_id:currentUser.id,
      email_reports:enabled?'monthly':'off',
      last_active_at:new Date().toISOString(),
      updated_at:new Date().toISOString(),
    },{onConflict:'user_id'});
    toast(enabled?'Monthly reports enabled 📧':'Reports disabled', enabled?'success':'info');
  }catch(e){
    toast('Could not save preference', 'error');
    const cb=document.getElementById('settings-email-toggle');
    if(cb)cb.checked=!enabled;
    if(track)track.style.background=!enabled?'#7c6af7':'var(--sf3)';
    if(thumb)thumb.style.transform=!enabled?'translateX(18px)':'translateX(0)';
  }
}
async function loadEmailReportPref(){
  if(!sb||!currentUser)return;
  try{
    const{data}=await sb.from('user_preferences').select('email_reports').eq('user_id',currentUser.id).single();
    const isOn=data?.email_reports==='monthly';
    const cb=document.getElementById('settings-email-toggle');
    const track=document.getElementById('email-report-track');
    const thumb=document.getElementById('email-report-thumb');
    if(cb)cb.checked=isOn;
    if(track)track.style.background=isOn?'#7c6af7':'var(--sf3)';
    if(thumb)thumb.style.transform=isOn?'translateX(18px)':'translateX(0)';
  }catch(e){}
}

async function updateActivity(){
  if(!sb||!currentUser)return;
  try{
    await sb.from('user_preferences').upsert({
      user_id:currentUser.id,
      last_active_at:new Date().toISOString(),
      updated_at:new Date().toISOString(),
    },{onConflict:'user_id'});
  }catch(e){}
}

function migrateSyllabus(saved){
  const subjs=['physics','chemistry','maths'];
  subjs.forEach(s=>{
    const canonical=CANONICAL_SYLLABUS[s].map(c=>({...c}));
    const old=saved.syllabus?.[s]||[];
    
    const oldByName={};
    old.forEach(c=>{ oldByName[c.name.toLowerCase().trim()]={theory:c.theory||false,practice:c.practice||false}; });
    canonical.forEach(c=>{
      const key=c.name.toLowerCase().trim();
      if(oldByName[key]){ c.theory=oldByName[key].theory; c.practice=oldByName[key].practice; }
    });
    saved.syllabus[s]=canonical;
  });
  return saved;
}

function getDefaultState(){
  return{tests:[],hours:[],backlogs:[],todos:[],upcoming:[],
    syllabus:JSON.parse(JSON.stringify(CANONICAL_SYLLABUS)),
    backlogStreak:0,backlogBestStreak:0,lastBLClear:null,
    subjStreaks:{physics:0,chemistry:0,maths:0},
    subjBestStreaks:{physics:0,chemistry:0,maths:0},notifiedHWT:[],hwtDismissed:[]};
}

async function loadUserData(){
  if(!sb || !currentUser){
    const saved = localStorage.getItem('jt3');
    if(saved) try{
      let p=JSON.parse(saved);
      if(p.backlogStreak>365)p.backlogStreak=0;
      if(p.backlogBestStreak>365)p.backlogBestStreak=0;
      p=migrateSyllabus(p);
      S=p;
    }catch(e){}
    return;
  }
  try{
    const uid = currentUser.id;
    const [tests,hours,backlogs,todos,upcoming,syllabus,streaks] = await Promise.all([
      sb.from('tests').select('*').eq('user_id',uid),
      sb.from('hours').select('*').eq('user_id',uid),
      sb.from('backlogs').select('*').eq('user_id',uid),
      sb.from('todos').select('*').eq('user_id',uid),
      sb.from('upcoming').select('*').eq('user_id',uid),
      sb.from('syllabus').select('*').eq('user_id',uid),
      sb.from('streaks').select('*').eq('user_id',uid).maybeSingle()
    ]);
    S.tests=(tests.data||[]).map(r=>({id:r.id,exam:r.exam,session:r.session,paper:r.paper,type:r.type,date:r.date,total:r.total,max:r.max,physics:r.physics,chemistry:r.chemistry,maths:r.maths,notes:r.notes||''}));
    S.hours=(hours.data||[]).map(r=>({id:r.id,date:r.date,subject:r.subject,lecture:r.lecture,practice:r.practice,revision:r.revision,total:r.total}));
    S.backlogs=(backlogs.data||[]).map(r=>({id:r.id,title:r.title,subject:r.subject,priority:r.priority,due:r.due,details:r.details||'',done:r.done,addedDate:r.added_date,doneDate:r.done_date}));
    S.todos=(todos.data||[]).map(r=>({id:r.id,title:r.title,subject:r.subject,priority:r.priority,due:r.due,details:r.details||'',done:r.done,addedDate:r.added_date,doneDate:r.done_date}));
    S.upcoming=(upcoming.data||[]).map(r=>({id:r.id,exam:r.exam,session:r.session,type:r.type,date:r.date,venue:r.venue||'',notes:r.notes||''}));
    if(syllabus.data && syllabus.data.length){
      S.syllabus={physics:[],chemistry:[],maths:[]};
      syllabus.data.forEach(r=>{ const ch={id:r.id,name:r.name,theory:r.theory,practice:r.practice}; if(r.section)ch.section=r.section; if(r.class)ch.class=r.class; if(S.syllabus[r.subject])S.syllabus[r.subject].push(ch); });
      S=migrateSyllabus(S);
    }
    if(streaks.data){
      S.backlogStreak = Math.min(streaks.data.backlog_streak||0, 365);
      S.backlogBestStreak = Math.min(streaks.data.best_streak||0, 365);
      S.lastBLClear = streaks.data.last_clear;
      S.subjStreaks = streaks.data.subj_streaks||{physics:0,chemistry:0,maths:0};
      S.subjBestStreaks = streaks.data.subj_best_streaks||{physics:0,chemistry:0,maths:0};
      
      S.hwtDismissed = streaks.data.hwt_dismissed||[];
      
      try{
        const cacheKey='jt_hwt_dismissed_'+uid;
        const localArr=JSON.parse(localStorage.getItem(cacheKey)||'[]');
        const merged=[...new Set([...localArr,...S.hwtDismissed])];
        localStorage.setItem(cacheKey,JSON.stringify(merged));
        S.hwtDismissed=merged;
      }catch(e){}
    }
  }catch(e){
    console.error('Load error:',e);
    const saved=localStorage.getItem('jt3');
    if(saved) try{ const p=JSON.parse(saved); if(p.backlogStreak>365)p.backlogStreak=0; S=p; }catch(e2){}
  }
}

async function save(){
  
  if(S.backlogStreak > 365) S.backlogStreak = 0;
  if(S.backlogBestStreak > 365) S.backlogBestStreak = 0;
  localStorage.setItem('jt3', JSON.stringify(S));
  if(!sb || !currentUser) return;
  if(isSaving){ saveQueue=true; return; }
  isSaving = true;
  try{
    const uid = currentUser.id;
    const ops = [];
    if(S.tests.length) ops.push(sb.from('tests').upsert(S.tests.map(t=>({id:t.id,user_id:uid,exam:t.exam,session:t.session,paper:t.paper,type:t.type,date:t.date,total:t.total,max:t.max,physics:t.physics,chemistry:t.chemistry,maths:t.maths,notes:t.notes||''}))));
    if(S.hours.length) ops.push(sb.from('hours').upsert(S.hours.map(h=>({id:h.id,user_id:uid,date:h.date,subject:h.subject,lecture:h.lecture,practice:h.practice,revision:h.revision,total:h.total}))));
    if(S.backlogs.length) ops.push(sb.from('backlogs').upsert(S.backlogs.map(b=>({id:b.id,user_id:uid,title:b.title,subject:b.subject,priority:b.priority,due:b.due,details:b.details||'',done:b.done,added_date:b.addedDate,done_date:b.doneDate}))));
    if(S.todos.length) ops.push(sb.from('todos').upsert(S.todos.map(t=>({id:t.id,user_id:uid,title:t.title,subject:t.subject,priority:t.priority,due:t.due,details:t.details||'',done:t.done,added_date:t.addedDate,done_date:t.doneDate}))));
    if(S.upcoming.length) ops.push(sb.from('upcoming').upsert(S.upcoming.map(u=>({id:u.id,user_id:uid,exam:u.exam,session:u.session,type:u.type,date:u.date,venue:u.venue||'',notes:u.notes||''}))));
    const sylRows=[]; ['physics','chemistry','maths'].forEach(s=>{ (S.syllabus[s]||[]).forEach(c=>sylRows.push({id:c.id,user_id:uid,subject:s,name:c.name,section:c.section||null,theory:c.theory,practice:c.practice})); });
    if(sylRows.length) ops.push(sb.from('syllabus').upsert(sylRows));
    ops.push(sb.from('streaks').upsert({user_id:uid,backlog_streak:S.backlogStreak,best_streak:S.backlogBestStreak,last_clear:S.lastBLClear,subj_streaks:S.subjStreaks,subj_best_streaks:S.subjBestStreaks,hwt_dismissed:S.hwtDismissed||[]},{onConflict:'user_id'}));
    await Promise.all(ops);
  }catch(e){ console.error('Save error:',e); }
  isSaving=false; if(saveQueue){ saveQueue=false; save(); }
}

async function dbDelete(table, id){
  localStorage.setItem('jt3', JSON.stringify(S));
  if(!sb || !currentUser) return;
  try{ await sb.from(table).delete().eq('id',id).eq('user_id',currentUser.id); }catch(e){}
}

async function exportPDF(){
  toast('Generating PDF…', 'saving');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
  const W=210, mg=15, cW=W-2*mg; let y=mg;
  const dateStr = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  const userName = document.getElementById('sb-username')?.textContent?.trim() || 'Student';

  
  const bgPage = () => { doc.setFillColor(10,10,15); doc.rect(0,0,W,297,'F'); };
  bgPage();

  
  doc.setFillColor(17,17,24);
  doc.rect(0,0,W,28,'F');
  doc.setDrawColor(124,106,247,0.4);
  doc.line(0,28,W,28);
  doc.setTextColor(166,149,255); doc.setFontSize(18); doc.setFont('helvetica','bold');
  doc.text('JEETrack',mg,17);
  doc.setTextColor(100,100,120); doc.setFontSize(9); doc.setFont('helvetica','normal');
  doc.text(`Progress Report — ${userName}`, mg, 23);
  doc.text(dateStr, W-mg, 23, {align:'right'});
  y = 36;

  const hd = (txt, c=[124,106,247]) => {
    if(y > 265){ doc.addPage(); bgPage(); y=20; }
    doc.setTextColor(...c); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text(txt, mg, y);
    doc.setDrawColor(...c); doc.setLineWidth(0.3); doc.line(mg, y+1.5, W-mg, y+1.5);
    y += 9;
  };
  const rw = (lbl, val, valCol=[200,200,210]) => {
    if(y > 272){ doc.addPage(); bgPage(); y=20; }
    doc.setTextColor(100,100,120); doc.setFontSize(8.5); doc.setFont('helvetica','normal');
    doc.text(lbl, mg, y);
    doc.setTextColor(...valCol); doc.setFont('helvetica','bold');
    doc.text(String(val), W-mg, y, {align:'right'});
    doc.setFont('helvetica','normal');
    y += 5.5;
  };
  const pb = (lbl, pct, c=[124,106,247]) => {
    if(y > 270){ doc.addPage(); bgPage(); y=20; }
    doc.setTextColor(100,100,120); doc.setFontSize(8);
    doc.text(lbl, mg, y); doc.text(`${pct}%`, W-mg, y, {align:'right'}); y+=3;
    doc.setFillColor(25,25,35); doc.roundedRect(mg, y, cW, 2.5, 1, 1, 'F');
    doc.setFillColor(...c); doc.roundedRect(mg, y, Math.max(1,cW*pct/100), 2.5, 1, 1, 'F');
    y += 7;
  };

  
  hd('Mock Test Performance', [124,106,247]);
  const mains=S.tests.filter(t=>t.exam==='mains'); const adv=S.tests.filter(t=>t.exam==='advanced');
  rw('Total Mains Tests', mains.length);
  if(mains.length){ const l=mains[mains.length-1]; rw('Latest Mains',`${l.total}/${l.max}`,[166,149,255]); rw('Best Mains',`${Math.max(...mains.map(t=>t.total))}/300`); rw('Average',`${(mains.reduce((a,b)=>a+b.total,0)/mains.length).toFixed(0)}/300`); }
  rw('Total Advanced Tests', adv.length);
  if(adv.length){ const l=adv[adv.length-1]; rw('Latest Advanced',`${l.total}/${l.max}`,[166,149,255]); }
  y += 4;

  
  hd('Study Hours', [96,165,250]);
  const tH=S.hours.reduce((a,b)=>a+b.total,0), tL=S.hours.reduce((a,b)=>a+b.lecture,0), tP=S.hours.reduce((a,b)=>a+b.practice,0), tR=S.hours.reduce((a,b)=>a+b.revision,0);
  rw('Total Hours Logged', `${tH.toFixed(1)}h`, [96,165,250]);
  const c7=new Date(); c7.setDate(c7.getDate()-7); rw('Last 7 Days',`${S.hours.filter(h=>h.date>=c7.toISOString().split('T')[0]).reduce((a,b)=>a+b.total,0).toFixed(1)}h`);
  if(tH>0){ pb('Lecture',Math.round(tL/tH*100),[96,165,250]); pb('Practice',Math.round(tP/tH*100),[52,211,153]); pb('Revision',Math.round(tR/tH*100),[166,149,255]); }
  ['physics','chemistry','maths'].forEach(s => rw(s[0].toUpperCase()+s.slice(1), `${S.hours.filter(h=>h.subject===s).reduce((a,b)=>a+b.total,0).toFixed(1)}h`));
  y += 4;

  
  hd('Syllabus Progress', [52,211,153]);
  const allChs=['physics','chemistry','maths'].flatMap(s=>S.syllabus[s]||[]);
  const done=allChs.filter(c=>c.theory&&c.practice).length;
  pb('Overall', allChs.length?Math.round(done/allChs.length*100):0, [124,106,247]);
  [{s:'physics',c:[96,165,250]},{s:'chemistry',c:[52,211,153]},{s:'maths',c:[251,191,36]}].forEach(({s,c})=>{ const ch=S.syllabus[s]||[]; const d=ch.filter(x=>x.theory&&x.practice).length; pb(s[0].toUpperCase()+s.slice(1), ch.length?Math.round(d/ch.length*100):0, c); });
  y += 4;

  
  hd('Streaks & Tasks', [251,191,36]);
  rw('No-Backlog Streak',`${S.backlogStreak} days`,[251,191,36]);
  rw('Best Streak',`${S.backlogBestStreak} days`);
  rw('Pending Backlogs', S.backlogs.filter(b=>!b.done).length);
  rw('Pending To-Dos', S.todos.filter(t=>!t.done).length);

  
  const pgs = doc.internal.getNumberOfPages();
  for(let i=1;i<=pgs;i++){
    doc.setPage(i);
    if(i>1) bgPage();
    doc.setTextColor(60,60,80); doc.setFontSize(7.5);
    doc.text(`JEETrack · crafted by Aman Mishra · Page ${i}/${pgs}`, W/2, 291, {align:'center'});
  }
  doc.save(`JEETrack-${dateStr.replace(/ /g,'-')}.pdf`);
  toast('PDF downloaded ✓', 'success');
}

async function registerPushNotifications(){
  if(!('serviceWorker' in navigator) || !('Notification' in window)) return;
  try{
    const reg = await navigator.serviceWorker.register('sw.js');
    
    
    if(Notification.permission !== 'granted') return;
    localStorage.setItem('notif_enabled','1');
    document.getElementById('notif-bell-btn')?.classList.add('active');
    
    const nb2=document.getElementById('notif-toggle-btn');
    const BELL_SVG2='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
    if(nb2){nb2.innerHTML=BELL_SVG2+' Notifications On';nb2.classList.add('notif-btn-on');}
    
    const tmr=new Date(); tmr.setDate(tmr.getDate()+1); const tmrStr=tmr.toISOString().split('T')[0];
    const tmrTests=S.upcoming.filter(t=>t.date===tmrStr);
    if(tmrTests.length) reg.showNotification('JEETrack — Test Tomorrow! 📋',{body:`${tmrTests.length} test${tmrTests.length>1?'s':''} scheduled tomorrow. Be prepared!`,icon:'icon-192.png',tag:'test-reminder',vibrate:[200,100,200]});
    const pendTodos=S.todos.filter(t=>!t.done).length;
    if(pendTodos>0) reg.showNotification('JEETrack — Tasks Pending ✅',{body:`You have ${pendTodos} to-do task${pendTodos>1?'s':''} pending. Stay on track!`,icon:'icon-192.png',tag:'todo-reminder'});
    const pendBL=S.backlogs.filter(b=>!b.done).length;
    if(pendBL>0) reg.showNotification('JEETrack — Backlogs Pending 📌',{body:`${pendBL} backlog item${pendBL>1?'s':''} still pending. Clear them today!`,icon:'icon-192.png',tag:'backlog-reminder'});
    
    const now2=new Date(), r8=new Date(); r8.setHours(20,0,0,0); if(r8<=now2) r8.setDate(r8.getDate()+1);
    setTimeout(function remind(){
      if(localStorage.getItem('notif_enabled')==='1' && Notification.permission==='granted'){
        const td2=new Date().toISOString().split('T')[0];
        const h2=S.hours.filter(h=>h.date===td2).reduce((a,b)=>a+b.total,0);
        new Notification('JEETrack 📚',{body:h2<4?`Only ${h2.toFixed(1)}h today. Push for 6h! 💪`:`${h2.toFixed(1)}h today — great work. Stay consistent.`,icon:'icon-192.png',tag:'daily'});
      }
      setTimeout(remind, 86400000);
    }, r8-now2);
  }catch(e){ console.log('Notifications unavailable:', e); }
}

async function toggleNotifications(){
  if(!('Notification' in window)){
    toast('Notifications not supported on this browser', 'warning');
    
    const snt = document.getElementById('settings-notif-toggle');
    if (snt) snt.checked = false;
    return;
  }

  const isOn = localStorage.getItem('notif_enabled') === '1' && Notification.permission === 'granted';
  const nb = document.getElementById('notif-toggle-btn');
  const snt = document.getElementById('settings-notif-toggle');
  const BELL_ON='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> Notifications On';
  const BELL_OFF='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><line x1="1" y1="1" x2="23" y2="23"/></svg> Enable Notifications';

  if(isOn){
    
    localStorage.removeItem('notif_enabled');
    document.getElementById('notif-bell-btn')?.classList.remove('active');
    if(nb){nb.innerHTML=BELL_OFF;nb.classList.remove('notif-btn-on');}
    if(snt) snt.checked = false;
    toast('Notifications disabled', 'info');
  } else {
    
    if(Notification.permission === 'denied'){
      toast('Notifications blocked — enable in browser settings', 'warning');
      if(snt) snt.checked = false; 
      return;
    }

    if(snt) snt.disabled = true; 

    const perm = await Notification.requestPermission();

    if(snt) snt.disabled = false;

    if(perm === 'granted'){
      localStorage.setItem('notif_enabled', '1');
      
      try { await navigator.serviceWorker.register('sw.js'); } catch(e) {}
      document.getElementById('notif-bell-btn')?.classList.add('active');
      const BELL_SVG2 = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
      if(nb){nb.innerHTML=BELL_SVG2+' Notifications On';nb.classList.add('notif-btn-on');}
      if(snt) snt.checked = true;
      toast('Notifications enabled 🔔', 'success');
    } else {
      
      localStorage.removeItem('notif_enabled');
      if(nb){nb.innerHTML=BELL_OFF;nb.classList.remove('notif-btn-on');}
      if(snt) snt.checked = false;
      toast('Permission denied — enable in browser settings', 'warning');
    }
  }
}

let userProfile = {
  username: '', class_year: '', study_mode: '', coaching: '',
  target_year: '', avatar_url: '', onboarding_done: false
};

async function loadUserProfile() {
  if (!sb || !currentUser) return 'no_client';
  try {
    const { data, error } = await sb.from('user_preferences')
      .select('username,class_year,study_mode,coaching,target_year,avatar_url,onboarding_done,email_reports,goal_mains,goal_adv')
      .eq('user_id', currentUser.id).single();
    if (data) {
      userProfile = { ...userProfile, ...data };
      
      if (data.target_year) localStorage.setItem('jt_target_year', data.target_year);
      
      const et = document.getElementById('settings-email-toggle');
      if (et) et.checked = data.email_reports === 'monthly';
      
      if (data.goal_mains) localStorage.setItem(_goalKey('goal_mains'), data.goal_mains);
      if (data.goal_adv)   localStorage.setItem(_goalKey('goal_adv'),   data.goal_adv);
      return 'loaded';
    }
    
    if (error?.code === 'PGRST116') return 'new_user';
    return 'error';
  } catch(e) { return 'error'; }
}

async function saveUserProfile(fields) {
  if (!sb || !currentUser) return;
  try {
    await sb.from('user_preferences').upsert({
      user_id: currentUser.id,
      last_active_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...fields
    }, { onConflict: 'user_id' });
    userProfile = { ...userProfile, ...fields };
  } catch(e) { toast('Could not save — check connection', 'error'); }
}

async function checkWelcomeModal() {
  
  const notifOn = localStorage.getItem('notif_enabled') === '1' && Notification.permission === 'granted';
  let emailOn = false;
  if (sb && currentUser) {
    try {
      const { data } = await sb.from('user_preferences').select('email_reports').eq('user_id', currentUser.id).single();
      emailOn = data?.email_reports === 'monthly';
    } catch(e) {}
  }
  
  if (notifOn && emailOn) return;

  
  localStorage.removeItem('jt_show_perm_after_onboarding');

  
  _openWelcomeModal(notifOn, emailOn);
}

function _openWelcomeModal(notifOn, emailOn) {
  const mo = document.getElementById('modal-welcome');
  if (!mo) return;
  
  const startStep = notifOn ? 2 : 1;
  _wmGoStep(startStep);
  mo.classList.add('open');
}

function _wmGoStep(n) {
  document.getElementById('wm-step-1').style.display = n === 1 ? '' : 'none';
  document.getElementById('wm-step-2').style.display = n === 2 ? '' : 'none';
  document.getElementById('wm-dot-1').style.background = n >= 1 ? 'var(--ac)' : 'var(--bd2)';
  document.getElementById('wm-dot-2').style.background = n >= 2 ? 'var(--ac)' : 'var(--bd2)';
}

function wmSkip(fromStep) {
  if (fromStep === 1) _wmGoStep(2);
  else closeWelcomeModal();
}

async function welcomeEnableNotif() {
  const btn = document.getElementById('wm-notif-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Requesting...'; }

  if (!('Notification' in window)) {
    if (btn) { btn.disabled = false; btn.textContent = 'Not supported'; }
    toast('Notifications not supported', 'warning');
    setTimeout(() => _wmGoStep(2), 1000);
    return;
  }

  
  if (Notification.permission === 'denied') {
    if (btn) { btn.disabled = false; btn.innerHTML = '🚫 Blocked by browser'; }
    toast('Notifications blocked — enable in browser settings', 'warning');
    setTimeout(() => _wmGoStep(2), 2000);
    return;
  }

  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    localStorage.setItem('notif_enabled', '1');
    
    try {
      await navigator.serviceWorker.register('sw.js');
    } catch(e) {}
    document.getElementById('notif-bell-btn')?.classList.add('active');
    const nb2 = document.getElementById('notif-toggle-btn');
    const BELL_SVG2 = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
    if (nb2) { nb2.innerHTML = BELL_SVG2 + ' Notifications On'; nb2.classList.add('notif-btn-on'); }
    const snt = document.getElementById('settings-notif-toggle');
    if (snt) snt.checked = true;
    toast('Notifications enabled 🔔', 'success');
    setTimeout(() => _wmGoStep(2), 500);
  } else {
    
    if (btn) { btn.disabled = false; btn.textContent = 'Blocked — skip'; }
    localStorage.removeItem('notif_enabled');
    toast('Permission denied — enable in browser settings', 'warning');
    setTimeout(() => _wmGoStep(2), 1800);
  }
}

async function welcomeEnableEmail() {
  const btn = document.getElementById('wm-email-btn');
  if (btn) { btn.disabled = true; btn.textContent = '...'; }
  await toggleEmailReport(true);
  const et = document.getElementById('settings-email-toggle');
  if (et) et.checked = true;
  setTimeout(() => closeWelcomeModal(), 400);
}

function closeWelcomeModal() {
  const mo = document.getElementById('modal-welcome');
  if (mo) mo.classList.remove('open');
  
  const nb = document.getElementById('wm-notif-btn');
  const eb = document.getElementById('wm-email-btn');
  if (nb) { nb.disabled = false; nb.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> Enable'; }
  if (eb) { eb.disabled = false; eb.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Enable'; }
}

function initLandingStarField() {
  const container = document.getElementById('land-stars');
  if (!container) return;
  container.innerHTML = '';
  const count = 90;
  
  const glowColors = [
    'rgba(162,155,254,.95)', 
    'rgba(253,121,168,.85)', 
    'rgba(96,165,250,.85)',  
    'rgba(52,211,153,.75)',  
    'rgba(251,191,36,.75)',  
    'rgba(255,255,255,.9)',  
  ];
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'land-star';
    const size = Math.random() * 2.2 + 0.5;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const delay = Math.random() * 8;
    const dur = 3 + Math.random() * 6;
    const minO = 0.05 + Math.random() * 0.15;
    const maxO = 0.3 + Math.random() * 0.6;
    
    const glowSize = size > 1.5 ? (2 + size * 1.8).toFixed(1) : (1 + size).toFixed(1);
    const gc = glowColors[Math.floor(Math.random() * glowColors.length)];
    star.style.cssText = `
      width:${size}px;height:${size}px;
      left:${x}%;top:${y}%;
      --d:${dur}s;--del:${delay}s;--min:${minO};--max:${maxO};
      --glow:${glowSize}px;--gc:${gc};
    `;
    container.appendChild(star);
  }
}

let slideIdx = 0, slideTimer = null, slideInterval = null;
const SLIDE_DURATION = 4500;

function initSlideshow() {
  const wrap = document.getElementById('slides-wrap');
  if (!wrap) return;
  
  if (slideTimer) { clearTimeout(slideTimer); slideTimer = null; }
  if (slideInterval) { clearInterval(slideInterval); slideInterval = null; }
  wrap.querySelectorAll('.slide').forEach(s => { s.classList.remove('active'); s.classList.remove('exiting'); });
  slideIdx = 0;
  
  const slides = wrap.querySelectorAll('.slide');
  const dots = document.querySelectorAll('#slide-dots .slide-dot');
  if (slides.length) {
    slides[0].classList.add('active');
    dots.forEach((d, i) => d.classList.toggle('active', i === 0));
  }
  
  _startProgressBar();
  
  slideInterval = setInterval(() => {
    goSlide(slideIdx + 1, true);
  }, SLIDE_DURATION);
}

function _startProgressBar() {
  const fill = document.getElementById('slide-fill');
  if (!fill) return;
  fill.style.transition = 'none';
  fill.style.width = '0%';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    fill.style.transition = `width ${SLIDE_DURATION}ms linear`;
    fill.style.width = '100%';
  }));
}

function goSlide(n, fromAuto) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('#slide-dots .slide-dot');
  if (!slides.length) return;
  n = ((n % slides.length) + slides.length) % slides.length;
  if (n === slideIdx && fromAuto) return;

  
  slides[slideIdx]?.classList.remove('active');
  
  slides[n].classList.add('active');
  dots.forEach((d, i) => d.classList.toggle('active', i === n));
  slideIdx = n;

  
  _startProgressBar();

  
  if (!fromAuto) {
    if (slideInterval) { clearInterval(slideInterval); }
    slideInterval = setInterval(() => { goSlide(slideIdx + 1, true); }, SLIDE_DURATION);
  }
}

function _activateSlide(n) { goSlide(n, false); }

function landingOpenAuth(tab) {
  const hero = document.getElementById('land-hero-cta');
  const form = document.getElementById('land-auth-form');
  if (!hero || !form) return;

  
  if (window.innerWidth <= 768) {
    const panel = document.querySelector('.land-right');
    if (panel && !panel.classList.contains('mob-visible')) {
      panel.classList.add('mob-visible');
      document.body.style.overflow = 'hidden';
      const cta = document.getElementById('mob-land-cta');
      if (cta) cta.style.display = 'none';
    }
  }

  
  hero.style.opacity = '0';
  hero.style.transform = 'translateY(-10px)';
  hero.style.transition = 'opacity .22s ease, transform .22s ease';
  setTimeout(() => {
    hero.style.display = 'none';
    hero.style.opacity = '';
    hero.style.transform = '';
    hero.style.transition = '';
    form.classList.add('show');
    switchAuthTab(tab);
  }, 220);
}

function mobileLandingShowAuth() {
  const panel = document.querySelector('.land-right');
  if (!panel) return;
  panel.classList.add('mob-visible');
  
  document.body.style.overflow = 'hidden';
  
  const cta = document.getElementById('mob-land-cta');
  if (cta) cta.style.display = 'none';
}

function landingCloseAuth() {
  const hero = document.getElementById('land-hero-cta');
  const form = document.getElementById('land-auth-form');
  if (!hero || !form) return;
  form.classList.remove('show');
  hero.style.display = 'flex';
  hero.style.opacity = '0';
  hero.style.transform = 'translateY(10px)';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      hero.style.transition = 'opacity .28s ease, transform .28s ease';
      hero.style.opacity = '1';
      hero.style.transform = 'none';
    });
  });
  setTimeout(() => { hero.style.transition = ''; }, 320);

  
  
  if (window.innerWidth <= 768) {
    
    
  }
}

function closeMobAuthOverlay() {
  const panel = document.querySelector('.land-right');
  if (panel) panel.classList.remove('mob-visible');
  document.body.style.overflow = '';
  const cta = document.getElementById('mob-land-cta');
  if (cta) cta.style.display = '';
  
  const hero = document.getElementById('land-hero-cta');
  const form = document.getElementById('land-auth-form');
  if (hero) { hero.style.display = 'flex'; hero.style.opacity = '1'; hero.style.transform = 'none'; }
  if (form) form.classList.remove('show');
}

const COACHING_BY_MODE = {
  online: [
    { id: 'pw_online',      name: 'PW Online',        sub: 'Physics Wallah' },
    { id: 'allen_online',   name: 'Allen Online',      sub: 'Allen Digital' },
    { id: 'unacademy',      name: 'Unacademy',         sub: 'Unacademy JEE' },
    { id: 'vedantu',        name: 'Vedantu',           sub: 'Vedantu Online' },
    { id: 'aakash_online',  name: 'Aakash Digital',    sub: 'Aakash BYJU\'S' },
    { id: 'motion_online',  name: 'Motion Online',     sub: 'Motion IIT-JEE' },
    { id: 'other_online',   name: 'Other Online',      sub: 'Any other institute' },
  ],
  offline: [
    { id: 'pw_vidyapeeth',  name: 'PW Vidyapeeth',     sub: 'PW Offline Centres' },
    { id: 'allen',          name: 'Allen',             sub: 'Kota / Local Centre' },
    { id: 'aakash',         name: 'Aakash',            sub: 'Aakash Institute' },
    { id: 'fiitjee',        name: 'FIITJEE',           sub: 'FIITJEE Ltd.' },
    { id: 'resonance',      name: 'Resonance',         sub: 'Resonance Kota' },
    { id: 'vibrant',        name: 'Vibrant',           sub: 'Vibrant Academy' },
    { id: 'motion',         name: 'Motion',            sub: 'Motion IIT-JEE' },
    { id: 'narayana',       name: 'Narayana',          sub: 'Narayana Group' },
    { id: 'sri_chaitanya',  name: 'Sri Chaitanya',     sub: 'Sri Chaitanya' },
    { id: 'other_offline',  name: 'Other Offline',     sub: 'Any other institute' },
  ],
};

COACHING_BY_MODE.hybrid = [
  ...COACHING_BY_MODE.online,
  ...COACHING_BY_MODE.offline.filter(o=>!COACHING_BY_MODE.online.find(n=>n.id===o.id)),
];

const COACHING_LIST = [
  ...COACHING_BY_MODE.online,
  ...COACHING_BY_MODE.offline.filter(o=>!COACHING_BY_MODE.online.find(n=>n.id===o.id)),
  { id: 'self', name: 'Self Study', sub: 'No coaching' },
];

function updateCoachingGrid() {
  const mode = obData.mode;
  const section = document.getElementById('coaching-section');
  const grid = document.getElementById('coaching-grid');
  const label = document.getElementById('coaching-label');
  if (!section || !grid) return;

  if (mode === 'self') {
    
    section.style.display = 'none';
    obData.coaching = 'self';
    return;
  }
  section.style.display = '';
  const list = COACHING_BY_MODE[mode] || COACHING_BY_MODE.online;
  if (label) label.textContent = mode === 'hybrid' ? 'Coaching (Online or Offline)' : `${mode.charAt(0).toUpperCase()+mode.slice(1)} Coaching`;

  grid.innerHTML = list.map(c =>
    `<div class="ob-opt${obData.coaching===c.id?' sel':''}" onclick="obSelectCoaching('${c.id}')" data-coaching="${c.id}" style="padding:.55rem .5rem">
      <div class="ob-opt-label">${c.name}</div>
      <div class="ob-opt-sub">${c.sub}</div>
    </div>`
  ).join('');
  
  if (obData.coaching && !list.find(c=>c.id===obData.coaching)) {
    obData.coaching = '';
  }
}

function buildCoachingGrid(containerId, selectedId, onSelect) {
  updateCoachingGrid();
}

function buildSettingsCoachingSelect() {
  const sel = document.getElementById('settings-coaching');
  const mode = document.getElementById('settings-mode')?.value || 'online';
  if (!sel) return;
  const list = mode === 'self' ? [{ id:'self', name:'Self Study', sub:'' }]
             : (COACHING_BY_MODE[mode] || COACHING_LIST);
  sel.innerHTML = [...list, { id:'self', name:'Self Study', sub:'' }]
    .filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i)
    .map(c => `<option value="${c.id}"${userProfile.coaching===c.id?' selected':''}>${c.name}</option>`)
    .join('');
  toggleCustomCoaching();
}

function toggleCustomCoaching() {
  const val = document.getElementById('settings-coaching')?.value;
  const row = document.getElementById('settings-custom-coaching-row');
  if (row) row.style.display = (val==='other_online'||val==='other_offline') ? '' : 'none';
}

let obData = { name: '', class_year: '', mode: '', coaching: '', year: '', avatarDataUrl: '' };

function showOnboarding() {
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('onboarding').classList.add('show');
  
  history.replaceState({page:'onboarding'}, '', '/onboarding');
  document.title = 'JEETrack — Setup Profile';
  
  const cs = document.getElementById('coaching-section');
  if (cs) cs.style.display = 'none';
  const nameEl = document.getElementById('ob-name');
  if (nameEl && currentUser?.user_metadata?.full_name) {
    nameEl.value = currentUser.user_metadata.full_name;
    updateObInitials();
  }
  
  setTimeout(initOnboardingCanvas, 50);
}

function updateObInitials() {
  const name = document.getElementById('ob-name')?.value || '';
  const initials = name.trim().split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const el = document.getElementById('ob-av-initials');
  if (el) el.textContent = initials;
  obData.name = name;
}

function handleObPhoto(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    obData.avatarDataUrl = e.target.result;
    
    try { localStorage.setItem('jt_avatar', e.target.result); } catch(_) {}
    const img = document.getElementById('ob-av-img');
    if (img) { img.src = e.target.result; img.style.display = 'block'; }
    document.getElementById('ob-av-initials').style.display = 'none';
    const rb = document.getElementById('ob-av-remove-btn');
    if (rb) rb.style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

function openObPresetPicker() {
  const picker = document.getElementById('ob-preset-picker');
  const grid = document.getElementById('ob-preset-grid');
  if (!picker || !grid) return;
  const isOpen = picker.style.display !== 'none';
  if (isOpen) { picker.style.display = 'none'; return; }
  if (!grid.children.length) {
    grid.innerHTML = '';
    PRESET_AVATARS.forEach(av => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = av.label;
      btn.style.cssText = 'background:none;border:2px solid var(--bd2);border-radius:50%;padding:0;cursor:pointer;width:48px;height:48px;overflow:hidden;transition:border-color .15s,transform .15s;display:flex;align-items:center;justify-content:center;';
      const blob = new Blob([av.svg], {type:'image/svg+xml'});
      const url = URL.createObjectURL(blob);
      const img = document.createElement('img');
      img.src = url; img.style.cssText = 'width:100%;height:100%;border-radius:50%;';
      btn.appendChild(img);
      btn.addEventListener('mouseenter', () => { btn.style.borderColor='var(--ac)'; btn.style.transform='scale(1.1)'; });
      btn.addEventListener('mouseleave', () => { btn.style.borderColor='var(--bd2)'; btn.style.transform=''; });
      btn.addEventListener('click', () => selectObPresetAvatar(url, av.label));
      grid.appendChild(btn);
    });
  }
  picker.style.display = 'block';
}

async function selectObPresetAvatar(svgUrl, label) {
  try {
    const res = await fetch(svgUrl);
    const blob = await res.blob();
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      obData.avatarDataUrl = dataUrl;
      
      try { localStorage.setItem('jt_avatar', dataUrl); } catch(_) {}
      const img = document.getElementById('ob-av-img');
      if (img) { img.src = dataUrl; img.style.display = 'block'; }
      const initials = document.getElementById('ob-av-initials');
      if (initials) initials.style.display = 'none';
      const picker = document.getElementById('ob-preset-picker');
      if (picker) picker.style.display = 'none';
      const rb = document.getElementById('ob-av-remove-btn');
      if (rb) rb.style.display = 'flex';
      toast(`Avatar "${label}" selected`, 'success');
    };
    reader.readAsDataURL(blob);
  } catch(e) { toast('Could not apply avatar', 'error'); }
}

function removeObAvatar() {
  obData.avatarDataUrl = '';
  const img = document.getElementById('ob-av-img');
  if (img) { img.src = ''; img.style.display = 'none'; }
  const initials = document.getElementById('ob-av-initials');
  if (initials) initials.style.display = '';
  const input = document.getElementById('ob-photo-input');
  if (input) input.value = '';
  const rb = document.getElementById('ob-av-remove-btn');
  if (rb) rb.style.display = 'none';
}

function obSelect(el, group) {
  document.querySelectorAll(`[onclick*="${group}"]`).forEach(e => e.classList.remove('sel'));
  el.classList.add('sel');
  const val = el.dataset.val;
  if (group === 'ob-class') { obData.class_year = val; _obClearHint(1); }
  else if (group === 'ob-mode') { obData.mode = val; _obClearHint(2); }
  else if (group === 'ob-year') { obData.year = val; _obClearHint(3); }
}

function _obClearHint(step) {
  const hint = document.getElementById(`ob-hint-${step}`);
  if (hint) {
    hint.textContent = '';
    hint.style.display = 'none';
  }
  
  const inner = document.querySelector(`#ob-step-${step} .ob-card-inner`);
  if (inner) inner.style.animation = 'none';
}

function obSelectCoaching(id) {
  document.querySelectorAll('#coaching-grid .ob-opt').forEach(e => e.classList.remove('sel'));
  document.querySelector(`[data-coaching="${id}"]`)?.classList.add('sel');
  obData.coaching = id;
  _obClearHint(2);
}

function obNext(step) {
  if (step === 0) {
    if (!obData.name.trim()) {
      const inp = document.getElementById('ob-name');
      inp.style.borderColor = 'rgba(248,113,113,.6)';
      inp.style.boxShadow = '0 0 0 3px rgba(248,113,113,.12)';
      inp.placeholder = 'Please enter your name';
      
      const inner = document.querySelector('#ob-step-0 .ob-card-inner');
      if (inner) { inner.style.animation = 'none'; void inner.offsetWidth; inner.style.animation = 'obShake .38s cubic-bezier(.36,.07,.19,.97)'; }
      inp.focus();
      return;
    }
    document.getElementById('ob-name').style.borderColor = '';
    document.getElementById('ob-name').style.boxShadow = '';
  }
  if (step === 1) {
    if (!obData.class_year) {
      _obShakeStep(1, 'Please select your class to continue');
      return;
    }
  }
  if (step === 2) {
    if (!obData.mode) {
      _obShakeStep(2, 'Please select a study mode to continue');
      return;
    }
    
    if (obData.mode !== 'self' && !obData.coaching) {
      _obShakeStep(2, 'Please select your coaching institute');
      return;
    }
  }
  if (step === 3) {
    if (!obData.year) {
      _obShakeStep(3, 'Please select your target year to continue');
      return;
    }
  }
  const nextStep = step + 1;
  document.getElementById(`ob-step-${step}`).classList.remove('active');
  document.getElementById(`ob-step-${nextStep}`)?.classList.add('active');
  
  
  const pcts = [0, 33.33, 66.66, 100];
  const fill = document.getElementById('ob-progress-fill');
  if (fill) fill.style.width = pcts[nextStep] + '%';
  
  for (let i = 0; i < 4; i++) {
    const lbl = document.getElementById(`ob-lbl-${i}`);
    if (!lbl) continue;
    lbl.classList.remove('done','current');
    if (i < nextStep) lbl.classList.add('done');
    else if (i === nextStep) lbl.classList.add('current');
  }
}

function _obShakeStep(step, msg) {
  const card = document.querySelector(`#ob-step-${step} .ob-card-shell`)||document.querySelector(`#ob-step-${step}`);
  if (!card) return;
  
  let hint = document.getElementById(`ob-hint-${step}`);
  if (!hint) {
    hint = document.createElement('div');
    hint.id = `ob-hint-${step}`;
    hint.style.cssText = 'font-size:11.5px;color:#f87171;text-align:center;margin-top:10px;font-weight:500;padding:8px 12px;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);border-radius:10px;';
    const actions = document.querySelector(`#ob-step-${step} .ob-actions`);
    if(actions) actions.parentNode.insertBefore(hint, actions);
    else card.appendChild(hint);
  }
  hint.textContent = '⚠ ' + msg;
  hint.style.display = '';
  
  const inner = document.querySelector(`#ob-step-${step} .ob-card-inner`) || card;
  inner.style.animation = 'none';
  void inner.offsetWidth;
  inner.style.animation = 'obShake .38s cubic-bezier(.36,.07,.19,.97)';
  
  clearTimeout(hint._hideTimer);
  hint._hideTimer = setTimeout(() => {
    if(hint) { hint.textContent = ''; hint.style.display = 'none'; }
    if(inner) inner.style.animation = 'none';
  }, 2800);
}

function obBack(step) {
  document.getElementById(`ob-step-${step}`).classList.remove('active');
  const prevStep = step - 1;
  document.getElementById(`ob-step-${prevStep}`)?.classList.add('active');
  
  const prevInner = document.querySelector(`#ob-step-${prevStep} .ob-card-inner`);
  if (prevInner) prevInner.style.animation = 'none';
  const prevHint = document.getElementById(`ob-hint-${prevStep}`);
  if (prevHint) { prevHint.textContent = ''; prevHint.style.display = 'none'; }
  
  const pcts = [0, 33.33, 66.66, 100];
  const fill = document.getElementById('ob-progress-fill');
  if (fill) fill.style.width = pcts[prevStep] + '%';
  
  for (let i = 0; i < 4; i++) {
    const lbl = document.getElementById(`ob-lbl-${i}`);
    if (!lbl) continue;
    lbl.classList.remove('done','current');
    if (i < prevStep) lbl.classList.add('done');
    else if (i === prevStep) lbl.classList.add('current');
  }
}

async function finishOnboarding() {
  if (!obData.year) {
    _obShakeStep(3, 'Please select your target year to continue');
    return;
  }
  const btn = document.getElementById('ob-finish-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
  const fields = {
    username: obData.name.trim(),
    class_year: obData.class_year || 'other',
    study_mode: obData.mode || 'self',
    coaching: obData.coaching || 'self',
    target_year: obData.year || '2027',
    onboarding_done: true,
  };
  
  localStorage.setItem('jt_target_year', fields.target_year);
  
  if (obData.avatarDataUrl && sb && currentUser) {
    try {
      const res = await fetch(obData.avatarDataUrl);
      const blob = await res.blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      const path = `avatars/${currentUser.id}.${ext}`;
      await sb.storage.from('avatars').upload(path, blob, { upsert: true });
      const { data: urlData } = sb.storage.from('avatars').getPublicUrl(path);
      if (urlData?.publicUrl) fields.avatar_url = urlData.publicUrl;
    } catch(e) {}
  }
  await saveUserProfile(fields);
  
  localStorage.setItem('jt_show_perm_after_onboarding', '1');
  
  await loadUserData();
  
  showApp(fields.username, currentUser?.email || '');
}

function initOnboardingCanvas() {
  const canvas = document.getElementById('ob-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  const COLORS = ['rgba(108,92,231,', 'rgba(162,155,254,', 'rgba(253,121,168,', 'rgba(96,165,250,', 'rgba(52,211,153,'];
  const particles = Array.from({length: 38}, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: 1 + Math.random() * 2.5,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    alpha: 0.1 + Math.random() * 0.4,
    da: (Math.random() - 0.5) * 0.003,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
  let af;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.alpha += p.da;
      if (p.alpha > 0.55 || p.alpha < 0.05) p.da *= -1;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      
      ctx.shadowColor = p.color + '0.9)';
      ctx.shadowBlur = p.r * 4;
      ctx.fillStyle = p.color + p.alpha.toFixed(2) + ')';
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    af = requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
  
  const ob = document.getElementById('onboarding');
  const obs = new MutationObserver(() => {
    if (!ob.classList.contains('show')) { cancelAnimationFrame(af); obs.disconnect(); }
  });
  obs.observe(ob, { attributes: true, attributeFilter: ['class'] });
}

function showSettingsPanel(id, btn) {
  document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.settings-nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById(`sp-${id}`)?.classList.add('active');
  btn?.classList.add('active');
  
  history.pushState({page:'settings',tab:id}, '', `/settings?tab=${id}`);
  document.title = `JEETrack — Settings · ${id.charAt(0).toUpperCase()+id.slice(1)}`;
  
  const subtitles = {
    profile: 'Profile',
    study: 'Study Info',
    goals: 'Goals',
    data: 'Data',
    alerts: 'Alerts',
    appearance: 'Appearance',
    account: 'Account',
  };
  const sub = document.querySelector('#page-settings .ps');
  if (sub) sub.textContent = subtitles[id] || 'Profile, data & preferences';
  
  if (id === 'study') { buildSettingsCoachingSelect(); loadStudySettings(); setTimeout(()=>initSettingsDirtyTracking(),100); }
  if (id === 'alerts') { loadAlertsSettings(); }
  
  if(window.innerWidth <= 768){
    const names={profile:'Profile',study:'Study Info',goals:'Goals',appearance:'Appearance',alerts:'Alerts',data:'Data & Backup',account:'Account',feedback:'Feedback'};
    updateMobTopbarTitle('settings', names[id] || '');
  }
}

function renderSettings() {
  
  loadGoalSettings(); 
  const name = userProfile.username || document.getElementById('sb-username')?.textContent || '';
  const email = document.getElementById('sb-email')?.textContent || '';
  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'A';
  if (document.getElementById('settings-av-initials')) document.getElementById('settings-av-initials').textContent = initials;
  if (document.getElementById('settings-name-display')) document.getElementById('settings-name-display').textContent = name;
  if (document.getElementById('settings-email-display')) document.getElementById('settings-email-display').textContent = email;
  if (document.getElementById('settings-email-ro')) document.getElementById('settings-email-ro').textContent = email;
  if (document.getElementById('settings-name-input')) document.getElementById('settings-name-input').value = name;
  
  const _cachedAv = localStorage.getItem('jt_avatar') || userProfile.avatar_url;
  if (_cachedAv) {
    const img = document.getElementById('settings-av-img');
    if (img) { img.src = _cachedAv; img.style.display = 'block'; }
    const initEl = document.getElementById('settings-av-initials');
    if (initEl) initEl.style.display = 'none';
    
    const rb = document.getElementById('settings-av-remove-btn');
    if (rb) rb.style.display = 'flex';
  } else {
    
    const initEl = document.getElementById('settings-av-initials');
    if (initEl) initEl.style.display = '';
    const rb = document.getElementById('settings-av-remove-btn');
    if (rb) rb.style.display = 'none';
  }
  
  showSettingsPanel('profile', document.querySelector('.settings-nav-item'));
  
  if(window.innerWidth <= 768){
    document.querySelectorAll('.mob-settings-tab').forEach(b=>b.classList.remove('active'));
    document.querySelector('.mob-settings-tab')?.classList.add('active');
  }
}

function loadStudySettings() {
  if (document.getElementById('settings-class')) document.getElementById('settings-class').value = userProfile.class_year || '12';
  if (document.getElementById('settings-year')) document.getElementById('settings-year').value = userProfile.target_year || '2027';
  if (document.getElementById('settings-mode')) document.getElementById('settings-mode').value = userProfile.study_mode || 'online';
  const coaching = COACHING_LIST.find(c => c.id === userProfile.coaching);
  const sel = document.getElementById('settings-coaching');
  if (sel) sel.value = coaching ? coaching.id : 'self';
  toggleCustomCoaching();
}

function loadAlertsSettings() {
  const snt = document.getElementById('settings-notif-toggle');
  
  const notifReallyOn = localStorage.getItem('notif_enabled') === '1' && typeof Notification !== 'undefined' && Notification.permission === 'granted';
  if (snt) snt.checked = notifReallyOn;
  loadEmailReportPref().then(() => {
    const pref = userProfile.email_reports === 'monthly';
    const et = document.getElementById('settings-email-toggle');
    if (et) et.checked = pref;
  });
}

async function saveProfileSettings() {
  const name = document.getElementById('settings-name-input')?.value.trim();
  if (!name) { toast('Enter a display name', 'warning'); return; }
  await saveUserProfile({ username: name });
  
  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'A';
  document.getElementById('sb-username').textContent = name;
  document.getElementById('sb-avatar').textContent = initials;
  document.getElementById('mob-avatar')?.textContent && (document.getElementById('mob-avatar').textContent = initials);
  document.getElementById('settings-name-display').textContent = name;
  document.getElementById('settings-av-initials').textContent = initials;
  setDashGreeting(name.split(' ')[0]);
  
}

async function saveStudySettings() {
  const coaching = document.getElementById('settings-coaching')?.value;
  const custom = document.getElementById('settings-custom-coaching')?.value;
  const targetYear = document.getElementById('settings-year')?.value || '';
  await saveUserProfile({
    class_year: document.getElementById('settings-class')?.value || '',
    study_mode: document.getElementById('settings-mode')?.value || '',
    coaching: coaching === 'other' ? (custom || 'other') : (coaching || ''),
    target_year: targetYear,
  });
  
  if (targetYear) localStorage.setItem('jt_target_year', targetYear);
  
  drawJeeDonut();
  
}

function _applyAvatarImage(src) {
  if (!src) return;
  
  const sbImg = document.getElementById('sb-avatar-img');
  const sbInit = document.getElementById('sb-avatar-initials');
  if (sbImg) { sbImg.src = src; sbImg.style.display = 'block'; }
  if (sbInit) sbInit.style.display = 'none';
  
  const mobImg = document.getElementById('mob-avatar-img');
  const mobInit = document.getElementById('mob-avatar');
  if (mobImg) { mobImg.src = src; mobImg.style.display = 'block'; }
  if (mobInit) mobInit.style.display = 'none';
  
  const sAvImg = document.getElementById('settings-av-img');
  const sAvInit = document.getElementById('settings-av-initials');
  if (sAvImg) { sAvImg.src = src; sAvImg.style.display = 'block'; }
  if (sAvInit) sAvInit.style.display = 'none';
  
  const avMenuImg = document.getElementById('avMenuImg');
  const avMenuInit = document.getElementById('avMenuInitials');
  if (avMenuImg) { avMenuImg.src = src; avMenuImg.style.display = 'block'; }
  if (avMenuInit) avMenuInit.style.display = 'none';
  
  const rb = document.getElementById('settings-av-remove-btn');
  if (rb) rb.style.display = 'flex';
}

function _clearAvatarImage() {
  ['sb-avatar-img','mob-avatar-img','settings-av-img','avMenuImg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.src = ''; el.style.display = 'none'; }
  });
  ['sb-avatar-initials','mob-avatar','settings-av-initials','avMenuInitials'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });
  
  const rb = document.getElementById('settings-av-remove-btn');
  if (rb) rb.style.display = 'none';
}

function removeAvatar() {
  localStorage.removeItem('jt_avatar');
  _clearAvatarImage();
  if (sb && currentUser) {
    saveUserProfile({ avatar_url: '' }).catch(() => {});
  }
  toast('Avatar removed', 'success');
}

const PRESET_AVATARS = [
  
  { id:'av1', label:'Cosmos',   svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#1e1b4b'/><circle cx='32' cy='24' r='11' fill='#7c6af7'/><ellipse cx='32' cy='52' rx='18' ry='10' fill='#7c6af7' opacity='.5'/><circle cx='22' cy='20' r='2.5' fill='#a695ff'/><circle cx='42' cy='28' r='1.8' fill='#f472b6'/></svg>` },
  { id:'av2', label:'Ember',    svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#1c0f0a'/><polygon points='32,8 48,50 32,42 16,50' fill='#f97316'/><polygon points='32,8 40,50 32,38 24,50' fill='#fbbf24'/><circle cx='32' cy='28' r='5' fill='#fef3c7'/></svg>` },
  { id:'av3', label:'Void',     svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#0f172a'/><circle cx='32' cy='32' r='18' fill='none' stroke='#60a5fa' stroke-width='2.5'/><circle cx='32' cy='32' r='10' fill='none' stroke='#3b82f6' stroke-width='1.5'/><circle cx='32' cy='32' r='4' fill='#60a5fa'/><line x1='14' y1='32' x2='50' y2='32' stroke='#60a5fa' stroke-width='1' opacity='.4'/><line x1='32' y1='14' x2='32' y2='50' stroke='#60a5fa' stroke-width='1' opacity='.4'/></svg>` },
  { id:'av4', label:'Sakura',   svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#1a0d11'/><ellipse cx='32' cy='30' rx='7' ry='12' fill='#f472b6' opacity='.9'/><ellipse cx='32' cy='30' rx='7' ry='12' fill='#f472b6' transform='rotate(72 32 30)'/><ellipse cx='32' cy='30' rx='7' ry='12' fill='#f472b6' transform='rotate(144 32 30)'/><ellipse cx='32' cy='30' rx='7' ry='12' fill='#f472b6' transform='rotate(216 32 30)'/><ellipse cx='32' cy='30' rx='7' ry='12' fill='#f472b6' transform='rotate(288 32 30)'/><circle cx='32' cy='30' r='5' fill='#fde68a'/></svg>` },
  { id:'av5', label:'Circuit',  svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#0a1a0e'/><rect x='20' y='20' width='24' height='24' rx='3' fill='none' stroke='#34d399' stroke-width='1.5'/><circle cx='20' cy='20' r='2.5' fill='#34d399'/><circle cx='44' cy='20' r='2.5' fill='#34d399'/><circle cx='44' cy='44' r='2.5' fill='#34d399'/><circle cx='20' cy='44' r='2.5' fill='#34d399'/><line x1='12' y1='20' x2='18' y2='20' stroke='#34d399' stroke-width='1.5'/><line x1='12' y1='44' x2='18' y2='44' stroke='#34d399' stroke-width='1.5'/><line x1='46' y1='32' x2='52' y2='32' stroke='#34d399' stroke-width='1.5'/><circle cx='32' cy='32' r='4' fill='#34d399' opacity='.7'/></svg>` },
  { id:'av6', label:'Storm',    svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#0c0c18'/><polygon points='36,10 28,30 34,30 26,54 42,26 34,26 40,10' fill='#fbbf24'/><polygon points='36,10 28,30 34,30 26,54 42,26 34,26 40,10' fill='url(#lg1)' opacity='.6'/><defs><linearGradient id='lg1' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#fff'/><stop offset='1' stop-color='#f59e0b' stop-opacity='0'/></linearGradient></defs></svg>` },
  { id:'av7', label:'Nova',     svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#120820'/><circle cx='32' cy='32' r='14' fill='#e879f9' opacity='.2'/><circle cx='32' cy='32' r='9' fill='#e879f9' opacity='.4'/><circle cx='32' cy='32' r='5' fill='#e879f9'/><circle cx='32' cy='14' r='2' fill='#f0abfc'/><circle cx='32' cy='50' r='2' fill='#f0abfc'/><circle cx='14' cy='32' r='2' fill='#f0abfc'/><circle cx='50' cy='32' r='2' fill='#f0abfc'/><circle cx='20' cy='20' r='1.5' fill='#f0abfc' opacity='.6'/><circle cx='44' cy='44' r='1.5' fill='#f0abfc' opacity='.6'/><circle cx='20' cy='44' r='1.5' fill='#f0abfc' opacity='.6'/><circle cx='44' cy='20' r='1.5' fill='#f0abfc' opacity='.6'/></svg>` },
  { id:'av8', label:'Wave',     svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#061a2e'/><path d='M10 28 Q18 18 26 28 Q34 38 42 28 Q50 18 58 28' stroke='#2dd4bf' stroke-width='2.5' fill='none'/><path d='M10 36 Q18 26 26 36 Q34 46 42 36 Q50 26 58 36' stroke='#60a5fa' stroke-width='2' fill='none' opacity='.7'/><path d='M10 20 Q18 10 26 20 Q34 30 42 20 Q50 10 58 20' stroke='#2dd4bf' stroke-width='1.5' fill='none' opacity='.4'/></svg>` },
  { id:'av9', label:'Rune',     svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#14110a'/><polygon points='32,10 56,54 8,54' fill='none' stroke='#fbbf24' stroke-width='2'/><line x1='32' y1='10' x2='32' y2='54' stroke='#fbbf24' stroke-width='1.5'/><line x1='20' y1='36' x2='44' y2='36' stroke='#fbbf24' stroke-width='1.5'/><circle cx='32' cy='32' r='4' fill='#fbbf24' opacity='.8'/></svg>` },
  { id:'av10',label:'Prism',    svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#0d0d0d'/><polygon points='32,14 50,44 14,44' fill='#7c6af7' opacity='.7'/><polygon points='32,20 46,42 18,42' fill='#f472b6' opacity='.5'/><polygon points='32,26 42,40 22,40' fill='#60a5fa' opacity='.6'/><circle cx='32' cy='34' r='3' fill='#fff' opacity='.8'/></svg>` },
  { id:'av11',label:'Atom',     svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#071020'/><ellipse cx='32' cy='32' rx='20' ry='8' fill='none' stroke='#60a5fa' stroke-width='1.5'/><ellipse cx='32' cy='32' rx='20' ry='8' fill='none' stroke='#60a5fa' stroke-width='1.5' transform='rotate(60 32 32)'/><ellipse cx='32' cy='32' rx='20' ry='8' fill='none' stroke='#60a5fa' stroke-width='1.5' transform='rotate(120 32 32)'/><circle cx='32' cy='32' r='4' fill='#60a5fa'/></svg>` },
  { id:'av12',label:'Fractal',  svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#0a0a0f'/><rect x='24' y='24' width='16' height='16' rx='2' fill='#7c6af7'/><rect x='18' y='18' width='10' height='10' rx='1.5' fill='#7c6af7' opacity='.5'/><rect x='36' y='18' width='10' height='10' rx='1.5' fill='#f472b6' opacity='.5'/><rect x='18' y='36' width='10' height='10' rx='1.5' fill='#f472b6' opacity='.5'/><rect x='36' y='36' width='10' height='10' rx='1.5' fill='#7c6af7' opacity='.5'/><rect x='28' y='12' width='8' height='8' rx='1' fill='#a695ff' opacity='.4'/><rect x='44' y='28' width='8' height='8' rx='1' fill='#a695ff' opacity='.4'/></svg>` },
];

function openPresetAvatarPicker() {
  const picker = document.getElementById('preset-avatar-picker');
  const grid = document.getElementById('preset-avatar-grid');
  if (!picker || !grid) return;
  const isOpen = picker.style.display !== 'none';
  if (isOpen) { picker.style.display = 'none'; return; }
  
  if (!grid.children.length) {
    grid.innerHTML = '';
    PRESET_AVATARS.forEach(av => {
      const btn = document.createElement('button');
      btn.title = av.label;
      btn.style.cssText = `background:none;border:2px solid var(--bd2);border-radius:50%;padding:0;cursor:pointer;width:48px;height:48px;overflow:hidden;transition:border-color .15s,transform .15s;display:flex;align-items:center;justify-content:center;`;
      const blob = new Blob([av.svg], {type:'image/svg+xml'});
      const url = URL.createObjectURL(blob);
      const img = document.createElement('img');
      img.src = url;
      img.style.cssText = 'width:100%;height:100%;border-radius:50%;';
      btn.appendChild(img);
      btn.addEventListener('mouseenter', () => { btn.style.borderColor = 'var(--ac)'; btn.style.transform = 'scale(1.1)'; });
      btn.addEventListener('mouseleave', () => { btn.style.borderColor = 'var(--bd2)'; btn.style.transform = ''; });
      btn.addEventListener('click', () => selectPresetAvatar(url, av.label));
      grid.appendChild(btn);
    });
  }
  picker.style.display = 'block';
  picker.style.animation = 'itemIn .2s ease';
}

async function selectPresetAvatar(svgUrl, label) {
  
  try {
    const res = await fetch(svgUrl);
    const blob = await res.blob();
    const reader = new FileReader();
    reader.onload = async e => {
      const dataUrl = e.target.result;
      localStorage.setItem('jt_avatar', dataUrl);
      _applyAvatarImage(dataUrl);
      
      const picker = document.getElementById('preset-avatar-picker');
      if (picker) picker.style.display = 'none';
      
      if (sb && currentUser) {
        try {
          const imgBlob = await (await fetch(dataUrl)).blob();
          const path = `avatars/${currentUser.id}.svg`;
          await sb.storage.from('avatars').upload(path, imgBlob, { upsert: true, contentType: 'image/svg+xml' });
          const { data: urlData } = sb.storage.from('avatars').getPublicUrl(path);
          if (urlData?.publicUrl) {
            await saveUserProfile({ avatar_url: urlData.publicUrl });
            userProfile.avatar_url = urlData.publicUrl;
          }
        } catch(_) {}
      }
      toast(`Avatar "${label}" selected ✓`, 'success');
    };
    reader.readAsDataURL(blob);
  } catch(e) { toast('Could not apply avatar', 'error'); }
}

function handleSettingsPhoto(input) {
  const file = input.files[0]; if (!file) return;
  
  const maxSize = 300 * 1024;
  const reader = new FileReader();
  reader.onload = async e => {
    let dataUrl = e.target.result;
    
    if (file.size > maxSize) {
      try {
        const img = new Image();
        await new Promise(r => { img.onload = r; img.src = dataUrl; });
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      } catch(_) {}
    }
    
    try { localStorage.setItem('jt_avatar', dataUrl); } catch(_) {  }
    _applyAvatarImage(dataUrl);
    
    if (sb && currentUser) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const ext = blob.type.includes('png') ? 'png' : 'jpg';
        const path = `avatars/${currentUser.id}.${ext}`;
        await sb.storage.from('avatars').upload(path, blob, { upsert: true });
        const { data: urlData } = sb.storage.from('avatars').getPublicUrl(path);
        if (urlData?.publicUrl) {
          await saveUserProfile({ avatar_url: urlData.publicUrl });
          userProfile.avatar_url = urlData.publicUrl;
        }
        toast('Photo updated ✓', 'success');
      } catch(e) { toast('Photo saved ✓', 'success'); }
    } else {
      toast('Photo saved ✓', 'success');
    }
  };
  reader.readAsDataURL(file);
}

async function doReset(){
  const val = document.getElementById('reset-confirm-input')?.value.trim();
  if(val !== 'DELETE'){ toast('Type DELETE to confirm', 'warning'); return; }
  closeM('resetConfirm');
  if(sb && currentUser){
    const uid = currentUser.id;
    toast('Deleting data…', 'saving');
    try{ await Promise.all([sb.from('tests').delete().eq('user_id',uid),sb.from('hours').delete().eq('user_id',uid),sb.from('backlogs').delete().eq('user_id',uid),sb.from('todos').delete().eq('user_id',uid),sb.from('upcoming').delete().eq('user_id',uid),sb.from('syllabus').delete().eq('user_id',uid),sb.from('streaks').delete().eq('user_id',uid)]); }catch(e){}
  }
  localStorage.removeItem('jt3');
  S = getDefaultState();
  toast('All data reset — reloading…', 'error');
  setTimeout(() => location.reload(), 800);
}

const THEME_PRESETS = {
  midnight: { bg:'#0a0a0f', sf:'#111118', sf2:'#18181f', sf3:'#1e1e28', tx:'#f0eff5', mu:'#7a7990', mu2:'#4a4960', bd:'rgba(255,255,255,0.07)', bd2:'rgba(255,255,255,0.12)' },
  amoled:   { bg:'#000000', sf:'#0d0d0d', sf2:'#111111', sf3:'#181818', tx:'#f5f5f5', mu:'#6b6b80', mu2:'#404050', bd:'rgba(255,255,255,0.06)', bd2:'rgba(255,255,255,0.10)' },
  slate:    { bg:'#0f1117', sf:'#161b22', sf2:'#1c2128', sf3:'#21262d', tx:'#e6edf3', mu:'#7d8590', mu2:'#484f58', bd:'rgba(255,255,255,0.08)', bd2:'rgba(255,255,255,0.13)' },
  forest:   { bg:'#0b110e', sf:'#111a14', sf2:'#16221a', sf3:'#1b2a20', tx:'#e8f5ec', mu:'#6b8571', mu2:'#3d5442', bd:'rgba(255,255,255,0.07)', bd2:'rgba(255,255,255,0.11)' },
  rose:     { bg:'#110b0e', sf:'#1a1215', sf2:'#201620', sf3:'#271b22', tx:'#f5e8ee', mu:'#8a6b7a', mu2:'#544050', bd:'rgba(255,255,255,0.07)', bd2:'rgba(255,255,255,0.11)' },
  amber:    { bg:'#f0f0f5', sf:'#ffffff', sf2:'#f4f4f8', sf3:'#eaeaf0', tx:'#1a1a2e', mu:'#6b6b85', mu2:'#a0a0b8', bd:'rgba(0,0,0,0.08)', bd2:'rgba(0,0,0,0.13)' },
};
const ACCENT_PRESETS = {
  '#7c6af7': '#a695ff', '#3b82f6': '#60a5fa', '#34d399': '#6ee7b7',
  '#f472b6': '#f9a8d4', '#fbbf24': '#fcd34d', '#f87171': '#fca5a5',
  '#2dd4bf': '#5eead4', '#e879f9': '#f0abfc',
};

function applyThemePreset(name) {
  const t = THEME_PRESETS[name]; if (!t) return;
  const r = document.documentElement.style;
  r.setProperty('--bg', t.bg); r.setProperty('--sf', t.sf); r.setProperty('--sf2', t.sf2);
  r.setProperty('--sf3', t.sf3); r.setProperty('--tx', t.tx); r.setProperty('--mu', t.mu);
  r.setProperty('--mu2', t.mu2); r.setProperty('--bd', t.bd); r.setProperty('--bd2', t.bd2);
  localStorage.setItem('jt_theme', name);
  document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
  document.getElementById('theme-' + name)?.classList.add('active');
  toast('Theme applied ✓', 'success');
}

function applyAccent(ac, ac2) {
  document.documentElement.style.setProperty('--ac', ac);
  document.documentElement.style.setProperty('--ac2', ac2);
  localStorage.setItem('jt_accent', ac);
  document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('active'));
  document.querySelector(`.accent-dot[data-color="${ac}"]`)?.classList.add('active');
  toast('Accent updated ✓', 'success');
}

function applyFontSize(s) {
  
  document.getElementById('jt-fs-override')?.remove();
  const htmlSizes = { sm: '12px', md: '14px', lg: '15.5px' };
  const base = htmlSizes[s] || '14px';
  
  document.documentElement.style.fontSize = base;
  document.body.style.fontSize = base;
  
  const ratios = { sm: 0.857, md: 1, lg: 1.107 };
  const ratio = ratios[s] || 1;
  if (s !== 'md') {
    const style = document.createElement('style');
    style.id = 'jt-fs-override';
    
    style.textContent = `
      .main, .sb, .md, .mo, .toast, .undobar, .cel-overlay {
        font-size: ${base} !important;
      }
      .sv { font-size: calc(1.7rem * ${ratio}) !important; }
      .pt { font-size: calc(1.4rem * ${ratio}) !important; }
      .slide-title { font-size: calc(2.7rem * ${ratio}) !important; }
      .land-hero-title { font-size: calc(1.55rem * ${ratio}) !important; }
      .land-auth-welcome { font-size: calc(1.35rem * ${ratio}) !important; }
      .logo { font-size: calc(1.05rem * ${ratio}) !important; }
    `;
    document.head.appendChild(style);
  }
  localStorage.setItem('jt_fontsize', s);
  document.querySelectorAll('.size-btn[id^="size-"]').forEach(b => b.classList.remove('active'));
  document.getElementById('size-' + s)?.classList.add('active');
  toast('Font size set ✓', 'success');
}

function applyDensity(d) {
  const pad = { compact: '.55rem .65rem', normal: '.9rem 1rem', relaxed: '1.2rem 1.3rem' };
  document.querySelectorAll('.card,.sc,.settings-section').forEach(el => el.style.padding = pad[d]);
  localStorage.setItem('jt_density', d);
  document.querySelectorAll('.size-btn[id^="density-"]').forEach(b => b.classList.remove('active'));
  document.getElementById('density-' + d)?.classList.add('active');
  toast('Density updated ✓', 'success');
}

function applyRadius(r, silent) {
  const vals  = { sharp: '4px',  rounded: '12px', pill: '20px' };
  const svals = { sharp: '3px',  rounded: '8px',  pill: '14px' };
  const mvals = { sharp: '6px',  rounded: '14px', pill: '22px' }; 
  const bvals = { sharp: '4px',  rounded: '8px',  pill: '99px' }; 
  document.documentElement.style.setProperty('--r',  vals[r]);
  document.documentElement.style.setProperty('--rs', svals[r]);
  
  const prev = document.getElementById('jt-radius-override');
  prev?.remove();
  const style = document.createElement('style');
  style.id = 'jt-radius-override';
  style.textContent = `
    .md, .settings-section, .ob-card, .auth-box, .cel-box { border-radius: ${mvals[r]} !important; }
    .btn, .fc, .fi, .fs, .size-btn, .fc, .auth-tab, .land-auth-tab, .ob-opt,
    .ni, .nb, .ti, .citem, .undobar, .settings-nav-item, .chip, .sp,
    .sbadge, .tt, .theme-card, .toast { border-radius: ${bvals[r]} !important; }
    .card, .sc { border-radius: ${vals[r]} !important; }
  `;
  document.head.appendChild(style);
  localStorage.setItem('jt_radius', r);
  document.querySelectorAll('.size-btn[id^="radius-"]').forEach(b => b.classList.remove('active'));
  document.getElementById('radius-' + r)?.classList.add('active');
  if (!silent) toast('Corner style set ✓', 'success');
}

function applySidebarBlur(on) {
  const sb = document.getElementById('sidebar');
  if (!sb) return;
  sb.classList.toggle('blur-on', on);
  localStorage.setItem('jt_sbblur', on ? '1' : '0');
}

function applySidebarGradient(on) {
  const sb = document.getElementById('sidebar');
  if (!sb) return;
  sb.classList.toggle('gradient-on', on);
  localStorage.setItem('jt_sbgrad', on ? '1' : '0');
}

function resetAppearance() {
  ['jt_theme','jt_accent','jt_fontsize','jt_density','jt_radius','jt_sbblur','jt_sbgrad'].forEach(k => localStorage.removeItem(k));
  location.reload();
}

function _goalKey(name){ const uid=currentUser?.id||'guest'; return 'jt_'+name+'_'+uid; }
function getGoalMains(){ return parseInt(localStorage.getItem(_goalKey('goal_mains'))||'200',10); }
function getGoalAdv()  { return parseInt(localStorage.getItem(_goalKey('goal_adv'))  ||'150',10); }

async function saveGoalSettings(){
  const gm=Math.max(1,Math.min(300,parseInt(document.getElementById('goal-mains').value)||200));
  const ga=Math.max(1,Math.min(360,parseInt(document.getElementById('goal-adv').value)||150));
  
  localStorage.setItem(_goalKey('goal_mains'),gm);
  localStorage.setItem(_goalKey('goal_adv'),ga);
  document.getElementById('goal-mains').value=gm;
  document.getElementById('goal-adv').value=ga;
  updateGoalsPreview();
  navMarkDirty('overview');navMarkDirty('mains');navMarkDirty('advanced');
  renderOverview();
  
  if(sb && currentUser){
    try{
      await sb.from('user_preferences').upsert({
        user_id: currentUser.id,
        goal_mains: gm,
        goal_adv: ga,
        updated_at: new Date().toISOString()
      },{onConflict:'user_id'});
    }catch(e){ console.warn('Could not save goals to Supabase',e); }
  }
  
}

function updateGoalsPreview(){
  const gm=parseInt(document.getElementById('goal-mains')?.value||'200',10);
  const ga=parseInt(document.getElementById('goal-adv')?.value||'150',10);
  const mp=Math.min(100,((gm/300)*100)).toFixed(1);
  const ap=Math.min(100,((ga/360)*100)).toFixed(1);
  const mb=document.getElementById('goal-mains-bar');
  const ab=document.getElementById('goal-adv-bar');
  const ml=document.getElementById('goal-mains-pct-label');
  const al=document.getElementById('goal-adv-pct-label');
  if(mb)mb.style.width=mp+'%';
  if(ab)ab.style.width=ap+'%';
  if(ml)ml.textContent=mp+'% of max';
  if(al)al.textContent=ap+'% of max';
}

function loadGoalSettings(){
  const gm=getGoalMains(),ga=getGoalAdv();
  const gmi=document.getElementById('goal-mains');
  const gai=document.getElementById('goal-adv');
  if(gmi)gmi.value=gm;
  if(gai)gai.value=ga;
  updateGoalsPreview();
  
  ['goal-mains','goal-adv'].forEach(id=>{
    document.getElementById(id)?.addEventListener('input',updateGoalsPreview);
  });
}

function loadAppearanceSettings() {
  
  const theme = localStorage.getItem('jt_theme') || 'midnight';
  if (theme !== 'midnight') applyThemePreset(theme);
  document.getElementById('theme-' + theme)?.classList.add('active');
  
  const ac = localStorage.getItem('jt_accent');
  if (ac && ACCENT_PRESETS[ac]) { applyAccent(ac, ACCENT_PRESETS[ac]); }
  else { document.querySelector('.accent-dot[data-color="#7c6af7"]')?.classList.add('active'); }
  
  const fs = localStorage.getItem('jt_fontsize') || 'md';
  applyFontSize(fs);
  
  const dn = localStorage.getItem('jt_density') || 'normal';
  if (dn !== 'normal') applyDensity(dn);
  document.getElementById('density-' + dn)?.classList.add('active');
  
  const rr = localStorage.getItem('jt_radius') || 'rounded';
  applyRadius(rr, true);
  
  const blur = localStorage.getItem('jt_sbblur') === '1';
  if (blur) { applySidebarBlur(true); document.getElementById('settings-sidebar-blur').checked = true; }
  
  const grad = localStorage.getItem('jt_sbgrad') === '1';
  if (grad) { applySidebarGradient(true); document.getElementById('settings-sidebar-gradient').checked = true; }
}

function initSettingsDirtyTracking() {
  
  const nameInput = document.getElementById('settings-name-input');
  if (nameInput) {
    nameInput.addEventListener('input', () => markSettingsDirty('profile-save-btn'));
  }

  
  ['settings-class','settings-year','settings-mode','settings-coaching','settings-custom-coaching'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => markSettingsDirty('study-save-btn'));
    if (el && el.tagName === 'INPUT') el.addEventListener('input', () => markSettingsDirty('study-save-btn'));
  });

  
  ['goal-mains','goal-adv'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => markSettingsDirty('goals-save-btn'));
  });
}

function markSettingsDirty(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.removeAttribute('disabled');
  btn.classList.add('dirty');
  setTimeout(() => btn.classList.remove('dirty'), 500);
}

function resetSettingsDirty(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.setAttribute('disabled', '');
  btn.classList.remove('dirty');
}

const _origSaveProfile = saveProfileSettings;
saveProfileSettings = async function() {
  const btn = document.getElementById('profile-save-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  toast('Saving…', 'saving');
  await _origSaveProfile();
  if (btn) { btn.textContent = 'Save Changes'; btn.setAttribute('disabled',''); }
  toastDismiss();
  toast('Profile saved ✓', 'success');
};

const _origSaveStudy = saveStudySettings;
saveStudySettings = async function() {
  const btn = document.getElementById('study-save-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  toast('Saving…', 'saving');
  await _origSaveStudy();
  if (btn) { btn.textContent = 'Save Changes'; btn.setAttribute('disabled',''); }
  toastDismiss();
  toast('Study info saved ✓', 'success');
};

const _origSaveGoals = saveGoalSettings;
saveGoalSettings = function() {
  const btn = document.getElementById('goals-save-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  toast('Saving…', 'saving');
  setTimeout(() => {
    _origSaveGoals();
    if (btn) { btn.textContent = 'Save Goals'; btn.setAttribute('disabled',''); }
    toastDismiss();
    toast('Goals saved', 'success');
  }, 400);
};

document.addEventListener('DOMContentLoaded', () => {
  initSupabase(); 
  setTimeout(initSettingsDirtyTracking, 600);
  
  const dropzone = document.getElementById('settings-avatar-dropzone');
  if (dropzone) {
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
    dropzone.addEventListener('dragleave', e => { if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove('drag-over'); });
    dropzone.addEventListener('dragenter', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = ev => {
          const dataUrl = ev.target.result;
          localStorage.setItem('jt_avatar', dataUrl);
          
          const avatarPreviews = document.querySelectorAll('.settings-avatar-preview, .avatar-preview, #settings-avatar-img');
          avatarPreviews.forEach(img => {
            if (img.tagName === 'IMG') img.src = dataUrl;
            else img.style.backgroundImage = `url(${dataUrl})`;
          });
          
          const sidebarAvatar = document.getElementById('sidebar-avatar');
          if (sidebarAvatar) {
            if (sidebarAvatar.tagName === 'IMG') sidebarAvatar.src = dataUrl;
            else sidebarAvatar.style.backgroundImage = `url(${dataUrl})`;
          }
          dropzone.classList.add('upload-success');
          setTimeout(() => dropzone.classList.remove('upload-success'), 1200);
          toast('Avatar updated ✓', 'success');
        };
        reader.readAsDataURL(file);
      } else if (file) {
        toast('Please drop an image file (JPG, PNG, etc.)', 'error');
      }
    });
    
    const avatarFileInput = document.getElementById('settings-avatar-file');
    if (avatarFileInput) {
      dropzone.addEventListener('click', () => avatarFileInput.click());
      avatarFileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = ev => {
            const dataUrl = ev.target.result;
            localStorage.setItem('jt_avatar', dataUrl);
            const avatarPreviews = document.querySelectorAll('.settings-avatar-preview, .avatar-preview, #settings-avatar-img');
            avatarPreviews.forEach(img => {
              if (img.tagName === 'IMG') img.src = dataUrl;
              else img.style.backgroundImage = `url(${dataUrl})`;
            });
            const sidebarAvatar = document.getElementById('sidebar-avatar');
            if (sidebarAvatar) {
              if (sidebarAvatar.tagName === 'IMG') sidebarAvatar.src = dataUrl;
              else sidebarAvatar.style.backgroundImage = `url(${dataUrl})`;
            }
            toast('Avatar updated ✓', 'success');
          };
          reader.readAsDataURL(file);
        }
        avatarFileInput.value = '';
      });
    }
  }
});

function updateFbBtn() {
  const subj = document.getElementById('fb-subject')?.value.trim() || '';
  const msg  = document.getElementById('fb-message')?.value.trim() || '';
  const btn  = document.getElementById('fb-send-btn');
  if (btn) btn.disabled = !(subj && msg);
}

async function sendFeedback() {
  const subj = document.getElementById('fb-subject')?.value.trim();
  const msg  = document.getElementById('fb-message')?.value.trim();
  if (!subj || !msg) { toast('Please fill in both subject and message', 'warning'); return; }

  const btn = document.getElementById('fb-send-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  try {
    
    let saved = false;
    if (sb && currentUser) {
      try {
        const { error } = await sb.from('feedback').insert({
          user_id: currentUser.id,
          email: currentUser.email,
          subject: subj,
          message: msg,
          created_at: new Date().toISOString()
        });
        if (!error) saved = true;
      } catch(e) {}
    }

    
    if (!saved) {
      const mailtoUrl = `mailto:aman@jeetrack.app?subject=${encodeURIComponent('[JEETrack Feedback] ' + subj)}&body=${encodeURIComponent(msg + '\n\n— Sent from JEETrack\nUser: ' + (currentUser?.email || 'anonymous'))}`;
      window.open(mailtoUrl, '_blank');
    }

    toast('Feedback sent! Thank you 🙏', 'success');
    if (document.getElementById('fb-subject')) document.getElementById('fb-subject').value = '';
    if (document.getElementById('fb-message')) document.getElementById('fb-message').value = '';
    if (btn) { btn.textContent = 'Sent ✓'; setTimeout(() => { if(btn){ btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Feedback'; btn.disabled = false; } }, 2500); }
  } catch(e) {
    toast('Could not send — please email aman@jeetrack.app directly', 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Feedback'; }
  }
}
