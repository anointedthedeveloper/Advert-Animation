#!/usr/bin/env node
/**
 * Checks the rendered MP4 against the brief: 900 frames, 30 fps, 30 s, 1920x1080, H.264 + AAC, a faststart index,
 * an AUDIBLE soundtrack (loudness measured, not just "an audio stream exists") and a small file size.
 */
import {spawnSync} from 'node:child_process';
import {statSync, readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = process.argv[2] ?? resolve(root, 'out/exambox-advert.mp4');
// the WhatsApp status parts (exambox-status-part1/2.mp4) are vertical 1080x1920 and must stay under WhatsApp's limits (30 s, 16 MB)
const status = /status/.test(file);
const timing = JSON.parse(readFileSync(resolve(root, 'src/timing.json'), 'utf8'));
const part = /part2/.test(file) ? 2 : 1;
const statusFrames = part === 1 ? timing.statusSplit : timing.totalFrames - timing.statusSplit;
const want = status
  ? {w: '1080', h: '1920', frames: String(statusFrames), secs: statusFrames / timing.fps, mb: 16} // WhatsApp status: 16 MB, 30 s
  : {w: '1920', h: '1080', frames: String(timing.totalFrames), secs: timing.totalFrames / timing.fps, mb: 15};

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
const vol = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-map', '0:a:0', '-af', 'volumedetect', '-f', 'null', '-'], {encoding: 'utf8'}).stderr;
const mean = parseFloat((vol.match(/mean_volume:\s*(-?[\d.]+) dB/) ?? [])[1]);
const peak = parseFloat((vol.match(/max_volume:\s*(-?[\d.]+) dB/) ?? [])[1]);
const head = spawnSync('ffprobe', ['-v', 'trace', file], {encoding: 'utf8'}).stderr;
const moov = head.indexOf("type:'moov'");
const mdat = head.indexOf("type:'mdat'");
const sizeMB = statSync(file).size / 1e6;
const checks = [
  ['video codec h264', v.codec_name === 'h264'],
  [`${want.w} x ${want.h}`, v.width === want.w && v.height === want.h],
  ['30 fps', v.r_frame_rate === '30/1'],
  [`${want.frames} frames`, v.nb_read_frames === want.frames],
  [`video duration ${want.secs} s`, Math.abs(parseFloat(v.duration) - want.secs) < 0.01],
  ['pixel format yuv420p', v.pix_fmt === 'yuv420p'],
  ['audio codec aac', a.codec_name === 'aac'],
  ['audio duration ~' + want.secs + ' s', Math.abs(parseFloat(a.duration) - want.secs) < 0.1],
  ['audio is audible (mean volume ' + mean + ' dB, peak ' + peak + ' dB)', mean > -30 && peak > -12 && peak <= 0],
  ['index at the front (faststart)', moov > -1 && moov < mdat],
  ['file size ' + sizeMB.toFixed(1) + ' MB (limit ' + want.mb + ' MB)', sizeMB <= want.mb],
];
console.log(JSON.stringify({video: v, audio: a}, null, 2));
let ok = true;
for (const [name, pass] of checks) {
  console.log((pass ? 'PASS  ' : 'FAIL  ') + name);
  ok &&= pass;
}
process.exit(ok ? 0 : 1);
