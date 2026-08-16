# OCR / DOCUMENT-LAYER ANALYSIS — jmail.world

Internal research reference. NOT published (lives in research/, outside site/, never
served). Records an OCR pass over jmail.world's image + document layers, Aug 2026.

═══════════════════════════════════════════════════════════════════════
WHAT jmail.world ACTUALLY IS (so the method is auditable)
═══════════════════════════════════════════════════════════════════════
Riley Walz / kino.ai project. A Gmail-styled front end over the DOJ + House
Oversight Epstein releases. Two image-bearing layers:

1. JPhotos  — /api/photos → 18,174 images (18,014 DOJ + 160 House Oversight).
   Per-image metadata: id, original_filename, source, redacted flag, dimensions,
   person_ids, plus community starCounts + unredactCounts.
   FINDING: this layer is NOT an OCR target. It is a redacted PERSONAL-PHOTO
   archive — the black rectangles are DOJ victim redactions over people, and a
   large share is victim-related and explicit imagery. Ranking by starCount or
   unredactCount surfaces exactly that material (the single top-starred image,
   ★3860, is a costume photo; the high-unredact set is redacted bodies). Per the
   report's core discipline (never touch victim imagery / never identify victims)
   this layer was NOT mined and downloads were deleted. Text content here is
   negligible anyway: a few handwritten notes and blank "No Images Produced"
   placeholder pages.

