#!/usr/bin/env python3
"""The institution's seal, digitised from the author's jacket.

  python3 design/projection/seal.py      writes out/seal-thread-2000.png and out/seal-mask-2000.png

Source: src/patch-crop.png, a crop of the author's own photograph of the patch (21 Oct 2026; the file carries
no EXIF). The patch is the masthead's "insignia of a unit that does not exist", of unknown manufacture: the page
records it as artistic appropriation, and that is what this is.

What is traced and what is set:
- TRACED from the photo: the figure and the dotted (running-stitch) lightning bolts. That drawing is the artifact,
  so it is lifted from the thread itself (local-contrast threshold), warped from the sleeve's ellipse to a circle
  and turned upright, with the photo's specks and the stain under the feet removed.
- SET: the two rings (true circles), the motto ARS EST CELARE ARTEM in a Times-metric roman (Liberation Serif) on
  the arc the photo measures (196 degrees across the top), and the six five-pointed stars at the photo's spacing
  (25 degrees apart, centred at the bottom, a point toward the centre). The traced letters break up at this
  resolution ("ARS" read as "AKS"), so they are re-set rather than redrawn.
"""
import math, os

import numpy as np
import scipy.ndimage as ndi
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src', 'patch-crop.png')
OUT = os.path.join(HERE, 'out')
SERIF = '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'
THREAD = (226, 232, 236)

# the sleeve's ellipse in src/patch-crop.png, fitted to the outer ring's outermost stitches
CX, CY, RX, RY = 276.7, 329.4, 218.8, 233.4
TILT = 5.0                       # degrees the photo is turned clockwise; undone here
STAIN = (245, 440, 290, 505)     # the fabric stain under the feet: its specks are not thread
R_IN, R_OUT = 0.770, 0.990       # ring radii, as fractions of the outer ring
TEXT_SPAN = 196.0                # degrees of arc the motto covers, centred at the top
STARS = [180 + 25 * k for k in (-2.5, -1.5, -0.5, 0.5, 1.5, 2.5)]


def thread_mask():
    """Thread pixels of the photo: brighter than their neighbourhood and bright in absolute terms."""
    g = np.asarray(Image.open(SRC).convert('L')).astype(float)
    loc = np.asarray(Image.fromarray(g.astype('uint8')).filter(ImageFilter.GaussianBlur(12))).astype(float)
    m = (g - loc > 22) & (g > 120)
    lab, n = ndi.label(m)
    keep = np.zeros_like(m)
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        comp = lab[sl] == i
        size = int(comp.sum())
        yy, xx = np.nonzero(comp)
        x, y = xx.mean() + sl[1].start, yy.mean() + sl[0].start
        if size < 3:
            continue
        if STAIN[0] <= x <= STAIN[2] and STAIN[1] <= y <= STAIN[3]:
            continue
        keep[sl] |= comp
    return keep


def traced_interior(D, R):
    """The figure and bolts, warped to a circle of radius R in a D x D canvas, upright."""
    keep = thread_mask().astype(float)
    v, u = np.mgrid[0:D, 0:D].astype(float)
    un, vn = (u - D / 2) / R, (v - D / 2) / R
    t = math.radians(TILT)                       # rotate sample points by +TILT to undo the photo's turn
    us, vs = un * math.cos(t) - vn * math.sin(t), un * math.sin(t) + vn * math.cos(t)
    src = ndi.gaussian_filter(keep, 0.5)
    s = ndi.map_coordinates(src, [CY + vs * RY, CX + us * RX], order=1, mode='constant')
    s = ndi.gaussian_filter(s, D / 1600.0)
    ink = (s > 0.33) & (np.hypot(un, vn) < R_IN - 0.028)
    return ink


def star(d, cx, cy, r, ang):
    """Five-pointed star centred at (cx, cy), outer radius r, one point at angle ang (radians, screen)."""
    pts = []
    for k in range(10):
        rr = r if k % 2 == 0 else r * 0.40
        a = ang + k * math.pi / 5
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=255)


def motto(img, D, R):
    """ARS EST CELARE ARTEM on the arc, letters standing on the inner ring, tops outward."""
    words = ['ARS', 'EST', 'CELARE', 'ARTEM']
    size = int(R * 0.182)
    f = ImageFont.truetype(SERIF, size)
    r_base = R * (R_IN + 0.038)                  # baseline radius
    r_mid = r_base + size * 0.33
    adv = [[f.getlength(c) for c in w] for w in words]
    letters = sum(len(w) for w in words)
    ink = sum(sum(a) for a in adv)
    span = math.radians(TEXT_SPAN) * r_mid
    # word gap = 3.2 letter gaps, as on the patch
    gap = (span - ink) / ((letters - len(words)) + 3.2 * (len(words) - 1))
    s = -span / 2
    for wi, w in enumerate(words):
        for ci, c in enumerate(w):
            a = adv[wi][ci]
            theta = (s + a / 2) / r_mid          # radians, clockwise from 12 o'clock
            tile = Image.new('L', (size * 2, size * 2), 0)
            ImageDraw.Draw(tile).text((size, size), c, font=f, fill=255, anchor='ms',
                                      stroke_width=max(1, size // 40), stroke_fill=255)
            tile = tile.rotate(-math.degrees(theta), resample=Image.BICUBIC, center=(size, size))
            x = D / 2 + r_base * math.sin(theta)
            y = D / 2 - r_base * math.cos(theta)
            img.paste(255, (int(round(x - size)), int(round(y - size))), tile)
            s += a + (gap if ci < len(w) - 1 else 0)
        s += 3.2 * gap


def seal(D=2000):
    """L-mode mask of the whole seal, D x D."""
    R = D / 2 / 1.02
    img = Image.fromarray((traced_interior(D, R) * 255).astype('uint8'))
    d = ImageDraw.Draw(img)
    for rn, w in ((R_IN, 0.0135), (R_OUT, 0.0155)):
        r = rn * R
        d.ellipse([D / 2 - r, D / 2 - r, D / 2 + r, D / 2 + r], outline=255, width=max(2, int(R * w)))
    motto(img, D, R)
    r_star = R * (R_IN + R_OUT) / 2
    for a in STARS:
        t = math.radians(a)
        cx, cy = D / 2 + r_star * math.sin(t), D / 2 - r_star * math.cos(t)
        star(d, cx, cy, R * 0.058, math.atan2(D / 2 - cy, D / 2 - cx))
    return img


def thread(mask, colour=THREAD):
    out = Image.new('RGBA', mask.size, colour + (0,))
    out.putalpha(mask)
    return out


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    m = seal(2000)
    m.save(os.path.join(OUT, 'seal-mask-2000.png'))
    thread(m).save(os.path.join(OUT, 'seal-thread-2000.png'))
    print('wrote seal-mask-2000.png, seal-thread-2000.png')
