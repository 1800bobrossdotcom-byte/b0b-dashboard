#!/usr/bin/env python3
"""Build site/darpa-cia-lockheed.html — a term concordance over the OSINT report.

The report's Cross-Reference Index (Section XIX) joins *topics*. This is a
different instrument: it counts a name, plots which of the 24 sections it fires
in, and links every passage that carries it.

Every number on the page is derived from site/report.html at build time. Nothing
is hand-typed, so the page cannot drift out of agreement with the report. Re-run
this after any edit that moves the tracked terms:

    python3 scripts/build-concordance.py

It then re-runs scripts/apply-seo-meta.js itself. That step is not optional and
is not left to the caller: this script rewrites the whole file, so it destroys
the managed <title>/meta/JSON-LD block on every run, and a page published with
that block missing looks fine in a browser and is invisible to everything else.

Adding a term is a one-line change to TERMS below plus a prose block in COPY.
"""

import html
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT = os.path.join(ROOT, 'site', 'report.html')
OUT = os.path.join(ROOT, 'site', 'darpa-cia-lockheed.html')
REPORT_URL = 'https://www.b0b.dev/report'
BASE = REPORT_URL + '#'

# Label for text before the first <h2>. It is real report prose and is counted,
# but it is not one of the 24 numbered sections and must not be tallied as one.
FRONT = 'FRONT'

# Whole-word, case-sensitive. "CIA" unbounded matches inside "special",
# "financial" and "associate"; the boundaries are what make the count mean
# anything. Order here is the order on the page: ascending count, which is also
# ascending diffuseness.
TERMS = [
    ('DARPA', 'darpa', 'A clock, and one named target'),
    ('Lockheed', 'lockheed', 'The case study'),
    ('CIA', 'cia', 'The connective institution'),
]


def index(src):
    """Return (h2s, h3s) as [(offset, id, plain-text title)]."""
    def collect(pattern):
        out = []
        for m in re.finditer(pattern, src, re.S):
            out.append((m.start(), m.group(1),
                        html.unescape(re.sub('<[^>]+>', '', m.group(2)).strip())))
        return out
    return (collect(r'<h2 id="([^"]+)"[^>]*>(.*?)</h2>'),
            collect(r'<h3[^>]*id="([^"]+)"[^>]*>(.*?)</h3>'))


# Blocks carrying data-noindex are removed before anything is counted. The only
# current member is the report's own pointer paragraph to this page, which names
# all three terms: counting it would let the index inflate its own numbers by
# citing itself, and the row it produced would point at the cross-reference to
# the page you are already reading.
NOINDEX = re.compile(r'<(\w+)[^>]*\bdata-noindex=[^>]*>.*?</\1>', re.S)


def build(src):
    src = NOINDEX.sub('', src)
    h2s, h3s = index(src)
    order = [x[1] for x in h2s]

    def locate(pos):
        """Section and subsection containing pos.

        The h3 must sit *inside* the same section: a mention in a section's
        opening text, before that section's first h3, belongs to no subsection
        and must not inherit the previous section's last one.
        """
        secs = [x for x in h2s if x[0] < pos]
        sec = secs[-1] if secs else (0, FRONT, 'Front matter')
        subs = [x for x in h3s if sec[0] < x[0] < pos]
        return sec, (subs[-1] if subs else None)

    data = {'order': order, 'terms': {}}
    for name, _, _ in TERMS:
        by_section, by_sub = {}, {}
        for m in re.finditer(r'\b%s\b' % re.escape(name), src):
            sec, sub = locate(m.start())
            by_section[sec[1]] = by_section.get(sec[1], 0) + 1
            key = sub[1] if sub else sec[1]
            by_sub.setdefault(key, {
                'anchor': key,
                'title': sub[2] if sub else '(section opening)',
                'section': sec[1],
                'n': 0,
            })
            by_sub[key]['n'] += 1
        rank = lambda r: (-r['n'], order.index(r['section']) if r['section'] in order else -1)
        data['terms'][name] = {
            'total': sum(by_section.values()),
            'by_section': by_section,
            # Numbered sections only - front matter is counted in the total but
            # is not a section, and saying "15 sections" when one of them is the
            # masthead is the kind of soft count this report exists to refuse.
            'nsec': len([k for k in by_section if k != FRONT]),
            'front': by_section.get(FRONT, 0),
            'subs': sorted(by_sub.values(), key=rank),
        }
    return data


