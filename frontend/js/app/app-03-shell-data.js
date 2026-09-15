function showApp(name, email){
  document.getElementById('landing').classList.add('hidden');
  hideSplash();
  document.getElementById('onboarding').classList.remove('show');
  document.getElementById('main-app').style.display='flex';
  if(typeof _restoreHoursFilter==='function'){ try{ _restoreHoursFilter(); }catch(e){ console.warn('_restoreHoursFilter failed:', e); } }
  loadPublicSiteConfig().catch(()=>{});
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
  claimGuestDonationsAndLoadBadge();
  try{ startActivityHeartbeat(); }catch(e){ console.warn('startActivityHeartbeat failed:', e); }
  setDashGreeting(displayName.split(' ')[0]);
  
  
  if(typeof navMarkDirty === 'function') navMarkDirty(null);
  updateBadges();checkHWTNotifs();if(typeof setQuote==='function')setQuote();
  updatePracticeNewBadge();
  
  
  
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
  
  setTimeout(async () => {
    const activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'page-overview') {
      try {
        await checkWelcomeModal();
      } catch(e) {
        console.warn('checkWelcomeModal failed:', e);
      }
      const welcomeIsOpen = document.getElementById('modal-welcome')?.classList.contains('open');
      if (!welcomeIsOpen) {
        checkSupportPrompt();
      }
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

// CUSTOM_CHAPTER_ID_THRESHOLD and isCustomChapter() are declared globally in
// index.html's inline script, which loads before this file — reused here as-is.

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
    
    const customChs=old.filter(c=>isCustomChapter(c));
    saved.syllabus[s]=canonical.concat(customChs);
  });
  return saved;
}

function getDefaultState(){
  return{tests:[],hours:[],backlogs:[],todos:[],upcoming:[],practiceLogs:[],
    syllabus:JSON.parse(JSON.stringify(CANONICAL_SYLLABUS)),
    backlogStreak:0,backlogBestStreak:0,lastBLClear:null,
    subjStreaks:{physics:0,chemistry:0,maths:0},
    subjBestStreaks:{physics:0,chemistry:0,maths:0},notifiedHWT:[],hwtDismissed:[]};
}

// ── Dirty-tracking sync snapshot ──
// Tracks the last-synced payload (as JSON) per row per table, so save()
// only needs to upsert rows that actually changed instead of the full array.
const _syncSnapshot = { tests:{}, hours:{}, backlogs:{}, todos:{}, upcoming:{}, practiceLogs:{} };

function _payloadTest(t,uid){ return {id:t.id,user_id:uid,exam:t.exam,session:t.session,paper:t.paper,type:t.type,date:t.date,total:t.total,max:t.max,physics:t.physics,chemistry:t.chemistry,maths:t.maths,notes:t.notes||''}; }
function _payloadHour(h,uid){ return {id:h.id,user_id:uid,date:h.date,subject:h.subject,lecture:h.lecture,practice:h.practice,revision:h.revision,total:h.total,mock_analysis:h.mockAnalysis||0,source:h.source||'manual',label:h.label||null,mock_id:h.mockId||null}; }
function _payloadBacklog(b,uid){ return {id:b.id,user_id:uid,title:b.title,subject:b.subject,priority:b.priority,due:b.due,details:b.details||'',done:b.done,added_date:b.addedDate,done_date:b.doneDate}; }
function _payloadTodo(t,uid){ return {id:t.id,user_id:uid,title:t.title,subject:t.subject,priority:t.priority,due:t.due,details:t.details||'',done:t.done,added_date:t.addedDate,done_date:t.doneDate}; }
function _payloadUpcoming(u,uid){ return {id:u.id,user_id:uid,exam:u.exam,session:u.session,type:u.type,date:u.date,venue:u.venue||'',notes:u.notes||''}; }
function _payloadSyllabusState(){ return {physics:S.syllabus.physics||[],chemistry:S.syllabus.chemistry||[],maths:S.syllabus.maths||[]}; }
function _payloadPracticeLog(p,uid){ return {id:p.id,user_id:uid,subject:p.subject,chapter_id:p.chapterId,chapter_name:p.chapterName,questions:p.questions,date:p.date,logged_at:p.loggedAt}; }
function _snapKey(row){ return JSON.stringify(row); }

