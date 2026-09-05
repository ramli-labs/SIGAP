/* ============================================================
   SIGAP — components/modal.js
   Accessible modal: focus trap, ESC close, aria-modal.
   SIGAP.ui.modal({title, body, actions, dismissible, wide, onClose})
   body: HTMLElement or HTML string.
   actions: [{label, variant:'primary'|'ghost'|'danger', onClick(close)}]
   Returns { close, el }.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.ui = SIGAP.ui || {};

  var openModals = [];

  SIGAP.ui.modal = function (opts) {
    opts = opts || {};
    var root = document.getElementById('modal-root');
    var previouslyFocused = document.activeElement;

    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    var modal = document.createElement('div');
    modal.className = 'modal' + (opts.wide ? ' modal--wide' : '');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    var titleId = 'modal-title-' + Math.random().toString(36).slice(2, 8);
    var header = document.createElement('div');
    header.className = 'modal__header';
    var h = document.createElement('h2');
    h.className = 'modal__title';
    h.id = titleId;
    h.textContent = opts.title || '';
    header.appendChild(h);
    modal.setAttribute('aria-labelledby', titleId);

    var dismissible = opts.dismissible !== false;
    if (dismissible) {
      var closeBtn = document.createElement('button');
      closeBtn.className = 'modal__close';
      closeBtn.setAttribute('aria-label', 'Tutup dialog');
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', function () { close(); });
      header.appendChild(closeBtn);
    }

    var body = document.createElement('div');
    body.className = 'modal__body';
    if (opts.body instanceof HTMLElement) body.appendChild(opts.body);
    else if (typeof opts.body === 'string') body.innerHTML = opts.body;

    modal.appendChild(header);
    modal.appendChild(body);

    if (opts.actions && opts.actions.length) {
      var footer = document.createElement('div');
      footer.className = 'modal__footer';
      opts.actions.forEach(function (a) {
        var b = document.createElement('button');
        b.className = 'btn' + (a.variant ? ' btn--' + a.variant : '');
        b.textContent = a.label;
        b.addEventListener('click', function () {
          if (SIGAP.audio) SIGAP.audio.sfx('click');
          if (a.onClick) a.onClick(close);
          else close();
        });
        footer.appendChild(b);
      });
      modal.appendChild(footer);
    }

    backdrop.appendChild(modal);
    root.appendChild(backdrop);

    function getFocusable() {
      return modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    }

    function onKeydown(e) {
      if (e.key === 'Escape' && dismissible) {
        e.preventDefault();
        close();
      } else if (e.key === 'Tab') {
        var f = getFocusable();
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function onBackdropClick(e) {
      if (e.target === backdrop && dismissible) close();
    }

    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKeydown, true);
      backdrop.removeEventListener('click', onBackdropClick);
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      var idx = openModals.indexOf(handle);
      if (idx !== -1) openModals.splice(idx, 1);
      if (opts.onClose) {
        try { opts.onClose(); } catch (e2) { /* noop */ }
      }
      if (previouslyFocused && previouslyFocused.focus) {
        try { previouslyFocused.focus(); } catch (e3) { /* noop */ }
      }
    }

    document.addEventListener('keydown', onKeydown, true);
    backdrop.addEventListener('click', onBackdropClick);

    // Initial focus.
    var focusables = getFocusable();
    if (focusables.length) focusables[0].focus();
    else modal.setAttribute('tabindex', '-1'), modal.focus();

    var handle = { close: close, el: modal, body: body };
    openModals.push(handle);
    return handle;
  };

  SIGAP.ui.closeAllModals = function () {
    openModals.slice().forEach(function (m) { m.close(); });
  };

  /** Convenience: confirmation modal. */
  SIGAP.ui.confirm = function (title, message, onYes, opts) {
    opts = opts || {};
    return SIGAP.ui.modal({
      title: title,
      body: '<p>' + message + '</p>',
      actions: [
        { label: opts.noLabel || 'Batal', variant: 'ghost' },
        {
          label: opts.yesLabel || 'Ya, lanjutkan',
          variant: opts.danger ? 'danger' : 'primary',
          onClick: function (close) { close(); if (onYes) onYes(); }
        }
      ]
    });
  };
})();
