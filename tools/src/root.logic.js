
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
const MENU_CACHE = '20fit-menu-cache-v1';
// Neutral grey placeholder shown under each Instagram slide only until its embed loads — never a product
// photo, so the hero only ever shows real Instagram content (and the box is never empty while loading).
const IG_PH = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4/uwxAAVoArHU0TkJAAAAAElFTkSuQmCC';
const IG_DEFAULT = 'https://www.instagram.com/reel/DZMf2F3y_6X/';
const IG_POSTS = ['p/DcTitnFEhQo', 'p/DeG5fVWyR1C', 'p/DY1wzVJSFAU'];
const IG_POSTERS = ['DSC3568', 'DSC3733', 'DSC3737-1'];  // real cafe photos shown instantly behind each hero IG embed (so the hero never sits on a grey skeleton)
const IG_CROP = { p: { left: '-2px', top: '-55px', width: 'calc(100% + 4px)', height: 'calc(100% + 55px + 480px)' }, reel: { left: '-21.1%', top: 'calc(-58px - 21.2%)', width: '142.2%', height: 'calc(160% + 58px + 480px)' } };
const IG_MS = 7000;
const igId = u => { const m = /instagram\.com\/(p|reel|reels|tv)\/([\w-]+)/.exec(u || ''); return m ? (m[1] === 'reels' ? 'reel' : m[1]) + '/' + m[2] : ''; };
const rp = n => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID');
const API = () => window.CafeApi;
const SC = () => window.StoryConfig || { chapters: [], stops: [], needs: ['Fresh', 'Fueling', 'Light energy'], sky: [], teasers: {} };
const TRACK = (e, p) => { try { window.track && window.track(e, p); } catch (x) {} };
const clamp01 = x => Math.max(0, Math.min(1, x));
const reduceMotionNow = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixRgb = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
// Story layout: horizontal pinned day on wide screens; vertical list on phones or with reduced motion
const storyFlat = () => !!(window.matchMedia && window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches);
const isCut = src => /^data:|\.png($|\?)/i.test(src);

