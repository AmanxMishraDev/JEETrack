// 📁 FILE LOCATION: supabase/functions/create-razorpay-order/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Creates a Razorpay order server-side, so the donation amount can never be
// tampered with from the client. Requires two secrets to be set on this
// project (Dashboard -> Edge Functions -> Secrets, or `supabase secrets set`):
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET
//
// display_name/show_publicly/email are stashed in the Razorpay order's
// `notes` so that razorpay-webhook (which fires from Razorpay's servers with
// no client context) can still write the correct Hall-of-Support preferences
// and the guest-claim email instead of clobbering them with nulls on its
// upsert.

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

// This endpoint has no auth requirement at all (donations can be made as a
// guest), so IP is the only identity signal available — matches the
// per-IP-for-anonymous-endpoints strategy from the hardening roadmap.
// Supabase's gateway populates x-forwarded-for with the real client IP
// (see https://supabase.com/docs/guides/functions/examples/cloudflare-turnstile
// for the same pattern used elsewhere in Supabase's own docs).
function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}

// Backed by Upstash Redis, not Postgres — this fires on every request to
// a public, no-auth endpoint, so keeping it off the database entirely
// avoids adding load to the free-tier Database IO budget for a check
// that's pure "have we seen this IP too much," not real app data.
// Requires UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN secrets (set
// via `supabase secrets set` or Dashboard -> Edge Functions -> Secrets).
// Fails OPEN (allows the request) if those aren't set or the check
// errors: a transient network blip should never be able to block real
// donations, and Razorpay's own order-level idempotency plus the
// amount/signature checks downstream are the real backstop anyway.
const RATE_LIMIT_SCRIPT = "local c = redis.call('INCR', KEYS[1]); if c == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end; return c";

async function checkRateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const upstashUrl = Deno.env.get("UPSTASH_REDIS_REST_URL");
  const upstashToken = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");
  if (!upstashUrl || !upstashToken) return true;
  try {
    const res = await fetch(upstashUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["EVAL", RATE_LIMIT_SCRIPT, "1", key, String(windowSeconds)]),
    });
    if (!res.ok) return true;
    const { result } = await res.json();
    return result <= max;
  } catch {
    return true;
  }
}

Deno.serve(async (req: Request) => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const allowed = await checkRateLimit(`razorpay-order:${clientIp(req)}`, 30, 3600);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { amount, display_name, show_publicly, email } = await req.json();

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
    const safeEmail = typeof email === "string" ? email.slice(0, 120) : "";

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
          email: safeEmail,
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