2. JDrive — /api/documents/* → 1,412,250 documents / 2,474,242 pages.
   Folders: court-records, doj, doj-disclosures, estate-production, house_oversight.
   Rich metadata per doc: source_url (original justice.gov PDF), tags {year, court,
   people}, redaction_count/score, page_count.
   KEY FACT: the documents are ALREADY OCR'd — the site ran Reducto over them and
   /api/documents/read returns the extracted text (verbatim for text PDFs; an AI
   vision summary, prefixed "Key information from the image:", for image-heavy
   scans). So "OCR" of this corpus is already done and exposed as text. Re-OCR is
   redundant; and the raw high-res page images to redo it are gated (justice.gov
   sits behind a JS bot-wall; the getkino CDN serves only a 400px page-1 thumbnail,
   and only for docs with has_thumbnail=true).

CONCLUSION ON METHOD: the value is NOT re-running OCR. It is MINING the already-
OCR'd DOCUMENT layer — which this report, built on the EMAIL corpus, had not fully
tapped — to (a) verify the report's existing citations against primary text and
(b) surface net-new documented details. Access path used:
  POST /api/documents/read      {doc_id}         → extracted text
  POST /api/documents/search    {query, limit}   → docs + source_url
  POST /api/turbopuffer-search  {query, limit}   → semantic (emails + docs)

═══════════════════════════════════════════════════════════════════════
VERIFICATION WINS (report quotes confirmed against primary DOJ OCR text)
═══════════════════════════════════════════════════════════════════════
EFTA02634615 (8 pp, DataSet 11) — the report's most-cited Carbyne document:
  ✓ Indyke, Mar 12 2019: "Not sure how to respond. I thought we did not want your
    name associated with this Investment? Also, Tomer is asking for a bank rec
    letter from the transferring bank which is DB." — CONFIRMED verbatim.
  ✓ Indyke: "Am I correct that by your 'ok' you mean that I may confirm that you
    are the controlling person of the STC?" — CONFIRMED verbatim.
  ✓ Epstein replies "ok" (Mar 12) and "Yes" (Mar 14) — CONFIRMED (thread head is
    Epstein's "Yes", From: jeevacation@gmail.com).
  → The report's Southern-Trust / concealed-controlling-person thread is now
    primary-source-verified, not press-paraphrase.

EFTA02628761 (7 pp, DataSet 11) — the Qatar pitch:
  ✓ Amir Elichai (amir@carbyne911.com) → Jabor Al Thani, CC "Epstein Jeffrey" +
    "ehbarak", subj "Qatar Presentation <> Carbyne 911", Feb 2019 — CONFIRMED. The
    report's Qatar/Al-Thani/World-Cup edge holds against primary text.

═══════════════════════════════════════════════════════════════════════
NET-NEW DOCUMENTED DETAILS (research tier — handle per discipline)
═══════════════════════════════════════════════════════════════════════
- Epstein Gmail address in the Carbyne paperwork: jeevacation@gmail.com
  ("J <jeevacation@gmail.com>"). Minor but primary — the account used to confirm
  controlling-person status of Southern Trust.
- Qatar intermediary NAMED: the pitch was routed to **Lysys WLL** (a Qatar-based
  firm), via **Dimitrios Demesticas, Country Manager**. The report currently says
  only "routed onward to a Qatari security firm" (Section IV). This is the named
  firm + contact. PUBLISHABLE as a firm-level extension of the Qatar edge; the
  individual is a routine corporate contact (low sensitivity) but name him only if
  useful.
- Deutsche Bank contact NAMED: **Stewart Oldfield at DB**, whom "Rich [Kahn] has a
  decent relationship with," approached for a bank-reconciliation letter on the
  transferring bank (DB). SENSITIVE: living private banker, no wrongdoing alleged —
  documented contact only. DO NOT publish the individual's name; if used at all,
  keep to "a named Deutsche Bank relationship manager Kahn dealt with." Documented
  contact ≠ operational tie.
- Carbyne-side requester of controlling-person info: "Tomer" (Carbyne finance side).

NON-FINDINGS / HYGIENE:
- EFTA02730262 ("FW: NYO Update", FBI NY office, Mar 17 2020) is an internal FBI
  COVID-readiness admin email swept into the production — NOT Epstein-substantive.
  A reminder that the DOJ tranches contain unrelated material; do not over-read
  document presence as relevance.

═══════════════════════════════════════════════════════════════════════
DISPOSITION
═══════════════════════════════════════════════════════════════════════
- Verification wins raise internal confidence in the Carbyne node; no published
  text change strictly required (the report already cites these EFTA IDs).
- Candidate publishable extension: add "Lysys WLL" as the named Qatar intermediary
  on the existing Qatar edge (Section IV) — firm name only, or firm+manager.
- Do NOT publish the DB banker's name. Hold as research.
- JPhotos layer: closed, off-limits, not revisited.

═══════════════════════════════════════════════════════════════════════
DEEP-DIVE EXTENSION (document/email layer) — Wexner financial-control mechanics
═══════════════════════════════════════════════════════════════════════
Access: POST /api/emails/search {query} returns matchedEmail.content_markdown =
full verbatim body (non-redacted where isRedacted=false). This is the clean way to
pull primary email text jmail exposes.

PUBLISHED (Section III Wexner node, new bullet "The control, shown in primary email"):
- Richard Kahn (rkahn@nysgmail.com, 457 Madison Ave — Epstein's office), 6 Nov 2007,
  "re: Wexner Childrens Trust II": "...Wexner Childrens Trust II will be receiving
  two wires tomorrow totaling 18,000,000. Citigroup (Smith Barney) does not have all
  of Darren's FTC paperwork on file so I will be sending out both wires from FTC Bear
  Stearns tomorrow morning." NON-REDACTED. → $18M moved for a Wexner trust by
  Epstein's accountant, through Bear Stearns accounts, Indyke's paperwork.
- Indyke→Epstein, 6 Jun 2006, subj "WPH": "May I give Peg your approval?" →
  Epstein (jeeproject@yahoo.com): "yes". → Epstein's personal sign-off on a Wexner
  account action executed by Peg Ugland (Wexner/NAProperty staff). NON-REDACTED.
- Epstein→Abigail Wexner, 23 Nov 2007: "darren"+"gideon" opened a Citi account; the
  trader said he "could buy no more than an additional 50-100 thousand shares without
  moving the market." Abigail replies (24 Nov): "I spoke to Darren and told him not
  to worry about it- in the end it is fine and not a problem." NON-REDACTED. →
  Epstein inside Wexner-trust equity trading at market-moving size (L Brands stock).

WHY IT'S ON-THESIS: upgrades the report's ">$1.3B stock oversight" from secondary
(reporters' review) to PRIMARY corpus email showing the day-to-day mechanics of the
1991 power of attorney being exercised. Documents control, NOT motive; framed
consistent with both Wexner's misappropriation account and the report's open "why."

DISCIPLINE: Abigail Wexner named only as documented correspondent (living, uncharged,
family-as-victim per Les Wexner's statement) — no imputation. No motive asserted.

NOT PURSUED (correctly): "Peter Thiel vet" email (Lesley Groff, 1 Jul 2016) is
REDACTED to just that header line — insufficient to publish; over-reading it would be
the hyperspeculation the brief forbids. Report already tiers Thiel correctly.
