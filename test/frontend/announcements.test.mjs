// Announcements (frontend/js/app/app-12-announcements.js): active window, unread dot, bell visibility.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..', '..');
const src = fs.readFileSync(path.join(root, 'frontend/js/app/app-12-announcements.js'), 'utf8');

function load({ seen = null, throwStorage = false } = {}) {
  const store = new Map(seen ? [['jt_ann_seen', JSON.stringify(seen)]] : []);
  const bell = { style: {}, cls: new Set(), classList: { toggle(c, on) { on ? bell.cls.add(c) : bell.cls.delete(c); } }, setAttribute(k, v) { bell[k] = v; } };
  const rootEl = { innerHTML: '' };
  const ctx = {
    nav() {}, _navNi: () => [], history: { pushState() {} }, window: { scrollTo() {} },
    localStorage: { getItem: k => { if (throwStorage) throw new Error('blocked'); return store.get(k) ?? null; }, setItem: (k, v) => { if (throwStorage) throw new Error('blocked'); store.set(k, v); } },
    document: { querySelectorAll: s => (s === '.ann-bell' ? [bell] : []), getElementById: id => (id === 'announcements-root' ? rootEl : null), addEventListener() {}, hidden: false },
    Date, JSON, Set, Math, console,
  };
  vm.createContext(ctx);
  vm.runInContext(src + '\n;globalThis.__api={ANNOUNCEMENTS,announcementsActive,announcementsUnread,announcementsMarkSeen,announcementsHTML,openAnnouncements,announcementsSyncBell}', ctx);
  return { api: ctx.__api, bell, rootEl, store };
}
const at = s => new Date(s + 'T06:00:00Z'); // 11:30 India time

describe('Announcements', () => {
  it('shows from its date until the end date (inclusive), then disappears by itself', () => {
    const { api } = load(); const a = api.ANNOUNCEMENTS[0];
    expect(api.announcementsActive(at('2026-11-06'))).toHaveLength(0);          // not yet
    expect(api.announcementsActive(at(a.date))).toHaveLength(1);
    expect(api.announcementsActive(at(a.endsAt))).toHaveLength(1);             // last day still shows
    expect(api.announcementsActive(at('2026-11-23'))).toHaveLength(0);          // gone the day after
  });
  it('the end is midnight India time, not the browser time zone', () => {
    const { api } = load(); const a = api.ANNOUNCEMENTS[0];
    expect(api.announcementsActive(new Date(a.endsAt + 'T18:00:00Z'))).toHaveLength(1);  // 23:30 IST on the last day
    expect(api.announcementsActive(new Date(a.endsAt + 'T18:31:00Z'))).toHaveLength(0);  // just after midnight IST
  });
  it('unread until the page is opened; then the dot goes', () => {
    const { api, bell } = load(); const a = api.ANNOUNCEMENTS[0];
    expect(api.announcementsUnread(at(a.date))).toHaveLength(1);
    api.announcementsMarkSeen(at(a.date));
    expect(api.announcementsUnread(at(a.date))).toHaveLength(0);
    expect(bell.cls.has('has-new')).toBe(false);
  });
  it('bell is hidden when nothing is active', () => {
    const { api, bell } = load(); const a = api.ANNOUNCEMENTS[0];
    api.announcementsSyncBell(at(a.date)); expect(bell.style.display).toBe('');
    api.announcementsSyncBell(at('2026-12-31')); expect(bell.style.display).toBe('none');
  });
  it('page text is escaped and has the link and no countdown', () => {
    const { api } = load(); const a = api.ANNOUNCEMENTS[0];
    const h = api.announcementsHTML(at(a.date));
    expect(h).toContain('href="' + a.url + '"'); expect(h).not.toContain('days left'); expect(h).not.toContain('<script');
    expect(api.announcementsHTML(at('2026-12-31'))).toContain('all caught up');
  });
  it('works when browser storage is blocked', () => {
    const { api } = load({ throwStorage: true }); const a = api.ANNOUNCEMENTS[0];
    expect(() => api.announcementsMarkSeen()).not.toThrow();
    expect(api.announcementsUnread(at(a.date))).toHaveLength(1);
  });
  it('every announcement has a unique id, valid dates and an on-site link', () => {
    const { api } = load(); const ids = api.ANNOUNCEMENTS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of api.ANNOUNCEMENTS) { expect(a.endsAt >= a.date).toBe(true); expect(a.url).toMatch(/^\/[a-z0-9-/]+$/); }
  });
});
