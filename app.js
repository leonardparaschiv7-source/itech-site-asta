/* iTECH — application. Renders every section from window.ITECH_CONFIG and wires interactions.
   Content lives in config.js; this file holds components and behaviour only. */
(function () {
'use strict';

/* ───────────────────────── utilities ───────────────────────── */
const BASE = window.ITECH_CONFIG;
// languages (i18n.js): the config is English; tr() swaps every text for the chosen language, T() does the same for component labels
const I18 = window.ITECH_I18N || { lang: 'en', langs: [], t: s => s, tr: o => o, set() { } };
const T = (s, v) => I18.t(s, v);
let C = I18.tr(JSON.parse(JSON.stringify(BASE)));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = v => esc(v).replace(/\n/g, '<br>');
const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
const lerp = (a, b, t) => a + (b - a) * t;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
const small = () => innerWidth < 761;
const ed = p => ` data-e="${p}"`;
function accentize(text, accent) {
  let h = nl(text);
  if (accent) { const a = esc(accent), i = h.lastIndexOf(a); if (i > -1) h = h.slice(0, i) + `<span class="serif grad-text">${a}</span>` + h.slice(i + a.length); }
  return h;
}
function money(n, cur) { return (cur || '€') + Number(n).toLocaleString('en-US'); }
function getPath(o, p) { return p.split('.').reduce((a, k) => a == null ? a : a[k], o); }
function setPath(o, p, v) { const ks = p.split('.'); let a = o; for (let i = 0; i < ks.length - 1; i++) { if (a[ks[i]] == null) return; a = a[ks[i]]; } a[ks[ks.length - 1]] = v; }
const I = {
  arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  out: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 11l6-6M6 5h5v5"/></svg>',
  check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>',
  minus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 8h8"/></svg>',
  drag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/></svg>',
  spark: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M12 4l-2 2M6 10l-2 2"/></svg>'
};

/* ───────────────────────── state ───────────────────────── */
const S = {
  filter: 'All', w3: { active: 0, hover: null, sep: 1 }, service: 0, serviceOpen: 0, type: 0, addons: new Set(), pkg: null,
  est: { step: 0, type: null, pages: null, features: [], design: null, timeline: null },
  brief: { step: 0, max: 0, estimate: null }, sectionNums: {}
};

/* ───────────────────────── theme, SEO, flags ───────────────────────── */
function applyTheme() {
  const t = C.themeConfig, map = { backgroundPrimary: '--bg', backgroundSecondary: '--bg2', cardBackground: '--card', textPrimary: '--text', textSecondary: '--muted', accentPrimary: '--a1', accentSecondary: '--a2', accentHighlight: '--a3', borderColor: '--line', gradientPrimary: '--grad', fontHeading: '--f-head', fontBody: '--f-body', fontAccent: '--f-accent', borderRadius: '--radius', containerWidth: '--container', sectionSpacing: '--section', cardSpacing: '--gap' };
  Object.entries(map).forEach(([k, v]) => { if (t[k]) root.style.setProperty(v, t[k]); });
  const m = C.motionConfig, motion = m.motionEnabled && !reduced;
  root.classList.toggle('motion', motion);
  root.classList.toggle('anim', motion && m.scrollAnimationsEnabled && 'IntersectionObserver' in window);
  document.body.classList.toggle('grain', !!m.grainEnabled);
}
function applySEO() {
  const s = C.seoConfig; document.title = s.siteTitle;
  const meta = (attr, key, val) => { if (!val) return; let el = document.head.querySelector(`meta[${attr}="${key}"]`); if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); } el.setAttribute('content', val); };
  meta('name', 'description', s.metaDescription); meta('property', 'og:title', s.ogTitle); meta('property', 'og:description', s.ogDescription);
  meta('property', 'og:image', s.ogImage); meta('property', 'og:type', 'website'); meta('name', 'theme-color', s.themeColor);
  if (s.favicon) { let l = document.head.querySelector('link[rel="icon"]'); if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); } l.href = s.favicon; }
}

/* ───────────────────────── shared components ───────────────────────── */
function logoHTML() {
  const b = C.brandConfig;
  if (b.logoImage) return `<img src="${esc(b.logoImage)}" alt="${esc(b.name)}">`;
  return `${b.logoPrefix ? `<span class="logo-mark" aria-hidden="true">${esc(b.logoPrefix)}</span>` : ''}${esc(b.name)}`;
}
function sectionHead(key, h, opts = {}) {
  const n = S.sectionNums[key];
  return `<header class="sec-head">
    <p class="sec-meta mono" data-reveal>${n ? `${(C.sections[key] || {}).hideNumber ? '' : `<b>${n}</b>`}<i></i>` : ''}<span>${esc(h.label)}</span></p>
    <h2 class="sec-title" id="${key}-title" data-reveal${ed(opts.path + '.header.title')}>${accentize(h.title, h.accent)}</h2>
    ${h.intro ? `<p class="sec-intro" data-reveal${ed(opts.path + '.header.intro')}>${nl(h.intro)}</p>` : ''}
  </header>`;
}
function mockHTML(m, mobile) {
  if (!m) return '';
  const nav = m.nav || [];
  const style = `--m-bg:${m.bg};--m-fg:${m.fg};--m-ac:${m.accent};--m-mu:${m.muted || m.fg}`;
  const copy = `<div class="m-copy"><p class="m-k">${esc(m.kicker)}</p><p class="m-h">${esc(m.headline)}</p><div class="m-p"><i style="width:92%"></i><i style="width:68%"></i></div><span class="m-cta">${esc(m.cta)}</span></div>`;
  const items = m.items || [];
  let body;
  if (mobile) body = `<div class="m-img"></div>${copy}`;
  else if (m.layout === 'center') body = `${copy}<div class="m-row"><div class="m-img"></div><div class="m-img alt"></div><div class="m-img soft"></div></div>`;
  else if (m.layout === 'grid') body = `<div class="m-top"><p class="m-h">${esc(m.headline)}</p><p class="m-k">${esc(m.kicker)}</p></div><div class="m-row">${['', 'alt', 'soft'].map((c, i) => `<div class="m-card"><div class="m-img ${c}"></div><b>${esc(items[i] || ['Residence Serra', 'Casa Lume', 'The Orchard'][i])}</b><i></i></div>`).join('')}</div>`;
  else if (m.layout === 'shop') body = `<div class="m-top" style="display:flex;justify-content:space-between;align-items:end"><p class="m-h">${esc(m.headline)}</p><span class="m-cta">${esc(m.cta)}</span></div><div class="m-row">${['soft', '', 'alt', 'soft'].map((c, i) => `<div class="m-card"><div class="m-img ${c}"></div><b>${esc(items[i] || ['Dune vase', 'Tide bowl', 'Ember cup', 'Salt plate'][i])}</b><i></i></div>`).join('')}</div>`;
  else if (m.layout === 'portfolio') body = `${copy}<div class="m-stack"><div class="m-img alt"></div><div class="m-img"></div><div class="m-img soft"></div></div>`;
  else body = `${copy}${m.art === 'laptop' ? laptopHTML() : '<div class="m-img"></div>'}`;
  return `<div class="mock m-${esc(m.layout)}${m.font === 'serif' ? ' m-serif' : ''}${mobile ? ' m-mobile' : ''}" style="${style}">
    <div class="m-nav"><b class="m-brand">${esc(m.brand)}</b><span class="m-links">${nav.slice(0, -1).map(n => `<i>${esc(n)}</i>`).join('')}</span><span class="m-btn">${esc(nav[nav.length - 1] || '')}</span><span class="m-burger"></span></div>
    <div class="m-body">${body}</div></div>`;
}
/* laptop with a code editor and live preview, drawn in the hero mockup */
function laptopHTML() {
  return `<div class="m-laptop" aria-hidden="true"><div class="lp-screen"><div class="lp-ed">
    <div class="lp-bar"><span class="lp-dots"><i></i><i></i><i></i></span><span class="lp-tab">index.html</span><span class="lp-tab on">Hero.tsx</span><span class="lp-tab">styles.css</span></div>
    <div class="lp-main">
      <div class="lp-tree"><b style="width:70%"></b><b style="width:55%;margin-left:12%"></b><b class="on" style="width:60%;margin-left:12%"></b><b style="width:48%;margin-left:12%"></b><b style="width:66%"></b><b style="width:40%;margin-left:12%"></b></div>
      <div class="lp-code">
        <p><span class="ln">1</span><em class="k">import</em> { Section } <em class="k">from</em> <em class="s">'./ui'</em></p>
        <p><span class="ln">2</span></p>
        <p><span class="ln">3</span><em class="k">export function</em> <em class="t">Hero</em>() {</p>
        <p><span class="ln">4</span>&nbsp;&nbsp;<em class="k">return</em> (</p>
        <p><span class="ln">5</span>&nbsp;&nbsp;&nbsp;&nbsp;&lt;<em class="t">Section</em> <em class="a">layout</em>=<em class="s">"split"</em>&gt;</p>
        <p class="cur"><span class="ln">6</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<em class="t">h1</em>&gt;Designed to be seen&lt;/<em class="t">h1</em>&gt;<i class="caret"></i></p>
        <p><span class="ln">7</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<em class="t">Button</em> <em class="a">href</em>=<em class="s">"/start"</em> /&gt;</p>
        <p><span class="ln">8</span>&nbsp;&nbsp;&nbsp;&nbsp;&lt;/<em class="t">Section</em>&gt;</p>
        <p><span class="ln">9</span>&nbsp;&nbsp;)</p>
        <p><span class="ln">10</span>}</p>
      </div>
      <div class="lp-prev"><span class="lp-live">● Live</span><b></b><i></i><i style="width:60%"></i><div class="lp-prev-img"></div><span class="lp-prev-btn"></span></div>
    </div>
    <div class="lp-status"><span>● main</span><span>TypeScript</span><span class="ok">✓ Build passed</span></div>
  </div></div><div class="lp-base"><i></i></div></div>`;
}
/* iTECH client interface on the hero phone — content from config hero.phone */
function itechPhoneHTML() {
  const p = C.hero.phone || {}, b = C.brandConfig;
  return `<div class="ip">
    <div class="ip-top"><b>${b.logoPrefix ? `<span>${esc(b.logoPrefix)}</span>` : ''}${esc(b.name)}</b><i class="ip-burger"></i></div>
    <p class="ip-k">${esc(p.kicker || b.tagline)}</p>
    <p class="ip-h">${accentize(p.headline || '', 'sell.')}</p>
    <div class="ip-card"><span class="ip-lab">${esc(p.projectLabel || '')}</span><b>${esc(p.projectName || '')}</b>
      <div class="ip-prog"><i style="width:${Math.max(0, Math.min(100, +p.progress || 0))}%"></i></div>
      <ul>${(p.stages || []).map(s => `<li class="${esc(s.state)}">${esc(s.label)}</li>`).join('')}</ul></div>
    <span class="ip-cta">${esc(p.cta || '')} →</span>
  </div>`;
}
function projectMedia(p, big) {
  const src = big ? (p.heroImage || p.thumbnail) : p.thumbnail;
  if (src) return `<img src="${esc(src)}" alt="${esc(p.name)} website preview" loading="lazy">`;
  return `<div class="mock-box">${mockHTML(p.mock)}</div>`;
}
const projById = id => C.portfolioConfig.projects.find(p => p.id === id);

/* ───────────────────────── sections ───────────────────────── */
const R = {};

R.hero = () => {
  const h = C.hero, lines = h.headline.split('\n');
  const heroMock = h.mock || { layout: 'split', bg: '#0E1015', fg: '#F4F6FA', accent: '#76B6FF', muted: '#8B90A0', font: 'sans', brand: 'NORTHLINE', kicker: 'Architecture studio', headline: 'Designed\nto be seen.', cta: 'Start a project', nav: ['Work', 'Studio', 'Journal', 'Contact'] };
  const V = h.video && h.video.enabled !== false && h.video.src ? h.video : null;
  return `<section class="hero${V ? ' has-video' : ''}${V && V.hideScene ? ' no-scene' : ''}" id="home" aria-labelledby="hero-title">
  ${V ? `<div class="hero-video" aria-hidden="true"><video muted loop playsinline preload="metadata"${V.poster ? ` poster="${esc(V.poster)}"` : ''}><source src="${esc(V.src)}" type="video/mp4"></video><span class="hero-video-shade"></span></div>` : ''}
  <div class="hero-bg" aria-hidden="true"></div>
  <div class="container hero-grid">
    <div class="hero-copy">
      <p class="eyebrow mono"><span class="dot" aria-hidden="true"></span><span${ed('hero.eyebrow')}>${esc(h.eyebrow)}</span></p>
      <h1 class="hero-title" id="hero-title"${ed('hero.headline')}>${lines.map(l => `<span class="ln"><span>${accentize(l, h.accentWord)}</span></span>`).join('')}</h1>
      <p class="hero-sub"${ed('hero.subheadline')}>${nl(h.subheadline)}</p>
      <div class="hero-ctas">
        <button class="btn btn-primary" data-act="go" data-target="${esc(h.primaryCta.target)}">${esc(h.primaryCta.label)} ${I.arrow}</button>
        <button class="btn btn-ghost" data-act="go" data-target="${esc(h.secondaryCta.target)}">${esc(h.secondaryCta.label)}</button>
      </div>
      <p class="cred mono">${h.credibility.map(c => `<span>${esc(c)}</span>`).join('')}</p>
    </div>
    <div class="hero-scene" id="scene" aria-hidden="true">
      <div class="rig" id="rig">
        <div class="floor"></div>
        <div class="layer ly-back" data-z="-240"><div class="float" style="--fd:11s"><div class="tablet"><div class="tablet-screen"><div class="tab-app">
          <span class="tab-status"><i>9:41</i><i>iTECH</i><i>100%</i></span>
          <div class="app-row"><div class="app-icon">${esc(C.brandConfig.logoPrefix || '')}<span>i</span></div><div><b class="app-name">${esc(C.brandConfig.name)}</b><p class="app-tag">${esc(C.brandConfig.tagline)}</p></div></div>
          <div class="app-tiles"><i></i><i></i><i></i></div>
          <span class="app-load"><i></i></span>
        </div></div></div></div></div>
        <div class="layer ly-main" data-z="0"><div class="float" style="--fd:10s;--fdl:-2s"><div class="browser"><div class="browser-bar"><span class="dots"><i></i><i></i><i></i></span><span class="url">${esc(h.mockupUrl)}</span></div><div class="browser-body"><div class="mock-box">${mockHTML(heroMock)}</div></div></div></div></div>
        <div class="layer ly-tokens" data-z="170"><div class="float" style="--fd:8s;--fdl:-1s"><div class="ui-card"><span class="mono">Color tokens</span><div class="sw"><i style="background:#08090C"></i><i style="background:#F7F8FA"></i><i style="background:#76B6FF"></i><i style="background:#9787FF"></i><i style="background:#7AE7E7"></i></div><div class="type-spec"><b>Aa</b><span class="mono" style="margin:0">Geist · 64 / 72</span></div></div></div></div>
        <div class="layer ly-comp" data-z="120"><div class="float" style="--fd:9s;--fdl:-4s"><div class="ui-card"><span class="mono">Breakpoints</span><div class="bp"><span class="bp-i"><i class="d-m"></i>390</span><span class="bp-i"><i class="d-t"></i>834</span><span class="bp-i on"><i class="d-d"></i>1440</span></div><p class="bp-ok">✓ Designed for every screen</p></div></div></div>
        <div class="layer ly-code" data-z="210"><div class="float" style="--fd:12s;--fdl:-6s"><div class="ui-card"><span class="mono">hero.tsx</span><div class="code"><span class="k">export function</span> <span class="t">Hero</span>() {
  <span class="k">return</span> &lt;<span class="t">Section</span>
    variant=<span class="s">"signature"</span>
    motion=<span class="s">"subtle"</span> /&gt;
}</div></div></div></div>
        <div class="layer ly-phone" data-z="260"><div class="float" style="--fd:9.5s;--fdl:-3s"><div class="phone"><div class="phone-screen">${itechPhoneHTML()}</div></div></div></div>
      </div>

    </div>
  </div>
</section>`;
};

