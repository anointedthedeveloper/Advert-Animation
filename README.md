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

The advert tells a story in three beats: **the problems schools face, who we are, and how Exam Box fixes each problem.**
Every feature scene opens with a struck-through problem tag that turns into a green "Fixed" tag, then a headline and one
line that says how.

| Time | Beat | Scene | On-screen text |
|---|---|---|---|
| 0.0 – 4.8 s | Problems | A stack of marked scripts grows while four problems stamp in, then everything dissolves into particles | Sound familiar? / Marking takes days. / Report cards and broadsheets compiled by hand. / Candidates face CBT for the first time on exam day. / Cyber cafés cost money and are hard to supervise. |
| 4.8 – 7.6 s | Who we are | Logo emerges from the particles | Meet Exam Box. The offline computer-based testing system for schools and exam centres. By Aremu Tech Eazy Solutions |
| 7.6 – 10.2 s | Strength | Question bank: JAMB and WAEC tabs, year ruler, a question with a diagram, a custom school question | Ready on day one. Past questions 1998 to date. |
| 10.2 – 13.1 s | Fix: cyber café fees | Student login, devices join one local server | Run exams on your own network |
| 13.1 – 15.9 s | Fix: first CBT on exam day | Waiting room, then exam screen with timer, subject tabs, navigator, calculator | Everyone starts together |
| 15.9 – 18.8 s | Fix: hard to supervise | Admin Live Monitor with progress bars and submissions | Watch every candidate live |
| 18.8 – 21.7 s | Fix: marking takes days | Submit, "Calculating score…", animated score card | Instant marking. Scores out of 100. |
| 21.7 – 26.7 s | Fix: reports by hand | Report cards gather into a ZIP, broadsheet slides in | Branded report cards for the whole class / Export to Excel |
| 26.7 – 30.0 s | Call to action | Logo lockup, button, contact card | Exam Box. Smarter exams, instant results. / Get Exam Box for your school. / aremutecheazysolutions.com / 0901 647 1351 · 0902 907 4772 / © 2026 Aremu Tech Eazy Solutions |

Scene boundaries, each scene's playback speed (`scale`), the paper-landing frames and the problem-row frames live in
`src/timing.json`.

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
2. `npm run encode`: ffmpeg writes the delivery file. H.264 High, constant quality (CRF 21) with a 4 Mbit/s cap and a
   small buffer (no bitrate spikes, so smooth playback on any player or connection), a keyframe every 2 s (smooth
   seeking), BT.709 colour tags and the MP4 index at the front (instant start on the web). The soundtrack is taken from
   `public/audio/soundtrack.wav` and encoded once to AAC stereo 160 kbit/s, so sound is always in the file. The result
   is about **6.7 MB** and measures SSIM 0.996 against the master (1.0 = identical). Tune with `CRF=19 npm run encode`
   (sharper, about 8 MB) or `CRF=23 npm run encode` (smaller, about 5.5 MB).

`npm run verify` proves the file is right, including that the audio is **audible** (it measures loudness, not just that an
audio stream exists) and that the file is under 10 MB.

Lower `CONCURRENCY` (for example `CONCURRENCY=2 npm run render`) on small machines.

## Watch and download in a browser

Open `viewer/index.html` after rendering (double-click it, or serve the folder with `npx serve .` and open
`/viewer/`). It plays the video, lets you jump to any scene, shows the contact details, and has a **Download video**
button that saves `exambox-advert.mp4`.

## The flyer

An A4 flyer with the same story (problems on the left, fixes on the right), the screenshots from the advert, the
website, both phone numbers and a QR code.

```
out/exambox-flyer.pdf     print-ready A4, vector text, about 1 MB
out/exambox-flyer.png     2480 x 3508 px (A4 at 300 dpi) for print shops
out/exambox-flyer.jpg     1240 x 1754 px, light file for WhatsApp and social media
flyer/index.html          the flyer source (HTML and CSS, 794 x 1123 px = A4 at 96 dpi)
```

Rebuild all three files after editing `flyer/index.html`:

```bash
BROWSER=/path/to/chrome npm run flyer      # omit BROWSER if Chrome or Chromium is on a standard path
```

The screenshots in `flyer/img/` are stills from the advert (frames 467, 548 and 640). The QR code points to
`https://aremutecheazysolutions.com` and is regenerated with:

```bash
node -e "require('qrcode').toString('https://aremutecheazysolutions.com',{type:'svg',margin:0,color:{dark:'#022C22',light:'#FFFFFF'},errorCorrectionLevel:'M'}).then(s=>require('fs').writeFileSync('flyer/img/qr.svg',s))"
```

The flyer has no print bleed. Ask the print shop for A4, full colour, "fit to page". Like the video, it carries the
line "Not affiliated with or endorsed by JAMB or WAEC".

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
src/timing.json                 frame count, size, scene boundaries and speeds (single source of truth)
src/frame.tsx                   per-scene playback-speed helper
src/Advert.tsx                  composition: fonts, audio, scene sequencing
src/scenes/                     one file per scene
src/components/                 shared pieces: kinetic text, problem/fixed tags, cursor, canvas particles, UI mock-ups, icons
viewer/index.html, poster.jpg   player page with download button
flyer/                          A4 flyer source and images
scripts/flyer.mjs               exports the flyer to PDF, PNG and JPG
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

The soundtrack (music bed plus about 190 timed sound effects) is synthesised from scratch by
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
ignored; the 6.7 MB MP4 is committed so the repository contains the finished video.
