/* ============================================================
   SIGAP - components/chrome.js
   Shared app chrome: topbar (logo, crumb, agent info, sound
   toggle), background layers, settings modal, logo SVG.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.ui = SIGAP.ui || {};

  SIGAP.ui.logoSvg = function (size) {
    size = size || 26;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 32 32" fill="none" aria-hidden="true">' +
      '<circle cx="14" cy="14" r="8" stroke="#37c8dd" stroke-width="2.4"/>' +
      '<line x1="19.8" y1="19.8" x2="27" y2="27" stroke="#37c8dd" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M10.5 14.2l2.6 2.8 5-5.4" stroke="#e8a33d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
  };

  /* ---------- Header institusional ---------- */

  var INST_MARKUP =
    '<div class="inst-header__inner">' +
      '<img class="inst-header__main" src="assets/images/logo-kemendikdasmen.png" alt="Kementerian Pendidikan Dasar dan Menengah">' +
      '<div class="inst-header__group">' +
        '<img class="inst-header__bermutu" src="assets/images/logo-pendidikan-bermutu.png" alt="Pendidikan Bermutu Untuk Semua">' +
        '<img class="inst-header__ramah" src="assets/images/logo-ramah.png" alt="Kemendikdasmen RAMAH">' +
        '<img class="inst-header__sobat" src="assets/images/logo-sobat-smp.png" alt="Sobat SMP">' +
      '</div>' +
    '</div>';

  var instHost = null;
  var instMeasureBound = false;

  /** Simpan tinggi header ke CSS var supaya layar 100dvh tidak ikut meluber. */
  function measureInstHeader() {
    var h = instHost ? instHost.offsetHeight : 0;
    document.documentElement.style.setProperty('--inst-header-h', h + 'px');
  }

  /**
   * Header institusional (bar putih: logo Kemendikdasmen + logo program).
   * @param {'full'|'compact'|'none'} variant
   * Idempoten: hanya menggambar ulang kalau variannya berubah.
   */
  SIGAP.ui.instHeader = function (variant) {
    instHost = instHost || document.getElementById('inst-header');
    if (!instHost) return;
    variant = variant || 'none';
    if (instHost.getAttribute('data-variant') === variant) return;
    instHost.setAttribute('data-variant', variant);

    if (variant === 'none') {
      instHost.innerHTML = '';
      measureInstHeader();
      return;
    }

    instHost.innerHTML =
      '<div class="inst-header' + (variant === 'compact' ? ' inst-header--compact' : '') + '">' +
      INST_MARKUP + '</div>';

    measureInstHeader();
    // Logo belum termuat saat markup dipasang; ukur ulang setelah gambar siap
    // dan saat lebar layar berubah (baris logo bisa membungkus).
    var imgs = instHost.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      if (!imgs[i].complete) imgs[i].addEventListener('load', measureInstHeader);
    }
    if (!instMeasureBound) {
      instMeasureBound = true;
      window.addEventListener('resize', measureInstHeader);
    }
  };

  /** Fixed background layers (grid + glow + scanline). Idempotent per screen render. */
  SIGAP.ui.background = function (container) {
    var wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = '<div class="bg-glow"></div><div class="bg-grid"></div><div class="scanline"></div>';
    container.appendChild(wrap);
  };

  /**
   * Topbar. opts: { crumb, backTo ('academy'), hideAgent }
   */
  SIGAP.ui.topbar = function (opts) {
    opts = opts || {};
    var s = SIGAP.state.get();
    var bar = document.createElement('header');
    bar.className = 'topbar';

    var logo = document.createElement('a');
    logo.className = 'topbar__logo';
    logo.href = '#/' + (SIGAP.state.hasProfile() ? 'academy' : 'title');
    logo.innerHTML = SIGAP.ui.logoSvg(26) + '<span>SIGAP</span>';
    logo.setAttribute('aria-label', 'SIGAP - kembali ke ' + (SIGAP.state.hasProfile() ? 'Academy' : 'halaman utama'));
    bar.appendChild(logo);

    if (opts.crumb) {
      var crumb = document.createElement('span');
      crumb.className = 'topbar__crumb';
      crumb.textContent = '/ ' + opts.crumb;
      bar.appendChild(crumb);
    }

    var spacer = document.createElement('div');
    spacer.className = 'topbar__spacer';
    bar.appendChild(spacer);

    if (!opts.hideAgent && SIGAP.state.hasProfile()) {
      var agent = document.createElement('div');
      agent.className = 'topbar__agent';
      agent.innerHTML =
        '<div><strong>' + escapeHtml(s.player.name) + '</strong> · ' + s.player.agentId + '</div>' +
        '<div>LVL ' + s.player.level + ' · ' + s.player.xp + ' XP</div>';
      bar.appendChild(agent);
    }

    // Sound toggle
    var soundBtn = document.createElement('button');
    soundBtn.className = 'icon-btn';
    function refreshSound() {
      var on = SIGAP.audio.isSoundOn();
      soundBtn.textContent = on ? '🔊' : '🔇';
      soundBtn.setAttribute('aria-label', on ? 'Matikan suara' : 'Nyalakan suara');
      soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    soundBtn.addEventListener('click', function () {
      SIGAP.audio.setSound(!SIGAP.audio.isSoundOn());
      refreshSound();
      if (SIGAP.audio.isSoundOn()) SIGAP.audio.sfx('click');
    });
    refreshSound();
    bar.appendChild(soundBtn);

    // Settings
    var setBtn = document.createElement('button');
    setBtn.className = 'icon-btn';
    setBtn.textContent = '⚙';
    setBtn.setAttribute('aria-label', 'Pengaturan');
    setBtn.addEventListener('click', function () { SIGAP.ui.settingsModal(); });
    bar.appendChild(setBtn);

    if (opts.backTo) {
      var back = document.createElement('a');
      back.className = 'btn btn--sm btn--ghost';
      back.href = '#/' + opts.backTo;
      back.textContent = '← Kembali';
      bar.appendChild(back);
    }

    return bar;
  };

  SIGAP.ui.settingsModal = function () {
    var s = SIGAP.state.get();
    var body = document.createElement('div');
    body.className = 'stack';

    function toggleRow(labelText, checked, onChange, help) {
      var row = document.createElement('label');
      row.className = 'row row--between';
      row.style.cursor = 'pointer';
      var span = document.createElement('span');
      span.innerHTML = '<strong>' + labelText + '</strong>' +
        (help ? '<br><span class="text-xs text-muted">' + help + '</span>' : '');
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = checked;
      input.style.width = '22px';
      input.style.height = '22px';
      input.style.accentColor = 'var(--color-cyan)';
      input.addEventListener('change', function () { onChange(input.checked); });
      row.appendChild(span);
      row.appendChild(input);
      return row;
    }

    body.appendChild(toggleRow('🔊 Efek suara', s.settings.sound !== false, function (v) {
      SIGAP.audio.setSound(v);
      if (v) SIGAP.audio.sfx('click');
    }));
    body.appendChild(toggleRow('🗣 Narasi suara (dubbing)', s.settings.narration !== false, function (v) {
      SIGAP.audio.setNarration(v);
    }, 'Subtitle selalu tersedia meskipun narasi dimatikan.'));
    body.appendChild(toggleRow('🎞 Kurangi animasi', !!s.settings.reducedMotion, function (v) {
      SIGAP.state.update(function (st) { st.settings.reducedMotion = v; });
      document.documentElement.setAttribute('data-reduced-motion', v ? 'true' : 'false');
    }, 'Mematikan efek gerak untuk kenyamanan visual.'));

    var hr = document.createElement('hr');
    hr.style.border = 'none';
    hr.style.borderTop = '1px solid var(--color-divider)';
    body.appendChild(hr);

    var resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn--danger';
    resetBtn.textContent = 'Reset seluruh progres';
    resetBtn.addEventListener('click', function () {
      SIGAP.ui.confirm(
        'Reset progres?',
        'Semua progres, skor, badge, dan refleksi akan dihapus permanen dari perangkat ini. Tindakan ini tidak bisa dibatalkan.',
        function () {
          SIGAP.state.resetAll();
          SIGAP.ui.closeAllModals();
          SIGAP.ui.toast('Progres direset.', 'warn');
          SIGAP.router.go('title');
        },
        { yesLabel: 'Ya, hapus semua', danger: true }
      );
    });
    body.appendChild(resetBtn);

    SIGAP.ui.modal({ title: 'Pengaturan', body: body, actions: [{ label: 'Tutup', variant: 'ghost' }] });
  };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  SIGAP.ui.escapeHtml = escapeHtml;

  /** Phase step indicator. steps: array of labels; activeIdx; doneUpTo */
  SIGAP.ui.phaseSteps = function (steps, activeIdx) {
    var wrap = document.createElement('div');
    wrap.className = 'phase-steps';
    wrap.setAttribute('role', 'list');
    wrap.setAttribute('aria-label', 'Tahap investigasi');
    steps.forEach(function (label, i) {
      var item = document.createElement('span');
      item.setAttribute('role', 'listitem');
      item.className = 'phase-steps__item' +
        (i === activeIdx ? ' phase-steps__item--active' : '') +
        (i < activeIdx ? ' phase-steps__item--done' : '');
      if (i === activeIdx) item.setAttribute('aria-current', 'step');
      item.textContent = label;
      wrap.appendChild(item);
    });
    return wrap;
  };
})();
