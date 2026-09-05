#!/usr/bin/env python3
# ============================================================
# SIGAP - CASE 004 "Phantom Signal"
# Pipeline video simulasi v3 (SIMULASI MEDIA PELATIHAN, bukan deepfake nyata).
#
# Master: video AI fotorealistis (karakter SINTETIS, bukan orang nyata),
# dibuat via asi-generate-video model veo_3_1 (8 s, 16:9, audio+lip-sync
# native) dengan prompt: siswa SMA Indonesia (ketua OSIS, karakter fiktif)
# berdiri di koridor sekolah depan papan pengumuman (papan di sisi kiri
# frame, jendela/pintu kelas di kanan), medium shot statis, berbicara
# tenang, pelan, dan SANGAT JELAS ke kamera dalam Bahasa Indonesia:
#   "Mulai bulan depan, semua dana kegiatan OSIS akan dialihkan
#    untuk membeli perlengkapan pribadi panitia."
# Ucapan master diverifikasi dengan transkripsi ASR (faster-whisper small,
# bahasa id): 100% kata cocok dengan naskah. File master:
# case004_master.mp4 (tidak disertakan di repo aset).
#
# Dari master yang SAMA diturunkan dua file (640x360, 25 fps, 9 s,
# h264 crf 26 + aac 96k, +faststart, < 1.5 MB):
#   reference.mp4 - tanpa artefak; poster OSIS tetap di pojok kanan atas
#                   papan pengumuman (overlay x=92,y=12).
#   suspect.mp4   - versi "beredar" dengan artefak SENGAJA (terverifikasi
#                   frame-per-frame + pengukuran audio):
#     1) 00:03.2-04.5  audio digeser +0.4 s dengan crossfade 0.1 s:
#                 segmen suara 2.8-4.1 diputar ulang pada 3.2-4.5 ->
#                 bibir MENDAHULUI suara +-0.4 s (audio terlambat,
#                 BUKAN hening); sinkron kembali tepat di 4.5.
#     2) 00:04.5+ timbre berubah: pitch turun ~2.5 semitone
#                 (asetrate 0.86547 + atempo 1.15544) + tremolo 9 Hz.
#     3) 00:05.55-05.72 boundary flicker: salinan crop wajah
#                 (88x104 @ x=300,y=56) digeser +5/+4 px + bingkai
#                 magenta + garis sobek mendatar.
#     4) 00:06.0+ poster OSIS berpindah dari pojok kanan atas papan
#                 (92,12) turun ke kiri (16,64); di reference tetap.
# Keduanya diberi watermark "SIMULASI MEDIA PELATIHAN" kiri bawah.
#
# Pakai: python3 generate.py /path/ke/case004_master.mp4
# ============================================================
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def make_badge(path):
    """Poster kecil 'OSIS' (PNG) yang dikomposit ke latar kedua video."""
    from PIL import Image, ImageDraw, ImageFont
    W, H = 96, 40
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, W - 1, H - 1], radius=7,
                        fill=(18, 48, 110, 235),
                        outline=(240, 200, 60, 255), width=3)
    try:
        f = ImageFont.truetype(FONT, 20)
    except Exception:
        f = ImageFont.load_default()
    bb = d.textbbox((0, 0), 'OSIS', font=f)
    d.text(((W - (bb[2] - bb[0])) / 2 - bb[0],
            (H - (bb[3] - bb[1])) / 2 - bb[1]),
           'OSIS', font=f, fill=(255, 224, 102, 255))
    img.save(path)


def run(args):
    print('+', ' '.join(args))
    subprocess.check_call(args)


def enc(out):
    return ['-t', '9', '-c:v', 'libx264', '-crf', '26', '-preset', 'slow',
            '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k',
            '-movflags', '+faststart', '-y', os.path.join(HERE, out)]


WM = ("drawtext=fontfile=%s:text='SIMULASI MEDIA PELATIHAN'"
      ":x=10:y=h-th-10:fontsize=15:fontcolor=white@0.9"
      ":box=1:boxcolor=black@0.45:boxborderw=5" % FONT)

