#!/usr/bin/env node
/**
 * Compact, shareable versions: two-pass H.264 aimed at a file size (default 14.2 MB, so every file stays under 15 MB),
 * with a mild temporal denoise (the film-grain overlay is expensive to compress and invisible at this size).
 *   node scripts/ph_compact.mjs                 # landscape, portrait, tiktok -> out/web/*.mp4
 *   TARGET_MB=18 node scripts/ph_compact.mjs
 * Needs the masters from scripts/ph_render.mjs (out/master-ph-*.mp4) and the soundtrack.
 */
import {spawnSync} from 'node:child_process';
import {mkdirSync, readFileSync, rmSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dur = JSON.parse(readFileSync(resolve(root, 'src/ph/cues.json'), 'utf8')).duration;
const target = parseFloat(process.env.TARGET_MB ?? '14.2') * 1024 * 1024 * 8; // bits
const audioBps = 96000;
const vBps = Math.floor((target / dur - audioBps) * 0.985);
mkdirSync(resolve(root, 'out/web'), {recursive: true});
const list = [
  ['landscape', 'out/master-ph-landscape.mp4'],
  ['portrait', 'out/master-ph-portrait.mp4'],
  ['tiktok', 'out/master-ph-tiktok.mp4'],
];
const only = process.env.ONLY;
for (const [name, master] of list) {
  if (only && only !== name) continue;
  const out = `out/web/peter-harvard-${name}.mp4`;
  const vopts = ['-vf', 'hqdn3d=1.4:1.4:5:5', '-c:v', 'libx264', '-preset', 'slower', '-b:v', String(vBps),
    '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-g', '60', '-sc_threshold', '0', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-passlogfile', `out/web/${name}-pass`];
  let r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', master, ...vopts, '-pass', '1', '-an', '-f', 'null', '/dev/null'], {cwd: root, stdio: 'inherit'});
  if (r.status) process.exit(r.status);
  r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', master, '-i', 'public/ph/audio/soundtrack.wav', '-map', '0:v:0', '-map', '1:a:0', ...vopts, '-pass', '2',
    '-af', 'loudnorm=I=-14:TP=-2:LRA=9,alimiter=limit=0.8:level=disabled,aresample=48000', '-c:a', 'aac', '-b:a', '96k', '-ar', '48000', '-ac', '2',
    '-t', String(dur), '-movflags', '+faststart', out], {cwd: root, stdio: 'inherit'});
  if (r.status) process.exit(r.status);
  for (const s of ['-pass-0.log', '-pass-0.log.mbtree']) rmSync(resolve(root, `out/web/${name}${s}`), {force: true});
  console.log('Wrote ' + out);
}
