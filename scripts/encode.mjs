#!/usr/bin/env node
/**
 * Final delivery encode from the near-lossless master (out/master.mp4) -> out/exambox-advert.mp4
 *   H.264 High, CRF 15 with an 8 Mbit/s cap and a half-second buffer (no bitrate spikes, so no playback stutter),
 *   a keyframe every 2 s (smooth seeking), BT.709 colour tags, AAC audio copied untouched,
 *   MP4 index moved to the front (instant start when streamed or embedded in a web page).
 */
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const r = spawnSync(
  'ffmpeg',
  [
    '-y', '-v', 'error', '-i', 'out/master.mp4',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-maxrate', '8M', '-bufsize', '4M',
    '-profile:v', 'high', '-level', '4.2', '-pix_fmt', 'yuv420p',
    '-g', '60', '-keyint_min', '30', '-sc_threshold', '0',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-c:a', 'copy',
    '-movflags', '+faststart',
    'out/exambox-advert.mp4',
  ],
  {cwd: root, stdio: 'inherit'},
);
if (r.status !== 0) process.exit(r.status ?? 1);
console.log('Wrote out/exambox-advert.mp4');
