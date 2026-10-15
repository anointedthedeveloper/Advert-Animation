#!/usr/bin/env node
/**
 * Reproducible render: builds the soundtrack (if missing), then renders the 900-frame composition to
 * out/exambox-advert.mp4 (H.264 + AAC, 1920x1080, 30 fps).
 *
 *   npm run render                      # uses Remotion's own browser, downloaded on first use
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

if (!existsSync(resolve(root, 'public/audio/soundtrack.wav'))) run('python3', ['scripts/make_audio.py']);

const args = ['remotion', 'render', 'src/index.ts', 'ExamBoxAdvert', 'out/exambox-advert.mp4', '--concurrency=' + (process.env.CONCURRENCY ?? '4')];
if (process.env.BROWSER) args.push('--browser-executable=' + process.env.BROWSER);
run('npx', args);
