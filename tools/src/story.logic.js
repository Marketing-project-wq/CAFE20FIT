
const ABOUT_VIDEO = 'https://media.20fit.id/wp-content/uploads/2026/11/1793607194111.publer.com_.mp4';
const STEPS = [
  { short: 'Select', title: 'Picked by hand', body: 'Our baristas sort and weigh specialty beans by hand, batch by batch, before anything is brewed.' },
  { short: 'Grind', title: 'Ground to order', body: 'Beans are ground fresh for each cup, so nothing sits around losing its aroma.' },
  { short: 'Extract', title: 'Pulled with care', body: 'Every shot is timed and tasted. If it is not right, our baristas pull it again.' },
  { short: 'Pour', title: 'Poured slowly', body: 'Milk and sweetness are measured and poured by hand, one cup at a time.' },
  { short: 'Finish', title: 'Checked, then yours', body: 'Sealed, checked by the barista and handed over, ready to fuel your day or your workout.' }
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
  { name: 'Signature Aren Latte', syrup: ['#2a1206', '#5c2c0f'], milk: ['#ecd9bd', '#cfa476'], streak: [104, 50, 16], cap: 0xdcbb92 },
  { name: 'Matcha Latte', syrup: ['#2c4510', '#61852c'], milk: ['#f0f3e2', '#c3d29a'], streak: [80, 116, 36], cap: 0xe4ead0 },
  { name: 'Strawberry Latte', syrup: ['#6a0a1e', '#c4264b'], milk: ['#f8e9eb', '#efc0c9'], streak: [186, 36, 66], cap: 0xf4dade },
  { name: 'Choco Overload', syrup: ['#1d0c05', '#40200f'], milk: ['#b48460', '#83533a'], streak: [48, 22, 10], cap: 0x9a6b48 },
  { name: 'Tropical Recovery', syrup: ['#e9e6df', '#f6f4ef'], milk: ['#fdfcf9', '#efebe3'], streak: [222, 216, 204], cap: 0xffffff }
];
const hexRgb = h => h[0] === '#' ? [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)) : h.match(/\d+/g).slice(0, 3).map(Number); // '#rrggbb' or 'rgb(r,g,b)'
const mixHex = (a, b, k) => { const A = hexRgb(a), B = hexRgb(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',') + ')'; };

class Component extends DCLogic {
  state = { step: 0, pp: 0, loading: true, drink: 0 };
  track = React.createRef();
  mount = React.createRef();
  vid = React.createRef();

  // About-section video = the site's background music. It starts muted (browsers block sound until the visitor
  // interacts), turns its sound on at the first tap/click/key, keeps playing while the visitor scrolls, and pauses
  // only while the menu / order / checkout / history is open (mediaHold) or the tab is hidden.
  vidLive() { return !this.props.mediaHold && document.visibilityState === 'visible'; }
  ctlVid() {
    const v = this.vid.current; if (!v) return;
    if (!v.loop) { v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.addEventListener('ended', () => { if (this.vidLive()) { v.currentTime = 0; v.play().catch(() => {}); } }); }
    v.muted = !this.state.sound;
    if (this.vidLive()) { if (v.paused) v.play().catch(() => { if (!v.muted) { v.muted = true; this.setState({ sound: false }); v.play().catch(() => {}); } }); }
    else if (!v.paused) v.pause();
  }
  componentDidUpdate() { const hold = !!this.props.mediaHold; if (hold !== this._hold) { this._hold = hold; this.ctlVid(); } }
  setupVid() {
    const EVS = ['pointerdown', 'pointerup', 'keydown', 'touchend', 'click'];
    const stop = () => EVS.forEach(ev => window.removeEventListener(ev, this._unmute, true));
    this._unmute = e => {
      if (e && e.target && e.target.closest && e.target.closest('[data-snd]')) return;
      if (this.state.userMuted || this.state.sound) return stop();
      const v = this.vid.current; if (!v || this._unmuting || !this.vidLive()) return;
      this._unmuting = true; v.muted = false;
      v.play().then(() => { this._unmuting = false; stop(); this.setState({ sound: true }, () => this.ctlVid()); })
        .catch(() => { this._unmuting = false; v.muted = true; v.play().catch(() => {}); });
    };
    EVS.forEach(ev => window.addEventListener(ev, this._unmute, { capture: true, passive: true }));
    this._vVis = () => this.ctlVid(); document.addEventListener('visibilitychange', this._vVis);
    this._stopUnmute = stop;
    this._hold = !!this.props.mediaHold;
    // watchdog: if the video ever ends up paused while it should play (or the other way round), fix it
    this._vWatch = setInterval(() => { const v = this.vid.current; if (v && v.paused === this.vidLive()) this.ctlVid(); }, 1000);
    this.ctlVid();
  }

