/* iTECH — cart page. Package comes from ?pkg=id; texts and prices from config.js packagesConfig.pricing[lang]
   (read as written: RO in lei, EN/DE in EUR). Online payment is not connected yet: once a provider is chosen,
   put its link per package in cartConfig.payLinks (config.js); until then the order goes to WhatsApp. */
(function () {
'use strict';
const C = window.ITECH_CONFIG, T = window.ITECH_T, I = window.ITECH_I18N, K = C.packagesConfig;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const L = (K.pricing || {})[I.lang] || K.pricing.en;
const items = K.items.filter(p => p.enabled !== false && L.packages[p.id] && L.packages[p.id].launchPrice);
const q = new URLSearchParams(location.search).get('pkg');
let sel = items.find(p => p.id === q) || items.find(p => p.featured) || items[0], step = 1;
const PAY = (C.cartConfig && C.cartConfig.payLinks) || {};
const main = document.getElementById('cart');
document.documentElement.lang = I.lang;
const ico = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICO = {
  mon: ico('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
  spark: ico('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
  user: ico('<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4"/>'),
  mail: ico('<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>'),
  tel: ico('<path d="M6.6 4h3l1.2 3.6-1.9 1.3a11 11 0 0 0 5.2 5.2l1.3-1.9 3.6 1.2v3a2 2 0 0 1-2.2 2A14.4 14.4 0 0 1 4.6 6.2 2 2 0 0 1 6.6 4z"/>'),
  chat: ico('<path d="M4 5h16v11H9l-5 4z"/>'),
  coin: ico('<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>'),
  arrow: ico('<path d="M5 12h14M13 6l6 6-6 6"/>')
};
const bk = document.getElementById('cBack'); bk.textContent = T('Back to packages');
bk.insertAdjacentHTML('afterbegin', ico('<path d="M19 12H5M11 6l-6 6 6 6"/>'));

const feat = f => esc(Array.isArray(f) ? f[0] : f);
// two short highlights per package (Grow and Premium start with "Everything included in …", so skip that line)
const hl = (p, P) => P.features.slice(p.id === 'start' ? 0 : 1, p.id === 'start' ? 2 : 3);
function wa(P, f) {
  const n = String(K.whatsappNumber || '').replace(/\D/g, '');
  const msg = `${T('Order')}: ${P.title} (${P.launchPrice})\n${T('Name')}: ${f.name}\nEmail: ${f.email}${f.phone ? `\n${T('Phone')}: ${f.phone}` : ''}`;
  return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
}
const steps = () => ['Package', 'Details', 'Confirmation'].map((k, i) => `<li class="${i + 1 < step ? 'done' : ''}${i + 1 === step ? ' on' : ''}"><b>0${i + 1}</b><span>${esc(T(k))}</span></li>`).join('');
function draw() {
  const old = main.querySelector('form') ? Object.fromEntries(new FormData(main.querySelector('form'))) : {};
  const P = L.packages[sel.id];
  main.innerHTML = `<div class="cs-wrap"><section class="cs-left"><h1>${esc(T("Let's build your next"))} <em>${esc(T('website.'))}</em></h1>
    <p class="cs-lead">${esc(T('Choose your package. We shape your idea.'))}</p>
    <fieldset class="cs-pk"><legend class="cs-sr">${esc(T('Package'))}</legend>
    ${items.map(p => { const x = L.packages[p.id]; return `<label class="cs-opt"><input type="radio" name="pk" value="${esc(p.id)}"${p.id === sel.id ? ' checked' : ''}><i class="cs-rad" aria-hidden="true"></i>
      <span class="cs-main"><b>${esc(x.title)}${x.badge ? `<em class="cs-badge">${esc(x.badge)}</em>` : ''}</b><small>${esc(x.subtitle)}</small></span>
      <ul class="cs-hl">${hl(p, x).map((f, i) => `<li>${ICO[i ? 'spark' : 'mon']}<span>${feat(f)}</span></li>`).join('')}</ul>
      <span class="cs-pr">${x.oldPrice ? `<s>${esc(x.oldPrice)}</s>` : ''}<b>${esc(x.launchPrice)}</b></span></label>`; }).join('')}</fieldset></section>
  <aside class="cs-right"><ol class="cs-steps" id="csSteps">${steps()}</ol>
  <form class="cs-box" id="csForm" novalidate><h2>${esc(T('Your project'))}</h2>
    <ul class="cs-sum"><li><span>${esc(P.title)}</span><b>${esc(P.launchPrice)}</b></li>${P.savings ? `<li class="cs-sv">${esc(P.savings)}</li>` : ''}</ul>
    <div class="cs-total"><span>${esc(T('Estimated total'))}</span><b>${esc(P.launchPrice)}</b></div>
    <label class="cs-fl">${esc(T('Full name'))}<span class="cs-in">${ICO.user}<input type="text" name="name" autocomplete="name" placeholder="${esc(T('Name and surname'))}" required></span></label>
    <label class="cs-fl">Email<span class="cs-in">${ICO.mail}<input type="email" name="email" autocomplete="email" placeholder="example@email.com" required></span></label>
    <label class="cs-fl">${esc(T('Phone'))} (${esc(T('optional'))})<span class="cs-in">${ICO.tel}<input type="tel" name="phone" autocomplete="tel" placeholder="07XX XXX XXX"></span></label>
    <label class="cs-chk"><input type="checkbox" name="terms" required><span>${esc(T('I agree to the'))} <a href="termeni.html" target="_blank" rel="noopener">${esc(T('Terms'))}</a> ${esc(T('and the'))} <a href="confidentialitate.html" target="_blank" rel="noopener">${esc(T('Privacy Policy'))}</a>.</span></label>
    <p class="cs-err" id="csErr" role="alert"></p>
    <button class="cs-btn" type="submit"><span>${esc(PAY[sel.id] ? T('Pay by card') : T('Send request'))}</span>${ICO.arrow}</button>
    <div class="cs-msg" id="csMsg" hidden></div>
    <p class="cs-note">${ICO.chat}<span>${esc(T('We discuss the details before the project starts.'))}</span></p>
    <p class="cs-note">${ICO.coin}<span>${esc(L.note || '')}</span></p></form></aside></div>`;
  const form = document.getElementById('csForm');
  ['name', 'email', 'phone'].forEach(k => { if (old[k]) form.elements[k].value = old[k]; });
  const mark = n => { step = n; document.getElementById('csSteps').innerHTML = steps(); };
  form.addEventListener('input', () => { if (step < 2) mark(2); });
  main.querySelectorAll('input[name=pk]').forEach(r => r.onchange = () => { sel = items.find(p => p.id === r.value); history.replaceState(null, '', `?pkg=${sel.id}`); draw(); });
  form.onsubmit = e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form)), err = document.getElementById('csErr');
    if (!f.name.trim()) return err.textContent = T('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return err.textContent = T('Please enter a valid email.');
    if (!f.terms) return err.textContent = T('Please accept the Terms and the Privacy Policy.');
    err.textContent = '';
    if (PAY[sel.id]) { location.href = PAY[sel.id]; return; }
    mark(3);
    const m = document.getElementById('csMsg');
    m.hidden = false;
    m.innerHTML = `${esc(T('Card payment will be available soon. Send your order on WhatsApp and we will confirm it right away.'))}<br><br><a class="cs-btn" href="${esc(wa(P, f))}" target="_blank" rel="noopener"><span>${esc(T('Send order on WhatsApp'))}</span></a>`;
  };
  if (step > 1) { document.getElementById('csSteps').innerHTML = steps(); }
}
draw();
})();
