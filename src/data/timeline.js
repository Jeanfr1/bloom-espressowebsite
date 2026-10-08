// Scroll script, after 06-roteiros/02-animacao.md and 07-integracao/timeline.json.
// Progress p runs 0 → 1 across the hero track (220svh full, 145svh compact).

export const FULL = {
  trackSvh: 220,
  // 0–0.18 the bean: macro 1.12 → 1.05, light runs along the crease
  line: [0.02, 0.17],
  macroZoom: [[0, 1.12], [0.18, 1.05], [0.31, 1.0]],
  // 0.18–0.40 aperture: the crease opens onto the blue bean, whose own
  // crease opens a rounded window onto the cup
  ap1: [0.18, 0.31],
  beanZoom: [[0.18, 2.1], [0.33, 1.0], [0.43, 1.28]],
  beanFade: [0.36, 0.43],
  ap2: [0.31, 0.43],
  // 0.40–0.60 the cup: latte art, the oak block recedes
  photoZoom: [[0.31, 1.18], [0.43, 1.045], [0.6, 1.0]],
  // 0.60–0.84 the cup's circle becomes four drink diagrams
  copyFade: [0.57, 0.63],
  espressoIn: [0.6, 0.635],
  espressoGrow: [0.62, 0.75],
  drinks: [0.68, 0.84],
  drinkStagger: 0.018,
  // 0.84–1 handoff: diagrams wait where #coffee's slots will arrive
};

export const COMPACT = {
  trackSvh: 145,
  line: [0.02, 0.24],
  macroZoom: [[0, 1.12], [0.24, 1.05], [0.6, 1.0]],
  // phones skip the blue bean: the crease opens straight onto the cup
  ap1: [0.24, 0.62],
  photoZoom: [[0.24, 1.22], [0.62, 1.05], [1, 1.0]],
};
