#!/usr/bin/env python3
"""Build the monthly summary for the casual reader: design/summary/ -> public/.

    python3 scripts/build-summary-pdf.py           # build the edition named in edition.json
    python3 scripts/build-summary-pdf.py --check   # check the quotes only, write nothing

The words live in design/summary/summary.html, the edition's details and its
"new this month" lines in design/summary/edition.json, and the counts come from
site/data/build.json - so run this after check-consistency.py has written it.

Every <q data-src="report"> must be found in site/report.html, and every
<q data-src="kjv" data-ref="Book c:v[-v]"> in the KJV (scripts/kjv-verse.py),
after typographic normalisation (curly quotes, dashes, case, spacing). One miss
stops the build: the summary may say less than the report, never more.

Part III walks every numbered section of the report once, in order, one
<h3 class="sec"> entry each. A section the report gains, loses or renumbers
stops the build until the summary follows: it covers the whole document.

Writes public/summaries/b0b-dev-summary-<edition>.pdf (the archive copy),
public/b0b-dev-summary.pdf (the latest, which /summary redirects to) and
public/summaries/editions.json. Renders with scripts/render-pdf.js (Chromium).
"""
import base64, hashlib, html, importlib.util, json, os, re, shutil, subprocess, sys, tempfile, types
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUMMARY = os.path.join(ROOT, 'design', 'summary')
TEMPLATE = os.path.join(SUMMARY, 'summary.html')
EDITION = os.path.join(SUMMARY, 'edition.json')
REPORT = os.path.join(ROOT, 'site', 'report.html')
BUILD = os.path.join(ROOT, 'site', 'data', 'build.json')
FONTS = os.path.join(ROOT, 'site', 'fonts')
SEAL = os.path.join(ROOT, 'design', 'projection', 'out', 'seal-thread-2000.png')
QR = os.path.join(ROOT, 'site', 'stickers', 'b0b-dev-qr.svg')
OUT_DIR = os.path.join(ROOT, 'public', 'summaries')
LATEST = os.path.join(ROOT, 'public', 'b0b-dev-summary.pdf')
FONT_OK = ('IBMPlexSerif', 'IBMPlexMono', 'DejaVuSerif')   # anything else in the PDF is a silent fallback
QR_WANT = 'https://www.b0b.dev'
PAGES_OK = range(8, 25)                                     # a 6 x 9 in booklet of 8 to 24 pages

BLOCK = r'p|div|li|ul|ol|h[1-6]|br|td|th|tr|table|blockquote|section|article|nav|header|footer|main|aside|figure|figcaption|details|summary|dt|dd'


def text_of(markup):
    """Visible text: block tags become spaces, inline tags vanish, so a quote can cross a link or an <em>."""
    markup = re.sub(r'<(script|style|noscript)\b.*?</\1>', ' ', markup, flags=re.S | re.I)
    markup = re.sub(r'<!--.*?-->', ' ', markup, flags=re.S)
    markup = re.sub(r'</?(?:%s)\b[^>]*>' % BLOCK, ' ', markup, flags=re.I)
    return html.unescape(re.sub(r'<[^>]+>', '', markup))


TYPO = {0x2018: "'", 0x2019: "'", 0x201A: "'", 0x201B: "'", 0x201C: '"', 0x201D: '"', 0x201E: '"',
        0x00A0: ' ', 0x2009: ' ', 0x202F: ' ', 0x00AD: None, 0x200B: None, 0x200C: None,
        0x200D: None, 0x2060: None, 0xFEFF: None}
for _c in '‐‑‒–—―−':
    TYPO[ord(_c)] = '-'


def norm(t):
    t = html.unescape(t).translate(TYPO)
    t = re.sub(r'\s*-\s*', ' - ', t)            # "a - b", "a-b" and "a – b" compare equal
    t = re.sub(r'\s+([,.;:!?)\]])', r'\1', t)    # tag-stripping leaves "word ," behind
    t = re.sub(r'([(\[])\s+', r'\1', t)
    return re.sub(r'\s+', ' ', t).strip().lower()


def found_in(quote, hay):
    """Each piece of a quote cut with an ellipsis must appear, in order."""
    at = 0
    for piece in re.split(r'\s*(?:…|\.\.\.)\s*', quote):
        piece = norm(piece).strip(' .,;:')
        if not piece:
            continue
        i = hay.find(piece, at)
        if i < 0:
            return False
        at = i + len(piece)
    return True


