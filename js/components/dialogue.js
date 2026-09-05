/* ============================================================
   SIGAP — components/dialogue.js
   Dialogue system: portrait, name, typewriter text, Next/Skip,
   optional narration (▶ Dengarkan / ⏸ / 🔇). Subtitles always on.
   SIGAP.ui.dialogue.play(lines, { onEnd })
   line = { speaker: 'aruna'|'phantom'|'system', text: '...', voice?: 'aruna/x.mp3' }
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.ui = SIGAP.ui || {};

  var SPEAKERS = {
    aruna: { name: 'Dr. Aruna', cls: '' },
    phantom: { name: 'PHANTOM', cls: 'phantom' },
    system: { name: 'SIGAP SYSTEM', cls: 'system' },
    player: { name: 'Kamu', cls: 'player' }
  };

  function portraitSvg(speaker) {
    if (speaker === 'aruna') {
      return '<svg viewBox="0 0 72 72" role="img" aria-label="Potret Dr. Aruna">' +
        '<rect width="72" height="72" fill="#101a2a"/>' +
        '<circle cx="36" cy="27" r="13" fill="#1e2f4a"/>' +
        '<circle cx="36" cy="27" r="13" fill="none" stroke="#37c8dd" stroke-width="1.5"/>' +
        '<path d="M14 66c2-14 10-21 22-21s20 7 22 21" fill="#1e2f4a" stroke="#37c8dd" stroke-width="1.5"/>' +
        '<rect x="25" y="23" width="9" height="7" rx="2" fill="none" stroke="#37c8dd" stroke-width="1.4"/>' +
        '<rect x="38" y="23" width="9" height="7" rx="2" fill="none" stroke="#37c8dd" stroke-width="1.4"/>' +
        '<line x1="34" y1="26" x2="38" y2="26" stroke="#37c8dd" stroke-width="1.4"/>' +
        '<path d="M23 18c3-6 9-8 13-8s10 2 13 8" fill="none" stroke="#8fa2b8" stroke-width="2"/>' +
        '</svg>';
    }
    if (speaker === 'phantom') {
      return '<svg viewBox="0 0 72 72" role="img" aria-label="Siluet PHANTOM">' +
        '<rect width="72" height="72" fill="#0d0a1a"/>' +
        '<path d="M20 62V36c0-12 7-20 16-20s16 8 16 20v26" fill="#181231" stroke="#8e7bf0" stroke-width="1.5"/>' +
        '<ellipse cx="30" cy="36" rx="3.5" ry="2" fill="#8e7bf0"/>' +
        '<ellipse cx="42" cy="36" rx="3.5" ry="2" fill="#8e7bf0"/>' +
        '<line x1="16" y1="50" x2="56" y2="50" stroke="#8e7bf0" stroke-width="0.8" opacity="0.5"/>' +
        '<line x1="18" y1="54" x2="54" y2="54" stroke="#8e7bf0" stroke-width="0.5" opacity="0.35"/>' +
        '</svg>';
    }
    if (speaker === 'player') {
      return '<svg viewBox="0 0 72 72" role="img" aria-label="Avatar agen">' +
        '<rect width="72" height="72" fill="#101a2a"/>' +
        '<circle cx="36" cy="28" r="12" fill="#1e2f4a" stroke="#e8a33d" stroke-width="1.5"/>' +
        '<path d="M15 66c2-13 10-20 21-20s19 7 21 20" fill="#1e2f4a" stroke="#e8a33d" stroke-width="1.5"/>' +
        '</svg>';
    }
    return '<svg viewBox="0 0 72 72" role="img" aria-label="Ikon sistem">' +
      '<rect width="72" height="72" fill="#0c1420"/>' +
      '<rect x="14" y="18" width="44" height="32" rx="3" fill="none" stroke="#37c8dd" stroke-width="1.5"/>' +
      '<text x="20" y="40" fill="#37c8dd" font-family="monospace" font-size="16">&gt;_</text>' +
      '<line x1="26" y1="56" x2="46" y2="56" stroke="#37c8dd" stroke-width="1.5"/>' +
      '</svg>';
  }

  var active = null; // { destroy() }

  function reducedMotion() {
    var s = SIGAP.state.get();
    return s.settings.reducedMotion ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  SIGAP.ui.dialogue = {
    /**
     * Play a sequence of dialogue lines. Only one dialogue at a time.
     */
    play: function (lines, opts) {
      opts = opts || {};
      SIGAP.ui.dialogue.stop();
      if (!lines || !lines.length) {
        if (opts.onEnd) opts.onEnd();
        return;
      }

      var root = document.getElementById('dialogue-root');
      var idx = 0;
      var typing = null;
      var narrating = false;

      var overlay = document.createElement('div');
      overlay.className = 'dialogue-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-label', 'Dialog');

      var box = document.createElement('div');
      box.className = 'dialogue-box';
      overlay.appendChild(box);
      root.appendChild(overlay);

      function renderLine() {
        var line = lines[idx];
        var sp = SPEAKERS[line.speaker] || SPEAKERS.system;
        var isPhantom = line.speaker === 'phantom';
        box.className = 'dialogue-box' + (isPhantom ? ' dialogue-box--phantom phantom-glitch' : '');
        if (isPhantom && SIGAP.audio) SIGAP.audio.sfx('phantom');

        box.innerHTML =
          '<div class="dialogue__portrait">' + portraitSvg(line.speaker) + '</div>' +
          '<div class="dialogue__content">' +
          '<div class="dialogue__name' + (isPhantom ? ' dialogue__name--phantom' : '') + '">' + sp.name + '</div>' +
          '<p class="dialogue__text" aria-live="polite"></p>' +
          '<div class="dialogue__controls"></div>' +
          '</div>';

        var textEl = box.querySelector('.dialogue__text');
        var controls = box.querySelector('.dialogue__controls');
        var fullText = line.text;

        // Narration (optional, never autoplays before user gesture problems —
        // dialogue itself is opened from a user action).
        if (line.voice && SIGAP.audio.isNarrationOn()) {
          SIGAP.audio.playNarration(line.voice);
          narrating = true;
        }

        // Typewriter (skipped under reduced motion).
        var done = false;
        function finishTyping() {
          if (typing) { clearInterval(typing); typing = null; }
          textEl.textContent = fullText;
          done = true;
        }
        if (reducedMotion()) {
          finishTyping();
        } else {
          var i = 0;
          typing = setInterval(function () {
            i += 2;
            textEl.textContent = fullText.slice(0, i);
            if (i >= fullText.length) finishTyping();
          }, 18);
        }

        // Controls
        var nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn--primary btn--sm';
        nextBtn.textContent = idx === lines.length - 1 ? 'Selesai' : 'Lanjut ▸';
        nextBtn.addEventListener('click', function () {
          if (SIGAP.audio) SIGAP.audio.sfx('click');
          if (!done) { finishTyping(); return; }
          next();
        });

        var skipBtn = document.createElement('button');
        skipBtn.className = 'btn btn--ghost btn--sm';
        skipBtn.textContent = 'Lewati semua';
        skipBtn.addEventListener('click', function () { end(); });

        controls.appendChild(nextBtn);
        controls.appendChild(skipBtn);

        if (line.voice) {
          var voiceBtn = document.createElement('button');
          voiceBtn.className = 'btn btn--ghost btn--sm';
          voiceBtn.setAttribute('aria-label', 'Putar atau jeda narasi suara');
          voiceBtn.textContent = narrating ? '⏸ Jeda' : '▶ Dengarkan';
          voiceBtn.addEventListener('click', function () {
            if (!SIGAP.audio.isNarrationOn()) {
              SIGAP.ui.toast('Narasi sedang dimatikan. Aktifkan di pengaturan.', 'info');
              return;
            }
            if (narrating) {
              SIGAP.audio.pauseNarration();
              narrating = false;
              voiceBtn.textContent = '▶ Dengarkan';
            } else {
              SIGAP.audio.playNarration(line.voice);
              narrating = true;
              voiceBtn.textContent = '⏸ Jeda';
            }
          });
          controls.appendChild(voiceBtn);
        }

        var progress = document.createElement('span');
        progress.className = 'dialogue__progress';
        progress.textContent = (idx + 1) + ' / ' + lines.length;
        controls.appendChild(progress);

        nextBtn.focus();
      }

      function next() {
        SIGAP.audio.stopNarration();
        narrating = false;
        idx++;
        if (idx >= lines.length) end();
        else renderLine();
      }

      function onKey(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var tag = (document.activeElement && document.activeElement.tagName) || '';
          if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA') return;
          e.preventDefault();
          var btn = box.querySelector('.btn--primary');
          if (btn) btn.click();
        } else if (e.key === 'Escape') {
          end();
        }
      }

      var ended = false;
      function end(silent) {
        if (ended) return;
        ended = true;
        if (typing) clearInterval(typing);
        SIGAP.audio.stopNarration();
        document.removeEventListener('keydown', onKey);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        active = null;
        if (!silent && opts.onEnd) {
          try { opts.onEnd(); } catch (e) { if (window.console) console.error(e); }
        }
      }

      document.addEventListener('keydown', onKey);
      active = { destroy: end };
      renderLine();
    },

    stop: function () {
      if (active) {
        // Destroy silently: abandoned dialogues must not fire onEnd callbacks.
        active.destroy(true);
      }
      var root = document.getElementById('dialogue-root');
      if (root) root.innerHTML = '';
    },

    isActive: function () { return !!active; }
  };
})();
