#!/usr/bin/env python3
# ============================================================
# SIGAP - generator narasi (Aruna / Phantom)
#
# Mensintesis satu baris dialog jadi MP3 dengan format yang SAMA dengan
# aset narasi yang sudah ada: mono, 44.1 kHz, 112 kbps, hening di awal
# dipangkas ke ~0,15 s dan di akhir ke ~0,05 s.
#
# Suara dipilih dengan mencocokkan speaker-embedding terhadap aset Aruna
# yang sudah ada (resemblyzer): id-ID-GadisNeural memberi kemiripan ~0,81 —
# di dalam rentang variasi antar-file Aruna asli sendiri (0,71-0,94).
# Menggeser pitch justru MENURUNKAN kemiripan (0,79 -> 0,69 pada -20Hz),
# jadi jangan diubah tanpa mengukur ulang.
#
# Catatan: edge-tts memakai layanan text-to-speech Microsoft Edge, jadi
# perintah ini mengirim teks dialog ke internet dan butuh koneksi.
#
# Pakai:
#   python3 tools/generate_narration.py aruna/case004-intro-01.mp3 "Teks dialog..."
#   python3 tools/generate_narration.py --voice phantom out.mp3 "Teks..."
#
# Butuh: ffmpeg, pip install edge-tts
# ============================================================
import argparse
import asyncio
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(os.path.dirname(HERE), 'assets', 'audio')

# Diverifikasi lewat speaker-embedding terhadap aset yang sudah ada.
VOICES = {
    # rate +8% menyamakan tempo dengan aset lama tanpa menurunkan
    # kemiripan (terukur 0,794 di +0% maupun +8%).
    'aruna': dict(voice='id-ID-GadisNeural', rate='+8%', pitch='+0Hz'),
    # BELUM DIVERIFIKASI: tidak ada baris Phantom yang perlu dibuat ulang,
    # jadi preset ini hanya perkiraan dari F0 aset lama (~99 Hz, jauh lebih
    # berat dari Aruna ~215 Hz). Ukur dulu sebelum dipakai serius.
    'phantom': dict(voice='id-ID-ArdiNeural', rate='-8%', pitch='-25Hz'),
}

HEAD_SILENCE = 0.15   # detik hening yang disisakan di awal
TAIL_SILENCE = 0.05   # detik hening yang disisakan di akhir


async def synth(text, cfg, out):
    import edge_tts
    await edge_tts.Communicate(text, cfg['voice'],
                               rate=cfg['rate'], pitch=cfg['pitch']).save(out)


def encode(src, dst):
    """Pangkas hening lalu encode ke format aset narasi yang ada."""
    trim = (
        'silenceremove=start_periods=1:start_silence=%g:start_threshold=-45dB,'
        'areverse,'
        'silenceremove=start_periods=1:start_silence=%g:start_threshold=-45dB,'
        'areverse' % (HEAD_SILENCE, TAIL_SILENCE)
    )
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    subprocess.check_call([
        'ffmpeg', '-v', 'error', '-i', src, '-af', trim,
        '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '112k',
        '-y', dst
    ])


def main():
    ap = argparse.ArgumentParser(description='Buat MP3 narasi SIGAP.')
    ap.add_argument('out', help='path relatif terhadap assets/audio/, '
                               'mis. aruna/case004-intro-01.mp3')
    ap.add_argument('text', help='teks dialog (harus sama persis dengan '
                                 'field text di kode)')
    ap.add_argument('--voice', choices=sorted(VOICES), default=None,
                    help='default: diambil dari folder pertama pada `out`')
    args = ap.parse_args()

    speaker = args.voice or args.out.split('/')[0]
    if speaker not in VOICES:
        sys.exit('Suara tidak dikenal: %s (pilihan: %s)'
                 % (speaker, ', '.join(sorted(VOICES))))

    dst = os.path.join(AUDIO_DIR, args.out)
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, 'raw.mp3')
        asyncio.run(synth(args.text, VOICES[speaker], raw))
        encode(raw, dst)
    print('%s  %d bytes' % (dst, os.path.getsize(dst)))


if __name__ == '__main__':
    main()
