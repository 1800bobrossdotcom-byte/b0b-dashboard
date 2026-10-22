#!/usr/bin/env python3
"""Build the GL map's context layers from source files the spider has ledgered.

Context layers are infrastructure drawn under the evidence for orientation. They
are not evidence and are never drawn as edges: a site near a power plant is not
connected to it. Each layer is built only from a source whose licence was read
at the source (scratchpad research, 22 Oct 2026), from the exact bytes the
ledger recorded - the script refuses a cached body whose sha256 differs.

Output goes to public/data-context/ (Vercel static output; site/ is near the
function size cap). Each file carries its own provenance block.

  python3 scripts/build-context-layers.py

Layers:
  power-plants.json  WRI Global Power Plant Database v1.3.0, CC BY 4.0.
                     Frozen June 2021, unmaintained by WRI since early 2022.

Not built, and why (decisions held for the author, see CLAUDE.md section 7):
  submarine cables / landing points (TeleGeography: data sold under licence),
  IXPs (PeeringDB / IXPDB bar bulk redistribution; PCH is non-commercial),
  oil and gas (GEM trackers behind a form; OGIM is 3.4 GB - the author downloads),
  flaring (World Bank file states no licence of its own; upstream VIIRS Nightfire
  is licence-gated - confirm with the World Bank first),
  data centres (Epoch AI, CC BY, 95 sites by street address; names Anthropic).
"""
import csv
import hashlib
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'research', 'sources', 'cache')
OUT = os.path.join(ROOT, 'public', 'data-context')

GPPD_URL = 'https://raw.githubusercontent.com/wri/global-power-plant-database/master/output_database/global_power_plant_database.csv'
GPPD_SHA = '4b1f93e0fd93664f18684d9b05d0a52ed9658c6a8cf0d21ff2520791379ba7fc'


def cached(url, sha):
    p = os.path.join(CACHE, sha[:2], sha)
    if not os.path.exists(p):
        sys.exit('missing cache body for %s\n  run: python3 scripts/spider/spider.py fetch %s' % (url, url))
    data = open(p, 'rb').read()
    got = hashlib.sha256(data).hexdigest()
    if got != sha:
        sys.exit('cache body for %s hashes %s, ledger says %s - refusing' % (url, got, sha))
    return data


def power_plants():
    rows = list(csv.DictReader(cached(GPPD_URL, GPPD_SHA).decode('utf-8').splitlines()))
    feats = []
    for r in rows:
        try:
            lat, lng, mw = float(r['latitude']), float(r['longitude']), float(r['capacity_mw'])
        except ValueError:
            continue
        others = [r[k] for k in ('other_fuel1', 'other_fuel2', 'other_fuel3') if r[k]]
        p = {
            'name': r['name'],
            'fuel': r['primary_fuel'] + (' (also ' + ', '.join(others) + ')' if others else ''),
            'mw': round(mw, 1),
            'country': r['country_long'],
        }
        if r['commissioning_year']:
            p['year'] = str(int(float(r['commissioning_year'])))
        if r['source']:
            p['src'] = r['source']
        p['id'] = r['gppd_idnr']
        feats.append({'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [round(lng, 4), round(lat, 4)]}, 'properties': p})
    # largest first, so the biggest plants draw underneath the small ones
    feats.sort(key=lambda f: -f['properties']['mw'])
    return {
        'type': 'FeatureCollection',
        'provenance': {
            'dataset': 'Global Power Plant Database v1.3.0 (released 2 June 2021)',
            'publisher': 'World Resources Institute and Data Contributors',
            'attribution': 'Global Energy Observatory, Google, KTH Royal Institute of Technology in Stockholm, Enipedia, World Resources Institute. 2021. Global Power Plant Database version 1.3.0. Accessed through https://datasets.wri.org/datasets/global-power-plant-database on 22 October 2026',
            'licence': 'CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)',
            'changes': 'Simplified by b0b.dev: fields reduced to name, fuel, capacity, country, commissioning year, per-row source and id; owner and generation columns dropped; coordinates rounded to 4 decimal places.',
            'caveats': 'Not maintained by WRI since early 2022. Plants of 1 MW and over, about 72% of world capacity by the publisher\'s estimate; the publisher notes that matching can merge two plants or split one.',
            'source_url': GPPD_URL,
            'source_sha256': GPPD_SHA,
            'features': len(feats),
        },
        'features': feats,
    }


def main():
    os.makedirs(OUT, exist_ok=True)
    fc = power_plants()
    path = os.path.join(OUT, 'power-plants.json')
    body = json.dumps(fc, ensure_ascii=False, separators=(',', ':'))
    with open(path, 'w', encoding='utf-8') as f:
        f.write(body)
    print('power-plants.json  %d plants  %d bytes' % (len(fc['features']), len(body.encode('utf-8'))))


if __name__ == '__main__':
    main()
