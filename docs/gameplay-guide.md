# SIGAP - Panduan Gameplay

Panduan ini menjelaskan filosofi desain, alur permainan, sistem skor, dan achievements SIGAP. Bagian per-CASE **tidak membocorkan jawaban**, jadi dokumen ini aman dibagikan. Kunci jawaban disimpan terpisah di `guru/kunci-jawaban.md`, folder yang dikecualikan dari situs publik.

---

## 1. Filosofi: metode investigasi, bukan tebak-tebakan

Setiap CASE mengikuti siklus investigasi yang sama (ditampilkan sebagai step indicator di layar):

**OBSERVE (AMATI) → HYPOTHESIZE (HIPOTESIS) → VERIFY/TEST (VERIFIKASI) → COMPARE (BANDINGKAN) → DECIDE (PUTUSKAN) → EXPLAIN (JELASKAN) → REFLECT (REFLEKSI)**

| Tahap | Yang dilakukan pemain |
|---|---|
| AMATI | Melihat materi kasus apa adanya, tanpa menyimpulkan |
| HIPOTESIS | Membuat dugaan awal yang bisa diuji (boleh direvisi) |
| VERIFIKASI | Memakai tool/sumber untuk mengumpulkan bukti |
| BANDINGKAN | Menimbang bukti satu sama lain, menilai kekuatannya |
| PUTUSKAN | Mengambil keputusan + menetapkan confidence (0–100) |
| JELASKAN | Memilih bukti yang mendukung keputusannya |
| REFLEKSI | Menjawab pertanyaan terbuka (tidak dinilai otomatis) |

Kesulitan gim datang dari **observasi, interpretasi, dan keputusan**: tidak pernah dari hotspot tersembunyi, grinding, atau tembok teks.

## 2. Prinsip epistemik SIGAP

Empat prinsip ini mengikat seluruh konten gim:

1. **Bukti punya kekuatan berbeda.** Evidence diberi peringkat LEMAH / SEDANG / KUAT. Satu bukti kuat lebih berarti daripada lima bukti lemah; beberapa bukti independen yang saling mendukung adalah dasar keputusan terbaik.
2. **Tool membantu, tidak menggantikan judgment.** Semua tool berlabel `SIMULATED FORENSIC TOOL, bukan detector AI nyata`. Tool hanya **mengarahkan perhatian** (menyorot kandidat region, menampilkan data); pemain sendiri yang menandai temuan dan menyimpulkan. Tidak pernah ada output "AI probability 94%".
3. **"Belum cukup bukti" bisa jadi jawaban benar.** Beberapa soal dan satu plate di CASE 002 memang paling tepat dijawab dengan menahan kesimpulan. Kejujuran epistemik ini dihargai skor penuh dan achievement.
4. **Tidak ada aturan absolut.** Gim tidak pernah mengajarkan "domain .top = penipu", "aneh = pasti AI", atau "metadata = pasti benar". Feedback selalu mengajarkan *penalaran*, bukan sekadar BENAR/SALAH.

Prinsip pendukung: jawaban teks bebas (refleksi) **tidak pernah dinilai otomatis**: disimpan untuk direview guru; hint bereskalasi per percobaan tetapi **tidak pernah membocorkan jawaban**.

## 3. CASE FILES (bagian siswa, tanpa spoiler)

### CASE 001: File Misteri
*Tema: APK berbahaya / social engineering · Kompetensi: Digital Safety (utama), Evidence Reasoning, Critical Thinking · XP 100*

Seorang siswa bernama Raka menerima chat dari akun yang mengaku temannya, berisi lampiran file "foto acara" yang meminta di-install. Alur:

1. Intro + tutorial universal (sekali saja, bisa di-skip).
2. **Investigation Tokens**: pemain hanya punya **2 token** untuk membuka 2 dari 4 sumber investigasi (FILE TYPE, SENDER, PERMISSIONS, DIRECT CONFIRMATION). Pilihan token mengubah jalannya investigasi, ini keputusan bermakna pertama.
3. **BANDINGKAN**: pemain menilai kekuatan tiap bukti (LEMAH/SEDANG/KUAT) dan mendapat feedback penalaran; setelah itu 2 sumber sisanya terbuka gratis.
4. **Evidence Board**: menghubungkan node SOURCE–EVIDENCE–RISK–CONCLUSION menjadi rantai penalaran (klik dua node untuk menghubungkan; hint bereskalasi jika keliru).
5. PUTUSKAN (4 opsi) + confidence + pilih bukti pendukung + debrief + refleksi.

Keterampilan yang dilatih: memeriksa kecocokan **klaim vs format file**, membaca izin aplikasi, verifikasi pengirim lewat jalur lain, alokasi sumber daya investigasi yang terbatas.

### CASE 002: Real or Generated?
*Tema: citra hasil AI / manipulasi visual · Kompetensi: AI Literacy (utama), Evidence Reasoning, Critical Thinking · XP 100*

