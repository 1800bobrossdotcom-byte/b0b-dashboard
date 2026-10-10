#!/usr/bin/env python3
"""Turns raw/<id>.png into print files and a preview.

  out/print/<id>.png      300 dpi, transparent background, a white die-cut border of BORDER_IN
                          around the art's own silhouette (rounded, anti-aliased). Cut along the
                          outer edge of the white. The pHYs chunk carries 300 dpi so print tools
                          read the physical size correctly.
  out/b0b-dev-stickers-preview.png   every sticker on one sheet, for looking at - not for print
  out/qr/b0b-dev-qr-sticker.png      the QR sticker on its own, same file as in out/print

The border is computed exactly: a Euclidean distance transform of the art's alpha, so concave
notches narrower than twice the border fill in and everything else is offset by the same width.
"""
import glob
import math
import os
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
DPI = 300
BORDER_IN = 0.07           # white die-cut border
PAD = int(BORDER_IN * DPI) + 6


def diecut(im):
    im = im.convert('RGBA')
    w, h = im.size
    canvas = Image.new('RGBA', (w + 2 * PAD, h + 2 * PAD), (0, 0, 0, 0))
    canvas.alpha_composite(im, (PAD, PAD))
    a = np.asarray(canvas)[:, :, 3].astype(np.float32) / 255.0
    inside = a > 0.5
    dist = ndimage.distance_transform_edt(~inside)          # px to the art, 0 inside it
    r = BORDER_IN * DPI
    cover = np.clip(r - dist + 0.5, 0.0, 1.0)                 # 1px anti-aliased edge
    border = np.zeros(canvas.size[::-1] + (4,), dtype=np.uint8)
    border[:, :, 0:3] = 255
    border[:, :, 3] = (np.maximum(cover, a) * 255).round().astype(np.uint8)
    out = Image.fromarray(border, 'RGBA')
    out.alpha_composite(canvas)
    return out


def preview(files, path):
    """A loose sticker-bomb sheet: dark ground, each sticker turned a few degrees, soft shadow."""
    random.seed(7)
    scale = 0.36
    cols = 4
    cell_w, cell_h = 560, 520
    W, H = cols * cell_w + 120, math.ceil(len(files) / cols) * cell_h + 200
    ground = Image.new('RGBA', (W, H), (18, 18, 20, 255))
    noise = Image.effect_noise((W, H), 9).convert('L')
    ground = Image.composite(Image.new('RGBA', (W, H), (26, 26, 29, 255)), ground, noise.point(lambda v: 60 if v > 128 else 0))
    d = ImageDraw.Draw(ground)
    for k, f in enumerate(files):
        im = Image.open(f).convert('RGBA')
        im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
        im = im.rotate(random.uniform(-6, 6), resample=Image.BICUBIC, expand=True)
        shadow = Image.new('RGBA', im.size, (0, 0, 0, 0))
        shadow.putalpha(im.getchannel('A').point(lambda v: int(v * 0.55)))
        shadow = shadow.filter(ImageFilter.GaussianBlur(9))
        r, c = divmod(k, cols)
        x = 60 + c * cell_w + (cell_w - im.width) // 2 + random.randint(-14, 14)
        y = 120 + r * cell_h + (cell_h - im.height) // 2 + random.randint(-12, 12)
        ground.alpha_composite(shadow, (x + 6, y + 10))
        ground.alpha_composite(im, (x, y))
    ground.convert('RGB').save(path, optimize=True)
    return ground.size


def main():
    os.makedirs(os.path.join(HERE, 'out', 'print'), exist_ok=True)
    raws = sorted(glob.glob(os.path.join(HERE, 'raw', '*.png')))
    printed = []
    for f in raws:
        out = diecut(Image.open(f))
        dest = os.path.join(HERE, 'out', 'print', os.path.basename(f))
        out.save(dest, dpi=(DPI, DPI), optimize=True)
        printed.append(dest)
        print('%-44s %5d x %4d px  =  %.2f x %.2f in' % (os.path.basename(f), out.width, out.height, out.width / DPI, out.height / DPI))
    qr = [p for p in printed if 'qr' in os.path.basename(p)]
    if qr:
        Image.open(qr[0]).save(os.path.join(HERE, 'out', 'qr', 'b0b-dev-qr-sticker.png'), dpi=(DPI, DPI), optimize=True)
    size = preview(printed, os.path.join(HERE, 'out', 'b0b-dev-stickers-preview.png'))
    print('preview', size)


if __name__ == '__main__':
    main()
