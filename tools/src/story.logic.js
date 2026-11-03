
const STEPS = [
  { short: 'Picked', title: 'Freshly picked', body: 'Ripe coffee cherries are picked by hand at the farm. Only the deep red ones make the cut.' },
  // TODO-COPY step 2: confirm (a) 'Roasted in small batches by our partner roastery, then ground fresh for each cup.' or
  // (b) '…in our own roastery…'. Until then a neutral line that is true either way:
  { short: 'Roast', title: 'Roasted in small batches', body: 'The green beans inside are roasted slowly until they turn deep brown and smell like caramel.' },
  { short: 'Brew', title: 'Ground & brewed', body: 'Ground fresh for every cup, then pulled as a shot. If it is not right, our baristas pull it again.' },
  { short: 'Pour', title: 'Poured slowly', body: 'Milk and sweetness are measured and poured by hand, one cup at a time.' },
  { short: 'Fuel', title: 'Filled to fuel your day', body: 'Sealed, checked by the barista and handed over, ready for your session at 20FIT Arena.' }
];
const KD = [0, 1, 2, 3, 4, 5], KP = [0, 1, 2, 3.95, 5, 6];
const toP = d => { for (let i = 0; i < 5; i++) if (d <= KD[i + 1]) return KP[i] + (d - KD[i]) * (KP[i + 1] - KP[i]); return 6; };
const cl = x => Math.max(0, Math.min(1, x));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const back = t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const rnd = s => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
const R = y => 0.6 + 0.22 * (y / 2.3);
// Drinks you can spin through on the last step. syrup = bottom layer (dark→light), milk = body (top→bottom), streak = rgb of the marbling.
const DRINKS = [
  { name: 'Signature Aren Latte', syrup: ['#2a1206', '#5c2c0f'], milk: ['#ecd9bd', '#cfa476'], streak: [104, 50, 16], cap: 0xdcbb92, accent: '#c47a35', blurb: 'Palm sugar, espresso & fresh milk' },
  { name: 'Matcha Latte', syrup: ['#2c4510', '#61852c'], milk: ['#f0f3e2', '#c3d29a'], streak: [80, 116, 36], cap: 0xe4ead0, accent: '#6f9d2f', blurb: 'Matcha whisked with fresh milk' },
  { name: 'Strawberry Latte', syrup: ['#6a0a1e', '#c4264b'], milk: ['#f8e9eb', '#efc0c9'], streak: [186, 36, 66], cap: 0xf4dade, accent: '#e0405e', blurb: 'Real strawberry, milk, light sweetness' },
  { name: 'Choco Overload', syrup: ['#1d0c05', '#40200f'], milk: ['#b48460', '#83533a'], streak: [48, 22, 10], cap: 0x9a6b48, accent: '#6b3a1c', blurb: 'Rich chocolate, double the cocoa' },
  { name: 'Tropical Recovery', syrup: ['#e9e6df', '#f6f4ef'], milk: ['#fdfcf9', '#efebe3'], streak: [222, 216, 204], cap: 0xffffff, accent: '#2fb5a3', blurb: 'Coconut, fruit & electrolytes' }
];
const hexRgb = h => h[0] === '#' ? [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)) : h.match(/\d+/g).slice(0, 3).map(Number); // '#rrggbb' or 'rgb(r,g,b)'
const mixHex = (a, b, k) => { const A = hexRgb(a), B = hexRgb(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',') + ')'; };

class Component extends DCLogic {
  state = { step: 0, pp: 0, loading: true, drink: 0 };
  track = React.createRef();
  mount = React.createRef();

