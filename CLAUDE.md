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
`xiii-the-oldest-outlines-correlation-without-mechanism`** (toc 6 → 7 parts) — the seven dated outlines
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
