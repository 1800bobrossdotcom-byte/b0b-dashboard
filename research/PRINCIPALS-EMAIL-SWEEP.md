# PRINCIPALS EMAIL SWEEP — eleven names against the corpus

Internal research (`research/` is never served). Run 31 August 2026 at the author's
direction, on a list of eleven names supplied phonetically in part.

**Method.** `POST https://jmail.world/api/emails/search` with the name in double quotes
(exact-phrase). Results filtered a second time in-script: a hit counts only if the phrase
actually appears in `content_markdown`, then deduplicated by document id. Phonetic
spellings were resolved *against the corpus itself* rather than guessed — see §1.

**Standing rules applied throughout.** No living, uncharged person is asserted here to be a
criminal or an intelligence asset. No hex32 id is used as a citation. No FD-302, victim
interview, or protective-order material was opened. DOJ redactions were not
de-anonymised — every AUSA and OIA officer below is redacted in the source and stays
redacted here.

---

## 1. PHONETIC RESOLUTIONS — all four, confirmed by corpus text

| As supplied | Resolves to | How it was confirmed |
|---|---|---|
| "Lampo Elkum" | **Lapo Elkann** | 8 exact hits; appears in an event invitation circulated through CNH Industrial |
| "Eduardo Tiodorani" | **Eduardo Teodorani** | appears as `TEODORANI Eduardo (CNH)` — *in the same email as Elkann* |
| "Ramsey Alkouli" | **Ramsey Elkholy** | recovered by extracting every string following "Ramsey" in the corpus |
| "Fredric Feccai" | **Frédéric Fekkai** | matched, but see §4 — this one is a null |
| "Daniel Seod" | **Daniel Siad** *(probable)* | 13 two-way messages. A second candidate, **Daniel Sabba**, also exists — see §5 |

---

## 2. THE FINDING — two populations, and they are not the same kind of evidence

The corpus does not hold one undifferentiated pile of "Epstein contacts." It holds **two
structurally different record types**, and the difference is the whole result.

| Name | exact hits | message slips | two-way | pattern |
|---|---|---|---|---|
| Jes Staley | 49 | **47** | 0 | message slips only |
| Leon Black | 49 | **40** | 0 | message slips only |
| Tom Pritzker | 49 | **29** | 0 | message slips only |
| Glenn Dubin | 50 | **20** | 1 | overwhelmingly slips |
| Eduardo Teodorani | 48 | **19** | 0 | message slips only |
| Jean-Luc Brunel | 50 | 0 | **42** | two-way correspondence |
| Ramsey Elkholy | 49 | 0 | **44** | two-way correspondence |
| Daniel Siad | 50 | 0 | **13** | two-way correspondence |
| David Copperfield | 47 | 0 | 0 | incidental — see §4 |
| Lapo Elkann | 8 | 0 | 0 | incidental — see §4 |
| Frédéric Fekkai | 47 | 0 | 1 | **null** — see §4 |

**"Message slip"** means a note written by Epstein's executive assistant, **Lesley Groff**,
logging an inbound call: *"Please call Jes Staley."* *"Please call Tom Pritzker on his
cell."* *"Eduardo Teodorani returned your call."* *"Please call Glenn Dubin (w)."* These are
the digital form of a *while-you-were-out* pad.

**What a slip establishes: that the person telephoned, that the call was logged, and that
Epstein was expected to call back.** That is **access**, and access is a real finding — it
is precisely the hub metric the report already uses.

**What a slip does not establish: anything whatsoever about conduct.** No content, no
subject, no reciprocation, often not even a confirmed return call. A document proving a man
returned a phone call is not a document about what he did. **Any read of this material that
treats slip-volume as culpability is the naming error with a spreadsheet attached**, and the
report will not do it.

**The asymmetry is the point.** For the top five names the corpus holds a switchboard log.
For Brunel, Elkholy and Siad it holds Epstein writing to them and them writing back.
*Those are different evidentiary objects and the report must never flatten them into one
list.*

---

## 3. THE MLAT LAYER — the most significant thing this sweep found

Searching the surname "Brunel" surfaced a body of **DOJ mutual-legal-assistance
correspondence** that is not about the social network at all. All ids are `vol00009`
EFTA documents from the public release.

- **`EFTA00079595` — 30 December 2020.** Subject: *"Referral of MLAT Request from France
  (BRUNEL)."* France requesting assistance **from** the United States.
- **`EFTA00090301` / `EFTA00092518` — early January 2021.** An SDNY Assistant United States
  Attorney: *"Attached for your review is a draft MLAT to France regarding the witness we
  mentioned earlier this week. **The DOJ Attaché met with the Paris Prosecutor's Office
  about Brunel today.** We understand that they indicated a willingness to assist on the
  basis of an MLAT request, and that more generally, **they seemed willing to help us as
  long as the sharing is reciprocal.**"*
- **`EFTA00095574` — 7 January 2021.** Edits to that draft, including *"a sentence on the
  perjury count in the description."*
