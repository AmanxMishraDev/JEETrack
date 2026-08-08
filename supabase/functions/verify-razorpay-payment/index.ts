// 📁 FILE LOCATION: supabase/functions/verify-razorpay-payment/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Verifies a Razorpay payment signature server-side (never trust the client's
// word that a payment succeeded). Requires RAZORPAY_KEY_SECRET as a secret.
//
// SPEED: signature verification is pure crypto (no network) and the response
// is sent back the moment that's done — the `donations` write happens via
// EdgeRuntime.waitUntil() AFTER the response is returned, so the client
// never waits on a database round trip. The badge tier returned here is a
// fast client-side computation from the amount; the client separately
// re-checks for the true PERMANENT (highest-ever) tier a couple seconds
// later via check-payment-status.
//
// email is stored so a guest supporter (user_id null) can later claim this
// row by signing in with the same address (see claim_guest_donations()).
//
// razorpay-webhook is still the redundant source-of-truth write (fires from
// Razorpay's servers even if this function's background write or the user's
// browser fails for any reason).

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
      email,
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
    if (supabaseUrl && serviceKey) {
      const writePromise = fetch(`${supabaseUrl}/rest/v1/donations?on_conflict=razorpay_payment_id`, {
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
          email: typeof email === "string" ? email.slice(0, 120) : null,
        }),
      }).then((res) => {
        if (!res.ok) {
          res.text().then((t) => console.error("donations background write failed:", res.status, t));
        }
      }).catch((e) => console.error("donations background write error:", e));

      // @ts-ignore EdgeRuntime is a Supabase/Deno Deploy global, not in std types
      if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
        // @ts-ignore
        EdgeRuntime.waitUntil(writePromise);
      }
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
        badge_tier: tierForAmount(amount || 0),
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
