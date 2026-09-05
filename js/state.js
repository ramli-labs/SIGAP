/* ============================================================
   SIGAP — state.js
   Single structured game state + schema migration + helpers.
   Auto-saves on every update().
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};

  var SCHEMA_VERSION = 1;
  var XP_PER_LEVEL = 250;

  function defaultState() {
    return {
      version: SCHEMA_VERSION,
      player: { name: '', agentId: '', xp: 0, level: 1, createdAt: null },
      settings: { sound: true, narration: true, reducedMotion: false },
      progress: { cases: {}, labs: {} },
      performance: {
        // raw weighted sums per competency: { sum: number, weight: number }
        raw: {},
        flags: { overconfident: 0, underconfident: 0, wellCalibrated: 0 },
        misconceptions: []
      },
      reflections: {},
      achievements: [],
      tutorials: {},
      timestamps: { created: Date.now(), lastPlayed: Date.now() },
      story: { phantomIntroSeen: false, finalDecision: null }
    };
  }

  /** Deep-merge saved data onto defaults so missing keys never break the app. */
  function mergeDefaults(target, src) {
    for (var k in src) {
      if (!src.hasOwnProperty(k)) continue;
      var v = src[k];
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        if (!target[k] || typeof target[k] !== 'object' || Array.isArray(target[k])) target[k] = {};
        mergeDefaults(target[k], v);
      } else {
        target[k] = v;
      }
    }
    return target;
  }

  /** Migrations for future schema versions. */
  function migrate(saved) {
    if (!saved || typeof saved.version !== 'number') return null;
    // v1 is current. Future: if (saved.version === 1) { ...upgrade...; saved.version = 2; }
    if (saved.version > SCHEMA_VERSION) {
      // Save from a newer app version: keep what we understand.
      saved.version = SCHEMA_VERSION;
    }
    return saved;
  }

  var _state = (function () {
    var base = defaultState();
    var saved = migrate(SIGAP.storage.load());
    if (saved) mergeDefaults(base, saved);
    base.version = SCHEMA_VERSION;
    return base;
  })();

  var _listeners = [];

  function save() {
    _state.timestamps.lastPlayed = Date.now();
    SIGAP.storage.save(_state);
  }

  SIGAP.state = {
    XP_PER_LEVEL: XP_PER_LEVEL,

    get: function () { return _state; },

    /** Apply a mutator function, then persist and notify listeners. */
    update: function (mutator) {
      try { mutator(_state); } catch (e) {
        if (window.console) console.error('[SIGAP] state.update error:', e);
      }
      save();
      for (var i = 0; i < _listeners.length; i++) {
        try { _listeners[i](_state); } catch (e2) { /* listener errors must not break state */ }
      }
    },

    save: save,

    onChange: function (fn) { _listeners.push(fn); },

    /** True once a profile exists. */
    hasProfile: function () {
      return !!(_state.player && _state.player.name && _state.player.agentId);
    },

    levelForXp: function (xp) { return Math.floor(xp / XP_PER_LEVEL) + 1; },
    xpIntoLevel: function (xp) { return xp % XP_PER_LEVEL; },

    /** Add XP (progress only, never a skill measure). Shows a toast. */
    addXP: function (amount, reason) {
      if (!amount || amount <= 0) return;
      var levelBefore = SIGAP.state.levelForXp(_state.player.xp);
      SIGAP.state.update(function (s) {
        s.player.xp += amount;
        s.player.level = SIGAP.state.levelForXp(s.player.xp);
      });
      if (SIGAP.ui && SIGAP.ui.toast) {
        SIGAP.ui.toast('+' + amount + ' XP' + (reason ? ' — ' + reason : ''), 'xp');
      }
      var levelAfter = SIGAP.state.levelForXp(_state.player.xp);
      if (levelAfter > levelBefore && SIGAP.ui && SIGAP.ui.toast) {
        SIGAP.ui.toast('Naik ke Level ' + levelAfter, 'success');
        if (SIGAP.audio) SIGAP.audio.sfx('success');
      }
    },

    /** Generate a locally-unique agent ID: SGP-XXXX (no ambiguous chars). */
    generateAgentId: function () {
      var chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
      var known = [];
      try { known = JSON.parse(SIGAP.storage.getItem('known_ids') || '[]'); } catch (e) { known = []; }
      var id, attempts = 0;
      do {
        id = 'SGP-';
        for (var i = 0; i < 4; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
        attempts++;
      } while (known.indexOf(id) !== -1 && attempts < 50);
      known.push(id);
      SIGAP.storage.setItem('known_ids', JSON.stringify(known));
      return id;
    },

    /** Create the player profile. */
    createProfile: function (name) {
      var id = SIGAP.state.generateAgentId();
      SIGAP.state.update(function (s) {
        s.player.name = String(name || '').trim().slice(0, 24);
        s.player.agentId = id;
        s.player.createdAt = Date.now();
      });
      return id;
    },

    /** Case progress record (creates default if missing). */
    caseProgress: function (caseId) {
      var c = _state.progress.cases[caseId];
      if (!c) {
        c = {
          completed: false, attempts: 0, practiceRuns: 0,
          bestScore: null, latestScore: null, breakdown: null,
          decision: null, confidence: null, evidence: [],
          startedAt: null, completedAt: null
        };
        _state.progress.cases[caseId] = c;
      }
      return c;
    },

    labProgress: function (labId) {
      var l = _state.progress.labs[labId];
      if (!l) {
        l = { completed: false, attempts: 0, bestScore: null, latestScore: null, completedAt: null };
        _state.progress.labs[labId] = l;
      }
      return l;
    },

    /** A run is "practice" when the case/lab was already completed before this run. */
    isPractice: function (kind, id) {
      var rec = kind === 'lab' ? _state.progress.labs[id] : _state.progress.cases[id];
      return !!(rec && rec.completed);
    },

    /** Record that evidence was found (idempotent). */
    recordEvidence: function (caseId, evidenceId) {
      SIGAP.state.update(function (s) {
        var c = SIGAP.state.caseProgress(caseId);
        if (c.evidence.indexOf(evidenceId) === -1) c.evidence.push(evidenceId);
      });
    },

    /** Save a reflection answer (teacher review only — never auto-graded). */
    saveReflection: function (contextId, questions, answers) {
      SIGAP.state.update(function (s) {
        s.reflections[contextId] = {
          questions: questions,
          answers: answers,
          gradedBy: 'teacherReview',
          savedAt: Date.now()
        };
      });
    },

    tutorialSeen: function (id) { return !!_state.tutorials[id]; },
    markTutorialSeen: function (id) {
      SIGAP.state.update(function (s) { s.tutorials[id] = true; });
    },

    /** Full reset (called from confirmation modal only). */
    resetAll: function () {
      SIGAP.storage.reset();
      _state = defaultState();
      save();
    }
  };
})();
