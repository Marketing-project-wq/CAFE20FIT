/* 20FIT Cafe web: shared data layer (window.CafeApi).
 * All data goes through Supabase RPCs; tables are never queried directly.
 * localStorage only keeps order "keys" ({ code, token }) in 20fit-order-refs.
 * Loaded as a plain script before the page logic (no build step on this site). */
(function () {
  'use strict';

  // Public, client-side credentials (RLS + RPCs protect the data). Never put a service key here.
  var SUPABASE_URL = 'https://cpvzwqptzcxnwzfzgrmt.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_0t9vEOYeIo_YM1__X5iNMQ_qXofEozw';

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
      if (res.error) { var err = new Error(res.error.message || 'Something went wrong'); err.code = res.error.code; throw err; }
      return res.data;
    });
  }

  // ---------- storage ----------
  function lsGet(key, fallback) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  // One-time migration: the old simulated history is not on the server, so drop it.
  try { localStorage.removeItem(LEGACY_KEY); } catch (e) {}

  function getRefs() { var r = lsGet(REFS_KEY, []); return Array.isArray(r) ? r.filter(function (x) { return x && x.code && x.token; }) : []; }
  function addRef(ref) {
    var refs = getRefs().filter(function (x) { return x.code !== ref.code; });
    refs.push({ code: ref.code, token: ref.token, kind: ref.kind || 'order', created_at: ref.created_at || new Date().toISOString() });
    lsSet(REFS_KEY, refs); emit('refs', refs); return refs;
  }
  function tokenFor(code) { var r = getRefs().find(function (x) { return x.code === code; }); return r ? r.token : null; }
  function getSeen() { return lsGet(SEEN_KEY, {}); }
  function markSeen(list) { var seen = getSeen(); (list || []).forEach(function (o) { seen[o.code] = o.updated_at; }); lsSet(SEEN_KEY, seen); emit('seen', seen); }
  function hasUnseen(list) { var seen = getSeen(); return (list || []).some(function (o) { return o.is_open && seen[o.code] && o.updated_at > seen[o.code]; }); }

  // ---------- cached public data ----------
  var menuP = null, configP = null;
  function getMenu(force) { if (!menuP || force) menuP = rpc('cafe_get_web_menu').catch(function (e) { menuP = null; throw e; }); return menuP; }
  function getConfig(force) { if (!configP || force) configP = rpc('cafe_get_web_config').catch(function (e) { configP = null; throw e; }); return configP; }

  // ---------- customer RPCs ----------
  function createOrder(p) {
    return rpc('cafe_create_order', { p: p }).then(function (res) {
      addRef({ code: res.code, token: res.access_token, kind: 'order' }); // saved right away, before the payment screen
      return res;
    });
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
  // Per-slot table availability for a day: [{ slot, sizes:[{ capacity, total, booked, left }] }].
  function tableAvailabilityDay(date) { return rpc('cafe_get_table_availability_day', { p_date: date }); }
  // Smallest table capacity (per the web config size map) that seats `pax`; null if none fits (merge off).
  function capForPax(pax, cfg) {
    var map = (cfg && cfg.table_size_map) || '2:2,4:4,10:10';
    var caps = map.replace(/\s/g, '').split(',').map(function (p) { var a = p.split(':'); return { max: Number(a[0]), cap: Number(a[1]) }; })
      .filter(function (t) { return t.max >= pax; }).map(function (t) { return t.cap; });
    return caps.length ? Math.min.apply(null, caps) : null;
  }

  // Realtime per order: channel cafe-order:<token>, event order_update. Returns an unsubscribe function.
  function watch(token, fn) {
    var ch = sb().channel('cafe-order:' + token).on('broadcast', { event: 'order_update' }, function (msg) { fn(msg && msg.payload); }).subscribe();
    return function () { try { sb().removeChannel(ch); } catch (e) {} };
  }

  // ---------- formatting ----------
  function rp(n) { return 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID'); }
  function time(iso) { if (!iso) return ''; return new Date(iso).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }); }
  function dateTime(iso) { if (!iso) return ''; return new Date(iso).toLocaleString('en-GB', { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  function dayLabel(ymd) { if (!ymd) return ''; var d = new Date(ymd + 'T00:00:00+07:00'); return d.toLocaleDateString('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }); }
  // YYYY-MM-DD of today + n days in Jakarta time
  function ymd(addDays) { var d = new Date(Date.now() + (addDays || 0) * 864e5); return d.toLocaleDateString('en-CA', { timeZone: TZ }); }
  function optionsText(opts) { if (!opts) return ''; return Object.keys(opts).map(function (k) { return k === 'Note' ? 'Note: ' + opts[k] : opts[k]; }).join(' · '); }

  // ---------- status (one source for Done screen + Purchase History) ----------
  var METHOD = { qris: 'QRIS', ewallet: 'GoPay / OVO / ShopeePay', credit: 'Credit card', debit: 'Debit card', va: 'Virtual account', cash: 'Cash' };
  function methodLabel(m) { return METHOD[m] || (m ? cap(m) : ''); }
  var KIND = { dine_in: 'Dine-in', pickup: 'Pickup', delivery: 'Delivery', venue: 'Venue' };
  var SESSION = { morning: 'Morning 08–12', afternoon: 'Afternoon 13–17', evening: 'Evening 18–22' };
  function cap(s) { s = String(s || '').replace(/_/g, ' '); return s.charAt(0).toUpperCase() + s.slice(1); }
  // tone: dark | green | red | grey | amber
  function status(o) {
    if (!o) return { pill: '', sub: '', tone: 'dark' };
    if (o.kind === 'venue') {
      var vp = { new: 'Request sent', contacted: 'Contacted', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' }[o.status] || cap(o.status);
      return { pill: vp, sub: cap(o.event_type) + ' · ' + o.guests + ' guests · ' + dayLabel(o.event_date) + ' ' + (SESSION[o.session] || cap(o.session)), tone: o.status === 'confirmed' ? 'green' : o.status === 'cancelled' ? 'grey' : 'dark' };
    }
    var t = o.type, s = o.status;
    if (s === 'pending_payment') {
      if (o.payment_status === 'expired' || o.payment_status === 'failed') return { pill: o.payment_status === 'expired' ? 'Payment expired' : 'Payment failed', sub: 'This order was not paid', tone: 'grey' };
      return { pill: 'Waiting payment', sub: 'Waiting for the cafe to confirm your payment', tone: 'amber' };
    }
    if (s === 'cancelled') return { pill: 'Cancelled', sub: [o.cancel_reason, o.payment_status === 'refunded' ? 'Refunded' : ''].filter(Boolean).join(' · '), tone: 'grey' };
    if (t === 'dine_in') {
      if (s === 'booked') return { pill: 'Booked', sub: 'Table for ' + o.pax + ' · ' + dayLabel(o.reservation_date) + ' ' + (o.reservation_slot || '') + ' · Check in at the barista counter with your QR / booking code', tone: 'dark' };
      if (s === 'checked_in') return { pill: 'Checked in', sub: 'Checked in at ' + time(o.checked_in_at) + (o.checked_in_by ? ' by ' + o.checked_in_by : ''), tone: 'green' };
      if (s === 'completed') return { pill: 'Completed', sub: '', tone: 'dark' };
      if (s === 'no_show') return { pill: 'No-show', sub: '', tone: 'grey' };
    }
    if (t === 'pickup') {
      if (s === 'received') return { pill: 'Order received', sub: 'The cafe received your order', tone: 'dark' };
      if (s === 'preparing') return { pill: 'Preparing', sub: 'Barista is preparing your order', tone: 'dark' };
      if (s === 'ready') return { pill: 'Ready for pickup', sub: 'Pick up at the counter · Order for ' + o.customer_name, tone: 'red', pulse: true };
      if (s === 'completed') return { pill: 'Completed', sub: '', tone: 'dark' };
    }
    if (t === 'delivery') {
      var drv = o.driver_name ? [o.driver_name, o.driver_vehicle, o.driver_plate].filter(Boolean).join(' · ') : '';
      if (s === 'received') return { pill: 'Order confirmed', sub: 'The cafe received your order', tone: 'dark' };
      if (s === 'preparing') return { pill: 'Preparing', sub: 'Barista is preparing your order', tone: 'dark' };
      if (s === 'driver_picked_up') return { pill: 'Driver picked up', sub: drv, tone: 'dark' };
      if (s === 'on_the_way') return { pill: 'On the way', sub: drv, tone: 'red' };
      if (s === 'completed') return { pill: 'Delivered', sub: '', tone: 'dark' };
    }
    return { pill: cap(s), sub: '', tone: 'dark' };
  }
  var TONES = { dark: ['#0d0d0d', '#fff'], green: ['#128c4a', '#fff'], red: ['#e30a2e', '#fff'], grey: ['#d9d7d2', '#3a3a3a'], amber: ['#f5c542', '#0d0d0d'] };
  function pillStyle(st) {
    var c = TONES[st.tone] || TONES.dark;
    return { padding: '6px 12px', borderRadius: 999, background: c[0], color: c[1], fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0, animation: st.pulse ? 'cafePulse 1.4s ease-in-out infinite' : 'none' };
  }
  // Ordered tracker steps per type, with the index reached for the current status.
  function trackSteps(o) {
    var steps = o.type === 'delivery'
      ? [['received', 'Order confirmed', 'The cafe received your order'], ['preparing', 'Barista is preparing', 'Your drinks are made fresh'], ['driver_picked_up', 'Driver picked up', 'Sealed and on the bike'], ['on_the_way', 'On the way', 'Heading to your address'], ['completed', 'Delivered', 'Enjoy, and fuel up']]
      : [['received', 'Order received', 'The cafe received your order'], ['preparing', 'Barista is preparing', 'Your drinks are made fresh'], ['ready', 'Ready for pickup', 'Come to the pickup counter'], ['completed', 'Picked up', 'Enjoy, and fuel up']];
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
    createOrder: createOrder, createVenue: createVenue, getOrder: getOrder, getMyOrders: getMyOrders,
    findOrder: findOrder, arrived: arrived, rate: rate, slotAvailability: slotAvailability, tableAvailabilityDay: tableAvailabilityDay, capForPax: capForPax, watch: watch,
    rp: rp, time: time, dateTime: dateTime, dayLabel: dayLabel, ymd: ymd, optionsText: optionsText,
    KIND: KIND, methodLabel: methodLabel, SESSION: SESSION, status: status, pillStyle: pillStyle, trackSteps: trackSteps, qrSvg: qrSvg
  };
})();
