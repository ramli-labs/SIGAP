/* ============================================================
   SIGAP - games/case004.js
   CASE 004 "Phantom Signal". Klimaks: deepfake / video termanipulasi.

   Aset video (assets/cases/case004/) = REKAMAN ASLI seorang pengajar yang
   sedang presentasi di depan kelas (dipakai dengan izin sebagai bahan
   latihan), diturunkan oleh generate.py dari satu master referencenew.mp4,
   lalu DIVERIFIKASI frame-per-frame + pengukuran audio. Ucapan master
   diverifikasi ASR (faster-whisper medium, id):
     0,0–2,3  "yang akan kita pelajari atau kita lakuin hari ini"
     2,3–3,8  "yang pertama nanti"
     3,8–6,0  "bapak akan ngasih sebuah pertanyaan"
     7,4–7,7  "terus"
   Artefak nyata di suspect.mp4 (deskripsi bukti di bawah HARUS tetap
   cocok dengan aset):
     - 00:03.4–00:04.9 audio digeser +0,4 s dengan crossfade (segmen
       suara 3,0–4,5 diputar ulang pada 3,4–4,9) → bibir MENDAHULUI
       audio ±0,4 s; suara terlambat/overlap, BUKAN hening. Contoh:
       detik 3,8–4,1 mulut aktif ("bapak akan…") tetapi amplitudo audio
       nyaris kosong.
     - 00:05.55–00:05.72 area wajah pecah 3–4 frame: salinan wajah
       (crop 76x92 @442,124) bergeser +5/+4 px, bingkai kotak magenta,
       garis sobek mendatar.
     - 00:04.9 sambungan kasar (potongan 4,5–4,9 terlewati, sepotong kata
       "ngasih" hilang), lalu timbre berubah: nada dasar turun ±2,5
       semitone (lebih berat) + getar cepat (tremolo 9 Hz) sampai akhir.
     - 00:06.0+ dua blok warna di slide proyektor BERTUKAR WARNA:
       "Kumpulkan Data" (hijau) jadi merah, "Diskusi & Refleksi" (merah)
       jadi hijau; labelnya tetap di tempat. Yang diubah hanya hue piksel
       aslinya, jadi bayangan dan noise proyektor tetap utuh
       (reference.mp4: warna tidak berubah selama 9 detik).
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.data = SIGAP.data || {};
  SIGAP.data.evidenceCatalog = SIGAP.data.evidenceCatalog || {};

  var ASSET = 'assets/cases/case004/';
  var DUR = 9;

  /* ---------- Katalog bukti (cocok dengan isi video terverifikasi) ---------- */
  SIGAP.data.evidenceCatalog.case004 = {
    'c4-ev-lipsync': {
      id: 'c4-ev-lipsync',
      title: '00:03.4 · Bibir mendahului audio',
      body: 'Mulai detik 3,4 suara TERTINGGAL ±0,4 detik dari gerak bibir: mulut sudah membentuk ' +
        'kata berikutnya sementara audio masih menyelesaikan kata sebelumnya. Paling jelas di detik ' +
        '3,8–4,1: mulut aktif berbicara tetapi bar audio nyaris kosong; suaranya baru menyusul. ' +
        'Ketinggalan ini bertahan sampai detik 4,9. Di video referensi keduanya selalu serentak.',
      source: 'LIP-SYNC ANALYZER (simulasi)',
      strength: 'KUAT',
      temporal: true,
      ts: '00:03.4'
    },
    'c4-ev-boundary': {
      id: 'c4-ev-boundary',
      title: '00:05.6 · Tepi wajah berkedip',
      body: 'Selama 3–4 frame (detik 5,55–5,72) area wajah pecah: muncul salinan wajah yang ' +
        'bergeser beberapa piksel dengan bingkai kotak magenta, plus garis sobek mendatar melintasi wajah. ' +
        'Artefak batas (boundary) seperti ini bisa muncul saat sebuah wajah ditempelkan ke video lain.',
      source: 'FRAME ANALYZER (simulasi)',
      strength: 'KUAT',
      temporal: true,
      ts: '00:05.6'
    },
    'c4-ev-audio': {
      id: 'c4-ev-audio',
      title: '±00:04.9 · Warna suara berubah',
      body: 'Sebelum detik 4,9 warna suaranya masih natural. Tepat di detik 4,9 ada sambungan kasar: ' +
        'sepotong ucapan seperti terlewati, lalu nada dasar tiba-tiba TURUN (lebih berat) dan bergetar ' +
        'cepat (tremolo). Pola gelombang paruh kedua jelas berbeda, padahal di video referensi warna ' +
        'suaranya konsisten dari awal sampai akhir.',
      source: 'AUDIO WAVEFORM (simulasi)',
      strength: 'SEDANG',
      temporal: true,
      ts: '00:04.9'
    },
    'c4-ev-background': {
      id: 'c4-ev-background',
      title: '00:06.0 · Warna blok di slide bertukar',
      body: 'Mulai detik 6, dua blok di slide proyektor bertukar warna: "Kumpulkan Data" yang sejak ' +
        'awal HIJAU berubah jadi MERAH, dan "Diskusi & Refleksi" yang MERAH berubah jadi HIJAU, ' +
        'sementara tulisannya tetap di tempat. Pada video referensi warnanya tidak berubah sedikit pun ' +
        'selama 9 detik. Slide tidak bisa berubah sendiri sementara orangnya bicara tanpa jeda; ' +
        'perubahan seperti ini menandakan ada potongan yang disambung.',
      source: 'BACKGROUND CONTINUITY (simulasi)',
      strength: 'SEDANG',
      temporal: true,
      ts: '00:06.0'
    },
    'c4-ev-metadata': {
      id: 'c4-ev-metadata',
      title: 'Metadata (simulasi) tidak konsisten',
      body: 'Encoder berbeda dengan rekaman resmi sekolah, tanggal dibuat tidak sama dengan tanggal ' +
        'diubah, dan ada jejak encode ulang. Ingat: metadata bisa membantu, TAPI mudah dipalsukan ' +
        'atau hilang saat file dikirim ulang. Ini bukti pendukung, bukan bukti final.',
      source: 'METADATA VIEWER (simulasi)',
      strength: 'LEMAH',
      temporal: false,
      ts: '-'
    }
  };

  var EV = SIGAP.data.evidenceCatalog.case004;

  /* ---------- Konfigurasi hipotesis & tools ---------- */
  var HYPOS = [
    { id: 'face', key: 'A', label: 'Wajah', desc: 'Area wajah terasa aneh. Mungkin ada artefak visual di sekitar wajah.' },
    { id: 'lipsync', key: 'B', label: 'Lip-sync', desc: 'Gerak bibir dan suara terasa tidak pas. Mungkin tidak sinkron.' },
    { id: 'audio', key: 'C', label: 'Audio', desc: 'Suaranya terdengar berubah-ubah. Mungkin audionya yang diubah.' },
    { id: 'background', key: 'D', label: 'Latar', desc: 'Ada yang janggal di latar belakang. Mungkin latarnya tidak konsisten.' },
    { id: 'metadata', key: 'E', label: 'Metadata', desc: 'Cek dulu data teknis file-nya. Mungkin ada jejak penyuntingan.' }
  ];

  var TOOLS = [
    { id: 'frame', name: 'FRAME ANALYZER', hypo: 'face', desc: 'Telusuri video frame demi frame (langkah 0,4 detik).' },
    { id: 'lipsync', name: 'LIP-SYNC ANALYZER', hypo: 'lipsync', desc: 'Bandingkan bar gerak mulut dengan bar amplitudo audio.' },
    { id: 'audio', name: 'AUDIO WAVEFORM', hypo: 'audio', desc: 'Bandingkan bentuk gelombang audio kedua video.' },
    { id: 'background', name: 'BACKGROUND CONTINUITY', hypo: 'background', desc: 'Bandingkan potongan latar suspect vs referensi.' },
    { id: 'metadata', name: 'METADATA VIEWER', hypo: 'metadata', desc: 'Lihat tabel metadata forensik (SIMULASI).' }
  ];

  function toolForHypo(h) {
    for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i].hypo === h) return TOOLS[i].id;
    return TOOLS[0].id;
  }

  /* ---------- Data tersinkron dengan aset video final ----------
     Diukur dari aset final oleh assets/cases/case004/measure.py:
     audio = RMS per 0,1 s (reference & suspect dinormalkan dengan skala
     yang sama, 0-1); mulut = gabungan bukaan bibir (jarak bibir dalam /
     lebar mulut, face-mesh landmark) dan laju perubahannya per 0,1 s,
     dinormalkan 0-1. Indeks i = detik i/10. */
  var MOUTH_DATA = [0.64, 0.64, 0.62, 1, 0.4, 0.4, 0.34, 0.31, 0.44, 0.48, 0.35, 0.4, 0.64, 0.77, 0.61, 0.49, 0.77, 0.7, 0.34, 0.35, 0.85, 0.67, 0.85, 1, 1, 1, 0.93, 0.86, 0.75, 0.56, 0.5, 0.56, 0.36, 0.23, 0.24, 0.22, 0.38, 0.38, 0.82, 0.46, 0.48, 0.1, 0.47, 1, 0.6, 0.56, 0.67, 0.7, 0.91, 0.48, 0.33, 0.41, 0.18, 0.18, 0.29, 0.2, 0.64, 0.57, 0.49, 0.69, 0.68, 0.63, 0.53, 0.31, 0.17, 0.16, 0.19, 0.18, 0.3, 0.47, 0.46, 0.06, 0.01, 0.01, 0.02, 0.16, 0.29, 0.37, 0.31, 0.26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var AUDIO_REF = [0.6, 0.42, 0.41, 0.61, 0.41, 0.9, 0.68, 0.88, 0.84, 0.67, 0.44, 0.3, 0.46, 0.68, 0.32, 0.48, 0.38, 0.62, 0.43, 0.4, 0.45, 0.33, 0.29, 0.39, 0.39, 0.41, 0.53, 0.51, 0.55, 0.43, 1, 0.45, 0.19, 0.12, 0.12, 0.1, 0.1, 0.15, 0.6, 0.57, 0.69, 0.29, 0.2, 0.12, 0.45, 0.21, 0.51, 0.28, 0.56, 0.26, 0.41, 0.31, 0.28, 0.74, 0.86, 0.44, 0.31, 0.3, 0.48, 0.33, 0.27, 0.25, 0.34, 0.15, 0.1, 0.09, 0.07, 0.08, 0.09, 0.08, 0.09, 0.08, 0.1, 0.09, 0.11, 0.6, 0.55, 0.45, 0.83, 0.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var AUDIO_SUS = [0.6, 0.42, 0.41, 0.61, 0.41, 0.9, 0.68, 0.88, 0.84, 0.67, 0.44, 0.3, 0.46, 0.68, 0.32, 0.48, 0.38, 0.62, 0.43, 0.4, 0.45, 0.33, 0.29, 0.39, 0.39, 0.41, 0.53, 0.51, 0.55, 0.43, 1, 0.45, 0.19, 0.12, 0.54, 0.45, 0.19, 0.12, 0.12, 0.1, 0.1, 0.15, 0.6, 0.58, 0.68, 0.29, 0.21, 0.12, 0.45, 0.13, 0.34, 0.2, 0.22, 0.54, 0.64, 0.31, 0.23, 0.2, 0.32, 0.24, 0.23, 0.14, 0.29, 0.12, 0.08, 0.06, 0.05, 0.06, 0.06, 0.06, 0.06, 0.06, 0.07, 0.07, 0.08, 0.5, 0.35, 0.31, 0.53, 0.24, 0.06, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  function sample(arr, t) {
    var i = Math.floor(t * 10);
    if (i < 0) i = 0;
    if (i >= arr.length) i = arr.length - 1;
    return arr[i];
  }
  function mouthLevel(t) { return sample(MOUTH_DATA, t); }
  function audioEnvRef(t) { return sample(AUDIO_REF, t); }
  function audioEnvSus(t) { return sample(AUDIO_SUS, t); }

  function fmt(t) {
    var s = Math.floor(t), d = Math.round((t - s) * 10);
    if (d === 10) { s += 1; d = 0; }
    return '00:0' + s + '.' + d;
  }

  /* ---------- Helper DOM ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function btn(label, cls, onClick) {
    var b = el('button', cls, label);
    b.type = 'button';
    b.addEventListener('click', function () {
      if (SIGAP.audio) SIGAP.audio.sfx('click');
      onClick(b);
    });
    return b;
  }
  function simLabel(extra) {
    return el('div', 'sim-label',
      'SIMULATED FORENSIC TOOL, bukan detektor AI nyata. ' +
      'Alat ini hanya menampilkan data; KAMU yang mengamati dan menilai.' +
      (extra ? ' ' + extra : ''));
  }

  /* ---------- State runtime (di-reset tiap render) ---------- */
  var S = null;
  var live = { videos: [], timers: [] };

  function freshState() {
    return {
      practice: SIGAP.state.isPractice('case', 'case004'),
      watched: { suspect: false, reference: false },
      transcript: { suspect: false, reference: false },
      hypothesis: null,
      revisions: 0,
      toolsOpened: {},
      firstToolUsed: false,
      found: {},
      wrongMarks: 0,
      hintLevel: {},
      decision: null,
      support: [],
      phantomHunterGiven: false
    };
  }

  function foundCount() { var n = 0, k; for (k in S.found) if (S.found[k]) n++; return n; }
  function temporalCount() {
    var n = 0, k;
    for (k in S.found) if (S.found[k] && EV[k] && EV[k].temporal) n++;
    return n;
  }

  function markToolUsed() {
    if (S.firstToolUsed) return;
    S.firstToolUsed = true;
    if (refreshTabs) refreshTabs();
    SIGAP.ui.toast('Alat lain sekarang terbuka.', 'info');
  }

  function markFound(id) {
    markToolUsed();
    if (S.found[id]) {
      SIGAP.ui.toast('Bukti ini sudah ada di papan bukti.', 'info');
      return;
    }
    S.found[id] = true;
    SIGAP.state.recordEvidence('case004', id);
    if (SIGAP.audio) SIGAP.audio.sfx('evidence');
    SIGAP.ui.toast('Bukti ditemukan: ' + EV[id].title, 'success');
    if (!S.practice && !S.phantomHunterGiven && temporalCount() >= 2) {
      S.phantomHunterGiven = true;
      SIGAP.achievements.unlock('phantom-hunter');
    }
    refreshSidebar();
  }

  function wrongMark(toolId, hints) {
    markToolUsed();
    S.wrongMarks++;
    if (SIGAP.audio) SIGAP.audio.sfx('warning');
    var lvl = S.hintLevel[toolId] = (S.hintLevel[toolId] || 0) + 1;
    var hint = hints[Math.min(lvl, hints.length) - 1];
    SIGAP.ui.toast(hint, 'warn');
  }

  /* ============================================================
     RENDER UTAMA
     ============================================================ */
  var refs = { stage: null, steps: null, sidebar: null, main: null };

  SIGAP.router.register('case004', {
    title: 'CASE 004: Phantom Signal',

    render: function (container) {
      S = freshState();
      live = { videos: [], timers: [] };

      SIGAP.ui.background(container);
      container.appendChild(SIGAP.ui.topbar({ crumb: 'CASE 004', backTo: 'missions' }));

      var main = el('div', 'container screen');
      container.appendChild(main);
      refs.main = main;

      var header = el('div', 'screen__header');
      header.appendChild(el('div', 'screen__eyebrow', 'CASE 004 · KLIMAKS'));
      header.appendChild(el('h1', 'screen__title', 'Phantom Signal'));
      header.appendChild(el('p', 'screen__sub',
        'Sebuah potongan video guru beredar dan diragukan keasliannya. Bandingkan dengan rekaman referensi resmi, ' +
        'uji hipotesismu dengan alat forensik simulasi, lalu putuskan berdasarkan bukti.'));
      main.appendChild(header);

      refs.steps = el('div', 'c4-steps');
      main.appendChild(refs.steps);

      refs.stage = el('div', 'stack stack--lg');
      main.appendChild(refs.stage);

      showIntro();
    },

    onLeave: function () {
      live.videos.forEach(function (v) {
        try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) { /* noop */ }
      });
      live.timers.forEach(function (t) { clearTimeout(t); });
      if (live.cine && live.cine.parentNode) live.cine.parentNode.removeChild(live.cine);
      live = { videos: [], timers: [] };
      refreshTabs = null;
      S = null;
    }
  });

  function setPhase(idx) {
    refs.steps.innerHTML = '';
    refs.steps.appendChild(
      SIGAP.ui.phaseSteps(['AMATI', 'HIPOTESIS', 'UJI', 'KEPUTUSAN', 'PHANTOM'], idx));
  }

  function clearStage() {
    live.videos.forEach(function (v) { try { v.pause(); } catch (e) { /* noop */ } });
    live.videos = [];
    refs.stage.innerHTML = '';
    refs.sidebar = null;
  }

  /* ============================================================
     FASE 0: INTRO
     ============================================================ */
  function showIntro() {
    setPhase(0);
    SIGAP.ui.dialogue.play([
      { speaker: 'aruna', voice: 'aruna/case004-intro-01.mp3', text: 'Agen, ini kasus terbesar kita. Potongan video guru kita saat menjelaskan proyek di kelas beredar di grup chat. Versinya sudah diubah, dan seorang siswa jadi tersudut. Beliau bilang bukan itu yang dia rekam.' },
      { speaker: 'aruna', voice: 'aruna/case004-intro-02.mp3', text: 'Untungnya, sekolah punya rekaman referensi resmi yang diambil di ruangan yang sama. Bandingkan keduanya dengan teliti: mata dan telingamu adalah alat pertama.' },
      { speaker: 'system', text: 'CATATAN: kedua video adalah SIMULASI MEDIA PELATIHAN. Rekaman aslinya nyata dan dipakai dengan izin; versi "suspect" sengaja diberi artefak buatan untuk latihan ini. Jangan sebarkan potongannya di luar kelas.' },
      { speaker: 'aruna', voice: 'aruna/case004-intro-03.mp3', text: 'Tonton keduanya sampai selesai (nyalakan suara). Catat apa pun yang terasa janggal, sekecil apa pun.' }
    ], { onEnd: showObserve });
  }

  /* ============================================================
     FASE 1: AMATI (dua video)
     ============================================================ */
  function videoPanel(kind, label, tagClass, transcriptLines) {
    var panel = el('div', 'panel c4-video-panel');
    var head = el('div', 'row row--between');
    head.appendChild(el('span', 'tag ' + tagClass, label));
    head.appendChild(el('span', 'text-xs text-muted', '9 detik · dengan suara'));
    panel.appendChild(head);

    var holder = el('div', 'c4-video-holder');
    var video = document.createElement('video');
    video.className = 'c4-video';
    video.src = ASSET + (kind === 'suspect' ? 'suspect.mp4' : 'reference.mp4');
    video.controls = true;
    video.preload = 'metadata';
    video.playsInline = true;
    video.setAttribute('aria-label', label + ': video simulasi pelatihan, 9 detik');
    holder.appendChild(video);
    panel.appendChild(holder);
    live.videos.push(video);

    video.addEventListener('ended', function () {
      S.watched[kind] = true;
      updateObserveGate();
    });

    var showTranscript = function () {
      S.transcript[kind] = true;
      var body = el('div', 'stack');
      body.appendChild(el('p', 'text-sm text-muted',
        'Transkrip observasi (pengganti jika video tidak bisa diputar):'));
      var ul = el('ul', 'c4-transcript');
      transcriptLines.forEach(function (line) {
        ul.appendChild(el('li', null, SIGAP.ui.escapeHtml(line)));
      });
      body.appendChild(ul);
      SIGAP.ui.modal({
        title: 'Transkrip: ' + label,
        body: body,
        actions: [{ label: 'Tutup', variant: 'primary', onClick: function (close) { close(); } }]
      });
      updateObserveGate();
    };

    video.addEventListener('error', function () {
      holder.innerHTML = '';
      var fb = el('div', 'panel panel--accent c4-video-fallback',
        '<strong>Video tidak dapat diputar di perangkat ini.</strong><br>' +
        'Tenang, kamu tetap bisa menyelidiki lewat transkrip observasi di bawah.');
      holder.appendChild(fb);
      showTranscript();
    });

    var controls = el('div', 'row c4-video-controls');
    controls.appendChild(btn('&#8634; Putar ulang', 'btn btn--sm btn--ghost', function () {
      try { video.currentTime = 0; video.play(); } catch (e) { /* noop */ }
    }));
    controls.appendChild(btn('Transkrip observasi', 'btn btn--sm btn--ghost', function () {
      showTranscript();
    }));
    panel.appendChild(controls);
    return panel;
  }

  var observeGateBtn = null;
  function updateObserveGate() {
    if (!observeGateBtn || !S) return;
    var okS = S.watched.suspect || S.transcript.suspect;
    var okR = S.watched.reference || S.transcript.reference;
    observeGateBtn.disabled = !(okS && okR);
    observeGateBtn.textContent = (okS && okR)
      ? 'Lanjut: susun hipotesis &rarr;'
      : 'Tonton kedua video (atau buka transkripnya) dulu';
    if (okS && okR) observeGateBtn.innerHTML = 'Lanjut: susun hipotesis &rarr;';
  }

  function showObserve() {
    setPhase(0);
    clearStage();

    var grid = el('div', 'grid-2 c4-videos');
    grid.appendChild(videoPanel('suspect', 'VIDEO BEREDAR (SUSPECT)', 'tag--red', [
      'Seorang pengajar berdiri di depan kelas, di sisi kanan layar proyektor yang menampilkan slide alur belajar (Pertanyaan Pemantik, Rancang Proyek, Kumpulkan Data, Latih Model AI, Uji Model, Evaluasi & Refleksi). Dinding hijau toska di bawah layar; papan tulis kaca di sisi kanan. Watermark: SIMULASI MEDIA PELATIHAN.',
      'Ia berkata: "…yang akan kita pelajari atau kita lakuin hari ini. Yang pertama nanti bapak akan ngasih sebuah pertanyaan… terus…"',
      'Sekitar detik 3-5 suaranya tertinggal dari gerak bibir: mulut sudah mengucapkan kata berikutnya, suaranya menyusul terlambat.',
      'Sekilas, sekitar detik 5-6, ada kedipan kotak magenta dan garis sobek di area wajah.',
      'Di detik 4,9 ada sambungan kasar: sepotong kata seperti hilang, lalu suaranya berubah jadi lebih berat dan bergetar; setelah detik 6 ada yang berpindah di latar belakang.'
    ]));
    grid.appendChild(videoPanel('reference', 'REKAMAN REFERENSI RESMI', 'tag--green', [
      'Pengajar yang sama, ruang kelas yang sama, slide alur belajar yang sama di layar proyektor. Watermark: SIMULASI MEDIA PELATIHAN.',
      'Kalimat yang sama diucapkan jelas dan utuh: "…yang akan kita pelajari atau kita lakuin hari ini. Yang pertama nanti bapak akan ngasih sebuah pertanyaan… terus…"',
      'Gerak mulut dan suara selalu terasa serentak.',
      'Suara terdengar konsisten dari awal sampai akhir; warna blok di slide tidak berubah.'
    ]));
    refs.stage.appendChild(grid);

    var note = el('p', 'text-sm text-muted text-center',
      'Perhatikan: kapan mulut bergerak vs kapan suara terdengar, area tepi wajah, warna suara, dan posisi benda di latar.');
    refs.stage.appendChild(note);

    var gateRow = el('div', 'text-center');
    observeGateBtn = btn('Tonton kedua video (atau buka transkripnya) dulu', 'btn btn--primary btn--lg', function () {
      showHypothesis(false);
    });
    observeGateBtn.disabled = true;
    gateRow.appendChild(observeGateBtn);
    refs.stage.appendChild(gateRow);
    updateObserveGate();
  }

  /* ============================================================
     FASE 2: HIPOTESIS
     ============================================================ */
  function showHypothesis(isRevision) {
    if (!isRevision) {
      setPhase(1);
      clearStage();

      var intro = el('div', 'panel panel--glass');
      intro.appendChild(el('h2', 'panel-title', 'Apa dugaan awalmu?'));
      intro.appendChild(el('p', 'text-sm text-muted',
        'Pilih bagian yang menurutmu paling janggal. Pilihanmu menentukan alat forensik PERTAMA ' +
        'yang terbuka. Alat lain menyusul setelah alat pertama dipakai. Hipotesis boleh diubah kapan saja; ' +
        'salah hipotesis bukan akhir segalanya.'));
      refs.stage.appendChild(intro);

      var grid = el('div', 'grid-2 c4-hypo-grid');
      HYPOS.forEach(function (h) {
        var card = btn(
          '<span class="option-card__key">' + h.key + '</span>' +
          '<strong>' + h.label + '</strong><br><span class="text-sm text-muted">' + h.desc + '</span>',
          'option-card c4-hypo-card',
          function () { pickHypothesis(h.id, false); }
        );
        grid.appendChild(card);
      });
      refs.stage.appendChild(grid);
    } else {
      var body = el('div', 'stack');
      body.appendChild(el('p', 'text-sm text-muted',
        'Merevisi hipotesis itu bagian normal dari investigasi. Alat untuk hipotesis baru ikut terbuka.'));
      var grid2 = el('div', 'stack stack--sm');
      var modal;
      HYPOS.forEach(function (h) {
        var card = btn(
          '<span class="option-card__key">' + h.key + '</span> <strong>' + h.label + '</strong>: ' +
          '<span class="text-sm text-muted">' + h.desc + '</span>',
          'option-card' + (S.hypothesis === h.id ? ' option-card--selected' : ''),
          function () {
            modal.close();
            if (h.id !== S.hypothesis) pickHypothesis(h.id, true);
          }
        );
        grid2.appendChild(card);
      });
      body.appendChild(grid2);
      modal = SIGAP.ui.modal({ title: 'Ubah hipotesis', body: body, dismissible: true });
    }
  }

  function pickHypothesis(id, isRevision) {
    if (isRevision) S.revisions++;
    S.hypothesis = id;
    var h = null;
    HYPOS.forEach(function (x) { if (x.id === id) h = x; });
    SIGAP.ui.toast('Hipotesis: ' + h.label + '. Alat ' +
      TOOLS.filter(function (t) { return t.hypo === id; })[0].name + ' terbuka.', 'info');
    if (isRevision) renderInvestigate(activeToolId || toolForHypo(id));
    else renderInvestigate(toolForHypo(id));
  }

  /* ============================================================
     FASE 3: UJI (tools + papan bukti)
     ============================================================ */
  var activeToolId = null;
  var refreshTabs = null;

  function toolAvailable(toolId) {
    if (S.firstToolUsed) return true;
    return toolId === toolForHypo(S.hypothesis);
  }

  function renderInvestigate(openToolId) {
    setPhase(2);
    clearStage();

    var layout = el('div', 'case-layout');
    refs.stage.appendChild(layout);

    var left = el('div', 'stack');
    layout.appendChild(left);

    // Tab alat (dibangun ulang saat alat lain terbuka)
    var tabs = el('div', 'c4-tools', '');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Alat forensik simulasi');
    function buildTabs() {
      tabs.innerHTML = '';
      TOOLS.forEach(function (t) {
        var locked = !toolAvailable(t.id);
        var b = btn(
          (locked ? '&#128274; ' : '') + t.name,
          'c4-tool-btn' + (locked ? ' c4-tool-btn--locked' : '') +
          (t.id === openToolId ? ' c4-tool-btn--active' : ''),
          function () {
            if (!toolAvailable(t.id)) {
              SIGAP.ui.toast('Terkunci. Gunakan dulu alat pertamamu (' +
                TOOLS.filter(function (x) { return x.id === toolForHypo(S.hypothesis); })[0].name +
                '). Tandai sesuatu di sana, atau ubah hipotesis.', 'warn');
              return;
            }
            renderInvestigate(t.id);
          });
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', t.id === openToolId ? 'true' : 'false');
        if (locked) b.setAttribute('aria-disabled', 'true');
        tabs.appendChild(b);
      });
    }
    buildTabs();
    refreshTabs = buildTabs;
    left.appendChild(tabs);

    // Panel alat
    var toolPanel = el('div', 'panel c4-tool-panel');
    left.appendChild(toolPanel);
    activeToolId = openToolId;
    if (openToolId && toolAvailable(openToolId)) {
      S.toolsOpened[openToolId] = true;
      renderTool(openToolId, toolPanel);
    } else {
      toolPanel.appendChild(el('p', 'text-muted', 'Pilih alat di atas untuk mulai menguji hipotesismu.'));
    }

    // Sidebar bukti
    refs.sidebar = el('div', 'stack');
    layout.appendChild(refs.sidebar);
    refreshSidebar();
  }

  function refreshSidebar() {
    if (!refs.sidebar || !S) return;
    refs.sidebar.innerHTML = '';

    var hypoPanel = el('div', 'panel panel--glass');
    hypoPanel.appendChild(el('div', 'panel-title', 'Hipotesis aktif'));
    var h = null;
    HYPOS.forEach(function (x) { if (x.id === S.hypothesis) h = x; });
    hypoPanel.appendChild(el('p', 'text-sm', h ? ('<strong>' + h.label + '</strong>: ' + h.desc) : '-'));
    hypoPanel.appendChild(btn('Ubah hipotesis', 'btn btn--sm btn--ghost', function () {
      showHypothesis(true);
    }));
    refs.sidebar.appendChild(hypoPanel);

    var evPanel = el('div', 'panel');
    evPanel.appendChild(el('div', 'panel-title', 'Papan bukti (' + foundCount() + '/5)'));
    var any = false;
    for (var k in EV) {
      if (S.found[k]) {
        any = true;
        evPanel.appendChild(SIGAP.ui.evidenceCard({
          id: k, title: EV[k].title, body: EV[k].body,
          source: EV[k].source, strength: EV[k].strength, found: true
        }));
      }
    }
    if (!any) {
      evPanel.appendChild(el('p', 'text-sm text-faint',
        'Belum ada bukti. Gunakan alat, lalu tandai timestamp yang janggal.'));
    }
    if (temporalCount() >= 2) {
      evPanel.appendChild(el('p', 'text-xs text-success',
        '&#10003; Dua artefak temporal atau lebih. Bukti mulai saling menguatkan.'));
    }
    refs.sidebar.appendChild(evPanel);

    var act = el('div', 'panel panel--accent stack stack--sm');
    act.appendChild(el('p', 'text-sm text-muted',
      'Sudah yakin dengan temuanmu? Kamu bisa mengambil keputusan kapan saja, tetapi bukti yang ' +
      'saling mendukung membuat kesimpulan lebih kuat.'));
    act.appendChild(btn('Ambil keputusan &rarr;', 'btn btn--primary btn--block', function () {
      if (temporalCount() < 2) {
        SIGAP.ui.confirm('Bukti masih sedikit',
          'Kamu baru menemukan ' + temporalCount() + ' artefak temporal. Lanjut ke keputusan sekarang, ' +
          'atau kembali memeriksa dengan alat lain?',
          function () { showDecision(); },
          { yesLabel: 'Tetap lanjut', noLabel: 'Periksa lagi' });
      } else {
        showDecision();
      }
    }));
    refs.sidebar.appendChild(act);
  }

  function renderTool(id, panel) {
    if (id === 'frame') toolFrame(panel);
    else if (id === 'lipsync') toolLipsync(panel);
    else if (id === 'audio') toolAudio(panel);
    else if (id === 'background') toolBackground(panel);
    else if (id === 'metadata') toolMetadata(panel);
  }

  /* ---------- TOOL 1: FRAME ANALYZER ---------- */
  function frameDescription(t) {
    if (t >= 5.4 && t <= 5.8) {
      return 'Area wajah tampak PECAH: salinan wajah bergeser dengan bingkai kotak magenta, plus garis sobek mendatar.';
    }
    if (t >= 6.0) return 'Pengajar berbicara. Di slide, blok "Kumpulkan Data" kini MERAH dan blok "Diskusi & Refleksi" kini HIJAU. Warnanya tertukar.';
    return 'Pengajar berbicara di depan layar proyektor; di slide, blok "Kumpulkan Data" hijau dan blok "Diskusi & Refleksi" merah. Tidak ada keanehan mencolok.';
  }

  function toolFrame(panel) {
    panel.appendChild(el('div', 'panel-title', 'FRAME ANALYZER: video beredar (suspect)'));
    panel.appendChild(simLabel('Telusuri per 0,4 detik; video normal berjalan 25 frame/detik.'));

    var body = el('div', 'stack');
    panel.appendChild(body);

    var video = document.createElement('video');
    video.src = ASSET + 'suspect.mp4';
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.style.display = 'none';
    live.videos.push(video);
    body.appendChild(video);

    var canvas = el('canvas', 'c4-frame-canvas');
    canvas.width = 480; canvas.height = 270;
    canvas.setAttribute('role', 'img');
    var ctx = canvas.getContext('2d');

    var timeLabel = el('div', 'text-mono text-cyan c4-time-label', fmt(0));
    var descBox = el('p', 'text-sm text-muted', frameDescription(0));

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0'; slider.max = '22'; slider.step = '1'; slider.value = '0';
    slider.className = 'c4-scrub';
    slider.setAttribute('aria-label', 'Pilih waktu frame (langkah 0,4 detik)');

    var canvasOk = true;
    function currentT() { return Math.min(parseInt(slider.value, 10) * 0.4, 8.8); }
    function drawFrame() {
      var t = currentT();
      timeLabel.textContent = fmt(t) + '  (frame ' + Math.round(t * 25) + ')';
      canvas.setAttribute('aria-label', 'Frame video pada ' + fmt(t) + '. ' + frameDescription(t));
      descBox.textContent = 'Catatan pengamatan otomatis: ' + frameDescription(t);
      if (!canvasOk) return;
      try { video.currentTime = t; } catch (e) { fallbackMode(); }
    }
    video.addEventListener('seeked', function () {
      if (!canvasOk) return;
      try { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); }
      catch (e) { fallbackMode(); }
    });
    video.addEventListener('error', fallbackMode);

    var fbList = null;
    function fallbackMode() {
      if (!canvasOk) return;
      canvasOk = false;
      canvas.style.display = 'none';
      if (fbList) return;
      fbList = el('div', 'panel panel--glass c4-frame-fallback');
      fbList.appendChild(el('p', 'text-sm',
        '<strong>Mode teks:</strong> pratinjau frame tidak tersedia. Gunakan slider. Deskripsi tiap frame tetap akurat.'));
      body.insertBefore(fbList, timeLabel);
    }

    slider.addEventListener('input', function () {
      if (SIGAP.audio) SIGAP.audio.sfx('scan');
      drawFrame();
    });

    body.appendChild(canvas);
    body.appendChild(timeLabel);
    body.appendChild(slider);
    body.appendChild(descBox);

    var row = el('div', 'row');
    row.appendChild(btn('&#9873; Tandai frame ini janggal', 'btn btn--primary', function () {
      var t = currentT();
      if (t >= 5.4 && t <= 5.8) {
        markFound('c4-ev-boundary');
      } else if (t >= 6.0) {
        markToolUsed();
        SIGAP.ui.toast('Ada yang berubah di latar? Bandingkan dengan referensi lewat BACKGROUND CONTINUITY.', 'info');
      } else {
        wrongMark('frame', [
          'Di frame ini belum tampak keanehan. Perhatikan area TEPI wajah, bukan bagian tengah.',
          'Petunjuk: kejanggalan visual sering hanya 2-3 frame. Telusuri pelan-pelan sekitar detik 5-6.'
        ]);
      }
    }));
    body.appendChild(row);
    drawFrame();
  }

  /* ---------- TOOL 2: LIP-SYNC ANALYZER ---------- */
  function toolLipsync(panel) {
    panel.appendChild(el('div', 'panel-title', 'LIP-SYNC ANALYZER: video beredar (suspect)'));
    panel.appendChild(simLabel('Bar dibuat dari data gerak mulut dan amplitudo audio video ini.'));

    var body = el('div', 'stack');
    panel.appendChild(body);
    body.appendChild(el('p', 'text-sm text-muted',
      'Baris atas: seberapa terbuka mulut. Baris bawah: seberapa keras suara. ' +
      'Pada video jujur, keduanya naik-turun BERSAMAAN. Klik segmen waktu yang menurutmu tidak sinkron.'));

    var canvas = el('canvas', 'c4-chart');
    canvas.width = 640; canvas.height = 150;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label',
      'Grafik bar gerak mulut (atas, biru) vs amplitudo audio (bawah, kuning) sepanjang 9 detik. ' +
      'Mulai detik 3,4 pola bar audio tertinggal ±0,4 detik dari bar mulut; paling jelas di detik ' +
      '3,8 sampai 4,1: bar mulut tinggi tetapi bar audio hampir kosong. Sinkron kembali di detik 4,9.');
    var ctx = canvas.getContext('2d');
    // gambar bar per 0.1 s
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, 640, 150);
    for (var i = 0; i < 90; i++) {
      var t = i * 0.1 + 0.05;
      var x = Math.round(t / DUR * 640);
      var m = mouthLevel(t), a = audioEnvSus(t);
      ctx.fillStyle = '#37c8dd';
      ctx.fillRect(x, 68 - m * 60, 5, m * 60);
      ctx.fillStyle = '#e8a33d';
      ctx.fillRect(x, 80, 5, a * 60);
    }
    ctx.fillStyle = '#8fa2b8';
    ctx.font = '11px monospace';
    ctx.fillText('MULUT', 4, 12);
    ctx.fillText('AUDIO', 4, 146);
    body.appendChild(canvas);
    body.appendChild(el('div', 'row row--between c4-axis',
      '<span>00:00</span><span>00:03</span><span>00:06</span><span>00:09</span>'));

    body.appendChild(el('p', 'text-sm', 'Tandai segmen yang TIDAK sinkron:'));
    var segRow = el('div', 'c4-timeline');
    segRow.setAttribute('role', 'group');
    segRow.setAttribute('aria-label', 'Segmen waktu 0,4 detik');
    for (var s = 0; s < 22; s++) {
      (function (segStart) {
        var b = btn(fmt(segStart), 'c4-seg', function (self) {
          if (segStart >= 3.2 && segStart <= 4.4) {
            self.classList.add('c4-seg--correct');
            markFound('c4-ev-lipsync');
          } else {
            self.classList.add('c4-seg--wrong');
            wrongMark('lipsync', [
              'Di segmen ini bar mulut dan bar audio masih kompak. Cari bagian di mana bar atas tinggi tetapi bar bawah kosong.',
              'Petunjuk: perhatikan bagian tengah video, antara detik ke-3 dan ke-5.'
            ]);
          }
        });
        segRow.appendChild(b);
      })(s * 0.4);
    }
    body.appendChild(segRow);
  }

  /* ---------- TOOL 3: AUDIO WAVEFORM ---------- */
  function drawWave(canvas, envFn, splitAt) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height, mid = H / 2;
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, W, H);
    for (var x = 0; x < W; x++) {
      var t = x / W * DUR;
      var env = envFn(t);
      var texture = Math.abs(Math.sin(2 * Math.PI * (splitAt && t >= splitAt ? 58 : 40) * t));
      var a = env * (0.35 + 0.65 * texture) * (mid - 6);
      ctx.fillStyle = (splitAt && t >= splitAt) ? '#c084fc' : '#37c8dd';
      ctx.fillRect(x, mid - a, 1, Math.max(2, a * 2));
    }
    ctx.strokeStyle = '#1e2f4a';
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
  }

  function toolAudio(panel) {
    panel.appendChild(el('div', 'panel-title', 'AUDIO WAVEFORM: suspect vs referensi'));
    panel.appendChild(simLabel('Gelombang digambar dari data amplitudo audio kedua video.'));

    var body = el('div', 'stack');
    panel.appendChild(body);
    body.appendChild(el('p', 'text-sm text-muted',
      'Video jujur biasanya punya "warna suara" yang konsisten. Bandingkan kedua gelombang, ' +
      'lalu tandai di bagian mana pola suspect BERUBAH.'));

    body.appendChild(el('div', 'text-xs text-mono text-danger', 'SUSPECT'));
    var c1 = el('canvas', 'c4-chart');
    c1.width = 640; c1.height = 90;
    c1.setAttribute('role', 'img');
    c1.setAttribute('aria-label',
      'Gelombang audio suspect: paruh pertama pola ucapan natural (dengan pola yang tertinggal 0,4 detik ' +
      'mulai detik 3,4); tepat di detik 4,9 ada sambungan kasar lalu polanya berubah: nada lebih ' +
      'rendah/berat dan bergetar, ditandai warna beda.');
    drawWave(c1, audioEnvSus, 4.9);
    body.appendChild(c1);

    body.appendChild(el('div', 'text-xs text-mono text-success', 'REFERENSI'));
    var c2 = el('canvas', 'c4-chart');
    c2.width = 640; c2.height = 90;
    c2.setAttribute('role', 'img');
    c2.setAttribute('aria-label', 'Gelombang audio referensi: pola ucapan natural yang konsisten dari detik 0 sampai 8, lalu hening.');
    drawWave(c2, audioEnvRef, 0);
    body.appendChild(c2);
    body.appendChild(el('div', 'row row--between c4-axis',
      '<span>00:00</span><span>00:03</span><span>00:06</span><span>00:09</span>'));

    body.appendChild(el('p', 'text-sm', 'Tandai di mana pola suspect mulai berubah:'));
    var segRow = el('div', 'c4-timeline');
    for (var s = 0; s < 15; s++) {
      (function (segStart) {
        var b = btn(fmt(segStart), 'c4-seg', function (self) {
          if (segStart >= 4.2 && segStart <= 5.4) {
            self.classList.add('c4-seg--correct');
            markFound('c4-ev-audio');
          } else {
            self.classList.add('c4-seg--wrong');
            wrongMark('audio', [
              'Di sini polanya masih sama dengan bagian sebelumnya. Bandingkan paruh pertama dan paruh kedua.',
              'Petunjuk: dengarkan/lihat sekitar tengah video, sebelum dan sesudah detik 5.'
            ]);
          }
        });
        segRow.appendChild(b);
      })(s * 0.6);
    }
    body.appendChild(segRow);
  }

  /* ---------- TOOL 4: BACKGROUND CONTINUITY ---------- */
  function toolBackground(panel) {
    panel.appendChild(el('div', 'panel-title', 'BACKGROUND CONTINUITY: latar suspect vs referensi'));
    panel.appendChild(simLabel('Membandingkan cuplikan frame awal (detik 2) dan akhir (detik 7).'));

    var body = el('div', 'stack');
    panel.appendChild(body);
    body.appendChild(el('p', 'text-sm text-muted',
      'Latar pada rekaman jujur biasanya stabil. Bandingkan keempat cuplikan, lalu jawab: ' +
      'elemen latar mana yang berubah di suspect?'));

    var grid = el('div', 'grid-2 c4-bg-grid');
    body.appendChild(grid);

    var slots = [
      { src: 'suspect.mp4', t: 2.0, label: 'SUSPECT 00:02.0', desc: 'Di slide: "Kumpulkan Data" HIJAU, "Diskusi & Refleksi" MERAH.' },
      { src: 'suspect.mp4', t: 7.0, label: 'SUSPECT 00:07.0', desc: 'Warna kedua blok itu kini TERTUKAR, labelnya tetap.' },
      { src: 'reference.mp4', t: 2.0, label: 'REFERENSI 00:02.0', desc: 'Di slide: "Kumpulkan Data" HIJAU, "Diskusi & Refleksi" MERAH.' },
      { src: 'reference.mp4', t: 7.0, label: 'REFERENSI 00:07.0', desc: 'Warnanya tetap sama seperti di detik 2.' }
    ];
    slots.forEach(function (slot) {
      var cell = el('div', 'c4-bg-cell');
      cell.appendChild(el('div', 'text-xs text-mono', slot.label));
      var cv = el('canvas', 'c4-bg-canvas');
      cv.width = 320; cv.height = 180;
      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', slot.label + '. ' + slot.desc);
      cell.appendChild(cv);
      var cap = el('div', 'text-xs text-muted', slot.desc);
      cell.appendChild(cap);
      grid.appendChild(cell);

      var v = document.createElement('video');
      v.src = ASSET + slot.src;
      v.preload = 'auto';
      v.muted = true;
      v.playsInline = true;
      v.style.display = 'none';
      live.videos.push(v);
      cell.appendChild(v);
      var draw = function () {
        try { cv.getContext('2d').drawImage(v, 0, 0, cv.width, cv.height); }
        catch (e) { cv.style.display = 'none'; }
      };
      v.addEventListener('loadeddata', function () {
        try { v.currentTime = slot.t; } catch (e) { cv.style.display = 'none'; }
      });
      v.addEventListener('seeked', draw);
      v.addEventListener('error', function () { cv.style.display = 'none'; });
    });

    body.appendChild(el('p', 'text-sm', 'Elemen latar mana yang berbeda antara suspect dan referensi?'));
    var opts = [
      { label: 'Posisi layar proyektor', ok: false },
      { label: 'Warna blok di slide proyektor', ok: true },
      { label: 'Baju yang dipakai pengajar', ok: false },
      { label: 'Tidak ada perbedaan', ok: false }
    ];
    var optWrap = el('div', 'stack stack--sm');
    opts.forEach(function (o) {
      optWrap.appendChild(btn(o.label, 'option-card', function (self) {
        if (o.ok) {
          self.classList.add('option-card--selected');
          markFound('c4-ev-background');
        } else {
          wrongMark('background', [
            'Elemen itu sama persis di kedua video. Bandingkan cuplikan detik 2 dan detik 7 dari video suspect.',
            'Petunjuk: perhatikan WARNA di dalam slide setelah detik ke-6: ada dua blok yang bertukar, hanya di suspect.'
          ]);
        }
      }));
    });
    body.appendChild(optWrap);
  }

  /* ---------- TOOL 5: METADATA VIEWER ---------- */
  function toolMetadata(panel) {
    panel.appendChild(el('div', 'panel-title', 'METADATA VIEWER'));
    panel.appendChild(el('div', 'sim-label c4-meta-label',
      'SIMULATED FORENSIC METADATA: dibuat untuk latihan, BUKAN metadata file nyata.'));

    var body = el('div', 'stack');
    panel.appendChild(body);

    var table = el('table', 'c4-meta-table');
    table.innerHTML =
      '<caption class="text-xs text-muted">Perbandingan metadata (simulasi)</caption>' +
      '<thead><tr><th scope="col">Field</th><th scope="col">Suspect</th><th scope="col">Referensi</th></tr></thead>' +
      '<tbody>' +
      '<tr><th scope="row">Encoder</th><td class="text-danger">vidforge-editor 2.1</td><td>schoolcam-native 1.0</td></tr>' +
      '<tr><th scope="row">Dibuat</th><td>2026-08-20 14:02</td><td>2026-08-20 14:02</td></tr>' +
      '<tr><th scope="row">Diubah</th><td class="text-danger">2026-08-24 21:47</td><td>2026-08-20 14:02</td></tr>' +
      '<tr><th scope="row">Riwayat encode</th><td class="text-danger">2x (encode ulang)</td><td>1x (langsung dari kamera)</td></tr>' +
      '<tr><th scope="row">Durasi</th><td>00:09.0</td><td>00:09.0</td></tr>' +
      '</tbody>';
    body.appendChild(table);

    body.appendChild(el('div', 'panel panel--glass c4-meta-note',
      '<strong>Penting:</strong> metadata bisa membantu penyelidikan, TAPI juga bisa dipalsukan, diubah, ' +
      'atau hilang saat file dikirim ulang lewat aplikasi chat. Jadikan metadata bukti PENDUKUNG, ' +
      'jangan jadikan satu-satunya dasar kesimpulan.'));

    body.appendChild(btn('Simpan sebagai bukti pendukung', 'btn btn--primary', function () {
      markFound('c4-ev-metadata');
    }));
  }

  /* ============================================================
     FASE 4: KEPUTUSAN
     ============================================================ */
  var DECISIONS = [
    { id: 'manipulasi', key: 'A', label: 'Kemungkinan besar video DIMANIPULASI', desc: 'Beberapa bukti independen menunjuk arah yang sama.' },
    { id: 'asli', key: 'B', label: 'Tidak ditemukan tanda manipulasi', desc: 'Video tampak wajar; keanehan yang ada bisa dijelaskan.' },
    { id: 'belum', key: 'C', label: 'Belum cukup bukti untuk menyimpulkan', desc: 'Perlu data tambahan sebelum mengambil sikap.' }
  ];

  function showDecision() {
    setPhase(3);
    clearStage();

    var recap = el('div', 'panel panel--glass');
    recap.appendChild(el('div', 'panel-title', 'Rekap bukti yang kamu temukan (' + foundCount() + '/5)'));
    var ul = el('ul', 'c4-recap');
    var anyFound = false;
    for (var k in EV) {
      if (S.found[k]) {
        anyFound = true;
        ul.appendChild(el('li', null,
          '<span class="text-mono text-cyan">' + EV[k].ts + '</span> ' +
          SIGAP.ui.escapeHtml(EV[k].title.replace(/^[0-9:.\u00b1\u2014\s-]*/, '')) +
          ' <span class="tag ' + (EV[k].strength === 'KUAT' ? 'tag--green' : EV[k].strength === 'SEDANG' ? 'tag--amber' : 'tag--red') + '">' + EV[k].strength + '</span>'));
      }
    }
    if (!anyFound) ul.appendChild(el('li', 'text-faint', 'Tidak ada bukti yang ditandai.'));
    recap.appendChild(ul);
    refs.stage.appendChild(recap);

    var q = el('div', 'panel');
    q.appendChild(el('h2', 'panel-title', 'Kesimpulanmu tentang video yang beredar?'));
    var optWrap = el('div', 'stack stack--sm');
    var selected = null;
    var cards = [];
    DECISIONS.forEach(function (d) {
      var card = btn(
        '<span class="option-card__key">' + d.key + '</span> <strong>' + d.label + '</strong><br>' +
        '<span class="text-sm text-muted">' + d.desc + '</span>',
        'option-card', function (self) {
          selected = d.id;
          cards.forEach(function (c) { c.classList.remove('option-card--selected'); });
          self.classList.add('option-card--selected');
          explainWrap.style.display = selected === 'manipulasi' ? '' : 'none';
          submitBtn.disabled = false;
        });
      cards.push(card);
      optWrap.appendChild(card);
    });
    q.appendChild(optWrap);

    // EXPLAIN: pilih bukti pendukung
    var explainWrap = el('div', 'stack stack--sm c4-explain');
    explainWrap.style.display = 'none';
    explainWrap.appendChild(el('p', 'text-sm', '<strong>Jelaskan:</strong> bukti mana yang mendukung kesimpulanmu? (pilih semua yang sesuai)'));
    var checkboxes = [];
    for (var k2 in EV) {
      if (!S.found[k2]) continue;
      (function (id) {
        var lab = el('label', 'c4-check');
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = id;
        lab.appendChild(cb);
        lab.appendChild(el('span', null, EV[id].title + ' <span class="text-xs text-faint">(' + EV[id].strength + ')</span>'));
        checkboxes.push(cb);
        explainWrap.appendChild(lab);
      })(k2);
    }
    if (!checkboxes.length) {
      explainWrap.appendChild(el('p', 'text-xs text-amber', 'Kamu belum menandai bukti apa pun. Kesimpulan tanpa bukti akan sulit dipertanggungjawabkan.'));
    }
    q.appendChild(explainWrap);

    var slider = SIGAP.ui.confidenceSlider({
      label: 'Seberapa yakin kamu?',
      value: 60,
      hint: 'Kalibrasi: keyakinan harus sebanding dengan kekuatan bukti yang kamu pegang.'
    });
    q.appendChild(slider.el);

    var submitBtn = btn('Kunci keputusan', 'btn btn--primary btn--lg', function () {
      if (!selected) return;
      var support = [];
      checkboxes.forEach(function (cb) { if (cb.checked) support.push(cb.value); });
      finalize(selected, support, slider.get());
    });
    submitBtn.disabled = true;
    var rowB = el('div', 'row');
    rowB.appendChild(submitBtn);
    rowB.appendChild(btn('&larr; Kembali memeriksa', 'btn btn--ghost', function () {
      renderInvestigate(activeToolId || toolForHypo(S.hypothesis));
    }));
    q.appendChild(rowB);
    refs.stage.appendChild(q);
  }

  /* ---------- Skor + debrief ---------- */
  function finalize(decision, support, confidence) {
    S.decision = decision;
    S.support = support;

    var toolsOpened = 0, k;
    for (k in S.toolsOpened) if (S.toolsOpened[k]) toolsOpened++;

    var iq = 40 + toolsOpened * 12;
    iq -= 6 * Math.min(S.wrongMarks, 4);
    iq -= 5 * Math.max(0, S.revisions - 1);
    iq = Math.max(20, Math.min(100, iq));

    var relFound = foundCount() / 5;
    var supTemporal = 0;
    support.forEach(function (id) { if (EV[id] && EV[id].temporal) supTemporal++; });
    var supQ = decision === 'manipulasi'
      ? (supTemporal >= 2 ? 1 : supTemporal / 2)
      : (temporalCount() === 0 ? 0.6 : 0.3);
    var er = Math.round(60 * relFound + 40 * supQ);

    var correct = decision === 'manipulasi';
    var decLabel = DECISIONS.filter(function (d) { return d.id === decision; })[0].label;

    if (decision === 'asli' && temporalCount() >= 2) {
      SIGAP.scoring.recordMisconception('case004',
        'Menyimpulkan video asli padahal sudah menemukan beberapa artefak temporal yang saling mendukung.');
    }
    if (decision === 'manipulasi' && temporalCount() === 0) {
      SIGAP.scoring.recordMisconception('case004',
        'Menyimpulkan manipulasi tanpa bukti temporal. "Terasa aneh" saja bukan bukti.');
    }

    var compBase = correct ? 80 : 45;
    var out = SIGAP.scoring.finishCase({
      caseId: 'case004',
      investigationQuality: iq,
      decisionCorrect: correct,
      evidenceRelevance: er,
      confidence: confidence,
      decisionLabel: decLabel,
      competencies: {
        aiLiteracy: { score: Math.min(100, compBase + temporalCount() * 5), weight: 1.5 },
        evidenceReasoning: { score: er, weight: 1.5 },
        criticalThinking: { score: iq, weight: 1 },
        ethicalReasoning: { score: compBase, weight: 1 }
      },
      xp: 100
    });

    if (SIGAP.audio) SIGAP.audio.sfx(correct ? 'success' : 'error');
    showDebrief(correct, decision, confidence, out);
  }

  function showDebrief(correct, decision, confidence, out) {
    setPhase(3);
    clearStage();
    var res = out.result;

    var verdict = el('div', 'debrief-verdict ' + (correct ? 'debrief-verdict--good' : 'debrief-verdict--bad'));
    var whyList =
      '<ul class="c4-recap">' +
      '<li><span class="text-mono">00:03.4</span> suara tertinggal ±0,4 detik dari gerak bibir, mulut mendahului audio sampai detik 4,9;</li>' +
      '<li><span class="text-mono">00:05.6</span> area wajah pecah/berkedip (salinan wajah bergeser + garis sobek) selama 3-4 frame;</li>' +
      '<li><span class="text-mono">±00:04.9</span> sambungan kasar lalu warna suara berubah, nada dasar turun dan bergetar;</li>' +
      '<li><span class="text-mono">00:06.0</span> dua blok warna di slide bertukar, di referensi tidak.</li></ul>';
    if (correct) {
      verdict.innerHTML = '<strong>&#10003; Kesimpulan tepat: kemungkinan besar dimanipulasi.</strong>' +
        '<p>Yang membuat kesimpulan ini kuat bukan satu keanehan, melainkan EMPAT pengamatan independen yang menunjuk arah sama:</p>' +
        whyList +
        '<p>Satu keanehan bisa kebetulan (kompresi, sinyal buruk). Beberapa bukti independen yang saling menguatkan: itulah dasar kesimpulan yang sehat. Dan tetap "kemungkinan besar", bukan "pasti 100%".</p>';
    } else if (decision === 'asli') {
      verdict.innerHTML = '<strong>&#10007; Kurang tepat: video ini menyimpan artefak nyata.</strong>' +
        '<p>Ada empat pengamatan independen yang menunjuk arah sama:</p>' + whyList +
        '<p>Saat beberapa bukti independen saling menguatkan, "tampak wajar" tidak lagi cukup sebagai penjelasan.</p>';
    } else {
      verdict.innerHTML = '<strong>&#10007; Hati-hati itu baik, tetapi di sini bukti sudah cukup.</strong>' +
        '<p>"Belum cukup bukti" kadang memang jawaban terbaik. Namun kali ini ada empat pengamatan independen yang saling menguatkan:</p>' + whyList +
        '<p>Ketika bukti independen berkumpul dan menunjuk arah yang sama, menunda kesimpulan justru membiarkan video menyebar lebih jauh.</p>';
    }
    refs.stage.appendChild(verdict);

    var score = el('div', 'panel');
    score.appendChild(el('div', 'panel-title', 'Skor investigasi'));
    var rows = [
      ['Kualitas investigasi (40%)', res.breakdown.investigationQuality],
      ['Ketepatan keputusan (30%)', res.breakdown.decisionCorrectness],
      ['Relevansi bukti (20%)', res.breakdown.evidenceRelevance],
      ['Kalibrasi keyakinan (10%)', res.breakdown.confidenceCalibration]
    ];
    rows.forEach(function (r) {
      var row = el('div', 'score-row');
      row.appendChild(el('span', null, r[0]));
      row.appendChild(el('span', 'score-row__val', String(r[1])));
      score.appendChild(row);
    });
    var tot = el('div', 'score-total');
    tot.appendChild(el('span', null, 'TOTAL'));
    tot.appendChild(el('span', 'score-total__val', String(res.total)));
    score.appendChild(tot);
    score.appendChild(el('p', 'text-sm text-muted', res.calibrationFeedback));
    if (out.practice) {
      score.appendChild(el('div', 'practice-banner', 'PRACTICE RUN: XP tidak diberikan'));
    }
    refs.stage.appendChild(score);

    var rowN = el('div', 'text-center');
    rowN.appendChild(btn('Lanjut', 'btn btn--primary btn--lg', function () {
      showCinematic(out);
    }));
    refs.stage.appendChild(rowN);
  }

  function showCinematic(out) {
    var cine = el('div', 'case-complete-cine');
    cine.appendChild(el('div', 'case-complete-cine__stamp', 'CASE CLOSED'));
    cine.appendChild(el('p', 'text-muted', 'CASE 004 · PHANTOM SIGNAL'));
    var b = btn('Lanjut', 'btn btn--primary', function () {
      if (cine.parentNode) cine.parentNode.removeChild(cine);
      live.cine = null;
      var st = SIGAP.state.get();
      if (!out.practice && !(st.story && st.story.finalDecision)) {
        showPhantomFinale();
      } else {
        showReflection();
      }
    });
    cine.appendChild(b);
    document.body.appendChild(cine);
    live.cine = cine;
    b.focus();
  }

  /* ============================================================
     FINAL PHANTOM DECISION
     ============================================================ */
  function showPhantomFinale() {
    setPhase(4);
    clearStage();
    if (SIGAP.audio) SIGAP.audio.sfx('phantom');
    refs.main.classList.add('phantom-glitch');
    live.timers.push(setTimeout(function () {
      refs.main.classList.remove('phantom-glitch');
    }, 1200));

    SIGAP.ui.dialogue.play([
      { speaker: 'system', text: 'PERINGATAN: sinyal tidak dikenal menyusup ke kanal SIGAP... enkripsi dibuka dari dalam.' },
      { speaker: 'phantom', voice: 'phantom/case004-01.mp3', text: 'Selamat, Agen. Kau membongkar video itu frame demi frame. Persis seperti yang KUAJARKAN dulu... ya, aku alumni akademi ini. Aku dulu duduk di kursimu.' },
      { speaker: 'phantom', voice: 'phantom/case004-02.mp3', text: 'Aku keluar karena muak. Mereka memakai manipulasi untuk menjatuhkan orang, dan dunia diam saja. Jika mereka memakai manipulasi, mengapa kita tidak membalas dengan cara yang sama?' },
      { speaker: 'phantom', voice: 'phantom/case004-03.mp3', text: 'Kau sudah pegang buktinya. Buat deepfake tandingan. Sebar. Biarkan mereka rasakan jadi korban. Kau punya kemampuannya sekarang.' },
      { speaker: 'aruna', voice: 'aruna/case004-01.mp3', text: 'Ini bukan kuis, Agen. Tidak ada skor yang menuntunmu. Pikirkan dampaknya bagi orang lain, lalu putuskan sendiri.' }
    ], { onEnd: renderPhantomChoice });
  }

  var PHANTOM_OPTS = [
    {
      id: 'balas', key: 'A', label: 'Balas dengan deepfake tandingan',
      desc: 'Lawan manipulasi dengan manipulasi yang lebih meyakinkan.',
      ok: false,
      feedback: 'Membalas manipulasi dengan manipulasi membuatmu jadi bagian dari masalah: korban baru berjatuhan, ' +
        'kepercayaan publik makin rusak, dan begitu terbongkar, SEMUA temuanmu yang benar ikut diragukan. ' +
        'Kredibilitas adalah aset terpenting seorang investigator.'
    },
    {
      id: 'diam', key: 'B', label: 'Diamkan saja',
      desc: 'Bukan urusan kita. Video akan dilupakan orang.',
      ok: false,
      feedback: 'Diam terlihat netral, padahal punya dampak: video terus menyebar, korban terus tertuduh, dan pelaku belajar ' +
        'bahwa caranya berhasil. Kamu sudah memegang bukti. Tidak memakai bukti itu juga sebuah pilihan yang ada akibatnya.'
    },
    {
      id: 'lapor', key: 'C', label: 'Dokumentasikan, verifikasi, laporkan, edukasi',
      desc: 'Simpan bukti + timestamp, laporkan ke pihak sekolah/platform, ajak teman memahami cara kerjanya.',
      ok: true,
      feedback: 'Ini jalur yang memutus rantai: bukti terdokumentasi rapi (timestamp 00:03.4, 00:04.9, 00:05.6, 00:06.0) ' +
        'membuat laporanmu bisa diperiksa ulang orang lain; pihak berwenang dan platform bisa bertindak; dan teman-temanmu ' +
        'belajar mengenali polanya, sehingga manipulasi berikutnya lebih sulit berhasil.'
    },
    {
      id: 'sebar', key: 'D', label: 'Sebar balik video suspect dengan caption mengejek',
      desc: 'Permalukan pembuatnya di depan semua orang.',
      ok: false,
      feedback: 'Menyebarkan ulang video manipulasi, walau untuk mengejek, tetap MENYEBARKANNYA: makin banyak orang ' +
        'melihat versi palsunya, dan banyak yang hanya ingat videonya, bukan bantahannya. Ejekan juga mengundang balas dendam, ' +
        'bukan penyelesaian.'
    }
  ];

  function renderPhantomChoice() {
    clearStage();
    var panel = el('div', 'panel panel--accent c4-phantom-panel');
    panel.appendChild(el('div', 'screen__eyebrow', 'FINAL PHANTOM DECISION'));
    panel.appendChild(el('h2', 'panel-title', 'Apa yang kamu lakukan dengan bukti di tanganmu?'));
    panel.appendChild(el('p', 'text-sm text-muted',
      'Tidak ada slider keyakinan di sini. Ini keputusan etis. Pertimbangkan dampaknya bagi korban, penonton, dan dirimu sendiri.'));
    var wrap = el('div', 'stack stack--sm');
    PHANTOM_OPTS.forEach(function (o) {
      wrap.appendChild(btn(
        '<span class="option-card__key">' + o.key + '</span> <strong>' + o.label + '</strong><br>' +
        '<span class="text-sm text-muted">' + o.desc + '</span>',
        'option-card c4-phantom-card',
        function () { phantomFeedback(o); }));
    });
    panel.appendChild(wrap);
    refs.stage.appendChild(panel);
  }

  function phantomFeedback(opt) {
    var body = el('div', 'stack');
    body.appendChild(el('p', null, opt.feedback));
    if (opt.ok) {
      SIGAP.ui.modal({
        title: 'Pilihan yang bertanggung jawab',
        body: body,
        dismissible: false,
        actions: [{
          label: 'Lanjutkan', variant: 'primary',
          onClick: function (close) { close(); commitPhantom(opt); }
        }]
      });
    } else {
      body.appendChild(el('p', 'text-sm text-muted',
        'Kamu boleh mempertimbangkan ulang, atau tetap dengan pilihan ini dan menanggung konsekuensinya dalam cerita.'));
      SIGAP.ui.modal({
        title: 'Pikirkan dampaknya',
        body: body,
        dismissible: false,
        actions: [
          { label: 'Pertimbangkan ulang', variant: 'primary', onClick: function (close) { close(); } },
          { label: 'Tetap dengan pilihan ini', variant: 'danger', onClick: function (close) { close(); commitPhantom(opt); } }
        ]
      });
    }
  }

  function commitPhantom(opt) {
    SIGAP.state.update(function (s) {
      s.story = s.story || {};
      s.story.finalDecision = { choice: opt.id, label: opt.label, at: Date.now() };
    });
    if (opt.ok) {
      SIGAP.achievements.unlock('ethical-agent');
    } else if (opt.id === 'balas' || opt.id === 'sebar') {
      SIGAP.scoring.recordMisconception('case004',
        'Final Phantom Decision: memilih membalas/menyebar manipulasi (' + opt.label + ').');
    }

    var lines = [];
    if (opt.ok) {
      lines.push({ speaker: 'phantom', voice: 'phantom/case004-04.mp3', text: 'Melapor? Mengedukasi? Pelan sekali jalanmu, Agen... Tapi kuakui, argumenmu rapi, dan buktimu bisa diperiksa siapa saja. Itu... sulit dilawan.' });
      lines.push({ speaker: 'phantom', voice: 'phantom/case004-05.mp3', text: 'Mungkin kau benar. Atau mungkin dunia akan membuktikan sebaliknya. Sinyal ini kututup, untuk sekarang. Kita lihat berapa lama caramu bertahan.' });
    } else {
      lines.push({ speaker: 'phantom', voice: 'phantom/case004-06.mp3', text: 'Hah. Jadi begitu pilihanmu. Lihat? Pada akhirnya semua orang bisa tergoda jalan pintas... Sinyal ini kututup, untuk sekarang.' });
      lines.push({ speaker: 'aruna', voice: 'aruna/case004-02.mp3', text: 'Keputusan itu ada konsekuensinya, Agen, dan aku ingin kamu memikirkannya lagi nanti. Investigator dinilai bukan hanya dari temuannya, tetapi dari caranya bertindak.' });
    }
    lines.push({ speaker: 'aruna', voice: 'aruna/case004-03.mp3', text: 'Satu hal terakhir. Deepfake yang sama bisa menjadi bahan latihan seperti hari ini, atau senjata untuk menjatuhkan orang. Dampak teknologi dipengaruhi oleh desain, konteks, aturan, dan cara manusia menggunakannya.' });
    lines.push({ speaker: 'aruna', voice: 'aruna/case004-04.mp3', text: 'Kamu baru saja menjadi salah satu penentunya. Tutup laporanmu dengan refleksi, Agen.' });

    SIGAP.ui.dialogue.play(lines, { onEnd: showReflection });
  }

  /* ============================================================
     REFLEKSI + PENUTUP
     ============================================================ */
  function showReflection() {
    setPhase(4);
    clearStage();

    var panel = el('div', 'panel');
    panel.appendChild(el('h2', 'panel-title', 'Refleksi agen'));
    panel.appendChild(SIGAP.ui.reflectionForm({
      contextId: 'case004',
      questions: [
        'Mengapa membalas manipulasi dengan manipulasi tetap merugikan?',
        'Bukti mana yang paling meyakinkanmu bahwa video itu dimanipulasi? Jelaskan alasanmu.'
      ],
      onDone: function () {
        var done = el('div', 'panel panel--glass text-center stack');
        done.appendChild(el('p', null,
          'Laporan CASE 004 tersimpan. Terima kasih, Agen. Arsip PHANTOM resmi ditutup.'));
        var row = el('div', 'row');
        row.style.justifyContent = 'center';
        row.appendChild(btn('Kembali ke Academy', 'btn btn--primary', function () {
          SIGAP.router.go('academy');
        }));
        row.appendChild(btn('Lihat Laporan Agen', 'btn btn--ghost', function () {
          SIGAP.router.go('report');
        }));
        done.appendChild(row);
        refs.stage.appendChild(done);
        panel.style.display = 'none';
      }
    }));
    refs.stage.appendChild(panel);
  }
})();
