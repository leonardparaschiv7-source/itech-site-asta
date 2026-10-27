/* iTECH — Testimonials: CLIENT STORIES
   Approved client reviews in a layered 3D deck + a "Leave a review" form.

   Data flow (ReviewService below — the only place that knows about storage):
   · Public reviews  = C.testimonialConfig.reviews (published with the site)
                     + reviews.json (published by the owner from the moderation panel)
                     + the artifact database collection "reviews" (approved copies).
     Only entries with status "approved" are shown, reduced to public fields.
     Emails never leave the private submissions store.
   · New submissions → artifact database "submissions/<viewer id>", always
     status "pending". Readable only by the submitter and the site owner.
     When this view cannot store data (signed out, view-only link, local file),
     the form says so and offers to send the review to iTECH on WhatsApp.
   · To connect Supabase / Firebase / an API later, add an adapter with the
     same methods (publicReviews, submit, submissions, moderate).          */
(function () {
'use strict';
const EXT = window.ITECH_EXT = window.ITECH_EXT || {};
const liteOn = () => document.documentElement.classList.contains('perf-lite');   // adaptive quality (app.js)
let inst = null, H = null;
const pad = n => String(n).padStart(2, '0');
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── sanitising: plain text only, never HTML ── */
const clean = (v, max) => String(v == null ? '' : v).replace(/<[^>]*>/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F<>]/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
const isUrl = v => { try { const u = new URL(v); return /^https?:$/.test(u.protocol) && /\./.test(u.hostname); } catch (e) { return false; } };
const isEmail = v => /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(v);
function toPublic(r, id) {
  if (!r || r.status !== 'approved') return null;
  const rating = Math.round(Number(r.rating));
  const review = clean(r.review, 600), name = clean(r.name, 80);
  if (!(rating >= 1 && rating <= 5) || !review || !name) return null;
  return {
    id: String(r.id || id || name + r.createdAt), name, company: clean(r.company, 80), projectType: clean(r.projectType, 40),
    rating, review, projectUrl: r.showUrl && isUrl(r.projectUrl) ? r.projectUrl : '', verified: r.verified === true,
    featured: r.featured === true, logo: r.logo && /^(img\/|https:\/\/)/.test(r.logo) ? r.logo : '', createdAt: r.createdAt || r.approvedAt || ''
  };
}

/* ── ReviewService ── */
const ReviewService = (() => {
  let db = null, uid = null, owner = false, art = null, mode = 'none', ready = null;
  const demo = window.ITECH_REVIEWS_DEMO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && /[?&]reviews=demo/.test(location.search)
    ? { subs: {}, pub: {}, fail: false } : null;     // local development only — never on the published page
  const listeners = new Set();
  let dbPub = [], unsub = null;
  const emit = () => listeners.forEach(f => f());
  if (demo) demo.emit = emit;
  function init() {
    if (ready) return ready;
    ready = (async () => {
      if (demo) { mode = 'demo'; owner = true; uid = 'demo-visitor'; return; }
      if (!(window.claude && window.claude.use)) return;
      const [d, u, a] = await Promise.all(['db', 'user', 'artifact'].map(n => window.claude.use(n).catch(() => null)));
      db = d; art = a;
      if (u) { try { owner = !!(await u.isOwner()); } catch (e) { } try { uid = await u.id(); } catch (e) { } }
      if (db) {
        mode = 'db';
        try {
          unsub = db.collection('reviews').where('status', '==', 'approved').onSnapshot(s => { dbPub = s.docs.map(x => toPublic(x.data(), x.id)).filter(Boolean); emit(); }, () => { });
        } catch (e) { }
      }
    })();
    return ready;
  }
  return {
    init, onChange(f) { listeners.add(f); return () => listeners.delete(f); },
    get mode() { return mode; }, get isOwner() { return owner; }, get canPublish() { return !!art && owner; },
    /* approved + public fields only */
    publicReviews(extra) {
      const map = new Map();
      [...extra, ...dbPub, ...(demo ? Object.values(demo.pub) : [])].forEach(r => { if (r && !map.has(r.id)) map.set(r.id, r); });
      return [...map.values()].sort((a, b) => (b.featured - a.featured) || (b.verified - a.verified) || String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    /* always creates status "pending" — the client never chooses its status */
    async submit(data) {
      await init();
      const doc = { name: clean(data.name, 80), email: clean(data.email, 160), company: clean(data.company, 80), projectType: clean(data.projectType, 40),
        rating: Math.max(1, Math.min(5, Math.round(+data.rating))), review: clean(data.review, 600), projectUrl: data.projectUrl && isUrl(data.projectUrl) ? clean(data.projectUrl, 200) : '',
        status: 'pending', verified: false, createdAt: new Date().toISOString() };
      if (mode === 'demo') { await new Promise(r => setTimeout(r, 700)); if (demo.fail) throw { code: 'unavailable' }; demo.subs['s' + Date.now()] = doc; emit(); return { stored: true }; }
      if (mode !== 'db' || !uid) {
        // published site without the artifact database: the review arrives by email (Web3Forms) and is approved by the owner
        const key = window.ITECH_CONFIG && window.ITECH_CONFIG.contactConfig && window.ITECH_CONFIG.contactConfig.web3formsKey;
        if (!key) return { stored: false, doc };
        try {
          const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ access_key: key, subject: 'iTECH — new client review (please approve)', from_name: 'iTECH website', name: doc.name, email: doc.email,
              message: `Name: ${doc.name}\nEmail: ${doc.email}${doc.company ? '\nCompany: ' + doc.company : ''}\nProject: ${doc.projectType}\nRating: ${doc.rating}/5${doc.projectUrl ? '\nURL: ' + doc.projectUrl : ''}\nDate: ${doc.createdAt}\n\n"${doc.review}"` }) });
          const j = await res.json().catch(() => ({}));
          return res.ok && j.success !== false ? { stored: true } : { stored: false, doc };
        } catch (e) { return { stored: false, doc }; }
      }
      try { await db.doc('submissions/' + uid).set(doc); return { stored: true }; }
      catch (e) {
        if (e && /invalid_argument|not_granted|capability_disabled|capability_removed|revoked/.test(e.code)) return { stored: false, doc };
        if (e && e.code === 'unavailable') { await new Promise(r => setTimeout(r, 600 + Math.random() * 600)); await db.doc('submissions/' + uid).set(doc); return { stored: true }; }
        throw e;
      }
    },
    /* owner only */
    watchSubmissions(cb) {
      if (mode === 'demo') { cb(Object.entries(demo.subs).map(([id, d]) => ({ id, ...d }))); const f = () => cb(Object.entries(demo.subs).map(([id, d]) => ({ id, ...d }))); listeners.add(f); return () => listeners.delete(f); }
      if (!db || !owner) return () => { };
      try { return db.collection('submissions').onSnapshot(s => cb(s.docs.map(x => ({ id: x.id, ...x.data() }))), () => cb(null)); } catch (e) { return () => { }; }
    },
    async moderate(sub, status, opts = {}) {
      if (!owner) return;
      const pub = { name: sub.name, company: sub.company || '', projectType: sub.projectType || '', rating: sub.rating, review: sub.review, projectUrl: sub.projectUrl || '',
        showUrl: !!opts.showUrl, verified: !!opts.verified, createdAt: sub.createdAt, approvedAt: new Date().toISOString(), status: 'approved' };
      if (mode === 'demo') { demo.subs[sub.id].status = status; if (status === 'approved') demo.pub[sub.id] = toPublic({ ...pub, id: sub.id }); else delete demo.pub[sub.id]; emit(); return; }
      await db.doc('submissions/' + sub.id).update({ status, verified: !!opts.verified, moderatedAt: new Date().toISOString() });
      if (status === 'approved') await db.doc('reviews/' + sub.id).set(pub);
      else await db.doc('reviews/' + sub.id).delete();
    },
    /* writes reviews.json so visitors who cannot read the database see approved reviews too */
    async publishFile(list) {
      if (!art || !owner) throw { code: 'not_writer' };
      const body = { reviews: list.map(r => ({ ...r, status: 'approved', showUrl: !!r.projectUrl })) };
      await art.publish({ 'reviews.json': { content: JSON.stringify(body, null, 1), contentType: 'application/json' } });
    },
    destroy() { if (unsub) unsub(); unsub = null; }
  };
})();
EXT.reviewService = ReviewService;

