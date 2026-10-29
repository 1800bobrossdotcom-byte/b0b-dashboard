# Epstein in other nations' FOI and records systems — sweep, 29 Oct 2026. HELD.

Author: *"Look across other nation state foia databases for epstein mentions"*.

**Method.**
- First pass: `spider.py foi find Epstein` across every searchable source in `scripts/spider/foi-sources.json`.
- Second pass: targeted queries for "Jeffrey Epstein" and "Ghislaine Maxwell". Sources included the UK Parliament written-questions API (the record of what UK departments say they hold), the GOV.UK content API, TNA Discovery by reference, and Canada's ATI completed-summaries datastore searched field by field.
- Every fetch went through the spider and is ledgered with the note `foi-epstein 29 Oct`.
- The US sources are out of scope. They also need the api.data.gov key, which is still unset.

**Stop rules held:** only catalogue entries, summaries, written answers and one government return were read. No document from the DOJ Epstein library was opened. No media was opened.

**Living-person floor:** this file records what governments wrote. Mandelson and Blair are living. The return quoted in §1.3 is the UK government's own document, and nothing here goes on the page without the author.

---

## 1. United Kingdom — the richest record, almost all of it refusals and retention nulls

### 1.1 Parliament's written questions (88 hits for "Epstein", Sept 2025 – Oct 2026)

What the departments answered:

**Mutual legal assistance: neither confirm nor deny.**
- Home Office, 24 June and 23 Oct 2026: "can neither confirm nor deny whether a request for Mutual Legal Assistance has been made or received".
- The FCDO, 2 July 2026: "Decisions on access to documents held by the United States are a matter for the relevant authorities in that country."
- *Page bearing:* XV/II say, attributed to the Washington Post (9 Sept), that Britain "had a formal request outstanding and unanswered". The UK government itself declines to confirm a request exists. Both can be true. If the line is touched, the government's position should sit beside the Post's.

**Intelligence: no comment.**
- The Security Service's knowledge (Home Office, 9 Feb 2026): "not to comment on intelligence matters".
- Whether Epstein passed information to Russia (31 Mar 2026): "not appropriate for the Government to comment on matters of intelligence or national security".
- This is a guaranteed null either way.

**Policing.**
- Home Office, 16 Mar 2026: "The National Police Chiefs’ Council has established a national coordination group and has appointed a senior investigator to support forces in reviewing the extensive material".
- Public inquiry (Cabinet Office, 21 Oct 2026): "a public inquiry is not being actively considered at this time".

**Records that no longer exist, or were never kept. This is the keepable finding: the retention schedule is the null.**

| What was asked | The answer, verbatim | Department, date |
|---|---|---|
| Epstein's visits to No 10 / No 11, 1997–2010 | "This information is not retained for the time periods specified." | Cabinet Office, 25 Feb 2026 |
| Visits to HM Treasury in Whitehall | "Visitor information for HM Treasury offices in Whitehall is not retained for the time periods specified." | Treasury, 23 Feb 2026 |
| Stansted private-flight passenger data | "this information is not retained more than 10 years" | Home Office, 26 Feb 2026 |
| DBT's search of 2009–10 BIS records | "A search has been conducted by Integrated Corporate Service containing the words “Jeffrey Epstein” and no records were found." | DBT, 30 Jan 2026 |
| Treasury's search | "has found no evidence of correspondence or meetings between Jeffrey Epstein and Treasury ministers, or any Treasury officials" | Treasury, 21 Oct 2025 |
| Crown Estate visitors | "its residential lease arrangements do not require monitoring or recording the identities of a leaseholder’s private visitors" | Treasury, 23 Feb 2026 |

**Royal records:**
- Governed by "the application of Freedom of Information exemptions that persist beyond 20 years" (FCDO, 3 Mar 2026, repeating an 11 Feb Commons answer).

**English-language courses as a visa route:**
- "There is no evidence indicating systemic misuse of English‑language course enrolment for trafficking or exploitation purposes" (Home Office, 22 May 2026).
- The question cited BBC reporting (24 Apr 2026) that Epstein paid for at least five women to study in London. That reporting is unread here.

### 1.2 The National Archives: two Blair-era No 10 files, open, unread

