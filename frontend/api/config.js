// Vercel Serverless Function — /api/config
// Reads environment variables set in Vercel dashboard and returns them to the frontend.
// The anon key is intentionally public (it's safe to expose — Supabase Row Level Security
// is the real security layer). This just keeps credentials out of source code.

export default function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url  = process.env.SUPABASE_URL;
  const key  = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: 'Supabase env vars not configured on Vercel' });
  }

  // Cache for 1 hour — these values never change at runtime
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ url, key });
}
