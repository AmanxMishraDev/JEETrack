export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url         = process.env.SUPABASE_URL;
  const key         = process.env.SUPABASE_ANON_KEY;
  const posthogKey  = process.env.POSTHOG_KEY;
  const posthogHost = process.env.POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!url || !key) {
    return res.status(500).json({ error: 'Supabase env vars not configured' });
  }

  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ url, key, posthogKey, posthogHost });
}
