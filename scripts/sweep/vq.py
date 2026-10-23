#!/usr/bin/env python3
"""Verify quotes against the spider cache.

  vq.py URL "quote"            one check
  vq.py --batch pairs.jsonl    {"url":..., "q":...} per line

A quote passes only if it occurs in the cached body of the URL's latest ledgered fetch, after
normalising whitespace, curly quotes, dashes and zero-width characters (syndicated copies embed them).
Case is kept: a quote that only matches case-insensitively is reported as CASE, not OK.
"""
import html, json, os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
LEDGER = os.path.join(ROOT, 'research/sources/ledger.jsonl')


def latest():
    rows = {}
    for line in open(LEDGER):
        try:
            r = json.loads(line)
        except ValueError:
            continue
        for k in (r.get('url'), r.get('final_url')):
            if k:
                rows[k] = r
    return rows


def norm(s):
    s = re.sub('[​‌‍⁠﻿­]', '', s)
    s = s.replace('‘', "'").replace('’', "'").replace('“', '"').replace('”', '"')
    s = re.sub('[‐-―−]', '-', s)
    s = s.replace(' ', ' ')
    return re.sub(r'\s+', ' ', s).strip()


_cache = {}


def text_of(rec):
    path = os.path.join(ROOT, rec['cache'])
    if path in _cache:
        return _cache[path]
    body = open(path, 'rb').read()
    if body[:5] == b'%PDF-' or 'pdf' in (rec.get('content_type') or ''):
        import types
        sys.modules.setdefault('cryptography', types.ModuleType('cryptography'))  # container's build panics on import
        import pypdf
        s = '\n'.join((p.extract_text() or '') for p in pypdf.PdfReader(path).pages)
        s = re.sub(r'-\n\s*', '', s)            # rejoin hyphenated line breaks
    else:
        s = body.decode('utf-8', 'replace')
        s = re.sub(r'<(script|style)\b.*?</\1>', ' ', s, flags=re.S | re.I)
        s = re.sub(r'<[^>]+>', ' ', s)
        s = html.unescape(s)
    _cache[path] = norm(s)
    return _cache[path]


def check(rows, url, q):
    rec = rows.get(url)
    if not rec or not rec.get('cache'):
        return 'NOCACHE'
    if not rec.get('ok', True):
        return 'NULL(' + str(rec.get('reason')) + ')'
    t, nq = text_of(rec), norm(q)
    if nq in t:
        return 'OK'
    if nq.lower() in t.lower():
        return 'CASE'
    # partial: longest run of words found
    w = nq.split()
    best = 0
    for i in range(len(w)):
        for j in range(len(w), i + best, -1):
            if ' '.join(w[i:j]) in t:
                best = max(best, j - i)
                break
    return 'MISS(%d/%d words contiguous)' % (best, len(w))


def main():
    rows = latest()
    if sys.argv[1] == '--batch':
        bad = 0
        for line in open(sys.argv[2]):
            if not line.strip():
                continue
            d = json.loads(line)
            r = check(rows, d['url'], d['q'])
            bad += r != 'OK'
            print('%-28s %s | %s' % (r, d['q'][:90], d['url'][:90]))
        print('\n%d checked, %d not OK' % (sum(1 for l in open(sys.argv[2]) if l.strip()), bad))
    else:
        print(check(rows, sys.argv[1], sys.argv[2]))


if __name__ == '__main__':
    main()