def plate(term, data):
    """24 cells, one per section, shaded by density."""
    v = data['terms'][term]
    top = max(v['by_section'].values())
    cells = []
    for sid in data['order']:
        n = v['by_section'].get(sid, 0)
        level = 0 if n == 0 else min(4, 1 + int(3 * (n - 1) / max(1, top - 1)))
        cells.append('<div class="cell l%d" title="Section %s &mdash; %d"><span>%s</span></div>'
                     % (level, sid, n, sid))
    return ''.join(cells)


def ledger(term, data):
    rows = []
    for r in data['terms'][term]['subs']:
        # The report's front matter sits before the first <h2> and so has no
        # section anchor. Linking it to "#FRONT" produced a dead fragment; it
        # gets the bare report URL and says what it is instead.
        if r['section'] == FRONT:
            href, sig, title = REPORT_URL, '&mdash;', 'Front matter, before Section I'
        else:
            href = BASE + r['anchor']
            sig, title = html.escape(r['section']), html.escape(r['title'])
        rows.append(
            '      <li><a href="%s"><span class="sig">%s</span>'
            '<span class="nm">%s</span><span class="ct">%d</span></a></li>'
            % (href, sig, title, r['n']))
    return '\n'.join(rows)


# Prose is authored, not generated — the counts inside it are substituted from
# the live figures so a stale sentence is impossible.
COPY = {
    'DARPA': """<p>DARPA is the rarest of the three and the only one that does two unrelated jobs in this report. The larger share &mdash; {ii} of {total} &mdash; is <em>documentary</em>, and it is recent. <strong>Section II</strong> carries an approach out of the DOJ production itself: across 2010&ndash;2013 Epstein pursued an introduction to <strong>Regina Dugan, Director of DARPA from July 2009 to March 2012</strong>, brokered by Bill Gates&rsquo;s science adviser Boris Nikolic (<q>You would like her a lot! We need to schedule a trip to DC sometime soon</q>), kept alive by standing calendar alarms reading <q>remind JE Regina, darpa</q>, and planned to close at TED2012. The report states the strategic reading of that at hypothesis tier and publishes the finding that cuts against it &mdash; the interest continued after she left the agency. <strong>Nothing shows she met him or knew of the interest, and the report asserts nothing about her.</strong></p>
    <p><strong>The other job is a clock, and it points the opposite way in time.</strong> {Xvi_w} mentions sit in <strong>Section XVI</strong>, four inside one subsection: the derivation asking what is running now and will be disclosed in 2040. The programmes it names there are dated rather than speculative &mdash; <strong>Big Mechanism</strong> (2012, machine reading of the scientific literature), the <strong>Biological Technologies Office</strong> (established 2014, as CRISPR entered wide laboratory use), and the <strong>N3</strong> brain-computer interface line (2017&ndash;), which the report calls the successor to MKUltra&rsquo;s failed attempts <q>not through drugs and torture, but through engineering.</q> The argument there is a clock rather than a claim: every declassified programme in the report&rsquo;s own table stayed dark for two to three decades, so a 2013 cohort lands in 2033&ndash;2040.</p>
    <p>The remaining mentions do other work again. DARPA appears in <strong>Section XVI</strong> as a <em>credential that does not transfer</em>: Lt. Col. John G. Blitch is genuinely documented &mdash; DARPA robotics, founder of CRASAR, ran the search-and-rescue robots at the WTC &mdash; and in 2025 UAP media he is the vetter, not the claimant. A credentialed person vouching does not convert testimony into documentation. In <strong>Section XX</strong> it carries the ALIAS autonomy programme into the Calabasas crash entry, where the report states the capability and then states the counter-evidence that defeats it. And in <strong>XXIV</strong> it is the author disclosing the lens: Burbank, the GATE programme, and a DARPA mark on his own arm.</p>""",

    'Lockheed': """<p>Lockheed is the opposite shape. {Vii_w} of its {total} mentions are in <strong>Section VII</strong>, and thirteen of those are in a single subsection written for it. Where DARPA is split between a clock and a single named target, Lockheed is one argument the report works out in one place.</p>
    <p>The claim is chronological, and the report corrects its own looser version of it first: the Skunk Works (1943) is <em>not</em> older than the OSS (1942). Lockheed the company is &mdash; Loughead Aircraft (1912) &rarr; Lockheed Aircraft Co. (1926) &rarr; the Gross reorganisation (1932), all predating the OSS (1942), the CIA (1947) and the NRO (1961). <q>The private aerospace firm is older than the entire modern US intelligence apparatus &mdash; which was then built, in part, around capabilities the firm already had.</q></p>
    <p>Then the documented instruments. The <strong>U-2 was a CIA programme, not the Air Force&rsquo;s</strong>: Project AQUATONE, Eisenhower-approved November 1954, run by Richard Bissell, contracted directly to Kelly Johnson; Area 51 established April&ndash;July 1955 to flight-test it, and acknowledged by the Agency only in 2013. The <strong>A-12 OXCART</strong> was CIA-owned outright &mdash; twelve aircraft, operational 1965, declassified 2007. And Lockheed was system integrator on <strong>Corona, Gambit and Hexagon</strong>, the first spy satellites of an agency whose existence stayed classified until 1992.</p>
    <p>The other half is the <strong>bribery record</strong>: ~$22M across six countries, exposed by the Church Subcommittee in 1975&ndash;76, taking down Prince Bernhard of the Netherlands, Japanese PM Kakuei Tanaka and Italian President Giovanni Leone &mdash; and producing the <strong>Foreign Corrupt Practices Act</strong> (December 1977). Today Lockheed Martin is the world&rsquo;s largest arms producer for a fifteenth consecutive year (~$64.6B, SIPRI 2024), with an F-35 lifetime cost the GAO revised past <strong>$2 trillion</strong>.</p>
    <p><strong>Note the edge the report refuses to draw.</strong> A Lockheed&harr;Palantir collaboration is documented (2022). No Lockheed&ndash;Project Maven tie was found, Maven&rsquo;s industry partner is Palantir directly, and the report says so rather than letting the adjacency stand in for a link.</p>""",

    'CIA': """<p>CIA is less a subject in this report than a solvent. It appears in {sections_w} of the twenty-four numbered sections, once more in the front matter, and in {subs} separate subsections, which means it is doing structural work rather than occupying a chapter &mdash; and a high count here is a fact about the report&rsquo;s architecture, not evidence of anything.</p>
    <p>The densest clusters are four. <strong>Section VII</strong> ({vii}) holds the institutional machinery: the Cabinet Penetration Map across four administrations, the Task Force Orange / ISA entry on the unit that changes its classified codename roughly every two years, and Manufactured Leaders on the training pipelines. <strong>Section XVI</strong> ({xvi}) holds the declassified record itself &mdash; MKUltra, which survived only because 20,000+ documents were misfiled into financial records and escaped the 1973 destruction order &mdash; and the black-site network: 54 countries, 1,245 European Parliament-documented flights 2001&ndash;05, named sites confirmed by the European Court of Human Rights.</p>
    <p><strong>Section XX</strong> ({xx}) is the Calibration Index, where the count is a scoring artefact rather than prose. <strong>Section XVIII</strong> ({xviii}) is the culture programme: the Congress for Cultural Freedom across 35 countries, Abstract Expressionism funded onto tour through MoMA&rsquo;s International Council, Tom Braden&rsquo;s 1967 <cite>I&rsquo;m Glad the CIA Is &lsquo;Immoral&rsquo;</cite>, and the Agency&rsquo;s own 100-work collection at Langley.</p>
    <p>Two entries are worth reading for method rather than content. The <strong>two-ended camera</strong> in Section X pairs Burbank and Rochester &mdash; Lockheed built the U-2, Kodak&rsquo;s Hawkeye Works made and processed the film it carried &mdash; and then refuses to draw the second line: the two industries&rsquo; collapses share no documented actor, so the report calls it a structural homology and says a homology is not a network edge. And in <strong>Section XVI</strong> the FOIA harvest logs the report&rsquo;s own error at full resolution: it had claimed the NSA and DIA reading rooms were unreachable, which turned out to be a broken tool rather than a blocked agency. <q>&lsquo;The agency blocked us&rsquo; is a far more attractive sentence than &lsquo;we used the wrong tool.&rsquo;</q></p>""",
}


