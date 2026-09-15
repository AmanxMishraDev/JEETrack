// All user-facing dates in JEETrack (signup timestamps included) are meant
// to be bucketed by IST calendar day, since that's where the users are.
// `toISOString().split('T')[0]` gives the UTC date instead, which silently
// shifts any event between 00:00-05:29 IST onto the previous day's bucket
// (that window is 18:30-23:59 UTC the day before) — this was causing
// "new users per day" (and D1/D7/D30 retention, which compares against
// IST-local `date` strings from hours/tests) to look wrong for signups or
// checks landing in that window.
export function toISTDateKey(date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // en-CA => YYYY-MM-DD
}

export function toISTMonthKey(date) {
  return toISTDateKey(date).slice(0, 7);
}

export function dateFrom(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISTDateKey(d);
}
