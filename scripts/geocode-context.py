#!/usr/bin/env python3
"""Place the Epoch AI data centres (which carry street addresses, not coordinates).

Writes scripts/context-geocodes.json, which build-context-layers.py reads, so the
layer rebuilds offline. Run it only when the Epoch file changes.

Two sources, both read under the spider's single identity and robots rules:
  - a US street address goes to the US Census Bureau geocoder (public domain;
    serves no robots.txt). Precision "address".
  - anything else is placed at the town the dataset itself names (in its
    address, its name, or a source it cites, read at that source), using the
    coordinates of that town's Wikipedia article. Precision "locality", and the
    map card says so.
A site whose place the dataset does not state is left unplaced, not guessed.

Nominatim and Photon are NOT used: their robots.txt disallow /search (checked
22 Oct 2026), and the spider obeys robots.

  python3 scripts/geocode-context.py
"""
import csv
import io
import json
import os
import re
import sys
import time
import urllib.parse

import importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('sp', os.path.join(ROOT, 'scripts', 'spider', 'spider.py'))
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)

EPOCH_SHA = '271e08676cbf089705f32d86439ac5ae87cef61f849a76aa8ccc6b2542eb640a'
OUT = os.path.join(ROOT, 'scripts', 'context-geocodes.json')
CENSUS = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress'

# Data centre -> the Wikipedia article for the place the dataset names, and where it names it.
LOCALITY = {
    'Google Mesa': ('Mesa, Arizona', 'name'),
    'Google Kansas City East': ('Kansas City, Missouri', 'name'),
    'Google Storey County': ('Storey County, Nevada', 'name'),
    'Anthropic Barber Lake': ('Colorado City, Texas', "Cipher Mining's SEC 8-K exhibit (Nov 2025)"),
    'OpenAI Stargate Michigan': ('Saline Township, Washtenaw County, Michigan', "Related Digital's site page"),
    'OpenAI Stargate Milam': ('Milam County, Texas', 'name'),
    'OpenAI Stargate New Mexico': ('Doña Ana County, New Mexico', 'the Project Jupiter site'),
    'OpenAI Stargate Wisconsin': ('Port Washington, Wisconsin', "the operator's location page URL"),
    'DayOne Nusajaya': ('Iskandar Puteri', 'name (Nusajaya is its former name)'),
    'DayOne Kempas': ('Johor Bahru', 'address'),
    'Bridge Data Centres MY06': ('Kulai', 'address (Sedenak Tech Park, Kulai district)'),
    'Google Waltham Cross': ('Cheshunt', 'address'),
    'VNET Bayin Ulanqab': ('Ulanqab', 'address'),
    'Huawei Horinger': ('Horinger County', 'address'),
    'Oracle Batam': ('Batam', 'name'),
    'Huawei Wuhu': ('Wuhu', 'address'),
    'CoreWeave Norway': ('Øvrebø', 'address'),
    'Nebius Mantsala': ('fi:Mäntsälä', 'name (the English article carries no coordinates)'),
    'Southgate Melbourne': ('Melbourne', 'name'),
    'Alibaba Zhangbei': ('Zhangbei County', 'address'),
    'Start Campus Sines Data Campus': ('Sines', 'address'),
    'Nscale Keflavik': ('Keflavík', 'name (the Reykjanesbær article carries no coordinates)'),
    'EcoDataCenter 2': ('Borlänge', 'address'),
    'Envision Galaxy Ulanqab': ('Ulanqab', 'name'),
    'Microsoft Narvik Norway': ('Narvik', 'name'),
    'AWS New Albany': ('New Albany, Ohio', "name, with Ohio from the sources it cites"),
    'Amazon Madison Mega Site': ('Canton, Mississippi', 'address'),
    'Google Papillion': ('Papillion, Nebraska', 'address'),
    'Meta Cheyenne': ('Cheyenne, Wyoming', 'address'),
    'Meta Hyperion': ('Holly Ridge, Louisiana', 'address'),
    'OpenAI Stargate UAE': ('Al Dhafra Region', 'address'),
}


def rows():
    p = os.path.join(ROOT, 'research', 'sources', 'cache', EPOCH_SHA[:2], EPOCH_SHA)
    if not os.path.exists(p):
        sys.exit('missing Epoch body: python3 scripts/spider/spider.py fetch https://epoch.ai/data/data_centers/data_centers.csv')
    return list(csv.DictReader(io.StringIO(open(p, encoding='utf-8').read())))


