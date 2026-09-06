# SIGAP - Sistem Investigasi Digital Anti Palsu

**SIGAP** adalah gim edukasi investigasi digital untuk siswa SMP (Bahasa Indonesia). Pemain berperan sebagai agen muda di SIGAP Academy yang menyelidiki kasus-kasus dunia digital: file berbahaya, gambar hasil AI, phishing, dan deepfake, dengan metode investigasi yang disiplin, bukan tebak-tebakan.

> Tagline: **"Jangan Langsung Percaya. Periksa Buktinya."**

Teknologi: **vanilla HTML/CSS/JS**, tanpa framework, tanpa build step, tanpa backend. Seluruh data tersimpan **hanya di perangkat pemain** (LocalStorage). Aplikasi berjalan **offline-first sebagai PWA** dan bisa di-install ke home screen.

---

## Fitur

- **4 CASE FILES** berisi misi investigasi naratif:
  - `CASE 001: File Misteri` (APK berbahaya / social engineering)
  - `CASE 002: Real or Generated?` (citra hasil AI / manipulasi visual)
  - `CASE 003: Link Palsu` (phishing / keamanan data)
  - `CASE 004: Phantom Signal` (deepfake / video termanipulasi, klimaks cerita PHANTOM)
- **AI LABORATORY** berisi 4 mini-lab literasi AI: Pattern Recognition, Training Data, AI Bias, Human or AI?
- **Sistem scoring edukatif**: skor kasus = 40% kualitas investigasi + 30% keputusan + 20% relevansi bukti + 10% kalibrasi confidence; keputusan salah membatasi skor maksimal 59.
- **XP/Level (progress) terpisah dari kompetensi (performance)**: XP mengukur aktivitas, bukan kemampuan. 5 kompetensi: Critical Thinking, AI Literacy, Digital Safety, Evidence Reasoning, Ethical Reasoning.
- **Practice run**: mengulang kasus/lab yang sudah selesai tidak memberi XP dan tidak mengubah kompetensi (anti-farming).
- **10 achievements** yang menghargai penalaran (mis. `honest-uncertainty` untuk berani menjawab "belum cukup bukti").
- **Evidence Archive, Final Report, Teacher Dashboard** dengan ekspor/impor **Class Code** (tanpa server).
- **Aksesibilitas**: navigasi keyboard, `:focus-visible`, target sentuh ≥44px, reduced-motion, responsif 360–1920px.
- **Prinsip epistemik**: semua tool forensik adalah **simulasi tertulis** berlabel `SIMULATED FORENSIC TOOL, bukan detector AI nyata`; tidak pernah ada "AI probability 94%"; tool mengarahkan perhatian, manusia yang menyimpulkan.

---

## Menjalankan secara lokal

SIGAP adalah situs statis. Jalankan lewat server HTTP lokal dari folder proyek:

```bash
# Opsi 1: Python (bawaan hampir semua sistem)
cd sigap
python -m http.server 8000
# buka http://localhost:8000

# Opsi 2: Node.js
cd sigap
npx serve .
# buka URL yang ditampilkan (mis. http://localhost:3000)
```

> **Penting:** jangan membuka `index.html` langsung lewat `file://`. Service worker (fitur offline/PWA) **hanya berfungsi lewat `http://localhost` atau `https://`**. Lewat `file://` gim tetap bisa dibuka, tetapi `app.js` sengaja melewati registrasi service worker sehingga mode offline dan install PWA tidak tersedia.

Tidak ada dependency, `npm install`, atau proses build apa pun.

---

## Deploy ke GitHub Pages

1. Buat repository baru di GitHub (mis. `sigap`).
2. Push seluruh isi folder proyek ke branch `main`:
   ```bash
   cd sigap
   git init                      # lewati jika sudah menjadi repo git
   git add .
   git commit -m "SIGAP initial release"
   git branch -M main
   git remote add origin https://github.com/USERNAME/sigap.git
   git push -u origin main
   ```