  componentDidMount() {
    this.p = 0; this.mx = 0; this.my = 0;
    this._scroll = () => {
      const el = this.track.current; if (!el) return;
      const r = el.getBoundingClientRect(), total = el.offsetHeight - window.innerHeight;
      const d = cl(-r.top / Math.max(1, total * 0.86)) * 5; this.p = toP(d); this.d = d;  // last 14% of the track holds the finished drink
      const step = Math.min(4, Math.floor(d));
      const pp = Math.round((d - step) * 50) / 50;
      if (step !== this.state.step || pp !== this.state.pp) this.setState({ step, pp });
    };
    this._mouse = e => { this.mx = e.clientX / window.innerWidth - 0.5; this.my = e.clientY / window.innerHeight - 0.5; };
    window.addEventListener('scroll', this._scroll, { passive: true });
    window.addEventListener('mousemove', this._mouse);
    this.spin = 0; this.spinV = 0; this.drag = null; this.hoverCup = false;
    this.canHover = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    this._scroll();
    this.init().catch(e => console.error(e));
  }
  componentWillUnmount() {
    this.dead = true; cancelAnimationFrame(this._raf);
    window.removeEventListener('scroll', this._scroll); window.removeEventListener('mousemove', this._mouse);
    if (this._ro) this._ro.disconnect(); if (this._io3d) this._io3d.disconnect();
    if (this.renderer) { this.renderer.dispose(); this.renderer.domElement.remove(); }
  }
  goTo(i) { const el = this.track.current; if (!el) return; const total = el.offsetHeight - window.innerHeight; window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + total * ((i + 0.6) / 5), behavior: 'smooth' }); }

  canvasTex(THREE, w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

  async init() {
    const THREE = await import((window.__resources && window.__resources['https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js']) || 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
    const el = this.mount.current; if (this.dead || !el) return;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); if (!renderer.getContext()) throw new Error('no webgl'); }
    catch (e) { this.setState({ noGL: true, loading: false }); return; }   // no WebGL: the stage shows the location photo per step instead
    this.renderer = renderer;
    const phone = window.innerWidth < 760; this.phone = phone;
    renderer.setPixelRatio(Math.min(phone ? 1.5 : 1.75, window.devicePixelRatio)); renderer.localClippingEnabled = true;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
    Object.assign(renderer.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' });
    renderer.domElement.style.opacity = '0'; renderer.domElement.style.transition = 'opacity .7s ease';
    el.appendChild(renderer.domElement);
    const cvs = renderer.domElement; cvs.style.touchAction = 'pan-y'; cvs.style.cursor = 'grab';
    // Drag spins the cup; hovering the cup (mouse) or tapping it (touch) pours the next drink.
    const onCup = e => this._hitCup ? this._hitCup(e.clientX, e.clientY) : false;
    cvs.addEventListener('pointerdown', e => { this.drag = { x: e.clientX, x0: e.clientX, y0: e.clientY, t0: performance.now(), id: e.pointerId }; this.spinV = 0; cvs.style.cursor = 'grabbing'; try { cvs.setPointerCapture(e.pointerId); } catch (err) {} });
    cvs.addEventListener('pointermove', e => {
      if (!this.drag) {
        if (e.pointerType !== 'mouse') return;
        const over = onCup(e);
        if (over && !this.hoverCup) this.swapDrink(1);
        this.hoverCup = over;
        return;
      }
      if (e.pointerId !== this.drag.id) return;
      const dx = e.clientX - this.drag.x; this.drag.x = e.clientX; const v = dx * 0.011; this.spin += v; this.spinV = v;
    });
    cvs.addEventListener('pointerleave', () => { this.hoverCup = false; if (this.pNdc) this.pNdc.on = false; this._hoverDirty = true; });
    const track = e => { const r = cvs.getBoundingClientRect(); this.pNdc = { on: true, x: (e.clientX - r.left) / r.width * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1, cx: e.clientX, cy: e.clientY }; this._hoverDirty = e.pointerType === 'mouse'; };
    cvs.addEventListener('pointermove', track); cvs.addEventListener('pointerdown', e => { track(e); this._down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    cvs.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') setTimeout(() => { if (this.pNdc) this.pNdc.on = false; }, 400); });
    cvs.addEventListener('click', e => {
      const d = this._down; if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10 || performance.now() - d.t > 500) return;
      const h = this._ingrHit && this._ingrHit(e.clientX, e.clientY); if (!h) return;
      h.it.pop = this.now || 0;
      if (h.g.k.drink != null) this.swapDrink(1, h.g.k.drink);
    });
    const endDrag = e => {
      const d = this.drag; this.drag = null; cvs.style.cursor = 'grab';
      if (d && e && e.type === 'pointerup' && e.pointerType !== 'mouse' && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 10 && performance.now() - d.t0 < 400 && onCup(e)) this.swapDrink(1);
    };
    cvs.addEventListener('pointerup', endDrag); cvs.addEventListener('pointercancel', endDrag);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); this.wide = w > 900; };
    resize(); this._ro = new ResizeObserver(resize); this._ro.observe(el);
    // Only render while the 3D section is on screen and no overlay (menu / order / checkout / history) covers it:
    // a hidden WebGL scene redrawn every frame made every other screen update on the page wait for it.
    this.onScreen = true;
    this._io3d = new IntersectionObserver(es => { this.onScreen = es[es.length - 1].isIntersecting; }, { rootMargin: '200px 0px' });
    if (this.track.current) this._io3d.observe(this.track.current);

    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: 0x4a4a4e, side: THREE.BackSide })));  // mid-grey so glass + ice keep visible edges on the white studio
    const soft = (c, i, x, y, z, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
    soft(0xffffff, 6, 0, 9, 2, 8, 4); soft(0xffffff, 3, 8, 3, 5, 4, 6); soft(0xe30a2e, 4, -8, 2, -3, 4, 6);
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, 0.04).texture;

    const hemi = new THREE.HemisphereLight(0xffffff, 0x1a1414, 0.8); scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff4ea, 2.4); key.position.set(3, 7, 4); key.castShadow = true;
    key.shadow.mapSize.set(this.phone ? 512 : 1024, this.phone ? 512 : 1024); Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 }); key.shadow.bias = -0.0004; key.shadow.radius = 6;
    scene.add(key);
    const rim = new THREE.PointLight(0xe30a2e, 26, 14); rim.position.set(-3.5, 3, -2.5); scene.add(rim);
    const backLight = new THREE.DirectionalLight(0xffffff, 1.6); backLight.position.set(1.5, 4, -6); scene.add(backLight); // rim highlight on the cup edges
    // ── Location backdrops (2.5D photos inside the scene) ──
    // Each location = a far photo (+ optional mid cut-out) on planes attached to the camera, so they always cover the
    // view (cover-fit + margin) at every orbit position; parallax comes from shifting them with the orbit.
    // They sit far behind the podium and draw before the other transparent objects (renderOrder < 0), so the cup,
    // ice and pour always sit in front and the photo shows through the glass. Lighting, exposure and the glass reflections (env map) follow the location.
    const BD = window.StoryBackdrops || { dir: 'story/', steps: ['bar', 'bar', 'bar', 'bar', 'bar'], zoomPerStep: [1, 1, 1, 1, 1], crossfadeFrom: 0.75, enterZoom: 1.06, farDepth: 12, midDepth: 4, coverMargin: 1.15, parallax: { far: 0.35, mid: 1.4 }, lightsOn: { from: 0.6, ms: 600 }, locations: { bar: { label: '', focal: { x: 0.5, y: 0.5 }, light: { key: '#fff1de', keyI: 2.4, keyPos: [3, 7, 4], sky: '#e8e2da', ground: '#1a1414', hemiI: 0.8, rimI: 22, exposure: 1 }, paint: { sky: ['#cfc4b6', '#8c7b6a', '#2a2220'], accent: '#e30a2e' } } } };
    const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    scene.add(camera);
    const sfx = this.phone ? '-mobile' : '';
    const paintLoc = (key, w, h) => {   // placeholder: gradient + simple shapes in the location's colours
      const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), P = (BD.locations[key] || {}).paint || { sky: ['#888', '#444', '#111'], accent: '#e30a2e' };
      const gr = g.createLinearGradient(0, 0, 0, h); P.sky.forEach((col, i) => gr.addColorStop(i / (P.sky.length - 1), col)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const blob = (x, y, rx, ry, col, a) => { g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.ellipse(x * w, y * h, rx * w, ry * h, 0, 0, 7); g.fill(); g.globalAlpha = 1; };
      if (key === 'farm') {
        const sun = g.createRadialGradient(w * 0.8, h * 0.18, 0, w * 0.8, h * 0.18, w * 0.35); sun.addColorStop(0, 'rgba(255,240,200,.9)'); sun.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = sun; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 26; i++) blob(rnd(i + 200), 0.45 + rnd(i + 201) * 0.5, 0.06 + rnd(i + 202) * 0.12, 0.05 + rnd(i + 203) * 0.1, ['#3f6b2a', '#4f7d34', '#2f5320'][i % 3], 0.85);
        for (let i = 0; i < 60; i++) blob(rnd(i + 300), 0.5 + rnd(i + 301) * 0.4, 0.005, 0.009, i % 4 ? '#b3102a' : '#d2392a', 0.9);
      } else if (key === 'roastery') {
        const glow = g.createRadialGradient(w * 0.25, h * 0.55, 0, w * 0.25, h * 0.55, w * 0.4); glow.addColorStop(0, 'rgba(255,138,58,.45)'); glow.addColorStop(1, 'rgba(255,138,58,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
        blob(0.22, 0.5, 0.13, 0.22, '#3a2a20', 1); blob(0.22, 0.5, 0.09, 0.16, '#1a120c', 1); blob(0.22, 0.5, 0.03, 0.05, '#ff8a3a', 0.7);
        for (let i = 0; i < 5; i++) { g.fillStyle = ['#8a6a44', '#7a5c3a', '#96764d'][i % 3]; g.beginPath(); g.roundRect ? g.roundRect(w * (0.62 + i * 0.07), h * (0.62 - (i % 2) * 0.05), w * 0.08, h * 0.3, 18) : g.rect(w * (0.62 + i * 0.07), h * 0.62, w * 0.08, h * 0.3); g.fill(); }
        g.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 8; i++) blob(0.3 + rnd(i + 400) * 0.5, 0.2 + rnd(i + 401) * 0.4, 0.12, 0.05, '#ffffff', 0.05);
      } else if (key === 'bar') {
        g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, h * 0.62, w, h * 0.38); g.fillStyle = '#3a2e28'; g.fillRect(0, h * 0.6, w, h * 0.04);
        g.fillStyle = '#2b2b2e'; g.fillRect(w * 0.12, h * 0.3, w * 0.24, h * 0.3); g.fillStyle = P.accent; g.fillRect(w * 0.12, h * 0.3, w * 0.24, h * 0.025);
        g.fillStyle = '#c9c9cc'; for (let i = 0; i < 3; i++) g.fillRect(w * (0.15 + i * 0.07), h * 0.45, w * 0.012, h * 0.08);
        for (let i = 0; i < 6; i++) blob(0.75 + (i % 3) * 0.05, 0.56 - Math.floor(i / 3) * 0.06, 0.018, 0.03, '#efe8e0', 0.9);
        const lamp = g.createRadialGradient(w * 0.6, 0, 0, w * 0.6, 0, h * 0.7); lamp.addColorStop(0, 'rgba(255,230,190,.45)'); lamp.addColorStop(1, 'rgba(255,230,190,0)'); g.fillStyle = lamp; g.fillRect(0, 0, w, h);
      } else {   // arena
        for (let i = 0; i < 6; i++) { const x = (0.1 + i * 0.16) * w, lg = g.createRadialGradient(x, h * 0.1, 0, x, h * 0.1, w * 0.16); lg.addColorStop(0, 'rgba(235,243,255,.85)'); lg.addColorStop(1, 'rgba(235,243,255,0)'); g.fillStyle = lg; g.fillRect(0, 0, w, h); blob(i * 0.16 + 0.1, 0.1, 0.03, 0.012, '#ffffff', 1); }
        g.fillStyle = '#16301f'; g.fillRect(0, h * 0.66, w, h * 0.34); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = Math.max(2, w / 500); for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(w / 2 + i * w * 0.02, h * 0.66); g.lineTo(w / 2 + i * w * 0.2, h); g.stroke(); }
        g.fillStyle = P.accent; g.fillRect(0, h * 0.6, w, h * 0.012); g.globalAlpha = 0.9; g.fillRect(w * 0.06, h * 0.3, w * 0.05, h * 0.26); g.fillRect(w * 0.89, h * 0.3, w * 0.05, h * 0.26); g.globalAlpha = 1;
      }
      const vg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
      return c;
    };
    // depth-tested but far behind everything: solid objects (podium, cherries, beans) stay in front; transparent ones (glass) sort after (renderOrder)
    const planeMat = () => new THREE.MeshBasicMaterial({ transparent: true, depthTest: true, depthWrite: false, fog: false, toneMapped: false, opacity: 0 });
    const locs = {};   // key -> { far, mid, env, aspect, loading }
    const loadImg = urls => new Promise(res => { const tryOne = i => { if (i >= urls.length) return res(null); const im = new Image(); im.decoding = 'async'; im.onload = () => res(im); im.onerror = () => tryOne(i + 1); im.src = urls[i]; }; tryOne(0); });
    const envFrom = src => {   // tiny blurred copy of the location as an equirect env map (glass + ice reflect the place)
      const c = document.createElement('canvas'); c.width = this.phone ? 256 : 512; c.height = c.width / 2; const g = c.getContext('2d');
      g.filter = 'blur(' + Math.round(c.width / 40) + 'px)'; g.drawImage(src, -c.width * 0.05, -c.height * 0.05, c.width * 1.1, c.height * 1.1);
      const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
      const rt = pm.fromEquirectangular(t); t.dispose(); return rt.texture;
    };
    const ensureLoc = key => {
      if (!key || locs[key]) return;
      const L = locs[key] = { far: new THREE.Mesh(new THREE.PlaneGeometry(1, 1), planeMat()), mid: null, env: null, aspect: this.phone ? 9 / 16 : 16 / 9 };
      L.far.renderOrder = -100; L.far.visible = false; camera.add(L.far);
      const setFar = (src, aspect) => { const t = src instanceof HTMLCanvasElement ? new THREE.CanvasTexture(src) : new THREE.Texture(src); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; if (L.far.material.map) L.far.material.map.dispose(); L.far.material.map = t; L.far.material.needsUpdate = true; L.aspect = aspect; if (L.env) L.env.dispose(); L.env = envFrom(src); };
      const ph = paintLoc(key, this.phone ? 540 : 1280, this.phone ? 960 : 720); setFar(ph, ph.width / ph.height);   // placeholder right away
      const base = BD.dir + key;
      loadImg([base + '-far' + sfx + '.avif', base + '-far' + sfx + '.webp', base + '-far.webp']).then(im => { if (im && locs[key] === L) setFar(im, im.naturalWidth / im.naturalHeight); });
      if (!this.phone) loadImg([base + '-mid.webp', base + '-mid.png']).then(im => {   // mid layer: desktop only
        if (!im || locs[key] !== L) return;
        const t = new THREE.Texture(im); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
        L.mid = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), planeMat()); L.mid.material.map = t; L.mid.renderOrder = -90; L.mid.visible = false; L.midAspect = im.naturalWidth / im.naturalHeight; camera.add(L.mid);
      });
    };
    const dropLoc = key => { const L = locs[key]; if (!L) return; [L.far, L.mid].forEach(m => { if (!m) return; camera.remove(m); if (m.material.map) m.material.map.dispose(); m.material.dispose(); m.geometry.dispose(); }); if (L.env) L.env.dispose(); delete locs[key]; };
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const placeLayer = (mesh, aspect, depth, zoom, focal, shiftX, shiftY, opacity) => {
      if (!mesh) return;
      mesh.visible = opacity > 0.002; mesh.material.opacity = opacity; if (!mesh.visible) return;
      const vh = 2 * depth * tanHalf * BD.coverMargin * zoom, vw = vh * camera.aspect;
      let pw = vw, phh = vw / aspect; if (phh < vh) { phh = vh; pw = vh * aspect; }
      const ex = (pw - vw) / 2, ey = (phh - vh) / 2, f = focal || { x: 0.5, y: 0.5 };
      mesh.scale.set(pw, phh, 1);
      mesh.position.set(Math.max(-ex, Math.min(ex, (0.5 - f.x) * pw)) + shiftX, Math.max(-ey, Math.min(ey, (f.y - 0.5) * phh)) + shiftY, -depth);
    };
    const mixC = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k);
    let curEnvKey = null, lit = { key: null, t0: -9 };
    const backdropTick = (time, camDist, orbitX, orbitY) => {
      const n = BD.steps.length, ds = Math.max(0, Math.min(n - 1e-4, this.ds || 0)), s = Math.floor(ds), f = ds - s;
      const fromKey = BD.steps[s], toKey = BD.steps[Math.min(n - 1, s + 1)];
      let k = s < n - 1 ? cl((f - BD.crossfadeFrom) / (1 - BD.crossfadeFrom)) : 0; k = ease(k);
      if (reduceMotion) { this._rk = (this._rk || 0) + ((k > 0.5 ? 1 : 0) - (this._rk || 0)) * Math.min(1, (this._bdt || 0.016) / 0.2); k = this._rk; }
      // load the current + next location; free locations more than 2 steps behind
      ensureLoc(fromKey); ensureLoc(toKey); if (f > 0.4) ensureLoc(BD.steps[Math.min(n - 1, s + 2)]);
      Object.keys(locs).forEach(key => { const idx = BD.steps.lastIndexOf(key); if (idx < s - 2 && key !== fromKey && key !== toKey) dropLoc(key); });
      const zoomA = BD.zoomPerStep[s] || 1, zoomB = BD.zoomPerStep[Math.min(n - 1, s + 1)] || 1;
      const same = fromKey === toKey, zoomNow = zoomA + (zoomB - zoomA) * k;   // same place (bar -> bar): dolly in, no crossfade
      const farD = camDist + BD.farDepth, midD = camDist + BD.midDepth;
      const px = reduceMotion ? 0 : orbitX, py = reduceMotion ? 0 : orbitY;
      Object.keys(locs).forEach(key => {
        const L = locs[key], cfgL = BD.locations[key] || {}, isFrom = key === fromKey, isTo = key === toKey;
        let op = 0, zoom = 1, midOut = 0;
        if (same && isFrom) { op = 1; zoom = zoomNow; midOut = k; }
        else if (isFrom) { op = 1 - k; zoom = zoomA; midOut = k; }
        else if (isTo) { op = k; zoom = reduceMotion ? 1 : BD.enterZoom - (BD.enterZoom - 1) * k; }
        placeLayer(L.far, L.aspect, farD, zoom, cfgL.focal, -px * BD.parallax.far, -py * BD.parallax.far * 0.5, op);
        if (L.mid) placeLayer(L.mid, L.midAspect, midD, zoom, cfgL.focal, -px * BD.parallax.mid + (isFrom ? -midOut * 2.5 : 0), -py * BD.parallax.mid * 0.5, op * (same && isFrom ? 1 - midOut : 1));
      });
      // lighting preset blend
      const A = (BD.locations[fromKey] || {}).light, B = (BD.locations[toKey] || {}).light || A;
      if (A) {
        const kk = same ? 0 : k, lerp = (a, b) => a + (b - a) * kk;
        // Arena: switch the lights on once the location has fully arrived
        const arenaIn = (fromKey === 'arena' && (same || k < 0.01)) || (toKey === 'arena' && k > 0.99);
        if (arenaIn && lit.key !== 'arena') lit = { key: 'arena', t0: time }; else if (!arenaIn && lit.key === 'arena') lit = { key: null, t0: -9 };
        const lo = BD.lightsOn, on = lit.key === 'arena' && !reduceMotion ? lo.from + (1 - lo.from) * ease(cl((time - lit.t0) * 1000 / lo.ms)) : 1;
        const flash = lit.key === 'arena' && !reduceMotion ? Math.max(0, 1 - Math.abs((time - lit.t0) * 1000 / lo.ms - 1) * 2) : 0;
        key.color.copy(mixC(A.key, B.key, kk)); key.intensity = lerp(A.keyI, B.keyI) * on; key.position.set(lerp(A.keyPos[0], B.keyPos[0]), lerp(A.keyPos[1], B.keyPos[1]), lerp(A.keyPos[2], B.keyPos[2]));
        hemi.color.copy(mixC(A.sky, B.sky, kk)); hemi.groundColor.copy(mixC(A.ground, B.ground, kk)); hemi.intensity = lerp(A.hemiI, B.hemiI);
        rim.intensity = lerp(A.rimI, B.rimI) + flash * 60; renderer.toneMappingExposure = lerp(A.exposure, B.exposure) * on;
        ring.material.color.setRGB(0.89 + flash * 0.11, 0.04 + flash * 0.5, 0.18 + flash * 0.5);
        Object.values(locs).forEach(L => { if (L.far.material.color) L.far.material.color.setScalar(on); });
        const envKey = (same || k < 0.5) ? fromKey : toKey;   // glass reflects the location that dominates the view
        if (envKey !== curEnvKey && locs[envKey] && locs[envKey].env) { curEnvKey = envKey; scene.environment = locs[envKey].env; }
      }
      const label = (BD.locations[(same || k < 0.5) ? fromKey : toKey] || {}).label || '';
      if (label !== this.state.locLabel) this.setState({ locLabel: label });
    };
    ensureLoc(BD.steps[0]);
    const fill = new THREE.PointLight(0xffe2c4, 14, 9); fill.position.set(2.6, 1.6, 3.2); scene.add(fill); // warm fill so the latte glows

    const tableTex = this.canvasTex(THREE, 1024, 1024, (x, w, h) => { x.fillStyle = '#1c1717'; x.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { x.fillStyle = `rgba(255,255,255,${0.05 + rnd(i) * 0.5})`; const s = 0.6 + rnd(i + 9) * 1.6; x.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, s, s); } x.strokeStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 18; i++) { x.beginPath(); x.moveTo(rnd(i + 40) * w, rnd(i + 50) * h); x.bezierCurveTo(rnd(i + 60) * w, rnd(i + 70) * h, rnd(i + 80) * w, rnd(i + 90) * h, rnd(i + 99) * w, rnd(i + 33) * h); x.stroke(); } });
    const table = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.3, 128), [new THREE.MeshStandardMaterial({ color: 0x141111, roughness: 0.8 }), new THREE.MeshStandardMaterial({ map: tableTex, roughness: 0.7 }), new THREE.MeshStandardMaterial({ color: 0x141111 })]);
    table.visible = false;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.62, 0.5, 96), new THREE.MeshPhysicalMaterial({ color: 0x121212, roughness: 0.45, metalness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.3 })); ped.position.y = -0.25; ped.receiveShadow = true; ped.castShadow = true; scene.add(ped);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.56, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: 0xe30a2e })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.001; scene.add(ring);
    // neon base ring + soft red glow on the floor around the pedestal
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.63, 0.016, 8, 160), new THREE.MeshBasicMaterial({ color: 0xff2a48 })); ring2.rotation.x = Math.PI / 2; ring2.position.y = -0.49; scene.add(ring2);
    const haloTex = this.canvasTex(THREE, 256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,.42)'); gr.addColorStop(0.45, 'rgba(255,255,255,.14)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    // The photo backdrop shows through: no floor or grid. A shadow catcher keeps the podium's shadow, and a soft
    // contact shadow under it stops it from floating on the photo.
    const catcher = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.35 })); catcher.rotation.x = -Math.PI / 2; catcher.position.y = -0.5; catcher.receiveShadow = true; scene.add(catcher);
    const contactTex = this.canvasTex(THREE, 256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(0.55, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false })); contact.rotation.x = -Math.PI / 2; contact.position.y = -0.495; scene.add(contact);

    const cup = new THREE.Group(); scene.add(cup);
    const dropTex = this.canvasTex(THREE, 512, 1024, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { const r = 1 + rnd(i * 3) * (rnd(i * 7) > 0.92 ? 7 : 2.6), px = rnd(i) * w, py = h * 0.12 + rnd(i + 1) * h * 0.86; const g = x.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(px, py, r, r * 1.15, 0, 0, Math.PI * 2); x.fill(); } });
    dropTex.wrapS = THREE.RepeatWrapping;
    const glass = new THREE.MeshPhysicalMaterial({ bumpMap: dropTex, bumpScale: 0.6, color: 0xffffff, transmission: 0, roughness: 0.04, metalness: 0, specularIntensity: 1, clearcoat: 1, clearcoatRoughness: 0.03, side: THREE.DoubleSide, transparent: true, opacity: 0.15, depthWrite: false, envMapIntensity: 2.2 });
    const rimMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.6, roughness: 0.1, transparent: true, opacity: 0.9 });
    const prof = [[0, 0.02], [0.58, 0.02], [0.61, 0.06], [0.82, 2.3], [0.87, 2.32], [0.86, 2.36]].map(([a, b]) => new THREE.Vector2(a, b));
    const cupMesh = new THREE.Mesh(new THREE.LatheGeometry(prof, 120), glass); cupMesh.castShadow = true; cupMesh.renderOrder = 10; cup.add(cupMesh);
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    this._hitCup = (x, y) => { if (!cup.visible) return false; const r = cvs.getBoundingClientRect(); ndc.set((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.intersectObject(cupMesh, false).length > 0; };
    const lid = new THREE.Group(); cup.add(lid);
    lid.add(new THREE.Mesh(new THREE.LatheGeometry([[0.91, -0.02], [0.92, 0.05], [0.88, 0.09], [0.8, 0.1], [0.78, 0.13], [0.7, 0.14], [0, 0.14]].map(([a, b]) => new THREE.Vector2(a, b)), 120), glass));
    const rimRing = new THREE.Mesh(new THREE.TorusGeometry(0.865, 0.022, 12, 120), rimMat); rimRing.rotation.x = Math.PI / 2; rimRing.position.y = 2.33; cup.add(rimRing);

    const milkTex = this.canvasTex(THREE, 512, 512, (x, w, h) => { x.fillStyle = '#ead9bf'; x.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { x.strokeStyle = `rgba(${120 + rnd(i) * 40},${70 + rnd(i + 3) * 30},30,${0.25 + rnd(i + 5) * 0.4})`; x.lineWidth = 4 + rnd(i + 7) * 22; x.beginPath(); const sx = rnd(i + 11) * w; x.moveTo(sx, 0); for (let y = 0; y <= h; y += 32) x.lineTo(sx + Math.sin(y / 60 + i) * 30, y); x.stroke(); } });
    milkTex.wrapS = THREE.RepeatWrapping;
    const liqCanvas = document.createElement('canvas'); liqCanvas.width = 512; liqCanvas.height = 1024;
    const liqTex = new THREE.CanvasTexture(liqCanvas); liqTex.colorSpace = THREE.SRGBColorSpace;
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.01, 72, 1), [new THREE.MeshPhysicalMaterial({ map: liqTex, roughness: 0.28, clearcoat: 0.5 }), new THREE.MeshPhysicalMaterial({ color: 0x3a1c0c, roughness: 0.15, clearcoat: 1 }), new THREE.MeshPhysicalMaterial({ color: 0x8a4a18 })]); liquid.visible = false; cup.add(liquid);
    let liqKey = '';
    const drawLiquid = (a, m, e, d) => {
      const x = liqCanvas.getContext('2d'), W = liqCanvas.width, H = liqCanvas.height, tot = 2.15;
      const yTop = H * (1 - (a + m + e) / tot), ya = H * (1 - a / tot), mix = cl(m / 1.1), esp = '#3a1c0c';
      const span = Math.max(1, H - yTop), at = y => Math.min(0.999, Math.max(0.001, (y - yTop) / span));
      x.filter = 'none';
      const g = x.createLinearGradient(0, yTop, 0, H);
      g.addColorStop(0, mix > 0 ? mixHex(esp, d.milk[0], mix) : esp);
      if (m > 0.01) { g.addColorStop(at(yTop + (ya - yTop) * 0.55), mixHex(esp, mixHex(d.milk[0], d.milk[1], 0.45), mix)); g.addColorStop(at(ya - 26), mixHex(esp, d.milk[1], mix)); }
      g.addColorStop(at(ya + 10), d.syrup[1]); g.addColorStop(1, d.syrup[0]);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      if (m > 0.01) {
        const [r0, g0, b0] = d.streak, body = ya - yTop;
        // soft clouds of syrup rising from the bottom layer into the milk (like an iced aren latte)
        // random-walk path so the marbling looks poured, not drawn
        const wander = (i, sx, y0, len, step, jitter) => { x.beginPath(); let px = sx, vx = (rnd(i * 7 + 1) - 0.5) * 2; x.moveTo(px, y0);
          for (let y = step, k = 0; y <= len; y += step, k++) { vx = vx * 0.86 + (rnd(i * 131 + k * 17) - 0.5) * jitter; px += vx; x.lineTo(px, y0 - y); } x.stroke(); };
        x.filter = 'blur(16px)'; x.lineCap = 'round';
        for (let i = 0; i < 30; i++) {
          x.strokeStyle = `rgba(${r0},${g0},${b0},${(0.18 + rnd(i + 3) * 0.36) * mix})`; x.lineWidth = 18 + rnd(i + 6) * 60;
          wander(i, rnd(i + 8) * W, ya + 10, body * (0.15 + rnd(i + 9) * 0.6), 18, 9);
        }
        // crisp darker veins for the marbled look
        x.filter = 'blur(3px)';
        for (let i = 0; i < 18; i++) {
          x.strokeStyle = `rgba(${Math.round(r0 * 0.8)},${Math.round(g0 * 0.8)},${Math.round(b0 * 0.8)},${(0.24 + rnd(i + 21) * 0.32) * mix})`; x.lineWidth = 3 + rnd(i + 22) * 9;
          wander(i + 50, rnd(i + 23) * W, ya + 4, body * (0.1 + rnd(i + 24) * 0.45), 12, 7);
        }
        // creamy top band
        x.filter = 'blur(6px)'; const tg = x.createLinearGradient(0, yTop, 0, yTop + body * 0.25);
        tg.addColorStop(0, `rgba(255,248,236,${0.35 * mix})`); tg.addColorStop(1, 'rgba(255,248,236,0)'); x.fillStyle = tg; x.fillRect(0, yTop - 4, W, body * 0.25);
        x.filter = 'none';
      }
      liqTex.needsUpdate = true; };
    const LMAX = 2.15, clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    liquid.geometry.dispose(); liquid.geometry = new THREE.CylinderGeometry(R(0.05 + LMAX) - 0.03, R(0.05) - 0.03, LMAX, 72, 1, true); liquid.position.y = 0.05 + LMAX / 2;
    liquid.material = liquid.material[0]; Object.assign(liquid.material, { clippingPlanes: [clip], side: THREE.DoubleSide, transparent: true, opacity: 0.97, depthWrite: true, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.15 }); liquid.renderOrder = 1;
    const cap = new THREE.Mesh(new THREE.CircleGeometry(1, 72), new THREE.MeshPhysicalMaterial({ color: 0x3a1c0c, roughness: 0.22, clearcoat: 0.8, transparent: true, opacity: 0.95, depthWrite: false })); cap.rotation.x = -Math.PI / 2; cap.renderOrder = 2; cup.add(cap);
    const setLiquid = (a, m, e, di) => { const h = a + m + e, d = DRINKS[di]; liquid.visible = cap.visible = h > 0.004; if (!liquid.visible) return; const top = 0.05 + h;
      clip.constant = top * cup.scale.y + cup.position.y; cap.position.y = top; cap.scale.setScalar(R(top) - 0.03); cap.material.color.set(m > 0.02 ? d.cap : e > 0.02 ? 0x3a1c0c : 0x8a4a18);
      const k = [a, m, e].map(v => (Math.round(v * 40) / 40).toFixed(3)).join() + '|' + di; if (k !== liqKey) { liqKey = k; drawLiquid(a, m, e, d); } };
    const liq = (opts) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.01, 64), new THREE.MeshPhysicalMaterial({ roughness: 0.3, clearcoat: 0.4, ...opts })); m.visible = false; cup.add(m); return m; };
    const aren = liq({ color: 0xa8571c }), milk = liq({ map: milkTex }), esp = liq({ color: 0x2e170a, roughness: 0.2 });
    const setLayer = (m, y0, y1) => { const h = y1 - y0; m.visible = h > 0.004; if (!m.visible) return; m.geometry.dispose(); m.geometry = new THREE.CylinderGeometry(R(y1) - 0.035, R(y0) - 0.035, h, 64); m.position.y = y0 + h / 2; };

    const logoTex = this.canvasTex(THREE, 1024, 512, (x, w, h) => {
      x.clearRect(0, 0, w, h); x.textBaseline = 'middle'; x.textAlign = 'left'; x.font = '500 168px Manrope, Arial, sans-serif';
      const w2 = x.measureText('2').width, wF = x.measureText('FIT').width, d = 132, gap = 10, tw = w2 + gap + d + gap + wF, sx = (w - tw) / 2, cy = 200;
      x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 10;
      x.fillStyle = '#ffffff'; x.fillText('2', sx, cy); x.fillText('FIT', sx + w2 + gap + d + gap, cy);
      const cx = sx + w2 + gap + d / 2;
      x.beginPath(); x.arc(cx, cy, d / 2, 0, Math.PI * 2); x.fillStyle = '#ffffff'; x.fill(); x.shadowBlur = 0;
      x.beginPath(); x.arc(cx, cy, d / 2 - 12, 0, Math.PI * 2); x.fillStyle = '#0d0d0d'; x.fill();
      x.beginPath(); x.arc(cx, cy, d / 2 - 22, 0, Math.PI * 2); x.fillStyle = '#e30a2e'; x.fill();
      x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 8; x.textAlign = 'center'; x.fillStyle = '#ffffff'; x.font = '600 74px Manrope, Arial, sans-serif'; x.fillText('C  A  F  E', w / 2, 360);
      x.fillStyle = '#e30a2e'; x.fillRect(w / 2 - 120, 430, 240, 8);
    });
    const logoMat = new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, depthWrite: false, opacity: 0, toneMapped: false });
    const logo = new THREE.Mesh(new THREE.CylinderGeometry(R(1.62) + 0.008, R(0.98) + 0.008, 0.64, 72, 1, true, -0.78, 1.56), logoMat); logo.position.y = 1.3; logo.renderOrder = 11; cup.add(logo);
    // red 20FIT straw (appears with the lid)
    const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.75, 24, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xe30a2e, roughness: 0.35, clearcoat: 0.6, side: THREE.DoubleSide }));
    straw.position.set(0.22, 1.72, 0.06); straw.rotation.z = -0.16; straw.castShadow = true; cup.add(straw);
    const iceMat = new THREE.MeshPhysicalMaterial({ color: 0xeef7ff, roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, ior: 1.31, transparent: true, opacity: 0.62, depthWrite: false, envMapIntensity: 1.8, emissive: 0x334455, emissiveIntensity: 0.15 });
    const iceGeo = new THREE.BoxGeometry(0.36, 0.32, 0.36, 4, 4, 4); { const p = iceGeo.attributes.position, v = new THREE.Vector3(); for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k); const s = v.clone().normalize().multiplyScalar(0.23); v.lerp(s, 0.28); p.setXYZ(k, v.x, v.y, v.z); } iceGeo.computeVertexNormals(); }
    // every cube stays inside the glass: centre radius + cube half-size + wall margin <= inner radius at that height, top below the rim
    const ice = Array.from({ length: 11 }, (_, i) => { const m = new THREE.Mesh(iceGeo, iceMat); const sc = 0.72 + rnd(i + 9) * 0.18, y = 0.34 + i * 0.15, rmax = Math.max(0, R(y) - 0.25 * sc - 0.07), a = i * 2.4, rr = rmax * (0.35 + rnd(i) * 0.65); m.userData = { x: Math.cos(a) * rr, z: Math.sin(a) * rr, y, r: rnd(i + 4) * 6, s: sc }; m.renderOrder = 3; m.castShadow = true; m.scale.setScalar(m.userData.s); cup.add(m); return m; });

    const streamGeo = new THREE.CylinderGeometry(0.035, 0.05, 1, 20); streamGeo.translate(0, -0.5, 0);
    // the pour fades in from above instead of starting off-screen (it used to run up under the header)
    const streamFade = this.canvasTex(THREE, 4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#000'); gr.addColorStop(0.35, '#fff'); gr.addColorStop(1, '#fff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    streamFade.colorSpace = THREE.NoColorSpace;
    const shot = new THREE.Mesh(streamGeo, new THREE.MeshPhysicalMaterial({ color: 0x2e170a, roughness: 0.15, clearcoat: 1, alphaMap: streamFade, transparent: true, depthWrite: false })); scene.add(shot);
    const pourMilk = new THREE.Mesh(streamGeo, new THREE.MeshPhysicalMaterial({ color: 0xf1e6d4, roughness: 0.25, alphaMap: streamFade, transparent: true, depthWrite: false })); scene.add(pourMilk);

    // Roasted coffee bean: oval, one flatter face with an S-shaped centre crease showing the pale silverskin,
    // oily clearcoat sheen and a slightly different roast colour per bean.
    const beanGeo = new THREE.SphereGeometry(0.145, this.phone ? 24 : 40, this.phone ? 16 : 28); {
      const pos = beanGeo.attributes.position, col = [], v = new THREE.Vector3();
      for (let k = 0; k < pos.count; k++) {
        v.fromBufferAttribute(pos, k);
        let x = v.x, y = v.y * 0.7, z = v.z * 0.58;              // oval bean
        const n = x / 0.145;                                    // -1..1 along the bean
        if (z > 0) z *= 0.62;                                   // flatter face
        const cy = 0.018 * Math.sin(n * 3.2);                   // S-shaped crease path
        const d = (y - cy) / 0.016, g = Math.exp(-d * d) * Math.max(0, 1 - n * n * 1.1) * (z > 0 ? 1 : 0);
        z -= g * 0.05;                                          // groove
        y += Math.sign(y - cy) * g * 0.006;
        pos.setXYZ(k, x, y, z);
        col.push(1 + g * 5, 1 + g * 10, 1 + g * 8);
      }
      beanGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); beanGeo.computeVertexNormals();
    }
    const beanBump = this.canvasTex(THREE, 128, 128, (g, w, h) => { const im = g.createImageData(w, h); for (let k = 0; k < w * h; k++) { const r = 110 + Math.random() * 60; im.data[k * 4] = im.data[k * 4 + 1] = im.data[k * 4 + 2] = r; im.data[k * 4 + 3] = 255; } g.putImageData(im, 0, 0); });
    beanBump.colorSpace = THREE.NoColorSpace; beanBump.wrapS = beanBump.wrapT = THREE.RepeatWrapping;
    const beanMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.32, bumpMap: beanBump, bumpScale: 0.6, envMapIntensity: 1.2 });
    const NP = 90, NF = 80;
    const pile = new THREE.InstancedMesh(beanGeo, beanMat, NP), fall = new THREE.InstancedMesh(beanGeo, beanMat, NF);
    pile.castShadow = fall.castShadow = true; scene.add(pile); scene.add(fall);
    { const c = new THREE.Color(), roast = ['#4a2614', '#5a321b', '#683b21', '#3d1f10', '#73452a']; for (let k = 0; k < NP; k++) pile.setColorAt(k, c.set(roast[k % 5]).offsetHSL(0, 0, (rnd(k + 31) - 0.5) * 0.04)); for (let k = 0; k < NF; k++) fall.setColorAt(k, c.set(roast[(k * 3) % 5])); pile.instanceColor.needsUpdate = fall.instanceColor.needsUpdate = true; }
    const pileData = Array.from({ length: NP }, (_, k) => { const rr = Math.sqrt(k / NP) * 1.05, a = k * 2.39996; return { x: Math.cos(a) * rr, z: Math.sin(a) * rr, y: 0.07 + (1 - rr) * 0.5 * (0.8 + rnd(k) * 0.4), rx: rnd(k + 1) * 6, ry: rnd(k + 2) * 6 }; });
    const ground = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.6, 72), new THREE.MeshStandardMaterial({ color: 0x2a1609, roughness: 1 })); ground.position.y = 0.3; ground.castShadow = true; scene.add(ground);


    // Step 1 — a coffee branch with ripe cherries hanging over the pedestal; the cherries drop onto it one by one.
    const BR_Y = 1.8, branch = new THREE.Group(); branch.position.set(0.15, BR_Y, -0.1); scene.add(branch);
    const stemCurve = new THREE.CatmullRomCurve3([[-2.2, 0.25, -0.3], [-1.1, 0.03, 0], [0, -0.04, 0.1], [1.1, 0.05, -0.05], [2.1, 0.28, -0.3]].map(([a, b, c]) => new THREE.Vector3(a, b, c)));
    branch.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 64, 0.045, 10, false), new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.85 })));
    const leafMat2 = new THREE.MeshPhysicalMaterial({ color: 0x3f7a2a, roughness: 0.45, clearcoat: 0.6, side: THREE.DoubleSide });
    const bigLeaf = new THREE.SphereGeometry(0.42, 20, 10); bigLeaf.scale(1, 0.06, 0.38); bigLeaf.translate(0.38, 0, 0);
    for (let k = 0; k < 14; k++) {
      const pt = stemCurve.getPoint(0.04 + k / 14 * 0.92), lf = new THREE.Mesh(bigLeaf, leafMat2);
      lf.position.copy(pt); lf.rotation.set((rnd(k + 40) - 0.5) * 0.9, (k % 2 ? 1 : -1) * (0.9 + rnd(k + 41) * 0.8), (rnd(k + 42) - 0.3) * 0.9); branch.add(lf);
    }
    const cherryGeo = new THREE.SphereGeometry(0.1, 18, 12); cherryGeo.scale(1, 0.92, 1);
    const cherryMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 });
    const NC = this.phone ? 30 : 44, cherries = new THREE.InstancedMesh(cherryGeo, cherryMat, NC); cherries.castShadow = true; scene.add(cherries);
    const cherryData = Array.from({ length: NC }, (_, k) => {
      const cluster = stemCurve.getPoint(0.12 + (k % 7) / 7 * 0.78), a = rnd(k + 60) * 6.28, r = 0.08 + rnd(k + 61) * 0.12;
      const hang = new THREE.Vector3(cluster.x + Math.cos(a) * r + 0.15, cluster.y + BR_Y - 0.1 - rnd(k + 62) * 0.14, cluster.z + Math.sin(a) * r - 0.1);
      const pd = pileData[(k * 2) % NP];
      cherries.setColorAt(k, new THREE.Color(['#b3102a', '#c8142f', '#8e0c22', '#d2392a', '#a5122c'][k % 5]));
      return { hang, land: new THREE.Vector3(pd.x, 0.12 + pd.y * 0.55, pd.z), at: rnd(k + 63) * 0.7, rx: rnd(k + 64) * 6 };
    });
    cherries.instanceColor.needsUpdate = true;
    // Step 2 — roasting: warm light, a glowing ring and smoke curling up from the beans
    const roastLight = new THREE.PointLight(0xff7a2a, 0, 6); roastLight.position.set(0, 0.6, 0.4); scene.add(roastLight);
    const roastRing = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.03, 8, 120), new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: 0 })); roastRing.rotation.x = Math.PI / 2; roastRing.position.y = 0.02; scene.add(roastRing);
    const smoke = Array.from({ length: 12 }, (_, k) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xb8afa6, transparent: true, depthWrite: false, opacity: 0 })); sp.userData = { x: (rnd(k + 80) - 0.5) * 1.4, z: (rnd(k + 81) - 0.5) * 1.0, ph: rnd(k + 82), sp: 0.25 + rnd(k + 83) * 0.2 }; scene.add(sp); return sp; });
    const greenBean = new THREE.Color('#9aa36a'), roastCols = ['#4a2614', '#5a321b', '#683b21', '#3d1f10', '#73452a'].map(c => new THREE.Color(c)), tmpC = new THREE.Color();

    const dummy = new THREE.Object3D(), clock = new THREE.Clock();
    let camX = 0, camY = 0;
    this.setState({ loading: false }); requestAnimationFrame(() => requestAnimationFrame(() => { renderer.domElement.style.opacity = '1'; }));
    const frame = () => {
      if (this.dead) return;
      if (!this.onScreen || this.props.mediaHold) { clock.getDelta(); this._pt = null; this._raf = requestAnimationFrame(frame); return; }  // paused
      const time = clock.getElapsedTime(); const pdt = Math.min(0.12, Math.max(0, time - (this._pt == null ? time : this._pt))); this._pt = time;
      if (this.ps == null) this.ps = this.p;
      this.ps += (this.p - this.ps) * (1 - Math.exp(-pdt * (Math.abs(this.p - this.ps) > 1.2 ? 9 : 5)));  // same catch-up speed at 20 or 60 fps
      const p = this.ps;
      if (this.ds == null) this.ds = this.d || 0; this.ds += ((this.d || 0) - this.ds) * (1 - Math.exp(-pdt * 5)); this._bdt = pdt;
      const t = i => cl(p - i), t0 = t(0), t2 = cl((p - 2.55) / 0.5), t3 = t(3), t4 = t(4), t5 = t(5);
      fall.visible = false;   // (old 'beans falling from the sky' intro, replaced by the coffee branch)
      const pour = 0;
      // 1. Picked: the branch sways, cherries drop onto the pedestal, then the branch lifts away
      const away = ease(cl((p - 0.95) / 0.35)); branch.visible = away < 1;
      branch.position.y = BR_Y + away * 3; branch.rotation.z = Math.sin(time * 0.8) * 0.03; branch.scale.setScalar(1 - away * 0.3);
      const roastIn = cl((p - 1.05) / 0.35);   // cherries -> beans
      cherryData.forEach((c, k) => {
        const f = ease(cl((t0 * 1.25 - c.at) / 0.3));
        dummy.position.set(c.hang.x + (c.land.x - c.hang.x) * f, f < 1 ? c.hang.y + (c.land.y - c.hang.y) * f * f : c.land.y, c.hang.z + (c.land.z - c.hang.z) * f);
        if (f === 0) { dummy.position.y = c.hang.y + Math.sin(time * 1.4 + k) * 0.01 + away * 3; }
        dummy.rotation.set(c.rx + f * 4, c.rx, 0); dummy.scale.setScalar(1 - ease(roastIn)); dummy.updateMatrix(); cherries.setMatrixAt(k, dummy.matrix);
      });
      cherries.instanceMatrix.needsUpdate = true; cherries.visible = roastIn < 1;
      // 2. Roast: beans appear green and roast to brown with heat + smoke
      const roastK = ease(cl((p - 1.25) / 0.6)), heat = Math.sin(cl((p - 1.05) / 1.05) * Math.PI);
      if (p > 1 && p < 2.2) { for (let k = 0; k < NP; k++) pile.setColorAt(k, tmpC.copy(greenBean).lerp(roastCols[k % 5], roastK)); pile.instanceColor.needsUpdate = true; }
      roastLight.intensity = heat * 9; roastRing.material.opacity = heat * 0.9;
      smoke.forEach((sm, k) => { const d = sm.userData, ph = (time * d.sp + d.ph) % 1; sm.position.set(d.x + Math.sin(time + k) * 0.1, 0.25 + ph * 2.2, d.z); sm.scale.setScalar(0.5 + ph * 1.1); sm.material.opacity = heat * 0.32 * Math.sin(ph * Math.PI); sm.visible = heat > 0.01; });
      for (let i = 0; i < NF; i++) {
        const sp = 0.32 + rnd(i) * 0.3, ph = (time * sp + rnd(i + 7)) % 1;
        const sx = (rnd(i + 3) - 0.5) * 8, sz = (rnd(i + 5) - 0.5) * 4, ex = (rnd(i + 8) - 0.5) * 1.2, ez = (rnd(i + 9) - 0.5) * 1.2;
        // beans grow in once they are below the header line, so none fall out from under the bar
        const by = 3.7 - 3.1 * ph * ph; dummy.position.set(sx + (ex - sx) * ph, by, sz + (ez - sz) * ph);
        dummy.rotation.set(time * 2 + i, time * 1.3 + i * 2, i);
        dummy.scale.setScalar(pour * (ph < 0.96 ? 1 : 0) * cl((2.55 - by) / 0.5)); dummy.updateMatrix(); fall.setMatrixAt(i, dummy.matrix);
      }
      fall.instanceMatrix.needsUpdate = true;
      const grind = ease(cl((p - 2) / 0.4)), shown = p > 1.05 ? NP : 0, pileS = ease(roastIn) * (1 - grind * 0.95);
      pileData.forEach((d, k) => { dummy.position.set(d.x, d.y * (1 - grind * 0.5), d.z); dummy.rotation.set(d.rx, d.ry, 0); dummy.scale.setScalar(k < shown ? pileS : 0); dummy.updateMatrix(); pile.setMatrixAt(k, dummy.matrix); });
      pile.instanceMatrix.needsUpdate = true;
      const gs = ease(cl((p - 2.05) / 0.35)) * (1 - ease(cl((p - 2.45) / 0.3)));
      ground.scale.set(gs, gs, gs); ground.visible = gs > 0.01; ground.position.y = 0.3 * gs;
      const cs = back(cl((p - 2.55) / 0.5)); cup.scale.setScalar(Math.max(0.0001, cs)); cup.visible = p > 2.55;
      // Turns a full 360 by itself (~11s per turn); a drag adds momentum on top
      const dt = Math.min(0.05, Math.max(0, time - (this._lt == null ? time : this._lt))); this._lt = time;
      if (!this.drag) { this.spin += this.spinV + dt * 0.57; this.spinV *= 0.94; }
      cup.rotation.y = (p - 3) * 0.08 + this.spin;
      // Hover / tap / arrows on the last step -> drain and refill with the next drink
      this.full = p > 4.85; this.now = time;
      if (this.wantSwap) { if (this.full && !this.swap) this.swap = { t0: time, dir: this.wantSwap.dir, to: this.wantSwap.to, done: false }; this.wantSwap = null; }
      if (this.full !== !!this.state.done) this.setState({ done: this.full });   // 'Order now' + drink switcher appear once the animation has finished
      let level = 1;
      if (this.swap) {
        const k = (time - this.swap.t0) / 1.5;
        if (k >= 0.45 && !this.swap.done) { this.swap.done = true; const n = DRINKS.length; const sw = this.swap; this.setState(s => ({ drink: sw.to != null ? sw.to : ((s.drink + sw.dir) % n + n) % n })); }
        level = k < 0.45 ? 1 - ease(k / 0.45) * 0.82 : 0.18 + ease(cl((k - 0.45) / 0.55)) * 0.82;
        if (k >= 1) { this.swap = null; level = 1; }
      }
      ice.forEach((m, i) => { const ti = ease(cl((t2 - 0.05 - i * 0.045) / 0.4)); const d = m.userData; m.scale.setScalar(d.s * cl(ti * 4)); m.position.set(d.x, d.y + (1 - ti) * 2.6 + Math.sin(time * 1.3 + i) * 0.012, d.z); m.rotation.set(d.r + (1 - ti) * 4, d.r * 0.7, d.r * 0.3); m.visible = ti > 0; });
      const ah = ease(t4) * 0.24 * level, mh = ease(t4) * 1.33 * level, eh = ease(t3) * 0.5 * level;
      setLiquid(ah, mh, eh, this.state.drink || 0);
      const surf = (0.05 + ah + mh + eh) * cs;
      const stream = (m, on, k) => { m.visible = on; if (!on) return; m.position.set(0, 3.4, 0); m.scale.set(1 + Math.sin(time * 30) * 0.08, Math.max(0.01, 3.4 - surf), 1); };
      stream(shot, p > 3.02 && p < 3.92, 0); stream(pourMilk, p > 4.02 && p < 4.9, 1);
      lid.position.y = 2.33 + (1 - ease(cl(t5 / 0.45))) * 3; lid.visible = t5 > 0.01;
      logoMat.opacity = ease(cl((p - 2.8) / 0.5));
      const ss = ease(cl((t5 - 0.25) / 0.4)); straw.visible = ss > 0.01; straw.position.y = 1.72 + (1 - ss) * 3.2;
      camX += (this.mx - camX) * 0.05; camY += (this.my - camY) * 0.05;
      const tgtY = 0.35 + ease(cl((p - 1.6) / 1)) * 0.85;
      const rad = 9.6 - ease(cl((p - 1.6) / 1)) * 0.6;
      const az = -0.45 + p * 0.07 + camX * 0.22, pol = 1.12 - camY * 0.1;
      const ox = this.wide ? -1.9 : 0;
      // desktop: a bit further back so the cup, pour and straw stay clear of the header bar
      const rw = this.wide ? 1.13 + Math.max(0, camera.aspect - 1.55) * 0.35 : 1, tw = this.wide ? 0.12 + Math.max(0, camera.aspect - 1.55) * 0.25 : 0;  // wider/shorter screens: pull back more
      // Phones (portrait): pull back and aim lower so the 3D object sits above the text
      const narrow = !this.wide && camera.aspect < 0.8, oy = narrow ? -1.95 : 0, rk = narrow ? 1.95 : 1;
      camera.position.set(ox + rad * rk * rw * Math.sin(pol) * Math.sin(az), tgtY + tw + oy + rad * rk * rw * Math.cos(pol), rad * rk * rw * Math.sin(pol) * Math.cos(az));
      camera.lookAt(ox, tgtY + tw + oy, 0);
      backdropTick(time, rad * rk * rw, az + 0.45 - p * 0.07, camY);
      renderer.render(scene, camera);
      this._raf = requestAnimationFrame(frame);
    };
    frame();
  }

  swapDrink(dir, to) { if (this.full && !this.swap && !(to != null && to === (this.state.drink || 0))) this.wantSwap = { dir: dir || 1, to }; }

  renderVals() {
    const step = this.state.step;
    return {
      trackRef: this.track, mountRef: this.mount, loading: this.state.loading,
      cur: STEPS[step], num: String(step + 1).padStart(2, '0'), counter: 'STEP ' + String(step + 1).padStart(2, '0') + ' / 05 — BY OUR BARISTAS',
      steps: STEPS.map((s, i) => ({ short: s.short, go: () => this.goTo(i),
        fill: { position: 'absolute', left: 0, top: 0, bottom: 0, background: '#e30a2e', width: (i < step ? 100 : i === step ? Math.round(this.state.pp * 100) : 0) + '%', transition: 'width .15s linear' },
        label: { fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: i === step ? '#fff' : '#8a8a8a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color .3s' } })),
      onOrder: () => this.props.onOrder && this.props.onOrder(), onMenu: () => this.props.onMenu && this.props.onMenu(),
      onVenue: () => this.props.onVenue && this.props.onVenue(), onDine: () => this.props.onDine && this.props.onDine(),
      showSpin: !!this.state.done && !this.state.loading, showOrder: !!this.state.done,
      showTeaser: !!this.state.done && !!this.props.teaser, teaser: this.props.teaser || '', teaserPick: this.props.teaserPick || '', onNext: () => this.props.onNext && this.props.onNext(), drinkName: DRINKS[this.state.drink || 0].name, drinkBlurb: DRINKS[this.state.drink || 0].blurb,
      noGL: !!this.state.noGL,
      fbStyle: (() => { const BD = window.StoryBackdrops; if (!BD) return {}; const key = BD.steps[Math.min(4, step)], P = (BD.locations[key] || {}).paint || { sky: ['#333', '#111'] }, mob = window.innerWidth < 768 ? '-mobile' : '';
        return { position: 'absolute', inset: 0, backgroundImage: 'url("' + BD.dir + key + '-far' + mob + '.webp"), linear-gradient(180deg,' + P.sky.join(',') + ')', backgroundSize: 'cover', backgroundPosition: 'center', transition: 'background-image .3s' }; })(),
      spinHint: this.canHover ? 'Hover the cup to change drink' : 'Tap the cup to change drink', locLabel: this.state.locLabel || '', hasLoc: !!this.state.locLabel,
      prevDrink: () => this.swapDrink(-1), nextDrink: () => this.swapDrink(1)
    };
  }
}
