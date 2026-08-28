# DARPA in the Epstein files — primary-source record

Internal research reference. NOT published (lives in `research/`, outside `site/`, never
served). Records the corpus sweep of 28 August 2026 behind the Section II subsection
*"Test one, worked - the sitting director of DARPA."*

---

## Why this exists

The author asked for anything in the **Epstein files** mentioning DARPA, CIA and
Lockheed. (I first searched `site/report.html` by mistake and shipped a concordance
over the report; that page stays live but answers a different question.) This note
covers the corpus sweep proper, narrowed on the author's instruction to **the DARPA
finding and its positioning**.

## Method, and its hazards

Discovery through the jmail.world API over the DOJ + House Oversight releases, exactly
as documented in `OCR-DOCUMENT-LAYER.md`:

```
POST /api/emails/search      {query, limit}  → thread + matchedEmail.content_markdown
POST /api/documents/search   {query, limit}  → doc metadata + justice.gov source_url
POST /api/documents/read     {doc_id}        → extracted text (TRUNCATED at 8,000 chars)
```

**Discovery only.** Every fact that reached the report was then re-derived from the
government's own PDF, fetched from `justice.gov` by Bates number with the
`justiceGovAgeVerified=true` interstitial cookie and extracted with `pypdf`. Hashes below.

Three hazards, all observed and all worth recording:

1. **The search is semantic, so raw counts mean little.** `In-Q-Tel` returns 1,000+ hits
   whose top results are *"Q SQUARED: Shipment 4"* purchase orders matching a stray
   token. `Skunk Works` returns one hit, a Yellen markets note. Nothing was counted
   until the term was confirmed literally in the primary text.
2. **The production is massively duplicated.** The Nikolic *"regina dugan"* line appears
   under at least **seven** distinct Bates numbers; one unrelated trading email appears
   eight times. Raw hit counts are not item counts and must never be reported as such.
3. **`documents/read` truncates at 8,000 characters.** A mention on page 30 of a 36-page
   PDF reads as a miss. Fetching the source PDF is the only complete read.

Raw hit counts, recorded for scale only and **not** to be published as findings:
**DARPA 155 emails / 165 documents · Lockheed 110 / 228 · CIA 516 / 879.**

---

## Verified against justice.gov

Downloaded in full and read from the Department's own PDF.

| Bates | DataSet | Pages | Bytes | sha256 (first 16) |
|---|---|---|---|---|
| `EFTA00915179` | 9 | 2 | 77,347 | `a04d0e64c51d3afa` |
| `EFTA00915712` | 9 | 2 | 76,198 | `fa624ccd0349e4b0` |
| `EFTA00428373` | 9 | 1 | 11,687 | `15dedc8d2b2641b6` |
| `EFTA00592182` | 9 | 5 | 404,047 | `07782cbf253aa37a` |
| `EFTA02184341` | 10 | 1 | 14,045 | `85023ff35c45985e` |
| `EFTA01846119` | 10 | 2 | 84,341 | `fd3594458c3be60d` |
| `EFTA01921242` | 10 | 2 | 157,571 | `8b68efb9e25bb5aa` |
| `EFTA02570568` | 11 | 1 | 51,994 | `916de4178193f467` |

URL pattern: `https://www.justice.gov/epstein/files/DataSet%20<N>/<BATES>.pdf`

`EFTA01845647` and `EFTA02570478` returned **401** (a 7,244-byte interstitial, not the
document). They are duplicates of items verified above and nothing rests on them.

---

## The record, verbatim

**Regina Dugan was Director of DARPA from July 2009 to March 2012** — the first woman to
lead the agency. She spoke at TED2012 (Long Beach, February 2012) and announced her move
to Google weeks later.

**EFTA00592182** (DataSet 9, 5 pp). The full *New York Times* article, John Markoff,
published **12 April 2010**: *"New Force Behind Agency of Wonder … LEADER Regina Dugan of
the Defense Advanced Research Projects Agency."* Present in the production as its own
document.

**EFTA00915179 / EFTA00915712** (DataSet 9). Thread, subject **"Re: Regina Dugan"**:

- **Nikolic → Epstein, Sat 16 Jul 2011 4:24 PM:** *"You would like her a lot! We need to
  schedule a trip to DC sometime soon. B"*
- **Epstein → Nikolic, 7:50 PM** (`jeevacation@gmail.com`): *"whenever you want.. what
  time should we speak,, sam told steve that he was considering his career move,, I will
  force the issue"*
- **Nikolic, 8:24 PM:** *"Can you talk now? Which number"*
- **Epstein, Sun 17 Jul 05:01 UTC:** *"estate lodge 93"*
- **Epstein, Sun 17 Jul 13:43 UTC:** *"ask her if she will be in ny, when you are there"*