# Posisi poster OSIS (overlay) di frame 640x360.
BADGE_REF = (92, 12)    # pojok kanan atas papan pengumuman (papan di kiri)
BADGE_SUS = (16, 64)    # posisi "melompat" turun ke kiri (suspect, t>=6.0)

# Bounding box wajah pada 640x360 (diukur dari frame master kandidat B:
# wajah di 1280x720 kira-kira x 600-776, y 112-320).
FACE = dict(w=88, h=104, x=300, y=56)


def build(master, badge):
    base = '[0:v]scale=640:360,fps=25,tpad=stop_mode=clone:stop_duration=1.2'

    # ---------- reference.mp4 ----------
    run(['ffmpeg', '-v', 'error', '-i', master, '-i', badge,
         '-filter_complex',
         base + '[b];[b][1:v]overlay=x=%d:y=%d[ov];[ov]' % BADGE_REF +
         WM + '[v];'
         '[0:a]apad=whole_dur=9,aresample=48000[a]',
         '-map', '[v]', '-map', '[a]'] + enc('reference.mp4'))

    # ---------- suspect.mp4 ----------
    f = FACE
    fc = (
        base + ',split=2[b1][b2];'
        '[b2]crop=%d:%d:%d:%d[face];' % (f['w'], f['h'], f['x'], f['y']) +
        "[b1][face]overlay=x=%d:y=%d:enable='between(t,5.55,5.72)'[bd1];"
        % (f['x'] + 5, f['y'] + 4) +
        '[bd1]drawbox=x=%d:y=%d:w=%d:h=%d:color=magenta@0.55:t=2'
        % (f['x'] + 5, f['y'] + 4, f['w'], f['h']) +
        ":enable='between(t,5.55,5.72)',"
        'drawbox=x=%d:y=%d:w=%d:h=2:color=magenta@0.8:t=fill'
        % (f['x'] - 15, f['y'] + 56, f['w'] + 37) +
        ":enable='between(t,5.55,5.72)'[bd2];"
        "[bd2][1:v]overlay=x=%d:y=%d:enable='lt(t,6.0)'[o1];" % BADGE_REF +
        "[o1][1:v]overlay=x=%d:y=%d:enable='gte(t,6.0)'[o2];" % BADGE_SUS +
        '[o2]' + WM + '[v];'
        # Audio: 0-3.3 asli; crossfade 0.1 s ke segmen 2.8-4.1 yang
        # diputar ulang -> mulai 3.2 suara TERLAMBAT +0.4 s (overlap,
        # bukan hening) sampai 4.5; lalu segmen 4.5+ dengan timbre
        # dimanipulasi (pitch turun + tremolo).
        '[0:a]atrim=0:3.3,asetpts=PTS-STARTPTS[a1];'
        '[0:a]atrim=2.8:4.1,asetpts=PTS-STARTPTS[a2];'
        '[a1][a2]acrossfade=d=0.1[alag];'
        '[0:a]atrim=4.5:8.0,asetpts=PTS-STARTPTS,'
        'asetrate=48000*0.86547,aresample=48000,atempo=1.15544,'
        'tremolo=f=9:d=0.55,afade=t=in:st=0:d=0.04[a3];'
        '[alag][a3]concat=n=2:v=0:a=1,'
        'apad=whole_dur=9,aresample=48000[a]'
    )
    run(['ffmpeg', '-v', 'error', '-i', master, '-i', badge,
         '-filter_complex', fc, '-map', '[v]', '-map', '[a]']
        + enc('suspect.mp4'))


def main():
    if len(sys.argv) < 2 or not os.path.exists(sys.argv[1]):
        sys.exit('Pakai: python3 generate.py /path/ke/case004_master.mp4\n'
                 '(master = video AI veo_3_1, lihat header file ini)')
    badge = os.path.join(HERE, 'osis_badge.png')
    if not os.path.exists(badge):
        make_badge(badge)
    build(sys.argv[1], badge)
    for f in ('reference.mp4', 'suspect.mp4'):
        p = os.path.join(HERE, f)
        print(f, os.path.getsize(p), 'bytes')


if __name__ == '__main__':
    main()
