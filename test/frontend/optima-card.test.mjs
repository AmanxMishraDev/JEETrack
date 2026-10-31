// Static guard for the Optima partner card. Reads the source as text (the
// dashboard bundle is a classic script, not importable) and asserts the
// security-critical bits can't silently regress.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const src = fs.readFileSync(path.join(root, 'frontend/js/app/dashboard-controller.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'frontend/index.html'), 'utf8');

const start = src.indexOf('OPTIMA PARTNER CARD');
const end = src.indexOf('end OPTIMA PARTNER CARD');
const block = src.slice(start, end);

describe('Optima partner card', () => {
  it('lives in one clearly delimited block', () => {
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
  });

  it('exposes the on/off switch and URL constants', () => {
    expect(block).toMatch(/const OPTIMA_CARD_ENABLED = (true|false);/);
    expect(block).toContain("const OPTIMA_CARD_URL = 'https://optima-edu.in/embed/jeetrack/';");
  });

  it('sandbox is exactly the allowed set and never has allow-same-origin', () => {
    const m = block.match(/setAttribute\('sandbox', '([^']*)'\)/);
    expect(m).not.toBeNull();
    expect(m[1].split(' ').sort()).toEqual(
      ['allow-popups', 'allow-popups-to-escape-sandbox', 'allow-scripts'].sort()
    );
    // Strip comments, then assert no code anywhere in the block mentions it.
    const code = block.replace(/\/\/.*$/gm, '');
    expect(code).not.toContain('allow-same-origin');
  });

  it('guards posthog and sends only the page name', () => {
    expect(block).toContain('window.posthog && posthog.capture');
    expect(block).toContain("'optima_card_view', { page: page }");
    expect(block).toContain("'optima_card_dismiss', { page: page }");
  });

  it('only flags new tests, not edits', () => {
    const editBranch = src.indexOf("toast('Test score updated");
    const flagCall = src.indexOf('markOptimaCardPending();');
    const newBranchMarker = src.indexOf("pushUndo('test',e,'Test score added'");
    expect(flagCall).toBeGreaterThan(editBranch);
    expect(flagCall).toBeLessThan(newBranchMarker);
  });

  it('has a slot under the hero and above the filter bar on both pages', () => {
    for (const pg of ['mains', 'advanced']) {
      const page = html.indexOf(`id="page-${pg}"`);
      const slot = html.indexOf(`id="optima-card-slot-${pg}"`, page);
      const filter = html.indexOf('prem-filter-bar', page);
      expect(slot).toBeGreaterThan(page);
      expect(slot).toBeLessThan(filter);
    }
  });
});
