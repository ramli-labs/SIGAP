# SIGAP — Panduan Guru

Panduan ini membantu guru memakai SIGAP di kelas: tujuan pembelajaran, skenario pembelajaran, cara memakai Teacher Dashboard dan Class Code, cara membaca data siswa, serta bahan diskusi lanjutan.

> **PENTING — dibaca sebelum memakai skor untuk penilaian:**
>
> **"Skor SIGAP bukan nilai akademik tunggal. Gunakan bersama observasi, refleksi, diskusi, dan asesmen guru."**
>
> Pernyataan ini juga tampil permanen di Teacher Dashboard.

---

## 1. Apa itu SIGAP (ringkas untuk guru)

SIGAP adalah gim investigasi digital untuk siswa SMP. Siswa berperan sebagai agen yang menyelidiki 4 kasus (file berbahaya, gambar hasil AI, phishing, deepfake) dan 4 mini-lab literasi AI. Setiap kasus memaksa siswa mengikuti metode: **amati → hipotesis → verifikasi → bandingkan → putuskan (dengan tingkat keyakinan) → jelaskan → refleksi**.

Gim berjalan sepenuhnya offline di perangkat siswa — **tidak ada akun, server, atau pengumpulan data**. Guru menerima data lewat **Class Code** yang diekspor siswa secara manual.

## 2. Tujuan pembelajaran per CASE / Lab

SIGAP mengukur 5 kompetensi: **Critical Thinking (CT)**, **AI Literacy (AI)**, **Digital Safety (DS)**, **Evidence Reasoning (ER)**, **Ethical Reasoning (ET)**.

| Modul | Kompetensi (bobot) | Tujuan pembelajaran — siswa mampu… |
|---|---|---|
| **CASE 001 — File Misteri** | DS (2), ER (1.5), CT (1) | Mengenali social engineering; memeriksa kecocokan klaim vs format file; membaca izin aplikasi secara kritis; memverifikasi pengirim lewat jalur independen; memprioritaskan sumber investigasi yang terbatas; merangkai bukti menjadi rantai penalaran |
| **CASE 002 — Real or Generated?** | AI (2), ER (1.5), CT (1) | Mencari indikator manipulasi visual (teks, cahaya, tekstur); memakai pembanding/kontrol; membedakan "tidak ditemukan bukti manipulasi" dari "terbukti asli"; berani menyimpulkan "belum cukup bukti" |
| **CASE 003 — Link Palsu** | DS (2), CT (1.5), ER (1) | Membaca struktur URL dari kanan (domain utama vs subdomain); mengenali teknik tekanan urgency dan nominal kecil; mengenali permintaan data sensitif; memverifikasi lewat kanal resmi; menghindari generalisasi TLD |
| **CASE 004 — Phantom Signal** | AI (1.5), ER (1.5), CT (1), ET (1) | Menganalisis video termanipulasi (lip-sync, artefak frame, audio, kontinuitas latar); memposisikan metadata sebagai bukti pendukung yang bisa dipalsukan; menimbang bukti independen; mengambil keputusan etis dalam merespons manipulasi |
| **LAB 01 — Pattern Recognition** | AI (1), CT (1) | Memahami bahwa AI (dan manusia) bekerja dengan pola; menyadari bahwa pola yang cocok dengan data awal belum tentu aturan sebenarnya |
| **LAB 02 — Training Data** | AI (1.5) | Memahami bahwa model belajar dari contoh berlabel; kualitas label menentukan kualitas model |
| **LAB 03 — AI Bias** | AI (1), ET (1) | Memahami hubungan keterwakilan data dan performa per kelompok; menyadari akurasi keseluruhan ≠ keadilan per kelompok |
| **LAB 04 — Human or AI?** | CT (1.5), AI (1) | Menilai konten berdasarkan indikator, bukan firasat; memahami konsep provenance; berani menjawab "belum cukup bukti" |

Kunci jawaban tiap kasus ada di bagian **"SPOILER — untuk guru"** di `docs/gameplay-guide.md`.

## 3. Cara pakai di kelas

### Persiapan (sebelum jam pelajaran)
- Pastikan tiap perangkat (Chromebook/HP/PC lab) sudah pernah membuka URL SIGAP sekali saat online — setelah itu gim berjalan offline.
- Coba mainkan CASE 001 sendiri dan baca bagian spoiler di gameplay-guide.
- Siapkan kanal pengumpulan Class Code (grup chat kelas, dokumen bersama, atau ditulis di kertas).

