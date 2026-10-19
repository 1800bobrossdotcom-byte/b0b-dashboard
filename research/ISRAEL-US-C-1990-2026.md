# ISRAEL–US, LINE C — the practical channels, 1990–2026

**Status: research file, UNPUBLISHED. Nothing here is on the page. Written 19 Oct 2026.**
Spider note on every fetch: `israel-us line C` (one URL: `israel-us line C (FARA label check)`).
Scope: the conduct of the **government of Israel, its agencies and its contractors**, the US
channels they use, and US officials' responses. It is not about Jews or Jewish Americans, and
nothing below treats lawful advocacy or lawful donations by US citizens as foreign agency.
Where a source uses dual-loyalty or "control" framing, that is recorded as a property of the
source (§1.2, §1.6).

**How it was read.** Every quote and figure below was read in the spider's cached bytes
(HTML via `spider.py text`; PDFs extracted locally with pypdf and the `cryptography` stub).

**Quote check, 19 Oct 2026:**
- 96 HTML and PDF quotes were run through `vq.py --batch`, and 94 came back OK.
- The two misses are extraction artefacts, not misquotes:
  - Meta's PDF extracts "It is" as "Itis";
  - one line was re-cased in my test, not in this file.
- The 42 quotes taken from court-transcript and pleading-paper PDFs (§§1.4, 2.3) and from FARA
  and SSCI texts were checked separately, with line numbers stripped: 42/42 OK.
- Meta's PDF extraction also drops spaces elsewhere ("andpolitical", "Jewishstudents"). The quotes
  below restore the visible text. Search snippets and WebFetch summaries were used to
find URLs only. Every figure that I computed myself (FARA country sums, FEC race totals) says so
and gives its method.

**What the page already carries (counts in `site/report.html`, 19 Oct 2026).**
- Franklin, Weissman, NSIAD, "Country A", Psy-Group, STOIC, Diaspora, Clock Tower, Bridges
  Partners, United Democracy Project, RL33222, Leahy, NSM-20 and 620I: **0 each**.
- AIPAC 1, in a Section XV network line; NSO 2 and Pegasus 4, all as industry mentions; FARA 0
  substantive; Black Cube 23.
- "Mega" 9, **all of them the 1991 Mega Group. None is the 1997 intercept codename, which is a
  different thing (§1.3).**

The held draft `research/drafts/xxiv-favorite-nation.html` already summarises several of these
items. Its lines were checked against this file, with results in §9.

---

## 0. Findings in brief

1. **The espionage record is real, and almost all of it is unnamed.**
   - The 1996 GAO report never names "Country A". Israel was named by press attribution and by
     an annotation that FAS itself labels rumour.
   - The 1997 "Mega" story, Newsweek 2014, WSJ 2015 and Politico 2019 all rest on anonymous
     officials, and Israel denied each one.
   - The documented layer is narrower:
     - one guilty plea (Franklin, 2005; 151 months, cut in 2009 to probation with ten months'
       community confinement);
     - one prosecution dropped by the government (Rosen and Weissman, 2009);
     - the GAO text.
2. **Spyware is the best-documented channel, and it runs through US courts and US rules, not
   through secrets.**
   - Commerce put NSO on the Entity List (4 Nov 2021); it is still listed in the eCFR versions to
     24 Aug 2026.
   - A federal court found NSO liable under the CFAA (20 Dec 2024). A jury awarded $167,254,000 in
     punitive damages; the court cut that to $4,002,471 and granted a permanent injunction
     (17 Oct 2025). The Ninth Circuit refused a stay (28 Jan 2026), and the court denied
     WhatsApp's contempt motion on **16 Oct 2026**.
   - NSO itself told the court that "the FBI purchased a license for Pegasus in December 2018".
   - NSO paid US law and lobbying firms under FARA from 2019 to 2025.
3. **Covert influence: documented as a company finding; the state link is attributed.**
   - Meta (May 2024) removed an Israel-origin network that commented on US lawmakers' pages, and
     tied it to STOIC, a Tel Aviv firm.
   - That Israel's Diaspora Affairs Ministry ordered and paid for it (~$2M) is New York Times and
     Haaretz reporting. The ministry denied involvement.
4. **Since 2025 the overt channel has been large and is on file.**
   - The FARA bulk file lists **21 active Israel principals**. Since 2023 there are new
     government-of-Israel registrations by advertising and influencer firms.
   - Clock Tower X LLC holds a Havas Media Germany contract "on behalf of the State of Israel":
     - $6M in the initial statement of work;
     - raised to $9M (first amendment);
     - $15,000,000 received in the six months to 31 Mar 2026;
     - an April–October 2026 schedule of $4.5M a month filed in June 2026.
   - Its deliverables include "Deployment of websites and content to deliver GPT framing results
     on GPT conversations."
   - Its websites carry the FARA label in their footers.
5. **Money in elections is domestic and documented.**
   - AIPAC is a 501(c)(4) (IRS subsection 4). Its PAC has filed since 15 Dec 2021, and its super
     PAC, United Democracy Project, since 3 Jan 2022. AIPAC appears **0 times** in the FARA
     principals bulk file.
   - UDP raised $87.2M in the 2024 cycle and $109.7M in the 2026 cycle to 31 Aug 2026.
   - The largest single receipts are AIPAC's own transfers: $11M (23 Sept 2024), $25M
     (25 Sept 2025) and $5M (23 Dec 2025).
6. **Aid and its conditions.**
   - The current MOU is $38bn for FY2019–2028, and CRS gives a cumulative $174bn (current dollars).
   - P.L. 118-50 added $3.5bn FMF, $4bn Iron Dome/David's Sling and $1.2bn Iron Beam.
   - The NSM-20 report found it "reasonable to assess" that US arms were used inconsistently with
     IHL, but did not find a §620I aid restriction. USAID and State's refugee bureau had concluded
     the opposite (ProPublica, attributed).
   - NSM-20 was rescinded on 21 Feb 2025 (CRS, citing the Washington Post).
   - CRS: "There is no public record of the Biden Administration having done so" on enforcing
     §620I.

---

## 1. Espionage and counterintelligence record

### 1.1 GAO/NSIAD-96-64 (Feb 1996): "Country A" — DOCUMENTED text; the country identification is ATTRIBUTED/RUMOUR

- **Source:** GAO, *Defense Industrial Security: Weaknesses in U.S. Security Arrangements With
  Foreign-Owned Defense Contractors*, GAO/NSIAD-96-64, letter dated **February 20, 1996**, to the
  House National Security Committee. It is "an unclassified version of a classified report issued
  to you in 1995."
  - https://www.gao.gov/assets/nsiad-96-64.pdf (pp. 22–23)
  - https://www.gao.gov/products/nsiad-96-64
- **Verbatim (p. 22):**
  > "According to a U.S. intelligence agency, the government of Country A conducts the most
  > aggressive espionage operation against the United States of any U.S. ally."
- **Verbatim (p. 23):**
  > "Country A routinely resorts to state-sponsored espionage using covert collection techniques
  > to obtain sensitive U.S. economic information and technology."
- **The examples GAO lists:**
  - an operation that "paid a U.S. government employee to obtain U.S. classified military
    intelligence documents";
  - "Several citizens of Country A were caught in the United States stealing sensitive technology
    used in manufacturing artillery gun tubes";
  - targeting of "U.S. avionics, missile telemetry and testing data".
- **Context GAO gives:** "Reports and briefings provided during 1993 by U.S. intelligence agencies
  showed a continuing economic espionage threat from certain U.S. allies." **The report has
  Countries A–E. Country B is described as beginning "an aggressive and massive espionage effort
  against the United States" in the 1960s.** So the comparator is in the document: GAO treats
  allied espionage as a class.
- **Who named Country A:**
  - GAO did not.
  - The FAS copy of the companion testimony (GAO/T-NSIAD-96-114, 28 Feb 1996) carries an FAS
    annotation: "FYI: The RUMINT is that the country codes are Country A = Israel Country B =
    France Country C = Germany Country D = Japan" (https://irp.fas.org/gao/nsi96114.htm). That is
    rumour by the archivist's own label.
  - Secondary compilations (not read; search leads only) cite the *Washington Times*,
    22 Feb 1996, as identifying Country A as Israel "by intelligence sources". **The Washington
    Times article was not read.**
- **Limit, important:**
  - The first bullet's description fits the Pollard case, but GAO names neither the country nor
    the employee. Reading Pollard into it is our inference and must not be printed as GAO's.
  - The "eight of the 54 companies" sentence refers to "one of these countries", not
    necessarily A.