R.trust = () => {
  const icons = [I.spark, I.check, I.arrow, I.check, I.spark, I.arrow];
  return `<section class="trust" aria-label="What every website includes"><div class="container"><ul>${C.trustConfig.items.map((t, i) => `<li><span class="sr">Included: </span>${icons[i % icons.length]}<span${ed('trustConfig.items.' + i)}>${esc(t)}</span></li>`).join('')}</ul></div></section>`;
};

/* ── Selected Work: 3D showcase — renders only from C.portfolioProjects ── */
const showcaseProjects = () => (C.portfolioProjects || []).map((p, idx) => ({ ...p, _idx: idx })).filter(p => p.enabled !== false);
const pad2 = n => String(n).padStart(2, '0');
function siteVars(p) { return `--ws-bg:${p.backgroundColor};--ws-fg:${p.textColor};--ac:${p.accentColor}`; }
function dharmaArt() {
  return `<div class="dh2-arch"><svg viewBox="0 0 100 60" aria-hidden="true"><path d="M14 30 Q50 52 86 30" fill="none" stroke="#3B2C28" stroke-width="1.5" stroke-linecap="round"/><path d="M22 35 l-3 6M32 39.5 l-2 7M42 42 l-1 7.5M52 42.5 l0 7.5M62 41 l1.5 7.5M72 38 l2.5 7M80 34 l3.5 6" stroke="#3B2C28" stroke-width="1.1" stroke-linecap="round"/></svg></div>`;
}
function forgeArt(p) {
  return `<svg class="fg-svg" viewBox="0 0 300 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
    <radialGradient id="fgL" cx="62%" cy="18%" r="75%"><stop offset="0" stop-color="#3A3D42"/><stop offset=".55" stop-color="#16181B"/><stop offset="1" stop-color="#0B0C0E"/></radialGradient>
    <linearGradient id="fgF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A1C1F"/><stop offset="1" stop-color="#0A0B0C"/></linearGradient></defs>
    <rect width="300" height="360" fill="url(#fgL)"/><rect y="262" width="300" height="98" fill="url(#fgF)"/>
    <path d="M0 262H300" stroke="#2A2D31"/><path d="M188 0 L300 0 L300 150 Z" fill="#fff" opacity=".04"/>
    <rect x="34" y="244" width="232" height="5" rx="2" fill="#BDBDBA"/>
    <rect x="58" y="206" width="16" height="82" rx="3" fill="#1C1D20" stroke="#3A3C40"/><rect x="78" y="216" width="11" height="62" rx="2" fill="#232428" stroke="#3A3C40"/>
    <rect x="226" y="206" width="16" height="82" rx="3" fill="#1C1D20" stroke="#3A3C40"/><rect x="211" y="216" width="11" height="62" rx="2" fill="#232428" stroke="#3A3C40"/>
    <ellipse cx="150" cy="292" rx="120" ry="6" fill="#000" opacity=".6"/><rect x="24" y="30" width="2" height="40" fill="${esc(p.accentColor)}"/></svg>`;
}
function aureaArt() {
  return `<svg class="au-svg" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
    <linearGradient id="auS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8E1D5"/><stop offset="1" stop-color="#D6CCBD"/></linearGradient></defs>
    <rect width="400" height="260" fill="url(#auS)"/><rect y="138" width="400" height="30" fill="#A9B8B7" opacity=".75"/>
    <path d="M0 168 C80 150 160 158 240 150 C300 146 360 150 400 146 V260 H0Z" fill="#CBBFAB"/>
    <rect x="40" y="150" width="320" height="6" fill="#EEE8DD"/>
    <rect x="70" y="92" width="250" height="14" fill="#F8F4EE"/><rect x="92" y="106" width="206" height="44" fill="#EFE9DF"/>
    <rect x="104" y="112" width="130" height="32" fill="#2F3436" opacity=".88"/><rect x="246" y="106" width="8" height="44" fill="#E4DCCF"/>
    <rect x="84" y="160" width="190" height="9" fill="#8DB0B4"/>
    <circle cx="332" cy="130" r="18" fill="#6F7462" opacity=".55"/><circle cx="350" cy="138" r="12" fill="#6F7462" opacity=".5"/><circle cx="52" cy="136" r="12" fill="#6F7462" opacity=".45"/></svg>`;
}
function desktopSite(p) {
  if (p.desktopPreview) {
    const c = p.previewCrop;
    if (!c) return `<img class="w3-img" src="${esc(p.desktopPreview)}" alt="" loading="eager" decoding="async" fetchpriority="low">`;
    return `<div class="w3-shot"><img class="w3-img" src="${esc(p.desktopPreview)}" alt="" loading="eager" decoding="async" fetchpriority="low" style="width:${(c.sourceWidth / c.w * 100).toFixed(3)}%;left:${(-c.x / c.w * 100).toFixed(3)}%;top:${(-c.y / c.h * 100).toFixed(3)}%"></div>`;
  }
  const w = p.site || {}, nav = `<nav>${(w.nav || []).map(n => `<span>${esc(n)}</span>`).join('')}</nav>`;
  if (p.template === 'dharma') return `<div class="ws ws-dharma" style="${siteVars(p)}">
    <div class="ws-nav"><span class="dh2-logo">${esc(w.brand)}<small>${esc(w.brandSub)}</small></span>${nav}<span class="dh2-book">Book</span></div>
    <div class="dh2-hero"><div class="dh2-copy"><p class="ws-k">${esc(w.eyebrow)}</p><p class="dh2-h">${esc(w.headline)}</p><p class="dh2-p">${esc(w.text)}</p><div class="dh2-ctas"><span class="dh2-btn">${esc(w.cta)}</span><span class="dh2-link">${esc(w.secondary || '')}</span></div></div>
      <div class="dh2-art"><div class="w3-img">${dharmaArt()}</div>${w.card ? `<div class="dh2-card"><b>${esc(w.card.title)}</b><span>${esc(w.card.meta)}</span></div>` : ''}</div></div>
    <div class="dh2-strip">${(w.items || []).map(it => `<div><b>${esc(it.name)}</b><span>${esc(it.meta)}</span></div>`).join('')}</div></div>`;
  if (p.template === 'forge') return `<div class="ws ws-forge" style="${siteVars(p)}">
    <div class="ws-nav"><span class="fg-logo">${esc(w.brand)}<em>${esc(w.brandSub)}</em></span>${nav}<span class="fg-btn">${esc(w.cta)}</span></div>
    <div class="fg-hero"><div class="fg-copy"><p class="ws-k fg-k"><i></i>${esc(w.eyebrow)}</p><p class="fg-h">${esc(w.headline)}</p><p class="fg-p">${esc(w.text)}</p><span class="fg-cta">${esc(w.cta)} <b>→</b></span></div>
      <div class="fg-art"><div class="w3-img">${forgeArt(p)}</div><span class="fg-tag">${esc(w.tag || '')}</span></div></div>
    <div class="fg-metrics">${(w.metrics || []).map(m => `<div class="fg-m${m.highlight ? ' hl' : ''}"><span>${esc(m.label)}<em>${esc(m.value)}</em></span><i><b style="width:${+m.value || 0}%"></b></i></div>`).join('')}</div></div>`;
  if (p.template === 'aurea') return `<div class="ws ws-aurea" style="${siteVars(p)}">
    <div class="ws-nav"><span class="au-logo">${esc(w.brand)}<small>${esc(w.brandSub)}</small></span>${nav}<span class="au-contact">Enquire</span></div>
    <div class="au-hero"><div class="au-copy"><p class="ws-k">${esc(w.eyebrow)}</p><p class="au-h">${esc(w.headline)}</p><p class="au-p">${esc(w.text)}</p><span class="au-cta">${esc(w.cta)} →</span></div>
      <div class="au-art"><div class="w3-img">${aureaArt()}</div><div class="au-info">${(w.facts || []).map(f => `<span>${esc(f)}</span>`).join('')}<b>${esc(w.property || '')}</b></div></div></div></div>`;
  return `<div class="ws ws-generic" style="${siteVars(p)}"><div class="ws-nav"><b>${esc(w.brand || p.name)}</b>${nav}</div><div class="gen-hero"><p class="ws-k">${esc(w.eyebrow || p.industry)}</p><p class="gen-h">${esc(w.headline || p.name)}</p><span class="gen-cta">${esc(w.cta || 'Discover')}</span></div></div>`;
}
const siteAspect = p => p.desktopPreview && p.previewCrop ? ` style="aspect-ratio:${p.previewCrop.w}/${p.previewCrop.h}"` : '';
function mobileSite(p) {
  if (p.mobilePreview) return `<img src="${esc(p.mobilePreview)}" alt="" style="width:100%;height:100%;object-fit:cover">`;
  const w = p.site || {}, t = p.template;
  const mc = p.mobilePhotoCrop;
  const art = p.desktopPreview && mc ? `<img class="ms-crop" src="${esc(p.desktopPreview)}" alt="" loading="eager" decoding="async" fetchpriority="low" style="width:${(mc.sourceWidth / mc.w * 100).toFixed(3)}%;left:${(-mc.x / mc.w * 100).toFixed(3)}%;top:${(-mc.y / mc.h * 100).toFixed(3)}%">`
    : p.desktopPreview ? `<img class="ms-photo" src="${esc(p.desktopPreview)}" alt="" loading="eager" decoding="async" fetchpriority="low" style="object-position:${esc(p.photoFocus || '75% 50%')}">` : t === 'dharma' ? dharmaArt() : t === 'forge' ? forgeArt(p) : t === 'aurea' ? aureaArt() : '';
  const meta = w.meta || (t === 'forge' ? (w.metrics || []).map(m => m.label) : t === 'aurea' ? (w.facts || []) : t === 'dharma' ? (w.items || []).map(i => i.name) : []);
  return `<div class="ms ms-${esc(t)}${p.mobileStyle ? ' ms-' + esc(p.mobileStyle) : ''}" style="${siteVars(p)}"><div class="ms-nav"><b>${esc(w.brand || p.name)}</b><i class="ms-burger"></i></div>
    <div class="ms-img"${mc && p.desktopPreview ? ` style="height:auto;aspect-ratio:${mc.w}/${mc.h}"` : ''}>${art}</div><p class="ms-k">${esc(w.eyebrow || '')}</p><p class="ms-h">${esc(w.headline || p.name)}</p><span class="ms-cta">${esc(w.cta || '')}</span>
    <div class="ms-meta">${meta.map(m => `<span>${esc(m)}</span>`).join('')}</div></div>`;
}
function w3Info(i) {
  const P = showcaseProjects(), p = P[i]; if (!p) return '';
  const k = `portfolioProjects.${p._idx}`;
  return `<div class="w3-left"><p class="w3-meta"><span class="ph-chip mono">${esc(p.label || T('Concept project'))}</span><span class="mono muted">${esc(p.industry)} · ${esc(p.year)}</span></p>
      <h3 class="w3-name"${ed(k + '.name')}>${esc(p.name)}</h3><p class="w3-type"${ed(k + '.type')}>${esc(p.type)}</p></div>
    <div class="w3-right"><p class="w3-desc"${ed(k + '.description')}>${esc(p.description)}</p><ul class="tags">${(p.services || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <button class="link w3-link" data-act="w3-open" data-i="${i}">${esc(C.portfolioShowcase.viewLabel)} ${I.arrow}</button></div>`;
}
R.work = () => {
  const H = C.portfolioShowcase, P = showcaseProjects();
  if (!P.length) return '';
  S.w3.active = Math.min(S.w3.active, P.length - 1);
  return `<section class="sec work3d" id="work" aria-labelledby="work-title" aria-roledescription="carousel">
  <div class="container">${sectionHead('work', H.header, { path: 'portfolioShowcase' })}</div>
  <div class="w3-stage" id="w3Stage" style="--w3-persp:${+C.portfolio3D.perspective || 1800}px">
    <div class="w3-glow" aria-hidden="true"></div>
    <div class="w3-rig" id="w3Rig">${P.map((p, i) => `<article class="w3-card" data-i="${i}" aria-roledescription="slide" aria-label="${i + 1} of ${P.length}: ${esc(p.name)}">
      <div class="w3-frame${p.scene ? ' w3-scene' : ''}" data-act="w3-card" data-i="${i}">
        ${p.scene ? '' : `<div class="w3-chrome" aria-hidden="true"><i></i><span class="w3-url">${esc(p.slug)}.com</span></div>`}
        <div class="w3-site" role="img" aria-label="${esc(p.name)} homepage preview"${siteAspect(p)}>${desktopSite(p)}</div>
        <button class="w3-view mono" data-act="w3-open" data-i="${i}" tabindex="-1">${esc(H.viewLabel)} ${I.arrow}</button>
      </div>${C.portfolio3D.reflectionEnabled ? '<div class="w3-reflect" aria-hidden="true"></div>' : ''}</article>`).join('')}</div>
    <div class="w3-floor" aria-hidden="true"></div>
  </div>
</section>`;
};
const w3Flat = () => { const P3 = C.portfolio3D; return !P3.enabled || reduced || (small() && !P3.mobileEnabled); };
let w3Shown = -1;
function w3ShowInfo(i) {
  if (i === w3Shown) return; w3Shown = i;
  const box = $('#w3Info'); if (!box) return;
  box.innerHTML = w3Info(i); box.classList.remove('swap'); void box.offsetWidth; box.classList.add('swap'); markEditable();
}
function w3Layout() {
  const stage = $('#w3Stage'); if (!stage) return;
  const P3 = C.portfolio3D, cards = $$('.w3-card', stage), N = cards.length, a = S.w3.active, h = S.w3.hover, flat = w3Flat();
  stage.classList.toggle('flat', flat);
  const cnt = $('#w3Count'); if (cnt) cnt.textContent = `${pad2(a + 1)} / ${pad2(N)}`;
  cards.forEach(c => { const i = +c.dataset.i; c.classList.toggle('is-active', i === a); const v = $('.w3-view', c); if (v) v.tabIndex = (!flat && i === a) ? 0 : -1; });
  if (flat) { cards.forEach(c => { c.style.transform = ''; c.style.opacity = ''; c.style.zIndex = ''; c.classList.remove('is-side', 'is-hover'); }); return; }
  const W = cards[0].offsetWidth, sep = S.w3.sep, half = Math.floor(N / 2);
  cards.forEach(c => {
    const i = +c.dataset.i, d = ((i - a + N + half) % N) - half, ad = Math.abs(d);
    let x = d * P3.sideOffset * W * sep, z = -P3.depth * ad, ry = -d * P3.sideRotation, sc = ad ? P3.sideScale : 1;
    if (h != null) {
      if (i === h) { if (ad) { z = -P3.depth * .3; ry *= .2; sc = lerp(P3.sideScale, 1, .6); } else { sc = P3.hoverScale; z = 30; } }
      else z -= 70;
    }
    c.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    c.style.opacity = ad > 1 ? 0 : 1; c.style.zIndex = i === h ? 10 : 5 - ad;
    c.classList.toggle('is-side', ad > 0); c.classList.toggle('is-hover', i === h);
    c.setAttribute('aria-hidden', ad > 1 ? 'true' : 'false');
  });
}
function w3Go(i, fromScroll) {
  const N = showcaseProjects().length; if (!N) return;
  S.w3.active = (i + N) % N; S.w3.hover = null; w3ShowInfo(S.w3.active); w3Layout();
  if (w3Flat() && !fromScroll) { const rig = $('#w3Rig'), c = $$('.w3-card', rig)[S.w3.active]; if (rig && c) rig.scrollTo({ left: c.offsetLeft - (rig.clientWidth - c.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' }); }
}
function setupW3() {
  const stage = $('#w3Stage'); if (!stage) return;
  w3Shown = S.w3.active; w3Layout();
  // browsers can keep a stale (empty) frame of 3D panels after images decode: redraw once they are ready
  const imgs = $$('img', stage), redraw = () => { S.w3.sep += 0.0001; w3Layout(); requestAnimationFrame(() => { S.w3.sep -= 0.0001; w3Layout(); }); };
  imgs.forEach(img => { if (!img.complete) img.addEventListener('load', () => requestAnimationFrame(redraw), { once: true }); });
  Promise.all(imgs.map(img => img.decode ? img.decode().catch(() => { }) : null)).then(() => requestAnimationFrame(redraw));
  stage.addEventListener('pointerover', e => { if (w3Flat() || e.pointerType === 'touch') return; const c = e.target.closest('.w3-card'); if (!c) return; const i = +c.dataset.i; if (S.w3.hover !== i) { S.w3.hover = i; w3Layout(); } });
  stage.addEventListener('pointerleave', () => { if (S.w3.hover == null) return; S.w3.hover = null; w3Layout(); });
  const rig = $('#w3Rig'); let t = 0;
  rig.addEventListener('scroll', () => { if (!w3Flat()) return; clearTimeout(t); t = setTimeout(() => { const cards = $$('.w3-card', rig), mid = rig.scrollLeft + rig.clientWidth / 2; let best = 0, bd = 1e9; cards.forEach((c, i) => { const dd = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (dd < bd) { bd = dd; best = i; } }); if (best !== S.w3.active) w3Go(best, true); }, 90); }, { passive: true });
  stage.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); w3Go(S.w3.active + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); w3Go(S.w3.active - 1); } });
}
function w3Scroll() {
  const sec = $('#work'); if (!sec || w3Flat()) return;
  const P3 = C.portfolio3D; let sep = 1;
  if (P3.scrollSeparation && root.classList.contains('motion')) { const r = sec.getBoundingClientRect(); const p = clamp01((innerHeight - r.top) / (innerHeight * .9)); sep = lerp(.3, 1, 1 - Math.pow(1 - p, 3)); }
  if (Math.abs(sep - S.w3.sep) > .004) { S.w3.sep = sep; w3Layout(); }
}
function openShowcase(i) {
  const P = showcaseProjects(), p = P[i]; if (!p) return;
  const H = C.portfolioShowcase;
  showModal(`<div class="modal-card w3m">
    <div class="w3m-head"><div><p class="mono muted">${esc(p.label || T('Concept project'))} · ${esc(p.industry)} · ${esc(p.year)}</p><h3 id="modal-title">${esc(p.name)}</h3><p class="w3-type">${esc(p.type)}</p></div><button class="btn btn-ghost btn-sm" data-act="modal-close">${esc(H.closeLabel)}</button></div>
    <div class="w3m-media"><div class="w3m-desk">${p.scene ? '' : `<div class="w3-chrome" aria-hidden="true"><i></i><span class="w3-url">${esc(p.slug)}.com</span></div>`}<div class="w3-site" role="img" aria-label="${esc(p.name)} desktop preview"${siteAspect(p)}>${desktopSite(p)}</div></div>
      <div class="w3m-phone phone" role="img" aria-label="${esc(p.name)} mobile preview"><div class="phone-screen">${mobileSite(p)}</div></div></div>
    <div class="modal-body"><div class="cs"><h4>${esc(T('Overview'))}</h4><p>${esc(p.description)}</p><h4>${esc(T('Design direction'))}</h4><p>${esc(p.direction || '')}</p></div>
      <div class="cs"><h4>${esc(T('Services'))}</h4><ul class="tags">${(p.services || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="muted" style="font-size:13.5px">${esc(T('This is a concept project created by iTECH to show a design direction. It is not client work.'))}</p>
      <button class="btn btn-primary" data-act="go" data-target="brief">${esc(T('Start a similar project'))} ${I.arrow}</button></div></div></div>`);
}

