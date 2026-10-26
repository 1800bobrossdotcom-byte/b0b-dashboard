# kushner — C (page audit)

**Summary.** The page's Kushner lines are mostly right about the edges and wrong about the shape. Five findings matter.

- **The Indian Creek seat is real but stale.** It is documented in the village's own records: he is listed as "Council Member, Jared Kushner" in the minutes of the 21 May 2026 LPA and Regular meetings, absent from both. The start date of 8 July 2024 is attributed (Wikipedia, citing a village PDF that now 404s). **By 26 Oct 2026 he is not on the village's council roster, and the September 2026 ordinance vote blocks list four members without him.** How and when he left is not established. "Simultaneously serving as a senior figure in multiple White House administrations" is wrong: the seat began three and a half years after his formal White House office ended.
- **The Kushner → PIF → NEOM chain is anti-map.** Both of its edges are documented: PIF funds Affinity, and PIF owns the NEOM company. But no source read ties Kushner or Affinity to NEOM. The shared node is a sovereign fund, i.e. a hub (the guaranteed-null shape). "World's largest surveillance city" is a label plus an unsupported superlative, and NEOM is "substantially scaled down or suspended" (Wikipedia).
- **"The 'Kushner' most present in the files is Josh":** the only support in the repo is one unsourced line in `research/LATENT-ANALYSIS.md` (Aug 2026). It has no count, query or method. **Unsupported on the record held**, though not shown false. It cannot be re-run without jmail's API (author's call).
- **The Netanyahu-slept-at-the-Kushners story** traces to Jodi Kantor, *NYT*, 11 Feb 2017 (nytimes.com 403, null), as relayed by JTA on 13 Feb 2017: undated, no named source in the relay. Netanyahu's own on-record remark two days later is documented (White House transcript via UCSB): "Can I reveal, Jared, how long we've known you?"
- **Mueller line:** "exhaustively examined … no charges" is half right. No charges is correct. "Exhaustively" overstates: the report records that the Kushner and Gorkov accounts conflict, and that it "cannot rule out" that missing information would change the picture.

**Refused or null:**
- the 2024 village agenda PDF (404, old site path);
- nytimes.com (403);
- pif.gov.sa (403);
- state.gov (403);
- bilderbergmeetings.org (403);
- the Miami-Dade Property Appraiser API (decoy-200);
- 2017-2021.state.gov (decoy-200).

Beat A (money figures) and beat B (government roles) are marked where they occur and not graded here.

---

## 1. Indian Creek Village council: is or was he a member?

