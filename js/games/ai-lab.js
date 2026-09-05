/* ============================================================
   SIGAP — games/ai-lab.js
   AI LABORATORY: hub + 4 mini-lab (route 'ailab').
   ?lab=lab01..lab04 membuka lab tertentu.
   Data soal/konten: js/data/ai-lab-data.js (SIGAP.data.aiLab).
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};

  var timers = [];
  function later(fn, ms) {
    var t = setTimeout(fn, ms);
    timers.push(t);
    return t;
  }
  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }

  var esc = function (s) { return SIGAP.ui.escapeHtml(String(s)); };

  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function btn(label, variant, onClick) {
    var b = el('button', 'btn' + (variant ? ' btn--' + variant : ''));
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', function () {
      if (SIGAP.audio) SIGAP.audio.sfx('click');
      onClick();
    });
    return b;
  }

  function meterEl(pct, fillMod) {
    var m = el('div', 'meter');
    var f = el('div', 'meter__fill' + (fillMod ? ' meter__fill--' + fillMod : ''));
    f.style.width = Math.max(0, Math.min(100, pct)) + '%';
    m.appendChild(f);
    return m;
  }

  function labMeta(labId) {
    var list = SIGAP.data.labs || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === labId) return list[i];
    return { code: labId.toUpperCase(), title: labId };
  }

  /* ---------- Debrief bersama semua lab ---------- */
  function showDebrief(main, cfg) {
    // cfg: { labId, score, competencies, rows:[{label,val}], concept:[..], extraNote? }
    var res = SIGAP.scoring.finishLab({
      labId: cfg.labId,
      score: cfg.score,
      competencies: cfg.competencies,
      xp: 50
    });

    // Semua 4 lab selesai (run non-practice) → badge.
    if (!res.practice) {
      var all = true;
      var ids = ['lab01', 'lab02', 'lab03', 'lab04'];
      var labs = SIGAP.state.get().progress.labs;
      for (var i = 0; i < ids.length; i++) {
        if (!labs[ids[i]] || !labs[ids[i]].completed) { all = false; break; }
      }
      if (all) SIGAP.achievements.unlock('ai-lab-analyst');
    }

    main.innerHTML = '';
    var meta = labMeta(cfg.labId);
    var panel = el('div', 'panel panel--accent stack lab-debrief');
    panel.appendChild(el('div', 'panel-title', esc(meta.code) + ' SELESAI'));

    if (res.practice) {
      panel.appendChild(el('div', 'practice-banner', 'PRACTICE RUN — XP tidak diberikan'));
    }

    var good = cfg.score >= 60;
    var verdict = el('div', 'debrief-verdict ' + (good ? 'debrief-verdict--good' : 'debrief-verdict--bad'));
    verdict.innerHTML =
      '<span class="debrief-verdict__icon" aria-hidden="true">' + (good ? '✅' : '🔬') + '</span>' +
      '<div><strong>Skor lab: ' + cfg.score + '/100.</strong> ' +
      (good
        ? 'Kerja bagus — konsep intinya sudah kamu pegang.'
        : 'Belum maksimal — baca debrief di bawah, lalu coba lagi sebagai latihan.') +
      '</div>';
    panel.appendChild(verdict);

    if (cfg.rows && cfg.rows.length) {
      var rows = el('div', 'stack lab-debrief__rows');
      for (var r = 0; r < cfg.rows.length; r++) {
        var row = el('div', 'score-row');
        row.innerHTML = '<span>' + esc(cfg.rows[r].label) + '</span>' +
          '<span class="score-row__val">' + esc(cfg.rows[r].val) + '</span>';
        rows.appendChild(row);
      }
      var total = el('div', 'score-total');
      total.innerHTML = '<span>TOTAL</span><span class="score-total__val">' + cfg.score + '/100</span>';
      rows.appendChild(total);
      panel.appendChild(rows);
    }

    var concept = el('div', 'panel lab-debrief__concept stack');
    concept.appendChild(el('div', 'panel-title', 'Debrief — konsep yang barusan kamu alami'));
    var ul = el('ul', 'lab-concept-list');
    for (var c = 0; c < cfg.concept.length; c++) {
      ul.appendChild(el('li', '', cfg.concept[c]));
    }
    concept.appendChild(ul);
    if (cfg.extraNote) concept.appendChild(el('p', 'text-sm text-muted', cfg.extraNote));
    panel.appendChild(concept);

    var nav = el('div', 'row lab-debrief__nav');
    nav.appendChild(btn('Kembali ke AI Lab', 'primary', function () {
      SIGAP.router.go('ailab');
    }));
    nav.appendChild(btn('Ulangi lab ini (latihan)', 'ghost', function () {
      SIGAP.router.go('ailab', { lab: cfg.labId });
    }));
    panel.appendChild(nav);

    main.appendChild(panel);
    if (SIGAP.audio) SIGAP.audio.sfx(good ? 'success' : 'warning');
    main.focus && main.focus();
    window.scrollTo(0, 0);
  }

  function labHeader(main, labId, subtitle, simLabel) {
    var head = el('div', 'screen__header');
    var meta = labMeta(labId);
    head.appendChild(el('div', 'screen__eyebrow', 'AI LABORATORY / ' + esc(meta.code)));
    head.appendChild(el('h1', 'screen__title', esc(meta.title)));
    if (simLabel) head.appendChild(el('div', 'sim-label lab-sim-label', esc(simLabel)));
    head.appendChild(el('p', 'screen__sub', subtitle));
    if (SIGAP.state.isPractice('lab', labId)) {
      head.appendChild(el('div', 'practice-banner', 'PRACTICE RUN — lab ini sudah selesai; XP tidak diberikan lagi'));
    }
    main.appendChild(head);
    return head;
  }

  /* ============================================================
     HUB — 4 kartu lab + status + bestScore
     ============================================================ */
  function renderHub(main) {
    var head = el('div', 'screen__header');
    head.appendChild(el('div', 'screen__eyebrow', 'MODUL EKSPERIMEN'));
    head.appendChild(el('h1', 'screen__title', 'AI LABORATORY'));
    head.appendChild(el('p', 'screen__sub',
      'Empat eksperimen singkat untuk memahami cara kerja AI dari dalam: pola, data latihan, bias, ' +
      'dan cara menilai konten. Selesaikan keempatnya untuk membuka badge <strong>AI Lab Analyst</strong>.'));
    main.appendChild(head);

    var labsState = SIGAP.state.get().progress.labs;
    var doneCount = 0;
    var list = SIGAP.data.labs || [];
    var grid = el('div', 'grid-2 lab-hub-grid');

    for (var i = 0; i < list.length; i++) {
      (function (meta) {
        var rec = labsState[meta.id];
        var done = !!(rec && rec.completed);
        if (done) doneCount++;

        var card = el('article', 'panel panel--glass lab-card stack');
        var top = el('div', 'row row--between lab-card__top');
        top.appendChild(el('span', 'tag tag--cyan', esc(meta.code)));
        top.appendChild(el('span', 'tag ' + (done ? 'tag--green' : 'tag--amber'),
          done ? '✔ SELESAI' : '○ BELUM'));
        card.appendChild(top);

        card.appendChild(el('h2', 'lab-card__title', esc(meta.title)));
        card.appendChild(el('p', 'lab-card__brief text-sm text-muted', esc(meta.brief)));

        var stats = el('div', 'lab-card__stats text-xs text-mono');
        stats.innerHTML = done
          ? 'Skor terbaik: <span class="text-cyan">' + rec.bestScore + '/100</span>' +
            (rec.attempts > 1 ? ' · ' + rec.attempts + '× percobaan' : '')
          : 'Belum ada skor · +' + meta.xp + ' XP saat selesai';
        card.appendChild(stats);

        var go = btn(done ? 'Main lagi (latihan)' : 'Mulai eksperimen', done ? 'ghost' : 'primary', function () {
          SIGAP.router.go('ailab', { lab: meta.id });
        });
        go.classList.add('btn--block');
        card.appendChild(go);
        grid.appendChild(card);
      })(list[i]);
    }
    main.appendChild(grid);

    var foot = el('div', 'panel lab-hub-foot stack');
    foot.appendChild(el('div', 'row row--between',
      '<span class="text-sm">Progres laboratorium</span>' +
      '<span class="text-mono text-sm text-cyan">' + doneCount + '/4 lab</span>'));
    foot.appendChild(meterEl(doneCount * 25, doneCount === 4 ? 'green' : ''));
    if (SIGAP.achievements.isUnlocked('ai-lab-analyst')) {
      foot.appendChild(el('p', 'text-sm text-success', '🧪 Badge AI Lab Analyst sudah terbuka.'));
    }
    main.appendChild(foot);
  }

  /* ============================================================
     LAB 01 — PATTERN RECOGNITION
     ============================================================ */
  function renderLab01(main) {
    var questions = SIGAP.data.aiLab.lab01;
    labHeader(main, 'lab01',
      'Mesin (dan manusia) mengenali pola dari contoh. Temukan aturan tiap pola — dan waspadai: ' +
      'pola yang tampak cocok belum tentu aturan yang sebenarnya.');

    var idx = 0;
    var correctCount = 0;
    var body = el('div', 'stack');
    main.appendChild(body);

    function showQuestion() {
      body.innerHTML = '';
      var q = questions[idx];

      body.appendChild(SIGAP.ui.phaseSteps(
        questions.map(function (_, i) { return 'SOAL ' + (i + 1); }), idx));

      var panel = el('div', 'panel panel--accent stack');
      panel.appendChild(el('div', 'panel-title',
        'Soal ' + (idx + 1) + ' dari ' + questions.length + ' — ' + esc(q.label)));

      var seq = el('div', 'lab-seq');
      seq.setAttribute('aria-label', 'Urutan pola: ' + q.sequence.join(', '));
      for (var s = 0; s < q.sequence.length; s++) {
        var chip = el('span', 'lab-seq__chip' + (q.sequence[s] === '?' ? ' lab-seq__chip--q' : ''));
        chip.textContent = q.sequence[s];
        seq.appendChild(chip);
      }
      panel.appendChild(seq);
      panel.appendChild(el('p', 'text-sm text-muted', 'Apa isi kotak <strong>?</strong> berikutnya?'));

      var opts = el('div', 'stack lab-options');
      opts.setAttribute('role', 'group');
      opts.setAttribute('aria-label', 'Pilihan jawaban');
      var keys = ['A', 'B', 'C', 'D'];
      var buttons = [];

      function answer(choice) {
        for (var b = 0; b < buttons.length; b++) buttons[b].disabled = true;
        var ok = choice === q.correct;
        if (ok) correctCount++;
        buttons[q.correct].classList.add('lab-option--correct');
        if (!ok) buttons[choice].classList.add('lab-option--wrong');
        if (SIGAP.audio) SIGAP.audio.sfx(ok ? 'success' : 'warning');

        var fb = el('div', 'panel lab-feedback stack ' + (ok ? 'lab-feedback--ok' : 'lab-feedback--no'));
        fb.appendChild(el('div', 'lab-feedback__head',
          (ok ? '✅ BENAR' : '❌ KURANG TEPAT') +
          (q.trap ? ' · <span class="tag tag--purple">SOAL JEBAKAN</span>' : '')));
        fb.appendChild(el('p', 'text-sm', '<strong>Aturan polanya:</strong> ' + q.explain));
        var next = btn(idx + 1 < questions.length ? 'Soal berikutnya' : 'Lihat hasil', 'primary', function () {
          idx++;
          if (idx < questions.length) showQuestion();
          else finish();
        });
        fb.appendChild(next);
        panel.appendChild(fb);
        next.focus();
      }

      for (var o = 0; o < q.options.length; o++) {
        (function (o) {
          var ob = el('button', 'option-card lab-option');
          ob.type = 'button';
          ob.innerHTML = '<span class="option-card__key">' + keys[o] + '</span><span>' + esc(q.options[o]) + '</span>';
          ob.addEventListener('click', function () { answer(o); });
          buttons.push(ob);
          opts.appendChild(ob);
        })(o);
      }
      panel.appendChild(opts);
      body.appendChild(panel);
    }

    function finish() {
      var score = Math.round((correctCount / questions.length) * 100);
      showDebrief(body, {
        labId: 'lab01',
        score: score,
        competencies: {
          aiLiteracy: { score: score, weight: 1 },
          criticalThinking: { score: score, weight: 1 }
        },
        rows: [{ label: 'Jawaban benar', val: correctCount + '/' + questions.length }],
        concept: [
          'Setiap pola punya <strong>aturan</strong> — mengenali pola berarti menemukan aturannya, bukan menghafal gambarnya.',
          '<strong>Model AI juga bekerja dengan menemukan pola dari data — tapi pola yang tampak cocok belum tentu aturan sebenarnya.</strong>',
          'Di soal jebakan, dua aturan berbeda sama-sama cocok dengan data awal. Kesimpulan yang jujur: "informasi belum cukup".',
          'Makin banyak data (contoh), makin yakin kita membedakan aturan yang benar dari yang kebetulan cocok.'
        ]
      });
    }

    showQuestion();
  }

  /* ============================================================
     LAB 02 — TRAINING DATA
     ============================================================ */
  function renderLab02(main) {
    var D = SIGAP.data.aiLab.lab02;
    labHeader(main, 'lab02',
      'Model AI belajar dari contoh berlabel. Di lab ini KAMU yang jadi pemberi label — lalu lihat ' +
      'model meniru apa pun yang kamu ajarkan, termasuk kesalahanmu.');

    var body = el('div', 'stack');
    main.appendChild(body);

    var labels = {}; // cardId -> 'kucing' | 'anjing'
    var labelingScore = 0; // 0-100 dari kartu jelas
    var quizCorrect = 0;

    /* ---- Tahap 1: pelabelan ---- */
    function stepLabel() {
      body.innerHTML = '';
      body.appendChild(SIGAP.ui.phaseSteps(['LABELI DATA', 'LATIH MODEL', 'EKSPERIMEN', 'KUIS'], 0));

      var panel = el('div', 'panel panel--accent stack');
      panel.appendChild(el('div', 'panel-title', 'Tahap 1 — Labeli 10 kartu data latihan'));
      panel.appendChild(el('p', 'text-sm text-muted',
        'Masukkan tiap kartu ke <strong>Keranjang Kucing</strong> atau <strong>Keranjang Anjing</strong>. ' +
        'Beberapa kartu sengaja ambigu — putuskan sebisamu; nanti kita lihat akibatnya pada model.'));

      var counter = el('div', 'text-sm text-mono lab-count');
      panel.appendChild(counter);

      var grid = el('div', 'lab-cards');
      for (var i = 0; i < D.trainCards.length; i++) {
        (function (card) {
          var c = el('div', 'lab-datacard');
          c.appendChild(el('div', 'lab-datacard__emoji', card.emoji));
          c.appendChild(el('div', 'lab-datacard__name', esc(card.name)));
          if (card.note) c.appendChild(el('div', 'lab-datacard__note text-xs text-amber', '⚠ ' + esc(card.note)));

          var choices = el('div', 'lab-datacard__choices');
          choices.setAttribute('role', 'group');
          choices.setAttribute('aria-label', 'Label untuk ' + card.name);
          var catBtns = [];
          for (var k = 0; k < D.categories.length; k++) {
            (function (cat) {
              var cb = el('button', 'lab-basket-btn');
              cb.type = 'button';
              cb.setAttribute('aria-pressed', 'false');
              cb.innerHTML = cat.emoji + ' ' + esc(cat.short);
              cb.addEventListener('click', function () {
                if (SIGAP.audio) SIGAP.audio.sfx('click');
                labels[card.id] = cat.id;
                for (var b = 0; b < catBtns.length; b++) {
                  var on = catBtns[b] === cb;
                  catBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false');
                  catBtns[b].classList.toggle('lab-basket-btn--on', on);
                }
                refresh();
              });
              catBtns.push(cb);
              choices.appendChild(cb);
            })(D.categories[k]);
          }
          c.appendChild(choices);
          grid.appendChild(c);
        })(D.trainCards[i]);
      }
      panel.appendChild(grid);

      var trainBtn = btn('🔬 Latih Model', 'primary', function () { stepTrain(); });
      trainBtn.disabled = true;
      panel.appendChild(trainBtn);

      function refresh() {
        var n = 0;
        for (var i = 0; i < D.trainCards.length; i++) if (labels[D.trainCards[i].id]) n++;
        counter.textContent = 'Terlabel: ' + n + '/' + D.trainCards.length;
        trainBtn.disabled = n < D.trainCards.length;
      }
      refresh();
      body.appendChild(panel);
    }

    /* ---- Simulasi model: mayoritas label pemain per "kemiripan" (kind) ---- */
    function predict(testCard) {
      var votes = { kucing: 0, anjing: 0 };
      var mislabeled = [];
      for (var i = 0; i < D.trainCards.length; i++) {
        var tc = D.trainCards[i];
        if (tc.kind !== testCard.kind) continue;
        if (labels[tc.id]) votes[labels[tc.id]]++;
        if (tc.clear && labels[tc.id] && labels[tc.id] !== tc.truth) mislabeled.push(tc);
      }
      var pred;
      if (votes.kucing === votes.anjing) pred = null; // bimbang
      else pred = votes.kucing > votes.anjing ? 'kucing' : 'anjing';
      return { pred: pred, votes: votes, mislabeled: mislabeled };
    }

    /* ---- Tahap 2: latih + prediksi ---- */
    function stepTrain() {
      // skor pelabelan: hanya kartu jelas yang dinilai
      var clearTotal = 0, clearOk = 0;
      for (var i = 0; i < D.trainCards.length; i++) {
        var tc = D.trainCards[i];
        if (!tc.clear) continue;
        clearTotal++;
        if (labels[tc.id] === tc.truth) clearOk++;
      }
      labelingScore = Math.round((clearOk / clearTotal) * 100);

      body.innerHTML = '';
      body.appendChild(SIGAP.ui.phaseSteps(['LABELI DATA', 'LATIH MODEL', 'EKSPERIMEN', 'KUIS'], 1));

      var panel = el('div', 'panel panel--accent stack');
      panel.appendChild(el('div', 'panel-title', 'Tahap 2 — Melatih model dari labelmu'));
      panel.appendChild(el('div', 'sim-label lab-sim-label',
        'SIMULASI — model sederhana untuk belajar, bukan AI nyata'));

      var prog = el('div', 'stack');
      prog.appendChild(el('p', 'text-sm text-mono lab-train-status', 'Membaca 10 contoh berlabel…'));
      var m = meterEl(8, '');
      prog.appendChild(m);
      panel.appendChild(prog);
      body.appendChild(panel);

      var fill = m.querySelector('.meter__fill');
      var status = prog.querySelector('.lab-train-status');
      if (SIGAP.audio) SIGAP.audio.sfx('scan');
      later(function () { fill.style.width = '55%'; status.textContent = 'Mencari pola dari contohmu…'; }, 600);
      later(function () { fill.style.width = '100%'; status.textContent = 'Model selesai dilatih. Menguji pada data BARU…'; }, 1300);
      later(function () { showPredictions(panel); }, 2000);
    }

    function showPredictions(panel) {
      var results = el('div', 'stack');
      results.appendChild(el('p', 'text-sm',
        'Model sekarang menebak 4 kartu yang <strong>tidak ada</strong> di data latihan. ' +
        'Perhatikan: tebakannya bersumber dari labelmu.'));

      var anyError = false;
      for (var i = 0; i < D.testCards.length; i++) {
        var t = D.testCards[i];
        var r = predict(t);
        var row = el('div', 'lab-pred');
        var predLabel = r.pred === null ? 'BINGUNG (contoh imbang)' : r.pred.toUpperCase();
        var verdictHtml, noteHtml;
        if (t.truth === null) {
          verdictHtml = '<span class="tag tag--purple">TANPA KUNCI JAWABAN</span>';
          noteHtml = 'Model hanya mengikuti label yang kamu berikan pada contoh serupa (' +
            esc(predLabel.toLowerCase()) + '). Ia tidak tahu "kebenaran" di luar contohmu.';
        } else if (r.pred === t.truth) {
          verdictHtml = '<span class="tag tag--green">SESUAI</span>';
          noteHtml = 'Contoh sejenis kamu labeli dengan benar → prediksi ikut benar.';
        } else {
          anyError = true;
          verdictHtml = '<span class="tag tag--red">MELESET</span>';
          noteHtml = r.mislabeled.length
            ? 'Kesalahan ini <strong>berasal dari labelmu</strong>: ' +
              esc(r.mislabeled.map(function (mc) { return mc.name; }).join(', ')) +
              ' kamu masukkan ke keranjang yang keliru, dan model menirunya.'
            : 'Contoh sejenis di data latihanmu membingungkan model.';
        }
        row.innerHTML =
          '<span class="lab-pred__emoji" aria-hidden="true">' + t.emoji + '</span>' +
          '<div class="lab-pred__body"><div><strong>' + esc(t.name) + '</strong> → prediksi model: ' +
          '<span class="text-mono text-cyan">' + esc(predLabel) + '</span> ' + verdictHtml + '</div>' +
          '<div class="text-xs text-muted">' + noteHtml + '</div></div>';
        results.appendChild(row);
      }

      results.appendChild(el('p', 'text-sm ' + (anyError ? 'text-amber' : 'text-success'),
        anyError
          ? '⚠ Model mengulangi kesalahan labelmu. Model tidak "salah sendiri" — ia belajar persis dari contoh yang diberikan.'
          : '✔ Labelmu pada kartu jelas rapi, jadi prediksi model ikut rapi. Tapi apa yang terjadi kalau labelnya sengaja dibuat salah?'));

      results.appendChild(btn('Lanjut: eksperimen label salah', 'primary', function () { stepBadExperiment(); }));
      panel.appendChild(results);
    }

    /* ---- Tahap 3: eksperimen terkontrol label salah ---- */
    function stepBadExperiment() {
      body.innerHTML = '';
      body.appendChild(SIGAP.ui.phaseSteps(['LABELI DATA', 'LATIH MODEL', 'EKSPERIMEN', 'KUIS'], 2));

      var E = D.badExperiment;
      var panel = el('div', 'panel panel--accent stack');
      panel.appendChild(el('div', 'panel-title', 'Tahap 3 — Eksperimen terkontrol: 2 label sengaja salah'));
      panel.appendChild(el('div', 'sim-label lab-sim-label',
        'SIMULASI — model sederhana untuk belajar, bukan AI nyata'));
      panel.appendChild(el('p', 'text-sm text-muted', esc(E.intro)));

      var ds = el('div', 'lab-cards lab-cards--compact');
      for (var i = 0; i < E.dataset.length; i++) {
        var d = E.dataset[i];
        var c = el('div', 'lab-datacard' + (d.wrong ? ' lab-datacard--bad' : ''));
        c.innerHTML =
          '<div class="lab-datacard__emoji">' + d.emoji + '</div>' +
          '<div class="lab-datacard__name">' + esc(d.name) + '</div>' +
          '<div class="text-xs ' + (d.wrong ? 'text-danger' : 'text-muted') + '">label: "' + esc(d.given) + '"' +
          (d.wrong ? ' ✖ SALAH' : '') + '</div>';
        ds.appendChild(c);
      }
      panel.appendChild(ds);

      var runBtn = btn('▶ Jalankan eksperimen', 'primary', function () {
        runBtn.disabled = true;
        if (SIGAP.audio) SIGAP.audio.sfx('scan');
        later(function () {
          var out = el('div', 'stack');
          for (var j = 0; j < E.result.length; j++) {
            var r = E.result[j];
            var row = el('div', 'lab-pred');
            row.innerHTML =
              '<span class="lab-pred__emoji" aria-hidden="true">' + r.emoji + '</span>' +
              '<div class="lab-pred__body"><div><strong>' + esc(r.name) + '</strong> → prediksi model: ' +
              '<span class="text-mono text-cyan">' + esc(r.pred.toUpperCase()) + '</span> ' +
              (r.ok ? '<span class="tag tag--green">SESUAI</span>' : '<span class="tag tag--red">MELESET</span>') +
              '</div><div class="text-xs text-muted">' + esc(r.note) + '</div></div>';
            out.appendChild(row);
          }
          out.appendChild(el('div', 'panel lab-lesson', '💡 ' + esc(E.lesson)));
          out.appendChild(btn('Lanjut ke kuis singkat', 'primary', function () { stepQuiz(0); }));
          panel.appendChild(out);
          if (SIGAP.audio) SIGAP.audio.sfx('warning');
        }, 900);
      });
      panel.appendChild(runBtn);
      body.appendChild(panel);
    }

    /* ---- Tahap 4: kuis 2 soal ---- */
    function stepQuiz(qi) {
      body.innerHTML = '';
      body.appendChild(SIGAP.ui.phaseSteps(['LABELI DATA', 'LATIH MODEL', 'EKSPERIMEN', 'KUIS'], 3));
      renderQuizQuestion(body, D.quiz, qi, function (ok) {
        if (ok) quizCorrect++;
        if (qi + 1 < D.quiz.length) stepQuiz(qi + 1);
        else finish();
      });
    }

    function finish() {
      var quizScore = Math.round((quizCorrect / D.quiz.length) * 100);
      var score = Math.round(0.5 * labelingScore + 0.5 * quizScore);
      showDebrief(body, {
        labId: 'lab02',
        score: score,
        competencies: { aiLiteracy: { score: score, weight: 1.5 } },
        rows: [
          { label: 'Ketepatan label (kartu jelas) — 50%', val: labelingScore + '/100' },
          { label: 'Kuis pemahaman — 50%', val: quizCorrect + '/' + D.quiz.length }
        ],
        concept: [
          'Model AI belajar dari <strong>contoh berlabel</strong> — ia meniru pola dari label yang diberikan manusia.',
          'Label salah → model mengulang kesalahan yang sama. Ia tidak punya cara sendiri untuk tahu label mana yang keliru.',
          'Prinsip <strong>"garbage in, garbage out"</strong>: kualitas data latihan menentukan kualitas hasil model.',
          'Kartu ambigu (rubah, serigala) menunjukkan: dunia nyata tidak selalu pas dengan dua kategori — keputusan pelabel manusia ikut membentuk "pandangan" model.'
        ]
      });
    }

    stepLabel();
  }

  /* ============================================================
     LAB 03 — AI BIAS (SIMULASI KONSEPTUAL)
     ============================================================ */
  function renderLab03(main) {
    var D = SIGAP.data.aiLab.lab03;
    labHeader(main, 'lab03',
      'Kalau satu kelompok jarang muncul di data latihan, performa model untuk kelompok itu bisa turun — ' +
      'walau angka rata-rata masih terlihat bagus. Coba sendiri dengan slider di bawah.',
      'SIMULASI KONSEPTUAL');

    var body = el('div', 'stack');
    main.appendChild(body);

    var quizCorrect = 0;

    // Rumus sederhana (disederhanakan untuk pembelajaran):
    // performa kelompok = 52 + 46 * sqrt(porsi kelompok di data latihan)
    function perf(share) {
      return Math.min(98, Math.round(52 + 46 * Math.sqrt(share)));
    }

    function stepSimulation() {
      body.innerHTML = '';
      body.appendChild(SIGAP.ui.phaseSteps(['EKSPLORASI', 'KUIS'], 0));

      var panel = el('div', 'panel panel--accent stack');
      panel.appendChild(el('div', 'panel-title', 'Eksperimen — komposisi data latihan'));

      var gA = D.groups[0], gB = D.groups[1];

      var field = el('div', 'field');
      var sliderId = 'lab3-share';
      field.appendChild(el('label', 'field__label',
        'Porsi <strong>' + gA.emoji + ' ' + esc(gA.label) + '</strong> di data latihan (sisanya = ' +
        gB.emoji + ' ' + esc(gB.label) + ')'));
      var slider = el('input', 'lab-share-slider');
      slider.type = 'range';
      slider.id = sliderId;
      slider.min = '10'; slider.max = '90'; slider.step = '5'; slider.value = '80';
      slider.setAttribute('aria-label', 'Porsi ' + gA.label + ' dalam persen');
      field.appendChild(slider);
      panel.appendChild(field);

      var readout = el('div', 'stack lab-bias-readout');
      panel.appendChild(readout);

      panel.appendChild(el('p', 'lab-disclaimer text-xs', '⚠ ' + esc(D.disclaimer)));

      var explored = { lo: false, hi: false };
      var hint = el('p', 'text-sm text-muted',
        'Geser slider sampai timpang (≤25% atau ≥75%) LALU sampai seimbang (sekitar 50%) untuk melihat bedanya.');
      panel.appendChild(hint);

      var nextBtn = btn('Lanjut ke kuis', 'primary', function () { stepQuiz(0); });
      nextBtn.disabled = true;
      panel.appendChild(nextBtn);

      function refresh() {
        var shareA = parseInt(slider.value, 10) / 100;
        var shareB = 1 - shareA;
        var pA = perf(shareA), pB = perf(shareB);
        var overall = Math.round(pA * shareA + pB * shareB);
        var gap = Math.abs(pA - pB);

        readout.innerHTML = '';
        function groupRow(g, share, p) {
          var row = el('div', 'stack lab-bias-group');
          row.appendChild(el('div', 'row row--between text-sm',
            '<span>' + g.emoji + ' ' + esc(g.label) + ' — <span class="text-mono">' +
            Math.round(share * 100) + '%</span> data latihan</span>' +
            '<span class="text-mono">performa ' + p + '/100</span>'));
          row.appendChild(meterEl(p, p >= 80 ? 'green' : (p >= 68 ? 'amber' : '')));
          if (p < 68) row.appendChild(el('div', 'text-xs text-danger', '▼ kurang terwakili → performa turun'));
          return row;
        }
        readout.appendChild(groupRow(gA, shareA, pA));
        readout.appendChild(groupRow(gB, shareB, pB));
        readout.appendChild(el('div', 'row row--between lab-bias-overall',
          '<span class="text-sm">Akurasi keseluruhan (rata-rata tertimbang)</span>' +
          '<span class="text-mono text-cyan">' + overall + '/100</span>'));
        readout.appendChild(el('p', 'text-xs text-muted',
          gap >= 12
            ? 'Perhatikan: angka keseluruhan masih terlihat lumayan (' + overall + '), padahal selisih antar kelompok ' +
              gap + ' poin. Rata-rata bisa menyembunyikan ketimpangan.'
            : 'Komposisi cukup seimbang → performa kedua kelompok berdekatan (selisih ' + gap + ' poin).'));

        if (shareA <= 0.25 || shareA >= 0.75) explored.hi = true;
        if (shareA >= 0.4 && shareA <= 0.6) explored.lo = true;
        if (explored.hi && explored.lo && nextBtn.disabled) {
          nextBtn.disabled = false;
          hint.innerHTML = '✔ Kamu sudah melihat kondisi timpang dan seimbang. Lanjut ke kuis kalau siap.';
          hint.className = 'text-sm text-success';
        }
      }
      slider.addEventListener('input', refresh);
      refresh();

      var flow = el('div', 'panel stack lab-bias-flow');
      flow.appendChild(el('div', 'panel-title', 'Alur konsepnya'));
      var ol = el('ol', 'lab-concept-list');
      for (var i = 0; i < D.concept.length; i++) ol.appendChild(el('li', '', esc(D.concept[i])));
      flow.appendChild(ol);

      body.appendChild(panel);
      body.appendChild(flow);
    }

    function stepQuiz(qi) {
      body.innerHTML = '';
      body.appendChild(SIGAP.ui.phaseSteps(['EKSPLORASI', 'KUIS'], 1));
      renderQuizQuestion(body, D.quiz, qi, function (ok) {
        if (ok) quizCorrect++;
        if (qi + 1 < D.quiz.length) stepQuiz(qi + 1);
        else finish();
      });
    }

    function finish() {
      var score = Math.round((quizCorrect / D.quiz.length) * 100);
      showDebrief(body, {
        labId: 'lab03',
        score: score,
        competencies: {
          aiLiteracy: { score: score, weight: 1 },
          ethicalReasoning: { score: score, weight: 1 }
        },
        rows: [{ label: 'Kuis reasoning', val: quizCorrect + '/' + D.quiz.length }],
        concept: [
          'Kelompok yang <strong>kurang terwakili</strong> di data latihan → contoh lebih sedikit → model bisa belajar kurang baik untuk kelompok itu.',
          'Akurasi keseluruhan yang tinggi TIDAK menjamin model adil — performa perlu dievaluasi <strong>per kelompok</strong>.',
          'Bias model biasanya berasal dari data dan proses pembuatannya, bukan dari "niat" mesin.',
          'Perbaikannya nyata dan bisa dilakukan: lengkapi data kelompok yang kurang, lalu uji per kelompok sebelum dipakai.'
        ],
        extraNote: D.disclaimer
      });
    }

    stepSimulation();
  }

  /* ============================================================
     LAB 04 — HUMAN OR AI?
     ============================================================ */
  function renderLab04(main) {
    var contents = SIGAP.data.aiLab.lab04;
    var INDICATORS = SIGAP.data.aiLab.lab04Indicators;
    labHeader(main, 'lab04',
      'Ini BUKAN tebak-tebakan. Untuk tiap konten: kumpulkan indikator (bukti), nilai keyakinanmu, ' +
      'baru simpulkan. Kadang jawaban paling jujur adalah "Belum Cukup Bukti".');

    var body = el('div', 'stack');
    main.appendChild(body);

    var idx = 0;
    var perContent = []; // {evidence, verdict, calibration, score}

    var VERDICTS = [
      { id: 'manusia', label: '👤 Manusia' },
      { id: 'ai', label: '🤖 AI' },
      { id: 'belum', label: '❓ Belum Cukup Bukti' }
    ];

    function showContent() {
      body.innerHTML = '';
      var K = contents[idx];
      body.appendChild(SIGAP.ui.phaseSteps(
        contents.map(function (_, i) { return 'KONTEN ' + (i + 1); }), idx));

      var panel = el('div', 'panel panel--accent stack');
      panel.appendChild(el('div', 'panel-title',
        'Konten ' + (idx + 1) + ' dari ' + contents.length + ' — ' + esc(K.type)));

      var doc = el('div', 'lab-content-doc');
      doc.appendChild(el('div', 'lab-content-doc__title', esc(K.title)));
      doc.appendChild(el('p', 'lab-content-doc__body', esc(K.body)));
      doc.appendChild(el('div', 'lab-content-doc__meta text-xs text-muted', 'ℹ Konteks: ' + esc(K.meta)));
      panel.appendChild(doc);

      // 1) checklist indikator
      panel.appendChild(el('h3', 'lab-step-title', 'Langkah 1 — Indikator apa saja yang KAMU LIHAT di konten ini?'));
      panel.appendChild(el('p', 'text-xs text-muted',
        'Centang hanya yang benar-benar ada. Memilih indikator yang tidak ada juga mengurangi skor bukti.'));
      var selected = {};
      var indWrap = el('div', 'stack lab-options');
      indWrap.setAttribute('role', 'group');
      indWrap.setAttribute('aria-label', 'Checklist indikator');
      var indBtns = {};
      for (var i = 0; i < INDICATORS.length; i++) {
        (function (ind) {
          var ib = el('button', 'option-card lab-option');
          ib.type = 'button';
          ib.setAttribute('aria-pressed', 'false');
          ib.innerHTML = '<span class="option-card__key">☐</span><span>' + esc(ind.text) + '</span>';
          ib.addEventListener('click', function () {
            if (SIGAP.audio) SIGAP.audio.sfx('click');
            selected[ind.id] = !selected[ind.id];
            ib.setAttribute('aria-pressed', selected[ind.id] ? 'true' : 'false');
            ib.classList.toggle('option-card--selected', !!selected[ind.id]);
            ib.querySelector('.option-card__key').textContent = selected[ind.id] ? '☑' : '☐';
          });
          indBtns[ind.id] = ib;
          indWrap.appendChild(ib);
        })(INDICATORS[i]);
      }
      panel.appendChild(indWrap);

      // 2) uncertainty
      panel.appendChild(el('h3', 'lab-step-title', 'Langkah 2 — Seberapa yakin kamu?'));
      var conf = SIGAP.ui.confidenceSlider({
        label: 'Keyakinanmu terhadap penilaian konten ini',
        value: 50,
        hint: 'Kalau indikatornya sedikit atau saling bertentangan, wajar untuk tidak terlalu yakin.'
      });
      panel.appendChild(conf.el);

      // 3) verdict
      panel.appendChild(el('h3', 'lab-step-title', 'Langkah 3 — Kesimpulanmu?'));
      var verdictWrap = el('div', 'row lab-verdicts');
      verdictWrap.setAttribute('role', 'group');
      verdictWrap.setAttribute('aria-label', 'Pilihan kesimpulan');
      var chosen = null;
      var vBtns = [];
      for (var v = 0; v < VERDICTS.length; v++) {
        (function (vd) {
          var vb = el('button', 'lab-verdict-btn');
          vb.type = 'button';
          vb.setAttribute('aria-pressed', 'false');
          vb.textContent = vd.label;
          vb.addEventListener('click', function () {
            if (SIGAP.audio) SIGAP.audio.sfx('click');
            chosen = vd.id;
            for (var b = 0; b < vBtns.length; b++) {
              var on = vBtns[b] === vb;
              vBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false');
              vBtns[b].classList.toggle('lab-verdict-btn--on', on);
            }
            lockBtn.disabled = false;
          });
          vBtns.push(vb);
          verdictWrap.appendChild(vb);
        })(VERDICTS[v]);
      }
      panel.appendChild(verdictWrap);

      var lockBtn = btn('Kunci penilaian', 'primary', function () {
        lockBtn.disabled = true;
        for (var id in indBtns) if (indBtns.hasOwnProperty(id)) indBtns[id].disabled = true;
        for (var b = 0; b < vBtns.length; b++) vBtns[b].disabled = true;
        scoreContent(panel, K, selected, chosen, conf.get());
      });
      lockBtn.disabled = true;
      panel.appendChild(lockBtn);
      body.appendChild(panel);
    }

    function scoreContent(panel, K, selected, chosen, confidence) {
      // Skor bukti: cocokkan pilihan dengan indikator yang benar-benar ada.
      var match = 0;
      var detail = [];
      for (var i = 0; i < INDICATORS.length; i++) {
        var ind = INDICATORS[i];
        var present = K.present.indexOf(ind.id) !== -1;
        var picked = !!selected[ind.id];
        if (present === picked) match++;
        detail.push({ ind: ind, present: present, picked: picked });
      }
      var evidenceScore = Math.round((match / INDICATORS.length) * 100);
      var verdictOk = chosen === K.verdict;
      var verdictScore = verdictOk ? 100 : 0;
      var cal = SIGAP.scoring.calibrate(verdictOk, confidence);
      // Bobot: bukti 50%, kesimpulan 35%, kalibrasi 15% — bukti lebih berat dari verdict.
      var total = Math.round(0.5 * evidenceScore + 0.35 * verdictScore + 0.15 * cal.score);
      perContent.push({ evidence: evidenceScore, verdict: verdictScore, calibration: cal.score, score: total });

      if (SIGAP.audio) SIGAP.audio.sfx(verdictOk ? 'evidence' : 'warning');

      var fb = el('div', 'panel lab-feedback stack ' + (verdictOk ? 'lab-feedback--ok' : 'lab-feedback--no'));
      fb.appendChild(el('div', 'lab-feedback__head',
        (verdictOk ? '✅ Kesimpulan didukung bukti' : '❌ Kesimpulan kurang tepat') +
        ' · skor konten: <span class="text-mono">' + total + '/100</span>'));

      var chk = el('ul', 'lab-evidence-check');
      for (var d = 0; d < detail.length; d++) {
        var it = detail[d];
        var cls, txt;
        if (it.present && it.picked) { cls = 'lab-ev--hit'; txt = '✔ Tepat — indikator ini memang ada'; }
        else if (it.present && !it.picked) { cls = 'lab-ev--miss'; txt = '✖ Terlewat — indikator ini sebenarnya ada'; }
        else if (!it.present && it.picked) { cls = 'lab-ev--false'; txt = '✖ Kurang tepat — indikator ini tidak ada di konten'; }
        else { cls = 'lab-ev--skip'; txt = '✔ Benar dilewati'; }
        chk.appendChild(el('li', 'lab-ev ' + cls,
          '<span>' + esc(it.ind.text) + '</span><span class="text-xs">' + txt + '</span>'));
      }
      fb.appendChild(chk);
      fb.appendChild(el('p', 'text-sm', '<strong>Pembahasan:</strong> ' + K.verdictExplain));
      fb.appendChild(el('p', 'text-xs text-muted',
        'Rincian: bukti ' + evidenceScore + '/100 (bobot 50%) · kesimpulan ' + verdictScore +
        '/100 (35%) · kalibrasi keyakinan ' + cal.score + '/100 (15%).'));

      var next = btn(idx + 1 < contents.length ? 'Konten berikutnya' : 'Lihat hasil lab', 'primary', function () {
        idx++;
        if (idx < contents.length) showContent();
        else finish();
      });
      fb.appendChild(next);
      panel.appendChild(fb);
      next.focus();
    }

    function finish() {
      var sum = 0, evSum = 0, vdOk = 0;
      for (var i = 0; i < perContent.length; i++) {
        sum += perContent[i].score;
        evSum += perContent[i].evidence;
        if (perContent[i].verdict === 100) vdOk++;
      }
      var score = Math.round(sum / perContent.length);
      showDebrief(body, {
        labId: 'lab04',
        score: score,
        competencies: {
          criticalThinking: { score: score, weight: 1.5 },
          aiLiteracy: { score: score, weight: 1 }
        },
        rows: [
          { label: 'Rata-rata skor bukti (bobot 50%)', val: Math.round(evSum / perContent.length) + '/100' },
          { label: 'Kesimpulan didukung bukti', val: vdOk + '/' + perContent.length },
          { label: 'Rata-rata skor konten', val: score + '/100' }
        ],
        concept: [
          'Menilai konten = mengumpulkan <strong>indikator</strong> dulu, baru menyimpulkan — bukan menebak dari kesan.',
          '"Belum Cukup Bukti" adalah kesimpulan yang sah dan kadang paling benar — terutama untuk konten pendek dan generik.',
          '<strong>Provenance</strong> = riwayat asal-usul konten: siapa membuatnya, kapan, di mana, dan lewat jalur apa ia sampai ke kita. ' +
          'Tanpa provenance, penampilan konten saja sering tidak cukup untuk memastikan manusia atau AI.',
          'Tidak ada indikator tunggal yang pasti: gaya rapi ≠ pasti AI, typo ≠ pasti manusia. Kekuatan ada pada GABUNGAN bukti.'
        ]
      });
    }

    showContent();
  }

  /* ---------- Kuis pilihan ganda bersama (lab02 & lab03) ---------- */
  function renderQuizQuestion(body, quiz, qi, onDone) {
    var q = quiz[qi];
    var panel = el('div', 'panel panel--accent stack');
    panel.appendChild(el('div', 'panel-title', 'Kuis — soal ' + (qi + 1) + ' dari ' + quiz.length));
    panel.appendChild(el('p', 'lab-quiz-q', esc(q.q)));

    var keys = ['A', 'B', 'C', 'D'];
    var buttons = [];
    var opts = el('div', 'stack lab-options');
    opts.setAttribute('role', 'group');
    opts.setAttribute('aria-label', 'Pilihan jawaban');

    for (var o = 0; o < q.options.length; o++) {
      (function (o) {
        var ob = el('button', 'option-card lab-option');
        ob.type = 'button';
        ob.innerHTML = '<span class="option-card__key">' + keys[o] + '</span><span>' + esc(q.options[o]) + '</span>';
        ob.addEventListener('click', function () {
          for (var b = 0; b < buttons.length; b++) buttons[b].disabled = true;
          var ok = o === q.correct;
          buttons[q.correct].classList.add('lab-option--correct');
          if (!ok) ob.classList.add('lab-option--wrong');
          if (SIGAP.audio) SIGAP.audio.sfx(ok ? 'success' : 'warning');
          var fb = el('div', 'panel lab-feedback stack ' + (ok ? 'lab-feedback--ok' : 'lab-feedback--no'));
          fb.appendChild(el('div', 'lab-feedback__head', ok ? '✅ BENAR' : '❌ KURANG TEPAT'));
          fb.appendChild(el('p', 'text-sm', q.explain));
          var next = btn('Lanjut', 'primary', function () { onDone(ok); });
          fb.appendChild(next);
          panel.appendChild(fb);
          next.focus();
        });
        buttons.push(ob);
        opts.appendChild(ob);
      })(o);
    }
    panel.appendChild(opts);
    body.appendChild(panel);
  }

  /* ---------- Route ---------- */
  var RENDERERS = {
    lab01: renderLab01,
    lab02: renderLab02,
    lab03: renderLab03,
    lab04: renderLab04
  };

  SIGAP.router.register('ailab', {
    title: 'AI LABORATORY',
    render: function (container, params) {
      SIGAP.ui.background(container);
      var labId = params && params.lab;
      container.appendChild(SIGAP.ui.topbar({
        crumb: labId && RENDERERS[labId] ? 'AI LAB / ' + labId.toUpperCase() : 'AI LAB',
        backTo: 'academy'
      }));
      var main = el('div', 'container screen lab-screen');
      container.appendChild(main);
      if (labId && RENDERERS[labId]) RENDERERS[labId](main);
      else renderHub(main);
    },
    onLeave: function () { clearTimers(); }
  });
})();
