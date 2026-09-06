/* ============================================================
   SIGAP - components/toast.js
   Non-blocking notifications. Icon + text (never color-only).
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.ui = SIGAP.ui || {};

  var ICONS = {
    info: 'ℹ',
    success: '✔',
    warn: '⚠',
    error: '✖',
    xp: '▲',
    achv: '★'
  };

  /**
   * SIGAP.ui.toast('Pesan', 'success'|'info'|'warn'|'error'|'xp')
   */
  SIGAP.ui.toast = function (message, type) {
    type = ICONS[type] ? type : 'info';
    var root = document.getElementById('toast-root');
    if (!root) return;

    var el = document.createElement('div');
    el.className = 'toast toast--' + type;
    var icon = document.createElement('span');
    icon.className = 'toast__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = ICONS[type];
    var text = document.createElement('span');
    text.textContent = message;
    el.appendChild(icon);
    el.appendChild(text);
    root.appendChild(el);

    // Keep at most 3 toasts.
    while (root.children.length > 3) root.removeChild(root.firstChild);

    setTimeout(function () {
      el.classList.add('toast--out');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 260);
    }, 3200);
  };
})();
