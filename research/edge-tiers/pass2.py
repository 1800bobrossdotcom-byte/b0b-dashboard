#!/usr/bin/env python3
"""Map pass 2 (4 Oct 2026): held deletions + endpoint corrections. Dry run unless --write."""
import re, sys
sys.path.insert(0, '/home/user/b0b-dashboard/research/edge-tiers')
MAP = '/home/user/b0b-dashboard/site/map.html'
text = open(MAP, encoding='utf-8').read()
from importlib.machinery import SourceFileLoader
ap = SourceFileLoader('ap', '/home/user/b0b-dashboard/research/edge-tiers/apply.py').load_module()

DEL_MARKERS = ['Ionia State Hospital, Michigan', 'Creedmoor Psychiatric Center, Queens, NY',
               'Riverview Hospital (Essondale), Coquitlam, BC, Canada', 'Kasr El Aini Hospital, Cairo, Egypt',
               'Topeka State Hospital, Kansas', 'De Witte Poort (The White Gate), Oosterbeek']
DEL_LABELS = ['Indian Creek ~ Google HQ', 'White House ↔ U.S. Capitol - alleged tunnel',
              'Derinkuyu ↔ Kaymakli underground cities']  # duplicate of the correctly-pinned Derinkuyu ↔ Kaymakli line
KEEP_LABELS = ['Carlisle (Army War College) - Cairo']  # sits on the Kasr El Aini point but is about Sisi; moved instead

LANGLEY = (38.951, -77.1464)
MOVES = [  # (label substring, old point, new point, new label or None, new tier or None)
    ('CIA → Tehran (1953', (38.864, -77.016), LANGLEY, None, None),
    ('CCF Paris ↔ CIA', (38.864, -77.016), LANGLEY, None, None),
    ('BCCI ↔ CIA', (38.864, -77.016), LANGLEY, None, None),
    ('US Embassy → Jakarta army', (38.864, -77.016), (38.8945, -77.0485), 'US Embassy (State Department) → Jakarta army (1965 lists of names; CIA role alleged)', None),
    ('Epstein wired Brunel up to $1M to launch MC2', (48.8656, 2.3212), (25.7617, -80.1918), None, None),
    ('Jean-Luc Brunel (MC2 founder) died in custody', (48.8656, 2.3212), (25.7617, -80.1918), None, None),
    ('Channel Tunnel - 50 km', (51.0125, 1.4861), (51.0932, 1.1294), None, None),
    ('Gotthard Base Tunnel - 57 km', (46.3, 8.92), (46.3805, 8.9063), None, None),
    ('Philippines - Long Island', (40.789, -73.135), (35.3658, -120.8499), 'Philippines - California (Asia-America Gateway cable, in service since 2009)', 3),
    ('Kremlin ↔ Ministry of Defence - Metro-2', (55.7394, 37.615), (55.7317, 37.5880), None, None),
    ('Bern ↔ Gotthard - Swiss National Redoubt', (46.8, 8.2275), (46.56, 8.57), None, None),
    ('Greenbrier bunker (Project Greek Island', (38.8977, -77.0365), (38.8899, -77.0091), None, None),
    ('Cornwall (Bude) - New Jersey', (50.042, -5.654), (50.7919, -4.5537), None, None),
    ('Cornwall (Bude) - Marseille', (50.042, -5.654), (50.7919, -4.5537), None, None),
    ('South Florida - Fortaleza', (25.762, -80.192), (26.3587, -80.0831), None, None),
    ('Dulce (alleged base) ↔ Sandia National Labs', (35.211, -106.451), (35.0507, -106.5431), None, None),
    ('Mayak ↔ Uralvagonzavod', (56.923, 60.054), (57.9375, 60.1015), None, None),
    ('Uralvagonzavod ↔ Yamantau', (56.923, 60.054), (57.9375, 60.1015), None, None),
    ('Moscow (General Staff) → Severomorsk', (55.76, 37.628), (55.7498, 37.6025), None, None),
    ('MITRE - MIT Lincoln Laboratory', (42.36, -71.094), (42.4572, -71.2668), None, None),
    ('Lutnick - Commerce Department', (38.893, -77.046), (38.8938, -77.0328), None, None),
    ('Black Wall Street - Smithsonian', (38.8881, -77.0259), (38.8911, -77.0327), None, None),
    ('Black Wall Street - Tlatelolco', (19.3529, -99.1042), (19.4515, -99.1365), None, None),
    ('FIFA awarded Russia the 2018 World Cup', (43.6028, 39.7342), (43.4022, 39.9559), None, None),
    ('Joe Tsai - Alibaba', (39.9042, 116.4074), (30.2797, 120.0263), None, None),
    ('Lutnick-Epstein contact - next-door', (40.7127, -74.0134), (40.7622, -73.9695), None, None),
    ('Hezbollah cross-border attack tunnels', (33.2774, 35.2037), (33.0985, 35.2030), None, None),
    ('Carlisle (Army War College) - Cairo', (30.044, 31.236), (30.0238, 31.7549), 'Carlisle (Army War College) - Egypt\'s presidency, New Capital (Sisi, class of 2006)', None),
]
# marker move: Foxconn pin onto the Zhengzhou plant; its lines follow
FOX_OLD, FOX_NEW = (34.747, 113.625), (34.5535, 113.8415)

