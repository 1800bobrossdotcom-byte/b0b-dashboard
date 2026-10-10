#!/usr/bin/env python3
"""Checks the sticker set before anything ships. Exit 1 on any failure.

  - every print file is 300 dpi and transparent at its corners (so a cutter can trace it)
  - every sticker's QR decodes to https://www.b0b.dev at print size and scaled down; the QR
    sticker and the plain PNG down to the size a phone sees from arm's length; the barcode
    decodes to B0B.DEV
  - every attractor is 3-5 words, and is the line actually set on its sticker in stickers.html
  - every font in fonts/ declares an open licence (OFL or Apache) in its own name table
"""
import glob
import html
import os
import re
import sys

import zxingcpp
from fontTools.ttLib import TTFont
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
URL = 'https://www.b0b.dev'

# The headline each sticker carries. Every one is the report's own sentence or a cut of it;
# README.md quotes the sentence it comes from. 03 also carries the sentence the page puts
# after it ("It changed form."), and 05 the Greek word its gloss translates.
ATTRACTORS = {
    's01-no-hands-of-its-own': 'NO HANDS OF ITS OWN',
    's02-the-record-is-deliberately-dark': 'THE RECORD IS DELIBERATELY DARK',
    's03-slavery-did-not-end': 'SLAVERY DID NOT END',
    's04-where-no-sunlight-reaches-qr': 'WHERE NO SUNLIGHT REACHES',
    's05-tetelestai': 'IT HAS BEEN COMPLETED',
    's06-in-court-the-silence-held': 'IN COURT, THE SILENCE HELD',
    's07-the-map-beneath-the-map': 'THE MAP BENEATH THE MAP',
    's08-no-weapon-formed-against': 'NO WEAPON FORMED AGAINST',
    's09-weighed-and-found-wanting': 'WEIGHED AND FOUND WANTING',
    's10-not-one-sparrow-is-forgotten': 'NOT ONE SPARROW IS FORGOTTEN',
    's11-the-emergency-did-not-end': 'THE EMERGENCY DID NOT END',
    's12-the-ledger-is-already-kept': 'THE LEDGER IS ALREADY KEPT',
}
QR_STICKER = next(k for k in ATTRACTORS if k.startswith('s04-'))
TAG_STICKER = next(k for k in ATTRACTORS if k.startswith('s12-'))

fails = []


def check(ok, msg):
    print(('PASS ' if ok else 'FAIL ') + msg)
    if not ok:
        fails.append(msg)


def flat(im, bg=(255, 255, 255)):
    im = im.convert('RGBA')
    base = Image.new('RGBA', im.size, bg + (255,))
    base.alpha_composite(im)
    return base.convert('RGB')


def decodes(im, want, scales):
    out = []
    for s in scales:
        t = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
        out.append((s, t.width, any(r.text == want for r in zxingcpp.read_barcodes(t))))
    return out


prints = sorted(glob.glob(os.path.join(HERE, 'out', 'print', '*.png')))
check(len(prints) == len(ATTRACTORS), '%d print files for %d designs' % (len(prints), len(ATTRACTORS)))
for p in prints:
    name = os.path.basename(p)[:-4]
    im = Image.open(p)
    dpi = im.info.get('dpi', (0, 0))
    a = im.convert('RGBA').getchannel('A')
    corners = [a.getpixel(xy) for xy in ((0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1))]
    check(round(dpi[0]) == 300 and max(corners) == 0,
          '%s: %d dpi, %.2f x %.2f in, corners transparent' % (name, round(dpi[0]), im.width / 300, im.height / 300))
    check(name in ATTRACTORS, '%s: has an attractor on record' % name)

for name, text in ATTRACTORS.items():
    n = len(text.replace(',', ' ').split())
    check(3 <= n <= 5, '"%s" is %d words' % (text, n))


def words(s):
    return re.sub(r'[^A-Z0-9]+', ' ', s.upper()).split()