### Skenario A — 2 JP (±80 menit): fokus satu kasus
| Waktu | Kegiatan |
|---|---|
| 10' | Pengantar: tunjukkan contoh nyata hoaks/penipuan; perkenalkan metode "jangan langsung percaya, periksa buktinya" |
| 10' | Siswa buat profil (nama agen), tutorial |
| 30' | Siswa mainkan 1 CASE (mulai dari CASE 001) secara individu/berpasangan |
| 15' | Diskusi kelas dengan pertanyaan lanjutan (lihat §6) |
| 10' | Siswa ekspor Class Code dan kirim ke guru |
| 5' | Penutup: satu prinsip yang dibawa pulang |

### Skenario B — 4 JP (2 pertemuan): kasus + lab
- **Pertemuan 1:** Skenario A dengan CASE 001 + CASE 003 (tema keamanan digital).
- **Pertemuan 2:** AI Lab (LAB 01–02 atau 03–04) + CASE 002; diskusi "kapan kita boleh yakin?"; ekspor Class Code; review dashboard bersama (anonim) sebagai bahan refleksi kelas.

### Skenario C — proyek mingguan
CASE 001→002→003→004 berurutan (satu per sesi/di rumah), diakhiri CASE 004 + diskusi etika PHANTOM di kelas. Cocok untuk P5 / projek literasi digital. Urutan kasus bebas, tetapi urutan 001→004 memberi kurva belajar dan alur cerita terbaik.

### Tips pengelolaan
- Dorong siswa **membaca feedback debrief**, bukan hanya melihat skor.
- Mengulang kasus = **practice run** (tanpa XP) — aman untuk latihan, tidak bisa dipakai "farming" level.
- Refleksi teks bebas tidak dinilai otomatis — sisihkan waktu untuk membacanya (muncul di dashboard).

## 4. Mengimpor Class Code

1. Siswa: **FINAL REPORT → EXPORT → Salin** (kode berformat `SGC1.xxxxx…`), lalu kirim ke guru.
2. Guru: buka gim → menu **Dashboard Guru** (atau URL `#/teacher`; tidak perlu profil siswa).
3. Tempel kode ke kolom impor → tombol **Impor**.
4. Perilaku yang perlu diketahui:
   - Kode tidak valid/terpotong → pesan "Class Code tidak valid atau berasal dari versi yang tidak kompatibel" — aplikasi tidak crash; minta siswa menyalin ulang **seluruh** kode.
   - Siswa yang sama diimpor dua kali → data lama **digantikan** data terbaru (ada notifikasi).
   - Dua siswa bernama sama **tidak** saling menimpa — identitas dibedakan dengan akhiran Agent ID (mis. "Raka · A7K2" dan "Raka · M3XW").
5. Roster tersimpan lokal di perangkat guru. Tombol hapus per siswa / hapus semua tersedia (dengan konfirmasi).

## 5. Membaca dashboard

Tabel roster menampilkan per siswa: nama·ID, CASE selesai (x/4), LAB selesai (x/4), skor terbaik per case, 5 kompetensi, dan flag kalibrasi. Klik baris siswa untuk detail.

### Skor case (0–100)
40% kualitas investigasi + 30% ketepatan keputusan + 20% relevansi bukti + 10% kalibrasi confidence. **Skor ≤59 hampir selalu berarti keputusan utamanya salah** (skor dicap 59 pada keputusan salah). Skor 60–79 = keputusan benar tapi proses/bukti/kalibrasi lemah. Skor 80+ = proses dan keputusan baik.

### Flags kalibrasi
Sebelum tiap keputusan siswa menetapkan confidence 0–100. Sistem membandingkan keyakinan dengan hasil:

- **overconfident** — sangat yakin padahal buktinya tidak mendukung (atau yakin ~100% yang hampir tidak pernah layak). Berulang ≥2 kali = pola yang perlu dibahas: *"Apa yang membuatmu seyakin itu?"*
- **underconfident** — keputusan benar, bukti kuat, tapi tidak berani yakin. Ajak siswa mempercayai bukti yang saling mendukung.
- **wellCalibrated** — keyakinan sesuai kekuatan bukti; ini target pembelajarannya. Catatan penting: siswa yang **salah tapi mengaku tidak yakin** juga dinilai terkalibrasi baik — itu kejujuran epistemik, bukan kegagalan.

### Misconception warnings
Catatan otomatis saat siswa menunjukkan miskonsepsi berisiko, mis. memilih meng-install file mencurigakan, mau membayar/klik link phishing, beralasan "karena .top pasti penipu" (generalisasi TLD), atau confidence sangat tinggi tanpa bukti. Ini **bahan pembinaan**, bukan hukuman — gunakan untuk memilih topik diskusi kelas.

