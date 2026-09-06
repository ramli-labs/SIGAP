/* ============================================================
   SIGAP - data/achievements-data.js
   Badge definitions. Badges reward reasoning behaviour,
   never raw click counts.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.data = SIGAP.data || {};

  SIGAP.data.achievements = [
    {
      id: 'first-evidence',
      icon: '🔍',
      name: 'First Evidence',
      desc: 'Menemukan bukti pertamamu dalam sebuah investigasi.',
      xp: 25
    },
    {
      id: 'token-strategist',
      icon: '🎯',
      name: 'Token Strategist',
      desc: 'Memilih dua sumber investigasi awal yang keduanya menghasilkan bukti relevan di CASE 001.',
      xp: 25
    },
    {
      id: 'domain-detective',
      icon: '🌐',
      name: 'Domain Detective',
      desc: 'Menjawab seluruh Domain Challenge di CASE 003 dengan benar beserta alasannya.',
      xp: 25
    },
    {
      id: 'calibrated-thinker',
      icon: '⚖️',
      name: 'Calibrated Thinker',
      desc: 'Membuat keputusan benar dengan confidence yang terkalibrasi baik (75–90%).',
      xp: 25
    },
    {
      id: 'phantom-hunter',
      icon: '👁',
      name: 'Phantom Hunter',
      desc: 'Menyelesaikan CASE 004 dan menemukan minimal dua artefak temporal pada video.',
      xp: 25
    },
    {
      id: 'ethical-agent',
      icon: '🧭',
      name: 'Ethical Agent',
      desc: 'Menolak membalas manipulasi dengan manipulasi pada keputusan akhir PHANTOM.',
      xp: 25
    },
    {
      id: 'ai-lab-analyst',
      icon: '🧪',
      name: 'AI Lab Analyst',
      desc: 'Menyelesaikan keempat modul AI Laboratory.',
      xp: 25
    },
    {
      id: 'evidence-master',
      icon: '📁',
      name: 'Evidence Master',
      desc: 'Mengumpulkan seluruh bukti yang tersedia dalam satu CASE sebelum mengambil keputusan.',
      xp: 25
    },
    {
      id: 'honest-uncertainty',
      icon: '🤔',
      name: 'Honest Uncertainty',
      desc: 'Memilih "belum cukup bukti" pada saat itu memang kesimpulan yang paling tepat.',
      xp: 25
    },
    {
      id: 'academy-graduate',
      icon: '🎓',
      name: 'Academy Graduate',
      desc: 'Menyelesaikan keempat CASE FILES di SIGAP Academy.',
      xp: 50
    }
  ];
})();
