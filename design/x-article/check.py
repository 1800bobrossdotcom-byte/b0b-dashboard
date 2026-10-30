#!/usr/bin/env python3
"""Check an X-article draft against the report.

Every "double-quoted" string in the draft must appear word for word in the documented report
(site/report.html) or in a published speculative reach (site/data/speculative.json). Curly and
straight quotes are treated alike; a trailing . , ? or ! inside the quote is ignored.

Also flags words the report never uses about itself or its subjects (see BANNED).

usage: python3 design/x-article/check.py design/x-article/part-*.md
"""
import html, json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
BANNED = [r'\bthe institution\b', r'\bthe institute\b', r'\bcrown\b', r'\bbloodline', r'\bdynast',
          r'Stewart Oldfield', r'\bOldfield\b']


def norm(x):
    x = html.unescape(x)
    for a, b in (('’', "'"), ('‘', "'"), ('“', '"'), ('”', '"'), ('–', '-'),
                 ('—', '-'), (' ', ' ')):
        x = x.replace(a, b)
    return re.sub(r'\s+', ' ', x)


def corpus():
    s = (ROOT / 'site/report.html').read_text(encoding='utf-8')
    s = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', s, flags=re.S)
    page = norm(re.sub(r'<[^>]+>', ' ', s))
    sp = json.loads((ROOT / 'site/data/speculative.json').read_text(encoding='utf-8'))
    reach = norm(re.sub(r'<[^>]+>', ' ', json.dumps(sp, ensure_ascii=False)))
    return page, reach


def main(paths):
    page, reach = corpus()
    total_bad = 0
    for p in paths:
        a = norm(pathlib.Path(p).read_text(encoding='utf-8'))
        quotes = re.findall(r'"([^"]{3,})"', a)
        bad = []
        for q in quotes:
            q2 = q.strip().rstrip('.,?!').strip()
            if q2 not in page and q2 not in reach:
                bad.append(q)
        flags = [b for b in BANNED if re.search(b, a, re.I)]
        words = len(re.findall(r"[\w'-]+", a))
        print(f'{p}: {words} words, {len(quotes)} quotes, {len(bad)} not found, banned {flags or "none"}')
        for q in bad:
            print('   MISS |', q[:140])
        total_bad += len(bad) + len(flags)
    sys.exit(1 if total_bad else 0)


if __name__ == '__main__':
    main(sys.argv[1:])
