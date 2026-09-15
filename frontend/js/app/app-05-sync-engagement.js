// ── Debounced network sync ──
// save() is called extremely often (every practice-log tap, every checkbox,
// every field edit). Writing to localStorage is cheap and stays instant, but
// hitting Supabase on every single call multiplies IO fast — especially now
// that Practice Log encourages many quick logs per session. So the network
// part is debounced: rapid-fire save() calls within the window collapse into
// ONE upsert round instead of one per action.
let _saveDebounceTimer = null;
const SAVE_DEBOUNCE_MS = 1200;

function save(){
  if(S.backlogStreak > 365) S.backlogStreak = 0;
  if(S.backlogBestStreak > 365) S.backlogBestStreak = 0;
  localStorage.setItem('jt3', JSON.stringify(S));   // instant, always — no data loss risk
  if(!sb || !currentUser) return;
  clearTimeout(_saveDebounceTimer);
  _saveDebounceTimer = setTimeout(_syncToServer, SAVE_DEBOUNCE_MS);
}

// Flush immediately if the user is about to leave/hide the tab, so a
// debounced save in-flight doesn't get lost.
function flushSave(){
  if(_saveDebounceTimer){ clearTimeout(_saveDebounceTimer); _saveDebounceTimer=null; }
  return _syncToServer();
}
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden') flushSave(); });
window.addEventListener('beforeunload', flushSave);
window.addEventListener('pagehide', flushSave);

async function _syncToServer(){
  if(!sb || !currentUser) return;
  if(isSaving){ saveQueue=true; return; }
  isSaving = true;
  try{
    const uid = currentUser.id;
    const ops = [];
    // One shared timestamp for this whole sync round — reused below so the
    // value we bump user_preferences.updated_at to is exactly what we also
    // remember locally, keeping this device's own version-check accurate.
    const syncTimestamp = new Date().toISOString();

    const changedTests = (S.tests||[]).map(t=>_payloadTest(t,uid)).filter(p=>_syncSnapshot.tests[p.id]!==_snapKey(p));
    if(changedTests.length) ops.push(sb.rpc('save_tests', { p_rows: changedTests }).then(({error})=>{ if(!error) changedTests.forEach(p=>_syncSnapshot.tests[p.id]=_snapKey(p)); }));

    const changedHours = (S.hours||[]).map(h=>_payloadHour(h,uid)).filter(p=>_syncSnapshot.hours[p.id]!==_snapKey(p));
    if(changedHours.length) ops.push(sb.rpc('save_hours', { p_rows: changedHours }).then(({error})=>{ if(!error) changedHours.forEach(p=>_syncSnapshot.hours[p.id]=_snapKey(p)); }));

    const changedBacklogs = (S.backlogs||[]).map(b=>_payloadBacklog(b,uid)).filter(p=>_syncSnapshot.backlogs[p.id]!==_snapKey(p));
    if(changedBacklogs.length) ops.push(sb.rpc('save_backlogs', { p_rows: changedBacklogs }).then(({error})=>{ if(!error) changedBacklogs.forEach(p=>_syncSnapshot.backlogs[p.id]=_snapKey(p)); }));

    const changedTodos = (S.todos||[]).map(t=>_payloadTodo(t,uid)).filter(p=>_syncSnapshot.todos[p.id]!==_snapKey(p));
    if(changedTodos.length) ops.push(sb.rpc('save_todos', { p_rows: changedTodos }).then(({error})=>{ if(!error) changedTodos.forEach(p=>_syncSnapshot.todos[p.id]=_snapKey(p)); }));

    const changedUpcoming = (S.upcoming||[]).map(u=>_payloadUpcoming(u,uid)).filter(p=>_syncSnapshot.upcoming[p.id]!==_snapKey(p));
    if(changedUpcoming.length) ops.push(sb.from('upcoming').upsert(changedUpcoming).then(({error})=>{ if(!error) changedUpcoming.forEach(p=>_syncSnapshot.upcoming[p.id]=_snapKey(p)); }));

    const syllabusStatePayload = _payloadSyllabusState();
    const syllabusStateKey = _snapKey(syllabusStatePayload);
    const syllabusChanged = _syncSnapshot._syllabus !== syllabusStateKey;
    if(syllabusChanged){
      ops.push(sb.from('user_preferences').upsert({user_id:uid,syllabus_state:syllabusStatePayload},{onConflict:'user_id'}).then(({error})=>{ if(!error) _syncSnapshot._syllabus = syllabusStateKey; }));
    }

    const changedPracticeLogs = (S.practiceLogs||[]).map(p=>_payloadPracticeLog(p,uid)).filter(p=>_syncSnapshot.practiceLogs[p.id]!==_snapKey(p));
    if(changedPracticeLogs.length) ops.push(sb.rpc('save_practice_logs', { p_rows: changedPracticeLogs }).then(({error})=>{ if(!error) changedPracticeLogs.forEach(p=>_syncSnapshot.practiceLogs[p.id]=_snapKey(p)); }));

    // Streaks — now also diff-checked, since with Practice Log firing saves
    // far more often, an unconditional call here adds up fast.
    const streaksPayload = {user_id:uid,backlog_streak:S.backlogStreak,best_streak:S.backlogBestStreak,last_clear:S.lastBLClear,subj_streaks:S.subjStreaks,subj_best_streaks:S.subjBestStreaks,hwt_dismissed:S.hwtDismissed||[]};
    const streaksKey = _snapKey(streaksPayload);
    if(_syncSnapshot._streaks !== streaksKey){
      ops.push(sb.from('streaks').upsert(streaksPayload,{onConflict:'user_id'}).then(({error})=>{ if(!error) _syncSnapshot._streaks = streaksKey; }));
    }

    await Promise.all(ops);

    // Bump the shared freshness marker whenever ANYTHING changed this round —
    // this is what lets loadUserData()'s version-check (on any device) detect
    // "something changed" without a blind time-based guess. This now lives on
    // its own sync_state row instead of user_preferences: previously this
    // upsert landed on the same row that also holds syllabus_state, profile
    // fields, and goals — 74% of all writes to that row were this timestamp
    // bump, not real preference data, and it was the row that seized up
    // under lock contention on 2026-09-09. A dedicated row per user means
    // this fires on every save round (cheap, single-column) without
    // contending with actual preference writes or the version-check read.
    if(ops.length){
      try{
        await sb.from('sync_state').upsert({user_id:uid, updated_at:syncTimestamp},{onConflict:'user_id'});
        localStorage.setItem('jt3_known_updated_at', syncTimestamp);
      }catch(e){}
    }
  }catch(e){ console.error('Save error:',e); }
  isSaving=false; if(saveQueue){ saveQueue=false; _syncToServer(); }
}

