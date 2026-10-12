/* iTECH — Process: "The anatomy of digital"
   A scroll-controlled film (not an autoplay video): the edited Flow sequence
   (laptop → components → digital structures → the real iTECH site on screen)
   is stored as a WebP image sequence and drawn on a canvas. The section is
   pinned (CSS sticky) while the visitor scrolls through it (the process steps follow as a list); the scroll position
   picks the frame, so scrolling up plays it backwards. Frames load
   progressively around the current position; small screens and devices in
   "perf-lite" use a lighter 1280 px set packed four frames per file.
   prefers-reduced-motion: no pinning, three still key frames instead.
   Data: C.processConfig.cinematic                                            */
(function () {
'use strict';
const EXT = window.ITECH_EXT = window.ITECH_EXT || {};
let inst = null;
const pad = (n, k = 2) => String(n).padStart(k, '0');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = t => t * t * (3 - 2 * t);

function render(C, H) {
  const P = C.processConfig, K = P.cinematic || {}, e = H.esc, ed = H.ed || (() => ''), stages = K.stages || [], F = K.frames || {};
  const url = i => (F.desktop || '').replace('{i}', pad(i, 3));
  const lines = s => String(s || '').split('\n').map(l => `<span class="ln"><span>${e(l)}</span></span>`).join('');
  const keys = K.stillFrames || [0, Math.round((F.count || 1) / 2), (F.count || 1) - 1];
  return `<section class="sec ana" id="process" data-ext="process" aria-labelledby="process-title" style="--ana-len:${+K.scrollLength || 400};--ana-len-m:${+K.scrollLengthMobile || +K.scrollLength || 300}">
  <div class="container">${H.head}</div>
  <div class="ana-track">
    <div class="ana-pin">
      <div class="ana-stage">
        <img class="ana-poster" src="${e(url(0))}" alt="" loading="lazy" decoding="async" aria-hidden="true">
        <canvas class="ana-cv" aria-hidden="true"></canvas>
        <i class="ana-scrim" aria-hidden="true"></i>
        <div class="ana-copy">
          <div class="ana-txt is-intro" data-i="-1">
            <p class="ana-lbl mono">${e(K.kicker || '')}</p>
            <h3 class="ana-h">${lines(K.title)}</h3>
            <p class="ana-sub">${e(K.subtitle || '')}</p>
          </div>
          ${stages.map((s, i) => `<div class="ana-txt" data-i="${i}">
            <p class="ana-lbl mono"><b>${pad(i + 1)}</b>${e(s.label)}</p>
            <h3 class="ana-h">${lines(s.title)}</h3>
          </div>`).join('')}
        </div>
        <div class="ana-hud" aria-hidden="true">
          <span class="ana-segs">${stages.map(() => '<i><b></b></i>').join('')}</span>
          <span class="ana-pct mono">00</span>
        </div>
        <p class="ana-hint mono" aria-hidden="true">${e(K.hint || '')}<i></i></p>
      </div>
    </div>
  </div>
  ${(P.steps || []).length ? `<div class="container"><ol class="ana-steps" style="--ana-n:${P.steps.length}">${P.steps.map((s, i) => `<li class="ana-step">
      ${P.showStepNumbers ? `<span class="ana-step-n mono">${pad(i + 1)}</span>` : ''}
      <h3 class="ana-step-t"${ed(`processConfig.steps.${i}.title`)}>${e(s.title)}</h3>
      ${s.tagline ? `<p class="ana-step-g mono"${ed(`processConfig.steps.${i}.tagline`)}>${e(s.tagline)}</p>` : ''}
      <p class="ana-step-d"${ed(`processConfig.steps.${i}.text`)}>${e(s.text)}</p>
    </li>`).join('')}</ol></div>` : ''}
  <div class="container ana-still">
    ${stages.map((s, i) => `<figure class="ana-fig">
      <img src="${e(url(keys[i] != null ? keys[i] : 0))}" alt="" loading="lazy" decoding="async" width="${F.width || 1280}" height="${F.height || 720}">
      <figcaption><p class="ana-lbl mono"><b>${pad(i + 1)}</b>${e(s.label)}</p><h3 class="ana-h">${lines(s.title)}</h3></figcaption>
    </figure>`).join('')}
  </div>
</section>`;
}

function mount(root, C) {
  if (inst) inst.destroy();
  const K = C.processConfig.cinematic || {}, F = K.frames || {}, stages = K.stages || [];
  const N = Math.max(2, +F.count || 2);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (matchMedia(`(min-width: ${(+F.mobileBreakpoint || 760) + 1}px)`).matches) return;   // phones only (the film is hidden on larger screens)
  const track = root.querySelector('.ana-track'), pin = root.querySelector('.ana-pin'), stage = root.querySelector('.ana-stage');
  const cv = root.querySelector('.ana-cv'), poster = root.querySelector('.ana-poster');
  if (!track || !cv || !cv.getContext) return;
  const ctx = cv.getContext('2d', { alpha: false });
  const txts = [...root.querySelectorAll('.ana-txt')], segs = [...root.querySelectorAll('.ana-segs b')], pct = root.querySelector('.ana-pct'), hint = root.querySelector('.ana-hint');
  const G = F.mobileGrid || [2, 2], PER = G[0] * G[1];
  const lite = () => document.documentElement.classList.contains('perf-lite') || (navigator.connection && navigator.connection.saveData);
  const pickSet = () => (innerWidth <= (+F.mobileBreakpoint || 760) || lite()) ? 'm' : 'd';
  let set = pickSet();
  const cache = new Map();          // key → { img, ok }
  let active = 0, target = 0, cur = 0, shown = -1, raf = 0, last = 0, dead = false, near = false, drawnKey = '';
  const MAXQ = 10;

  /* ── frames ── */
  const keyOf = i => set === 'm' ? Math.floor(i / PER) : i;
  const srcOf = k => (set === 'm' ? F.mobile : F.desktop).replace('{i}', pad(k, 3));
  const nKeys = () => set === 'm' ? Math.ceil(N / PER) : N;
  function load(k) {
    const rec = { img: new Image(), ok: false, err: false };
    cache.set(k, rec); active++;
    rec.img.decoding = 'async';
    rec.img.onload = () => {
      const fin = () => { if (dead || cache.get(k) !== rec) return; rec.ok = true; active--; if (Math.abs(k - keyOf(Math.round(cur * (N - 1)))) < 4 || shown < 0) { shown = -2; kick(); } pump(); };
      rec.img.decode ? rec.img.decode().then(fin, fin) : fin();
    };
    rec.img.onerror = () => { if (cache.get(k) !== rec) return; rec.err = true; active--; pump(); };
    rec.img.src = srcOf(k);
  }
  /* priority: the current frame, a coarse pass over the whole film (every 12th frame), then outwards from the position,
     looking further ahead in the scroll direction */
  let dir = 1;
  function pump() {
    if (dead || !near) return;
    const nk = nKeys(), c = keyOf(Math.round(target * (N - 1))), step = set === 'm' ? 8 : 12;
    const order = [c];
    for (let k = 0; k < nk; k += step) order.push(k);
    const AH = set === 'm' ? 10 : 60, BH = set === 'm' ? 3 : 16;
    for (let d = 1; d <= AH; d++) { order.push(c + d * dir); if (d <= BH) order.push(c - d * dir); }
    for (const k of order) {
      if (active >= MAXQ) break;
      if (k < 0 || k >= nk || cache.has(k)) continue;
      load(k);
    }
    evict(c);
  }
  /* keep memory bounded: decoded frames far from the position are released (coarse pass kept) */
  function evict(c) {
    const lim = set === 'm' ? 24 : 96, step = set === 'm' ? 8 : 12;
    if (cache.size <= lim) return;
    for (const [k, rec] of cache) {
      if (cache.size <= lim) break;
      if (k % step === 0 || Math.abs(k - c) < (set === 'm' ? 6 : 36) || !rec.ok) continue;
      rec.img.src = ''; cache.delete(k);
    }
  }
  function nearestReady(i) {   // never a blank frame: closest frame that is already decoded
    const k0 = keyOf(i), nk = nKeys();
    for (let d = 0; d < nk; d++) {
      const a = cache.get(k0 - d * dir), b = cache.get(k0 + d * dir);
      if (a && a.ok) return [a.img, k0 - d * dir];
      if (b && b.ok) return [b.img, k0 + d * dir];
    }
    return null;
  }

  /* ── canvas ── */
  let cw = 0, ch = 0;
  function size() {
    const r = stage.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (w !== cw || h !== ch) { cw = cv.width = w; ch = cv.height = h; drawnKey = ''; }
  }
  function paint(f) {   // f = fractional frame position: the frame below, cross-faded into the next one
    const i = clamp(Math.floor(f), 0, N - 1), al = Math.round((f - i) * 12) / 12;
    const got = nearestReady(i);
    if (!got) return false;
    const [img, k] = got, sub = set === 'm' ? (k === keyOf(i) ? i % PER : 0) : 0;
    let img2 = null, sub2 = 0;
    if (al > 0 && i + 1 < N && k === keyOf(i)) {
      const r2 = cache.get(keyOf(i + 1));
      if (r2 && r2.ok) { img2 = r2.img; sub2 = set === 'm' ? (i + 1) % PER : 0; }
    }
    const key = set + k + ':' + sub + ':' + (img2 ? sub2 + '@' + al : '') + ':' + cw + 'x' + ch;
    if (key === drawnKey) return true;
    const fw = set === 'm' ? img.naturalWidth / G[0] : img.naturalWidth, fh = set === 'm' ? img.naturalHeight / G[1] : img.naturalHeight;
    // contain (never crop the laptop); allow a small zoom when the box is only slightly off 16:9
    const mz = innerWidth <= (+F.mobileBreakpoint || 760) ? (+K.maxZoomMobile || 1.45) : (+K.maxZoom || 1.1);
    const sc = Math.min(cw / fw, ch / fh), s = Math.min(Math.max(cw / fw, ch / fh), sc * mz);
    const dw = fw * s, dh = fh * s;
    ctx.fillStyle = K.background || '#0B0C10'; ctx.fillRect(0, 0, cw, ch);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    const ay = innerWidth <= (+F.mobileBreakpoint || 760) ? (+K.mobileAlignY || .36) : .5;   // phones: picture above the words
    const dx = (cw - dw) / 2, dy = (ch - dh) * ay;
    const put = (im, sb, alpha) => {
      const sx = set === 'm' ? (sb % G[0]) * fw : 0, sy = set === 'm' ? Math.floor(sb / G[0]) * fh : 0;
      ctx.globalAlpha = alpha; ctx.drawImage(im, sx, sy, fw, fh, dx, dy, dw, dh); ctx.globalAlpha = 1;
    };
    put(img, sub, 1);
    if (img2) put(img2, sub2, al);
    // letterboxed (phones): melt the picture's top and bottom edges into the background
    if (dy > 1) {
      const bg = K.background || '#0B0C10', fd = dh * .14;
      [[dy, dy + fd], [dy + dh, dy + dh - fd]].forEach(([a, b]) => {
        const g = ctx.createLinearGradient(0, a, 0, b); g.addColorStop(0, bg); g.addColorStop(1, bg + '00');
        ctx.fillStyle = g; ctx.fillRect(0, Math.min(a, b) - 1, cw, fd + 2);
      });
    }
    drawnKey = key;
    if (poster && !poster.hidden) poster.hidden = true;
    return true;
  }

  /* ── typography + HUD ── */
  const ranges = stages.map(s => [+s.from || 0, s.to == null ? 1 : +s.to]);
  const introTo = +K.introTo || .045;
  function copy(p) {
    txts.forEach(el => {
      const i = +el.dataset.i;
      let a;
      if (i < 0) a = 1 - clamp(p / introTo, 0, 1);
      else {
        const [f, t] = ranges[i], L = t - f, fi = Math.min(.1, L * .25);
        const inA = i === 0 ? clamp((p - introTo * .7) / (introTo * 1.3), 0, 1) : clamp((p - f + fi * .5) / fi, 0, 1);
        const outA = i === stages.length - 1 ? 1 : clamp((t - p + fi * .3) / fi, 0, 1);
        a = Math.min(inA, outA);
      }
      el.style.opacity = a.toFixed(3);
      el.style.visibility = a > .002 ? 'visible' : 'hidden';
      el.querySelectorAll('.ln > span').forEach((sp, k) => {
        const u = ease(clamp(a * 1.35 - k * .18, 0, 1));
        sp.style.transform = `translate3d(0,${((1 - u) * 105).toFixed(1)}%,0)`;
      });
      const lbl = el.querySelector('.ana-lbl'); if (lbl) lbl.style.transform = `translate3d(0,${((1 - ease(a)) * 10).toFixed(1)}px,0)`;
    });
    segs.forEach((b, i) => { const [f, t] = ranges[i]; b.style.transform = `scaleX(${clamp((p - f) / (t - f), 0, 1).toFixed(3)})`; });
    if (pct) pct.textContent = pad(Math.round(p * 100));
    if (hint) hint.style.opacity = (1 - clamp(p / .02, 0, 1)).toFixed(3);
  }

  /* ── scroll → progress ── */
  function measure() {
    const r = track.getBoundingClientRect(), len = track.offsetHeight - pin.offsetHeight, top0 = parseFloat(getComputedStyle(pin).top) || 0;
    const t = len > 0 ? clamp((top0 - r.top) / len, 0, 1) : 0;
    if (t !== target) { dir = t > target ? 1 : -1; target = t; }
  }
  function frame(now) {
    raf = 0; if (dead) return;
    const dt = Math.min(250, now - (last || now)) || 16; last = now;
    cur += (target - cur) * (1 - Math.exp(-dt / (+K.smoothMs || 90)));
    if (Math.abs(target - cur) < .0004) cur = target;
    const fp = cur * (N - 1);
    if (paint(fp)) shown = Math.floor(fp);
    copy(cur);
    pump();
    if (cur !== target) raf = requestAnimationFrame(frame); else last = 0;   // a frame that arrives later calls kick()
  }
  const kick = () => { if (!raf && !dead) raf = requestAnimationFrame(frame); };
  const onScroll = () => { if (!near) return; measure(); kick(); };
  addEventListener('scroll', onScroll, { passive: true });

  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
    near = en.isIntersecting;
    if (near) { size(); measure(); cur = target; pump(); kick(); }
  }), { rootMargin: '120% 0px 120% 0px' }) : null;
  if (io) io.observe(track); else { near = true; size(); pump(); }

  let rt = 0;
  const reflow = () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (dead) return;
      const s2 = pickSet();
      if (s2 !== set) { cache.forEach(r => { r.img.src = ''; }); cache.clear(); active = 0; set = s2; shown = -1; drawnKey = ''; }
      size(); measure(); cur = target; shown = -1; pump(); kick();
    }, 120);
  };
  addEventListener('resize', reflow);
  const ro = 'ResizeObserver' in window ? new ResizeObserver(reflow) : null;
  if (ro) ro.observe(stage);
  addEventListener('itech:perf', reflow);
  root.classList.add('is-live');
  size(); measure(); cur = target; copy(cur);

  inst = { destroy() {
    dead = true; cancelAnimationFrame(raf); clearTimeout(rt);
    removeEventListener('scroll', onScroll); removeEventListener('resize', reflow); removeEventListener('itech:perf', reflow);
    if (io) io.disconnect(); if (ro) ro.disconnect();
    cache.forEach(r => { r.img.onload = r.img.onerror = null; r.img.src = ''; }); cache.clear();
    inst = null;
  } };
}

EXT.process = { render, mount };
})();