def load_kjv():
    path = os.path.join(ROOT, 'scripts', 'kjv-verse.py')
    try:
        spec = importlib.util.spec_from_file_location('kjv_verse', path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod
    except FileNotFoundError:
        sys.exit('build-summary-pdf: the KJV cache is cold. Fetch it first:\n'
                 '  python3 scripts/spider/spider.py fetch https://www.gutenberg.org/cache/epub/10/pg10.txt')


def kjv_text(kjv, ref):
    m = re.match(r'^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$', ref.strip())
    if not m:
        raise ValueError('bad data-ref %r' % ref)
    book, ch, v1, v2 = m.group(1), int(m.group(2)), int(m.group(3)), int(m.group(4) or m.group(3))
    vv = kjv.verses(book)
    return ' '.join(vv[(ch, v)] for v in range(v1, v2 + 1))


def check_quotes(template):
    report = norm(text_of(open(REPORT, encoding='utf-8').read()))
    kjv = None
    rows, misses = [], 0
    for m in re.finditer(r'<q\b([^>]*)>(.*?)</q>', template, flags=re.S):
        attrs, inner = m.group(1), text_of(m.group(2))
        src = re.search(r'data-src="([^"]+)"', attrs)
        ref = re.search(r'data-ref="([^"]+)"', attrs)
        src = src.group(1) if src else None
        if src == 'report':
            ok = found_in(inner, report)
        elif src == 'kjv':
            kjv = kjv or load_kjv()
            ok = bool(ref) and found_in(inner, norm(kjv_text(kjv, ref.group(1))))
        else:
            ok = False                                 # every quotation says where it comes from
        rows.append((ok, src or '?', (ref.group(1) if ref else ''), re.sub(r'\s+', ' ', inner)))
        misses += not ok
    # Curly-quoted words outside <q> are not stopped, only shown: they may be the reader's
    # phrasing ("it ended"), but they should be read once by eye.
    body = re.sub(r'<q\b.*?</q>', ' ', template, flags=re.S)
    loose = [html.unescape(x) for x in re.findall(r'&ldquo;(.*?)&rdquo;', body, flags=re.S)]
    return rows, misses, [(x, found_in(x, report)) for x in loose]


def tour_gaps(template, report_html):
    """The report's numbered sections in page order, and the entries Part III gives them."""
    want = re.findall(r'<h2\b[^>]*\bid="([IVXL]+)"', report_html)
    have = re.findall(r'<h3 class="sec"><span class="num">([IVXL]+) &middot;</span>', template)
    return want, have


def section_count(report_html):
    return len(set(re.findall(r'<h2\b[^>]*\bid="([IVXL]+)"', report_html)))


def qr_uri():
    """The site's QR, navy on a thread tile: dark on light, which every phone camera reads."""
    svg = open(QR, encoding='utf-8').read()
    if svg.count('fill="#fff"') != 1 or svg.count('stroke="#000"') != 1:
        sys.exit('build-summary-pdf: %s is not the two-colour QR this script recolours' % QR)
    svg = svg.replace('fill="#fff"', 'fill="#e2e8ec"').replace('stroke="#000"', 'stroke="#131c32"')
    return 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode('utf-8')).decode('ascii')


def qr_reads(pdf_path):
    """Decode the QR off the rendered back cover, at print resolution and at a phone's."""
    try:
        import pymupdf, zxingcpp
        from PIL import Image
    except ImportError as e:
        sys.exit('build-summary-pdf: the QR check needs pymupdf and zxing-cpp (%s)' % e)
    doc = pymupdf.open(pdf_path)
    out = []
    for dpi in (150, 72):
        pix = doc[len(doc) - 1].get_pixmap(dpi=dpi)
        im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        out.append((dpi, [r.text for r in zxingcpp.read_barcodes(im)]))
    return out


