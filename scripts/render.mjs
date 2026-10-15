#!/usr/bin/env node
/**
 * Reproducible render.
 *   1. builds the soundtrack if missing
 *   2. Remotion renders a near-lossless master (out/master.mp4, 900 frames, 1920x1080, 30 fps)
 *   3. scripts/encode.mjs makes the final delivery file out/exambox-advert.mp4 (capped bitrate, keyframes every 2 s,
 *      BT.709 tags, fast-start index)
 *
 *   npm run render                           # Remotion's own browser (downloaded on first use)
 *   BROWSER=/path/to/chrome npm run render   # use an existing Chrome/Chromium/headless_shell
 */
import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, {cwd: root, stdio: 'inherit'});
  if (r.status !== 0) process.exit(r.status ?? 1);
};
const master = 'out/master.mp4';
const final = 'out/exambox-advert.mp4';

if (!existsSync(resolve(root, 'public/audio/soundtrack.wav'))) run('python3', ['scripts/make_audio.py']);

const args = ['remotion', 'render', 'src/index.ts', 'ExamBoxAdvert', master, '--concurrency=' + (process.env.CONCURRENCY ?? '4')];
if (process.env.BROWSER) args.push('--browser-executable=' + process.env.BROWSER);
run('npx', args);

run('node', ['scripts/encode.mjs']);
console.log('Master kept at ' + master + ' (git-ignored); re-run `npm run encode` to re-encode without re-rendering.');