- **Documented, current roster (fetched 26 Oct 2026):** the village's "Mayor and Village Council" page lists Mayor Bernard Klepach, Vice Mayor Irwin E. Tauber, Council Member Irma Braman and Council Member Robert Diener. "Kushner" appears 0 times. The village site search for "kushner" returns no results, and so does its WordPress media search.
Q | https://indiancreekvillagefl.gov/government/village-leadership/mayor-and-council-members/ | The Mayor and Council Members are elected to represent the interests of the Village and its residents.
Q | https://indiancreekvillagefl.gov/government/village-leadership/mayor-and-council-members/ | Irwin E. Tauber
Q | https://indiancreekvillagefl.gov/government/village-leadership/mayor-and-council-members/ | Robert Diener
- **Documented, he was a member in May 2026.** The 8 Sept 2026 agenda packet carries the approved-for-consent minutes of the 21 May 2026 LPA meeting and Regular Council Meeting. In both roll calls he is listed as a council member. Pypdf layout extraction places "Absent" on his line and "Present" on Diener's. The plain extraction separates the two columns, so the absence was read from the layout pass, not from a quotable line. At that meeting the two incumbents whose seats were up (Klepach, Braman) were returned unopposed. His seat was not among them.
Q | https://indiancreekvillagefl.gov/wp-content/uploads/2026/09/AGENDA-complete-Regular-Council-Meeting-09-08-2026.pdf | Council Member, Jared Kushner
Q | https://indiancreekvillagefl.gov/wp-content/uploads/2026/09/AGENDA-complete-Regular-Council-Meeting-09-08-2026.pdf | No election was necessary as the two incumbents were the only ones to file for
Q | https://indiancreekvillagefl.gov/wp-content/uploads/2026/09/AGENDA-complete-Regular-Council-Meeting-09-08-2026.pdf | Bernard Klepach and Irma Braman were sworn in.
- **Documented, gone by September 2026.** The vote block of Ordinance No. 247 (budget, first reading 8 Sept 2026, second 22 Sept 2026) lists four members, with no Kushner line. The 22 Sept and 8 Sept budget packets contain "Kushner" 0 times.
Q | https://indiancreekvillagefl.gov/wp-content/uploads/2026/09/AGENDA-complete-Second-Budget-Hearing-09-22-2026.pdf | Council Member Robert Diener – Yes
Q | https://indiancreekvillagefl.gov/wp-content/uploads/2026/09/AGENDA-complete-Second-Budget-Hearing-09-22-2026.pdf | PASSED AND ADOPTED on first reading on the 8th day of September 2026.
- **Attributed: the start date.** Wikipedia says he succeeded Javier Holtz on 8 July 2024. It cites "COUNCIL MEETING, Monday, July 8, 2024, Indian Creek Village Hall" at an old village URL, which the spider got as **404** (refused; recorded). Wikipedia's Indian Creek infobox still lists him, citing a village roster page archived Jan 2026 (archive.org is unreachable here).
Q | https://en.wikipedia.org/wiki/Jared_Kushner | On July 8, 2024, Kushner succeeded Village of Indian Creek Vice Mayor & Village Trustee Javier Holtz, joining the Village council.
Q | https://en.wikipedia.org/wiki/Indian_Creek,_Florida | Robert Diener , Irma Braman , and Jared Kushner
TIER: membership documented, to 21 May 2026 at least (the village's own minutes); start 8 Jul 2024 attributed (Wikipedia; the primary is 404); **departure documented by absence** (the Sept 2026 vote blocks and the Oct 2026 roster). The date and manner of departure (resignation, vacancy) are **not established**: no resignation, vacancy or appointment item was found in the September packets.
SYMMETRY: no statement from Kushner or the village about the seat was found in sources read.
NULL: the 2024 agenda PDF (404); `/government/mayor-village-council-` and `/staff-directory` (404, old paths); the minutes of the 8 and 22 Sept 2026 meetings are not yet posted (they would sit in the next packet).

## 2. The Indian Creek block's framing, as it uses Kushner

- **"sits on the governing body of the island while simultaneously serving as a senior figure in multiple White House administrations":** wrong.
  - His formal office was the first Trump term (dates: beat B).
  - The seat begins 8 July 2024 (attributed).
  - The overlap is with the second Trump term only, where his status is the contested question beat B owns: "a private citizen with no official government role" (Drop Site) against Trump's "making Jared an envoy", per `KUSHNER-VF-POST.md` row 9.
  - "Multiple administrations" is wrong on any reading.
- **"Kushner (direct White House access across presidential administrations, …)":** overstated in the same way (beat B for the role).
- **"who has access to executive power (Kushner)" inside "They have infrastructure control":** a category error. The list says these residents control infrastructure, and Kushner is entered for *access*, not infrastructure. **The block also contradicts the page's own verdict in the same section** (`xii-the-verdict-…`): "What does not survive is the claim that enclave co-location itself is coordination." "Indian Creek's resident list is not a collection of unrelated wealthy individuals" is the claim the verdict kills. Anti-map.
- **"Affinity Partners $3B fund with Saudi PIF - the same sovereign fund that owns NEOM":** $3B is beat A (Wikipedia's $3bn is *total commitments by end 2021*, not PIF's; PIF's is $2bn). For NEOM, see §4.
Q | https://en.wikipedia.org/wiki/Affinity_Partners | Kushner's firm received commitments of more than $3 billion by the end of 2021
- **"A village of 84 people with a police force designed for a town of 500+":** "designed for" has no source, and no design document was found. The village's own police staff directory lists a Chief, two Captains, two Sergeants and six Police Officers (11 sworn), plus four Police Service Aides. The page's separate "13 officers" matches neither count. The directory may not be complete. **Names not carried.**
Q | https://indiancreekvillagefl.gov/police/police-staff-directory/ | Use the directory below to find contact information for Police Department staff.
- **"The island is a private government with the legal authority of a public one" / "private police → private government":** a naming error. It is an incorporated municipality (by act of the Florida Legislature, 17 May 1939, per Wikipedia), and its police are a municipal department. **Symmetry:** the village describes itself as "a private, residential municipality", so the phrasing has an official source in part. "Private police" has none.
Q | https://indiancreekvillagefl.gov/police/about-icvpd/ | Indian Creek Village is a private, residential municipality situated on a man-made barrier island along Biscayne Bay in northeastern Miami-Dade County.
Q | https://en.wikipedia.org/wiki/Indian_Creek,_Florida | The village has its own government and law enforcement.
- **"man-made island → private bridge → private police → private government → billionaires":** an arrow chain (anti-map). Each step is a different kind of fact, and two are mislabelled (see above).
- **Property:** the Kushner/Trump lot purchase could not be checked against public records. The Miami-Dade Property Appraiser owner-search endpoint returned **200 with a "Invalid request. No Valid URL is found." auto-submit form**, a decoy-200 candidate for `hosts.json` (not registered; repo not edited). Nothing on property is asserted here. No house number is recorded.
TIER: framing. Each bullet's verdict is given inline.
NULL: the Property Appraiser (decoy-200).

## 3. "the 'Kushner' most present in the files is Josh, the VC brother, not Jared" (IV)

- **Repo support:** exactly one line, `research/LATENT-ANALYSIS.md:124` (thread 4, Aug 2026): `Corpus "Kushner" = mostly Josh (VC brother), NOT Jared.`
  - It records no count, query string, date range or method.
  - No other research file carries Josh Kushner, Thrive Capital or Oscar Health: a grep of `research/` for those terms returns only that line.
  - §4 of CLAUDE.md adds that jmail search returns ~500 characters per body, so any earlier count is a floor.
- **Not re-run:** the jmail `/api/` is robots-disallowed and held for the author's decision.
TIER: **unsupported on the record held.** It is a comparative count claim with no published count. It is not shown false, and a guard against confusing Jared with Josh is sound in itself.
FIX (direction only): drop "most present" unless a count is produced by a method the author approves, or carry it as an unquantified identity guard.
NULL: the corpus (not queried by instruction).

## 4. "Jared Kushner - 3 nodes …" and "Kushner connection → Saudi PIF → NEOM surveillance city" (xref-calibration, xref-epstein)

- **Node 1, "Trump White House Senior Advisor":** beat B.
- **Node 2, "Affinity Partners ($3B, Saudi PIF anchor investment)":** beat A for the figure. "Anchor" is not graded here.
- **Node 3, "Indian Creek Village council member":** stale; see §1. It was true from 8 Jul 2024 (attributed) to at least 21 May 2026 (documented), and he is not a member as of the September 2026 records.
- **PIF owns NEOM:** attributed. Wikipedia: the NEOM company was established 29 Jan 2019, "wholly owned by the Public Investment Fund". PIF's own NEOM page refused the spider (403). neom.com's About page names neither PIF nor Kushner.
Q | https://en.wikipedia.org/wiki/Neom | is wholly owned by the Public Investment Fund , the Saudi government’s sovereign wealth fund .
- **Kushner/Affinity ↔ NEOM:** **no edge in any source read.**
  - Wikipedia's Affinity Partners article mentions NEOM 0 times, and its NEOM article mentions Kushner and Affinity 0 times.
  - `KUSHNER-VF-POST*` and `TRUMP-FAMILY-POST*` mention NEOM 0 times.
  - A WebSearch (used for finding only) surfaced no Affinity–NEOM link.
  - The PIF→Affinity money also runs toward Kushner, not from him; the page's own VII line says "they did not command it".
- **"the world's largest surveillance city":** "surveillance city" is a researcher's characterization (Vincent Mosco, in a Reuters piece of 23 Aug 2022, per Wikipedia), so it is labeled. "World's largest" has no source. The present tense is stale: Wikipedia says the project was substantially scaled down or suspended by 2025.
Q | https://en.wikipedia.org/wiki/Neom | it is, in effect, a surveillance city
Q | https://en.wikipedia.org/wiki/Neom | By 2025, the megaproject had been substantially scaled down or suspended.
TIER: chain **anti-map**. Edge Kushner→Affinity←PIF: documented (beat A). Edge PIF→NEOM: attributed (ownership). Kushner→NEOM: unsupported. A shared sovereign investor is a hub, and the same fund holds hundreds of positions. This is the guaranteed null the Malka pass found for Apollo and JPMorgan.
SYMMETRY: none needed; no allegation is made against NEOM or Affinity here.
NULL: pif.gov.sa (403).

## 5. Netanyahu and the Kushner family home

- **Earliest on-record source found:** Jodi Kantor, *New York Times*, 11 Feb 2017 (**403, unread**). It is relayed by JTA on 13 Feb 2017: the stay is **undated** ("she doesn't specify when"), and the relay names no source for it.
Q | https://jta.org/?p=1326882 | Jared Kushner once lent Benjamin Netanyahu his bed.
Q | https://jta.org/?p=1326882 | One time, Kantor reports – she doesn’t specify when – Jared gave up his bed and moved to the basement so Netanyahu could spend the night at their home in Livingston, New Jersey.
Q | https://jta.org/?p=1326882 | Netanyahu has long been a friend of the Kushners, and particularly Jared’s dad, Charles Kushner, a major donor to pro-Israel and Jewish causes.
Q | https://jta.org/?p=1326882 | February 13, 2017
- **Documented, Netanyahu's own words.** At the joint press conference of 15 Feb 2017 he joked about how long he had known Jared. This is the "known him since he was a boy" remark that later retellings (e.g. *Times of Israel*, 25 Mar 2017, via Wikipedia) paraphrase.
  - The UN UNISPAL copy of the White House transcript elides this passage with "/…".
  - The American Presidency Project carries it in full.
Q | https://www.presidency.ucsb.edu/documents/the-presidents-news-conference-with-prime-minister-benjamin-netanyahu-israel | Can I reveal, Jared, how long we've known you? [ Laughter ] Well, he was never small. He was always big.
- **Also relayed by JTA (attributed to the NYT):** Charles Kushner joined the Sept 2016 Netanyahu–Trump meeting.
Q | https://jta.org/?p=1326882 | Charles Kushner joined the meeting in September of Netanyahu, Trump and Jared Kushner, the Times reported.
TIER: the overnight stay is **attributed** (one newspaper, undated, unread at source). The long family acquaintance is **documented** in Netanyahu's own words. **Naming guard:** the friendship is recorded as chiefly the father's (Charles), so it should not be moved onto Jared as a political tie.
SYMMETRY: no statement from the Kushner family about the stay was found in sources read. Kushner's memoir *Breaking History* (Aug 2022) is unread.
NULL: nytimes.com (403).

## 6. Mueller line (IV): "the 2016 Kislyak/Gorkov/Trump-Tower meetings … exhaustively examined by Mueller and produced no charges"

- **Documented:** Vol. I examines Kushner's 1 Dec 2016 Trump Tower meeting with Kislyak (with Flynn), the 13 Dec 2016 meeting with VEB's Gorkov, and the 9 June 2016 Trump Tower meeting, which he attended. No one was charged over those contacts.
- **Overstated, "exhaustively":**
  - On Gorkov the report leaves the purpose unresolved: Kushner said diplomatic, while VEB's 2017 statement said business.
  - At the Kislyak meeting, Kushner asked to use secure facilities at the Russian Embassy, and Kislyak rejected the idea.
  - The report states its own gaps.
Q | https://www.justice.gov/storage/report_volume1.pdf | The accounts from Kushner and Gorkov differ as to whether the m eeting was diplomatic or business in nature.
Q | https://www.justice.gov/storage/report_volume1.pdf | Kushner asked Kislyak if they could communi cate usmg secure facilities at the Russian Embassy
Q | https://www.justice.gov/storage/report_volume1.pdf | the evidence was not sufficient to support criminal charges
Q | https://www.justice.gov/storage/report_volume1.pdf | the Office cannot rule out the possibility that the unavailable information would shed additional light on (or cast in a new light) the events described in the report
(The quotes keep the PDF's OCR artefacts, which are verbatim to the extraction.)
TIER: "no charges" documented. "Exhaustively examined" overstated.
FIX (direction): "examined in Mueller Vol. I; no charges; the Gorkov meeting's purpose is disputed between Kushner and VEB, and the report records gaps."
SYMMETRY: Kushner's account (diplomatic, no business discussed) is in the report beside VEB's.
- **The Dec 2025 Moscow session, "accredited envoy diplomacy":** beat B.

## 7. Bilderberg 2019 (XII layer 2): "Kushner attended Bilderberg 2019 with the administration delegation"

- Kushner was at the 67th meeting in Montreux (30 May–2 June 2019), arriving from his Middle East tour. Pompeo joined, with "at least two senior Pentagon officials and two senior members of the National Security Council" (AP via Fox Business, 1 June 2019; RSI the same day).
Q | https://www.foxbusiness.com/markets/pompeo-visits-elite-event-as-trump-policies-raise-questions | U.S. Secretary of State Mike Pompeo on Saturday joined Jared Kushner at a closed-doors meeting of the Bilderberg Group in the Swiss resort of Montreux
Q | https://www.rsi.ch/info/svizzera/Al-Bilderberg-Pompeo-e-Kushner--1154725.html | c'è anche Jared Kushner, genero e consigliere stretto di Donald Trump
TIER: attendance **attributed** (AP and RSI). The page cites the "official … participant lists", but the official 2019 list refused the spider (403), so the page's sourcing line is unverified from here. The page's own grade ("weaker than a wire transfer") is right.
NULL: bilderbergmeetings.org (403). Wikipedia's participant list mentions Kushner 0 times.

## 8. Other page lines touching Kushner

- **IV, "Bannon and Kushner are documented rivals (the 2017 West Wing feud)":** not checked this pass (null). `LATENT-ANALYSIS.md` cites *Fire and Fury*, a book of contested sourcing. If kept, attribute it.
- **VII apex, "When MBS personally overruled PIF's own screening panel to fund Affinity":** beat A.
- **VII sovereign-wealth hub, "PIF → Kushner. July 2021 … $2B … QIA … Lunate … House Oversight probe":** beat A (the date is already flagged as June 2021).
- **XII layer 2, "$2B … ~$4.8B AUM":** beat A.
- **XII verdict, "PIF–Kushner, MGX–Witkoff":** the edges are beat A. The framing is consistent with §4 above.
- **xref-calibration, Trump entry, "Kushner connection → Saudi PIF ($3B Affinity Partners) → NEOM surveillance city":** the $3B is beat A. The chain is anti-map (§4). "$3B Affinity" is also mis-assigned to PIF: PIF's commitment is $2bn, and $3bn is total commitments (beat A).
- **xx asset-relocation, "sovereign wealth connections (Saudi PIF, Kushner/Affinity Partners)" listed as resources to move people underground:** this places a living, uncharged person's firm in a hypothesis about covert relocation of individuals. It is an implied operational tie with no document. It touches the living-person floor and is **anti-map**. Flagged for the author.
- **Map marker "Indian Creek Island, Florida":** the ctx says "Jared Kushner (a village council member)", carried over from the 2 Oct VERITAS pass, which relied on Wikipedia. It is now stale (§1).
- **Map marker "Ghawar Field":** "put a reported $2 billion into Jared Kushner's Affinity Partners" is beat A. Tying it to an Aramco shareholder line is co-location, not a deal.

## Page lines → verdicts

| Block | Page wording (short) | Verdict | Source |
|---|---|---|---|
| XII Indian Creek, residents | "Jared Kushner (village council member …)" | **stale**: member from Jul 2024 (attributed) to at least May 2026 (documented); off the roster by Sept–Oct 2026 | village roster; minutes of 21 May 2026; Ord. 247 vote block |
| same | "while simultaneously serving as a senior figure in multiple White House administrations" | **wrong**: the seat postdates his formal office; "multiple" is unsupported | §1–2; beat B |
| XII convergence | "Kushner (direct White House access across presidential administrations …)" | **overstated** (beat B) | — |
| same | "who has access to executive power (Kushner)" / "not a collection of unrelated wealthy individuals" | **anti-map**; contradicts the page's own XII verdict | page XII verdict |
| same | "Affinity … $3B fund with Saudi PIF - the same sovereign fund that owns NEOM" | $3B beat A; the NEOM tie is **anti-map** | §4 |
| XII structure | "police force designed for a town of 500+"; "private government"; "private police" | **unsupported / naming error** | village police pages; Wikipedia |
| IV | "the 'Kushner' most present in the files is Josh" | **unsupported** on the record held | LATENT-ANALYSIS.md:124 only |
| IV | "exhaustively examined by Mueller and produced no charges" | no charges **correct**; "exhaustively" **overstated** | Mueller Vol. I |
| IV | Bannon–Kushner "documented rivals" | not checked (null) | — |
| XII layer 2 | Bilderberg 2019 attendance | **correct at attributed tier**; the official list was not read | AP/Fox Business; RSI |
| xref-calibration | "Indian Creek Village council member" (node 3) | **stale** | §1 |
| xref-calibration | "sovereign fund that owns NEOM - the world's largest surveillance city" | ownership attributed; "largest" **unsupported**; "surveillance city" **labeled**; project scaled down | Wikipedia (NEOM) |
| xref-epstein / Trump entry | "Kushner → Saudi PIF → NEOM" | **anti-map** (hub) | §4 |
| xx asset relocation | Kushner/Affinity as a resource for underground relocation | **anti-map; living-person floor**, flagged | — |
| VII / XII money lines | PIF date, $2B, $3B, $4.8B, QIA/Lunate | beat A | — |
| IV Moscow, Senior Advisor | roles | beat B | — |

## 3. Omissions a graded record would carry (one line each; no page text drafted)

- **His departure from the Indian Creek council** between 21 May and 8 Sept 2026 (village minutes and Ord. 247 vote block). The page carries the seat as current.
- **The Gorkov/VEB meeting's disputed purpose:** diplomatic (Kushner) against business (VEB, 2017). Mueller Vol. I §IV.B.4.
- **The secure-facilities request to Kislyak, refused by Kislyak** (Mueller Vol. I §IV.B.3).
- **Mueller's own statement of gaps** ("cannot rule out …"), which bears on the page's "exhaustively".
- **Netanyahu's on-record "how long we've known you"** (15 Feb 2017 transcript). The friendship is documented as chiefly with Charles Kushner (JTA relaying the NYT).
- **Charles Kushner's 2004 plea, 2005 sentence, Dec 2020 pardon and 2025 ambassadorship to France.** The page names Charles Kushner 0 times, so it has no guard against Jared/Charles confusion. Sources already read: `TRUMP-FAMILY-POST-B-COHN-KUSHNER-WORDS.md` (justice.gov 2005 release; trumpwhitehouse.archives.gov clemency statement).
- **The Abraham Accords (2020), the documented diplomatic act he is best known for** (page: 0). Primary not read this pass: state.gov 403, and 2017-2021.state.gov served a "Technical Difficulties" decoy-200. Register it beside the other state.gov archives.
- **The Electronic Arts take-private with PIF and Silver Lake (Sept 2025)** (page: 0). Beat A; only Wikipedia's citation of the *FT* was seen.
- **The Josh/Jared guard has no count behind it.** If kept, the method belongs beside it (author's jmail decision pending).

## Killed or not established

- Kushner or Affinity has any NEOM role: **not established** in any source read.
- Kushner was on the Indian Creek council while holding White House office: **killed** for the first term (the seat began 2024). The second term is beat B's question.
- Kushner is a current Indian Creek council member: **killed as of Sept–Oct 2026** (village records).
- "World's largest surveillance city": **unsupported** superlative.
- The Netanyahu overnight stay is a dated, sourced fact: **not established** (undated, one newspaper, unread at source).
- "Most present in the files is Josh": **not established** (no count on record).

## WITHHELD

- The names of the Indian Creek police staff and the residents' house numbers (the minutes carry two residents' house numbers in the audience list; not copied).
- Any Kushner/Trump property address. Not looked up further after the appraiser decoy.

## Spider notes (not edited; for the author)

Decoy-200 candidates found:
- the Miami-Dade Property Appraiser proxy (`PaServicesProxy.ashx`), an "Invalid request" auto-submit form with HTTP 200;
- `2017-2021.state.gov`, title "Technical Difficulties", ledgered as `ok`. The 2009-2017 and 2021-2025 archives are already registered; this one is not.
