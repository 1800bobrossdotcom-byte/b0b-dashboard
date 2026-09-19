# b0b-dashboard — operating memory

**This file exists because the assistant has none.** Every session starts blank. Nothing
said in conversation survives. If it is not written here or in a commit, it did not happen.
Read this first, every time.

**Author and director:** Gianni Arone (b0b.dev). He sets scope and adjudicates every
contested call. The assistant researches, verifies, drafts, deploys, and is wrong often
enough that its disagreement is not authority — see §5.

---

## 1. WHAT THIS IS

`site/report.html` — a ~1.4 MB OSINT report at https://www.b0b.dev/report. 24 numbered
sections plus a researcher's guide.

It is **two things at once and both are load-bearing:**

1. **A documented record** of institutional failure around the Epstein–Maxwell network and
   the wider control architecture — sourced, tiered, and checkable.
2. **A work of art.** A decades-spanning installation in which **the method is the
   content**: the tiering, the published nulls, the specimens killed on the page. The second
   is what makes the first credible. A document that kills its own specimens can be trusted
   about the ones that survive.

*Amended 12 Sept 2026: this used to read "corrections printed on the page rather than made
silently." The author had the revision-history notes stripped — see §7. **Corrections are still
made and material ones are still disclosed; what is gone is the narration about the report's own
drafts.** Do not re-add "an earlier version of this passage said X" prose.*

**Real operators read this. Some may act on it.** That is the reason for the discipline,
not a reason to soften it. Accuracy is the safety mechanism. Anything that would get a
reader prosecuted, discredited, or killed does not go on the page — which is why the
servicemember section (Section XXIII) leads with the lawful channels and states plainly
what is a crime regardless of motive.

---

## 2. STANDING CONSTRAINTS — non-negotiable, carried verbatim

- **Living-person floor.** No living, uncharged person is asserted or implied to be a
  criminal or an intelligence asset. Documented affiliation is never an operational tie.
- **"Leave the CIA already has it off."** Do not publish that claim.
- **Never publish** the `©ART` videographer name from EFTA01600824, nor the Deutsche Bank
  banker's name (Stewart Oldfield). *A second DB individual surfaced 31 Aug 2026; whether
  the rule extends to him is the author's open decision — nothing published pending it.*
- **Never de-anonymise a DOJ redaction** on a living person.
- **Addresses: streets only, no house numbers** for residences. Public monuments and
  institutions carry their civic address (George Izay Park, 1111 W Olive Ave).
- **No numerology.** House numbers, dates and digits are recorded as facts and never read
  for meaning. This applies to the author's own addresses exactly as it applies to
  strangers' — a rule that only bites strangers is not a rule.
- **"Crown" is never used for the top of a man-made structure.** Not pyramid, capstone,
  obelisk or institution. Surviving instances are names only.
- **Stop rules when reading documents:** (a) substantially imagery → stop, delete, do not
  view; (b) FD-302 / victim interview / protective-order stamp → stop at identification, do
  not read on, do not retain; (c) a hex32 id is a research lead, never a citation.
- Documented-only autonomous deploys. Hold anything defamation-adjacent or contested.
- **No subject-shielding disclaimers.** Author's instruction, 5 Sept 2026: sentences whose
  function is to reassure the reader on a subject's behalf - "no crime is alleged against
  him", "X is living and uncharged", "nothing here alleges anything against him", "not an
  allegation of wrongdoing", "he has not been charged" - are removed report-wide and are
  not to be re-added. They read as defending the people the report documents. The
  living-person floor is about what the report *asserts*; it does not require reassurance
  boilerplate. State what the record shows, state the tier, stop. Tier statements about
  the *evidence* ("not established", "attributed", "documented") stay.

---

## 3. THE NAMED RULES the report runs on

Learn these; they are invoked by name on the page.

- **Guaranteed-null rule** — a claim confirmed by every possible outcome is confirmed by
  none. Secrecy is evidence of nothing about what is hidden.
- **Anti-map guardrail** — a shared timeline is not a chain.
- **Symmetry rule** — a discount applied to a fact that hurts a hypothesis must be applied
  to one that helps it. Watch for the ratchet running toward the preferred conclusion.
- **Unfalsifiable machine** — a test that cannot come out against the tester is not a test.
- **Naming error** — mistaking the sign for the thing named. Two families collapsed into
  one; an emblem read as the claim.
- **Tiering** — documented / attributed / labeled / contested / unsupported. **Rung 4 =
  deniable asset; rung 5 = tasked and run, and rung 5 is claimed for no one.**
- **Testimony tier** — evidence of an experience, never evidence of a cause. Promoted out
  only by a document, never by accumulation.

---

## 4. DEPLOY PIPELINE — in this order, no steps skipped

1. `git fetch origin main` first.
2. Tag balance → duplicate ids → dangling anchors.
3. Per-section `sect-toc` audit: label count == `<li>` count == `<h3 id=` count.
4. Inline-JS via `node --check`, **skipping `type="application/ld+json"`** (validate that
   as JSON separately).
5. Update the scale line. Subsections = `<h3 id=`; paragraphs = `<p[\s>]`; sourcing =
   `<span[^>]*>Sources:` **+5 offset**.
