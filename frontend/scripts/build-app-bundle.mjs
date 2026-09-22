// Regenerates frontend/js/app/main.generated.js (core) and
// frontend/public/dashboard-bundle.generated.js (dashboard-only, lazy
// loaded). Run automatically as part of `npm run build` — never edit
// either generated file by hand, they're build artifacts (gitignored).
//
// Why two bundles: everything needed for a landing-page-only visit (auth
// boot, login/signup forms, landing page marketing/demo) is small and
// must load immediately. Everything needed only once a user is actually
// logged in (all dashboard page renderers, sync engine, settings,
// onboarding, badges, feedback — formerly a ~4,800-line inline <script>
// plus 6 of the 10 app.js chunks, all loaded unconditionally on every
// single page view regardless of whether the visitor ever logs in) is
// much bigger and is now fetched only when initSupabase() actually
// confirms a session (see loadDashboardBundle() in app-01-boot-auth.js).
//
// The core bundle is a real ES module (Vite requires one as its entry),
// so it needs the same window.x = x exposure trick as before — external
// callers (onclick="...", index.html's own inline scripts) can't see a
// module's top-level scope. The dashboard bundle is deliberately NOT a
// module — it's dynamically injected as a plain classic <script> (see
// loadScript() in index.html), so its top-level declarations become
// window properties automatically, the same way dashboard-controller.js
// always worked. No exposure step needed for it at all.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.join(__dirname, '..', 'js', 'app');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const CORE_ORDER = [
  'app-00-routing.js',
  'app-01-boot-auth.js',
  'app-02-auth-forms.js',
  'app-06-landing.js',
  'app-07-landing-interactions.js',
];

const DASHBOARD_ORDER = [
  'dashboard-controller.js',
  'app-03-shell-data.js',
  'app-04-badges.js',
  'app-05-sync-engagement.js',
  'app-08-onboarding.js',
  'app-09-settings.js',
  'app-10-feedback.js',
];

function readAll(names) {
  return names.map(f => fs.readFileSync(path.join(APP_DIR, f), 'utf8')).join('');
}

function splitTopLevelNames(declBody) {
  const names = [];
  let depth = 0, current = '';
  for (const ch of declBody) {
    if ('{[('.includes(ch)) depth++;
    if ('}])'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) {
      names.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  names.push(current);
  return names
    .map(seg => seg.trim().match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/)?.[1])
    .filter(Boolean);
}

function stripLineComment(line) {
  let inStr = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === inStr) inStr = null;
    } else if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
    } else if (ch === '/' && line[i + 1] === '/') {
      return line.slice(0, i);
    }
  }
  return line;
}