R.services = () => {
  const V = C.servicesConfig;
  return `<section class="sec" id="services" aria-labelledby="services-title"><div class="container">
    ${sectionHead('services', V.header, { path: 'servicesConfig' })}
    <div class="svc-layout">
      <ul class="svc-list" role="tablist" aria-orientation="vertical" aria-label="Services">${V.items.map((s, i) => `<li class="svc-item${S.serviceOpen === i ? ' open' : ''}">
        <button class="svc-btn" role="tab" id="svc-tab-${i}" aria-selected="${S.service === i}" aria-controls="svc-panel" data-act="svc" data-i="${i}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(s.name)}</span>${I.arrow}</button>
        <div class="svc-inline"><div>${servicePane(i)}</div></div></li>`).join('')}</ul>
      <div class="svc-panel glass" id="svc-panel" role="tabpanel" aria-labelledby="svc-tab-${S.service}">${servicePane(S.service)}</div>
    </div></div></section>`;
};
function servicePane(i) {
  const V = C.servicesConfig, s = V.items[i], p = `servicesConfig.items.${i}`;
  return `<div class="svc-pane">
    <h3${ed(p + '.name')}>${esc(s.name)}</h3>
    <p${ed(p + '.summary')}>${esc(s.summary)}</p>
    <div class="use"><span class="mono">Ideal for</span><span${ed(p + '.useCase')}>${esc(s.useCase)}</span></div>
    <ul class="checks">${s.features.map(f => `<li>${I.check}<span>${esc(f)}</span></li>`).join('')}</ul>
    <div class="price-line"><b>${s.priceFrom != null ? `<small>Starting from</small>${money(s.priceFrom, V.currency)}` : `<small>Pricing</small>${esc(V.priceNote)}`}</b>
      <button class="btn btn-ghost btn-sm" data-act="est-type" data-type="${esc(s.estimatorType || '')}">Estimate this ${I.arrow}</button></div>
  </div>`;
}

R.why = () => {
  if (window.ITECH_EXT && window.ITECH_EXT.why && C.whyITechFeatures) return window.ITECH_EXT.why.render(C, extHelpers(), S.sectionNums.why);
  const W = C.whyConfig, n = S.sectionNums.why;
  return `<section class="sec why" id="why" aria-labelledby="why-title"><div class="container">
    <p class="sec-meta mono" data-reveal style="margin-bottom:28px">${n ? `<b>${n}</b><i></i>` : ''}<span>${esc(W.header.label)}</span></p>
    <h2 class="why-title" id="why-title" data-reveal><span${ed('whyConfig.header.title')}>${esc(W.header.title)}</span> <span class="serif"${ed('whyConfig.header.accentLine')}>${esc(W.header.accentLine)}</span></h2>
    <ul class="why-grid">${W.items.map((it, i) => `<li class="why-item" data-reveal><span class="mono">${String(i + 1).padStart(2, '0')}</span><h3${ed(`whyConfig.items.${i}.title`)}>${esc(it.title)}</h3><p${ed(`whyConfig.items.${i}.text`)}>${esc(it.text)}</p></li>`).join('')}</ul>
  </div></section>`;
};

R.websiteTypes = () => {
  const T = C.websiteTypesConfig;
  return `<section class="sec" id="types" aria-labelledby="websiteTypes-title"><div class="container">
    ${sectionHead('websiteTypes', T.header, { path: 'websiteTypesConfig' })}
    <div class="tabs" role="tablist" aria-label="Website types">${T.types.map((t, i) => `<button class="tab" role="tab" id="type-tab-${i}" aria-selected="${S.type === i}" aria-controls="type-panel" tabindex="${S.type === i ? 0 : -1}" data-act="type" data-i="${i}">${esc(t.label)}</button>`).join('')}</div>
    <div class="types-panel" id="type-panel" role="tabpanel" aria-labelledby="type-tab-${S.type}">${typePanel(S.type)}</div>
    <p class="types-note" style="margin-top:28px">${esc(T.note)}</p>
  </div></section>`;
};
function typePanel(i, swap) {
  const T = C.websiteTypesConfig, t = T.types[i], p = projById(t.mockRef);
  return `<div class="types-media"><div class="types-frame${swap ? ' swap' : ''}">${p ? projectMedia(p) : ''}</div></div>
    <div class="types-info${swap ? ' swap' : ''}">
      <h3${ed(`websiteTypesConfig.types.${i}.title`)}>${esc(t.title)}</h3>
      <p${ed(`websiteTypesConfig.types.${i}.description`)}>${esc(t.description)}</p>
      <ul class="checks">${t.features.map(f => `<li>${I.check}<span>${esc(f)}</span></li>`).join('')}</ul>
      <dl class="scope"><div><dt class="mono">Typical scope</dt><dd>${esc(t.scope.pages)}</dd></div><div><dt class="mono">Typical timeline</dt><dd>${esc(t.scope.timeline)}</dd></div><div><dt class="mono">Best for</dt><dd>${esc(t.scope.bestFor)}</dd></div></dl>
      <div><button class="btn btn-primary btn-sm" data-act="est-type" data-type="${esc({ business: 'business', ecommerce: 'store', landing: 'landing', portfolio: 'portfolio', booking: 'booking', custom: 'custom' }[t.id] || '')}">Estimate a ${esc(t.label.toLowerCase())} project ${I.arrow}</button></div>
    </div>`;
}

