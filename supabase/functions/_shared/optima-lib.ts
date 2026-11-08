// Shared helpers for the JEETrack x Optima edge functions (real partner API).
// Pure functions live here so they can be unit-tested under Node.

export const MAX_QUESTIONS = 200;          // Optima: 1-200 questions per test
export const MAX_BODY_BYTES = 2_000_000;   // Optima: at most 2 MB per call
export const MAX_JOBS_PER_DAY = 20;        // Optima allows 20 new tests per student per day; same guard on our side
export const SENDING_RETRY_AFTER_MS = 5 * 60_000; // a 'sending' row older than this is treated as dead and may be retried
export const STATUS_MIN_INTERVAL_MS = 60_000;     // never ask Optima about the same job more often than this
export const IMG_PREFIX = "https://static.pw.live/";

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

// HMAC-SHA256 as lowercase hex.
export async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
}

// The student id Optima sees: stable, unique, and not the JEETrack user id. Optima doc: text, at most 128 chars.
// `prefix` is "jt_" on live; use e.g. "jt_test_" on staging ("Please use test student IDs on staging").
export async function studentId(salt: string, userId: string, prefix = "jt_"): Promise<string> {
  return `${prefix}${(await hmacHex(salt, userId)).slice(0, 32)}`;
}

export const isUuid = (s: unknown) =>
  typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export const byteLength = (s: string) => enc.encode(s).length;

export interface Submission {
  consent: true;
  test_id: number | null;                  // JEETrack tests.id (ownership is checked by the caller)
  test: Record<string, any>;               // the PW test exactly as the extension produced it (schema 2), forwarded unchanged
  pwTestId: string;
  attemptTitle: string | null;
  questionCount: number;                   // wrong + skipped
}

// Checks what Optima requires (PARTNER_API_JEETRACK.md) so the student gets a clear message before anything is sent.
// The test is NOT rebuilt: Optima wants it "exactly as your extension produces it, all questions, unchanged".
export function validateSubmission(b: any): { ok: true; value: Submission } | { ok: false; error: string } {
  if (!b || typeof b !== "object") return { ok: false, error: "Body must be a JSON object." };
  if (b.consent !== true) return { ok: false, error: "The student has not agreed to send this test to Optima." };
  if (b.test_id != null && !Number.isSafeInteger(b.test_id)) return { ok: false, error: "test_id must be an integer." };
  const t = b.test;
  if (!t || typeof t !== "object" || Array.isArray(t)) return { ok: false, error: "test is required." };
  if (t.schema !== 2) return { ok: false, error: "test.schema must be 2." };
  if (t.source !== "pw") return { ok: false, error: 'test.source must be "pw".' };
  if (typeof t.testId !== "string" || !t.testId.trim() || t.testId.length > 128) return { ok: false, error: "test.testId is missing." };
  if (t.attemptTitle != null && (typeof t.attemptTitle !== "string" || t.attemptTitle.length > 128)) return { ok: false, error: "test.attemptTitle must be text." };
  if (!Array.isArray(t.questions) || t.questions.length === 0) return { ok: false, error: "test.questions is required." };
  if (t.questions.length > MAX_QUESTIONS) return { ok: false, error: `At most ${MAX_QUESTIONS} questions per test.` };

  const seen = new Set<string>();
  let questionCount = 0;
  for (let i = 0; i < t.questions.length; i++) {
    const q = t.questions[i], at = `test.questions[${i}]`;
    if (!q || typeof q !== "object") return { ok: false, error: `${at} must be an object.` };
    if (q.qno == null || (typeof q.qno !== "number" && typeof q.qno !== "string")) return { ok: false, error: `${at}.qno is missing.` };
    if (seen.has(String(q.qno))) return { ok: false, error: `${at}.qno ${q.qno} appears twice.` };
    seen.add(String(q.qno));
    if (typeof q.pwQuestionId !== "string" || !q.pwQuestionId) return { ok: false, error: `${at}.pwQuestionId is missing.` };
    if (typeof q.type !== "string") return { ok: false, error: `${at}.type is missing.` };
    if (typeof q.status !== "string") return { ok: false, error: `${at}.status is missing.` };
    if (!("marked" in q)) return { ok: false, error: `${at}.marked is missing (null if skipped).` };
    if (!("correct" in q)) return { ok: false, error: `${at}.correct is missing.` };
    // Only https://static.pw.live/ images are allowed through: JEETrack's server must not be a relay for arbitrary URLs.
    for (const im of q.images?.question ?? []) {
      if (typeof im?.url !== "string" || !im.url.startsWith(IMG_PREFIX)) return { ok: false, error: `${at}.images.question has a URL that is not on static.pw.live.` };
    }
    // Confirmed on Optima staging: EVERY question (also the correct ones) needs an English question image on static.pw.live,
    // otherwise Optima refuses the whole test. Checked here so the student gets a clear message and no useless failed job is created.
    if (!(q.images?.question ?? []).some((im: any) => im?.lang === "en" && typeof im?.url === "string" && im.url.startsWith(IMG_PREFIX)))
      return { ok: false, error: `Question ${q.qno} has no English question image, so Optima cannot use this test.` };
    if (q.status === "wrong" || q.status === "skipped") questionCount++;
  }
  return { ok: true, value: { consent: true, test_id: b.test_id ?? null, test: t, pwTestId: t.testId.trim(), attemptTitle: t.attemptTitle?.trim() || null, questionCount } };
}

