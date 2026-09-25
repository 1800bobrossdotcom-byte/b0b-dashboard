#!/usr/bin/env python3
"""Build site/listen-places.js - the gazetteer the listen-mode slideshow uses to
pin places the narrator is reading about.

Every entry comes from the map's own markers (site/map.html `locations`), so a
pin in the slideshow is a place the report already plots, with the same
section. Match keys are the marker name's leading phrase ("Headington Hill
Hall" from "Headington Hill Hall, Oxford (Pergamon Press HQ)") and the same
phrase with a generic tail word dropped ("Mount of Olives" from "Mount of Olives
Cemetery").

Excluded on purpose: the 161 mass-shooting markers. Their names identify
perpetrators, which is an open editorial question for the author (CLAUDE.md
section 7), and a slideshow should not surface them while that is unresolved.

Each row carries the marker's coordinates and the deepest satellite zoom the
slideshow may fly to. Residences, private islands and enclaves get zoom 0: they
appear only as a dot on the world map, never as imagery of someone's home. House
numbers are stripped from every name (CLAUDE.md section 2: streets only).

    python3 scripts/build-listen-places.py
"""
import importlib.util
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'site', 'listen-places.js')

spec = importlib.util.spec_from_file_location('bk', os.path.join(ROOT, 'scripts', 'build-kml.py'))
bk = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bk)

# how close the satellite fly-in may go, by marker type; anything unlisted stays on the dot map
ZOOM = {'military': 15, 'underground': 15, 'surveillance': 15, 'datacenter': 15, 'governance': 15, 'satellite': 15,
        'financial': 15, 'museum': 15, 'obelisk': 16, 'archaeological': 15, 'airport': 14, 'mining': 14,
        'blacksite': 14, 'corporate': 15, 'technology': 15, 'capital': 14, 'submarine-cable': 12, 'conflict': 11,
        'animal-research': 14, 'crypto-tech': 14, 'organized-crime': 11, 'sports-gambling': 14}
PRIVATE = re.compile(r'residen|home\b|house\b|mansion|ranch|townhouse|apartment|estate\b|villa\b|island|isle\b|cay\b|atoll|'
                     r'Little St|Great St|Zorro|Indian Creek|Fisher Island|El Brillo|Avenue Foch|East 71st|New Albany|compound', re.I)


def clean_name(name):
    return re.sub(r'(^|,\s*|\(\s*)\d+[A-Za-z]?\s+(?=[A-Z])', r'\1', name).strip()


GENERIC = r'\s+(Cemetery|Headquarters|HQ|Complex|Center|Centre|Facility|Campus|Building|Site|Base|Station|Office|Offices|Plant)$'
TOO_BROAD = {'United States', 'New York', 'Washington', 'London', 'Paris', 'China', 'Russia', 'Israel', 'Iran',
             'Europe', 'Africa', 'Asia', 'Moscow', 'Beijing', 'California', 'Florida', 'Texas', 'Virginia'}


GIVEN = set('''Howard Leon Leslie Les Jeffrey Ghislaine Peter Bill William Larry Sergey Elon Mark Reid Ehud Alan Lawrence
Donald Robert Richard Henry David John James Michael Steven Stephen Jes Glenn Kathryn Prince Andrew Woody Noam Marvin
Lynn Evelyn Mortimer Jean Jean-Luc Nicole Sarah Nadia Adriana Virginia Joi Martin George Charles Thomas Paul Joseph
Daniel Kevin Brian Anthony Christopher Matthew Mary Jennifer Linda Elizabeth Barbara Susan Jessica Karen Nancy
Lisa Betty Margaret Sandra Ashley Kimberly Emily Donna Michelle Carol Amanda Melissa Deborah Laura Rebecca Sharon
Cynthia Kathleen Amy Angela Shirley Anna Brenda Pamela Emma Nicholas Eric Jonathan Gary Timothy Jose Ronald Jason
Edward Ryan Jacob Gregory Frank Raymond Jack Dennis Jerry Tyler Aaron Adam Nathan Henry Zachary Douglas Harold Carl
Arthur Gerald Roger Keith Jeremy Terry Lloyd Sean Christian Austin Benjamin Samuel Patrick Alexander Walter Harvey
Sheldon Rupert Lachlan Tony Ari Ghislaine Isabel Christine Kevin Ian Ivanka Jared Tom Rudy Rudolph Vladimir Xi Kim
Bibi Benjamin Naftali Yossi Meir Tamir Shimon Yitzhak Golda Ariel Moshe Avi Dov'''.split())


def personlike(k):
    t = k.split()
    return 2 <= len(t) <= 3 and t[0] in GIVEN and all(re.match(r"^[A-Z][a-z'.\-]+$", w) for w in t)


def keys_for(name):
    # "Egypt - Suez Canal Cable Corridor", "Qatar - 2022 FIFA World Cup", "Chicago, Illinois - Sinaloa
    # Distribution Hub", "Burbank - Lockheed Skunk Works": the part before the dash is a place qualifier,
    # not the site, and would pin a whole country or city to one topical marker. Such leads give no key.
    if ' - ' in name:
        head = name.split(' - ', 1)[0]
        if ',' in head or len(head.split()) == 1:
            return []
    lead = re.split(r'\s+-\s+|\s+\(|,\s+|\s+/\s+', name, maxsplit=1)[0].strip()
    if personlike(lead):                                     # "Howard Lutnick / Cantor Fitzgerald": a person is not a place
        rest = re.split(r'\s+/\s+', name, maxsplit=1)
        lead = re.split(r',\s+|\s+\(', rest[1])[0].strip() if len(rest) > 1 else ''
        if not lead:
            return []
    out = []
    lead = clean_name(lead)
    for k in (lead, re.sub(GENERIC, '', lead)):
        k = k.strip(' .')
        if len(k) >= 5 and k[0].isupper() and k not in TOO_BROAD and k not in out:
            out.append(k)
    return out


def main():
    text = open(bk.SRC, encoding='utf-8').read()
    locs = bk.js_to_json(bk.extract_block(text, 'var locations = ['))
    rows, seen = [], set()
    for loc in locs:
        if loc.get('type') == 'mass-shooting':
            continue
        try:
            lat, lng = float(loc['lat']), float(loc['lng'])
        except (KeyError, TypeError, ValueError):
            continue
        x = int(round((lng + 180.0) / 360.0 * 1023))
        y = int(round((90.0 - lat) / 180.0 * 511))
        for k in keys_for(loc['name']):
            if k in seen:
                continue
            seen.add(k)
            typ = loc.get('type', '')
            z = 0 if PRIVATE.search(loc['name'] + ' ' + loc.get('ctx', '')[:200]) else ZOOM.get(typ, 0)
            shown = ' / '.join(part for part in clean_name(loc['name']).split(' / ') if not personlike(part.split(',')[0].strip()))
            rows.append([k, x, y, loc.get('section', ''), typ, shown, round(lat, 5), round(lng, 5), z])
    rows.sort(key=lambda r: -len(r[0]))   # longest key first, so the most specific match wins
    js = ('/* generated by scripts/build-listen-places.py from site/map.html - do not edit */\n'
          'window.B0B_LISTEN_PLACES=%s;\n' % json.dumps(rows, ensure_ascii=False, separators=(',', ':')))
    open(OUT, 'w', encoding='utf-8').write(js)
    print('wrote %s: %d keys from %d markers (%.1f KB)' % (os.path.relpath(OUT, ROOT), len(rows), len(locs), len(js) / 1024))


if __name__ == '__main__':
    main()
