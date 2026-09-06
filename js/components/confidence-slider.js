/* ============================================================
   SIGAP - components/confidence-slider.js
   Labeled 0–100 confidence slider with live value + hint.
   SIGAP.ui.confidenceSlider({ id, label, value, hint }) ->
     { el, get(), set(v) }
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.ui = SIGAP.ui || {};

  function qualitative(v) {
    if (v <= 25) return 'sangat ragu';
    if (v <= 50) return 'ragu';
    if (v <= 75) return 'cukup yakin';
    if (v <= 90) return 'yakin';
    return 'sangat yakin';
  }

  SIGAP.ui.confidenceSlider = function (opts) {
    opts = opts || {};
    var value = typeof opts.value === 'number' ? opts.value : 50;
    var id = opts.id || 'conf-' + Math.random().toString(36).slice(2, 8);

    var wrap = document.createElement('div');
    wrap.className = 'conf-slider';

    var labelRow = document.createElement('div');
    labelRow.className = 'conf-slider__label';
    var label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = opts.label || 'Seberapa yakin kamu dengan kesimpulanmu?';
    var valEl = document.createElement('output');
    valEl.className = 'conf-slider__value';
    valEl.setAttribute('for', id);
    labelRow.appendChild(label);
    labelRow.appendChild(valEl);

    var input = document.createElement('input');
    input.type = 'range';
    input.id = id;
    input.min = '0';
    input.max = '100';
    input.step = '5';
    input.value = String(value);
    input.setAttribute('aria-describedby', id + '-hint');

    var scale = document.createElement('div');
    scale.className = 'conf-slider__scale';
    scale.setAttribute('aria-hidden', 'true');
    scale.innerHTML = '<span>0% (menebak)</span><span>50%</span><span>100% (pasti)</span>';

    var hint = document.createElement('p');
    hint.className = 'conf-slider__hint';
    hint.id = id + '-hint';
    hint.textContent = opts.hint ||
      'Confidence yang baik mengikuti kekuatan bukti, bukan perasaan. Kalau bukti belum lengkap, wajar untuk tidak terlalu yakin.';

    function refresh() {
      var v = parseInt(input.value, 10);
      valEl.textContent = v + '% · ' + qualitative(v);
      input.setAttribute('aria-valuetext', v + ' persen, ' + qualitative(v));
    }
    input.addEventListener('input', refresh);
    refresh();

    wrap.appendChild(labelRow);
    wrap.appendChild(input);
    wrap.appendChild(scale);
    wrap.appendChild(hint);

    return {
      el: wrap,
      get: function () { return parseInt(input.value, 10); },
      set: function (v) { input.value = String(v); refresh(); }
    };
  };
})();
