// One-off source preparation. Writes masters into assets-src/ (committed),
// so the image build never depends on 00-referencias/, which stays local.
//
//   node scripts/prepare-sources.mjs
//
// - logo-bloom.png: kit logo trimmed to its alpha bounds (+ a small margin).
// - facade-original.png: the unedited shopfront photo, cropped out of the
//   supplied Facebook screenshot (photo columns 256-1071, below the UI scrim).
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

// Facade original: the screenshot's top 84 px carry the app's gradient scrim
// and name overlay; the photo spans x 256-1071.
await sharp(`${KIT}00-referencias/Screenshot 2026-10-08 at 11.33.13.png`)
  .extract({ left: 256, top: 84, width: 816, height: 902 })
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}facade-original.png`);

console.log('assets-src ready');
