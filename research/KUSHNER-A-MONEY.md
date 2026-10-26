# kushner — A, the money

**Summary.** Documented in primaries:
- **Affinity Partners exists on paper.** The adviser is A Fin Management LLC, incorporated in Delaware on 21 Jan 2021 (per the House Oversight letter). Its SEC registration took effect on 25 Aug 2021. Kushner is founder and CEO, with ownership code E (75% or more) since 06/2021.
- **Its current Form ADV** (22 Mar 2026) reports $6,160,297,411 regulatory AUM in six private funds. Of that, $6,097,061,904 sits in three vehicles 100% owned by non-US persons (98.97%, my division). Those three vehicles have 6, 1 and 1 beneficial owners.
- **Affinity's own size statements** run $2.54bn (2022 ADV, per Raskin), "over $3 billion" (2023 ADV, per Raskin), $4.6bn (Dec 2024, Kushner via Bloomberg), "over $5.4B" (Sept 2025, EA release) and "over $6B" (Aug 2026, EA release).
- **Deals in filings:**
  - the EA take-private: announced 29 Sept 2025 and closed 4 Aug 2026. Affinity's share of the ~$36.4bn equity is not broken out;
  - QXO: $150m in July 2024 and $200m in April 2025, with Kushner a QXO director;
  - Paramount's WBD bid: Affinity committed $200m (WBD's own filing), then withdrew on 16 Dec 2025 (Affinity's statement via Bloomberg/Fortune).
- **666 Fifth:** the Brookfield leasehold (3 Aug 2018) and QIA as a 7% Brookfield Property Partners unitholder are in BPY's own filings.
- **Attributed, not primary:**
  - the PIF screening panel's objections and MBS's override. NYT 2022 read only as relayed by House Oversight letters; NYT refused;
  - the QIA/Lunate $1.5bn (Kushner on a podcast via Bloomberg);
  - the Phoenix Financial stake (Israeli press);
  - Qatar-policy timing around 666 Fifth (committee Democrats' framing, with Brookfield's and the Kushners' answers).
- **No formal ethics finding** against Jared Kushner was found in any source read. What exists are requests (Maloney 2022, Raskin 2023 and 2026, Wyden–Raskin 2024 special-counsel request, the DDF IG complaint of Mar 2026, CREW's letter of Mar 2026) and a lawsuit: *CREW v. Kushner*, D.D.C. 1:26-cv-03580, filed 14 Oct 2026, unresolved.
- **Refused today:** finance.senate.gov (403 on every Wyden letter and release that had answered on 23 Oct), nytimes.com, businesswire.com, Brookfield's press page, AGBI, Ahram, and the IAPD Part 2A brochure (404).

**Method note.** The spider cache was cold, so everything cited was re-fetched today. The two Wyden PDFs read on 23 Oct 2026 (ledger sha256 `94f04237…` and `64cb600d…`) now answer 403; one same-identity retry also got 403. Their quotes are carried as `QC` lines from `research/KUSHNER-VF-POST-A-EXCERPT.md`, where they passed `vq.py` on 23 Oct. `vq.py` cannot re-check them today because the latest ledger row for each URL is the 403.

---

## 1. Affinity Partners: founding, registration, ownership

- **Incorporation and registration.** Incorporated in Delaware on 21 Jan 2021, "the day after the Trump Administration ended" (Maloney letter, 2 June 2022, citing Delaware's registry). SEC registration effective 25 Aug 2021, SEC file 801-122021 (IAPD record). The adviser's legal name is A FIN MANAGEMENT LLC; "AFFINITY PARTNERS" is its other name.
- **Ownership.** Schedule A, ADV of 22 Mar 2026: Kushner "FOUNDER AND CHIEF EXECUTIVE OFFICER", acquired 06/2021, ownership code E (75% or more), control person Y. The other two listed officers carry NA (less than 5%).

Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2022-06-02.CBM%20to%20Kushner-A%20Fin%20Management%20LLC%20re%20Saudi%20Arabia%20Conflicts.pdf | day as a private citizen, you incorporated Affinity in the state of Delaware.
Q | https://api.adviserinfo.sec.gov/search/firm/315482 | \"effectiveDate\": \"8/25/2021\"
Q | https://api.adviserinfo.sec.gov/search/firm/315482 | \"otherNames\": [\"A FIN MANAGEMENT LLC\", \"AFFINITY PARTNERS\"]
Q | https://reports.adviserinfo.sec.gov/reports/ADV/315482/PDF/315482.pdf | D. (1) If you are registered with the SEC as an investment adviser, your SEC file number: 801-122021
Q | https://reports.adviserinfo.sec.gov/reports/ADV/315482/PDF/315482.pdf | KUSHNER, JARED, COREY I FOUNDER AND CHIEF
Q | https://reports.adviserinfo.sec.gov/reports/ADV/315482/PDF/315482.pdf | 06/2021 E Y N
Q | https://reports.adviserinfo.sec.gov/reports/ADV/315482/PDF/315482.pdf | E - 75% or more
TIER: documented (SEC filing and the IAPD record; Delaware incorporation date as stated in a committee letter citing the state registry)
SYMMETRY: n/a (facts of registration)
NULL: the Delaware registry was not fetched. The Part 2A brochure (`files.adviserinfo.sec.gov … BRCHR_VRSN_ID=1023093`) answered 404, so fee terms come only from the Senate and House letters below.

## 2. Form ADV, 22 Mar 2026: size, funds, non-US share (settles the page's size figures)

- **Firm level (Item 5.F).** Discretionary regulatory AUM is $6,160,297,411 in 6 accounts. Of that, $6,097,061,904 is "attributable to clients who are non- United States persons". Item 5.C(2): 50% of clients are non-US persons. **The "clients" here are the six private funds, not the investors**, so the investor-level figure is in Schedule D 7.B(1).
- **Fund level (Schedule D 7.B(1)).** pypdf extracts this PDF cumulatively, page over page. The six funds appear in this order, each with one gross asset value, one owner count and one non-US percentage. The six values sum exactly to $6,160,297,411, and the three 100%-non-US values sum exactly to $6,097,061,904, which confirms the alignment. My reading:

| Fund | Gross asset value | Beneficial owners | % owned by non-US persons |
|---|---|---|---|
| Fund I Co-Invest Delta II LP | $12,033,077 | 1 | 0% (100% related persons) |
| Fund I Co-Invest Delta LP | $1,193,319,132 | 1 | 100% |
| Fund I Co-Invest Sigma II LP | $6,023,254 | 1 | 0% (100% related persons) |
| Fund I Co-Invest Sigma LP | $596,596,930 | 1 | 100% |
| Fund I LP | $45,179,176 | 1 | 0% |
| Parallel Fund I LP | $4,307,145,842 | 6 | 100% |

- **What the table shows.** About 99% of Affinity's regulatory AUM sits in three vehicles wholly owned by non-US persons, with at most 8 beneficial-owner slots (owners may overlap across vehicles). The ADV names no investor.
- **Earlier size statements, each dated:**
  - $2.54bn, of which $2.51bn was non-US. This is the "latest records" as of Feb 2023, i.e. the 2022 ADV (Raskin, 15 Feb 2023);
  - "over $3 billion" (Mar 2023 ADV, per Raskin, 31 Aug 2023);
  - $4.6bn after the QIA/Lunate money (Dec 2024, attributed, §4);
  - "over $5.4B" (EA release, 29 Sept 2025);
  - "over $6B" (EA closing release, Aug 2026).

Q | https://reports.adviserinfo.sec.gov/reports/ADV/315482/PDF/315482.pdf | 3/22/2026 10:07:37 AM
Q | https://reports.adviserinfo.sec.gov/reports/ADV/315482/PDF/315482.pdf | Total: (c) $ 6,160,297,411 (f) 6
Q | https://reports.adviserinfo.sec.gov/reports/ADV/315482/PDF/315482.pdf | $ 6,097,061,904
Q | https://reports.adviserinfo.sec.gov/reports/ADV/315482/PDF/315482.pdf | (2) Approximately what percentage of your clients are non- United States persons?
Q | https://reports.adviserinfo.sec.gov/reports/ADV/315482/PDF/315482.pdf | AFFINITY PARTNERS PARALLEL FUND I LP
Q | https://reports.adviserinfo.sec.gov/reports/ADV/315482/PDF/315482.pdf | $ 4,307,145,842
Q | https://reports.adviserinfo.sec.gov/reports/ADV/315482/PDF/315482.pdf | $ 1,193,319,132
Q | https://reports.adviserinfo.sec.gov/reports/ADV/315482/PDF/315482.pdf | $ 596,596,930
Q | https://reports.adviserinfo.sec.gov/reports/ADV/315482/PDF/315482.pdf | 16. What is the approximate percentage of the private fund beneficially owned by non- United States persons:
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2023-02-15.%20JBR%20to%20Kushner%20re%20Saudi%20Arabia.fnl_.pdf | show that $2.51 billion out of Affinity’s $2.54 billion in assets under management came from
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2023-08-31.JBR%20to%20Comer%20re%20Kushner%20Subpoena.pdf | In March 2023, Affinity reported that it had over $3 billion of assets under management, 99% of which was “attributable
Q | https://www.sec.gov/Archives/edgar/data/712515/000114036125036415/ef20056167_ex99-1.htm | With over $5.4B under management and a team of 30+ professionals
Q | https://www.sec.gov/Archives/edgar/data/712515/000114036126031157/ef20079099_ex99-1.htm | Miami-based investment firm founded in 2021 by Jared Kushner.
TIER: documented (the adviser's own SEC filing). The fund-level alignment is my reading of a badly extracted PDF, checked by the two exact sums.
SYMMETRY: Affinity's own release figures ("over $5.4B", "over $6B") agree with the ADV in direction and size.
NULL: the 2022, 2023, 2024 and 2025 ADVs were not retrieved. IAPD serves only the current PDF at this URL, so earlier figures rest on the House letters. **No source read reproduces the page's "~$4.8B".**

## 3. Saudi PIF: the $2bn, the screening panel, the override, the fees

- **The commitment.** $2bn from PIF.
  - The Senate Finance letter of 12 June 2024 says "made in June 2021".
  - The Wyden–Raskin letter of Oct 2024, citing a briefing by Affinity's own CLO, says the 1.25% fee runs "during the investment period from June 2021 through August 2026".
  - The Maloney letter and CNN say "Six months later" after the 21 Jan 2021 incorporation. That is approximate, and is the likeliest source of "July".
- **The panel and the override (attributed).** NYT, 10 Apr 2022, as relayed by the Maloney (June 2022) and Raskin (Aug 2023) letters:
  - PIF's investment committee objected to "the inexperience of the Affinity Fund management" and to "excessive" fees, and found Affinity's operations "unsatisfactory in all respects";
  - PIF's full board, led by MBS, overruled the panel.
  - The PIF documents themselves were not read.
- **Investor count at the time.** Maloney, from the ADV: as of 30 Mar 2022, PIF was "one of only two investors".
- **Fees.**
  - Maloney 2022 (reported): "$25 million in annual asset management fees" plus a 20% profit share.
  - The Wyden June 2024 letter assumed a 2% fee.
  - Affinity's CLO later briefed Senate Finance staff on 24 July 2024 that the fee is 1.25% on PIF's $2bn. On that basis the senators total $87.5m collected from the Saudi government.
  - 1.25% × $2bn = $25m a year, which matches Maloney's figure.

QC | https://www.finance.senate.gov/imo/media/doc/chairman_wyden_to_fin_management_on_kushner_firm_paymentspdf.pdf | $2 billion investment from the Saudi Public Investment Fund (hereafter “Saudi PIF”) made in June 2021, shortly after Mr. Kushner left the White House.
QC | https://www.finance.senate.gov/imo/media/doc/wyden_raskin_kushner_fara.pdf | Affinity is guaranteed an annual 1.25% management fee on the $2 billion in funds committed to Affinity by the Saudi PIF during the investment period from June 2021 through August 2026.
QC | https://www.finance.senate.gov/imo/media/doc/wyden_raskin_kushner_fara.pdf | Briefing provided by Chad Mizelle, Chief Legal Officer, to majority staff of Senate Committee on Finance, Jul. 24, 2024.
QC | https://www.finance.senate.gov/imo/media/doc/wyden_raskin_kushner_fara.pdf | Under that fee structure, Affinity has collected the $87.5 million in management fees from the Saudi government
QC | https://www.finance.senate.gov/imo/media/doc/chairman_wyden_to_fin_management_on_kushner_firm_paymentspdf.pdf | Affinity charges investors annual management fees of 2% of assets under management
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2022-06-02.CBM%20to%20Kushner-A%20Fin%20Management%20LLC%20re%20Saudi%20Arabia%20Conflicts.pdf | Six months later, Affinity secured a $2 billion investment from the Saudi sovereign wealth fund, PIF, which is
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2022-06-02.CBM%20to%20Kushner-A%20Fin%20Management%20LLC%20re%20Saudi%20Arabia%20Conflicts.pdf | The panel also concluded that Affinity’s operations were “unsatisfactory in all
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2022-06-02.CBM%20to%20Kushner-A%20Fin%20Management%20LLC%20re%20Saudi%20Arabia%20Conflicts.pdf | overruled the investment panel and decided to invest $2 billion with Affinity.
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2022-06-02.CBM%20to%20Kushner-A%20Fin%20Management%20LLC%20re%20Saudi%20Arabia%20Conflicts.pdf | Securities and Exchange Commission filings, it appears that, as of March 30, 2022, PIF was one
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2022-06-02.CBM%20to%20Kushner-A%20Fin%20Management%20LLC%20re%20Saudi%20Arabia%20Conflicts.pdf | investment will generate $25 million in annual asset management fees for Affinity, which you
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2023-08-31.JBR%20to%20Comer%20re%20Kushner%20Subpoena.pdf | In 2021, PIF’s own
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2023-08-31.JBR%20to%20Comer%20re%20Kushner%20Subpoena.pdf | investment committee advised PIF against investing with Affinity, expressing concerns about
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2023-08-31.JBR%20to%20Comer%20re%20Kushner%20Subpoena.pdf | Affinity’s “excessive” management fees, as well as “the inexperience of the Affinity Fund
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2023-08-31.JBR%20to%20Comer%20re%20Kushner%20Subpoena.pdf | Crown Prince Mohammed bin Salman overruled these substantial objections and
Q | https://www.cnn.com/2026/10/01/us/jared-kushner-israel-gaza-investments-invs-vis | Six months later, the firm secured a $2 billion investment from the Saudi Public Investment Fund (PIF)
TIER:
- documented: the $2bn commitment (Senate Finance letter, plus Affinity's own CLO briefing as relayed) and the June 2021 start of the investment period;
- attributed: the panel's objections and the board's override (NYT via Congress; the PIF minutes are unread);
- reported, then superseded by Affinity's own figure: the fee.
SYMMETRY:
- Affinity to the House committee, June 2022: it had "nothing to hide" (Raskin, Feb 2023).
- Kushner, Oct 2024: "There is no conflict of interest." He called the Wyden–Raskin special-counsel request "silly political stunts".
- Mizelle (CLO) called it "a disgraceful attempt … accusations that have no merit or evidence" (Reuters via Jakarta Post). Affinity has said Wyden's staff "do not understand the realities of private equity" (same copy, paraphrase).
- Kushner, Oct 2025: "What people call conflicts of interests, Steve and I call experience and trusted relationships" (AP copy).
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2023-02-15.%20JBR%20to%20Kushner%20re%20Saudi%20Arabia.fnl_.pdf | subsequent email, Affinity stated that it had “nothing to hide” and confirmed that it was
Q | https://www.thejakartapost.com/world/2024/10/25/democratic-lawmakers-request-probe-into-jared-kushner-after-saudi-report | In a statement, Kushner said, "There is no conflict of interest."
Q | https://www.thejakartapost.com/world/2024/10/25/democratic-lawmakers-request-probe-into-jared-kushner-after-saudi-report | a disgraceful attempt by Wyden and Raskin to turn an already weaponized DOJ into a fully political operation with accusations that have no merit or evidence.
Q | https://www.wdbo.com/news/politics/watchdog-group-seeks/UGBDYFPJIA6XRLAOFLDRTFY3OE/ | What people call conflicts of interests, Steve and I call experience and trusted relationships that we have throughout the world
NULL:
- NYT 10 Apr 2022 and 30 Mar 2023: 403;
- finance.senate.gov: 403 today on both Wyden letters, on the 2024 release and on the Oct 2022 release;
- the PIF board and committee documents: never seen;
- Middle East Eye (the page's cited source): not fetched;
- **"PR risks"** (the page's phrase): in no source read.

## 4. The other investors: UAE, Qatar, Terry Gou, then QIA and Lunate

- **First close (documented in the letters).** Senate Finance, June 2024: "The remaining $1 billion is split between sovereign wealth funds owned by the governments of the United Arab Emirates and Qatar; Terry Gou" and one unnamed investor. Raskin, Aug 2023, cites news reports of $200m each from the UAE and Qatar.
- **Dec 2024 (attributed).** QIA and Lunate (Abu Dhabi) added $1.5bn, and the investment period was extended to 2029. The source is Kushner on a podcast, via Bloomberg via EnterpriseAM. The split between the two is not known.

QC | https://www.finance.senate.gov/imo/media/doc/chairman_wyden_to_fin_management_on_kushner_firm_paymentspdf.pdf | The remaining $1 billion is split between sovereign wealth funds owned by the governments of the United Arab Emirates and Qatar; Terry Gou
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2023-08-31.JBR%20to%20Comer%20re%20Kushner%20Subpoena.pdf | According to news reports, the U.A.E. and Qatar each also invested $200 million with Affinity.
Q | https://enterpriseam.com/uae/2024/12/23/lunate-qia-invest-usd-1-5-bn-in-jared-kushners-affinity-partners/ | invested an additional USD 1.5 bn in Affinity Partners, the private equity firm founded by Donald Trump’s son-in-law Jared Kushner, Bloomberg cited Kushner as saying on a podcast episode. It’s not clear how much Lunate and QIA each invested.
Q | https://enterpriseam.com/uae/2024/12/23/lunate-qia-invest-usd-1-5-bn-in-jared-kushners-affinity-partners/ | The fresh funds bring Affinity’s total assets under management to USD 4.6 bn
Q | https://enterpriseam.com/uae/2024/12/23/lunate-qia-invest-usd-1-5-bn-in-jared-kushners-affinity-partners/ | ensuring Affinity does not need to raise capital during Trump’s four years in office to “avoid any conflicts,” Kushner claimed.
TIER:
- the first ~$1bn split: documented, as the Senate committee's statement of Affinity-supplied facts;
- the $200m each: attributed (news reports via Raskin);
- the $1.5bn: attributed (Kushner's own statement, relayed twice).
SYMMETRY: his stated reason for raising before the term was to "avoid any conflicts". In Mar 2026 Affinity said it would take no new capital while he volunteers (the Garcia/NYT relay, in `KUSHNER-VF-POST-A-EXCERPT.md`).
NULL:
- Bloomberg original: not fetched. The bnnbloomberg copy returned only page chrome;
- AGBI: 405;
- no QIA, Lunate or ADQ release was found.
- **Naming:** Lunate is an Abu Dhabi asset manager. The page calls it "Abu Dhabi's Lunate", which is fine, but it is not a sovereign fund by name.

## 5. Deals 2022–2026 in filings or counterparties' releases

### 5a. Electronic Arts take-private (PIF + Silver Lake + Affinity)
- **Timeline:**
  - merger agreement 28 Sept 2025, announced 29 Sept 2025: $210 a share, ~$55bn enterprise value, PIF rolling its 9.9% stake;
  - stockholder approval 22 Dec 2025;
  - all regulatory approvals by 30 July 2026;
  - **closed 4 Aug 2026**, delisted from Nasdaq.
- **Financing.** Equity "approximately $36.4 billion" (proxy) / "approximately $36 billion" (release), plus $20bn of JPMorgan debt.
- **Affinity's share** of the equity is not broken out in the proxy or in either release read. The proxy names CFIUS approval as a closing condition; the CFIUS outcome itself is not described beyond "all regulatory approvals … obtained".
- Kushner is quoted in both releases as Affinity's CEO.

Q | https://www.sec.gov/Archives/edgar/data/712515/000114036125036415/ef20056167_ex99-1.htm | EA Announces Agreement to be Acquired by PIF, Silver Lake, and Affinity Partners
Q | https://www.sec.gov/Archives/edgar/data/712515/000114036125036415/ef20056167_ex99-1.htm | with PIF rolling over its existing 9.9% stake in the Company. EA stockholders will receive $210
Q | https://www.sec.gov/Archives/edgar/data/712515/000114036125036415/ef20056167_ex99-1.htm | constituting an equity investment of approximately $36 billion, and $20 billion of debt financing fully and solely committed by JPMorgan Chase Bank, N.A.
Q | https://www.sec.gov/Archives/edgar/data/712515/000114036125042872/ny20056157x2_defm14a.htm | have severally committed to capitalize Parent at the closing of the merger with equity financing equal to approximately $36.4 billion
Q | https://www.sec.gov/Archives/edgar/data/712515/000114036126030255/ef20078929_8k.htm | As of July 30, 2026, all regulatory approvals required to complete the Merger have been obtained.
Q | https://www.sec.gov/Archives/edgar/data/712515/000114036126031157/ef20079099_8k.htm | On August 4, 2026 (the “ Closing Date ”), pursuant to the Merger Agreement
Q | https://www.sec.gov/Archives/edgar/data/712515/000114036126031157/ef20079099_ex99-1.htm | EA Announces Completion of Acquisition by PIF, Silver Lake, and Affinity Partners
TIER: documented (EA's own 8-Ks and proxy)
SYMMETRY: n/a (a disclosed transaction). No public objection from the counterparties was found.
NULL: the post-close cap table is not disclosed in anything read; businesswire.com returned 403 (the EDGAR exhibit is the same release).

### 5b. QXO (building-products distributor) — Affinity is a 13D filer and Kushner a director
- **Private Placement I:** agreement 22 July 2024, closed 25 July 2024. 16,247,069 shares to Parallel Fund I (non-US domiciled, code E9) plus 164,310 to Fund I, both at $9.14; ~$150m in total.
- **Private Placement II:** agreement 17 Mar 2025, closed 29 Apr 2025. 16,260,163 shares at $12.30, $200,000,004.90.
- **Holding and seat.** 6.3% at the 13D (May 2025); 4.9% after dilution (13D/A, Aug 2025). Kushner is "a director of the Issuer".
- **13F, 30 June 2026.** QXO is the only reportable holding ($565,024,481 across two lines).

Q | https://www.sec.gov/Archives/edgar/data/1236275/000114036125017533/primary_doc.xml | On July 22, 2024, the Issuer entered into a Purchase Agreement with Affinity LP and Affinity Parallel LP
Q | https://www.sec.gov/Archives/edgar/data/1236275/000114036125017533/primary_doc.xml | at an offering price of $12.30 per share for an aggregate purchase price of $200,000,004.90. On April 29, 2025, Private Placement II closed.
Q | https://www.sec.gov/Archives/edgar/data/1236275/000114036125017533/primary_doc.xml | including Mr. Kushner, as a director of the Issuer
Q | https://www.sec.gov/Archives/edgar/data/1236275/000114036125031371/primary_doc.xml | due to dilution caused by the issuance of additional shares of Common Stock by the Issuer, and not in connection with a disposition
Q | https://www.sec.gov/Archives/edgar/data/2059583/000090514826003725/primary_doc.xml | 565024481
TIER: documented (the 13D, 13D/A and 13F filed by Affinity and Kushner)
SYMMETRY: n/a
NULL: none

### 5c. Paramount Skydance's bid for Warner Bros. Discovery — Affinity in, then out
- **In (documented, WBD's 14D-9/A of 7 Jan 2026).** Paramount's 1 Dec 2025 bid named seven equity investors totalling $37.2bn, including **Affinity Partners ($200 million)**, PIF ($10bn), L'imad (Abu Dhabi, $7bn) and QIA ($7bn).
- **Governance rights.** Paramount's later letter, in its PREC14A of 22 Jan 2026, says its outside financing partners, "Affinity Partners (Jared Kushner)" among them, agreed to forgo governance rights.
- **Out (attributed).** On 16 Dec 2025 Affinity said it had "decided no longer to pursue the opportunity" (statement via Bloomberg/Fortune). No SEC filing read records the withdrawal.

Q | https://www.sec.gov/Archives/edgar/data/1437107/000119312526005426/d75660dsc14d9a.htm | Qatar Investment Authority (Qatar) ($7 billion), Tencent ($1 billion), RedBird ($300 million) and Affinity Partners ($200 million).
Q | https://www.sec.gov/Archives/edgar/data/1437107/000110465926005603/tm2533570-38_prec14a.htm | Affinity Partners (Jared Kushner)) have agreed to forgo any governance rights
Q | https://fortune.com/2025/12/16/jared-kushner-affinity-withdraws-from-paramount-takeover-warner-netflix/ | Affinity ​has ​decided no longer to pursue ​the opportunity
Q | https://fortune.com/2025/12/16/jared-kushner-affinity-withdraws-from-paramount-takeover-warner-netflix/ | Its $200 million contribution to the financing was relatively minor, the people said.
TIER: participation and amount documented (WBD's filing); withdrawal attributed (Affinity's statement relayed by Bloomberg)
SYMMETRY: Affinity: "We continue to believe there is a strong strategic rationale for Paramount's offer." Bloomberg's anonymous account says the attention to Kushner's role drove the exit; Affinity's own stated reason was the changed dynamics with "two strong competitors".
NULL: Paramount's Schedule TO amendments were not opened; EDGAR full-text search for "Affinity Partners" in tender/merger forms from Dec 2025 returned only the two WBD 14D-9/As.

### 5d. Israel: Shlomo Group and Phoenix Financial (attributed, Israeli press and CNN)
- **Shlomo Group.** In 2023, a 15% stake in Shlomo's car-rental and credit business for $150m (CNN).
- **Phoenix Financial:**
  - **July 2024:** 4.95% bought from Centerbridge/Gallatin for NIS 466m (Ynet/Calcalist) or NIS 470m (Globes), with an option on an equal stake;
  - **15 Jan 2025:** Israel's Capital Market Authority approved the option on the last day before expiry, taking the stake to 9.9% and making Affinity the largest shareholder. Total NIS 932m (Ynet) or 940m (Globes). The sources differ, and that is recorded;
  - **28 July 2026:** sold 2.5% for about NIS 1.05bn, keeping 7.4%, still the largest holder.
- CNN (1 Oct 2026) details Phoenix's own holdings in Israeli defence suppliers. **That is Phoenix's portfolio, not Affinity's.**

Q | https://en.globes.co.il/en/article-1001499509 | The approval was issued on the last day before the option to exercise 4.95% in the insurance company's shares expired.
Q | https://en.globes.co.il/en/article-1001499509 | Despite the approval from the Capital Market Authority, it is expected to impose restrictions, since the fund is a "Saudi fund" whose financial sources were raised mainly from Gulf countries.
Q | https://www.ynetnews.com/business/article/byukn3rsfg | In July 2024, Affinity acquired a 4.95% stake in Phoenix for NIS 466 million from the U.S. funds Centerbridge and Gallatin Point
Q | https://www.ynetnews.com/business/article/byukn3rsfg | Those approvals were granted in January 2025, bringing Affinity’s total holding to 9.9% at a combined investment of NIS 932 million.
Q | https://en.globes.co.il/en/article-1001550617 | Affinity Partners sold 2.5% of the shares in the company to US financial institutions.
Q | https://en.globes.co.il/en/article-1001550617 | Affinity Partners’ stake in Phoenix Financial is now 7.4%.
Q | https://www.cnn.com/2026/10/01/us/jared-kushner-israel-gaza-investments-invs-vis | In 2023, Affinity agreed to make its first investment in Israel, buying a 15% stake in the Shlomo Group’s car rental and credit business for $150 million.
TIER: attributed. The TASE/Maya filings and the Capital Market Authority's decision were not read.
SYMMETRY:
- Kushner: "Investing in Phoenix in July 2024 was a decision rooted in my belief in Israel's resiliency and the fundamentals of Phoenix's business" (to Bloomberg, via CNN).
- Phoenix: "shareholder value is derived primarily from operating performance rather than investment returns" (CNN).
- White House (Kelly): "personal business activities have nothing to do with his diplomatic engagements" (CNN).
Q | https://www.cnn.com/2026/10/01/us/jared-kushner-israel-gaza-investments-invs-vis | “Investing in Phoenix in July 2024 was a decision rooted in my belief in Israel’s resiliency and the fundamentals of Phoenix’s business,” Kushner told Bloomberg
Q | https://www.cnn.com/2026/10/01/us/jared-kushner-israel-gaza-investments-invs-vis | “Jared Kushner’s personal business activities have nothing to do with his diplomatic engagements, which he conducts on a volunteer basis at the President’s request,” said White House principal deputy press secretary Anna Kelly.
NULL: maya.tase.co.il and the CMA site were not tried. Shlomo's pulled IPO is mentioned in a Globes link title only and was not read.

### 5e. Other deals named in press only (not verified in filings)
- Zamp (Brazil), EGYM (Germany) and Dubizzle (Dubai) are named by CNN and EnterpriseAM. CNN reports "28 investments so far" (Kushner, Mar 2026).
- The Serbia hotel plan was dropped in Dec 2025 "after tensions around the project culminated in the indictment of a government official" (Bloomberg via Fortune). **The official is unnamed here and stays unnamed.**

Q | https://fortune.com/2025/12/16/jared-kushner-affinity-withdraws-from-paramount-takeover-warner-netflix/ | Affinity  dropped  plans for a hotel in Serbia after tensions around the project culminated in the indictment of a government official who helped clear a path for its development.
Q | https://www.cnn.com/2026/10/01/us/jared-kushner-israel-gaza-investments-invs-vis | Kushner revealed in March that Affinity had made 28 investments so far
TIER: attributed
NULL: no filing read for these.

## 6. Kushner Companies and 666 Fifth Avenue

- **The transaction (documented in Brookfield Property Partners' own filings).**
  - On 3 Aug 2018, through "a Brookfield Asset Management-sponsored real estate opportunity fund", Brookfield acquired a 100% leasehold interest with a term of 99 years in 666 Fifth Avenue (Q2 2018 6-K, subsequent events).
  - BPY's 2018 20-F gives the consideration as **$1,299 million** in one place and **$1,252 million** in another. Press used $1.1bn, $1.2bn and $1.3bn.
  - Seller: Kushner Companies. Jared had "sold his interests in the company to a family trust in 2017" (Reuters via NBC: attributed; his OGE forms were not read).
- **The Qatar link (documented as far as it goes).** BPY's 20-F lists the Qatar Investment Authority as a 7% holder (70,038,910 units, fully exchanged basis, as of 22 Feb 2019), the "Class A Preferred Unitholder" from 2014. **No filing read shows QIA money in the 666 Fifth fund specifically.** The committees' phrase "funding from a subsidiary backed by the Government of Qatar" is their reading.
- **The timing allegation (committee Democrats').**
  - Wyden and Maloney, 7 Dec 2022: Charles Kushner "engaged in discussions to bail out the property with Brookfield on February 14, 2018 … shortly before the Trump administration announced its support for ending the Saudi Arabian–Emirati blockade against Qatar". They were "probing whether" Jared advised supporting the blockade while Kushner Companies sought a Qatari bailout.
  - Raskin, Aug 2023: Jared's support for the blockade "followed unsuccessful efforts … to secure a billion-dollar bailout from Qatar's sovereign wealth fund".
  - The State/DoD letters (finance.senate.gov: 403) and the underlying documents (an image-only scan, no text layer; not OCR'd, per the stop rule on imagery) were not read.

Q | https://www.sec.gov/Archives/edgar/data/1545772/000154577218000010/bpyex992q22018.htm | On August 3, 2018, through a Brookfield Asset Management-sponsored real estate opportunity fund, acquired a 100% leasehold interest with a term of 99 years
Q | https://www.sec.gov/Archives/edgar/data/1545772/000154577219000003/bpy201820-f.htm | the partnership acquired a 100% leasehold interest in 666 Fifth Avenue, a commercial office asset in New York, for consideration of $1,299 million
Q | https://www.sec.gov/Archives/edgar/data/1545772/000154577219000003/bpy201820-f.htm | In the third quarter of 2018, we acquired a 100% leasehold interest in 666 Fifth Avenue, a commercial office asset in New York, for consideration of $1,252 million
Q | https://www.sec.gov/Archives/edgar/data/1545772/000154577219000003/bpy201820-f.htm | Qatar Investment Authority (4)
Q | https://www.sec.gov/Archives/edgar/data/1545772/000154577219000003/bpy201820-f.htm | 70,038,910
Q | https://www.sec.gov/Archives/edgar/data/1545772/000154577219000003/bpy201820-f.htm | other than Brookfield Asset Management, Partners Limited and the Class A Preferred Unitholder, beneficially owns or controls or directs
Q | https://www.sec.gov/Archives/edgar/data/1545772/000154577218000010/bpyex992q22018.htm | In connection with the issuance of Preferred Equity Units to Qatar Investment Authority (“QIA”) in the fourth quarter of 2014
Q | https://oversightdemocrats.house.gov/news/press-releases/house-oversight-and-senate-finance-committees-seek-documents-from-state-and | In August 2018, Brookfield Asset Management paid Kushner Companies $1.1 billion using funding from a subsidiary backed by the Government of Qatar to sign a 99-year lease on the Kushners' 666 Fifth Avenue property.
Q | https://oversightdemocrats.house.gov/news/press-releases/house-oversight-and-senate-finance-committees-seek-documents-from-state-and | engaged in discussions to bail out the property with Brookfield on February 14, 2018—months earlier than previously known and shortly before the Trump administration announced its support for ending the Saudi Arabian–Emirati blockade against Qatar.
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2023-08-31.JBR%20to%20Comer%20re%20Kushner%20Subpoena.pdf | Mr. Kushner’s support for Saudi Arabia and U.A.E.’s blockade of Qatar followed
Q | https://www.nbcnews.com/news/us-news/kushner-companies-lease-out-money-losing-office-tower-n897591 | Jared, who is married to Trump's daughter Ivanka, sold his interests in the company to a family trust in 2017.
TIER:
- documented: the lease (date, term, consideration as booked by BPY), and QIA as a 7% BPY holder;
- attributed / contested: that Qatari money funded this particular deal;
- **unsupported at any tier read:** that the deal was a quid pro quo for, or caused, US policy on Qatar. That is the committees' question, stated by them as a probe, with no finding.
- **Anti-map:** Feb 2018 talks, then a policy shift, is a shared timeline, not a chain.
- **Naming:** it was Charles Kushner, not Jared, in the 2017–18 talks (per the committees' own release). A **trap:** EDGAR full-text search for "666 Fifth Avenue" returns hundreds of unrelated private-fund Form Ds that merely list the building as an office address.
SYMMETRY:
- Brookfield "has always said there was no Qatari involvement" (Bisnow, Dec 2020), and told the Washington Post it has been "fully transparent and responded to all requests" (via Yahoo, Dec 2022).
- Charles Kushner reportedly told the Post he would not have taken Qatari money because it would put his son in a difficult position (Yahoo relay).
- Kushner Properties reportedly said in 2018 there was no Qatari connection (Yahoo relay).
- Wyden and Castro, Dec 2020, as a counterpoint: "While Brookfield has claimed that Qatari representatives had no involvement … we remain troubled that Qatari funds ended up in a billion-dollar rescue".
Q | https://www.bisnow.com/news/new-york/capital-markets/lawmakers-investigating-if-666-fifth-ave-deal-influenced-trump-foreigin-policy-on-qatar-107048 | The Qatar Investment Authority is a major backer of Brookfield, though the company has always said there was no Qatari involvement in the 666 Fifth Ave. deal.
Q | https://www.bisnow.com/news/new-york/capital-markets/lawmakers-investigating-if-666-fifth-ave-deal-influenced-trump-foreigin-policy-on-qatar-107048 | While Brookfield has claimed that Qatari representatives had no involvement in the 666 Fifth Avenue transaction, we remain troubled that Qatari funds ended up in a billion-dollar rescue for a company directly tied to Jared Kushner
Q | https://news.yahoo.com/jared-kushner-family-business-dealings-203600375.html | Brookfield told the Post it has been "fully transparent and responded to all requests," claiming its dealings with the Kushner family were based on the merits of that building as an investment.
Q | https://news.yahoo.com/jared-kushner-family-business-dealings-203600375.html | Neither the Qatar Investment Authority nor the Kushner family addressed the matter, though Kushner Properties reportedly said in 2018 there was no Qatari connection to the deal.
NULL:
- Brookfield's 3 Aug 2018 release (bn.brookfield.com: 403; finanzen.ch copy: 404);
- the Wyden–Maloney State/DoD letters (finance.senate.gov `download … &download=1`: 403; the HTML wrapper answered 200 with no body, a decoy shape worth registering);
- the Wyden letter to Brookfield of Oct 2022 and its release: 403;
- the underlying documents PDF: image-only, not read;
- the Intercept/WaPo originals: not fetched;
- no committee report or finding located.

## 7. Ethics and financial disclosure: requests, a lawsuit, no finding

- **First term (2017–21).** He was a formal employee and filed disclosures (AP: "filed the appropriate financial disclosures, although neither took a salary"). The OGE 278e forms themselves were not read; OGE releases them by request form, which was not filed.
- **Committee Democrats' requests:**
  - Maloney to Affinity, 2 June 2022 (documents by 16 June);
  - Raskin to Kushner, 15 Feb 2023;
  - Raskin to Comer, 31 Aug 2023, asking for a subpoena. Affinity produced "a small subset" on 26 July 2022, and the letter says Affinity's counsel ignored all requests after 12 Oct 2022;
  - Wyden and Raskin to the Attorney General, Oct 2024, asking for a special counsel on FARA (Reuters via Jakarta Post);
  - Raskin letters, Apr 2026 (CNN relay) and 25 Aug 2026 (Washington Examiner; text paywalled).
  - **None is a finding.** The minority has no subpoena power, and no special counsel was reported appointed in anything read.
- **2026.**
  - CREW letter, 11 Mar 2026: he "must file" a public disclosure within 30 days of the 19 Feb appointment as Special Envoy for Peace.
  - DDF complaint to State OIG, 3 Mar 2026, alleging the anti-nepotism statute and emoluments risk.
  - **CREW v. Kushner, D.D.C. 1:26-cv-03580, filed 14 Oct 2026**, which also names Witkoff, Wiles, Rubio and Hegseth in their official capacities.

Q | https://www.wdbo.com/news/politics/watchdog-group-seeks/UGBDYFPJIA6XRLAOFLDRTFY3OE/ | Kushner and his wife, Ivanka Trump, were formal government employees during the first Trump administration and filed the appropriate financial disclosures, although neither took a salary.
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2023-02-15.%20JBR%20to%20Kushner%20re%20Saudi%20Arabia.fnl_.pdf | failed to produce any documents until July 26, 2022—a full eight weeks after the Committee sent
Q | https://oversightdemocrats.house.gov/sites/evo-subsites/democrats-oversight.house.gov/files/2023-08-31.JBR%20to%20Comer%20re%20Kushner%20Subpoena.pdf | Since October 12, 2022, Affinity’s counsel has
Q | https://www.thejakartapost.com/world/2024/10/25/democratic-lawmakers-request-probe-into-jared-kushner-after-saudi-report | asked the US attorney general on Thursday to appoint a special counsel to investigate whether Jared Kushner, former President Donald Trump's son-in-law, was functioning as an unregistered foreign agent for Saudi Arabia
Q | https://www.thejakartapost.com/world/2024/10/25/democratic-lawmakers-request-probe-into-jared-kushner-after-saudi-report | is a fig leaf for funneling money directly to Mr. Kushner and his wife, Ivanka Trump
Q | https://www.citizensforethics.org/legal-action/letters/white-house-must-reveal-and-resolve-jared-kushners-financial-conflicts-of-interest/ | Jared Kushner must file his legally required public financial disclosure report within 30 days of his appointment as Special Envoy for Peace
Q | https://www.democracydefendersfund.org/prs/03.03.26-pr | The complaint alleges that Kushner’s appointment likely violates the anti-nepotism statute
Q | https://www.courtlistener.com/api/rest/v4/search/?q=%22Citizens%20for%20Responsibility%20and%20Ethics%22%20Kushner&type=r&filed_after=2026-10-01 | 1:26-cv-03580
Q | https://www.wdbo.com/news/politics/watchdog-group-seeks/UGBDYFPJIA6XRLAOFLDRTFY3OE/ | Also named in the lawsuit are Witkoff, White House chief of staff Susie Wiles, Secretary of State Marco Rubio and Defense Secretary Pete Hegseth in their official capacities.
Q | https://www.washingtonexaminer.com/?p=4699925 | Raskin sent Kushner a letter Tuesday renewing a demand for documents related to Kushner’s dual roles as an informal foreign policy adviser to Trump and the head of a private equity firm that does business with foreign governments.
TIER: the requests, complaint and lawsuit are documented as acts. Every characterisation inside them ("fig leaf", "quid pro quo", "likely violates") is the requester's allegation. **No formal finding of any ethics, FARA or disclosure violation by Jared Kushner was found.**
SYMMETRY:
- Mizelle (his attorney) on the suit: "without merit"; CREW lacks standing; "Both outside ethics counsel and government ethics attorneys have reviewed Jared Kushner's volunteer government service and confirmed that his arrangements comply with applicable ethics requirements".
- White House (Kelly): CREW is an "unserious, Trump-deranged organization"; he works "on a volunteer basis … while paying his own expenses" (AP).
Q | https://www.wdbo.com/news/politics/watchdog-group-seeks/UGBDYFPJIA6XRLAOFLDRTFY3OE/ | Both outside ethics counsel and government ethics attorneys have reviewed Jared Kushner’s volunteer government service and confirmed that his arrangements comply with applicable ethics requirements
Q | https://www.wdbo.com/news/politics/watchdog-group-seeks/UGBDYFPJIA6XRLAOFLDRTFY3OE/ | which he conducts on a volunteer basis at the President’s request and while paying his own expenses.
NULL:
- the OGE forms (not requested);
- the CREW complaint PDF and docket entries (not opened; only the search hit);
- the DDF complaint text;
- the Raskin Apr and Aug 2026 letters (not found or paywalled);
- the Wyden–Raskin letter today (403);
- State OIG's response to DDF: none found;
- thehill.com: 403 (beat B's ledger).

---

## Page lines (from page-lines.txt) → verdict

1. **[vii-the-sovereign-wealth-hub] "July 2021, PIF committed $2B …"**: **wrong month as sourced.**
   - The Senate Finance letter says June 2021, and Affinity's own CLO briefing puts the investment period "from June 2021". "July" appears in no primary read; it is probably "six months later" rounded.
   - Fix: "In June 2021 (Senate Finance Committee, from Affinity's own briefing) …" or "mid-2021".
2. **Same line, "screening panel objected (inexperience, fees, 'PR risks' …) and was overruled by the board MBS chairs"**: inexperience and fees are correct at **attributed** tier (NYT 2022 via the Maloney and Raskin letters). **"PR risks" is unsupported** in every source read.
   - Fix: cut "PR risks", keep "unsatisfactory in all respects", and attribute the panel material to the NYT as relayed by the House Oversight Committee.
3. **Same line, "Affinity later took a further $1.5B from Qatar's QIA and Abu Dhabi's Lunate; House Oversight opened a probe"**: **overstated by omission.**
   - QIA and UAE money were in from the first close (the ~$1bn split, Senate Finance). The $1.5bn (Dec 2024) is Kushner's own statement via Bloomberg: attributed, with no split known.
   - "House Oversight opened a probe" was the Democratic chair's investigation (June 2022), continued in the minority. There was no committee finding.
   - Fix accordingly, with dates.
4. **[vii-the-apex-question] "When MBS personally overruled PIF's own screening panel to fund Affinity"**: **attributed, stated as documented.** The source is NYT 2022, which says the full board led by MBS overruled; the PIF records are unread.
   - Fix: "according to the New York Times' account of PIF documents (2022), the PIF board chaired by MBS overruled …".
5. **[xii-indian-creek …] "Affinity Partners $3B fund with Saudi PIF"**: **stale.** $3bn was the March 2023 ADV figure. The current ADV (22 Mar 2026) is $6,160,297,411, and Affinity's own Aug 2026 release says "over $6B".
   - Fix: "Affinity Partners (regulatory AUM $6.16bn, SEC Form ADV, Mar 2026; anchor investor Saudi PIF)".
6. **[xii-layer-2] "Affinity reached ~$4.8B AUM"**: **unsupported in any source read, and stale.** The nearest figures are $4.6bn (Dec 2024, Kushner via Bloomberg) and $5.4bn (Sept 2025, Affinity's release).
   - Fix: use the ADV figure, with its date.
7. **[xref-calibration] Trump: "Kushner connection → Saudi PIF ($3B Affinity Partners)"** and **Kushner: "Affinity Partners ($3B, Saudi PIF anchor investment)"**: **stale and ambiguous.** "$3B" was the fund's 2023 size; PIF's commitment is $2bn.
   - Fix both to: "$2bn PIF commitment (June 2021); Affinity regulatory AUM $6.16bn (Form ADV, Mar 2026)".
8. **[xii-layer-2] "PIF … was overruled by MBS, who chairs the fund"**: same as 4; attributed.
9. **[xx-operational-note-asset-relocation-hypothesis] "sovereign wealth connections (Saudi PIF, Kushner/Affinity Partners)" as resources for moving people underground**: **unsupported link.** Affinity is a registered adviser whose filings show private-equity holdings (EA, QXO, Phoenix and others). Nothing read ties it to the hypothesis. Listing it there is co-location reasoning (anti-map). Recommend striking the Affinity mention from that sentence; the author's call.
10. **[xii-the-verdict] "PIF–Kushner" as a documented coordination hub, "signed transactions"**: **correct** for the commitment itself (documented by the Senate committee and in the ADV structure). "Coordination" means a capital relationship, not an operational tie, and the floor holds.

## Killed or not established
- **"PR risks"** as a PIF panel objection: not found in any source read.
- **"~$4.8B AUM"**: not found; superseded by the ADV figure.
- **A PIF commitment in "July 2021"**: no primary says July.
- **That QIA money specifically funded 666 Fifth**: not established. QIA's 7% stake in BPY is documented; the flow into the Brookfield-sponsored fund that took the lease is not.
- **That the 666 Fifth deal or the Affinity money bought US policy (quid pro quo)**: unsupported. These are allegations by named Democrats (Maloney, Wyden, Raskin, Castro), answered by Brookfield, Affinity and Kushner, with no finding.
- **Affinity's share of EA**: not disclosed in anything read. Do not print a percentage.
- **The naming traps found:**
  - "Affinity Partners" in Axos Financial and TrueCar SEC filings means those companies' marketing affinity partners, **not** Kushner's firm;
  - "666 Fifth Avenue" in hundreds of unrelated Form Ds is an office address.
  - Jared vs Charles in the 2017–18 666 talks.
  - Jared vs Josh: Josh is not in any document of this beat.

## WITHHELD
- Office street addresses of Affinity and Kushner Companies (the letters and filings carry them): not reproduced.
- The Serbian official indicted over the Belgrade site: unnamed here. That is a living person in a foreign prosecution, outside this beat.
- Nothing from the image-only Brookfield "underlying documents" PDF (not OCR'd; imagery stop rule).
- CRD numbers of Affinity's other officers: not reproduced.