6. `python3 scripts/build-concordance.py`
6b. `python3 scripts/build-transmissions.py` — refreshes the home-page film reel from the
   ERC-1155 YouTube feed (15 most recent, the feed's ceiling) and the curated `vimeo_ids` in
   `scripts/transmissions.json`. **Vimeo is by id on purpose**: the same account carries client
   and spec work that is not this site's subject. On any fetch failure it leaves the reel
   untouched and exits non-zero; `--offline` rebuilds from the cached `entries`. Owns only what
   sits between `<!-- transmissions:begin/end -->` in `site/index.html`.
7. `node linguistic-integrity.js generate && verify` → must print **STATUS: PASS**.
   **Order matters:** the concordance re-stamps `dateModified`, so the manifest is
   regenerated *after* the concordance build.
8. Push branch **and** `HEAD:main`.
9. `node scripts/check-live.js --wait` — **it compares only the manifest's `generated` stamp,
   which moves only when `report.html` changes.** A deploy touching just `index.html`,
   `server.js`, `theme.css` or the map passes it immediately while the *previous* build is
   still being served (seen 19 Sept 2026: four "clean" reads of the old home page). For those,
   poll the changed page for a string that exists only in the new markup before step 10.
10. Gated curl on actual content — **four consecutive clean reads**.

**Traps that have bitten:**
- **The meta blocks in `report.html` and `map.html` are GENERATED from
  `scripts/seo-meta.json`.** Editing the HTML directly looks like it worked and does not
  survive the next build. Only the live check catches it.
- **The gate intercepts static assets too.** Un-cookied fetches of `/signal-bar.js` return
  the 8,607-byte pixel gate as `text/html`. Gate cookie:
  `POST /api/gate -d '{"answer":"7"}'` with a jar.
- **Static assets are only gated while cold.** `express.static` sends
  `Cache-Control: public, max-age=3600` with no `Vary` on the access cookie, so the first
  cookied fetch of an asset populates the edge cache and un-cookied clients get the real
  file on that URL for the next hour. Verified on `/signal-bar.js` and `/map.kml`.
  **When verifying that something is gated, always add a cache-buster query string** — a
  warm URL will lie to you. Not treated as a defect: `security.txt` already says the gate
  is a threshold, not a credential. Flagged for the author, unchanged.
- **The static route serves a fixed extension allowlist** in `server.js`. A new asset type
  404s live while looking perfectly fine in the repo — `.kml` did exactly that.
- **Section I has no static sect-toc** (JS-generated). Sections II, IX, XIII and others do.
- **DOJ fetch:** `Cookie: justiceGovAgeVerified=true` + browser UA. Akamai rate-limits with
  **HTTP 401, not 429** — use `--fail`, back off 5/15/35/60/90s.
- **jmail API** 307-redirects www→apex; `curl -sL` required. Its `total` field is
  unreliable (returns 1000 for unrelated queries) — never cite it. Quote the phrase for
  exact-phrase search and re-filter results in-script.

---

## 5. ASSISTANT FAILURE MODES — verified, recurring, not hypothetical

Recorded so they are caught earlier next time. Each has happened.

1. **Drift toward agreement.** Under long collaboration it flattens toward what the author
   wants and then has to reverse. It has also done the opposite — doubting him when he was
   right (the ISR Fort Meade wing assignment; the Trump defence-holdings trades). **Both
   directions are the same defect: deference to the conversational gradient rather than to
   the record.**
2. **Over-writing.** It stacks corrections on top of corrections until the apparatus
   swallows the content. The TENET passage reached 1,785 words of mostly self-explanation
   before being cut to ~1,075. **A correction should replace, not accumulate.**
3. **Smuggling meaning through word choice.** "Speculative capstone", then "not on its
   crown" one sentence after removing "capstone"; setting *grip* against *hold* and handing
   the harder verb to the adversary. The report's own term for this is **linguistic
   phreaking**, and the assistant has committed it repeatedly.
4. **Protective hedging that reads as distancing.** The Sir Aaron Bushnell disclaimer was
   the assistant managing its own exposure, not serving the record. Removed at the author's
   instruction. **Do not append disclaimers to the author's testimony that he did not ask
   for.**
5. **Getting the law wrong while sounding certain** — the "dead man's switch" claim. Privacy
   Act rights do not survive death; FOIA Exemptions 6/7(C) extinguish at death.
6. **Asserting from one source and stopping.** Falsified its own Babylon specimen within
   hours because it had scanned only the email layer.
7. **Destructive edits while doing something else** — deleted `AECA` from the masthead while
   asked only to *add* the Donovan line, breaking two live cross-references for hours.

**Standing instruction to the assistant: when the author pushes back, check the record
before defending. He has been right materially more often than not.**

---

## 6. TONE

Direct. No preamble, no therapeutic register, no ceremonial self-criticism. State the
finding, state the tier, state the limit, stop. He has asked for this explicitly and more
than once.

---

## 7. OPEN AT LAST WRITE — 12 September 2026

**THE SITE OPENS ON THE REPORT; THE GATE IS OFF; THE PERIOD BAR IS GONE — 19 Sept 2026, three
author instructions in one hour, all live.** (1) *"site should start here, no longer do the 4
videos"* — `pixel.html` (the click-gate, with four autoplaying YouTube embeds) is **off by default;
`B0B_GATE=on` restores it.** `hasAccess()` returns true for everyone when off; robots.txt still
keeps crawlers off `/download` and `/api/`. **`security-selftest.js` and `seo-selftest.js` set
`B0B_GATE=on` themselves** so the mechanism stays tested — do not read a passing run as proof of
what production serves; verify production with a cookie-less, cache-busted curl. (2) *"have it
actually land directly on the report as the opening page"* — **`/` serves `report.html`** (its
canonical stays `/report`, so search sees one page; the Search Console tag is now on the report
too). **The film-reel landing page moved to `/home`** (`PAGES`, `CANONICAL_PATHS`, and the
`index.html → /home` entry in `scripts/apply-seo-meta.js`), reachable from a **FILMS** button in
the report sidebar. LOGOUT removed from home and sidebar; `/logout` still works. *A 302 was tried
first and rejected: with the gate on it broke the "crawler-served homepage carries the
verification tag" check, and a served page beats a redirect for the verifier anyway.* (3) *"take
off that large time period bar on the map"* — the `.time-scrub` control **and its filter
machinery** are gone; `date`/`dprec` stay because they drive the KML time slider; the KML link sits
beside RESET. **The machinery had to go, not just the control: `TS_MIN=1545` was silently hiding
Museo del Prado (1520) — 1181/1182 shown.**

