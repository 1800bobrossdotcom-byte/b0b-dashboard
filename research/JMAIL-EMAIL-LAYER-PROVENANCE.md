# jmail.world EMAIL LAYER — PROVENANCE PROBLEM (open, action required)

Internal research record, 29 Aug 2026. NOT published. Lives in `research/`, outside
`site/`, never served.

## THE FINDING IN ONE LINE

The jmail.world **email** layer contains at least two distinct id namespaces. One
resolves to government documents. The other does not — and **four quotes the report
has already published as documented/primary corpus email come from the one that does
not.**

## THE NAMESPACES

| namespace | example | resolves to justice.gov? | Bates in body? |
|---|---|---|---|
| `EFTA########` | `EFTA02634615` | **yes** | sometimes |
| `vol#####-efta########-pdf` | `vol00011-efta02634615-pdf` | **yes** | sometimes |
| `HOUSE_OVERSIGHT_######` | `HOUSE_OVERSIGHT_033091` | n/a (House release) | n/a |
| **`[0-9a-f]{32}`** (content hash) | `04ae87d3818260b0fc634aecc2a2a561` | **no** | **never observed** |

The hex32 set: ~506 threads harvested, dates spanning **2006–2021** (not 2005–08 as
first characterised), sender overwhelmingly `J. Epstein` / `jeeproject@yahoo.com`.

## THE TEST, AND ITS CONTROL (the control is the point)

Method: take a distinctive 100-char non-quoted phrase from an email, search the email
layer, check whether the same text appears under a *production* id.

- **hex32 emails: 0 of 14** had a verbatim match under a production id.
- **CONTROL — known production emails re-found by the same method: 7 of 14.**

So the method has a ~50% false-negative rate, and 0/14 vs 7/14 is a real difference
(Fisher exact ≈ p 0.003). **This is evidence of separate origin, not proof of it.**
Stated that way deliberately: earlier in the same session a `documents/read`
"Not found" was nearly treated as a provenance signal when the control showed the
endpoint simply does not serve the email layer at all.

## SELF-AUDIT — WHAT THE REPORT PUBLISHED FROM WHICH NAMESPACE

| published quote | namespace | status |
|---|---|---|
| Kahn, 6 Nov 2007, "Wexner Childrens Trust II … two wires … 18,000,000" | **hex32** | **unverified** |
| Indyke "May I give Peg your approval" / Epstein "yes" (6 Jun 2006) | **hex32** | **unverified** |
| Abigail Wexner, 24 Nov 2007, "I spoke to Darren and told him not to worry" | **hex32** | **unverified** |
| Indyke, 26 Dec 2007, C.O.U.Q. Form 1023 / "the entity taking the grant" | **hex32** | **unverified** |
| Indyke/Moses, 8 Dec 2005, "pursuant to the Book Agreement with TWF" | **not re-findable at all** | **unverified** |
| Indyke, Mar 2019, "controlling person of the STC" / "did not want your name" | `EFTA02634615` | **OK — production** |
| Bronfman → Ron Senator, "a brilliant money manager" | `EFTA02418583` | **OK — production** |

The Carbyne/Southern Trust and Bronfman items are sound. **Five items are not
currently traceable to a government document.**

## WHAT WAS TRIED AND FAILED TO CONFIRM THEM

- Document-layer search on the topics **does** return real EFTA PDFs with justice.gov
  URLs (`Wexner Childrens Trust` → EFTA01118864; `COUQ Foundation` → EFTA00729687;
  `Peg Ugland` → EFTA00219379). **The subject matter is genuinely in the production.**
- Reading those documents did **not** surface the quoted strings — but
  `documents/read` **truncates at 8,000 characters** and three of the four candidates
  hit the cap exactly. A miss is therefore consistent with truncation.

**Conclusion: failure to verify, not proof of absence.** The quotes may well be
genuine and simply sourced by jmail from an ingest (estate production, court exhibit
set) that its search layer does not expose.

## WHY THIS MATTERS ENOUGH TO ACT ON

The report **refuses** epstein-data.com and the `rhowardstone/Epstein-research`
numbers on precisely this ground — figures that trace nowhere. It cannot apply that
rule outward and not to itself. Four passages currently present as *primary corpus
email* material that cannot be re-derived from any government document.

The Barak/TWF item is the sharpest, because the report used it explicitly to **upgrade**
the Wexner-Foundation→Barak payment from "reported, single-outlet" to documented, and
stated that it cuts against the Foundation's 2020 statement to Israel's High Court.
That upgrade currently rests on an unverifiable source.

## NEXT STEP (recommended, not yet done)

Verify against **primary justice.gov PDFs by Bates number**, the method already used
successfully for the Iran iMessages (`EFTA01211330`) and the Regina Dugan thread:
fetch `https://www.justice.gov/epstein/files/DataSet%20N/EFTA########.pdf` with the
`justiceGovAgeVerified=true` cookie and a browser UA, extract with `pypdf`, and grep
for the quoted strings. Candidate Bates numbers from the topic searches above.

Outcomes:
- **Confirmed** → add the Bates citation to each passage; tier stands; problem closes.
- **Not confirmed** → downgrade each from documented to a labelled lower tier with the
  provenance stated, or remove. The C.O.U.Q. item is load-bearing for the "$46M
  back-flow instrument" line and the Barak item for the High Court contradiction, so
  both need an explicit tier line rather than a silent edit.

**Do not leave the passages as they stand.** Either they get their Bates numbers or
they get their caveat.

## STANDING RULE ADDED

Any quote taken from the jmail email layer must record its **doc_id namespace** at
capture time. A hex32 id is a research lead, never a citation.

---

# ADDENDUM — a clean counter-example, verified the right way (29 Aug 2026)

The author supplied a primary URL for a designer-baby funding solicitation. It is
the **opposite** of the problem above, and it demonstrates the method that closes it.

- **EFTA01003966** — `justice.gov/epstein/files/DataSet 9/EFTA01003966.pdf`
  - fetched with `justiceGovAgeVerified=true` + browser UA → HTTP 200, 64,513 bytes
  - SHA-256 `ce7a9f3f6ede9c0b5a8cbb42ba7724ac691354d4c64034e1c581f9210e012a49`
  - `pypdf` extract carries the Bates stamp `EFTA01003966` at the foot
  - text matches the author's screenshot exactly; OCR renders `gmail`→`grnail`,
    `$1.7m`→`$1.7rn`, `~`→`—`/`--`. Extraction artifacts, not variants.
- Thread continues, same method, DataSet 11:
  - **EFTA02604748** (16 Aug 2018) SHA-256 `0b42c9ef13edcba1cba313f5efb426afc9e722ddb6f2a0947cf30e2bdb3201e1`
  - **EFTA02625950** (30 Aug 2018) SHA-256 `bb8c84bce65013d59de4507b7a274be5eea47e1497eefb3b0573e7088aa77bb6`
  - **EFTA02603821** (13 Aug 2018), **EFTA02625511** (30 Aug 2018) — resolved, not hashed.

Published in Section VI as "The costed proposal". The contrast is the point: this
quote is citable because a Bates number resolved to a government PDF whose bytes
were pulled and hashed. The five items flagged above still have no such anchor.

---

# ADDENDUM 2 — two corpus-reading specimens (29 Aug 2026), both author-supplied