def census(session, address):
    time.sleep(1.0)
    r = session.get(CENSUS, params={'address': address, 'benchmark': 'Public_AR_Current', 'format': 'json'},
                    headers={'User-Agent': sp.UA}, timeout=40)
    if r.status_code != 200:   # e.g. 400 for an address with no street form: treat as no match
        return None
    m = r.json()['result']['addressMatches']
    return (m[0]['coordinates']['y'], m[0]['coordinates']['x'], m[0]['matchedAddress']) if m else None


def wikipedia(session, title):
    lang, _, t = title.partition(':') if re.match(r'^[a-z]{2}:', title) else ('en', '', title)
    url = 'https://%s.wikipedia.org/wiki/' % lang + urllib.parse.quote((t or title).replace(' ', '_'))
    rec = sp.fetch(url, session, note='maplayers2: locality coordinates for a data centre', quiet=True)
    if not rec.get('ok'):
        return None
    body = open(os.path.join(ROOT, rec['cache']), 'rb').read().decode('utf-8', 'replace')
    m = re.search(r'"wgCoordinates":\{"lat":(-?[\d.]+),"lon":(-?[\d.]+)\}', body)
    if m:
        return (float(m.group(1)), float(m.group(2)), url)
    # some articles carry the coordinates only in the infobox's geo microformat
    m = re.search(r'<span class="geo">\s*(-?[\d.]+)\s*;\s*(-?[\d.]+)\s*</span>', body)
    return (float(m.group(1)), float(m.group(2)), url) if m else None


def main():
    import requests
    session = requests.Session()
    out = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else {}
    for r in rows():
        name, addr, country = r['Name'], (r['Address'] or '').strip(), r['Country']
        if name in out and out[name].get('lat') is not None:
            continue
        got = None
        if country == 'United States' and addr and name not in LOCALITY:
            res = census(session, addr)
            if res:
                got = {'lat': round(res[0], 5), 'lng': round(res[1], 5), 'precision': 'address',
                       'place': res[2], 'source': 'US Census Bureau geocoder'}
            else:
                # fall back to the city in the address: "..., City, ST 12345"
                m = re.search(r',\s*([^,]+),\s*([A-Z]{2})\b', addr)
                if m:
                    states = {'TX': 'Texas', 'GA': 'Georgia', 'OK': 'Oklahoma', 'IN': 'Indiana', 'TN': 'Tennessee',
                              'VA': 'Virginia', 'IA': 'Iowa', 'NE': 'Nebraska', 'OH': 'Ohio', 'AZ': 'Arizona',
                              'NV': 'Nevada', 'OR': 'Oregon', 'WA': 'Washington', 'SC': 'South Carolina',
                              'NC': 'North Carolina', 'AL': 'Alabama', 'MS': 'Mississippi', 'LA': 'Louisiana',
                              'WI': 'Wisconsin', 'MN': 'Minnesota', 'IL': 'Illinois', 'PA': 'Pennsylvania',
                              'NY': 'New York', 'ND': 'North Dakota', 'WY': 'Wyoming', 'NM': 'New Mexico',
                              'UT': 'Utah', 'KY': 'Kentucky', 'MO': 'Missouri', 'CO': 'Colorado', 'MI': 'Michigan',
                              'KS': 'Kansas', 'AR': 'Arkansas', 'NJ': 'New Jersey', 'CA': 'California', 'ID': 'Idaho',
                              'MT': 'Montana', 'SD': 'South Dakota', 'WV': 'West Virginia', 'MD': 'Maryland'}
                    title = '%s, %s' % (m.group(1).strip(), states.get(m.group(2), m.group(2)))
                    res = wikipedia(session, title)
                    if res:
                        got = {'lat': round(res[0], 5), 'lng': round(res[1], 5), 'precision': 'locality',
                               'place': title, 'named_in': 'address (no street match)', 'source': res[2]}
        if not got and name in LOCALITY:
            title, where = LOCALITY[name]
            res = wikipedia(session, title)
            if res:
                got = {'lat': round(res[0], 5), 'lng': round(res[1], 5), 'precision': 'locality',
                       'place': title, 'named_in': where, 'source': res[2]}
        out[name] = got or {'lat': None, 'lng': None, 'precision': 'none'}
        print('%-9s %s' % (out[name]['precision'], name))
        with open(OUT, 'w', encoding='utf-8') as f:
            json.dump(out, f, indent=1, ensure_ascii=False, sort_keys=True)
            f.write('\n')
    from collections import Counter
    print(Counter(v['precision'] for v in out.values()))


if __name__ == '__main__':
    main()
