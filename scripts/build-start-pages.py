#!/usr/bin/env python3
"""Build the first-contact layer: /start, /retractions, and the public data files.

Added 4 Oct 2026 at the author's instruction, after an outside review asked for:
  - a "read this first" page between the home page and the report (titled Briefing since 21 Oct 2026);
  - a ledger of what the report got wrong and lowered;
  - the map and the sources as downloadable data, so a reader can throw away the
    report's interpretation and keep the record.

Writes:
  site/start.html                 the Briefing: the institution, after design/INSTITUTION.md, and its method
  site/retractions.html           claims the page lowered, removed or corrected
  site/data/map-data.json         every marker and every connection line, with its edge tier
  site/data/sources-ledger.json   the spider's fetch ledger, successes and refusals

The SEO block in both pages is filled by scripts/apply-seo-meta.js from
scripts/seo-meta.json; run that afterwards.
"""
import html
import importlib.util
import json
import os
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')

spec = importlib.util.spec_from_file_location('kml', os.path.join(ROOT, 'scripts', 'build-kml.py'))
kml = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kml)

EDGE_TIERS = [
    ('0', 'analogy', 'a structural or thematic resemblance, or a coincidence - no documented relationship'),
    ('1', 'correlation', 'shared time, place, presence or sequence - nothing documents that one acted on the other'),
    ('2', 'contact', 'documented contact: meetings, correspondence, visits, membership, a shared board'),
    ('3', 'material', 'a documented material relationship: ownership, funding, contract, employment, a transfer, a physical link'),
    ('4', 'coordination', 'documented joint action: an agreement acted on by both, a joint operation, an instruction'),
    ('5', 'causation', 'the record shows A produced B: an official or court finding, or the body\'s own records'),
]


