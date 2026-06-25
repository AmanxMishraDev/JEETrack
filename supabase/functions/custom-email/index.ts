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
    const { type, subject, html, text, to_user_ids, to_emails, from_name, preview_only, is_raw_html } = body;

    if (!subject?.trim()) return new Response(JSON.stringify({ error: "Subject required" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    if (!html?.trim() && !text?.trim()) return new Response(JSON.stringify({ error: "Body required" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });

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

    // ── Send in batches ──────────────────────────────────────
    // is_raw_html=true  → send exactly as built by the frontend (compose preset HTML or custom HTML/text)
    // is_raw_html=false/absent → also send as-is (compose mode now builds full HTML via buildEmailHTML)
    const from = `${from_name || "JEETrack"} <noreply@jeetrack.in>`;
    let sent = 0, failed = 0, failedEmails: string[] = [];

    for (let i = 0; i < recipients.length; i += 10) {
      const batch = recipients.slice(i, i + 10);
      await Promise.all(batch.map(async (r) => {
        try {
          // Determine email body — plain text or html, sent exactly as provided
          let emailPayload: Record<string, string>;
          if (text?.trim()) {
            // Plain text mode (custom plain-text email)
            emailPayload = { text: text.replace(/\{\{name\}\}/g, r.name) };
          } else {
            // HTML mode — sent as-is (frontend already built the full HTML with preset/CTA if needed)
            emailPayload = { html: (html || "").replace(/\{\{name\}\}/g, r.name) };
          }

          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from,
              to: [r.email],
              subject: subject.replace(/\{\{name\}\}/g, r.name),
              ...emailPayload,
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
