# SIGAP: Kunci Jawaban (khusus guru)

> ## JANGAN LETAKKAN FILE INI DI SITUS PUBLIK
>
> File ini membocorkan seluruh jawaban. Folder `guru/` sengaja **dikecualikan dari
> situs yang dipublikasikan** lewat `.github/workflows/pages.yml`. Kalau Anda
> mengubah cara deploy, pastikan folder ini tetap tidak ikut ter-upload.
>
> Perlu diketahui juga: jawaban benar tetap bisa dibaca dari kode JavaScript oleh
> siswa yang membuka DevTools. Itu konsekuensi aplikasi offline tanpa server dan
> tidak bisa dihilangkan. Karena itu skor SIGAP dirancang **bukan** sebagai nilai
> akademik; yang paling bernilai untuk asesmen adalah refleksi tulisan siswa dan
> diskusi kelas, dan keduanya tidak bisa disalin dari kode.

Panduan mengajarnya ada di [`panduan-guru.md`](panduan-guru.md).

---

### CASE 001
- **Keputusan benar: C**. Jangan instal; verifikasi pengirim lewat jalur lain; hapus file; laporkan. (A = install, B = abaikan saja, D = sebarkan; semuanya salah, A/D memicu misconception warning.)
- Kekuatan bukti: FILE TYPE (**KUAT**: `.apk` adalah installer Android, bukan format foto; mismatch klaim vs format), PERMISSIONS (**KUAT**: SMS/Contacts/Accessibility tidak masuk akal untuk melihat foto), DIRECT CONFIRMATION (**KUAT**: Dimas menyangkal mengirim; akunnya sempat tidak bisa dibuka), SENDER (**SEDANG**: nomor baru, foto profil crop, akun baru dibuat).
- Kombinasi 2 token "cerdas" (basis Token Strategist): dua dari {FILE TYPE, PERMISSIONS, DIRECT CONFIRMATION}.
- Inti debrief: tiga bukti independen saling mendukung: format ≠ klaim, permission berisiko, pengirim menyangkal.

### CASE 002
- **Kunci per plate:** Plate A → (a) kemungkinan manipulasi/generatif; Plate B → (b) **tidak ditemukan bukti manipulasi yang cukup** (BUKAN "asli"); Plate C → (c) **belum cukup bukti** (memicu achievement Honest Uncertainty).
- Indikator Plate A: (1) TEXT, "KAFE NUSANTARA" vs "KAFE NUSANTRA" di elemen lain + satu huruf N terbalik; (2) LIGHT, bayangan dua objek berlawanan arah padahal satu sumber cahaya; (3) TEXTURE, pola batu bata melebur/berulang aneh di satu area.
- Plate C hanya punya 1 indikator lemah (teks agak aneh yang bisa dijelaskan kompresi/perspektif), jadi tidak cukup untuk menyimpulkan.
- `decisionCorrect` kasus = ketiga kesimpulan plate benar sekaligus.

### CASE 003
- **Keputusan benar: C**. Jangan klik; verifikasi lewat kanal resmi; tandai spam/laporkan; beri tahu keluarga. (A = bayar; B = klik dulu lalu isi kalau tampilan resmi, padahal tampilan bisa ditiru; D = balas email, yang justru mengonfirmasi alamat aktif.)
- Kunci teknis: domain sebenarnya pengirim adalah `resi-cek.top` (bukan `nusantara-ekspres.com`); pada URL pembayaran, nama merek hanya menjadi **subdomain** dari `track-verifikasi.top`.
- Domain Challenge: `https://bri.co.id/promo` resmi vs `bri.co.id.promo-spesial.net` palsu (domain sebenarnya `promo-spesial.net`); `dana.id` dan `help.dana.id` resmi vs `dana-id.top` perlu dicurigai/diverifikasi; `sekolah.sch.id/ujian` resmi vs `sekolah-sch-id.web.app` perlu verifikasi lebih lanjut.
- Jika siswa beralasan "karena .top" → dikoreksi eksplisit + misconception "menggeneralisasi TLD".

### CASE 004
- **Kesimpulan benar: "kemungkinan manipulasi"**, karena beberapa bukti independen saling mendukung.
- Artefak yang benar-benar ada di video suspect (semuanya sudah diverifikasi frame-per-frame terhadap file aset):
  - **00:03.4-00:04.9** lip-sync mismatch: audio tertinggal 0,4 detik dari gerak bibir, paling terasa di detik 3,8-4,1 (mulut aktif, bar audio nyaris kosong). Sinkron lagi tepat di 00:04.9.
  - **00:04.9** sambungan kasar (sepotong kata "ngasih" hilang), lalu nada dasar turun ~2,5 semitone dan bergetar (tremolo) sampai akhir.
  - **00:05.55-00:05.72** boundary artifact: salinan area wajah bergeser beberapa piksel dengan bingkai magenta + garis sobek, hanya **5 frame** (0,2 detik).
  - **00:06.0+** dua blok warna di slide proyektor bertukar: "Kumpulkan Data" (hijau) jadi merah dan "Diskusi & Refleksi" (merah) jadi hijau, sementara labelnya tetap. Di reference tidak berubah sama sekali.
  - Metadata (encoder berbeda, created ≠ modified) = bukti **pendukung**, bukan final.
- **FINAL PHANTOM DECISION, jawaban benar: C**: dokumentasikan bukti, verifikasi, laporkan ke pihak berwenang/platform, edukasi teman (unlock Ethical Agent). A = balas deepfake tandingan; B = diamkan; D = sebar balik dengan ejekan; semuanya salah.

### AI Lab
- LAB 01 soal wajib: ● ■■ ● ■■■■ ● ? → **■■■■■■■■** (pola 2→4→8, dikali 2). Soal jebakan: jawaban benar = "informasi belum cukup menentukan satu aturan".
- LAB 03 kuis: "model 95% akurat keseluruhan, pasti adil untuk semua kelompok?" → **belum tentu; evaluasi per kelompok**.
- LAB 04: minimal satu konten berjawaban benar **"belum cukup bukti"** dan diberi skor penuh.
