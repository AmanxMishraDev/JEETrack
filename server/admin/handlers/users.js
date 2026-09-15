import { sbRosterQuery } from '../lib/supabase.js';
import { validate, schemas } from '../lib/validation.js';
import { classLabel, coachingLabel, sourceLabel } from '../lib/labels.js';

export default async function users(req, res) {
  const v = validate(schemas.users, req.query);
  if (!v.ok) return res.status(400).json({ error: v.error });
  const { page, pageSize, search, class_year: classFilter, coaching: coachFilter, referral_source: sourceFilter, sort: sortBy, dir } = v.data;
  const sortDir = dir === 'asc' ? 1 : -1;

  const offset = page * pageSize;
  const { rows, total } = await sbRosterQuery({
    search, classFilter, coachFilter, sourceFilter, sortBy, sortDir,
    offset, limit: pageSize,
  });

  const usersOut = rows.map(u => ({
    id:            u.id,
    name:          u.name,
    email:         u.email,
    class:         classLabel(u.class_year),
    class_year:    u.class_year,
    target_year:   u.target_year,
    coaching:      coachingLabel(u.coaching),
    coaching_id:   u.coaching,
    source:        sourceLabel(u.referral_source),
    source_id:     u.referral_source,
    created_at:    u.created_at,
    last_active:   u.last_active_at,
    email_reports: u.email_reports,
  }));

  return res.status(200).json({
    users: usersOut,
    count: total,
    page,
    pageSize,
    next: offset + pageSize < total,
  });
}
