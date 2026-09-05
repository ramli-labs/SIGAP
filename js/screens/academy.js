/* ============================================================
   SIGAP — screens/academy.js
   Hub Academy: kartu agen, XP, ringkasan kompetensi, menu.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};

  function esc(s) { return SIGAP.ui.escapeHtml(s); }

  function avatarSvg() {
    return '<svg viewBox="0 0 72 72" width="64" height="64" role="img" aria-label="Avatar agen">' +
      '<rect width="72" height="72" rx="10" fill="#101a2a"/>' +
      '<circle cx="36" cy="28" r="12" fill="#1e2f4a" stroke="#e8a33d" stroke-width="1.5"/>' +
      '<path d="M15 66c2-13 10-20 21-20s19 7 21 20" fill="#1e2f4a" stroke="#e8a33d" stroke-width="1.5"/>' +
      '<rect x="2" y="2" width="68" height="68" rx="9" fill="none" stroke="#37c8dd" stroke-width="1.2" opacity="0.6"/>' +
      '</svg>';
  }

  function countCompleted(map) {
    var n = 0;
    for (var k in map) {
      if (map.hasOwnProperty(k) && map[k] && map[k].completed) n++;
    }
    return n;
  }

  function meterRow(label, value) {
    var row = document.createElement('div');
    row.className = 'scr-comp-row';
    var head = document.createElement('div');
    head.className = 'row row--between';
    var name = document.createElement('span');
    name.className = 'text-sm';
    name.textContent = label;
    var val = document.createElement('span');
    val.className = 'text-sm text-mono';
    if (value === null || value === undefined) {
      val.textContent = 'belum ada data';
      val.className += ' text-faint';
    } else {
      val.textContent = value + '/100';
      val.className += ' text-cyan';
    }
    head.appendChild(name);
    head.appendChild(val);
    row.appendChild(head);

    var meter = document.createElement('div');
    meter.className = 'meter';
    meter.setAttribute('role', 'img');
    meter.setAttribute('aria-label', label + ': ' + (value === null || value === undefined ? 'belum ada data' : value + ' dari 100'));
    if (value !== null && value !== undefined) {
      var fill = document.createElement('div');
      fill.className = 'meter__fill';
      fill.style.width = Math.max(0, Math.min(100, value)) + '%';
      meter.appendChild(fill);
    } else {
      meter.className += ' scr-meter--empty';
    }
    row.appendChild(meter);
    return row;
  }

  function menuCard(opts) {
    var a = document.createElement('a');
    a.className = 'scr-menu-card panel panel--glass';
    a.href = '#/' + opts.route;
    a.innerHTML =
      '<span class="scr-menu-card__icon" aria-hidden="true">' + opts.icon + '</span>' +
      '<span class="scr-menu-card__body">' +
      '<span class="scr-menu-card__title">' + esc(opts.title) + '</span>' +
      '<span class="scr-menu-card__desc text-sm text-muted">' + esc(opts.desc) + '</span>' +
      '<span class="scr-menu-card__status text-xs text-mono">' + esc(opts.status) + '</span>' +
      '</span>' +
      '<span class="scr-menu-card__arrow" aria-hidden="true">→</span>';
    return a;
  }

  SIGAP.router.register('academy', {
    title: 'Academy',
    render: function (container) {
      SIGAP.ui.background(container);
      container.appendChild(SIGAP.ui.topbar({ crumb: 'ACADEMY' }));

      var s = SIGAP.state.get();
      var main = document.createElement('div');
      main.className = 'container screen stack--lg';
      container.appendChild(main);

      var header = document.createElement('div');
      header.className = 'screen__header';
      header.innerHTML =
        '<div class="screen__eyebrow">SIGAP DIGITAL INVESTIGATION ACADEMY</div>' +
        '<h1 class="screen__title">Pusat Komando</h1>' +
        '<p class="screen__sub">Pilih misi, latih kemampuanmu, dan periksa perkembanganmu.</p>';
      main.appendChild(header);

      /* --- Agent card + competency summary --- */
      var top = document.createElement('div');
      top.className = 'grid-2 scr-hub-top';

      var casesDone = countCompleted(s.progress.cases);
      var labsDone = countCompleted(s.progress.labs);
      var totalCases = (SIGAP.data.cases || []).length || 4;
      var totalLabs = (SIGAP.data.labs || []).length || 4;
      var badges = (s.achievements || []).length;
      var totalBadges = (SIGAP.achievements.all() || []).length;

      var agentPanel = document.createElement('div');
      agentPanel.className = 'panel panel--accent stack';
      var xpInto = SIGAP.state.xpIntoLevel(s.player.xp);
      var xpPct = Math.round((xpInto / SIGAP.state.XP_PER_LEVEL) * 100);
      agentPanel.innerHTML =
        '<div class="panel-title">Kartu Agen</div>' +
        '<div class="scr-agent">' +
        '<div class="scr-agent__avatar">' + avatarSvg() + '</div>' +
        '<div class="scr-agent__info">' +
        '<div class="scr-agent__name">' + esc(s.player.name) + '</div>' +
        '<div class="text-mono text-sm text-cyan">' + esc(s.player.agentId) + '</div>' +
        '<div class="text-xs text-muted">Level ' + s.player.level + ' · ' + s.player.xp + ' XP total</div>' +
        '</div></div>' +
        '<div>' +
        '<div class="row row--between text-xs text-mono"><span>MENUJU LEVEL ' + (s.player.level + 1) + '</span>' +
        '<span>' + xpInto + ' / ' + SIGAP.state.XP_PER_LEVEL + ' XP</span></div>' +
        '<div class="meter" role="img" aria-label="XP menuju level berikutnya: ' + xpInto + ' dari ' + SIGAP.state.XP_PER_LEVEL + '">' +
        '<div class="meter__fill meter__fill--amber" style="width:' + xpPct + '%"></div></div>' +
        '</div>' +
        '<div class="scr-progress-chips">' +
        '<span class="tag tag--cyan">CASE ' + casesDone + '/' + totalCases + '</span>' +
        '<span class="tag tag--purple">LAB ' + labsDone + '/' + totalLabs + '</span>' +
        '<span class="tag tag--amber">🏅 ' + badges + '/' + totalBadges + ' badge</span>' +
        '</div>' +
        '<p class="text-xs text-faint">XP menunjukkan progres, bukan kepintaran. Kompetensi diukur terpisah.</p>';
      top.appendChild(agentPanel);

      var compPanel = document.createElement('div');
      compPanel.className = 'panel stack';
      var compTitle = document.createElement('div');
      compTitle.className = 'panel-title';
      compTitle.textContent = 'Kompetensi Investigasi';
      compPanel.appendChild(compTitle);
      var summary = SIGAP.scoring.competencySummary();
      var names = SIGAP.scoring.COMPETENCIES;
      for (var key in names) {
        if (names.hasOwnProperty(key)) {
          compPanel.appendChild(meterRow(names[key], summary[key]));
        }
      }
      var compNote = document.createElement('p');
      compNote.className = 'text-xs text-faint';
      compNote.textContent = 'Nilai muncul setelah kamu menyelesaikan CASE atau LAB terkait (practice run tidak dihitung).';
      compPanel.appendChild(compNote);
      top.appendChild(compPanel);
      main.appendChild(top);

      /* --- Menu grid --- */
      var menuTitle = document.createElement('h2');
      menuTitle.className = 'screen__eyebrow scr-menu-heading';
      menuTitle.textContent = 'AKSES MODUL';
      main.appendChild(menuTitle);

      var menu = document.createElement('div');
      menu.className = 'scr-menu-grid';
      menu.appendChild(menuCard({
        route: 'missions', icon: '🗂', title: 'CASE FILES',
        desc: 'Empat kasus investigasi utama.',
        status: casesDone + '/' + totalCases + ' selesai'
      }));
      menu.appendChild(menuCard({
        route: 'ailab', icon: '🧪', title: 'AI LABORATORY',
        desc: 'Pelajari cara kerja (dan kelemahan) AI.',
        status: labsDone + '/' + totalLabs + ' modul selesai'
      }));
      var evCount = 0;
      for (var cid in s.progress.cases) {
        if (s.progress.cases.hasOwnProperty(cid) && s.progress.cases[cid].evidence) {
          evCount += s.progress.cases[cid].evidence.length;
        }
      }
      menu.appendChild(menuCard({
        route: 'archive', icon: '📁', title: 'EVIDENCE ARCHIVE',
        desc: 'Semua bukti yang pernah kamu temukan.',
        status: evCount + ' bukti terkumpul'
      }));
      menu.appendChild(menuCard({
        route: 'achievements', icon: '🏅', title: 'ACHIEVEMENTS',
        desc: 'Badge untuk cara berpikir yang baik.',
        status: badges + '/' + totalBadges + ' terbuka'
      }));
      menu.appendChild(menuCard({
        route: 'report', icon: '📊', title: 'FINAL REPORT',
        desc: 'Laporan progres + kompetensimu, siap untuk guru.',
        status: 'ekspor Class Code di sini'
      }));
      menu.appendChild(menuCard({
        route: 'teacher', icon: '🧑‍🏫', title: 'TEACHER MODE',
        desc: 'Dashboard guru: impor Class Code siswa.',
        status: 'untuk guru'
      }));
      main.appendChild(menu);

      /* --- PHANTOM easter egg --- */
      if (s.story && s.story.phantomIntroSeen) {
        var glitch = document.createElement('div');
        glitch.className = 'scr-phantom-line text-mono text-xs';
        glitch.setAttribute('aria-label', 'Pesan sistem: sinyal tak dikenal terpantau di jaringan');
        glitch.innerHTML =
          '<span class="phantom-glitch">&gt;_ anomali: sinyal tak dikenal terpantau di jaringan akademi… sumber: [REDACTED]</span>';
        main.appendChild(glitch);
      }
    },
    onLeave: function () { /* nothing to clean up */ }
  });
})();
