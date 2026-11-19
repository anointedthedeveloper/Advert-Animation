# Exam Box advert: voice-over

The video now has a spoken voice-over that introduces each stage, synthesised locally with the open-source Kokoro
text-to-speech model (voice `af_heart`, a warm US female voice). Every message is also on screen, so the advert
works with the sound off, and a music-only version is provided.

| Time | Spoken line |
|---|---|
| 0.9 – 2.4 s | Exams need the internet. |
| 3.0 – 4.2 s | Marking takes days. |
| 4.3 – 5.5 s | Reports, by hand. |
| 6.0 – 7.4 s | Cyber cafés cost money. |
| 7.5 – 9.3 s | Exam Box fixes every one. |
| 10.6 – 13.3 s | Meet Exam Box, the offline exam system. |
| 13.5 – 15.0 s | One box fixes all four. |
| 15.2 – 17.2 s | Past questions from nineteen ninety eight. |
| 17.4 – 21.0 s | Build your own exams too: promotion, entrance, even office tests. |
| 21.1 – 24.9 s | Run exams on your own school network. Fully offline, no data bills. |
| 25.1 – 28.4 s | Everyone starts together, with a real timer and calculator. |
| 28.6 – 32.1 s | Watch every candidate live, with progress, connection and battery. |
| 32.2 – 35.2 s | Marked the moment they submit. Scores out of one hundred. |
| 36.0 – 40.0 s | Branded report cards for the whole class, and a broadsheet ready for Excel. |
| 40.9 – 44.7 s | Exam Box. Smarter exams, instant results. Get it today. |

The opening names four problems, each with a plain explanation on screen, then the cards flip into their fixes while the
voice says "Exam Box fixes every one". Being fully offline is the main selling point, so it is the first problem and it
gets the longest scene ("Fully offline. No data bills."). The contact details are on screen at the end rather than read
out. The contact details are on screen at the end rather than read out, because the phone numbers
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
