---
name: Feature request
about: Suggest an idea for JEETrack
title: "[FEATURE] "
labels: enhancement
---

**What problem does this solve for a JEE aspirant using the app?**


**Proposed solution**


**Which part of the app does this touch?**
- [ ] Study/hours tracking
- [ ] Test analysis
- [ ] Syllabus tracker
- [ ] Todos / backlogs
- [ ] Admin dashboard
- [ ] Something else:

**Database IO consideration**
This app runs on Supabase's free tier with a tracked IO budget (see
`docs/PERFORMANCE.md`). If this feature adds new frequent reads/writes,
note the expected call pattern here so it can be designed cache-friendly
from the start.
