// One-off source preparation. Writes masters into assets-src/ (committed).
//
//   node scripts/prepare-sources.mjs
//
// - logo-bloom.png: kit logo trimmed to its alpha bounds (+ a small margin).
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const KIT = new URL('../', import.meta.url).pathname;
const OUT = new URL('../assets-src/', import.meta.url).pathname;
await mkdir(OUT, { recursive: true });

// Logo: opaque bounds measured at x 309-1478, y 229-714 (alpha > 8).
await sharp(`${KIT}01-identidade/logo-bloom-alpha.png`)
  .extract({ left: 297, top: 217, width: 1194, height: 510 })
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}logo-bloom.png`);

console.log('assets-src ready');
