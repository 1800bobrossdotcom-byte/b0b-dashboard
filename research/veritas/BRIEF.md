# VERITAS — map marker audit brief (read fully before starting)

Author's instruction (2 Oct 2026): *"all markers, require utmost accuracy - scan every marker on map and ensure
this VERITAS."* The map is https://www.b0b.dev/map, source `site/map.html` (a `var locations = [...]` array).
You audit ONE batch file of markers and write verdicts. **You do not edit any repo file** (the spider appends to its
own ledger; that is fine). Read `/home/user/b0b-dashboard/CLAUDE.md` §2 (standing constraints), §3 (named rules)
and the §7 entries "SOURCE SPIDER", "THE DECOY RULE", "MAP LABELING AUDIT" and "MAP LABELING COHERENCE CHECK" first.

## What to check, per marker (fields: idx, name, lat, lng, type, section, ctx, date, dprec)

1. **Every checkable factual claim in `name` and `ctx`**: dates, figures, ownership, who-did-what, superlatives
   ("world's largest", "the only", "first"), titles/offices, operating status ("closed 2021"), and causal language.
2. **Coordinates**: does lat/lng sit on the place named? A reverse-geocode cache exists at
   `/tmp/claude-0/-home-user/9915310d-9125-5a6d-9896-9cfd05323aa5/scratchpad/revgeo.json`, keyed `"%.5f,%.5f" % (lat,lng)`
   → {display, addr}. Use it first. (Nominatim refuses the spider by robots — do not query it.) For a site-specific
   marker (a building, base, mine, stadium), flag it if it is plainly in the wrong town/province/country, or more than
   a few km off a well-known site whose coordinates you can establish from a fetched source (e.g. Wikipedia's
   coordinates line, read via the spider).
3. **`date`/`dprec`**: does the date field match the event the marker is about (not a retrieval stamp, not a span start)?
4. **`type` and `section`**: obviously wrong class (e.g. a launch site typed `airport`) → flag.
5. **Standing-rule violations (report these even if factually true):**
   - **Residence with a house number** in name or ctx → flag (streets only for residences; institutions/monuments may carry civic addresses).
   - **Living-person floor**: any living, uncharged person asserted or implied to be a criminal or an intelligence
     asset, or "documented affiliation" phrased as an operational tie → flag with the exact words.
   - **Numerology** (digits/dates read for meaning) → flag. **"crown"** for the top of a man-made structure → flag.
   - **Anti-map**: a chain asserted between things that merely share a place/time ("A → B → C" with no documented edge) → flag.
   - Unattributed causal or loaded claims ("built on child labor", "near-slave") → mark the tier they actually have.

## Evidence rules (non-negotiable)
- Fetch with the spider only: `cd /home/user/b0b-dashboard && python3 scripts/spider/spider.py fetch URL`, then
  `python3 scripts/spider/spider.py text URL` to read. One identity, robots obeyed; a 403/401/robots/decoy is a recorded
  null — never retried under another identity. PDFs: `python3 /tmp/claude-0/-home-user/9915310d-9125-5a6d-9896-9cfd05323aa5/scratchpad/pdftext.py <cachefile>`.
- WebSearch / WebFetch may be used **only to discover URLs**. A model summary is never evidence: every figure and quote
  you rely on must be read by you in the spider's cached text. (WebFetch has fabricated figures from PDFs before.)
- Wikipedia (en.wikipedia.org works through the spider) is acceptable for **uncontested basics** (coordinates,
  founding year, an event date) — say so in `sources`. For anything contested, ownership percentages, casualty
  figures, or allegations, use a primary or named outlet.
- Date-check everything; search results for 2026 often return older items.
- **When you cannot verify, say `unverified` — do not guess and do not mark `ok`.** A check that found nothing is not a pass.
- Efficiency: many markers are simple ("Pentagon - DoD HQ, Arlington") — verify them quickly against one source or the
  revgeo cache. Spend effort on figures, allegations, superlatives and ownership. You have ~100–160 markers; budget accordingly
  but do not skip any — every idx must get a verdict.
- Do not read FD-302s, victim interviews, protective-order material, or imagery-heavy documents (stop rules).

## Output
Write `/tmp/claude-0/-home-user/9915310d-9125-5a6d-9896-9cfd05323aa5/scratchpad/veritas/<batch>-verdicts.jsonl`, one JSON
object per marker, **every idx in your batch exactly once**:
```
{"idx": 123, "name": "...", "verdict": "ok|fix|imprecise|unverified|rule|editorial",
 "issues": ["short, specific statement of each problem"],
 "fix": {"name": "...", "ctx": "...", "lat": 0.0, "lng": 0.0, "type": "...", "date": "...", "dprec": "..."},
 "sources": [{"url": "...", "what": "what it establishes", "ledger": "ok|http_403|decoy_200|..."}],
 "tier": "documented|attributed|labeled|contested|unsupported"}
```
- `fix` contains ONLY the fields that should change, with the exact replacement value (keep the marker's style: names use
  " - " not " — "; keep ctx concise; keep `\'`-free plain text). For removal, use `"fix": {"_delete": true}` with the reason.
- `verdict`: `ok` = every claim checked and right; `fix` = a documented error with a sourced correction; `imprecise` = right in
  substance, wording/figure needs tightening (give the fix); `unverified` = could not check (say what was tried);
  `rule` = standing-rule violation (give the compliant rewrite); `editorial` = a judgment call for the author (explain).
Then write a short `<batch>-summary.md`: counts per verdict, the 10 most serious problems, nulls (refused hosts), traps.
Reply with that summary (under 300 words).
