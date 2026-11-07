#!/usr/bin/env node
/**
 * Reproducible render.
 *   1. builds the soundtrack if missing
 *   2. Remotion renders a near-lossless master
 *   3. scripts/encode.mjs makes the delivery file(s): capped bitrate, keyframes every 2 s, BT.709 tags, fast-start index
 *
 *   npm run render                           # 16:9 film  -> out/exambox-advert.mp4
 *   npm run render:status                    # 9:16 for WhatsApp status -> out/exambox-status-part1.mp4 and -part2.mp4
 *   BROWSER=/path/to/chrome npm run render   # use an existing Chrome/Chromium/headless_shell
 *
 * WhatsApp status clips are limited to 30 s, so the vertical cut is rendered in two parts that split at
 * statusSplit (see src/timing.json), each with its own slice of the soundtrack.
 */
import {existsSync, readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const timing = JSON.parse(readFileSync(resolve(root, 'src/timing.json'), 'utf8'));
const run = (cmd, args, env = {}) => {
  const r = spawnSync(cmd, args, {cwd: root, stdio: 'inherit', env: {...process.env, ...env}});
  if (r.status !== 0) process.exit(r.status ?? 1);
};

const comp = process.env.COMP ?? 'ExamBoxAdvert';
const status = comp === 'ExamBoxStatus';
const fps = timing.fps;
const total = timing.totalFrames;
const split = timing.statusSplit;

if (!existsSync(resolve(root, 'public/audio/soundtrack.wav'))) run('python3', ['scripts/make_audio.py']);

// each job: master file, final file, first and last frame
const jobs = status
  ? [
      {master: 'out/master-status-1.mp4', final: 'out/exambox-status-part1.mp4', from: 0, to: split - 1},
      {master: 'out/master-status-2.mp4', final: 'out/exambox-status-part2.mp4', from: split, to: total - 1},
    ]
  : [{master: 'out/master.mp4', final: 'out/exambox-advert.mp4', from: 0, to: total - 1}];

for (const j of jobs) {
  const args = ['remotion', 'render', 'src/index.ts', comp, j.master, '--concurrency=' + (process.env.CONCURRENCY ?? '4'), `--frames=${j.from}-${j.to}`];
  if (process.env.BROWSER) args.push('--browser-executable=' + process.env.BROWSER);
  run('npx', args);
  run('node', ['scripts/encode.mjs'], {
    MASTER: j.master,
    OUT: j.final,
    DURATION: String((j.to - j.from + 1) / fps),
    AUDIO_START: String(j.from / fps),
    TOTAL: String(total / fps),
  });
  console.log('Wrote ' + j.final);
}
console.log('Masters are kept in out/ (git-ignored); `npm run encode` re-encodes the 16:9 master without re-rendering.');
