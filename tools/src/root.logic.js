
const U = n => (window.__resources && window.__resources['img_' + n]) || ('src/' + n + '.jpg');
// Product photos from the design, matched to POS menu items by name (+ category for duplicates).
const PHOTOS = {
  'chia pudding': [U('DSC3733'), U('DSC3737-1')], 'signature aren': [U('20Fit-Signature-Aren-1')], 'choco overload|coffee': [U('Choco-overload')],
  'coffee 1': [U('DSC3568')], 'cloud coffee': [U('Cloud-Coffee')], 'honey berry americano': [U('Honey-Berry-Americano')], 'oat honey macchiato': [U('Oat-honey-macchiato')],
  'orange americano': [U('Orange-Americano')], 'shakerato': [U('Shakerato')], 'strawberry americano': [U('Strawberry-Americano')], 'strawberry latte': [U('Strawberry-Latte')],
  'hybrid nutrition': [U('Hybrid-Nutrition')], 'almond endurance': [U('Almond-Endurance')], 'choco overload|nutrition': [U('Choco-Overload-1')], 'choco overload': [U('Choco-Overload-1')],
  'coconut hydrate': [U('Coconut-Hydrate')], 'protein brew': [U('Protein-Brew')], 'tropical recovery': [U('Tropical-Recovery')],
  // POS names that differ from the design names
  '20fit signature aren latte': [U('20Fit-Signature-Aren-1')], 'honey oat macchiato': [U('Oat-honey-macchiato')], 'choco overload|hybrid': [U('Choco-Overload-1')],
  'chia pudding|smoothies bowl': [U('DSC3733'), U('DSC3737-1')]
};
const NO_PHOTO = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#e8e6e1"/><text x="200" y="262" text-anchor="middle" font-family="Arial" font-size="28" fill="#9a978f">20FIT CAFE</text></svg>');
const photosFor = it => { const n = String(it.name || '').toLowerCase(), c = String(it.category || '').toLowerCase(); return PHOTOS[n + '|' + c] || PHOTOS[n] || (it.image_url ? [it.image_url] : [NO_PHOTO]); };
// Server menu item -> view model used by this page and the checkout
const toItem = it => ({ id: it.id, name: it.name, cat: it.category, price: Number(it.price_display) || 0, base: Number(it.price) || 0, description: it.description || '', available: it.available !== false, addons: it.addons || [], imgs: photosFor(it) });
const defaultOpts = m => (m.addons || []).map(g => { const d = (g.options || []).find(o => o.default) || null; return d ? d.id : null; }).filter(Boolean);
const lineKey = (id, opts) => id + (opts && opts.length ? '~' + opts.slice().sort().join(',') : '');
const optsPrice = (m, opts) => (m.addons || []).reduce((a, g) => a + (g.options || []).filter(o => opts.includes(o.id)).reduce((b, o) => b + (Number(o.price) || 0), 0), 0);
const optsLabel = (m, opts) => (m.addons || []).map(g => { const o = (g.options || []).find(x => opts.includes(x.id)); return o && !o.default ? o.label : null; }).filter(Boolean).join(' · ');
const NEED_NAMES = [['Fresh', 'coconut hydrate'], ['Fueling', '20fit signature aren latte'], ['Light energy', 'tropical recovery']];
const IG_DEFAULT = 'https://www.instagram.com/reel/DZMf2F3y_6X/';
const IG_POSTS = ['p/DcTitnFEhQo', 'p/DeG5fVWyR1C', 'p/DY1wzVJSFAU'];
const IG_CROP = { p: { left: '-2px', top: '-55px', width: 'calc(100% + 4px)', height: 'calc(100% + 55px + 480px)' }, reel: { left: '-21.1%', top: 'calc(-58px - 21.2%)', width: '142.2%', height: 'calc(160% + 58px + 480px)' } };
const IG_MS = 7000;
const igId = u => { const m = /instagram\.com\/(p|reel|reels|tv)\/([\w-]+)/.exec(u || ''); return m ? (m[1] === 'reels' ? 'reel' : m[1]) + '/' + m[2] : ''; };
const rp = n => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID');
const API = () => window.CafeApi;
const isCut = src => /^data:|\.png($|\?)/i.test(src);

