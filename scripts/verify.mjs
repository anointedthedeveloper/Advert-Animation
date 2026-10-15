#!/usr/bin/env node
/** Checks the rendered MP4 against the brief using ffprobe: 900 frames, 30 fps, 30 s, 1920x1080, H.264 + AAC. */
import {spawnSync} from 'node:child_process';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = process.argv[2] ?? resolve(root, 'out/exambox-advert.mp4');
const probe = (args) => spawnSync('ffprobe', ['-v', 'error', ...args, file], {encoding: 'utf8'}).stdout.trim();

const v = Object.fromEntries(
  probe(['-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,nb_read_frames,duration,pix_fmt', '-of', 'default=nw=1'])
    .split('\n')
    .map((l) => l.split('=')),
);
const a = Object.fromEntries(
  probe(['-select_streams', 'a:0', '-show_entries', 'stream=codec_name,sample_rate,channels,duration', '-of', 'default=nw=1'])
    .split('\n')
    .map((l) => l.split('=')),
);
const checks = [
  ['video codec h264', v.codec_name === 'h264'],
  ['1920 x 1080', v.width === '1920' && v.height === '1080'],
  ['30 fps', v.r_frame_rate === '30/1'],
  ['900 frames', v.nb_read_frames === '900'],
  ['video duration 30.0 s', Math.abs(parseFloat(v.duration) - 30) < 0.01],
  ['pixel format yuv420p', v.pix_fmt === 'yuv420p'],
  ['audio codec aac', a.codec_name === 'aac'],
  ['audio duration ~30 s', Math.abs(parseFloat(a.duration) - 30) < 0.1],
];
console.log(JSON.stringify({video: v, audio: a}, null, 2));
let ok = true;
for (const [name, pass] of checks) {
  console.log((pass ? 'PASS  ' : 'FAIL  ') + name);
  ok &&= pass;
}
process.exit(ok ? 0 : 1);