Not redacted. Both documents carry Epstein's standard confidentiality footer.

**EFTA02184341** (DataSet 10), Wed 7 Sep 2011 13:02 UTC — subject and body are the whole
document: *"Alarm - remind JE Regina, darpa"* / *"September 6, 2011 7:00 AM : remind JE
Regina, darpa"*.

**EFTA00428373** (DataSet 9), Mon 12 Sep 2011 13:09 UTC — the same alarm with the name
**redacted by DOJ**: *"Alarm - remind JE [redacted], darpa"*.

**EFTA01846119** (DataSet 10), 12 Jan 2012:

- **Epstein → Nikolic, 5:58 AM:** *"are you seeing regina dugan?, I know that Tom pritsker
  saw her this week"*
- **Nikolic → Epstein, 4:33 PM:** *"I will most see her before TED as I am start
  traveling. In Next three weeks — Miami, Davos, Zurich, London, Bruxelles. Early—mid Feb
  — Seattle, LA, San Diego, San Francisco. Mid-end Feb — Madrid, NYC, Boston and from
  there to Long Beach — so no time for DC. **You and me will spend time with her at TED.**
  There is few big things happening with her but let's discuss over the phone."*

**EFTA02570568** (DataSet 11), 30 May 2013 — sent **to Jeffrey Epstein and Tom Pritzker**:
the AllThingsD piece *"Electronic Tattoos and Passwords You Can Swallow. Google's Regina
Dugan Is a Badass."* Fourteen months after she left DARPA.

**EFTA01921242** (DataSet 10), Fri 8 Jun 2014 — **Joi Ito → Epstein**, forwarding an
agenda from Jonathan Sackner-Bernstein MD: *"I'm on a funny new group advising DRPA's
biological technology office. First call is today. Maybe a good tie-in with CCC stuff."*
Subject: *"Fwd: DARPA-BTO Polymaths."* DARPA's Biological Technologies Office was
established in 2014 — the same office the report's Section XVI disclosure-cycle
derivation already names.

---

## What is documented and what is not

**Documented:** Epstein's sustained, scheduled, brokered interest in Dugan across
2010–2013; Nikolic's offer to introduce them and his stated plan to bring them together
at TED; Pritzker's presence in the same conversations; Joi Ito's report to Epstein of his
DARPA-BTO advisory role.

**Not documented, and stated as such in the published passage:** that Dugan met Epstein,
corresponded with him, knew of his interest, or was aware he existed. Nikolic's *"you and
me will spend time with her at TED"* is Nikolic's plan; nothing shows it happened.

**The adverse finding, published alongside the hypothesis.** The interest **continued
after she left DARPA** (the May 2013 Google item). Had the agency been the object, it
should have ended with the directorship. It did not — which fits a man collecting
interesting people at least as well as a man collecting an agency. Section II's test one
still fails to discriminate, and the published passage says so.

---

## Reviewed and deliberately excluded

- **A 2014 DoD Inspector General finding about Dugan's own conduct.** Real and public, and
  it does no work on the Epstein question. Including an unrelated adverse finding about a
  living, uncharged person because she is otherwise in the story is smearing, not
  sourcing. Left out on purpose, recorded here so the omission is a decision.
- **A Jan 2015 email boasting of receiving a CIA medal from John Brennan.** Sender not
  yet identified; held until it is, and to be dropped if it cannot be.
- **The Ben Goertzel thread (Apr 2008)**, in which Goertzel proposes *"a DARPA-style
  funding model"* for an Epstein-funded AI competition. Only a simile — DARPA is the
  adjective, not a party — so it carries no edge and was not published.

## Held, not published — the other two terms

The author narrowed this pass to DARPA. Both of these are verified enough to write up if
asked:

- **CIA.** The one substantive item is **18 Jul 2011**, with defence counsel **Martin
  Weinberg**, subject *"Re: CIA FOIA Request"*: *"did we fill out one for the fbi foia?
  did we not send anything yet to cia?"* — **Epstein preparing Freedom of Information
  requests to the FBI and the CIA about himself.** Lands on Branch B and on the asset
  question. The rest of the 516 is news clippings, idiom (*"it looks like a cia drop"*)
  and one Quora answer.
- **Lockheed — a null, and a useful one.** Essentially the entire 110 is **one thread,
  2 Mar 2018**, a trading idea from Paul Barrett: *"Buying 260/250 SPY put spreads …
  Selling puts on Raytheon, GD, Lockheed and Northrop."* Epstein: *"i never like selling
  puts. it is a sucker play."* The report devotes a whole subsection to Lockheed as the
  case study of private capability fused with the secret state; **in Epstein's own files
  Lockheed is a ticker, not an intelligence edge.** Publishing that gap would be the same
  discipline as refusing the `epstein-data.com` numbers.
