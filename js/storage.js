/* ============================================================
   SIGAP — storage.js
   LocalStorage wrapper with graceful fallback (in-memory) and
   corruption handling. Never throws to callers.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};

  var KEY = 'sigap_save';
  var memoryStore = {};
  var lsAvailable = (function () {
    try {
      var t = '__sigap_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  })();

  function rawGet(key) {
    if (lsAvailable) {
      try { return window.localStorage.getItem(key); } catch (e) { return memoryStore[key] || null; }
    }
    return memoryStore.hasOwnProperty(key) ? memoryStore[key] : null;
  }

  function rawSet(key, value) {
    memoryStore[key] = value;
    if (lsAvailable) {
      try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
    }
    return false;
  }

  function rawRemove(key) {
    delete memoryStore[key];
    if (lsAvailable) {
      try { window.localStorage.removeItem(key); } catch (e) { /* noop */ }
    }
  }

  SIGAP.storage = {
    persistent: lsAvailable,

    /** Load and parse the saved state. Returns object or null (corrupt/missing). */
    load: function () {
      var raw = rawGet(KEY);
      if (!raw) return null;
      try {
        var parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed;
      } catch (e) {
        // Corrupt save: keep a backup for diagnostics, then clear.
        try { rawSet(KEY + '_corrupt_backup', raw); } catch (e2) { /* noop */ }
        rawRemove(KEY);
        return null;
      }
    },

    /** Serialize and persist state. Returns false if persistence failed. */
    save: function (state) {
      try {
        return rawSet(KEY, JSON.stringify(state));
      } catch (e) {
        return false;
      }
    },

    /** Remove the save entirely. */
    reset: function () {
      rawRemove(KEY);
    },

    /** Generic small key/value helpers (namespaced). */
    getItem: function (key) { return rawGet('sigap_' + key); },
    setItem: function (key, value) { return rawSet('sigap_' + key, value); },
    removeItem: function (key) { rawRemove('sigap_' + key); }
  };
})();
