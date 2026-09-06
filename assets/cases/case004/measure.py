#!/usr/bin/env python3
# ============================================================
# SIGAP - CASE 004 "Phantom Signal"
# Mengukur data grafik in-game dari aset video FINAL, lalu mencetak
# MOUTH_DATA / AUDIO_REF / AUDIO_SUS siap tempel ke js/games/case004.js.
#
#   AUDIO_REF, AUDIO_SUS : RMS audio per 0,1 s dari reference.mp4 dan
#                          suspect.mp4, dinormalkan dengan SKALA YANG SAMA
#                          (agar selisih amplitudo keduanya jujur).
#   MOUTH_DATA           : gerak mulut per 0,1 s, diukur dari MASTER
#                          (resolusi penuh, mulut jauh lebih terbaca):
#                          wajah dilacak haar cascade -> crop kepala ->
#                          face-mesh landmark -> rasio bukaan bibir
#                          (jarak bibir dalam 13-14 / lebar mulut 78-308).
#                          Sinyal akhir = 55% laju perubahan bukaan +
#                          45% besar bukaan. Frame saat pose kepala
#                          melompat (mesh re-fit, bukan gerak mulut)
#                          diredam agar tidak jadi puncak palsu.
#                          1,02 s terakhir = tpad clone (beku) -> 0.
#
# Pakai: python3 measure.py
# Butuh: ffmpeg, numpy, opencv-python(<5), mediapipe==0.10.x
# ============================================================
import os
import subprocess
import sys
import tempfile

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
# Master tidak disimpan di repo; taruh sendiri di folder ini atau ubah path.
MASTER = os.path.join(HERE, 'referencenew.mp4')
SR = 16000
BINS = 90          # 9 detik / 0,1 s
SRC_BINS = 80      # 8,0 detik pertama berasal dari master
FPS = 60           # fps master


def audio_env(path, tmp):
    """RMS per 0,1 s (belum dinormalkan)."""
    raw = os.path.join(tmp, os.path.basename(path) + '.raw')
    subprocess.check_call(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1',
                           '-ar', str(SR), '-f', 's16le', '-y', raw])
    a = np.fromfile(raw, dtype=np.int16).astype(np.float32) / 32768
    hop = SR // 10
    return np.array([np.sqrt((a[i * hop:(i + 1) * hop] ** 2).mean() + 1e-12)
                     for i in range(BINS)])


