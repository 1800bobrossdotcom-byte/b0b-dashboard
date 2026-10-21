#!/usr/bin/env python3
"""The Briefing film's own pictures: stills made from the site's own material, written to MEDIA_DIR/briefing/.

    python3 scripts/film-briefing-media.py        # writes the stills and prints each sha256 for the spec

Nothing here is sourced from anyone else:
- the seal, digitised from the jacket's patch (design/projection/seal.py), set on the jacket's navy ripstop,
  whole and in three details (the motto, the figure, the stars);
- the author's photograph of the jacket, as the report publishes it (site/img/ccg-jacket-insignia.jpg);
- the map's own markers (site/intro-points.js), drawn as dots;
- six of the twelve stickers (site/stickers/web/), laid out whole on one sheet so none is cropped.

Screenshots of the site's pages are taken separately, from a local server, and listed in the spec.
"""
import glob, hashlib, json, os, re, shutil, sys

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'design', 'projection'))
import seal as sealmod  # noqa: E402

OUT = os.path.join(os.path.expanduser(os.environ.get('B0B_MEDIA_DIR', '/home/user/.b0b-intro-sources')), 'briefing')
NAVY = (20, 29, 51)
THREAD = (226, 232, 236)
INK = (5, 5, 5)
AMBER = (255, 204, 0)
W, H = 1920, 1080


def ripstop(im, s=1):
    d = ImageDraw.Draw(im)
    step, c = 13 * s, tuple(v + 7 for v in NAVY)
    for x in range(0, im.width, step):
        d.line([(x, 0), (x, im.height)], fill=c, width=s)
    for y in range(0, im.height, step):
        d.line([(0, y), (im.width, y)], fill=c, width=s)
    return im


def seal_on_navy(D, size, s):
    """A W x H (times s) navy field with the seal of diameter D centred on it."""
    im = ripstop(Image.new('RGB', size, NAVY), s)
    mask = sealmod.seal(D)
    thread = Image.new('RGB', (D, D), THREAD)
    im.paste(thread, ((size[0] - D) // 2, (size[1] - D) // 2), mask)
    return im


def main():
    os.makedirs(OUT, exist_ok=True)
    made = {}

    im = seal_on_navy(880, (W, H), 1)
    im.save(os.path.join(OUT, 'seal_navy.png'), optimize=True)
    made['seal_navy.png'] = im

    # the details: the seal drawn larger than the frame and cut to it - (diameter, centre offset as a fraction of R)
    details = {
        'seal_motto.png': (2400, -0.86),        # the arc of the motto across the top
        'seal_figure.png': (1800, 0.0),         # the figure and the bolts, inside the inner ring
        'seal_stars.png': (2400, 0.86),         # the six stars along the bottom
    }
    for name, (D, off) in details.items():
        R = D / 2 / 1.02
        field = seal_on_navy(D, (max(W, D) + 200, D + H + 200), 1)
        cx, cy = field.width // 2, field.height // 2 + int(off * R)
        c = field.crop((cx - W // 2, cy - H // 2, cx + W // 2, cy + H // 2))
        c.save(os.path.join(OUT, name), optimize=True)
        made[name] = c

    shutil.copyfile(os.path.join(ROOT, 'site', 'img', 'ccg-jacket-insignia.jpg'), os.path.join(OUT, 'jacket.jpg'))

    # the map's own markers, as the intro's closing ledger draws them
    s = open(os.path.join(ROOT, 'site', 'intro-points.js'), encoding='utf-8').read()
    pts = json.loads(re.search(r'B0B_INTRO_POINTS=(\[.*?\]);', s, re.S).group(1))
    im = Image.new('RGB', (W, H), INK)
    d = ImageDraw.Draw(im)
    k = min(W * 0.92 / 1024, H * 0.86 / 512)
    ox, oy = (W - 1024 * k) / 2, (H - 512 * k) / 2
    for x, y in pts:
        X, Y = ox + x * k, oy + y * k
        d.ellipse((X - 2.6, Y - 2.6, X + 2.6, Y + 2.6), fill=AMBER)
    im.save(os.path.join(OUT, 'map_dots.png'), optimize=True)

    # six stickers, whole, on one sheet
    files = sorted(glob.glob(os.path.join(ROOT, 'site', 'stickers', 'web', '*.webp')))
    pick = [f for f in files if os.path.basename(f)[:3] in ('s01', 's02', 's05', 's07', 's09', 's10')]
    sheet = Image.new('RGB', (W, H), (14, 15, 16))
    cw, ch = W // 3, H // 2
    for i, f in enumerate(pick):
        st = Image.open(f).convert('RGBA')
        st.thumbnail((cw - 90, ch - 90), Image.LANCZOS)
        x = (i % 3) * cw + (cw - st.width) // 2
        y = (i // 3) * ch + (ch - st.height) // 2
        sheet.paste(st, (x, y), st)
    sheet.save(os.path.join(OUT, 'stickers_sheet.png'), optimize=True)

    for f in sorted(os.listdir(OUT)):
        p = os.path.join(OUT, f)
        print('%-22s %s' % (f, hashlib.sha256(open(p, 'rb').read()).hexdigest()))


if __name__ == '__main__':
    main()