- **Tier:** the GAO text is documented. "Country A = Israel" is attributed (press, 1996) and
  rumour (FAS). It is not established by any official document read.

### 1.2 The Defense Investigative Service memo (circulated late 1995; repudiated by early 1996) — ATTRIBUTED; the primary was not reached

- **What is read:** JTA, "Detroit-area espionage case revives Jewish sensitivities", dateline
  "WASHINGTON, Feb. 24 (JTA)" [1997], at
  https://www.jta.org/1997/06/05/lifestyle/news-analysis-detroit-area-espionage-case-revives-jewish-sensitivities
  (fetched as `https://www.jta.org/?p=402821`).
- **The memo, as JTA quotes it:**
  > "The strong ethnic ties to Israel present in the U.S., coupled with aggressive and extremely
  > competent intelligence personnel, has resulted in a very productive collection effort."
- **What JTA says about it:**
  - The memo "was written and circulated by a low-level field official in upstate New York".
  - "Top brass at the Pentagon, including then-Secretary of Defense William Perry, repudiated the
    memo".
  - JTA refers to "the repeal of a Defense Department security agency memo warning government
    contractors that 'strong ethnic ties' to American Jews allow Israel to steal military and
    industrial secrets 'aggressively.'"
- **The trope point, recorded as a property of the source:** this US government document itself
  used ethnic-tie framing. It is the dual-loyalty move, and the Department repudiated it. Any
  page use must print the repudiation with it. **The memo is evidence of how a US field office
  reasoned, not evidence about American Jews.**
- **Date:** the search lead (jweekly, 2 Feb 1996, 403 here) puts circulation in October [1995].
  JTA puts the repeal about one year before Feb 1997. The memo itself was not found in any
  primary repository.
- **Living-person note:** the JTA piece concerns an Army civilian engineer under investigation in
  1997. JTA records that "no charges have been filed". He is not named here and should not be.
- **Tier:** attributed (JTA quoting the memo); the primary was not read.

### 1.3 The 1997 "Mega" intercept — ATTRIBUTED (Washington Post via JTA); Israel denied

- **Source:** JTA, dateline "WASHINGTON, May 7 (JTA)" [1997],
  https://www.jta.org/1997/06/05/default/fbi-investigating-possibility-of-u-s-spy-passing-secrets-to-israel
- **Verbatim (JTA reporting the Post):**
  - "The FBI opened an investigation in January after the National Security Agency intercepted a
    secure conversation between a Washington-based senior Israeli intelligence official and a
    superior in Israel, the Washington Post reported Wednesday."
  - "The ambassador wants me to go to Mega to get a copy of this letter." / "This is not something
    we use Mega for".
  - The letter was Secretary Christopher's side letter to Arafat under the January 1997 Hebron
    accord.
- **Counter-account (same article):**
  - "Israeli Prime Minister Benjamin Netanyahu called the story 'absolutely baseless.'"
  - Ambassador Ben-Elissar "emphatically denied to the Post that he had requested a copy of the
    letter".
  - JTA also writes that "State Department officials confirmed the contents of the report".
- **Outcome:** no public identification of "Mega" and no charge was found. **The record holds an
  intercept as reported, and nothing more.**
- **NAMING-ERROR TRAP:**
  - "Mega" here is a codename in an intercepted conversation. **It is not the Mega Group**, the
    1991 philanthropists' club the page already mentions nine times, with Wexner and Bronfman.
  - The two must never be joined on the page. Joining them is the naming error and an anti-map
    chain in one move.
- **Not read:** the Washington Post original (URL not located; the WaPo archive is not tried).
- **Tier:** attributed.

### 1.4 Lawrence Franklin — DOCUMENTED (DOJ releases; court transcript); plea and sentence

- **Arrest, 4 May 2005.** DOJ, "Defense Department Analyst Larry Franklin Arrested, Charged With
  Disclosing Classified Information",
  https://www.justice.gov/archive/opa/pr/2005/May/05_crm_238.htm:
  > "A criminal complaint filed Tuesday and unsealed this morning charges Franklin with disclosing
  > classified U.S. national defense information to a person or persons not entitled to receive
  > it, in violation of 18 U.S.C. § 793(d)."
  - He was on the OSD Iran desk, with a Top Secret clearance.
  - The complaint alleges disclosure "to a foreign official and members of the news media on
    other occasions".
- **Indictment, 4 Aug 2005.** US Attorney EDVA release, https://irp.fas.org/news/2005/08/doj080405.html:
  - Franklin, Steven J. Rosen and Keith Weissman were indicted for conspiracy to communicate
    national defense information.
  - Franklin was also charged with "conspiring with persons known and unknown to the grand jury
    to communicate classified information to an agent or representative of a foreign government."
  - **The release does not name the foreign government or the official.**
- **Plea and sentence.** AP via NBC, 20 Jan 2006, https://www.nbcnews.com/news/amp/wbna10944399:
  - "pleaded guilty in October to three felony counts in exchange for having three other counts
    dropped".
  - "The 12-year, 7-month sentence was on the low end of federal sentencing guidelines" (=151
    months).
  - AP: he "gave classified information to an Israeli diplomat and two members of a pro-Israel
    lobbying group".
  - The plea agreement and the sentencing transcript at sgp.fas.org returned a 202 (null, below),
    so the counts' exact text and the 151-month figure are attributed (AP), not read in the
    judgment.
- **Reduction, 11 June 2009.** Transcript, *USA v. Franklin*, 1:05-cr-225 / 1:05-cr-421 (E.D. Va.),
  https://sgp.fas.org/jud/aipac/franklin061109.html. Judge Ellis:
  > "I reduce his sentence on the three counts to a sentence of probation with a special
  > condition that he serve ten months in community confinement"
  - (transcript lines 3–5, page 39; line numbers stripped)
- **Same hearing, the judge on the defence's argument:** "you point out that there are other
  people in the government who are doing this and not being prosecuted. I agree with you. I think
  that's indisputable."
- **The Israeli official** is unnamed in every DOJ document read. He was not charged. **Do not
  name him.**
- **Israel's response to Franklin:** not read in spider text. Null.
- **Tier:** documented (complaint, indictment, plea, reduction); the sentence figure is
  attributed (AP).

### 1.5 *US v. Rosen and Weissman* — indicted Aug 2005; the GOVERNMENT moved to dismiss on 1 May 2009

- **Living-person floor:** both were charged, and the charges were dismissed on the government's
  own motion. **They are not to be described as having committed the offence.**
- **Docket index:** https://sgp.fas.org/jud/aipac/index.html: "On May 1, 2009 the government filed
  a motion to dismiss the superseding indictment against Rosen and Weissman, effectively
  terminating the case." The motion PDF (`dismiss.pdf`) returned a 202 (null).
- **DOJ's reasons, the acting US Attorney's statement** (attributed; JTA via Jewish Journal,
  1 May 2009, https://jewishjournal.com/uncategorized/70133/; JPost 3 May 2009 headline carries
  the same phrase):
  > "Given the diminished likelihood the government will prevail at trial under the additional
  > intent requirements imposed by the court and the inevitable disclosure of classified
  > information that would occur at any trial in this matter, we have asked the court to dismiss
  > the indictment," — Dana Boente
- **The "intent requirements"** (same source): Judge Ellis had ruled that the government must
  prove they "intended not only to assist Israel but to harm the United States."
- **CBS (AP), "Feds Drop Charges In AIPAC Spy Case",**
  https://www.cbsnews.com/news/feds-drop-charges-in-aipac-spy-case/:
  - "Boente also said he was worried that classified information would be disclosed at trial."
  - "The defense had also been prepared to put on a strong case that the information obtained by
    Rosen and Weissman, while technically classified, was not truly secret".
- **Aggregator error caught:** JTA (24 Feb 2011, https://www.jta.org/?p=438666) writes that "a
  federal court threw out classified information charges against him and Keith Weissman ... for
  lack of evidence." **That is wrong.** The government moved to dismiss; no court ruled on the
  evidence. Do not reuse that wording.
- **AIPAC's own position (same JTA, 2011):** it fired both in March 2005, and a DC Superior Court
  judge held AIPAC's statement about the firing not defamatory.
- **Tier:** the dismissal is documented (docket index). Boente's reasons are attributed (quoted
  statement; the motion was unread).

### 1.6 Newsweek (Jeff Stein), May 2014 — ATTRIBUTED (anonymous staffers on classified briefings); Israel denied

