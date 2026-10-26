/* iTECH — "synapse" sections: the story that follows the hero (at-a-glance numbers) and a film footer.
   All copy, numbers and video URLs live in config.js → synapseConfig. Every film loads only when its section is near the screen
   and plays only while it is visible. Fonts and colours come from the site. */
(function () {
'use strict';
const EXT = window.ITECH_EXT = window.ITECH_EXT || {};
const T = s => (window.ITECH_T ? window.ITECH_T(s) : s);
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let H = null, cleanup = null;

const vid = (src) => `<video class="syx-vid" muted loop playsinline preload="none" data-src="${H.esc(src)}" aria-hidden="true"></video>`;

function render(C, h) {
  H = h; const S = C.synapseConfig, e = h.esc;
  return `<div data-ext="synapse" class="syx">
  <section class="syx-sec syx-metrics" aria-label="${e(T(S.metrics.subtitle))}">
    ${vid(S.videos.metrics)}
    <div class="syx-inner">
      <p class="syx-k syx-r">${e(T(S.metrics.subtitle))}</p>
      <div class="syx-grid3">${S.metrics.items.map((m, i) => `<div class="syx-r syx-m" style="--d:${i * .15}s"><b>${e(m[0])}</b><span>${e(T(m[1]))}</span></div>`).join('')}</div>
    </div>
  </section>
</div>`;
}

function renderFoot(C, h) {
  H = h; const S = C.synapseConfig, e = h.esc;
  return `<section data-ext="synapseFoot" class="syx-foot" aria-label="${e(C.brandConfig.name)}">
  <div class="syx-fvid">${vid(S.videos.foot)}</div>
  <div class="syx-fcol">
    <div>
      <p class="syx-fbrand">${e(C.brandConfig.name)}</p>
      ${S.foot.text ? `<p class="syx-ftext">${e(T(S.foot.text))}</p>` : ''}
    </div>
    <p class="syx-fcopy">${e(T(S.foot.copy))}</p>
  </div>
</section>`;
}

/* films: load when near the screen, play while visible */
function wireVideos(root, offs) {
  const nc = navigator.connection || {};
  const vids = [].slice.call(root.querySelectorAll('video[data-src]'));
  if (!('IntersectionObserver' in window) || nc.saveData || /(^|-)(2|3)g$/.test(nc.effectiveType || '')) return;   // the films are 12-13 MB: not on slow connections / data saver
  const io = new IntersectionObserver(es => es.forEach(en => {
    const v = en.target;
    if (en.isIntersecting) { if (!v.getAttribute('src')) v.src = v.dataset.src; const p = v.play(); if (p && p.catch) p.catch(() => { }); }
    else v.pause();
  }), { rootMargin: '250px 0px', threshold: 0.01 });
  vids.forEach(v => io.observe(v));
  offs.push(() => io.disconnect());
}

function mount(el, C) {
  if (cleanup) { cleanup(); cleanup = null; }
  const offs = [];
  const roots = [].slice.call(document.querySelectorAll('[data-ext="synapse"],[data-ext="synapseFoot"]'));
  roots.forEach(r => wireVideos(r, offs));

  /* reveal on scroll */
  const rv = [].slice.call(document.querySelectorAll('.syx-r'));
  if ('IntersectionObserver' in window && !reducedMotion()) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .25 });
    rv.forEach(x => io.observe(x)); offs.push(() => io.disconnect());
  } else rv.forEach(x => x.classList.add('in'));

  cleanup = () => offs.forEach(f => f());
}

EXT.synapse = { render, mount };
EXT.synapseFoot = { render: renderFoot, mount: () => { } };
})();
