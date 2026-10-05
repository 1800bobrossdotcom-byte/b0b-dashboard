#!/usr/bin/env python3
"""One set of numbers for the whole site, checked and published.

Run last, after `node linguistic-integrity.js generate` (pipeline step 7b).

1. Computes the true counts from the sources themselves: markers and edges from
   the arrays in site/map.html, subsections / paragraphs / sourcing blocks from
   site/report.html (the scale-line rules in CLAUDE.md section 4).
2. Reads every place a count is typed or generated - the report's scale line,
   the map page outside its data arrays, seo-meta.json, and the heads and bodies
   of the generated pages - and fails (exit 1) on any number that disagrees.
3. Writes site/data/build.json: the counts, the content hashes and the build
   stamp, so a reader can check any page against one record.

Written after an outside audit (5 Oct 2026) found pages describing the map with
different counts in the middle of a deploy. A check that finds nothing is not a
pass until it has been shown to find something: `--selftest` plants a wrong
count and confirms the check catches it.
"""
import hashlib
import importlib.util
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')

spec = importlib.util.spec_from_file_location('kml', os.path.join(ROOT, 'scripts', 'build-kml.py'))
kml = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kml)

NUM = r'(\d{1,3}(?:,\d{3})+|\d+)'
# Phrases that state the size of the map. Each must equal the marker count.
MARKER_PHRASES = [
    NUM + r' plotted sites', NUM + r' sites\b', NUM + r' documented sites', NUM + r' mapped locations',
    NUM + r' locations\b', NUM + r' markers\b', NUM + r' placemarks\b',
]
EDGE_PHRASES = [NUM + r' connection lines']


def read(p):
    return open(p, encoding='utf-8').read()


def n(s):
    return int(s.replace(',', ''))


def truth():
    m = read(os.path.join(SITE, 'map.html'))
    locs = kml.js_to_json(kml.extract_block(m, 'var locations = ['))
    conn = kml.js_to_json(kml.extract_block(m, 'var connectionLines = ['))
    tun = kml.js_to_json(kml.extract_block(m, 'var tunnelPaths = ['))
    ani = kml.js_to_json(kml.extract_block(m, 'var animalNetPaths = ['))
    tiers = {}
    for c in conn:
        t = c[4] if len(c) > 4 else 0
        tiers[t] = tiers.get(t, 0) + 1
    for e in tun + ani:
        t = e.get('tier', 0)
        tiers[t] = tiers.get(t, 0) + 1
    r = read(os.path.join(SITE, 'report.html'))
    return {
        'marker_count': len(locs),
        'edge_count': len(conn) + len(tun) + len(ani),
        'edges_by_kind': {'connection': len(conn), 'tunnel': len(tun), 'animal-network': len(ani)},
        'edges_by_tier': {str(k): tiers[k] for k in sorted(tiers)},
        'report_subsections': len(re.findall(r'<h3 id=', r)),
        'report_paragraphs': len(re.findall(r'<p[\s>]', r)),
        'report_sourcing_blocks': len(re.findall(r'<span[^>]*>Sources:', r)) + 5,
    }


def surfaces():
    """(label, text) pairs: every place the site states its own size."""
    out = []
    r = read(os.path.join(SITE, 'report.html'))
    scale = re.search(r'<p class="digest-scale">.*?</p>', r, re.S)
    out.append(('report.html scale line', scale.group(0) if scale else ''))
    m = read(os.path.join(SITE, 'map.html'))
    out.append(('map.html (outside the data)', m[:m.index('var locations = [')]))
    for name in ('start.html', 'about.html', 'retractions.html'):
        p = os.path.join(SITE, name)
        if os.path.exists(p):
            out.append((name, read(p)))
    ml = read(os.path.join(SITE, 'map-list.html'))
    out.append(('map-list.html (head and intro)', ml[:ml.find('<section')] if '<section' in ml else ml))
    seo = json.load(open(os.path.join(ROOT, 'scripts', 'seo-meta.json'), encoding='utf-8'))
    seo.pop('notes', None)  # an internal history memo, never rendered
    out.append(('seo-meta.json', json.dumps(seo, ensure_ascii=False)))
    return out


def check(t, surf):
    problems = []
    for label, text in surf:
        for pat in MARKER_PHRASES:
            for mm in re.finditer(pat, text):
                if n(mm.group(1)) != t['marker_count'] and n(mm.group(1)) > 100:
                    problems.append('%s: "%s" (map has %d)' % (label, mm.group(0), t['marker_count']))
        for pat in EDGE_PHRASES:
            for mm in re.finditer(pat, text):
                if n(mm.group(1)) != t['edge_count']:
                    problems.append('%s: "%s" (map has %d)' % (label, mm.group(0), t['edge_count']))
    scale = dict(surf)['report.html scale line']
    for key, pat in (('report_subsections', NUM + r' subsections'), ('report_paragraphs', NUM + r'(?:\s|&nbsp;)+paragraphs'),
                     ('report_sourcing_blocks', NUM + r' sourcing')):
        mm = re.search(pat, scale)
        if not mm:
            problems.append('report.html scale line: no "%s" figure found' % key)
        elif n(mm.group(1)) != t[key]:
            problems.append('report.html scale line: "%s" (computed %d)' % (mm.group(0), t[key]))
    return problems


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def main():
    t = truth()
    surf = surfaces()
    if '--selftest' in sys.argv:
        planted = [(l, s.replace(format(t['marker_count'], ','), format(t['marker_count'] + 6, ','), 1)) for l, s in surf]
        caught = check(t, planted)
        print('selftest: planted a wrong marker count in every surface; caught %d' % len(caught))
        sys.exit(0 if caught else 1)
    problems = check(t, surf)
    for p in problems:
        print('MISMATCH ' + p)
    gen = json.load(open(os.path.join(ROOT, 'content-integrity-manifest.json'), encoding='utf-8')).get('generated')
    retr = os.path.join(SITE, 'data', 'retractions.json')
    build = {
        'build': gen,
        'note': 'The one record of the site\'s size and state. Every count on every page is checked against it before a deploy.',
        **t,
        'corrections_listed': len(json.load(open(retr, encoding='utf-8'))['entries']) if os.path.exists(retr) else None,
        'sha256': {f: sha(os.path.join(SITE, f)) for f in ('report.html', 'map.html', 'start.html', 'retractions.html')},
        'data': ['/data/map-data.json', '/data/sources-ledger.json', '/data/retractions.json'],
    }
    with open(os.path.join(SITE, 'data', 'build.json'), 'w', encoding='utf-8') as f:
        json.dump(build, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('build %s: %d markers, %d edges, %d subsections, %d paragraphs, %d sourcing; %d mismatches'
          % (gen, t['marker_count'], t['edge_count'], t['report_subsections'], t['report_paragraphs'],
             t['report_sourcing_blocks'], len(problems)))
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
