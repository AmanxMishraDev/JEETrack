// ── Supporter Badge (Settings/Profile) ──
// Reads the current user's badge via the get_my_badge() SECURITY DEFINER
// function (same underlying data as the Support page's Hall of Support).
// Read-only, does not touch save()/sync logic below.
// Premium shield badge (SVG, no external assets) — must match the 4-tier
// system in get_hall_of_support() / support.html / hall-of-support.html.
// ── SupporterBadge — premium layered SVG shield badge, reusable across the app ──
// Usage: SupporterBadge('bronze'|'silver'|'gold'|'diamond', size)  — also accepts
// the full label ('Bronze Supporter', etc.) for drop-in compatibility with data
// coming straight from get_hall_of_support() / get_my_badge().
const SUPPORTER_BADGE_TIERS = {
  bronze: {
    label: 'Bronze Supporter',
    glow: '201,133,63',
    stops: ['#f6d6a5', '#d99a4e', '#8a5623'],
    rim: '#f9e2bb',
    emblemStops: ['#7a4c24', '#3d2410'],
    iconFill: '#fff6e9',
    iconStroke: '#5c3818',
    sparkCount: 3,
    tickCount: 8,
  },
  silver: {
    label: 'Silver Supporter',
    glow: '183,193,212',
    stops: ['#f6f8fc', '#c7d0e0', '#828da2'],
    rim: '#eef2f9',
    emblemStops: ['#4a5062', '#20232b'],
    iconFill: '#ffffff',
    iconStroke: '#3a3f4a',
    sparkCount: 3,
    tickCount: 10,
  },
  gold: {
    label: 'Gold Supporter',
    glow: '230,177,45',
    stops: ['#fff2c2', '#eab429', '#8f6708'],
    rim: '#fff5cc',
    emblemStops: ['#8f6708', '#4a3403'],
    iconFill: '#fffbe9',
    iconStroke: '#6b4c05',
    sparkCount: 4,
    tickCount: 12,
  },
  diamond: {
    label: 'Diamond Supporter',
    glow: '141,159,247',
    glow2: '195,150,250',
    stops: ['#f2fcff', '#a9def5', '#8296f2', '#6a5bd0'],
    rim: '#eefcff',
    emblemStops: ['#4f43a8', '#211c4d'],
    iconFill: '#ffffff',
    iconStroke: '#3a2f80',
    sparkCount: 6,
    tickCount: 16,
    premium: true,
  },
};
const SUPPORTER_BADGE_LABEL_TO_KEY = {
  'Bronze Supporter': 'bronze', 'Silver Supporter': 'silver',
  'Gold Supporter': 'gold', 'Diamond Supporter': 'diamond',
};

const SUPPORTER_BADGE_SHIELD_OUTER = 'M64 13 C83.5 13 102 20.7 112.3 28.4 C114.4 30 116 32.3 116 35.1 L116 79.5 C116 109.3 97.3 130.3 64 143 C30.7 130.3 12 109.3 12 79.5 L12 35.1 C12 32.3 13.6 30 15.7 28.4 C26 20.7 44.5 13 64 13 Z';
const SUPPORTER_BADGE_SHIELD_INNER = 'M64 18.5 C81.5 18.5 98 25.7 107.3 32.9 C109 34.2 110.1 36 110.1 38.2 L110.1 78.7 C110.1 104.7 93.2 123.6 64 135.3 C34.8 123.6 17.9 104.7 17.9 78.7 L17.9 38.2 C17.9 36 19 34.2 20.7 32.9 C30 25.7 46.5 18.5 64 18.5 Z';

// Points roughly tracing SHIELD_OUTER's silhouette (12 stops around the
// perimeter), used to scatter small rivet studs along the rim.
const SUPPORTER_BADGE_RIM_POINTS = [
  [64, 14.2], [83, 17.5], [100.5, 26.5], [114.3, 34.5],
  [115, 56], [115, 79.5], [104, 104], [82, 123.5],
  [64, 141.5], [46, 123.5], [24, 104], [13, 79.5],
  [13, 56], [13.7, 34.5], [27.5, 26.5], [45, 17.5],
];

