#!/usr/bin/env node
/**
 * Auto-bumps sw.js's CACHE_VERSION based on the actual content of the
 * app-shell files. Run this as a build/predeploy step — never by hand.
 *
 * Why content-hash instead of a timestamp or a manually-incremented number:
 *   - If app.js/index.html/styles.css genuinely didn't change, the hash
 *     stays identical, so the SW file's bytes don't change either, and the
 *     browser correctly sees "no update" — no pointless re-install.
 *   - If any of them changed even slightly, the hash changes, sw.js's bytes
 *     change, and every browser picks up the new SW (and therefore the new
 *     app.js) on next load instead of silently serving a stale cached copy.
 *
 * This only touches local files at build time. It never calls Supabase or
 * any other network service, so it adds zero database/API load.
 *
 * Usage: node scripts/bump-sw-version.js
 * Wire it into your deploy as a "build" or "predeploy" step (see notes below).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..'); // adjust if this script lives elsewhere
const FILES_TO_HASH = ['app.js', 'index.html', 'styles.css'];
const SW_PATH = path.join(ROOT, 'sw.js');

function hashFiles(files) {
  const hash = crypto.createHash('sha256');
  for (const f of files) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) {
      console.warn(`[bump-sw-version] Warning: ${f} not found at ${p}, skipping`);
      continue;
    }
    hash.update(fs.readFileSync(p));
  }
  return hash.digest('hex').slice(0, 12); // 12 hex chars is plenty of entropy
}

function bumpVersion() {
  if (!fs.existsSync(SW_PATH)) {
    console.error(`[bump-sw-version] sw.js not found at ${SW_PATH}`);
    process.exit(1);
  }

  const newHash = hashFiles(FILES_TO_HASH);
  const newVersion = `jeetrack-v${newHash}`;

  let swContent = fs.readFileSync(SW_PATH, 'utf8');
  const versionLineRe = /const CACHE_VERSION = '[^']*';/;

  if (!versionLineRe.test(swContent)) {
    console.error('[bump-sw-version] Could not find CACHE_VERSION line in sw.js — did its format change?');
    process.exit(1);
  }

  const updated = swContent.replace(versionLineRe, `const CACHE_VERSION = '${newVersion}';`);

  if (updated === swContent) {
    console.log(`[bump-sw-version] No change — app-shell content hash unchanged (${newVersion})`);
    return;
  }

  fs.writeFileSync(SW_PATH, updated, 'utf8');
  console.log(`[bump-sw-version] sw.js CACHE_VERSION updated to ${newVersion}`);
}

bumpVersion();
