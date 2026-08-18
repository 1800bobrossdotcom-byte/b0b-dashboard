# COHERENCE REPORT — site/map.html × site/report.html

Internal research. NOT published (research/, never served).
Run: 18 Aug 2026, against branch `claude/new-session-gfdu82` @ 9aaa392.

METHOD — mechanical, not editorial. The map's data arrays were parsed and evaluated
(`locations`, `connectionLines`, `animalNetPaths`, `tunnelPaths`), every internal href
in both files was resolved against `server.js`'s route table, every `#anchor` against
the report's real element ids, and every numeric claim the report makes *about the map*
was recomputed from the map's own data. Routes were then confirmed empirically against
a live `node server.js` on port 3111 (cookie-gated, `X-Forwarded-Proto: https`).
No claim below is an opinion about content; each is a checkable mismatch between the
two files or between a file and the server that serves it.

CORPUS AS MEASURED
- map: 1,002 markers, 15 distinct `section` values, 24 `type` values,
  417 connection lines (398 `connectionLines` + 19 `animalNetPaths`), 61 tunnel paths.
- report: 23 sections, `id="I"` … `id="XXIII"`, all present, no dead in-page anchors.

═══════════════════════════════════════════════════════════════════════
VERDICT
═══════════════════════════════════════════════════════════════════════
The narrative layer is sound: the report's internal cross-references are clean (0 of
~490 "Section N" references point at a section that doesn't exist), and every claim the
report makes about map structure that can be recomputed — the townhouse hub, the
Section XXI edge list, the Data Centers layer — reproduces against the map's own data
(one claim is a commit stale in its integers, not in its shape: Tier 3.1).

What has drifted is the *seam*. Six links between the two artifacts are broken at the
routing level, one whole map layer (74 markers) has no report section to point at, and
the map's section vocabulary has outgrown the report's numbering. Nothing here is a
content error; it is all wiring and bookkeeping.

═══════════════════════════════════════════════════════════════════════
TIER 1 — BROKEN LINKS (confirmed 404 against the running server)
═══════════════════════════════════════════════════════════════════════

1. `/api/data` — 404. Promised in two places as the researcher-facing export:
   - report.html:4072 "JSON API: /api/data - returns all locations, types,
     cross-references, and metadata as structured JSON. No authentication required"
   - map.html:699 filter panel "⬇ EXPORT JSON DATA"
   `server.js` defines no such route (only `/api/gate`, `/api/updated`). The report's
   "For Journalists & Legal Researchers" promise — "The map data is public domain -
   use it freely" — currently has no delivery mechanism.

2. `/download` — 404. map.html:700 "📦 DOWNLOAD OFFLINE BACKUP (ZIP)". No route.

3. `/tones/...` — 404 for every slash-form tones link. `PAGES` in server.js:187-201
   registers `/tones-shield`, `/tones-instrument`, `/tones-multipack`,
   `/tones-shield-guide`; the pages link to the slash form:
   - report.html:378 nav "ARC SHIELD" → `/tones/shield`  (also 4121-area nav block)
   - map.html toolkit → `/tones/instrument`, `/tones/multipack`
   - countermeasures.html → `/tones/shield`, `/tones/shield/guide`
   The report's primary nav bar has a dead link in it.

4. `/i18n/<lang>/report-<slug>.html` — 404 for all 176 files (11 languages × 16
   sections). report.html:4393 fetches them to swap the report body; the static
   middleware (server.js:207-212) only serves `js|css|json|png|svg|ico|jpg|jpeg|webp|
   mp3|mp4|woff2?` — `.html` is not in the allowlist, and `PAGES` has no entry.
   Every fetch rejects and the `.catch()` silently restores English. The entire
   translated corpus is committed, complete, and unreachable.
   Fix is one character class: add `html` to the static regex (scoped to `/i18n/`).

