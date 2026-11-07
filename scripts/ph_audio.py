#!/usr/bin/env python3
"""
Soundtrack for the Peter Harvard International Schools advert.

Input   public/ph/audio/phis-anthem-source.mp3   the school's own anthem (5 min 25 s, supplied by the school)
Output  public/ph/audio/soundtrack.wav           anthem edit + voice-over + sound design   (48 kHz stereo)
        public/ph/audio/soundtrack-novoice.wav   the same without the voice-over
        src/ph/cues.json                         every time the video needs: lyric words, voice-over lines, segment starts

What it does
  1. Cuts the 5-minute anthem down to its core (intro build, "Established November 2017", the verse about teachers
     and a safe space, the chorus, and the closing "forever we rise") and joins the pieces with short equal-power
     crossfades placed in the gaps between sung phrases, so no word is clipped.
  2. Speaks the voice-over locally with Kokoro (open-source text-to-speech), phrase by phrase, so the video knows
     exactly when each phrase starts.
  3. Synthesises the sound design (low pulse, riser, impact, whooshes, chime) with numpy. Nothing is sampled.
  4. Ducks the anthem under the voice, mixes, and writes the cue file.

    python3 -m venv .venv && . .venv/bin/activate
    pip install numpy scipy soundfile kokoro-onnx
    python3 scripts/ph_audio.py

Environment: KOKORO_DIR (folder with kokoro-v1.0.int8.onnx + voices-v1.0.bin; downloaded if missing), VOICE (default af_heart).
"""
import json
import os
import re
import subprocess
import urllib.request
from pathlib import Path

import numpy as np
import scipy.signal as ss
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "ph" / "audio"
SRC = AUD / "phis-anthem-source.mp3"
SR = 48000
FPS = 30
VOICE = os.environ.get("VOICE", "af_heart")
KOKORO_DIR = Path(os.environ.get("KOKORO_DIR", ROOT / ".cache" / "kokoro"))
MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
rng = np.random.default_rng(2017)

# ------------------------------------------------------------------ 1. the edit (times are seconds in the source MP3)
# Every cut sits inside a measured gap between two sung phrases (see README "How the audio was cut").
SEGMENTS = [
    # name, source in, source out
    ("intro",  3.95, 24.00),   # quiet build, "Yeah", "Established November 2017 / Peter Harvard / we rise"
    ("verse",  40.72, 49.50),  # "Qualified teachers, hearts on fire / in a safe space where dreams climb higher"
    ("chorus", 81.55, 100.15), # "Godliness, discipline, we stand tall ... Morally strong, academically strong"
    ("outro",  219.10, 237.50),# "Responsibility and excellence, forever we rise" + the humming tail
]
XF = 0.28          # crossfade length, seconds
TAIL_FADE = 1.9    # fade-out of the last segment

# Sung phrases to caption: (segment, [(source onset, source end, text), ...]). Onsets were measured from the
# vocal-band energy of the recording; words inside a phrase are spread over it by syllable count.
LYRICS = {
    "intro": [
        (11.82, 18.00, "Established November 2017"),
        (20.18, 22.30, "Peter Harvard"),
        (22.50, 23.90, "We rise"),
    ],
    "verse": [
        (40.96, 43.10, "Qualified teachers,"),
        (43.26, 45.40, "hearts on fire,"),
        (45.58, 47.15, "in a safe space"),
        (47.30, 49.30, "where dreams climb higher"),
    ],
    "chorus": [
        (81.92, 84.35, "Godliness, discipline,"),
        (84.52, 85.95, "we stand tall"),
        (86.12, 88.10, "Think, stand up,"),
        (88.28, 90.60, "think Peter Harvard for all"),
        (90.72, 95.10, "To dominate in Harvard and beyond"),
        (95.76, 97.50, "Morally strong,"),
        (97.66, 99.80, "academically strong"),
    ],
    "outro": [
        (219.82, 223.80, "Responsibility and excellence"),
        (224.40, 227.30, "forever we rise"),
    ],
}

# ------------------------------------------------------------------ 2. the voice-over
# id, spoken text, start time in the advert (seconds), what the screen shows
VO_LINES = [
    ("v1", "Nurturing excellence.", 0.55),
    ("v2", "Inspiring innovation.", 2.35),
    ("v3", "Building global leaders.", 4.05),
    ("c1", "Peter Harvard International Schools.", 55.55),
    ("c2", "Kubwa, Abuja.", 58.55),
    ("c3", "Visit peter harvard schools dot com.", 60.35),
]
SPEED = 0.98


