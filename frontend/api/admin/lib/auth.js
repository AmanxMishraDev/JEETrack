import crypto from 'node:crypto';

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;
export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export function safeCompare(a, b) {
  const aBuf = Buffer.from(String(a || ''));
  const bBuf = Buffer.from(String(b || ''));

  if (aBuf.length !== bBuf.length) {
    crypto.timingSafeEqual(aBuf, Buffer.alloc(aBuf.length));
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  let payload;
  try { payload = JSON.parse(Buffer.from(body, 'base64url').toString()); } catch { return null; }
  if (!payload || !payload.exp || Date.now() > payload.exp) return null;
  return payload;
}
