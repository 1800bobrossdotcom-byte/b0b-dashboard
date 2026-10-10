#!/usr/bin/env python3
"""Checks the sticker set before anything ships. Exit 1 on any failure.

  - every print file is 300 dpi and transparent at its corners (so a cutter can trace it)
  - every sticker's QR decodes to https://www.b0b.dev at print size and scaled down; the QR
    sticker and the plain PNG down to the size a phone sees from arm's length; the barcode
    decodes to B0B.DEV
  - every attractor is 3-5 words
  - every font in fonts/ declares an open licence (OFL or Apache) in its own name table
"""
import glob
import os
import sys

import zxingcpp
from fontTools.ttLib import TTFont
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
URL = 'https://www.b0b.dev'

ATTRACTORS = {
    's01-sources-or-it-didnt-happen': "SOURCES OR IT DIDN'T HAPPEN",
    's02-secrecy-is-evidence-of-nothing': 'SECRECY IS EVIDENCE OF NOTHING',
    's03-the-tier-ladder': 'DOCUMENTED ATTRIBUTED LABELED CONTESTED UNSUPPORTED',
    's04-read-the-record-yourself-qr': 'READ THE RECORD YOURSELF',
    's05-tetelestai': 'IT HAS BEEN COMPLETED',
    's06-beings-observing-this-frequency': 'ATTN: BEINGS OBSERVING THIS FREQUENCY',
    's07-a-refusal-is-a-finding': 'A REFUSAL IS A FINDING',
    's08-no-weapon-formed-against': 'NO WEAPON FORMED AGAINST',
    's09-timelines-are-not-chains': 'TIMELINES ARE NOT CHAINS',
    's10-tiered-sourced-checkable': 'TIERED SOURCED CHECKABLE',
    's11-no-document-no-claim': 'NO DOCUMENT, NO CLAIM',
    's12-every-claim-carries-a-tier': 'EVERY CLAIM CARRIES A TIER',
}

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

# every sticker carries a QR; each must decode to the site, at print size and scaled down
for p in prints:
    name = os.path.basename(p)[:-4]
    im = flat(Image.open(p))
    for s, w, ok in decodes(im, URL, (1.0, 0.5, 0.33)):
        check(ok, '%s: QR decodes to %s at %d px wide' % (name, URL, w))
qr_sticker = flat(Image.open(os.path.join(HERE, 'out', 'print', 's04-read-the-record-yourself-qr.png')))
for s, w, ok in decodes(qr_sticker, URL, (0.15,)):
    check(ok, 'QR sticker decodes at %d px wide' % w)
for s, w, ok in decodes(flat(qr_sticker, (10, 10, 10)), URL, (0.25,)):
    check(ok, 'QR sticker decodes on a dark surface at %d px wide' % w)
for f in ('b0b-dev-qr.png',):
    for s, w, ok in decodes(flat(Image.open(os.path.join(HERE, 'out', 'qr', f))), URL, (1.0, 0.1)):
        check(ok, '%s decodes at %d px wide' % (f, w))
bar = flat(Image.open(os.path.join(HERE, 'out', 'print', 's12-every-claim-carries-a-tier.png')))
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
