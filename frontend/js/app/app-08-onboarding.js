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

let obData = { name: '', class_year: '', mode: '', coaching: '', year: '', source: '', avatarDataUrl: '' };

function showOnboarding() {
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('onboarding').classList.add('show');
  
  history.replaceState({page:'onboarding'}, '', '/onboarding');
  document.title = 'JEETrack — Setup Profile';
  
  renderObYearOptions();
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

function renderObYearOptions() {
  const baseYear = typeof getDefaultJeeYear === 'function' ? getDefaultJeeYear() : (new Date().getFullYear()+1);

  
  
  const c12 = document.getElementById('ob-class12-yr');
  const c11 = document.getElementById('ob-class11-yr');
  if (c12) c12.textContent = 'JEE ' + baseYear;
  if (c11) c11.textContent = 'JEE ' + (baseYear+1);

  const grid = document.getElementById('ob-year-grid');
  if (!grid) return;
  const opts = [
    { year: baseYear,   label: 'This year',  icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', color: '#fbbf24' },
    { year: baseYear+1, label: 'Next year',  icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', color: '#a29bfe' },
    { year: baseYear+2, label: 'Two years',  icon: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>', color: '#34d399' },
  ];
  let html = opts.map(o => `
    <div class="ob-opt" onclick="obSelect(this,'ob-year')" data-val="${o.year}">
      <div class="ob-opt-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${o.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${o.icon}</svg></div>
      <div class="ob-opt-label">JEE ${o.year}</div>
      <div class="ob-opt-sub">${o.label}</div>
    </div>`).join('');
  html += `
    <div class="ob-opt" onclick="obSelect(this,'ob-year')" data-val="other">
      <div class="ob-opt-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7a7990" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <div class="ob-opt-label">Later</div>
      <div class="ob-opt-sub">Just exploring</div>
    </div>`;
  grid.innerHTML = html;
}

function obSelect(el, group) {
  document.querySelectorAll(`[onclick*="${group}"]`).forEach(e => e.classList.remove('sel'));
  el.classList.add('sel');
  const val = el.dataset.val;
  if (group === 'ob-class') { obData.class_year = val; _obClearHint(1); }
  else if (group === 'ob-mode') { obData.mode = val; _obClearHint(2); }
  else if (group === 'ob-year') { obData.year = val; _obClearHint(3); }
  else if (group === 'ob-source') { obData.source = val; _obClearHint(4); }
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
  
  
  const pcts = [0, 25, 50, 75, 100];
  const fill = document.getElementById('ob-progress-fill');
  if (fill) fill.style.width = pcts[nextStep] + '%';
  
  for (let i = 0; i < 5; i++) {
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
  
  const pcts = [0, 25, 50, 75, 100];
  const fill = document.getElementById('ob-progress-fill');
  if (fill) fill.style.width = pcts[prevStep] + '%';
  
  for (let i = 0; i < 5; i++) {
    const lbl = document.getElementById(`ob-lbl-${i}`);
    if (!lbl) continue;
    lbl.classList.remove('done','current');
    if (i < prevStep) lbl.classList.add('done');
    else if (i === prevStep) lbl.classList.add('current');
  }
}

async function finishOnboarding() {
  const btn = document.getElementById('ob-finish-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
  const fields = {
    username: obData.name.trim(),
    class_year: obData.class_year || 'other',
    study_mode: obData.mode || 'self',
    coaching: obData.coaching || 'self',
    target_year: obData.year || String(getDefaultJeeYear()),
    referral_source: obData.source || null,
    onboarding_done: true,
  };
  
  localStorage.setItem('jt_target_year', fields.target_year);
  
  if (obData.avatarDataUrl && sb && currentUser) {
    try {
      const res = await fetch(obData.avatarDataUrl);
      const blob = await res.blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      const path = `${currentUser.id}/avatar.${ext}`;
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

