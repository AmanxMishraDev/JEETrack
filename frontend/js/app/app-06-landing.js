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

let _heroDemoTimer = null;


const LAND_MT_DATA = {
  all: {
    tests: '7', latest: '65.3%', best: '65.3%', avg: '56.2%',
    bars: [34, 48, 42, 64, 58, 80, 92],
    subj: { phy: 82, chem: 76, math: 71 }
  },
  partial: {
    tests: '4', latest: '70.0%', best: '74.5%', avg: '62.8%',
    bars: [45, 58, 66, 74],
    subj: { phy: 85, chem: 79, math: 74 }
  },
  full: {
    tests: '3', latest: '61.1%', best: '65.3%', avg: '58.7%',
    bars: [52, 64, 80],
    subj: { phy: 78, chem: 73, math: 69 }
  }
};

function initHeroDemo() {
  const card = document.getElementById('landDemoCard');
  if (!card) return;
  const viewport = document.getElementById('landDemoViewport');
  const tabs = Array.from(card.querySelectorAll('.land-dash-tab'));
  const views = Array.from(viewport.querySelectorAll('.land-dash-view'));
  const cursor = document.getElementById('landDemoCursor');
  const zoomStage = document.getElementById('landZoomStage');
  const mtFilters = document.getElementById('landMtFilters');
  const mtGlide = document.getElementById('landMtGlide');
  const mtBody = document.getElementById('landMtBody');
  const insEmpty = document.getElementById('landInsEmpty');
  const insLoading = document.getElementById('landInsLoading');
  const insResults = document.getElementById('landInsResults');
  const insGenBtn = document.getElementById('landInsGenBtn');
  const insRefreshBtn = document.getElementById('landInsRefreshBtn');
  const insLoadingMsg = document.getElementById('landInsLoadingMsg');
  const insProgFill = document.getElementById('landInsProgFill');
  const order = ['dashboard', 'tests', 'insights'];
  const activeTab = tabs.find(t => t.classList.contains('active'));
  let idx = order.indexOf(activeTab ? activeTab.dataset.view : 'dashboard');
  if (idx < 0) idx = 0;
  let _currentFilter = 'all';
  let _insLoadTimer = null;

  
  
  
  
  
  
  
  
  const REDUCE_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TILT_REST = { rx: 2, ry: -8, tz: 0 };
  const tiltState = { cur: { rx: 2, ry: -8, tz: 0 }, target: { rx: 2, ry: -8 } };
  let tiltGlare = null;

  function setupHeroTilt() {
    if (REDUCE_MOTION) return;
    const visual = card.closest('.land-hero-visual') || card;

    tiltGlare = document.createElement('div');
    tiltGlare.className = 'land-card-glare';
    card.appendChild(tiltGlare);

    visual.addEventListener('mouseenter', () => { if (tiltGlare) tiltGlare.classList.add('active'); });
    visual.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      if (!r.width || !r.height) return;
      setTiltFromPoint(e.clientX - r.left, e.clientY - r.top);
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      if (tiltGlare) {
        tiltGlare.style.setProperty('--glare-x', (px * 100) + '%');
        tiltGlare.style.setProperty('--glare-y', (py * 100) + '%');
      }
    });
    visual.addEventListener('mouseleave', () => {
      resetTilt();
      if (tiltGlare) tiltGlare.classList.remove('active');
    });

    (function tick() {
      const s = tiltState.cur, t = tiltState.target;
      s.rx += (t.rx - s.rx) * 0.16;
      s.ry += (t.ry - s.ry) * 0.16;
      s.tz += (0 - s.tz) * 0.16;
      card.style.transform = `perspective(1400px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg) translateZ(${s.tz.toFixed(2)}px)`;
      requestAnimationFrame(tick);
    })();
  }

  
  
  function setTiltFromPoint(x, y) {
    if (REDUCE_MOTION) return;
    const r = card.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = Math.min(1, Math.max(0, x / r.width));
    const py = Math.min(1, Math.max(0, y / r.height));
    const nx = px * 2 - 1, ny = py * 2 - 1;
    tiltState.target.ry = TILT_REST.ry + nx * 9;
    tiltState.target.rx = TILT_REST.rx - ny * 6;
  }

  function resetTilt() {
    if (REDUCE_MOTION) return;
    tiltState.target.rx = TILT_REST.rx;
    tiltState.target.ry = TILT_REST.ry;
  }

  function kickTilt(drx, dry, dtz) {
    if (REDUCE_MOTION) return;
    tiltState.cur.rx += drx || 0;
    tiltState.cur.ry += dry || 0;
    tiltState.cur.tz += dtz || 0;
  }

  setupHeroTilt();


  
  
  
  
  
  const CURSOR_MS = 780;
  const CURSOR_SLOW_MS = 1180;
  const CINEMATIC_ZOOM_SCALE = 1.55;
  const CINEMATIC_HOLD_MS = 170;
  const CINEMATIC_OUT_MS = 780;

  function moveCursorTo(el, onArrive, opts) {
    opts = opts || {};
    if (!el) { if (onArrive) onArrive(); return; }
    const cardRect = card.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const x = elRect.left - cardRect.left + elRect.width / 2 - 10;
    const y = elRect.top - cardRect.top + elRect.height / 2 - 6;
    const slow = !!opts.slow;
    const travelMs = slow ? CURSOR_SLOW_MS : CURSOR_MS;

    setTiltFromPoint(x + 3, y + 3);

    cursor.style.opacity = '1';
    
    
    cursor.style.transition = slow
      ? `transform ${CURSOR_SLOW_MS}ms cubic-bezier(.45,0,.15,1), opacity .3s ease`
      : '';
    cursor.classList.add('traveling');
    cursor.style.transform = `translate(${x}px,${y}px)`;

    if (opts.cinematic) {
      
      
      zoomCinematicIn(x + 3, y + 3, travelMs);
    }

    setTimeout(() => {
      cursor.classList.remove('traveling');
      cursor.classList.add('clicking');
      spawnClickBurst();
      if (!opts.cinematic) punchZoomAt(x + 3, y + 3);
      setTimeout(() => cursor.classList.remove('clicking'), 460);
      cursor.style.transition = '';
      if (onArrive) onArrive();
    }, travelMs);
  }

  
  
  function zoomCinematicIn(x, y, durationMs) {
    if (!zoomStage) return;
    setTiltFromPoint(x, y);
    kickTilt(0, 0, 22);
    
    
    zoomStage.classList.remove('zoom-punch');
    void zoomStage.offsetWidth;
    const w = card.clientWidth || 1;
    const h = card.clientHeight || 1;
    const ox = Math.min(100, Math.max(0, (x / w) * 100));
    const oy = Math.min(100, Math.max(0, (y / h) * 100));
    zoomStage.style.transformOrigin = `${ox}% ${oy}%`;
    zoomStage.style.transition = `transform ${durationMs}ms cubic-bezier(.45,0,.15,1)`;
    zoomStage.style.transform = `scale(${CINEMATIC_ZOOM_SCALE})`;
  }

  
  
  
  function zoomCinematicOut() {
    if (!zoomStage) return;
    resetTilt();
    kickTilt(0, 0, -8);
    zoomStage.style.transition = `transform ${CINEMATIC_OUT_MS}ms cubic-bezier(.16,1,.3,1)`;
    zoomStage.style.transform = 'scale(1)';
    setTimeout(() => {
      zoomStage.style.transition = '';
      zoomStage.style.transform = '';
    }, CINEMATIC_OUT_MS + 40);
  }

  
  
  function punchZoomAt(x, y) {
    if (!zoomStage) return;
    setTiltFromPoint(x, y);
    kickTilt(0, 0, 14);
    const w = card.clientWidth || 1;
    const h = card.clientHeight || 1;
    const ox = Math.min(100, Math.max(0, (x / w) * 100));
    const oy = Math.min(100, Math.max(0, (y / h) * 100));
    zoomStage.style.transformOrigin = `${ox}% ${oy}%`;
    zoomStage.classList.remove('zoom-punch');
    void zoomStage.offsetWidth; 
    zoomStage.classList.add('zoom-punch');

    const flash = document.createElement('div');
    flash.className = 'land-zoom-flash';
    flash.style.left = x + 'px';
    flash.style.top = y + 'px';
    zoomStage.appendChild(flash);
    requestAnimationFrame(() => flash.classList.add('flash-go'));
    setTimeout(() => flash.remove(), 600);
  }

  
  
  
  
  
  
  function spawnClickBurst() {
    const dot = document.createElement('div');
    dot.className = 'land-dash-click-ring pulse-dot';
    cursor.appendChild(dot);

    const ring1 = document.createElement('div');
    ring1.className = 'land-dash-click-ring pulse';
    cursor.appendChild(ring1);

    const ring2 = document.createElement('div');
    ring2.className = 'land-dash-click-ring pulse-2';
    cursor.appendChild(ring2);

    setTimeout(() => { dot.remove(); ring1.remove(); ring2.remove(); }, 780);
  }

  function activateView(name) {
    tabs.forEach(t => {
      const on = t.dataset.view === name;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    views.forEach(v => v.classList.toggle('active', v.dataset.view === name));
    if (name === 'tests') {
      setFilter('all', false);
    } else if (name === 'insights') {
      resetInsightsDemo();
    }
  }

  
  
  const INS_LOAD_STEPS = 4;
  function resetInsightsDemo() {
    if (!insEmpty) return;
    clearInterval(_insLoadTimer);
    insEmpty.style.display = 'flex';
    insLoading.style.display = 'none';
    insResults.style.display = 'none';
    for (let s = 1; s <= INS_LOAD_STEPS; s++) {
      const el = insLoading.querySelector(`.ai-loading-step[data-step="${s}"]`);
      if (el) el.classList.remove('active', 'done');
    }
    const first = insLoading.querySelector('.ai-loading-step[data-step="1"]');
    if (first) first.classList.add('active');
    if (insProgFill) insProgFill.style.width = '0%';
    if (insGenBtn) insGenBtn.disabled = false;
    insEmpty.classList.remove('land-ins-in');
    void insEmpty.offsetWidth;
    insEmpty.classList.add('land-ins-in');
  }

  
  
  
  const INS_LOAD_MSGS = ['Reading your test scores...', 'Scanning study hours...', 'Checking syllabus gaps...', 'Generating insights...'];
  function playInsightsLoading(onDone) {
    insEmpty.style.display = 'none';
    insLoading.style.display = 'flex';
    insResults.style.display = 'none';
    insLoading.classList.remove('land-ins-in');
    void insLoading.offsetWidth;
    insLoading.classList.add('land-ins-in');

    let mi = 0;
    clearInterval(_insLoadTimer);
    const tick = () => {
      if (insLoadingMsg) insLoadingMsg.textContent = INS_LOAD_MSGS[Math.min(mi, INS_LOAD_MSGS.length - 1)];
      if (insProgFill) insProgFill.style.width = Math.min(100, (mi + 1) * 25) + '%';
      for (let s = 1; s <= INS_LOAD_STEPS; s++) {
        const el = insLoading.querySelector(`.ai-loading-step[data-step="${s}"]`);
        if (!el) continue;
        if (mi === s - 1) { el.classList.add('active'); el.classList.remove('done'); }
        else if (mi > s - 1) { el.classList.remove('active'); el.classList.add('done'); }
      }
      mi++;
      if (mi <= INS_LOAD_STEPS) kickTilt((Math.random() * 1.6 - 0.8), (Math.random() * 2.4 - 1.2), 5);
      if (mi > INS_LOAD_STEPS) {
        clearInterval(_insLoadTimer);
        onDone && onDone();
      }
    };
    tick();
    _insLoadTimer = setInterval(tick, 480);
  }

  function showInsightsResults() {
    insLoading.style.display = 'none';
    insResults.style.display = 'flex';
    insResults.classList.remove('land-ins-in');
    void insResults.offsetWidth;
    insResults.classList.add('land-ins-in');
    kickTilt(-3, 4.5, 20);
  }

  
  
  
  
  function runInsightsGenerateDemo() {
    if (!insGenBtn) return;
    moveCursorTo(insGenBtn, () => {
      insGenBtn.disabled = true;
      setTimeout(() => {
        playInsightsLoading(() => {
          showInsightsResults();
          _heroDemoTimer = setTimeout(loop, 3400);
        });
        zoomCinematicOut();
      }, CINEMATIC_HOLD_MS);
    }, { slow: true, cinematic: true });
  }

  
  
  function goToInsightsAndGenerate() {
    const insightsTab = tabs.find(t => t.dataset.view === 'insights');
    idx = order.indexOf('insights');
    moveCursorTo(insightsTab, () => {
      activateView('insights');
      setTimeout(runInsightsGenerateDemo, 900);
    });
  }

  function positionGlide(btn) {
    if (!mtGlide || !mtFilters || !btn) return;
    
    
    
    
    
    
    mtGlide.style.width = btn.offsetWidth + 'px';
    mtGlide.style.transform = `translateX(${btn.offsetLeft - mtGlide.offsetLeft}px)`;
  }

  
  
  function setFilter(filter, animate, opts) {
    opts = opts || {};
    const btn = viewport.querySelector(`.land-mt-filter[data-filter="${filter}"]`);
    viewport.querySelectorAll('.land-mt-filter').forEach(f => f.classList.toggle('active', f === btn));
    positionGlide(btn);
    _currentFilter = filter;
    const data = LAND_MT_DATA[filter] || LAND_MT_DATA.all;

    const applyData = () => {
      const numTests = document.getElementById('landMtNumTests');
      const numLatest = document.getElementById('landMtNumLatest');
      const numBest = document.getElementById('landMtNumBest');
      const numAvg = document.getElementById('landMtNumAvg');
      [numTests, numLatest, numBest, numAvg].forEach(el => el && el.classList.remove('land-mt-pop'));
      if (numTests) numTests.textContent = data.tests;
      if (numLatest) numLatest.textContent = data.latest;
      if (numBest) numBest.textContent = data.best;
      if (numAvg) numAvg.textContent = data.avg;

      const chart = document.getElementById('landMtChart');
      if (chart) {
        chart.innerHTML = data.bars.map((h, i) => {
          const hi = i >= data.bars.length - 2 ? ' land-dash-bar-hi' : '';
          return `<div class="land-dash-bar${hi}" style="--h:${h}%"></div>`;
        }).join('');
      }

      const phy = document.getElementById('landMtSubjPhy');
      const chem = document.getElementById('landMtSubjChem');
      const math = document.getElementById('landMtSubjMath');
      if (phy) phy.textContent = data.subj.phy + '%';
      if (chem) chem.textContent = data.subj.chem + '%';
      if (math) math.textContent = data.subj.math + '%';

      requestAnimationFrame(() => {
        [numTests, numLatest, numBest, numAvg].forEach(el => el && el.classList.add('land-mt-pop'));
      });
    };

    if (!animate || !mtBody) { applyData(); return; }

    if (opts.syncZoomOut) {
      
      
      
      mtBody.classList.add('land-mt-zoom-sync');
      setTimeout(() => {
        applyData();
        zoomCinematicOut();
        requestAnimationFrame(() => mtBody.classList.remove('land-mt-zoom-sync'));
      }, CINEMATIC_HOLD_MS);
      return;
    }

    mtBody.classList.add('land-mt-zoom');
    setTimeout(() => {
      applyData();
      requestAnimationFrame(() => mtBody.classList.remove('land-mt-zoom'));
    }, 340);
  }

  function toggleFilterDemo() {
    const partial = viewport.querySelector('.land-mt-filter[data-filter="partial"]');
    
    
    
    moveCursorTo(partial, () => {
      setFilter('partial', true, { syncZoomOut: true });
      setTimeout(goToInsightsAndGenerate, 1700);
    }, { slow: true, cinematic: true });
  }

  function loop() {
    const landingEl = document.getElementById('landing');
    if (document.hidden || (landingEl && landingEl.classList.contains('hidden'))) {
      _heroDemoTimer = setTimeout(loop, 800);
      return;
    }
    idx = (idx + 1) % order.length;
    const name = order[idx];
    const tabEl = tabs.find(t => t.dataset.view === name);
    moveCursorTo(tabEl, () => {
      activateView(name);
      if (name === 'tests') {
        setTimeout(toggleFilterDemo, 1100);
        
        
        
        
      } else {
        _heroDemoTimer = setTimeout(loop, 2600);
      }
    });
  }

  if (!card._demoBound) {
    card._demoBound = true;
    tabs.forEach(t => {
      t.addEventListener('click', () => {
        clearTimeout(_heroDemoTimer);
        const name = t.dataset.view;
        idx = order.indexOf(name);
        const cardRect = card.getBoundingClientRect();
        const btnRect = t.getBoundingClientRect();
        const x = btnRect.left - cardRect.left + btnRect.width / 2 - 10;
        const y = btnRect.top - cardRect.top + btnRect.height / 2 - 6;
        cursor.style.transition = '';
        cursor.style.opacity = '1';
        cursor.classList.remove('traveling');
        cursor.style.transform = `translate(${x}px,${y}px)`;
        cursor.classList.add('clicking');
        spawnClickBurst();
        punchZoomAt(x + 3, y + 3);
        setTimeout(() => cursor.classList.remove('clicking'), 460);
        activateView(name);
        if (name === 'tests') {
          setTimeout(toggleFilterDemo, 900);
          
          
          
        } else {
          const resumeDelay = name === 'insights' ? 3000 : 2200;
          _heroDemoTimer = setTimeout(loop, resumeDelay);
        }
      });
    });
    viewport.querySelectorAll('.land-mt-filter').forEach(f => {
      f.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(_heroDemoTimer);
        const cardRect = card.getBoundingClientRect();
        const btnRect = f.getBoundingClientRect();
        const x = btnRect.left - cardRect.left + btnRect.width / 2 - 10;
        const y = btnRect.top - cardRect.top + btnRect.height / 2 - 6;
        cursor.style.transition = '';
        cursor.style.opacity = '1';
        cursor.style.transform = `translate(${x}px,${y}px)`;
        cursor.classList.add('clicking');
        spawnClickBurst();
        punchZoomAt(x + 3, y + 3);
        setTimeout(() => cursor.classList.remove('clicking'), 460);
        setFilter(f.dataset.filter, true);
        _heroDemoTimer = setTimeout(loop, 4600);
      });
    });
    if (insGenBtn) {
      insGenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(_heroDemoTimer);
        clearInterval(_insLoadTimer);
        insGenBtn.disabled = true;
        const cardRect = card.getBoundingClientRect();
        const btnRect = insGenBtn.getBoundingClientRect();
        const x = btnRect.left - cardRect.left + btnRect.width / 2 - 10;
        const y = btnRect.top - cardRect.top + btnRect.height / 2 - 6;
        cursor.style.transition = '';
        cursor.style.opacity = '1';
        cursor.style.transform = `translate(${x}px,${y}px)`;
        cursor.classList.add('clicking');
        spawnClickBurst();
        punchZoomAt(x + 3, y + 3);
        setTimeout(() => cursor.classList.remove('clicking'), 460);
        playInsightsLoading(() => {
          showInsightsResults();
          _heroDemoTimer = setTimeout(loop, 3400);
        });
      });
    }
    if (insRefreshBtn) {
      insRefreshBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(_heroDemoTimer);
        clearInterval(_insLoadTimer);
        const cardRect = card.getBoundingClientRect();
        const btnRect = insRefreshBtn.getBoundingClientRect();
        const x = btnRect.left - cardRect.left + btnRect.width / 2 - 10;
        const y = btnRect.top - cardRect.top + btnRect.height / 2 - 6;
        cursor.style.transition = '';
        cursor.style.opacity = '1';
        cursor.style.transform = `translate(${x}px,${y}px)`;
        cursor.classList.add('clicking');
        spawnClickBurst();
        punchZoomAt(x + 3, y + 3);
        setTimeout(() => cursor.classList.remove('clicking'), 460);
        playInsightsLoading(() => {
          showInsightsResults();
          _heroDemoTimer = setTimeout(loop, 3400);
        });
      });
    }
    window.addEventListener('resize', () => {
      const activeBtn = viewport.querySelector('.land-mt-filter.active');
      if (activeBtn) positionGlide(activeBtn);
    });
  }

  
  requestAnimationFrame(() => {
    const activeBtn = viewport.querySelector('.land-mt-filter.active') || viewport.querySelector('.land-mt-filter[data-filter="all"]');
    positionGlide(activeBtn);
  });

  clearTimeout(_heroDemoTimer);
  _heroDemoTimer = setTimeout(loop, 3000);
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

