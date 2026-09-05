/* ============================================================
   SIGAP — components/evidence-card.js
   Evidence card factory.
   SIGAP.ui.evidenceCard({
     id, title, body, source, strength ('LEMAH'|'SEDANG'|'KUAT'|null),
     found (bool, plays pulse), onClick (makes it interactive)
   }) -> HTMLElement
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.ui = SIGAP.ui || {};

  var STRENGTH_TAGS = {
    LEMAH: 'tag--red',
    SEDANG: 'tag--amber',
    KUAT: 'tag--green'
  };

  SIGAP.ui.evidenceCard = function (opts) {
    opts = opts || {};
    var interactive = typeof opts.onClick === 'function';
    var el = document.createElement(interactive ? 'button' : 'div');
    el.className = 'evidence-card' +
      (interactive ? ' evidence-card--interactive' : '') +
      (opts.found ? ' evidence-card--found' : '');
    if (opts.id) el.dataset.evidenceId = opts.id;
    if (interactive) el.type = 'button';

    var head = document.createElement('div');
    head.className = 'evidence-card__head';
    var title = document.createElement('span');
    title.className = 'evidence-card__title';
    title.textContent = opts.title || 'BUKTI';
    head.appendChild(title);

    if (opts.strength && STRENGTH_TAGS[opts.strength]) {
      var tag = document.createElement('span');
      tag.className = 'tag ' + STRENGTH_TAGS[opts.strength];
      tag.textContent = opts.strength;
      head.appendChild(tag);
    } else if (opts.tag) {
      var t2 = document.createElement('span');
      t2.className = 'tag ' + (opts.tagClass || 'tag--cyan');
      t2.textContent = opts.tag;
      head.appendChild(t2);
    }
    el.appendChild(head);

    if (opts.body) {
      var body = document.createElement('div');
      body.className = 'evidence-card__body';
      if (opts.body instanceof HTMLElement) body.appendChild(opts.body);
      else body.innerHTML = opts.body;
      el.appendChild(body);
    }

    if (opts.source) {
      var src = document.createElement('div');
      src.className = 'evidence-card__source';
      src.textContent = 'Sumber: ' + opts.source;
      el.appendChild(src);
    }

    if (interactive) {
      el.addEventListener('click', function () {
        if (SIGAP.audio) SIGAP.audio.sfx('click');
        opts.onClick(el);
      });
    }

    if (opts.found && SIGAP.audio) SIGAP.audio.sfx('evidence');
    return el;
  };
})();