class Component extends DCLogic {
  vid = React.createRef();
  state = { igI: 0, igHold: true, hy: 0, hx: 0, hyM: 0, hon: false, need: 1, heroIn: false, sound: false, tab: 'All', sel: null, cart: {}, checkout: false, full: false, hist: false,
    menu: null, menuErr: '', refs: [], hList: null, hErr: '', hLoading: false, hOpen: {}, hFlash: {}, hDot: false, rates: {}, findCode: '', findPhone: '', findMsg: '', findBusy: false, toast: null, pick: {} };
  rail = React.createRef();
  // ---- menu (from POS via cafe_get_web_menu) ----
  loadMenu() {
    this.setState({ menuErr: '' });
    API().getMenu().then(res => this.setState({ menu: (res.items || []).map(toItem) })).catch(e => this.setState({ menuErr: e.message || 'Menu unavailable' }));
  }
  menuAll() { return this.state.menu || []; }
  byId(id) { return this.menuAll().find(x => x.id === id); }
  byName(n) { return this.menuAll().find(x => x.name.toLowerCase() === n) || null; }
  price(m) { return m ? m.price : 0; }
  // cart: { [lineKey]: { id, opts, qty } }
  add(id, opts) {
    const m = this.byId(id); if (!m || !m.available) return;
    const o = opts || defaultOpts(m), k = lineKey(id, o);
    this.setState(s => ({ cart: { ...s.cart, [k]: { id, opts: o, qty: ((s.cart[k] || {}).qty || 0) + 1 } } }));
  }
  qtyOf(id) { return Object.values(this.state.cart).filter(l => l.id === id).reduce((a, l) => a + l.qty, 0); }
  selOpts(m) { const p = this.state.pick[m.id]; return p || defaultOpts(m); }
  pickOpt(m, g, optId) { const cur = this.selOpts(m).filter(id => !(g.options || []).some(o => o.id === id)); this.setState(s => ({ pick: { ...s.pick, [m.id]: cur.concat([optId]) } })); }
  // ---- purchase history (cafe_get_my_orders) ----
  refreshHist(first) {
    const refs = API().getRefs(); this.setState({ refs });
    if (!refs.length) { this.setState({ hList: [], hErr: '', hLoading: false, hDot: false }); this.syncWatch([]); return; }
    if (first) this.setState({ hLoading: true });
    API().getMyOrders().then(list => {
      const prev = this.state.hList || [];
      const flash = {};
      list.forEach(o => {
        const p = prev.find(x => x.code === o.code);
        if (p && p.status !== o.status) {
          flash[o.code] = Date.now();
          if (o.status === 'ready') this.showToast('Your order ' + o.code + ' is ready for pickup');
          if (o.status === 'checked_in') this.showToast('Checked in · ' + o.code + (o.checked_in_by ? ' · by ' + o.checked_in_by : ''));
        }
      });
      if (this.state.hist) API().markSeen(list);
      this.setState(s => ({ hList: list, hErr: '', hLoading: false, hFlash: { ...s.hFlash, ...flash }, hDot: !s.hist && API().hasUnseen(list) }));
      this.syncWatch(list);
    }).catch(e => this.setState({ hErr: e.message || 'error', hLoading: false }));
  }
  // realtime per open order (max 20 newest); unsubscribe when closed
  syncWatch(list) {
    this._w = this._w || {};
    const want = {};
    list.filter(o => o.is_open).slice(0, 20).forEach(o => { const t = API().tokenFor(o.code); if (t) want[t] = true; });
    Object.keys(this._w).forEach(t => { if (!want[t]) { this._w[t](); delete this._w[t]; } });
    Object.keys(want).forEach(t => { if (!this._w[t]) this._w[t] = API().watch(t, () => this.queueRefresh()); });
  }
  queueRefresh() { clearTimeout(this._rq); this._rq = setTimeout(() => this.refreshHist(false), 300); }
  showToast(text) { clearTimeout(this._tt); this.setState({ toast: text }); this._tt = setTimeout(() => this.setState({ toast: null }), 6000); }
  openHist() { this.setState({ hist: true, full: false, sel: null, hDot: false }); this.refreshHist(!this.state.hList); }
  rateOrder(o, key, n) {
    const r = { ...(this.state.rates[o.code] || { food: o.rating_food || 0, service: o.rating_service || 0, comment: o.rating_comment || '' }), [key]: n };
    this.setState(s => ({ rates: { ...s.rates, [o.code]: { ...r, saved: false, err: '' } } }));
    if (r.food && r.service) API().rate(o.code, r.food, r.service, r.comment).then(() => this.setState(s => ({ rates: { ...s.rates, [o.code]: { ...r, saved: true } } }))).catch(e => this.setState(s => ({ rates: { ...s.rates, [o.code]: { ...r, err: e.message } } })));
  }
  imAtCafe(o) { API().arrived(o.code).then(() => this.refreshHist(false)).catch(e => this.showToast(e.message)); }
  findOrder() {
    this.setState({ findBusy: true, findMsg: '' });
    API().findOrder(this.state.findCode, this.state.findPhone).then(res => {
      if (res && res.error) { this.setState({ findBusy: false, findMsg: res.error }); return; }
      this.setState({ findBusy: false, findCode: '', findPhone: '', findMsg: 'Order added' }); this.refreshHist(false);
    }).catch(e => this.setState({ findBusy: false, findMsg: e.message }));
  }
  scrollRail(d) { const r = this.rail.current; if (r) r.scrollBy({ left: d * Math.min(r.clientWidth * 0.8, 600), behavior: 'smooth' }); }

