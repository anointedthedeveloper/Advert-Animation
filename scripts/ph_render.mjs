#!/usr/bin/env node
/**
 * Render the Peter Harvard advert.
 *   VARIANT=portrait node scripts/ph_render.mjs   # 1080x1920 -> out/peter-harvard-portrait-hd.mp4        (Reels, Shorts, Facebook stories)
 *   VARIANT=tiktok   node scripts/ph_render.mjs   # 1080x1920, text kept clear of TikTok's UI -> out/peter-harvard-tiktok-hd.mp4
 *   VARIANT=landscape node scripts/ph_render.mjs  # 1920x1080 -> out/peter-harvard-landscape-hd.mp4      (YouTube, Facebook, website)
 * Then `node scripts/ph_export.mjs` cuts the WhatsApp status parts from the portrait master.
 * BROWSER=/path/to/chrome-headless-shell to use an existing browser. CONCURRENCY (default 4). SKIP_RENDER=1 re-encodes only.
 * Audio: public/ph/audio/soundtrack.wav (python3 scripts/ph_audio.py), loudness-normalised to about -14 LUFS, limited to -2 dBFS.
 */
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cues = JSON.parse(readFileSync(resolve(root, 'src/ph/cues.json'), 'utf8'));
const V = {
  portrait: {id: 'PeterHarvardAdvert', master: 'out/master-ph-portrait.mp4', out: 'out/peter-harvard-portrait-hd.mp4'},
  tiktok: {id: 'PeterHarvardAdvertTikTok', master: 'out/master-ph-tiktok.mp4', out: 'out/peter-harvard-tiktok-hd.mp4'},
  landscape: {id: 'PeterHarvardAdvertWide', master: 'out/master-ph-landscape.mp4', out: 'out/peter-harvard-landscape-hd.mp4'},
}[process.env.VARIANT ?? 'portrait'];
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, {cwd: root, stdio: 'inherit'});
  if (r.status !== 0) process.exit(r.status ?? 1);
};
if (!process.env.SKIP_RENDER) {
  const args = ['remotion', 'render', 'src/index.ts', V.id, V.master, '--concurrency=' + (process.env.CONCURRENCY ?? '4')];
  if (process.env.BROWSER) args.push('--browser-executable=' + process.env.BROWSER);
  run('npx', args);
}
run('ffmpeg', [
  '-y', '-v', 'error', '-i', V.master, '-i', 'public/ph/audio/soundtrack.wav',
  '-map', '0:v:0', '-map', '1:a:0',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', process.env.CRF ?? '17', '-maxrate', '12M', '-bufsize', '24M',
  '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-g', '60', '-sc_threshold', '0',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-af', 'loudnorm=I=-14:TP=-2:LRA=9,alimiter=limit=0.8:level=disabled,aresample=48000',
  '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2',
  '-t', String(cues.duration), '-movflags', '+faststart', V.out,
]);
console.log('Wrote ' + V.out);
