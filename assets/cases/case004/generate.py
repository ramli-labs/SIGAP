#!/usr/bin/env python3
# ============================================================
# SIGAP - CASE 004 "Phantom Signal"
# Pipeline video simulasi v5 (SIMULASI MEDIA PELATIHAN, bukan deepfake nyata).
#
# Master: referencenew.mp4 - REKAMAN ASLI (bukan video AI), TIDAK DISERTAKAN
# di repo karena ukurannya 3,1 MB dan tidak pernah dimuat aplikasi. Simpan
# sendiri, lalu berikan path-nya sebagai argumen. Isinya: seorang pengajar
# presentasi di depan kelas, berdiri di kanan layar proyektor yang
# menampilkan slide alur "Pertanyaan Pemantik / Rancang Proyek / Kumpulkan
# Data / Latih Model AI / Uji Model / Evaluasi & Refleksi"; dinding hijau
# toska di bawah layar, papan tulis kaca di sisi kanan. 1920x1080, 60 fps,
# 8,0 detik, audio stereo 48 kHz.
#
# Alurnya TIGA TAHAP, supaya reference dan suspect dijamin identik kecuali
# artefaknya, dan supaya artefak latar bisa mengikuti goyangan kamera:
#   1. render_base()   ffmpeg  -> _base.mkv (FFV1 lossless, 640x360, 25 fps,
#                                9 s; 1,02 s terakhir = tpad clone/beku)
#   2. make_slide_patch()  OpenCV -> _patch.mov (qtrle RGBA) berisi HANYA
#                                tambalan warna blok slide, dilacak per frame
#   3. render_outputs() ffmpeg -> reference.mp4 & suspect.mp4
# Berkas antara dihapus di akhir.
#
# Hasil (640x360, 25 fps, 9 s, h264 crf 26 + aac 96k, +faststart):
#   reference.mp4 - tanpa artefak.
#   suspect.mp4   - versi "beredar" dengan artefak SENGAJA (terverifikasi
#                   frame-per-frame + pengukuran audio):
#     1) 00:03.4-04.9  audio digeser +0.4 s dengan crossfade 0.1 s:
#                 segmen suara 3.0-4.5 diputar ulang pada 3.4-4.9 ->
#                 bibir MENDAHULUI suara +-0.4 s (audio terlambat,
#                 BUKAN hening); sinkron kembali tepat di 4.9.
#                 Paling terasa di 3.8-4.1: mulut mulai bicara lagi
#                 setelah jeda, tapi audio masih nyaris kosong.
#     2) 00:04.9+ sambungan kasar (potongan 4.5-4.9 terlewati, sepotong
#                 kata "ngasih" hilang) lalu timbre berubah: pitch turun
#                 ~2.5 semitone (asetrate 0.86547 + atempo 1.15544)
#                 + tremolo 9 Hz.
#     3) 00:05.55-05.72 boundary flicker: salinan crop wajah
#                 (76x92 @ x=442,y=124) digeser +5/+4 px + bingkai
#                 magenta + garis sobek mendatar.
#     4) 00:06.0+ DUA blok warna di slide proyektor BERTUKAR WARNA:
#                 "Kumpulkan Data" (hijau) jadi merah dan "Diskusi &
#                 Refleksi" (merah) jadi hijau. Tidak ada objek asing
#                 yang ditempel - yang diubah hanya HUE piksel aslinya,
#                 sehingga kecerahan, bayangan tangan, dan noise proyektor
#                 tetap utuh. Di reference kedua blok tidak berubah.
# Keduanya diberi watermark "SIMULASI MEDIA PELATIHAN" kiri bawah.
#
# Pakai: python3 generate.py [/path/ke/master.mp4]
#        (tanpa argumen, dicari referencenew.mp4 di folder yang sama)
# Butuh: ffmpeg, numpy, opencv-python(<5)
# ============================================================
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
MASTER_DEFAULT = os.path.join(HERE, 'referencenew.mp4')
BASE = os.path.join(HERE, '_base.mkv')
PATCH = os.path.join(HERE, '_patch.mov')

WM = ("drawtext=fontfile=%s:text='SIMULASI MEDIA PELATIHAN'"
      ":x=10:y=h-th-10:fontsize=15:fontcolor=white@0.9"
      ":box=1:boxcolor=black@0.45:boxborderw=5" % FONT)

# Bounding box kepala pada 640x360, diukur pada detik 5,55-5,72 dengan
# haar cascade (wajah 48x48 @ 456,146) lalu diperlebar ke seluruh kepala.
FACE = dict(w=76, h=92, x=442, y=124)

# Titik sambung audio suspect (lihat header).
A1_END = 3.5     # potongan asli 0 -> 3.5
A2 = (3.0, 4.5)  # diputar ulang pada 3.4 -> 4.9 (audio tertinggal 0,4 s)
SEAM = 4.9       # sinkron lagi + timbre berubah mulai di sini

