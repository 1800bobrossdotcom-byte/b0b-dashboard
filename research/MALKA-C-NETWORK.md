# malka — C (network: documented edge list, second-ring touches, Epstein-corpus check)

**Summary.** Identity is fixed by the filings: "Meyer 'Micky' Malka Rais", founder and managing partner of Ribbit
Capital since May 2012 (MercadoLibre 8-K, 2013; Ribbit's Form ADV). **First-ring board seats, documented from
SEC filings:** MercadoLibre (5 Mar 2013 to the 2021 annual meeting), Nu Holdings (listed as a director on its Form D
notices of 2 Mar 2018 to 11 Feb 2021; absent from the Nov 2021 F-1), Ribbit LEAP (the Ribbit SPAC, Sept 2020 to
Aug 2022, chairman and CEO), Robinhood Markets (23 Mar 2022 to date), and **Apollo Global Management, Inc.:
appointed 20 Oct 2026, effective 1 January 2027, so not yet seated.** He was never on Coinbase's board (EDGAR
full-text: "Malka" 0 in Coinbase filings). **Second ring:** the shortest documented path to Leon Black is two hops
and runs through an institution, not a relationship (Malka → AGM board-designate → Black, a 6.6% AGM stockholder
who left the board on 21 Mar 2021; their board service never overlaps). JPMorgan is two hops through a
MercadoLibre co-director who was a JPMorgan executive at the time. a16z is two hops through a documented $42.9m
Ribbit-to-a16z sale of Coinbase preferred stock (Oct 2019). Founders Fund is two hops through a shared Affirm
investors' rights agreement, and Reid Hoffman three, through the Hippo PIPE. **Epstein: no documented edge to Malka.**
The nearest touch is that Ribbit and Epstein are both reported investors in Coinbase's Jan 2015 Series C:
Ribbit's part is documented, Epstein's is attributed (a Blockchain Capital spokesperson). **Corpus: no message
from, to or about Malka as a correspondent.** He appears only by name and title in one conference-invitation
roster (Dialog 2014, Nov 2012, 10 copies). "Ribbit" appears twice, both in third-party deal mentions. "Nubank" 0.
"Robinhood" is mostly the Robin Hood Foundation charity, a naming error. **Method flag, for the author:
jmail.world's robots.txt disallows `/api/` for all agents. I read it after the searches below had run (about 14
API requests). I made no further API calls, so the Robinhood re-filter is incomplete (see §2).**

---

## 1. Identity: which Malka

- The MercadoLibre 8-K of 7 Mar 2013 names him and fixes his career: Heptagon (1991), Patagon (1998, sold to
  Santander, Mar 2000), Banco Lemon (2003, sold to Banco do Brasil 2009), Bling Nation/Lemon (2008–2011), Ribbit
  Capital (since May 2012). The Robinhood 2026 proxy repeats it.
Q | https://www.sec.gov/Archives/edgar/data/1099590/000117184313000915/f8k_030713.htm | Meyer “Micky” Malka Rais, 38, is the managing partner at Ribbit Capital, a venture capital fund focused on investing in innovative companies in the financial services sector, a position he has held since May 2012.
Q | https://www.sec.gov/Archives/edgar/data/1099590/000117184313000915/f8k_030713.htm | In 2003, he co-founded Banco Lemon, a Brazilian retail bank serving the underbanked population
- Ribbit's own Form ADV (annual amendment, 30 Mar 2026; SEC 801-111886, CRD 165308) lists him as managing director
  from 03/2012, ownership code E (75% or more), a control person. It also lists Cynthia McAdam, chief operating
  officer from 12/2016. A chief compliance officer from 10/2021 is a private individual and is not named here.
Q | https://reports.adviserinfo.sec.gov/reports/ADV/165308/PDF/165308.pdf | Primary Business Name:RIBBIT CAPITAL CRD Number: 165308
  (PDF, extracted locally with `scripts/sweep/pdftext.py`. In the Schedule A text the row reads
  "MALKA, MEYER I MANAGING / DIRECTOR / 03/2012 E Y N", broken across lines.)
TIER: documented (issuer and adviser filings).

## 2. Corpus check: the Epstein email corpus (jmail)

**Method:** `POST https://jmail.world/api/emails/search`, `curl -sL`, exact phrase in double quotes, `limit` 50, up to
four pages. Hits were re-filtered in-script and deduplicated by id and by normalised body. The API `total` is not
cited. **Two deviations, both stated:**
1. **`content_markdown` in the search response is truncated to about 500 characters**, often *before* the match.
   A re-filter against it alone undercounts. Here it returned "Malka" 1 and "Meyer Malka" 0 when the real counts
   are 14 and 9. So I classified every raw result by reading the response's `preview` field, which carries the
   matched passage, with the bold tags stripped. Every raw result is accounted for below, except Robinhood.
