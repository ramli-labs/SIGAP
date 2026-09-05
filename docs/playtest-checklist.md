# SIGAP — Playtest / QA Checklist

Checklist lengkap sebelum rilis. Jalankan lewat server HTTP lokal (`python -m http.server`) **dan** di deployment GitHub Pages. Uji minimal di: Chrome desktop, satu browser mobile (Android Chrome), dan viewport 360px. Centang `[x]` setiap butir yang lulus; setiap kegagalan dicatat dengan langkah reproduksi.

## A. Kesehatan teknis dasar

- [ ] 1. Buka aplikasi, mainkan tiap route (`title academy missions archive achievements report teacher ailab case001–004`) — **tidak ada error/warning di console** pada seluruh alur.
- [ ] 2. Semua file JS lolos `node --check` (tidak ada syntax error).
- [ ] 3. Tidak ada spam `console.log` sisa debugging.
- [ ] 4. Tidak ada request 404 di tab Network (asset, font, CSS, JS).
- [ ] 5. Layar tidak pernah blank total: paksa error (mis. hapus satu asset) → error guard menampilkan toast, aplikasi tetap hidup.
- [ ] 6. Buka via `file://` → gim tetap termuat (tanpa SW), tidak ada crash registrasi service worker.
- [ ] 7. LocalStorage dinonaktifkan (mode privat ketat) → muncul peringatan "progres tidak akan tersimpan", gim tetap bisa dimainkan (fallback in-memory).
- [ ] 8. Isi `sigap_save` dengan JSON rusak secara manual → aplikasi mulai bersih tanpa error, backup `sigap_save_corrupt_backup` dibuat.

## B. Profil, onboarding, tutorial

- [ ] 9. Onboarding pertama: modal profil tidak bisa di-dismiss sebelum profil dibuat.
- [ ] 10. Validasi Nama Agen: <2 atau >24 karakter → error inline (bukan `alert()`), tidak bisa lanjut.
- [ ] 11. Profil dibuat → **Agent ID format `SGP-XXXX`** tampil; buat beberapa profil (reset berulang) → ID **unik** di perangkat (tidak pernah duplikat, cek `sigap_known_ids`).
- [ ] 12. Dialog onboarding dan **semua tutorial bisa di-skip**; tutorial universal & scanner hanya muncul **sekali** (cek `tutorials{}` setelah dilihat).
- [ ] 13. Kembali ke title setelah punya profil → tombol berubah "LANJUTKAN" + "Mulai profil baru" meminta konfirmasi sebelum reset.
- [ ] 14. Reset profil → seluruh state kembali default (XP 0, progress kosong, achievements kosong).

## C. Alur tiap CASE selesai end-to-end

- [ ] 15. **CASE 001** selesai penuh: intro → token → bandingkan → evidence board → keputusan → debrief → cinematic "CASE CLOSED" → refleksi → kembali/next.
- [ ] 16. **CASE 002** selesai penuh (3 plate → laporan akhir → debrief → refleksi).
- [ ] 17. **CASE 003** selesai penuh (5 elemen investigasi + domain challenge → keputusan → debrief → refleksi).
- [ ] 18. **CASE 004** selesai penuh (video → hipotesis → tools → keputusan → debrief → FINAL PHANTOM DECISION → refleksi).
- [ ] 19. Keempat lab AI (LAB 01–04) selesai penuh dengan debrief masing-masing.
- [ ] 20. Meninggalkan case di tengah (klik back/ubah hash) → tidak ada timer/interval bocor (`onLeave` bersih), kembali masuk tidak error.
- [ ] 21. Tidak ada case yang bisa diselesaikan dengan "klik semua tombol tanpa berpikir" — keputusan salah/asal menghasilkan skor rendah dan feedback.

## D. Integritas epistemik (aturan keras konten)

