// Admin-login rate limiting lives in Upstash Redis, not Postgres and not
// in-memory. In-memory was wrong because a plain JS object here would live
// in this function's module scope, which Vercel doesn't guarantee is
// shared/persistent across concurrent serverless instances. Postgres was
// moved away from deliberately: this check would otherwise run on every
// login attempt, and — more importantly — the identical check_rate_limit()
// function is also called from inside the save_* RPCs on every sync call
// from every user (see database/sql/rate-limiting.sql), so keeping this
// specific caller on Postgres too was extra IO with no benefit; Redis has
// none of that cost since it's pure in-memory, no disk at all.
//
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars.
// Fails OPEN (skips rate limiting) if either is missing or the request
// errors — ADMIN_PASSWORD itself still gates access either way, so a
// Redis outage degrades to "no brute-force throttling", not "no auth".
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Single round-trip, atomic: INCR, then EXPIRE only on the first hit in a
// window, then read back the TTL either way. Doing EXPIRE as a *separate*
// call after INCR (rather than in the same script) would leave a race
// where a crash/error between the two calls leaves the key without a TTL
// — meaning it would never reset and that key stays rate-limited forever.
const RATE_LIMIT_SCRIPT = "local c = redis.call('INCR', KEYS[1]); local t; if c == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); t = tonumber(ARGV[1]) else t = redis.call('TTL', KEYS[1]) end; return {c, t}";

// Returns { count, ttlSeconds } for the given key after incrementing it,
// or null if Upstash isn't configured or the call failed (caller decides
// how to fail open in that case).
async function upstashHit(key, windowSeconds) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', RATE_LIMIT_SCRIPT, '1', key, String(windowSeconds)]),
    });
    if (!res.ok) return null;
    const { result } = await res.json();
    return { count: result[0], ttlSeconds: result[1] };
  } catch (e) {
    return null;
  }
}

export async function upstashDel(key) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  try {
    await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['DEL', key]),
    });
  } catch (e) {}
}

export const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_SECONDS = 15 * 60;

export async function loginRateLimited(ip) {
  const key = `admin-login:${ip}`;
  const hit = await upstashHit(key, LOGIN_WINDOW_SECONDS);
  if (!hit) return { limited: false, remaining: null, retryAfterMs: null }; // fail open
  return {
    limited: hit.count > LOGIN_MAX_ATTEMPTS,
    remaining: Math.max(0, LOGIN_MAX_ATTEMPTS - hit.count),
    retryAfterMs: hit.ttlSeconds * 1000,
  };
}

export function clientIp(req) {
  const real = req.headers['x-real-ip'];
  if (real) return String(real).trim();
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}