Tiga "plate" gambar masuk ke lab: **Plate A** (kiriman viral), **Plate B** (SIMULASI KONTROL, pembanding), **Plate C** (kasus ambigu). Pemain memakai **AI Forensic Scanner** simulasi dengan 3 mode: TEXT SCAN, LIGHTING SCAN, TEXTURE SCAN. Scanner hanya menyorot region kandidat; pemain harus mengklik sendiri region yang menurutnya janggal.

Per plate: hipotesis awal → scan & tandai region → bandingkan side-by-side → confidence → kesimpulan, dengan **tiga pilihan wajib**: (a) kemungkinan manipulasi/generatif, (b) tidak ditemukan bukti manipulasi yang cukup, (c) belum cukup bukti.

Pelajaran inti kasus ini: **"Tidak menemukan bukti manipulasi ≠ membuktikan keaslian."** Plate B sengaja tidak pernah disebut "foto asli".

### CASE 003: Link Palsu
*Tema: phishing · Kompetensi: Digital Safety (utama), Critical Thinking, Evidence Reasoning · XP 100*

Email "paket tertahan" meminta pembayaran kecil dengan tenggat 1×24 jam. Pemain membedah 5 elemen: alamat pengirim, struktur URL (tap per bagian: protokol/subdomain/domain/TLD/path), teknik tekanan urgency, data yang diminta form, dan verifikasi mandiri lewat kanal resmi. Termasuk **Domain Challenge**: 3 soal membandingkan URL mirip; pemain harus memilih **beserta alasannya** (bukan menebak).

Keterampilan inti: **membaca domain dari kanan** (domain utama = bagian sebelum TLD paling kanan; nama merek di subdomain bisa dipalsukan siapa pun), mengenali tekanan sosial bernominal kecil, dan prinsip "Ekstensi domain bukan bukti penipuan. Periksa siapa pemilik domainnya."

### CASE 004: Phantom Signal (klimaks)
*Tema: deepfake / video termanipulasi · Kompetensi: AI Literacy, Evidence Reasoning, Critical Thinking, Ethical Reasoning · XP 100*

Potongan video seorang guru yang sedang menjelaskan proyek di kelas beredar dan diragukan keasliannya. Pemain membandingkan SUSPECT VIDEO dengan REFERENCE VIDEO (keduanya diturunkan dari satu rekaman asli yang dipakai dengan izin, ber-watermark "SIMULASI MEDIA PELATIHAN"), memilih hipotesis (Face / Lip-sync / Audio / Background / Metadata) yang menentukan tool pertama, lalu menguji dengan 5 tool simulasi: FRAME ANALYZER, LIP-SYNC ANALYZER, AUDIO WAVEFORM, BACKGROUND CONTINUITY, METADATA VIEWER (berlabel "SIMULATED FORENSIC METADATA"). Evidence bertimestamp; kesimpulan memakai 3 pilihan gaya CASE 002 + confidence.

Setelah debrief (penyelesaian pertama), terjadi **FINAL PHANTOM DECISION**: dilema etis tentang bagaimana merespons manipulasi. Pesan penutup gim menghindari klise "teknologi itu netral": *dampak teknologi dipengaruhi oleh desain, konteks, aturan, dan cara manusia menggunakannya.*

Keterampilan: analisis temporal (lip-sync, boundary artifact), pembandingan referensi, posisi metadata sebagai **bukti pendukung yang bisa dipalsukan**, dan penalaran etis.

## 4. AI Laboratory (4 mini-lab, XP 50 per lab)

| Lab | Konsep | Pesan inti |
|---|---|---|
| **LAB 01: Pattern Recognition** | 5 soal pola visual berpilihan ganda, tiap jawaban diikuti penjelasan aturan polanya; ada 1 soal jebakan di mana dua aturan berbeda sama-sama cocok dengan data awal | "AI bekerja dengan menemukan pola dari data, tapi pola yang tampak cocok belum tentu aturan sebenarnya"; kadang jawaban benar = "informasi belum cukup" |
| **LAB 02: Training Data** | Pemain melabeli 8–10 kartu data (termasuk yang ambigu) → "melatih model" simulasi → model meniru label pemain, termasuk kesalahannya; ada eksperimen kontrol dengan label sengaja salah | Model belajar dari contoh; kualitas label menentukan hasil ("garbage in, garbage out") |
| **LAB 03: AI Bias** | Berlabel besar `SIMULASI KONSEPTUAL`; slider komposisi data dua kelompok → performa per kelompok berubah; kuis penalaran ("model 95% akurat keseluruhan, pasti adil?") | Kelompok kurang terwakili di data bisa dilayani lebih buruk; akurasi harus dievaluasi **per kelompok**. Semua angka disederhanakan untuk pembelajaran, bukan rumus akurasi AI nyata |
| **LAB 04: Human or AI?** | Bukan tebak-tebakan: untuk 4 konten, pemain memilih **indikator** yang ia lihat, menilai uncertainty, lalu menjawab Manusia / AI / **belum cukup bukti** (minimal 1 konten memang berjawaban itu); skor menimbang kecocokan evidence, bukan hanya jawaban akhir | Tanpa **provenance** (riwayat asal konten), penampilan saja sering tidak cukup untuk memastikan |

