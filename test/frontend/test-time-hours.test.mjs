// "Test" study-hours category: time spent sitting a test, 3 h by default, saved as its own hours entry (source:'test').
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..', '..');
const ctrl = fs.readFileSync(path.join(root, 'frontend/js/app/dashboard-controller.js'), 'utf8');
const a = ctrl.indexOf('const TEST_TIME_DEFAULT_H'), b = ctrl.indexOf('function scoreVal');
const snippet = ctrl.slice(a, b);

function load() {
  const els = { 'x-h': { value: '' }, 'x-m': { value: '' } };
  const calls = { save: 0, render: 0 };
  const ctx = {
    S: { hours: [] }, td: () => '2026-11-10', save: () => calls.save++, navMarkDirty() {}, renderHours: () => calls.render++, renderOverview() {},
    document: { getElementById: id => els[id] || null }, Date, Math,
  };
  vm.createContext(ctx);
  vm.runInContext(snippet + '\n;globalThis.__api={logMockTestHours,_ttFill,TEST_TIME_DEFAULT_H};', ctx);
  return { api: ctx.__api, S: ctx.S, els, calls };
}
const meta = { mockId: 5, date: '2026-11-08', examLabel: 'JEE Mains Full' };

describe('Test time hours', () => {
  it('defaults to 3 hours', () => { expect(load().api.TEST_TIME_DEFAULT_H).toBe(3); });
  it('adds one entry linked to the test, counted in total', () => {
    const { api, S } = load(); api.logMockTestHours(3, meta);
    expect(S.hours).toHaveLength(1);
    expect(S.hours[0]).toMatchObject({ source: 'test', mockId: 5, testTime: 3, total: 3, lecture: 0, practice: 0, revision: 0, mockAnalysis: 0, date: '2026-11-08' });
  });
  it('changing the time updates the same entry instead of adding another', () => {
    const { api, S } = load(); api.logMockTestHours(3, meta); api.logMockTestHours(2.5, meta);
    expect(S.hours).toHaveLength(1); expect(S.hours[0].testTime).toBe(2.5); expect(S.hours[0].total).toBe(2.5);
  });
  it('clearing the time removes the entry; zero with no entry does nothing', () => {
    const { api, S, calls } = load(); api.logMockTestHours(0, meta); expect(calls.save).toBe(0);
    api.logMockTestHours(3, meta); api.logMockTestHours(0, meta); expect(S.hours).toHaveLength(0);
  });
  it('its id does not collide with an analysis entry made in the same millisecond', () => {
    const { api, S } = load(); const t = Date.now; Date.now = () => 1000;
    try { S.hours.push({ id: 1000, source: 'auto', mockId: 5 }); api.logMockTestHours(3, meta); } finally { Date.now = t; }
    expect(new Set(S.hours.map(h => h.id)).size).toBe(2);
  });
  it('fills the hour and minute boxes, blank for zero', () => {
    const { api, els } = load();
    api.logMockTestHours; api._ttFill('x', 3); expect([els['x-h'].value, els['x-m'].value]).toEqual([3, 0]);
    api._ttFill('x', 2.5); expect([els['x-h'].value, els['x-m'].value]).toEqual([2, 30]);
    api._ttFill('x', 0); expect([els['x-h'].value, els['x-m'].value]).toEqual(['', '']);
  });
});

describe('Wiring', () => {
  it('both test forms have a pre-filled test-time row and save it', () => {
    const html = fs.readFileSync(path.join(root, 'frontend/index.html'), 'utf8');
    for (const id of ['at-tt-h', 'at-tt-m', 'hwt-tt-h', 'hwt-tt-m']) expect(html).toContain(`id="${id}"`);
    expect(ctrl).toContain("_ttFill('at-tt',TEST_TIME_DEFAULT_H)"); expect(ctrl).toContain("_ttFill('hwt-tt',TEST_TIME_DEFAULT_H)");
    expect(ctrl).toContain("logMockTestHours(_lhDur('at-tt-h','at-tt-m')"); expect(ctrl).toContain("logMockTestHours(_lhDur('hwt-tt-h','hwt-tt-m')");
  });
  it('is a Test category in the hours charts and is read back from the database without a new column', () => {
    expect(ctrl).toMatch(/key:'testTime',\s+label:'Test'/);
    const data = fs.readFileSync(path.join(root, 'frontend/js/app/app-03-shell-data.js'), 'utf8');
    expect(data).toContain("testTime:r.source==='test'");
  });
});
