import { safeCompare, signToken, ADMIN_PASSWORD, TOKEN_TTL_MS } from '../lib/auth.js';
import { clientIp, loginRateLimited, upstashDel, LOGIN_MAX_ATTEMPTS } from '../lib/rate-limit.js';
import { validate, schemas } from '../lib/validation.js';

export default async function login(req, res) {
  const ip = clientIp(req);
  const rl = await loginRateLimited(ip);
  if (rl.limited) {
    return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.', retryAfterMs: rl.retryAfterMs });
  }
  const v = validate(schemas.login, req.body || {});
  if (!v.ok) return res.status(400).json({ error: v.error });
  const { password } = v.data;
  if (!ADMIN_PASSWORD || !safeCompare(password, ADMIN_PASSWORD)) {

    await new Promise(r => setTimeout(r, 300));
    return res.status(401).json({ error: 'Wrong password', attemptsRemaining: rl.remaining, maxAttempts: LOGIN_MAX_ATTEMPTS });
  }
  const exp = Date.now() + TOKEN_TTL_MS;
  await upstashDel(`admin-login:${ip}`);
  return res.status(200).json({ ok: true, token: signToken({ exp }), expiresAt: exp });
}
