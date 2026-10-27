/* iTECH — "synapse" sections: the story that follows the hero (at-a-glance numbers) and a film footer.
   All copy, numbers and video URLs live in config.js → synapseConfig. Every film loads only when its section is near the screen
   and plays only while it is visible. Fonts and colours come from the site. */
(function () {
'use strict';
const EXT = window.ITECH_EXT = window.ITECH_EXT || {};
const T = s => (window.ITECH_T ? window.ITECH_T(s) : s);
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let H = null, cleanup = null;

/* phones get a light portrait/landscape encode (about 0.3-0.5 MB instead of 6-7 MB) and a poster, so the section is never an empty black box */
const phone = () => matchMedia('(max-width:760px)').matches;
const vid = (key, S) => {
  const m = phone() && S.videosMobile && S.videosMobile[key], src = m || S.videos[key], poster = phone() ? (S.postersMobile || {})[key] : (S.posters || {})[key];
  return `<video class="syx-vid" muted loop playsinline webkit-playsinline preload="none" data-src="${H.esc(src)}"${poster ? ` poster="${H.esc(poster)}"` : ''} aria-hidden="true"></video>`;
};

/* contact icons: only the confirmed channels of config.finalContact; a channel without an address is skipped */
const GMAIL = to => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}`;
const ICO = {
  whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.2 19.8l1.1-3.9A8.2 8.2 0 1 1 8.4 19z"/><path d="M9.2 8.4c.2-.5.6-.5.9-.5.2 0 .4.4.6 1 .2.5-.4.9-.4 1.1.3.8 1.4 1.9 2.4 2.3.2.1.6-.6 1-.5.5.1 1.1.5 1.2.7.1.3-.1 1.1-.9 1.5-.9.4-2 .2-3.7-1.1-1.7-1.3-2.5-2.8-2.6-3.6-.1-.5.1-1.4.5-1.8z" fill="currentColor" stroke="none"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.9" cy="7.1" r=".6" fill="currentColor"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 8.5h2V5.2h-2.4c-2.3 0-3.6 1.4-3.6 3.7v2H8.5v3.2h2V20h3.3v-5.9h2.4l.4-3.2h-2.8V9.4c0-.6.3-.9.7-.9z"/></svg>'
};
function contactLinks(K) {
  const out = [];
  if (K.whatsappNumber) out.push(['whatsapp', 'WhatsApp', `https://wa.me/${String(K.whatsappNumber).replace(/\D/g, '')}?text=${encodeURIComponent(K.whatsappMessage || '')}`]);
  if (/^https:\/\/(www\.)?instagram\.com\/[^/?#]+/.test(K.instagram || '')) out.push(['instagram', 'Instagram', K.instagram]);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(K.email || '')) out.push(['email', 'Email', GMAIL(K.email)]);
  if (/^https:\/\/(www\.|m\.)?facebook\.com\/[^#]+/.test(K.facebook || '')) out.push(['facebook', 'Facebook', K.facebook]);
  return out;
}
/* synapseConfig.brandBlock: the big logo + contact icons that replace the numbers over the first film (the numbers stay in config) */
function renderBrand(C, h) {
  const S = C.synapseConfig, e = h.esc, b = C.brandConfig, links = contactLinks(C.finalContact || {});
  return `<div data-ext="synapse" class="syx">
  <section class="syx-sec syx-brand" aria-label="${e(b.name)}">
    ${vid('metrics', S)}
    <div class="syx-inner">
      <p class="syx-logo syx-r" role="img" aria-label="${e(b.name)}">${b.logoPrefix ? '<span class="syx-us" aria-hidden="true"></span>' : ''}${h.logoName ? h.logoName(b.name) : e(b.name)}</p>
      <ul class="syx-ct" role="list">${links.map((l, i) => `<li class="syx-r" style="--d:${.18 + i * .08}s"><a class="syx-ico syx-ico-${l[0]}" href="${e(l[2])}" target="_blank" rel="noopener noreferrer" aria-label="${e(l[1])} ${e(T('(opens in a new tab)'))}">${ICO[l[0]]}</a></li>`).join('')}</ul>
    </div>
  </section>
</div>`;
}

function render(C, h) {
  H = h; const S = C.synapseConfig, e = h.esc;
  if (S.brandBlock && S.brandBlock.enabled) return renderBrand(C, h);
  return `<div data-ext="synapse" class="syx">
  <section class="syx-sec syx-metrics" aria-label="${e(T(S.metrics.subtitle))}">
    ${vid('metrics', S)}
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
  <div class="syx-fvid">${vid('foot', S)}</div>
  <div class="syx-fcol">
    <div>
      <p class="syx-fbrand">${h.logoName ? h.logoName(C.brandConfig.name) : e(C.brandConfig.name)}</p>
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
  if (!('IntersectionObserver' in window) || nc.saveData || /(^|-)2g$/.test(nc.effectiveType || '')) return;   // data saver / 2G: the poster stays
  const io = new IntersectionObserver(es => es.forEach(en => {
    const v = en.target;
    if (en.isIntersecting) { if (!v.getAttribute('src')) v.src = v.dataset.src; const p = v.play(); if (p && p.catch) p.catch(() => { const go = () => { v.play().catch(() => { }); }; addEventListener('touchstart', go, { once: true, passive: true }); }); }   // low-power mode blocks autoplay: the first touch starts it
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

  /* the film drifts slower than the page: scroll-linked parallax (transform only, one write per frame, only while the section is on screen) */
  const brand = document.querySelector('.syx-brand'), pv = brand && brand.querySelector('.syx-vid');
  if (pv && !reducedMotion() && 'IntersectionObserver' in window) {
    let on = false, queued = false;
    const upd = () => { queued = false; const r = brand.getBoundingClientRect(), vh = innerHeight, prog = (vh - r.top) / (vh + r.height); pv.style.transform = 'translate3d(0,' + ((prog - .5) * 90).toFixed(1) + 'px,0) scale(1.14)'; };
    const onScroll = () => { if (on && !queued) { queued = true; requestAnimationFrame(upd); } };
    const pio = new IntersectionObserver(es => { on = es[es.length - 1].isIntersecting; if (on) onScroll(); }, { rootMargin: '10% 0px' });
    pio.observe(brand); addEventListener('scroll', onScroll, { passive: true });
    offs.push(() => { pio.disconnect(); removeEventListener('scroll', onScroll); });
  }

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
