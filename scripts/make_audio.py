#!/usr/bin/env python3
"""
Procedural soundtrack for the Exam Box advert (music bed + sound effects), written with numpy only.

Everything is synthesised here - no samples, no third-party audio - so the track is original,
license-free and fully reproducible.  Cue times are given as *video frames* (30 fps) so the
audio stays locked to src/timing.json and the scenes in src/scenes/*.

    python3 scripts/make_audio.py        ->  public/audio/soundtrack.wav  (48 kHz, stereo, 16-bit)
"""
import json
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
TIMING = json.loads((ROOT / "src" / "timing.json").read_text())
FPS = TIMING["fps"]
DUR = TIMING["totalFrames"] / FPS  # 30.0 s
SR = 48000
N = int(SR * DUR)
rng = np.random.default_rng(2026)

S = {k: v["from"] for k, v in TIMING["scenes"].items()}  # scene start frames


def t_of(frame):
    return frame / FPS


# ----------------------------------------------------------------------------- synthesis helpers
def tt(d):
    return np.arange(int(SR * d)) / SR


def env(d, a=0.005, decay=6.0):
    t = tt(d)
    e = np.exp(-decay * t)
    n = max(1, int(a * SR))
    e[:n] *= np.linspace(0, 1, n)
    return e


def fade(x, a=0.01, r=0.02):
    x = x.copy()
    na, nr = int(a * SR), int(r * SR)
    if na:
        x[:na] *= np.linspace(0, 1, na)
    if nr:
        x[-nr:] *= np.linspace(1, 0, nr)
    return x