// Call once right after S.* has been freshly loaded from the server, so
// existing (already-in-sync) rows aren't mistaken for "changed" on the next save().
// NOTE: the once-per-day Supabase activity ping that used to live here has
// been removed — PostHog's `app_opened` event now powers DAU/WAU/MAU on the
// admin dashboard instead, with zero Supabase IO cost.

function _seedSyncSnapshot(){
  if(!currentUser) return;
  const uid = currentUser.id;
  _syncSnapshot.tests = {}; (S.tests||[]).forEach(t=>{ _syncSnapshot.tests[t.id]=_snapKey(_payloadTest(t,uid)); });
  _syncSnapshot.hours = {}; (S.hours||[]).forEach(h=>{ _syncSnapshot.hours[h.id]=_snapKey(_payloadHour(h,uid)); });
  _syncSnapshot.backlogs = {}; (S.backlogs||[]).forEach(b=>{ _syncSnapshot.backlogs[b.id]=_snapKey(_payloadBacklog(b,uid)); });
  _syncSnapshot.todos = {}; (S.todos||[]).forEach(t=>{ _syncSnapshot.todos[t.id]=_snapKey(_payloadTodo(t,uid)); });
  _syncSnapshot.upcoming = {}; (S.upcoming||[]).forEach(u=>{ _syncSnapshot.upcoming[u.id]=_snapKey(_payloadUpcoming(u,uid)); });
  _syncSnapshot._syllabus = _snapKey(_payloadSyllabusState());
  _syncSnapshot.practiceLogs = {}; (S.practiceLogs||[]).forEach(p=>{ _syncSnapshot.practiceLogs[p.id]=_snapKey(_payloadPracticeLog(p,uid)); });
  _syncSnapshot._streaks = _snapKey({user_id:uid,backlog_streak:S.backlogStreak,best_streak:S.backlogBestStreak,last_clear:S.lastBLClear,subj_streaks:S.subjStreaks,subj_best_streaks:S.subjBestStreaks,hwt_dismissed:S.hwtDismissed||[]});
}

