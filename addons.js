/* iTECH — Add-ons: the iTECH expansion configurator.
   Desktop: module cards (icon, name, price, Add) in two columns around a sticky hub (the expansion core +
   the "Your build" summary); hovered and selected modules are wired to the core.
   Tablet/phone: compact core on top, cards in a grid, a sticky build bar + drawer.
   Selection is the shared Set passed in by app.js (also used by the project brief).
   Data: C.addonsConfig (items, categories, recommendations, texts),
   C.addonsExperienceConfig (switches), C.packagesConfig.whatsappNumber.
   Previous orbit version: _backup-addons-v1/.                               */
(function () {
'use strict';
const EXT = window.ITECH_EXT = window.ITECH_EXT || {};
const liteOn = () => document.documentElement.classList.contains('perf-lite');   // adaptive quality (app.js)
const MO = () => window.ITECH_MOTION && window.ITECH_MOTION.animate;            // Motion (motion.js), when loaded

let H = null, inst = null;

const ICON = {
  document: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 11.5v6M9 14.5h6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z"/>',
  editor: '<path d="M4 20h4.2L19 9.2 14.8 5 4 15.8z"/><path d="M13 6.8l4.2 4.2M14 20h6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.3 8.5-6.3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h2M14 14h2M8 17.5h2"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 9.5h19M6 15h4"/>',
  chart: '<path d="M4 20V14M9.3 20V10M14.6 20V12.5M20 20V5M2.5 20h19"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M8.8 12.2l2.2 2.2 4.4-4.6"/>',
  server: '<rect x="3" y="3.5" width="18" height="7" rx="1.6"/><rect x="3" y="13.5" width="18" height="7" rx="1.6"/><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6"/>',
  motion: '<path d="M3 8.5c3-3.5 6-3.5 9 0s6 3.5 9 0"/><path d="M3 15.5c3-3.5 6-3.5 9 0s6 3.5 9 0"/>',
  cube: '<path d="M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3z"/><path d="M3.5 7.3L12 12l8.5-4.7M12 12v9.5"/>',
  cart: '<path d="M3 4h2.2l2.3 10.6h10.1L20 7.2H6.1"/><circle cx="9" cy="19.2" r="1.4"/><circle cx="16.8" cy="19.2" r="1.4"/>',
  nodes: '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18.5" r="2"/><circle cx="12" cy="11" r="1.5"/><path d="M6.7 7.1l4 2.9M17.3 7.1l-4 2.9M12 12.5v4"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12.5l9 5 9-5"/><path d="M3 16.5l9 5 9-5" opacity=".5"/>',
  plus: '<path d="M12 5.5v13M5.5 12h13"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>'
};
const icon = (k, cls) => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ICON.layers}</svg>`;
const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
const pad = n => String(n).padStart(2, '0');
// labels in the visitor's language (i18n.js); English when the language layer is missing
const tt = (s, v) => window.ITECH_T ? window.ITECH_T(s, v) : s.replace(/\{(\w+)\}/g, (m, k) => v && v[k] != null ? v[k] : m);

// per-language add-on data (addonsConfig.locales.ro / en / de), read from config.js as written:
// Romanian prices in lei are fixed market prices, never converted
const RAW = () => (window.ITECH_CONFIG || {}).addonsConfig || {};
const LOC = () => (RAW().locales || {})[(window.ITECH_I18N && window.ITECH_I18N.lang) || 'en'] || {};
// the base package picked above the add-ons (kept across re-renders, e.g. a language switch)
let basePkg = '';
const included = () => new Set((RAW().includedIn || {})[basePkg] || []);
const list = C => ((C.addonsConfig || {}).items || []).filter(a => a.enabled !== false).map(a => ({ ...a, ...((LOC().items || {})[a.id] || {}) }));
const kind = a => (a.price == null || a.priceType === 'on_request' || a.priceType === 'quote') ? 'quote' : a.priceType === 'monthly' ? 'monthly' : a.priceType === 'from' ? 'from' : 'fixed';
const lei = n => String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' lei';   // 1.500 lei
const fmt = (n, cur) => LOC().money === 'lei' ? lei(n) : (cur || '€') + Math.round(Number(n)).toLocaleString('en-US');
function priceText(a, cur, en) {    // en: English for the WhatsApp message to iTECH
  const k = kind(a), t = en ? (s => s) : tt;
  return k === 'quote' ? t('On request') : k === 'from' ? t('From') + ' ' + fmt(a.price, cur) : k === 'monthly' ? fmt(a.price, cur) + ' ' + t('/ month') : fmt(a.price, cur);
}
// price as shown on a card: the figure is the hero, the qualifier stays small
function priceHTML(a, cur) {
  const k = kind(a);
  if (k === 'quote') return `<span class="xa-p is-q"><b>${tt('On request')}</b></span>`;
  return `<span class="xa-p">${k === 'from' ? `<small>${tt('From')}</small>` : ''}<b>${fmt(a.price, cur)}</b>${k === 'monthly' ? `<small>${tt('/ month')}</small>` : ''}</span>`;
}
// one summary for hub, bar, drawer and WhatsApp — all from the same selection
// add-ons already in the base package are never charged (and cannot be added twice)
function summary(C, sel) {
  const inc = included(), all = list(C);
  const items = all.filter(a => sel.has(a.id) && !inc.has(a.id));
  let one = 0, from = false, month = 0, quote = 0;
  items.forEach(a => { const k = kind(a); if (k === 'quote') quote++; else if (k === 'monthly') month += +a.price; else { one += +a.price; if (k === 'from') from = true; } });
  return { items, count: items.length, one, from, month, quote, inc: all.filter(a => inc.has(a.id)) };
}
// the base package choices: Start / Grow / Premium (Custom is always quoted), titles in the visitor's language
function basePackages() {
  const P = (window.ITECH_CONFIG || {}).packagesConfig || {}, L = (P.pricing || {})[(window.ITECH_I18N && window.ITECH_I18N.lang) || 'en'] || P.pricing && P.pricing.en || {};
  return (P.items || []).filter(p => p.enabled !== false && (RAW().includedIn || {})[p.id]).map(p => {
    const l = (L.packages || {})[p.id] || {};
    return { id: p.id, title: l.title || p.name, price: l.launchPrice || '' };
  });
}
function detailsHTML(a, e) {
  const d = a.details; if (!d) return '';
  const li = (x, cls) => `<li${cls ? ` class="${cls}"` : ''}>${e(x)}</li>`;
  return `<details class="xa-more"><summary>${e(d.title || tt("What's included"))}</summary><div class="xa-more-b">
    <ul>${(d.items || []).map(x => li(x)).join('')}</ul>
    ${d.excluded && d.excluded.length ? `<p>${e(d.excludedTitle || tt('Not included'))}</p><ul>${d.excluded.map(x => li(x, 'x')).join('')}</ul>` : ''}
    ${d.note ? `<p class="xa-more-n">${e(d.note)}</p>` : ''}</div></details>`;
}
const plural = (n, one, many) => tt(n === 1 ? `{n} ${one}` : `{n} ${many}`, { n });
function extrasLine(s, cur) {
  const p = [];
  if (s.month) p.push(tt('+ {x} per month', { x: fmt(s.month, cur) }));
  if (s.quote) p.push(tt('{x} quoted separately', { x: plural(s.quote, 'item', 'items') }));
  return p.join(' · ');
}

/* live layers around the globe image: orbital rings and light nodes;
   nodes marked data-k light up one by one as modules are added */
function coreRings() {
  const ring = (id, rx, ry, rot) => `<g transform="rotate(${rot})"><ellipse id="${id}" class="cr-e" rx="${rx}" ry="${ry}"/></g>`;
  const path = (rx, ry, rot, rev) => { const r = rot * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r), pt = (x, y) => `${(x * c - y * sn).toFixed(2)} ${(x * sn + y * c).toFixed(2)}`;
    return rev ? `M${pt(rx, 0)} A${rx} ${ry} ${rot} 1 0 ${pt(-rx, 0)} A${rx} ${ry} ${rot} 1 0 ${pt(rx, 0)}` : `M${pt(rx, 0)} A${rx} ${ry} ${rot} 1 1 ${pt(-rx, 0)} A${rx} ${ry} ${rot} 1 1 ${pt(rx, 0)}`; };
  const R = [[47, 13.5, -9, 0, 70], [41, 17, 12, 1, 96], [50, 9.5, -3, 0, 0]];   // slow: one lap every 70–96 s
  let k = 0;
  const nodes = R.map(([rx, ry, rot, rev, dur], ri) => { const d = path(rx, ry, rot, rev), n = ri === 2 ? 6 : 5;
    return Array.from({ length: n }, (_, j) => { const kk = k++, begin = (-(dur || 1) * j / n).toFixed(2);
      if (!dur) { const t = j / n * Math.PI * 2, x = Math.cos(t) * rx, y = Math.sin(t) * ry, r = rot * Math.PI / 180; return `<circle class="nd" data-k="${kk}" cx="${(x * Math.cos(r) - y * Math.sin(r)).toFixed(2)}" cy="${(x * Math.sin(r) + y * Math.cos(r)).toFixed(2)}" r=".9"/>`; }
      return `<circle class="nd" data-k="${kk}" r=".9"><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${d}"/></circle>`; }).join(''); }).join('');
  return `<svg class="xc-rings" viewBox="-60 -60 120 120" aria-hidden="true">
    <circle class="cr-dots" r="33"/>
    ${R.map(([rx, ry, rot], i) => ring('xcr' + i, rx, ry, rot)).join('')}
    <g class="cr-extra">${ring('xcr3', 54, 15, 7)}</g>
    ${nodes}
  </svg>`;
}

