function _initScrollReveal() {
  const root = document.getElementById('landing');
  if (!root) return;
  const els = root.querySelectorAll('.ls-reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('ls-visible');
        obs.unobserve(e.target);
      }
    });
  }, { root: root, threshold: 0.12 });
  els.forEach(function(el) { obs.observe(el); });
}

function _rollOdometer(el){
  if (!el || el.dataset.rolled === '1') return;
  el.dataset.rolled = '1';
  const target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
  const display = el.getAttribute('data-count-display') || String(target);
  const startPct = el.dataset.countStartPct !== undefined ? parseFloat(el.dataset.countStartPct) : 0.55;
  const startVal = Math.round(target * startPct); // start partway in — a quick punch, not a long grind from zero
  const DUR = el.dataset.countDuration ? parseInt(el.dataset.countDuration, 10) : 850; // short and snappy by default
  const power = el.dataset.countEasePower ? parseFloat(el.dataset.countEasePower) : 3;
  el.style.opacity = '0';
  el.style.transform = 'translateY(3px)';
  requestAnimationFrame(() => {
    el.style.transition = 'opacity .3s ease, transform .3s ease';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
  const t0 = performance.now();
  function frame(now){
    const p = Math.min(1, (now - t0) / DUR);
    const eased = 1 - Math.pow(1 - p, power); // easeOutCubic (or gentler, per element)
    const val = Math.round(startVal + (target - startVal) * eased);
    el.textContent = val.toLocaleString('en-IN');
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = display;
  }
  requestAnimationFrame(frame);
}
function _startFakeCountLoop(el){
  if (el.dataset.fakeLoop === '1') return;
  el.dataset.fakeLoop = '1';
  el.innerHTML = '';
  el.style.display = 'inline-flex';
  el.style.alignItems = 'baseline';
  el.style.fontVariantNumeric = 'tabular-nums';
  el.style.opacity = '.5'; // subtly signals "still loading", never claims a real number
  const reels = [];
  for (let i = 0; i < 4; i++){
    const reel = document.createElement('span');
    reel.style.cssText = 'display:inline-block;overflow:hidden;height:1em;width:.62em;position:relative;vertical-align:baseline;';
    const strip = document.createElement('span');
    strip.style.cssText = 'display:block;transition:transform 1.1s cubic-bezier(.45,0,.2,1);will-change:transform;';
    for (let d = 0; d <= 9; d++){
      const row = document.createElement('span');
      row.style.cssText = 'display:block;height:1em;line-height:1em;text-align:center;';
      row.textContent = String(d);
      strip.appendChild(row);
    }
    reel.appendChild(strip);
    el.appendChild(reel);
    reels.push(strip);
  }
  let tick = 0;
  const step = () => {
    tick++;
    reels.forEach((strip, idx) => {
      strip.style.transitionDelay = (idx * 70) + 'ms';
      strip.style.transform = `translateY(-${((tick + idx * 3) % 10) * 10}%)`;
    });
  };
  step();
  el._fakeLoopTimer = setInterval(step, 1300); // gentle endless drift — a safety net, never a fabricated real number
}
function _resolveFakeLoop(el){
  if (el._fakeLoopTimer) { clearInterval(el._fakeLoopTimer); el._fakeLoopTimer = null; }
  el.dataset.fakeLoop = '';
  el.dataset.rolled = '';
  el.style.opacity = '1';
  _buildPremiumOdometer(el);
}
function _buildPremiumOdometer(el){
  if (!el || el.dataset.rolled === '1' || el.dataset.fakeLoop === '1') return;
  const rawTarget = el.getAttribute('data-count-to');
  if (rawTarget === null || rawTarget === '') { _startFakeCountLoop(el); return; }
  el.dataset.rolled = '1';
  const display = el.getAttribute('data-count-display') || (el.getAttribute('data-count-to') || '0');
  const chars = display.split('');
  el.innerHTML = '';
  el.style.display = 'inline-flex';
  el.style.alignItems = 'baseline';
  el.style.fontVariantNumeric = 'tabular-nums';
  const REEL_DUR = 1800; // slower, deliberate — a real spin-down, not a quick tick
  const reels = [];
  chars.forEach((ch) => {
    if (/[0-9]/.test(ch)) {
      const reel = document.createElement('span');
      reel.style.cssText = 'display:inline-block;overflow:hidden;height:1em;width:.62em;position:relative;vertical-align:baseline;';
      const strip = document.createElement('span');
      strip.style.cssText = `display:block;transform:translateY(-900%);transition:transform ${REEL_DUR}ms cubic-bezier(.16,1,.3,1);will-change:transform;`;
      for (let d = 0; d <= 9; d++){
        const row = document.createElement('span');
        row.style.cssText = 'display:block;height:1em;line-height:1em;text-align:center;';
        row.textContent = String(d);
        strip.appendChild(row);
      }
      reel.appendChild(strip);
      el.appendChild(reel);
      reels.push({ strip, digit: parseInt(ch, 10) });
    } else {
      const span = document.createElement('span');
      span.textContent = ch;
      span.style.cssText = 'opacity:0;transition:opacity .5s ease .9s;';
      el.appendChild(span);
      requestAnimationFrame(() => requestAnimationFrame(() => { span.style.opacity = '1'; }));
    }
  });
  requestAnimationFrame(() => {
    reels.forEach((r, idx) => {
      r.strip.style.transitionDelay = (idx * 110) + 'ms';
      requestAnimationFrame(() => { r.strip.style.transform = `translateY(-${r.digit * 10}%)`; });
    });
  });
  const totalTime = REEL_DUR + reels.length * 110 + 100;
  setTimeout(() => {
    el.style.transition = 'filter .7s ease';
    el.style.filter = 'drop-shadow(0 0 9px rgba(162,155,254,.6))';
    setTimeout(() => { el.style.filter = 'none'; }, 800);
  }, totalTime);
}
function _initCountUp(scopeEl){
  const root = document.getElementById('landing');
  const container = scopeEl || root;
  if (!container) return;
  const els = container.querySelectorAll('.odo-num[data-count-to], .premium-odo');
  if (!els.length) return;
  const roll = (el) => el.classList.contains('premium-odo') ? _buildPremiumOdometer(el) : _rollOdometer(el);
  if (!('IntersectionObserver' in window)) { els.forEach(roll); return; }
  const obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) { roll(e.target); obs.unobserve(e.target); }
    });
  }, { root: root, threshold: 0.4 });
  els.forEach(function(el){ obs.observe(el); });
}

