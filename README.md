# Exam Box: 30-second cinematic advert

A code-driven motion-graphics advert for **Exam Box**, the computer-based testing (CBT) system sold by
**Aremu Tech Eazy Solutions** (aremutecheazysolutions.com, 0901 647 1351, 0902 907 4772). Built with
[Remotion](https://www.remotion.dev) (React) and delivered as a real **H.264 + AAC MP4**: 1920 × 1080, 30 fps,
900 frames, exactly 30.0 seconds.

Concept: **"Run the exam. Skip the marking."**

```
out/exambox-advert.mp4     the finished video
viewer/index.html          a page that plays the video and has a Download video button
```

## What is in the video

| Time | Scene | On-screen text |
|---|---|---|
| 0:00 – 0:03 | Stack of marked scripts dissolves into particles | Marking exams takes days. |
| 0:03 – 0:06 | Logo emerges, light sweep | Meet Exam Box. |
| 0:06 – 0:09 | Question bank: JAMB and WAEC tabs, year ruler, a question with a diagram, a custom school question | Past questions 1998 to date. |
| 0:09 – 0:12 | Student login, devices join one local server | Run exams on your own network |
| 0:12 – 0:15 | Waiting room, then exam screen with timer, subject tabs, navigator, calculator | Everyone starts together |
| 0:15 – 0:19 | Admin Live Monitor with progress bars and submissions | Watch every candidate live |
| 0:19 – 0:22 | Submit, "Calculating score…", animated score card | Instant marking. Scores out of 100. |
| 0:22 – 0:27 | Report cards gather into a ZIP, broadsheet slides in | Branded report cards for the whole class / Export to Excel |
| 0:27 – 0:30 | Logo lockup, call to action, contact card | Exam Box. Smarter exams, instant results. / Get Exam Box for your school. / aremutecheazysolutions.com / 0901 647 1351 · 0902 907 4772 / © 2026 Aremu Tech Eazy Solutions |

Scene boundaries and the playback speed of scenes 4-8 (`timeScale`) live in `src/timing.json`.

All school and student names (Greenfield Academy, Daniel Ade …) are **fictional**, and the numbers in the mock-ups
(24 candidates, 86 / 100, the sample questions …) are illustrative. The question-bank scene states "past questions
1998 to date", "JAMB and WAEC" and "images included" as supplied by the product owner; those claims could not be
checked in the Exam Box source code, so confirm them before publishing. The video carries a small
"Not affiliated with or endorsed by JAMB or WAEC" line, and no JAMB or WAEC logos are used.

## Requirements

* Node.js 18+ (tested on 22) and npm
* Python 3 with **numpy** (only to regenerate the soundtrack; the generated WAV is committed)
* **ffmpeg / ffprobe** on your PATH (final encode and `npm run verify`)
* Chrome or Chromium. Remotion downloads its own headless browser the first time it renders. If you are offline,
  or the download is blocked, point `BROWSER` at any Chrome/Chromium/`headless_shell` binary.

## Install

```bash
npm install
```

## Preview (live, scrubbable)

```bash
npm run preview          # Remotion Studio at http://localhost:3000, composition "ExamBoxAdvert"
```

Preview playback speed does not affect the result: every frame is a pure function of the frame number. The preview
is a browser rendering live, so a very busy moment can drop frames there even on a fast PC; the MP4 never does.
Render one frame with `npx remotion still src/index.ts ExamBoxAdvert out/still.png --frame=450`.

## Render the MP4

```bash
npm run audio            # (re)generates public/audio/soundtrack.wav, optional because it is committed
npm run render           # Remotion master -> ffmpeg final encode -> out/exambox-advert.mp4
npm run verify           # ffprobe checks: 900 frames, 30 fps, 30.0 s, 1920x1080, H.264 + AAC, yuv420p
```

Using an existing browser (for example in a container or CI):

```bash
BROWSER=/path/to/chrome npm run render
```

`npm run render` does two steps:

1. `npx remotion render src/index.ts ExamBoxAdvert out/master.mp4 --concurrency=4`: a near-lossless master (PNG frames,
   CRF 1, BT.709). The master is git-ignored and kept so you can re-encode without re-rendering.
2. `npm run encode`: ffmpeg writes the delivery file, H.264 High, CRF 15 capped at 8 Mbit/s with a half-second buffer
   (no bitrate spikes, so smooth playback even on weaker players or streams), a keyframe every 2 s (smooth seeking),
   BT.709 colour tags, the AAC audio copied untouched, and the MP4 index moved to the front (instant start on the
   web). Settings are in `scripts/encode.mjs`.

Lower `CONCURRENCY` (for example `CONCURRENCY=2 npm run render`) on small machines.

## Watch and download in a browser

Open `viewer/index.html` after rendering (double-click it, or serve the folder with `npx serve .` and open
`/viewer/`). It plays the video, lets you jump to any scene, shows the contact details, and has a **Download video**
button that saves `exambox-advert.mp4`.

## Project layout

```
public/brand/exambox-mark.png   official Exam Box mark (transparent PNG), used untouched
public/brand/exambox-logo.png   official full logo lockup (reference; not used in the video)
public/brand/trophy.png         trophy illustration from the Exam Box app, used on the score card
public/fonts/Inter-*.otf        Inter typeface (SIL Open Font License 1.1)
public/audio/soundtrack.wav     generated music + sound effects
scripts/make_audio.py           procedural soundtrack, cues are in video frames
scripts/render.mjs              reproducible render wrapper (master + encode)
scripts/encode.mjs              final delivery encode from the master
scripts/verify.mjs              ffprobe verification of the finished MP4
src/timing.json                 frame count, size, time scale, scene boundaries (single source of truth)
src/frame.tsx                   per-scene playback-speed helper
src/Advert.tsx                  composition: fonts, audio, scene sequencing
src/scenes/                     one file per scene
src/components/                 shared pieces: kinetic text, cursor, canvas particles, UI mock-ups, icons
viewer/index.html, poster.jpg   player page with download button
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
transparent, square PNG. Company name, website and phone numbers are constants at the top of
`src/scenes/Scene8Finale.tsx` (and in `viewer/index.html`).

## Audio

The soundtrack (music bed plus about 170 timed sound effects) is synthesised from scratch by
`scripts/make_audio.py`, so it is original and licence-free. Cue times are expressed in video frames and read the
scene starts and `timeScale` from `src/timing.json`. If you move a scene, regenerate the audio. No voice-over is
included (see `NARRATION.md`).

## Licences

* Remotion is free for individuals and companies of up to three people; larger companies need a Remotion company
  licence (<https://www.remotion.dev/license>).
* Inter is licensed under the SIL Open Font License 1.1.
* Exam Box branding and company details © Aremu Tech Eazy Solutions.

## Publishing to a new GitHub repository

```bash
git init
git add .
git commit -m "Exam Box 30-second advert"
git branch -M main
git remote add origin https://github.com/<your-user>/<new-repo>.git
git push -u origin main
```

Create the empty repository on GitHub first (without a README). `node_modules/` and the large master render are
ignored; the 12 MB MP4 is committed so the repository contains the finished video.