// packages: text and prices in the visitor's language (packagesConfig.pricing.en / ro / de).
// Read from config.js as written (not through the translation list): these are fixed market prices.
const pricingL = () => { const P = BASE.packagesConfig.pricing || {}; return P[I18.lang] || P.en || null; };
function localPrice(L, P) {
  if (!P.launchPrice) return `<div class="price is-quote"><span class="mono">${esc(L.quoteLabel || T('Pricing'))}</span><b>${esc(P.priceLabel || T("Let's talk"))}</b>${P.priceNote ? `<small>${esc(P.priceNote)}</small>` : ''}</div>`;
  const off = C.packagesConfig.launchOffer, deal = !!(P.oldPrice && (!off || off.enabled !== false));
  return `<div class="price${deal ? ' has-offer' : ''}"><span class="price-tag">${esc(L.priceLabel || '')}</span>
      ${deal ? `<s class="price-was">${esc(P.oldPrice)}</s>` : ''}<b>${esc(P.launchPrice)}</b>${deal && P.savings ? `<span class="pkg-save mono">${esc(P.savings)}</span>` : ''}</div>`;
}
const pkgFeature = f => { const [t, note] = Array.isArray(f) ? f : [f]; return `<li>${I.check}<span>${esc(t)}${note ? `<small class="pkg-fnote">${esc(note)}</small>` : ''}</span></li>`; };
function pkgExcluded(label, list) {
  if (!list || !list.length) return '';
  const ul = `<ul class="checks">${list.map(f => `<li class="x">${I.minus}<span>${esc(f)}</span></li>`).join('')}</ul>`;
  // a long list stays folded so the cards keep a calm, even rhythm
  return list.length > 6 ? `<details class="pkg-ex"><summary class="mono">${esc(label)} <span>(${list.length})</span></summary>${ul}</details>`
    : `<div class="pkg-ex"><p class="mono">${esc(label)}</p>${ul}</div>`;
}
function priceBlock(pk, cur) {
  const pr = pk.price || { type: 'hidden' };
  if (pr.type === 'hidden') return '';
  let main, lab = pk.pricePrefix || '';
  if (pr.type === 'from') { main = money(pr.amount, cur); lab = lab || 'From'; }
  else if (pr.type === 'range') main = `${money(pr.min, cur)}–${money(pr.max, cur).replace(cur, '')}`;
  else if (pr.type === 'fixed') main = money(pr.amount, cur);
  else { main = esc(pr.label || 'Custom quote'); lab = lab || 'Pricing'; }
  const L = C.packagesConfig.launchOffer;
  if (L && L.enabled && pr.type === 'from' && pk.launchPrice && pk.launchPrice < pr.amount)   // founding client offer
    return `<div class="price has-offer"><span class="price-top"><span class="mono">${esc(lab || T('Price'))}</span><span class="pkg-save mono">${esc(T('Save {x}', { x: money(pr.amount - pk.launchPrice, cur) }))}</span></span>
      <s class="price-was" aria-label="Regular price ${money(pr.amount, cur)}">${money(pr.amount, cur)}</s><b>${money(pk.launchPrice, cur)}</b>
      <small><span class="price-tag">${esc(L.priceLabel || 'Launch price')}</span>${pk.billingLabel ? ` · ${esc(pk.billingLabel)}` : ''}</small></div>`;
  return `<div class="price"><span class="mono">${esc(lab || T('Price'))}</span><b>${main}</b>${pk.billingLabel ? `<small>${esc(pk.billingLabel)}</small>` : pr.type === 'quote' ? `<small>${esc(T('Tailored to your project'))}</small>` : ''}</div>`;
}
// WhatsApp: one number (packagesConfig.whatsappNumber), one link builder
const WA_ICON = '<svg class="wa-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.8.72.7 5.8.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.3l5.69-1.49a11.33 11.33 0 0 0 5.76 1.47h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.02"/></svg>';
const waLink = (msg) => `https://wa.me/${encodeURIComponent(String(C.packagesConfig.whatsappNumber || '').replace(/\D/g, ''))}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
R.packages = () => {
  const K = C.packagesConfig, L = pricingL(), off = K.launchOffer;
  const items = K.items.map((pk, idx) => ({ pk, idx, P: L && L.packages && L.packages[pk.id] })).filter(x => x.pk.enabled !== false);
  const O = L && L.offer ? L.offer : off;
  return `<section class="sec" id="packages" aria-labelledby="packages-title"><div class="container">
    ${sectionHead('packages', K.header, { path: 'packagesConfig' })}
    ${K.brandLine ? `<p class="pkg-brand"><span class="logo" aria-hidden="true">${logoHTML()}</span><span class="mono">${esc(K.brandLine)}</span></p>` : ''}
    ${off && off.enabled && O ? `<div class="pkg-offer" data-reveal>
      <div class="pkg-offer-main"><span class="pkg-offer-k mono"><i aria-hidden="true"></i>${esc(O.label)}</span>${L && L.offer ? `<div class="pkg-offer-copy"><p>${esc(O.text)}</p>${O.bonus ? `<p class="pkg-offer-sub">${esc(O.bonus)}</p>` : ''}</div>` : `<p>${esc(O.text)}</p>`}</div>
      ${L && L.offer ? ''
        : `<div class="pkg-offer-side">${off.bonus ? `<span class="pkg-offer-bonus mono">${esc(off.bonus)}</span>` : ''}${off.availability ? `<span class="pkg-offer-av mono">${esc(off.availability)}${off.note ? ` · <em>${esc(off.note)}</em>` : ''}</span>` : ''}</div>`}
    </div>` : ''}
    <div class="pkg-grid">${items.map(({ pk, idx, P }) => {
      const name = P ? P.title : pk.name, cta = P ? P.cta : pk.ctaLabel, badge = P ? P.badge : pk.badge, msg = P && P.whatsappMessage || pk.whatsappMessage;
      return `<article class="pkg lit${pk.featured ? ' featured' : ''}${pk.price && pk.price.type === 'quote' ? ' is-custom' : ''}" data-reveal>
      ${badge ? `<span class="badge">${esc(badge)}</span>` : ''}
      <div><h3 class="pkg-name"${P ? '' : ed(`packagesConfig.items.${idx}.name`)}>${esc(name)}</h3><p class="pkg-sub"${P ? '' : ed(`packagesConfig.items.${idx}.subtitle`)}>${esc(P ? P.subtitle : pk.subtitle)}</p></div>
      ${P ? localPrice(L, P) : priceBlock(pk, K.currency)}
      <ul class="checks">${(P ? P.features : pk.features).map(pkgFeature).join('')}${P ? '' : (pk.excludedFeatures || []).map(f => `<li class="x">${I.minus}<span>${esc(f)}</span></li>`).join('')}</ul>
      ${P ? pkgExcluded(P.excludedLabel || L.notIncluded, P.excluded) : ''}
      ${K.whatsappNumber ? `<a class="btn pkg-cta ${pk.featured ? 'btn-primary' : 'btn-ghost'}" href="${esc(waLink(msg))}" target="_blank" rel="noopener noreferrer" aria-label="${esc(cta)}: ${esc(name)} (WhatsApp)">${WA_ICON}<span>${esc(cta)}</span>${I.arrow}</a>`
        : `<button class="btn ${pk.featured ? 'btn-primary' : 'btn-ghost'}" data-act="package" data-id="${esc(pk.id)}" data-target="${esc(pk.ctaTarget || 'brief')}">${esc(cta)} ${I.arrow}</button>`}
    </article>`; }).join('')}</div>
    ${K.whatsappNumber && K.contactStrip ? `<div class="pkg-wa-strip"><div><p class="mono">${esc(K.contactStrip.title)}</p><p>${esc(K.contactStrip.text)}</p></div>
      <a class="pkg-wa-num" href="${esc(waLink(''))}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ${esc(K.whatsappDisplay)} (opens in a new tab)">${WA_ICON}<span>${esc(K.whatsappDisplay || K.whatsappNumber)}</span>${I.arrow}</a></div>` : ''}
    <p class="pkg-note"${L && L.note ? '' : ed('packagesConfig.note')}>${esc(L && L.note || K.note)}</p>
  </div></section>`;
};

function addonPrice(a, cur) {
  if (a.price == null || a.priceType === 'quote' || a.priceType === 'on_request') return 'On request';
  if (a.priceType === 'from') return 'From ' + money(a.price, cur);
  if (a.priceType === 'monthly') return money(a.price, cur) + ' / month';
  return money(a.price, cur);
}
R.addons = () => {
  const A = C.addonsConfig;
  if (window.ITECH_EXT && window.ITECH_EXT.addons && C.addonsExperienceConfig && C.addonsExperienceConfig.enabled !== false)
    return window.ITECH_EXT.addons.render(C, { ...extHelpers(), head: sectionHead('addons', A.header, { path: 'addonsConfig' }), selected: S.addons, onChange: updateAddonHint, waLink, logoHTML,
      pkg: () => S.pkg ? C.packagesConfig.items.find(p => p.id === S.pkg) : null }, S.sectionNums.addons);
  return `<section class="sec" id="addons" aria-labelledby="addons-title"><div class="container">
    ${sectionHead('addons', A.header, { path: 'addonsConfig' })}
    <div class="addon-grid">${A.items.filter(a => a.enabled !== false).map(a => `<button class="addon lit" data-act="addon" data-id="${esc(a.id)}" aria-pressed="${S.addons.has(a.id)}"><b>${esc(a.name)}</b><span>${esc(a.description)}</span><em>${esc(addonPrice(a, A.currency))}</em></button>`).join('')}</div>
    <div class="addon-bar" id="addonBar" aria-live="polite">${addonBar()}</div>
  </div></section>`;
};
function addonBar() {
  const n = S.addons.size;
  if (!n) return `<span>Nothing selected yet. Tap any add-on to include it in your brief.</span>`;
  return `<span><b>${n} add-on${n > 1 ? 's' : ''} selected.</b> ${n > 1 ? 'They are' : 'It is'} included in your project brief.</span><span style="display:flex;gap:16px"><button class="link" data-act="addons-clear">Clear</button><button class="link" data-act="go" data-target="brief">Go to brief ${I.arrow}</button></span>`;
}

/* estimator */
const EST_STEPS = ['type', 'pages', 'features', 'design', 'timeline'];
function estimate(e) {
  const E = C.estimatorConfig;
  if (!e.type) return null;
  let v = E.baseWebsitePrices[e.type] || 0;
  if (e.pages) v += E.pagePricing[e.pages] || 0;
  e.features.forEach(f => { v += E.featurePricing[f] || 0; });
  if (e.design) v *= E.designLevelMultipliers[e.design] || 1;
  if (e.timeline) v *= E.timelineMultipliers[e.timeline] || 1;
  v = Math.max(v, E.minimumProjectPrice);
  const r = E.roundTo || 50;
  return { lo: Math.max(E.minimumProjectPrice, Math.round(v * (1 - E.rangeVariance) / r) * r), hi: Math.round(v * (1 + E.rangeVariance) / r) * r };
}
const fmtRange = (x, cur) => x ? `${money(x.lo, cur)} – ${money(x.hi, cur)}` : '—';
const optLabel = (list, id) => (list.find(o => o.id === id) || {}).label || '';
R.estimator = () => {
  const E = C.estimatorConfig, O = E.options, e = S.est;
  const radios = (name, list, sel, withText) => `<div class="opts">${list.map(o => `<label class="opt"><input type="radio" name="${name}" value="${esc(o.id)}"${sel === o.id ? ' checked' : ''}><span>${esc(o.label)}${withText && o.text ? `<small>${esc(o.text)}</small>` : ''}</span></label>`).join('')}</div>`;
  const qs = ['What type of website do you need?', 'How many pages?', 'Select functionality.', 'Design level.', 'Timeline.'];
  return `<section class="sec" id="estimator" aria-labelledby="estimator-title"><div class="container">
    ${sectionHead('estimator', E.header, { path: 'estimatorConfig' })}
    <div class="est glass" data-reveal>
      <div class="est-main">
        <div class="est-prog mono"><span id="estCount">Step ${Math.min(e.step + 1, 5)} of 5</span><span class="est-dots">${EST_STEPS.map((_, i) => `<i class="${i <= e.step ? 'on' : ''}"></i>`).join('')}</span></div>
        <form id="estForm" novalidate>
          <fieldset class="est-step" data-step="0"${e.step !== 0 ? ' hidden' : ''}><legend class="est-q">${qs[0]}</legend>${radios('type', O.types, e.type)}</fieldset>
          <fieldset class="est-step" data-step="1"${e.step !== 1 ? ' hidden' : ''}><legend class="est-q">${qs[1]}</legend>${radios('pages', O.pages, e.pages)}</fieldset>
          <fieldset class="est-step" data-step="2"${e.step !== 2 ? ' hidden' : ''}><legend class="est-q">${qs[2]}</legend><p class="hint">Choose any that apply, or none.</p><div class="opts">${O.features.map(o => `<label class="opt"><input type="checkbox" name="features" value="${esc(o.id)}"${e.features.includes(o.id) ? ' checked' : ''}><span>${esc(o.label)}</span></label>`).join('')}</div></fieldset>
          <fieldset class="est-step" data-step="3"${e.step !== 3 ? ' hidden' : ''}><legend class="est-q">${qs[3]}</legend>${radios('design', O.designLevels, e.design, true)}</fieldset>
          <fieldset class="est-step" data-step="4"${e.step !== 4 ? ' hidden' : ''}><legend class="est-q">${qs[4]}</legend>${radios('timeline', O.timelines, e.timeline, true)}</fieldset>
          <div class="est-step est-final" data-step="5"${e.step !== 5 ? ' hidden' : ''}>
            <p class="mono muted">Estimated project range</p>
            <p class="big" id="estBig">${fmtRange(estimate(e), E.currency)}</p>
            <p class="est-disc"${ed('estimatorConfig.disclaimer')}>${esc(E.disclaimer)}</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap"><button type="button" class="btn btn-primary" data-act="est-continue">${esc(E.ctaLabel)} ${I.arrow}</button><button type="button" class="btn btn-ghost" data-act="est-reset">Start over</button></div>
          </div>
        </form>
        <div class="est-nav"${e.step === 5 ? ' hidden' : ''}><button class="btn btn-ghost btn-sm" data-act="est-back"${e.step === 0 ? ' disabled' : ''}>Back</button><p class="err" id="estErr" role="alert"></p><button class="btn btn-primary btn-sm" data-act="est-next">${e.step === 4 ? 'See estimate' : 'Next'} ${I.arrow}</button></div>
      </div>
      <aside class="est-side" aria-label="Your selections">
        <p class="mono muted">Your project</p>
        <dl class="est-sum">
          <div><dt>Type</dt><dd>${esc(optLabel(O.types, e.type)) || '—'}</dd></div>
          <div><dt>Pages</dt><dd>${esc(optLabel(O.pages, e.pages)) || '—'}</dd></div>
          <div><dt>Functionality</dt><dd>${e.features.length ? esc(e.features.map(f => optLabel(O.features, f)).join(', ')) : '—'}</dd></div>
          <div><dt>Design level</dt><dd>${esc(optLabel(O.designLevels, e.design)) || '—'}</dd></div>
          <div><dt>Timeline</dt><dd>${esc(optLabel(O.timelines, e.timeline)) || '—'}</dd></div>
        </dl>
        <div class="est-range" aria-live="polite"><span class="mono muted">${e.step === 5 ? 'Estimated range' : 'Current estimate'}</span><b>${fmtRange(estimate(e), E.currency)}</b></div>
        <p class="est-disc">${esc(E.disclaimer)}</p>
      </aside>
    </div>
  </div></section>`;
};
function refreshEstimator(focusStep) {
  const sec = $('#estimator'); if (!sec) return;
  const html = R.estimator(), tmp = document.createElement('div'); tmp.innerHTML = html;
  const next = tmp.firstElementChild; next.className = sec.className;
  $$('[data-reveal]', next).forEach(el => el.classList.add('in'));
  sec.replaceWith(next);
  const st = $(`#estimator .est-step[data-step="${S.est.step}"]`);
  if (st) { st.classList.add('show'); if (focusStep) { const f = $('input', st) || $('button', st); f && f.focus({ preventScroll: true }); } }
}
function readEst() {
  const f = $('#estForm'); if (!f) return;
  const fd = new FormData(f);
  S.est.type = fd.get('type') || S.est.type; S.est.pages = fd.get('pages') || S.est.pages;
  if (S.est.step === 2) S.est.features = fd.getAll('features');
  S.est.design = fd.get('design') || S.est.design; S.est.timeline = fd.get('timeline') || S.est.timeline;
}

R.process = () => {
  const P = C.processConfig;
  if (window.ITECH_EXT && window.ITECH_EXT.process) return window.ITECH_EXT.process.render(C, { ...extHelpers(), head: sectionHead('process', P.header, { path: 'processConfig' }), ed }, S.sectionNums.process);
  return `<section class="sec" id="process" aria-labelledby="process-title"><div class="container proc">
    <div class="proc-sticky">${sectionHead('process', P.header, { path: 'processConfig' })}<div class="proc-now" aria-hidden="true"><b class="grad-text" id="procNum">01</b><span id="procName">${esc(P.steps[0].title)}</span></div></div>
    <ol class="proc-list" id="procList"><li class="proc-line" aria-hidden="true"><i></i></li>${P.steps.map((s, i) => `<li class="proc-step${i === 0 ? ' on' : ''}"><span class="mono">${String(i + 1).padStart(2, '0')}</span><h3${ed(`processConfig.steps.${i}.title`)}>${esc(s.title)}</h3><p${ed(`processConfig.steps.${i}.text`)}>${esc(s.text)}</p></li>`).join('')}</ol>
  </div></section>`;
};

R.comparison = () => {
  const K = C.comparisonConfig, p = projById(K.afterMockRef);
  const name = p ? p.name : 'Your business';
  return `<section class="sec" id="compare" aria-labelledby="comparison-title"><div class="container">
    ${sectionHead('comparison', K.header, { path: 'comparisonConfig' })}
    <div class="cmp-tags" data-reveal><span class="cmp-lbl l mono">${esc(K.beforeLabel)}</span><span class="cmp-lbl r mono">${esc(K.afterLabel)}</span></div>
    <div class="cmp" id="cmp" data-reveal data-cursor="Drag" data-cursor-style="soft">
      ${K.beforeImage ? `<div class="cmp-layer cmp-img cmp-before-img"><img src="${esc(K.beforeImage)}" alt="${esc(K.beforeLabel)}" loading="lazy" decoding="async" draggable="false"></div>` : `<div class="cmp-layer"><div class="gen"><div class="gen-top"><b>${esc(name)} Company</b><span>Home</span><span>About Us</span><span>Services</span><span>Contact Us</span></div><div class="gen-banner">Welcome To Our Website!</div><div class="gen-cols"><div><h5>Our Services</h5><i></i><i></i><i style="width:60%"></i></div><div><h5>Why Choose Us?</h5><i></i><i style="width:80%"></i><i></i></div><div><h5>Latest News</h5><i></i><i></i><i style="width:40%"></i></div></div><div class="gen-foot"><span>Call us today!!</span><b>CLICK HERE</b><span>© All rights reserved</span></div><div class="gen-pop">Subscribe to our newsletter!!! ✕</div></div></div>`}
      ${K.afterImage ? `<div class="cmp-layer cmp-after cmp-img"><img src="${esc(K.afterImage)}" alt="${esc(K.afterLabel)}" loading="lazy" decoding="async" draggable="false"></div>` : `<div class="cmp-layer cmp-after">${p ? mockHTML(p.mock) : ''}</div>`}
      <input class="cmp-range" type="range" min="0" max="100" value="50" aria-label="Compare: drag to reveal the ${esc(K.beforeLabel)} or the ${esc(K.afterLabel)}">
      <div class="cmp-handle" aria-hidden="true"><span>${I.drag}</span></div>
    </div>
  </div></section>`;
};

