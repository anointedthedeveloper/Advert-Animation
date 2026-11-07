#!/usr/bin/env node
/**
 * Render the Peter Harvard advert.
 *   node scripts/ph_render.mjs            # 9:16  -> out/peter-harvard-advert-vertical.mp4   (TikTok, Reels, WhatsApp status)
 *   WIDE=1 node scripts/ph_render.mjs     # 16:9  -> out/peter-harvard-advert-wide.mp4       (YouTube, Facebook, website)
 * BROWSER=/path/to/chrome-headless-shell to use an existing browser. CONCURRENCY (default 4).
 * Audio: public/ph/audio/soundtrack.wav (python3 scripts/ph_audio.py), loudness-normalised to about -14 LUFS, limited to -2 dBFS.
 */
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cues = JSON.parse(readFileSync(resolve(root, 'src/ph/cues.json'), 'utf8'));
const wide = !!process.env.WIDE;
const id = wide ? 'PeterHarvardAdvertWide' : 'PeterHarvardAdvert';
const master = wide ? 'out/master-ph-wide.mp4' : 'out/master-ph-vertical.mp4';
const final = process.env.OUT ?? (wide ? 'out/peter-harvard-advert-wide.mp4' : 'out/peter-harvard-advert-vertical.mp4');
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, {cwd: root, stdio: 'inherit'});
  if (r.status !== 0) process.exit(r.status ?? 1);
};
if (!process.env.SKIP_RENDER) {
  const args = ['remotion', 'render', 'src/index.ts', id, master, '--concurrency=' + (process.env.CONCURRENCY ?? '4')];
  if (process.env.BROWSER) args.push('--browser-executable=' + process.env.BROWSER);
  run('npx', args);
}
run('ffmpeg', [
  '-y', '-v', 'error', '-i', master, '-i', 'public/ph/audio/soundtrack.wav',
  '-map', '0:v:0', '-map', '1:a:0',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', process.env.CRF ?? '20', '-maxrate', wide ? '7M' : '6M', '-bufsize', '12M',
  '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-g', '60', '-sc_threshold', '0',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-af', 'loudnorm=I=-14:TP=-2:LRA=9,alimiter=limit=0.8:level=disabled,aresample=48000',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
  '-t', String(cues.duration), '-movflags', '+faststart', final,
]);
console.log('Wrote ' + final);
