# How this site is built

The page is a Claude Design export (`20FIT-Cafe-bundle.html`) turned into plain files so it
runs under Railway's strict Content-Security-Policy (no `blob:` scripts, no `eval`).

```
tools/
  20FIT-Cafe-bundle.html   design export (templates + assets); source of truth for markup
  src/root.logic.js        home page logic (menu, cart, Purchase History)
  src/checkout.logic.js    checkout logic (dine-in, takeaway, venue, payment, live status)
  src/cafe-api.js          data layer: Supabase RPCs, order refs, status labels, realtime, QR
  vendor/                  supabase-js 2.103.0 (UMD) and qrcode-generator 1.4.4, both MIT
  dc-logic-sources.json    precompiled copy of the logic (kept in sync by build.py)
  build.py                 injects src/*.logic.js into the bundle, then runs unbundle.py
  unbundle.py              writes index.html + assets/ (content-hashed filenames)
```

Rebuild after changing anything in `tools/`:

```bash
python3 tools/build.py
```

Do not overwrite `20FIT-Cafe-bundle.html` with a fresh design export: the logic in it is
replaced by `tools/src/*.logic.js` on every build, and a new export would bring back the old
prototype logic and markup.

## Data

All data goes through Supabase RPCs on project `cpvzwqptzcxnwzfzgrmt` (see `src/cafe-api.js`).
The browser only stores order keys in `localStorage` `20fit-order-refs` (`{ code, token }`).