**MAP LABELING AUDIT — first pass, 19 Sept 2026. Dates were the worst class, and they were mine.**
The 12 Sept extractor took the *earliest* year on the line. **All 161 mass-shooting markers were
dated 1982 — the start of the Mother Jones coverage span "(1982-2026)", not the shooting.** Tehran
1953 was dated 1979; the Ukraine war 1945 ("since 1945"). **`scripts/date-markers.py`** now derives
every date with rules that survived review (dry-run, then `--write`, idempotent): full dates win;
the year in the *name* beats the paragraph; retrieval/edit stamps (`accessed`, `as of`, `ADDED /
CORRECTED / QUALIFIED 31 Aug 2026`) are stripped first; a span ending at the present keeps only
its start; `since/until/as early as` years are demoted, **but `founded/opened/built` years are
first-class** (CCF Paris is 1950, not its 1967 exposure). **273 changed; 820 dated, 362 undated,
unchanged totals.** *Rewrite trap: names hold `\'` in source — match `(?:\\)?'` — and the head
pattern must refuse to run past an existing `,date:` or the old field is kept and a second
appended.* **Other findings, held for the author (not errors on their face):** 18 markers typed
`capital` sit in section ANIMAL — they are the disclosed institutional holders of Charles River /
Marshall BioResources, deliberate; **30 co-located pairs**, most legitimately two sections for one
site (Vatican square/archive, Harvard Law/University), but six are the *same event twice* across
VII and XV (Tehran 1953, Guatemala 1954, Santiago 1973, Menwith Hill, Pine Gap, Svalbard) — merge
or keep is editorial; a **reverse-geocode pass (Nominatim, 1 req/1.2 s, identified UA, cached in
`scratchpad/revgeo.json`)** was running to test name↔coordinate agreement and had not finished.
*Shell trap: `pkill -f "http.server 8815"` matches the shell running the command and kills it
(exit 144) — start a fresh port instead.*

**HOME PAGE REBUILT AROUND A FILM REEL; REPORT SET IN PLEX SERIF — 19 Sept 2026, live.** Author's
ask: *"put the videos on the home page in a carousel and redesign the report and website for
readability."* **There were no videos on the site at all** — "the videos" are the **ERC-1155
YouTube channel** (15 films, read from its public RSS feed `youtube.com/feeds/videos.xml?channel_id=
UCFDLK0U42dTD1n6MBhWM6qA` — the channel id is `"externalId"` in the handle page, not `channelId`) plus
**one Vimeo music video, 1228401790, "nearest neighbor | visitor"**, uploaded the same day. Home page
(`site/index.html`, fully regenerated) now: top bar + nav, serif lede, side index, **TRANSMISSIONS
reel of 16 cards, newest first** — each card is a plain link until clicked, then swaps in the
player (`youtube-nocookie` / `player.vimeo.com?dnt=1`), one at a time; scroll-snap, arrow buttons,
keyboard, live counter, `prefers-reduced-motion` honoured. **CSP now admits `player.vimeo.com`
(frame/child) and `i.vimeocdn.com` (img)** — a new embed host is always a CSP edit in `server.js`.
**Fonts:** IBM Plex Mono + Serif were already self-hosted in `site/fonts/` (OFL) but declared only in
the concordance page; **now declared once in `theme.css` with `--mono` / `--serif` tokens.** The
report got a **readability layer appended after its original stylesheet** (serif 17px/1.68, ~72ch
measure, mono for headings/labels/sidebar/controls, callouts as left-rule panels; palette and
markup untouched). *Verification traps:* **headless Chromium clamps the window to 500px wide and
crops the image to the requested 420** — the "text cut off on mobile" was that, not the site;
**Vimeo's oEmbed and player URLs 403 this egress IP (`MW-BL`), the old `vimeo.com/api/v2/video/ID.json`
endpoint works** for title/thumbnail; **`theme.js` mounts the light/dark toggle by selector list
(`TARGETS`)** — new page markup needs its nav added there or the toggle silently disappears; and
`node_modules` is not installed in a fresh clone — `npm install` first, then `security-selftest.js`
(33/33) and `seo-selftest.js` (47/48; the failure is the pre-existing 84-char concordance title)
run in-process with no network.