// ---- Optima partner API calls (server side only; the key never leaves the edge function) ----

export interface OptimaEnv { url: string; key: string }
export type OptimaResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; httpStatus: number; detail?: string; retryable: boolean };

const RETRYABLE = new Set([500, 503]);

async function call(env: OptimaEnv, url: string, init: RequestInit, retries: number, fetchImpl: typeof fetch): Promise<OptimaResult<any>> {
  for (let attempt = 0; ; attempt++) {
    let res: Response | null = null;
    try {
      res = await fetchImpl(url, { ...init, headers: { ...(init.headers ?? {}), "x-partner-key": env.key }, signal: AbortSignal.timeout(25_000) });
    } catch {
      if (attempt < retries) { await new Promise((r) => setTimeout(r, 800)); continue; }
      return { ok: false, code: "unreachable", httpStatus: 0, retryable: true };
    }
    if (res.ok) {
      const data = await res.json().catch(() => null);
      return data && typeof data === "object" ? { ok: true, data } : { ok: false, code: "bad_reply", httpStatus: res.status, retryable: true };
    }
    const body: any = await res.json().catch(() => ({}));
    const retryable = RETRYABLE.has(res.status);
    if (retryable && attempt < retries) { await new Promise((r) => setTimeout(r, 800)); continue; }
    return { ok: false, code: String(body?.error ?? `http_${res.status}`), httpStatus: res.status, detail: typeof body?.detail === "string" ? body.detail : undefined, retryable };
  }
}

export interface SubmitReply { submission_id: string; status: string; notebook_url: string; repeat: boolean }

export async function optimaSubmit(env: OptimaEnv, payload: unknown, fetchImpl: typeof fetch = fetch): Promise<OptimaResult<SubmitReply>> {
  // Safe to retry on 500/503: Optima treats the same student + testId + attempt as the same submission ("repeat": true).
  const r = await call(env, env.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, 1, fetchImpl);
  if (!r.ok) return r;
  const d = r.data;
  const urlOk = typeof d.notebook_url === "string" && /^https:\/\//i.test(d.notebook_url) && d.notebook_url.length <= 2048;
  if (typeof d.submission_id !== "string" || !urlOk || (d.status !== "received" && d.status !== "ready"))
    return { ok: false, code: "bad_reply", httpStatus: 200, retryable: true };
  return { ok: true, data: { submission_id: d.submission_id, status: d.status, notebook_url: d.notebook_url, repeat: d.repeat === true } };
}

export interface StatusReply { status: "received" | "ready"; notebook_url?: string }

export async function optimaStatus(env: OptimaEnv, student: string, test: string, attempt: string | null, fetchImpl: typeof fetch = fetch): Promise<OptimaResult<StatusReply>> {
  const q = new URLSearchParams({ student, test });
  if (attempt) q.set("attempt", attempt);
  const sep = env.url.includes("?") ? "&" : "?";
  const r = await call(env, `${env.url}${sep}${q}`, { method: "GET" }, 1, fetchImpl);
  if (!r.ok) return r;
  const s = r.data.status;
  if (s !== "received" && s !== "ready") return { ok: false, code: "bad_reply", httpStatus: 200, retryable: true };
  const nb = typeof r.data.notebook_url === "string" && /^https:\/\//i.test(r.data.notebook_url) ? r.data.notebook_url : undefined;
  return { ok: true, data: { status: s, notebook_url: nb } };
}
