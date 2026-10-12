/* iTECH — "What do you want to build?" (ProjectSelectorSection)
   Renders only from C.buildTypes; settings in C.projectSelectorConfig.
   Left: project-type selector. Right: live HTML website preview in 3D. */
(function () {
'use strict';
const EXT = window.ITECH_EXT = window.ITECH_EXT || {};
const liteOn = () => document.documentElement.classList.contains('perf-lite');   // adaptive quality (app.js)
let inst = null;
const pad = n => String(n).padStart(2, '0');

/* ───────────── preview mockups (sizes in cqw of the preview width) ───────────── */
const PREVIEW = {
  business: (t, e) => `<div class="bpv bp-business">
    <div class="bp-nav"><b>NORTHGATE</b><nav><span>Services</span><span>About</span><span>Projects</span><span>Contact</span></nav><span class="bp-btn">Start a conversation</span></div>
    <div class="bp-hero"><div class="bp-copy"><p class="bp-k">Advisory · Engineering · Delivery</p><p class="bp-h">${e(t.headline)}</p><p class="bp-p">Strategy and delivery for companies that need it done properly.</p><span class="bp-cta">Start a conversation →</span></div>
      <div class="bp-img"><div class="bp-tower t1">${'<i></i>'.repeat(28)}</div><div class="bp-tower t2">${'<i></i>'.repeat(40)}</div><div class="bp-tower t3">${'<i></i>'.repeat(20)}</div></div></div>
    <div class="bp-row"><div><b>Consulting</b><span>Plan the next step</span></div><div><b>Engineering</b><span>Build what matters</span></div><div><b>Support</b><span>Keep it running</span></div>
      <div class="bp-stats"><b>12+</b><span>years</span><b>240</b><span>projects</span></div></div></div>`,
  ecommerce: (t, e) => `<div class="bpv bp-shop">
    <div class="bp-nav"><b>MAISON OLA</b><nav><span>Shop</span><span>Collections</span><span>Journal</span></nav><span class="bp-cart">Cart (2)</span></div>
    <div class="bp-hero"><div class="bp-copy"><p class="bp-k">New season · Ceramics</p><p class="bp-h">${e(t.headline)}</p><p class="bp-p">Small-batch pieces, shipped from our studio.</p><span class="bp-cta">Shop the collection</span></div>
      <div class="bp-feat"><div class="bp-vase"></div><p><b>Dune vase</b><span>€68 · Add to cart</span></p></div></div>
    <div class="bp-prods">${['Tide bowl · €42', 'Ember cup · €24', 'Salt plate · €36', 'Stone jug · €58'].map((x, i) => `<div><i class="v${i}"></i><span>${x}</span></div>`).join('')}</div></div>`,
  booking: (t, e) => `<div class="bpv bp-book">
    <div class="bp-nav"><b>SERENE<small>CLINIC</small></b><nav><span>Treatments</span><span>Team</span><span>Prices</span></nav><span class="bp-btn">Book online</span></div>
    <div class="bp-hero"><div class="bp-copy"><p class="bp-k">Wellness & dental care</p><p class="bp-h">${e(t.headline)}</p>
      <ul class="bp-svc"><li><span>Consultation</span><b>30 min · €40</b></li><li><span>Hygiene</span><b>45 min · €70</b></li><li><span>Whitening</span><b>60 min · €180</b></li></ul></div>
      <div class="bp-cal"><p class="bp-k">October · Select a time</p><div class="bp-days">${Array.from({ length: 21 }, (_, i) => `<i class="${i === 9 ? 'on' : i % 6 === 5 ? 'off' : ''}">${i + 6}</i>`).join('')}</div>
        <div class="bp-slots"><i>09:00</i><i class="on">10:30</i><i>12:00</i><i>15:30</i></div><span class="bp-cta">Confirm booking</span></div></div></div>`,
  landing: (t, e) => `<div class="bpv bp-land">
    <div class="bp-nav"><b>LAUNCH<span>/</span>01</b><span class="bp-btn">Get early access</span></div>
    <div class="bp-center"><p class="bp-k">Available this autumn</p><p class="bp-h">${e(t.headline)}</p><p class="bp-p">Everything on this page leads to a single, clear action.</p><span class="bp-cta">Get early access</span></div>
    <div class="bp-proof"><span>Trusted by teams at</span><i></i><i></i><i></i><i></i></div>
    <div class="bp-ben"><div><b>01</b><span>Clear offer</span></div><div><b>02</b><span>Fast to load</span></div><div><b>03</b><span>Built to convert</span></div></div></div>`,
  portfolio: (t, e) => `<div class="bpv bp-port">
    <div class="bp-nav"><b>STUDIO MAREN</b><nav><span>Work</span><span>About</span><span>Contact</span></nav></div>
    <div class="bp-hero"><p class="bp-h">${e(t.headline)}</p><p class="bp-k">Architecture · Interiors · Photography</p></div>
    <div class="bp-grid"><div class="g1"><span>Casa Lume · 2026</span></div><div class="g2"><span>The Orchard</span></div><div class="g3"><span>Atelier Nord</span></div><div class="g4"><span>Case study →</span></div></div></div>`,
  custom: (t, e) => `<div class="bpv bp-custom">
    <div class="bp-nav"><b><span>_</span>LAB</b><nav><span>Experience</span><span>System</span><span>Contact</span></nav></div>
    <div class="bp-hero"><div class="bp-copy"><p class="bp-k">Interactive · 3D · Integrations</p><p class="bp-h">${e(t.headline)}</p><span class="bp-cta">Explore the experience</span></div>
      <div class="bp-stack"><div class="s1"><b>Scene</b><i></i><i></i><i></i></div><div class="s2"><b>Motion</b><span class="bp-slider"><i></i></span><span class="bp-toggle"></span></div><div class="s3"><code>render(&lt;Experience /&gt;)</code></div></div></div></div>`
};

function render(C, H) {
  const K = C.projectSelectorConfig, T = (C.buildTypes || []).filter(t => t.enabled !== false);
  if (!K || !T.length) return '';
  const e = H.esc, active = Math.max(0, T.findIndex(t => t.id === K.defaultProject));
  const hasPackages = C.sections.packages && C.sections.packages.enabled && C.sections.order.includes('packages');
  return `<section class="sec bld" id="build" data-ext="builder" aria-labelledby="bld-title" style="--bld-dur:${+K.animationDuration || 650}ms">
  <div class="container">
    <header class="sec-head">
      <p class="sec-meta mono" data-reveal><span>${e(K.eyebrow)}</span></p>
      <h2 class="sec-title" id="bld-title" data-reveal>${H.accentize(K.headline, K.accent)}</h2>
      <p class="sec-intro" data-reveal>${e(K.intro)}</p>
    </header>
    <div class="bld-grid">
      <div class="bld-side">
        <div class="bld-list" role="tablist" aria-label="Website types" data-reveal>
          <span class="bld-ind" aria-hidden="true"></span>
          ${T.map((t, i) => `<button class="bld-opt${K.showNumbers ? '' : ' no-n'}" role="tab" id="bld-tab-${i}" aria-selected="${i === active}" aria-controls="bld-panel" tabindex="${i === active ? 0 : -1}" data-i="${i}">${K.showNumbers ? `<span class="n mono">${pad(i + 1)}</span>` : ''}<span class="t">${e(t.title)}</span></button>`).join('')}
        </div>
        <div class="bld-info" id="bld-panel" role="tabpanel" aria-labelledby="bld-tab-${active}" aria-live="polite">${info(T[active], K, e, hasPackages, active, T.length)}</div>
      </div>
      <div class="bld-stage" data-reveal aria-hidden="true">
        <div class="bld-grid-bg"></div><div class="bld-glow"></div>
        <div class="bld-rig">
          ${T.map((t, i) => `<div class="bld-pv${i === active ? ' is-on' : ''}" data-i="${i}">
            ${t.image && t.image.src ? photo(t, e) : `<div class="bld-frame"><div class="bld-chrome"><i></i><span>${e(t.id)}.yourbrand.com</span></div><div class="bld-screen">${(PREVIEW[t.preview] || PREVIEW.business)(t, e)}</div></div>
            ${(t.floaters || []).slice(0, 2).map((f, k) => `<span class="bld-float f${k} mono">${e(f)}</span>`).join('')}`}
          </div>`).join('')}
        </div>
        <div class="bld-foot mono"><span id="bld-count">${pad(active + 1)} / ${pad(T.length)}</span><span class="bld-tech">${(K.techLabels || []).map(e).join('<i></i>')}</span></div>
      </div>
    </div>
  </div>
</section>`;
}
/* image preview: a cropped region of a supplied image, edges blended into the page */
function photo(t, e) {
  const im = t.image, c = im.crop;
  if (!c) return `<div class="bld-photo"><div class="bld-photo-in"><img src="${e(im.src)}" alt="${e(t.title)} example" loading="eager"></div></div>`;
  return `<div class="bld-photo"><div class="bld-photo-in" style="aspect-ratio:${c.w}/${c.h}"><img class="bld-crop" src="${e(im.src)}" alt="${e(t.title)} example: website shown on a laptop and a phone" loading="eager"
    style="width:${(im.sourceWidth / c.w * 100).toFixed(3)}%;left:${(-c.x / c.w * 100).toFixed(3)}%;top:${(-c.y / c.h * 100).toFixed(3)}%"></div></div>`;
}
function info(t, K, e, hasPackages, i, n) {
  return `<p class="bld-type mono">${e(t.title)}</p>
    <p class="bld-desc">${e(t.description)}</p>
    ${K.showFeatures ? `<ul class="bld-feat">${t.features.map(f => `<li>${e(f)}</li>`).join('')}</ul>` : ''}
    <div class="bld-ctas"><button class="btn btn-primary" data-bld="start">${e(K.ctaLabel)} <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></button>
      ${K.showSecondaryCTA && hasPackages ? `<button class="link" data-bld="packages">${e(K.secondaryLabel)}</button>` : ''}</div>`;
}

function mount(root, C) {
  if (inst) inst.destroy();
  const K = C.projectSelectorConfig, T = (C.buildTypes || []).filter(t => t.enabled !== false);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(pointer: fine)').matches;
  const anim = K.animationEnabled && !reduced;
  const opts = [...root.querySelectorAll('.bld-opt')], pvs = [...root.querySelectorAll('.bld-pv')];
  const ind = root.querySelector('.bld-ind'), panel = root.querySelector('.bld-info'), count = root.querySelector('#bld-count');
  const stage = root.querySelector('.bld-stage'), rig = root.querySelector('.bld-rig');
  const hasPackages = !!document.getElementById('packages');
  let locked = Math.max(0, T.findIndex(t => t.id === K.defaultProject)), shown = locked, hoverT = 0, raf = 0, mx = 0, my = 0, tx = 0, ty = 0, dead = false;
  root.classList.toggle('bld-noanim', !anim);
  const I3 = (K.threeDIntensity || 0) * (innerWidth < 1101 ? .5 : 1);

  function placeInd() {
    const o = opts[shown]; if (!o || !ind) return;
    if (innerWidth < 761) { ind.style.cssText = `transform:translateX(${o.offsetLeft}px);width:${o.offsetWidth}px;height:2px;top:auto;bottom:0`; return; }
    ind.style.cssText = `transform:translateY(${o.offsetTop}px);height:${o.offsetHeight}px`;
  }
  function show(i, lock) {
    if (lock) locked = i;
    if (i === shown) { placeInd(); return; }
    const prev = shown; shown = i;
    opts.forEach((o, k) => { o.setAttribute('aria-selected', k === i); o.tabIndex = k === i ? 0 : -1; o.classList.toggle('is-on', k === i); });
    pvs.forEach((p, k) => { p.classList.toggle('is-on', k === i); p.classList.toggle('is-out', k === prev); });
    clearTimeout(show.t); show.t = setTimeout(() => pvs[prev] && pvs[prev].classList.remove('is-out'), (+K.animationDuration || 650) + 50);
    panel.innerHTML = info(T[i], K, C.__esc || (s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))), hasPackages, i, T.length);
    panel.setAttribute('aria-labelledby', 'bld-tab-' + i); panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    count.textContent = `${pad(i + 1)} / ${pad(T.length)}`;
    placeInd();
    if (innerWidth < 761) { const o = opts[i], list = o.parentElement; list.scrollTo({ left: o.offsetLeft - (list.clientWidth - o.offsetWidth) / 2, behavior: anim ? 'smooth' : 'auto' }); }
  }
  opts.forEach((o, i) => {
    o.classList.toggle('is-on', i === shown);
    o.addEventListener('click', () => {
      show(i, true);
      // stacked layout (tablet / phone / zoomed windows): bring the website preview into view
      if (innerWidth < 1101) { const st = root.querySelector('.bld-stage'), r = st.getBoundingClientRect(); if (r.top < 70 || r.bottom > innerHeight) st.scrollIntoView({ behavior: anim ? 'smooth' : 'auto', block: 'center' }); }
    });
    if (K.hoverPreview) {
      o.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; clearTimeout(hoverT); hoverT = setTimeout(() => show(i, false), 110); });
    }
    o.addEventListener('keydown', e => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      e.preventDefault(); const n = (i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + T.length) % T.length; show(n, true); opts[n].focus();
    });
  });
  const list = root.querySelector('.bld-list');
  list.addEventListener('pointerleave', () => { clearTimeout(hoverT); if (shown !== locked) hoverT = setTimeout(() => show(locked, false), 160); });

  // CTAs: preselect the project type in the brief, then scroll there
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-bld]'); if (!b) return;
    if (b.dataset.bld === 'packages') { const p = document.getElementById('packages'); p && p.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); return; }
    const t = T[shown], radio = document.querySelector(`#briefForm input[name="projectType"][value="${t.briefType}"]`);
    if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
    const target = document.getElementById('brief') || document.getElementById('contact');
    if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  });

  // restrained 3D parallax inside the preview area (desktop only)
  function frame() {
    raf = 0; if (dead) return;
    mx += (tx - mx) * .08; my += (ty - my) * .08;
    rig.style.transform = `rotateY(${(-4 + mx * 3) * I3}deg) rotateX(${(2 - my * 2) * I3}deg)`;
    root.style.setProperty('--bmx', mx.toFixed(3)); root.style.setProperty('--bmy', my.toFixed(3));
    if (Math.abs(tx - mx) > .002 || Math.abs(ty - my) > .002) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const onMove = e => { if (liteOn()) return; const r = stage.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width * 2 - 1); ty = ((e.clientY - r.top) / r.height * 2 - 1); kick(); };
  const onLeave = () => { tx = ty = 0; kick(); };
  if (fine && K.mouseParallax && !reduced) { stage.addEventListener('pointermove', onMove, { passive: true }); stage.addEventListener('pointerleave', onLeave); }
  const onResize = () => placeInd();
  addEventListener('resize', onResize, { passive: true });
  placeInd(); frame();
  inst = { destroy() { dead = true; cancelAnimationFrame(raf); removeEventListener('resize', onResize); inst = null; } };
}

EXT.builder = { render, mount };
})();
