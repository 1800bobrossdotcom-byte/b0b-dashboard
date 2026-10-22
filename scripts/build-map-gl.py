#!/usr/bin/env python3
"""Copy the map's data into the GL map page.

site/map-gl.html (the MapLibre GL engine, previewed at /map?engine=gl) carries
the same data as site/map.html: the marker, line, tunnel and animal-network
arrays, the type colours, the embedded First Peoples territories and the
correlation timeline, copied VERBATIM between marker comments. Every tool that
parses the arrays out of map.html (build-kml, build-start-pages,
check-consistency, date-markers, ...) would read identical text from the GL
page, so the two engines cannot drift apart without this script noticing.

map.html stays the source of truth. Edit it there, then run this.

  python3 scripts/build-map-gl.py           rewrite the blocks in map-gl.html
  python3 scripts/build-map-gl.py --check   exit 1 if map-gl.html is stale
"""
import importlib.util
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')
SRC = os.path.join(SITE, 'map.html')
DST = os.path.join(SITE, 'map-gl.html')

spec = importlib.util.spec_from_file_location('kml', os.path.join(ROOT, 'scripts', 'build-kml.py'))
kml = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kml)

DATA_BEGIN = '<!-- map-data:begin'
DATA_END = '<!-- map-data:end -->'
TL_BEGIN = '<!-- map-timeline:begin'
TL_END = '<!-- map-timeline:end -->'

# The arrays, in the order map.html declares them. Each is copied as its
# literal source text, comments and all.
BLOCKS = ['var colorMap = {', 'var locations = [', 'var connectionLines = [',
          'var tunnelPaths = [', 'var animalNetPaths = [', 'var worldTerritories = [']

TIMELINE_START = '// ===================== CORRELATION TIMELINE ====================='
TIMELINE_STOP = '// ===================== DEEP-LINK URL PARAMETERS'


def labels(src, attr):
    """Checkbox labels from map.html's filter panel, e.g. {'VII': 'VII - Control Arch.'}."""
    out = {}
    for m in re.finditer(r'<input type="checkbox" data-%s="([^"]+)"[^>]*>\s*([^<]+)</label>' % attr, src):
        key, text = m.group(1), m.group(2).strip()
        if key in ('all', 'all-types'):
            continue
        out[key] = text
    return out


def edge_tiers():
    """Tier names and meanings, from the published dataset (written by build-start-pages.py)."""
    d = json.load(open(os.path.join(SITE, 'data', 'map-data.json'), encoding='utf-8'))
    return [{'tier': int(k), 'name': v['name'], 'meaning': v['meaning']}
            for k, v in sorted(d['edge_tiers'].items(), key=lambda kv: int(kv[0]))]


def data_block(src):
    parts = []
    for opener in BLOCKS:
        lit = kml.extract_block(src, opener)
        parts.append(opener[:-1] + lit + ';')
    parts.append('var B0B_SECTION_LABELS = ' + json.dumps(labels(src, 'section'), ensure_ascii=False) + ';')
    parts.append('var B0B_TYPE_LABELS = ' + json.dumps(labels(src, 'type'), ensure_ascii=False) + ';')
    parts.append('var B0B_EDGE_TIERS = ' + json.dumps(edge_tiers(), ensure_ascii=False) + ';')
    return ('<!-- map-data:begin (copied from site/map.html by scripts/build-map-gl.py; edit map.html, not this) -->\n'
            '<script>\n' + '\n'.join(parts) + '\n</script>\n' + DATA_END)


def timeline_block(src):
    i = src.index(TIMELINE_START)
    j = src.index(TIMELINE_STOP, i)
    body = src[i:j].rstrip()
    return ('<!-- map-timeline:begin (copied from site/map.html by scripts/build-map-gl.py) -->\n'
            '<script>\n' + body + '\n</script>\n' + TL_END)


def splice(text, begin, end, block):
    a = text.index(begin)
    b = text.index(end, a) + len(end)
    return text[:a] + block + text[b:]


def render_from(src, dst):
    out = splice(dst, DATA_BEGIN, DATA_END, data_block(src))
    return splice(out, TL_BEGIN, TL_END, timeline_block(src))


def render():
    dst = open(DST, encoding='utf-8').read()
    return dst, render_from(open(SRC, encoding='utf-8').read(), dst)


def check(src=None):
    """True if map-gl.html already carries exactly map.html's data (or `src`'s, for a self-test)."""
    if not os.path.exists(DST):
        return True
    dst = open(DST, encoding='utf-8').read()
    return dst == render_from(src if src is not None else open(SRC, encoding='utf-8').read(), dst)


def main():
    dst, out = render()
    if '--check' in sys.argv:
        if dst != out:
            print('map-gl.html is STALE - run python3 scripts/build-map-gl.py')
            sys.exit(1)
        print('map-gl.html data matches map.html')
        return
    if dst == out:
        print('map-gl.html already current')
        return
    with open(DST, 'w', encoding='utf-8') as f:
        f.write(out)
    print('map-gl.html data refreshed from map.html')


if __name__ == '__main__':
    main()
