#!/usr/bin/env python3
"""
Voice-over for the Exam Box advert, synthesised locally with Kokoro (an open-source neural text-to-speech model).

    pip install kokoro-onnx soundfile numpy        # in a virtual environment
    python3 scripts/make_narration.py              # -> public/audio/narration.wav  +  public/audio/narration.json

Each line starts on its scene (times in seconds, read from the comments below). If a line would run into the
next one, the script re-speaks it slightly faster (up to 1.2x) until it fits, so the voice never overlaps itself.
The track is high-passed, gently compressed and loudness-normalised, then scripts/make_audio.py mixes it with the
music and sound effects and ducks them under the voice.

Environment variables
    KOKORO_DIR   folder holding kokoro-v1.0.int8.onnx and voices-v1.0.bin (downloaded here if missing)
    VOICE        Kokoro voice, default af_heart (warm US female). Try bf_emma (British female), am_michael or bm_george (male)
    SPEED        base speaking speed, default 1.05
"""
import json
import os
import subprocess
import sys
import urllib.request
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
TIMING = json.loads((ROOT / "src" / "timing.json").read_text())
DUR = TIMING["totalFrames"] / TIMING["fps"]  # 30.0 s
OUT_SR = 48000
VOICE = os.environ.get("VOICE", "af_heart")
BASE_SPEED = float(os.environ.get("SPEED", "1.05"))
MAX_SPEED = 1.2  # never rush the voice beyond this; shorten the text instead
KOKORO_DIR = Path(os.environ.get("KOKORO_DIR", ROOT / ".cache" / "kokoro"))
MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
FILES = ["kokoro-v1.0.int8.onnx", "voices-v1.0.bin"]

# (id, start second, text). "C B T" with spaces makes the voice read the letters.
# Timeline: problems stamp in at 0.5 / 1.1 / 1.8 / 2.5 s (the voice reads three of the four), logo pops at 5.3 s, then scenes start at
# questions 7.6, network 10.2, start 13.1, monitor 15.9, marking 18.8, reports 21.7, finale 26.7 s.
LINES = [
    ("p1", 0.40, "Marking takes days."),
    ("p2", 1.75, "Reports, by hand."),
    ("p3", 3.05, "Cyber cafés cost money."),
    ("intro", 5.10, "Meet Exam Box, the offline exam system."),
    ("questions", 7.90, "Past questions, from nineteen ninety eight."),
    ("network", 10.30, "Run exams on your own network."),
    ("start", 13.10, "Everyone starts together, on a real exam screen."),
    ("monitor", 16.05, "Watch every candidate live."),
    ("marking", 18.90, "Instant marking. Scores out of one hundred."),
    ("reports", 21.85, "Branded report cards for the whole class, and a broadsheet ready for Excel."),
    ("finale", 26.80, "Exam Box. Smarter exams, instant results."),
]
END_LIMIT = DUR - 0.12  # the last word must end before the video does


def ensure_models():
    KOKORO_DIR.mkdir(parents=True, exist_ok=True)
    for f in FILES:
        p = KOKORO_DIR / f
        if not p.exists() or p.stat().st_size < 1_000_000:
            print(f"downloading {f} ...", flush=True)
            urllib.request.urlretrieve(MODEL_URL + f, p)
    return KOKORO_DIR / FILES[0], KOKORO_DIR / FILES[1]


def trim(x, sr, thresh_db=-42.0, pad=0.04):
    """Cut leading and trailing silence, keeping a short pad."""
    env = np.abs(x)
    k = max(1, int(sr * 0.01))
    env = np.convolve(env, np.ones(k) / k, mode="same")
    ref = env.max() + 1e-9
    idx = np.where(env > ref * 10 ** (thresh_db / 20))[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * sr))
    b = min(len(x), idx[-1] + int(pad * sr))
    out = x[a:b].copy()
    f = int(0.012 * sr)
    out[:f] *= np.linspace(0, 1, f)
    out[-f:] *= np.linspace(1, 0, f)
    return out


def main():
    from kokoro_onnx import Kokoro

    model, voices = ensure_models()
    kokoro = Kokoro(str(model), str(voices))
    SR = 24000
    track = np.zeros(int(DUR * SR) + SR)
    report = []
    for i, (lid, start, text) in enumerate(LINES):
        nxt = LINES[i + 1][1] - 0.12 if i + 1 < len(LINES) else END_LIMIT
        window = nxt - start
        speed = BASE_SPEED
        while True:
            samples, sr = kokoro.create(text, voice=VOICE, speed=speed, lang="en-us")
            assert sr == SR, sr
            clip = trim(np.asarray(samples, dtype=np.float64), sr)
            d = len(clip) / sr
            if d <= window or speed >= MAX_SPEED:
                break
            speed = min(MAX_SPEED, speed + 0.03)
        a = int(start * SR)
        track[a : a + len(clip)] += clip
        report.append({"id": lid, "text": text, "start": round(start, 2), "end": round(start + d, 2), "speed": round(speed, 2), "fits": d <= window})
        print(f"{lid:10s} {start:5.2f}-{start + d:5.2f}s  speed {speed:.2f}  window {window:4.2f}s  {'OK' if d <= window else 'OVERRUNS'}", flush=True)
    track = track[: int(DUR * SR)]

    tmp = ROOT / ".cache" / "narration_raw.wav"
    tmp.parent.mkdir(parents=True, exist_ok=True)
    pcm = (np.clip(track, -1, 1) * 32767).astype("<i2")
    with wave.open(str(tmp), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())

    out = ROOT / "public" / "audio" / "narration.wav"
    out.parent.mkdir(parents=True, exist_ok=True)
    # clean-up chain: remove rumble, tame peaks, even out the level, resample to 48 kHz
    af = "highpass=f=80,acompressor=threshold=-22dB:ratio=3:attack=4:release=90:makeup=3,loudnorm=I=-16:TP=-2:LRA=7,aresample=48000"
    r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(tmp), "-af", af, "-ac", "1", "-t", str(DUR), str(out)])
    if r.returncode != 0:
        sys.exit(r.returncode)
    (ROOT / "public" / "audio" / "narration.json").write_text(json.dumps({"voice": VOICE, "lines": report}, indent=2) + "\n")
    print(f"wrote {out}")
    if not all(x["fits"] for x in report):
        print("WARNING: some lines overrun their window; shorten the text or lower BASE_SPEED")


if __name__ == "__main__":
    main()
