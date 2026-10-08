// Hero film: bean → aperture → cup → drink diagrams docking into #coffee.
// Scroll-scrubbed and reversible. Static photo hero (the HTML default) for
// reduced motion and short screens; JS owns every hidden/moving state.
//
// Capture flags: ?nosmooth (no lerp), ?p=0.5 (freeze progress).
// Rendered state: data-progress on the stage.
import { MACRO, BEAN, PHOTO } from '../data/geometry.js';
import { FULL, COMPACT } from '../data/timeline.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const map = (p, [a, b]) => clamp((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
// piecewise-linear keyframes [[p, v], …] with ease in-out per segment
const keys = (p, ks) => {
  if (p <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (p <= ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], easeIO((p - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0])));
  }
  return ks[ks.length - 1][1];
};

const params = new URLSearchParams(location.search);
const NOSMOOTH = params.has('nosmooth');
const FIXED_P = params.has('p') ? clamp(parseFloat(params.get('p')) || 0) : null;

// Catmull-Rom through points → cubic Bézier path.
function smoothPath(pts) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

// Cover fit of an iw×ih image into W×H, anchored at (ax, ay).
function cover(iw, ih, W, H, ax, ay) {
  const s = Math.max(W / iw, H / ih);
  return { s, x: (W - iw * s) * ax, y: (H - ih * s) * ay };
}
// Cover × zoom, with image point [ix, iy] placed as near T as coverage allows.
function placeAt(iw, ih, W, H, zoom, [ix, iy], T) {
  const s = Math.max(W / iw, H / ih) * zoom;
  const x = clamp(T.x - ix * s, W - iw * s, 0);
  const y = clamp(T.y - iy * s, H - ih * s, 0);
  return { s, x, y };
}
// Zoom a plate transform by z around screen point P.
const zoomAt = (b, z, P) => ({ s: b.s * z, x: P.x + z * (b.x - P.x), y: P.y + z * (b.y - P.y) });
const toScreen = (b, ix, iy) => ({ x: ix * b.s + b.x, y: iy * b.s + b.y });
const setPlate = (el, b) => { el.style.transform = `translate3d(${b.x.toFixed(2)}px, ${b.y.toFixed(2)}px, 0) scale(${b.s.toFixed(5)})`; };

// Smallest rx so a rotated ellipse (ry = k·rx) centred at C covers the W×H box.
function coverRadius(C, deg, k, W, H) {
  const a = (deg * Math.PI) / 180, cos = Math.cos(a), sin = Math.sin(a);
  let r = 0;
  for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H]]) {
    const dx = x - C.x, dy = y - C.y;
    const u = dx * cos + dy * sin, v = -dx * sin + dy * cos;
    r = Math.max(r, Math.sqrt(u * u + (v * v) / (k * k)));
  }
  return r * 1.04;
}

