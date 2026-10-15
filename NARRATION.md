# Exam Box advert: narration script (optional)

The advert is fully readable **without** voice-over: every message is on screen. No text-to-speech engine
was available when the video was produced, so the shipped MP4 contains music and sound effects only.
This script is provided for a human voice artist (or a TTS tool). Read it at a calm, confident pace.
Total spoken time is about 25 seconds, leaving room for the sound effects.

| Time | Scene | On-screen text | Voice-over |
|---|---|---|---|
| 0:00 – 0:03 | The hook | Marking exams takes days. | "Marking exams takes days." |
| 0:03 – 0:06 | Product reveal | Meet Exam Box. | "Meet Exam Box." |
| 0:06 – 0:09 | Question bank | Past questions 1998 to date. JAMB, WAEC, images, your own school questions | "Past questions from 1998 to date, JAMB and WAEC, with images, plus your own school questions." |
| 0:09 – 0:12 | Your own network | Run exams on your own network | "Run exams on your own network, with no internet needed once the licence is active." |
| 0:12 – 0:15 | Everyone starts together | Everyone starts together | "Everyone starts together." |
| 0:15 – 0:19 | Live monitoring | Watch every candidate live | "Watch every candidate, live." |
| 0:19 – 0:22 | Instant marking | Instant marking. Scores out of 100. | "Instant marking. Scores out of one hundred." |
| 0:22 – 0:27 | Reports and exports | Branded report cards for the whole class / Export to Excel | "Branded report cards for the whole class, and a broadsheet ready to export to Excel." |
| 0:27 – 0:30 | Final brand reveal | Exam Box. Smarter exams, instant results. / Get Exam Box for your school. / aremutecheazysolutions.com / 0901 647 1351 · 0902 907 4772 | "Exam Box. Smarter exams, instant results. Get Exam Box for your school. Visit aremutecheazysolutions.com, or call zero nine zero one, six four seven, one three five one, or zero nine zero two, nine zero seven, four seven seven two." |

To add a voice-over, record or generate a file named `public/audio/narration.wav` (48 kHz, 30 s) and add a second
`<Audio src={staticFile('audio/narration.wav')} />` next to the existing one in `src/Advert.tsx`, then re-render.