def fill(template, ed, build, sections):
    tiers = {int(k): v for k, v in build['edges_by_tier'].items()}
    uri = lambda p: 'file://' + p
    month = '\n'.join('    <li>%s</li>' % html.escape(line, quote=False).replace("'", '’')
                      for line in ed['this_month'])
    values = {
        'FONTS': uri(FONTS), 'SEAL': uri(SEAL), 'QR': qr_uri(),
        'LABEL': ed['label'], 'NUMBER': str(ed['number']), 'NEXT': ed['next'],
        'BUILD': datetime.fromisoformat(build['build'].replace('Z', '+00:00')).strftime('%-d %B %Y'),
        'SECTIONS': str(sections),
        'SUBSECTIONS': '{:,}'.format(build['report_subsections']),
        'SOURCING': '{:,}'.format(build['report_sourcing_blocks']),
        'MARKERS': '{:,}'.format(build['marker_count']),
        'EDGES': '{:,}'.format(build['edge_count']),
        'CORRECTIONS': '{:,}'.format(build['corrections_listed']),
        'WEAK': '{:,}'.format(tiers.get(0, 0) + tiers.get(1, 0)),
        'STRONG': '{:,}'.format(sum(v for k, v in tiers.items() if k >= 3)),
        'THIS_MONTH': month,
    }
    out = re.sub(r'\{\{([A-Z_]+)\}\}', lambda m: values[m.group(1)], template)
    left = re.findall(r'\{\{[^}]*\}\}', out)
    if left:
        sys.exit('build-summary-pdf: unfilled placeholders %s' % left)
    return out


def pypdf():
    # This container's cryptography wheel panics on import, and pypdf imports it eagerly. The
    # summary is never encrypted, so the backend is stubbed (as scripts/sweep/pdftext.py does).
    for name in ['cryptography', 'cryptography.hazmat', 'cryptography.hazmat.primitives',
                 'cryptography.hazmat.primitives.ciphers', 'cryptography.hazmat.primitives.ciphers.algorithms',
                 'cryptography.hazmat.primitives.ciphers.modes', 'cryptography.hazmat.primitives.padding',
                 'cryptography.hazmat.backends', 'cryptography.hazmat.decrepit',
                 'cryptography.hazmat.decrepit.ciphers', 'cryptography.hazmat.decrepit.ciphers.algorithms']:
        sys.modules.setdefault(name, types.ModuleType(name))
    import pypdf as mod
    return mod


def retitle_outline(pp, writer, filled):
    """Chromium titles each bookmark from the heading's laid-out lines and joins them with no
    space ("Andnothing changed."). The headings are in the page, so title the bookmarks from them."""
    heads = [re.sub(r'\s+', ' ', text_of(m.group(2))).strip()
             for m in re.finditer(r'<h([1-6])\b[^>]*>(.*?)</h\1>', filled, flags=re.S)]
    items = []

    def walk(node):
        while node is not None:
            node = node.get_object()
            items.append(node)
            if '/First' in node:
                walk(node['/First'])
            node = node.get('/Next')

    walk(writer._root_object['/Outlines'].get_object().get('/First'))
    if len(items) != len(heads):
        sys.exit('build-summary-pdf: %d bookmarks for %d headings' % (len(items), len(heads)))
    for item, title in zip(items, heads):
        item[pp.generic.NameObject('/Title')] = pp.generic.TextStringObject(title)


def fonts_in(reader):
    names = set()
    for page in reader.pages:
        res = page.get('/Resources')
        res = res.get_object() if res is not None else {}
        fonts = res.get('/Font')
        for f in (fonts.get_object().values() if fonts is not None else []):
            base = str(f.get_object().get('/BaseFont', ''))
            names.add(base.split('+', 1)[-1].lstrip('/'))
    return names