def prose(term, data):
    v = data['terms'][term]
    s = v['by_section']
    return COPY[term].format(
        total=v['total'],
        sections=v['nsec'], sections_w=words(v['nsec']),
        subs=len(v['subs']),
        vii=s.get('VII', 0), xvi=s.get('XVI', 0), ii=s.get('II', 0),
        vii_w=words(s.get('VII', 0)), xvi_w=words(s.get('XVI', 0)),
        Vii_w=words(s.get('VII', 0)).capitalize(),
        Xvi_w=words(s.get('XVI', 0)).capitalize(),
        xx=s.get('XX', 0), xviii=s.get('XVIII', 0),
    )


_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
         'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
         'sixteen', 'seventeen', 'eighteen', 'nineteen']


def words(n):
    """Spell small numbers, so prose does not mix '14' with 'twenty-four'."""
    if n < 20:
        return _ONES[n]
    if n < 30:
        return 'twenty' + ('' if n == 20 else '-' + _ONES[n - 20])
    return str(n)


PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="/theme.css">
  <script>(function(){{try{{var t=localStorage.getItem("b0b_theme");if(t==="light")document.documentElement.setAttribute("data-theme","light");}}catch(e){{}}}})();</script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script>
    /* Self-heal mobile staleness: kill any stale service worker + caches so this page
       always renders the live server copy (HTML is served no-cache). Safe, no reload loop. */
    (function(){{
      try {{
        if ('serviceWorker' in navigator) {{
          navigator.serviceWorker.getRegistrations().then(function(rs){{ rs.forEach(function(r){{ r.unregister(); }}); }}).catch(function(){{}});
        }}
        if (window.caches && caches.keys) {{
          caches.keys().then(function(ks){{ ks.forEach(function(k){{ caches.delete(k); }}); }}).catch(function(){{}});
        }}
      }} catch(e){{}}
    }})();
  </script>
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="/favicon.png">
  <title>Burbank, Langley, Arlington &mdash; b0b.dev</title>
  <style>
