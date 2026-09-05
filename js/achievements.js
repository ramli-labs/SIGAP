/* ============================================================
   SIGAP — achievements.js
   Unlock logic + popup card animation.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};

  function findDef(id) {
    var list = (SIGAP.data && SIGAP.data.achievements) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  SIGAP.achievements = {
    /** Unlock a badge by id. Idempotent. Practice runs must not call this. */
    unlock: function (id) {
      var s = SIGAP.state.get();
      if (s.achievements.indexOf(id) !== -1) return false;
      var def = findDef(id);
      if (!def) return false;

      SIGAP.state.update(function (st) { st.achievements.push(id); });

      // Popup card
      var pop = document.createElement('div');
      pop.className = 'achv-pop';
      pop.setAttribute('role', 'status');
      pop.innerHTML =
        '<span class="achv-pop__icon" aria-hidden="true">' + def.icon + '</span>' +
        '<div><div class="achv-pop__label">Badge terbuka</div>' +
        '<div class="achv-pop__name">' + def.name + '</div></div>';
      document.body.appendChild(pop);
      if (SIGAP.audio) SIGAP.audio.sfx('achievement');
      setTimeout(function () {
        pop.classList.add('achv-pop--out');
        setTimeout(function () { if (pop.parentNode) pop.parentNode.removeChild(pop); }, 300);
      }, 3400);

      if (def.xp) SIGAP.state.addXP(def.xp, 'Badge: ' + def.name);
      return true;
    },

    isUnlocked: function (id) {
      return SIGAP.state.get().achievements.indexOf(id) !== -1;
    },

    all: function () {
      return (SIGAP.data && SIGAP.data.achievements) || [];
    }
  };
})();
