#!/usr/bin/env node
/**
 * Final delivery encode from the near-lossless master (out/master.mp4) -> out/exambox-advert.mp4
 *
 *   Video  H.264 High, constant-quality (CRF) with a bitrate cap and a small buffer, so there are no bitrate
 *          spikes (smooth playback on any player or connection). A keyframe every 2 s for smooth seeking,
 *          BT.709 colour tags, and the MP4 index moved to the front (instant start on the web).
 *   Audio  taken straight from public/audio/soundtrack.wav and encoded once to AAC-LC stereo, 48 kHz
 *          (so the soundtrack is guaranteed to be in the file; scripts/verify.mjs checks it is audible).
 *
 * Tuning (environment variables): CRF (default 21), MAXRATE (default 4M), BUFSIZE (default 2M), ABITRATE (default 160k).
 * Lower CRF = sharper and larger. Typical result for this advert: about 6-7 MB.
 */
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = process.env;
const out = env.OUT ?? 'out/exambox-advert.mp4';
const r = spawnSync(
  'ffmpeg',
  [
    '-y', '-v', 'error',
    '-i', 'out/master.mp4',
    '-i', 'public/audio/soundtrack.wav',
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'libx264', '-preset', env.PRESET ?? 'veryslow', '-crf', env.CRF ?? '21',
    '-maxrate', env.MAXRATE ?? '4M', '-bufsize', env.BUFSIZE ?? '2M',
    '-profile:v', 'high', '-level', '4.2', '-pix_fmt', 'yuv420p',
    '-g', '60', '-keyint_min', '30', '-sc_threshold', '0',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-c:a', 'aac', '-b:a', env.ABITRATE ?? '160k', '-ar', '48000', '-ac', '2',
    '-t', '30',
    '-movflags', '+faststart',
    out,
  ],
  {cwd: root, stdio: 'inherit'},
);
if (r.status !== 0) process.exit(r.status ?? 1);
console.log('Wrote ' + out);
