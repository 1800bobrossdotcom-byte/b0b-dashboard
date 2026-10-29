# b0b-dashboard — operating memory

**This file exists because the assistant has none.** Every session starts blank. Nothing
said in conversation survives. If it is not written here or in a commit, it did not happen.
Read this first, every time.

**Author and director:** Gianni Arone (b0b.dev). He sets scope and adjudicates every
contested call. The assistant researches, verifies, drafts, deploys, and is wrong often
enough that its disagreement is not authority — see §5.

---

## 1. WHAT THIS IS

`site/report.html` — a ~1.5 MB OSINT report at https://www.b0b.dev/report. 25 numbered
sections plus a researcher's guide (24 until 23 Sept 2026 — see §7).

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

**CREATIVE DIRECTION — the author's framework, 21 Oct 2026. Full text, verbatim: `design/INSTITUTION.md`. Read it before any design, writing or structural work.**
- **The thesis:** "The intelligence agency is the artwork. The intelligence work is real." The institution is the medium. Its governing maxim, *ars est celare artem*, is already on the page in the masthead, with the jacket and "the insignia of a unit that does not exist".
- **The distinction that carries everything:** "The institution may be ambiguous. The evidence must not be." Also: "Don't trust the institution. Examine the evidence." The masthead says the same: in art the craft is concealed, in analysis every seam is shown.
- **His seven principles:**
  1. institutional credibility;
  2. artistic ambiguity (no excessive explanation that flattens the work);
  3. research integrity (citations, confidence, corrections);
  4. aesthetic restraint (subtle institutional design over espionage cliché);
  5. physical–digital continuity (jacket, insignia, documents and interfaces are one world);
  6. conceptual coherence;
  7. **no false official affiliation** (no fabricated credentials, endorsements or provenance).
- **His instruction to the assistant:** do not reflexively recommend startup branding, overt artistic explanations or generic corporate-transparency language. Outside reviews keep proposing exactly these; weigh them against this framework before passing them on.
- **Nothing here loosens §2.** The ambiguity is the institution's. The research stays sourced, tiered and correctable, and no real agency's identity is borrowed. The Yes Men's method of impersonating real institutions is the one parallel that principle 7 rules out.

**Real operators read this. Some may act on it.** That is the reason for the discipline,
not a reason to soften it. Accuracy is the safety mechanism. Anything that would get a
reader prosecuted, discredited, or killed does not go on the page — which is why the
servicemember section (Section XXV) leads with the lawful channels and states plainly
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
- **b0b.dev is never called "the Institution" (or "the Institute").** Author, 21 Oct 2026:
  *"Do Not call it the Institution … Fucking mossad is literally called the Institute."*
  HaMossad means "the Institute", and the report names Mossad in its sponsor hypothesis, so
  the word reads as an association. The word came from his framework text
  (`design/INSTITUTION.md`, kept verbatim as his document), and I had made it the Briefing's
  name for the site. On the page and in the films, call it **b0b.dev** or "it".
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
6c. `python3 scripts/build-cards.py` then `node scripts/apply-seo-meta.js` — rebuilds `/data/cards.json` and `/card`
   from `scripts/cards/cards.json`. **It stops if any card's quote no longer appears, word for word, in the subsection
   it links to.** When it stops, fix or drop the card; never edit the page to fit a card. `--selftest` plants three
   faults and must catch all three.
6d. `python3 scripts/build-speculative.py` — rebuilds `/data/speculative.json` (the SPECULATIVE skin's 25 reaches)
   from `scripts/speculative/reach-*.md`. **It stops if a reach's quotation or FACT_CHECK phrase is no longer in its
   own section, if a section has no reach, or on a banned word** (§2 list in the script). Fix the reach; never edit
   the page to fit it. `--selftest` plants three faults and must catch all three. Every new or changed reach is read
   by a person for the living-person floor before deploy: the script cannot check that.
7. `node linguistic-integrity.js generate && verify` → must print **STATUS: PASS**.
   **Order matters:** the concordance re-stamps `dateModified`, so the manifest is
   regenerated *after* the concordance build.
7b. `python3 scripts/check-consistency.py` → must print **0 mismatches**. Computes markers/edges from
   the map arrays and the scale figures from the report, checks every page and `seo-meta.json` that
   states a count, and writes `site/data/build.json` (counts, build stamp, sha256s). Runs **after**
   step 7 so the build stamp is the new manifest's. `--selftest` plants a wrong count and must catch it.
   **It also fails if `site/map-gl.html` is stale.** After ANY change to `map.html`'s data arrays run
   `python3 scripts/build-map-gl.py` (copies the arrays and the timeline verbatim into the GL page);
   the selftest plants a marker edit the GL page does not carry and must catch it.
8. Push branch **and** `HEAD:main`.
9. `node scripts/check-live.js --wait` — **it compares only the manifest's `generated` stamp,
   which moves only when `report.html` changes.** A deploy touching just `index.html`,
   `server.js`, `theme.css` or the map passes it immediately while the *previous* build is
   still being served (seen 19 Sept 2026: four "clean" reads of the old home page). For those,
   poll the changed page for a string that exists only in the new markup before step 10.
10. Gated curl on actual content — **four consecutive clean reads**.

**Traps that have bitten:**
- **The meta blocks in `report.html` and `map-gl.html` (the page `/map` serves since 22 Oct 2026)
  are GENERATED from `scripts/seo-meta.json`.** Editing the HTML directly looks like it worked and does not
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
- **A tile provider can refuse with a 200.** Since Sept 2026 CARTO's keyless basemaps return an
  "API KEY REQUIRED" watermark image (`etag: "wm-…"`) with HTTP 200, so the classic map's
  `tileerror` failover never fired. Look at a tile, not its status code. CARTO is no longer used.
- **Vercel transpiles ES modules under `site/` to CommonJS.** `site/**` is bundled into the function, and
  Vercel's Node builder rewrote `import * as mlgl from …` in `site/map-gl.js` as `require(…)`; every
  browser then died on "require is not defined" while local Express served the file untouched and every
  local test passed (22 Oct 2026). **A browser ES module goes in `public/`.** Compare a live file's
  sha256 with the repo's when the live page and the local page disagree.
- **Nominatim's robots.txt disallows `/search` and `/reverse`** (read 22 Oct 2026), and Photon's disallows everything. Earlier passes (19 Sept reverse-geocode check, 4 Oct pin moves) used Nominatim under its usage policy; the spider's rule is robots, so **do not use it again.** For US addresses use the Census Bureau geocoder; elsewhere use the coordinates of the place's Wikipedia article read through the spider (`scripts/geocode-context.py` does both).
- **The static route serves a fixed extension allowlist** in `server.js`. A new asset type
  404s live while looking perfectly fine in the repo — `.kml` did exactly that.
- **Section I has no static sect-toc** (JS-generated). Sections II, IX, XIII and others do.
- **DOJ fetch:** `Cookie: justiceGovAgeVerified=true` + browser UA. Akamai rate-limits with
  **HTTP 401, not 429** — use `--fail`, back off 5/15/35/60/90s.
- **jmail.world's robots.txt disallows `/api/` (and `/person/`) for every agent, with `Crawl-delay: 10`** (read 26 Oct 2026; its header says "AI bots welcome, just be polite about rate"). The corpus method below uses `/api/emails/search`. **Whether to keep using it is the author's call; until he decides, do not run new API queries.** It is the same situation as Nominatim on 22 Oct. The search also returns only ~500 characters of each body, so re-filtering on `content_markdown` under-counts. Sort on the API's highlighted passage, and treat earlier re-filtered counts as floors.
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

8. **Grading his titles down to the weakest line under them.** 27 Oct 2026: six section titles were
   retitled to what every claim in the section could carry, and he reversed it the same evening
   ("going soft on what is really going on … almost like you are siding with these elites"). The
   tiering lives in the section bodies; a title is his voice and is measured against the strongest
   documented finding, not the weakest. Outside reviews pushed the same way; weigh them against
   `design/INSTITUTION.md` before turning them into a plan.

**Standing instruction to the assistant: when the author pushes back, check the record
before defending. He has been right materially more often than not.**

---

## 6. TONE

Direct. No preamble, no therapeutic register, no ceremonial self-criticism. State the
finding, state the tier, state the limit, stop. He has asked for this explicitly and more
than once.

---

## 7. OPEN AT LAST WRITE — 12 September 2026

**NEW SECTION III, "THE CABINETS"; SECTIONS III–XXV ARE NOW IV–XXVI — 29 Oct 2026.** Author: *"Push on Trump and all cabinents epstein and robert maxwell were involved in and make a separate trump cabinet section that has the other cabinets"*; asked placement, he chose **"New III, right after II"**. **Every reference to a section number before this date uses the old numbering** (add one from III up). h3 ids are unchanged, so old subsection deep links still land; `#III` now means the Cabinets.
- **Research, held in full:** `research/CABINETS-{A-TRUMP,B-US-OTHER,C-FOREIGN}.md`, 487 quotes, all vq OK. On the page: 8 subsections (`cab-*` ids), 182 quotations, vqdraft 0 failing.
- **What it says:**
  - **Method.** Contact is kept apart from official acts. The DOJ §3 list (14 Feb 2026) is read as an instrument with a known gap: Barrack, "mentioned hundreds of times", is not on it. It is never read as a roster, and every contact is a floor because the DOJ library cannot be searched from here.
  - **Trump 1:** Acosta (the act, plus Epstein's tracking emails EFTA02656036 and EFTA01014138); Barr ("Not to my knowledge"; "do you know bill barr. CIA ."; the Dalton father link printed as contested); Bannon (2018–19 texts, EFTA00027290); Mnuchin, Pompeo and Mattis only as subjects of the Bannon–Epstein exchange.
  - **Trump 2:** Lutnick's documents against his two accounts; Barrack (CBS, attributed); RFK Jr.'s travel; Bondi, Blanche, Bongino and Patel as acts only; Feinberg, Phelan and Oz at NBC's strength.
  - **Other US cabinets:** the Reagan Library "Maxwell, Robert" folder (correspondence, a declined dinner, no secretary named); Tower (attributed, unproved); Clinton (1993 reception documented; flight counts 4/26/27 not reconciled; island contested, no document); Summers (1998 flight as Deputy Treasury Secretary); Richardson (new to the page: nine meetings after 2008, clemency approach to Crist, Crist denies); Gonzales and the DAG's 2008 "would not intervene"; Ruemmler, Burns, Holder, Garland.
  - **Foreign:** Mandelson (withdrawn, arrested, bailed); Blair (Cabinet Office note plus the Rycroft memo as reported; PREM 49/3326 unread); Jagland (Økokrim suspect, immunity lifted); Brende; Lang; Lajčák; Barak (Lavrov email, Netanyahu's attack); Waheed; Tusk (his "recorded and filmed" claim unsupported). Killed: Macron, and Rubio's "love ya".
  - **Robert Maxwell:** PREM 19/3492 (title only), Shamir at the funeral, Pergamon's Eastern-bloc leaders.
  - **The Lavrov timeline** (Barak 2015, Jagland 2018, Lajčák 2018) is printed as a shared counterpart, not a chain.
  - **Close:** most contact falls outside office; the consequences fell abroad; at home the acts were institutional; no document places a cabinet member in the crimes or acting at Epstein's request.
- **Not named on purpose:** the eleven Norwegian ministers heard by the Storting; no survivor; the person a redacted "love ya" email points to. No subject-shielding lines (the CBS "no evidence Barrack participated" line and similar were left out).
- **Corrected in place, ledger 2026-10-29:** VIII's cabinet map "Epstein contributed to Lutnick dinner 2018" (the dinner was 11 Dec 2017, and Epstein declined the table, EFTA02229607); XXI Burns "three meetings" (three scheduled, two acknowledged); XXI Clinton "Secret Service dismissals are public record" (the logs list no agent on some legs).
- **The Cabinet Penetration Map (club and board layer) stays in VIII.** Section III links to it. Whether to fold it in is his call, and it still carries the unchecked Bondi "$25,000 … before she declined" line.
- **Renumbering:**
  - Done with the scratch tool `renum/rn.py`: placeholder tokens, so each numeral moves exactly once. Each surface was diff-reviewed.
  - Surfaces: the report (h2s, anchors, contents, sidebar map, masthead groups, prose, xref-secs), i18n `report.h.*` and `report.sect.*` (`?v=7`), map sections (the 36 data-centre markers were tagged XX, the Calibration Index, and are now XXII, the Compute Substrate), corrections ledger rows, the concordance, stickers, the summary tour (26 entries), the reaches (renamed, plus a new reach III), the briefing film, and the cards.
  - **Not renumbered:** CLAUDE.md's dated entries, which keep the numbering of their day. The corrections ledger's rows were shifted to current numbers, as on 22 Oct.
- **Reach III** reads the cabinets as Epstein "working the doors" and the consequences falling abroad because "abroad the prosecutor is not the custodian of the archive". It asserts no act by any living person; LIVING_NAMES records how each appears.
- **The briefing film gained part III** (Treasury building and the empty 1981 Oval Office; reach III's headline and one sentence).
  - Its `spec/` masters were missing in this container. 50 of 52 matched `site/img/listen/` byte for byte and were copied. The seal clip and still were re-rendered from `seal_anim.py`, and their sha256s updated. The Treasury picture is the listen copy (its own sha256).
- **Search** was made multi-word the same day (entry below), on `main` separately.
- **Spider:** `www.tribunal-de-paris.justice.fr` registered as a decoy-200 ("Site en cours de maintenance | Justice.fr", 15,891 bytes), proven both ways.
- Scale line 293 / 1,220 / 177. `build-transmissions.py` 404'd again; the reel is untouched.

**REPORT SEARCH FINDS SEVERAL WORDS AT ONCE — 29 Oct 2026, live (`report-search.js?v=5`, main `560c5cc`).** Author: *"I want to be able to search multiple items at once - so Trump Nicolas ribis should come up in the same query"*.
- **Before:** every word had to be in the same paragraph (AND), so "trump nicolas ribis" found nothing. No paragraph names all three, and the page spells him "Nicholas"/"Nick".
- **Now:** any word matches (OR). Paragraphs holding every word come first, then fewer, under amber bands ("All 3 words", "2 of 3 words"…). The count line gives per-word paragraph counts.
- **Near spellings:** a word found nowhere is retried against the report's own vocabulary at one edit with the same first letter, and the count line shows it (`nicolas → nicholas/nicolás 3`). Quoted phrases and `-exclude` are unchanged.
- **Deployed alone, from a worktree on `origin/main`.** The branch carries the unfinished III→XXVI renumbering (`c6bba9e`), which must not go live before Section III exists.
- **The map's search is still AND** (`map.html`/`map-gl.js`); whether it should match is his call.
- *Trap repeated:* `pkill -f "PORT=8941"` killed the shell (exit 144). Kill by PID.

**THE HOUSE JUDICIARY MINORITY REPORT IS IN II's TRUMP NODE; TRUMP/ZAMPOLLI DIG HELD — 29 Oct 2026, live. `research/ZAMPOLLI.md` + `ZAMPOLLI-{A-STAFF-REPORT,B-RECORD,C-TRUMP-RECORD}.md` (245 quotes, all vq OK).** Author: *"Yes place report and dig further on Trump and Zampolli with a speculative full court press in doc search and findings"*.
- **On the page:** a new h4 after "the named accounts", **"Labeled/contested - the House Judiciary minority staff report (26 Oct 2026)"**. Its 20 quotes all pass vq.
  - The report is documented; every accusation in it is attributed, and it is not a finding of the committee or any court.
  - **The count is read against the report's own text:** three of the 11 "have not come forward as survivors"; one makes no claim of Trump misconduct; one is a tip the committee "has not been able to independently verify"; the only new account rests on staff discussions alone.
  - **The DOJ transcript context it omits:** Blanche raised the witness himself; the steering came while Maxwell was disputing that witness's testimony about Epstein, not Trump; on day one Maxwell said "The President was never inappropriate with anybody". Her Oversight deposition was held 9 Feb 2026, where she took the Fifth.
  - **Set beside it:** Giuffre's 2016 deposition line, "Donald Trump never flirted with me", and Epstein's 2011 emails, "zampoli is trouble . Lots" and "He sells stories to the press" (EFTA01836539, EFTA02535652).
  - **The answers:** the White House, a DOJ spokesperson (second-hand) and Zampolli. His envoy status was "terminated" on 15 Oct.
  - Also fixed: the stale "now Acting Attorney General" line (Blanche was confirmed in July).
- **Survivors:** no survivor is named in the new block beyond the three the node already named.
- **"Speculative":** run as research leads with prove/kill tests (table in `ZAMPOLLI.md`); none is above contested. **Reach II is unchanged.** Whether it carries these as questions is his call; it cannot assert guilt (living-person floor).
- **Follow-up the same evening, live** (author: *"Continue"*, to my two offers). Nine new quotes, all vq OK.
  - **Trump-node errors fixed in place** (from `ZAMPOLLI-C-TRUMP-RECORD.md` §5):
    - the flights line now quotes the SDNY prosecutor's 2020 email, "at least four flights on which Maxwell was also present" (EFTA00028716);
    - the 2011 "dog" email now carries its tail, "police chief. etc. im 75 % there" (EFTA00654425);
    - "Katie Johnson" now has the full 2016 filing history and the promoter, Lubow ("does not disprove that Johnson is a real person");
    - WSJ is now an amended complaint, with the 10 June motion to dismiss with prejudice and the 5 Aug discovery stay;
    - the page count is "more than 3 million pages" (Blanche), about 3.5M after March;
    - "in violation" is now the 25 June opinion recording the AG's concession by non-response, not a merits finding (×3);
    - the 28 Oct D.C. Cir. stay denial is attributed to Raw Story.
  - **Reach II gained a paragraph of questions:** the flights email against "the review over", the withheld pages, "Let's not talk about individuals", and the minority's "cover-up" against the White House's denial. It asserts no act; LIVING_NAMES records how Trump and the interviewing official appear. The body is 338 words (limit 340).
  - **Not done:** the Giuffre deposition line stays in the new block rather than in caveat (1); the S.Res. and "torture video" items were not re-verified.

**SCREENSHOT OF THREE X POSTS — graded 29 Oct 2026, HELD. `research/SCREENSHOT-2026-10-29-HELD.md` (7 quotes, vq OK).** Pasted with no instruction.
- **(1) "11 survivors … 5 named Trump":** this matches the **House Judiciary Democrats' staff report of 26 Oct 2026**, "'We Have Certain Things in Common, Jeffrey'…".
  - It covers 11 women, five of whom accuse Trump of rape or sexual assault in Epstein's company or presence. It says Trump and Paolo Zampolli "may have been co-conspirators" and asks for a special counsel.
  - These are the minority staff's conclusions: not the committee's, not a court's, and no one is charged.
  - The White House: "None of these allegations are true."
  - The report PDF was identified, not opened (stop rule b). No survivor is named in the file.
  - At most it could go on the page as a dated act of the minority with the denial beside it. That is his call (living-person floor).
  - The Blanche/Maxwell-interview point is a lead: read the transcript first.
- **(2) Operation Dragon Covenant:** documented (army.mil, 26 Oct). Phase II was a test of large-scale battlefield temporary burial at Fort Bragg, 20–21 Oct, with simulated remains. It is the first such exercise at scale since the Korean War; Phase III comes next spring. It shows a capability, not intent about any particular war. On the page 0 times.
- **(3) WIRED/America PAC:** not read (null).

**EPSTEIN IN OTHER NATIONS' FOI AND RECORDS SYSTEMS — swept 29 Oct 2026, HELD. `research/FOI-EPSTEIN-FOREIGN.md` (18 quotes, all vq OK).** Author: *"Look across other nation state foia databases for epstein mentions"*. Method: `foi find` across the registry, then targeted queries.
- **UK:** the richest record, and almost all of it refusals or missing records. In 88 written questions, the Home Office **neither confirms nor denies** a request for legal assistance to the US (24 June, 23 Oct 2026). The page relays the Washington Post's claim that Britain's request was "outstanding and unanswered"; set the government's answer beside it if that line is touched. On MI5 and Russia: "not to comment". The NPCC has a national coordination group. No public inquiry is "being actively considered".
- **UK records not kept:** No 10/No 11 visits and Treasury visits "not retained"; Stansted passenger data kept ≤10 years; DBT's search found no records.
- **UK, lead:** two Blair-era No 10 files are open at TNA, **PREM 49/3326** (digitised; "Meetings and correspondence with businessmen", 2002–03) and **PREM 49/2771**. Neither catalogue entry names Epstein, so a name search returns 0. **The 11 Mar 2026 Humble Address return** (the Mandelson papers, 147 pp.) carries a Cabinet Office note of records "which relate to a Tony Blair meeting with Epstein that was facilitated by Mandelson". The meeting is attributed to that note until the file is read. Both men are living, and police investigations are live per government answers.
- **Canada:** two access-to-information requests.
  - CBSA A-2026-06709 asked for records of Epstein's "visit to Vancouver, Canada, in 2014"; all exempted. The page has no Vancouver visit, and it is not established.
  - Justice Canada X-A-2026-00002 (documents containing "Jeffrey Epstein"/"JEE", 2010–2026) was disclosed in part. Asking informally for a copy is his call.
- **Nulls and refusals:**
  - no results: Israel's FOI movement, Japan, French military archives;
  - refused or robots: AU Right to Know (403), AskTheEU, Madada, Archivportal-D, **Norway's eInnsyn**.
  - NZ hits are all RNZ news, which has opted out, so nothing from them is cited.
- **Not on the page.** His calls: read PREM 49/3326, the Canada request, and Norway via the Storting API.

**THE FLYING STARS OF BROOKLYN, NY, "MY GOD HAS A TELEPHONE", ON THE SIGNAL BAR — 29 Oct 2026, live.** Author: *"Add my God Has A Telephone by the flying stars of brooklyn"*.
- The track is `iEBw7tq4RfY`, on Colemine Records, the label's own channel (identified by YouTube oEmbed; the id comes from Flea Market Funk's 2017 post). It is Aaron Frazer's gospel 45 under that name.
- First placed 18th of 19 (before Faith No More). Then the author wrote *"Add as second song"*, so it is **now song two**, after Overseer's "Heligoland" and before Imogen Heap's "Headlock" (third). The bar still ends on Faith No More. `LS_KEY` is `b0b_signal_v19`, and `signal-bar.js?v=26` is on report, home and both maps.
- The same session, his *"Add to Playlist: how to listen to this album - by stereoclip"* was withdrawn (*"Nix that"*) before any upload was found; nothing was added.

**IMOGEN HEAP "HEADLOCK" IS SONG TWO ON THE SIGNAL BAR — 28 Oct 2026, live.** Author: *"Place Imogen heap - headlock as song two"*.
- It is the official video on ImogenHeapVEVO (`roPiy2JydwA`), identified by YouTube oEmbed; the id is from the song's Wikipedia page. imvdb's id `eKZsZkH_MJc` gives no oEmbed answer, so it was not used.
- It sits after Overseer's "Heligoland", which leads the bar on `main` (the order was changed by other sessions, 25–27 Oct). `LS_KEY` is now `b0b_signal_v17`, and `signal-bar.js?v=24` is on report, home and both maps.

**b0b.dev OPENS ON A SPECULATIVE BRIEFING FILM, AFTER THE WORDMARK AND THE SEAL — 28 Oct 2026.** Author: *"the animated intro can come as just the video that replaces the trump video. have this be the new briefing video - but speculative and covering whole report"*, *"Have b0b.dev open with a speculative video - and the ars est cleare artem as the lead in (animated) and close"*, *"do not have the WOuld kiill it for the speculative video, just the speculative"*, *"have a subagent take the animated logo and place after the b0b.dev animation - as a second one before going to video card page"*. Asked: OM COMMA **kept as a card**, the old Briefing **replaced**, length **about 5 minutes**.
- **The film (4:59, −16 LUFS):** `scripts/film-briefing.json`, generated by scratchpad `film/make-spec.py` (edit the JSON by hand now). Motto lead-in over the finished seal; **one part per section, voicing that section's reach headline plus one sentence of its body, both verbatim from `/data/speculative.json`** (the generator asserts each sentence is in its reach); two face-free, licence-checked pictures per section from the listen library, sources from the other film specs (no `L_` items, which have no recorded source page); **no PROVE/KILL lines**, as he asked; **Section I opens on "Section one is the author’s own testimony." and its card reads SECTION I → THE AUTHOR** (author: *"The opening video doesn't make clear that section one is about me"*; he is not named in the film — his name is his call); the close is the seal assembling (`seal_open`), then "b0b.dev" and "Ars est celare artem." The identity Briefing is kept as `scripts/film-briefing-identity.json`. Outputs: `public/b0b-briefing-film.{mp4,webm}` (served `?v=3`), `site/img/briefing-poster.jpg`, `site/img/films/briefing.jpg`. **The engine's `master-subtitled.mkv` has no audio: mux `mix.wav` into the WebM** (VP9 crf 42 / 550k + Opus 64k, loudnorm).
- **`design/projection/seal_anim.py`** draws the seal assembling (rings, motto letter by letter, stars, the traced figure); `--speed`/`--hold` for the landing cut; `build_seal_intro.sh` writes `public/seal-intro.{webm,mp4,png}` (720×720, 4.8 s).
- **Arrival on `/`:** the b0b.dev wordmark → **the seal assembling** (`site/b0b-seal.js?v=1`; SKIP goes to the carousel muted, a tap goes to it with sound; it falls through on any load failure, reduced motion shows the still) → the carousel, **`data-main="briefing"`**, card "BRIEFING · SPECULATIVE · 4:58"; OM COMMA second. `landing-intro.js?v=10`.
- **The films download as MP4** (author: *"make so I can download .mp4 of video. right now just .wepm"*): the carousel's bar carries DOWNLOAD MP4 ↓ for the part on screen, and `/start`'s link is `…mp4?v=3&dl=1`. `?dl=1` on any `.mp4` sends `Content-Disposition: attachment`: `vercel.json` `headers` for the CDN-served files in `public/`, and `server.js`'s static `setHeaders` for local dev and the films still in `site/`. Without it Vercel serves `inline` and the browser plays the file. `landing-intro.js?v=11`.
- `/start#film` plays it, captioned as the speculative reading ("The documented report is the record"), with its script and sources.
- **The speculative-reach rules apply to the film:** it is the SPECULATIVE skin voiced, so no new fact, the living-person floor, and nothing removed comes back. A changed reach does not change the film until it is re-rendered.

**THE DAILY CARD IS OFF THE TOP OF THE REPORT — 28 Oct 2026.** Author: *"remove the daily from the top"*. The ONE CARD mount under the epigraph and the report's `card.js`/`card.css` tags are gone; `/card`, the card on `/home` and the ONE CARD nav links stay.

**A SECOND LOGO OFFERED, NOT SWAPPED — 28 Oct 2026.** Author: *"Or the dagger and lighting bolts from it"*. A dagger-and-bolts mark from the seal was rendered beside the agent (scratchpad `agent/mark-options2.png`) and sent to him; the agent stays until he picks. At 16 px the bolts read as speckle.

**VERITAS IS THE DEFAULT DESIGN; THE GREEN TERMINAL LOOK IS "CLASSIC" — 27 Oct 2026, live (report only).** Author: *"lets rebrand the site design to mock palantir, with their site style - have it as a skin. lets see it as default with this as the classic skin"*, then *"have the palantir logo instead say veritas - lets call veritas the truth engine that powers b0b.dev"*. (His "maybe not" in between was about something else, he said.)
- **What it is:** `site/veritas.css?v=1` + `site/design.js?v=1`. It uses a spare, monochrome defence-contractor style: black ground (white in LIGHT), white type, hairline rules, square panels with one white left rule, small uppercase labels, the Inter typeface (self-hosted, OFL, `site/fonts/inter-latin-{300,400,500,600}-normal.woff2`, `LICENSE-OFL-Inter.txt`; from npm `@fontsource/inter` 5.3.0). Tokens are remapped (`--green`/`--cyan` become white or black; `--mono`/`--serif`/`--read-font` become Inter), and inline `#00ff41`/`#00ccff`/`#5a7a68` literals are remapped as theme.css does for LIGHT. The signal bar, the countermeasures label, the progress bar and the expand cue are restyled to match.
- **No Palantir name, logo or copy anywhere (principle 7).** The wordmark is our own: **the trench-coated agent from the AECA jacket seal** + "VERITAS" + "The truth engine that powers b0b.dev", at the top of the sidebar, and at the head of the page on phones (`.vx-top`). Do not draw Palantir's ring-and-bar mark or use their wording.
- **The mark, 27 Oct 2026** (author: *"I don't like the cube logo / Use the spy guy from aeca"*; the first mark was an outlined diamond): `site/img/vx-agent.png`, written by **`design/projection/agent.py`** from `seal.traced_interior` (the figure traced from his photo of the patch). The dotted lightning bolts are dropped because they turn to grit at logo size: it keeps the largest stroke plus small marks inside its outline (the eyes), and thickens the line 2 px at 1200 px. White with the drawing in the alpha channel, used as a CSS mask (`.vx-mark`, 40 × 52 px), so it is white on DARK and black on LIGHT. `veritas.css?v=2`, `design.js?v=2`. Needs `scipy` (`pip install scipy`) to rebuild. **The agent is also the site-wide favicon** (author: *"have the agent be the favicon too"*): `site/favicon.png`, 192 × 192, the figure in white on a black tile (a heavier stroke, `agent_mask(weight=7)`, so it holds at 16 px), written by the same script. Every page and generator now links `/favicon.png?v=2` (browsers cache favicons hard); the five tone manifests too. The old favicon was a white dove on transparent (`favicon.svg` still holds the dove; nothing links it).
- **Switching:** an inline head script sets `html[data-design="veritas"]` before first paint unless `localStorage b0b_design = "classic"`; `?design=classic` / `?design=veritas` set it for a link and are remembered. The CLASSIC DESIGN / VERITAS DESIGN button sits beside LIGHT/DARK and SPECULATIVE. Classic is the old look (plus the expand cue, which both designs carry). LIGHT/DARK and SPECULATIVE work in both.
- **Only `report.html` (so `/` and `/report`) carries it.** `/home`, `/card`, the `/start` family, the maps and the tone pages are unchanged; extending it is his call.
- **Naming, flagged to him:** "Veritas" is also Veritas Technologies (data-protection software) and Project Veritas (James O'Keefe's political sting group). "VERITAS" here names this site's own verification method (spider ledger, quote checks, tiers, build checks), as the 2 Oct map audit already did.

**"CLICK TO EXPAND REPORT" UNDER EVERY CLOSED SECTION; THE SOUNDTRACK CHIP IS GONE; THE SIGNAL BAR REORDERED — 27 Oct 2026, live.**
- **The cue** (author: *"near each section - have in small cool military tech type text - click to expand report."*): a button `.sect-open` between each closed section's h2 (and its reach) and its body, reading "▸ CLICK TO EXPAND REPORT // SEC II · 28 PARTS" (parts = the section's `h3[id]` count). Click opens the section; it hides while the section is open, whatever opened it (a MutationObserver on the wrapper's class). It carries `data-tts-skip`. CSS in `report.html`'s collapse block.
- **Soundtrack removed** (author: *"take the "play " tempest by tool button off"*): `soundtrack.js` is no longer loaded (the file stays, unused). TOOL "7empest" is still on the signal bar. XXV no longer says the track "plays first when this page opens", nor that Restless Leg Syndrome is "on this page's soundtrack". **Restless Leg Syndrome now plays nowhere on the site** (it was never on the bar); his call whether it goes on the bar.
- **Signal bar order** (author: *"Overseer / LA Mass Choir / Hooverphonic / Blackalicious / 3TEETH / Tracy Chapman / Billy Woods / Talking Heads / Filter / remove the smiths, keep rest of order and end on faith no more"*): those nine, then the rest in their old order (Daft Punk, TOOL, CCR, GHOSTEMANE, RATM, Hemlock Ernst & Kenny Segal, Carl Carlton), then Faith No More. **Daft Punk, the lead since 25 Oct, is now 10th**, because he did not list it. The Smiths are off the bar (their XXV essay stays, as Graceland's did). 17 tracks; `LS_KEY` `b0b_signal_v16`; `signal-bar.js?v=23` on the report, `/home` and both maps. XXV's first signal now says seventeen tracks, six of the nine written up among them.

**COLLAPSED + SPECULATIVE IS THE DEFAULT; HIS TESTIMONY IS OUT OF REACH I — 27 Oct 2026, live.** Author: *"the collapse mode should show the speculative sections first as the reading preview for each section, so collapsed + speculative for each"*, then *"yes re: memory speculation"* (to: take the memory, the lights and the book of life out of his speculative bio).
- **What a reader now sees on `/report`:** the banner, then each of the 25 headings closed with its reach under it as the preview. ◇/◆ SPECULATIVE and the banner's "Turn it off" still switch it off.
- **Storage (`speculative.js?v=3`):** nothing stored = on (the default is not written, so `/card` and `/home` keep their own off default); turning it off stores `b0b_skin=off`; `?skin=off` and `?skin=speculative` set it for a link. `card.js?v=4`: on the report the card follows the report's skin; elsewhere it is off unless chosen.
- **The documented-only rule kept:** crawler user agents (`bot`, `crawl`, `spider`, `slurp`, Lighthouse, Google-InspectionTool, …) get no reaches; each reach and the banner carry `data-tts-skip`, so the narrator skips them; search excludes `[data-spec]` (`report-search.js?v=4`).
- **Reach I:** the testimony paragraph is gone, and his accounts are now only in Section I, in his words. The headline now reads "Raised on a classified supply line, known to the CIA's portal by his childhood address, placed, in his words, to intercept." PROVE and KILL now concern his CIA file, not the remembered room (a release showing a file older than his request / a showing that the portal checks every requester against the oldest commercial address). Faraday is now described as "anonymous encrypted video calling", and the line "He does not hide from the watching" was added (to keep the body ≥110 words). The roommate is gone from LIVING_NAMES.
- **Tested** (scratch `def-t.js`, desktop and phone): fresh visitor gets 25 closed sections with 25 reaches, each directly after its h2, and nothing stored; OFF survives a reload; both parameters work; the card button follows; `/card` fresh stays off; Googlebot UA gets 0 reaches; no page errors and no sideways scroll.

**LOCKHEED BURBANK UNDERGROUND — researched 27 Oct 2026, nothing on the page changed. `research/BURBANK-UNDERGROUND.md`.** Author: *"To be clear i am not sure where the abduction facility would have been. It forms as a memory. Discerned as I had the memory while awake. Does Lockheed Burbank have any underground"*. **He does not place the Section I "Fourth, the earliest" memory at Lockheed.** Found: WWII camouflage canopy over the plant (documented, secondary); "an elaborate system of underground walkways" in 1942 (attributed: CSUN/Burbank Historical Society photo caption, no plan, fate after the war unknown); underground storage tanks and the groundwater plume (Superfund Area 1; EPA's PDFs refuse by robots). No base, bunker, lab or observation rooms in any source read. **Same evening he quoted reach I back:** *"I asked for this to be read as a memory of a possible abduction"*. Live:
- **Reach I:** the headline now reads "remembering a possible abduction at seven", where it said "taken underground at seven". The paragraph now says "came to a memory of a possible abduction - and he could tell a dream from a memory, then as now" and "Where it was, he does not know", where it said he "walked" the base "in the year Skunk Works was still in Burbank". PROVE/KILL no longer point at the Lockheed plant: they look for any document that places the room he remembers, or one that places it somewhere ordinary.
- **Section I:** "He does not know where the place was." added after his two readings. "What can be checked is the setting" now reads "where he was when the memory came". "No source read places underground facilities at the Burbank plant" now reads "an underground base", because the 1942 walkway caption is underground and a source.
- **Still his call:** whether the walkway caption goes on the page.
- **Reach I's number-plate paragraph is gone** (1976 ANPR, the Ring of Steel, Flock, "forty-one years older"). Author: *"In my speculativebio section. Its errant"*. "So the instruments" became "His instruments", and "performs for the perimeter" became "performs for the surveillance". Section I's own text is untouched. **His testimony paragraph is out of reach I** (his "yes", entry above).

**THE REPORT OPENS WITH EVERY SECTION CLOSED — 27 Oct 2026, live.** Author: *"Have the report start as collapsed. Leave speculative as is in current collapse mode"*.
- **What a reader sees:** the masthead, the epigraph and the card, then the 25 section headings, each closed (▸). A heading click, EXPAND ALL or the sidebar opens a section. Closed headings sit tighter (1.6rem above, not 3.6rem). COLLAPSE ALL / EXPAND ALL are unchanged.
- **Speculative, as he asked, unchanged:** each reach is inserted right after its h2 and outside the section's wrapper, so with the skin on, every closed section still shows its reach. Turning the skin on or off does not open anything.
- **Nothing points into a closed section and lands on nothing.** `report.html`'s inline script:
  - `revealTarget()` (also `window.__b0bReveal`) opens the section around any element;
  - a capture-phase click handler opens the target of every same-page `#` link before the browser scrolls (the cards, the reaches' "Reaches from", cross-references, the masthead contents);
  - `hashchange`, and a `#fragment` in the address on arrival (landed once on the next frame, and again on `load` unless the reader has scrolled away);
  - `landOn()` (`window.__b0bLand`): a smooth scroll, then a correction once settled. **A section opened on the way loads its pictures during the scroll and pushes the target down** (search landed ~1,300 px short without it). Any newer jump, or the reader's own wheel, touch or key (capture phase), cancels a pending correction, so it never pulls the reader back. The sidebar links and search (`report-search.js?v=3`) use it; the narrator opens through `__b0bReveal` (`report-tts.js?v=11`).
  - Each wrapper and its h2 are linked (`h2._b0bBody`, `body._b0bH2`), so a reach between them no longer breaks `expandSection`.
- **Browser find-in-page (Ctrl+F) does not see text in a closed section.** The site's own search does, and opens it.
- **Tested** (scratch `collapse-t.js`, `s2.js`, `land-t.js`; one fresh port each): 25 closed on `/report` and after ENTER on `/`; a card's line link, a deep link to XXIII's 9/11 topology, a reach's link, sidebar section and subsection links and search all open the section and put the target in view; the speculative skin shows 25 reaches with every section closed, on desktop and phone; no page errors; no sideways scroll.

**SPECULATIVE IS ON THE CARDS TOO — 27 Oct 2026, live.** Author: *"have speculative mode be on the cards as well"*. Every ONE CARD mount (the report, `/home`, `/card`) has a ◇ SPECULATIVE button. It uses the report's skin switch (localStorage `b0b_skin`): on the report it turns the whole skin on or off, and the report's own button updates the card. `?skin=speculative` works on `/card`. When it is on, revealing a card's line also shows **that section's reach** beneath the documented line: the headline, "Would kill it", and "Read the reach →" (to `#<section>` on the report, otherwise `/report?skin=speculative#<section>`). **The card's own line, tier and link are unchanged, and the reach appears only after the line.** The reach comes from `/data/speculative.json`, so no new text was written. `card.js?v=3`, `card.css?v=3` (`build-cards.py` writes the tags into `/card`), `speculative.js?v=2` (adds `window.__b0bSkinSet` and a `b0b-skin` event). Tested on `/card`, `/home` (phone) and the report (desktop and phone): on, reveal, the next card, the report's 25 reaches following the card button, and off. No page errors and no sideways scroll.

**SUBSECTIONS REORDERED SO EACH SECTION READS IN ONE LINE — 27 Oct 2026, live.** Author: *"Why does it go from 9/11 / to untimely deaths of high profile individuals"*, *"Im noticing many sections just abruptly hop to some other topic and its very chaotic"*, then *"Fix them all"*. The hops came from blocks appended in the order they were written or moved in (XXIII was assembled on 23 Sept).
- **Moved, not rewritten. Every h3 id is unchanged, so every deep link still lands.** No new prose except six pointers that the new order made false ("above"/"below", one section number). Before-copy in session scratch `report-pre-reorder.html`.
- **Per section (new order):**
  - II: the conclusion leads the section, then the tiers. The hypothesis chain keeps its order. Dershowitz moved here from IV (he is a II figure), before the fork.
  - V: the exit-pattern module sits beside the death and funeral.
  - VII: the three city-states join the multi-century structures; seed sovereignty sits after Lockheed.
  - VIII: Bitcoin governance first, then Nash & Finney.
  - IX: Russia's military-science belt beside the closed cities; Dimona and Little Saint James close on the underground before "Connection to Smart Cities". IV's two underground boxes moved here.
  - X: cities, then the stack and IBM; then signals (Five Eyes, ECHELON, Snowden, orbit); then the two-city camera module; then military AI (Minerva, PAL/CALO, Maven, Nimbus, NSPM-7, AUTOWARCOM).
  - XIV: historical slavery first, then prison labour, the Gulag, the ILO data, debt and wages.
  - XV: the analysis first, then the dated status updates. The Nord Stream tiering box sits after The Structural Pattern.
  - XVI: the FOIA reading-room items follow the derivation; then the international programmes.
  - XXIII: Swartz and Mushegian, then the deaths ladder and Severed Chain; then the wanted list, ShinyHunters, Kushner; then the 9/11 topology in one run; then the Institutional Silence.
  - XXV: Trust follows Contact.
- **Structure bugs fixed on the way:** IV's sect-body never closed (V-IX were nested inside it until an extra `</div>` at IX's end). VII, VIII, X and XVI had their wrapper closing mid-section, which left later subsections outside it. Every section is now div-balanced on its own.
- **Kept in the old order on purpose:** IV and XVIII (their cross-pointers), and II's hypothesis chain.
- **A defect of mine went live with it, fixed about two hours later.** Where a section's last subsection moved (VII, VIII, XVI), the reorder carried the section's closing `</div>`, `<hr>` and the next section's marker comment along with it. VII's closing tiering box was left unclosed, so **Sections VIII-XXV sat inside that box on the live page** (its orange border around everything after VII). Totals still balanced, so `pipecheck.py` passed. Found when the collapse would not close them. The three boundaries are restored, and `pipecheck.py` now also prints **"sections nested inside a box"**: 0 now, 18 on the broken file.
- Reach IV now says "the one convicted principal" (the five-of-six line left IV with Dershowitz). Card `c-nord-stream-who` still answers from `#xv-the-structural-pattern`.

**AI DISCLOSURE CORRECTED: SEVERAL AI SOURCES, NOT A MOVE TO OPEN-SOURCE — 27 Oct 2026, live. Ledger `C-2026-10-27-3`.** Author: *"correct that while I take issue with both anthropic and chat gpt as stated before - I am continuing to use multiple ai sources to audit and compose this report"*. The page said (X supply-chain box, X conflict disclosure, XXV "Trust") that his Claude subscription was cancelled effective 1 Sept 2026 and the work would move to open-source models; the Briefing's Method said Claude alone. Now: he takes issue with both Anthropic and OpenAI (maker of ChatGPT; both took the July 2025 DoD awards X documents) and uses multiple AI sources to audit and compose the report, Claude among them, each use disclosed; no model is a source. **This resolves the FLAGGED "through 1 Sept" item in the outside-review-#2 entry.** Do not name other vendors as tools he uses unless he does.

**THE SPECULATIVE SKIN IS LIVE — 27 Oct 2026.** Author: *"go hard across the entire report. have a third skin that writes the report in a mode that is more 'fringe' - and reaches for conclusions ... speculative"*; asked, he chose **a reach per section** and the label **SPECULATIVE** (a later "nix the third section" he told me to disregard).
- **What it is:** ◇ SPECULATIVE in the report's sidebar (and the hidden top nav), beside LIGHT/DARK; `?skin=speculative` turns it on for a link; the choice is kept in `localStorage` `b0b_skin`. On, a banner opens the report and each of the 25 sections opens with **the reach**: a hard headline, 250-280 words taking the section's leads past the documents, then "Would prove it" / "Would kill it", and links to the subsections it reaches from. Amber frame and a hatched panel; the h2s get an amber rule.
- **Where it lives:** `site/speculative.js?v=1`, `site/speculative.css?v=2`, data `/data/speculative.json` from `scripts/speculative/reach-*.md` via `scripts/build-speculative.py` (§4 6d). **The reaches are never in `report.html`**, so search engines, the narrator, the cards, the summary and the scale line read only the documented report. The JS rebuilds each body from `<p>/<em>/<strong>` only.
- **The rules that did not relax** (brief: scratch `spec/BRIEF.md`): no new facts (every name, date, figure and quotation already in that section; the build checks quotations and FACT_CHECK phrases); the living-person floor; no families/bloodline tropes; no numerology; no "crown"; nothing removed comes back; no call to action beyond the lawful channels.
- **Drafted by five agents, every reach read by me. Cut on reading:** XI "designed for it" (implied Wexner planned New Albany around a trafficking node); XII Little Saint James as Indian Creek's "prototype" and "where that circle keeps a house" (living residents); XVIII "nothing in the record says it stopped" (today's MoMA board); X the Anthropic blacklisting line (disclosure); I his two street names and "the protected one can be sent" (a reading he did not give; it now ends on his own "no weapon formed against, I am useful"); III "the Gates orbit" beside "blackmail product", and the stale 1,000 / 157-of-220 figures; XXII a misquote ("the central bank of central banks" has "the" outside the quotation marks).
- **Read and kept, his call if he wants them softer or harder:** II says Epstein was a Mossad asset and was killed in a prepared room (no killer named); V says Robert Maxwell was Mossad's asset and 1991 was the handover; XX reads the MCC failures as "the custody system producing the outcome the room needed"; XIV states the unbroken chain; XIII states the library burnings as purposeful; VIII sets Trump's documented crypto acts as "capture moved inside the state".
- **Tested** (scratch `spec-t.js`; one fresh port per run, and a 62 s wait before the reload because of the dev limiter): desktop, phone (via the sidebar menu) and the shared link: 25 reaches, banner, each directly after its h2, survives a reload, OFF removes everything and clears storage, no page errors, no sideways scroll.

**ZERO BREACH TOOLKIT LINKED AS A TOOL — 27 Oct 2026, live.** Author: *"add this as a tool: https://github.com/interplains/Zero-Breach-Toolkit"*. ZERO BREACH after FARADAY in the report's top nav and sidebar and in `/home`'s nav (green, new tab, `noopener noreferrer`). **What it is (README read at source via raw.githubusercontent.com; github.com refused the spider, 403, ledgered):** a free, open-source, read-only check for traces of known mercenary spyware (Pegasus, Predator, Graphite, Candiru) on Windows/macOS/Linux, AndroidQF collections and iPhone backups; ~12,400 published indicators (Amnesty Security Lab, MVT, Citizen Lab); no network during a scan; points the targeted to Access Now's helpline and Amnesty's Security Lab first. **Anonymous, "Made by archivegenocide"** (the archive XV cites as a method specimen), with reproducible builds and GPG-signed releases. Its code was not audited here. Not added to the map headers or the `/start`-family nav.

**THE SIX RETITLES ARE REVERSED — 27 Oct 2026, live. DO NOT RE-PROPOSE THEM.** Author, same evening: *"all these renamings are too technical - especially structures of long lead dominion. these are going soft on what is really going on in the world that this report deduces - almost like you are siding with these elites. which is bullshit."* All six h2 titles, XIV's h3 "Historical Slavery - The Unbroken Line", the sidebar label "IX. Underground / D.U.M.B." and the eleven languages' translations (`i18n.js` restored from `d1dfb4f~1`, `?v=6`) are back as he wrote them. Ledger entry `C-2026-10-27-3` withdrawn. **Section titles are his voice: the tiering lives in the section bodies, and a title is not graded down to the weakest line under it.** The @omcomma removal and the counter fix below stand.

**SIX SECTION TITLES RETITLED (REVERSED THE SAME EVENING, ENTRY ABOVE); @omcomma OFF THE SITE; THE AI PAGE WAS COUNTED ON EVERY REPORT LOAD — 27 Oct 2026, live.** Item 3 of the plan (author: *"continue"*), then mid-turn *"remove omcomma"* (asked: he meant the X link, not the film) and *"are people going to the main landing page and then not going to other parts of the report"*. Ledger entry `C-2026-10-27-3`.
- **Retitles (ids unchanged; English in `i18n.js`, the other 11 languages' six keys deleted so they fall back to English, `i18n.js?v=5`):** VII "Structures of Long-Lead Dominion" → "Institutions That Outlive Their Members"; IX "D.U.M.B. Sites & Parallel Geography" → "Hardened Facilities and the Continuity Directives" (its own text says the "second civilization" claim has no source); X "Surveillance Cities & Population Management" → "Built Cities, Signals Intelligence and Military AI" ("Technology as Control" kept, because the summary PDF's Part III prints it); XII "Hardened Islands of Extraction" → "Secured Ground and the Documented Network"; XIII "Evidence of Repeating Civilizational Control" → "The Repeating-Control Hypothesis"; XIV "The Unbroken Chain" → "The Legal Forms of Bondage", and its h3 "Historical Slavery - The Unbroken Line" → "Abolition and What the Law Kept". Sidebar label "IX. Underground".
- **Not edited, same class, in the bodies (his call):** XIV's closing box "THE UNBROKEN CHAIN … The chain was never broken" (the anti-map phrasing the stickers refused); IX's "THE PRIVATE UNDERGROUND PATTERN … The architecture is identical" (Dimona beside Little Saint James); XII's "These are fortifications" opening against its own verdict; XIII's "was not destroyed by accident" (Alexandria) and "Every Olympic host city follows the same trajectory"; the cross-reference chain "D.U.M.B. Sites → Smart Cities → Enclaves".
- **@omcomma removed** from the report's top nav and sidebar, `/home` (nav, the "Signal" row, footer "X") and both map headers (`map-gl.css?v=5` drops `.nav-x`). The OM COMMA film stays the carousel's main film.
- **The landing question, from `/api/stats`, 22–27 Oct (counting began 22 Oct; browser loads): `/` 373, `/report` 144, `/map` 26, `/home` 16, `/start` 9, everything else under 10; 462 arrivals.** The report is one page, so section reading is not a separate load and **is not measured** (no scroll or section tracking, by design). What the counts do show: about one page per arrival; very few go on to the map, the films or the briefing.
- **Found doing it: `/ai-attack-vector-analysis` read 806, the "top page", because the report's hidden modal loaded it in an `<iframe src>` on every report load,** and `viewClass` counted any `Sec-Fetch-Mode: navigate` as a browser read. Fixed both: the iframe takes `data-src` and loads on first open; `viewClass` counts only `Sec-Fetch-Dest: document` (or absent). Proven on the file backend: iframe load → `o`, document load → `b` + arrival + page. The `/api/stats` `method` line now says the AI figure and browser totals for 22–27 Oct are overstated. The history is not rewritten.

**THE PAGE ERRORS ON FILE, FIXED — 27 Oct 2026, live. Item 2 of the plan (author: *"continue"*).** Ledger entry `C-2026-10-27-2`.
- **Maduro, the worst:** the XV 3 Sept box "A SPECIMEN KILLED DURING THIS UPDATE" called the US capture of Maduro "not true". **It happened on 3 Jan 2026** (Operation Absolute Resolve; Maduro and Cilia Flores flown to New York, indicted on drug-trafficking charges, pleaded not guilty; Wikipedia's two articles, read through the spider, both on same-day Reuters/NYT/BBC; the docket is unread, since CourtListener refuses this environment). We killed a true claim. The box is replaced by a plain Venezuela paragraph. Its other two facts checked out and stay: the 2 Aug Dominican Republic framework (AFP) and the June earthquake toll above 6,000, now attributed to lawmaker Jorge Rodríguez (Reuters, 3 Aug). The box's sources line, which also served the update above it, is kept.
- **§2 reassurance lines cut:** Wexner "has never been charged with a crime" and the "floor" lead-in; Andrew "never been charged with or convicted" plus "Nothing in this node asserts…"; Andrew's investigation status "No charge has been filed as of this writing"; VI "No living figure named is accused of wrongdoing"; Black "no charge has followed" / "none a criminal charge". Tier statements about evidence stay ("remains unproven", "not an allegation of espionage", "attendance at a hearing is not an allegation").
- **Draft narration cut:** II dead-man switch ("The first version of this subsection said no…"); II "when this passage was first written" ×2; V Ben-Menashe ("Correction, made in the open… Until this revision…", "should never have implied it"); V h3s retitled "The narrator problem - the basis, stated" and "Eleven months in 1991 - the hinge on one line" (ids unchanged); II primary-and-liaison ("The objection this report raised last time…", "The earlier version…"); XXV close "the receipt gloss corrected above".
- **Pollard (fixed with the draft note, as recorded on 21 Oct):** "Israel apologised and disbanded the unit, the apology delivered by Shimon Peres" (no primary found) and the Peres bridge to Maxwell and Epstein (an anti-map chain) are gone. Now: Israel's "rogue operation" claim, then its 12 May 1998 statement that Pollard "served as an Israeli agent handled by senior members of the Scientific Liaison Bureau (Lekam)".
- **Facts corrected:**
  - XIII Göbekli Tepe: slope slides, not deliberate burial (Clare/DAI 2020, read 18 Oct; DAI's servers time out from here today); alignments contested by the excavators.
  - XIII Younger Dryas: the cooling is documented, the impact is contested (platinum spike "about 45 years after"; PLOS One retracted two Comet Research Group papers). Both re-verified with `vq.py` today. The xref chain "→ Göbekli Tepe Burial →" is cut.
  - XVI USS *Liberty*: neither government's official account found premeditation (Clifford; Israel's "innocent mistake"); the dissent is inside the US record (Tordella, "A nice whitewash"). Quotes from `research/ISRAEL-US-B`.
  - XXIII: the two hijackers were not put forward for a watchlist until 21–23 Aug 2001 (Wikipedia, `vq` OK).
  - II: "no payer has ever explained what they bought" becomes "on a scale nobody has explained".
  - X: "CIA-funded Palantir" becomes "In-Q-Tel, the CIA's venture arm, among its early shareholders".
  - XXV: nine written entries; the player has 18 tracks, 7 of them written up, and 11 without an entry (all named).
  - The masthead's guide "at the foot" is now "near the end"; XIII's dangling "(see the tiering note below)" is cut.
- Scale line 285 / 1,166 / 168. Cards 102 OK; summary quotes 108/108 OK (KJV cache re-fetched).
- **Still on file, not done:** the two-axis grading (item 4; retitling, item 3, was done and reversed, see the top of §7); XV's stale ICC paragraph and "AIPAC → Netanyahu's addresses" line; "Dimona – false walls"; XX's Skunk Works dates; III's stale graph figures; XX's Lutnick/Cantor/Tether relocation line; house numbers in III/IV and on the map (§2; flagged earlier as his call); XVI Tremonton symmetry; DialectForge's claims on `/countermeasures`.

**THE TONE TOOLS SAY WHAT THEY ARE, NOT WHAT THEY DO — 27 Oct 2026, live.** The author pasted an outside review ("how professionals would view b0b.dev"), asked *"How do we improve here"*, and answered the four-item plan with *"C00L L3TS G0"* (item 1, the one offered to start).
- **The review, checked:** mostly it describes the framework (it quotes "The intelligence agency is the artwork"); its law-enforcement and military points miss the brief (the tiers are analytic grades in the ICD 203 sense, not rules of evidence; ARC Shield is a hearing-dose meter and evidence recorder). **Its one point with teeth: the tone pages asserted effects in the site's own voice that the report would kill.**
- **What the pages said, now gone:**
  - the 20–22 kHz sweep "Jams cross-device tracking beacons & acoustic data exfiltration" and was "humidity-adaptive" / "WATER PLANET OPTIMIZED". **The code reads no humidity: it is a fixed 4 s triangle sweep at -60 dB**, above what most speakers play, and untested against any beacon;
  - tone labels "Pain Relief", "Tissue Healing", **"Love / DNA Repair"** (the guide already tiers Rein's 528 Hz claim as unreplicated), "Calm", "Higher Self" and the rest;
  - "sub-harmonic body-water resonance", "Earth's electromagnetic heartbeat", "binaural entrainment", "humidity compensation" (a fixed +2.5 dB shelf);
  - **"ANIMAL-SAFE … safe for all pets"** on every tool (dogs and cats hear above 20 kHz);
  - the WebRTC and canvas guards described as protecting the reader: they rewrite functions on b0b.dev's own pages only;
  - the guide's "customizable tinnitus relief" and "factory reset … to maximize performance"; the countermeasures footer's "No data collection" (pages are counted in aggregate) is now "No tracking scripts".
- **Now:** each tool says what it is. Names changed, **URLs unchanged**: HEALING TONES → SOLFEGGIO TONES, PROTECTIVE TONES → BINAURAL & NOISE, ULTRASONIC SHIELD → ULTRASONIC SWEEP, "sacred frequency instrument" → "frequency instrument". Tone labels are frequencies ("Solfeggio", "A = 432 Hz"); Alpha/Beta/Gamma stay as EEG band names; the chant presets keep their tradition names. Files: `countermeasures.html`, `countermeasures.js?v=3`, `cm-engine.js` (orphan), the four tone pages, their manifests, the classic map's toolkit, `/lab`'s link (`map-gl.js?v=6`), seo-meta (5 entries). **87 dead i18n lines deleted** (`info.*`, `freq.*` in seven to twelve languages; no page used them; `i18n.js?v=4`).
- **Not touched, his:** section 6.3 of the ARC Shield guide (his "ancient acoustic knowledge"; only its stale pointer to "the ARC Shield's protective section" now points to `/tones/healing`); the AI report's "Sacred Frequency Sabotage"; **DIALECTFORGE's marketing on `/countermeasures`** ("makes AI prompt injection structurally impossible", "Patent pending", "a completely new protocol") — his product's claims, unverified here, his call.
- Corrections ledger entry `C-2026-10-27-1`. Tested: every tone page and the report's drawer on a phone, toggles clicked, no page errors, no claim words left in rendered text; inline scripts on 7 pages pass `node --check`.
- **Still open from the same plan, his call:** (2) the known page errors on file (Maduro, the shielding lines, the draft notes, "CIA-funded Palantir", XIII's Göbekli/Younger Dryas); (3) retitling VII, IX, X, XII, XIII, XIV; (4) a two-axis grade (source reliability × claim support).

**ONE CARD FROM THE RECORD — 27 Oct 2026, live at `/card`, under the report's epigraph and on `/home`.** The author pasted an outside proposal for a "Fact of the Day / flashcard" system ("B0B / INTELLIGENCE BRIEF NO. 001"). Asked placement and types, he chose **"Report masthead too"** and all four types.
- **What it is:** one question, then (on "Show the line") the report's own sentence that answers it, its tier stamp, and a link to the exact subsection. "Today's card" is the same for every reader (UTC day × 7919 mod the pool, so the whole pool runs before a repeat); "Another card" draws without repeats; filters for The record / Methods / Questions / Connections; "Copy link" gives `https://www.b0b.dev/card?c=<id>`. `/card` also lists every card as plain text for readers without script and for search. Nothing is sent and nothing about the reader is stored.
- **The rule: a card may say less than the report, never more.** `scripts/build-cards.py` reuses the summary's text matcher and requires each quote inside the subsection its anchor names (ellipsis cuts allowed, in order); section and subsection titles are read from the page, not typed. Connection cards must be tier `documented` and both parties must appear in the quote. §2's never-publish names are refused. The prompt is the only text we write, so it claims nothing.
- **102 cards:** 49 record (killed specimens among them show "Claim tested" with an UNSUPPORTED / NOT ESTABLISHED stamp, the prompt being the claim), 23 methods, 18 open questions, 12 connections (institutions, companies, the dead or convicted only). Drafted by four agents against a brief (scratch `cards/BRIEF.md`), every card read by me. **v1 has no living, uncharged person as a card's subject.** Cut on review: the Bitcoin "first regulator" card, the NSPM-7 indicia list (a list without the page's reading), the 2025 judge clause in the 9/11 symmetry card (the page grades it a motion-to-dismiss ruling), the Carbyne concealment line (beside a living chairman), "a secular Jew" in the Little Saint James card, the abolition-debt-to-2015 sentence (its refinancing caveat would not fit).
- **Changed from the proposal:** no "Intelligence Brief" header or issue number (principle 7; and §2 bars "the institution", which its closing line used); no per-reader measurement (`/stats` is aggregate-only) — counting card views and click-throughs per day is possible and his call.
- **Files:** `site/card.js?v=2`, `site/card.css?v=2` (works on both the theme.css pages and the `/start` family's palette, light and dark), `site/card.html` (owned by build-cards.py), `scripts/cards/cards.json` (edit here). ONE CARD in the report's top nav and sidebar, `/home`, and the `/start`-family nav. Route, sitemap and seo-meta wired; seo 60/60, security 35/35.
- **Tested** (scratch `cards/t.js`, one fresh port per scenario because of the 60/min limiter): report desktop and phone, `/home`, `/card?c=` on a phone, `/card` light — no page errors, no horizontal scroll, reveal works, links land on real anchors, 30 "another" clicks under Methods gave 22 distinct of 23.

**IRON & WINE OFF THE BAR; L.A. MASS CHOIR "THAT'S WHEN YOU BLESS ME" IN ITS SLOT — 27 Oct 2026, live.** Author: *"Remove Lilith song and replace with "that's when you bless me" LA choir"*. Iron & Wine "Evening on the Ground (Lilith's Song)" (`sP3V7PxjdQo`) is out. In its place (6th of 18): L.A. Mass Choir, "That's When You Bless Me" (`brxOrz5pqv4`, L.A. Mass Choir - Topic, checked with YouTube oEmbed). **Two Topic uploads exist** (`brxOrz5pqv4`, `Vu16cpQwzcc`): one carries the 1999 Light Records issue (*The Mass Hits!*), the other a 2009 Smith & Co. compilation. Which is which could not be read (YouTube refuses this environment); both are licensed label uploads. The song first appeared on *Can't Hold Back* (Light, 1989). `LS_KEY` `b0b_signal_v15`; `signal-bar.js?v=22`. XXV's list of tracks without an entry now names it in place of *Evening on the Ground*.

**THE SIGNAL BAR GROWS UP; THE BOTTOM OF THE SCREEN IS ONE DOCK — 27 Oct 2026, live.** Author: *"Faith no more - we care a lot as well. Make the audio player more sophisticated / Promises Promises remove / Everlasting love is an upbeat song"* (asked which version: **Carl Carlton**), then, with a phone screenshot, *"Bottom nav needs cleanup"*.
- **Tracks:** Naked Eyes "Promises, Promises" removed. Added Faith No More "We Care a Lot" (`O2KpEva4As4`, Faith No More - Topic, Rhino/London-Sire, the 1987 *Introduce Yourself* recording) and Carl Carlton "Everlasting Love" (`SqT1y5Qi6l0`, Carl Carlton - Topic, Universal). Both checked with YouTube oEmbed; the UPROXX "official video" copy of We Care a Lot was passed over (not the rights-holder). **18 tracks.** `LS_KEY` is `b0b_signal_v14` (a slot changed tracks).
- **Player (`signal-bar.js?v=21`):** a track list (☰) opening above the bar, current track marked, tap to play; shuffle (never the same track twice running; PREVIOUS walks back what actually played); repeat all / this track; a volume slider (desktop, wider than 900 px); PREVIOUS restarts a track more than 4 s in. Modes and volume are kept in the bar's stored state. On phones shuffle and repeat live in the list's header, and the bar shows the track name instead of the word SIGNAL.
- **The dock (phone screenshot: soundtrack chip and back-to-top lying over the countermeasures bar, the narrator button over back-to-top):**
  - `countermeasures.js?v=2` publishes `--b0b-cm-h` (36 / 32 / **0 px at 600 px and below**). On phones its collapsed bar is gone and a shield button in the signal bar (with the count of active measures) opens the same drawer. With no signal bar on the page, it keeps its own bar.
  - `signal-bar.js` publishes `--b0b-dock-h` = signal bar + countermeasures bar. Back-to-top sits on it at the right; the narrator's button (`report-tts.js?v=10`, 44 px on phones) stacks above it; the soundtrack chip (`soundtrack.js?v=7`) takes the left, and on the report's desktop layout sits beside the 260 px sidebar instead of on it.
  - The maps read the variable too: `map-gl.css?v=4` (`--mg-bottom`), and the classic map's Leaflet controls.
- **Tested** (scratchpad `dock/t.js`, YouTube stubbed): phone 390 and desktop 1280 show no overlaps, no horizontal scroll and no page errors; list click plays that track; repeat-one replays; 12 shuffled ends gave 11 tracks with no immediate repeat; shuffle PREVIOUS returns; volume reaches the player. `/map`, `/lab`, the classic map and `/home` load on a phone with no errors (`dock/m.js`). **Not tested on a real phone or against live YouTube.**
- **Seen in his screenshot, not edited:** II's Andrew subsection opens "has never been charged with or convicted of any crime", a §2 shielding line of the class already flagged (Wexner, VI).

**RAGE AGAINST THE MACHINE "TESTIFY" ADDED LAST ON THE SIGNAL BAR — 27 Oct 2026, live.** Author: *"Add testify by rage against the machine if possible"*. `Q3dvbM6Pias`, the official video on RATMVEVO (YouTube oEmbed; the id comes from the song's Wikipedia page, read through the spider). The bar now has 15 tracks. It was appended, not reordered, so `LS_KEY` stays `b0b_signal_v13`; `signal-bar.js?v=19`. **Same hour, two more appended** (author: *"Add down by hemlock Ernst and Kenny segal"*, *"Add promises promises by naked eyes"*): Hemlock Ernst & Kenny Segal "Down" (`qphWnknZeaw`, Samuel T. Herring - Topic; *Back at the House*, Ruby Yacht 2019) and Naked Eyes "Promises, Promises" (`_sDy333YoMM`, Naked Eyes - Topic). Both are licensed label uploads, checked with YouTube oEmbed. Which recording the Topic copy of "Promises, Promises" carries (the UK single or the US re-recording) was not checked. The bar now has **17** tracks; `signal-bar.js?v=20`. If the label blocks embedding on other sites, the bar's error handler skips it and the console names YouTube's error code. **No XXV essay was written for it.**

**"SPIDER HOLE" OFF THE BAR; billy woods "YEAR ZERO" IN ITS PLACE — 27 Oct 2026, live.** Author: *"Remove billy woods spider hole. Replace with billy woods i think title is day zero"*. billy woods has no "Day Zero"; the nearest title is **"Year Zero"** (billy woods & Kenny Segal feat. Danny Brown, track 8 of *Maps*, 2023). Played from the artist's own channel (`2oDSwJmm-g0`, official visualizer, @billywoods_backwoodz; YouTube oEmbed). It holds the same slot (8th of 14). The old Spider Hole entry was a censored edit on a private account, so this also drops one of the bar's private-account exceptions. `LS_KEY` is now `b0b_signal_v13`, so no one resumes Year Zero at Spider Hole's saved position; `signal-bar.js?v=18`. XXV's list of tracks carried without an entry now names *Year Zero*. **Flagged, not edited:** that same sentence still says "Four of the twelve"; the bar has 14, and 3TEETH and GHOSTEMANE also have no entry.

**THE SIGNAL BAR ROLLS ON TO THE NEXT TRACK — 27 Oct 2026, live (`signal-bar.js?v=17`).** Author: *"The audio player should autoplay to next track"*. On a track's end the bar called `goTrack(1)`, which saw the player as "ended", not "playing", so it only **cued** the next track and then sent `playVideo()`. A play sent while a cue is still loading can be dropped, and the bar stopped. `goTrack(n, play)` now loads and starts the next track in one `loadVideoById` call, both on a track's end and after a dead track's error. Under a film the next track is still only cued and resumes when the carousel closes. Proven both ways against a stub player (scratchpad `sigtest/t.js`): old code ends on a cued, stopped track; new code is playing the next one. **Not tested against live YouTube** (it refuses this environment). Background tabs on phones can still stop playback; that is the browser.

**@omcomma IS LINKED — 27 Oct 2026, live.** Author: *"Add @omcomma twitter"*. `https://x.com/omcomma` (the account whose post supplied the OM COMMA film), in the slots @_lovebeing_ held: the report's top nav and sidebar (white, after ERC-1155), `/home` (nav, a "Signal" row after Author, footer "X"), and both map headers (`map-gl.css?v=3` restores `.nav-x`). **This does not lift the 26 Oct rule: @_lovebeing_ stays off.** *Removed again the same evening at his instruction ("remove omcomma"); see the entry at the top of §7.* JSON-LD `sameAs` not touched.

**24 PICTURES ADDED ACROSS THE REPORT — 26 Oct 2026, live.** Author: *"Add more pictures throughout report"*.
- **The source is the listen-mode library only** (`site/img/listen/`, `site/listen-media.js`): each image is already licence-checked (PD, CC0 or CC BY) and face-checked. Nothing new was sourced.
- **Placement:** a script matched each item's curated trigger phrases (`scripts/listen-media-keys.json`) against the `<p>` text of image-poor sections (II, VII and XX skipped). It kept only items whose subject appears in the first ~220 characters of the paragraph, with no faces, one per subsection and one use per item, capped by section size. Every pick was then read in context and every image viewed on a contact sheet.
- **Cut on reading:** the BIS tower (a "dualism" paragraph), MQ-9 for an RSF drone strike (wrong force), the US National Security Act page beside the UK NSA arrests (naming error), a rooftop CCTV for "What an ALPR is", the Queensboro Bridge for New Amsterdam, CIA/FBI shots in Section I, and all of Section I (his testimony is not illustrated).
- **The one face kept:** Reagan receiving the Tower report (Reagan, Tower and Muskie, all dead).
- **Where they went:** V ×2, IX, X ×3, XII, XIV, XV ×3, XVI ×5, XVII, XVIII, XIX, XXIII ×5.
- **Captions:** plain description plus credit and licence, linked to the source page where a film spec records one. They make no claims.
- **Still without pictures:** I, VI, VIII, XI, XIII, XXII, XXIV, XXV.

**KUSHNER TEST CASE IN XXIII — 26 Oct 2026, live. `test-case-jared-kushner-how-a-private-citizen-brokers-state-deals` (XXIII toc 23 → 24, placed after ShinyHunters, before the 9/11 topology).** Author: *"Yes add all three"*: the UNSC 2334 lobbying, the mechanism of his civilian power, and Charles Kushner as a naming guard.
- **What it says:**
  - **the acts:** the Putin session (Interfax), the Board of Peace board, the spoken "Envoy of Peace", the White House's "volunteer basis", and his own "just a volunteer";
  - **the mechanism:** the 2017 OLC opinion's two routes; nothing written exists for 2025–26; EO 14311 / Witkoff's appointment as the contrast; why the ethics, SGE, §2651a and Logan Act rules do not reach the arrangement; OLC's 1977 test as the counterweight, marked as the report's analysis;
  - **the challenge:** *CREW v. Kushner* as allegations, with the answers (Mizelle "without merit", the White House "unserious, Trump-deranged organization", his "never taken a diplomatic action to benefit Affinity");
  - **2334:** the act documented (Mueller Vol. I), the Israeli request attributed;
  - **the naming guard:** Charles's 2004 plea, 2005 sentence, 2020 pardon and 2025 ambassadorship;
  - **the grade:** a documented gap in accountability, now in court, and **not evidence of a hidden sponsor**, because the role is avowed. What would move it: a ruling, a written instrument, or an ethics/IG finding.
- **Not on the page, deliberately:** the "Mossad asset" grading, Wiles, the 2020 FBI informant document, the Logan Act read against 2334. The calibration entry (XX) gained a one-clause guard linking the test case.
- vqdraft: 30 quotes, 0 failing. Scale line 285 / 1,167 / 168.

**KUSHNER AS "MOSSAD DENIABLE ASSET", HIS CIVILIAN POWER, THE EPSTEIN PATTERN — researched 26 Oct 2026, HELD. `research/KUSHNER-ASSET-POWER.md` (synthesis) + `KUSHNER-{E-ASSET,F-POWER,G-CONTINUANCE}.md`; 169 quotes, all vq OK.** Author: *"look into kushner as a mossad deniable asset.  why does he have so much power as a civilian brokering state level deals.  epstein-esque continuance, re: power structures"*.
- **Asset: unsupported.** He reaches rung 2 with the Israeli government and rung 3 with private Israeli firms; no intelligence service appears anywhere. The phrase traces to Rick Wiles (2019, the dual-loyalty trope) and to a 2020 FBI informant report in DOJ's Jan 2026 release (hearsay; read via outlets, not opened). New and documented: he "led the effort for the Transition Team" against UNSC 2334 (Dec 2016, Mueller Vol. I), which was open policy. The documented foreign state money is Saudi, Qatari and Emirati.
- **Power:** the President's foreign-affairs power lent to him. There is no written appointment, oath, SGE designation or disclosure for 2025–26, and the title "Special Envoy for Peace" exists only orally. The 2017 OLC opinion offers both the formal route and an "unofficial, ad hoc basis". The Logan Act, §2651a(j) and the ethics statutes do not reach him as he is used. The constraint is *CREW v. Kushner* (four counts). Witkoff has the office and files disclosures; Kushner does neither.
- **Epstein pattern: fails.** His role is avowed, not deniable. There was no immunity and he has no conviction. Rival B (open wealth plus family power) explains it. Kushner ↔ Epstein: one 2013 Observer gala invitation (attributed), below rung 1. The estate set was not text-searched and jmail was not used.
- **Withheld from the public repo:** the informant document's crime allegations against the family, and its named third parties. One Q line was removed from the committed copy of G for this. **Opening EFTA00090314 is his call.**
- **For the page, his call:** the 2334 lobbying, the mechanism (as XV or XXIII), and Charles's plea, pardon and ambassadorship as a naming guard. Asset framing is not recommended.

**KUSHNER PAGE FIXES AND AN AFFINITY MARKER — 26 Oct 2026, live.** Author: *"yes"* to both offers: fix the 12 Kushner page errors in `research/KUSHNER.md` §5, and add Affinity to the map with a line to PIF.
- **Report, fixed in place (no narration):**
  - **XX asset relocation:** "Kushner/Affinity Partners" removed from the resources list; it is now "sovereign wealth (Saudi Arabia's PIF among others)".
  - **The NEOM chain is cut** from the xref list (now "Kushner → Affinity Partners ← Saudi PIF", VII · XII) and from the Trump and Kushner calibration entries.
  - **VII:** PIF's $2B is June 2021 (Senate Finance); "PR risks" is gone; the screening panel and MBS's override are attributed to the NYT via House Oversight letters (also in the VII apex line and XII layer 2); $6.16B (Form ADV, Mar 2026) replaces $3B / ~$4.8B; CREW v. Kushner added.
  - **XII Indian Creek:** on the council 2024 to mid-2026; the convergence line now states its limit and points to the section's own verdict; "13 officers" becomes the directory's 11; "private government", "designed for 500+" and the arrow chain are cut; the village's "a private, residential municipality" is quoted.
  - **IV:** no title on 2 Dec 2025 (TASS: "US businessman"); Mueller's Gorkov dispute and "cannot rule out"; the Josh line is now an identity guard with no count.
  - **XII layer 2 Bilderberg:** Montreux, Pompeo joined him (AP, RSI).
  - Calibration entry: 3 nodes are Senior Advisor 2017–21, Affinity, and the contested envoy title.
- **Map:** new marker "Affinity Partners (A Fin Management LLC), Sunny Isles Beach" (VII, financial), placed by the Census geocoder at the Form ADV principal office (the ADV's private-residence box is unchecked; street only in the ctx). New line PIF → Affinity, tier 3. Indian Creek marker ctx updated. **Map 1,167 / 456**; seo-meta, KML, map-list, map-data, listen-places rebuilt.
- Corrections ledger entry `C-2026-10-26-1` on `/retractions`.
- **Not done:** the Section III graph figures ("1,000 plotted locations … 396 documented ties", the townhouse ranked second, 71% within six hops) are stale against 1,167 / 456 and were not recomputed; Affinity has one line, so he does not rise into any most-connected ranking. **Also flagged, same passage as the Kushner cut:** XX's relocation line still lists "cryptocurrency reserves (Lutnick/Cantor Fitzgerald/Tether)", the same living-person defect.
- **Research started the same turn:** *"look into kushner as a mossad deniable asset … why does he have so much power as a civilian brokering state level deals … epstein-esque continuance"*. Three beats (asset, power, continuance) in session scratch `kushner2/`.

**HIS X ACCOUNT IS OFF THE SITE — 26 Oct 2026, live.** Author: *"Remove my x account"*. Every `x.com/_lovebeing_` link is gone: the report's top nav and sidebar, `/home` (nav, the "Signal" row, the footer "X"), and both map headers (with the GL page's `.nav-x` style). **Do not re-add it.** The report's own citations of other X posts are untouched; they are sources, not his account. Same evening he wrote *"Push kushner info to main as well"*. The research files were already on `main` (`e247882`). Nothing about Kushner was put on the page.

**THE AUTHOR'S WEBSITE IS LINKED — 26 Oct 2026, live.** Author: *"Add my website gianniarone.com"*.
- Placed with his own links: the report's top nav and sidebar (white GIANNIARONE.COM, just before ERC-1155), and in `/home` (nav after FARADAY, an "Author" row in the side index, footer). Link `https://www.gianniarone.com/` (the apex 308s there), new tab, `noopener noreferrer`.
- **Not touched:** the `/start`-family nav, the map headers, and the JSON-LD (no `sameAs`). Any of these is his call.

**JARED KUSHNER — researched 26 Oct 2026, HELD. `research/KUSHNER.md` (synthesis) + `KUSHNER-{A-MONEY,B-GOVERNMENT,C-PAGE-AUDIT,D-PHONE-HACK}.md`; 282 quotes, all vq OK.** Author: *"Lets look at Jared Kushner"*, *"Why is his … not on the list of high connectivity nodes"*, *"Research his news story of phone hack"*.
- **Hub list:** it ranks map locations by drawn lines. There is no Kushner or Affinity marker, and the PIF marker has 0 lines, so he cannot appear. The figure is also stale (1,000 / 396 against 1,166 / 455). Adding an Affinity marker with a tier-3 PIF line is his call.
- **Phone hack since 22 Oct:** nothing confirmed by anyone.
  - Denials: Kushner, Trump ("totally false story … fake news", 23 Oct gaggle) and Cheung ("complete fiction").
  - Demand letter to Condé Nast, 23 Oct; no suit filed.
  - The Dutch MIVD and ministry decline to comment.
  - The JPost pulled its write-up.
  - The Bank of Israel "not aware" (one relay).
  - No congressional action.
- **Page errors found, NOT edited (12, listed in `KUSHNER.md` §5):**
  - PIF July → June 2021;
  - Affinity $3B / ~$4.8B → $6.16bn;
  - "PR risks" unsourced;
  - Indian Creek council seat stale (gone by Sept 2026), and "multiple administrations" wrong;
  - the NEOM chain;
  - **XX's asset-relocation line naming Kushner/Affinity: no document, the most serious.**
- **His 2025–26 status is contested** (son-in-law → "Special Envoy for Peace" in the presidential documents; "private citizen" per the White House). **CREW v. Kushner**, D.D.C. 1:26-cv-03580, was filed 14 Oct 2026.
- **Spider:** `2017-2021.state.gov` is registered as a decoy ("Technical Difficulties"), proven both ways. Its two earlier `/the-abraham-accords/` rows are not to be cited.

**MEYER "MICKY" MALKA — researched 25–26 Oct 2026, HELD. `research/MALKA.md` (synthesis) + `MALKA-A-RECORD.md`, `MALKA-B-APOLLO-BLACK.md`, `MALKA-C-NETWORK.md`; 139 quotes, all vq OK.** Author: *"Research the investments of meyer malka, he was appointed to the board of Apollo Global Wealth leon black and runs node foundation.  6 degree node spread"*. The page had Malka, Ribbit, Robinhood and Nubank 0.
- **The Apollo claim:** Apollo Global Management, Inc. appointed him an independent director on 20 Oct 2026, **effective 1 Jan 2027**. "Apollo Global Wealth" is a naming error: it is a business unit and has no board.
- **Black:** left the board 21 Mar 2021, so they never sat together. He is still a 6.6% holder with an unused nomination right. No document ties the two men.
- **NODE:** the Infinite Node Foundation (digital art, Palo Alto). Malka is Secretary and director; the President/CEO is someone else. So "runs" is overstated.
- **Ribbit:** $20.8bn regulatory AUM (Form ADV, Mar 2026); stakes in Robinhood, Coinbase, Root, Wealthfront and Figure from filings.
- **Boards:** MercadoLibre 2013–21, Nu (Form Ds 2018–21), Ribbit LEAP, Robinhood since 2022. **Never Coinbase.**
- **Epstein:** no documented edge. In the corpus he is one line on a 2012 conference roster, never a correspondent. The documented paths (3 hops) run through hubs (Apollo, JPMorgan), which is the guaranteed null.
- **Flagged, not edited:** the page's network node "Apollo/Black" merges a firm and a man.
- **Two corpus-method problems found; both his call (§4 trap):** jmail's robots.txt disallows `/api/`, and its search returns truncated text, so earlier re-filtered counts are floors.

**THE AUTOMATED SWEEP RAN BUT COULD NOT PUBLISH — 25 Oct 2026, its first run. NOT FIXED FOR FUTURE RUNS until the author acts.** Author: *"check to make sure our automated sweeps are publishing"*.
- **27 Oct 2026, second run, same failure.** Author: *"why are the sweeps not working"*. Fired 10:31:50 UTC into `cse_01TtBwtn1GJ5bXQ5MYmkNGnp`, ended 10:33:04. It cloned over public HTTPS, ran the §0 `git push --dry-run`, got the proxy's 403 ("not in this session's authorized repository set") and stopped before any research, as the runbook says. Nothing was researched or written, and the author got a push notice. **The task still reads `SUCCEEDED`: that only means the session ended cleanly.** Check the fired session's transcript, never the status. The environment is `B0B` (`env_01FwsB2fnCiGx6gQhgXzHQwm`), not the Default one, so the Repositories setting should be offered there. The newest XV update is still 23 Oct. Next fire: 29 Oct 10:31 UTC.
- The scheduled task (`trig_01RFnX93MHDF3rvLbtbVqjsw`) fired at 10:31 UTC into session `cse_01VhEq7nhx4WQCKxAAFE3hPo` and did the whole sweep. That included the 25 Oct XV update (`xv-status-update-25-october-2026`), the HELD file and a §7 entry, all in commit `f2669f2`.
- **The push was refused** with the git proxy's 403: "not in this session's authorized repository set". The fired session had the repo cloned over public HTTPS but **not attached as a source**, and it had no `add_repo` tool. The task reads "succeeded" because the session ended cleanly. **Nothing went live.**
- The run's work exists only in that container and in the bundle and patches it sent the author (`sweep-2026-10-25.bundle`, `0001-XV-status-update-25-October-2026-…patch`). That session will not hand them to another session without his word, and it has no tool to do so anyway. **To publish it, the author uploads the bundle or the patch to a session with the repo attached.**
- **Fix for future runs, his to make:** a session's repositories are chosen when it starts, and `create_trigger` stores none. Add the repo under Repositories in the cloud environment's settings, so every fired session gets it. Or have the task fire into a standing session that has it.
- **`RUNBOOK.md` §0 now proves push access first** (`git push --dry-run origin HEAD:refs/heads/claude/sweep-access-check`). A run without a credential stops before any research and says so, instead of stranding a day's work.

**DAFT PUNK LEADS THE SIGNAL PLAYLIST; GRACELAND IS OFF THE BAR — 25 Oct 2026, live.** Author: *"Can you have the daft punk song play first now. remove paul simon graceland"*. "Playlist" read as the signal bar, as on 22 Sept and 24 Oct.
- "Veridis Quo" (`HhZaHf8RP6g`) is first and 3TEETH is second. "Graceland" (`GP6a-7MP91g`) is removed, leaving 13 tracks.
- `LS_KEY` is now `b0b_signal_v12`, and `signal-bar.js?v=15` is on the report, home and both maps.
- **Not touched: XXV's written "Third signal - Paul Simon, 'Graceland'"** (`xxiv-third-signal-paul-simon-graceland`), with its embed and contents row. Whether it goes too is his call.
- The sweep session made the same change (`89d8a58`) and could not push it. This is a separate commit, so do not apply `89d8a58` on top.
- **Same evening, GHOSTEMANE "AI" added last** (author: *"lets add ai by ghostmane to playlist"*). It is `N3XbZvD3lRo`, the official video on the artist's channel @ghostemane (YouTube oEmbed; the oEmbed also confirms it can be embedded). The bar now has 14 tracks. The track was appended, not reordered, so `LS_KEY` stays at `b0b_signal_v12`; the tag is now `signal-bar.js?v=16`. **No XXV essay was written for it.**

**THE SUMMARY NOW COVERS THE WHOLE REPORT — 24 Oct 2026, live at `/summary`.** Author: *"The report brief needs to cover the entire document not just epstein and Maxwell"*. Read as the monthly PDF.
- **Shape:** 24 pages (the build now allows 8–24):
  - the lede names the whole scope;
  - Part I adds "Beyond one case": six records from XVII, XXIII, XV and IX, kept apart and offered as no chain;
  - Part II adds "The rules it uses by name";
  - **new Part III, "Every section, in order"**: one entry for each of the 25 sections plus the researcher's guide, in the masthead's own groups;
  - "What you can do" is now Part IV.
- **Build:** `tour_gaps()` stops it unless there is one Part III entry per `<h2 id>` section, proven both ways. 108 quotes checked, 0 missing.
- **Method:**
  - five readers digested the sections (scratch `summary2/digest-*.md`);
  - three fresh reviewers read the draft against the page (`review-1/2/3.md`; two were stopped by a usage limit and resumed);
  - findings: 3 errors, 2 overstatements, 1 omission and about 20 imprecisions, all fixed.
- **Errors fixed:**
  - "Before 11 September 2001 … neither was watchlisted" became the reporting from January and March 2000, "watchlisted then". Both men were put forward for watchlisting on 21–23 Aug 2001 (Wikipedia, read once, not ledgered).
  - XXV "ends in the author's own voice" is wrong: the close is the report's tiered commentary after his statement.
  - XV's killed specimen, "a capture that never happened", is cut (see the flag below).
- **Overstatements and other fixes:**
  - XV's method is now "since October" only. The 3 Sept update rests on Wikipedia's portal and prints counts with no owner.
  - "Every toll above…" is attached to Sudan's strikes.
  - The XVI line: the laws were read in their own texts, the programmes were not.
  - IV's third bin is "unsupported", not "false".
  - X: the unknown financer is the Octagon's, not the cameras' command centre.
  - XII: the network verdict survives.
- **Page errors the reviews found, NOT edited (his call / next pass):**
  - **XV 3 Sept box: the Maduro capture "is not true"** — reviewer: US forces captured Maduro and Cilia Flores in Caracas on 3 Jan 2026, arraigned in New York 5 Jan (Wikipedia, PBS, NPR via search only, not read at source). The box checked only Aug–Sept 2026. **Read at source before editing; if confirmed it is a correction.**
  - Two §2 shielding lines survive: II's "Leslie Wexner has never been charged with a crime." and VI's "No living figure named is accused of wrongdoing". There are also "no charge has followed" / "none a criminal charge" in II's late-period stream.
  - Banned edit notes survive in II (the FOIA subsection "The first version of this subsection said no…"; "when this passage was first written") and in V (the Ben-Menashe "Correction, made in the open"; two h3 titles narrating drafts).
  - IX/XXIII: "neither was watchlisted" carries no date.
  - XXV's first signal still says "Eight tracks", and there are nine.
  - The masthead puts the guide "at the foot", but it sits before the close.
  - X: "CIA-funded Palantir" survives; XIII has a dangling "see the tiering note below".
  - The digests' wider flags (house numbers in III/IV, VI's breeding subsection, numerology in II's 1953 block) are in `digest-*.md`.
- *Deploy note:* the summary sat on the branch only (`07efe66`) while `main` took the counter and signal deploys; built PDFs were not committed until reviewed.

**3TEETH "PUMPED UP KICKS" LEADS THE SIGNAL PLAYLIST — 24 Oct 2026, live (`a803e5e`).** Author: *"place this song on playlist as first. 3teeth - pumped up kicks"*. "Playlist" read as the signal bar (the bottom-strip player of XXV's signals), as on 22 Sept.
- Its official video from the band's own channel (`lYIsZr9L_rM`, @3T33TH, identified by YouTube oEmbed; found embedded in Loudwire's 2019 article). It is the 2019 single from *Metawar* (Century Media).
- `LS_KEY` is now `b0b_signal_v11`, because a stored index points into the old order. `signal-bar.js?v=14` on report, home and both maps.
- **Not touched:** XXV's written signals (no essay was added and none renumbered) and the site soundtrack, which TOOL still leads. Either is his call if that is what he meant.
- Live: `check-live` OK; four reads of the report and `/home` carry `?v=14`, with this track first.
- *Deploy trap:* the branch carries the unreviewed summary commit, so this went to `main` from a branch reset to `origin/main`, with the summary commit cherry-picked back on top. A `$VAR` set inside an `&&` chain came back empty; use the literal sha.

**THE VISITOR COUNT WAS COUNTING MY DEPLOY CHECKS — 24 Oct 2026, fixed (`0386655`), live.** Author: *"Are page count and page views broken again"*.
- **Not broken:** both counters moved during the check (visits 2,010 → 2,019 and views 16,944 → 16,972, 15:18–15:45 UTC). One browser-style load of `/stickers` was counted at once in `/api/stats` (views, browser and arrivals each +1).
- **Why it can look stuck:**
  - the figure was cached 60 s per instance;
  - "visits" moves only when someone arrives from outside the site (40–80 a day), not on a reload or a click inside it.
- **Found on the way, all three fixed:**
  - **`/api/gate` still counted a visit on every POST, although the gate has been off since 19 Sept.** With the gate off no page calls it (`/pixel.html` is a 404), so every increment since then was a script. `check-live.js` POSTs once per 20 s poll.
    - The gate part rose from 1,686 (22 Oct, the `/stats` entry below) to 1,878 when the fix went live (24 Oct). So the public "Visitors" figure carries **at least 192 script requests**, plus an unknown number from 19 Sept to 22 Oct. My deploy checks are among them.
    - The `basis` line said "gate entries to 19 Sept 2026". That was false.
  - Each read summed one KV lookup per day since 22 Oct, so its cost grew by one command a day (~370 per read after a year).
  - A failed KV read printed "Visitors: 0 · 0 page views"; a failed second step printed the gate figure alone.
- **The fix (`server.js`; `stats.js?v=4`):**
  - `/api/gate` counts only while `B0B_GATE=on`. It still sets the cookie, so `check-live.js` and the proxy keep working. The gate figure is now fixed at 1,878.
  - `/api/visitors` reads in one pipeline: MGET plus yesterday's and today's `a`, three commands. **Complete days are summed once into `b0b:arr_roll` `{through, sum}`**: the days from `daily_since` up to, not including, `through`. Any instance rolls it forward, and it is written as one value from days that no longer change, so two writers agree. This also ends the 400-day TTL horizon in the 23 Oct entry.
  - The cache is 15 s (was 60 s). A failed read serves the last good figure or a 503, which leaves the bar empty. It never prints 0.
  - The `basis` line and `/stats` now say the gate counter ran until 24 Oct, counting only scripts after 19 Sept, so the gate part overstates readers.
- **Tested** (scratchpad `counters/test-counters.js` against `mockkv2.js`, a fresh server per read so the cache never hides a store read):
  - the new code passes 16/16;
  - HEAD fails the seven defect checks and passes the same page-counting checks;
  - security 35/35, seo 59/59; `/stats` renders the new sentence with no page errors.
- **Live, 24 Oct:** a POST to `/api/gate` left the gate figure at 1,878; arrivals 139 = the daily `a` (14 + 80 + 45); visits = gate + arrivals (2,017); four reads of the new `basis`; `/stats` serves `stats.js?v=4`.
- **His call, not done:** the gate part still holds at least 192 script requests, and `check-live.js` POSTed before 19 Sept too. Keep it with the caveat (as now), or show visitors as arrivals only from 22 Oct.
- *Trap:* Node's `fetch` (undici) replaces a `Sec-Fetch-Mode` header with `cors`, so every test load was classed "other". Use `http.get` to test the browser classes.
- *My own checks added to the count on 24 Oct:* three arrivals (two Playwright loads of `/report` and one curl with navigation headers) and a handful of views. `/stats` is not counted.

**"THE PATTERN IS NOT AMERICAN" REBUILT FROM THE RECORD — XVI, 24 Oct 2026, live.** Author: *"Roger that skip 1. Lets do 2. Expand report"*, i.e. the subsection the FOI registry was built for, `xvi-the-pattern-is-not-american-international`.
- **What it is now** (~8,800 words; was ~1,735): 14 law rows (Argentina new) and 23 programmes (23 Sources and 23 Record lines).
  - Four programmes are new: NZ Operation Burnham, Israel's Kafr Qasim trial records, Japan's secret pacts (*mitsuyaku*), India's Henderson Brooks–Bhagat report.
  - Every programme carries a Sources line and a **Record** line: where its primary record sits now, and whether a machine can search it.
  - The closing paragraph is rewritten:
    - the laws split two ways: services outside the law by name or class (UK, Australia, Germany, Israel, India), or inside it and refused case by case;
    - India's s.24 proviso, Brazil's art. 21 and Argentina's art. 8 write human-rights abuse back in, and South Africa has its s.46 override;
    - destruction came by written instruction, or under records rules the state still defends;
    - Japan's Supreme Court puts the burden of proof on the requester;
    - Burnham is the symmetry case: failure, not design.
- **Method:** three researcher beats. Notes are in session scratch `xvi/xvi-{commonwealth,south,europe}.md`: 305 + 399 + 369 quote lines, all `vq.py` OK. The page's quotations all match cached bodies (`vqdraft`).
- **Page errors, fixed in place (no narration):**
  - Japan: the "60-year" secrecy cap is 30 years, extendable.
  - India: the RAW/IB exclusion carries the s.24 proviso. CHRI counts 107 users killed (not "80+ killed or attacked").
  - China: declassification exists on paper. "MSS fully classified" is cut, and life imprisonment attaches to the foreign-recipient offence.
  - Russia: 8-FZ (2009) exists. "Putin sealed presidential archives in 2006" is cut.
  - UK: MI5, MI6 and GCHQ are outside FOIA by name. "Glomar" is the US name (*Phillippi*, 1976); the UK's neither-confirm-nor-deny is statutory.
  - **Operation Legacy:** the migrated archive is about 20,000 files (FCO 141). The "1.2 million" is the separate Hanslope collection (the FCO's 2015 estimates sum to 1,359,625: our sum).
  - **Bloody Sunday:** "state murder of 14" is cut. Thirteen were killed on the day, and Soldier F was acquitted on 23 Oct 2025.
  - Porton Down: "biological" is cut.
  - Rainbow Warrior: "Five Eyes-adjacent" was a naming error (New Zealand is in Five Eyes, France is not).
  - BND: "200+" becomes the commission's one in ten.
  - Stasi: "1 per 63" becomes the Bundesarchiv's 1 per 89.
  - **Project Coast:** "mostly burned by Basson's handlers" becomes ordered destroyed, with four trunks surviving. "Dr. Death" and the Libya/Iraq trips are cut.
  - Unit 731: "Paperclip equivalent" was a naming error, and "300,000+" is cut. Japanese holdings do exist (an NAJ roster; JACAR has 183 entries).
  - Residential schools: the TRC count is 3,200, not 4,100. Kamloops is now in the Nation's own words, and "burned" is cut.
  - Yemenite children: "Ashkenazi" is cut.
  - Condor: counts are now given by what is counted. "No prosecutions" becomes prosecutions blocked by the 1979 amnesty.
  - Argentina: "officers admitted burning records" is cut.
  - Maralinga: denials came from both sides.
  - McGill: Canada co-funded the work and paid ex gratia sums in 1992; a class action was authorized in 2025.
  - **Section VII's Allan Memorial line** said "settled with surviving victims (2017)". It now says the same as the XVI entry.
- **AI OPT-OUT — HIS CALL, applied conservatively.** I extended his FragDenStaat reasoning ("skip 1": robots.txt names ClaudeBot with `Disallow: /`) to every host cited in this pass.
  - Hosts opted out: The Guardian, BBC, *Christian Science Monitor*, *Foreign Policy*, Al Jazeera, France 24, ConJur, Vermelho, The Local, TimesLive, Deseret, Newsweek, STAT, chinalawtranslate.com, FYI.org.nz, RNZ, law.resource.org and caselaw.nationalarchives.gov.uk. The *Mutua* judgments were fetched from the last before this was noticed; nothing rests on them.
  - **None is cited in the new text.** Lines that rested only on them were cut: Unit 731's 300,000; Lange's "state-backed terrorism"; the Algerian helicopter account; the blocking of the Henderson Brooks blog; the CSM 1992 KGB-files figures; the "black blood" testimony.
  - The Guardian, FYI, *Foreign Policy* and France 24 also block **Claude-User** (user-directed fetches).
  - **Earlier citations to these hosts elsewhere in the report are untouched.** Two questions are his: whether the rule applies report-wide, and whether a ClaudeBot-only (training) block counts.
- **Flagged, not edited:**
  - VII's "Operation Condor (40,000+ killed)" in the Kissinger chain is unsourced.
  - NZ: the GCSB's standing under the OIA is unread (FYI opted out; the GCSB's own pages are an Imperva decoy).
  - Argentina: the current status of Decree 780/2024 is unread (the Boletín Oficial resets the connection).
- **Spider:**
  - Decoys registered and proven both ways: `2009-2017.state.gov` ("Technical Difficulties") and `privacyinternational.org` (a PeerTube shell).
  - `hosts.json` said ×5 that "the author holds" the api.data.gov key. `API_DATA_GOV_KEY` is unset, so it now says he is to sign up himself.
- Scale line 284 / 1,160 / 167. `build-transmissions.py` returned 404 again; the reel is untouched.

**"THE HEART OF THE MATTER", A MONTHLY PDF SUMMARY FOR THE CASUAL READER — 24 Oct 2026, live at `/summary`. Steps: `design/summary/README.md`.** Author: *"Do a report summary for a the causal reader. A pdf. We can update monthly"*, then, mid-draft, *"Do new take from the heart , or at least the heart and mind of the matter at hand"*.
- **Shape (first build; superseded 24 Oct by the whole-report edition, entry above):** 6 × 9 in booklet, 13 pages: navy cover with the seal; the three epigraph verses and the report's own scope line; **I, the heart** (the record as decisions, 1976 → the withheld files, the announcement's structure); **II, the mind** (the grades, the conclusion and its full finding, the rivals, the falsifiers, the sponsor at its tiers, what it refuses to say); **III, what you can do** (the servicemember lines kept verbatim, with Article 94 quoted in full); this edition's counts and "new this month"; a navy back cover with the QR (navy on a thread tile; it must scan).
- **Rule: the summary may say less than the report, never more.** Every quotation is `<q data-src="report">` or `<q data-src="kjv" data-ref>`; `scripts/build-summary-pdf.py` stops on any miss (53 quotes; proven both ways with four planted misquotes). Paraphrase is checked by reading, so **a fresh reviewer read the draft against the page and found 4 errors and 20 imprecisions, all fixed.** Among them: "any living person" (Maxwell is living and convicted; now "living and uncharged"); Maxwell's evidence is not Epstein's ("not evidenced equally"); "do not send classified material to anyone" (the lawful channels take it; the report means *to the report*); the death passage hedged below the page ("the reading the surviving evidence leans toward"); four findings against the sponsor, not two; the author's primary-and-liaison form is "adopted by this report nowhere" (the page's own tier line); 23 correction *entries*, not 23 mistakes; tier 3 is "a documented material relationship", not "material evidence".
- **My draft's own error, recorded:** the first sponsor paragraph under-stated the page, then my fix over-corrected; the page's tier lines decide it, read in full.
- **Build:** `python3 scripts/build-summary-pdf.py` (`--check` for quotes only) fills `design/summary/summary.html` from `edition.json` and `site/data/build.json`, renders in Chromium (`scripts/render-pdf.js`; Playwright global, so `NODE_PATH=$(npm root -g)`), re-titles the bookmarks (Chromium joins wrapped heading lines with no space), sets the metadata, and refuses to write on a stray font, a lost tag tree or outline, a page count outside 8–24 (was 8–16), or a QR that does not decode at 150 and 72 dpi. Writes `public/b0b-dev-summary.pdf` (latest), `public/summaries/b0b-dev-summary-YYYY-MM.pdf` and `public/summaries/editions.json` (sha256 per edition). Run it **after** `check-consistency.py`.
- **Wiring:** `/summary` is a **302** (`MOVING` in `server.js`; the target changes monthly) to `/b0b-dev-summary.pdf`; `pdf` joined the static allowlist. SUMMARY (PDF) in the report's top nav and sidebar, `/home`, the `/start`-family nav, and the Briefing's Holdings.
- **Monthly:** edit `edition.json` (edition, label, number, next, this_month) after the month's last report deploy, change `summary.html` only where the page changed, build, look at every page, deploy. Not scheduled; offered.
- **Page errors the review surfaced, fixed in place (no narration):**
  - the masthead said the report "names no living person in a criminal or intelligence role as proven"; Maxwell is convicted, so it now reads "no living, uncharged person";
  - **two §2 disclaimers had survived**: "he has never been criminally charged" (Black) and "He has never been criminally charged." (Staley). Both removed; the Dechert finding, his denial and the FCA finding stay;
  - a banned edit note, "So the honest position is firmer than the one previously printed." (II, the death), cut;
  - the 2007 NPA was "2008" in four places (II ×2, the Dershowitz entry, a caption); the plea was 2008 and still says so;
  - the primary-and-liaison tier line cited "Section V, finding three"; the findings are in II's fork, now linked;
  - Swartz was "a 26-year-old" when the thirteen counts were brought; he was 25 (born 8 Nov 1986, Wikipedia via the spider; superseding indictment 12 Sept 2012);
  - "a fortune with no identified clients" survived twice (Branch A, rung 4) after the 4 Oct correction that the ledger already records; both now carry the documented-clients wording.
- **Flagged, not edited (argument in II, his call):** Section I's exit-pattern rule ("causation is never asserted") sits beside II's "homicide … the reading the surviving evidence leans toward"; the fork says the cluster "failed" the bridge test while the bridge analysis is less categorical; the report's own Luke 12:7 in the close is not the KJV wording (flagged before).

**THE CRAWLER HAS AN FOI REGISTRY: 133 SOURCES, 15 JURISDICTIONS — 24 Oct 2026. `scripts/spider/foi-sources.json`; guide `research/sources/FOI-SOURCES.md`; beat notes `research/sources/foi/` (229 quotes, all vq OK).** Author: *"Greatly expand our crawler foia data uses to all"*, pointing at XVI `xvi-the-pattern-is-not-american-international`.
- **Scope:** the US, the 13 in XVI's table, and the EU. Each source is a statute, portal, disclosure log, appeals body, civil-society log, archive/API or programme archive. **Every one was probed through the ledger**: 91 answered; the rest are refused, robots, decoy or unreachable, each recorded.
- **`spider.py foi list|probe|search|find`.** `find QUERY` runs every searchable source that last answered (13, each proven to filter with two queries). It files nothing, registers for no key, and never retries a refusal.
- **Best paths:**
  - TNA Discovery API (FCO 141: 21,388 items; Porton Down);
  - Canada's ATI-summaries datastore (205,063 rows);
  - e-Gov API, JACAR (`kw0`, not `keyword=`) and NAJ (Unit 731);
  - TRC CBW transcripts and SAHA AL2922 (Project Coast);
  - CADA open data, SHD and the AN nuclear-test inquiry (France);
  - Cellar SPARQL and EP open data (EU);
  - NARA JFK, the NSArchive and archive.org (US).
- **Opted out, and he has decided it stays out:** FragDenStaat's robots names ClaudeBot/GPTBot (`Disallow: /`). It was queried on 24 Oct before that was noticed, and is now `optout` and skipped unless `--include-optout`. Asked whether to write to them for permission, he answered *"Roger that skip 1"*: no request, no use. LawLibrary ZA declares `ai-input=no`.
- **Keys: wired, not yet held** (`db62269`). His *"Lets do 2"*: govinfo, FOIA.gov, Congress.gov, Regulations.gov and OpenFEC (`hosts.json` `api_key_env`) take one api.data.gov key from the environment variable **`API_DATA_GOV_KEY`**, sent as the `X-Api-Key` header. The ledger records only `auth: "X-Api-Key header from $API_DATA_GOV_KEY"`, or `none (… unset)`.
  - **The spider refuses any URL carrying `api_key=`, `apikey=`, `access_token=` or `token=`** (DEMO_KEY excepted), because the ledger and the repo are public. `foi search/find` skip key-gated sources while the variable is unset.
  - **He signs up himself** at api.data.gov/signup: the form has a reCAPTCHA, which is not solved for anyone. The key then goes into the cloud environment's settings (environment variable or Network secret), **never into the chat, the repo or a URL**. A new session picks it up.
  - Until then the shared `DEMO_KEY` answers govinfo with 429 (one rate limit per IP).
- **Spider fixes:**
  - `decode_body()` reads the declared charset (Shift_JIS pages were mojibake; `vq.py` shares it);
  - `decoy_match()` gained `decoy_redirect_paths`;
  - **~30 decoy rules added to `hosts.json`, proven both ways on cached bodies and live**: CIA reading room → `/system-maintenance/`, 508,740 B, with two such rows already ledgered `ok` and **not to be cited**; Imperva shells (NZ, AU PM&C); uhk-bnd.de, now a betting site; the stasi-unterlagen-archiv.de alias; the Knesset geo-block; e-Gov, Informa.BR, Fala.BR, CIC and gov.cn shells; the F5 challenge at SIAN.
- **Page lines contradicted, flagged, NOT edited (XVI's table):**
  - Japan "60-year" (it is 30, extendable);
  - India "RAW and IB exempt" (the s.24 proviso);
  - China "no declassification mechanism" (State Secrets Law Art. 24 self-declassification);
  - Russia "no FOIA equivalent" (8-FZ, 2009);
  - Project Coast "mostly burned" (not in the TRC passage read);
  - Unit 731 "not Japanese disclosure" (JACAR and NAJ hold entries, unopened).

**DUPONT, TEFLON AND PFOA — researched 24 Oct 2026, HELD. `research/DUPONT-PFOA.md` (synthesis) + `DUPONT-PFOA-A-CORPORATE.md` + `DUPONT-PFOA-B-SCIENCE.md`; 263 quotes, all vq OK.** Author: *"Look into Dupont and Teflon poisoning and Teflon attaching to DNA and children being born with Teflon in their systems"*. Page had DuPont/Teflon/PFOA/PFAS 0.
- **Naming error first:** Teflon is PTFE, the polymer. PFOA (C8) was the processing aid. Every blood and water measurement is of PFOA/PFAS, never PTFE.
- **Documented:**
  - the 1981 DuPont table of eight pregnant workers (normal/defect column, cord-blood C8), not reported to EPA until a plaintiffs' attorney sent it in 2001;
  - the 2005 TSCA settlement, $10.25m + $6.25m, "neither admits nor denies";
  - Leach and the C8 Panel's six probable links ("more likely than not", a settlement standard), with its nulls: **no probable link to birth defects**, miscarriage, preterm birth or low birth weight, ADHD;
  - MDL $670.7m (2017); water systems $1.185bn; NJ $875m (Aug 2026);
  - the federal Chemours decree, announced 24 June 2026, entry unconfirmed;
  - Chemours's disclosed FDCA criminal inquiry, no charge.
- **The 1981 defect count ("two of the seven") is attributed** to NY AG's 9 July 2026 complaint only. "3M placental-transfer finding" is unsupported (a rat-eye note, walked back).
- **"Attaching to DNA": unsupported.** EPA: PFOA "lacks the ability to react with and modify DNA". It binds albumin. IARC 2023 Group 1 rests on animal evidence plus epigenetic/immunosuppression mechanisms in people; human cancer evidence is "limited".
- **"Born with Teflon": documented for PFOA** (100% of Baltimore 2004–05 cord sera; placenta and milk); the name is wrong. US serum PFOA is ~73% lower since 1999–2000.
- **EPA 4 ppt rule:** the 20 May 2026 proposals (exemption to 2031; rescind the other four PFAS) are not final as of 24 Oct.
- **Recommended, his call:** a XXIII Test Case grading the three phrases.

**THE PUBLIC VISITOR COUNT MOVES AGAIN — 23 Oct 2026, live.** Author: *"Seems to have stopped counting visitors ad page views"*.
- **Page views had not stopped** (`b0b:views` 16,539 → 16,540 on a test load; the 23 Oct daily hash at 258 browser loads).
- **"Visits" had stopped:** it was `b0b:visits`, the count of POSTs to `/api/gate`. The gate went off on 19 Sept, so the signal bar's "· 1,860 visits" and the masthead's "Visitors: 1,860" froze. This was flagged on 22 Oct as his call; his report made it.
- **Now (`server.js` `/api/visitors`):** `visits` = the gate total (to 19 Sept) **+** the browser arrivals (field `a`) summed over the daily hashes from `b0b:daily_since`. The payload also carries `gate_entries`, `arrivals` and a `basis` sentence; the signal bar's tooltip shows the basis (`signal-bar.js?v=12`). It is cached for 60 s per instance.
- **Stated in `basis`, not hidden:** 19 Sept – 21 Oct 2026 was never counted. Arrivals are one per entry from outside the site, the nearest like-for-like to a gate entry.
- **Horizon:** the daily hashes have a 400-day TTL, so from about Nov 2027 the oldest arrivals drop out of the sum. **Done 24 Oct (`b0b:arr_roll`, entry at the top of §7).**
- Tested against the mock KV (scratchpad `stats/mockkv.js`, which now has HGET): 1,860 + 12 → a new outside arrival → 1,873; a same-origin load does not count.
- *Trap repeated:* `pkill -f mockkv.js` killed the shell (exit 144). Kill by PID.
- **The same evening the author wrote *"Stuck at 1860"*.** A fresh browser on the live site showed 1,938, but **`/stats` still printed the gate figure (1,861) labelled "visits".** It now reads `/api/visitors` and gives the site-wide figure with its parts (`stats.js?v=3`). Both count fetches now use `cache: 'no-store'` (`signal-bar.js?v=13`). A tab opened before the deploy runs the old script until it is reloaded.

**FAITH NAMES: ONLY HIS — 23 Oct 2026, live. STANDING RULE.** Author: *"Remove mention of Allah in report - should only be of my faith - Jesus Christ God Holy Spirit. All other parts are absorbed by God. I've been pressured by certain parts to try and be accommodating but some speech initially was felt forced"*.
- **What changed:**
  - In X `x-project-maven-ai-military-convergence`, and the same line on the AI report page: "He has salvation through Christ Jesus - Yeshua, Isa, HaMashiach, Brahman, Allah, G_D Spirit, Great Spirit." now reads **"He has salvation through Jesus Christ, God and the Holy Spirit."**
  - In the AI report's voice block, "HaMashiach, Yeshua, Isa, Allah." now reads **"HaMashiach, Yeshua."**
- **The rule: faith statements in his voice or about him name only Jesus Christ, God and the Holy Spirit.** Do not re-add multi-faith lists or other traditions' names for God.
  - Yeshua HaMashiach, his own Hebrew usage elsewhere ("God, Jesus Christ, Yeshua HaMashiach"), stays.
  - Proper names, place names and quoted third-party text are not faith statements and are untouched (Hezbollah, Abdullah, Nasrallah, King Hamad bin Isa, "Tando Allah Yar" in the World Bank flare data).

**THE CURRENT-EVENTS SWEEP IS AUTOMATED — 23 Oct 2026. Scheduled task `trig_01RFnX93MHDF3rvLbtbVqjsw`, "b0b.dev current events sweep": every 2 days at 06:31 New York time (cron `*/2`, odd days of the month), first run 25 Oct. Method: `scripts/sweep/RUNBOOK.md`.** Author: *"Current events sweep. How do we automate this"*. Asked the cadence and what a run may do, he chose **"Every 2 days"** and **"Publish documented items itself"**.
- **Each firing starts a fresh cloud session** with no memory. It reads this file and then follows the runbook:
  - three researchers using the brief template;
  - every quote through `vq.py`;
  - sort each item into PUBLISH or HOLD;
  - draft the next XV `xv-status-update-…`;
  - run the full §4 pipeline, push the branch and `HEAD:main`, and do the live reads;
  - write `research/NEWS-<date>-HELD.md` and a §7 entry;
  - send push and email notices to the author.
- **What a run may publish on its own** (runbook §4): only items where every sentence is a named party's on-record act or statement, every quote passed `vq.py`, each side is printed, and no living person is named in an accusation.
- **What a run must hold:**
  - anything defamation-adjacent;
  - anything resting only on anonymous sources;
  - anything involving Anthropic;
  - anything needing an editorial call (new subsections, argument sections, map changes);
  - corrections outside the XV status updates;
  - suits against named living people.
  - It may still fix our own dated status lines in place, with no narration, once the primary has been read.
- **Off switch:** create `scripts/sweep/PAUSE` and the next run stops. To change the schedule or prompt, use the scheduled task (`update_trigger`). It stores no connectors and the sweep needs none.
- **Tools now in the repo, `scripts/sweep/`** (until now they lived only in session scratch): `vq.py`, `vqdraft.py`, `qlines.py`, `pipecheck.py`, `pdftext.py`, the new `scale.py` (`--write` updates the scale line), `BRIEF-TEMPLATE.md` and `RUNBOOK.md`.

**CURRENT EVENTS SWEEP 22–23 OCT 2026 — live 23 Oct. XV `xv-status-update-23-october-2026` (10 paragraphs). HELD: `research/NEWS-2026-10-23-HELD.md` (17 items).** Author: *"Current events sweep"*. It is the same method as 22 Oct and the first run of the runbook's PUBLISH/HOLD sort.
- **Quote checks:** three notes (`news6-*`), 223 quotes, 0 failing in `vq.py`. The draft had 88 quotes, 0 failing in `vqdraft.py`.
- **Carried:**
  - the Hebron checkpoint attack and the West Bank lockdown, with each side's counts;
  - Iran–US: "a little bit further", the IRGC threat to US bases, one party's tanker claim, "another chance", the UN letter;
  - the Istanbul E3 + Italy / "R4" meeting;
  - Yemen: the warning withdrawn as "wrong and unacceptable", the European Parliament's Houthi listing call, the 1,574 figure now carrying three attributions;
  - Lebanon, Gaza, Iraq, and the Russia bot accusation with Russia's denial;
  - Sudan's denial of the Abyei strike against the army's own anonymous account, the Blue Nile claim, Amnesty on El Fasher, the UAE's Secretary-General nominee with its denial;
  - the Kremlin's "first half of November in Abu Dhabi", Starshield still disputed three ways, the Oleshky ceasefire announced by the White House only, the 270-for-270 swap;
  - the *Khoryv* sunk off Constanța, attributed by Romania as reported;
  - the Koreas, Taiwan, Moyale;
  - the seventh PURSUE UAP release (files unread, war.gov 403), the betting memo (attributed), the DMDC class action, the petition still at 216.
- **Our errors, fixed in place (no narration):**
  - **22 Oct Fairford:** "carry no release on the re-arrests" was wrong. CTP's release existed under an old URL slug, and our own 22 Oct copy of the listing showed it. The page now quotes the release and the detention warrant to 27 Oct.
  - **22 Oct Abyei:** "one outlet reports 220" now names the same Abyei office as the source of both figures.
- **Held, among them:** the Virginia indictment (off-thread), the IC election-threat description (one party), the 12 Oct search of a congresswoman's home, the co-executors' denial (the suit stays held), PHP2Shell (Anthropic), the AFP photographer inquiry, and anonymous-only items.
- **Nulls this run:**
  - CourtListener 429 on every query, so *Phang*, the D.C. Cir. appeals, the New Mexico suits and *Anthropic v. DoW* are unread;
  - the Senate roll-call list 403;
  - war.gov/UFO and aaro.mil 403. **The war.gov news-release RSS feed answers under robots** with titles only.
- Scale line 284 / 1,160 / 144. `build-transmissions.py` worked.

**UAP FILES: NARA RG 615 PULLED; THE war.gov TRANCHES ARE NOT — 23 Oct 2026. Manifest: `research/UAP-NARA-RG615-MANIFEST.md`.** Author: *"Pull the war.gov/ufo tranches"*, then *"Pull from these places - they are public"*.
- **Refused, not worked around:**
  - war.gov/UFO, aaro.mil and media.defense.gov give Akamai "Access Denied" (403) to the spider and to an identified one-off curl. That is an access control.
  - Getting past it would need a disguised browser identity, which §7's spider rules forbid. The ledger has the nulls.
- **Pulled: the four NARA RG 615 electronic series**, by a one-off identified curl at his instruction, **not the spider**: OSD (30 PDFs, AARO's own 2023–Jan 2025 material), FAA (575 sighting PDFs), NRC (3), ODNI (4). With their metadata JSONs. 186 MB, kept outside the repo at `/home/user/.b0b-sources/uap/nara/`, sha256s in the manifest.
  - **Recorded exception to the robots rule:** `catalog.archives.gov` robots.txt is `Disallow: /`, but NARA's own bulk page offers these files and says they "can be republished with attribution to NARA".
  - Blue Book stills (36.48 GB) were not pulled.
- **These are not the 2026 PURSUE releases.** NARA's bulk files were last updated 24 Apr 2025. The sixth release stays at reported tier on the page. The war.gov files reach us only if the author downloads them himself and supplies them.
- **Not yet read.** The FAA reports will carry pilots' and controllers' names (living persons), and any page use names none of them.

**TWO TIMELINES, XXIV — added and REMOVED, 23 Oct 2026. DO NOT RE-ADD.** Author asked for a "futurist … worst / best case timelines" section with biblical correlates. `xxiv-two-timelines-the-worst-case-and-the-best-case` went live (`3a66754`): six dated fixed points on the public record, worst and best branches, and Deut 30:19 / Isa 59:14 / Amos 5:24 KJV. The same day, after reading it live, he wrote *"Remove the timeline section that we just did"*. It is cut whole. The draft and the research stay in session scratch `futures/` only.
- **Kept from the same deploy; these were separate fixes, not part of the section:**
  - XIV's "Editorial integrity note" (the "growth industry" line) is cut;
  - XXIII vector 3 says continued beyond 14 Sept 2026 by the notice signed 8 Sept (91 FR 57773, published 10 Sept; read via the Federal Register API). The "a year behind" note in the stickers entry is resolved;
  - XV 1 Oct's Euronews quote is verbatim ("31 January 2028").
  - `check-live.js` now checks `/map` for the GL page (`map-gl.js`) and `/map?engine=classic` for `markerLayer`. It had failed on every deploy since 22 Oct.
- Scale line back to 283 / 1,148 / 143.

**SECTION I TESTIMONY CONTINUED — TWO MORE ACCOUNTS, 23 Oct 2026, live.** The author gave further testimony across several messages, then: *"I just want to put this, at least this testimony here, continued."* A draft was shown to him first and added as he asked.
- **Added** to `i-the-authors-testimony-the-work-is-the-method`, before the method statement:
  - **"Fourth, the earliest":** the Burbank image at about seven (c. 1989; he is 44). It is in his words, with both of his readings ("abducted or … a false memory"). Around it, the record: GATE at Walt Disney Elementary (XX), and Skunk Works still in Burbank that year (moved to Palmdale after 1989; X: HQ 1992, closed by 1994). No source read places underground facilities at the Burbank plant.
  - **"Fifth, the book":** the East Hollywood night and the book of life, "far too heavy to hold". It carries his own candour (the amphetamine period, "not that night", sober for decades) and his both-ways line. The one correlate is John 16:12 KJV, as a reading only.
- **Renumbered and fixed:**
  - the intro now says "Five accounts … all five are testimony";
  - the method statement is "Sixth … organises the five above it";
  - scale line 283 / 1,148 / 143.
- **Kept OFF the page and out of the repo by default** (the repo is public). His own account is in session scratch only.
  - His residence details: number, cross street, the building opposite.
  - An act at a federal facility, under the §1 prosecution rule.
  - The tattoos, under the 22 Oct instruction; the artist's family (living people).
  - Further personal health history.
  - His surveillance and programme beliefs: testimony, not added; he was told plainly what the record does and does not support.
  - **Any of these goes in only on his explicit word.**
- **Wellbeing:** he disclosed past crises. Support (988) was offered once, plainly, without labelling him. Keep that tone. Never use what he discloses in confidence against the testimony, and never add it unasked.
- *Page inconsistency noticed, not edited:* XX dates Skunk Works in Burbank "1943–1989" while X gives HQ to Palmdale 1992 and the Burbank closure 1994. Wikipedia: "After 1989 … relocated".

**THE "DUTCH SPIES HACKED KUSHNER'S IPHONE" POST — graded 23 Oct 2026, HELD. `research/KUSHNER-VF-POST.md` (11-row table) + `-A-EXCERPT.md`, `-B-IRAN.md`, `-BRIEF.md` (the post verbatim); 168 quotes, all vq OK.** Pasted by the author with no instruction.
- **Source:** Matthew Cole, *Vanity Fair*, 22 Oct 2026, an excerpt from *Princes and Thieves* (Atria, published 27 Oct), **read in full at source**. All of it is attributed to Cole's anonymous sources: no document, account record or official confirmation, in the excerpt or anywhere found. The excerpt prints five denials; the post prints none.
- **The post's changes to the excerpt:**
  - drops that Russia's GRU was in the phone first (the Dutch service is the MIVD, via a turned GRU operative);
  - turns "Netanyahu required Kushner to inform him" into "dual-key approval";
  - turns "fizzled … instead" into "narrowed";
  - applies "redraw the map" to all the money (the excerpt says the ~$1bn Israel account was "for Kushner's personal benefit");
  - splices two quotes and changes "Jared" to "He".
- **Naming trap:** the excerpt's "at least $2 billion" is **not** Saudi PIF's documented $2bn into Affinity Partners (June 2021, after office); the excerpt never mentions Affinity.
- **Iran's "$9 billion":**
  - one anonymous official to Drop Site, 15 July 2026, three months old;
  - the figure is Drop Site's sentence about "individuals close to President Trump", narrowed onto Kushner and Witkoff by later retellings, and "pocketing" came last;
  - suspicious trading before Iran announcements is documented (CFTC letters, Reuters' data), with **unidentified traders** in every source;
  - Vance: "completely bogus".
- **Kushner's Iran role is documented** (every round Feb–Sept); his title is contested.
- **Flagged, not edited — page errors:**
  - the PIF commitment is dated "July 2021" on the page; the Wyden letters say **June 2021**;
  - Affinity is "$3B" (×3) and "~$4.8B AUM" (×1) on the page; the March 2026 Form ADV says **$6.16bn** AUM.
- **Spider:** `senate.gov` ("404 Error Page") and `boi.org.il` ("Radware Page") registered as decoy-200 hosts (`7a989c7`), senate.gov proven both ways live.
- **Not recommended for the page.** At most a dated XV line on the book at attributed tier with the denials; his call.

**THE "TRUMP FAMILY TREE" POST — graded 22 Oct 2026, HELD. `research/TRUMP-FAMILY-POST.md` (34-row table) + three beat files `TRUMP-FAMILY-POST-{A-FAMILY,B-COHN-KUSHNER-WORDS,C-2021-2026}.md` + `-BRIEF.md` (the post verbatim); 379 quotes, all vq OK.** Author: *"Parse the truth lines from this Twitter post"*.
- **Finding:** the skeleton is mostly documented and the adjectives mostly are not.
- **Holds:** the 1905 expulsion; the 1927 arrest and discharge (membership unsupported); the 1954 FHA testimony; the 1973 DOJ suit and its no-admission 1975 consent order; the $10 synagogue deed (1955); John G. Trump's 1943 Tesla review; Cohn's record and death; the Kushner plea, pardon and ambassadorship; the Ivanka, Epstein and "chosen one" quotes, each with its frame; the Cyrus coin; the Bible and its royalties; the heaven remarks; the Ohel visit; the crypto overlap.
- **Chronology errors:** Bavaria → Klondike runs backwards; the Bible came before the Ohel, not after.
- **Naming errors:**
  - "physicist", and "had Tesla" for examining his papers;
  - "teen" pageants (the Stern remark was about adult pageants);
  - "Kabbalah string" (unsupported in the vaccine post);
  - "God's chosen vessel" as the evangelicals' own phrase;
  - a Brooklyn synagogue read as Israel.
- **Overstated:** "48 years" of funding (the synagogue's phrase for a friendship); "six bankruptcies" (company filings); "entire federal government"; "for bankrolling Israel".
- **Unsupported:** "lover of Israel"; Klan membership; "settled over tea with Xi".
- **Refused:** "One family" (anti-map) and "three generations kneeling to Israel" (the dual-loyalty shape).
- **Post-cutoff items, read at source:**
  - Trump TV, a White House YouTube stream launched 21 Sept 2026, three days after CNN, MS NOW and Politico lost their passes on 18 Sept; the passes were restored by court order;
  - tea with Xi at Zhongnanhai on 15 May 2026, and the Sept 2026 AI-incident channel with "no AI agreement".
- **The page already carries** the Epstein quote (II), Stargate's private funders (VII/X) and the $TRUMP disclosure (X), all at tier. **Not recommended for the page**; his call.
- **Spider:** `senate.gov/artandhistory/.../Have_you_no_sense_of_decency.htm` is a decoy-200 candidate (title "404 Error Page"), not yet registered.

**`/stats`, THE COUNTS DASHBOARD — 22 Oct 2026, live and PUBLIC. It is not itself counted.** Author: *"Can you make an analytics dashboard for the site"*. Asked where it should live and what it should count, he picked "Unlisted page on b0b.dev" and left the data question open. I took the recommended option: daily per-page counts, aggregate only, with no referring sites. The same evening: *"Stats can be public why not"*.
- **Now public:**
  - in the sitemap (24 URLs) and `CANONICAL_PATHS`, with a generated SEO block (`seo-meta.json` WebPage entry, `apply-seo-meta.js` URL map);
  - **STATS** after STICKERS/ANNOUNCEMENT in the report's top nav and sidebar, `/home`, and the `/start`-family nav (`build-start-pages.py` and its five pages);
  - the lede now scopes its claim to *these counts*. It also states that Vercel runs its own page analytics on several pages and that those figures are not shown, so a public analytics page does not imply the site runs nothing else;
  - seo-selftest 59/59.
- **What the site counted before:** two all-time totals in KV. **`views`** is every page served to any client, crawlers included. **`visits`** is a POST to `/api/gate`. No page has called that since the gate went off on 19 Sept, but it still rises (1,686 → 1,692 during the deploy reads), because outside clients still post to it, `check-live.js` among them. **So "visits" no longer measures readers, and the signal bar still shows it publicly as "· N visits".** Flagged for him, not changed: switching the bar to arrivals is his call.
- **Vercel Web Analytics also runs** (`/_vercel/insights/script.js` on the report, `/home` and the GL map). Its data is in his Vercel account, not reachable from here. The counter's own comment says "no third-party analytics script"; Vercel's script is served first-party but reports to Vercel. Noted, not acted on.
- **Server (`server.js` `countView`, `viewClass`, `/api/stats`):**
  - one hash per UTC day, `b0b:d:YYYY-MM-DD` (TTL 400 days), with fields:
    - `b` browser navigations (`Sec-Fetch-Mode: navigate`, no `Sec-Purpose`/`Purpose` prefetch);
    - `c` known crawlers (`CRAWLER_RE`);
    - `o` everything else;
    - `a` browser arrivals (`Sec-Fetch-Site` is not same-origin or same-site; **Referer is useless here because the site sends `no-referrer`**);
    - `p:<path>` browser loads per page. The classic map is keyed `/map?engine=classic`.
  - Sent as one Upstash `/pipeline` POST per page served. `b0b:daily_since` is SETNX'd once per instance.
  - The headers decide the class and are dropped. No IP, user agent, cookie or per-reader record.
  - The file and memory backends keep the same shape in `.data/visitors.json` and process memory.
  - `/api/stats?days=1..90`: same access rule as `/api/visitors`, cached 60 s per instance, `Cache-Control: no-store`.
- **Page (`site/stats.html`, `site/stats.js?v=2`, classic script, no library):**
  - Readers: 7/30/90-day toggle; four tiles (browser loads, arrivals, crawlers, other); daily stacked bars with hover and a table view, days before `daily_since` shaded "not recorded"; pages read in browsers.
  - The record: `build.json` sizes, map lines by tier, the last three corrections.
  - Sources: the public ledger's reads, refusals (403/401/429/robots/decoy), not found and per-week fetches; hosts that refused most.
  - Chart colours validated with the dataviz validator against both grounds: categorical green, blue and amber; the tier ramp is one green hue.
- **Tested:**
  - Locally against a mock Upstash (scratchpad `stats/mockkv.js`), every class landed correctly, `/stats` and 404s were not counted, and the file backend worked.
  - Playwright at 1280 dark and light and 390 phone: no errors, no horizontal scroll.
  - security 35/35, seo 58/58: both now check that `/api/stats` stays cookie-only under the gate and closed to crawlers.
  - Live, four reads: KV backend, `daily_since` 2026-10-22, counts moving, not in the sitemap.
- **History starts 22 Oct 2026 (UTC); nothing earlier can be recovered.**

**TEST CASES ARE NO LONGER THE END OF THE REPORT — 22 Oct 2026, live. XXIII = Test Cases, XXIV = Spiritual Reclamation.** Author: *"Also i asked for the test cases to not be the end of the report"*.
- **My misreading, now corrected:** his 05:29 line *"These extra case studies should not be the ending"* meant **Section XXIV, Test Cases**, which sat directly before the Signal. I read it as the sovereignty passage inside XXV's close (cut that morning; that cut stands).
- **The order is now** XXII Connective Tissue → **XXIII Test Cases** → **XXIV Spiritual Reclamation** → XXV Signal → the close → the researcher's guide. The report closes on the counter-architecture, the Signal and "three completed things". Only these two sections were renumbered. Moving Test Cases higher (e.g. after XVI) would renumber seven sections; that is his call if he wants it.
- **What moved with it:**
  - the h2 ids (`#XXIII` is now Test Cases, `#XXIV` Spiritual Reclamation);
  - all 40 numerals in the report, each read in context; the masthead's section list, the static contents and the sidebar label map, reordered;
  - i18n in all 12 languages (key and title swapped together);
  - the four Mondaloy markers (`section:"XXIII"`), the map checkbox, KML, `map-gl.html`, map-list, map-data, the corrections ledger row of 6 Oct, the concordance (Calabasas/ALIAS), sticker 11's source line (`design/stickers/publish.py`, README, `stickers.html`);
  - §1 above ("Section XXIV" for servicemembers).
  - **h3 ids were not renamed** (`xxiii-for-servicemembers-…`, `xvi-9-11-…`, `xx-…` keep their old prefixes), so every old deep link to a subsection still lands. Entries in this file before 22 Oct use the old numbers.
- **Fixed on the way:** XIX's 9/11 pointer said the probe "points into … IV (blowback and the Saudi suit) … X (STELLAR WIND, PATRIOT, TIA), XIII (the anthrax naming error) and XXIII (the AUMF under the orders)". It was written while the topology lived in XVI, and it is false now: the probe links only into II and IX, and the AUMF, STELLAR WIND, PATRIOT, PNAC and anthrax material is inside the probe itself. It now says that.
- **Flagged, not edited:** the classic map has a filter checkbox "XXII - Spiritual Exit" that no marker uses (the report's XXII is Connective Tissue). It does nothing.

**MAP: PLAYBACK, `/lab`, NO GLOW, FOUR CONTEXT LAYERS — 22 Oct 2026, live.** Author, to "the playback, the glow, the `/lab` split, the held layers, a CARTO key": *"All except carto key"*.
- **Playback (24 h / 72 h), LIVE group, GL map.** It replays NASA FIRMS heat, USGS earthquakes and NASA EONET events up to the hour on a slider, faded by age; ▶ runs the window in about 24 s.
  - The live copies of those three feeds are hidden while it runs. Aircraft, vessels and the station are live only, and the panel says so.
  - `?play=24|72` deep-links it, and "COPY A LINK" carries it.
  - **Server:** `/api/firms?hours=24|48|72`; 72 h is the 7-day file (41.5 MB). **Every window is cut at its own length on the server** (`cae399d`): NASA's "24h" file actually ran ~45 h on 22 Oct, so the label's "strongest N of M" had compared two windows. Cached 10 min per file; `max` is now up to 8000; each feature carries `t` (epoch ms).
  - *Trap seen on that deploy:* reads made right after Vercel reported "success" still came from the previous build for about a minute. Poll for the new behaviour; do not trust the first reads.
  - It replays sensor feeds. **It is not the evidence period bar removed on 19 Sept.**
- **`/lab` (same engine; `map-gl.js` reads the path; `PAGES['/lab']`, canonical `/map`, not in the sitemap). `/map` is now research only.** On `/lab` only:
  - the 16 purple deep-route lines, tier 0–1 (the 1978 "Inner-Earth" private map, the Four Corners map, analogy lines). The rule is `isLabRoute`: colour `#cc00ff` and tier ≤ 1. Derinkuyu↔Kaymakli (purple, tier 3) stays on `/map`;
  - the tone instruments (ARC Shield, Tone Lab, Multipack, healing, countermeasures);
  - the classic map's "colour reading" (white = wealth …), labelled the site's own reading, not a finding;
  - the countermeasures drawer: `countermeasures.js` is injected on `/lab` only. On `/map`, `--mg-bottom` drops the drawer's 36 px.
  - Title "b0b.dev - map lab", heading "b0b.dev - MAP LAB". `/map`'s TOOLS links to it.
- **Glow, principle 4.** GL markers were already flat. On the classic page, the marker `box-shadow` glow, the pulsing drop-shadow line highlight and the glow trail are gone; a selected line is drawn heavier and its end markers get a plain white ring.
- **Context layers, now four** (`scripts/build-context-layers.py` → `public/data-context/`; each file carries a provenance block; every card says "context, not evidence"):
  - power plants: WRI, 34,936;
  - **oil and gas facilities:** OGIM v3.0, CC BY 4.0, 8,803 (refineries 692, LNG 547, offshore platforms 3,903, petroleum terminals 3,661).
    - The 3.4 GB GeoPackage lives at `/home/user/.b0b-sources/ogim/` (outside the repo; sha256 `d324540f…` ledgered; robots allowed `/records/…/files/`, `/api` is disallowed). The build refuses a file that hashes differently.
    - **Not used:** its flaring layer (EOG's permission was to EDF only) and its 1.86 million pipeline segments;
  - **gas flares:** World Bank GFMR per-flare volumes 2012–2025, 27,364 flares.
    - Each carries its 2025 volume, peak year and years with a volume.
    - Used under the World Bank dataset terms (CC BY 4.0 unless labelled otherwise; the file is not), and the card and credits say the World Bank does not endorse the map.
    - **The licence question raised in research was not put to data@worldbank.org; his "All" was taken as the call.**
    - The card says it is an annual estimate from satellite heat, "not who decided to flare it";
  - **AI data centres:** Epoch AI, CC BY, 95 sites.
    - **8 name Anthropic as a user and carry the disclosure** ("Anthropic … makes the AI model that helps draft this site"), also in MAP SOURCES.
    - Owner and user tags are Epoch's own (#confident / #likely / #speculative).
- **Placing the data centres (`scripts/geocode-context.py` → `scripts/context-geocodes.json`, committed):**
  - 35 by the **US Census Bureau geocoder** (street address; public domain; it serves no robots.txt);
  - 60 at the town their record names, using that town's Wikipedia coordinates read through the spider.
    - **The place had to be in the dataset:** its address, its name, or a source it cites read at source. Colorado City TX came from Cipher's 8-K exhibit, Saline Township MI from Related Digital, Doña Ana County NM from Project Jupiter, Ohio from AWS New Albany's own sources.
    - The en articles for Mäntsälä and Reykjanesbær carry no coordinates ("infobox settlement with no coordinates"), so they used fi:Mäntsälä and Keflavík.
  - None unplaced. The card says how each was placed.
- **Still not built, no open source:** submarine cables, landing points and IXPs (a TeleGeography permission request is the only route); pipelines (GEM's tracker is behind a form needing his email, so it was not submitted for him); a daily GNSS hex layer (needs storage and a scheduled job; ODbL share-alike).
- **Tested** (scratchpad `labtest.js`, MODE=map|lab|play, one fresh port each because of the 60/min limiter):
  - `/map` has no LAB group, no deep routes and no drawer, and only the tier-3 purple tunnel remains with every tier shown;
  - the four context layers load with their counts; the flare card carries its caveats; 8 disclosures;
  - `/lab` title, heading, 16 routes drawn and toggling, drawer mounted;
  - `?play=72` loads, advances, the slider's middle reads ~36 h ago, it draws hotspots and OFF hides them;
  - no page errors or integrity alarms in any run; security 33/33, seo 57/57.
- *Trap:* MapLibre 6 changed `GeoJSONSource` internals (`_data` is no longer the FeatureCollection). Tests read `source.serialize().data`.

**THE GL ENGINE IS THE MAP — 22 Oct 2026, live.** Author: *"Yes new engine is our default map"*.
- **`/map` serves `site/map-gl.html`.** The Leaflet page stays at **`/map?engine=classic`** (`noindex`, canonical `/map`, title "OSINT map (classic)"); `?engine=gl` still works. `PAGES['/map']` is `map-gl.html`, so crawlers get it too.
- **`map.html` is still the source of the data**: edit the arrays there, then run `build-map-gl.py` (§4 7b fails otherwise). `/api` map export, KML and map-list still parse `map.html`.
- **The SEO block moved:** `seo-meta.json`'s map entry and `apply-seo-meta.js` now target `map-gl.html`. `check-consistency.py` reads both map pages as count surfaces (the selftest catches 6) and hashes both.
- **Links:** "COPY A LINK" no longer adds `engine=gl`; the GL tools list and its no-WebGL panel link `/map?engine=classic`; the classic page links back ("THE CURRENT MAP").
- **A browser that cannot run it is handed over, not stranded:** MapLibre 6 throws "WebGL2 is required" from its constructor, and the catch now `location.replace`s to `/map?engine=classic` with the reader's parameters and hash (any `engine` value dropped first; the server also treats a repeated `engine` containing `classic` as classic). A browser without ES modules is caught by a bare inline script in the head (bare, because only bare `<script>` tags get the CSP nonce; never write a literal script tag inside an HTML comment, since the nonce stamping and the inline-JS check both read it as a real one).
- **Tested** (scratchpad `mapdefault.js`, `nowebgl2.js`): `/map` starts GL with 1,166; a copied link carries no `engine`; `?search=epstein island` filters to 4; the classic page loads and links back; with WebGL disabled, `/map?search=pentagon&engine=gl#x` lands on `…?search=pentagon&engine=classic#x` with the search applied. security 33/33, seo 57/57. *Two misses in between were the dev server's 60/min limiter after back-to-back runs; a fresh port passed.*

**MAP UPGRADE — STEPS 1–3 BUILT, 22 OCT 2026. Classic `/map` fixed (live); the GL engine was a preview at `/map?engine=gl` until the entry above.** The author sent a screenshot of "OSINT GLOBE · Middle East dashboard" (MaximVL, geobrowser.io) with *"How do we upgrade map experience"*, was given a three-step plan, and answered *"And yes to map gameplan"*.
- **What we measured first (live, Playwright):** connection lines OFF on first load; the stats box over the zoom button and search; a cramped phone header; 1,162 HTML `divIcon` markers with glow (~41 fps panning, no room for dense layers). The gap was rendering, organisation and the first view, not data.
- **Step 1, classic map (`7894473`):**
  - first view shows T3+ lines (the tier select starts at 3, connections checked);
  - the stats bar is bottom-centre on desktop, full width under the header on phones;
  - a ☰ menu at ≤600 px; header padding clears the language button; the phone search and its KML/TEXT links moved into Researcher Tools;
  - XXIV gets its section checkbox; `resetFilters()` re-applies the filters; SPORTS popups lose a report link that went nowhere;
  - FIRMS is labelled "heat hotspot" with the sensor note;
  - `[data-dynamic]` on live status text so the integrity watchdog stops reading feed updates (and a language switch) as tampering.
- **Found on the way, fixed on both engines (`1be555b`):**
  - **FIRMS withdrew the keyless WFS** the map used ("Invalid service.", so the layer was dead live). `server.js` `/api/firms` now reads the public NOAA-20 VIIRS 24 h CSV, caches it 10 min, and returns GeoJSON for a bbox, strongest first (`max` 1–5000).
  - **CARTO now watermarks keyless tiles with a 200** (§4 trap). DARK and FIRST PEOPLES use Esri's Dark Gray Canvas (base + reference labels; FIRST PEOPLES base only). A free CARTO key exists for non-commercial use (5M requests/month), but a person must request it by email: **his call if he wants CARTO back.**
- **Step 2, the GL engine (`1be555b`):**
  - **MapLibre GL JS 6.13.0** (BSD-3-Clause), self-hosted in `public/vendor/maplibre-gl-6.13.0/`; npm integrity checked. `site/map-gl.{html,css}` and **`public/map-gl.js`** (an ES module; see the §4 trap); route in `server.js` (`/map` with `engine=gl`); the CSP gained the OSM tile and AWS terrain hosts.
  - **The data is copied, never re-typed:** `scripts/build-map-gl.py` copies `map.html`'s arrays and correlation timeline verbatim between `map-data` / `map-timeline` comment markers, plus section/type labels and the tier table from `site/data/map-data.json`. `check-consistency.py` fails if the copy is stale (§4 7b).
  - **Features:** globe/flat, terrain relief (AWS Terrain Tiles, full attribution in MAP SOURCES), six bases; the grouped legend Evidence / Connections / Context / Live with counts; markers and tiered lines drawn by the GPU (dotted 0–1, dashed 2, solid 3+); a click on a site opens its record, its lines and their tiers, co-located sites and actions (report, only this type/section/its links, copy link); a click on a line shows its tier and meaning; search, pattern, proximity, the timeline, deep links (`/map?engine=gl&…`, the classic parameters); all ten live feeds; the integrity lock, watchdog, content signature and canary carried over. Phones get bottom sheets.
  - **Tested locally:** every interaction, all feeds, deep links, the lock (`gltest2.js`); phone 390 px: no horizontal scroll, the sheet, the card, the menu (`glphone.js`). The open sheet's top sits at 243 px of 844, which is by design.
- **Step 3, context and live layers (this deploy):**
  - **One context layer passed the licence check: power plants**, WRI Global Power Plant Database v1.3.0, CC BY 4.0, 34,936 plants. It is frozen at June 2021 and unmaintained, and the card, the attribution and the source line all say so. Built by `scripts/build-context-layers.py` from the ledgered CSV (refuses a body whose sha256 differs) into `public/data-context/power-plants.json` (8.1 MB, 1.1 MB gzipped, loaded only when switched on). It is drawn in one muted colour under the lines and sites, never as an edge, and every card says "Context, not evidence".
  - **Live: "Low reported position accuracy (ADS-B)"**, aircraft near the centre whose own NACp is below 8. **Where, not who:** the card states the aircraft's own uncertainty, that interference is one cause among several (old equipment, receiver faults; 0 also means "not known"), and that one aircraft is not a measurement. adsb.lol has **no coverage over Israel** (0 aircraft), and the status line then says the gap is in the receiver network, not the sky.
  - **Held at the time, built later the same evening (entry at the top of §7); findings in `research/MAP-CONTEXT-SOURCES.md`, 58 quote lines:**
    - gas flaring: the World Bank per-flare file (27,365 sites) states no licence of its own and its VIIRS Nightfire upstream is licence-gated; confirm with data@worldbank.org first;
    - oil and gas: GEM trackers (form with an email) and OGIM v3.0 (3.4 GB) are CC BY 4.0, but he has to download them;
    - data centres: Epoch AI (CC BY) is 95 AI sites by street address, and it names Anthropic as a user (the Anthropic disclosure applies);
    - submarine cables, landing points and IXPs: no open source (TeleGeography sells its data; PeeringDB and IXPDB bar bulk redistribution; PCH is non-commercial). A permission request to TeleGeography is possible.
    - a daily GNSS hex layer built from adsb.lol would need a scheduled job, and ODbL share-alike on the derived file.
- **Integrity watchdog false alarm on phones, fixed (both engines).** The author's phone screenshot showed "DOM INTEGRITY VIOLATION — NAV LINKS" on `/map`.
  - **Cause:** `theme.js` (deferred, at the end of an 830 KB page) appends its LIGHT/DARK button to `.header nav`. The watchdog snapshotted the nav 2 s after its inline script ran, so a phone still loading flagged the button as tampering. Pressing LIGHT, or the visitor count arriving, also turned the content-signature lock 🔓.
  - **Fix:** the watchdog and the signature compare text without `[data-dynamic]` and `.b0b-theme-btn` (the visitor spans are now `data-dynamic`), and both snapshot only after `DOMContentLoaded`.
  - **Proven both ways** (scratchpad `wdtest.js`: iPhone viewport, `theme.js` held back 5 s, menu opened, LIGHT pressed, 36 s wait). The old code logged NAV LINKS mutations on both engines and ended 🔓; the new code logged nothing and stayed 🔒.
  - *Trap:* a fast local load never shows this. **Test integrity code with the deferred scripts delayed.**
- **Spider fix (`scripts/spider/spider.py`):** robots.txt is now matched per RFC 9309 (longest rule wins, allow wins a tie). `urllib.robotparser` takes the first rule in file order, so "Allow: /" above "Disallow: /wwwdata" let the research agent send one request to eogdata.mines.edu's disallowed `/wwwdata` (it redirected to a login; nothing retrieved). Proven both ways on 10 cases; crawl-delay still comes from the stdlib.
- **His calls, all answered 22 Oct:** GL is the default `/map`; the playback, the glow and the `/lab` split are done (entries above); **no CARTO key** (his "All except carto key").
- *Traps:*
  - Playwright here needs `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` for WebGL. Launch local tests with no proxy (localhost through the proxy gives 405).
  - Route external hosts through `curl --compressed`; digitraffic answers 406 without gzip.
  - MapLibre 6 is ESM only: `import * as mlgl` and `setWorkerUrl` pointing at the self-hosted worker.

**CURRENT EVENTS SWEEP 20–22 OCT 2026 — live 22 Oct. XV `xv-status-update-22-october-2026` (14 paragraphs, ~3,100 words), after the 20 Oct update. HELD: `research/NEWS-2026-10-22-HELD.md`.** Author: *"lets do a current events sweep"*.
- **Method:** the same as 20 Oct.
  - Three agents: Middle East, rest of world, US. Scratchpad `news5-{BRIEF,mideast,world,us}.md`; ledger notes are prefixed `news5`.
  - Every agent quote was re-checked with `vq.py` (203 + 104 + 89, 0 not OK). The published subsection was checked with `vqdraft.py` (108 quotes, 0 failing).
  - *Fix to scratchpad `qlines.py`:* its regex missed indented `Q |` lines (81 of 89 lost). It now reads `^\s*Q \|`.
- **Carried:**
  - **Iran–US:** the pre-midterm no-attack pledge restated; "Not a single gram" (the SNSC secretary); "nothing new" (the parliament speaker); Trump's "we're not negotiating".
  - **Hormuz:** CENTCOM calls the mine claims "false"; Iran claims seven tankers struck (unverified); a missile on a vessel off Faw (UKMTO, no attacker).
  - **US posture:** ordered departure from Saudi Arabia only, State calling wider reports "inaccurate", against Reuters' four officials and AFP's diplomatic source. The Roosevelt group due by the end of November per two officials to Fox: a third carrier for a time, or a rotation replacement (K24). The lead-in says "another carrier group", not "third".
  - **The Mecca pact:** the full text (The National) says it comes into force on the last ratification, **so the 5 Oct invocation came before the pact bound its parties.** Türkiye's ratification does not deploy troops. The Qatar–Türkiye–Pakistan–Indonesia memorandum of 21 Oct is industrial, not a defence pledge.
  - **The UK MoD's own words on the refuelling** this section recorded on 22 Sept: "to degrade Houthi military targets in Yemen", extended 90 days (BBC). Typhoons are "defensive role".
  - **Saudi Arabia and Yemen:** Dammam and Eastern Province deaths by Saudi count; the Houthi denial and then the Houthi claims; Yemen tolls by whose ministry (1,574 is the government's per BBC, the WHO's per AJ).
  - **Israel**, five days before its election: Eisenkot's answer to the endorsement; Vance's "not getting involved".
  - **Gaza:** 1,538 (MoH). **West Bank:** Nahalin olive-picker detentions.
  - **Fairford:** two re-arrests under NSA s.3; police "highly likely … Iranian state involvement"; "No one has yet been charged"; Iran's denial.
  - **The ICC's Sakharov Prize;** OFAC and the ICJ docket both re-read, with no new entry.
  - **Sudan:** Abyei 73 → 153 (one outlet 220) and the army's anonymous account to AP; the Al-Dabbab counts by each side; Geneva (no joint statement found).
  - **Ukraine:** talks "after 10 November"; the Kyiv toll as it moved through the day; **Starlink: who ordered the slowdown is contested** (Rubio "private commercial contract", Trump "I was not involved", the owner "decided by the US military and ultimately POTUS", Reuters' officials "the White House"); the Lukoil International licence; the EU draft package.
  - **Briefly:** the German arrest (prosecutors' allegation; Moscow denies); NATO in the Black Sea (no attribution); Greenland; Korean loudspeakers; the Taiwan indictment (prosecutors' allegation, no state body); the Niger hostages freed.
  - **Washington:** the AUTOWARCOM letter ("Congress must pass legislation"); the State cable renaming AI as "SI"; discharge petition still 216; no *Phang* ruling; no Senate roll call 1–22 Oct.
- **Our error, fixed in place (no narration):** the 20 Oct Greenland line said the agreement went to a second debate "without first referring it to committee" (*Arctic Today*). **Inatsisartut's own agenda list shows it referred to the foreign and security policy committee**, with the second debate on 3 Nov. Primary over press.
- **Flagged, not edited:** the 20 Oct Blue Nile strike (41 displaced killed) is dated 10 Oct by SCR. Al Jazeera's "Friday" (written Mon 19 Oct) is 16 Oct, and AJ names the RSF as Emergency Lawyers' claim. Either two strikes or one misdated; unresolved.
- **HELD for his call** (detail in the file):
  - **New Mexico v. the Epstein estate, the 1953 Trust and both co-executors** (D.N.M. 1:26-cv-03543, 21 Oct). The State's wording about living, uncharged people is defamation-adjacent, and the complaint was not opened (stop rule b).
  - **PHP2Shell, now that Amazon reports broad exploitation attempts** against CISA's none observed. The Anthropic disclosure applies: the PHP Foundation scanned with Anthropic's model.
  - ***Anthropic v. Department of War*** (rehearing sought 13 Oct, amici 20–21 Oct). The Anthropic disclosure applies.
  - Also held: the ProPublica CISA voting-machine report (19 Oct, anonymous); Amnesty on Morocco; eMudhra; the France riots and the Alliance4Europe finding; the Kampala killing; the New Arab "exclusives".
- **Scale line 283 / 1,146 / 143.** `build-transmissions.py` succeeded this time.

**NO MUSIC UNDER THE CAROUSEL; ONE MUSIC AT A TIME — 22 Oct 2026, live.** Author: *"Why is tempest playing on carousel at all"*.
- **Two causes, both real, proven with old vs new code on the real report** (scratchpad `floortest.js`: YouTube API stubbed so every play/pause is logged, plus an `appendChild` hook that catches YouTube iframes):
  1. **`soundtrack.js` (mine):**
     - `mount()` called `play(false)` without checking the carousel's hold, so its plain-iframe driver inserted a 7empest `autoplay=1` frame under the carousel. In a browser that already lets b0b.dev autoplay, that sounds; the hold only took effect once the YT API was adopted, and never if the API was blocked.
     - Also, `__b0bSoundtrackHold(true)` stopped the music only if `playing`, which an unconfirmed iframe autoplay never sets.
  2. **`signal-bar.js`, the bottom strip that plays XXV's whole signal playlist (7empest is its 11th track, 15:43):**
     - It resumes on every page load for a listener who left it playing (`b0b_signal_v10.playing`), and it had **no hold at all**. Old code under the carousel: `signal PLAYING 9D2R69gVyZ0`.
     - **The carousel (z-index 2147483600) covers the bar (2147483000)**, so a listener could not even pause it.
- **Fix:**
  - `soundtrack.js?v=6`: mount never plays under a hold or the narrator, and a hold stops an attempted autoplay too.
  - `signal-bar.js?v=11`: reads `__b0bSoundtrackHeld` on ready, on every state change and when a track ends, and pauses itself under a film without saving "paused" over the listener's choice. It resumes when the carousel closes.
  - `landing-intro.js?v=7`: dispatches `b0b-floor` `{held}` on open and close.
- **The test found a second defect, also fixed:** after ENTER, both players started 7empest at once (the bar resuming, the soundtrack starting on the gesture). This had existed since the soundtrack was added; it was only audible now. **Rule: one music at a time.**
  - The bar plays only because a listener pressed play, so the soundtrack's automatic starts (mount, `__b0bSoundtrackStart`, the narrator resume) yield when `__b0bSignalOn()` (stored `playing`) is true.
  - A press of PLAY on either player dispatches `b0b-music` `{who}`, and the other stops.
- **Results:**
  - **A**, signal left playing: old = 7empest under the carousel, then two copies after ENTER; new = silence, then the bar alone.
  - **B**, fresh visitor: old = an autoplay frame `underCarousel: true`; new = none, and the soundtrack starts on ENTER.
  - **C**, `/report`: autoplay attempted as before.
  - **D**: pressing the bar's play pauses the soundtrack.
- **Not covered:** `intro.js` (the old intro film path) and listen mode hold `soundtrack.js` but not the signal bar. Neither is the arrival path now.

**THE SOUNDTRACK LEADS WITH TOOL — 22 Oct 2026, live.** Author: *"Lead sound track with tool song"*. The TOOL song on the page is "7empest", XXV's sixth signal, played from its official audio upload (`9D2R69gVyZ0`).
- **`site/soundtrack.js?v=5`:** a `TRACKS` list. TOOL "7empest" is the embed's own video and plays first; Restless Leg Syndrome follows as its `playlist`; `loop=1`. Both drivers (plain iframe and IFrame API) do this.
  - **The lead is deliberately NOT repeated in `playlist`:** YouTube may play it twice in a row (31 min). Whether the loop then returns to TOOL or repeats RLS alone is YouTube's behaviour and unverified here (YouTube refuses this environment). The lead is TOOL either way.
  - **The label names the track actually playing** when the API is up (`getVideoData().video_id` on state 1). With the plain iframe it names TOOL.
  - TOOL's credit links to the sixth-signal entry on the page; RLS keeps its Bandcamp link.
- **Report:**
  - The sixth signal gained "It is also the track that plays first when this page opens."
  - The ninth signal's "the track that plays when this page opens" is now "on this page's soundtrack, after TOOL's '7empest'".
  - The script comment was updated to match.
- **Tested** on an isolated page with YouTube stubbed: the iframe src is `embed/9D2R69gVyZ0?…&loop=1&playlist=7eNqNfURcxw`; the API config has the same video and playlist; the label switches to RLS when RLS plays and back to TOOL.
- The narrator still ducks it. *The claim made here at first, "the carousel still holds the music", was false; see the entry above.*

**ENDGAME IS TETELESTAI, AND NOTHING ELSE — 22 Oct 2026, live. Supersedes the nine-part film described in the 20 Oct entry.** Author: *"Endgame is just Tetelestai.. What ye do / Tetelestai is endgame video. Very simple"*.
- **The film is 0:24** (`scripts/film-endgame.json`; the nine-part spec is kept only in the session scratchpad):
  - Part I, "It is finished": Papyrus 66 (c. 200), then John 19:30 in the KJV, typed on screen and read.
  - The finale: τετέλεσται over the Pale Blue Dot, "tetelestai / it is finished".
  - The narration: "Not 'it ended', but: it has been completed, and remains so."
  - The close card: "It is finished." with "tetelestai · john 19:30".
  - Two pictures, both public domain. No ERC/DARPA flash.
- **Gone from the film:** the address to nation states, his statement card, "paid in full", Luke 12, Isaiah 54:17, Zermelo/Lovelace and sovereignty. **Do not grow it back.**
- **Files:**
  - `public/endgame-reel.{mp4,webm}`, `public/b0b-endgame-film.mp4`, and the subtitled `.webm` (VP9 crf 36, encoded outside the engine);
  - `site/endgame-poster.jpg` (now `poster_at` 18, the word);
  - `site/img/films/endgame.jpg` and `site/img/endgame-card.jpg`, both remade from the new frames.
  - Loudness is −17.1 LUFS: the engine's single-pass loudnorm on a 24 s clip lands 1 dB under the other films.
- **Metadata:** `/endgame` was rebuilt (the script and 2 sources); seo-meta `PT24S` with a new description and headline; the carousel card reads 0:24 (`landing-intro.js?v=6`, thumb `?v=2`).
- **Tested locally:** `/endgame` plays `endgame-reel.webm?v=2` (24.167 s), and the carousel's Endgame card plays `/b0b-endgame-film.webm` with sound.
- The report's own Endgame subsection (XXV's close) is not touched by this; it ends on the three completed things (entry below).

**THE SATOR / TATTOO READING IS OFF THE REPORT'S CLOSE AND OUT OF ENDGAME — 22 Oct 2026. DO NOT RE-ADD.** Author, quoting XXV's last paragraph ("And he took his own mark off the list first … The man wearing TENET is the one saying the tattoo is not sovereign"): *"The end reads odd … I had you remove the sator square section because the way you wrote it didn't calibrate and felt hallucinationatory."*
- **What was left behind:** the Sator section had been removed earlier, but the close still read his "Not a tattoo" line through it: the "standing rule on the author's tattoos", the Sator square on his arm, the naming error, "the man wearing TENET".
- **Report, step 1:** that paragraph is cut.
- **Report, step 2, the same day.** Author: *"It is just a weird way to end a report of this nature"*, then *"These extra case studies should not be the ending"*. *(He meant Section XXIV, Test Cases; it moved to XXIII the same evening, see the entry above. The cut below was my reading, and it stands.)*
  - **Cut from the close:** the whole "fourth thing" sovereignty passage, four paragraphs: his line read as a list of "claimants"; PPD-40, the PEADs and the NYPD liaison as having no founding instrument; FCD-1's "comity".
  - **Nothing documented was lost.** Every item stands where it was sourced: PPD-40, the PEADs and FCD-1 in IX, the NYPD liaison in II. The "claimants" synthesis was mine.
  - **The Zermelo/Lovelace paragraph moved up,** after Isaiah 54:17, unchanged.
  - **The report now ends on "So the close is three completed things … state what is there, mark the tier, and stop."** Do not add anything after it.
- **His own statement ("God grips me and holds me. Not a tattoo. Not a city-state … That is sovereignty.") is untouched** in his voice block. Nothing on the page interprets it.
- **Endgame:**
  - The spec's part VIII ended on "And he took his own mark off the list first. The mark is not the thing it points at." over a Sator-square stone (Fulda). The line, the shot and the media entry are removed from `scripts/film-endgame.json`.
  - Re-rendered: **5:15** (was 5:20); `PT5M15S`; the carousel card reads 5:15 (`landing-intro.js?v=5`); `/endgame` rebuilt.
  - The subtitled WebM was encoded outside the engine, as before: VP9 crf 36 + Opus 64k with loudnorm, written to a temp name and then `mv`'d.
  - The same day the author answered the open question: Endgame is now τετέλεσται alone (entry above), so part VIII and every other part are gone.
- Scale line 282 / 1,132 / 142.

**OM COMMA RETITLED IN THE CAROUSEL — 22 Oct 2026, live.** Author: *"Title om.comma as 'my video reply to Donald Trump video'"*.
- The card and the bar now read **"MY VIDEO REPLY TO DONALD TRUMP VIDEO"**: his words verbatim, set in capitals like every other card. The bar adds "· 1 / 2".
- The film's id stays `omcomma` (`data-main`).
- Card titles now wrap to two lines instead of being cut off, which also fixed "THE EPSTEIN–MAXWEL…".
- `landing-intro.js?v=4`.

**THE CAROUSEL ALWAYS LOADS — 22 Oct 2026, live.** Author, after the carousel went up: *"Have the homepage be this and always load"*.
- **The defect, mine:** `b0b-wordmark.js` and `landing-intro.js` were `defer` tags at the END of the 1.66 MB `report.html`, so they ran only after the whole report had downloaded. The bootstrap's 8 s fail-open timer hid the overlay first on a slow phone.
  - **Proven both ways** (CDP throttle: 150 KB/s, 150 ms latency, 390 px phone): the old code went `OPEN unclaimed` → `HIDDEN` at 8.9 s and never played; the new code was claimed at 1.7 s and still playing at 28 s.
- **The fix, in the bootstrap (`report.html`):**
  - when the carousel is shown, it injects both scripts at once (`async=false`, so they run in order) instead of waiting for the parse;
  - the overlay comes down immediately on the script's `onerror`, otherwise after **20 s** unclaimed;
  - the intro-film path keeps its 8 s;
  - the two deferred tags at the end are gone, so `/report` and deep links no longer download the carousel's scripts at all;
  - `landing-intro.js?v=3`.
- **ENTER no longer rewrites the address to `/report`.** That `replaceState` made a reload skip the carousel, which "always load" rules out. The bare `/` now opens the carousel on every load, reloads included; `/report` and `#` deep links never do.
- **Checked:** the service worker is not a factor. `site/sw.js` is a kill switch (clears caches, no fetch handler), and `/` is served `no-cache, no-store`.

**THE HOMEPAGE IS A CAROUSEL OF ALL THE FILMS; OM COMMA IS THE MAIN FILM — 22 Oct 2026.** *(ENTER's change of address to /report, described below, was removed the same day; see above.)* Author: *"push the intro film section into a carousel of all the films. Main film is the om comma one we had up with darpa theme. Make sense? Have the homepage be this"*.
- **My reading:**
  - the arrival overlay over the report (`#b0b-landing`) becomes the carousel;
  - `/` keeps serving `report.html`, so the 4 Oct "/ opens on the report" structure, the canonical and Search Console are unchanged;
  - but the bare `/` now opens the carousel **on every visit**, not once per session;
  - `/report` and any deep link (`#…`) go straight to the report.
- **`site/landing-intro.js?v=2`:**
  - First the wordmark, then **OM COMMA #1 → #2**, muted, labelled "OM COMMA · 1 / 2".
  - **A strip of cards sits under the picture, not over it, so burned-in subtitles stay visible.** The picture's height is the viewport minus the strip's measured height (`--bl-dock`, set by `fitDock()` with a ResizeObserver).
  - The cards: OM COMMA, Briefing, Endgame, The Epstein–Maxwell Record, Continuity, the intro film, plus a link card "ERC-1155 · the author's films" to `/home`.
  - **A card click plays that film with sound** (the click is the gesture). ‹ › and ←/→ step through the films. When a film ends, the next starts and the reel wraps around.
  - "SCRIPT & SOURCES →" links the current film's page (`/start#film`, `/endgame`, …). OM COMMA has no page, so the link is hidden for it.
  - **ENTER THE REPORT / Escape** close it and `history.replaceState` to `/report`, so a reload stays in the report.
- **Sources per film, subtitled cut first because it starts muted:**
  - Briefing and Endgame: the subtitled `.webm` then `.mp4` in `public/`.
  - E–M, Continuity and the intro: only the subtitled `.mp4` exists (in `site/`); the unsubtitled reel `.webm` is the fallback. Chromium in Playwright, which has no H.264, plays the fallback.
- **`#b0b-landing` now carries `data-main="omcomma"`** (any id in `FILMS` reorders the reel). The bootstrap opens the carousel when `data-main` is present, otherwise it falls back to the old once-per-session behaviour.
- **Card images: `site/img/films/<id>.jpg`, 400×225, 6–22 KB.**
  - Five are cut from each film's poster.
  - **OM COMMA's is the frame at 3:55: Earth under the mirrored DARPA mark, face-free**, picked from a contact sheet (most frames show Trump).
- **Tested (local Express, Playwright):**
  - arrival → `omcomma-1` muted;
  - Endgame card → `/b0b-endgame-film.webm` with sound;
  - → steps to E–M;
  - `ended` → Continuity;
  - ENTER → `/report`; reload → no overlay; `/#II` → no overlay; `/` again → carousel;
  - desktop picture 0–589 / strip 589–800; phone 0–620 / 620–844; no horizontal scroll.
  - *Two layout bugs were caught this way:* an `<img height>` attribute beat `aspect-ratio` (cards came out 168×225); and a `<video>` with `top`/`bottom` set does not stretch (it is a replaced element), so it now takes an explicit `height:calc(100% - var(--bl-dock))`.
- *Trap:* the dev server's 60/min limiter returns a 980 px 429 page to a second Playwright context. Use one context per fresh port.

**THE BRIEFING FILM — THE FIFTH FILM, NOW THE LANDING FILM; ENDGAME KEPT — 21 Oct 2026.** *(Superseded 22 Oct as the landing: it is now one card in the carousel above.)* Author: *"Make a video for briefing and have that be what replaces endgame as the starting video. Keep endgame as a video."*
- **The film:** `scripts/film-briefing.json`, generated by scratchpad `make-briefing-spec.py`; edit the JSON by hand now.
  - 3:43 (223.96 s), 53 shots, 499 narrated words, in nine parts: I The thesis; II The maxim; III Identity; IV The insignia; V Precedents; VI The paradox; VII Holdings; VIII Method; IX Examine the evidence.
  - The IX finale is the `words` style ("Every shot, its source. / Every claim, its tier. / Examine the evidence."), then a card reading "Ars est celare artem."
  - **It never calls b0b.dev "the institution".** The voice says "B zero B dot dev". The Latin and "Broodthaers" are spoken from IPA phonemes.
- **Pictures, all face-free:**
  - **b0b.dev's own material**, made by `scripts/film-briefing-media.py` into `MEDIA_DIR/briefing/`:
    - the seal on navy ripstop, whole and in three details;
    - the author's jacket photo (the report's `ccg-jacket-insignia.jpg`, no EXIF; its blue is the photo's own);
    - the map's markers as dots;
    - a sheet of six stickers.
  - **Page screenshots** (report masthead with the floating bars hidden, `/start`, `/retractions`, `/map/list` cut to the tier table) were taken locally by scratchpad `shots-briefing*.js`.
  - **Seven licensed masters reused from the Endgame spec** with their licences: the NARA stacks, the Carlin ledger, Menwith Hill, the Utah Data Center, the CCTV mast, the Capitol aerial, the Hollerith tabulator.
- **Cut after the contact sheet:** all three ERC-1155 frames. E9Iu carries a DARPA logo, and it would have sat under "it wears no real organisation's name". Hooded figures are also the espionage cliché of principle 4.
- **Precedents are named, never shown:** their works are in copyright. The facts were read at Wikipedia via the spider.
- **Files:**
  - `public/b0b-briefing-film.mp4` (15.9 MB, subtitles burned in, −16.2 LUFS).
  - `public/b0b-briefing-film.webm`: VP9 crf 36 + Opus 64k, 16.4 MB, −16.1 LUFS, encoded outside the engine from `master-subtitled.mkv` to a temp name and then `mv`'d.
  - `site/img/briefing-poster.jpg`.
  - The unsubtitled reel and its js go to `MEDIA_DIR/_build/briefing/` on purpose (absolute paths in the spec). The site serves only the subtitled cut.
- **Where it plays:**
  - **The landing:** `#b0b-landing` is now `data-videos="/b0b-briefing-film" data-title="BRIEFING"`. Endgame's attribute is in the comment to restore it.
  - **`/start#film`:** a native player under the door, with a download link and a "Script and sources" `<details>` generated by `build_film_block()` in `build-start-pages.py` from the same spec.
  - **No separate film page.** The Briefing is its page, so there are not two pages called Briefing.
  - ▶ BRIEFING in the report sidebar after ▶ ENDGAME, and "Briefing" first in `/home`'s Films list.
  - Endgame is untouched at `/endgame` and in the sidebar.
- **Tested locally (Playwright):**
  - a fresh session at `/` opens the landing on `/b0b-briefing-film.webm`, muted, playing, labelled BRIEFING;
  - `/start` loads its metadata (223.959 s) and the poster (200 image/jpeg);
  - Range 206;
  - no horizontal scroll at 390 px.
- *Trap:* awaiting `img.decode()` on every image of the report hangs forever (lazy images never decode). Filter to in-viewport images, with a timeout.
- *Trap repeated:* `pkill -f` killed the shell again (exit 144). Kill by the saved PID.

**"THE INSTITUTION" TAKEN OFF THE BRIEFING — 21 Oct 2026, live.** The author objected the same evening (see §2's new rule).
- Every use naming b0b.dev "the institution" is replaced with "b0b.dev", "it" or "identity".
  - The pull lines now read "The identity may be ambiguous. The evidence must not be." and "Don't trust b0b.dev. Examine the evidence."
  - The h2 is now "Identity".
- The coda's three thesis lines ("The artwork is the institution…") are cut; the coda is *Ars est celare artem.* alone.
- seo-meta was changed to match, and the topic "institutional art" is now "conceptual art".
- The entry below describes the page before this fix.

**THE BRIEFING NOW PRESENTS THE INSTITUTION, NOT THE REPORT — 21 Oct 2026, live.** Author: *"briefing is repeating what is already stated in report. this is what briefing should touch on:"* followed by the full `design/INSTITUTION.md` text.
- **Removed from `/start`:**
  - what we know / think / don't know / what would change our minds;
  - the rules grid;
  - "View the record".
  - The falsifiers live in II's conclusion block, which the masthead's "Intelligence standards" line now links to directly.
- **Now on `/start`, in this order** (`build_start` in `build-start-pages.py`):
  1. **The seal** (`site/img/insignia.png`, 360 px, 22 KB, rendered from `design/projection/seal.py` on a navy disc), the kicker and the h1.
  2. **His thesis** as the lede, and the door.
  3. *Ars est celare artem* with the three levels.
  4. The institution, with the pull line "The institution may be ambiguous. The evidence must not be."
  5. The insignia.
  6. Precedents.
  7. The paradox, with the pull line "Don't trust the institution. Examine the evidence."
  8. Holdings: report, map, films, announcement, stickers, corrections.
  9. What it is not.
  10. `Method` (still `id="method"`, still the `/about` target), with the standing rules condensed into one item.
  11. The data.
  12. A coda: his final thesis.
  - About 1,070 words.
- **Not repeated from the report:** the maxim's Ovid provenance, the jacket's vendor story and "Covert Communications Group". They stay in the masthead, and the Briefing points there.
- **Left out on purpose:** his "Guidance for Claude" and the seven design principles, which are internal. Only principle 7 is stated, as a fact: the institution claims no government affiliation and fabricates no credential, endorsement or provenance.
- **The art statement is back on the page, now that he has made that call.** I had cut "It is also a long-running work of art" from `/about` on principle 2.
- **Precedents checked at source**, via spider fetches of Wikipedia, ledgered:
  - Broodthaers's *Musée d'Art Moderne, Département des Aigles*: Brussels house, 1968; eagles in glass cases; "This is not a work of art".
  - Raad's Atlas Group: a fictional foundation from the late 1990s; documents carry two dates and are attributed to invented sources.
  - The Yes Men: posed as spokespeople for the WTO and Dow.
  - The Broodthaers museum's own Wikipedia page 404'd (a null).
- **The edge-tier table moved to `/map/list#tiers`.** The map's "How it works" link and map-list's own link now point there.
- **seo-meta, `start.html`:**
  - title "b0b.dev - Briefing: ars est celare artem";
  - description and og rewritten from his lines;
  - topics now lead with institutional art.
- **Also fixed on the way:** XXV carried a banned edit note, "An audit of this report found that subsection had no inbound link … That is fixed here and in Section IX." It is cut.
- *Not acted on:* the page keeps the site's green-on-black palette. A jacket-world restyle (navy and thread) is still his call (see the creative-direction entry below).

**@NSACyber POST, 21 Oct 2026 — the PHP "php2shell" alert; we are not exposed.** The author linked `x.com/NSACyber/status/2112903220209098897` and then wrote *"re: PHP"*.
- **The post:** its id decodes to 21 Oct 13:45:58 UTC. X and the oEmbed refused by robots (nulls).
- **What it points to:** CISA's alert the same day (read at source): CVE-2026-109618/-109619, unauthenticated RCE in every PHP install serving web requests.
  - Fixed in 8.5.12 / 8.4.27 / 8.3.36 / 8.2.35.
  - 8.1 and older are to be taken offline.
  - No exploitation observed at publication.
  - nsa.gov's press pages refused (403).
- **Our exposure, checked:**
  - this repo and `cbay` hold no PHP;
  - `vercel.json` sets no PHP runtime;
  - b0b.dev, bastion.quest and faraday.cam all answer `server: Vercel`, with no `X-Powered-By: PHP` and no PHPSESSID.
  - Headers alone cannot prove the last two; their repos are not in this session.
- **Not on the page.** Note it in the next current-events sweep only if exploitation is reported.

**ABOUT & METHOD FOLDED INTO THE BRIEFING; `/about` RETIRED — 21 Oct 2026, live.** Author: *"Briefing and about and method can be condensed or one can be removed"*.
- **Kept and moved onto `/start`:**
  - `/about`'s unique content, condensed into a `Method` section (`<h2 id="method">`): who keeps it, the one identified crawler with refusals as nulls, quotes read at source, the AI disclosure, and how a correction is decided.
  - Its three missing standing rules, added to the Briefing's rules list: no de-anonymising, stop rules, no numerology.
- **Dropped as duplicates:**
  - the "practices" list (tiers, falsifiers, symmetry and anti-map are already on the Briefing);
  - its data links;
  - its "what this is" paragraph, including "It is also a long-running work of art", the overt self-explanation `design/INSTITUTION.md` principle 2 argues against. Its return is his call.
- **Size:** two pages of 1,925 words became one of 1,419.
- **Wiring:**
  - `/about` now **301s to `/start#method`** (`REDIRECTS` in `server.js`) and has left `PAGES`, `CANONICAL_PATHS`, the sitemap (23 URLs), `apply-seo-meta.js` and `seo-meta.json`.
  - `site/about.html` and `build_about()` are deleted.
  - Links removed: ABOUT from the report's top nav, sidebar and `/home`; ABOUT & METHOD from the `/start`-family nav. The masthead's "(About & method)" now points to `/start#method`.
  - `check-consistency.py --selftest` now plants into 5 surfaces (`about.html` is gone); seo-selftest 57/57.

**"BRIEFING" + THE JACKET'S PATCH — 21 Oct 2026, live.** The author sent a photo of the patch and the single word *"Briefing"*.
- **The rename, my reading of "Briefing":** his call on the held "rename READ THIS FIRST to Briefing".
  - **I had filed that rename as flattening, and that was wrong.** "Briefing" is the institution's own vocabulary, not an explanation.
  - It is now "BRIEFING" in the report's top nav and sidebar, `/home`, and the `/start` family nav (via `build-start-pages.py`).
  - `/start`'s h1 is "Briefing". Its title is "b0b.dev - Briefing: the OSINT report in one page" (`seo-meta.json`).
  - The `/stickers` and `/announcement` footers now read "the briefing", and their publishers were edited too.
  - The URL stays `/start`.
- **The seal:** `design/projection/seal.py` digitises the patch from his photo.
  - The figure and the dotted bolts are traced from the thread.
  - The rings, the motto (Liberation Serif, on the measured 196° arc) and the six stars are set.
  - The photo is cropped to `src/patch-crop.png`, with no EXIF.
- **The jacket-style projection, `build.py --jacket`:**
  - navy ripstop, thread-white type and the seal above the address;
  - the QR is navy on a thread tile and decodes at full and half size;
  - the loop is the same 30 face-free report images.

**CREATIVE DIRECTION RECEIVED — 21 Oct 2026.** The author pasted "b0b.dev — The Intelligence Agency as Conceptual Art" with no instruction. It is saved verbatim at `design/INSTITUTION.md` and summarised in §1.
- **Fixed, live:** the masthead's *ars est celare artem* passage still carried a banned edit note: "and earlier versions of this line were wrong to hedge it as though it were one". It is cut. The sentence now ends "not an evidentiary claim."
- **HELD for his word:** three more surviving edit notes. They carry argument in a contested section, so they were not rewritten in passing.
  - II `ii-primary-and-liaison-…`: "The objection this report raised last time does not survive the correction … The earlier version argued…" and "the Pollard case has to be re-graded … The earlier version offered it…". The Pollard paragraph also carries the "Israel apologised and disbanded the unit … Peres" line, which is not in any primary read (the Israel drill-down's page error 3). Fix both together.
  - XXV close: "the receipt gloss corrected above".
- **Held items the framework bears on.** These are my reading; every decision is his:
  - These would flatten the ambiguity: "a plain line above the masthead", "make `/` a gateway", "a Funding & Independence page", "external review". "Rename READ THIS FIRST to Briefing" was on this list wrongly; the author chose it, and it is done (entry above).
  - These are research integrity, and the framework keeps them: the `Dataset` JSON-LD, the per-edge evidence panel, separate confidence axes.
- **A tension worth his eye, not acted on:** principle 4 (subtle institutional design over espionage cliché) and principle 5 (physical–digital continuity) sit against the site's neon-green CRT look (`#00ff41`, the "Matrix green" terminal trope). The stickers and the 21 Oct projection use it too. The jacket's language is navy, embroidery and a seal.

**THE AUTHOR'S THIRD CRAFT ENCOUNTER — Rochester, 20 Oct 2026, ~6:22 PM EDT — ADDED TO SECTION I at his "YES", live. Record: `research/SIGHTING-2026-10-20-ROCHESTER.md`.**
- **His account** (verbatim in the file): a pure pearly-white light, very bright at its peaks, six hands up in the west over the setting sun. It held for ~30 s, fixed in x and y, and faded out where it stood like a dimmer. He had tried to call it over. It is the same signature as East Aurora.
- **New: a second witness, his roommate.** Her statements are recorded verbatim. They were given together and in his wording, so they show **agreement, not independence**.
- **Checked the same evening:**
  - the clock: Rochester is on EDT on 20 Oct, so the sighting was at 22:22 UTC; sunset was 22:19:27;
  - planets: Venus, Jupiter and Mars were below the horizon, and nothing bright stood at 50–60° in the west;
  - weather: KROC METAR 10SM FEW180;
  - aircraft: the adsb.lol snapshot was dead-reckoned back, because the traces were refused (403, ledgered). UAL1828 crossed that sky at ~22:17 and the B744 NCR520 at ~22:27, and both were moving fast;
  - the check does not cover untracked aircraft, drones or balloons.
- **His photo** (EXIF 18:52:41 EDT) was sent as a sky reference for scale, so the sighting could be checked. It is not evidence, and it is not to be cited or used as an example of evidence (his correction, 27 Oct 2026). **Personal photos of his go on the page only when he sends them for that purpose.** **It is NOT in the repo, and his location is recorded nowhere:** the repo is public, the skyline places his window, and the file carries GPS data.
- **The page:**
  - Section I's craft passage now reads "three encounters", with the third and the same-evening check after the loft.
  - The closing line is now "For the first two it rules none out; for the third it has excluded the ordinary explanations it could reach."
  - There is no map marker, because it would be a residence.
- **Same evening, at his "Yes": the East Aurora line was updated.** He was outdoors there; at the Rochester sighting the window was open; there was no sound and no movement either time. The page now rules out four explanations for East Aurora:
  - a reflection;
  - sunlight (at 4 AM, satellite height only, and satellites move);
  - a drone (nothing was heard);
  - aircraft.
  For the loft it still "rules none out". The parallax and spectrum tests are in the research file, not on the page.
- **Not on the page:** his "significant now due to time and frequency consistency". By the page's own rule, testimony is promoted by a document, not by accumulation.

**"JULIAN ASSANGE 10/20" / THE EVENT / GESARA TEXT — tested 20 Oct 2026, HELD, unfit for the page. `research/THE-EVENT-GESARA-ASSANGE.md` (11 quotes, vq OK).** Pasted by the author with no instruction.
- **Dating:** it is a January 2021 QAnon text recirculated. The evidence: Türksat 5A launched 8 Jan 2021; "inaugurations" and "overturning election results"; the alias CodeMonkeyZ; the Pakistan blackout of 9 Jan 2021 (an engineering fault). The Assange attribution is false: he was in Belmarsh from 2019 to 2024 (the same false label as the Tartaria text).
- **Every January event it forecast failed** (Deut 18:22). "It's all just for show" makes it a guaranteed null.
- **Killed:**
  - EOs 13818 and 13848 are sanctions orders;
  - ISO 20022 is a messaging standard;
  - NESARA was never introduced in Congress, and GESARA has no text;
  - kinetic bombardment is hypothetical;
  - the EBS was replaced in 1997;
  - QFS, the RV and rainbow notes have no document.
- **Never on the page, even as a specimen:** it calls for strikes on named buildings and dams and for executions (§1). It names two living media figures as Mossad assets to be "eliminated" (living-person floor; they are not named in the file either). It carries the Khazarian trope (killed class).
- The page already grades the class in XVI `xvi-the-q-corpus-the-compressed-case` and I's anti-map. At most it could get one unquoted line there; that is his call, and it is not recommended.

**ENDGAME, THE FOURTH FILM, AT `/endgame` — AND IT IS NOW THE LANDING FILM. 20 Oct 2026.** *(Superseded 22 Oct 2026: Endgame is now a 24-second film of τετέλεσται alone; see the entry at the top of §7. The engine notes and traps below still apply.)*

- **The author's instructions, in order:**
  1. *"Make. New video called endgame. As accordingly"*
  2. *"Replace one featured on site with this"*
  3. *"issue warnings to all nation states and peoples"*
  4. *"this is more cosmic warnings for earth"*

  He answered none of the three choices put to him: which film to replace, the warning's words, or where it goes. So I chose the defaults:
  - Endgame replaces OM COMMA on arrival.
  - The film is addressed, **in his words and labelled his**, "to all nation states and peoples … a warning for Earth".
  - **I wrote no warning in his name.** The content is the report's close.
- **The film:** `scripts/film-endgame.json`, generated by scratchpad `eg/make-endgame-spec.py`; edit the JSON by hand now. It runs 5:20, in nine parts:
  - I. The address: the tier standard, in the report's own words.
  - II. In his own voice: his Endgame statement **typed verbatim, not voiced**.
  - III. It is finished: τετέλεσται.
  - IV. Paid in full?: the 1896 / 1914 / 1934 dates. Moulton & Milligan p. 630 is shown saying receipts were "introduced by the phrase τετέλεσται".
  - V. The count: ἡρίθμηνται, with Luke 12:6–7 in the KJV.
  - VI. The weapon: Isaiah 54:17 in the KJV; the Aleppo Codex; יוּצַר, לֹא יִצלָח, נַחֲלַת.
  - VII. A determined game: Zermelo; Lovelace, verbatim from the fourmilab text, with the full Note A sentence.
  - VIII. Sovereignty: the claimants; PPD-40, the PEADs and the NYPD liaison; FCD-1 "comity".
  - IX. Three completed things: a new `words` finale over the Pale Blue Dot.
  - It closes on "The count is finished. The work is finished."
- **Files:**
  - `public/endgame-reel.{mp4,webm}` (14.6 / 15.5 MB) and `public/b0b-endgame-film.mp4` (24.8 MB, subtitles burned in). **All film files now go to `public/`**: `site/` is near the 250 MB function cap.
  - `public/b0b-endgame-film.webm` is a VP9 encode of the subtitled master, made outside the engine for the landing, because the landing starts muted and the words must be on screen.
  - `site/endgame-reel.js`, `site/endgame-poster.jpg` and `site/img/endgame-card.jpg`.
- **The page:** `site/endgame.html` is written by the new **`scripts/build-film-page.py SPEC OUT`** from the spec: the script, and every source in order of first appearance. Then run `apply-seo-meta.js`.
- **Wiring:**
  - Route, sitemap entry and SEO URL map.
  - A `seo-meta.json` VideoObject entry (PT5M20S).
  - ▶ ENDGAME in the report sidebar.
  - ENDGAME in the `/home` nav and Films list.
- **The landing:**
  - `#b0b-landing` is `data-videos="/b0b-endgame-film" data-title="ENDGAME"`.
  - **OM COMMA stays in `public/`.** `data-videos="/omcomma-1,/omcomma-2" data-title="OM COMMA"` restores it, and the comment in `report.html` says so.
- **Engine (`build-intro-collage.py`), additive only:**
  - `script_font()`: Greek uses DejaVu Serif; Hebrew uses FreeSerif, shaped right to left by raqm and fribidi, both present here.
  - doc style `word`: a word in its own script, the transliteration, then the gloss, wrapped at 0.92 W with a minimum gap of 0.1 H under the word.
  - doc option `bare`: a statement shown without the outer quotation marks.
  - finale style `words`, with optional `media` / `motion` / `dim` for a background still.
  - Existing specs use none of these.
- **Media (49 used):**
  - The sourcing agent's 44 stills and 4 clips: PD, CC0 or CC BY, with the licence read at the source. Manifest at scratchpad `endgame-media.json`.
  - Four NASA Earth images: Earthrise, the Blue Marble, the Pale Blue Dot, and Cassini's Earth from Saturn.
  - **Only the three face-free ERC-1155 frames:** AmTn, E9Iu and VP2i. The other five show actors' or audience faces.
- **Media cut or cropped:**
  - Cut: the bomb-loading clip (over-exposed, and it shows loading, not forming).
  - Cropped out: the Berlin "© SMB" scale bars and the Turin label.
  - The chess film is held inside 6.5–15.5 s with `fixed` (never stretched); after that it turns into a brawl.
  - Masters live in `/home/user/.b0b-intro-sources/v5/` with their sha256s in the spec.
- **Checks:**
  - Quotes on screen are KJV verbatim (`kjv-verse.py`) and Lovelace verbatim (vq OK).
  - −16.1 LUFS.
  - Contact sheets of the spec and of the final file were both reviewed.
- **Flagged for the author, not edited:** Endgame quotes Luke 12:7 as "even the hairs of your head are all numbered". That is the ESV wording. The KJV, which the epigraph uses, reads "But even the very hairs…". The film uses the KJV.
- *Traps:*
  - Piper is `pip install piper-tts` (1.8.0 works with the engine). The model comes from huggingface `rhasspy/piper-voices`, and its sha256 matches the spec.
  - The ffv1 masters run ~2.5 GB each; delete `_build/<film>/` after encoding.
  - **A container restart killed a background encode mid-file.** Encode to a temp name and `mv` on success.
  - Plex Serif and Mono have no Greek: no Greek in `quote` or `ledger` docs. Use `word`.

**TRUMP AS A "RUSSIAN ASSET" — BAYROCK, SATER, MOGILEVICH, PUTIN — researched 20 Oct 2026, HELD. `research/TRUMP-RUSSIA-ASSET.md` (synthesis) + `TRUMP-RUSSIA-A-BAYROCK-SATER.md` + `TRUMP-RUSSIA-B-MOGILEVICH-ASSET.md`; 121 quotes, all vq OK.** Author: *"look into trump being a russian asset, bayrock group, Felix Sater, Semion Moglievich, Putin"*. Before this the page carried Sater 0, Bayrock 0, Mogilevich 0, Steele 0 and Kilimnik 0.

- **Verdict:** rung 4 is unmet on any document. Rung 5 is claimed for no one.
- **Documented:**
  - the Bayrock/Sater decade in Trump Tower;
  - Sater's 1991 and 1998 convictions;
  - **Sater's documented cooperation with the US government, the inversion worth keeping.** Glasser: the sealed file has "not a jot or tittle" on Trump.
  - the Trump-signed Moscow letter of intent (28 Oct 2015) and the Cohen–Peskov's-office call (Jan 2016), against the public denials. Talks ended 14 June 2016. Cohen was convicted.
  - SSCI: Putin "almost certainly" aware of the deal; Kilimnik a Russian intelligence officer. **Both parties' additional views, or neither.**
  - Helsinki: "Yes, I did."
- **Mogilevich:**
  - Charged (EDPA, YBM Magnex).
  - Every route to Trump runs through a building, a brother or a book.
  - SSCI Vol 5, Mueller Vol I, the IG report and Durham name him **0** times, checked against control terms.
- **Killed:**
  - "Krasnov" (a single Facebook post);
  - a "Russian-mafia" 1998 scheme (DOJ names La Cosa Nostra);
  - "Trump directed Cohen to lie";
  - the $50M penthouse "offer";
  - talks running to Election Day;
  - FL Group as "Putin's channel";
  - the ICA as a "treasonous conspiracy".
- **If published:** only as a Section XXIV graded test case, under the living-person floor. The author's call.

**CURRENT EVENTS SWEEP 2–20 OCT 2026 — live 20 Oct. XV `xv-status-update-20-october-2026` (14 paragraphs, ~3,900 words). HELD: `research/NEWS-2026-10-20-HELD.md`.** Author: *"Continue - current events sweep"*.
- **Method:**
  - Three agents: Middle East, rest of world, US institutions. Scratchpad `news4-{mideast,world,us}.md`; ledger notes are prefixed `news4`.
  - 180 agent quotes were re-checked with `vq.py`.
  - **New tool, scratchpad `vqdraft.py DRAFT.html --since DATE`:** it pulls every `&ldquo;…&rdquo;` out of a draft and finds the cached body that holds it, printing the hosts so attribution can be checked by eye. The final subsection showed 124 of 124 matched, and the in-place edits all matched.
- **Carried:**
  - **Yemen–Saudi:**
    - the Mecca pact invoked for the first time (5 Oct; size and role unstated; Ankara silent);
    - Riyadh airport, 12 dead by the Saudi count, 13 per India;
    - the UN envoy's "slid back into full-scale war";
    - Shabwa camp, 53–58 dead.
  - **Iran–US:**
    - the no-attack-before-3-Nov pledge;
    - the SNSC's "insufficient";
    - CENTCOM's 138 redirected vessels;
    - Kpler's two measures (all-Gulf exports vs Hormuz transits; neither refutes the other);
    - *Cape Dao* sank 14 Oct. No attacker of any ship is named.
  - **Fairford:** seven men on bail, none charged; the UK attributes the plot to the IRGC and Iran answers "clumsy false flag".
  - **Gaza, West Bank, Lebanon:** each with its counts' sources; the ICJ docket null again.
  - **The 18 Oct endorsement (attributed) and OFAC designating the ICC itself on 9 Oct (documented), with EO 14203's stated ground** (the warrants).
    - Both went in as dated news at tier.
    - **The Israel drill-down's three XXIV entries and its five page errors stay HELD.**
  - **Sudan:**
    - res. 2830 is a two-month rollover to 11 Dec;
    - the US was penholder and dropped its nationwide draft (the UAE had urged the same publicly; the 1 Oct line holds);
    - three strikes, each with whose count it is.
  - **Ethiopia–Eritrea:** Article 51 letters S/2026/797 and /798.
  - **Ukraine:** Starlink outages and missing warnings (Ukraine's account against the US denials); GL 135 Russian diesel; the Graham-act waiver.
  - **Nord Stream:** the trial opened 14 Oct.
  - **Greenland:** first reading closed 12 Oct.
  - **Citizen Lab:** AdFection/Candiru at Al Jazeera; Serbia now at 16 targets. No operator is named in either.
  - **Epstein instruments:** discharge petition still at 216; DDF read at source; documented nulls on the Black referral, the MLATs, the Library and the D.C. Cir.
  - **Washington:**
    - the 9/11 plea-deal cert denied 19 Oct;
    - DOGE FOIA cert granted 13 Oct;
    - the DMDC breach confirmed (2.76M living + 294,000 deceased);
    - no Senate roll call 1–20 Oct;
    - the CR runs to 11 Dec and the NDAA is stalled;
    - FISA §702 runs to 17 Mar 2027 (Brennan's "jam" claim is attributed);
    - AUTOWARCOM: few details.
- **Our errors, fixed in place (no narration):**
  - **(1) 22 Sept Greenland.** "a re-established base at Narsarsuaq … a second at Mestersvig" overstated the text. Art. IV only allows *"an additional Defense Area at Narsarsuaq and Mestersvig in accordance with modalities and technical details to be mutually agreed"*.
  - **(2) 1 Oct carriers.** It printed AP's "three carriers … end of October" alone. The same-day WSJ/The National account (arrival by end of November, relieving the Washington; two on station) now sits beside it.
  - Also updated:
    - the Nord Stream tiering box (the trial is open; the asylum bid; "the trial has not reached" a verdict);
    - II's Andrew line (the High Court quashed the search warrants 8 Oct; the investigation continues);
    - II's *Phang* line (DOJ's 1 Oct no-right-of-action motion; the 9 Oct order; DOJ lodged notes 16 Oct with a pre-emptive stay ask; no D.C. Cir. ruling in RECAP);
    - XXIV ShinyHunters gained a 9 Oct status: an FBI arrest of an unnamed co-conspirator, and the "third-party vendor" platform.
  - **Correction to my own brief:** in *Phang* the 25 Sept motion to dismiss was the plaintiff's. The page already had it right.
- **Held:** a former BND president arrested for espionage (6 Oct). The office identifies him, and the allegation is foreign-intelligence work, so it is the author's call. Also held: the $281M no-bid contract and every name; the full list is in the HELD file.
- **Scale line:** 282 / 1,137 / 142. `build-transmissions.py` 404'd again (flaky; the reel is untouched).
- **Traps:**
  - **`sed` treats `&` in the replacement as "the whole match"**, so `&rdquo;` in a replacement silently pasted the matched text back in. Edit HTML entities with Python string replace only.
  - **The scratchpad `pipecheck.py` TOC audit stopped at any `<h2`**, and the researchers' guide has an id-less `<h2>` inside XXV. That produced a false "label 19 / li 19 / h3 13". It now stops only at `<h2 … id=`, and was re-proven with a planted missing `<li>`.

**OUTSIDE AUDIT #4 (19 Oct 2026, pasted by the author without an instruction) — checked; the bugs fixed, the rest held.** A product/SEO/security review scoring the site 7.7/10.
- **Checked, and false or already done:**
  - "couldn't retrieve robots.txt / sitemap.xml": both are live (sitemap 23 URLs).
  - The "1,166 vs a different count" discrepancy: every page says 1,166 (report, map, map list, briefing), and `check-consistency.py` reports 0 mismatches. Like audit #3's, this was an indexed snapshot.
  - "Publish unified dataset metadata": `/data/build.json` has existed since audit #3 (build stamp, counts, sha256s), and every deploy checks against it.
  - "Test ARC Shield against known signals": `scripts/arc-selftest.js` does (16 checks, both directions). Reference-instrument validation has NOT been done, and the guide should keep saying so.
- **Its security point found real problems the same day:**
  - (1) Vercel was serving the repo root (entry above, fixed).
  - (2) **CI's "Dependency audit" was failing:** `proxy-addr` had a **critical** IP-spoofing advisory via IPv4-mapped IPv6 trust subnets. That matters because `trust proxy` is set and the rate limiter keys on `req.ip`. `qs` had moderate DoS advisories. `npm audit fix --omit=dev` took patch releases only (express 4.22.2→4.22.3, proxy-addr 2.0.7→2.0.8, qs, body-parser, ip-address), changing the lockfile alone. Result: **0 vulnerabilities**; security 33/33 and seo 57/57.
  - CI's **"CSP browser check" also fails**, and did before this work. It has not been investigated.
- **Held, because each reverses the author or is editorial or structural:**
  - "make the homepage a true gateway": reverses the settled `/` decision, and `/` now opens on his film;
  - "a temporal model / timeline scrubber" for the map: he had the period bar removed on 19 Sept. Dates still exist (`date`/`dprec`, the KML time slider);
  - workspaces for map layers: audit #3's `/lab` split, still his call;
  - three reading modes (documented / full / critical);
  - separate source reliability, factual certainty and inferential strength;
  - a per-edge evidence panel;
  - standalone SEO topic pages;
  - external review;
  - signed release manifests.
- **Cheap, and not done without his word:** a `Dataset` JSON-LD entry for `/data/map-data.json` and `/data/sources-ledger.json`. Only Article, WebSite and WebApplication exist today.

**VERCEL WAS SERVING THE WHOLE REPO AS STATIC FILES, AND THE FUNCTION HIT ITS SIZE CAP — 19 Oct 2026, fixed.**
- **Found while deploying the landing film.** The deploy of `f3dd0fb` (the two MP4s) and `9da987d` FAILED on Vercel; production stayed on the 00:48 build. Cause: `vercel.json` bundles `site/**` into the one serverless function (`api/index.js` → `server.js`), Vercel caps a function at **250 MB**, and `site/` went from 241.9 MB (last good deploy) to 316 MB.
- **And worse, found on the way: with no `public/` and no output directory set, Vercel served the REPOSITORY ROOT as static files, ahead of the catch-all rewrite.** Live, cache-busted: `/CLAUDE.md` (which names the banker §2 forbids publishing), `/server.js`, `/research/**` including every HELD draft and `NEWS-*-HELD.md`, `/research/sources/ledger.jsonl` (with the DOJ Epstein-library rows the public `/data` ledger withholds), `/design/**`, `/scripts/**` - all 200. Only `package.json`, `vercel.json` and dotfiles were hidden (Vercel's own exclusions). Express never served any of it; it was Vercel's static layer.
- **Fix:** `vercel.json` now sets `"outputDirectory": "public"`. Only `public/` is static now, and it holds only the landing film (`omcomma-1/2.{mp4,webm}`, moved out of `site/`). Everything else goes through the function as before. `server.js` serves `public/` as a fallback after `site/`, so local dev serves the same paths. **`site/` is back to 241.9 MB, the size that last deployed** - the headroom under 250 MB is thin; the next large media (films are ~150 MB of `site/`) should go to `public/`, and their build scripts pointed there.
- **NOT fixable from here, the author's:** (1) **the GitHub repo is public**, so CLAUDE.md, the held research and the ledger are public there anyway - making it private is a GitHub setting, and Vercel deploys from private repos; (2) old Vercel deployments keep their own URLs, **but they sit behind Vercel Authentication** (checked: a failed deployment's URL answers "Protected by Vercel Authentication"), so they are not publicly readable.
- *Trap:* a live check that only compares the report's manifest stamp (`check-live.js`) says "deploy did not fire" for a deploy that FAILED. **Read the Vercel status GitHub keeps** (`gh api repos/<repo>/commits/<sha>/status`) - it says success/failure and names the deployment.

**THE LANDING NOW OPENS ON AN ANIMATED b0b.dev MARK, THEN THE AUTHOR'S FILM "OM COMMA" — 19 Oct 2026.**
- **The author's instructions, in order:**
  1. *"pull this video from my profile OMCOMMA and place this as the video on the website landing page - intro in with b0b.dev animated, and then have this video: x.com/omcomma/status/2110615223845499258"*
  2. *"video is fine -art collage"*
  3. *"you have to add video I cant"*
  4. *"raw file on other computer"*
  5. *"keep the video exactly as it is"*
- **What a reader now sees on arrival at `/`:**
  - `site/b0b-wordmark.js` plays the mark (~3.4 s):
    - a cursor;
    - "b0b.dev" typed in Plex Mono, green;
    - the zero's slash drawn in cyan, as on the stickers;
    - one scan sweep with a brief signal split;
    - a CRT collapse to a point of light.
  - `site/landing-intro.js` then plays **OM COMMA #1 then #2**, the post's two videos in its order, full screen.
    - It starts **muted** with a "TAP FOR SOUND" control; tapping the picture also turns sound on.
    - The label reads "OM COMMA · 1 / 2".
    - **ENTER THE REPORT / Escape work from the first frame.** When the last video ends, the reader is in the report.
- **Same loader rules as the intro film:**
  - the bootstrap shows it once per session (`b0b:intro:seen`) and never on a deep link;
  - fail-open at 8 s if the script never claims it;
  - with reduced motion, the mark is still and the film waits on a PLAY button;
  - missing videos fall straight through to the report.
- **The old intro film is untouched.** It plays from the sidebar's ▶ INTRO FILM button and at `/intro`.
- **Wiring:**
  - `#b0b-landing` carries `data-videos="/omcomma-1,/omcomma-2"`. The bootstrap opens it instead of `#b0b-intro` whenever that attribute is present, so **removing the attribute restores the old arrival**.
  - `landing-intro.js` sets `window.__b0bSoundtrackHeld`, which `soundtrack.js?v=4` reads at load, so the site music does not start under the film. Releasing on ENTER restores the old intro's behaviour.
- **Source, recorded plainly:**
  - X refuses the spider by robots on both the post and its oEmbed (ledgered nulls, as always).
  - The author could not send the file: his raw file is on another computer.
  - So **one user-directed download of his own post was made with yt-dlp at his instruction**. This was not the spider: no login, no cookies, no proxy. It is his media, not a cited source, and the source rule is unchanged.
  - The two videos:
    - #1: 4:15.85, sha256 `32bc48d1…`;
    - #2: 2:51.53, sha256 `ea93315f…`;
    - both 960×540, H.264/AAC (X's re-encode).
  - `scripts/build-landing-film.py SRC1 SRC2` writes `public/omcomma-N.{mp4,webm}` (Vercel's static output; see the entry above):
    - the MP4 is a stream copy with `+faststart`, **proven bit-identical by decoded-stream MD5**;
    - the WebM is VP9/Opus, CQ capped at 650 kbps (uncapped VP9 came out larger than the source).
  - **When the raw file arrives, re-run the script on it.** Nothing else changes.
- **Content, reviewed frame by frame before shipping and adjudicated by the author:**
  - **#1:**
    - a mirrored DARPA logo is stamped over almost every shot of Trump;
    - it includes the 1992 Mar-a-Lago footage with Epstein ("She's hot", 2:48), unidentified young women at parties (0:00, 0:36, 1:18, 1:42), his grandchildren (3:12), the IAC 2019 summit (2:12) and "DEEP STATE" (3:18);
    - it ends on the Amharic "ተፈጽሟል ስራው ተጠናቀቀ", which I read as "it is finished; the work is completed" (my reading, not dictionary-checked; it echoes τετέλεσται).
  - **#2:** a Trump collage with no Epstein footage and no DARPA mark; the grandchildren at 0:38; 11 s of black at the end.
  - **Both** are mostly third-party news footage.
  - **I flagged:**
    - the films' own rule ("in a montage, juxtaposition is implication") on page one;
    - the children's faces;
    - rehosting third-party footage.
  - I offered #2 with blurs, both with blurs, or a page of their own. **He chose: "keep the video exactly as it is."**
  - Published unedited, with **no disclaimer on the page** (§2).
  - *Correction to my own position, recorded:* I had said I would not ship the children unblurred "under any option". On a closer look they are his grandchildren in widely broadcast White House-lawn footage, nowhere near the party footage. The statement overreached, and his call stands.
- *Traps:*
  - **A `for p in /proc/*` kill loop that matches on command text also matches the shell running it** (exit 144). It is the pkill trap in another form: match the exact ffmpeg pid, or kill by pid you printed first.
  - A Playwright route that fulfils media from disk sends no Range, so `seekable` is `[0,0]` and seeks silently fail. Route `/omcomma-*` to the real Express server in tests.
  - A fresh container has no ffmpeg: `pip install imageio-ffmpeg` (has libx264/libvpx-vp9/libopus), and `pip install yt-dlp` only if the author again asks for his own media.

**ISRAEL AND THE US SINCE 1960 — DRILL-DOWN, 19 Oct 2026, HELD for the author. `research/ISRAEL-US-DRILLDOWN.md` (synthesis) + four line files `ISRAEL-US-{A-CURRENT,B-1960-1989,C-1990-2026,D-LAW-SYMMETRY}.md`; publishable text in `research/drafts/xxiv-favorite-nation-v2.html` (three XXIV entries; supersedes the 25 Sept draft).** Author, with a screenshot of an X post: *"Run this data … how America is infiltrated by Israel - and not heeding the warning of influence of foreign powers … full drill down … going back to 1960 at least with the bombing of our ship. Trump just endorsed war criminal Netanyahu"*.
- **The post ("Patel has formally agreed to work with Moskowitz to reform Section 230, which critics say will target Americans … who post 'conspiracy theories' about Israel"):** it is the 17 Sept 2025 House Judiciary exchange (Serial 119-35, read in full), recirculated with "formally" added.
  - Moskowitz named "Israel assassinated him" as one Kirk conspiracy theory; Patel: "I will work with you on 230 any day."
  - No letter, MOU or bill exists. The 230 bills (S.3546, H.R.10332) are flat repeals that name no subject.
  - The nearest text is the nonbinding H.Res. 1239 (Moskowitz cosponsors).
  - Where speech about Israel actually met state power was visas, not §230: *AAUP v. Rubio* (viewpoint-discriminatory, on appeal).
- **Endorsement:** real, 18 Oct 2026. It is attributed because Truth Social refused the spider ("Complete and Total Endorsement … If Israel has the wrong Leader … America will have to do this work ourselves"). Israel votes on 27 Oct. Printed as **US intervention in a foreign election**: attachment from the American side, not evidence of Israeli control.
- **"War criminal" at tier:**
  - The ICC warrant is in force; the PTC twice declined to withdraw it in 2025. Israel's remanded jurisdiction challenge is undecided. There has been no trial.
  - The prosecutor was removed for misconduct on 24 July 2026. That touches the conduct finding, not the warrant.
  - **OFAC designated the ICC itself on 9 Oct 2026**, after all three issuing judges.
- **The record, graded:**
  - **Liberty:** attack, 34 dead and $12.9M compensation are documented.
    - **Both governments' official verdicts say not premeditated:** Clifford's "flagrant act of gross negligence"; the CIA's "by mistake"; Israel's "innocent mistake".
    - The dissent is inside the US record: Tordella, "A nice whitewash"; Boston's 2004 sworn declaration (testimony); Moorer 2003 (attributed).
    - Deliberate intent is **not established**.
  - **Dimona:** access limits documented; the concealment is the NSArchive historians' finding (attributed).
  - **AZC 1962:** DOJ told it in writing it was a foreign agent; it never registered (documented).
  - **NUMEC:** losses documented; diversion not established. Brzezinski 1977: "no evidence — despite an intensive search for some".
  - **Pollard:** the handler also tasked "any information that would identify Israeli officials who were providing information to the United States" (DCI damage assessment).
  - **Kadish and Franklin:** documented. The **government itself moved to dismiss Rosen/Weissman**.
  - **NSO:** Entity List; WhatsApp judgment; FBI licence Dec 2018.
  - **STOIC 2024.**
  - **Clock Tower X (FARA #7649), Israel MFA via Havas:** "Deployment of websites and content to deliver GPT framing results on GPT conversations"; $15M received to Mar 2026; sites carry the FARA footer.
- **Symmetry:**
  - The comparator prosecutions (Saudi, Egypt, Qatar, China, Russia; UAE acquitted) put Israel inside the range.
  - FARA receipts, H2 2024, **re-summed by me from DOJ's report:** Saudi $31.6M … Israel $11.1M.
  - ODNI ATAs 2024–26 do not name Israel as an espionage or influence threat; that is a finding about the documents (guaranteed null).
  - The 1995 DIS memo's "strong ethnic ties" line was **repudiated by SecDef Perry**. It is the guardrail's own example.
  - **Killed:**
    - "formally";
    - "§230 to target posts about Israel";
    - "infiltrated" read as control (unsupported, as in the held draft; rung 5 for no one);
    - krytrons: attributed only, unused.
- **Page errors found, flagged, NOT edited (fix on publication):**
  - (1) XVI reading-room Liberty line says intent is "disputed between the two governments' official accounts". It is not: both say not premeditated.
  - (2) XV ICC paragraph is stale. It omits the 24 Apr 2025 reversal, the pending challenge, the sanctions and the prosecutor's removal.
  - (3) II Pollard "apologised and disbanded the unit … Peres": not in any primary read.
  - (4) "Dimona – false walls" (II/IX): unsourced; attribute it or reword it.
  - (5) XV network line ties AIPAC to Netanyahu's four Congress addresses; congressional leaders invited him.
- **The 25 Sept draft had stale or imprecise lines, fixed in v2:**
  - Egypt "the same amount since 1987": not in current CRS. FY2026 is $1.375bn.
  - War-powers "seventeen … concurrent resolutions": per CRS, one concurrent resolution passed both chambers.
  - FBI Pegasus licence: Dec 2018, not 2019.
- **SPIDER FIXES (`scripts/spider/`):**
  - **Cold-cache bug.** The cache is gitignored, so in a fresh container the ledger points at bodies that are not on disk. The spider still sent `If-None-Match`, got a 304, and recorded an unreadable path as "unchanged". It now sends conditional headers only when the cached body exists.
    - Proven both ways: cold → full fetch; warm → 304.
    - Change detection still compares against the ledger hash.
  - **Three decoy-200 hosts registered** in `hosts.json`, by title: `2021-2025.state.gov` "Technical Difficulties", `uscode.house.gov` "Page Not Found - US Code", `icc-cpi.int` "Gcore". Proven both ways.
- *Traps:*
  - Scratchpad `vq.py` was rebuilt this session (pypdf with the `cryptography` stub; `pdftotext` is not installed).
  - Unquoted heredocs expand `$1` in "$174 billion".
  - Many NSArchive scans have OCR layers that break exact matching ("le av i ng", "eviCi~~n.ee"), so check them by hand.
  - **Naming traps:** "Mega" 1997 codename ≠ Mega Group; the Psy-Group employee "Epstein" ≠ Jeffrey; the Havas "Esther Project" ≠ Heritage's "Project Esther".

**SITE TRANSLATION FIXED — 19 Oct 2026, live.** Author: *"Site language translation is not working"*.
- **Why it was broken:**
  - The report's body loader listened only for `postMessage` from a parent or child frame. The report has been served at `/` directly since 19 Sept, so a menu choice never reached it.
  - Its files (`/i18n/<lang>/report-*.html`) 404'd anyway: `.html` is not on the static allowlist.
  - Countermeasures had the menu and **zero** `data-i18n` elements, so a choice there did nothing.
- **The stored translations were stale and carried killed passages.** For example, es: *"Las familias no."* (the §7 families trope) and *"Cámaras Hikvision en NAC"* in es/de/fr. **`site/i18n/` (11 languages) is deleted. Do not restore stored translations of the report;** they cannot keep up with corrections.
- **Now:**
  - `i18n.js?v=2` dispatches a same-window `b0b-lang` event (`detail {lang, gesture}`), and the dictionary still does menus and h2s instantly.
  - **`site/page-translate.js`** translates the *current English* text node by node, lazily near the viewport, via the browser's on-device **Translator API** (desktop Chrome 138+). Markup, links and the Greek `lang="grc"` are untouched, and Show English restores the exact HTML.
  - Its bar says *"machine translation of the English text, made on this device. The English is the record."*
  - A model that needs downloading waits for a click; there is no auto-download on load.
  - Everywhere else the bar offers a Google Translate link, labelled as sending the page address to Google.
  - Loaded on the report (`data-root=".main-content"`), `/home` (`.wrap`) and countermeasures (`body`).
  - **Not on the map**: its DOM watchdog flags any change to header/nav text as an integrity mismatch, so the map stays dictionary-only.
- *Trap:* **Chromium 141 headless exposes `Translator` but `availability()` never settles.** Every step now has a deadline (3.5 s availability, 8 s create of a ready model) and falls back to the Google bar. Without the deadline the reader got nothing.
- Tested with real Chromium plus mocks (available / downloadable / home / countermeasures / map).

**ANNOUNCEMENT IS NOW SPOKEN WORD OVER A BEAT — 18 Oct 2026, live at `/announcement`. Third cut; supersedes the two below.**
- **Why:** the author rejected the calm cut ("too passive") and then the harder rewrite: *"this reads like a boring advertisment for the report. people are not going to listen to this"*.
- **Lesson: explaining the report (grades, "what the report is") is the advert. Tell the record and speak to the listener; name the site once, at the end.** README has the full map.
- **Structure:**
  - **It opens cold in 1976, not 1996** — the author's correction: *"1996 is inaccurate - our report charts epstein and maxwell to the 80s"*. He was right: 1996 is only the first police report.
    - 1976: Bear Stearns' Fidelifacts check (documented). This is the refrain "Written down. Filed. And nothing changed.", from the report's "commissioned, written down, filed, and did not change the decision".
    - 1985: London, his brother's email (documented).
    - Late 1980s: Ghislaine Maxwell's circle, "a television investigation says" (attributed). Never "documentary", which misheard as "document" would upgrade the tier.
    - 1996: the police report and the FBI referral, then ten years of nothing.
  - Then 2007 ("cut a deal… grants immunity to people the government has not even named", OPR's "poor judgment", thirteen months on work release).
  - Then the open door: the patronage line; JPMorgan "flags him, and keeps him" to 2013.
  - Then 2019 (charged; dead in federal custody five weeks later, before any trial).
  - Then the dark: 200,000 pages; New Mexico's stand-down, said as the state's claim.
  - Then John 12:42 paraphrased and 12:43 quoted.
  - Then the address to those inside, **safety lines verbatim**.
  - Then the close, with the private-citizen line, ending "Nineteen seventy-six. Nineteen ninety-six. Two thousand and seven. Written down. Filed. Nothing changed. / Not this time." and looping back into 1976.
- **Left out on purpose:** the deniable-assets conclusion (it cannot be said at tier without three hedges), and the grades.
- **Sound:** `music()` is an 84 bpm minor beat, synthesised. It drops out for the cold open, for four lines and under the address, and comes back on a low hit. Highpass 45 Hz, about -13 LUFS. No alert tones, sirens or lone cracks.
- **4:13.**
- **Listening test on the published MP3:** 43/43 in four conditions and 42/43 in one; WER 1.8–3.3%, no negation lost.
- **Pronunciation fixes:** espeak says "steerns", so the firm is spelled "Bear Sterns" with commas for the voice.
- *Scorer traps fixed:* it deleted unknown numbers (`words()` now voices years); "onto" vs "on to"; the letter B written "be". **Whisper base.en skips repeated short phrases (the second address) in noise; that is the transcriber, not the audio.**
- **Not done:** another voice (a male voice needs its licence read first).

**NHI / SPACE FORCES AND TARTARIA / ANCIENT — two research passes, 18 Oct 2026, NOT PUBLISHED. `research/NEWS-2026-10-NHI-SPACE-AGENT-A.md`, `research/NEWS-2026-10-TARTARIA-ANCIENT-AGENT-B.md`.** Author: *"heavy disclosure reports of non-human intelligence and beings, possible connections to Tartaria (russia evidently releasing files?) underground cities, old advanced civilizations … newly forming space special forces groups"*.
- **NHI, documented:**
  - DoW's 14 Sept waiver of NDA/SAPIA civil and administrative penalties, **for disclosures to PURSUE only** — not public disclosure, and the quoted text does not reach criminal law;
  - the UAP Disclosure Act was adopted by the House only (Senate cloture failed 50–46 on 14 July);
  - no seventh PURSUE release as of 18 Oct.
- **NHI, testimony and attributed:**
  - Stratton's Roswell "living beings" is secondhand from an unnamed insider (keep unnamed);
  - "21 agencies reviewed the book" is his representative's claim, and review ≠ endorsement;
  - Grusch on Rogan (30 Sept) is hearsay by his own account;
  - no new official response to either.
- **Space:**
  - **SPACEFOR-SOC activated 7 Oct** (memo 29 Sept, ceremony 2 Nov). It is a component HQ, not "space special forces" — naming error. Its FY2026 funding block is unresolved.
  - Army Space Operations Branch established, 600+ soldiers reclassified.
  - UK No. III Space Effects Squadron announced 23 Sept ("disrupt, degrade and deny"), capabilities undisclosed.
  - Japan's ASDF rename takes effect by Mar 2027.
- **Tartaria — Russia released NOTHING:**
  - "Putin declassified the Tartaria archives" names no archive, document or date. Earliest copies: a ~12 Oct 2025 Facebook post (Maldita) and an 18 Mar 2026 Substack note. The "Julian Assange" attribution is unsupported, and the text carries the bloodline/Rothschild trope — recorded as such.
  - What Russia did: a 2017 Blaeu map gift to Shaimiev; Medinsky's "with humour"; the RGO in 2020 calling Tartaria "a mythologized land" and naming Levashov and Fomenko.
  - **Britannica 1771 kills "erased from later editions"**: 77 words in 1771; 5,643 words in 1797. Russian and Chinese Tartary are named in the same edition.
- **Ancient, new:**
  - Remote Sensing retracted the Biondi–Malanga Great Pyramid radar paper on 10 Aug 2026; the Khafre "city" was never peer-reviewed.
  - Karahantepe human-on-leopard sculpture, 25 Aug 2026.
  - Hawara dig started May 2026; no results.
- **THREE ERRORS ON OUR PAGE, flagged, NOT edited (fixable on his word):**
  - (1) XIII says Göbekli Tepe was "deliberately buried … Why bury what you built?" The DAI excavators revised this in 2020 to slope slides (Clare, *e-Forschungsberichte* 2020/2), and the "astronomical alignments" are contested (DAI 2017).
  - (2) XIII says the geological record "confirms" the Younger Dryas impact. It is contested: 2026 volcanic osmium; a platinum spike 45 years late; two PLOS One retractions in Feb 2026 and the Tall el-Hammam retraction in 2025.
  - (3) XVI's Tremonton update prints Blue Book vs NPIC as the disagreement and omits the released file's own later seabird assessment (and the 1953 Robertson Panel). That is symmetry failing toward the anomalous reading; NPIC's "1954" date is also unverified.

**THE REPORT LEADS WITH THREE VERSES — 18 Oct 2026, live.** Author: *"Lead with the report of John 12:43 and John 19:30, Along with Holy Holy Holy Is The Lord God Almighty, Who Was, And Is, And Is To Come - as the paper ends on this in many a way."*
- **What is on the page:** `.report-epigraph`, directly under the title block and above the summary. It holds three `<blockquote>`s with no gloss: John 12:43; John 19:30, with τετέλεσται, its citation linking to `#xxiv-endgame` (the close); and Revelation 4:8.
- **Text source:** KJV verbatim from the ledgered Gutenberg #10 via `scripts/kjv-verse.py`. That copy prints "LORD God Almighty" and "which was", so the page does too, not "Who was".
- **Do not add exegesis.** It is his epigraph.
- **Mechanics:** the blockquotes are read by the narrator (right after the title) and by search. No `<p>`, so the scale line is unchanged.
- **Matthew 4:19 stays in the summary**, untouched.
- *Trap:* in a fresh container the KJV cache is cold, and `kjv-verse.py` dies with FileNotFoundError until the spider re-fetches `pg10.txt`.

**"DUMBs NOT NEW / HOW FAR BACK / NON-HUMANS USING HUMANS AS SLAVE LABOUR" — tested 14 Oct 2026, NOT PUBLISHED. `research/DEEP-CONTINUITY-NHI-LABOUR.md`.**
- **Underground is ancient — documented, and against the frame.** Derinkuyu was possibly cut by Phrygians in the 8th–7th century BC. It sheltered the hunted (Christians from raiders; Greeks and Armenians fleeing the 1909 massacres), not rulers. The state bunker is the 20th-century inversion.
- **Continuity:** the documented continuity is the instrument (debt and forced labour, Hammurabi §117, read at source), not a lineage. ILO 2021: 28M in forced labour, 86% private.
- **"Transmedium" and "submerged" objects are in US law** (50 U.S.C. §3373(n)). That is a reporting category, not a finding.
- **The labour thesis has a traceable genealogy:** Atra-Hasis (myth) → Sitchin (mistranslation) → Icke (Protocols, via Cooper), i.e. the killed families trope with scales. It also moves the owner off-world, away from the documents and from people with names.
- **Flagged, not edited:** XIII's cycle "pattern" sentence asserts intent; its Alexandria/642 line is a lead to check.

**"WHAT DOES THE REPORT SKEW TOWARDS" — answered 14 Oct 2026 from counts. Nothing edited; these are flagged for the author.**
- **A over C.** II's competing-hypotheses block says C "fits everything A fits and asks less of the evidence" and "almost nothing in the public record separates A from C". It still states A. The lean is disclosed on the page; the call is the author's.
- **An internal contradiction (a factual inconsistency, fixable on his word):** II says Wexner and Black's payments are unexplained: "no payer has ever explained what they bought". II's own Black subsection records Black's stated reason (tax and estate advice, claimed $1B+ in savings) and Dechert's finding that the fees were for legitimate services. The conclusion's wording, "on a scale nobody has explained", is the accurate one.
- **XIV's title, "The Unbroken Chain"**, is the anti-map phrasing the sticker set refused ("the chain was never broken").
- Several section titles assert design at full strength where their bodies grade it lower (VII, X, XII, XIII "Evidence of…", IX "D.U.M.B.").
- **The map:** 188 of 378 connection lines are T0/T1 (analogy or correlation); 153 are T3+.
- **Clubs over money, still:** CFR 125, Trilateral 63, Bilderberg 42 against In-Q-Tel 6, Booz Allen 3, BlackRock 6, Vanguard 2.
- **Mentions:** Trump 151, with his own II subsection. Against that: Clinton 29 with no subsection (his flights are tiered in XX), Obama 40, Bush 38, Biden 21. Mostly corpus volume and calendar. XX carries talking points from both sides.
- **Intelligence services:** Mossad 52 / Israel 83 against KGB 7, FSB 6, GRU 4. The Soviet sponsor *was* scored in II and loses on a date.

**JAY STRATTON "I HAVE SEEN NON-HUMAN BEINGS" (Fox News, book *Out of the Shadows*) — tested 14 Oct 2026, NOT PUBLISHED. `research/STRATTON-NHI.md`.** Page: Stratton 0.
- **The claim is XVI Branch A, unchanged.** It is testimony tier: the statement is documented, the object is not. No document or material was presented.
- **What differs from Grusch:** Grusch was secondhand by his own account; Stratton claims first-hand sight. That is stronger testimony of experience, but the tier is the same.
- **It is not new.** He made the same claim in *The Age of Disclosure* (2025), and repetition on a book tour is accumulation.
- **The "hidden hand" official is unnamed;** keep it that way.
- **Null:** the Fox segment itself was not read.

**JFK / KHRUSHCHEV / "UFO FILES" / MJ-12 NOTE — tested 12 Oct 2026, NOT PUBLISHED. `research/JFK-NSAM271-UFO-MEMO.md`.** The author pasted a viral post with no instruction. The page had none of it before (NSAM 271, Khrushchev, Lancer, burned memo: 0).
- **Documented:** NSAM 271, 12 Nov 1963 (FRUS 1961–63 XXV, doc. 410, read in full). JFK orders NASA to *develop proposals* "with a view to their possible discussion with the Soviet Union". **It records no agreement and says nothing about UFOs.** Also documented: the 20 Sept 1963 UN offer of a joint Moon expedition.
- **Attributed:**
  - Sergei Khrushchev (1997): his father had decided to accept. A son's recollection, with no Soviet document.
  - The JFK→CIA "UFO files" memo. It comes from one author's book; he says he got it by FOIA. The JFK Library found "no evidence of this memo or anything like it".
- **Unsupported:** "Angleton has MJ-12 directive". Its only trail is the anonymous 1999 "burned memo" package (Cooper / "Source-1"; undated, unsigned).
- **Anti-map:** the post says "Not a theory. A timeline." and then asserts cause.
- **Nulls:** JFK Library 403; FBI Vault 403; CIA reading room decoy.

Offered to him as a XXIV test case; his call.

**PUBLIC ANNOUNCEMENT AT `/announcement` — 11 Oct 2026, live. `design/announcement/` (README has everything).**

*How the brief evolved:*
- Opened as *"hanoi hannah style audio clip … to play outside when protesting"*.
- Then *"a public service protest announcement [rather] than disparaging and humiliation"*.
- Then *"needs to be clear and direct"*, playable alone.
- He chose *"Own page, /announcement"*.
- Then *"more talking about what the report is about and reaching out more effectively"*.

**What is live:**
- **A 4:09 spoken pass in Piper `en_GB-cori-high`**, the films' narrator (LibriVox, public domain). It covers: who it is from (a private citizen, not government, not police); what the report is; the five grades; **the conclusion at its tier, in the masthead's wording** (functioned as deniable assets; a judgment, not a document; no claim either was run by a handler; the film carries the same, by his "Both, at their tiers"); the record is deliberately dark; what you can do (read, choose one claim, send corrections, tell one person); a short address to anyone who serves; and the address `b0b.dev` three times.
- **The files:** a loop MP3 (3.8 MB) and a 62-minute MP3 (28.4 MB).
- **The page:** player, downloads, the words, and how it was made.
- **Links:** the `/start`-family nav and `/home` only, as with the stickers.

**Keep in any edit:** "This message does not ask you to disobey legal orders… desert, sabotage, obstruct, or leak." 18 U.S.C. § 2387 makes urging insubordination or refusal of duty in the armed forces a crime. The page also tells listeners to check local amplified-sound rules.

**Tested by machine listener** (`check_clarity.py`: Whisper `base.en`; clean plus four street recordings at 6 and 3 dB SNR; loop context). **It caught a reversal on the most sensitive line:** "The report *never* claims…" was heard as "*now* claims", every time. "Nothing here asks…" lost "Nothing". Fixes and the check that came from them:
- Negations now sit mid-sentence ("makes no claim", "does not ask").
- The test fails any critical sentence heard without its negation, and was proven both ways.
- In the final run no negation was lost, and about 96% of words were right in noise.

*Traps:*
- "lawful" was heard as "law for", so the lines say "legal".
- **espeak says "GHIS-layn"**; the voice gets `[[ɡiːlˈeɪn]]` via `PRONOUNCE`.
- **Every Piper synthesis is a random take.** The cache is keyed by text, so the closing address reuses a verified line.
- A soft final *v* was trimmed (fixed with a 120 ms tail).
- Whisper invents words over trailing digital silence, so the test runs in loop context.
- **SendUserFile caps at 30 MiB**, so the hour file is 64 kbps.

The toolchain is not in the repo (venv, the 114 MB model, static ffmpeg); the README has the setup. **In the report's menus since 18 Oct 2026, at his instruction ("put that on homepage too / menu i mean"): a cyan ANNOUNCEMENT link after ABOUT in the top nav, and "▶ ANNOUNCEMENT" after the films in the sidebar.** **Stickers joined them on 20 Oct 2026** ("Also put stickers on main menu"): a cyan STICKERS link after ANNOUNCEMENT in both menus.

**STICKER LINES REWRITTEN FROM THE REPORT ITSELF — 10 Oct 2026, live at `/stickers`. Supersedes the attractors in the two sticker entries below.** Author: *"I don't think these slogans match the depth and weight of the actual report."* He was right: the first set was method jargon and internet register ("sources or it didn't happen"). **Every line is now the report's own sentence or a cut of it, and the README quotes each source sentence:**
- 01 NO HANDS OF ITS OWN (`$ whoami`; "To those inside");
- 02 THE RECORD IS DELIBERATELY DARK (masthead; set between redaction bars);
- 03 SLAVERY DID NOT END. IT CHANGED FORM. (XIV's opening; **the second sentence is kept because the first alone overstates**);
- 04 WHERE NO SUNLIGHT REACHES (masthead anglerfish; the QR is the light);
- 05 τετέλεσται (unchanged);
- 06 IN COURT, THE SILENCE HELD (II, the NDA ruling; ON AIR board);
- 07 THE MAP BENEATH THE MAP (XV title);
- 08 NO WEAPON FORMED AGAINST (unchanged);
- 09 WEIGHED AND FOUND WANTING (IV, Dan 5:27; **neon = the writing on the wall at the feast**);
- 10 NOT ONE SPARROW IS FORGOTTEN (the close, Luke 12:6);
- 11 THE EMERGENCY DID NOT END (XXIV, Proclamation 7463);
- 12 THE LEDGER IS ALREADY KEPT (the close, the author's reading).

**Refused for sticker use, with reasons:**
- "put a light into it" — reads as "put a light to it", the British idiom for setting fire;
- "refusal is required", "a moral choice was possible", "vastly more of you" — servicemember-facing lines; a sticker cannot carry the page's lawful-channel framing or the Article 94 warning;
- "secrecy is evidence of nothing" — out of context it reads as an apology for the secrecy;
- "200,000 pages withheld" — a count that will go stale on a printed object;
- "the chain was never broken" — reads as an anti-map chain;
- "you are known" — reads as surveillance; the page reads Luke 12 as consolation.

Topical names (Epstein etc.) are still off the set; that is his call.

**`verify.py` now checks that the line on record is the line set on the art.** It compares words in order, ignoring punctuation and inline tags. It was proven both ways: a planted wrong line fails. On its first run it caught its own extractor splitting 08's drop cap "N|o".

*Traps:*
- Doto's comma and period render as "/" and "+" at sticker size, so the LED lines carry no punctuation.
- Monoton's word space is too narrow, so the neon uses `word-spacing:.24em`.
- Re-rendering after other designs change size shifts sub-pixel anti-aliasing on unchanged ones (0.03–0.09% of pixels). Restore unchanged print files from HEAD so the diff shows only real changes.
- Old print/web files are not cleaned by `publish.py`. Delete them first, or the site keeps serving retired designs.

*Noticed, not edited:* XXIV's Proclamation 7463 paragraph says "continued again beyond 14 September 2025". The film fact-check recorded the 8 Sept 2026 continuation (91 FR 57773). The text is not false, but it is a year behind.

**STICKERS HOSTED AT `/stickers`, EVERY STICKER WITH A QR, ZERO MADE PRONOUNCED — 10 Oct 2026, live.** Author: *"host on site"*, then mid-task *"all stickers should have a qr code and make the zero pronounced www.b0b.dev"*. **Every sticker now carries its own QR** (small tiles: version 2, level Q, tinted per sticker but always dark-on-light — inverted codes fail on many phone cameras; 04 and 10 keep the large level-H code with the "b0b" mark) **and the address reads `www.b0b.dev` everywhere, its zero slashed and in the sticker's accent colour.** *Trap:* the Google build of IBM Plex Mono strips OpenType `zero` — **IBM's complete build (github.com/IBM/plex, `packages/plex-mono/fonts/complete/ttf/`) has it: default zero is dotted, `zero` → `zero.alt01` slashed, `salt` → plain**; `body{font-feature-settings:"zero" 1}` does the rest; VT323, Black Ops One and Monoton get a CSS-drawn slash (`.z`). **`verify.py` decodes the QR from all twelve print files at 1, ½ and ⅓ scale (93/93), and every 720 px web preview scans too.** Site: `design/stickers/publish.py` writes `site/stickers/{print,web}/`, the plain QR, `b0b-dev-stickers.zip` (print files + README + font licences) and `site/stickers.html` on the `/start` template (`main_class='stk-main'` — `main` is capped at 72ch otherwise); `site/img/stickers-card.jpg` is its share card. Wired: `PAGES` + `CANONICAL_PATHS` (sitemap), **`.zip` added to the static allowlist** (`application/zip`; it is the only zip under `site/`), `apply-seo-meta.js` URLS + `seo-meta.json` (CollectionPage). **Linked from the `/start`-family nav, the `/home` nav and, since 20 Oct 2026 at his instruction, the report's top nav and sidebar (cyan STICKERS after ANNOUNCEMENT).** The map's header does not carry it. *Capture trap:* a full-page screenshot fired before async image decode shows random blank cards — await `img.decode()` first; and the dev server's 60/min limiter 429s a third back-to-back capture — use a fresh port.

**STICKERS + QR — `design/stickers/`, 10 Oct 2026 (first pass; superseded above).** Author: *"make b0b.dev stickers in really cool fonts - with some type of 3-5 word attractors"*, then *"and a qr code"*. Twelve die-cut designs, one display face each (VT323, Special Elite, Big Shoulders Stencil, Plex Mono, GFS Didot, Doto, Rubik Glitch, Jacquard 24, Monoton, Unbounded, Anton, Libre Barcode 39 Text; all OFL 1.1 except Special Elite, Apache 2.0 — licence files in `fonts/licenses/`). **Every attractor is the site's own method line** (guaranteed-null, anti-map, tier ladder, "promoted only by a document", "refusals logged as findings", XXV's opening, the author's Isaiah 54:17 line, τετέλεσται's reading); no person named, no claim beyond the page; topical names (Epstein etc.) deliberately left off — his call if wanted. **QR = `https://www.b0b.dev`** (canonical; `b0b.dev` 308s there), level H, centre mark knocks out modules rather than painting over them. Pipeline: `build_assets.py` → `node render.js` (Chromium at 300/96 DPR; **refuses to render if any face fails to load**) → `finish.py` (EDT die-cut border 0.07 in, 300 dpi pHYs, preview) → `verify.py` (QR decodes down to 118 px and on dark, Code 39 → `B0B.DEV`, 3–5 words, licence per font). *Traps:* Jacquard 24 has no ✠ (glyph-check every string before rendering — a fallback is silent); Monoton has no lowercase and its 0 reads as O — the zero is slashed by CSS; `openfontlicense.org` is the OFL's current URL, so a licence test looking for "ofl"/"open font" false-fails.

**"DIA LOCATED THE MISSING AAWSAP FILES" — tested 6 Oct 2026, HELD. `research/AAWSAP-FILES.md`.** One Knapp post on X (robots null, read only via a UFO Feed retelling); no DIA/PURSUE statement or named outlet. Knapp co-authored two books with Lacatski and Kelleher (he says so). **His own 9 Sept 2025 Oversight testimony calls the 100+ papers "bottled up" at DIA — held, not missing;** "located" swaps one claim for the other without a document. The 18 Sept PURSUE tranche re-collected the 37 DIRDs + contract records already FOIA'd, not the warehouse. If DIA confirms: one line on the XVI reading-room entry. *Lead, unchecked: IBTimes says Blue Book later settled on seagulls for Tremonton.*

**McCASLAND — XXIV SEVERED-CHAIN BOX CORRECTED, 6 Oct 2026, live. `research/MCCASLAND.md`.** Author sent a Daily Mail link (Grusch on Rogan; Podesta's reply) with no instruction. **The page already carried him, and checking found four errors of ours:** (1) "sensitive aerospace program" was printed as DeLonge's words — **not in Podesta emailid 3099** (read at source); the real lines are now quoted; (2) his wife's Facebook statement was read as "an unusual preemption suggesting awareness that his intelligence community connections would be scrutinized" — it came a week in, answered circulating speculation and **rejected** it; (3) "walked … into the Sandia foothills" / "took a gun" → BCSO: direction unknown; revolver, wallet, holster, backpack **unaccounted for** ("We're not saying he left in them"); (4) "total institutional silence" cut (BCSO pressers, FBI + Kirtland). **Symmetry added:** the 911 call (Law&Crime, 3 Apr; transcripts agree): "some indication that he must have planned not to be found", and the deteriorating-health remark **with her own gloss**. Medical detail from the call kept off the page. **Podesta (PARADIGM, 1 Oct 2026) acknowledged the call for the first time** — "declassifying DOD files and reducing the stigma" — against Grusch's "acclimatization activity" (testimony). **Refused, living-person floor:** Grusch's claims that McCasland ran crash-retrieval programmes and stonewalled Congress. Timing vs the UFO-files post = anti-map. Map marker renamed "Sandia foothills search area" and ctx corrected. Ledger entry on `/retractions`. **Record the outcome if he is found or BCSO closes the case.** *Fresh container trap again: `npm install` before the self-tests — they crash on a missing `express` and print only the Node version.*

**ARC SHIELD v2 — `/tones/shield` REBUILT AS AN HONEST INSTRUMENT, 5 Oct 2026, live.** Author: *"lets drastically improve arc shield"*, then *"cutting edge"*, then *"push it live"*.
- **Why it had to change:** v1's detector called any peak at 100–300 Hz "INFRASONIC WEAPON" (that is mains hum and fridges; infrasound is <20 Hz) and any 2–3.5 kHz peak "LRAD" — it could never read clear. Its "auto-cancel / sweep jam / broadband / pulse counter / counter-frequency" modes **added** sound in the LRAD band; a phone speaker cannot phase-cancel a beam in open air. The guide told crowds to rely on phones ("perimeter", "vehicle", "mesh") — the would-get-a-reader-hurt line. **And `server.js` sent `microphone=()` on every page** — the tool could not open the mic on enforcing browsers (the AI report's §5.9 failure, back again; this clone's history is shallow, so when the exception was lost is unknown).
- **Now:** `site/arc-engine.js` (detector, levels, dose, WAV/ZIP/SHA-256; UMD, runs in Node) + `site/arc-capture-worklet.js` + `site/tones-shield.html`. Room baseline 5 s; a tone must be 14 dB over its neighbours, 8 dB over the room, and persistent; **benign-first classes:** mains, alarm (T3), siren sweep, near-ultrasonic (≥16.5 kHz), loud sustained 1–5 kHz ("LRAD-consistent", always with sirens/horns/alarms as alternatives), low, steady. Status CLEAR / UNUSUAL TONE / LOUD TONE / LOUD / PROTECT YOUR HEARING (mic overload or calibrated ≥100 dBA / <15 min of NIOSH dose). A-weighted level, Leq, max; NIOSH dose only after the user calibrates against a reference meter (localStorage `arc_cal_offset_v2`). **Evidence ZIP:** WAV with 30 s pre-roll, spectrogram PNG, events CSV, manifest (applied mic settings, calibration, GPS), SHA256SUMS, README; AUTO-CAPTURE. SELF-TEST plays tones through the speaker to find the phone's real upper limit. Comfort noise (pink/brown, limiter). Solfeggio/Schumann tones moved out → `/tones/healing`.
- **`server.js`: `microphone=(self)` and `geolocation=(self)` on `/tones/shield` (and `/tones-shield`) only;** every other page keeps both off.
- **Tests:** `node scripts/arc-selftest.js` (16 checks, both directions — quiet room, hum and alarm stay benign; loud tone, 17.4 kHz, siren, overload raised; NIOSH 85/88/100 → 480/240/15 min; ZIP opens). End-to-end: Chromium `--use-file-for-fake-audio-capture` with synthetic WAVs through the real page; evidence ZIP `sha256sum -c` all OK.
- **Guide rewritten** from `research/ARC-SHIELD-FACTS.md` (researcher agent, spider-only, 14 items): LRAD 2000X is **160 dBA continuous / 168 dBC peak**, not 162; ±15° @1 kHz; no tone frequency in any sheet; *Edrei v. Maguire* holding + **$748,000** NYC settlement (deterrent tone banned); Pittsburgh **$72,000**; **Havana removed** from LRAD deployments (ODNI 2023/2025 "very unlikely"); 6,470,214 title corrected; **MEDUSA = WaveBand/Navy SBIR, not DARPA**; three wrong patent attributions removed; **NIOSH: double protection adds only 5–10 dB and is inadequate above 105 dBA** — so distance and cover are the lever (now in tool and guide). Section 6.3 (the author's "ancient acoustic knowledge") kept, except "528 Hz used by biochemists to repair DNA" re-tiered as Rein's unreplicated claim.
- **Left as is:** `cm-engine.js` is an orphan (no page loads it; its `info.arc` i18n key still says "phase cancellation"); the countermeasures drawer's separate "ultrasonic shield" toggle was not reviewed.

**NIKOLAI MUSHEGIAN — XXIV `test-case-nikolai-mushegian-a-post-at-dawn-and-a-finding-of-no-criminal-hand`, 5 Oct 2026, live (XXIV toc 22 → 23, directly after Swartz). `research/MUSHEGIAN.md`.** Author sent r/ethereum yj0gq3 (robots null) and *"similar to aaron swartz"*.
- **Same posture as Swartz, different facts.** Official finding recorded, not adopted: Police Bureau "arrastrado por las corrientes marinas" (El Nuevo Día, 2 Nov 2022); PR Justice Dept "no hubo mano criminal" after ~a year (ENDI, 9 Jan 2024). **The determination itself and the ICF autopsy were not found in public.**
- **No state action against him on paper**, unlike Swartz's prosecution.
- **The post's snowflake decodes to 04:57 AST on 28 Oct, hours before the death.** Unchained's "a few days earlier" is wrong.
- **Its sentence accusing a private person (a former partner) is elided; she/he is never named or characterised.**
- **The method point printed:** his post names Mossad and a Caribbean blackmail ring, i.e. our sponsor hypothesis's ground, so it is **refused as corroboration** (testimony tier, anti-map, unfalsifiable machine).
- VIII's crypto-deaths line now links to the entry.
- **What would move it:** a PR public-records request (DOJ determination, ICF autopsy, police report). None has been made.

Scale line **281 / 1,121 / 141.**

**OUTSIDE AUDIT #3 (5 Oct 2026) — checked; bugs fixed, the rest held.** Author pasted it without an instruction. **Its headline finding — pages disagreeing about the map (1,166 vs 1,172 sites, 455 vs 481 lines) — was a mid-deploy reading on 4 Oct; live was consistent by 5 Oct** (every page 1,166 / 455, cache-busted and not). What held up, and was fixed: (1) **the report's "Last updated" fallback read "August 17, 2026"** for anyone without JS (crawlers, extractors, outside models) — `server.js` `stampUpdated()` now writes the `/api/updated` value into the served HTML on both page paths; (2) **nothing enforced one set of numbers** → `scripts/check-consistency.py` (pipeline step 7b) + `site/data/build.json`; on its first run it found one stale "1,178 sites", which turned out to be the internal `notes` memo in seo-meta.json (excluded, not rewritten); (3) **`/data/retractions.json`** — the ledger as data, ids `C-YYYY-MM-DD-n`, generated by `build-start-pages.py` from the same list as the page; linked from `/retractions`, `/start` downloads and the `/start` footer (with build.json). **Checked and true, held for the author (editorial / his voice):** the AI report still defines "linguistic phreaking" as manipulation "through background AI attacks" and its comparison table says "consistent strategic intent", contradicting its own tier box — the audit suggests making the observed behaviour the base term and listing H1 model bias / H2 context drift / H3 tooling / H4 external manipulation. **Held because it reverses him:** making `/` a portal (he said "just land here" on 4 Oct). **Held as editorial/structural:** splitting the map into research vs `/lab` (Inner-Earth route, colour "wealth signals", tone instruments, countermeasures sit beside the evidence layers), renaming READ THIS FIRST to "Briefing", per-claim ids with revision history, per-section routes (`/report/02-…`).

**`/` OPENS ON THE REPORT — SETTLED, 4 Oct 2026.** For about an hour on 4 Oct, `/` served the briefing (the author picked "Make / the briefing" when asked). He then sent a screenshot of `/report` and wrote *"just land here instead"*. **`/` serves `report.html` again (canonical `/report`); the briefing is back at `/start` (canonical `/start`).** All links are restored to their pre-switch state (the brand, HOME and "← b0b.dev" links go to `/`; READ THIS FIRST goes to `/start`). The briefing keeps its front door (ENTER THE REPORT / OPEN THE MAP / WATCH THE FILMS) and a second copy of the Search Console tag, which is harmless. **Do not move `/` off the report again without the author.** *Trap hit while reverting: a blanket `href="/"`→`href="/start"` swap also caught four links that had always pointed at `/`; I diffed against the pre-switch commit `06e51bd` to restore them. Revert by diff, not by pattern.* Still his, from review #2: tools/X/ETH out of the primary nav, a line above the masthead, a Funding page, domain email, the "facts speak for themselves" wording.

**MAP PASS 2 — HELD ITEMS AND ENDPOINTS, 4 Oct 2026, live.** Author: *"approved on those calls, do the Not done yet bullets"* — read as: delete t1 (White House↔Capitol) and c13 (Indian Creek→Google), apply the held VERITAS deletions, move the flagged endpoints. Script: `research/edge-tiers/pass2.py` (label-matched; dry-run first).
- **Markers deleted (6):** Ionia, Creedmoor, Riverview (Essondale), Topeka State, Kasr El Aini, De Witte Poort — and the four lines on them. **NYSPI stays** (Blauer died there). The Carlisle→Cairo (Sisi) line sat on the Kasr El Aini point and was **moved** to the New Capital, not deleted. **Map 1,172 → 1,166**; edges 462 → 455.
- **Lines deleted besides:** t1, c13, and the Derinkuyu↔Kaymakli tunnel that stopped 8 km short (a correct duplicate already existed).
- **Moved (31 line ends, 2 pins):** CIA lines from NDU → Langley (Tehran, CCF, BCCI); the Jakarta "US Embassy" line → State Dept; **Brunel/MC2 lines were ending on the Concorde obelisk** → MC2 Miami; Channel Tunnel UK end → Folkestone terminal; Gotthard south → Bodio; Bern↔Gotthard → the Gotthard; Metro-2 → MoD Frunzenskaya; General Staff → Znamenka 19; Greenbrier → Capitol; Bude cables → Widemouth Bay; GlobeNet → Boca Raton; Dulce → Sandia National Labs (Albuquerque); Uralvagonzavod → Nizhny Tagil; Lincoln Lab → Lexington; Commerce → Hoover Building; Smithsonian → NMAAHC; Tlatelolco → the plaza; Fisht for 2018; Alibaba → Hangzhou; **Lutnick–Epstein contact line no longer ends at the WTC site** (→ Cantor HQ, 110 E 59th — an office); **c56 is now Philippines–California, AAG cable, tier 3** (Wikipedia, spider-read). **Pins:** Foxconn → the Zhengzhou airport-zone plant (Nominatim); Hezbollah tunnels → the border (was Tyre). Coordinates from Nominatim (identified UA, 1 req/1.2 s) or Wikipedia.
- **Not moved, on purpose:** t13 (Whitehall) — its label names the Trafalgar Square shaft as the trunk end, so the endpoint matches. The Lutnick *marker* stays at the WTC: its ctx is the documented 9/11 loss.
- Ledger entry on `/retractions`; scale line "1,166 plotted sites".

**MAP EDGE TIERS APPLIED — 4 Oct 2026, live. `research/edge-tiers/` (brief, 8 verdict files, `apply.py`).** All **481 lines** (401 connection / 61 tunnel / 19 animal-network) were graded by 8 agents; 6 had to be relaunched after the first run died at the session reconnect. **Result: 19 deleted, 440 relabelled, 462 tiered** — T0 103, T1 134, T2 37, T3 178, T4 8, T5 2. The rendered connection layer is now **402**: 85/111/37/159/8/2 by tier; "3+" shows 169.
- **Deletes:** the three Vivex/Taylor lines (their marker went on 2 Oct); Epstein Island→Indian Creek, Peter Island "DeVos", Buck Island→Page, the Prince→McLean "corridor", Kroenke→CFR and Dolan→Blazer (all living-person floor); the Tulsa Fed/Standard Oil/Kuhn Loeb chains; Calabasas→Donaghy; De Beers→British Museum; Paris Catacombs↔Channel Tunnel.
- **T5 (2) and T4 (8), all checked by me:** Jekyll→Fed Act (the Fed's own history); CIA→Tehran 1953 (the CIA's own history); Gelli→Ambrosiano and Gelli→Bologna (court findings; Gelli is dead); six standing military command relationships.
- **NOT done, recorded for the next pass:** endpoint coordinate errors the agents found are flagged, not moved (CIA lines starting at NDU rather than Langley, MC2 lines pointing at Paris, Channel Tunnel UK end mid-Channel, Gotthard ~8 km off, the Foxconn pin ~30 km off, Kaymakli, the Trafalgar/MoD end, a Pacific cable landing on Long Island).
- **Author's calls:** the four MKUltra-hospital lines (Creedmoor, Riverview, Ionia, Topeka) stay at low tiers pending his decision on those markers; t1 White House↔Capitol is relabelled as rumour (deletable); c13 Indian Creek→Google HQ is T0 (deletable).

**OUTSIDE REVIEW #2 — items a–e done, 4 Oct 2026.** Author: *"make updates and push"*, after a second third-party review. Only the items needing no new decisions from him were done:
- **(a)** The ledger is renamed "Corrections & Retractions" (the URL stays `/retractions`); nav labels read CORRECTIONS.
- **(b)** Titles lead with "b0b.dev", and descriptions sell the method. **Cyan Worlds' cancelled Myst prototype "Project Anglerfish" (revealed 26 July 2026) now owns that search phrase.** The concordance title was shortened to 60 chars, so **seo-selftest is 55/55 for the first time.**
- **(c)** The report's "built to the standard of intelligence analysis" now names the practices it applies. "Every edge … traceable to a source document" is now true by construction: every line carries a tier.
- **(d)** **`/map/list`** (`site/map-list.html`) lists every marker by section and every edge, strongest tier first. It is linked from the map header (☰ TEXT), `/start` and the nav.
- **(e)** **`/about`** covers method and governance: who keeps it, the crawler rules, AI assistance disclosed, the practices, the standing rules and how a correction is decided.
- Both new pages come from `scripts/build-start-pages.py`, with routes in server.js, apply-seo-meta URLS and seo-meta.json.

**NOT done — the author's decisions:**
- making `/` the briefing (it reverses his 19 Sept instruction);
- moving tools/X/ETH out of the primary nav (it reverses "as tools in menu");
- a plain line above the masthead;
- a Funding & Independence page (facts needed);
- domain email (needs mail setup);
- rewording "the facts speak for themselves" and the call to action (his voice).

**FLAGGED, not edited (resolved 27 Oct 2026, see the top of §7):** the report says in three places (X conflict box, XXV) that Claude-assisted drafting continues "through" 1 Sept 2026 and then moves to open-source models. **It has continued past that date** (all of this session). The text is his declaration, so it is held for his wording. `/about` states the October 2026 position factually.

**CURRENT-EVENTS SOURCE REGISTRY — 4 Oct 2026.** Author: *"add to current events source pulls: https://www.osint613.com/"*, then *"https://x.com/Osint613"*. **Read `research/sources/CURRENT-EVENTS-SOURCES.md` before every sweep.**
- **osint613.com is a lead only.** It is a live headline feed, weighted to Israel, Iran and the Gulf, and it carries **no source links per item**. Each headline must be found at a named outlet before use, and paired with coverage from the other parties (symmetry).
- **x.com/Osint613 is refused by robots** and is a recorded null. It reaches the page only if the author pastes a post.

**OUTSIDE REVIEW ACTED ON, ITEMS 1-5 — 4 Oct 2026.** The author pasted a third-party review and said *"please do 1-5"*. Every point was checked against the page before acting (§5).
- **(1) Report.**
  - The rung-4 conclusion now rests on the positive record. Section I says its service-file silence is "counted neither as an acquittal nor as a confirmation".
  - II's "deniable asset is the category defined by the absence of one: the deniability *is* the missing paperwork" broke our own guaranteed-null rule. It is rewritten: the absence weighs nothing either way, and the pattern of institutional non-action is what counts.
  - **New competing-hypotheses block** in II `ii-the-conclusion-in-one-place-…`:
    - A, deniable asset;
    - B, wealth and legal leverage alone (the 2020 OPR "poor judgment" finding printed in its favour);
    - C, several protections with no single design — **stated as the rival the conclusion has most trouble excluding**;
    - D, selection.
    It also gives falsifiers (2007 immunity traced to ordinary negotiation in the contemporaneous files; Black's payments explained by scale; a complete service-file release showing nothing) and says the conclusion **rises only on a document**.
  - **Found on the way:** "a fortune with no identifiable clients" ×2 and "clientless fortune" ×2 contradicted the page's own Wexner/Black ($158-170M) record. Now "two documented clients … on a scale nobody has explained".
  - **Do not re-add the missing-paperwork argument or the clientless wording.**
- **(2) Map edge tiers.** Every line is tiered 0 analogy / 1 correlation / 2 contact / 3 material / 4 coordination / 5 causation. Rendering: dotted 0-1, dashed 2, solid 3+. A tooltip prefix "T3 material · …" and a "Line tier" filter were added; untiered lines count as 0. The audit is by 8 agents, brief in scratchpad `edges/BRIEF.md`, applied by `edges/apply.py`.
- **(3) `/start` "Read this first"** (`/` stays on the report):
  - what we know / think / don't know / what would change our minds;
  - the rules;
  - the edge scale;
  - downloads: `/data/map-data.json` (markers + edges + tiers) and `/data/sources-ledger.json`. The ledger **withholds DOJ Epstein-library and jmail rows** (stop-rule documents) and says so in the file.
- **(4) `/retractions`.** 20 dated corrections plus "tested and not adopted". **Living-person map fixes are summarised, not itemised.** **PROMIS is NOT on the refused list, because the page still holds it as labeled.**
- **Generator.** Both pages and both data files come from **`scripts/build-start-pages.py`**. Re-run it after map or ledger changes, then `apply-seo-meta.js`. Routes are wired in `server.js` PAGES + CANONICAL_PATHS, `apply-seo-meta.js` URLS and `seo-meta.json`. Links are in the report sidebar, report top nav and home nav.
- **(5) AI report.** A tier box was added: documented (outputs, defects, outage) / testimony (the author's experience) / hypothesis (background process — not established). It names the competing explanation, including that CLAUDE.md §5.3 records "linguistic phreaking" as the model's own failure mode. Five overclaims were re-tiered ("this document proves it", "designed to be self-concealing", "not random error", "directional manipulation", "the precision of the gate is itself the pattern"). **Its title still says "fifteen documented AI attack vectors" — the author's naming, left as is.**
- **Also, at the author's request mid-task:** BASTION (`bastion.quest`, an open-source local sensor that runs alongside Microsoft Defender) and FARADAY (`faraday.cam`, E2E anonymous calls) were added as tools in the report sidebar, report top nav and home nav.

Scale line **280 / 1,117 / 140.**

**SIR AARON BUSHNELL — AL JAZEERA REPORT LINKED, NOT REHOSTED — 3 Oct 2026, live.** Author asked to download Al Jazeera's 1:50 NewsFeed clip (26 Feb 2024, Brightcove id 6347679575112) as an MP4, and to place it in the report. **Not downloaded and not rehosted.** It is Al Jazeera's copyrighted work, and the site rehosts nothing it has no licence for. Embedding Brightcove would also need a CSP edit. The clip was never opened (stop rule a: Wikipedia records the act as livestreamed). Instead, Section I's Bushnell record links the report at its source. The same edit fixed "died … outside the Israeli Embassy": he was declared dead in hospital that evening (Wikipedia; Al Jazeera "died in hospital from his injuries"). **Open for the author:** a click-to-play Brightcove embed is possible with `players.brightcove.net` added to `frameSrc`; whether death footage is embedded in the report is his call.

**AUTOWARCOM AND PROJECT MERIDIAN — X `x-the-study-and-the-sellers-autonomous-warfare-command-and-project-meridian`, 2 Oct 2026, live (X toc 25 → 26).** Author dropped `x.com/DoWCTO/status/2106050812464021930` as "current news". **X refuses the spider by robots, and so does `publish.twitter.com/oembed`. Recorded as nulls; the post was never read.** Its snowflake id decodes to 2 Oct 2026 15:56 UTC. The CTO-account quote on the page ("From under the earth to beyond the moon…") is a different, earlier post, quoted by Snopes on 1 Oct. **Do not present it as the post the author linked.** The subject is the 30 Sept Quantico "State of the Force" address, which our 1 Oct sweep missed entirely (AUTOWARCOM 0, Meridian 0, Luckey 0, Gingrich 0).
- **Documented:** the command is announced, not established; the Agincourt memo targets 1 Oct 2027; no commander has been named; the Senate's version is in a pending FY2027 bill. DAWG asked for up to $54.6bn in FY2027 against $225.9m in FY2026 (DefenseScoop). This is a request inside the $1.5tn ask, $350bn of which is reconciliation; the $1bn/$53.6bn base/reconciliation split seen in search results was **not verified** and is not on the page.
- **Meridian:** the memo names only CTO Emil Michael. Musk, Luckey and Gingrich were named from the stage. Findings are due 28 Jan 2027, unclassified plus a classified annex.
- **Keepable finding:** Stars and Stripes: "Both hold multibillion-dollar defense contracts". It is printed as structure, not intent, with a **forward test**: score the unclassified report's recommendations against the co-leads' catalogues. The annex is a guaranteed null. **Record the 28 Jan 2027 outcome either way.**
- **Nulls:** the memo PDF at media.defense.gov (403), the war.gov transcript (403), The Hill (403), mixed-news (403), insidedefense (robots). **All 25 quotes were re-read in the spider cache with `vq.py`.**
- **Unpublished, same sources:** the DoD HR breach of ~3 million personnel (FP, 1 Oct); the Flydubai hijack attempt; the "super intelligence" rename at UNGA.

Scale line **280 / 1,115 / 140.**

**VERITAS — EVERY MAP MARKER AUDITED, 2 Oct 2026, live. `research/VERITAS-MAP-AUDIT.md`, verdicts in `research/veritas/`.** Author: *"all markers, require utmost accuracy - scan every marker on map and ensure this VERITAS."* Ten agents, one verdict per marker (ok 208 / imprecise 421 / fix 363 / rule 81 / unverified 79 / editorial 22), sources read via the spider. **839 edits applied; 176 pins moved; 91 line endpoints moved with them (label-matched only — coordinate-only matching hit the wrong markers on shared city centres); 2 deleted under the living-person floor (#329 Vivex/"Timothy Taylor", #522 "Sea Change"); map 1,174 → 1,172** (seo-meta, KML link, scale line, KML, intro-points, listen-places rebuilt). Worst classes found: living people with outcomes missing (Warner "convicted" — never; Kraft "trafficking"; Ramaphosa without Farlam; Bouvier/Sotheby's without dismissal/settlement/verdict; Welch & Johnson without acquittal; True without dismissal); misquotes (Brabeck "water is not a human right"; Braden); anti-map chains; banned edit notes surviving in ~20 ctx fields; house numbers; numerology (2001 monolith); wrong pins by 100–400 km. **Report fixed in the same deploy: the cobalt belt is the southern Copperbelt (Lualaba/Haut-Katanga), NOT Eastern Congo** (XIV, XV conflict list, XV resource bullet, xref); "as young as 6" → Amnesty's seven; DOL list "159/78" → 204 goods / 82 countries (2024). **Not done:** the 420 line/tunnel labels (anti-map chains live there — next pass); 65 unverified markers unchanged; **27 held for the author** (listed in the audit file: the misplaced Kivu "cobalt" marker, 5 MKUltra hospital markers + De Witte Poort proposed for deletion, Nauru/Göbekli duplicates, MS perpetrator/defendant naming incl. a juvenile, small type/pin calls). *Trap: a verdict agent proposed dropping "Anthropic" from the Project Rainier marker because it could not read a source — NOT applied.*

**SECTION I QUOTE CORRECTED BY THE AUTHOR — 2 Oct 2026, live.** His words now read *"The interesting correlations place me to intercept key targets - see - no weapon formed against, I am useful."* (was "targeted individuals"). The gloss that followed — a sentence reading his words as the "targeted individual" population (shielding-fabric sellers etc.) — misread the corrected quote and was removed; the function line is now "the correlations are what put him in position", and the next paragraph's "one more predator in that room" lost "in that room". **"Key targets" is not glossed** — no reading of who or what they are was added, and none should be.

**ERC-1155 = CIPHER FOR THX-1138, NOW STATED IN SECTION I TOO — 2 Oct 2026, live.** Author, quoting the Section I line ("named for the Ethereum multi-token standard … several kinds of thing at once"): *"is also a cipher for THX-1138"*. **It was already on the page** — XXV `xxiv-prior-conveyance-erc-1155-cipher-thx-1138` declares it — but Section I's testimony subsection gave only the token-standard reading. One sentence added there, as the author's declaration, linked to the XXV entry. **No digit reading** (§2 no-numerology applies to his own names): the cipher is recorded as declared, the numbers are not interpreted.

**SHINYHUNTERS OUTCOME + CURRENT EVENTS SWEEP 26 SEPT–1 OCT 2026 — live 1 Oct.** Author: *"check shinyhunters
outcome and update"*, *"Do current events sweep"*. Same method as 26 Sept (two agents, day pages → named outlets via the
spider, **every quote re-checked by me in the spider cache** with scratchpad `vq.py` — strips zero-width characters, which
syndicated Reuters copies embed and which make a real quote "miss"). **ShinyHunters (XVI entry, now in XXIV):** deadline
lapsed 29 Sept; **IC3 PSA unchanged** (diffed — *ic3.gov serves a per-request CSP nonce, so every re-fetch hashes as
CHANGED; diff the body*); nothing published; group: "a marketing campaign" … "We stand corrected" (NBC), goals accomplished
(Reuters); site offline 30 Sept, cause unknown; FBI: "the cyber incident involving FBIJobs.gov"; Dutch police hold a
24-year-old arrested **15 Sept** (a week before the claim), unnamed, disowned by the group, not tied to the claim by the
FBI → anti-map. **Closing line: the claim was abandoned, not proved or disproved; non-publication is a guaranteed null.**
**Corrections in place to the 26 Sept update:** "economic D-Day" was the 24 Aug campaign name (Treasury sb0637), not a
threat; "the UAE in the room" → attendance not established; DI Khan 11–16 dead / 30–36 wounded + the ambulance attack,
"no claim established"; Azerbaijan's "categorically unfounded" denial added; CNN added as the "I reject their proposal"
source (**the cited Al Jazeera page was rewritten after 26 Sept and no longer carries the quote**); 22 Sept Greenland:
signed ≠ in force (Art. XII). II Phang: 25 Sept motion to dismiss 26-5334 (captioned with 26-5299). **New XV
`xv-status-update-1-october-2026`**: US answer via Qatar; "I offered them NOTHING"; ~9,000 troops/third carrier (AP);
CENTCOM 125 vessels vs Kpler <80%; three tankers 29 Sept, no attacker; **Treasury sb0637 network across Pakistan/Saudi/
Türkiye + the Mecca Joint Defence Agreement (7 Aug) — page had it 0 — overlap of states printed as not a chain**;
Fairford (attribution + Iran's denial, no names); Iraq withdrawal 30 Sept ("intelligence support" continues); Taiz counts;
Sudan visa now on UN News, UAE's nationwide-embargo call vs A3/China/Pakistan/Russia, regime expires **9 Oct — record**;
Malawi ex-army chief charged (by office only); Af–Pak, Tigray, Ukraine telecoms, Gaza, ICJ null; S.Res. 852 / §502B(c)
47–51; DDF v. DOJ expedited FOIA; War Dept election memo ("foreign" limiter); Norway hearing. **HELD:**
`research/NEWS-2026-10-01-HELD.md`. **Spider:** `hosts.json` gained `ohchr.org` (dead PDF path → homepage, 200, title "UN
Human Rights Office") — so the FFM Iran report is still unread. Scale line **279 / 1,112 / 139.**

**PHONE NARRATION FIXED — 1 Oct 2026, live (`report-tts.js?v=9`, `report-listen.js?v=5`).** Author: *"Narration breaks
on phone same with slides"*. **Three causes, two of them my own 25 Sept code:** (1) **slides on iPhone never spoke** —
`openListen()` called `TTS.play()` inside `ensureData().then()`, after three script loads, so iOS no longer counted the
tap and refused speech; three refusals tripped the stall guard ("speech engine stopped"). Speech now starts
synchronously in the tap, before the loads. (2) **The 25 Sept watchdog judged a line by `speechSynthesis.speaking`** —
Android reports `false` mid-line and sends no boundaries, so every line was cut or talked over after 2.5 s. Now: a line
that never started is *said again* (three misses → pause with the message); on phones a started line is given up only
when overdue (`len/(11·rate)`·1.6 + 4 s) or when its boundaries stop with the engine idle; desktop keeps the 2.5 s
idle path (its `speaking` is truthful); hard cap ×3 + 10 s everywhere. (3) **The 10 s `pause()/resume()` keepalive ran
on Android, where `pause()` cancels the line** → 'interrupted' → retried → repeats and breaks. Keepalive is now
desktop-only (`isMobile` = iOS or `/Android|Mobi/`). Also: a natural advance never calls `cancel()` (Android can still
report speaking inside `onend`); a speak after a cancel waits 150 ms (Android drops a same-tick speak); Android's
`en_GB` lang normalised to `en-GB`; returning to the tab re-says the line if it should have ended while hidden; the
chunker's regex **lookbehind removed** (Safari < 16.4 rejects it at parse time and the whole narrator is lost).
**Proven both ways** with scratchpad `mobiletest.js` (Android mock: speaking false, no boundaries, `pause()` kills;
iOS mock: speech refused unless the first `speak()` runs inside a trusted tap; `OLD=1` serves the deployed files from
`scratchpad/old/`): old iOS slides 0 lines/3 refused/stopped, old Android 1 line then stopped (or 6 mid-line cuts in
30 s with `SPEAKS=1`); new 0 cuts, 0 refusals, 0 repeats in all four. Desktop `audiotest.js` still clean (lost onend
recovers, foreign interrupt retried, dead engine pauses). *Untested on hardware — mocks encode the documented engine
behaviour, not a real phone.* *Pipeline note:* the film pages' `VideoObject.uploadDate` appears to follow the transmissions
feed's last `fetched_at` on every build — churn, not a content change; flagged, unchanged.

**CURRENT EVENTS SCAN, 22–26 SEPT 2026 — live 26 Sept.** Author: *"do current events scan"*. Two agents (world; US
institutions/cyber), day pages + named outlets, every quote re-read by me in the spider cache before it went on the
page. **The scan's biggest finding was our own 22 Sept update:** it said every item was "confirmed against named
outlets" and was not — **the Iran Fact-Finding Mission paragraph printed only the finding against the US and omitted
the same report's crimes-against-humanity finding against Iran's government** (≥221 children, ≥29 executions after
summary trials; Iran's own toll 3,038) — the symmetry rule failing our way; Lamerd is 22 civilians (not 20/100),
Minab "more than 150, about 120 children" (the 157/26/95 figures had no source), CENTCOM's denial is "into the city of
Lamerd", not "near"; Colombia withdrew from the ICJ case on **18 Sept** (22nd = the Court's release); EU renewal sealed
22 Sept, 36 months, list 2,600–3,000 (Euronews/BBC); Greenland **signed 22 Sept**, Narsarsuaq + Mestersvig, non-NATO
bar "unless the signatories agree otherwise", unsourced "permanent basing rights" removed. All fixed in place, no
edit narration; heading now "UN findings against both governments". **New: XV
`xv-status-update-26-september-2026`** (Iran talks → seven-day Hormuz plan → "I reject their proposal"; Senate
rejected H.Con.Res. 89 49–50, roll call 244; the US blockade — page had "blockade" 0 — 115 vessels redirected per
CENTCOM; *Cape Dao* attacker not named; UAE suspended Iranian flights by compliance; France to Yanbu, kept distinct
from UK refuelling; Burhan visa; first Quad–Quintet meeting with the UAE in the room; Pakistan's ten strikes and the
unclaimed DI Khan bombing; Usmanov delisting/Azerbaijan pardon at its tier; UNCTAD Gaza; Palantir $48.1M / TITAN
$127M + Anduril $65M / Anduril $20bn — Anduril was 0; **FISA §702 lapsed 12 June**, collection continuing on
certifications to ~Mar 2027 — 702 was 0). **Ethiopia–Tigray added to the conflict list.** Updated lines: II *Phang v.
Blanche* (16 Sept order, appeal 26-5334, stay denied 21 Sept, **DOJ Answer ¶29: "no files were withheld or redacted
on that basis" — national defense/foreign policy**), II discharge petition (216 formal, 218 committed, House out to
~9 Nov), IV estate settlement (prelim. approval 3 Mar 2026, final hearing 2 Dec 2026), Nord Stream (trial 14 Oct;
second extradition approved 18 Sept), **ShinyHunters status: FBI "point of breach is still undetermined"; Mandiant ties
the wave to the known CVE-2026-35273 via a WAF bypass; deadline ~29 Sept — record the outcome.** **HELD, in
`research/NEWS-2026-09-26-HELD.md`:** the reported federal investigation of the estate's co-executors (anonymous
sourcing, living and uncharged), a new co-executor class action, BlackCore (Citizen Lab; belongs with the held XXIV
draft, private firm ≠ state), the OpenAI/Medicare item, the DOJ §2 "politically exposed persons" list (never a
roster), the Krušik discrepancy, and the draft's war-powers count (likely 17 → 18). **Aggregator errors caught:**
Wikipedia attributed the DI Khan bombing (no claim), dated Trump's rejection a day early, and invented "21 ENDF
airstrikes". Nulls: Reuters (robots), AP/Sudan Tribune/OHCHR/CNBC/Forbes/The Hill/Cybernews (403). **Scale line
278 / 1,094 / 137.**

**LISTEN MODE — rebuilt 25 Sept 2026 after "not using the correct images … lingers far too long … should have video …
think pacing, cuts, edits, and correct information"; live.** The narrator (`report-tts.js?v=8`) emits `b0b-tts` events
(`chunk`, `boundary`, `state`, `ready`) and exposes `window.__b0bTTS`; its player and voice picker sit at
`--b0b-signal-h + 48px` (above the countermeasures drawer), every device voice is listed (English auto-pick),
diagnostics only with `?ttsdebug=1`. **The editor is `site/listen-plan.js`** (browser + Node): each spoken line → a cut
list anchored to character positions; `site/report-listen.js?v=4` plays it against the voice (word boundaries when the
engine sends them, otherwise a speaking rate measured line by line). **Rules, in code:** (1) **no filler pool** — a
picture or clip appears only when the line names its subject, via hand-curated triggers in
`scripts/listen-media-keys.json`; the first version drew "ambient" pictures and matched loose words (Bank → BIS tower
×67, Washington → 1963 march ×37, Article, Reading), which is the wrong-images defect; (2) otherwise the shot is built
from the line itself: its phrase set as type (verbatim, context phrase above), figures counted up and **labelled with the
clause they sit in**, dates/timelines labelled with **the clause each date belongs to** (a bracketed date belongs to the
words before it — the v1 card read "1973 → Camp David Accords"), quotations with their verbatim lead-in, the report's
own arrow chains, lists lit item by item, **tier stamps only for verdicts** ("is documented", "NOT ESTABLISHED",
"(attributed)", never the adjective); (3) places fly in on **Esri World Imagery** (same tiles and credit as /map; CSP
already admits them) — **residences, private islands, enclaves get zoom 0 (dot map only)**, house numbers and people's
names stripped from pin labels, "Place - topic" qualifiers (Egypt, Qatar, Burbank, Cambridge) no longer pin one topical
marker, and a line that flies to a site doesn't cut away to a generic institution photo; (4) faces only for the named
dead; a bare surname is guarded ("Mark Epstein" ≠ Jeffrey; "JFK" airport ≠ Kennedy; "NSA" as National Security Advisor
≠ the agency); per-portrait cooldowns (Epstein booking photo 240 s). **Audit before shipping a trigger:**
`node scripts/listen-storyboard.js <chunks.json> <outdir>` runs the planner over all 14,245 chunks (~22 h of speech) and
writes `storyboard.txt`, `stats.txt` and **`triggers.txt` (every line that brings each picture on screen — read it)**;
the chunks dump comes from a Playwright pass over `__b0bTTS.blocks` (scratchpad `dumpchunks.js`). Current: median shot
2.3 s, p99 5.3 s, ~23 cuts/min. Media (191 items, 55 clips, 24 MB): `scripts/build-listen-media.py` (film specs + curated keys + the
listen sourcing manifest, scratchpad `listen-media-sourcing.json`, masters in `/home/user/.b0b-intro-sources/listen/`)
→ `site/img/listen/` incl. **muted 640×360 clips, never longer than the vetted window** (a film's own shot, or the
sourcing pass's face-checked in-point; frame-capped — `-t` alone let one source run 0.5 s long into unchecked footage).
**Every clip's first/middle/last frame was reviewed; dropped:** ivy_1 (two unnamed crewmen full-face), the Nevada
observers, a Suez profile, a 1920 travelogue intertitle, and the Iran-Contra hearing wide, Occupy 2011 and the 1967
peace march (identifiable, possibly living). **Excluded on licence/provenance:** the NordGen seed-vault photo
("Attribution", not CC), a Laurel Lodge photo sourced to CNN, a 1944 Navy St Peter's film (licence unread). Kept at
their stated licence: GCHQ aerial (OGL v1.0), Area 51 / Dimona (US government, second-hand copies noted);
`scripts/build-listen-places.py` → `site/listen-places.js` (mass-shooting markers excluded). **TRAPS:** the dev server
rate-limits at 60/min — route `/img/listen/` from disk in Playwright; satellite tiles through the sandbox browser proxy
take ~6 s each (curl 0.25 s) — route them via `execFile('curl')` in tests; a canvas fly-in that draws the next zoom
level at 1/8 scale "to warm it" fetched 5,850 tiles — prefetch the 3×5 around the pin instead. **AUDIO FAULTS FIXED 25 Sept ("music player starts
playing or the narration cuts out outright"):** (1) `soundtrack.js?v=3` ducked by polling `speechSynthesis.speaking`,
which reads the gap between two lines as "done" and restarted the music; it now follows the narrator's `b0b-tts`
state events (music back only 1.5 s after a pause/finish) and listen mode holds it via `__b0bSoundtrackHold`;
(2) the YouTube IFrame API arrives seconds after load and `adopt()` started the music whenever autoplay had been
attempted — mid-narration; it now adopts silently while narrating/held and pauses the player if it starts anyway;
(3) `report-tts.js?v=8`: a browser-side `interrupted` on the current line (another audio source, OS focus) was
treated as our own cancel and left the narrator "playing" in silence — now retried twice; the utterance object is
held (Chromium drops `onend` for a garbage-collected utterance); a 1 s watchdog continues after 2.5 s of an engine
that went quiet, and after three lines that never started it pauses with "The speech engine stopped - press play".
**Proven both ways** with scratchpad `audiotest.js` (mock engine with foreign interrupt / lost onend / dead engine,
stub IFrame API loading 6 s late): old code stops after 2-4 lines and starts YouTube twice mid-narration; new code
reads on with zero plays. *Trap:* Playwright routes — the LAST registered wins; a catch-all registered after a
specific stub silently swallows it, and the test "passes" against both versions. **Flagged, not changed:
the live map carries residence house numbers** ("9 East 71st Street Townhouse", "358 El Brillo Way", "22 Avenue Foch")
against §2's streets-only rule — the author's call. **The XXIV favorite-nation entry is still HELD** in
`research/drafts/xxiv-favorite-nation.html`. Scale line 277 / 1,083 / 135.

**A THIRD FILM, "THE EPSTEIN–MAXWELL RECORD", AT `/epstein-maxwell` — 24 Sept 2026, live.** 4:13, 64 shots; 11.8 MB MP4 / 12.7 MB WebM / 20.2 MB download. Verified: 312 subtitle samples, 0 mismatches, browser never spoke; four clean live reads; scale line 277 / 1,083 / 135. **A Spirit of Justice statue (woman with a child figure) was cut after the first render — it sat under the line about the abuse.** `build-transmissions.py` 404 again 24 Sept (worked 23 Sept: flaky, not broken). Author: *"lets make the
epstein maxwell video"*. **Author's two calls, asked before any script (this is defamation-adjacent, so they were his):
the conclusion AND the sponsor hypothesis go in at their tiers ("Both, at their tiers"), and people are named only for
acts on paper ("Names where on paper").** Spec `scripts/film-epstein-maxwell.json` (generator in scratchpad
`make-em-spec.py`); outputs `site/epstein-maxwell-reel.{mp4,webm,js}`, `site/b0b-epstein-maxwell-film.mp4`; 4:13, nine
parts: the father, the year (1991), the complaint (1996), the deal, the pipe, the cell, the survivor, the question, the
dates on paper (timeline). **Hard rules in picture and word:** no survivor named or shown; no living uncharged face
(the 2011 House hearing-room clip was CUT because its members are identifiable; three ERC-1155 flash frames with faces,
one a young woman's, were swapped out — a face flashed inside a trafficking film reads as implication whatever the
intent); nothing from EFTA/exhibits/evidence opened; no residences; the NPA quoted from the **OPR summary**, which counts
"four named co-conspirators" without naming them. Faces: Robert Maxwell (1989 Anefo, CC0) and Epstein (2006 PBSO
booking photo, PD-Florida) only. **Fact-check (scratchpad `film3-facts.md`) reworded 12 of 20 claims** and found two
errors ON THE PAGE, fixed: **"the body was identified by his brother" is not established** (one outlet: he *claimed*
it) and **Baden was retained by the family (AP)** — the survival paragraph now rests on the autopsy observed by the
family's pathologist. Other corrections that travel: Ghislaine's move to New York is "1991", no month (so the "eleven
months" framing is not used in the film); **the 1996 FBI complaint record (stamped 3 Sept 1996, released Dec 2025) is
documented, the NYPD Sixth Precinct report is her account** — the page still calls the NYPD complaint the "earliest hard
anchor"; **put to the author, unanswered**; JPMorgan's ~$1.3bn was reported only after the 2019 arrest (Wyden's $1.1bn is a
different count); "in the United States" only Epstein and Maxwell charged (Brunel was charged in France); OIG quoted as
"did not uncover evidence contradicting the FBI's determination regarding the absence of criminality". **Also on the page,
at the author's instruction ("note that tactical and sophisticated exfiltration methods exist"):** exfiltration is
documented state practice (Tehran 1980, CIA, declassified 1997; Gordievsky 1985, MI6; WITSEC ~19,000 since 1971) —
**capability is not use**, and the symmetry rule was run both ways: unlike the Maxwell inquest, an exfiltration does not
produce an autopsy observed by the family's own pathologist and a family arguing murder, so survival stays possible, not
supported. **And a stale Section II framework sentence was fixed:** it still said only Epstein was placed at rung 4 and
"no sponsoring service is named anywhere in this document" — now both principals at rung 4, sponsor at hypothesis tier.
**Engine:** grid tags now wrap within their cell (separator, then word) so a CC BY credit is never cut; intro JS still
byte-identical. **Spider:** `decoy_markers` (body-prefix match) added for justice.gov's Akamai `bm-verify` interstitial
(200, ~2.5 KB, blank title, size varies) — registered, never solved.

**A SECOND FILM, "CONTINUITY", AT `/continuity` — 23 Sept 2026, live. The intro is untouched.** **3:30, 75 shots, 69 media; 13.7 MB MP4 / 15.3 MB WebM / 22.7 MB subtitled download; render ~25 min.** Verified: full playback 254 subtitle samples, 0 mismatches, browser never spoke; intro re-run 179/0; four clean live reads; seo-selftest 49/50 (the old concordance title). Author: *"make another
video - this one about continuity of power, the elites, and pattern points that correlate"*, then *"keep the first one,
just make another one"*. **Same engine, own spec:** `python3 scripts/build-intro-collage.py --spec
scripts/film-continuity.json` writes `site/continuity-reel.{mp4,webm,js}`, `site/continuity-poster.jpg` and the
subtitled download `site/b0b-continuity-film.mp4`; build dir `_build/continuity`. **The intro's `intro-reel.js`
was regenerated byte-identical after the engine change — check that again after any engine edit.** Engine gained:
`doc` shots (typed verbatim quotation or dated ledger, citation burned in), `archive` lines (the film's own
sound instead of the narrator — built, unused: no provenance-clean farewell-address film was found), a
`timeline` finale (the film's dated points on one axis; dashed arcs drawn while she says they correlate,
dissolved on "a shared timeline is not a chain"), and `--spec`. **Player:** `intro.js` reads `window.B0B_FILM`
(sources, poster, download, share URL, end line) from the generated reel file; the intro sets none, so its
defaults are unchanged. `intro.js?v=8` everywhere. **Argument = the report's own:** VII's apex clause (the top is
rules, not a person; Vanguard owned by its funds, quoted), IX's COG directive line (PPD-40 text not released),
XVI's clocks and the §3510 voucher, Lockheed older than the CIA, Bretton Woods Resolution V "put aside" by 1948.
Refrain "the X ended; the Y did not" — then refused as a chain. **The bloodline answer is named and refused in
part VIII, as Section VII does; the killed trope passages are not re-added in any form.** **Fact-check changed
nine lines** (session scratchpad `film2-facts.md`): EIC war/coin powers were Charles II's ("in time it won");
Walther Funk's BIS seat is secondary-only → cut; AUMF "sixty words" is only §2(a) → "a single sentence";
Proclamation 7463 continued 8 Sept 2026, 91 FR 57773; Iraq AUMFs repealed in the FY2026 NDAA, 18 Dec 2025;
Bernhard gave up military posts and the Bilderberg chair, 1976; Lockheed SIPRI #1, $64.7bn (2024 data).
**Pictures, living-person floor:** refused two Bernhard portraits (photographer living, museum CC0 unexplained), a
Kissinger portrait (LoC gift terms unread), a Rockefeller/Burns still (partial third face), an Israeli/US F-35
formation (reads as a statement), the Nuremberg dock still. The "figure" in the empty Security Council chamber is
a draped camera. Media in `/home/user/.b0b-intro-sources/v3/` (manifest: scratchpad `film2-media.json`).
**Spider:** `hosts.json` gained two decoy-200s — `federalregister.gov` HTML/text pages ("Request Access", 10,596
bytes; use the API or govinfo PDF) and govinfo's `/error` page. *Traps:* the Plex latin subset has no ✓ either;
`dict.get(k, default)` evaluates the default eagerly (`fin['year']` KeyError); Wikimedia 429'd the sourcing
agent for ~35 min and upload.wikimedia.org stayed blocked.

**GAZA ENTERS XV ON THE COURT RECORD; ARCHIVEGENOCIDE.COM CITED AS A METHOD SPECIMEN — 23 Sept 2026, live.**
Author dropped `https://archivegenocide.com/nodes/`, then chose **"xv"** of three placements. New subsection
**`xv-gaza-what-the-courts-have-said-and-an-archive-that-grades-its-own-footage`** (before XV's structural close;
XV has no static toc). Page had Gaza 8 / ICJ-Gaza 0 / ICC 1 before this. **Documented:** ICJ *South Africa v.
Israel* (case 192) from the Court's own **HTML docket** — instituted 29 Dec 2023; provisional-measures orders
26 Jan, 28 Mar, 24 May 2024; Counter-Memorial extensions 14 Apr and 20 Oct 2025; **21 May 2026 order fixing a Reply
and Rejoinder**; 2026 interventions by Paraguay, Netherlands, Iceland, Namibia, **the United States**, Hungary, Fiji;
**Colombia withdrew 22 Sept 2026**. ICC PTC I, 21 Nov 2024, read in full via the UN UNISPAL mirror: warrants for
Netanyahu and Gallant (starvation; murder, persecution, other inhumane acts; civilian-superior liability, two
incidents) **and the symmetry line in the Chamber's own words — it "could not determine that all elements of the
crime against humanity of extermination were met."** Threshold stated (art. 58 "reasonable grounds", below
confirmation and conviction). **Nulls, ledgered:** every ICJ PDF, icc-cpi.int, OHCHR and Times of Israel refused
the crawler — so the post-2024 ICC appeal history is **attributed**, and no state's intervention is characterised.
**The archive:** anonymous, advocacy-framed ("genocide" carried as its word), self-reported ICC/Hind Rajab/ICJ
submission unverified; counts attributed (87,503 events / 131,620 clips, a declared beta). **Why it is on the page:
its method is the report's** — deterministic merges only, dashed "possible" links ("a lead … never a finding"), A–E
corroboration, and **a published list of the casualty figures it rejected**. **Hard rules written into the entry:**
no individual from its named-"perpetrators" class appears at any tier; the method pages are linked, **the footage
and torrents are not**, and **no footage was opened** (stop rule a). Research note `research/ARCHIVE-GENOCIDE.md`.
**Scale line 277 / 1,083 / 134.**

**THE NARRATION IS BAKED INTO THE FILM, AND THE FILM DOWNLOADS — 23 Sept 2026, live.** Author: *"can we make the
video downloadable"*, then *"can you bake in narration"*. The first alone would have shipped a file with no voice,
no words and no ending — the narration was the browser's, the subtitles were page overlays, the map finale was a
canvas. **Now all three are in the file.** Voice: **Piper `en_GB-cori-high`** (UK English female; model card:
trained on **LibriVox, public domain**; alba is CC BY, southern_english_female CC BY-SA, jenny's licence unclear —
cori was the clean choice). Model (114 MB, sha256 `470b4dd6…0a5903`) lives in `/home/user/.b0b-intro-sources/voice/`,
lines cached by hash in `voice/cache/`. `build-intro-collage.py` now: synthesises every line (silence-trimmed,
resampled to 48 kHz by ffmpeg), **sizes each part to her reading** (shots stretched evenly, flashes untouched),
ducks bed and archive sound to 28% under her, **renders the finale into the video** (the site's own markers drawn
as the world, then τετέλεσται in DejaVu Serif — Plex has no Greek), and writes **two masters in one pass**: the
web cut (subtitles stay HTML, so phones can read them below the picture) and **`site/b0b-intro-film.mp4`,
subtitles burned in**, for download. Film **2:38**. `intro-reel.js` carries `B0B_INTRO_BAKED` and the **exact time
of every line**; in baked mode `intro.js` never touches `speechSynthesis`, plays at volume 1, shows each line by
its timestamp, and goes to the end card on `ended`. Download: a button on the end card, a link on the start card,
one on `/intro`; `VideoObject.contentUrl` points at the download. **TRAPS:** the phonemiser reads **"1945" as
"nineteen hundred and forty-five"** — every year goes to the voice as words (`say`); **raw phonemes work in
`[[ … ]]`** and are how the closing word is said (`tɛtɛlˈɛstaɪ`, stress on the third syllable), but a phoneme
block swallows the pause after it, so `say` may be a **list of segments** joined with 0.5 s of silence. Speech-only
rate ~2.7 words/s at length_scale 0.97; a naive duration including leading/trailing silence reads ~1.6 and is wrong.

**THE INTRO IS NOW A COLLAGE CUT, THEN AGAINST NOW — 23 Sept 2026, live. Supersedes the 22 Sept three-minute
cut below (its card/share machinery is unchanged; its live-speech voice was replaced the same day by the baked narration above).** Author: *"make the intro a
slide show video / photo collage - make the editing faster paced with more contemporary footage and faces mixed in
with old footage. do motion graphics stylings if needed"*, then *"you can use my videos on youtube.com/@erc-1155 as
well as source files if needed … in conjunction with your finds"*. **`scripts/build-intro-collage.py` composes every
frame itself** (numpy + Pillow → ffv1 master → H.264 + VP9): split screens (then | now, amber seam, year plates), face
grids, pushes/pans/slams on stills, glitch cuts, part cards (numeral, drawn rule, typed title, year ticker old → new,
a filmstrip of the part's own footage), and **the source tag burned into every panel** — so in collage mode intro.js
adds `bi-collage` and the HTML source line and chapter card stand down during the film (they return for the map).
Spec: **`scripts/intro-collage.json`, generated** (the generator lives in the session scratchpad; edit the JSON by
hand now). 16:9 1280×720, 81 shots, **121 s of film + the map = 2:25**, 12.1 MB MP4 / 13.6 MB WebM, render ~7 min.
`--sheet` makes a one-frame-per-shot contact sheet; `--still T` one frame; `--js-only` rewrites intro-reel.js.
**Media (73):** the seven v1 archive masters, 50 of 61 items from a licence-checked sourcing pass (PD, CC0, CC BY only;
licence read from the source's own metadata; **every CC BY tag carries the author credit on screen**), and 8 frames
from the author's ERC-1155 films, tagged *"THE AUTHOR'S OWN FILM"*. Masters live in `/home/user/.b0b-intro-sources/`
(`v2/`, `erc/`) with sha256 in the spec; `B0B_MEDIA_DIR` overrides. **Living-person floor applied to picture
selection — in a montage, juxtaposition is implication:** faces are the dead in documented public acts (Jackson,
Hoover, McCarthy, Cohn, Oppenheimer, Eisenhower, Dulles, JFK, Stevenson, Powell, Feinstein, Swartz, Nixon, Church,
Carter, Reagan, MLK…) or crowds. **Refused:** Bush and Rumsfeld watching Powell's address (reads as a claim about
what Bush knew) and a 2012 SSCI still with identifiable living witnesses. **Sound:** archive films' own sound where a
film is on screen, over a bed synthesised in the script (drone, cut tick, card hit); nothing licensed. **Narration
tightened to ~40 words a part** and re-checked: CORONA first recovery Aug 1960, declassified Feb 1995; Stevenson
(1962) and Powell (2003) both before the UN Security Council; no Iraqi stockpiles found. Part durations are sized to
her reading (2.6 words/s at rate 0.96), so **in the full-length test the picture never had to hold**: every part's
first line began within 0.02 s of its cut, with the video response held 3.5 s. **TRAPS:** (1) **YouTube returns 403 to
this environment even via yt-dlp and Vimeo refuses it** — only `i.ytimg.com` thumbnails come through; real footage
from the author's films needs his source files. Refusal recorded, not worked around. (2) **The Plex latin subset has
no arrow glyph** — "→" rendered as tofu on the cards; the arrow is drawn. (3) Wikimedia rate-limited the sourcing
agent (429) partway; several stills are Commons *thumbnails* (960–3840 px), noted per entry. (4) Run as root,
`~` is `/root` — media_dir is absolute. `/intro` lists all 73 sources with links; share card regenerated from the
new cut; `VideoObject` duration PT2M25S. **Do not run the old `scripts/build-intro-reel.py`** — it writes the same
output files and would silently put the 4:3 cut back under a 16:9 player.

**THE OFF-TRACK RESTRUCTURE — 23 Sept 2026, live. NEW SECTION XXIV "TEST CASES"; THE SIGNAL IS NOW XXV.**
Author: *"look for removal of sections like this that go off track"* → every candidate read in full, then *"find
out where these DO go if at all"*, *"keep asset relocation as that is a real thing"*, and the choices **"New XXIV,
Signal → XXV"** and **"Test Cases"**. **XXIV. Test Cases - Live Claims Graded Against the Record** (22 parts, in
order): Swartz; the wanted-list question; ShinyHunters; the twelve-part 9/11 topology; the access-and-exit
module from XX (intro, ladder, Calabasas, Dr. Sebi, standing test); the Severed Chain; the Institutional
Silence. **Moved:** Gulag geography IX → XIV (state forced labour); the seed-vault piece XIV → VII, **rewritten,
because it was wrong** — Norway's own site: *"The Government of Norway established and fully funded"* the
vault; Norway owns it, NordGen runs it, the Crop Trust part-funds operations; black-box deposits, *"only that
gene bank can request return"*; ICARDA's 2015-19 withdrawal. "Funded by Monsanto/Syngenta/DuPont … confiscation"
is killed as a naming error (vault + Crop Trust donors + patent-holders merged); what survives is the patent
(*J.E.M. v. Pioneer* 2001, *Bowman v. Monsanto* 2013). The Gates "one owner, three control surfaces" bullets and
"primary funder of the vault" (X, XX, IX) went with it. **Removed whole, do not re-add:** Point Nemo (XIII — anti-map
coincidence chain: R'lyeh, Nash's "Emperor of Antarctica"), the Netherlands courtroom (XVI — it called "families
who own the central banks" *"what this report documents"*, i.e. the killed §7 trope), the DEW/FLIR claim and the
Morris Worm lineage (XVI — both on one anonymous LinkedIn account). **Kept at the author's instruction:** Asset
Relocation (XX). The Yamantau duplicate in IX's military-science belt is cut (IX has its own Yamantau entry).
**Ids never renamed** — the moved h3s keep `xvi-`/`xx-`/`xiv-`/`ix-` prefixes and the Signal keeps `xxiv-*`, so
every old deep link still lands. `#XXIV` now means Test Cases; all old `#XXIV` links and "Section XXIV" prose were
moved to XXV first. **Pre-existing breakage found and fixed on the way:** ~14 pointers still sent readers to
"Section XIII" for the naming error, the Babylon reading, the Geneva Freeport figure, "obelisks and cubes" and the
Spirit of Burbank — all removed from XIII on 21-22 Sept. They now point to Section I (where the naming error is
defined), XVIII or XX, or were reworded; the Freeport 1.2 million is marked a press estimate. **Traps:** the
`<!-- SECTION XXIV (THE SIGNAL) -->` comment sat *above* XXIII's servicemember subsection, so inserting before
the comment swallowed that subsection into XXIV; the TOC audit caught it (23 h3 vs 22 li) and the marker is now
directly above its h2. There is a **second static contents list** near the top of the report (`<a href="#XXIV"
data-i18n=…>`) besides the JS sidebar. "twenty-four sections" appeared **11** times, not the 5 a line grep found.
**Map 1,178 → 1,174:** Point Nemo, the Amsterdam court, Edwards AFB (existed only for the DEW claim) and the
duplicate "Svalbard Seed Vault (Gates/Rockefeller)" gone; the surviving vault marker corrected and moved to VII;
Mondaloy markers → XXIV; Magadan/Vorkuta/Perm-36 → XIV; the Nestlé→vault line (no documented edge) and the
Edwards→Reza line removed; SvalSat↔vault relabelled (2.4 km apart, not "same coordinates"). i18n carries XXIV and
XXV in all 12 languages; KML, concordance (plate now 25 cells) and the film's "Twenty-five sections" updated.
**Scale line 276 / 1,079 / 133; 111 cross-references.** The scale line had not been updated at the 22 Sept XIII cut
(still said 282) — now recomputed.

**XIII's LAST TWO SUBSECTIONS ARE GONE — 22 Sept 2026, live. DO NOT RE-ADD EITHER.** Author, with a screenshot of
the XIII sidebar: *"remove the last two sections here they have nothing to do with cyclical patterns."*
Removed whole: **`xiii-the-oldest-outlines-correlation-without-mechanism`** (the KJV outlines table added 20 Sept)
and **`xiii-speculative-floor-the-cyclical-data`** (the data-extraction hypothesis *and its `spec-clause`*, which
carried the author's provenance note about his personal record). XIII is now four parts — Indicators, Point
Nemo, the Cycle Template, the Olympic Pattern — and **ends on the Olympic Pattern, then its own `sect-body`
closer.** The trap recorded on 21 Sept held exactly: that closer sits *before* the two removed subsections, so
the cut ran from the first `<h3>` to the `spec-clause` `</div>` and left the closer alone; div 331 → 330,
balanced, diffed against a backup. **One prose dependency amended rather than left false:** the XXIV close
said *"…anticipating is not - which is why Section XIII prints the oldest outlines as correlation and stops"*;
it now ends at *"anticipating is not."* The concordance page linked the speculative floor and is regenerated.
**Scale line 280 / 1,090 / 132.** *Verification trap found in my own tooling:* the TOCs are **`<nav class="sect-toc">`,
not `<div>`** — an audit regex written for `<div class="sect-toc"` matches nothing and prints PASS having checked
nothing (it did, on every deploy earlier on 22 Sept). Re-run correctly: 0 mismatches report-wide. **A check
that finds zero items is not a pass until it has been shown to find one.** Then *"look for removal of sections like this that go off track"* — the
off-track audit (every subsection title read against its section's title, every candidate's opening read)
was put to the author as a choice, not executed: removal is editorial.

**THE INTRO IS A THREE-MINUTE NARRATED FILM, SHAREABLE AT `/intro` — 22 Sept 2026, live. Supersedes the
ten-second loader and the five-shot reel written earlier the same day.** Author, in sequence: *"that intro is
whack - use actual footage of the world events"*, *"I know you can do better"*, *"make the intro larger and
longer with audio"*, then *"edit a mini film intro - you can do minutes here / with voice over in one of our
british ladies voices / and then allow the watch intro again button or in site / share buttons for social"*,
then *"tetelestai"* (I read it as *stop* and reverted the tree; he said *"please continue"* — it was the
closing word, and the film now ends on it).
**The film.** Eight parts, 33 shots, 2:59 of footage + a ~20 s closing map, all from **archive.org items that
are public domain or CC0 by their own metadata** (`scripts/intro-reel.json` names each item, its licence URL,
the exact in-point, and the sha256 of the master cut): I *The record* — Nuremberg (Universal Newsreel, 6 Dec
1945); II *The instrument* — HUAC's Hollywood hearings, the bank of newsreel cameras (20 Oct 1947); III *The
capability* — Ivy Mike (US DOE film 0800012); IV *The overhead* — Explorer 1 (3 Feb 1958); V *The annotation* —
the labelled U-2 photographs (25 Oct 1962); VI *The public* — the 1967 peace march **and its
counter-demonstrators**, which the reel filmed too; VII *The inquiry* — Iran-Contra (NARA ARC 11161); VIII *The
ledger* — the site's own 1,178 markers, closing on **τετέλεσται — "it has been completed, and remains so"**, the
report's own XXIV reading (perfect passive), not "it is finished" and not "paid in full". **The source of every
shot is on screen while it plays.** Picture cut and scaled only; the newsreels' **own sound** runs under the
narration, level-matched (loudnorm) with 90 ms splice fades — correction, not scoring; nothing was laid under
it. `scripts/build-intro-reel.py` rebuilds it all (~3 min; masters ~700 MB outside the repo, re-fetched on
demand) and emits `site/intro-reel.js` — shot captions, part timings and **the narration script** from the one
spec, so picture, source line and voice cannot drift. 8.3 MB MP4 + 8.7 MB WebM.
**The narration was checked line by line and three lines were narrowed before they went in:** Explorer 1
carried a **cosmic-ray counter, not a camera** — the watching came two years later under the cover name
*Discoverer* (CORONA, first recovery Aug 1960, declassified Feb 1995: "stayed classified for thirty-five");
the peace-march crowd is **quoted by the reel's own title ("Thousands")**, not by an estimate; and the
counter-demonstrators are placed **"in the same reel"**, which is what the film shows, not "across the
street". The script is the report's method, not new claims — the named rules, the tier ladder, §8's last
line. **Living-person floor applied to shot choice:** the Iran-Contra tape is mostly close-ups of a living
witness; only the wide of the room and the (deceased) committee chairman are used.
**The voice.** Spoken live by the reader's own browser, asking for a **British woman by name** — Sonia, Libby,
Serena, Kate, Hazel, Martha, "Google UK English Female" — with British male names pushed *down* (Google UK
English Male otherwise scores equal), falling back to the best en-GB voice. Same layer as `report-tts.js`.
**Every line is also on screen** (serif subtitles; below the picture on portrait phones), so the film is whole
muted, blocked, or with no engine. **Sync:** the video is the spine; a part's narration starts with the part;
**if she is still speaking when the part's last shot ends, the picture holds on its final frame until she
finishes**; newsreel audio ducks to 0.1 under her. A probe drops to captions-only if the first line has not
started within 3 s. iOS Safari needs a silent utterance queued *inside* the click — done.
**SYNC DEFECT FOUND ONLY ON PRODUCTION, FIXED:** locally the video starts instantly, so the first test showed
perfect sync; **on the live site the 8 MB file took ~4 s to start and she was four seconds ahead of the
picture.** The narration is now **gated on the video's `playing` event** (15 s fallback — 6 s was too short: through a slow link the live film
took 8.5 s to start and she began 2.4 s ahead; the part-boundary
hold resyncs after any stall), with a cyan loading shimmer on the progress bar meanwhile. Proven by holding
the video response 3.5 s: PLAY 3.87 s → picture 7.49 s → first word 7.50 s. **Lesson: test media sync over
a real network, not localhost.** *Cascade trap caught before shipping:* `transform:none!important` on the
shimmer would have outranked its own keyframes (animations beat normal and inline declarations, not
`!important` ones). *Test-client trap:* Playwright's Chromium is not routed through the sandbox egress proxy
by default and fails on production with `ERR_CERT_AUTHORITY_INVALID` / `ERR_TOO_MANY_RETRIES` while `curl`
gets 200 — launch with `proxy: { server: process.env.HTTPS_PROXY }` and `ignoreHTTPSErrors`; the failure is
the test's routing, not the site.
**Why it opens on a card, and why that is not the gate coming back.** No browser lets a page speak or play
unmuted without a gesture, so a narrated film must ask. The card (**WATCH THE FILM / ENTER THE REPORT**, muted
footage looping behind) shows **once per session, never on a deep link, dissolves into the report after 14 s
with a visible countdown**, and ENTER / Esc / SKIP always go straight to the report. The bootstrap in
`report.html` no longer *removes* the overlay when already seen (the replay button needs it); its fail-open
timer is 8 s and **fires only if `intro.js` never claimed the overlay** (`data-claimed`), so it can never cut a
film that is playing. **Replay:** a cyan **▶ INTRO FILM** button in the report sidebar (next to FILMS; any
`[data-b0b-intro]` element works) opens straight into the film with sound. **Share:** `/intro` is its own page
(`PAGES`, `CANONICAL_PATHS`, sitemap, `apply-seo-meta.js` URL map) whose end card carries X, Bluesky,
Facebook, LinkedIn, Reddit, Email, Copy link and native Share — plain links, no third-party script, no CSP
change. **`apply-seo-meta.js` now takes a per-page `ogImage` and emits `VideoObject` JSON-LD**; the card is
`site/img/intro-card.jpg` (1200×630, three real frames, rendered in headless Chromium). `/home` links it in
nav and hero. `soundtrack.js` gained **`__b0bSoundtrackHold`** — without it the narrator-ducking restarted the
music in every pause between her sentences. Markup lives **only** in `intro.js` (report.html and intro.html
carry an empty shell); styles in `site/intro.css`.
**Verified, not assumed** (local Express on a fresh port, Playwright, mocked speech engine listing the male
voice first): Sonia picked; subtitles track the spoken line; ducking at 0.1; **Part I held at 23.89 s for six
seconds while the last line finished, and Part II began as she stopped**; arrival → ENTER → sidebar replay →
Esc → same-session reload all behave; zero CSP violations; `/intro` in the sitemap; Range 206 on both files.
Every one of the 33 shots was checked by a mid-frame contact sheet — **one miss found and fixed** (the Ivy
"atoll map" in-point was a dissolve; the map is at 1,400 s, not 1,380) and two shot *labels* corrected. Counts
unchanged **282 / 1,104 / 134**; security 33/33; seo 48/49 (new `/intro` check passes; the fail is the
pre-existing 84-char concordance title).
***TRAPS, ALL STILL LIVE:*** **(1) Playwright's Chromium has no H.264** (`canPlayType` → `''`) — the WebM twin
ships first in source order and is the only reason the film can be inspected here; **`.webm` had to be added to
`server.js`'s static allowlist** (the `.kml` trap). **(2) `python3 -m http.server` serves no Range**, so
`video.seekable` is `[0,0]` and every seek silently no-ops — test against the real Express server, which does.
**(3) the pip `imageio-ffmpeg` binary has no `drawtext` and segfaults on `https://` input** — fetch with curl,
cut locally. **(4) headless rAF:** screenshot through `window.__b0bIntroSeek(ms)` / `__b0bIntroCard('end')`,
never the live loop. **(5) Playwright *does* run report.html's deferred scripts** — the "never executes
deferred scripts" limit below is specific to `--dump-dom`; use Playwright for report JS. **(6) re-serialising
a JSON config** with the wrong indent turned a 17-line change into a 483-line diff — match the file's own
format (seo-meta.json is indent 2, `ensure_ascii=False`). *archive.org:* `/download/` 302s (curl `-L`), Range
206, ~11 MB/s, `licenseurl` in `/metadata/<id>`; `gov.archives.arc.12110` is **mislabelled** — catalogued as
the FBI crime lab, it is defensive-tactics training.

**SOUNDTRACK REWRITTEN AFTER "not up", AND THE TRACK IS NOW THE NINTH SIGNAL — 22 Sept 2026.**
Author: *"Restless leg syndrome not up."* **Two separate mistakes, both mine.**
- **(1) The control was built inside the YouTube IFrame API's ready callback**, so if that API did
  not load — blocker, privacy extension, filtered network, slow — **nothing appeared at all, not even
  a play button.** `site/soundtrack.js` is rewritten: **the bar mounts unconditionally**, playback runs
  through a **plain `<iframe>` driver that needs no external script**, and the **API is adopted only if
  it loads**, purely to report true state. Two further defects fixed: a cross-origin iframe **needs
  `allow="autoplay"` on the element** to receive the autoplay permission the Permissions-Policy header
  delegates (header delegation alone is not enough — this alone would have blocked autoplay), and the
  player had **1×1 dimensions**, which invites the embed to treat itself as hidden; it is now 320×180
  off-viewport. Tag bumped to **`?v=2`**. *Note `signal-bar.js` already injects the YouTube API as
  `b0b-yt-api` and sets `onYouTubeIframeAPIReady`; soundtrack.js chains rather than overwrites it.*
- **(2) "add this to the playlist tho" almost certainly meant SECTION XXIV, not the film reel.**
  **XXIV carries "the bar" — a curated song playlist, eight numbered "signals"** (Daft Punk, Tracy
  Chapman, Paul Simon, Talking Heads, Filter, TOOL, The Smiths, CCR), each an essay plus a
  youtube-nocookie embed, with its own provenance note. **I had not read XXIV and put the track in the
  home-page transmissions reel (films).** It is now **also `xxiv-ninth-signal-restless-leg-syndrome-…`**
  (toc 18 → 19). *The Creedence entry claimed to be "the last thing on the bar"; that sentence was
  amended rather than left false.* Entry facts: Vienna trio **d.b.h / Chrisfader / Testa**, track 6 on
  **Totem, 6 Aug 2021, Duzz Down San** (2LP), 7-inch on Little Beat More Dec 2022. The rationale is
  the honest one — **a turntablist record is assembled from other people's records exactly as this
  report is assembled from other people's documents, and both only survive if every splice is marked**
  — and the title reading is **labeled as the site's own, not as the artists' stated meaning** (no
  interview found; they have not been asked to lend the document anything).
**Scale line 282 / 1,104 / 134.** **VERIFICATION LIMIT, IMPORTANT AND NOT A DEFECT:** headless Chromium
here **never executes deferred scripts on `report.html`** — `b0b-signal-bar`, `ttsFab` and `b0b-snd` are
all absent from a `--dump-dom` even at a 90 s virtual-time budget, including the two that certainly work
in production. **So "the control is missing from the DOM dump" proves nothing about the live site.** What
*is* provable here: the script mounts correctly on an isolated local page (control, iframe with the allow
attribute, honest PLAY label). **To test report JS, use an isolated page, not a dump of the report.**
*Shell trap repeated and confirmed: `pkill -f "node server.js"` kills the shell running it (exit 144) —
never pkill, always a fresh port. The local server also 301s to HTTPS unless `NODE_ENV=development`.*
*And the dev server rate-limits at 60/min — a curl that returns empty mid-diagnosis is probably throttled,
not evidence.*

**SHINYHUNTERS v THE FBI — author dropped the 404 Media link 22 Sept 2026; PUBLISHED same day as XVI
`xvi-a-claim-against-the-bureau-and-a-ransom-demanded-in-retractions` (toc 31 → 32).** **The keepable
finding is the demand, not the breach: the ransom is a retraction.** The group gave the Bureau **seven
days** to correct or remove its **PSA of 15 May 2026** — addressed to the FBI Director and the Cyber
Division assistant director — and says the operation is *"NOT financially motivated."* That PSA had
warned the group pressures victims by threatening victims' **family members** and, in some cases,
**swatting**. *Every other extortion on the page targets money or silence about a fact; this one targets
the text of a government document.* **And it is self-refuting:** the same PSA warns that such attackers
**exaggerate their claimed access** — so the leverage is a claim of exactly the kind the document being
attacked says is inflated. A retraction under that pressure would prove the warning right, not wrong.
**Tiering, which is the whole job here:** *documented* — the claim, date, deadline, addressees, the PSA's
contents, and that the capability class is real (**CVE-2026-35273**, unauthenticated RCE in PeopleSoft
Enterprise PeopleTools, **CVSS 9.8**, exploited as a true zero-day before Oracle's **10 June 2026**
advisory; Mandiant dated activity **27 May–9 June**, 100+ orgs notified, ~⅔ higher education).
*Attributed* — a ~**5,000**-record sample whose phone numbers an outlet matched to like-named people.
**Not established at any tier** — the breach itself, the 2–3 TB figure, the word "all", and the *new*
second zero-day claimed; **FBI, Oracle and AWS have confirmed nothing.** *Symmetry from the group's own
history, not from sympathy for the Bureau:* **NAIC, a named prior victim of the same flaw, said publicly
that what was actually taken was public data, stale logs and config files** — so scope is the part to
hold loosest. **Guaranteed-null stated explicitly about FBI silence:** deny = cover-up, confirm =
vindication, say nothing = confirmation; a test scoring every outcome for the claim is not a test.
**HARD RULE WRITTEN INTO THE ENTRY — no portion of the data is reproduced, summarised, characterised or
pointed to, and no individual in it will ever appear on the page**, because the FBI's own PSA documents
that this group swats people; helping resolve a name would be participating in that. **Live and
unresolved — record the outcome either way, including if the claim collapses.** **Scale line
281 / 1,101 / 134.**

**THE SITE HAS A SOUNDTRACK, AND THE WANTED-LIST QUESTION IS PUBLISHED — 22 Sept 2026, live.**
Author: *"why is david myatt not on interpol or fbi most wanted lists"*, then *"add and the autoplay audio -
Represent The Fucking Planet - by Restless Leg Syndrome"*, then *"add this to the playlist tho"*.
- **XVI gained `xvi-why-a-name-is-not-on-a-wanted-list-the-instrument-measures-warrants-not-danger`**
  (toc 30 → 31). **The finding is the mechanism, not the man:** a Red Notice needs an arrest warrant or
  court order already issued by a member state's judicial authorities via its NCB (INTERPOL never
  initiates); the FBI Most Wanted Terrorists list (created 10 Oct 2001) needs a **federal grand jury
  indictment** plus a publicity test. **No warrant, no listing.** Myatt: two custodial terms in the early
  1970s for political violence, and a **Feb 1998** Scotland Yard investigation for incitement to murder /
  racial hatred over *A Practical Guide to Aryan Revolution* **dropped after three years** for want of
  evidence from Canadian authorities. Lives openly in England under his own name. **INTERPOL Article 3**
  ("strictly forbidden … political, military, religious or racial character", predominance test) is a
  second independent bar. **Authorship of the O9A corpus as "Anton Long" is ATTRIBUTED — scholarly
  consensus plus the group's own 2016 acknowledgment, never a court finding — and must not be promoted.**
  The asymmetry is the keepable part: **NZ designated the O9A a terrorist entity 7 Dec 2025** (s29B
  Terrorism Suppression Act 2002; Canada designated two cells the same day; NZ's statements of case call
  it a network practising **stochastic terrorism** and do not claim NZ activity), **the UK has not
  proscribed it**, and a **March 2023 US federal case sentenced a soldier to 45 years** over an ambush plot
  with no charge reaching the alleged author. **Symmetry printed hard: absence from a list is evidence
  about the instrument, not the man — exoneration and "he's protected" are the same error** (guaranteed
  null). Page had Myatt 0 / O9A 0 before this.
- **SOUNDTRACK — `site/soundtrack.js`, loaded by `report.html` only** (the report is `/`, the landing
  page). Restless Leg Syndrome, *Represent The Fucking Planet* (from *Totem*, 2021), played from the
  **label's** YouTube upload (Duzz Down San, id `7eNqNfURcxw`) through youtube-nocookie — **nothing is
  rehosted, so there is no licensing exposure.** **No CSP or server.js change was needed and none was
  made:** `frameSrc`/`scriptSrc` already admit youtube.com + youtube-nocookie.com and the
  **Permissions-Policy header already delegates `autoplay` to those origins**. **AUTOPLAY IS ATTEMPTED,
  NOT PROMISED** — Permissions-Policy governs whether the feature is *allowed*; Chrome's media-engagement
  heuristic still decides whether *unmuted* audio may start without a gesture, and usually refuses on a
  first visit. So state comes from the **IFrame API's `onStateChange`**, never from our intent: the button
  cannot claim to be playing when it is not. It **ducks for the narrator** (polls
  `speechSynthesis.speaking`, so `report-tts.js` needed no edit), **remembers a stop** in localStorage
  (every access try/caught), removes itself if the API fails to load, and sits **bottom-left** — the only
  free corner, since signal-bar owns the full-width bottom strip and report-tts owns bottom-centre and
  bottom-right (it uses `--b0b-signal-h` to clear them).
- **PLAYLIST — `scripts/build-transmissions.py` gained a `youtube_ids` curated list**, parallel to
  `vimeo_ids`, for YouTube videos **not on the ERC-1155 channel** (the Atom feed only covers the channel).
  Title/thumb come from YouTube's public **oEmbed** endpoint; `date` and `sub` are curated because oEmbed
  carries neither. **Offline mode now merges curated ids that post-date the last fetch**, provided the
  entry carries its own `title` — so the reel stays reproducible without network. **Reel is 17 cards.**
  *Trap:* the **watch page refuses this crawler (402-byte stub)**, so no upload date is obtainable here —
  the entry carries the **track release date** (2021-08-06) with a `date_note` saying exactly that. Do not
  present it as an upload date. **`build-transmissions.py` succeeded live this time** after the 404/21 Sept
  and 500/22 Sept failures, so the feed is flaky rather than broken — the third-failure rule is not tripped.
**Scale line 280 / 1,094 / 133.** security-selftest 33/33; seo-selftest 47/48 (the pre-existing 84-char
concordance title). **`index.html` changed, so check-live.js alone is not proof** — the reel was verified
by polling `/home` for the new card id (§4 step 9).

**CURRENT NEWS / EVENTS SCAN — 22 Sept 2026, PUBLISHED, live.** Author: *"update the report with a
current news / events scan / social media and web."* The page's newest current-events entry was the XV
status update of **3 Sept**, a nineteen-day gap. **Method that worked and should be re-used:** Wikipedia
`Portal:Current_events/2026_September_NN` **day pages**, not the monthly page (the monthly page truncates
at ~4 Sept in a WebFetch and the model will tell you the rest "does not exist"); then **every item that
went on the page was re-verified against named outlets with dates.** Search results for 2026 queries
routinely returned 2025 items — date-check everything. **Three new subsections + four appends:**
- **XV `xv-status-update-22-september-2026`** — the **UN Independent International Fact-Finding Mission on
  Iran, 17 Sept**, reasonable grounds that the US committed *the war crime of launching indiscriminate
  attacks* on **28 Feb 2026** (the war's opening day): Minab elementary school ≥157 dead incl. 120
  children, Lamerd sports hall 20 dead. **US rejected it ("unserious nonsense"), denies any Lamerd
  strike — printed with the finding.** Hormuz tanker strikes vs CENTCOM's "six-month high" shipping
  (symmetry pair); Iran GDP −10.1%; sanctions extended to 2031 (signed 18 Sept); Yemen escalation
  (Mokha 10 Sept, Hanish Islands 14 Sept, 100k displaced); **the Afghanistan–Pakistan war the section
  lacked** (Kohat bombing 18 Sept, 31 dead) — also added to the conflict-zones list; Ukraine (1,600+
  drones on Moscow Oblast 20 Sept); **Greenland: US–Denmark–Greenland agreement 18 Sept**, permanent
  basing, no sovereignty transfer, updates the 1951 pact.
- **X `x-two-acknowledgments-in-one-month-…`** (toc 24 → 25) — **14 Sept: the Air Force Secretary
  acknowledged on-orbit space-control weapons, the first US public confirmation of weapons in orbit**, no
  type/number/orbit named; and the **Serbian spyware wave** (Citizen Lab + SHARE Foundation, 2–3 Sept):
  ≥14 targets, Pegasus by **zero-click iMessage**, two **NoviSpy** infections, **one after police
  confiscated the device during questioning** — the physical-custody vector. Both carried with the
  constraint: *an acknowledged capability is not a use, a confirmed infection is not a confirmed
  operator*; **no marker retyped and no operator named.**
- **XVI `xvi-the-ground-zero-air-quality-records-…`** (toc 29 → 30) — **8 Sept: NYC released 170,000+
  pages** of post-9/11 air-quality records, 68 boxes, many found only last year, settling survivor
  litigation. Framed as the interval between knowing and publishing (25 years) and the point that
  **nothing in it was classified**. *Limit printed: the report has not read the pages.*
- **Appends:** XV Sudan — the **Al-Zar'a mine collapse, West Kordofan (RSF-held), 16 Sept**, toll printed
  as a genuine range (67 Sudan Tribune / "at least 70" Al Jazeera / 82 others) **and the aggregator's
  "explosion" corrected to "collapse"**; plus **Kenya (15 Sept), Ghana (1 Sept) and Zimbabwe forcing
  domestic gold refining** — a direct move on the Dubai chokepoint; Eritrea sanctions lifted and the
  Algeria–UAE break carried *with no mechanism attached* (anti-map). XV weapons — **UK RAF air-to-air
  refuelling of Saudi aircraft, 21 Sept**, i.e. direct participation, the same support the US/coalition
  arrangement ended in **Nov 2018** over civilian casualties; **Serbia's Yugoimport SDPR + Elbit drone
  plant, 17 Sept** — and Yugoimport is the same producer the Sudan entry names supplying both sides;
  *Nicaragua v. Germany* at the ICJ on arms exports. XVI UAP — the **sixth release, 18 Sept**, whose
  centrepiece is 1952 Tremonton footage that **Blue Book (Dec 1952) called pillow balloons and the Naval
  Photographic Interpretation Center (1954) called not consistent with natural phenomena**: a
  declassification that publishes a disagreement instead of resolving it. II compellability — **Oversight
  41–0 on 15 Sept and the House holding Leon Black in contempt by unanimous consent on 16 Sept**, over the
  **subpoenaed NDAs**, referred to the DOJ; and **9 Sept: Norway, Poland, Latvia and the UK say their
  mutual legal assistance requests are unfulfilled**, with DOJ's denial quoted and the symmetry note that
  *delay is not refusal* — the page had **MLAT 0** before this. Heading/TOC text moved 5 Sept → 16 Sept;
  **the id was left unchanged so anchors keep working.**
**Scale line 279 / 1,086 / 132.** *Traps:* an idempotency key must be unique to its own block — "air-to-air
refuelling of Saudi aircraft" appeared in both the status update and the weapons append and the guard
fired correctly; `build-transmissions.py` has now failed **twice running** (404 on 21 Sept, 500 on 22 Sept)
and left the reel untouched as designed — **if it fails a third time treat the feed as broken, not flaky.**

**"ISRAELI MILITARY-GRADE CERAGON AT ZORRO RANCH" — tested 21 Sept 2026, unpublished.**
`research/ZORRO-MICROWAVE.md`. Author-supplied claim off DOJ `EFTA01124507` (DataSet 9, fetched, sha256
`4e4113b2…2f671`, read in full). **The document is real; the adjectives are not.** It is two competing
April/June 2014 vendor quotes for a rural phone-and-internet backhaul link, Sandia Crest → Zorro Ranch
(43.2 km): Advanced Communications (Albuquerque) with **Ceragon IP-10G / RFU-CX at 6 GHz, $51,652.75**, and
Durham Communications (Mesa) with **Exalt (California) at 11 GHz, $61,828.92**, carrying eight tw telecom T1s
to an Adtran router. **The email layer shows the Ceragon project was never built** — 1 Dec 2014 the vendor
asks whether to close the account, the FCC licence's one-year construction clock running; the link that
replaced the 2.4 GHz hop was installed **Sept 2016 by Future Tech at 11 GHz, equipment unnamed.**
`"Ceragon"` = **0** email bodies in the corpus; the word exists only in this attachment. **"Military-grade" is
a naming error:** Ceragon's own FY2014 20-F (read at source) lists FibeAir IP-10G as sub-6 GHz short-haul
backhaul for "cellular operators and other wireless service providers," already "legacy"; "military"/
"defense" appear in both its filings only as Israel risk factors. The rest of the quote is Andrew antennas,
Adtran, Times Microwave, Heliax. The 10-ft pipe is Fresnel/elevation clearance, stated in the same sentence.
**Keepable, documented:** no fibre passed the ranch (CenturyLink "did not get any budget," Aug 2013), phones
and internet ran over a hop to the Sandia Crest tower farm from ≤2012, and **17 Apr 2013 Epstein asked Greg
Wyler (O3b/OneWeb founder) whether to run fibre or microwave — "start with microwave (cheap)"**
(EFTA01896182/02026891). Page: Zorro 20, Ceragon 0, Wyler 0. *Traps:* jmail's search index matched the
attachment for "Ceragon" while the body test returned 0 — always re-filter on body; the spider got an Akamai
401 on the PDF and succeeded on a backed-off retry (the browser-UA curl per §4 got it first, same hash);
`data.fcc.gov` license-view returned nothing for the ranch entities — the ULS Part 101 record is a lead.
Author's call on publication; the file recommends the Wyler contact and the no-fibre particular, and the
claim as a killed specimen.

**THE XIII "NAMING ERROR" SUBSECTION IS GONE; THE FIVE HELD FILES ARE PUBLISHED — 21 Sept 2026, live.**
Author: *"remove the 'naming error' section from this section - its very weird that that is there … its
gibberish to the report itself"* → `xiii-the-naming-error-when-a-label-becomes-the` (Solomon's Stables,
the Templars, the Jerusalem cross, the octagram, the author's own marks, tetelestai, the Parodyjeff card,
the Sultan/Babylon/Temple/Harem word tests) removed whole, toc 7 → 6. **Do not re-add it.** The *rule*
survives where it is defined (Section I, "a second guardrail") and where it is invoked by name (III black
book, XVI anthrax); the Section XXIV tetelestai close still stands on its own. Then *"AND ADD THOSE 5"* →
**XV gained two subsections** (`xv-who-arms-sudan-…`, `xv-whose-weapons-are-in-these-wars-…`; XV has no
static toc), **XVI gained two** (`xvi-the-intelligence-funding-documents-…`, `xvi-united-states-v-swartz-…`;
toc 27 → 29), and **the map audit's plain duplicates were merged** — Menwith Hill, Pine Gap, Culiacán,
Allegiant (context folded into the kept marker; GCHQ Bude kept as two because cable tap and satellite
intercept are two documented functions), **232 names normalised from ` — ` to ` - `**, **1,182 → 1,178
markers, 819 dated**, KML rebuilt, counts changed in `scripts/seo-meta.json` (3) and the map's KML link
line. Cross-section pairs and the Olympic overlap left as they were. **Scale line 276 / 1,067 / 125.**
*Trap:* the XIII sect-body `</div>` sits *before* the last two XIII subsections (the speculative floor is
literally outside the evidentiary wrapper) — the removal had to keep that closer; div balance diffed
against a backup, 327/327. `build-transmissions.py` got a 404 from the feed this run and left the reel
untouched, as designed.

**AARON SWARTZ — researched 21 Sept 2026; PUBLISHED the same day as Section XVI
`xvi-united-states-v-swartz-the-ruling-recorded-the-prosecution-documented`. `research/SWARTZ.md`.** Author's correction on
posture, verbatim: *"Epstein 'died by suicide' too... and that isn't our finding."* The medical examiner's
ruling is recorded at tier (a spokesperson's report, attributed), not adopted — the same rule the page
runs for Epstein. **But the parallel is of posture, not fact pattern, and the page must not imply the
second by printing the first:** Swartz was on pre-trial release, not in custody — no camera, no cellmate,
no contested autopsy, no retained pathologist. On *manner* the record is empty in both directions; that
null is printed. **The documented tier is the twenty-four months before** (MIT Review Panel, 30 July 2013,
read in full): USAO investigation opened **5 Jan 2011, the day before anyone was identified**; the Secret
Service in the arrest party via its own Electronic Crimes Task Force on a call that in none of MIT
Police's usual six-a-year computer calls had drawn a federal agent; **network logs and an 87 GB packet
capture handed to the Secret Service without subpoena (drive 25 Jan; first subpoena 27 Jan)** and MIT's
counsel later telling the defence the opposite — Panel: *"In fact, this was not true"*; the state case
**dismissed 8 Mar 2012 because the USAO and Secret Service refused discovery to the DA**; four counts
unbundled into **thirteen** (12 Sept 2012); the prosecutor telling MIT's counsel "general deterrence of
others" was a consideration; **both nominal victims on record as not wanting the prosecution** (JSTOR:
"It was the government's decision whether to prosecute, not JSTOR's"; MIT "never requested" one); the
2008 manifesto used as intent though the Panel records **Swartz was not its sole author and the quoted
sentences are of unknown hand** — the naming error, documented by the institution not on his side;
motive "remaining open." Oversight: Issa–Cummings and Cornyn letters, Reich briefing (manifesto "played a
role"), estate misconduct complaint → **no public finding located**; unsealing 13 May 2013 with names
redacted; Secret Service FOIA files refused from here (wired 404, muckrock 403, vault.fbi.gov 403).
Aaron's Law (H.R. 2454 / S. 1196, 20 June 2013, texts read) never enacted; **Van Buren (3 June 2021)
narrowed "exceeds authorized access" and footnote 8 expressly left open the code-based-vs-contract
question Aaron's Law would have answered.** PACER 2008: FBI, no charges; FOIA-retaliation link is
Cornyn's question, not established. **Keepable finding: the same DOJ that declined federal charges
against Epstein in 2007 brought thirteen felonies for downloading journal articles — discretion as the
instrument, documented both ways.** Page carries Swartz 0 / CFAA 0. *Trap, new decoy shape:*
`justice.gov/usao-ma/pr/…` serves a 2,545-byte Akamai `bm-verify` interstitial with HTTP 200 (the
archive path `justice.gov/archive/usao/ma/news/…` still serves real pages). Candidate for `hosts.json`.
On the page the living prosecutors are not named — "the lead prosecutor", "the US Attorney's release".

**US AND ISRAELI WEAPONS VIA THE UAE; THE INTELLIGENCE FUNDING DOCS — 21 Sept 2026; PUBLISHED the same
day as XV `xv-whose-weapons-are-in-these-wars-the-us-and-israeli-lines-through-the-uae` and XVI
`xvi-the-intelligence-funding-documents-the-certificate-is-the-voucher`.**
`research/US-ARMS-UAE-SUDAN.md`, `research/INTEL-FUNDING-DOCS.md`. Three author questions. (1) *Does the US arm
Sudan via arming the UAE?* **The law would bite** — 22 U.S.C. §2753(a)(2) requires presidential consent for any
retransfer and (c) cuts off deliveries for substantial violation — **but no US-origin weapon has been found in Sudan
by anyone tracing** (Amnesty, UN Panel, Bellingcat, Sudan's own Oct 2025 UNSC filing): the third-party list is
Canada (Streit), UK (Militec, Cummins-engined Nimr APCs), Israel, Greece; Chinese Norinco kit is what moves through
the UAE. Meanwhile GAO-22-105988: $54.6bn of US military support to Saudi/UAE FY2015–21, and "DOD has not reported
and State could not provide evidence that it investigated any incidents of potential unauthorized use." Biden made the
UAE a "major defense partner" 23 Sept 2024; Meeks hold Mar 2025; $1.32bn Chinooks approved May 2025; Senate JRDs June
2025 (outcome unverified); Rubio Nov 2025 "knows which countries" supply the RSF. (2) *Are our weapons in those wars?*
**Yemen: documented, two branches** — retransfer: Amnesty (6 Feb 2019) and CNN (Feb 2019) traced US M-ATV/Caiman/
MaxxPro/Oshkosh vehicles and TOWs to UAE-backed militias, Pentagon on record that no retransfer was authorised; direct
use (author-supplied, Columbia Magazine Fall 2022, ledgered): the Security Force Monitor + Washington Post investigation of
4 June 2022 found a "substantial portion" of civilian-killing airstrikes were flown in US-developed, -sold and -maintained
jets by US-trained Saudi/Emirati/Kuwaiti/Bahraini squadrons. *Trap:* justsecurity.org answered the crawler with a 200
redirect to the article's header JPEG — a decoy shape not in `hosts.json` yet. **Libya: attributed** — US Javelins sold
to the UAE in 2008 found at a Haftar base June 2019. **Sudan: null.** (3) *Israeli systems the same way?* Sudan:
LAR-160 mounts and Galil ACE carbines with the RSF (Aug/Oct 2023, "likely a third party," attributed); **Predator
spyware (Cytrox/Intellexa, Israeli subsidiaries) flown Cyprus→Athens→Khartoum 2022, Greek licence admitted 2023,
Intellexa OFAC-designated Mar 2024** — the one near-documented chain; Israel announced Mossad/MFA contact with *both*
Burhan and Hemedti on 16 Apr 2023. Libya: an Israeli air-defence system bought by the UAE and deployed via Haftar,
Apr 2020 (attributed) — the cleanest Emirati-mediated Israeli specimen. **DECA is the Israeli AECA and the page has
zero mentions of it; no Israeli equivalent of the GAO end-use audit exists in the public record found.** (Funding
docs) **50 U.S.C. §3510(b): CIA money "accounted for solely on the certificate of the Director and every such
certificate shall be deemed a sufficient voucher"** — the founding instrument; §3306 requires only the aggregate NIP
(FY2025 $73.3bn NIP + $27.8bn MIP; FY2026 request $81.9bn + $33.6bn; first-ever disclosures $26.6bn FY1997/$26.7bn
FY1998 via FOIA litigation); the FY2013 CBJB $52.6bn (Snowden/WaPo, robots-disallowed) is the only line-item document
and is already on the page; *U.S. v. Richardson* (1974) declined the Statement-and-Account question on standing. Page
had zero for NIP/MIP/CIA Act/unvouchered until the XVI subsection.

**WHO ARMS SUDAN — researched 21 Sept 2026; PUBLISHED the same day as XV
`xv-who-arms-sudan-the-documented-layer-the-attributed-layer-and-the-gold`.** `research/SUDAN-ARMS.md`. **Documented (primaries
read in full):** OFAC 7 Jan 2025 — Hemedti designated with a **UAE-based** procurement/gold network (Capital Tap
Holding "provided the RSF with money and military equipment"; AZ Gold moves Sudanese gold to Dubai; Algoney,
the RSF procurement director, designated 8 Oct 2024); State's genocide determination same day is a
determination, not a court finding. OFAC 16 Jan 2025 — Burhan designated; the SAF chain is **Iranian UAVs via an
Azerbaijani company and a Hong Kong shell (Portex)** brokered by a Sudanese-Ukrainian DIS official. **ICJ Sudan v.
UAE, 5 May 2025: removed from the List for manifest lack of jurisdiction — not a merits ruling either way.**
**Attributed:** UAE flights via Amdjarass (NYT/WSJ/Guardian/BBC; UN Panel Jan 2024 "credible"); Bosaso/Puntland hub
and Colombian contractors (to Apr 2026); Wagner SAMs via Haftar (CNN 2023); Iran, Turkey (Baykar), Russia (SAF from
mid-2024, Port Sudan base talks), Egypt (jets, then drone strikes), Eritrea, Pakistan (Mohafiz-V Aug 2026) to the
SAF; China and Serbia by manufacture to both. **Symmetry:** UAE's 30 Apr 2025 claim of intercepting SAF-bound
ammunition. **Treasury names companies, not the Emirati state — the sovereign step is the attributed layer's.**
*Trap:* `docs.un.org` serves a 4 KB viewer shell with 200 for `S/2024/65` — decoy; the Panel PDF is unread. Amnesty
and HRW refuse the crawler. The Panel finding stays attributed on the page until the PDF is read.

**MAP LABELING COHERENCE CHECK — second pass, 20 Sept 2026, all 1,182 markers. `research/MAP-LABEL-AUDIT.md`.**
Name vs type, section, context, coordinates, and marker vs marker. **Coordinates are clean:** the Nominatim
reverse-geocode pass finished (1,152 unique keys, cache `scratchpad/revgeo.json`, method in
`scratchpad/geocheck.py` — gazetteer built from the geocoder's own answers, flag when a place named in the
marker appears nowhere in its own geocode) — **1,004 testable, 10 flagged, all benign** (the Strip is Clark
County; the Cowboys and the Pentagon are both in an Arlington). **One class fixed and live:** six orbital
launch sites in IX typed `airport`/`technology` → `satellite` (Esrange, Cayenne/Kourou, Wenchang, Jiuquan,
Sriharikota, Sohae) — the same class was already `satellite` in X and two of the sites carried two types at
once. KML regenerated. **Resolved 21 Sept (see the entry above):** four same-section duplicates merged
(Menwith Hill, Pine Gap, Culiacán, Allegiant), GCHQ Bude kept as two, dash styles normalised. **Still
held:** **the Olympic set is on the map twice** — XIII's fourteen hosts and SPORTS's eight overlap on six, IOC HQ ×2 — and XIII types each host by
what the contest was (conflict/financial/surveillance/governance; Berlin 1936 as `archaeological` is the odd
one); same-event-twice now eight pairs (add Medellín CENTRA SPIKE VII/XVII and Củ Chi IX/XV to the six).
*Method note: a name-token-absent-from-context test
flags 155 and means nothing — context describes, it does not restate. Do not re-run it as a signal.*

**"DARPA SOLVED RSI OVER A DECADE AGO" — tested 20 Sept 2026; the take is PUBLISHED.** `research/DARPA-RSI-CODEX.md`.
*"Note that take"* (author) → **Section X gained `x-the-soldier-s-servant-pal-calo-siri-and-the-neuromorphic-line`**
(toc 23 → 24 parts): the PAL→CALO→Siri chain and the SyNAPSE figures at documented tier, Avatar attributed, the
DeepMind tie a null, the RSI claim unsupported. **Scale line 273 / 1,069 / 127.**
A thread reply's claim plus its word list (spiking neural net, Synapse, Avatar, STDP, CALO, PAL, Siri, "even
deepmind"). **"Solved recursive self-improvement": unsupported at any tier** — no program on the list claims
it; the documented outputs are a scheduling assistant and a 100 mW pattern-recognition chip. **The list is a
real DARPA lineage, and that is the keepable finding:** PAL (2003) → CALO at SRI (May 2003–2008, "soldier's
servant") → Siri Inc. (Dec 2007) → Apple (2010) → iPhone 4S (Oct 2011) — a contract, a spin-out and an
acquisition, i.e. the money layer; SyNAPSE (Nov 2008, IBM + HRL in named tranches) → the 7 Aug 2014 chip
(1M neurons, 256M synapses, <100 mW, DARPA's own release); STDP is the neuroscience learning rule (Markram
1997, Bi & Poo 1998), a weight-update, not a rewrite. **Avatar** is a 2012 telepresence-robot line item, on
the list by name only — every source refused from here (six nulls ledgered), so attributed. **DeepMind: DARPA
0, any tier**; Founders Fund/Thiel is the only edge and it is a club edge. "Noone cared" fails on Science's
Aug 2014 cover and every iPhone since 2011. L2M (2017) is the closest DARPA language and its own premise is
that the problem is unsolved. **The report carries none of the lineage** (SyNAPSE/CALO/PAL/TrueNorth 0);
a PAL→Siri entry belongs in Section X at documented tier — author's call.

**THE REPORT AGAINST THE KJV AND GAME THEORY — 20 Sept 2026, researched; the reframe is PUBLISHED.**
*"Update report where applicable"* (author, same day) put two things on the page: **Section XIII gained
`xiii-the-oldest-outlines-correlation-without-mechanism`** (toc 6 → 7 parts) **[REMOVED 22 Sept 2026 at the author's instruction — see the entry at the top of §7; do not re-add]** — the seven dated outlines
against the record, each with its no-foreknowledge reading, tier *correlation documented / mechanism not
reached*, the Deut 18:22 forward test the report cannot sit, and the two refused verses (Amos 3:3, Rev
13:16–17); and **the Section XXIV close gained one paragraph** after "three completed things" — Zermelo
1913 determinacy as the shape of the perfect passive, Lovelace's retrospective/prospective signification,
Note G as the limit on the engine that helped draft the page. **Scale line 272 / 1,065 / 126.** Nothing
from §3 of the research file went on the page except as a refusal.
`research/KJV-AND-GAME-THEORY.md`. Author's ask: *"how the report parallels prophecy … or at least
sits, contextually within biblical framework … and game theory … tetelestai, ha!"* **Finding: the
report parallels prophecy as indictment, not as prediction, and the KJV's own rules are why** —
Deut 18:22 is an outcome test the report cannot sit because it predicts nothing; Jer 23:16 names
the fabricator class; the prophetic books are mostly indictment of captured institutions with a
two-witness floor (Deut 19:15, Num 35:30, Matt 18:16, 2 Cor 13:1 = the testimony tier). **The page
already carries nine passages** (Matt 4:19 masthead; John 19:30 ×4; Luke 12:6–7 ×5; Isa 54:17 ×4;
Dan 5:27 ×2; Ps 139; Rev 21:6; Gal 5:22–23; Ps 91) and reads three at the level of the grammar —
that is the documented tier; every other fit is labeled mine. **Refused by the report's own rules:**
Rev 13:16–17 against Section X (guaranteed-null + the "predictive programming" refusal already on
the page applies to scripture identically), Amos 3:3 (the anti-map's target verse), Psalm 2, Dan
12:4 as internet prophecy, any numerology. **Game theory, six rules mapped and no further:**
guaranteed-null = pooling equilibrium; symmetry = likelihood consistency; published nulls = costly
signalling (Spence) and §8 of this file is its exact statement, with Matt 5:37 as the cheap-talk
ban; standing constraints = Schelling commitment devices, and Section XXIII's Article 94 warning is
a *refused* coordination game with the lawful channel as the no-coordination focal point; Matt
7:16 = revealed preference (the money-layer finding); tetelestai = certain audit removes the payoff
to bury a retraction — the page's own closing argument ("written as though the ledger were already
kept"), with Eccl 8:11 as the delayed-audit case. The bridge is the author's line on the page,
*"each Christ paradox and each parable is math"*, recorded as his. **Tooling trap:** the Gutenberg
KJV (#10, in the ledger) repeats every book title in a table of contents, and two testament
headers sit inside it; a title-split lands in the TOC and returned Amos for Daniel 5:27, 1 Timothy
for 1 Thess 5:21. Split on each title's *body* occurrence, and split verses on `N:N` anywhere in
the line — Gutenberg runs several verses per paragraph. `scripts/kjv-verse.py` does both (needs the cached body: `spider.py fetch https://www.gutenberg.org/cache/epub/10/pg10.txt` if the cache is cold).
**Author's reframe, same day, now §6 of that file:** *"less as prophet - per se - more as world events
and this report correlating already stated, prophetic outlines - in combine with tetelestai as done
and finished game theory - via ada lovelace who stated the poetics of language as math."* That is a
different test and the page already runs it: **the *Network* (1976) precedent in Section VII** —
correlation printed, mechanism ("intentional signaling") withheld. Verdict on the reframe:
**correlation documented, mechanism not reached** — each dated outline (1 Sam 8, Micah 3:11, Eccl
8:11, Rev 18:13, Isa 30:10, 1 Kings 22, Amos 5:10) has a recurrence reading that needs no
foreknowledge, so the symmetry rule makes it a guaranteed null on mechanism only. Promotion would
need Deut 18:22 run forward: an outline specific enough to fail. Whether the table goes on the page
is his call. **Tetelestai = a determined game (Zermelo 1913):** value fixed before the first move,
game still played — the perfect passive's shape, and Isaiah 54:17's. **Lovelace, documented from the
1843 Notes (fourmilab, ledgered):** operation = any process altering mutual relations "of what kind
it may … all subjects in the universe"; the engine "might act upon other things besides number";
symbols carry "a retrospective and a prospective signification" (the perfect vs the future); and
**Note G is the limit that applies to the assistant** — "no pretensions whatever to originate
anything … no power of anticipating." "Poetical science" is her phrase from letters, *attributed*
(Toole 1992; letter not read). The author's paraphrase is a fair reading at that tier.

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
