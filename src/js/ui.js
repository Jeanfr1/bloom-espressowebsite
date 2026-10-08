// Navigation sheet, drink picker, reveals, the Visit flow line and the
// retail bean field parallax.
import { drinks } from '../data/site.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initNav() {
  const nav = document.querySelector('[data-nav]');
  const toggle = nav?.querySelector('[data-nav-toggle]');
  if (!toggle) return;
  const set = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };
  toggle.addEventListener('click', () => set(!nav.classList.contains('is-open')));
  nav.querySelectorAll('[data-nav-sheet] a').forEach((a) => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); toggle.focus(); } });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) set(false); });
}

// Tap/click chooses a drink; hover and focus preview its layers (CSS).
export function initDrinks() {
  const list = document.querySelector('[data-drinks]');
  const live = document.querySelector('[data-drinks-live]');
  if (!list) return;
  const byId = Object.fromEntries(drinks.map((d) => [d.id, d]));
  const say = (d) => {
    const parts = d.layers.map((l) => l.toLowerCase());
    const text = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
    return `${d.name}: ${text}, shown as separate layers.`;
  };
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-drink]');
    if (!btn) return;
    const on = btn.getAttribute('aria-pressed') !== 'true';
    list.querySelectorAll('[data-drink]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn && on)));
    if (live) live.textContent = on ? say(byId[btn.dataset.drink]) : '';
  });
}

// Only this module may hide content before it is revealed.
export function initReveal() {
  const els = [...document.querySelectorAll('[data-reveal]')];
  if (!els.length || reduced() || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  // Anything already on screen (or above it) is shown immediately.
  els.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight * 0.9) el.classList.add('is-in'); });
  document.documentElement.classList.add('reveal-on');
  els.forEach((el) => { if (!el.classList.contains('is-in')) io.observe(el); });
}

// Caramel flow line: from the cup down to "Get directions", drawn with scroll.
export function initFlow() {
  const section = document.querySelector('[data-visit]');
  const svg = section?.querySelector('[data-flow]');
  const path = svg?.querySelector('[data-flow-path]');
  const end = section?.querySelector('[data-flow-end]');
  const cup = section?.querySelector('.visit__cup');
  if (!path || !end || !cup) return;
  let len = 0;
  const build = () => {
    const s = section.getBoundingClientRect();
    const c = cup.getBoundingClientRect();
    const b = end.getBoundingClientRect();
    const wide = innerWidth >= 960;
    // start under the cup's saucer, end at the button's right edge (wide) or top (narrow)
    const x0 = c.left - s.left + c.width * (wide ? 0.32 : 0.5), y0 = c.top - s.top + c.height * 0.86;
    const x1 = b.right - s.left + 10, y1 = b.top - s.top + b.height / 2;
    svg.setAttribute('viewBox', `0 0 ${s.width} ${s.height}`);
    const d = wide
      ? `M${x0} ${y0} C${x0 - 40} ${y0 + 180}, ${x1 + 220} ${y1 + 40}, ${x1} ${y1}`
      : `M${x0} ${y0} C${x0} ${y0 + 160}, ${x1 + 60} ${y1 - 160}, ${b.left - s.left + b.width / 2} ${b.top - s.top - 6}`;
    path.setAttribute('d', d);
    len = path.getTotalLength();
    path.style.strokeDasharray = `${len} ${len}`;
    draw();
  };
  const draw = () => {
    if (reduced()) { path.style.strokeDashoffset = '0'; return; }
    const r = section.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.55 + r.height * 0.45)));
    path.style.strokeDashoffset = `${len * (1 - t)}`;
  };
  build();
  addEventListener('scroll', draw, { passive: true });
  addEventListener('resize', build);
  addEventListener('load', build);
  document.fonts?.ready.then(build);
}

// Retail band: a field of wooden beans drifting slower than the page.
export function initBeans() {
  const field = document.querySelector('[data-beans]');
  if (!field || reduced()) return;
  const section = field.parentElement;
  const tick = () => {
    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const t = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    field.style.transform = `translate3d(0, ${(t * 60).toFixed(1)}px, 0)`;
  };
  addEventListener('scroll', tick, { passive: true });
  tick();
}
