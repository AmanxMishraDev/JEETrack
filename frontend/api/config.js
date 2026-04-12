export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_ANON_KEY || '',
  });
}
