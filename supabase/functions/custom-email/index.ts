import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY       = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "https://admin.jeetrack.in",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const body = await req.json();
    const { type, subject, html, to_user_ids, to_emails, from_name, preview_only } = body;

    if (!subject?.trim()) return new Response(JSON.stringify({ error: "Subject required" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    if (!html?.trim())    return new Response(JSON.stringify({ error: "Body required" }),    { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });

    // ── Resolve recipients ───────────────────────────────────
    let recipients: { email: string; name: string }[] = [];

    if (to_emails?.length) {
      recipients = to_emails.map((e: string) => ({ email: e.trim(), name: e.split("@")[0] }));
    } else if (to_user_ids?.length) {
      for (const uid of to_user_ids) {
        try {
          const { data } = await supabase.auth.admin.getUserById(uid);
          if (data?.user?.email) recipients.push({ email: data.user.email, name: data.user.user_metadata?.full_name || data.user.email.split("@")[0] });
        } catch (_) {}
      }
    } else if (type === "all_active") {
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
      const { data: prefs } = await supabase.from("user_preferences").select("user_id").gte("last_active_at", cutoff.toISOString());
      for (const p of prefs || []) {
        try {
          const { data } = await supabase.auth.admin.getUserById(p.user_id);
          if (data?.user?.email) recipients.push({ email: data.user.email, name: data.user.user_metadata?.full_name || data.user.email.split("@")[0] });
        } catch (_) {}
      }
    } else if (type === "all") {
      const { data: prefs } = await supabase.from("user_preferences").select("user_id");
      for (const p of prefs || []) {
        try {
          const { data } = await supabase.auth.admin.getUserById(p.user_id);
          if (data?.user?.email) recipients.push({ email: data.user.email, name: data.user.user_metadata?.full_name || data.user.email.split("@")[0] });
        } catch (_) {}
      }
    }

    if (!recipients.length) return new Response(JSON.stringify({ error: "No recipients found" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });

    if (preview_only) {
      return new Response(JSON.stringify({ preview: true, recipients: recipients.slice(0, 5), total: recipients.length }),
        { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // ── Email wrapper ────────────────────────────────────────
    const wrap = (name: string, bodyHtml: string) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;color:#f0eff5">
<div style="max-width:580px;margin:0 auto;padding:24px 16px">
  <div style="text-align:center;padding:28px 0 20px">
    <div style="font-size:26px;font-weight:900;letter-spacing:-0.5px">JEE<span style="background:linear-gradient(135deg,#a695ff,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Track</span></div>
  </div>
  <div style="background:#111118;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:24px 28px;margin-bottom:16px;font-size:15px;line-height:1.7;color:#e8e8f0">
    ${bodyHtml.replace(/\{\{name\}\}/g, name)}
  </div>
  <div style="text-align:center;margin:20px 0">
    <a href="https://jeetrack.in" style="background:linear-gradient(135deg,#7c6af7,#f472b6);color:#fff;text-decoration:none;padding:13px 30px;border-radius:10px;font-weight:700;font-size:14px;display:inline-block">Open JEETrack →</a>
  </div>
  <div style="text-align:center;padding:20px 0;border-top:1px solid rgba(255,255,255,0.06)">
    <div style="font-size:12px;color:#4a4960;line-height:1.8">JEETrack · Built for serious JEE aspirants<br><a href="https://jeetrack.in" style="color:#4a4960">jeetrack.in</a></div>
  </div>
</div></body></html>`;

    // ── Send in batches ──────────────────────────────────────
    const from = `${from_name || "JEETrack"} <noreply@jeetrack.in>`;
    let sent = 0, failed = 0, failedEmails: string[] = [];

    for (let i = 0; i < recipients.length; i += 10) {
      const batch = recipients.slice(i, i + 10);
      await Promise.all(batch.map(async (r) => {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from,
              to: [r.email],
              subject: subject.replace(/\{\{name\}\}/g, r.name),
              html: wrap(r.name, html),
            }),
          });
          if (res.ok) { sent++; } else { failed++; failedEmails.push(r.email); }
        } catch (_) { failed++; failedEmails.push(r.email); }
      }));
      if (i + 10 < recipients.length) await new Promise(r => setTimeout(r, 300));
    }

    return new Response(JSON.stringify({ ok: true, sent, failed, total: recipients.length, failedEmails: failedEmails.slice(0, 10) }),
      { headers: { ...CORS, "Content-Type": "application/json" } });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
