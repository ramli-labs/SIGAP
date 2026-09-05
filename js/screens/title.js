/* ============================================================
   SIGAP — screens/title.js
   Landing sinematik + onboarding profil + Cara Bermain +
   Tentang SIGAP + akses Dashboard Guru.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};

  function esc(s) { return SIGAP.ui.escapeHtml(s); }

  /* ---------- Modals ---------- */

  function caraBermainModal() {
    var body = document.createElement('div');
    body.className = 'stack';
    body.innerHTML =
      '<p>Di SIGAP kamu berperan sebagai <strong>agen investigasi digital</strong>. ' +
      'Setiap kasus diselesaikan dengan metode enam tahap:</p>' +
      '<ol class="title-steps">' +
      '<li><strong>AMATI</strong> — pisahkan apa yang kamu lihat dari apa yang kamu duga.</li>' +
      '<li><strong>BUAT HIPOTESIS</strong> — selalu ada lebih dari satu kemungkinan penjelasan.</li>' +
      '<li><strong>VERIFIKASI</strong> — periksa sumber dan gunakan alat bantu analisis.</li>' +
      '<li><strong>BANDINGKAN</strong> — satu petunjuk jarang cukup; cari bukti yang saling mendukung.</li>' +
      '<li><strong>PUTUSKAN</strong> — kadang kesimpulan paling jujur adalah "belum cukup bukti".</li>' +
      '<li><strong>JELASKAN</strong> — kalau tidak bisa menjelaskan buktimu, kamu belum selesai menyelidiki.</li>' +
      '</ol>' +
      '<div class="panel stack--sm" style="padding:var(--space-3)">' +
      '<div class="panel-title">Kontrol</div>' +
      '<p class="text-sm text-muted">Semua bisa dimainkan dengan mouse, sentuhan, atau keyboard ' +
      '(Tab untuk berpindah, Enter/Spasi untuk memilih). Dialog punya tombol <strong>Lanjut</strong> dan <strong>Lewati</strong>. ' +
      'Suara dan animasi bisa diatur lewat menu Pengaturan.</p>' +
      '</div>' +
      '<p class="text-sm text-muted">XP dan level menunjukkan <em>progres</em>, bukan kepintaran. ' +
      'Skor kompetensi dihitung dari cara kamu menyelidiki — bukan dari kecepatan klik.</p>';
    SIGAP.ui.modal({
      title: 'Cara Bermain',
      body: body,
      wide: true,
      actions: [{ label: 'Mengerti', variant: 'primary' }]
    });
  }

  function tentangModal() {
    var body = document.createElement('div');
    body.className = 'stack';
    body.innerHTML =
      '<p><strong>SIGAP — Sistem Investigasi Digital Anti Palsu</strong> adalah gim edukasi ' +
      'untuk siswa SMP tentang berpikir kritis, literasi AI, dan verifikasi informasi.</p>' +
      '<p class="text-sm">Tujuannya bukan membuatmu curiga pada segalanya, tetapi membiasakan satu sikap: ' +
      '<em>jangan langsung percaya — periksa buktinya.</em></p>' +
      '<div class="sim-label">SIMULATED FORENSIC TOOL — semua alat forensik di dalam gim ini adalah simulasi edukatif, bukan detector AI nyata.</div>' +
      '<p class="text-sm text-muted">Alat di dunia nyata pun tidak pernah memberi jawaban pasti; ' +
      'alat hanya membantu manusia menganalisis.</p>' +
      '<div class="panel stack--sm" style="padding:var(--space-3)">' +
      '<div class="panel-title">Privasi</div>' +
      '<p class="text-sm text-muted">Semua data (nama agen, progres, refleksi) tersimpan <strong>hanya di perangkat ini</strong>. ' +
      'Tidak ada akun, tidak ada server, tidak ada data yang dikirim ke internet.</p>' +
      '</div>';
    SIGAP.ui.modal({
      title: 'Tentang SIGAP',
      body: body,
      actions: [{ label: 'Tutup', variant: 'primary' }]
    });
  }

  /* ---------- Onboarding ---------- */

  function showAgentIdCard(name, agentId) {
    var body = document.createElement('div');
    body.className = 'stack text-center';
    body.innerHTML =
      '<div class="title-idcard">' +
      '<div class="title-idcard__head">' + SIGAP.ui.logoSvg(28) +
      '<span class="text-mono text-xs">SIGAP // DIGITAL INVESTIGATION ACADEMY</span></div>' +
      '<div class="title-idcard__name">' + esc(name) + '</div>' +
      '<div class="title-idcard__id text-mono">' + esc(agentId) + '</div>' +
      '<div class="tag tag--cyan">AGEN TERDAFTAR</div>' +
      '</div>' +
      '<p class="text-sm text-muted">Ini AGENT ID-mu. Simpan baik-baik — ID ini juga muncul di ' +
      'Class Code yang nanti kamu berikan ke gurumu.</p>';
    SIGAP.ui.modal({
      title: 'Identitas Agen Dibuat',
      body: body,
      dismissible: false,
      actions: [{
        label: 'Masuk ke Academy →',
        variant: 'primary',
        onClick: function (close) {
          close();
          var lines = (SIGAP.data && SIGAP.data.dialogues && SIGAP.data.dialogues.onboarding) || [];
          if (lines.length && SIGAP.ui.dialogue) {
            SIGAP.ui.dialogue.play(lines, { onEnd: function () { SIGAP.router.go('academy'); } });
          } else {
            SIGAP.router.go('academy');
          }
        }
      }]
    });
  }

  function startOnboarding() {
    var body = document.createElement('div');
    body.className = 'stack';

    var intro = document.createElement('p');
    intro.className = 'text-sm text-muted';
    intro.textContent = 'Sebelum mulai, daftarkan dirimu sebagai agen baru. Nama ini hanya tersimpan di perangkatmu.';
    body.appendChild(intro);

    var field = document.createElement('div');
    field.className = 'field';
    var label = document.createElement('label');
    label.className = 'field__label';
    label.setAttribute('for', 'title-agent-name');
    label.textContent = 'Nama Agen';
    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'title-agent-name';
    input.maxLength = 24;
    input.autocomplete = 'off';
    input.placeholder = 'contoh: Raka';
    input.setAttribute('aria-describedby', 'title-agent-err');
    var err = document.createElement('div');
    err.id = 'title-agent-err';
    err.className = 'title-field-error';
    err.setAttribute('role', 'alert');
    var help = document.createElement('div');
    help.className = 'field__help';
    help.textContent = '2–24 karakter. Boleh nama panggilan.';
    field.appendChild(label);
    field.appendChild(input);
    field.appendChild(err);
    field.appendChild(help);
    body.appendChild(field);

    function submit(close) {
      var name = String(input.value || '').trim();
      if (name.length < 2 || name.length > 24) {
        err.textContent = 'Nama Agen harus 2–24 karakter.';
        input.focus();
        if (SIGAP.audio) SIGAP.audio.sfx('warning');
        return;
      }
      err.textContent = '';
      var agentId = SIGAP.state.createProfile(name);
      if (SIGAP.audio) SIGAP.audio.sfx('success');
      close();
      showAgentIdCard(name, agentId);
    }

    var m = SIGAP.ui.modal({
      title: 'REGISTRASI AGEN BARU',
      body: body,
      dismissible: false,
      actions: [{
        label: 'Buat AGENT ID',
        variant: 'primary',
        onClick: function (close) { submit(close); }
      }]
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submit(m.close); }
    });
    input.focus();
  }

  function confirmNewProfile() {
    SIGAP.ui.confirm(
      'Mulai profil baru?',
      'Profil lama beserta seluruh progres, skor, badge, dan refleksinya akan dihapus permanen dari perangkat ini.',
      function () {
        SIGAP.state.resetAll();
        SIGAP.ui.toast('Profil lama dihapus.', 'warn');
        startOnboarding();
      },
      { yesLabel: 'Ya, hapus dan mulai baru', danger: true }
    );
  }

  /* ---------- Screen ---------- */

  SIGAP.router.register('title', {
    title: 'SIGAP',
    render: function (container) {
      SIGAP.ui.background(container);

      var landing = document.createElement('div');
      landing.className = 'title-landing';

      // Light particle field (CSS-animated; killed by reduced-motion rules).
      var particles = document.createElement('div');
      particles.className = 'title-particles';
      particles.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 14; i++) {
        var p = document.createElement('span');
        p.className = 'title-particle';
        p.style.left = (4 + Math.random() * 92) + '%';
        p.style.animationDelay = (Math.random() * 14).toFixed(2) + 's';
        p.style.animationDuration = (11 + Math.random() * 12).toFixed(2) + 's';
        particles.appendChild(p);
      }
      landing.appendChild(particles);

      var hero = document.createElement('div');
      hero.className = 'title-hero';
      hero.innerHTML =
        '<div class="title-eyebrow text-mono">DIGITAL INVESTIGATION ACADEMY</div>' +
        '<div class="title-logo" aria-hidden="true">' + SIGAP.ui.logoSvg(72) + '</div>' +
        '<h1 class="title-wordmark">SIGAP</h1>' +
        '<p class="title-subtitle">Sistem Investigasi Digital Anti Palsu</p>' +
        '<p class="title-tagline text-mono">[ Jangan Langsung Percaya. Periksa Buktinya. ]</p>';
      landing.appendChild(hero);

      var actions = document.createElement('div');
      actions.className = 'title-actions';

      var hasProfile = SIGAP.state.hasProfile();
      var mainBtn = document.createElement('button');
      mainBtn.className = 'btn btn--primary btn--lg';
      mainBtn.textContent = hasProfile ? 'LANJUTKAN' : 'MULAI INVESTIGASI';
      mainBtn.addEventListener('click', function () {
        if (SIGAP.audio) SIGAP.audio.sfx('click');
        if (SIGAP.state.hasProfile()) SIGAP.router.go('academy');
        else startOnboarding();
      });
      actions.appendChild(mainBtn);

      if (hasProfile) {
        var s = SIGAP.state.get();
        var who = document.createElement('div');
        who.className = 'text-xs text-muted text-mono';
        who.textContent = 'Agen aktif: ' + s.player.name + ' · ' + s.player.agentId;
        actions.appendChild(who);

        var newBtn = document.createElement('button');
        newBtn.className = 'btn btn--ghost btn--sm';
        newBtn.textContent = 'Mulai profil baru';
        newBtn.addEventListener('click', confirmNewProfile);
        actions.appendChild(newBtn);
      }
      landing.appendChild(actions);

      var menu = document.createElement('nav');
      menu.className = 'title-menu';
      menu.setAttribute('aria-label', 'Menu halaman utama');

      function menuBtn(label, onClick) {
        var b = document.createElement('button');
        b.className = 'btn btn--ghost title-menu__btn';
        b.textContent = label;
        b.addEventListener('click', function () {
          if (SIGAP.audio) SIGAP.audio.sfx('click');
          onClick();
        });
        return b;
      }

      menu.appendChild(menuBtn('Cara Bermain', caraBermainModal));
      menu.appendChild(menuBtn('Tentang SIGAP', tentangModal));

      var teacherLink = document.createElement('a');
      teacherLink.className = 'btn btn--ghost title-menu__btn';
      teacherLink.href = '#/teacher';
      teacherLink.textContent = 'Dashboard Guru';
      menu.appendChild(teacherLink);

      menu.appendChild(menuBtn('Pengaturan Audio', function () { SIGAP.ui.settingsModal(); }));
      landing.appendChild(menu);

      var foot = document.createElement('footer');
      foot.className = 'title-footer text-xs text-faint text-mono';
      foot.innerHTML =
        '<span>SISTEM: ONLINE</span><span aria-hidden="true"> · </span>' +
        '<span>MODE: OFFLINE-READY</span><span aria-hidden="true"> · </span>' +
        '<span>Semua data hanya tersimpan di perangkat ini</span>';
      landing.appendChild(foot);

      container.appendChild(landing);
    },
    onLeave: function () { /* no timers to clear */ }
  });
})();
