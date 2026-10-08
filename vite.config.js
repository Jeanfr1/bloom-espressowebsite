import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { site, drinks, menu } from './src/data/site.js';
import { drinkSvg } from './src/data/diagrams.js';

const images = JSON.parse(readFileSync(new URL('./src/data/images.json', import.meta.url), 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// <x-pic img="hero" sizes="100vw" alt="…" class="…" loading="lazy"
//        m="heroM" mmedia="(max-aspect-ratio: 1/1)"></x-pic>
// → <picture> with AVIF/WebP srcsets (art-directed when m/mmedia are given).
function picture(attrs) {
  const a = Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  const main = images[a.img];
  if (!main) throw new Error(`x-pic: unknown image "${a.img}"`);
  const set = (list) => list.map(([src, w]) => `${src} ${w}w`).join(', ');
  const sizes = a.sizes || '100vw';
  const sources = [];
  if (a.m) {
    const alt = images[a.m];
    sources.push(`<source type="image/avif" media="${a.mmedia}" srcset="${set(alt.avif)}" sizes="${a.msizes || sizes}">`);
    sources.push(`<source type="image/webp" media="${a.mmedia}" srcset="${set(alt.webp)}" sizes="${a.msizes || sizes}">`);
  }
  // only="(media)": the image exists in one breakpoint, so other viewports
  // get a 1×1 placeholder instead of downloading it (hidden images still load).
  const only = a.only ? ` media="${a.only}"` : '';
  sources.push(`<source type="image/avif"${only} srcset="${set(main.avif)}" sizes="${sizes}">`);
  sources.push(`<source type="image/webp"${only} srcset="${set(main.webp)}" sizes="${sizes}">`);
  const fallback = a.only ? 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' : main.webp[Math.min(1, main.webp.length - 1)][0];
  const imgAttrs = [
    `src="${fallback}"`,
    `alt="${a.alt ?? ''}"`,
    `width="${main.width}"`,
    `height="${main.height}"`,
    a.class && `class="${a.class}"`,
    `loading="${a.loading || 'lazy'}"`,
    `decoding="${a.decoding || 'async'}"`,
    a.fetchpriority && `fetchpriority="${a.fetchpriority}"`,
    a.draggable && `draggable="${a.draggable}"`,
  ].filter(Boolean);
  return `<picture${a.pclass ? ` class="${a.pclass}"` : ''}>${sources.join('')}<img ${imgAttrs.join(' ')}></picture>`;
}

const drinkButtons = () =>
  drinks
    .map(
      (d) => `<li class="drink-cell"><button class="drink" type="button" aria-pressed="false" data-drink="${d.id}" aria-describedby="drinks-note">` +
        `<span class="drink__art" data-slot="${d.id}">${drinkSvg(d.id)}</span>` +
        `<span class="drink__name">${esc(d.name)}</span>` +
        `<span class="drink__layers">${d.layers.map(esc).join(' · ')}</span></button></li>`,
    )
    .join('');

// Retail band backdrop: honey-wood beans with a centre split, after the
// carved-bean ceiling in the kit's interior references (materials only).
function beanField() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const beans = [];
  const cols = 11, rows = 7;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5 + (r % 2) * 0.5 + (rnd() - 0.5) * 0.5) * (1600 / cols);
      const y = (r + 0.5 + (rnd() - 0.5) * 0.45) * (1000 / rows);
      const s = 0.85 + rnd() * 0.75;
      const a = Math.round(rnd() * 180);
      const tone = rnd() < 0.5 ? 'a' : 'b';
      beans.push(`<use href="#bf-bean-${tone}" transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${a}) scale(${s.toFixed(2)})"/>`);
    }
  }
  const bean = (id, c1, c2, c3) =>
    `<linearGradient id="bf-wood-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient>` +
    `<g id="bf-bean-${id}"><path d="M-62 -2C-60 -30 -30 -42 0 -42S60 -30 62 -2L0 -2Z" fill="url(#bf-wood-${id})"/><path d="M-62 4C-60 32 -30 42 0 42S60 32 62 4L0 4Z" fill="url(#bf-wood-${id})" opacity=".92"/>` +
    `<path d="M-44 -16C-20 -24 20 -24 44 -16M-40 20C-14 27 14 27 40 20" stroke="#5A3418" stroke-opacity=".22" stroke-width="2" fill="none"/></g>`;
  return (
    `<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>` +
    bean('a', '#E3A866', '#C0803F', '#8A5126') +
    bean('b', '#D59656', '#A96A33', '#764320') +
    `<radialGradient id="bf-vignette" cx=".5" cy=".5" r=".62"><stop offset=".25" stop-color="#2B1813" stop-opacity=".25"/><stop offset="1" stop-color="#2B1813" stop-opacity=".92"/></radialGradient>` +
    `</defs><g opacity=".9">${beans.join('')}</g><rect width="1600" height="1000" fill="url(#bf-vignette)"/></svg>`
  );
}

const list = (items, cls = '') => items.map((i) => `<li${cls ? ` class="${cls}"` : ''}>${esc(i)}</li>`).join('');

const hoursRows = () =>
  site.hours.map((h) => `<div class="hours__row"><dt>${esc(h.days)}</dt><dd>${esc(h.open)} – ${esc(h.close)}</dd></div>`).join('');

const jsonLd = () =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: site.name,
    url: site.website,
    email: site.email,
    image: '/og.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postcode,
      addressCountry: 'AU',
    },
    openingHoursSpecification: site.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.schema, opens: h.opens, closes: h.closes })),
  });

const TOKENS = {
  name: site.name,
  email: site.email,
  website: site.website,
  menuHref: site.menuHref,
  directionsHref: site.directionsHref,
  addressFull: site.address.full,
  addressShort: `${site.address.street}, ${site.address.locality}`,
  supplier: site.supplier,
};

function siteData() {
  return {
    name: 'bloom-site-data',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace(/<x-pic\s([^>]*)><\/x-pic>/g, (_, attrs) => picture(attrs))
          .replace('<!--@drinks-->', drinkButtons())
          .replace('<!--@beans-->', beanField())
          .replace('<!--@categories-->', list(menu.categories))
          .replace('<!--@featured-->', list(menu.featured))
          .replace('<!--@food-->', list(menu.food))
          .replace(/<!--@hours-->/g, hoursRows())
          .replace('<!--@jsonld-->', `<script type="application/ld+json">${jsonLd()}</script>`)
          .replace(/\{\{(\w+)\}\}/g, (m, k) => (k in TOKENS ? esc(TOKENS[k]) : m));
      },
    },
  };
}

export default defineConfig({
  plugins: [siteData()],
  build: { target: 'es2020', assetsInlineLimit: 0 },
});