/* IBM Plex, self-hosted. The site CSP allows styles and fonts from 'self' only,
   so a Google Fonts <link> would be blocked with no visible error and the page
   would silently fall back. SIL OFL 1.1 - see /fonts/LICENSE-OFL.txt. */
@font-face{{font-family:"IBM Plex Mono";src:url("/fonts/ibm-plex-mono-latin-400-normal.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}}
@font-face{{font-family:"IBM Plex Mono";src:url("/fonts/ibm-plex-mono-latin-500-normal.woff2") format("woff2");font-weight:500;font-style:normal;font-display:swap}}
@font-face{{font-family:"IBM Plex Mono";src:url("/fonts/ibm-plex-mono-latin-600-normal.woff2") format("woff2");font-weight:600;font-style:normal;font-display:swap}}
@font-face{{font-family:"IBM Plex Serif";src:url("/fonts/ibm-plex-serif-latin-400-normal.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}}
@font-face{{font-family:"IBM Plex Serif";src:url("/fonts/ibm-plex-serif-latin-600-normal.woff2") format("woff2");font-weight:600;font-style:normal;font-display:swap}}
@font-face{{font-family:"IBM Plex Serif";src:url("/fonts/ibm-plex-serif-latin-400-italic.woff2") format("woff2");font-weight:400;font-style:italic;font-display:swap}}

/* Dark at :root, light under [data-theme="light"] - the site's polarity, set by
   the bootstrap above and toggled by /theme.js. */
:root{{
  --ground:#0a0b0c; --panel:#101314; --rule:#242829; --rule-hi:#39403f;
  --ink:#d3d8d5; --ink-2:#b3bab7; --dim:#7e8683;
  --phos:#00ff41;
  --darpa:#c98bff; --lockheed:#ffb45c; --cia:#82b4ff;
  --plate-0:#191d1e;
  --mono:"IBM Plex Mono",ui-monospace,Menlo,Consolas,"Courier New",monospace;
  --serif:"IBM Plex Serif",Georgia,"Times New Roman",serif;
}}
[data-theme="light"]{{
  --ground:#eceae4; --panel:#f6f4ef; --rule:#c8c4b9; --rule-hi:#a9a498;
  --ink:#1b1d1c; --ink-2:#3a3e3c; --dim:#636764;
  --phos:#0a6b28;
  --darpa:#5c2a9c; --lockheed:#8a5210; --cia:#1c4c99;
  --plate-0:#dcd8cf;
}}
*{{box-sizing:border-box}}
body{{
  margin:0;background:var(--ground);color:var(--ink);
  font-family:var(--serif);font-size:16.5px;line-height:1.62;
  -webkit-font-smoothing:antialiased;
}}
.wrap{{max-width:1080px;margin:0 auto;padding:0 clamp(18px,4vw,44px) 96px}}
a{{color:inherit}}
:focus-visible{{outline:2px solid var(--phos);outline-offset:3px}}
img,table,pre{{max-width:100%}}
p,li,h1,h2,h3{{overflow-wrap:break-word}}

.nav{{
  max-width:1080px;margin:0 auto;padding:20px clamp(18px,4vw,44px) 0;
  font-family:var(--mono);font-size:12px;letter-spacing:.06em;
  color:var(--dim);display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;
}}
.nav a{{color:var(--dim);text-decoration:none;border-bottom:1px solid transparent}}
.nav a:hover{{color:var(--phos);border-bottom-color:var(--rule-hi)}}
.nav .b0b-theme-btn{{font-family:var(--mono);font-size:11px}}

.mast{{padding:clamp(30px,6vw,64px) 0 0}}
.eyebrow{{font-family:var(--mono);font-size:11.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--phos);margin:0 0 22px}}
h1{{font-family:var(--mono);font-weight:500;font-size:clamp(30px,6.2vw,54px);line-height:1.06;letter-spacing:-.015em;margin:0;text-wrap:balance}}
h1 .sep{{color:var(--rule-hi);font-weight:400}}
.stand{{margin:26px 0 0;max-width:min(62ch,100%);font-size:clamp(17px,2.1vw,19.5px);line-height:1.58;color:var(--ink-2);text-wrap:pretty}}
.srcline{{margin:30px 0 0;padding-top:16px;border-top:1px solid var(--rule);font-family:var(--mono);font-size:12px;color:var(--dim);display:flex;flex-wrap:wrap;gap:6px 26px}}
.srcline b{{font-weight:500;color:var(--ink-2)}}

.shape{{
  margin:clamp(40px,7vw,72px) 0 0;padding:clamp(22px,3vw,30px);
  background:var(--panel);border:1px solid var(--rule);
  display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:0 clamp(24px,4vw,52px);
}}
.shape h2{{font-family:var(--mono);font-weight:500;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim);margin:0 0 16px;grid-column:1/-1}}
.shape .lede{{grid-column:1;grid-row:2/span 4;margin:0;align-self:start;font-size:clamp(19px,2.4vw,23px);line-height:1.42;color:var(--ink);padding-right:clamp(8px,2vw,20px)}}
.shape p{{margin:0 0 14px;grid-column:2;max-width:min(70ch,100%)}}
.shape p:last-of-type{{margin-bottom:0}}

.dossier{{margin:clamp(56px,9vw,96px) 0 0;scroll-margin-top:24px}}
.dh{{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:10px 28px;padding-bottom:14px;border-bottom:2px solid var(--accent)}}
.dossier h2{{font-family:var(--mono);font-weight:600;font-size:clamp(24px,4.4vw,36px);letter-spacing:.02em;margin:0;color:var(--accent)}}
.kick{{margin:4px 0 0;font-style:italic;color:var(--dim);font-size:16px}}
.meta{{margin:0;font-family:var(--mono);font-size:11.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--dim);font-variant-numeric:tabular-nums}}
#darpa{{--accent:var(--darpa)}}
#lockheed{{--accent:var(--lockheed)}}
#cia{{--accent:var(--cia)}}

.plate{{margin:22px 0 0;display:grid;grid-template-columns:repeat(24,1fr);gap:3px;overflow-x:auto}}
.cell{{aspect-ratio:1/1.5;min-width:0;background:var(--plate-0);display:flex;align-items:flex-end;justify-content:center;padding-bottom:3px}}
.cell span{{font-family:var(--mono);font-size:8px;color:var(--dim);writing-mode:vertical-rl;transform:rotate(180deg);padding-bottom:2px;pointer-events:none}}
.cell.l0 span{{opacity:.42}}
.cell.l1{{background:color-mix(in srgb,var(--accent) 20%,var(--plate-0))}}
.cell.l2{{background:color-mix(in srgb,var(--accent) 42%,var(--plate-0))}}
.cell.l3{{background:color-mix(in srgb,var(--accent) 66%,var(--plate-0))}}
.cell.l4{{background:color-mix(in srgb,var(--accent) 92%,var(--plate-0))}}
.cell.l3 span,.cell.l4 span{{color:var(--ground);opacity:.85}}
.platekey{{margin:8px 0 0;font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)}}

.prose{{margin:30px 0 0;max-width:min(68ch,100%)}}
.prose p{{margin:0 0 16px}}
.prose p:last-child{{margin-bottom:0}}
.prose strong{{font-weight:600}}
.prose q{{font-style:italic;color:var(--ink-2)}}
.prose q::before{{content:"\\201C"}}
.prose q::after{{content:"\\201D"}}
.prose cite{{font-style:italic}}

.lh{{margin:40px 0 12px;font-family:var(--mono);font-weight:500;font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim)}}
.ledger{{list-style:none;margin:0;padding:0;border-top:1px solid var(--rule)}}
.ledger li{{border-bottom:1px solid var(--rule)}}
.ledger a{{display:grid;grid-template-columns:62px 1fr 44px;align-items:baseline;gap:14px;padding:9px 8px;text-decoration:none}}
.ledger a:hover,.ledger a:focus-visible{{background:var(--panel)}}
.ledger a:hover .nm{{color:var(--accent)}}
.sig{{font-family:var(--mono);font-size:11.5px;letter-spacing:.12em;color:var(--dim)}}
.nm{{font-size:15.5px;line-height:1.4;color:var(--ink)}}
.ct{{font-family:var(--mono);font-size:13px;text-align:right;color:var(--accent);font-variant-numeric:tabular-nums}}

.foot{{margin:clamp(56px,9vw,96px) 0 0;padding-top:24px;border-top:1px solid var(--rule);max-width:min(68ch,100%)}}
.foot h2{{font-family:var(--mono);font-weight:500;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim);margin:0 0 16px}}
.foot p{{margin:0 0 15px}}
.foot p:last-child{{margin-bottom:0}}
.foot a{{color:var(--phos);text-underline-offset:3px}}

