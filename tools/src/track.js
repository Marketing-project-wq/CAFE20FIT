/*
 * track(event, params): safe analytics helper. Pushes to GA4 / GTM when the page has them, no-op otherwise.
 * Never pass personal data here (no names, phone numbers, emails).
 */
window.track = function (event, params) {
  try {
    params = params || {};
    if (typeof window.gtag === 'function') window.gtag('event', event, params);
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({ event: event }, params));
    if (window.__trackDebug) console.log('[track]', event, params);
  } catch (e) { /* analytics must never break the page */ }
};
// Once per session per key (e.g. one story_chapter_view per chapter)
window.trackOnce = function (key, event, params) {
  try { var k = 'trk:' + key; if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch (e) { window.__trk = window.__trk || {}; if (window.__trk[key]) return; window.__trk[key] = 1; }
  window.track(event, params);
};