2. **robots.txt.** jmail.world/robots.txt reads, for `User-agent: *`, `Disallow: /api/` and `Crawl-delay: 10`. I read
   it after the searches had run. Counting those, one test query, two re-queries for previews and four probes of
   thread endpoints, I made about 14 requests to `/api/`. **I stopped there.** This is the same situation as
   Nominatim on 22 Oct: the standing CLAUDE.md method (§4 trap list, MAXWELL-SIBLINGS §2) uses an endpoint the
   host's robots disallows. **That is the author's call, and it applies to every corpus sweep, not only this one.**
   Thread pages (`/thread/<id>`) are allowed, but the spider gets only the page title, because the body is rendered
   client-side.

| phrase | raw results | real hits after classification | what they are |
|---|---|---|---|
| "Micky Malka" | 0 | 0 | — |
| "Meyer Malka" | 9 | 9 copies of **one** item | Dialog 2014 invitation roster (below) |
| "Malka" | 14 | 10 Dialog copies + 4 other Malkas | see below |
| "Ribbit Capital" | 1 | 1 | Coinbase Series C allocation offer (below) |
| "Ribbit" | 2 | 2 | the same, plus a 2014 news link |
| "Nubank" | 0 | 0 | — |
| "Robinhood" | 50 (page 1 of 1) | at least 14 classified; 36 unclassified | mostly the Robin Hood Foundation charity |

**"Meyer Malka": one item in ten copies.** These are 28 Nov 2012 copies of *"Invite to Dialog 2014 (16 months
away)"*: HOUSE_OVERSIGHT_017574, HOUSE_OVERSIGHT_017581, EFTA01763941, EFTA01974657, EFTA01999261,
vol00009-efta00701362, vol00009-efta00949243, EFTA01974883, EFTA01975835 and EFTA02001473. Some are "Fwd:" and three
are "Re:". The thread page's title gives the sender as Auren Hoffman. **Malka appears only as one line in a list
of names and titles.** One copy's OCR reads "Mcycr". Whether the list is of invitees, attendees or past attendees
could not be read; the full body is behind the disallowed API. The "Re:" copies show that someone replied; who
replied, and what they said, is unread. This is a lead, not a citation.
CQ | HOUSE_OVERSIGHT_017574 (jmail search preview) | Meyer Malka** - co-CEO, Lemon.
Q | https://jmail.world/thread/HOUSE_OVERSIGHT_017574 | Auren Hoffman: Fwd: Invite to Dialog 2014 (16 months away)
TIER: documented as a name on a roster. **It is not an edge**: a list naming two people is not a relationship
between them. The title "co-CEO, Lemon" matches his record (MercadoLibre 8-K: Lemon, Inc., co-founder), which
fixes the identity.

**"Malka", the other four hits: all different people, none of them him.**
- 24 May 2006, *"Re: Release Agreement"* (jmail id 9e24a63b…, a hex id, so a lead only). Epstein's counsel writes
  that "Malka accepted the enclosed draft of the Release Agreement", which is reciprocal and includes an Ohio
  coffee LLC and two other individuals. The release also covers parties initialled "LHW and ASW". **Identity not
  established, and presumptively a different person:** in 2006 Meyer Malka was building Banco Lemon in Brazil
  (8-K), and nothing in the snippet ties this party to him. The counterparties are private individuals and are
  not named here. The initials are recorded as written and not expanded; they are a lead, not a citation.
- 23 May 2012, a news forward quoting a French lawyer surnamed Malka, acting for Strauss-Kahn (Reuters).
- 27 Aug 2009, a photo-exhibition flyer listing a photographer surnamed Malka.
- 9 Dec 2015, a news item about a 2015 Jerusalem stabbing whose victim has the surname. **The victim was a minor
  and is not named.**

**"Ribbit" / "Ribbit Capital": two third-party mentions, no Malka.**
- **vol00009-efta00679451, 1 Dec 2014, Brock Pierce to Epstein** ("Fwd: The Stephens brothers - Potential Series C
  Investors"). Pierce offers Epstein an allocation in Coinbase's Series C and lists the syndicate: "DFJ Growth,
  a I 6z (Andreessen Horowitz), USV, Ribbit Capital and a few bank venture arms". **This is the only place Ribbit
  and Epstein meet in the corpus.** Pierce names Ribbit as a co-investor in a round he is selling. It is not a
  contact between Ribbit and Epstein.
CQ | vol00009-efta00679451-pdf | The syndicate of investors in the round are DFJ Growth, a I 6z (Andreessen Horowitz), USV, Ribbit Capital and a few bank venture arms and traditional financial service players.
- EFTA01929230, 20 Mar 2014, from Austin Hill (an entrepreneur and public figure). The word appears only inside a
  NYT DealBook URL ("fortress-benchmark-and-ribbit-buy-stake-in-pantera-bitcoin").

**"Robinhood": mostly a naming error.** The 14 hits classified from snippets break down as follows.
- **Ten are the Robin Hood Foundation, the New York charity:** its newsletters; the investors conference; and the
  **12 Dec 2012 Concert for Sandy Relief** at Madison Square Garden. The assistant's calendar lists that event
  "w/Jes Staley", and the same day's schedule carries "Appt w/Leon Black" (EFTA01993015, EFTA02153193,
  EFTA02153485, EFTA01912014, EFTA01996185, EFTA02154725). None of this is Robinhood Markets.