def main():
    check_only = '--check' in sys.argv
    template = open(TEMPLATE, encoding='utf-8').read()
    rows, misses, loose = check_quotes(template)
    for ok, src, ref, q in rows:
        print('  %s %-7s %-14s %s' % ('ok  ' if ok else 'MISS', src, ref, q[:96]))
    for q, ok in loose:
        print('  note    unmarked quotation %s: %s' % ('(in report)' if ok else '(not in report - read it)', q))
    print('quotes: %d checked, %d missing' % (len(rows), misses))
    if misses:
        sys.exit('build-summary-pdf: stopped - a quotation does not match its source')
    want, have = tour_gaps(template, open(REPORT, encoding='utf-8').read())
    print('tour: %d entries for %d sections' % (len(have), len(want)))
    if have != want:
        sys.exit('build-summary-pdf: stopped - Part III must walk every section once, in order.\n'
                 '  report:  %s\n  summary: %s' % (' '.join(want), ' '.join(have)))
    if check_only:
        return

    ed = json.load(open(EDITION, encoding='utf-8'))
    build = json.load(open(BUILD, encoding='utf-8'))
    sections = section_count(open(REPORT, encoding='utf-8').read())
    filled = fill(template, ed, build, sections)

    tmp = tempfile.mkdtemp(prefix='b0b-summary-')
    try:
        page = os.path.join(tmp, 'summary.html')
        raw = os.path.join(tmp, 'raw.pdf')
        open(page, 'w', encoding='utf-8').write(filled)
        env = dict(os.environ)
        env['NODE_PATH'] = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip()
        subprocess.run(['node', os.path.join(ROOT, 'scripts', 'render-pdf.js'), page, raw], check=True, env=env)

        pp = pypdf()
        reader = pp.PdfReader(raw)
        writer = pp.PdfWriter(clone_from=reader)
        writer.pdf_header = reader.pdf_header
        retitle_outline(pp, writer, filled)
        title = re.search(r'<title>(.*?)</title>', filled, flags=re.S).group(1)
        writer.add_metadata({
            '/Title': html.unescape(title),
            '/Author': 'b0b.dev',
            '/Subject': 'The b0b.dev report, for the casual reader. Edition %s, %s.' % (ed['number'], ed['label']),
            '/Creator': 'scripts/build-summary-pdf.py',
        })
        final = os.path.join(tmp, 'final.pdf')
        with open(final, 'wb') as fh:
            writer.write(fh)

        # Read back what will be published, not what was meant to be.
        r = pp.PdfReader(final)
        n = len(r.pages)
        text = re.sub(r'\s+', ' ', ' '.join(p.extract_text() or '' for p in r.pages))
        root = r.trailer['/Root']
        problems = []
        if n not in PAGES_OK:
            problems.append('%d pages (expected %d-%d)' % (n, PAGES_OK.start, PAGES_OK[-1]))
        if '{{' in text:
            problems.append('a placeholder survived into the text')
        for must in ('The Heart of the Matter', ed['label'], '{:,}'.format(build['marker_count']), 'τετέλεσται', 'www.b0b.dev'):
            if must not in text:
                problems.append('missing from the text: %r' % must)
        stray = sorted(f for f in fonts_in(r) if not f.startswith(FONT_OK))
        if stray:
            problems.append('fallback fonts embedded: %s' % stray)
        for dpi, read in qr_reads(final):
            if read != [QR_WANT]:
                problems.append('the back-cover QR read %r at %d dpi' % (read, dpi))
        for key in ('/StructTreeRoot', '/Outlines'):
            if key not in root:
                problems.append('lost %s in the metadata pass' % key)
        if problems:
            keep = os.path.join(tempfile.gettempdir(), 'b0b-summary-rejected.pdf')
            shutil.copyfile(final, keep)
            sys.exit('build-summary-pdf: not written - %s (the rejected render is at %s)' % ('; '.join(problems), keep))

        os.makedirs(OUT_DIR, exist_ok=True)
        name = 'b0b-dev-summary-%s.pdf' % ed['edition']
        dest = os.path.join(OUT_DIR, name)
        shutil.copyfile(final, dest)
        shutil.copyfile(final, LATEST)
        digest = hashlib.sha256(open(dest, 'rb').read()).hexdigest()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    index_path = os.path.join(OUT_DIR, 'editions.json')
    index = json.load(open(index_path)) if os.path.exists(index_path) else {'editions': []}
    index['note'] = ('The summary for the casual reader, one edition a month. The latest is at /summary; '
                     'every edition stays at its own address.')
    index['editions'] = [e for e in index['editions'] if e['edition'] != ed['edition']]
    index['editions'].append({
        'edition': ed['edition'], 'number': ed['number'], 'label': ed['label'],
        'file': '/summaries/' + name, 'pages': n, 'bytes': os.path.getsize(dest), 'sha256': digest,
        'report_build': build['build'], 'built': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    })
    index['editions'].sort(key=lambda e: e['edition'])
    index['latest'] = index['editions'][-1]['file']
    with open(index_path, 'w', encoding='utf-8') as fh:
        json.dump(index, fh, indent=2, ensure_ascii=False)
        fh.write('\n')
    print('build-summary-pdf: %s - %d pages, %s bytes, sha256 %s' % (dest, n, '{:,}'.format(os.path.getsize(dest)), digest[:16]))
    print('build-summary-pdf: latest -> %s' % LATEST)


if __name__ == '__main__':
    main()
