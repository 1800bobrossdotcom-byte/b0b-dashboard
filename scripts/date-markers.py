#!/usr/bin/env python3
"""Derive `date` / `dprec` for every marker in site/map.html from its own text.

    python3 scripts/date-markers.py            # report what would change
    python3 scripts/date-markers.py --write    # rewrite the fields in place

A marker's date is the date of the thing the marker is about - an event, a
founding, an opening - as precisely as its own text states it. The rules, in
order, because the first version of this got 336 of 820 wrong by taking the
earliest year on the line:

  1. A full date anywhere in the text wins: 8/1/2026, 2019-08-10, 10 July 2003,
     July 10, 2003. Then a month + year. Precision follows the form.
  2. Otherwise the year in the NAME, if there is one ("Tehran - 1953 Operation
     Ajax" is about 1953 whatever else the paragraph mentions).
  3. Otherwise the first year in the context, skipping:
       - the "Source:" tail and any URL, which carry dataset spans and article
         dates ("Mother Jones mass-shootings dataset (1982-2026)");
       - a coverage range whose end is the present ("(2022-present)",
         "(1982-2026)") - its start is kept as a candidate, its end is not;
       - a year that only says how far back a thing goes ("since 1945",
         "as early as 1870", "founded in 1929") is DEMOTED: used only when
         nothing better exists, because "Ukraine war ... since 1945" is 2022.
  4. Years below 1500 or above the current year are never used; "Vision 2030"
     and friends are targets, not dates.

Nothing is invented: a marker whose text carries no usable date gets none.
"""
import datetime
import importlib.util
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP = os.path.join(ROOT, 'site', 'map.html')
YEAR_MAX = datetime.date.today().year
MONTHS = 'jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec'
MON = {m: i for i, m in enumerate(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'], 1)}
Y = r'(?<![\d/])(1[5-9]\d\d|20\d\d)(?![\d/])'
# Comparative anchors only. "Founded 1950", "opened 1855", "built 1704" ARE the
# thing's date and stay first-class; "since 1945" and "as early as 1870" are
# not, and are used only when nothing better exists.
DEMOTE = re.compile(r'\b(since|until|till|before|after|as early as|dating (?:back )?to|back to|by|circa|c\.)\s+$', re.I)
# Retrieval and as-of dates say when a source was read, not when anything
# happened. They are removed before any date is looked for.
ACCESSED = re.compile(r'\b(accessed|retrieved|checked|verified|last updated|updated|added|corrected|tense corrected|qualified|revised|read|extracted(?: directly)?,?|as of|as at|data as of|via [^.;]*?)\s*:?\s*(?:on\s+)?'
                      r'(\d{1,2}\s+[A-Za-z]{3,9}\.?,?\s+\d{4}|[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}/\d{1,2}/\d{2,4}|[A-Za-z]{3,9}\s+\d{4}|\d{4})', re.I)
TARGET = re.compile(r'\b(vision|agenda|horizon|goal|target|plan|net[- ]zero|by)\s+$', re.I)


def mon(s):
    return MON[s.lower()[:3]]


def full_dates(t):
    """Yield (year, month, day, precision, position) for every explicit date form."""
    for m in re.finditer(r'(?<!\d)(\d{1,2})/(\d{1,2})/(\d{4}|\d{2})(?!\d)', t):      # 8/1/2026, 8/1/26
        mo, d, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if y < 100:
            y += 1900 if y > 30 else 2000
        if 1 <= mo <= 12 and 1 <= d <= 31:
            yield y, mo, d, 'day', m.start()
    for m in re.finditer(r'(?<!\d)(1[5-9]\d\d|20\d\d)-(\d{2})-(\d{2})(?!\d)', t):    # 2019-08-10
        yield int(m.group(1)), int(m.group(2)), int(m.group(3)), 'day', m.start()
    for m in re.finditer(r'(?<!\d)(\d{1,2})\s+(%s)[a-z]*\.?,?\s+(1[5-9]\d\d|20\d\d)' % MONTHS, t, re.I):   # 10 July 2003
        yield int(m.group(3)), mon(m.group(2)), int(m.group(1)), 'day', m.start()
    for m in re.finditer(r'\b(%s)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(1[5-9]\d\d|20\d\d)' % MONTHS, t, re.I):  # July 10, 2003
        yield int(m.group(3)), mon(m.group(1)), int(m.group(2)), 'day', m.start()
    for m in re.finditer(r'\b(%s)[a-z]*\.?,?\s+(1[5-9]\d\d|20\d\d)(?!\d)' % MONTHS, t, re.I):   # July 2003
        yield int(m.group(2)), mon(m.group(1)), 1, 'month', m.start()


def strip_noise(ctx):
    ctx = re.split(r'\bSources?:', ctx, 1)[0]
    ctx = re.sub(r'https?://\S+', ' ', ctx)
    ctx = ACCESSED.sub(' ', ctx)
    ctx = re.sub(r'\((?:accessed|retrieved)[^)]*\)', ' ', ctx, flags=re.I)
    ctx = re.sub(r'^\s*(?:TENSE )?(?:ADDED|CORRECTED|QUALIFIED|UPDATED|REVISED|FOIA-SOURCED)\b[^.;\u2014-]*', ' ', ctx, flags=re.I)
    # a coverage range ending at the present: keep the start, drop the end
    ctx = re.sub(r'\((1[5-9]\d\d|20\d\d)\s*[-–]\s*(?:present|20[2-9]\d)\)', r'(\1)', ctx)
    ctx = re.sub(r'(1[5-9]\d\d|20\d\d)\s*[-–]\s*present\b', r'\1', ctx)
    return ctx


def year_candidates(t):
    good, demoted = [], []
    for m in re.finditer(Y, t):
        y = int(m.group(1))
        if y < 1500 or y > YEAR_MAX:
            continue
        before = t[max(0, m.start() - 24):m.start()]
        if TARGET.search(before):
            continue
        (demoted if DEMOTE.search(before) else good).append(y)
    return good, demoted


def derive(loc):
    name, ctx = loc['name'], strip_noise(loc['ctx'])
    text = name + ' . ' + ctx
    fd = [x for x in full_dates(text) if 1500 <= x[0] <= YEAR_MAX]
    if fd:
        fd.sort(key=lambda x: (0 if x[3] == 'day' else 1, x[4]))       # most precise, then earliest position
        y, mo, d, p, _ = fd[0]
        return ('%04d-%02d-%02d' % (y, mo, d), 'day') if p == 'day' else ('%04d-%02d' % (y, mo), 'month')
    g, dm = year_candidates(name)
    if g or dm:
        return '%04d' % (g or dm)[0], 'year'
    g, dm = year_candidates(ctx)
    if g:
        return '%04d' % g[0], 'year'
    if dm:
        return '%04d' % dm[0], 'year'
    return None, None


def main():
    write = '--write' in sys.argv
    spec = importlib.util.spec_from_file_location('bk', os.path.join(ROOT, 'scripts', 'build-kml.py'))
    bk = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(bk)
    s = open(MAP, encoding='utf-8').read()
    locs = bk.js_to_json(bk.extract_block(s, 'var locations = ['))
    changed, added, removed, same = [], 0, 0, 0
    for l in locs:
        nd, npz = derive(l)
        od = l.get('date')
        if nd == od:
            same += 1
        elif nd and od:
            changed.append((l['name'][:56], od, nd))
        elif nd:
            added += 1
        else:
            removed += 1
        l['_nd'], l['_np'] = nd, npz
    dated = sum(1 for l in locs if l['_nd'])
    prec = {p: sum(1 for l in locs if l['_np'] == p) for p in ('day', 'month', 'year')}
    print('markers %d | unchanged %d | changed %d | newly dated %d | undated now %d'
          % (len(locs), same, len(changed), added, removed))
    print('dated %d (%s) | undated %d' % (dated, ', '.join('%s %d' % kv for kv in prec.items()), len(locs) - dated))
    for row in changed[:60]:
        print('  %-56s %-12s -> %s' % row)
    if len(changed) > 60:
        print('  ... %d more' % (len(changed) - 60))
    if not write:
        return
    # Rewrite the two fields per marker, matching on the exact name, which is unique.
    out, hits = s, 0
    for l in locs:
        # The source spells an apostrophe as \' inside its double-quoted strings;
        # the head may not run past an existing date field, or the old one
        # would be kept and a second appended.
        nm = re.escape(l['name'].replace('"', '\\"')).replace("'", r"(?:\\)?'")
        pat = re.compile(r'(\{name:"%s",(?:(?!,date:")[^}])*)(?:,date:"[^"]*",dprec:"[^"]*")?\}' % nm, re.S)
        m = pat.search(out)
        if not m:
            print('  NOT FOUND in source:', l['name'][:60])
            continue
        head = m.group(1)
        if head.count('{name:"') != 1:
            print('  AMBIGUOUS match, skipped:', l['name'][:60])
            continue
        tail = ',date:"%s",dprec:"%s"}' % (l['_nd'], l['_np']) if l['_nd'] else '}'
        out = out[:m.start()] + head + tail + out[m.end():]
        hits += 1
    open(MAP, 'w', encoding='utf-8').write(out)
    print('rewrote %d markers in site/map.html' % hits)


if __name__ == '__main__':
    main()