- **EFTA00165018–EFTA00165024** (DataSet 9, 7pp, 29 Dec 2020) — SHA-256
  `766f3df3bfae2a33707553ea884af92cd19c5945b53f7d3096903c18ea6598d5`.
  Unsolicited public tip to the FBI ("[EXTERNAL EMAIL] - Hello again") forwarding
  phone screenshots: adrenochrome/organ harvesting, an "underground temple" sealed
  behind a painted fake door, blood in black buckets, children killed for mind
  control. Third-hand, ultimate source recounting age-four memories. **Names a
  living, uncharged scientist at a major university.** NAME AND ALLEGATION NOT
  PUBLISHED AND NOT TO BE — anonymous, uncorroborated, defamatory.
  → Published as the Section I guardrail, described structurally only.

- **EFTA01850400–EFTA01850401** (DataSet 10, 11 Nov 2011) — SHA-256
  `daa41913f5210ff476b083eb4e15243a29f4f571050c616dc51cf10a35fa9cec`.
  Genuine Epstein email; a correspondent sends a Christie's lot photo: Sex Pistols
  banned promo poster *Young Flesh Required*, Great Rock 'N' Roll Swindle, Virgin
  1979, GBP 1000–1200. **Checked: it is a Jamie Reid 1979 American-Express-card
  parody attacking record-label exploitation — "The Artist (The Prostitute) … the
  Record Company (The Pimp)" — held by MoMA, banned because Amex sued Virgin over
  the trademark.** The title means the reverse of what the inbox implies.
  Correspondent referred to as "a correspondent"; not identified, as the name is
  ambiguous and identification would be speculation.
  → Published as the guardrail's second specimen.

The pair is the point: specimen one is material that was never evidence; specimen
two is a genuine Epstein document whose contents mean something other than the
context suggests. Neither error is caught by verifying the document — only by
identifying what it is about.

---

# ADDENDUM 3 — the "=" in the emails is quoted-printable, and it breaks search (29 Aug 2026)

Author question: many emails show `=` replacing a letter mid-word — is it a cipher?
**No.** It is MIME **quoted-printable** (RFC 2045) soft line breaks, surviving the
print-to-PDF pipeline undecoded, with the adjacent character lost.

## Three measurements

1. **Spacing.** In EFTA02597523 the `=` marks fall at mean **72.0** chars
   (median 72, σ 7.6, n=18). Quoted-printable wraps encoded lines at **76** and
   marks each wrap with a trailing `=` the decoder should delete with the newline.
   A margin, not a message.
2. **Mapping.** In that one email `=` stands for **13 distinct characters**
   (a×4, t×3, l×2, f×2, S, A, W, c, i, o, e, d, h) — roughly English letter
   frequency. A substitution cipher is one-to-one; this is one-to-whatever.
3. **The clincher.** EFTA02613636 carries the same address twice in one line:
   display text `j=evacation@gmail.com`, adjacent `mailto:` href
   `jeevacation@gmail.com` intact. Flowed text wrapped; URL attribute did not.
   A cipher encodes both.
   Direct signature also present: `=C2=A0` (UTF-8 nbsp) undecoded.

## The consequence — this is the publishable part

**The encoding breaks keyword search.** Tested:
- `cloning` → does NOT return EFTA02603821 ("human clon=ng company")
- `laboratory` → does NOT return EFTA02597523 ("a research =aboratory")
- `architecture` → does NOT return EFTA02597523 ("school of =rchitecture")

Three for three. So corpus mention-counts are wrong **in both directions**:
inflated by inbound public tips that were never evidence (Addendum 2), deflated by
encoding damage that hides real hits. **Any null this report states — "X does not
appear in the corpus" — is the limit of a search, not the contents of an archive.**
Published into the Section I guardrail.

## Documents hashed this pass
- EFTA02597523 (DataSet 11, Joi Ito→Epstein 5 Aug 2018)
  `57c91529727ecf4eb82c2fc78ccd6b15ac4a2980733f38b112e706d55d36d95b`
- EFTA02613636 (DataSet 11, Epstein↔Ken Starr 23 Nov 2018)
  `82086ed29a2a59c63e2623a8b645e4f3c543be1965e31667ccdb1b14bdbad608`
  — substantively: a theological/First-Amendment exchange on Masterpiece Cakeshop
  and compelled speech; documents the Starr relationship persisting to Nov 2018,
  eleven years after the 2007 NPA. Starr d. 2022. Not yet published.

---

# ADDENDUM 4 — EFTA02486591: a primary anchor for Epstein in London, 1985

`justice.gov/epstein/files/DataSet 11/EFTA02486591.pdf`
SHA-256 `d1668bc3ef1967579509d0be275209a49ab7294012bf73df42aa08e2eb53f58e`

23 Sep 2015, Mark L. Epstein (izmo@mindspring.com) → Jeffrey Epstein
(jeevacation@gmail.com), subject "Re: pope". Private family email about Pope
Francis's NYC visit and Mark's upcoming travel.

**THE FINDING.** Mark writes: *"I haven't been in London since I visited you there,
with Paula and Seymour, in 1985."* Paula (1918–2004) and Seymour (1916–1991)
Epstein were their parents. **This places Jeffrey Epstein in London in 1985**, with
his brother and both parents visiting him there.

Why it matters: Section II's recruitment-window subsection rested the London limb
entirely on *Epstein's Shadow* (2021) — attributed tier, unnamed sources, a
production team's conclusion, contested by Ghislaine Maxwell's 2016 deposition.
This is a better class of evidence: a private family email inside the government's
own production, written by someone not testifying, not interviewed, with no motive
to place his brother anywhere — he is reminiscing and complaining about London.

**Bounds held in the published text:** establishes presence in 1985 and nothing
else. No Robert Maxwell, no Ghislaine, no business, no intelligence. On
Ben-Menashe it corroborates nothing — it removes one specific objection (that
Epstein had no business being in London that decade). An objection removed is not
a claim established.

**NOT PUBLISHED from this document:** a crude private remark about a named living
woman ("Aldine") — private, living, zero analytical value. Excluded entirely.

Also present and not used: Epstein replying that he would invite the Pope "for a
massage" — "massage" being the operative euphemism across the whole Palm Beach
record. Held; it characterises rather than documents, and the report has the
Bannon "tier one" exchange already doing that work.

---

# ADDENDUM 5 — EFTA02446088: the scope of the Black engagement

`justice.gov/epstein/files/DataSet 11/EFTA02446088.pdf`
SHA-256 `35d84546727c160698fd2fd5b755f164107d18074f490fd66f38fb5c9dee8686`

24 Oct 2016, Epstein → **Melanie Spinella**, Leon Black's executive assistant
(confirmed: assistant to Black; Epstein's team later named her co-trustee of a
Black trust; named in a 2025 Senate Finance records request; uncharged).

Content: agreement with "brad" (Brad Wechsler, already in the report) that
decisions "need to be made"; "1031 asap"; an E&Y retirement making it "more
important for [X] to come on board"; a work programme — "gift tax, brh, tra,
shareholders agreements 8865, rega, phaidon, art sales, art partnership, trust
distributions, family meeting"; and the verdict: *"very few things on the two
years old list actually got done. your 5 billion dollar operation is in the hands
of"* three named advisers.

**Why it is additive:** the report already documents Epstein *in the decision loop*
(the APO1 GRATs, "Leon did not want to sign anything until he spoke with"
Epstein). This documents him *auditing the family office and its staffing* — a
broader role than advisory. Phaidon is Black's (acquired 2012), which corroborates
the recipient identification independently.