/* which categories sit left / right of the hub: the advanced (plate) category and
   the last regular one go right, the rest left — keeps both columns about equal */
function columns(A, items) {
  const plateCat = A.plateCategory || 'advanced';
  const cats = (A.categories || []).filter(c => items.some(a => a.category === c.id));
  const reg = cats.filter(c => c.id !== plateCat), adv = cats.filter(c => c.id === plateCat);
  const right = [...reg.slice(-1), ...adv], left = reg.slice(0, -1);
  return left.length ? [left, right] : [right, []];
}

function render(C, helpers) {
  H = helpers;
  const A = C.addonsConfig, X = C.addonsExperienceConfig || {}, e = H.esc, cur = A.currency, items = list(C);
  const plateCat = A.plateCategory || 'advanced', T = A.cart || {};
  const chk = `<span class="xa-chk" aria-hidden="true">${icon('plus', 'pl')}${icon('check', 'ck')}<span class="xa-chk-l"><span class="pl">${tt('Add')}</span><span class="ck">${tt('Added')}</span><span class="inc">${tt('Included in package')}</span><span class="q">${tt('Request a quote')}</span></span></span>`;
  const card = a => {
    const adv = a.category === plateCat;
    return `<button type="button" class="xa${adv ? ' xa-adv' : ''}${kind(a) === 'quote' ? ' is-quote' : ''}" data-id="${e(a.id)}" data-cat="${e(a.category)}" aria-pressed="${H.selected.has(a.id)}" data-reveal>
      <span class="xa-in"><span class="xa-ico" aria-hidden="true">${icon(a.icon)}</span>
        <span class="xa-txt"><span class="xa-t">${e(a.name)}</span><span class="xa-d">${e(a.description)}</span>${a.note ? `<span class="xa-note">${e(a.note)}</span>` : ''}</span>
        <span class="xa-side">${priceHTML(a, cur)}${chk}</span></span></button>${detailsHTML(a, e)}`;
  };
  const group = c => {
    const its = items.filter(a => a.category === c.id);
    return `<div class="xa-grp${c.id === plateCat ? ' is-adv' : ''}" role="group" aria-labelledby="xag-${e(c.id)}">
      <h3 class="xa-gh" id="xag-${e(c.id)}"><span>${e(c.label)}</span><em class="xa-gc" data-cat="${e(c.id)}" data-n="${its.length}"></em></h3>
      ${its.map(card).join('')}</div>`;
  };
  const [left, right] = columns(A, items);
  const V = A.video && A.video.enabled !== false && A.video.src ? A.video : null;
  const globe = (A.core || {}).showGlobe !== false;
  const coreImg = (A.core || {}).image, bg = V ? {} : (A.background || {});
  return `<section class="sec xc${V ? ' has-video' : ''}${bg.src ? ' has-bg' : ''}${bg.soft ? ' bg-soft-baked' : ''}${bg.band ? ' bg-band-baked' : ''}" id="addons" data-ext="addons" aria-labelledby="addons-title" style="--xc-motion:${X.motionIntensity == null ? 1 : +X.motionIntensity}${bg.src ? `;--xc-bg:url('${e(bg.src)}');${bg.soft ? `--xc-bg-soft:url('${e(bg.soft)}');` : ''}${bg.band ? `--xc-bg-band:url('${e(bg.band)}');` : ''}--xc-bg-o:${bg.opacity == null ? 1 : +bg.opacity}` : ''}">
  ${V ? `<div class="xc-video" aria-hidden="true"><div class="xc-video-in"><video muted loop playsinline preload="metadata"${V.poster ? ` poster="${e(V.poster)}"` : ''}><source src="${e(V.src)}" type="video/mp4"></video><span class="xc-video-shade"></span></div></div>` : ''}
  ${bg.src ? `<div class="xc-bgsoft" aria-hidden="true"></div><div class="xc-bgimg" aria-hidden="true"><i class="bx-glow"></i><i class="bx-beam"></i>${[[21.8, 7.6], [16.5, 11], [83.9, 31], [61.7, 44], [93.5, 44], [15, 29.6]].map(([x, y], i) => `<i class="bx-n" style="left:${x}%;top:${y}%;--t:${(5.2 + (i * 1.7) % 3.4).toFixed(1)}s;--d:${(-i * 1.9).toFixed(1)}s"></i>`).join('')}</div>` : ''}
  <div class="container">
    ${H.head}
    ${basePackages().length ? `<div class="xc-base" role="group" aria-labelledby="xcBaseL"><span class="xc-base-l" id="xcBaseL">${e(tt('Your base package'))}</span>
      <div class="xc-base-o">${[{ id: '', title: tt('None') }, ...basePackages()].map(p => `<button type="button" class="xc-base-b" data-base="${e(p.id)}" aria-pressed="${p.id === basePkg}">${e(p.title)}</button>`).join('')}</div>
      <span class="xc-base-h">${e(tt('Add-ons already included in it are marked automatically and not charged twice.'))}</span></div>` : ''}
    <div class="xc-cfg">
      <svg class="xc-lines" aria-hidden="true"></svg>
      <div class="xc-col xc-col-l">${left.map(group).join('')}</div>
      <aside class="xc-hub" aria-label="${e(T.title || 'Your build')}"><div class="xc-hub-in">
        ${X.coreEnabled === false ? '' : `<div class="xc-core${globe ? '' : ' no-globe'}" data-reveal>
          ${globe ? `<span class="xc-glow" aria-hidden="true"></span>
          <div class="xc-orb-wrap" aria-hidden="true">${coreImg ? `<img class="xc-orb" src="${e(coreImg)}" alt="" decoding="async" draggable="false">` : ''}<span class="xc-inner"></span><span class="xc-flash"></span></div>
          ${coreRings()}
          <span class="xc-veil" aria-hidden="true"></span>` : ''}
          <div class="xc-core-txt"><span class="xc-logo">${H.logoHTML ? H.logoHTML() : 'iTECH'}</span>
            <span class="xc-status" role="status" aria-live="polite"><b class="xc-cnt">00</b><span class="xc-cnt-l">${tt('modules active')}</span></span></div>
        </div>`}
        <div class="xc-sum" data-reveal>
          <div class="xc-sum-h"><h3>${e(T.title || 'Your build')}</h3><span class="xc-sum-c"></span></div>
          <ul class="xc-sum-l"></ul>
          <p class="xc-sum-inc" hidden></p>
          <p class="xc-sum-e">${e(T.emptyText || 'Choose the features you need. Your estimate updates as you go.')}</p>
          <div class="xc-rec" hidden></div>
          <div class="xc-sum-t"><span>${e(T.totalLabel || 'Estimated extras')}</span><b><small class="xc-from" hidden>${tt('From')}</small><span class="xc-one">${fmt(0, cur)}</span></b></div>
          <p class="xc-sum-x"></p>
          <a class="btn btn-primary xc-go" target="_blank" rel="noopener noreferrer">${e(T.ctaLabel || 'Request this setup')} ${ARROW}</a>
          <p class="xc-sum-note">${e(T.disclaimer || '')}</p>
        </div>
      </div></aside>
      <div class="xc-col xc-col-r">${right.map(group).join('')}</div>
    </div>
  </div>
</section>`;
}

