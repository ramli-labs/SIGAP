/* ============================================================
   SIGAP — screens/missions.js
   Tiga route: 'missions' (daftar case folders),
   'archive' (arsip bukti lintas case),
   'achievements' (grid badge — terkunci tetap terlihat).
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.data = SIGAP.data || {};

  // Katalog deskripsi bukti. Modul case boleh mengisi:
  //   SIGAP.data.evidenceCatalog[caseId][evidenceId] = {title, body, source}
  // Screen archive membaca ini secara defensif (fallback: tampilkan ID mono).
  SIGAP.data.evidenceCatalog = SIGAP.data.evidenceCatalog || {};

  function esc(s) { return SIGAP.ui.escapeHtml(s); }

  /* ============================ MISSIONS ============================ */

  function caseCard(c, rec, recommended) {
    var completed = !!(rec && rec.completed);
    var card = document.createElement('article');
    card.className = 'scr-case-card panel' + (completed ? ' scr-case-card--done' : '');

    var tab = document.createElement('div');
    tab.className = 'scr-case-card__tab text-mono';
    tab.textContent = c.code;
    card.appendChild(tab);

    var head = document.createElement('div');
    head.className = 'row row--between scr-case-card__head';
    var titleWrap = document.createElement('div');
    titleWrap.innerHTML =
      '<h2 class="scr-case-card__title">' + esc(c.title) + '</h2>' +
      '<div class="text-xs text-muted">' + esc(c.theme || '') + '</div>';
    head.appendChild(titleWrap);

    var tags = document.createElement('div');
    tags.className = 'scr-case-card__tags';
    if (recommended) {
      var rTag = document.createElement('span');
      rTag.className = 'tag tag--amber';
      rTag.textContent = '★ DISARANKAN';
      tags.appendChild(rTag);
    }
    var sTag = document.createElement('span');
    if (completed) {
      sTag.className = 'tag tag--green';
      sTag.textContent = '✓ SELESAI';
    } else {
      sTag.className = 'tag tag--cyan';
      sTag.textContent = 'BELUM DIMULAI';
    }
    tags.appendChild(sTag);
    head.appendChild(tags);
    card.appendChild(head);

    var brief = document.createElement('p');
    brief.className = 'text-sm text-muted scr-case-card__brief';
    brief.textContent = c.brief || '';
    card.appendChild(brief);

    var foot = document.createElement('div');
    foot.className = 'row row--between scr-case-card__foot';

    var scores = document.createElement('div');
    scores.className = 'text-xs text-mono';
    if (completed) {
      var parts = [];
      if (rec.bestScore !== null && rec.bestScore !== undefined) parts.push('Skor terbaik: ' + rec.bestScore);
      if (rec.latestScore !== null && rec.latestScore !== undefined && rec.latestScore !== rec.bestScore) {
        parts.push('terakhir: ' + rec.latestScore);
      }
      if (rec.practiceRuns) parts.push(rec.practiceRuns + '× practice run');
      scores.textContent = parts.join(' · ');
      scores.className += ' text-cyan';
    } else {
      scores.textContent = '+' + (c.xp || 100) + ' XP saat selesai';
      scores.className += ' text-faint';
    }
    foot.appendChild(scores);

    var go = document.createElement('a');
    go.href = '#/' + (c.route || c.id);
    if (completed) {
      go.className = 'btn btn--ghost';
      go.textContent = 'ULANGI (PRACTICE RUN — tanpa XP)';
    } else {
      go.className = 'btn btn--primary';
      go.textContent = 'MULAI';
    }
    foot.appendChild(go);
    card.appendChild(foot);
    return card;
  }

  SIGAP.router.register('missions', {
    title: 'Case Files',
    render: function (container) {
      SIGAP.ui.background(container);
      container.appendChild(SIGAP.ui.topbar({ crumb: 'CASE FILES', backTo: 'academy' }));

      var s = SIGAP.state.get();
      var main = document.createElement('div');
      main.className = 'container screen stack--lg';
      container.appendChild(main);

      var header = document.createElement('div');
      header.className = 'screen__header';
      header.innerHTML =
        '<div class="screen__eyebrow">ARSIP MISI AKTIF</div>' +
        '<h1 class="screen__title">Case Files</h1>' +
        '<p class="screen__sub">Boleh dikerjakan dalam urutan apa pun. Kasus bertanda ★ adalah urutan yang kami sarankan.</p>';
      main.appendChild(header);

      var cases = SIGAP.data.cases || [];
      var recommendedGiven = false;
      var list = document.createElement('div');
      list.className = 'stack';
      for (var i = 0; i < cases.length; i++) {
        var c = cases[i];
        var rec = s.progress.cases[c.id] || null;
        var recommend = false;
        if (!recommendedGiven && !(rec && rec.completed)) {
          recommend = true;
          recommendedGiven = true;
        }
        list.appendChild(caseCard(c, rec, recommend));
      }
      if (!cases.length) {
        var empty = document.createElement('div');
        empty.className = 'panel text-center text-muted';
        empty.textContent = 'Data kasus belum termuat. Muat ulang halaman ini.';
        list.appendChild(empty);
      }
      main.appendChild(list);

      /* AI LAB shortcut */
      var labsDone = 0;
      var labs = SIGAP.data.labs || [];
      for (var j = 0; j < labs.length; j++) {
        var lr = s.progress.labs[labs[j].id];
        if (lr && lr.completed) labsDone++;
      }
      var labPanel = document.createElement('div');
      labPanel.className = 'panel panel--glass scr-lab-strip';
      labPanel.innerHTML =
        '<div class="scr-lab-strip__info">' +
        '<div class="panel-title">AI Laboratory</div>' +
        '<p class="text-sm text-muted">Empat modul singkat tentang cara kerja AI — membantu di CASE 002 dan 004.</p>' +
        '<div class="text-xs text-mono text-cyan">' + labsDone + '/' + (labs.length || 4) + ' modul selesai</div>' +
        '</div>';
      var labGo = document.createElement('a');
      labGo.className = 'btn btn--primary';
      labGo.href = '#/ailab';
      labGo.textContent = 'Buka AI LAB →';
      labPanel.appendChild(labGo);
      main.appendChild(labPanel);
    },
    onLeave: function () { /* nothing to clean up */ }
  });

  /* ============================ ARCHIVE ============================ */

  SIGAP.router.register('archive', {
    title: 'Evidence Archive',
    render: function (container) {
      SIGAP.ui.background(container);
      container.appendChild(SIGAP.ui.topbar({ crumb: 'EVIDENCE ARCHIVE', backTo: 'academy' }));

      var s = SIGAP.state.get();
      var main = document.createElement('div');
      main.className = 'container screen stack--lg';
      container.appendChild(main);

      var totalFound = 0;
      var sections = [];
      var cases = SIGAP.data.cases || [];
      var catalog = SIGAP.data.evidenceCatalog || {};

      for (var i = 0; i < cases.length; i++) {
        var c = cases[i];
        var rec = s.progress.cases[c.id];
        var found = (rec && rec.evidence) ? rec.evidence : [];
        if (!found.length) continue;
        totalFound += found.length;
        sections.push({ caseMeta: c, evidence: found });
      }

      var header = document.createElement('div');
      header.className = 'screen__header';
      header.innerHTML =
        '<div class="screen__eyebrow">PENYIMPANAN BUKTI TERPUSAT</div>' +
        '<h1 class="screen__title">Evidence Archive</h1>' +
        '<p class="screen__sub">' + totalFound + ' bukti terkumpul dari seluruh investigasimu.</p>';
      main.appendChild(header);

      if (!sections.length) {
        var empty = document.createElement('div');
        empty.className = 'panel panel--glass text-center stack scr-empty';
        empty.innerHTML =
          '<div class="scr-empty__icon" aria-hidden="true">🗄</div>' +
          '<p><strong>Arsip masih kosong.</strong></p>' +
          '<p class="text-sm text-muted">Bukti yang kamu temukan di dalam kasus akan otomatis tersimpan di sini.</p>';
        var goBtn = document.createElement('a');
        goBtn.className = 'btn btn--primary';
        goBtn.href = '#/missions';
        goBtn.textContent = 'Mulai investigasi pertama →';
        empty.appendChild(goBtn);
        main.appendChild(empty);
        return;
      }

      for (var k = 0; k < sections.length; k++) {
        var sec = sections[k];
        var secEl = document.createElement('section');
        secEl.className = 'stack';
        var h = document.createElement('h2');
        h.className = 'scr-archive-head text-mono';
        h.textContent = sec.caseMeta.code + ' — ' + sec.caseMeta.title +
          ' (' + sec.evidence.length + ' bukti)';
        secEl.appendChild(h);

        var grid = document.createElement('div');
        grid.className = 'grid-2';
        var caseCatalog = catalog[sec.caseMeta.id] || {};
        for (var e = 0; e < sec.evidence.length; e++) {
          var evId = sec.evidence[e];
          var meta = caseCatalog[evId];
          var card;
          if (meta && meta.title) {
            card = SIGAP.ui.evidenceCard({
              id: evId,
              title: meta.title,
              body: meta.body || '',
              source: meta.source || sec.caseMeta.code,
              tag: sec.caseMeta.code,
              tagClass: 'tag--cyan'
            });
          } else {
            // Defensif: katalog belum terdaftar untuk bukti ini.
            card = SIGAP.ui.evidenceCard({
              id: evId,
              title: 'BUKTI TERSIMPAN',
              body: '<span class="text-mono text-sm">' + esc(String(evId)) + '</span>' +
                '<br><span class="text-xs text-faint">Detail bukti tersedia di dalam kasusnya.</span>',
              tag: sec.caseMeta.code,
              tagClass: 'tag--cyan'
            });
          }
          grid.appendChild(card);
        }
        secEl.appendChild(grid);
        main.appendChild(secEl);
      }
    },
    onLeave: function () { /* nothing to clean up */ }
  });

  /* ========================== ACHIEVEMENTS ========================== */

  SIGAP.router.register('achievements', {
    title: 'Achievements',
    render: function (container) {
      SIGAP.ui.background(container);
      container.appendChild(SIGAP.ui.topbar({ crumb: 'ACHIEVEMENTS', backTo: 'academy' }));

      var main = document.createElement('div');
      main.className = 'container screen stack--lg';
      container.appendChild(main);

      var all = SIGAP.achievements.all() || [];
      var unlockedCount = 0;
      for (var i = 0; i < all.length; i++) {
        if (SIGAP.achievements.isUnlocked(all[i].id)) unlockedCount++;
      }

      var header = document.createElement('div');
      header.className = 'screen__header';
      header.innerHTML =
        '<div class="screen__eyebrow">CATATAN PRESTASI AGEN</div>' +
        '<h1 class="screen__title">Achievements</h1>' +
        '<p class="screen__sub">' + unlockedCount + '/' + all.length +
        ' badge terbuka. Badge menghargai <em>cara berpikir</em>, bukan kecepatan klik. Badge hanya terbuka pada run pertama (bukan practice run).</p>';
      main.appendChild(header);

      var grid = document.createElement('div');
      grid.className = 'scr-badge-grid';
      grid.setAttribute('role', 'list');

      for (var j = 0; j < all.length; j++) {
        var a = all[j];
        var unlocked = SIGAP.achievements.isUnlocked(a.id);
        var card = document.createElement('div');
        card.setAttribute('role', 'listitem');
        card.className = 'scr-badge panel' + (unlocked ? ' scr-badge--open' : ' scr-badge--locked');
        card.innerHTML =
          '<div class="scr-badge__icon" aria-hidden="true">' + a.icon + '</div>' +
          '<div class="scr-badge__name">' + esc(a.name) + '</div>' +
          '<div class="scr-badge__desc text-xs text-muted">' + esc(a.desc) + '</div>' +
          '<div class="scr-badge__foot">' +
          (unlocked
            ? '<span class="tag tag--green">✓ TERBUKA</span>'
            : '<span class="tag tag--red">🔒 TERKUNCI</span>') +
          '<span class="text-xs text-mono text-faint">+' + (a.xp || 0) + ' XP</span>' +
          '</div>';
        grid.appendChild(card);
      }
      main.appendChild(grid);
    },
    onLeave: function () { /* nothing to clean up */ }
  });
})();
