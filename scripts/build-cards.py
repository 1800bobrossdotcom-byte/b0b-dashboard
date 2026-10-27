#!/usr/bin/env python3
"""One card from the record: build site/data/cards.json from scripts/cards/cards.json.

A card may say less than the report, never more. Every card's quote must be found
word for word (ellipsis cuts allowed, in order) inside the subsection its anchor
names, so a card cannot outlive a correction: when the page stops saying it, the
build stops. The section and subsection titles shown on a card are read from the
page, not typed. Nothing is written unless every card passes.

    python3 scripts/build-cards.py            build
    python3 scripts/build-cards.py --check    check only
    python3 scripts/build-cards.py --list XV  subsections of a section, with anchors
    python3 scripts/build-cards.py --dump ID  the plain text of one subsection
    python3 scripts/build-cards.py --check --src FILE   check a draft file instead
    python3 scripts/build-cards.py --selftest plant a misquote, a wrong anchor and a
                                              connection name missing from its quote;
                                              all three must be caught
"""
import html, importlib.util, json, re, sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'scripts' / 'cards' / 'cards.json'
OUT = ROOT / 'site' / 'data' / 'cards.json'
PAGE = ROOT / 'site' / 'card.html'      # owned by this script; run apply-seo-meta.js after it
REPORT = ROOT / 'site' / 'report.html'

# The summary's text extraction and matching, reused so the two checks cannot drift.
_spec = importlib.util.spec_from_file_location('bsp', ROOT / 'scripts' / 'build-summary-pdf.py')
bsp = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(bsp)

TYPES = {'fact', 'method', 'question', 'connection'}
TIERS = {'documented', 'attributed', 'contested', 'unsupported', 'not established', 'testimony', 'rule', 'open'}
# §2: names that never go on the page, on a card or anywhere.
NEVER = ['oldfield']


def strip_tags(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s))).strip()


def blocks(report):
    """anchor -> (section id, section title, subsection title, normalised text of the block)."""
    heads = [(m.start(), m.group(1), m.group(2), m.group(3)) for m in
             re.finditer(r'<(h2|h3)\b[^>]*\bid="([^"]+)"[^>]*>(.*?)</\1>', report, re.S)]
    out, sec, sec_title = {}, None, ''
    for i, (pos, tag, hid, inner) in enumerate(heads):
        end = len(report)
        for p2, t2, _, _ in heads[i + 1:]:
            if tag == 'h3' or t2 == 'h2':
                end = p2
                break
        if tag == 'h2':
            sec, sec_title = hid, strip_tags(inner)
        out[hid] = (sec, sec_title, strip_tags(inner), bsp.norm(bsp.text_of(report[pos:end])))
    return out


def check(cards, idx):
    errs, seen = [], set()
    for c in cards:
        cid = c.get('id', '?')
        if cid in seen:
            errs.append(f'{cid}: duplicate id')
        seen.add(cid)
        if not re.fullmatch(r'[a-z0-9-]{3,48}', cid):
            errs.append(f'{cid}: id must be 3-48 of [a-z0-9-]')
        if c.get('type') not in TYPES:
            errs.append(f'{cid}: type {c.get("type")!r}')
        if c.get('tier') not in TIERS:
            errs.append(f'{cid}: tier {c.get("tier")!r}')
        p, q = c.get('prompt', ''), c.get('quote', '')
        if not 12 <= len(p) <= 140:
            errs.append(f'{cid}: prompt length {len(p)} (12-140)')
        if not 40 <= len(q) <= 480:
            errs.append(f'{cid}: quote length {len(q)} (40-480)')
        low = (p + ' ' + q).lower()
        for n in NEVER:
            if n in low:
                errs.append(f'{cid}: carries a name §2 forbids')
        a = c.get('anchor')
        if a not in idx:
            errs.append(f'{cid}: anchor {a!r} not on the page')
            continue
        if not bsp.found_in(q, idx[a][3]):
            errs.append(f'{cid}: quote not found in #{a}')
        if c.get('type') == 'connection':
            between = c.get('between') or []
            if len(between) != 2:
                errs.append(f'{cid}: a connection names exactly two parties')
            for b in between:
                if bsp.norm(b) not in bsp.norm(q):
                    errs.append(f'{cid}: {b!r} is not in its own quote')
            if c.get('tier') != 'documented':
                errs.append(f'{cid}: a connection card is documented (tier 3+) or it is not a card')
    return errs


def build(cards, idx):
    out = []
    for c in cards:
        sec, sec_title, sub_title, _ = idx[c['anchor']]
        d = {k: c[k] for k in ('id', 'type', 'prompt', 'quote', 'tier', 'anchor')}
        if c.get('between'):
            d['between'] = c['between']
        d['section'] = sec
        d['section_title'] = sec_title
        d['subsection'] = sub_title if c['anchor'] != sec else ''
        out.append(d)
    return out