5. `/report#SPORTS` — dead anchor, emitted by 74 markers. map.html:2399 builds the
   popup's "→ View in Report" href as
   `'/report#' + (({ANIMAL:'XIII'})[loc.section] || loc.section)`.
   `SPORTS` has no mapping, and the report has no `id="SPORTS"` — no sports/gambling
   section exists at all (see Tier 2.1).

6. `ANIMAL → XIII` — wrong anchor, 36 markers. Same line. Section XIII is "Cyclical
   Patterns"; the animal material lives in XIV ("Animal & Human Slavery Systems" →
   subsection "Animal Systems - The Parallel Operation", report.html:2732ff).
   Worse, half those 36 markers are not animal labs at all (Tier 2.3), so 18 sovereign
   -wealth-fund and asset-manager markers currently point a reader at Section XIII.

═══════════════════════════════════════════════════════════════════════
TIER 2 — STRUCTURAL MISMATCH (map's taxonomy vs the report's numbering)
═══════════════════════════════════════════════════════════════════════

1. SPORTS is an orphan layer — the largest single incoherence.
   74 markers across 8 types (sports-gambling 43, organized-crime 18, governance 4,
   conflict 3, archaeological 3, financial 1, corporate 1, military 1) carry
   `section:"SPORTS"`. The report contains no sports or gambling section, no such
   heading, and the word "casino" appears 5 times, all incidental (Trump casinos,
   Nicholas Ribis in the Section II email table).
   Options, in order of honesty: (a) write the section — the material is clearly
   there: FIFA/Zurich, Dan Tan match-fixing, CONCACAF, the Olympic bid bribery, the
   Vegas mob-to-league arc, publicly-financed stadiums; (b) fold the Olympics markers
   into XIII (which already has "The Olympic Pattern - Celebration on Contested
   Ground") and the syndicate markers into XVII, retiring the pseudo-section.
   Until then, 74 markers advertise a report section that does not exist.

2. `XXII - Spiritual Exit` is a dead filter. map.html:532 offers the checkbox; zero
   markers carry `section:"XXII"`. Selecting it alone empties the map. Report XXII is
   non-geographic (practices, framework, resource guide), so the honest fix is to
   delete the checkbox, not to invent markers.

3. Two pseudo-sections do work the numbering can't see.
   - `ANIMAL` (36) = animal-research 18 + **capital 18**. The 18 `capital` markers are
     Vanguard, BlackRock, State Street, Fidelity, Wellington, DoD/DHA, NIH — plus
     Blackstone, Berkshire, RenTech, NBIM, ADIA, PIF, GPIF, CIC, Bridgewater, Temasek,
     GIC. They are there as Charles River / Marshall BioResources holders, but the
     consequence is that the only way to see the world's largest sovereign wealth funds
     on this map is to tick "Animal Testing" — and `capital` appears in no other
     section, so Section VII's financial filter never shows them.
   - `SPORTS` (74) as above.

4. Section IX has become a catch-all. Report IX is "Underground Infrastructure -
   D.U.M.B. Sites & Parallel Geography". Its 160 markers:
   underground 75, **technology 34**, **airport 21**, military 15, blacksite 11,
   governance 2, enclave 1, surveillance 1.
   The 34 `technology` markers are the Ivy/defense university pipeline (MIT, Stanford,
   Yale, Harvard, JHU/APL, Chicago, Columbia, Georgetown, Berkeley, Caltech,
   Princeton/IDA) — the academic-intelligence corridor, which is Section VII material.
   The 21 `airport` markers split two ways: rendition transit (Shannon, Palma,
   Szymany) belongs with XVI's blacksite layer; spaceports (Esrange, Woomera,
   Kwajalein, Sohae, Sriharikota) belong with X's satellite layer.
   More than half of "Underground" is not underground.

5. Section XIV shows the wrong half of itself. Report XIV is human *and* animal
   bondage; the map's XIV is mining 49 / corporate 3 / conflict 1 — the extraction
   layer only — while the animal half sits in the `ANIMAL` pseudo-section and the
   human-bondage material (debt, prison labor) has no geography at all.