/* ── icons ── */
const STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.6l2.47 5.3 5.8.68-4.3 3.96 1.15 5.73L10 14.4l-5.12 2.87 1.15-5.73-4.3-3.96 5.8-.68z"/></svg>';
const stars = (n, cls = '') => `<span class="rv-stars ${cls}" role="img" aria-label="Rated ${n} out of 5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? 'on' : ''}">${STAR}</i>`).join('')}</span>`;
const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
const CHEV = d => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="${d ? 'M3 8h10M9 4l4 4-4 4' : 'M13 8H3M7 4L3 8l4 4'}"/></svg>`;
const MSG = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3.5 4.5h13v9h-7l-4 3v-3h-2z"/><path d="M10 6.6l.8 1.7 1.9.2-1.4 1.3.4 1.9-1.7-.9-1.7.9.4-1.9-1.4-1.3 1.9-.2z" fill="currentColor" stroke="none"/></svg>';
// labels in the visitor's language (i18n.js); English when the language layer is missing
const tt = (s, v) => window.ITECH_T ? window.ITECH_T(s, v) : s.replace(/\{(\w+)\}/g, (m, k) => v && v[k] != null ? v[k] : m);
const fmtDate = s => { const d = new Date(s); return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); };
const initials = n => n.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

function render(C, helpers, num) {
  H = helpers;
  const T = C.testimonialConfig, e = H.esc;
  const types = T.projectTypes || [];
  const L = T.ratingLabels || ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
  const max = T.reviewMax || 600;
  return `<section class="sec rv-sec" id="testimonials" aria-labelledby="testimonials-title"><div class="container">
  <div class="rv" data-ext="reviews">
    <div class="rv-side">
      ${H.head}
      <div class="rv-sum" data-reveal aria-live="polite"></div>
      ${T.reviewSubmissionEnabled !== false ? `<button type="button" class="btn btn-ghost rv-cta" data-rv="open" aria-haspopup="dialog">${MSG}<span>${e(T.ctaLabel || 'Leave a review')}</span>${ARROW}</button>` : ''}
      <button type="button" class="rv-own mono" data-rv="mod" hidden>Moderation <b>0</b> pending</button>
    </div>
    <div class="rv-main" data-reveal>
      <div class="rv-filters" role="group" aria-label="Filter reviews by project" hidden></div>
      <div class="rv-stage" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Client reviews. Use the left and right arrow keys to browse.">
        <div class="rv-deck"></div>
      </div>
      <div class="rv-ctrl" hidden>
        <button type="button" class="rv-arw" data-rv="prev" aria-label="${e(tt('Previous review'))}">${CHEV(0)}</button>
        <span class="rv-count mono" aria-live="polite"><b>01</b> / <span>01</span></span>
        <button type="button" class="rv-arw" data-rv="next" aria-label="${e(tt('Next review'))}">${CHEV(1)}</button>
        <span class="rv-bar" aria-hidden="true"><i></i></span>
      </div>
    </div>
  </div>

  <dialog class="rv-modal" aria-labelledby="rvFormTitle">
    <div class="rv-sheet">
      <button type="button" class="rv-x" data-rv="close" aria-label="${e(tt('Close'))}">×</button>
      <div class="rv-body">
        <form class="rv-form" novalidate>
          <p class="mono rv-k">${e(T.formKicker || tt('Client stories'))}</p>
          <h3 id="rvFormTitle">${e(T.formTitle || 'Share your experience')}</h3>
          <p class="rv-lead">${e(T.formIntro || 'Tell us about your experience working with iTECH.')}</p>
          <div class="rv-grid">
            <div class="rv-f"><label for="rv-name">${e(tt('Name'))} <i>*</i></label><input class="input" id="rv-name" name="name" autocomplete="name" maxlength="80" required aria-describedby="rv-name-e"><p class="rv-e" id="rv-name-e"></p></div>
            <div class="rv-f"><label for="rv-email">${e(tt('Email'))} <i>*</i> <em>${e(tt('private, never shown'))}</em></label><input class="input" id="rv-email" name="email" type="email" autocomplete="email" maxlength="160" required aria-describedby="rv-email-e"><p class="rv-e" id="rv-email-e"></p></div>
            <div class="rv-f"><label for="rv-company">${e(tt('Company / brand'))} <em>${e(tt('optional'))}</em></label><input class="input" id="rv-company" name="company" autocomplete="organization" maxlength="80"></div>
            <div class="rv-f"><label for="rv-type">${e(tt('Project type'))} <i>*</i></label><select class="input" id="rv-type" name="projectType" required aria-describedby="rv-type-e"><option value="">${e(tt('Select…'))}</option>${types.map(t => `<option>${e(t)}</option>`).join('')}</select><p class="rv-e" id="rv-type-e"></p></div>
          </div>
          <fieldset class="rv-f rv-rate" aria-describedby="rv-rating-e">
            <legend>${e(tt('Rating'))} <i>*</i></legend>
            <div class="rv-starpick">${[1, 2, 3, 4, 5].map(i => `<input type="radio" name="rating" id="rv-r${i}" value="${i}"><label for="rv-r${i}" data-v="${i}" title="${i} — ${e(L[i - 1])}">${STAR}<span class="sr">${i} star${i > 1 ? 's' : ''} — ${e(L[i - 1])}</span></label>`).join('')}</div>
            <span class="rv-rlabel mono" aria-hidden="true">${e(tt('Select a rating'))}</span>
            <p class="rv-e" id="rv-rating-e"></p>
          </fieldset>
          <div class="rv-f"><label for="rv-text">${e(tt('Your review'))} <i>*</i></label><textarea class="input" id="rv-text" name="review" rows="5" maxlength="${max}" required aria-describedby="rv-text-e rv-text-c"></textarea>
            <div class="rv-under"><p class="rv-e" id="rv-text-e"></p><span class="rv-cc mono" id="rv-text-c">0 / ${max}</span></div></div>
          <div class="rv-f"><label for="rv-url">${e(tt('Project URL'))} <em>${e(tt('optional'))}</em></label><input class="input" id="rv-url" name="projectUrl" type="url" inputmode="url" placeholder="https://" maxlength="200" aria-describedby="rv-url-e"><p class="rv-e" id="rv-url-e"></p></div>
          <div class="rv-hp" aria-hidden="true"><label>Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label></div>
          <div class="rv-f rv-consent"><label><input type="checkbox" name="consent" required aria-describedby="rv-consent-e"><span>${e(T.consentText || 'I confirm this review reflects my genuine experience and I allow iTECH to display it publicly after approval.')}</span></label><p class="rv-e" id="rv-consent-e"></p></div>
          <p class="rv-status" role="status" aria-live="polite"></p>
          <button type="submit" class="btn btn-primary rv-submit"><span>${e(tt('Submit review'))}</span>${ARROW}</button>
          <p class="rv-note">${e(tt('Every review is read by iTECH before it appears. Your email stays private.'))}</p>
        </form>
        <div class="rv-done" hidden tabindex="-1"></div>
      </div>
    </div>
  </dialog>

  <dialog class="rv-modal rv-modpanel" aria-labelledby="rvModTitle">
    <div class="rv-sheet">
      <button type="button" class="rv-x" data-rv="close" aria-label="${e(tt('Close'))}">×</button>
      <div class="rv-body">
        <p class="mono rv-k">Owner only</p><h3 id="rvModTitle">Review moderation</h3>
        <p class="rv-lead">Only approved reviews appear on the site. Emails are visible here only.</p>
        <div class="rv-modlist"></div>
        <div class="rv-modpub"><button type="button" class="btn btn-ghost btn-sm" data-rv="publish">Publish approved reviews to the public page</button><p class="rv-status" role="status" aria-live="polite"></p></div>
      </div>
    </div>
  </dialog>
</div></section>`;
}