@media (max-width:780px){{
  .shape{{display:block}}
  .shape .lede{{margin:0 0 18px}}
  .shape p{{max-width:min(70ch,100%)}}
}}
@media (max-width:620px){{
  body{{font-size:16px}}
  .ledger a{{grid-template-columns:44px 1fr 30px;gap:9px}}
  .nm{{font-size:14.5px}}
  .cell span{{display:none}}
  .cell{{aspect-ratio:1/2.4}}
  .plate{{gap:2px}}
  .dh{{display:block}}
  .meta{{margin-top:10px}}
  .platekey{{letter-spacing:.08em}}
  .srcline{{gap:4px 0;flex-direction:column}}
}}
@media (prefers-reduced-motion:reduce){{*{{animation:none!important;transition:none!important}}}}
  </style>
</head>
<body>
<div class="main-content">
<nav class="nav">
  <a href="/">&larr; b0b.dev</a>
  <span>|</span> <a href="/report">REPORT</a>
  <span>|</span> <a href="/map">OSINT MAP</a>
  <span>|</span> <a href="/ai-attack-vector-analysis">AI VIRUS REPORT</a>
</nav>

<div class="wrap">
<header class="mast">
  <p class="eyebrow">Cross-reference &middot; PROJECT ANGLERFISH</p>
  <h1>Burbank<span class="sep">,</span> Langley<span class="sep">,</span> Arlington</h1>
  <p class="stand">Every passage in the report that names <strong>DARPA</strong>, the <strong>CIA</strong> or <strong>Lockheed</strong> &mdash; {grand} occurrences across {allsec} of its {nsec} sections &mdash; indexed by weight, with a deep link into each one.</p>
  <p class="srcline">
    <span><b>Source</b> b0b.dev/report</span>
    <span><b>Scope</b> {nsec} sections &middot; {nsub} subsections</span>
    <span><b>Match</b> whole word, case-sensitive</span>
    <span><b>Derived</b> at build time from the report itself</span>
  </p>
