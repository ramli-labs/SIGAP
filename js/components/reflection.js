/* ============================================================
   SIGAP - components/reflection.js
   Reflection form after each CASE. Free text is stored for
   teacher review only. NEVER auto-graded, NEVER length-scored.
   SIGAP.ui.reflectionForm({ contextId, questions:[..], onDone }) -> el
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.ui = SIGAP.ui || {};

  SIGAP.ui.reflectionForm = function (opts) {
    opts = opts || {};
    var questions = opts.questions || [];

    var form = document.createElement('form');
    form.className = 'reflection-form';
    form.setAttribute('novalidate', 'true');

    var intro = document.createElement('p');
    intro.className = 'text-sm text-muted';
    intro.textContent =
      'Refleksi singkat. Jawabanmu disimpan untuk dilihat guru, tidak dinilai otomatis dan tidak memengaruhi skor.';
    form.appendChild(intro);

    var areas = [];
    questions.forEach(function (q, i) {
      var field = document.createElement('div');
      field.className = 'field';
      var id = 'refl-' + (opts.contextId || 'x') + '-' + i;
      var label = document.createElement('label');
      label.className = 'field__label';
      label.setAttribute('for', id);
      label.textContent = q;
      var ta = document.createElement('textarea');
      ta.id = id;
      ta.rows = 3;
      ta.maxLength = 600;
      ta.placeholder = 'Tulis dengan katamu sendiri…';
      field.appendChild(label);
      field.appendChild(ta);
      form.appendChild(field);
      areas.push(ta);
    });

    var btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = 'btn btn--primary';
    btn.textContent = 'Simpan Refleksi';
    form.appendChild(btn);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var answers = areas.map(function (ta) { return ta.value.trim(); });
      SIGAP.state.saveReflection(opts.contextId, questions, answers);
      SIGAP.ui.toast('Refleksi tersimpan.', 'success');
      if (SIGAP.audio) SIGAP.audio.sfx('click');
      if (opts.onDone) opts.onDone(answers);
    });

    return form;
  };
})();
