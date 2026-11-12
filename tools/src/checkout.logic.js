
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
const METHODS = [
  { id: 'qris', label: 'QRIS', desc: 'Scan with any bank or e-wallet', qr: true, logos: ['qris'] },
  { id: 'ewallet', label: 'E-wallet', desc: 'OVO, ShopeePay, GoPay, DANA, LinkAja', logos: ['ovo', 'shopeepay'] },
  { id: 'credit', label: 'Credit Card', desc: 'Visa, Mastercard, JCB', logos: ['visamc'] },
  { id: 'debit', label: 'Debit Card', desc: 'Visa / Mastercard debit', logos: ['visamc'] },
  { id: 'va', label: 'Virtual Account', desc: 'BCA, Mandiri, BNI, BRI, Permata, BSI', logos: ['bca', 'mandiri', 'bni', 'bri'] }
];
// Every method is paid through Xendit (admin.20fit.id/api/cafe) WITHOUT leaving this page: QRIS shows a real
// Xendit QR, VA shows the account number, OVO pushes to the OVO app, cards are verified (3-D Secure) in-page.
const LOGO_ALT = { qris: 'QRIS', gopay: 'GoPay', ovo: 'OVO', shopeepay: 'ShopeePay', visa: 'Visa', visamc: 'Visa, Mastercard', mastercard: 'Mastercard', jcb: 'JCB', gpn: 'GPN', bca: 'BCA', mandiri: 'Mandiri', bni: 'BNI', bri: 'BRI' };
// Real brand marks where we have them (self-hosted in /logos, same files as the calorie app); the rest keep the lettermark SVGs.
const LOGO_SRC = { qris: 'logos/qris.png', ovo: 'logos/ovo-v2.svg', shopeepay: 'logos/shopeepay-v3.svg', bca: 'logos/bca.png', bni: 'logos/bni.png', bri: 'logos/bri.png', mandiri: 'logos/mandiri.webp', visamc: 'logos/visa-mastercard.webp' };
const logoSrc = k => LOGO_SRC[k] || ('logos/' + k + '.svg');
const QR_SECONDS = 900; // fallback only; the real window is the Xendit QR's expires_at
const okName = v => v.trim().length >= 2;
const okEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const okPhone = v => /^(\+?62|0)8\d{7,12}$/.test(v.replace(/[\s-]/g, ''));
const chip = on => ({ all: 'unset', cursor: 'pointer', padding: '10px 16px', borderRadius: 999, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', background: on ? '#0d0d0d' : '#fff', color: on ? '#fff' : '#0d0d0d', border: '1px solid ' + (on ? '#0d0d0d' : 'rgba(13,13,13,.12)') });
const card = on => ({ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, padding: 16, borderRadius: 20, background: '#fff', border: '2px solid ' + (on ? '#e30a2e' : 'rgba(13,13,13,.08)') });
const dot = (done, active) => ({ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13, background: done ? '#e30a2e' : active ? '#0d0d0d' : '#f1f0ed', color: done || active ? '#fff' : '#8a8a8a', transition: 'background .3s' });
const pill = (bg, fg) => ({ padding: '6px 12px', borderRadius: 999, background: bg, color: fg, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 });

class Component extends DCLogic {
  state = { step: 'mode', mode: null, cart: {}, cat: 'All', fulfil: 'pickup', name: '', address: '', note: '', deals: {}, pax: 2, dayI: 0, slot: '', date: '', session: SESSIONS[1], event: 'Birthday', guests: 20, refresh: true, pay: 'qris', email: '', phone: '', qrEnd: 0, qrStart: 0, qrStr: '', payBusy: false, vaBank: 'BCA', ewChoice: 'qris', vaInfo: null, ovoSent: null, ovoPhone: null, cardKey: '', xReady: false, cardBusy: false, threeDs: '', cNum: '', cExp: '', cCvv: '', copied: false, now: 0, qrSeed: 1, code: '', token: '', cfg: null, avail: {}, created: null, live: null, partySize: '', grabPay: '', promo: '', promoInfo: null, promoBusy: false, busy: false, err: '', rateMsg: 'You can also rate later from Purchase History.' };
  componentDidMount() {
    document.body.style.overflow = 'hidden';
    try { history.pushState({ order: 1 }, '', '#order'); } catch (e) {}
    this._pop = () => { if (this._closing) return; this._popped = true; this.finish(); }; window.addEventListener('popstate', this._pop);
    const cart = {}; (this.props.items || []).forEach(i => { cart[i.key || lineKey(i.id, i.opts)] = { id: i.id, opts: i.opts || [], qty: i.qty }; });
    API().getConfig().then(cfg => { this.setState(s => ({ cfg, slot: s.slot || (cfg.slots || [])[0] || '', grabPay: s.grabPay || ((cfg.payment_methods || [])[0] || {}).code || '' })); this.loadAvail(this.state.dayI); }).catch(e => this.setState({ err: e.message }));
    const m = this.props.startMode, sub = this.props.startSub, has = Object.keys(cart).length > 0;
    const next = { cart };
    // Cafe is Grab & Go only now (order remotely, pay offline at the cafe). Everything routes to the grab flow; venue is separate.
    if (m === 'venue') Object.assign(next, { mode: 'venue', step: 'venue' });
    else Object.assign(next, { mode: 'grab', step: has ? 'pay' : 'menu' });
    this.setState(next);
  }
  componentWillUnmount() { (this._ts || []).forEach(clearTimeout); clearInterval(this._qi); clearInterval(this._wi); clearInterval(this._xw); clearTimeout(this._3t); this.stopLive(); window.removeEventListener('popstate', this._pop); document.body.style.overflow = ''; }
  later(fn, ms) { (this._ts = this._ts || []).push(setTimeout(fn, ms)); }
  dayText() { const d = new Date(); d.setDate(d.getDate() + (this.state.dayI || 0)); return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); }
  menu() { return this.props.menu || []; }
  item(id) { return this.menu().find(x => x.id === id) || null; }
  cartLines() { return Object.entries(this.state.cart).filter(([, l]) => l && l.qty > 0 && this.item(l.id)).map(([key, l]) => { const m = this.item(l.id); return { key, id: l.id, opts: l.opts || [], qty: l.qty, name: m.name, optLabel: optsLabel(m, l.opts), price: m.price + optsPrice(m, l.opts), base: (m.base != null ? m.base : m.price) + optsPrice(m, l.opts) }; }); }
  qtyOf(id) { return this.cartLines().filter(l => l.id === id).reduce((a, l) => a + l.qty, 0); }
  incItem(m) { if (!m.available) return; const o = defaultOpts(m), k = lineKey(m.id, o); this.setState(s => ({ cart: { ...s.cart, [k]: { id: m.id, opts: o, qty: ((s.cart[k] || {}).qty || 0) + 1 } } })); }
  decItem(m) { const lines = this.cartLines().filter(l => l.id === m.id); const d = lines.find(l => l.key === lineKey(m.id, defaultOpts(m))) || lines[lines.length - 1]; if (!d) return; this.setState(s => ({ cart: { ...s.cart, [d.key]: { ...s.cart[d.key], qty: Math.max(0, s.cart[d.key].qty - 1) } } })); }
  loadAvail(dayI) { const date = API().ymd(dayI); API().slotAvailability(date).then(list => this.setState(s => ({ avail: { ...s.avail, [date]: list || [] } }))).catch(() => {}); }
  remaining(slot) { const list = this.state.avail[API().ymd(this.state.dayI)]; if (!list) return null; const r = list.find(x => x.slot === slot); return r ? r.remaining : 0; }
  dealLines() { return DEALS.filter(d => this.state.deals[d.id] > 0).map(d => ({ ...d, qty: this.state.deals[d.id] })); }
  bill() {
    const s = this.state, cfg = s.cfg || {}, lines = [];
    if (s.created) { const c = s.created; [['Subtotal', c.subtotal], ['Service', c.service_charge], ['PB1 ' + (cfg.tax_percent != null ? cfg.tax_percent + '%' : ''), c.ppn], ['Delivery fee', c.delivery_fee]].forEach(([k, v]) => { if (k === 'Subtotal' || Number(v) > 0) lines.push({ label: k.trim(), value: rp(v) }); });
      if (Number(c.discount) > 0) lines.push({ label: 'Promo ' + (c.promo_code || ''), value: '-' + rp(c.discount) });
      return { lines, total: Number(c.total) || 0, estimate: false }; }
    if (s.mode !== 'dine' && s.mode !== 'take' && s.mode !== 'grab') return { lines, total: 0, estimate: true };
    this.cartLines().forEach(i => lines.push({ label: i.qty + '× ' + i.name + (i.optLabel ? ' (' + i.optLabel + ')' : ''), value: rp(i.base * i.qty) }));
    const sub = this.cartLines().reduce((a, i) => a + i.base * i.qty, 0);
    const svc = Math.round(sub * (Number(cfg.service_percent) || 0) / 100), tax = Math.round((sub + svc) * (Number(cfg.tax_percent) || 0) / 100);
    const del = s.mode === 'take' && s.fulfil === 'delivery' ? Number(cfg.delivery_fee) || 0 : 0;
    if (svc) lines.push({ label: 'Service ' + cfg.service_percent + '%', value: rp(svc) });
    if (cfg.tax_percent != null) lines.push({ label: 'PB1 ' + cfg.tax_percent + '%', value: rp(tax) });
    if (del) lines.push({ label: 'Delivery fee', value: rp(del) });
    const gross = sub + svc + tax + del, disc = this.promoDiscount(gross);
    if (disc > 0) lines.push({ label: 'Voucher ' + (s.promoInfo.code || ''), value: '-' + rp(disc) });
    return { lines, total: Math.max(0, gross - disc), estimate: true };
  }
  // Server (cafe_create_order / cafe_check_voucher) is authoritative; this only previews the discount in the bill.
  grossNow() {
    const s = this.state, cfg = s.cfg || {};
    if (s.mode !== 'dine' && s.mode !== 'take' && s.mode !== 'grab') return 0;
    const sub = this.cartLines().reduce((a, i) => a + i.base * i.qty, 0);
    const svc = Math.round(sub * (Number(cfg.service_percent) || 0) / 100), tax = Math.round((sub + svc) * (Number(cfg.tax_percent) || 0) / 100);
    const del = s.mode === 'take' && s.fulfil === 'delivery' ? Number(cfg.delivery_fee) || 0 : 0;
    return sub + svc + tax + del;
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
        : { ok: false, message: (r && r.message) || 'Kode voucher tidak berlaku' } }))
      .catch(e => this.setState({ promoBusy: false, promoInfo: { ok: false, message: (e && e.message) || 'Kode voucher tidak berlaku' } }));
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
      .catch(e => { this.setState({ payBusy: false, err: e.message || 'Could not start the payment' }); this.fetchLive(); });
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
  // One "Pay" button: creates the order with the choice, or (order already made, e.g. a declined card) pays again.
  submitPay() {
    const s = this.state; if (s.busy || s.payBusy || s.cardBusy) return;
    if (!s.code) return this.createOrder();
    if (s.pay === 'credit' || s.pay === 'debit') return this.payCard();
    this.retryPay(this.payOpts());
  }
  loadXendit(key, then) {
    const ready = () => { try { if (key) window.Xendit.setPublishableKey(key); this.setState({ xReady: true }); if (then) then(); } catch (e) { this.setState({ cardBusy: false, err: 'Card payment is not available right now. Please use QRIS.' }); } };
    if (window.Xendit && window.Xendit.card) return ready();
    if (document.getElementById('xendit-js')) { clearInterval(this._xw); this._xw = setInterval(() => { if (window.Xendit && window.Xendit.card) { clearInterval(this._xw); ready(); } }, 200); return; }
    const sc = document.createElement('script'); sc.id = 'xendit-js'; sc.src = 'https://js.xendit.co/v1/xendit.min.js'; sc.async = true;
    sc.onload = ready; sc.onerror = () => this.setState({ err: 'Could not load the card form. Check your connection or use QRIS.' });
    document.head.appendChild(sc);
  }
  payCard(amt) {
    const s = this.state, num = (s.cNum || '').replace(/\D/g, ''), exp = (s.cExp || '').replace(/\D/g, ''), cvv = (s.cCvv || '').replace(/\D/g, '');
    if (s.cardBusy || !(window.Xendit && window.Xendit.card)) return;
    if (num.length < 13 || exp.length !== 4 || cvv.length < 3) { this.setState({ err: 'Please complete your card details.' }); return; }
    const attempt = (this._ca = (this._ca || 0) + 1), amount = Math.round(Number(amt || (s.created && s.created.total) || 0));
    this.setState({ cardBusy: true, err: '', threeDs: '' });
    const bd = { given_names: s.name.trim() || 'Customer', email: s.email.trim() || undefined, mobile_number: s.phone ? '+62' + s.phone.replace(/\D/g, '').replace(/^(62|0)/, '') : undefined };
    window.Xendit.card.createToken({ amount, card_number: num, card_exp_month: exp.slice(0, 2), card_exp_year: '20' + exp.slice(2), card_cvn: cvv, is_multiple_use: false, should_authenticate: true, currency: 'IDR', billing_details: bd, customer: bd }, (error, token) => {
      if (attempt !== this._ca) return;  // Xendit.js calls back twice with 3DS; ignore a cancelled attempt
      if (error || !token || token.status === 'FAILED') {
        clearTimeout(this._3t);
        const code = String((error && (error.error_code || error.code)) || (token && token.failure_reason) || '');
        this.setState({ cardBusy: false, threeDs: '', cCvv: code === 'INVALID_CVN' ? '' : s.cCvv, err: (error && error.message && !/^[A-Z_]+$/.test(error.message) ? error.message : '') || 'Your card could not be verified. Check the details or try another card.' });
        return;
      }
      // First callback = the bank's OTP page (3-D Secure): show it here; the second callback brings the token.
      if (!token.authentication_id && token.status === 'IN_REVIEW' && token.payer_authentication_url) {
        this.setState({ threeDs: token.payer_authentication_url });
        clearTimeout(this._3t);
        this._3t = setTimeout(() => { if (attempt !== this._ca) return; this._ca++; this.setState({ cardBusy: false, threeDs: '', err: "We didn't get a verification result from your bank. Please try again." }); }, 240000);
        return;
      }
      clearTimeout(this._3t);
      this.setState({ threeDs: '' });
      if (!token.id || !token.authentication_id) { this.setState({ cardBusy: false, err: 'Card verification did not finish. Please try again.' }); return; }
      API().card(s.code, s.token, token.id, token.authentication_id)
        .then(() => { this.setState({ cardBusy: false, cNum: '', cCvv: '' }); this.fetchLive(); })
        .catch(e => this.setState({ cardBusy: false, cCvv: '', err: e.message || 'Card payment failed' }));
    });
  }
  cancel3ds() { this._ca = (this._ca || 0) + 1; clearTimeout(this._3t); this.setState({ cardBusy: false, threeDs: '' }); }
  copyVa(n) { try { navigator.clipboard.writeText(n); this.setState({ copied: true }); this.later(() => this.setState({ copied: false }), 2000); } catch (e) {} }
  // ---------- dropdown under the selected payment method (bank / e-wallet / card form, 3-D Secure) ----------
  dropFor(id) {
    const h = React.createElement, s = this.state;
    const wrap = ch => h('div', { style: { margin: '-4px 0 4px', padding: 14, borderRadius: '0 0 18px 18px', background: '#faf9f7', border: '1px solid rgba(227,10,46,.25)', borderTop: 'none', display: 'flex', flexDirection: 'column', gap: 10, animation: 'pFade .25s ease' } }, ch);
    const small = { fontSize: 13, color: '#5a5a5a', lineHeight: 1.45 };
    const chip = (on, label, onClick, logo) => h('button', { key: label, onClick, style: { all: 'unset', cursor: 'pointer', boxSizing: 'border-box', minHeight: 46, padding: '8px 12px', borderRadius: 14, background: '#fff', border: on ? '2px solid #e30a2e' : '1px solid rgba(13,13,13,.12)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, textAlign: 'center' } }, logo ? h('img', { src: logo, alt: label, style: { maxHeight: 22, maxWidth: 80 } }) : label);
    const input = (val, set, ph, extra) => h('input', Object.assign({ value: val || '', placeholder: ph, onChange: e => set(e.target.value), style: { boxSizing: 'border-box', width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(13,13,13,.15)', fontSize: 16, outline: 'none', background: '#fff', fontFamily: "'JetBrains Mono',monospace" } }, extra || {}));
    if (id === 'va') {
      const banks = [['BCA', 'logos/bca.png'], ['MANDIRI', 'logos/mandiri.webp'], ['BNI', 'logos/bni.png'], ['BRI', 'logos/bri.png'], ['PERMATA'], ['BSI'], ['CIMB']];
      return wrap([h('div', { key: 't', style: small }, 'Choose your bank · the virtual account number appears right here after you tap Pay'),
        h('div', { key: 'g', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(92px,1fr))', gap: 8 } }, banks.map(([b, logo]) => chip((s.vaBank || 'BCA') === b, b, () => this.setState({ vaBank: b }), logo)))]);
    }
    if (id === 'ewallet') {
      const ovo = s.ewChoice === 'ovo', phone = s.ovoPhone != null ? s.ovoPhone : s.phone;
      return wrap([h('div', { key: 'g', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
          chip(!ovo, 'ShopeePay · GoPay · DANA · LinkAja', () => this.setState({ ewChoice: 'qris' })),
          chip(ovo, 'OVO', () => this.setState({ ewChoice: 'ovo' }), 'logos/ovo-v2.svg')),
        ovo ? h('div', { key: 'o', style: { display: 'flex', flexDirection: 'column', gap: 6 } }, h('div', { style: small }, 'OVO number · we send the payment to your OVO app'), input(phone, v => this.setState({ ovoPhone: v }), '0812xxxxxxx', { type: 'tel', inputMode: 'numeric' }))
          : h('div', { key: 'q', style: small }, 'A QRIS code appears on this page · scan it with your e-wallet app.')]);
    }
    if (id === 'credit' || id === 'debit') {
      if (s.threeDs) {
        return wrap([h('div', { key: 'h', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, h('div', { style: { fontWeight: 700 } }, 'Verify with your bank'), h('button', { onClick: () => this.cancel3ds(), style: { all: 'unset', cursor: 'pointer', fontSize: 13, textDecoration: 'underline', color: '#5a5a5a' } }, 'Cancel')),
          h('iframe', { key: 'f', src: s.threeDs, title: '3-D Secure verification', style: { width: '100%', height: 460, border: '1px solid rgba(13,13,13,.1)', borderRadius: 14, background: '#fff' } }),
          h('div', { key: 'n', style: small }, 'Enter the OTP your bank sent you. Do not close this page.')]);
      }
      const fmtNum = v => v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
      const fmtExp = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; };
      return wrap([input(s.cNum, v => this.setState({ cNum: fmtNum(v) }), 'Card number', { key: 'n', inputMode: 'numeric', autoComplete: 'cc-number' }),
        h('div', { key: 'r', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
          input(s.cExp, v => this.setState({ cExp: fmtExp(v) }), 'MM/YY', { inputMode: 'numeric', autoComplete: 'cc-exp' }),
          input(s.cCvv, v => this.setState({ cCvv: v.replace(/\D/g, '').slice(0, 4) }), 'CVV', { inputMode: 'numeric', type: 'password', autoComplete: 'cc-csc' })),
        h('div', { key: 's', style: small }, 'Secured by Xendit · your bank may ask for an OTP right here. Your card number goes straight to Xendit, never to us.')]);
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
    const waiting = h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, ...small } }, h('span', { style: { width: 8, height: 8, borderRadius: '50%', background: '#e30a2e', animation: 'skPulse 1s ease-in-out infinite' } }), 'Waiting for your payment · this page updates automatically');
    const amount = h('div', { style: { ...mono, fontSize: 22, color: '#e30a2e', textAlign: 'center' } }, rp(total));
    const err = s.err ? h('div', { style: { padding: '10px 14px', borderRadius: 12, background: '#fdecef', color: '#b0001e', fontSize: 14 } }, s.err) : null;

    if (s.step === 'va') {
      const v = s.vaInfo;
      if (!v) {
        const banks = [['BCA', 'logos/bca.png'], ['MANDIRI', 'logos/mandiri.webp'], ['BNI', 'logos/bni.png'], ['BRI', 'logos/bri.png'], ['PERMATA'], ['BSI'], ['CIMB']];
        return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } }, amount,
          h('div', { style: { fontWeight: 700, fontSize: 16 } }, 'Choose your bank'),
          h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 } }, banks.map(([b, logo]) => h('button', { key: b, onClick: () => this.retryPay({ channel: 'va', bank: b }), disabled: s.payBusy,
            style: { all: 'unset', cursor: 'pointer', boxSizing: 'border-box', height: 64, borderRadius: 16, background: '#fff', border: '1px solid rgba(13,13,13,.12)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15, opacity: s.payBusy ? .5 : 1 } },
            logo ? h('img', { src: logo, alt: b, style: { maxHeight: 26, maxWidth: 90 } }) : b))),
          s.payBusy ? h('div', { style: small }, 'Creating your virtual account…') : null, err);
      }
      const grouped = String(v.va_number).replace(/(\d{4})(?=\d)/g, '$1 ');
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        h('div', { style: box },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, h('div', { style: { fontWeight: 700 } }, v.bank + ' Virtual Account'), h('div', { style: { ...mono, fontSize: 12, color: '#5a5a5a' } }, 'Pay before ' + A.time(v.expires_at))),
          h('div', { style: { ...mono, fontSize: 24, letterSpacing: '.04em', wordBreak: 'break-all' } }, grouped),
          btn(s.copied ? 'Copied ✓' : 'Copy number', () => this.copyVa(v.va_number), { ghost: true }),
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' } }, h('span', { style: small }, 'Amount (exact)'), h('span', { style: { ...mono, fontSize: 20, color: '#e30a2e' } }, rp(v.amount)))),
        h('div', { style: small }, 'Open your ' + v.bank + ' mobile banking, internet banking or ATM → Transfer → Virtual Account → enter the number above → confirm ' + rp(v.amount) + '.'),
        waiting, err,
        h('button', { onClick: () => this.setState({ vaInfo: null, err: '' }), style: { all: 'unset', cursor: 'pointer', fontSize: 14, textDecoration: 'underline', color: '#5a5a5a', alignSelf: 'center' } }, 'Use another bank'));
    }

    if (s.step === 'ewallet') {
      const sent = s.ovoSent, phone = s.ovoPhone != null ? s.ovoPhone : s.phone;
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } }, amount,
        h('div', { style: box },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } }, h('img', { src: 'logos/ovo-v2.svg', alt: 'OVO', style: { height: 22 } }), h('span', { style: { fontWeight: 700 } }, 'OVO')),
          sent
            ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
                h('div', { style: { fontSize: 15 } }, 'We sent the payment to OVO ' + sent.phone + '. Open your OVO app and confirm ' + rp(sent.amount) + ' within 60 seconds.'),
                waiting,
                btn(s.payBusy ? 'Sending…' : 'Send again', () => this.retryPay({ channel: 'ovo', phone }), { ghost: true, disabled: s.payBusy }),
                h('button', { onClick: () => this.setState({ ovoSent: null }), style: { all: 'unset', cursor: 'pointer', fontSize: 13, textDecoration: 'underline', color: '#5a5a5a' } }, 'Change OVO number'))
            : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
                h('div', { style: small }, 'Your OVO number (we send a payment notification to your OVO app)'),
                input(phone, v => this.setState({ ovoPhone: v }), '0812xxxxxxx', { type: 'tel', inputMode: 'numeric' }),
                btn(s.payBusy ? 'Sending…' : 'Pay with OVO', () => this.retryPay({ channel: 'ovo', phone }), { disabled: s.payBusy || String(phone || '').replace(/\D/g, '').length < 9 }))),
        h('div', { style: box },
          h('div', { style: { fontWeight: 700 } }, 'ShopeePay, GoPay, DANA, LinkAja, AstraPay'),
          h('div', { style: small }, 'Pay by scanning a QRIS code with your e-wallet app.'),
          btn(s.payBusy ? 'Generating…' : 'Show QR code', () => this.retryPay({ channel: 'qris' }), { ghost: true, disabled: s.payBusy })),
        err);
    }

    if (s.step === 'card') {
      const fmtNum = v => v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
      const fmtExp = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; };
      if (s.threeDs) {
        return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, h('div', { style: { fontWeight: 700 } }, 'Verify with your bank'), h('button', { onClick: () => this.cancel3ds(), style: { all: 'unset', cursor: 'pointer', fontSize: 13, textDecoration: 'underline', color: '#5a5a5a' } }, 'Cancel')),
          h('iframe', { src: s.threeDs, title: '3-D Secure verification', style: { width: '100%', height: 480, border: '1px solid rgba(13,13,13,.1)', borderRadius: 16, background: '#fff' } }),
          h('div', { style: small }, 'Enter the OTP your bank sent you. Do not close this page.'));
      }
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } }, amount,
        h('div', { style: box },
          h('div', { style: small }, 'Card number'),
          input(s.cNum, v => this.setState({ cNum: fmtNum(v) }), '1234 5678 9012 3456', { inputMode: 'numeric', autoComplete: 'cc-number' }),
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } }, h('div', { style: small }, 'Expiry'), input(s.cExp, v => this.setState({ cExp: fmtExp(v) }), 'MM/YY', { inputMode: 'numeric', autoComplete: 'cc-exp' })),
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } }, h('div', { style: small }, 'CVV'), input(s.cCvv, v => this.setState({ cCvv: v.replace(/\D/g, '').slice(0, 4) }), '123', { inputMode: 'numeric', type: 'password', autoComplete: 'cc-csc' }))),
          btn(s.cardBusy ? 'Processing…' : !s.xReady ? 'Loading…' : 'Pay ' + rp(total), () => this.payCard(), { disabled: s.cardBusy || !s.xReady })),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, ...small } }, h('img', { src: 'logos/visa-mastercard.webp', alt: 'Visa, Mastercard', style: { height: 18 } }), 'Secured by Xendit · your card number goes straight to Xendit, never to us.'),
        err);
    }
    return null;
  }
  payload() {
    const s = this.state, type = s.mode === 'grab' ? 'grab' : s.fulfil === 'delivery' ? 'delivery' : 'pickup';
    const p = { order_type: type, customer_name: s.name.trim(), customer_phone: s.phone.replace(/[\s-]/g, ''), customer_email: s.email.trim(), notes: '',
      items: this.cartLines().map(l => ({ menu_id: l.id, qty: l.qty, addon_option_ids: l.opts, note: '' })) };
    if (type !== 'grab') p.payment_method = s.pay;             // online methods for pickup/delivery
    else if (s.grabPay) p.payment_method = s.grabPay;          // Grab & Go: planned OFFLINE method (code from master data)
    if (type === 'delivery') { p.delivery_address = s.address.trim(); p.driver_note = s.note.trim(); }
    if ((s.promo || '').trim()) p.voucher = s.promo.trim();
    return p;
  }
  createOrder() {
    if (this.state.busy) return;
    const grab = this.state.mode === 'grab';
    this.setState({ busy: true, err: '' });
    API().createOrder(grab ? this.payload() : Object.assign(this.payload(), { pay_opts: this.payOpts() })).then(res => {
      this.setState({ busy: false, created: res, code: res.code, token: res.access_token, step: grab ? 'done' : this.state.step });
      if (this.props.onPaid) this.props.onPaid(); // history picks up the new ref right away
      this.startLive();
      if (grab) return;  // Grab & Go: no online payment — the live status page takes over
      if (res.pay) this.usePay(res.pay, res.total);
      else { this.setState({ err: res.pay_error || 'Could not start the payment' }); this.startWait(); }
    }).catch(e => this.setState({ busy: false, err: e.message || 'Could not create your order' }));
  }
  // Grab & Go: the customer can cancel only while still awaiting barista confirmation.
  cancelOrder() {
    const s = this.state; if (!s.code || s.busy) return;
    this.setState({ busy: true, err: '' });
    API().cancelMyOrder(s.code, s.token).then(o => this.setState({ busy: false, live: o })).catch(e => this.setState({ busy: false, err: e.message || 'Tidak bisa membatalkan order' }));
  }
  startLive() {
    this.stopLive();
    const t = this.state.token; if (!t) return;
    this._unwatch = API().watch(t, () => this.fetchLive());
    this._lpAt = 0;
    this._lp = setInterval(() => { const waiting = PAYING_STEPS.includes(this.state.step) && !this.state.threeDs; if (waiting || Date.now() - this._lpAt > 20000) this.fetchLive(); }, 4000);  // fast while waiting for the cafe
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
    const settle = this.state.mode !== 'venue' && PAYING_STEPS.includes(this.state.step) ? API().payStatus(code, token).catch(() => null) : Promise.resolve();
    settle.then(() => this.state.mode === 'venue' ? API().getMyOrders().then(l => l.find(o => o.code === code)) : API().getOrder(code, token)).then(o => {
      if (!o) return;
      const next = { live: o };
      if (o.kind !== 'venue' && o.payment_status === 'paid' && (PAYING_STEPS.includes(this.state.step) || this.state.step === 'pay')) { next.step = 'done'; clearInterval(this._qi); clearTimeout(this._3t); }
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
  prev() { const s = this.state; return { visit: 'mode', menu: 'mode', confirm: 'menu', venue: 'mode', pay: s.mode === 'grab' ? 'menu' : 'confirm', }[s.step]; }
  setQty(key, id, d) { this.setState(s => ({ [key]: { ...s[key], [id]: Math.max(0, (s[key][id] || 0) + d) } })); }

  renderVals() {
    const s = this.state, { lines, total, estimate } = this.bill(), cfg = s.cfg || {}, live = s.live, A = API();
    const method = METHODS.find(m => m.id === s.pay);
    const g = s.mode === 'grab';  // Grab & Go: order remotely, pay offline at the cafe
    const cartN = this.cartLines().reduce((a, i) => a + i.qty, 0);
    const cartSum = this.cartLines().reduce((a, i) => a + i.price * i.qty, 0);
    const vNameOk = okName(s.name), vPhoneOk = okPhone(s.phone), slotRem = this.remaining(s.slot), slotOk = !!s.slot && (slotRem === null || slotRem >= s.pax);
    const paid = !!live && live.payment_status === 'paid', st = A.status(live);
    const titles = { mode: ['Order', 'How would you like it?'], visit: ['Dine-in', 'Reserve your table'], menu: [g ? 'Grab & Go' : (s.mode === 'dine' ? 'Dine-in' : 'Takeaway'), g ? 'Pilih pesananmu' : (s.mode === 'dine' ? 'Order ahead' : 'What would you like?')], confirm: ['Takeaway', 'Confirm order'], venue: ['Book venue', 'Event details'], pay: [g ? 'Grab & Go' : 'Payment', g ? 'Data & kirim order' : 'Confirm & pay'], qr: [method.label, 'Complete your payment'], wait: ['Payment', 'Waiting for confirmation'], va: ['Virtual account', 'Transfer to pay'], ewallet: ['E-wallet', 'Pay with your e-wallet'], card: [s.pay === 'debit' ? 'Debit card' : 'Credit card', 'Pay by card'], done: [g ? 'Grab & Go' : 'Order', g ? 'Status order' : (s.mode === 'venue' ? 'Request sent' : 'Confirmed')] };
    const nameOk = okName(s.name), emailOk = okEmail(s.email), phoneOk = okPhone(s.phone), detailsOk = nameOk && emailOk && phoneOk;
    const qrLeft = s.step === 'qr' ? Math.max(0, Math.ceil((s.qrEnd - (s.now || Date.now())) / 1000)) : QR_SECONDS;
    const qrSpan = Math.max(60, Math.round((s.qrEnd - s.qrStart) / 1000) || QR_SECONDS);
    const payFailed = !!live && (live.payment_status === 'expired' || live.payment_status === 'failed');
    const qrExpired = s.step === 'qr' && qrLeft === 0;
    const ctas = {
      visit: [slotOk ? 'Continue to menu' : 'Pick an available time', () => this.setState({ step: 'menu' }), !slotOk],
      menu: [cartN ? 'Lanjut · ' + cartN + ' item · ' + rp(cartSum) : 'Tambah dulu pesananmu', () => this.setState({ step: g || s.mode === 'dine' ? 'pay' : 'confirm' }), !cartN],
      confirm: ['Confirm order', () => this.setState({ step: 'pay' }), s.fulfil === 'pickup' ? !s.name.trim() : !s.address.trim()],
      venue: [s.busy ? 'Sending…' : 'Continue on WhatsApp', () => this.sendWa(), !s.date || !vNameOk || !vPhoneOk || s.busy],
      pay: g
        ? [s.busy ? 'Mengirim…' : detailsOk ? 'Kirim Order' : 'Lengkapi datamu dulu', () => this.createOrder(), !detailsOk || s.busy || cfg.ordering_open === false]
        : [s.busy || s.payBusy || s.cardBusy ? (s.threeDs ? 'Waiting for your bank…' : 'Processing…') : detailsOk ? 'Pay ' + rp(total) : 'Fill in your details to pay', () => this.submitPay(), !detailsOk || s.busy || s.payBusy || s.cardBusy || !this.dropOk() || cfg.ordering_open === false],
      qr: qrExpired ? [s.payBusy ? 'Generating…' : 'Generate new QR', () => this.retryPay({ channel: 'qris' }), s.payBusy || payFailed] : ['I have paid', () => { clearInterval(this._qi); this.startWait(); this.fetchLive(); }, false],
      wait: payFailed || !s.code ? null : [s.payBusy ? 'Opening…' : 'Try paying again', () => this.retryPay(), s.payBusy],
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
      tabsTop: [['Grab & Go', 'grab', 'menu'], ['Book venue', 'venue', 'venue']].map(([label, mode, step]) => { const on = s.mode === mode; const locked = ['wait', 'done', 'qr'].includes(s.step) || !!s.created;
        return { label, pick: () => !locked && this.setState({ mode, step: mode === 'grab' && Object.keys(s.cart).length ? 'pay' : step }), style: { all: 'unset', cursor: locked ? 'default' : 'pointer', padding: '9px 16px', borderRadius: 999, whiteSpace: 'nowrap', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: '.03em', textTransform: 'uppercase', background: on ? '#0d0d0d' : 'transparent', color: on ? '#fff' : '#3a3a3a', opacity: locked && !on ? .4 : 1 } }; }),
      progress: (() => { const flow = s.mode === 'grab' ? ['menu', 'pay', 'done'] : s.mode === 'dine' ? ['visit', 'menu', 'pay', 'done'] : s.mode === 'take' ? ['menu', 'confirm', 'pay', 'done'] : s.mode === 'venue' ? ['venue', 'done'] : ['mode']; const stp = PAYING_STEPS.includes(s.step) ? 'pay' : s.step; const idx = flow.indexOf(stp);
        return flow.map((_, i) => ({ flex: 1, height: 4, borderRadius: 2, background: i <= idx ? '#e30a2e' : 'rgba(13,13,13,.12)', transition: 'background .3s' })); })(),
      canBack: !!this.prev() && !s.cardBusy, back: () => { if (s.step === 'pay' && s.code) this.stopLive(); this.setState(s.step === 'pay' && s.code ? { step: this.prev(), code: '', token: '', created: null, live: null, err: '' } : { step: this.prev() }); },
      kicker: titles[s.step][0], title: titles[s.step][1],
      isMode: s.step === 'mode', isDeals: s.step === 'deals', isVisit: s.step === 'visit', isMenu: s.step === 'menu', isConfirm: s.step === 'confirm', isVenue: s.step === 'venue', isPay: s.step === 'pay', isQr: s.step === 'qr', isPanel: PANEL_STEPS.includes(s.step), panel: PANEL_STEPS.includes(s.step) ? this.panel(total) : null, isProc: s.step === 'wait', isDone: s.step === 'done',
      isGrab: g, showPay: !g,  // showPay gates the online payment-method section in the pay step
      grabHint: 'Bayar langsung di kasir cafe saat ambil pesanan. Barista akan konfirmasi ordermu dulu.',
      doneGrab: g, grabPill: st.pill, grabSub: st.sub, grabPillStyle: A.pillStyle(st),
      grabCode: s.code, grabWaiting: g && (!live || live.status === 'pending_confirmation'),
      canCancel: g && live && live.status === 'pending_confirmation', cancelOrder: () => this.cancelOrder(),
      modes: [
        { badge: 'GO', label: 'Grab & Go', desc: 'Pesan sekarang, bayar di kasir saat ambil pesanan', pick: () => this.setState({ mode: 'grab', step: Object.keys(s.cart).length ? 'pay' : 'menu' }) },
        { badge: 'EV', label: 'Book venue', desc: 'Reserve the cafe for your event', pick: () => this.setState({ mode: 'venue', step: 'venue' }) }
      ],
      deals: DEALS.map(d => { const q = s.deals[d.id] || 0; return { ...d, qty: q, priceFmt: rp(d.price), worthFmt: rp(d.worth), pick: () => this.setQty('deals', d.id, q ? 0 : 1), inc: () => this.setQty('deals', d.id, 1), dec: () => this.setQty('deals', d.id, -1),
        style: { display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, background: '#fff', border: '2px solid ' + (q ? '#e30a2e' : 'rgba(13,13,13,.08)') } }; }),
      pax: s.pax, paxDown: () => this.setState({ pax: Math.max(1, s.pax - 1) }), paxUp: () => this.setState({ pax: Math.min(12, s.pax + 1) }),
      days: Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); const on = s.dayI === i;
        return { top: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-GB', { weekday: 'short' }), num: d.getDate(), mon: d.toLocaleDateString('en-GB', { month: 'short' }), pick: () => { this.setState({ dayI: i }); this.loadAvail(i); },
          style: { all: 'unset', cursor: 'pointer', flexShrink: 0, width: 64, padding: '10px 0', borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: on ? '#0d0d0d' : '#fff', color: on ? '#fff' : '#0d0d0d', border: '1px solid ' + (on ? '#0d0d0d' : 'rgba(13,13,13,.12)') } }; }),
      dayLabel: this.dayText(),
      slots: (cfg.slots || []).map(t => { const r = this.remaining(t), full = r !== null && r < s.pax; return { label: t + (full ? ' · Full' : ''), pick: () => !full && this.setState({ slot: t }), style: { ...chip(s.slot === t && !full), opacity: full ? .4 : 1, cursor: full ? 'not-allowed' : 'pointer' } }; }),
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
      promo: s.promo, setPromo: e => this.setState({ promo: (e.target.value || '').toUpperCase().replace(/\s/g, ''), promoInfo: null }),
      applyPromo: () => this.applyPromo(),
      promoMsg: s.promoBusy ? 'Mengecek kode…' : (s.promoInfo ? (s.promoInfo.ok ? 'Voucher ' + s.promoInfo.code + ' aktif · potongan ' + rp(Number(s.promoInfo.discount) || 0) : (s.promoInfo.message || 'Kode voucher tidak berlaku')) : ''),
      promoMsgStyle: { fontSize: '12px', fontWeight: 600, color: s.promoInfo && s.promoInfo.ok ? '#1a7f3c' : '#e30a2e' },
      grabPayOpts: ((cfg.payment_methods) || []).map(m => ({ label: m.label, code: m.code, pick: () => { this.setState({ grabPay: m.code }); if ((s.promo || '').trim() && s.promoInfo) this.applyPromo(); },
        style: { all: 'unset', cursor: 'pointer', fontWeight: 700, fontSize: '13px', padding: '10px 14px', borderRadius: 12, background: s.grabPay === m.code ? '#fdecec' : '#fff', color: s.grabPay === m.code ? '#e30a2e' : '#0d0d0d', border: '1px solid ' + (s.grabPay === m.code ? '#e30a2e' : 'rgba(13,13,13,.12)') } })),
      grabPayShow: s.mode === 'grab',
      hasErr: !!errMsg, errMsg, vNameErr: s.name && !vNameOk ? 'Please enter your name' : '', vPhoneErr: s.phone && !vPhoneOk ? 'Please enter a valid WhatsApp number, e.g. 0812xxxxxxx' : '',
      waitTitle: payFailed ? st.pill : 'Waiting for your payment', waitSub: payFailed ? 'Please start a new order or contact the cafe.' : 'Checking your payment. ' + 'This page updates automatically. You can close it; your order stays in Purchase History · ' + s.code,
      email: s.email, phone: s.phone,
      setEmail: e => this.setState({ email: e.target.value }), setPhone: e => this.setState({ phone: e.target.value }),
      nameErr: s.name && !nameOk ? 'Please enter your name' : '', emailErr: s.email && !emailOk ? 'Please enter a valid email, e.g. name@email.com' : '', phoneErr: s.phone && !phoneOk ? 'Please enter a valid phone number, e.g. 0812xxxxxxx' : '',
      payLocked: !detailsOk, methodsWrap: { display: 'flex', flexDirection: 'column', gap: 10, opacity: detailsOk ? 1 : .45, pointerEvents: detailsOk ? 'auto' : 'none', transition: 'opacity .25s' },
      qrTimer: String(Math.floor(qrLeft / 60)).padStart(2, '0') + ':' + String(qrLeft % 60).padStart(2, '0'), qrExpired, qrActive: !qrExpired,
      qrBar: { height: '100%', borderRadius: 3, background: qrLeft <= 30 ? '#e30a2e' : '#0d0d0d', width: Math.min(100, qrLeft / qrSpan * 100) + '%', transition: 'width 1s linear, background .3s' },
      qrNote: 'Scan with any banking or e-wallet app (GoPay, OVO, DANA, ShopeePay, m-banking). This QR is valid for ' + Math.round(qrSpan / 60) + ' minutes.',
      qrBoxStyle: { padding: 16, borderRadius: 24, background: '#fff', border: '1px solid rgba(13,13,13,.08)', opacity: qrExpired ? .25 : 1, filter: qrExpired ? 'blur(2px)' : 'none', transition: 'opacity .3s' },
      methods: METHODS.map(m => ({ label: m.label, desc: m.desc, drop: s.pay === m.id ? this.dropFor(m.id) : null,
        pick: () => { this.setState({ pay: m.id, err: '' }); if (m.id === 'credit' || m.id === 'debit') this.loadXendit(); },
        logos: m.logos.map(k => ({ src: logoSrc(k), alt: LOGO_ALT[k] })),
        ring: s.pay === m.id
          ? { width: 22, height: 22, borderRadius: '50%', boxSizing: 'border-box', flexShrink: 0, border: '2px solid #e30a2e', background: 'radial-gradient(circle, #e30a2e 0 5px, transparent 5px)' }
          : { width: 22, height: 22, borderRadius: '50%', boxSizing: 'border-box', flexShrink: 0, border: '2px solid #8c897e', background: '#fff' },
        style: { all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 18, background: '#fff', border: '1px solid ' + (s.pay === m.id ? '#e30a2e' : 'rgba(13,13,13,.1)'), boxShadow: s.pay === m.id ? '0 0 0 4px rgba(227,10,46,.08)' : 'none', transition: 'border-color .2s, box-shadow .2s' } })),
      qr: s.step === 'qr' && s.qrStr ? React.createElement('div', { style: { width: 220, height: 220 }, role: 'img', 'aria-label': 'QRIS code for ' + s.code, dangerouslySetInnerHTML: { __html: A.qrSvg(s.qrStr, 220) } }) : null,
      doneTitle: g ? 'Order terkirim' : s.mode === 'venue' ? 'Request sent' : 'Payment Successful', doneSub: g ? ('Kode order: ' + s.code + ' · ' + rp((live && live.total) || total)) : s.mode === 'venue' ? 'Continue on WhatsApp · ' + s.code : rp((live && live.total) || total) + ' · ' + method.label + ' · ' + s.code, waUrl: this.waUrl(),
      doneDine: !g && s.mode === 'dine', doneTrack: !g && s.mode === 'take', doneVenue: !g && s.mode === 'venue',
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
