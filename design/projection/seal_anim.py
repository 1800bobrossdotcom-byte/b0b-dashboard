#!/usr/bin/env python3
"""The seal assembling: the lead-in and the close of the speculative Briefing film.

  python3 design/projection/seal_anim.py OUT.mp4      (1280 x 720, 24 fps, about 7 s, silent)
  python3 design/projection/seal_anim.py OUT.mp4 --speed 1.5 --hold 1.2
      the same build, played 1.5x faster, then the finished seal held 1.2 s (4.8 s in all). This is the
      homepage's second arrival step (site/b0b-seal.js); the web files are cut from it by
      design/projection/build_seal_intro.sh.

Everything is the seal's own drawing (seal.py): the two rings draw on clockwise from the top,
ARS EST CELARE ARTEM arrives letter by letter along its arc, the six stars land, then the traced
figure and its bolts open out from the centre. Thread-white on black, as the VERITAS design.
"""
import math, os, subprocess, sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

import seal

W, H, FPS = 1280, 720, 24
DUR = 7.0
D = 640                                  # the seal's box, centred in the frame
BG = (6, 6, 7)
THREAD = (226, 232, 236)


def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def letters(R):
    """Each motto letter as (tile, x, y) in the D x D box, in reading order."""
    words = ['ARS', 'EST', 'CELARE', 'ARTEM']
    size = int(R * 0.182)
    f = ImageFont.truetype(seal.SERIF, size)
    r_base = R * (seal.R_IN + 0.038)
    r_mid = r_base + size * 0.33
    adv = [[f.getlength(c) for c in w] for w in words]
    n = sum(len(w) for w in words)
    ink = sum(sum(a) for a in adv)
    span = math.radians(seal.TEXT_SPAN) * r_mid
    gap = (span - ink) / ((n - len(words)) + 3.2 * (len(words) - 1))
    s = -span / 2
    out = []
    for wi, w in enumerate(words):
        for ci, c in enumerate(w):
            a = adv[wi][ci]
            theta = (s + a / 2) / r_mid
            tile = Image.new('L', (size * 2, size * 2), 0)
            ImageDraw.Draw(tile).text((size, size), c, font=f, fill=255, anchor='ms',
                                      stroke_width=max(1, size // 40), stroke_fill=255)
            tile = tile.rotate(-math.degrees(theta), resample=Image.BICUBIC, center=(size, size))
            x = D / 2 + r_base * math.sin(theta)
            y = D / 2 - r_base * math.cos(theta)
            out.append((tile, int(round(x - size)), int(round(y - size))))
            s += a + (gap if ci < len(w) - 1 else 0)
        s += 3.2 * gap
    return out


BUILT = 5.4                              # the figure has fully opened out by here (unscaled seconds)


def main(out, speed=1.0, hold=None):
    """speed scales the build; hold (seconds) replaces the default length with build + hold."""
    total = DUR if hold is None else BUILT / speed + hold
    R = D / 2 / 1.02
    interior = Image.fromarray((seal.traced_interior(D, R) * 255).astype('uint8'))
    yy, xx = np.mgrid[0:D, 0:D]
    radius = np.hypot(xx - D / 2, yy - D / 2) / R            # 0 at the centre, 1 at the outer ring
    angle = (np.degrees(np.arctan2(xx - D / 2, -(yy - D / 2))) + 360) % 360   # clockwise from 12
    rings = Image.new('L', (D, D), 0)
    g = ImageDraw.Draw(rings)
    for rn, w in ((seal.R_IN, 0.0135), (seal.R_OUT, 0.0155)):
        r = rn * R
        g.ellipse([D / 2 - r, D / 2 - r, D / 2 + r, D / 2 + r], outline=255, width=max(2, int(R * w)))
    rings = np.asarray(rings)
    lets = letters(R)
    r_star = R * (seal.R_IN + seal.R_OUT) / 2
    stars = []
    for a in seal.STARS:
        t = math.radians(a)
        cx, cy = D / 2 + r_star * math.sin(t), D / 2 - r_star * math.cos(t)
        st = Image.new('L', (D, D), 0)
        seal.star(ImageDraw.Draw(st), cx, cy, R * 0.058, math.atan2(D / 2 - cy, D / 2 - cx))
        stars.append(np.asarray(st))
    inter = np.asarray(interior).astype(np.float32)

    ff = os.environ.get('FFMPEG', 'ffmpeg')
    enc = subprocess.Popen([ff, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '%dx%d' % (W, H),
                            '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '14', '-preset', 'slow',
                            '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    n = int(round(total * FPS))
    ox, oy = (W - D) // 2, (H - D) // 2
    for fi in range(n):
        t = fi / FPS * speed
        a = np.zeros((D, D), dtype=np.float32)
        # 0.0-1.4 s: the rings draw on, clockwise from the top
        sweep = ease(t / 1.4) * 360
        a = np.maximum(a, rings * (angle <= sweep))
        # 1.1-3.6 s: the motto, letter by letter, each fading in over 0.25 s
        layer = Image.new('L', (D, D), 0)
        for i, (tile, x, y) in enumerate(lets):
            k = ease((t - 1.1 - i * 2.5 / len(lets)) / 0.25)
            if k > 0:
                layer.paste(Image.eval(tile, lambda v, k=k: int(v * k)), (x, y), tile)
        a = np.maximum(a, np.asarray(layer).astype(np.float32))
        # 3.3-4.1 s: the stars land, left to right along the bottom
        for i, st in enumerate(stars):
            k = ease((t - 3.3 - i * 0.12) / 0.2)
            if k > 0:
                a = np.maximum(a, st * k)
        # 3.9-5.4 s: the figure and its bolts open out from the centre
        reach = ease((t - 3.9) / 1.5) * (seal.R_IN + 0.05)
        if reach > 0:
            edge = np.clip((reach - radius) / 0.06, 0, 1)
            a = np.maximum(a, inter * edge)
        # a slow push across the whole clip
        z = 1.0 + 0.035 * ease(fi / FPS / total)
        img = Image.fromarray(np.clip(a, 0, 255).astype('uint8'))
        if z != 1.0:
            zd = int(round(D * z))
            img = img.resize((zd, zd), Image.BICUBIC).crop(((zd - D) // 2, (zd - D) // 2, (zd - D) // 2 + D, (zd - D) // 2 + D))
        frame = Image.new('RGB', (W, H), BG)
        frame.paste(Image.new('RGB', (D, D), THREAD), (ox, oy), img)
        enc.stdin.write(frame.tobytes())
    enc.stdin.close()
    enc.wait()
    print(out, n, 'frames')


if __name__ == '__main__':
    a = sys.argv[1:]
    opt = {}
    for k in ('--speed', '--hold'):
        if k in a:
            i = a.index(k)
            opt[k[2:]] = float(a[i + 1])
            del a[i:i + 2]
    main(a[0], **opt)
