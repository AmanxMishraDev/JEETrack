// Diwali greeting (frontend/js/app/app-13-diwali.js): switches itself on and off by date, India time.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const src = fs.readFileSync(path.resolve(import.meta.dirname, '..', '..', 'frontend/js/app/app-13-diwali.js'), 'utf8');

function load({ closed = false, throwStorage = false } = {}) {
  const store = new Map(closed ? [['jt_diwali_2026_closed', '1']] : []);
  const cls = new Set(), added = [], banner = { style: { display: 'none' } };
  let strip = null;
  const body = { classList: { toggle: (c, on) => (on ? cls.add(c) : cls.delete(c)) }, appendChild: el => { strip = el; added.push(el); } };
  const ctx = {
    localStorage: { getItem: k => { if (throwStorage) throw new Error('blocked'); return store.get(k) ?? null; }, setItem: (k, v) => { if (throwStorage) throw new Error('blocked'); store.set(k, v); } },
    document: {
      body, hidden: false, addEventListener() {},
      getElementById: id => (id === 'diwali-banner' ? banner : id === 'dw-strip' ? strip : null),
      createElement: () => ({ id: '', className: '', setAttribute() {}, remove() { strip = null; } }),
    },
    Date, Set, Map, console,
  };
  vm.createContext(ctx);
  vm.runInContext(src + '\n;globalThis.__api={diwaliActive,diwaliApply,diwaliCloseBanner,DIWALI}', ctx);
  return { api: ctx.__api, cls, banner, store, strip: () => strip };
}
const at = s => new Date(s);

describe('Diwali greeting', () => {
  it('is on from 7 Nov to 11 Nov (India time) and off otherwise', () => {
    const { api } = load();
    expect(api.diwaliActive(at('2026-11-06T18:00:00Z'))).toBe(false);   // 6 Nov 23:30 IST
    expect(api.diwaliActive(at('2026-11-06T18:31:00Z'))).toBe(true);    // just after midnight IST, 7 Nov
    expect(api.diwaliActive(at('2026-11-08T06:00:00Z'))).toBe(true);    // Diwali day
    expect(api.diwaliActive(at('2026-11-11T18:00:00Z'))).toBe(true);    // 11 Nov 23:30 IST, last evening
    expect(api.diwaliActive(at('2026-11-11T18:31:00Z'))).toBe(false);   // 12 Nov IST
  });
  it('applies the theme class, the top strip and the banner while active', () => {
    const t = load(); t.api.diwaliApply(at('2026-11-08T06:00:00Z'));
    expect(t.cls.has('diwali-theme')).toBe(true); expect(t.strip()).not.toBeNull(); expect(t.banner.style.display).toBe('');
  });
  it('removes everything once it has ended, even if the page was open', () => {
    const t = load(); t.api.diwaliApply(at('2026-11-08T06:00:00Z')); t.api.diwaliApply(at('2026-11-13T06:00:00Z'));
    expect(t.cls.has('diwali-theme')).toBe(false); expect(t.strip()).toBeNull(); expect(t.banner.style.display).toBe('none');
  });
  it('closing the card hides it but keeps the festive theme; it stays closed next time', () => {
    const t = load(); t.api.diwaliApply(at('2026-11-08T06:00:00Z')); t.api.diwaliCloseBanner();
    expect(t.banner.style.display).toBe('none'); t.api.diwaliApply(at('2026-11-09T06:00:00Z'));
    expect(t.banner.style.display).toBe('none'); expect(t.cls.has('diwali-theme')).toBe(true);
  });
  it('works when browser storage is blocked', () => {
    const t = load({ throwStorage: true });
    expect(() => { t.api.diwaliApply(at('2026-11-08T06:00:00Z')); t.api.diwaliCloseBanner(); }).not.toThrow();
  });
});