def med(a, k):
    p = np.pad(a, k // 2, mode='edge')
    return np.array([np.median(p[i:i + k]) for i in range(len(a))])


def mov(a, k):
    p = np.pad(a, k // 2, mode='edge')
    return np.convolve(p, np.ones(k) / k, 'valid')[:len(a)]


def lip_track(path):
    """Rasio bukaan bibir + proksi yaw per frame master (NaN bila gagal)."""
    import cv2
    import mediapipe as mp
    UP, LO, LC, RC, NOSE, FL, FR = 13, 14, 78, 308, 1, 234, 454
    cap = cv2.VideoCapture(path)
    casc = cv2.CascadeClassifier(cv2.data.haarcascades +
                                 'haarcascade_frontalface_default.xml')
    prof = cv2.CascadeClassifier(cv2.data.haarcascades +
                                 'haarcascade_profileface.xml')
    fm = mp.solutions.face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1,
                                         refine_landmarks=True,
                                         min_detection_confidence=0.2)
    W, H = 1920, 1080
    opn, yaw, last = [], [], None
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        small = cv2.resize(fr, (640, 360))
        g = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        d = casc.detectMultiScale(g, 1.08, 5, minSize=(26, 26))
        if len(d) == 0:
            d = prof.detectMultiScale(g, 1.08, 5, minSize=(26, 26))
        if len(d) == 0:
            fl = prof.detectMultiScale(cv2.flip(g, 1), 1.08, 5, minSize=(26, 26))
            if len(fl):
                d = np.array([[640 - x - w, y, w, h] for x, y, w, h in fl])
        if len(d):
            last = max(d, key=lambda r: r[2] * r[3]).astype(float)
        o = y_ = np.nan
        if last is not None:
            x, y, w, h = last * 3.0          # 640x360 -> 1920x1080
            cx, cy, s = x + w / 2, y + h / 2, max(w, h) * 2.2
            x0, y0 = int(max(0, cx - s / 2)), int(max(0, cy - s / 2))
            x1, y1 = int(min(W, cx + s / 2)), int(min(H, cy + s / 2))
            crop = fr[y0:y1, x0:x1]
            if crop.size:
                res = fm.process(cv2.cvtColor(cv2.resize(crop, (480, 480)),
                                              cv2.COLOR_BGR2RGB))
                if res.multi_face_landmarks:
                    p = res.multi_face_landmarks[0].landmark
                    v = lambda k: np.array([p[k].x * 480, p[k].y * 480])
                    wd = np.linalg.norm(v(LC) - v(RC))
                    if wd > 1:
                        o = np.linalg.norm(v(UP) - v(LO)) / wd
                        dl = np.linalg.norm(v(NOSE) - v(FL))
                        dr = np.linalg.norm(v(NOSE) - v(FR))
                        y_ = (dl - dr) / (dl + dr)
        opn.append(o)
        yaw.append(y_)
    fm.close()
    cap.release()
    return np.array(opn), np.array(yaw)


def mouth_data(path):
    o, y = lip_track(path)
    n = len(o)
    valid = np.isfinite(o)
    idx = np.arange(n)
    o = np.clip(med(np.interp(idx, idx[valid], o[valid]), 5), 0, 0.75)
    y = med(np.interp(idx, idx[valid], y[valid]), 5)
    step = 3                                   # 50 ms
    d = np.zeros(n); d[step:] = np.abs(o[step:] - o[:-step])
    dy = np.zeros(n); dy[step:] = np.abs(y[step:] - y[:-step])
    rel = np.where(dy > 0.25, 0.25, 1.0)       # redam mesh re-fit saat menoleh
    move, open_ = mov(d * rel, 5), mov(o, 9)

    def to_bins(sig):
        b = np.zeros(BINS)
        for i in range(SRC_BINS):
            a, z = i * FPS // 10, min((i + 1) * FPS // 10, n)
            b[i] = sig[a:z].mean() if z > a else 0
        return b

    bm, bo = to_bins(move), to_bins(open_)
    mix = (0.55 * bm / np.percentile(bm[:SRC_BINS], 93) +
           0.45 * bo / np.percentile(bo[:SRC_BINS], 93))
    mix[SRC_BINS:] = 0                          # ekor beku (tpad clone)
    return np.clip(mix / np.percentile(mix[:SRC_BINS], 95), 0, 1)


def js(name, arr):
    return '  var %s = [%s];' % (name, ', '.join('%g' % round(v, 2) for v in arr))


def main():
    ref = os.path.join(HERE, 'reference.mp4')
    sus = os.path.join(HERE, 'suspect.mp4')
    if not os.path.exists(MASTER):
        sys.exit('Master tidak ditemukan: %s\n'
                 'File master TIDAK disimpan di repo. MOUTH_DATA diukur dari\n'
                 'master resolusi penuh, jadi taruh rekaman aslinya di sini dulu.'
                 % MASTER)
    for f in (ref, sus):
        if not os.path.exists(f):
            sys.exit('Tidak ada: %s (jalankan generate.py dulu)' % f)
    with tempfile.TemporaryDirectory() as tmp:
        er, es = audio_env(ref, tmp), audio_env(sus, tmp)
    scale = max(er.max(), es.max())             # skala bersama
    print('/* tempel ke js/games/case004.js */')
    print(js('MOUTH_DATA', mouth_data(MASTER)))
    print(js('AUDIO_REF', er / scale))
    print(js('AUDIO_SUS', es / scale))


if __name__ == '__main__':
    main()
