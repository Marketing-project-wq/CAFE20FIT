/* 20FIT Cafe web: shared data layer (window.CafeApi).
 * All data goes through Supabase RPCs; tables are never queried directly.
 * localStorage only keeps order "keys" ({ code, token }) in 20fit-order-refs.
 * Loaded as a plain script before the page logic (no build step on this site). */
(function () {
  'use strict';

  // Public, client-side credentials (RLS + RPCs protect the data). Never put a service key here.
  var SUPABASE_URL = 'https://cpvzwqptzcxnwzfzgrmt.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_0t9vEOYeIo_YM1__X5iNMQ_qXofEozw';

  // Payments (Xendit) run on admin.20fit.id: it creates the order (CAFE-XXXXX), starts the QRIS / invoice
  // and settles it when Xendit says paid (lib/cafePay.ts in Marketing-project-wq/admin-20fit).
  var PAY_API = 'https://admin.20fit.id/api/cafe';

  var REFS_KEY = '20fit-order-refs';
  var SEEN_KEY = '20fit-order-seen';
  var LEGACY_KEY = '20fit-orders';
  var TZ = 'Asia/Jakarta';

  var client = null;
  function sb() {
    if (!client) client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    return client;
  }

  // ---------- tiny event bus ----------
  var listeners = {};
  function on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return function () { listeners[ev] = (listeners[ev] || []).filter(function (f) { return f !== fn; }); }; }
  function emit(ev, data) { (listeners[ev] || []).slice().forEach(function (fn) { try { fn(data); } catch (e) { console.error(e); } }); }

  // ---------- RPC ----------
  // Rejects with an Error whose message is the server's message.
  function rpc(name, args) {
    return sb().rpc(name, args || {}).then(function (res) {
      if (res.error) { var err = new Error(res.error.message || tr('api_err_generic')); err.code = res.error.code; throw err; }
      return res.data;
    });
  }

  function payApi(path, body) {
    var opts = body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { method: 'GET' };
    return fetch(PAY_API + path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var err = new Error(j.error || tr('api_err_retry')); err.status = r.status; throw err; }
        return j;
      });
    }, function () { throw new Error(tr('api_err_offline')); });
  }

  // ---------- storage ----------
  function lsGet(key, fallback) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  // One-time migration: the old simulated history is not on the server, so drop it.
  try { localStorage.removeItem(LEGACY_KEY); } catch (e) {}

  function getRefs() { var r = lsGet(REFS_KEY, []); return Array.isArray(r) ? r.filter(function (x) { return x && x.code && x.token; }) : []; }
  function addRef(ref) {
    var refs = getRefs().filter(function (x) { return x.code !== ref.code; });
    var old = getRefs().find(function (x) { return x.code === ref.code; }) || {};
    // lang = the website language the order was made in (status screens of that order use it; EN | ID)
    refs.push({ code: ref.code, token: ref.token, kind: ref.kind || 'order', created_at: ref.created_at || new Date().toISOString(), lang: ref.lang || old.lang || L() });
    lsSet(REFS_KEY, refs); emit('refs', refs); return refs;
  }
  // Website language (tools/src/i18n.js); the language an order was made in (server field, else this phone's ref).
  function L() { return window.I18N ? window.I18N.lang() : 'en'; }
  function tr(key, vars, lang) { return window.T ? window.T(key, vars, lang) : key; }
  function orderLang(o) {
    if (o && (o.language === 'en' || o.language === 'id')) return o.language;
    var r = o && o.code ? getRefs().find(function (x) { return x.code === o.code; }) : null;
    return r && (r.lang === 'en' || r.lang === 'id') ? r.lang : L();
  }
  function locale(lang) { return (lang || L()) === 'id' ? 'id-ID' : 'en-GB'; }
  function tokenFor(code) { var r = getRefs().find(function (x) { return x.code === code; }); return r ? r.token : null; }
  function getSeen() { return lsGet(SEEN_KEY, {}); }
  function markSeen(list) { var seen = getSeen(); (list || []).forEach(function (o) { seen[o.code] = o.updated_at; }); lsSet(SEEN_KEY, seen); emit('seen', seen); }
  function hasUnseen(list) { var seen = getSeen(); return (list || []).some(function (o) { return o.is_open && seen[o.code] && o.updated_at > seen[o.code]; }); }

  // ---------- cart (one cart for the whole site, kept across reloads) ----------
  // { [lineKey]: { id, opts: [addon option ids], qty } } in localStorage 20fit-cart. Every screen (menu cards, story,
  // product pop-up, checkout) writes through cartSet and listens to the 'cart' event, so they always agree.
  var CART_KEY = '20fit-cart';
  var PAYOPEN_KEY = '20fit-pay-open';
  function cleanCart(c) {
    var out = {};
    Object.keys(c || {}).forEach(function (k) { var l = c[k]; var q = Math.round(Number(l && l.qty) || 0); if (l && l.id && q > 0) out[k] = { id: l.id, opts: Array.isArray(l.opts) ? l.opts : [], qty: Math.min(99, q) }; });
    return out;
  }
  function cartGet() { var c = lsGet(CART_KEY, {}); return c && typeof c === 'object' && !Array.isArray(c) ? cleanCart(c) : {}; }
  function cartSet(c) { var clean = cleanCart(c); lsSet(CART_KEY, clean); emit('cart', clean); return clean; }
  try { window.addEventListener('storage', function (e) { if (e.key === CART_KEY) emit('cart', cartGet()); }); } catch (e) {}
  // The unpaid order whose payment page is open, so a reload / return lands on the same payment page.
  function payOpenGet() { var p = lsGet(PAYOPEN_KEY, null); return p && p.code && p.token ? p : null; }
  function payOpenSet(p) { if (p && p.code && p.token) lsSet(PAYOPEN_KEY, { code: p.code, token: p.token, at: Date.now() }); }
  function payOpenClear(code) { var p = payOpenGet(); if (!code || (p && p.code === code)) { try { localStorage.removeItem(PAYOPEN_KEY); } catch (e) {} } }

  // ---------- table QR (cafe.20fit.id/#t/{token}) ----------
  // The token from a table QR is remembered for table_session_hours (default 4 h) so the order can be labelled
  // "MEJA x" (spec 2026-11-25-zoe-cafe-qr-meja-claim-grab). Only the backend decides if a token is valid.
  var TABLE_KEY = '20fit-table-session';
  var CLAIM_KEY = '20fit-claim-point';
  function tableSessionGet() { var t = lsGet(TABLE_KEY, null); if (!t || !t.token) return null; if (t.until && Date.now() > t.until) { try { localStorage.removeItem(TABLE_KEY); } catch (e) {} return null; } return t; }
  function tableSessionSet(t) { if (t && t.token) { lsSet(TABLE_KEY, t); emit('table', t); } }
  function tableSessionClear() { try { localStorage.removeItem(TABLE_KEY); } catch (e) {} emit('table', null); }
  function tableResolve(token) { return rpc('cafe_table_resolve', { p_token: String(token || '').trim() }); }
  function claimPointSet(token) { if (token) lsSet(CLAIM_KEY, { token: token, at: Date.now() }); }
  // Label a just-created order as ordered from a table (valid table token) or Grab n Go. The backend checks the order's
  // own code + access token and the table token (spec Fase 2); a paid table order then goes straight to the barista queue.
  function setOrigin(code, token, tableToken) { return rpc('cafe_order_set_origin', { p_code: code, p_token: token, p_table_token: tableToken || null }); }
  // ---------- QR Meja Fase 3: Grab n Go claim at the cafe (counter Claim QR #claim/{token}) ----------
  function claimPoint(t) { return rpc('cafe_claim_point', { p_token: t }); }
  function claimMine(t, refs) { return rpc('cafe_claim_mine', { p_token: t, p_refs: (refs || []).map(function (r) { return { code: r.code, token: r.token }; }) }); }
  function claimOrder(t, code, access) { return rpc('cafe_claim_order', { p_token: t, p_code: code, p_access: access || tokenFor(code) }); }
  function claimFind(t, code, who) { return rpc('cafe_claim_find', { p_token: t, p_code: code, p_who: who }); }
  // Queue code, origin (table / grab), table label and closing time of my own order (status page).
  function queueInfo(code, token) { return rpc('cafe_order_queue_info', { p_code: code, p_token: token || tokenFor(code) }); }
  // Name / email / WhatsApp of the last order, so the next order is quicker (this browser only).
  var CUSTOMER_KEY = '20fit-customer';
  function customerGet() { var c = lsGet(CUSTOMER_KEY, null); return c && typeof c === 'object' ? c : {}; }
  function customerSet(c) { lsSet(CUSTOMER_KEY, { name: c.name || '', email: c.email || '', phone: c.phone || '' }); }

  // ---------- cached public data ----------
  var menuP = null, configP = null;
  // Menu + the EN / ID product descriptions from the POS (cafe_get_web_menu_text; older backend without it → none).
  function getMenu(force) {
    if (!menuP || force) menuP = Promise.all([rpc('cafe_get_web_menu'), rpc('cafe_get_web_menu_text').catch(function () { return []; })]).then(function (r) {
      var res = r[0] || {}, text = {};
      (Array.isArray(r[1]) ? r[1] : []).forEach(function (x) { if (x && x.id) text[x.id] = x; });
      (res.items || []).forEach(function (it) { var d = text[it.id]; if (d) { it.description_en = d.description_en || null; it.description_id = d.description_id || null; } });
      return res;
    }).catch(function (e) { menuP = null; throw e; });
    return menuP;
  }
  function getConfig(force) { if (!configP || force) configP = rpc('cafe_get_web_config').catch(function (e) { configP = null; throw e; }); return configP; }

  // ---------- customer RPCs ----------
  // Returns the order plus `pay`: { kind: 'qr', qr_string, expires_at } | { kind: 'redirect', url, expires_at },
  // or `pay_error` when the order was made but its payment could not be started (retry with pay()).
  function createOrder(p) {
    var lang = (p && (p.language === 'id' || p.language === 'en')) ? p.language : L();
    return payApi('/order', Object.assign({}, p, { language: lang })).then(function (res) {
      addRef({ code: res.code, token: res.access_token, kind: 'order', lang: lang }); // saved right away, before the payment screen
      return res;
    });
  }
  // Live Xendit payment for an unpaid order: the same QR / invoice while it is valid, else a new one.
  // opts: { channel: 'qris' | 'ovo' | 'va' | 'card', bank: 'BCA'…, phone: '0812…' }. Every method stays on this page.
  function pay(code, token, opts) {
    var b = { code: code, token: token || tokenFor(code) };
    Object.keys(opts || {}).forEach(function (k) { if (opts[k] != null) b[k] = opts[k]; });
    return payApi('/pay', b).then(function (r) { return r.pay; });
  }
  // Card tokenized + 3-D Secure verified by Xendit.js in the page; only the token reaches the server.
  function card(code, token, cardToken, authId) { return payApi('/card', { code: code, token: token || tokenFor(code), card_token: cardToken, authentication_id: authId }); }
  // Asks Xendit and settles the order when it is paid; then getOrder() shows the new status.
  function payStatus(code, token) { return payApi('/pay/status?code=' + encodeURIComponent(code) + '&token=' + encodeURIComponent(token || tokenFor(code) || '')); }
  function addVenueRefreshment(code, token, items) {
    return rpc('cafe_venue_add_refreshment', { p: { code: code, token: token || tokenFor(code), items: items || [] } });
  }
  function createVenue(p) {
    return rpc('cafe_create_venue_booking', { p: p }).then(function (res) {
      addRef({ code: res.code, token: res.access_token, kind: 'venue' });
      return res;
    });
  }
  function getOrder(code, token) { return rpc('cafe_get_order', { p_code: code, p_token: token }); }
  function getMyOrders() {
    var refs = getRefs().slice(-100).map(function (r) { return { code: r.code, token: r.token }; });
    if (!refs.length) return Promise.resolve([]);
    return rpc('cafe_get_my_orders', { p_refs: refs }).then(function (list) { return Array.isArray(list) ? list : []; });
  }
  function findOrder(code, phone) {
    return rpc('cafe_find_order', { p_code: String(code || '').trim().toUpperCase(), p_phone: String(phone || '').trim() }).then(function (res) {
      if (res && res.error) return { error: res.error };
      addRef({ code: res.code, token: res.token, kind: res.kind === 'venue' ? 'venue' : 'order' });
      return res;
    });
  }
  function arrived(code) { return rpc('cafe_customer_arrived', { p_code: code, p_token: tokenFor(code) }); }
  function rate(code, food, service, comment) { return rpc('cafe_rate_order', { p_code: code, p_token: tokenFor(code), p_food: food, p_service: service, p_comment: comment || '' }); }
  function slotAvailability(date) { return rpc('cafe_get_slot_availability', { p_date: date }); }
  function checkPromo(code, amount) { return rpc('cafe_check_promo', { p_code: String(code || '').trim(), p_amount: Math.round(Number(amount) || 0) }); }
  function checkVoucher(code, items, method, phone, email) {
    return rpc('cafe_check_voucher', { p_code: String(code || '').trim(), p_items: items || [], p_method: method || null, p_phone: phone || null, p_email: email || null });
  }
  function cancelMyOrder(code, token) { return rpc('cafe_cancel_my_order', { p_code: code, p_token: token || tokenFor(code) }); }

  // Realtime per order: channel cafe-order:<token>, event order_update. Returns an unsubscribe function.
  function watch(token, fn) {
    var ch = sb().channel('cafe-order:' + token).on('broadcast', { event: 'order_update' }, function (msg) { fn(msg && msg.payload); }).subscribe();
    return function () { try { sb().removeChannel(ch); } catch (e) {} };
  }

  // ---------- formatting ----------
  function rp(n) { return 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID'); }
  function time(iso, lang) { if (!iso) return ''; return new Date(iso).toLocaleTimeString(locale(lang), { timeZone: TZ, hour: '2-digit', minute: '2-digit' }); }
  function dateTime(iso, lang) { if (!iso) return ''; return new Date(iso).toLocaleString(locale(lang), { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  function dayLabel(ymd, lang) { if (!ymd) return ''; var d = new Date(ymd + 'T00:00:00+07:00'); return d.toLocaleDateString(locale(lang), { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }); }
  // YYYY-MM-DD of today + n days in Jakarta time
  function ymd(addDays) { var d = new Date(Date.now() + (addDays || 0) * 864e5); return d.toLocaleDateString('en-CA', { timeZone: TZ }); }
  function optionsText(opts) { if (!opts) return ''; return Object.keys(opts).map(function (k) { return k === 'Note' ? tr('api_note', { text: opts[k] }) : opts[k]; }).join(' · '); }

  // ---------- status (one source for Done screen + Purchase History), in the order's language ----------
  function methodLabel(m, lang) { var k = 'api_m_' + m; var t = m ? tr(k, null, lang) : ''; return t === k ? cap(m) : t; }
  // Grab & Go is now sent as a paid-online 'pickup' order (checkout GRAB_ONLINE), so pickup reads as Grab & Go.
  var KIND = {};
  ['grab', 'dine_in', 'pickup', 'delivery', 'venue'].forEach(function (t) { Object.defineProperty(KIND, t, { enumerable: true, get: function () { return tr('api_k_' + t); } }); });
  var SESSION = {};
  ['morning', 'afternoon', 'evening'].forEach(function (t) { Object.defineProperty(SESSION, t, { enumerable: true, get: function () { return tr('api_s_' + t); } }); });
  function cap(s) { s = String(s || '').replace(/_/g, ' '); return s.charAt(0).toUpperCase() + s.slice(1); }
  function st(key, tone, lang, sub, extra) { var r = { pill: tr(key, null, lang), sub: sub != null ? sub : tr(key + '_sub', null, lang), tone: tone }; if (extra) for (var x in extra) r[x] = extra[x]; return r; }
  // tone: dark | green | red | grey | amber
  function status(o) {
    if (!o) return { pill: '', sub: '', tone: 'dark' };
    var lg = orderLang(o);
    if (o.kind === 'venue') {
      var vk = 'api_v_' + o.status, vp = tr(vk, null, lg); if (vp === vk) vp = cap(o.status);
      return { pill: vp, sub: tr('api_v_sub', { type: cap(o.event_type), n: o.guests, date: dayLabel(o.event_date, lg), session: (o.session ? tr('api_s_' + o.session, null, lg) : '') }, lg), tone: o.status === 'confirmed' ? 'green' : o.status === 'cancelled' ? 'grey' : 'dark' };
    }
    var t = o.type, s = o.status;
    // Old flow only (type grab). Grab & Go paid online is type 'pickup' (see below).
    if (t === 'grab') {
      var tone = { pending_confirmation: 'amber', accepted: 'green', paid: 'green', completed: 'dark' }[s] || 'grey';
      if (['pending_confirmation', 'accepted', 'paid', 'completed', 'cancelled_by_user'].indexOf(s) >= 0) return st('api_g_' + s, tone, lg);
      if (['rejected', 'cancelled_by_admin', 'expired'].indexOf(s) >= 0) return st('api_g_' + s, 'grey', lg, o.cancel_reason || tr('api_g_' + s + '_sub', null, lg));
    }
    if (s === 'pending_payment') {
      if (o.payment_status === 'expired' || o.payment_status === 'failed') return st(o.payment_status === 'expired' ? 'api_pay_expired' : 'api_pay_failed', 'grey', lg, tr('api_not_paid', null, lg));
      return st('api_wait_pay', 'amber', lg);
    }
    if (s === 'cancelled') return st('api_cancelled', 'grey', lg, [o.cancel_reason, o.payment_status === 'refunded' ? tr('api_refunded', null, lg) : ''].filter(Boolean).join(' · '));
    // DEPRECATED: Dine-in (table reservation) is retired — no new dine_in orders are created. Kept so existing/old
    // dine_in orders still render correctly in Purchase History. Do not add new dine_in UI.
    if (t === 'dine_in') {
      if (s === 'booked') return st('api_d_booked', 'dark', lg, tr('api_d_booked_sub', { n: o.pax, date: dayLabel(o.reservation_date, lg), slot: o.reservation_slot || '' }, lg));
      if (s === 'checked_in') return st('api_d_checked_in', 'green', lg, tr('api_d_checked_in_sub', { time: time(o.checked_in_at, lg) }, lg) + (o.checked_in_by ? tr('api_by', { name: o.checked_in_by }, lg) : ''));
      if (s === 'completed') return st('api_d_completed', 'dark', lg, '');
      if (s === 'no_show') return st('api_d_no_show', 'grey', lg, '');
    }
    // Grab & Go paid online (spec grab-v2): paid → barista accepts (no reject) → made → ready → collected.
    // Self service: dine-in (table) orders are not brought to the table either — the name is called, pick up at the counter.
    if (t === 'pickup') {
      if (s === 'received') return st('api_p_received', 'amber', lg);
      // QR Meja Fase 3: Grab n Go accepted, made only after the customer claims it at the cafe.
      if (s === 'waiting_claim') return st('api_p_waiting_claim', 'amber', lg);
      if (s === 'unclaimed') return st('api_p_unclaimed', 'grey', lg);
      if (s === 'accepted') return o.order_origin === 'table' ? st('api_p_queue', 'green', lg, tr('api_p_queue_table_sub', null, lg))
        : o.order_origin === 'grab' ? st('api_p_queue', 'green', lg, tr('api_p_queue_grab_sub', null, lg)) : st('api_p_accepted', 'green', lg);
      if (s === 'preparing') return st('api_p_preparing', 'green', lg);
      if (s === 'ready') return st('api_p_ready', 'red', lg, null, { pulse: true });
      if (s === 'completed') return st('api_p_completed', 'dark', lg);
      if (s === 'cancelled') return st('api_cancelled', 'grey', lg, [o.cancel_reason, tr('api_p_refund', null, lg)].filter(Boolean).join(' · '));
    }
    if (t === 'delivery') {
      var drv = o.driver_name ? [o.driver_name, o.driver_vehicle, o.driver_plate].filter(Boolean).join(' · ') : '';
      if (s === 'received') return st('api_dl_received', 'dark', lg);
      if (s === 'preparing') return st('api_dl_preparing', 'dark', lg);
      if (s === 'driver_picked_up') return st('api_dl_picked', 'dark', lg, drv);
      if (s === 'on_the_way') return st('api_dl_way', 'red', lg, drv);
      if (s === 'completed') return st('api_dl_done', 'dark', lg, '');
    }
    return { pill: cap(s), sub: '', tone: 'dark' };
  }
  var TONES = { dark: ['#0d0d0d', '#fff'], green: ['#128c4a', '#fff'], red: ['#e30a2e', '#fff'], grey: ['#d9d7d2', '#3a3a3a'], amber: ['#f5c542', '#0d0d0d'] };
  function pillStyle(st) {
    var c = TONES[st.tone] || TONES.dark;
    return { padding: '6px 12px', borderRadius: 999, background: c[0], color: c[1], fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0, animation: st.pulse ? 'cafePulse 1.4s ease-in-out infinite' : 'none' };
  }
  // Ordered tracker steps per type, with the index reached for the current status (in the order's language).
  function trackSteps(o) {
    var lg = orderLang(o), S = function (id, key, subKey) { return [id, tr(key, null, lg), tr(subKey || key + '_sub', null, lg)]; };
    var steps = o.type === 'delivery'
      ? [S('received', 'api_dl_received'), S('preparing', 'api_dst_preparing'), S('driver_picked_up', 'api_dl_picked', 'api_dst_picked_sub'), S('on_the_way', 'api_dl_way', 'api_dst_way_sub'), S('completed', 'api_dl_done', 'api_dst_done_sub')]
      : [S('received', 'api_st_paid'), S('accepted', 'api_st_accepted'), S('preparing', 'api_st_preparing'), S('ready', 'api_st_ready'), S('completed', 'api_st_done')];
    // QR Meja Fase 3: Grab n Go waits for a claim at the cafe before it is made; table orders skip Terima.
    if (o.type === 'pickup' && o.order_origin === 'grab') {
      steps = [steps[0], S('waiting_claim', 'api_st_claim'), S('accepted', 'api_st_queue', 'api_st_queue_grab_sub')].concat(steps.slice(2));
    } else if (o.type === 'pickup' && o.order_origin === 'table') {
      steps = [steps[0], S('accepted', 'api_st_queue', 'api_st_queue_table_sub')].concat(steps.slice(2));
    }
    var idx = steps.findIndex(function (s) { return s[0] === o.status; });
    return { steps: steps, idx: idx };
  }

  // ---------- QR (real, scannable) ----------
  function qrSvg(text, size) {
    if (typeof window.qrcode !== 'function') return '';
    var q = window.qrcode(0, 'M'); q.addData(String(text)); q.make();
    var n = q.getModuleCount(), cell = Math.max(1, Math.floor((size || 120) / (n + 2)));
    return q.createSvgTag({ cellSize: cell, margin: cell, scalable: true });
  }

  window.CafeApi = {
    rpc: rpc, on: on, emit: emit,
    getRefs: getRefs, addRef: addRef, tokenFor: tokenFor, markSeen: markSeen, hasUnseen: hasUnseen,
    getMenu: getMenu, getConfig: getConfig,
    tableSessionGet: tableSessionGet, tableSessionSet: tableSessionSet, tableSessionClear: tableSessionClear, tableResolve: tableResolve, claimPointSet: claimPointSet, setOrigin: setOrigin, customerGet: customerGet, customerSet: customerSet,
    claimPoint: claimPoint, claimMine: claimMine, claimOrder: claimOrder, claimFind: claimFind, queueInfo: queueInfo,
    cartGet: cartGet, cartSet: cartSet, payOpenGet: payOpenGet, payOpenSet: payOpenSet, payOpenClear: payOpenClear,
    createOrder: createOrder, pay: pay, card: card, payStatus: payStatus, createVenue: createVenue, addVenueRefreshment: addVenueRefreshment, getOrder: getOrder, getMyOrders: getMyOrders,
    findOrder: findOrder, arrived: arrived, rate: rate, slotAvailability: slotAvailability, checkPromo: checkPromo, checkVoucher: checkVoucher, cancelMyOrder: cancelMyOrder, watch: watch,
    rp: rp, time: time, dateTime: dateTime, dayLabel: dayLabel, ymd: ymd, optionsText: optionsText,
    KIND: KIND, methodLabel: methodLabel, SESSION: SESSION, orderLang: orderLang, status: status, pillStyle: pillStyle, trackSteps: trackSteps, qrSvg: qrSvg
  };
})();
