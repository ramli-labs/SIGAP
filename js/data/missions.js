/* ============================================================
   SIGAP - data/missions.js
   Case + lab metadata for hub/mission screens.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.data = SIGAP.data || {};

  SIGAP.data.cases = [
    {
      id: 'case001',
      code: 'CASE 001',
      title: 'File Misteri',
      theme: 'APK berbahaya · Social engineering',
      brief: 'Sebuah file mencurigakan dikirim lewat chat yang mengaku dari teman. Selidiki sebelum ada yang meng-install.',
      route: 'case001',
      competencies: ['digitalSafety', 'evidenceReasoning', 'criticalThinking'],
      xp: 100
    },
    {
      id: 'case002',
      code: 'CASE 002',
      title: 'Real or Generated?',
      theme: 'Citra hasil AI · Manipulasi visual',
      brief: 'Tiga plate gambar masuk ke lab. Gunakan AI Forensic Scanner untuk mencari indikator manipulasi, dan belajar kapan bukti belum cukup.',
      route: 'case002',
      competencies: ['aiLiteracy', 'evidenceReasoning', 'criticalThinking'],
      xp: 100
    },
    {
      id: 'case003',
      code: 'CASE 003',
      title: 'Link Palsu',
      theme: 'Phishing · Keamanan data',
      brief: 'Email "paket tertahan" meminta pembayaran kecil. Bedah pengirim, domain, dan datanya sebelum ada korban.',
      route: 'case003',
      competencies: ['digitalSafety', 'criticalThinking', 'evidenceReasoning'],
      xp: 100
    },
    {
      id: 'case004',
      code: 'CASE 004',
      title: 'Phantom Signal',
      theme: 'Deepfake · Video termanipulasi',
      brief: 'Potongan video seorang guru beredar dan diragukan keasliannya. Bandingkan dengan rekaman referensi, uji hipotesismu, dan hadapi PHANTOM.',
      route: 'case004',
      competencies: ['aiLiteracy', 'evidenceReasoning', 'ethicalReasoning', 'criticalThinking'],
      xp: 100
    }
  ];

  SIGAP.data.labs = [
    {
      id: 'lab01',
      code: 'LAB 01',
      title: 'Pattern Recognition',
      brief: 'Bagaimana mesin (dan manusia) mengenali pola, dan kapan pola menipu.',
      xp: 50
    },
    {
      id: 'lab02',
      code: 'LAB 02',
      title: 'Training Data',
      brief: 'Model belajar dari contoh. Label yang salah menghasilkan model yang salah.',
      xp: 50
    },
    {
      id: 'lab03',
      code: 'LAB 03',
      title: 'AI Bias',
      brief: 'Simulasi konseptual: data yang timpang membuat performa model tidak merata.',
      xp: 50
    },
    {
      id: 'lab04',
      code: 'LAB 04',
      title: 'Human or AI?',
      brief: 'Nilai konten dengan bukti, dan berani bilang "belum cukup bukti".',
      xp: 50
    }
  ];
})();