const SUPPORTER_BADGE_ICONS = {
  bronze:
    '<path d="M64 47 L67.53 57.15 78.27 57.36 69.71 63.85 72.82 74.14 64 68 55.18 74.14 58.29 63.85 49.73 57.36 60.47 57.15 Z" fill="none" stroke-opacity=".5" stroke-width="1"/>' +
    '<path d="M64 47.5 L67.4 57.3 77.8 57.4 69.4 63.8 72.5 73.5 64 67.6 55.5 73.5 58.6 63.8 50.2 57.4 60.6 57.3 Z"/>',
  silver:
    '<path d="M64 46 78 58 64 78 50 58 Z"/>' +
    '<path d="M50 58 78 58 M64 46 64 78" fill="none" stroke-width=".7" stroke-opacity=".7"/>',
  gold:
    '<path d="M54 49 H74 V58 C74 65 69.8 70 64 70 C58.2 70 54 65 54 58 Z M62 70 H66 V75 H62 Z"/>' +
    '<path d="M57 77.5 H71" stroke-width="3" stroke-linecap="round" fill="none"/>' +
    '<path d="M54 51 C48 51 47 58 52 60.5 M74 51 C80 51 81 58 76 60.5" fill="none" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M58 73 C52 75 47 73 45 68 M47 70 C44 68.5 43.5 65 45 62 M49 64.5 C47 63 46.5 60.5 47.5 58.5 M70 73 C76 75 81 73 83 68 M81 70 C84 68.5 84.5 65 83 62 M79 64.5 C81 63 81.5 60.5 80.5 58.5" fill="none" stroke="#fffbe9" stroke-opacity=".8" stroke-width="1.5" stroke-linecap="round"/>',
  diamond:
    '<path d="M64 42 82 58 64 82 46 58 Z"/>' +
    '<path d="M46 58 H82 M54 58 64 42 74 58 M54 58 64 82 M74 58 64 82 M59 58 64 50 69 58" fill="none" stroke-width=".7" stroke-opacity=".85"/>' +
    '<path d="M58 49 64 42 70 49 64 54Z" fill-opacity=".9"/>' +
    '<path d="M64 30 V37 M64 87 V94 M40 62 H33 M95 62 H88" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".55"/>',
};