Menyelesaikan keempat lab (non-practice) → achievement `ai-lab-analyst`.

## 5. Sistem scoring

### Skor kasus (0–100)

```
Skor = 40% Investigation Quality
     + 30% Decision Correctness (benar = 100, salah = 0)
     + 20% Evidence Relevance
     + 10% Confidence Calibration
```

- **Investigation Quality**: kualitas proses: sumber yang diperiksa sebelum memutuskan, kualitas hipotesis, sedikitnya langkah salah arah.
- **Decision Correctness**: keputusan utama benar/salah.
- **Evidence Relevance**: ketepatan bukti yang ditemukan/dipakai (mis. rating kekuatan yang tepat, region/anotasi yang benar, bukti pendukung yang dipilih saat EXPLAIN).
- **Confidence Calibration**: kecocokan keyakinan dengan kekuatan bukti.

> **Cap 59:** jika keputusan utama salah, skor total dipotong maksimal **59**: proses investigasi yang bagus tetap dihargai, tetapi tidak bisa "lulus" dengan keputusan keliru.

### Kalibrasi confidence (10%)

Sebelum memutuskan, pemain menetapkan confidence 0–100. Penilaiannya (lihat `js/scoring.js`):

- **Keputusan benar**: confidence ideal **75–90** → skor kalibrasi 100 ("well calibrated"). Di atas 90 skornya menurun (≥98 = flag *overconfident*; hampir tidak ada kesimpulan investigasi yang layak diberi keyakinan mendekati 100%). Jauh di bawah 75 juga menurun (<45 = flag *underconfident*).
- **Keputusan salah**: confidence rendah (≤40) justru mendapat skor kalibrasi tinggi (80): salah tapi jujur dengan ketidakpastiannya adalah sikap epistemik sehat. Confidence ≥70 saat salah = *overconfident* (dan tercatat sebagai misconception untuk guru).

Flag kalibrasi terakumulasi di profil dan muncul di FINAL REPORT serta Teacher Dashboard.

### XP vs Performance: dua hal berbeda

- **XP/Level = PROGRESS**: mengukur aktivitas (CASE 100 XP, Lab 50 XP, badge 25–50 XP; 250 XP per level). XP **bukan** ukuran kemampuan.
- **Kompetensi = PERFORMANCE**: 5 kompetensi (Critical Thinking, AI Literacy, Digital Safety, Evidence Reasoning, Ethical Reasoning) dihitung sebagai **rata-rata berbobot** dari skor tiap CASE/Lab. Belum ada data → ditampilkan "belum ada data", bukan 0.
- FINAL REPORT menampilkan keduanya di bagian terpisah, plus kekuatan/kelemahan yang dipersonalisasi dari data nyata.

### Practice run (anti-farming)

Mengulang CASE/Lab yang sudah pernah selesai = **PRACTICE RUN**: tidak ada XP, tidak ada perubahan kompetensi, tidak ada badge, tidak ada flag kalibrasi baru. `latestScore` tetap diperbarui (dan `bestScore` jika lebih tinggi), jadi latihan tetap bermakna, tapi tidak bisa dipakai menaikkan level/kompetensi. Debrief menampilkan banner "PRACTICE RUN: XP tidak diberikan".

## 6. Achievements

Badge menghargai **perilaku bernalar**, bukan jumlah klik. Hanya bisa terbuka pada run non-practice.

| Badge | Cara mendapat | XP |
|---|---|---|
| 🔍 First Evidence | Menemukan bukti pertamamu | 25 |
| 🎯 Token Strategist | Dua token awal CASE 001 keduanya menghasilkan bukti relevan | 25 |
| 🌐 Domain Detective | Seluruh Domain Challenge CASE 003 benar beserta alasannya | 25 |
| ⚖️ Calibrated Thinker | Keputusan benar dengan confidence terkalibrasi baik (75–90%) | 25 |
| 👁 Phantom Hunter | Menemukan minimal dua artefak temporal di CASE 004 | 25 |
| 🧭 Ethical Agent | Menolak membalas manipulasi dengan manipulasi (keputusan akhir PHANTOM) | 25 |
| 🧪 AI Lab Analyst | Menyelesaikan keempat modul AI Laboratory | 25 |
| 📁 Evidence Master | Mengumpulkan seluruh bukti sebuah CASE sebelum memutuskan | 25 |
| 🤔 Honest Uncertainty | Memilih "belum cukup bukti" saat itu memang kesimpulan paling tepat | 25 |
| 🎓 Academy Graduate | Menyelesaikan keempat CASE FILES | 50 |

Di layar Achievements, badge terkunci tetap menampilkan nama dan deskripsinya (edukatif, bukan misteri) dengan ikon redup + tag TERKUNCI.

---

## 7. Kunci jawaban

Kunci jawaban tiap CASE dan Lab **tidak disimpan di file ini** supaya panduan ini
aman dibagikan/dipublikasikan. Materinya ada di `guru/kunci-jawaban.md`, folder
yang dikecualikan dari situs publik.
