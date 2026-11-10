import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../../frontend/public/pages/support.html', import.meta.url), 'utf8');

describe('support page PostHog events', () => {
  it('loads PostHog without recording or autocapture', () => {
    expect(html).toContain('posthog.init(cfg.posthogKey');
    expect(html).toContain('disable_session_recording: true');
    expect(html).toContain('autocapture: false');
  });
  it('fires every funnel event', () => {
    for (const ev of ['support_page_viewed','support_amount_selected','support_payment_initiated',
      'support_payment_completed','support_payment_discarded','support_payment_failed']) {
      expect(html).toContain(ev);
    }
  });
  it('marks success before the modal dismiss can count as a discard', () => {
    const h = html.indexOf('handler: async function(response){');
    expect(html.slice(h, h + 250)).toContain('_spDone = true');
  });
  it('never sends name, note text or email', () => {
    const calls = html.match(/_sp(Track|Once)\([^;]*;/g) || [];
    for (const c of calls) {
      expect(c).not.toMatch(/supporterName|(?<!!!)supporterNote|email|display_name/);
    }
  });
});
