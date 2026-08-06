// 📁 FILE LOCATION: supabase/functions/verify-razorpay-payment/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Verifies a Razorpay payment signature server-side (never trust the client's
// word that a payment succeeded) and logs it to the `donations` table using
// the service-role key. Requires RAZORPAY_KEY_SECRET to be set as a secret.
//
// Note: the razorpay-webhook function is the source-of-truth confirmation
// (fires even if the user's browser closes right after paying). This
// function gives the user instant feedback in the UI; both write to the
// same `donations` row via an upsert on razorpay_payment_id, so calling
// this twice (e.g. an accidental retry) never creates a duplicate.
//
// After a verified payment, this also looks up the supporter's resulting
// PERMANENT badge tier (their highest-ever contribution, via the
// get_my_badge() RPC function) and returns it, so the client shows the true
// tier rather than just what this one payment would imply.

const ALLOWED_ORIGINS = [
  "https://www.jeetrack.in",
  "https://jeetrack.in",
  "https://development.jeetrack.in",
];

function corsHeadersFor(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function tierForAmount(amount: number): string {
  if (amount >= 999) return "Elite Supporter";
  if (amount >= 499) return "Gold Supporter";
  if (amount >= 199) return "Silver Supporter";
  if (amount >= 99) return "Bronze Supporter";
  return "Supporter";
}

Deno.serve(async (req: Request) => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      user_id,
      display_name,
      show_publicly,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ verified: false, error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
      return new Response(JSON.stringify({ verified: false, error: "Payments are not configured yet" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(keySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`)
    );
    const expectedSignature = toHex(sigBuffer);

    const verified = expectedSignature === razorpay_signature;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    let permanentBadge: string | null = null;

    try {
      if (supabaseUrl && serviceKey) {
        await fetch(`${supabaseUrl}/rest/v1/donations?on_conflict=razorpay_payment_id`, {
          method: "POST",
          headers: {
            "apikey": serviceKey,
            "Authorization": `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
          },
          body: JSON.stringify({
            user_id: user_id || null,
            amount: amount || null,
            razorpay_order_id,
            razorpay_payment_id,
            status: verified ? "paid" : "signature_mismatch",
            display_name: typeof display_name === "string" ? display_name.slice(0, 60) : null,
            show_publicly: show_publicly !== false,
          }),
        });

        // Look up the supporter's true permanent badge (highest-ever amount)
        // via the get_my_badge() RPC function, so the celebration screen
        // reflects reality, not just this one payment.
        if (verified && user_id) {
          const lookupRes = await fetch(`${supabaseUrl}/rest/v1/rpc/get_my_badge`, {
            method: "POST",
            headers: {
              "apikey": serviceKey,
              "Authorization": `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ p_user_id: user_id }),
          });
          if (lookupRes.ok) {
            const rows = await lookupRes.json();
            permanentBadge = rows?.[0]?.badge_tier || null;
          }
        }
      }
    } catch (logErr) {
      console.error("donations log/badge-lookup error (non-fatal):", logErr);
    }

    if (!verified) {
      return new Response(JSON.stringify({ verified: false, error: "Signature mismatch" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        verified: true,
        badge_tier: permanentBadge || tierForAmount(amount || 0),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("verify-razorpay-payment error:", e);
    return new Response(JSON.stringify({ verified: false, error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
