// 📁 FILE LOCATION: supabase/functions/razorpay-webhook/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Razorpay Webhook — the source-of-truth confirmation for a payment,
// independent of whether the user's browser stayed open after paying.
// Configure in Razorpay Dashboard -> Account & Settings -> Webhooks:
//   URL: https://yskoeapemjuyyvkhlbpm.supabase.co/functions/v1/razorpay-webhook
//   Events: payment.captured, payment.failed
// Requires secret: RAZORPAY_WEBHOOK_SECRET (the secret you set when adding
// the webhook in the dashboard — different from RAZORPAY_KEY_SECRET).
//
// display_name/show_publicly/email are read from payment.notes (set at
// order creation in create-razorpay-order) so this upsert never clobbers
// the supporter's Hall-of-Support preferences or guest-claim email with
// nulls.
//
// RECEIPT EMAIL: on a captured (successful) payment, this atomically flips
// donations.email_sent false->true via a conditional UPDATE and only sends
// a receipt if THIS request is the one that flipped it — so Razorpay's
// webhook retries (they retry on any non-2xx or timeout) can never send a
// duplicate receipt. Uses the same RESEND_API_KEY secret as custom-email.

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.jeetrack.in",
  "Access-Control-Allow-Headers": "content-type, x-razorpay-signature",
};

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Keep in sync with get_hall_of_support()'s badge_tier CASE in Postgres.
function tierForAmount(amount: number): string {
  if (amount >= 499) return "Diamond Supporter";
  if (amount >= 199) return "Gold Supporter";
  if (amount >= 99) return "Silver Supporter";
  return "Bronze Supporter";
}

function receiptHtml(opts: { name: string; amount: number; paymentId: string; date: string; tier: string }): string {
  const { name, amount, paymentId, date, tier } = opts;
  return `
  <div style="background:#0a0a0f;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
    <div style="max-width:480px;margin:0 auto;background:#111118;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,.08)">
      <div style="background:linear-gradient(135deg,#7c6af7,#f472b6);padding:28px 24px;text-align:center">
        <div style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.02em">JEETrack</div>
        <div style="font-size:13px;color:rgba(255,255,255,.85);margin-top:4px">Thank you for your support ❤️</div>
      </div>
      <div style="padding:28px 24px">
        <p style="color:#f0eff5;font-size:15px;line-height:1.6;margin:0 0 20px">Hi ${name},</p>
        <p style="color:#8b899e;font-size:14px;line-height:1.7;margin:0 0 24px">Your contribution to JEETrack was successful. It genuinely helps keep JEETrack free for every JEE aspirant — thank you.</p>
        <div style="background:#16161f;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:18px 20px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;padding:6px 0;color:#8b899e;font-size:13px"><span>Amount</span><span style="color:#f0eff5;font-weight:700">₹${amount}</span></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;color:#8b899e;font-size:13px"><span>Badge earned</span><span style="color:#f472b6;font-weight:700">${tier}</span></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;color:#8b899e;font-size:13px"><span>Date</span><span style="color:#f0eff5">${date}</span></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;color:#8b899e;font-size:13px"><span>Payment ID</span><span style="color:#f0eff5;font-family:monospace;font-size:11px">${paymentId}</span></div>
        </div>
        <a href="https://www.jeetrack.in/hall-of-support" style="display:block;text-align:center;background:linear-gradient(135deg,#7c6af7,#f472b6);color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px;border-radius:12px">See the Hall of Support</a>
        <p style="color:#4a4960;font-size:12px;line-height:1.6;margin:20px 0 0;text-align:center">Questions? Reply to this email or write to support@jeetrack.in</p>
      </div>
    </div>
  </div>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return new Response("Webhook not configured", { status: 503 });
    }

    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(rawBody));
    const expectedSignature = toHex(sigBuffer);

    if (expectedSignature !== signature) {
      console.error("Webhook signature mismatch");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === "payment.captured" || eventType === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      if (payment) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const notes = payment.notes || {};
        const displayName = typeof notes.display_name === "string" && notes.display_name.length > 0
          ? notes.display_name.slice(0, 60)
          : null;
        const showPublicly = notes.show_publicly !== "false";
        const email = typeof notes.email === "string" && notes.email.length > 0
          ? notes.email.slice(0, 120)
          : null;
        const amount = payment.amount ? payment.amount / 100 : 0;

        if (supabaseUrl && serviceKey) {
          // Upsert on razorpay_payment_id so this never creates a duplicate row
          // alongside the one verify-razorpay-payment may have already written.
          await fetch(`${supabaseUrl}/rest/v1/donations?on_conflict=razorpay_payment_id`, {
            method: "POST",
            headers: {
              "apikey": serviceKey,
              "Authorization": `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
              "Prefer": "resolution=merge-duplicates,return=minimal",
            },
            body: JSON.stringify({
              amount: amount || null,
              currency: payment.currency || "INR",
              razorpay_order_id: payment.order_id || null,
              razorpay_payment_id: payment.id,
              status: eventType === "payment.captured" ? "paid" : "failed",
              display_name: displayName,
              show_publicly: showPublicly,
              email: email,
            }),
          });

          // ── Receipt email (captured payments only) ──
          // Atomic flip: only the request that successfully flips email_sent
          // false->true sends the email. Prevents duplicate receipts if
          // Razorpay retries this webhook.
          if (eventType === "payment.captured" && email) {
            try {
              const resendKey = Deno.env.get("RESEND_API_KEY");
              if (resendKey) {
                const flipRes = await fetch(
                  `${supabaseUrl}/rest/v1/donations?razorpay_payment_id=eq.${encodeURIComponent(payment.id)}&email_sent=eq.false&status=eq.paid`,
                  {
                    method: "PATCH",
                    headers: {
                      "apikey": serviceKey,
                      "Authorization": `Bearer ${serviceKey}`,
                      "Content-Type": "application/json",
                      "Prefer": "return=representation",
                    },
                    body: JSON.stringify({ email_sent: true }),
                  }
                );
                const flipped = flipRes.ok ? await flipRes.json() : [];
                if (flipped.length > 0) {
                  const name = displayName || email.split("@")[0];
                  const tier = tierForAmount(amount);
                  const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
                  await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${resendKey}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      from: "JEETrack <noreply@jeetrack.in>",
                      to: [email],
                      subject: `Your JEETrack support receipt — ₹${amount}`,
                      html: receiptHtml({ name, amount, paymentId: payment.id, date, tier }),
                    }),
                  });
                }
              }
            } catch (emailErr) {
              console.error("receipt email error (non-fatal):", emailErr);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("razorpay-webhook error:", e);
    return new Response("Server error", { status: 500 });
  }
});