SWAP_FROM = 6.0  # detik saat warna blok slide bertukar (suspect saja)

# Jendela pencarian blok di frame 640x360. Cukup lebar untuk menampung
# goyangan kamera (blok bergeser ~12 px vertikal sepanjang 6-9 s) tapi
# sempit supaya tangan presenter -- yang masuk frame sekitar detik 7,8 di
# sebelah kanan blok -- tidak pernah ikut terwarnai.
SLIDE_ROI = dict(x=328, y=0, w=38, h=155)

# Dua blok yang bertukar. h=(lo,hi) rentang hue OpenCV (0-179); s/v ambang
# untuk memisahkan blok dari latar slide yang terang (V~243) dan dari
# dinding. tgt_* = hue/saturasi tujuan (diambil dari blok pasangannya).
BLOCK_GREEN = dict(name='Kumpulkan Data', h=(75, 97), s=70, v=205,
                   tgt_h=2, tgt_s=82)
BLOCK_RED = dict(name='Diskusi & Refleksi', h=(170, 12), s=60, v=215,
                 tgt_h=88, tgt_s=93)

# Alpha tambalan dihitung dari kecerahan: blok jauh lebih gelap (V~165-189)
# daripada latar slide (V~243), jadi tepi anti-alias ikut terwarnai penuh
# tanpa meninggalkan garis sisa warna lama.
V_FULL = 220.0   # V <= ini -> alpha 1
V_NONE = 238.0   # V >= ini -> alpha 0


def run(args):
    print('+', ' '.join(args))
    subprocess.check_call(args)


def render_base(master):
    """Tahap 1: master -> base lossless 640x360 25 fps 9 detik."""
    run(['ffmpeg', '-v', 'error', '-i', master, '-filter_complex',
         '[0:v]scale=640:360,fps=25,'
         'tpad=stop_mode=clone:stop_duration=1.2,trim=end=9,'
         'setpts=PTS-STARTPTS[v]',
         '-map', '[v]', '-an', '-c:v', 'ffv1', '-y', BASE])


def _block_mask(hsv, spec):
    """Komponen tersambung terbesar yang cocok dengan warna blok."""
    import cv2
    import numpy as np
    H, S, V = [hsv[:, :, i].astype(int) for i in range(3)]
    lo, hi = spec['h']
    hm = (H >= lo) & (H <= hi) if lo < hi else ((H >= lo) | (H <= hi))
    m = (hm & (S >= spec['s']) & (V <= spec['v'])).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n < 2:
        return None
    k = max(range(1, n), key=lambda j: st[j][4])
    # Bentuk harus batang tipis-tinggi; kalau tidak, kemungkinan itu tangan
    # atau bayangan yang kebetulan sewarna -> lewati frame ini.
    if st[k][2] > 26 or st[k][3] < 40 or st[k][4] < 400:
        return None
    return (lab == k).astype(np.uint8)


def make_slide_patch():
    """Tahap 2: tambalan RGBA berisi dua blok slide yang bertukar warna.

    Warna diubah dengan MEMUTAR HUE piksel aslinya (V dipertahankan), jadi
    gradasi cahaya proyektor dan bayangan tangan tetap ikut. Blok dicari
    ulang tiap frame, sehingga tambalan mengikuti goyangan kamera.
    """
    import cv2
    import numpy as np
    cap = cv2.VideoCapture(BASE)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    r = SLIDE_ROI
    frames, i, hits = [], 0, 0
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        rgba = np.zeros((360, 640, 4), np.uint8)
        if i / fps >= SWAP_FROM:
            roi = fr[r['y']:r['y'] + r['h'], r['x']:r['x'] + r['w']]
            hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
            V = hsv[:, :, 2].astype(np.float32)
            out = roi.astype(np.float32)
            acc = np.zeros(V.shape, np.float32)
            for spec in (BLOCK_GREEN, BLOCK_RED):
                core = _block_mask(hsv, spec)
                if core is None:
                    continue
                hits += 1
                region = cv2.dilate(core, np.ones((5, 5), np.uint8))
                a = region * np.clip((V_NONE - V) / (V_NONE - V_FULL), 0, 1)
                med_s = float(np.median(hsv[:, :, 1][core > 0]))
                hh = hsv.copy()
                hh[:, :, 0] = spec['tgt_h']
                hh[:, :, 1] = np.clip(
                    hsv[:, :, 1].astype(np.float32) * spec['tgt_s']
                    / max(med_s, 1.0), 0, 255).astype(np.uint8)
                rec = cv2.cvtColor(hh, cv2.COLOR_HSV2BGR).astype(np.float32)
                a3 = a[..., None]
                out = out * (1 - a3) + rec * a3
                acc = np.maximum(acc, a)
            rgba[r['y']:r['y'] + r['h'], r['x']:r['x'] + r['w'], :3] = \
                np.clip(out, 0, 255).astype(np.uint8)
            rgba[r['y']:r['y'] + r['h'], r['x']:r['x'] + r['w'], 3] = \
                (acc * 255).astype(np.uint8)
        frames.append(rgba)
        i += 1
    cap.release()
    n_swap = sum(1 for k in range(len(frames)) if k / fps >= SWAP_FROM)
    print('  patch: %d frame, %d frame bertukar, %d blok terdeteksi '
          '(harusnya %d)' % (len(frames), n_swap, hits, n_swap * 2))
    if hits < n_swap * 2:
        print('  PERINGATAN: ada frame yang bloknya tidak terdeteksi, '
              'periksa SLIDE_ROI / ambang warna.')
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        for k, f in enumerate(frames):
            cv2.imwrite(os.path.join(tmp, '%04d.png' % k), f)
        run(['ffmpeg', '-v', 'error', '-framerate', '25',
             '-i', os.path.join(tmp, '%04d.png'),
             '-c:v', 'qtrle', '-pix_fmt', 'argb', '-y', PATCH])


