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

## Product photos (POS is the only source)

Every product photo on the site — landing sections (hero card, "A day, fueled", quiz), FULL MENU, product view and
checkout — is the POS photo from the web menu (`cafe_get_web_menu` → `image_url`, synced from the POS every minute
and right after a product is saved). A POS product without a photo shows its 2D 20FIT illustration (`productArt`).
The site keeps no menu photos of its own: the old design photos were moved to `tools/archive/menu-photos-2026-11-27/`
(not loaded by the page).

Landing sections reference products by web menu id in `src/story-config.js` (`P.<name>.id`). A product that is not
on the menu, hidden from the web or sold out is left out of its section (never replaced by another product).
To find an id: `curl -s -X POST https://cpvzwqptzcxnwzfzgrmt.supabase.co/rest/v1/rpc/cafe_get_web_menu -H "apikey: <publishable key from cafe-api.js>" -H "Content-Type: application/json" -d '{}'`.

## Languages (EN default, ID)

- `src/i18n.js` is the core: the visitor's choice lives in localStorage `20fit-lang` and applies to every page.
  - There is no browser-language detection: English until the visitor taps **ID** in the EN | ID switch (header, FULL MENU, checkout).
- Texts live in `src/i18n/<area>.<lang>.js` as `I18N.add('en', { key: 'text' })`. The areas are:
  - `home*`: landing, FULL MENU, history, claim
  - `co*`: checkout, payment, order status
  - `api`: status labels, methods, errors
  - `st*`: 3D coffee story
- `*.tpl.*` files hold the template texts.
- Templates bind `{{ t.key }}` (every `renderVals()` returns `t: I18N.table()`). Logic calls `T('key', { var })`, with `{var}` placeholders in the text.
  - A key missing in ID falls back to EN.
  - A key missing everywhere shows the key itself, so it is visible in review.
- Story copy in `src/story-config.js` is written as `{ en, id }` objects.
- Product names are never translated (they follow the POS).
  - Category names go through `cat.<POS name>` (e.g. Food → Makanan).
  - Descriptions come from the POS in both languages (`description_en` / `description_id`); an empty Indonesian description shows the English one.
- An order keeps the language it was made in:
  - It is sent to admin.20fit.id → `cf_online_order.language`, and also saved on this phone's order ref (`20fit-order-refs[].lang`).
  - Its status screens and the customer receipt use that language.
- `i18n_extract.py` was used once to move the template texts into the dictionaries.
  - Re-run it only for a new template page.
  - New texts in an existing template: add `{{ t.new_key }}` by hand plus the key in both languages.
