

const CACHE_VERSION = 'jeetrack-v9';
const CACHE_NAME = CACHE_VERSION;

const STATIC_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
];


const NEVER_CACHE = [
  '/api/',
  '/api/config',
];

// Supabase's REST API responses are dynamic, per-user data (tests, hours,
// syllabus, etc.) — caching them in the SW's Cache Storage serves no real
// purpose (only read back on a network failure, which is rare) and just lets
// personal data accumulate indefinitely in browser storage. Route these
// straight through to the network, no caching, same as NEVER_CACHE above.
const SUPABASE_HOST_PATTERN = /\.supabase\.co$/;





const APP_SHELL = [
  '/index.html',
  '/app.js',
  '/styles.css',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache each file individually — if one fails (e.g. a CDN hiccup for
      // a font URL), it shouldn't take the whole install down with it, which
      // is what addAll() does (all-or-nothing). Previously APP_SHELL was
      // defined but never actually passed to addAll(), so index.html/app.js/
      // styles.css were never precached — meaning ANY offline navigation had
      // nothing to fall back to and hit the raw "Offline and no cached
      // version available" text.
      const all = [...STATIC_ASSETS, ...APP_SHELL];
      return Promise.all(all.map(url => cache.add(url).catch(() => {})));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Only ever intercept/cache plain http(s) requests. Browser extensions
  // (password managers, Grammarly, etc.) sometimes route their own requests
  // through chrome-extension:// / moz-extension:// schemes that happen to
  // pass through this handler — Cache.put() throws on those, which was
  // showing up as an uncaught rejection in the console. Let the browser
  // handle anything that isn't http(s) natively.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  
  if (NEVER_CACHE.some(p => url.pathname.startsWith(p))) {
    e.respondWith(fetch(e.request));
    return;
  }

  
  if (SUPABASE_HOST_PATTERN.test(url.hostname)) {
    // fetch(e.request) alone still lets the BROWSER's native HTTP cache
    // (separate from this SW's Cache Storage) validate against ETag/
    // Cache-Control headers and serve a 304 — which then gets treated as
    // "nothing changed" even when the underlying data genuinely has.
    // { cache: 'no-store' } forces a real network round-trip every time.
    e.respondWith(fetch(e.request, { cache: 'no-store' }));
    return;
  }

  
  
  
  if (APP_SHELL.some(p => url.pathname === p) || url.pathname === '/') {
    e.respondWith(
      fetch(e.request).catch(async () => {
        // Previously this had no .catch() at all — offline, the rejected
        // fetch promise reached respondWith() unhandled and the browser
        // showed its own generic network-error page instead of anything
        // from this app. Fall back to whichever of these three files we
        // do have cached from install.
        const cached = await caches.match(e.request) || await caches.match('/index.html');
        return cached || new Response('Offline and no cached version available', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return;
  }

  
  
  if (e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(async () => {
          // If the network fails AND we have nothing cached for this
          // request, caches.match() resolves to undefined — and
          // respondWith(undefined) throws "Failed to convert value to
          // 'Response'". Always resolve to a real Response.
          //
          // A route like '/dashboard' will never itself be in the cache
          // (this is a client-side-routed SPA — only index.html/app.js/
          // styles.css get precached) so fall back to the cached shell
          // page rather than only trying an exact-URL match.
          const cached = await caches.match(e.request) || await caches.match('/index.html');
          return cached || new Response('Offline and no cached version available', { status: 503, statusText: 'Service Unavailable' });
        })
    );
    return;
  }

  
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(e.request) || await caches.match('/index.html');
        return cached || new Response('Offline and no cached version available', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});

self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'JEETrack', {
      body: data.body || 'You have a new notification',
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: data.tag || 'jeetrack',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const client of list) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