- **Four are Robinhood the brokerage app (2018), none naming Malka or Ribbit:**
  - a referral-link spam message, 2 Jun 2018;
  - a correspondent's Feb 2018 note on Coinbase's valuation ("Robinhood just launch a crypto app");
  - a Mar 2018 article link on Robinhood's business model;
  - a Dec 2018 list of private individuals with job titles, one of them a Robinhood finance employee. **Not
    named; private.**
- **36 results are unclassified.** Their match lies outside the truncated snippet, and I did not re-query (see
  deviation 2). The count is a floor.

**Stop rules:** no FD-302, victim interview, protective-order material or imagery was opened. Nothing here was
read beyond the search snippets.

## 3. First ring: boards (co-directors in office at the same time)

**MercadoLibre, Inc. (Nasdaq: MELI): 5 Mar 2013 to the 2021 annual meeting.**
Q | https://www.sec.gov/Archives/edgar/data/1099590/000117184313000915/f8k_030713.htm | the Board unanimously approved the appointment of Meyer Malka as a Class II director of the Company, effective immediately
Q | https://www.sec.gov/Archives/edgar/data/1099590/000114036122016252/ny20001488x1_def14a.htm | Mr. Malka relinquished his position at the end of his term, which coincided with the date of the 2021 Annual Meeting.
- Robinhood's 2026 proxy gives the end as "April 2021". MELI's own proxy ties it to the 2021 annual meeting, and
  the 2021 proxy's filename date is 8 June 2021. The issuer's own statement governs.
- Co-directors on the 2021 proxy's roster: Susan Segal, Mario Vázquez, Alejandro Nicolás Aguzin (director since
  2017), Nicolás Galperin, Emiliano Calemzuk, Marcos Galperin and Roberto Balls Sallouti. Henrique Dubugras was
  elected at the 2021 meeting, to Malka's seat.
Q | https://www.sec.gov/Archives/edgar/data/1099590/000156276221000170/meli-20210608xdef14a.htm | from 2020 to May 2021, Mr. Aguzin served as the CEO of J.P. Morgan’s International Private Bank
Q | https://www.sec.gov/Archives/edgar/data/1099590/000156276221000170/meli-20210608xdef14a.htm | Mr. Aguzin held leadership roles spanning lines of business and geographies during his 30 years with J.P. Morgan
TIER: documented.

**Nu Holdings Ltd. (Nubank): director on Form D notices, Mar 2018 to Feb 2021.** The Form D "related persons" list
names him as a director in each notice from 2 Mar 2018 to 11 Feb 2021. The 11 Feb 2021 notice also names David
Vélez Osorno, Doug Leone, Nicolas Carlos Szekasy and Anita Sands. EDGAR full-text returns "Malka" in five Nu filings,
all of them Form Ds. **The Nov 2021 F-1/A does not name him**, so his seat ended between Feb and Nov 2021. The exact
date is not found. The Form Ds print personal addresses; none is reproduced here.
Q | https://www.sec.gov/Archives/edgar/data/1691493/000169149321000001/primary_doc.xml | Meyer "Micky" Malka
Q | https://www.sec.gov/Archives/edgar/data/1691493/000169149318000001/primary_doc.xml | Meyer "Micky" Malka
- Ribbit is a Nu shareholder of record and a party to the IPO registration rights agreement of 18 Nov 2021, signed
  for Ribbit by McAdam.
Q | https://www.sec.gov/Archives/edgar/data/1691493/000119312521342848/d213207dex42.htm | RIBBIT CAPITAL VI, L.P., for itself and as nominee for Ribbit Founder Fund VI, L.P.
TIER: documented, for the seat (by Form D) and the holding. End date: not established.

**Ribbit LEAP, Ltd. (the Ribbit SPAC): Sept 2020 to Aug 2022, co-founder, CEO and chairman.**
Q | https://www.sec.gov/Archives/edgar/data/1818346/000104746920004858/a2242371z424b4.htm | Meyer Malka 46 Co-Founder, Chief Executive Officer and Chairman
Q | https://www.sec.gov/Archives/edgar/data/1783879/000178387926000053/hood-20260422.htm | Ribbit LEAP, Ltd. , a special purpose acquisition company (September 2020 - August 2022)
- The other LEAP officers and directors at the IPO were Cynthia McAdam (COO, a Ribbit partner), Joseph Kauffman
  (director; CFO of Credit Karma, a Ribbit portfolio company) and Susan Segal (director).
