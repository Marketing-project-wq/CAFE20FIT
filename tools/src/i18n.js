/*
 * 20FIT Cafe website — language (EN default, ID on request).
 *
 * - The visitor's choice is kept in localStorage '20fit-lang' and used on every page; there is no detection from the
 *   browser language: English until the visitor taps ID.
 * - Texts live in tools/src/i18n/<area>.<lang>.js (I18N.add('en', {...})). Templates bind {{ t.key }} (renderVals
 *   returns t: I18N.table()); logic calls T('key', { var: value }) with {var} placeholders. A key missing in ID falls back
 *   to EN, a key missing everywhere shows the key (so a missing text is visible in review, never blank).
 * - Product names are never translated (they follow the POS); category names go through 'cat.<POS name>' keys.
 * - Changing the language fires window event '20fit-lang'; the page components re-render on it.
 */
(function () {
  var KEY = '20fit-lang';
  var dict = { en: {}, id: {} };
  var cache = {};
  function read() { try { return localStorage.getItem(KEY) === 'id' ? 'id' : 'en'; } catch (e) { return 'en'; } }
  var cur = read();
  function fill(s, vars) { return vars ? String(s).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; }) : s; }
  function t(key, vars, lang) {
    var L = lang === 'id' || lang === 'en' ? lang : cur;
    var s = dict[L][key]; if (s == null) s = dict.en[key]; if (s == null) s = key;
    return fill(s, vars);
  }
  function table(lang) {
    var L = lang === 'id' || lang === 'en' ? lang : cur;
    if (cache[L]) return cache[L];
    var o = {}; for (var k in dict.en) o[k] = t(k, null, L); for (var j in dict[L]) if (!(j in o)) o[j] = dict[L][j];
    return (cache[L] = o);
  }
  function set(l) {
    var n = l === 'id' ? 'id' : 'en'; if (n === cur) return;
    cur = n; try { localStorage.setItem(KEY, n); } catch (e) {}
    try { document.documentElement.lang = n; } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('20fit-lang', { detail: n })); } catch (e) {}
  }
  function add(lang, entries) { var d = dict[lang] || (dict[lang] = {}); for (var k in entries) d[k] = entries[k]; cache = {}; }
  // Category label: POS category names stay as they are unless a translation exists ('cat.Food' → MAKANAN).
  function cat(name, lang) { var k = 'cat.' + name; var L = lang || cur; return dict[L][k] != null ? dict[L][k] : (dict.en[k] != null ? dict.en[k] : name); }
  window.I18N = { lang: function () { return cur; }, set: set, t: t, table: table, add: add, cat: cat, dict: dict };
  window.T = t;
  try { document.documentElement.lang = cur; } catch (e) {}
})();