**THE NEW CAPITAL'S CAMERAS ARE HONEYWELL'S, NOT HUAWEI'S — 18 Sept 2026, published, and it
corrected an error of our own.** The author asserted *"China ZTE Huawei funded the cameras."* The
page itself carried *"Hikvision cameras in NAC"* in the Section X network-map bullet — **unsourced,
and wrong for the NAC.** The record: **Honeywell (US) signed with ACUD on 25 Feb 2019**, in the
presence of the US Chief of Mission, to integrate **6,000+ IP cameras into one Integrated Command
and Control Centre** with partner MTI; **e& Egypt** (Emirati state carrier, ex-Etisalat Misr) worked
with Honeywell on the City Operations Center; **Orange** runs the NAC data centre. **The primary on
exactly this question — Wakabi & Roberts (eds), IDS, *Smart City Surveillance in Africa: Mapping
Chinese AI Surveillance Across 11 Countries*, 12 March 2026, DOI 10.19088/IDS.2025.068 — says it
in one sentence (p.27): *"In the case of Egypt, the US company Honeywell takes the place of
Huawei."*** Same report: the Chinese package (Eximbank ~US$250m soft loan tied to Hikvision cameras
+ Huawei/ZTE control centre, p.12) is the **continental norm and Egypt is the named exception**;
Hikvision/Dahua are deployed by Egyptian authorities **nationally** (Masaar 2023, p.79), not in the
NAC grid; Huawei in Egypt is documented for **5G with Telecom Egypt** (p.79). **ZTE: zero, any
tier.** Live and worth watching, not asserting: **Aug 2026 Huawei bid** on a government tender —
~2,000 Ascend chips for AI clouds with military/security/surveillance end users, alongside iFlytek
(US Entity List 2019), individuals-and-vehicles-against-national-databases; State reported to have
approached Nvidia/AMD/Microsoft for a rival consortium (Bloomberg via EnterpriseAM, 26 Aug 2026).
*Network-map bullet rewritten; a fourth paragraph added to the Octagon subsection; NAC bullet now
attributes the cameras. Scale 271 / 1,060 / 124.* **Tooling:** the IDS PDF came via the Figshare
public API (`api.figshare.com/v2/articles/31646347` → `ndownloader.figshare.com/files/62639779`)
because the OpenDocs landing page answers plain clients with an empty 202; the ledger row's sha256
matches the bytes read locally. **The container's `cryptography` package panics on import
(`_cffi_backend`), which breaks pypdf *and* pdfminer; `scratchpad/pdftext.py` stubs the module
before import — fine for unencrypted PDFs.** Zawya (400) and Arab Weekly (403) refused the
identified crawler and are recorded as nulls; the page cites only hosts the ledger holds.

**THE OCTAGON AND TURA-MASARA ARE NOW PUBLISHED — 18 Sept 2026. Section X, two new subsections,
toc 21 → 23 parts. Scale line 271 / 1,059 / 123.** The author asked why this "keeps getting
excluded." **It was not excluded — the Octagon was already on the page twice** (the New Capital
entry in X, and the replicated-names entry in XI) **and on the map.** What was genuinely missing
was **Tura**, which existed only as a bare cross-reference label, *"Tura Quarries → NAC Geological
Continuity"*, with nothing behind it. **Check the page before accepting that something is absent
from it.**

**The funding triad he asked for — US, Israel, China — was published as a three-way test, because
it fails three different ways:**
- **US: documented aid, mechanism forecloses the claim.** $1.3bn/yr FMF since 1987, but under the
  **Arms Export Control Act** it sits in an interest-bearing account at the **Federal Reserve Bank
  of New York**, never transfers to Egypt, and is paid to **US contractors** for US-origin articles.
  **The dollars cannot buy Egyptian concrete.** Fungibility is arguable and is printed as inference.
- **China: documented for the CBD, absent for the Octagon.** Sept 2015 CSCEC memorandum, Iconic
  Tower — already on the page. Chinese analysts *write about* the Octagon; that is not financing.
- **Israel: nothing at any tier, and this is the instructive null.** The Israeli material in the
  record is the *Jerusalem Post* asking whether Israel should fear it, *The Media Line* asking
  whether Israel should be concerned, and *Times of Israel* reporting the ribbon. **Israel is the
  worried audience, not the funder** — a naming error whose search results look exactly like
  corroboration at a glance, which is why the null is printed rather than dropped.

**Octagon particulars, documented:** official name **State Strategic Command Center**, inaugurated
**July 2026**, **22,000 acres / 89 km²**, 13 zones, ~1,160 acres floor area, eight buildings; the
Pentagon is one building of ~29 acres. **Map coordinates were ~13 km off** (30.0197,31.7636 →
**29.937917,31.653917**) and typed `surveillance` rather than `military`. *Earlier in that check I
said the marker was duplicated; it was not — the regex matched "Octagon" twice inside one entry.*

**Tura-Masara, documented and strong:** ~6 km of **underground galleries** (tunnelled, with
limestone pillars left to carry the roofs) on the Nile's east bank, ~12 km south of Cairo and
**west of the Octagon**; source of Khufu's casing stone, ~**67,390 m³** for that monument alone;
**mapped for the British military in WWII as bomb-proof storage**; now the **Tura cement works
under Heidelberg Materials**. The entry states plainly that **continuity of use is not continuity
of purpose** and applies the anti-map guardrail to our own material. **Map now 1,182 markers, 820
dated** — and the `1,181` counts lived in **`scripts/seo-meta.json`** (4 of them), not the HTML.

**SOURCE SPIDER — `scripts/spider/spider.py`, built 15 Sept 2026. Use it instead of ad-hoc curl
for anything that will be cited.** `fetch` / `crawl` / `verify` / `ledger` / `text`. Every fetch
appends one row to `research/sources/ledger.jsonl` (committed) with URL, final URL, timestamp,
status, content type, length, **sha256** and cache path; bodies go to `research/sources/cache/`
(gitignored, keyed by hash). **`verify` re-fetches and reports unchanged / changed / gone /
refused** against the recorded hash — run it before publishing anything that cites a live page.

