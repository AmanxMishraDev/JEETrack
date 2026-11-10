/* global nav, _navNi */
// ---------------------------------------------------------------------------
// Announcements: a bell in the top-right corner and a page at /announcements.
//
// Each announcement has an `endsAt` date (inclusive, India time). After that day it disappears from the page by itself, and
// when none is active the bell is hidden. The little dot shows until the student has opened the page (remembered in this browser).
// To add one: add an entry below and deploy. To retire one early: set endsAt to a past date.
// ---------------------------------------------------------------------------
const ANNOUNCEMENTS = [
  {
    id: 'optima-launch-2026-11',
    tag: 'Launch',
    title: 'JEETrack × Optima: Log. Sync. Analyse.',
    summary: 'Log your PW mocks in one click with PW Sync, and get your mistakes analysed by Optima. See how it works.',
    date: '2026-11-07',
    endsAt: '2026-11-22',
    url: '/optima-launch',
    cta: 'See how it works',
  },
];
const _ANN_SEEN_KEY = 'jt_ann_seen';

function _annToday(now){ // YYYY-MM-DD in India time, so an announcement ends at midnight IST wherever the student is
  return new Date((now || new Date()).getTime() + 5.5 * 3600000).toISOString().slice(0, 10);
}
function announcementsActive(now){
  const today = _annToday(now);
  return ANNOUNCEMENTS.filter(a => a.endsAt >= today && a.date <= today).sort((a, b) => (a.date < b.date ? 1 : -1));
}
function _annSeen(){
  try{ const v = JSON.parse(localStorage.getItem(_ANN_SEEN_KEY) || '[]'); return Array.isArray(v) ? v : []; }catch(e){ return []; }
}
function announcementsUnread(now){
  const seen = new Set(_annSeen());
  return announcementsActive(now).filter(a => !seen.has(a.id));
}
function announcementsMarkSeen(now){
  try{ localStorage.setItem(_ANN_SEEN_KEY, JSON.stringify([...new Set([..._annSeen(), ...announcementsActive(now).map(a => a.id)])].slice(-50))); }catch(e){ /* private mode: the dot just shows again */ }
  announcementsSyncBell(now);
}
function announcementsSyncBell(now){
  const active = announcementsActive(now).length, unread = announcementsUnread(now).length;
  document.querySelectorAll('.ann-bell').forEach(b => {
    b.style.display = active ? '' : 'none';
    b.classList.toggle('has-new', unread > 0);
    b.setAttribute('aria-label', unread ? 'Announcements, ' + unread + ' new' : 'Announcements');
  });
}
function _annEsc(s){ return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function _annDaysLeft(a, now){
  const end = Date.parse(a.endsAt + 'T00:00:00Z'), today = Date.parse(_annToday(now) + 'T00:00:00Z');
  return Math.round((end - today) / 86400000);
}
function announcementsHTML(now){
  const list = announcementsActive(now), seen = new Set(_annSeen());
  if(!list.length) return `<div class="ann-empty"><div class="ann-empty-ic">&#128276;</div><div class="ann-empty-t">You are all caught up</div><div class="ann-empty-s">New announcements will show up here.</div></div>`;
  return `<div class="ann-list">${list.map(a => {
    const isNew = !seen.has(a.id);
    return `<article class="ann-card${isNew ? ' is-new' : ''}">
      <div class="ann-top"><span class="ann-tag">${_annEsc(a.tag || 'Update')}</span>${isNew ? '<span class="ann-new">New</span>' : ''}<span class="ann-date">${_annEsc(new Date(a.date + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }))}</span></div>
      <h3>${_annEsc(a.title)}</h3>
      <p>${_annEsc(a.summary)}</p>
      <div class="ann-foot"><a class="ann-cta" href="${_annEsc(a.url)}">${_annEsc(a.cta || 'Read more')} <span aria-hidden="true">&rarr;</span></a></div>
    </article>`;
  }).join('')}</div>`;
}
function renderAnnouncements(){
  const root = document.getElementById('announcements-root'); if(!root) return;
  root.innerHTML = announcementsHTML();
}
function openAnnouncements(push){
  try{ if(typeof _jtTrack === 'function') _jtTrack('announcements_opened'); }catch(e){ /* analytics must never break the page */ }
  if(push !== false) history.pushState({ page: 'announcements' }, '', '/announcements');
  nav('announcements', false);
  _navNi().forEach(n => n.classList.remove('active'));
  window.scrollTo(0, 0);
  renderAnnouncements();
  announcementsMarkSeen();
}
announcementsSyncBell();
document.addEventListener('visibilitychange', () => { if(!document.hidden) announcementsSyncBell(); }); // an announcement may have ended while the tab was open