3. Di GitHub: **Settings → Pages → Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main**, folder **/(root)** → **Save**.
4. Tunggu 1–2 menit. Situs tersedia di `https://USERNAME.github.io/sigap/`.
5. Verifikasi:
   - Buka situs, cek tidak ada error di console (F12).
   - `manifest.json`, `service-worker.js`, dan semua path di proyek ini **relatif** (`./...`), sehingga aman dipasang di sub-path `/sigap/` tanpa konfigurasi tambahan.
   - Uji offline: buka situs sekali (agar precache selesai), matikan jaringan (DevTools → Network → Offline), muat ulang. Gim harus tetap berjalan.
6. **Setiap rilis berikutnya:** naikkan `CACHE_VERSION` di `service-worker.js` (lihat bagian PWA di bawah) sebelum push, agar pengguna lama menerima versi baru.

---

## Struktur folder

```
sigap/
├── index.html              # Satu-satunya halaman; memuat semua CSS/JS (classic scripts, defer)
├── manifest.json           # PWA manifest (ikon, warna, standalone)
├── service-worker.js       # Cache offline-first (lihat bagian PWA)
├── SPEC.md                 # Kontrak integrasi antar-modul (untuk developer)
├── briefs/                 # Brief desain tiap modul (untuk developer)
├── docs/
│   ├── gameplay-guide.md   # Panduan gameplay & sistem skor
│   ├── teacher-guide.md    # Panduan guru
│   └── playtest-checklist.md # Checklist QA
├── css/                    # fonts, main, components, game, screens, case001–004, ai-lab, responsive
├── js/
│   ├── storage.js          # Wrapper LocalStorage (fallback in-memory, tahan korupsi)
│   ├── state.js            # State global + skema + migrasi + profil/Agent ID
│   ├── audio.js            # SFX prosedural (WebAudio) + pemutar narasi opsional
│   ├── router.js           # Hash router (#/case001 dst.)
│   ├── scoring.js          # Skor kasus/lab, kalibrasi, kompetensi, XP
│   ├── achievements.js     # Unlock badge (hanya non-practice)
│   ├── app.js              # Boot: error guard, reduced-motion, registrasi SW
│   ├── components/         # toast, modal, dialogue, evidence-card, confidence-slider, reflection, chrome (topbar/background/ui)
│   ├── data/               # missions.js, dialogues.js, achievements-data.js, ai-lab-data.js
│   ├── games/              # case001–004, evidence-board (reusable), ai-lab
│   └── screens/            # title, academy, missions(+archive+achievements), report, teacher
└── assets/
    ├── fonts/              # Space Grotesk & IBM Plex Mono (woff2, self-hosted)
    ├── images/             # favicon.svg, icon-192/512/maskable-512.png
    ├── audio/
    │   ├── aruna/          # (opsional) file narasi Aruna
    │   ├── phantom/        # (opsional) file narasi Phantom
    │   └── sfx/            # (opsional; SFX default dibangkitkan prosedural via WebAudio)
    ├── characters/         # aset karakter
    └── cases/
        ├── case002/        # plate-a.svg, plate-b.svg, plate-c.svg
        └── case004/        # suspect.mp4, reference.mp4 (+ generate.py, measure.py)
```

---

## Penyimpanan (LocalStorage) & migrasi skema

Semua key diawali `sigap_` (lihat `js/storage.js`):

| Key | Isi |
|---|---|
| `sigap_save` | State utama pemain (JSON, lihat skema di bawah) |
| `sigap_known_ids` | Daftar Agent ID yang pernah dibuat di perangkat (jaminan unik lokal) |
| `sigap_teacher_roster` | Roster Teacher Dashboard (terpisah dari data siswa) |
| `sigap_save_corrupt_backup` | Cadangan otomatis jika save terdeteksi korup |

Skema state (`SCHEMA_VERSION = 1`, di `js/state.js`):