# --------------------------------------------------------------------------- data
def build_data():
    text = open(os.path.join(SITE, 'map.html'), encoding='utf-8').read()
    locs = kml.js_to_json(kml.extract_block(text, 'var locations = ['))
    conn = kml.js_to_json(kml.extract_block(text, 'var connectionLines = ['))
    tun = kml.js_to_json(kml.extract_block(text, 'var tunnelPaths = ['))
    ani = kml.js_to_json(kml.extract_block(text, 'var animalNetPaths = ['))
    edges = []
    for c in conn:
        edges.append({'kind': 'connection', 'from': c[0], 'to': c[1], 'label': c[3],
                      'tier': c[4] if len(c) > 4 else None})
    for t in tun:
        edges.append({'kind': 'tunnel', 'path': t['path'], 'label': t['label'], 'tier': t.get('tier')})
    for a in ani:
        edges.append({'kind': 'animal-network', 'path': a['path'], 'label': a['label'], 'tier': a.get('tier')})
    out = {
        'source': 'https://www.b0b.dev/map',
        'licence_note': 'Facts are not owned. Cite b0b.dev/map and the sources named in each marker.',
        'edge_tiers': {k: {'name': n, 'meaning': m} for k, n, m in EDGE_TIERS},
        'marker_count': len(locs),
        'edge_count': len(edges),
        'markers': locs,
        'edges': edges,
    }
    os.makedirs(os.path.join(SITE, 'data'), exist_ok=True)
    with open(os.path.join(SITE, 'data', 'map-data.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))

    # The fetch ledger. DOJ Epstein-library and corpus-search rows are withheld:
    # some of those documents were stopped at identification under the report's
    # stop rules, and listing them as "fetched" would point readers at them. The
    # report cites the EFTA ids it relies on in place.
    rows = []
    withheld = 0
    for line in open(os.path.join(ROOT, 'research', 'sources', 'ledger.jsonl'), encoding='utf-8'):
        r = json.loads(line)
        u = r.get('url', '')
        host = urllib.parse.urlparse(u).netloc
        low = u.lower()
        if ('justice.gov' in host and ('epstein' in low or 'efta' in low)) or 'jmail' in host:
            withheld += 1
            continue
        rows.append({k: r.get(k) for k in ('url', 'final_url', 'fetched_at', 'status', 'ok',
                                            'reason', 'sha256', 'bytes', 'title', 'note')})
    with open(os.path.join(SITE, 'data', 'sources-ledger.json'), 'w', encoding='utf-8') as f:
        json.dump({'source': 'b0b.dev source spider (scripts/spider/spider.py)',
                   'rule': 'one identity, robots.txt obeyed; a refusal is recorded as a null, never retried under another name',
                   'withheld_rows': withheld,
                   'withheld_reason': 'DOJ Epstein-library and corpus-search fetches - some were stopped under the report\'s stop rules; EFTA ids are cited in place in the report',
                   'rows': rows}, f, ensure_ascii=False, separators=(',', ':'))
    tiered = sum(1 for e in edges if e['tier'] is not None)
    return len(locs), len(edges), tiered, len(rows), withheld, locs, edges


# --------------------------------------------------------------------------- shell
FONTS = '''@font-face{font-family:"IBM Plex Mono";src:url("/fonts/ibm-plex-mono-latin-400-normal.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"IBM Plex Mono";src:url("/fonts/ibm-plex-mono-latin-600-normal.woff2") format("woff2");font-weight:600;font-style:normal;font-display:swap}
@font-face{font-family:"IBM Plex Serif";src:url("/fonts/ibm-plex-serif-latin-400-normal.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"IBM Plex Serif";src:url("/fonts/ibm-plex-serif-latin-600-normal.woff2") format("woff2");font-weight:600;font-style:normal;font-display:swap}
@font-face{font-family:"IBM Plex Serif";src:url("/fonts/ibm-plex-serif-latin-400-italic.woff2") format("woff2");font-weight:400;font-style:italic;font-display:swap}'''

CSS = '''
:root{--ground:#0a0b0c;--panel:#101314;--rule:#242829;--ink:#d3d8d5;--ink-2:#b3bab7;--dim:#7e8683;
  --phos:#00ff41;--doc:#00ff41;--att:#82b4ff;--hyp:#ffcc00;--null:#ff6b6b;--link:#00ccff;
  --mono:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;--serif:"IBM Plex Serif",Georgia,serif}
:root[data-theme="light"]{--ground:#f6f5f1;--panel:#ecebe5;--rule:#d4d2c9;--ink:#1d2120;--ink-2:#3a403e;--dim:#66706c;
  --phos:#0a7d2c;--doc:#0a7d2c;--att:#2456a8;--hyp:#8a6400;--null:#b3261e;--link:#005f8a}
*{box-sizing:border-box}
html{background:var(--ground)}
body{margin:0;background:var(--ground);color:var(--ink);font:17px/1.68 var(--serif);padding:0 16px 64px}
a{color:var(--link)}
a:focus-visible,button:focus-visible{outline:2px solid var(--phos);outline-offset:2px}
.top{max-width:980px;margin:0 auto;padding:18px 0 10px;border-bottom:1px solid var(--rule);font:13px/1.5 var(--mono)}
.top .nav{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center}
.top .nav a{text-decoration:none;color:var(--ink-2)}
.top .nav a:hover{color:var(--phos)}
main{max-width:72ch;margin:0 auto}
h1{font:600 clamp(26px,5vw,38px)/1.15 var(--mono);letter-spacing:-.01em;margin:42px 0 8px;text-wrap:balance}
.lede{color:var(--ink-2);margin:0 0 28px}
.kicker{font:600 12px/1.4 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--phos);margin:42px 0 0}
.kicker+h1{margin-top:10px}
.door{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 8px}
.door a{font:600 14px/1.2 var(--mono);letter-spacing:.04em;text-decoration:none;padding:12px 16px;border:1px solid var(--rule);background:var(--panel);color:var(--ink)}
.door a.go{border-color:var(--phos);color:var(--phos)}
.door a:hover{border-color:var(--phos)}
h2{font:600 15px/1.3 var(--mono);letter-spacing:.08em;text-transform:uppercase;margin:44px 0 12px;padding-top:14px;border-top:1px solid var(--rule)}
h2 .tag{font-weight:400;color:var(--dim);letter-spacing:.04em;text-transform:none}
ul.items{list-style:none;padding:0;margin:0;display:grid;gap:14px}
ul.items li{padding-left:14px;border-left:2px solid var(--rule);overflow-wrap:anywhere}
.k-null ul.items li{border-left-color:var(--null)}
.tier{font:600 11px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;padding:2px 6px;border:1px solid currentColor;border-radius:2px;margin-right:6px;white-space:nowrap}
.t-doc{color:var(--doc)}.t-att{color:var(--att)}.t-hyp{color:var(--hyp)}.t-null{color:var(--null)}
.src{display:block;font:13px/1.5 var(--mono);color:var(--dim);margin-top:2px}
.scale{width:100%;border-collapse:collapse;font:14px/1.5 var(--mono)}
.scale td,.scale th{border-top:1px solid var(--rule);padding:8px 8px 8px 0;text-align:left;vertical-align:top}
.scale th{color:var(--dim);font-weight:400}
.head{display:flex;gap:22px;align-items:center;margin:36px 0 0}
.head .kicker{margin:0}
.head h1{margin:8px 0 0}
.insignia{width:132px;height:132px;flex:none}
.thesis{font:400 clamp(21px,3.4vw,26px)/1.4 var(--serif);color:var(--ink);margin:28px 0 10px}
.levels{display:grid;grid-template-columns:max-content 1fr;gap:8px 18px;align-items:baseline;margin:0 0 16px}
.levels dt{font:600 12px/1.4 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--phos)}
.levels dd{margin:0}
.pull{font:italic 400 20px/1.5 var(--serif);color:var(--ink);margin:20px 0;padding-left:16px;border-left:2px solid var(--phos)}
.film{margin:22px 0 0}
.film video{display:block;width:100%;height:auto;aspect-ratio:16/9;background:#000;border:1px solid var(--rule)}
.film-cap{font:13px/1.6 var(--mono);color:var(--dim);margin:8px 0 0}
.film details{margin:6px 0 0;font-size:15px}.film summary{font:600 13px/1.6 var(--mono);letter-spacing:.04em;cursor:pointer;color:var(--ink-2)}
.film .script,.film .sources{padding-left:20px;display:grid;gap:6px;color:var(--ink-2)}.film .sources{font:13px/1.5 var(--mono)}
.coda{margin:60px 0 0;padding-top:22px;border-top:1px solid var(--rule);font:400 19px/1.65 var(--serif);color:var(--ink-2)}
.coda p{margin:0}
.coda .la{color:var(--ink);font-style:italic}
@media (max-width:520px){.head{flex-direction:column;align-items:flex-start;gap:14px}.insignia{width:104px;height:104px}
  .levels{grid-template-columns:1fr;gap:2px}.levels dd{margin-bottom:10px}}
.wrap{overflow-x:auto}
.dl{display:grid;gap:10px}
.dl a{display:block;background:var(--panel);border:1px solid var(--rule);padding:12px 14px;text-decoration:none;color:var(--ink)}
.dl a b{font:600 14px/1.4 var(--mono);color:var(--link)}
.dl a span{display:block;font-size:15px;color:var(--ink-2)}
.dl.two{grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))}
table.ledger{width:100%;border-collapse:collapse;font-size:15px;line-height:1.5}
table.ledger th{font:600 12px/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--dim);text-align:left;padding:8px 10px 8px 0;border-bottom:1px solid var(--rule)}
table.ledger td{padding:10px 10px 10px 0;border-bottom:1px solid var(--rule);vertical-align:top}
table.ledger td.d{font:13px/1.5 var(--mono);color:var(--dim);white-space:nowrap}
.was{color:var(--ink-2)}
.wide{max-width:1100px;margin:0 auto}
footer{max-width:72ch;margin:56px auto 0;font:13px/1.6 var(--mono);color:var(--dim);border-top:1px solid var(--rule);padding-top:14px}
@media (max-width:640px){table.ledger thead{display:none}table.ledger,table.ledger tbody,table.ledger tr,table.ledger td{display:block}
  table.ledger tr{border-bottom:1px solid var(--rule);padding:10px 0}table.ledger td{border:0;padding:3px 0}
  table.ledger td[data-l]::before{content:attr(data-l);display:block;font:600 11px/1.6 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
'''

NAV = '''<div class="top"><div class="nav">
  <a href="/report">&larr; THE REPORT</a><a href="/start">BRIEFING</a><a href="/retractions">CORRECTIONS</a>
  <a href="/map">OSINT MAP</a><a href="/map/list">MAP AS TEXT</a><a href="/home">FILMS</a><a href="/stickers">STICKERS</a><a href="/announcement">ANNOUNCEMENT</a><a href="/stats">STATS</a>
</div></div>'''


def page(title, body, main_class='', head_extra=''):
    return '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script>(function(){try{var t=localStorage.getItem("b0b_theme");if(t==="light")document.documentElement.setAttribute("data-theme","light");}catch(e){}})();</script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.png" type="image/png">
  <title>%s</title>%s
  <style>
%s
%s
  </style>
</head>
<body>
%s
<main%s>
%s
</main>
<script src="/theme.js" defer></script>
</body>
</html>
''' % (html.escape(title), head_extra, FONTS, CSS, NAV, (' class="%s"' % main_class) if main_class else '', body)


# --------------------------------------------------------------------------- the briefing film
FILM_SPEC = os.path.join(ROOT, 'scripts', 'film-briefing.json')
FILM_MP4 = os.path.join(ROOT, 'public', 'b0b-briefing-film.mp4')


def film_duration(path):
    """Seconds, read from ffmpeg's banner; None if the file or ffmpeg is missing."""
    import re, subprocess
    try:
        import imageio_ffmpeg
        ff = imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        ff = 'ffmpeg'
    try:
        err = subprocess.run([ff, '-i', path], capture_output=True, text=True).stderr
    except OSError:
        return None
    m = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', err)
    return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3)) if m else None


def build_film_block():
    """The Briefing film on its own page: the player, the download, and the script and every source,
    generated from the same spec the film is cut from (scripts/film-briefing.json)."""
    if not os.path.exists(FILM_MP4):
        return ''
    spec = json.load(open(FILM_SPEC, encoding='utf-8'))
    dur = film_duration(FILM_MP4)
    mb = os.path.getsize(FILM_MP4) / 1e6
    length = ('%d min %02d s, ' % divmod(int(dur), 60)) if dur else ''   # floored, as players show it
    e = lambda s: html.escape(s, quote=True)
    script = ''.join('<li><b>%s. %s</b> &mdash; %s</li>' % (e(p['id']), e(p['title']), e(' '.join(L['text'] for L in p['lines'])))
                     for p in spec['parts'] + [spec['finale']])
    script = script.replace('{TOTAL}', format(json.load(open(os.path.join(SITE, 'data', 'map-data.json'), encoding='utf-8'))['marker_count'], ','))
    seen, src = set(), []
    for p in spec['parts']:
        for s in p['shots']:
            if s['type'] == 'doc':
                src.append('<li>Document card &middot; %s &middot; %s</li>' % (e(s.get('head') or s.get('word', '')), e(s.get('tag', ''))))
                continue
            for k in s.get('media', []):
                if k in seen:
                    continue
                seen.add(k)
                m = spec['media'][k]
                src.append('<li>%s &middot; <a href="%s">source</a></li>' % (e(m['tag']).replace(' \u00b7 ', ' &middot; '), e(m['source_page'])))
    fm = spec['media'][spec['finale']['media']] if spec['finale'].get('media') else None
    if fm and spec['finale']['media'] not in seen:
        src.append('<li>%s &middot; <a href="%s">source</a></li>' % (e(fm['tag']), e(fm['source_page'])))
    return '''
<section id="film" class="film" aria-label="The briefing, as a film">
<video controls preload="none" playsinline poster="/img/briefing-poster.jpg" width="1280" height="720">
  <source src="/b0b-briefing-film.webm" type="video/webm"><source src="/b0b-briefing-film.mp4" type="video/mp4">
</video>
<p class="film-cap">The briefing, as a film: %snarrated, the words on screen. Every shot carries its source. <a href="/b0b-briefing-film.mp4" download>Download (MP4, %.0f MB)</a></p>
<details><summary>Script and sources</summary>
<ol class="script">%s</ol>
<ul class="sources">%s</ul>
<p>Voice: Piper, en_GB &ldquo;cori&rdquo;, trained on LibriVox recordings in the public domain. Sound: synthesised for the film. No face appears in it.</p>
</details>
</section>''' % (length, mb, script, ''.join(src))


# --------------------------------------------------------------------------- /start
# Since 21 Oct 2026 the Briefing presents the institution, after the author's framework
# (design/INSTITUTION.md), and no longer summarises the report: "briefing is repeating
# what is already stated in report". The maxim's provenance and the jacket's story stay
# in the report's front matter and are not repeated here.
def build_start(n_markers, n_edges):
    body = '''
<header class="head">
<img class="insignia" src="/img/insignia.png" width="132" height="132" alt="The insignia: ARS EST CELARE ARTEM around a figure in a trench coat and fedora carrying a case, with lightning bolts and six stars.">
<div><p class="kicker">b0b.dev &middot; Project Anglerfish &middot; independent intelligence research</p>
<h1>Briefing</h1></div>
</header>
<p class="thesis">The intelligence agency is the artwork.<br>The intelligence work is real.</p>
<p class="lede">An independent intelligence research operation. Its identity is the work; its research is sourced, tiered and correctable, and stands outside the fiction.</p>
<nav class="door" aria-label="Start here"><a class="go" href="/report">ENTER THE REPORT &rarr;</a><a href="/map">OPEN THE MAP</a><a href="/home">WATCH THE FILMS</a></nav>
%s

<h2 lang="la">Ars est celare artem</h2>
<p>The art is to conceal the art. b0b.dev works on three levels at once.</p>
<dl class="levels">
<dt>Artistic</dt><dd>b0b.dev is the artwork, and it does not need to announce itself as one.</dd>
<dt>Operational</dt><dd>The research, the tools, the dossiers, the map and the method are real, and in use.</dd>
<dt>Recursive</dt><dd>It investigates secrecy, concealment, surveillance and power, and keeps an ambiguity of its own.</dd>
</dl>
<p>The audience becomes an investigator of the investigator. The maxim&rsquo;s provenance is set out at the head of <a href="/report">the report</a>.</p>

<h2>Identity</h2>
<p>It stands between independent intelligence research and conceptual art; between open-source intelligence, operational fiction and the critique of power; between espionage mythology and the archive. It has the appearance of an obscure intelligence organisation. It claims no government affiliation, and it fabricates no credential, endorsement or provenance.</p>
<p class="pull">The identity may be ambiguous. The evidence must not be.</p>

<h2>The insignia</h2>
<p>A round seal on a navy field jacket: the motto across the top, six five-pointed stars below, lightning radiating from the centre, and at the centre a figure in a trench coat and fedora, carrying a case. The seal carries the authority of military and intelligence insignia; the figure at its centre is close to a cartoon. Both are meant.</p>
<p>The jacket is not merchandise. It is an artifact, and its existence suggests an organisation with members, a history, a culture of its own and a purpose. The seal on this page is digitised from it: the figure and the bolts traced from the thread, the motto and the stars set again.</p>

<h2>Precedents</h2>
<p>Marcel Broodthaers opened a museum in his Brussels house in 1968, the Mus&eacute;e d&rsquo;Art Moderne, D&eacute;partement des Aigles, with eagles in glass cases and signs saying this was not a work of art. Walid Raad&rsquo;s Atlas Group, a fictional foundation, keeps an archive of Lebanon&rsquo;s civil wars whose documents carry two dates and are attributed to sources Raad invented. The Yes Men pose as spokespeople for real organisations - the WTO, Dow Chemical - and speak in their name.</p>
<p>b0b.dev differs from all three in one respect: the intelligence work is real. The investigations, the map and the research infrastructure function outside the fiction. And unlike the Yes Men, it wears no real organisation&rsquo;s name.</p>

<h2>The paradox</h2>
<p>An official body usually establishes its authority through its identity and asks the public to trust its findings. b0b.dev turns that round: its identity is deliberately ambiguous, and its findings are open to anyone who checks them.</p>
<p class="pull">Don&rsquo;t trust b0b.dev. Examine the evidence.</p>

<h2>Holdings</h2>
<p>The website is the operational interface. The dossiers are research outputs and artifacts at once. The jacket is the organisation made physical; the insignia is its identity; the motto, its framework.</p>
<div class="dl two">
  <a href="/report"><b>The report</b><span>The dossier: twenty-five sections and a researcher&rsquo;s guide, every claim tiered and sourced.</span></a>
  <a href="/map"><b>The map</b><span>%s sites. Every line between them carries the tier of what the record shows.</span></a>
  <a href="/home"><b>The films</b><span>Endgame, The Epstein&ndash;Maxwell Record, Continuity and the intro film, with the author&rsquo;s transmissions.</span></a>
  <a href="/announcement"><b>The announcement</b><span>Spoken word over a beat, made to be played outdoors.</span></a>
  <a href="/stickers"><b>The stickers</b><span>Twelve lines from the report, each with its own QR code.</span></a>
  <a href="/retractions"><b>The corrections</b><span>What b0b.dev got wrong, how it was found, and what replaced it.</span></a>
</div>

<h2>What it is not</h2>
<p>Not a CIA-themed website. Not an OSINT dashboard with artistic branding. Not an espionage role-play, and not a fictional agency producing fictional research. Not a portfolio, and not a satire of intelligence agencies.</p>

<h2 id="method">Method</h2>
<ul class="items">
<li><b>Kept by Gianni Arone</b>, who sets scope and makes every contested call.</li>
<li><b>Every claim carries its tier and its source</b>: documented, attributed, labeled, contested or unsupported. Nothing moves up a tier by repetition. The guaranteed null, the anti-map and the symmetry rule are set out in <a href="/report#I">Section I</a>.</li>
<li><b>Standing rules.</b> No living, uncharged person is presented as a criminal or an intelligence asset. Redactions protecting living people are never reversed, and residences carry street names only. Victim interviews, protective-order material and imagery-heavy documents are not read past identification. Dates and numbers are recorded as facts, never read for meaning.</li>
<li><b>One identified crawler.</b> It obeys robots.txt, never disguises itself, solves no challenge and never retries a refusal under another name - a document taken past an access control has contaminated provenance. A refusal is recorded as a null, and a claim resting on a source it could not read stays at a lower tier. Every fetch and every refusal is in the <a href="/data/sources-ledger.json">source ledger</a> with its SHA-256.</li>
<li><b>Quotes and figures are read at the source.</b> No search result or summary, human or machine, carries a quote onto the page.</li>
<li><b>AI assistance, disclosed.</b> Research, drafting, verification and deployment are done with Claude, an AI model made by Anthropic, under the author&rsquo;s direction. Anthropic is also a subject of the report; the conflict is disclosed where it arises (Sections X and XXV).</li>
<li><b>Corrections.</b> A claim a primary source contradicts is lowered or removed, whoever raised it - the author and the AI included. It is fixed in place and entered in the <a href="/retractions">ledger</a>; contested and defamation-adjacent material waits for the author. To send one, use the researcher&rsquo;s guide at the end of <a href="/report#XXV">the report</a>: the claim, the passage, and the source that contradicts it.</li>
</ul>

<h2>The data</h2>
<div class="dl">
  <a href="/data/map-data.json" download><b>map-data.json</b><span>All %s markers and %s connection lines, with coordinates, context, dates and edge tiers. JSON.</span></a>
  <a href="/map/list"><b>The map as text</b><span>Every location and every connection line, with its tier and how the tiers work, as a plain readable list.</span></a>
  <a href="/map.kml" download><b>map.kml</b><span>The markers for Google Earth, with dates that drive its time slider.</span></a>
  <a href="/data/retractions.json" download><b>retractions.json</b><span>The corrections ledger as data: date, place, what the page said, what replaced it, how it was found.</span></a>
  <a href="/data/sources-ledger.json" download><b>sources-ledger.json</b><span>Every source fetch the spider made: URL, time, status, SHA-256 - and every refusal, recorded as a null.</span></a>
</div>

<div class="coda">
<p class="la" lang="la">Ars est celare artem.</p>
</div>
''' % (build_film_block(), format(n_markers, ','), format(n_markers, ','), n_edges)
    body += '<footer>b0b.dev &middot; written to be attacked: send corrections through the report&rsquo;s researcher&rsquo;s guide. Every count on this site is checked against one record before each deploy: <a href="/data/build.json">build.json</a> (counts, build stamp, content hashes).</footer>'
    # Search Console's ownership tag, kept here as well as on the report (which '/'
    # serves): outside the seo: block apply-seo-meta owns, and harmless on a second page.
    return page('Briefing', body, head_extra='\n  <meta name="google-site-verification" content="TsPEDsaL88qvOxa0dWejCZFKVU37Y7Vk5v5HKcp5kL0">')


# --------------------------------------------------------------------------- /retractions
# (date, where, what the page said or did, what replaced it, how it was found)
RETRACTIONS = [
    ('2026-09-12', 'VII', 'Closed the Federal Reserve material by saying the banking dynasties that created it still operate it.',
     'Removed. The succession printed directly above the sentence contains no banking dynasty; Paul Warburg was vice-governor 1916&ndash;18 and never chairman. The documented revolving door stays.',
     'It failed against the report&rsquo;s own list.'),
    ('2026-09-12', 'XX', 'Told the reader to &ldquo;note the Warburg name&rdquo; in Warburg Pincus.',
     'Removed. The firm has been a private partnership since 1966.', 'Corporate history.'),
    ('2026-09-12', 'VI', 'Cross-referenced a &ldquo;Rothschild banking network documented in Section VII&rdquo;.',
     'Replaced with the actual five-house record, including Vienna seized after the March 1938 Anschluss. Section VII had carried one sentence, about an 1825 loan.',
     'The cross-reference pointed at something that was not there.'),
    ('2026-09-12', 'II', 'Read the 1994 Mirror Group settlement as Maxwell&rsquo;s company conceding the allegation.',
     'Corrected. The apology was for the October 1991 articles attacking two journalists; settling a libel action is not an admission.',
     'Symmetry rule - a discount that only ran one way.'),
    ('2026-09-12', 'II', 'Called a 2014 contact &ldquo;the CIA Director who met with Epstein&rdquo;, in three places.',
     'Corrected. In 2014 he was Deputy Secretary of State; his CIA tenure was 2021&ndash;25.', 'A naming error of our own.'),
    ('2026-09-12', 'XVI', 'Cited an FBI Urban Moving serial of 24 September 2001 marked &ldquo;Pending&rdquo;.',
     'Replaced with the closing memorandum (case closed 10 July 2003), which records the counter-intelligence concern and kills the foreknowledge specimen on physical evidence.',
     'An eleven-day-old serial was standing in for a two-year case.'),
    ('2026-09-12', 'Report-wide', '33 notes narrating the report&rsquo;s own revisions, and an &ldquo;editorial correction&rdquo; box.',
     'Removed at the author&rsquo;s instruction. Claims are now fixed in place; this page is where the corrections are listed.', 'Readability.'),
    ('2026-09-18', 'X', 'Said Hikvision cameras watch Egypt&rsquo;s New Administrative Capital.',
     'Corrected. Honeywell (US) signed in 2019 to integrate 6,000+ cameras; an IDS study names Egypt as the exception where &ldquo;Honeywell takes the place of Huawei&rdquo;.',
     'Unsourced; the primary said the opposite.'),
    ('2026-09-19', 'Map', 'All 161 mass-shooting markers were dated 1982 - the start of a data set&rsquo;s coverage, not the shooting.',
     'Re-dated from each marker&rsquo;s own text by a rule-based extractor; 273 dates changed.', 'Our own date extractor took the earliest year on the line.'),
    ('2026-09-21', 'XIII', 'A subsection reading symbols, crosses and words as evidence (the &ldquo;naming error&rdquo; set piece).',
     'Removed whole. The rule survives where it is defined, in Section I.', 'The author: it was off the report&rsquo;s subject.'),
    ('2026-09-23', 'VII', 'Said the Svalbard seed vault was funded by Monsanto, Syngenta and DuPont for confiscation.',
     'Rewritten. Norway established and fully funded the vault and owns it; only a depositing gene bank can ask for its seeds back. What survives is the seed-patent record.',
     'The operator&rsquo;s own site.'),
    ('2026-09-23', 'XIII, XVI', 'Point Nemo (a coincidence chain), a Netherlands courtroom passage that called &ldquo;families who own the central banks&rdquo; documented, and a directed-energy claim resting on one anonymous account.',
     'Removed whole. The courtroom passage restated a trope the report had already killed.', 'Off-track audit.'),
    ('2026-09-24', 'II', 'Said Epstein&rsquo;s body was identified by his brother.',
     'Removed - not established; one outlet reported only that he said so. The pathologist observing the autopsy is now stated as retained by the family.',
     'Fact-check for the Epstein&ndash;Maxwell film.'),
    ('2026-09-26', 'XV', 'Our 22 September update printed the UN Iran mission&rsquo;s finding against the US and omitted the same report&rsquo;s crimes-against-humanity finding against Iran&rsquo;s government; some casualty figures had no source.',
     'Both findings now printed; counts replaced with the sourced ones.', 'The next current-events scan - the symmetry rule failing our way.'),
    ('2026-10-01', 'XV', 'Called &ldquo;economic D-Day&rdquo; a threat, and placed the UAE in a meeting.',
     'Corrected. It was a campaign name; attendance is not established.', 'Re-reading the sources quote by quote.'),
    ('2026-10-02', 'XIV, XV', 'Placed the cobalt belt in Eastern Congo, and cited children &ldquo;as young as six&rdquo; and an old Labor Department count.',
     'Corrected. The cobalt is in the southern Copperbelt (Lualaba and Haut-Katanga); Amnesty&rsquo;s figure is seven; the 2024 list is 204 goods from 82 countries. Eastern Congo&rsquo;s documented minerals are tin, tantalum, tungsten and gold.',
     'The map audit.'),
    ('2026-10-02', 'Map', 'Markers showed living people&rsquo;s cases without their outcomes - acquittals, dismissals, settlements - plus misquotes, chains implied by shared timing, residence house numbers and pins up to 400 km off.',
     '839 corrections, 176 pins moved, 2 markers removed under the living-person floor. Details are kept in the audit file, not repeated here.', 'VERITAS: every marker checked against a source.'),
    ('2026-10-03', 'I', 'Said Sir Aaron Bushnell died outside the Israeli Embassy.',
     'Corrected: he died in hospital that evening, after his protest outside the embassy.', 'Adding Al Jazeera&rsquo;s report as a source.'),
    ('2026-10-04', 'I, II', 'Argued that a deniable asset is &ldquo;defined by the absence&rdquo; of a file - so that the missing paperwork counted for the conclusion - and described Epstein&rsquo;s fortune as having &ldquo;no identifiable clients&rdquo;.',
     'Corrected. The missing file now counts in neither direction; the conclusion rests on the positive record and is scored against four rivals. The fortune has two documented clients, and the page already said so.',
     'An outside review, checked against the page.'),
    ('2026-10-04', 'Map lines', 'Connection lines drawn as arrows between places that share only a time, a city or a theme; tunnels labelled as documented with no document; and lines carrying false facts - a 1936 Olympics "awarded to Nazi Germany" (it was 1931), a 2018 World Cup awarded "during Crimea" (2010), BlackRock and Vanguard in "circular ownership", a White House-Capitol tunnel called documented.',
     'Every one of the 481 lines graded 0 (analogy) to 5 (causation) by what the record shows, 440 labels rewritten to state the actual relationship, 19 lines removed - false links, chains with no document, and lines that put living people beside a crime or an agency by placement alone. Arrows survive only where a document carries the direction.',
     'The edge-tier audit, prompted by an outside review.'),
    ('2026-10-04', 'Map', 'Five psychiatric-hospital markers presented as MKUltra sites (Ionia, Creedmoor, Riverview, Topeka) or as a political-commitment black site (Kasr El Aini), and a villa marker on the wrong street; line ends sitting on the wrong places - CIA lines starting at the National Defense University, Brunel&rsquo;s MC2 lines ending on the Place de la Concorde obelisk, a trans-Pacific cable landing on Long Island, the Channel Tunnel&rsquo;s English end in mid-Channel, a Lutnick contact line ending at the World Trade Center site, the Foxconn pin 30 km from the plant.',
     'The six markers and their lines removed: their claims had no source the audit could read, or the source said otherwise (Harold Blauer died at the New York State Psychiatric Institute, which stays on the map). 31 line ends and two pins moved onto the places their labels name. Three more lines removed: an undocumented White House&ndash;Capitol tunnel, a Google&ndash;Indian Creek line, and a duplicate Derinkuyu&ndash;Kaymakli tunnel drawn short of Kaymakli.',
     'The marker and edge audits; the author&rsquo;s decision on the held items.'),
    ('2026-10-04', 'AI report', 'Stated that the document &ldquo;proves&rdquo; AI output channels are manipulated by a background process, and counted a self-concealing pattern as evidence.',
     'Tiered. The outputs and defects are documented; the background process is a hypothesis; the competing explanation - ordinary model error and bias - is stated.',
     'The same review.'),
    ('2026-10-06', 'XXIII', 'Put the words &ldquo;sensitive aerospace program&rdquo; in Tom DeLonge&rsquo;s 2016 email about Gen. McCasland (they are not in it); read his wife&rsquo;s public statement as &ldquo;an unusual preemption&rdquo; about intelligence connections (it answered speculation already circulating and rejected it); said he walked into the Sandia foothills and took a gun; and counted his case as &ldquo;total institutional silence&rdquo;.',
     'Corrected from the email itself, the sheriff&rsquo;s releases and the published 911 call: direction of travel unknown; a revolver, wallet and backpack unaccounted for; his wife&rsquo;s account of a deliberate departure printed beside the pattern; Podesta&rsquo;s 1 Oct 2026 account of the call set against Grusch&rsquo;s.',
     'A Daily Mail lead (6 Oct 2026), checked against its sources.'),
]

TESTED = [
    ('That Epstein signed for the move of a CIA airline to Ohio', 'The CIA had sold the airline in 1973; &ldquo;signatory&rdquo; has no document.'),
    ('That Israeli &ldquo;military-grade&rdquo; radio equipment was installed at Zorro Ranch', 'The document is a 2014 quote for rural phone and internet backhaul, never built.'),
    ('That DARPA &ldquo;solved recursive self-improvement&rdquo; a decade ago', 'No program on the list claims it; what is real is the PAL&rarr;CALO&rarr;Siri lineage, which is published.'),
    ('That a hacking group&rsquo;s claimed breach of the FBI was real', 'The claim was abandoned before its deadline; nothing was published or confirmed.'),
]


def write_retractions_json():
    """The ledger as data: one entry per correction, ids stable by date order."""
    import re as _re
    def plain(t):
        return html.unescape(_re.sub(r'<[^>]+>', '', t))
    entries = []
    seq = {}
    for d, w, was, now, how in RETRACTIONS:
        seq[d] = seq.get(d, 0) + 1
        entries.append({'id': 'C-%s-%d' % (d, seq[d]), 'date': d, 'where': plain(w),
                        'page_said': plain(was), 'replaced_by': plain(now), 'found_by': plain(how)})
    out = {'source': 'https://www.b0b.dev/retractions',
           'note': 'Corrections and retractions, newest last. The report fixes claims in place; this file and /retractions are where the changes are kept.',
           'entries': entries,
           'tested_not_adopted': [{'claim': plain(c), 'why': plain(y)} for c, y in TESTED]}
    with open(os.path.join(SITE, 'data', 'retractions.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
        f.write('\n')


def build_retractions():
    write_retractions_json()
    rows = ''.join(
        '<tr><td class="d">%s</td><td class="d">%s</td><td data-l="The page said"><span class="was">%s</span></td><td data-l="Replaced by">%s</td><td data-l="Found by">%s</td></tr>'
        % (d, w, was, now, how) for d, w, was, now, how in RETRACTIONS)
    tested = ''.join('<li><b>%s.</b> %s</li>' % t for t in TESTED)
    body = '''<div class="wide">
<h1>Corrections &amp; retractions</h1>
<p class="lede" style="max-width:72ch">What this report said that was wrong, overstated or one-sided, what replaced it, and how it was found. The report fixes claims in place and does not narrate its own drafts; this ledger is where the corrections are kept, so that a reader can judge the method by its failures as well as its findings. A correction that lowers a tier is worth more than a confirmation.</p>
<div class="wrap"><table class="ledger">
<thead><tr><th>Date</th><th>Where</th><th>What the page said</th><th>What replaced it</th><th>How it was found</th></tr></thead>
<tbody>%s</tbody></table></div>
<section class="k-null" style="max-width:72ch"><h2>Tested and not adopted <span class="tag">- claims brought to the report and refused before publication</span></h2>
<ul class="items">%s</ul>
<p>Each test is kept in the report&rsquo;s research files with its sources and nulls.</p></section>
</div>''' % (rows, tested)
    body += '<footer>Corrections are welcome and are credited by substance, not by name. See the researcher&rsquo;s guide at the end of <a href="/report">the report</a>. This ledger as data: <a href="/data/retractions.json">retractions.json</a>.</footer>'
    return page('Corrections & Retractions', body)


# --------------------------------------------------------------------------- /map/list
def build_map_list(locs, edges):
    from collections import OrderedDict
    secs = OrderedDict()
    order = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV',
             'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV']
    for l in sorted(locs, key=lambda l: (order.index(l['section']) if l['section'] in order else 99, l['section'], l['name'])):
        secs.setdefault(l['section'], []).append(l)
    names = {'MS': 'Mass shootings', 'ANIMAL': 'Animal research', 'SPORTS': 'Sport and gambling'}
    parts = []
    toc = []
    for sec, items in secs.items():
        label = names.get(sec, 'Section ' + sec)
        sid = 'sec-' + sec.lower()
        toc.append('<a href="#%s">%s (%d)</a>' % (sid, html.escape(label), len(items)))
        rows = ''.join('<li><b>%s</b> <span class="src">%s%s &middot; %.4f, %.4f</span><span>%s</span></li>'
                       % (html.escape(l['name']), html.escape(l['type']),
                          (' &middot; ' + html.escape(l['date'])) if l.get('date') else '',
                          l['lat'], l['lng'], html.escape(l['ctx'])) for l in items)
        parts.append('<section><h2 id="%s">%s <span class="tag">- %d locations</span></h2><ul class="items">%s</ul></section>'
                     % (sid, html.escape(label), len(items), rows))
    def tier_txt(t):
        if t is None:
            return '<span class="tier t-null">untiered</span>'
        names_ = ['analogy', 'correlation', 'contact', 'material', 'coordination', 'causation']
        cls = 't-null' if t <= 1 else ('t-att' if t == 2 else 't-doc')
        return '<span class="tier %s">T%d %s</span>' % (cls, t, names_[t])
    erows = ''.join('<li>%s%s <span class="src">%s</span></li>'
                    % (tier_txt(e.get('tier')), html.escape(e['label']), html.escape(e['kind']))
                    for e in sorted(edges, key=lambda e: (-(e.get('tier') if e.get('tier') is not None else -1), e['label'])))
    scale = ''.join('<tr><td><b>%s</b></td><td>%s</td><td>%s</td></tr>' % (k, n, m) for k, n, m in EDGE_TIERS)
    body = """<div class="wide">
<h1>The map as text</h1>
<p class="lede" style="max-width:72ch">Every location and every connection line on <a href="/map">the OSINT map</a>, as a plain list - for screen readers, for search, and for anyone who would rather read than pan. The same data downloads as <a href="/data/map-data.json">JSON</a> and <a href="/map.kml">KML</a>. Lines are listed strongest first, by the tier of the relationship they show (<a href="#tiers">how the tiers work</a>).</p>
<p style="font:13px/1.8 var(--mono)"><a href="#tiers">How the lines are tiered</a> &middot; %s &middot; <a href="#connections">Connections (%d)</a></p>
<section><h2 id="tiers">How the lines are tiered</h2>
<p style="max-width:72ch">Every connection carries the tier of the <em>relationship</em> between its two ends, not of either end. A line is not evidence that two places are connected; its tier says how much the record shows.</p>
<div class="wrap"><table class="scale"><thead><tr><th>Tier</th><th>Name</th><th>What it takes</th></tr></thead><tbody>%s</tbody></table></div></section>
%s
<section><h2 id="connections">Connections <span class="tag">- %d lines, strongest first</span></h2><ul class="items">%s</ul></section>
</div>""" % (' &middot; '.join(toc), len(edges), scale, ''.join(parts), len(edges), erows)
    return page('The Map as Text', body)


def main():
    n_markers, n_edges, tiered, n_rows, withheld, locs, edges = build_data()
    open(os.path.join(SITE, 'start.html'), 'w', encoding='utf-8').write(build_start(n_markers, n_edges))
    open(os.path.join(SITE, 'retractions.html'), 'w', encoding='utf-8').write(build_retractions())
    open(os.path.join(SITE, 'map-list.html'), 'w', encoding='utf-8').write(build_map_list(locs, edges))
    print('start, retractions, map-list; map-data: %d markers, %d edges (%d tiered); ledger: %d rows, %d withheld'
          % (n_markers, n_edges, tiered, n_rows, withheld))


if __name__ == '__main__':
    main()