- **"Israel Won't Stop Spying on the U.S.", 6 May 2014,**
  https://www.newsweek.com/israel-wont-stop-spying-us-249757:
  - "Israel's espionage activities in America are unrivaled and unseemly, counterspies have told
    members of the House Judiciary and Foreign Affairs committees, going far beyond activities by
    other close allies, such as Germany, France, the U.K. and Japan."
  - "No other country close to the United States continues to cross the line on espionage like the
    Israelis do," said a former congressional staffer.
  - Context: the briefings concerned legislation on visa restrictions for Israeli citizens (the
    Visa Waiver Program).
- **Counter-account (same piece):**
  > Aaron Sagui (Israeli Embassy): "Israel doesn't conduct espionage operations in the United
  > States, period. We condemn the fact that such outrageous, false allegations are being
  > directed against Israel."
  - "The FBI would neither confirm nor deny it briefed Congress."
- **Second piece, "Israel's Aggressive Spying in the U.S. Mostly Hushed Up", 8 May 2014,**
  https://www.newsweek.com/israels-aggressive-spying-us-mostly-hushed-250278:
  - It adds a single anonymous "senior former U.S. intelligence operative" anecdote: a man in the
    air duct of Vice President Gore's Jerusalem hotel room.
  - **One anonymous source, no document. Testimony tier at most, and not for the page.**
- **Property of the source:** Newsweek writes "The Jewish state's primary target: America's
  industrial and technical secrets." That phrasing is the outlet's; the page must say "Israel" or
  "Israel's government".
- **Tier:** attributed (anonymous).

### 1.7 The Wall Street Journal, March and December 2015 — ATTRIBUTED; both directions of surveillance

The task brief dated this "Dec 2015"; there are **two** WSJ stories (both WSJ URLs are disallowed
by robots, so null). The Israel-spied-on-the-talks story is **March 2015**. The December 2015 story
is **US surveillance of Israel**, the symmetry item.

- **March 2015, Israel and the Iran talks.** Al Jazeera, 24 Mar 2015,
  https://www.aljazeera.com/news/2015/3/24/report-israel-spied-on-iran-nuclear-talks:
  - "Israel has spied on US negotiations over Iran's nuclear programme and fed the obtained
    intelligence to Republican Congress members in order to undermine support for the talks, the
    Wall Street Journal reported."
  - The WSJ quote of a senior US official: "It is one thing for the US and Israel to spy on each
    other. It is another thing for Israel to steal US secrets and play them back to US legislators
    to undermine US diplomacy".
- **Counter-account,** Ynet, https://www.ynetnews.com/articles/0,7340,L-4640554,00.html:
  - Netanyahu's office called the report "utterly false," saying Israel "does not conduct
    espionage against the United States or Israel's other allies."
  - Embassy spokesman: "Ambassador Dermer never shared confidential intelligence information with
    members of Congress."
  - Foreign Minister Lieberman: "we do not spy on the United States. There are enough participants
    in these negotiations, including Iranians".
