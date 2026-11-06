# Exam Box advert: voice-over

The video now has a spoken voice-over that introduces each stage, synthesised locally with the open-source Kokoro
text-to-speech model (voice `af_heart`, a warm US female voice). Every message is also on screen, so the advert
works with the sound off, and a music-only version is provided.

| Time | Spoken line |
|---|---|
| 0.4 – 1.6 s | Marking takes days. |
| 1.8 – 2.9 s | Reports, by hand. |
| 3.0 – 4.5 s | Cyber cafés cost money. |
| 5.1 – 7.8 s | Meet Exam Box, the offline exam system. |
| 7.9 – 10.1 s | Past questions, from nineteen ninety eight. |
| 10.3 – 12.0 s | Run exams on your own network. |
| 13.1 – 15.9 s | Everyone starts together, on a real exam screen. |
| 16.1 – 17.7 s | Watch every candidate live. |
| 18.9 – 21.2 s | Instant marking. Scores out of one hundred. |
| 21.9 – 25.9 s | Branded report cards for the whole class, and a broadsheet ready for Excel. |
| 26.8 – 29.8 s | Exam Box. Smarter exams, instant results. |

The voice reads three of the four problems from the opening list (the fourth, "First CBT on exam day", is covered by the
"real exam screen" line). The contact details are on screen at the end rather than read out, because the phone numbers
would not fit in the last three seconds.

## Change the words, the voice or the speed

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install kokoro-onnx soundfile numpy
python3 scripts/make_narration.py        # edit the LINES list in that file first; the model downloads on first run (about 120 MB)
python3 scripts/make_audio.py            # mixes voice + music + effects (the music ducks under the voice)
npm run encode                           # out/exambox-advert.mp4 (with voice-over)
npm run encode:novoice                   # out/exambox-advert-no-voice.mp4 (music and effects only)
```

* Try another voice: `VOICE=bf_emma python3 scripts/make_narration.py` (British female), `am_michael` or `bm_george` (male).
* Each line has a start time and must finish before the next one starts. The script speeds a line up (never beyond 1.2x)
  to make it fit and tells you if it cannot, in which case shorten the text.
* Speech takes roughly 0.3 s per word. Spell abbreviations with spaces so they are read as letters ("C B T").
* The video itself does not need re-rendering when only the audio changes: `npm run encode` reuses `out/master.mp4`.
