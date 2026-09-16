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

  // Penjaga keluar layar. Diisi layar yang punya progres belum tersimpan
  // (mis. CASE yang sedang dikerjakan): fungsi yang mengembalikan pesan
  // konfirmasi, atau null kalau boleh langsung keluar.
  var leaveGuard = null;
  var lastHash = null;        // hash layar yang sedang tampil, untuk dipulihkan
  var suppressNextRoute = false; // lewati satu hashchange hasil pemulihan kita

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
    // Hashchange yang kita picu sendiri saat memulihkan alamat: abaikan,
    // supaya layar yang sedang dikerjakan TIDAK ter-render ulang (yang justru
    // akan menghapus progres yang sedang kita lindungi) dan modal tetap buka.
    if (suppressNextRoute) { suppressNextRoute = false; return; }

    var target = parseHash();
    var name = target.name;

    if (!screens[name]) {
      renderError('Layar "' + name + '" tidak ditemukan.');
      return;
    }

    // Konfirmasi kalau layar sekarang punya progres yang belum tersimpan.
    // Alamat sudah terlanjur berubah, jadi pulihkan dulu, baru bertanya.
    if (leaveGuard && current && current.name !== name) {
      var msg = null;
      try { msg = leaveGuard(); } catch (e) { msg = null; }
      if (msg) {
        var intended = window.location.hash;
        var back = lastHash || '#/' + current.name;
        if (window.location.hash !== back) {
          suppressNextRoute = true;
          window.location.hash = back;
        }
        SIGAP.ui.confirm('Keluar dari kasus ini?', msg, function () {
          leaveGuard = null;
          window.location.hash = intended;
        }, { yesLabel: 'Ya, keluar', noLabel: 'Lanjut mengerjakan', danger: true });
        return;
      }
    }
    leaveGuard = null;
    lastHash = window.location.hash;

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

    // Header institusional: versi penuh di layar non-gameplay, ringkas saat bermain.
    if (SIGAP.ui && SIGAP.ui.instHeader) {
      SIGAP.ui.instHeader(name === 'title' || name === 'teacher' ? 'full' : 'compact');
    }

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

    /**
     * Pasang konfirmasi sebelum meninggalkan layar ini.
     * @param {function|null} fn mengembalikan pesan konfirmasi, atau null
     *        kalau sudah aman ditinggalkan. Otomatis dilepas saat pindah layar.
     */
    setLeaveGuard: function (fn) { leaveGuard = fn || null; },

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