function landScrollTo(id) {
  const el = document.getElementById(id);
  const container = document.getElementById('landing');
  if (!el || !container) return;
  const offset = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 64;
  container.scrollTo({ top: offset, behavior: 'smooth' });
}

function _initLandFabScroll() {
  const fab = document.getElementById('mob-land-cta');
  if (!fab) return;
  if (fab.dataset.fabScrollInited === '1') return; 
  fab.dataset.fabScrollInited = '1';

  let lastScroll = 0;
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      const isMobile = window.innerWidth <= 768;
      const curr = isMobile ? window.scrollY : document.getElementById('landing').scrollTop;
      if (curr > lastScroll + 10 && curr > 80) {
        fab.style.transform = 'translateY(160%)';
        fab.style.opacity = '0';
      } else if (curr < lastScroll - 10) {
        fab.style.transform = 'translateY(0)';
        fab.style.opacity = '1';
      }
      lastScroll = curr;
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  const landingEl = document.getElementById('landing');
  if (landingEl) landingEl.addEventListener('scroll', onScroll, { passive: true });
}

function landingOpenAuth(mode) {
  const scrim = document.getElementById('auth-modal-scrim');
  if (!scrim) return;
  const wasOpen = scrim.classList.contains('open');
  scrim.classList.add('open');
  document.body.style.overflow = 'hidden';
  _renderTurnstileWidgets();
  if (wasOpen) {
    switchAuthTab(mode);
  } else {
    setAuthModeInstant(mode);
  }
}



function setAuthModeInstant(mode) {
  authTab = mode;
  const login = document.getElementById('auth-slide-login');
  const signup = document.getElementById('auth-slide-signup');
  if (!login || !signup) return;
  login.classList.remove('active', 'slide-out-left', 'slide-out-right', 'slide-in-right', 'slide-in-left');
  signup.classList.remove('active', 'slide-out-left', 'slide-out-right', 'slide-in-right', 'slide-in-left');
  (mode === 'signup' ? signup : login).classList.add('active');
  const viewport = document.getElementById('auth-slide-viewport');
  if (viewport) viewport.style.height = '';
  hideAuthMsg();
}

function closeAuthModal() {
  const scrim = document.getElementById('auth-modal-scrim');
  if (scrim) scrim.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const scrim = document.getElementById('auth-modal-scrim');
    if (scrim && scrim.classList.contains('open')) closeAuthModal();
  }
});


function mobileLandingShowAuth() { landingOpenAuth('signup'); }
function landingCloseAuth() { closeAuthModal(); }
function closeMobAuthOverlay() { closeAuthModal(); }

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

