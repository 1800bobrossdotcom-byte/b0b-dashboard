# The Heart of the Matter: the monthly summary

A short PDF of the report for the casual reader, one edition a month. It is served at
**`/summary`** (a 302 to `/b0b-dev-summary.pdf`, always the latest). Every edition also stays at its own
address, `/summaries/b0b-dev-summary-YYYY-MM.pdf`, listed in `/summaries/editions.json`.

It covers the whole report, not only the Epstein-Maxwell record (the author, 24 Oct 2026: *"The report brief
needs to cover the entire document not just epstein and Maxwell"*). Four parts, the first two after his "the
heart and mind of the matter":
- **I, the heart:** what happened, told as a record of decisions, from 1976 to the files still withheld; then
  *Beyond one case*, the same kind of record at the scale of agencies, banks and states, each item from its own
  section and none offered as a link in a chain.
- **II, the mind:** how the report knows it, how sure it is, what it scores against itself, the rules it uses by
  name, and what it refuses to say.
- **III, the whole report:** every numbered section once, in order, in the report's own groups (the masthead's
  "The twenty-five sections, in groups"), plus the researcher's guide. One `<h3 class="sec">` entry each, at the
  grade the section's evidence carries, never its title's.
- **IV, what you can do**, with the servicemember lines kept verbatim.

Then **This edition** (the counts and what is new) and a back cover with the QR code. It is set at 6 × 9 in, which gives a line of about
60 characters in print and a page a phone can show at a readable size. The navy and thread are the
jacket patch's colours, and the seal is `design/projection/out/seal-thread-2000.png`.

## The rule

**The summary may say less than the report, never more.** Every quotation is marked
`<q data-src="report">` or `<q data-src="kjv" data-ref="Book c:v">`, and the build stops if one does not
match its source, after normalising curly quotes, dashes, case and spacing. Paraphrase is not checked by
machine, so read it against the page. Keep each claim at the report's tier. The standing rules in
`CLAUDE.md` §2 apply in full, and the summary names none of the people who were harmed.

## Each month

1. Do it after the month's last report deploy, so `site/data/build.json` carries that build's counts.
2. Edit `edition.json`: set `edition` (YYYY-MM), `label`, `number` (+1) and `next`, and write the
   `this_month` lines. Each line is a fact about what changed on the page that month, at its tier. Take
   them from that month's `CLAUDE.md` §7 entries and `/retractions`.
3. Edit `summary.html` only where the report itself changed: a correction, a re-tiered claim, a new
   status. Do not let the heart drift from the record to make a better sentence. For every section that
   changed that month, re-read its Part III entry against the page. A section added, removed or renumbered
   stops the build until Part III follows (`tour_gaps()`).
4. Run `python3 scripts/build-summary-pdf.py --check` (quotes only), then `python3 scripts/build-summary-pdf.py`.
   - It refuses to write if a placeholder survives, a font falls back, the page count leaves 8–24, the
     back-cover QR does not decode to `https://www.b0b.dev` at 150 and 72 dpi, or the PDF loses its tags
     or bookmarks. A rejected render is kept at `$TMPDIR/b0b-summary-rejected.pdf`.
5. Look at every page before publishing. A part ending with three lines on a fresh page means a trim:
   ```
   python3 -c "import pymupdf; d=pymupdf.open('public/b0b-dev-summary.pdf'); [p.get_pixmap(dpi=60).save('p%d.png'%(i+1)) for i,p in enumerate(d)]"
   ```
6. Commit `public/b0b-dev-summary.pdf`, `public/summaries/` and the design files, then push the branch and
   `HEAD:main`. Live check: `/summary` must answer 302, and the PDF it lands on must carry the sha256 in
   `editions.json`.

## Traps

- **Chromium titles a PDF bookmark from the heading's laid-out lines and joins them with no space**
  ("And nothing changed" became "Andnothing changed"). `retitle_outline()` re-titles every bookmark from
  the headings in the HTML, and stops if the count differs.
- **pypdf imports this container's broken `cryptography`** and panics. The build stubs it; the summary is
  never encrypted.
- **The KJV lives in the spider cache, which is not committed.** In a fresh container, run
  `python3 scripts/spider/spider.py fetch https://www.gutenberg.org/cache/epub/10/pg10.txt` first.
- **Playwright is global, not a site dependency.** The build sets `NODE_PATH=$(npm root -g)` for `scripts/render-pdf.js`.
- **The QR is navy on a thread tile, never thread on navy.** Inverted codes fail on many phone cameras.
- Plex has no Greek. τετέλεσται is set in DejaVu Serif through the `.greek` class. Any other font in the PDF stops the build.
