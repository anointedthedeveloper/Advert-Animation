#!/usr/bin/env node
/**
 * WhatsApp status cut. WhatsApp limits a status clip to 30 s and 16 MB, so the 65 s portrait film is cut into three parts at
 * scene boundaries (0 - 28.5 s, 28.5 - 55.3 s, 55.3 - 65 s), each with a short audio fade at the joins.
 *   node scripts/ph_export.mjs      (needs out/master-ph-portrait.mp4 from VARIANT=portrait node scripts/ph_render.mjs)
 */
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const total = JSON.parse(readFileSync(resolve(root, 'src/ph/cues.json'), 'utf8')).duration;
const cuts = [0, 28.5, 55.3, total];
for (let i = 0; i < 3; i++) {
  const a = cuts[i], b = cuts[i + 1], d = b - a;
  const af = ['loudnorm=I=-14:TP=-2:LRA=9', 'alimiter=limit=0.8:level=disabled', 'aresample=48000'];
  if (i > 0) af.push('afade=t=in:st=0:d=0.25');
  if (i < 2) af.push(`afade=t=out:st=${(d - 0.3).toFixed(2)}:d=0.3`);
  const out = `out/peter-harvard-whatsapp-status-part${i + 1}.mp4`;
  const r = spawnSync('ffmpeg', [
    '-y', '-v', 'error', '-i', 'out/master-ph-portrait.mp4', '-ss', String(a), '-t', String(d),
    '-i', 'public/ph/audio/soundtrack.wav', '-ss', String(a), '-t', String(d),
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-maxrate', '3800k', '-bufsize', '7M',
    '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-g', '60', '-sc_threshold', '0',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-af', af.join(','), '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', out,
  ], {cwd: root, stdio: 'inherit'});
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log(`Wrote ${out} (${d.toFixed(1)} s)`);
}