function waMessage(C, s) {
  const A = C.addonsConfig, cur = A.currency, pk = basePackages().find(p => p.id === basePkg);
  const L = ["Hello! I'm interested in an iTECH website project.", ''];
  if (pk) L.push('Package:', `${pk.title}${pk.price ? ' — ' + pk.price : ''}`, '');
  if (s.inc && s.inc.length) L.push('Included in the package:', s.inc.map(a => a.name).join(', '), '');
  L.push('Selected add-ons:');
  s.items.forEach(a => L.push(`• ${a.name} — ${priceText(a, cur, true).replace(' / month', '/month')}`));
  if (s.one) L.push('', 'Estimated one-time extras:', `${s.from ? 'From ' : ''}${fmt(s.one, cur)}`);
  if (s.month) L.push('', 'Monthly:', `${fmt(s.month, cur)}/month`);
  if (s.quote) L.push('', 'Custom quote items:', String(s.quote));
  L.push('', "I'd like to discuss the project.");
  return L.join('\n');
}

function mount(root, C) {
  if (inst) inst.destroy();
  if (!H) return;
  const A = C.addonsConfig, X = C.addonsExperienceConfig || {}, cur = A.currency, sel = H.selected, items = list(C), T = A.cart || {};
  const on = k => X[k] !== false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = () => innerWidth > 1099;                       // hub layout (sticky summary + lines)
  const cfg = root.querySelector('.xc-cfg'), svg = root.querySelector('.xc-lines'), core = root.querySelector('.xc-core');
  const cards = [...root.querySelectorAll('.xa')], byId = id => cards.find(c => c.dataset.id === id);
  const sum = root.querySelector('.xc-sum'), sumL = sum.querySelector('.xc-sum-l'), go = sum.querySelector('.xc-go');
  let dead = false, drOpen = false, hot = null, visible = true, lraf = 0;
  const timers = new Set(), later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!dead) fn(); }, ms); timers.add(t); };
  const NS = 'http://www.w3.org/2000/svg', mk = (t, a) => { const el = document.createElementNS(NS, t); for (const k in a) el.setAttribute(k, a[k]); return el; };
  const ringsSvg = root.querySelector('.xc-rings');
  if (ringsSvg && reduced && ringsSvg.pauseAnimations) ringsSvg.pauseAnimations();

  /* ── lines: each module can be wired to the core; drawn for selected + hovered ones ── */
  const lines = new Map();
  if (on('connectorLines') && core) cards.forEach(c => {
    const g = mk('g', { class: 'xl' + (c.classList.contains('xa-adv') ? ' gold' : '') });
    g.append(mk('path', { class: 'xl-p', pathLength: 100 }), mk('path', { class: 'xl-pulse', pathLength: 100 }), mk('circle', { class: 'xl-b', r: 2.4 }));
    svg.appendChild(g); lines.set(c, g);
  });
  function drawLines() {
    lraf = 0;
    if (dead || !lines.size) return;
    const show = wide() && visible;
    svg.classList.toggle('off', !show);
    if (!show) return;
    const box = cfg.getBoundingClientRect(), kr = core.getBoundingClientRect();
    const K = { x: kr.left + kr.width / 2 - box.left, y: kr.top + kr.height / 2 - box.top, r: kr.width * .36 };
    const sr = sum.offsetParent ? sum.getBoundingClientRect() : null;     // the summary panel, when shown
    svg.setAttribute('viewBox', `0 0 ${box.width.toFixed(0)} ${box.height.toFixed(0)}`);
    lines.forEach((g, c) => {
      const picked = sel.has(c.dataset.id) && !c.classList.contains('is-inc'), want = picked || c === hot;
      g.classList.toggle('on', picked); g.classList.toggle('hot', c === hot);
      if (!want) return;
      const r = c.getBoundingClientRect(), inView = r.bottom > 60 && r.top < innerHeight - 20;
      g.classList.toggle('far', !inView);
      const leftSide = r.left + r.width / 2 < kr.left + kr.width / 2;
      const ax = (leftSide ? r.right : r.left) - box.left, ay = r.top + r.height / 2 - box.top;
      // modules level with the globe wire into it; the others into the facing edge of the summary panel
      let ex, ey; const cy = r.top + r.height / 2;
      if (core.classList.contains('no-globe') && (!sr || cy < sr.top - 10)) { ex = (leftSide ? kr.left : kr.right) - box.left; ey = Math.max(kr.top + 16, Math.min(kr.bottom - 16, cy)) - box.top; }   // counter card: wire to its edge
      else if (!sr || cy < sr.top - 10) { const ang = Math.atan2(ay - K.y, ax - K.x); ex = K.x + Math.cos(ang) * K.r; ey = K.y + Math.sin(ang) * K.r; }
      else { ex = (leftSide ? sr.left : sr.right) - box.left; ey = Math.max(sr.top + 28, Math.min(sr.bottom - 28, cy)) - box.top; }
      const dx = (ex - ax) * .5;
      const d = `M${ax.toFixed(1)} ${ay.toFixed(1)}C${(ax + dx).toFixed(1)} ${ay.toFixed(1)} ${(ex - dx).toFixed(1)} ${ey.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      g.children[0].setAttribute('d', d); g.children[1].setAttribute('d', d);
      g.children[2].setAttribute('cx', ex.toFixed(1)); g.children[2].setAttribute('cy', ey.toFixed(1));
    });
  }
  const reqLines = () => { if (!lraf && !dead) lraf = requestAnimationFrame(drawLines); };
  function pulseLine(c) {
    const g = lines.get(c); if (!g || !on('selectionPulse') || reduced || !wide()) return;
    g.classList.remove('go'); void g.getBoundingClientRect(); g.classList.add('go');
  }
  const setHot = c => { if (hot === c) return; hot = c; cfg.classList.toggle('has-hot', !!c); reqLines(); };
  cards.forEach(c => {
    c.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') setHot(c); });
    c.addEventListener('pointerleave', () => { if (hot === c) setHot(null); });
    c.addEventListener('focus', () => setHot(c)); c.addEventListener('blur', () => { if (hot === c) setHot(null); });
  });
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { visible = en.isIntersecting; reqLines(); })) : null;
  if (io) io.observe(cfg);
  /* background video: plays only while the section is on screen; still frame on reduced motion / data saver */
  const vid = root.querySelector('.xc-video video');
  let vio = null;
  if (vid) {
    const nc = navigator.connection || {};
    if (reduced || nc.saveData || /(^|-)2g$/.test(nc.effectiveType || '')) vid.preload = 'none';
    else {
      const play = () => { const p = vid.play(); if (p && p.catch) p.catch(() => { }); };
      vio = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { vid.preload = 'auto'; play(); } else vid.pause(); }), { rootMargin: '200px 0px' }) : null;
      if (vio) vio.observe(root); else play();
    }
  }

  /* ── numbers: Motion tween when available, a small eased fallback otherwise ── */
  const vals = new WeakMap(), stops = new WeakMap();
  function tween(el, to, out) {
    if (!el) return;
    const from = vals.has(el) ? vals.get(el) : to; vals.set(el, to);
    const prev = stops.get(el); if (prev) prev();
    if (reduced || from === to) { el.textContent = out(to); return; }
    const animate = MO();
    if (animate) { const a = animate(from, to, { duration: .7, ease: [.16, 1, .3, 1], onUpdate: v => { el.textContent = out(v); } }); stops.set(el, () => a.stop()); return; }
    const t0 = performance.now(), D = 600; let raf = 0;
    const step = t => { const k = Math.min(1, (t - t0) / D), q = 1 - Math.pow(1 - k, 3); el.textContent = out(from + (to - from) * q); if (k < 1 && !dead) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); stops.set(el, () => cancelAnimationFrame(raf));
    later(() => { el.textContent = out(to); }, D + 80);    // throttled tabs still land on the final value
  }

  /* ── core ── */
  function paintCore(s) {
    if (!core) return;
    core.style.setProperty('--lvl', Math.min(s.count, 8) / 8);
    tween(core.querySelector('.xc-cnt'), s.count, v => pad(Math.round(v)));
    core.querySelector('.xc-cnt-l').textContent = tt(s.count === 1 ? 'module active' : 'modules active');
    root.querySelectorAll('.xc-rings .nd').forEach(n => { const k = +n.dataset.k; n.classList.toggle('base', k < 3); n.classList.toggle('on', k >= 3 && k < 3 + s.count); });
    core.classList.toggle('lv6', s.count >= 6);
  }
  function ping() { if (!core || reduced) return; core.classList.remove('ping'); void core.offsetWidth; core.classList.add('ping'); }

  /* ── recommendation (never auto-selects) — in the hub and in the drawer ── */
  function paintRec() {
    let pick = null, why = null; const inc = included();
    for (const r of (A.recommendations || [])) {
      if (!sel.has(r.when) || inc.has(r.when)) continue;
      const s2 = (r.suggest || []).find(id => !sel.has(id) && !inc.has(id) && items.some(a => a.id === id));
      if (s2) { pick = items.find(a => a.id === s2); why = items.find(a => a.id === r.when); break; }
    }
    document.querySelectorAll('.xc-rec').forEach(rec => {
      if (!pick) { rec.hidden = true; rec.innerHTML = ''; rec.dataset.id = ''; return; }
      if (rec.dataset.id === pick.id && !rec.hidden) return;
      rec.dataset.id = pick.id;
      rec.innerHTML = `<span class="xc-rec-t">${H.esc(tt('Often added with {a}:', { a: why ? why.name : '' }))} <b>${H.esc(pick.name)}</b></span><button type="button" class="xc-rec-b" data-xc="rec" data-id="${H.esc(pick.id)}">${icon('plus')}<span>${tt('Add')}</span></button>`;
      rec.hidden = false;
    });
  }

  /* ── hub summary (desktop) ── */
  const href = s => on('whatsappCheckout') && H.waLink ? H.waLink(waMessage(C, s)) : null;
  function setGo(a, s) {
    const h = href(s);
    if (h) a.href = h; else { a.removeAttribute('href'); a.removeAttribute('target'); a.setAttribute('data-act', 'go'); a.setAttribute('data-target', 'brief'); }
    a.classList.toggle('is-off', !s.count);
    if (s.count) a.removeAttribute('aria-disabled'); else a.setAttribute('aria-disabled', 'true');
  }
  function paintSum(s) {
    sum.classList.toggle('has', s.count > 0);
    sum.querySelector('.xc-sum-c').textContent = s.count ? plural(s.count, 'module', 'modules') : '';
    const ids = s.items.map(a => a.id);
    // keep rows that stay, add new ones (with a soft entrance), drop removed ones
    [...sumL.children].forEach(li => { if (!ids.includes(li.dataset.id)) li.remove(); });
    s.items.forEach((a, i) => {
      let li = sumL.querySelector(`li[data-id="${a.id}"]`);
      if (!li) {
        li = document.createElement('li'); li.dataset.id = a.id;
        li.innerHTML = `<span class="xc-sum-i" aria-hidden="true">${icon(a.icon)}</span><span class="xc-sum-n">${H.esc(a.name)}</span><span class="xc-sum-p">${H.esc(priceText(a, cur))}</span><button type="button" class="xc-rm" data-xc="rm" data-id="${H.esc(a.id)}" aria-label="${H.esc(tt('Remove {x}', { x: a.name }))}">${icon('close')}</button>`;
        const animate = MO(); if (animate && !reduced) animate(li, { opacity: [0, 1], transform: ['translateY(-6px)', 'none'] }, { type: 'spring', visualDuration: .45, bounce: 0 });
      }
      if (sumL.children[i] !== li) sumL.insertBefore(li, sumL.children[i] || null);
    });
    sum.querySelector('.xc-from').hidden = !s.from;
    tween(sum.querySelector('.xc-one'), s.one, v => fmt(v, cur));
    sum.querySelector('.xc-sum-x').textContent = extrasLine(s, cur);
    const incL = sum.querySelector('.xc-sum-inc'), pk = basePackages().find(p => p.id === basePkg);
    incL.hidden = !(pk && s.inc.length);
    if (!incL.hidden) incL.textContent = tt('Included in {p}:', { p: pk.title }) + ' ' + s.inc.map(a => a.name).join(', ');
    setGo(go, s);
  }
  function paintGroups() {
    root.querySelectorAll('.xa-gc').forEach(el => { const inc = included(), n = cards.filter(c => c.dataset.cat === el.dataset.cat && sel.has(c.dataset.id) && !inc.has(c.dataset.id)).length; el.textContent = n ? tt('{n} of {t} added', { n, t: el.dataset.n }) : tt('{t} options', { t: el.dataset.n }); el.classList.toggle('has', n > 0); });
  }

  /* ── build bar + drawer (tablet/phone), fixed to the viewport ── */
  const hud = document.createElement('div'); hud.className = 'xc-bar'; hud.hidden = true;
  const dr = document.createElement('div'); dr.className = 'xc-dr'; dr.hidden = true;
  dr.innerHTML = `<div class="xc-dr-bg" data-xc="close"></div>
    <aside class="xc-dr-p" role="dialog" aria-modal="true" aria-labelledby="xcDrT">
      <header class="xc-dr-h"><h3 id="xcDrT">${H.esc(T.title || 'Your build')}</h3>
        <button type="button" class="xc-x" data-xc="close" aria-label="${H.esc(tt('Close'))}">${icon('close')}</button></header>
      <ul class="xc-dr-l"></ul>
      <div class="xc-rec" hidden></div>
      <div class="xc-dr-s"></div>
      <p class="xc-dr-note">${H.esc(T.disclaimer || '')}</p>
      <div class="xc-dr-a"><button type="button" class="btn btn-ghost" data-xc="clear">${tt('Clear all')}</button><a class="btn btn-primary xc-go" target="_blank" rel="noopener noreferrer">${H.esc(T.ctaLabel || 'Request this setup')} ${ARROW}</a></div>
    </aside>`;
  if (on('cartEnabled')) { document.body.appendChild(hud); document.body.appendChild(dr); }
  const drList = dr.querySelector('.xc-dr-l'), drSum = dr.querySelector('.xc-dr-s'), drGo = dr.querySelector('.xc-go');
  let lastFocus = null;
  hud.innerHTML = `<div class="xc-bar-in">
      <span class="xc-bar-id"><small>${H.esc(T.title || 'Your build')}</small><b><span class="xc-h-n">0</span> <span class="xc-h-l">${tt('modules')}</span></b></span>
      <span class="xc-bar-v"><small>${H.esc(T.totalLabel || 'Estimated extras')}</small><b><span class="xc-h-from">${tt('From')} </span><span class="xc-h-v">${fmt(0, cur)}</span></b></span>
      <button type="button" class="btn btn-primary btn-sm" data-xc="open">${H.esc(T.barLabel || 'Review build')} ${ARROW}</button></div>`;
  function paintHud(s) {
    tween(hud.querySelector('.xc-h-n'), s.count, v => String(Math.round(v)));
    hud.querySelector('.xc-h-l').textContent = tt(s.count === 1 ? 'module' : 'modules');
    const v = hud.querySelector('.xc-bar-v'); v.hidden = !s.one && !s.month;
    hud.querySelector('.xc-h-from').hidden = !s.from;
    if (s.one) tween(hud.querySelector('.xc-h-v'), s.one, x => fmt(x, cur)); else hud.querySelector('.xc-h-v').textContent = s.month ? `${fmt(s.month, cur)} ${tt('/ month')}` : '';
  }
  function renderDrawer(s) {
    drList.innerHTML = s.count ? s.items.map(a => `<li><span class="xc-sum-i" aria-hidden="true">${icon(a.icon)}</span><span class="xc-dr-n">${H.esc(a.name)}<small>${H.esc(priceText(a, cur))}</small></span>
      <button type="button" class="xc-rm" data-xc="rm" data-id="${H.esc(a.id)}" aria-label="${H.esc(tt('Remove {x}', { x: a.name }))}">${icon('close')}</button></li>`).join('')
      : `<li class="xc-empty">${tt('No modules added yet.')}</li>`;
    drSum.innerHTML = `${s.one ? `<div class="big"><span>${H.esc(T.totalLabel || 'Estimated extras')}</span><b>${s.from ? tt('From') + ' ' : ''}${fmt(s.one, cur)}</b></div>` : ''}
      ${s.month ? `<div><span>${tt('Monthly')}</span><b>${fmt(s.month, cur)} ${tt('/ month')}</b></div>` : ''}
      ${s.quote ? `<div><span>${tt('Quoted separately')}</span><b>${plural(s.quote, 'item', 'items')}</b></div>` : ''}
      ${s.inc.length && basePkg ? `<p class="xc-dr-inc">${H.esc(tt('Included in {p}:', { p: (basePackages().find(p => p.id === basePkg) || {}).title || '' }) + ' ' + s.inc.map(a => a.name).join(', '))}</p>` : ''}`;
    setGo(drGo, s);
  }
  const hudVisible = () => on('cartEnabled') && !wide() && summary(C, sel).count > 0 && !drOpen && root.getBoundingClientRect().top < innerHeight * .7 && root.getBoundingClientRect().bottom > innerHeight * .3;
  function placeHud() {
    const v = hudVisible();
    if (v && hud.hidden) { hud.hidden = false; requestAnimationFrame(() => hud.classList.add('show')); }
    else if (!v && !hud.hidden && hud.classList.contains('show')) { hud.classList.remove('show'); later(() => { if (!hudVisible()) hud.hidden = true; }, 380); }
    document.documentElement.classList.toggle('xc-bar-on', v);
  }

  /* ── one update path for everything that reads the selection ── */
  function update(changed, who) {
    const s = summary(C, sel);
    const inc = included();
    cards.forEach(c => {
      const isInc = inc.has(c.dataset.id);
      c.classList.toggle('is-inc', isInc);
      c.setAttribute('aria-pressed', String(sel.has(c.dataset.id) && !isInc));
      if (isInc) c.setAttribute('aria-disabled', 'true'); else c.removeAttribute('aria-disabled');
    });
    paintCore(s); paintSum(s); paintGroups(); paintHud(s); renderDrawer(s); placeHud(); paintRec(); reqLines();
    if (changed) { ping(); if (H.onChange) H.onChange(); }
    if (who && sel.has(who.dataset.id) && !inc.has(who.dataset.id)) {
      pulseLine(who);
      const animate = MO(), ck = who.querySelector('.xa-chk');
      if (animate && ck && !reduced) animate(ck, { transform: ['scale(.7)', 'scale(1)'] }, { type: 'spring', visualDuration: .4, bounce: .3 });
    }
  }
  function toggle(id) { if (included().has(id)) return; sel.has(id) ? sel.delete(id) : sel.add(id); update(true, byId(id)); }
  // base package: add-ons it already contains switch to "Included in package" and leave the total
  root.querySelectorAll('.xc-base-b').forEach(b => b.addEventListener('click', () => {
    basePkg = b.dataset.base;
    root.querySelectorAll('.xc-base-b').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    update(true);
  }));
  cards.forEach(c => c.addEventListener('click', () => toggle(c.dataset.id)));

  /* ── drawer ── */
  function openDrawer() {
    if (!on('cartEnabled')) return;
    lastFocus = document.activeElement; drOpen = true; dr.hidden = false; placeHud();
    document.documentElement.classList.add('xc-lock');
    requestAnimationFrame(() => { dr.classList.add('open'); const x = dr.querySelector('.xc-x'); x && x.focus({ preventScroll: true }); });
  }
  function closeDrawer() {
    if (!drOpen) return; drOpen = false; dr.classList.remove('open');
    document.documentElement.classList.remove('xc-lock');
    later(() => { if (!drOpen) dr.hidden = true; }, 600);
    placeHud(); if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  const onUI = ev => {
    const t = ev.target.closest('[data-xc]'); if (!t) return;
    const a = t.dataset.xc;
    if (a === 'open') openDrawer();
    else if (a === 'close') closeDrawer();
    else if (a === 'clear') { sel.clear(); update(true); }
    else if (a === 'rm') {
      const inDr = dr.contains(t); sel.delete(t.dataset.id); update(true);
      const f = inDr ? (dr.querySelector('.xc-rm') || dr.querySelector('.xc-x')) : (sum.querySelector('.xc-rm') || byId(t.dataset.id)); f && f.focus({ preventScroll: true });
    }
    else if (a === 'rec') { const id = t.dataset.id; if (!sel.has(id)) toggle(id); }
  };
  hud.addEventListener('click', onUI); dr.addEventListener('click', onUI); sum.addEventListener('click', onUI);
  [go, drGo].forEach(g => g.addEventListener('click', ev => { if (g.getAttribute('aria-disabled') === 'true') ev.preventDefault(); }));
  const onKey = ev => {
    if (!drOpen) return;
    if (ev.key === 'Escape') { ev.preventDefault(); closeDrawer(); return; }
    if (ev.key === 'Tab') {
      const f = [...dr.querySelectorAll('button,a[href]')].filter(x => x.offsetParent !== null);
      if (!f.length) return; const first = f[0], last = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', onKey);
  const onScroll = () => { placeHud(); reqLines(); };
  addEventListener('scroll', onScroll, { passive: true });
  let rt = 0;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { if (dead) return; if (wide() && drOpen) closeDrawer(); placeHud(); reqLines(); }, 120); };
  addEventListener('resize', onResize);
  update(false);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!dead) reqLines(); });

  inst = { destroy() {
    dead = true; cancelAnimationFrame(lraf); clearTimeout(rt); timers.forEach(clearTimeout);
    removeEventListener('resize', onResize); removeEventListener('scroll', onScroll);
    document.removeEventListener('keydown', onKey); if (io) io.disconnect(); if (vio) vio.disconnect();
    hud.remove(); dr.remove(); document.documentElement.classList.remove('xc-bar-on', 'xc-lock'); inst = null;
  } };
}

EXT.addons = { render, mount };
})();
