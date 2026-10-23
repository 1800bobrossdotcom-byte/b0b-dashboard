#!/usr/bin/env python3
"""Check every quoted phrase in a draft HTML fragment against the spider cache.

  vqdraft.py DRAFT.html [--since 2026-09-25]

Extracts each <em>&ldquo;...&rdquo;</em> (and bare &ldquo;...&rdquo;) span, normalises it as vq.py does, and
searches every ledgered body fetched since the given date. Prints OK + the matching hosts, or MISS.
Attribution (which outlet the draft names) is checked by reading the host list, not by this script.
"""
import html, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vq

draft = open(sys.argv[1]).read()
since = sys.argv[sys.argv.index('--since') + 1] if '--since' in sys.argv else '2026-09-25'

rows = vq.latest()
recs = {}
for url, r in rows.items():
    if r.get('cache') and r.get('ok', True) and (r.get('fetched_at') or '') >= since:
        if os.path.exists(os.path.join(vq.ROOT, r['cache'])):
            recs[r['cache']] = r
texts = []
for r in recs.values():
    try:
        texts.append((r.get('final_url') or r['url'], vq.text_of(r)))
    except Exception as e:
        pass

quotes = re.findall(r'&ldquo;(.*?)&rdquo;', draft, re.S)
bad = 0
for q in quotes:
    plain = html.unescape(re.sub(r'<[^>]+>', '', q))
    nq = vq.norm(plain)
    if len(nq.split()) < 2:
        continue
    hits = [u for u, t in texts if nq in t]
    if hits:
        hosts = sorted({re.sub(r'^https?://(www\.)?', '', u).split('/')[0] for u in hits})
        print('OK   %-60.60s  %s' % (nq, ', '.join(hosts[:4])))
    else:
        bad += 1
        ci = [u for u, t in texts if nq.lower() in t.lower()]
        print('%s %s' % ('CASE' if ci else 'MISS', nq))
print('quotes checked %d, failing %d' % (len(quotes), bad))
