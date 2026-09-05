/* ============================================================
   SIGAP — games/evidence-board.js
   Reusable evidence-connection board.

   SIGAP.games.evidenceBoard.create({
     container,                       // parent element
     nodes: [{id, label, category}],  // category: SOURCE|EVIDENCE|RISK|CONCLUSION
     validPairs: [[a,b], ...],        // REQUIRED connections (order-free)
     optionalPairs: [[a,b], ...],     // allowed but not required
     hints: [h2, h3],                 // string OR function(missingPairs) -> string
     onSolved: function(wrongAttempts) {}
   }) -> { el, destroy(), isSolved(), getWrongAttempts() }

   Interaction (touch + keyboard, no drag needed):
   - Tap/click/Enter node 1 then node 2 = connect (SVG line).
   - Repeat the same pair, or use the ✕ on the connection chip = remove.
   - "Periksa Papan" checks the reasoning chain; hints escalate per
     failed attempt and NEVER reveal the full answer.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.games = SIGAP.games || {};

  var CATEGORY_META = {
    SOURCE: { label: 'SUMBER', cls: 'eb-node--source' },
    EVIDENCE: { label: 'BUKTI', cls: 'eb-node--evidence' },
    RISK: { label: 'RISIKO', cls: 'eb-node--risk' },
    CONCLUSION: { label: 'KESIMPULAN', cls: 'eb-node--conclusion' }
  };
  var CATEGORY_ORDER = ['SOURCE', 'EVIDENCE', 'RISK', 'CONCLUSION'];

  function pairKey(a, b) {
    return a < b ? a + '|' + b : b + '|' + a;
  }

  SIGAP.games.evidenceBoard = {
    create: function (opts) {
      opts = opts || {};
      var nodes = opts.nodes || [];
      var hints = opts.hints || [];
      var nodesById = {};
      nodes.forEach(function (n) { nodesById[n.id] = n; });

      function uniq(arr) {
        return arr.filter(function (k, i) { return arr.indexOf(k) === i; });
      }
      var requiredKeys = uniq((opts.validPairs || []).map(function (p) { return pairKey(p[0], p[1]); }));
      var allowedKeys = requiredKeys.slice();
      (opts.optionalPairs || []).forEach(function (p) { allowedKeys.push(pairKey(p[0], p[1])); });
      allowedKeys = uniq(allowedKeys);

      var connections = [];      // array of keys 'a|b'
      var selectedId = null;
      var wrongAttempts = 0;
      var solved = false;
      var nodeEls = {};

      /* ---------- structure ---------- */
      var root = document.createElement('div');
      root.className = 'eb-board';

      var help = document.createElement('p');
      help.className = 'eb-help';
      help.textContent =
        'Susun rantai penalaranmu: pilih satu node, lalu pilih node lain untuk menghubungkannya. ' +
        'Pilih pasangan yang sama lagi (atau tombol ✕ di daftar) untuk menghapus hubungan.';
      root.appendChild(help);

      var legend = document.createElement('div');
      legend.className = 'eb-legend';
      legend.setAttribute('aria-hidden', 'true');
      CATEGORY_ORDER.forEach(function (cat) {
        var chip = document.createElement('span');
        chip.className = 'eb-legend__item ' + CATEGORY_META[cat].cls;
        chip.textContent = CATEGORY_META[cat].label;
        legend.appendChild(chip);
      });
      root.appendChild(legend);

      var canvas = document.createElement('div');
      canvas.className = 'eb-canvas';
      root.appendChild(canvas);

      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'eb-svg');
      svg.setAttribute('aria-hidden', 'true');
      canvas.appendChild(svg);

      var cols = document.createElement('div');
      cols.className = 'eb-columns';
      canvas.appendChild(cols);

      CATEGORY_ORDER.forEach(function (cat) {
        var catNodes = nodes.filter(function (n) { return n.category === cat; });
        if (!catNodes.length) return;
        var col = document.createElement('div');
        col.className = 'eb-col';
        var title = document.createElement('div');
        title.className = 'eb-col__title';
        title.textContent = CATEGORY_META[cat].label;
        col.appendChild(title);
        catNodes.forEach(function (n) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'eb-node ' + CATEGORY_META[cat].cls;
          btn.dataset.nodeId = n.id;
          btn.setAttribute('aria-pressed', 'false');
          btn.setAttribute('aria-label', CATEGORY_META[cat].label + ': ' + n.label);
          btn.textContent = n.label;
          btn.addEventListener('click', function () { onNodeClick(n.id); });
          nodeEls[n.id] = btn;
          col.appendChild(btn);
        });
        cols.appendChild(col);
      });

      // Live status for screen readers + visible helper.
      var status = document.createElement('p');
      status.className = 'eb-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.textContent = 'Belum ada hubungan. Pilih node pertama.';
      root.appendChild(status);

      var connListTitle = document.createElement('div');
      connListTitle.className = 'eb-conn-title';
      connListTitle.textContent = 'Hubungan yang kamu buat:';
      root.appendChild(connListTitle);

      var connList = document.createElement('ul');
      connList.className = 'eb-conn-list';
      root.appendChild(connList);

      var feedback = document.createElement('div');
      feedback.className = 'eb-feedback';
      feedback.setAttribute('aria-live', 'polite');
      root.appendChild(feedback);

      var actions = document.createElement('div');
      actions.className = 'eb-actions';
      var checkBtn = document.createElement('button');
      checkBtn.type = 'button';
      checkBtn.className = 'btn btn--primary';
      checkBtn.textContent = 'Periksa Papan';
      checkBtn.addEventListener('click', check);
      actions.appendChild(checkBtn);
      root.appendChild(actions);

      /* ---------- interaction ---------- */
      function onNodeClick(id) {
        if (solved) return;
        if (SIGAP.audio) SIGAP.audio.sfx('click');
        if (!selectedId) {
          selectedId = id;
          setSelected(id, true);
          status.textContent = 'Node "' + nodesById[id].label + '" dipilih. Pilih node kedua untuk menghubungkan.';
          return;
        }
        if (selectedId === id) {
          setSelected(id, false);
          selectedId = null;
          status.textContent = 'Pilihan dibatalkan.';
          return;
        }
        var key = pairKey(selectedId, id);
        var idx = connections.indexOf(key);
        if (idx !== -1) {
          connections.splice(idx, 1);
          status.textContent = 'Hubungan "' + describeKey(key) + '" dihapus.';
        } else {
          connections.push(key);
          if (SIGAP.audio) SIGAP.audio.sfx('scan');
          status.textContent = 'Terhubung: ' + describeKey(key) + '.';
        }
        setSelected(selectedId, false);
        selectedId = null;
        refresh();
      }

      function setSelected(id, on) {
        var el = nodeEls[id];
        if (!el) return;
        el.classList.toggle('eb-node--selected', on);
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
      }

      function describeKey(key) {
        var parts = key.split('|');
        var a = nodesById[parts[0]], b = nodesById[parts[1]];
        return (a ? a.label : parts[0]) + ' ↔ ' + (b ? b.label : parts[1]);
      }

      function removeConn(key) {
        if (solved) return;
        var idx = connections.indexOf(key);
        if (idx !== -1) {
          connections.splice(idx, 1);
          status.textContent = 'Hubungan "' + describeKey(key) + '" dihapus.';
          refresh();
        }
      }

      /* ---------- rendering ---------- */
      function refresh() {
        renderConnList();
        drawLines();
      }

      function renderConnList() {
        connList.innerHTML = '';
        if (!connections.length) {
          var empty = document.createElement('li');
          empty.className = 'eb-conn eb-conn--empty';
          empty.textContent = 'Belum ada hubungan.';
          connList.appendChild(empty);
          return;
        }
        connections.forEach(function (key) {
          var li = document.createElement('li');
          li.className = 'eb-conn';
          var label = document.createElement('span');
          label.textContent = describeKey(key);
          li.appendChild(label);
          if (!solved) {
            var rm = document.createElement('button');
            rm.type = 'button';
            rm.className = 'eb-conn__remove';
            rm.setAttribute('aria-label', 'Hapus hubungan ' + describeKey(key));
            rm.textContent = '✕';
            rm.addEventListener('click', function () { removeConn(key); });
            li.appendChild(rm);
          }
          connList.appendChild(li);
        });
      }

      function drawLines() {
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        var base = canvas.getBoundingClientRect();
        if (!base.width) return;
        svg.setAttribute('viewBox', '0 0 ' + base.width + ' ' + base.height);
        connections.forEach(function (key) {
          var parts = key.split('|');
          var elA = nodeEls[parts[0]], elB = nodeEls[parts[1]];
          if (!elA || !elB) return;
          var ra = elA.getBoundingClientRect(), rb = elB.getBoundingClientRect();
          var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', ra.left - base.left + ra.width / 2);
          line.setAttribute('y1', ra.top - base.top + ra.height / 2);
          line.setAttribute('x2', rb.left - base.left + rb.width / 2);
          line.setAttribute('y2', rb.top - base.top + rb.height / 2);
          line.setAttribute('class', 'eb-line' + (solved ? ' eb-line--ok' : ''));
          svg.appendChild(line);
        });
      }

      /* ---------- checking + escalating hints ---------- */
      function missingPairs() {
        return requiredKeys.filter(function (k) { return connections.indexOf(k) === -1; });
      }

      function invalidConnections() {
        return connections.filter(function (k) { return allowedKeys.indexOf(k) === -1; });
      }

      function hintText(idx, missing) {
        var h = hints[idx];
        if (!h) return '';
        if (typeof h === 'function') {
          var readable = missing.map(function (key) {
            var parts = key.split('|');
            return [
              nodesById[parts[0]] ? nodesById[parts[0]].label : parts[0],
              nodesById[parts[1]] ? nodesById[parts[1]].label : parts[1]
            ];
          });
          return h(readable);
        }
        return String(h);
      }

      function check() {
        if (solved) return;
        var missing = missingPairs();
        var invalid = invalidConnections();

        if (!missing.length && !invalid.length) {
          solved = true;
          feedback.className = 'eb-feedback eb-feedback--ok';
          feedback.textContent = '✔ Rantai penalaranmu utuh: setiap hubungan didukung bukti.';
          if (SIGAP.audio) SIGAP.audio.sfx('success');
          checkBtn.disabled = true;
          Object.keys(nodeEls).forEach(function (id) { nodeEls[id].disabled = true; });
          refresh();
          if (typeof opts.onSolved === 'function') opts.onSolved(wrongAttempts);
          return;
        }

        wrongAttempts += 1;
        if (SIGAP.audio) SIGAP.audio.sfx('warning');

        var msg = [];
        if (missing.length) {
          msg.push(missing.length + ' hubungan penting belum terbentuk.');
        }
        if (invalid.length) {
          msg.push(invalid.length + ' hubungan tidak didukung bukti — coba hapus yang tidak bisa kamu jelaskan.');
        }

        // Escalating hints: attempt 1 = no hint, attempt 2 = hints[0],
        // attempt 3+ = hints[1]. Never the full answer.
        var hint = '';
        if (wrongAttempts >= 3) hint = hintText(1, missing) || hintText(0, missing);
        else if (wrongAttempts === 2) hint = hintText(0, missing);

        feedback.className = 'eb-feedback eb-feedback--warn';
        feedback.innerHTML = '';
        var p1 = document.createElement('p');
        p1.textContent = 'Papan belum meyakinkan. ' + msg.join(' ');
        feedback.appendChild(p1);
        if (hint) {
          var p2 = document.createElement('p');
          p2.className = 'eb-hint';
          p2.textContent = '💡 Petunjuk: ' + hint;
          feedback.appendChild(p2);
        }
      }

      /* ---------- lifecycle ---------- */
      function onResize() { drawLines(); }
      window.addEventListener('resize', onResize);

      if (opts.container) opts.container.appendChild(root);
      refresh();
      // Redraw once layout settles (fonts, flex wrap).
      var raf = window.requestAnimationFrame(function () { drawLines(); });

      return {
        el: root,
        isSolved: function () { return solved; },
        getWrongAttempts: function () { return wrongAttempts; },
        destroy: function () {
          window.removeEventListener('resize', onResize);
          if (raf) window.cancelAnimationFrame(raf);
          if (root.parentNode) root.parentNode.removeChild(root);
        }
      };
    }
  };
})();
