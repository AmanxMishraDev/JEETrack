# Changelog

All notable changes to JEETrack are recorded here, newest first.

---

## 🚀 v2.4.0 — Sep 22, 2026 — Hardening & Scalability

A behind-the-scenes release. Nothing changes in how the app looks or feels — this is about making JEETrack more reliable, secure, and easier to maintain as it grows.

### ✅ Testing
- Added a full automated test suite (Vitest + Deno), covering:
  - Admin authentication (valid, expired, tampered, and missing tokens)
  - Login rate limiting (lockout, per-IP scoping, safe fallback if the rate-limit service is down)
  - The Razorpay payment webhook (signature verification, duplicate-payment protection, no double receipt emails)
  - Every input validation schema (rejects malformed data instead of silently accepting it)
  - Database query performance (guards the indexes that keep lookups fast as user data grows)

### 🧱 Code Organization
- Split the admin API from one large file into clean, purpose-built modules — pure refactor, zero behavior change, verified with a side-by-side equivalence test across every action
- Added a real frontend build pipeline (Vite) — smaller, faster-loading bundles via code-splitting and smarter browser caching
- Synced the live database (indexes, functions) back into the codebase, so what's running in production now matches what's in the repo

### 🔒 Security & Abuse Prevention
- Added rate limiting to login and to the donation/payment endpoints
- Added daily write quotas to study-data sync, so one account can't overwhelm the system
- Added input validation (Zod) to admin and payment endpoints, rejecting malformed requests instead of silently accepting them
- Fixed a live vulnerability where a badge-lookup function trusted a client-supplied user ID
- Locked down two internal functions that were unintentionally publicly callable
- Added Cloudflare Turnstile (CAPTCHA) and a login attempt cooldown to signup/login

### ⚡ Performance
- Reduced backend load by moving several rate limiters off the primary database and trimming a write-heavy internal table

---

## 💜 v2.3.0 — Aug 10, 2026 — Supporter Program

A new way to support JEETrack and help keep it free for every aspirant.

### ✨ What's New
- 💜 **Support JEETrack** — optional contributions via Razorpay
- 🏅 **Permanent Supporter Badges**
- ❤️ **Hall of Support**
- 📊 **Community Impact stats**
- 💬 **Private supporter notes**
- 👤 **Guest support** + badge claiming

### Other Updates
- 📱 Improved mobile Settings UI/UX
- 🔒 Updated Privacy Policy & Terms of Service
- 📧 Improved payment receipt and email flow

JEETrack remains free for every aspirant. Thank you for supporting JEETrack. 💜

---

## 🚀 v2.2.1 — Aug 6, 2026 — Reliability & Performance

Focused on reliability, performance, and overall user experience. Study sessions are now more resilient, the dashboard is faster, and several reported issues have been resolved.

### ✨ What's New
- ⏱️ **Persistent Study Timer** — survives app closures, browser refreshes, and device restarts without losing progress
- 👋 **Welcome Back Recovery** — returning after leaving a running timer? Choose to continue, save, or discard the elapsed session
- 📖 **Improved Recent Entries** — recent study logs now correctly show your latest activity, independent of dashboard filters
- 🔕 **Smarter Permission Prompts** — added a "Don't show again" option for notification and email report prompts
- ⚡ **Performance Improvements** — optimized Study Hours calculations and rendering, especially for large study histories
- 📋 **Dashboard Fixes** — fixed the Pending To-Do View button not responding
- 🔄 **More Reliable Sync** — improved background sync and data saving when closing or backgrounding the app
- 🛠️ **Bug Fixes & Stability** — various internal fixes for a more stable, responsive app

---

## 🚀 v2.1.3 — Jul 23, 2026 — Customization

A small update focused on usability, customization, and overall experience.

### ✨ What's New
- 📝 **Custom Syllabus Chapters** — add your own chapters in the Syllabus section to track anything you want
- 📋 **Improved Test Table** — added row limits for cleaner handling of long test lists
- 🎨 **UI & UX Improvements** — refined layouts and spacing for a smoother experience
- ⚡ **Performance Optimizations** — minor fixes to improve stability and responsiveness

---

## 🚀 v2.1.2 — Jul 21, 2026 — Workflow Improvements

Quality improvements, performance optimizations, and features inspired by community feedback.

### ✨ What's New
- 🎯 **Improved Practice Log Experience** — logging a custom number of practice questions is faster and more intuitive
- 📝 **Log Scheduled Mock Tests from the Dashboard** — add scheduled mock test details directly on the day, based on community feedback ❤️
- 💬 **Testimonials on the Landing Page** — showcases what students are saying, manageable from the Admin Dashboard
- 📊 **Feature Usage Statistics** — the landing page now shows feature usage counts for new visitors
- ⚡ **Performance Improvements** — faster, smoother experience across the platform

---

## 🚀 v2.1.1 — Jul 19, 2026 — Practice Log

Focused on one of the most requested features from the community, plus several usability improvements.

### ✨ What's New
- 📚 **Practice Log (Highly Requested)** — log question practice chapter-wise directly from the syllabus
  - Track every practice session effortlessly
  - View detailed practice analytics
  - Monitor progress by subject, chapter, weekly, monthly, and all-time
  - Stay consistent with a dedicated Practice Dashboard
- ⚡ **Smoother Experience** — faster, more responsive navigation and interactions
- 💬 **Testimonials Section** — added to the landing page
- 🛠️ **Better Admin Experience** — improved feedback management, easier to monitor and respond to user feedback

### 🐞 Improvements
- UI/UX refinements across the application
- Better responsiveness and overall polish
- Multiple performance optimizations and bug fixes

---

## 🚀 v2.1.0 — Jul 15, 2026 — Study & Mock Improvements

Major improvements to study tracking, mock analysis, editing capabilities, and a refreshed app experience.

### ✨ What's New
- 🎨 **Refreshed Branding** — new JEETrack logo, new app icon, new splash screen for a cleaner, more modern first impression

  <p align="center">
    <img src="https://www.jeetrack.in/favicon.png" alt="JEETrack logo" width="160"/>
  </p>

- 📊 **Mock Analysis Study Hours** — a new Mock Analysis category in Study Hours lets you log time spent analyzing mocks separately, for a more accurate picture of your preparation
- 📝 **Recent Study Hour Entries** — view your 30 most recent logs, edit incorrect ones, delete unwanted entries
- ✏️ **Edit Mock Tests** — mock tests are now editable after submission (score, details, and other recorded info)

### 🛠 Improvements
- Improved overall user experience
- Better consistency across the app
- Minor UI refinements and optimizations

---

## 🚀 v2.0.1 — Jul 4, 2026 — Landing Page & Feedback

Focused on improving the overall experience, making study tracking more flexible, and introducing new pages to help users understand JEETrack.

### ✨ What's New
- 🎨 **Landing Page Redesigned** — cleaner, more modern UI/UX, with an interactive demo screen for new users
- ⏱ **Improved Study Hours Tracking** — added a built-in study timer, plus the ability to manually log study time in minutes
- 📖 **New About Page** — the story behind JEETrack and the vision driving the project
- ⚡ **New Features Page** — a dedicated page showcasing everything JEETrack offers
- 💬 **Built-in Feedback System** — rate any feature with a 5-star rating ⭐⭐⭐⭐⭐, or share suggestions/bug reports in writing

### 🚀 Performance & Optimization
- Improved overall site performance
- Better responsiveness across devices
- General UI polish and optimization
