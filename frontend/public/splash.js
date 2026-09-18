(function(){
  window.__splashStart = Date.now(); // used by hideSplash()'s minimum-visible guard

  const TRACE_DELAY    = 150;   // ms — when the outline starts drawing
  const TRACE_DURATION = 450;   // ms — how long the draw takes
  const SOLIDIFY_AT     = TRACE_DELAY + TRACE_DURATION; // ~600ms — draw completes, pop happens here

  // Real completion time of the full hero sequence (logo solidify + wordmark
  // + tagline settling). hideSplash() in app.js waits at least this long so
  // fast loads never cut the animation off mid-way — but no longer than
  // needed, so fast loads still feel fast.
  window.__SPLASH_MIN_VISIBLE = SOLIDIFY_AT + 700; // ~1300ms

  const trace  = document.getElementById('sp-ttrace');
  const chase  = document.getElementById('sp-tchase');
  const svgMark = document.getElementById('sp-svg-mark');
  const camera  = document.getElementById('sp-camera');
  const shock   = document.getElementById('sp-shock');
  const sweepAnim    = document.getElementById('sp-sweep-anim');
  const sweepOpacity = document.getElementById('sp-sweep-opacity');

  const len = trace.getTotalLength();

  // draw the outline
  trace.style.strokeDasharray = len;
  trace.style.strokeDashoffset = len;
  trace.animate(
    [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
    { duration: TRACE_DURATION, delay: TRACE_DELAY, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }
  );

  const pen = document.getElementById('sp-pen');

  // glowing pen tip — travels the arrow's own geometry, bottom to tip.
  // The arrow is the second portion of the outline's path data (the T-stem
  // draws first), so the pen shouldn't start moving until the visible
  // outline stroke actually reaches that point — not at TRACE_DELAY itself.
  const arrowOnly = document.getElementById('sp-arrow-only');
  const aLen = arrowOnly.getTotalLength();
  const stemLen = len - aLen;              // length of the T-stem portion drawn first
  const arrowStartFraction = stemLen / len; // how far into the draw the arrow begins

  const PEN_DELAY    = TRACE_DELAY + arrowStartFraction * TRACE_DURATION;
  const PEN_DURATION = TRACE_DURATION - (PEN_DELAY - TRACE_DELAY);

  let bottomLen = 0, maxY = -Infinity;
  const SCAN_STEPS = 150; // enough precision for finding the arrow's lowest point; 800 was overkill and blocked the main thread longer than needed
  for (let i = 0; i <= SCAN_STEPS; i++) {
    const d = (i / SCAN_STEPS) * aLen;
    const p = arrowOnly.getPointAtLength(d);
    if (p.y > maxY) { maxY = p.y; bottomLen = d; }
  }

  function easePen(t){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

  const penStart = arrowOnly.getPointAtLength(bottomLen);
  pen.setAttribute('cx', penStart.x);
  pen.setAttribute('cy', penStart.y);

  let solidified = false;
  let penT0 = null;
  function penFrame(now){
    if (penT0 === null) penT0 = now;
    const elapsed = (now - penT0) - PEN_DELAY;
    if (elapsed < 0) { requestAnimationFrame(penFrame); return; }
    const t = Math.max(0, Math.min(1, elapsed / PEN_DURATION));
    // forward from the bottom to the loop's closing point (the tip)
    const dist = bottomLen + (aLen - bottomLen) * easePen(t);
    const pt = arrowOnly.getPointAtLength(dist);
    pen.setAttribute('cx', pt.x);
    pen.setAttribute('cy', pt.y);
    pen.style.opacity = t < 0.06 ? t/0.06 : (t < 0.88 ? 1 : Math.max(0, (1-t)/0.12));
    if (t < 1) {
      requestAnimationFrame(penFrame);
    } else if (!solidified) {
      solidified = true;
      solidify();
    }
  }
  requestAnimationFrame(penFrame);

  // the moment the pen touches the tip: fill floods in + shockwave pop + camera punch + sparks
  function solidify(){
    svgMark.classList.add('splash-solid');
    camera.classList.add('splash-punch');
    shock.classList.add('go');
    trace.style.opacity = '0.4';

    document.querySelectorAll('.spark').forEach((el, i) => {
      el.style.animation = `sparkOut .55s ease-out ${i * 0.03}s forwards`;
    });

    setTimeout(() => {
      try { sweepAnim.beginElement(); sweepOpacity.beginElement(); } catch(e) {}
    }, 120);

    // continuous chase beam — the loading signature — starts once things settle
    const chaseLen = len * 0.19;
    chase.style.strokeDasharray = `${chaseLen} ${len - chaseLen}`;
    chase.style.strokeDashoffset = 0;
    setTimeout(() => {
      chase.style.opacity = 1;
      chase.animate(
        [{ strokeDashoffset: 0 }, { strokeDashoffset: -len }],
        { duration: 1750, easing: 'linear', iterations: Infinity }
      );
    }, 380);
  }


  // ---- progress: driven by REAL app load events, not a fixed timer ----
  // app.js calls window.jtSplash.setProgress(pct, label) at each real
  // checkpoint (config fetched, auth resolved, data loaded, etc). Between
  // real updates we "trickle" forward slowly so the bar never looks frozen,
  // but real progress always wins and the bar never goes backwards.
  const fill = document.getElementById('sp-scan-fill');
  const dot  = document.getElementById('sp-scan-dot');
  const pct  = document.getElementById('sp-progress-pct');
  const status = document.getElementById('sp-status-text');

  let shown = 0; // last value actually painted
  let target = 0; // where real progress says we should be

  function paint(v, label){
    shown = v;
    fill.style.width = shown.toFixed(1) + '%';
    dot.style.left = shown.toFixed(1) + '%';
    pct.textContent = Math.round(shown) + '%';
    if (label) status.textContent = label;
    if (shown >= 100) dot.classList.add('splash-done');
  }

  // gentle auto-trickle: creeps toward `target` (or 90% if no real update
  // yet) so early network latency doesn't look like a stall. Cheap timer,
  // no rAF loop needed since updates are small/infrequent.
  const trickle = setInterval(() => {
    const ceiling = Math.max(target, 90);
    if (shown < ceiling) paint(Math.min(shown + 1.5, ceiling));
  }, 140);

  window.jtSplash = {
    // pct: 0-100, label: optional status text. Never moves backwards.
    setProgress(p, label){
      target = Math.max(target, Math.min(100, p));
      if (target > shown) paint(target, label);
      else if (label) status.textContent = label;
    },
    // call once the app is actually ready to be shown
    ready(){
      clearInterval(trickle);
      paint(100, 'Ready');
    }
  };
})();
