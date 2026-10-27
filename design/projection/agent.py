#!/usr/bin/env python3
"""The VERITAS mark: the trench-coated figure from the seal, without its bolts.

  python3 design/projection/agent.py      writes site/img/vx-agent.png

The figure is the seal's own tracing (seal.traced_interior, lifted from the author's photo of the
jacket patch). The dotted lightning bolts are dropped because they turn to grit at logo size: the
figure is the largest connected stroke, and small marks are kept only where they sit inside its
outline (the eyes). The stroke is thickened two pixels at 1200 px so it holds at 36 px tall.
Output is white with the drawing in the alpha channel; veritas.css uses it as a CSS mask, so the
mark takes the text colour (white on DARK, black on LIGHT).
"""
import os

import numpy as np
import scipy.ndimage as ndi
from PIL import Image

import seal

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'site', 'img', 'vx-agent.png')
HEIGHT = 240


def agent_mask(D=1200):
    ink = seal.traced_interior(D, D / 2 / 1.02)
    lab, n = ndi.label(ink)
    sizes = ndi.sum(ink, lab, range(1, n + 1))
    fig_id = int(np.argmax(sizes)) + 1
    fig = lab == fig_id
    hull = ndi.binary_fill_holes(ndi.binary_closing(fig, iterations=6))
    keep = fig.copy()
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        if i == fig_id:
            continue
        comp = lab[sl] == i
        yy, xx = np.nonzero(comp)
        if hull[int(yy.mean()) + sl[0].start, int(xx.mean()) + sl[1].start]:
            keep[sl] |= comp
    ys, xs = np.nonzero(keep)
    keep = np.pad(keep[ys.min():ys.max() + 1, xs.min():xs.max() + 1], 8)
    return ndi.binary_dilation(keep, iterations=2)


if __name__ == '__main__':
    m = Image.fromarray((agent_mask() * 255).astype('uint8'))
    w = round(m.size[0] * HEIGHT / m.size[1])
    a = m.resize((w, HEIGHT), Image.LANCZOS)
    out = Image.new('RGBA', a.size, (255, 255, 255, 0))
    out.putalpha(a)
    out.save(OUT, optimize=True)
    print(os.path.relpath(OUT), out.size, os.path.getsize(OUT), 'bytes')
