/* ============================================================
   SIGAP - data/ai-lab-data.js
   Seluruh konten/soal untuk AI LABORATORY (lab01–lab04).
   Logika permainan ada di js/games/ai-lab.js.
   ============================================================ */
(function () {
  'use strict';
  window.SIGAP = window.SIGAP || {};
  SIGAP.data = SIGAP.data || {};

  SIGAP.data.aiLab = {

    /* ------------------------------------------------------
       LAB 01: PATTERN RECOGNITION
       5 soal pola visual. Semua pola logis dan dijelaskan
       SETELAH menjawab. Soal terakhir = soal jebakan
       (dua aturan berbeda cocok dengan data awal).
       ------------------------------------------------------ */
    lab01: [
      {
        id: 'p1',
        label: 'Pola bergantian',
        sequence: ['●', '■', '●', '■', '●', '?'],
        options: ['●', '■', '▲', '● ■'],
        correct: 1,
        explain: 'Aturannya: bentuk bergantian ● lalu ■ terus-menerus. Setelah ● berikutnya pasti ■. ' +
          'Ini pola paling sederhana: perulangan dua elemen.'
      },
      {
        id: 'p2',
        label: 'Kelompok yang menggandakan',
        sequence: ['●', '■■', '●', '■■■■', '●', '?'],
        options: ['■■', '■■■■', '■■■■■■', '■■■■■■■■'],
        correct: 3,
        explain: 'Setiap kelompok kotak setelah ● jumlahnya dikali 2: dua ■ → empat ■ → delapan ■. ' +
          'Jadi jawabannya delapan kotak (2 → 4 → 8).'
      },
      {
        id: 'p3',
        label: 'Bertambah satu',
        sequence: ['▲', '▲●', '▲●●', '▲●●●', '?'],
        options: ['▲●●', '▲●●●', '▲●●●●', '●●●●●'],
        correct: 2,
        explain: 'Aturannya: ▲ selalu di depan, lalu jumlah ● bertambah satu setiap langkah ' +
          '(0, 1, 2, 3 → berikutnya 4 lingkaran).'
      },
      {
        id: 'p4',
        label: 'Putaran arah',
        sequence: ['↑', '→', '↓', '←', '?'],
        options: ['←', '↓', '→', '↑'],
        correct: 3,
        explain: 'Panah berputar 90° searah jarum jam: atas → kanan → bawah → kiri. ' +
          'Setelah kiri, putaran kembali ke atas (↑). Pola bisa berupa siklus yang berulang.'
      },
      {
        id: 'p5',
        label: 'Soal jebakan',
        trap: true,
        sequence: ['■', '■■', '■■■■', '?'],
        options: [
          '■■■■■■■ (7 kotak)',
          '■■■■■■■■ (8 kotak)',
          '■■■■■ (5 kotak)',
          'Informasi belum cukup menentukan satu aturan'
        ],
        correct: 3,
        explain: 'Jebakan! Data 1 → 2 → 4 cocok dengan DUA aturan berbeda: "dikali 2" (berikutnya 8) ' +
          'ATAU "ditambah 1, lalu 2, lalu 3" (berikutnya 7). Dengan data sesedikit ini kita belum bisa ' +
          'memilih satu aturan secara pasti. Model AI juga begini: pola yang tampak cocok dengan data awal ' +
          'belum tentu aturan yang sebenarnya. Butuh lebih banyak data untuk memastikan.'
      }
    ],

    /* ------------------------------------------------------
       LAB 02: TRAINING DATA
       Pemain melabeli 10 kartu (8 jelas + 2 ambigu) ke dua
       keranjang, lalu "melatih model" dan melihat model
       meniru label pemain, termasuk kesalahannya.
       ------------------------------------------------------ */
    lab02: {
      categories: [
        { id: 'kucing', label: 'Keranjang KUCING', short: 'Kucing', emoji: '🐱' },
        { id: 'anjing', label: 'Keranjang ANJING', short: 'Anjing', emoji: '🐶' }
      ],
      trainCards: [
        { id: 't1', emoji: '🐱', name: 'Kucing rumahan', kind: 'cat', truth: 'kucing', clear: true },
        { id: 't2', emoji: '🐈', name: 'Kucing berjalan', kind: 'cat', truth: 'kucing', clear: true },
        { id: 't3', emoji: '😺', name: 'Kucing tersenyum', kind: 'cat', truth: 'kucing', clear: true },
        { id: 't4', emoji: '🐈‍⬛', name: 'Kucing hitam', kind: 'cat', truth: 'kucing', clear: true },
        { id: 't5', emoji: '🐶', name: 'Anak anjing', kind: 'dog', truth: 'anjing', clear: true },
        { id: 't6', emoji: '🐕', name: 'Anjing berdiri', kind: 'dog', truth: 'anjing', clear: true },
        { id: 't7', emoji: '🦮', name: 'Anjing pemandu', kind: 'dog', truth: 'anjing', clear: true },
        { id: 't8', emoji: '🐩', name: 'Anjing pudel', kind: 'dog', truth: 'anjing', clear: true },
        {
          id: 't9', emoji: '🦊', name: 'Rubah', kind: 'fox', truth: null, clear: false,
          note: 'Ambigu: mirip anjing, tapi sebenarnya bukan kucing maupun anjing.'
        },
        {
          id: 't10', emoji: '🐺', name: 'Serigala', kind: 'wolf', truth: null, clear: false,
          note: 'Ambigu: kerabat anjing, tapi bukan hewan peliharaan.'
        }
      ],
      testCards: [
        { id: 'x1', emoji: '😼', name: 'Kucing menyeringai', kind: 'cat', truth: 'kucing' },
        { id: 'x2', emoji: '🐕‍🦺', name: 'Anjing pendamping', kind: 'dog', truth: 'anjing' },
        { id: 'x3', emoji: '🦊', name: 'Rubah lain', kind: 'fox', truth: null },
        { id: 'x4', emoji: '😾', name: 'Kucing kesal', kind: 'cat', truth: 'kucing' }
      ],
      badExperiment: {
        intro: 'Sekarang eksperimen terkontrol. Kali ini BUKAN kamu yang melabeli; dataset ini sudah ' +
          'berisi 2 label yang SENGAJA dibuat salah. Perhatikan apa yang dipelajari model.',
        dataset: [
          { emoji: '🐱', name: 'Kucing', given: 'kucing', wrong: false },
          { emoji: '🐈', name: 'Kucing', given: 'kucing', wrong: false },
          { emoji: '🐶', name: 'Anjing', given: 'anjing', wrong: false },
          { emoji: '🐕', name: 'Anjing', given: 'kucing', wrong: true },
          { emoji: '🦮', name: 'Anjing', given: 'kucing', wrong: true },
          { emoji: '🐩', name: 'Anjing', given: 'anjing', wrong: false }
        ],
        result: [
          { emoji: '😺', name: 'Kucing baru', pred: 'kucing', ok: true, note: 'Contoh kucing semuanya benar → prediksi benar.' },
          { emoji: '🐕‍🦺', name: 'Anjing baru', pred: 'kucing', ok: false, note: 'Separuh contoh anjing dilabeli "kucing" → model ikut menyebut anjing sebagai kucing.' }
        ],
        lesson: 'Model tidak tahu mana label yang benar; ia hanya meniru contoh yang diberikan. ' +
          'Kalau contohnya salah, hasilnya ikut salah. Prinsip ini sering disebut "garbage in, garbage out": ' +
          'kalau bahan masukan buruk, hasil keluarannya juga buruk.'
      },
      quiz: [
        {
          q: 'Sebuah model dilatih dengan banyak foto kucing yang salah diberi label "anjing". Apa yang paling mungkin terjadi?',
          options: [
            'Model tetap benar, karena AI bisa tahu label mana yang salah',
            'Model akan sering menyebut kucing sebagai anjing, meniru kesalahan labelnya',
            'Model menolak belajar dari data yang salah',
            'Tidak ada pengaruhnya sama sekali'
          ],
          correct: 1,
          explain: 'Model belajar DARI contoh, bukan dari kebenaran. Ia tidak punya cara sendiri untuk tahu label mana yang salah. ' +
            'kesalahan label akan ditiru dalam prediksinya.'
        },
        {
          q: 'Model sering salah karena data latihannya banyak yang salah label. Cara perbaikan yang paling tepat?',
          options: [
            'Menambah data apa pun sebanyak-banyaknya, walau labelnya tetap acak',
            'Memakai model itu terus sampai ia "sadar" sendiri',
            'Memperbaiki label yang salah, lalu melatih ulang model dengan data yang lebih bersih',
            'Mengganti nama modelnya'
          ],
          correct: 2,
          explain: 'Kualitas label menentukan kualitas model. Memperbaiki label lalu melatih ulang adalah cara yang benar. ' +
            'menambah data yang tetap salah label justru memperkuat kesalahan.'
        }
      ]
    },

    /* ------------------------------------------------------
       LAB 03: AI BIAS (SIMULASI KONSEPTUAL)
       Slider komposisi data latihan dua kelompok +
       kuis reasoning. Skor dari kuis.
       ------------------------------------------------------ */
    lab03: {
      disclaimer: 'Angka dalam simulasi disederhanakan untuk pembelajaran dan bukan rumus akurasi AI nyata.',
      groups: [
        { id: 'sport', label: 'Sepatu olahraga', emoji: '👟' },
        { id: 'formal', label: 'Sepatu formal', emoji: '👞' }
      ],
      concept: [
        'Kelompok yang kurang terwakili di data latihan → contohnya lebih sedikit.',
        'Contoh lebih sedikit → model mungkin belajar kurang baik untuk kelompok itu.',
        'Akurasi keseluruhan bisa tetap terlihat tinggi, padahal satu kelompok dirugikan.',
        'Karena itu performa model perlu dievaluasi PER KELOMPOK, bukan hanya rata-rata.'
      ],
      quiz: [
        {
          q: 'Sebuah model diklaim "95% akurat secara keseluruhan". Apakah model itu pasti adil untuk semua kelompok?',
          options: [
            'Pasti adil, 95% itu angka yang sangat tinggi',
            'Belum tentu; akurasi keseluruhan bisa menyembunyikan performa buruk pada kelompok kecil; perlu evaluasi per kelompok',
            'Pasti tidak adil, akurasi tinggi selalu berarti bias',
            'Tidak bisa dinilai karena akurasi tidak ada hubungannya dengan keadilan'
          ],
          correct: 1,
          explain: 'Angka rata-rata bisa menutupi masalah. Kalau kelompok kecil hanya 5% dari data, model bisa salah terus pada ' +
            'kelompok itu dan tetap "95% akurat". Cara memeriksanya: ukur performa untuk tiap kelompok secara terpisah.'
        },
        {
          q: 'Dalam simulasi tadi, mengapa performa model turun untuk kelompok yang porsinya kecil di data latihan?',
          options: [
            'Karena model sengaja tidak menyukai kelompok itu',
            'Karena komputer kehabisan memori',
            'Karena contoh dari kelompok itu lebih sedikit, sehingga model punya lebih sedikit bahan untuk belajar mengenalinya',
            'Karena kelompok kecil selalu lebih sulit dikenali oleh siapa pun'
          ],
          correct: 2,
          explain: 'Model tidak punya niat atau perasaan. Ia belajar dari contoh: makin sedikit contoh sebuah kelompok, ' +
            'makin sedikit pola yang bisa ia pelajari tentang kelompok itu. Ini soal DATA, bukan soal "sikap" model.'
        },
        {
          q: 'Tim sekolah mau memakai model pengenal sepatu untuk lomba. Data latihannya: 90% sepatu olahraga, 10% sepatu formal. Langkah paling masuk akal?',
          options: [
            'Langsung dipakai, 90% + 10% = 100%, berarti datanya lengkap',
            'Menambah contoh sepatu formal dan menguji performa model pada tiap jenis sepatu sebelum dipakai',
            'Menghapus semua data sepatu formal supaya modelnya fokus',
            'Memakai model hanya di ruangan yang gelap'
          ],
          correct: 1,
          explain: 'Dua tindakan kunci: (1) melengkapi data kelompok yang kurang terwakili, (2) mengevaluasi performa per kelompok ' +
            'sebelum model dipakai. Keduanya adalah praktik nyata dalam pengembangan AI yang bertanggung jawab.'
        }
      ]
    },

    /* ------------------------------------------------------
       LAB 04: HUMAN OR AI?
       4 konten. Pemain memilih indikator (bukti), menilai
       keyakinan, lalu memberi verdict. Minimal satu konten
       jawaban benarnya "Belum Cukup Bukti".
       ------------------------------------------------------ */
    lab04Indicators: [
      { id: 'rep', text: 'Frasa generik yang diulang-ulang' },
      { id: 'detail', text: 'Ada detail spesifik yang bisa dicek kebenarannya' },
      { id: 'inkonsisten', text: 'Ada inkonsistensi fakta atau angka' },
      { id: 'seragam', text: 'Gaya kalimat terlalu seragam / rata / "terlalu halus"' },
      { id: 'personal', text: 'Ada ciri personal (typo, gaya khas, emosi tidak rata)' },
      { id: 'provenance', text: 'Tidak ada informasi asal-usul konten (provenance)' }
    ],

    lab04: [
      {
        id: 'k1',
        type: 'Paragraf berita',
        title: 'Berita kegiatan sekolah',
        body: 'Kegiatan literasi digital di tiga sekolah berjalan dengan sangat baik dan sangat bermanfaat. ' +
          'Para siswa sangat antusias dan sangat bersemangat mengikuti seluruh rangkaian acara. ' +
          'Kegiatan ini diikuti oleh SMP 1, SMP 4, SMP 7, dan SMP 9. ' +
          'Secara keseluruhan, kegiatan ini sangat baik dan sangat bermanfaat bagi semua pihak.',
        meta: 'Diterima lewat pesan berantai, tanpa nama penulis dan tanpa nama media.',
        present: ['rep', 'inkonsisten', 'seragam', 'provenance'],
        verdict: 'ai',
        verdictExplain: 'Indikasi mengarah kuat ke AI: kata "sangat" dan frasa yang sama diulang terus, gaya rata tanpa variasi, ' +
          'dan ada inkonsistensi: teks bilang "tiga sekolah" tapi menyebut EMPAT nama sekolah. Ditambah tidak ada provenance. ' +
          'Ingat: ini indikasi kuat, bukan kepastian mutlak; manusia yang menulis terburu-buru juga bisa salah hitung.'
      },
      {
        id: 'k2',
        type: 'Puisi (tulisan tangan)',
        title: 'Puisi di mading kelas',
        // look 'tangan' membuat konten ini dirender sebagai catatan kertas,
        // bukan teks ketikan, supaya yang dilihat siswa cocok dengan meta-nya.
        // Kata di antara ~...~ ditampilkan sebagai coretan revisi.
        look: 'tangan',
        body: 'hujan turun pas bel pulang / sepatuku bolong yang kiri / kupinjem ~plastik~ kresek bu Darmi di kantin / ' +
          'biar kaos kaki tetep kering. Sinta, kelas 8B',
        meta: 'Dari mading kelas: tulisan tangan dengan bekas coretan revisi, nama penulis jelas.',
        present: ['detail', 'personal'],
        verdict: 'manusia',
        verdictExplain: 'Indikasi mengarah ke manusia: ada detail spesifik yang bisa dicek (bu Darmi di kantin, kelas 8B), ' +
          'bahasa sehari-hari yang tidak rata ("kupinjem", "tetep"), dan provenance-nya jelas: ditulis tangan di mading ' +
          'dengan nama penulis dan bekas revisi. Riwayat asal-usul seperti ini adalah bukti terkuat.'
      },
      {
        id: 'k3',
        type: 'Balasan chat',
        title: 'Balasan chat singkat',
        body: 'Makasih infonya ya. Nanti aku cek dulu, kalau jadi aku kabari lagi.',
        meta: 'Tangkapan layar chat dari nomor tak dikenal, tanpa konteks percakapan sebelumnya.',
        present: ['provenance'],
        verdict: 'belum',
        verdictExplain: 'Jawaban terbaik: BELUM CUKUP BUKTI. Teks ini terlalu pendek dan terlalu umum; manusia dan AI ' +
          'sama-sama sering menulis kalimat persis seperti ini. Tidak ada detail yang bisa dicek, tidak ada ciri khas, ' +
          'dan tidak ada provenance. Memaksakan jawaban "Manusia" atau "AI" di sini hanyalah tebakan, bukan kesimpulan.'
      },
      {
        id: 'k4',
        type: 'Caption foto',
        title: 'Caption foto pemandangan',
        body: 'Foto matahari terbit di Gunung Semeru, gunung tertinggi di Pulau Sumatera. Pemandangan yang sangat indah ' +
          'dan sangat menakjubkan. Momen yang sangat sempurna untuk memulai hari yang sangat sempurna.',
        meta: 'Diunggah akun anonim tanpa lokasi, tanggal, atau sumber foto.',
        present: ['rep', 'inkonsisten', 'seragam', 'provenance'],
        verdict: 'ai',
        verdictExplain: 'Indikasi mengarah kuat ke AI: ada kesalahan fakta yang ditulis dengan sangat percaya diri. ' +
          'Gunung Semeru ada di Pulau Jawa, bukan Sumatera (gaya salah-tapi-yakin ini sering muncul pada teks AI dan disebut ' +
          '"halusinasi"). Ditambah pengulangan "sangat ... sangat ..." dan gaya rata. Tetap bukan kepastian; manusia pun bisa ' +
          'salah geografi, tapi gabungan indikator + tanpa provenance membuat "AI" jadi kesimpulan yang paling didukung bukti.'
      }
    ]
  };
})();
