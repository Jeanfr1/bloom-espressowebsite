// Drink diagrams, drawn after the kit's menu vectors (05-camadas/menu-*.svg)
// and the approved desktop mockup: caramel outline, liquid layers as separate
// groups so they can lift apart (8–18 px) on focus, hover or selection.
// Schematic only: band heights are not Bloom's proportions.

const C = { espresso: '#6D3620', crema: '#A4652F', milk: '#EAD6B6', foam: '#F7EFE2', ice: '#B8D5E5', line: '#C78345' };

// Each vessel: interior path (clips the liquid), outline, optional extras.
const VESSELS = {
  espresso: {
    interior: 'M62 104H138L132 170Q100 184 68 170Z',
    outline: 'M62 104H138L132 170Q100 184 68 170Z',
    handle: 'M136 116C166 112 166 156 131 152',
    saucer: 'M42 190H158',
    layers: [
      // bottom → top
      [{ y: 120, h: 70, fill: C.espresso }, { y: 112, h: 9, fill: C.crema }],
    ],
  },
  'flat-white': {
    interior: 'M34 96H166Q163 152 134 170Q100 184 66 170Q37 152 34 96Z',
    outline: 'M34 96H166Q163 152 134 170Q100 184 66 170Q37 152 34 96Z',
    handle: 'M163 110C192 108 190 152 152 156',
    saucer: 'M28 190H172',
    layers: [
      [{ y: 140, h: 50, fill: C.espresso }],
      [{ y: 106, h: 34, fill: C.milk }],
    ],
  },
  latte: {
    interior: 'M58 40H142L136 184Q100 196 64 184Z',
    outline: 'M58 40H142L136 184Q100 196 64 184Z',
    handle: 'M140 64C178 60 178 140 137 136',
    saucer: null,
    layers: [
      [{ y: 148, h: 52, fill: C.espresso }],
      [{ y: 84, h: 64, fill: C.milk }],
      [{ y: 54, h: 30, fill: C.foam }],
    ],
  },
  'iced-latte': {
    interior: 'M56 38H144L136 186Q100 198 64 186Z',
    outline: 'M56 38H144L136 186Q100 198 64 186Z',
    handle: null,
    saucer: null,
    straw: 'M124 8L108 150',
    layers: [
      [{ y: 150, h: 50, fill: C.espresso }],
      [{ y: 72, h: 78, fill: C.milk }],
      'ice',
    ],
  },
};

const ICE = `<rect x="70" y="50" width="30" height="30" rx="6" transform="rotate(12 85 65)"/><rect x="104" y="58" width="30" height="28" rx="6" transform="rotate(-10 119 72)"/><rect x="84" y="84" width="26" height="26" rx="6" transform="rotate(6 97 97)"/>`;

export function drinkSvg(id, uid = '') {
  const v = VESSELS[id];
  const clip = `clip-${id}${uid}`;
  const groups = v.layers
    .map((layer, i) => {
      const body =
        layer === 'ice'
          ? `<g fill="${C.ice}" fill-opacity=".7" stroke="${C.line}" stroke-opacity=".35" stroke-width="1.5">${ICE}</g>`
          : `<g clip-path="url(#${clip})">${layer.map((b) => `<rect x="20" y="${b.y}" width="160" height="${b.h}" fill="${b.fill}"/>`).join('')}</g>`;
      return `<g class="dg-layer" style="--i:${i}">${body}</g>`;
    })
    .join('');
  return (
    `<svg class="dg" viewBox="0 0 200 210" aria-hidden="true" focusable="false">` +
    `<defs><clipPath id="${clip}"><path d="${v.interior}"/></clipPath></defs>` +
    groups +
    `<g class="dg-line" fill="none" stroke="${C.line}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="${v.outline}"/>` +
    (v.handle ? `<path d="${v.handle}"/>` : '') +
    (v.saucer ? `<path d="${v.saucer}"/>` : '') +
    (v.straw ? `<path d="${v.straw}" stroke-width="6"/>` : '') +
    `</g></svg>`
  );
}
