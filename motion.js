/* iTECH — Motion layer (motion.dev, vanilla JS). Progressive enhancement over app.js:
   if this module fails to load, the CSS reveals in styles.css keep working unchanged.
   Scope (kept deliberately small — the hero, experience, work, why, process and final CTA
   scenes already run their own depth/parallax loops):
   · scroll reveals: spring entrance + automatic stagger for elements revealed together
   · section titles: word-by-word masked rise, original markup restored afterwards
   · package cards: spring lift on hover (fine pointer, full-quality mode)
   · before/after comparison + add-ons background: scroll-linked depth (native ViewTimeline) */
import { animate, inView, hover } from 'https://cdn.jsdelivr.net/npm/motion@14/+esm';

const root = document.documentElement;
const fine = matchMedia('(pointer: fine)').matches;
const lite = () => root.classList.contains('perf-lite');
const EASE = [.16, 1, .3, 1];                       // same curve as --ease in styles.css
const SPRING = { type: 'spring', visualDuration: .9, bounce: 0 };
const TITLES = '.sec-title,.why3-title';

/* ── reveals ─────────────────────────────────────────────────────────────── */
let stops = [], queue = [], flushing = 0;
function clear() { stops.forEach(s => { try { s(); } catch (e) { } }); stops = []; }

// Motion commits the final frame after the promise settles: clean up on the next frame
function done(el) { requestAnimationFrame(() => { el.style.opacity = ''; el.style.transform = ''; delete el.dataset.mo; }); }

function play(el, delay) {
  // .in = final CSS state; [data-mo] holds the CSS transition off; inline start values cover the stagger delay
  el.dataset.mo = ''; el.style.opacity = '.12'; el.style.transform = 'translateY(28px)'; el.classList.add('in');
  if (el.matches(TITLES)) return words(el, delay);
  animate(el, { opacity: [.12, 1], transform: ['translateY(28px)', 'none'] },
    { delay, opacity: { duration: .8, ease: EASE }, transform: SPRING })
    .then(() => done(el), () => done(el));
}

function flush() {
  flushing = 0;
  const batch = queue.sort((a, b) => a.compareDocumentPosition(b) & 4 ? -1 : 1); queue = [];
  batch.forEach((el, i) => {
    const d = el.style.getPropertyValue('--d');      // explicit delays (final CTA) win over the auto stagger
    play(el, d ? parseFloat(d) : Math.min(i, 7) * .07);
  });
}

function reveal(immediate) {
  clear();
  const els = [...document.querySelectorAll('[data-reveal]:not(.in)')];
  if (immediate) { els.forEach(el => el.classList.add('in')); return; }
  els.forEach(el => stops.push(inView(el, () => {
    if (el.classList.contains('in')) return;         // already shown by app.js (e.g. a re-rendered step)
    queue.push(el); if (!flushing) flushing = setTimeout(flush);   // one IntersectionObserver task = one stagger group
  }, { amount: .12, margin: '0px 0px -5% 0px' })));
  enhance();
}

/* ── titles: masked word rise ────────────────────────────────────────────── */
function split(node, out) {
  [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(t => {
        if (!t) return;
        if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
        const m = document.createElement('span'), w = document.createElement('span');
        m.className = 'mo-m'; w.className = 'mo-w'; w.style.transform = 'translateY(108%)'; w.textContent = t; m.appendChild(w); frag.appendChild(m); out.push(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && n.tagName !== 'BR') {
      // gradient text is clipped to its own glyphs: move it as one piece instead of per word
      const cs = getComputedStyle(n);
      if ((cs.webkitBackgroundClip || cs.backgroundClip) === 'text') {
        const m = document.createElement('span'); m.className = 'mo-m'; if (cs.display === 'block') m.style.display = 'block'; n.replaceWith(m); m.appendChild(n); n.classList.add('mo-w'); n.style.transform = 'translateY(108%)'; out.push(n);
      } else split(n, out);
    }
  });
}
function words(el, delay) {
  const html = el.innerHTML, ws = [];
  split(el, ws);
  el.style.opacity = '1'; el.style.transform = 'none';
  const restore = () => { el.innerHTML = html; done(el); };
  if (!ws.length) return restore();
  animate(ws, { transform: ['translateY(108%)', 'none'] },
    { type: 'spring', visualDuration: .85, bounce: 0, delay: i => delay + Math.min(i, 10) * .045 })
    .then(restore, restore);
}

/* ── hover + scroll depth (re-bound after every render) ──────────────────── */
function enhance() {
  if (!lite() && fine) {
    stops.push(hover('.pkg', el => {
      if ('mo' in el.dataset) return;
      el.dataset.mh = '';
      // `transform` (not `y`): same channel as the reveal, so the two never compete
      animate(el, { transform: 'translateY(-6px)' }, { type: 'spring', visualDuration: .35, bounce: .15 });
      return () => animate(el, { transform: 'translateY(0px)' }, { type: 'spring', visualDuration: .45, bounce: 0 })
        .then(() => requestAnimationFrame(() => { if (!el.matches(':hover')) { el.style.transform = ''; delete el.dataset.mh; } }));
    }));
  }
  const cmp = document.getElementById('cmp');
  // native view timeline (compositor-driven); Motion's scroll({ target }) reported no progress on this page
  if (cmp && !lite() && 'ViewTimeline' in window) {
    const tl = new ViewTimeline({ subject: cmp });
    cmp.querySelectorAll('.cmp-img img').forEach(img => {
      const a = img.animate([{ transform: 'scale(1.1)' }, { transform: 'scale(1)' }],
        { timeline: tl, rangeStart: 'entry 0%', rangeEnd: 'cover 50%', fill: 'both', easing: 'linear' });
      stops.push(() => a.cancel());
    });
  }
  // add-ons: the background band drifts slower than the page (subtle parallax)
  const xc = document.getElementById('addons'), band = xc && xc.querySelector('.xc-bgimg');
  if (band && !lite() && 'ViewTimeline' in window) {
    const a = band.animate([{ translate: '0 60px' }, { translate: '0 -60px' }],
      { timeline: new ViewTimeline({ subject: xc }), rangeStart: 'cover 0%', rangeEnd: 'cover 100%', fill: 'both', easing: 'linear' });
    stops.push(() => a.cancel());
  }
}

window.ITECH_MOTION = { reveal, animate };            // animate: used by addons.js (totals, selection springs)
addEventListener('itech:perf', () => reveal());      // drop hover/scroll extras when the device switches to light mode
dispatchEvent(new CustomEvent('itech:motion'));
