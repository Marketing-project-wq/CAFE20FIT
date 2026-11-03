"""Convert a bundled single-file page into index.html + assets/ (no blob: URLs)."""
import re,json,sys,base64,gzip,os,hashlib
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
def blk(t):
    m=re.search(r'<script type="%s">(.*?)</script>'%re.escape(t),s,re.S); return m.group(1) if m else None
man=json.loads(blk('__bundler/manifest')); tpl=json.loads(blk('__bundler/template'))
ext=json.loads(blk('__bundler/ext_resources') or '[]')
assert json.loads(blk('__bundler/page_order') or '[]')==[], 'nested pages unsupported'
EXT={'text/css':'css','application/javascript':'js','text/javascript':'js','text/html':'html','image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/svg+xml':'svg','font/woff2':'woff2','font/woff':'woff'}
os.makedirs(out+'/assets',exist_ok=True)
paths={}; rel={}
for u,e in man.items():
    b=base64.b64decode(e['data'])
    if e.get('compressed'): b=gzip.decompress(b)
    # content hash in the name so browsers never reuse a stale cached copy
    p='assets/%s.%s.%s'%(u,hashlib.sha256(b).hexdigest()[:8],EXT.get(e['mime'],'bin')); rel[u]='./'+p
    open(out+'/'+p,'wb').write(b); paths[u]=p
res={x['id']:rel[x['uuid']] for x in ext if x['uuid'] in paths}
for u,p in rel.items(): tpl=tpl.replace(u,p)
tpl=re.sub(r'\s+integrity="[^"]*"','',tpl,flags=re.I); tpl=re.sub(r'\s+crossorigin="[^"]*"','',tpl,flags=re.I)
inject='<script>window.__resources = (function (r) { for (var k in r) r[k] = new URL(r[k], document.baseURI).href; return r; })('+json.dumps(res).replace('</','<\\/')+');</script>'
m=re.search(r'<head[^>]*>',tpl,re.I); assert m
tpl=tpl[:m.end()]+inject+tpl[m.end():]
open(out+'/index.html','w',encoding='utf-8').write(tpl)
print(len(paths),'assets; index.html',len(tpl),'bytes; resources',len(res))

# --- Patch dc-runtime so logic classes can come from a precompiled script (no eval needed) ---
OLD='''  function evalDcLogic(src) {
'''
NEW='''  function evalDcLogic(src) {
    const pre = window.__dcLogic && window.__dcLogic.get(src);
    if (pre) return pre(StreamableLogic, StreamableLogic, getReact());
    (window.__dcSrcs = window.__dcSrcs || []).push(src);
'''
n=0
for u,p in paths.items():
    if p.endswith('.js'):
        t=open(out+'/'+p,encoding='utf-8').read()
        if OLD in t:
            open(out+'/'+p,'w',encoding='utf-8').write(t.replace(OLD,NEW,1)); n+=1
assert n==1, n
srcs_file=sys.argv[3] if len(sys.argv)>3 else None
lines=['window.__dcLogic = new Map();']
if srcs_file:
    for src in json.load(open(srcs_file)):
        lines.append('window.__dcLogic.set(%s, function (DCLogic, StreamableLogic, React) {\n%s\n;return (typeof Component!=="undefined"&&Component)||undefined;\n});'%(json.dumps(src).replace('</','<\\/'),src))
logic_js='\n'.join(lines)+'\n'
import hashlib
# Content-hashed name so browsers never pair a new page with a stale cached logic file
logic_name='assets/dc-logic.%s.js'%hashlib.sha256(logic_js.encode('utf-8')).hexdigest()[:10]
open(out+'/'+logic_name,'w',encoding='utf-8').write(logic_js)
# Site scripts (vendored libs + data layer), content-hashed like the rest, loaded before the page logic
here=os.path.dirname(os.path.abspath(__file__))
extra=[os.path.join(here,'vendor','supabase-js-2.103.0.umd.js'),os.path.join(here,'vendor','qrcode-generator-1.4.4.js'),os.path.join(here,'src','cafe-api.js'),os.path.join(here,'src','track.js'),os.path.join(here,'src','story-config.js'),os.path.join(here,'src','backdrops-config.js')]
tags=''
for pth in extra:
    if not os.path.exists(pth): continue
    b=open(pth,'rb').read(); base=os.path.basename(pth)[:-3]
    name='assets/%s.%s.js'%(base,hashlib.sha256(b).hexdigest()[:10])
    open(out+'/'+name,'wb').write(b); tags+='<script src="'+name+'"></script>'
t=open(out+'/index.html',encoding='utf-8').read()
m=re.search(r'<head[^>]*>',t,re.I)
t=t[:m.end()]+tags+'<script src="'+logic_name+'"></script>'+t[m.end():]
# Loading skeleton right after <body> (shows before any script runs) and site-wide head tags (tracker)
boot=os.path.join(here,'src','boot.html')
if os.path.exists(boot):
    mb=re.search(r'<body[^>]*>',t,re.I); assert mb
    t=t[:mb.end()]+'\n'+open(boot,encoding='utf-8').read()+t[mb.end():]
# 20FIT first-party tracker (pageviews + CTA clicks, no PII) -- kept here so rebuilds never drop it
HEAD_EXTRA='<script async src="https://admin.20fit.id/api/t/js" data-unit="cafe"></script>\n'
# open the connections the first screen needs (menu API, Instagram embeds, three.js CDN) while the page loads
PRECONNECT=''.join('<link rel="preconnect" href="%s" crossorigin>'%h for h in ['https://cpvzwqptzcxnwzfzgrmt.supabase.co','https://www.instagram.com','https://static.cdninstagram.com','https://scontent.cdninstagram.com','https://cdn.jsdelivr.net'])
if 'rel="preconnect" href="https://www.instagram.com"' not in t:
    mh=re.search(r'<meta name="viewport"[^>]*>',t); t=t[:mh.end()]+PRECONNECT+t[mh.end():]
if 'admin.20fit.id/api/t/js' not in t:
    t=t.replace('</head>',HEAD_EXTRA+'</head>',1)
# First paint: charset/viewport first, and external scripts deferred (same order, run after parsing) so the
# skeleton above paints immediately instead of waiting for ~1MB of JavaScript to download.
metas=''
for pat in (r'<meta charset="utf-8">\s*', r'<meta name="viewport"[^>]*>\s*'):
    mm2=re.search(pat,t,re.I)
    if mm2: metas+=mm2.group(0).strip()+'\n'; t=t[:mm2.start()]+t[mm2.end():]
m=re.search(r'<head[^>]*>',t,re.I); t=t[:m.end()]+metas+t[m.end():]
t=re.sub(r'<script src="(\.?/?assets/[^"]+\.js)"></script>',r'<script defer src="\1"></script>',t)
open(out+'/index.html','w',encoding='utf-8').write(t)
print('patched runtime; precompiled logic blocks:',len(lines)-1)
