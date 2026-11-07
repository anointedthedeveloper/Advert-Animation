# Exam Box: 45-second cinematic advert

A code-driven motion-graphics advert for **Exam Box**, the computer-based testing (CBT) system sold by
**Aremu Tech Eazy Solutions** (aremutecheazysolutions.com, 0901 647 1351, 0902 907 4772). Built with
[Remotion](https://www.remotion.dev) (React) and delivered as real **H.264 + AAC MP4** files: 1920 × 1080, 30 fps,
1350 frames, exactly 45.0 seconds, with a voice-over. A vertical version for WhatsApp status is included.

Concept: **"Run the exam. Skip the marking."** The story is: the problems schools face, who we are, and how Exam Box
fixes each one.

```
out/exambox-advert.mp4             the finished film, 45 s, with voice-over
out/exambox-advert-no-voice.mp4    the same film with music and effects only
out/exambox-status.mp4             WhatsApp status, the whole film as one vertical video (9:16, 45 s)
out/exambox-status-part1.mp4       the same in two parts under 30 s, in case WhatsApp trims status at 30 s
out/exambox-status-part2.mp4
out/exambox-flyer*.pdf/png/jpg     A4 flyers (landscape and portrait)
viewer/index.html                  a page that plays the film and has the download buttons
```

## What is in the video

Every feature scene opens with a struck-through problem tag that turns into a green "Fixed" tag, then a headline and one
line that says how.

| Time | Beat | Scene | On-screen text |
|---|---|---|---|
| 0.0 – 10.3 s | Problems, then the fixes | Four problem cards appear one by one, each with a plain explanation, while a stack of marked scripts grows. Then every card flips to its fix and everything dissolves into particles | Sound familiar? Exams need the internet / Marking takes days / Report cards compiled by hand / Cyber cafés cost money. Then: Exam Box fixes all four, Fully offline. No data bills. / Instant marking / Branded report cards / Watch every candidate live |
| 10.3 – 14.7 s | Who we are | Logo emerges from the particles, then the four fixes in one line | Meet Exam Box. The fully offline computer-based testing system for schools and exam centres. Fully offline, Instant marking, Live monitoring, Report cards + Excel. By Aremu Tech Eazy Solutions |
| 14.7 – 18.3 s | Strength | Question bank: JAMB and WAEC tabs, year ruler, a question with a diagram, a custom school question | Ready on day one. Past questions 1998 to date. |
| 18.3 – 23.1 s | Fix: data and internet costs (the main selling point) | Student login, devices join one local server, "No internet needed" badge | Fully offline. No data bills. Run exams on your own school network. |
| 23.1 – 27.1 s | Fix: first CBT on exam day | Waiting room, then exam screen with timer, subject tabs, navigator, calculator | Everyone starts together |
| 27.1 – 31.1 s | Fix: hard to supervise | Admin Live Monitor with progress bars and submissions | Watch every candidate live |
| 31.1 – 35.1 s | Fix: marking takes days | Submit, "Calculating score…", animated score card | Instant marking. Scores out of 100. |
| 35.1 – 40.6 s | Fix: reports by hand | Report cards gather into a ZIP, broadsheet slides in | Branded report cards for the whole class / Export to Excel |
| 40.6 – 45.0 s | Call to action | Logo lockup, button, offline pills, contact card | Exam Box. Smarter exams, instant results. / Get Exam Box for your school. / Fully offline, No data bills / aremutecheazysolutions.com / 0901 647 1351 · 0902 907 4772 / © 2026 Aremu Tech Eazy Solutions |

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
npm run verify           # ffprobe checks: 1350 frames, 30 fps, 45.0 s, 1920x1080, H.264 + AAC, audible sound
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

## WhatsApp status (vertical)

`out/exambox-status.mp4` is the whole 45 s film laid out for a phone: **1080 × 1920 (9:16), one continuous video,
about 9 MB**, with the voice-over and music. Every scene has its own portrait layout (stacked exam screen, simplified
live monitor, larger type), and the key content stays clear of the areas WhatsApp covers at the top and bottom.

Some versions of WhatsApp limit a status clip to 30 seconds, so the same story is also provided in two parts that split
at a natural scene break (`statusSplit` in `src/timing.json`), each with a "Part 1 of 2 / Part 2 next →" label:

* `out/exambox-status-part1.mp4`: 23.1 s, the problems, the fixes at a glance, who we are, past questions, offline.
* `out/exambox-status-part2.mp4`: 21.9 s, how it works, then the call to action.

```bash
npm run render:status         # one video       -> out/exambox-status.mp4
npm run render:status:parts   # the two parts   -> out/exambox-status-part1.mp4 and part2
node scripts/verify.mjs out/exambox-status.mp4
```

`npm run preview` shows all compositions in Remotion Studio: `ExamBoxAdvert` (16:9), `ExamBoxStatusFull` (9:16, one
video) and `ExamBoxStatus` (9:16, for the two parts). The scenes read the layout from `src/layout.tsx`, so a change to
the story or timing applies to all of them.

## Watch and download in a browser

Open `viewer/index.html` after rendering (double-click it, or serve the folder with `npx serve .` and open
`/viewer/`). It plays the video, lets you jump to any scene, shows the contact details, and has a **Download video**
button that saves `exambox-advert.mp4`.

## The flyers

Two A4 flyers with the same branding, contact details and QR code:

- **Landscape (simple):** one headline, three short points, one visual, the call to action. Best for sharing and quick reads.
- **Portrait (detailed):** adds the problem and fix list and more app screenshots.

```
out/exambox-flyer-landscape.pdf / .png / .jpg    flyer/landscape.html
out/exambox-flyer.pdf / .png / .jpg              flyer/index.html (portrait)
```

`.pdf` is print-ready A4 with vector text, `.png` is A4 at 300 dpi (3508 x 2480 landscape, 2480 x 3508 portrait) for
print shops, and `.jpg` is a half-size copy under 0.4 MB for WhatsApp and social media.

Rebuild all six files after editing either HTML file:

```bash
BROWSER=/path/to/chrome npm run flyer      # omit BROWSER if Chrome or Chromium is on a standard path
```

The screenshots in `flyer/img/` are stills from the advert (frames 467, 548 and 640). The QR code points to
`https://aremutecheazysolutions.com` and is regenerated with:

```bash
node -e "require('qrcode').toString('https://aremutecheazysolutions.com',{type:'svg',margin:0,color:{dark:'#022C22',light:'#FFFFFF'},errorCorrectionLevel:'M'}).then(s=>require('fs').writeFileSync('flyer/img/qr.svg',s))"
```

The flyers have no print bleed. Ask the print shop for A4, full colour, "fit to page". Like the video, they carry the line
"Not affiliated with or endorsed by JAMB or WAEC".

## Project layout

```
public/brand/exambox-mark.png   official Exam Box mark (transparent PNG), used untouched
public/brand/exambox-logo.png   official full logo lockup (reference; not used in the video)
public/brand/trophy.png         trophy illustration from the Exam Box app, used on the score card
public/fonts/Inter-*.otf        Inter typeface (SIL Open Font License 1.1)
public/audio/soundtrack.wav     final mix: voice-over + music + sound effects
public/audio/music_sfx.wav      music + sound effects only
public/audio/narration.wav      the voice-over track (and narration.json with its timings)
scripts/make_audio.py           procedural music and effects, plus the final mix with the voice
scripts/make_narration.py       voice-over (Kokoro text-to-speech)
scripts/render.mjs              reproducible render wrapper (master + encode)
scripts/encode.mjs              final delivery encode from the master
scripts/verify.mjs              ffprobe verification of the finished MP4
src/timing.json                 frame count, size, scene boundaries and speeds (single source of truth)
src/frame.tsx                   per-scene playback-speed helper
src/layout.tsx                  landscape / portrait layout context and the Fit helper
src/Advert.tsx                  composition: fonts, audio, scene sequencing
src/scenes/                     one file per scene
src/components/                 shared pieces: kinetic text, problem/fixed tags, cursor, canvas particles, UI mock-ups, icons
viewer/index.html, poster.jpg   player page with download button
flyer/                          A4 flyer sources (landscape.html, index.html) and images
scripts/flyer.mjs               exports both flyers to PDF, PNG and JPG
NARRATION.md                    the spoken script and how to change it
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

Three layers, all produced locally:

1. **Music and sound effects:** synthesised from scratch by `scripts/make_audio.py` (about 190 timed effects), so they are
   original and licence-free. Cue times are in video frames and follow `src/timing.json`.
2. **Voice-over:** `scripts/make_narration.py` speaks one line per stage with the open-source Kokoro model and places each
   line on its scene. The script and timings are in `NARRATION.md` and `public/audio/narration.json`.
3. **Mix:** `make_audio.py` ducks the music and effects while the voice speaks and writes `public/audio/soundtrack.wav`
   (with voice) and `public/audio/music_sfx.wav` (without).

`npm run encode` builds `out/exambox-advert.mp4` (with voice-over) and `npm run encode:novoice` builds
`out/exambox-advert-no-voice.mp4`. `npm run verify` checks that the sound is audible in either file.

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