def enc(out):
    return ['-t', '9', '-c:v', 'libx264', '-crf', '26', '-preset', 'slow',
            '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k',
            '-movflags', '+faststart', '-y', os.path.join(HERE, out)]


def render_outputs(master):
    """Tahap 3: base (+ patch) + audio -> reference.mp4 & suspect.mp4."""
    # ---------- reference.mp4 ----------
    run(['ffmpeg', '-v', 'error', '-i', BASE, '-i', master,
         '-filter_complex',
         '[0:v]' + WM + '[v];[1:a]apad=whole_dur=9,aresample=48000[a]',
         '-map', '[v]', '-map', '[a]'] + enc('reference.mp4'))

    # ---------- suspect.mp4 ----------
    f = FACE
    fc = (
        '[0:v]split=2[b1][b2];'
        '[b2]crop=%d:%d:%d:%d[face];' % (f['w'], f['h'], f['x'], f['y']) +
        "[b1][face]overlay=x=%d:y=%d:enable='between(t,5.55,5.72)'[bd1];"
        % (f['x'] + 5, f['y'] + 4) +
        '[bd1]drawbox=x=%d:y=%d:w=%d:h=%d:color=magenta@0.55:t=2'
        % (f['x'] + 5, f['y'] + 4, f['w'], f['h']) +
        ":enable='between(t,5.55,5.72)',"
        'drawbox=x=%d:y=%d:w=%d:h=2:color=magenta@0.8:t=fill'
        % (f['x'] - 15, f['y'] + 50, f['w'] + 37) +
        ":enable='between(t,5.55,5.72)'[bd2];"
        '[bd2][1:v]overlay=x=0:y=0[o1];'          # tambalan slide (RGBA)
        '[o1]' + WM + '[v];'
        # Audio: 0-3.5 asli; crossfade 0.1 s ke segmen 3.0-4.5 yang
        # diputar ulang -> mulai 3.4 suara TERLAMBAT +0.4 s (overlap,
        # bukan hening) sampai 4.9; lalu segmen 4.9+ dengan timbre
        # dimanipulasi (pitch turun + tremolo).
        '[2:a]atrim=0:%g,asetpts=PTS-STARTPTS[a1];' % A1_END +
        '[2:a]atrim=%g:%g,asetpts=PTS-STARTPTS[a2];' % A2 +
        '[a1][a2]acrossfade=d=0.1[alag];'
        '[2:a]atrim=%g:8.0,asetpts=PTS-STARTPTS,' % SEAM +
        'asetrate=48000*0.86547,aresample=48000,atempo=1.15544,'
        'tremolo=f=9:d=0.55,afade=t=in:st=0:d=0.04[a3];'
        '[alag][a3]concat=n=2:v=0:a=1,'
        'apad=whole_dur=9,aresample=48000[a]'
    )
    run(['ffmpeg', '-v', 'error', '-i', BASE, '-i', PATCH, '-i', master,
         '-filter_complex', fc, '-map', '[v]', '-map', '[a]']
        + enc('suspect.mp4'))


def main():
    master = sys.argv[1] if len(sys.argv) > 1 else MASTER_DEFAULT
    if not os.path.exists(master):
        sys.exit('Master tidak ditemukan: %s\n'
                 'File master TIDAK disimpan di repo (3,1 MB, tidak dipakai\n'
                 'aplikasi). Ambil rekaman aslinya, lalu jalankan:\n'
                 '  python3 generate.py /path/ke/master.mp4' % master)
    try:
        render_base(master)
        make_slide_patch()
        render_outputs(master)
    finally:
        for p in (BASE, PATCH):
            if os.path.exists(p):
                os.remove(p)
    for f in ('reference.mp4', 'suspect.mp4'):
        p = os.path.join(HERE, f)
        print(f, os.path.getsize(p), 'bytes')


if __name__ == '__main__':
    main()
