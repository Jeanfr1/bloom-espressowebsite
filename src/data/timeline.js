// Scroll script, after 06-roteiros/02-animacao.md and 07-integracao/timeline.json.
// Progress p runs 0 → 1 across the hero track (220svh full, 145svh compact).
// The opening bean is the clean cut-out on powder blue (storyboard 02); the
// dark macro close-up was dropped on 2026-10-09 at the client's request.

export const FULL = {
  trackSvh: 220,
  // 0–0.16 the bean: light runs along the crease, a slow push in
  line: [0.03, 0.16],
  beanZoom: [[0, 1], [0.16, 1.04], [0.4, 1.32]],
  // 0.16–0.40 aperture: the crease opens as a slit, then a window onto the cup
  ap: [0.16, 0.4],
  // 0.40–0.60 the cup: latte art, the oak block recedes
  photoZoom: [[0.16, 1.16], [0.4, 1.04], [0.58, 1.0]],
  settle: 0.06,
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
  line: [0.03, 0.22],
  beanZoom: [[0, 1], [0.22, 1.04], [0.62, 1.3]],
  ap: [0.22, 0.62],
  photoZoom: [[0.22, 1.2], [0.62, 1.05], [1, 1.0]],
  settle: 0.08,
};
