// submit-mock: extension -> JEETrack -> Optima partner API ("Add to my error notebook").
//  1 verify the student's JWT   2 validate the test (consent, schema 2, limits)   3 one job per (student, PW test, attempt)
//  4 POST to Optima with x-partner-key   5 store submission_id + notebook_url (never the questions)
// Holds OPTIMA_PARTNER_KEY. The score import does not depend on this function: a failure here never touches `tests`.
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  cors, json, studentId, validateSubmission, optimaSubmit, byteLength,
  MAX_BODY_BYTES, MAX_JOBS_PER_DAY, SENDING_RETRY_AFTER_MS,
} from "../_shared/optima-lib.ts";

const env = (k: string) => Deno.env.get(k) ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const SUPABASE_URL = env("SUPABASE_URL");
  const PARTNER_URL = env("OPTIMA_PARTNER_URL"), PARTNER_KEY = env("OPTIMA_PARTNER_KEY"), ANON_SALT = env("ANON_SALT");
  if (!PARTNER_URL || !PARTNER_KEY || !ANON_SALT) return json({ error: "Analysis is not set up yet." }, 503);
  const admin = createClient(SUPABASE_URL, env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

  // 1. Who is asking? Only the verified JWT counts: no user id from the client is ever trusted.
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Missing Authorization header." }, 401);
  const { data: auth, error: authErr } = await admin.auth.getUser(token);
  const user = auth?.user;
  if (authErr || !user) return json({ error: "Invalid or expired session." }, 401);

  // 2. Read + validate. Size is checked on the raw text, before parsing.
  const text = await req.text();
  if (byteLength(text) > MAX_BODY_BYTES) return json({ error: "This test is too big to send (over 2 MB)." }, 413);
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return json({ error: "Body must be JSON." }, 400); }
  const v = validateSubmission(raw);
  if (!v.ok) return json({ error: v.error }, 400);
  const sub = v.value;

  // The student id Optima sees is a keyed hash: Optima never gets the JEETrack user id, name or email.
  const student = await studentId(ANON_SALT, user.id, env("OPTIMA_ID_PREFIX") || "jt_");
  const payload = { student: { id: student }, consent: true, tapped_at: new Date().toISOString(), test: sub.test };
  if (byteLength(JSON.stringify(payload)) > MAX_BODY_BYTES) return json({ error: "This test is too big to send (over 2 MB)." }, 413);

  // test_id (optional) must be one of the caller's own tests
  if (sub.test_id != null) {
    const { data: own } = await admin.from("tests").select("id").eq("id", sub.test_id).eq("user_id", user.id).maybeSingle();
    if (!own) return json({ error: "test_id does not belong to this user." }, 400);
  }

  const now = Date.now(), iso = (t = now) => new Date(t).toISOString();
  const attemptFilter = (q: any) => (sub.attemptTitle === null ? q.is("attempt_title", null) : q.eq("attempt_title", sub.attemptTitle));
  const findExisting = () => attemptFilter(
    admin.from("optima_jobs").select("id,status,notebook_url,test_id,attempted_at").eq("user_id", user.id).eq("pw_test_id", sub.pwTestId),
  ).maybeSingle();

  // 3. One job per (student, PW test, attempt): sending again is safe and never creates a second row.
  let { data: job } = await findExisting();
  if (!job) {
    const since = iso(now - 24 * 3600 * 1000);
    const { count, error: limErr } = await admin.from("optima_jobs").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
    if (limErr) return json({ error: "Could not check the daily limit." }, 500);
    if ((count ?? 0) >= MAX_JOBS_PER_DAY) return json({ error: `Daily limit reached (${MAX_JOBS_PER_DAY} tests per day).` }, 429);
    const ins = await admin.from("optima_jobs")
      .insert({ user_id: user.id, test_id: sub.test_id, pw_test_id: sub.pwTestId, attempt_title: sub.attemptTitle, status: "sending", question_count: sub.questionCount, attempted_at: iso() })
      .select("id,status,notebook_url,test_id,attempted_at").single();
    if (ins.error?.code === "23505") ({ data: job } = await findExisting()); // two sends raced: the other one won
    else if (ins.error || !ins.data) return json({ error: "Could not create the job." }, 500);
    else job = ins.data;
    if (!job) return json({ error: "Could not create the job." }, 500);
  } else if (job.status === "received" || job.status === "ready" || job.status === "sent" || job.status === "done") {
    // already with Optima: same reply as Optima's own "repeat": true. Point the job at the student's current tests row if it changed.
    if (sub.test_id != null && job.test_id !== sub.test_id) await admin.from("optima_jobs").update({ test_id: sub.test_id }).eq("id", job.id).eq("user_id", user.id);
    return json({ job_id: job.id, status: job.status === "sent" ? "received" : job.status === "done" ? "ready" : job.status, notebook_url: job.notebook_url, repeat: true });
  } else if (job.status === "sending" && now - Date.parse(job.attempted_at) < SENDING_RETRY_AFTER_MS) {
    return json({ error: "This test is already being sent. Give it a minute.", job_id: job.id }, 409);
  } else {
    // failed, or 'sending' for more than 5 minutes (the function died): try again on the same row
    await admin.from("optima_jobs").update({ status: "sending", error: null, attempted_at: iso(), question_count: sub.questionCount, ...(sub.test_id != null ? { test_id: sub.test_id } : {}) }).eq("id", job.id).eq("user_id", user.id);
  }

  // 4. Optima
  const res = await optimaSubmit({ url: PARTNER_URL, key: PARTNER_KEY }, payload);
  if (res.ok) {
    const d = res.data;
    await admin.from("optima_jobs").update({
      status: d.status, submission_id: d.submission_id, notebook_url: d.notebook_url, error: null,
      last_checked_at: iso(), completed_at: d.status === "ready" ? iso() : null,
    }).eq("id", job.id).eq("user_id", user.id);
    return json({ job_id: job.id, status: d.status, notebook_url: d.notebook_url, repeat: d.repeat });
  }

  // 5. Failure: remember a short code (never the payload) so the student can send again.
  await admin.from("optima_jobs").update({ status: "failed", error: res.code.slice(0, 60) }).eq("id", job.id).eq("user_id", user.id);
  console.error("optima submit failed", res.httpStatus, res.code); // codes only: never the test, never the key
  const fail = (error: string, status: number) => json({ error, code: res.code, job_id: job.id }, status);
  if (res.httpStatus === 400) return fail(`Optima could not read this test${res.detail ? `: ${res.detail}` : "."}`, 422);
  if (res.httpStatus === 413) return fail("This test is too big to send (over 2 MB).", 413);
  if (res.httpStatus === 429) return fail("Optima's daily limit for new tests was reached. Try again tomorrow.", 429);
  if (res.httpStatus === 401 || res.httpStatus === 405 || res.code === "not_configured") return fail("The analysis service is not set up correctly on our side. Your score is saved.", 502);
  return fail("Optima did not respond. Try again in a few minutes.", 502);
});