6. Ten report sections have zero markers: I, III, IV, V, VI, XVIII, XIX, XXI, XXII,
   XXIII. Most are legitimately non-geographic (indices, framework, the signal).
   Two are not, and are worth markers: IV (blowback — Axon/Carbyne already exists but
   sits under II) and V (the Maxwell template — Mount of Olives, Headington Hill Hall,
   FPC Bryan all exist but sit under II; their own ctx text says "see report Section V").

═══════════════════════════════════════════════════════════════════════
TIER 3 — STALE NUMBERS (report cites the map; map has since moved)
═══════════════════════════════════════════════════════════════════════

1. report.html:767 — "157 of the 220 nodes reachable from it - 71% - sit within six
   documented degrees, the distribution peaking at four."
   Recomputed from the current `connectionLines` graph, BFS from 9 East 71st Street:
   **222 reachable, 158 within six hops, 71.2%, peak at four (48 nodes).**
   The shape of the claim survives; the two integers are one commit stale (the
   Deutsche Bank / La Santé additions in 0cdd140). Update 157→158, 220→222.

2. report.html:657 and :766 — "all 1,000 locations". Actual: 1,002. Round numbers
   drift with every map commit; "1,000+" would stop this recurring.

3. map.html:2658 — the stats bar hard-codes `SECTIONS: 16`. The data has 15 distinct
   section values (the 16th, XXII, has no markers). Derive it:
   `new Set(locations.map(l => l.section)).size`.

4. report.html:766 names the hubs — BIS, Bilderberg, the Fed, CFR, townhouse #2.
   By degree in the map's own edge data the ranking is: Black Wall Street / Greenwood
   (21), **9 East 71st Street (14)**, NRO Chantilly (10), BIS (9), Little Saint James
   (9), Fed (8), Buckley SFB (8), Bilderberg (8), CFR (7).
   The townhouse-is-#2 claim is exactly right. But the #1 node by connectivity is
   Greenwood, and the report's hub sentence doesn't mention it — a reader who counts
   lines on the map will find a top hub the prose never names.

═══════════════════════════════════════════════════════════════════════
TIER 4 — DUPLICATE MARKERS (double-counted in stats and filters)
═══════════════════════════════════════════════════════════════════════

Nine sites carry two markers at identical (or ~sub-km) coordinates. Most are
complementary text split across two entries rather than contradictions, but each
inflates the marker count, appears twice in search, and can land in two different
report sections:

| site | lines | sections/types |
|---|---|---|
| ASML Veldhoven | 2187, 2270 | X/corporate vs **IX/technology** |
| Thule Air Base | 1621, 1730 | VII/military vs IX/airport |
| Baikonur | 1542, 1736 | X/satellite vs VII/airport |
| Sohae (Tongchang-ri) | 2308, 2322 | VII/military vs IX/airport |
| Satish Dhawan | 2173, 2210 | X/satellite vs IX/airport |
| Yamantau | 1334, 1709 | IX/underground ×2 |
| Culiacán cartel HQ | 1452, 1714 | XVII/organized-crime ×2 |
| Palmyra Atoll | 1503, 1746 | XII/enclave ×2 |
| Allegiant Stadium | 2005, 2019 | SPORTS/sports-gambling vs SPORTS/financial |
| Congress for Cultural Freedom | 1436, 1834 | VII/governance ×2, 1.5 km apart |
| Baalbek | 1399, 1787 | XIII/archaeological vs XV/conflict, 700 m apart |

**One is a factual contradiction, not just a duplicate.** The two ASML markers price
the same machine differently in the same file:
- 2187: "Each EUV system costs roughly EUR 350 million" (src: CNBC; Wikipedia)
- 2270: "bus-sized systems priced around €150 million each" (src: Silicon Canals; Wikipedia)
Both cite Wikipedia. Standard EUV (NXE:3600D) is ~€150-200M; High-NA (EXE:5200) is
~€350-400M. The two markers are describing different products as if one. Merge into a
single marker and state both tiers, or the map contradicts itself at the same dot.