- [ ] 22. **Hint tidak pernah membocorkan jawaban** — cek eskalasi hint evidence board (attempt 1/2/3) dan semua hint lain: makin spesifik, tidak pernah menyebut jawaban final.
- [ ] 23. **Plate B CASE 002 tidak pernah disebut "foto asli/real/verified"** — labelnya "SIMULASI KONTROL (pembanding)"; feedback menegaskan beda "tidak ditemukan bukti" vs "terbukti asli".
- [ ] 24. **Tidak ada fake AI probability** di mana pun (cari string "%": tidak ada output tool berbentuk "AI probability = NN%").
- [ ] 25. Semua tool simulasi menampilkan **label `sim-label`** ("SIMULATED FORENSIC TOOL — bukan detector AI nyata"): scanner CASE 002, kelima tool CASE 004.
- [ ] 26. **Metadata viewer CASE 004 berlabel besar "SIMULATED FORENSIC METADATA"** dan teksnya mengajarkan metadata bisa dipalsukan/hilang (bukti pendukung, bukan final).
- [ ] 27. LAB 03 berlabel "SIMULASI KONSEPTUAL" + disclaimer "Angka dalam simulasi disederhanakan… bukan rumus akurasi AI nyata".
- [ ] 28. Tidak ada pengajaran absolut di teks mana pun: tidak ada ".top = penipu", "aneh = AI", "metadata = pasti benar", "teknologi itu netral".
- [ ] 29. CASE 003: menjawab alasan "karena .top" → dikoreksi eksplisit + tercatat misconception "menggeneralisasi TLD".
- [ ] 30. Opsi "belum cukup bukti" tersedia di ketiga kesimpulan plate CASE 002, keputusan CASE 004, dan LAB 04 — dan **benar-benar menjadi jawaban benar** di Plate C dan ≥1 konten LAB 04 (skor penuh + penjelasan).
- [ ] 31. **Tidak ada klaim edukasi menyesatkan** di UI/dokumen: tidak menjanjikan "kamu akan bisa mendeteksi semua hoaks/deepfake"; disclaimer "Tentang SIGAP" akurat.
- [ ] 32. LAB 01 memuat soal ● ■■ ● ■■■■ ● ? dengan jawaban benar **■■■■■■■■ (pola 2→4→8)** dan penjelasan aturan pola setelah menjawab; soal jebakan dua-aturan menyediakan opsi "informasi belum cukup".

## E. Scoring, XP, dan anti-farming

- [ ] 33. Debrief menampilkan breakdown 4 komponen (Investigation 40% / Decision 30% / Evidence 20% / Calibration 10%) + total + feedback kalibrasi.
- [ ] 34. **Keputusan salah → skor total ≤59** (uji: investigasi sempurna + keputusan salah → total tetap 59).
- [ ] 35. Kalibrasi: keputusan benar + confidence 75–90 → skor kalibrasi 100; benar + 100 → turun + verdict overconfident (≥98); salah + ≤40 → 80 (wellCalibrated); salah + ≥70 → overconfident + misconception tercatat.
- [ ] 36. **Refleksi/teks bebas tidak dinilai otomatis dan tidak dinilai dari panjang** — jawaban 1 kata dan 3 paragraf diperlakukan sama (tersimpan `gradedBy: 'teacherReview'`, tidak memengaruhi skor).
- [ ] 37. **Replay = practice run**: ulangi case yang sudah selesai → banner "PRACTICE RUN — XP tidak diberikan" tampil; XP **tidak** bertambah; kompetensi **tidak** berubah; badge **tidak** terbuka; flag kalibrasi **tidak** bertambah.
- [ ] 38. Practice run tetap memperbarui `latestScore` (dan `bestScore` jika lebih tinggi).
- [ ] 39. Replay lab juga practice (tanpa XP/kompetensi).
- [ ] 40. XP: CASE 100, Lab 50, badge sesuai data; level naik tiap 250 XP dengan toast "Naik ke Level N".
- [ ] 41. **PROGRESS vs PERFORMANCE terpisah**: FINAL REPORT punya dua bagian jelas; XP tinggi tanpa skor bagus tidak menaikkan kompetensi.
- [ ] 42. Kompetensi tanpa data → tampil "belum ada data"/strip kosong, **bukan 0**.
- [ ] 43. FINAL REPORT: KEKUATANMU/HAL YANG PERLU DILATIH dipersonalisasi dari data nyata (flags, misconceptions) — bukan teks generik saat data ada.