function mount(root, C) {
  if (inst) inst.destroy();
  const T = C.testimonialConfig, sec = root.closest('section'), e = H.esc;
  const L = T.ratingLabels || ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
  const MIN = T.reviewMin || 50, MAX = T.reviewMax || 600;
  const $ = s => sec.querySelector(s), $$ = s => [...sec.querySelectorAll(s)];
  const deck = $('.rv-deck'), stage = $('.rv-stage'), ctrl = $('.rv-ctrl'), sum = $('.rv-sum'), filters = $('.rv-filters');
  const modal = $('.rv-modal:not(.rv-modpanel)'), form = $('.rv-form'), done = $('.rv-done'), modPanel = $('.rv-modpanel');
  const offs = [];
  let fileReviews = [], all = [], list = [], cur = 0, filter = 'all', timer = 0, paused = false, manual = false, openedAt = 0, lastFocus = null, subs = [], unSubs = null;
  const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); offs.push(() => el.removeEventListener(ev, fn, o)); };
  const parallax = T.mouseParallax !== false && T.threeDDepth !== false && matchMedia('(hover:hover) and (pointer:fine)').matches;
  sec.classList.toggle('rv-flat', T.threeDDepth === false);

  /* ── summary ── */
  function drawSummary() {
    const n = all.length;
    sum.hidden = !n;
    if (!n) { sum.innerHTML = ''; return; }
    const avg = all.reduce((a, r) => a + r.rating, 0) / n, a1 = (Math.round(avg * 10) / 10).toFixed(1);
    sum.innerHTML = `<p class="mono rv-sk">${e(T.summaryLabel || 'Client experience')}</p>
      <p class="rv-avg"><b>${a1}</b><span>/ 5</span></p>
      <span class="rv-stars rv-big" role="img" aria-label="Average ${a1} out of 5"><span class="rv-fill" style="width:${(avg / 5 * 100).toFixed(1)}%">${STAR.repeat(5)}</span>${STAR.repeat(5)}</span>
      <p class="rv-based">${e(tt(n > 1 ? 'Based on {n} approved client reviews' : 'Based on {n} approved client review', { n }))}</p>`;
  }

  /* ── filters (only with enough reviews) ── */
  const groupOf = t => /commerce|shop/i.test(t) ? 'E-commerce' : /book/i.test(t) ? 'Booking' : /business/i.test(t) ? 'Business' : 'Custom';
  function drawFilters() {
    const show = all.length >= (T.filtersMinReviews || 6);
    filters.hidden = !show;
    if (!show) { filter = 'all'; return; }
    const groups = ['All', ...['Business', 'E-commerce', 'Booking', 'Custom'].filter(g => all.some(r => groupOf(r.projectType) === g))];
    filters.innerHTML = groups.map(g => `<button type="button" class="rv-flt mono" data-flt="${g === 'All' ? 'all' : e(g)}" aria-pressed="${(g === 'All' ? 'all' : g) === filter}">${e(g)}</button>`).join('');
  }

  /* ── deck ── */
  const card = (r, i, n) => {
    const long = r.review.length > 360 ? ' is-long' : r.review.length > 200 ? ' is-mid' : '';
    return `<article class="rv-card${long}" data-i="${i}" role="group" aria-roledescription="slide" aria-label="Review ${i + 1} of ${n}">
      <i class="rv-hl" aria-hidden="true"></i>
      <div class="rv-top">${stars(r.rating)}<span class="rv-no mono" aria-hidden="true">${pad(i + 1)}</span></div>
      <blockquote class="rv-q"><span class="rv-qm" aria-hidden="true">“</span><p>${e(r.review)}</p></blockquote>
      <footer class="rv-meta">
        <div class="rv-who">${r.logo ? `<img class="rv-logo" src="${e(r.logo)}" alt="" loading="lazy">` : `<span class="rv-av" aria-hidden="true">${e(initials(r.name))}</span>`}
          <p><b>${e(r.name)}</b>${r.company ? `<span>${e(r.company)}</span>` : ''}</p></div>
        <div class="rv-tags">
          ${T.showProjectType !== false && r.projectType ? `<span class="rv-pill mono">${e(r.projectType)}</span>` : ''}
          ${T.verifiedBadge !== false && r.verified ? `<span class="rv-ver mono"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2l2.3 2.3L9.6 3.6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>${e(tt('Verified project'))}</span>` : ''}
          ${T.showDate !== false && fmtDate(r.createdAt) ? `<time class="mono" datetime="${e(r.createdAt)}">${e(fmtDate(r.createdAt))}</time>` : ''}
          ${r.projectUrl ? `<a class="rv-site mono" href="${e(r.projectUrl)}" target="_blank" rel="noopener nofollow">${e(tt('Visit site ↗'))}</a>` : ''}
        </div>
      </footer>
    </article>`;
  };
  const ghosts = '<div class="rv-ghost" aria-hidden="true" data-off="1"></div><div class="rv-ghost" aria-hidden="true" data-off="2"></div><div class="rv-ghost" aria-hidden="true" data-off="3"></div>';
  function drawDeck() {
    list = filter === 'all' ? all : all.filter(r => groupOf(r.projectType) === filter);
    cur = Math.min(cur, Math.max(0, list.length - 1));
    if (!list.length) {
      // empty: an invitation to start — pick a rating and the form opens with it
      const notes = T.emptyNotes || ['Verified clients only', 'Published after approval', 'Your email stays private'];
      const open = T.reviewSubmissionEnabled !== false;
      deck.innerHTML = `<article class="rv-card rv-empty rv-start" data-off="0">
        <i class="rv-hl" aria-hidden="true"></i>
        <div class="rv-st-top">
          <p class="rv-st-k">${e(T.emptyKicker || 'Worked with iTECH?')}</p>
          <h3>${(T.emptyTitle || 'How was your project?').split('\n').map(e).join('<br>')}</h3>
          ${open ? `<div class="rv-st-stars" role="group" aria-label="${e(tt('Rate your project to start a review'))}">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-rv="rate" data-v="${i}" aria-label="${e(tt('{n} out of 5, {l}: start a review', { n: i, l: L[i - 1] }))}">${STAR}</button>`).join('')}<span class="rv-st-l" aria-hidden="true"></span></div>` : ''}
          <p class="rv-st-hint">${e(T.emptyText || 'Pick a rating to start. It takes about two minutes.')}</p>
        </div>
        <ul class="rv-notes">${notes.map(t => `<li><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2l2.3 2.3L9.6 3.6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>${e(t)}</li>`).join('')}</ul>
      </article>`;
      sec.classList.add('rv-none');
      ctrl.hidden = true; stage.classList.add('is-empty'); return;
    }
    stage.classList.remove('is-empty'); sec.classList.remove('rv-none');
    deck.innerHTML = (list.length < 3 ? ghosts : '') + list.map((r, i) => card(r, i, list.length)).join('');
    ctrl.hidden = list.length < 2 || T.carouselEnabled === false;
    $('.rv-count span').textContent = pad(list.length);
    place();
  }
  function place() {
    const n = list.length;
    $$('.rv-card').forEach(c => {
      const i = +c.dataset.i; let k = (i - cur + n) % n;
      if (n > 2 && k === n - 1) k = -1;                      // the previous card leaves to the left
      c.dataset.off = k > 3 ? 4 : k;
      const act = k === 0;
      c.toggleAttribute('inert', !act); c.setAttribute('aria-hidden', act ? 'false' : 'true');
    });
    $$('.rv-ghost').forEach((g, j) => { g.dataset.off = Math.min(4, Math.max(n, 1) + j); });
    $('.rv-count b').textContent = pad(cur + 1);
    restartBar();
  }
  function go(d, user) {
    if (list.length < 2) return;
    cur = (cur + d + list.length) % list.length;
    if (user) { manual = true; stopAuto(); }
    place();
  }

  /* ── autoplay: off by default; pauses on hover / focus; stops after manual use ── */
  const autoOn = () => T.autoplay && T.carouselEnabled !== false && !reduced() && !manual && list.length > 1;
  function restartBar() { const b = $('.rv-bar'); b.classList.remove('run'); if (autoOn() && !paused) { void b.offsetWidth; b.style.setProperty('--dur', (T.autoplayMs || 9000) + 'ms'); b.classList.add('run'); } }
  function startAuto() { stopAuto(); if (!autoOn() || paused) return; timer = setInterval(() => go(1), Math.max(8000, T.autoplayMs || 9000)); restartBar(); }
  function stopAuto() { clearInterval(timer); timer = 0; const b = $('.rv-bar'); if (b) b.classList.remove('run'); }
  const pause = v => { paused = v; v ? stopAuto() : startAuto(); };

  /* ── data ── */
  function refresh() {
    const prevId = list[cur] && list[cur].id;
    all = ReviewService.publicReviews([...(T.reviews || []).map((r, i) => toPublic(r, 'cfg' + i)), ...fileReviews].filter(Boolean));
    drawSummary(); drawFilters(); drawDeck();
    if (prevId) { const j = list.findIndex(r => r.id === prevId); if (j >= 0 && j !== cur) { cur = j; place(); } }
    startAuto();
  }
  refresh();
  if (T.publicFile) fetch(T.publicFile, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(d => {
    if (d && Array.isArray(d.reviews)) { fileReviews = d.reviews.map((r, i) => toPublic(r, 'f' + i)).filter(Boolean); refresh(); }
  }).catch(() => { });
  const offChange = ReviewService.onChange(refresh);
  ReviewService.init().then(() => {
    if (!sec.isConnected) return;
    refresh();
    if (ReviewService.isOwner) {
      // owner only, and only while reviews wait for approval (no "0 pending" button otherwise)
      const b = $('.rv-own'), showMod = T.moderationButton !== false;
      unSubs = ReviewService.watchSubmissions(s => { subs = s || []; const n = subs.filter(x => x.status === 'pending').length; b.querySelector('b').textContent = n; b.hidden = !showMod || (!n && !modPanel.open); if (modPanel.open) drawMod(); });
    }
  });

  /* ── controls ── */
  on(sec, 'click', ev => {
    const t = ev.target.closest('[data-rv],[data-flt]'); if (!t) return;
    if (t.dataset.flt) { filter = t.dataset.flt; cur = 0; $$('.rv-flt').forEach(b => b.setAttribute('aria-pressed', b === t)); drawDeck(); return; }
    const a = t.dataset.rv;
    if (a === 'prev') go(-1, true); else if (a === 'next') go(1, true);
    else if (a === 'open') openForm(t);
    else if (a === 'rate') { openForm(t); const r = form.querySelector(`#rv-r${t.dataset.v}`); if (r) { r.checked = true; touched.add('rating'); rateLabel(); check('rating', true); } }
    else if (a === 'close') closeModal(t.closest('dialog'));
    else if (a === 'mod') { lastFocus = t; drawMod(); modPanel.showModal(); document.documentElement.classList.add('rv-lock'); }
    else if (a === 'publish') publishApproved(t);
    else if (a === 'approve' || a === 'reject') moderateOne(t, a);
  });
  on(stage, 'mouseover', ev => { const b = ev.target.closest('[data-rv="rate"]'), g = b && b.parentElement; if (g) { g.dataset.v = b.dataset.v; g.querySelector('.rv-st-l').textContent = L[b.dataset.v - 1]; } });
  on(stage, 'mouseout', ev => { const g = ev.target.closest('.rv-st-stars'); if (g && !g.contains(ev.relatedTarget)) { g.dataset.v = ''; g.querySelector('.rv-st-l').textContent = ''; } });
  on(stage, 'focusin', ev => { const b = ev.target.closest('[data-rv="rate"]'); if (b) { b.parentElement.dataset.v = b.dataset.v; b.parentElement.querySelector('.rv-st-l').textContent = L[b.dataset.v - 1]; } });
  on(stage, 'keydown', ev => { if (ev.key === 'ArrowRight') { ev.preventDefault(); go(1, true); } else if (ev.key === 'ArrowLeft') { ev.preventDefault(); go(-1, true); } });
  on(stage, 'mouseenter', () => pause(true)); on(stage, 'mouseleave', () => { pause(false); stage.style.setProperty('--rx', '0deg'); stage.style.setProperty('--ry', '0deg'); });
  on(sec, 'focusin', ev => { if (ev.target.closest('.rv-main')) pause(true); });
  on(sec, 'focusout', ev => { if (!sec.querySelector('.rv-main').contains(ev.relatedTarget)) pause(false); });
  /* drag / swipe */
  let px = null, py = 0, dx = 0;
  on(stage, 'pointerdown', ev => { if (ev.button || ev.target.closest('a,button') || list.length < 2) return; px = ev.clientX; py = ev.clientY; dx = 0; stage.classList.add('drag'); });
  on(window, 'pointermove', ev => {
    if (px !== null) { dx = ev.clientX - px; if (Math.abs(dx) > Math.abs(ev.clientY - py)) stage.style.setProperty('--dx', Math.max(-90, Math.min(90, dx * .5)) + 'px'); return; }
    if (parallax && list.length && !reduced() && !liteOn() && stage.matches(':hover')) { const r = stage.getBoundingClientRect(); stage.style.setProperty('--ry', (((ev.clientX - r.left) / r.width - .5) * 3).toFixed(2) + 'deg'); stage.style.setProperty('--rx', (-((ev.clientY - r.top) / r.height - .5) * 2.4).toFixed(2) + 'deg'); }
  }, { passive: true });
  const endDrag = () => { if (px === null) return; px = null; stage.classList.remove('drag'); stage.style.setProperty('--dx', '0px'); if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1, true); };
  on(window, 'pointerup', endDrag); on(window, 'pointercancel', endDrag);

  /* ── form ── */
  const F = n => form.elements[n];
  const touched = new Set();
  const rules = {
    name: () => clean(F('name').value, 80).length >= 2 ? '' : tt('Please enter your name (at least 2 characters).'),
    email: () => isEmail(F('email').value.trim()) ? '' : tt('Please enter a valid email address.'),
    projectType: () => F('projectType').value ? '' : tt('Please choose the project type.'),
    rating: () => form.querySelector('[name=rating]:checked') ? '' : tt('Please choose a rating.'),
    review: () => { const n = clean(F('review').value, 9999).length; return n < MIN ? tt('Please write at least {n} characters ({m} more).', { n: MIN, m: MIN - n }) : n > MAX ? tt('Please keep it under {n} characters.', { n: MAX }) : ''; },
    projectUrl: () => !F('projectUrl').value.trim() || isUrl(F('projectUrl').value.trim()) ? '' : tt('Please enter a full address, for example https://yourbrand.com'),
    consent: () => F('consent').checked ? '' : tt('Please confirm to submit your review.')
  };
  const errIds = { name: 'rv-name-e', email: 'rv-email-e', projectType: 'rv-type-e', rating: 'rv-rating-e', review: 'rv-text-e', projectUrl: 'rv-url-e', consent: 'rv-consent-e' };
  function check(k, show) {
    const msg = rules[k](), out = sec.querySelector('#' + errIds[k]);
    const field = k === 'rating' ? form.querySelector('.rv-rate') : F(k);
    if (show) { out.textContent = msg; if (k === 'rating') field.classList.toggle('bad', !!msg); else field.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
    return !msg;
  }
  const counter = () => { const n = F('review').value.length, c = $('.rv-cc'); c.textContent = `${n} / ${MAX}`; c.classList.toggle('ok', clean(F('review').value, 9999).length >= MIN); };
  on(form, 'input', ev => { const k = ev.target.name; if (k === 'review') counter(); if (k === 'rating') { touched.add('rating'); rateLabel(); } if (rules[k] && (touched.has(k) || k === 'rating' || k === 'consent')) check(k, true); });
  on(form, 'focusout', ev => { const k = ev.target.name; if (rules[k] && k !== 'rating' && (ev.target.value || touched.has(k))) { touched.add(k); check(k, true); } });
  /* star preview on hover */
  const pick = form.querySelector('.rv-starpick');
  const rateLabel = (v) => { const sel = form.querySelector('[name=rating]:checked'); const n = v || (sel && +sel.value) || 0; pick.dataset.v = n; form.querySelector('.rv-rlabel').textContent = n ? `${n} — ${L[n - 1]}` : tt('Select a rating'); };
  on(pick, 'mouseover', ev => { const l = ev.target.closest('label'); if (l) rateLabel(+l.dataset.v); });
  on(pick, 'mouseleave', () => rateLabel());

  function resetForm() { form.reset(); touched.clear(); $$('.rv-e').forEach(p => p.textContent = ''); $$('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid')); form.querySelector('.rv-rate').classList.remove('bad'); rateLabel(); counter(); form.querySelector('.rv-status').textContent = ''; form.hidden = false; done.hidden = true; setBusy(false); }
  function openForm(t) { lastFocus = t; if (done.hidden === false) resetForm(); openedAt = Date.now(); modal.showModal(); document.documentElement.classList.add('rv-lock'); setTimeout(() => F('name').focus(), 30); }
  function closeModal(d) { if (!d || !d.open) return; d.classList.add('closing'); setTimeout(() => { d.classList.remove('closing'); d.close(); }, reduced() ? 0 : 220); }
  [modal, modPanel].forEach(d => {
    on(d, 'close', () => { document.documentElement.classList.remove('rv-lock'); if (lastFocus && lastFocus.isConnected) lastFocus.focus(); });
    on(d, 'cancel', ev => { ev.preventDefault(); closeModal(d); });                  // ESC
    on(d, 'click', ev => { if (ev.target === d) closeModal(d); });                     // backdrop
  });
  const btn = form.querySelector('.rv-submit');
  function setBusy(b) { btn.disabled = b; btn.querySelector('span').textContent = tt(b ? 'Submitting…' : 'Submit review'); form.setAttribute('aria-busy', b); }
  const COOL = (T.cooldownSeconds || 120) * 1000;
  const lastSent = () => { try { return +localStorage.getItem('itech-review-sent') || 0; } catch (e) { return 0; } };
  on(form, 'submit', async ev => {
    ev.preventDefault();
    if (btn.disabled) return;
    const st = form.querySelector('.rv-status');
    const keys = Object.keys(rules); keys.forEach(k => touched.add(k));
    const okAll = keys.map(k => check(k, true)).every(Boolean);
    if (!okAll) { st.textContent = tt('Please check the highlighted fields.'); const first = keys.find(k => rules[k]()); (first === 'rating' ? form.querySelector('[name=rating]') : F(first)).focus(); return; }
    if (F('website').value) { showDone('stored'); return; }                                  // honeypot: quietly ignore bots
    if (Date.now() - openedAt < 3000) { st.textContent = tt('Please take a moment to review your text before sending.'); return; }
    const wait = lastSent() + COOL - Date.now();
    if (wait > 0) { st.textContent = `You just sent a review. Please wait ${Math.ceil(wait / 1000)} seconds before sending another.`; return; }
    st.textContent = ''; setBusy(true);
    const data = { name: F('name').value, email: F('email').value.trim(), company: F('company').value, projectType: F('projectType').value, rating: form.querySelector('[name=rating]:checked').value, review: F('review').value, projectUrl: F('projectUrl').value.trim() };
    try {
      const res = await ReviewService.submit(data);
      try { localStorage.setItem('itech-review-sent', Date.now()); } catch (e) { }
      showDone(res.stored ? 'stored' : 'direct', res.doc);
    } catch (err) {
      setBusy(false);
      st.textContent = err && err.code === 'quota_exceeded' ? 'Reviews cannot be received here right now. Please contact iTECH directly.' : 'Something went wrong and your review was not sent. Please try again.';
    }
  });
  function showDone(kind, doc) {
    form.hidden = true; done.hidden = false;
    if (kind === 'stored') done.innerHTML = `<span class="rv-ok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span>
      <h3>${e(tt('Thank you.'))}</h3><p>${e(tt('Your review has been submitted and will appear after approval.'))}</p>
      <button type="button" class="btn btn-ghost" data-rv="close">${e(tt('Close'))}</button>`;
    else {
      const msg = `New client review for iTECH (please approve)\n\nName: ${doc.name}\nEmail: ${doc.email}${doc.company ? '\nCompany: ' + doc.company : ''}\nProject: ${doc.projectType}\nRating: ${doc.rating}/5${doc.projectUrl ? '\nURL: ' + doc.projectUrl : ''}\n\n"${doc.review}"`;
      done.innerHTML = `<span class="rv-ok" aria-hidden="true">${MSG}</span>
      <h3>One last step.</h3><p>Reviews cannot be stored from this view, so your review was not saved yet. Send it to iTECH on WhatsApp and it will appear after approval.</p>
      <div class="rv-done-ctas"><a class="btn btn-primary" href="${e(H.waLink ? H.waLink(msg) : '#')}" target="_blank" rel="noopener">Send on WhatsApp ${ARROW}</a><button type="button" class="btn btn-ghost" data-rv="close">Close</button></div>`;
    }
    done.focus();
  }

  /* ── owner moderation ── */
  function drawMod() {
    const box = modPanel.querySelector('.rv-modlist');
    const order = { pending: 0, approved: 1, rejected: 2 };
    const s = [...subs].sort((a, b) => (order[a.status] - order[b.status]) || String(b.createdAt).localeCompare(String(a.createdAt)));
    box.innerHTML = s.length ? s.map(x => `<article class="rv-mod" data-id="${e(x.id)}">
      <div class="rv-mod-h"><span class="rv-st mono st-${e(x.status)}">${e(x.status)}</span>${stars(+x.rating || 0)}<time class="mono">${e(fmtDate(x.createdAt))}</time></div>
      <p class="rv-mod-q">${e(x.review)}</p>
      <p class="rv-mod-m"><b>${e(x.name)}</b>${x.company ? ' · ' + e(x.company) : ''} · ${e(x.projectType)} · <span>${e(x.email)}</span>${x.projectUrl ? ` · <a href="${e(x.projectUrl)}" target="_blank" rel="noopener nofollow">${e(x.projectUrl)}</a>` : ''}</p>
      <div class="rv-mod-a"><label><input type="checkbox" class="rv-vf"${x.verified ? ' checked' : ''}> Verified project</label>${x.projectUrl ? `<label><input type="checkbox" class="rv-su"> Show URL</label>` : ''}
        <button type="button" class="btn btn-ghost btn-sm" data-rv="approve"${x.status === 'approved' ? ' disabled' : ''}>Approve</button>
        <button type="button" class="btn btn-ghost btn-sm" data-rv="reject"${x.status === 'rejected' ? ' disabled' : ''}>Reject</button></div>
    </article>`).join('') : '<p class="rv-lead">No submissions yet.</p>';
    modPanel.querySelector('.rv-modpub').hidden = !ReviewService.canPublish;
  }
  async function moderateOne(t, a) {
    const el = t.closest('.rv-mod'), sub = subs.find(x => x.id === el.dataset.id); if (!sub) return;
    t.disabled = true;
    try { await ReviewService.moderate(sub, a === 'approve' ? 'approved' : 'rejected', { verified: el.querySelector('.rv-vf').checked, showUrl: !!(el.querySelector('.rv-su') || {}).checked }); }
    catch (err) { t.disabled = false; modPanel.querySelector('.rv-modpub .rv-status').textContent = 'That change did not save. Please try again.'; }
  }
  async function publishApproved(t) {
    const st = modPanel.querySelector('.rv-modpub .rv-status'); t.disabled = true; st.textContent = 'Publishing…';
    try { await ReviewService.publishFile(all); st.textContent = 'Published. The page reloads with the approved reviews.'; }
    catch (err) { t.disabled = false; st.textContent = err && err.code === 'capability_disabled' ? 'Publishing is off while the page has a public link. Approved reviews still show to signed-in visitors.' : 'Publishing did not go through. Please try again.'; }
  }

  inst = { destroy() { offs.forEach(f => f()); stopAuto(); offChange(); if (unSubs) unSubs(); [modal, modPanel].forEach(d => { if (d.open) d.close(); }); document.documentElement.classList.remove('rv-lock'); inst = null; } };
}

EXT.reviews = { render, mount };
})();