def sylls(word):
    w = re.sub(r"[^a-z0-9]", "", word.lower())
    if w.isdigit():
        return 4 if len(w) == 4 else max(1, len(w))
    n = len(re.findall(r"[aeiouy]+", w))
    if w.endswith("e") and not w.endswith(("le", "ee")) and n > 1:
        n -= 1
    return max(1, n)


# ------------------------------------------------------------------ helpers
def load_source():
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(SRC), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype="<f4").reshape(-1, 2).astype(np.float64)


def tt(d):
    return np.arange(int(SR * d)) / SR


def band_noise(d, lo, hi):
    n = int(SR * d)
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    spec *= ((f >= lo) & (f <= hi)).astype(float)
    out = np.fft.irfft(spec, n)
    return out / (np.max(np.abs(out)) + 1e-9)


def stereo(x, pan=0.0):
    a = np.sqrt((1 - pan) / 2) * 1.414
    b = np.sqrt((1 + pan) / 2) * 1.414
    return np.stack([x * a, x * b], axis=1)


def place(buf, clip, t, gain=1.0):
    a = int(t * SR)
    if a < 0:
        clip = clip[-a:]
        a = 0
    b = min(len(buf), a + len(clip))
    if b > a:
        buf[a:b] += clip[: b - a] * gain


def sweep_noise(d, f0, f1, up=True):
    """Band-limited noise whose centre frequency glides f0 -> f1 (a filtered whoosh)."""
    n = int(SR * d)
    noise = rng.standard_normal(n)
    fc = np.geomspace(f0, f1, n)
    out = np.zeros(n)
    y1 = y2 = 0.0
    # state-variable filter, block-wise update of the cutoff
    blk = 256
    low = band = 0.0
    for i in range(0, n, blk):
        f = fc[i]
        g = 2 * np.sin(np.pi * f / SR)
        q = 0.35
        seg = noise[i : i + blk]
        o = np.empty(len(seg))
        for k, s in enumerate(seg):
            low += g * band
            high = s - low - q * band
            band += g * high
            o[k] = band
        out[i : i + blk] = o
    return out / (np.max(np.abs(out)) + 1e-9)


def whoosh(d, up=True, level=0.5):
    x = sweep_noise(d, 300, 6500, up) if up else sweep_noise(d, 6500, 300, up)
    t = np.linspace(0, 1, len(x))
    env = np.sin(np.pi * t) ** (2.2 if up else 1.4)
    if not up:
        env = np.sin(np.pi * np.clip(t * 0.9 + 0.05, 0, 1)) ** 1.4
    return stereo(x * env * level)


def riser(d, level=0.5):
    t = tt(d)
    x = sweep_noise(d, 200, 9000) * (t / d) ** 2.4
    tone = np.sin(2 * np.pi * np.cumsum(np.geomspace(110, 880, len(t))) / SR) * (t / d) ** 3 * 0.25
    return stereo((x + tone) * level)