### Refleksi
Jawaban teks bebas siswa ditampilkan utuh, berlabel "untuk direview guru", dan **tidak pernah dinilai otomatis oleh sistem** (juga tidak dinilai dari panjang tulisan). Ini sumber asesmen formatif terkaya — banyak siswa menunjukkan pemahaman di refleksi yang tidak tampak di skor.

### XP/Level vs kompetensi
XP dan Level hanya mengukur **banyaknya aktivitas**, bukan kemampuan. Untuk gambaran kemampuan, lihat **5 kompetensi** dan detail per kasus. Jangan membandingkan siswa berdasarkan level.

## 6. Diskusi lanjutan yang disarankan

**Setelah CASE 001:**
- "Bukti mana yang paling kuat: format file, izin aplikasi, atau penyangkalan Dimas? Kenapa?"
- "Bagaimana kalau pesan seperti itu datang dari orang tuamu? Apa langkah verifikasimu?" (akun keluarga juga bisa diretas)
- "Kenapa 'mengabaikan saja' tetap bukan pilihan terbaik?"

**Setelah CASE 002:**
- "Apa bedanya 'tidak menemukan bukti manipulasi' dengan 'terbukti asli'?" (pertanyaan kunci kasus ini)
- "Kapan kamu berhak sangat yakin? Kapan 'belum cukup bukti' justru jawaban paling jujur?"
- "Kalau alat pendeteksi bisa salah, apa gunanya alat?"

**Setelah CASE 003:**
- "Baca URL ini dari kanan: siapa pemilik domain sebenarnya?" (bawa contoh URL baru ke kelas)
- "Kenapa penipu meminta nominal kecil (Rp3.000), bukan besar?"
- "Apakah semua domain .top penipu? Bagaimana cara memverifikasi domain yang benar?"

**Setelah CASE 004:**
- "Mengapa membalas manipulasi dengan manipulasi tetap merugikan — bahkan jika 'mereka duluan'?"
- "Metadata video bilang X — apakah itu bukti final? Kenapa tidak?"
- "Apa yang harus dilakukan jika video memalukan tentang temanmu beredar?" (dokumentasikan, verifikasi, laporkan, jangan sebarkan)
- Diskusikan kalimat penutup gim: dampak teknologi dipengaruhi desain, konteks, aturan, dan cara manusia menggunakannya — apa artinya "teknologi itu netral" terlalu sederhana?

**Setelah AI Lab:**
- LAB 01: "Kapan pola menipu kita? Pernahkah kamu menyimpulkan terlalu cepat dari sedikit data?"
- LAB 02: "Kalau model belajar dari label kita, siapa yang bertanggung jawab atas kesalahannya?"
- LAB 03: "Model 95% akurat — kelompok mana yang mungkin dirugikan? Bagaimana cara mengeceknya?"
- LAB 04: "Apa itu provenance? Kenapa 'kelihatannya seperti AI' tidak cukup untuk menuduh?"

## 7. Etika, keamanan konten, dan privasi

- **Semua tool forensik dalam gim adalah simulasi tertulis** (rule-based, dibuat untuk latihan) — **bukan AI detector nyata** — dan selalu berlabel demikian di layar (`SIMULATED FORENSIC TOOL — bukan detector AI nyata`). Jangan biarkan siswa menyimpulkan bahwa ada alat yang bisa memvonis keaslian konten secara otomatis; di dunia nyata pun tidak ada.
- **Video dan gambar kasus adalah asset sintetis berlabel** yang dibuat khusus untuk latihan (video ber-watermark "SIMULASI MEDIA PELATIHAN"; gambar berupa ilustrasi buatan). Tidak ada wajah, suara, atau media orang sungguhan yang dimanipulasi.
- Gim sengaja **tidak mengajarkan aturan absolut** ("domain .top = penipu", "aneh = pasti AI", "metadata = pasti benar"). Jika siswa membawa "aturan cepat" seperti itu ke diskusi, luruskan — itulah salah satu tujuan pembelajarannya.
- Angka-angka di AI Lab (mis. "performa per kelompok" di LAB 03) **disederhanakan untuk pembelajaran** dan bukan rumus akurasi AI nyata — gim menampilkan disclaimer ini.
- **Privasi:** seluruh data siswa hanya ada di perangkat siswa; roster guru hanya ada di perangkat guru. Tidak ada data yang dikirim ke server mana pun. Class Code berpindah tangan hanya jika siswa memberikannya.
- Dan sekali lagi, sebagai pegangan penilaian: **"Skor SIGAP bukan nilai akademik tunggal. Gunakan bersama observasi, refleksi, diskusi, dan asesmen guru."**