def band_noise(d, lo, hi, seed=None):
    r = np.random.default_rng(seed) if seed is not None else rng
    n = int(SR * d)
    spec = np.fft.rfft(r.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    mask = ((f >= lo) & (f <= hi)).astype(float)
    # soften mask edges
    k = max(3, int(len(f) * 0.002))
    mask = np.convolve(mask, np.hanning(k) / np.hanning(k).sum(), mode="same")
    out = np.fft.irfft(spec * mask, n)
    return out / (np.max(np.abs(out)) + 1e-9)


def sine(f, d, phase=0.0):
    return np.sin(2 * np.pi * f * tt(d) + phase)


def tri(f, d):
    return 2 / np.pi * np.arcsin(np.sin(2 * np.pi * f * tt(d)))


def softsaw(f, d, harmonics=8):
    t = tt(d)
    x = np.zeros_like(t)
    for h in range(1, harmonics + 1):
        x += np.sin(2 * np.pi * f * h * t) / h / (1 + 0.15 * h)
    return x / 1.6


def pluck(f, d=0.5, bright=1.0):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.45 * bright * np.sin(2 * np.pi * 2 * f * t) * np.exp(-9 * t) + 0.2 * bright * np.sin(2 * np.pi * 3 * f * t) * np.exp(-14 * t)
    return x * env(d, 0.003, 7.0)


def kick(d=0.32, f0=130, f1=42):
    t = tt(d)
    f = f1 + (f0 - f1) * np.exp(-28 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(d, 0.001, 9.0) * 1.0 + 0.25 * band_noise(d, 1500, 6000) * np.exp(-90 * t)


def thud(d=0.28, pitch=1.0):
    t = tt(d)
    f = (52 + 70 * np.exp(-30 * t)) * pitch
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.001, 11.0)
    slap = band_noise(d, 300, 3200) * np.exp(-60 * t) * 0.7
    return body + slap


def click(pitch=1.0, d=0.07):
    t = tt(d)
    return (band_noise(d, 2500, 9000) * np.exp(-120 * t) * 0.6 + np.sin(2 * np.pi * 1900 * pitch * t) * np.exp(-90 * t) * 0.5)


def tick(freq=1400, d=0.06, amp=1.0):
    t = tt(d)
    return np.sin(2 * np.pi * freq * t) * np.exp(-70 * t) * amp


def hat(d=0.06):
    return band_noise(d, 6500, 15000) * np.exp(-70 * tt(d))


def clap(d=0.18):
    t = tt(d)
    return band_noise(d, 900, 5500) * (np.exp(-26 * t) + 0.6 * np.exp(-60 * ((t - 0.012).clip(0)))) * 0.8


def whoosh(d=0.8, up=True, lo=250, hi=7000, bands=9, level=1.0, seed=None):
    t = tt(d)
    out = np.zeros_like(t)
    centers = np.geomspace(lo, hi, bands)
    for i, fc in enumerate(centers):
        n = band_noise(d, fc * 0.7, fc * 1.4, seed=None if seed is None else seed + i)
        pos = (i / (bands - 1)) if up else 1 - i / (bands - 1)
        tc = 0.15 * d + pos * 0.7 * d
        w = 0.2 * d
        out += n * np.exp(-(((t - tc) / w) ** 2))
    out *= np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.2
    return out / (np.max(np.abs(out)) + 1e-9) * level


def riser(d, level=1.0):
    t = tt(d)
    n = band_noise(d, 800, 12000)
    sweep = (t / d) ** 2.2
    tone = np.sin(2 * np.pi * np.cumsum(220 + 1600 * sweep) / SR)
    x = (n * 0.8 + tone * 0.25) * sweep
    return fade(x / (np.max(np.abs(x)) + 1e-9), 0.05, 0.01) * level


def chime(freqs, d=2.6, level=1.0, decay=1.8):
    t = tt(d)
    out = np.zeros_like(t)
    for f in freqs:
        for k, amp, dec in ((1, 1.0, 1.0), (2.0, 0.35, 1.7), (3.01, 0.16, 2.6), (4.2, 0.07, 3.6)):
            out += amp * np.sin(2 * np.pi * f * k * t) * np.exp(-decay * dec * t)
    out *= np.minimum(1, t / 0.004)
    return out / (np.max(np.abs(out)) + 1e-9) * level


def pad_tone(freqs, d, level=1.0):
    t = tt(d)
    out = np.zeros_like(t)
    for f in freqs:
        for det in (-0.004, 0.0, 0.004):
            out += softsaw(f * (1 + det), d, 6)
    a = min(0.9, d * 0.35)
    e = np.minimum(1, t / a) * np.minimum(1, (d - t) / min(0.9, d * 0.4))
    # gentle low-pass by averaging neighbours (cheap smoothing)
    out = np.convolve(out, np.ones(24) / 24, mode="same")
    return out / (np.max(np.abs(out)) + 1e-9) * e * level


# ----------------------------------------------------------------------------- mixing
music = np.zeros((N, 2))
sfx = np.zeros((N, 2))


def place(bus, sig, t0, gain=1.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= N or i + len(sig) <= 0:
        return
    a = max(0, -i)
    b = min(len(sig), N - i)
    ang = (pan + 1) * np.pi / 4
    l, r = np.cos(ang) * gain, np.sin(ang) * gain
    seg = sig[a:b]
    bus[i + a : i + b, 0] += seg * l
    bus[i + a : i + b, 1] += seg * r


def hz(note):  # MIDI note -> Hz
    return 440.0 * 2 ** ((note - 69) / 12)


# chord progression in D major (2 s per chord, 120 BPM): Dadd9 | Bm7 | Gmaj7 | A
CHORDS = [
    dict(root=38, pad=[50, 57, 64, 66], arp=[62, 66, 69, 74, 76]),  # D2 ; D3 A3 E4 F#4
    dict(root=35, pad=[47, 54, 57, 62], arp=[59, 62, 66, 69, 74]),  # B1 ; Bm7
    dict(root=43, pad=[43, 50, 54, 59], arp=[62, 67, 71, 74, 78]),  # G2 ; Gmaj7
    dict(root=45, pad=[45, 52, 57, 61], arp=[61, 64, 69, 73, 76]),  # A2 ; A
]
BEAT = 0.5


def chord_at(t):
    return CHORDS[int(t // 2) % 4]


def gain_curve(t, pts):
    """Piecewise-linear gain from [(time, gain), ...]."""
    ts, gs = zip(*pts)
    return float(np.interp(t, ts, gs))


# ---- music bed ---------------------------------------------------------------------------------
# Scene 1 (0-3 s): tense low drone + wood-block clock.
drone = pad_tone([hz(26), hz(33)], 3.4, 0.55)
place(music, drone, 0.0, 0.5)
for k in range(6):
    place(music, tick(900 + 40 * (k % 2), 0.05, 0.5), k * BEAT, 0.4, -0.1)

# Logo reveal onwards: pads on each chord, bass pulse, arpeggio, drums with scene-based layering.
T_MUSIC = 3.5  # logo reveal
final_t_hint = t_of(S["finale"] + 12)
bar = 2.0
t = 4.0
while t < final_t_hint:
    ch = chord_at(t)
    seg = min(bar, final_t_hint - t)
    pg = gain_curve(t, [(4, 0.85), (10, 0.9), (18, 0.95), (22, 0.95), (28, 0.95)])
    place(music, pad_tone([hz(n) for n in ch["pad"]], seg + 1.0, pg), t - 0.4, 0.55, -0.05)
    # bass: root on beats 1 and the "and" of 2, a little on 4
    for beat, oct_, g in ((0, 0, 0.62), (1.5, 0, 0.45), (3, 0, 0.4)):
        bt = t + beat * BEAT
        if bt < final_t_hint and bt >= 6.0:
            place(music, pluck(hz(ch["root"]) * 1.0, 0.45, 0.35) * 1.3, bt, g * 0.9 * gain_curve(bt, [(6, 0.7), (10, 1.0), (18, 1.15)]))
    # arpeggio: 8th notes from 6 s
    if t >= 6.0:
        for i in range(8):
            at = t + i * BEAT / 2
            if at >= final_t_hint:
                break
            note = ch["arp"][[0, 1, 2, 3, 4, 3, 2, 1][i]]
            g = gain_curve(at, [(6, 0.12), (10, 0.18), (18, 0.24), (22, 0.26)])
            place(music, pluck(hz(note), 0.42, 1.0), at, g, [-0.35, 0.3][i % 2])
    # drums: kick from 10 s, hats from 10 s, clap from 18 s
    if t >= 10.0:
        for b in range(4):
            bt = t + b * BEAT
            if bt >= final_t_hint:
                break
            place(music, kick() * 0.9, bt, 0.55 * gain_curve(bt, [(10, 0.75), (18, 1.0)]))
            place(music, hat(), bt, 0.08, 0.4)
            place(music, hat(), bt + BEAT / 2, 0.12, -0.3)
    if t >= 18.0:
        for b in (1, 3):
            bt = t + b * BEAT
            if bt < final_t_hint:
                place(music, clap(), bt, 0.28)
    t += bar

# Final lift: music drops out at the brand wipe; big chord resolves on the lockup.
final_t = t_of(S["finale"] + 12)  # lockup lands: 27.4 s
final = pad_tone([hz(n) for n in (38, 50, 57, 62, 66, 69, 74)], 2.2, 0.9)
place(music, final, final_t - 0.1, 0.85)
place(music, kick(0.5, 110, 38) * 1.1, final_t, 0.9)

# ---- sound effects ----------------------------------------------------------------------------
K = TIMING["timeScale"]  # scenes 4-8 play their internal timeline K times faster
SCALED = {"network", "start", "monitor", "marking", "reports"}


def F(scene, local):
    """Global frame of a cue given in a scene's *internal* (designed) frame numbers."""
    return S[scene] + round(local / (K if scene in SCALED else 1.0))


def mixsig(a, b):
    out = np.zeros(max(len(a), len(b)))
    out[: len(a)] += a
    out[: len(b)] += b
    return out


def sfx_at(frame, sig, gain=1.0, pan=0.0):
    place(sfx, sig, t_of(frame), gain, pan)


def at(scene, local, sig, gain=1.0, pan=0.0):
    sfx_at(F(scene, local), sig, gain, pan)


# Scene 1: twelve scripts slapping onto the stack (frames 6, 9, 12 ... 39), screen shake on each.
for i in range(12):
    sfx_at(6 + i * 3 + 1, thud(0.26, 0.9 + 0.025 * i), 0.55 + 0.02 * i, 0.3)
# dissolve: the stack breaks into particles (wave 56-76) that sweep into the logo (lands ~104)
sfx_at(56, whoosh(1.0, up=True, lo=300, hi=9000, level=0.9, seed=11), 0.55, 0.2)
sfx_at(58, riser(1.55, 0.7), 0.5)

# Scene 2: logo pops (frame 104), light sweep (122), words (116, 121, 126)
sfx_at(103, thud(0.9, 0.7) * 1.2, 0.9)
sfx_at(103, chime([hz(74), hz(81)], 2.4, 0.6, 1.6), 0.5, 0.1)
sfx_at(122, whoosh(0.55, up=True, lo=1500, hi=9000, level=0.7, seed=31), 0.4, 0.2)
for k, fr in enumerate((116, 121, 126)):
    sfx_at(fr, click(1.0 + 0.1 * k), 0.4)
sfx_at(S["reveal"] + 76, whoosh(0.5, up=False, lo=300, hi=5000, level=0.7, seed=41), 0.45)

# Scene 3 (new): question bank - window, three cards, pills, year ruler
sq = S["questions"]
sfx_at(sq + 1, whoosh(0.55, up=True, lo=300, hi=6000, level=0.8, seed=45), 0.5)
for k, fr in enumerate((12, 24, 36)):
    sfx_at(sq + fr, mixsig(whoosh(0.35, up=True, lo=1500, hi=9000, level=0.6, seed=47 + k), click(0.9 + 0.1 * k) * 0.6), 0.4, 0.2)
for k, fr in enumerate((22, 27, 32, 38)):
    sfx_at(sq + fr, tick(900 + 120 * k, 0.07, 0.8), 0.3)
for k in range(14):  # year ruler fills (frames 16-62)
    sfx_at(sq + 16 + round(k * 46 / 13), tick(500 + 60 * k, 0.04, 0.7), 0.12)
sfx_at(sq + 38, chime([hz(79), hz(86)], 0.9, 0.5, 4), 0.35)
sfx_at(sq + 62, chime([hz(81), hz(88)], 1.0, 0.5, 3.5), 0.35, 0.2)

# Scene 4: sign-in typing, click, connect
s3 = "network"
at(s3, 2, whoosh(0.55, up=True, lo=300, hi=6000, level=0.8, seed=51), 0.5)
for k in range(11):
    at(s3, 16 + round(k * 1.8), click(0.9 + 0.1 * (k % 3)), 0.3)
for k in range(8):
    at(s3, 38 + round(k * 1.4), click(0.8 + 0.08 * (k % 3)), 0.24)
for fr in (18, 36, 58):
    at(s3, fr, click(0.7, 0.09) * 1.2, 0.55)
at(s3, 66, whoosh(0.7, up=False, lo=300, hi=5000, level=0.8, seed=61), 0.45)
for k, fr in enumerate((84, 92, 100, 108)):
    at(s3, fr, chime([hz(81 + 2 * k)], 0.9, 0.5, 4.5), 0.5, -0.3 + 0.2 * k)

# Scene 5: countdown, Begin, exam interface
s4 = "start"
at(s4, 1, whoosh(0.5, up=True, lo=300, hi=6000, level=0.7, seed=71), 0.45)
for fr, pitch in ((6, 0.8), (13, 0.9), (20, 1.0)):
    at(s4, fr, tick(660 * (1 + (pitch - 0.8)), 0.12, 0.9), 0.4)
at(s4, 22, chime([hz(81)], 0.6, 0.5, 5), 0.4)
at(s4, 32, click(0.7, 0.09) * 1.3, 0.6)
at(s4, 34, whoosh(0.6, up=True, lo=400, hi=8000, level=0.9, seed=81), 0.6)
at(s4, 36, thud(0.3, 1.2) * 0.8, 0.5)
for k, fr in enumerate((52, 55, 58, 61, 64, 67)):  # calculator keys
    at(s4, fr, click(1.1 + 0.05 * k), 0.34)
at(s4, 70, click(0.7, 0.09) * 1.2, 0.5)
at(s4, 72, chime([hz(79), hz(86)], 0.9, 0.6, 4), 0.45)

# Scene 6: dashboard fills, rows submit
s5 = "monitor"
at(s5, 1, whoosh(0.6, up=True, lo=300, hi=6000, level=0.8, seed=91), 0.5)
for k in range(8):
    at(s5, 10 + k * 4, click(1.0 + 0.04 * k), 0.16, -0.5 + k * 0.14)
for fr in (66, 92, 108):
    at(s5, fr, chime([hz(83), hz(90)], 1.0, 0.7, 3.5), 0.5, 0.2)

# Scene 7: submit, calculate, score count-up, celebration
s6 = "marking"
at(s6, 1, whoosh(0.5, up=True, lo=300, hi=6000, level=0.8, seed=101), 0.45)
at(s6, 18, click(0.7, 0.09) * 1.3, 0.6)
at(s6, 22, whoosh(0.7, up=True, lo=300, hi=7000, level=0.7, seed=111), 0.4)
at(s6, 46, whoosh(0.6, up=True, lo=500, hi=9000, level=0.9, seed=121), 0.5)
at(s6, 46, thud(0.35, 1.3) * 0.7, 0.5)
for k in range(30):  # score ticks follow the count-up easing (86 points over designed frames 54-102)
    x = k / 29
    at(s6, 54 + 48 * (1 - (1 - x) ** (1 / 3)), tick(700 + 900 * x, 0.05, 0.9), 0.25 + 0.15 * x)
at(s6, 98, riser(0.6, 0.5), 0.3)
at(s6, 101, kick(0.5, 120, 38) * 1.2, 0.8)
at(s6, 101, chime([hz(74), hz(78), hz(81), hz(86)], 2.4, 0.9, 1.5), 0.65)
at(s6, 102, whoosh(0.5, up=True, lo=2000, hi=12000, level=0.9, seed=131), 0.5, 0.3)
for k in range(10):
    at(s6, 103 + k * 2, tick(2400 + 300 * (k % 4), 0.05, 0.6), 0.14, (-1) ** k * 0.6)

# Scene 8: cards, zip, broadsheet
s7 = "reports"
at(s7, 1, whoosh(0.5, up=True, lo=300, hi=6000, level=0.8, seed=141), 0.45)
for k in range(5):
    at(s7, 8 + k * 9, mixsig(whoosh(0.4, up=True, lo=1500, hi=9000, level=0.7, seed=150 + k), click(1.0) * 0.5), 0.42, -0.4 + 0.2 * k)
at(s7, 62, whoosh(0.9, up=False, lo=300, hi=6000, level=0.9, seed=161), 0.55)
at(s7, 80, thud(0.4, 1.0) * 1.2, 0.8)
at(s7, 80, chime([hz(79), hz(86)], 1.2, 0.7, 3), 0.5)
at(s7, 96, whoosh(0.8, up=True, lo=300, hi=7000, level=0.9, seed=171), 0.55, 0.2)
for k in range(21):
    at(s7, 104 + k * 1.6, click(1.0 + 0.04 * (k % 5)), 0.15, 0.3)
at(s7, 150, riser(0.5, 0.6), 0.4)

# Scene 9: brand wipe, lockup, CTA, contact card
s8 = S["finale"]
sfx_at(s8 - 2, whoosh(0.7, up=True, lo=200, hi=9000, level=1.0, seed=181), 0.8)
sfx_at(s8 + 12, kick(0.6, 125, 36) * 1.3, 0.9)
sfx_at(s8 + 12, chime([hz(74), hz(81), hz(86), hz(90)], 3.4, 1.0, 1.1), 0.75)
sfx_at(s8 + 12, whoosh(0.4, up=True, lo=1500, hi=9000, level=0.8, seed=191), 0.4)
sfx_at(s8 + 17, whoosh(0.4, up=True, lo=1500, hi=9000, level=0.8, seed=193), 0.35)
sfx_at(s8 + 28, click(0.8, 0.09) * 1.2, 0.45)
sfx_at(s8 + 30, whoosh(0.5, up=True, lo=1500, hi=9000, level=0.7, seed=195), 0.4)
sfx_at(s8 + 38, whoosh(0.5, up=True, lo=2500, hi=12000, level=0.7, seed=197), 0.35)
sfx_at(s8 + 40, chime([hz(93), hz(98)], 1.8, 0.5, 2.2), 0.35, 0.2)

# ---- reverb, sidechain-ish ducking, master ----------------------------------------------------
def reverb(bus, mix=0.16, length=1.4):
    n = int(SR * length)
    ir = rng.standard_normal(n) * np.exp(-3.2 * np.arange(n) / SR)
    ir = np.convolve(ir, np.ones(6) / 6, mode="same")
    ir /= np.sqrt(np.sum(ir ** 2))
    out = np.zeros_like(bus)
    for c in range(2):
        L = len(bus) + n
        wet = np.fft.irfft(np.fft.rfft(bus[:, c], L) * np.fft.rfft(np.roll(ir, c * 37), L), L)[: len(bus)]
        out[:, c] = bus[:, c] * (1 - mix) + wet * mix * 3.0
    return out


music = reverb(music, 0.18)
sfx = reverb(sfx, 0.14)

# duck the music slightly under the loudest SFX moments
sfx_env = np.convolve(np.abs(sfx).max(axis=1), np.ones(int(SR * 0.08)) / int(SR * 0.08), mode="same")
duck = 1 - 0.35 * np.clip(sfx_env / (np.percentile(sfx_env, 99) + 1e-9), 0, 1)
mix = music * duck[:, None] * 0.72 + sfx * 0.95

# master: gentle fade-in, natural tail + short fade-out, soft clip, normalise
mix[: int(0.03 * SR)] *= np.linspace(0, 1, int(0.03 * SR))[:, None]
mix[-int(0.35 * SR) :] *= np.linspace(1, 0, int(0.35 * SR))[:, None]
mix = np.tanh(mix * 1.25) / np.tanh(1.25)
peak = np.max(np.abs(mix))
mix = mix / peak * 0.66  # about -3.6 dBFS peak, roughly -15 LUFS integrated

out_path = ROOT / "public" / "audio" / "soundtrack.wav"
out_path.parent.mkdir(parents=True, exist_ok=True)
pcm = (np.clip(mix, -1, 1) * 32767).astype("<i2")
with wave.open(str(out_path), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"wrote {out_path}  ({len(pcm) / SR:.2f} s, {SR} Hz, stereo)")
