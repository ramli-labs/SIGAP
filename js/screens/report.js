/* ============================================================
   SIGAP — screens/report.js
   FINAL REPORT: PROGRESS vs PERFORMANCE terpisah, feedback
   personal dari data nyata, ekspor Class Code, cetak.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};

  function esc(s) { return SIGAP.ui.escapeHtml(s); }

  function b64encode(str) {
    try {
      return window.btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      return null;
    }
  }

  function countCompleted(map) {
    var n = 0;
    for (var k in map) {
      if (map.hasOwnProperty(k) && map[k] && map[k].completed) n++;
    }
    return n;
  }

  /* ---------- Class Code (schema v1) ---------- */

  function buildClassCode() {
    var s = SIGAP.state.get();
    var casesOut = {};
    for (var cid in s.progress.cases) {
      if (!s.progress.cases.hasOwnProperty(cid)) continue;
      var c = s.progress.cases[cid];
      casesOut[cid] = {
        completed: !!c.completed,
        attempts: c.attempts || 0,
        practiceRuns: c.practiceRuns || 0,
        bestScore: c.bestScore,
        latestScore: c.latestScore,
        breakdown: c.breakdown || null,
        decision: c.decision || null,
        confidence: (c.confidence === undefined ? null : c.confidence),
        evidenceCount: (c.evidence || []).length
      };
    }
    var labsOut = {};
    for (var lid in s.progress.labs) {
      if (!s.progress.labs.hasOwnProperty(lid)) continue;
      var l = s.progress.labs[lid];
      labsOut[lid] = {
        completed: !!l.completed,
        attempts: l.attempts || 0,
        bestScore: l.bestScore,
        latestScore: l.latestScore
      };
    }
    var payload = {
      schemaVersion: 1,
      agentId: s.player.agentId,
      displayName: s.player.name,
      exportedAt: new Date().toISOString(),
      progress: {
        cases: casesOut,
        labs: labsOut,
        xp: s.player.xp,
        level: s.player.level,
        achievements: (s.achievements || []).slice()
      },
      performance: {
        summary: SIGAP.scoring.competencySummary(),
        flags: s.performance.flags,
        misconceptions: (s.performance.misconceptions || []).slice(-20)
      },
      reflections: s.reflections || {}
    };
    var encoded = b64encode(JSON.stringify(payload));
    return encoded ? 'SGC1.' + encoded : null;
  }

  function copyToClipboard(text, ta) {
    function ok() { SIGAP.ui.toast('Class Code disalin. Berikan ke gurumu.', 'success'); }
    function fallback() {
      try {
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        var done = document.execCommand('copy');
        if (done) ok();
        else SIGAP.ui.toast('Tidak bisa menyalin otomatis — tandai teks lalu salin manual (Ctrl+C).', 'warn');
      } catch (e) {
        SIGAP.ui.toast('Tidak bisa menyalin otomatis — tandai teks lalu salin manual (Ctrl+C).', 'warn');
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else {
      fallback();
    }
  }

  /* ---------- Personalized feedback ---------- */

  var STRENGTH_TEXT = {
    criticalThinking: 'Kamu terbiasa mempertanyakan informasi sebelum menyimpulkan — kebiasaan inti seorang investigator.',
    aiLiteracy: 'Kamu memahami cara kerja dan batas kemampuan AI, sehingga tidak mudah terkecoh konten buatan mesin.',
    digitalSafety: 'Kamu peka terhadap jebakan digital seperti file berbahaya dan phishing — refleks keamananmu bagus.',
    evidenceReasoning: 'Kamu pandai menimbang kekuatan bukti dan menghubungkan beberapa petunjuk menjadi kesimpulan.',
    ethicalReasoning: 'Kamu mempertimbangkan dampak keputusanmu pada orang lain — integritasmu terlihat dalam pilihan-pilihanmu.'
  };

  var TRAIN_TEXT = {
    criticalThinking: 'Latih dengan membuat lebih dari satu hipotesis sebelum memeriksa bukti. Semua CASE melatih ini — coba ulangi kasus dengan skor terendahmu.',
    aiLiteracy: 'Buka AI LABORATORY (terutama LAB 01 dan LAB 04), lalu terapkan di CASE 002 dan CASE 004 tentang citra AI dan deepfake.',
    digitalSafety: 'Ulangi CASE 001 (file berbahaya) dan CASE 003 (phishing). Perhatikan detail pengirim, domain, dan izin aplikasi.',
    evidenceReasoning: 'Sebelum memutuskan, tanya: bukti mana yang KUAT dan mana yang LEMAH? Coba kumpulkan semua bukti dalam satu CASE sebelum menyimpulkan.',
    ethicalReasoning: 'CASE 004 dan keputusan akhir PHANTOM melatih ini: pikirkan siapa yang dirugikan oleh setiap pilihan.'
  };

  function buildFeedback(summary, s) {
    var entries = [];
    var names = SIGAP.scoring.COMPETENCIES;
    for (var key in names) {
      if (names.hasOwnProperty(key) && summary[key] !== null && summary[key] !== undefined) {
        entries.push({ key: key, name: names[key], value: summary[key] });
      }
    }
    if (!entries.length) return null;
    entries.sort(function (a, b) { return b.value - a.value; });

    var strengths = [];
    var toTrain = [];

    var best = entries[0];
    strengths.push('<strong>' + esc(best.name) + ' (' + best.value + '/100)</strong> — ' + STRENGTH_TEXT[best.key]);

    var flags = s.performance.flags || {};
    if ((flags.wellCalibrated || 0) >= 2 &&
        (flags.wellCalibrated || 0) >= (flags.overconfident || 0) &&
        (flags.wellCalibrated || 0) >= (flags.underconfident || 0)) {
      strengths.push('<strong>Kalibrasi confidence</strong> — sebanyak ' + flags.wellCalibrated +
        ' kali keyakinanmu sesuai dengan kekuatan bukti. Itu tanda penilaian yang matang.');
    }

    if (entries.length > 1) {
      var worst = entries[entries.length - 1];
      if (worst.key !== best.key) {
        toTrain.push('<strong>' + esc(worst.name) + ' (' + worst.value + '/100)</strong> — ' + TRAIN_TEXT[worst.key]);
      }
    }
    if ((flags.overconfident || 0) >= 2) {
      toTrain.push('<strong>Confidence terlalu tinggi</strong> — sebanyak ' + flags.overconfident +
        ' kali keyakinanmu terlalu tinggi sebelum bukti cukup. Tahan kesimpulan sampai minimal dua bukti saling mendukung.');
    }
    if ((flags.underconfident || 0) >= 2) {
      toTrain.push('<strong>Confidence terlalu rendah</strong> — sebanyak ' + flags.underconfident +
        ' kali kamu benar tetapi ragu-ragu. Kalau buktimu saling mendukung, percayai analisismu.');
    }
    var miscs = s.performance.misconceptions || [];
    if (miscs.length) {
      var last = miscs[miscs.length - 1];
      toTrain.push('<strong>Catatan terakhir</strong> — ' + esc(last.text) +
        (last.caseId ? ' <span class="text-mono text-xs">(' + esc(String(last.caseId).toUpperCase()) + ')</span>' : ''));
    }
    if (!toTrain.length) {
      toTrain.push('Belum ada kelemahan menonjol pada data saat ini. Selesaikan lebih banyak CASE dan LAB agar analisis makin akurat.');
    }
    return { strengths: strengths, toTrain: toTrain };
  }

  /* ---------- Screen ---------- */

  SIGAP.router.register('report', {
    title: 'Final Report',
    render: function (container) {
      SIGAP.ui.background(container);
      container.appendChild(SIGAP.ui.topbar({ crumb: 'FINAL REPORT', backTo: 'academy' }));

      var s = SIGAP.state.get();
      var main = document.createElement('div');
      main.className = 'container container--narrow screen stack--lg scr-report';
      container.appendChild(main);

      var header = document.createElement('div');
      header.className = 'screen__header';
      header.innerHTML =
        '<div class="screen__eyebrow">LAPORAN AKHIR AGEN</div>' +
        '<h1 class="screen__title">Final Report</h1>' +
        '<p class="screen__sub text-mono">' + esc(s.player.name) + ' · ' + esc(s.player.agentId) +
        ' · dicetak ' + new Date().toLocaleDateString('id-ID') + '</p>';
      main.appendChild(header);

      /* ===== 1. PROGRESS ===== */
      var casesDone = countCompleted(s.progress.cases);
      var labsDone = countCompleted(s.progress.labs);
      var totalCases = (SIGAP.data.cases || []).length || 4;
      var totalLabs = (SIGAP.data.labs || []).length || 4;

      var prog = document.createElement('section');
      prog.className = 'panel panel--accent stack';
      var progHtml =
        '<div class="panel-title">1 · PROGRESS — seberapa jauh kamu melangkah</div>' +
        '<div class="scr-report-stats">' +
        '<div class="scr-stat"><span class="scr-stat__val">' + casesDone + '/' + totalCases + '</span><span class="scr-stat__label">CASE selesai</span></div>' +
        '<div class="scr-stat"><span class="scr-stat__val">' + labsDone + '/' + totalLabs + '</span><span class="scr-stat__label">AI LAB selesai</span></div>' +
        '<div class="scr-stat"><span class="scr-stat__val">' + s.player.xp + '</span><span class="scr-stat__label">XP total</span></div>' +
        '<div class="scr-stat"><span class="scr-stat__val">' + s.player.level + '</span><span class="scr-stat__label">Level</span></div>' +
        '</div>';
      var badgeList = '';
      var all = SIGAP.achievements.all() || [];
      for (var i = 0; i < all.length; i++) {
        if (SIGAP.achievements.isUnlocked(all[i].id)) {
          badgeList += '<span class="tag tag--amber">' + all[i].icon + ' ' + esc(all[i].name) + '</span> ';
        }
      }
      progHtml += '<div><div class="text-xs text-muted" style="margin-bottom:var(--space-2)">Badge terbuka:</div>' +
        (badgeList || '<span class="text-sm text-faint">Belum ada badge terbuka.</span>') + '</div>' +
        '<p class="text-xs text-faint">PROGRESS mengukur seberapa banyak yang sudah kamu kerjakan — bukan seberapa baik.</p>';
      prog.innerHTML = progHtml;
      main.appendChild(prog);

      /* ===== 2. PERFORMANCE ===== */
      var perf = document.createElement('section');
      perf.className = 'panel stack';
      var perfTitle = document.createElement('div');
      perfTitle.className = 'panel-title';
      perfTitle.textContent = '2 · PERFORMANCE — seberapa baik cara kamu menyelidiki';
      perf.appendChild(perfTitle);

      var summary = SIGAP.scoring.competencySummary();
      var names = SIGAP.scoring.COMPETENCIES;
      for (var key in names) {
        if (!names.hasOwnProperty(key)) continue;
        var row = document.createElement('div');
        row.className = 'scr-comp-row';
        var v = summary[key];
        var headRow = document.createElement('div');
        headRow.className = 'row row--between';
        headRow.innerHTML = '<span class="text-sm">' + esc(names[key]) + '</span>' +
          (v === null || v === undefined
            ? '<span class="text-xs text-faint">Belum ada data — selesaikan CASE/LAB terkait</span>'
            : '<span class="text-sm text-mono text-cyan">' + v + '/100</span>');
        row.appendChild(headRow);
        var meter = document.createElement('div');
        meter.className = 'meter' + (v === null || v === undefined ? ' scr-meter--empty' : '');
        meter.setAttribute('role', 'img');
        meter.setAttribute('aria-label', names[key] + ': ' + (v === null || v === undefined ? 'belum ada data' : v + ' dari 100'));
        if (v !== null && v !== undefined) {
          meter.innerHTML = '<div class="meter__fill" style="width:' + Math.max(0, Math.min(100, v)) + '%"></div>';
        }
        row.appendChild(meter);
        perf.appendChild(row);
      }
      var perfNote = document.createElement('p');
      perfNote.className = 'text-xs text-faint';
      perfNote.textContent = 'PERFORMANCE dihitung dari kualitas investigasi, keputusan, relevansi bukti, dan kalibrasi confidence pada run pertama (practice run tidak dihitung).';
      perf.appendChild(perfNote);
      main.appendChild(perf);

      /* ===== 3. KEKUATANMU / HAL YANG PERLU DILATIH ===== */
      var fb = buildFeedback(summary, s);
      var fbWrap = document.createElement('section');
      fbWrap.className = 'grid-2';
      if (fb) {
        var strong = document.createElement('div');
        strong.className = 'panel stack scr-fb scr-fb--strong';
        strong.innerHTML = '<div class="panel-title">💪 Kekuatanmu</div>' +
          fb.strengths.map(function (t) { return '<p class="text-sm">' + t + '</p>'; }).join('');
        fbWrap.appendChild(strong);

        var train = document.createElement('div');
        train.className = 'panel stack scr-fb scr-fb--train';
        train.innerHTML = '<div class="panel-title">🎯 Hal yang perlu dilatih</div>' +
          fb.toTrain.map(function (t) { return '<p class="text-sm">' + t + '</p>'; }).join('');
        fbWrap.appendChild(train);
      } else {
        var noData = document.createElement('div');
        noData.className = 'panel panel--glass stack text-center scr-fb';
        noData.innerHTML =
          '<div class="panel-title">Analisis Personal</div>' +
          '<p class="text-sm text-muted">Belum ada data performa untuk dianalisis. Selesaikan minimal satu CASE atau LAB, lalu kembali ke sini.</p>' +
          '<a class="btn btn--primary" href="#/missions">Buka CASE FILES →</a>';
        fbWrap.className = 'stack';
        fbWrap.appendChild(noData);
      }
      main.appendChild(fbWrap);

      /* ===== 4. Class Code ===== */
      var exportPanel = document.createElement('section');
      exportPanel.className = 'panel panel--accent stack scr-no-print';
      exportPanel.innerHTML =
        '<div class="panel-title">Class Code — untuk gurumu</div>' +
        '<p class="text-sm text-muted">Class Code berisi ringkasan progres, kompetensi, dan refleksimu (tanpa data pribadi lain). ' +
        '<strong>Berikan kode ini ke gurumu</strong> — guru akan mengimpornya di Dashboard Guru.</p>';

      var ta = document.createElement('textarea');
      ta.className = 'scr-code-area text-mono';
      ta.readOnly = true;
      ta.rows = 4;
      ta.setAttribute('aria-label', 'Class Code hasil ekspor');
      ta.placeholder = 'Tekan EXPORT untuk membuat Class Code…';

      var btnRow = document.createElement('div');
      btnRow.className = 'row';
      var exportBtn = document.createElement('button');
      exportBtn.className = 'btn btn--primary';
      exportBtn.textContent = 'EXPORT Class Code';
      var copyBtn = document.createElement('button');
      copyBtn.className = 'btn btn--ghost';
      copyBtn.textContent = 'Salin';
      copyBtn.disabled = true;

      exportBtn.addEventListener('click', function () {
        var code = buildClassCode();
        if (!code) {
          SIGAP.ui.toast('Gagal membuat Class Code. Coba lagi.', 'error');
          return;
        }
        ta.value = code;
        copyBtn.disabled = false;
        if (SIGAP.audio) SIGAP.audio.sfx('success');
        SIGAP.ui.toast('Class Code dibuat. Salin lalu berikan ke gurumu.', 'success');
      });
      copyBtn.addEventListener('click', function () {
        if (ta.value) copyToClipboard(ta.value, ta);
      });

      btnRow.appendChild(exportBtn);
      btnRow.appendChild(copyBtn);
      exportPanel.appendChild(btnRow);
      exportPanel.appendChild(ta);
      main.appendChild(exportPanel);

      /* ===== 5. Print ===== */
      var printRow = document.createElement('div');
      printRow.className = 'row scr-no-print';
      var printBtn = document.createElement('button');
      printBtn.className = 'btn btn--ghost';
      printBtn.textContent = '🖨 Cetak / simpan sebagai PDF';
      printBtn.addEventListener('click', function () { window.print(); });
      printRow.appendChild(printBtn);
      main.appendChild(printRow);
    },
    onLeave: function () { /* nothing to clean up */ }
  });
})();
