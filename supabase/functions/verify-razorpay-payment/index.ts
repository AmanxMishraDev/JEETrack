import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Verifies a Razorpay payment signature server-side (never trust the client's
// word that a payment succeeded) and logs it to the `donations` table using
// the service-role key. Requires RAZORPAY_KEY_SECRET to be set as a secret.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, user_id } = await req.json();

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

    // Log the donation attempt (service role bypasses RLS; this table has no
    // client-facing policies by design).
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && serviceKey) {
        await fetch(`${supabaseUrl}/rest/v1/donations`, {
          method: "POST",
          headers: {
            "apikey": serviceKey,
            "Authorization": `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            user_id: user_id || null,
            amount: amount || null,
            razorpay_order_id,
            razorpay_payment_id,
            status: verified ? "paid" : "signature_mismatch",
          }),
        });
      }
    } catch (logErr) {
      console.error("donations log error (non-fatal):", logErr);
    }

    if (!verified) {
      return new Response(JSON.stringify({ verified: false, error: "Signature mismatch" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ verified: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify-razorpay-payment error:", e);
    return new Response(JSON.stringify({ verified: false, error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