## F. Evidence, achievements, misi

- [ ] 44. `recordEvidence` idempotent: menemukan bukti yang sama dua kali tidak menduplikasi entri di archive.
- [ ] 45. Evidence Archive menampilkan semua bukti lintas case dengan nama case; kosong → empty state ramah; evidenceId tanpa katalog → tampil mono defensif (tidak crash).
- [ ] 46. Achievements: `first-evidence` (bukti pertama), `token-strategist` (2 token kuat CASE 001), `domain-detective` (3 soal + alasan benar), `calibrated-thinker`, `phantom-hunter` (≥2 artefak temporal), `ethical-agent` (pilihan C final), `ai-lab-analyst` (4 lab), `evidence-master` (semua bukti 1 case sebelum memutuskan), `honest-uncertainty` (Plate C benar), `academy-graduate` (4 case) — semua terbuka pada kondisi yang benar dan **hanya pada run non-practice**.
- [ ] 47. Layar achievements: badge terkunci menampilkan nama + deskripsi + tag TERKUNCI (bukan "???"); XP reward tertera.
- [ ] 48. Missions: status BELUM DIMULAI/SELESAI + bestScore/latestScore akurat; tombol ULANGI berlabel "(PRACTICE RUN — tanpa XP)"; badge "DISARANKAN" pada case pertama yang belum selesai.
- [ ] 49. Story: dialog PHANTOM pertama muncul sekali setelah CASE 001 non-practice pertama; easter egg glitch di hub setelahnya; `story.finalDecision` tersimpan setelah CASE 004.

## G. Teacher Dashboard & Class Code

- [ ] 50. Export dari FINAL REPORT menghasilkan kode berprefix `SGC1.` yang bisa didecode (base64 → JSON dengan schemaVersion 1, agentId, progress, performance, reflections); tombol Salin bekerja (clipboard + fallback) dengan toast.
- [ ] 51. Dashboard guru bisa diakses **tanpa profil siswa** (`#/teacher` langsung dari fresh browser).
- [ ] 52. Disclaimer wajib tampil di dashboard: "Skor SIGAP bukan nilai akademik tunggal…".
- [ ] 53. **Class Code invalid tidak pernah crash**: uji string kosong, "halo", `SGC1.` + base64 rusak, `SGC1.` + base64 dari JSON non-objek, `SGC9.`-prefix, kode terpotong → semua memberi pesan "Class Code tidak valid…" yang ramah.
- [ ] 54. **Dua siswa bernama sama tidak saling menimpa** — impor dua kode dengan displayName sama tapi agentId beda → dua baris tampil sebagai "Nama · XXXX" berbeda.
- [ ] 55. Impor ulang agentId yang sama → baris digantikan data terbaru + toast (bukan duplikat).
- [ ] 56. Detail siswa (klik baris): breakdown skor, 5 kompetensi, flags kalibrasi, misconception warnings, teks refleksi penuh berlabel "untuk direview guru".
- [ ] 57. Hapus satu siswa & hapus semua → ada konfirmasi; empty state ramah setelah kosong; roster tersimpan di `sigap_teacher_roster` (bukan `sigap_save`).

## H. Audio & narasi

- [ ] 58. Toggle **Suara** OFF → tidak ada SFX sama sekali di seluruh gim; ON → SFX kembali. Setting bertahan setelah reload.
- [ ] 59. Toggle **Narasi** OFF → tidak ada pemutaran narasi; dialog tetap berfungsi penuh.
- [ ] 60. Tanpa satu pun file di `assets/audio/` → seluruh dialog (termasuk yang punya field `voice`) berjalan normal, **tanpa error console** (fallback diam).
- [ ] 61. Audio tidak diputar sebelum gesture pengguna pertama (tidak ada warning autoplay policy).