- **CBS** (Dan Raviv, 24 Mar 2015, https://www.cbsnews.com/news/israel-denies-iran-nuclear-talks-spying/)
  notes that "The key word in the denial, however, may be the word 'against.'" That is a reading
  by the outlet; record it as such.
- **December 2015, the US on Israel.** Foreign Policy, 30 Dec 2015,
  https://foreignpolicy.com/2015/12/30/report-on-nsas-israel-spying-sparks-backlash-in-congress/:
  - "a report in the Wall Street Journal that the U.S. government spied on Israeli Prime Minister
    Benjamin Netanyahu as the foreign leader attempted to undermine support in Congress for
    President Barack Obama's nuclear deal with Iran."
  - House Intelligence chairman Nunes: "The committee has requested additional information from
    the [intelligence community, or IC] to determine which, if any, of these allegations are true".
- **Symmetry, stated:** the same year's record has each government collecting on the other.
  **Neither story has a document behind it on this page.**
- **Tier:** attributed (WSJ via named outlets; anonymous officials).

### 1.8 Politico, 12 Sept 2019: IMSI-catchers near the White House — ATTRIBUTED; Israel denied; Trump doubted it

- Politico refused (403); read via CBS, 12 Sept 2019,
  https://www.cbsnews.com/news/white-house-spying-israel-pm-benjamin-netanyahu-stingray-surveillance-devices-report-blatant-lie-2019-09-12/:
  > "Politico reported on Thursday, citing 'three former senior U.S. officials with knowledge of the
  > matter,' that the FBI and other U.S. security agencies 'felt confident that Israeli agents had
  > placed the devices' in Washington D.C."
- **Documented background in the same piece:** DHS told Senator Wyden (letter of March 2018) that
  it "had found 'anomalous activity' consistent with StingRay use in Washington", but "had not been
  able to determine who put them there".
- **Counter-accounts:**
  - Netanyahu's office called the report a "blatant lie", adding: "There is a longstanding
    commitment, and a directive from the Israeli government not to engage in any intelligence
    operations in the U.S. This directive is strictly enforced without exception".
  - Trump, 12 Sept 2019 (Anadolu, 13 Sept 2019,
    https://aa.com.tr/en/americas/trump-i-do-not-believe-israelis-spied-on-us/1582536): "I don't
    believe that. No, I don't think the Israelis were spying on us," ... "I really would find that
    hard to believe." He added: "Anything is possible".
  - CBS: "U.S. intelligence officials would not confirm that Israel was suspected of placing the
    devices".
- **Tier:** attributed (anonymous former officials). The DHS finding of unattributed devices is
  documented by its description in the AP-obtained letter, which was itself not read.

---

## 2. Spyware and private intelligence

### 2.1 NSO Group and Candiru on the Entity List — DOCUMENTED (Federal Register); still listed in 2026

- **86 FR 60759**, BIS final rule "Addition of Certain Entities to the Entity List", **effective
  4 Nov 2021**, FR Doc. 2021-24123.
  - https://www.govinfo.gov/content/pkg/FR-2021-11-04/pdf/2021-24123.pdf
  - Metadata: https://www.federalregister.gov/api/v1/documents/2021-24123.json
- **Verbatim:**
  > "investigative information has shown that the Israeli companies NSO Group and Candiru
  > developed and supplied spyware to foreign governments that used this tool to maliciously target
  > government officials, journalists, businesspeople, activists, academics, and embassy workers."
- **License policy:** "presumption of denial".
- **Comparator in the same notice:** Positive Technologies (Russia) and Computer Security Initiative
  Consultancy PTE. LTD. (Singapore) were added the same day, for "traffic in cyber exploits".
- **Status:** the eCFR full-text search of 15 CFR Part 744 Supp. No. 4 still returns the NSO Group
  entry in every point-in-time version up to **24 Aug 2026**, with `removed: false`.
  - https://www.ecfr.gov/api/search/v1/results?query=%22NSO%20Group%22&date=2026-10-14
  - A query dated 2026-10-19 returned 400; the latest version available is the one read.
- **NSO's US lobbying, documented in the FARA bulk principals file**
  (https://efile.fara.gov/bulk/zip/FARA_All_ForeignPrincipals.csv.zip):

  | Registrant | Foreign principal | Registered | Terminated |
  |---|---|---|---|
  | Pillsbury Winthrop Shaw Pittman (#5198) | NSO Group | 30 June 2021 | 25 Feb 2025 |
  | Chartwell Strategy Group (#6518) | "NSO Group via Pillsbury" | 12 Jan 2022 | 28 Feb 2025 |
  | Paul Hastings (#6743) | NSO Group | 24 Jan 2022 | 31 Jan 2025 |
  | Mercury Public Affairs (#6170) | Q Cyber Technologies (NSO's parent, per `research/intel-lines/israel.json` ISR-20) | 25 Dec 2019 | 1 Nov 2021 |

  The DOJ semi-annual report for H2 2024 (§4.5) lists NSO receipts of $548,653.95 (Pillsbury),
  $200,000 (Chartwell) and $100,000 (Paul Hastings).
- **2025–26 ownership (attributed):**
  - TechCrunch, 8 Jan 2026,
    https://techcrunch.com/2026/01/08/critics-pan-spyware-maker-nsos-transparency-claims-amid-its-push-to-enter-us-market/:
    "Last year, a group of U.S. investors acquired the company"; David Friedman (former US
    ambassador to Israel) became executive chairman.
  - Experts read NSO's new transparency report as "part of an effort and campaign by the company to
    get the U.S. government to remove the company from a blocklist".
  - Rep. Summer Lee and colleagues to Commerce Secretary Lutnick, 6 May 2026 (letter, documented as
    a letter),
    https://summerlee.house.gov/sites/evo-subsites/summerlee.house.gov/files/evo-media-document/2026-05-06.lee-letter-to-commerce-re-nso-group.pdf:
    the letter cites the WSJ (9 Nov 2025) on the purchase and quotes Friedman that he
    "expect[s]" the Administration will be "receptive".
- **Private firm ≠ state:** NSO is a private Israeli company. The Entity List names the company,
  not the Israeli government. The state link that the intel-lines file documents is the
  export-licence regime (DECA, ISR-07; DECA approval of the 2025 ownership change, ISR-11). That
  was not re-read for this file.

### 2.2 The FBI and Pegasus/"Phantom" — the FBI's statement is DOCUMENTED (quoted in a congressional letter); purchase details are ATTRIBUTED

- **Source:** House Judiciary Committee Republicans (Reps. Jordan and Johnson) to Director Wray,
  3 Mar 2022,
  https://judiciary.house.gov/sites/evo-subsites/republicans-judiciary.house.gov/files/2022-03/2022-03-03-JDJ-MJ-to-Wray-re-Phantom.pdf:
  > "the FBI has stated that it 'procured a limited license for product testing and evaluation
  > only' and that '[t]here was no operational use in support of any investigation,'"
  - The letter's own summary of the NYT (28 Jan 2022) is that the FBI "had an active software
    license for NSO's spyware for approximately two years and paid the NSO Group approximately
    $5 million".
  - **The NYT figures are attributed;** the NYT refused (403).
- **NSO's own account in court** (documented as NSO's argument, recited by the court):
  *WhatsApp v. NSO*, Dkt. 824 (19 Dec 2025), at
  https://storage.courtlistener.com/recap/gov.uscourts.cand.350613/gov.uscourts.cand.350613.824.0.pdf.
  NSO argued the public interest favoured a stay "because 'the FBI purchased a license for Pegasus
  in December 2018,'". The court held that argument "further undermined by NSO's presence on the
  U.S. Department of Commerce's Entity List."
- **The Week (India), 3 Feb 2022,**
  https://www.theweek.in/news/world/2022/02/03/fbi-says-it-purchased-pegasus-spyware-to-evaluate-it.html,
  paraphrases the FBI statement (the tool tested "to 'stay abreast of emerging technologies and
  tradecraft'").
- **Tier:**
  - That the FBI licensed and tested NSO software: documented (by the FBI's statement as quoted
    in the congressional letter, and by NSO's own court filing as recited).
  - Duration, the ~$5M and the 2019 date: attributed (NYT).
  - Operational use: denied by the FBI; nothing read contradicts it.

### 2.3 *WhatsApp Inc. v. NSO Group Technologies*, No. 4:19-cv-07123-PJH (N.D. Cal.) — DOCUMENTED (court orders read)

1. **Liability, 20 Dec 2024 (Dkt. 494).** "ORDER RE MOTIONS FOR SUMMARY JUDGMENT, MOTION FOR
   SANCTIONS, AND DISCOVERY LETTER BRIEFS",
   https://storage.courtlistener.com/recap/gov.uscourts.cand.350613/gov.uscourts.cand.350613.494.0.pdf.
   - Background: "approximately 1,400 mobile phones and devices".
   - "the court GRANTS summary judgment in plaintiffs' favor on the CFAA claim under both section
     (a)(2) and (a)(4)".
   - Conclusion: "plaintiffs' motion for partial summary judgment is GRANTED, defendants' motion
     for summary judgment is DENIED, and plaintiffs' motion for sanctions is GRANTED in part".
   - On discovery: "defendants' limitation of its production such that it is viewable only by
     Israeli citizens present in Israel is simply impracticable".
2. **Verdict (Dkt. 736), as recited in Dkt. 802:** "a jury unanimously awarded plaintiffs the full
   amount of $444,719 they sought in compensatory damages. The jury also found that defendants
   acted with malice, oppression, or fraud, and awarded plaintiffs $167,254,000 in punitive
   damages." (Verdict May 2025; the date is from Davis Polk, plaintiffs' counsel, and CyberScoop.)
3. **Remittitur and injunction, 17 Oct 2025 (Dkt. 802),**
   https://storage.courtlistener.com/recap/gov.uscourts.cand.350613/gov.uscourts.cand.350613.802.0.pdf:
   - "plaintiffs' motion for permanent injunction is GRANTED, and defendants' motion for remittitur
     is GRANTED. The punitive damages award is remitted to the amount of $4,002,471".
   - The basis is the 9:1 cap under *Riley*.
4. **Stay denied (Dkt. 824, 19 Dec 2025).** "the injunction specifically does not apply to foreign
   governments."
   - On liability: "the court held defendants liable for their own conduct, not for the conduct of
     its customers."
5. **Ninth Circuit, No. 25-7380, 28 Jan 2026 (Dkt. 834, copy):** "The motion (Docket Entry No. 6)
   to stay the permanent injunction is denied."
   - Interested parties on the caption: Francisco Partners Management, LP, and "DOJ - OFFICE OF THE
     UNITED STATES ATTORNEY".
   - **The DOJ's interest is not explained in the one-page order; not read further.**
6. **Contempt denied, 16 Oct 2026 (Dkt. 884),**
   https://storage.courtlistener.com/recap/gov.uscourts.cand.350613/gov.uscourts.cand.350613.884.0.pdf:
   - "plaintiffs' motion for contempt (Dkt. 854) is DENIED."
   - The court found the evidence tying NSO to new WhatsApp accounts and one-click malicious URLs
     "simply not enough to meet the demanding 'clear and convincing evidence' standard".
   - It also said "there are not enough details before the court about the division of labor
     between defendants and their sovereign customers."
- **Counter-account:**
  - NSO argued the injunction "would put NSO Group's entire enterprise at risk" (as quoted in
    CyberScoop, 20 Oct 2025,
    https://cyberscoop.com/whatsapp-wins-injunction-against-nso-group-spyware-damages-reduced/).
  - **The newest ruling (16 Oct 2026) went NSO's way.**
- **Live:** the appeal in No. 25-7380 is pending; record its outcome.
- **Upgrade over `research/intel-lines/israel.json` ISR-19:** that entry carried the verdict,
  remittitur and injunction as "labeled ... not verified against the docket". The figures and
  dates above are now read in the orders themselves, Dkt. 494, 802, 824, 834 and 884.

### 2.4 Psy-Group and the 2016 campaign — DOCUMENTED (Senate Intelligence Committee, Vol. 5); a private firm, not the Israeli state

- **Source:** SSCI, *Report ... on Russian Active Measures Campaigns and Interference in the 2016
  U.S. Election, Volume 5*, §III.J.3 "Psy Group", report pp. 679–693 (PDF pp. 693–707),
  https://www.intelligence.senate.gov/sites/default/files/documents/report_volume5.pdf.
- **What it is, in the Committee's words:**
  - "Psy Group, which was in bankruptcy proceedings in Israel as of December 2018, was an
    intelligence company specializing ih [sic, OCR] social media manipulation and on-line
    reputation and perception management."
  - It was "founded in Israel on December 22, 2014, as a private intelligence firm".
- **The pitch:**
  - "In the spring of 2016, Psy Group pitched an influence and intelligence project to the Trump
    Campaign through Rick Gates and Birnbaum."
  - The Committee says the proposal, called both "Project Rome" and "Project D-Day", "was
    developed over several months, but ultimately never came to fruition".
  - A Psy Group email: "run an influence campaign to impact their decision using avatars and
    creating third party assets and outreach."
- **Outcome:**
  - "it appears that Project Rome was never implemented by Psy Group."
  - The founder told the Committee Psy Group did "[n]ot a tweet, not a character, nothing" on the
    election.
  - Separately, the money discussed in August 2016 was to come from **George Nader, "an advisor to
    the United Arab Emirates"**: "The Committee did not find or receive information probative of
    the source of the five million dollars referenced by Nader."
- **The state question:** a text search of the Psy Group pages for "Israeli government",
  "government of Israel", IDF and Mossad returned **zero**. The Committee records no Israeli
  government direction or funding.
  - The only state-adjacent sentence is a consultant's description of staff who "came out of the
    military intelligence army unit".
  - That is the 8200 base-rate point the page already makes (Section II): background, not tasking.
- **NAMING-ERROR TRAP, critical for this report:** the Committee's footnotes cite emails from a
  Psy Group employee surnamed **Epstein** ("Email, Epstein to Birnbaum, May 24, 2016"; "Amon/Arnon
  Epstein"). **This is not Jeffrey Epstein.** A grep for "Epstein" across this volume will produce
  false hits that a careless pass would tie to the Epstein corpus.
- **Living-person floor:** the founder and the other individuals named in the Committee's text are
  living and uncharged in this matter. Name them only for the acts the Committee documents, with
  its own hedges, or not at all.
- **Tier:** documented (Senate report). The Israeli-state link is **not established**; the money
  link that is documented points to a UAE adviser.

---

## 3. Information operations: STOIC, 2024

- **Company finding, DOCUMENTED.** Meta, *Adversarial Threat Report, First Quarter 2024* (May 2024),
  https://transparency.meta.com/sr/Q1-2024-Adversarial-threat-report (PDF), pp. 10–11:
  - "We removed 510 Facebook accounts, 11 Pages, one Group, and 32 accounts on Instagram for
    violating our policy against coordinated inauthentic behavior. This network originated in
    Israel and primarily targeted audiences in the United States and Canada."
  - It "commented on Facebook Pages of international and local media organizations, and political
    and public figures, including US lawmakers".
  - Its accounts "posed as locals in the countries they targeted, including as Jewish students,
    African Americans and 'concerned' citizens".
  - "we found links to STOIC, a political marketing and business intelligence firm based in Tel
    Aviv, Israel. It is now banned from our platform."
  - Reach: "about 500 accounts followed one or more of these Pages ... about 2,000 accounts followed
    one or more of these Instagram accounts."
- **Comparator, same report:** networks from Bangladesh, China, Croatia and Iran, and an
  unattributed one, removed the same quarter. Meta attributes none of these to a government by
  default; it attributes the Israel one to a firm.
- **OpenAI (30 May 2024), "Zero Zeno":** openai.com refused (403), and the cdn PDF path 404'd.
  CyberScoop (https://cyberscoop.com/israel-influence-operations-stoic/) records that "Meta and
  OpenAI traced much of that activity to STOIC". **The OpenAI report itself is unread.**
- **State link, ATTRIBUTED; the ministry DENIED:**
  - CyberScoop: "According to the New York Times, the operation was ordered by the Israeli Ministry
    of Diaspora Affairs, which dedicated at least $2 million to the effort and hired the political
    marketing firm STOIC." / "The Israeli Ministry of Diaspora Affairs did not respond to questions
    about the operation on Wednesday."
  - The Week, 6 June 2024 (https://theweek.com/politics/israel-influence-campaign-us-gaza): "The
    Ministry of Diaspora Affairs denied involvement."
  - The Week also quotes the NYT that the effort was "sloppy" and "didn't have a widespread
    impact".
  - Haaretz and the NYT were not read (NYT 403; Haaretz not attempted).
- **Tier:** network removal and STOIC link documented (Meta). Ministry funding attributed (NYT and
  Haaretz via named outlets) and denied. Impact: minimal, by Meta's own follower counts.

---

## 4. FARA, 2023–2026

**Source for all registry facts:**
- the DOJ FARA eFile API, https://efile.fara.gov/api/v1/Registrants/json/Active, and
  `RegDocs/json/{n}`;
- the bulk file https://efile.fara.gov/bulk/zip/FARA_All_ForeignPrincipals.csv.zip, fetched
  19 Oct 2026.

### 4.1 The registry

- **Active foreign principals with Country = ISRAEL: 21.**
- **Government-of-Israel principals registered since 2023:**
  - Economic and Trade Mission (Steptoe, 12 July 2023);
  - Ministry of Tourism (MMGY Global, 14 May 2024; Havas Media Group USA 2023–Oct 2025);
  - MFA (SKDKnickerbocker and Targeted Communications, both Feb/Mar–Aug 2025);
  - "MFA/Government Advertising Bureau" (Genesis 21 Consulting, 11 Aug 2025);
  - Ministry of Tourism/LAPAM via Havas (Targeted Communications, 29 Aug 2025);
  - **State of Israel via Havas Media Germany (Clock Tower X LLC, 18 Sept 2025)**;
  - **Government of Israel through Havas Media Group Germany (Bridges Partners LLC, 26 Sept
    2025)**;
  - **Israel MFA (Show Faith by Works, LLC, 27 Sept 2025)**;
  - Government of Israel through L.D.R.S Group (Davis Media NY, 12 Oct 2025; filings describe a
    "Hostage awareness campaign");
  - Ministry of Finance (IPG DXTRA/Weber Shandwick, 9 Jan 2026; PLUS Communications, 29 Jan 2026);
  - **Havas Media Germany on behalf of LaPam (Piro, Inc., 2 June 2026)**;
  - Ministries of Tourism and Foreign Affairs (Sniper Advertising Services, 24 June 2026).
- **Long-standing:** State of Israel, Embassy (Arnold & Porter, since 1988); the World Zionist
  Organization (since 1971) and the Jewish Agency (since 2013), which are registered for their own
  bodies.
- **The pattern, as documented:** from mid-2025 the Government Advertising Agency (LaPam) and the
  MFA contract through **Havas Media Germany GmbH** (Frankfurt), which subcontracts US firms. Those
  firms register under FARA naming "Havas" and/or "State of Israel" as principal.

### 4.2 Clock Tower X LLC (#7649, registered 18 Sept 2025) — DOCUMENTED

- **Exhibit A,** https://efile.fara.gov/docs/7649-Exhibit-AB-20250918-2.pdf:
  - Principal "State of Israel", 9 Yitzhak Rabin Boulevard, Jerusalem;
  - branch "Minister of Foreign Affairs";
  - official engaged "Eran Shayovich";
  - signed by Bradley Parscale.
- **Exhibit B with contract,** https://efile.fara.gov/docs/7649-Exhibit-AB-20250918-1.pdf. The
  contract date is 09/08/2025. **The filed copy is headed "CONFIDENTIAL / CLOCK TOWER DRAFT /
  August 27, 2025".**
  - "Registrant shall provide strategic communications, planning, and media services in support of
    Havas' engagement by the State of Israel to develop and execute a nationwide campaign in the
    United states to combat antisemitism".
  - Funding "through a combined budget pool consisting of USD $1,500,000 per month for four (4)
    consecutive months contributed by Client, together with any matching funds contributed by
    Agency."
  - Deliverables:
    - "a minimum of 100 root creative assets per month";
    - "5,000 monthly variants";
    - "At least 80 percent of content is tailored to Gen Z audiences";
    - "Integration of narrative messaging into Salem Media Network properties";
    - "a minimum of 50 million impressions per month";
    - SEO "using the MarketBrew AI platform";
    - **"Deployment of websites and content to deliver GPT framing results on GPT
      conversations."**
  - Term "through December 31, 2025".
- **First Amendment (Nov 2025),** https://efile.fara.gov/docs/7649-Exhibit-AB-20251226-3.pdf:
  - funding restated as "US$6,000,000 provided by Client in a single lump-sum disbursement";
  - plus "an additional US$3,000,000 ... exclusively for Digital Advertising";
  - "the combined budget pool is increased from US$6,000,000 to US$9,000,000."
- **Supplemental statement, six months ending 31 Mar 2026,**
  https://efile.fara.gov/docs/7649-Supplemental-Statement-20260518-1.pdf:
  - receipts "$15,000,000.00" from Havas Media Network, itemised $1.5M, $1.5M and four × $3.0M;
  - disbursements "$13,061,802.50";
  - a "Loan" of 850000.00 from Havas, 11/07/2025;
  - on the direct "State of Israel" principal: "Registration for this principal was in error.
    Amendment was filed and there were no receipts under this registration."
- **June 2026 Exhibit B,** https://efile.fara.gov/docs/7649-Exhibit-AB-20260607-4.pdf: contract
  dated 06/02/2026, "Monthly fee for services". The Havas schedule lists **$4,500,000.00 "Digital
  Advertising" for each month April through October 2026** (seven lines = $31.5M scheduled; a
  schedule, not receipts).
- **October 2026 Exhibit and Amendment** (7649-Exhibit-AB-20261005-1, 7649-Amendment-20261005-1):
  image-only scans. No OCR is in the container. **Not read.**
- **Websites, and the FARA label (documented):**
  - The supplemental lists the registrant's sites, including factsignal.org, paxpoint.org,
    allyvia.org, justorium.org, cognitura.org, culturavia.org, innovascope.org,
    compassionpulse.org, econora.org and thetruthaboutiran.com.
  - Read on 19 Oct 2026: the footers of factsignal.org, paxpoint.org and allyvia.org each carry
    **"This material is distributed by Clock Tower X LLC on behalf of the State of Israel.
    Additional information is available at the Department of Justice, Washington, DC."**
  - So the 22 U.S.C. §614(b) label is present, in the footer. The site names do not indicate the
    sponsor. That is a fact about presentation, not a violation.
- **Short-forms:** 26 individual short-form registrations are filed under #7649. The individuals
  are not listed here.

### 4.3 Bridges Partners LLC (#7652, registered 26 Sept 2025) — DOCUMENTED

- **Exhibit B,** https://efile.fara.gov/docs/7652-Exhibit-AB-20250926-1.pdf:
  - principal "Government of Israel through Havas Media Group Germany";
  - contract dated 06/16/2025;
  - nature: "Assist with promoting cultural interchange between united states and Israel."
- **Received:** $199,985.00 on 07/03/2025, "Advance for campaign expenses".
- **The Havas order attached** (client "LAPAM International / Ministry of Foreign Affairs", order
  47239) is titled **"Esther Project"**, product "(INT) Influencer Campaign (USD)". Monthly
  lines, June–November 2025:
  - 60,000 "Initial payments for production and influencers ... Begin matching with Israeli
    content partners";
  - 140,000 "5-6 influencers begin creating content";
  - 200,000 (Aug);
  - 250,000 (Sept);
  - 200,000 (Oct);
  - 50,000 (Nov, "Final payments").
  - That is **$900,000 in all (my sum)**, with "Post volume: approx. 25-30" per month.
- **Supplemental (six months ending 31 Mar 2026),**
  https://efile.fara.gov/docs/7652-Supplemental-Statement-20260430-1.pdf:
  - no new receipts ("Previously reported payment that was an advance for expenses");
  - disbursements $197,960.00;
  - the registrant states: **"Bridges had no role in developing, creating, promoting, or
    disseminating any content."** (its own counter-account).
- **NAMING-ERROR TRAP:** "Esther Project" (this Havas order) is unrelated to the Heritage
  Foundation's "Project Esther" (2024, on antisemitism policy). Search results conflate them. Keep
  them apart.
- **Allegation, not finding:** a FARA complaint by Public Citizen and the Quincy Institute alleges
  the paid influencers should themselves have registered. That is their allegation; no DOJ finding
  was found. The influencers are unnamed in the filings read, and must stay unnamed.

### 4.4 Other 2025–26 Israel-government contracts — DOCUMENTED (filings read)

- **Show Faith by Works, LLC (#7653), Israel MFA, contract dated 09/18/2025**
  (https://efile.fara.gov/docs/7653-Exhibit-AB-20250927-1.pdf):
  - "Christian outreach through various grassroots and digital targeting of Christians in the
    western US. we will create a mobile museum to display at churches, Christian colleges, and
    Christian events. We will target and distribute pro-lsrael information online and through
    targeted geofencing and digital online tools." [sic, OCR "lsrael"]
  - Invoice: "Invoice total: $3,258,961 in 5 equal payments of $651,792".
  - Supplemental to 31 Mar 2026 (https://efile.fara.gov/docs/7653-Supplemental-Statement-20260501-1.pdf):
    receipts $2,313,791.50; disbursements $3,333,191.86.
- **Piro, Inc. (#7732), Havas for LaPam:**
  - work order "TOTAL $900,000" (contract 04/30/2026,
    https://efile.fara.gov/docs/7732-Exhibit-AB-20260602-0.pdf);
  - a second order "TOTAL $100,000" (07/20/2026,
    https://efile.fara.gov/docs/7732-Exhibit-AB-20260729-1.pdf);
  - "strategic communications and media relations services in connection with LaPam's engagement
    on behalf of the State of Israel."
- **Sniper Advertising Services (#7745), Tourism and MFA, 06/18/2026:** "an oral agreement to use
  our advertising services for a term of 1 year", fees by volume.

### 4.5 Comparator: FARA-reported receipts by country, H2 2024 — DOCUMENTED source, MY COMPUTATION

- **Source:** DOJ, *FARA Second Semi-Annual Report – 2024*,
  https://www.justice.gov/media/1406631/dl?inline (linked from
  https://www.justice.gov/nsd-fara/fara-reports-congress).
- **Method:** I summed every "Finances: $…" line under each country heading. "None Reported"
  entries are excluded. The periods are the registrants' own six-month periods ending in 2024.
  **This is money received by US agents as reported in filings in that report, not total
  government spending. Many principals are private.**

  | Country | Sum | Entries with $ |
  |---|---|---|
  | Saudi Arabia | $31,608,442.95 | 21 |
  | Japan | $29,298,200.63 | 47 |
  | China | $27,079,584.12 | 14 |
  | Korea, South | $20,773,305.61 | 17 |
  | UAE | $20,217,301.97 | 20 |
  | **Israel** | **$11,120,670.66** | 8 |
  | Qatar | $6,696,537.10 | 19 |

- **Of Israel's $11.12M:**
  - $7,387,695.06 is the Jewish Agency and $2,405,000 the World Zionist Organization; both are
    registrations by those bodies' US sections;
  - the embassy's counsel (Arnold & Porter) is $328,801.65;
  - MFA (Holland & Knight) $138,520;
  - NSO's three firms $848,653.95.
- **Read:**
  - In H2 2024, before the 2025 advertising contracts, Israel's FARA-reported government receipts
    were small against Gulf and Asian allies.
  - The 2025–26 Havas contracts (§4.2–4.4) change that: Clock Tower alone received $15M in one
    six-month period. **The 2025–26 semi-annual reports were not read**, so no post-2025 country
    comparison is claimed.
- **OpenSecrets Foreign Lobby Watch: refused (403).**

---

## 5. Money in US elections — AIPAC and United Democracy Project

- **Legal status, documented:**
  - AIPAC, EIN 53-0217164: IRS subsection **4** (501(c)(4)), ruling date 1968, NTEE Q20
    (ProPublica Nonprofit Explorer API,
    https://projects.propublica.org/nonprofits/api/v2/organizations/530217164.json).
  - Reported revenue: $79.4M for tax year 2023.
- **Not a foreign agent on the record:**
  - "American Israel Public Affairs" and "AIPAC" appear **0 times** in the FARA principals bulk
    file (registrant or principal).
  - No FARA filing, court finding or DOJ letter about AIPAC was found.
  - **The page must not imply foreign agency.** The historical AZC/1962 DOJ letter in the held
    draft concerns a different organisation.
- **PACs, documented (FEC API, https://api.open.fec.gov/v1/committee/…):**
  - AIPAC PAC, C00797670: "PAC - Qualified", "Lobbyist/Registrant PAC", affiliated with AIPAC;
    first filing **2021-12-15**.
  - **United Democracy Project, C00799031:** "Super PAC (Independent Expenditure-Only)"; first
    filing **2022-01-03**.
- **UDP totals (FEC):**

  | Cycle | Receipts | Independent expenditures | Period |
  |---|---|---|---|
  | 2024 | $87,176,557.14 | $37,859,810.12 | 2023-01-01 to 2024-12-31 |
  | 2026 | $109,721,116.19 | $53,414,686.72 | 2025-01-01 to 2026-08-31 |

- **AIPAC's own transfers, the largest single receipts (FEC Schedule A, top by amount):**
  - $11,000,000 on 2024-09-23;
  - $25,000,000 on 2025-09-25;
  - $5,000,000 on 2025-12-23.
  - The other top receipts are from individual US donors and two organisations. Those are lawful
    contributions, deliberately not listed here; naming donors would invite the "control" framing
    this file refuses.
- **Races with the largest UDP spending.** Source: FEC bulk 24/48-hour independent-expenditure
  files, https://www.fec.gov/files/bulk-downloads/2024/independent_expenditure_2024.csv and
  `…/2026/independent_expenditure_2026.csv`, fetched 19 Oct 2026. **My aggregation:** rows
  filtered to `spe_id = C00799031`, de-duplicated by transaction id keeping the latest filing, and
  names case-folded. The 2024 sum, $38.04M, sits within 0.5% of FEC's $37.86M total.
  - **2024:**
    - NY-16 primary: oppose Bowman $9,865,493; support Latimer $4,682,560.
    - MO-01 primary: oppose Bush $5,242,260; support Bell $3,356,279.
    - CA-47: oppose Min $4,615,289.
    - MD-03: support Elfreth $4,218,074.
    - CA-34 general: support Gomez $1,723,990.
  - **2026 (to the file date):**
    - **Michigan US Senate Democratic primary: oppose El-Sayed $20,423,765; support Stevens
      $10,498,735.**
    - MD-05: support Boafo $5,734,013.
    - IL-07: support Conyears-Ervin $4,968,500.
    - KY-04 Republican primary: oppose Massie $3,576,968.
    - MO-01: oppose Bush $2,457,792.
    - NJ-11: oppose Malinowski $2,326,917.
- **What this is and is not:**
  - It is US-citizen and US-organisation money, disclosed to the FEC, spent in US primaries. It is
    lawful.
  - It is a documented channel of influence over who sits in Congress. It is not foreign agency,
    and no document read says otherwise.
- **Comparator not run** (another issue or ally super PAC); flagged.

---

## 6. Aid and its conditions

### 6.1 Totals and the MOU — DOCUMENTED (CRS)

- **Source:** CRS RL33222, *U.S. Foreign Aid to Israel: Overview and Developments since October 7,
  2023*, **updated May 28, 2025**. This is the latest version per api.congress.gov
  (https://api.congress.gov/v3/crsreport/RL33222?api_key=DEMO_KEY&format=json → RL33222.53.pdf,
  status Active). Read at https://www.everycrsreport.com/reports/RL33222.html.
- **Verbatim:**
  - "Israel is the largest cumulative recipient of U.S. foreign assistance since World War II."
  - "To date, the United States has provided Israel $174 billion (current, or
    non-inflation-adjusted, dollars) in bilateral assistance and missile defense funding."
  - The MOU: "In 2016, the U.S. and Israeli governments signed their third 10-year Memorandum of
    Understanding (MOU) on military aid, covering FY2019 to FY2028. Under the terms of the MOU, the
    United States pledged to provide—subject to congressional appropriation—$38 billion in military
    aid ($33 billion in Foreign Military Financing (FMF) grants plus $5 billion in missile defense
    appropriations)".
  - The MOU was signed 14 Sept 2016.

### 6.2 Emergency supplemental since Oct 2023 — DOCUMENTED (enacted law)

- **P.L. 118-50, Division A, "Israel Security Supplemental Appropriations Act, 2024", approved
  April 24, 2024,** https://www.govinfo.gov/content/pkg/PLAW-118publ50/html/PLAW-118publ50.htm:
  - FMF "$3,500,000,000, to remain available until September 30, 2025, for assistance for Israel";
  - Procurement, Defense-Wide $5,200,000,000, of which "$4,000,000,000 shall be for the Secretary
    of Defense to provide to the Government of Israel for the procurement of the Iron Dome and
    David's Sling defense systems" and "$1,200,000,000 ... for the procurement of the Iron Beam
    defense system".
  - Division A also funds US operations and humanitarian accounts not specific to Israel; those
    are not counted here.
- **CRS Table 2 totals for the war period:** FMF $6.8bn (incl. regular FY2024 $3.3bn), missile
  defense $4.5bn, Iron Beam $1.2bn, and $108.5m other.
- **Not covered:** CRS's latest version predates the 2026 Iran war. No 2026 Israel supplemental was
  read. Line A/B or the war-powers files may have it.

### 6.3 The Leahy law and Israel — the statute is DOCUMENTED; the stalled recommendation is ATTRIBUTED

- **Statute** (22 U.S.C. §2378d, https://www.law.cornell.edu/uscode/text/22/2378d): "No assistance
  shall be furnished under this chapter or the Arms Export Control Act [ 22 U.S.C. 2751 et seq.] to
  any unit of the security forces of a foreign country if the Secretary of State has credible
  information that such unit has committed a gross violation of human rights."
- **CRS on process and the counter-claims:**
  - "some former State Department employees have asserted that the process and standards for
    determining whether allegations of human rights violations by Israeli units are credible are
    more onerous than for other recipients".
  - "then-Secretary of State Blinken denied that the United States had a double standard for
    Israel."
  - **"Some Israeli officials have claimed that during the Gaza war, the State Department subjected
    Israel to higher levels of oversight than other aid recipients globally".** This is the
    symmetry pair, both sides in one paragraph.
- **ProPublica (Brett Murphy), 17 Apr 2024,**
  https://www.propublica.org/article/israel-gaza-blinken-leahy-sanctions-human-rights-violations:
  - "A special State Department panel recommended months ago that Secretary of State Antony Blinken
    disqualify multiple Israeli military and police units from receiving U.S. aid".
  - The panel is "known as the Israel Leahy Vetting Forum".
  - State's response: "the department undergoes a fact-specific investigation applying the same
    standards and procedures regardless of the country in question."
  - "The Israeli government did not respond to a request for comment."
- **State's own 29 Apr 2024 briefing ("five units"):** the archive URL now serves a "Technical
  Difficulties" page (decoy 200; see NULLS). **Not read.**
- **Tier:** statute documented; the recommendation attributed; State's denial attributed (quoted).

### 6.4 NSM-20 (Feb 2024) and its May 2024 report — the text is ATTRIBUTED (two reproductions); the official PDF was not reached

- **CRS's own caveat:** the conclusion is quoted "according to a document released online by an
  advocacy group stating that it is a copy of that report".
- **Text read** in the Jewish Virtual Library reproduction ("Source: VOA, (May 10, 2024)"),
  https://jewishvirtuallibrary.org/state-department-report-on-israel-s-use-of-american-arms,
  matching CRS on the key sentence:
  > "Nevertheless, given Israel's significant reliance on U.S.-made defense articles, it is
  > reasonable to assess that defense articles covered under NSM-20 have been used by Israeli
  > security forces since October 7 in instances inconsistent with its IHL obligations or with
  > established best practices for mitigating civilian harm."
  > "to date the USG is unaware of any Israeli prosecutions for violations of IHL or civilian harm
  > since October 7."
  > "Israel has not shared complete information to verify whether U.S. defense articles covered
  > under NSM-20 were specifically used in actions that have been alleged as violations of IHL or
  > IHRL".
  > "we do not currently assess that the Israeli government is prohibiting or otherwise
  > restricting the transport or delivery of U.S. humanitarian assistance within the meaning of
  > section 620I of the Foreign Assistance Act."
  - And the assurances "to be credible and reliable so as to allow the provision of defense
    articles covered under NSM-20 to continue."
- **Rescinded:** CRS: "According to the Washington Post, on February 21, 2025 then-National
  Security Adviser Michael Waltz rescinded President Biden's NSM-20." (attributed via CRS)
- **Tier:** the text is attributed (two consistent reproductions). The official State PDF URL
  served a decoy page (NULLS).

### 6.5 Section 620I (humanitarian-aid blocking) — the statute is DOCUMENTED; no finding was ever made

- **Statute** (22 U.S.C. §2378-1, https://www.law.cornell.edu/uscode/text/22/2378-1): "No
  assistance shall be furnished under this chapter or the Arms Export Control Act [ 22 U.S.C. 2751
  et seq.] to any country when it is made known to the President that the government of such
  country prohibits or otherwise restricts, directly or indirectly, the transport or delivery of
  United States humanitarian assistance."
- **CRS:**
  - "It is unclear how Section 620I determinations are made. The language of the provision appears
    to provide wide discretion to the executive branch."
  - "Some Members of Congress called upon President Biden to enforce Section 620I. There is no
    public record of the Biden Administration having done so."
  - **On the Oct 2024 30-day letter:** "After the 30-day period, the Department of State said that
    it had not made an assessment that the Israelis are in violation of U.S. law" (citing State's
    12 Nov 2024 briefing).
- **The internal dissent, ATTRIBUTED** (ProPublica, 24 Sept 2024,
  https://www.propublica.org/article/gaza-palestine-israel-blocked-humanitarian-aid-blinken):
  - "The U.S. government's two foremost authorities on humanitarian assistance concluded this
    spring that Israel had deliberately blocked deliveries of food and medicine into Gaza."
  - The head of State's Bureau of Population, Refugees and Migration had determined "that the
    Foreign Assistance Act should be triggered to freeze almost $830 million in taxpayer dollars
    earmarked for weapons and bombs to Israel".
  - Blinken's 10 May statement followed.
- **Counter-account (same piece):**
  - Ambassador Lew's cable "assessed that Israel will not arbitrarily deny, restrict, or otherwise
    impede U.S. provided or supported" shipments.
  - Israeli officials cite "overwhelming negative Israeli public opinion against" allowing aid
    "especially when Hamas seizes portions of it and when hostages remain in Gaza".
  - "The Israeli government did not respond to a request for comment but has said in the past that
    it follows the laws of war, unlike Hamas."
- **Tier:** statute documented. "No 620I finding" is documented by CRS and by the NSM-20
  reproduction. The USAID/PRM conclusions are attributed (documents described, not read).

---

## 7. Not established, refused, or held

- **"Foreign control" of US policy:** unsupported at any tier by anything in this line. Every
  channel above is either:
  - adjudicated and bounded (Franklin; NSO; the Rosen/Weissman dismissal);
  - anonymous and denied (Country A identification, Mega, Newsweek 2014, WSJ 2015, Politico 2019);
  - corporate and disclosed (STOIC per Meta; FARA contracts);
  - lawful domestic money (UDP).
- **Psy-Group as an Israeli-state operation:** not established; the Committee records a private
  firm, and UAE-adviser money.
- **"GAO named Israel":** false. GAO named no country.
- **"Country A paid Pollard" (reading GAO's first bullet as Pollard):** our inference; not to be
  printed as GAO's.
- **"The court threw out the AIPAC case for lack of evidence":** false (JTA 2011 wording). The
  government moved to dismiss.
- **AIPAC as a foreign agent:** no document says so. It is a domestic 501(c)(4) with an LDA-linked
  PAC and a super PAC, and appears nowhere in FARA. Record it accurately, and do not imply.
- **Influencer identities** (Bridges Partners) and **individual Clock Tower short-form
  registrants:** not named; nothing alleges wrongdoing by them.

## 8. Naming-error traps found on this line

1. **"Mega" (1997 codename) ≠ Mega Group (1991 club).**
2. **"Epstein" in SSCI Vol. 5 ≠ Jeffrey Epstein** (a Psy Group employee).
3. **"Esther Project" (Havas influencer order) ≠ Heritage's "Project Esther".**
4. **"State of Israel" as Clock Tower's principal:** the registrant itself says the direct
   registration "was in error"; money came via Havas Media Germany. The chain is
   Israel → Havas → registrant. Print it that way.
5. **The NSM-20 "report" text circulating** is a reproduction. CRS says so.
6. **The section-XV network line on the live page** reads "U.S. Congressional lobbying apparatus
   (AIPAC, 4 addresses to Joint Session of Congress - more than any foreign leader in history)".
   That joins AIPAC to Netanyahu's addresses to Congress, which were invitations by congressional
   leaders. **Flagged for the author, not edited.**

## 9. The held draft (`research/drafts/xxiv-favorite-nation.html`) against this file

- **Checks out:**
  - Franklin's plea and the 2009 drop;
  - Meta's 510 accounts and the STOIC link, with the ministry's denial;
  - Politico 2019 attributed, and Israel's "blatant lie";
  - NSO on the Entity List since Nov 2021, still listed;
  - UDP $87.2M (2024) and $109.7M (2026, to 31 Aug).
- **Refine:**
  1. The FBI "bought a Pegasus licence in 2019 'for product testing and evaluation only'". The
     quote is the FBI's. The **year** is NYT's, and NSO's own court filing says "December 2018".
     Say "a licence (2018–19 by the reports)".
  2. "the department undergoes ... the same standards" is State's quoted position, fine. Add
     CRS's Israeli-officials counter-claim for symmetry.
  3. The draft has no FARA 2025–26 material. Clock Tower and the Havas chain are the largest
     documented new items on this line.

---

## NULLS (refusals and decoys, 19 Oct 2026, this line)

- **Robots disallow:**
  - wsj.com: https://www.wsj.com/articles/israel-spied-on-iran-talks-1427164201 and
    https://www.wsj.com/articles/u-s-spy-net-on-israel-snares-congress-1451425210.
- **403:**
  - https://www.politico.com/story/2019/09/12/israel-white-house-spying-devices-1491351
  - https://openai.com/index/disrupting-deceptive-uses-of-AI-by-covert-influence-operations/
  - https://www.nytimes.com/2024/06/05/technology/israel-campaign-gaza-social-media.html
  - https://www.nytimes.com/2022/01/28/magazine/nso-group-israel-spyware.html
  - jweekly.com (both 1996/1997 DIS-memo pieces)
  - https://www.jurist.org/news/2006/01/former-pentagon-official-sentenced-12/
  - https://forward.com/articles/105479/
  - https://www.israelhayom.com/2019/09/13/trump-i-dont-think-the-israelis-were-spying-on-us/
  - https://www.dawn.com/news/amp/1229766
  - https://digital.bentley.umich.edu/djnews/djn.1996.02.09.001/62/download_text
  - https://s3.documentcloud.org/documents/24658291/national-security-memorandum-report-to-congress-key-findings.pdf
  - https://www.opensecrets.org/fara/countries
  - https://www.state.gov/wp-content/uploads/2024/05/Report-to-Congress-under-Section-2-of-the-National-Security-Memorandum-on-Safeguards-and-Accountability-with-Respect-to-Transferred-Defense-Articles-and-Defense-Services-NSM-20.pdf
- **406:** https://time.com/archive/6730793/hunt-for-a-mole/
- **402:** https://www.globalsecurity.org/intell/library/news/2006/intell-060123-usia01.htm
- **202, an un-served body, treated as a refusal:**
  - https://sgp.fas.org/jud/aipac/dismiss.pdf (the DOJ motion to dismiss);
  - the earlier session's sgp.fas.org PDFs (franklin_plea.pdf, franklin_facts.pdf,
    franklin012006.pdf) are the same shape.
- **429 (rate limit), later succeeded on retry:**
  - courtlistener.com search API;
  - api.open.fec.gov (DEMO_KEY, shared and exhausted). The by-candidate endpoint returned 422 and
    was replaced by the FEC bulk files.
- **503 and timeout:** https://lda.gov/api/v1/registrants/?registrant_name=American%20Israel%20Public%20Affairs
  (and the 2025 filings query timed out). AIPAC's LDA status therefore rests here on the FEC
  "Lobbyist/Registrant PAC" designation of its PAC. An earlier session's ledger rows show lda.gov
  answering 200, but their cache is cold in this container.
- **404:** efile.fara.gov `ForeignPrincipals/json/Active` (no-number form; the bulk CSV used
  instead).
- **400:** eCFR search with date 2026-10-19 (too new; the 2026-10-14 version used).
- **DECOY 200, recommend adding to `scripts/spider/hosts.json`:**
  - `2021-2025.state.gov` now answers both
    https://2021-2025.state.gov/briefings/department-press-briefing-april-29-2024/ and the
    guessed NSM-20 PDF path with a **"Technical Difficulties"** page, HTTP 200, **188,865
    bytes**, sha256 prefix `359e3b8b6b84`.
  - The ledger records both as `ok`. **They are not sources.** Register as `decoy_titles:
    ["Technical Difficulties"]`. This file did not edit hosts.json, per its brief.
- **Image-only, not read (no OCR in container):** https://efile.fara.gov/docs/7649-Exhibit-AB-20261005-1.pdf and
  https://efile.fara.gov/docs/7649-Amendment-20261005-1.pdf.
- **Not attempted / not located:**
  - the Washington Post 1997 "Mega" original;
  - the Washington Times, 22 Feb 1996;
  - the DIS memo itself;
  - Haaretz (STOIC);
  - Mueller report Vol. I (Psy Group; the SSCI volume was read instead);
  - FARA semi-annual reports for 2025–26 (not yet listed on the DOJ page read).

## What would move items up a tier

- **Country A:** a declassified copy of the 1994 interagency report ("Report on U.S. Critical
  Technology Companies") naming countries; a FOIA to GAO for B-265628's classified 1995 version.
- **Franklin's counts:** the plea agreement (sgp.fas.org 202 → PACER, E.D. Va. 1:05-cr-225).
- **Rosen/Weissman reasons:** the 1 May 2009 motion (PACER, E.D. Va. 1:05-cr-225).
- **FBI–NSO:** the FBI's responses to the House Judiciary letter (if any were published).
- **STOIC funding:** an Israeli State Comptroller report, or a Knesset answer, on the Diaspora
  Ministry contract.
- **Clock Tower October 2026 filings:** OCR the two scanned PDFs.
- **NSM-20:** the official State PDF from a working archive.