*It was asked for as "spider bots that occlude themselves." That half was declined and the reason
is recorded in the code:* **one identity always, robots.txt obeyed, no UA or address rotation, no
proxy pools, no challenge solving, no retrying a refusal under a second name.** This site runs its
own gate and crawler allowlist, so disguising ours to beat someone else's is the rule that only
bites strangers (§2). The practical case is stronger: **a document obtained by defeating an access
control has contaminated provenance, and provenance is the whole asset.** Therefore **a refusal is
a finding** — 403, 401 and robots-disallow are written as nulls exactly as successes are, and
`ledger --nulls` groups them by host, which is the input to a records request.

**THE DECOY RULE — the most useful thing in it.** *A 200 that is really a refusal is the most
dangerous outcome available, because nothing downstream questions it.* Two live cases, both
`200 text/html`: `cia.gov/readingroom` returns its homepage for every document id, and **our own
gate returns the 8,607-byte pixel page on every path**. `hosts.json` registers decoys by title,
byte length or sha256 and demotes the match to `decoy_200, ok:false`. Both are verified in the
seeded ledger. **`hosts.json` carries documented access requirements only** — age-gate cookie,
slower pace, known redirect — each with a `why`, and **the loader exits if an entry tries to
override the user agent.**

**THE SOUTHERN AIR TRANSPORT CLAIM — tested 15 Sept 2026, unpublished.**
`research/EPSTEIN-SOUTHERN-AIR-TRANSPORT.md`. The claim: Epstein negotiated the contract to move
*"the CIA's proprietary airliner"* to Rickenbacker and was *"the authorized signatory."*
**The adjacency is documented; the claim as stated is not.** (a) **The CIA sold SAT at the end of
1973** — in 1994 it was James Bastian's private company, so the claim's own rhetorical question
("how would you convince the CIA to move its proprietary?") describes an act with no counterparty;
the documented mechanism is Ohio outbidding Miami with a $6m loan, a grant and a fifteen-year tax
exemption. **The article the claim derives from states the 1973 sale in its own third sentence.**
(b) **"Signatory" has no document** — the chain ends at a journalist's recollection of what two
former Ohio officials said verbally, and the word "signator" appears **zero** times in that
reporting. What is documented is the *capability*: Wexner's **July 1991 durable power of attorney**,
filed in Franklin County. (c) The Khashoggi bridge is a single **1987** boast about *finding* money,
dated after the arms purchases it is invoked to explain.
**Corpus null, clean:** Southern Air Transport **0**, Air America **0**, Hasenfus **0**,
Iran-Contra **0**; "Contra" 39, every one "contract" or "contra offer"; **"Rickenbacker" exactly one
— the _Causeway_ in Miami, in an email about the Seaquarium dolphin programme**, which is a keepable
naming-error specimen; "Adnan Khashoggi" exactly one, and it runs against the thesis.
**Primary read directly:** CIA IG, *Allegations of Connections Between CIA and the Contras in
Cocaine Trafficking*, **Vol II, 8 Oct 1998** — SAT sits under *"Other Companies Associated With the
Contras"*, not proprietaries, and carries exactly two allegation records (Gates memo 21 Jan 1987;
DEA cable 23 Feb 1991, "of record" Jan 1985–Sept 1990). **Symmetry: that DEA window is real and
adverse — do not discount it because the Epstein claim is overstated.**
**New environment limit: `cia.gov/readingroom` returns its homepage for every `node/` and `print/`
document id from here**, exactly like web.archive.org. Anything sourced to it is attributed, not
primary, until pulled elsewhere. **Naming error now circulating: SAT was *not* "formerly Air
America"** — separate companies under the same Pacific Corporation holding.

**MAP SEARCH TAKES MULTIPLE WORDS — 14 Sept 2026.** Both boxes matched the entire input as one
substring, so **`epstein island` returned nothing while `epstein` returned 28 and `island` 97.**
The location search and the pattern-connection search now share one parser: **every term must
match (AND)**, `"quoted phrases"` match as one string, a leading `-` excludes, and list commas are
dropped (`palantir, cia`) while `9/11` and `u.s.` survive intact. Terms match name, context,
section, type **and date**, so `obelisk paris` and `II 2003` work without touching a checkbox. The
haystack is cached per marker — the filter runs on every keystroke. Verified across fifteen
queries. *The placeholder was `e.g. Palantir, CIA, obelisk...`, which advertised an OR the code
never had; it now shows the real syntax.*

**THE REPORT SEARCH TAKES MULTIPLE WORDS TOO — 14 Sept 2026, same defect, same fix.**
**The report's search is not in `report.html` at all — it is `site/report-search.js`, injected into
the sidebar at runtime.** Grepping `report.html` for `searchInput` or `placeholder=` finds nothing
and I wrongly told the author the report had no search. **Look in `site/*.js` before concluding a
UI does not exist.** Same parser as the map, with one difference that matters: **the AND is scoped
to a block** (`p, li, h3…`), so `epstein mossad` means both words in the same paragraph, not
merely both somewhere in a 1.4 MB document. Inside a qualifying block **every occurrence of every
term is a steppable match in reading order**, so the ▲▼ buttons and the `1 of N` counter keep
working. Positive terms under `MIN_CHARS` are ignored rather than matching everything, so
`epstein e` behaves as `epstein` while the second word is being typed; a query of nothing but
exclusions renders nothing, because it would select almost the whole report. Live numbers:
**epstein 786, mossad 53, `epstein mossad` 57 in 6 sections, `mossad -epstein` 31,
`carbyne, axon` 8, `"guaranteed-null"` 3.**