**Cuts both ways and is published that way:** corroborates Dechert/Black that the
engagement was real and substantive; and names, in Epstein's own hand, the
structuring Senate Finance has been sizing (Form 8865 = foreign partnerships,
beside 1031, gift tax, trusts).

**NOT published:** the three advisers Epstein disparaged — private, living,
uncharged; a dead man's complaint about their pace is not a finding about them.

**Markup note:** first attempt inserted `</p><p>` inside an `<li>` and left a
`<span>` unclosed (tag-balance check caught it, 495/494). Reverted and redone as
sibling `<li>` items. The balance check is why it never shipped.

---

# ADDENDUM 6 — EFTA00747383: a second sitting DARPA official in the corpus

`justice.gov/epstein/files/DataSet 9/EFTA00747383.pdf`
SHA-256 `8b3f1bcee716f651cbfc4c9cf336396009a24d8b81df650169e2b3b2c25baaaf`

27 Mar 2010, Dan Dubno (technologist, ex-CBS News) ↔ Epstein. Dubno proposes a
crypto workshop — anti-censorship tooling for scientists and human-rights workers
under authoritarian regimes — and lists participants: *"A bunch of Israeli hackers
are in this with me as well as the chief disruption officer at Darpa, Dr. Peter
Lee."* Plus the quid pro quo: *"I'd design this so you'd get your questions
answered if you'd help me get mine."*

**VERIFIED:** Peter Lee directed DARPA's Transformational Convergence Technology
Office **Aug 2009 – Sep 2010** (on leave from CMU; TCTO remit: social media,
synthetic biology, machine learning, computational social science). He was in post
on 27 Mar 2010. "Chief disruption officer" is Dubno's phrasing, not a title.

So the corpus carries **two DARPA officials named while serving** — Dugan
(2011–12, via Nikolic) and Lee (Mar 2010, via Dubno) — through unrelated channels.

**FLOOR:** Lee is living, uncharged, named by a third party as an expected
participant in someone else's proposed workshop. Nothing shows he met Epstein,
knew of him, or that the workshop happened. Dubno living, uncharged. "Israeli
hackers" unnamed, Dubno's own collaborators, nothing built on them.

**GUARDRAIL APPLIED IN PUBLIC:** the line *"ramp em out to make discovery more
difficult"* reads as legal discovery in this inbox and plainly means **detection**
in its own paragraph. Published with the correction attached, as a live worked
case of the Section I guardrail.

**NOT PUBLISHED:** a gratuitous remark about a named living woman's appearance —
cruel, private, zero analytical value; and her name, which would attach her to
Epstein for no gain. Excluded entirely.

---

# ADDENDUM 7 — Fenwick: the money moved, and Goldsmiths refused it

Correction to Addendum 6's framing. Published first as a solicitation; it was a
funded project, and an institution declined the larger gift.

**DOCUMENTED (verified here, hashed):**
- EFTA01059474 (DataSet 9, 10 Dec 2016) `fd655b193e456f07d5a8389a1cede794e860d53a4aa9cb62cd9d3f1623da8e40`
  — Fenwick → Epstein, "Hyperscanning Grant", the 2-page proposal.
- EFTA00504063 (DataSet 9) `94f9a198de38970afac9315ceaeb02b9841d0df3ba1730e59ffaf5de4bf728cc`
  — Lesley Groff (NPA-immunised assistant) forwarding the Fenwick thread. Shows the
  channel was administered from Epstein's office.

**REPORTED (CIReN / Sigmalive Cyprus; UK press) — NOT re-derived from DOJ PDFs:**
- Sept 2016: introduction made by an academic at a Hong Kong university.
- £85,000 draft proposal to **Goldsmiths, University of London**, from Epstein's
  **"Enhanced Education"** vehicle.
- £20,000 to a Cypriot co-investigator; £6,500 invoiced Mar 2017 for EEG analysis.
- **22 Feb 2017: £15,000 transferred to Fenwick as a "starter grant."**
- **Late Mar 2017: Goldsmiths' Ethical Committee for Acceptance of Gifts REFUSED
  the donation.**
- Study subjects were to be a French spiritual teacher and his students — which is
  what the "Alain" first-name reference in the 10 Dec email points to.

**WHY IT MATTERS — the institutional tally is now the finding.** Four bodies ran a
check on Epstein and got a clear answer: Fidelifacts 1976 (fabrication documented,
brokerage promoted him anyway); the banks across ~15 years (late, thin, or no
SARs); 23andMe 2017 (queried a bulk order, disbelieved the answer, killed it);
Goldsmiths 2017 (refused the gift). **The two that acted were a consumer genomics
company and a university ethics committee. The two that did not were a Wall Street
brokerage and several of the largest banks on earth.**

**FLOORS:** the Hong Kong academic, the Cypriot co-investigator and the French
teacher are living, uncharged, and are NOT named in the published text — seeking
or receiving a research grant is not misconduct.

**Not chased:** a UK press story about a Highlands property used to tempt Epstein
to a Scottish retreat. Open lead.

---

# ADDENDUM 8 — EFTA01632670: stopped, deleted, not examined (29 Aug 2026)

`DataSet 10/EFTA01632670.pdf` — 17 MB, **100 pages**, Bates range
EFTA01632670–EFTA01632769. Fetched, then **deleted without the images being
viewed**.

**Why.** Text extraction returned almost no prose — the document is essentially
page images. What little OCR surfaced is the furniture of pornographic websites
("Live Sex Cams", "Popular Categories", channel names, Viagra ad copy), i.e. a
capture of web browsing, probably forensic, from a seized device.

**The standing rule applies and is not negotiable.** `research/OCR-DOCUMENT-LAYER.md`
records that the image layer of this corpus was deliberately NOT mined: it is a
redaction-heavy archive in which a large share of the imagery is victim-related and
explicit, and the report's core discipline is never to touch victim imagery or
identify victims. A 100-page image document from this production, whose incidental
OCR is adult-site chrome, is exactly the class that rule exists for. **Verifying
everything yields here; this is the one place it must.**

**What can honestly be said without looking, and it is not nothing.** The presence
of a hundred-page browsing capture in the production is another corpus-composition
datapoint of the kind the Section I guardrail now covers: the DOJ release is a case
file, and case files contain device forensics, not just correspondence. A Bates
number in this range certifies that the government holds a page. It says nothing
about authorship and nothing about relevance.

**Standing rule, restated:** if extraction shows a document is substantially
imagery rather than text, stop, delete, record. Do not render, do not view, do not
describe beyond what incidental OCR already surfaced.

---

# ADDENDUM 9 — EFTA01249940: FBI 302, victim interview. Stopped, deleted, nothing retained (29 Aug 2026)

`DataSet 9/EFTA01249940.pdf` — 7 pages, Bates EFTA01249940–EFTA01249946.
Fetched (after an Akamai 401 and a backed-off retry), identified, **deleted**.
**Nothing from it is quoted, summarised, or carried anywhere.**

**What it is, at the only level of detail that is safe to record:** an **FBI FD-302**
— an interview report — of a survivor, conducted **19 August 2021** at SDNY under a
**proffer agreement**, with Assistant US Attorneys present, and stamped
**"SUBJECT TO PROTECTIVE ORDER PARAGRAPHS 7, 8, 9, 10, 15, and 17."** The
interviewee's name is redacted. The narrative is not, and it is richly
identifying.

