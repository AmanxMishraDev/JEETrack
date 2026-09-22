// Run with: deno test --allow-env supabase/functions/razorpay-webhook/index.test.ts
//
// Not run by `npm test` / Vitest — this is Deno runtime code (Deno.serve,
// Deno.env, the `jsr:` import), same reasoning eslint.config.js already
// uses to lint this folder separately via `deno lint`. I could not execute
// this file myself: no Deno install and no network access to jsr.io/
// deno.land in my environment. Please run `deno test` yourself (or add it
// as its own CI step, same idea as the existing deno lint step) before
// trusting this suite.
import { assertEquals, assertNotEquals } from "jsr:@std/assert";
import { handleRequest } from "./index.ts";

const SECRET = "test-webhook-secret";

async function sign(body: string, secret = SECRET): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function withEnv(vars: Record<string, string>, fn: () => Promise<void>) {
  return async () => {
    const prev: Record<string, string | undefined> = {};
    for (const k of Object.keys(vars)) prev[k] = Deno.env.get(k);
    for (const [k, v] of Object.entries(vars)) Deno.env.set(k, v);
    try {
      await fn();
    } finally {
      for (const k of Object.keys(vars)) {
        if (prev[k] === undefined) Deno.env.delete(k);
        else Deno.env.set(k, prev[k]!);
      }
    }
  };
}

const capturedPaymentEvent = JSON.stringify({
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: "pay_test123",
        order_id: "order_test123",
        amount: 49900,
        currency: "INR",
        notes: { display_name: "Test Donor", show_publicly: "true", email: "donor@example.com" },
      },
    },
  },
});

Deno.test(
  "valid signature: returns 200 {ok:true} and upserts (not inserts) the donation",
  withEnv({ RAZORPAY_WEBHOOK_SECRET: SECRET, SUPABASE_URL: "https://fake.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "fake-key" }, async () => {
    const calls: { url: string; opts: RequestInit }[] = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = ((url: string, opts: RequestInit) => {
      calls.push({ url: String(url), opts });
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    }) as typeof fetch;

    try {
      const sig = await sign(capturedPaymentEvent);
      const req = new Request("https://x/razorpay-webhook", {
        method: "POST",
        headers: { "x-razorpay-signature": sig },
        body: capturedPaymentEvent,
      });
      const res = await handleRequest(req);
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(body.ok, true);

      // Replay protection lives in the upsert semantics: sending the same
      // payment twice must merge into the same row, never insert a second
      // one — this is what actually makes Razorpay's automatic retries safe.
      const donationUpsert = calls.find((c) => c.url.includes("/donations"));
      assertNotEquals(donationUpsert, undefined);
      assertEquals(String(donationUpsert!.url).includes("on_conflict=razorpay_payment_id"), true);
      assertEquals(String((donationUpsert!.opts.headers as Record<string, string>)["Prefer"]).includes("merge-duplicates"), true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
);

Deno.test(
  "missing signature header: rejected with 400, no database call made",
  withEnv({ RAZORPAY_WEBHOOK_SECRET: SECRET }, async () => {
    let fetchCalled = false;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => { fetchCalled = true; return Promise.resolve(new Response("{}")); }) as typeof fetch;
    try {
      const req = new Request("https://x/razorpay-webhook", { method: "POST", body: capturedPaymentEvent });
      const res = await handleRequest(req);
      assertEquals(res.status, 400);
      assertEquals(fetchCalled, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
);

Deno.test(
  "tampered signature (wrong secret): rejected with 400",
  withEnv({ RAZORPAY_WEBHOOK_SECRET: SECRET }, async () => {
    const wrongSig = await sign(capturedPaymentEvent, "not-the-real-secret");
    const req = new Request("https://x/razorpay-webhook", {
      method: "POST",
      headers: { "x-razorpay-signature": wrongSig },
      body: capturedPaymentEvent,
    });
    const res = await handleRequest(req);
    assertEquals(res.status, 400);
  }),
);

Deno.test(
  "tampered body (signature was computed for a different payload): rejected with 400",
  withEnv({ RAZORPAY_WEBHOOK_SECRET: SECRET }, async () => {
    const sig = await sign(capturedPaymentEvent); // sign the original body
    const tamperedBody = capturedPaymentEvent.replace('"amount":49900', '"amount":100'); // then send a different one
    const req = new Request("https://x/razorpay-webhook", {
      method: "POST",
      headers: { "x-razorpay-signature": sig },
      body: tamperedBody,
    });
    const res = await handleRequest(req);
    assertEquals(res.status, 400);
  }),
);

Deno.test(
  "replay of an already-processed captured payment does not send a second receipt email",
  withEnv({ RAZORPAY_WEBHOOK_SECRET: SECRET, SUPABASE_URL: "https://fake.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "fake-key", RESEND_API_KEY: "fake-resend-key" }, async () => {
    let resendCalled = false;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = ((url: string) => {
      const u = String(url);
      if (u.includes("api.resend.com")) { resendCalled = true; return Promise.resolve(new Response("{}")); }
      if (u.includes("email_sent=eq.false")) {
        // Simulate: this is a REPLAY — a prior request already flipped
        // email_sent to true, so the conditional PATCH matches zero rows.
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify([{}]), { status: 200 }));
    }) as typeof fetch;

    try {
      const sig = await sign(capturedPaymentEvent);
      const req = new Request("https://x/razorpay-webhook", {
        method: "POST",
        headers: { "x-razorpay-signature": sig },
        body: capturedPaymentEvent,
      });
      const res = await handleRequest(req);
      assertEquals(res.status, 200);
      assertEquals(resendCalled, false); // the whole point of the atomic flip
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
);

Deno.test(
  "webhook secret not configured: fails closed with 503, not silently accepting",
  withEnv({}, async () => {
    Deno.env.delete("RAZORPAY_WEBHOOK_SECRET");
    const req = new Request("https://x/razorpay-webhook", { method: "POST", body: capturedPaymentEvent });
    const res = await handleRequest(req);
    assertEquals(res.status, 503);
  }),
);

Deno.test(
  "OPTIONS preflight is answered without touching signature verification",
  async () => {
    const req = new Request("https://x/razorpay-webhook", { method: "OPTIONS" });
    const res = await handleRequest(req);
    assertEquals(res.status, 200);
  },
);
