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
