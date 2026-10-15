#!/usr/bin/env node
/**
 * Exports both flyers with headless Chrome/Chromium (needs Python with Pillow for the image trim):
 *
 *   Landscape (simple)   flyer/landscape.html -> out/exambox-flyer-landscape.{pdf,png,jpg}
 *   Portrait (detailed)  flyer/index.html     -> out/exambox-flyer.{pdf,png,jpg}
 *
 *   .pdf  print-ready A4, vector text
 *   .png  A4 at 300 dpi (3508 x 2480 landscape, 2480 x 3508 portrait) for print shops
 *   .jpg  half-size copy, small file for WhatsApp and social sharing
 *
 *   BROWSER=/path/to/chrome node scripts/flyer.mjs       (or: npm run flyer)
 */
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {dirname, resolve} from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browser =
  process.env.BROWSER ||
  ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
if (!browser) {
  console.error('No Chrome/Chromium found. Set BROWSER=/path/to/chrome');
  process.exit(1);
}
mkdirSync(resolve(root, 'out'), {recursive: true});

const variants = [
  {html: 'flyer/landscape.html', out: 'out/exambox-flyer-landscape', w: 1123, h: 794, pw: 3508, ph: 2480},
  {html: 'flyer/index.html', out: 'out/exambox-flyer', w: 794, h: 1123, pw: 2480, ph: 3508},
];
const common = ['--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files'];

for (const v of variants) {
  const url = pathToFileURL(resolve(root, v.html)).href;
  const run = (args) => {
    const r = spawnSync(browser, [...common, ...args, url], {cwd: root, stdio: ['ignore', 'ignore', 'ignore']});
    if (r.status !== 0) process.exit(r.status ?? 1);
  };
  run(['--no-pdf-header-footer', '--print-to-pdf=' + resolve(root, v.out + '.pdf')]);
  const scale = v.pw / v.w;
  run([`--force-device-scale-factor=${scale}`, `--window-size=${v.w},${v.h}`, '--screenshot=' + resolve(root, v.out + '-raw.png')]);
  const py = `
from PIL import Image
import os
im = Image.open('${v.out}-raw.png').convert('RGB')
im = im.crop((0, 0, min(im.width, ${v.pw + 2}), min(im.height, ${v.ph + 2}))).resize((${v.pw}, ${v.ph}), Image.LANCZOS)
im.save('${v.out}.png', optimize=True, dpi=(300, 300))
im.resize((${v.pw / 2}, ${v.ph / 2}), Image.LANCZOS).save('${v.out}.jpg', quality=90, optimize=True, dpi=(150, 150))
os.remove('${v.out}-raw.png')
`;
  const r = spawnSync('python3', ['-c', py], {cwd: root, stdio: 'inherit'});
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log('Wrote ' + v.out + '.pdf / .png / .jpg');
}
