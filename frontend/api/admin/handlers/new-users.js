import { sbAuthListAllUsers } from '../lib/supabase.js';
import { cached } from '../lib/cache.js';
import { toISTDateKey } from '../lib/dates.js';

export default async function newUsers(req, res) {
  const days = parseInt(req.query.days || '7');
  const authUsers = await cached('all_auth_users', 300000, () => sbAuthListAllUsers().catch(() => []));
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);


  const byDay = {};
  authUsers.forEach(u => {
    if (!u.created_at) return;
    const d = new Date(u.created_at);
    if (d < cutoff) return;
    const key = toISTDateKey(d);
    byDay[key] = (byDay[key] || 0) + 1;
  });


  const labels = [], values = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = toISTDateKey(d);
    labels.push(key);
    values.push(byDay[key] || 0);
  }

  const total = values.reduce((a, b) => a + b, 0);
  const avg   = days > 0 ? Math.round((total / days) * 10) / 10 : 0;
  const peak  = Math.max(...values, 0);
  const peakDay = labels[values.indexOf(peak)] || null;

  return res.status(200).json({ labels, values, total, avg, peak, peakDay });
}