Q | https://www.sec.gov/Archives/edgar/data/1818346/000104746920004858/a2242371z424b4.htm | In January 2015, Mr. Kauffman joined Credit Karma, Inc as chief financial officer. Ribbit Capital has held a minority interest in Credit Karma since March 2013.
Q | https://www.sec.gov/Archives/edgar/data/1818346/000104746920004858/a2242371z424b4.htm | From 1997 to 2002, she was a partner and Latin American Group Head at JPMorgan Partners/Chase Capital Partners
TIER: documented.

**Robinhood Markets, Inc. (HOOD): 23 Mar 2022 to date.**
Q | https://www.sec.gov/Archives/edgar/data/1783879/000119312522082757/d295362d8k.htm | appointed Meyer “Micky” Malka to the Board, effective immediately
Q | https://www.sec.gov/Archives/edgar/data/1783879/000178387926000053/hood-20260422.htm | Meyer Malka INDEPENDENT Age: 51 Director Since: March 2022
- Co-directors at appointment, from the 2022 proxy: Vladimir Tenev, Baiju Bhatt, Paula Loop, Dara Treseder, Robert
  Zoellick, Frances Frei, Jonathan Rubinstein and Scott Sandell (NEA).
- On the 2026 proxy: Tenev, Bhatt, John Hegeman (2025), Loop, Christopher Payne (2024), Rubinstein, Susan Segal
  (2024), Treseder and Zoellick.
- **Susan Segal therefore sits with him on three boards: MELI, Ribbit LEAP and Robinhood.**
Q | https://www.sec.gov/Archives/edgar/data/1783879/000178387922000090/fscmix-robinhood2022proxy.htm | Scott Sandell 57 2016
Q | https://www.sec.gov/Archives/edgar/data/1783879/000178387926000053/hood-20260422.htm | Robert Zoellick Chair, Americas, Temasek Holdings (Private) Limited
- The independence finding discloses the Ribbit holding:
Q | https://www.sec.gov/Archives/edgar/data/1783879/000178387926000053/hood-20260422.htm | which held more than 5% of the Company’s outstanding common stock at the time of the IPO until it reported that it held 5% or less of the Company’s outstanding common stock as of December 31, 2024
TIER: documented.

**Apollo Global Management, Inc. (APO): appointed 20 Oct 2026, effective 1 Jan 2027. Not yet seated as of 26 Oct
2026.** This is "AGM", the holding company, not "Apollo Global Wealth"; that naming question belongs to beat B.
Q | https://www.sec.gov/Archives/edgar/data/1858681/000095014226002794/eh260845009_8k.htm | appointed Mr. Meyer “Micky” Malka to fill the resulting vacancy
Q | https://www.sec.gov/Archives/edgar/data/1858681/000095014226002794/eh260845009_8k.htm | Both the Board size increase and Mr. Malka’s appointment to the Board will be effective as of January 1, 2027.
Q | https://www.sec.gov/Archives/edgar/data/1858681/000095014226002794/eh260845009_8k.htm | There are no actual or proposed transactions between Mr. Malka or any of his related persons and AGM that would require disclosure under Item 404(a) of Regulation S-K.
Q | https://www.sec.gov/Archives/edgar/data/1858681/000095014226002794/eh260845009_ex9901.htm | Apollo Appoints Ribbit Capital Founder Meyer “Micky” Malka to Board of Directors
TIER: documented, as an announced appointment. There are no co-directors "in office at the same time" yet.

**Not a board seat:** Coinbase. EDGAR full-text returns "Malka" 0 across Coinbase filings. Ribbit was a >5%
holder; that is an investment edge, below. Root, Figure, Wealthfront and Hippo name him only as the person with
voting control over Ribbit's holdings, not as a director. Root's Ribbit-affiliated director is Nick Shalek.
Q | https://www.sec.gov/Archives/edgar/data/1788882/000178888221000018/root-2021annualproxystatem.htm | Mr. Shalek has served as a member of our board of directors since June 2017. Since August 2012, Mr. Shalek has served as a General Partner at Ribbit Capital

## 4. First ring: Ribbit co-investors named in a filing or a release

- **Coinbase.** Ribbit is a party to the Investors' Rights Agreement of 15 Mar 2021 (restating 26 Oct 2018),
  alongside Andreessen Horowitz Fund III, Union Square Ventures, Greylock 15, DFJ and others.