function SupporterBadge(tier, size){
  size = size || 28;
  const key = SUPPORTER_BADGE_TIERS[tier] ? tier : (SUPPORTER_BADGE_LABEL_TO_KEY[tier] || 'bronze');
  const t = SUPPORTER_BADGE_TIERS[key];
  const uid = 'sb' + Math.random().toString(36).slice(2, 9);
  const glowId = uid + 'g', mainId = uid + 'm', rimId = uid + 'r', sheenId = uid + 's', embId = uid + 'e', dropId = uid + 'd', blurId = uid + 'b', clipId = uid + 'c';

  const stopsCount = t.stops.length;
  const mainStops = t.stops.map((c, i) => `<stop offset="${Math.round(i / (stopsCount - 1) * 100)}%" stop-color="${c}"/>`).join('');

  const glow2 = t.glow2
    ? `<circle class="b-glow" cx="64" cy="78" r="60" fill="rgba(${t.glow2},.20)" filter="url(#${blurId})"/>`
    : '';

  // Rivet studs along the shield rim — density scales with tier prestige.
  const rivetStep = Math.max(1, Math.round(SUPPORTER_BADGE_RIM_POINTS.length / (t.tickCount / 2)));
  let rivets = '';
  for (let i = 0; i < SUPPORTER_BADGE_RIM_POINTS.length; i += rivetStep) {
    const [rx, ry] = SUPPORTER_BADGE_RIM_POINTS[i];
    rivets += `<circle cx="${rx}" cy="${ry}" r="1.15" fill="${t.rim}" fill-opacity=".55"/>`;
  }

  // Sunburst tick ring around the emblem plate — count scales with tier.
  let ticks = '';
  for (let i = 0; i < t.tickCount; i++) {
    const ang = (i / t.tickCount) * Math.PI * 2;
    const x1 = 64 + Math.cos(ang) * 27, y1 = 62 + Math.sin(ang) * 27;
    const x2 = 64 + Math.cos(ang) * 29.6, y2 = 62 + Math.sin(ang) * 29.6;
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${t.rim}" stroke-opacity=".5" stroke-width="1" stroke-linecap="round"/>`;
  }

  const sparkPositions = [
    [20, 34], [110, 40], [16, 96], [112, 92], [64, 8], [96, 118],
  ];
  let sparks = '';
  for (let i = 0; i < t.sparkCount; i++) {
    const [sx, sy] = sparkPositions[i];
    const r = i % 2 === 0 ? 2.1 : 1.4;
    const delay = (i * 0.55).toFixed(2);
    sparks += `<path class="b-spark" style="opacity:.3;animation-delay:${delay}s;transform-box:fill-box;transform-origin:center" d="M${sx} ${sy - r}L${sx + r * 0.35} ${sy - r * 0.35}L${sx + r} ${sy}L${sx + r * 0.35} ${sy + r * 0.35}L${sx} ${sy + r}L${sx - r * 0.35} ${sy + r * 0.35}L${sx - r} ${sy}L${sx - r * 0.35} ${sy - r * 0.35}Z" fill="${t.rim}"/>`;
  }

  return `<svg width="${size}" height="${Math.round(size * 148 / 128)}" viewBox="0 0 128 148" aria-hidden="true" style="flex-shrink:0;display:block;overflow:visible">
<defs>
  <radialGradient id="${glowId}" cx="50%" cy="52%" r="55%"><stop offset="0%" stop-color="rgba(${t.glow},.55)"/><stop offset="100%" stop-color="rgba(${t.glow},0)"/></radialGradient>
  <linearGradient id="${mainId}" x1="20%" y1="0%" x2="85%" y2="100%">${mainStops}</linearGradient>
  <linearGradient id="${rimId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${t.rim}"/><stop offset="100%" stop-color="${t.stops[t.stops.length - 1]}"/></linearGradient>
  <radialGradient id="${sheenId}" cx="32%" cy="20%" r="45%"><stop offset="0%" stop-color="#ffffff" stop-opacity=".55"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  <radialGradient id="${embId}" cx="42%" cy="38%" r="65%"><stop offset="0%" stop-color="${t.emblemStops[0]}"/><stop offset="100%" stop-color="${t.emblemStops[1]}"/></radialGradient>
  <filter id="${blurId}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="${dropId}" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="1.4" stdDeviation="1.3" flood-color="#000" flood-opacity=".38"/></filter>
  <clipPath id="${clipId}"><path d="${SUPPORTER_BADGE_SHIELD_INNER}"/></clipPath>
</defs>

<circle class="b-glow" cx="64" cy="78" r="52" fill="url(#${glowId})" filter="url(#${blurId})"/>
${glow2}

<path d="${SUPPORTER_BADGE_SHIELD_OUTER}" fill="url(#${rimId})"/>
<g filter="url(#${dropId})">
  <path d="${SUPPORTER_BADGE_SHIELD_INNER}" fill="url(#${mainId})"/>
</g>
<path d="${SUPPORTER_BADGE_SHIELD_INNER}" fill="url(#${sheenId})" clip-path="url(#${clipId})"/>
<path d="${SUPPORTER_BADGE_SHIELD_INNER}" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="1"/>
<g clip-path="url(#${clipId})">${rivets}</g>

<g stroke="${t.emblemStops[1]}">${ticks}</g>
<circle cx="64" cy="62" r="25" fill="url(#${embId})"/>
<circle cx="64" cy="62" r="25" fill="none" stroke="${t.emblemStops[1]}" stroke-opacity=".7" stroke-width="1"/>
<circle cx="64" cy="62" r="25" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1" transform="translate(0,-0.8)"/>

<g fill="${t.iconFill}" stroke="${t.iconStroke}" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" filter="url(#${dropId})">
  ${SUPPORTER_BADGE_ICONS[key]}
</g>

${sparks}
</svg>`;
}

// Backward-compatible alias — existing call sites pass full labels like
// 'Diamond Supporter' straight from the database.
function badgeSvg(tierLabel, size){ return SupporterBadge(tierLabel, size); }


let currentSupporterBadgeTier = null; // cached so the av-menu popover can render instantly on open

function renderSupporterBadgeChip(iconElId, wrapElId, tier, size){
  const wrap = document.getElementById(wrapElId);
  const icon = document.getElementById(iconElId);
  if(!wrap || !icon) return;
  if(tier){
    icon.innerHTML = badgeSvg(tier, size);
    wrap.setAttribute('data-badge-name', tier);
    wrap.style.display = 'flex';
  } else {
    wrap.style.display = 'none';
  }
}

