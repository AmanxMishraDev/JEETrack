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

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.jeetrack.in",
  "Access-Control-Allow-Headers": "content-type, x-razorpay-signature",
};

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
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
              amount: payment.amount ? payment.amount / 100 : null,
              currency: payment.currency || "INR",
              razorpay_order_id: payment.order_id || null,
              razorpay_payment_id: payment.id,
              status: eventType === "payment.captured" ? "paid" : "failed",
              display_name: displayName,
              show_publicly: showPublicly,
              email: email,
            }),
          });
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