DCMS (3 Dec 2025) named them as the records cited at the Foreign Affairs Committee on 3 Nov 2025, saying they "can be viewed at The National Archives under references PREM 49/3326 and PREM 49/2771".

The catalogue (Discovery API by reference) shows:

| File | Catalogue description | Dates | Status |
|---|---|---|---|
| **PREM 49/3326** | "TRADE AND INDUSTRY. Meetings and correspondence with businessmen: part 3" | 15 Apr 2002 – 28 Jan 2003 | opened 23 July 2024; **digitised** |
| **PREM 49/2771** | "PRIME MINISTER. Prime Minister's international commitments: policy on foreign visitors; part 3" | 15 Mar – 21 May 2002 | opened 11 Nov 2025; **not digitised** |

**Neither catalogue entry names Epstein.** That is why Discovery returns **0** for "Jeffrey Epstein" and 0 for "Ghislaine Maxwell". The 717 "Epstein" hits are other people (Jacob Epstein the sculptor, WWI service records and so on).

**Lead:** download PREM 49/3326 (digitised) and read it. It is the primary record behind the meeting the Cabinet Office note in §1.3 describes.

### 1.3 The Humble Address return, 11 Mar 2026 (147 pages, laid in the Commons)

What it is:
- "Government response to Humble Address motion of 4 February 2026", the papers on the appointment of Lord Mandelson as ambassador.
- The PDF is ledgered; "Epstein" appears 12 times.

The due-diligence note records:
> "The Cabinet Office holds official records that are likely to be released by the National Archives early next year, which relate to a Tony Blair meeting with Epstein that was facilitated by Mandelson."

**Tier:**
- It is documented that the Cabinet Office wrote this.
- The meeting is attributed to the Cabinet Office note until PREM 49/3326 (or 49/2771) is read.
- The note also relays the 2019 JPMorgan report's line and press reporting; those are attributed to their sources, not to the government.

**HELD, living persons:** both men are living. The FCDO and DBT answers (3 June, 30 June 2026) say police investigations are live; the FCDO answer is the one about the 2024 National Crime Agency referral.

### 1.4 Not found

- The GOV.UK FOI-release search for "Epstein" returned **0**.
- WhatDoTheyKnow (the civil FOI log) refused: 403.

---

## 2. Canada — two access-to-information requests, both on the record

The ATI completed-summaries datastore (205,432 rows), searched on `summary_en`, has 3 "Epstein" hits. One is Epstein-Barr. The other two:

**Canada Border Services Agency, A-2026-06709 (April 2026):**
- The request: "Records regarding the United States citizen, Jeffrey Epstein’s visit to Vancouver, Canada, in 2014. Including case files and all related briefing materials prepared to date for the president of the Canada Border Services Agency and for the Public Safety minister."
- **Disposition EX: all exempted.**
- The report carries no Vancouver visit. The visit itself is not established here: the request states it, and the agency released nothing.

**Department of Justice Canada, X-A-2026-00002 (June 2026):**
- The request: "Documents from January 1, 2010 to April 2, 2026 containing the words “Jeffrey Epstein” or the acronym “JEE”".
- **Disposition DP: disclosed in part.** The pages field reads 0.

**Lead:** Canada lets anyone ask for a copy of a completed release informally. Asking Justice Canada for X-A-2026-00002 is the route. Nothing has been filed.

Also: the open-data catalogue search for "Epstein" returned 0. The "Maxwell" hits are unrelated (estates and properties).

---

## 3. Everywhere else: nulls

| Country | Source | Result |
|---|---|---|
| Israel | Movement for Freedom of Information (meida.org.il) | "לא נמצאו תוצאות מתאימות" (no matching results) |
| France | Service historique de la Défense | 77 hits, all WWII-era personnel and death files of other people named Epstein |
| Japan | JACAR | 2 hits, pre-war (a Czech hop exporter, "Epstein mendl guide 商会") |
| Japan | National Archives (NAJ) | 24 hits; none relevant on titles |
| New Zealand | DigitalNZ | 1,397 hits, all news items (RNZ), not records. **RNZ opted out of AI use (24 Oct rule), so none is cited.** |

**Refused (ledgered nulls):**
- Australia: Right to Know, 403.
- France: CADA's site, 403.
- Brazil: dados.gov.br, 401.
- The Wilson Center archive: unreachable.