Q | https://www.sec.gov/Archives/edgar/data/1679788/000162828021004939/exhibit42-sx1a1.htm | Andreessen Horowitz Fund III, L.P., as nominee Union Square Ventures 2012 Fund, L.P. USV Investors 2012 Fund, L.P. Ribbit Capital, LP
Q | https://www.sec.gov/Archives/edgar/data/1679788/000162828021004939/exhibit42-sx1a1.htm | Greylock 15 Limited Partnership
- **A direct transaction between Ribbit and a16z, Oct 2019:** Ribbit entities sold Coinbase preferred stock to a16z
  entities.
Q | https://www.sec.gov/Archives/edgar/data/1679788/000162828021006850/coinbaseglobalinc424b.htm | In October 2019, entities affiliated with Ribbit Capital, a holder of more than 5% of our capital stock, sold, at a purchase price of $23.00 per share, (i) an aggregate of 1,864,094 shares of our convertible preferred stock to entities affiliated with Andreessen Horowitz
Q | https://www.sec.gov/Archives/edgar/data/1679788/000162828021006850/coinbaseglobalinc424b.htm | for an aggregate purchase price of $42.9 million
Q | https://www.sec.gov/Archives/edgar/data/1679788/000162828021006850/coinbaseglobalinc424b.htm | Marc L. Andreessen has served as a member of our board of directors since December 2020. Mr. Andreessen is a co-founder and has been a general partner of Andreessen Horowitz, a venture capital firm, since July 2009.
- **Coinbase Series C, Jan 2015, $75m:** led by DFJ Growth, with Ribbit, USV and a16z participating (press, which
  reproduces Coinbase's announcement; Coinbase's own post was not reached, and CoinDesk's copy returned 404).
Q | https://www.entrepreneur.com/article/241995 | The massive financing round was led by DFJ Growth, with participation from earlier investors Ribbit Capital, Union Square Ventures and Andreessen Horowitz.
- **Affirm.** Ribbit Capital III and the Founders Fund entities are both "Investors" under Affirm's amended and
  restated IRA of 11 Sept 2020.
Q | https://www.sec.gov/Archives/edgar/data/1820953/000110465920126927/tm2026663d5_ex4-2.htm | INVESTOR: RIBBIT CAPITAL III, L.P., for itself and as nominee
Q | https://www.sec.gov/Archives/edgar/data/1820953/000110465920126927/tm2026663d5_ex4-2.htm | The term “ Permitted Founders Fund Entities ” means Founders Fund, LLC
- **Hippo (2021 de-SPAC with Reinvent Technology Partners Z).** Ribbit Capital VI held 300,000 PIPE shares.
  Reinvent Capital Fund, co-founded by Reid Hoffman, funded $10m of the same PIPE, and Hoffman is a member of the
  sponsor.
Q | https://www.sec.gov/Archives/edgar/data/1828105/000119312521255094/d554403ds1.htm | Shares hereby offered consist of 300,000 PIPE Shares held directly by Ribbit Capital VI, L.P.
Q | https://www.sec.gov/Archives/edgar/data/1828105/000119312521255094/d554403ds1.htm | Meyer Malka is the director of Ribbit Capital GP VI, Ltd. and has voting and/or investment control over the shares held by Ribbit Capital VI, L.P.
Q | https://www.sec.gov/Archives/edgar/data/1828105/000119312521255094/d554403ds1.htm | Reinvent Capital Fund LP, a fund co-founded by Reid Hoffman, Mark Pincus and Michael Thompson, funded $10 million of the PIPE Investment
- **Nubank Series D, Dec 2016, $80m, led by DST Global, with Ribbit new and Founders Fund returning.** This rests on
  LAVCA's summary of the NYT, so it is attributed. The Nu RRA's "FF Brazil, LLC", signed by Scott Nolan, a Founders
  Fund partner, is **not stated anywhere read to be Founders Fund**, so that hop is not counted.
Q | https://www.lavca.org/brazils-nubank-receives-us80m-series-d/ | DST Global, the investment firm started by Russian venture capitalist Yuri Milner, led a US$80m round in Nubank , with participation from Redpoint Ventures and Ribbit Capital. Prior investors Sequoia Capital, QED Investors, Tiger Global Management and Founders Fund also participated.
- **Founders Fund and Thiel,** from Founders Fund's own page:
Q | https://foundersfund.com/team/peter-thiel/ | He is a partner at Founders Fund
Q | https://foundersfund.com/team/peter-thiel/ | he cofounded Palantir Technologies, where he serves as chairman
TIER: documented for Coinbase, Affirm and Hippo, and for the Oct 2019 transaction. Attributed for the Nubank
Series D and the Coinbase Series C participant list.

## 5. Second ring: shortest documented paths to the page's nodes

**A co-holding or co-directorship is a documented business relationship and nothing more.** Hop counts are given so
they can be checked. They are not findings.

| page node | shortest documented path | hops | note |
|---|---|---|---|
| **Leon Black / Apollo** | Malka → AGM (director, effective 1 Jan 2027) → Black (5% stockholder, 6.6%, AGM 2026 proxy) | 2 | **No overlap in board service:** Black left the board on 21 Mar 2021, and Malka is not seated until 2027. The 8-K records no transactions between Malka and AGM. No direct Malka–Black document was found. |
| **JPMorgan** | Malka → Aguzin (MELI co-directors 2017–2021) → J.P. Morgan (Aguzin an executive there to May 2021) | 2 | The overlap is real in time. A second route runs through Segal, who left JPMorgan Partners in 2002, before any shared board. |
| **Andreessen / a16z** | Malka → Ribbit → a16z (Oct 2019 sale of Coinbase preferred, $42.9m) | 2; Marc Andreessen 3 | documented transaction |
| **Founders Fund** | Malka → Ribbit → Founders Fund (co-parties to Affirm's IRA, 2020) | 2; Thiel 3; Palantir 4 | Thiel's partnership and Palantir chair from FF's page |
| **Reid Hoffman** | Malka → Ribbit VI → Reinvent Capital Fund (co-investors in Hippo's PIPE) → Hoffman | 3 | Or Ribbit VI → Hippo ← Hoffman (sponsor member), also 3 |
| **Jeffrey Epstein** | Malka → Ribbit → Coinbase Series C ← Epstein (via IGO Company LLC) | 3, **with the last hop attributed** | Below |
| **Jeffrey Epstein (documented-only)** | Malka → AGM → Black → Epstein (Black's payments, already on the page) | 3 | Or Malka → Aguzin → JPMorgan → Epstein, also 3 |
| **Ghislaine Maxwell, Wexner** | none except through Epstein | ≥4 | The 2006 corpus "Malka" is a different person (§2) |
| **Thiel's Dialog** | not an edge | — | Malka appears on a Dialog roster; Dialog's founding was not read at source |
| **Carbyne, Cantor/Lutnick, Mandelson, Gates, Summers, MIT Media Lab, Palantir (directly)** | **null** | — | See below |

**Epstein, the Coinbase touch, set out exactly.** Ribbit's Coinbase holding is documented by the IRA and the 424B4.
Ribbit's place in the Series C rests on the press and on Pierce's corpus email. Epstein's Series C investment is
**attributed**, to a Blockchain Capital statement to Decrypt (Feb 2026, reading DOJ-released emails). Fortune
reports a later sale of Coinbase equity by an Epstein-associated trust (2018, attributed). **Co-investment in one
$75m round with a dozen investors is not a relationship between them.** No document shows Ribbit or Malka dealing
with Epstein, and the corpus has nothing either way.
Q | https://decrypt.co/356620/jeffrey-epstein-early-investor-coinbase-emails-reveal | Mr. Epstein independently invested through his own entity, IGO Company LLC (in an amount of $3M), into Coinbase’s Series C.
Q | https://decrypt.co/356620/jeffrey-epstein-early-investor-coinbase-emails-reveal | Ultimately, a fund investment was never consummated
Q | https://fortune.com/2026/02/06/jeffrey-epstein-files-coinbase-blockstream-michael-saylor-brock-pierce/ | A trust associated with the financier sold $15 million of Coinbase equity to Blockchain Capital that year, according to a spokesperson for the venture firm.

**Black and Apollo, the documents:**
Q | https://www.sec.gov/Archives/edgar/data/1411494/000119312521088432/d114836d8k.htm | Leon Black, Chairman of the Board, informed the Board that he has decided to step down from his position as Chief Executive Officer, Director and Chairman of the Board
Q | https://www.sec.gov/Archives/edgar/data/1858681/000119312526177321/d948913ddef14a.htm | 5% stockholders: Leon Black (4)(8) 37,961,228 6.6 %

**Nulls, and how they were looked for.** EDGAR full-text was run on "Ribbit Capital" together with each of Carbyne
(0), Cantor Fitzgerald, Palantir, Thiel, Founders Fund and Greylock, and on "Meyer Malka" together with Summers,
Reid Hoffman, Gates, Mandelson, "Media Lab" (0), Epstein, Wexner, Maxwell, Lutnick, Andreessen and Thiel.
- **The "Meyer Malka" pairings are noise.** They come back as N-PX proxy-voting tables, which list hundreds of
  director names across issuers. Hippo is the exception, used above.
- **The "Ribbit Capital" pairings, sorted:**
  - Palantir appears in Robinhood's compensation peer-group list;
  - Cantor Fitzgerald appears in the Root and Figure IPO prospectuses; it was not read line by line, and Cantor's
    role there (presumably underwriter) is not established;
  - Thiel appears in 10X Capital SPAC bios.
  - **None of these is an edge from Malka.**
- **No documented edge was found** between Malka or Ribbit and Carbyne, Cantor/Lutnick, Mandelson, Gates, Summers,
  MIT Media Lab, Wexner or Maxwell.

## 6. Graph note: hops to the townhouse node

- **The page's figure** puts "Apollo/Black" and "JP Morgan" one hop from 9 East 71st Street. Read on the page's
  own graph, Malka sits **two hops** from the townhouse, through the AGM appointment. **That edge does not exist
  until 1 Jan 2027.** On edges in force today, the shortest route is through Aguzin and JPMorgan: **three hops**.
- **On documented edges only, without the page's merged nodes,** Malka → AGM → Black → Epstein and Malka → Aguzin →
  JPMorgan → Epstein are each three hops. Every hop on both routes is a filing, apart from the Black–Epstein and
  JPMorgan–Epstein edges, which the page already carries.
- **A naming caution for the page itself.** The figure's node "Apollo/Black" merges a firm and a man. The page's
  own Dechert finding is that Apollo never did business with Epstein; Black's payments were personal. So a path
  that enters through the Apollo *board* reaches Epstein only through Black the shareholder. That is why the
  documented-only count is 3, not 2.
- **Why the count means nothing beyond its edges.** By the page's own rule (the guaranteed-null rule and the
  anti-map guardrail), a short path is what a hub produces. JPMorgan and Apollo are among the most-connected nodes
  in finance, and a director of almost any large fintech company will reach them in two or three hops. The page
  already says that "everyone is six from everyone" is not what the record shows, and the reverse holds too: a
  short distance through a hub is not a tie. **Each hop is a separate, dated, ordinary business document:** a board
  appointment, a proxy ownership table, a co-directorship and an investors' rights agreement. **None records
  contact between Malka and Black or Epstein, and the AGM 8-K records no transactions between Malka and AGM.**
  Read as anything more than its edges, the path is the anti-map error.

## Killed or not established (with the reason)

- **"Appointed to the board of Apollo Global Wealth."** The filing says Apollo Global Management, Inc., effective
  1 Jan 2027, not yet seated. "Apollo Global Wealth" was not found here; beat B owns the naming question.
- **A Malka–Black relationship.** There is no document. Their board service does not overlap (Black left on 21
  Mar 2021), and the shared node is an institution.
- **Malka in the Epstein corpus as a correspondent.** Null. He appears once, as a roster line.
- **The 2006 "Malka" release agreement as Meyer Malka.** Identity not established, presumptively a different
  person.
- **"Robinhood" corpus hits as Robinhood Markets.** Mostly the Robin Hood Foundation, a naming error.
- **Malka on Coinbase's board.** Null; "Malka" returns 0 in Coinbase filings.
- **"FF Brazil, LLC" as Founders Fund.** Not stated in any document read; the hop is not counted.
- **The Nu board end date.** Not established; it falls between Feb and Nov 2021.

## Edges

EDGE | Meyer Malka | Ribbit Capital (Ribbit Management Company, LLC) | founder; managing director; 75%+ owner and control person (ADV Sch. A) | 03/2012–present | documented | https://reports.adviserinfo.sec.gov/reports/ADV/165308/PDF/165308.pdf
EDGE | Meyer Malka | MercadoLibre, Inc. | director (Class II; audit, compensation chair) | 2013-03-05 – 2021 annual meeting | documented | https://www.sec.gov/Archives/edgar/data/1099590/000117184313000915/f8k_030713.htm
EDGE | Meyer Malka | Alejandro Nicolás Aguzin | MELI co-directors | 2017 – 2021 annual meeting | documented | https://www.sec.gov/Archives/edgar/data/1099590/000156276221000170/meli-20210608xdef14a.htm
EDGE | Alejandro Nicolás Aguzin | J.P. Morgan | employee/executive (CEO International Private Bank 2020–May 2021; Asia Pacific Chairman & CEO 2012–2020) | 1990 – May 2021 | documented | https://www.sec.gov/Archives/edgar/data/1099590/000156276221000170/meli-20210608xdef14a.htm
EDGE | Meyer Malka | Susan Segal | co-directors at MELI, Ribbit LEAP and Robinhood | MELI to 2021; LEAP 2020–2022; HOOD 2024– | documented | https://www.sec.gov/Archives/edgar/data/1818346/000104746920004858/a2242371z424b4.htm
EDGE | Susan Segal | JPMorgan Partners/Chase Capital Partners | partner, Latin American Group Head | 1997 – 2002 | documented | https://www.sec.gov/Archives/edgar/data/1818346/000104746920004858/a2242371z424b4.htm
EDGE | Meyer Malka | Nu Holdings Ltd. | director (Form D related person) | by 2018-03-02 – between 2021-02-11 and 2021-11 | documented | https://www.sec.gov/Archives/edgar/data/1691493/000169149321000001/primary_doc.xml
EDGE | Meyer Malka | Ribbit LEAP, Ltd. | co-founder, CEO, chairman | 2020-09 – 2022-08 | documented | https://www.sec.gov/Archives/edgar/data/1818346/000104746920004858/a2242371z424b4.htm
EDGE | Meyer Malka | Robinhood Markets, Inc. | director (independent, Class II) | 2022-03-23 – present | documented | https://www.sec.gov/Archives/edgar/data/1783879/000119312522082757/d295362d8k.htm
EDGE | Meyer Malka | Apollo Global Management, Inc. | director, appointed 2026-10-20 | effective 2027-01-01 (not yet seated) | documented | https://www.sec.gov/Archives/edgar/data/1858681/000095014226002794/eh260845009_8k.htm
EDGE | Leon Black | Apollo Global Management, Inc. | 5% stockholder (6.6%); left the board and CEO post 2021-03-21 | stake as of the 2026 proxy | documented | https://www.sec.gov/Archives/edgar/data/1858681/000119312526177321/d948913ddef14a.htm
EDGE | Cynthia McAdam | Ribbit Capital | partner / COO | 2016-12 – present | documented | https://www.sec.gov/Archives/edgar/data/1818346/000104746920004858/a2242371z424b4.htm
EDGE | Nick Shalek | Ribbit Capital | general partner | 2012-08 – (as of 2021) | documented | https://www.sec.gov/Archives/edgar/data/1788882/000178888221000018/root-2021annualproxystatem.htm
EDGE | Ribbit Capital | Credit Karma | minority holder | 2013-03 – (as of 2020) | documented | https://www.sec.gov/Archives/edgar/data/1818346/000104746920004858/a2242371z424b4.htm
EDGE | Ribbit Capital | Coinbase | >5% preferred holder; IRA party | 2018-10-26 / 2021-03-15 IRA | documented | https://www.sec.gov/Archives/edgar/data/1679788/000162828021004939/exhibit42-sx1a1.htm
EDGE | Ribbit Capital | Andreessen Horowitz | sold 1,864,094 Coinbase preferred shares to a16z entities, $42.9m | 2019-10 | documented | https://www.sec.gov/Archives/edgar/data/1679788/000162828021006850/coinbaseglobalinc424b.htm
EDGE | Marc Andreessen | Coinbase | director; a16z co-founder/GP | 2020-12 – (as of 2021) | documented | https://www.sec.gov/Archives/edgar/data/1679788/000162828021006850/coinbaseglobalinc424b.htm
EDGE | Ribbit Capital | Coinbase Series C | participant | 2015-01 | attributed | https://www.entrepreneur.com/article/241995
EDGE | Jeffrey Epstein (IGO Company LLC) | Coinbase Series C | investor, $3M | 2014-12 / 2015-01 | attributed (Blockchain Capital statement) | https://decrypt.co/356620/jeffrey-epstein-early-investor-coinbase-emails-reveal
EDGE | Ribbit Capital | Founders Fund | co-parties to Affirm IRA | 2020-09-11 | documented | https://www.sec.gov/Archives/edgar/data/1820953/000110465920126927/tm2026663d5_ex4-2.htm
EDGE | Peter Thiel | Founders Fund | partner; Palantir co-founder and chairman | as of 2026 | documented (firm's own page) | https://foundersfund.com/team/peter-thiel/
EDGE | Ribbit Capital VI (Malka controls GP) | Hippo Holdings | PIPE holder, 300,000 shares | 2021 | documented | https://www.sec.gov/Archives/edgar/data/1828105/000119312521255094/d554403ds1.htm
EDGE | Reid Hoffman (Reinvent Capital Fund) | Hippo Holdings | PIPE $10m; sponsor member | 2021 | documented | https://www.sec.gov/Archives/edgar/data/1828105/000119312521255094/d554403ds1.htm
EDGE | Ribbit Capital | Nubank | Series D participant (with Founders Fund) | 2016-12 | attributed | https://www.lavca.org/brazils-nubank-receives-us80m-series-d/
EDGE | Ribbit Capital | Nu Holdings | shareholder, RRA party | 2021-11-18 | documented | https://www.sec.gov/Archives/edgar/data/1691493/000119312521342848/d213207dex42.htm

Not edges, recorded so they are not mistaken for edges: Malka's name on the Dialog 2014 roster in the corpus;
Pierce's naming of Ribbit in an allocation offer to Epstein.

## WITHHELD (anything under the floor)

- The counterparties in the 2006 corpus release agreement (private individuals), and any expansion of the initials
  "LHW and ASW".
- The minor victim surnamed Malka in the 2015 news item.
- The private individuals on the Dec 2018 corpus list, including the Robinhood employee.
- Ribbit's chief compliance officer (ADV Schedule A).
- Every personal address printed in Nu's Form D notices.
- Black's son, named in the AGM proxy as an Apollo employee: not needed for any edge.
- **Nothing here asserts or implies that Malka, Ribbit or any co-investor dealt with Epstein, or anything beyond
  the documented business relationships listed.**
