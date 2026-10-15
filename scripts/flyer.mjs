#!/usr/bin/env node
/**
 * Exports the A4 flyer (flyer/index.html) with headless Chrome/Chromium:
 *   out/exambox-flyer.pdf   print-ready, vector text, A4 (210 x 297 mm)
 *   out/exambox-flyer.png   2480 x 3508 px (A4 at 300 dpi) for print shops
 *   out/exambox-flyer.jpg   1240 x 1754 px, small file for WhatsApp and social sharing
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
const url = pathToFileURL(resolve(root, 'flyer/index.html')).href;
const common = ['--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files'];
const run = (args) => {
  const r = spawnSync(browser, [...common, ...args, url], {cwd: root, stdio: 'inherit'});
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run(['--no-pdf-header-footer', '--print-to-pdf=' + resolve(root, 'out/exambox-flyer.pdf')]);
run(['--force-device-scale-factor=3.125', '--window-size=794,1123', '--screenshot=' + resolve(root, 'out/exambox-flyer-raw.png')]);

// Trim the raw screenshot to exactly A4 at 300 dpi and make the small sharing copy (needs Python with Pillow).
const py = `
from PIL import Image
im = Image.open('out/exambox-flyer-raw.png').convert('RGB')
im = im.crop((0, 0, 2481, 3509)).resize((2480, 3508), Image.LANCZOS)
im.save('out/exambox-flyer.png', optimize=True, dpi=(300, 300))
im.resize((1240, 1754), Image.LANCZOS).save('out/exambox-flyer.jpg', quality=90, optimize=True, dpi=(150, 150))
import os; os.remove('out/exambox-flyer-raw.png')
`;
const r = spawnSync('python3', ['-c', py], {cwd: root, stdio: 'inherit'});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log('Wrote out/exambox-flyer.pdf, out/exambox-flyer.png, out/exambox-flyer.jpg');
