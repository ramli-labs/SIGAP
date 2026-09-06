/* ============================================================
   SIGAP - router.js
   Hash-based router. Screens register with:
     SIGAP.router.register(name, { render(container, params), onLeave() })
   Navigate with SIGAP.router.go('academy', {foo:'bar'}).
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};

  var screens = {};
  var current = null; // { name, screen }
  var appEl = null;

  // Routes reachable without a player profile.
  var PUBLIC_ROUTES = ['title', 'teacher'];

  function parseHash() {
    var h = window.location.hash || '#/title';
    h = h.replace(/^#\/?/, '');
    var qIdx = h.indexOf('?');
    var name = qIdx === -1 ? h : h.slice(0, qIdx);
    var params = {};
    if (qIdx !== -1) {
      var pairs = h.slice(qIdx + 1).split('&');
      for (var i = 0; i < pairs.length; i++) {
        var kv = pairs[i].split('=');
        if (kv[0]) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      }
    }
    return { name: name || 'title', params: params };
  }

  function renderError(message) {
    appEl.innerHTML = '';
    var div = document.createElement('div');
    div.className = 'container container--narrow screen';
    div.innerHTML =
      '<div class="panel panel--accent stack">' +
      '<div class="panel-title">Sistem</div>' +
      '<p>' + message + '</p>' +
      '<a class="btn btn--primary" href="#/title">Kembali ke halaman utama</a>' +
      '</div>';
    appEl.appendChild(div);
  }

  function doRoute() {
    var target = parseHash();
    var name = target.name;

    if (!screens[name]) {
      renderError('Layar "' + name + '" tidak ditemukan.');
      return;
    }

    // Guard: gameplay screens need a profile.
    if (PUBLIC_ROUTES.indexOf(name) === -1 && !SIGAP.state.hasProfile()) {
      window.location.hash = '#/title';
      return;
    }

    // Leave hooks + global cleanup.
    if (current && current.screen && typeof current.screen.onLeave === 'function') {
      try { current.screen.onLeave(); } catch (e) { /* leave errors must not block nav */ }
    }
    if (SIGAP.ui && SIGAP.ui.dialogue) SIGAP.ui.dialogue.stop();
    if (SIGAP.audio) SIGAP.audio.stopNarration();
    if (SIGAP.ui && SIGAP.ui.closeAllModals) SIGAP.ui.closeAllModals();

    appEl.innerHTML = '';
    window.scrollTo(0, 0);

    var screen = screens[name];
    current = { name: name, screen: screen };
    try {
      screen.render(appEl, target.params);
    } catch (e) {
      if (window.console) console.error('[SIGAP] render error on "' + name + '":', e);
      renderError('Terjadi kesalahan saat memuat layar ini. Progresmu tetap tersimpan.');
      return;
    }

    // Move focus to main region for keyboard/screen-reader users.
    appEl.focus({ preventScroll: true });
    document.title = (screen.title && screen.title !== 'SIGAP' ? screen.title + ' · ' : '') + 'SIGAP';
  }

  SIGAP.router = {
    register: function (name, screen) { screens[name] = screen; },

    go: function (name, params) {
      var hash = '#/' + name;
      if (params) {
        var parts = [];
        for (var k in params) {
          if (params.hasOwnProperty(k)) {
            parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
          }
        }
        if (parts.length) hash += '?' + parts.join('&');
      }
      if (window.location.hash === hash) {
        doRoute(); // re-render same route
      } else {
        window.location.hash = hash;
      }
    },

    currentName: function () { return current ? current.name : null; },

    start: function () {
      appEl = document.getElementById('app');
      window.addEventListener('hashchange', doRoute);
      doRoute();
    }
  };
})();