KIND_H = [('fact', 'The record, and claims tested against it'), ('connection', 'Connections'), ('method', 'Method'), ('question', 'Open questions')]
TIER_CLS = {'documented': 't-doc', 'attributed': 't-att', 'testimony': 't-att', 'contested': 't-hyp', 'open': 't-hyp',
            'unsupported': 't-null', 'not established': 't-null', 'rule': ''}


def build_page(built):
    """/card: the card itself, and every card as plain text for readers without script and for search."""
    spec = importlib.util.spec_from_file_location('bsp_pages', ROOT / 'scripts' / 'build-start-pages.py')
    sp = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(sp)
    e = html.escape
    parts = ['<p class="kicker">From the record</p>',
             '<h1>One card</h1>',
             '<p class="lede">One question, and the line from the report that answers it: its tier, and the passage it '
             'comes from. A card may say less than the report, never more. Every line is checked word for word against '
             'the page at each build, and the build stops if the page no longer says it. The day&rsquo;s card is the same '
             'for every reader.</p>',
             '<div data-b0b-card data-url-sync data-link-base="/report"></div>',
             '<h2 id="all">All %d cards</h2>' % len(built)]
    for kind, label in KIND_H:
        group = [c for c in built if c['type'] == kind]
        if not group:
            continue
        parts.append('<h2>%s <span class="tag">%d</span></h2>' % (label, len(group)))
        parts.append('<ul class="items">')
        for c in group:
            cls = TIER_CLS.get(c['tier'], '')
            where = 'Section %s%s' % (c['section'], (' · ' + c['subsection']) if c['subsection'] else '')
            parts.append('<li id="c-%s"><a href="/card?c=%s"><b>%s</b></a><br>%s%s'
                         '<a class="src" href="/report#%s">%s &rarr;</a></li>'
                         % (c['id'], c['id'], e(c['prompt']),
                            '<span class="tier %s">%s</span>' % (cls, e(c['tier'])),
                            e(c['quote']), c['anchor'], e(where)))
        parts.append('</ul>')
    parts.append('<script src="/card.js?v=3" defer></script>')
    head = '\n  <link rel="stylesheet" href="/card.css?v=3">'
    return sp.page('b0b.dev - one card from the record', '\n'.join(parts), head_extra=head)


def main():
    report = REPORT.read_text(encoding='utf-8')
    idx = blocks(report)
    if '--list' in sys.argv:
        want = sys.argv[sys.argv.index('--list') + 1]
        for k, v in idx.items():
            if v[0] == want and k != want:
                print(f'{k}\t{len(v[3])}\t{v[2][:90]}')
        return
    if '--dump' in sys.argv:
        a = sys.argv[sys.argv.index('--dump') + 1]
        h3 = re.search(r'<h[23]\b[^>]*\bid="%s"' % re.escape(a), report)
        nxt = re.compile(r'<h[23]\b[^>]*\bid=').search(report, h3.end())
        print(re.sub(r'\s+', ' ', bsp.text_of(report[h3.start():nxt.start() if nxt else len(report)])).strip())
        return
    src = Path(sys.argv[sys.argv.index('--src') + 1]) if '--src' in sys.argv else SRC
    cards = json.loads(src.read_text(encoding='utf-8'))['cards']

    if '--selftest' in sys.argv:
        good = next(c for c in cards if c['type'] == 'connection')
        planted = [dict(cards[0], id='zz-misquote', quote=cards[0]['quote'] + ' and nothing else was ever done'),
                   dict(cards[0], id='zz-anchor', anchor='no-such-subsection'),
                   dict(good, id='zz-between', between=[good['between'][0], 'Nobody In The Quote'])]
        errs = check(planted, idx)
        caught = {e.split(':')[0] for e in errs}
        ok = caught == {'zz-misquote', 'zz-anchor', 'zz-between'}
        print('selftest:', 'PASS' if ok else 'FAIL', '-', '; '.join(errs))
        sys.exit(0 if ok else 1)

    errs = check(cards, idx)
    if errs:
        print('\n'.join(errs))
        print(f'FAIL: {len(errs)} problem(s); nothing written')
        sys.exit(1)
    print(f'{len(cards)} cards, every quote found in its own subsection')
    if '--check' in sys.argv:
        return
    built = build(cards, idx)
    by = {}
    for c in built:
        by[c['type']] = by.get(c['type'], 0) + 1
    payload = {'generated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
               'count': len(built), 'by_type': by, 'cards': built}
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    PAGE.write_text(build_page(built), encoding='utf-8')
    print('wrote', OUT.relative_to(ROOT), 'and', PAGE.relative_to(ROOT), by)


if __name__ == '__main__':
    main()
