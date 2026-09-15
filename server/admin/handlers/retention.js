import { sbQuery } from '../lib/supabase.js';
import { cached, buildRoster } from '../lib/cache.js';
import { dateFrom, toISTDateKey } from '../lib/dates.js';

export default async function retention(req, res) {
  const roster = await buildRoster();
  if (!roster.length) return res.status(200).json({ d1: 0, d7: 0, d30: 0, cohorts: [] });

  const [allTests, allHours] = await cached('retention_raw', 60000, () => Promise.all([
    sbQuery(`tests?select=user_id,date&date=gte.${dateFrom(45)}`).catch(() => []),
    sbQuery(`hours?select=user_id,date&date=gte.${dateFrom(45)}`).catch(() => []),
  ]));


  const userDates = {};
  [...allTests, ...allHours].forEach(r => {
    if (!r.date) return;
    if (!userDates[r.user_id]) userDates[r.user_id] = new Set();
    userDates[r.user_id].add(r.date);
  });


  const d1Users = [], d7Users = [], d30Users = [];
  let d1Eligible = 0, d7Eligible = 0, d30Eligible = 0;

  const now = new Date();
  roster.forEach(u => {
    if (!u.created_at) return;
    const signup = new Date(u.created_at);
    const daysSinceSignup = Math.floor((now - signup) / 86400000);
    const dates = userDates[u.id] || new Set();

    const wasActiveOnDay = (n) => {
      const target = new Date(signup);
      target.setDate(target.getDate() + n);
      return dates.has(toISTDateKey(target));
    };

    if (daysSinceSignup >= 1)  { d1Eligible++;  if (wasActiveOnDay(1))  d1Users.push(u.id); }
    if (daysSinceSignup >= 7)  { d7Eligible++;  if (wasActiveOnDay(7))  d7Users.push(u.id); }
    if (daysSinceSignup >= 30) { d30Eligible++; if (wasActiveOnDay(30)) d30Users.push(u.id); }
  });

  return res.status(200).json({
    d1:  d1Eligible  ? Math.round(d1Users.length  / d1Eligible  * 100) : 0,
    d7:  d7Eligible  ? Math.round(d7Users.length  / d7Eligible  * 100) : 0,
    d30: d30Eligible ? Math.round(d30Users.length / d30Eligible * 100) : 0,
    d1Eligible, d7Eligible, d30Eligible,
  });
}
