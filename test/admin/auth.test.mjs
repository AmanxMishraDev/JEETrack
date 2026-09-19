import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { signToken, verifyToken, TOKEN_TTL_MS } from '../../server/admin/lib/auth.js';
import handler from '../../frontend/api/admin/index.js';
import { makeReq, makeRes } from '../helpers.mjs';

describe('lib/auth.js — signToken / verifyToken', () => {
  it('a freshly signed token verifies successfully and returns its payload', () => {
    const exp = Date.now() + TOKEN_TTL_MS;
    const token = signToken({ exp });
    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload.exp).toBe(exp);
  });

  it('rejects a missing token', () => {
    expect(verifyToken(undefined)).toBeNull();
    expect(verifyToken('')).toBeNull();
  });

  it('rejects a malformed token (no signature separator)', () => {
    expect(verifyToken('not-a-real-token')).toBeNull();
  });

  it('rejects a token with a tampered payload (signature no longer matches)', () => {
    const token = signToken({ exp: Date.now() + TOKEN_TTL_MS });
    const [, sig] = token.split('.');
    // Flip the payload to grant a longer expiry without re-signing.
    const tamperedPayload = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS * 365 })).toString('base64url');
    expect(verifyToken(`${tamperedPayload}.${sig}`)).toBeNull();
  });

  it('rejects a token signed with the wrong secret', () => {
    const exp = Date.now() + TOKEN_TTL_MS;
    const body = Buffer.from(JSON.stringify({ exp })).toString('base64url');
    const wrongSig = crypto.createHmac('sha256', 'not-the-real-secret').update(body).digest('base64url');
    expect(verifyToken(`${body}.${wrongSig}`)).toBeNull();
  });

  it('rejects an expired token even with a correct signature', () => {
    const token = signToken({ exp: Date.now() - 1000 }); // already expired
    expect(verifyToken(token)).toBeNull();
  });

  it('rejects a token with no exp field at all', () => {
    const token = signToken({ foo: 'bar' });
    expect(verifyToken(token)).toBeNull();
  });
});

describe('admin router — auth gate (status codes for every non-login action)', () => {
  it('returns 401 with no Authorization header at all', async () => {
    const req = makeReq({ query: { action: 'stats' } });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(401);
    expect(res._body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 401 for a garbage token', async () => {
    const req = makeReq({ query: { action: 'stats' }, headers: { authorization: 'Bearer garbage' } });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(401);
  });

  it('returns 401 for an expired token', async () => {
    const expired = signToken({ exp: Date.now() - 1 });
    const req = makeReq({ query: { action: 'stats' }, headers: { authorization: `Bearer ${expired}` } });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(401);
  });

  it('returns 401 for a tampered (valid-shape, wrong-signature) token', async () => {
    const token = signToken({ exp: Date.now() + TOKEN_TTL_MS });
    const [body] = token.split('.');
    const req = makeReq({ query: { action: 'stats' }, headers: { authorization: `Bearer ${body}.deadbeef` } });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(401);
  });

  it('a valid token passes the auth gate (does not return 401) even for an unknown action', async () => {
    // An unknown action name deliberately avoids needing to mock Supabase
    // for this test — passing the auth gate is what's under test here;
    // each handler's own behavior is covered separately.
    const token = signToken({ exp: Date.now() + TOKEN_TTL_MS });
    const req = makeReq({ query: { action: '__not_a_real_action__' }, headers: { authorization: `Bearer ${token}` } });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).not.toBe(401);
    expect(res._status).toBe(400); // "Unknown action" — proves it got past the auth gate
  });

  it('OPTIONS requests are never gated (CORS preflight)', async () => {
    const req = makeReq({ method: 'OPTIONS', query: {} });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(200);
  });
});
