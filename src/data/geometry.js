// Measured on the kit images (scripts in the README's "How the hero works").
// All coordinates are in each image's own pixels.

// 03-hero/macro-bean.png (1672×941): the golden crease, scanned per column
// (warm + saturated score), median-filtered and smoothed.
export const MACRO = {
  w: 1672,
  h: 941,
  groove: [
    [790, 197.8], [830, 204.6], [870, 235.4], [910, 254.7], [950, 276.0], [990, 308.9],
    [1030, 344.5], [1070, 370.7], [1110, 385.0], [1150, 403.9], [1190, 430.5], [1230, 448.4],
    [1270, 474.5], [1310, 510.6], [1350, 542.6], [1390, 574.0], [1430, 598.0], [1470, 622.6],
    [1510, 645.8], [1550, 668.7], [1590, 701.6], [1630, 734.5], [1670, 759.2],
  ],
};

// 05-camadas/bean-alpha.png (1536×1024, real alpha): opaque bounds and the
// dark crease (quadratic fit), end points (520,175) → (1105,757).
export const BEAN = {
  w: 1536,
  h: 1024,
  bounds: { x: 346, y: 97, w: 870, h: 830 },
  groove: { cx: 815, cy: 470, angle: 44.85, length: 825 },
};

// 03-hero/hero-latte-*.png: crema ellipse inside the cup rim.
export const PHOTO = {
  desktop: { w: 1672, h: 941, crema: { cx: 1201, cy: 365, rx: 238, ry: 100 } },
  mobile: { w: 941, h: 1672, crema: { cx: 631, cy: 960, rx: 229, ry: 98 } },
};