**MAP: DATES, A PERIOD SCRUBBER, AND A KML EXPORT — 12 Sept 2026.** `site/map.html` markers now
carry `date` (ISO, as precise as the source allows) and `dprec` (`day`/`month`/`year`), parsed from
each marker's own `ctx` text: **819 of 1,181 dated — 63 day, 47 month, 709 year — and 362 undated.**
Range 1545–2026. A `.time-scrub` control filters on it; **undated markers are included by default
and the hidden count is printed in the stats bar**, so narrowing a period never silently drops a
third of the corpus.

*Two extraction traps, both hit:* sorting candidate tuples lets a bare year `(y,1,1,'year')` beat a
specific date in the same year — find the earliest **year** first, then take the most precise
candidate inside it. And "Vision 2030" parses as a date — guard with a lookbehind for
`(vision|agenda|horizon|goal|target|plan)\s*$` and cap at 2026.

*Pipeline trap, new and generic:* **`var` hoisting made the first `applyFilters()` read
`tsFrom`/`tsTo` as `undefined`, and every marker failed the range test — 0 of 1,181 shown.** The
page looked built and was empty. Time-range state is now declared **above** marker creation. The
lesson is the diagnostic, not the fix: a headless `--dump-dom` run with a `<pre>` that JSON-dumps
live state (`allMarkers.length`, per-predicate match counts, `markerLayer.getLayers().length`)
found it in one pass where a screenshot only showed the symptom.

**Google Earth: the answer is KML, not the Maps API.** `scripts/build-kml.py` generates
`site/map.kml` from the `locations` array — 1,181 placemarks, 16 folders, per-type styles, and
`TimeSpan`/`TimeStamp` on the 819 dated ones **so Earth's own time slider runs off the same dates
as the site scrubber**. Linked from the scrub panel. **Photorealistic 3D Maps / Map3DElement was
rejected**: it needs a billing account and a referrer-restricted key exposed client-side on a public
page with unbounded session billing, and it would mean rewriting the ten live Leaflet feeds. *Parser
note: the `locations` literal is not JSON — it has `//` comments containing apostrophes (which open
a phantom string and truncate a naive bracket-matcher), bare keys, and `\'` inside double-quoted
strings (legal JS, illegal JSON). `build-kml.py` walks it character by character; do not regex it.*

**MapLibre GL 5.6.0 was vendored and then removed unused.** A renderer swap is a separate decision,
not part of the in-place upgrade.

**THREE TROPE PASSAGES KILLED, IN OUR OWN VOICE. This was the worst error class on the page.**
Found by the banking-families research line, each verified against the page before editing:
(a) Section VII closed the Fed material with *"The same banking dynasties that created the
institution in secret still operate it 113 years later. The chair rotates. The families do not."*
**It fails against the report's own list** — the succession printed directly above it contains no
banking dynasty. Paul Warburg sat on the original Board as vice-governor 1916-1918, **was never
chairman**, died 1932. The documented institutional revolving door stays; the hereditary
conversion is gone. (b) Section XX told the reader to *"note the Warburg name"* — Warburg Pincus
has been a private partnership since Lionel I. Pincus & Co. acquired E.M. Warburg & Co. in **1966**.
(c) Section VI cross-referenced *"the Rothschild banking network documented in Section VII"*;
Section VII carries **one** Rothschild sentence, about an 1825 gold loan. Replaced with the real
five-house record including **Vienna seized after the March 1938 Anschluss**, which cuts against
the use the material is usually put to. **Do not re-add any of the three.**

**The four held errors are fixed** (Mirror Group 1994, Burns, FBI Urban Moving). **Burns was wrong
in six places and three ways**: Deputy Secretary of State 2011-2014, Carnegie 2015-2021, CIA
2021-**2025**. The 2014 Epstein meetings fall in his State tenure, and he no longer holds office,
so listing him under "active desks" was stale. **The DEA art-students item was NOT an error** —
the memo is a 60-page June 2001 document of the DEA's Office of Security Programs and its own
speculation is *"organized intelligence gathering activity"*, stronger than what we printed.
Holding it pending verification was right.

**Gate/crawler fix, `server.js`.** The allowlist admitted search indexers (OAI-SearchBot,
PerplexityBot) but gave the 8,607-byte pixel gate to **user-directed fetchers** — ChatGPT-User,
Claude-User, Perplexity-User — i.e. the indexer that helps someone find the report was in, the
fetcher that lets them read it was out. Added those three plus Claude-SearchBot. **GPTBot, CCBot
and ClaudeBot stay out** (training). Verified live across ten user agents; `/download`,
`/api/data`, `/api/visitors` still cookie-only. `B0B_CRAWLER_RE` overrides without a deploy.
*Caution recorded: I first attributed an outside model's failure to read the report to this gate.
It had no URL-fetch tool at all. The fix was right; the attribution was not. Confirm the
mechanism before blaming it.* **Site SEO is clean** — `node scripts/seo-check-live.js` passes all
seven checks, /report is in the sitemap, canonical and description are correct.

