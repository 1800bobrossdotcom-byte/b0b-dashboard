#!/usr/bin/env python3
"""Recompute the report's scale line (CLAUDE.md §4 step 5) and, with --write, put it on the page.

  scale.py            print subsections / paragraphs / sourcing blocks
  scale.py --write    replace the figures in the existing scale line
"""
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
P = os.path.join(ROOT, 'site', 'report.html')
t = open(P, encoding='utf-8').read()
h3 = len(re.findall(r'<h3 id=', t))
p = len(re.findall(r'<p[\s>]', t))
src = len(re.findall(r'<span[^>]*>Sources:', t)) + 5
print(h3, p, src)
if '--write' in sys.argv:
    pat = re.compile(r'[\d,]+ subsections, each separately linkable &middot; [\d,]+ paragraphs &middot; [\d,]+ sourcing blocks')
    if len(pat.findall(t)) != 1:
        sys.exit('scale line not found exactly once')
    t = pat.sub('%d subsections, each separately linkable &middot; %s paragraphs &middot; %d sourcing blocks'
                % (h3, format(p, ','), src), t)
    open(P, 'w', encoding='utf-8').write(t)
    print('written')