- **`EFTA00083721` — 10 February 2021.** Internal DOJ thread, subject `RE: Brunel`.
- **`EFTA00089377`** — OIA/London and the OIA Director for UK/Europe looped in, described as
  *"aware of the matter and its sensitivity."*

**Why this matters, stated carefully.** The report's Section V now carries the Brunel
assassination reading at hypothesis tier with a base-rate control. This material does not
touch that hypothesis in either direction. What it establishes is narrower and is
**documented**: *as of January 2021, Brunel was the live subject of active
US–French prosecutorial cooperation, running in both directions, with the French
conditioning help on reciprocity.* **He died in La Santé on 19 February 2022 — roughly
thirteen months later.**

**The limit travels with the fact.** Being an active investigative subject is a documented
attribute; it is not evidence of how he died, and the sequence is a shared timeline rather
than a chain — *anti-map guardrail, applied to a fact that helps the hypothesis, exactly as
it is applied to facts that hurt one.* What the record now supports is that he was
evidentially valuable to two governments at the time of his death. It supports nothing
about the death.

**Adjacent, and separately notable:**
- **`EFTA00099809`** — a draft MLAT seeking an interview with **Prince Andrew** regarding
  *"both the Epstein and Nygard investigations."* The Nygard pairing is not something the
  report currently carries.
- **`EFTA00085164` — 7 June 2020.** DOJ Criminal Division, on the Prince Andrew request:
  *"Yes. We have made a MLAT request, which is of course highly sensitive, and
  confidential."* — written the same evening British press reported it.
- **`EFTA00077374`** — a draft **UK** MLAT with a document-request section added.

---

## 4. THREE NULLS, PUBLISHED AS FINDINGS

The sweep is only worth anything if it reports the names it *cleared*.

- **Frédéric Fekkai — a null, and the cleanest one.** All 47 hits are **automated salon
  booking confirmations** from *"Frédéric Fekkai – Fifth Ave"*: `"Dear Jeffrey Epstein, We
  are writing to inform you that you have an appointment on 01/30/2018 starting at 03:30
  PM."` Some are addressed to Lesley Groff for her own appointments. **There is no
  correspondence between Epstein and Frédéric Fekkai in this corpus at all.** Epstein used
  the salon. That is the entire finding, and a name-match search that stopped at the hit
  count would have gotten this badly wrong.
- **David Copperfield — incidental.** 47 hits, all one transaction type: Epstein's office
  buying tickets to the Las Vegas show. *"is asking for Tix to David Copperfield in
  Vegas...OK to purchase? = $346.72 total."* Buying a ticket to a show is not a
  relationship with the performer.
- **Lapo Elkann — incidental, and declined.** 8 hits, all one thread: an invitation to a
  6 February 2014 reception at Robilant+Voena, London, for a Wayne Maser / Glenn O'Brien
  exhibition *featuring* Elkann. Groff's reply: *"Jeffrey will not be able to attend this
  event."* **The one documented outcome is a refusal.**

---

## 5. OPEN — needs the author's decision, not mine

**"Daniel Seod" has two candidates and I am not certain which he means.**

- **Daniel Siad** — the better phonetic fit and the better contextual fit. Thirteen two-way
  messages. Groff and Epstein repeatedly ask him to *"help facilitate"* contact with a woman
  who is not responding: *"I have emailed Daniel Siad asking if he can help facilitate."*
  *"i also have asked Daniel Siad a few times if he could help facilitate...ask her to call
  me."* One message carries only a first name as its subject.
- **Daniel Sabba** — ~40 hits, corresponding from **`daniel.sabba@db.com`**: a **Deutsche
  Bank** address, in threads with other DB staff, marked *Classification: Confidential*.

**Flagged rather than decided:** the standing instruction on this project is never to
publish the Deutsche Bank banker's name from the earlier document set. That instruction
named one specific person. **Daniel Sabba is a different individual**, so the instruction
does not literally cover him — but the reasoning behind it plainly might, and extending or
declining to extend a rule about a living person is the author's call and not mine. **No DB
name is published anywhere pending that decision.**

---

## 6. WHAT I WOULD PUBLISH, AND WHAT I WOULD NOT

**Would publish:**
1. The **two-populations finding** (§2) as a Section II subsection — it sharpens the hub
   metric and it *protects* five living people from a misread the raw hit counts invite.
2. The **MLAT layer** (§3) into the Section V Brunel entry, at documented tier, with the
   thirteen-month interval stated and the anti-map limit stated in the same breath.
3. All three **nulls** (§4) at equal prominence, because a sweep that only reports hits is
   a horoscope.

**Would not publish without direction:** any Deutsche Bank name; any characterisation of
the five slip-only individuals beyond "telephoned and was logged"; the Nygard/Prince Andrew
MLAT, which needs its own verification pass before it goes anywhere near the page.

---

*Counts in §2 are from a single API page per name (limit 50) and are therefore a floor, not
a census. The API's own `total` field is unreliable — it returned 1,000 for several
unrelated queries — so it is not used for any claim here.*
