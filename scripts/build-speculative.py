#!/usr/bin/env python3
"""The SPECULATIVE skin: build site/data/speculative.json from scripts/speculative/reach-*.md.

Each numbered section of the report gets one reach: its leads taken at full strength to the
conclusion they point at. The reach is speculative by design, and the skin says so; what does
not relax is the rest of CLAUDE.md §2. This script stops on anything it can check by machine:

  - one reach per <h2 id> section, no more, no fewer;
  - every "Reaches from" anchor is a subsection of that same section;
  - every quotation in the reach, and every FACT_CHECK line, is found word for word in that
    section's text (so a reach invents no fact and outlives no correction);
  - the body uses only <p>, <em> and <strong>;
  - lengths; and a list of words the report has killed or never prints.

What it cannot check (the living-person floor, tropes in other words) is read by a person
before each deploy. Nothing is written unless every reach passes.

    python3 scripts/build-speculative.py             build
    python3 scripts/build-speculative.py --check     check only
    python3 scripts/build-speculative.py --partial   allow sections without a reach (drafting)
    python3 scripts/build-speculative.py --selftest  plant a banned word, a misquote and a
                                                     foreign anchor; all three must be caught
"""
import importlib.util, json, re, sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'scripts' / 'speculative'
OUT = ROOT / 'site' / 'data' / 'speculative.json'
REPORT = ROOT / 'site' / 'report.html'

_spec = importlib.util.spec_from_file_location('bc', ROOT / 'scripts' / 'build-cards.py')
bc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(bc)
bsp = bc.bsp

FIELDS = ['ID', 'HEADLINE', 'BODY', 'PROVE', 'KILL', 'DRAWS_ON', 'LIVING_NAMES', 'FACT_CHECK']
BANNER = ('Each section now opens with a reach: its leads taken past the documents, to the conclusion '
          'they point at. The documented report below is unchanged. ')

# Killed tropes, never-publish names and words §2 bars, matched on whole words, case-insensitive.
BANNED = [
    (r'\boldfield\b', 'never-publish name (§2)'),
    (r'\bcrown', '"crown" (§2)'),
    (r'\brothschild', 'families trope (killed)'),
    (r'\bkhazar', 'trope (killed)'),
    (r'\bbloodline', 'bloodline trope (killed)'),
    (r'\bthe families\b', 'families trope (killed)'),
    (r'\bprotocols of\b', 'trope (killed)'),
    (r'\breptilian', 'trope (killed)'),
    (r'\bthe institut(e|ion)\b', 'b0b.dev is never "the Institution" (§2)'),
    (r'\bsator\b', 'removed and not to be re-added'),
    (r'\bpoint nemo\b', 'removed and not to be re-added'),
    (r'\bnumerolog', 'no numerology (§2)'),
    (r'\bthe cia already has it\b', '§2'),
    (r'—', 'em dash; use " - "'),
]
HOUSE_NO = re.compile(r'\b\d{1,5}\s+[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\s(?:Street|St|Avenue|Ave|Road|Rd|Way|Drive|Dr|Lane|Boulevard|Blvd|Place)\b')
QUOTE = re.compile(r'[“"]([^”"]{12,})[”"]')


def parse(text):
    out, key = {}, None
    for line in text.splitlines():
        m = re.match(r'^(%s):\s?(.*)$' % '|'.join(FIELDS), line)
        if m:
            key = m.group(1)
            out[key] = m.group(2)
        elif key:
            out[key] += '\n' + line
    return {k: v.strip() for k, v in out.items()}


def load(src_dir):
    reaches = []
    for f in sorted(src_dir.glob('reach-*.md')):
        r = parse(f.read_text(encoding='utf-8'))
        r['_file'] = f.name
        reaches.append(r)
    return reaches


