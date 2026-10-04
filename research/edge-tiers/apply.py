#!/usr/bin/env python3
"""Apply edge-tier verdicts to site/map.html.

connectionLines elements: [[a],[b],'#col','label']  -> [[a],[b],'#col','label',T]
tunnelPaths / animalNetPaths: {path:..., color:..., label:'...'} -> {..., label:'...', tier:T}
Verdict ids: cN / tN / aN = index within each array.
"""
import glob, json, re, sys

MAP = '/home/user/b0b-dashboard/site/map.html'
D = '/tmp/claude-0/-home-user/9915310d-9125-5a6d-9896-9cfd05323aa5/scratchpad/edges'

verd = {}
for f in sorted(glob.glob(D + '/e*-verdicts.jsonl')):
    for line in open(f, encoding='utf-8'):
        line = line.strip()
        if not line:
            continue
        v = json.loads(line)
        verd[v['id']] = v


def element_spans(text, opener):
    """Return (block_start, [ (start,end) of each depth-1 element ]) for a JS array literal."""
    i = text.index(opener) + len(opener) - 1  # at '['
    depth = 0
    in_str = None
    esc = False
    j = i
    spans = []
    cur = None
    while True:
        c = text[j]
        if in_str:
            if esc:
                esc = False
            elif c == '\\':
                esc = True
            elif c == in_str:
                in_str = None
            j += 1
            continue
        if c == '/' and text[j + 1] == '/':
            j = text.index('\n', j)
            continue
        if c in '"\'':
            in_str = c
        elif c in '[{':
            depth += 1
            if depth == 2:
                cur = j
        elif c in ']}':
            if depth == 2:
                spans.append((cur, j + 1))
            depth -= 1
            if depth == 0:
                return spans
        j += 1


def js_str(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


def label_span(el):
    """Find the label string literal inside an element text: last string in array form, or label:'...' in object form."""
    m = re.search(r"label:\s*(['\"])", el)
    if m:
        q = m.group(1)
        st = m.end() - 1
    else:
        # array form: the 4th element - the last quoted string
        idxs = [mm.start() for mm in re.finditer(r"(?<!\\)(['\"])", el)]
        # walk strings properly
        st = None
        k = 0
        strs = []
        while k < len(el):
            ch = el[k]
            if ch in '"\'':
                q = ch
                e = k + 1
                while el[e] != q:
                    e += 2 if el[e] == '\\' else 1
                strs.append((k, e + 1))
                k = e + 1
                continue
            k += 1
        return strs[-1]
    e = st + 1
    while el[e] != q:
        e += 2 if el[e] == '\\' else 1
    return (st, e + 1)


def main(write):
    text = open(MAP, encoding='utf-8').read()
    stats = {'tiered': 0, 'relabel': 0, 'delete': 0, 'missing': []}
    for opener, prefix in (('var animalNetPaths = [', 'a'), ('var tunnelPaths = [', 't'), ('var connectionLines = [', 'c')):
        spans = element_spans(text, opener)
        # rewrite from the end so offsets stay valid
        for idx in range(len(spans) - 1, -1, -1):
            vid = prefix + str(idx)
            v = verd.get(vid)
            if not v:
                stats['missing'].append(vid)
                continue
            s0, s1 = spans[idx]
            el = text[s0:s1]
            if v.get('delete'):
                # remove the element plus its trailing comma and the line
                ls = text.rfind('\n', 0, s0) + 1
                le = text.index('\n', s1) + 1
                text = text[:ls] + text[le:]
                stats['delete'] += 1
                continue
            tier = int(v['tier'])
            new = el
            if v.get('label'):
                a, b = label_span(new)
                new = new[:a] + js_str(v['label']) + new[b:]
                stats['relabel'] += 1
            if prefix == 'c':
                new = new[:-1] + ',' + str(tier) + ']'
            else:
                new = new[:-1].rstrip() + ', tier:' + str(tier) + '}'
            text = text[:s0] + new + text[s1:]
            stats['tiered'] += 1
    print(json.dumps(stats))
    if write:
        open(MAP, 'w', encoding='utf-8').write(text)


if __name__ == '__main__':
    main('--write' in sys.argv)
