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
    feedback: 'Feedback',
    contact: 'Contact',
  };
  const sub = document.querySelector('#page-settings .ps');
  if (sub) sub.textContent = subtitles[id] || 'Profile, data & preferences';
  
  if (id === 'study') { buildSettingsCoachingSelect(); loadStudySettings(); setTimeout(()=>initSettingsDirtyTracking(),100); }
  if (id === 'alerts') { loadAlertsSettings(); }
  
  if(window.innerWidth <= 768){
    const names={profile:'Profile',study:'Study Info',goals:'Goals',appearance:'Appearance',alerts:'Alerts',data:'Data & Backup',account:'Account',feedback:'Feedback',contact:'Contact'};
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
  renderSettingsYearOptions();
  if (document.getElementById('settings-year')) document.getElementById('settings-year').value = userProfile.target_year || String(getDefaultJeeYear());
  if (document.getElementById('settings-mode')) document.getElementById('settings-mode').value = userProfile.study_mode || 'online';
  const coaching = COACHING_LIST.find(c => c.id === userProfile.coaching);
  const sel = document.getElementById('settings-coaching');
  if (sel) sel.value = coaching ? coaching.id : 'self';
  toggleCustomCoaching();
}

function renderSettingsYearOptions() {
  const sel = document.getElementById('settings-year');
  if (!sel) return;
  const baseYear = typeof getDefaultJeeYear === 'function' ? getDefaultJeeYear() : (new Date().getFullYear()+1);
  
  
  
  const saved = userProfile?.target_year && /^\d{4}$/.test(userProfile.target_year) ? parseInt(userProfile.target_year,10) : null;
  const years = new Set([baseYear, baseYear+1, baseYear+2]);
  if (saved) years.add(saved);
  const sorted = [...years].sort((a,b)=>a-b);
  sel.innerHTML = sorted.map(y => `<option value="${y}">JEE ${y}</option>`).join('') + `<option value="other">Later</option>`;
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
          const path = `${currentUser.id}/avatar.svg`;
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
        const path = `${currentUser.id}/avatar.${ext}`;
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
    try{ await Promise.all([sb.from('tests').delete().eq('user_id',uid),sb.from('hours').delete().eq('user_id',uid),sb.from('backlogs').delete().eq('user_id',uid),sb.from('todos').delete().eq('user_id',uid),sb.from('upcoming').delete().eq('user_id',uid),sb.from('user_preferences').update({syllabus_state:null}).eq('user_id',uid),sb.from('streaks').delete().eq('user_id',uid)]); }catch(e){}
  }
  localStorage.removeItem('jt3');
  localStorage.removeItem('jt3_known_updated_at');
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
      .auth-headline { font-size: calc(1.5rem * ${ratio}) !important; }
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
    .btn, .fc, .fi, .fs, .size-btn, .fc, .fi-pro, .auth-submit-pro, .auth-google-primary, .ob-opt,
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

// Boot trigger moved to frontend/js/app/app-00-routing.js (core bundle) —
// it needs to fire immediately regardless of auth state, before this file
// (dashboard-only, lazy-loaded after auth resolves) is even fetched.
// Everything else that WAS in this DOMContentLoaded handler is
// dashboard-only DOM wiring (settings dirty-tracking, mobile nav touch
// handlers, avatar dropzone) — by the time this file loads, DOMContentLoaded
// has already fired (it only loads after an async auth check completes),
// so waiting for that event here would never fire. Run immediately instead.
function _initSettingsDomHooks() {
  setTimeout(initSettingsDirtyTracking, 600);
  if (typeof _lhRestoreTimer === 'function') _lhRestoreTimer();

  
  setTimeout(() => {
    document.querySelectorAll('.mob-nav-item').forEach(btn => {
      btn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const page = this.dataset.page;
        if (this.id === 'mob-more-btn') {
          openMobDrawer();
        } else if (page) {
          mobNavTo(page, this);
        }
      }, { passive: false });
    });
  }, 1000); 
  
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
}
_initSettingsDomHooks();

