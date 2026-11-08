// ---------------------------------------------------------------------------
// Diwali greeting: a warm top strip + a dismissible "Happy Diwali" card on the dashboard.
// It switches itself on and off by date (India time), so nothing needs to be removed afterwards.
// To reuse for another festival: change the dates below. To end it early: set `to` to a past date.
// ---------------------------------------------------------------------------
const DIWALI = { from: '2026-11-07', to: '2026-11-11', closedKey: 'jt_diwali_2026_closed' };

function _dwToday(now){ return new Date((now || new Date()).getTime() + 5.5 * 3600000).toISOString().slice(0, 10); }
function diwaliActive(now){ const d = _dwToday(now); return d >= DIWALI.from && d <= DIWALI.to; }
function diwaliBannerClosed(){ try{ return localStorage.getItem(DIWALI.closedKey) === '1'; }catch(e){ return false; } }
function diwaliCloseBanner(){
  try{ localStorage.setItem(DIWALI.closedKey, '1'); }catch(e){ /* private mode: it just shows again next time */ }
  const b = document.getElementById('diwali-banner'); if(b) b.style.display = 'none';
}
function diwaliApply(now){
  const on = diwaliActive(now);
  if(document.body) document.body.classList.toggle('diwali-theme', on);
  let strip = document.getElementById('dw-strip');
  if(on && !strip && document.body){ strip = document.createElement('div'); strip.id = 'dw-strip'; strip.className = 'dw-strip'; strip.setAttribute('aria-hidden', 'true'); document.body.appendChild(strip); }
  if(!on && strip) strip.remove();
  const banner = document.getElementById('diwali-banner');
  if(banner) banner.style.display = on && !diwaliBannerClosed() ? '' : 'none';
}
diwaliApply();
document.addEventListener('visibilitychange', () => { if(!document.hidden) diwaliApply(); }); // the festival may end while the tab is open
