/* iTECH — Why iTECH (one central 3D composition)
   The same website on a monitor and a phone, with the ten reasons floating
   around them as glass panels joined by thin connector lines.
   Data: C.whyITechFeatures (panels), C.whyITechConfig.site (the website on
   both screens), C.whyITechVisualConfig (motion / lighting switches). */
(function () {
'use strict';
const EXT = window.ITECH_EXT = window.ITECH_EXT || {};
const liteOn = () => document.documentElement.classList.contains('perf-lite');   // adaptive quality (app.js)
let inst = null;
const ICON = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  devices: '<rect x="2" y="4" width="14" height="10" rx="1"/><rect x="17" y="8" width="5" height="11" rx="1"/><path d="M6 18h7"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  chart: '<path d="M4 20V12M10 20V8M16 20V4M22 20H2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  cube: '<path d="M12 2l9 5v10l-9 5-9-5V7l9-5z"/><path d="M3 7l9 5 9-5M12 12v10"/>',
  cloud: '<path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18z"/>',
  support: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1"/><rect x="17" y="13" width="4" height="6" rx="1"/>'
};
const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ICON.grid}</svg>`;
const DEPTH_Z = [-50, 0, 34, 64];      // px, depth 0 (far) → 3 (close)
const DEPTH_K = [3, 6, 10, 14];        // parallax travel, px
const PHONE_Z = 60, PERSP = 1700;

// a region of an image as a CSS background (keeps the same photo on every screen)
function bg(photo, crop) {
  const c = crop || photo.crop, W = photo.sourceWidth, H = photo.sourceHeight;
  return `background-image:url('${photo.src}');background-size:${(W / c.w * 100).toFixed(2)}% auto;background-position:${(c.x / (W - c.w) * 100).toFixed(2)}% ${(c.y / (H - c.h) * 100).toFixed(2)}%`;
}
function headline(S, e) { return S.headline.split('\n').map(l => l === S.accent ? `<em>${e(l)}</em>` : e(l)).join('<br>'); }
function siteDesktop(S, e) {
  return `<div class="ws2">
    <div class="ws2-nav"><b>${e(S.brand)}</b><nav>${S.nav.map(n => `<span>${e(n)}</span>`).join('')}</nav><span class="ws2-btn">${e(S.navCta)} →</span></div>
    <div class="ws2-hero"><div class="ws2-copy"><p class="ws2-h">${headline(S, e)}</p><p class="ws2-p">${e(S.text)}</p><span class="ws2-cta">${e(S.cta)} →</span></div>
      <div class="ws2-photo" style="${bg(S.photo)}"></div></div>
    <div class="ws2-cards">${S.cards.map((c, i) => `<div><span class="mono">0${i + 1}</span><b>${e(c.title)}</b><small>${e(c.text)}</small><i style="${bg(S.photo, c.crop)}"></i></div>`).join('')}</div>
  </div>`;
}
function siteMobile(S, e) {
  return `<div class="ws2m">
    <div class="ws2m-nav"><b>${e(S.brand)}</b><i></i></div>
    <p class="ws2m-h">${headline(S, e)}</p>
    <span class="ws2m-cta">${e(S.cta)} →</span>
    <div class="ws2m-photo" style="${bg(S.photo)}"></div>
    <div class="ws2m-card"><span class="mono">01</span><b>${e(S.cards[0].title)}</b></div>
  </div>`;
}
const feats = C => (C.whyITechFeatures || []).filter(f => f.enabled !== false);
const depthOf = f => Math.max(0, Math.min(3, f.depth == null ? 1 : +f.depth));

function render(C, H, num) {
  const K = C.whyITechConfig, V = C.whyITechVisualConfig || {}, F = feats(C), W = C.whyConfig.header, e = H.esc, S = K.site;
  const panel = (f, i) => {
    const d = depthOf(f), p = f.position || { x: 0, y: 0 }, t = f.tablet;
    return `<div class="wfp d${d}${t ? ' on-tab' : ''}" data-i="${i}" style="--x:${p.x}%;--y:${p.y}%;${t ? `--tx:${t.x}%;--ty:${t.y}%;` : ''}--z:${DEPTH_Z[d]}px;--k:${DEPTH_K[d]}px;--n:${i}">
      <div class="wfp-c" tabindex="0"><div class="wfp-f">
        <span class="wfp-top"><span class="wfp-num mono">${e(f.tag || f.title)}</span><span class="wfp-ico">${icon(f.icon)}</span></span>
        <b class="wfp-t">${e(f.title)}</b><span class="wfp-d">${e(f.description)}</span></div></div></div>`;
  };
  const BG = K.background && K.background.src ? K.background : null;
  return `<section class="sec why3${BG ? ' has-bg' : ''}${BG && BG.far ? ' bg-far-baked' : ''}${BG && BG.band ? ' bg-band-baked' : ''}" id="why" data-ext="why" aria-labelledby="why-title" style="--why-light:${V.lightingIntensity == null ? 1 : +V.lightingIntensity};--why-motion:${V.motionIntensity == null ? 1 : +V.motionIntensity}${BG ? `;--wbg:url('${e(BG.src)}');${BG.far ? `--wbg-far:url('${e(BG.far)}');` : ''}${BG.band ? `--wbg-band:url('${e(BG.band)}');` : ''}--wbg-o:${BG.opacity == null ? 1 : +BG.opacity}` : ''}">
  ${BG ? `<div class="why3-bg" aria-hidden="true"><i class="wb-far"></i><i class="wb-band"></i><i class="wb-shade"></i></div>
  <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><filter id="whyBgSharpen" color-interpolation-filters="sRGB"><feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="0 -0.22 0 -0.22 1.88 -0.22 0 -0.22 0"/></filter></svg>` : ''}
  <div class="container">
    <header class="why3-head">
      <p class="sec-meta mono" data-reveal>${num && !(C.sections.why || {}).hideNumber ? `<b>${num}</b>` : ''}<span>${e(W.label)}</span></p>
      <h2 class="why3-title" id="why-title" data-reveal>${e(W.title)}<span class="serif grad-text">${e(W.accentLine)}</span></h2>
      ${K.intro ? `<p class="why3-intro" data-reveal>${e(K.intro)}</p>` : ''}
    </header>
    <div class="wx">
      <div class="wx-atmo" aria-hidden="true"></div>
      <div class="wx-world">
        <svg class="wx-lines" aria-hidden="true"></svg>
        <div class="wx-mon" role="img" aria-label="The ${e(S.brand)} website on a desktop screen"><div class="wx-mon-c">
          <div class="wv-screen"><div class="wv-site">${siteDesktop(S, e)}</div></div><div class="wv-base"><i></i></div><div class="wx-refl" aria-hidden="true"></div>
        </div></div>
        <div class="wx-ph" role="img" aria-label="The same website on a phone"><div class="wx-ph-c">
          <div class="wv-phone-body"><div class="wv-phone-screen">${siteMobile(S, e)}</div></div>
        </div></div>
        <div class="wx-panels" role="list" aria-label="Why iTECH">${F.map(panel).join('')}</div>
      </div>
    </div>
    <ol class="wfl" aria-label="Why iTECH">
      ${F.map(f => `<li class="wfl-i${f.tablet ? ' on-tab' : ''}"><span class="wfl-ico">${icon(f.icon)}</span><span class="wfl-num mono">${e(f.id)}</span><b>${e(f.title)}</b><span class="wfl-d">${e(f.description)}</span></li>`).join('')}
    </ol>
  </div>