  componentDidMount() {
    this.p = 0; this.mx = 0; this.my = 0;
    this._scroll = () => {
      const el = this.track.current; if (!el) return;
      const r = el.getBoundingClientRect(), total = el.offsetHeight - window.innerHeight;
      const d = cl(-r.top / Math.max(1, total * 0.86)) * 5; this.p = toP(d);  // last 14% of the track holds the finished drink
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
    this.setupVid();
    this.init().catch(e => console.error(e));
  }
  componentWillUnmount() {
    clearInterval(this._vWatch); if (this._stopUnmute) this._stopUnmute(); document.removeEventListener('visibilitychange', this._vVis);
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
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
    cvs.addEventListener('pointerleave', () => { this.hoverCup = false; });
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

    scene.add(new THREE.HemisphereLight(0xffffff, 0xe6e7ec, 0.95));
    scene.fog = new THREE.Fog(0xf1f2f5, 11, 26);  // the floor fades into the white backdrop
    const key = new THREE.DirectionalLight(0xfff4ea, 2.4); key.position.set(3, 7, 4); key.castShadow = true;
    key.shadow.mapSize.set(this.phone ? 512 : 1024, this.phone ? 512 : 1024); Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 }); key.shadow.bias = -0.0004; key.shadow.radius = 6;
    scene.add(key);
    const rim = new THREE.PointLight(0xe30a2e, 26, 14); rim.position.set(-3.5, 3, -2.5); scene.add(rim);
    const backLight = new THREE.DirectionalLight(0xffffff, 1.6); backLight.position.set(1.5, 4, -6); scene.add(backLight); // rim highlight on the cup edges
    const fill = new THREE.PointLight(0xffe2c4, 14, 9); fill.position.set(2.6, 1.6, 3.2); scene.add(fill); // warm fill so the latte glows

