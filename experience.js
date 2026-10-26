/* iTECH — DigitalExperienceSection
   A scroll-told scene between the Hero and Selected Work: light streams converge
   and "build" a set of live websites (desktop, brand site, design system, phone).
   WebGL (Three.js, loaded on demand) draws trails, particles and atmosphere;
   the websites are DOM so text stays sharp. Settings: digitalExperienceConfig. */
(function () {
'use strict';
const EXT = window.ITECH_EXT = window.ITECH_EXT || {};
const liteOn = () => document.documentElement.classList.contains('perf-lite');   // adaptive quality (app.js)

const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
let inst = null;

/* ───────────── markup ───────────── */
function villaSVG(id) {
  return `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
    <linearGradient id="dxSky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14070D"/><stop offset=".7" stop-color="#3A1627"/><stop offset="1" stop-color="#4A1F33"/></linearGradient>
    <linearGradient id="dxPool${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4F1B33"/><stop offset="1" stop-color="#220A15"/></linearGradient>
    <radialGradient id="dxWin${id}" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#FFE2B0"/><stop offset="1" stop-color="#E9A960"/></radialGradient></defs>
    <rect width="400" height="260" fill="url(#dxSky${id})"/>
    <path d="M0 150 L60 128 L120 140 L190 118 L260 136 L330 120 L400 134 V170 H0Z" fill="#260E19"/>
    <rect x="60" y="78" width="250" height="10" fill="#2A2F3A"/><rect x="74" y="88" width="222" height="44" fill="#1E1419"/>
    <rect x="86" y="94" width="90" height="34" fill="url(#dxWin${id})" opacity=".85"/><rect x="186" y="94" width="96" height="34" fill="url(#dxWin${id})" opacity=".55"/>
    <rect x="40" y="132" width="300" height="10" fill="#2A2F3A"/><rect x="52" y="142" width="270" height="34" fill="#191014"/>
    <rect x="64" y="146" width="120" height="26" fill="url(#dxWin${id})" opacity=".7"/><rect x="194" y="146" width="116" height="26" fill="url(#dxWin${id})" opacity=".45"/>
    <rect x="232" y="88" width="4" height="44" fill="#2A2F3A"/><rect x="120" y="142" width="4" height="34" fill="#2A2F3A"/>
    <rect y="176" width="400" height="84" fill="url(#dxPool${id})"/>
    <rect x="64" y="182" width="120" height="16" fill="#FFD9A0" opacity=".18"/><rect x="194" y="182" width="116" height="14" fill="#FFD9A0" opacity=".1"/>
    <path d="M0 176 H400" stroke="#FF6FB1" stroke-opacity=".25"/>
    <circle cx="352" cy="138" r="22" fill="#180B11"/><circle cx="372" cy="150" r="16" fill="#180B11"/><circle cx="24" cy="146" r="18" fill="#180B11"/></svg>`;
}
function centerSite(X, H) {
  const c = X.centerWebsite, esc = H.esc;
  const lines = c.headline.split('\n').map(l => l === c.accentLine ? `<em>${esc(l)}</em>` : esc(l)).join('<br>');
  return `<div class="dxs">
    <div class="dxs-nav"><b><span>_</span>iTECH</b><nav>${c.nav.map(n => `<span>${esc(n)}</span>`).join('')}</nav><span class="dxs-btn">${esc(c.navCta)}</span></div>
    <div class="dxs-hero"><div class="dxs-copy"><p class="dxs-k">${esc(c.eyebrow)}</p><p class="dxs-h">${lines}</p><p class="dxs-p">${esc(c.text)}</p><span class="dxs-cta">${esc(c.cta)} →</span></div>
      <div class="dxs-img">${villaSVG('c')}</div></div>
    <div class="dxs-row">${c.tiles.map((t, i) => `<div><i class="t${i}"></i><span>${esc(t)}</span></div>`).join('')}</div>
  </div>`;
}
function phoneSite(X, H) {
  const c = X.centerWebsite, esc = H.esc;
  const lines = c.headline.split('\n').map(l => l === c.accentLine ? `<em>${esc(l)}</em>` : esc(l)).join('<br>');
  return `<div class="dxm"><div class="dxm-nav"><b><span>_</span>iTECH</b><i></i></div><div class="dxm-img">${villaSVG('m')}</div>
    <p class="dxm-h">${lines}</p><span class="dxm-cta">${esc(c.cta)} →</span><div class="dxm-row"><i></i><i></i></div></div>`;
}
function designPanel(X, H) {
  const d = X.designSystem, esc = H.esc;
  return `<div class="dxd"><p class="dxd-t">${esc(d.title)}</p>
    <ol class="dxd-steps">${d.steps.map((s, i) => `<li class="${i === d.activeStep ? 'on' : ''}"><b>${String(i + 1).padStart(2, '0')}</b>${esc(s)}</li>`).join('')}</ol>
    <div class="dxd-blk"><span>Colors</span><div class="dxd-sw">${d.swatches.map(c => `<i style="background:${esc(c)}"></i>`).join('')}</div></div>
    <div class="dxd-blk"><span>Typography</span><div class="dxd-type"><b>Aa</b><small>${d.fonts.map(esc).join('<br>')}</small></div></div>
    <div class="dxd-blk"><span>Components</span><div class="dxd-comp">${d.components.map((c, i) => `<i class="${i ? '' : 'p'}">${esc(c)}</i>`).join('')}</div></div>
    <div class="dxd-blk"><span>Responsive</span><div class="dxd-resp"><i class="d"></i><i class="t"></i><i class="m"></i></div></div>
  </div>`;
}
function svgTrails() {
  const P = ['M-40 40 C 260 160, 520 260, 600 340', 'M-60 140 C 240 220, 470 300, 600 345', 'M1240 30 C 940 150, 700 260, 600 340', 'M1260 120 C 980 210, 740 300, 600 345',
    'M-40 720 C 240 560, 480 420, 600 350', 'M-60 620 C 260 520, 500 400, 600 352', 'M1240 730 C 960 560, 720 420, 600 350', 'M1260 640 C 960 520, 720 400, 600 352'];
  return `<svg class="dx-svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
    <linearGradient id="dxT1" x1="0" x2="1"><stop offset="0" stop-color="#C58BFF" stop-opacity="0"/><stop offset="1" stop-color="#FFE8F3" stop-opacity=".7"/></linearGradient>
    <linearGradient id="dxT2" x1="0" x2="1"><stop offset="0" stop-color="#FF6FB1" stop-opacity="0"/><stop offset="1" stop-color="#FF6FB1" stop-opacity=".8"/></linearGradient></defs>
    ${P.map((d, i) => `<path d="${d}" fill="none" stroke="url(#${i < 4 ? 'dxT1' : 'dxT2'})" stroke-width="${i % 2 ? 1 : 1.6}" class="dx-sp" style="animation-delay:${-i * 0.7}s"/>`).join('')}
    <circle cx="600" cy="346" r="90" fill="url(#dxT2)" opacity=".08"/></svg>`;
}
const LABEL_POS = [[-.42, -.17, -200], [.17, -.31, -260], [-.13, .37, 60], [.45, .31, -40], [-.03, -.37, -320]];
function render(C, H) {
  const X = C.digitalExperienceConfig; if (!X) return '';
  const esc = H.esc, t = X.text;
  const lp = X.leftWebsite.project;
  return `<section class="dx${X.photo && X.photo.enabled && X.photo.video && X.photo.video.src ? ' dx-vid' : ''}" id="experience" data-ext="experience" aria-labelledby="dx-title" style="--dx-len:${+X.scrollLength || 3}">
  <div class="dx-sticky">
    <div class="dx-atmo" aria-hidden="true"></div>
    ${X.lightTrailsEnabled ? svgTrails() : ''}
    <canvas class="dx-canvas" aria-hidden="true"></canvas>
    <div class="dx-light" aria-hidden="true"></div>
    <div class="dx-copy"><p class="mono dx-eyebrow">${esc(t.eyebrow)}</p><h2 class="dx-title" id="dx-title">${H.accentize(t.headline, t.accent)}</h2><p class="dx-body">${esc(t.body)}</p></div>
    <div class="dx-scene"><div class="dx-rig">
      ${X.photo && X.photo.enabled ? `<div class="dx-dev dx-photo" data-dev="photo"><div class="dx-photo-in">${X.photo.video && X.photo.video.src ? `<video class="dx-pvid" muted loop playsinline preload="metadata" aria-hidden="true"${X.photo.video.poster ? ` poster="${esc(X.photo.video.poster)}"` : ''}><source src="${esc(X.photo.video.src)}" type="video/mp4"></video>` : `<img src="${esc(X.photo.src)}" alt="${esc(X.photo.alt || '')}" loading="eager">`}<span class="dx-plight" aria-hidden="true"></span><span class="dx-psheen" aria-hidden="true"></span></div>
        ${X.photo.video && X.photo.video.src ? '' : `<div class="dx-hot-layer">${(X.photo.hotspots || []).map((h, i) => `<div class="dx-hot" style="left:${+h.x}%;top:${+h.y}%"><button class="dx-dot" type="button" aria-expanded="false" aria-controls="dx-card-${i}" aria-label="${esc(h.title)}"><span></span></button><div class="dx-card${h.side === 'left' ? ' left' : ''}" id="dx-card-${i}" role="note"><span class="mono">${String(i + 1).padStart(2, '0')}</span><b>${esc(h.title)}</b><p>${esc(h.text)}</p></div></div>`).join('')}</div>`}</div>` : `
      <div class="dx-dev dx-bgui" data-dev="bg" aria-hidden="true"><div class="dx-glass"><div class="dxw"><i style="width:30%"></i><b></b><i></i><i style="width:70%"></i><div><b></b><b></b><b></b></div></div></div></div>
      ${X.leftWebsite.enabled ? `<div class="dx-dev dx-left" data-dev="left" role="button" tabindex="0" aria-label="${esc(X.leftWebsite.focusLabel)}: ${esc(lp.name)} website"><div class="dx-glass"><div class="dx-chrome"><i></i><span>${esc(X.leftWebsite.url)}</span></div><div class="dx-screen dx-screen-ws">${H.desktopSite(lp)}</div></div></div>` : ''}
      ${X.centerWebsite.enabled ? `<div class="dx-dev dx-center" data-dev="center" role="button" tabindex="0" aria-label="${esc(X.centerWebsite.focusLabel)}"><div class="dx-glass"><div class="dx-chrome"><i></i><span>${esc(X.centerWebsite.url)}</span></div><div class="dx-screen">${centerSite(X, H)}</div></div></div>` : ''}
      ${X.designSystem.enabled ? `<div class="dx-dev dx-right" data-dev="right" role="button" tabindex="0" aria-label="${esc(X.designSystem.focusLabel)}"><div class="dx-glass dx-panel">${designPanel(X, H)}</div></div>` : ''}
      ${X.mobileWebsite.enabled ? `<div class="dx-dev dx-phone" data-dev="phone" role="button" tabindex="0" aria-label="${esc(X.mobileWebsite.focusLabel)}"><div class="dx-phone-body"><div class="dx-phone-screen">${phoneSite(X, H)}</div></div></div>` : ''}
      ${X.labels.slice(0, 5).map((l, i) => `<span class="dx-label mono" data-l="${i}" aria-hidden="true">${esc(l)}</span>`).join('')}`}
    </div></div>
    <p class="dx-focus mono" aria-live="polite"></p>
    ${X.photo && X.photo.enabled && X.photo.hint && !(X.photo.video && X.photo.video.src) ? `<p class="dx-hint mono" aria-hidden="true">${esc(X.photo.hint)}</p>` : ''}
  </div>
</section>`;
}

/* ───────────── WebGL scene ───────────── */
function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (window.__itechThreeP) return window.__itechThreeP;
  window.__itechThreeP = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = THREE_URL; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = () => window.THREE ? res(window.THREE) : rej(new Error('three missing'));
    s.onerror = () => rej(new Error('three failed'));
    document.head.appendChild(s);
  });
  return window.__itechThreeP;
}
function softTexture(T, kind) {
  const c = document.createElement('canvas'); c.width = c.height = kind === 'glow' ? 128 : 256;
  const g = c.getContext('2d');
  if (kind === 'glow') {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,200,226,.45)'); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  } else {
    for (let i = 0; i < 26; i++) {
      const x = Math.random() * 256, y = Math.random() * 256, rad = 40 + Math.random() * 90;
      const r = g.createRadialGradient(x, y, 0, x, y, rad);
      r.addColorStop(0, `rgba(${120 + Math.random() * 40 | 0},${150 + Math.random() * 50 | 0},255,${.03 + Math.random() * .04})`); r.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    }
  }
  const tex = new T.CanvasTexture(c); tex.wrapS = tex.wrapT = T.RepeatWrapping; return tex;
}
function createGL(T, canvas, X, lite) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(50, 1, 0.1, 100); camera.position.set(0, 0, 12);
  const col = X.colors, U = { uTime: { value: 0 }, uMouse: { value: new T.Vector2(9, 9) }, uBurst: { value: -100 } };
  const trails = [];
  const vs = `varying vec2 vUv; varying float vNear; varying float vFres; uniform vec2 uMouse;
    void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0);
      vec3 n = normalize(normalMatrix * normal); vFres = abs(dot(n, normalize(-mv.xyz)));
      vec4 cp = projectionMatrix * mv; vec2 ndc = cp.xy / cp.w; vNear = 1.0 - smoothstep(0.0, 0.22, distance(ndc, uMouse)); gl_Position = cp; }`;
  const fs = `uniform float uBurst; uniform float uTime, uReveal, uOpacity, uSpeed, uPhase, uSharp, uCore; uniform vec3 uColor; varying vec2 vUv; varying float vNear; varying float vFres;
    void main(){ float t = vUv.x; if (t > uReveal) discard;
      float beam = pow(vFres, uSharp);                                   // soft edge across the beam
      float d = fract(uTime * uSpeed + uPhase - t * 1.25);               // distance behind the travelling head
      float comet = exp(-d * 10.0) + 0.45 * exp(-fract(d + 0.5) * 14.0);
      float ends = smoothstep(0.0, 0.16, t) * (1.0 - 0.5 * smoothstep(0.88, 1.0, t));
      float head = smoothstep(uReveal - 0.12, uReveal, t) * step(uReveal, 0.999);
      vec3 c = mix(uColor, vec3(1.0), uCore + 0.35 * smoothstep(0.55, 1.0, t) + 0.5 * comet * uCore);
      float a = uOpacity * beam * ends * (0.28 + 1.6 * comet + 0.9 * head) * (1.0 + vNear * 0.8);
      float bd = uTime - uBurst; float burst = exp(-abs(t - bd * 0.95) * 18.0) * (1.0 - smoothstep(0.9, 1.4, bd)) * step(0.0, bd);
      a += uOpacity * beam * ends * burst * 2.4; c = mix(c, vec3(1.0), burst * 0.6);
      gl_FragColor = vec4(c, a); }`;
  if (X.lightTrailsEnabled) {
    const corners = [[-1, 1], [1, 1], [-1, -1], [1, -1]], per = lite ? 3 : 5;
    // [radius ×, opacity, edge sharpness, white core mix]
    const LAYERS = lite ? [[1, 1.0, 1.2, .55], [4, .22, 2.4, 0]] : [[1, 1.0, 1.2, .55], [3.5, .26, 2.2, .1], [9, .07, 3.5, 0]];
    corners.forEach(([cx, cy], ci) => {
      for (let k = 0; k < per; k++) {
        const r = () => Math.random();
        const curve = new T.CatmullRomCurve3([
          new T.Vector3(cx * (12 + r() * 4), cy * (6.5 + r() * 2.5), -6 + r() * 5),
          new T.Vector3(cx * (7 + r() * 2.5), cy * (1.2 + r() * 2.6), -2 + r() * 3),
          new T.Vector3(cx * (2.6 + r() * 1.2), cy * (0.4 + r() * 0.7), -0.8 + r()),
          new T.Vector3(cx * 0.2 * r(), cy * 0.15 * r(), -1.6)
        ], false, 'catmullrom', 0.4);
        const upper = cy > 0, color = upper ? (k % 2 ? col.accent : col.white) : (k % 2 ? col.secondary : col.primary);
        const radius = 0.007 + r() * 0.012, speed = 0.1 + r() * 0.08, phase = r();
        LAYERS.forEach(([mult, op, sharp, core]) => {
          const mat = new T.ShaderMaterial({ uniforms: { uTime: U.uTime, uMouse: U.uMouse, uBurst: U.uBurst, uReveal: { value: 0 }, uOpacity: { value: 0 }, uSpeed: { value: speed }, uPhase: { value: phase }, uSharp: { value: sharp }, uCore: { value: core }, uColor: { value: new T.Color(color) } },
            vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
          const mesh = new T.Mesh(new T.TubeGeometry(curve, lite ? 140 : 240, radius * mult, lite ? 8 : 12, false), mat);
          scene.add(mesh); trails.push({ mat, base: op, delay: ci * 0.012 + k * 0.008 });
        });
      }
    });
  }
  const glow = new T.Sprite(new T.SpriteMaterial({ map: softTexture(T, 'glow'), color: new T.Color(col.primary), transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: 0 }));
  glow.position.set(0, 0, -1.6); glow.scale.set(7, 7, 1); scene.add(glow);
  const core = new T.Sprite(new T.SpriteMaterial({ map: glow.material.map, color: new T.Color(col.white), transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: 0 }));
  core.position.set(0, 0, -1.55); core.scale.set(1.8, 1.8, 1); scene.add(core);
  let points = null;
  if (X.particlesEnabled) {
    const n = lite ? 140 : 520, pos = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * 30; pos[i * 3 + 1] = (Math.random() - .5) * 17; pos[i * 3 + 2] = -12 + Math.random() * 15; seed[i] = Math.random(); }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('aSeed', new T.BufferAttribute(seed, 1));
    const mat = new T.ShaderMaterial({ uniforms: { uTime: U.uTime, uOpacity: { value: 0 }, uColor: { value: new T.Color(col.white) }, uPR: { value: renderer.getPixelRatio() } },
      vertexShader: `attribute float aSeed; uniform float uTime, uPR; varying float vA;
        void main(){ vec3 p = position; p.y += sin(uTime * 0.12 + aSeed * 6.28) * 0.35; p.x += cos(uTime * 0.09 + aSeed * 12.0) * 0.25;
          vec4 mv = modelViewMatrix * vec4(p,1.0); gl_PointSize = (1.2 + aSeed * 1.8) * uPR * (10.0 / -mv.z); vA = 0.35 + 0.65 * aSeed; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uOpacity; uniform vec3 uColor; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(uColor, uOpacity * vA * (1.0 - d * 2.0)); }`,
      transparent: true, depthWrite: false, blending: T.AdditiveBlending });
    points = new T.Points(geo, mat); scene.add(points);
  }
  const fogs = [];
  if (X.atmosphereEnabled) {
    [[-11, .16], [-7, .1], [-3.5, .05]].forEach(([z, o], i) => {
      const tex = softTexture(T, 'fog');
      const m = new T.Mesh(new T.PlaneGeometry(44, 26), new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
      m.position.z = z; scene.add(m); fogs.push({ m, tex, o, s: (i + 1) * 0.004 });
    });
  }
  return {
    renderer, scene, camera, U,
    resize(w, h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); },
    frame(dt, st) {
      U.uTime.value += dt * X.trailSpeed;
      const I = X.lightIntensity, fade = 1 - st.exit * 0.85;
      trails.forEach(tr => { tr.mat.uniforms.uReveal.value = clamp01((st.p - 0.01 - tr.delay) / 0.18); tr.mat.uniforms.uOpacity.value = tr.base * I * fade * lerp(0.75, 1, st.conv); });
      const flash = Math.exp(-Math.pow((U.uTime.value - U.uBurst.value - 1.05) * 3.2, 2));
      core.material.opacity = 0.5 * I * st.conv * (1 - st.exit) * (1 - st.center * 0.6) + flash * 0.9 * I;
      glow.material.opacity = 0.4 * I * st.conv * (1 - st.exit) * (1 - st.center * 0.45) * (0.92 + 0.08 * Math.sin(U.uTime.value * 1.3));
      if (points) points.material.uniforms.uOpacity.value = 0.45 * Math.max(0.35, sm(0, 0.2, st.p)) * fade;
      fogs.forEach(f => { f.m.material.opacity = f.o * fade * Math.max(0.4, sm(0, .25, st.p)); f.tex.offset.x += f.s * dt; f.tex.offset.y += f.s * 0.5 * dt; });
      camera.position.x = st.mx * 0.45; camera.position.y = -st.my * 0.28; camera.position.z = 12 - st.conv * 2.2 + st.exit * 1.5;
      camera.lookAt(0, 0, -1.5);
      U.uMouse.value.set(st.mxRaw, -st.myRaw);
      renderer.render(scene, camera);
    },
    burst() { U.uBurst.value = U.uTime.value; },
    dispose() { scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); renderer.dispose(); }
  };
}