R.about = () => {
  const A = C.aboutConfig, c = C.contactConfig;
  const details = A.details.filter(d => d.value);
  if (c.email) details.push({ label: 'Email', value: c.email });
  return `<section class="sec" id="about" aria-labelledby="about-title"><div class="container">
    ${sectionHead('about', A.header, { path: 'aboutConfig' })}
    <div class="about-grid">
      <p class="about-statement" data-reveal${ed('aboutConfig.statement')}>${esc(A.statement)}</p>
      <div class="about-side" data-reveal>
        <div class="about-story">${A.story.map((s, i) => `<p${ed('aboutConfig.story.' + i)}>${esc(s)}</p>`).join('')}</div>
        <dl class="details">${details.map(d => `<div><dt>${esc(d.label)}</dt><dd>${esc(d.value)}</dd></div>`).join('')}</dl>
        <div class="socials">${C.socialConfig.map(s => `<a class="link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ${I.out}</a>`).join('')}</div>
      </div>
    </div>
  </div></section>`;
};

R.testimonials = () => {
  const T = C.testimonialConfig;
  if (!T.showTestimonials) return '';
  if (window.ITECH_EXT && window.ITECH_EXT.reviews) return window.ITECH_EXT.reviews.render(C, { ...extHelpers(), head: sectionHead('testimonials', T.header, { path: 'testimonialConfig' }), ed, waLink }, S.sectionNums.testimonials);
  return '';
};

R.faq = () => {
  const F = C.faqConfig;
  return `<section class="sec" id="faq" aria-labelledby="faq-title"><div class="container faq-layout">
    ${sectionHead('faq', F.header, { path: 'faqConfig' })}
    <div class="faq-list">${F.items.map((f, i) => `<div class="faq-item" data-reveal><h3><button class="faq-q" data-act="faq" aria-expanded="false" aria-controls="faq-a-${i}" id="faq-q-${i}"><span>${esc(f.q)}</span><span class="pm" aria-hidden="true"></span></button></h3><div class="faq-a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}"><div><p${ed(`faqConfig.items.${i}.a`)}>${esc(f.a)}</p></div></div></div>`).join('')}</div>
  </div></section>`;
};

/* project brief */
const BRIEF_STEPS = ['About you', 'Project type', 'Project scope', 'Budget', 'Timeline', 'Project details', 'Review'];
R.projectBrief = () => {
  const B = C.briefConfig, O = C.estimatorConfig.options;
  const radios = (name, list, req) => `<div class="opts">${list.map(o => `<label class="opt"><input type="radio" name="${name}" value="${esc(o.id)}"${req ? ' required' : ''}><span>${esc(o.label)}</span></label>`).join('')}</div>`;
  return `<section class="sec" id="brief" aria-labelledby="projectBrief-title"><div class="container">
    ${sectionHead('projectBrief', B.header, { path: 'briefConfig' })}
    <div class="brief">
      <nav class="brief-steps" id="briefSteps" aria-label="Brief steps">${BRIEF_STEPS.map((s, i) => `<button type="button" data-act="brief-goto" data-step="${i}"><i>${String(i + 1).padStart(2, '0')}</i><span>${s}</span></button>`).join('')}</nav>
      <div class="brief-panel glass" id="briefPanel">
        <div><div class="brief-top mono"><span id="briefCount">Step 1 of 7</span><span id="briefName">${BRIEF_STEPS[0]}</span></div><div class="brief-bar" style="margin-top:12px"><i id="briefBar"></i></div></div>
        <form id="briefForm" novalidate>
          <fieldset class="brief-step" data-step="0"><legend>About you.</legend>
            <div class="fields">
              <div class="field"><label for="b-name">Name</label><input class="input" id="b-name" name="customer" autocomplete="name" required></div>
              <div class="field"><label for="b-company">Company / brand <em>(optional)</em></label><input class="input" id="b-company" name="company" autocomplete="organization"></div>
              <div class="field"><label for="b-email">Email</label><input class="input" id="b-email" name="email" type="email" autocomplete="email" required></div>
              <div class="field"><label for="b-phone">Phone <em>(optional)</em></label><input class="input" id="b-phone" name="phone" type="tel" autocomplete="tel"></div>
            </div></fieldset>
          <fieldset class="brief-step" data-step="1" hidden><legend>What are we building?</legend><p class="hint" id="pkgHint" hidden></p>${radios('projectType', B.projectTypes, true)}</fieldset>
          <fieldset class="brief-step" data-step="2" hidden><legend>Project scope.</legend>
            <div class="fields">
              <div class="field"><label for="b-pages">Number of pages</label><select class="input" id="b-pages" name="pages"><option value="">Not sure yet</option>${O.pages.map(o => `<option value="${esc(o.id)}">${esc(o.label)}</option>`).join('')}</select></div>
              <div class="field"><label for="b-url">Existing website <em>(optional)</em></label><input class="input" id="b-url" name="existingWebsite" type="url" inputmode="url" placeholder="https://"></div>
            </div>
            <div class="field"><span class="lbl">Required functionality</span><div class="opts">${O.features.map(o => `<label class="opt"><input type="checkbox" name="features" value="${esc(o.id)}"><span>${esc(o.label)}</span></label>`).join('')}</div></div>
            <div class="field"><span class="lbl">Design level</span><div class="opts">${O.designLevels.map(o => `<label class="opt"><input type="radio" name="designLevel" value="${esc(o.id)}"><span>${esc(o.label)}<small>${esc(o.text)}</small></span></label>`).join('')}</div></div>
            <p class="hint" id="addonHint" hidden></p>
          </fieldset>
          <fieldset class="brief-step" data-step="3" hidden><legend>Budget.</legend><div class="est-hint" id="estHint" hidden></div>${radios('budget', B.budgets, true)}</fieldset>
          <fieldset class="brief-step" data-step="4" hidden><legend>Timeline.</legend>${radios('timeline', B.timelines, true)}</fieldset>
          <fieldset class="brief-step" data-step="5" hidden><legend>Tell us about your project.</legend><div class="field"><label for="b-desc">${esc(B.detailsPrompt)}</label><textarea class="input" id="b-desc" name="description" rows="7"></textarea></div></fieldset>
          <div class="brief-step" data-step="6" hidden><h3 class="est-q" style="margin-bottom:4px">Review your brief.</h3><dl class="review" id="review"></dl></div>
          <div class="brief-step" data-step="7" hidden id="briefDone" tabindex="-1"></div>
          <p class="err" id="briefErr" role="alert"></p>
        </form>
        <div class="brief-nav" id="briefNav"><button class="btn btn-ghost btn-sm" data-act="brief-back">Back</button><button class="btn btn-primary" data-act="brief-next" id="briefNext">Continue ${I.arrow}</button></div>
      </div>
    </div>
  </div></section>`;
};

R.contact = () => {
  const K = C.contactConfig;
  const links = [];
  if (K.email) links.push(`<a class="btn btn-ghost btn-sm" href="mailto:${esc(K.email)}">Email · ${esc(K.email)}</a>`);
  if (K.whatsapp) links.push(`<a class="btn btn-ghost btn-sm" href="https://wa.me/${esc(K.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>`);
  if (K.phone) links.push(`<span class="btn btn-ghost btn-sm" style="cursor:text;user-select:all">${esc(K.phone)}</span>`);
  return `<section class="sec" id="contact" aria-labelledby="contact-title"><div class="container qc">
    <div>${sectionHead('contact', K.header, { path: 'contactConfig' })}${links.length ? `<div class="qc-links">${links.join('')}</div>` : ''}</div>
    <form class="qc-form glass" id="qcForm" novalidate data-reveal>
      <div class="field"><label for="q-name">Name</label><input class="input" id="q-name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="q-email">Email</label><input class="input" id="q-email" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="q-msg">Message</label><textarea class="input" id="q-msg" name="message" rows="4" style="min-height:120px" required></textarea></div>
      <p class="err" id="qcErr" role="alert"></p>
      <button class="btn btn-primary" type="submit">${esc(K.submitLabel)} ${I.arrow}</button>
    </form>
  </div></section>`;
};

