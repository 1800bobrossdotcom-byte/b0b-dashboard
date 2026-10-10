#!/usr/bin/env python3
"""Publishes the sticker set to the site at /stickers.

Run after finish.py and verify.py. Writes:
  site/stickers/print/<id>.png        the 300 dpi print files, unchanged
  site/stickers/web/<id>.webp         display copies, 720 px wide, transparent
  site/stickers/b0b-dev-qr.svg|png    the plain QR code
  site/stickers/b0b-dev-stickers.zip  everything a printer needs, in one file
  site/img/stickers-card.jpg          1200x630 share card, cut from the preview
  site/stickers.html                  the page, on the same template as /start and /about

The page's SEO block is filled by scripts/apply-seo-meta.js from scripts/seo-meta.json;
run that afterwards.
"""
import html
import importlib.util
import os
import shutil
import zipfile

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SITE = os.path.join(ROOT, 'site')
DEST = os.path.join(SITE, 'stickers')

spec = importlib.util.spec_from_file_location('startpages', os.path.join(ROOT, 'scripts', 'build-start-pages.py'))
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)

# id -> (attractor, face, where the line comes from, link)
SET = [
    ('s01-sources-or-it-didnt-happen', "SOURCES OR IT DIDN'T HAPPEN", 'VT323',
     'the method in one line', '/about'),
    ('s02-secrecy-is-evidence-of-nothing', 'SECRECY IS EVIDENCE OF NOTHING', 'Special Elite + Black Ops One',
     'the guaranteed-null rule', '/start'),
    ('s03-the-tier-ladder', 'DOCUMENTED · ATTRIBUTED · LABELED · CONTESTED · UNSUPPORTED', 'Big Shoulders Stencil',
     'the tier ladder', '/start'),
    ('s04-read-the-record-yourself-qr', 'READ THE RECORD YOURSELF', 'IBM Plex Mono',
     'the invitation the whole site makes', '/report'),
    ('s05-tetelestai', 'τετέλεσται · IT HAS BEEN COMPLETED', 'GFS Didot',
     "the report's reading of the word, over the map's own markers", '/report#xxiv-endgame'),
    ('s06-beings-observing-this-frequency', 'ATTN: BEINGS OBSERVING THIS FREQUENCY', 'Doto',
     'the opening of Section XXV', '/report#XXV'),
    ('s07-a-refusal-is-a-finding', 'A REFUSAL IS A FINDING', 'Rubik Glitch',
     "the crawler's rule: refusals are logged, never worked around", '/about'),
    ('s08-no-weapon-formed-against', 'NO WEAPON FORMED AGAINST', 'Jacquard 24',
     "the author's own line in Section I (Isaiah 54:17)", '/report#i-the-authors-testimony-the-work-is-the-method'),
    ('s09-timelines-are-not-chains', 'TIMELINES ARE NOT CHAINS', 'Monoton',
     'the anti-map rule: a shared timeline is not a chain', '/start'),
    ('s10-tiered-sourced-checkable', 'TIERED · SOURCED · CHECKABLE', 'Unbounded',
     'what every claim on the page is', '/about'),
    ('s11-no-document-no-claim', 'NO DOCUMENT, NO CLAIM', 'Anton',
     'testimony is promoted only by a document', '/start'),
    ('s12-every-claim-carries-a-tier', 'EVERY CLAIM CARRIES A TIER', 'Libre Barcode 39 Text',
     'the barcode scans as B0B.DEV', '/start'),
]

