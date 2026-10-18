#!/usr/bin/env python3
"""Publishes the public announcement to the site at /announcement.

Run after build_psa.py (and check_clarity.py). Writes:
  site/announcement/b0b-public-announcement-loop.mp3   one pass, for players set to repeat
  site/announcement/b0b-public-announcement-60min.mp3  the pass repeated past an hour
  site/announcement.html                               the page, on the same template as /start

The words on the page are read from build_psa.SECTIONS, so the page and the audio cannot drift.
The page's SEO block is filled by scripts/apply-seo-meta.js from scripts/seo-meta.json; run that afterwards.
"""
import html
import importlib.util
import os
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SITE = os.path.join(ROOT, 'site')
DEST = os.path.join(SITE, 'announcement')

spec = importlib.util.spec_from_file_location('startpages', os.path.join(ROOT, 'scripts', 'build-start-pages.py'))
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)
import build_psa as b  # noqa: E402  (SECTIONS only; Piper is imported inside its main())

FILES = [('psa-loop.mp3', 'b0b-public-announcement-loop.mp3', 'LOOP', 'go'),
         ('psa-60min.mp3', 'b0b-public-announcement-60min.mp3', 'ONE HOUR', '')]

CSS = '''
.psa-player{margin:6px 0 14px;padding:16px;background:var(--panel);border:1px solid var(--rule)}
.psa-player audio{display:block;width:100%}
.psa-player .cap{font:13px/1.5 var(--mono);color:var(--dim);margin-top:8px}
.door a small{font-weight:400;color:var(--dim);margin-left:8px}
.words h3{font:600 12px/1.4 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--phos);margin:26px 0 6px}
.words p{margin:0 0 4px}
'''


def duration(path):
    out = subprocess.run([os.path.join(HERE, 'ffprobe'), '-v', 'error', '-show_entries', 'format=duration',
                          '-of', 'csv=p=0', path], capture_output=True, text=True, check=True).stdout
    s = round(float(out))
    return '%d:%02d' % (s // 60, s % 60)


def size(path):
    n = os.path.getsize(path)
    return '%.1f MB' % (n / 1048576)


def main():
    os.makedirs(DEST, exist_ok=True)
    meta = []
    for src, dst, label, cls in FILES:
        s = os.path.join(HERE, 'out', src)
        if not os.path.exists(s):
            raise SystemExit('missing %s - run build_psa.py first' % s)
        d = os.path.join(DEST, dst)
        shutil.copyfile(s, d)
        meta.append((dst, label, cls, duration(d), size(d)))
    loop_dur = meta[0][3]

    words = []
    for title, lines in b.SECTIONS:
        words.append('<h3>%s</h3>' % html.escape(title))
        words += ['<p>%s</p>' % html.escape(b.shown(line)) for line in lines]
    door = '\n'.join('  <a%s href="/announcement/%s" download>%s<small>MP3 &middot; %s &middot; %s</small></a>'
                     % (' class="go"' if cls else '', dst, label, dur, sz) for dst, label, cls, dur, sz in meta)

    body = '''<p class="kicker">Public announcement</p>
<h1>Public announcement</h1>
<p class="lede">A four-minute announcement, hard and direct, built to cut through a street. It opens on the record itself, then says what the report is, what it concludes, how it grades every claim, and what you do now. Free to download and play.</p>
<div class="psa-player"><audio controls preload="none" src="/announcement/%s"></audio>
<div class="cap">One pass &middot; %s &middot; a low sting opens each section</div></div>
<div class="door">
%s
</div>
<h2>Playing it</h2>
<ul class="items">
<li><b>Set the loop to repeat,</b> or play the hour file straight through. Each pass is complete on its own, so anyone walking past hears all of it within a few minutes.</li>
<li><b>Check the local rules on amplified sound</b> before playing it in public. Many cities limit volume and hours, or require a permit.</li>
<li><b>If you adapt the words, keep &ldquo;What this is not.&rdquo;</b> Federal law, 18 U.S.C. &sect; 2387, makes it a crime to urge members of the armed forces toward insubordination or refusal of duty. That section is what keeps the announcement clear of it.</li>
</ul>
<h2>The words</h2>
<div class="words">
%s
</div>
<h2>How it was made</h2>
<p>The voice is synthetic: Piper&rsquo;s <code>en_GB-cori-high</code>, a model trained on public-domain LibriVox recordings. The sting between sections and the low pulse under the voice are synthesised; nothing is sampled, and neither sounds like an alert tone, a siren or a blast. The address to anyone who serves is adapted from the report&rsquo;s own, <a href="/report#to-those-inside">To those inside</a>.</p>
<p>Before publishing, a speech-recognition model transcribed one pass as rendered and through four simulated street recordings: a small speaker at a distance, with traffic noise six, then three, decibels below the voice. In noise it got about 95%% of the words right, and every sentence whose meaning rests on a negation (&ldquo;makes no claim&rdquo;, &ldquo;does not ask you to disobey legal orders&rdquo;, &ldquo;do not send classified material&rdquo;) was heard with the negation intact, every time.</p>''' % (meta[0][0], loop_dur, door, '\n'.join(words))
    body += ('\n<footer>b0b.dev &middot; read the record yourself: <a href="/report">the report</a> &middot; '
             '<a href="/start">read this first</a> &middot; <a href="/map">the map</a>.</footer>')
    out = sp.page('b0b.dev public announcement', body).replace('  </style>', CSS + '  </style>', 1)
    open(os.path.join(SITE, 'announcement.html'), 'w', encoding='utf-8').write(out)
    print('published: %s' % '; '.join('%s %s %s' % (m[0], m[3], m[4]) for m in meta))


if __name__ == '__main__':
    main()