def check(reaches, report, partial=False):
    idx = bc.blocks(report)
    sections = [m.group(1) for m in re.finditer(r'<h2 id="([IVXL]+)"', report)]
    errs, seen = [], set()
    for r in reaches:
        rid, where = r.get('ID', '?'), r.get('_file', '?')
        for k in FIELDS:
            if not r.get(k):
                errs.append(f'{where}: missing {k}')
        if rid not in sections:
            errs.append(f'{where}: {rid!r} is not a section of the report')
            continue
        if rid in seen:
            errs.append(f'{where}: second reach for section {rid}')
        seen.add(rid)
        sec_text = idx[rid][3]
        head, body = r.get('HEADLINE', ''), r.get('BODY', '')
        shown = ' '.join([head, body, r.get('PROVE', ''), r.get('KILL', '')])
        if len(head.split()) > 22:
            errs.append(f'{where}: headline {len(head.split())} words (22 max)')
        words = len(bc.strip_tags(body).split())
        if not 110 <= words <= 340:
            errs.append(f'{where}: body {words} words (110-340)')
        tags = set(re.findall(r'</?\s*([a-zA-Z0-9]+)', body))
        if tags - {'p', 'em', 'strong'}:
            errs.append(f'{where}: tags not allowed: {sorted(tags - {"p", "em", "strong"})}')
        if not body.lstrip().startswith('<p>'):
            errs.append(f'{where}: body must be <p> paragraphs')
        plain = bc.strip_tags(shown)
        for pat, why in BANNED:
            if re.search(pat, plain, re.I):
                errs.append(f'{where}: {why}: /{pat}/')
        if HOUSE_NO.search(plain):
            errs.append(f'{where}: looks like a house number: {HOUSE_NO.search(plain).group(0)!r}')
        for q in QUOTE.findall(plain):
            if not bsp.found_in(q, sec_text):
                errs.append(f'{where}: quotation not found in Section {rid}: "{q[:70]}"')
        for line in r.get('FACT_CHECK', '').splitlines():
            line = line.strip()
            if not line.startswith('- '):
                continue
            phrase = line[2:].strip().strip('"“”')
            if phrase and not bsp.found_in(phrase, sec_text):
                errs.append(f'{where}: FACT_CHECK phrase not in Section {rid}: "{phrase[:70]}"')
        for a in [x.strip() for x in r.get('DRAWS_ON', '').split(',') if x.strip()]:
            if a not in idx or idx[a][0] != rid or a == rid:
                errs.append(f'{where}: "{a}" is not a subsection of Section {rid}')
    if not partial:
        for s in sections:
            if s not in seen:
                errs.append(f'no reach for Section {s}')
    return errs, idx


def build(reaches, idx):
    out = []
    order = {k: i for i, k in enumerate(re.findall(r'<h2 id="([IVXL]+)"', REPORT.read_text(encoding='utf-8')))}
    for r in sorted(reaches, key=lambda r: order[r['ID']]):
        draws = [a.strip() for a in r['DRAWS_ON'].split(',') if a.strip()]
        out.append({
            'id': r['ID'],
            'section_title': idx[r['ID']][1],
            'headline': r['HEADLINE'],
            'body': re.sub(r'\s*\n\s*', ' ', r['BODY']).strip(),
            'prove': r['PROVE'],
            'kill': r['KILL'],
            'draws_on': [{'anchor': a, 'title': idx[a][2]} for a in draws],
        })
    return {
        'generated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'skin': 'speculative',
        'banner': BANNER,
        'rule': ('Speculative by design: each reach takes its section\'s leads past the documents. '
                 'Every name, date, figure and quotation in it is already in that section; the reach '
                 'adds inference, never facts. No living, uncharged person is named in it as a '
                 'criminal or an asset.'),
        'reaches': out,
    }


def selftest(report):
    good = load(SRC)
    if not good:
        sys.exit('selftest: no reaches in scripts/speculative/ to plant into')
    base = dict(good[0])
    sid = base['ID']
    other = next(s for s in re.findall(r'<h3 id="([^"]+)"', report)
                 if bc.blocks(report)[s][0] != sid)
    planted = [
        ('banned', dict(base, BODY=base['BODY'].replace('<p>', '<p>The bloodline holds. ', 1))),
        ('misquote', dict(base, BODY=base['BODY'].replace('<p>', '<p>“this sentence is in no section of the report at all” ', 1))),
        ('anchor', dict(base, DRAWS_ON=other)),
    ]
    caught = []
    for name, r in planted:
        errs, _ = check([r], report, partial=True)
        caught.append((name, bool(errs), errs[:1]))
    ok = all(c for _, c, _ in caught)
    print('selftest:', 'PASS' if ok else 'FAIL', '-', '; '.join(f'{n}: {"caught" if c else "MISSED"}' for n, c, _ in caught))
    sys.exit(0 if ok else 1)


def main():
    report = REPORT.read_text(encoding='utf-8')
    if '--selftest' in sys.argv:
        selftest(report)
    reaches = load(SRC)
    errs, idx = check(reaches, report, partial='--partial' in sys.argv)
    if errs:
        print('\n'.join(errs))
        sys.exit(f'build-speculative: {len(errs)} problem(s); nothing written')
    print(f'{len(reaches)} reaches, every quotation and fact line found in its own section')
    if '--check' in sys.argv:
        return
    data = build(reaches, idx)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'wrote {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