## I. Aksesibilitas & responsif

- [ ] 62. **Seluruh alur bisa diselesaikan dengan keyboard saja** (Tab/Enter/Space/panah): dialog, option cards, evidence board (hubungkan node tanpa drag), slider confidence, modal (fokus terperangkap, Esc menutup yang dismissible).
- [ ] 63. `:focus-visible` terlihat jelas di semua elemen interaktif; skip-link "Langsung ke konten utama" berfungsi.
- [ ] 64. Semua target sentuh ≥44px (termasuk hotspot plate CASE 002 dan node evidence board).
- [ ] 65. Tidak ada informasi yang disampaikan hanya lewat warna (selalu ikon + teks, mis. verdict debrief, kekuatan bukti).
- [ ] 66. **Viewport 360px**: semua layar bisa dipakai tanpa scroll horizontal; case-layout menumpuk; teks tidak terpotong; uji juga 768px dan 1920px.
- [ ] 67. Reduced motion ON → typewriter/partikel/scanline/glitch dinonaktifkan atau disederhanakan; setting bertahan.
- [ ] 68. Video CASE 004 punya fallback: jika video gagal diputar → "transkrip observasi" tertulis tersedia dan case tetap bisa diselesaikan.

## J. PWA & offline

- [ ] 69. Lighthouse/DevTools: manifest valid, **PWA installable** (ikon 192/512/maskable, standalone, theme color); install ke home screen Android berjalan.
- [ ] 70. Setelah kunjungan pertama online, matikan jaringan → reload: **seluruh gim berjalan offline**, termasuk keempat case dan AI Lab.
- [ ] 71. **Video CASE 004 dapat diputar offline** (suspect.mp4 & reference.mp4 ter-precache; cek Cache Storage).
- [ ] 72. **Service worker tidak pernah mengembalikan HTML untuk asset yang gagal**: offline, minta asset yang tidak di-cache → gambar mendapat SVG placeholder, script/style/media mendapat respons error 504 — bukan `index.html` (cek tab Network: tidak ada JS/CSS berisi `<!DOCTYPE`).
- [ ] 73. Navigasi offline ke route dalam (mis. langsung buka `…/#/case003`) → app shell termuat dari cache.
- [ ] 74. Bump `CACHE_VERSION` → versi baru aktif setelah reload, cache lama terhapus (Application → Cache Storage hanya berisi versi baru).
- [ ] 75. Satu asset opsional hilang dari server → install SW **tetap sukses** (precache per-file dengan catch).

## K. Konten & bahasa

- [ ] 76. Seluruh teks UI Bahasa Indonesia sederhana; istilah teknis langsung dijelaskan saat pertama muncul (provenance, subdomain, metadata, dsb.).
- [ ] 77. Feedback salah tidak pernah merendahkan; tone Aruna tenang dan menantang, tanpa pujian kosong berlebihan.
- [ ] 78. Watermark "SIMULASI MEDIA PELATIHAN" terlihat di kedua video CASE 004; deskripsi evidence cocok dengan artefak yang **benar-benar terlihat/terdengar** di video (verifikasi manual di ±00:03.2 dan ±00:05.6).
- [ ] 79. Modal "Tentang SIGAP" memuat tujuan edukasi, disclaimer simulated tools, dan pernyataan privasi (semua data hanya di perangkat).
- [ ] 80. Cetak FINAL REPORT (`window.print`) → layout print bersih (topbar/tombol tersembunyi).

---

**Kriteria rilis:** seluruh butir A–J lulus; butir K boleh membawa catatan minor yang terdokumentasi. Setiap perbaikan pasca-checklist → ulangi minimal bagian A, E, G, J.