// email links open Gmail's compose window in a new tab: a mailto: link inside the
// published page's frame fails with an error page instead of opening a mail app
const gmailLink = to => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}`;
R.finalCTA = () => {
  const F = C.finalCTAConfig, K = C.finalContact || {}, A = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  const ICON = {
    whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.2 19.8l1.1-3.9A8.2 8.2 0 1 1 8.4 19z"/><path d="M9.2 8.4c.2-.5.6-.5.9-.5.2 0 .4.4.6 1 .2.5-.4.9-.4 1.1.3.8 1.4 1.9 2.4 2.3.2.1.6-.6 1-.5.5.1 1.1.5 1.2.7.1.3-.1 1-.6 1.3-.6.4-1.7.4-3.2-.6s-2.6-2.6-2.4-3.6c.1-.5.3-.9.5-1.2z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.9" cy="7.1" r=".6" fill="currentColor"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 8.5h2V5.2h-2.4c-2.3 0-3.6 1.4-3.6 3.7v2H8.5v3.2h2V20h3.3v-5.9h2.4l.4-3.2h-2.8V9.4c0-.6.3-.9.7-.9z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path class="fc-env" d="M4 7l8 6 8-6"/></svg>'
  };
  const url = id => id === 'whatsapp' ? (K.whatsappNumber ? `https://wa.me/${String(K.whatsappNumber).replace(/\D/g, '')}?text=${encodeURIComponent(K.whatsappMessage || '')}` : '')
    : id === 'instagram' ? (/^https:\/\/(www\.)?instagram\.com\/[^/?#]+/.test(K.instagram || '') ? K.instagram : '')
    : id === 'email' ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(K.email || '') ? gmailLink(K.email) : '')
    : id === 'facebook' ? (/^https:\/\/(www\.|m\.)?facebook\.com\/[^#]+/.test(K.facebook || '') ? K.facebook : '') : '';
  const rows = (C.socialLinks || []).map((s, i) => {
    const u = url(s.id), meta = !u ? '' : s.id === 'whatsapp' ? (K.whatsappDisplay || '') : s.id === 'email' ? K.email : s.id === 'instagram' ? (K.instagramDisplay || '') : '';
    const inner = `${F.showNumbers === false ? '' : `<span class="fc-n mono">${String(i + 2).padStart(2, '0')}</span>`}<span class="fc-ic fc-ic-${esc(s.id)}">${ICON[s.id] || ''}</span>
      <span class="fc-tx"><span class="fc-micro mono">${esc(u ? s.micro : T('Coming soon'))}</span><b>${esc(s.label)}</b><span class="fc-d">${meta ? `<em>${esc(meta)}</em>` : ''}${esc(s.description)}</span></span>
      <span class="fc-go">${A}</span><i class="fc-line" aria-hidden="true"></i>`;
    return u ? `<li data-reveal style="--d:${.32 + i * .07}s"><a class="fc-row" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${inner}<span class="sr">${esc(T('(opens in a new tab)'))}</span></a></li>`
      : `<li data-reveal style="--d:${.32 + i * .07}s"><div class="fc-row is-off" aria-disabled="true">${inner}</div></li>`;
  }).join('');
  return `<section class="fcta" id="start" aria-labelledby="fcta-title"><div class="container fc">
    ${F.ghostWord ? `<span class="fc-ghost" aria-hidden="true">${esc(F.ghostWord)}</span>` : ''}
    <div class="fc-copy">
      <p class="fc-label mono" data-reveal style="--d:0s"><i></i>${esc(F.label || 'Contact')}${F.showAvailability && F.availabilityText ? `<span class="fc-av"><b aria-hidden="true"></b>${esc(F.availabilityText)}</span>` : ''}</p>
      <h2 class="fc-h" id="fcta-title"><span class="fc-l1" data-reveal style="--d:.06s"${ed('finalCTAConfig.headlineTop')}>${esc(F.headlineTop)}</span><span class="fc-l2" data-reveal style="--d:.14s"><span${ed('finalCTAConfig.headlineMid')}>${esc(F.headlineMid)}</span> <em class="fc-acc"${ed('finalCTAConfig.headlineAccent')}>${esc(F.headlineAccent)}</em></span></h2>
      <p class="fc-intro" data-reveal style="--d:.22s"${ed('finalCTAConfig.intro')}>${nl(F.intro)}</p>
      ${F.location ? `<p class="fc-loc mono" data-reveal style="--d:.28s">${esc(F.location)}</p>` : ''}
    </div>
    <ul class="fc-dir${F.showNumbers === false ? ' fc-nonum' : ''}" role="list">
      <li data-reveal style="--d:.26s"><button type="button" class="fc-row fc-main" data-act="go" data-target="${esc(F.cta.target)}">
        ${F.showNumbers === false ? '' : '<span class="fc-n mono">01</span>'}
        <span class="fc-tx"><span class="fc-micro mono">${esc(F.cta.micro || 'Start here')}</span><b>${esc(F.cta.label)}</b><span class="fc-d">${esc(F.cta.text || '')}</span></span>
        <span class="fc-go fc-mag">${A}</span><i class="fc-line" aria-hidden="true"></i></button></li>
      ${rows}
    </ul>
  </div></section>`;
};

function navHTML() {
  const N = C.navigationConfig;
  const items = pageOrder(N.items);
  return `<header class="nav" id="nav"><div class="container"><div class="nav-in">
    <a class="logo" href="#home" data-act="go" data-target="home" aria-label="${esc(C.brandConfig.name)}, back to top">${logoHTML()}</a>
    <nav aria-label="Primary"><ul class="nav-links" id="navLinks">${items.map(it => `<li><a href="#${esc(it.target)}" data-act="go" data-target="${esc(it.target)}" data-nav="${esc(it.target)}">${esc(it.label)}</a></li>`).join('')}<li class="nav-ind" id="navInd" aria-hidden="true"></li></ul></nav>
    ${langHTML('lang-nav')}
    <button class="btn btn-primary btn-sm nav-cta" data-act="go" data-target="${esc(N.cta.target)}">${esc(N.cta.label)}</button>
    <button class="burger" data-act="menu-open" aria-expanded="false" aria-controls="mmenu" aria-label="${esc(T('Open menu'))}"><span></span></button>
  </div></div></header>
  <div class="mmenu" id="mmenu" hidden role="dialog" aria-modal="true" aria-label="${esc(T('Menu'))}">
    <button class="mmenu-close" data-act="menu-close">${esc(T('Close'))}</button>
    <nav aria-label="Mobile">${items.map((it, i) => `<a href="#${esc(it.target)}" data-act="go" data-target="${esc(it.target)}">${esc(it.label)}</a>`).join('')}</nav>
    <button class="btn btn-primary" data-act="go" data-target="${esc(N.cta.target)}" style="height:56px">${esc(N.cta.label)} ${I.arrow}</button>
  </div>`;
}
function footerHTML() {
  const F = C.footerConfig, b = C.brandConfig;
  return `<footer class="foot"><div class="container">
    <div class="foot-top">
      <div class="foot-brand"><span class="logo">${logoHTML()}</span><p${ed('brandConfig.tagline')}>${esc(b.tagline)}</p><p${ed('brandConfig.descriptor')}>${esc(b.descriptor)}</p></div>
      <nav class="foot-col foot-explore" aria-label="Footer"><span class="mono">${esc(T('Explore'))}</span>${pageOrder(F.nav).map(n => `<a href="#${esc(n.target)}" data-act="go" data-target="${esc(n.target)}"><b class="foot-dot" aria-hidden="true"></b>${esc(n.label)}</a>`).join('')}</nav>
      <div class="foot-col foot-contact"><span class="mono">${esc(T('Contact'))}</span>${(() => {
        const K = C.finalContact || {}, ic = p => `<span class="foot-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${p}</svg></span>`;
        const IC = {
          wa: ic('<path d="M4.2 19.8l1.1-3.9A8.2 8.2 0 1 1 8.4 19z"/><path d="M9.2 8.4c.2-.5.6-.5.9-.5.2 0 .4.4.6 1 .2.5-.4.9-.4 1.1.3.8 1.4 1.9 2.4 2.3.2.1.6-.6 1-.5.5.1 1.1.5 1.2.7.1.3-.1 1-.6 1.3-.6.4-1.7.4-3.2-.6s-2.6-2.6-2.4-3.6c.1-.5.3-.9.5-1.2z"/>'),
          mail: ic('<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>'),
          ig: ic('<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.9" cy="7.1" r=".6" fill="currentColor"/>'),
          fb: ic('<path d="M14.5 8.5h2V5.2h-2.4c-2.3 0-3.6 1.4-3.6 3.7v2H8.5v3.2h2V20h3.3v-5.9h2.4l.4-3.2h-2.8V9.4c0-.6.3-.9.7-.9z"/>'),
          tel: ic('<path d="M6.6 4h3l1.4 4-2 1.3a10.5 10.5 0 0 0 5.7 5.7L16 13l4 1.4v3c0 .9-.7 1.6-1.6 1.6C10.4 19 5 13.6 5 5.6 5 4.7 5.7 4 6.6 4z"/>')
        };
        const row = (icon, label, href, ext) => href ? `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${icon}<span>${esc(label)}</span></a>` : `<span class="foot-off" aria-disabled="true">${icon}<span>${esc(label)}</span><em class="mono">${esc(T('Soon'))}</em></span>`;
        const fb = /^https:\/\/(www\.|m\.)?facebook\.com\/[^#]+/.test(K.facebook || '') ? K.facebook : '';
        const em = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(K.email || '') ? K.email : '';
        const ig = /^https:\/\/(www\.)?instagram\.com\/[^/?#]+/.test(K.instagram || '') ? K.instagram : '';
        return [
          row(IC.wa, 'WhatsApp', K.whatsappNumber ? `https://wa.me/${String(K.whatsappNumber).replace(/\D/g, '')}?text=${encodeURIComponent(K.whatsappMessage || '')}` : '', true),
          row(IC.mail, 'Gmail', em ? gmailLink(em) : '', true),
          ...(ig ? [row(IC.ig, 'Instagram', ig, true)] : []),
          row(IC.fb, 'Facebook', fb, true),
          row(IC.tel, K.phoneDisplay || K.phone || T('Phone'), K.phone ? 'tel:' + String(K.phone).replace(/[^\d+]/g, '') : '')
        ].join('') + `<a href="#start" data-act="go" data-target="${esc(C.finalCTAConfig.cta.target)}" class="foot-start">${esc(T('Start a project'))} ${I.arrow}</a>`;
      })()}</div>
      <div class="foot-col foot-studio"><span class="mono">${esc(T('Studio'))}</span>${C.finalCTAConfig.showAvailability && C.finalCTAConfig.availabilityText ? `<p class="foot-av"><b aria-hidden="true"></b>${esc(C.finalCTAConfig.availabilityText)}</p>` : ''}${(F.studio || []).map(t => `<p>${esc(t)}</p>`).join('')}</div>
    </div>
    <p class="foot-mark" aria-hidden="true"><span>${esc(b.name.slice(0, 1))}</span>${esc(b.name.slice(1))}</p>
    <div class="foot-legal"><span>&copy; ${new Date().getFullYear()} ${esc(F.copyrightName)}. ${esc(T('All rights reserved.'))}</span><nav aria-label="Legal">${F.legal.map(l => l.url ? `<a class="link" href="${esc(l.url)}">${esc(l.label)}</a>` : `<span aria-disabled="true">${esc(l.label)}</span>`).join('')}</nav></div>
  </div></footer>`;
}
function announceHTML() {
  const A = C.announcementConfig;
  let dismissed = false; try { dismissed = sessionStorage.getItem('itech-announce') === '1'; } catch (e) { }
  if (!A.enabled || dismissed) return '';
  return `<div class="announce" id="announce"><span>${esc(A.message)}</span>${A.linkLabel ? `<a class="link" href="${esc(A.link)}">${esc(A.linkLabel)}</a>` : ''}${A.dismissible ? `<button class="announce-x" data-act="announce-close" aria-label="Dismiss announcement">✕</button>` : ''}</div>`;
}
const ID_OF = { hero: 'home', work: 'work', services: 'services', why: 'why', websiteTypes: 'types', packages: 'packages', addons: 'addons', estimator: 'estimator', process: 'process', comparison: 'compare', about: 'about', testimonials: 'testimonials', faq: 'faq', projectBrief: 'brief', contact: 'contact', finalCTA: 'start' };
function sectionOn(targetId) {
  const key = Object.keys(ID_OF).find(k => ID_OF[k] === targetId);
  if (!key) return true;
  const s = C.sections[key]; if (!s || !s.enabled || !C.sections.order.includes(key)) return false;
  if (key === 'testimonials' && !C.testimonialConfig.showTestimonials) return false;
  return true;
}
// menu links follow the order of the sections on the page (sections.order), whatever their order in the config
const pageOrder = list => list.filter(it => sectionOn(it.target)).map((it, i) => {
  const key = Object.keys(ID_OF).find(k => ID_OF[k] === it.target), at = key ? C.sections.order.indexOf(key) : -1;
  return { it, at: at < 0 ? 999 + i : at };
}).sort((a, b) => a.at - b.at).map(x => x.it);

/* ───────────────────────── render ───────────────────────── */
const app = document.getElementById('app');
/* standalone section components (e.g. experience.js) register in window.ITECH_EXT */
const EXT = window.ITECH_EXT || {};
const extHelpers = () => ({ esc, nl, accentize, desktopSite, I });
const EXT_ONLY = new Set(Object.keys(EXT).filter(k => !R[k]));   // standalone sections (not numbered)
Object.keys(EXT).forEach(k => { if (!R[k]) R[k] = () => EXT[k].render(C, extHelpers()); });
function renderAll() {
  applyTheme(); applySEO();
  const order = C.sections.order.filter(k => C.sections[k] && C.sections[k].enabled && R[k]);
  let n = 0; S.sectionNums = {};
  order.forEach(k => { if (!['hero', 'trust', 'finalCTA'].includes(k) && !EXT_ONLY.has(k)) S.sectionNums[k] = String(++n).padStart(2, '0'); });
  let alt = false;
  const html = order.map(k => {
    let h = R[k](); if (!h) return '';
    if (S.sectionNums[k]) { if (alt) h = h.replace('class="sec', 'class="sec sec-alt'); alt = !alt; if (C.sections[k].altSpan === 2) alt = !alt; }
    return h;
  }).join('');
  root.classList.toggle('has-announce', !!(C.announcementConfig.enabled));
  app.innerHTML = announceHTML() + navHTML() + `<main id="main">${html}</main>` + footerHTML() +
    (C.mobileStickyCta.enabled ? `<div class="mcta" id="mcta"><button class="btn btn-primary" data-act="go" data-target="brief">${esc(C.mobileStickyCta.label)} ${I.arrow}</button></div>` : '');
  if (!$('#announce')) root.classList.remove('has-announce');
  afterRender();
}
/* Performance: CSS animations keep running even when their section is far off
   screen. Pause every animation inside sections that are not near the viewport
   (resumes 300px before a section scrolls in, so nothing visibly stops). */
let pzIO = null;
function setupOffscreenPause() {
  if (!('IntersectionObserver' in window)) return;
  if (pzIO) pzIO.disconnect();
  pzIO = new IntersectionObserver(es => es.forEach(en => en.target.classList.toggle('pz-off', !en.isIntersecting)), { rootMargin: '300px 0px' });
  $$('main > section, main > div, footer.foot').forEach(el => pzIO.observe(el));
}
function setupFcta() {
  const row = $('.fc-main'), mag = row && $('.fc-mag', row);
  if (!mag || reduced || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  row.onpointermove = e => { const r = mag.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1, m = Math.min(7, d * .06); mag.style.transform = `translate(${(dx / d * m).toFixed(1)}px,${(dy / d * m).toFixed(1)}px)`; };
  row.onpointerleave = () => { mag.style.transform = ''; };
}
function afterRender() {
  observeReveals(); setupScene(); setupW3(); setupFcta(); setupOffscreenPause(); setupHeroVideo();
  Object.keys(EXT).forEach(k => { const el = document.querySelector(`[data-ext="${k}"]`); if (el && EXT[k].mount) EXT[k].mount(el, C); });
  briefGo(S.brief.step, false); markEditable(); updateNavInd(); onScroll();
}

/* ───────────────────────── navigation / actions ───────────────────────── */
function goTo(id) {
  // switched-off destinations fall back: brief → contact → packages (WhatsApp buttons and phone)
  if (id === 'brief' && !document.getElementById('brief')) id = 'contact';
  if (id === 'contact' && !document.getElementById('contact')) id = 'packages';
  const el = document.getElementById(id); if (!el) return;
  closeMenu(); closeModal();
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  // safety net: if smooth scrolling is blocked or interrupted, jump there
  setTimeout(() => { if (Math.abs(el.getBoundingClientRect().top) > innerHeight * .6) el.scrollIntoView({ behavior: 'instant', block: 'start' }); }, 1400);
  if (id === 'brief') setTimeout(() => { const s = $(`#briefForm .brief-step[data-step="${S.brief.step}"]`); const f = s && $('input,textarea,select', s); f && f.focus({ preventScroll: true }); }, reduced ? 50 : 900);
}
function openMenu() { const m = $('#mmenu'); m.hidden = false; requestAnimationFrame(() => m.classList.add('open')); root.classList.add('lock'); $('.burger').setAttribute('aria-expanded', 'true'); $('.mmenu-close').focus(); }
function closeMenu() { const m = $('#mmenu'); if (!m || m.hidden) return; m.classList.remove('open'); root.classList.remove('lock'); $('.burger').setAttribute('aria-expanded', 'false'); setTimeout(() => { m.hidden = true; }, 400); }

let modalReturn = null;
function showModal(inner) {
  closeModal(true); modalReturn = document.activeElement;
  const m = document.createElement('div');
  m.className = 'modal'; m.id = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'modal-title');
  m.innerHTML = inner; document.body.appendChild(m); root.classList.add('lock');
  requestAnimationFrame(() => m.classList.add('open'));
  const f = $('[data-act="modal-close"]', m); f && f.focus();
}
function openProject(id) {
  const p = projById(id); if (!p) return;
  modalReturn = document.activeElement;
  const m = document.createElement('div');
  m.className = 'modal'; m.id = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'modal-title');
  m.innerHTML = `<div class="modal-card"><div class="modal-media"><button class="modal-close" data-act="modal-close">Close</button><div class="pcard-frame" style="border-radius:0;border:0">${projectMedia(p, true)}</div></div>
    <div class="modal-body"><div class="cs"><p class="mono muted">${esc(p.industry)} · ${esc(p.type)} · ${esc(p.year)}${p.concept ? ' · Concept project' : ''}</p><h3 id="modal-title">${esc(p.name)}</h3><p>${esc(p.description)}</p>
      ${p.challenge ? `<h4>Challenge</h4><p>${esc(p.challenge)}</p>` : ''}${p.solution ? `<h4>Solution</h4><p>${esc(p.solution)}</p>` : ''}</div>
      <div class="cs"><h4>${esc(T('Services'))}</h4><ul class="tags">${(p.services || []).map(s => `<li>${esc(s)}</li>`).join('')}</ul>${(p.technologies || []).length ? `<h4>Technology</h4><ul class="tags">${p.technologies.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
      ${p.websiteURL ? `<a class="btn btn-ghost" href="${esc(p.websiteURL)}" target="_blank" rel="noopener">Visit website ${I.out}</a>` : ''}
      <button class="btn btn-primary" data-act="go" data-target="brief">Start a similar project ${I.arrow}</button></div></div></div>`;
  document.body.appendChild(m); root.classList.add('lock');
  requestAnimationFrame(() => m.classList.add('open'));
  $('.modal-close', m).focus();
}
function closeModal(silent) { const m = $('#modal'); if (!m) return; if (silent === true) { m.remove(); return; } m.classList.remove('open'); root.classList.remove('lock'); setTimeout(() => m.remove(), 400); modalReturn && modalReturn.focus && modalReturn.focus({ preventScroll: true }); }
function trapFocus(container, e) {
  if (e.key !== 'Tab') return;
  const f = $$('a[href],button:not([disabled]),input,textarea,select', container).filter(el => el.offsetParent !== null);
  if (!f.length) return; const a = f[0], z = f[f.length - 1];
  if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
}

function toast(t) { const n = document.createElement('div'); n.className = 'toast'; n.setAttribute('role', 'status'); n.textContent = t; document.body.appendChild(n); setTimeout(() => n.classList.add('show'), 20); setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 500); }, 3600); }

document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  if (root.classList.contains('editing') && e.target.closest('[data-e]') && t.contains(e.target.closest('[data-e]'))) return;
  const a = t.dataset.act;
  switch (a) {
    case 'go': e.preventDefault(); goTo(t.dataset.target); break;
    case 'menu-open': openMenu(); break;
    case 'lang': setLang(t.dataset.lang); break;
    case 'menu-close': closeMenu(); $('.burger').focus(); break;
    case 'modal-close': closeModal(); break;
    case 'announce-close': try { sessionStorage.setItem('itech-announce', '1'); } catch (x) { } $('#announce').remove(); root.classList.remove('has-announce'); break;
    case 'w3-prev': w3Go(S.w3.active - 1); break;
    case 'w3-next': w3Go(S.w3.active + 1); break;
    case 'w3-open': e.stopPropagation(); openShowcase(+t.dataset.i); break;
    case 'w3-card': { const i = +t.dataset.i; if (i === S.w3.active || w3Flat()) openShowcase(i); else w3Go(i); break; }
    case 'project': openProject(t.dataset.id); break;
    case 'svc': {
      const i = +t.dataset.i; S.service = i; S.serviceOpen = S.serviceOpen === i && small() ? -1 : i;
      $$('.svc-btn').forEach((b, j) => b.setAttribute('aria-selected', j === i));
      $$('.svc-item').forEach((li, j) => li.classList.toggle('open', j === S.serviceOpen));
      const pn = $('#svc-panel'); pn.innerHTML = servicePane(i); pn.setAttribute('aria-labelledby', 'svc-tab-' + i); markEditable(); break;
    }
    case 'type': selectType(+t.dataset.i); break;
    case 'est-type': {
      if (t.dataset.type) { S.est = { step: 1, type: t.dataset.type, pages: null, features: [], design: null, timeline: null }; refreshEstimator(false); }
      goTo('estimator'); break;
    }
    case 'package': {
      S.pkg = t.dataset.id; const pk = C.packagesConfig.items.find(p => p.id === S.pkg);
      const h = $('#pkgHint'); if (h && pk) { h.hidden = false; h.textContent = `Package of interest: ${pk.name}.`; }
      goTo(t.dataset.target); break;
    }
    case 'addon': {
      const id = t.dataset.id; S.addons.has(id) ? S.addons.delete(id) : S.addons.add(id);
      t.setAttribute('aria-pressed', S.addons.has(id)); $('#addonBar').innerHTML = addonBar(); updateAddonHint(); break;
    }
    case 'addons-clear': S.addons.clear(); $$('.addon').forEach(b => b.setAttribute('aria-pressed', 'false')); $('#addonBar').innerHTML = addonBar(); updateAddonHint(); break;
    case 'faq': {
      // height animation measured in JS: works in every browser (no grid-row transition needed)
      const it = t.closest('.faq-item'), box = $('.faq-a', it), o = !it.classList.contains('open');
      t.setAttribute('aria-expanded', o); clearTimeout(box._t);
      if (reduced) { it.classList.toggle('open', o); box.style.height = ''; break; }
      box.style.height = (o ? 0 : box.scrollHeight) + 'px'; it.classList.toggle('open', o); void box.offsetHeight;
      box.style.height = (o ? box.scrollHeight : 0) + 'px';
      box._t = setTimeout(() => { box.style.height = ''; }, 480);
      break;
    }
    case 'est-next': {
      e.preventDefault(); readEst(); const k = EST_STEPS[S.est.step];
      if (k !== 'features' && !S.est[k]) { $('#estErr').textContent = 'Choose an option to continue.'; return; }
      S.est.step++; refreshEstimator(true); break;
    }
    case 'est-back': e.preventDefault(); readEst(); if (S.est.step > 0) { S.est.step--; refreshEstimator(true); } break;
    case 'est-reset': S.est = { step: 0, type: null, pages: null, features: [], design: null, timeline: null }; refreshEstimator(true); break;
    case 'est-continue': transferEstimate(); break;
    case 'brief-next': e.preventDefault(); briefNext(); break;
    case 'brief-back': e.preventDefault(); if (S.brief.step > 0 && S.brief.step < 7) briefGo(S.brief.step - 1, true); break;
    case 'brief-goto': { const s = +t.dataset.step; if (s <= S.brief.max && S.brief.step < 7) briefGo(s, true); break; }
    case 'brief-copy': copyText($('#briefText').textContent, t); break;
    case 'brief-new': $('#briefForm').reset(); S.brief = { step: 0, max: 0, estimate: null }; $('#estHint').hidden = true; briefGo(0, true); break;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($('#modal')) closeModal(); else closeMenu(); }
  const m = $('#modal'); if (m) trapFocus(m, e);
  const mm = $('#mmenu'); if (mm && !mm.hidden) trapFocus(mm, e);
  const tab = e.target.closest && e.target.closest('.tab');
  if (tab && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { const n = C.websiteTypesConfig.types.length; selectType((S.type + (e.key === 'ArrowRight' ? 1 : n - 1)) % n); $(`#type-tab-${S.type}`).focus(); }
});
document.addEventListener('change', e => {
  if (e.target.closest('#estForm')) { readEst(); $('#estErr') && ($('#estErr').textContent = ''); const side = $('#estimator .est-side'); if (side) { const tmp = document.createElement('div'); tmp.innerHTML = R.estimator(); side.replaceWith($('.est-side', tmp)); } }
  if (e.target.closest('#briefForm')) $('#briefErr').textContent = '';
});
function selectType(i) {
  if (i === S.type) return; S.type = i;
  $$('.tab').forEach((b, j) => { b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; });
  const p = $('#type-panel'); p.innerHTML = typePanel(i, true); p.setAttribute('aria-labelledby', 'type-tab-' + i); markEditable();
}

