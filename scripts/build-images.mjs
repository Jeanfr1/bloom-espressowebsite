// Responsive exports for the site. Kit PNGs stay untouched; outputs go to
// public/img (AVIF + WebP per width) and a manifest the HTML plugin reads.
//
//   npm run images
//
// Files under /img are served with an immutable cache header, so a changed
// image needs a new name: bump V below.
import sharp from 'sharp';
import { mkdir, writeFile, copyFile } from 'node:fs/promises';

const V = 1;
const ROOT = new URL('../', import.meta.url).pathname;
const OUT = `${ROOT}public/img/`;
await mkdir(OUT, { recursive: true });

const SOURCES = {
  hero: { src: '03-hero/hero-latte-desktop.png', widths: [800, 1200, 1672] },
  heroM: { src: '03-hero/hero-latte-mobile.png', widths: [640, 941] },
  macro: { src: '03-hero/macro-bean.png', widths: [800, 1200, 1672] },
  bean: { src: '05-camadas/bean-alpha.png', widths: [768, 1152, 1536], alpha: true },
  cup: { src: '05-camadas/cup-alpha.png', widths: [600, 1000, 1416], alpha: true },
  food: { src: '04-secoes/food-morning.png', widths: [700, 1100, 1536] },
  iced: { src: '04-secoes/iced-latte.png', widths: [700, 1100, 1536] },
  facade: { src: '04-secoes/facade-edited.png', widths: [560, 840, 1116] },
  facadeOriginal: { src: 'assets-src/facade-original.png', widths: [400, 816] },
};

const manifest = {};
for (const [key, { src, widths, alpha }] of Object.entries(SOURCES)) {
  const input = sharp(`${ROOT}${src}`);
  const { width: w0, height: h0 } = await input.metadata();
  const name = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  const entry = { width: w0, height: h0, avif: [], webp: [] };
  for (const w of widths) {
    const base = `${name}-${w}-v${V}`;
    const img = sharp(`${ROOT}${src}`).resize({ width: w, withoutEnlargement: true });
    await img.clone().avif({ quality: alpha ? 58 : 52, effort: 6 }).toFile(`${OUT}${base}.avif`);
    await img.clone().webp({ quality: 76, alphaQuality: 90, effort: 6 }).toFile(`${OUT}${base}.webp`);
    entry.avif.push([`/img/${base}.avif`, w]);
    entry.webp.push([`/img/${base}.webp`, w]);
  }
  manifest[key] = entry;
  console.log(`${key}: ${widths.join(', ')}`);
}

// Logo (trimmed master from prepare-sources): PNG for no-WebP clients + WebP.
for (const w of [300, 600]) {
  const img = sharp(`${ROOT}assets-src/logo-bloom.png`).resize({ width: w });
  await img.clone().png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(`${OUT}logo-bloom-${w}-v${V}.png`);
  await img.clone().webp({ quality: 90, alphaQuality: 100 }).toFile(`${OUT}logo-bloom-${w}-v${V}.webp`);
}
const logoMeta = await sharp(`${ROOT}assets-src/logo-bloom.png`).metadata();
manifest.logo = {
  width: logoMeta.width,
  height: logoMeta.height,
  png: [[`/img/logo-bloom-300-v${V}.png`, 300], [`/img/logo-bloom-600-v${V}.png`, 600]],
  webp: [[`/img/logo-bloom-300-v${V}.webp`, 300], [`/img/logo-bloom-600-v${V}.webp`, 600]],
};

// Favicon: the kit's bean-petal symbol. Apple touch icon on an oat plate.
await copyFile(`${ROOT}01-identidade/bean-petal-symbol.svg`, `${ROOT}public/favicon.svg`);
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#F4EBDC' } })
  .composite([{ input: await sharp(`${ROOT}01-identidade/bean-petal-symbol.svg`).resize(132, 132).png().toBuffer(), gravity: 'center' }])
  .png()
  .toFile(`${ROOT}public/apple-touch-icon.png`);

// Open Graph: hero photo cropped to 1200x630 with the logo on an oat plate.
const logoPlate = await sharp({ create: { width: 360, height: 176, channels: 4, background: '#F4EBDC' } })
  .composite([{ input: await sharp(`${ROOT}assets-src/logo-bloom.png`).resize({ width: 300 }).toBuffer(), gravity: 'center' }])
  .png()
  .toBuffer();
await sharp(`${ROOT}03-hero/hero-latte-desktop.png`)
  .resize({ width: 1200, height: 630, fit: 'cover', position: 'right' })
  .composite([{ input: logoPlate, left: 56, top: 56 }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(`${ROOT}public/og.jpg`);

await writeFile(`${ROOT}src/data/images.json`, JSON.stringify(manifest, null, 2) + '\n');
console.log('images ready → public/img, src/data/images.json');
