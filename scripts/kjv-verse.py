#!/usr/bin/env python3
"""Verse lookup against the Gutenberg #10 KJV in the source cache.

The file opens with a table of contents that repeats every book title, so a
naive title search lands in the TOC and the book ranges collapse.  Here the
TOC is read first (it gives the order), and each title's *body* occurrence is
the first match after the TOC ends.
"""
import json, os, re, sys
F = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'research', 'sources', 'cache', '02', '0204adaed1f25700aa854218cae63c7172228c41088f335e99167a071eed83c0')
lines = open(F, encoding='utf-8').read().split('\n')
start = next(i for i, l in enumerate(lines) if l.startswith('*** START'))
end = next(i for i, l in enumerate(lines) if l.startswith('*** END'))
# TOC: the run of non-blank title lines after START until the first body title repeats
toc = []
i = start + 1
while i < end:
    l = lines[i].strip()
    if l:
        if l in toc:
            break
        toc.append(l)
    i += 1
body_first = i  # first body title
toc = [t for t in toc if 'Testament' not in t]
assert len(toc) == 66, len(toc)
ALIAS = {
 'Genesis':'The First Book of Moses: Called Genesis','Exodus':'The Second Book of Moses: Called Exodus',
 'Leviticus':'The Third Book of Moses: Called Leviticus','Numbers':'The Fourth Book of Moses: Called Numbers',
 'Deuteronomy':'The Fifth Book of Moses: Called Deuteronomy','Joshua':'The Book of Joshua','Judges':'The Book of Judges',
 '1 Samuel':'The First Book of Samuel','2 Samuel':'The Second Book of Samuel','1 Kings':'The First Book of the Kings',
 '2 Kings':'The Second Book of the Kings','Job':'The Book of Job','Psalms':'The Book of Psalms','Psalm':'The Book of Psalms',
 'Proverbs':'The Proverbs','Ecclesiastes':'Ecclesiastes','Isaiah':'The Book of the Prophet Isaiah',
 'Jeremiah':'The Book of the Prophet Jeremiah','Ezekiel':'The Book of the Prophet Ezekiel','Daniel':'The Book of Daniel',
 'Hosea':'Hosea','Amos':'Amos','Micah':'Micah','Habakkuk':'Habakkuk','Zechariah':'Zechariah','Malachi':'Malachi',
 'Matthew':'The Gospel According to Saint Matthew','Mark':'The Gospel According to Saint Mark',
 'Luke':'The Gospel According to Saint Luke','John':'The Gospel According to Saint John','Acts':'The Acts of the Apostles',
 'Romans':'The Epistle of Paul the Apostle to the Romans','1 Corinthians':'The First Epistle of Paul the Apostle to the Corinthians',
 '2 Corinthians':'The Second Epistle of Paul the Apostle to the Corinthians','Galatians':'The Epistle of Paul the Apostle to the Galatians',
 'Ephesians':'The Epistle of Paul the Apostle to the Ephesians','1 Thessalonians':'The First Epistle of Paul the Apostle to the Thessalonians',
 '1 Timothy':'The First Epistle of Paul the Apostle to Timothy','Hebrews':'The Epistle of Paul the Apostle to the Hebrews',
 'James':'The General Epistle of James','1 Peter':'The First Epistle General of Peter','1 John':'The First Epistle General of John',
 'Revelation':'The Revelation of Saint John the Divine',
}
# body ranges
pos = {}
j = body_first
for t in toc:
    while lines[j].strip() != t:
        j += 1
    pos[t] = j
    j += 1
order = toc
rng = {t: (pos[t], pos[order[k+1]] if k+1 < len(order) else end) for k, t in enumerate(order)}

def verses(book):
    t = ALIAS.get(book, book)
    if t not in rng:
        raise KeyError(book)
    a, b = rng[t]
    text = ' '.join(l.strip() for l in lines[a+1:b])
    out = {}
    ms = list(re.finditer(r'(?<![\d:])(\d+):(\d+)\s', text))
    for k, m in enumerate(ms):
        nxt = ms[k+1].start() if k+1 < len(ms) else len(text)
        out[(int(m.group(1)), int(m.group(2)))] = re.sub(r'\s+', ' ', text[m.end():nxt]).strip()
    return out

def get(ref):
    m = re.match(r'^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$', ref.strip())
    book, ch, v1, v2 = m.group(1), int(m.group(2)), int(m.group(3)), int(m.group(4) or m.group(3))
    vv = verses(book)
    return ' '.join('%d %s' % (v, vv[(ch, v)]) for v in range(v1, v2+1))

if __name__ == '__main__':
    refs = sys.argv[1:] or [l.strip() for l in sys.stdin if l.strip()]
    res = {}
    for r in refs:
        try:
            res[r] = get(r)
        except Exception as e:
            res[r] = 'ERROR %r' % e
    for r in refs:
        print('%s\n    %s\n' % (r, res[r]))
    pass
