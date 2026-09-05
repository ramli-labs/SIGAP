/* ============================================================
   SIGAP — service-worker.js
   Offline-first PWA cache.
   - Precaches app shell + critical assets on install.
   - Cache-first for same-origin GET requests.
   - Navigation requests fall back to index.html.
   - NEVER returns index.html for failed script/style/image/
     media requests — those get a proper error Response.
   Bump CACHE_VERSION on every significant release.
   ============================================================ */
var CACHE_VERSION = 'sigap-v4';

var PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/fonts.css',
  './css/main.css',
  './css/components.css',
  './css/game.css',
  './css/screens.css',
  './css/case001.css',
  './css/case002.css',
  './css/case003.css',
  './css/case004.css',
  './css/ai-lab.css',
  './css/responsive.css',
  './js/storage.js',
  './js/state.js',
  './js/audio.js',
  './js/router.js',
  './js/components/toast.js',
  './js/components/modal.js',
  './js/components/dialogue.js',
  './js/components/evidence-card.js',
  './js/components/confidence-slider.js',
  './js/components/reflection.js',
  './js/components/chrome.js',
  './js/scoring.js',
  './js/data/achievements-data.js',
  './js/achievements.js',
  './js/data/missions.js',
  './js/data/dialogues.js',
  './js/data/ai-lab-data.js',
  './js/games/evidence-board.js',
  './js/games/case001.js',
  './js/games/case002.js',
  './js/games/case003.js',
  './js/games/case004.js',
  './js/games/ai-lab.js',
  './js/screens/title.js',
  './js/screens/academy.js',
  './js/screens/missions.js',
  './js/screens/report.js',
  './js/screens/teacher.js',
  './js/app.js',
  './assets/images/favicon.svg',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png',
  './assets/images/icon-maskable-512.png',
  './assets/fonts/SpaceGrotesk-400.woff2',
  './assets/fonts/SpaceGrotesk-500.woff2',
  './assets/fonts/SpaceGrotesk-700.woff2',
  './assets/fonts/IBMPlexMono-400.woff2',
  './assets/fonts/IBMPlexMono-600.woff2',
  './assets/cases/case002/plate-a.svg',
  './assets/cases/case002/plate-b.svg',
  './assets/cases/case002/plate-c.svg',
  './assets/cases/case002/plate-a.jpg',
  './assets/cases/case002/plate-b.jpg',
  './assets/cases/case002/plate-c.jpg',
  './assets/audio/aruna/case001-intro-01.mp3',
  './assets/audio/aruna/case001-intro-02.mp3',
  './assets/audio/aruna/case001-intro-03.mp3',
  './assets/audio/aruna/case002-intro-01.mp3',
  './assets/audio/aruna/case002-intro-02.mp3',
  './assets/audio/aruna/case002-intro-03.mp3',
  './assets/audio/aruna/case003-intro-01.mp3',
  './assets/audio/aruna/case003-intro-02.mp3',
  './assets/audio/aruna/case003-intro-03.mp3',
  './assets/audio/aruna/case003-outro-good-01.mp3',
  './assets/audio/aruna/case003-outro-good-02.mp3',
  './assets/audio/aruna/case003-outro-good-03.mp3',
  './assets/audio/aruna/case003-outro-retry-01.mp3',
  './assets/audio/aruna/case003-outro-retry-02.mp3',
  './assets/audio/aruna/case003-outro-retry-03.mp3',
  './assets/audio/aruna/case004-01.mp3',
  './assets/audio/aruna/case004-02.mp3',
  './assets/audio/aruna/case004-03.mp3',
  './assets/audio/aruna/case004-04.mp3',
  './assets/audio/aruna/onboarding-01.mp3',
  './assets/audio/aruna/onboarding-02.mp3',
  './assets/audio/aruna/onboarding-03.mp3',
  './assets/audio/aruna/onboarding-04.mp3',
  './assets/audio/phantom/case002-01.mp3',
  './assets/audio/phantom/case002-02.mp3',
  './assets/audio/phantom/case004-01.mp3',
  './assets/audio/phantom/case004-02.mp3',
  './assets/audio/phantom/case004-03.mp3',
  './assets/audio/phantom/case004-04.mp3',
  './assets/audio/phantom/case004-05.mp3',
  './assets/audio/phantom/case004-06.mp3',
  './assets/audio/phantom/first-contact-01.mp3',
  './assets/audio/phantom/first-contact-02.mp3',
  './assets/audio/aruna/case002-post-phantom.mp3',
  './assets/audio/aruna/case002-scanner-01.mp3',
  './assets/audio/aruna/case002-scanner-02.mp3',
  './assets/audio/aruna/case002-scanner-03.mp3',
  './assets/audio/aruna/case002-scanner-04.mp3',
  './assets/audio/aruna/case002-scanner-05.mp3',
  './assets/audio/aruna/case002-scanner-06.mp3',
  './assets/audio/aruna/case002-scanner-07.mp3',
  './assets/audio/aruna/case004-intro-01.mp3',
  './assets/audio/aruna/case004-intro-02.mp3',
  './assets/audio/aruna/case004-intro-03.mp3',
  './assets/audio/aruna/first-contact-close.mp3',
  './assets/audio/aruna/tutorial-01.mp3',
  './assets/audio/aruna/tutorial-02.mp3',
  './assets/audio/aruna/tutorial-03.mp3',
  './assets/audio/aruna/tutorial-04.mp3',
  './assets/audio/aruna/tutorial-05.mp3',
  './assets/audio/aruna/tutorial-06.mp3',
  './assets/audio/aruna/tutorial-07.mp3',
  './assets/cases/case004/suspect.mp4',
  './assets/cases/case004/reference.mp4'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      // Add files one by one so a single missing optional asset
      // does not abort the whole install.
      return Promise.all(
        PRECACHE.map(function (url) {
          return cache.add(url).catch(function () { /* optional asset missing */ });
        })
      );
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_VERSION; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never intercept cross-origin

  // Navigations: cache-first, then network, then index.html shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
          }
          return res;
        }).catch(function () {
          return caches.match('./index.html');
        });
      })
    );
    return;
  }

  // Subresources: cache-first, network fallback, and on total failure a
  // typed error response — NEVER the HTML shell.
  event.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        var dest = req.destination;
        if (dest === 'image') {
          // 1x1 transparent SVG placeholder
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
            { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        return new Response('', { status: 504, statusText: 'Offline: asset unavailable' });
      });
    })
  );
});