**Why it stopped there.** The report's core discipline: never publish victim
material, never de-anonymise a victim, never identify one. Redaction of a name does
not anonymise an account this specific — the surrounding detail would identify her
to anyone who knew her, which is precisely why the protective order exists. This is
not a close call and it is not squeamishness.

**Also cleared in the same pass:** the scratch harvest of hex32 email bodies
(`/tmp/yh/`), which contained private correspondence with named private individuals
gathered while testing provenance. It had served its purpose; keeping it had no
justification.

**What can be said without touching her, and it is genuinely useful.** The
production contains FBI 302s of victim interviews under protective order. Three
consequences follow:
1. It is a further corpus-composition datapoint for the Section I guardrail — the
   release is a case file, and case files contain sealed-adjacent victim testimony
   alongside correspondence and device forensics.
2. **No keyword sweep of this corpus may be run unfiltered.** A search that returns
   302s is returning victim testimony, and the report's own searching must assume
   that.
3. It bears on Branch B and cuts *for* the Department on one narrow point that
   fairness requires stating: material of this exact class is what legitimate
   redaction is for. Raskin's finding was of **both** unnecessary over-redaction of
   innocuous material **and** failure to redact victims' names. This document is the
   category that genuinely needs the protection, and saying so costs the withholding
   argument nothing it is entitled to keep.

**Standing rule, extended:** if a document is an FD-302, a victim interview, or
carries a protective-order stamp, stop at identification. Do not read on, do not
extract, do not retain.

---

# ADDENDUM 10 — EFTA01771469: no analytical value, deleted (29 Aug 2026)

`DataSet 10/EFTA01771469.pdf`, 1 page, 22 Dec 2011. Private sexual correspondence
between Epstein and an adult woman whose name the Department has redacted; her
mail client is German-language. Explicit, consensual as described, no indication of
a minor.

**Disposition: not used, deleted, not quoted.** Not because it is explicit — because
it is *private correspondence with an unnamed private individual that bears on
nothing this report examines*. It does not touch trafficking, the money, the
sponsor question or the withholding. The only thesis it could be pressed into
serving is a general one about Epstein's private life, and pressing it there would
be the over-reading the report exists to refuse.

A redacted name is not anonymity when the surrounding detail is this specific — the
same reasoning as Addendum 9.

Incidental: the quoted-printable artefacts are plainly visible again
("faith=ul", "=onight", "=tarted"), consistent with Addendum 3. Noted, not needed.

**Running disposition tally for author-supplied documents (29 Aug):** four
published and hashed (EFTA01003966, EFTA02486591, EFTA02446088, EFTA00747383,
EFTA01059474 + EFTA00504063); two published as guardrail specimens (EFTA00165018,
EFTA01850400); two used for the encoding proof (EFTA02597523, EFTA02613636); three
stopped and deleted (EFTA01632670 image layer, EFTA01249940 victim 302,
EFTA01771469 private/no value).

---

# ADDENDUM 11 — EFTA00642874: the Maxwell co-principalship residue the report said it lacked

`DataSet 9/EFTA00642874.pdf`, 2pp, Bates EFTA00642874–875.
SHA-256 `9109a9c8402c63b9ec207b90af0d78ec6d4bf5a772369002b604ac93030ebaf1`

22 Apr 2015, subject "ATTORNEY-CLIENT PRIVILEGE". Epstein (jeevacation@gmail.com)
forwards Ghislaine Maxwell a passage from Virginia Giuffre's account — the
allegation that Epstein and Maxwell asked Giuffre to bear a child for them and
sign away parental rights, which Giuffre said she refused. Maxwell replies the
same evening **from Ghislaine@theterramarproject.org**, calls it "this bullshit",
asks that "Barden" reply, and supplies finished third-person copy for counsel to
issue.

**WHY IT MATTERS.** Section II's grading passage said flatly: *"There is no Maxwell
equivalent of the documentary entries… her placement is carried substantially by
what she was part of."* That was written before this. It is now qualified: this is
**independent documentary residue of co-principalship**. She reviews, selects the
allegation to answer, drafts the reply, and directs counsel. **A principal's
posture, not an employee's** — which is the proposition the rest of her placement
had been reaching by inference.

Secondary: the TerraMar domain carries the principals' joint legal defence, which
makes "a documented cover" concrete rather than descriptive.

**BOUNDS PUBLISHED WITH IT.** Coordinating a legal/press defence with a
co-defendant is lawful and ordinary; nothing is offered as misconduct, and the
denial is hers to make. The evidentiary value is *structural only*.

**HANDLING.** The Giuffre allegation is recorded as hers — denied, never
adjudicated, neither adopted nor discounted. The drafted attack on her credibility
is noted once and not repeated: the report records that the smear was drafted, and
does not carry the smear. Giuffre d. Apr 2025; Maxwell convicted Dec 2021.

**"Barden" NOT identified.** Quoted as Maxwell wrote it. A UK solicitor of that
surname acted for her publicly, but the identification is not verified here and
naming a lawyer for doing his job adds nothing.

---

# ADDENDUM 12 — EFTA02727130: stopped on CBP traveler manifests. Two wrong reads on the way, both recorded.

`DataSet 11/EFTA02727130.pdf` — **136 MB, 367 pages**, Bates from EFTA02727130.
SHA-256 `80eaa9c577f120929c030ea5131938ac2a8e06abbc02a50574e13cda045a38b2`
Fetched, characterised in three passes, **deleted without being mined**.

**My first read was wrong.** The opening pages are product labels and handwriting,
and the first typed page I hit was an FBI Sentinel serial about methamphetamine
dealers in Ballston Spa NY using Zoom — so I took it for wholly unrelated material.
A keyword scan across all 367 pages killed that: Maxwell 292, Ghislaine 253,
Epstein 177.

**My second read was also wrong.** I then took it for an FBI investigative case
file on the Maxwell prosecution. The sensitive-class scan does not support that
either: **zero** FD-302, proffer, grand jury, Jane Doe, 3500, Giglio or Jencks
markers.

**What it actually is, settled by sampling typed pages:** a mixed bundle —
- ~**268 typed pages, the bulk being U.S. Customs and Border Protection *TECS
  Advance Traveler Information — List of Travelers* manifests for private aircraft
  **N120JE**, generated 23 April 2019, with columns for Traveler's Name (L,F,M),
  **DOB**, Hit, Doc Type;
- ~**87 pages** of handwritten investigator notes (OCR largely illegible);
- ~**53** press clippings / web captures (incl. Nov 2019 Peter Nygard coverage);
- 3 FBI Sentinel serials, UNCLASSIFIED//FOUO, one of them the Albany
  methamphetamine intel product that has nothing to do with this subject.

**WHY IT STOPPED THERE.** Passenger manifests for Epstein's aircraft, carrying a
**date-of-birth column**, are victim-adjacent by construction — these are the
flights. Mining 268 pages of traveler records against the report's floor (never
identify a victim) is not a close call, and 87 pages of handwriting cannot be
triaged reliably at all.

**What is safely sayable and is genuinely the strongest version of the Section I
guardrail yet:** one Bates number, four unrelated document classes — CBP border
records, handwritten agent notes, press clippings, and an FBI intelligence product
about drug dealers in upstate New York. **A Bates number certifies custody. It does
not certify subject matter, let alone relevance.**

Minor, non-victim, and not published: the CBP data was generated 23 Apr 2019,
roughly ten weeks before the arrest — a dated investigative-step marker only.

