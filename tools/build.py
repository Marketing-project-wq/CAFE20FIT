"""Build the served site from the design bundle + readable logic sources.

    python3 tools/build.py

1. Injects tools/src/root.logic.js, checkout.logic.js and story.logic.js into the design bundle
   (tools/20FIT-Cafe-bundle.html), replacing the logic that is there now. The precompiled
   copy (tools/dc-logic-sources.json) is updated in the same step, so they always match
   and the page never needs eval (Railway's CSP blocks it).
2. Runs tools/unbundle.py to regenerate index.html + assets/.
"""
import base64, gzip, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, 'tools', '20FIT-Cafe-bundle.html')
SOURCES = os.path.join(ROOT, 'tools', 'dc-logic-sources.json')
CHECKOUT_UUID = '042ca1c9-d52e-4324-9a9e-b33919cf41db'
STORY_UUID = 'f9c07b6f-1eb2-4851-9a6c-c682ea4b1f75'  # CoffeeStory (3D 'By our baristas')


def read(p):
    with open(p, encoding='utf-8') as fh:
        return fh.read()


def main():
    s = read(BUNDLE)
    sources = json.loads(read(SOURCES))
    new_root = read(os.path.join(ROOT, 'tools', 'src', 'root.logic.js'))
    new_story = read(os.path.join(ROOT, 'tools', 'src', 'story.logic.js'))
    new_checkout = read(os.path.join(ROOT, 'tools', 'src', 'checkout.logic.js'))
    i_root = next(i for i, x in enumerate(sources) if 'class Component' in x and 'viewer(m, key)' in x)
    i_co = next(i for i, x in enumerate(sources) if 'const METHODS' in x)
    i_story = next(i for i, x in enumerate(sources) if 'PerspectiveCamera' in x)

    mt = re.search(r'(<script type="__bundler/template">)(.*?)(</script>)', s, re.S)
    tpl = json.loads(mt.group(2))
    assert tpl.count(sources[i_root]) == 1, 'root logic in bundle does not match dc-logic-sources.json'
    tpl = tpl.replace(sources[i_root], new_root)
    s = s[:mt.start(2)] + json.dumps(tpl).replace('</', '<\\/') + s[mt.end(2):]

    mm = re.search(r'(<script type="__bundler/manifest">)(.*?)(</script>)', s, re.S)
    man = json.loads(mm.group(2))
    entry = man[CHECKOUT_UUID]
    html = gzip.decompress(base64.b64decode(entry['data'])).decode('utf-8')
    assert html.count(sources[i_co]) == 1, 'checkout logic in bundle does not match dc-logic-sources.json'
    html = html.replace(sources[i_co], new_checkout)
    entry['data'] = base64.b64encode(gzip.compress(html.encode('utf-8'), mtime=0)).decode()
    sentry = man[STORY_UUID]
    shtml = gzip.decompress(base64.b64decode(sentry['data'])).decode('utf-8')
    assert shtml.count(sources[i_story]) == 1, '3D story logic in bundle does not match dc-logic-sources.json'
    shtml = shtml.replace(sources[i_story], new_story)
    sentry['data'] = base64.b64encode(gzip.compress(shtml.encode('utf-8'), mtime=0)).decode()
    s = s[:mm.start(2)] + json.dumps(man) + s[mm.end(2):]

    sources[i_root], sources[i_co], sources[i_story] = new_root, new_checkout, new_story
    with open(BUNDLE, 'w', encoding='utf-8') as fh:
        fh.write(s)
    with open(SOURCES, 'w', encoding='utf-8') as fh:
        json.dump(sources, fh)

    for d in ('assets',):
        p = os.path.join(ROOT, d)
        if os.path.isdir(p):
            for f in os.listdir(p):
                os.remove(os.path.join(p, f))
    subprocess.check_call([sys.executable, os.path.join(ROOT, 'tools', 'unbundle.py'), BUNDLE, ROOT, SOURCES])


if __name__ == '__main__':
    main()
