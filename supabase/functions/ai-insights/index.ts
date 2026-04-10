// =====================================================
// JEETrack — AI Insights Edge Function
// File: supabase/functions/ai-insights/index.ts
//
// Deploy: supabase functions deploy ai-insights
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const ALLOWED_ORIGIN = Deno.env.get("APP_URL") || "https://jeetracklive.netlify.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: corsHeaders,
    });
  }

  // ── Verify user is authenticated ──
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: corsHeaders,
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Invalid session. Please sign in again." }), {
      status: 401, headers: corsHeaders,
    });
  }

  // ── Get prompt from request ──
  let prompt: string;
  try {
    const body = await req.json();
    prompt = body.prompt;
    if (!prompt || typeof prompt !== "string" || prompt.length < 10) {
      throw new Error("Invalid prompt");
    }
    if (prompt.length > 8000) {
      return new Response(JSON.stringify({ error: "Prompt too long" }), {
        status: 400, headers: corsHeaders,
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400, headers: corsHeaders,
    });
  }

  // ── Call Groq — key stays on server ──
  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2200,
        temperature: 0.65,
        messages: [
          {
            role: "system",
            content: "You are an expert JEE coaching analyst. Always respond with valid JSON only. No markdown fences, no preamble, no explanation — just the raw JSON object.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.json().catch(() => ({}));
      console.error("Groq error:", errBody);
      return new Response(
        JSON.stringify({ error: { message: "AI service unavailable. Try again." } }),
        { status: 502, headers: corsHeaders }
      );
    }

    const data = await groqRes.json();
    return new Response(JSON.stringify(data), { headers: corsHeaders });

  } catch (e) {
    console.error("Unexpected error:", e);
    return new Response(
      JSON.stringify({ error: { message: "Something went wrong. Please try again." } }),
      { status: 500, headers: corsHeaders }
    );
  }
});