**RESEARCH LANDED, UNPUBLISHED — `research/` files pending, four lines on the intelligence-to-capital
pipeline.** The framing finding: **the report carries the club layer heavily and the money layer
barely** — CFR 130, Trilateral 65, Bilderberg 44 against In-Q-Tel 2, Booz Allen 3, Check Point 1,
and zero for Cellebrite, Team8, Cyberstarts, Paladin, Temasek. **That is backwards.** A shared club
is the weakest evidence; a cap table, a contract award and an export licence are documents.
- **Israel line:** the 8200 founder pipeline is **real, self-published and nearly worthless as
  evidence** — EDGAR full-text 2001-2026 yields **one** major Israeli cyber firm stating an
  executive's 8200 command (Check Point 20-F, Nadav Zafrir). **Zero** in Palo Alto's FY2025 proxy
  and FY2026 10-K, zero in Cellebrite's 20-F, zero for Gil Shwed. **What actually binds these firms
  to the state is the export licence** — DECA, Defense Export Control Law 5767-2007 (the page has
  **zero** mentions of it; this is the real gap). NSO's US sale still required DECA approval.
  New capital layer: CyberArk→Palo Alto $21.1bn (11 Feb 2026), Wiz→Alphabet **$29.5bn** filing
  figure (11 Mar 2026), Carbyne→Axon $625m — **the page already carries Carbyne→Axon.**
  Killed: Cellebrite's largest owner is SUNCORPORATION (Japan) 42.52%, no Israeli state equity.
- **Families line killed:** "$500 trillion" (exceeds all household wealth on Earth); "privately
  owned Fed" (12 U.S.C. §287 bars transfer of Reserve Bank stock); *Lewis v. United States* (an
  FTCA car-accident holding); "owns most central banks" (BIS private shareholding abolished
  8 Jan 2001, 72,648 shares at CHF 16,000). **Survived:** Wallenberg/Investor AB (KAW 20.1% of
  capital, 43.0% of votes; foundations 50.2%) — the best-documented family control of listed
  industry anywhere, and entirely public.
- **PIPELINE WARNING, important:** WebFetch's summarising model **returned confidently fabricated
  figures from two Rothschild PDFs**. Never let a model summary of a filing reach the page —
  extract the PDF text locally and read the number yourself.

---

### Still open from 11 September 2026

**EDIT NOTES ARE GONE FROM THE PAGE. DO NOT RE-ADD THEM.** 12 Sept 2026, author's instruction:
the revision-history narration was "lengthy and distracting and confusing." **33 edit notes plus
the Section XVI `EDITORIAL CORRECTION` box were removed.** The rule now: **when a claim is wrong,
fix the claim. Do not write a paragraph about having fixed it.** Every corrected fact was kept —
the Park Report chronology, the Ben-Menashe sourcing, the 2003 documented-contact floor, the
Zorro acreage, the DUMB over-claim — each now simply states itself. Banned phrasings: "an earlier
version of this passage/entry/box", "an earlier draft", "this report first/previously said",
"corrected here", "recorded rather than made silently". **Kept deliberately: the two Anthropic
supply-chain disclosures**, which are provenance about who helped draft the report, not
corrections. *This supersedes the old §1 line about corrections printed on the page.*

**Redundancy pass, same day.** Paragraph-level dedup was already clean — one near-duplicate pair
in 2,267 blocks, and it is a prose entry against an index entry, which is correct. Four set-piece
restatements were cut: the Carbyne concealment argument (made twice in Section II with the same
lawyer quote; the first now points to test two), the "Wexner, Barak and Acosta appear above as
documented participants" tier boilerplate (verbatim in two closing paragraphs), the "what has
been running since 2013 that will be disclosed in 2040?" question (posed three times inside one
Section XIII subsection), and the masthead's what-to-send list (duplicated Section XXIV's).
**Scale line now 269 / 1,051 / 121.**

**Useful redundancy tooling, worth reusing:** normalise every `<p>`/`<li>` to text, build 5-word
shingle sets, flag pairs with Jaccard ≥0.30; separately, count repeated 12-to-14-word spans over
tag-stripped prose with `<script>`/`<style>` removed first. The n-gram counter double-counts
across inline markup, so **confirm every hit with `re.finditer` on the raw HTML before cutting.**

---

### Still open from 11 September 2026

**THE SPONSOR QUESTION IS SETTLED ON THE PAGE. DO NOT RE-HEDGE IT.** 11 Sept 2026: the author
found that Section II's conclusion paragraph said the report *"does not name a sponsoring
service"* while Section II also carries **"Primary and liaison — Mossad directing, with CIA and
British services witting."** Both were written 28 Aug 2026 and never reconciled. Mossad was never
scrubbed — 54 instances, its own subsection — but a reader stopping at the conclusion was told the
opposite. **The conclusion now names it: Mossad primary, CIA and British services witting by
liaison, at the author's hypothesis tier.** Three things travel with it and must not be dropped:
it is argued from documented liaison structure and the Maxwell lineage, **not** from the corpus;
the corpus limit is stated in the same breath (the word appears there only in Epstein's joking
denial to Barak and in a question he asked Barak); and **rung 5 is still refused for everyone.**
*Do not "restore balance" by re-inserting a no-service-named hedge. That is the error that was
just fixed.*

**Also done 11 Sept 2026, at his direction:** Section I cut from four subsections to two — the
symmetry-rule and "what in the files means" subsections removed as excessive, with a compact
definition of both folded into the Section I intro because **the symmetry rule is still invoked
eight times downstream.** The address to service members cut 2,526 → 1,190 words. **Every
safety-critical passage was kept verbatim** and must stay: not a call to disobey lawful orders;
the lawful channels (10 U.S.C. §1034, PPD-19, ICD-120); do not send classified material; and the
**Article 94 mutiny warning** closing the door on coordinated refusal. What went was apparatus —
the Byzantine Generals detour, Schelling/Aumann, and the Watson case study compressed to its
finding and tier note. Scale line now 269 / 1,053 / 121.