```js
{
  version: 1,
  player: { name, agentId /* SGP-XXXX */, xp, level, createdAt },
  settings: { sound, narration, reducedMotion },
  progress: {
    cases: { case001: { completed, attempts, practiceRuns, bestScore,
                        latestScore, breakdown, decision, confidence,
                        evidence: [], startedAt, completedAt }, ... },
    labs:  { lab01: { completed, attempts, bestScore, latestScore, completedAt }, ... }
  },
  performance: {
    raw: { criticalThinking: { sum, weight }, ... },   // rata-rata berbobot per kompetensi
    flags: { overconfident, underconfident, wellCalibrated },
    misconceptions: [ { caseId, text, at } ]           // maksimal 40 entri terakhir
  },
  reflections: { contextId: { questions, answers, gradedBy: 'teacherReview', savedAt } },
  achievements: [], tutorials: {}, timestamps: {},
  story: { phantomIntroSeen, finalDecision }
}
```

**Cara kerja migrasi** (`migrate()` + `mergeDefaults()` di `state.js`):

- Save lama di-*deep-merge* ke atas state default, sehingga key yang hilang tidak pernah membuat aplikasi crash.
- Jika `saved.version` lebih baru dari aplikasi, field yang dikenali tetap dipakai (downgrade aman).
- **Menambah versi skema baru:** naikkan `SCHEMA_VERSION`, lalu tambahkan blok upgrade di `migrate()`:
  ```js
  if (saved.version === 1) { /* transformasi data v1 → v2 */ saved.version = 2; }
  ```
- Save yang korup (JSON tidak valid) dicadangkan ke `sigap_save_corrupt_backup` lalu dihapus, lalu aplikasi mulai bersih tanpa error.

---

## PWA & offline

`service-worker.js` menerapkan strategi:

- **Precache** seluruh app shell + asset kritis saat install (per file, satu asset gagal tidak membatalkan install).
- **Cache-first** untuk semua request GET same-origin; hasil network yang sukses ditulis balik ke cache.
- **Navigasi** offline jatuh ke `index.html`.
- **Subresource yang gagal TIDAK PERNAH dibalas HTML shell**: gambar mendapat SVG transparan 1×1, selainnya `Response` 504.

### Merilis update (bump CACHE_VERSION)

1. Buka `service-worker.js`, ubah baris:
   ```js
   var CACHE_VERSION = 'sigap-v1';   // → 'sigap-v2', 'sigap-v3', dst.
   ```
2. Jika Anda **menambah file baru** (CSS/JS/asset), tambahkan path-nya ke array `PRECACHE` agar tersedia offline.
3. Deploy. Saat pengguna membuka situs, SW baru ter-install (`skipWaiting` + `clients.claim`), cache versi lama dihapus otomatis di event `activate`.
4. Uji: hard reload → DevTools → Application → Service Workers harus menampilkan versi aktif baru; Cache Storage hanya berisi `sigap-vN` terbaru.

---

## Mengganti asset

### Plate SVG CASE 002 (`assets/cases/case002/plate-a|b|c.svg`)

- Ukuran acuan ~**640×420**, gaya ilustrasi datar (kafe/jalan kota dengan signage).
- Plate dimuat sebagai `<img src="...svg">` dengan **overlay hotspot `<div>` absolut berbasis koordinat %** di atasnya, jika Anda menggeser posisi indikator di SVG, **sesuaikan koordinat region** di `js/games/case002.js`.
- Kontrak isi per plate (jangan dilanggar):
  - **Plate A**: 3 indikator yang benar-benar terlihat: inkonsistensi teks signage, arah bayangan bertentangan, tekstur berulang/melebur.
  - **Plate B**: versi konsisten, wajib berlabel **"SIMULASI KONTROL (pembanding)"**. Jangan pernah menyebutnya "foto asli/real/verified".
  - **Plate C**: ambigu, hanya 1 indikator lemah (kesimpulan terbaik: "belum cukup bukti").
- Target sentuh hotspot minimal 44px. Setelah mengganti file, bump `CACHE_VERSION`.

### Video CASE 004 (`assets/cases/case004/suspect.mp4`, `reference.mp4`)