async function loadUserData(){
  if(!sb || !currentUser){
    const saved = localStorage.getItem('jt3');
    if(saved) try{
      let p=JSON.parse(saved);
      if(p.backlogStreak>365)p.backlogStreak=0;
      if(p.backlogBestStreak>365)p.backlogBestStreak=0;
      p=migrateSyllabus(p);
      if(!p.practiceLogs)p.practiceLogs=[];
      S=p;
    }catch(e){}
    return;
  }

  // Version-check short-circuit: before doing the full 8-table fetch, do ONE
  // tiny single-row check of user_preferences.updated_at (bumped on every
  // successful sync, from ANY device). If it matches what we already have
  // cached locally, NOTHING has changed anywhere since our last full sync —
  // safe to use the local copy as-is. If it differs (or this is the first
  // load), fall through to the full fetch. Unlike a blind time-based cache,
  // this is always accurate — no staleness window, no multi-device risk.
  try{
    const uidCheck = currentUser.id;
    const {data:verRow} = await sb.from('sync_state').select('updated_at').eq('user_id',uidCheck).maybeSingle();
    const serverUpdatedAt = verRow?.updated_at || null;
    const localKnown = localStorage.getItem('jt3_known_updated_at');
    // Compare as actual instants, not raw strings — Postgres returns
    // timestamptz as "...+00:00" while JS's toISOString() produces "...Z".
    // Same instant, different string — a strict string match here was
    // ALWAYS failing even when nothing had changed, silently forcing a
    // full fetch on every single load instead of ever using the cache.
    const serverMs = serverUpdatedAt ? new Date(serverUpdatedAt).getTime() : null;
    const localMs = localKnown ? new Date(localKnown).getTime() : null;
    if(serverMs && localMs && serverMs === localMs){
      const saved = localStorage.getItem('jt3');
      if(saved){
        let p = JSON.parse(saved);
        if(p.backlogStreak>365) p.backlogStreak=0;
        if(p.backlogBestStreak>365) p.backlogBestStreak=0;
        p=migrateSyllabus(p);
        if(!p.practiceLogs) p.practiceLogs=[];
        S=p;
        _seedSyncSnapshot();
        return; // nothing changed anywhere — skip the full fetch entirely
      }
    }
  }catch(e){}

  // Single RPC instead of 8 parallel SELECTs — same batching idea as
  // save_tests/save_hours/etc. on the write side, applied to the read side.
  // Cuts a full load from 8 round trips down to 1.
  const _applyFullState = (full, uid) => {
    S.tests=(full.tests||[]).map(r=>({id:r.id,exam:r.exam,session:r.session,paper:r.paper,type:r.type,date:r.date,total:r.total,max:r.max,physics:r.physics,chemistry:r.chemistry,maths:r.maths,notes:r.notes||''}));
    S.hours=(full.hours||[]).map(r=>({id:r.id,date:r.date,subject:r.subject,lecture:r.lecture,practice:r.practice,revision:r.revision,total:r.total,mockAnalysis:r.mock_analysis||0,source:r.source||'manual',label:r.label||null,mockId:r.mock_id||null}));
    S.backlogs=(full.backlogs||[]).map(r=>({id:r.id,title:r.title,subject:r.subject,priority:r.priority,due:r.due,details:r.details||'',done:r.done,addedDate:r.added_date,doneDate:r.done_date}));
    S.todos=(full.todos||[]).map(r=>({id:r.id,title:r.title,subject:r.subject,priority:r.priority,due:r.due,details:r.details||'',done:r.done,addedDate:r.added_date,doneDate:r.done_date}));
    S.upcoming=(full.upcoming||[]).map(r=>({id:r.id,exam:r.exam,session:r.session,type:r.type,date:r.date,venue:r.venue||'',notes:r.notes||''}));
    const syllabusState = full.user_preferences && full.user_preferences.syllabus_state;
    if(syllabusState){
      S.syllabus={
        physics:syllabusState.physics||[],
        chemistry:syllabusState.chemistry||[],
        maths:syllabusState.maths||[]
      };
      S=migrateSyllabus(S);
    }
    S.practiceLogs=(full.practice_logs||[]).map(r=>({id:r.id,subject:r.subject,chapterId:r.chapter_id,chapterName:r.chapter_name,questions:r.questions,date:r.date,loggedAt:r.logged_at}));
    if(full.streaks){
      S.backlogStreak = Math.min(full.streaks.backlog_streak||0, 365);
      S.backlogBestStreak = Math.min(full.streaks.best_streak||0, 365);
      S.lastBLClear = full.streaks.last_clear;
      S.subjStreaks = full.streaks.subj_streaks||{physics:0,chemistry:0,maths:0};
      S.subjBestStreaks = full.streaks.subj_best_streaks||{physics:0,chemistry:0,maths:0};

      S.hwtDismissed = full.streaks.hwt_dismissed||[];

      try{
        const cacheKey='jt_hwt_dismissed_'+uid;
        const localArr=JSON.parse(localStorage.getItem(cacheKey)||'[]');
        const merged=[...new Set([...localArr,...S.hwtDismissed])];
        localStorage.setItem(cacheKey,JSON.stringify(merged));
        S.hwtDismissed=merged;
      }catch(e){}
    }
    _seedSyncSnapshot();
    try{ localStorage.setItem('jt3_known_updated_at', full.updated_at || ''); }catch(e){}
  };

  try{
    const uid = currentUser.id;
    const { data: full, error } = await sb.rpc('get_full_state');
    if(error) throw error;
    _applyFullState(full||{}, uid);
  }catch(e){
    console.error('Load error:',e);
    
    try {
      // Jittered delay (1.5s-3.5s) instead of a fixed 1500ms: if a batch of
      // users' first attempts fail together because the DB is genuinely
      // under load, a fixed delay makes every one of them retry in lockstep
      // at the same instant, adding a synchronized second wave right on top
      // of whatever caused the slowdown. Spreading retries over a window
      // smooths that back out into a trickle instead of a spike.
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 2000));
      const uid2 = currentUser.id;
      const { data: full2, error: error2 } = await sb.rpc('get_full_state');
      if(error2) throw error2;
      _applyFullState(full2||{}, uid2);
      console.log('Retry load succeeded');
    } catch(e2) {
      console.error('Retry load also failed, falling back to localStorage:', e2);
      const saved=localStorage.getItem('jt3');
      if(saved) try{ const p=JSON.parse(saved); if(p.backlogStreak>365)p.backlogStreak=0; if(!p.practiceLogs)p.practiceLogs=[]; S=p; }catch(e3){}
    }
  }
}