    const tableTex = this.canvasTex(THREE, 1024, 1024, (x, w, h) => { x.fillStyle = '#1c1717'; x.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { x.fillStyle = `rgba(255,255,255,${0.05 + rnd(i) * 0.5})`; const s = 0.6 + rnd(i + 9) * 1.6; x.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, s, s); } x.strokeStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 18; i++) { x.beginPath(); x.moveTo(rnd(i + 40) * w, rnd(i + 50) * h); x.bezierCurveTo(rnd(i + 60) * w, rnd(i + 70) * h, rnd(i + 80) * w, rnd(i + 90) * h, rnd(i + 99) * w, rnd(i + 33) * h); x.stroke(); } });
    const table = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.3, 128), [new THREE.MeshStandardMaterial({ color: 0x141111, roughness: 0.8 }), new THREE.MeshStandardMaterial({ map: tableTex, roughness: 0.7 }), new THREE.MeshStandardMaterial({ color: 0x141111 })]);
    table.visible = false;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.62, 0.5, 96), new THREE.MeshPhysicalMaterial({ color: 0xf7f7f9, roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12 })); ped.position.y = -0.25; ped.receiveShadow = true; ped.castShadow = true; scene.add(ped);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.56, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: 0xe30a2e })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.001; scene.add(ring);
    // neon base ring + soft red glow on the floor around the pedestal
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.63, 0.016, 8, 160), new THREE.MeshBasicMaterial({ color: 0xff2a48 })); ring2.rotation.x = Math.PI / 2; ring2.position.y = -0.49; scene.add(ring2);
    const haloTex = this.canvasTex(THREE, 256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(227,10,46,.38)'); gr.addColorStop(0.45, 'rgba(227,10,46,.12)'); gr.addColorStop(1, 'rgba(227,10,46,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 6.4), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false })); halo.rotation.x = -Math.PI / 2; halo.position.y = -0.493; scene.add(halo);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0xf2f3f6, roughness: 0.55 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.5; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(60, 120, 0xc3c6cf, 0xc3c6cf); grid.material.transparent = true; grid.material.opacity = 0.3; grid.position.y = -0.495; scene.add(grid);

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

    // Floating ingredients drifting around the studio: beans, ice, milk drops, matcha leaves, strawberries, palm sugar.
    // Kept clear of the cup/pedestal and the camera's line of sight; no shadows, so they cost almost nothing.
    const roundBox = sz => { const gm = new THREE.BoxGeometry(sz, sz, sz, 3, 3, 3), pa = gm.attributes.position, v = new THREE.Vector3(); for (let k = 0; k < pa.count; k++) { v.fromBufferAttribute(pa, k); v.lerp(v.clone().normalize().multiplyScalar(sz * 0.62), 0.3); pa.setXYZ(k, v.x, v.y, v.z); } gm.computeVertexNormals(); return gm; };
    const leafGeo = new THREE.SphereGeometry(0.24, 18, 10); leafGeo.scale(1, 0.1, 0.46);
    const dropGeo = new THREE.SphereGeometry(0.12, 20, 14); dropGeo.scale(1, 1.22, 1);
    const berryGeo = new THREE.SphereGeometry(0.17, 20, 14); { const pa = berryGeo.attributes.position, v = new THREE.Vector3(); for (let k = 0; k < pa.count; k++) { v.fromBufferAttribute(pa, k); const t = (v.y / 0.17 + 1) / 2; v.x *= 0.5 + 0.5 * t; v.z *= 0.5 + 0.5 * t; v.y *= 1.15; pa.setXYZ(k, v.x, v.y, v.z); } berryGeo.computeVertexNormals(); }
    const kinds = [
      { geo: beanGeo, mat: beanMat, n: 14, s: 1.15, brown: true },
      { geo: iceGeo, mat: iceMat, n: 8, s: 0.6 },
      { geo: dropGeo, mat: new THREE.MeshPhysicalMaterial({ color: 0xf8f2e7, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1 }), n: 10, s: 1 },
      { geo: leafGeo, mat: new THREE.MeshStandardMaterial({ color: 0x6f9d2f, roughness: 0.5, side: THREE.DoubleSide }), n: 8, s: 1 },
      { geo: berryGeo, mat: new THREE.MeshPhysicalMaterial({ color: 0xd61f3c, roughness: 0.32, clearcoat: 0.7 }), n: 6, s: 1 },
      { geo: roundBox(0.2), mat: new THREE.MeshStandardMaterial({ color: 0x9c6129, roughness: 0.85 }), n: 6, s: 1 }
    ];
    const ingr = kinds.map((k, ki) => {
      const n = this.phone ? Math.ceil(k.n / 2) : k.n, m = new THREE.InstancedMesh(k.geo, k.mat, n), items = [];
      for (let q = 0, tries = 0; q < n && tries < 400; tries++) {
        const sd = ki * 97 + tries * 7.3, x = (rnd(sd) - 0.5) * 14, z = -6 + rnd(sd + 1) * 7.5, y = -0.2 + rnd(sd + 2) * 4.8;
        if (Math.hypot(x, z) < 2.7 || (z > -1 && Math.abs(x) < 2.2)) continue;   // keep the cup and its front clear
        if (x < -3 && y < 3.4) continue;                                           // and the heading / text area (lower left)
        items.push({ x, y, z, ph: rnd(sd + 3) * 6.28, sp: 0.35 + rnd(sd + 4) * 0.45, rx: rnd(sd + 5) * 6, ry: rnd(sd + 6) * 6, rs: (rnd(sd + 7) - 0.5) * 0.8, sc: k.s * (0.8 + rnd(sd + 8) * 0.5) }); q++;
      }
      m.count = items.length;
      if (k.brown) { const c = new THREE.Color(); items.forEach((_, q) => m.setColorAt(q, c.set(['#4a2614', '#5a321b', '#683b21', '#73452a'][q % 4]))); m.instanceColor.needsUpdate = true; }
      scene.add(m); return { m, items };
    });
    const ingrTick = time => {
      const show = ease(cl(time / 1.6));   // drift in after load
      ingr.forEach(({ m, items }) => {
        items.forEach((it, q) => {
          dummy.position.set(it.x + Math.sin(time * it.sp * 0.6 + it.ph) * 0.18, it.y + Math.sin(time * it.sp + it.ph) * 0.28, it.z + Math.cos(time * it.sp * 0.5 + it.ph) * 0.14);
          dummy.rotation.set(it.rx + time * it.rs, it.ry + time * it.rs * 0.7, it.rx * 0.5);
          dummy.scale.setScalar(it.sc * show); dummy.updateMatrix(); m.setMatrixAt(q, dummy.matrix);
        });
        m.instanceMatrix.needsUpdate = true;
      });
    };

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
      const t = i => cl(p - i), t0 = t(0), t1 = t(1), t2 = t(2), t3 = t(3), t4 = t(4), t5 = t(5);
      const pour = 1 - cl((p - 0.85) / 0.25);
      for (let i = 0; i < NF; i++) {
        const sp = 0.32 + rnd(i) * 0.3, ph = (time * sp + rnd(i + 7)) % 1;
        const sx = (rnd(i + 3) - 0.5) * 8, sz = (rnd(i + 5) - 0.5) * 4, ex = (rnd(i + 8) - 0.5) * 1.2, ez = (rnd(i + 9) - 0.5) * 1.2;
        // beans grow in once they are below the header line, so none fall out from under the bar
        const by = 3.7 - 3.1 * ph * ph; dummy.position.set(sx + (ex - sx) * ph, by, sz + (ez - sz) * ph);
        dummy.rotation.set(time * 2 + i, time * 1.3 + i * 2, i);
        dummy.scale.setScalar(pour * (ph < 0.96 ? 1 : 0) * cl((2.55 - by) / 0.5)); dummy.updateMatrix(); fall.setMatrixAt(i, dummy.matrix);
      }
      fall.instanceMatrix.needsUpdate = true;
      const shown = NP * ease(cl(t0 * 1.15)), pileS = 1 - ease(t1) * 0.95;
      pileData.forEach((d, k) => { dummy.position.set(d.x, d.y * (1 - t1 * 0.5), d.z); dummy.rotation.set(d.rx, d.ry, 0); dummy.scale.setScalar(k < shown ? pileS : 0); dummy.updateMatrix(); pile.setMatrixAt(k, dummy.matrix); });
      pile.instanceMatrix.needsUpdate = true;
      const gs = ease(cl((t1 - 0.2) / 0.8)) * (1 - ease(cl((p - 2) / 0.45)));
      ground.scale.set(gs, gs, gs); ground.visible = gs > 0.01; ground.position.y = 0.3 * gs;
      const cs = back(cl((p - 2.05) / 0.5)); cup.scale.setScalar(Math.max(0.0001, cs)); cup.visible = p > 2.05;
      // Turns a full 360 by itself (~11s per turn); a drag adds momentum on top
      const dt = Math.min(0.05, Math.max(0, time - (this._lt == null ? time : this._lt))); this._lt = time;
      if (!this.drag) { this.spin += this.spinV + dt * 0.57; this.spinV *= 0.94; }
      cup.rotation.y = (p - 3) * 0.08 + this.spin;
      // Hover / tap / arrows on the last step -> drain and refill with the next drink
      this.full = p > 4.85; this.now = time;
      if (this.wantSwap) { if (this.full && !this.swap) this.swap = { t0: time, dir: this.wantSwap, done: false }; this.wantSwap = 0; }
      let level = 1;
      if (this.swap) {
        const k = (time - this.swap.t0) / 1.5;
        if (k >= 0.45 && !this.swap.done) { this.swap.done = true; const n = DRINKS.length; this.setState(s => ({ drink: ((s.drink + this.swap.dir) % n + n) % n })); }
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
      logoMat.opacity = ease(cl((p - 2.3) / 0.5));
      const ss = ease(cl((t5 - 0.25) / 0.4)); straw.visible = ss > 0.01; straw.position.y = 1.72 + (1 - ss) * 3.2;
      ingrTick(time);
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
      { const cd = rad * rk * rw; scene.fog.near = cd + 2.5; scene.fog.far = cd + 17; }  // fog only on the far floor, whatever the camera distance (phones sit further back)
      renderer.render(scene, camera);
      this._raf = requestAnimationFrame(frame);
    };
    frame();
  }

  swapDrink(dir) { if (this.full && !this.swap) this.wantSwap = dir; }

  renderVals() {
    const step = this.state.step;
    return {
      trackRef: this.track, mountRef: this.mount, loading: this.state.loading,
      cur: STEPS[step], num: String(step + 1).padStart(2, '0'), counter: 'STEP ' + String(step + 1).padStart(2, '0') + ' / 05 — BY OUR BARISTAS',
      steps: STEPS.map((s, i) => ({ short: s.short, go: () => this.goTo(i),
        fill: { position: 'absolute', left: 0, top: 0, bottom: 0, background: '#e30a2e', width: (i < step ? 100 : i === step ? Math.round(this.state.pp * 100) : 0) + '%', transition: 'width .15s linear' },
        label: { fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: i === step ? '#0d0d0d' : '#9a9a9a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color .3s' } })),
      onOrder: () => this.props.onOrder && this.props.onOrder(), onMenu: () => this.props.onMenu && this.props.onMenu(),
      onVenue: () => this.props.onVenue && this.props.onVenue(), onDine: () => this.props.onDine && this.props.onDine(),
      vidRef: this.vid, vidSrc: ABOUT_VIDEO,
      soundOn: !!this.state.sound, soundLabel: this.state.sound ? '🔊 Mute' : '🔇 Sound on',
      showMusic: !!this.state.sound && !this.props.mediaHold,
      toggleSound: e => { if (e && e.stopPropagation) e.stopPropagation(); const v = this.vid.current; if (!v) return; const on = !this.state.sound; v.muted = !on; if (on && this.vidLive()) v.play().catch(() => {}); this.setState({ sound: on, userMuted: !on }); },
      showSpin: step === 4 && !this.state.loading, drinkName: DRINKS[this.state.drink || 0].name,
      spinHint: this.canHover ? 'Hover the cup to change drink' : 'Tap the cup to change drink',
      prevDrink: () => this.swapDrink(-1), nextDrink: () => this.swapDrink(1)
    };
  }
}