**Process note worth keeping:** the two wrong characterisations were caught by
scanning rather than by reading further, and neither reached the report. Triage
that identifies a document class before extracting content is what made the error
cheap.

---

# ADDENDUM 13 — EFTA01742815: shorthand is a third search-breaking mechanism

`DataSet 10/EFTA01742815.pdf`, 1 page, 8 May 2018.
SHA-256 `52140388c909026a5de3dcaa43ef2517ba2d100e241b9b85fa54c1f675aa522c`

Author's prompt: *look for "ghis" and these short hand*. He was right, and it is
measurable.

**THE DOCUMENT.** A private to-do list from Epstein's own account, subject line =
first row. People, four properties, litigation, staff, travel, money, PR — his own
one-page index of the operation, fourteen months before arrest.

**THE TEST — six full-name searches, six misses.** The document is NOT returned by
`Ghislaine`, `Ghislaine Maxwell`, `Dershowitz`, `Jes Staley`, `Zorro Ranch`, or
`Little St James`. Searching the shorthand returns it instantly. The page says
*ghis*, *ghislanc*, *dersh*, *jes*, *zorri*, *lsj*, *gsj*.

**So three mechanisms now, two of them deflationary:**
1. quoted-printable breaking words mid-token (Addendum 3);
2. **private shorthand and misspelling — the word was never written** (this);
3. inflation from inbound material that was never evidence (Addendum 2).

**DISCIPLINE PUBLISHED WITH IT.** Expanding shorthand is itself inference. Safe and
already independently documented: dersh, jes, ghis/ghislanc, cvra (Crime Victims'
Rights Act litigation over the 2007 agreement, live in 2018), pb, zorri, lsj, gsj,
plus first names the corpus establishes elsewhere. **Refused by name in the
published text**: *ian*, *forrrester cayne*, *shaher*, *barnaby*, *novak*, *edo*.
Expanding four letters into a living person's name would be the Section XIII naming
error in its purest form, and the temptation is strongest exactly where the list is
most interesting.

**Not published:** the full expansion of the science/finance run on the list. Most
are already report nodes, but a list of surnames in a dead man's notes adds nothing
the report does not already source properly, and reproducing it wholesale would be
a proximity smear by another route.

---

# ADDENDUM 14 — EFTA00684820: a story treatment, not evidence. Not published.

`DataSet 9/EFTA00684820.pdf`, 1 page, 3 Jul 2013, from jeevacation@gmail.com.
SHA-256 `4d8477f067e548c6d53ffc8db1234c66f6970470953a1428f3b05a6c37403065`

**What it is: a film/TV story outline Epstein wrote to himself.** A street-gang kid
makes good working for a Wall Street tycoon, denies his old friends, gets rich, and
is then forced back to old-neighbourhood methods; the rich are shallow and
disloyal; "the street outsmarts the wall street." Named characters (Vinny, Crazy
Kathy, Sam Wall, Johnny Boy, Suz, Walter, Anastasia, Ginny).

**What settles that it is fiction, and it is not a judgement call.** The page is
written in the vocabulary of construction, not description: *"contrast with…"*,
*"sees himself as a ladies man"*, *"uses the word…"* (a note on dialogue register),
*"walters wife anastasia, russian, knows he cheats"*. Those are an author blocking
out characters. Nobody describes events that way.

**Why it is not published, stated plainly rather than dodged.** The outline
contains imagery that reads very darkly in this particular inbox — a woman used to
distract a man sexually, a threat delivered "standing outside the private school",
"girls" in a list of a rich man's possessions. **That is exactly what makes it
unusable.** Reading an author's fiction as autobiography is a standard interpretive
error, and here it is the Section I error in its most tempting form: a genuine
Epstein document, a real justice.gov URL, a real Bates number, and content whose
resonance comes entirely from the reader's knowledge of what he actually did.

The report documents his conduct from evidence of his conduct. A story treatment
is evidence that he wrote a story treatment.

**Disposition: not used, deleted, nothing carried.** Recorded because the trail of
refusals is worth as much as the trail of finds — this is the third document today
whose apparent significance did not survive asking what class of thing it is.

---

# ADDENDUM 15 — EFTA02652408: Epstein running the media operation for Maxwell's civil trial

`DataSet 11/EFTA02652408.pdf`, 2pp, Bates EFTA02652408–409, 23 Apr 2017.
SHA-256 `70a1fe8ab8eb9487a6d9d1435fa27fe8264d607ed0805c19b88b81d3615d9cff`
(Note: needed `curl --fail` for the retry to engage — Akamai returns 401 on
rate-limit, which curl otherwise counts as a completed transfer.)

Epstein → **Michael Wolff**, 09:09: *"I want to hire a pr person to cover the
ghislaine trial in new york may 15 for 5 weeks. suggestions … they can shape the
story."* Wolff, 09:41: two publicist names, *"If I can help with inquiries, let me
know"*, and a suggestion to hire in London *"where a lot of the coverage is going
to come from."* Epstein, 13:46: *"i want a person to sit in the courtroom."*

**The trial** is *Giuffre v. Maxwell* (S.D.N.Y. 1:15-cv-07433), the civil
defamation case listed for May 2017; it settled on the eve of trial. **Epstein was
not a party.** He was arranging paid press management and a courtroom observer for
a case brought against his co-principal by a woman he trafficked.

**Second instance of the joint-unit pattern**, with EFTA00642874 (Apr 2015, Maxwell
drafting the rebuttal). Two years apart, both showing the two operating as one
unit on her legal exposure — the co-principalship residue the report had said it
lacked.

**AND IT TURNS BACK ON THE REPORT.** Section II weighs Epstein's 2019 statements to
Wolff at attributed tier, cautioning they were made to *a journalist writing a
book* with narrative incentive. That caution now carries a second half: two years
earlier the same journalist supplied crisis-PR referrals for the co-principal's
trial and offered to help with enquiries. **Recommending publicists is not
misconduct; Wolff is living and uncharged; nothing is alleged against him.** But a
source who has previously advised the subject is differently placed from one who
only interviewed him, and the report cites him often enough that this belongs
beside the citations.

**Publicists NOT named** — suggestions in someone else's email, no evidence any was
approached, hired, or knew of the enquiry. Same rule as Dugan and Lee.

---

# ADDENDUM 16 — occlusion and cipher sweep: a null, and why the null is weak

Author's brief: scour the corpus for occlusion methodology and basic cipher
patterns, on the premise that Epstein knew email could be read.

**PREMISE TESTED, NOT ASSUMED.** The two artefacts found earlier today are *not*
occlusion: quoted-printable `=` is mechanical MIME transport encoding, and the
shorthand in EFTA01742815 is a man writing notes to himself. Neither implies intent.

## Occlusion markers — ~900 bodies, literal-confirmed hits only
| class | docs | what they actually are |
|---|---|---|
| channel-switch | 23 | "call me". Ordinary. |
| deletion | 55 | **virus / account-compromise warnings** ("delete the email as he has been hacked"). IT hygiene. |
| surveillance-aware | 49 | mostly **law enforcement preparing its own subpoenas (2019)** — investigators' documents in the production |
| secure-channel | 81 | contact-block WhatsApp/Telegram lines; one "telegram is better than email" convenience note |