- Spesifikasi: durasi 9 detik, 640×360 @25fps, **<1,5 MB**, h264+aac, `-movflags +faststart`, **watermark "SIMULASI MEDIA PELATIHAN"** di pojok.
- Master: rekaman asli (1920×1080, 60 fps, 8,0 s) yang dipakai dengan izin. **Master tidak disimpan di repo** (3,1 MB dan tidak pernah dimuat aplikasi); simpan sendiri, lalu berikan path-nya ke skrip. Kedua aset diturunkan dari master yang **sama** oleh `assets/cases/case004/generate.py` (ffmpeg): `python3 generate.py /path/ke/master.mp4`. Untuk mengganti video, **ganti master lalu jalankan ulang `generate.py`**, jangan sekadar menaruh video lain, karena deskripsi evidence dalam gameplay harus cocok dengan artefak yang benar-benar ada di video:
  - ±00:03.4 lip-sync mismatch (bibir mendahului audio ~0,4 s, sinkron lagi di 00:04.9);
  - ±00:04.9 sambungan kasar lalu pitch turun ~2,5 semitone + tremolo 9 Hz sampai akhir;
  - ±00:05.6 boundary artifact (salinan wajah bergeser + kotak magenta, 3–4 frame);
  - 00:06.0+ dua blok warna di slide proyektor bertukar dibanding reference.
- `generate.py` berjalan **tiga tahap**: render base lossless → bangun tambalan warna slide dengan OpenCV (blok dicari ulang tiap frame, jadi tambalan ikut goyangan kamera) → komposit akhir. Berkas antara dihapus otomatis. Butuh `numpy` + `opencv-python<5`.
- Setelah ganti master, **ukur ulang** grafik in-game dengan `assets/cases/case004/measure.py` (butuh `numpy`, `opencv-python<5`, dan `mediapipe==0.10.x` untuk landmark bibir) dan tempel hasilnya ke `MOUTH_DATA` / `AUDIO_REF` / `AUDIO_SUS` di `js/games/case004.js`; sesuaikan juga `FACE` (kotak kepala) dan `SLIDE_ROI` + ambang warna `BLOCK_*` di `generate.py` terhadap frame baru. Skrip mencetak berapa blok yang berhasil terdeteksi, kalau kurang dari 2× jumlah frame, ambangnya perlu disetel ulang.
- Verifikasi hasil render dengan `ffprobe` dan ekstraksi frame (`ffmpeg -ss 5.6 -i suspect.mp4 -frames:v 1 out.png`) sebelum dirilis. Bump `CACHE_VERSION` setelah ganti.

### Ikon aplikasi

- File: `assets/images/favicon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`.
- Dirujuk dari tiga tempat, jadi perbarui ketiganya jika nama file berubah: `index.html` (favicon + apple-touch-icon), `manifest.json` (icons), dan `PRECACHE` di `service-worker.js`.
- Ikon maskable perlu safe-zone (konten penting dalam ~80% area tengah).

---

## Menambah dubbing / narasi

Narasi bersifat **sepenuhnya opsional**: gim berjalan normal tanpa satu pun file audio.

1. Letakkan file audio (disarankan `.mp3` atau `.m4a`) di:
   - `assets/audio/aruna/` untuk suara Aruna (mentor)
   - `assets/audio/phantom/` untuk suara Phantom (antagonis)
2. Pada baris dialog (di `js/data/dialogues.js` atau dialog milik case), isi field `voice` dengan path **relatif terhadap `assets/audio/`**:
   ```js
   { speaker: 'aruna', text: 'Jangan langsung percaya. Periksa buktinya.', voice: 'aruna/intro-01.mp3' }
   ```
