/* ============================================================
   SIGAP — games/case003.js
   CASE 003 "Link Palsu" — phishing email investigation.
   Flow: AMATI → HIPOTESIS → VERIFIKASI → BANDINGKAN →
         PUTUSKAN → JELASKAN → REFLEKSI.
   Semua nama domain dalam kasus ini FIKTIF untuk latihan.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.data = SIGAP.data || {};
  SIGAP.data.evidenceCatalog = SIGAP.data.evidenceCatalog || {};

  var CASE_ID = 'case003';

  /* ---------------- Evidence catalog ---------------- */
  SIGAP.data.evidenceCatalog[CASE_ID] = {
    'c3-sender': {
      id: 'c3-sender',
      title: 'Domain pengirim tidak cocok',
      body: 'Alamat lengkap pengirim: cs@nusantara-ekspres.resi-cek.top. Dibaca dari kanan, domain utamanya adalah resi-cek.top — bukan nusantara-ekspres.com. Nama merek hanya dipakai sebagai subdomain.',
      source: 'Header email — kolom Dari',
      strength: 'KUAT'
    },
    'c3-url': {
      id: 'c3-url',
      title: 'Anatomi link tujuan',
      body: 'Tombol BAYAR SEKARANG mengarah ke nusantara-ekspres.track-verifikasi.top. Pemilik situs ditentukan oleh domain utama paling kanan: track-verifikasi.top. Nama merek di depannya hanya subdomain yang bisa ditulis siapa saja.',
      source: 'URL Inspector',
      strength: 'KUAT'
    },
    'c3-urgency': {
      id: 'c3-urgency',
      title: 'Tekanan waktu + nominal kecil',
      body: 'Tenggat 1x24 jam dan tagihan hanya Rp3.000. Ini pola tekanan sosial: batas waktu membuat panik, nominal kecil menurunkan kewaspadaan. Target sebenarnya biasanya data kartu, bukan tiga ribu rupiah.',
      source: 'Isi email',
      strength: 'SEDANG'
    },
    'c3-form': {
      id: 'c3-form',
      title: 'Form meminta data sensitif',
      body: 'Untuk "pembayaran Rp3.000", form meminta nomor kartu, masa berlaku, CVV, dan kode OTP. Data pembayaran merupakan informasi sensitif dan dapat disalahgunakan dalam transaksi tertentu — jauh lebih berharga daripada Rp3.000.',
      source: 'Sandbox Investigasi',
      strength: 'KUAT'
    },
    'c3-resmi': {
      id: 'c3-resmi',
      title: 'Cek resi di kanal resmi',
      body: 'Situs resmi (alamat diketik sendiri, bukan dari link email) menunjukkan tidak ada paket tertahan. Kurir resmi juga menyatakan tidak pernah menagih biaya lewat link email.',
      source: 'Verifikasi mandiri',
      strength: 'KUAT'
    },
    'c3-visual': {
      id: 'c3-visual',
      title: 'Tampilan meyakinkan',
      body: 'Logo, warna, dan gaya bahasa email terlihat resmi. Tampilan mudah ditiru, jadi ini BUKAN bukti keaslian — tetapi juga bukan bukti penipuan. Bukti kuat ada di domain dan data yang diminta.',
      source: 'Pengamatan visual',
      strength: 'LEMAH'
    }
  };
  var CATALOG = SIGAP.data.evidenceCatalog[CASE_ID];

  /* ---------------- Static content ---------------- */
  var PHASES = ['AMATI', 'HIPOTESIS', 'VERIFIKASI', 'BANDINGKAN', 'PUTUSKAN', 'JELASKAN', 'REFLEKSI'];

  var PHISH_URL_PARTS = [
    { key: 'proto', text: 'https://', label: 'PROTOKOL',
      note: 'HTTPS berarti koneksi terenkripsi — datamu tidak bisa diintip di jalan. Tapi HTTPS TIDAK berarti situsnya jujur. Situs penipuan juga bisa memakai HTTPS.' },
    { key: 'sub', text: 'nusantara-ekspres', label: 'SUBDOMAIN',
      note: 'Ini SUBDOMAIN. Pemilik domain bebas menulis apa pun di bagian ini — termasuk nama merek orang lain. Nama merek di sini tidak membuktikan apa-apa.' },
    { key: 'domain', text: '.track-verifikasi', label: 'DOMAIN UTAMA',
      note: 'Ini DOMAIN UTAMA. Bersama ekstensi di kanannya (track-verifikasi.top), bagian inilah yang menentukan siapa PEMILIK situs.' },
    { key: 'tld', text: '.top', label: 'EKSTENSI (TLD)',
      note: 'Ini ekstensi domain (TLD). Ingat: ekstensi domain BUKAN bukti penipuan — .top, .net, .com bisa dipakai siapa saja. Pertanyaan yang benar: apakah domain ini benar-benar dimiliki Nusantara Ekspres?' },
    { key: 'path', text: '/pay?id=8817', label: 'PATH',
      note: 'Ini PATH dan parameter — halaman di dalam situs. Isinya diatur pemilik situs dan tidak mengubah siapa pemiliknya.' }
  ];

  var CHALLENGES = [
    {
      q: 'Soal 1 — Mana yang benar-benar halaman milik BRI?',
      urls: ['https://bri.co.id/promo', 'https://bri.co.id.promo-spesial.net/login'],
      correctUrl: 0,
      pickWhy: 'URL pertama: domain utamanya bri.co.id. URL kedua: dibaca dari kanan, domain utamanya promo-spesial.net — "bri.co.id" di depannya hanya subdomain.',
      reasons: [
        { text: 'Pada URL kedua, domain utamanya adalah promo-spesial.net; tulisan "bri.co.id" hanya subdomain.', correct: true, fb: 'Tepat. Baca dari kanan: promo-spesial.net adalah pemilik sesungguhnya.' },
        { text: 'URL kedua memakai .net, dan .net selalu dipakai penipu.', correct: false, tldMisc: true, fb: 'Keliru. Ekstensi domain bukan bukti penipuan — banyak organisasi resmi memakai .net. Masalahnya: domain promo-spesial.net bukan milik BRI.' },
        { text: 'URL pertama lebih pendek, dan URL pendek pasti resmi.', correct: false, fb: 'Keliru. Panjang URL bukan bukti. Penipu bisa membuat URL pendek; situs resmi bisa punya URL panjang.' }
      ]
    },
    {
      q: 'Soal 2 — Mana yang PERLU DIVERIFIKASI lebih lanjut sebelum dipercaya?',
      urls: ['https://dana.id', 'https://dana-id.top', 'https://help.dana.id'],
      correctUrl: 1,
      pickWhy: 'dana.id dan help.dana.id berada di domain utama yang sama (dana.id). dana-id.top adalah DOMAIN LAIN: tanda hubung tidak memisahkan domain — "dana-id" adalah satu nama utuh.',
      reasons: [
        { text: 'dana-id.top adalah domain berbeda dari dana.id; tanda hubung membuat nama domain baru, jadi perlu dicek siapa pemiliknya.', correct: true, fb: 'Tepat. Titik memisahkan subdomain, tanda hubung tidak. dana-id.top perlu dicek kepemilikannya sebelum dipercaya.' },
        { text: 'Karena berakhiran .top, sudah pasti penipuan.', correct: false, tldMisc: true, fb: 'Keliru. Ekstensi .top bisa dipakai siapa saja, termasuk organisasi resmi. Yang membuatnya perlu diverifikasi adalah domainnya BERBEDA dari domain resmi — bukan ekstensinya.' },
        { text: 'help.dana.id mencurigakan karena memakai subdomain.', correct: false, fb: 'Keliru. Subdomain di domain resmi (help.dana.id) adalah hal wajar — pemiliknya tetap dana.id. Yang perlu dicek justru domain yang berbeda.' }
      ]
    },
    {
      q: 'Soal 3 — Mana halaman ujian yang berada di domain resmi sekolah?',
      urls: ['https://sekolah.sch.id/ujian', 'https://sekolah-sch-id.web.app/ujian'],
      correctUrl: 0,
      pickWhy: 'URL pertama: domain utamanya sekolah.sch.id (domain sekolah). URL kedua: domain utamanya web.app — layanan hosting; "sekolah-sch-id" hanya nama subdomain yang bisa didaftarkan siapa pun.',
      reasons: [
        { text: 'sekolah-sch-id.web.app adalah subdomain di layanan hosting web.app; siapa pun bisa membuatnya, jadi perlu diverifikasi.', correct: true, fb: 'Tepat. Nama yang mirip domain resmi bisa didaftarkan siapa saja di layanan hosting. Verifikasi lewat kanal resmi sekolah.' },
        { text: 'URL kedua pasti palsu karena mengandung tanda hubung.', correct: false, fb: 'Keliru. Banyak domain resmi memakai tanda hubung. Masalahnya bukan tanda hubung, melainkan siapa pemilik domain utamanya (web.app milik layanan hosting).' },
        { text: 'Domain web.app dikelola perusahaan besar, jadi semua isinya pasti aman.', correct: false, fb: 'Keliru. Layanan hosting yang resmi tetap bisa dipakai orang lain untuk membuat halaman tiruan. Pengelola platform ≠ pembuat halaman.' }
      ]
    }
  ];

  var CHALLENGE_HINTS = [
    'Baca setiap URL dari KANAN: temukan dulu ekstensi (TLD), lalu satu bagian di kirinya — itulah domain utama pemilik situs.',
    'Tanda TITIK memisahkan subdomain dari domain. Tanda HUBUNG tidak memisahkan apa-apa — "dana-id" adalah satu nama utuh yang berbeda dari "dana.id".',
    'Jangan menilai dari ekstensi (.top/.net) atau dari kemiripan nama. Tanyakan: siapa pemilik domain utama paling kanan?'
  ];

  var DECISIONS = [
    { key: 'A', label: 'Bayar Rp3.000 — cuma tiga ribu, tidak seberapa.',
      misc: 'Menganggap nominal kecil berarti risiko kecil; target penipu adalah data kartu/OTP, bukan Rp3.000.' },
    { key: 'B', label: 'Klik link untuk cek dulu; isi data kalau tampilannya terlihat resmi.',
      misc: 'Menganggap tampilan situs yang resmi sebagai bukti keaslian; tampilan mudah ditiru.' },
    { key: 'C', label: 'Jangan klik. Verifikasi lewat kanal resmi, tandai spam/laporkan, dan beri tahu keluarga.' },
    { key: 'D', label: 'Balas email dan minta mereka mengirim bukti bahwa mereka kurir asli.' }
  ];
  var CORRECT_DECISION = 'C';

  /* ---------------- Run state ---------------- */
  var run = null;
  var phaseHost = null;
  var stepsHost = null;
  var trayHost = null;

  function newRun() {
    return {
      phase: 0,
      evidence: [],
      inspected: { sender: false, urgency: false, visual: false, peek: false },
      urlSeen: {},
      urlQuizPoints: null,   // 0–30
      urlQuizTries: 0,
      hypothesis: null,
      sandboxDone: false,
      officialDone: false,
      challenge: { idx: 0, points: 0, allCorrect: true, done: false, hintIdx: 0 },
      decision: null,
      confidence: 75,
      selectedEvidence: [],
      finished: null
    };
  }

  function sfx(n) { if (SIGAP.audio) SIGAP.audio.sfx(n); }

  function foundEvidence(id) {
    if (!run || run.evidence.indexOf(id) !== -1) return;
    run.evidence.push(id);
    SIGAP.state.recordEvidence(CASE_ID, id);
    sfx('evidence');
    SIGAP.ui.toast('Bukti dicatat: ' + CATALOG[id].title, 'success');
    renderTray();
  }

  /* ---------------- Small builders ---------------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function btn(label, cls, onClick) {
    var b = el('button', cls, label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }
  function esc(s) { return SIGAP.ui.escapeHtml(s); }

  function renderTray() {
    if (!trayHost) return;
    trayHost.innerHTML = '';
    var title = el('div', 'panel-title', 'BUKTI TERKUMPUL (' + run.evidence.length + '/6)');
    trayHost.appendChild(title);
    if (!run.evidence.length) {
      trayHost.appendChild(el('p', 'text-sm text-muted', 'Belum ada bukti. Periksa elemen email satu per satu.'));
      return;
    }
    run.evidence.forEach(function (id) {
      var ev = CATALOG[id];
      trayHost.appendChild(SIGAP.ui.evidenceCard({
        id: ev.id, title: ev.title, body: ev.body, source: ev.source, strength: ev.strength, found: true
      }));
    });
  }

  function setPhase(i) {
    run.phase = i;
    renderPhase();
    window.scrollTo(0, 0);
  }

  function renderSteps() {
    stepsHost.innerHTML = '';
    stepsHost.appendChild(SIGAP.ui.phaseSteps(PHASES, run.phase));
  }

  function renderPhase() {
    renderSteps();
    phaseHost.innerHTML = '';
    [renderAmati, renderHipotesis, renderVerifikasi, renderBandingkan,
     renderPutuskan, renderJelaskan, renderRefleksi][run.phase](phaseHost);
  }

  /* ================= PHASE 0 — AMATI ================= */
  function buildEmail(interactive) {
    var wrap = el('div', 'c3-email panel');
    wrap.appendChild(el('div', 'c3-email__chrome',
      '<span aria-hidden="true">✉</span> KOTAK MASUK — email diteruskan oleh pelapor'));

    var head = el('div', 'c3-email__head');
    var senderBtn = btn(
      '<span class="c3-email__k">Dari:</span> <strong>Nusantara Ekspres Official</strong> ' +
      '<span class="text-mono text-xs">&lt;cs@nusantara-ekspres.resi-cek.top&gt;</span>' +
      '<span class="c3-inspect-hint">🔍 periksa</span>',
      'c3-inspect', function () { if (interactive) inspectSender(); });
    if (!interactive) senderBtn.disabled = true;
    head.appendChild(senderBtn);
    head.appendChild(el('div', 'c3-email__row', '<span class="c3-email__k">Kepada:</span> kamu@mail.example'));
    head.appendChild(el('div', 'c3-email__row', '<span class="c3-email__k">Subjek:</span> <strong>⚠ Paket Anda tertahan — tindakan diperlukan</strong>'));
    wrap.appendChild(head);

    var body = el('div', 'c3-email__body');
    var logoBtn = btn('<span class="c3-email__logo" aria-hidden="true">📦</span> NUSANTARA EKSPRES <span class="c3-inspect-hint">🔍 periksa tampilan</span>',
      'c3-inspect c3-email__brand', function () { if (interactive) inspectVisual(); });
    if (!interactive) logoBtn.disabled = true;
    body.appendChild(logoBtn);
    body.appendChild(el('p', null, 'Pelanggan Yth.,'));
    body.appendChild(el('p', null, 'Paket Anda tertahan di gudang sortir karena alamat tidak lengkap.'));
    var urgBtn = btn('Bayar <strong>Rp3.000</strong> untuk penjadwalan ulang pengiriman dalam <strong>1x24 jam</strong> atau paket dikembalikan.' +
      '<span class="c3-inspect-hint">🔍 periksa</span>',
      'c3-inspect', function () { if (interactive) inspectUrgency(); });
    if (!interactive) urgBtn.disabled = true;
    body.appendChild(urgBtn);

    var cta = btn('BAYAR SEKARANG', 'c3-cta', function () { if (interactive) peekCta(); });
    cta.setAttribute('aria-label', 'Tombol BAYAR SEKARANG — periksa tautan tanpa membukanya');
    if (!interactive) cta.disabled = true;
    body.appendChild(cta);
    body.appendChild(el('p', 'text-xs text-faint', 'Nusantara Ekspres · Layanan Pelanggan · No-reply'));
    wrap.appendChild(body);
    return wrap;
  }

  function lessonModal(title, html, onClose) {
    SIGAP.ui.modal({
      title: title,
      body: html,
      actions: [{ label: 'Mengerti', variant: 'primary', onClick: function (close) { close(); if (onClose) onClose(); } }],
      dismissible: true
    });
  }

  function inspectSender() {
    run.inspected.sender = true;
    sfx('scan');
    lessonModal('Periksa: alamat pengirim',
      '<p>Nama tampilan bisa ditulis bebas — yang penting alamat lengkapnya:</p>' +
      '<p class="c3-urlbox text-mono">cs@<span class="c3-seg c3-seg--sub">nusantara-ekspres</span><span class="c3-seg c3-seg--dom">.resi-cek</span><span class="c3-seg c3-seg--tld">.top</span></p>' +
      '<p>Cara baca domain: <strong>dari kanan ke kiri</strong>. Ekstensi dulu (<span class="text-mono">.top</span>), lalu domain utama (<span class="text-mono">resi-cek</span>). Jadi pemilik alamat ini adalah <strong class="text-mono">resi-cek.top</strong> — bukan nusantara-ekspres.com.</p>' +
      '<p class="text-sm text-muted">Bagian kiri (subdomain) bisa diisi nama merek apa pun oleh pemilik domain.</p>',
      function () { foundEvidence('c3-sender'); refreshAmati(); });
  }

  function inspectUrgency() {
    run.inspected.urgency = true;
    sfx('scan');
    lessonModal('Periksa: tekanan & nominal',
      '<p>Dua teknik tekanan sosial dalam satu kalimat:</p>' +
      '<ul class="c3-list"><li><strong>Tenggat 1x24 jam</strong> — membuat panik agar kamu tidak sempat berpikir dan bertanya.</li>' +
      '<li><strong>Nominal kecil (Rp3.000)</strong> — terasa "tidak ada ruginya", sehingga kewaspadaan turun.</li></ul>' +
      '<p>Kalau targetnya cuma Rp3.000, kenapa repot-repot? Biasanya karena target sebenarnya adalah <strong>data pembayaranmu</strong>.</p>',
      function () { foundEvidence('c3-urgency'); refreshAmati(); });
  }

  function inspectVisual() {
    run.inspected.visual = true;
    sfx('scan');
    lessonModal('Periksa: tampilan email',
      '<p>Logo dan gaya bahasanya memang terlihat resmi. Tapi ingat: <strong>tampilan mudah ditiru</strong> — cukup salin gambar dan warna dari situs asli.</p>' +
      '<p>Tampilan resmi <em>bukan bukti keaslian</em>, dan tampilan aneh juga <em>bukan bukti penipuan</em>. Bukti yang lebih kuat: domain pengirim, link tujuan, dan data yang diminta.</p>',
      function () { foundEvidence('c3-visual'); refreshAmati(); });
  }

  function peekCta() {
    run.inspected.peek = true;
    sfx('warning');
    lessonModal('Tahan dulu — jangan klik sembarangan',
      '<p>Di perangkat asli, kamu bisa <strong>menahan/hover tombol tanpa mengeklik</strong> untuk melihat tujuannya. Tombol ini mengarah ke:</p>' +
      '<p class="c3-urlbox text-mono">https://nusantara-ekspres.track-verifikasi.top/pay?id=8817</p>' +
      '<p class="text-sm text-muted">Kita akan membedah URL ini di tahap VERIFIKASI — di dalam sandbox yang aman, bukan di perangkat asli.</p>',
      function () { refreshAmati(); });
  }

  var amatiRefresh = null;
  function refreshAmati() { if (amatiRefresh) amatiRefresh(); }

  function renderAmati(host) {
    var layout = el('div', 'case-layout');
    var left = el('div', 'stack');
    left.appendChild(el('p', 'text-sm text-muted',
      'Amati email di bawah. Ketuk bagian yang bertanda 🔍 untuk memeriksanya. Semua nama domain dalam kasus ini fiktif untuk latihan.'));
    left.appendChild(buildEmail(true));

    var right = el('div', 'stack');
    var status = el('div', 'panel panel--glass stack--sm stack');
    right.appendChild(status);
    trayHost = el('div', 'panel panel--glass c3-tray');
    right.appendChild(trayHost);
    renderTray();

    amatiRefresh = function () {
      status.innerHTML = '';
      var n = ['sender', 'urgency', 'visual', 'peek'].filter(function (k) { return run.inspected[k]; }).length;
      status.appendChild(el('div', 'panel-title', 'PENGAMATAN'));
      status.appendChild(el('p', 'text-sm', 'Elemen diperiksa: <strong>' + n + '/4</strong>'));
      var next = btn('Lanjut ke HIPOTESIS →', 'btn btn--primary btn--block', function () { setPhase(1); });
      if (!run.inspected.sender) {
        next.disabled = true;
        status.appendChild(el('p', 'text-xs text-amber', 'Minimal periksa alamat pengirim sebelum lanjut.'));
      } else if (n < 4) {
        status.appendChild(el('p', 'text-xs text-muted', 'Masih ada elemen yang belum diperiksa — pengamatan lengkap menaikkan kualitas investigasimu.'));
      }
      status.appendChild(next);
    };
    amatiRefresh();

    layout.appendChild(left);
    layout.appendChild(right);
    host.appendChild(layout);
  }

  /* ================= PHASE 1 — HIPOTESIS ================= */
  function renderHipotesis(host) {
    var panel = el('div', 'panel stack');
    panel.appendChild(el('div', 'panel-title', 'HIPOTESIS AWAL'));
    panel.appendChild(el('p', null, 'Berdasarkan pengamatanmu, apa dugaan awalmu tentang email ini? Hipotesis bukan kesimpulan — nanti kita uji.'));
    var opts = [
      { key: 'asli', label: 'Email asli dari kurir — mungkin memang ada masalah paket.' },
      { key: 'phishing', label: 'Email phishing — mencoba mencuri uang atau data.' },
      { key: 'belum', label: 'Belum cukup bukti — perlu verifikasi dulu.' }
    ];
    var chosen = null;
    var cards = [];
    var next = btn('Uji hipotesis → VERIFIKASI', 'btn btn--primary', function () {
      if (!chosen) return;
      run.hypothesis = chosen;
      setPhase(2);
    });
    next.disabled = true;
    opts.forEach(function (o, i) {
      var c = btn('<span class="option-card__key">' + (i + 1) + '</span>' + esc(o.label), 'option-card', function () {
        chosen = o.key;
        cards.forEach(function (cc) { cc.setAttribute('aria-pressed', 'false'); });
        c.setAttribute('aria-pressed', 'true');
        next.disabled = false;
        sfx('click');
      });
      c.setAttribute('aria-pressed', 'false');
      cards.push(c);
      panel.appendChild(c);
    });
    panel.appendChild(el('p', 'text-sm text-muted', 'Tidak ada jawaban "salah" di tahap ini. Investigator yang baik siap mengubah hipotesis kalau bukti berkata lain.'));
    panel.appendChild(next);
    host.appendChild(el('div', 'container--narrow')).appendChild(panel);
  }

  /* ================= PHASE 2 — VERIFIKASI ================= */
  function renderVerifikasi(host) {
    var layout = el('div', 'case-layout');
    var left = el('div', 'stack');
    var right = el('div', 'stack');

    /* --- URL Inspector --- */
    var insp = el('div', 'panel stack');
    insp.appendChild(el('div', 'panel-title', 'URL INSPECTOR'));
    insp.appendChild(el('div', 'sim-label', 'SIMULATED FORENSIC TOOL — bukan detector otomatis; alat ini hanya membantu KAMU membaca'));
    insp.appendChild(el('p', 'text-sm',
      'Link tombol BAYAR SEKARANG. Nama merek di depan URL — meyakinkan, bukan? Sekarang <strong>baca dari kanan</strong>. Ketuk setiap bagian:'));

    var bar = el('div', 'c3-urlbar');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Bagian-bagian URL, ketuk untuk anotasi');
    var noteBox = el('div', 'c3-note');
    noteBox.setAttribute('aria-live', 'polite');
    noteBox.appendChild(el('p', 'text-sm text-muted', 'Ketuk bagian URL untuk melihat penjelasannya.'));

    var quizHost = el('div', 'stack');

    function maybeShowQuiz() {
      var all = PHISH_URL_PARTS.every(function (p) { return run.urlSeen[p.key]; });
      if (!all || run.urlQuizPoints !== null || quizHost.childNodes.length) return;
      buildUrlQuiz(quizHost);
    }

    PHISH_URL_PARTS.forEach(function (p) {
      var seg = btn(esc(p.text), 'c3-urlseg c3-urlseg--' + p.key, function () {
        run.urlSeen[p.key] = true;
        seg.classList.add('c3-urlseg--seen');
        noteBox.innerHTML = '';
        noteBox.appendChild(el('div', 'tag tag--cyan', p.label));
        noteBox.appendChild(el('p', 'text-sm', p.note));
        sfx('scan');
        maybeShowQuiz();
        refreshVerif();
      });
      seg.setAttribute('aria-label', p.label + ': ' + p.text);
      bar.appendChild(seg);
    });

    insp.appendChild(bar);
    insp.appendChild(noteBox);
    insp.appendChild(quizHost);
    left.appendChild(insp);

    function buildUrlQuiz(qh) {
      qh.appendChild(el('div', 'panel-title', 'UJI PEMAHAMAN'));
      qh.appendChild(el('p', 'text-sm', 'Bagian mana yang menentukan siapa <strong>PEMILIK</strong> situs ini?'));
      var row = el('div', 'c3-quizrow');
      PHISH_URL_PARTS.forEach(function (p) {
        row.appendChild(btn(esc(p.text), 'c3-urlseg', function () { answerUrlQuiz(p.key, qh, row); }));
      });
      qh.appendChild(row);
    }

    function answerUrlQuiz(key, qh, row) {
      if (run.urlQuizPoints !== null) return;
      run.urlQuizTries += 1;
      var fb;
      if (key === 'domain') {
        run.urlQuizPoints = run.urlQuizTries === 1 ? 30 : 15;
        sfx('success');
        fb = el('div', 'c3-note c3-note--ok',
          '<strong>Tepat.</strong> Domain utama + ekstensi paling kanan (<span class="text-mono">track-verifikasi.top</span>) menentukan pemilik situs. Nama merek di kiri hanya subdomain.');
      } else if (key === 'tld') {
        run.urlQuizPoints = run.urlQuizTries === 1 ? 20 : 12;
        sfx('warning');
        fb = el('div', 'c3-note c3-note--warn',
          '<strong>Hampir.</strong> Ekstensi memang bagian dari nama domain, tetapi yang menentukan pemilik adalah gabungan domain utama + ekstensi: <span class="text-mono">track-verifikasi.top</span>. Ekstensi sendirian bukan bukti apa-apa.');
      } else {
        if (run.urlQuizTries === 1) {
          sfx('error');
          qh.appendChild(el('div', 'c3-note c3-note--warn',
            '<strong>Bukan bagian itu.</strong> Petunjuk: baca dari kanan — cari ekstensi, lalu satu bagian di kirinya. Coba sekali lagi.'));
          return;
        }
        run.urlQuizPoints = 5;
        sfx('error');
        fb = el('div', 'c3-note c3-note--warn',
          '<strong>Belum tepat.</strong> Jawabannya: domain utama + ekstensi paling kanan (<span class="text-mono">track-verifikasi.top</span>). Protokol, subdomain, dan path tidak menentukan pemilik.');
      }
      Array.prototype.forEach.call(row.querySelectorAll('button'), function (b) { b.disabled = true; });
      qh.appendChild(fb);
      foundEvidence('c3-url');
      refreshVerif();
    }

    /* --- Sandbox --- */
    var sand = el('div', 'panel stack');
    sand.appendChild(el('div', 'panel-title', 'SANDBOX INVESTIGASI'));
    sand.appendChild(el('p', 'text-sm', 'Penasaran isi linknya? Di sini kamu boleh "mengeklik" — sandbox SIGAP adalah simulasi terisolasi yang aman. Di perangkat asli: jangan.'));
    sand.appendChild(btn(run.sandboxDone ? 'Buka ulang sandbox' : 'Buka link di sandbox (aman) →', 'btn btn--ghost btn--block', openSandbox));
    left.appendChild(sand);

    /* --- Verifikasi mandiri --- */
    var ver = el('div', 'panel stack');
    ver.appendChild(el('div', 'panel-title', 'VERIFIKASI MANDIRI'));
    ver.appendChild(el('p', 'text-sm', 'Cara paling andal: buka kanal resmi yang alamatnya kamu <strong>ketik sendiri</strong> — bukan dari link di email.'));
    ver.appendChild(btn('Ketik nusantara-ekspres.com & cek status paket →', 'btn btn--ghost btn--block', openOfficial));
    left.appendChild(ver);

    /* --- Right column: progress + tray --- */
    var status = el('div', 'panel panel--glass stack stack--sm');
    right.appendChild(status);
    trayHost = el('div', 'panel panel--glass c3-tray');
    right.appendChild(trayHost);
    renderTray();

    function refreshVerif() {
      status.innerHTML = '';
      status.appendChild(el('div', 'panel-title', 'PROGRES VERIFIKASI'));
      var items = [
        { ok: run.urlQuizPoints !== null, label: 'Bedah anatomi URL (wajib)' },
        { ok: run.sandboxDone, label: 'Analisis form di sandbox' },
        { ok: run.officialDone, label: 'Cek lewat kanal resmi' }
      ];
      items.forEach(function (it) {
        status.appendChild(el('p', 'text-sm ' + (it.ok ? 'text-success' : 'text-muted'),
          (it.ok ? '✔' : '○') + ' ' + esc(it.label)));
      });
      var next = btn('Lanjut ke BANDINGKAN →', 'btn btn--primary btn--block', function () { setPhase(3); });
      next.disabled = run.urlQuizPoints === null;
      if (next.disabled) status.appendChild(el('p', 'text-xs text-amber', 'Selesaikan bedah URL dulu (ketuk kelima bagian, lalu jawab uji pemahaman).'));
      status.appendChild(next);
    }
    refreshVerif();
    verifRefresh = refreshVerif;

    layout.appendChild(left);
    layout.appendChild(right);
    host.appendChild(layout);
  }
  var verifRefresh = null;

  function openSandbox() {
    sfx('warning');
    var body = el('div', 'stack');
    body.appendChild(el('div', 'sim-label', 'SANDBOX INVESTIGASI — simulasi aman; tidak ada data yang dikirim ke mana pun'));
    body.appendChild(el('div', 'c3-urlbox text-mono text-xs', 'https://nusantara-ekspres.track-verifikasi.top/pay?id=8817'));
    var page = el('div', 'c3-fakepage');
    page.appendChild(el('div', 'c3-fakepage__head', '📦 NUSANTARA EKSPRES — Pembayaran Penjadwalan Ulang'));
    page.appendChild(el('p', 'text-sm', 'Tagihan: <strong>Rp3.000</strong>. Selesaikan dalam 1x24 jam.'));
    [['Nomor kartu', '•••• •••• •••• ••••'], ['Masa berlaku (MM/YY)', 'MM/YY'], ['CVV (3 digit di belakang kartu)', '•••'], ['Kode OTP dari SMS', '••••••']]
      .forEach(function (f) {
        var field = el('div', 'field');
        var lab = el('label', 'field__label', esc(f[0]));
        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = f[1];
        input.disabled = true;
        input.setAttribute('aria-label', f[0] + ' (dinonaktifkan — simulasi)');
        field.appendChild(lab);
        field.appendChild(input);
        page.appendChild(field);
      });
    var payBtn = btn('BAYAR Rp3.000', 'c3-cta', function () {
      sfx('error');
      SIGAP.ui.toast('Sandbox: tidak ada data terkirim. Perhatikan APA yang diminta form ini.', 'warn');
    });
    page.appendChild(payBtn);
    body.appendChild(page);

    var analysis = el('div', 'stack');
    body.appendChild(analysis);

    var m = SIGAP.ui.modal({
      title: 'Sandbox: halaman pembayaran',
      body: body,
      wide: true,
      dismissible: true,
      actions: [
        { label: 'Analisis form ini', variant: 'primary', onClick: function () {
            if (analysis.childNodes.length) return;
            sfx('scan');
            analysis.appendChild(el('div', 'c3-note c3-note--warn',
              '<strong>Perhatikan yang diminta:</strong> nomor kartu, masa berlaku, CVV, dan OTP. ' +
              'Data pembayaran merupakan informasi sensitif dan dapat disalahgunakan dalam transaksi tertentu. ' +
              'Untuk tagihan "Rp3.000", permintaan selengkap ini adalah tanda bahaya besar — form ini sendiri adalah BUKTI.'));
            run.sandboxDone = true;
            foundEvidence('c3-form');
            if (verifRefresh) verifRefresh();
          } },
        { label: 'Tutup sandbox', variant: 'ghost', onClick: function (close) { close(); } }
      ]
    });
    void m;
  }

  function openOfficial() {
    sfx('scan');
    var body = el('div', 'stack');
    body.appendChild(el('div', 'sim-label', 'SIMULASI SITUS RESMI — alamat diketik sendiri: nusantara-ekspres.com'));
    var page = el('div', 'c3-fakepage c3-fakepage--official');
    page.appendChild(el('div', 'c3-fakepage__head', '📦 Nusantara Ekspres — Lacak Paket'));
    page.appendChild(el('p', 'text-sm', 'Perhatikan: email tadi bahkan tidak mencantumkan nomor resi. Cek berdasarkan akunmu:'));
    var result = el('div', 'stack');
    page.appendChild(btn('Cek status paket di akunku', 'btn btn--primary', function () {
      if (result.childNodes.length) return;
      sfx('success');
      result.appendChild(el('div', 'c3-note c3-note--ok',
        '<strong>Hasil:</strong> Tidak ada paket tertahan atas akunmu. ' +
        'Pengumuman resmi: "Nusantara Ekspres tidak pernah menagih biaya melalui link di email/SMS."'));
      run.officialDone = true;
      foundEvidence('c3-resmi');
      if (verifRefresh) verifRefresh();
    }));
    page.appendChild(result);
    body.appendChild(page);
    SIGAP.ui.modal({
      title: 'Verifikasi mandiri',
      body: body,
      dismissible: true,
      actions: [{ label: 'Selesai', variant: 'primary', onClick: function (close) { close(); } }]
    });
  }

  /* ================= PHASE 3 — BANDINGKAN + DOMAIN CHALLENGE ================= */
  function segmentedUrl(parts) {
    var box = el('div', 'c3-urlbox c3-urlbox--seg text-mono');
    parts.forEach(function (p) {
      box.appendChild(el('span', 'c3-seg c3-seg--' + p[0], esc(p[1])));
    });
    return box;
  }

  function renderBandingkan(host) {
    var wrap = el('div', 'container--narrow stack');

    var cmp = el('div', 'panel stack');
    cmp.appendChild(el('div', 'panel-title', 'BANDINGKAN DUA URL'));
    cmp.appendChild(el('p', 'text-sm', 'Keduanya memuat nama merek. Bedanya ada di <strong>posisi</strong> nama itu:'));

    var a = el('div', 'c3-compare');
    a.appendChild(el('div', 'tag tag--green', 'MILIK DOMAIN RESMI'));
    a.appendChild(segmentedUrl([['proto', 'https://'], ['sub', 'track'], ['dom', '.nusantara-ekspres'], ['tld', '.com'], ['path', '/resi']]));
    a.appendChild(el('p', 'text-xs text-muted', '"track" adalah subdomain MILIK domain resmi nusantara-ekspres.com. Pemilik: nusantara-ekspres.com.'));
    cmp.appendChild(a);

    var b = el('div', 'c3-compare');
    b.appendChild(el('div', 'tag tag--red', 'MEREK HANYA JADI SUBDOMAIN'));
    b.appendChild(segmentedUrl([['proto', 'https://'], ['sub', 'nusantara-ekspres'], ['dom', '.track-verifikasi'], ['tld', '.top'], ['path', '/pay']]));
    b.appendChild(el('p', 'text-xs text-muted', 'Nama merek dipindah ke posisi subdomain. Pemilik sesungguhnya: track-verifikasi.top — siapa pun itu.'));
    cmp.appendChild(b);

    cmp.appendChild(el('p', 'text-sm',
      'Legenda: <span class="c3-seg c3-seg--sub text-mono">subdomain</span> · <span class="c3-seg c3-seg--dom text-mono">domain utama</span> · <span class="c3-seg c3-seg--tld text-mono">ekstensi</span>. ' +
      'Dan sekali lagi: <strong>ekstensi domain bukan bukti penipuan</strong> — yang diperiksa adalah apakah domain benar-benar dimiliki organisasi yang diklaim.'));
    wrap.appendChild(cmp);

    var ch = el('div', 'panel stack');
    ch.appendChild(el('div', 'panel-title', 'DOMAIN CHALLENGE — 3 SOAL'));
    var chHost = el('div', 'stack');
    ch.appendChild(chHost);
    wrap.appendChild(ch);
    renderChallengeItem(chHost);

    host.appendChild(wrap);
  }

  function renderChallengeItem(hostEl) {
    hostEl.innerHTML = '';
    var st = run.challenge;

    if (st.idx >= CHALLENGES.length) {
      st.done = true;
      var sum = el('div', 'stack');
      var all = st.allCorrect;
      sum.appendChild(el('div', 'c3-note ' + (all ? 'c3-note--ok' : 'c3-note--warn'),
        all ? '<strong>Sempurna — 3/3 dengan alasan yang tepat.</strong> Kamu membaca domain seperti detektif.'
            : '<strong>Challenge selesai.</strong> Sebagian jawaban/alasanmu belum tepat — baca lagi umpan baliknya; kemampuan ini butuh latihan, bukan bakat.'));
      if (all && !SIGAP.state.isPractice('case', CASE_ID)) {
        SIGAP.achievements.unlock('domain-detective');
      } else if (all) {
        sum.appendChild(el('p', 'text-xs text-muted', 'Practice run — badge tidak diberikan pada pengulangan.'));
      }
      sum.appendChild(btn('Lanjut ke PUTUSKAN →', 'btn btn--primary', function () { setPhase(4); }));
      hostEl.appendChild(sum);
      return;
    }

    var item = CHALLENGES[st.idx];
    hostEl.appendChild(el('p', null, '<strong>' + esc(item.q) + '</strong>'));

    var picked = null;
    var urlCards = [];
    var stepB = el('div', 'stack');

    item.urls.forEach(function (u, i) {
      var c = btn('<span class="option-card__key">' + (i + 1) + '</span><span class="text-mono c3-choice-url">' + esc(u) + '</span>', 'option-card', function () {
        if (picked !== null) return;
        picked = i;
        urlCards.forEach(function (cc) { cc.disabled = true; });
        c.setAttribute('aria-pressed', 'true');
        var ok = i === item.correctUrl;
        if (!ok) st.allCorrect = false;
        st.points += ok ? 12 : 0;
        sfx(ok ? 'success' : 'error');
        stepB.appendChild(el('div', 'c3-note ' + (ok ? 'c3-note--ok' : 'c3-note--warn'),
          (ok ? '<strong>Benar.</strong> ' : '<strong>Belum tepat.</strong> ') + esc(item.pickWhy)));
        buildReasons();
      });
      c.setAttribute('aria-pressed', 'false');
      urlCards.push(c);
      hostEl.appendChild(c);
    });

    var hintBtn = btn('Petunjuk (' + (st.hintIdx + 1) + '/' + CHALLENGE_HINTS.length + ')', 'btn btn--ghost btn--sm', function () {
      SIGAP.ui.toast(CHALLENGE_HINTS[Math.min(st.hintIdx, CHALLENGE_HINTS.length - 1)], 'info');
      if (st.hintIdx < CHALLENGE_HINTS.length - 1) st.hintIdx += 1;
      hintBtn.textContent = 'Petunjuk (' + (st.hintIdx + 1) + '/' + CHALLENGE_HINTS.length + ')';
    });
    hostEl.appendChild(hintBtn);
    hostEl.appendChild(stepB);

    function buildReasons() {
      stepB.appendChild(el('p', 'text-sm', '<strong>Kenapa?</strong> Pilih alasan yang paling tepat:'));
      var done = false;
      var rBtns = [];
      item.reasons.forEach(function (r) {
        var rb = btn(esc(r.text), 'option-card', function () {
          if (done) return;
          done = true;
          rBtns.forEach(function (x) { x.disabled = true; });
          rb.setAttribute('aria-pressed', 'true');
          if (!r.correct) st.allCorrect = false;
          st.points += r.correct ? 11.33 : 0;
          sfx(r.correct ? 'success' : 'error');
          stepB.appendChild(el('div', 'c3-note ' + (r.correct ? 'c3-note--ok' : 'c3-note--warn'), esc(r.fb)));
          if (r.tldMisc) {
            SIGAP.scoring.recordMisconception(CASE_ID, 'Menggeneralisasi TLD (mis. .top/.net) sebagai bukti penipuan.');
            stepB.appendChild(el('div', 'c3-note c3-note--warn',
              '<strong>Koreksi penting:</strong> Ekstensi domain bukan bukti penipuan. Yang selalu diperiksa: apakah domain benar-benar dimiliki organisasi yang diklaim — lewat kanal resmi.'));
          }
          stepB.appendChild(btn(st.idx + 1 < CHALLENGES.length ? 'Soal berikutnya →' : 'Lihat hasil challenge →', 'btn btn--primary', function () {
            st.idx += 1;
            renderChallengeItem(hostEl);
          }));
        });
        rb.setAttribute('aria-pressed', 'false');
        rBtns.push(rb);
        stepB.appendChild(rb);
      });
    }
  }

  /* ================= PHASE 4 — PUTUSKAN ================= */
  function renderPutuskan(host) {
    var wrap = el('div', 'container--narrow stack');
    var panel = el('div', 'panel stack');
    panel.appendChild(el('div', 'panel-title', 'KEPUTUSANMU'));
    panel.appendChild(el('p', null, 'Email "paket tertahan" itu masih ada di kotak masuk pelapor. Apa yang seharusnya dilakukan?'));

    var chosen = null;
    var cards = [];
    DECISIONS.forEach(function (d) {
      var c = btn('<span class="option-card__key">' + d.key + '</span>' + esc(d.label), 'option-card', function () {
        chosen = d;
        cards.forEach(function (cc) { cc.setAttribute('aria-pressed', 'false'); });
        c.setAttribute('aria-pressed', 'true');
        submit.disabled = false;
        sfx('click');
      });
      c.setAttribute('aria-pressed', 'false');
      cards.push(c);
      panel.appendChild(c);
    });

    var slider = SIGAP.ui.confidenceSlider({
      label: 'Seberapa yakin kamu dengan keputusanmu?',
      value: run.confidence,
      hint: 'Jujur pada dirimu: keyakinan harus mengikuti kekuatan bukti.'
    });
    panel.appendChild(slider.el);

    var submit = btn('Kunci keputusan', 'btn btn--primary btn--lg', function () {
      if (!chosen) return;
      SIGAP.ui.confirm('Kunci keputusan ' + chosen.key + '?',
        'Setelah dikunci, kamu akan memilih bukti pendukung lalu menerima debrief.',
        function () {
          run.decision = chosen.key;
          run.confidence = slider.get();
          if (chosen.misc) SIGAP.scoring.recordMisconception(CASE_ID, chosen.misc);
          setPhase(5);
        },
        { yesLabel: 'Kunci', noLabel: 'Pikir lagi' });
    });
    submit.disabled = true;
    panel.appendChild(submit);
    wrap.appendChild(panel);
    host.appendChild(wrap);
  }

  /* ================= PHASE 5 — JELASKAN + DEBRIEF ================= */
  function investigationQuality() {
    var q = 0;
    if (run.inspected.sender) q += 20;
    if (run.inspected.urgency) q += 10;
    if (run.urlQuizPoints !== null) q += 25;
    if (run.sandboxDone) q += 20;
    if (run.officialDone) q += 25;
    return Math.min(100, q);
  }
  function evidenceRelevance() {
    var url = run.urlQuizPoints === null ? 0 : run.urlQuizPoints; // 0–30
    var ch = Math.min(70, Math.round(run.challenge.points));       // 0–70
    return Math.min(100, url + ch);
  }

  function renderJelaskan(host) {
    var wrap = el('div', 'container--narrow stack');
    var panel = el('div', 'panel stack');
    panel.appendChild(el('div', 'panel-title', 'JELASKAN — BUKTI PENDUKUNG'));
    panel.appendChild(el('p', null, 'Keputusanmu: <strong>' + esc(run.decision) + '</strong>. Pilih bukti yang paling mendukung keputusanmu (boleh lebih dari satu):'));

    var selected = [];
    var submit = btn('Kirim analisis & lihat debrief', 'btn btn--primary btn--lg', function () {
      run.selectedEvidence = selected.slice();
      finishAndDebrief(wrap);
    });
    submit.disabled = true;

    if (!run.evidence.length) {
      panel.appendChild(el('p', 'text-sm text-amber', 'Kamu tidak mengumpulkan bukti — keputusan tanpa bukti sulit dipertanggungjawabkan.'));
      submit.disabled = false;
    }
    run.evidence.forEach(function (id) {
      var ev = CATALOG[id];
      var card = SIGAP.ui.evidenceCard({
        id: id, title: ev.title, body: ev.body, source: ev.source, strength: ev.strength, found: true,
        onClick: function () {
          var i = selected.indexOf(id);
          if (i === -1) { selected.push(id); card.classList.add('c3-ev--picked'); card.setAttribute('aria-pressed', 'true'); }
          else { selected.splice(i, 1); card.classList.remove('c3-ev--picked'); card.setAttribute('aria-pressed', 'false'); }
          submit.disabled = selected.length === 0;
          sfx('click');
        }
      });
      card.setAttribute('aria-pressed', 'false');
      panel.appendChild(card);
    });
    panel.appendChild(submit);
    wrap.appendChild(panel);
    host.appendChild(wrap);
  }

  function finishAndDebrief(wrap) {
    if (run.finished) return;
    var iq = investigationQuality();
    var er = evidenceRelevance();
    var correct = run.decision === CORRECT_DECISION;

    var dsScore = Math.round(0.55 * (correct ? 100 : 20) + 0.45 * iq);
    var ctScore = Math.round(0.5 * er + 0.5 * iq);

    var res = SIGAP.scoring.finishCase({
      caseId: CASE_ID,
      investigationQuality: iq,
      decisionCorrect: correct,
      evidenceRelevance: er,
      confidence: run.confidence,
      decisionLabel: run.decision,
      competencies: {
        digitalSafety: { score: dsScore, weight: 2 },
        criticalThinking: { score: ctScore, weight: 1.5 },
        evidenceReasoning: { score: er, weight: 1 }
      },
      xp: 100
    });
    run.finished = res;
    sfx(correct ? 'success' : 'warning');

    wrap.innerHTML = '';
    var d = el('div', 'panel stack');
    d.appendChild(el('div', 'panel-title', 'DEBRIEF'));
    if (res.practice) d.appendChild(el('div', 'practice-banner', 'PRACTICE RUN — XP tidak diberikan'));

    var verdictHtml;
    if (correct) {
      verdictHtml = '<span class="debrief-verdict__icon" aria-hidden="true">✔</span><div><strong>Keputusan tepat (C).</strong> ' +
        'Kamu tidak mengeklik, memverifikasi lewat kanal resmi, melaporkan, dan memperingatkan keluarga. Buktinya saling mendukung: ' +
        'domain pengirim asli adalah <span class="text-mono">resi-cek.top</span>, link mengarah ke <span class="text-mono">track-verifikasi.top</span> (merek hanya subdomain), ' +
        'form meminta kartu + OTP untuk tagihan Rp3.000, dan kanal resmi menyatakan tidak ada paket tertahan.</div>';
    } else {
      var why = {
        A: 'Membayar berarti memasukkan data kartu + OTP ke situs yang pemiliknya bukan kurir — kerugian bisa jauh melebihi Rp3.000.',
        B: 'Tampilan resmi mudah ditiru; mengeklik lalu menilai dari tampilan bukan verifikasi. Verifikasi hanya lewat kanal resmi yang kamu ketik sendiri.',
        D: 'Membalas email justru mengonfirmasi bahwa alamatmu aktif dan dibaca — kamu akan jadi target berikutnya.'
      };
      verdictHtml = '<span class="debrief-verdict__icon" aria-hidden="true">✘</span><div><strong>Keputusan ' + esc(run.decision) + ' keliru.</strong> ' +
        esc(why[run.decision] || '') + ' Jawaban terbaik: C — jangan klik, verifikasi lewat kanal resmi, laporkan/tandai spam, dan beri tahu keluarga. ' +
        'Buktimu sendiri menunjuk ke sana: domain pengirim <span class="text-mono">resi-cek.top</span> dan link <span class="text-mono">track-verifikasi.top</span> bukan milik kurir.</div>';
    }
    d.appendChild(el('div', 'debrief-verdict ' + (correct ? 'debrief-verdict--good' : 'debrief-verdict--bad'), verdictHtml));

    var bd = res.result.breakdown;
    [['Investigation Quality (40%)', bd.investigationQuality],
     ['Decision (30%)', bd.decisionCorrectness],
     ['Evidence Relevance (20%)', bd.evidenceRelevance],
     ['Calibration (10%)', bd.confidenceCalibration]].forEach(function (r) {
      var row = el('div', 'score-row');
      row.appendChild(el('span', null, esc(r[0])));
      row.appendChild(el('span', 'score-row__val', String(r[1])));
      d.appendChild(row);
    });
    var tot = el('div', 'score-total');
    tot.appendChild(el('span', null, 'SKOR KASUS'));
    tot.appendChild(el('span', 'score-total__val', String(res.result.total)));
    d.appendChild(tot);
    d.appendChild(el('p', 'text-sm text-muted', esc(res.result.calibrationFeedback)));
    d.appendChild(btn('Lanjut', 'btn btn--primary btn--lg', function () { showCinematic(); }));
    wrap.appendChild(d);
    window.scrollTo(0, 0);
  }

  function showCinematic() {
    if (document.querySelector('.case-complete-cine')) return;
    var cine = el('div', 'case-complete-cine');
    cine.setAttribute('role', 'dialog');
    cine.setAttribute('aria-label', 'Kasus selesai');
    cine.appendChild(el('div', 'case-complete-cine__stamp', 'CASE CLOSED'));
    cine.appendChild(el('p', 'text-sm text-muted text-center', 'CASE 003 — LINK PALSU · Laporan diteruskan ke tim SIGAP.'));
    var go = btn('Lanjut', 'btn btn--primary', function () {
      if (cine.parentNode) cine.parentNode.removeChild(cine);
      setPhase(6);
    });
    cine.appendChild(go);
    document.body.appendChild(cine);
    go.focus();
  }

  /* ================= PHASE 6 — REFLEKSI ================= */
  function renderRefleksi(host) {
    var wrap = el('div', 'container--narrow stack');
    var panel = el('div', 'panel stack');
    panel.appendChild(el('div', 'panel-title', 'REFLEKSI'));
    var navRow = el('div', 'row c3-nav-row');

    panel.appendChild(SIGAP.ui.reflectionForm({
      contextId: CASE_ID,
      questions: [
        'Bagian mana dari URL yang menurutmu paling menipu, dan kenapa?',
        'Kenapa penipu memakai nominal kecil seperti Rp3.000?'
      ],
      onDone: function () {
        playOutro(function () {
          navRow.hidden = false;
        });
      }
    }));

    navRow.hidden = true;
    navRow.appendChild(btn('Kembali ke Academy', 'btn btn--ghost', function () { SIGAP.router.go('academy'); }));
    navRow.appendChild(btn('CASE 004 →', 'btn btn--primary', function () { SIGAP.router.go('case004'); }));
    panel.appendChild(navRow);
    wrap.appendChild(panel);
    host.appendChild(wrap);
  }

  function playOutro(onEnd) {
    var correct = run.finished && run.decision === CORRECT_DECISION;
    var lines = correct ? [
      { speaker: 'aruna', voice: 'aruna/case003-outro-good-01.mp3', text: 'Kerja yang tenang, Agent. Kamu tidak panik oleh tenggat 1x24 jam, dan kamu membaca URL dari kanan — bukan dari nama merek yang dipajang di depan.' },
      { speaker: 'aruna', voice: 'aruna/case003-outro-good-02.mp3', text: 'Ingat pelajaran intinya: ekstensi domain bukan bukti penipuan. Yang kamu periksa adalah siapa pemilik domainnya — lewat kanal resmi yang kamu ketik sendiri.' },
      { speaker: 'aruna', voice: 'aruna/case003-outro-good-03.mp3', text: 'Satu email seperti ini dikirim ke ribuan orang. Setiap kali kamu memberi tahu keluargamu, kamu mengurangi jumlah korbannya.' }
    ] : [
      { speaker: 'aruna', voice: 'aruna/case003-outro-retry-01.mp3', text: 'Keputusanmu belum tepat — tapi kamu sudah melihat buktinya sendiri: domain pengirim dan link tujuan bukan milik kurir.' },
      { speaker: 'aruna', voice: 'aruna/case003-outro-retry-02.mp3', text: 'Baca lagi dari kanan: pemilik situs ada di domain utama paling kanan, bukan di nama merek di depan. Dan ekstensi domain bukan bukti penipuan — kepemilikan domainlah yang diperiksa.' },
      { speaker: 'aruna', voice: 'aruna/case003-outro-retry-03.mp3', text: 'Ulangi kasus ini sebagai latihan kapan pun. Detektif digital dibentuk oleh pengulangan, bukan bakat.' }
    ];
    SIGAP.ui.dialogue.play(lines, { onEnd: onEnd });
  }

  function playIntro() {
    SIGAP.ui.dialogue.play([
      { speaker: 'system', text: 'LAPORAN MASUK — kanal aduan siswa. Kategori: email mencurigakan. Prioritas: tinggi.' },
      { speaker: 'aruna', voice: 'aruna/case003-intro-01.mp3', text: 'Agent, seorang siswa menerima email "paket tertahan" dan hampir membayar. Untung dia bertanya dulu — sekarang giliranmu membedahnya.' },
      { speaker: 'aruna', voice: 'aruna/case003-intro-02.mp3', text: 'Periksa tiga hal: siapa pengirimnya, ke mana linknya, dan data apa yang diminta. Jangan percaya tampilan.' },
      { speaker: 'aruna', voice: 'aruna/case003-intro-03.mp3', text: 'Nama merek di depan URL. Meyakinkan, bukan? Sekarang baca dari kanan.' }
    ]);
  }

  /* ================= Route ================= */
  SIGAP.router.register('case003', {
    title: 'CASE 003 — Link Palsu',
    render: function (container) {
      run = newRun();
      SIGAP.ui.background(container);
      container.appendChild(SIGAP.ui.topbar({ crumb: 'CASE 003', backTo: 'missions' }));

      var main = el('div', 'container screen');
      var header = el('div', 'screen__header');
      header.appendChild(el('div', 'screen__eyebrow', 'INVESTIGASI PHISHING'));
      header.appendChild(el('h1', 'screen__title', 'CASE 003 — Link Palsu'));
      header.appendChild(el('p', 'screen__sub', 'Email "paket tertahan" meminta pembayaran kecil. Bedah pengirim, domain, dan data yang diminta — sebelum ada korban.'));
      main.appendChild(header);

      stepsHost = el('div');
      main.appendChild(stepsHost);
      phaseHost = el('div', 'stack stack--lg');
      main.appendChild(phaseHost);
      container.appendChild(main);

      renderPhase();
      playIntro();
    },
    onLeave: function () {
      if (SIGAP.ui.dialogue && SIGAP.ui.dialogue.stop) SIGAP.ui.dialogue.stop();
      var cine = document.querySelector('.case-complete-cine');
      if (cine && cine.parentNode) cine.parentNode.removeChild(cine);
      run = null;
      phaseHost = null;
      stepsHost = null;
      trayHost = null;
      amatiRefresh = null;
      verifRefresh = null;
    }
  });
})();