// -- Admin-editable public stats (landing page counters + app version) --
// Falls back silently to whatever is already hardcoded in the HTML if the
// app_config table/row doesn't exist yet or the fetch fails for any reason.
let _siteConfigCache = null;
let _siteConfigPromise = null;
function _fmtStatK(n){
  n = Math.max(0, Math.round(Number(n) || 0));
  if (n >= 1000) {
    const k = n / 1000;
    const kStr = Number.isInteger(k) ? String(k) : (Math.round(k * 10) / 10).toString();
    return kStr + 'K+';
  }
  return n.toLocaleString('en-IN') + '+';
}
function _fmtStatPlain(n){
  n = Math.max(0, Math.round(Number(n) || 0));
  return n.toLocaleString('en-IN') + '+';
}
function loadPublicSiteConfig(){
  if (_siteConfigPromise) return _siteConfigPromise;
  _siteConfigPromise = (async () => {
    if (!sb) return null;
    try {
      const { data, error } = await sb.from('app_config').select('*').eq('id', 1).maybeSingle();
      if (error || !data) return null;
      _siteConfigCache = data;

      const applyHero = (elId, key, fmt) => {
        const el = document.getElementById(elId);
        const val = data[key];
        if (!el || val === null || val === undefined) return;
        const newTarget = String(Math.max(0, Math.round(val)));
        const targetChanged = el.getAttribute('data-count-to') !== newTarget;
        el.setAttribute('data-count-to', newTarget);
        el.setAttribute('data-count-display', fmt(val));
        if (el.dataset.fakeLoop === '1') { _resolveFakeLoop(el); return; }
        // If this counter already animated (e.g. the 1200ms race in
        // showAuthScreen() timed out before this fetch resolved), it would
        // have rolled to whatever fallback value was hardcoded in the HTML.
        // dataset.rolled='1' normally blocks re-animating, which meant real
        // data landing late got silently dropped and the counter stayed
        // stuck on the stale number for the rest of the visit. Reset the
        // guard so it can correct itself once the true value comes in.
        if (targetChanged && el.dataset.rolled === '1') {
          el.dataset.rolled = '';
          if (el.classList.contains('premium-odo')) _buildPremiumOdometer(el);
          else _rollOdometer(el);
        }
      };
      applyHero('hus-students', 'students_count', _fmtStatPlain);
      applyHero('hus-mock-tests', 'mock_tests_count', _fmtStatK);
      applyHero('hus-study-hours', 'study_hours_count', _fmtStatK);
      applyHero('hus-backlogs', 'backlogs_count', _fmtStatK);
      applyHero('hus-questions-practiced', 'questions_practiced_count', _fmtStatK);

      if (data.app_version) {
        const vEl = document.getElementById('settings-app-version');
        if (vEl) vEl.textContent = data.app_version;
      }
      return data;
    } catch (e) {
      return null;
    }
  })();
  return _siteConfigPromise;
}