**Blocked by robots.txt:**
- AskTheEU (EU);
- Madada (France);
- Archivportal-D (Germany);
- **eInnsyn (Norway)**. This is the one that matters, because Norway is where the page already records a parliamentary hearing and an unfulfilled request for legal assistance.

**Opted out, skipped (the author's standing call):** FragDenStaat (Germany) and LawLibrary (South Africa).

---

## 4. What would move this

1. **Read PREM 49/3326** (digitised at TNA). It would confirm or deny the Blair meeting at documented tier.
2. **Request Justice Canada's X-A-2026-00002 release** (informal request; the author's call, since it is filed in his name).
3. **Norway:** eInnsyn's journal search is barred to the crawler. The Storting's open-data API is the lawful alternative and is not yet probed.

## Q lines (checked with vq.py)

Q | https://questions-statements-api.parliament.uk/api/writtenquestions/questions/1916518 | can neither confirm nor deny whether a request for Mutual Legal Assistance has been made or received
Q | https://questions-statements-api.parliament.uk/api/writtenquestions/questions/1920241 | The Metropolitan Police operates independently of Government
Q | https://questions-statements-api.parliament.uk/api/writtenquestions/questions?searchTerm=Epstein&take=100 | It has been the long-standing policy of successive governments not to comment on intelligence matters.
Q | https://questions-statements-api.parliament.uk/api/writtenquestions/questions?searchTerm=Epstein&take=100 | The National Police Chiefs’ Council has established a national coordination group and has appointed a senior investigator to support forces in reviewing the extensive material
Q | https://questions-statements-api.parliament.uk/api/writtenquestions/questions?searchTerm=Epstein&take=100 | This information is not retained for the time periods specified.
Q | https://questions-statements-api.parliament.uk/api/writtenquestions/questions?searchTerm=Epstein&take=100 | Visitor information for HM Treasury offices in Whitehall is not retained for the time periods specified.
Q | https://questions-statements-api.parliament.uk/api/writtenquestions/questions/1881757 | this information is not retained more than 10 years
Q | https://questions-statements-api.parliament.uk/api/writtenquestions/questions/1873822 | A search has been conducted by Integrated Corporate Service containing the words
Q | https://questions-statements-api.parliament.uk/api/writtenquestions/questions/1834688 | has found no evidence of correspondence or meetings between Jeffrey Epstein and Treasury ministers, or any Treasury officials
Q | https://questions-statements-api.parliament.uk/api/writtenquestions/questions/1879316 | its residential lease arrangements do not require monitoring or recording the identities of a leaseholder’s private visitors
Q | https://questions-statements-api.parliament.uk/api/writtenquestions/questions/1881759 | the application of Freedom of Information exemptions that persist beyond 20 years
Q | https://questions-statements-api.parliament.uk/api/writtenquestions/questions/1931267 | a public inquiry is not being actively considered at this time
Q | https://questions-statements-api.parliament.uk/api/writtenquestions/questions/1856498 | can be viewed at The National Archives under references PREM 49/3326 and PREM 49/2771
Q | https://discovery.nationalarchives.gov.uk/API/records/v1/collection/PREM%2049%2F3326 | TRADE AND INDUSTRY. Meetings and correspondence with businessmen: part 3
Q | https://discovery.nationalarchives.gov.uk/API/records/v1/collection/PREM%2049%2F2771 | Prime Minister's international commitments: policy on foreign visitors; part 3
Q | https://assets.publishing.service.gov.uk/media/69b13135cdd628b29e3495f8/V1_FINAL.pdf | which relate to a Tony Blair meeting with Epstein that was facilitated by Mandelson
Q | https://open.canada.ca/data/api/action/datastore_search?resource_id=19383ca2-b01a-487d-88f7-e1ffbc7d39c2&limit=100&q=%7B%22summary_en%22%3A%22Epstein%22%7D | Records regarding the United States citizen, Jeffrey Epstein’s visit to Vancouver, Canada, in 2014
Q | https://open.canada.ca/data/api/action/datastore_search?resource_id=19383ca2-b01a-487d-88f7-e1ffbc7d39c2&limit=100&q=%7B%22summary_en%22%3A%22Epstein%22%7D | containing the words “Jeffrey Epstein” or the acronym “JEE”