/* ───────────────────────── estimator → brief ───────────────────────── */
function transferEstimate() {
  const E = C.estimatorConfig, e = S.est, f = $('#briefForm'); if (!f) return;
  const set = (name, val) => { const el = f.querySelector(`[name="${name}"][value="${val}"]`); if (el) el.checked = true; };
  set('projectType', E.typeToBrief[e.type] || e.type);
  if (e.pages) f.elements.pages.value = e.pages;
  $$('input[name="features"]', f).forEach(c => { c.checked = e.features.includes(c.value); });
  if (e.design) set('designLevel', e.design);
  if (e.timeline) set('timeline', E.timelineToBrief[e.timeline]);
  S.brief.estimate = fmtRange(estimate(e), E.currency);
  const h = $('#estHint'); h.hidden = false; h.innerHTML = `${I.spark}<span>Your estimate: <b>${esc(S.brief.estimate)}</b>. Pick the budget range that feels right.</span>`;
  toast('Your estimate was added to the project brief.');
  goTo('brief');
}
function updateAddonHint() {
  const h = $('#addonHint'); if (!h) return;
  const names = C.addonsConfig.items.filter(a => S.addons.has(a.id)).map(a => a.name);
  h.hidden = !names.length; h.textContent = names.length ? `Add-ons selected: ${names.join(', ')}.` : '';
}

