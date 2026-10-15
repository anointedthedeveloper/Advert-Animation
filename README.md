# Exam Box: 30-second cinematic advert

A code-driven motion-graphics advert for **Exam Box**, the computer-based testing (CBT) system by
**Anobyte Technologies**. It is built with [Remotion](https://www.remotion.dev) (React) and renders to a real
**H.264 + AAC MP4**: 1920 × 1080, 30 fps, 900 frames, exactly 30.0 seconds.

Concept: **"Run the exam. Skip the marking."**

```
out/exambox-advert.mp4        <- the finished video
```

## What is in the video

| Time | Scene | On-screen text |
|---|---|---|
| 0:00 – 0:03 | Stack of marked scripts dissolves into particles | Marking exams takes days. |
| 0:03 – 0:06 | Logo emerges, light sweep | Meet Exam Box. |
| 0:06 – 0:10 | Student login, devices join one local server | Run exams on your own network |
| 0:10 – 0:14 | Waiting room, then exam screen with timer, subject tabs, navigator, calculator | Everyone starts together |
| 0:14 – 0:18 | Admin Live Monitor with progress bars and submissions | Watch every candidate live |
| 0:18 – 0:22 | Submit, "Calculating score…", animated score card | Instant marking. Scores out of 100. |
| 0:22 – 0:28 | Report cards gather into a ZIP, broadsheet slides in | Branded report cards for the whole class / Export to Excel |
| 0:28 – 0:30 | Logo lockup and call to action | Exam Box. Smarter exams, instant results. / Get Exam Box for your school. / © 2026 Anobyte Technologies |

Scene boundaries are defined in `src/timing.json`. Scene 8 starts its wipe at 27.8 s so the lockup is fully
built, and readable, for the last 1.2 s or more.

All school and student names (Greenfield Academy, Daniel Ade …) are **fictional**. No JAMB or WAEC logos are
used and no affiliation is implied. The statistics shown (24 candidates, 86 / 100 …) are illustrative mock-up
data, not product claims.

## Requirements

* Node.js 18+ (tested on 22) and npm
* Python 3 with **numpy** (only to regenerate the soundtrack; the generated WAV is committed)
* **ffmpeg / ffprobe** on your PATH (used by `npm run verify`; Remotion bundles its own encoder for rendering)
* Chrome or Chromium. Remotion downloads its own headless browser the first time it renders. If you are offline,
  or the download is blocked, point `BROWSER` at any Chrome/Chromium/`headless_shell` binary.

## Install

```bash
npm install
```

## Preview (live, scrubbable)

```bash
npm run preview          # opens Remotion Studio at http://localhost:3000, composition "ExamBoxAdvert"
```

Preview playback speed does not affect the result: every frame is a pure function of the frame number.
Render a single frame to a PNG with `npx remotion still src/index.ts ExamBoxAdvert out/still.png --frame=450`.

## Render the MP4

```bash
npm run audio            # (re)generates public/audio/soundtrack.wav, optional because it is committed
npm run render           # -> out/exambox-advert.mp4
npm run verify           # ffprobe checks: 900 frames, 30 fps, 30.0 s, 1920x1080, H.264 + AAC
```

Using an existing browser (for example in a container or CI):

```bash
BROWSER=/path/to/chrome npm run render
```

The exact command `npm run render` runs is:

```bash
npx remotion render src/index.ts ExamBoxAdvert out/exambox-advert.mp4 --concurrency=4
```

Codec, CRF 16, PNG frames, `yuv420p` and AAC 256 kbit/s are set in `remotion.config.ts`.
Lower `CONCURRENCY` (for example `CONCURRENCY=2 npm run render`) on small machines.

## Project layout

```
public/brand/exambox-mark.png   official Exam Box mark (transparent PNG), used untouched
public/brand/exambox-logo.png   official full logo lockup (reference; not used in the video)
public/brand/trophy.png         trophy illustration from the Exam Box app, used on the score card
public/fonts/Inter-*.otf        Inter typeface (SIL Open Font License 1.1)
public/audio/soundtrack.wav     generated music + sound effects
scripts/make_audio.py           procedural soundtrack, cues are in video frames
scripts/render.mjs              reproducible render wrapper
scripts/verify.mjs              ffprobe verification of the finished MP4
src/timing.json                 frame count, size, scene boundaries (single source of truth)
src/Advert.tsx                  composition: fonts, audio, scene sequencing
src/scenes/Scene1…Scene8*.tsx   one file per scene
src/components/                 shared pieces: kinetic text, cursor, particles, UI mock-ups, icons
NARRATION.md                    optional voice-over script
```

## Brand

| | |
|---|---|
| Primary green | `#16A34A` |
| Dark green | `#064E3B` |
| Deep background | `#022C22` |
| Emerald | `#10B981` |
| Mint | `#A7F3D0` |
| Support | `#FFFFFF`, `#F1F5F9`, `#0F172A`, `#64748B` |

The logo is the supplied `exambox-mark.png`, shown unaltered, seated on a white rounded plate so its greens keep
full contrast on the dark background. To use a different logo, replace `public/brand/exambox-mark.png` with a
transparent, square PNG.

## Audio

The soundtrack (music bed plus about 150 timed sound effects) is synthesised from scratch by
`scripts/make_audio.py`, so it is original and licence-free. Cue times are expressed in video frames and read the
scene starts from `src/timing.json`. If you move a scene, update the cues. No voice-over is included (see
`NARRATION.md`).

## Licences

* Remotion is free for individuals and companies of up to three people; larger companies need a Remotion company
  licence (<https://www.remotion.dev/license>).
* Inter is licensed under the SIL Open Font License 1.1.
* Exam Box and Anobyte branding © Anobyte Technologies.

## Publishing to a new GitHub repository

```bash
git init
git add .
git commit -m "Exam Box 30-second advert"
git branch -M main
git remote add origin https://github.com/<your-user>/<new-repo>.git
git push -u origin main
```

Create the empty repository on GitHub first (without a README). `node_modules/` is ignored; the MP4 is about
12 MB and is committed so the repository contains the finished video.