</section>`;
}

function mount(root, C) {
  if (inst) inst.destroy();
  const V = C.whyITechVisualConfig || {}, F = feats(C);
  const on = k => V[k] !== false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(pointer: fine)').matches;
  const stage = root.querySelector('.wx'), world = root.querySelector('.wx-world'), svg = root.querySelector('.wx-lines');
  const mon = root.querySelector('.wx-mon'), ph = root.querySelector('.wx-ph');
  const panels = [...root.querySelectorAll('.wfp')];
  const mi = V.motionIntensity == null ? 1 : Math.max(0, +V.motionIntensity || 0);
  let raf = 0, dead = false, tx = 0, ty = 0, px = 0, py = 0, hot = new Set(), lines = [];
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (n, a) => { const el = document.createElementNS(NS, n); for (const k in a) el.setAttribute(k, a[k]); return el; };
  panels.forEach(p => p.setAttribute('role', 'listitem'));

  if (!on('ambientMotionEnabled') || reduced || mi === 0) stage.classList.add('no-amb');
  if (!on('cardHoverEnabled')) stage.classList.add('no-hover');

  // entrance: only when the section is still below the fold, so it is readable immediately otherwise
  let io = null, onScroll = () => {};
  if (!reduced && 'IntersectionObserver' in window && stage.getBoundingClientRect().top > innerHeight * .85) {
    stage.classList.add('wx-pre');
    const reveal = () => {
      if (!stage.classList.contains('wx-pre')) return;
      stage.classList.add('wx-in'); stage.classList.remove('wx-pre');
      if (io) { io.disconnect(); io = null; } removeEventListener('scroll', onScroll);
      setTimeout(() => stage.classList.add('wx-done'), 1600);
    };
    // fallback if the observer is throttled: check on scroll too
    onScroll = () => { const r = stage.getBoundingClientRect(); if (r.top < innerHeight * .85 && r.bottom > 0) reveal(); };
    io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) reveal(); }), { threshold: .15 });
    io.observe(stage); addEventListener('scroll', onScroll, { passive: true });
  } else stage.classList.add('wx-in', 'wx-done');

  // ── connector lines: from the panel edge facing the device to a point on it (perspective-projected)
  const shown = el => getComputedStyle(el).display !== 'none';
  function build() {
    svg.textContent = ''; lines = [];
    if (!on('connectorLinesEnabled') || !shown(svg)) return;
    const w = world.clientWidth, h = world.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const defs = mk('defs', {});
    defs.innerHTML = '<radialGradient id="wxNode"><stop offset="0" stop-color="#FFEAF4"/><stop offset=".4" stop-color="#FF6FB1" stop-opacity=".7"/><stop offset="1" stop-color="#FF6FB1" stop-opacity="0"/></radialGradient>';
    svg.appendChild(defs);
    panels.forEach((p, i) => {
      if (!shown(p)) return;
      const f = F[i], L = f.link || { to: 'monitor', x: 50, y: 50 };
      const g = mk('g', { class: 'wx-ln', style: `--n:${i}` });
      const path = mk('path', { class: 'wx-ln-p', pathLength: 100 });
      const pulse = mk('path', { class: 'wx-ln-pulse', pathLength: 100, style: `animation-delay:${((i * 2.3) % 11).toFixed(1)}s` });
      const a = mk('circle', { class: 'wx-ln-a', r: 1.8 });
      const glow = mk('circle', { class: 'wx-ln-glow', r: 8, fill: 'url(#wxNode)' });
      const b = mk('circle', { class: 'wx-ln-b', r: 2.2 });
      g.append(path, pulse, a, glow, b); svg.appendChild(g);
      lines.push({ i, p, L, d: depthOf(f), g, path, pulse, a, glow, b });
    });
    paint(); draw();
  }
  const project = (x, y, z, w, h) => { const s = PERSP / (PERSP - z), ox = w / 2, oy = h * .48; return [ox + (x - ox) * s, oy + (y - oy) * s]; };
  const box = el => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
  function draw() {
    if (!lines.length) return;
    const w = world.clientWidth, h = world.clientHeight, M = box(mon), P = box(ph);
    const par = stage.classList.contains('has-px');
    lines.forEach(l => {
      const k = par ? DEPTH_K[l.d] * mi : 0, z = DEPTH_Z[l.d], el = box(l.p);
      const bx = el.x + px * k, by = el.y + py * k;
      const isP = l.L.to === 'phone', D = isP ? P : M;
      let ex = D.x + D.w * l.L.x / 100, ey = D.y + D.h * l.L.y / 100;
      if (isP && par) { ex += px * 12 * mi; ey += py * 8 * mi; }
      const [qx, qy] = project(ex, ey, isP ? PHONE_Z : 0, w, h);
      const cx = bx + el.w / 2, cy = by + el.h / 2, [pcx, pcy] = project(cx, cy, z, w, h);
      const dx = qx - pcx, dy = qy - pcy, side = Math.abs(dx) / el.w > Math.abs(dy) / el.h;
      const [ax, ay] = project(side ? (dx > 0 ? bx + el.w : bx) : cx, side ? cy : (dy > 0 ? by + el.h : by), z, w, h);
      // a short straight lead out of the panel, then to the device: blueprint, not flowchart
      const lx = side ? ax + Math.sign(dx) * 16 : ax, ly = side ? ay : ay + Math.sign(dy) * 16;
      const d = `M${ax.toFixed(1)} ${ay.toFixed(1)}L${lx.toFixed(1)} ${ly.toFixed(1)}L${qx.toFixed(1)} ${qy.toFixed(1)}`;
      l.path.setAttribute('d', d); l.pulse.setAttribute('d', d);
      l.a.setAttribute('cx', ax.toFixed(1)); l.a.setAttribute('cy', ay.toFixed(1));
      [l.b, l.glow].forEach(c => { c.setAttribute('cx', qx.toFixed(1)); c.setAttribute('cy', qy.toFixed(1)); });
    });
  }

  // ── hover / focus: panel forward, its line lit, the others dimmed
  function paint() {
    stage.classList.toggle('has-hot', hot.size > 0);
    panels.forEach((p, i) => p.classList.toggle('is-hot', hot.has(i)));
    lines.forEach(l => l.g.classList.toggle('on', hot.has(l.i)));
  }
  if (on('cardHoverEnabled')) {
    panels.forEach((p, i) => {
      const c = p.querySelector('.wfp-c');
      const enter = () => { hot = new Set([i]); paint(); };
      const leave = () => { if (hot.has(i)) { hot = new Set(); paint(); } };
      c.addEventListener('pointerenter', enter); c.addEventListener('pointerleave', leave);
      c.addEventListener('focus', enter); c.addEventListener('blur', leave);
    });
    // hovering the phone lights the responsive reason
    const phoneFeats = F.map((f, i) => (f.link && f.link.to === 'phone' && f.icon === 'devices' ? i : -1)).filter(i => i >= 0);
    ph.addEventListener('pointerenter', () => { ph.classList.add('is-hover'); hot = new Set(phoneFeats); paint(); });
    ph.addEventListener('pointerleave', () => { ph.classList.remove('is-hover'); hot = new Set(); paint(); });
  }

  // ── parallax: monitor ±2° / ±1°, phone stronger, panels by depth, atmosphere inverse
  const big = () => innerWidth > 700;
  function frame() {
    raf = 0; if (dead) return;
    px += (tx - px) * .07; py += (ty - py) * .07;
    stage.style.setProperty('--px', px.toFixed(4)); stage.style.setProperty('--py', py.toFixed(4));
    draw();
    if (Math.abs(tx - px) > .001 || Math.abs(ty - py) > .001) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const onMove = ev => {
    if (!big() || liteOn()) return;
    const r = stage.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (ev.clientX - r.left) / r.width * 2 - 1));
    ty = Math.max(-1, Math.min(1, (ev.clientY - r.top) / r.height * 2 - 1)); kick();
  };
  const onLeave = () => { tx = ty = 0; kick(); };
  if (on('parallaxEnabled') && fine && !reduced && mi > 0) {
    stage.classList.add('has-px');
    if (!on('monitorTiltEnabled')) stage.classList.add('no-mtilt');
    if (!on('phoneTiltEnabled')) stage.classList.add('no-ptilt');
    stage.addEventListener('pointermove', onMove, { passive: true }); stage.addEventListener('pointerleave', onLeave);
  }

  let rt = 0;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { if (!dead) build(); }, 120); };
  addEventListener('resize', onResize);
  const ro = 'ResizeObserver' in window ? new ResizeObserver(onResize) : null;
  if (ro) ro.observe(world);
  build();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!dead) build(); });

  inst = { destroy() { dead = true; cancelAnimationFrame(raf); clearTimeout(rt); removeEventListener('resize', onResize); if (ro) ro.disconnect(); if (io) io.disconnect(); removeEventListener('scroll', onScroll); inst = null; } };
}

EXT.why = { render, mount };
})();