class Component extends DCLogic {
  vid = React.createRef();
  state = { igI: 0, igHold: true, hy: 0, hx: 0, hyM: 0, hon: false, need: 1, heroIn: false, sound: false, tab: 'All', sel: null, cart: {}, checkout: false, full: false, hist: false,
    menu: null, menuErr: '', refs: [], hList: null, hErr: '', hLoading: false, hOpen: {}, hFlash: {}, hDot: false, rates: {}, findCode: '', findPhone: '', findMsg: '', findBusy: false, toast: null, pick: {} };
  rail = React.createRef();
  careVid = React.createRef();
  day = React.createRef(); dayStage = React.createRef(); dayTrack = React.createRef(); dayHand = React.createRef(); dayMin = React.createRef(); dayTime = React.createRef(); dayTime2 = React.createRef(); progBar = React.createRef();
  // ---- landing story (CH 03 'A day, fueled' + chapter navigation) ----
  storyTick() {
    const cfg = SC(), stops = cfg.stops, n = stops.length;
    const H = document.documentElement, max = Math.max(1, H.scrollHeight - innerHeight);
    if (this.progBar.current) this.progBar.current.style.transform = 'scaleX(' + clamp01(scrollY / max) + ')';
    // active chapter + one 'story_chapter_view' per chapter per session (>= 50% on screen)
    let ch = 0;
    (this._chs || []).forEach((c, i) => {
      const el = document.getElementById(c.el); if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top <= innerHeight * 0.45) ch = i;
      const vis = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      if (vis >= Math.min(r.height, innerHeight) * 0.5) { window.trackOnce && window.trackOnce('ch:' + c.id, 'story_chapter_view', { chapter: c.id, index: cfg.chapters.indexOf(c) + 1 }); if (c.el === 'finale') window.trackOnce && window.trackOnce('finale', 'story_finale_view', {}); }
    });
    if (ch !== this.state.ch) this.setState({ ch });
    // CH 05: headline reveals word by word with the scroll; the polaroids close up
    const head = document.querySelector('#care [data-head]');
    if (head) {
      const r = head.getBoundingClientRect(), pr = reduceMotionNow() ? 1 : clamp01((innerHeight * 0.9 - r.top) / (r.height + innerHeight * 0.45));
      const ws = head.querySelectorAll('[data-w]'), n = ws.length;
      ws.forEach((w, i) => { const o = 0.15 + 0.85 * clamp01(pr * (n + 2) - i); if (w._o !== o) { w._o = o; w.style.opacity = o.toFixed(3); } });
    }
    const pol = document.querySelector('#care [data-pol]');
    if (pol) {
      const r = pol.getBoundingClientRect(), pr = reduceMotionNow() ? 1 : clamp01((innerHeight - r.top) / (innerHeight * 0.85));
      [...pol.children].forEach((c, i) => { const d = i - 1; c.style.transform = 'translateX(' + (d * (1 - pr) * 38) + '%) rotate(' + (d * (4 + 10 * (1 - pr))) + 'deg) translateY(' + (Math.abs(d) * 14 * pr) + 'px)'; });
    }
    // CH 03
    const el = this.day.current, stage = this.dayStage.current, track = this.dayTrack.current; if (!el || !stage || !track || !n) return;
    let pos;
    if (!storyFlat()) {
      const r = el.getBoundingClientRect(), total = Math.max(1, el.offsetHeight - innerHeight), p = clamp01(-r.top / total / 0.9);   // the last 10% holds the evening stop
      pos = p * (n - 1);
      // card i lands exactly where card 0 starts (left padding) when the day reaches stop i
      const cards = track.querySelectorAll('[data-stop]'), ci = Math.min(n - 2, Math.floor(pos)), cf = pos - ci;
      const x0 = cards[0] ? cards[0].offsetLeft : 0, xa = cards[Math.max(0, ci)] ? cards[Math.max(0, ci)].offsetLeft : 0, xb = cards[ci + 1] ? cards[ci + 1].offsetLeft : xa;
      const mv = cf < 0.3 ? 0 : cf > 0.7 ? 1 : (1 - Math.cos((cf - 0.3) / 0.4 * Math.PI)) / 2;   // each card dwells at its stop, moves in between
      track.style.transform = 'translate3d(' + (-(xa + (xb - xa) * mv - x0)) + 'px,0,0)';
      track.style.setProperty('--dp', p.toFixed(4));
    } else {   // vertical: the stop closest to the middle of the screen
      let best = 0, bd = 1e9;
      track.querySelectorAll('[data-stop]').forEach((c, i) => { const r = c.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - innerHeight / 2); if (d < bd) { bd = d; best = i; } });
      pos = best; track.style.transform = '';
    }
    const i = Math.min(n - 2, Math.floor(pos)), f = pos - i, a = stops[Math.max(0, i)], b = stops[Math.min(n - 1, i + 1)] || a;
    const hour = a.hour + (b.hour - a.hour) * (n > 1 ? f : 0);
    const hh = Math.floor(hour), mm = Math.round((hour - hh) * 60 / 5) * 5 % 60;
    const tt = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    if (this.dayTime.current) this.dayTime.current.textContent = tt;
    if (this.dayTime2.current) this.dayTime2.current.textContent = tt;
    if (this.dayHand.current) this.dayHand.current.style.transform = 'rotate(' + ((hour % 12) * 30) + 'deg)';
    if (this.dayMin.current) this.dayMin.current.style.transform = 'rotate(' + ((hour % 1) * 360) + 'deg)';
    const sky = cfg.sky.length ? cfg.sky : ['#f4f4f2'], si = Math.min(sky.length - 2, Math.floor(pos)), sf = pos - si;
    const c = sky.length > 1 ? mixRgb(hexToRgb(sky[Math.max(0, si)]), hexToRgb(sky[Math.max(0, si) + 1]), clamp01(sf)) : hexToRgb(sky[0]);
    stage.style.backgroundColor = 'rgb(' + c.join(',') + ')';
    const dark = (c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11) < 110;
    if (stage.dataset.dark !== String(dark)) stage.dataset.dark = String(dark);
    const di = Math.round(pos); if (di !== this.state.dayI) this.setState({ dayI: di });
  }
  // '+ Add' from the story: same cart as the menu, with the product thumbnail flying to the cart bar
  storyAdd(m, chapter, e) {
    if (!m || !m.available) return;
    const from = e && e.currentTarget && e.currentTarget.closest('[data-fly]'), img = from && from.querySelector('img');
    this.add(m.id);
    TRACK('story_add_to_cart', { chapter, item_name: m.name, price: m.price });
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bump = () => { const bar = document.querySelector('[data-cartbar]'); if (bar && bar.animate) bar.animate([{ transform: 'translateX(-50%) scale(1)' }, { transform: 'translateX(-50%) scale(1.08)' }, { transform: 'translateX(-50%) scale(1)' }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' }); };
    if (!img || reduce || !img.animate) { setTimeout(bump, 60); return; }
    const r = img.getBoundingClientRect(), ghost = img.cloneNode();
    Object.assign(ghost.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', margin: 0, zIndex: 90, borderRadius: '16px', objectFit: 'cover', pointerEvents: 'none', boxShadow: '0 16px 40px rgba(13,13,13,.25)' });
    document.body.appendChild(ghost);
    requestAnimationFrame(() => {
      const bar = document.querySelector('[data-cartbar]'), t = bar ? bar.getBoundingClientRect() : { left: innerWidth / 2 - 20, top: innerHeight - 60, width: 40, height: 40 };
      const dx = t.left + t.width * 0.18 - r.left - r.width / 2, dy = t.top + t.height / 2 - r.top - r.height / 2;
      ghost.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 80) + 'px) scale(.6)', opacity: 1, offset: 0.5 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.18)', opacity: 0.2 }], { duration: 720, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => { ghost.remove(); bump(); };
    });
  }
  // ---- CH 05 video = the site's music: starts muted, sound on at the first tap/click/key, keeps playing while the
  // visitor scrolls, pauses only while an overlay (menu / order / checkout / history / product) is open or the tab is hidden.
  overlayOpen() { const st = this.state; return !!(st.checkout || st.full || st.hist || st.sel); }
  cVidLive() { return !this.overlayOpen() && document.visibilityState === 'visible'; }
  ctlCareVid() {
    const v = this.careVid.current; if (!v) return;
    if (!v.loop) { v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); }
    v.muted = !this.state.cSound;
    if (this.cVidLive()) { if (v.paused) v.play().catch(() => { if (!v.muted) { v.muted = true; this.setState({ cSound: false }); v.play().catch(() => {}); } }); }
    else if (!v.paused) v.pause();
  }
  setupCareVid() { /* Music removed for load performance: the care-section video no longer loads or plays, so no sound/unmute machinery is wired up. */ }
  // ---- CH 04 quiz ----
  quizAnswer(qid, val) {
    const qs = SC().quiz.questions, i = this.state.qi || 0;
    if (this.state.qPick) return;
    if (i === 0) TRACK('quiz_start', {});
    this.setState({ qPick: val });
    setTimeout(() => {
      const qa = { ...(this.state.qa || {}), [qid]: val }, next = i + 1;
      if (next < qs.length) { this.setState({ qa, qi: next, qPick: null }); return; }
      const r = this.quizResult(qa); const ni = SC().needs.indexOf(r.need);
      this.setState({ qa, qi: next, qPick: null, ...(ni >= 0 ? { need: ni } : {}) });
      TRACK('quiz_complete', { result_item: r.items[0] ? r.items[0].name : '' });
    }, reduceMotionNow() ? 0 : 280);
  }
  quizResult(qa) {
    const Q = SC().quiz, ok = x => x && x.available;
    const rule = (Q.rules || []).find(r => Object.keys(r.when || {}).every(k => qa[k] === r.when[k]));
    let items = rule ? rule.items.map(n => this.byName(String(n).toLowerCase())).filter(ok) : [];
    if (!items.length) items = this.menuAll().filter(m => ok(m) && m.cat === Q.fallbackCategory).slice(0, 3);
    if (!items.length) items = this.menuAll().filter(ok).slice(0, 3);
    return { items: items.slice(0, 3), reason: rule && items.length ? rule.reason : Q.fallbackReason, need: rule ? rule.need : null };
  }
  goTo(elId) { const el = document.getElementById(elId); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (elId === 'order' ? 90 : 0), behavior: 'smooth' }); }
  // ---- menu (from POS via cafe_get_web_menu) ----
  // Menu is cached in the browser: repeat visits show it (and its photos) instantly, then refresh from the server.
  loadMenu() {
    this.setState({ menuErr: '' });
    if (this.state.menu === null) { try { const c = JSON.parse(localStorage.getItem(MENU_CACHE) || 'null'); if (c && Array.isArray(c.items) && Date.now() - c.at < 7 * 864e5) this.setState({ menu: c.items.map(toItem) }); } catch (e) {} }
    API().getMenu().then(res => { this.setState({ menu: (res.items || []).map(toItem) }); try { localStorage.setItem(MENU_CACHE, JSON.stringify({ at: Date.now(), items: res.items || [] })); } catch (e) {} })
      .catch(e => this.setState(s => (s.menu ? {} : { menuErr: e.message || 'Menu unavailable' })));
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
  componentDidUpdate() { this.syncVid(); const ov = this.overlayOpen(); if (ov !== this._ov) { this._ov = ov; this.ctlCareVid(); } }
  componentDidMount() {
    this.loadMenu();
    // WhatsApp number for CH 07 comes from the POS web config (same source as checkout)
    setTimeout(() => { const A = API(); A && A.getConfig && A.getConfig().then(c => { if (c && c.wa_number) this.setState({ waCfg: String(c.wa_number) }); }).catch(() => {}); }, 1500);
    this.refreshHist(false);
    // Back from Xendit's payment page (?paid=CODE / ?order=CODE): show the order in Purchase History.
    try {
      const q = new URLSearchParams(location.search), back = q.get('paid') || q.get('order');
      if (back) { history.replaceState(null, '', location.pathname + location.hash); setTimeout(() => this.openHist(), 300); if (q.get('paid')) this.showToast('Payment received for ' + back + ' · confirming…'); }
    } catch (e) {}
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
    
    // landing story: chapters on this page, scroll-driven CH 03, chapter rail / progress bar
    this.setupCareVid();
    // CH 05 pillars + CH 06 cards animate in once they are on screen
    this._reveal = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const k = e.target.dataset.reveal; if (k && !this.state[k]) this.setState({ [k]: true }); this._reveal.unobserve(e.target); }), { threshold: 0.25 });
    setTimeout(() => document.querySelectorAll('[data-reveal]').forEach(el => this._reveal.observe(el)), 700);
    this._chs = SC().chapters.filter(c => document.getElementById(c.el));
    this._sraf = 0; this._story = () => { if (this._sraf) return; this._sraf = requestAnimationFrame(() => { this._sraf = 0; this.storyTick(); }); };
    window.addEventListener('scroll', this._story, { passive: true }); window.addEventListener('resize', this._story);
    setTimeout(() => { this._chs = SC().chapters.filter(c => document.getElementById(c.el)); this.storyTick(); }, 600);
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
  componentWillUnmount() { clearInterval(this._cWatch); if (this._cStop) this._cStop(); document.removeEventListener('visibilitychange', this._cVis); if (this._reveal) this._reveal.disconnect(); window.removeEventListener('scroll', this._story); window.removeEventListener('resize', this._story); if (this._io) this._io.disconnect(); document.removeEventListener('visibilitychange', this._vVis); ['pointerdown', 'pointerup', 'keydown', 'touchend', 'click'].forEach(ev => window.removeEventListener(ev, this._unmute, true)); clearInterval(this._ig); clearInterval(this._poll); this._offRefs && this._offRefs(); document.removeEventListener('visibilitychange', this._focus); window.removeEventListener('focus', this._focus); Object.values(this._w || {}).forEach(f => f()); ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(ev => window.removeEventListener(ev, this._unmute)); window.removeEventListener('scroll', this._hs); window.removeEventListener('keydown', this._key); cancelAnimationFrame(this._raf); }

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
      summary: venue ? (o.package === 'with_refreshments' ? 'With refreshments' : 'Venue only') + (Number(o.total) > 0 ? ' · ' + rp(o.total) : ' · est. ' + rp(o.est_price)) : (o.items || []).map(i => i.qty + '× ' + i.name).join(', ') || 'No menu items',
      method: venue ? (o.payment_status === 'paid' ? 'Paid' : 'Pay at cafe') : A.methodLabel(o.payment_method), totalFmt: venue ? (Number(o.total) > 0 ? rp(o.total) : '') : rp(o.total),
      cardStyle: { display: 'flex', flexDirection: 'column', gap: 12, padding: 20, borderRadius: 24, background: active ? '#fff' : 'rgba(255,255,255,.75)', border: active ? '2px solid #0d0d0d' : '1px solid rgba(255,255,255,.95)', boxShadow: active ? '0 16px 40px rgba(13,13,13,.10)' : 'inset 0 1px 0 #fff, 0 10px 30px rgba(13,13,13,.05)', animation: flash ? 'cafeFlash 1s ease 1' : 'none' },
      toggle: () => this.setState(s => ({ hOpen: { ...s.hOpen, [o.code]: !s.hOpen[o.code] } })), isOpen: open, moreLabel: open ? 'Hide details' : 'Details',
      // Venue requests: show the request itself (it has no menu items, prices or payment timeline)
      lines: venue ? (function () {
        var hm = t => (t ? String(t).slice(0, 5) : '-');
        var addSt = s => ({ pending_confirmation: 'menunggu', accepted: 'diterima', rejected: 'ditolak', cancelled_by_user: 'dibatalkan' })[s] || s;
        var L = [
          ['Event', String(o.event_type || '-').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())],
          ['Date', A.dayLabel(o.event_date)],
          ['Time', hm(o.start_time) + '–' + hm(o.end_time)],
          ['Guests', (o.guests || 0) + ' people'],
          ['Package', o.package === 'with_refreshments' ? 'With refreshments' : 'Venue only']
        ];
        if (o.serve_time) L.push(['Serving time', hm(o.serve_time)]);
        (o.items || []).forEach(i => L.push([i.qty + '× ' + i.name, rp(i.subtotal)]));
        (o.addendums || []).forEach(a => L.push(['+ ' + a.code + ' (' + addSt(a.status) + ')', rp(a.subtotal)]));
        L.push([Number(o.total) > 0 ? 'Total' : 'Estimated price', rp(Number(o.total) > 0 ? o.total : o.est_price)]);
        return L.map(([label, value]) => ({ label, opts: '', value }));
      })() : (o.items || []).map(i => ({ label: i.qty + '× ' + i.name, opts: A.optionsText(i.options), value: rp(i.subtotal) })),
      venueNote: venue ? (o.can_add ? 'Mau tambah refreshment? Chat kami di WhatsApp — tambahan dikonfirmasi barista dulu.' : o.status === 'new' ? 'The cafe will contact you on WhatsApp to confirm your booking.' : o.status === 'confirmed' ? 'Your venue booking is confirmed. See you there!' : '') : '',
      venueWa: venue && o.is_open !== false,
      venueWaLabel: venue && o.can_add ? 'Tambah refreshment via WhatsApp' : 'Chat WhatsApp',
      venueWaUrl: venue ? 'https://wa.me/' + String(this.props.waNumber ?? '6285284200036').replace(/\D/g, '') + '?text=' + encodeURIComponent(o.can_add
        ? 'Hi 20FIT Cafe, I would like to ADD refreshment to my venue booking ' + o.code + ' (' + A.dayLabel(o.event_date) + '). Items: '
        : 'Hi 20FIT Cafe, about my venue booking ' + o.code + ' (' + A.dayLabel(o.event_date) + ', ' + (o.guests || 0) + ' guests).') : '',
      price, hasPrice: price.length > 0,
      timeline: (o.timeline || []).map(t => ({ text: A.status({ ...o, status: t.to }).pill + ' · ' + A.time(t.at) + (t.by ? ' · ' + t.by : '') })), hasTimeline: !!(o.timeline && o.timeline.length),
      showQr: !venue && o.type === 'dine_in' && o.status === 'booked', qr: !venue && o.type === 'dine_in' && o.status === 'booked' && open ? React.createElement('div', { style: { width: 140, height: 140 }, dangerouslySetInnerHTML: { __html: A.qrSvg(o.code, 140) } }) : null,
      canArrive: false, arrive: () => {},  // guests are checked in by the barista only
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
    const cfg = SC(), needLabel = cfg.needs[this.state.need] || 'Fueling', overlay = !!(this.state.checkout || this.state.full || this.state.hist || m);
    const cartN = Object.values(this.state.cart).reduce((a, l) => a + l.qty, 0);
    const cartSum = Object.values(this.state.cart).reduce((a, l) => { const x = this.byId(l.id); return a + (x ? (x.price + optsPrice(x, l.opts)) * l.qty : 0); }, 0);
    const words = (t, on) => String(t).split(' ').map((w, k) => ({ w, style: { display: 'inline-block', marginRight: '.22em', opacity: on ? 1 : 0.12, transform: on ? 'none' : 'translateY(18px)', transition: 'opacity .5s ease ' + (k * 70) + 'ms, transform .6s cubic-bezier(.2,.8,.2,1) ' + (k * 70) + 'ms' } }));
    const story = {
      // CH 01 — scroll cue (hidden once the visitor starts scrolling)
      showCue: this.state.hy <= 80,
      // CH 03 — A day, fueled
      dayRef: this.day, dayStageRef: this.dayStage, dayTrackRef: this.dayTrack, dayHandRef: this.dayHand, dayMinRef: this.dayMin, dayTimeRef: this.dayTime, dayTime2Ref: this.dayTime2,
      dayStart: (cfg.stops[0] || {}).time || '06:00',
      dayStops: cfg.stops.map((st, i) => {
        const on = storyFlat() || i === (this.state.dayI || 0), pick = st.need === needLabel;
        const items = (st.items || []).map(nm => this.byName(String(nm).toLowerCase())).filter(x => x && x.available).map((x, k) => ({
          name: x.name, priceFmt: rp(x.price), src: this.src(x.imgs[0]), open: () => this.setState({ sel: x.id, tab: 'All' }),
          add: e => this.storyAdd(x, '03_day', e), addLabel: this.qtyOf(x.id) ? 'In cart · ' + this.qtyOf(x.id) : '+ Add',
          tileStyle: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, opacity: on ? 1 : 0.35, transform: on ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity .6s ease ' + (120 + k * 90) + 'ms, transform .7s cubic-bezier(.2,.8,.2,1) ' + (120 + k * 90) + 'ms' },
          photoStyle: { '--pi': i, display: 'block', width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 18, background: '#e8e6e1', boxShadow: '0 14px 34px rgba(13,13,13,.14)' } }));
        return { time: st.time, kicker: st.kicker, title: words(st.title, on), copy: st.copy, items, hasItems: items.length > 0, pick, need: st.need,
          cardStyle: { boxSizing: 'border-box', flex: '0 0 auto', display: 'grid', gap: 24, padding: 28, borderRadius: 32, background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(26px) saturate(170%)', WebkitBackdropFilter: 'blur(26px) saturate(170%)', border: '1px solid rgba(255,255,255,.9)',
            boxShadow: pick ? '0 0 0 2px #e30a2e, 0 24px 70px rgba(227,10,46,.22)' : 'inset 0 1px 0 #fff, 0 24px 60px rgba(13,13,13,.10)', color: '#0d0d0d', transition: 'box-shadow .4s' } };
      }),
      dayCartText: cartN ? cartN + ' in your cup · ' + rp(cartSum) : 'Your cup is empty',
      dayCartOn: cartN > 0, openCart: () => cartN && this.setState(s => ({ checkout: true, sel: null, full: false, mode: s.mode === 'venue' ? null : s.mode })),
      // CH 04 — Find your fuel
      quizQ: (() => { const Q = cfg.quiz, i = this.state.qi || 0; if (!Q || i >= Q.questions.length) return null; return Q.questions[i]; })() ? 1 : 0,
      quizIsQ: !!(cfg.quiz && (this.state.qi || 0) < cfg.quiz.questions.length), quizIsResult: !!(cfg.quiz && (this.state.qi || 0) >= cfg.quiz.questions.length),
      quizNum: String(Math.min((this.state.qi || 0) + 1, 3)).padStart(2, '0') + ' / 03',
      quizTitle: cfg.quiz && cfg.quiz.questions[this.state.qi || 0] ? cfg.quiz.questions[this.state.qi || 0].q : '',
      quizBars: (cfg.quiz ? cfg.quiz.questions : []).map((_, i) => ({ style: { flex: 1, height: 4, borderRadius: 4, background: i < (this.state.qi || 0) ? '#e30a2e' : i === (this.state.qi || 0) ? 'rgba(227,10,46,.45)' : 'rgba(13,13,13,.12)', transition: 'background .3s' } })),
      quizOpts: (() => { const Q = cfg.quiz, i = this.state.qi || 0; if (!Q || i >= Q.questions.length) return []; const q = Q.questions[i];
        return q.options.map(([val, label]) => { const on = this.state.qPick === val; return { label, pick: () => this.quizAnswer(q.id, val),
          style: { all: 'unset', cursor: 'pointer', boxSizing: 'border-box', padding: '18px 26px', borderRadius: 999, border: '2px solid ' + (on ? '#e30a2e' : 'rgba(13,13,13,.14)'), background: on ? '#e30a2e' : 'rgba(255,255,255,.8)', color: on ? '#fff' : '#0d0d0d', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: '.02em', textTransform: 'uppercase', transition: 'background .2s, border-color .2s, transform .2s', transform: on ? 'scale(1.04)' : 'none' } }; }); })(),
      quizRes: (() => { if (!cfg.quiz || (this.state.qi || 0) < cfg.quiz.questions.length) return { name: '', priceFmt: '', src: NO_PHOTO, reason: '' };
        const r = this.quizResult(this.state.qa || {}), m = r.items[0];
        return m ? { name: m.name, priceFmt: rp(m.price), src: this.src(m.imgs[0]), reason: r.reason, add: e => this.storyAdd(m, '04_quiz', e), open: () => this.setState({ sel: m.id, tab: 'All' }), addLabel: this.qtyOf(m.id) ? 'In your order · ' + this.qtyOf(m.id) : 'Add to my order' } : { name: 'Menu is loading…', priceFmt: '', src: NO_PHOTO, reason: '' }; })(),
      quizAlts: (() => { if (!cfg.quiz || (this.state.qi || 0) < cfg.quiz.questions.length) return []; return this.quizResult(this.state.qa || {}).items.slice(1).map(x => ({ name: x.name, priceFmt: rp(x.price), src: this.src(x.imgs[0]), add: e => this.storyAdd(x, '04_quiz', e), open: () => this.setState({ sel: x.id, tab: 'All' }), addLabel: this.qtyOf(x.id) ? 'In cart · ' + this.qtyOf(x.id) : '+ Add' })); })(),
      quizAgain: () => this.setState({ qi: 0, qa: {}, qPick: null }),
      quizTeaser: (cfg.teasers.quiz || ''), toCare: () => this.goTo('care'),
      // CH 05 — Made with care
      careWords: (() => { const C = cfg.care || { headline: '', headlineRed: '' }; return String(C.headline).split(' ').map(w => ({ w, style: { opacity: 0.15, color: 'inherit', transition: 'opacity .25s linear' } }))
        .concat(String(C.headlineRed).split(' ').map(w => ({ w, style: { opacity: 0.15, color: '#e30a2e', transition: 'opacity .25s linear' } }))); })(),
      pillars: ((cfg.care || {}).pillars || []).map((pl, i) => { const m = this.byName(String(pl.photo).toLowerCase()), on = !!this.state.careIn;
        return { need: pl.need, line: pl.line, src: this.src((m ? m.imgs : photosFor({ name: String(pl.photo).toLowerCase() }))[0]), pick: needLabel === pl.need,
          see: () => { const cats = new Set(this.menuAll().map(x => x.cat)); this.setState({ full: true, hist: false, sel: null, tab: cats.has(pl.category) ? pl.category : 'All' }); },
          style: { display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 28, background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(26px) saturate(170%)', WebkitBackdropFilter: 'blur(26px) saturate(170%)', border: '1px solid rgba(255,255,255,.9)', boxShadow: needLabel === pl.need ? '0 0 0 2px #e30a2e, 0 24px 60px rgba(227,10,46,.16)' : 'inset 0 1px 0 #fff, 0 20px 50px rgba(13,13,13,.08)',
            opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(48px)', transition: 'opacity .7s ease ' + (i * 140) + 'ms, transform .8s cubic-bezier(.2,.8,.2,1) ' + (i * 140) + 'ms' } }; }),
      igPol: IG_POSTS.map((id, k) => ({ embed: 'https://www.instagram.com/' + id + '/embed/', poster: IG_PH,
        loaded: () => !(this.state.polOk || {})[k] && this.setState(s => ({ polOk: { ...(s.polOk || {}), [k]: true } })),
        frameStyle: { position: 'absolute', border: 0, opacity: (this.state.polOk || {})[k] ? 1 : 0, transition: 'opacity .6s', pointerEvents: 'none', ...IG_CROP[id.split('/')[0]] } })),
      careVidRef: this.careVid, careVidSrc: '',
      cSoundLabel: this.state.cSound ? '🔊 Mute' : '🔇 Sound on',
      cToggle: e => { if (e && e.stopPropagation) e.stopPropagation(); const v = this.careVid.current; if (!v) return; const on = !this.state.cSound; v.muted = !on; if (on && this.cVidLive()) v.play().catch(() => {}); this.setState({ cSound: on, cUserMuted: !on }); },
      showMusic: false,
      careTeaser: cfg.teasers.care || '', toOrderSec: () => this.goTo('order'),
      turnTeaser: cfg.teasers.turn || '', toFinale: () => this.goTo('finale'),
      // CH 07 — See you at the bar (details from config; 'TODO…' values stay hidden)
      fin: (() => { const F = cfg.finale || {}, real = v => v && !/^TODO/i.test(String(v)); const ph = this.byName(String(F.photo || '').toLowerCase());
        const wa = String(this.state.waCfg || this.props.waNumber || '6285284200036').replace(/\D/g, '');
        return { place: F.place || '20FIT', address: real(F.address) ? F.address : '', hours: real(F.hours) ? F.hours : '', hasAddress: real(F.address), hasHours: real(F.hours),
          ig: '@' + (F.instagram || '20fit.cafe'), igUrl: 'https://www.instagram.com/' + (F.instagram || '20fit.cafe') + '/',
          wa: '+' + wa.replace(/^(\d{2})(\d{3})(\d{4})(\d+)$/, '$1 $2-$3-$4'), waUrl: 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Hi 20FIT Cafe!'),
          src: this.src((ph ? ph.imgs : photosFor({ name: String(F.photo || '') }))[0]) }; })(),
      // CH 06 — Your turn
      orderHasCart: cartN > 0, orderCartText: cartN + ' item' + (cartN > 1 ? 's' : '') + ' · ' + rp(cartSum) + ' — choose how to get it',
      modesStyle: { '--deal': this.state.orderIn || reduceMotionNow() ? 1 : 0, '--cart': cartN > 0 ? 1 : 0 },
      dayTeaser: document.getElementById('quiz') ? (cfg.teasers.day || '') : (cfg.teasers.dayFallback || ''),
      toAfterDay: () => this.goTo(document.getElementById('quiz') ? 'quiz' : 'order'),
      // Story navigation (rail on desktop, progress bar on phones); hidden while an overlay is open
      showStoryNav: !overlay,
      progRef: this.progBar,
      chapterLabel: ((this._chs || [])[this.state.ch || 0] || {}).label || '',
      chapters: (this._chs || []).map((c, i) => { const on = i === (this.state.ch || 0); return { label: String(cfg.chapters.indexOf(c) + 1).padStart(2, '0') + ' ' + c.label, go: () => this.goTo(c.el),
        dotStyle: { display: 'block', width: on ? 12 : 8, height: on ? 12 : 8, borderRadius: '50%', background: on ? '#e30a2e' : 'rgba(13,13,13,.28)', boxShadow: on ? '0 0 0 4px rgba(227,10,46,.18)' : 'none', transition: 'all .25s' } }; })
    };
    return {
      ...story,
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
      igPosts: IG_POSTS.map((id, k) => ({ embed: 'https://www.instagram.com/' + id + '/embed/', poster: IG_POSTERS[k] ? U(IG_POSTERS[k]) : IG_PH, loaded: () => !(this.state.igOk || {})[k] && this.setState(s => ({ igOk: { ...(s.igOk || {}), [k]: true } })), style: { opacity: (this.state.igOk || {})[k] ? 1 : 0, transition: 'opacity .6s ease', position: 'absolute', border: 0, background: 'transparent', pointerEvents: 'none', ...IG_CROP[id.split('/')[0]] } })),
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
      need: (() => { const n = NEED_NAMES[this.state.need]; const m = this.byName(n[1]) || { id: null, name: n[1].replace(/\b\w/g, c => c.toUpperCase()).replace('20fit', '20FIT'), price: 0, imgs: photosFor({ name: n[1] }) }; return { kind: n[0], name: m.name, price: m.id ? rp(m.price) : '', open: () => m.id && this.setState({ sel: m.id }), imgStyle: { width: 64, height: 64, flexShrink: 0, borderRadius: 14, backgroundColor: '#e8e6e1', backgroundImage: 'url("' + this.src(m.imgs[0]) + '")', backgroundSize: 'cover', backgroundPosition: 'center' } }; })(),
      needCardStyle: { all: 'unset', cursor: 'pointer', position: 'absolute', left: '-6%', bottom: '4%', zIndex: 3, display: 'flex', alignItems: 'center', gap: 12, padding: 10, paddingRight: 18, borderRadius: 20, background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.95)', boxShadow: '0 20px 50px rgba(13,13,13,.18)', maxWidth: 300, transform: 'translate(' + (this.state.hx * -22) + 'px,' + (this.state.hyM * -18) + 'px)', transition: 'transform .3s ease-out' },
      heroMediaStyle: { position: 'relative', zIndex: 1, height: 'clamp(520px, 74vh, 720px)', aspectRatio: this.props.heroVideo ? (this.state.vAR || '9/16') : '4/5', maxWidth: '100%', borderRadius: 28, overflow: 'hidden', background: 'linear-gradient(90deg,#e7e6e3 0%,#f3f2f0 45%,#e7e6e3 90%) 0 0/220% 100%', animation: 'skMove 1.25s ease-in-out infinite', boxShadow: '0 40px 90px rgba(13,13,13,.28), 0 0 0 1px rgba(255,255,255,.6) inset', transform: 'translateY(' + (this.state.hy * -0.1) + 'px)', willChange: 'transform' },
      heroDrinks: NEED_NAMES.map(([kind, nm], i) => { const m = this.byName(nm) || { id: null, name: nm.replace(/\b\w/g, c => c.toUpperCase()).replace('20fit', '20FIT'), imgs: photosFor({ name: nm }) }; const y = this.state.hy * (0.05 + i * 0.05), on = this.state.heroIn;
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