/* ───────────── mount: scroll story, parallax, hover/focus ───────────── */
function mount(root, C) {
  if (inst) inst.destroy();
  const X = C.digitalExperienceConfig, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = X.motionEnabled && C.motionConfig.motionEnabled && !reduced;
  const fine = matchMedia('(pointer: fine)').matches;
  const sticky = root.querySelector('.dx-sticky'), canvas = root.querySelector('.dx-canvas'), light = root.querySelector('.dx-light');
  const copy = root.querySelector('.dx-copy'), focusLbl = root.querySelector('.dx-focus');
  const devs = {}; root.querySelectorAll('.dx-dev').forEach(el => { devs[el.dataset.dev] = el; });
  const labels = [...root.querySelectorAll('.dx-label')];
  // video in place of the photo: plays only while on screen; still frame on reduced motion / data saver
  const pvid = root.querySelector('.dx-pvid');
  if (pvid) {
    const nc = navigator.connection || {};
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || nc.saveData || /(^|-)2g$/.test(nc.effectiveType || '')) pvid.preload = 'none';
    else if ('IntersectionObserver' in window) {
      const vio = new IntersectionObserver(es => es.forEach(en => {
        if (!pvid.isConnected) return vio.disconnect();
        if (en.isIntersecting) { pvid.preload = 'auto'; const p = pvid.play(); if (p && p.catch) p.catch(() => { }); } else pvid.pause();
      }), { rootMargin: '150px 0px' });
      vio.observe(pvid);
    }
  }
  const photoImg = root.querySelector('.dx-photo img, .dx-photo video'), photoIn = root.querySelector('.dx-photo-in'), hotLayer = root.querySelector('.dx-hot-layer'), hots = [...root.querySelectorAll('.dx-hot')];
  const staticMode = !motion || !X.scrollAnimation;
  root.classList.toggle('dx-static', staticMode);
  const S = { p: staticMode ? 0.74 : 0, tp: 0, mx: 0, my: 0, tmx: 0, tmy: 0, mxRaw: 9, myRaw: 9, hover: null, focus: null, t: 0, visible: false, w: 1, h: 1, mode: 'desk' };
  let gl = null, raf = 0, last = performance.now(), dead = false;

  const LAYOUT = {
    desk: { photo: [.06, .07, 0, -2, 1.5], center: [.06, .04, 0, -3, 2], left: [-.30, .10, -170, 13, 1], right: [.37, -.02, -110, -14, 1], phone: [.24, .25, 150, -9, 0], bg: [-.12, -.24, -560, 6, 0] },
    tab: { photo: [.04, .08, 0, -2, 1.5], center: [.08, .06, 0, -3, 2], right: [.38, -.04, -120, -14, 1], phone: [.30, .26, 150, -9, 0], bg: [-.2, -.26, -560, 6, 0] },
    mob: { photo: [0, .14, 0, 0, 0], center: [0, .10, 0, 0, 1], phone: [.30, .30, 120, -6, 0] }
  };
  const DEPTH = { photo: .5, bg: .25, left: .65, right: .7, center: .5, phone: 1.25 };
  function measure() {
    const r = sticky.getBoundingClientRect(); S.w = r.width; S.h = r.height;
    S.mode = innerWidth < 761 ? 'mob' : innerWidth < 1101 ? 'tab' : 'desk';
    root.dataset.mode = S.mode;
    if (gl) gl.resize(S.w, S.h);
  }
  function scrollTarget() {
    if (staticMode) return 0.74;
    const r = root.getBoundingClientRect(), travel = r.height - innerHeight;
    return travel > 0 ? clamp01(-r.top / travel) : 0.74;
  }
  // write a style only when its value changes (avoids re-styling every element on every frame)
  const sv = (el, k, v) => { v = String(v); const c = el.__sv || (el.__sv = {}); if (c[k] !== v) { c[k] = v; el.style[k] = v; } };
  function apply() {
    const p = S.p, L = LAYOUT[S.mode], W = S.w, Hh = S.h;
    const conv = sm(.04, .22, p), center = sm(.10, .34, p), eco = sm(.30, .52, p), exit = sm(.88, 1, p);
    const t = S.t * X.motionIntensity, par = X.mouseParallax && fine ? X.parallaxIntensity : 0;
    Object.entries(devs).forEach(([id, el], idx) => {
      const pos = L[id]; if (!pos) { sv(el, 'display', 'none'); return; } sv(el, 'display', '');
      let [fx, fy, fz, ry, rx] = pos, x = fx * W, y = fy * Hh, z = fz, op = 1, sc = 1, blur = 0;
      if (id === 'photo' && staticMode) { el.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`; sv(el, 'opacity', '1'); sv(el, 'filter', ''); sv(el, 'zIndex', '10'); return; }
      if (id === 'center' || id === 'photo') { op = center; sc = lerp(.72, 1, center); z = lerp(-380, fz, center); blur = lerp(10, 0, center); }
      else if (id === 'bg') { op = sm(.3, .6, p) * .28; }
      else { x = lerp(0, x, eco); y = lerp(Hh * .02, y, eco); z = lerp(-320, fz, eco); op = eco; sc = lerp(.8, 1, eco); blur = lerp(6, 0, eco); }
      z -= exit * 260; op *= 1 - exit * .7;
      const d = DEPTH[id] || .5;
      y += Math.sin(t * .55 + idx * 1.7) * 6 * (motion ? 1 : 0);
      const main = id === 'center' || id === 'photo';
      ry += S.mx * (main ? 2 : 3) * par; rx += -S.my * (main ? 1.4 : 2) * par;
      x += S.mx * 14 * d * par; y += S.my * 10 * d * par;
      const f = S.focus, h = S.hover;
      if (f) {
        if (f === id) { x = lerp(x, (S.mode === 'mob' ? 0 : .03) * W, .7); y = lerp(y, .04 * Hh, .7); z += 140; sc *= 1.06; ry *= .3; rx *= .3; }
        else { op *= .28; z -= 80; }
      } else if (h) {
        if (h === id) { z += 36; sc *= 1.03; ry *= .6; el.classList.add('is-hover'); }
        else z -= 24;
      }
      if (h !== id || f) el.classList.remove('is-hover');
      el.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      sv(el, 'opacity', op.toFixed(3));
      sv(el, 'filter', blur > .2 ? `blur(${blur.toFixed(1)}px)` : '');
      sv(el, 'zIndex', f === id ? 20 : Math.round(10 + fz / 50));
      sv(el, 'pointerEvents', op > .5 ? '' : 'none');
    });
    if (photoImg && !staticMode) photoImg.style.transform = `translate3d(${(-S.mx * 14 * par).toFixed(1)}px,${(-S.my * 9 * par).toFixed(1)}px,0) scale(${(1.06 + exit * .04).toFixed(3)})`;
    if (hotLayer) hotLayer.style.transform = `translate3d(${(S.mx * 10 * par).toFixed(1)}px,${(S.my * 7 * par).toFixed(1)}px,40px)`;
    labels.forEach((el, i) => {
      if (S.mode === 'mob') { sv(el, 'display', 'none'); return; } sv(el, 'display', '');
      const [fx, fy, fz] = LABEL_POS[i] || [0, 0, 0];
      const lv = sm(.58 + i * .03, .72 + i * .03, p) * (1 - exit) * (S.focus ? .3 : 1);
      const x = fx * W + S.mx * 10 * par, y = fy * Hh + S.my * 8 * par + Math.sin(t * .4 + i * 2) * 5;
      el.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${fz}px)`;
      sv(el, 'opacity', (lv * .75).toFixed(3));
    });
    sv(copy, 'opacity', (sm(.0, .1, p) * (1 - sm(.9, 1, p))).toFixed(3));
    copy.style.transform = `translateY(${((1 - sm(.0, .1, p)) * 24).toFixed(1)}px)`;
    { const fd = (1 - exit).toFixed(3); if (root.__fd !== fd) { root.__fd = fd; root.style.setProperty('--dx-fade', fd); } }
    return { p, conv, center, eco, exit, mx: S.mx * par, my: S.my * par, mxRaw: S.mxRaw, myRaw: S.myRaw };
  }
  function tick(now) {
    raf = 0; if (dead) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (motion && !liteOn()) S.t += dt;
    S.tp = scrollTarget();
    S.p += (S.tp - S.p) * (motion ? .18 : 1);
    S.mx += (S.tmx - S.mx) * .06; S.my += (S.tmy - S.my) * .06;
    const st = apply();
    if (gl) gl.frame(motion && !liteOn() ? dt : 0, st);
    // light mode: the scene follows the scroll, then the loop sleeps (no idle animation)
    const settled = Math.abs(S.tp - S.p) < .0005 && Math.abs(S.tmx - S.mx) < .002 && Math.abs(S.tmy - S.my) < .002;
    if (S.visible && motion && !(liteOn() && settled)) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf && !dead) { last = performance.now(); raf = requestAnimationFrame(tick); } };

  // visibility: run the loop only while the section is near the screen
  const io = new IntersectionObserver(es => { S.visible = es[0].isIntersecting; if (S.visible) { startGL(); kick(); } }, { rootMargin: '300px 0px' });
  io.observe(root);
  const near = new IntersectionObserver(es => { if (es[0].isIntersecting) startGL(); }, { rootMargin: '1200px 0px' });
  near.observe(root);
  let glStarting = false;
  function startGL() {
    if (gl || glStarting || dead) return; glStarting = true;
    const lite = innerWidth < 1101 || (navigator.hardwareConcurrency || 8) <= 4;
    try { const c = document.createElement('canvas'); if (!(c.getContext('webgl') || c.getContext('experimental-webgl'))) return; } catch (e) { return; }
    loadThree().then(T => {
      if (dead) return;
      try { gl = createGL(T, canvas, X, lite); measure(); root.classList.add('dx-gl'); kick(); if (!motion) { const st = apply(); gl.frame(0, st); } }
      catch (e) { gl = null; }
    }).catch(() => { });
  }

  const onScroll = () => kick();
  const onResize = () => { measure(); kick(); };
  const onMove = e => {
    if (!fine) return;
    const r = sticky.getBoundingClientRect();
    S.tmx = (e.clientX - r.left) / r.width * 2 - 1; S.tmy = (e.clientY - r.top) / r.height * 2 - 1;
    S.mxRaw = S.tmx; S.myRaw = S.tmy;
    if (X.cursorLightEnabled) { light.style.setProperty('--lx', (e.clientX - r.left) + 'px'); light.style.setProperty('--ly', (e.clientY - r.top) + 'px'); light.classList.add('on'); }
    if (photoIn && X.photo.cursorLight) {
      const q = photoIn.getBoundingClientRect(), inside = e.clientX > q.left && e.clientX < q.right && e.clientY > q.top && e.clientY < q.bottom;
      photoIn.classList.toggle('lit', inside);
      if (inside) { photoIn.style.setProperty('--px', (e.clientX - q.left) + 'px'); photoIn.style.setProperty('--py', (e.clientY - q.top) + 'px'); photoIn.style.setProperty('--sx', ((e.clientX - q.left) / q.width * 100).toFixed(1) + '%'); }
    }
    const d = e.target.closest && e.target.closest('.dx-dev[data-dev]'); const id = d && d.dataset.dev !== 'bg' ? d.dataset.dev : null;
    if (id !== S.hover) S.hover = id;
    kick();
  };
  const onLeave = () => { S.tmx = S.tmy = 0; S.mxRaw = S.myRaw = 9; S.hover = null; light.classList.remove('on'); if (photoIn) photoIn.classList.remove('lit'); kick(); };
  const setFocus = id => {
    S.focus = S.focus === id ? null : id;
    const lbl = S.focus ? ({ center: X.centerWebsite.focusLabel, left: X.leftWebsite.focusLabel, right: X.designSystem.focusLabel, phone: X.mobileWebsite.focusLabel })[S.focus] : '';
    focusLbl.textContent = lbl || ''; focusLbl.classList.toggle('on', !!lbl);
    root.classList.toggle('dx-focused', !!S.focus); kick();
  };
  const closeHots = except => hots.forEach(h => { if (h !== except) { h.classList.remove('open'); h.querySelector('.dx-dot').setAttribute('aria-expanded', 'false'); } });
  const onClick = e => {
    const hot = e.target.closest('.dx-hot');
    if (hot) { const o = !hot.classList.contains('open'); closeHots(hot); hot.classList.toggle('open', o); hot.querySelector('.dx-dot').setAttribute('aria-expanded', String(o)); return; }
    closeHots();
    if (X.photo && X.photo.enabled && X.photo.clickBurst && gl && motion) { gl.burst(); kick(); }
    const d = e.target.closest('.dx-dev[data-dev]');
    if (d && d.dataset.dev !== 'bg' && d.dataset.dev !== 'photo') setFocus(d.dataset.dev); else if (S.focus) setFocus(S.focus);
  };
  const onKey = e => {
    const d = e.target.closest && e.target.closest('.dx-dev[data-dev]');
    if (d && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setFocus(d.dataset.dev); }
    if (e.key === 'Escape') { closeHots(); if (S.focus) setFocus(S.focus); }
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onResize, { passive: true });
  sticky.addEventListener('pointermove', onMove, { passive: true });
  sticky.addEventListener('pointerleave', onLeave);
  sticky.addEventListener('click', onClick);
  sticky.addEventListener('keydown', onKey);
  measure(); S.p = scrollTarget(); kick();
  if (!motion) apply();

  inst = {
    destroy() {
      dead = true; cancelAnimationFrame(raf); io.disconnect(); near.disconnect();
      removeEventListener('scroll', onScroll); removeEventListener('resize', onResize);
      if (gl) { gl.dispose(); gl = null; }
      inst = null;
    }
  };
}

EXT.experience = { render, mount };
})();