PT = re.compile(r'\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]')
def near(a, b, tol=0.002):
    return abs(a[0]-b[0]) <= tol and abs(a[1]-b[1]) <= tol
def fmt(p):
    return '[%s,%s]' % (repr(p[0]), repr(p[1]))

log = []
# --- markers
del_pts = []
for name in DEL_MARKERS:
    m = re.search(r'^  \{name:"' + re.escape(name) + r'",lat:(-?[\d.]+),lng:(-?[\d.]+).*\n', text, re.M)
    assert m, name
    del_pts.append((name, (float(m.group(1)), float(m.group(2)))))
    text = text[:m.start()] + text[m.end():]
    log.append('DEL marker ' + name)
m = re.search(r'(name:"Foxconn - Zhengzhou iPhone plant / Longhua, Shenzhen",lat:)34\.7466(,lng:)113\.6253', text)
assert m
text = text[:m.start()] + m.group(1) + '34.5535' + m.group(2) + '113.8415' + text[m.end():]
log.append('MOVE marker Foxconn -> 34.5535,113.8415')
m = re.search(r'(name:"Hezbollah Tunnel Network, Southern Lebanon",lat:)33\.2774(,lng:)35\.2037', text)
assert m
text = text[:m.start()] + m.group(1) + '33.0985' + m.group(2) + '35.2030' + text[m.end():]
log.append('MOVE marker Hezbollah tunnels -> border 33.0985,35.2030')

used = {k[0]: 0 for k in MOVES}
for opener in ('var connectionLines = [', 'var tunnelPaths = [', 'var animalNetPaths = ['):
    spans = ap.element_spans(text, opener)
    for s0, s1 in reversed(spans):
        el = text[s0:s1]
        a, b = ap.label_span(el)
        label = el[a+1:b-1]
        pts = [(float(x), float(y)) for x, y in PT.findall(el)]
        kill = any(label.startswith(d) for d in DEL_LABELS)
        if not kill and not any(label.startswith(k) for k in KEEP_LABELS):
            for name, p in del_pts:
                if any(near(q, p) for q in pts):
                    kill = True; log.append('DEL line (on %s): %s' % (name, label[:110])); break
        elif kill:
            log.append('DEL line: ' + label[:110])
        if kill:
            ls = text.rfind('\n', 0, s0) + 1; le = text.index('\n', s1) + 1
            text = text[:ls] + text[le:]; continue
        new = el
        for sub, old, nw, nlabel, ntier in MOVES:
            if label.startswith(sub):
                hit = []
                def rep(mm, old=old, nw=nw, hit=hit):
                    q = (float(mm.group(1)), float(mm.group(2)))
                    if near(q, old, 0.0006):
                        hit.append(1); return fmt(nw)
                    return mm.group(0)
                new = PT.sub(rep, new)
                assert hit, ('no endpoint match', sub)
                used[sub] += 1
                if nlabel:
                    a2, b2 = ap.label_span(new)
                    new = new[:a2] + ap.js_str(nlabel) + new[b2:]
                if ntier is not None:
                    new = re.sub(r',\d\]$', ',%d]' % ntier, new)
                log.append('MOVE %s: %s -> %s' % (sub, old, nw))
        def frep(mm):
            q = (float(mm.group(1)), float(mm.group(2)))
            return fmt(FOX_NEW) if near(q, FOX_OLD, 0.0006) else mm.group(0)
        n2 = PT.sub(frep, new)
        if n2 != new:
            log.append('MOVE (Foxconn follows): ' + label[:90]); new = n2
        if new != el:
            text = text[:s0] + new + text[s1:]
missing = [k for k, v in used.items() if v != 1]
print('\n'.join(log)); print('unmatched/duplicate moves:', missing)
if '--write' in sys.argv and not missing:
    open(MAP, 'w', encoding='utf-8').write(text); print('WRITTEN')
