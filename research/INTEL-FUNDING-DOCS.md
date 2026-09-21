# The intelligence funding documents — what exists, what was read, what refused

**21 September 2026. Research, unpublished.** Asked for as *"find the Intelligence funding docs."*
Read as: the primary documents that establish how the US intelligence community is funded and
accounted for. Sources in `research/sources/ledger.jsonl`.

## 1. The statutes — documented, read at source

**50 U.S.C. § 3510 — CIA Act of 1949 §8, "Appropriations" (law.cornell.edu, ledgered).** The
founding funding document, and the one that matters:
- (a) "Notwithstanding any other provisions of law, sums made available to the Agency by
  appropriation or otherwise may be expended for purposes necessary to carry out its functions…"
- (b) "The sums made available to the Agency may be expended **without regard to the provisions of
  law and regulations relating to the expenditure of Government funds**; and for objects of a
  confidential, extraordinary, or emergency nature, such expenditures to be **accounted for solely
  on the certificate of the Director and every such certificate shall be deemed a sufficient
  voucher** for the amount therein certified."
- (c) A 30-day notification to the intelligence committees for "a novel and significant
  expenditure" — the oversight clause added later.

That is the legal instrument by which intelligence money leaves the ordinary accounting system:
the Director's certificate *is* the voucher.

**50 U.S.C. § 3306 — "Availability to public of certain intelligence funding information"
(ledgered).** The 2007 disclosure statute (9/11 Commission Act §601): the President "shall
disclose to the public the aggregate amount of appropriations requested" for the National
Intelligence Program with each budget, and the DNI "not later than 30 days after the end of each
fiscal year … shall disclose to the public the aggregate amount of funds appropriated." A waiver
clause (c) lets the President postpone disclosure "if the President determines that disclosure …
would damage national security." **Only the aggregate is required. Nothing below it.**

**22 U.S.C. § 2753** (AECA; ledgered) governs the *outbound* side — arms transfers — and is read
in `research/US-ARMS-UAE-SUDAN.md`.

## 2. The toplines — documented, from the FAS record of official disclosures

`irp.fas.org/budget/` (ledgered) collects every official disclosure:
- **FY1997: $26.6bn; FY1998: $26.7bn** — the first-ever totals, declassified by the DCI **in
  response to FOIA litigation**, then re-classified for the following years.
- Post-2007 annual NIP/MIP disclosures under §3306, most recent on the page:

| FY | NIP | MIP | Total |
|---|---|---|---|
| 2022 | $65.7bn | $24.1bn | $89.8bn |
| 2023 | $71.7bn | $27.9bn | $99.6bn |
| 2024 | $76.5bn | $29.8bn | $106.3bn |
| 2025 | $73.3bn | $27.8bn | $101.1bn |
| 2026 (request) | $81.9bn | $33.6bn | $115.5bn |

ODNI's own budget page (dni.gov, ledgered) carries the disclosure history and the §601 basis but
no table in the fetched text.

## 3. The one line-item document — attributed, source refuses

The **FY2013 Congressional Budget Justification Book** for the NIP, published in summary by the
Washington Post on 29 August 2013 from the Snowden material: **$52.6bn** for FY2013, with the
per-agency split (CIA the largest single line). The Post's page is `robots.txt`-disallowed to the
crawler and was not fetched; the figure is carried by the secondary record and **is already on
the page** (Section IX: "a US intelligence black budget of $52.6 billion in FY2013 alone"). It
remains the only public document below the aggregate.

## 4. The case — attributed, source refused

**United States v. Richardson, 418 U.S. 166 (1974):** a taxpayer's challenge to the CIA's secret
budget under the Constitution's Statement and Account Clause (Art. I §9 cl. 7) dismissed for lack
of standing. The Court never reached whether §8 of the CIA Act violates the clause; it held the
plaintiff could not ask. Justia's page returned 403; not read here. The point for the page: the
constitutional question has never been decided, only declined.

## 5. What the page carries, and the gap

`black budget` ×3 (Section IX, $52.6bn); In-Q-Tel ×6 as a Palantir shareholder; ODNI ×3 (UAP
material only). **Zero** for the National Intelligence Program, the Military Intelligence
Program, the CIA Act, "unvouchered," or Richardson. If the author wants the funding layer on the
page, §3510(b) — *the certificate is the voucher* — is the document, and it belongs in Section
XVI (FOIA and the declassified record) or Section VII beside the BIS immunities, at documented
tier. Author's call.

## 6. Ledger

Fetched OK: law.cornell.edu 50 U.S.C. §3510 and §3306; irp.fas.org/budget/; dni.gov ic-budget;
Wikipedia "United States intelligence budget."
Refused: crsreports.congress.gov R44381 (403) and sgp.fas.org mirror (202, empty); justia
Richardson (403); comptroller.defense.gov (403); congress.gov (403); washingtonpost.com black
budget (robots disallow). **Decoy 200:** cia.gov/readingroom PDF path returned the homepage,
matched on title by `hosts.json` — the known cia.gov decoy.
