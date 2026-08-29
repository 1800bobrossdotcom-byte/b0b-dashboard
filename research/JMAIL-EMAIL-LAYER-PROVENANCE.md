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
