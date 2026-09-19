import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import login from '../../server/admin/handlers/login.js';
import { LOGIN_MAX_ATTEMPTS } from '../../server/admin/lib/rate-limit.js';
import { makeReq, makeRes } from '../helpers.mjs';

// Simulates Upstash's Redis INCR+EXPIRE eval script well enough for these
// tests: tracks a per-key counter across calls within one test (matching
// real Redis behavior — each login attempt increments the same window),
// and answers DEL by resetting that key's counter (matching what a real
// successful login does to let the next attempt start fresh).
function installFakeUpstash() {
  const counters = new Map();
  global.fetch = vi.fn(async (url, opts) => {
    const parsed = JSON.parse(opts.body);
    const cmd = parsed[0];
    if (cmd === 'EVAL') {
      const key = parsed[3];
      const count = (counters.get(key) || 0) + 1;
      counters.set(key, count);
      return { ok: true, json: async () => ({ result: [count, 900] }) };
    }
    if (cmd === 'DEL') {
      const key = parsed[1];
      counters.delete(key);
      return { ok: true, json: async () => ({ result: 1 }) };
    }
    return { ok: true, json: async () => ({}) };
  });
  return counters;
}

describe('login rate limiting', () => {
  let counters;
  beforeEach(() => { counters = installFakeUpstash(); });
  afterEach(() => vi.restoreAllMocks());

  it(`allows up to ${LOGIN_MAX_ATTEMPTS} wrong-password attempts (401, not 429)`, async () => {
    for (let i = 1; i <= LOGIN_MAX_ATTEMPTS; i++) {
      const req = makeReq({ method: 'POST', body: { password: 'wrong' }, headers: { 'x-real-ip': '1.2.3.4' } });
      const res = makeRes();
      await login(req, res);
      expect(res._status, `attempt ${i} should be 401`).toBe(401);
    }
  });

  it(`the ${LOGIN_MAX_ATTEMPTS + 1}th attempt from the same IP returns 429`, async () => {
    for (let i = 1; i <= LOGIN_MAX_ATTEMPTS; i++) {
      const req = makeReq({ method: 'POST', body: { password: 'wrong' }, headers: { 'x-real-ip': '5.6.7.8' } });
      await login(req, makeRes());
    }
    const req = makeReq({ method: 'POST', body: { password: 'wrong' }, headers: { 'x-real-ip': '5.6.7.8' } });
    const res = makeRes();
    await login(req, res);
    expect(res._status).toBe(429);
    expect(res._body.error).toMatch(/too many attempts/i);
  });

  it('rate limiting is scoped per-IP — a different IP is unaffected by another IP being blocked', async () => {
    for (let i = 1; i <= LOGIN_MAX_ATTEMPTS + 1; i++) {
      const req = makeReq({ method: 'POST', body: { password: 'wrong' }, headers: { 'x-real-ip': '9.9.9.9' } });
      await login(req, makeRes());
    }
    // A fresh IP should still get a normal 401, not inherit the block.
    const req = makeReq({ method: 'POST', body: { password: 'wrong' }, headers: { 'x-real-ip': '1.1.1.1' } });
    const res = makeRes();
    await login(req, res);
    expect(res._status).toBe(401);
  });

  it('a correct password on the same IP still resets the counter (DEL called) so the next window starts clean', async () => {
    const ip = '4.4.4.4';
    for (let i = 1; i <= 3; i++) {
      const req = makeReq({ method: 'POST', body: { password: 'wrong' }, headers: { 'x-real-ip': ip } });
      await login(req, makeRes());
    }
    expect(counters.get(`admin-login:${ip}`)).toBe(3);

    const req = makeReq({ method: 'POST', body: { password: 'test-admin-password-for-vitest-only' }, headers: { 'x-real-ip': ip } });
    const res = makeRes();
    await login(req, res);
    expect(res._status).toBe(200);
    expect(res._body.token).toBeTruthy();
    expect(counters.has(`admin-login:${ip}`)).toBe(false); // DEL cleared it
  });

  it('fails OPEN (no rate limiting, but auth still enforced) if Upstash is unreachable', async () => {
    global.fetch = vi.fn(async () => { throw new Error('network down'); });
    const req = makeReq({ method: 'POST', body: { password: 'wrong' }, headers: { 'x-real-ip': '8.8.8.8' } });
    const res = makeRes();
    await login(req, res);
    // Still correctly rejects the wrong password — just not rate-limited.
    expect(res._status).toBe(401);
  });
});