def boom(d=1.8, level=0.9):
    t = tt(d)
    f = 38 + 90 * np.exp(-14 * t)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-2.4 * t)
    air = band_noise(d, 200, 7000) * np.exp(-9 * t) * 0.5
    shimmer = sum(np.sin(2 * np.pi * fr * t) * np.exp(-3 * t) for fr in (1318, 1975, 2637, 3951)) * 0.05
    x = body + air + shimmer
    x[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return stereo(x * level)


def thump(d=0.45, level=0.7, f0=95):
    t = tt(d)
    f = 46 + (f0 - 46) * np.exp(-26 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-9 * t) + 0.15 * band_noise(d, 800, 3000) * np.exp(-60 * t)
    return stereo(x * level)


def chime(f=1318.5, d=2.4, level=0.3):
    t = tt(d)
    x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-dec * t) for m, a, dec in ((1, 1, 1.6), (2.01, 0.5, 2.4), (3.02, 0.25, 3.4), (4.2, 0.12, 5)))
    x[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return stereo(x * level / 2)


def ensure_models():
    KOKORO_DIR.mkdir(parents=True, exist_ok=True)
    for f in ("kokoro-v1.0.int8.onnx", "voices-v1.0.bin"):
        p = KOKORO_DIR / f
        if not p.exists() or p.stat().st_size < 1_000_000:
            print(f"downloading {f} ...", flush=True)
            urllib.request.urlretrieve(MODEL_URL + f, p)
    return KOKORO_DIR / "kokoro-v1.0.int8.onnx", KOKORO_DIR / "voices-v1.0.bin"


def trim(x, sr, thresh_db=-42.0, pad=0.05):
    env = np.convolve(np.abs(x), np.ones(max(1, int(sr * 0.01))) / max(1, int(sr * 0.01)), mode="same")
    idx = np.where(env > env.max() * 10 ** (thresh_db / 20))[0]
    a, b = max(0, idx[0] - int(pad * sr)), min(len(x), idx[-1] + int(pad * sr))
    out = x[a:b].copy()
    f = int(0.012 * sr)
    out[:f] *= np.linspace(0, 1, f)
    out[-f:] *= np.linspace(1, 0, f)
    return out


def speak():
    from kokoro_onnx import Kokoro

    model, voices = ensure_models()
    k = Kokoro(str(model), str(voices))
    clips = {}
    for vid, text, _ in VO_LINES:
        s, sr = k.create(text, voice=VOICE, speed=SPEED, lang="en-us")
        x = trim(np.asarray(s, dtype=np.float64), sr)
        x = ss.resample_poly(x, SR, sr)
        sos = ss.butter(2, 85, "high", fs=SR, output="sos")
        x = ss.sosfilt(sos, x)
        # gentle presence lift and a soft limiter so the voice stays clear over the music
        b, a = ss.iirpeak(3200 / (SR / 2), 1.2)
        x = x + 0.25 * ss.lfilter(b, a, x)
        x = np.tanh(x * 1.6) / np.tanh(1.6)
        rms = np.sqrt(np.mean(x**2))
        x = x * (10 ** (-17 / 20) / rms)  # about -17 dBFS RMS
        x = np.clip(x, -0.97, 0.97)
        clips[vid] = x
        print(f"  {vid}: {len(x) / SR:.2f}s  {text}", flush=True)
    return clips


def duck_curve(n, windows, depth_db=-9.0, attack=0.12, release=0.5):
    rate = 1000
    m = n * rate // SR + 2
    target = np.ones(m)
    for a, b in windows:
        target[int((a - 0.12) * rate) : int((b + 0.25) * rate)] = 10 ** (depth_db / 20)
    out = np.empty(m)
    g = 1.0
    ka, kr = np.exp(-1 / (attack * rate)), np.exp(-1 / (release * rate))
    for i, tg in enumerate(target):
        k = ka if tg < g else kr
        g = k * g + (1 - k) * tg
        out[i] = g
    return np.interp(np.arange(n) / SR, np.arange(m) / rate, out)


# ------------------------------------------------------------------ main
def main():
    AUD.mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "ph").mkdir(parents=True, exist_ok=True)
    src = load_source()

    # --- assemble the anthem edit
    pieces, starts = [], {}
    cursor = 0.0
    seg_info = []
    for i, (name, a, b) in enumerate(SEGMENTS):
        x = src[int(a * SR) : int(b * SR)].copy()
        n = len(x)
        if i == 0:
            f = int(0.35 * SR)
            x[:f] *= np.linspace(0, 1, f)[:, None]
            t0 = 0.0
        else:
            f = int(XF * SR)
            x[:f] *= np.sin(np.linspace(0, np.pi / 2, f))[:, None]
            t0 = cursor - XF
        if i < len(SEGMENTS) - 1:
            f = int(XF * SR)
            x[-f:] *= np.cos(np.linspace(0, np.pi / 2, f))[:, None]
        else:
            f = int(TAIL_FADE * SR)
            x[-f:] *= (np.cos(np.linspace(0, np.pi / 2, f)) ** 1.5)[:, None]
        pieces.append((t0, x))
        starts[name] = (t0, a)
        cursor = t0 + n / SR
        seg_info.append({"name": name, "src_in": a, "src_out": b, "t_in": round(t0, 3), "t_out": round(cursor, 3)})
    DUR = round(cursor, 2)
    N = int(DUR * SR)
    music = np.zeros((N, 2))
    for t0, x in pieces:
        place(music, x, t0)

    def T(name, s):  # source second -> advert second
        t0, a = starts[name]
        return t0 + (s - a)

    # the intro of the recording is a very quiet build; lift it so the advert never opens in near-silence
    lift = 1 + (10 ** (7 / 20) - 1) * np.clip(1 - np.arange(N) / SR / 6.4, 0, 1) ** 1.2
    music *= lift[:, None]
    # tame sub-bass rumble that the original carries, keeps the voice clean on phone speakers
    sos = ss.butter(2, 32, "high", fs=SR, output="sos")
    music = ss.sosfilt(sos, music, axis=0)

    # --- voice-over
    print("voice-over:", flush=True)
    clips = speak()
    vo = np.zeros((N, 2))
    vo_cues = []
    windows = []
    for vid, text, t in VO_LINES:
        c = clips[vid]
        place(vo, np.stack([c, c], axis=1), t)
        vo_cues.append({"id": vid, "text": text, "start": t, "end": round(t + len(c) / SR, 2)})
        windows.append((t, t + len(c) / SR))
    last_end = max(e for _, e in windows)
    assert last_end < DUR - 0.4, f"voice-over ends at {last_end:.2f} s but the film is {DUR} s"

    # --- sound design
    sfx = np.zeros((N, 2))
    drop = T("intro", 10.38)  # the sung "Yeah" after the build
    # warm low pulse under the three opening phrases, then a riser into the drop
    for t in (0.55, 2.35, 4.05):
        place(sfx, thump(0.5, 0.55), t - 0.02)
    place(sfx, riser(drop - 3.1, 0.55), 3.1)
    place(sfx, boom(2.2, 0.85), drop - 0.01)
    place(sfx, whoosh(0.9, True, 0.5), T("intro", 20.18) - 0.7)    # into "Peter Harvard"
    place(sfx, whoosh(0.8, True, 0.45), starts["verse"][0] - 0.5)  # into the verse
    place(sfx, whoosh(0.9, True, 0.5), starts["chorus"][0] - 0.2)  # into the chorus
    place(sfx, thump(0.5, 0.6), T("chorus", 81.92) - 0.02)
    place(sfx, thump(0.5, 0.5), T("chorus", 86.12) - 0.02)
    place(sfx, thump(0.5, 0.5), T("chorus", 95.76) - 0.02)
    place(sfx, whoosh(1.0, True, 0.5), starts["outro"][0] - 0.3)   # into the finale
    place(sfx, boom(1.6, 0.55), T("outro", 219.82) - 0.01)
    place(sfx, chime(1318.5, 2.6, 0.32), 55.4)                      # end card
    place(sfx, chime(1975.5, 2.0, 0.18), 55.5)
    sfx *= 0.8

    # --- mix
    duck = duck_curve(N, windows)
    novoice = music * 0.92 + sfx
    mix = music * duck[:, None] * 0.92 + sfx * (0.55 + 0.45 * duck[:, None]) + vo * 1.0
    for name, x in (("soundtrack.wav", mix), ("soundtrack-novoice.wav", novoice)):
        x = x / max(1.0, np.max(np.abs(x)) / 0.89)
        sf.write(AUD / name, x, SR, subtype="PCM_16")
        print("wrote", AUD / name, f"({DUR} s)")
    sf.write(AUD / "_music_only.wav", music / max(1.0, np.max(np.abs(music)) / 0.89), SR, subtype="PCM_16")  # for alignment checks

    # --- lyric cues
    lyrics = []
    for name, lines in LYRICS.items():
        for s, e, text in lines:
            words = text.split()
            w = np.array([sylls(x) for x in words], dtype=float)
            # a held last syllable: give the final word 40 % extra weight
            w[-1] *= 1.4
            edges = np.concatenate([[0], np.cumsum(w)]) / w.sum()
            ts, te = T(name, s), T(name, e)
            lyrics.append(
                {
                    "start": round(ts, 3),
                    "end": round(te, 3),
                    "text": text,
                    "words": [{"w": x, "t": round(ts + edges[i] * (te - ts), 3), "e": round(ts + edges[i + 1] * (te - ts), 3)} for i, x in enumerate(words)],
                }
            )
    cues = {
        "duration": DUR,
        "fps": FPS,
        "frames": int(round(DUR * FPS)),
        "voice": VOICE,
        "segments": seg_info,
        "drop": round(drop, 3),
        "vo": vo_cues,
        "lyrics": lyrics,
    }
    (ROOT / "src" / "ph" / "cues.json").write_text(json.dumps(cues, indent=1) + "\n")
    print("wrote src/ph/cues.json;", len(lyrics), "lyric phrases; duration", DUR)


if __name__ == "__main__":
    main()