function loadSupporterBadge(){
  if(!sb || !currentUser) return;
  sb.rpc('get_my_badge', { p_user_id: currentUser.id }).maybeSingle()
    .then(({ data }) => {
      currentSupporterBadgeTier = (data && data.badge_tier) || null;
      localStorage.setItem(CACHED_BADGE_TIER_KEY, currentSupporterBadgeTier || '');
      renderSupporterBadgeChip('settings-supporter-badge-emoji', 'settings-supporter-badge', currentSupporterBadgeTier, 20);
      renderSupporterBadgeChip('avMenuBadgeIcon', 'avMenuBadge', currentSupporterBadgeTier, 18);
    })
    .catch(() => {});
}

// Activity heartbeat — replaces the old per-write DB trigger on hours/tests
// (that trigger fired on every single save and forced a full user_preferences
// row rewrite just to bump a timestamp). Now decoupled from data writes
// entirely: pings at most once per calendar day (local date), only while
// the tab is visible and the user is logged in. Fire-and-forget, no UI,
// no effect on save speed. Day-granularity means no periodic timer is
// needed at all — the local-date check on visibilitychange is enough.
let _activityHeartbeatStarted = false;
const LAST_PING_DATE_KEY = 'jt_last_ping_date';
function _todayLocal(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function startActivityHeartbeat(){
  if(_activityHeartbeatStarted || !sb || !currentUser) return;
  _activityHeartbeatStarted = true;
  const ping = () => {
    if(!sb || !currentUser || document.visibilityState !== 'visible') return;
    const today = _todayLocal();
    if(localStorage.getItem(LAST_PING_DATE_KEY) === today) return; // already pinged today
    localStorage.setItem(LAST_PING_DATE_KEY, today);
    sb.auth.getSession().then(({ data }) => {
      if(data?.session) Promise.resolve(sb.rpc('ping_activity')).catch(()=>{});
    }).catch(()=>{});
  };
  ping();
  document.addEventListener('visibilitychange', ping);
}

// Claims any guest (not-logged-in) donations made under this account's
// email — e.g. someone bought a chai before signing in, using the same
// email their JEETrack account uses. Safe to call every login: it's a
// no-op once already claimed (claim_guest_donations() only matches rows
// with user_id still NULL).
//
// Both this and get_my_badge() (inside loadSupporterBadge) used to run on
// EVERY single app-load with zero caching — unlike get_full_state, which
// skips its fetch entirely when nothing changed. That made this pair the
// single biggest combined DB time consumer in production (>12%), ahead of
// get_full_state itself, purely from running unconditionally on every
// load. A donation/badge status realistically changes at most once in a
// blue moon, so — same reasoning as the activity heartbeat — this only
// needs day-granularity: check the DB once per calendar day, and on every
// other load that same day, render straight from the cached tier with no
// network call at all.
const LAST_BADGE_CHECK_DATE_KEY = 'jt_last_badge_check_date';
const CACHED_BADGE_TIER_KEY = 'jt_cached_badge_tier';
function claimGuestDonationsAndLoadBadge(){
  if(!sb || !currentUser){ loadSupporterBadge(); return; }
  const today = _todayLocal();
  if(localStorage.getItem(LAST_BADGE_CHECK_DATE_KEY) === today){
    // Already checked the DB today — render from cache, no network call.
    currentSupporterBadgeTier = localStorage.getItem(CACHED_BADGE_TIER_KEY) || null;
    renderSupporterBadgeChip('settings-supporter-badge-emoji', 'settings-supporter-badge', currentSupporterBadgeTier, 20);
    renderSupporterBadgeChip('avMenuBadgeIcon', 'avMenuBadge', currentSupporterBadgeTier, 18);
    return;
  }
  localStorage.setItem(LAST_BADGE_CHECK_DATE_KEY, today);
  sb.rpc('claim_guest_donations')
    .then(({ data: claimedCount }) => {
      if(claimedCount && claimedCount > 0 && typeof toast === 'function'){
        toast('🎉 Found a previous support contribution — added to your profile!', 'success');
      }
      loadSupporterBadge();
    })
    .catch(() => {
      localStorage.removeItem(LAST_BADGE_CHECK_DATE_KEY); // let it retry next load, not stuck for the rest of the day
      loadSupporterBadge();
    });
}