CSS = '''
main.stk-main{max-width:1100px}
.stk-head{max-width:72ch}
.stk-dl{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0 6px}
.stk-dl a{font:600 14px/1.2 var(--mono);letter-spacing:.03em;text-decoration:none;padding:12px 16px;border:1px solid var(--rule);
  background:var(--panel);color:var(--ink)}
.stk-dl a.go{border-color:var(--phos);color:var(--phos)}
.stk-dl a:hover{border-color:var(--phos)}
.stk-dl a small{font-weight:400;color:var(--dim);margin-left:6px}
.stk-grid{list-style:none;padding:0;margin:34px 0 0;display:grid;gap:22px;
  grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))}
.stk-card{background:var(--panel);border:1px solid var(--rule);display:flex;flex-direction:column}
.stk-card .art{position:relative;aspect-ratio:4/3;
  background:radial-gradient(120% 120% at 50% 40%,color-mix(in srgb,var(--panel) 70%,#000),var(--ground))}
:root[data-theme="light"] .stk-card .art{background:radial-gradient(120% 120% at 50% 40%,#3a3f3d,#1f2322)}
.stk-card img{position:absolute;inset:22px;width:calc(100% - 44px);height:calc(100% - 44px);object-fit:contain;
  filter:drop-shadow(0 8px 14px rgba(0,0,0,.45))}
.stk-card .meta{padding:14px 16px 16px;border-top:1px solid var(--rule);display:grid;gap:6px}
.stk-card .line{font:600 14px/1.35 var(--mono);letter-spacing:.03em;color:var(--ink);overflow-wrap:anywhere}
.stk-card .from{font-size:15px;line-height:1.45;color:var(--ink-2)}
.stk-card .spec{font:12.5px/1.5 var(--mono);color:var(--dim)}
.stk-card .get{font:600 13px/1.4 var(--mono);text-decoration:none;color:var(--link)}
.stk-card .get:hover{text-decoration:underline}
.stk-notes{max-width:72ch}
.qr-inline{display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin:6px 0 0}
.qr-inline img{width:132px;height:132px;background:#fff;padding:6px;border:1px solid var(--rule)}
'''


def kb(path):
    n = os.path.getsize(path)
    return '%.1f MB' % (n / 1048576) if n >= 1048576 else '%d KB' % round(n / 1024)


