#!/usr/bin/env node
/**
 * Render stills of the Peter Harvard advert at given times (seconds), for design review.
 *   node scripts/ph_stills.mjs PeterHarvardAdvert out/stills 0.2,3,6.5,9
 * BROWSER=/path/to/chrome-headless-shell to use an existing browser.
 */
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [id = 'PeterHarvardAdvert', outDir = 'out/stills', list = '0'] = process.argv.slice(2);
mkdirSync(resolve(root, outDir), {recursive: true});
const serveUrl = await bundle({entryPoint: resolve(root, 'src/index.ts'), publicDir: resolve(root, 'public')});
const browserExecutable = process.env.BROWSER || undefined;
const comp = await selectComposition({serveUrl, id, browserExecutable});
for (const s of list.split(',').map(Number)) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(s * comp.fps));
  const output = resolve(root, outDir, `${id}-${String(s).replace('.', '_')}s.png`);
  await renderStill({composition: comp, serveUrl, output, frame, browserExecutable, imageFormat: 'png'});
  console.log('wrote', output);
}
