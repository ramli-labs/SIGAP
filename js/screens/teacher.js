/* ============================================================
   SIGAP — screens/teacher.js
   TEACHER DASHBOARD (lokal, tanpa server, route publik):
   impor Class Code, roster siswa, detail, hapus.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};

  var INVALID_MSG = 'Class Code tidak valid atau berasal dari versi yang tidak kompatibel.';
  var DISCLAIMER = 'Skor SIGAP bukan nilai akademik tunggal. Gunakan bersama observasi, refleksi, diskusi, dan asesmen guru.';

  var COMP_ABBR = {
    criticalThinking: 'CT',
    aiLiteracy: 'AI',
    digitalSafety: 'DS',
    evidenceReasoning: 'ER',
    ethicalReasoning: 'ET'
  };

  function esc(s) { return SIGAP.ui.escapeHtml(s); }

  /* ---------- Roster storage (terpisah dari state siswa) ---------- */

  function loadRoster() {
    try {
      var raw = SIGAP.storage.getItem('teacher_roster');
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveRoster(roster) {
    try {
      SIGAP.storage.setItem('teacher_roster', JSON.stringify(roster));
    } catch (e) { /* storage errors must not crash the dashboard */ }
  }

  /* ---------- Class Code parsing (validasi ketat) ---------- */

  function parseClassCode(input) {
    var code = String(input || '').trim();
    if (code.indexOf('SGC1.') !== 0) return null;
    var b64 = code.slice(5);
    if (!b64) return null;
    var json;
    try {
      json = decodeURIComponent(escape(window.atob(b64)));
    } catch (e) {
      return null;
    }
    var obj;
    try {
      obj = JSON.parse(json);
    } catch (e2) {
      return null;
    }
    if (!obj || typeof obj !== 'object') return null;
    if (obj.schemaVersion !== 1) return null;
    if (!obj.agentId || typeof obj.agentId !== 'string') return null;
    return obj;
  }

  function idSuffix(agentId) {
    var s = String(agentId || '');
    var dash = s.lastIndexOf('-');
    return dash !== -1 ? s.slice(dash + 1) : s.slice(-4);
  }

  function studentLabel(st) {
    return (st.displayName || 'Tanpa Nama') + ' · ' + idSuffix(st.agentId);
  }

  function countCompleted(map) {
    var n = 0;
    for (var k in map) {
      if (map.hasOwnProperty(k) && map[k] && map[k].completed) n++;
    }
    return n;
  }

  /* ---------- Detail modal ---------- */

  function showDetail(st, onDelete) {
    var body = document.createElement('div');
    body.className = 'stack';

    var meta = document.createElement('p');
    meta.className = 'text-xs text-muted text-mono';
    meta.textContent = 'AGENT ID: ' + st.agentId +
      (st.exportedAt ? ' · diekspor: ' + new Date(st.exportedAt).toLocaleString('id-ID') : '');
    body.appendChild(meta);

    /* Per-case breakdown */
    var casesWrap = document.createElement('div');
    casesWrap.className = 'stack--sm stack';
    var casesTitle = document.createElement('div');
    casesTitle.className = 'panel-title';
    casesTitle.textContent = 'Hasil per CASE';
    casesWrap.appendChild(casesTitle);

    var caseMeta = SIGAP.data.cases || [];
    var cases = (st.progress && st.progress.cases) || {};
    var anyCase = false;
    for (var i = 0; i < caseMeta.length; i++) {
      var cm = caseMeta[i];
      var rec = cases[cm.id];
      if (!rec) continue;
      anyCase = true;
      var cPanel = document.createElement('div');
      cPanel.className = 'panel tch-case-detail';
      var html = '<div class="row row--between"><strong>' + esc(cm.code + ' — ' + cm.title) + '</strong>' +
        (rec.completed
          ? '<span class="tag tag--green">SELESAI · skor ' + (rec.bestScore !== null && rec.bestScore !== undefined ? rec.bestScore : '—') + '</span>'
          : '<span class="tag tag--cyan">BELUM SELESAI</span>') + '</div>';
      if (rec.breakdown) {
        html += '<div class="tch-breakdown text-xs text-mono">' +
          '<span>Investigasi: ' + rec.breakdown.investigationQuality + '</span>' +
          '<span>Keputusan: ' + rec.breakdown.decisionCorrectness + '</span>' +
          '<span>Bukti: ' + rec.breakdown.evidenceRelevance + '</span>' +
          '<span>Kalibrasi: ' + rec.breakdown.confidenceCalibration + '</span>' +
          '</div>';
      }
      var extras = [];
      if (rec.decision) extras.push('Keputusan: "' + esc(String(rec.decision)) + '"');
      if (rec.confidence !== null && rec.confidence !== undefined) extras.push('Confidence: ' + rec.confidence + '%');
      if (rec.attempts) extras.push(rec.attempts + '× percobaan');
      if (rec.practiceRuns) extras.push(rec.practiceRuns + '× practice run');
      if (extras.length) html += '<div class="text-xs text-muted">' + extras.join(' · ') + '</div>';
      cPanel.innerHTML = html;
      casesWrap.appendChild(cPanel);
    }
    if (!anyCase) {
      var noCase = document.createElement('p');
      noCase.className = 'text-sm text-faint';
      noCase.textContent = 'Belum ada CASE yang dikerjakan.';
      casesWrap.appendChild(noCase);
    }
    body.appendChild(casesWrap);

    /* Competencies */
    var compWrap = document.createElement('div');
    compWrap.className = 'stack stack--sm';
    var compTitle = document.createElement('div');
    compTitle.className = 'panel-title';
    compTitle.textContent = 'Kompetensi';
    compWrap.appendChild(compTitle);
    var summary = (st.performance && st.performance.summary) || {};
    var names = SIGAP.scoring.COMPETENCIES;
    for (var key in names) {
      if (!names.hasOwnProperty(key)) continue;
      var v = summary[key];
      var row = document.createElement('div');
      row.className = 'scr-comp-row';
      row.innerHTML =
        '<div class="row row--between"><span class="text-sm">' + esc(names[key]) + '</span>' +
        (v === null || v === undefined
          ? '<span class="text-xs text-faint">belum ada data</span>'
          : '<span class="text-sm text-mono text-cyan">' + v + '/100</span>') + '</div>' +
        '<div class="meter' + (v === null || v === undefined ? ' scr-meter--empty' : '') + '">' +
        (v !== null && v !== undefined ? '<div class="meter__fill" style="width:' + Math.max(0, Math.min(100, v)) + '%"></div>' : '') +
        '</div>';
      compWrap.appendChild(row);
    }
    body.appendChild(compWrap);

    /* Calibration flags + misconceptions */
    var flags = (st.performance && st.performance.flags) || {};
    var flagP = document.createElement('p');
    flagP.className = 'text-sm text-muted';
    flagP.innerHTML = '<strong>Kalibrasi confidence:</strong> ' +
      (flags.wellCalibrated || 0) + '× terkalibrasi baik · ' +
      (flags.overconfident || 0) + '× terlalu yakin · ' +
      (flags.underconfident || 0) + '× kurang yakin';
    body.appendChild(flagP);

    var miscs = (st.performance && st.performance.misconceptions) || [];
    if (miscs.length || (flags.overconfident || 0) >= 2) {
      var warn = document.createElement('div');
      warn.className = 'panel tch-warn stack stack--sm';
      var warnHtml = '<div class="panel-title">⚠ Perhatian untuk guru</div>';
      if ((flags.overconfident || 0) >= 2) {
        warnHtml += '<p class="text-sm">Siswa beberapa kali <strong>terlalu yakin</strong> sebelum bukti cukup — topik kalibrasi layak dibahas di kelas.</p>';
      }
      for (var m = 0; m < miscs.length; m++) {
        warnHtml += '<p class="text-sm">• ' + esc(miscs[m].text || '') +
          (miscs[m].caseId ? ' <span class="text-mono text-xs">(' + esc(String(miscs[m].caseId).toUpperCase()) + ')</span>' : '') + '</p>';
      }
      warn.innerHTML = warnHtml;
      body.appendChild(warn);
    }

    /* Reflections */
    var refTitle = document.createElement('div');
    refTitle.className = 'panel-title';
    refTitle.textContent = 'Refleksi siswa — untuk direview guru (tidak dinilai otomatis)';
    body.appendChild(refTitle);
    var refs = st.reflections || {};
    var anyRef = false;
    for (var rid in refs) {
      if (!refs.hasOwnProperty(rid)) continue;
      var r = refs[rid];
      if (!r) continue;
      anyRef = true;
      var rPanel = document.createElement('div');
      rPanel.className = 'panel tch-reflection stack stack--sm';
      var rHtml = '<div class="text-xs text-mono text-cyan">' + esc(String(rid).toUpperCase()) + '</div>';
      var qs = r.questions || [];
      var as = r.answers || [];
      var count = Math.max(qs.length, as.length);
      for (var q = 0; q < count; q++) {
        rHtml += '<div><div class="text-xs text-muted">' + esc(qs[q] || 'Pertanyaan') + '</div>' +
          '<div class="text-sm tch-reflection__answer">' + esc(as[q] || '(tidak dijawab)') + '</div></div>';
      }
      rPanel.innerHTML = rHtml;
      body.appendChild(rPanel);
    }
    if (!anyRef) {
      var noRef = document.createElement('p');
      noRef.className = 'text-sm text-faint';
      noRef.textContent = 'Belum ada refleksi yang diekspor.';
      body.appendChild(noRef);
    }

    SIGAP.ui.modal({
      title: studentLabel(st),
      body: body,
      wide: true,
      actions: [
        {
          label: 'Hapus siswa ini',
          variant: 'danger',
          onClick: function (close) {
            SIGAP.ui.confirm(
              'Hapus data siswa?',
              'Data ' + esc(studentLabel(st)) + ' akan dihapus dari roster. Class Code aslinya tetap ada di perangkat siswa.',
              function () { close(); onDelete(st.agentId); },
              { yesLabel: 'Ya, hapus', danger: true }
            );
          }
        },
        { label: 'Tutup', variant: 'ghost' }
      ]
    });
  }

  /* ---------- Screen ---------- */

  SIGAP.router.register('teacher', {
    title: 'Dashboard Guru',
    render: function (container) {
      SIGAP.ui.background(container);
      container.appendChild(SIGAP.ui.topbar({ crumb: 'GURU', backTo: 'title', hideAgent: true }));

      var main = document.createElement('div');
      main.className = 'container screen stack--lg';
      container.appendChild(main);

      var header = document.createElement('div');
      header.className = 'screen__header';
      header.innerHTML =
        '<div class="screen__eyebrow">MODE GURU · DATA LOKAL</div>' +
        '<h1 class="screen__title">Dashboard Guru</h1>' +
        '<p class="screen__sub">Impor Class Code dari siswa untuk melihat progres dan kompetensi mereka. ' +
        'Semua data hanya tersimpan di perangkat ini — tidak ada server.</p>';
      main.appendChild(header);

      var disclaimer = document.createElement('div');
      disclaimer.className = 'panel tch-disclaimer';
      disclaimer.setAttribute('role', 'note');
      disclaimer.innerHTML = '<strong>Penting:</strong> ' + esc(DISCLAIMER);
      main.appendChild(disclaimer);

      /* --- Import panel --- */
      var importPanel = document.createElement('section');
      importPanel.className = 'panel panel--accent stack';
      var impTitle = document.createElement('div');
      impTitle.className = 'panel-title';
      impTitle.textContent = 'Impor Class Code';
      importPanel.appendChild(impTitle);

      var impHelp = document.createElement('p');
      impHelp.className = 'text-sm text-muted';
      impHelp.textContent = 'Siswa membuat Class Code lewat menu FINAL REPORT → EXPORT, lalu mengirimkannya padamu (mis. lewat chat kelas). Tempel kodenya di bawah ini.';
      importPanel.appendChild(impHelp);

      var ta = document.createElement('textarea');
      ta.className = 'scr-code-area text-mono';
      ta.rows = 3;
      ta.placeholder = 'SGC1.…';
      ta.setAttribute('aria-label', 'Tempel Class Code siswa di sini');
      importPanel.appendChild(ta);

      var impErr = document.createElement('div');
      impErr.className = 'title-field-error';
      impErr.setAttribute('role', 'alert');
      importPanel.appendChild(impErr);

      var impBtn = document.createElement('button');
      impBtn.className = 'btn btn--primary';
      impBtn.textContent = 'Impor';
      importPanel.appendChild(impBtn);
      main.appendChild(importPanel);

      /* --- Roster --- */
      var rosterSection = document.createElement('section');
      rosterSection.className = 'stack';
      main.appendChild(rosterSection);

      function deleteStudent(agentId) {
        var roster = loadRoster().filter(function (st) { return st.agentId !== agentId; });
        saveRoster(roster);
        SIGAP.ui.toast('Data siswa dihapus.', 'warn');
        renderRoster();
      }

      function renderRoster() {
        rosterSection.innerHTML = '';
        var roster = loadRoster();

        var head = document.createElement('div');
        head.className = 'row row--between';
        var h2 = document.createElement('h2');
        h2.className = 'screen__eyebrow';
        h2.textContent = 'ROSTER KELAS (' + roster.length + ' siswa)';
        head.appendChild(h2);
        if (roster.length) {
          var clearBtn = document.createElement('button');
          clearBtn.className = 'btn btn--danger btn--sm';
          clearBtn.textContent = 'Hapus semua';
          clearBtn.addEventListener('click', function () {
            SIGAP.ui.confirm(
              'Hapus semua data siswa?',
              'Seluruh roster (' + roster.length + ' siswa) akan dihapus dari perangkat ini. Tindakan ini tidak bisa dibatalkan.',
              function () {
                saveRoster([]);
                SIGAP.ui.toast('Roster dikosongkan.', 'warn');
                renderRoster();
              },
              { yesLabel: 'Ya, hapus semua', danger: true }
            );
          });
          head.appendChild(clearBtn);
        }
        rosterSection.appendChild(head);

        if (!roster.length) {
          var empty = document.createElement('div');
          empty.className = 'panel panel--glass text-center stack scr-empty';
          empty.innerHTML =
            '<div class="scr-empty__icon" aria-hidden="true">🧑‍🏫</div>' +
            '<p><strong>Belum ada data siswa.</strong></p>' +
            '<p class="text-sm text-muted">Minta setiap siswa membuka <strong>FINAL REPORT → EXPORT Class Code</strong>, lalu tempel kodenya di kotak impor di atas.</p>';
          rosterSection.appendChild(empty);
          return;
        }

        var wrap = document.createElement('div');
        wrap.className = 'tch-table-wrap panel';
        var table = document.createElement('table');
        table.className = 'tch-table';

        var caseMeta = SIGAP.data.cases || [];
        var theadHtml = '<tr><th scope="col">Siswa</th><th scope="col">CASE</th><th scope="col">LAB</th>';
        for (var c = 0; c < caseMeta.length; c++) {
          theadHtml += '<th scope="col"><abbr title="' + esc(caseMeta[c].code + ' — ' + caseMeta[c].title) + '">C' + (c + 1) + '</abbr></th>';
        }
        for (var key in COMP_ABBR) {
          if (COMP_ABBR.hasOwnProperty(key)) {
            theadHtml += '<th scope="col"><abbr title="' + esc(SIGAP.scoring.COMPETENCIES[key]) + '">' + COMP_ABBR[key] + '</abbr></th>';
          }
        }
        theadHtml += '<th scope="col">Kalibrasi</th><th scope="col">Aksi</th></tr>';
        var thead = document.createElement('thead');
        thead.innerHTML = theadHtml;
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        roster.forEach(function (st) {
          var tr = document.createElement('tr');
          var cases = (st.progress && st.progress.cases) || {};
          var labs = (st.progress && st.progress.labs) || {};
          var summary = (st.performance && st.performance.summary) || {};
          var flags = (st.performance && st.performance.flags) || {};

          var rowHtml = '<th scope="row" class="tch-table__name">' + esc(studentLabel(st)) + '</th>' +
            '<td>' + countCompleted(cases) + '/' + (caseMeta.length || 4) + '</td>' +
            '<td>' + countCompleted(labs) + '/' + ((SIGAP.data.labs || []).length || 4) + '</td>';
          for (var ci = 0; ci < caseMeta.length; ci++) {
            var rec = cases[caseMeta[ci].id];
            rowHtml += '<td class="text-mono">' +
              (rec && rec.bestScore !== null && rec.bestScore !== undefined ? rec.bestScore : '—') + '</td>';
          }
          for (var ck in COMP_ABBR) {
            if (!COMP_ABBR.hasOwnProperty(ck)) continue;
            var v = summary[ck];
            rowHtml += '<td class="text-mono">' + (v === null || v === undefined ? '—' : v) + '</td>';
          }
          var calCell;
          if ((flags.overconfident || 0) >= 2) calCell = '<span class="tag tag--amber">⚠ terlalu yakin ×' + flags.overconfident + '</span>';
          else if ((flags.underconfident || 0) >= 2) calCell = '<span class="tag tag--cyan">kurang yakin ×' + flags.underconfident + '</span>';
          else if ((flags.wellCalibrated || 0) >= 1) calCell = '<span class="tag tag--green">baik ×' + flags.wellCalibrated + '</span>';
          else calCell = '<span class="text-faint">—</span>';
          rowHtml += '<td>' + calCell + '</td>';
          tr.innerHTML = rowHtml;

          var tdAct = document.createElement('td');
          tdAct.className = 'tch-table__actions';
          var detailBtn = document.createElement('button');
          detailBtn.className = 'btn btn--sm btn--ghost';
          detailBtn.textContent = 'Detail';
          detailBtn.setAttribute('aria-label', 'Lihat detail ' + studentLabel(st));
          detailBtn.addEventListener('click', function () { showDetail(st, deleteStudent); });
          tdAct.appendChild(detailBtn);
          var delBtn = document.createElement('button');
          delBtn.className = 'btn btn--sm btn--danger';
          delBtn.textContent = 'Hapus';
          delBtn.setAttribute('aria-label', 'Hapus ' + studentLabel(st));
          delBtn.addEventListener('click', function () {
            SIGAP.ui.confirm(
              'Hapus data siswa?',
              'Data ' + esc(studentLabel(st)) + ' akan dihapus dari roster.',
              function () { deleteStudent(st.agentId); },
              { yesLabel: 'Ya, hapus', danger: true }
            );
          });
          tdAct.appendChild(delBtn);
          tr.appendChild(tdAct);
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        rosterSection.appendChild(wrap);

        var note = document.createElement('p');
        note.className = 'text-xs text-faint';
        note.textContent = 'CT = Critical Thinking, AI = AI Literacy, DS = Digital Safety, ER = Evidence Reasoning, ET = Ethical Reasoning. "—" berarti belum ada data. Klik Detail untuk breakdown, refleksi, dan catatan miskonsepsi.';
        rosterSection.appendChild(note);
      }

      impBtn.addEventListener('click', function () {
        impErr.textContent = '';
        var parsed = parseClassCode(ta.value);
        if (!parsed) {
          impErr.textContent = INVALID_MSG;
          if (SIGAP.audio) SIGAP.audio.sfx('warning');
          return;
        }
        var roster = loadRoster();
        var replaced = false;
        for (var i = 0; i < roster.length; i++) {
          if (roster[i].agentId === parsed.agentId) {
            roster[i] = parsed;
            replaced = true;
            break;
          }
        }
        if (!replaced) roster.push(parsed);
        saveRoster(roster);
        ta.value = '';
        if (SIGAP.audio) SIGAP.audio.sfx('success');
        SIGAP.ui.toast(replaced
          ? 'Data ' + studentLabel(parsed) + ' diperbarui dengan ekspor terbaru.'
          : studentLabel(parsed) + ' ditambahkan ke roster.', 'success');
        renderRoster();
      });

      renderRoster();

      var backRow = document.createElement('div');
      backRow.className = 'row scr-no-print';
      var backBtn = document.createElement('a');
      backBtn.className = 'btn btn--ghost';
      backBtn.href = '#/title';
      backBtn.textContent = '← Kembali ke halaman utama';
      backRow.appendChild(backBtn);
      main.appendChild(backRow);
    },
    onLeave: function () { /* nothing to clean up */ }
  });
})();
