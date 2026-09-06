/* ============================================================
   SIGAP - games/case001.js
   CASE 001 "FILE MISTERI". APK berbahaya / social engineering.
   Flow: AMATI → HIPOTESIS → VERIFIKASI (2 token) → BANDINGKAN
   (rating kekuatan bukti + evidence board) → PUTUSKAN →
   JELASKAN → debrief → CASE CLOSED → REFLEKSI → PHANTOM.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.data = SIGAP.data || {};

  /* ---------- Evidence catalog (for the ARCHIVE screen) ---------- */
  SIGAP.data.evidenceCatalog = SIGAP.data.evidenceCatalog || {};
  SIGAP.data.evidenceCatalog.case001 = {
    'file-type': {
      title: 'FORMAT FILE .APK',
      body: 'File "FOTO_ACARA.apk" adalah paket instalasi aplikasi Android, bukan format foto. Foto biasanya berformat .jpg, .png, atau .heic. Klaim "foto" tidak cocok dengan format filenya.',
      source: 'Analisis tipe file (simulasi)'
    },
    'sender-account': {
      title: 'AKUN PENGIRIM JANGGAL',
      body: 'Akun mirip Dimas tetapi memakai nomor baru, foto profil hasil crop, dan baru bergabung 2 hari lalu. Mencurigakan, tapi masih mungkin ada penjelasan lain.',
      source: 'Pemeriksaan profil pengirim'
    },
    'permissions': {
      title: 'PERMISSION BERBAHAYA',
      body: 'Aplikasi meminta akses SMS, Kontak, dan Accessibility. Untuk "melihat foto", permintaan itu tidak masuk akal; aplikasi galeri hanya butuh akses media.',
      source: 'Analisis permission (simulasi)'
    },
    'direct-confirm': {
      title: 'DIMAS MENYANGKAL',
      body: 'Dihubungi lewat jalur lain, Dimas berkata: "Aku tidak pernah mengirim file itu. Akunku sempat tidak bisa dibuka." Pengirim pesan bukan Dimas yang asli.',
      source: 'Konfirmasi langsung ke Dimas'
    }
  };

  /* ---------- Static case data ---------- */
  var PHASES = ['AMATI', 'HIPOTESIS', 'VERIFIKASI', 'BANDINGKAN', 'PUTUSKAN', 'JELASKAN', 'REFLEKSI'];

  var SOURCES = [
    {
      id: 'file-type',
      label: 'FILE TYPE',
      desc: 'Periksa jenis file yang sebenarnya dikirim.',
      correctStrength: 'KUAT',
      strong: true,
      simTool: true
    },
    {
      id: 'sender-account',
      label: 'SENDER',
      desc: 'Periksa profil akun pengirim pesan.',
      correctStrength: 'SEDANG',
      strong: false,
      simTool: false
    },
    {
      id: 'permissions',
      label: 'PERMISSIONS',
      desc: 'Periksa izin (permission) yang diminta file itu.',
      correctStrength: 'KUAT',
      strong: true,
      simTool: true
    },
    {
      id: 'direct-confirm',
      label: 'DIRECT CONFIRMATION',
      desc: 'Hubungi Dimas lewat jalur lain untuk konfirmasi.',
      correctStrength: 'KUAT',
      strong: true,
      simTool: false
    }
  ];

  var STRENGTH_ORDER = ['LEMAH', 'SEDANG', 'KUAT'];

  var RATING_FEEDBACK = {
    'file-type': {
      why: 'Klaim pesan ("foto") bertentangan langsung dengan format file (.apk = paket instalasi aplikasi). Kontradiksi antara klaim dan fakta adalah bukti KUAT.',
      ifLow: 'Coba pikirkan lagi: pesan bilang "foto", tapi filenya adalah aplikasi. Kontradiksi langsung seperti ini termasuk bukti yang paling kuat.'
    },
    'sender-account': {
      why: 'Nomor baru, foto di-crop, dan akun baru dibuat memang mencurigakan, tetapi masih ada penjelasan lain (ganti HP, buat akun baru). Karena belum pasti, kekuatannya SEDANG.',
      ifLow: 'Kejanggalan akun bukan bukti kuat sendirian, tapi juga bukan tanpa arti. Kekuatannya SEDANG: perlu dicek bersama bukti lain.',
      ifHigh: 'Hati-hati: akun janggal saja belum membuktikan penipuan. Orang bisa ganti nomor atau membuat akun baru. Ini bukti SEDANG, berguna jika didukung bukti lain.'
    },
    'permissions': {
      why: 'Akses SMS, Kontak, dan Accessibility tidak masuk akal untuk "melihat foto". Ketidaksesuaian izin dengan fungsi yang diklaim adalah bukti KUAT.',
      ifLow: 'Bandingkan dengan aplikasi galeri biasa: hanya butuh akses media. Permintaan SMS + Kontak + Accessibility untuk "foto" adalah ketidaksesuaian besar. Ini bukti KUAT.'
    },
    'direct-confirm': {
      why: 'Konfirmasi dari Dimas lewat jalur lain langsung mematahkan klaim pengirim. Sumber pertama yang independen seperti ini adalah bukti KUAT.',
      ifLow: 'Pernyataan langsung dari Dimas lewat jalur berbeda adalah bukti yang sangat sulit dibantah. Ini bukti KUAT.'
    }
  };

  var DECISIONS = [
    { key: 'A', text: 'Install file itu, kalau dari teman pasti aman.', correct: false },
    { key: 'B', text: 'Abaikan saja pesan itu, tidak perlu tindakan apa pun.', correct: false },
    { key: 'C', text: 'Jangan instal. Verifikasi pengirim lewat jalur lain, hapus file, dan laporkan akunnya.', correct: true },
    { key: 'D', text: 'Teruskan file ke teman-teman lain supaya mereka ikut mencoba.', correct: false }
  ];

  var HYPOTHESES = [
    {
      key: 'A',
      text: 'Pesan ini pasti aman, Dimas memang temanku.',
      iq: 0,
      feedback: 'Dari mana kamu tahu akun itu benar-benar Dimas? Nama dan foto profil mudah ditiru. Hipotesis yang baik menyisakan ruang untuk kemungkinan lain.'
    },
    {
      key: 'B',
      text: 'File ini mungkin berbahaya, ada yang janggal antara "foto" dan perintah "install".',
      iq: 10,
      feedback: 'Kamu menangkap kejanggalan penting: foto tidak perlu di-install. Tapi ingat, ini masih dugaan; harus diperiksa sebelum disimpulkan.'
    },
    {
      key: 'C',
      text: 'Belum bisa disimpulkan, aku perlu memeriksa file dan pengirimnya dulu.',
      iq: 15,
      feedback: 'Sikap yang tepat: menahan kesimpulan sampai ada bukti. Sekarang tentukan apa yang paling penting untuk diperiksa lebih dulu.'
    }
  ];

  var INTRO_LINES = [
    { speaker: 'system', text: 'CASE FILE 001: "FILE MISTERI" DIBUKA. STATUS: AKTIF.' },
    { speaker: 'aruna', voice: 'aruna/case001-intro-01.mp3', text: 'Kasus pertamamu. Seorang siswa bernama Raka menerima pesan dari akun yang tampak seperti temannya, Dimas.' },
    { speaker: 'aruna', voice: 'aruna/case001-intro-02.mp3', text: 'Pesan itu berisi sebuah file dan permintaan untuk meng-install-nya. Raka hampir menekan tombol install, lalu ia ragu, dan mengirim kasus ini ke kita.' },
    { speaker: 'aruna', voice: 'aruna/case001-intro-03.mp3', text: 'Jangan buru-buru menyimpulkan. Amati dulu pesannya: apa yang benar-benar kamu lihat, bukan apa yang kamu duga?' }
  ];

  /* ============================================================ */

  var run = null;      // per-render run state
  var board = null;    // evidence board instance
  var cineEl = null;   // cinematic overlay

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function getSource(id) {
    for (var i = 0; i < SOURCES.length; i++) if (SOURCES[i].id === id) return SOURCES[i];
    return null;
  }

  function catalogEntry(id) {
    return SIGAP.data.evidenceCatalog.case001[id];
  }

  /* ---------- score derivations ---------- */
  function investigationQuality() {
    var iq = 40 + 10 * run.opened.length + (run.hypothesisIq || 0) - 8 * run.boardWrong;
    return Math.max(0, Math.min(100, iq));
  }

  function ratingScoreFor(id) {
    var rated = run.ratings[id];
    if (!rated) return null;
    var diff = Math.abs(STRENGTH_ORDER.indexOf(rated) - STRENGTH_ORDER.indexOf(getSource(id).correctStrength));
    return diff === 0 ? 100 : (diff === 1 ? 50 : 0);
  }

  function evidenceRelevance() {
    var ratingScores = [];
    run.opened.forEach(function (id) {
      var s = ratingScoreFor(id);
      if (s !== null) ratingScores.push(s);
    });
    var ratingAvg = ratingScores.length
      ? ratingScores.reduce(function (a, b) { return a + b; }, 0) / ratingScores.length
      : 0;
    var explainScores = run.explainSelected.map(function (id) {
      return getSource(id).strong ? 100 : 55;
    });
    var explainAvg = explainScores.length
      ? explainScores.reduce(function (a, b) { return a + b; }, 0) / explainScores.length
      : 0;
    return Math.round(0.5 * ratingAvg + 0.5 * explainAvg);
  }

  /* ---------- route ---------- */
  SIGAP.router.register('case001', {
    title: 'CASE 001: File Misteri',

    render: function (container) {
      SIGAP.ui.background(container);
      container.appendChild(SIGAP.ui.topbar({ crumb: 'CASE 001', backTo: 'missions' }));

      var main = el('div', 'container screen');
      container.appendChild(main);

      var header = el('div', 'screen__header');
      header.appendChild(el('div', 'screen__eyebrow', 'CASE FILE 001 · APK BERBAHAYA · SOCIAL ENGINEERING'));
      header.appendChild(el('h1', 'screen__title', 'File Misteri'));
      header.appendChild(el('p', 'screen__sub',
        'Sebuah file mencurigakan dikirim lewat chat yang mengaku dari teman. Selidiki sebelum ada yang meng-install.'));
      main.appendChild(header);

      var stepsWrap = el('div', 'c1-steps');
      main.appendChild(stepsWrap);

      var content = el('div', 'stack stack--lg c1-content');
      main.appendChild(content);

      run = {
        isPractice: SIGAP.state.isPractice('case', 'case001'),
        tokensLeft: 2,
        opened: [],          // evidence ids in open order
        tokenPicks: [],      // ids opened with tokens
        ratings: {},         // id -> 'LEMAH'|'SEDANG'|'KUAT'
        hypothesisIq: 0,
        boardWrong: 0,
        decision: null,
        confidence: 50,
        explainSelected: [],
        finishResult: null
      };

      SIGAP.state.update(function () {
        var c = SIGAP.state.caseProgress('case001');
        if (!c.startedAt) c.startedAt = Date.now();
      });

      function setPhase(idx) {
        stepsWrap.innerHTML = '';
        stepsWrap.appendChild(SIGAP.ui.phaseSteps(PHASES, idx));
      }

      function clearContent() {
        if (board) { board.destroy(); board = null; }
        content.innerHTML = '';
      }

      /* ================= AMATI ================= */
      function phaseAmati() {
        setPhase(0);
        clearContent();

        var panel = el('div', 'panel panel--glass stack');
        panel.appendChild(el('div', 'panel-title', 'PESAN YANG DITERIMA RAKA'));

        var chat = el('div', 'chat-mock');
        var bubble = el('div', 'chat-bubble');
        bubble.appendChild(el('div', 'chat-bubble__meta', 'Dimas 🏀 · 19.42'));
        var msg = el('span');
        msg.textContent = 'Bro, ini foto kamu waktu acara kemarin 😂 Install aja biar bisa buka fotonya.';
        bubble.appendChild(msg);
        var att = el('div', 'chat-attachment');
        att.textContent = '📦 FOTO_ACARA.apk · 4,2 MB';
        bubble.appendChild(att);
        chat.appendChild(bubble);
        panel.appendChild(chat);

        panel.appendChild(el('p', 'c1-note',
          '👁 Amati baik-baik: <strong>nama file</strong>, <strong>jenis file</strong>, ' +
          '<strong>isi pesan</strong>, dan <strong>siapa pengirimnya</strong>. ' +
          'Pisahkan apa yang kamu lihat dari apa yang kamu duga.'));

        var btn = el('button', 'btn btn--primary btn--lg');
        btn.type = 'button';
        btn.textContent = 'Aku sudah mengamati, buat hipotesis ▸';
        btn.addEventListener('click', phaseHipotesis);
        panel.appendChild(btn);

        content.appendChild(panel);
      }

      /* ================= HIPOTESIS ================= */
      function phaseHipotesis() {
        setPhase(1);
        clearContent();

        var panel = el('div', 'panel panel--glass stack');
        panel.appendChild(el('div', 'panel-title', 'HIPOTESIS AWAL'));
        panel.appendChild(el('p', '', 'Sebelum memeriksa apa pun: menurutmu, apa penjelasan yang paling mungkin untuk pesan ini?'));

        var fb = el('div', 'c1-feedback');
        fb.setAttribute('aria-live', 'polite');
        fb.hidden = true;

        var nextBtn = el('button', 'btn btn--primary');
        nextBtn.type = 'button';
        nextBtn.textContent = 'Lanjut ke verifikasi ▸';
        nextBtn.hidden = true;
        nextBtn.addEventListener('click', phaseVerifikasi);

        var opts = el('div', 'stack stack--sm');
        HYPOTHESES.forEach(function (h) {
          var card = el('button', 'option-card');
          card.type = 'button';
          card.setAttribute('aria-pressed', 'false');
          card.appendChild(el('span', 'option-card__key', h.key));
          var t = el('span');
          t.textContent = h.text;
          card.appendChild(t);
          card.addEventListener('click', function () {
            if (SIGAP.audio) SIGAP.audio.sfx('click');
            Array.prototype.forEach.call(opts.querySelectorAll('.option-card'), function (c) {
              c.setAttribute('aria-pressed', 'false');
            });
            card.setAttribute('aria-pressed', 'true');
            run.hypothesisIq = h.iq;
            fb.hidden = false;
            fb.className = 'c1-feedback c1-feedback--info';
            fb.textContent = h.feedback;
            nextBtn.hidden = false;
          });
          opts.appendChild(card);
        });

        panel.appendChild(opts);
        panel.appendChild(fb);
        panel.appendChild(nextBtn);
        content.appendChild(panel);
      }

      /* ================= VERIFIKASI (tokens) ================= */
      function phaseVerifikasi() {
        setPhase(2);
        clearContent();

        var panel = el('div', 'panel panel--glass stack');
        panel.appendChild(el('div', 'panel-title', 'VERIFIKASI: PILIH SUMBERMU'));
        panel.appendChild(el('p', '',
          'Waktumu terbatas: kamu hanya punya <strong>2 Investigation Token</strong>. ' +
          'Ada 4 sumber yang bisa diperiksa. Pilih 2 yang menurutmu paling penting; sisanya terkunci dulu.'));

        var tokenBar = el('div', 'token-display');
        panel.appendChild(tokenBar);

        var grid = el('div', 'grid-2 c1-sources');
        panel.appendChild(grid);

        var contBtn = el('button', 'btn btn--primary btn--lg');
        contBtn.type = 'button';
        contBtn.textContent = 'Lanjut: nilai kekuatan bukti ▸';
        contBtn.hidden = true;
        contBtn.addEventListener('click', phaseBandingkan);
        panel.appendChild(contBtn);

        function refreshTokens() {
          tokenBar.innerHTML = 'TOKEN: ';
          for (var i = 0; i < 2; i++) {
            tokenBar.appendChild(el('span', 'token-chip' + (i < 2 - run.tokensLeft ? ' token-chip--used' : '')));
          }
          var t = el('span');
          t.textContent = ' ' + run.tokensLeft + ' tersisa';
          tokenBar.appendChild(t);
          tokenBar.setAttribute('aria-label', 'Investigation token tersisa: ' + run.tokensLeft + ' dari 2');
        }

        function refreshCards() {
          grid.innerHTML = '';
          SOURCES.forEach(function (src) {
            var opened = run.opened.indexOf(src.id) !== -1;
            var locked = !opened && run.tokensLeft <= 0;
            var card = el('button', 'c1-source' + (opened ? ' c1-source--opened' : '') + (locked ? ' c1-source--locked' : ''));
            card.type = 'button';
            card.disabled = opened || locked;
            card.appendChild(el('span', 'c1-source__label', SIGAP.ui.escapeHtml(src.label)));
            var d = el('span', 'c1-source__desc');
            d.textContent = src.desc;
            card.appendChild(d);
            card.appendChild(el('span', 'c1-source__cost',
              opened ? '✔ Sudah diperiksa' : (locked ? '🔒 Terkunci, token habis' : '◈ 1 token')));
            if (!opened && !locked) {
              card.addEventListener('click', function () {
                openSource(src.id, true, function () {
                  refreshTokens();
                  refreshCards();
                  if (run.tokensLeft <= 0) contBtn.hidden = false;
                });
              });
            }
            grid.appendChild(card);
          });
        }

        refreshTokens();
        refreshCards();
        content.appendChild(panel);
      }

      /** Open one source: modal detail + evidence record + achievements. */
      function openSource(id, useToken, after) {
        var src = getSource(id);
        if (useToken) {
          run.tokensLeft -= 1;
          run.tokenPicks.push(id);
        }
        run.opened.push(id);
        SIGAP.state.recordEvidence('case001', id);
        if (SIGAP.audio) SIGAP.audio.sfx('evidence');

        if (!run.isPractice) {
          SIGAP.achievements.unlock('first-evidence');
          if (useToken && run.tokenPicks.length === 2) {
            var allStrong = run.tokenPicks.every(function (pid) { return getSource(pid).strong; });
            if (allStrong) SIGAP.achievements.unlock('token-strategist');
          }
          if (run.opened.length === SOURCES.length) {
            SIGAP.achievements.unlock('evidence-master');
          }
        }

        var body = el('div', 'stack');
        body.appendChild(sourceDetail(id));
        var entry = catalogEntry(id);
        body.appendChild(SIGAP.ui.evidenceCard({
          id: id,
          title: entry.title,
          body: SIGAP.ui.escapeHtml(entry.body),
          source: entry.source,
          tag: 'BUKTI BARU',
          tagClass: 'tag--cyan',
          found: true
        }));

        SIGAP.ui.modal({
          title: 'SUMBER: ' + src.label,
          body: body,
          actions: [{ label: 'Simpan ke berkas kasus', variant: 'primary', onClick: function (close) { close(); if (after) after(); } }],
          dismissible: false,
          wide: true
        });
        SIGAP.ui.toast('Bukti dicatat: ' + entry.title, 'success');
      }

      /** Detail view per source (tools analyse, never conclude). */
      function sourceDetail(id) {
        var wrap = el('div', 'stack stack--sm');
        var src = getSource(id);

        if (src.simTool) {
          wrap.appendChild(el('span', 'sim-label', '⚠ SIMULATED FORENSIC TOOL, bukan detector AI nyata'));
        }

        if (id === 'file-type') {
          wrap.appendChild(el('div', 'terminal',
            '<div class="terminal__bar">file-inspector</div>' +
            '<div class="terminal__body">' +
            '<div class="terminal__line"><span class="terminal__prompt">&gt;</span> inspect FOTO_ACARA.apk</div>' +
            '<div class="terminal__line">Ekstensi     : .apk</div>' +
            '<div class="terminal__line">Jenis        : Android Package, file INSTALASI aplikasi</div>' +
            '<div class="terminal__line">Format foto  : .jpg / .png / .heic (bukan .apk)</div>' +
            '<div class="terminal__line text-muted">Alat ini hanya membaca tipe file. Apa artinya, kamu yang menilai.</div>' +
            '</div>'));
        } else if (id === 'sender-account') {
          wrap.appendChild(el('div', 'terminal',
            '<div class="terminal__bar">profil pengirim</div>' +
            '<div class="terminal__body">' +
            '<div class="terminal__line">Nama tampilan : Dimas 🏀</div>' +
            '<div class="terminal__line">Nomor         : BERBEDA dari nomor Dimas yang tersimpan</div>' +
            '<div class="terminal__line">Foto profil   : sama seperti milik Dimas, tapi terpotong (di-crop)</div>' +
            '<div class="terminal__line">Bergabung     : 2 hari yang lalu</div>' +
            '<div class="terminal__line text-muted">Janggal, tetapi orang juga bisa ganti nomor. Perlu bukti lain.</div>' +
            '</div>'));
        } else if (id === 'permissions') {
          wrap.appendChild(el('div', 'terminal',
            '<div class="terminal__bar">permission-analyzer</div>' +
            '<div class="terminal__body">' +
            '<div class="terminal__line"><span class="terminal__prompt">&gt;</span> permissions FOTO_ACARA.apk</div>' +
            '<div class="terminal__line">• SMS (baca &amp; kirim)</div>' +
            '<div class="terminal__line">• Kontak (baca semua)</div>' +
            '<div class="terminal__line">• Accessibility Service (kendali layar)</div>' +
            '<div class="terminal__line text-muted">Pembanding: aplikasi galeri foto biasanya hanya butuh akses media.</div>' +
            '</div>'));
        } else {
          var chat = el('div', 'chat-mock');
          var b1 = el('div', 'chat-bubble c1-chat-me');
          b1.appendChild(el('div', 'chat-bubble__meta', 'Kamu → Dimas (nomor lama, telepon)'));
          var t1 = el('span');
          t1.textContent = 'Dim, kamu barusan kirim file APK ke Raka?';
          b1.appendChild(t1);
          chat.appendChild(b1);
          var b2 = el('div', 'chat-bubble');
          b2.appendChild(el('div', 'chat-bubble__meta', 'Dimas (asli)'));
          var t2 = el('span');
          t2.textContent = 'Aku tidak pernah mengirim file itu. Akunku sempat tidak bisa dibuka sejak kemarin 😰';
          b2.appendChild(t2);
          chat.appendChild(b2);
          wrap.appendChild(chat);
        }
        return wrap;
      }

      /* ================= BANDINGKAN: rating kekuatan ================= */
      function phaseBandingkan() {
        setPhase(3);
        clearContent();

        var panel = el('div', 'panel panel--glass stack');
        panel.appendChild(el('div', 'panel-title', 'BANDINGKAN: SEBERAPA KUAT TIAP BUKTI?'));
        panel.appendChild(el('p', '',
          'Tidak semua bukti sama kuatnya. Nilai setiap bukti yang kamu temukan: ' +
          '<strong>LEMAH</strong> (mudah dibantah), <strong>SEDANG</strong> (mencurigakan tapi ada penjelasan lain), ' +
          '<strong>KUAT</strong> (sulit dibantah, langsung mendukung/mematahkan klaim).'));

        var list = el('div', 'stack');
        panel.appendChild(list);

        var extraWrap = el('div', 'stack');
        var contBtn = el('button', 'btn btn--primary btn--lg');
        contBtn.type = 'button';
        contBtn.textContent = 'Lanjut: susun papan bukti ▸';
        contBtn.hidden = true;
        contBtn.addEventListener('click', phaseBoard);

        function allInitialRated() {
          return run.opened.every(function (id) { return !!run.ratings[id]; });
        }

        function ratingBlock(id) {
          var src = getSource(id);
          var entry = catalogEntry(id);
          var block = el('div', 'c1-rate panel');
          block.appendChild(el('div', 'c1-rate__title', SIGAP.ui.escapeHtml(entry.title)));
          var bodyP = el('p', 'text-sm text-muted');
          bodyP.textContent = entry.body;
          block.appendChild(bodyP);

          var fb = el('div', 'c1-feedback');
          fb.setAttribute('aria-live', 'polite');
          fb.hidden = true;

          var group = el('div', 'row c1-rate__opts');
          group.setAttribute('role', 'group');
          group.setAttribute('aria-label', 'Nilai kekuatan bukti ' + entry.title);
          STRENGTH_ORDER.forEach(function (st) {
            var b = el('button', 'option-card c1-rate__opt');
            b.type = 'button';
            b.setAttribute('aria-pressed', 'false');
            b.textContent = st;
            b.addEventListener('click', function () {
              if (run.ratings[id]) return; // locked after choice
              if (SIGAP.audio) SIGAP.audio.sfx('click');
              run.ratings[id] = st;
              Array.prototype.forEach.call(group.children, function (c) { c.disabled = true; });
              b.setAttribute('aria-pressed', 'true');
              b.classList.add('option-card--selected');

              var meta = RATING_FEEDBACK[id];
              var correct = src.correctStrength;
              var pick = STRENGTH_ORDER.indexOf(st);
              var target = STRENGTH_ORDER.indexOf(correct);
              fb.hidden = false;
              if (pick === target) {
                fb.className = 'c1-feedback c1-feedback--good';
                fb.textContent = '✔ Penilaian rubrik: ' + correct + '. ' + meta.why;
              } else {
                fb.className = 'c1-feedback c1-feedback--info';
                fb.textContent = 'Penilaian rubrik: ' + correct + '. ' +
                  (pick < target ? meta.ifLow : (meta.ifHigh || meta.why)) +
                  ' Menilai kekuatan bukti adalah keterampilan, bukan soal benar-salah tunggal.';
              }

              if (allInitialRated()) showRemaining();
            });
            group.appendChild(b);
          });

          block.appendChild(group);
          block.appendChild(fb);
          return block;
        }

        run.opened.forEach(function (id) { list.appendChild(ratingBlock(id)); });

        var remainingShown = false;
        function showRemaining() {
          if (remainingShown) { refreshRemaining(); return; }
          remainingShown = true;

          var remaining = SOURCES.filter(function (s) { return run.opened.indexOf(s.id) === -1; });
          if (remaining.length) {
            extraWrap.appendChild(el('p', 'c1-note',
              '🔓 Dua sumber tersisa kini <strong>terbuka tanpa token</strong>. Kamu boleh memeriksanya ' +
              'sebelum memutuskan. Penyelidik yang teliti memeriksa lebih banyak sumber.'));
            var grid = el('div', 'grid-2 c1-sources');
            grid.dataset.role = 'remaining';
            extraWrap.appendChild(grid);
            refreshRemaining();
          }
          contBtn.hidden = false;
        }

        function refreshRemaining() {
          var grid = extraWrap.querySelector('[data-role="remaining"]');
          if (!grid) return;
          grid.innerHTML = '';
          SOURCES.forEach(function (src) {
            if (run.opened.indexOf(src.id) !== -1 && run.tokenPicks.indexOf(src.id) !== -1) return;
            var opened = run.opened.indexOf(src.id) !== -1;
            if (opened && run.tokenPicks.indexOf(src.id) === -1) {
              // already opened for free, skip card; rating block exists
              return;
            }
            var card = el('button', 'c1-source');
            card.type = 'button';
            card.appendChild(el('span', 'c1-source__label', SIGAP.ui.escapeHtml(src.label)));
            var d = el('span', 'c1-source__desc');
            d.textContent = src.desc;
            card.appendChild(d);
            card.appendChild(el('span', 'c1-source__cost', '🔓 Gratis, tanpa token'));
            card.addEventListener('click', function () {
              openSource(src.id, false, function () {
                list.appendChild(ratingBlock(src.id));
                refreshRemaining();
              });
            });
            grid.appendChild(card);
          });
        }

        panel.appendChild(extraWrap);
        panel.appendChild(contBtn);
        content.appendChild(panel);
      }

      /* ================= BANDINGKAN: evidence board ================= */
      function phaseBoard() {
        setPhase(3);
        clearContent();

        var panel = el('div', 'panel panel--glass stack');
        panel.appendChild(el('div', 'panel-title', 'PAPAN BUKTI: SUSUN RANTAI PENALARAN'));
        panel.appendChild(el('p', '',
          'Hubungkan bukti dengan apa yang didukungnya: risiko, sumber, atau kesimpulan. ' +
          'Papan yang baik menunjukkan <em>mengapa</em> kesimpulanmu masuk akal.'));

        var nodes = [
          { id: 'src-sender', label: 'Pengirim tidak terverifikasi', category: 'SOURCE' },
          { id: 'risk-data', label: 'Data SMS & kontak bisa dicuri', category: 'RISK' },
          { id: 'risk-account', label: 'Akun bisa diambil alih', category: 'RISK' },
          { id: 'concl', label: 'File berbahaya, jangan instal', category: 'CONCLUSION' }
        ];
        var required = [];
        var optional = [
          ['risk-account', 'concl'],
          ['risk-data', 'concl'],
          ['src-sender', 'concl']
        ];

        if (run.opened.indexOf('file-type') !== -1) {
          nodes.push({ id: 'ev-filetype', label: 'Format .apk ≠ klaim "foto"', category: 'EVIDENCE' });
          required.push(['ev-filetype', 'concl']);
        }
        if (run.opened.indexOf('permissions') !== -1) {
          nodes.push({ id: 'ev-permissions', label: 'Permission SMS/Kontak/Accessibility', category: 'EVIDENCE' });
          required.push(['ev-permissions', 'risk-data']);
          required.push(['risk-data', 'concl']);
          optional.push(['ev-permissions', 'risk-account']);
          optional.push(['ev-permissions', 'concl']);
        }
        if (run.opened.indexOf('direct-confirm') !== -1) {
          nodes.push({ id: 'ev-denial', label: 'Dimas menyangkal mengirim file', category: 'EVIDENCE' });
          required.push(['ev-denial', 'src-sender']);
          required.push(['src-sender', 'concl']);
          optional.push(['ev-denial', 'risk-account']);
        }
        if (run.opened.indexOf('sender-account') !== -1) {
          nodes.push({ id: 'ev-account', label: 'Akun pengirim janggal (nomor baru)', category: 'EVIDENCE' });
          required.push(['ev-account', 'src-sender']);
          required.push(['src-sender', 'concl']);
          optional.push(['ev-account', 'risk-account']);
        }

        var boardHost = el('div');
        panel.appendChild(boardHost);

        var doneBtn = el('button', 'btn btn--primary btn--lg');
        doneBtn.type = 'button';
        doneBtn.textContent = 'Lanjut: ambil keputusan ▸';
        doneBtn.hidden = true;
        doneBtn.addEventListener('click', phasePutuskan);

        var hint2 = run.opened.indexOf('permissions') !== -1
          ? 'Periksa hubungan antara permission aplikasi dan risiko data.'
          : 'Hubungkan setiap bukti dengan hal yang ia dukung: sebuah risiko, sumber, atau kesimpulan, lalu pastikan ada jalur menuju kesimpulan.';

        board = SIGAP.games.evidenceBoard.create({
          container: boardHost,
          nodes: nodes,
          validPairs: required,
          optionalPairs: optional,
          hints: [
            hint2,
            function (missing) {
              if (!missing.length) return 'Ada hubungan yang tidak didukung bukti. Hapus yang tidak bisa kamu jelaskan.';
              return 'Perhatikan node "' + missing[0][0] + '" belum terhubung dengan pasangan yang tepat.';
            }
          ],
          onSolved: function (wrong) {
            run.boardWrong = wrong;
            SIGAP.ui.toast('Papan bukti tersusun. Saatnya memutuskan.', 'success');
            doneBtn.hidden = false;
            doneBtn.focus();
          }
        });

        panel.appendChild(doneBtn);
        content.appendChild(panel);
      }

      /* ================= PUTUSKAN ================= */
      function phasePutuskan() {
        setPhase(4);
        clearContent();

        var panel = el('div', 'panel panel--glass stack');
        panel.appendChild(el('div', 'panel-title', 'PUTUSKAN: APA YANG SEBAIKNYA RAKA LAKUKAN?'));

        var picked = null;
        var opts = el('div', 'stack stack--sm');
        DECISIONS.forEach(function (d) {
          var card = el('button', 'option-card');
          card.type = 'button';
          card.setAttribute('aria-pressed', 'false');
          card.appendChild(el('span', 'option-card__key', d.key));
          var t = el('span');
          t.textContent = d.text;
          card.appendChild(t);
          card.addEventListener('click', function () {
            if (SIGAP.audio) SIGAP.audio.sfx('click');
            Array.prototype.forEach.call(opts.querySelectorAll('.option-card'), function (c) {
              c.setAttribute('aria-pressed', 'false');
            });
            card.setAttribute('aria-pressed', 'true');
            picked = d;
            submitBtn.disabled = false;
          });
          opts.appendChild(card);
        });
        panel.appendChild(opts);

        var slider = SIGAP.ui.confidenceSlider({
          label: 'Seberapa yakin kamu dengan keputusan ini?',
          value: 50
        });
        panel.appendChild(slider.el);

        var submitBtn = el('button', 'btn btn--primary btn--lg');
        submitBtn.type = 'button';
        submitBtn.textContent = 'Kunci keputusan ▸';
        submitBtn.disabled = true;
        submitBtn.addEventListener('click', function () {
          SIGAP.ui.confirm(
            'Kunci keputusan?',
            'Keputusan: ' + picked.key + '. Confidence: ' + slider.get() + '%. Setelah dikunci, kamu akan diminta menjelaskan buktimu.',
            function () {
              run.decision = picked;
              run.confidence = slider.get();
              phaseJelaskan();
            },
            { yesLabel: 'Ya, kunci', noLabel: 'Periksa lagi' }
          );
        });
        panel.appendChild(submitBtn);

        content.appendChild(panel);
      }

      /* ================= JELASKAN ================= */
      function phaseJelaskan() {
        setPhase(5);
        clearContent();

        var panel = el('div', 'panel panel--glass stack');
        panel.appendChild(el('div', 'panel-title', 'JELASKAN: BUKTI APA YANG MENDUKUNG KEPUTUSANMU?'));
        panel.appendChild(el('p', '', 'Pilih <strong>2–3 bukti terkuat</strong> yang mendukung keputusanmu. Kalau kamu tidak bisa menjelaskannya, kamu belum selesai menyelidiki.'));

        var chosen = [];
        var list = el('div', 'stack stack--sm');
        run.opened.forEach(function (id) {
          var entry = catalogEntry(id);
          var row = el('label', 'c1-check');
          var cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.value = id;
          cb.addEventListener('change', function () {
            if (cb.checked) chosen.push(id);
            else chosen = chosen.filter(function (x) { return x !== id; });
            sendBtn.disabled = !(chosen.length >= 2 && chosen.length <= 3);
            countEl.textContent = chosen.length + ' dipilih (minimal 2, maksimal 3)';
          });
          var span = el('span');
          span.innerHTML = '<strong>' + SIGAP.ui.escapeHtml(entry.title) + '</strong><br><span class="text-xs text-muted">' +
            SIGAP.ui.escapeHtml(entry.source) + '</span>';
          row.appendChild(cb);
          row.appendChild(span);
          list.appendChild(row);
        });
        panel.appendChild(list);

        var countEl = el('p', 'text-xs text-muted', '0 dipilih (minimal 2, maksimal 3)');
        panel.appendChild(countEl);

        var sendBtn = el('button', 'btn btn--primary btn--lg');
        sendBtn.type = 'button';
        sendBtn.textContent = 'Kirim penjelasan ▸';
        sendBtn.disabled = true;
        sendBtn.addEventListener('click', function () {
          run.explainSelected = chosen.slice();
          finalize();
        });
        panel.appendChild(sendBtn);

        content.appendChild(panel);
      }

      /* ================= scoring + debrief ================= */
      function finalize() {
        var correct = run.decision.correct;
        var iq = investigationQuality();
        var er = evidenceRelevance();

        var out = SIGAP.scoring.finishCase({
          caseId: 'case001',
          investigationQuality: iq,
          decisionCorrect: correct,
          evidenceRelevance: er,
          confidence: run.confidence,
          decisionLabel: run.decision.key + ': ' + run.decision.text,
          competencies: {
            digitalSafety: { score: correct ? Math.max(iq, 70) : Math.min(iq, 45), weight: 2 },
            evidenceReasoning: { score: er, weight: 1.5 },
            criticalThinking: { score: iq, weight: 1 }
          },
          xp: 100
        });
        run.finishResult = out;

        if (!out.practice) {
          if (run.decision.key === 'A') {
            SIGAP.scoring.recordMisconception('case001',
              'Percaya file dari "teman" tanpa verifikasi, meski format file tidak sesuai klaim (memilih install APK).');
          } else if (run.decision.key === 'D') {
            SIGAP.scoring.recordMisconception('case001',
              'Menyebarkan file mencurigakan ke orang lain untuk "dicoba" berarti memperluas risiko, bukan mengujinya.');
          }
          if (correct && run.confidence >= 75 && run.confidence <= 90) {
            SIGAP.achievements.unlock('calibrated-thinker');
          }
        }

        showDebrief(out);
      }

      function showDebrief(out) {
        setPhase(5);
        clearContent();
        var result = out.result;
        var correct = run.decision.correct;

        var panel = el('div', 'panel panel--glass stack');
        panel.appendChild(el('div', 'panel-title', 'DEBRIEF: CASE 001'));

        if (out.practice) {
          panel.appendChild(el('div', 'practice-banner', 'PRACTICE RUN: XP tidak diberikan'));
        }

        var verdict = el('div', 'debrief-verdict ' + (correct ? 'debrief-verdict--good' : 'debrief-verdict--bad'));
        verdict.appendChild(el('span', 'debrief-verdict__icon', correct ? '✔' : '✖'));
        var vText = el('div');
        if (correct) {
          vText.innerHTML = '<strong>Keputusan tepat.</strong> Tiga bukti independen saling mendukung: ' +
            'format file (.apk) tidak cocok dengan klaim "foto", permission yang diminta (SMS, Kontak, Accessibility) ' +
            'tidak masuk akal untuk melihat foto, dan Dimas sendiri menyangkal mengirim file. ' +
            'Jangan instal, verifikasi lewat jalur lain, hapus, lalu laporkan. Itu melindungi dirimu dan orang lain.';
        } else {
          var missed = SOURCES.filter(function (s) { return run.opened.indexOf(s.id) === -1; })
            .map(function (s) { return s.label; });
          vText.innerHTML = '<strong>Keputusan ' + run.decision.key + ' belum tepat.</strong> ' +
            (run.decision.key === 'A'
              ? 'Format .apk bertentangan dengan klaim "foto", dan permission yang diminta bisa mencuri SMS serta kontak. Meng-install berarti menyerahkan datamu.'
              : run.decision.key === 'B'
                ? 'Mengabaikan memang lebih aman daripada meng-install, tetapi pengirim palsu itu akan mengirim file yang sama ke teman-temanmu. Verifikasi dan laporkan.'
                : 'Meneruskan file mencurigakan justru memperluas jangkauan penyerang; temanmu bisa jadi korban berikutnya.') +
            (missed.length ? ' Sumber yang belum kamu periksa: ' + missed.join(', ') + '.' : '') +
            ' Bukan soal siapa yang salah. Periksa lagi buktinya, lalu coba tarik kesimpulan yang paling didukung bukti.';
        }
        verdict.appendChild(vText);
        panel.appendChild(verdict);

        var scores = el('div', 'panel');
        scores.appendChild(el('div', 'panel-title', 'RINCIAN SKOR'));
        [
          ['Kualitas Investigasi (40%)', result.breakdown.investigationQuality],
          ['Ketepatan Keputusan (30%)', result.breakdown.decisionCorrectness],
          ['Relevansi Bukti (20%)', result.breakdown.evidenceRelevance],
          ['Kalibrasi Confidence (10%)', result.breakdown.confidenceCalibration]
        ].forEach(function (rowDef) {
          var row = el('div', 'score-row');
          var lbl = el('span');
          lbl.textContent = rowDef[0];
          row.appendChild(lbl);
          row.appendChild(el('span', 'score-row__val', rowDef[1] + ' / 100'));
          scores.appendChild(row);
        });
        var total = el('div', 'score-total');
        var tl = el('span');
        tl.textContent = 'SKOR AKHIR';
        total.appendChild(tl);
        total.appendChild(el('span', 'score-total__val', String(result.total)));
        scores.appendChild(total);
        panel.appendChild(scores);

        var cal = el('p', 'c1-feedback c1-feedback--info');
        cal.textContent = '⚖ ' + result.calibrationFeedback;
        panel.appendChild(cal);

        var nextBtn = el('button', 'btn btn--primary btn--lg');
        nextBtn.type = 'button';
        nextBtn.textContent = 'Lanjut ▸';
        nextBtn.addEventListener('click', showCinematic);
        panel.appendChild(nextBtn);

        content.appendChild(panel);
      }

      /* ================= cinematic + reflection + phantom ================= */
      function showCinematic() {
        cineEl = el('div', 'case-complete-cine');
        cineEl.setAttribute('role', 'dialog');
        cineEl.setAttribute('aria-label', 'Kasus selesai');
        cineEl.appendChild(el('div', 'case-complete-cine__stamp', 'CASE CLOSED'));
        cineEl.appendChild(el('p', 'text-mono text-muted', 'CASE 001: FILE MISTERI · ARSIP DISEGEL'));
        var btn = el('button', 'btn btn--primary btn--lg');
        btn.type = 'button';
        btn.textContent = 'Lanjut';
        btn.addEventListener('click', function () {
          if (cineEl && cineEl.parentNode) cineEl.parentNode.removeChild(cineEl);
          cineEl = null;
          phaseRefleksi();
        });
        cineEl.appendChild(btn);
        document.body.appendChild(cineEl);
        if (SIGAP.audio) SIGAP.audio.sfx('success');
        btn.focus();
      }

      function phaseRefleksi() {
        setPhase(6);
        clearContent();

        var panel = el('div', 'panel panel--glass stack');
        panel.appendChild(el('div', 'panel-title', 'REFLEKSI'));
        panel.appendChild(SIGAP.ui.reflectionForm({
          contextId: 'case001',
          questions: [
            'Bukti mana yang paling mengubah keputusanmu? Mengapa?',
            'Apa yang akan kamu lakukan jika pesan seperti ini datang dari orang tuamu?'
          ],
          onDone: showEnding
        }));
        content.appendChild(panel);
      }

      function showEnding() {
        clearContent();

        var panel = el('div', 'panel panel--glass stack');
        panel.appendChild(el('div', 'panel-title', 'CASE 001 SELESAI'));
        panel.appendChild(el('p', '',
          'Metode yang kamu pakai di sini. Periksa format, periksa izin, konfirmasi lewat jalur lain. ' +
          'berlaku untuk file apa pun, dari siapa pun.'));

        var rowBtns = el('div', 'row');
        var backBtn = el('a', 'btn btn--ghost btn--lg');
        backBtn.href = '#/academy';
        backBtn.textContent = 'Kembali ke Academy';
        rowBtns.appendChild(backBtn);
        var nextCase = el('a', 'btn btn--primary btn--lg');
        nextCase.href = '#/case002';
        nextCase.textContent = 'CASE 002 ▸';
        rowBtns.appendChild(nextCase);
        panel.appendChild(rowBtns);
        content.appendChild(panel);

        // PHANTOM first contact, only after the first (non-practice) completion.
        var story = SIGAP.state.get().story;
        if (!run.finishResult.practice && !story.phantomIntroSeen) {
          SIGAP.ui.dialogue.play(SIGAP.data.dialogues.phantomFirstContact, {
            onEnd: function () {
              SIGAP.state.update(function (s) { s.story.phantomIntroSeen = true; });
            }
          });
        }
      }

      /* ================= boot ================= */
      function startIntro() {
        SIGAP.ui.dialogue.play(INTRO_LINES, { onEnd: phaseAmati });
      }

      setPhase(0);
      if (!SIGAP.state.tutorialSeen('universal')) {
        SIGAP.ui.dialogue.play(SIGAP.data.dialogues.universalTutorial, {
          onEnd: function () {
            SIGAP.state.markTutorialSeen('universal');
            startIntro();
          }
        });
      } else {
        startIntro();
      }
    },

    onLeave: function () {
      if (board) { board.destroy(); board = null; }
      if (cineEl && cineEl.parentNode) { cineEl.parentNode.removeChild(cineEl); }
      cineEl = null;
      SIGAP.ui.dialogue.stop();
      run = null;
    }
  });
})();
