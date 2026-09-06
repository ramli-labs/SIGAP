/* ============================================================
   SIGAP - audio.js
   Procedural SFX via WebAudio (no asset files required) +
   optional narration player with graceful fallback.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};

  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null;
  var unlocked = false;

  function ensureCtx() {
    if (!AC) return null;
    if (!ctx) {
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') { ctx.resume().catch(function () {}); }
    return ctx;
  }

  // Unlock audio on first user gesture (autoplay policies).
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    ensureCtx();
  }
  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
  document.addEventListener('keydown', unlock, { once: true, capture: true });

  function soundOn() {
    var s = SIGAP.state && SIGAP.state.get();
    return !s || s.settings.sound !== false;
  }

  function env(gainNode, t0, peak, dur) {
    gainNode.gain.setValueAtTime(0.0001, t0);
    gainNode.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }

  function tone(opts) {
    var c = ensureCtx();
    if (!c) return;
    var t0 = c.currentTime + (opts.delay || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.from, t0);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + (opts.dur || 0.2));
    env(g, t0, opts.gain || 0.08, opts.dur || 0.2);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + (opts.dur || 0.2) + 0.05);
  }

  function noise(opts) {
    var c = ensureCtx();
    if (!c) return;
    var dur = opts.dur || 0.15;
    var t0 = c.currentTime + (opts.delay || 0);
    var buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    var src = c.createBufferSource();
    src.buffer = buf;
    var filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = opts.freq || 1200;
    var g = c.createGain();
    g.gain.value = opts.gain || 0.05;
    src.connect(filter).connect(g).connect(c.destination);
    src.start(t0);
  }

  var SFX = {
    click: function () { tone({ type: 'square', from: 820, to: 640, dur: 0.06, gain: 0.045 }); },
    scan: function () {
      tone({ type: 'sawtooth', from: 280, to: 1400, dur: 0.6, gain: 0.035 });
      noise({ freq: 2400, dur: 0.5, gain: 0.02 });
    },
    evidence: function () {
      tone({ type: 'sine', from: 620, dur: 0.12, gain: 0.07 });
      tone({ type: 'sine', from: 930, dur: 0.16, gain: 0.07, delay: 0.09 });
    },
    success: function () {
      tone({ type: 'triangle', from: 523, dur: 0.14, gain: 0.07 });
      tone({ type: 'triangle', from: 659, dur: 0.14, gain: 0.07, delay: 0.11 });
      tone({ type: 'triangle', from: 784, dur: 0.22, gain: 0.08, delay: 0.22 });
    },
    warning: function () {
      tone({ type: 'square', from: 220, to: 180, dur: 0.25, gain: 0.05 });
      tone({ type: 'square', from: 220, to: 180, dur: 0.25, gain: 0.05, delay: 0.28 });
    },
    error: function () { tone({ type: 'sawtooth', from: 200, to: 120, dur: 0.3, gain: 0.05 }); },
    phantom: function () {
      tone({ type: 'sine', from: 110, dur: 0.9, gain: 0.05 });
      tone({ type: 'sine', from: 116, dur: 0.9, gain: 0.045 });
      noise({ freq: 400, dur: 0.6, gain: 0.02, delay: 0.2 });
    },
    achievement: function () {
      tone({ type: 'triangle', from: 880, dur: 0.1, gain: 0.06 });
      tone({ type: 'triangle', from: 1174, dur: 0.1, gain: 0.06, delay: 0.09 });
      tone({ type: 'triangle', from: 1568, dur: 0.25, gain: 0.07, delay: 0.18 });
    }
  };

  var narrationEl = null;

  SIGAP.audio = {
    /** Play a named sound effect (respects the global sound setting). */
    sfx: function (name) {
      if (!soundOn()) return;
      var fn = SFX[name];
      if (fn) {
        try { fn(); } catch (e) { /* audio must never crash gameplay */ }
      }
    },

    setSound: function (on) {
      SIGAP.state.update(function (s) { s.settings.sound = !!on; });
    },
    isSoundOn: soundOn,

    setNarration: function (on) {
      if (!on) SIGAP.audio.stopNarration();
      SIGAP.state.update(function (s) { s.settings.narration = !!on; });
    },
    isNarrationOn: function () {
      var s = SIGAP.state.get();
      return s.settings.narration !== false;
    },

    /**
     * Play a narration file from assets/audio/. Resolves silently on any
     * failure (missing file, unsupported format); dialogue always works
     * without audio. Returns the HTMLAudioElement or null.
     */
    playNarration: function (relPath) {
      SIGAP.audio.stopNarration();
      if (!relPath || !SIGAP.audio.isNarrationOn()) return null;
      try {
        var el = new Audio('assets/audio/' + relPath);
        el.addEventListener('error', function () { /* missing file: silent fallback */ });
        var p = el.play();
        if (p && p.catch) p.catch(function () { /* autoplay blocked or missing */ });
        narrationEl = el;
        return el;
      } catch (e) {
        return null;
      }
    },

    pauseNarration: function () {
      if (narrationEl) { try { narrationEl.pause(); } catch (e) { /* noop */ } }
    },

    resumeNarration: function () {
      if (narrationEl) {
        try {
          var p = narrationEl.play();
          if (p && p.catch) p.catch(function () {});
        } catch (e) { /* noop */ }
      }
    },

    stopNarration: function () {
      if (narrationEl) {
        try { narrationEl.pause(); narrationEl.src = ''; } catch (e) { /* noop */ }
        narrationEl = null;
      }
    }
  };
})();