export function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const q = (s) => hero.querySelector(s);
  const stage = q('[data-stage]');
  const track = q('[data-track]');
  const world = { dark: q('[data-world="dark"]'), blue: q('[data-world="blue"]'), photo: q('[data-world="photo"]'), espresso: q('[data-world="espresso"]') };
  const plate = { macro: q('[data-plate="macro"]'), bean: q('[data-plate="bean"]'), photo: q('[data-plate="photo"]') };
  const ap1 = q('[data-aperture="1"]'), ap2 = q('[data-aperture="2"]');
  const ap1In = ap1.firstElementChild, ap2In = ap2.firstElementChild;
  const copies = [...hero.querySelectorAll('.hc')];
  const ctas = q('[data-hero-ctas]');
  const cue = q('.hero__cue');
  const grooves = [...hero.querySelectorAll('[data-groove]')];
  const spark = q('[data-spark]');
  const dock = q('[data-dock]');
  const nav = document.querySelector('[data-nav]');
  const coffee = document.querySelector('[data-coffee]');
  const slots = coffee ? [...coffee.querySelectorAll('[data-slot]')] : [];

  const grooveD = smoothPath(MACRO.groove);
  grooves.forEach((p) => p.setAttribute('d', grooveD));
  const grooveLen = grooves[0].getTotalLength();
  grooves.forEach((p) => { p.style.strokeDasharray = `${grooveLen} ${grooveLen}`; });

  // Dock clones of the four diagrams (ids suffixed to stay unique).
  const dockItems = slots.map((slot) => {
    const el = document.createElement('div');
    el.className = 'dock__item';
    el.innerHTML = slot.innerHTML.replace(/(id="|#)clip-([\w-]+)/g, '$1clip-$2-dock');
    dock.appendChild(el);
    return el;
  });

  const rm = matchMedia('(prefers-reduced-motion: reduce)');
  const portraitMQ = matchMedia('(max-aspect-ratio: 1/1)');

  let mode = 'static';
  let T = FULL;
  let G = {}; // geometry for the current layout
  let target = 0, current = 0, lastDrawn = -1, raf = 0;

  function decideMode() {
    const w = innerWidth, h = innerHeight;
    if (rm.matches || h < 500) return 'static';
    if (w >= 1024 && h >= 600 && w / h >= 1.25 && slots.length === 4) return 'full';
    return 'compact';
  }

  function applyMode(next) {
    mode = next;
    T = mode === 'full' ? FULL : COMPACT;
    if (mode === 'static') {
      hero.removeAttribute('data-mode');
      hero.classList.remove('is-js');
      for (const el of [ap1, ap1In, ap2, ap2In, world.dark, world.blue, world.photo, world.espresso, ...copies, ...Object.values(plate)]) el.removeAttribute('style');
      stage.removeAttribute('data-progress');
      dock.style.visibility = 'hidden';
      coffee?.classList.remove('is-docking');
      if (coffee) coffee.style.scrollMarginTop = '';
      return;
    }
    hero.dataset.mode = mode;
    hero.classList.add('is-js');
    world.blue.style.visibility = mode === 'full' ? '' : 'hidden';
  }

  function measure() {
    const W = stage.clientWidth, H = stage.clientHeight;
    const portrait = portraitMQ.matches;
    const g = { W, H, portrait };

    // Macro bean, cover; E1 = the point of the crease nearest the target.
    // Portrait: zoom past cover so the crease runs below the copy and CTAs.
    g.macro = portrait ? placeAt(MACRO.w, MACRO.h, W, H, 1.4, [1350, 543], { x: 0.55 * W, y: 0.8 * H }) : cover(MACRO.w, MACRO.h, W, H, 1, 0.5);
    const tgt = mode === 'full' ? { x: 0.68 * W, y: 0.48 * H } : portrait ? { x: 0.5 * W, y: 0.8 * H } : { x: 0.68 * W, y: 0.55 * H };
    let best = null;
    for (let i = 0; i <= 200; i++) {
      const pt = grooves[0].getPointAtLength((grooveLen * i) / 200);
      const s = toScreen(g.macro, pt.x, pt.y);
      const dd = (s.x - tgt.x) ** 2 + (s.y - tgt.y) ** 2;
      if (s.x > 12 && s.x < W - 12 && s.y > 12 && s.y < H - 12 && (!best || dd < best.dd)) best = { ...s, dd, l: (grooveLen * i) / 200 };
    }
    best ??= { x: tgt.x, y: tgt.y, l: grooveLen / 2 };
    g.E1 = { x: best.x, y: best.y };
    const a = grooves[0].getPointAtLength(Math.max(0, best.l - 120));
    const b = grooves[0].getPointAtLength(Math.min(grooveLen, best.l + 120));
    g.ang1 = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    g.k1 = 0.62;
    g.ap1Max = coverRadius(g.E1, g.ang1, g.k1, W, H);
    g.ap1Slit = 150 * g.macro.s;

    // Blue bean: crease centre on E1 (match cut on the shared crease).
    const sB = Math.min((0.62 * H) / BEAN.bounds.h, (0.4 * W) / BEAN.bounds.w);
    g.bean = { s: sB, x: g.E1.x - BEAN.groove.cx * sB, y: g.E1.y - BEAN.groove.cy * sB };
    g.ang2 = BEAN.groove.angle;
    g.k2 = 0.6;
    g.ap2Max = coverRadius(g.E1, g.ang2, g.k2, W, H);
    g.ap2Slit = (BEAN.groove.length / 2) * sB * 0.9;

    // Photo (art-directed source follows the same aspect query as <picture>).
    g.pg = portrait ? PHOTO.mobile : PHOTO.desktop;
    // Landscape: push the cup right (crema near 0.7W) as far as cover allows.
    g.photo = portrait
      ? cover(g.pg.w, g.pg.h, W, H, 0.78, 0.5)
      : placeAt(g.pg.w, g.pg.h, W, H, 1, [g.pg.crema.cx, g.pg.crema.cy], { x: 0.7 * W, y: 0.4 * H });
    g.photoPivot = toScreen(g.photo, g.pg.crema.cx, g.pg.crema.cy);
    plate.macro.style.width = `${MACRO.w}px`; plate.macro.style.height = `${MACRO.h}px`;
    plate.bean.style.width = `${BEAN.w}px`; plate.bean.style.height = `${BEAN.h}px`;
    plate.photo.style.width = `${g.pg.w}px`; plate.photo.style.height = `${g.pg.h}px`;

    // Espresso disc grows out of the crema (screen coords at photo zoom 1).
    g.crema = { ...toScreen(g.photo, g.pg.crema.cx, g.pg.crema.cy), rx: g.pg.crema.rx * g.photo.s, ry: g.pg.crema.ry * g.photo.s };
    g.espMax = coverRadius(g.crema, 0, 1, W, H);

    // Track and dock.
    const sy = scrollY;
    g.trackTop = track.getBoundingClientRect().top + sy;
    g.scrollLen = Math.max(1, track.offsetHeight - H);
    g.release = g.trackTop + g.scrollLen;
    if (mode === 'full') {
      const coffeeTop = coffee.getBoundingClientRect().top + sy;
      const rects = slots.map((s) => s.getBoundingClientRect());
      const artH = rects[0].height;
      const navBottom = nav ? nav.getBoundingClientRect().bottom : 80;
      const pTop = rects[0].top + sy - coffeeTop;
      const Ty = clamp(Math.round((H - artH) / 2 - H * 0.05), navBottom + 24, Math.max(navBottom + 24, H - artH - 24));
      g.dockEnd = coffeeTop + pTop - Ty;
      g.slots = rects.map((r) => ({ x: r.left, y: r.top + sy - g.dockEnd, w: r.width, h: r.height }));
      dockItems.forEach((el, i) => { el.style.width = `${g.slots[i].w}px`; });
      const spt = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      // may be negative: anchors must land at the dock end, never before it
      coffee.style.scrollMarginTop = `${Math.ceil(Ty - pTop - spt)}px`;
      g.coffeeTop = coffeeTop;
      stage.dataset.dockEnd = String(Math.ceil(g.dockEnd));
    } else if (coffee) {
      coffee.style.scrollMarginTop = '';
    }
    G = g;
  }

  function setAperture(ap, apIn, C, deg, rx, k) {
    if (rx === Infinity) {
      ap.style.clipPath = 'none'; ap.style.transform = 'none'; apIn.style.transform = 'none';
      return;
    }
    const origin = `${C.x.toFixed(1)}px ${C.y.toFixed(1)}px`;
    ap.style.transformOrigin = origin; apIn.style.transformOrigin = origin;
    ap.style.transform = `rotate(${deg}deg)`; apIn.style.transform = `rotate(${-deg}deg)`;
    ap.style.clipPath = `ellipse(${Math.max(0, rx).toFixed(1)}px ${Math.max(0, rx * k).toFixed(1)}px at ${C.x.toFixed(1)}px ${C.y.toFixed(1)}px)`;
  }

  // Slit first (a thin opening along the crease), then the full window.
  function apertureRadius(t, slit, max) {
    if (t <= 0) return { rx: 0, k: 0.02 };
    if (t >= 1) return { rx: Infinity, k: 1 };
    if (t < 0.32) { const u = easeOut(t / 0.32); return { rx: slit * u, k: lerp(0.02, 0.16, u) }; }
    const u = easeIO((t - 0.32) / 0.68);
    return { rx: lerp(slit, max, u), k: lerp(0.16, 1, Math.min(1, u * 1.6)) };
  }

  function draw(p) {
    const g = G;
    stage.dataset.progress = p.toFixed(3);

    // --- bean: macro zoom + light along the crease
    setPlate(plate.macro, zoomAt(g.macro, keys(p, T.macroZoom), g.E1));
    const tl = easeIO(map(p, T.line));
    grooves.forEach((el) => { el.style.strokeDashoffset = `${grooveLen * (1 - tl)}`; });
    const head = grooves[0].getPointAtLength(grooveLen * tl);
    spark.setAttribute('cx', head.x.toFixed(1));
    spark.setAttribute('cy', head.y.toFixed(1));
    spark.style.opacity = `${tl > 0 && tl < 1 ? 1 : tl >= 1 ? clamp(1 - (p - T.line[1]) / 0.05) : 0}`;
    if (cue) cue.style.opacity = `${1 - map(p, [0, 0.06])}`;

    // --- aperture 1 (macro crease → next world)
    const t1 = map(p, T.ap1);
    const r1 = apertureRadius(t1, g.ap1Slit, g.ap1Max);
    setAperture(ap1, ap1In, g.E1, g.ang1, r1.rx, Math.min(g.k1, r1.k));
    world.dark.style.visibility = t1 >= 1 ? 'hidden' : 'visible';

    if (mode === 'full') {
      // --- blue bean, then aperture 2 along its crease
      setPlate(plate.bean, zoomAt(g.bean, keys(p, T.beanZoom), g.E1));
      plate.bean.style.opacity = `${1 - map(p, T.beanFade)}`;
      const t2 = map(p, T.ap2);
      const r2 = apertureRadius(t2, g.ap2Slit, g.ap2Max);
      setAperture(ap2, ap2In, g.E1, g.ang2, r2.rx, Math.min(g.k2, r2.k));
      world.blue.style.visibility = t2 >= 1 ? 'hidden' : 'visible';
    } else {
      setAperture(ap2, ap2In, g.E1, 0, Infinity, 1);
    }

    // --- cup: the window opens onto the latte art (crema starts on the
    // crease), then the photo settles into its resting framing.
    const apR = mode === 'full' ? T.ap2 : T.ap1;
    const settle = 1 - easeIO(map(p, [apR[0], apR[1] + 0.08]));
    const ph = zoomAt(g.photo, keys(p, T.photoZoom), g.photoPivot);
    // keep the plate covering the stage while it travels
    ph.x = clamp(ph.x + (g.E1.x - g.photoPivot.x) * settle, g.W - g.pg.w * ph.s, 0);
    ph.y = clamp(ph.y + (g.E1.y - g.photoPivot.y) * settle, g.H - g.pg.h * ph.s, 0);
    setPlate(plate.photo, ph);

    if (mode !== 'full') return;

    // --- copy hands over
    const c = 1 - map(p, T.copyFade);
    copies.forEach((el) => { el.style.opacity = `${c}`; });
    ctas.style.visibility = c < 0.04 ? 'hidden' : 'visible';

    // --- espresso disc out of the crema
    const eIn = map(p, T.espressoIn);
    const eG = easeIO(map(p, T.espressoGrow));
    const esp = world.espresso;
    if (eIn <= 0) {
      esp.style.visibility = 'hidden';
    } else {
      esp.style.visibility = 'visible';
      esp.style.opacity = `${eIn}`;
      if (eG >= 1) {
        esp.style.clipPath = 'none';
      } else {
        const rx = lerp(g.crema.rx * 0.98, g.espMax, eG);
        const ry = lerp(g.crema.ry * 0.98, g.espMax, eG);
        esp.style.clipPath = `ellipse(${rx.toFixed(1)}px ${ry.toFixed(1)}px at ${g.crema.x.toFixed(1)}px ${g.crema.y.toFixed(1)}px)`;
      }
    }
    world.photo.style.visibility = eG >= 1 ? 'hidden' : 'visible';
  }

  // Dock runs on raw scroll so the hand-off stays exact while the page rises.
  function drawDock(p) {
    if (mode !== 'full') return;
    const g = G;
    const sy = FIXED_P === null ? scrollY : g.trackTop + g.scrollLen * p;
    const docked = sy >= g.dockEnd - 0.5;
    const pd = sy >= g.release ? 1 : p;
    const active = !docked && pd >= T.drinks[0] - 0.02;
    dock.style.visibility = active ? 'visible' : 'hidden';
    coffee.classList.toggle('is-docking', !docked);
    if (!active) return;
    const n = dockItems.length;
    const span = T.drinks[1] - T.drinks[0] - T.drinkStagger * (n - 1);
    dockItems.forEach((el, i) => {
      const a = T.drinks[0] + T.drinkStagger * i;
      const t = easeIO(map(pd, [a, a + span]));
      const f = g.slots[i];
      const s0 = 0.22;
      const x0 = g.crema.x - (f.w * s0) / 2, y0 = g.crema.y - (f.h * s0) / 2;
      const s = lerp(s0, 1, t);
      el.style.transform = `translate3d(${lerp(x0, f.x, t).toFixed(2)}px, ${lerp(y0, f.y, t).toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
      el.style.opacity = `${clamp(t / 0.22)}`;
      el.style.setProperty('--sep', Math.sin(Math.PI * t).toFixed(3));
    });
  }

  function frame(now) {
    raf = 0;
    const k = NOSMOOTH ? 1 : 0.16;
    if (Math.abs(target - current) > 0.3) current = target; // long jumps (anchors) snap
    current += (target - current) * k;
    if (Math.abs(target - current) < 0.0005) current = target;
    if (Math.abs(current - lastDrawn) > 0.00005) { draw(current); lastDrawn = current; }
    drawDock(current);
    if (current !== target) raf = requestAnimationFrame(frame);
  }

  function readScroll() {
    target = FIXED_P !== null ? FIXED_P : clamp((scrollY - G.trackTop) / G.scrollLen);
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function relayout() {
    const next = decideMode();
    if (next !== mode) applyMode(next);
    if (mode === 'static') return;
    measure();
    lastDrawn = -1;
    target = FIXED_P !== null ? FIXED_P : clamp((scrollY - G.trackTop) / G.scrollLen);
    current = target;
    draw(current); lastDrawn = current;
    drawDock(current);
  }

  // In-page links to #coffee land at the dock end (the slots' final place).
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#coffee"]');
    if (!a || mode !== 'full') return;
    e.preventDefault();
    scrollTo({ top: Math.ceil(G.dockEnd), behavior: 'instant' });
    history.replaceState(null, '', '#coffee');
  });

  const landOnCoffee = () => {
    if (mode === 'full' && location.hash === '#coffee' && scrollY < G.dockEnd - 0.5) scrollTo({ top: Math.ceil(G.dockEnd), behavior: 'instant' });
  };
  applyMode(decideMode());
  relayout();
  landOnCoffee();
  addEventListener('load', () => requestAnimationFrame(landOnCoffee), { once: true });

  addEventListener('scroll', () => { if (mode !== 'static') readScroll(); }, { passive: true });
  let rT = 0;
  const onResize = () => { clearTimeout(rT); rT = setTimeout(relayout, 120); };
  addEventListener('resize', onResize);
  rm.addEventListener?.('change', relayout);
  document.fonts?.ready.then(relayout);
  addEventListener('load', relayout);
}
