// 📁 FILE LOCATION: supabase/functions/create-razorpay-order/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Creates a Razorpay order server-side, so the donation amount can never be
// tampered with from the client. Requires two secrets to be set on this
// project (Dashboard -> Edge Functions -> Secrets, or `supabase secrets set`):
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET
//
// display_name/show_publicly are stashed in the Razorpay order's `notes` so
// that razorpay-webhook (which fires from Razorpay's servers with no client
// context) can still write the correct Hall-of-Support preferences instead
// of clobbering them with nulls on its upsert.

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

Deno.serve(async (req: Request) => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, display_name, show_publicly } = await req.json();

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 1 || amount > 100000) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      return new Response(JSON.stringify({ error: "Payments are not configured yet" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = btoa(`${keyId}:${keySecret}`);
    const amountPaise = Math.round(amount * 100);
    const safeDisplayName = typeof display_name === "string" ? display_name.slice(0, 60) : "";
    const safeShowPublicly = show_publicly !== false;

    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `coffee_${Date.now()}`,
        notes: {
          source: "jeetrack_buy_me_coffee",
          display_name: safeDisplayName,
          show_publicly: String(safeShowPublicly),
        },
      }),
    });

    const order = await orderRes.json();

    if (!orderRes.ok) {
      console.error("Razorpay order creation failed:", order);
      return new Response(JSON.stringify({ error: order?.error?.description || "Order creation failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-razorpay-order error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
