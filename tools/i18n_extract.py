"""One-off helper: move the static UI texts of a page template into the i18n dictionary.

python3 tools/i18n_extract.py <root|checkout> <prefix>
  root     = the page template (__bundler/template)
  checkout = Checkout.dc.html (manifest 042ca1c9-…), story = CoffeeStory.dc.html (manifest f9c07b6f-…)
Every static text node segment and every static placeholder / aria-label / title / alt becomes {{ t.<prefix>_<slug> }};
the original texts are written to tools/src/i18n/<prefix>.en.js (review them: some originals were Indonesian).
Texts already bound ({{ … }}) are left alone. Re-running on an already converted template changes nothing.
"""
import re, json, sys, base64, gzip, html, os
which, prefix = sys.argv[1], sys.argv[2]
BUNDLE = os.path.join(os.path.dirname(__file__), '20FIT-Cafe-bundle.html')
PAGES = {'checkout': '042ca1c9-d52e-4324-9a9e-b33919cf41db', 'story': 'f9c07b6f-1eb2-4851-9a6c-c682ea4b1f75'}
s = open(BUNDLE, encoding='utf-8').read()
def block(t): return re.search(r'(<script type="%s">)(.*?)(</script>)' % re.escape(t), s, re.S)
if which == 'root':
    m = block('__bundler/template'); src = json.loads(m.group(2))
else:
    CHECKOUT = PAGES[which]; mm = block('__bundler/manifest'); man = json.loads(mm.group(2)); e = man[CHECKOUT]
    b = base64.b64decode(e['data']); src = (gzip.decompress(b) if e.get('compressed') else b).decode('utf-8')
SKIP = {'20FIT', 'FIT', 'Rp', 'QRIS', 'OK', 'WA', 'EN', 'ID'}
keys, out_order = {}, []
def key_for(text):
    if text in keys: return keys[text]
    slug = '_'.join(re.findall(r'[a-z0-9]+', text.lower())[:5])[:40] or 'x'
    k = prefix + '_' + slug; n = 2
    while k in keys.values(): k = prefix + '_' + slug + '_' + str(n); n += 1
    keys[text] = k; out_order.append(text); return k
def translatable(t):
    t2 = t.strip()
    return t2 and t2 not in SKIP and re.search(r'[A-Za-zÀ-ÿ]{2,}', t2) and not t2.startswith('{{')
def conv_text(txt):
    parts = re.split(r'(\{\{.*?\}\})', txt); res = []
    for p in parts:
        if p.startswith('{{') or not translatable(p): res.append(p); continue
        lead = p[:len(p) - len(p.lstrip())]; trail = p[len(p.rstrip()):]
        res.append(lead + '{{ t.' + key_for(html.unescape(p.strip())) + ' }}' + trail)
    return ''.join(res)
# protect script / style / svg / comments
prot = []
def keep(mo): prot.append(mo.group(0)); return '\x00%d\x00' % (len(prot) - 1)
work = re.sub(r'<!--.*?-->|<script\b.*?</script>|<style\b.*?</style>|<svg\b.*?</svg>', keep, src, flags=re.S | re.I)
mixed = []
def conv_attr(mo):
    name, val = mo.group(1), mo.group(2)
    if '{{' in val:
        if re.sub(r'\{\{.*?\}\}', '', val).strip(' ·:-'): mixed.append(name + '="' + val + '"')
        return mo.group(0)
    if not translatable(val): return mo.group(0)
    return ' %s="{{ t.%s }}"' % (name, key_for(html.unescape(val.strip())))
work = re.sub(r'\s(placeholder|aria-label|title|alt)="([^"]*)"', conv_attr, work)
work = re.sub(r'>([^<>]+)<', lambda mo: '>' + conv_text(mo.group(1)) + '<', work)
work = re.sub(r'\x00(\d+)\x00', lambda mo: prot[int(mo.group(1))], work)
if which == 'root':
    s = s[:m.start(2)] + json.dumps(work).replace('</', '<\\/') + s[m.end(2):]
else:
    data = gzip.compress(work.encode('utf-8')) if e.get('compressed') else work.encode('utf-8')
    e['data'] = base64.b64encode(data).decode(); man[CHECKOUT] = e
    s = s[:mm.start(2)] + json.dumps(man) + s[mm.end(2):]
open(BUNDLE, 'w', encoding='utf-8').write(s)
path = os.path.join(os.path.dirname(__file__), 'src', 'i18n', prefix + '.tpl.en.js')
with open(path, 'w', encoding='utf-8') as f:
    f.write('// Template texts of the %s page (EN). Generated once by tools/i18n_extract.py, edit freely.\nI18N.add(\'en\', {\n' % which)
    for t in out_order: f.write('  %s: %s,\n' % (keys[t], json.dumps(t, ensure_ascii=False)))
    f.write('});\n')
print(len(out_order), 'texts ->', path); print('mixed attributes left as they are:', mixed)