function collectDeclarations(combined) {
  // Functions and `const` bindings are never reassigned after their module
  // finishes evaluating, so a one-time `window.x = x` snapshot is correct
  // for them. `let`/`var` bindings ARE reassigned later — often from async
  // code (auth callbacks, save queues) — and since this file is loaded as
  // an ES module, a snapshot would capture only their initial value and
  // silently go stale the moment the module reassigns them internally.
  // Those need a live two-way binding instead (see the exposure step
  // below) so window.x and the module's real x never desync.
  const snapshotNames = new Set();
  const mutableNames = new Set();
  const lines = combined.split('\n');

  for (const line of lines) {
    const fnMatch = line.match(/^(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (fnMatch) snapshotNames.add(fnMatch[1]);
  }

  for (let i = 0; i < lines.length; i++) {
    const declMatch = lines[i].match(/^(let|const|var)\s+[a-zA-Z_$]/);
    if (!declMatch) continue;
    const isMutable = declMatch[1] !== 'const';
    let depth = 0, body = '', j = i;
    for (; j < lines.length; j++) {
      const codePart = stripLineComment(lines[j]);
      for (const ch of codePart) {
        if ('{[('.includes(ch)) depth++;
        if ('}])'.includes(ch)) depth--;
      }
      body += (j > i ? '\n' : '') + lines[j];
      if (depth === 0 && /;\s*$/.test(codePart)) break;
    }
    const declBody = body.replace(/^(?:let|const|var)\s+/, '').replace(/;\s*$/, '');
    const target = isMutable ? mutableNames : snapshotNames;
    splitTopLevelNames(declBody).forEach(n => target.add(n));
    i = j;
  }
  return { snapshotNames, mutableNames };
}

// ── Core bundle (ES module, Vite-processed) ──
const coreCombined = readAll(CORE_ORDER);
const { snapshotNames, mutableNames } = collectDeclarations(coreCombined);
const snapshotExposure = [...snapshotNames].sort().map(n => `window.${n} = ${n};`).join('\n');
// Live binding: dashboard-bundle.generated.js and index.html's inline
// scripts are plain classic scripts, so THEIR reads/writes of e.g. `sb` or
// `isSaving` go straight through `window.*`. A getter/setter here keeps
// that in sync with this module's real variable in both directions —
// unlike a snapshot, external code setting `window.x = v` actually
// reassigns the module's `x`, and external code reading `window.x` always
// sees the module's current value, not the value at module-load time.
const liveExposure = [...mutableNames].sort()
  .map(n => `Object.defineProperty(window, '${n}', { get: () => ${n}, set: v => { ${n} = v; }, configurable: true });`)
  .join('\n');
const coreExposure = [snapshotExposure, liveExposure].filter(Boolean).join('\n');
const totalExposed = snapshotNames.size + mutableNames.size;
const coreBanner = `

// ── AUTO-GENERATED by scripts/build-app-bundle.mjs — do not edit directly ──
// Source of truth is frontend/js/app/${CORE_ORDER.join(', ')}.
// Regenerated on every \`npm run build\`. See that script's header comment
// for why this exists and why it's split from dashboard-bundle.generated.js.
// Functions/const above this line get a one-time window.x = x snapshot;
// let/var below get a live getter/setter binding instead (see
// collectDeclarations() above for why the two need different treatment).
${coreExposure}
`;
fs.writeFileSync(path.join(APP_DIR, 'main.generated.js'), coreCombined + coreBanner);
console.log(`[build-app-bundle] wrote main.generated.js (${totalExposed} globals exposed: ${snapshotNames.size} snapshot, ${mutableNames.size} live-bound)`);

// ── Dashboard bundle (plain classic script, lazy-loaded) ──
const dashCombined = readAll(DASHBOARD_ORDER);
// Function and var declarations in a classic script attach to `window`
// automatically — no exposure step needed. But let/const do NOT (they
// live only in the page's shared classic-script lexical scope, invisible
// to `window.x`). main.generated.js is an ES module and can't reach that
// shared scope at all, so anything it needs to read/write here (S,
// userProfile, ...) needs an explicit window binding, same treatment as
// the core bundle's own exposure above.
const { snapshotNames: dashSnapshotNames, mutableNames: dashMutableNames } = collectDeclarations(dashCombined);
const dashSnapshotExposure = [...dashSnapshotNames].sort().map(n => `window.${n} = ${n};`).join('\n');
const dashLiveExposure = [...dashMutableNames].sort()
  .map(n => `Object.defineProperty(window, '${n}', { get: () => ${n}, set: v => { ${n} = v; }, configurable: true });`)
  .join('\n');
const dashExposure = [dashSnapshotExposure, dashLiveExposure].filter(Boolean).join('\n');
const dashBanner = `

// ── AUTO-GENERATED by scripts/build-app-bundle.mjs — do not edit directly ──
// Source of truth is frontend/js/app/${DASHBOARD_ORDER.join(', ')}.
// Regenerated on every \`npm run build\`. Loaded as a plain classic script
// (not a module) via loadDashboardBundle() in app-01-boot-auth.js, once
// initSupabase() confirms a session — never on a landing-page-only visit.
// let/const declarations below are exposed to window (see comment above
// this block) so the core module can reach them; functions/var already
// work as plain globals in a classic script and don't need this.
${dashExposure}
`;
fs.writeFileSync(path.join(PUBLIC_DIR, 'dashboard-bundle.generated.js'), dashCombined + dashBanner);
console.log(`[build-app-bundle] wrote dashboard-bundle.generated.js (${(dashCombined + dashBanner).split('\n').length} lines, ${dashSnapshotNames.size + dashMutableNames.size} let/const exposed: ${dashSnapshotNames.size} snapshot, ${dashMutableNames.size} live-bound)`);
