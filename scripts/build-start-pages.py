#!/usr/bin/env python3
"""Build the first-contact layer: /start, /retractions, and the public data files.

Added 4 Oct 2026 at the author's instruction, after an outside review asked for:
  - a "read this first" page between the home page and the report;
  - a ledger of what the report got wrong and lowered;
  - the map and the sources as downloadable data, so a reader can throw away the
    report's interpretation and keep the record.

Writes:
  site/start.html                 what we know / think / don't know / what would change it
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
    return len(locs), len(edges), tiered, len(rows), withheld


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
h2{font:600 15px/1.3 var(--mono);letter-spacing:.08em;text-transform:uppercase;margin:44px 0 12px;padding-top:14px;border-top:1px solid var(--rule)}
h2 .tag{font-weight:400;color:var(--dim);letter-spacing:.04em;text-transform:none}
ul.items{list-style:none;padding:0;margin:0;display:grid;gap:14px}
ul.items li{padding-left:14px;border-left:2px solid var(--rule)}
.k-doc ul.items li{border-left-color:var(--doc)}
.k-hyp ul.items li{border-left-color:var(--hyp)}
.k-null ul.items li{border-left-color:var(--null)}
.k-test ul.items li{border-left-color:var(--att)}
.tier{font:600 11px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;padding:2px 6px;border:1px solid currentColor;border-radius:2px;margin-right:6px;white-space:nowrap}
.t-doc{color:var(--doc)}.t-att{color:var(--att)}.t-hyp{color:var(--hyp)}.t-null{color:var(--null)}
.src{display:block;font:13px/1.5 var(--mono);color:var(--dim);margin-top:2px}
.rules{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))}
.rule{background:var(--panel);border:1px solid var(--rule);padding:12px 14px}
.rule b{font:600 13px/1.4 var(--mono);display:block;margin-bottom:4px}
.scale{width:100%;border-collapse:collapse;font:14px/1.5 var(--mono)}
.scale td,.scale th{border-top:1px solid var(--rule);padding:8px 8px 8px 0;text-align:left;vertical-align:top}
.scale th{color:var(--dim);font-weight:400}
.wrap{overflow-x:auto}
.dl{display:grid;gap:10px}
.dl a{display:block;background:var(--panel);border:1px solid var(--rule);padding:12px 14px;text-decoration:none;color:var(--ink)}
.dl a b{font:600 14px/1.4 var(--mono);color:var(--link)}
.dl a span{display:block;font-size:15px;color:var(--ink-2)}
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
  <a href="/report">&larr; THE REPORT</a><a href="/start">READ THIS FIRST</a><a href="/retractions">RETRACTIONS</a>
  <a href="/map">OSINT MAP</a><a href="/home">FILMS</a>
</div></div>'''


def page(title, body, main_class=''):
    return '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script>(function(){try{var t=localStorage.getItem("b0b_theme");if(t==="light")document.documentElement.setAttribute("data-theme","light");}catch(e){}})();</script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.png" type="image/png">
  <title>%s</title>
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
''' % (html.escape(title), FONTS, CSS, NAV, (' class="%s"' % main_class) if main_class else '', body)


def item(tier, text, src=''):
    cls = {'documented': 't-doc', 'attributed': 't-att', 'conclusion': 't-hyp', 'hypothesis': 't-hyp',
           'not established': 't-null', 'null': 't-null', 'test': 't-att'}[tier]
    s = '<li><span class="tier %s">%s</span>%s' % (cls, tier, text)
    if src:
        s += '<span class="src">%s</span>' % src
    return s + '</li>'


# --------------------------------------------------------------------------- /start
def build_start(n_markers, n_edges):
    R = '/report#'
    know = [
        item('documented', 'Jeffrey Epstein pleaded guilty in Florida in 2008 under a 2007 federal non-prosecution agreement that immunised co-conspirators the government had not named. DOJ&rsquo;s Office of Professional Responsibility (2020) attributed the agreement to the prosecutors&rsquo; &ldquo;poor judgment&rdquo;.',
             '<a href="%sII">Section II</a>' % R),
        item('documented', 'Ghislaine Maxwell was convicted of sex trafficking and is serving twenty years. The trafficking is adjudicated; it is not this report&rsquo;s hypothesis.',
             '<a href="%sV">Section V</a>' % R),
        item('documented', 'Epstein&rsquo;s fortune has two documented clients: Leslie Wexner, by a 1991 power of attorney, and Leon Black, about $158&ndash;170M between 2012 and 2017 (the Dechert review found tax and estate work). JPMorgan banked him for about fifteen years. Nobody has explained the scale of what was paid.',
             '<a href="%sII">Section II</a>' % R),
        item('documented', 'CIA money is &ldquo;accounted for solely on the certificate of the Director&rdquo; (50 U.S.C. &sect;3510(b)); Congress publishes only the intelligence budget&rsquo;s total.',
             '<a href="%sxvi-the-intelligence-funding-documents-the-certificate-is-the-voucher">Section XVI</a>' % R),
        item('documented', 'On 14 September 2026 the Secretary of the Air Force acknowledged US weapons in orbit - the first public confirmation - naming no system. On 30 September the Pentagon announced an Autonomous Warfare Command and a future-of-warfare study co-led by people whose companies hold defence contracts.',
             '<a href="%sx-two-acknowledgments-in-one-month-a-weapon-in-orbit-and-a-spyware-wave-with-named-devices">Section X</a> &middot; <a href="%sx-the-study-and-the-sellers-autonomous-warfare-command-and-project-meridian">the study and the sellers</a>' % (R, R)),
        item('documented', 'Every one of the map&rsquo;s %s markers was audited against a source on 2 October 2026 (839 corrections). Every connection line now carries an edge tier, 0 to 5.' % format(n_markers, ','),
             '<a href="/map">the map</a> &middot; <a href="/retractions">what the audit changed</a>'),
    ]
    think = [
        item('conclusion', 'Epstein and Maxwell functioned as <em>deniable assets</em> - an intelligence-useful role under civilian cover. This is a judgment on the balance of the documented record, not a document, and it is scored against four rivals. The rival it has most trouble excluding is <em>several protections at once with no single design</em>: money, social capital and institutional self-interest, with services using him opportunistically.',
             '<a href="%sii-the-conclusion-in-one-place-two-principals-a-sponsor-question-and-a-price">The conclusion against its rivals</a>' % R),
        item('hypothesis', 'The sponsor question: Mossad primary, with US and British services witting by liaison. This is the author&rsquo;s labeled hypothesis, argued from liaison structure and the Maxwell lineage, not from the corpus, and the report prints two of its own findings that weigh against it.',
             '<a href="%sII">Section II</a>' % R),
        item('hypothesis', 'That the institutions in this record behave as one architecture of control. Recurrence is printed as recurrence; a shared timeline is not a chain, and the report says where a pattern is only a pattern.',
             '<a href="%sI">Section I</a>' % R),
    ]
    dont = [
        item('not established', 'That anyone ran either principal - a handler, taskings, a chain of command. That is rung 5, and the report claims it for no one.'),
        item('not established', 'Which service, if any, sponsored them. The files that would settle it are withheld from everyone; their silence counts in neither direction.'),
        item('not established', 'What the redacted and withheld Epstein material contains. The fight over the Justice Department&rsquo;s redactions is in federal court (<em>Phang v. Blanche</em>), and mutual legal assistance requests from Norway, Poland, Latvia and the UK were reported unfulfilled in September 2026.',
             '<a href="%sII">Section II</a>' % R),
    ]
    change = [
        item('test', 'The deniable-asset conclusion drops to a rival on any of: the 2007 immunity traced to ordinary negotiation in the prosecutors&rsquo; contemporaneous files; an explanation of Black&rsquo;s payments that accounts for their scale; or a complete release of the relevant service files showing no relationship. It rises only on a document - never on accumulation.'),
        item('test', 'Any primary document that contradicts a documented entry lowers it. A correction that lowers a tier is worth more to this report than a confirmation, and the ones made so far are listed in full.',
             '<a href="/retractions">The retraction ledger</a>'),
        item('test', 'Dated forward tests, written before the outcome: the Pentagon&rsquo;s Project Meridian report is due 28 January 2027, and its recommendations can be scored against its co-leads&rsquo; product lines.',
             '<a href="%sx-the-study-and-the-sellers-autonomous-warfare-command-and-project-meridian">Section X</a>' % R),
    ]
    rules = [
        ('Tiers', 'documented &middot; attributed &middot; labeled &middot; contested &middot; unsupported. Nothing moves up a tier by repetition.'),
        ('Guaranteed-null rule', 'A claim confirmed by every possible outcome is confirmed by none. Secrecy is evidence of nothing about what is hidden.'),
        ('Anti-map guardrail', 'A shared timeline is not a chain. Two points on a map are not a relationship until a document connects them.'),
        ('Symmetry rule', 'A discount applied to a fact that hurts a hypothesis must be applied to one that helps it.'),
        ('Testimony tier', 'Evidence of an experience, never evidence of a cause. Promoted only by a document.'),
        ('Living-person floor', 'No living, uncharged person is asserted or implied to be a criminal or an intelligence asset.'),
    ]
    scale = ''.join('<tr><td><b>%s</b></td><td>%s</td><td>%s</td></tr>' % (k, n, m) for k, n, m in EDGE_TIERS)
    body = '''
<h1>Read this first</h1>
<p class="lede">The report is long by design: twenty-five sections, every claim tiered and sourced. This page is the short version - what it knows, what it thinks, what it does not know, and what would change its mind - with the data underneath it, so you can throw the interpretation away and keep the record.</p>

<section class="k-doc"><h2>What we know <span class="tag">- documented</span></h2><ul class="items">%s</ul></section>
<section class="k-hyp"><h2>What we think <span class="tag">- conclusion and hypothesis, labeled as such</span></h2><ul class="items">%s</ul></section>
<section class="k-null"><h2>What we don&rsquo;t know <span class="tag">- not established</span></h2><ul class="items">%s</ul></section>
<section class="k-test"><h2>What would change our minds <span class="tag">- the falsifiers</span></h2><ul class="items">%s</ul></section>

<h2>The rules the report runs on</h2>
<div class="rules">%s</div>

<h2>How the map&rsquo;s lines are tiered</h2>
<p>Every connection on the map carries the tier of the <em>relationship</em> between its two ends, not of either end. A line is not evidence that two places are connected; its tier says how much the record shows.</p>
<div class="wrap"><table class="scale"><thead><tr><th>Tier</th><th>Name</th><th>What it takes</th></tr></thead><tbody>%s</tbody></table></div>

<h2>Download the data</h2>
<div class="dl">
  <a href="/data/map-data.json" download><b>map-data.json</b><span>All %s markers and %s connection lines, with coordinates, context, dates and edge tiers. JSON.</span></a>
  <a href="/map.kml" download><b>map.kml</b><span>The markers for Google Earth, with dates that drive its time slider.</span></a>
  <a href="/data/sources-ledger.json" download><b>sources-ledger.json</b><span>Every source fetch the report&rsquo;s spider made: URL, time, status, SHA-256 - and every refusal, recorded as a null.</span></a>
</div>

<h2>View the record</h2>
<div class="dl">
  <a href="/report"><b>The report</b><span>All twenty-five sections, tiered and sourced, with the researcher&rsquo;s guide.</span></a>
  <a href="/retractions"><b>The retraction ledger</b><span>What the report got wrong, how it was found, and what replaced it.</span></a>
  <a href="/ai-attack-vector-analysis"><b>The AI-safety report</b><span>A separate document on the AI tools used to build this site, now tiered the same way.</span></a>
</div>
''' % (''.join(know), ''.join(think), ''.join(dont), ''.join(change),
       ''.join('<div class="rule"><b>%s</b>%s</div>' % r for r in rules), scale,
       format(n_markers, ','), n_edges)
    body += '<footer>b0b.dev &middot; written to be attacked: send corrections through the report&rsquo;s researcher&rsquo;s guide. Last built from the live report and map.</footer>'
    return page('Read this first', body)


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
    ('2026-10-04', 'AI report', 'Stated that the document &ldquo;proves&rdquo; AI output channels are manipulated by a background process, and counted a self-concealing pattern as evidence.',
     'Tiered. The outputs and defects are documented; the background process is a hypothesis; the competing explanation - ordinary model error and bias - is stated.',
     'The same review.'),
]

TESTED = [
    ('That Epstein signed for the move of a CIA airline to Ohio', 'The CIA had sold the airline in 1973; &ldquo;signatory&rdquo; has no document.'),
    ('That Israeli &ldquo;military-grade&rdquo; radio equipment was installed at Zorro Ranch', 'The document is a 2014 quote for rural phone and internet backhaul, never built.'),
    ('That DARPA &ldquo;solved recursive self-improvement&rdquo; a decade ago', 'No program on the list claims it; what is real is the PAL&rarr;CALO&rarr;Siri lineage, which is published.'),
    ('That a hacking group&rsquo;s claimed breach of the FBI was real', 'The claim was abandoned before its deadline; nothing was published or confirmed.'),
]


def build_retractions():
    rows = ''.join(
        '<tr><td class="d">%s</td><td class="d">%s</td><td data-l="The page said"><span class="was">%s</span></td><td data-l="Replaced by">%s</td><td data-l="Found by">%s</td></tr>'
        % (d, w, was, now, how) for d, w, was, now, how in RETRACTIONS)
    tested = ''.join('<li><b>%s.</b> %s</li>' % t for t in TESTED)
    body = '''<div class="wide">
<h1>Retractions</h1>
<p class="lede" style="max-width:72ch">What this report said that was wrong, overstated or one-sided, what replaced it, and how it was found. The report fixes claims in place and does not narrate its own drafts; this ledger is where the corrections are kept, so that a reader can judge the method by its failures as well as its findings. A correction that lowers a tier is worth more than a confirmation.</p>
<div class="wrap"><table class="ledger">
<thead><tr><th>Date</th><th>Where</th><th>What the page said</th><th>What replaced it</th><th>How it was found</th></tr></thead>
<tbody>%s</tbody></table></div>
<section class="k-null" style="max-width:72ch"><h2>Tested and not adopted <span class="tag">- claims brought to the report and refused before publication</span></h2>
<ul class="items">%s</ul>
<p>Each test is kept in the report&rsquo;s research files with its sources and nulls.</p></section>
</div>''' % (rows, tested)
    body += '<footer>Corrections are welcome and are credited by substance, not by name. See the researcher&rsquo;s guide at the end of <a href="/report">the report</a>.</footer>'
    return page('Retractions', body)


def main():
    n_markers, n_edges, tiered, n_rows, withheld = build_data()
    open(os.path.join(SITE, 'start.html'), 'w', encoding='utf-8').write(build_start(n_markers, n_edges))
    open(os.path.join(SITE, 'retractions.html'), 'w', encoding='utf-8').write(build_retractions())
    print('start.html, retractions.html; map-data: %d markers, %d edges (%d tiered); ledger: %d rows, %d withheld'
          % (n_markers, n_edges, tiered, n_rows, withheld))


if __name__ == '__main__':
    main()