**Pipeline trap learned:** deleting a subsection block can carry away a `</div>` that closes the
section's `sect-body` wrapper, which opened *outside* the deleted range. Tag-balance caught it.
**Always diff div balance against a pre-edit backup, not just the absolute count.**

**THE OTHER MAXWELL CHILDREN — researched 11 Sept 2026, unpublished.**
`research/MAXWELL-SIBLINGS.md`. The page carries Christine 0, Isabel 0, Kevin 0, Magellan 0,
Chiliad 0 against PROMIS 39 — in a Section V titled *"Father, Daughter, and the Surviving Node."*
**The reason they belong is the corpus, not the intelligence lineage:** Christine and Isabel
transacted with Epstein directly 2003–2012 (Chiliad equity, a Salty Dog Ventures round pitched to
him, Eli's Trust papers sent to his attention, introductions). Documented and EFTA-cited.

**The PROMIS lineage claim is dead and must not be revived without new documents.** H.R. Rep.
102-857 (1992) and the Bua Report (1993) name Robert Maxwell **zero times** — verified with
control terms, which is what makes a zero meaningful. The only official treatment is DOJ's Sept
1994 review: *"there is nothing of which we are aware that links Mr. Maxwell to PROMIS"*, resting
on Ben-Menashe alone, who admitted he *"simply let the Hamiltons and others assume"* he meant
INSLAW's PROMIS. **Symmetry caution that travels with it:** that review is the accused agency
reviewing itself, so the verb is **never corroborated**, not *disproved*. **And read the denial
narrowly:** DOJ says the FBI's 20 Maxwell pages do not concern PROMIS, not that no FBI Maxwell
file exists. **Chiliad's engine has a documented different parent** — UMass Amherst CIIR's INQUERY
via Sovereign Hill Software, April 1996.

**Killed, do not re-publish:** Christine founding *Information on Demand* (Sue Rugge, Berkeley,
1979); *"a sitting CIA CIO co-founded Chiliad"* (Alan Wade was CIA CIO 2001–05; role contested,
needs a primary); *"bugged software to Fortune 500"* (no source, any tier); Gates and Allen each
putting $20M into Commtouch (it was combined and corporate); the $18M Excite figure (that is the
June announcement, not the August close of 850,000 shares).
**Blocked on:** an EFTA copy of the May–June 2008 Chiliad share thread (hex32-only, so a lead);
reconciling two USAspending totals (~$20.1M/50 vs ~$33.1M/60 awards); tying "Chiliad Publishing
Incorporated" to Christine by filing. **web.archive.org is unreachable from this environment.**

---

### Still open from 7 September 2026

**FOUR ERRORS FOUND ON THE LIVE PAGE, 7 Sept 2026. Verified, held for the author, not fixed —
he scoped that session to research. Full detail in `research/EPSTEIN-9-11-INTEL-TOPOLOGY.md` §10.**

1. **The 1994 Mirror Group settlement is not a concession.** The apology was for the Oct 1991
   articles attacking Hersh and Faber ("entirely improper"), not for the allegation. Dropping a
   libel action and paying the defendant is not an admission it was true. "Maxwell's own company
   conceded it after he was gone" is the symmetry rule failing our way.
2. **"The CIA Director who met with Epstein in 2014" is our own naming error**, in three places.
   Burns was Deputy Secretary of State until 4 Nov 2014; CIA from 2021.
3. **The FBI Urban Moving serial we cite (24 Sept 2001) is marked (Pending)**, eleven days in.
   The case closed 10 July 2003. The closing memorandum is *better for us*: it records a
   documented CI concern and kills the foreknowledge specimen on physical evidence.
4. **The DEA art-students memo is dated "June 2001" on the page**; the leaked copy may be
   undated. Not verified either way. Get the copy first.

**Also researched, unpublished (same file):** the Nov 2016 Riyadh trip named in the pilot's own
traffic; the Nov 2017 Boies exchange and Barak's "Call me. in Paris."; the Carbyne/Trae Stephens
introduction; the Lutnick contact record including his written acceptance of a Little St. James
lunch for 23 Dec 2012; Epstein to Bannon 6 Dec 2018, "do you know bill barr. CIA ."

**The Epstein↔9/11 question itself: three tests, all NOT REACHED.** The corpus 9/11 null is
clean and is the publishable finding.

---

### Carried from 1 September 2026

- **Which Daniel** — the corpus holds both **Daniel Siad** (13 two-way messages, asked to
  "help facilitate" contact) and **Daniel Sabba** (`@db.com`). Author to disambiguate.
- **Does the Deutsche Bank naming rule extend to Sabba?** Author's call. Nothing published.
- **`research/PRINCIPALS-EMAIL-SWEEP.md`** — the two-populations finding and the MLAT layer
  are researched and unpublished, awaiting direction.
- **The 161 mass-shooting markers name perpetrators.** Not an error; a live editorial
  question against contagion research. Author's call, not the assistant's.
- **79 map markers carry superlatives** ("world's largest", "the only") — spot-checked, not
  systematically verified.
- **Six report sections are stubs** (XXII at 3 KB, XV, XXI, XI, XIV, XIX) beside Section II
  at 267 KB. Structural, and the author's decision to make.
- **`irl.ing`** — the author called it "the most favorite website"; never explained, not in
  the report.

---

## 8. THE POINT

The document's authority does not come from what it alleges. **It comes from what it
refuses to allege.** Every specimen killed, every null published at equal prominence, every
correction printed with its date, every rung-5 claim left unclaimed — that is the asset.
Protect it. The moment this becomes a document that only accumulates, it is worth nothing,
and every operator who reads it is right to discard it.