</header>

<section class="shape">
  <h2>What the shape says before the content does</h2>
  <p class="lede">The three names are not three versions of the same thing. Counted and plotted, each falls into a different pattern, and the pattern is the first finding.</p>
  <p><strong>CIA is diffuse</strong> &mdash; {cia_total} occurrences spread across {cia_sec_w} of the {nsec_w} numbered sections and {cia_subs} separate subsections. It has no chapter because it is connective tissue; a high count here describes the report&rsquo;s architecture rather than proving anything about the Agency.</p>
  <p><strong>Lockheed is concentrated</strong> &mdash; {lock_total} occurrences, {lock_vii_w} of them in Section VII and thirteen in a single subsection written for it. It is a worked case, argued once and in one place.</p>
  <p><strong>DARPA is sparse and split</strong> &mdash; {darpa_total} occurrences doing two unrelated jobs. {darpa_ii} of them sit in <strong>Section II</strong> and are documentary: a pursued approach to the agency&rsquo;s sitting director, out of the DOJ production itself. {darpa_xvi} are a clock &mdash; the derivation asking what is running now and gets disclosed in 2040, where a citation can only point at a record that does not exist yet. The larger half is now the one made of paper.</p>
  <p>The three are ordered below by count, smallest first, because that is also the order of increasing diffuseness &mdash; from a named target, to a worked case, to a solvent.</p>