/* ───────────────────────── project brief ───────────────────────── */
function briefGo(n, focus) {
  const f = $('#briefForm'); if (!f) return;
  S.brief.step = n; S.brief.max = Math.max(S.brief.max, Math.min(n, 6));
  $$('.brief-step', f).forEach(s => { const on = +s.dataset.step === n; s.hidden = !on; s.classList.toggle('show', on); });
  const done = n === 7;
  $('#briefCount').textContent = done ? 'Complete' : `Step ${n + 1} of 7`;
  $('#briefName').textContent = done ? '' : BRIEF_STEPS[n];
  $('#briefBar').style.setProperty('--p', done ? 1 : (n + 1) / 7);
  $$('#briefSteps button').forEach((b, i) => { b.disabled = i > S.brief.max || done; b.classList.toggle('done', i < n || done); if (i === n && !done) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
  $('#briefNav').hidden = done;
  $('[data-act="brief-back"]').style.visibility = n === 0 ? 'hidden' : 'visible';
  $('#briefNext').innerHTML = n === 6 ? `${esc(C.briefConfig.submitLabel)} ${I.arrow}` : `Continue ${I.arrow}`;
  $('#briefErr').textContent = '';
  if (n === 6) buildReview();
  updateAddonHint();
  if (focus) { const s = $(`.brief-step[data-step="${n}"]`, f); const el = n === 7 || n === 6 ? s : $('input,textarea,select', s); setTimeout(() => el && el.focus({ preventScroll: true }), 60); }
}
function briefValidate(n) {
  const f = $('#briefForm'), fd = new FormData(f), err = $('#briefErr');
  const bad = (el, msg) => { err.textContent = msg; if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); } return false; };
  $$('[aria-invalid]', f).forEach(x => x.removeAttribute('aria-invalid'));
  if (n === 0) {
    if (!String(fd.get('customer') || '').trim()) return bad(f.elements.customer, 'Add your name so we know who to reply to.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fd.get('email') || '').trim())) return bad(f.elements.email, 'Enter an email address like name@company.com.');
  }
  if (n === 1 && !fd.get('projectType')) return bad(null, 'Choose the type of website you need.');
  if (n === 2) { const u = String(fd.get('existingWebsite') || '').trim(); if (u && !/^https?:\/\/\S+\.\S+/.test(u)) return bad(f.elements.existingWebsite, 'Enter the full address, starting with https://'); }
  if (n === 3 && !fd.get('budget')) return bad(null, 'Choose a budget range. "Let\'s discuss" is fine.');
  if (n === 4 && !fd.get('timeline')) return bad(null, 'Choose a timeline.');
  return true;
}
function buildRequest() {
  const f = $('#briefForm'), fd = new FormData(f), B = C.briefConfig, O = C.estimatorConfig.options;
  const lbl = (list, id) => optLabel(list, id) || '';
  return {
    customer: String(fd.get('customer') || '').trim(), company: String(fd.get('company') || '').trim(),
    email: String(fd.get('email') || '').trim(), phone: String(fd.get('phone') || '').trim(),
    projectType: lbl(B.projectTypes, fd.get('projectType')), pages: lbl(O.pages, fd.get('pages')) || 'Not sure yet',
    features: fd.getAll('features').map(x => lbl(O.features, x)), addons: C.addonsConfig.items.filter(a => S.addons.has(a.id)).map(a => a.name),
    package: S.pkg ? (C.packagesConfig.items.find(p => p.id === S.pkg) || {}).name || '' : '',
    designLevel: lbl(O.designLevels, fd.get('designLevel')), budget: lbl(B.budgets, fd.get('budget')), timeline: lbl(B.timelines, fd.get('timeline')),
    existingWebsite: String(fd.get('existingWebsite') || '').trim(), description: String(fd.get('description') || '').trim(),
    estimatedRange: S.brief.estimate || '', submittedAt: new Date().toISOString(), source: 'website'
  };
}
const REVIEW_ROWS = [['Name', 'customer', 0], ['Company', 'company', 0], ['Email', 'email', 0], ['Phone', 'phone', 0], ['Project type', 'projectType', 1], ['Package', 'package', 1], ['Pages', 'pages', 2], ['Functionality', 'features', 2], ['Add-ons', 'addons', 2], ['Design level', 'designLevel', 2], ['Existing website', 'existingWebsite', 2], ['Estimate', 'estimatedRange', 3], ['Budget', 'budget', 3], ['Timeline', 'timeline', 4], ['Details', 'description', 5]];
function buildReview() {
  const r = buildRequest();
  $('#review').innerHTML = REVIEW_ROWS.map(([l, k, s]) => { const v = Array.isArray(r[k]) ? r[k].join(', ') : r[k]; return v ? `<div><dt>${l}</dt><dd>${esc(v)}</dd><button type="button" data-act="brief-goto" data-step="${s}">Edit</button></div>` : ''; }).join('');
}
function briefText(r) { return REVIEW_ROWS.map(([l, k]) => { const v = Array.isArray(r[k]) ? r[k].join(', ') : r[k]; return v ? `${l}: ${v}` : ''; }).filter(Boolean).join('\n'); }

/* Submission adapter — connect a backend by setting contactConfig.endpoints.
   Nothing is sent, and no success is shown, unless an endpoint accepts the request. */
async function submitRequest(kind, payload) {
  const url = (C.contactConfig.endpoints || {})[kind];
  window.ITECH_LAST_REQUEST = payload;          // handy for integration testing
  if (!url) {
    const key = C.contactConfig.web3formsKey;
    if (!key) return { status: 'not_configured' };
    const lines = Object.entries(payload || {}).filter(([, v]) => v != null && v !== '' && !(Array.isArray(v) && !v.length)).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : v}`);
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: key, subject: kind === 'projectBrief' ? 'iTECH — new project brief' : 'iTECH — new message', from_name: 'iTECH website', name: payload.customer || payload.name || '', email: payload.email || '', message: lines.join('\n') }) });
      const j = await res.json().catch(() => ({}));
      return { status: res.ok && j.success !== false ? 'sent' : 'error' };
    } catch (err) { return { status: 'error' }; }
  }
  try { const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) }); return { status: res.ok ? 'sent' : 'error' }; }
  catch (err) { return { status: 'error' }; }
}
async function briefNext() {
  const n = S.brief.step;
  if (!briefValidate(n)) return;
  if (n < 6) { briefGo(n + 1, true); return; }
  const btn = $('#briefNext'); btn.disabled = true; btn.textContent = 'Sending…';
  const r = buildRequest(), res = await submitRequest('projectBrief', r);
  btn.disabled = false;
  if (res.status === 'error') { $('#briefErr').textContent = 'The request could not be sent. Check your connection and try again.'; btn.innerHTML = `${esc(C.briefConfig.submitLabel)} ${I.arrow}`; return; }
  const B = C.briefConfig, K = C.contactConfig, sent = res.status === 'sent';
  $('#briefDone').innerHTML = `<div class="done-box"><p class="mono" style="color:var(--a3)">${sent ? 'Sent' : 'Brief complete'}</p><h3>${esc(sent ? B.successTitle : B.notConnectedTitle)}</h3><p class="muted">${esc(sent ? B.successText : B.notConnectedText)}</p>
    ${sent ? '' : `<pre id="briefText">${esc(briefText(r))}</pre><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" data-act="brief-copy">Copy brief</button>${K.email ? `<a class="btn btn-ghost btn-sm" href="mailto:${esc(K.email)}?subject=${encodeURIComponent('Project brief — ' + (r.company || r.customer))}">Email · ${esc(K.email)}</a>` : ''}</div>`}
    <button class="link" data-act="brief-new" style="justify-self:start">Start a new brief</button></div>`;
  briefGo(7, true);
}
function copyText(text, btn) {
  const ok = () => { btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = 'Copy brief'; }, 1800); };
  try { navigator.clipboard.writeText(text).then(ok, () => selectPre()); } catch (e) { selectPre(); }
  function selectPre() { const p = $('#briefText'); const r = document.createRange(); r.selectNodeContents(p); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Press Ctrl/⌘ + C'; }
}
document.addEventListener('submit', async e => {
  if (e.target.id === 'briefForm') { e.preventDefault(); briefNext(); return; }
  if (e.target.id === 'estForm') { e.preventDefault(); return; }
  if (e.target.id !== 'qcForm') return;
  e.preventDefault();
  const f = e.target, fd = new FormData(f), err = $('#qcErr');
  $$('[aria-invalid]', f).forEach(x => x.removeAttribute('aria-invalid'));
  const bad = (el, m) => { err.textContent = m; el.setAttribute('aria-invalid', 'true'); el.focus(); };
  if (!String(fd.get('name') || '').trim()) return bad(f.elements.name, 'Add your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fd.get('email') || '').trim())) return bad(f.elements.email, 'Enter a valid email address.');
  if (String(fd.get('message') || '').trim().length < 5) return bad(f.elements.message, 'Write a short message.');
  err.textContent = '';
  const payload = { name: fd.get('name'), email: fd.get('email'), message: fd.get('message'), submittedAt: new Date().toISOString(), source: 'quick-contact' };
  const b = $('button[type=submit]', f); b.disabled = true; b.textContent = 'Sending…';
  const res = await submitRequest('quickContact', payload);
  b.disabled = false; b.innerHTML = `${esc(C.contactConfig.submitLabel)} ${I.arrow}`;
  if (res.status === 'error') { err.textContent = 'The message could not be sent. Try again.'; return; }
  const box = document.createElement('div'); box.className = 'qc-state';
  box.innerHTML = res.status === 'sent' ? `<p class="mono" style="color:var(--a3)">Sent</p><p>${esc(C.contactConfig.successText)}</p>` : `<p class="mono" style="color:var(--a3)">Not sent</p><p class="muted">${esc(C.contactConfig.notConnectedText)}</p>`;
  const old = $('.qc-state', f); old && old.remove(); f.appendChild(box);
});

/* ───────────────────────── scroll, reveal, scene ───────────────────────── */
let io = null;
function observeReveals(immediate) {
  if (!root.classList.contains('anim')) return;
  if (window.ITECH_MOTION) return window.ITECH_MOTION.reveal(immediate);   // motion.js loaded: Motion drives the reveals
  io = io || new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  $$('[data-reveal]:not(.in)').forEach(el => { if (immediate) el.classList.add('in'); else io.observe(el); });
}
addEventListener('itech:motion', () => { if (io) { io.disconnect(); io = null; } observeReveals(); });   // hand over to motion.js once its module arrives
const M = { tx: 0, ty: 0, x: 0, y: 0 };
let layers = [], rig = null, scene = null, fstack = null, fghosts = [];
/* hero background video: plays only while the first screen is visible; a still frame
   (poster) instead on reduced motion or when the visitor's connection asks to save data */
let heroVidIO = null;
function setupHeroVideo() {
  if (heroVidIO) { heroVidIO.disconnect(); heroVidIO = null; }
  const v = $('.hero-video video'); if (!v) return;
  const nc = navigator.connection || {}, still = reduced || nc.saveData || /(^|-)2g$/.test(nc.effectiveType || '');
  if (still) { v.preload = 'none'; return; }
  v.preload = 'auto';
  const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => { }); };
  if (!('IntersectionObserver' in window)) return play();
  heroVidIO = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) play(); else v.pause(); }), { threshold: .05 });
  heroVidIO.observe(v);
}
function setupScene() {
  rig = $('#rig'); scene = $('#scene'); layers = $$('#rig .layer').map(el => ({ el, z: +el.dataset.z || 0 }));
  fstack = $('#fctaStack'); fghosts = fstack ? $$('.fcta-ghost', fstack).map(el => ({ el, z: +el.dataset.z })) : [];
  const mc = C.motionConfig, flat = !mc.threeDEnabled || reduced || (small() && !mc.threeDOnMobile);
  if (scene) scene.classList.toggle('flat', flat);
  renderScene(0);
}
function renderScene(p) {
  if (!rig) return;
  const mc = C.motionConfig, on = mc.threeDEnabled && !reduced && !(small() && !mc.threeDOnMobile);
  const I3 = on ? mc.threeDIntensity : 0, P3 = on && mc.parallaxEnabled ? mc.parallaxIntensity : 0;
  const mx = M.x * P3, my = M.y * P3;
  rig.style.transform = `translateY(${(-p * 60).toFixed(1)}px) rotateX(${(8 + p * 10 - my * 6) * I3}deg) rotateY(${(-14 + mx * 10) * I3}deg)`;
  layers.forEach(({ el, z }) => { el.style.transform = `translate3d(${(mx * z * .05).toFixed(1)}px,${(my * z * .04).toFixed(1)}px,${(z * I3 * (1 + p * .6)).toFixed(1)}px)`; });
  const bg = $('.hero-bg'); if (bg) { bg.style.setProperty('--lx', (72 + mx * 8) + '%'); bg.style.setProperty('--ly', (40 + my * 8) + '%'); }
}
let raf = 0, heroP = 0;
function frame() {
  raf = 0; let again = false;
  M.x += (M.tx - M.x) * .07; M.y += (M.ty - M.y) * .07;
  if (Math.abs(M.tx - M.x) > .001 || Math.abs(M.ty - M.y) > .001) again = true;
  const hero = $('#home');
  if (hero) { const r = hero.getBoundingClientRect(); heroP = clamp01(-r.top / Math.max(1, r.height)); if (r.bottom > 0) renderScene(heroP); }
  const w3r = $('#w3Rig');
  if (w3r && !w3Flat() && C.portfolio3D.mouseTrackingEnabled && !reduced && !PERF.lite) {
    const r = w3r.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) { const k = C.portfolio3D.parallaxIntensity; w3r.style.transform = `rotateY(${(M.x * 2.4 * k).toFixed(2)}deg) rotateX(${(-M.y * 1.6 * k).toFixed(2)}deg)`; }
  }
  if (fstack && C.motionConfig.parallaxEnabled && !reduced) {
    const r = fstack.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) {
      const k = C.motionConfig.parallaxIntensity;
      fstack.style.transform = `rotateX(${(-M.y * 6 * k).toFixed(2)}deg) rotateY(${(M.x * 8 * k).toFixed(2)}deg)`;
      fghosts.forEach(({ el, z }) => { el.style.transform = `translate3d(${(M.x * z * -.12 * k).toFixed(1)}px,${(M.y * z * -.1 * k).toFixed(1)}px,${z}px)`; });
    }
  }
  if (again) req();
}
function req() { if (!raf) raf = requestAnimationFrame(frame); }
addEventListener('pointermove', e => {
  if (!fine || reduced) return;
  M.tx = e.clientX / innerWidth * 2 - 1; M.ty = e.clientY / innerHeight * 2 - 1; req();
  const lit = !PERF.lite && e.target.closest && e.target.closest('.lit');
  if (lit) { const r = lit.getBoundingClientRect(); lit.style.setProperty('--mx', (e.clientX - r.left) + 'px'); lit.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
  const media = e.target.closest && e.target.closest('.pcard-media');
  $$('.pcard-frame.tilt').forEach(fr => { if (!media || !media.contains(fr)) { fr.classList.remove('tilt'); fr.style.transform = ''; } });
  if (media && C.motionConfig.threeDEnabled) { const fr = $('.pcard-frame', media), r = media.getBoundingClientRect(), k = C.motionConfig.threeDIntensity; fr.classList.add('tilt'); fr.style.transform = `rotateX(${((.5 - (e.clientY - r.top) / r.height) * 6 * k).toFixed(2)}deg) rotateY(${(((e.clientX - r.left) / r.width - .5) * 8 * k).toFixed(2)}deg) translateZ(0)`; }
}, { passive: true });

function onScroll() {
  const nav = $('#nav'); if (nav) nav.classList.toggle('scrolled', scrollY > 20);
  updateNavInd();
  const mc = $('#mcta');
  if (mc) { const hero = $('#home'), brief = $('#brief'), contact = $('#contact'); const past = hero ? hero.getBoundingClientRect().bottom < innerHeight * .4 : scrollY > 400; const inForm = [brief, contact].some(s => s && s.getBoundingClientRect().top < innerHeight && s.getBoundingClientRect().bottom > 0); const atEnd = (s => s && s.getBoundingClientRect().top < innerHeight * .85)($('#start')); mc.classList.toggle('show', past && !inForm && !atEnd); }
  procUpdate(); w3Scroll(); req();
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { setupScene(); w3Layout(); updateNavInd(); }, { passive: true });
let activeNav = '';
function updateNavInd() {
  const links = $$('#navLinks a'); if (!links.length) return;
  let a = '';
  links.forEach(l => { const s = document.getElementById(l.dataset.nav); if (s && s.getBoundingClientRect().top < innerHeight * .4) a = l.dataset.nav; });
  const last = links.find(l => l.dataset.nav === a);
  const lastSec = last && document.getElementById(a);
  if (lastSec && lastSec.getBoundingClientRect().bottom < innerHeight * .3) a = '';
  if (a === activeNav && $('#navInd').style.width) return;
  activeNav = a;
  links.forEach(l => l.classList.toggle('on', l.dataset.nav === a));
  const ind = $('#navInd'), l = links.find(x => x.dataset.nav === a);
  if (!l || !l.offsetParent) { ind.style.opacity = 0; ind.style.width = '0px'; return; }
  ind.style.opacity = 1; ind.style.width = (l.offsetWidth - 26) + 'px'; ind.style.transform = `translateX(${l.offsetLeft + 13}px)`;
}
function procUpdate() {
  const list = $('#procList'); if (!list) return;
  const steps = $$('.proc-step', list), mid = innerHeight * .55; let act = 0;
  steps.forEach((s, i) => { if (s.getBoundingClientRect().top < mid) act = i; });
  steps.forEach((s, i) => s.classList.toggle('on', i <= act));
  const r = list.getBoundingClientRect(), fill = clamp01((mid - r.top) / r.height);
  $('.proc-line i', list).style.setProperty('--fill', fill.toFixed(3));
  const num = $('#procNum'); if (num) { num.textContent = String(act + 1).padStart(2, '0'); $('#procName').textContent = C.processConfig.steps[act].title; }
}
document.addEventListener('input', e => {
  if (e.target.classList.contains('cmp-range')) { $('#cmp').style.setProperty('--pos', e.target.value + '%'); }
});

/* custom cursor (desktop, fine pointer only) */
function setupCursor() {
  if (!C.motionConfig.cursorEffectsEnabled || !fine || reduced) return;
  const c = document.createElement('div'); c.className = 'cursor'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = '<b></b>'; document.body.appendChild(c);
  let x = -100, y = -100, cx = x, cy = y, run = false;
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; c.classList.add('on'); const t = e.target.closest && e.target.closest('[data-cursor]'); c.classList.toggle('big', !!t); c.classList.toggle('soft', !!(t && t.dataset.cursorStyle === 'soft')); if (t) $('b', c).textContent = t.dataset.cursor; if (!run) { run = true; requestAnimationFrame(loop); } }, { passive: true });
  document.addEventListener('pointerleave', () => c.classList.remove('on'));
  function loop() { cx += (x - cx) * .22; cy += (y - cy) * .22; c.style.transform = `translate(${cx}px,${cy}px)`; if (Math.abs(x - cx) > .3 || Math.abs(y - cy) > .3) requestAnimationFrame(loop); else run = false; }
}

/* ───────────────────────── owner-only live editing ─────────────────────────
   Text marked data-e maps to a config path. Saved edits live in content.json
   ({fields:{path:value}}) and are applied over config.js on load.            */
let saved = {}, artifactApi = null, dirty = new Set();
function markEditable() { if (root.classList.contains('editing')) $$('[data-e]').forEach(el => { el.contentEditable = 'true'; el.spellcheck = true; }); }
function applyOverrides(fields) {
  C = JSON.parse(JSON.stringify(BASE));
  if (I18.lang !== 'en') { C = I18.tr(C); return; }   // owner text edits are English: they apply to the English page
  Object.entries(fields || {}).forEach(([p, v]) => { if (typeof v === 'string' && getPath(C, p) !== undefined) setPath(C, p, v); });
}
const langHTML = cls => I18.langs.length > 1 ? `<div class="lang ${cls}" role="group" aria-label="${esc(T('Language'))}">${I18.langs.map(l => `<button type="button" class="lang-b" data-act="lang" data-lang="${l.id}" lang="${l.id}" aria-pressed="${l.id === I18.lang}" aria-label="${esc(l.name)}">${esc(l.label)}</button>`).join('')}</div>` : '';
function setLang(id) {
  if (id === I18.lang) return;
  const y = scrollY, at = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.lang;
  I18.set(id); closeMenu(); applyOverrides(saved); renderAll();
  scrollTo(0, y);
  const b = at && $(`.lang-b[data-lang="${id}"]`); if (b) b.focus({ preventScroll: true });
}
function readText(el) { return el.innerText.replace(/ /g, ' ').replace(/\n{3,}/g, '\n\n').trim(); }
function setupEditor() {
  const ui = document.createElement('div');
  ui.innerHTML = `<button class="ed-fab" id="edFab" type="button">✎ Edit site</button><div class="ed-bar" id="edBar" role="toolbar" aria-label="Site editor" hidden><span id="edMsg" aria-live="polite">Click any outlined text to change it.</span><button class="btn btn-ghost btn-sm" id="edDiscard" type="button">Discard</button><button class="btn btn-primary btn-sm" id="edSave" type="button">Save &amp; publish</button></div>`;
  document.body.appendChild(ui); document.body.classList.add('has-editor');
  const msg = t => { $('#edMsg').textContent = t; };
  const setEditing = on => { root.classList.toggle('editing', on); $$('[data-e]').forEach(el => { if (on) { el.contentEditable = 'true'; el.spellcheck = true; } else el.removeAttribute('contenteditable'); }); $('#edFab').hidden = on; $('#edBar').hidden = !on; if (on) { dirty.clear(); msg('Click any outlined text to change it.'); } };
  $('#edFab').onclick = () => setEditing(true);
  $('#edDiscard').onclick = () => { setEditing(false); applyOverrides(saved); renderAll(); };
  document.addEventListener('input', e => { const el = e.target.closest && e.target.closest('[data-e]'); if (el && root.classList.contains('editing')) { dirty.add(el.dataset.e); msg(dirty.size + (dirty.size === 1 ? ' change' : ' changes') + ' not published yet.'); } });
  document.addEventListener('keydown', e => { const el = e.target.closest && e.target.closest('[data-e][contenteditable]'); if (!el) return; if (e.key === 'Enter' && !e.shiftKey && !/headline|title/.test(el.dataset.e)) { e.preventDefault(); el.blur(); } if (e.key === 'Escape') el.blur(); });
  document.addEventListener('paste', e => { const el = e.target.closest && e.target.closest('[data-e][contenteditable]'); if (!el) return; e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); });
  $('#edSave').onclick = async () => {
    if (!dirty.size) { setEditing(false); return; }
    const next = { ...saved };
    dirty.forEach(p => { const el = $(`[data-e="${p}"]`); if (!el) return; const v = readText(el), base = getPath(BASE, p); if (v === base) delete next[p]; else next[p] = v; });
    $('#edSave').disabled = true; msg('Publishing…');
    try {
      await artifactApi.publish({ 'content.json': { content: JSON.stringify({ fields: next }, null, 1), contentType: 'application/json' } });
      saved = next; setEditing(false); applyOverrides(saved); renderAll(); toast('Published. Visitors now see your changes.');
    } catch (err) {
      const c = err && err.code;
      msg(c === 'conflict' ? 'A newer version was saved elsewhere. The page is reloading.' : c === 'rate_limited' ? 'Saving too often. Wait a minute and try again.' : c === 'capability_disabled' ? 'Saving is off while the page has a public link. Make it private, save, then share again.' : /not_writer|not_granted|not_declared/.test(c || '') ? 'Saving is not available in this view.' : 'The save did not go through. Your edits are still here.');
    }
    $('#edSave').disabled = false;
  };
}
async function initEditor() {
  if (C.siteEditor && C.siteEditor.enabled === false) return true;   // owner "Edit site" button switched off in config
  if (!window.claude || !window.claude.use) return false;
  const [u, a] = await Promise.all([claude.use('user'), claude.use('artifact')]);
  if (u && a && await u.isOwner()) { artifactApi = a; setupEditor(); }
  return true;
}

/* ───────────────────────── boot ───────────────────────── */
/* ───────────────────────── adaptive quality ─────────────────────────
   Runs on every visitor's own device. For the first seconds of real viewing the
   frame rate is sampled; if the device cannot keep the animations smooth (weak
   laptop, Chrome without graphics acceleration, battery saver…) the site switches
   itself to "perf-lite": same design, calmer motion — no idle loops, no live glass
   blur, decorative light animations held still. Fast devices keep everything.
   Config: performanceConfig.mode = "auto" | "full" | "lite".                    */
const PERF = window.ITECH_PERF = { lite: false, reason: '', set: (on, why) => setLite(on, why || 'manual') };
function setLite(on, reason) {
  if (PERF.lite === on) return;
  PERF.lite = on; PERF.reason = reason || '';
  root.classList.toggle('perf-lite', on);
  if (on) { holdLoops(); try { localStorage.setItem('itech-perf', JSON.stringify({ v: 'lite', t: Date.now() })); } catch (e) { } }
  dispatchEvent(new CustomEvent('itech:perf', { detail: { lite: on } }));
}
let holdT = 0;
function holdLoops() {   // freeze endless decorative CSS animations (entrances and hover effects still play)
  // kept alive in light mode: the first screen (hero + the scene below it) and the blinking logo line
  const keep = t => t && t.closest && t.closest('#home,#experience,.logo-mark');
  const hold = () => { if (!PERF.lite || !document.getAnimations) return; document.getAnimations().forEach(a => { try { if (a.playState === 'running' && a.effect && a.effect.getTiming().iterations === Infinity && !keep(a.effect.target)) a.pause(); } catch (e) { } }); };
  hold(); clearInterval(holdT); holdT = setInterval(hold, 1200);
}
function setupPerf() {
  const P = C.performanceConfig || {}, mode = P.mode || 'auto';
  if (mode === 'lite') return setLite(true, 'config');
  if (mode === 'full' || reduced) return;
  try { const m = JSON.parse(localStorage.getItem('itech-perf') || 'null'); if (m && m.v === 'lite' && Date.now() - m.t < 3 * 864e5) setLite(true, 'remembered'); } catch (e) { }
  if (PERF.lite) return;
  // sample frame times in windows of 40 frames during the first ~25 s of visible time
  const limit = P.slowFrameMs || 24, needed = P.slowWindows || 2;
  let last = 0, buf = [], slow = 0, seen = 0, raf = 0;
  const step = now => {
    raf = 0; if (PERF.lite) return;
    if (document.visibilityState === 'visible') {
      const d = now - last; last = now;
      if (d > 0 && d < 250) { buf.push(d); seen += d; }        // ignore gaps (tab switches, stalls while loading)
      if (buf.length >= 40) { buf.sort((a, b) => a - b); if (buf[20] > limit) slow++; buf = []; if (slow >= needed) return setLite(true, 'measured'); }
      if (seen > 25000) return;
    } else last = now;
    raf = requestAnimationFrame(step);
  };
  setTimeout(() => { last = performance.now(); raf = requestAnimationFrame(step); }, 1500);   // let the first paint and images settle
}

function boot() {
  const L = C.loaderConfig;
  if (L.enabled && !reduced) { const l = document.createElement('div'); l.className = 'loader'; l.innerHTML = `<b><span>${esc(C.brandConfig.logoPrefix || '')}</span>${esc(C.brandConfig.name)}</b>`; document.body.appendChild(l); setTimeout(() => { l.classList.add('done'); setTimeout(() => l.remove(), 700); }, L.durationMs); }
  renderAll(); setupCursor(); setupPerf();
  fetch('content.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(d => { if (d && d.fields && Object.keys(d.fields).length) { saved = d.fields; applyOverrides(saved); renderAll(); } }).catch(() => { });
  initEditor().then(ok => { if (!ok) addEventListener('load', () => initEditor(), { once: true }); });
}
boot();
})();