/* -- Landing page: pull real, curated testimonials from the feedback system -- */
function _escTesti(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
// Headline trust numbers shown on the landing page. Update these as your real numbers grow —
// intentionally decoupled from the small sample of cards actually rendered below.
const TESTI_TRUST_RATING = '4.8';
function _testiCardHTML(t,i){
  const rating = Math.max(1, Math.min(5, t.rating||5));
  const stars = '★'.repeat(rating) + '☆'.repeat(5-rating);
  const name = _escTesti((t.display_name||'').trim() || 'JEETrack User');
  const initial = name.charAt(0).toUpperCase() || 'J';
  const colors=['linear-gradient(135deg,#7c6af7,#a695ff)','linear-gradient(135deg,#34d399,#2dd4bf)','linear-gradient(135deg,#f472b6,#fb7185)','linear-gradient(135deg,#fbbf24,#f97316)','linear-gradient(135deg,#60a5fa,#3b82f6)'];
  const bg = colors[i % colors.length];
  return `<div class="ls-testi-card">
    <span class="ls-testi-quotemark">&rdquo;</span>
    <div class="ls-testi-stars">${stars}</div>
    <div class="ls-testi-quote">"${_escTesti(t.message)}"</div>
    <div class="ls-testi-foot">
      <div class="ls-testi-avatar" style="background:${bg}">${initial}</div>
      <div>
        <div class="ls-testi-name-row">
          <span class="ls-testi-name">${name}</span>
        </div>
        <div class="ls-testi-tag"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8.5 12.5 11 15 16 9.5"/></svg>Verified JEETrack User</div>
      </div>
    </div>
  </div>`;
}
async function loadLandingTestimonials(){
  const section = document.getElementById('testimonials-section');
  const track = document.getElementById('ls-testi-track');
  if(!section || !track || !sb) return;
  try{
    const { data, error } = await sb.from('public_testimonials').select('*').order('created_at',{ascending:false}).limit(24);
    if(error || !data || !data.length) return;

    
    const MIN_CARDS = 10;
    let cards = data.map((t,i)=>_testiCardHTML(t,i));
    let i = 0;
    while(cards.length < MIN_CARDS){ cards.push(_testiCardHTML(data[i % data.length], cards.length)); i++; }

    
    track.innerHTML = cards.concat(cards).join('');

    
    requestAnimationFrame(() => {
      const halfWidth = track.scrollWidth / 2;
      const PX_PER_SEC = 38; // comfortable reading pace
      const dur = Math.max(24, Math.round(halfWidth / PX_PER_SEC));
      track.style.animationDuration = dur + 's';
    });

    const trustRow = document.getElementById('ls-testi-trustrow');
    if(trustRow){
      const cfg = _siteConfigCache || await loadPublicSiteConfig().catch(()=>null) || {};
      const reviewsCount = (cfg.reviews_count !== null && cfg.reviews_count !== undefined) ? cfg.reviews_count : 1000;
      const avgRating = (cfg.avg_rating !== null && cfg.avg_rating !== undefined) ? cfg.avg_rating : TESTI_TRUST_RATING;
      trustRow.innerHTML = `<span class="ls-testi-trust-rating"><span class="ls-testi-trust-stars">★★★★★</span><span class="ls-testi-trust-ratingnum">${avgRating}/5</span></span><span class="ls-testi-trust-div"></span><span class="ls-testi-trust-text">Based on <span class="odo-num" data-count-to="${Math.round(reviewsCount)}" data-count-display="${_fmtStatPlain(reviewsCount)}">0</span> JEETrack verified reviews</span>`;
      if(typeof _initCountUp === 'function') _initCountUp(trustRow);
    }
    section.style.display = '';
  }catch(e){ 
  }
}


