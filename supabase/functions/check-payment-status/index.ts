// 📁 FILE LOCATION: supabase/functions/check-payment-status/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Resilience net for the payment flow: the client's Razorpay `handler`
// callback can fail to fire (bfcache back-navigation after the "redirecting
// in 4s" interstitial, backgrounded UPI app-switch, browser killing the tab,
// etc.) even though the payment succeeded and razorpay-webhook already wrote
// it to `donations`. The frontend stores the pending order_id locally and,
// on every page load/return (including bfcache restores via `pageshow`),
// calls this to check the real server-side status — so the success/badge
// UI shows up even if the in-page JS callback never ran.
//
// Only ever returns: paid (bool), amount, badge_tier — never raw donation
// rows, payment ids, or anything else.

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
    const { order_id, user_id } = await req.json();
    if (!order_id || typeof order_id !== "string") {
      return new Response(JSON.stringify({ error: "Missing order_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ paid: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/donations?razorpay_order_id=eq.${encodeURIComponent(order_id)}&status=eq.paid&select=amount&limit=1`,
      {
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
        },
      }
    );

    if (!res.ok) {
      return new Response(JSON.stringify({ paid: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = await res.json();
    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ paid: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = rows[0].amount || 0;
    let badgeTier = tierForAmount(amount);

    if (user_id) {
      try {
        const badgeRes = await fetch(`${supabaseUrl}/rest/v1/rpc/get_my_badge`, {
          method: "POST",
          headers: {
            "apikey": serviceKey,
            "Authorization": `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ p_user_id: user_id }),
        });
        if (badgeRes.ok) {
          const badgeRows = await badgeRes.json();
          if (badgeRows?.[0]?.badge_tier) badgeTier = badgeRows[0].badge_tier;
        }
      } catch (_e) { /* fall back to tierForAmount */ }
    }

    return new Response(JSON.stringify({ paid: true, amount, badge_tier: badgeTier }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("check-payment-status error:", e);
    return new Response(JSON.stringify({ paid: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
