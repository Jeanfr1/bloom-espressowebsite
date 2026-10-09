// Measured on the kit images. All coordinates are in each image's own pixels.

// 05-camadas/bean-alpha.png (1536×1024, real alpha): opaque bounds and the
// crease, scanned per column (darkest opaque pixel), median-filtered and
// smoothed. The aperture opens at the crease centre along its angle.
export const BEAN = {
  w: 1536,
  h: 1024,
  bounds: { x: 346, y: 97, w: 870, h: 830 },
  groove: [
    [540, 190.4], [572, 207.2], [604, 245.6], [636, 278.2], [668, 306.3], [700, 326.5],
    [732, 345.8], [764, 370.3], [796, 399.4], [828, 426.4], [860, 459.7], [892, 492.5],
    [924, 524.9], [956, 556.6], [988, 587.5], [1020, 628.5], [1052, 682.2], [1084, 729.1], [1096, 737.9],
  ],
  centre: { x: 815, y: 470 },
  angle: 44.85,
  length: 790,
};

// 03-hero/hero-latte-*.png: crema ellipse inside the cup rim.
export const PHOTO = {
  desktop: { w: 1672, h: 941, crema: { cx: 1201, cy: 365, rx: 238, ry: 100 } },
  mobile: { w: 941, h: 1672, crema: { cx: 631, cy: 960, rx: 229, ry: 98 } },
};