Also note: `Hikvision HQ` and `Dahua HQ` (both Hangzhou) share identical coordinates
30.211,120.207 — two different corporate campuses on one pin. Looks like copy-paste.

═══════════════════════════════════════════════════════════════════════
TIER 5 — LEGEND / DECODING GAPS
═══════════════════════════════════════════════════════════════════════

1. `epstein-network` (#ff1744) is in `colorMap` (map.html:1174) and in the type filter,
   but **not in the MARKER COLORS legend**. 18 markers — including the ones the report
   points at most often — render in a red the legend never explains. The legend lists
   23 of the 24 types.

2. The CONNECTION LINE COLORS legend documents 10 colors. The data uses **23**.
   Undocumented: #e6c200, #ff8800, #ff6600, #ff0000, #00e5ff, #76ff03, #ff0066,
   #ff3366, #ffd740, #b388ff, #d500f9, #ff6d00, #ff1744.
   This matters specifically for Section XXI, which tells the reader the connective
   tissue is "color-coded by type": its supply lines (#ff6d00), operator lines
   (#00e5ff), ownership line (#d500f9) and customer lines (#ffd740) are all in the
   undocumented set — and three of those four collide with *marker* meanings in the
   legend above (#00e5ff = Submarine Cable, #d500f9 = Animal Testing Lab,
   #ffd740 = Sports/Gambling). The reader decodes them wrong or not at all.

3. The proximity-search dropdown (map.html:624-635) offers 10 of the 24 types. Not a
   bug, but obelisk/military/underground/blacksite/financial/surveillance/
   organized-crime/conflict/museum/governance is a stale subset — `datacenter`,
   `submarine-cable`, `satellite`, `epstein-network`, `sports-gambling`, `capital`,
   `animal-research`, `technology`, `corporate`, `mining`, `airport`, `enclave`,
   `crypto-tech`, `archaeological` can't be proximity-searched.

═══════════════════════════════════════════════════════════════════════
TIER 6 — SOURCING ASYMMETRY (the standard the report sets vs the map's data)
═══════════════════════════════════════════════════════════════════════

report.html:4098 (For Journalists & Legal Researchers): "Every claim traces to a source
that can be independently obtained."

In the map's own data:
- **695 of 1,002 markers (69%) carry no `Source:` line in their ctx.**
  By section: VII 132/181, IX 128/160, X 101/142, XIII 82/104, SPORTS 64/74,
  XIV 41/53, XVI 40/50, XII 37/49, XV 30/42, XVII 27/37, VIII 7/17, XI 3/3, ANIMAL 3/36.
- **18 of 417 connection lines** carry the `[tag] — Source` convention. The other 399
  are bare labels.

The convention is clearly newer than the corpus — the ANIMAL layer is 92% sourced, the
oldest VII/IX/X strata are ~25%. This is not a credibility problem in itself; it is a
mismatch between an absolute claim in the report and a two-thirds-unsourced dataset the
report points readers to. Either soften the sentence ("every claim in this report", or
"map markers are progressively being back-sourced — N% complete") or run a
back-sourcing pass. The honest interim move is the former.

Related: 45% of markers (453/1,002) are touched by at least one connection line.
Section XXI opens "The markers above are not islands." As data, 549 of them currently
are. The sentence is about the *documented* links being real, which is true and
conservative — but it reads as a claim about the whole map.

═══════════════════════════════════════════════════════════════════════
WHAT HOLDS — verified coherent, no action
═══════════════════════════════════════════════════════════════════════

- **Report internal cross-references: clean.** ~490 "Section N" references across the
  body; every one resolves to an existing `<h2 id>`. Zero dead in-page anchors.
- **Section XXI is fully backed by map data.** All 14 named edges exist in
  `connectionLines` with the colors the prose states: 4 membership (white #ffffff —
  Fed, ECB, BoE, PBoC → BIS), 5 supply (orange #ff6d00 — ASML→TSMC, ASML→Samsung,
  Hikvision→IJOP, Dahua→IJOP, Bitmain→Riot), 4 operator + 1 ownership
  (cyan #00e5ff / magenta #d500f9 — Aramco→Ghawar, Glencore→Kolwezi,
  Glencore→Cerrejón, Booz Allen→NSA Utah, WEF→Davos), 4 customer (gold #ffd740 —
  NRO→Maxar/BlackSky/Planet, Clearview→NYPD). The "left undrawn rather than invented"
  caveat is accurate: Rio Tinto, BHP, De Beers, Freeport have no edges.
- **The six-degrees claim reproduces** (see Tier 3.1 — off by one node, not by shape).
- **Editorial tiering holds on the map.** Of 1,002 marker texts, 10 use hard-claim
  vocabulary (blackmail / Mossad / asset / false flag / mind control); on inspection all
  10 are documented history (Northwoods, Ajax, Bologna, Munich, Black Cube) or are
  explicitly hedged. No living private individual is assigned a criminal or
  intelligence role in map ctx — the standard report.html:683 sets for the layer.
- **Integrity manifest: PASS.** `node linguistic-integrity.js verify` matches
  (hash 152e145d…, generated 2026-08-18T04:16Z). Pattern scan flags 3, all inside the
  editorial-integrity note and the attack-vector page — i.e. the false positives the
  tool's own note anticipates.
  *Gap worth noting:* LIV covers `site/report.html` only. `site/map.html` — 1,002
  marker texts, 702 KB of prose — has no integrity coverage at all, despite commit
  9aaa392 being titled "regenerate content-integrity manifest (map update)". The
  manifest doesn't hash the map; it re-hashed the report because the report changed.
- **i18n key wiring is sound.** All 39 `data-i18n` keys used across report/map/index
  are defined in the EN dictionary. (UI-string translation *coverage* is partial —
  139 EN keys vs 34-65 per language — but nothing is missing that is referenced.)
- **Translated section slugs match exactly**: 16 `data-sect` values ↔ 16 files ×
  11 languages, no orphans either way. Only the routing is broken (Tier 1.4). Sections
  II, III, IV, V, VI, XX, XXI carry no `data-sect` and are English-only by design.

═══════════════════════════════════════════════════════════════════════
FIX ORDER (cheapest structural win first)
═══════════════════════════════════════════════════════════════════════

1. Add `html` to the static-asset regex, scoped to `/i18n/` → unlocks 176 committed
   translation files. One line, server.js:209.
2. Normalize the tones links to the registered paths (or add slash-form aliases to
   `PAGES`) → fixes the report's own nav bar. ~6 hrefs.
3. Either implement `/api/data` + `/download` or remove the three promises that point
   at them. `/api/data` is ~15 lines (the arrays are already parseable JSON-ish
   literals) and is the single highest-value thing on this list for the report's
   stated researcher audience.
4. Fix the popup anchor map: `ANIMAL → XIV`, and decide SPORTS (Tier 2.1).
5. Update 157→158, 220→222; make "1,000 locations" read "1,000+"; derive
   `SECTIONS:` from the data.
6. Merge the 11 duplicate pairs; resolve the ASML €150M/€350M contradiction explicitly.
7. Add `epstein-network` to the marker legend; add the 13 missing connection-line
   colors (or at minimum the 4 that Section XXI depends on).
8. Delete the dead `XXII` filter checkbox.
9. Soften "every claim traces to a source" to match the 31%-sourced reality, or start
   the back-sourcing pass with the two worst strata (VII, IX).
10. Longer job, worth scheduling: re-home the 34 university markers out of IX, and
    decide whether `capital` deserves its own section rather than riding in ANIMAL.
