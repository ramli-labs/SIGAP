/* ============================================================
   SIGAP - app.js
   Boot: global error guard, reduced-motion attr, service worker,
   router start.
   ============================================================ */
(function () {
  'use strict';

  // Global error guard: never a blank screen.
  window.addEventListener('error', function (e) {
    if (window.SIGAP && SIGAP.ui && SIGAP.ui.toast) {
      SIGAP.ui.toast('Terjadi kesalahan teknis. Progresmu tetap tersimpan.', 'error');
    }
  });
  window.addEventListener('unhandledrejection', function () {
    /* silent: async failures handled locally with fallbacks */
  });

  function boot() {
    if (!window.SIGAP || !SIGAP.router || !SIGAP.state) return;

    // Apply persisted reduced-motion setting.
    var s = SIGAP.state.get();
    document.documentElement.setAttribute(
      'data-reduced-motion',
      s.settings.reducedMotion ? 'true' : 'false'
    );

    if (!SIGAP.storage.persistent) {
      setTimeout(function () {
        SIGAP.ui.toast('Penyimpanan lokal tidak tersedia. Progres tidak akan tersimpan setelah tab ditutup.', 'warn');
      }, 1200);
    }

    SIGAP.router.start();

    // PWA service worker (skip on file:// where SW is unsupported).
    if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
      navigator.serviceWorker.register('service-worker.js').catch(function () {
        /* offline features unavailable; app still works online */
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
