#!/usr/bin/env python3
"""Generated parts for the b0b.dev sticker set.

  generated/qr-styled.svg    the sticker QR: soft modules, rounded finders, "b0b" in the centre
  generated/markers.svg      the map's own markers as a dot field (equirectangular), no labels
  out/qr/b0b-dev-qr.svg      plain QR, black on white, 4-module quiet zone - for anything
  out/qr/b0b-dev-qr.png      the same at 2,000 px

The QR encodes https://www.b0b.dev (the canonical host; b0b.dev answers with a 308 to it).
Error correction is H (30%), which is what lets the centre carry the mark: the modules under
it are left out, not painted over. verify.py decodes every file before anything ships.
"""
import importlib.util
import os

import segno

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
URL = 'https://www.b0b.dev'
INK = '#0a0a0a'


def qr_matrix():
    qr = segno.make(URL, error='h', micro=False, boost_error=False)
    rows = [list(r) for r in qr.matrix_iter(scale=1, border=0, verbose=False)]
    return qr, [[1 if v else 0 for v in r] for r in rows]


def styled_qr_svg(qr, m, logo_modules=7):
    n = len(m)
    q = 4  # quiet zone, in modules
    size = n + 2 * q
    finders = [(0, 0), (n - 7, 0), (0, n - 7)]

    def in_finder(x, y):
        return any(fx <= x < fx + 7 and fy <= y < fy + 7 for fx, fy in finders)

    lo = (n - logo_modules) // 2
    hi = lo + logo_modules

    def in_logo(x, y):
        return lo <= x < hi and lo <= y < hi

    parts = []
    for y in range(n):
        for x in range(n):
            if m[y][x] and not in_finder(x, y) and not in_logo(x, y):
                parts.append('<rect x="%.2f" y="%.2f" width="0.9" height="0.9" rx="0.32"/>' % (x + q + 0.05, y + q + 0.05))
    for fx, fy in finders:
        X, Y = fx + q, fy + q
        parts.append('<rect x="%d" y="%d" width="7" height="7" rx="1.9"/>' % (X, Y))
        parts.append('<rect x="%d" y="%d" width="5" height="5" rx="1.25" fill="#fff"/>' % (X + 1, Y + 1))
        parts.append('<rect x="%d" y="%d" width="3" height="3" rx="0.8"/>' % (X + 2, Y + 2))
    c = q + lo
    logo = (
        '<rect x="{x}" y="{x}" width="{w}" height="{w}" rx="1.6" fill="{ink}"/>'
        '<text x="{mid}" y="{ty}" text-anchor="middle" font-family="IBM Plex Mono" font-weight="700" '
        'font-size="2.55" letter-spacing="0.05" fill="#00ff41">b0b</text>'
    ).format(x=c + 0.5, w=logo_modules - 1, ink=INK, mid=size / 2, ty=size / 2 + 0.9)
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {s} {s}" shape-rendering="geometricPrecision">'
            '<rect width="{s}" height="{s}" fill="#fff"/><g fill="{ink}">{body}</g>{logo}</svg>').format(
        s=size, ink=INK, body=''.join(parts), logo=logo)


def markers_svg():
    spec = importlib.util.spec_from_file_location('kml', os.path.join(ROOT, 'scripts', 'build-kml.py'))
    kml = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(kml)
    m = open(os.path.join(ROOT, 'site', 'map.html'), encoding='utf-8').read()
    locs = kml.js_to_json(kml.extract_block(m, 'var locations = ['))
    seen = set()
    dots = []
    for l in locs:
        x, y = round(l['lng'] + 180, 1), round(90 - l['lat'], 1)
        if (x, y) in seen:
            continue
        seen.add((x, y))
        dots.append('<circle cx="%s" cy="%s" r="0.75"/>' % (x, y))
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180">'
           '<g fill="#fff">%s</g></svg>' % ''.join(dots))
    return svg, len(locs), len(dots)


def main():
    os.makedirs(os.path.join(HERE, 'generated'), exist_ok=True)
    os.makedirs(os.path.join(HERE, 'out', 'qr'), exist_ok=True)
    qr, m = qr_matrix()
    open(os.path.join(HERE, 'generated', 'qr-styled.svg'), 'w').write(styled_qr_svg(qr, m))
    qr.save(os.path.join(HERE, 'out', 'qr', 'b0b-dev-qr.svg'), scale=10, border=4, dark='#000', light='#fff', xmldecl=False)
    qr.save(os.path.join(HERE, 'out', 'qr', 'b0b-dev-qr.png'), scale=int(2000 / (len(m) + 8)), border=4, dark='#000', light='#fff')
    svg, n, unique = markers_svg()
    open(os.path.join(HERE, 'generated', 'markers.svg'), 'w').write(svg)
    print('QR %s: version %s, error %s, %dx%d modules' % (URL, qr.version, qr.error, len(m), len(m)))
    print('markers: %d on the map, %d distinct points drawn' % (n, unique))


if __name__ == '__main__':
    main()