def publish_files():
    os.makedirs(os.path.join(DEST, 'print'), exist_ok=True)
    os.makedirs(os.path.join(DEST, 'web'), exist_ok=True)
    rows = []
    for sid, line, face, src, link in SET:
        src_png = os.path.join(HERE, 'out', 'print', sid + '.png')
        if not os.path.exists(src_png):
            raise SystemExit('missing print file %s - run finish.py first' % src_png)
        dst_png = os.path.join(DEST, 'print', sid + '.png')
        shutil.copyfile(src_png, dst_png)
        im = Image.open(src_png).convert('RGBA')
        w_in, h_in = im.width / 300, im.height / 300
        web = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
        web_path = os.path.join(DEST, 'web', sid + '.webp')
        web.save(web_path, 'WEBP', quality=86, method=6)
        rows.append(dict(id=sid, line=line, face=face, src=src, link=link, w=w_in, h=h_in,
                         web='/stickers/web/%s.webp' % sid, wpx=web.width, hpx=web.height,
                         png='/stickers/print/%s.png' % sid, size=kb(dst_png)))
    for f in ('b0b-dev-qr.svg', 'b0b-dev-qr.png'):
        shutil.copyfile(os.path.join(HERE, 'out', 'qr', f), os.path.join(DEST, f))
    zpath = os.path.join(DEST, 'b0b-dev-stickers.zip')
    with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED) as z:
        for r in rows:
            z.write(os.path.join(DEST, 'print', r['id'] + '.png'), 'b0b-dev-stickers/print/%s.png' % r['id'])
        for f in ('b0b-dev-qr.svg', 'b0b-dev-qr.png'):
            z.write(os.path.join(DEST, f), 'b0b-dev-stickers/qr/' + f)
        z.write(os.path.join(HERE, 'README.md'), 'b0b-dev-stickers/README.md')
        for f in sorted(os.listdir(os.path.join(HERE, 'fonts', 'licenses'))):
            z.write(os.path.join(HERE, 'fonts', 'licenses', f), 'b0b-dev-stickers/font-licences/' + f)
    # share card: the preview sheet, fitted into 1200x630 on the same ground
    prev = Image.open(os.path.join(HERE, 'out', 'b0b-dev-stickers-preview.png')).convert('RGB')
    card = Image.new('RGB', (1200, 630), (18, 18, 20))
    s = min(1200 / prev.width, 630 / prev.height) * 1.12
    p = prev.resize((round(prev.width * s), round(prev.height * s)), Image.LANCZOS)
    card.paste(p, ((1200 - p.width) // 2, (630 - p.height) // 2))
    card.save(os.path.join(SITE, 'img', 'stickers-card.jpg'), quality=86, optimize=True, progressive=True)
    return rows, kb(zpath)


def build_page(rows, zip_size):
    cards = []
    for r in rows:
        cards.append(
            '<li class="stk-card"><div class="art"><img src="%s" width="%d" height="%d" alt="Sticker: %s" loading="lazy" decoding="async"></div>'
            '<div class="meta"><span class="line">%s</span>'
            '<span class="from">From <a href="%s">%s</a>.</span>'
            '<span class="spec">%s &middot; %.2f &times; %.2f in &middot; die-cut</span>'
            '<a class="get" href="%s" download>Print file (PNG, 300 dpi, %s) &darr;</a></div></li>'
            % (r['web'], r['wpx'], r['hpx'], html.escape(r['line']), html.escape(r['line']), r['link'], html.escape(r['src']),
               html.escape(r['face']), r['w'], r['h'], r['png'], r['size']))
    body = '''<div class="wide">
<div class="stk-head">
<p class="kicker">Stickers</p>
<h1>b0b.dev stickers</h1>
<p class="lede">Twelve die-cut designs, each in its own typeface, each carrying one line from the method this site runs on, and each with a QR code that opens www.b0b.dev. Free to download and print.</p>
<div class="stk-dl">
  <a class="go" href="/stickers/b0b-dev-stickers.zip" download>DOWNLOAD ALL<small>ZIP &middot; %s</small></a>
  <a href="/stickers/b0b-dev-qr.svg" download>QR CODE<small>SVG</small></a>
  <a href="/stickers/b0b-dev-qr.png" download>QR CODE<small>PNG</small></a>
</div>
</div>
<ul class="stk-grid">
%s
</ul>
<section class="stk-notes">
<h2>Printing</h2>
<ul class="items">
<li><b>Order die-cut.</b> Each print file is a 300 dpi PNG with a transparent background and its own white border. The cut goes along the outer edge of the white. Upload the file as it is; most sticker printers trace the cut line from the transparency.</li>
<li><b>Sizes.</b> Each card gives the finished size, border included. All twelve scale cleanly to about 80&ndash;130%% of it.</li>
<li><b>Colour.</b> The art is RGB. The neon greens, cyans and magentas are brighter than printing inks can reach and will come out duller. Ask for a proof before a full run.</li>
</ul>
<h2>The QR codes</h2>
<div class="qr-inline"><img src="/stickers/b0b-dev-qr.svg" alt="QR code for https://www.b0b.dev" width="132" height="132">
<p style="margin:0;max-width:52ch">Every sticker carries one, and every one opens <b>https://www.b0b.dev</b>. They are built with spare error correction (level Q on the small tiles, H on the large codes), so a scuffed sticker still scans. The plain code here is for anything else: flyers, slides, a wall.</p></div>
<h2>The typefaces</h2>
<p>VT323, Special Elite, Black Ops One, Big Shoulders Stencil, IBM Plex Mono, GFS Didot, Doto, Rubik Glitch, Jacquard 24, Monoton, Unbounded, Anton and Libre Barcode 39 Text. All are under the SIL Open Font License 1.1 except Special Elite (Apache 2.0); both licences allow printing anything made with them. The licence texts are in the zip.</p>
</section>
</div>''' % (zip_size, '\n'.join(cards))
    body += '<footer>b0b.dev &middot; read the record yourself: <a href="/report">the report</a> &middot; <a href="/start">read this first</a> &middot; <a href="/map">the map</a>.</footer>'
    out = sp.page('b0b.dev stickers', body, main_class='stk-main').replace('  </style>', CSS + '  </style>', 1)
    open(os.path.join(SITE, 'stickers.html'), 'w', encoding='utf-8').write(out)


def main():
    rows, zip_size = publish_files()
    build_page(rows, zip_size)
    print('published %d stickers to site/stickers/ (zip %s) and site/stickers.html' % (len(rows), zip_size))


if __name__ == '__main__':
    main()
