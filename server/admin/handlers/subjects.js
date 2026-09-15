import { sbCount } from '../lib/supabase.js';

export default async function subjects(req, res) {
  const [phys, chem, math] = await Promise.all([
    sbCount('hours', 'subject=eq.physics').catch(() => 0),
    sbCount('hours', 'subject=eq.chemistry').catch(() => 0),
    sbCount('hours', 'subject=eq.maths').catch(() => 0),
  ]);
  return res.status(200).json([
    { subject: 'physics',   count: phys },
    { subject: 'chemistry', count: chem },
    { subject: 'maths',     count: math },
  ]);
}
