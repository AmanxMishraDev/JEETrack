import { sbRpc } from '../lib/supabase.js';
import { classLabel, coachingLabel, sourceLabel } from '../lib/labels.js';

export default async function demographics(req, res) {
  const raw = await sbRpc('admin_demographics');
  const byDim = { class: {}, coaching: {}, year: {}, source: {} };
  let total = 0;

  raw.forEach(r => {
    const dim = r.dimension;
    if (!byDim[dim]) return;
    const label = dim === 'class'    ? classLabel(r.label)
                : dim === 'coaching' ? coachingLabel(r.label)
                : dim === 'source'   ? sourceLabel(r.label)
                : (r.label || 'Not Set');
    byDim[dim][label] = (byDim[dim][label] || 0) + Number(r.cnt);
    if (dim === 'class') total += Number(r.cnt);
  });

  const toArr = (obj) => Object.entries(obj)
    .map(([label, count]) => ({ label, count, pct: total ? Math.round((count/total)*1000)/10 : 0 }))
    .sort((a, b) => b.count - a.count);

  return res.status(200).json({
    total,
    classes:   toArr(byDim.class),
    coachings: toArr(byDim.coaching),
    years:     toArr(byDim.year),
    sources:   toArr(byDim.source),
  });
}
