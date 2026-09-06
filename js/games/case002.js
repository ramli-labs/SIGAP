/* ============================================================
   SIGAP - games/case002.js
   CASE 002 "Real or Generated?". Investigasi visual 3 plate
   dengan AI FORENSIC SCANNER (alat SIMULASI: hanya menyoroti
   area kandidat; PEMAIN yang menilai dan menandai).

   Kunci epistemik:
   - Plate B hanyalah "SIMULASI KONTROL (pembanding)", tidak
     pernah disebut "asli/real/verified".
   - Tidak ada "AI probability". Alat tidak memberi jawaban.
   - "Belum cukup bukti" adalah kesimpulan sah (Plate C) dan
     membuka badge `honest-uncertainty`.
   ============================================================ */
(function () {
  'use strict';

  window.SIGAP = window.SIGAP || {};
  SIGAP.data = SIGAP.data || {};
  SIGAP.data.evidenceCatalog = SIGAP.data.evidenceCatalog || {};

  var ASSETS = 'assets/cases/case002/';

  /* ------------------------------------------------------------
     Evidence catalog (deskripsi netral: indikator, bukan vonis)
     ------------------------------------------------------------ */
  SIGAP.data.evidenceCatalog.case002 = {
    'a-text': {
      title: 'TEXT: Tulisan menu tidak konsisten',
      body: 'Papan menu tertulis “KAFE NUSANTRA”, kehilangan satu huruf A, dan huruf N ' +
        'pertamanya tampak terbalik seperti “И”, padahal papan nama utama tertulis ' +
        '“KAFE NUSANTARA” dengan benar. Teks yang kacau atau tidak konsisten adalah ' +
        'indikator umum citra generatif. Ini indikator, bukan bukti final.',
      strength: 'KUAT',
      source: 'AI Forensic Scanner, mode TEXT (simulasi)'
    },
    'a-light': {
      title: 'LIGHTING: Arah bayangan berlawanan',
      body: 'Bayangan hidran jatuh ke KIRI, padahal sisi kiri hidran justru yang tersorot ' +
        'cahaya matahari sore. Bandingkan: bayangan pohon dan bayangan bangunan pada dinding ' +
        'bata jatuh ke kanan. Dengan satu matahari, semua bayangan seharusnya searah. ' +
        'indikator, bukan bukti final.',
      strength: 'KUAT',
      source: 'AI Forensic Scanner, mode LIGHTING (simulasi)'
    },
    'a-texture': {
      title: 'TEXTURE: Pola bata melebur',
      body: 'Di bagian bawah dinding bata, susunan bata tampak melebur: garis nat kabur dan ' +
        'menghilang, baris bata berulang dan tidak mengikuti pola di sekitarnya. Tekstur ' +
        'yang “meleleh” seperti ini sering muncul pada citra generatif. Ini indikator, bukan ' +
        'bukti final.',
      strength: 'SEDANG',
      source: 'AI Forensic Scanner, mode TEXTURE (simulasi)'
    },
    'c-text': {
      title: 'TEXT: Baris menu sedikit miring',
      body: 'Baris “ES KOPI SUSU 12K” pada papan menu tampak sedikit miring dan lebih kabur ' +
        'daripada baris lain. Bisa jadi jejak manipulasi, tetapi bisa juga karena sudut ' +
        'kamera, papan yang agak miring, atau kompresi gambar yang berat. Indikator LEMAH ' +
        'yang punya penjelasan wajar.',
      strength: 'LEMAH',
      source: 'AI Forensic Scanner, mode TEXT (simulasi)'
    }
  };

  /* ------------------------------------------------------------
     Konfigurasi mode scan + plate
     Region: koordinat persen terhadap viewBox 640x420.
     ------------------------------------------------------------ */
  var MODES = [
    { id: 'text', label: 'TEXT SCAN', icon: '🔡', desc: 'Menyoroti area yang memuat tulisan.' },
    { id: 'light', label: 'LIGHTING SCAN', icon: '💡', desc: 'Menyoroti sumber cahaya dan bayangan.' },
    { id: 'texture', label: 'TEXTURE SCAN', icon: '🧱', desc: 'Menyoroti pola dan permukaan berulang.' }
  ];

  var CONCLUSIONS = [
    { key: 'manipulasi', letter: 'A', label: 'Kemungkinan manipulasi / generatif',
      help: 'Indikator yang ditemukan cukup kuat dan saling menguatkan.' },
    { key: 'no-evidence', letter: 'B', label: 'Tidak ditemukan bukti manipulasi yang cukup',
      help: 'Pemeriksaan tidak menemukan indikator berarti. Ini BUKAN klaim “terbukti asli”.' },
    { key: 'insufficient', letter: 'C', label: 'Belum cukup bukti',
      help: 'Indikator terlalu lemah / bertentangan untuk menyimpulkan apa pun.' }
  ];

  var HYPOTHESES = [
    'Ada yang janggal di teks',
    'Ada yang janggal di cahaya/bayangan',
    'Ada yang janggal di tekstur',
    'Terlihat konsisten',
    'Belum tahu'
  ];

  // Catatan wilayah yang konsisten (dipakai lintas plate).
  var NOTE_SIGN = 'Papan nama utama tertulis “KAFE NUSANTARA” dengan huruf rapi dan konsisten. Bukan indikator.';
  var NOTE_BUKA = 'Tanda “BUKA” di pintu kaca pendek, jelas, dan ejaannya benar. Bukan indikator.';
  var NOTE_PERSON = 'Bayangan pendek di sekitar kaki orang ini wajar untuk matahari sore dan tidak bertentangan dengan bayangan lain. Bukan indikator.';
  var NOTE_WINDOW = 'Cahaya hangat dari dalam jendela wajar untuk kafe yang sedang buka. Bukan indikator.';
  var NOTE_TREE = 'Bayangan pohon jatuh ke kanan, searah cahaya matahari sore dari kiri. Konsisten. Bukan indikator.';
  var NOTE_AWNING = 'Garis-garis kanopi berulang secara teratur dan rapi. Pola rapi wajar untuk objek buatan manusia. Bukan indikator.';
  var NOTE_WALK = 'Sambungan ubin trotoar dan garis pemandu kuning tersusun teratur dan konsisten. Bukan indikator.';
  var NOTE_BRICK_OK = 'Susunan bata mengikuti pola berselang-seling yang teratur, garis nat jelas, tanpa peleburan. Bukan indikator.';
  var NOTE_HYD_OK = 'Bayangan hidran jatuh ke kanan, searah dengan bayangan pohon, konsisten dengan satu sumber cahaya. Bukan indikator.';
  var NOTE_MENU_OK = 'Papan menu tertulis “KAFE NUSANTARA, ES KOPI SUSU 12K, ROTI BAKAR 10K” dengan rapi, sama persis dengan papan nama. Konsisten. Bukan indikator.';

  function region(name, x, y, w, h, opt) {
    var r = { name: name, x: x, y: y, w: w, h: h };
    if (opt) { for (var k in opt) { if (opt.hasOwnProperty(k)) r[k] = opt[k]; } }
    return r;
  }
  // Geometri region diukur dari citra fotorealistis 960x640 (persen).
  // Scene ketiga plate identik; opt boleh menimpa x/y/w/h per plate
  // (mis. bayangan hidran Plate A jatuh ke sisi kiri).
  function makeRegions(textMenu, lightHydrant, textureBrick) {
    return {
      text: [
        region('Papan menu di trotoar', 25.4, 53, 10, 24, textMenu),
        region('Papan nama utama', 9.5, 4, 52, 19.5, { note: NOTE_SIGN }),
        region('Tanda BUKA di pintu', 43, 40.5, 8, 10, { note: NOTE_BUKA })
      ],
      light: [
        region('Hidran dan bayangannya', 45.5, 56.5, 27, 28.5, lightHydrant),
        region('Orang dan bayangannya', 4, 42, 14, 42, { note: NOTE_PERSON }),
        region('Cahaya jendela kafe', 13, 35, 25, 26, { note: NOTE_WINDOW }),
        region('Pohon dan bayangannya', 84, 30, 13.5, 55, { note: NOTE_TREE })
      ],
      texture: [
        region('Dinding bata samping', 68, 52, 15, 17.5, textureBrick),
        region('Kanopi bergaris', 12, 23, 49, 14.5, { note: NOTE_AWNING }),
        region('Ubin trotoar', 2, 84, 20, 13, { note: NOTE_WALK })
      ]
    };
  }

  var PLATES = [
    {
      id: 'a',
      short: 'PLATE A',
      label: 'PLATE A: “Kiriman Viral”',
      tag: 'KIRIMAN VIRAL', tagClass: 'tag--amber',
      img: ASSETS + 'plate-a.jpg',
      desc: 'Gambar ini viral dengan klaim “suasana kafe baru di kotamu”. Sumber pertama tidak diketahui.',
      correct: 'manipulasi',
      regions: makeRegions(
        { evidenceId: 'a-text' },
        // bayangan hidran Plate A jatuh ke kiri → region digeser menutupi hidran + bayangan kirinya
        { evidenceId: 'a-light', x: 28.5, y: 56.5, w: 27, h: 31 },
        { evidenceId: 'a-texture' }
      ),
      feedback: {
        manipulasi: 'Tepat. Tiga indikator saling menguatkan: teks menu tidak konsisten (“NUSANTRA” dengan huruf N terbalik), bayangan hidran jatuh berlawanan arah dengan bayangan lain, dan pola bata yang melebur. Satu indikator bisa kebetulan; tiga indikator yang saling mendukung adalah dasar kesimpulan yang kuat.',
        'no-evidence': 'Kurang tepat. Plate A memuat tiga indikator yang bisa ditemukan lewat mode TEXT (tulisan menu vs papan nama), LIGHTING (arah bayangan hidran), dan TEXTURE (pola bata). Bukti sekuat itu seharusnya tidak dilewatkan.',
        insufficient: 'Terlalu hati-hati untuk plate ini. Ada tiga indikator dari tiga mode berbeda yang saling menguatkan. Saat bukti saling mendukung seperti itu, “kemungkinan manipulasi” adalah kesimpulan yang lebih sesuai bukti.'
      }
    },
    {
      id: 'b',
      short: 'PLATE B',
      label: 'PLATE B: SIMULASI KONTROL (pembanding)',
      tag: 'SIMULASI KONTROL (pembanding)', tagClass: 'tag--cyan',
      img: ASSETS + 'plate-b.jpg',
      desc: 'Plate pembanding yang disusun tim lab agar kamu punya acuan tampilan scene yang konsisten. Ini bahan latihan, bukan klaim tentang keaslian foto mana pun.',
      correct: 'no-evidence',
      regions: makeRegions(
        { note: NOTE_MENU_OK },
        { note: NOTE_HYD_OK },
        { note: NOTE_BRICK_OK }
      ),
      feedback: {
        'no-evidence': 'Tepat, dan perhatikan kata-katanya: “tidak ditemukan bukti manipulasi yang cukup” TIDAK sama dengan “terbukti asli”. Pemeriksaanmu hanya berkata: dari tiga mode scan, tidak ada indikator. Keaslian tetap tidak terbukti, itu batas jujur dari alat dan mata kita.',
        manipulasi: 'Kurang tepat. Plate B adalah simulasi kontrol yang konsisten: teks, bayangan, dan tekstur saling cocok. Menandai kejanggalan yang tidak ada sama berbahayanya dengan melewatkan yang ada; keduanya kesalahan investigasi.',
        insufficient: 'Bisa dimengerti, tetapi setelah ketiga mode scan tidak menemukan indikator apa pun, kesimpulan yang lebih informatif adalah “tidak ditemukan bukti manipulasi yang cukup”. Ingat: itu tetap BUKAN klaim “asli”.'
      }
    },
    {
      id: 'c',
      short: 'PLATE C',
      label: 'PLATE C: Sumber Tidak Diketahui',
      tag: 'SUMBER TIDAK DIKETAHUI', tagClass: 'tag--purple',
      img: ASSETS + 'plate-c.jpg',
      desc: 'Dikirim anonim ke kanal lab tanpa keterangan. Kualitas kompresi tampak rendah.',
      correct: 'insufficient',
      regions: makeRegions(
        { evidenceId: 'c-text', weak: true },
        { note: NOTE_HYD_OK },
        { note: NOTE_BRICK_OK }
      ),
      feedback: {
        insufficient: 'Tepat. Hanya ada satu indikator LEMAH (baris menu agak miring) yang bisa dijelaskan oleh sudut kamera atau kompresi. Satu indikator lemah tidak cukup untuk menuduh manipulasi, tetapi juga tidak bisa diabaikan begitu saja. “Belum cukup bukti” adalah kesimpulan paling jujur.',
        manipulasi: 'Terlalu cepat. Satu-satunya temuan adalah indikator lemah yang punya penjelasan wajar (perspektif papan, kompresi gambar). Menuduh manipulasi dari satu indikator lemah adalah lompatan kesimpulan.',
        'no-evidence': 'Hampir, tetapi ada satu indikator lemah (baris menu miring) yang belum bisa dijelaskan tuntas. Selama masih ada keraguan kecil yang belum terjawab, “belum cukup bukti” lebih jujur daripada “tidak ditemukan bukti yang cukup”.'
      }
    }
  ];

  var HINTS = [
    'Mulai dari hipotesis: bagian apa yang paling sering salah pada gambar buatan? Biasanya teks, arah cahaya, dan pola yang berulang.',
    'Pakai ketiga mode scan pada tiap plate, lalu bandingkan tulisan yang sama di dua tempat berbeda. Konsisten atau tidak?',
    'Dengan satu sumber cahaya, semua bayangan harus searah. Dan ingat: tidak menemukan apa pun juga merupakan data. Catat lewat tombol “tidak ada temuan”.'
  ];

  var INTRO = [
    { speaker: 'system', text: 'TIGA PLATE CITRA MASUK KE LAB FORENSIK VISUAL…' },
    { speaker: 'aruna', voice: 'aruna/case002-intro-01.mp3', text: 'Tiga gambar, tiga klaim berbeda. Tugasmu bukan menebak “asli atau palsu”, tugasmu memeriksa indikator, lalu menimbang seberapa kuat buktinya.' },
    { speaker: 'aruna', voice: 'aruna/case002-intro-02.mp3', text: 'Perhatikan Plate B. Itu SIMULASI KONTROL, pembanding yang kita susun sendiri dan kita tahu konsisten. Ilmuwan selalu butuh pembanding sebelum menilai yang lain.' },
    { speaker: 'aruna', voice: 'aruna/case002-intro-03.mp3', text: 'Satu prinsip penting: scanner hanya MENGARAHKAN perhatianmu ke area kandidat. Ia tidak pernah memberi jawaban. Yang menilai tetap kamu.' }
  ];

  var TUTORIAL = [
    { speaker: 'aruna', voice: 'aruna/case002-scanner-01.mp3', text: 'Sebelum menyentuh plate, pahami cara kerja AI FORENSIC SCANNER. Ini alat SIMULASI untuk latihan, bukan detector AI sungguhan.' },
    { speaker: 'aruna', voice: 'aruna/case002-scanner-02.mp3', text: 'AMATI dulu tanpa alat. Apa yang kamu lihat? Jangan buru-buru menduga.' },
    { speaker: 'aruna', voice: 'aruna/case002-scanner-03.mp3', text: 'BUAT HIPOTESIS. Misalnya: “kalau gambar ini buatan, bagian teksnya mungkin kacau.” Hipotesis menentukan alat yang kamu pilih.' },
    { speaker: 'aruna', voice: 'aruna/case002-scanner-04.mp3', text: 'PILIH MODE SCAN: TEXT, LIGHTING, atau TEXTURE. Scanner akan menyoroti beberapa area kandidat. Ingat: area yang disorot BELUM TENTU janggal.' },
    { speaker: 'aruna', voice: 'aruna/case002-scanner-05.mp3', text: 'PERIKSA tiap area kandidat, lalu KLIK area yang menurutmu tidak konsisten. Kamu yang menandai, bukan mesinnya. Kalau semuanya wajar, nyatakan “tidak ada temuan”.' },
    { speaker: 'aruna', voice: 'aruna/case002-scanner-06.mp3', text: 'BANDINGKAN antar-plate. Perbedaan kecil lebih mudah terlihat saat dua gambar berdampingan.' },
    { speaker: 'aruna', voice: 'aruna/case002-scanner-07.mp3', text: 'Terakhir: SET CONFIDENCE dan SIMPULKAN. Tiga pilihan selalu tersedia, termasuk “belum cukup bukti”. Kadang itu justru kesimpulan paling berani.' }
  ];

  var PHANTOM_LINES = [
    { speaker: 'system', text: '⚠ INTERFERENSI SINYAL TERDETEKSI DI KANAL LAB…' },
    { speaker: 'phantom', voice: 'phantom/case002-01.mp3', text: 'Matamu mudah ditipu. Alatmu juga.' },
    { speaker: 'phantom', voice: 'phantom/case002-02.mp3', text: 'Satu gambar meyakinkan lebih cepat daripada seribu pemeriksaanmu. Itulah kenapa aku selalu menang.' },
    { speaker: 'aruna', voice: 'aruna/case002-post-phantom.mp3', text: 'Dia benar tentang satu hal: mata dan alat memang bisa tertipu. Justru karena itu kita pakai metode: kontrol, pembanding, dan keberanian bilang “belum cukup bukti”. Itu yang tidak dimiliki PHANTOM.' }
  ];

  /* ------------------------------------------------------------
     Fallback SVG minimal (dipakai bila citra .jpg gagal dimuat;
     tetap memuat indikator inti agar misi bisa diselesaikan).
     ------------------------------------------------------------ */
  function fallbackSvg(plateId) {
    var title = plateId === 'a' ? 'KAFE NUSANTRA' : 'KAFE NUSANTARA';
    var menuLine = plateId === 'a' ? 'ME\u0418U HARI INI' : 'MENU HARI INI';
    var hydShadow = plateId === 'a'
      ? '<rect x="230" y="322" width="70" height="8" fill="#04070d" opacity="0.6"/>'
      : '<rect x="300" y="322" width="70" height="8" fill="#04070d" opacity="0.6"/>';
    var brick = plateId === 'a'
      ? '<ellipse cx="475" cy="210" rx="50" ry="34" fill="#33507a"/>'
      : '<rect x="428" y="180" width="94" height="60" fill="#2b4263"/>';
    var itemLine = plateId === 'c'
      ? '<text x="514" y="300" text-anchor="middle" font-size="10" fill="#8fa2b8" transform="rotate(-3 514 300)" letter-spacing="1.2">ES KOPI SUSU 12K</text>'
      : '<text x="514" y="300" text-anchor="middle" font-size="10" fill="#8fa2b8">ES KOPI SUSU 12K</text>';
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">' +
      '<rect width="640" height="420" fill="#101c30"/>' +
      '<circle cx="54" cy="60" r="14" fill="#f2c069"/>' +
      '<rect x="0" y="336" width="640" height="84" fill="#0b1422"/>' +
      '<rect x="0" y="308" width="640" height="34" fill="#182a44"/>' +
      '<rect x="36" y="88" width="372" height="224" fill="#1c3049"/>' +
      '<rect x="56" y="102" width="332" height="40" fill="#0e1c2c" stroke="#8a6120"/>' +
      '<text x="222" y="129" text-anchor="middle" font-size="21" font-weight="bold" fill="#e8a33d">KAFE NUSANTARA</text>' +
      '<rect x="408" y="118" width="152" height="194" fill="#223550"/>' + brick +
      '<rect x="106" y="250" width="22" height="70" fill="#0c1624"/>' +
      '<rect x="120" y="322" width="90" height="8" fill="#04070d" opacity="0.6"/>' +
      '<rect x="288" y="280" width="24" height="42" fill="#b97f2e"/>' + hydShadow +
      '<polygon points="462,240 566,240 576,336 452,336" fill="#0e1c2c" stroke="#8a6120"/>' +
      '<text x="514" y="262" text-anchor="middle" font-size="12" font-weight="bold" fill="#e8a33d">' + title + '</text>' +
      '<text x="514" y="282" text-anchor="middle" font-size="10" fill="#d7e2ee">' + menuLine + '</text>' +
      itemLine +
      '</svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  /* ------------------------------------------------------------
     Runtime state (fresh setiap kali route dibuka)
     ------------------------------------------------------------ */
  var run = null;
  var timers = [];

  function later(fn, ms) {
    var t = setTimeout(fn, ms);
    timers.push(t);
    return t;
  }
  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
  }

  function freshRun() {
    var plates = {};
    PLATES.forEach(function (p) {
      plates[p.id] = {
        hypothesis: null,
        scans: {},        // mode -> true (pernah discan)
        found: {},        // evidenceId -> true
        clean: {},        // mode -> true (dinyatakan "tidak ada temuan")
        wrong: 0,         // klik region yang konsisten
        conclusion: null, // key kesimpulan
        confidence: 60,
        locked: false
      };
    });
    return {
      plateIdx: 0,
      activeMode: null,   // mode scan aktif pada plate aktif
      scanning: false,
      loupe: false,       // kaca pembesar (bantuan visual, tidak menilai)
      compare: false,
      compareWith: null,
      compareUsed: {},    // plateId -> true
      plates: plates,
      hintLevel: 0,
      phantomShown: false,
      finished: false
    };
  }

  function curPlate() { return PLATES[run.plateIdx]; }
  function curPS() { return run.plates[curPlate().id]; }
  function catalog(id) { return SIGAP.data.evidenceCatalog.case002[id]; }

  function lockedCount() {
    var n = 0;
    PLATES.forEach(function (p) { if (run.plates[p.id].locked) n++; });
    return n;
  }

  /* ------------------------------------------------------------
     Render
     ------------------------------------------------------------ */
  var refs = null; // elemen yang di-update parsial

  SIGAP.router.register('case002', {
    title: 'CASE 002: Real or Generated?',
    render: function (container) {
      run = freshRun();
      refs = {};
      SIGAP.ui.background(container);
      container.appendChild(SIGAP.ui.topbar({ crumb: 'CASE 002', backTo: 'missions' }));

      var main = document.createElement('div');
      main.className = 'container screen';
      container.appendChild(main);
      refs.main = main;

      var header = document.createElement('div');
      header.className = 'screen__header';
      header.innerHTML =
        '<div class="screen__eyebrow">CASE 002 · CITRA HASIL AI</div>' +
        '<h1 class="screen__title">Real or Generated?</h1>' +
        '<p class="screen__sub">Tiga plate gambar menunggu pemeriksaan. Scanner menyoroti area kandidat, ' +
        'tapi yang menilai janggal atau tidak adalah kamu.</p>';
      main.appendChild(header);

      refs.steps = document.createElement('div');
      main.appendChild(refs.steps);

      var layout = document.createElement('div');
      layout.className = 'case-layout c2-layout';
      main.appendChild(layout);

      var left = document.createElement('div');
      left.className = 'stack c2-left';
      var right = document.createElement('div');
      right.className = 'stack c2-right';
      layout.appendChild(left);
      layout.appendChild(right);
      refs.left = left;
      refs.right = right;

      renderSteps();
      renderLeft();
      renderRight();

      // Intro → tutorial scanner (sekali).
      SIGAP.ui.dialogue.play(INTRO, {
        onEnd: function () {
          if (!SIGAP.state.tutorialSeen('scanner')) {
            SIGAP.ui.dialogue.play(TUTORIAL, {
              onEnd: function () { SIGAP.state.markTutorialSeen('scanner'); }
            });
          }
        }
      });
    },
    onLeave: function () {
      clearTimers();
      run = null;
      refs = null;
    }
  });

  function renderSteps() {
    if (!refs) return;
    var idx = 0;
    var anyScan = PLATES.some(function (p) {
      var ps = run.plates[p.id];
      return MODES.some(function (m) { return ps.scans[m.id]; });
    });
    var anyCompare = Object.keys(run.compareUsed).length > 0;
    if (anyScan) idx = 1;
    if (anyCompare) idx = 2;
    if (lockedCount() > 0) idx = 3;
    if (lockedCount() === 3) idx = 4;
    refs.steps.innerHTML = '';
    refs.steps.appendChild(
      SIGAP.ui.phaseSteps(['AMATI', 'SCAN', 'BANDINGKAN', 'SIMPULKAN', 'LAPORAN'], idx)
    );
  }

  /* ---------------- Kolom kiri: tabs + viewer + hipotesis ------ */

  function renderLeft() {
    var left = refs.left;
    left.innerHTML = '';
    var p = curPlate();
    var ps = curPS();

    // Tabs
    var tabs = document.createElement('div');
    tabs.className = 'c2-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Pilih plate');
    PLATES.forEach(function (pl, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'c2-tab' + (i === run.plateIdx ? ' c2-tab--active' : '');
      b.setAttribute('aria-pressed', i === run.plateIdx ? 'true' : 'false');
      var st = run.plates[pl.id];
      b.innerHTML = SIGAP.ui.escapeHtml(pl.short) +
        (st.locked ? ' <span class="c2-tab__done" aria-label="kesimpulan terkunci">✓</span>' : '');
      b.addEventListener('click', function () {
        if (run.plateIdx === i) return;
        SIGAP.audio.sfx('click');
        run.plateIdx = i;
        run.activeMode = null;
        run.compare = false;
        renderLeft();
        renderRight();
      });
      tabs.appendChild(b);
    });
    left.appendChild(tabs);

    // Panel plate
    var panel = document.createElement('div');
    panel.className = 'panel c2-plate-panel';
    left.appendChild(panel);

    var head = document.createElement('div');
    head.className = 'row row--between c2-plate-head';
    head.innerHTML =
      '<strong class="c2-plate-label">' + SIGAP.ui.escapeHtml(p.label) + '</strong>' +
      '<span class="tag ' + p.tagClass + '">' + SIGAP.ui.escapeHtml(p.tag) + '</span>';
    panel.appendChild(head);

    var desc = document.createElement('p');
    desc.className = 'text-sm text-muted c2-plate-desc';
    desc.textContent = p.desc;
    panel.appendChild(desc);

    // Viewer (single atau compare)
    if (run.compare) {
      panel.appendChild(buildCompare());
    } else {
      panel.appendChild(buildViewer());
    }

    // Baris aksi: compare toggle
    var actions = document.createElement('div');
    actions.className = 'row c2-viewer-actions';
    var cmpBtn = document.createElement('button');
    cmpBtn.type = 'button';
    cmpBtn.className = 'btn btn--sm ' + (run.compare ? 'btn--primary' : 'btn--ghost');
    cmpBtn.setAttribute('aria-pressed', run.compare ? 'true' : 'false');
    cmpBtn.textContent = run.compare ? '⇤ Tutup pembanding' : '⇆ Bandingkan dengan plate lain';
    cmpBtn.addEventListener('click', function () {
      SIGAP.audio.sfx('click');
      run.compare = !run.compare;
      if (run.compare) {
        run.compareWith = run.compareWith !== null && run.compareWith !== run.plateIdx
          ? run.compareWith
          : (run.plateIdx + 1) % PLATES.length;
        run.compareUsed[curPlate().id] = true;
      }
      renderLeft();
      renderSteps();
    });
    actions.appendChild(cmpBtn);
    if (!run.compare) {
      var loupeBtn = document.createElement('button');
      loupeBtn.type = 'button';
      loupeBtn.className = 'btn btn--sm ' + (run.loupe ? 'btn--primary' : 'btn--ghost');
      loupeBtn.setAttribute('aria-pressed', run.loupe ? 'true' : 'false');
      loupeBtn.textContent = run.loupe ? '🔍 Kaca pembesar aktif' : '🔍 Kaca pembesar';
      loupeBtn.setAttribute('title', 'Perbesar area di bawah kursor/jari untuk memeriksa detail');
      loupeBtn.addEventListener('click', function () {
        SIGAP.audio.sfx('click');
        run.loupe = !run.loupe;
        renderLeft();
      });
      actions.appendChild(loupeBtn);
    }
    panel.appendChild(actions);

    // Hipotesis awal
    var hyp = document.createElement('div');
    hyp.className = 'c2-hyp';
    var hypLabel = document.createElement('div');
    hypLabel.className = 'field__label';
    hypLabel.textContent = 'Hipotesis awalmu untuk ' + p.short + ':';
    hyp.appendChild(hypLabel);
    var chips = document.createElement('div');
    chips.className = 'c2-chips';
    chips.setAttribute('role', 'group');
    chips.setAttribute('aria-label', 'Pilih hipotesis awal');
    HYPOTHESES.forEach(function (h) {
      var c = document.createElement('button');
      c.type = 'button';
      c.className = 'c2-chip' + (ps.hypothesis === h ? ' c2-chip--on' : '');
      c.setAttribute('aria-pressed', ps.hypothesis === h ? 'true' : 'false');
      c.textContent = h;
      c.disabled = ps.locked;
      c.addEventListener('click', function () {
        SIGAP.audio.sfx('click');
        ps.hypothesis = h;
        renderLeft();
      });
      chips.appendChild(c);
    });
    hyp.appendChild(chips);
    panel.appendChild(hyp);
  }

  function plateImg(p) {
    var img = document.createElement('img');
    img.className = 'c2-img';
    img.alt = 'Citra ' + p.label + ': suasana jalan di depan kafe';
    img.src = p.img;
    img.addEventListener('error', function onErr() {
      img.removeEventListener('error', onErr);
      img.src = fallbackSvg(p.id);
    });
    return img;
  }

  function buildViewer() {
    var p = curPlate();
    var ps = curPS();

    var viewer = document.createElement('div');
    viewer.className = 'c2-viewer scan-target';
    refs.viewer = viewer;
    var img = plateImg(p);
    viewer.appendChild(img);

    var overlay = document.createElement('div');
    overlay.className = 'c2-overlay';
    viewer.appendChild(overlay);

    // Kaca pembesar: memperbesar area di bawah kursor/jari.
    // Murni bantuan visual: tidak menyorot dan tidak menilai apa pun.
    if (run.loupe) {
      var loupe = document.createElement('div');
      loupe.className = 'c2-loupe';
      loupe.setAttribute('aria-hidden', 'true');
      viewer.appendChild(loupe);
      viewer.classList.add('c2-viewer--loupe');
      var ZOOM = 3;
      viewer.addEventListener('pointermove', function (e) {
        var rect = viewer.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
          loupe.style.display = 'none';
          return;
        }
        var src = img.currentSrc || img.src;
        if (loupe.dataset.src !== src) {
          loupe.dataset.src = src;
          loupe.style.backgroundImage = 'url("' + src + '")';
        }
        loupe.style.display = 'block';
        var half = loupe.offsetWidth / 2;
        loupe.style.left = (x - half) + 'px';
        loupe.style.top = (y - half) + 'px';
        loupe.style.backgroundSize = (rect.width * ZOOM) + 'px ' + (rect.height * ZOOM) + 'px';
        loupe.style.backgroundPosition = (half - x * ZOOM) + 'px ' + (half - y * ZOOM) + 'px';
      });
      viewer.addEventListener('pointerleave', function () {
        loupe.style.display = 'none';
      });
    }

    // Pin permanen untuk temuan yang sudah ditandai
    var pinNo = 0;
    MODES.forEach(function (m) {
      p.regions[m.id].forEach(function (r) {
        if (r.evidenceId && ps.found[r.evidenceId]) {
          pinNo++;
          var pin = document.createElement('span');
          pin.className = 'c2-pin';
          pin.style.left = (r.x + r.w / 2) + '%';
          pin.style.top = (r.y + r.h / 2) + '%';
          pin.textContent = String(pinNo);
          pin.setAttribute('aria-hidden', 'true');
          overlay.appendChild(pin);
        }
      });
    });

    // Region kandidat mode aktif
    if (run.activeMode && !run.scanning && !ps.locked) {
      var modeDef = null;
      MODES.forEach(function (m) { if (m.id === run.activeMode) modeDef = m; });
      p.regions[run.activeMode].forEach(function (r, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'c2-region' +
          (r.evidenceId && ps.found[r.evidenceId] ? ' c2-region--found' : '');
        b.style.left = r.x + '%';
        b.style.top = r.y + '%';
        b.style.width = r.w + '%';
        b.style.height = r.h + '%';
        b.style.animationDelay = (i * 90) + 'ms';
        b.setAttribute('aria-label',
          'Area kandidat ' + (i + 1) + ': ' + r.name +
          '. Klik jika menurutmu tidak konsisten.');
        var tag = document.createElement('span');
        tag.className = 'c2-region__tag';
        tag.textContent = (modeDef ? modeDef.label.split(' ')[0] : '') + ' ' + (i + 1);
        b.appendChild(tag);
        b.addEventListener('click', function () { onRegionClick(r, b); });
        overlay.appendChild(b);
      });
    }
    return viewer;
  }

  function buildCompare() {
    var p = curPlate();
    var wrap = document.createElement('div');
    wrap.className = 'stack c2-compare';

    var picker = document.createElement('div');
    picker.className = 'row c2-compare-pick';
    var lbl = document.createElement('span');
    lbl.className = 'text-xs text-muted';
    lbl.textContent = 'Bandingkan dengan:';
    picker.appendChild(lbl);
    PLATES.forEach(function (pl, i) {
      if (i === run.plateIdx) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn--sm ' + (run.compareWith === i ? 'btn--primary' : 'btn--ghost');
      b.setAttribute('aria-pressed', run.compareWith === i ? 'true' : 'false');
      b.textContent = pl.short;
      b.addEventListener('click', function () {
        SIGAP.audio.sfx('click');
        run.compareWith = i;
        renderLeft();
      });
      picker.appendChild(b);
    });
    wrap.appendChild(picker);

    var other = PLATES[run.compareWith];
    var grid = document.createElement('div');
    grid.className = 'c2-compare-grid';
    [p, other].forEach(function (pl) {
      var cell = document.createElement('figure');
      cell.className = 'c2-compare-cell';
      var cap = document.createElement('figcaption');
      cap.className = 'c2-compare-cap';
      cap.textContent = pl.label;
      var frame = document.createElement('div');
      frame.className = 'c2-viewer c2-viewer--mini';
      frame.appendChild(plateImg(pl));
      cell.appendChild(cap);
      cell.appendChild(frame);
      grid.appendChild(cell);
    });
    wrap.appendChild(grid);

    var note = document.createElement('p');
    note.className = 'text-xs text-muted';
    note.textContent = 'Perbedaan kecil lebih mudah terlihat berdampingan. Perhatikan tulisan, arah bayangan, dan pola dinding. Tutup pembanding untuk kembali menandai.';
    wrap.appendChild(note);
    return wrap;
  }

  /* ---------------- Interaksi region ---------------- */

  function onRegionClick(r, btn) {
    var ps = curPS();
    if (ps.locked) return;
    if (r.evidenceId) {
      if (ps.found[r.evidenceId]) {
        SIGAP.ui.toast('Area ini sudah kamu tandai sebagai temuan.', 'info');
        return;
      }
      ps.found[r.evidenceId] = true;
      delete ps.clean[run.activeMode]; // temuan menggantikan pernyataan "bersih"
      SIGAP.state.recordEvidence('case002', r.evidenceId);
      SIGAP.audio.sfx('evidence');
      var ev = catalog(r.evidenceId);
      SIGAP.ui.toast('Temuan ditandai: ' + ev.title, 'success');
      if (!SIGAP.state.isPractice('case', 'case002')) {
        SIGAP.achievements.unlock('first-evidence');
      }
      renderLeft();
      renderRight();
    } else {
      ps.wrong++;
      SIGAP.audio.sfx('warning');
      btn.classList.add('c2-region--wrong');
      later(function () { btn.classList.remove('c2-region--wrong'); }, 700);
      SIGAP.ui.toast(r.note || 'Area ini tampak konsisten.', 'warn');
    }
  }

  /* ---------------- Kolom kanan: scanner + kesimpulan ---------- */

  function renderRight() {
    var right = refs.right;
    right.innerHTML = '';
    var p = curPlate();
    var ps = curPS();

    // Panel scanner
    var scanner = document.createElement('div');
    scanner.className = 'panel panel--accent c2-scanner';
    right.appendChild(scanner);

    var title = document.createElement('div');
    title.className = 'panel-title';
    title.textContent = 'AI FORENSIC SCANNER';
    scanner.appendChild(title);

    var sim = document.createElement('div');
    sim.className = 'sim-label';
    sim.textContent = 'SIMULATED FORENSIC TOOL, bukan detector AI nyata';
    scanner.appendChild(sim);

    var expl = document.createElement('p');
    expl.className = 'text-xs text-muted c2-scanner-note';
    expl.textContent = 'Scanner hanya menyoroti area kandidat sesuai mode. Ia tidak menilai dan tidak memberi skor. Kamu yang memutuskan area mana yang janggal.';
    scanner.appendChild(expl);

    var modes = document.createElement('div');
    modes.className = 'c2-modes';
    modes.setAttribute('role', 'group');
    modes.setAttribute('aria-label', 'Pilih mode scan');
    MODES.forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'c2-mode' + (run.activeMode === m.id ? ' c2-mode--active' : '');
      b.setAttribute('aria-pressed', run.activeMode === m.id ? 'true' : 'false');
      b.disabled = ps.locked || run.compare;
      b.innerHTML = '<span aria-hidden="true">' + m.icon + '</span> ' + m.label +
        (ps.scans[m.id] ? ' <span class="c2-mode__seen" aria-label="sudah discan">•</span>' : '');
      b.addEventListener('click', function () { startScan(m.id); });
      modes.appendChild(b);
    });
    scanner.appendChild(modes);

    var status = document.createElement('p');
    status.className = 'text-sm c2-scan-status';
    status.setAttribute('aria-live', 'polite');
    refs.scanStatus = status;
    if (ps.locked) {
      status.textContent = 'Kesimpulan plate ini sudah terkunci.';
    } else if (run.compare) {
      status.textContent = 'Mode pembanding aktif. Tutup pembanding untuk kembali men-scan.';
    } else if (run.scanning) {
      status.textContent = 'Memindai…';
    } else if (run.activeMode) {
      var n = p.regions[run.activeMode].length;
      status.textContent = n + ' area kandidat disorot pada gambar. Periksa satu per satu, lalu klik yang menurutmu janggal, atau nyatakan tidak ada temuan.';
    } else {
      status.textContent = 'Pilih mode scan untuk menyorot area kandidat pada ' + p.short + '.';
    }
    scanner.appendChild(status);

    // Tombol "tidak ada temuan" per mode aktif
    if (run.activeMode && !run.scanning && !ps.locked && !run.compare) {
      var foundInMode = p.regions[run.activeMode].some(function (r) {
        return r.evidenceId && ps.found[r.evidenceId];
      });
      if (!foundInMode) {
        var cleanBtn = document.createElement('button');
        cleanBtn.type = 'button';
        cleanBtn.className = 'btn btn--sm ' + (ps.clean[run.activeMode] ? 'btn--primary' : 'btn--ghost');
        cleanBtn.setAttribute('aria-pressed', ps.clean[run.activeMode] ? 'true' : 'false');
        cleanBtn.textContent = ps.clean[run.activeMode]
          ? '✓ Dicatat: tidak ada temuan pada mode ini'
          : 'Nyatakan: tidak ada temuan pada mode ini';
        cleanBtn.addEventListener('click', function () {
          SIGAP.audio.sfx('click');
          ps.clean[run.activeMode] = !ps.clean[run.activeMode];
          renderRight();
        });
        scanner.appendChild(cleanBtn);
      }
    }

    // Petunjuk (eskalasi, tidak membuka jawaban)
    var hintBtn = document.createElement('button');
    hintBtn.type = 'button';
    hintBtn.className = 'btn btn--sm btn--ghost c2-hint-btn';
    hintBtn.textContent = '💡 Petunjuk (' + Math.min(run.hintLevel + 1, HINTS.length) + '/' + HINTS.length + ')';
    hintBtn.addEventListener('click', function () {
      SIGAP.audio.sfx('click');
      var h = HINTS[Math.min(run.hintLevel, HINTS.length - 1)];
      run.hintLevel = Math.min(run.hintLevel + 1, HINTS.length);
      SIGAP.ui.modal({
        title: 'Petunjuk Aruna',
        body: '<p>' + SIGAP.ui.escapeHtml(h) + '</p>',
        actions: [{ label: 'Mengerti', variant: 'primary' }]
      });
      renderRight();
    });
    scanner.appendChild(hintBtn);

    // Panel temuan
    var findings = document.createElement('div');
    findings.className = 'panel c2-findings';
    var ftitle = document.createElement('div');
    ftitle.className = 'panel-title';
    ftitle.textContent = 'TEMUAN ' + p.short;
    findings.appendChild(ftitle);
    var anyFound = false;
    MODES.forEach(function (m) {
      p.regions[m.id].forEach(function (r) {
        if (r.evidenceId && ps.found[r.evidenceId]) {
          anyFound = true;
          var ev = catalog(r.evidenceId);
          findings.appendChild(SIGAP.ui.evidenceCard({
            id: r.evidenceId,
            title: ev.title,
            body: SIGAP.ui.escapeHtml(ev.body),
            source: ev.source,
            strength: ev.strength
          }));
        }
      });
    });
    var cleanModes = MODES.filter(function (m) { return ps.clean[m.id]; });
    if (cleanModes.length) {
      var cl = document.createElement('p');
      cl.className = 'text-xs text-muted';
      cl.textContent = 'Dinyatakan tanpa temuan: ' +
        cleanModes.map(function (m) { return m.label; }).join(', ') + '.';
      findings.appendChild(cl);
    }
    if (!anyFound && !cleanModes.length) {
      var none = document.createElement('p');
      none.className = 'text-sm text-faint';
      none.textContent = 'Belum ada temuan yang ditandai pada plate ini.';
      findings.appendChild(none);
    }
    right.appendChild(findings);

    // Panel kesimpulan per plate
    right.appendChild(buildConclusion());

    // Laporan akhir
    if (lockedCount() === 3 && !run.finished) {
      var reportBtn = document.createElement('button');
      reportBtn.type = 'button';
      reportBtn.className = 'btn btn--primary btn--lg btn--block c2-report-btn';
      reportBtn.textContent = '📄 SUSUN LAPORAN LAB';
      reportBtn.addEventListener('click', openReport);
      right.appendChild(reportBtn);
    }
  }

  function buildConclusion() {
    var p = curPlate();
    var ps = curPS();

    var panel = document.createElement('div');
    panel.className = 'panel c2-conclude';
    var title = document.createElement('div');
    title.className = 'panel-title';
    title.textContent = 'KESIMPULAN ' + p.short;
    panel.appendChild(title);

    if (ps.locked) {
      var chosen = null;
      CONCLUSIONS.forEach(function (c) { if (c.key === ps.conclusion) chosen = c; });
      var done = document.createElement('p');
      done.className = 'text-sm';
      done.innerHTML = '🔒 Terkunci: <strong>' + SIGAP.ui.escapeHtml(chosen ? chosen.label : '') +
        '</strong> · confidence ' + ps.confidence + '%';
      panel.appendChild(done);
      return panel;
    }

    var opts = document.createElement('div');
    opts.className = 'stack stack--sm';
    CONCLUSIONS.forEach(function (c) {
      var o = document.createElement('button');
      o.type = 'button';
      o.className = 'option-card' + (ps.conclusion === c.key ? ' option-card--selected' : '');
      o.setAttribute('aria-pressed', ps.conclusion === c.key ? 'true' : 'false');
      o.innerHTML =
        '<span class="option-card__key">' + c.letter + '</span>' +
        '<span><strong>' + SIGAP.ui.escapeHtml(c.label) + '</strong>' +
        '<br><span class="text-xs text-muted">' + SIGAP.ui.escapeHtml(c.help) + '</span></span>';
      o.addEventListener('click', function () {
        SIGAP.audio.sfx('click');
        ps.conclusion = c.key;
        renderRight();
      });
      opts.appendChild(o);
    });
    panel.appendChild(opts);

    var slider = SIGAP.ui.confidenceSlider({
      label: 'Seberapa yakin kamu dengan kesimpulan ' + p.short + '?',
      value: ps.confidence
    });
    panel.appendChild(slider.el);

    var lockBtn = document.createElement('button');
    lockBtn.type = 'button';
    lockBtn.className = 'btn btn--primary btn--block';
    lockBtn.textContent = '🔒 Kunci kesimpulan ' + p.short;
    lockBtn.addEventListener('click', function () {
      if (!ps.conclusion) {
        SIGAP.ui.toast('Pilih salah satu dari tiga kesimpulan dulu.', 'warn');
        return;
      }
      ps.confidence = slider.get();
      var scansUsed = MODES.filter(function (m) { return ps.scans[m.id]; }).length;
      var doLock = function () { lockPlate(ps); };
      if (scansUsed === 0) {
        SIGAP.ui.confirm(
          'Belum ada scan',
          'Kamu belum men-scan ' + p.short + ' sama sekali. Menyimpulkan tanpa memeriksa itu berisiko. Tetap kunci?',
          doLock,
          { yesLabel: 'Tetap kunci', noLabel: 'Periksa dulu' }
        );
      } else {
        doLock();
      }
    });
    panel.appendChild(lockBtn);
    return panel;
  }

  function lockPlate(ps) {
    ps.locked = true;
    SIGAP.audio.sfx('click');
    SIGAP.ui.toast('Kesimpulan ' + curPlate().short + ' terkunci.', 'info');

    // Interupsi PHANTOM sekali, di tengah kasus (setelah kunci pertama).
    if (!run.phantomShown && lockedCount() === 1) {
      run.phantomShown = true;
      later(function () {
        if (!run) return;
        SIGAP.audio.sfx('phantom');
        if (refs && refs.viewer) refs.viewer.classList.add('phantom-glitch');
        SIGAP.ui.dialogue.play(PHANTOM_LINES, {
          onEnd: function () {
            if (refs && refs.viewer) refs.viewer.classList.remove('phantom-glitch');
          }
        });
      }, 450);
    }

    // Pindah otomatis ke plate berikutnya yang belum terkunci.
    var next = -1;
    PLATES.forEach(function (pl, i) {
      if (next === -1 && !run.plates[pl.id].locked) next = i;
    });
    if (next !== -1) {
      run.plateIdx = next;
      run.activeMode = null;
      run.compare = false;
    }
    renderLeft();
    renderRight();
    renderSteps();
  }

  function startScan(modeId) {
    var ps = curPS();
    if (ps.locked || run.scanning) return;
    run.activeMode = modeId;
    run.scanning = true;
    ps.scans[modeId] = true;
    SIGAP.audio.sfx('scan');
    renderLeft();
    renderRight();
    if (refs.viewer) refs.viewer.classList.add('scan-target--active');
    var reduced = document.documentElement.getAttribute('data-reduced-motion') === 'true';
    later(function () {
      if (!run) return;
      run.scanning = false;
      if (refs.viewer) refs.viewer.classList.remove('scan-target--active');
      renderLeft();
      renderRight();
      renderSteps();
    }, reduced ? 120 : 1450);
  }

  /* ------------------------------------------------------------
     Laporan akhir + skor + debrief
     ------------------------------------------------------------ */

  var SHORT_LABEL = {
    manipulasi: 'kemungkinan manipulasi',
    'no-evidence': 'tidak ditemukan bukti cukup',
    insufficient: 'belum cukup bukti'
  };

  function openReport() {
    SIGAP.audio.sfx('click');
    var body = document.createElement('div');
    body.className = 'stack';

    var intro = document.createElement('p');
    intro.className = 'text-sm text-muted';
    intro.textContent = 'Ringkasan otomatis dari temuan dan kesimpulanmu. Periksa sekali lagi, lalu tentukan keyakinan keseluruhan untuk laporan ini.';
    body.appendChild(intro);

    PLATES.forEach(function (p) {
      var ps = run.plates[p.id];
      var nFound = Object.keys(ps.found).length;
      var cleanModes = MODES.filter(function (m) { return ps.clean[m.id]; }).length;
      var row = document.createElement('div');
      row.className = 'c2-report-row';
      row.innerHTML =
        '<div class="row row--between"><strong>' + SIGAP.ui.escapeHtml(p.label) + '</strong>' +
        '<span class="text-mono text-xs">' + ps.confidence + '%</span></div>' +
        '<div class="text-sm">Kesimpulan: <strong>' + SIGAP.ui.escapeHtml(SHORT_LABEL[ps.conclusion] || '-') + '</strong></div>' +
        '<div class="text-xs text-muted">' + nFound + ' temuan ditandai · ' + cleanModes + ' mode dinyatakan tanpa temuan</div>';
      body.appendChild(row);
    });

    var slider = SIGAP.ui.confidenceSlider({
      label: 'Keyakinan keseluruhan terhadap laporanmu',
      value: 65,
      hint: 'Ukur dari kekuatan bukti di ketiga plate, bukan dari perasaan. Laporan yang jujur lebih berharga daripada laporan yang percaya diri.'
    });
    body.appendChild(slider.el);

    SIGAP.ui.modal({
      title: 'LAPORAN LAB: CASE 002',
      body: body,
      wide: true,
      actions: [
        { label: 'Batal', variant: 'ghost' },
        {
          label: 'Kirim Laporan', variant: 'primary',
          onClick: function (close) {
            close();
            submitReport(slider.get());
          }
        }
      ]
    });
  }

  function computeScores(overallConfidence) {
    var scanCount = 0, hypCount = 0, wrong = 0, correctFound = 0, bClean = 0, correctConc = 0;
    PLATES.forEach(function (p) {
      var ps = run.plates[p.id];
      MODES.forEach(function (m) { if (ps.scans[m.id]) scanCount++; });
      if (ps.hypothesis) hypCount++;
      wrong += ps.wrong;
      correctFound += Object.keys(ps.found).length;
      if (p.id === 'b') {
        MODES.forEach(function (m) { if (ps.clean[m.id]) bClean++; });
      }
      if (ps.conclusion === p.correct) correctConc++;
    });
    var cmpCount = Math.min(Object.keys(run.compareUsed).length, 2);

    var iq = Math.round(45 * (scanCount / 9) + 15 * (hypCount / 3) + 15 * (cmpCount / 2) + 25) - wrong * 4;
    iq = Math.max(5, Math.min(100, iq));

    var got = correctFound + bClean; // maks 4 + 3 = 7 penilaian relevan
    var precision = (got + wrong) > 0 ? got / (got + wrong) : 0;
    var er = Math.round(100 * (0.7 * (got / 7) + 0.3 * precision));
    er = Math.max(0, Math.min(100, er));

    var decisionCorrect = correctConc === 3;
    var decScore = Math.round((correctConc / 3) * 100);

    return {
      iq: iq,
      er: er,
      decisionCorrect: decisionCorrect,
      decScore: decScore,
      confidence: overallConfidence,
      wrong: wrong
    };
  }

  function submitReport(overallConfidence) {
    if (run.finished) return;
    run.finished = true;

    var sc = computeScores(overallConfidence);
    var decisionLabel = PLATES.map(function (p) {
      return p.short.replace('PLATE ', '') + ': ' + SHORT_LABEL[run.plates[p.id].conclusion];
    }).join(' · ');

    var res = SIGAP.scoring.finishCase({
      caseId: 'case002',
      investigationQuality: sc.iq,
      decisionCorrect: sc.decisionCorrect,
      evidenceRelevance: sc.er,
      confidence: sc.confidence,
      decisionLabel: decisionLabel,
      competencies: {
        aiLiteracy: { score: Math.round(0.5 * sc.decScore + 0.5 * sc.er), weight: 2 },
        evidenceReasoning: { score: sc.er, weight: 1.5 },
        criticalThinking: { score: sc.iq, weight: 1 }
      },
      xp: 100
    });

    if (!res.practice) {
      if (run.plates.c.conclusion === 'insufficient') {
        SIGAP.achievements.unlock('honest-uncertainty');
      }
      if (run.plates.b.conclusion === 'manipulasi') {
        SIGAP.scoring.recordMisconception('case002',
          'Menandai simulasi kontrol yang konsisten sebagai manipulasi, yaitu mencari kejanggalan yang tidak ada.');
      }
      if (run.plates.c.conclusion === 'manipulasi' && run.plates.c.confidence > 70) {
        SIGAP.scoring.recordMisconception('case002',
          'Sangat yakin “manipulasi” pada kasus ambigu dengan satu indikator lemah.');
      }
    }

    if (sc.decisionCorrect) SIGAP.audio.sfx('success');
    renderDebrief(res, sc);
  }

  function scoreRow(label, val) {
    return '<div class="score-row"><span>' + label + '</span>' +
      '<span class="score-row__val">' + val + '</span></div>';
  }

  function renderDebrief(res, sc) {
    var main = refs.main;
    main.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'stack stack--lg c2-debrief';
    main.appendChild(wrap);

    var header = document.createElement('div');
    header.className = 'screen__header';
    header.innerHTML =
      '<div class="screen__eyebrow">CASE 002 · DEBRIEF</div>' +
      '<h1 class="screen__title">Laporan Diperiksa</h1>';
    wrap.appendChild(header);

    if (res.practice) {
      var pb = document.createElement('div');
      pb.className = 'practice-banner';
      pb.textContent = 'PRACTICE RUN: XP tidak diberikan';
      wrap.appendChild(pb);
    }

    // Vonis keseluruhan
    var verdict = document.createElement('div');
    verdict.className = 'debrief-verdict ' + (sc.decisionCorrect ? 'debrief-verdict--good' : 'debrief-verdict--bad');
    verdict.innerHTML =
      '<span class="debrief-verdict__icon" aria-hidden="true">' + (sc.decisionCorrect ? '✔' : '✘') + '</span>' +
      '<span>' + (sc.decisionCorrect
        ? 'Ketiga kesimpulanmu sesuai bukti. Kamu membedakan “ada bukti manipulasi”, “tidak ditemukan bukti yang cukup”, dan “belum cukup bukti”, itu inti literasi visual.'
        : 'Sebagian kesimpulan belum sesuai bukti. Baca ulasan per plate di bawah, yang dinilai bukan tebakanmu, melainkan cara kamu menimbang indikator.') +
      '</span>';
    wrap.appendChild(verdict);

    // Ulasan per plate
    var per = document.createElement('div');
    per.className = 'panel';
    per.innerHTML = '<div class="panel-title">ULASAN PER PLATE</div>';
    PLATES.forEach(function (p) {
      var ps = run.plates[p.id];
      var ok = ps.conclusion === p.correct;
      var d = document.createElement('div');
      d.className = 'c2-plate-review' + (ok ? ' c2-plate-review--ok' : ' c2-plate-review--no');
      d.innerHTML =
        '<div class="row row--between"><strong>' +
        (ok ? '✔ ' : '✘ ') + SIGAP.ui.escapeHtml(p.label) + '</strong>' +
        '<span class="text-mono text-xs">' + SIGAP.ui.escapeHtml(SHORT_LABEL[ps.conclusion] || '-') +
        ' · ' + ps.confidence + '%</span></div>' +
        '<p class="text-sm">' + SIGAP.ui.escapeHtml(p.feedback[ps.conclusion] || '') + '</p>';
      per.appendChild(d);
    });
    wrap.appendChild(per);

    // Rincian skor
    var score = document.createElement('div');
    score.className = 'panel';
    var b = res.result.breakdown;
    score.innerHTML =
      '<div class="panel-title">RINCIAN SKOR</div>' +
      scoreRow('Kualitas investigasi (40%)', b.investigationQuality) +
      scoreRow('Ketepatan keputusan (30%)', b.decisionCorrectness) +
      scoreRow('Relevansi bukti (20%)', b.evidenceRelevance) +
      scoreRow('Kalibrasi keyakinan (10%)', b.confidenceCalibration) +
      '<div class="score-total"><span>TOTAL</span>' +
      '<span class="score-total__val">' + res.result.total + '</span></div>' +
      '<p class="text-sm text-muted">' + SIGAP.ui.escapeHtml(res.result.calibrationFeedback) + '</p>';
    wrap.appendChild(score);

    // Pesan penutup Aruna
    var outro = document.createElement('div');
    outro.className = 'panel panel--glass';
    outro.innerHTML =
      '<p class="text-sm"><strong>Dr. Aruna:</strong> ' +
      'Ingat pelajaran Plate B: tidak menemukan bukti manipulasi BUKAN berarti membuktikan keaslian. ' +
      'Dan pelajaran Plate C: berani bilang “belum cukup bukti” adalah kekuatan, bukan kelemahan. ' +
      'PHANTOM menang saat orang buru-buru yakin.</p>';
    wrap.appendChild(outro);

    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn btn--primary btn--lg';
    nextBtn.textContent = 'Lanjut';
    nextBtn.addEventListener('click', function () {
      nextBtn.disabled = true;
      showCinematic(function () { showReflection(wrap); });
    });
    wrap.appendChild(nextBtn);
    main.focus && main.focus();
    window.scrollTo(0, 0);
  }

  function showCinematic(onDone) {
    var cine = document.createElement('div');
    cine.className = 'case-complete-cine';
    cine.setAttribute('role', 'dialog');
    cine.setAttribute('aria-label', 'Kasus selesai');
    cine.innerHTML =
      '<div class="case-complete-cine__stamp">CASE CLOSED</div>' +
      '<p class="text-muted">CASE 002: Real or Generated? · Laporan diarsipkan.</p>';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--primary';
    btn.textContent = 'Lanjut';
    btn.addEventListener('click', function () {
      SIGAP.audio.sfx('click');
      if (cine.parentNode) cine.parentNode.removeChild(cine);
      onDone();
    });
    cine.appendChild(btn);
    document.body.appendChild(cine);
    btn.focus();
  }

  function showReflection(wrap) {
    var panel = document.createElement('div');
    panel.className = 'panel c2-reflection';
    panel.innerHTML = '<div class="panel-title">REFLEKSI</div>';
    var navRow = document.createElement('div');
    navRow.className = 'row c2-debrief-nav';

    function showNav() {
      if (navRow.childNodes.length) return;
      var back = document.createElement('a');
      back.className = 'btn btn--ghost';
      back.href = '#/academy';
      back.textContent = '← Kembali ke Academy';
      var next = document.createElement('a');
      next.className = 'btn btn--primary';
      next.href = '#/case003';
      next.textContent = 'Lanjut ke CASE 003 →';
      navRow.appendChild(back);
      navRow.appendChild(next);
    }

    panel.appendChild(SIGAP.ui.reflectionForm({
      contextId: 'case002',
      questions: [
        'Apa bedanya “tidak menemukan bukti manipulasi” dengan “terbukti asli”?',
        'Kapan kamu berhak merasa sangat yakin dengan sebuah kesimpulan?'
      ],
      onDone: showNav
    }));

    var skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'btn btn--sm btn--ghost';
    skip.textContent = 'Lewati refleksi';
    skip.addEventListener('click', function () {
      SIGAP.audio.sfx('click');
      skip.disabled = true;
      showNav();
    });
    panel.appendChild(skip);
    panel.appendChild(navRow);
    wrap.appendChild(panel);
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