  imgStyle(src, fit) {
    const s = { width: '100%', height: '100%', objectFit: fit, display: 'block', pointerEvents: 'none', userSelect: 'none' };
    if (isCut(src)) { s.objectFit = 'contain'; s.filter = 'drop-shadow(0 24px 30px rgba(13,13,13,.22))'; }
    else { s.objectFit = 'cover'; s.borderRadius = fit === 'contain' ? 28 : 20; if (fit === 'contain') s.boxShadow = '0 24px 50px rgba(13,13,13,.18)'; }
    return s;
  }
  list() { return this.menuAll().filter(m => this.state.tab === 'All' || m.cat === this.state.tab); }
  step(d) { const l = this.list(); if (!l.length) return; const i = l.findIndex(m => m.id === this.state.sel); this.setState({ sel: l[(i + d + l.length) % l.length].id }); }
  scrollMenu(tab) { if (tab) this.setState({ tab }); const el = document.getElementById('menu'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' }); }

  src(u) { const n = u.split('/').pop().replace('-scaled.jpg', ''); return (this.state.cut || {})[n] || u; }
  heroSrc() { return this.props.heroVideo || ''; }
  syncVid() {
    const v = this.vid.current, s = this.heroSrc(); if (!v || !s) return;
    if (v.getAttribute('src') !== s) { v.src = s; v.loop = true; v.playsInline = true; v.muted = !this.state.sound; }
    if (v !== this._vEl) { this._vEl = v; if (this._io) this._io.disconnect(); this._io = new IntersectionObserver(es => { this.vidSeen = es[es.length - 1].intersectionRatio >= 0.25; this.ctlVid(); }, { threshold: [0, 0.25, 0.6] }); this._io.observe(v); }
    this.ctlVid();
  }
  // The hero video only plays while it is on screen and nothing (menu, order, checkout, history) covers it,
  // so its music never runs underneath the ordering flow or while scrolling through the menu.
  vidLive() { const st = this.state; return !!this.vidSeen && !st.checkout && !st.full && !st.hist && !st.sel && document.visibilityState === 'visible'; }
  ctlVid() { const v = this.vid.current; if (!v) return; v.muted = !this.state.sound; if (this.vidLive()) { if (v.paused) v.play().catch(() => { if (!v.muted) { v.muted = true; this.setState({ sound: false }); v.play().catch(() => {}); } }); } else if (!v.paused) v.pause(); }
  componentDidUpdate() { this.syncVid(); }
  componentDidMount() {
    this.loadMenu();
    this.refreshHist(false);
    this._offRefs = API().on('refs', () => this.refreshHist(false));
    this._poll = setInterval(() => { if (API().getRefs().length && (this.state.hist || (this.state.hList || []).some(o => o.is_open))) this.refreshHist(false); }, 20000);
    this._focus = () => { if (document.visibilityState === 'visible') this.refreshHist(false); };
    document.addEventListener('visibilitychange', this._focus); window.addEventListener('focus', this._focus);
    this._ig = setInterval(() => { this.setState(s => ({ igI: ((s.igI || 0) + 1) % IG_POSTS.length, igHold: true }), () => requestAnimationFrame(() => this.setState({ igHold: false }))); }, IG_MS);
    requestAnimationFrame(() => this.setState({ igHold: false }));
    this.syncVid();
    // Browsers only allow sound after a real tap/click/key, so the video starts muted and turns its sound on at
    // the visitor's first interaction (unless they pressed Mute). Scrolling is not an interaction, so keep listening.
    const UNMUTE_EVS = ['pointerdown', 'pointerup', 'keydown', 'touchend', 'click'];
    const stopUnmute = () => UNMUTE_EVS.forEach(ev => window.removeEventListener(ev, this._unmute, true));
    this._unmute = e => {
      if (e && e.target && e.target.closest && e.target.closest('[aria-label="Toggle sound"]')) return;
      const v = this.vid.current; if (this.state.userMuted || this.state.sound) return stopUnmute(); if (!v || this._unmuting) return;
      this._unmuting = true; v.muted = false;
      v.play().then(() => { this._unmuting = false; stopUnmute(); this.setState({ sound: true }, () => this.ctlVid()); }).catch(() => { this._unmuting = false; v.muted = true; if (this.vidLive()) v.play().catch(() => {}); });
    };
    UNMUTE_EVS.forEach(ev => window.addEventListener(ev, this._unmute, { capture: true, passive: true }));
    this._vVis = () => this.ctlVid(); document.addEventListener('visibilitychange', this._vVis);
    this._hs = () => { const y = Math.min(window.scrollY, 1200); if (Math.abs(y - this.state.hy) > 2) this.setState({ hy: y }); }; window.addEventListener('scroll', this._hs, { passive: true }); setTimeout(() => this.setState({ heroIn: true }), 120);
    
    this._key = e => { if (!this.state.sel) return; if (e.key === 'Escape') this.setState({ sel: null }); if (e.key === 'ArrowRight') this.step(1); if (e.key === 'ArrowLeft') this.step(-1); };
    window.addEventListener('keydown', this._key);
    const loop = () => {
      const t = performance.now() / 1000;
      document.querySelectorAll('[data-spin]').forEach(el => {
        const s = el._s || (el._s = { rot: 0, drag: false });
        if (!s.drag) s.rot += (Math.sin(t * 0.7) * (this.props.idleSwing ?? 35) - s.rot) * 0.04;
        const r = Math.max(-90, Math.min(90, s.rot));
        const card = el.querySelector('[data-card]'); if (card) card.style.transform = `translateX(${r / 90 * 14}%) rotate(${r / 90 * 4}deg)`;
        const v = el.querySelectorAll('[data-view]');
        if (v.length > 1) { const b = Math.max(0, Math.min(1, (r + 15) / 30)); v[0].style.opacity = 1 - b; v[1].style.opacity = b; }
        const sh = el.querySelector('[data-shadow]'); if (sh) sh.style.transform = `translateX(-50%) scaleX(${1 - Math.abs(r) / 90 * 0.45})`;
      });
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }
  componentWillUnmount() { if (this._io) this._io.disconnect(); document.removeEventListener('visibilitychange', this._vVis); ['pointerdown', 'pointerup', 'keydown', 'touchend', 'click'].forEach(ev => window.removeEventListener(ev, this._unmute, true)); clearInterval(this._ig); clearInterval(this._poll); this._offRefs && this._offRefs(); document.removeEventListener('visibilitychange', this._focus); window.removeEventListener('focus', this._focus); Object.values(this._w || {}).forEach(f => f()); ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(ev => window.removeEventListener(ev, this._unmute)); window.removeEventListener('scroll', this._hs); window.removeEventListener('keydown', this._key); cancelAnimationFrame(this._raf); }

  viewer(m, key) {
    const h = React.createElement;
    const down = e => {
      const el = e.currentTarget; const s = el._s || (el._s = { rot: 0 });
      s.drag = true; const x0 = e.clientX, r0 = s.rot; el.setPointerCapture(e.pointerId);
      const mv = ev => { s.rot = Math.max(-90, Math.min(90, r0 + (ev.clientX - x0) * 0.6)); };
      const up = () => { s.drag = false; el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
      el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    };
    return h('div', { key: key + m.id, 'data-spin': m.cat === 'Food' ? 'slide' : '', onPointerDown: down, style: { position: 'absolute', inset: 0, perspective: 1100, cursor: 'grab', touchAction: 'pan-y', animation: key === 'pop' ? 'pPop .65s cubic-bezier(.2,.8,.2,1) both' : 'none' } },
      h('div', { style: { position: 'absolute', left: '8%', right: '8%', bottom: '2%', aspectRatio: '1', borderRadius: '50%', background: 'rgba(255,255,255,.4)', backdropFilter: 'blur(20px) saturate(170%)', WebkitBackdropFilter: 'blur(20px) saturate(170%)', border: '1px solid rgba(255,255,255,.9)', boxShadow: 'inset 0 1px 0 #fff, inset 0 -20px 40px rgba(227,10,46,.08), 0 30px 60px rgba(13,13,13,.1)' } }),
      h('div', { 'data-shadow': '', style: { position: 'absolute', left: '50%', bottom: '6%', width: '52%', height: '5%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(13,13,13,.35), transparent)' } }),
      h('div', { style: { position: 'absolute', inset: '0 0 8% 0', animation: 'pBob 4s ease-in-out infinite' } },
        h('div', { 'data-card': '', style: { position: 'absolute', inset: 0, transformStyle: 'preserve-3d', willChange: 'transform' } },
          m.imgs.map(u => this.src(u)).map((src, i) => h('img', { key: i, 'data-view': '', src, alt: m.name, draggable: false, style: { ...this.imgStyle(src, 'contain'), position: 'absolute', inset: 0, opacity: i ? 0 : 1 } }))
        )
      )
    );
  }

  addStyle(ok, small) {
    return small
      ? { all: 'unset', cursor: ok ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', padding: '8px 14px', borderRadius: 999, background: ok ? '#0d0d0d' : '#c9c7c2', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: '.04em', textTransform: 'uppercase' }
      : { all: 'unset', cursor: ok ? 'pointer' : 'not-allowed', boxSizing: 'border-box', textAlign: 'center', padding: 12, borderRadius: 999, background: ok ? '#0d0d0d' : '#c9c7c2', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: '.04em', textTransform: 'uppercase' };
  }
  histCard(o, active) {
    const A = API(), st = A.status(o), open = !!this.state.hOpen[o.code], venue = o.kind === 'venue';
    const r = this.state.rates[o.code] || { food: o.rating_food || 0, service: o.rating_service || 0, comment: o.rating_comment || '' };
    const paid = !venue && o.payment_status === 'paid';
    const stars = key => [1, 2, 3, 4, 5].map(n => ({ pick: () => this.rateOrder(o, key, n), style: { all: 'unset', cursor: 'pointer', fontSize: 20, lineHeight: 1, color: n <= (r[key] || 0) ? '#e30a2e' : 'rgba(13,13,13,.18)' } }));
    const flash = this.state.hFlash[o.code] && Date.now() - this.state.hFlash[o.code] < 2000;
    const price = venue ? [] : [['Subtotal', o.subtotal], ['Service', o.service_charge], ['PB1', o.ppn], ['Delivery', o.delivery_fee]].filter(([k, v]) => k === 'Subtotal' || Number(v) > 0).map(([k, v]) => ({ k, v: rp(v) }));
    return {
      code: o.code, kind: venue ? 'Venue' : A.KIND[o.type], dateFmt: A.dateTime(o.created_at), pill: st.pill, pillStyle: A.pillStyle(st), sub: st.sub, hasSub: !!st.sub,
      summary: venue ? (o.package === 'with_refreshments' ? 'With refreshments' : 'Venue only') + ' · est. ' + rp(o.est_price) : (o.items || []).map(i => i.qty + '× ' + i.name).join(', ') || 'No menu items',
      method: venue ? 'WhatsApp' : A.methodLabel(o.payment_method), totalFmt: venue ? '' : rp(o.total),
      cardStyle: { display: 'flex', flexDirection: 'column', gap: 12, padding: 20, borderRadius: 24, background: active ? '#fff' : 'rgba(255,255,255,.75)', border: active ? '2px solid #0d0d0d' : '1px solid rgba(255,255,255,.95)', boxShadow: active ? '0 16px 40px rgba(13,13,13,.10)' : 'inset 0 1px 0 #fff, 0 10px 30px rgba(13,13,13,.05)', animation: flash ? 'cafeFlash 1s ease 1' : 'none' },
      toggle: () => this.setState(s => ({ hOpen: { ...s.hOpen, [o.code]: !s.hOpen[o.code] } })), isOpen: open, moreLabel: open ? 'Hide details' : 'Details',
      lines: venue ? [] : (o.items || []).map(i => ({ label: i.qty + '× ' + i.name, opts: A.optionsText(i.options), value: rp(i.subtotal) })),
      price, hasPrice: price.length > 0,
      timeline: (o.timeline || []).map(t => ({ text: A.status({ ...o, status: t.to }).pill + ' · ' + A.time(t.at) + (t.by ? ' · ' + t.by : '') })), hasTimeline: !!(o.timeline && o.timeline.length),
      showQr: !venue && o.type === 'dine_in' && o.status === 'booked', qr: !venue && o.type === 'dine_in' && o.status === 'booked' && open ? React.createElement('div', { style: { width: 140, height: 140 }, dangerouslySetInnerHTML: { __html: A.qrSvg(o.code, 140) } }) : null,
      canArrive: false,  // guests are checked in by the barista only arrive: () => this.imAtCafe(o),
      arrivedNote: false,
      canRate: paid, rates: [{ label: 'Food', stars: stars('food') }, { label: 'Service', stars: stars('service') }],
      rateMsg: r.err ? r.err : r.saved ? 'Thanks, rating saved' : (r.food && !r.service) || (!r.food && r.service) ? 'Rate both to save' : ''
    };
  }
  renderVals() {
    const { tab, sel } = this.state;
    const l = this.list();
    const m = this.byId(sel);
    const H = this.state.hList || [];
    return {
      navs: [
        { label: 'Full Menu', short: 'Menu', go: () => this.setState({ full: true, hist: false, sel: null }) },
        { label: 'Book Venue', short: 'Venue', go: () => this.setState({ mode: 'venue', checkout: true, sel: null, full: false, hist: false }) },
        { label: 'Purchase History' + (this.state.refs.length ? ' (' + this.state.refs.length + ')' : ''), short: 'History' + (this.state.refs.length ? ' (' + this.state.refs.length + ')' : ''), go: () => this.openHist(), dot: this.state.hDot }
      ],
      heroVideo: this.heroSrc(), hasVideo: !!this.heroSrc(), vidRef: this.vid,
      vidMeta: e => { const v = e.target; if (v.videoWidth) this.setState({ vAR: v.videoWidth + '/' + v.videoHeight }); },
      soundLabel: this.state.sound ? '🔊 Mute' : '🔇 Sound on',
      toggleSound: e => { if (e && e.stopPropagation) e.stopPropagation(); const v = this.vid.current; if (!v) return; const on = !this.state.sound; v.muted = !on; if (on) v.play().catch(() => {}); this.setState({ sound: on, userMuted: !on }); },
      hasIg: !this.heroSrc() && !!igId(this.props.instagramUrl ?? IG_DEFAULT), igEmbed: igId(this.props.instagramUrl ?? IG_DEFAULT) ? 'https://www.instagram.com/' + igId(this.props.instagramUrl ?? IG_DEFAULT) + '/embed/' : '',
      igPosts: IG_POSTS.map(id => ({ embed: 'https://www.instagram.com/' + id + '/embed/', style: { position: 'absolute', border: 0, background: 'linear-gradient(90deg,#e7e6e3 0%,#f3f2f0 45%,#e7e6e3 90%) 0 0/220% 100%', animation: 'skMove 1.25s ease-in-out infinite', pointerEvents: 'none', ...IG_CROP[id.split('/')[0]] } })),
      igTrack: { position: 'absolute', inset: 0, display: 'flex', transform: 'translateX(' + (-100 * (this.state.igI || 0)) + '%)', transition: 'transform .9s cubic-bezier(.7,0,.2,1)' },
      igDots: IG_POSTS.map((_, i) => ({ style: { position: 'relative', width: 28, height: 3, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,.35)' }, fill: { position: 'absolute', left: 0, top: 0, bottom: 0, background: '#fff', width: i < (this.state.igI || 0) ? '100%' : i === (this.state.igI || 0) ? (this.state.igHold ? '0%' : '100%') : '0%', transition: i === (this.state.igI || 0) && !this.state.igHold ? 'width ' + IG_MS + 'ms linear' : 'none' } })),
      noMedia: !this.heroSrc() && !igId(this.props.instagramUrl ?? IG_DEFAULT),
      heroMove: e => { const r = e.currentTarget.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; cancelAnimationFrame(this._mr); this._mr = requestAnimationFrame(() => this.setState({ hx: x, hyM: y, hon: true, px: e.clientX - r.left, py: e.clientY - r.top })); },
      heroLeave: () => this.setState({ hx: 0, hyM: 0, hon: false }),
      spotStyle: { position: 'absolute', left: (this.state.px || 0) - 260, top: (this.state.py || 0) - 260, width: 520, height: 520, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(227,10,46,.16), rgba(227,10,46,0) 65%)', opacity: this.state.hon ? 1 : 0, transition: 'opacity .4s' },
      tiltStyle: { position: 'relative', zIndex: 1, transform: 'perspective(1000px) rotateY(' + (this.state.hx * 14) + 'deg) rotateX(' + (-this.state.hyM * 12) + 'deg)', transition: 'transform .25s ease-out', transformStyle: 'preserve-3d' },
      glareStyle: { position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(400px circle at ' + (50 + this.state.hx * 100) + '% ' + (50 + this.state.hyM * 100) + '%, rgba(255,255,255,.22), transparent 55%)', opacity: this.state.hon ? 1 : 0, transition: 'opacity .3s', mixBlendMode: 'soft-light' },
      badgeA: { position: 'absolute', left: 0, top: '18%', zIndex: 2, transform: 'translate(' + (this.state.hx * -36) + 'px,' + (this.state.hyM * -28) + 'px)', transition: 'transform .3s ease-out' },
      badgeB: { position: 'absolute', right: 0, bottom: '16%', zIndex: 2, transform: 'translate(' + (this.state.hx * 30) + 'px,' + (this.state.hyM * 24) + 'px)', transition: 'transform .3s ease-out' },
      needs: NEED_NAMES.map(([label], i) => { const on = this.state.need === i; return { label, pick: () => this.state.need !== i && this.setState({ need: i }), style: { all: 'unset', cursor: 'pointer', padding: '9px 16px', borderRadius: 999, whiteSpace: 'nowrap', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: '.04em', textTransform: 'uppercase', border: '1px solid ' + (on ? '#0d0d0d' : 'rgba(13,13,13,.18)'), background: on ? '#0d0d0d' : 'rgba(255,255,255,.6)', color: on ? '#fff' : '#0d0d0d', transition: 'all .2s' } }; }),
      need: (() => { const n = NEED_NAMES[this.state.need]; const m = this.byName(n[1]) || this.menuAll()[this.state.need] || { id: null, name: '…', price: 0, imgs: [NO_PHOTO] }; return { kind: n[0], name: m.name, price: m.id ? rp(m.price) : '', open: () => m.id && this.setState({ sel: m.id }), imgStyle: { width: 64, height: 64, flexShrink: 0, borderRadius: 14, backgroundColor: '#e8e6e1', backgroundImage: 'url("' + this.src(m.imgs[0]) + '")', backgroundSize: 'cover', backgroundPosition: 'center' } }; })(),
      needCardStyle: { all: 'unset', cursor: 'pointer', position: 'absolute', left: '-6%', bottom: '4%', zIndex: 3, display: 'flex', alignItems: 'center', gap: 12, padding: 10, paddingRight: 18, borderRadius: 20, background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.95)', boxShadow: '0 20px 50px rgba(13,13,13,.18)', maxWidth: 300, transform: 'translate(' + (this.state.hx * -22) + 'px,' + (this.state.hyM * -18) + 'px)', transition: 'transform .3s ease-out' },
      heroMediaStyle: { position: 'relative', zIndex: 1, height: 'clamp(520px, 74vh, 720px)', aspectRatio: this.props.heroVideo ? (this.state.vAR || '9/16') : '4/5', maxWidth: '100%', borderRadius: 28, overflow: 'hidden', background: 'linear-gradient(90deg,#e7e6e3 0%,#f3f2f0 45%,#e7e6e3 90%) 0 0/220% 100%', animation: 'skMove 1.25s ease-in-out infinite', boxShadow: '0 40px 90px rgba(13,13,13,.28), 0 0 0 1px rgba(255,255,255,.6) inset', transform: 'translateY(' + (this.state.hy * -0.1) + 'px)', willChange: 'transform' },
      heroDrinks: NEED_NAMES.map(([kind, nm], i) => { const m = this.byName(nm) || this.menuAll()[i] || { id: null, name: '…', imgs: [NO_PHOTO] }; const y = this.state.hy * (0.05 + i * 0.05), on = this.state.heroIn;
        return { kind, name: m.name, imgStyle: { display: 'block', aspectRatio: '1', borderRadius: 16, overflow: 'hidden', backgroundColor: '#e8e6e1', boxShadow: '0 10px 30px rgba(13,13,13,.12)', backgroundImage: 'url("' + this.src(m.imgs[0]) + '")', backgroundSize: 'cover', backgroundPosition: 'center' }, open: () => m.id && this.setState({ sel: m.id }),
          style: { all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, opacity: on ? 1 : 0, transform: 'translateY(' + ((on ? 0 : 40) - y) + 'px) rotate(' + ((i - 1) * (on ? 2 : 8)) + 'deg)', transition: 'opacity .8s ' + (0.2 + i * 0.15) + 's, transform .9s cubic-bezier(.2,.8,.2,1) ' + (i * 0.15) + 's' } }; }),
      // Pauses the About-section video (site music) while the menu / order / checkout / history / product view is open
      mediaHold: !!(this.state.checkout || this.state.full || this.state.hist || this.state.sel),
      showFull: this.state.full, openFull: () => this.setState({ full: true, hist: false }), closeFull: () => this.setState({ full: false }),
      showHist: this.state.hist, closeHist: () => this.setState({ hist: false }),
      sub: this.state.sub || 'table',
      orderModes: [['Dine-in', 'dine'], ['Takeaway', 'take']].map(([label, mode]) => {
        const on = this.state.mode === mode;
        return { label, pick: () => this.setState({ mode }), style: { all: 'unset', cursor: 'pointer', padding: '9px 16px', borderRadius: 999, whiteSpace: 'nowrap', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: '.03em', textTransform: 'uppercase', background: on ? '#e30a2e' : 'transparent', color: on ? '#fff' : '#3a3a3a' } };
      }),
      hLoading: this.state.hLoading && !H.length, hError: !!this.state.hErr && !H.length, retryHist: () => this.refreshHist(true),
      noOrders: !this.state.hLoading && !this.state.hErr && this.state.hList !== null && H.length === 0,
      hasActive: H.some(o => o.is_open), hasPast: H.some(o => !o.is_open),
      activeOrders: H.filter(o => o.is_open).map(o => this.histCard(o, true)),
      pastOrders: H.filter(o => !o.is_open).map(o => this.histCard(o, false)),
      findCode: this.state.findCode, findPhone: this.state.findPhone, findMsg: this.state.findMsg, findBusy: this.state.findBusy,
      setFindCode: e => this.setState({ findCode: e.target.value }), setFindPhone: e => this.setState({ findPhone: e.target.value }),
      doFind: () => !this.state.findBusy && this.findOrder(),
      hasToast: !!this.state.toast, toast: this.state.toast || '', closeToast: () => this.setState({ toast: null }),
      savePaid: () => { this.setState({ cart: {} }); this.refreshHist(false); },
      toMenu: () => this.scrollMenu(),
      openHero: () => this.setState({ sel: 'aren' }),
      toOrder: () => this.setState({ mode: null, checkout: true, sel: null, full: false }),
      waNumber: this.props.waNumber ?? '6285284200036',
      menuLite: this.menuAll().map(m => ({ id: m.id, name: m.name, cat: m.cat, price: m.price, base: m.base, src: this.src(m.imgs[0]), available: m.available, addons: m.addons })),
      tabs: ['All'].concat([...new Set(this.menuAll().map(x => x.cat))]).map(t => ({ label: t, pick: () => this.setState({ tab: t }),
        style: { all: 'unset', cursor: 'pointer', padding: '9px 18px', borderRadius: 999, whiteSpace: 'nowrap', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: '.03em', textTransform: 'uppercase',
          background: t === tab ? '#e30a2e' : 'transparent', color: t === tab ? '#fff' : '#3a3a3a', transition: 'background .2s' } })),
      mode: this.state.mode || null,
      modeLabel: ({ dine: 'Dine-in · ', take: 'Takeaway · ' })[this.state.mode] || '',
      pickDine: () => this.setState({ mode: 'dine', checkout: true, sel: null, full: false }),
      pickTake: () => this.setState({ mode: 'take', checkout: true, sel: null, full: false }),
      pickVenue: () => this.setState({ mode: 'venue', checkout: true, sel: null, full: false }),
      railRef: this.rail, scrollPrev: () => this.scrollRail(-1), scrollNext: () => this.scrollRail(1),
      hasCart: !this.state.checkout && Object.keys(this.state.cart).length > 0,
      cartCount: Object.values(this.state.cart).reduce((a, l) => a + l.qty, 0),
      cartTotal: rp(Object.values(this.state.cart).reduce((a, l) => { const x = this.byId(l.id); return a + (x ? (x.price + optsPrice(x, l.opts)) * l.qty : 0); }, 0)),
      cartItems: Object.entries(this.state.cart).filter(([, l]) => this.byId(l.id)).map(([key, l]) => { const x = this.byId(l.id); return { key, id: l.id, opts: l.opts, name: x.name, optLabel: optsLabel(x, l.opts), price: x.price + optsPrice(x, l.opts), qty: l.qty }; }),
      showCheckout: this.state.checkout,
      openCheckout: () => this.setState(s => ({ checkout: true, sel: null, full: false, mode: s.mode === 'venue' ? null : s.mode })),
      closeCheckout: () => this.setState({ checkout: false }),
      clearCart: () => this.setState({ cart: {} }),
      addSel: () => m && this.add(m.id, this.selOpts(m)),
      addSelLabel: !m ? '' : !m.available ? 'Sold out' : (this.qtyOf(m.id) ? 'Add another (' + this.qtyOf(m.id) + ')' : '+ Order') + ' · ' + rp(m.price + optsPrice(m, this.selOpts(m))),
      hasAddons: !!(m && m.available && m.addons && m.addons.length),
      addonGroups: m ? (m.addons || []).map(g => ({ group: g.group, options: (g.options || []).map(o => { const on = this.selOpts(m).includes(o.id); return { label: o.label + (Number(o.price) ? ' +' + rp(o.price) : ''), pick: () => this.pickOpt(m, g, o.id),
        style: { all: 'unset', cursor: 'pointer', whiteSpace: 'nowrap', padding: '7px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: on ? '#0d0d0d' : 'rgba(255,255,255,.75)', color: on ? '#fff' : '#0d0d0d', border: '1px solid ' + (on ? '#0d0d0d' : 'rgba(13,13,13,.12)') } }; }) })) : [],
      menuLoading: this.state.menu === null && !this.state.menuErr, menuError: !!this.state.menuErr, retryMenu: () => this.loadMenu(),
      items: l.map(x => ({ ...x, priceFmt: rp(this.price(x)), add: () => this.add(x.id), soldOut: !x.available, addLabel: !x.available ? 'Sold out' : this.qtyOf(x.id) ? 'In cart · ' + this.qtyOf(x.id) : '+ Add',
        addStyle: this.addStyle(x.available, false), addStyleSm: this.addStyle(x.available, true), src: this.src(x.imgs[0]), imgStyle: this.imgStyle(this.src(x.imgs[0]), 'cover'), open: () => this.setState({ sel: x.id }) })),
      hasSel: !!m, sel: m || {},
      counter: m ? m.cat + ' · ' + String(l.findIndex(x => x.id === sel) + 1).padStart(2, '0') + ' / ' + String(l.length).padStart(2, '0') : '',
      popView: m ? this.viewer(m, 'pop') : null,
      tiles: m ? (() => {
        const n = l.length, s = l.findIndex(x => x.id === sel);
        return l.map((x, j) => {
          let d = ((j - s) % n + n) % n; if (d > n / 2) d -= n;
          const th = d * 24, show = d !== 0 && Math.abs(d) <= 3;
          return { name: x.name, src: this.src(x.imgs[0]), pick: () => this.setState({ sel: x.id }),
            imgStyle: { display: 'block', width: '100%', height: '100%', backgroundImage: `url(${this.src(x.imgs[0])})`, backgroundSize: 'cover', borderRadius: '22%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', pointerEvents: 'none' },
            style: { all: 'unset', cursor: 'pointer', position: 'absolute', left: '50%', top: 'calc(44% + 71vmin)', zIndex: 1, boxSizing: 'border-box',
              width: '18vmin', height: '18vmin', padding: '1.4vmin', borderRadius: '28%',
              background: 'rgba(255,255,255,.6)', backdropFilter: 'blur(18px) saturate(180%)', WebkitBackdropFilter: 'blur(18px) saturate(180%)',
              border: '1px solid rgba(255,255,255,.95)', boxShadow: 'inset 0 1px 0 #fff, 0 16px 36px rgba(13,13,13,.12)',
              transform: `translate(-50%,-50%) rotate(${th}deg) translateY(-76vmin)`,
              opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none',
              transition: 'transform .8s cubic-bezier(.2,.8,.2,1), opacity .4s' } };
        });
      })() : [],
      hint: m && m.imgs.length > 1 ? 'Drag left or right to see the other side.' : 'Drag left or right to move it.',
      close: () => this.setState({ sel: null }), stop: e => e.stopPropagation(),
      prev: () => this.step(-1), next: () => this.step(1)
    };
  }
}
