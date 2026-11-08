// optima-status: asks Optima whether the student's test is in their error notebook yet ("received" -> "ready").
// Called by the JEETrack app when the tests page opens / the tab is shown again, and by the extension popup. No timers, no cron:
// each job is checked at most once a minute, and only the caller's own jobs are ever looked at.
import { createClient } from "npm:@supabase/supabase-js@2";
import { cors, json, isUuid, optimaStatus, studentId, STATUS_MIN_INTERVAL_MS } from "../_shared/optima-lib.ts";

const env = (k: string) => Deno.env.get(k) ?? "";
const MAX_PER_CALL = 10;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const PARTNER_URL = env("OPTIMA_PARTNER_URL"), PARTNER_KEY = env("OPTIMA_PARTNER_KEY"), ANON_SALT = env("ANON_SALT");
  if (!PARTNER_URL || !PARTNER_KEY || !ANON_SALT) return json({ error: "Analysis is not set up yet." }, 503);
  const admin = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Missing Authorization header." }, 401);
  const { data: auth, error: authErr } = await admin.auth.getUser(token);
  const user = auth?.user;
  if (authErr || !user) return json({ error: "Invalid or expired session." }, 401);

  // optional: only these jobs (ids are filtered by user_id below, so another student's id simply matches nothing)
  let ids: string[] | null = null;
  try {
    const b = await req.json();
    if (Array.isArray(b?.job_ids)) ids = b.job_ids.filter(isUuid).slice(0, 20);
  } catch { /* no body = all of my pending jobs */ }

  let q = admin.from("optima_jobs").select("id,test_id,status,pw_test_id,attempt_title,notebook_url,last_checked_at")
    .eq("user_id", user.id).in("status", ["received", "sent"]).not("pw_test_id", "is", null);
  if (ids) q = q.in("id", ids);
  const { data: rows, error } = await q.order("created_at", { ascending: false }).limit(MAX_PER_CALL);
  if (error) return json({ error: "Could not read your jobs." }, 500);

  const now = Date.now(), iso = () => new Date().toISOString();
  const due = (rows ?? []).filter((r: any) => !r.last_checked_at || now - Date.parse(r.last_checked_at) >= STATUS_MIN_INTERVAL_MS);
  const student = await studentId(ANON_SALT, user.id, env("OPTIMA_ID_PREFIX") || "jt_");
  const out: Record<string, { id: string; test_id: number | null; status: string; notebook_url: string | null }> = {};
  for (const r of rows ?? []) out[r.id] = { id: r.id, test_id: r.test_id, status: r.status === "sent" ? "received" : r.status, notebook_url: r.notebook_url };

  await Promise.all(due.map(async (r: any) => {
    const res = await optimaStatus({ url: PARTNER_URL, key: PARTNER_KEY }, student, r.pw_test_id, r.attempt_title);
    const patch: Record<string, unknown> = { last_checked_at: iso() };
    if (res.ok) {
      patch.status = res.data.status;
      if (res.data.notebook_url) patch.notebook_url = res.data.notebook_url;
      if (res.data.status === "ready") patch.completed_at = iso();
    } else if (res.httpStatus === 404) {
      Object.assign(patch, { status: "failed", error: "not_found" }); // Optima has no record: the student can send again
    } else {
      console.error("optima status failed", res.httpStatus, res.code); // transient: keep the status, retry next time
    }
    await admin.from("optima_jobs").update(patch).eq("id", r.id).eq("user_id", user.id);
    out[r.id] = { id: r.id, test_id: r.test_id, status: (patch.status as string) ?? out[r.id].status, notebook_url: (patch.notebook_url as string) ?? r.notebook_url };
  }));

  return json({ checked: due.length, jobs: Object.values(out) });
});