const _dbTableName = { practiceLogs:'practice_logs' };
async function dbDelete(table, id){
  localStorage.setItem('jt3', JSON.stringify(S));
  if(_syncSnapshot[table]) delete _syncSnapshot[table][id];
  if(!sb || !currentUser) return;
  try{ await sb.from(_dbTableName[table]||table).delete().eq('id',id).eq('user_id',currentUser.id); }catch(e){}
}

async function exportPDF(){
  toast('Generating PDF…', 'saving');
  await window.ensureJsPdf();
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

function checkSupportPrompt(){
  const neverFlag = localStorage.getItem('jt_support_prompt_never');
  if(neverFlag==='1') return;
  setTimeout(()=>{
    document.getElementById('modal-supportPrompt')?.classList.add('open');
  }, 400);
}
function closeSupportPrompt(){
  const chk = document.getElementById('sp-never');
  if(chk && chk.checked) localStorage.setItem('jt_support_prompt_never', '1');
  document.getElementById('modal-supportPrompt')?.classList.remove('open');
}
function supportPromptGo(){
  closeSupportPrompt();
  window.open('/support', '_blank');
}

// Belt-and-suspenders: watch the welcome modal's class directly instead of
// only relying on every close path (Later/Skip/Allow/etc.) to explicitly
// call checkSupportPrompt(). This fires exactly once, the moment
// modal-welcome actually loses its 'open' class, no matter which button or
// flow caused that.
(function(){
  const wm = document.getElementById('modal-welcome');
  if(!wm) return;
  let firedForThisOpen = false;
  const obs = new MutationObserver(() => {
    const isOpen = wm.classList.contains('open');
    if(isOpen){ firedForThisOpen = false; return; }
    if(firedForThisOpen) return;
    firedForThisOpen = true;
    setTimeout(() => checkSupportPrompt(), 500);
  });
  obs.observe(wm, { attributes: true, attributeFilter: ['class'] });
})();

function updatePracticeNewBadge(){
  const seen = localStorage.getItem('jt_practice_visited')==='1';
  document.getElementById('practice-new-dot')?.classList.toggle('show', !seen);
  document.getElementById('practice-new-dot-mob')?.classList.toggle('show', !seen);
}

async function checkWelcomeModal() {
  
  const notifOn = localStorage.getItem('notif_enabled') === '1' && typeof Notification !== 'undefined' && Notification.permission === 'granted';
  // email_reports is already loaded into `userProfile` by loadUserProfile() during
  // login/init — no need to hit user_preferences again here.
  const emailOn = userProfile?.email_reports === 'monthly';
  const notifDismissed = localStorage.getItem('wm_notif_never') === '1';
  const emailDismissed = localStorage.getItem('wm_email_never') === '1';

  if ((notifOn || notifDismissed) && (emailOn || emailDismissed)) return;

  
  localStorage.removeItem('jt_show_perm_after_onboarding');

  
  _openWelcomeModal(notifOn, emailOn, notifDismissed, emailDismissed);
}

function _openWelcomeModal(notifOn, emailOn, notifDismissed, emailDismissed) {
  const mo = document.getElementById('modal-welcome');
  if (!mo) return;
  
  const startStep = (notifOn || notifDismissed) ? 2 : 1;
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
  if (fromStep === 1) {
    const chk = document.getElementById('wm-notif-never');
    if (chk && chk.checked) localStorage.setItem('wm_notif_never', '1');
    const emailOn = userProfile?.email_reports === 'monthly';
    const emailDismissed = localStorage.getItem('wm_email_never') === '1';
    if (emailOn || emailDismissed) closeWelcomeModal();
    else _wmGoStep(2);
  }
  else closeWelcomeModal();
}

function wmSkipStep2() {
  const chk = document.getElementById('wm-email-never');
  if (chk && chk.checked) localStorage.setItem('wm_email_never', '1');
  closeWelcomeModal();
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
    setTimeout(() => {
      const emailOn = userProfile?.email_reports === 'monthly';
      const emailDismissed = localStorage.getItem('wm_email_never') === '1';
      if (emailOn || emailDismissed) closeWelcomeModal();
      else _wmGoStep(2);
    }, 500);
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
  // Note: the support prompt is queued via a MutationObserver watching this
  // modal's class (see near checkSupportPrompt) — not from here — so it
  // fires no matter which button/flow actually closes this modal.
}