# the line on record must be the line on the sticker, word for word and in order (line breaks
# and punctuation aside), so this file, the README and the site cannot drift from the art
src = open(os.path.join(HERE, 'stickers.html'), encoding='utf-8').read()
INLINE = r'</?(?:span|b|i|em|strong|small|a)\b[^>]*>'   # a drop cap or a coloured zero sits inside its word
for name, text in ATTRACTORS.items():
    m = re.search(r'<section[^>]*\bid="%s"[^>]*>(.*?)</section>' % re.escape(name), src, re.S)
    body = re.sub(r'<[^>]+>', ' ', re.sub(INLINE, '', m.group(1))) if m else ''
    art = words(html.unescape(body))
    want, i = words(text), 0
    for w in art:
        if i < len(want) and w == want[i]:
            i += 1
    check(bool(m) and i == len(want), '%s: the sticker carries "%s"' % (name, text))

# every sticker carries a QR; each must decode to the site, at print size and scaled down
for p in prints:
    name = os.path.basename(p)[:-4]
    im = flat(Image.open(p))
    for s, w, ok in decodes(im, URL, (1.0, 0.5, 0.33)):
        check(ok, '%s: QR decodes to %s at %d px wide' % (name, URL, w))
qr_sticker = flat(Image.open(os.path.join(HERE, 'out', 'print', QR_STICKER + '.png')))
for s, w, ok in decodes(qr_sticker, URL, (0.15,)):
    check(ok, 'QR sticker decodes at %d px wide' % w)
for s, w, ok in decodes(flat(qr_sticker, (10, 10, 10)), URL, (0.25,)):
    check(ok, 'QR sticker decodes on a dark surface at %d px wide' % w)
for f in ('b0b-dev-qr.png',):
    for s, w, ok in decodes(flat(Image.open(os.path.join(HERE, 'out', 'qr', f))), URL, (1.0, 0.1)):
        check(ok, '%s decodes at %d px wide' % (f, w))
bar = flat(Image.open(os.path.join(HERE, 'out', 'print', TAG_STICKER + '.png')))
for s, w, ok in decodes(bar, 'B0B.DEV', (1.0, 0.5)):
    check(ok, 'barcode decodes to B0B.DEV at %d px wide' % w)

# each font against its own licence file, fetched from the google/fonts repository
LICENCES = {
    'VT323-Regular.ttf': 'vt323-OFL.txt', 'SpecialElite-Regular.ttf': 'specialelite-LICENSE.txt',
    'BigShouldersStencil-ExtraBold.ttf': 'bigshouldersstencil-OFL.txt', 'GFSDidot-Regular.ttf': 'gfsdidot-OFL.txt',
    'Doto-Black.ttf': 'doto-OFL.txt', 'RubikGlitch-Regular.ttf': 'rubikglitch-OFL.txt',
    'Jacquard24-Regular.ttf': 'jacquard24-OFL.txt', 'Monoton-Regular.ttf': 'monoton-OFL.txt',
    'Unbounded-Black.ttf': 'unbounded-OFL.txt', 'Anton-Regular.ttf': 'anton-OFL.txt',
    'LibreBarcode39Text-Regular.ttf': 'librebarcode39text-OFL.txt', 'IBMPlexMono-Medium.ttf': 'ibmplexmono-OFL.txt',
    'IBMPlexMono-Bold.ttf': 'ibmplexmono-OFL.txt', 'BlackOpsOne-Regular.ttf': 'blackopsone-OFL.txt',
}
for f in sorted(glob.glob(os.path.join(HERE, 'fonts', '*.ttf'))):
    base = os.path.basename(f)
    lic_path = os.path.join(HERE, 'fonts', 'licenses', LICENCES.get(base, '-'))
    text = open(lic_path, encoding='utf-8', errors='replace').read() if os.path.exists(lic_path) else ''
    kind = 'OFL 1.1' if 'SIL OPEN FONT LICENSE Version 1.1' in text else 'Apache 2.0' if 'Apache License' in text and 'Version 2.0' in text else None
    url = ' '.join(str(r) for r in TTFont(f)['name'].names if r.nameID == 14).lower()
    agrees = (not url) or (kind == 'OFL 1.1' and ('/ofl' in url or 'openfontlicense' in url)) or (kind == 'Apache 2.0' and 'apache' in url)
    check(bool(kind) and agrees, '%s: %s (%s)' % (base, kind or 'NO LICENCE FILE', os.path.basename(lic_path)))

print('\n%d failed' % len(fails) if fails else '\nall passed')
sys.exit(1 if fails else 0)