3. Komponen dialog memutar file lewat `SIGAP.audio.playNarration(relPath)`. **Fallback otomatis**: jika file tidak ada, format tidak didukung, autoplay diblokir, atau toggle Narasi dimatikan pemain, pemutaran gagal **secara diam**: teks dialog tetap tampil normal, tanpa error.
4. Agar narasi tersedia offline, tambahkan file-nya ke `PRECACHE` di `service-worker.js` (opsional; ingat batas kuota cache) dan bump `CACHE_VERSION`.
5. SFX (klik, scan, dsb.) tidak butuh file; dibangkitkan prosedural via WebAudio dan menghormati toggle Suara.
6. Untuk membuat/mengganti satu baris narasi dengan suara yang konsisten dengan aset yang ada:
   ```
   pip install edge-tts
   python3 tools/generate_narration.py aruna/case004-intro-01.mp3 "Teks dialog persis seperti di kode..."
   ```
   Skrip memakai suara yang dipilih dengan mencocokkan speaker-embedding ke aset Aruna lama, dan meng-encode ke format yang sama (mono, 44,1 kHz, 112 kbps). **Teks argumen harus sama persis dengan field `text` di kode**, kalau berbeda, subtitle dan suara jadi tidak cocok. Perlu koneksi internet (memakai layanan TTS Microsoft Edge).

---

## Teacher Dashboard & Class Code

Alur **tanpa server**: cocok untuk lab komputer offline:

1. **Siswa**: buka **FINAL REPORT** → tombol **EXPORT** → tersalin sebuah **Class Code** dengan format:
   ```
   SGC1.<base64(JSON)>
   ```
   Payload JSON: `{ schemaVersion: 1, agentId, displayName, exportedAt, progress: {ringkasan case & lab}, performance: {summary, flags}, reflections }`.
2. **Siswa mengirim kode ke guru** (chat kelas, flashdisk, tulis tangan, apa pun).
3. **Guru**: buka **Dashboard Guru** (`#/teacher`, bisa diakses tanpa profil siswa) → tempel kode → **Impor**.
   - Validasi ketat: prefix `SGC1.`, decode base64, parse JSON, cek `schemaVersion === 1` dan `agentId` ada. Kode tidak valid → pesan kesalahan yang ramah, **tidak pernah crash**.
   - Identitas siswa = `displayName · akhiran agentId` (mis. "Raka · A7K2"), jadi dua siswa bernama sama tidak saling menimpa. Impor ulang agentId yang sama = data diperbarui.
4. Roster tersimpan di `sigap_teacher_roster` (terpisah dari save siswa). Guru dapat melihat tabel skor, kompetensi, flags kalibrasi, misconception warnings, dan teks refleksi; menghapus per siswa atau semua.

Panduan lengkap membaca dashboard: lihat [`docs/teacher-guide.md`](docs/teacher-guide.md).

---

## Dokumentasi lain

- [`docs/gameplay-guide.md`](docs/gameplay-guide.md): filosofi desain, alur tiap CASE/Lab, sistem skor & achievements (berisi bagian spoiler khusus guru).
- [`docs/teacher-guide.md`](docs/teacher-guide.md): tujuan pembelajaran, skenario kelas 2–4 JP, cara membaca dashboard, diskusi lanjutan.
- [`docs/playtest-checklist.md`](docs/playtest-checklist.md): checklist QA lengkap sebelum rilis.

## Privasi & etika

- Seluruh data pemain hanya tersimpan di perangkat (LocalStorage). Tidak ada akun, tidak ada server, tidak ada pelacakan.
- Semua "tool forensik" dalam gim adalah **simulasi tertulis untuk latihan**, bukan detector AI nyata, dan selalu diberi label demikian di dalam gim.
- Gambar kasus (CASE 001-003) adalah **asset sintetis berlabel** yang dibuat khusus untuk latihan.
- Video CASE 004 berbeda: sumbernya **rekaman asli yang dipakai dengan izin**. Versi "suspect" sengaja diberi artefak buatan, kedua video ber-watermark "SIMULASI MEDIA PELATIHAN", dan tidak dimaksudkan untuk disebarkan di luar konteks kelas. Jika Anda mengganti masternya dengan rekaman sendiri, pastikan orang yang tampil sudah memberi izin.