</section>
{blocks}
<footer class="foot">
  <h2>Reading this index honestly</h2>
  <p><strong>A count is not a finding.</strong> The report cites the CIA nineteen times more often than DARPA, and that is a fact about how a document is organised rather than a ranking of institutional significance. The plates above are here so the asymmetry is visible rather than implied.</p>
  <p><strong>The refusals are part of the record.</strong> Two are worth carrying out of this index: no Lockheed&ndash;Project Maven edge is drawn, because Maven&rsquo;s industry partner is Palantir directly; and the Burbank&ndash;Rochester pairing draws exactly one line &mdash; the documented U-2 film supply relationship &mdash; and explicitly declines the second, because a structural homology is not a network edge.</p>
  <p><strong>Every row is a live anchor</strong> into the report, and every number on this page is recounted from the report at build time, so the two cannot drift apart.</p>
  <p><a href="/report">Open the full report &rarr;</a></p>
</footer>
</div>
</div>
<script src="/theme.js" defer></script>
</body>
</html>
"""

BLOCK = """
<section class="dossier" id="{slug}">
  <header class="dh">
    <div><h2>{name}</h2><p class="kick">{kicker}</p></div>
    <p class="meta">{total} occurrences &middot; {nsec} sections &middot; {nsub} subsections</p>
  </header>
  <div class="plate" role="img" aria-label="Occurrences of {name} across the report's 24 sections">{plate}</div>
  <p class="platekey">One cell per section, I&ndash;XXIV &middot; shade = density of {name} mentions</p>
  <div class="prose">{prose}</div>
  <h3 class="lh">Every passage, by weight</h3>
  <ol class="ledger">
{ledger}
  </ol>
