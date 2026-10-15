# Exam Box advert: narration script (optional)

The advert is fully readable **without** voice-over: every message is on screen. No text-to-speech engine
was available when the video was produced, so the shipped MP4 contains music and sound effects only.
This script is provided for a human voice artist (or a TTS tool). Read it at a calm, confident pace.
Total spoken time is about 30 seconds, so read it briskly or trim the problems list, leaving room for the sound effects.

| Time | Beat | On-screen text | Voice-over |
|---|---|---|---|
| 0.0 – 4.8 s | Problems | Sound familiar? / Marking takes days. / Report cards and broadsheets compiled by hand. / Candidates face CBT for the first time on exam day. / Cyber cafés cost money and are hard to supervise. | "Sound familiar? Marking takes days. Report cards and broadsheets, compiled by hand. Candidates facing CBT for the first time on exam day. Cyber cafés that cost money and are hard to supervise." |
| 4.8 – 7.6 s | Who we are | Meet Exam Box. The offline computer-based testing system for schools and exam centres. | "Meet Exam Box, the offline computer-based testing system for schools and exam centres." |
| 7.6 – 10.2 s | Strength | Ready on day one. Past questions 1998 to date. JAMB, WAEC, images included, your own school questions | "Ready on day one: past questions from 1998 to date, JAMB and WAEC, with images, plus your own school questions." |
| 10.2 – 13.1 s | Fix | Run exams on your own network | "No cyber café fees. Run exams on your own network, with no internet needed once the licence is active." |
| 13.1 – 15.9 s | Fix | Everyone starts together | "Practise the real CBT screen, and everyone starts together." |
| 15.9 – 18.8 s | Fix | Watch every candidate live | "Watch every candidate, live." |
| 18.8 – 21.7 s | Fix | Instant marking. Scores out of 100. | "Instant marking. Scores out of one hundred." |
| 21.7 – 26.7 s | Fix | Branded report cards for the whole class / Export to Excel | "Branded report cards for the whole class, and a broadsheet ready to export to Excel." |
| 26.7 – 30.0 s | Call to action | Exam Box. Smarter exams, instant results. / Get Exam Box for your school. / aremutecheazysolutions.com / 0901 647 1351 · 0902 907 4772 | "Exam Box. Smarter exams, instant results. Get Exam Box for your school. Visit aremutecheazysolutions.com, or call zero nine zero one, six four seven, one three five one, or zero nine zero two, nine zero seven, four seven seven two." |

To add a voice-over, record or generate a file named `public/audio/narration.wav` (48 kHz, 30 s) and add a second
`<Audio src={staticFile('audio/narration.wav')} />` next to the existing one in `src/Advert.tsx`, then re-render.
