/* ============================================================
   SIGAP - data/dialogues.js
   Shared dialogue: onboarding, universal tutorial, PHANTOM arc.
   Case-specific dialogue lives inside each case module.
   Voice files are optional: assets/audio/<speaker>/<file>.mp3.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.data = SIGAP.data || {};

  SIGAP.data.dialogues = {
    onboarding: [
      { speaker: 'system', text: 'KONEKSI AMAN TERSAMBUNG… Selamat datang di SIGAP Digital Investigation Academy.' },
      { speaker: 'aruna', voice: 'aruna/onboarding-01.mp3', text: 'Jadi kamu trainee baru itu. Aku Dr. Aruna, mentor investigasimu di akademi ini.' },
      { speaker: 'aruna', voice: 'aruna/onboarding-02.mp3', text: 'Di luar sana, informasi palsu tidak datang dengan label. Ia datang lewat pesan teman, foto yang meyakinkan, dan video yang terlihat nyata.' },
      { speaker: 'aruna', voice: 'aruna/onboarding-03.mp3', text: 'Tugasmu bukan menghafal jawaban. Tugasmu belajar menyelidiki: amati, buat dugaan, periksa buktinya, baru putuskan.' },
      { speaker: 'aruna', voice: 'aruna/onboarding-04.mp3', text: 'Satu hal lagi. Belakangan ini ada pola aneh di jaringan, seseorang menyebut dirinya PHANTOM. Kita akan membahasnya… saat kamu siap.' }
    ],

    universalTutorial: [
      { speaker: 'aruna', voice: 'aruna/tutorial-01.mp3', text: 'Sebelum kasus pertamamu, pahami metode kerja kita. Enam tahap, selalu berurutan.' },
      { speaker: 'aruna', voice: 'aruna/tutorial-02.mp3', text: 'AMATI. Apa yang sebenarnya kamu lihat? Pisahkan apa yang kamu lihat dari apa yang kamu duga.' },
      { speaker: 'aruna', voice: 'aruna/tutorial-03.mp3', text: 'BUAT HIPOTESIS. Apa kemungkinan penjelasannya? Selalu ada lebih dari satu kemungkinan.' },
      { speaker: 'aruna', voice: 'aruna/tutorial-04.mp3', text: 'VERIFIKASI. Periksa sumber, atau gunakan alat yang sesuai. Alat membantu analisis; ia tidak menggantikan penilaianmu.' },
      { speaker: 'aruna', voice: 'aruna/tutorial-05.mp3', text: 'BANDINGKAN. Apakah beberapa bukti saling mendukung? Satu petunjuk jarang cukup untuk menyimpulkan.' },
      { speaker: 'aruna', voice: 'aruna/tutorial-06.mp3', text: 'PUTUSKAN. Kesimpulan apa yang paling sesuai dengan bukti? Kadang kesimpulan yang paling jujur adalah: belum cukup bukti.' },
      { speaker: 'aruna', voice: 'aruna/tutorial-07.mp3', text: 'JELASKAN. Bukti apa yang mendukung keputusanmu? Kalau kamu tidak bisa menjelaskannya, kamu belum selesai menyelidiki.' }
    ],

    phantomFirstContact: [
      { speaker: 'system', text: '⚠ SINYAL TIDAK DIKENAL MENYUSUP KE KANAL AKADEMI…' },
      { speaker: 'phantom', voice: 'phantom/first-contact-01.mp3', text: 'Trainee baru. Mereka mengajarimu "memeriksa bukti"? Lucu. Kebanyakan orang percaya apa pun yang tiba lebih dulu di layarnya.' },
      { speaker: 'phantom', voice: 'phantom/first-contact-02.mp3', text: 'Teruslah menyelidiki. Akan kutunjukkan betapa mudahnya dunia ini dibengkokkan.' },
      { speaker: 'aruna', voice: 'aruna/first-contact-close.mp3', text: 'Itu dia. Jangan terpancing. Justru karena ada aktor seperti PHANTOM, metodemu harus lebih disiplin, bukan lebih cepat.' }
    ]
  };
})();