## Cipher signatures — none
| test | hits | reality |
|---|---|---|
| base64 ≥40 chars | 7 | web tokens; one decodes to a **Pinterest email-verification link** |
| hex ≥32 chars | 2 | message identifiers |
| numeric group codes | 138 | Manhattan postcodes (10019, 10022), phone numbers |
| letter/number substitution | 188 | *1st*, *3rd*, *71st* |
| spaced-out lettering | 0 | — |
| PGP / encrypted content | 0 | — |

## The finding, in two halves

**Occlusion exists and is narrow.** Two instances, both already in the report: the
**euphemism** ("massage") and **concealed beneficial ownership** (Southern Trust
behind Carbyne — "I thought we did not want your name associated with this
Investment?"). It operates in what words mean and in who owns what — **not in the
transport**. There is no cipher because none was needed.

**And the null is weak, which is the part that matters.** A successful code word is
invisible to a search for the thing it conceals. "Massage" is known to be one from
testimony, investigation and a conviction — not from anything detectable in the
text, where it looks like an ordinary word because it is one. **Had that history not
existed, no scan would have flagged it.** The known-positive case yields the same
empty result as this sweep. So absence of detected code words is not absence of
code words; it is absence of a key. Published with that limit attached, into the
Section I guardrail.

---

# ADDENDUM 17 — the Juval Aviv assassination claim: a live test of the symmetry rule

Author supplied a circulating social post (Aug 2026) carrying a podcast claim
attributed to **Juval Aviv**: Epstein did not hang himself; a trained assassin was
brought in from outside the country and left; Epstein set no real dead-man switch
because he trusted a promised pardon.

**Why it does not move the attribution question** — and the reason is structural,
not about him. The report's refusal was never "nobody has claimed it." It was that
motive is shared by dozens, so naming one actor needs evidence that *discriminates*.
**An assertion does not discriminate; it selects.**

**The narrator, verified both ways before writing.**
- FOR: real figure; founder of Interfor; acknowledged basis for the protagonist of
  Jonas's *Vengeance* → Spielberg's *Munich*. **Indicted federally on mail/wire
  fraud 1995 over an investigative report; ACQUITTED 1996.**
- AGAINST: Israel denies the service — **Yigal Carmon**, then counter-terrorism
  adviser to the PM, denied it in writing in **1990**. *Haaretz* intelligence
  correspondent **Yossi Melman** describes him as a former El Al security guard.
  His Interfor report attributing Pan Am 103 to a CIA-linked operation was not
  accepted.

**THE TEST.** Aviv's answer to the denials is that *the discrediting was itself a
joint CIA–Mossad operation* — **precisely the argument this report was pressed to
accept about Ben-Menashe.** Under the symmetry rule it cannot be accepted for one
narrator and refused for another. Verdict is therefore the one Section V reached:
**untestable**, and untestable forbids building on him rather than licensing him.

**Technique worth naming:** the dead-man-switch element asserts a negative about a
dead man's state of mind, and thereby *explains away the absence of the
corroboration the claim would otherwise need* — the unfalsifiable machine, inside a
claim one might like to be true.

**Concession published:** on *manner* the claim is not extraordinary and the report
is already near it. What it adds is attribution, and that is the part that fails.
Tier: labeled claim, single-source, untestable narrator, adopted nowhere.

---

# ADDENDUM 18 — polygamy / Babylon / "Sultan" / satanic: four claims tested against the corpus

Author's brief, plus a re-sent link to **EFTA01249940** — the FD-302 victim
interview already stopped on and deleted in Addendum 9. **Not re-opened.** Same
Bates number; standing rule applies. The substantive question was answered from
other sources instead.

| claim | verdict | what the corpus actually shows |
|---|---|---|
| Epstein called himself **"Sultan"** | **REFUTED** | A guest's first name. *"Sultan WILL bring his wife… breakfast for Sultan and Jeffrey"* — two people, one sentence. It is Sultan Ahmed bin Sulayem (DP World), already a report node via the DNA kits. Self-reference searches ("I am the sultan", "call me sultan", "your sultan", "the sultan of") return **zero**. A 2011 email is addressed to *"Jeffrey Epstain - Friend of Sultan"* — independent confirmation from a second direction. |
| **recreating Babylon** | **REFUTED** | "recreate Babylon" = **0 hits**. Every literal *Babylon* is **West Babylon, NY** (an office-equipment supplier on Sunrise Highway) or a search page listing **a different Jeffrey Epstein, a neurosurgeon in Babylon NY**. *Babylonian* = a Science trigonometry-tablet item and a puzzle-collection blurb. |
| **temple** (occult reading) | **REFUTED** | A Thai Buddhist meditation temple website; **Daniel C. Temple**, VP at J.P. Morgan Private Banking, signing his own mail; the **Shirley Temple Blue Diamond**. |
| **harem** | **REFUTED — architecture** | *"Do not forget in the house the harem part. Happy to manage it…"* — the worst-reading sentence in the corpus, and the previous evening Epstein wrote *"Im working on moroccan house plans"*. In Moroccan/Islamic domestic architecture the *harem* is the private family quarters. A note about a floor plan. **EFTA02546658** (DataSet 11), SHA-256 `e509845f0706e260289f9001880a904ecb59098d3f1f44baf9a8b8e7e230e4ce`. |
| **polygamy** | not supported as a theme | 3 literal hits: a stray fragment, a ScienceDaily link on polygamy/monogamy, an FT piece on the Emir of Kano. |
| **satanic / occult** | no evidence | Already covered: the Spirit Cooking debunk (Section XVIII) and the adrenochrome tip published today as a Section I guardrail specimen. |

**WHAT SURVIVES, and it was never a keyword question:** the NYT (31 Jul 2019,
Stewart/Goldstein/Silver-Greenberg) reported on four sources that Epstein wanted to
seed the human race with his DNA by impregnating women at the New Mexico ranch, one
account putting it at twenty at a time. Documented, in Section VI, never carried
out. **It is eugenics, not polygamy, Babylon or the occult.**

**Method note worth keeping:** the harem hit was chased *because* it was the one
that might have gone the other way. Publishing the three refutations while leaving
it unexamined would have been the asymmetry this report spent the day correcting.

**And the direction of the errors is the finding:** all four misreadings would have
produced a *more* lurid report, not a duller one.

Published into the Section XIII naming-error module as four fresh specimens.

---

# ADDENDUM 19 — the objection scan: six phrasings, one hit, and the hit is the prosecutor's

**Question asked:** does anyone in the correspondence ever object? Not "is there
evidence of crime" — a moral-scale question about the mail itself.

**Method:** literal phrase queries against the email layer, six objection phrasings.

| phrase | hits |
|---|---|
| `"you need to stop"` | 0 |
| `"I can't be part of"` | 0 |
| `"i object"` | 0 |
| `"this is not right"` | 0 |
| plain refusal forms around the above | 0 |
| `"this has to stop"` | **1** |

**The single hit: EFTA00189167.** DataSet 9, 24 pages.
SHA-256 `a51660c44dc87cdea685a28461116d6903aedf567e016286c77e90a95cef5020`.
Retrieved from justice.gov with the age-verification cookie and hashed.

It is not Epstein's mail. It is the 2007 NPA negotiation traffic — AUSA Ann Marie
Villafaña, First Assistant Jeff Sloman, US Attorney Alexander Acosta, and Jay
Lefkowitz of Kirkland & Ellis for the defence.

> **From: Acosta, Alex (USAFLS) — Sent: Tuesday, October 23, 2007 9:40 PM —
> To: Villafana, Ann Marie C.; Sloman, Jeff — Subject: This has to stop.**
> "Just read the letter. 1. We specifically refused to include the provision saying
> that we would not communicate. If I recall the conference call, we told him we
> could not agree to a gag order using those words. 2. The purpose of the agreement
> was not an out of court settlement. Seems that they can't take no. Let's talk re
> how to proceed. I'm not sure we will ever agree on a letter at this point."

Villafaña, 24 Oct 2007: *"I can't believe that they have managed to drag this out
for almost four weeks."*

**Dating matters and was checked.** The NPA was executed 24 September 2007 — a month
*before* this email. So the thing Acosta is refusing is not the deal; it is a
non-communication clause the defence kept pressing for in a follow-up letter after
the agreement was already signed. "Gag order" is his own phrase.

**What it does to the report's Acosta treatment:** it breaks the flat "he folded"
version in both directions. The capacity to refuse was present, in writing, and was
spent on a drafting clause — while the agreement he had already signed immunised
co-conspirators the government never named and was later found (S.D. Fla., Feb 2019)
to have been concluded in violation of the CVRA.

**The limits, and they are why this is not published as a finding:**
1. Literal English matching, over a corpus already shown here to be under-searchable
   two ways (quoted-printable line-wrap; private shorthand).
2. Guaranteed-null in its purest form — a refusal need use none of six phrasings.
   Same shape as the `massage` null.
3. **Survivorship.** A correspondent who objects stops being a correspondent. An
   inbox records who kept writing.

Published into Section I's third guardrail with all three limits attached.

---

# ADDENDUM 20 — the five hex32 quotations: verification attempted, verification failed

Standing obligation from earlier in this file: five published quotations rested on
`[0-9a-f]{32}` content-hash identifiers with no Bates number and no justice.gov
resolution. Each needed a Bates verification or an explicit tier downgrade.

**Method (29 Aug 2026):** exact-phrase queries (`"..."`, confirmed to work — an
unquoted control returned 6 results where the quoted form returned 2) against the
corpus search layer. Namespace of every returned identifier recorded.

## The five test phrases

| phrase | total | namespaces returned |
|---|---|---|
| `"will be receiving two wires tomorrow"` (Kahn, $18M) | 1 | hex32 only |
| `"May I give Peg your approval"` (Indyke) | 1 | hex32 only |
| `"without moving the market"` (Abigail Wexner) | 2 | hex32 only |
| `"the entity taking the grant from C.O.U.Q"` (Form 1023) | 1 | hex32 only |
| `"pursuant to the Book Agreement with TWF"` (Barak) | 1 | hex32 only |

**Nought of five returns a Bates-bearing identifier.**

## The controls — because a null from a search tool is worthless until the tool is shown capable of the hit

| phrase | total | namespaces returned |
|---|---|---|
| `"Saw this walking past Christie"` | 23 | EFTA ×16, vol ×7 |
| `"zorri internet garden"` | 1 | EFTA |
| `"Im working on moroccan house plans"` | 3 | EFTA |
| `"human clon"` | 1 | EFTA |

**Four for four on the control; nought for five on the quotations.** The method
reaches the Bates namespace readily. Those five documents are not in it.

## Disposition

Tier dropped to **attributed to a third-party corpus, unverified against the
Department's production**. Not *documented* in this report's sense; no argument
rests on them alone. Inline markers added at both `<li>` items; two paragraphs
added stating the test, the control, and the exact size of the loss.

**What does not move, because it never depended on them:** the July 1991 power of
attorney; the $0 deed on 9 East 71st St; Wexner's Aug 2019 letter; the C.O.U.Q.→YLK
transfer at $14.2M in public Form 990s; the Wexner Foundation's $2.3M to Barak.

**What was lost:** Epstein's hand visible *inside* those transactions — the one-word
"yes", the wire instruction, the routed approval. That is the increment the report
found most persuasive, which is why it goes rather than stays.

---

# ADDENDUM 21 — Babylon, corrected: the word test was the wrong test

Reader objection, and it lands: *"Do you think evil would state in email that they
are trying to rebuild Babylon? This was shown via what happened."*

**Conceded.** Addendum 18 tested whether the *word* appears. That answers whether
the word is doing work in the sentence it appears in, and nothing else. The null
establishes he never wrote it; it does not establish he never meant it, and could
never have.

**The conduct version, which is stronger than the word version it replaces:**
- **Territory the law reached badly** — Little St. James and Great St. James, in a
  territory whose own Attorney General had to sue to establish what happened on
  them (complaint Jan 2020; settlement 2022). Zorro Ranch, 7,560 deeded acres, NM.
- **Dynastic seeding** — NYT (31 Jul 2019), four sources, twenty at a time; and the
  corpus's own costed version, EFTA01003966, already in Section VI.
- **The build-out** — indexed on one page of his own shorthand: *"lsj, rugs, wall,
  jet ski dock / gsj, generator cistern, bedrooms"* (EFTA01742815).
- **A court that travelled to him** — heads of state, a prince, Nobel laureates,
  university presidents, on his ground, after the conviction was public record.

**Tier:** author's figure over documented conduct. Elements documented and cited in
place; "rebuilding Babylon" is a name for their shape, supplied by a reader in 2026
— and a name is a claim by whoever made it, which is the rule the section exists to
state. **The symmetry is honoured going the other way:** the conduct does not
establish the cosmology any more than the word search established its absence.
Appetite and impunity explain every item on that list and require no temple. What
the figure supplies is a description of *scale*, which the four ordinary
explanations were never addressed to.

**Side fix:** Zorro Ranch acreage was internally inconsistent (8,000+ in one place,
7,560 deeded in another). Aligned to 7,560 deeded acres in both.

---

# ADDENDUM 22 — the 40,000,000 / D.U.M.B. claim: declined, with the reason

Reader claim: *"40,000,000 people go missing each year. D.U.M.B."*

**Traced.** The figure is the **ILO / Walk Free / IOM Global Estimate of Modern
Slavery, 2017 edition: 40.3 million in modern slavery at any given moment** (24.9M
forced labour, 15.4M forced marriage). The 2022 edition revised it to 49.6M. It is
a **stock** figure, not an annual **flow** of disappearances.

**Why the conversion is costly rather than merely wrong.** It turns a rigorously
constructed estimate into a claim falsifiable in one step, and when it falls the
real 40 million fall with it. Countable flow, for comparison: US NCIC takes roughly
550,000–600,000 missing-person records a year, the overwhelming majority cleared
within days; ~90,000 active at year end. No methodology anywhere produces 40M/yr.

**D.U.M.B.** Deep underground military bases are real and unclassified in outline
(Cheyenne Mountain, Raven Rock/Site R, Mount Weather). No document, defector,
contractor record or imagery has ever connected any of them to trafficking. The
report's **anti-map guardrail** binds hardest here precisely because the claim is
one the author would like to be true: a claim that explains everything and can be
checked nowhere is the unfalsifiable machine.

**Not published.** Nothing to publish — there is no documented anchor, and the
guardrail against manufacturing one is the whole point of the guardrail.

---

# ADDENDUM 23 — six documents fetched on request; one of them falsified Addendum 21 within hours

All fetched from justice.gov with the age-verification cookie and hashed.
Akamai note: rate-limiting returns **HTTP 401**, not 429 — curl needs `--fail`
or `--retry-all-errors` never fires. Backoff ladder 8/20/40/70/110s cleared it.

| Bates | DataSet | pp | SHA-256 (head) | what it is |
|---|---|---|---|---|
| EFTA02011205 | 10 | 1 | 052b161e | unrelated one-liner (Kosslyn, 2013) |
| EFTA02011206 | 10 | 1 | ec42084d | **transmittal: Pritzker, Tom → Epstein, 9 Jun 2011** |
| EFTA02011207–214 | 10 | 8 | 5a2e2174 | **attachment: Tom Pritzker's July 2008 Iraq letter** |
| EFTA00711844–45 | 9 | 2 | 9753fbdf | **2013 SEO/reputation campaign + eJewishPhilanthropy pitch** |
| EFTA01899786 | 10 | 1 | 200a4396 | photo-attachment email; **photo not in production** |
| EFTA00579623–24 | 9 | 2 | d368e531 | God-vs-Satan diet chain-letter joke, Feb 2002 |
| EFTA02333752 | 11 | 1 | 9dcdb74d | G. Max 13 Apr 2003 exchange + "Fwd: Fw: Satan" footer |
| EFTA02810791–92 | Court Records | 24 | e1f901dc | **USVI v. JPMorgan Exhibit 49 — the 2003 DDR** |

## 1. The Pritzker letter — authorship documented, not inferred

EFTA02011206, To: jeevacation@gmail.com, **From: Pritzker, Tom**, Thu 6/9/2011
7:25:30 AM, "Iraq mom's letter doc":

> "Here is the first installment. Note the date. I am working on the letter from
> this trip which will analyze **the white space in our tools for conducting
> foreign policy**. Great to see you. It's always too much fun. Could do this for
> hours with you. Best, Tom"

Attachment: 8pp, July 2008, "Dear Mom and Margot… Love, Tom." Five days across
Iraq; two hours with Petraeus; a briefing he calls "a dry run" for Obama's visit
the following week; Basra, Babylon, the Palestine hotel; MRAPs, Blackhawks,
15–20 shooters; dinner at an opposition MP's with former PM Allawi.

Corpus corroboration: `vol00009-efta00994667-pdf` — "On Wed, Aug 6, 2014 …
**Pritzker, Tom** <> wrote: Have been having some fun with Iraq"; `EFTA02490215-2`
— "tom pritzker was here, he has a port/logistics in Iraq"; and a long run of
"Please call Tom Pritzker" messages in Epstein's mailbox.

**Living-person floor.** Pritzker is living and uncharged. Nothing here alleges an
offence. What is documented is a transmittal, an attachment, and a sentence about
"white space in our tools for conducting foreign policy." **Held for the author's
direction before publication** — it introduces a new living person to the report.

## 2. The correction it forced — Addendum 21 / Section XIII

Page 5 of the letter: **"We went to Babylon… We visited the ruins of Babylon."**

The published specimen said *every* literal Babylon occurrence resolves to West
Babylon NY or the namesake neurosurgeon. **False.** The scan ran against the
**email layer**; this is an **attachment in the PDF production**. Tested: four
exact phrases from the letter, queried against the email layer, **0 hits each.**

That is a **third under-searchability defect** on top of quoted-printable and the
private shorthand — and this one the report walked into itself. Correction
published in place, with the quantifier named as the part that broke.

Note the counter-example cuts *against* the thematic reading: it is a guarded
tourist visit to the archaeological site at Hillah, and the writer's point is that
Saddam "virtually paved over the ruins."

## 3. EFTA00711844 — the fabrication still running in 2013

1 Apr 2013 status report to Epstein from a search-visibility contractor:
"15 of the 43 business directories are live… waiting for the new Wikipeida article
… premium Yellow Pages site (which gives a guarantee of a 1st page listing)."

Benchmarked explicitly against Wexner: *"I reviewed how the Wexner Foundation
performs in google local results and am adding your foundation to all the websites
that come up on their 1st page."*

Attached pitch letter to eJewishPhilanthropy, in Epstein's voice, uses Wexner as
the credential — *"a long partneship with Leslie Wexner and the Wexner Foundation,
which is listed on your site"* — **six years after the split**. And repeats the
1976 lie: *"Mr. Epstein started his career at Bear Steams with an educational
background in physics and mathematics."*

**Symmetry note, published.** The same letter lists Jewish and Israeli charitable
causes, and a reader hunting an intelligence perimeter finds that list before
finding the lie four paragraphs below. It is a self-authored publicity document
containing a demonstrable falsehood about its own subject: excellent evidence of
projection, none at all of substance.

## 4. EFTA02810791 — USVI v. JPMorgan, Exhibit 49

Internal JPMorgan email, **21 May 2003**: a Due Diligence Report on **Financial
Trust Company** signed off by **Security Services**, awaiting client-manager
approval — *"I was waiting to pull everything together before sending down Vanity
Fair article, so you'll get everything at once."* The attachment is **Vicky Ward,
"The Talented Mr. Epstein," Vanity Fair, March 2003**, reproduced across pp. 3–21.

**The exposé was inside the bank's due-diligence file, attached to the approval, in
2003.** The relationship ran roughly another decade. Same shape as Fidelifacts 1976:
commissioned, written down, filed, decision unchanged. Published into Section II.

*Minor:* pp. 22–24 of the exhibit are the Vanity Fair site's related-articles rail,
captured when the page was printed to PDF on 31 Mar 2023 — three pages of Bess
Levin Trump headlines that are not evidence of anything. Another "in the files"
specimen; not published.

## 5. The two Satan documents — and a name not published

- **EFTA00579623** (17 Feb 2002): a forwarded chain-letter joke, "And God populated
  the earth with broccoli… And Satan created McDonald's." Sender is a Manhattan
  nightclub proprietor. **This is what "Satan" in the corpus is.**
- **EFTA02333752** footer (13 Apr 2003): **"G. Max" → "Mum", Subject: "Fwd: Fw:
  Satan"**, Eudora via mail.mindspring.com. Corroborated — 5 documents carry
  "Fw: Satan" in the subject field, sender G. Max. **The same joke, two mailboxes,
  14 months apart.** A second clean specimen for the Section XIII occult test.

**The unresolved part, and it stays unresolved.** The body of EFTA02333752 quotes an
inbound message of 13 Apr 2003 1:31 PM whose sender the search index renders as
`WJC <wjc>` — "Just spoke to our favorite person, mr levine… I told him I was
working on brenda… he is bringing the brit to je's… maybe a late night burgerfest
again", with G. Max replying "I think the 3 of us make a good team… my 2 favorite
men! Gx".

The string is **real and corroborated across six Bates-bearing documents**
(EFTA02332574, EFTA02333820, EFTA02335262, EFTA02335790, vol00009-efta00578889,
vol00009-efta00580019). **The address behind it is redacted in every instance, and
nothing in any of them expands the initialism.**

**Not published, and not expanded.** Naming a living person from a three-letter
display name is exactly the resolution failure Section XIII exists to warn about —
"a mark read at too low a resolution and named confidently." What would settle it
is an unredacted header. We do not have one.

## 6. EFTA01899786 — checked, and there was nothing to see

"Fast boy and slow boy", 13 Apr 2013, with a camera filename (DSC 1198) in the
body. Image census: the single embedded object is an **816×1073 greyscale raster of
the printed email page**, 16KB — the scan of the page, not the photograph. **The
attachment is not in the production.** Sender is a private individual; name not
published, since he appears only as the sender of an email whose content cannot be
assessed.