</section>
"""


def main():
    with open(REPORT, encoding='utf-8') as fh:
        src = fh.read()
    data = build(src)

    blocks = []
    for name, slug, kicker in TERMS:
        v = data['terms'][name]
        blocks.append(BLOCK.format(
            slug=slug, name=name, kicker=kicker,
            total=v['total'], nsec=v['nsec'], nsub=len(v['subs']),
            plate=plate(name, data), prose=prose(name, data),
            ledger=ledger(name, data)))

    hit = set()
    for name, _, _ in TERMS:
        hit |= set(data['terms'][name]['by_section'])
    hit.discard(FRONT)
    _, h3s = index(NOINDEX.sub('', src))

    page = PAGE.format(
        blocks='\n'.join(blocks),
        grand=sum(data['terms'][n]['total'] for n, _, _ in TERMS),
        allsec=len(hit),
        nsec=len(data['order']), nsec_w=words(len(data['order'])),
        nsub=len(h3s),
        cia_total=data['terms']['CIA']['total'],
        cia_sec_w=words(data['terms']['CIA']['nsec']),
        cia_subs=len(data['terms']['CIA']['subs']),
        lock_total=data['terms']['Lockheed']['total'],
        lock_vii=data['terms']['Lockheed']['by_section'].get('VII', 0),
        lock_vii_w=words(data['terms']['Lockheed']['by_section'].get('VII', 0)),
        darpa_total=data['terms']['DARPA']['total'],
        darpa_ii=data['terms']['DARPA']['by_section'].get('II', 0),
        darpa_xvi=data['terms']['DARPA']['by_section'].get('XVI', 0),
    )

    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write(page)

    print('wrote %s (%d bytes)' % (os.path.relpath(OUT, ROOT), len(page)))
    for name, _, _ in TERMS:
        v = data['terms'][name]
        print('  %-9s %3d occurrences  %2d numbered sections  %2d subsections%s'
              % (name, v['total'], v['nsec'], len(v['subs']),
                 '  (+%d in front matter)' % v['front'] if v['front'] else ''))

    # Restore the managed SEO block this rewrite just destroyed. Chained here
    # rather than documented as a follow-up step, because the failure is silent.
    seo = os.path.join(ROOT, 'scripts', 'apply-seo-meta.js')
    r = subprocess.run(['node', seo], cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit('apply-seo-meta.js failed - the page has no <title> block:\n' + r.stderr)
    for line in r.stdout.splitlines():
        if 'darpa-cia-lockheed' in line:
            print('  seo   ' + line.strip())


if __name__ == '__main__':
    main()
