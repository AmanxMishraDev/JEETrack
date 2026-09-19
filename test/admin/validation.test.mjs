import { describe, it, expect } from 'vitest';
import { validate, schemas } from '../../server/admin/lib/validation.js';
import { signToken, TOKEN_TTL_MS } from '../../server/admin/lib/auth.js';
import handler from '../../frontend/api/admin/index.js';
import { makeReq, makeRes } from '../helpers.mjs';

describe('schemas.login', () => {
  it('accepts a normal password', () => {
    expect(validate(schemas.login, { password: 'hunter2' }).ok).toBe(true);
  });
  it('rejects an empty password', () => {
    expect(validate(schemas.login, { password: '' }).ok).toBe(false);
  });
  it('rejects a missing password field entirely', () => {
    expect(validate(schemas.login, {}).ok).toBe(false);
  });
  it('rejects a password over 200 chars (not silently truncated)', () => {
    const result = validate(schemas.login, { password: 'x'.repeat(201) });
    expect(result.ok).toBe(false);
  });
});

describe('schemas.users', () => {
  it('applies documented defaults when nothing is provided', () => {
    const result = validate(schemas.users, {});
    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({ page: 0, pageSize: 20, sort: 'created_at', dir: 'desc' });
  });

  it('coerces numeric query-string values (page/pageSize always arrive as strings)', () => {
    const result = validate(schemas.users, { page: '3', pageSize: '50' });
    expect(result.ok).toBe(true);
    expect(result.data.page).toBe(3);
    expect(result.data.pageSize).toBe(50);
  });

  it('rejects a negative page number rather than clamping to 0', () => {
    expect(validate(schemas.users, { page: '-1' }).ok).toBe(false);
  });

  it('rejects pageSize over 100 rather than silently capping it', () => {
    const result = validate(schemas.users, { pageSize: '99999' });
    expect(result.ok).toBe(false);
  });

  it('rejects a non-numeric page (garbage query param)', () => {
    expect(validate(schemas.users, { page: 'not-a-number' }).ok).toBe(false);
  });

  it('rejects a sort column outside the allowed enum (e.g. a raw SQL-injection-style attempt)', () => {
    expect(validate(schemas.users, { sort: 'email; DROP TABLE users;' }).ok).toBe(false);
  });

  it('rejects an invalid dir value', () => {
    expect(validate(schemas.users, { dir: 'sideways' }).ok).toBe(false);
  });
});

describe('schemas.user_detail', () => {
  it('accepts a real UUID', () => {
    expect(validate(schemas.user_detail, { distinct_id: '123e4567-e89b-12d3-a456-426614174000' }).ok).toBe(true);
  });
  it('rejects a non-UUID string (e.g. an arbitrary user-supplied id)', () => {
    expect(validate(schemas.user_detail, { distinct_id: 'not-a-uuid' }).ok).toBe(false);
  });
  it('rejects a missing distinct_id', () => {
    expect(validate(schemas.user_detail, {}).ok).toBe(false);
  });
  it('rejects an empty string', () => {
    expect(validate(schemas.user_detail, { distinct_id: '' }).ok).toBe(false);
  });
});

describe('schemas.feedback_list', () => {
  it('applies defaults', () => {
    const result = validate(schemas.feedback_list, {});
    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({ limit: 50, offset: 0 });
  });
  it('rejects limit over 200 rather than silently capping', () => {
    expect(validate(schemas.feedback_list, { limit: '5000' }).ok).toBe(false);
  });
  it('rejects a rating outside 1-5', () => {
    expect(validate(schemas.feedback_list, { rating: '9' }).ok).toBe(false);
    expect(validate(schemas.feedback_list, { rating: '0' }).ok).toBe(false);
  });
  it('rejects a negative offset', () => {
    expect(validate(schemas.feedback_list, { offset: '-5' }).ok).toBe(false);
  });
});

describe('router-level: malformed input on a validated action returns 400, never reaches the handler', () => {
  const token = signToken({ exp: Date.now() + TOKEN_TTL_MS });

  it('user_detail with a garbage distinct_id returns 400', async () => {
    const req = makeReq({ query: { action: 'user_detail', distinct_id: 'DROP TABLE users' }, headers: { authorization: `Bearer ${token}` } });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(400);
  });

  it('users with an out-of-range pageSize returns 400', async () => {
    const req = makeReq({ query: { action: 'users', pageSize: '999999' }, headers: { authorization: `Bearer ${token}` } });
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(400);
  });
});
