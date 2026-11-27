
const rp = n => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID');
const API = () => window.CafeApi;
const defaultOpts = m => (m.addons || []).map(g => { const d = (g.options || []).find(o => o.default) || null; return d ? d.id : null; }).filter(Boolean);
const lineKey = (id, opts) => id + (opts && opts.length ? '~' + opts.slice().sort().join(',') : '');
const optsPrice = (m, opts) => (m.addons || []).reduce((a, g) => a + (g.options || []).filter(o => (opts || []).includes(o.id)).reduce((b, o) => b + (Number(o.price) || 0), 0), 0);
const optsLabel = (m, opts) => (m.addons || []).map(g => { const o = (g.options || []).find(x => (opts || []).includes(x.id)); return o && !o.default ? o.label : null; }).filter(Boolean).join(' · ');
const SESSION_ID = { 'Morning 08–12': 'morning', 'Afternoon 13–17': 'afternoon', 'Evening 18–22': 'evening' };
const SESSIONS = ['Morning 08–12', 'Afternoon 13–17', 'Evening 18–22'];
const EVENTS = ['Birthday', 'Meeting', 'Community', 'Workshop'];
const PROMO_MIN = 1000; // Xendit minimum; the previewed discount never drops the payable below this (server enforces too).
const DEALS = [
  { id: 'v50', tag: 'Voucher', title: 'Pay Rp50.000, get Rp60.000', desc: 'Use on any food and drinks', price: 50000, worth: 60000 },
  { id: 'v100', tag: 'Best value', title: 'Pay Rp100.000, get Rp125.000', desc: 'Use on any food and drinks', price: 100000, worth: 125000 },
  { id: 'duo', tag: 'Bundle', title: 'Coffee + pastry', desc: 'Any coffee with any pastry', price: 45000, worth: 58000 },
  { id: 'squad', tag: 'Group', title: 'Squad of 4 drinks', desc: '4 drinks of your choice', price: 110000, worth: 136000 }
];
const PANEL_STEPS = ['va', 'ewallet', 'card'];
const PAYING_STEPS = ['qr', 'wait', 'va', 'ewallet', 'card'];
// Grab & Go is paid ONLINE now (owner, 2026-11-24): no barista confirmation — the order is accepted when the POS
// still has the stock (checked by admin.20fit.id) and paid right away via Xendit, like the old Takeaway flow.
// It is sent as order type 'pickup'. Before anything is created the customer gets a short window to cancel.
const GRAB_ONLINE = true;
// label / desc are i18n keys (tools/src/i18n/co.*.js), resolved when rendering.
const METHODS = [
  { id: 'qris', label: 'co_m_qris', desc: 'co_m_qris_desc', qr: true, logos: ['qris'] },
  { id: 'ewallet', label: 'co_m_ewallet', desc: 'co_m_ewallet_desc', logos: ['ovo', 'shopeepay'] },
  { id: 'credit', label: 'co_m_credit', desc: 'co_m_credit_desc', logos: ['visamc'] },
  { id: 'debit', label: 'co_m_debit', desc: 'co_m_debit_desc', logos: ['visamc'] },
  { id: 'va', label: 'co_m_va', desc: 'co_m_va_desc', logos: ['bca', 'mandiri', 'bni', 'bri'] }
];
// Every method is paid through Xendit (admin.20fit.id/api/cafe) WITHOUT leaving this page: QRIS shows a real
// Xendit QR, VA shows the account number, OVO pushes to the OVO app, cards are verified (3-D Secure) in-page.
const LOGO_ALT = { qris: 'QRIS', gopay: 'GoPay', ovo: 'OVO', shopeepay: 'ShopeePay', visa: 'Visa', visamc: 'Visa, Mastercard', mastercard: 'Mastercard', jcb: 'JCB', gpn: 'GPN', bca: 'BCA', mandiri: 'Mandiri', bni: 'BNI', bri: 'BRI' };
// Real brand marks where we have them (self-hosted in /logos, same files as the calorie app); the rest keep the lettermark SVGs.
const LOGO_SRC = { qris: 'logos/qris.png', ovo: 'logos/ovo.svg', shopeepay: 'logos/shopeepay.svg', bca: 'logos/bca.png', bni: 'logos/bni.png', bri: 'logos/bri.png', mandiri: 'logos/mandiri.webp', visamc: 'logos/visa-mastercard.webp' };
const logoSrc = k => LOGO_SRC[k] || ('logos/' + k + '.svg');
// Every payment logo sits in the same fixed box (method list, e-wallet / VA pickers, confirm modal, payment page):
// centred both ways, contained (aspect ratio kept, never stretched), same padding, original brand colours.
const LOGO_BOX = { boxSizing: 'border-box', width: 80, height: 32, padding: '4px 6px', borderRadius: 8, background: '#fff', border: '1px solid rgba(13,13,13,.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' };
const LOGO_IMG = { display: 'block', maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' };
const logoEl = (src, alt, key) => React.createElement('span', { key: key || alt, className: 'fx-logo', style: LOGO_BOX }, React.createElement('img', { src, alt, style: LOGO_IMG, decoding: 'async' }));
const QR_SECONDS = 900; // fallback only; the real window is the Xendit QR's expires_at
const okName = v => v.trim().length >= 2;
const okEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const okPhone = v => /^(\+?62|0)8\d{7,12}$/.test(v.replace(/[\s-]/g, ''));
const chip = on => ({ all: 'unset', cursor: 'pointer', padding: '10px 16px', borderRadius: 999, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', background: on ? '#0d0d0d' : '#fff', color: on ? '#fff' : '#0d0d0d', border: '1px solid ' + (on ? '#0d0d0d' : 'rgba(13,13,13,.12)') });
const card = on => ({ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, padding: 16, borderRadius: 20, background: '#fff', border: '2px solid ' + (on ? '#e30a2e' : 'rgba(13,13,13,.08)') });
const dot = (done, active) => ({ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13, background: done ? '#e30a2e' : active ? '#0d0d0d' : '#f1f0ed', color: done || active ? '#fff' : '#8a8a8a', transition: 'background .3s' });
// ---------- language (EN default, ID on request; tools/src/i18n.js) ----------
// A message kept in state is either a server text (shown as it is) or { k, v } (an i18n key, translated when drawn,
// so it follows a language switch). Known generic texts of cafe-api.js are mapped to translated keys.
const GENERIC_ERR = { 'Something went wrong, please try again': 'co_err_generic', 'No connection, please try again': 'co_err_offline' };
const msgOf = (e, fallbackKey) => { const m = e && e.message; return m && !GENERIC_ERR[m] ? m : { k: m ? GENERIC_ERR[m] : fallbackKey }; };
const locOf = L => (L === 'id' ? 'id-ID' : 'en-GB');
const TZ = 'Asia/Jakarta';
const pill = (bg, fg) => ({ padding: '6px 12px', borderRadius: 999, background: bg, color: fg, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 });

class Component extends DCLogic {
  state = { lang: I18N.lang(), step: 'mode', mode: null, cart: {}, cat: 'All', fulfil: 'pickup', name: '', address: '', note: '', deals: {}, pax: 2, dayI: 0, slot: '', date: '', session: SESSIONS[1], event: 'Birthday', guests: 20, refresh: true, vStart: '', vEnd: '', vServe: '', pay: '', checking: false, lastCheck: 0, email: '', phone: '', qrEnd: 0, qrStart: 0, qrStr: '', payBusy: false, vaBank: 'BCA', ewChoice: 'qris', vaInfo: null, ovoSent: null, ovoPhone: null, cardKey: '', xReady: false, cardBusy: false, threeDs: '', cNum: '', cExp: '', cCvv: '', copied: false, now: 0, qrSeed: 1, code: '', token: '', cfg: null, avail: {}, created: null, live: null, partySize: '', grabPay: '', promo: '', promoInfo: null, promoBusy: false, busy: false, err: '', confirmUntil: 0, rateMsg: { k: 'co_rate_later' } };
  componentDidMount() {
    // EN | ID switch (tools/src/i18n.js): re-render every text on change
    this._onLang = () => this.setState({ lang: I18N.lang() }); window.addEventListener('20fit-lang', this._onLang);
    document.body.style.overflow = 'hidden';
    // #order/CAFE-XXXXX (a reload on the payment page) keeps its own URL; otherwise push #order so Back closes us.
    const resumeHash = /^#order\//.test(location.hash || '');
    if (!resumeHash) { try { history.pushState({ order: 1 }, '', '#order'); this._pushed = true; } catch (e) {} }
    this._pop = () => { if (this._closing) return; this._popped = true; this.finish(); }; window.addEventListener('popstate', this._pop);
    this._esc = e => { if (e.key === 'Escape' && this.state.confirmOpen) { e.stopPropagation(); this.confirmCancel(); } }; window.addEventListener('keydown', this._esc, true);
    // One cart for the whole site (CafeApi, localStorage): the menu cards and this page edit the same lines.
    let cart = API().cartGet ? API().cartGet() : {};
    if (!Object.keys(cart).length) (this.props.items || []).forEach(i => { cart[i.key || lineKey(i.id, i.opts)] = { id: i.id, opts: i.opts || [], qty: i.qty }; });
    this._offCart = API().on('cart', c => { this.setState({ cart: c }); this.cartChanged(); });
    // Fase 2: remembered customer details + the table session from a table QR (#t/{token}).
    const me = API().customerGet ? API().customerGet() : {};
    this.setState(s => ({ name: s.name || me.name || '', email: s.email || me.email || '', phone: s.phone || me.phone || '', table: API().tableSessionGet ? API().tableSessionGet() : null }));
    this._offTable = API().on('table', t => this.setState({ table: t || null }));
    const ts = API().tableSessionGet ? API().tableSessionGet() : null;
    if (ts && ts.token && !ts.label) API().tableResolve(ts.token).then(r => {
      if (r && r.ok) API().tableSessionSet({ ...ts, table_id: r.table_id, code: r.code, label: r.label });
      else if (r && r.ok === false) API().tableSessionClear();
    }).catch(() => {});
    API().getConfig().then(cfg => { this.setState(s => ({ cfg, slot: s.slot || (cfg.slots || [])[0] || '', grabPay: s.grabPay || ((cfg.payment_methods || [])[0] || {}).code || '' })); this.loadAvail(this.state.dayI); }).catch(e => this.setState({ err: msgOf(e, 'co_err_generic') }));
    const m = this.props.startMode, sub = this.props.startSub, has = Object.keys(cart).length > 0;
    const next = { cart };
    // Cafe is Grab & Go only now (order remotely, pay offline at the cafe). Everything routes to the grab flow; venue is separate.
    if (m === 'venue') Object.assign(next, { mode: 'venue', step: 'venue' });
    else Object.assign(next, { mode: 'grab', step: has ? 'pay' : 'menu' });
    const r = this.props.resume;
    if (r && r.code && r.token && m !== 'venue') Object.assign(next, { mode: 'grab', step: 'wait', code: r.code, token: r.token });
    this.setState(next, () => { if (r && r.code && r.token && m !== 'venue') this.resumePay(); });
  }
  // ---------- cart (shared store) ----------
  setCart(next) { const c = API().cartSet(next); this.setState({ cart: c }); this.cartChanged(); }
  lineInc(key) { const c = this.state.cart; if (!c[key]) return; const m = this.item(c[key].id); if (m && m.available === false) return; this.setCart({ ...c, [key]: { ...c[key], qty: c[key].qty + 1 } }); }
  lineDec(key) { const c = this.state.cart; if (!c[key]) return; this.setCart({ ...c, [key]: { ...c[key], qty: c[key].qty - 1 } }); }
  lineDel(key) { const c = { ...this.state.cart }; delete c[key]; this.setCart(c); }
  // An applied voucher is checked again (server) whenever the cart changes, e.g. the minimum order is no longer met.
  cartChanged() {
    if (this.state.code) return;
    clearTimeout(this._pv);
    if ((this.state.promo || '').trim() && this.state.promoInfo) this._pv = setTimeout(() => { if (this.cartLines().length) this.applyPromo(); else this.setState({ promoInfo: null }); }, 450);
  }
  methodLogos(id) {
    const s = this.state, m = METHODS.find(x => x.id === id); if (!m) return [];
    const keys = id === 'ewallet' ? (s.ewChoice === 'ovo' ? ['ovo'] : ['qris', 'shopeepay']) : id === 'va' ? [({ BCA: 'bca', MANDIRI: 'mandiri', BNI: 'bni', BRI: 'bri' })[s.vaBank || 'BCA']].filter(Boolean) : m.logos;
    return keys.map(k => ({ src: logoSrc(k), alt: LOGO_ALT[k] }));
  }
  // Active table session (from a table QR), or null = Grab n Go.
  tableNow() { const t = this.state.table; return t && t.token && (!t.until || Date.now() < t.until) ? t : null; }
  // ---------- language ----------
  // The language an order was placed in: the order itself (admin API field `language`), else the saved ref
  // ({ code, token, lang } in 20fit-order-refs), else the language at the moment it was created on this page.
  orderLang() {
    const s = this.state, ok = l => (l === 'id' || l === 'en' ? l : null); if (!s.code) return null;
    const ref = (() => { try { return (API().getRefs ? API().getRefs() : []).find(r => r.code === s.code) || null; } catch (e) { return null; } })();
    const rs = this.props.resume && this.props.resume.code === s.code ? this.props.resume : null;
    return ok(s.live && s.live.language) || ok(ref && ref.lang) || ok(rs && rs.lang) || ok(this._orderLang);
  }
  // Language this page is drawn in: an existing order's screens (payment, payment received, live status) use the
  // order's language, until the visitor picks EN / ID here; everything else follows the site language.
  viewLang() { return (this.state.code && !this._langPicked && this.orderLang()) || I18N.lang(); }
  tx(k, v) { return T(k, v, this.viewLang()); }
  msg(m) { return !m ? '' : typeof m === 'object' ? this.tx(m.k, m.v) : String(m); }
  pickLang(l) { this._langPicked = true; I18N.set(l); this.setState({ lang: I18N.lang() }); }
  fmtDay(d, o) { return d.toLocaleDateString(locOf(this.viewLang()), o); }
  // Status pill + line, tracker steps, payment method and dates come from CafeApi (one source with Purchase
  // History). CafeApi draws an order in its own language (o.language / saved ref); `language` is set to the
  // language this page is drawn in, so the whole screen speaks one language (also after an EN | ID tap here).
  inLang(o) { return o ? { ...o, language: this.viewLang() } : o; }
  stx(o) { return API().status(this.inLang(o)); }
  trx(o) { return API().trackSteps(this.inLang(o)); }
  dateTime(iso) { return API().dateTime(iso, this.viewLang()); }
  dayLabel(ymd) { return API().dayLabel(ymd, this.viewLang()); }
  methodLabel(m) { return API().methodLabel(m, this.viewLang()); }
  optionsText(opts) { return opts ? Object.keys(opts).map(k => (k === 'Note' ? this.tx('co_note_opt', { note: opts[k] }) : opts[k])).join(' · ') : ''; }
  removePromo() { clearTimeout(this._pv); this.setState({ promo: '', promoInfo: null }); }
  // ---------- payment page: resume after a reload, refresh status, download QR ----------
  setPayUrl(code) { try { history.replaceState(history.state, '', location.pathname + location.search + (code ? '#order/' + code : '#order')); } catch (e) {} }
  resumePay() {
    const { code, token } = this.state; if (!code || !token) return;
    this.setPayUrl(code); API().payOpenSet({ code, token }); this.startLive(); this.startWait();
    API().getOrder(code, token).then(o => {
      if (!o) return;
      this.setState({ live: o, created: o, pay: METHODS.some(x => x.id === o.payment_method) ? o.payment_method : 'qris' });
      if (o.payment_status === 'paid') return this.paidNow(o);
      if (o.status !== 'pending_payment' || o.payment_status === 'expired' || o.payment_status === 'failed') return;
      if (o.payment_method === 'credit' || o.payment_method === 'debit') { this.setState({ step: 'pay' }); return; }
      const chan = o.payment_method === 'va' ? { channel: 'va' } : { channel: 'qris' };
      this.setState({ payBusy: true });
      API().pay(code, token, chan).then(pay => { this.setState({ payBusy: false }); this.usePay(pay); }).catch(() => this.setState({ payBusy: false }));
    }).catch(e => this.setState({ err: msgOf(e, 'co_err_load_order') }));
  }
  refreshStatus() {
    const { code, token } = this.state; if (!code || !token || this.state.checking) return;
    this.setState({ checking: true });
    API().payStatus(code, token).catch(() => null).then(() => API().getOrder(code, token)).then(o => {
      this.setState({ checking: false, lastCheck: Date.now() });
      if (!o) return; this.setState({ live: o });
      if (o.payment_status === 'paid') this.paidNow(o);
    }).catch(e => this.setState({ checking: false, lastCheck: Date.now(), err: msgOf(e, 'co_err_check_pay') }));
  }
  // Paid: show PAYMENT RECEIVED, empty the cart (everywhere), forget the open payment, clean the URL.
  paidNow(o) {
    clearInterval(this._qi); clearTimeout(this._3t);
    if (!this._clearedFor || this._clearedFor !== this.state.code) { this._clearedFor = this.state.code; API().cartSet({}); }
    API().payOpenClear(this.state.code); this.setPayUrl(null);
    this.setState({ step: 'done', live: o || this.state.live });
  }
  // Expired / cancelled order: same order still open → a new QR / VA on it; otherwise back to the cart (still there)
  // so Continue to Pay makes a fresh order from the same items.
  tryAgain() {
    const lv = this.state.live;
    if (lv && lv.status === 'pending_payment' && lv.payment_status !== 'expired' && lv.payment_status !== 'failed') return this.retryPay(this.payOpts());
    this.stopLive(); API().payOpenClear(this.state.code); this.setPayUrl(null);
    this.setState({ step: 'pay', code: '', token: '', created: null, live: null, err: '', qrStr: '', vaInfo: null, ovoSent: null });
  }
  downloadQr() {
    const s = this.state; if (!s.qrStr) return;
    const svg = API().qrSvg(s.qrStr, 600); if (!svg) return;
    const img = new Image();
    img.onload = () => {
      const W = 720, H = 860, c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(img, 60, 60, 600, 600);
      x.fillStyle = '#0d0d0d'; x.textAlign = 'center'; x.font = 'bold 44px sans-serif'; x.fillText(rp((s.live && s.live.total) || (s.created && s.created.total) || 0), W / 2, 730);
      x.fillStyle = '#5a5a5a'; x.font = '28px monospace'; x.fillText('QRIS · ' + s.code + ' · 20FIT Cafe', W / 2, 790);
      let href = '', name = s.code + '-QRIS.png';
      try { href = c.toDataURL('image/png'); } catch (e) { href = img.src; name = s.code + '-QRIS.svg'; }  // canvas export refused → the SVG itself
      const a = document.createElement('a'); a.download = name; a.href = href; document.body.appendChild(a); a.click(); a.remove();
    };
    // qrcode-generator's SVG already carries xmlns; scalable SVG needs a size to be drawn on the canvas
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg width="600" height="600" '));
  }
  // Leave the checkout; toMenu → back to FULL MENU (cart kept).
  leave(toMenu) {
    if (!toMenu || !this.props.onMenu) return this.finish();
    if (this._closing) return; this._closing = true;
    this.stopLive(); clearInterval(this._qi);
    if (this.state.code && this.props.onPaid) this.props.onPaid();
    this.cleanUrl();
    this.props.onMenu();
  }
  cleanUrl() {
    const h = location.hash || '';
    if (/^#order\//.test(h)) { try { history.replaceState(null, '', location.pathname + location.search + (this._pushed ? '#order' : '')); } catch (e) {} }
    if (this._pushed && !this._popped && location.hash === '#order') { try { history.back(); } catch (e) {} }
  }
  componentWillUnmount() { window.removeEventListener('20fit-lang', this._onLang); window.removeEventListener('keydown', this._esc, true); this._offCart && this._offCart(); this._offTable && this._offTable(); clearTimeout(this._pv); (this._ts || []).forEach(clearTimeout); clearInterval(this._ci); clearInterval(this._qi); clearInterval(this._wi); clearInterval(this._xw); clearTimeout(this._3t); this.stopLive(); window.removeEventListener('popstate', this._pop); document.body.style.overflow = ''; }
  later(fn, ms) { (this._ts = this._ts || []).push(setTimeout(fn, ms)); }
  dayText() { const d = new Date(); d.setDate(d.getDate() + (this.state.dayI || 0)); return this.fmtDay(d, { weekday: 'long', day: 'numeric', month: 'long' }); }
  menu() { return this.props.menu || []; }
  item(id) { return this.menu().find(x => x.id === id) || null; }
  cartLines() { return Object.entries(this.state.cart).filter(([, l]) => l && l.qty > 0 && this.item(l.id)).map(([key, l]) => { const m = this.item(l.id); return { key, id: l.id, opts: l.opts || [], qty: l.qty, name: m.name, cat: m.cat || '', src: m.src || '', available: m.available !== false, optLabel: optsLabel(m, l.opts), price: m.price + optsPrice(m, l.opts), base: (m.base != null ? m.base : m.price) + optsPrice(m, l.opts) }; }); }
  qtyOf(id) { return this.cartLines().filter(l => l.id === id).reduce((a, l) => a + l.qty, 0); }
  incItem(m) { if (!m.available) return; const o = defaultOpts(m), k = lineKey(m.id, o), c = this.state.cart; this.setCart({ ...c, [k]: { id: m.id, opts: o, qty: ((c[k] || {}).qty || 0) + 1 } }); }
  decItem(m) { const lines = this.cartLines().filter(l => l.id === m.id); const d = lines.find(l => l.key === lineKey(m.id, defaultOpts(m))) || lines[lines.length - 1]; if (!d) return; const c = this.state.cart; this.setCart({ ...c, [d.key]: { ...c[d.key], qty: c[d.key].qty - 1 } }); }
  loadAvail(dayI) { const date = API().ymd(dayI); API().slotAvailability(date).then(list => this.setState(s => ({ avail: { ...s.avail, [date]: list || [] } }))).catch(() => {}); }
  remaining(slot) { const list = this.state.avail[API().ymd(this.state.dayI)]; if (!list) return null; const r = list.find(x => x.slot === slot); return r ? r.remaining : 0; }
  dealLines() { return DEALS.filter(d => this.state.deals[d.id] > 0).map(d => ({ ...d, qty: this.state.deals[d.id] })); }
  bill() {
    const s = this.state, cfg = s.cfg || {}, lines = [];
    // Prices already include tax (POS price = final): the tax is never a separate line that adds to the total.
    // While the backend still splits PB1 out, it is folded back into the subtotal for display (total unchanged).
    if (s.created) { const c = s.created, svcOn = Number(c.service_charge) > 0; [[this.tx('co_subtotal'), svcOn ? c.subtotal : Number(c.subtotal || 0) + Number(c.ppn || 0), 1], [this.tx('co_service'), c.service_charge], [('PB1 ' + (cfg.tax_percent != null ? cfg.tax_percent + '%' : '')).trim(), svcOn ? c.ppn : 0], [this.tx('co_delivery_fee'), c.delivery_fee]].forEach(([k, v, always]) => { if (always || Number(v) > 0) lines.push({ label: k, value: rp(v) }); });
      if (Number(c.discount) > 0) lines.push({ label: this.tx('co_promo_line', { code: c.promo_code || '' }).trim(), value: '-' + rp(c.discount) });
      return { lines, total: Number(c.total) || 0, estimate: false }; }
    if (s.mode !== 'dine' && s.mode !== 'take' && s.mode !== 'grab') return { lines, total: 0, estimate: true };
    const sub = this.cartLines().reduce((a, i) => a + i.base * i.qty, 0);
    const svc = Math.round(sub * (Number(cfg.service_percent) || 0) / 100), tax = Math.round((sub + svc) * (Number(cfg.tax_percent) || 0) / 100);
    const del = s.mode === 'take' && s.fulfil === 'delivery' ? Number(cfg.delivery_fee) || 0 : 0;
    // Menu prices already include PB1: with no service charge the subtotal is the menu prices the buyer saw and
    // PB1 is shown as included; with a service charge, the full breakdown.
    const menuSum = this.cartLines().reduce((a, i) => a + i.price * i.qty, 0);
    if (!svc) {
      lines.push({ label: this.tx('co_subtotal'), value: rp(menuSum) });
    } else {
      lines.push({ label: this.tx('co_subtotal'), value: rp(sub) });
      lines.push({ label: this.tx('co_service') + ' ' + cfg.service_percent + '%', value: rp(svc) });
      if (cfg.tax_percent != null) lines.push({ label: 'PB1 ' + cfg.tax_percent + '%', value: rp(tax) });
    }
    if (del) lines.push({ label: this.tx('co_delivery_fee'), value: rp(del) });
    const gross = (svc ? sub + svc + tax : menuSum) + del, disc = this.promoDiscount(gross);
    if (disc > 0) lines.splice(1, 0, { label: this.tx('co_voucher_line', { name: s.promoInfo.name || s.promoInfo.code || '' }).trim(), value: '-' + rp(disc) });
    return { lines, total: Math.max(0, gross - disc), estimate: true };
  }
  // Server (cafe_create_order / cafe_check_voucher) is authoritative; this only previews the discount in the bill.
  grossNow() {
    const s = this.state, cfg = s.cfg || {};
    if (s.mode !== 'dine' && s.mode !== 'take' && s.mode !== 'grab') return 0;
    const sub = this.cartLines().reduce((a, i) => a + i.base * i.qty, 0);
    const svc = Math.round(sub * (Number(cfg.service_percent) || 0) / 100), tax = Math.round((sub + svc) * (Number(cfg.tax_percent) || 0) / 100);
    const del = s.mode === 'take' && s.fulfil === 'delivery' ? Number(cfg.delivery_fee) || 0 : 0;
    return (svc ? sub + svc + tax : this.cartLines().reduce((a, i) => a + i.price * i.qty, 0)) + del;
  }
  // Discount is computed + returned by the server (cafe_check_voucher); we just show it.
  promoDiscount() {
    const pi = this.state.promoInfo; if (!pi || !pi.ok) return 0;
    return Math.max(0, Number(pi.discount) || 0);
  }
  applyPromo() {
    const s = this.state, code = (s.promo || '').trim();
    if (!code) { this.setState({ promoInfo: null }); return; }
    if (s.promoBusy) return;
    const items = this.cartLines().map(l => ({ menu_id: l.id, qty: l.qty, addon_option_ids: l.opts }));
    const method = s.mode === 'grab' ? s.grabPay : null;
    this.setState({ promoBusy: true });
    API().checkVoucher(code, items, method, s.phone, s.email)
      .then(r => this.setState({ promoBusy: false, promoInfo: r && r.ok
        ? { ok: true, code: r.code, discount: Number(r.discount) || 0, name: r.name || null }
        : { ok: false, message: (r && r.message) || { k: 'co_voucher_invalid' } } }))
      .catch(e => this.setState({ promoBusy: false, promoInfo: { ok: false, message: msgOf(e, 'co_voucher_invalid') } }));
  }
  // Real Xendit QRIS: counts down to the QR's own expiry; afterwards "Generate new QR" asks for a new one.
  startQr(pay) {
    clearInterval(this._qi);
    const now = Date.now(), end = Date.parse(pay && pay.expires_at) || now + QR_SECONDS * 1000;
    this.setState(s => ({ step: 'qr', qrStr: pay.qr_string, qrEnd: end, qrStart: Math.min(now, end - 60000), now, qrSeed: (s.qrSeed || 1) + 1, err: '' }));
    this._qi = setInterval(() => { if (this.state.step !== 'qr') { clearInterval(this._qi); return; } this.setState({ now: Date.now() }); if (Date.now() >= this.state.qrEnd) clearInterval(this._qi); }, 1000);
  }
  // Hand the buyer to the payment, always on this page (owner: no Xendit checkout redirect).
  usePay(pay, amount) {
    if (!pay) return;
    if (pay.kind === 'card') { this.loadXendit(pay.public_key, () => this.payCard(amount)); return; }
    if (pay.kind === 'qr') { this.startQr(pay); return; }
    if (pay.kind === 'va') { this.setState({ step: 'va', vaInfo: pay, err: '' }); return; }
    if (pay.kind === 'ovo') { this.setState({ step: 'ewallet', ovoSent: pay, ovoAt: Date.now(), err: '' }); return; }
    if (pay.kind === 'choose') this.setState({ step: this.state.pay === 'va' ? 'va' : 'ewallet', err: '' });
  }
  // Start / reuse a payment for the order. opts: { channel: qris|ovo|va|card, bank, phone }
  retryPay(opts) {
    const s = this.state; if (s.payBusy || !s.code) return;
    this.setState({ payBusy: true, err: '' });
    API().pay(s.code, s.token, opts || { channel: METHODS.find(m => m.id === s.pay).qr ? 'qris' : undefined }).then(pay => { this.setState({ payBusy: false }); this.usePay(pay); })
      .catch(e => { this.setState({ payBusy: false, err: msgOf(e, 'co_err_start_pay') }); this.fetchLive(); });
  }
  // ---------- card: Xendit.js v1 tokenization + 3-D Secure inside this page (card number never reaches our server) ----------
  // The in-page choice for the selected method (dropdown under it): sent with the order.
  payOpts() {
    const s = this.state;
    if (s.pay === 'va') return { channel: 'va', bank: s.vaBank || 'BCA' };
    if (s.pay === 'ewallet') return s.ewChoice === 'ovo' ? { channel: 'ovo', phone: s.ovoPhone != null ? s.ovoPhone : s.phone } : { channel: 'qris' };
    if (s.pay === 'credit' || s.pay === 'debit') return { channel: 'card' };
    return { channel: 'qris' };
  }
  dropOk() {
    const s = this.state;
    if (s.pay === 'ewallet' && s.ewChoice === 'ovo') return String(s.ovoPhone != null ? s.ovoPhone : s.phone).replace(/\D/g, '').length >= 9;
    if (s.pay === 'credit' || s.pay === 'debit') return (s.cNum || '').replace(/\D/g, '').length >= 13 && (s.cExp || '').replace(/\D/g, '').length === 4 && (s.cCvv || '').length >= 3;
    return true;
  }
  // "Continue to pay" opens CONFIRM YOUR ORDER (nothing is created yet). "Yes, continue" creates the order and
  // starts the payment right away; "Edit order" / X / Esc go back to the cart untouched. An existing order
  // (e.g. a retry with another method) skips the modal.
  startConfirm() {
    const s = this.state; if (s.busy || s.payBusy || s.cardBusy) return;
    if (s.code) return this.submitPay();
    this.setState({ confirmOpen: true, err: '' });
  }
  confirmGo() { if (this.state.busy || this._creating) return; this.submitPay(); }
  confirmCancel() { if (this.state.busy || this._creating) return; this.setState({ confirmOpen: false, err: '' }); }
  submitPay() {
    const s = this.state; if (s.busy || s.payBusy || s.cardBusy) return;
    if (!s.code) return this.createOrder();
    if (s.pay === 'credit' || s.pay === 'debit') return this.payCard();
    this.retryPay(this.payOpts());
  }
  loadXendit(key, then) {
    const ready = () => { try { if (key) window.Xendit.setPublishableKey(key); this.setState({ xReady: true }); if (then) then(); } catch (e) { this.setState({ cardBusy: false, err: { k: 'co_err_card_na' } }); } };
    if (window.Xendit && window.Xendit.card) return ready();
    if (document.getElementById('xendit-js')) { clearInterval(this._xw); this._xw = setInterval(() => { if (window.Xendit && window.Xendit.card) { clearInterval(this._xw); ready(); } }, 200); return; }
    const sc = document.createElement('script'); sc.id = 'xendit-js'; sc.src = 'https://js.xendit.co/v1/xendit.min.js'; sc.async = true;
    sc.onload = ready; sc.onerror = () => this.setState({ err: { k: 'co_err_card_load' } });
    document.head.appendChild(sc);
  }
  payCard(amt) {
    const s = this.state, num = (s.cNum || '').replace(/\D/g, ''), exp = (s.cExp || '').replace(/\D/g, ''), cvv = (s.cCvv || '').replace(/\D/g, '');
    if (s.cardBusy || !(window.Xendit && window.Xendit.card)) return;
    if (num.length < 13 || exp.length !== 4 || cvv.length < 3) { this.setState({ err: { k: 'co_err_card_incomplete' } }); return; }
    const attempt = (this._ca = (this._ca || 0) + 1), amount = Math.round(Number(amt || (s.created && s.created.total) || 0));
    this.setState({ cardBusy: true, err: '', threeDs: '' });
    const bd = { given_names: s.name.trim() || 'Customer', email: s.email.trim() || undefined, mobile_number: s.phone ? '+62' + s.phone.replace(/\D/g, '').replace(/^(62|0)/, '') : undefined };
    window.Xendit.card.createToken({ amount, card_number: num, card_exp_month: exp.slice(0, 2), card_exp_year: '20' + exp.slice(2), card_cvn: cvv, is_multiple_use: false, should_authenticate: true, currency: 'IDR', billing_details: bd, customer: bd }, (error, token) => {
      if (attempt !== this._ca) return;  // Xendit.js calls back twice with 3DS; ignore a cancelled attempt
      if (error || !token || token.status === 'FAILED') {
        clearTimeout(this._3t);
        const code = String((error && (error.error_code || error.code)) || (token && token.failure_reason) || '');
        this.setState({ cardBusy: false, threeDs: '', cCvv: code === 'INVALID_CVN' ? '' : s.cCvv, err: (error && error.message && !/^[A-Z_]+$/.test(error.message) ? error.message : '') || { k: 'co_err_card_verify' } });
        return;
      }
      // First callback = the bank's OTP page (3-D Secure): show it here; the second callback brings the token.
      if (!token.authentication_id && token.status === 'IN_REVIEW' && token.payer_authentication_url) {
        this.setState({ threeDs: token.payer_authentication_url });
        clearTimeout(this._3t);
        this._3t = setTimeout(() => { if (attempt !== this._ca) return; this._ca++; this.setState({ cardBusy: false, threeDs: '', err: { k: 'co_err_3ds_timeout' } }); }, 240000);
        return;
      }
      clearTimeout(this._3t);
      this.setState({ threeDs: '' });
      if (!token.id || !token.authentication_id) { this.setState({ cardBusy: false, err: { k: 'co_err_3ds_unfinished' } }); return; }
      API().card(s.code, s.token, token.id, token.authentication_id)
        .then(() => { this.setState({ cardBusy: false, cNum: '', cCvv: '' }); this.fetchLive(); })
        .catch(e => this.setState({ cardBusy: false, cCvv: '', err: msgOf(e, 'co_err_card_failed') }));
    });
  }
  cancel3ds() { this._ca = (this._ca || 0) + 1; clearTimeout(this._3t); this.setState({ cardBusy: false, threeDs: '' }); }
  copyVa(n) { try { navigator.clipboard.writeText(n); this.setState({ copied: true }); this.later(() => this.setState({ copied: false }), 2000); } catch (e) {} }
  // ---------- dropdown under the selected payment method (bank / e-wallet / card form, 3-D Secure) ----------
  dropFor(id) {
    const h = React.createElement, s = this.state;
    const wrap = ch => h('div', { style: { margin: '-4px 0 4px', padding: 14, borderRadius: '0 0 18px 18px', background: '#faf9f7', border: '1px solid rgba(227,10,46,.25)', borderTop: 'none', display: 'flex', flexDirection: 'column', gap: 10, animation: 'pFade .25s ease' } }, ch);
    const small = { fontSize: 13, color: '#5a5a5a', lineHeight: 1.45 };
    const chip = (on, label, onClick, logo) => h('button', { key: label, onClick, style: { all: 'unset', cursor: 'pointer', boxSizing: 'border-box', minHeight: 46, padding: '8px 12px', borderRadius: 14, background: '#fff', border: on ? '2px solid #e30a2e' : '1px solid rgba(13,13,13,.12)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, textAlign: 'center' } }, logo ? logoEl(logo, label) : label);
    const input = (val, set, ph, extra) => h('input', Object.assign({ value: val || '', placeholder: ph, onChange: e => set(e.target.value), style: { boxSizing: 'border-box', width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(13,13,13,.15)', fontSize: 16, outline: 'none', background: '#fff', fontFamily: "'JetBrains Mono',monospace" } }, extra || {}));
    if (id === 'va') {
      const banks = [['BCA', 'logos/bca.png'], ['MANDIRI', 'logos/mandiri.webp'], ['BNI', 'logos/bni.png'], ['BRI', 'logos/bri.png'], ['PERMATA'], ['BSI'], ['CIMB']];
      return wrap([h('div', { key: 't', style: small }, this.tx('co_va_drop_hint')),
        h('div', { key: 'g', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(92px,1fr))', gap: 8 } }, banks.map(([b, logo]) => chip((s.vaBank || 'BCA') === b, b, () => this.setState({ vaBank: b }), logo)))]);
    }
    if (id === 'ewallet') {
      const ovo = s.ewChoice === 'ovo', phone = s.ovoPhone != null ? s.ovoPhone : s.phone;
      return wrap([h('div', { key: 'g', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
          chip(!ovo, 'ShopeePay · GoPay · DANA · LinkAja', () => this.setState({ ewChoice: 'qris' })),
          chip(ovo, 'OVO', () => this.setState({ ewChoice: 'ovo' }), logoSrc('ovo'))),
        ovo ? h('div', { key: 'o', style: { display: 'flex', flexDirection: 'column', gap: 6 } }, h('div', { style: small }, this.tx('co_ovo_drop_hint')), input(phone, v => this.setState({ ovoPhone: v }), '0812xxxxxxx', { type: 'tel', inputMode: 'numeric' }))
          : h('div', { key: 'q', style: small }, this.tx('co_qris_drop_hint'))]);
    }
    if (id === 'credit' || id === 'debit') {
      if (s.threeDs) {
        return wrap([h('div', { key: 'h', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 } }, h('div', { style: { fontWeight: 700, minWidth: 0 } }, this.tx('co_3ds_title')), h('button', { onClick: () => this.cancel3ds(), style: { all: 'unset', cursor: 'pointer', fontSize: 13, textDecoration: 'underline', color: '#5a5a5a', minHeight: 44, display: 'inline-flex', alignItems: 'center' } }, this.tx('co_cancel'))),
          h('iframe', { key: 'f', src: s.threeDs, title: this.tx('co_3ds_frame'), style: { width: '100%', height: 460, border: '1px solid rgba(13,13,13,.1)', borderRadius: 14, background: '#fff' } }),
          h('div', { key: 'n', style: small }, this.tx('co_3ds_note'))]);
      }
      const fmtNum = v => v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
      const fmtExp = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; };
      return wrap([input(s.cNum, v => this.setState({ cNum: fmtNum(v) }), this.tx('co_card_number'), { key: 'n', inputMode: 'numeric', autoComplete: 'cc-number' }),
        h('div', { key: 'r', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
          input(s.cExp, v => this.setState({ cExp: fmtExp(v) }), this.tx('co_mm_yy'), { inputMode: 'numeric', autoComplete: 'cc-exp' }),
          input(s.cCvv, v => this.setState({ cCvv: v.replace(/\D/g, '').slice(0, 4) }), 'CVV', { inputMode: 'numeric', type: 'password', autoComplete: 'cc-csc' })),
        h('div', { key: 's', style: small }, this.tx('co_card_secured_otp'))]);
    }
    return null;
  }
  // ---------- in-page panels (VA, e-wallet, card), drawn here so the design template only needs one slot ----------
  panel(total) {
    const h = React.createElement, s = this.state, A = API();
    const box = { background: '#fff', borderRadius: 20, border: '1px solid rgba(13,13,13,.08)', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 };
    const mono = { fontFamily: "'JetBrains Mono',monospace" };
    const small = { fontSize: 13, color: '#5a5a5a', lineHeight: 1.45 };
    const btn = (label, onClick, opts) => h('button', { onClick, disabled: !!(opts && opts.disabled), style: { all: 'unset', boxSizing: 'border-box', cursor: opts && opts.disabled ? 'default' : 'pointer', textAlign: 'center', padding: '13px 18px', borderRadius: 999, background: opts && opts.ghost ? '#fff' : opts && opts.disabled ? '#c9c7c2' : '#e30a2e', color: opts && opts.ghost ? '#0d0d0d' : '#fff', border: opts && opts.ghost ? '1px solid rgba(13,13,13,.15)' : 'none', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: '.04em', textTransform: 'uppercase', width: opts && opts.auto ? 'auto' : '100%' } }, label);
    const input = (val, set, ph, extra) => h('input', Object.assign({ value: val || '', placeholder: ph, onChange: e => set(e.target.value), style: { boxSizing: 'border-box', width: '100%', padding: '13px 14px', borderRadius: 14, border: '1px solid rgba(13,13,13,.15)', fontSize: 16, outline: 'none', background: '#fff', ...mono } }, extra || {}));
    const waiting = h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, ...small } }, h('span', { style: { width: 8, height: 8, borderRadius: '50%', background: '#e30a2e', animation: 'skPulse 1s ease-in-out infinite' } }), this.tx('co_waiting_auto'));
    const amount = h('div', { style: { ...mono, fontSize: 22, color: '#e30a2e', textAlign: 'center' } }, rp(total));
    const err = s.err ? h('div', { style: { padding: '10px 14px', borderRadius: 12, background: '#fdecef', color: '#b0001e', fontSize: 14 } }, this.msg(s.err)) : null;

    if (s.step === 'va') {
      const v = s.vaInfo;
      if (!v) {
        const banks = [['BCA', 'logos/bca.png'], ['MANDIRI', 'logos/mandiri.webp'], ['BNI', 'logos/bni.png'], ['BRI', 'logos/bri.png'], ['PERMATA'], ['BSI'], ['CIMB']];
        return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } }, amount,
          h('div', { style: { fontWeight: 700, fontSize: 16 } }, this.tx('co_choose_bank')),
          h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 } }, banks.map(([b, logo]) => h('button', { key: b, onClick: () => this.retryPay({ channel: 'va', bank: b }), disabled: s.payBusy,
            style: { all: 'unset', cursor: 'pointer', boxSizing: 'border-box', height: 64, borderRadius: 16, background: '#fff', border: '1px solid rgba(13,13,13,.12)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15, opacity: s.payBusy ? .5 : 1 } },
            logo ? logoEl(logo, b) : b))),
          s.payBusy ? h('div', { style: small }, this.tx('co_va_creating')) : null, err);
      }
      const grouped = String(v.va_number).replace(/(\d{4})(?=\d)/g, '$1 ');
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        h('div', { style: box },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' } }, h('div', { style: { fontWeight: 700, minWidth: 0 } }, this.tx('co_va_title', { bank: v.bank })), h('div', { style: { ...mono, fontSize: 12, color: '#5a5a5a' } }, this.tx('co_va_pay_before', { time: A.time(v.expires_at, this.viewLang()) }))),
          h('div', { style: { ...mono, fontSize: 24, letterSpacing: '.04em', wordBreak: 'break-all' } }, grouped),
          btn(s.copied ? this.tx('co_copied') : this.tx('co_copy_number'), () => this.copyVa(v.va_number), { ghost: true }),
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 } }, h('span', { style: small }, this.tx('co_amount_exact')), h('span', { style: { ...mono, fontSize: 20, color: '#e30a2e' } }, rp(v.amount)))),
        h('div', { style: small }, this.tx('co_va_howto', { bank: v.bank, amount: rp(v.amount) })),
        waiting, err,
        h('button', { onClick: () => this.setState({ vaInfo: null, err: '' }), style: { all: 'unset', cursor: 'pointer', fontSize: 14, textDecoration: 'underline', color: '#5a5a5a', alignSelf: 'center', minHeight: 44, display: 'inline-flex', alignItems: 'center' } }, this.tx('co_va_other_bank')));
    }

    if (s.step === 'ewallet') {
      const sent = s.ovoSent, phone = s.ovoPhone != null ? s.ovoPhone : s.phone;
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } }, amount,
        h('div', { style: box },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } }, logoEl(logoSrc('ovo'), 'OVO'), h('span', { style: { fontWeight: 700 } }, 'OVO')),
          sent
            ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
                h('div', { style: { fontSize: 15 } }, this.tx('co_ovo_sent', { phone: sent.phone, amount: rp(sent.amount) })),
                waiting,
                btn(s.payBusy ? this.tx('co_sending') : this.tx('co_send_again'), () => this.retryPay({ channel: 'ovo', phone }), { ghost: true, disabled: s.payBusy }),
                h('button', { onClick: () => this.setState({ ovoSent: null }), style: { all: 'unset', cursor: 'pointer', fontSize: 13, textDecoration: 'underline', color: '#5a5a5a', minHeight: 44, display: 'inline-flex', alignItems: 'center' } }, this.tx('co_ovo_change')))
            : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
                h('div', { style: small }, this.tx('co_ovo_your_number')),
                input(phone, v => this.setState({ ovoPhone: v }), '0812xxxxxxx', { type: 'tel', inputMode: 'numeric' }),
                btn(s.payBusy ? this.tx('co_sending') : this.tx('co_ovo_pay'), () => this.retryPay({ channel: 'ovo', phone }), { disabled: s.payBusy || String(phone || '').replace(/\D/g, '').length < 9 }))),
        h('div', { style: box },
          h('div', { style: { fontWeight: 700 } }, 'ShopeePay, GoPay, DANA, LinkAja, AstraPay'),
          h('div', { style: small }, this.tx('co_ew_qris_hint')),
          btn(s.payBusy ? this.tx('co_generating') : this.tx('co_show_qr'), () => this.retryPay({ channel: 'qris' }), { ghost: true, disabled: s.payBusy })),
        err);
    }

    if (s.step === 'card') {
      const fmtNum = v => v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
      const fmtExp = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; };
      if (s.threeDs) {
        return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 } }, h('div', { style: { fontWeight: 700, minWidth: 0 } }, this.tx('co_3ds_title')), h('button', { onClick: () => this.cancel3ds(), style: { all: 'unset', cursor: 'pointer', fontSize: 13, textDecoration: 'underline', color: '#5a5a5a', minHeight: 44, display: 'inline-flex', alignItems: 'center' } }, this.tx('co_cancel'))),
          h('iframe', { src: s.threeDs, title: this.tx('co_3ds_frame'), style: { width: '100%', height: 480, border: '1px solid rgba(13,13,13,.1)', borderRadius: 16, background: '#fff' } }),
          h('div', { style: small }, this.tx('co_3ds_note')));
      }
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } }, amount,
        h('div', { style: box },
          h('div', { style: small }, this.tx('co_card_number')),
          input(s.cNum, v => this.setState({ cNum: fmtNum(v) }), '1234 5678 9012 3456', { inputMode: 'numeric', autoComplete: 'cc-number' }),
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } }, h('div', { style: small }, this.tx('co_expiry')), input(s.cExp, v => this.setState({ cExp: fmtExp(v) }), this.tx('co_mm_yy'), { inputMode: 'numeric', autoComplete: 'cc-exp' })),
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } }, h('div', { style: small }, 'CVV'), input(s.cCvv, v => this.setState({ cCvv: v.replace(/\D/g, '').slice(0, 4) }), '123', { inputMode: 'numeric', type: 'password', autoComplete: 'cc-csc' }))),
          btn(s.cardBusy ? this.tx('co_processing') : !s.xReady ? this.tx('co_loading') : this.tx('co_pay_amount', { amount: rp(total) }), () => this.payCard(), { disabled: s.cardBusy || !s.xReady })),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, ...small } }, h('img', { src: 'logos/visa-mastercard.webp', alt: 'Visa, Mastercard', style: { height: 18, flexShrink: 0 } }), this.tx('co_card_secured')),
        err);
    }
    return null;
  }
  payload() {
    const s = this.state, type = s.mode === 'grab' ? (GRAB_ONLINE ? 'pickup' : 'grab') : s.fulfil === 'delivery' ? 'delivery' : 'pickup';
    const p = { order_type: type, customer_name: s.name.trim(), customer_phone: s.phone.replace(/[\s-]/g, ''), customer_email: s.email.trim(), notes: '',
      items: this.cartLines().map(l => ({ menu_id: l.id, qty: l.qty, addon_option_ids: l.opts, note: '' })) };
    if (type !== 'grab') p.payment_method = s.pay;             // online methods (pickup/delivery, Grab & Go online)
    else if (s.grabPay) p.payment_method = s.grabPay;          // Grab & Go: planned OFFLINE method (code from master data)
    if (type === 'delivery') { p.delivery_address = s.address.trim(); p.driver_note = s.note.trim(); }
    if ((s.promo || '').trim()) p.voucher = s.promo.trim();
    p.language = I18N.lang();  // 'en' | 'id': the admin API stores it; the order's screens and messages use it
    return p;
  }
  createOrder() {
    if (this.state.busy || this._creating) return;  // instance flag: a double click lands before setState applies
    this._creating = true;
    const grab = this.state.mode === 'grab' && !GRAB_ONLINE;  // offline Grab & Go (old flow) only
    this.setState({ busy: true, err: '' });
    this._orderLang = I18N.lang();
    API().createOrder(grab ? this.payload() : Object.assign(this.payload(), { pay_opts: this.payOpts() })).then(res => {
      this._creating = false;
      this.setState({ busy: false, confirmOpen: false, created: res, code: res.code, token: res.access_token, step: grab ? 'done' : this.state.step });
      if (!grab) { API().payOpenSet({ code: res.code, token: res.access_token }); this.setPayUrl(res.code); }
      try { API().customerSet({ name: this.state.name.trim(), email: this.state.email.trim(), phone: this.state.phone.trim() }); } catch (e) {}
      // Fase 2: ordered from a table (table QR session) or Grab n Go. Done right away, before the customer pays;
      // the backend checks the table token and, once paid, a table order goes straight to the barista queue.
      if (API().setOrigin) { const ts = this.tableNow(); API().setOrigin(res.code, res.access_token, ts ? ts.token : null).catch(() => {}); }
      if (this.props.onPaid) this.props.onPaid(); // history picks up the new ref right away
      this.startLive();
      if (grab) return;  // Grab & Go: no online payment — the live status page takes over
      if (res.pay) this.usePay(res.pay, res.total);
      else { this.setState({ err: res.pay_error || { k: 'co_err_start_pay' } }); this.startWait(); }
    }).catch(e => { this._creating = false; this.setState({ busy: false, err: msgOf(e, 'co_err_create') }); });
  }
  // Grab & Go: the customer can cancel only while still awaiting barista confirmation.
  cancelOrder() {
    const s = this.state; if (!s.code || s.busy) return;
    this.setState({ busy: true, err: '' });
    API().cancelMyOrder(s.code, s.token).then(o => this.setState({ busy: false, live: o })).catch(e => this.setState({ busy: false, err: msgOf(e, 'co_err_cancel') }));
  }
  startLive() {
    this.stopLive();
    const t = this.state.token; if (!t) return;
    this._unwatch = API().watch(t, () => this.fetchLive());
    this._lpAt = 0;
    // Payment open: ask every 5 s (server asks Xendit). Stops on a final payment state, and while the tab is hidden
    // (10 min hidden = no more background polling; coming back to the tab checks right away).
    this._lp = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      const lv = this.state.live, final = !!lv && (lv.payment_status === 'paid' || lv.payment_status === 'expired' || lv.payment_status === 'failed' || lv.status === 'cancelled');
      const waiting = PAYING_STEPS.includes(this.state.step) && !this.state.threeDs && !final;
      if (waiting || Date.now() - this._lpAt > 20000) this.fetchLive();
    }, 5000);
    this._vis = () => { if (document.visibilityState === 'visible') this.fetchLive(); }; document.addEventListener('visibilitychange', this._vis);
    // 1s tick so the Grab & Go "sisa waktu konfirmasi" countdown stays live while the order waits for the barista
    clearInterval(this._nowTick);
    this._nowTick = setInterval(() => { const lv = this.state.live; if (lv && lv.type === 'grab' && lv.status === 'pending_confirmation') this.setState({ now: Date.now() }); }, 1000);
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
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent(this.tx('co_wa_nudge', { code: s.code, amount: amt }));
  }
  stopLive() { this._unwatch && this._unwatch(); this._unwatch = null; clearInterval(this._lp); clearInterval(this._nowTick); if (this._vis) document.removeEventListener('visibilitychange', this._vis); }
  fetchLive() {
    const { code, token } = this.state; if (!code || !token) return;
    this._lpAt = Date.now();
    const settle = this.state.mode !== 'venue' && PAYING_STEPS.includes(this.state.step) ? API().payStatus(code, token).catch(() => null) : Promise.resolve();
    settle.then(() => this.state.mode === 'venue' ? API().getMyOrders().then(l => l.find(o => o.code === code)) : API().getOrder(code, token)).then(o => {
      if (!o || this.state.mode === 'venue' || !API().queueInfo) return o;
      // QR Meja Fase 3: queue code (#A23), origin, table and closing time come from cafe_order_queue_info.
      return API().queueInfo(code, token).then(q => (q && q.ok ? { ...o, order_origin: q.order_origin, queue_code: q.queue_code, table_label: q.table_label, close_time: q.close_time, claimable: q.claimable } : o)).catch(() => o);
    }).then(o => {
      if (!o) return;
      const paying = PAYING_STEPS.includes(this.state.step);
      this.setState(paying ? { live: o, lastCheck: Date.now() } : { live: o });
      if (o.kind !== 'venue' && o.payment_status === 'paid' && (paying || this.state.step === 'pay')) this.paidNow(o);
    }).catch(() => {});
  }
  venueSub() { return this.cartLines().reduce((a, i) => a + i.base * i.qty, 0); }
  waText() {
    const s = this.state, x = (k, v) => this.tx(k, v), lines = [x('co_wa_v_hi'), '', x('co_wa_v_name', { v: s.name.trim() }), x('co_wa_v_date', { v: s.date || '-' }),
      x('co_wa_v_time', { v: (s.vStart || '-') + ' – ' + (s.vEnd || '-') }), x('co_wa_v_event', { v: x('co_ev_' + s.event.toLowerCase()) }), x('co_wa_v_guests', { n: s.guests }),
      x('co_wa_v_package', { v: s.refresh ? x('co_with_refreshments') : x('co_venue_only') })];
    if (s.refresh) {
      lines.push(x('co_wa_v_serve', { v: s.vServe || '-' }));
      const cl = this.cartLines();
      if (cl.length) { lines.push('', x('co_wa_v_refresh')); cl.forEach(i => lines.push('- ' + i.qty + '× ' + i.name + ' (' + rp(i.base * i.qty) + ')')); lines.push(x('co_wa_v_subtotal', { v: rp(this.venueSub()) })); }
    }
    lines.push('', x('co_wa_v_ref', { v: s.code || '' }));
    return lines.join('\n');
  }
  waUrl() { const n = String((this.state.cfg && this.state.cfg.wa_number) || this.props.waNumber || '').replace(/\D/g, ''); return 'https://wa.me/' + n + '?text=' + encodeURIComponent(this.waText()); }
  sendWa() {
    if (this.state.busy) return;
    const s = this.state, w = window.open('', '_blank'); // open now (user gesture), point it at WhatsApp once we have the code
    this.setState({ busy: true, err: '' });
    API().createVenue({ event_date: s.date, event_type: s.event.toLowerCase(), guests: s.guests, package: s.refresh ? 'with_refreshments' : 'venue_only',
      start_time: s.vStart, end_time: s.vEnd, serve_time: s.refresh ? s.vServe : null,
      items: s.refresh ? this.cartLines().map(l => ({ menu_id: l.id, qty: l.qty, addon_option_ids: l.opts })) : [],
      customer_name: s.name.trim(), customer_phone: s.phone.replace(/[\s-]/g, '') })
      .then(res => {
        this.setState({ busy: false, code: res.code, token: res.access_token, created: { est_price: res.est_price }, step: 'done' }, () => {
          if (w) w.location.href = this.waUrl(); else window.open(this.waUrl(), '_blank', 'noopener');
          API().cartSet({});  // request sent: the refreshments are in it
          if (this.props.onPaid) this.props.onPaid();
          this.startLive();
        });
      })
      .catch(e => { if (w) w.close(); this.setState({ busy: false, err: msgOf(e, 'co_err_venue') }); });
  }
  sendRating(food, service, comment) {
    if (!food || !service || !this.state.code) return;
    clearTimeout(this._rt);
    this._rt = setTimeout(() => API().rate(this.state.code, food, service, comment).then(() => this.setState({ rateMsg: { k: 'co_rate_saved' } })).catch(e => this.setState({ rateMsg: msgOf(e, 'co_err_generic') })), 600);
  }
  finish() {
    if (this._closing) return; this._closing = true;
    this.stopLive(); clearInterval(this._qi);
    if (this.state.code && this.props.onPaid) this.props.onPaid();
    this.cleanUrl();
    this.props.onClose && this.props.onClose();
  }
  prev() { const s = this.state; return { visit: 'mode', menu: 'mode', confirm: 'menu', venue: 'mode', pay: s.mode === 'grab' ? 'menu' : 'confirm', }[s.step]; }
  setQty(key, id, d) { this.setState(s => ({ [key]: { ...s[key], [id]: Math.max(0, (s[key][id] || 0) + d) } })); }

  renderVals() {
    const L = this.viewLang(), x = (k, v) => T(k, v, L);
    const s = this.state, { lines, total, estimate } = this.bill(), cfg = s.cfg || {}, live = s.live, A = API();
    const method = METHODS.find(m => m.id === s.pay) || { id: '', label: 'co_payment', qr: true };  // '' until the buyer picks one
    const mLabel = m => (m.label === 'co_m_qris' ? 'QRIS' : x(m.label));
    const g = s.mode === 'grab';  // Grab & Go screens
    const gOff = g && !GRAB_ONLINE;  // old flow: pay offline at the cafe after barista confirmation
    const cartN = this.cartLines().reduce((a, i) => a + i.qty, 0);
    const cartSum = this.cartLines().reduce((a, i) => a + i.price * i.qty, 0);
    const vNameOk = okName(s.name), vPhoneOk = okPhone(s.phone), slotRem = this.remaining(s.slot), slotOk = !!s.slot && (slotRem === null || slotRem >= s.pax);
    const paid = !!live && live.payment_status === 'paid', st = this.stx(live);
    // Grab & Go cancel window: the barista must confirm within grab_confirm_timeout_min of the order being placed;
    // until then the customer may still cancel. Remaining time comes from config (not hardcoded) + the order's created_at.
    const grabPending = g && live && live.status === 'pending_confirmation' && live.created_at;
    const grabLeftSec = grabPending ? Math.max(0, Math.floor((Date.parse(live.created_at) + (Number(cfg.grab_confirm_timeout_min) || 15) * 60000 - (s.now || Date.now())) / 1000)) : 0;
    const grabLeft = grabPending ? Math.floor(grabLeftSec / 60) + ':' + String(grabLeftSec % 60).padStart(2, '0') : '';
    const titles = { mode: [x('co_k_order'), x('co_h_mode')], visit: [x('co_k_dine'), x('co_h_visit')], menu: [g ? 'Grab & Go' : (s.mode === 'dine' ? x('co_k_dine') : x('co_k_take')), g ? x('co_h_menu_grab') : (s.mode === 'dine' ? x('co_h_menu_dine') : x('co_h_menu_take'))], confirm: [x('co_k_take'), x('co_h_confirm')], venue: [x('co_k_venue'), x('co_h_venue')], pay: [g ? 'Grab & Go' : x('co_payment'), gOff ? x('co_h_pay_off') : g ? x('co_h_pay_grab') : x('co_h_pay')], qr: [mLabel(method), x('co_h_qr')], wait: [x('co_payment'), x('co_h_wait')], va: [x('co_m_va'), x('co_h_va')], ewallet: [x('co_m_ewallet'), x('co_h_ewallet')], card: [s.pay === 'debit' ? x('co_m_debit') : x('co_m_credit'), x('co_h_card')], done: [g ? 'Grab & Go' : x('co_k_order'), g ? x('co_h_done_grab') : (s.mode === 'venue' ? x('co_h_done_venue') : x('co_h_done'))] };
    const nameOk = okName(s.name), emailOk = okEmail(s.email), phoneOk = okPhone(s.phone), detailsOk = nameOk && emailOk && phoneOk;
    const qrLeft = s.step === 'qr' ? Math.max(0, Math.ceil((s.qrEnd - (s.now || Date.now())) / 1000)) : QR_SECONDS;
    const qrSpan = Math.max(60, Math.round((s.qrEnd - s.qrStart) / 1000) || QR_SECONDS);
    const payFailed = !!live && (live.payment_status === 'expired' || live.payment_status === 'failed');
    const qrExpired = s.step === 'qr' && qrLeft === 0;
    // Payment page state: waiting | expired (QR ran out / order expired or cancelled) | failed | paid
    const lvDead = !!live && (live.payment_status === 'expired' || (live.status === 'cancelled' && live.payment_status !== 'paid'));
    const payState = paid ? 'paid' : live && live.payment_status === 'failed' ? 'failed' : (lvDead || qrExpired) ? 'expired' : 'waiting';
    const onPayPage = ['qr', 'wait', 'va', 'ewallet'].includes(s.step) && !!s.code;
    const statusCta = payState === 'expired' ? [s.payBusy ? x('co_starting') : x('co_try_again'), () => this.tryAgain(), s.payBusy]
      : payState === 'failed' ? [x('co_change_method'), () => this.setState({ step: 'pay', err: '' }), false]
      : [s.checking ? x('co_checking') : x('co_refresh_status'), () => this.refreshStatus(), s.checking];
    const ctas = {
      visit: [slotOk ? x('co_cta_to_menu') : x('co_cta_pick_time'), () => this.setState({ step: 'menu' }), !slotOk],
      menu: [cartN ? x('co_cta_next', { n: cartN, total: rp(cartSum) }) : x('co_cta_add_first'), () => this.setState({ step: g || s.mode === 'dine' ? 'pay' : 'confirm' }), !cartN],
      confirm: [x('co_h_confirm'), () => this.setState({ step: 'pay' }), s.fulfil === 'pickup' ? !s.name.trim() : !s.address.trim()],
      venue: [s.busy ? x('co_sending') : x('co_cta_wa'), () => this.sendWa(), !s.date || !vNameOk || !vPhoneOk || !s.vStart || !s.vEnd || s.busy || (s.refresh && (!s.vServe || this.cartLines().reduce((a, i) => a + i.qty, 0) < (Number((s.cfg || {}).venue_refresh_min) || 0)))],
      pay: gOff
        ? [s.busy ? x('co_sending') : detailsOk ? x('co_cta_send_order') : x('co_cta_fill_details'), () => this.createOrder(), !detailsOk || s.busy || cfg.ordering_open === false]
        : !this.cartLines().length && !s.code ? null
          : [s.busy || s.payBusy || s.cardBusy ? (s.threeDs ? x('co_wait_bank') : x('co_processing')) : !detailsOk ? x('co_cta_fill_to_pay') : !s.pay ? x('co_cta_choose_method') : x('co_cta_continue_pay', { total: rp(total) }), () => (g ? this.startConfirm() : this.submitPay()), !detailsOk || !s.pay || s.busy || s.payBusy || s.cardBusy || !this.dropOk() || cfg.ordering_open === false],
      qr: statusCta,
      wait: s.code ? statusCta : null,
      va: s.code && (s.vaInfo || payState !== 'waiting') ? statusCta : null,
      ewallet: s.code && (s.ovoSent || payState !== 'waiting') ? statusCta : null,
      done: [g ? x('co_cta_back_home') : x('co_cta_done'), () => this.finish(), false]
    };
    const cta = ctas[s.step];
    const delivery = s.fulfil === 'delivery';
    const tr = live && live.kind !== 'venue' && live.type !== 'dine_in' ? this.trx(live) : { steps: [], idx: -1 };
    const last = tr.steps.length - 1;
    const prog = delivery ? ({ driver_picked_up: 0.25, on_the_way: 0.6, completed: 1 })[live && live.status] || 0 : 0;
    const vst = (live && live.status) || 'new', vS = ['new', 'contacted', 'confirmed', 'completed'].map(k => [x('co_vs_' + k), x('co_vs_' + k + '_d')]);
    const vRank = { new: 0, contacted: 1, confirmed: 2, completed: 3, cancelled: -1 }[vst], vDone = vS.map((_, i) => vRank >= i);
    const cats = ['All'].concat([...new Set(this.menu().map(m => m.cat))]);
    const errMsg = this.msg(s.err) || (cfg.ordering_open === false && s.mode !== 'venue' ? x('co_err_closed') : '');
    const tbl = this.tableNow() && this.tableNow().label ? this.tableNow() : null;
    // SELF SERVICE info: payment received + live status of a pickup / table order (never on a venue booking)
    const selfShow = s.step === 'done' && g && !gOff && !!live && live.kind !== 'venue' && (paid || live.status === 'waiting_claim');
    const langBtn = on => ({ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', minWidth: 44, minHeight: 44, padding: '0 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 13, letterSpacing: '.08em', fontWeight: on ? 800 : 500, color: on ? '#0d0d0d' : '#8a8a8a', textDecoration: on ? 'underline' : 'none', textUnderlineOffset: 4, textDecorationThickness: 2, textDecorationColor: '#e30a2e' });
    return {
      close: () => this.finish(), stop: e => e.stopPropagation(),
      // ---- language (EN | ID switch in the top bar) ----
      t: I18N.table(L), lang: L, isEn: L === 'en', isId: L === 'id',
      setEn: () => this.pickLang('en'), setId: () => this.pickLang('id'), langEnStyle: langBtn(L === 'en'), langIdStyle: langBtn(L === 'id'),
      tabsTop: [['Grab & Go', 'grab', 'menu'], [x('co_k_venue'), 'venue', 'venue']].map(([label, mode, step]) => { const on = s.mode === mode; const locked = ['wait', 'done', 'qr'].includes(s.step) || !!s.created;
        return { label, pick: () => !locked && this.setState({ mode, step: mode === 'grab' && Object.keys(s.cart).length ? 'pay' : step }), style: { all: 'unset', cursor: locked ? 'default' : 'pointer', padding: '9px 16px', borderRadius: 999, whiteSpace: 'nowrap', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: '.03em', textTransform: 'uppercase', background: on ? '#0d0d0d' : 'transparent', color: on ? '#fff' : '#3a3a3a', opacity: locked && !on ? .4 : 1 } }; }),
      progress: (() => { const flow = s.mode === 'grab' ? ['menu', 'pay', 'done'] : s.mode === 'dine' ? ['visit', 'menu', 'pay', 'done'] : s.mode === 'take' ? ['menu', 'confirm', 'pay', 'done'] : s.mode === 'venue' ? ['venue', 'done'] : ['mode']; const stp = PAYING_STEPS.includes(s.step) ? 'pay' : s.step; const idx = flow.indexOf(stp);
        return flow.map((_, i) => ({ flex: 1, height: 4, borderRadius: 2, background: i <= idx ? '#e30a2e' : 'rgba(13,13,13,.12)', transition: 'background .3s' })); })(),
      canBack: !!this.prev() && !s.cardBusy && !(s.step === 'pay' && !s.code && g && this.props.onMenu), back: () => { if (s.step === 'pay' && s.code) this.stopLive(); this.setState(s.step === 'pay' && s.code ? { step: this.prev(), code: '', token: '', created: null, live: null, err: '' } : { step: this.prev() }); },
      kicker: s.step === 'pay' && g && !s.code ? 'Grab & Go' : onPayPage ? x('co_k_order_code', { code: s.code }) : titles[s.step][0],
      title: s.step === 'pay' && g && !s.code ? x('co_h_cart') : onPayPage ? x('co_payment') : titles[s.step][1],
      // ---- YOUR CART ----
      backToMenu: () => this.leave(true), canMenu: g && !s.code && !!this.props.onMenu && s.step === 'pay',
      cartEmpty: s.step === 'pay' && g && !s.code && !this.cartLines().length, cartHas: !(s.step === 'pay' && g && !s.code && !this.cartLines().length),
      cartRows: this.cartLines().map(l => ({ name: l.name, cat: l.cat ? I18N.cat(l.cat, L) : '', opt: l.optLabel, unitFmt: x('co_per_item', { price: rp(l.price) }), qty: l.qty, subFmt: rp(l.price * l.qty),
        edit: !s.code, inc: () => this.lineInc(l.key), dec: () => this.lineDec(l.key), del: () => this.lineDel(l.key),
        decLabel: x('co_aria_dec', { name: l.name }), incLabel: x('co_aria_inc', { name: l.name }), delLabel: x('co_aria_del', { name: l.name }),
        thumb: { width: 64, height: 64, flexShrink: 0, borderRadius: 14, backgroundColor: '#eceae5', backgroundImage: l.src ? 'url("' + l.src + '")' : 'none', backgroundSize: 'cover', backgroundPosition: 'center' } })),
      promoOn: !!(s.promoInfo && s.promoInfo.ok) && !s.code, promoOff: !(s.promoInfo && s.promoInfo.ok) && !s.code,
      promoName: s.promoInfo && s.promoInfo.ok ? (s.promoInfo.name || s.promoInfo.code) : '', promoCode: s.promoInfo && s.promoInfo.ok ? s.promoInfo.code : '',
      promoCut: s.promoInfo && s.promoInfo.ok ? '−' + rp(s.promoInfo.discount) : '', removePromo: () => this.removePromo(),
      // ---- PAYMENT page ----
      onPayPage, payOrderNo: s.code,
      payBadge: x({ waiting: 'co_pay_waiting', expired: 'co_pay_expired', failed: 'co_pay_failed', paid: 'co_pay_received' }[payState]),
      payBadgeStyle: { padding: '7px 13px', borderRadius: 999, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', whiteSpace: 'nowrap', fontWeight: 600,
        background: { waiting: '#f5c542', expired: '#d9d7d2', failed: '#fdecef', paid: '#128c4a' }[payState], color: { waiting: '#0d0d0d', expired: '#3a3a3a', failed: '#c70026', paid: '#fff' }[payState] },
      payNote: payState === 'expired' ? (lvDead ? x('co_pn_order_expired') : x('co_pn_qr_expired')) : payState === 'failed' ? x('co_pn_failed') : x('co_pn_waiting'),
      payItems: (((live && live.items) || []).length ? live.items.map(i => ({ label: i.qty + '× ' + i.name, value: rp(i.subtotal) })) : this.cartLines().map(i => ({ label: i.qty + '× ' + i.name, value: rp(i.price * i.qty) }))),
      payTotalFmt: rp((live && live.total) || (s.created && s.created.total) || total), payMethodLabel: s.pay ? mLabel(method) : '', payLogos: this.methodLogos(s.pay), hasPayLogos: !!s.pay,
      lastChecked: s.lastCheck ? x('co_last_checked', { time: new Date(s.lastCheck).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit' }) }) : x('co_checking_auto'),
      canDownloadQr: s.step === 'qr' && !!s.qrStr && !qrExpired, downloadQr: () => this.downloadQr(),
      // ---- PAYMENT RECEIVED ----
      paidInfo: g && !gOff && paid && s.step === 'done',
      paidRows: paid ? [[x('co_order_number'), s.code], [x('co_total_paid'), rp(live.total)], [x('co_paid_at'), this.dateTime(live.paid_at || ((live.timeline || []).find(t => t.to === 'received') || {}).at || live.updated_at)], [x('co_payment_method'), this.methodLabel(live.payment_method)]].map(([k, v]) => ({ k, v })) : [],
      paidItems: paid ? (live.items || []).map(i => ({ label: i.qty + '× ' + i.name + (i.options ? ' · ' + this.optionsText(i.options) : ''), value: rp(i.subtotal) })) : [],
      orderAgain: () => this.leave(true),
      isMode: s.step === 'mode', isDeals: s.step === 'deals', isVisit: s.step === 'visit', isMenu: s.step === 'menu', isConfirm: s.step === 'confirm', isVenue: s.step === 'venue', isPay: s.step === 'pay', isQr: s.step === 'qr', isPanel: PANEL_STEPS.includes(s.step), panel: PANEL_STEPS.includes(s.step) ? this.panel(total) : null, isProc: s.step === 'wait' && payState === 'waiting', isDone: s.step === 'done',
      isGrab: g, isGrabOffline: gOff, showPay: !gOff,  // showPay gates the online payment-method section in the pay step
      grabHint: gOff ? x('co_grab_hint_off') : x('co_grab_hint'),
      // ---- Fase 2: order origin (table QR session) ----
      originShow: g && s.step === 'pay' && !s.code && this.cartLines().length > 0,
      originIsTable: !!tbl,
      originTitle: tbl ? x('co_origin_table', { table: tbl.label }) : 'Grab n Go',
      originNote: tbl ? x('co_origin_table_note') : x('co_origin_grab_note', { time: (cfg.close_time || '21.00') }),
      originStyle: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 18, background: tbl ? '#fdecef' : '#fff', border: '1px solid ' + (tbl ? 'rgba(227,10,46,.35)' : 'rgba(13,13,13,.08)') },
      originBadge: tbl ? x('co_badge_table') : 'GO',
      confOrigin: tbl ? x('co_origin_table', { table: tbl.label }) : x('co_conf_origin_grab'),
      confName: (s.name || '').trim(),
      confIsGrab: !tbl,
      confGrabNote: x('co_conf_grab_note', { time: (cfg.close_time || '21.00') }),
      confSelf: x('co_self_line'),
      // ---- SELF SERVICE box (payment received / live status) ----
      selfShow, selfTitle: x('co_self_title'), selfBody: x('co_self_body'),
      // ---- CONFIRM YOUR ORDER modal ----
      confOpen: !!s.confirmOpen && s.step === 'pay' && !s.code,
      confItems: this.cartLines().map(l => ({ name: l.name, opt: l.optLabel, qty: '× ' + l.qty, subFmt: rp(l.price * l.qty) })),
      confHasVoucher: !!(s.promoInfo && s.promoInfo.ok), confVoucher: s.promoInfo && s.promoInfo.ok ? (s.promoInfo.name || s.promoInfo.code) + ' (' + s.promoInfo.code + ')' : '',
      confVoucherCut: s.promoInfo && s.promoInfo.ok ? '−' + rp(s.promoInfo.discount) : '',
      confMethod: s.pay ? mLabel(method) + (s.pay === 'va' ? ' · ' + (s.vaBank || 'BCA') : s.pay === 'ewallet' ? ' · ' + (s.ewChoice === 'ovo' ? 'OVO' : 'QRIS (ShopeePay, GoPay, DANA…)') : '') : '',
      confLogos: this.methodLogos(s.pay), confTotal: rp(total),
      confErr: s.confirmOpen ? errMsg : '', confHasErr: !!(s.confirmOpen && errMsg),
      confYesLabel: s.busy || s.payBusy || s.cardBusy ? x('co_processing') : x('co_yes_continue'), confBusy: !!(s.busy || s.payBusy || s.cardBusy),
      confYes: () => this.confirmGo(), confEdit: () => this.confirmCancel(), confStop: e => e.stopPropagation(),
      confBackdrop: e => { if (e.target === e.currentTarget) this.confirmCancel(); },
      // Grab & Go paid online: tracker + how to claim (no WhatsApp in this flow).
      grabTrack: g && !gOff && !!live && live.payment_status === 'paid' && tr.steps.length > 0,
      claimName: (live && live.customer_name) || s.name, claimCode: live && live.queue_code ? '#' + live.queue_code + ' (' + s.code + ')' : s.code,
      grabCodeLabel: live && live.queue_code ? x('co_queue_code') : x('co_order_code'),
      grabCodeSmall: live && live.queue_code ? s.code : '',
      // QR Meja Fase 3: Grab n Go accepted, waiting for the customer to claim at the cafe.
      waitClaim: !!(live && live.status === 'waiting_claim'),
      waitClaimTitle: x('co_wc_title'),
      waitClaimItems: ((live && live.items) || []).map(i => i.qty + '× ' + i.name).join(', '),
      waitClaimUntil: x('co_wc_until', { time: (live && live.close_time) || '21:00' }),
      pickupTitle: live && live.order_origin === 'table' ? x('co_pk_table_t') : x('co_pk_t'),
      pickupNote: live && live.order_origin === 'table' ? x('co_pk_table_d') : x('co_pk_d'),
      doneGrab: g, grabPill: st.pill, grabSub: st.sub + (grabLeft ? ' · ' + x('co_confirm_left', { time: grabLeft }) : ''), grabPillStyle: A.pillStyle(st),
      grabCode: live && live.queue_code ? '#' + live.queue_code : s.code, grabWaiting: gOff && (!live || live.status === 'pending_confirmation'),
      canCancel: gOff && live && live.status === 'pending_confirmation', cancelLeft: grabLeft, cancelOrder: () => this.cancelOrder(),
      modes: [
        { badge: 'GO', label: 'Grab & Go', desc: GRAB_ONLINE ? x('co_mode_grab') : x('co_mode_grab_off'), pick: () => this.setState({ mode: 'grab', step: Object.keys(s.cart).length ? 'pay' : 'menu' }) },
        { badge: 'EV', label: x('co_k_venue'), desc: x('co_mode_venue'), pick: () => this.setState({ mode: 'venue', step: 'venue' }) }
      ],
      deals: DEALS.map(d => { const q = s.deals[d.id] || 0; return { ...d, qty: q, priceFmt: rp(d.price), worthFmt: rp(d.worth), pick: () => this.setQty('deals', d.id, q ? 0 : 1), inc: () => this.setQty('deals', d.id, 1), dec: () => this.setQty('deals', d.id, -1),
        style: { display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, background: '#fff', border: '2px solid ' + (q ? '#e30a2e' : 'rgba(13,13,13,.08)') } }; }),
      pax: s.pax, paxDown: () => this.setState({ pax: Math.max(1, s.pax - 1) }), paxUp: () => this.setState({ pax: Math.min(12, s.pax + 1) }),
      days: Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); const on = s.dayI === i;
        return { top: i === 0 ? x('co_today') : i === 1 ? x('co_tmrw') : this.fmtDay(d, { weekday: 'short' }), num: d.getDate(), mon: this.fmtDay(d, { month: 'short' }), pick: () => { this.setState({ dayI: i }); this.loadAvail(i); },
          style: { all: 'unset', cursor: 'pointer', flexShrink: 0, width: 64, padding: '10px 0', borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: on ? '#0d0d0d' : '#fff', color: on ? '#fff' : '#0d0d0d', border: '1px solid ' + (on ? '#0d0d0d' : 'rgba(13,13,13,.12)') } }; }),
      dayLabel: this.dayText(),
      slots: (cfg.slots || []).map(t => { const r = this.remaining(t), full = r !== null && r < s.pax; return { label: t + (full ? ' · ' + x('co_full') : ''), pick: () => !full && this.setState({ slot: t }), style: { ...chip(s.slot === t && !full), opacity: full ? .4 : 1, cursor: full ? 'not-allowed' : 'pointer' } }; }),
      cats: cats.map(c => ({ label: c === 'All' ? x('co_all') : I18N.cat(c, L), pick: () => this.setState({ cat: c }), style: chip(s.cat === c) })),
      pageStyle: { maxWidth: s.step === 'menu' ? 1240 : 720, margin: '0 auto', padding: '32px 24px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 72px)' },
      menuSections: [...new Set(this.menu().map(m => m.cat))].filter(c => s.cat === 'All' || c === s.cat).map(c => { const items = this.menu().filter(m => m.cat === c).map(m => { const q = this.qtyOf(m.id); return { name: m.name, priceFmt: m.available ? rp(m.price) : x('co_sold_out'), qty: q, none: !q, some: q > 0, inc: () => this.incItem(m), dec: () => this.decItem(m), addLabel: m.available ? x('co_add') : x('co_sold_out'), addStyle: { all: 'unset', boxSizing: 'border-box', cursor: m.available ? 'pointer' : 'not-allowed', width: '100%', textAlign: 'center', padding: 10, borderRadius: 999, background: m.available ? '#0d0d0d' : '#c9c7c2', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 16, textTransform: 'uppercase' },
        thumb: { display: 'block', aspectRatio: '1', backgroundColor: '#eceae5', backgroundImage: 'url("' + m.src + '")', backgroundSize: 'cover', backgroundPosition: 'center' } }; }); return { cat: I18N.cat(c, L), count: x(items.length === 1 ? 'co_n_item' : 'co_n_items', { n: items.length }), items }; }),
      menuRows: this.menu().filter(m => s.cat === 'All' || m.cat === s.cat).map(m => { const q = this.qtyOf(m.id); return { name: m.name, priceFmt: rp(m.price), qty: q, none: !q, some: q > 0, inc: () => this.incItem(m), dec: () => this.decItem(m),
        thumb: { width: 56, height: 56, flexShrink: 0, borderRadius: 14, backgroundColor: '#eceae5', backgroundImage: 'url("' + m.src + '")', backgroundSize: 'cover', backgroundPosition: 'center' } }; }),
      orderLines: this.cartLines().map(i => ({ label: i.qty + '× ' + i.name + (i.optLabel ? ' (' + i.optLabel + ')' : ''), value: rp(i.price * i.qty) })), editOrder: () => this.setState({ step: 'menu' }),
      fulfils: [['pickup', x('co_ful_pickup'), x('co_ful_pickup_d')], ['delivery', x('co_ful_deliv'), x('co_ful_deliv_d')]].map(([id, label, desc]) => ({ label, desc, pick: () => this.setState({ fulfil: id }), style: card(s.fulfil === id) })),
      isPickup: s.fulfil === 'pickup', isDeliv: delivery,
      name: s.name, setName: e => this.setState({ name: e.target.value }),
      address: s.address, note: s.note, setAddress: e => this.setState({ address: e.target.value }), setNote: e => this.setState({ note: e.target.value }),
      guests: s.guests, guestDown: () => this.setState({ guests: Math.max(10, s.guests - 5) }), guestUp: () => this.setState({ guests: Math.min(60, s.guests + 5) }),
      date: s.date, setDate: e => this.setState({ date: e.target.value }),
      sessions: SESSIONS.map(t => ({ label: t, pick: () => this.setState({ session: t }), style: chip(s.session === t) })),
      vStart: s.vStart, vEnd: s.vEnd, vServe: s.vServe,
      setVStart: e => this.setState({ vStart: e.target.value }), setVEnd: e => this.setState({ vEnd: e.target.value }), setVServe: e => this.setState({ vServe: e.target.value }),
      venueOpen: cfg.venue_hours_start || '08:00', venueClose: cfg.venue_hours_end || '22:00',
      venueWithRefresh: s.refresh, venueSubFmt: rp(this.venueSub()), venueCount: this.cartLines().reduce((a, i) => a + i.qty, 0), venueMin: Number(cfg.venue_refresh_min) || 0,
      venueMenu: this.menu().map(m => ({ name: m.name, priceFmt: rp(m.price), qty: this.qtyOf(m.id), avail: m.available !== false,
        inc: () => this.incItem(m), dec: () => this.decItem(m),
        rowStyle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(13,13,13,.06)', opacity: m.available !== false ? 1 : .45 } })),
      events: EVENTS.map(t => ({ label: x('co_ev_' + t.toLowerCase()), pick: () => this.setState({ event: t }), style: chip(s.event === t) })),
      refreshOpts: [[true, x('co_with_refreshments'), x('co_with_refreshments_d', { price: rp(cfg.venue_refresh_price || 0) })], [false, x('co_venue_only'), x('co_venue_only_d')]].map(([v, label, desc]) => ({ label, desc, pick: () => this.setState({ refresh: v }), style: card(s.refresh === v) })),
      waitElapsed: (() => { const t = Math.max(0, Math.floor(((s.now || Date.now()) - (this._w0 || Date.now())) / 1000)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); })(),
      waitNudge: !g && s.step === 'wait' && !(live && (live.payment_status === 'expired' || live.payment_status === 'failed')) && (s.now || 0) - (this._w0 || Date.now()) >= 45000,
      openNudge: () => window.open(this.nudgeUrl(), '_blank', 'noopener'),
      lines, totalFmt: rp(total), totalLabel: estimate ? x('co_est_total') : x('co_total'), taxNote: x('co_tax_incl'), payLabel: mLabel(method), code: s.code,
      promo: s.promo, setPromo: e => this.setState({ promo: (e.target.value || '').toUpperCase().replace(/\s/g, ''), promoInfo: null }),
      applyPromo: () => this.applyPromo(),
      promoMsg: s.promoBusy ? x('co_voucher_checking') : (s.promoInfo && !s.promoInfo.ok ? (this.msg(s.promoInfo.message) || x('co_voucher_invalid')) : ''),  // a valid voucher shows as the green chip
      promoMsgStyle: { fontSize: '12px', fontWeight: 600, color: s.promoInfo && s.promoInfo.ok ? '#1a7f3c' : '#e30a2e' },
      grabPayOpts: ((cfg.payment_methods) || []).map(m => ({ label: m.label, code: m.code, pick: () => { this.setState({ grabPay: m.code }); if ((s.promo || '').trim() && s.promoInfo) this.applyPromo(); },
        style: { all: 'unset', cursor: 'pointer', fontWeight: 700, fontSize: '13px', padding: '10px 14px', borderRadius: 12, background: s.grabPay === m.code ? '#fdecec' : '#fff', color: s.grabPay === m.code ? '#e30a2e' : '#0d0d0d', border: '1px solid ' + (s.grabPay === m.code ? '#e30a2e' : 'rgba(13,13,13,.12)') } })),
      grabPayShow: s.mode === 'grab',
      hasErr: !!errMsg && !s.confirmOpen, errMsg, vNameErr: s.name && !vNameOk ? x('co_err_name') : '', vPhoneErr: s.phone && !vPhoneOk ? x('co_err_wa') : '',
      waitTitle: payFailed ? st.pill : x('co_wait_title'), waitSub: payFailed ? x('co_wait_failed') : x('co_wait_sub', { code: s.code }),
      email: s.email, phone: s.phone,
      setEmail: e => this.setState({ email: e.target.value }), setPhone: e => this.setState({ phone: e.target.value }),
      nameErr: s.name && !nameOk ? x('co_err_name') : '', emailErr: s.email && !emailOk ? x('co_err_email') : '', phoneErr: s.phone && !phoneOk ? x('co_err_phone') : '',
      payLocked: !detailsOk, methodsWrap: { display: 'flex', flexDirection: 'column', gap: 10, opacity: detailsOk ? 1 : .45, pointerEvents: detailsOk ? 'auto' : 'none', transition: 'opacity .25s' },
      qrTimer: String(Math.floor(qrLeft / 60)).padStart(2, '0') + ':' + String(qrLeft % 60).padStart(2, '0'), qrExpired, qrActive: !qrExpired,
      qrBar: { height: '100%', borderRadius: 3, background: qrLeft <= 30 ? '#e30a2e' : '#0d0d0d', width: Math.min(100, qrLeft / qrSpan * 100) + '%', transition: 'width 1s linear, background .3s' },
      qrNote: x('co_qr_note', { min: Math.round(qrSpan / 60) }),
      qrBoxStyle: { padding: 16, borderRadius: 24, background: '#fff', border: '1px solid rgba(13,13,13,.08)', opacity: qrExpired ? .25 : 1, filter: qrExpired ? 'blur(2px)' : 'none', transition: 'opacity .3s' },
      methods: METHODS.map(m => ({ label: mLabel(m), desc: x(m.desc), drop: s.pay === m.id ? this.dropFor(m.id) : null,
        pick: () => { this.setState({ pay: m.id, err: '' }); if (m.id === 'credit' || m.id === 'debit') this.loadXendit(); },
        logos: m.logos.map(k => ({ src: logoSrc(k), alt: LOGO_ALT[k] })),
        ring: s.pay === m.id
          ? { width: 22, height: 22, borderRadius: '50%', boxSizing: 'border-box', flexShrink: 0, border: '2px solid #e30a2e', background: 'radial-gradient(circle, #e30a2e 0 5px, transparent 5px)' }
          : { width: 22, height: 22, borderRadius: '50%', boxSizing: 'border-box', flexShrink: 0, border: '2px solid #8c897e', background: '#fff' },
        style: { all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 18, background: '#fff', border: '1px solid ' + (s.pay === m.id ? '#e30a2e' : 'rgba(13,13,13,.1)'), boxShadow: s.pay === m.id ? '0 0 0 4px rgba(227,10,46,.08)' : 'none', transition: 'border-color .2s, box-shadow .2s' } })),
      qr: s.step === 'qr' && s.qrStr ? React.createElement('div', { style: { width: 220, height: 220 }, role: 'img', 'aria-label': x('co_qr_aria', { code: s.code }), dangerouslySetInnerHTML: { __html: A.qrSvg(s.qrStr, 220) } }) : null,
      doneTitle: gOff ? x('co_done_sent') : g ? x('co_pay_received') : s.mode === 'venue' ? x('co_h_done_venue') : x('co_done_paid'), doneSub: g ? (x('co_k_order_code', { code: s.code }) + ' · ' + rp((live && live.total) || total)) : s.mode === 'venue' ? x('co_cta_wa') + ' · ' + s.code : rp((live && live.total) || total) + ' · ' + mLabel(method) + ' · ' + s.code, waUrl: this.waUrl(),
      doneDine: !g && s.mode === 'dine', doneTrack: !g && s.mode === 'take', doneVenue: !g && s.mode === 'venue',
      voucherTitle: x('co_table_for', { n: (live && live.pax) || s.pax }),
      dineItems: ((live && live.items) || []).map(i => i.qty + '× ' + i.name).join(', '),
      visitLabel: x('co_visit_label', { day: live ? this.dayLabel(live.reservation_date) : this.dayText(), time: live ? (live.reservation_slot || '') : s.slot }),
      voucherStatus: st.pill || x('co_booked'), voucherPill: A.pillStyle(st),
      voucherNote: live && live.status === 'checked_in' ? x('co_dine_checked_note', { time: A.time(live.checked_in_at, L) }) : x('co_dine_note'),
      qrSmall: s.mode === 'dine' && s.step === 'done' && s.code ? React.createElement('div', { style: { width: 96, height: 96 }, dangerouslySetInnerHTML: { __html: A.qrSvg(s.code, 96) } }) : null,
      canRedeem: false,  // guests are checked in by the barista only redeem: () => A.arrived(s.code).then(() => this.fetchLive()).catch(e => this.setState({ err: e.message })),
      trackHead: st.pill || x('co_track_order'),
      eta: live ? A.time(live.updated_at, L) : '',
      isDelivDone: delivery, isPickDone: !delivery, hasDriver: delivery && !!(live && live.driver_name),
      driverName: (live && live.driver_name) || '', driverInfo: live ? [live.driver_vehicle, live.driver_plate].filter(Boolean).join(' · ') : '', driverInitials: String((live && live.driver_name) || '').split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase(),
      routeFill: { position: 'absolute', left: '12%', top: '50%', height: 4, marginTop: -2, borderRadius: 2, background: '#e30a2e', width: (76 * prog) + '%', transition: 'width 2.5s ease' },
      rider: { position: 'absolute', left: (12 + 76 * prog) + '%', top: '50%', transform: 'translate(-50%,-50%)', width: 34, height: 34, borderRadius: '50%', background: '#0d0d0d', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 13, boxShadow: '0 6px 16px rgba(13,13,13,.3)', transition: 'left 2.5s ease', animation: live && live.status === 'on_the_way' ? 'cBob .6s ease-in-out infinite' : 'none' },
      riderInitial: live && live.driver_name ? String(live.driver_name).split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase() : '…',
      track: tr.steps.map(([, t, d], i) => { const done = tr.idx > i || tr.idx === last, active = tr.idx === i && i !== last; return { t, d, mark: done ? '✓' : String(i + 1), dot: dot(done, active), titleStyle: { fontWeight: 700, fontSize: 15, color: done || active ? '#0d0d0d' : '#8a8a8a' } }; }),
      adminLabel: this.stx(live || { kind: 'venue', status: 'new', guests: s.guests }).pill, adminPill: pill('#e9f9ef', '#128c4a'),
      vSteps: vS.map(([t, d], i) => ({ t, d, mark: vDone[i] ? '✓' : String(i + 1), dot: dot(vDone[i], vRank + 1 === i) })),
      venueTicket: [{ k: x('co_booking_code'), v: s.code }, { k: x('co_date'), v: s.date || '-' }, { k: x('co_guests'), v: x('co_n_people', { n: s.guests }) }, { k: x('co_estimate'), v: rp((s.created && s.created.est_price) || 0) }],
      rateRows: [{ label: x('co_rate_food'), stars: [1, 2, 3, 4, 5].map(n => ({ pick: () => { this.setState({ rFood: n }); this.sendRating(n, s.rService, s.comment); }, style: { all: 'unset', cursor: 'pointer', fontSize: 26, lineHeight: 1, color: n <= (s.rFood || 0) ? '#e30a2e' : 'rgba(13,13,13,.18)' } })) },
        { label: x('co_service'), stars: [1, 2, 3, 4, 5].map(n => ({ pick: () => { this.setState({ rService: n }); this.sendRating(s.rFood, n, s.comment); }, style: { all: 'unset', cursor: 'pointer', fontSize: 26, lineHeight: 1, color: n <= (s.rService || 0) ? '#e30a2e' : 'rgba(13,13,13,.18)' } })) }],
      comment: s.comment || '', setComment: e => { this.setState({ comment: e.target.value }); this.sendRating(s.rFood, s.rService, e.target.value); }, rateMsg: this.msg(s.rateMsg), canRate: s.mode !== 'venue' && paid,
      hasCta: !!cta, ctaLabel: cta ? cta[0] : '', cta: cta ? cta[1] : null, ctaDisabled: cta ? cta[2] : false,
      ctaStyle: { all: 'unset', boxSizing: 'border-box', cursor: cta && cta[2] ? 'not-allowed' : 'pointer', width: '100%', textAlign: 'center', padding: 16, borderRadius: 999, background: cta && cta[2] ? '#c9c7c2' : '#e30a2e', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '.04em', textTransform: 'uppercase', boxShadow: cta && cta[2] ? 'none' : '0 10px 24px rgba(227,10,46,.3)' }
    };
  }
}
