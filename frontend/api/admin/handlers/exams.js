import { sbCount } from '../lib/supabase.js';

export default async function exams(req, res) {
  const [mains, advanced] = await Promise.all([
    sbCount('tests', 'exam=eq.mains').catch(() => 0),
    sbCount('tests', 'exam=eq.advanced').catch(() => 0),
  ]);
  return res.status(200).json([
    { exam: 'mains',    count: mains },
    { exam: 'advanced', count: advanced },
  ]);
}
