
const rp = n => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID');
const API = () => window.CafeApi;
const defaultOpts = m => (m.addons || []).map(g => { const d = (g.options || []).find(o => o.default) || null; return d ? d.id : null; }).filter(Boolean);
const lineKey = (id, opts) => id + (opts && opts.length ? '~' + opts.slice().sort().join(',') : '');
const optsPrice = (m, opts) => (m.addons || []).reduce((a, g) => a + (g.options || []).filter(o => (opts || []).includes(o.id)).reduce((b, o) => b + (Number(o.price) || 0), 0), 0);
const optsLabel = (m, opts) => (m.addons || []).map(g => { const o = (g.options || []).find(x => (opts || []).includes(x.id)); return o && !o.default ? o.label : null; }).filter(Boolean).join(' · ');
const SESSION_ID = { 'Morning 08–12': 'morning', 'Afternoon 13–17': 'afternoon', 'Evening 18–22': 'evening' };
const SESSIONS = ['Morning 08–12', 'Afternoon 13–17', 'Evening 18–22'];
const EVENTS = ['Birthday', 'Meeting', 'Community', 'Workshop'];
const DEALS = [
  { id: 'v50', tag: 'Voucher', title: 'Pay Rp50.000, get Rp60.000', desc: 'Use on any food and drinks', price: 50000, worth: 60000 },
  { id: 'v100', tag: 'Best value', title: 'Pay Rp100.000, get Rp125.000', desc: 'Use on any food and drinks', price: 100000, worth: 125000 },
  { id: 'duo', tag: 'Bundle', title: 'Coffee + pastry', desc: 'Any coffee with any pastry', price: 45000, worth: 58000 },
  { id: 'squad', tag: 'Group', title: 'Squad of 4 drinks', desc: '4 drinks of your choice', price: 110000, worth: 136000 }
];
const METHODS = [
  { id: 'qris', label: 'QRIS', desc: 'Scan with any bank or e-wallet', qr: true, logos: ['qris'] },
  { id: 'ewallet', label: 'GoPay / OVO / ShopeePay', desc: 'Continue in your e-wallet app', qr: true, logos: ['gopay', 'ovo', 'shopeepay'] },
  { id: 'credit', label: 'Credit Card', desc: 'Visa, Mastercard, JCB', logos: ['visamc'] },
  { id: 'debit', label: 'Debit Card', desc: 'GPN, Visa Debit', logos: ['gpn', 'visa'] },
  { id: 'va', label: 'Virtual Account', desc: 'BCA, Mandiri, BNI, BRI', logos: ['bca', 'mandiri', 'bni', 'bri'] }
];
const LOGO_ALT = { qris: 'QRIS', gopay: 'GoPay', ovo: 'OVO', shopeepay: 'ShopeePay', visa: 'Visa', visamc: 'Visa, Mastercard', mastercard: 'Mastercard', jcb: 'JCB', gpn: 'GPN', bca: 'BCA', mandiri: 'Mandiri', bni: 'BNI', bri: 'BRI' };
// Real brand marks where we have them (self-hosted in /logos, same files as the calorie app); the rest keep the lettermark SVGs.
const LOGO_SRC = { qris: 'logos/qris.png', bca: 'logos/bca.png', bni: 'logos/bni.png', bri: 'logos/bri.png', mandiri: 'logos/mandiri.webp', visamc: 'logos/visa-mastercard.webp' };
const logoSrc = k => LOGO_SRC[k] || ('logos/' + k + '.svg');
const QR_SECONDS = 120;
const okName = v => v.trim().length >= 2;
const okEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const okPhone = v => /^(\+?62|0)8\d{7,12}$/.test(v.replace(/[\s-]/g, ''));
const chip = on => ({ all: 'unset', cursor: 'pointer', padding: '10px 16px', borderRadius: 999, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', background: on ? '#0d0d0d' : '#fff', color: on ? '#fff' : '#0d0d0d', border: '1px solid ' + (on ? '#0d0d0d' : 'rgba(13,13,13,.12)') });
const card = on => ({ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, padding: 16, borderRadius: 20, background: '#fff', border: '2px solid ' + (on ? '#e30a2e' : 'rgba(13,13,13,.08)') });
const dot = (done, active) => ({ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13, background: done ? '#e30a2e' : active ? '#0d0d0d' : '#f1f0ed', color: done || active ? '#fff' : '#8a8a8a', transition: 'background .3s' });
const pill = (bg, fg) => ({ padding: '6px 12px', borderRadius: 999, background: bg, color: fg, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 });
const makeQr = (size, seed) => React.createElement('div', { style: { width: size, height: size, display: 'grid', gridTemplateColumns: 'repeat(21,1fr)' } },
  Array.from({ length: 441 }, (_, i) => { const x = i % 21, y = Math.floor(i / 21); const inF = (a, b) => a >= 0 && a < 7 && b >= 0 && b < 7; const fx = inF(x, y) ? [x, y] : inF(x - 14, y) ? [x - 14, y] : inF(x, y - 14) ? [x, y - 14] : null;
    const on = fx ? (fx[0] === 0 || fx[0] === 6 || fx[1] === 0 || fx[1] === 6 || (fx[0] >= 2 && fx[0] <= 4 && fx[1] >= 2 && fx[1] <= 4)) : ((x * 7 + y * 13 + x * y + seed) % 3 === 0);
    return React.createElement('div', { key: i, style: { background: on ? '#0d0d0d' : 'transparent' } }); }));

class Component extends DCLogic {
  state = { step: 'mode', mode: null, cart: {}, cat: 'All', fulfil: 'pickup', name: '', address: '', note: '', deals: {}, pax: 2, dayI: 0, slot: '', date: '', session: SESSIONS[1], event: 'Birthday', guests: 20, refresh: true, pay: 'qris', email: '', phone: '', qrEnd: 0, now: 0, qrSeed: 1, code: '', token: '', cfg: null, avail: {}, created: null, live: null, busy: false, err: '', rateMsg: 'You can also rate later from Purchase History.' };
  componentDidMount() {
    document.body.style.overflow = 'hidden';
    try { history.pushState({ order: 1 }, '', '#order'); } catch (e) {}
    this._pop = () => { if (this._closing) return; this._popped = true; this.finish(); }; window.addEventListener('popstate', this._pop);
    const cart = {}; (this.props.items || []).forEach(i => { cart[i.key || lineKey(i.id, i.opts)] = { id: i.id, opts: i.opts || [], qty: i.qty }; });
    API().getConfig().then(cfg => { this.setState(s => ({ cfg, slot: s.slot || (cfg.slots || [])[0] || '' })); this.loadAvail(this.state.dayI); }).catch(e => this.setState({ err: e.message }));
    const m = this.props.startMode, sub = this.props.startSub, has = Object.keys(cart).length > 0;
    const next = { cart };
    if (m === 'venue') Object.assign(next, { mode: 'venue', step: 'venue' });
    else if (m === 'delivery') Object.assign(next, { mode: 'take', fulfil: 'delivery', step: has ? 'confirm' : 'menu' });
    else if (m === 'take' || (m === 'dine' && sub === 'takeaway')) Object.assign(next, { mode: 'take', step: has ? 'confirm' : 'menu' });
    else if (m === 'dine') Object.assign(next, { mode: 'dine', step: 'visit' });
    this.setState(next);
  }
  componentWillUnmount() { (this._ts || []).forEach(clearTimeout); clearInterval(this._qi); clearInterval(this._wi); this.stopLive(); window.removeEventListener('popstate', this._pop); document.body.style.overflow = ''; }
  later(fn, ms) { (this._ts = this._ts || []).push(setTimeout(fn, ms)); }
  dayText() { const d = new Date(); d.setDate(d.getDate() + (this.state.dayI || 0)); return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); }
  menu() { return this.props.menu || []; }
  item(id) { return this.menu().find(x => x.id === id) || null; }
  cartLines() { return Object.entries(this.state.cart).filter(([, l]) => l && l.qty > 0 && this.item(l.id)).map(([key, l]) => { const m = this.item(l.id); return { key, id: l.id, opts: l.opts || [], qty: l.qty, name: m.name, optLabel: optsLabel(m, l.opts), price: m.price + optsPrice(m, l.opts), base: (m.base != null ? m.base : m.price) + optsPrice(m, l.opts) }; }); }
  qtyOf(id) { return this.cartLines().filter(l => l.id === id).reduce((a, l) => a + l.qty, 0); }
  incItem(m) { if (!m.available) return; const o = defaultOpts(m), k = lineKey(m.id, o); this.setState(s => ({ cart: { ...s.cart, [k]: { id: m.id, opts: o, qty: ((s.cart[k] || {}).qty || 0) + 1 } } })); }
  decItem(m) { const lines = this.cartLines().filter(l => l.id === m.id); const d = lines.find(l => l.key === lineKey(m.id, defaultOpts(m))) || lines[lines.length - 1]; if (!d) return; this.setState(s => ({ cart: { ...s.cart, [d.key]: { ...s.cart[d.key], qty: Math.max(0, s.cart[d.key].qty - 1) } } })); }
  loadAvail(dayI) { const date = API().ymd(dayI); API().tableAvailabilityDay(date).then(list => this.setState(s => ({ avail: { ...s.avail, [date]: list || [] } }))).catch(() => {}); }
  // tables left of the size this party needs, at `slot` (null while still loading, 0 if no table fits)
  remaining(slot) {
    const list = this.state.avail[API().ymd(this.state.dayI)]; if (!list) return null;
    const row = list.find(x => x.slot === slot); if (!row) return 0;
    const cap = API().capForPax(this.state.pax, this.state.cfg); if (cap == null) return 0;
    const size = (row.sizes || []).find(z => z.capacity === cap); return size ? size.left : 0;
  }
  // largest party a single table can seat (from the web config size map; no merge in v1)
  maxPartyPax() { const map = (this.state.cfg && this.state.cfg.table_size_map) || '2:2,4:4,10:10'; return Math.max.apply(null, map.replace(/\s/g, '').split(',').map(p => Number(p.split(':')[0]) || 0)); }
  dealLines() { return DEALS.filter(d => this.state.deals[d.id] > 0).map(d => ({ ...d, qty: this.state.deals[d.id] })); }
  bill() {
    const s = this.state, cfg = s.cfg || {}, lines = [];
    if (s.created) { const c = s.created; [['Subtotal', c.subtotal], ['Service', c.service_charge], ['PB1 ' + (cfg.tax_percent != null ? cfg.tax_percent + '%' : ''), c.ppn], ['Delivery fee', c.delivery_fee]].forEach(([k, v]) => { if (k === 'Subtotal' || Number(v) > 0) lines.push({ label: k.trim(), value: rp(v) }); }); return { lines, total: Number(c.total) || 0, estimate: false }; }
    if (s.mode !== 'dine' && s.mode !== 'take') return { lines, total: 0, estimate: true };
    this.cartLines().forEach(i => lines.push({ label: i.qty + '× ' + i.name + (i.optLabel ? ' (' + i.optLabel + ')' : ''), value: rp(i.base * i.qty) }));
    const sub = this.cartLines().reduce((a, i) => a + i.base * i.qty, 0);
    const svc = Math.round(sub * (Number(cfg.service_percent) || 0) / 100), tax = Math.round((sub + svc) * (Number(cfg.tax_percent) || 0) / 100);
    const del = s.mode === 'take' && s.fulfil === 'delivery' ? Number(cfg.delivery_fee) || 0 : 0;
    if (svc) lines.push({ label: 'Service ' + cfg.service_percent + '%', value: rp(svc) });
    if (cfg.tax_percent != null) lines.push({ label: 'PB1 ' + cfg.tax_percent + '%', value: rp(tax) });
    if (del) lines.push({ label: 'Delivery fee', value: rp(del) });
    return { lines, total: sub + svc + tax + del, estimate: true };
  }
  startQr() {
    clearInterval(this._qi);
    const now = Date.now();
    this.setState(s => ({ step: 'qr', qrEnd: now + QR_SECONDS * 1000, now, qrSeed: (s.qrSeed || 1) + 1 }));
    this._qi = setInterval(() => { if (this.state.step !== 'qr') { clearInterval(this._qi); return; } this.setState({ now: Date.now() }); if (Date.now() >= this.state.qrEnd) clearInterval(this._qi); }, 1000);
  }
  payload() {
    const s = this.state, type = s.mode === 'dine' ? 'dine_in' : s.fulfil === 'delivery' ? 'delivery' : 'pickup';
    const p = { order_type: type, customer_name: s.name.trim(), customer_phone: s.phone.replace(/[\s-]/g, ''), customer_email: s.email.trim(), notes: '', payment_method: s.pay,
      items: this.cartLines().map(l => ({ menu_id: l.id, qty: l.qty, addon_option_ids: l.opts, note: '' })) };
    if (type === 'delivery') { p.delivery_address = s.address.trim(); p.driver_note = s.note.trim(); }
    if (type === 'dine_in') { p.reservation_date = API().ymd(s.dayI); p.reservation_slot = s.slot; p.pax = s.pax; }
    return p;
  }
  createOrder() {
    if (this.state.busy) return;
    const method = METHODS.find(m => m.id === this.state.pay);
    this.setState({ busy: true, err: '' });
    API().createOrder(this.payload()).then(res => {
      this.setState({ busy: false, created: res, code: res.code, token: res.access_token });
      if (this.props.onPaid) this.props.onPaid(); // history picks up the new ref right away
      this.startLive();
      if (method.qr) this.startQr(); else this.startWait();
    }).catch(e => this.setState({ busy: false, err: e.message || 'Could not create your order' }));
  }
  startLive() {
    this.stopLive();
    const t = this.state.token; if (!t) return;
    this._unwatch = API().watch(t, () => this.fetchLive());
    this._lpAt = 0;
    this._lp = setInterval(() => { const waiting = ['qr', 'wait'].includes(this.state.step); if (waiting || Date.now() - this._lpAt > 20000) this.fetchLive(); }, 4000);  // fast while waiting for the cafe
    this._vis = () => { if (document.visibilityState === 'visible') this.fetchLive(); }; document.addEventListener('visibilitychange', this._vis);
    this.fetchLive();
  }
  // 'Waiting for the cafe' screen: a running timer, and after 45s a WhatsApp nudge to the cafe with the order code
  startWait() {
    clearInterval(this._wi); this._w0 = Date.now(); this.setState({ step: 'wait', now: Date.now() });
    this._wi = setInterval(() => { if (this.state.step !== 'wait') { clearInterval(this._wi); return; } this.setState({ now: Date.now() }); }, 1000);
  }
  nudgeUrl() {
    const s = this.state, n = String((s.cfg && s.cfg.wa_number) || this.props.waNumber || '').replace(/\D/g, '');
    const amt = s.live && s.live.total != null ? ' (' + rp(s.live.total) + ')' : '';
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent('Hi 20FIT Cafe, I have paid for order ' + s.code + amt + '. Could you please confirm my payment? Thank you!');
  }
  stopLive() { this._unwatch && this._unwatch(); this._unwatch = null; clearInterval(this._lp); if (this._vis) document.removeEventListener('visibilitychange', this._vis); }
  fetchLive() {
    const { code, token } = this.state; if (!code || !token) return;
    this._lpAt = Date.now();
    (this.state.mode === 'venue' ? API().getMyOrders().then(l => l.find(o => o.code === code)) : API().getOrder(code, token)).then(o => {
      if (!o) return;
      const next = { live: o };
      if (o.kind !== 'venue' && o.payment_status === 'paid' && ['qr', 'wait'].includes(this.state.step)) { next.step = 'done'; clearInterval(this._qi); }
      this.setState(next);
    }).catch(() => {});
  }
  waText() { const s = this.state; return ['Hi 20FIT Cafe, I would like to book the venue.', '', 'Name: ' + s.name.trim(), 'Date: ' + (s.date || '-'), 'Session: ' + s.session, 'Event: ' + s.event, 'Guests: ' + s.guests + ' people', 'Package: ' + (s.refresh ? 'With refreshments & pastries' : 'Venue only'), '', 'Ref: ' + (s.code || '')].join('\n'); }
  waUrl() { const n = String((this.state.cfg && this.state.cfg.wa_number) || this.props.waNumber || '').replace(/\D/g, ''); return 'https://wa.me/' + n + '?text=' + encodeURIComponent(this.waText()); }
  sendWa() {
    if (this.state.busy) return;
    const s = this.state, w = window.open('', '_blank'); // open now (user gesture), point it at WhatsApp once we have the code
    this.setState({ busy: true, err: '' });
    API().createVenue({ event_date: s.date, session: SESSION_ID[s.session] || 'afternoon', event_type: s.event.toLowerCase(), guests: s.guests, package: s.refresh ? 'with_refreshments' : 'venue_only', customer_name: s.name.trim(), customer_phone: s.phone.replace(/[\s-]/g, '') })
      .then(res => {
        this.setState({ busy: false, code: res.code, token: res.access_token, created: { est_price: res.est_price }, step: 'done' }, () => {
          if (w) w.location.href = this.waUrl(); else window.open(this.waUrl(), '_blank', 'noopener');
          if (this.props.onPaid) this.props.onPaid();
          this.startLive();
        });
      })
      .catch(e => { if (w) w.close(); this.setState({ busy: false, err: e.message || 'Could not send your request' }); });
  }
  sendRating(food, service, comment) {
    if (!food || !service || !this.state.code) return;
    clearTimeout(this._rt);
    this._rt = setTimeout(() => API().rate(this.state.code, food, service, comment).then(() => this.setState({ rateMsg: 'Thanks, your rating is saved.' })).catch(e => this.setState({ rateMsg: e.message })), 600);
  }
  finish() {
    if (this._closing) return; this._closing = true;
    this.stopLive(); clearInterval(this._qi);
    if (this.state.code && this.props.onPaid) this.props.onPaid();
    if (!this._popped && location.hash === '#order') { try { history.back(); } catch (e) {} }
    this.props.onClose && this.props.onClose();
  }
  prev() { const s = this.state; return { visit: 'mode', menu: s.mode === 'dine' ? 'visit' : 'mode', confirm: 'menu', venue: 'mode', pay: s.mode === 'dine' ? 'menu' : 'confirm', }[s.step]; }
  setQty(key, id, d) { this.setState(s => ({ [key]: { ...s[key], [id]: Math.max(0, (s[key][id] || 0) + d) } })); }

  renderVals() {
    const s = this.state, { lines, total, estimate } = this.bill(), cfg = s.cfg || {}, live = s.live, A = API();
    const method = METHODS.find(m => m.id === s.pay);
    const cartN = this.cartLines().reduce((a, i) => a + i.qty, 0);
    const cartSum = this.cartLines().reduce((a, i) => a + i.price * i.qty, 0);
    const vNameOk = okName(s.name), vPhoneOk = okPhone(s.phone), slotRem = this.remaining(s.slot), slotOk = !!s.slot && (slotRem === null || slotRem >= 1);
    const groupMin = s.mode === 'dine' && s.pax >= (Number(cfg.group_threshold) || 5) ? (Number(cfg.group_min_orders) || 3) : 0;
    const needMore = groupMin && cartN < groupMin ? groupMin - cartN : 0;
    const paid = !!live && live.payment_status === 'paid', st = A.status(live);
    const titles = { mode: ['Order', 'How would you like it?'], visit: ['Dine-in', 'Reserve your table'], menu: [s.mode === 'dine' ? 'Dine-in' : 'Takeaway', s.mode === 'dine' ? 'Order ahead' : 'What would you like?'], confirm: ['Takeaway', 'Confirm order'], venue: ['Book venue', 'Event details'], pay: ['Payment', 'Confirm & pay'], qr: [method.label, 'Complete your payment'], wait: ['Payment', 'Waiting for confirmation'], done: ['Order', s.mode === 'venue' ? 'Request sent' : 'Confirmed'] };
    const nameOk = okName(s.name), emailOk = okEmail(s.email), phoneOk = okPhone(s.phone), detailsOk = nameOk && emailOk && phoneOk;
    const qrLeft = s.step === 'qr' ? Math.max(0, Math.ceil((s.qrEnd - (s.now || Date.now())) / 1000)) : QR_SECONDS;
    const qrExpired = s.step === 'qr' && qrLeft === 0;
    const ctas = {
      visit: [slotOk ? 'Continue to menu' : 'Pick an available time', () => this.setState({ step: 'menu' }), !slotOk],
      menu: [needMore ? 'Group of ' + s.pax + ' needs ' + groupMin + ' orders · add ' + needMore + ' more' : (cartN ? 'Continue · ' + cartN + ' item' + (cartN > 1 ? 's' : '') + ' · ' + rp(cartSum) : 'Add something to continue'), () => this.setState({ step: s.mode === 'dine' ? 'pay' : 'confirm' }), !cartN || !!needMore],
      confirm: ['Confirm order', () => this.setState({ step: 'pay' }), s.fulfil === 'pickup' ? !s.name.trim() : !s.address.trim()],
      venue: [s.busy ? 'Sending…' : 'Continue on WhatsApp', () => this.sendWa(), !s.date || !vNameOk || !vPhoneOk || s.busy],
      pay: [s.busy ? 'Creating your order…' : detailsOk ? 'Pay ' + rp(total) : 'Fill in your details to pay', () => this.createOrder(), !detailsOk || s.busy || cfg.ordering_open === false],
      qr: qrExpired ? ['Generate new QR', () => this.startQr(), false] : ['I have paid', () => { clearInterval(this._qi); this.startWait(); this.fetchLive(); }, false],
      done: ['Done', () => this.finish(), false]
    };
    const cta = ctas[s.step];
    const delivery = s.fulfil === 'delivery';
    const tr = live && live.kind !== 'venue' && live.type !== 'dine_in' ? A.trackSteps(live) : { steps: [], idx: -1 };
    const last = tr.steps.length - 1;
    const prog = delivery ? ({ driver_picked_up: 0.25, on_the_way: 0.6, completed: 1 })[live && live.status] || 0 : 0;
    const vst = (live && live.status) || 'new', vS = [['Request sent', 'Your booking details are with us'], ['Contacted', 'Our team reached out on WhatsApp'], ['Confirmed', 'Date and setup approved'], ['Completed', 'Thanks for celebrating with us']];
    const vRank = { new: 0, contacted: 1, confirmed: 2, completed: 3, cancelled: -1 }[vst], vDone = vS.map((_, i) => vRank >= i);
    const cats = ['All'].concat([...new Set(this.menu().map(m => m.cat))]);
    const errMsg = s.err || (cfg.ordering_open === false && s.mode !== 'venue' ? 'Online ordering is currently closed' : '');
    return {
      close: () => this.finish(), stop: e => e.stopPropagation(),
      tabsTop: [['Dine-in', 'dine', 'visit'], ['Takeaway', 'take', 'menu'], ['Book venue', 'venue', 'venue']].map(([label, mode, step]) => { const on = s.mode === mode; const locked = ['wait', 'done', 'qr'].includes(s.step) || !!s.created;
        return { label, pick: () => !locked && this.setState({ mode, step: mode === 'take' && Object.keys(s.cart).length ? 'confirm' : step }), style: { all: 'unset', cursor: locked ? 'default' : 'pointer', padding: '9px 16px', borderRadius: 999, whiteSpace: 'nowrap', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: '.03em', textTransform: 'uppercase', background: on ? '#0d0d0d' : 'transparent', color: on ? '#fff' : '#3a3a3a', opacity: locked && !on ? .4 : 1 } }; }),
      progress: (() => { const flow = s.mode === 'dine' ? ['visit', 'menu', 'pay', 'done'] : s.mode === 'take' ? ['menu', 'confirm', 'pay', 'done'] : s.mode === 'venue' ? ['venue', 'done'] : ['mode']; const stp = s.step === 'qr' || s.step === 'wait' ? 'pay' : s.step; const idx = flow.indexOf(stp);
        return flow.map((_, i) => ({ flex: 1, height: 4, borderRadius: 2, background: i <= idx ? '#e30a2e' : 'rgba(13,13,13,.12)', transition: 'background .3s' })); })(),
      canBack: !!this.prev(), back: () => this.setState({ step: this.prev() }),
      kicker: titles[s.step][0], title: titles[s.step][1],
      isMode: s.step === 'mode', isDeals: s.step === 'deals', isVisit: s.step === 'visit', isMenu: s.step === 'menu', isConfirm: s.step === 'confirm', isVenue: s.step === 'venue', isPay: s.step === 'pay', isQr: s.step === 'qr', isProc: s.step === 'wait', isDone: s.step === 'done',
      modes: [
        { badge: 'DI', label: 'Dine-in', desc: 'Reserve a table and order ahead', pick: () => this.setState({ mode: 'dine', step: 'visit' }) },
        { badge: 'TA', label: 'Takeaway', desc: 'Order now, pick it up or get it delivered', pick: () => this.setState({ mode: 'take', step: Object.keys(s.cart).length ? 'confirm' : 'menu' }) },
        { badge: 'EV', label: 'Book venue', desc: 'Reserve the cafe for your event', pick: () => this.setState({ mode: 'venue', step: 'venue' }) }
      ],
      deals: DEALS.map(d => { const q = s.deals[d.id] || 0; return { ...d, qty: q, priceFmt: rp(d.price), worthFmt: rp(d.worth), pick: () => this.setQty('deals', d.id, q ? 0 : 1), inc: () => this.setQty('deals', d.id, 1), dec: () => this.setQty('deals', d.id, -1),
        style: { display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, background: '#fff', border: '2px solid ' + (q ? '#e30a2e' : 'rgba(13,13,13,.08)') } }; }),
      pax: s.pax, paxDown: () => this.setState({ pax: Math.max(1, s.pax - 1) }), paxUp: () => this.setState({ pax: Math.min(this.maxPartyPax(), s.pax + 1) }),
      days: Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); const on = s.dayI === i;
        return { top: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-GB', { weekday: 'short' }), num: d.getDate(), mon: d.toLocaleDateString('en-GB', { month: 'short' }), pick: () => { this.setState({ dayI: i }); this.loadAvail(i); },
          style: { all: 'unset', cursor: 'pointer', flexShrink: 0, width: 64, padding: '10px 0', borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: on ? '#0d0d0d' : '#fff', color: on ? '#fff' : '#0d0d0d', border: '1px solid ' + (on ? '#0d0d0d' : 'rgba(13,13,13,.12)') } }; }),
      dayLabel: this.dayText(),
      slots: (cfg.slots || []).map(t => { const r = this.remaining(t), full = r !== null && r < 1; return { label: t + (full ? ' · Full' : (r !== null && r <= 2 ? ' · ' + r + ' left' : '')), pick: () => !full && this.setState({ slot: t }), style: { ...chip(s.slot === t && !full), opacity: full ? .4 : 1, cursor: full ? 'not-allowed' : 'pointer' } }; }),
      cats: cats.map(c => ({ label: c, pick: () => this.setState({ cat: c }), style: chip(s.cat === c) })),
      pageStyle: { maxWidth: s.step === 'menu' ? 1240 : 720, margin: '0 auto', padding: '32px 24px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 72px)' },
      menuSections: [...new Set(this.menu().map(m => m.cat))].filter(c => s.cat === 'All' || c === s.cat).map(c => { const items = this.menu().filter(m => m.cat === c).map(m => { const q = this.qtyOf(m.id); return { name: m.name, priceFmt: m.available ? rp(m.price) : 'Sold out', qty: q, none: !q, some: q > 0, inc: () => this.incItem(m), dec: () => this.decItem(m), addLabel: m.available ? '+ Add' : 'Sold out', addStyle: { all: 'unset', boxSizing: 'border-box', cursor: m.available ? 'pointer' : 'not-allowed', width: '100%', textAlign: 'center', padding: 10, borderRadius: 999, background: m.available ? '#0d0d0d' : '#c9c7c2', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 16, textTransform: 'uppercase' },
        thumb: { display: 'block', aspectRatio: '1', backgroundColor: '#eceae5', backgroundImage: 'url("' + m.src + '")', backgroundSize: 'cover', backgroundPosition: 'center' } }; }); return { cat: c, count: items.length + ' items', items }; }),
      menuRows: this.menu().filter(m => s.cat === 'All' || m.cat === s.cat).map(m => { const q = this.qtyOf(m.id); return { name: m.name, priceFmt: rp(m.price), qty: q, none: !q, some: q > 0, inc: () => this.incItem(m), dec: () => this.decItem(m),
        thumb: { width: 56, height: 56, flexShrink: 0, borderRadius: 14, backgroundColor: '#eceae5', backgroundImage: 'url("' + m.src + '")', backgroundSize: 'cover', backgroundPosition: 'center' } }; }),
      orderLines: this.cartLines().map(i => ({ label: i.qty + '× ' + i.name + (i.optLabel ? ' (' + i.optLabel + ')' : ''), value: rp(i.price * i.qty) })), editOrder: () => this.setState({ step: 'menu' }),
      fulfils: [['pickup', 'Pick up myself', 'Collect at the counter'], ['delivery', 'Delivery', 'Track your driver live']].map(([id, label, desc]) => ({ label, desc, pick: () => this.setState({ fulfil: id }), style: card(s.fulfil === id) })),
      isPickup: s.fulfil === 'pickup', isDeliv: delivery,
      name: s.name, setName: e => this.setState({ name: e.target.value }),
      address: s.address, note: s.note, setAddress: e => this.setState({ address: e.target.value }), setNote: e => this.setState({ note: e.target.value }),
      guests: s.guests, guestDown: () => this.setState({ guests: Math.max(10, s.guests - 5) }), guestUp: () => this.setState({ guests: Math.min(60, s.guests + 5) }),
      date: s.date, setDate: e => this.setState({ date: e.target.value }),
      sessions: SESSIONS.map(t => ({ label: t, pick: () => this.setState({ session: t }), style: chip(s.session === t) })),
      events: EVENTS.map(t => ({ label: t, pick: () => this.setState({ event: t }), style: chip(s.event === t) })),
      refreshOpts: [[true, 'With refreshments', 'Drinks + pastries, ' + rp(cfg.venue_refresh_price || 0) + ' / person'], [false, 'Venue only', 'Order at the bar during the event']].map(([v, label, desc]) => ({ label, desc, pick: () => this.setState({ refresh: v }), style: card(s.refresh === v) })),
      waitElapsed: (() => { const t = Math.max(0, Math.floor(((s.now || Date.now()) - (this._w0 || Date.now())) / 1000)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); })(),
      waitNudge: s.step === 'wait' && !(live && (live.payment_status === 'expired' || live.payment_status === 'failed')) && (s.now || 0) - (this._w0 || Date.now()) >= 45000,
      openNudge: () => window.open(this.nudgeUrl(), '_blank', 'noopener'),
      lines, totalFmt: rp(total), totalLabel: estimate ? 'Estimated total' : 'Total', payLabel: method.label, code: s.code,
      hasErr: !!errMsg, errMsg, vNameErr: s.name && !vNameOk ? 'Please enter your name' : '', vPhoneErr: s.phone && !vPhoneOk ? 'Please enter a valid WhatsApp number, e.g. 0812xxxxxxx' : '',
      waitTitle: live && (live.payment_status === 'expired' || live.payment_status === 'failed') ? st.pill : 'Waiting for the cafe to confirm your payment', waitSub: live && (live.payment_status === 'expired' || live.payment_status === 'failed') ? 'Please start a new order or contact the cafe.' : 'This page updates automatically. You can close it; your order stays in Purchase History · ' + s.code,
      email: s.email, phone: s.phone,
      setEmail: e => this.setState({ email: e.target.value }), setPhone: e => this.setState({ phone: e.target.value }),
      nameErr: s.name && !nameOk ? 'Please enter your name' : '', emailErr: s.email && !emailOk ? 'Please enter a valid email, e.g. name@email.com' : '', phoneErr: s.phone && !phoneOk ? 'Please enter a valid phone number, e.g. 0812xxxxxxx' : '',
      payLocked: !detailsOk, methodsWrap: { display: 'flex', flexDirection: 'column', gap: 10, opacity: detailsOk ? 1 : .45, pointerEvents: detailsOk ? 'auto' : 'none', transition: 'opacity .25s' },
      qrTimer: String(Math.floor(qrLeft / 60)).padStart(2, '0') + ':' + String(qrLeft % 60).padStart(2, '0'), qrExpired, qrActive: !qrExpired,
      qrBar: { height: '100%', borderRadius: 3, background: qrLeft <= 30 ? '#e30a2e' : '#0d0d0d', width: (qrLeft / QR_SECONDS * 100) + '%', transition: 'width 1s linear, background .3s' },
      qrBoxStyle: { padding: 16, borderRadius: 24, background: '#fff', border: '1px solid rgba(13,13,13,.08)', opacity: qrExpired ? .25 : 1, filter: qrExpired ? 'blur(2px)' : 'none', transition: 'opacity .3s' },
      methods: METHODS.map(m => ({ label: m.label, desc: m.desc, pick: () => this.setState({ pay: m.id }),
        logos: m.logos.map(k => ({ src: logoSrc(k), alt: LOGO_ALT[k] })),
        ring: s.pay === m.id
          ? { width: 22, height: 22, borderRadius: '50%', boxSizing: 'border-box', flexShrink: 0, border: '2px solid #e30a2e', background: 'radial-gradient(circle, #e30a2e 0 5px, transparent 5px)' }
          : { width: 22, height: 22, borderRadius: '50%', boxSizing: 'border-box', flexShrink: 0, border: '2px solid #8c897e', background: '#fff' },
        style: { all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 18, background: '#fff', border: '1px solid ' + (s.pay === m.id ? '#e30a2e' : 'rgba(13,13,13,.1)'), boxShadow: s.pay === m.id ? '0 0 0 4px rgba(227,10,46,.08)' : 'none', transition: 'border-color .2s, box-shadow .2s' } })),
      qr: s.step === 'qr' ? makeQr(200, s.qrSeed || 1) : null,
      doneTitle: s.mode === 'venue' ? 'Request sent' : 'Payment Successful', doneSub: s.mode === 'venue' ? 'Continue on WhatsApp · ' + s.code : rp((live && live.total) || total) + ' · ' + method.label + ' · ' + s.code, waUrl: this.waUrl(),
      doneDine: s.mode === 'dine', doneTrack: s.mode === 'take', doneVenue: s.mode === 'venue',
      voucherTitle: 'Table for ' + ((live && live.pax) || s.pax),
      dineItems: ((live && live.items) || []).map(i => i.qty + '× ' + i.name).join(', '),
      visitLabel: (live ? A.dayLabel(live.reservation_date) + ' at ' + (live.reservation_slot || '') : this.dayText() + ' at ' + s.slot) + ' · Table held 15 min',
      voucherStatus: st.pill || 'Booked', voucherPill: A.pillStyle(st),
      voucherNote: live && live.status === 'checked_in' ? 'Checked in at ' + A.time(live.checked_in_at) + (live.checked_in_by ? ' by ' + live.checked_in_by : '') + '. Your order will be served at your table.' : 'When you arrive, come to the barista counter and show this QR or booking code. The barista checks you in and your order is served at your table.',
      qrSmall: s.mode === 'dine' && s.step === 'done' && s.code ? React.createElement('div', { style: { width: 96, height: 96 }, dangerouslySetInnerHTML: { __html: A.qrSvg(s.code, 96) } }) : null,
      canRedeem: false,  // guests are checked in by the barista only redeem: () => A.arrived(s.code).then(() => this.fetchLive()).catch(e => this.setState({ err: e.message })),
      trackHead: st.pill || 'Track your order',
      eta: live ? A.time(live.updated_at) : '',
      isDelivDone: delivery, isPickDone: !delivery, hasDriver: delivery && !!(live && live.driver_name),
      driverName: (live && live.driver_name) || '', driverInfo: live ? [live.driver_vehicle, live.driver_plate].filter(Boolean).join(' · ') : '', driverInitials: String((live && live.driver_name) || '').split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase(),
      routeFill: { position: 'absolute', left: '12%', top: '50%', height: 4, marginTop: -2, borderRadius: 2, background: '#e30a2e', width: (76 * prog) + '%', transition: 'width 2.5s ease' },
      rider: { position: 'absolute', left: (12 + 76 * prog) + '%', top: '50%', transform: 'translate(-50%,-50%)', width: 34, height: 34, borderRadius: '50%', background: '#0d0d0d', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 13, boxShadow: '0 6px 16px rgba(13,13,13,.3)', transition: 'left 2.5s ease', animation: live && live.status === 'on_the_way' ? 'cBob .6s ease-in-out infinite' : 'none' },
      riderInitial: live && live.driver_name ? String(live.driver_name).split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase() : '…',
      track: tr.steps.map(([, t, d], i) => { const done = tr.idx > i || tr.idx === last, active = tr.idx === i && i !== last; return { t, d, mark: done ? '✓' : String(i + 1), dot: dot(done, active), titleStyle: { fontWeight: 700, fontSize: 15, color: done || active ? '#0d0d0d' : '#8a8a8a' } }; }),
      adminLabel: A.status(live || { kind: 'venue', status: 'new', guests: s.guests }).pill, adminPill: pill('#e9f9ef', '#128c4a'),
      vSteps: vS.map(([t, d], i) => ({ t, d, mark: vDone[i] ? '✓' : String(i + 1), dot: dot(vDone[i], vRank + 1 === i) })),
      venueTicket: [{ k: 'Booking code', v: s.code }, { k: 'Date', v: s.date || '-' }, { k: 'Guests', v: s.guests + ' people' }, { k: 'Estimate', v: rp((s.created && s.created.est_price) || 0) }],
      rateRows: [{ label: 'Food & drinks', stars: [1, 2, 3, 4, 5].map(n => ({ pick: () => { this.setState({ rFood: n }); this.sendRating(n, s.rService, s.comment); }, style: { all: 'unset', cursor: 'pointer', fontSize: 26, lineHeight: 1, color: n <= (s.rFood || 0) ? '#e30a2e' : 'rgba(13,13,13,.18)' } })) },
        { label: 'Service', stars: [1, 2, 3, 4, 5].map(n => ({ pick: () => { this.setState({ rService: n }); this.sendRating(s.rFood, n, s.comment); }, style: { all: 'unset', cursor: 'pointer', fontSize: 26, lineHeight: 1, color: n <= (s.rService || 0) ? '#e30a2e' : 'rgba(13,13,13,.18)' } })) }],
      comment: s.comment || '', setComment: e => { this.setState({ comment: e.target.value }); this.sendRating(s.rFood, s.rService, e.target.value); }, rateMsg: s.rateMsg, canRate: s.mode !== 'venue' && paid,
      hasCta: !!cta, ctaLabel: cta ? cta[0] : '', cta: cta ? cta[1] : null, ctaDisabled: cta ? cta[2] : false,
      ctaStyle: { all: 'unset', boxSizing: 'border-box', cursor: cta && cta[2] ? 'not-allowed' : 'pointer', width: '100%', textAlign: 'center', padding: 16, borderRadius: 999, background: cta && cta[2] ? '#c9c7c2' : '#e30a2e', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '.04em', textTransform: 'uppercase', boxShadow: cta && cta[2] ? 'none' : '0 10px 24px rgba(227,10,46,.3)' }
    };
  }
}
